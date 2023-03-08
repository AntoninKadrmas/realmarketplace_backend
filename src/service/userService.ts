import { Db, MongoClient } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { UserModel } from "../model/userModel";
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
    async createNewUser(user:UserModel){
        return await this.db.collection(process.env.USER_COLLECTION).insertOne(user)
    }
}