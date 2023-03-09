import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import { UserModel } from "../model/userModel";
import { GenericController } from "./genericController";
require('dotenv').config();

export class UserController implements GenericController{
    path:string ='/users'
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
        const user:UserModel ={
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            createdIn: new Date(),
            age: new Date(),
            validated: false,
            idCard: "",
            password: ""
        } 
        this.userService.createNewUser(user).then(response=>{            
            if(!!response)res.status(200).send(response)
            res.status(400).send()
        })
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
}
