import { userAuthMiddlewareStrict } from "../middleware/userAuthMiddlewareStrict";
import { userAuthMiddlewareLenient } from "../middleware/userAuthMiddlewareLenient";
import { AdvertModel, AdvertModelWithUser } from "../model/advertModel";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import { GenericController } from "./genericController";
import { AdvertService } from "../service/advertService";
import express, { RequestHandler} from "express";
import { ObjectId } from "mongodb";
import * as dotenv from 'dotenv';
import { Router } from "express";
import path from 'path';
import fs from 'fs';
dotenv.config();

export class AdvertController implements GenericController{
    path: string="/advert";
    router: Router=express.Router();
    constructor(private advertService:AdvertService){
        this.initRouter()
    }
    initRouter(): void {
        const upload_public = new ImageMiddleWare().getStorage(process.env.IMAGE_PUBLIC!!)
        this.router.post("",userAuthMiddlewareStrict,upload_public.array('uploaded_file',5),this.createAdvert)
        this.router.put("",userAuthMiddlewareStrict,upload_public.array('uploaded_file',5),this.updateAdvert)
        this.router.delete("",userAuthMiddlewareStrict,this.deleteAdvert)
        this.router.get("",userAuthMiddlewareStrict,this.getUserAdverts)
        this.router.get("/all",userAuthMiddlewareLenient,this.getAdvert)
        this.router.get("/favorite",userAuthMiddlewareStrict,this.getFavoriteAdvert)
        this.router.post("/favorite",userAuthMiddlewareStrict,this.addFavoriteAdvert)
        this.router.delete("/favorite",userAuthMiddlewareStrict,this.deleteFavoriteAdvert)
        this.router.put("/visible",userAuthMiddlewareStrict,this.updateAdvertVisibility)

        this.router.use(express.static(path.join(__dirname.split('src')[0],process.env.IMAGE_PUBLIC!!)))
    }
    createAdvert: RequestHandler = async (req, res) => {
        try{
            const folder = process.env.IMAGE_PUBLIC!!
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
                const advert:AdvertModel = req.body as AdvertModel
                advert.userId=new ObjectId(req.query.token?.toString())
                advert.createdIn = new Date()
                advert.imagesUrls = []
                advert.visible=true
                let counter = 0;
                if(req.files!=null){
                    //@ts-ignore
                    for(let file of req.files){
                        const dirUrl = __dirname.split('src')[0]+`${folder}/`+file.filename
                        if(!fs.existsSync(dirUrl)){}
                        else{
                            const imageUrl = `/${file.filename}`
                            if(counter==0) advert.mainImageUrl = imageUrl
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
            const folder = process.env.IMAGE_PUBLIC!!
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
                const deleteUrl=req.body.deletedUrls.split(";").filter((x:string)=>x!="")
                const advertId = new ObjectId(req.body._id.toString())
                const userId=new ObjectId(req.query.token?.toString())
                this.deleteFiles(deleteUrl)
                delete req.body.deletedUrls
                delete req.body._id
                const advert:AdvertModel = req.body as AdvertModel
                if(req.body.imagesUrls!="")advert.imagesUrls=req.body.imagesUrls.split(";").filter((x:string)=>x!="")
                else advert.imagesUrls=[]
                let counter = 0;
                if(req.files!=null){
                    //@ts-ignore
                    for(let file of req.files){
                        const dirUrl = __dirname.split('src')[0]+`${folder}/`+file.filename
                        if(!fs.existsSync(dirUrl)){}
                        else{
                            const imageUrl = `/${file.filename}`
                            if(counter==0 && advert.mainImageUrl=="") advert.mainImageUrl = imageUrl
                            advert.imagesUrls?.push(imageUrl)
                            counter++
                        }
                    }
                }
                const response:{success:string}|{error:string} = await this.advertService.updateAdvert(advertId,userId,advert)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send({"success":(response as {success:string}).success,"imageUrls":advert.imagesUrls})
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    private deleteFiles(imagesUrls:string[]){
        const folder = process.env.IMAGE_PUBLIC!!
        for(var image of imagesUrls){
            const oldDirUrl=__dirname.split('src')[0]+folder+image
            if(fs.existsSync(oldDirUrl)) fs.unlinkSync(oldDirUrl)
        }
    }
    deleteAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null)res.status(400).send({error:"Missing query params."})
            else{
                const userId = new ObjectId(req.query.token?.toString())
                const advertId = new ObjectId(req.query.advertId?.toString())
                if(advertId==null)res.status(400).send({error:"Missing advert id."})
                else{
                    const result = await this.advertService.deleteAdvert(advertId,userId)
                    res.status(200).send(result)
                }
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    getAdvert: RequestHandler = async (req, res) => {
        try{
            const userId = req.query.token?.toString()
            console.log(userId)
            if(userId==""||userId==null){
                const response:AdvertModel[]|{error:string} = await this.advertService.getAdvertWithOutUser()
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
            else{
                console.log("there --------------------")
                const response:AdvertModelWithUser[]|{error:string} = await this.advertService.getAdvertWithUser()
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    getFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            const userId = new ObjectId(req.query.token?.toString())
            const response = await this.advertService.getFavoriteAdvertByUserId(userId)
            if(response.hasOwnProperty("error"))res.status(400).send(response)
            else res.status(200).send(response)
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    addFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null)res.status(400).send({error:"Missing query params."})
            else{
                const advertId = new ObjectId(req.query.advertId?.toString())
                const userId = new ObjectId(req.query.token?.toString())
                const response = await this.advertService.saveFavoriteAdvertId(userId,advertId)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    deleteFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null)res.status(400).send({error:"Missing query params."})
            else{
                const advertId = new ObjectId(req.query.advertId?.toString())
                const userId = new ObjectId(req.query.token?.toString())
                const response = await this.advertService.deleteFavoriteAdvertId(userId,advertId)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    getUserAdverts: RequestHandler = async (req, res) => {
        try{
            if(req.get("userEmail")!=null&&req.get("createdIn")!=null){
                const userEmail = req.get("userEmail")!
                const createdIn = req.get("createdIn")!
                const adverts = await this.advertService.getAdvertByUserEmailTime(userEmail,createdIn)
                if(adverts.hasOwnProperty("error"))res.status(400).send(adverts)
                else res.status(200).send(adverts)
            }else{
                const userId = new ObjectId(req.query.token!.toString())
                const adverts = await this.advertService.getAdvertByUserId(userId)
                if(adverts.hasOwnProperty("error"))res.status(400).send(adverts)
                else res.status(200).send(adverts)
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    updateAdvertVisibility: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null||req.query.state==null)res.status(400).send({error:"Missing query params."})
            else{
                const advertId = new ObjectId(req.query.advertId?.toString())
                const userId = new ObjectId(req.query.token?.toString())
                const state = req.query.state.toString().toLowerCase() === 'true'
                const response = await this.advertService.updateAdvertVisibility(advertId,userId,state)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
}