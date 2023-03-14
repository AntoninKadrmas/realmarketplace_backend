import { ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { TokenModel } from "../model/tokenModel";
import * as dotenv from 'dotenv';
import { GenericService } from "./genericService";

export class TokenService extends GenericService{
    constructor(){
        super()
        this.connect().then()
    }
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()                
        this.collection.push(process.env.TOKEN_COLLECTION)        
        this.db = this.client.db(process.env.DB_NAME)
    }
    static instance:TokenService
    public static async getInstance(){
        if(!TokenService.instance){
            TokenService.instance = new TokenService()
            await TokenService.instance.connect()
        }
        return TokenService.instance;
    }
    async createToken(userId:string,lightUserId:string):Promise<any>{
        try{
            const token:TokenModel = {
                userId: userId,
                lightUserId:lightUserId,
                expirationTime: this.getActualValidTime()
            }
            const newTokenOrFind = await this.db.collection(this.collection[0]).findOneAndUpdate(
                { "userId":userId , "lightUserId":lightUserId},
                {$setOnInsert: token},
                {returnOriginal: false,upsert: true,})
            console.log("created new",newTokenOrFind);
            if(newTokenOrFind.value!=null){
                if(await this.tokenIsValid(newTokenOrFind.value))return {token:newTokenOrFind.value._id,expirationTime:token.expirationTime}
                else return this.createToken(userId,lightUserId)
            }
            else return {token:newTokenOrFind.lastErrorObject.upserted,expirationTime:token.expirationTime}
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
    async updateTokenByUserId(userId:string):Promise<boolean>{
        const token = await this.db.collection(this.collection[0]).findOneAndUpdate(
            {userId:userId},
            {$inc:{expirationTime:this.getActualValidTime()}}
        )                
        return await this.tokenIsValid(token.value)
    }
    async tokenExists(tokenId:string):Promise<boolean>{
        try{
            const token:TokenModel =  await this.db.collection(this.collection[0]).findOne({_id:new ObjectId(tokenId)})            
            return await this.tokenIsValid(token)
        }
        catch(e){
            return false
        }
    }
    private async tokenIsValid(token:TokenModel):Promise<boolean>{ 
        const valid = token.expirationTime>=(new Date().getTime()+1800000)
        try{
            if(!valid) await this.db.collection(this.collection[0]).deleteOne({_id:new ObjectId(token._id)})
        }
        catch(e){}
        console.log(token.expirationTime,(new Date().getTime()),valid);
        
        return valid
    }
    private getActualValidTime():number{
        const expirationTime:number = !!process.env.TOKEN_EXPIRATION_TIME?parseInt(process.env.TOKEN_EXPIRATION_TIME):1800000
        return new Date().getTime()+expirationTime
    }
}