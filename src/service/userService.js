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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongodb_1 = require("mongodb");
const dbConnection_1 = require("../db/dbConnection");
const genericService_1 = require("./genericService");
const dotenv = __importStar(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const advertService_1 = require("./advertService");
/**
 * A service class that provides functionalities related to users in a MongoDB database.
 * Extends GenericService class.
 */
class UserService extends genericService_1.GenericService {
    /**
   * Creates an instance of UserService.
   * Calls the parent constructor and connects to the database.
   */
    constructor() {
        super();
        this.advertService = new advertService_1.AdvertService();
        this.connect().then();
    }
    /**
     * Connects to the database.
     * Loads environment variables from the dotenv module.
     * Initializes the database client and adds the advert and user collections.
     */
    async connect() {
        dotenv.config();
        const instance = dbConnection_1.DBConnection.getInstance();
        this.client = await instance.getDbClient();
        this.db = this.client.db(process.env.MONGO_DB_NAME);
        this.collection.push(process.env.MONGO_USER_COLLECTION);
        this.collection.push(process.env.MONGO_ADVERT_COLLECTION);
        this.salt_rounds = process.env.SALT_ROUNDS != null ? parseInt(process.env.SALT_ROUNDS) : 10;
    }
    /**
   * Creates a new user in the database with the provided user data.
   * Hashes the user's password before storing it in the database.
   * @param user The user data to be stored in the database.
   * @returns An object containing the ID of the newly created user or an error message.
   */
    async createNewUser(user) {
        user.password = await this.hashPassword(user.password);
        try {
            const new_user = await this.db.collection(this.collection[0]).insertOne(user);
            if (!new_user.acknowledged)
                return { error: "Database dose not response." };
            return { userId: new_user.insertedId.toString() };
        }
        catch (e) {
            if (e instanceof mongodb_1.MongoServerError) {
                return { error: "User with same Email Address already exists." };
            }
            else {
                console.log(e);
                return { error: "Database dose not response." };
            }
        }
    }
    // /**
    // * Retrieves user data from the database using the provided user ID.
    // * @param userId The ID of the user by which would be the user found.
    // * @returns The user data or an error message.
    // */
    // async getUserDataById(userId:ObjectId):Promise<LightUser | {error:string}>{
    //     try{
    //         const result =  await this.db.collection(this.collection[0]).aggregate([
    //             {$match:{'_id': userId}},
    //             {$project:{
    //               _id:0,
    //               createdIn:1,
    //               email:1,
    //               firstName:1,
    //               lastName:1,
    //               mainImageUrl:1,
    //               phone:1,
    //               validated:1
    //             }
    //           }]).toArray();
    //         if(result.length>0)return result[0]
    //         else return {error:"User does not exists."}
    //     }catch(e){
    //         console.log(e)
    //         return {error:"Database dose not response."}
    //     }
    // }
    /**
    * Retrieves user data by email and password.
    * @param email The user email address which would be used to find user
    * @param password TThe password that would authenticate user.
    * @returns A Promise that resolves to either a UserModel if email and password are correct or error message.
    */
    async getUserDataByEmailPassword(email, password) {
        try {
            const result = await this.db.collection(this.collection[0]).findOne({ 'email': email });
            if (!result)
                return { error: "Nor user exists with this Email Address." };
            if (await this.comparePassword(password, result.password)) {
                delete result.password;
                return result;
            }
            return { error: "Incorrect password." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    /**
    * Updates user main image URL.
    * @param userId The ID of the user whose image will be updated.
    * @param newUrl The new URL for user main image.
    * @returns A Promise that resolves to either a success or error message.
    */
    async updateUserImage(userId, newUrl) {
        try {
            const result = await this.db.collection(this.collection[0]).updateOne({ _id: userId }, {
                $set: {
                    mainImageUrl: newUrl
                }
            });
            if (result.acknowledged && result.modifiedCount == 1)
                return { success: "User image successfully updated." };
            else if (result.acknowledged && result.modifiedCount == 0)
                return { error: "User does not exists." };
            else
                return { error: "There is some problem with database." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    /**
    * Update user password if user authenticate him self.
    * @param user The user model contains password for authenticate and id for delete.
    * @param oldPassword The old password user authenticate him self.
    * @param newPassword The new password that would update the old one.
    * @returns A Promise that resolves to either a success or error message.
    */
    async updateUserPassword(user, oldPassword, newPassword) {
        try {
            if (await this.comparePassword(oldPassword, user.password)) {
                const password = await this.hashPassword(newPassword);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                const result = await this.db.collection(this.collection[0]).updateOne({ _id: userId }, {
                    $set: {
                        password: password
                    }
                });
                if (result.acknowledged && result.modifiedCount == 1)
                    return { success: "User password successfully updated." };
                else if (result.acknowledged && result.modifiedCount == 0)
                    return { error: "User does not exists." };
                else
                    return { error: "There is some problem with database." };
            }
            else
                return { error: "Incorrect password." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    /**
    * Update user profile information's.
    * @param userId The ID of the user whose information would be updated
    * @param user The user model contains updated data
    * @returns A Promise that resolves to either a success or error message.
    */
    async updateUser(userId, user) {
        try {
            const result = await this.db.collection(this.collection[0]).updateOne({ _id: userId }, {
                $set: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone
                }
            });
            if (result.acknowledged && result.modifiedCount == 1)
                return { success: "User profile successfully updated." };
            else if (result.acknowledged && result.modifiedCount == 0)
                return { error: "User does not exists." };
            else
                return { error: "There is some problem with database." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    /**
    * Delete user if user authenticate him self.
    * @param user The user model contains password for authenticate and id for delete.
    * @param password The user password used to verify user
    * @returns A Promise that resolves to either a success or error message.
    */
    async deleteUser(user, password) {
        try {
            if (await this.comparePassword(password, user.password)) {
                const userId = new mongodb_1.ObjectId(user._id.toString());
                const result = await this.db.collection(this.collection[0]).deleteOne({ _id: userId });
                if (result.acknowledged && result.deletedCount == 1)
                    return { success: "User was successfully deleted." };
                else if (result.acknowledged && result.deletedCount == 0)
                    return { error: "User does not exists." };
                else
                    return { error: "There is some problem with database." };
            }
            else
                return { error: "Incorrect password." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    /**
    * Deletes all user adverts and collect all images of deleted advert.
    * @param userId The ID of the user whose advert would be deleted.
    * @returns A Promise that resolves to either a URLs of deleted images or error message.
    */
    async deleteUserAdverts(userId) {
        try {
            let deleteImageUrls = [];
            const ids = await this.db.collection(this.collection[1]).aggregate([
                { $match: { 'userId': userId } },
                { $project: {
                        _id: 1,
                        imagesUrls: 1
                    }
                }
            ]).toArray();
            for (let id of ids) {
                id.imagesUrls.forEach(url => deleteImageUrls.push(url));
                const advertId = new mongodb_1.ObjectId(id._id.toString());
                await this.advertService.deleteAdvert(advertId, userId);
            }
            await this.advertService.deleteFavoriteAdvertWhole(userId);
            return deleteImageUrls;
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    /**
    * Hashes the given password.
    * @param password The plain text password to be hashed
    * @returns A Promise that resolves with hashed password.
    * @private
    */
    async hashPassword(password) {
        const salt = await bcrypt_1.default.genSalt(this.salt_rounds);
        return await bcrypt_1.default.hash(password, salt);
    }
    /**
    * Compares the given plain text password and hashed password.
    * @param password The plain text password to be compared
    * @param hash The hashed password to be compared
    * @returns A promise that resolves with a boolean, whether the password matches the hash or not.
    */
    async comparePassword(password, hash) {
        return await bcrypt_1.default.compare(password, hash);
    }
}
exports.UserService = UserService;
