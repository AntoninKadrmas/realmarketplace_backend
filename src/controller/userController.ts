import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import { UserModel, UserValid } from "../model/userModel";
import { GenericController } from "./genericController";
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
        let user:UserModel= new UserModel()
        try{
            if(req.body==null){res.status(400).send({error:"Body does not contains user model"})}
            user = req.body
        }
        catch(e){
            res.status(400).send({error:"Body does not contains user model"})
        }
        user.createdIn = new Date()
        // const user:UserModel ={
        //     first_name: "",
        //     last_name: "",
        //     email: "",
        //     phone: "",
        //     createdIn: new Date(),
        //     idCard: "",
        //     password: "",
        //     validated: new UserValid
        // } 
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
