import { MongoClient } from 'mongodb'
export class DBConnection{
    static instance:DBConnection
    private mongoClient:Promise<MongoClient>
    private uri = "mongodb+srv://new_user:paKJQXHd99YNsvjy@realmarket.4lhdcrr.mongodb.net/?retryWrites=true&w=majority";
    constructor(){
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
