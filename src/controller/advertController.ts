import { Router } from "express";
import { GenericController } from "./genericController";
import express, { RequestHandler} from "express";
import { AdvertService } from "../service/advertService";
import { AdvertModel } from "../model/advertModel";

export class AdvertController implements GenericController{
    path: string="/advert";
    router: Router=express.Router();
    constructor(private advertService:AdvertService){
        this.initRouter()
    }
    initRouter(): void {
        this.router.post("/create",this.createAdvert)
    }
    createAdvert: RequestHandler = async (req, res) => {
        let advertModel:AdvertModel;
        try{
            if(req.body==null)res.status(400).send({error:"Body does not contains advert information's"})
            else{
                advertModel = req.body
                const response = await this.advertService.createAdvert(advertModel)
                if(response.hasOwnProperty("error"))res.status(400).send(response)
                else res.status(200).send(response)
            }
        }catch(e){
            console.log(e)
            res.status(400).send({error:"Body does not contains correct advert information's."})
        }

    }
    
}