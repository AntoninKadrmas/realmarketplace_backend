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
exports.AdvertController = void 0;
const userAuthMiddlewareStrict_1 = require("../middleware/userAuthMiddlewareStrict");
const userAuthMiddlewareLenient_1 = require("../middleware/userAuthMiddlewareLenient");
const imageMiddleware_1 = require("../middleware/imageMiddleware");
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv.config();
/**
 * Controller for operating over adverts.
 * It implements the GenericController interface.
 */
class AdvertController {
    /**
     * Creates a new AdvertController instance and initializes its router
     * @param advertService Service that do crud operation over adverts in database.
     * @param advertSearchService Service for fetching information's about adverts from database.
     */
    constructor(advertService, advertSearchService, tools) {
        this.advertService = advertService;
        this.advertSearchService = advertSearchService;
        this.tools = tools;
        this.path = "/advert";
        this.router = express_1.default.Router();
        /**
        * A request handler that create new advert in database.
        * @param req The express request object.
        * @param res The either success response with created advert or error response.
        */
        this.createAdvert = async (req, res) => {
            try {
                const folder = process.env.IMAGE_PUBLIC;
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains advert information's" });
                else {
                    const advert = req.body;
                    const user = JSON.parse(req.query.user);
                    advert.userId = new mongodb_1.ObjectId(user._id.toString());
                    advert.createdIn = new Date();
                    advert.imagesUrls = [];
                    advert.visible = true;
                    let counter = 0;
                    if (req.files != null) {
                        //@ts-ignore
                        for (let file of req.files) {
                            const dirUrl = __dirname.split('src')[0] + `${folder}/` + file.filename;
                            if (!fs_1.default.existsSync(dirUrl)) { }
                            else {
                                const imageUrl = `/${file.filename}`;
                                if (counter == 0)
                                    advert.mainImageUrl = imageUrl;
                                advert.imagesUrls.push(imageUrl);
                                counter++;
                            }
                        }
                    }
                    const response = await this.advertService.createAdvert(advert);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else {
                        const responseObject = response;
                        advert._id = responseObject._id;
                        delete advert.userId;
                        res.status(200).send({ success: responseObject.success, advert: advert });
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        };
        /**
       * A request handler that update old advert in database.
       * @param req The express request object.
       * @param res The either success response with newly created img urls or error response.
       */
        this.updateAdvert = async (req, res) => {
            try {
                const folder = process.env.IMAGE_PUBLIC;
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains advert information's" });
                else {
                    const deleteUrl = req.body.deletedUrls.split(";").filter((x) => x != "");
                    const advertId = new mongodb_1.ObjectId(req.body._id.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    this.tools.deleteFiles(deleteUrl, this.folder);
                    const tempOldUrls = req.body.imagesUrls.split(";;");
                    const oldUrls = [];
                    for (let oldUrl of tempOldUrls) {
                        const urlPosition = oldUrl.split(";");
                        oldUrls.push({
                            url: urlPosition[0],
                            position: urlPosition[1]
                        });
                    }
                    delete req.body.deletedUrls;
                    delete req.body._id;
                    const advert = req.body;
                    advert.mainImageUrl = "";
                    advert.imagesUrls = [];
                    let counter = 0;
                    if (req.files != null) {
                        //@ts-ignore
                        for (let file of req.files) {
                            const dirUrl = __dirname.split('src')[0] + `${folder}/` + file.filename;
                            if (!fs_1.default.existsSync(dirUrl)) { }
                            else {
                                const imageUrl = `/${file.filename}`;
                                advert.imagesUrls.push(imageUrl);
                                counter++;
                            }
                        }
                    }
                    for (let oldUrl of oldUrls) {
                        console.log(`${oldUrl.position} --> ${oldUrl.url}`);
                        advert.imagesUrls.splice(oldUrl.position, 0, oldUrl.url);
                    }
                    if (advert.imagesUrls.length > 0)
                        advert.mainImageUrl = advert.imagesUrls[0];
                    const response = await this.advertService.updateAdvert(advertId, userId, advert);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send({ "success": response.success, "imageUrls": advert.imagesUrls });
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        };
        /**
        * A request handler that delete advert in database.
        * @param req The express request object.
        * @param res The either success or error response.
        */
        this.deleteAdvert = async (req, res) => {
            try {
                if (req.query.advertId == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const imagesUrls = req.get("deleteUrls").split(";");
                    const advertId = new mongodb_1.ObjectId(req.query.advertId.toString());
                    if (advertId == null || imagesUrls == null)
                        res.status(400).send({ error: "Missing advert id or delete urls." });
                    else {
                        this.tools.deleteFiles(imagesUrls, this.folder);
                        const response = await this.advertService.deleteAdvert(advertId, userId);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else
                            res.status(200).send(response);
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        };
        /**
        * A request handler that returns searched or sample adverts from database.
        * @param req The express request object.
        * @param res The either list of adverts with or without user.
        */
        this.getAdvert = async (req, res) => {
            try {
                if (this.tools.validString(req.query.search) && this.tools.validString(req.query.page)) {
                    const search = req.query.search;
                    const page = parseInt(req.query.page);
                    if (req.query.user == undefined) {
                        const response = await this.advertSearchService.getAdvertSearch(search, page, false);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else
                            res.status(200).send(response);
                    }
                    else {
                        const response = await this.advertSearchService.getAdvertSearch(search, page, true);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else
                            res.status(200).send(response);
                    }
                }
                else {
                    if (req.query.user == undefined) {
                        const response = await this.advertSearchService.getAdvertSample(false);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else
                            res.status(200).send(response);
                    }
                    else {
                        const response = await this.advertSearchService.getAdvertSample(true);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else
                            res.status(200).send(response);
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        };
        /**
        * A request handler that return favorite adverts from database.
        * @param req The express request object.
        * @param res The either favorite adverts list or error response.
        */
        this.getFavoriteAdvert = async (req, res) => {
            try {
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                const response = await this.advertSearchService.getFavoriteAdvertByUserId(userId);
                if (response.hasOwnProperty("error"))
                    res.status(400).send(response);
                else
                    res.status(200).send(response);
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Missing advert id." });
            }
        };
        /**
        * A request handler that add new advert into favorite adverts list.
        * @param req The express request object.
        * @param res The either success or error response.
        */
        this.addFavoriteAdvert = async (req, res) => {
            try {
                if (req.query.advertId == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const advertId = new mongodb_1.ObjectId(req.query.advertId.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const response = await this.advertService.saveFavoriteAdvertId(userId, advertId);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Missing advert id." });
            }
        };
        /**
        * A request handler that delete advert from favorite adverts list.
        * @param req The express request object.
        * @param res The either success or error response.
        */
        this.deleteFavoriteAdvert = async (req, res) => {
            try {
                if (req.query.advertId == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const advertId = new mongodb_1.ObjectId(req.query.advertId.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const response = await this.advertService.deleteFavoriteAdvertId(userId, advertId);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Missing advert id." });
            }
        };
        /**
        * A request handler that returns user adverts from database.
        * @param req The express request object.
        * @param res The either list of adverts or error response.
        */
        this.getUserAdverts = async (req, res) => {
            try {
                if (this.tools.validString(req.get("userEmail")) &&
                    this.tools.validString(req.get("createdIn"))) {
                    const userEmail = req.get("userEmail");
                    const createdIn = req.get("createdIn");
                    const adverts = await this.advertSearchService.getAdvertByUserEmailTime(userEmail, createdIn);
                    if (adverts.hasOwnProperty("error"))
                        res.status(400).send(adverts);
                    else
                        res.status(200).send(adverts);
                }
                else {
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const adverts = await this.advertSearchService.getAdvertByUserId(userId);
                    if (adverts.hasOwnProperty("error"))
                        res.status(400).send(adverts);
                    else
                        res.status(200).send(adverts);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        };
        /**
        * A request handler that update visibility of advert.
        * @param req The express request object.
        * @param res The either success or error response.
        */
        this.updateAdvertVisibility = async (req, res) => {
            try {
                if (req.query.advertId == null || req.query.state == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const advertId = new mongodb_1.ObjectId(req.query.advertId.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const state = req.query.state.toString().toLowerCase() === 'true';
                    const response = await this.advertService.updateAdvertVisibility(advertId, userId, state);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        };
        this.initRouter();
        this.folder = process.env.IMAGE_PUBLIC;
    }
    /**
     * Initializes the router by setting up the routes and their corresponding request handlers.
     */
    initRouter() {
        const upload_public = new imageMiddleware_1.ImageMiddleWare().getStorage(process.env.IMAGE_PUBLIC);
        this.router.post("", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, upload_public.array('uploaded_file', 5), this.createAdvert);
        this.router.put("", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, upload_public.array('uploaded_file', 5), this.updateAdvert);
        this.router.delete("", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.deleteAdvert);
        this.router.get("", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.getUserAdverts);
        this.router.get("/all", userAuthMiddlewareLenient_1.userAuthMiddlewareLenient, this.getAdvert);
        this.router.get("/favorite", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.getFavoriteAdvert);
        this.router.post("/favorite", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.addFavoriteAdvert);
        this.router.delete("/favorite", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.deleteFavoriteAdvert);
        this.router.put("/visible", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.updateAdvertVisibility);
        this.router.use(express_1.default.static(path_1.default.join(__dirname.split('src')[0], process.env.IMAGE_PUBLIC)));
    }
}
exports.AdvertController = AdvertController;
