import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import { UserModel, UserValid } from "../model/userModel";
import { GenericController } from "./genericController";
import * as dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
require('dotenv').config();

export class UserController implements GenericController{
    path:string ='/user'
    router:express.Router = express.Router()
    constructor(private userService:UserService){
        this.initRouter()
    }
    initRouter(){
        this.router.post('/create',this.insertUser)
        this.router.get('/full/:id',this.getFullUserById)
        this.router.get('/light/:id',this.getLightUserById)
    }
    insertUser: RequestHandler = async (req, res) => {
        let user:UserModel
        try{
            if(req.body==null){res.status(400).send({error:"Body does not contains user model."})}
            user = req.body
            user.createdIn = new Date()
            user.password = await this.hashPassword(user.password)
            this.userService.createNewUser(user).then((response:{_id:string}|{error:string})=>{
                if(response.hasOwnProperty("_id"))res.status(200).send(response)
                else res.status(400).send(response)
            })
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
            this.userService.getUserDataById
        }
        catch(e){
            res.status(400).send({error:"Body does not contains correct user login model."})
        }
    }
    getFullUserById:RequestHandler = async (req,res)=>{
        const collection= process.env.USER_COLLECTION
        if(!req.params.id)res.status(400).send()//null as parameter
        const response = await this.userService.getUserDataById(req.params.id,collection)
        if(!!response)res.status(200).send(response)//not null result
        res.status(400).send()
    }
    getLightUserById:RequestHandler = async (req,res)=>{
        const collection = process.env.LIGHT_USER_COLLECTION
        if(!req.params.id)res.status(400).send()//null as parameter
        const response = await this.userService.getUserDataById(req.params.id,collection)
        if(!!response)res.status(200).send(response)//not null result
        res.status(400).send()
    }
    private async hashPassword(password:string):Promise<string>{
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds)
        return await bcrypt.hash(password, salt)
    }
    private async comparePassword(passowrd:string,hash:string):Promise<boolean>{
        return await bcrypt.compare(passowrd, hash)
    }
}
