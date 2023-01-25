import { Db, MongoClient } from "mongodb";
import { DbConnection } from "./DbConnection";
import express, { RequestHandler} from "express";

export class DbController{
    // @ts-ignore
    // private client: MongoClient;
    // @ts-ignore
    // private db: Db;
    // static instance:DbController;

    public path ='/ahoj'
    public router = express.Router()

    // public static getInstance(){
    //     if(!DbController.instance){
    //         DbController.instance = new DbController()
    //     }
    //     return DbController.instance;
    // }
    constructor(){
        this.initRouter()
        // this.connect().then()
    }
    initRouter(){
        this.router.get('/ahoj',this.insert)
    }
    // private async connect(){
    //     // const dbConnection = DbConnection.getInstance()
    //     // this.client = await dbConnection.getDbClient()
    //     // this.db = this.client.db('test')
    //     // DbController.getInstance()
    // }
    insert: RequestHandler = async (req, res) => {
            res.status(200).send('ahoj')
    }

}