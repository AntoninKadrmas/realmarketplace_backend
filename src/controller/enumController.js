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
exports.EnumController = void 0;
const express_1 = __importDefault(require("express"));
const bookConditionEnum_1 = require("../model/bookConditionEnum");
const genreEnum_1 = require("../model/genreEnum");
const priceOptionsEnum_1 = require("../model/priceOptionsEnum");
class EnumController {
    constructor() {
        this.path = "/enum";
        this.router = express_1.default.Router();
        this.enumPriceOptionList = [];
        this.enumConditionOptionList = [];
        this.enumGenreOptionList = [];
        this.getBookCondition = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set("Cache-Control", "max-age=3600");
            res.status(200).send(this.enumConditionOptionList);
        });
        this.getGenre = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set("Cache-Control", "max-age=1000");
            res.status(200).send(this.enumGenreOptionList);
        });
        this.getPriceOption = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.set("Cache-Control", "max-age=3600");
            res.status(200).send(this.enumPriceOptionList);
        });
        this.initRouter();
        const genreFictionEnum = Object.entries(genreEnum_1.GenreFictionEnum).map(([key, value]) => ({ key, value }));
        const genreNonFictionEnum = Object.entries(genreEnum_1.GenreNonFictionEnum).map(([key, value]) => ({ key, value }));
        const priceOptionEnum = Object.entries(priceOptionsEnum_1.PriceOptionsEnum).map(([key, value]) => ({ key, value }));
        const conditionEnum = Object.entries(bookConditionEnum_1.BookConditionEnum).map(([key, value]) => ({ key, value }));
        genreFictionEnum.forEach((element) => {
            const genreItem = {
                name: element.value,
                type: genreEnum_1.GenreType.FICTION
            };
            this.enumGenreOptionList.push(genreItem);
        });
        genreNonFictionEnum.forEach((element) => {
            const genreItem = {
                name: element.value,
                type: genreEnum_1.GenreType.NON_FICTION
            };
            this.enumGenreOptionList.push(genreItem);
        });
        priceOptionEnum.forEach((element) => {
            this.enumPriceOptionList.push(element.value);
        });
        conditionEnum.forEach((element) => {
            this.enumConditionOptionList.push(element.value);
        });
    }
    initRouter() {
        this.router.get('/book-condition', this.getBookCondition);
        this.router.get('/genre-type', this.getGenre);
        this.router.get('/price-option', this.getPriceOption);
    }
}
exports.EnumController = EnumController;
