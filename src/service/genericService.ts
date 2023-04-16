import { Db, MongoClient } from "mongodb";

/**
 * Service generic class used as parent for other services.
 */
export class GenericService {
    protected client:MongoClient|any;
    protected db:Db|any
    protected collection: Array<any>=[];
    protected async connect():Promise<void>{}
    constructor(){}
}