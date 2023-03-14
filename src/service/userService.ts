import { Db, MongoClient, ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { LightUserModel, UserModel } from "../model/userModel";
import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';

export class UserService extends GenericService{
    constructor(){
        super()
        this.connect().then()
    }
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()        
        this.db = this.client.db(process.env.DB_NAME)
        this.collection.push(process.env.USER_COLLECTION)
        this.collection.push(process.env.LIGHT_USER_COLLECTION)
    }
    async createNewUser(user:UserModel):Promise<{_id:string}|{error:string}>{
        let new_user;
        try{
            new_user = await this.db.collection(process.env.USER_COLLECTION).update(
                {
                  cardId : user.cardId
                },
                 {
                  $setOnInsert: user
                 },
                 {upsert: true}
            )
            if(!new_user.upsertedId)return {error:"User with same National ID number already exists."}
            await this.createLightUser(user,new_user.upsertedId)
            return {"_id":new_user.upsertedId}
        }
        catch{
            return {error:"Database dose not response."}
        }
    }
    private async createLightUser(createdUser:UserModel,new_user_id:string):Promise<void>{
        let new_user;
        try{
            const lightUser:LightUserModel={
                userId:new_user_id,
                first_name: createdUser.first_name,
                last_name: createdUser.last_name,
                email: createdUser.email,
                phone: createdUser.phone,
                createdIn: createdUser.createdIn
            }
            new_user = await this.db.collection(this.collection[1]).insertOne(lightUser)
            if(!new_user.acknowledged)throw new URIError()
        }
        catch{
            throw new Error()
        }
    }
    async getUserDataById(userId?:string,collection?:string):Promise<UserModel | {error:string}>{
        try{    
            const _id = new ObjectId(userId)    
            const result =  await this.db.collection(collection).findOne({'_id':_id})
            return result
        }catch(e){     
            return {error:"Database dose not response."}
        }
    }
    async getUserDataByCardId(cardId?:string,collection?:string):Promise<UserModel | {error:string}>{
        try{
            const result =  await this.db.collection(collection).findOne({'cardId':cardId})
            console.log(result);
            return result
        }catch(e){
            return {error:"Database dose not response."}
        }
    }
}