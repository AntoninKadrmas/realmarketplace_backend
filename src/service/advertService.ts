import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import { DBConnection } from "../db/dbConnection";
import { AdvertModel } from "../model/advertModel";

export class AdvertService extends GenericService{
    constructor(){
        super()
        this.connect().then()
    }
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()                
        this.collection.push(process.env.ADVERT_COLLECTION)    
        this.collection.push(process.env.FAVORITE_COLLECTION)    
        this.db = this.client.db(process.env.DB_NAME)
    }
    async createAdvert(advert:AdvertModel):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).insertOne(advert)
            
            if(!result.acknowledged)return {error:"Cant create advert."}
            else return {success:"Advert created successfully."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getAdvert():Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).find({}).toArray();
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async saveAdvertId(userId:string,advertId:string):Promise<any>{
        try{
            const result = await this.db.collection(this.collection[1]).updateOne({'userId':userId}, { $addToSet: { 'advertId': advertId }}, { upsert: true })
            console.log(result)
            if(result.acknowledged)return {success:"Advert successfully added to favorite collection"}
            else return {error:"There is some problem with favorite advert."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
}