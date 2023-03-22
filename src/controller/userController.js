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
                else {
                    user = req.body;
                    user.createdIn = new Date();
                    const createUserResponse = yield this.userService.createNewUser(user);
                    if (createUserResponse.hasOwnProperty("userId")) {
                        const userIds = createUserResponse;
                        const token = yield this.tokenService.createToken(userIds.userId);
                        if (!token.hasOwnProperty("error"))
                            return res.status(200).send({ "token": token });
                        else
                            res.status(400).send(token);
                    }
                    else
                        res.status(400).send(createUserResponse);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user model." });
            }
        });
        this.userLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let loadCredential = req.headers.authorization;
                if (loadCredential == null) {
                    res.status(400).send("Incorrect request.");
                }
                else {
                    const credentials = new Buffer(loadCredential.split(" ")[1], 'base64').toString();
                    const name = credentials.substring(0, credentials.indexOf(':'));
                    const password = credentials.substring(credentials.indexOf(':') + 1, credentials.length);
                    const userResponse = yield this.userService.getUserDataByEmail(name, password);
                    if (userResponse.hasOwnProperty("error"))
                        res.status(400).send(userResponse);
                    else {
                        const tempUserResponse = userResponse;
                        const token = yield this.tokenService.createToken(tempUserResponse._id);
                        if (!token.hasOwnProperty("error"))
                            return res.status(200).send({ "token": token });
                        else
                            res.status(400).send(token);
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user login model." });
            }
        });
        this.getFullUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.params.id)
                res.status(400).send(); //null as parameter
            else {
                const response = yield this.userService.getUserDataById(req.params.id);
                if (!response.hasOwnProperty("error"))
                    res.status(200).send(response); //not null result
                else
                    res.status(400).send();
            }
        });
        this.initRouter();
    }
    initRouter() {
        this.router.post('/register', this.insertUser);
        this.router.post('/login', this.userLogin);
        this.router.get('/full/:id', this.getFullUserById);
    }
}
exports.UserController = UserController;
