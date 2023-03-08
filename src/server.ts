// Importing module
import express from 'express';
import {UserController} from "./controller/userController";
import { UserService } from './service/userService';

export class Server{
    app:any
    constructor(){
        this.app = express();
        this.app.use(require('body-parser').json())
    }
    setControllers(){
        const userController = new UserController(new UserService())
        this.app.use(userController.path,userController.router);
    }
    async start(){
        require('dotenv').config();
        this.setControllers()
        this.app.listen(process.env.PORT,() => {    
            console.log('The application is listening '
                + 'on port http://localhost:'+process.env.PORT);
        })
    }
}
new Server().start()