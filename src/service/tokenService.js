"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const mongodb_1 = require("mongodb");
const dbConnection_1 = require("../db/dbConnection");
const dotenv = __importStar(require("dotenv"));
const genericService_1 = require("./genericService");
class TokenService extends genericService_1.GenericService {
    constructor() {
        super();
        this.connect().then();
    }
    async connect() {
        dotenv.config();
        const instance = dbConnection_1.DBConnection.getInstance();
        this.client = await instance.getDbClient();
        this.collection.push(process.env.MONGO_TOKEN_COLLECTION);
        this.db = this.client.db(process.env.MONGO_DB_NAME);
        await this.db.collection(this.collection[0]).createIndex({ userId: 1 }, { unique: true });
    }
    static async getInstance() {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
            await TokenService.instance.connect();
        }
        return TokenService.instance;
    }
    async createToken(userId) {
        try {
            const token = {
                userId: userId,
                expirationTime: this.getActualValidTime()
            };
            await this.db.collection(this.collection[0]).deleteMany({ userId: userId });
            const newTokenOrFind = await this.db.collection(this.collection[0]).insertOne(token);
            if (!newTokenOrFind.acknowledged)
                return "Can't create auth token.";
            else
                return newTokenOrFind.insertedId;
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response. Can't create auth token." };
        }
    }
    async updateTokenByTokenId(tokenId) {
        //mozna jenom find pokud se to bude volat pouze z middleware
        const token = await this.db.collection(this.collection[0]).findOneAndUpdate({ _id: new mongodb_1.ObjectId(tokenId) }, { $inc: { expirationTime: this.getActualValidTime() } });
        return await this.tokenIsValid(token.value);
    }
    async updateTokenByUserId(userId) {
        const token = await this.db.collection(this.collection[0]).findOneAndUpdate({ userId: userId }, { $inc: { expirationTime: this.getActualValidTime() } });
        return await this.tokenIsValid(token.value);
    }
    async tokenExists(tokenId) {
        try {
            const token = await this.db.collection(this.collection[0]).aggregate([
                { $match: { _id: tokenId } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'users'
                    }
                },
                { $addFields: {
                        "user": { $arrayElemAt: ["$users", 0] }
                    } },
                {
                    $project: {
                        _id: 0,
                        user: 1
                    }
                }
            ]).toArray();
            const valid = await this.tokenIsValid({
                _id: tokenId.toString(),
                userId: new mongodb_1.ObjectId(token.user._id),
                expirationTime: token.expirationTime
            });
            if (valid)
                return {
                    valid: valid,
                    user: token.user
                };
            else
                return {
                    valid: valid,
                };
        }
        catch (e) {
            console.log(e);
            return {
                valid: false,
            };
        }
    }
    async deleteToken(userId) {
        try {
            const result = await this.db.collection(this.collection[0]).deleteMany({ userId: userId });
            if (result.acknowledged && result.deletedCount == 1)
                return { success: "Advert successfully deleted." };
            else if (result.acknowledged && result.deletedCount == 0)
                return { error: "Can't delete foreign advert." };
            else
                return { error: "There is some problem with database." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    async tokenIsValid(token) {
        const valid = token.expirationTime >= (new Date().getTime());
        try {
            if (!valid)
                await this.db.collection(this.collection[0]).deleteOne({ _id: new mongodb_1.ObjectId(token._id) });
        }
        catch (e) {
            console.log(e);
            return false;
        }
        return valid;
    }
    getActualValidTime() {
        const expirationTime = !!process.env.TOKEN_EXPIRATION_TIME ? parseInt(process.env.TOKEN_EXPIRATION_TIME) : 1800000;
        return new Date().getTime() + expirationTime;
    }
}
exports.TokenService = TokenService;
