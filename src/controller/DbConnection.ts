import { MongoClient, ServerApiVersion } from 'mongodb'
export class DbConnection{
    static instance:DbConnection
    private mongoClient:Promise<MongoClient>
    private uri = "mongodb+srv://new_user:paKJQXHd99YNsvjy@realmarket.4lhdcrr.mongodb.net/?retryWrites=true&w=majority";
    constructor(){
        this.mongoClient = MongoClient.connect(this.uri).then(res=>{
            console.log(res);
            return res;
        })
    }
    public getDbClient(){
        return this.mongoClient;
    }
    public static getInstance(){
        if(!DbConnection.instance){
            DbConnection.instance = new DbConnection()
        }
        return DbConnection.instance;
    }
}