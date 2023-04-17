import { userAuthMiddlewareStrict } from "../middleware/userAuthMiddlewareStrict";
import { userAuthMiddlewareLenient } from "../middleware/userAuthMiddlewareLenient";
import { AdvertModel, AdvertWithUserModel, OldImagesUrls, SearchAdvertModel } from "../model/advertModel";
import { ImageMiddleWare } from "../middleware/imageMiddleware";
import { GenericController } from "./genericController";
import { AdvertService } from "../service/advertService";
import express, { RequestHandler} from "express";
import { ObjectId } from "mongodb";
import * as dotenv from 'dotenv';
import { Router } from "express";
import path from 'path';
import fs from 'fs';
import { UserModel } from "../model/userModel";
import { AdvertSearchService } from "../service/advertSearchService";
import { ToolService } from "../service/toolService";
dotenv.config();
/**
 * Controller for operating over adverts.
 * It implements the GenericController interface.
 */
export class AdvertController implements GenericController{
    path: string="/advert";
    router: Router=express.Router();
    folder:string
    /**
     * Creates a new AdvertController instance and initializes its router
     * @param advertService Service that do crud operation over adverts in database.
     * @param advertSearchService Service for fetching information's about adverts from database.
     */
    constructor(private advertService:AdvertService,private advertSearchService:AdvertSearchService,private tools:ToolService){
        this.initRouter()
        this.folder = process.env.IMAGE_PUBLIC!!
    }
    /**
     * Initializes the router by setting up the routes and their corresponding request handlers.
     */
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
    /**
    * A request handler that create new advert in database.
    * @param req The express request object.
    * @param res The either success response with created advert or error response.
    */
    createAdvert: RequestHandler = async (req, res) => {
        try{
            const folder = process.env.IMAGE_PUBLIC!!
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
                const advert:AdvertModel = req.body as AdvertModel
                const user:UserModel = JSON.parse(req.query.user as string)
                advert.userId=new ObjectId(user._id!.toString())
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
                            advert.imagesUrls.push(imageUrl)
                            counter++
                        }
                    }
                }
                const response:{success:string,_id:string}|{error:string} = await this.advertService.createAdvert(advert)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else {
                    const responseObject = (response as {success:string,_id:string})
                    advert._id=responseObject._id
                    delete advert.userId
                    res.status(200).send({success:responseObject.success,advert:advert})
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
     /**
    * A request handler that update old advert in database.
    * @param req The express request object.
    * @param res The either success response with newly created img urls or error response.
    */
    updateAdvert: RequestHandler = async (req, res) => {
        try{
            const folder = process.env.IMAGE_PUBLIC!!
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
                const deleteUrl=req.body.deletedUrls.split(";").filter((x:string)=>x!="")
                const advertId = new ObjectId(req.body._id.toString())
                const user:UserModel = JSON.parse(req.query.user as string)
                const userId=new ObjectId(user._id!.toString())
                this.tools.deleteFiles(deleteUrl,this.folder)
                const tempOldUrls = req.body.imagesUrls.split(";;")
                const oldUrls:OldImagesUrls[] = [] 
                for(let oldUrl of tempOldUrls){
                    const urlPosition = oldUrl.split(";")
                    oldUrls.push({
                        url:urlPosition[0],
                        position:urlPosition[1]
                    })
                }
                delete req.body.deletedUrls
                delete req.body._id
                const advert:AdvertModel = req.body as AdvertModel
                advert.mainImageUrl=""
                advert.imagesUrls=[]
                let counter = 0;
                if(req.files!=null){
                    //@ts-ignore
                    for(let file of req.files){
                        const dirUrl = __dirname.split('src')[0]+`${folder}/`+file.filename
                        if(!fs.existsSync(dirUrl)){}
                        else{
                            const imageUrl = `/${file.filename}`
                            advert.imagesUrls.push(imageUrl)
                            counter++
                        }
                    }
                }
                for(let oldUrl of oldUrls){
                    console.log(`${oldUrl.position} --> ${oldUrl.url}`)
                    advert.imagesUrls.splice(oldUrl.position,0,oldUrl.url)
                }
                if(advert.imagesUrls!.length>0)advert.mainImageUrl = advert.imagesUrls![0]
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
    /**
    * A request handler that delete advert in database.
    * @param req The express request object.
    * @param res The either success or error response.
    */
    deleteAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null)res.status(400).send({error:"Missing query params."})
            else{
                const user:UserModel = JSON.parse(req.query.user as string)
                const userId=new ObjectId(user._id!.toString())
                const imagesUrls:string[] = req.get("deleteUrls")!.split(";")
                const advertId = new ObjectId(req.query.advertId.toString())
                if(advertId==null||imagesUrls==null)res.status(400).send({error:"Missing advert id or delete urls."})
                else{
                    this.tools.deleteFiles(imagesUrls,this.folder)
                    const response = await this.advertService.deleteAdvert(advertId,userId)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
            }
        }
        catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    /**
    * A request handler that returns searched or sample adverts from database.
    * @param req The express request object.
    * @param res The either list of adverts with or without user.
    */
    getAdvert: RequestHandler = async (req, res) => {
        try{
            if(this.tools.validString(req.query.search as string)&&this.tools.validString(req.query.page as string)){
                const search = req.query.search as string
                const page = parseInt(req.query.page as string)
                if(req.query.user==undefined){
                    const response:SearchAdvertModel|{error:string} = await this.advertSearchService.getAdvertSearch(search,page,false)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
                else{                
                    const response:SearchAdvertModel|{error:string} = await this.advertSearchService.getAdvertSearch(search,page,true)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
            }else{
                if(req.query.user==undefined){
                    const response:AdvertWithUserModel[]|{error:string} = await this.advertSearchService.getAdvertSample(false)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
                else{                
                    const response:AdvertWithUserModel[]|{error:string} = await this.advertSearchService.getAdvertSample(true)
                    if(response.hasOwnProperty("error"))res.status(400).send(response)
                    else res.status(200).send(response)
                }
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    /**
    * A request handler that return favorite adverts from database.
    * @param req The express request object.
    * @param res The either favorite adverts list or error response.
    */
    getFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            const user:UserModel = JSON.parse(req.query.user as string)
            const userId=new ObjectId(user._id!.toString())
            const response = await this.advertSearchService.getFavoriteAdvertByUserId(userId)
            if(response.hasOwnProperty("error"))res.status(400).send(response)
            else res.status(200).send(response)
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    /**
    * A request handler that add new advert into favorite adverts list.
    * @param req The express request object.
    * @param res The either success or error response.
    */
    addFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null)res.status(400).send({error:"Missing query params."})
            else{
                const advertId = new ObjectId(req.query.advertId.toString())
                const user:UserModel = JSON.parse(req.query.user as string)
                const userId=new ObjectId(user._id!.toString())
                const response = await this.advertService.saveFavoriteAdvertId(userId,advertId)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    /**
    * A request handler that delete advert from favorite adverts list.
    * @param req The express request object.
    * @param res The either success or error response.
    */
    deleteFavoriteAdvert: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null)res.status(400).send({error:"Missing query params."})
            else{
                const advertId = new ObjectId(req.query.advertId.toString())
                const user:UserModel = JSON.parse(req.query.user as string)
                const userId=new ObjectId(user._id!.toString())
                const response = await this.advertService.deleteFavoriteAdvertId(userId,advertId)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Missing advert id."})
        }
    }
    /**
    * A request handler that returns user adverts from database.
    * @param req The express request object.
    * @param res The either list of adverts or error response.
    */
    getUserAdverts: RequestHandler = async (req, res) => {
        try{
            if(this.tools.validString(req.get("userEmail")!)&&
                this.tools.validString(req.get("createdIn")!)){
                const userEmail = req.get("userEmail")!
                const createdIn = req.get("createdIn")!
                const adverts = await this.advertSearchService.getAdvertByUserEmailTime(userEmail,createdIn)
                if(adverts.hasOwnProperty("error"))res.status(400).send(adverts)
                else res.status(200).send(adverts)
            }else{
                const user:UserModel = JSON.parse(req.query.user as string)
                const userId=new ObjectId(user._id!.toString())
                const adverts = await this.advertSearchService.getAdvertByUserId(userId)
                if(adverts.hasOwnProperty("error"))res.status(400).send(adverts)
                else res.status(200).send(adverts)
            }
        }catch(e){
            console.log(e)
            res.status(400).send()
        }
    }
    /**
    * A request handler that update visibility of advert.
    * @param req The express request object.
    * @param res The either success or error response.
    */
    updateAdvertVisibility: RequestHandler = async (req, res) => {
        try{
            if(req.query.advertId==null||req.query.state==null)res.status(400).send({error:"Missing query params."})
            else{
                const advertId = new ObjectId(req.query.advertId.toString())
                const user:UserModel = JSON.parse(req.query.user as string)
                const userId=new ObjectId(user._id!.toString())
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