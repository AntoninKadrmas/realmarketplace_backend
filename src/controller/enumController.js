"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumController = void 0;
const express_1 = __importDefault(require("express"));
const bookConditionEnum_1 = require("../model/bookConditionEnum");
const genreEnum_1 = require("../model/genreEnum");
const priceOptionsEnum_1 = require("../model/priceOptionsEnum");
/**
 * Controller for retrieving lists of enumerated values.
 * It implements the GenericController interface.
 */
class EnumController {
    /**
     * Creates a new EnumController instance and initializes its router and enum lists.
     */
    constructor() {
        this.path = "/enum";
        this.router = express_1.default.Router();
        this.enumPriceOptionList = [];
        this.enumConditionOptionList = [];
        this.enumGenreOptionList = [];
        /**
        * A request handler that returns the available book condition options.
        * @param req The express request object.
        * @param res The book condition list.
        */
        this.getBookCondition = async (req, res) => {
            res.set("Cache-Control", "max-age=3600");
            res.status(200).send(this.enumConditionOptionList);
        };
        /**
        * A request handler that returns the available genre options.
        * @param req The express request object.
        * @param res The book genre list.
        */
        this.getGenre = async (req, res) => {
            res.set("Cache-Control", "max-age=1000");
            res.status(200).send(this.enumGenreOptionList);
        };
        /**
        * A request handler that returns the available price options.
        * @param req The express request object.
        * @param res The book price list.
        */
        this.getPriceOption = async (req, res) => {
            res.set("Cache-Control", "max-age=3600");
            res.status(200).send(this.enumPriceOptionList);
        };
        this.initRouter();
        this.initEnumOptions();
    }
    /**
     * Initializes the router by setting up the routes and their corresponding request handlers.
     */
    initRouter() {
        this.router.get('/book-condition', this.getBookCondition);
        this.router.get('/genre-type', this.getGenre);
        this.router.get('/price-option', this.getPriceOption);
    }
    /**
    * Initializes the enum options lists by mapping the available options from the corresponding enums.
    */
    initEnumOptions() {
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
}
exports.EnumController = EnumController;
