import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import { UserModel, UserModelLogin, UserValid } from "../model/userModel";
import { GenericController } from "./genericController";
import { TokenService } from "../service/tokenService";
import * as dotenv from 'dotenv';
import { ObjectId } from "mongodb";
import { userAuthMiddlewareStrict } from "../middleware/userAuthMiddlewareStrict";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import path from 'path';
import fs from 'fs';
dotenv.config();

export class UserController implements GenericController{
    path:string ='/user'
    router:express.Router = express.Router()
    constructor(private userService:UserService,private tokenService:TokenService){
        this.initRouter()
    }
    initRouter(){
        const upload_public = new ImageMiddleWare().getStorage(process.env.IMAGE_PROFILE!!)
        this.router.post('/register',this.registerUser)
        this.router.post('/login',this.userLogin)
        this.router.get('/',userAuthMiddlewareStrict,this.getFullUserById)
        this.router.post('/image',userAuthMiddlewareStrict,upload_public.single('uploaded_file'),this.userProfileImage)
        this.router.use(express.static(path.join(__dirname.split('src')[0],process.env.IMAGE_PROFILE!!)))
    }
    registerUser: RequestHandler = async (req, res) => {
        let user:UserModel
        try{
            if(req.body==null){res.status(400).send({error:"Body does not contains user model."})}
            else{
                user = req.body
                user.createdIn = new Date()
                const createUserResponse:{userId:string}|{error:string} = await this.userService.createNewUser(user)
                if(createUserResponse.hasOwnProperty("userId")){
                    const userIds:{userId:string} = createUserResponse as {userId:string}
                    const token = await this.tokenService.createToken(new ObjectId(userIds.userId))
                    if(token.hasOwnProperty("error"))res.status(400).send(token)
                    else res.status(200).send({"token":token.toString()})
                }
                else res.status(400).send(createUserResponse)
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Body does not contains correct user model."})
        }
    }
    userLogin: RequestHandler = async (req, res) => {
        try{
            let loadCredential = req.headers.authorization
            if(loadCredential==null){res.status(400).send("Incorrect request.")}
            else{
                const credentials = new Buffer(loadCredential.split(" ")[1], 'base64').toString()
                const name = credentials.substring(0,credentials.indexOf(':'))
                const password = credentials.substring(credentials.indexOf(':')+1,credentials.length)
                const userResponse:UserModel | {error:string} = await this.userService.getUserDataByEmail(name,password)
                if(userResponse.hasOwnProperty("error"))res.status(400).send(userResponse)
                else{
                    const tempUserResponse:UserModel = userResponse as UserModel
                    const token = await this.tokenService.createToken(new ObjectId(tempUserResponse._id!))
                    console.log(`token: ${token}`)
                    if(token.hasOwnProperty("error")) res.status(400).send(token)
                    else res.status(200).send({"token":token.toString()})
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Body does not contains correct user login model."})
        }
    }
    getFullUserById:RequestHandler = async (req,res)=>{
        try{
            const userId = new ObjectId(req.query.token?.toString())
            const response:UserModel | {error:string} = await this.userService.getUserDataById(userId)
            if(response.hasOwnProperty("error"))res.status(400).send(response)
            else res.status(200).send(response)
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Some problem on the server."})
        }
    }
    userProfileImage:RequestHandler = async (req,res)=>{
        try{
            const folder = process.env.IMAGE_PROFILE!!
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
                const oldDirUrl=__dirname.split('src')[0]+folder+req.body.oldUrl
                if(req.body.oldUrl!=null&&req.body.oldUrl!=""&&fs.existsSync(oldDirUrl)) fs.unlinkSync(oldDirUrl)
                const userId = new ObjectId(req.query.token?.toString())
                const file = req.file!
                const dirUrl = __dirname.split('src')[0]+`${folder}/`+file.filename
                if(!fs.existsSync(dirUrl)) res.status(400).send()
                else{
                    const dirUrl = __dirname.split('src')[0]+`${folder}/`+file.filename
                    if(!fs.existsSync(dirUrl)) res.status(400).send("Error when saving image.")
                    else{
                        const imageUrl = `/${file.filename}`
                        const response:{success:string} | {error:string}  = await this.userService.updateUserImage(userId,imageUrl)
                        if(response.hasOwnProperty("error")){
                            fs.unlinkSync(__dirname.split('src')[0]+folder+imageUrl)
                            res.status(400).send(response)
                        }
                        else {
                            const success = response as {success:string}
                            res.status(200).send({success:success.success,imageUrls:[imageUrl]})
                        }
                    }
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
}
