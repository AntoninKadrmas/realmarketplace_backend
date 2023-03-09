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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongodb_1 = require("mongodb");
const dbConnection_1 = require("../db/dbConnection");
require('dotenv').config();
class UserService {
    constructor() {
        this.connect().then();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = dbConnection_1.DBConnection.getInstance();
            this.client = yield instance.getDbClient();
            this.db = this.client.db(process.env.DB_NAME);
        });
    }
    createNewUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let new_user;
            try {
                new_user = yield this.db.collection(process.env.USER_COLLECTION).insertOne(user);
                if (!new_user.acknowledged)
                    return null;
                yield this.createLightUser(user, new_user);
                return new_user;
            }
            catch (_a) {
                return null;
            }
        });
    }
    createLightUser(createdUser, new_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let new_user;
            try {
                const lightUser = {
                    userId: new_user_id.insertedId,
                    first_name: createdUser.first_name,
                    last_name: createdUser.last_name,
                    email: createdUser.email,
                    phone: createdUser.phone,
                    createdIn: createdUser.createdIn
                };
                new_user = yield this.db.collection(process.env.LIGHT_USER_COLLECTION).insertOne(lightUser);
                if (!new_user.acknowledged)
                    throw new URIError();
            }
            catch (_a) {
                throw new Error();
            }
        });
    }
    getUserDataById(userId, collection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.db.collection(collection).find({ '_id': new mongodb_1.ObjectId(userId) });
                console.log(result);
                return result;
            }
            catch (e) {
                return null;
            }
        });
    }
}
exports.UserService = UserService;
