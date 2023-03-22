import express, { RequestHandler} from "express";
import { UserService } from "../service/userService";
import { UserModel, UserModelLogin, UserValid } from "../model/userModel";
import { GenericController } from "./genericController";
import { TokenService } from "../service/tokenService";
import * as dotenv from 'dotenv';
dotenv.config();

export class UserController implements GenericController{
    path:string ='/user'
    router:express.Router = express.Router()
    constructor(private userService:UserService,private tokenService:TokenService){
        this.initRouter()
    }
    initRouter(){
        this.router.post('/register',this.insertUser)
        this.router.post('/login',this.userLogin)
        this.router.get('/full/:id',this.getFullUserById)
    }
    insertUser: RequestHandler = async (req, res) => {
        let user:UserModel
        try{
            if(req.body==null){res.status(400).send({error:"Body does not contains user model."})}
            else{
                user = req.body
                user.createdIn = new Date()
                const createUserResponse:{userId:string}|{error:string} = await this.userService.createNewUser(user)
                if(createUserResponse.hasOwnProperty("userId")){
                    const userIds:{userId:string} = createUserResponse as {userId:string}
                    const token = await this.tokenService.createToken(userIds.userId)
                    if(!token.hasOwnProperty("error"))return res.status(200).send({"token":token})
                    else res.status(400).send(token)
                }
                else res.status(400).send(createUserResponse)
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:"Body does not contains correct user model."})
        }
    }
    userLogin: RequestHandler = async (req, res) => {
        try{
            let password = req.headers.authorization
            if(password==null){res.status(400).send("Incorrect request.")}
            else{
                console.log(new Buffer(password.split(" ")[1], 'base64').toString())
                const userResponse:UserModel | {error:string} = await this.userService.getUserDataByEmail("","")
                if(userResponse.hasOwnProperty("error"))res.status(400).send(userResponse)
                else{
                    const tempUserResponse:UserModel = userResponse as UserModel
                    const token = await this.tokenService.createToken(tempUserResponse._id!)
                    if(!token.hasOwnProperty("error"))return res.status(200).send({"token":token})
                    else res.status(400).send(token)
                }
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send({error:"Body does not contains correct user login model."})
        }
    }
    getFullUserById:RequestHandler = async (req,res)=>{
        if(!req.params.id)res.status(400).send()//null as parameter
        else{
            const response = await this.userService.getUserDataById(req.params.id)
            if(!response.hasOwnProperty("error"))res.status(200).send(response)//not null result
            else res.status(400).send()
        }
    }
}
