import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import {LightUser, UserModel, UserValid} from "../model/userModel";
import { GenericController } from "./genericController";
import { TokenService } from "../service/tokenService";
import * as dotenv from 'dotenv';
import { ObjectId } from "mongodb";
import { userAuthMiddlewareStrict } from "../middleware/userAuthMiddlewareStrict";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ToolService } from "../service/toolService";
dotenv.config();
/**
 * Controller for operating over users.
 * It implements the GenericController interface.
 */
export class UserController implements GenericController{
    path:string ='/user'
    router:express.Router = express.Router()
    folder:string
    /**
     * Creates a new UserController instance and initializes its router
     * @param userService Service for crud operations over users in database.
     * @param tokenService Service for crud operations over tokens in database.
     */
    constructor(private userService:UserService,private tokenService:TokenService,private tool:ToolService){
        this.folder = process.env.FOLDER_IMAGE_PROFILE!=undefined?process.env.FOLDER_IMAGE_PROFILE:"profile"
        this.initRouter()
    }
    /**
     * Initializes the router by setting up the routes and their corresponding request handlers.
     */
    initRouter(){
        const upload_public = new ImageMiddleWare().getStorage(this.folder)
        this.router.post('/register',this.registerUser)
        this.router.post('/login',this.userLogin)
        this.router.get('/',userAuthMiddlewareStrict,this.getUserById)
        this.router.post('/',userAuthMiddlewareStrict,this.userUpdatePassword)
        this.router.put('/',userAuthMiddlewareStrict,this.userUpdate)
        this.router.delete('/',userAuthMiddlewareStrict,this.userDelete)
        this.router.post('/image',userAuthMiddlewareStrict,upload_public.single('uploaded_file'),this.userProfileImage)
        this.router.use(express.static(path.join(__dirname.split('src')[0],this.folder)))
    }
    /**
    * A request handler that create new user account.
    * @param req The express request object.
    * @param res The either token for authentication or error response.
    */
    registerUser: RequestHandler = async (req, res) => {
        let user:UserModel
        try{
            if(Object.keys(req.body).length==0){res.status(400).send({error:"Body does not contains user model."})}
            else{
                let loadCredential = req.headers.authorization
                if(loadCredential==undefined||loadCredential==null) res.status(400).send({error:"Missing credential header."})
                else{
                    const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString()
                    const email = credentials.substring(0,credentials.indexOf(':'))
                    const password = credentials.substring(credentials.indexOf(':')+1,credentials.length)
                    user = req.body
                    user.createdIn = new Date()
                    user.password=password
                    user.email=email
                    if(!this.tool.validUser(user,false))res.status(400).send({error:"Invalid user model format."})
                    else{
                        const createUserResponse:{userId:string}|{error:string} = await this.userService.createNewUser(user)
                        if(createUserResponse.hasOwnProperty("userId")){
                            const userIds:{userId:string} = createUserResponse as {userId:string}
                            const token = await this.tokenService.createToken(new ObjectId(userIds.userId))
                            if(token.hasOwnProperty("error"))res.status(400).send(token)
                            else res.status(200).send({"token":token.toString()})
                        }
                        else res.status(400).send(createUserResponse)
                    }
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Body does not contains correct user model."})
        }
    }
    /**
    * A request handler that verify credential of user.
    * @param req The express request object.
    * @param res The either token for authentication or error response.
    */
    userLogin: RequestHandler = async (req, res) => {
        try{
            let loadCredential = req.headers.authorization
            if(loadCredential==undefined){res.status(400).send({error:"Missing credential header."})}
            else{
                const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString()
                const email = credentials.substring(0,credentials.indexOf(':'))
                const password = credentials.substring(credentials.indexOf(':')+1,credentials.length)
                if(!this.tool.validEmail(email))res.status(400).send({error:"Invalid user email format."})
                else if(!this.tool.validPassword(password))res.status(400).send({error:"Invalid user password format."})
                else{
                    const userResponse:UserModel | {error:string} = await this.userService.getUserDataByEmailPassword(email,password)
                    if(userResponse.hasOwnProperty("error"))res.status(400).send(userResponse)
                    else{
                        const tempUserResponse:UserModel = userResponse as UserModel
                        const token = await this.tokenService.createToken(new ObjectId(tempUserResponse._id!))
                        if(token.hasOwnProperty("error")) res.status(400).send(token)
                        else res.status(200).send({"token":token.toString()})
                    }
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Server error."})
        }
    }
    /**
    * A request handler that return user object.
    * @param req The express request object.
    * @param res The either user object or error response.
    */
    getUserById:RequestHandler = async (req,res)=>{
        try{
            const user:UserModel = JSON.parse(req.query.user as string)
            if(user.password!=null)delete user.password
            if(user._id!=null)delete user._id
            if(user.resetPassword!=null)delete user.resetPassword
            res.status(200).send(user)
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Some problem on the server."})
        }
    }
    /**
    * A request handler that update user profile image.
    * @param req The express request object.
    * @param res The either success response with image url of newly created profile image or error response.
    */
    userProfileImage:RequestHandler = async (req,res)=>{
        try{
            const folder = process.env.FOLDER_IMAGE_PROFILE!!
            const user:UserModel = JSON.parse(req.query.user as string)
            const userId=new ObjectId(user._id!.toString())
            if(user.mainImageUrl!=null&&user.mainImageUrl!="") this.tool.deleteFiles([user.mainImageUrl],this.folder)
            if(req.file==undefined||req.file==null)res.status(400).send({error:"No image was send to upload."})
            else{
                const file = req.file!
                const dirUrl = path.join(__dirname.split('src')[0],folder,file.filename)
                if(!fs.existsSync(dirUrl)) res.status(400).send({error:"Error when saving image."})
                else{
                    const imageUrl = `/${file.filename}`
                    const response:{success:string} | {error:string}  = await this.userService.updateUserImage(userId,imageUrl)
                    if(response.hasOwnProperty("error")){
                        this.tool.deleteFiles([imageUrl],this.folder)
                        res.status(400).send(response)
                    }
                    else {
                        const success = response as {success:string}
                        res.status(200).send({success:success.success,imageUrls:[imageUrl]})
                    }
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Server error."})
        }
    }
    /**
    * A request handler that update user password.
    * @param req The express request object.
    * @param res The either success or error response.
    */
    userUpdatePassword: RequestHandler = async (req, res) => {
        try{
            const user:UserModel = JSON.parse(req.query.user as string)
            let loadCredential = req.headers.authorization
            if(loadCredential==null){res.status(400).send({error:"Missing credential header."})}
            else{
                const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString()
                const passwordOld = credentials.substring(0,credentials.indexOf(':'))
                const passwordNew = credentials.substring(credentials.indexOf(':')+1,credentials.length)
                if(!this.tool.validPassword(passwordOld))res.status(400).send({error:"Invalid old password format."})
                else if(!this.tool.validPassword(passwordNew))res.status(400).send({error:"Invalid new password format."})
                else{
                    const response:{success:string} | {error:string}= await this.userService.updateUserPassword(user,passwordOld,passwordNew)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Server error."})
        }
    }
    /**
    * A request handler that update user profile information's.
    * @param req The express request object.
    * @param res The either success or error response.
    */
    userUpdate: RequestHandler = async (req, res) => {
        try{
            const user:UserModel = JSON.parse(req.query.user as string)
            const userId=new ObjectId(user._id!.toString())
            if(Object.keys(req.body).length==0) res.status(400).send({error:"Body does not contains user model."})
            else{
                const userLight:LightUser = req.body
                if(!this.tool.validUser(userLight,true))res.status(400).send({error:"Invalid user model format."})
                else{
                    const response:{success:string} | {error:string}= await this.userService.updateUser(userId,userLight)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Server error."})
        }
    }
    /**
    * A request handler that delete user.
    * @param req The express request object.
    * @param res The either success or error response.
    */
    userDelete: RequestHandler = async (req, res) => {
        try{
            const user:UserModel = JSON.parse(req.query.user as string)
            const userId=new ObjectId(user._id!.toString())
            let loadCredential = req.headers.authorization
            if(loadCredential==null||loadCredential==undefined){res.status(400).send({error:"Missing credential header."})}
            else{
                const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString()
                const password = credentials.substring(0,credentials.indexOf(':'))
                if(!this.tool.validPassword(password))res.status(400).send({error:"Invalid user password."})
                else{
                    const response:{success:string} | {error:string}= await this.userService.deleteUser(user,password)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else {
                        this.tool.deleteFiles([user.mainImageUrl],this.folder)
                        const deleteUrls = await this.userService.deleteUserAdverts(userId)
                        if(!response.hasOwnProperty("error"))this.tool.deleteFiles(deleteUrls as string[],this.folder)
                        await this.tokenService.deleteToken(userId)
                        res.status(200).send(response)
                    }
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Server error."})
        }
    }
}
