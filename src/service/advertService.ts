import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import { DBConnection } from "../db/dbConnection";
import { AdvertModel, AdvertModelWithUser, FavoriteAdvertUser } from "../model/advertModel";
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
        this.collection.push(process.env.USER_COLLECTION)    
        this.db = this.client.db(process.env.DBName)
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
            const result = await this.db.collection(this.collection[0]).find({visible:true}).toArray();
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getAdvertWithUser():Promise<AdvertModelWithUser[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).aggregate([
                {$match:{visible:true}},
                {$lookup:{
                from: "users",
                localField:"userId",
                foreignField:"_id",
                as:"user"}},
               { $addFields: {
                    "user": { $arrayElemAt: [ "$user", 0 ] }
                }},
                { $project: {
                    title: 1,
                    author: 1,
                    description: 1,
                    genreName: 1,
                    genreType: 1,
                    price: 1,
                    priceOption: 1,
                    condition: 1,
                    createdIn: 1,
                    imagesUrls: 1,
                    mainImageUrl: 1,
                    user: {
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        phone: 1,
                        createdIn: 1,
                        validated: 1,
                        mainImageUrl:1
                    }
                  }
                }
                ]).toArray();
                console.log(result)
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getFavoriteAdvertByUserId(userId:ObjectId):Promise<FavoriteAdvertUser[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[1]).aggregate([
                {$match: {userId:userId}},
                {$unwind : "$advertId"},
                {$lookup:{
                    from: "adverts",
                    localField:"advertId",
                    foreignField:"_id",
                    as:"adverts"}},
                {$project: {
                    adverts:{
                        $filter:{
                        "input": "$adverts",
                            "as": "adverts",
                            "cond": {
                                "$eq": [ "$$adverts.visible", true ]
                            }
                        }
                    }
                    }
                },
                {$lookup:{
                    from: "users",
                    localField:"adverts.userId",
                    foreignField:"_id",
                    as:"user"}},    
                { $addFields: {
                    "adverts.user": { $arrayElemAt: [ "$user", 0 ] }
                  }
                },
                { $addFields: {
                    "advert": { $arrayElemAt: [ "$adverts", 0 ] }
                  }
                },
                  { $project: {
                    _id:0,
                    advert: {
                      _id:1,
                      title: 1,
                      author: 1,
                      description: 1,
                      genreName: 1,
                      genreType: 1,
                      price: 1,
                      priceOption: 1,
                      condition: 1,
                      createdIn: 1,
                      imagesUrls: 1,
                      mainImageUrl: 1,
                      user: {
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        phone: 1,
                        createdIn: 1,
                        validated: 1,
                        mainImageUrl:1
                      }
                    }
                  }
                }
                ]).toArray();
            return result
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
            const result = await this.db.collection(this.collection[1]).updateOne({'userId':userId})
            if(result.acknowledged&&result.deletedCount==1)return {success:"Favorite object successfully deleted."}
            else if(result.acknowledged&&result.deletedCount==0)return {error:"Can't delete foreign advert."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getAdvertByUserId(userId:ObjectId):Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).find({"userId":userId}).toArray();
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async getAdvertByUserEmailTime(email:string,createdIn:string):Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[2]).aggregate([
                {
                $match: {
                  "email":email,
                  "createdIn":new Date(createdIn)
                }},
                 {$lookup:{
                  from: "adverts",
                  localField:"_id",
                  foreignField:"userId",
                  as:"adverts"}},
                  {$project: {
                    adverts:{
                      $filter:{
                        "input": "$adverts",
                            "as": "adverts",
                            "cond": {
                                "$eq": [ "$$adverts.visible", true ]
                            }
                      },
                    }
                  }},
                  {$project: {
                    _id:0,
                    adverts:{
                      userId:0
                    }
                  }},
                ]).toArray();
            return result[0].adverts
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