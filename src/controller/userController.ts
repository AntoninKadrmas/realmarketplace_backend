import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import { UserModel } from "../model/userModel";

export class UserController{
    public path ='/users'
    public router = express.Router()
    constructor(private userService:UserService){
        this.initRouter()
    }
    initRouter(){
        this.router.get('/create',this.insertUser)
    }
    insertUser: RequestHandler = async (req, res) => {
        const user:UserModel ={
            id: "",
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            age: new Date(),
            createdIn: new Date(),
            validated: false
        } 
        this.userService.createNewUser(user).then(response=>{
            if(response.acknowledged)res.status(200).send(response)
            else res.status(400).send({})
        })
    }
}
