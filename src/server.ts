import express from 'express';
import {UserController} from "./controller/userController";
import { UserService } from './service/userService';
import { EnumController } from './controller/enumController';

export class Server{
    private app:express.Express
    constructor(){
        this.app = express();
        this.app.use(require('body-parser').json())
    }
    private setControllers(){
        const userController = new UserController(new UserService())
        const enumControl = new EnumController()
        this.app.use(userController.path,userController.router);
        this.app.use(enumControl.path,enumControl.router)
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