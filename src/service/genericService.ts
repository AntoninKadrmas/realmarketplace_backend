import { Db, MongoClient } from "mongodb";

export class GenericService {
    protected client:MongoClient|any;
    protected db:Db|any
    protected collection: Array<any>=[];
    protected async connect():Promise<void>{}
    constructor(){}
}