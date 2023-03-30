import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import { DBConnection } from "../db/dbConnection";
import { AdvertModel } from "../model/advertModel";
import { ObjectId } from "mongodb";

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
    async createAdvert(advert:AdvertModel):Promise<{success:string,_id:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).insertOne(advert)
            if(!result.acknowledged)return {error:"Cant create advert."}
            else return {success:"Advert created successfully.",_id:result.insertedId}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getAdvertWithOutUser():Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).find({}).toArray();
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getAdvertWithUser(advertId:string,userId:string):Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).find({_id:new ObjectId(advertId),userId:userId}).aggregate([
                {
                    $addFields: {
                        convertedId: { $toObjectId: "$userId" }
                    }
                },
                { "$lookup": {
                    from: "users",
                    localField: "convertedId",
                    foreignField: "_id",
                    as: "user",
                  }}
                ])
            console.log(result)
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async saveAdvertId(userId:string,advertId:string):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[1]).updateOne({'userId':userId}, { $addToSet: { 'advertId': advertId }}, { upsert: true })
            if(result.acknowledged)return {success:"Advert successfully added to favorite collection"}
            else return {error:"There is some problem with favorite advert."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async deleteAdvertId(userId:string,advertId:string):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[1]).updateOne({'userId':userId}, { $pull: { 'advertId': advertId }}, { upsert: true })
            if(result.acknowledged)return {success:"Advert successfully removed from favorite collection"}
            else return {error:"There is some problem with favorite advert."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getAdvertByUserId(userId:string):Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).find({"userId":userId}).toArray();
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async deleteAdvert(advertId:string,userId:string):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).deleteOne({"_id":new ObjectId(advertId),"userId":userId})
            if(result.acknowledged&&result.deletedCount==1)return {success:"Advert successfully deleted."}
            else if(result.acknowledged&&result.deletedCount==0)return {error:"Can't delete foreign advert."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        } 
    }
    async updateAdvert(advertId:string,userId:string,advert:AdvertModel):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).updateOne({"_id":new ObjectId(advertId),"userId":userId},{
                $set:advert
            })
            if(result.acknowledged&&result.modifiedCount==1)return {success:"Advert successfully updated."}
            else if(result.acknowledged&&result.modifiedCount==0)return {error:"Can't update foreign advert."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        } 
    }
}