"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbController = void 0;
const express_1 = __importDefault(require("express"));
class DbController {
    // public static getInstance(){
    //     if(!DbController.instance){
    //         DbController.instance = new DbController()
    //     }
    //     return DbController.instance;
    // }
    constructor() {
        // @ts-ignore
        // private client: MongoClient;
        // @ts-ignore
        // private db: Db;
        // static instance:DbController;
        this.path = '/ahoj';
        this.router = express_1.default.Router();
        // private async connect(){
        //     // const dbConnection = DbConnection.getInstance()
        //     // this.client = await dbConnection.getDbClient()
        //     // this.db = this.client.db('test')
        //     // DbController.getInstance()
        // }
        this.insert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200).send('ahoj');
        });
        this.initRouter();
        // this.connect().then()
    }
    initRouter() {
        this.router.get('/ahoj', this.insert);
    }
}
exports.DbController = DbController;
