import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv';

export class DBConnection{
    static instance:DBConnection
    private mongoClient:Promise<MongoClient>
    private uri:any="";
    constructor(){
        dotenv.config();
        this.uri = process.env.MONGO_DB_CONNECTION
        this.mongoClient = MongoClient.connect(this.uri)
    }
    public async getDbClient():Promise<MongoClient>{
        return this.mongoClient;
    }
    public static getInstance(){
        if(!DBConnection.instance){
            DBConnection.instance = new DBConnection()
        }
        return DBConnection.instance;
    }
}
