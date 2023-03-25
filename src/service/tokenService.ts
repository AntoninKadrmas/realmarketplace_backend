import { ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { TokenExistsModel, TokenModel } from "../model/tokenModel";
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
    async createToken(userId:string):Promise<any>{
        try{
            const token:TokenModel = {
                userId: userId,
                expirationTime: this.getActualValidTime()
            }
            await this.db.collection(this.collection[0]).deleteMany({userId: userId})
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
    async updateTokenByUserId(userId:string):Promise<boolean>{
        const token = await this.db.collection(this.collection[0]).findOneAndUpdate(
            {userId:userId},
            {$inc:{expirationTime:this.getActualValidTime()}}
        )                
        return await this.tokenIsValid(token.value)
    }
    async tokenExists(tokenId:string):Promise<TokenExistsModel>{
        try{
            const token:TokenModel =  await this.db.collection(this.collection[0]).findOne({_id:new ObjectId(tokenId)}) 
            console.log(token)           
            const valid = await this.tokenIsValid(token) 
            if(valid)return {
                valid: valid,
                token:token
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
    private async tokenIsValid(token:TokenModel):Promise<boolean>{ 
        const valid = token.expirationTime>=(new Date().getTime())
        console.log(token.expirationTime,(new Date().getTime()),valid);
        try{
            if(!valid) await this.db.collection(this.collection[0]).deleteOne({_id:new ObjectId(token._id)})
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