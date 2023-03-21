import { Router } from "express";
import { GenericController } from "./genericController";
import express, { RequestHandler} from "express";
import { AdvertService } from "../service/advertService";
import { AdvertModel } from "../model/advertModel";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import fs from 'fs';


export class AdvertController implements GenericController{
    path: string="/advert";
    router: Router=express.Router();
    constructor(private advertService:AdvertService){
        this.initRouter()
    }
    initRouter(): void {
        const upload_public = new ImageMiddleWare().getStorage(true)
        this.router.post("/create",upload_public.array('uploaded_file',5),this.createAdvert)
    }
    createAdvert: RequestHandler = async (req, res) => {
        let advertModel:AdvertModel;
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
                        console.log(imageUrl)
                    }
                }
                if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
                else{
                    advertModel = req.body
                    const response = await this.advertService.createAdvert(advertModel)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
            }
            catch(e){
                console.log(e)
                res.status(400).send()
            }
        }
    }
}