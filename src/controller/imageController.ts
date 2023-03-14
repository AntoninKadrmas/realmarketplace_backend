import express, { RequestHandler} from "express";
import { GenericController } from "./genericController";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import * as dotenv from 'dotenv';
const path = require('path')
import fs from 'fs';
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import multer from "multer";
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
        this.router.post('/public',upload_public.array('uploaded_file',10),this.uploadImagePublic)
        this.router.post('/private',upload_private.array('uploaded_file',10),this.uploadImagePrivate)
        this.router.use(express.static(path.join(__dirname.split('src')[0],process.env.IMAGE_PUBLIC)))

    }
    uploadImagePublic: RequestHandler = async (req, res) => {
        let error =false
        if(req.files==undefined)res.status(401).send()
        else{
            try{
                //@ts-ignore 
                for(let file of req.files){
                    const dirUrl = __dirname.split('src')[0]+"public/"+file.filename
                    if(!fs.existsSync(dirUrl)){
                        error=true
                    }
                    else{
                        const imageUrl = `${this.path}/${file.filename}`
                    }
                }

            }
            catch{
                res.status(401).send()
            }
        }
        if(error)res.status(401).send()
        res.status(200).send()
    }
    uploadImagePrivate: RequestHandler = async (req, res) => {
        const imageUrl = `${this.path}/${req.file?.filename}`
        console.log(imageUrl);
    }
}
