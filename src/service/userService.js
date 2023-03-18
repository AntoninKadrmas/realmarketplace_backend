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
class UserService extends genericService_1.GenericService {
    constructor() {
        super();
        this.connect().then();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            dotenv.config();
            const instance = dbConnection_1.DBConnection.getInstance();
            this.client = yield instance.getDbClient();
            this.db = this.client.db(process.env.DB_NAME);
            this.collection.push(process.env.USER_COLLECTION);
            this.collection.push(process.env.LIGHT_USER_COLLECTION);
            this.salt_rounds = process.env.SALT_ROUNDS != null ? parseInt(process.env.SALT_ROUNDS) : 10;
        });
    }
    createNewUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.password = yield this.hashPassword(user.password);
            try {
                let userExists = yield this.db.collection(this.collection[0]).findOne({ cardId: user.cardId });
                if (userExists != null)
                    return { error: "User with same National ID number already exists." };
                userExists = yield this.db.collection(this.collection[0]).findOne({ email: user.email });
                if (userExists != null)
                    return { error: "User with same Email Address already exists." };
                const light_user = yield this.createLightUser(user);
                if (light_user == "") {
                    return { error: "Database dose not response." };
                }
                user.lightUserId = light_user;
                const new_user = yield this.db.collection(this.collection[0]).insertOne(user);
                if (!new_user.acknowledged) {
                    yield this.db.collection(this.collection[1]).deleteOne({ _id: new mongodb_1.ObjectId(light_user) });
                    return { error: "Database dose not response." };
                }
                return { userId: new_user.upsertedId, lightUserId: light_user };
            }
            catch (_a) {
                return { error: "Database dose not response." };
            }
        });
    }
    createLightUser(createdUser) {
        return __awaiter(this, void 0, void 0, function* () {
            let new_user;
            try {
                const lightUser = {
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    email: createdUser.email,
                    phone: createdUser.phone,
                    createdIn: createdUser.createdIn
                };
                new_user = yield this.db.collection(this.collection[1]).insertOne(lightUser);
                if (!new_user.acknowledged)
                    return "";
                else
                    return new_user.insertedId;
            }
            catch (_a) {
                return "";
            }
        });
    }
    getUserDataById(userId, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _id = new mongodb_1.ObjectId(userId);
                const result = yield this.db.collection(collection).findOne({ '_id': _id });
                return result;
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
