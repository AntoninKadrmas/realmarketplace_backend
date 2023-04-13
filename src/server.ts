import express from 'express';
import cors from "cors";
import fs from 'fs';
import util from 'util';
import {UserController} from "./controller/userController";
import { UserService } from './service/userService';
import { EnumController } from './controller/enumController';
import * as dotenv from 'dotenv';
import { TokenService } from './service/tokenService';
import { AdvertService } from './service/advertService';
import { AdvertController } from './controller/advertController';
export class Server{
    private app:express.Express
    constructor(){
        dotenv.config();
        this.app = express();
        this.app.use(require('body-parser').json())
        this.app.use(cors())
        var log_file:any
        console.log = function(d) {
            const actualDate = new Date()
            const date =  `${actualDate.getFullYear()}_${actualDate.getMonth()}_${actualDate.getDate()}`
            const path = `${__dirname}/debug/${date}.log`
            if(fs.existsSync(path)){
                if(!log_file) log_file = fs.createWriteStream(path, {flags : 'a'});
                log_file.write(`[${new Date()}] ${util.format(d) + '\n'}`);
            }
            else {
                if(!fs.existsSync(`${__dirname}/debug`))fs.mkdirSync(`${__dirname}/debug`)
                log_file = fs.createWriteStream(path, {flags : 'a'});
                log_file.write(`[${new Date()}] ${util.format(d) + '\n'}`);
            }
        };
    }
    private setControllers(){
        const userController = new UserController(new UserService(),new TokenService())
        const enumControl = new EnumController()
        const advertController = new AdvertController(new AdvertService())
        this.app.use(userController.path,userController.router);
        this.app.use(enumControl.path,enumControl.router)
        this.app.use(advertController.path,advertController.router)
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