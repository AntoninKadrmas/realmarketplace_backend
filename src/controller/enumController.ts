import { Router } from "express";
import { GenericController } from "./genericController";
    import express, { RequestHandler} from "express";
import { BookConditionEnum } from "../model/bookConditionEnum";
import { GenreFictionEnum, GenreItem, GenreNonFictionEnum, GenreType } from "../model/genreEnum";
import {  PriceOptionsEnum } from "../model/priceOptionsEnum";

/**
 * Controller for retrieving lists of enumerated values.
 * It implements the GenericController interface.
 */
export class EnumController implements GenericController{
    path: string = "/enum";
    router: Router = express.Router();
    private enumPriceOptionList:string[]=[]
    private enumConditionOptionList:string[]=[]
    private enumGenreOptionList:GenreItem[]=[]
    /**
     * Creates a new EnumController instance and initializes its router and enum lists.
     */
    constructor(){
        this.initRouter()
        this.initEnumOptions()
    }
    /**
     * Initializes the router by setting up the routes and their corresponding request handlers.
     */
    initRouter(): void {
        this.router.get('/book-condition',this.getBookCondition)
        this.router.get('/genre-type',this.getGenre)
        this.router.get('/price-option',this.getPriceOption)
        this.router.get('',this.getInProgress)
    }
    /**
    * Initializes the enum options lists by mapping the available options from the corresponding enums.
    */
    initEnumOptions(): void {
        const genreFictionEnum = Object.entries(GenreFictionEnum).map(([key, value]) => ({ key, value }));
        const genreNonFictionEnum = Object.entries(GenreNonFictionEnum).map(([key, value]) => ({ key, value }));
        const priceOptionEnum = Object.entries(PriceOptionsEnum).map(([key, value]) => ({ key, value }));
        const conditionEnum = Object.entries(BookConditionEnum).map(([key, value]) => ({ key, value }));        
        genreFictionEnum.forEach((element:{key:string,value:string})=>{
            const genreItem:GenreItem ={
                name: element.value as GenreFictionEnum,
                type: GenreType.FICTION
            }
            this.enumGenreOptionList.push(genreItem)
        })
        genreNonFictionEnum.forEach((element:{key:string,value:string})=>{
            const genreItem:GenreItem ={
                name: element.value as GenreNonFictionEnum,
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
    /**
    * A request handler that returns the available book condition options.
    * @param req The express request object.
    * @param res The book condition list.
    */
    getBookCondition: RequestHandler = async (req, res) => {
        res.set("Cache-Control","max-age=3600")
        res.status(200).send(this.enumConditionOptionList)
    }
    /**
    * A request handler that returns the available genre options.
    * @param req The express request object.
    * @param res The book genre list.
    */
    getGenre: RequestHandler = async (req, res) => {
        res.set("Cache-Control","max-age=1000")
        res.status(200).send(this.enumGenreOptionList)
    }
    /**
    * A request handler that returns the available price options.
    * @param req The express request object.
    * @param res The book price list.
    */
    getPriceOption: RequestHandler = async (req, res) => {
        res.set("Cache-Control","max-age=3600")
        res.status(200).send(this.enumPriceOptionList)
    }
    /**
     * A request handler that returns if app is in production mode.
     * @param req The express request object.
     * @param res The boolean value represent in production mode.
     */
    getInProgress: RequestHandler = async (req, res) => {
        res.status(200).send({enable:true})
    }
}