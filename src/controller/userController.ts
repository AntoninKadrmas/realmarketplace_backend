import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import { UserModel, UserValid } from "../model/userModel";
import { GenericController } from "./genericController";
import * as dotenv from 'dotenv';
import { TokenService } from "../service/tokenService";
dotenv.config();
require('dotenv').config();

export class UserController implements GenericController{
    path:string ='/user'
    router:express.Router = express.Router()
    constructor(private userService:UserService,private tokenService:TokenService){
        this.initRouter()
    }
    initRouter(){
        this.router.post('/register',this.insertUser)
        this.router.get('/login',this.userLogin)
        this.router.get('/full/:id',this.getFullUserById)
        this.router.get('/light/:id',this.getLightUserById)
    }
    insertUser: RequestHandler = async (req, res) => {
        let user:UserModel
        try{
            if(req.body==null){res.status(400).send({error:"Body does not contains user model."})}
            user = req.body
            user.createdIn = new Date()
            const createUserResponse:{userId:string,lightUserId:string}|{error:string} = await this.userService.createNewUser(user)
            if(createUserResponse.hasOwnProperty("userId")&&createUserResponse.hasOwnProperty("lightUserId")){
                const userIds:{userId:string,lightUserId:string} = createUserResponse as {userId:string,lightUserId:string}
                const token = await this.tokenService.createToken(userIds.userId,userIds.lightUserId)
                if(!token.hasOwnProperty("error"))return res.status(200).send({"token":token})
                else res.status(400).send(token)
            }
            else res.status(400).send(createUserResponse)
        }
        catch(e){
            res.status(400).send({error:"Body does not contains correct user model."})
        }
    }
    userLogin: RequestHandler = async (req, res) => {
        let user:{cardId:string,password:string}
        try{
            if(req.body==null){res.status(400).send({error:"Body does not contains user login model."})}
            user = req.body
            const userResponse:UserModel | {error:string} = await this.userService.getUserDataByCardId(user.cardId,user.password)
            if(userResponse.hasOwnProperty("error"))res.status(400).send(userResponse)
            else{
                const tempUserResponse:UserModel = userResponse as UserModel
                const token = await this.tokenService.createToken(tempUserResponse._id!,tempUserResponse.lightUserId!)
                if(!token.hasOwnProperty("error"))return res.status(200).send({"token":token})
                res.status(400).send(token)
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:"Body does not contains correct user login model."})
        }
    }
    getFullUserById:RequestHandler = async (req,res)=>{
        const collection= process.env.USER_COLLECTION
        if(!req.params.id)res.status(400).send()//null as parameter
        const response = await this.userService.getUserDataById(req.params.id,collection)
        if(!response.hasOwnProperty("error"))res.status(200).send(response)//not null result
        res.status(400).send()
    }
    getLightUserById:RequestHandler = async (req,res)=>{
        const collection = process.env.LIGHT_USER_COLLECTION
        if(!req.params.id)res.status(400).send()//null as parameter
        const response = await this.userService.getUserDataById(req.params.id,collection)
        if(!response.hasOwnProperty("error"))res.status(200).send(response)//not null result
        res.status(400).send()
    }
}
