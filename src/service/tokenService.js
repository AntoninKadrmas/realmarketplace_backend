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
exports.TokenService = void 0;
const mongodb_1 = require("mongodb");
const dbConnection_1 = require("../db/dbConnection");
const dotenv = __importStar(require("dotenv"));
const genericService_1 = require("./genericService");
class TokenService extends genericService_1.GenericService {
    constructor() {
        super();
        this.connect().then();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            dotenv.config();
            const instance = dbConnection_1.DBConnection.getInstance();
            this.client = yield instance.getDbClient();
            this.collection.push(process.env.TOKEN_COLLECTION);
            this.db = this.client.db(process.env.DB_NAME);
        });
    }
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!TokenService.instance) {
                TokenService.instance = new TokenService();
                yield TokenService.instance.connect();
            }
            return TokenService.instance;
        });
    }
    createToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = {
                    userId: userId,
                    expirationTime: this.getActualValidTime()
                };
                yield this.db.collection(this.collection[0]).deleteMany({ userId: userId });
                const newTokenOrFind = yield this.db.collection(this.collection[0]).insertOne(token);
                if (!newTokenOrFind.acknowledged)
                    return "Can't create auth token.";
                else
                    return newTokenOrFind.insertedId;
            }
            catch (e) {
                console.log(e);
                return { error: "Database dose not response. Can't create auth token." };
            }
        });
    }
    updateTokenByTokenId(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            //mozna jenom find pokud se to bude volat pouze z middleware
            const token = yield this.db.collection(this.collection[0]).findOneAndUpdate({ _id: new mongodb_1.ObjectId(tokenId) }, { $inc: { expirationTime: this.getActualValidTime() } });
            return yield this.tokenIsValid(token.value);
        });
    }
    updateTokenByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.db.collection(this.collection[0]).findOneAndUpdate({ userId: userId }, { $inc: { expirationTime: this.getActualValidTime() } });
            return yield this.tokenIsValid(token.value);
        });
    }
    tokenExists(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = yield this.db.collection(this.collection[0]).findOne({ _id: new mongodb_1.ObjectId(tokenId) });
                return yield this.tokenIsValid(token);
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
    tokenIsValid(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = token.expirationTime >= (new Date().getTime() + 1800000);
            try {
                if (!valid)
                    yield this.db.collection(this.collection[0]).deleteOne({ _id: new mongodb_1.ObjectId(token._id) });
            }
            catch (e) {
                console.log(e);
            }
            console.log(token.expirationTime, (new Date().getTime()), valid);
            return valid;
        });
    }
    getActualValidTime() {
        const expirationTime = !!process.env.TOKEN_EXPIRATION_TIME ? parseInt(process.env.TOKEN_EXPIRATION_TIME) : 1800000;
        return new Date().getTime() + expirationTime;
    }
}
exports.TokenService = TokenService;
