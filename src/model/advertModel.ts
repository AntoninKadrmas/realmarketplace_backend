import { BookConditionEnum } from "./bookConditionEnum";
import { GenreFictionEnum, GenreNonFictionEnum, GenreType } from "./genreEnum";
import { PriceOptionsEnum } from "./priceOptionsEnum";

export class AdvertModel{
    lightUserId?:string;
    title!:string;
    description!:string;
    createdIn!:Date;
    condition!:BookConditionEnum;
    price!:string;
    priceOption!:PriceOptionsEnum;
    genreName!:GenreFictionEnum|GenreNonFictionEnum;
    genreType!:GenreType;
    place?:string;
    mainImage?:string;
    imagesUrls?:[string];
}