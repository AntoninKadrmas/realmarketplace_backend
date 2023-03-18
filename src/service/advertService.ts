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
        this.db = this.client.db(process.env.DB_NAME)
    }
    async createAdvert(advert:AdvertModel):Promise<{_id:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).insertOne(advert)
            if(!result.acknowledged)return {error:"Cant create advert."}
            else return {_id:result.insertedId}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
}