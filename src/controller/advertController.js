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
exports.AdvertController = void 0;
const express_1 = __importDefault(require("express"));
const imageMiddleware_1 = require("../middleware/imageMiddleware");
const fs_1 = __importDefault(require("fs"));
class AdvertController {
    constructor(advertService) {
        this.advertService = advertService;
        this.path = "/advert";
        this.router = express_1.default.Router();
        this.createAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let advertModel;
            let error = false;
            console.log(req.body);
            if (req.files == undefined)
                res.status(401).send();
            else {
                try {
                    //@ts-ignore 
                    for (let file of req.files) {
                        const dirUrl = __dirname.split('src')[0] + "public/" + file.filename;
                        if (!fs_1.default.existsSync(dirUrl)) {
                            error = true;
                        }
                        else {
                            const imageUrl = `${this.path}/${file.filename}`;
                            console.log(imageUrl);
                        }
                    }
                    if (req.body == null)
                        res.status(400).send({ error: "Body does not contains advert information's" });
                    else {
                        advertModel = req.body;
                        const response = yield this.advertService.createAdvert(advertModel);
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
            }
        });
        this.initRouter();
    }
    initRouter() {
        const upload_public = new imageMiddleware_1.ImageMiddleWare().getStorage(true);
        this.router.post("/create", upload_public.array('uploaded_file', 5), this.createAdvert);
    }
}
exports.AdvertController = AdvertController;
