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
const mongodb_1 = require("mongodb");
const userAuthMiddlewareStrict_1 = require("../middleware/userAuthMiddlewareStrict");
const imageMiddleware_1 = require("../middleware/imageMiddleware");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv.config();
class UserController {
    constructor(userService, tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.path = '/user';
        this.router = express_1.default.Router();
        this.registerUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                        const token = yield this.tokenService.createToken(new mongodb_1.ObjectId(userIds.userId));
                        if (token.hasOwnProperty("error"))
                            res.status(400).send(token);
                        else
                            res.status(200).send({ "token": token.toString() });
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
                        const token = yield this.tokenService.createToken(new mongodb_1.ObjectId(tempUserResponse._id));
                        console.log(`token: ${token}`);
                        if (token.hasOwnProperty("error"))
                            res.status(400).send(token);
                        else
                            res.status(200).send({ "token": token.toString() });
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user login model." });
            }
        });
        this.getUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = new mongodb_1.ObjectId((_a = req.query.token) === null || _a === void 0 ? void 0 : _a.toString());
                const response = yield this.userService.getUserDataById(userId);
                if (response.hasOwnProperty("error"))
                    res.status(400).send(response);
                else
                    res.status(200).send(response);
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Some problem on the server." });
            }
        });
        this.userProfileImage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const folder = process.env.IMAGE_PROFILE;
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains advert information's" });
                else {
                    const oldDirUrl = __dirname.split('src')[0] + folder + req.body.oldUrl;
                    if (req.body.oldUrl != null && req.body.oldUrl != "" && fs_1.default.existsSync(oldDirUrl))
                        fs_1.default.unlinkSync(oldDirUrl);
                    const userId = new mongodb_1.ObjectId((_b = req.query.token) === null || _b === void 0 ? void 0 : _b.toString());
                    const file = req.file;
                    const dirUrl = __dirname.split('src')[0] + `${folder}/` + file.filename;
                    if (!fs_1.default.existsSync(dirUrl))
                        res.status(400).send();
                    else {
                        const dirUrl = __dirname.split('src')[0] + `${folder}/` + file.filename;
                        if (!fs_1.default.existsSync(dirUrl))
                            res.status(400).send("Error when saving image.");
                        else {
                            const imageUrl = `/${file.filename}`;
                            const response = yield this.userService.updateUserImage(userId, imageUrl);
                            if (response.hasOwnProperty("error")) {
                                fs_1.default.unlinkSync(__dirname.split('src')[0] + folder + imageUrl);
                                res.status(400).send(response);
                            }
                            else {
                                const success = response;
                                res.status(200).send({ success: success.success, imageUrls: [imageUrl] });
                            }
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        });
        this.userUpdatePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c;
            try {
                const userId = new mongodb_1.ObjectId((_c = req.query.token) === null || _c === void 0 ? void 0 : _c.toString());
                let loadCredential = req.headers.authorization;
                if (loadCredential == null) {
                    res.status(400).send("Incorrect request.");
                }
                else {
                    const credentials = new Buffer(loadCredential.split(" ")[1], 'base64').toString();
                    const passwordOld = credentials.substring(0, credentials.indexOf(':'));
                    const passwordNew = credentials.substring(credentials.indexOf(':') + 1, credentials.length);
                    const response = yield this.userService.updateUserPassword(userId, passwordOld, passwordNew);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user login model." });
            }
        });
        this.userUpdate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _d;
            try {
                const userId = new mongodb_1.ObjectId((_d = req.query.token) === null || _d === void 0 ? void 0 : _d.toString());
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains user model." });
                else {
                    const user = req.body;
                    const response = yield this.userService.updateUser(userId, user);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user login model." });
            }
        });
        this.userDelete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            try {
                const folder = process.env.IMAGE_PROFILE;
                const userId = new mongodb_1.ObjectId((_e = req.query.token) === null || _e === void 0 ? void 0 : _e.toString());
                let loadCredential = req.headers.authorization;
                if (loadCredential == null) {
                    res.status(400).send("Incorrect request.");
                }
                else {
                    const credentials = new Buffer(loadCredential.split(" ")[1], 'base64').toString();
                    const password = credentials.substring(0, credentials.indexOf(':'));
                    const response = yield this.userService.deleteUser(userId, password);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else {
                        const success = response;
                        const oldDirUrl = __dirname.split('src')[0] + folder + success.user.mainImageUrl;
                        if (fs_1.default.existsSync(oldDirUrl))
                            fs_1.default.unlinkSync(oldDirUrl);
                        yield this.userService.deleteUserAdverts(userId);
                        res.status(200).send(success.success);
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user login model." });
            }
        });
        this.initRouter();
    }
    initRouter() {
        const upload_public = new imageMiddleware_1.ImageMiddleWare().getStorage(process.env.IMAGE_PROFILE);
        this.router.post('/register', this.registerUser);
        this.router.post('/login', this.userLogin);
        this.router.get('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.getUserById);
        this.router.post('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.userUpdatePassword);
        this.router.put('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.userUpdate);
        this.router.delete('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.userDelete);
        this.router.post('/image', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, upload_public.single('uploaded_file'), this.userProfileImage);
        this.router.use(express_1.default.static(path_1.default.join(__dirname.split('src')[0], process.env.IMAGE_PROFILE)));
    }
}
exports.UserController = UserController;
