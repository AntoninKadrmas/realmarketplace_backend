import { Router } from "express";
import { GenericController } from "./genericController";
import express, { RequestHandler} from "express";
import { BookConditionEnum } from "../model/bookConditionEnum";
import { GenreFictionEnum, GenreItem, GenreNonFictionEnum, GenreType } from "../model/genreEnum";
import {  PriceOptionsEnum } from "../model/priceOptionsEnum";

export class EnumController implements GenericController{
    path: string = "/enum";
    router: Router = express.Router();
    private enumPriceOptionList:string[]=[]
    private enumConditionOptionList:string[]=[]
    private enumGenreOptionList:GenreItem[]=[]
    constructor(){
        this.initRouter()
        const genreFictionEnum = Object.entries(GenreFictionEnum).map(([key, value]) => ({ key, value }));
        const genreNonFictionEnum = Object.entries(GenreNonFictionEnum).map(([key, value]) => ({ key, value }));
        const priceOptionEnum = Object.entries(PriceOptionsEnum).map(([key, value]) => ({ key, value }));
        const conditionEnum = Object.entries(BookConditionEnum).map(([key, value]) => ({ key, value }));        
        genreFictionEnum.forEach((element:{key:string,value:string})=>{
            const genreItem:GenreItem ={
                name: element.value,
                type: GenreType.FICTION
            }
            this.enumGenreOptionList.push(genreItem)
        })
        genreNonFictionEnum.forEach((element:{key:string,value:string})=>{
            const genreItem:GenreItem ={
                name: element.value,
                type: GenreType.NON_FICTION
            }
            this.enumGenreOptionList.push(genreItem)
        })
        priceOptionEnum.forEach((element:{key:string,value:string})=>{
            this.enumPriceOptionList.push(element.value)
        })
        conditionEnum.forEach((element:{key:string,value:string})=>{
            this.enumConditionOptionList.push(element.value)
        })
    }
    initRouter(): void {
        this.router.get('/book-condition',this.getBookCondition)
        this.router.get('/genre-type',this.getGenre)
        this.router.get('/price-option',this.getPriceOption)
    }
    getBookCondition: RequestHandler = async (req, res) => {
        res.status(200).send(this.enumPriceOptionList)
    }
    getGenre: RequestHandler = async (req, res) => {
        res.status(200).send(this.enumGenreOptionList)
    }
    getPriceOption: RequestHandler = async (req, res) => {
        res.status(200).send(this.enumConditionOptionList)
    }
}