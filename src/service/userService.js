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
            return yield this.db.collection(process.env.USER_COLLECTION).insertOne(user);
        });
    }
}
exports.UserService = UserService;
