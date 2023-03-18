import express from 'express';
import cors from "cors";
import {UserController} from "./controller/userController";
import { UserService } from './service/userService';
import { EnumController } from './controller/enumController';
import * as dotenv from 'dotenv';
import { TokenService } from './service/tokenService';
import { AdvertService } from './service/advertService';
import { AdvertController } from './controller/advertController';
// import { ImageController } from './controller/imageController';
dotenv.config();

export class Server{
    private app:express.Express
    constructor(){
        this.app = express();
        this.app.use(require('body-parser').json())
        this.app.use(cors())
    }
    private setControllers(){
        const userController = new UserController(new UserService(),new TokenService())
        const enumControl = new EnumController()
        const advertController = new AdvertController(new AdvertService())
        // const imageController = new ImageController()
        this.app.use(userController.path,userController.router);
        this.app.use(enumControl.path,enumControl.router)
        this.app.use(advertController.path,advertController.router)
        // this.app.use(imageController.path,imageController.router)
    }
    async start(){
        this.setControllers()
        this.app.listen(process.env.PORT,() => {    
            console.log('The application is listening '
                + 'on port http://localhost:'+process.env.PORT);
        })
    }
}
new Server().start()