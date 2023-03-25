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
const express_1 = __importDefault(require("express"));
const imageMiddleware_1 = require("../middleware/imageMiddleware");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const userAuthMiddlewareStrict_1 = require("../middleware/userAuthMiddlewareStrict");
dotenv.config();
class AdvertController {
    constructor(advertService) {
        this.advertService = advertService;
        this.path = "/advert";
        this.router = express_1.default.Router();
        this.createAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (req.body == null)
                    res.status(400).send({ error: "Body does not contains advert information's" });
                else {
                    const advert = req.body;
                    advert.userId = req.get("Authorization");
                    advert.createdIn = new Date();
                    advert.imagesUrls = [];
                    let counter = 0;
                    if (req.files != null) {
                        //@ts-ignore
                        for (let file of req.files) {
                            const dirUrl = __dirname.split('src')[0] + "public/" + file.filename;
                            if (!fs_1.default.existsSync(dirUrl)) { }
                            else {
                                const imageUrl = `/${file.filename}`;
                                if (counter == 0)
                                    advert.mainImage = imageUrl;
                                (_a = advert.imagesUrls) === null || _a === void 0 ? void 0 : _a.push(imageUrl);
                                counter++;
                            }
                        }
                    }
                    const response = yield this.advertService.createAdvert(advert);
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
        this.getAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const adverts = yield this.advertService.getAdvert();
                res.status(200).send(adverts);
            }
            catch (e) {
                console.log(e);
                res.status(400).send();
            }
        });
        this.favoriteAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const advertId = req.query.advertId;
                const userId = req.get("Authorization");
                const response = yield this.advertService.saveAdvertId(userId, advertId);
                res.status(200).send(response);
            }
            catch (e) {
                console.log(e);
                res.status(400).send({ error: "Missing advert id." });
            }
        });
        this.initRouter();
    }
    initRouter() {
        const upload_public = new imageMiddleware_1.ImageMiddleWare().getStorage();
        this.router.post("/create", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, upload_public.array('uploaded_file', 5), this.createAdvert);
        this.router.get("/all", this.getAdvert);
        this.router.post("/favorite/add", userAuthMiddlewareStrict_1.userAuthMiddlewareStrict, this.favoriteAdvert);
        this.router.use(express_1.default.static(path_1.default.join(__dirname.split('src')[0], process.env.IMAGE_PUBLIC)));
    }
}
exports.AdvertController = AdvertController;
