import express, { RequestHandler} from "express";
import { GenericController } from "./genericController";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import * as dotenv from 'dotenv';
const path = require('path')
import fs from 'fs';
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
dotenv.config();

export class ImageController implements GenericController{
    path:string ='/image'
    router:express.Router = express.Router()
    constructor(){
        this.initRouter()
    }
    initRouter(){
        const upload_public = new ImageMiddleWare().getStorage(true)
        const upload_private = new ImageMiddleWare().getStorage(false)
        this.router.post('/public',[userAuthMiddleware,upload_public.single('uploaded_file')],this.uploadImagePublic)
        this.router.post('/private',upload_private.single('uploaded_file'),this.uploadImagePrivate)
        this.router.use(express.static(path.join(__dirname.split('src')[0],process.env.IMAGE_PUBLIC)))

    }
    uploadImagePublic: RequestHandler = async (req, res) => {
        const imageUrl = `${this.path}/${req.file?.filename}`
        const dirUrl = __dirname.split('src')[0]+"public/"+req.file?.filename
        if(!fs.existsSync(dirUrl)){
            res.status(401).send()
        }else{
            res.status(200).send()
        }
    }
    uploadImagePrivate: RequestHandler = async (req, res) => {
        const imageUrl = `${this.path}/${req.file?.filename}`
        console.log(imageUrl);
    }
}
