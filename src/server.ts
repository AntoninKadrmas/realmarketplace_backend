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
import { StringIndexAdvert } from './service/stringIndexAdvert';
import { AdvertSearchService } from './service/advertSearchService';
import mongoSanitize = require('express-mongo-sanitize');
import { ToolService } from './service/toolService';

dotenv.config();
/**
 * Server class take care of server initialization.
 */
export class Server{
    app:express.Express
    /**
     * Set all important modules used in express module and rewrite console lop function so now it work as logger.
     */
    constructor(){
        this.app = express();
        this.app.use(require('body-parser').json())
        this.app.use(cors())
        this.app.use(
            mongoSanitize({
                allowDots: true,
                onSanitize: ({ req, key }) => {
                    console.log(`This request[${key}] is sanitized => ${req}`);
                },
            }),
          );
        var log_file:any
        console.log = function(d) {
            const actualDate = new Date()
            const date =  `${actualDate.getFullYear()}_${actualDate.getMonth()}_${actualDate.getDate()}`
            const folder = `${__dirname.split('src')[0]}${process.env.FOLDER_LOGS!=undefined?process.env.FOLDER_LOGS:"debug"}`
            const path = `${folder}/${date}.log`
            if(fs.existsSync(path)){
                if(!log_file) log_file = fs.createWriteStream(path, {flags : 'a'});
                log_file.write(`[${new Date()}] ${util.format(d) + '\n'}`);
            }
            else {

                if(!fs.existsSync(folder))fs.mkdirSync(`${folder}`)
                log_file = fs.createWriteStream(path, {flags : 'a'});
                log_file.write(`[${new Date()}] ${util.format(d) + '\n'}`);
            }
        };
        this.setIndex().then()
    }
    /**
     * Create search index if it is not already exists.
     * @private
     */
    private async setIndex(){
        const stringIndex = new StringIndexAdvert()
        await stringIndex.setSearchIndex()
    }
    /**
     * Set main controllers router and path to app.
     * @private
     */
    private setControllers(){
        const userController = new UserController(new UserService(),new TokenService(),new ToolService())
        const enumControl = new EnumController()
        const advertController = new AdvertController(new AdvertService(),new AdvertSearchService(),new ToolService())
        this.app.use(userController.path,userController.router);
        this.app.use(enumControl.path,enumControl.router)
        this.app.use(advertController.path,advertController.router)
    }
    /**
     * Start node js backend application on port 3000.
     */
    async start(){
        this.setControllers()
        return this.app.listen(process.env.PORT)
    }
}