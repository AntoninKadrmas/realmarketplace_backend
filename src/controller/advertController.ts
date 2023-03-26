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

        this.router.post("",userAuthMiddlewareStrict,upload_public.array('uploaded_file',5),this.createAdvert)
        this.router.put("",userAuthMiddlewareStrict,upload_public.array('uploaded_file',5),this.updateAdvert)//not implemented
        this.router.delete("",userAuthMiddlewareStrict,this.deleteAdvert)//not implemented
        this.router.get("",userAuthMiddlewareStrict,this.getUserAdverts)
        this.router.get("/all",this.getAdvert)
        this.router.get("/favorite",userAuthMiddlewareStrict,this.getFavoriteAdvert)//not implemented
        this.router.post("/favorite",userAuthMiddlewareStrict,this.addFavoriteAdvert)

        this.router.use(express.static(path.join(__dirname.split('src')[0],process.env.IMAGE_PUBLIC!!)))
    }
    createAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
            
                const advert:AdvertModel = req.body as AdvertModel
                advert.userId=req.query.token?.toString()
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
                const response:{success:string,_id:string}|{error:string} = await this.advertService.createAdvert(advert)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else {
                    const responseObject = (response as {success:string,_id:string})
                    advert._id=responseObject._id
                    res.status(200).send({success:responseObject.success,advert:advert})
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    updateAdvert: RequestHandler = async (req, res) => {
        try{
            console.log(req.body)
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    deleteAdvert: RequestHandler = async (req, res) => {
        try{
            const userId = req.query.token?.toString()
            const advertId = req.query.advertId?.toString()
            if(advertId==null)res.status(400).send({error:"Missing advert id."})
            else{
                const result = await this.advertService.deleteAdvert(advertId,userId!)
                res.status(200).send(result)
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
    getFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            //not implemented
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    addFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            const advertId = req.query.advertId?.toString()
            const userId = req.query.token?.toString()
            const response = await this.advertService.saveAdvertId(userId!,advertId!)
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