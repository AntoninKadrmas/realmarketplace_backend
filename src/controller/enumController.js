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
        this.getBookCondition = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200).send(bookConditionEnum_1.BookConditionEnum);
        });
        this.getFiction = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200).send(genreEnum_1.GenreFictionEnum);
        });
        this.getNonFiction = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200).send(genreEnum_1.GenreNonFictionEnum);
        });
        this.getPriceOption = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.status(200).send(priceOptionsEnum_1.PriceOptionsEnum);
        });
        this.initRouter();
    }
    initRouter() {
        this.router.get('/book-condition', this.getBookCondition);
        this.router.get('/genre/fiction', this.getFiction);
        this.router.get('/genre/non-fiction', this.getNonFiction);
        this.router.get('/price-option', this.getPriceOption);
    }
}
exports.EnumController = EnumController;
