import { Db, MongoClient, ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { LightUserModel, UserModel } from "../model/userModel";
require('dotenv').config();

export class UserService{
    private client:MongoClient|any;
    private db:Db|any
    constructor(){
        this.connect().then()
    }
    private async connect(){
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()        
        this.db = this.client.db(process.env.DB_NAME)
    }
    async createNewUser(user:UserModel):Promise<object|null>{
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
            if(!new_user.upsertedId)return {error:"user with same cardId already exists"}
            await this.createLightUser(user,new_user.upsertedId)
            return {"_id":new_user.upsertedId}
        }
        catch{
            return null
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
            new_user = await this.db.collection(process.env.LIGHT_USER_COLLECTION).insertOne(lightUser)
            if(!new_user.acknowledged)throw new URIError()
        }
        catch{
            throw new Error()
        }
    }
    async getUserDataById(userId?:string,collection?:string):Promise<UserModel | null>{
        try{    
            const _id = new ObjectId(userId)    
            const result =  await this.db.collection(collection).findOne({'_id':_id})
            return result
        }catch(e){     
            return null
        }
    }
}