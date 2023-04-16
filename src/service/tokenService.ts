import { ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { TokenExistsModel, TokenModel } from "../model/tokenModel";
import * as dotenv from 'dotenv';
import { GenericService } from "./genericService";
import { UserModel } from "../model/userModel";
/**
 * A service class that provides functionalities related to tokens in a MongoDB database.
 * Extends GenericService class.
 */
export class TokenService extends GenericService{
    /**
    * Creates an instance of TokenService.
    * Calls the parent constructor and connects to the database.
    */
    constructor(){
        super()
        this.connect().then()
    }
    /**
     * Connects to the database.
     * Loads environment variables from the dotenv module.
     * Initializes the database client and adds the token collections.
     * Creates an index on the userId field of the token collection.
     */
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()                
        this.collection.push(process.env.MONGO_TOKEN_COLLECTION)        
        this.db = this.client.db(process.env.MONGO_DB_NAME)
        await this.db.collection(this.collection[0]).createIndex({userId:1},{ unique: true })
    }
    static instance:TokenService
    /**
    * A static method that returns a singleton instance of TokenService class.
    * @returns A Promise that resolves to the singleton instance of TokenService class.
    * @static
    */
    static async getInstance():Promise<TokenService>{
        if(!TokenService.instance){
            TokenService.instance = new TokenService()
            await TokenService.instance.connect()
        }
        return TokenService.instance;
    }
    /**
    * Creates a new token in the database for the specified user.
    * Deletes any existing tokens for the same user before creating a new one.
    * @param userId The ObjectId of the user for whom the token is being created.
    * @returns A Promise that resolves to the ObjectId of the created token or an error message.
    */
    async createToken(userId:ObjectId):Promise<{error:string}|string>{
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
    /**
    * Updates the expiration time of the token with the specified token ID.
    * @param tokenId The ObjectId of the token to be updated.
    * @returns A Promise that resolves to true if the token is valid, false otherwise.
    */
    async updateTokenByTokenId(tokenId:string):Promise<boolean>{
        try{
            const token = await this.db.collection(this.collection[0]).findOneAndUpdate(
                {_id:new ObjectId(tokenId)},
                {$inc:{expirationTime:this.getActualValidTime()}}
            )
            return await this.tokenIsValid(token.value)
        }catch(e){
            console.log(e)
            return false
        }
    }
    /**
     * Find token and its owner.
     * @param tokenId The ID of the token to find.
     * @returns A promise that resolves object with validation time and user.
     */
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
    /**
     * Deletes all tokens associated with a user.
     * @param userId The ID of the user whose tokens are to be deleted.
     * @returns A Promise that resolves to either a success or error message.
     */
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
    /**
     * Checks if a token is still valid.
     * @param token The token to check.
     * @returns A promise that resolves to true if the token is valid, false otherwise.
     * @private
     */
    private async tokenIsValid(token:TokenModel):Promise<boolean>{ 
        const valid = token.expirationTime>=(new Date().getTime())
        try{
            if(!valid) await this.db.collection(this.collection[0]).deleteOne({_id:token._id})
        }
        catch(e){            
            console.log(e)
            return false
        }
        return valid
    }
    /**
     * Gets the expiration time of tokens, in milliseconds, from the environment variables or uses a default value.
     * @returns The expiration time of tokens, in milliseconds.
     * @private
     */
    private getActualValidTime():number{
        const expirationTime:number = !!process.env.TOKEN_EXPIRATION_TIME?parseInt(process.env.TOKEN_EXPIRATION_TIME):1800000
        console.log(Date.now()/1000)
        console.log(expirationTime)
        return Date.now()/1000+expirationTime
    }
}