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
/**
 * A service class that provides functionalities related to tokens in a MongoDB database.
 * Extends GenericService class.
 */
class TokenService extends genericService_1.GenericService {
    /**
    * Creates an instance of TokenService.
    * Calls the parent constructor and connects to the database.
    */
    constructor() {
        super();
        this.expirationTime = 0;
        this.connect().then();
    }
    /**
     * Connects to the database.
     * Loads environment variables from the dotenv module.
     * Initializes the database client and adds the token collections.
     * Creates an index on the userId field of the token collection.
     */
    async connect() {
        dotenv.config();
        const instance = dbConnection_1.DBConnection.getInstance();
        this.client = await instance.getDbClient();
        this.collection.push(process.env.MONGO_TOKEN_COLLECTION);
        this.db = this.client.db(process.env.MONGO_DB_NAME);
        this.expirationTime = !!process.env.TOKEN_EXPIRATION_TIME ? parseInt(process.env.TOKEN_EXPIRATION_TIME) : 1800000;
        await this.db.collection(this.collection[0]).createIndex({ userId: 1 }, { unique: true });
    }
    /**
    * A static method that returns a singleton instance of TokenService class.
    * @returns A Promise that resolves to the singleton instance of TokenService class.
    * @static
    */
    static async getInstance() {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
            await TokenService.instance.connect();
        }
        return TokenService.instance;
    }
    /**
    * Creates a new token in the database for the specified user.
    * Deletes any existing tokens for the same user before creating a new one.
    * @param userId The ObjectId of the user for whom the token is being created.
    * @returns A Promise that resolves to the ObjectId of the created token or an error message.
    */
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
    /**
    * Updates the expiration time of the token with the specified token ID.
    * @param tokenId The ObjectId of the token to be updated.
    */
    async updateTokenByTokenId(tokenId) {
        try {
            await this.db.collection(this.collection[0]).updateOne({ _id: new mongodb_1.ObjectId(tokenId) }, { $set: { expirationTime: this.getActualValidTime() } });
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    /**
     * Find token and its owner.
     * @param tokenId The ID of the token to find.
     * @returns A promise that resolves object with validation time and user.
     */
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
                        user: 1,
                        expirationTime: 1
                    }
                }
            ]).toArray();
            const valid = await this.tokenIsValid({
                _id: tokenId,
                userId: token[0].user._id,
                expirationTime: token[0].expirationTime
            });
            if (valid)
                return {
                    valid: valid,
                    user: token[0].user
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
    /**
     * Deletes all tokens associated with a user.
     * @param userId The ID of the user whose tokens are to be deleted.
     * @returns A Promise that resolves to either a success or error message.
     */
    async deleteToken(userId) {
        try {
            const result = await this.db.collection(this.collection[0]).deleteMany({ userId: userId });
            if (result.acknowledged && result.deletedCount == 1)
                return { success: "Token successfully deleted." };
            else if (result.acknowledged && result.deletedCount == 0)
                return { error: "Can't delete foreign token." };
            else
                return { error: "There is some problem with database." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    /**
     * Checks if a token is still valid.
     * @param token The token to check.
     * @returns A promise that resolves to true if the token is valid, false otherwise.
     * @private
     */
    async tokenIsValid(token) {
        const valid = token.expirationTime >= (Date.now());
        try {
            if (!valid)
                await this.db.collection(this.collection[0]).deleteOne({ _id: token._id });
        }
        catch (e) {
            console.log(e);
            return false;
        }
        return valid;
    }
    /**
     * Gets the expiration time of tokens, in milliseconds, from the environment variables or uses a default value.
     * @returns The expiration time of tokens, in milliseconds.
     * @private
     */
    getActualValidTime() {
        return Date.now() + this.expirationTime;
    }
}
exports.TokenService = TokenService;
