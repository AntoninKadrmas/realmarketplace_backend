import { Router } from "express";
import { GenericController } from "./genericController";
import express, { RequestHandler} from "express";
import { BookCondition, BookConditionEnum } from "../model/bookConditionEnum";
import { GenreFictionEnum, GenreNonFictionEnum } from "../model/genreEnum";
import { PriceOption, PriceOptionsEnum } from "../model/priceOptionsEnum";

export class EnumController implements GenericController{
    path: string = "/enum";
    router: Router = express.Router();
    constructor(){
        this.initRouter()
    }
    initRouter(): void {
        this.router.get('/book-condition',this.getBookCondition)
        // this.router.get('/genre/fiction',this.getFiction)
        // this.router.get('/genre/non-fiction',this.getNonFiction)
        this.router.get('/price-option',this.getPriceOption)
    }
    getBookCondition: RequestHandler = async (req, res) => {
        res.status(200).send(BookCondition.data)
    }
    getFiction: RequestHandler = async (req, res) => {
        res.status(200).send(GenreFictionEnum)
    }
    getNonFiction: RequestHandler = async (req, res) => {
        res.status(200).send(GenreNonFictionEnum)
    }
    getPriceOption: RequestHandler = async (req, res) => {
        res.status(200).send(PriceOption.data)
    }
}