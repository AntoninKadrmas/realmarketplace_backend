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
/**
 * Controller for operating over users.
 * It implements the GenericController interface.
 */
class UserController {
    /**
     * Creates a new UserController instance and initializes its router
     * @param userService Service for crud operations over users in database.
     * @param tokenService Service for crud operations over tokens in database.
     */
    constructor(userService, tokenService, tool) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.tool = tool;
        this.path = '/user';
        this.router = express_1.default.Router();
        /**
        * A request handler that create new user account.
        * @param req The express request object.
        * @param res The either token for authentication or error response.
        */
        this.registerUser = async (req, res) => {
            let user;
            try {
                if (Object.keys(req.body).length == 0) {
                    res.status(400).send({ error: "Body does not contains user model." });
                }
                else {
                    let loadCredential = req.headers.authorization;
                    if (loadCredential == undefined || loadCredential == null)
                        res.status(400).send({ error: "Missing credential header." });
                    else {
                        const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString();
                        const email = credentials.substring(0, credentials.indexOf(':'));
                        const password = credentials.substring(credentials.indexOf(':') + 1, credentials.length);
                        user = req.body;
                        user.createdIn = new Date();
                        user.password = password;
                        user.email = email;
                        if (!this.tool.validUser(user, false))
                            res.status(400).send({ error: "Invalid user model format." });
                        else {
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
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Body does not contains correct user model." });
            }
        };
        /**
        * A request handler that verify credential of user.
        * @param req The express request object.
        * @param res The either token for authentication or error response.
        */
        this.userLogin = async (req, res) => {
            try {
                let loadCredential = req.headers.authorization;
                if (loadCredential == undefined) {
                    res.status(400).send({ error: "Missing credential header." });
                }
                else {
                    const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString();
                    const email = credentials.substring(0, credentials.indexOf(':'));
                    const password = credentials.substring(credentials.indexOf(':') + 1, credentials.length);
                    if (!this.tool.validEmail(email))
                        res.status(400).send({ error: "Invalid user email format." });
                    else if (!this.tool.validPassword(password))
                        res.status(400).send({ error: "Invalid user password format." });
                    else {
                        const userResponse = await this.userService.getUserDataByEmailPassword(email, password);
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
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
        /**
        * A request handler that return user object.
        * @param req The express request object.
        * @param res The either user object or error response.
        */
        this.getUserById = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                delete user.password;
                delete user._id;
                res.status(200).send(user);
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Some problem on the server." });
            }
        };
        /**
        * A request handler that update user profile image.
        * @param req The express request object.
        * @param res The either success response with image url of newly created profile image or error response.
        */
        this.userProfileImage = async (req, res) => {
            try {
                const folder = process.env.FOLDER_IMAGE_PROFILE;
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                if (user.mainImageUrl != null && user.mainImageUrl != "")
                    this.tool.deleteFiles([user.mainImageUrl], this.folder);
                if (req.file == undefined || req.file == null)
                    res.status(400).send({ error: "No image was send to upload." });
                else {
                    const file = req.file;
                    const dirUrl = path_1.default.join(__dirname.split('src')[0], folder, file.filename);
                    if (!fs_1.default.existsSync(dirUrl))
                        res.status(400).send({ error: "Error when saving image." });
                    else {
                        const imageUrl = `/${file.filename}`;
                        const response = await this.userService.updateUserImage(userId, imageUrl);
                        if (response.hasOwnProperty("error")) {
                            this.tool.deleteFiles([imageUrl], this.folder);
                            res.status(400).send(response);
                        }
                        else {
                            const success = response;
                            res.status(200).send({ success: success.success, imageUrls: [imageUrl] });
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
        /**
        * A request handler that update user password.
        * @param req The express request object.
        * @param res The either success or error response.
        */
        this.userUpdatePassword = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                console.log(user);
                let loadCredential = req.headers.authorization;
                if (loadCredential == null) {
                    res.status(400).send({ error: "Missing credential header." });
                }
                else {
                    const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString();
                    console.log(credentials);
                    const passwordOld = credentials.substring(0, credentials.indexOf(':'));
                    const passwordNew = credentials.substring(credentials.indexOf(':') + 1, credentials.length);
                    if (!this.tool.validPassword(passwordOld))
                        res.status(400).send({ error: "Invalid old password format." });
                    else if (!this.tool.validPassword(passwordNew))
                        res.status(400).send({ error: "Invalid new password format." });
                    else {
                        const response = await this.userService.updateUserPassword(user, passwordOld, passwordNew);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else
                            res.status(200).send(response);
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
        /**
        * A request handler that update user profile information's.
        * @param req The express request object.
        * @param res The either success or error response.
        */
        this.userUpdate = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                if (Object.keys(req.body).length == 0)
                    res.status(400).send({ error: "Body does not contains user model." });
                else {
                    const userLight = req.body;
                    console.log(userLight);
                    console.log(this.tool.validUser(userLight, true));
                    if (!this.tool.validUser(userLight, true))
                        res.status(400).send({ error: "Invalid user model format." });
                    else {
                        const response = await this.userService.updateUser(userId, userLight);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else
                            res.status(200).send(response);
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
        /**
        * A request handler that delete user.
        * @param req The express request object.
        * @param res The either success or error response.
        */
        this.userDelete = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                let loadCredential = req.headers.authorization;
                if (loadCredential == null || loadCredential == undefined) {
                    res.status(400).send({ error: "Missing credential header." });
                }
                else {
                    const credentials = Buffer.from(loadCredential.split(" ")[1], 'base64').toString();
                    const password = credentials.substring(0, credentials.indexOf(':'));
                    if (!this.tool.validPassword(password))
                        res.status(400).send({ error: "Invalid user password." });
                    else {
                        const response = await this.userService.deleteUser(user, password);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else {
                            console.log(userId);
                            this.tool.deleteFiles([user.mainImageUrl], this.folder);
                            const deleteUrls = await this.userService.deleteUserAdverts(userId);
                            if (!response.hasOwnProperty("error"))
                                this.tool.deleteFiles(deleteUrls, this.folder);
                            await this.tokenService.deleteToken(userId);
                            res.status(200).send(response);
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Server error." });
            }
        };
        this.folder = process.env.FOLDER_IMAGE_PROFILE != undefined ? process.env.FOLDER_IMAGE_PROFILE : "profile";
        this.initRouter();
    }
    /**
     * Initializes the router by setting up the routes and their corresponding request handlers.
     */
    initRouter() {
        const upload_public = new imageMiddleware_1.ImageMiddleWare().getStorage(this.folder);
        this.router.post('/register', this.registerUser);
        this.router.post('/login', this.userLogin);
        this.router.get('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.getUserById);
        this.router.post('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.userUpdatePassword);
        this.router.put('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.userUpdate);
        this.router.delete('/', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.userDelete);
        this.router.post('/image', userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, upload_public.single('uploaded_file'), this.userProfileImage);
        this.router.use(express_1.default.static(path_1.default.join(__dirname.split('src')[0], this.folder)));
    }
}
exports.UserController = UserController;
