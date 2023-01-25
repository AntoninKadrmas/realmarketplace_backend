"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbConnection = void 0;
const mongodb_1 = require("mongodb");
class DbConnection {
    constructor() {
        this.uri = "mongodb+srv://new_user:paKJQXHd99YNsvjy@realmarket.4lhdcrr.mongodb.net/?retryWrites=true&w=majority";
        this.mongoClient = mongodb_1.MongoClient.connect(this.uri).then(res => {
            console.log(res);
            return res;
        });
    }
    getDbClient() {
        return this.mongoClient;
    }
    static getInstance() {
        if (!DbConnection.instance) {
            DbConnection.instance = new DbConnection();
        }
        return DbConnection.instance;
    }
}
exports.DbConnection = DbConnection;
