import { ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { TokenExistsModel, TokenModel } from "../model/tokenModel";
import * as dotenv from 'dotenv';
import { GenericService } from "./genericService";
import { UserModel } from "../model/userModel";

export class TokenService extends GenericService{
    constructor(){
        super()
        this.connect().then()
    }
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()                
        this.collection.push(process.env.MONGO_TOKEN_COLLECTION)        
        this.db = this.client.db(process.env.MONGO_DB_NAME)
        await this.db.collection(this.collection[0]).createIndex({userId:1},{ unique: true })
    }
    static instance:TokenService
    public static async getInstance(){
        if(!TokenService.instance){
            TokenService.instance = new TokenService()
            await TokenService.instance.connect()
        }
        return TokenService.instance;
    }
    async createToken(userId:ObjectId):Promise<any>{
        try{
            const token:TokenModel = {
                userId: userId,
                expirationTime: this.getActualValidTime()
            }
            await await this.db.collection(this.collection[0]).deleteMany({userId:userId})
            const newTokenOrFind = await this.db.collection(this.collection[0]).insertOne(token)
            if(!newTokenOrFind.acknowledged)return "Can't create auth token."
            else return newTokenOrFind.insertedId
        }
        catch(e){
            console.log(e)
            return {error:"Database dose not response. Can't create auth token."}
        }
    }
    async updateTokenByTokenId(tokenId:string):Promise<boolean>{
        //mozna jenom find pokud se to bude volat pouze z middleware
        const token = await this.db.collection(this.collection[0]).findOneAndUpdate(
            {_id:new ObjectId(tokenId)},
            {$inc:{expirationTime:this.getActualValidTime()}}
        )
        return await this.tokenIsValid(token.value)
    }
    async updateTokenByUserId(userId:ObjectId):Promise<boolean>{
        const token = await this.db.collection(this.collection[0]).findOneAndUpdate(
            {userId:userId},
            {$inc:{expirationTime:this.getActualValidTime()}}
        )                
        return await this.tokenIsValid(token.value)
    }
    async tokenExists(tokenId:ObjectId):Promise<TokenExistsModel>{
        try{
            const token:{user:UserModel,expirationTime:number}[] =  await this.db.collection(this.collection[0]).aggregate([
                {$match:{_id:tokenId}},
                {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'users'
                }},
                 {$addFields: {
                    "user": { $arrayElemAt: [ "$users", 0 ] }
                }},
                {
                  $project:{
                    _id:0,
                    user:1,
                    expirationTime:1
                  }
                }
              ]).toArray()
            const valid = await this.tokenIsValid({
                _id:tokenId,
                userId:token[0].user._id!,
                expirationTime:token[0].expirationTime
                }) 
            if(valid)return {
                valid: valid,
                user:token[0].user
            }
            else return {
                valid: valid,
            }
        }
        catch(e){
            console.log(e)
            return {
                valid: false,
            }
        }
    }
    async deleteToken(userId:ObjectId):Promise<{success:string}|{error:string}>{
        try{
            const result =  await this.db.collection(this.collection[0]).deleteMany({userId:userId}) 
            if(result.acknowledged&&result.deletedCount==1)return {success:"Advert successfully deleted."}
            else if(result.acknowledged&&result.deletedCount==0)return {error:"Can't delete foreign advert."}
            else return {error:"There is some problem with database."}
        }
        catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    private async tokenIsValid(token:TokenModel):Promise<boolean>{ 
        console.log(token)
        const valid = token.expirationTime>=(new Date().getTime())
        console.log(valid)
        try{
            if(!valid) await this.db.collection(this.collection[0]).deleteOne({_id:token._id})
        }
        catch(e){            
            console.log(e)
            return false
        }
        return valid
    }
    private getActualValidTime():number{
        const expirationTime:number = !!process.env.TOKEN_EXPIRATION_TIME?parseInt(process.env.TOKEN_EXPIRATION_TIME):1800000
        return new Date().getTime()+expirationTime
    }
}