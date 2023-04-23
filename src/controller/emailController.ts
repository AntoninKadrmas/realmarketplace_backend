import {GenericController} from "./genericController";
import express, {query, RequestHandler, Router} from "express";
import {userAuthMiddlewareStrict} from "../middleware/userAuthMiddlewareStrict";
import {EmailService} from "../service/emailService";
import {UserModel} from "../model/userModel";
import {ObjectId} from "mongodb";
import {UserService} from "../service/userService";
import {ToolService} from "../service/toolService";

export class EmailController implements GenericController{
    path: string = "/email";
    router: Router = express.Router();
    constructor(private emailService:EmailService,private userService:UserService,private toolService:ToolService) {
        this.initRouter()
    }
    initRouter(): void {
        this.router.post("/passwordRecovery",this.passwordRecovery)
    }
    passwordRecovery: RequestHandler = async (req, res) => {
        try{
            const email = req.query.email?.toString()
            if(!this.toolService.validEmail(email))res.status(400).send({error:"Invalid user email format."})
            else{
                let result:UserModel | {error:string} = await this.userService.getUserByEmail(email!)
                if(!result)res.status(400).send({error:"Nor user exists with this Email Address."})
                else{
                    const user = result as UserModel
                    const userId=new ObjectId(user._id!.toString())
                    const response:{success:string,password:string}|{error:string} = await this.emailService.sendEmailForgetPassword(user.email)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else {
                        const success = response as {success:string,password:string}
                        const response2:{success:string} | {error:string} = await this.userService.addTemporaryPasswordToUser(userId,success.password)
                        if(response2.hasOwnProperty("error"))res.status(400).send(response2)
                        else res.status(200).send({"success":success.success})
                    }
                }
            }
        }catch (e) {
            console.log(e)
            return res.status(400).send({error:"Database dose not response."})
        }
    }
}