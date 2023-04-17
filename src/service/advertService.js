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
/**
 * A service class that provides functionalities related to adverts in a MongoDB database.
 * Extends GenericService class.
 */
class AdvertService extends genericService_1.GenericService {
    /**
     * Creates an instance of the AdvertService class.
     * Initializes the AdvertService by calling the GenericService constructor
     */
    constructor() {
        super();
        this.pagesize = 2;
        this.connect().then();
    }
    /**
     * Connects to the database.
     * Loads environment variables from the dotenv module.
     * Initializes the database client and adds the advert and favorite collections.
     * Creates an index on the userId field of the favorite collection.
     */
    async connect() {
        dotenv.config();
        const instance = dbConnection_1.DBConnection.getInstance();
        this.client = await instance.getDbClient();
        this.collection.push(process.env.MONGO_ADVERT_COLLECTION);
        this.collection.push(process.env.MONGO_FAVORITE_COLLECTION);
        this.db = this.client.db(process.env.DBName);
        await this.db.collection(this.collection[1]).createIndex({ userId: 1 }, { unique: true });
    }
    /**
     * Creates an advert in the database.
     * @param advert The advert to be created.
     * @returns A promise that resolves to an object containing a success message and the ID of the created advert,
     * or an object containing an error message.
     */
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
    /**
     * Adds an advert to a user's favorite collection.
     * @param userId The ID of the user.
     * @param advertId The ID of the advert.
     * @returns A promise that resolves to an object containing a success message, or an object containing an error message.
     */
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
    /**
     * Deletes an advert from the user's favorite collection in the database.
     * @param userId The ID of the user whose favorite collection will be updated.
     * @param advertId The ID of the advert to be removed from the favorite collection.
     * @returns A Promise that resolves to either a success or error message.
     */
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
    /**
     * Deletes the entire favorite collection of a user from the database.
     * @param userId The ID of the user whose favorite collection will be deleted.
     * @returns A Promise that resolves to either a success or error message.
     */
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
    /**
     * Deletes an advert from the database.
     * @param advertId The ID of the advert to be deleted.
     * @param userId The ID of the user who created the advert.
     * @returns A Promise that resolves to either a success or error message.
     */
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
    /**
     * Updates an advert in the database.
     * @param advertId The ID of the advert to be updated.
     * @param userId The ID of the user who created the advert.
     * @param advert The updated advert object.
     * @returns A Promise that resolves to either a success or error message.
     */
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
    /**
    * Updates an advert visibility in database.
    * @param advertId The ID of the advert to be updated.
    * @param userId The ID of the user who created the advert.
    * @param state The state on which would be the advert visibility updated.
    * @returns A Promise that resolves to either a success or error message.
    */
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
