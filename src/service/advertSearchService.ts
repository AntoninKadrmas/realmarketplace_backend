import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import { DBConnection } from "../db/dbConnection";
import { AdvertModel, AdvertWithUserModel, FavoriteAdvertUser, SearchAdvertModel } from "../model/advertModel";
import { ObjectId } from "mongodb";

/**
 * A service class that provides functionalities related to fetching advert from a MongoDB database.
 * Extends GenericService class.
 */
export class AdvertSearchService extends GenericService{
    advertIndex:string
    pageSize:number=0
    sampleSize:number=0
    /**
     * Creates an instance of the AdvertSearchService class.
     * Initializes the AdvertSearchService by calling the GenericService constructor
     * and setting the advert index.
     */
    constructor(){
        super()
        this.advertIndex=process.env.MONGO_SEARCH_INDEX_ADVERT_NAME!== undefined 
        ? process.env.MONGO_SEARCH_INDEX_ADVERT_NAME.toString() : ''
        this.connect().then()
    }
    /**
     * Connects to the database.
     * Loads environment variables from the dotenv module.
     * Initializes the database client and adds the advert, favorite and user collections.
     * Creates an index on the userId field of the favorite collection.
     */
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()                
        this.collection.push(process.env.MONGO_ADVERT_COLLECTION)    
        this.collection.push(process.env.MONGO_FAVORITE_COLLECTION)    
        this.collection.push(process.env.MONGO_USER_COLLECTION)    
        this.db = this.client.db(process.env.DBName)
        this.pageSize = process.env.NUMBER_IN_SEARCH!=undefined?parseInt(process.env.NUMBER_IN_SEARCH):10
        this.sampleSize = process.env.NUMBER_IN_SAMPLE!=undefined?parseInt(process.env.NUMBER_IN_SAMPLE):4
        await this.db.collection(this.collection[2]).createIndex({email:1},{ unique: true })
    }
    /**
     * Search for adverts based on a search term, page number, and user existence status.
     * @param search The search term to use.
     * @param page The page number to use.
     * @param userExists Indicates whether to include user information in the results.
     * @returns A Promise that resolves with a list of adverts and their user information (if requested), or an error object.
     */
    async getAdvertSearch(search:String,page:number,userExists:boolean):Promise<SearchAdvertModel|{error:string}>{
        try{
            const optionsFirst = [
                {$search:{
                    index:this.advertIndex,
                    compound:{
                        must:[{
                            text:{
                                query:search,
                                path:['title','author'],
                                fuzzy:{},
                            }
                        },{
                            equals:{
                                value:true,
                                path:'visible'
                            }
                        }]
                    }
                }},
            ]
            let userOptions=[]
            if(userExists)userOptions=[
                {$lookup:{
                from: "users",
                localField:"userId",
                foreignField:"_id",
                as:"user",
            }},
            {$addFields: {
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
            },]
            else userOptions=[
                {$project:{
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
                score:{ $meta:'searchScore' },
            }}, ]
            const optionsSecond = [
                { $sort : { score:1 ,createdIn:-1} },
                { $facet: {
                    counts:  [{ $count: "count" }],
                    advert:[{$skip:this.pageSize*page},{$limit:this.pageSize}]
                }},{$addFields: {
                    "count": "$counts.count"
                }},{$project:{
                    count:1,
                    advert:1
                }},]
            const result = await this.db.collection(this.collection[0]).aggregate([...optionsFirst,...userOptions,...optionsSecond])
            .toArray();
            return result[0]
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
     * Get all favorite adverts for a given user ID.
     * @param userId The ID of the user to get favorite adverts for.
     * @returns A Promise containing a list of favorite adverts with user or an error message.
     */
    async getFavoriteAdvertByUserId(userId:ObjectId):Promise<FavoriteAdvertUser[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[1]).aggregate([
                {$match: {userId:userId}},
                {$unwind : "$advertId"},
                {$lookup:{
                    from: "adverts",
                    localField:"advertId",
                    foreignField:"_id",
                    as:"adverts"}
                },{$project: {
                    adverts:{
                        $filter:{
                        "input": "$adverts",
                            "as": "adverts",
                            "cond": {
                                "$eq": [ "$$adverts.visible", true ]
                            }
                        }
                    }}
                }, {$lookup:{
                    from: "users",
                    localField:"adverts.userId",
                    foreignField:"_id",
                    as:"user"}
                },{ $addFields: {
                    "adverts.user": { $arrayElemAt: [ "$user", 0 ] }
                  }
                },{ $addFields: {
                    "advert": { $arrayElemAt: [ "$adverts", 0 ] }
                  }
                },{ $project: {
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
    /**
     * Get all adverts for a given user ID.
     * @param userId The ID of the user to get adverts for.
     * @returns A Promise containing an array of adverts or an error message.
     */
    async getAdvertByUserId(userId:ObjectId):Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).find({"userId":userId}).sort({"createdIn":1}).toArray();
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
     * Get adverts for a user based on their email and a time stamp.
     * @param email The email of the user to get adverts for.
     * @param createdIn The time stamp of user creation.
     * @returns A Promise containing an array of adverts or an error message.
     */
    async getAdvertByUserEmailTime(email:string,createdIn:string):Promise<AdvertModel[]|{error:string}>{
        try{
            const result = await this.db.collection(this.collection[2]).aggregate([
                {$match: {
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
                  {$project:{
                    adverts:{ 
                        $sortArray : {
                            input:"$adverts",
                            sortBy:{createdIn:-1}
                    }}
                  }}
                ]).toArray();
            return result[0].adverts
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
     * Retrieves a sample of visible adverts from the database, along with the user information if requested.
     * @param userExists Indicates whether to include user information in the results.
     * @returns A Promise that resolves with an array of adverts and their user information (if requested), or an error object.
     */
    async getAdvertSample(userExists:boolean):Promise<AdvertWithUserModel[]|{error:string}>{
        try{
            const options = [
                { $match: { visible: true } },
                { $sample: { size: this.sampleSize } },
            ]
            let userOptions = []
            if(userExists)userOptions=[
                {$lookup:{
                    from: "users",
                    localField:"userId",
                    foreignField:"_id",
                    as:"user",
                }},
                {$addFields: {
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
                },]
            else userOptions=[
                {$project:{
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
            }},]
            const result = await this.db.collection(this.collection[0]).aggregate([...options,...userOptions]).toArray();
            return result
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
}