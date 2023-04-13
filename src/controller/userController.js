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
        this.registerUser = async (req, res) => {
            let user;
            try {
                if (req.body == null) {
                    res.status(400).send({ error: "Body does not contains user model." });
                }
                else {
                    user = req.body;
                    user.createdIn = new Date();
                    const createUserResponse = await this.userService.createNewUser(user);
                    if (createUserResponse.hasOwnProperty("userId")) {
                        const userIds = createUserResponse;
                        const token = await this.tokenService.createToken(new mongodb_1.ObjectId(userIds.userId));
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
        };
        this.userLogin = async (req, res) => {
            try {
                let loadCredential = req.headers.authorization;
                if (loadCredential == null) {
                    res.status(400).send("Incorrect request.");
                }
                else {
                    const credentials = new Buffer(loadCredential.split(" ")[1], 'base64').toString();
                    const name = credentials.substring(0, credentials.indexOf(':'));
                    const password = credentials.substring(credentials.indexOf(':') + 1, credentials.length);
                    const userResponse = await this.userService.getUserDataByEmail(name, password);
                    if (userResponse.hasOwnProperty("error"))
                        res.status(400).send(userResponse);
                    else {
                        const tempUserResponse = userResponse;
                        const token = await this.tokenService.createToken(new mongodb_1.ObjectId(tempUserResponse._id));
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
                res.status(400).send({ error: "Server error." });
            }
        };
        this.getUserById = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                const response = await this.userService.getUserDataById(userId);
                if (response.hasOwnProperty("error"))
                    res.status(400).send(response);
                else
                    res.status(200).send(response);
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Some problem on the server." });
            }
        };
        this.userProfileImage = async (req, res) => {
            try {
                const folder = process.env.IMAGE_PROFILE;
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains advert information's" });
                else {
                    if (req.body.oldUrl != null && req.body.oldUrl != "")
                        this.deleteFiles([req.body.oldUrl]);
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
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
                            const response = await this.userService.updateUserImage(userId, imageUrl);
                            if (response.hasOwnProperty("error")) {
                                this.deleteFiles([imageUrl]);
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
        };
        this.userUpdatePassword = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                let loadCredential = req.headers.authorization;
                if (loadCredential == null) {
                    res.status(400).send("Incorrect request.");
                }
                else {
                    const credentials = new Buffer(loadCredential.split(" ")[1], 'base64').toString();
                    const passwordOld = credentials.substring(0, credentials.indexOf(':'));
                    const passwordNew = credentials.substring(credentials.indexOf(':') + 1, credentials.length);
                    const response = await this.userService.updateUserPassword(user, passwordOld, passwordNew);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
        this.userUpdate = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains user model." });
                else {
                    const user = req.body;
                    const response = await this.userService.updateUser(userId, user);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
        this.userDelete = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                let loadCredential = req.headers.authorization;
                if (loadCredential == null) {
                    res.status(400).send("Incorrect request.");
                }
                else {
                    const credentials = new Buffer(loadCredential.split(" ")[1], 'base64').toString();
                    const password = credentials.substring(0, credentials.indexOf(':'));
                    const response = await this.userService.deleteUser(user, password);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else {
                        this.deleteFiles([user.mainImageUrl]);
                        const deleteUrls = await this.userService.deleteUserAdverts(userId);
                        if (!response.hasOwnProperty("error"))
                            this.deleteFiles(deleteUrls);
                        await this.tokenService.deleteToken(userId);
                        res.status(200).send(response);
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
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
    deleteFiles(imagesUrls) {
        const folder = process.env.IMAGE_PROFILE;
        for (var image of imagesUrls) {
            const oldDirUrl = __dirname.split('src')[0] + folder + image;
            console.log(`${oldDirUrl} ---- ${fs_1.default.existsSync(oldDirUrl)}`);
            if (fs_1.default.existsSync(oldDirUrl))
                fs_1.default.unlink(oldDirUrl, (err) => {
                    console.log(err);
                });
        }
    }
}
exports.UserController = UserController;
