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
class UserService extends genericService_1.GenericService {
    constructor() {
        super();
        this.advertService = new advertService_1.AdvertService();
        this.connect().then();
    }
    async connect() {
        dotenv.config();
        const instance = dbConnection_1.DBConnection.getInstance();
        this.client = await instance.getDbClient();
        this.db = this.client.db(process.env.MONGO_DB_NAME);
        this.collection.push(process.env.MONGO_USER_COLLECTION);
        this.collection.push(process.env.MONGO_ADVERT_COLLECTION);
        this.salt_rounds = process.env.SALT_ROUNDS != null ? parseInt(process.env.SALT_ROUNDS) : 10;
    }
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
    async getUserDataById(userId) {
        try {
            const result = await this.db.collection(this.collection[0]).aggregate([
                { $match: { '_id': userId } },
                { $project: {
                        _id: 0,
                        createdIn: 1,
                        email: 1,
                        firstName: 1,
                        lastName: 1,
                        mainImageUrl: 1,
                        phone: 1,
                        validated: 1
                    }
                }
            ]).toArray();
            if (result.length > 0)
                return result[0];
            else
                return { error: "User does not exists." };
        }
        catch (e) {
            console.log(e);
            return { error: "Database dose not response." };
        }
    }
    async getUserDataByEmail(email, password) {
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
    async updateUserPassword(user, oldPassword, newPassword) {
        try {
            if (await this.comparePassword(oldPassword, user.password)) {
                const password = await this.hashPassword(newPassword);
                const result = await this.db.collection(this.collection[0]).updateOne({ _id: new Object(user._id?.toString()) }, {
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
    async deleteUser(user, password) {
        try {
            if (await this.comparePassword(password, user.password)) {
                const result = await this.db.collection(this.collection[0]).deleteOne({ _id: new mongodb_1.ObjectId(user._id) });
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
    async hashPassword(password) {
        const salt = await bcrypt_1.default.genSalt(this.salt_rounds);
        return await bcrypt_1.default.hash(password, salt);
    }
    async comparePassword(password, hash) {
        return await bcrypt_1.default.compare(password, hash);
    }
}
exports.UserService = UserService;
