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
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            dotenv.config();
            const instance = dbConnection_1.DBConnection.getInstance();
            this.client = yield instance.getDbClient();
            this.db = this.client.db(process.env.DB_NAME);
            this.collection.push(process.env.USER_COLLECTION);
            this.collection.push(process.env.ADVERT_COLLECTION);
            this.salt_rounds = process.env.SALT_ROUNDS != null ? parseInt(process.env.SALT_ROUNDS) : 10;
        });
    }
    createNewUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.password = yield this.hashPassword(user.password);
            try {
                let userExists = yield this.db.collection(this.collection[0]).findOne({ email: user.email });
                if (userExists != null)
                    return { error: "User with same Email Address already exists." };
                const new_user = yield this.db.collection(this.collection[0]).insertOne(user);
                if (!new_user.acknowledged)
                    return { error: "Database dose not response." };
                return { userId: new_user.insertedId.toString() };
            }
            catch (_a) {
                return { error: "Database dose not response." };
            }
        });
    }
    getUserDataById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).aggregate([
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
        });
    }
    getUserDataByEmail(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).findOne({ 'email': email });
                if (!result)
                    return { error: "Nor user exists with this Email Address." };
                if (yield this.comparePassword(password, result.password)) {
                    delete result.password;
                    return result;
                }
                return { error: "Incorrect password." };
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    updateUserImage(userId, newUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).updateOne({ _id: userId }, {
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
        });
    }
    updateUserPassword(userId, oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verification = yield this.verifyUser(userId, oldPassword);
                if (verification.number == 2) {
                    const password = yield this.hashPassword(newPassword);
                    const result = yield this.db.collection(this.collection[0]).updateOne({ _id: userId }, {
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
                else if (verification.number == 1)
                    return { error: "Incorrect password." };
                else
                    return { error: "User does not exists." };
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    updateUser(userId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(this.collection[0]).updateOne({ _id: userId }, {
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
        });
    }
    deleteUser(userId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verification = yield this.verifyUser(userId, password);
                if (verification.number == 2) {
                    const result = yield this.db.collection(this.collection[0]).deleteOne({ _id: userId });
                    if (result.acknowledged && result.deletedCount == 1)
                        return { success: "User was successfully deleted.", user: verification.user };
                    else if (result.acknowledged && result.deletedCount == 0)
                        return { error: "User does not exists." };
                    else
                        return { error: "There is some problem with database." };
                }
                else if (verification.number == 1)
                    return { error: "Incorrect password." };
                else
                    return { error: "User does not exists." };
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    deleteUserAdverts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleteImageUrls = [];
                const ids = yield this.db.collection(this.collection[1]).aggregate([
                    { $match: { 'userId': userId } },
                    { $project: {
                            _id: 1,
                            imagesUrls: 1
                        }
                    }
                ]).toArray();
                console.log(ids);
                for (let id of ids) {
                    id.imagesUrls.forEach(url => deleteImageUrls.push(url));
                    const advertId = new mongodb_1.ObjectId(id._id.toString());
                    yield this.advertService.deleteAdvert(advertId, userId);
                }
                yield this.advertService.deleteFavoriteAdvertWhole(userId);
                return deleteImageUrls;
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response." };
            }
        });
    }
    verifyUser(userId, oldPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.db.collection(this.collection[0]).findOne({ _id: userId });
            if (user.password == null || user.password == "")
                return { number: 0, user: null };
            return (yield this.comparePassword(oldPassword, user.password)) == true ? { number: 2, user: user } : { number: 1, user: null };
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt(this.salt_rounds);
            return yield bcrypt_1.default.hash(password, salt);
        });
    }
    comparePassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(password, hash);
        });
    }
}
exports.UserService = UserService;
