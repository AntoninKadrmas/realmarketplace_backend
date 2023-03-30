import { ObjectId } from "mongodb";
import { BookConditionEnum } from "./bookConditionEnum";
import { GenreFictionEnum, GenreNonFictionEnum, GenreType } from "./genreEnum";
import { PriceOptionsEnum } from "./priceOptionsEnum";
import { LightUser } from "./userModel";

export class AdvertModel{
    _id?:string;
    userId?:ObjectId;
    title!:string;
    author!:string;
    description!:string;
    condition!:BookConditionEnum;
    price!:string;
    priceOption!:PriceOptionsEnum;
    genreName!:GenreFictionEnum|GenreNonFictionEnum;
    genreType!:GenreType;
    place?:string;
    createdIn!:Date;
    mainImage?:string;
    imagesUrls?:string[];
}
export class AdvertModelWithUser{
    _id?:string;
    userId?:ObjectId;
    title!:string;
    author!:string;
    description!:string;
    condition!:BookConditionEnum;
    price!:string;
    priceOption!:PriceOptionsEnum;
    genreName!:GenreFictionEnum|GenreNonFictionEnum;
    genreType!:GenreType;
    place?:string;
    createdIn!:Date;
    mainImage?:string;
    imagesUrls?:string[];
    user!:LightUser
}
export class FavoriteAdvertWithoutUser{
    _id!: string;
    userId!: string;
    advertId!: string;
    advert!:AdvertModel
}
export class FavoriteAdvertUser{
    _id!: string;
    userId!: string;
    advertId!: string;
    advert!:AdvertModelWithUser
}