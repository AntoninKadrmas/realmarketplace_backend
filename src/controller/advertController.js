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
class AdvertController {
    constructor(advertService) {
        this.advertService = advertService;
        this.path = "/advert";
        this.router = express_1.default.Router();
        this.createAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
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
                                (_a = advert.imagesUrls) === null || _a === void 0 ? void 0 : _a.push(imageUrl);
                                counter++;
                            }
                        }
                    }
                    const response = yield this.advertService.createAdvert(advert);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else {
                        const responseObject = response;
                        advert._id = responseObject._id;
                        res.status(200).send({ success: responseObject.success, advert: advert });
                    }
                }
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        });
        this.updateAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const folder = process.env.IMAGE_PUBLIC;
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains advert information's" });
                else {
                    const deleteUrl = req.body.deletedUrls.split(";").filter((x) => x != "");
                    const advertId = new mongodb_1.ObjectId(req.body._id.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    this.deleteFiles(deleteUrl);
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
                                (_b = advert.imagesUrls) === null || _b === void 0 ? void 0 : _b.push(imageUrl);
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
                    const response = yield this.advertService.updateAdvert(advertId, userId, advert);
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
        });
        this.deleteAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c;
            try {
                if (req.query.advertId == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const imagesUrls = req.get("deleteUrls").split(";");
                    const advertId = new mongodb_1.ObjectId((_c = req.query.advertId) === null || _c === void 0 ? void 0 : _c.toString());
                    if (advertId == null || imagesUrls == null)
                        res.status(400).send({ error: "Missing advert id or delete urls." });
                    else {
                        this.deleteFiles(imagesUrls);
                        const response = yield this.advertService.deleteAdvert(advertId, userId);
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
        });
        this.getAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.query.user == "") {
                    const search = req.query.search;
                    const response = yield this.advertService.getAdvertWithOutUser(search);
                    if (response.hasOwnProperty("error"))
                        res.status(400).send(response);
                    else
                        res.status(200).send(response);
                }
                else {
                    const search = req.query.search;
                    const response = yield this.advertService.getAdvertWithUser(search);
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
        });
        this.getFavoriteAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = JSON.parse(req.query.user);
                const userId = new mongodb_1.ObjectId(user._id.toString());
                const response = yield this.advertService.getFavoriteAdvertByUserId(userId);
                if (response.hasOwnProperty("error"))
                    res.status(400).send(response);
                else
                    res.status(200).send(response);
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Missing advert id." });
            }
        });
        this.addFavoriteAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _d;
            try {
                if (req.query.advertId == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const advertId = new mongodb_1.ObjectId((_d = req.query.advertId) === null || _d === void 0 ? void 0 : _d.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const response = yield this.advertService.saveFavoriteAdvertId(userId, advertId);
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
        });
        this.deleteFavoriteAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            try {
                if (req.query.advertId == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const advertId = new mongodb_1.ObjectId((_e = req.query.advertId) === null || _e === void 0 ? void 0 : _e.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const response = yield this.advertService.deleteFavoriteAdvertId(userId, advertId);
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
        });
        this.getUserAdverts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.get("userEmail") != null && req.get("createdIn") != null) {
                    const userEmail = req.get("userEmail");
                    const createdIn = req.get("createdIn");
                    const adverts = yield this.advertService.getAdvertByUserEmailTime(userEmail, createdIn);
                    if (adverts.hasOwnProperty("error"))
                        res.status(400).send(adverts);
                    else
                        res.status(200).send(adverts);
                }
                else {
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const adverts = yield this.advertService.getAdvertByUserId(userId);
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
        });
        this.updateAdvertVisibility = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _f;
            try {
                if (req.query.advertId == null || req.query.state == null)
                    res.status(400).send({ error: "Missing query params." });
                else {
                    const advertId = new mongodb_1.ObjectId((_f = req.query.advertId) === null || _f === void 0 ? void 0 : _f.toString());
                    const user = JSON.parse(req.query.user);
                    const userId = new mongodb_1.ObjectId(user._id.toString());
                    const state = req.query.state.toString().toLowerCase() === 'true';
                    const response = yield this.advertService.updateAdvertVisibility(advertId, userId, state);
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
        });
        this.initRouter();
    }
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
    deleteFiles(imagesUrls) {
        const folder = process.env.IMAGE_PUBLIC;
        for (var image of imagesUrls) {
            const oldDirUrl = __dirname.split('src')[0] + folder + image;
            if (fs_1.default.existsSync(oldDirUrl))
                fs_1.default.unlink(oldDirUrl, (err) => {
                    console.log(err);
                });
        }
    }
}
exports.AdvertController = AdvertController;
