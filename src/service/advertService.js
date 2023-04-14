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
exports.AdvertService = void 0;
const genericService_1 = require("./genericService");
const dotenv = __importStar(require("dotenv"));
const dbConnection_1 = require("../db/dbConnection");
class AdvertService extends genericService_1.GenericService {
    constructor() {
        super();
        this.pagesize = 2;
        this.advertIndex = process.env.MONGO_SEARCH_INDEX_ADVERT_NAME !== undefined
            ? process.env.MONGO_SEARCH_INDEX_ADVERT_NAME.toString() : '';
        this.connect().then();
    }
    async connect() {
        dotenv.config();
        const instance = dbConnection_1.DBConnection.getInstance();
        this.client = await instance.getDbClient();
        this.collection.push(process.env.MONGO_ADVERT_COLLECTION);
        this.collection.push(process.env.MONGO_FAVORITE_COLLECTION);
        this.db = this.client.db(process.env.DBName);
        await this.db.collection(this.collection[1]).createIndex({ userId: 1 }, { unique: true });
    }
    async createAdvert(advert) {
        try {
            const result = await this.db.collection(this.collection[0]).insertOne(advert);
            if (!result.acknowledged)
                return { error: "Cant create advert." };
            else
                return { success: "Advert created successfully.", _id: result.insertedId };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    async saveFavoriteAdvertId(userId, advertId) {
        try {
            const result = await this.db.collection(this.collection[1]).updateOne({ 'userId': userId }, { $addToSet: { 'advertId': advertId } }, { upsert: true });
            if (result.acknowledged)
                return { success: "Advert successfully added to favorite collection" };
            else
                return { error: "There is some problem with favorite advert." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    async deleteFavoriteAdvertId(userId, advertId) {
        try {
            const result = await this.db.collection(this.collection[1]).updateOne({ 'userId': userId }, { $pull: { 'advertId': advertId } });
            if (result.acknowledged)
                return { success: "Advert successfully removed from favorite collection" };
            else
                return { error: "There is some problem with favorite advert." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    async deleteFavoriteAdvertWhole(userId) {
        try {
            const result = await this.db.collection(this.collection[1]).deleteMany({ 'userId': userId });
            if (result.acknowledged && result.deletedCount == 1)
                return { success: "Favorite object successfully deleted." };
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
    async deleteAdvert(advertId, userId) {
        try {
            const result = await this.db.collection(this.collection[0]).deleteOne({ "_id": advertId, "userId": userId });
            await this.db.collection(this.collection[1]).updateMany({}, { $pull: { advertId: advertId } });
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
    async updateAdvert(advertId, userId, advert) {
        try {
            const result = await this.db.collection(this.collection[0]).updateOne({ "_id": advertId, "userId": userId }, {
                $set: advert
            });
            if (result.acknowledged && result.modifiedCount == 1)
                return { success: "Advert successfully updated." };
            else if (result.acknowledged && result.modifiedCount == 0)
                return { error: "Can't update foreign advert." };
            else
                return { error: "There is some problem with database." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    async updateAdvertVisibility(advertId, userId, state) {
        try {
            const result = await this.db.collection(this.collection[0]).updateOne({ "_id": advertId, "userId": userId }, {
                $set: {
                    visible: state
                }
            });
            console.log(result);
            if (result.acknowledged && result.modifiedCount == 1)
                return { success: "Advert visibility successfully updated." };
            else if (result.acknowledged && result.modifiedCount == 0)
                return { error: "Can't update foreign advert." };
            else
                return { error: "There is some problem with database." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
}
exports.AdvertService = AdvertService;
