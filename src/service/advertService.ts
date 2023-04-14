import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import { DBConnection } from "../db/dbConnection";
import { AdvertModel } from "../model/advertModel";
import { ObjectId } from "mongodb";

export class AdvertService extends GenericService{
    advertIndex:string
    pagesize=2
    constructor(){
        super()
        this.advertIndex=process.env.MONGO_SEARCH_INDEX_ADVERT_NAME!== undefined 
        ? process.env.MONGO_SEARCH_INDEX_ADVERT_NAME.toString() : ''
        this.connect().then()
    }
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()                
        this.collection.push(process.env.MONGO_ADVERT_COLLECTION)    
        this.collection.push(process.env.MONGO_FAVORITE_COLLECTION)    
        this.db = this.client.db(process.env.DBName)
        await this.db.collection(this.collection[1]).createIndex({userId:1},{ unique: true })
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
    async saveFavoriteAdvertId(userId:ObjectId,advertId:ObjectId):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[1]).updateOne({'userId':userId}, { $addToSet: { 'advertId': advertId }}, { upsert: true })
            if(result.acknowledged)return {success:"Advert successfully added to favorite collection"}
            else return {error:"There is some problem with favorite advert."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async deleteFavoriteAdvertId(userId:ObjectId,advertId:ObjectId):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[1]).updateOne({'userId':userId}, { $pull: { 'advertId': advertId }})
            if(result.acknowledged)return {success:"Advert successfully removed from favorite collection"}
            else return {error:"There is some problem with favorite advert."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async deleteFavoriteAdvertWhole(userId:ObjectId):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[1]).deleteMany({'userId':userId})
            if(result.acknowledged&&result.deletedCount==1)return {success:"Favorite object successfully deleted."}
            else if(result.acknowledged&&result.deletedCount==0)return {error:"Can't delete foreign advert."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async deleteAdvert(advertId:ObjectId,userId:ObjectId):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).deleteOne({"_id":advertId,"userId":userId})
            await this.db.collection(this.collection[1]).updateMany({},{$pull:{advertId:advertId}})
            if(result.acknowledged&&result.deletedCount==1)return {success:"Advert successfully deleted."}
            else if(result.acknowledged&&result.deletedCount==0)return {error:"Can't delete foreign advert."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        } 
    }
    async updateAdvert(advertId:ObjectId,userId:ObjectId,advert:AdvertModel):Promise<{success:string}|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).updateOne({"_id":advertId,"userId":userId},{
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
    async updateAdvertVisibility(advertId:ObjectId,userId:ObjectId,state:boolean){
        try{
            const result = await this.db.collection(this.collection[0]).updateOne({"_id":advertId,"userId":userId},{
                $set:{
                    visible:state
                }
            })
            console.log(result)
            if(result.acknowledged&&result.modifiedCount==1)return {success:"Advert visibility successfully updated."}
            else if(result.acknowledged&&result.modifiedCount==0)return {error:"Can't update foreign advert."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        } 
    }
}