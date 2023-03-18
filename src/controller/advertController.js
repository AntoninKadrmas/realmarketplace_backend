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
const advertModel_1 = require("../model/advertModel");
class AdvertController {
    constructor(advertService) {
        this.advertService = advertService;
        this.path = "/advert";
        this.router = express_1.default.Router();
        this.createAdvert = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.body == null)
                res.status(400).send({ error: "Body does not contains advert information's" });
            let advertModel;
            try {
                advertModel = req.body;
            }
            catch (e) {
                advertModel = new advertModel_1.AdvertModel();
                res.status(400).send({ error: "Body does not contains correct advert information's." });
            }
            const response = yield this.advertService.createAdvert(advertModel);
            if (!response.hasOwnProperty("error"))
                res.status(400).send(response);
            else
                res.status(200).send(response);
        });
    }
    initRouter() {
        this.router.post("/create", this.createAdvert);
    }
}
exports.AdvertController = AdvertController;
