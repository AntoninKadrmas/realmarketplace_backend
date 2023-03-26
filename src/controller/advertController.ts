import { Router } from "express";
import { GenericController } from "./genericController";
import express, { RequestHandler} from "express";
import { AdvertService } from "../service/advertService";
import { AdvertModel } from "../model/advertModel";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { userAuthMiddlewareStrict } from "../middleware/userAuthMiddlewareStrict";
dotenv.config();

export class AdvertController implements GenericController{
    path: string="/advert";
    router: Router=express.Router();
    constructor(private advertService:AdvertService){
        this.initRouter()
    }
    initRouter(): void {
        const upload_public = new ImageMiddleWare().getStorage()

        this.router.post("/create",userAuthMiddlewareStrict,upload_public.array('uploaded_file',5),this.createAdvert)
        this.router.get("/all",this.getAdvert)
        this.router.get("/my",userAuthMiddlewareStrict,this.getUserAdverts)
        this.router.post("/favorite/add",userAuthMiddlewareStrict,this.favoriteAdvert)

        this.router.use(express.static(path.join(__dirname.split('src')[0],process.env.IMAGE_PUBLIC!!)))
    }
    createAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
                const advert:AdvertModel = req.body as AdvertModel
                advert.userId=req.get("Authorization")
                advert.createdIn = new Date()
                advert.imagesUrls = []
                let counter = 0;
                if(req.files!=null){
                    //@ts-ignore
                    for(let file of req.files){
                        const dirUrl = __dirname.split('src')[0]+"public/"+file.filename
                        if(!fs.existsSync(dirUrl)){}
                        else{
                            const imageUrl = `/${file.filename}`
                            if(counter==0) advert.mainImage = imageUrl
                            advert.imagesUrls?.push(imageUrl)
                            counter++
                        }
                    }
                }
                const response = await this.advertService.createAdvert(advert)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    getAdvert: RequestHandler = async (req, res) => {
        try{
            const adverts = await this.advertService.getAdvert()
            res.status(200).send(adverts)
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    favoriteAdvert: RequestHandler = async (req, res) => {
        try{
            const advertId = req.query.advertId
            const userId=req.get("Authorization")
            const response = await this.advertService.saveAdvertId(userId as string,advertId as string)
            res.status(200).send(response)
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    getUserAdverts: RequestHandler = async (req, res) => {
        try{
            const adverts = await this.advertService.getAdvert()
            res.status(200).send(adverts)
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
}