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
exports.UserController = void 0;
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
require('dotenv').config();
class UserController {
    constructor(userService, tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.path = '/user';
        this.router = express_1.default.Router();
        this.insertUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let user;
            try {
                if (req.body == null) {
                    res.status(400).send({ error: "Body does not contains user model." });
                }
                user = req.body;
                user.createdIn = new Date();
                const createUserResponse = yield this.userService.createNewUser(user);
                if (createUserResponse.hasOwnProperty("userId") && createUserResponse.hasOwnProperty("lightUserId")) {
                    const userIds = createUserResponse;
                    const token = yield this.tokenService.createToken(userIds.userId, userIds.lightUserId);
                    if (!token.hasOwnProperty("error"))
                        return res.status(200).send({ "token": token });
                    else
                        res.status(400).send(token);
                }
                else
                    res.status(400).send(createUserResponse);
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user model." });
            }
        });
        this.userLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let user;
            try {
                if (req.query.email == null || req.query.password == null) {
                    res.status(400).send({ error: "Body does not contains user login model." });
                }
                user = { email: req.query.email, password: req.query.password };
                const userResponse = yield this.userService.getUserDataByEmail(user.email, user.password);
                if (userResponse.hasOwnProperty("error"))
                    res.status(400).send(userResponse);
                else {
                    const tempUserResponse = userResponse;
                    const token = yield this.tokenService.createToken(tempUserResponse._id, tempUserResponse.lightUserId);
                    if (!token.hasOwnProperty("error"))
                        return res.status(200).send({ "token": token });
                    res.status(400).send(token);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user login model." });
            }
        });
        this.getFullUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const collection = process.env.USER_COLLECTION;
            if (!req.params.id)
                res.status(400).send(); //null as parameter
            const response = yield this.userService.getUserDataById(req.params.id, collection);
            if (!response.hasOwnProperty("error"))
                res.status(200).send(response); //not null result
            res.status(400).send();
        });
        this.getLightUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const collection = process.env.LIGHT_USER_COLLECTION;
            if (!req.params.id)
                res.status(400).send(); //null as parameter
            const response = yield this.userService.getUserDataById(req.params.id, collection);
            if (!response.hasOwnProperty("error"))
                res.status(200).send(response); //not null result
            res.status(400).send();
        });
        this.initRouter();
    }
    initRouter() {
        this.router.post('/register', this.insertUser);
        this.router.get('/login', this.userLogin);
        this.router.get('/full/:id', this.getFullUserById);
        this.router.get('/light/:id', this.getLightUserById);
    }
}
exports.UserController = UserController;
