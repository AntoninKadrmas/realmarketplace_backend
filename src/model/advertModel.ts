import { BookConditionEnum } from "./bookConditionEnum";
import { GenreFictionEnum, GenreNonFictionEnum } from "./genreEnum";
import { PriceOptionsEnum } from "./priceOptionsEnum";

export class AdvertModel{
    userId!:string;
    title!:string;
    description!:string;
    createdIn!:Date;
    condition!:BookConditionEnum;
    price!:string;
    priceOption!:PriceOptionsEnum;
    genre!:GenreFictionEnum|GenreNonFictionEnum;
    place?:string;
    mainImage?:string;
    imagesUrls?:[string];
}