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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const express_1 = __importDefault(require("express"));
const userModel_1 = require("../model/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
require('dotenv').config();
class UserController {
    constructor(userService) {
        this.userService = userService;
        this.path = '/user';
        this.router = express_1.default.Router();
        this.insertUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let user = new userModel_1.UserModel();
            try {
                if (req.body == null) {
                    res.status(400).send({ error: "Body does not contains user model." });
                }
                user = req.body;
            }
            catch (e) {
                res.status(400).send({ error: "Body does not contains correct user model." });
            }
            user.createdIn = new Date();
            user.password = yield this.hashPassword(user.password);
            this.userService.createNewUser(user).then((response) => {
                if (response.hasOwnProperty("_id"))
                    res.status(200).send(response);
                else
                    res.status(400).send(response);
            });
        });
        this.getFullUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const collection = process.env.USER_COLLECTION;
            if (!req.params.id)
                res.status(400).send(); //null as parameter
            const response = yield this.userService.getUserDataById(req.params.id, collection);
            if (!!response)
                res.status(200).send(response); //not null result
            res.status(400).send();
        });
        this.getLightUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const collection = process.env.LIGHT_USER_COLLECTION;
            if (!req.params.id)
                res.status(400).send(); //null as parameter
            const response = yield this.userService.getUserDataById(req.params.id, collection);
            if (!!response)
                res.status(200).send(response); //not null result
            res.status(400).send();
        });
        this.initRouter();
    }
    initRouter() {
        this.router.post('/create', this.insertUser);
        this.router.get('/full/:id', this.getFullUserById);
        this.router.get('/light/:id', this.getLightUserById);
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = 10;
            const salt = yield bcrypt_1.default.genSalt(saltRounds);
            return yield bcrypt_1.default.hash(password, salt);
        });
    }
    comparePassword(passowrd, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.compare(passowrd, hash);
        });
    }
}
exports.UserController = UserController;
