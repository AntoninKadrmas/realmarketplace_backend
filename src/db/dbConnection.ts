import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv';
/**
 * Database singleton connection class. Used to connect into mongodb database. 
 */
export class DBConnection{
    static instance:DBConnection
    private mongoClient:Promise<MongoClient>
    private uri:any="";
    /**
     * Create connection and save mongo client.
     */
    constructor(){
        dotenv.config();
        this.uri = process.env.MONGO_DB_CONNECTION
        this.mongoClient = MongoClient.connect(this.uri)
    }
    /**
     * Used for getting db client connection instance
     * @returns MongoClient db client connection instance
     */
    async getDbClient():Promise<MongoClient>{
        return this.mongoClient;
    }
    /**
     * Create new db connection if connection does not exist than return instance of this connection
     * @returns DBConnection instance
     * @static
     */
    static getInstance(){
        if(!DBConnection.instance){
            DBConnection.instance = new DBConnection()
        }
        return DBConnection.instance;
    }
}
