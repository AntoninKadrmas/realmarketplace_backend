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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertService = void 0;
const genericService_1 = require("./genericService");
const dotenv = __importStar(require("dotenv"));
const dbConnection_1 = require("../db/dbConnection");
const mongodb_1 = require("mongodb");
class AdvertService extends genericService_1.GenericService {
    constructor() {
        super();
        this.connect().then();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            dotenv.config();
            const instance = dbConnection_1.DBConnection.getInstance();
            this.client = yield instance.getDbClient();
            this.collection.push(process.env.ADVERT_COLLECTION);
            this.collection.push(process.env.FAVORITE_COLLECTION);
            this.db = this.client.db(process.env.DB_NAME);
        });
    }
    createAdvert(advert) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).insertOne(advert);
                if (!result.acknowledged)
                    return { error: "Cant create advert." };
                else
                    return { success: "Advert created successfully.", _id: result.insertedId };
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    getAdvert() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).find({}).toArray();
                return result;
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    saveAdvertId(userId, advertId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[1]).updateOne({ 'userId': userId }, { $addToSet: { 'advertId': advertId } }, { upsert: true });
                if (result.acknowledged)
                    return { success: "Advert successfully added to favorite collection" };
                else
                    return { error: "There is some problem with favorite advert." };
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    deleteAdvertId(userId, advertId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[1]).updateOne({ 'userId': userId }, { $pull: { 'advertId': advertId } }, { upsert: true });
                if (result.acknowledged)
                    return { success: "Advert successfully removed from favorite collection" };
                else
                    return { error: "There is some problem with favorite advert." };
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    getAdvertByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).find({ "userId": userId }).toArray();
                return result;
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    deleteAdvert(advertId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).deleteOne({ "_id": new mongodb_1.ObjectId(advertId), "userId": userId });
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
        });
    }
    updateAdvert(advertId, userId, advert) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).updateOne({ "_id": new mongodb_1.ObjectId(advertId), "userId": userId }, {
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
        });
    }
}
exports.AdvertService = AdvertService;
