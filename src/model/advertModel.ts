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
    mainImageUrl?:string;
    imagesUrls?:string[];
    visible!:boolean;
}
export class AdvertWithUserModel extends AdvertModel{
    user?:LightUser
}
export class SearchAdvertModel{
    count!:number[]
    advert!:AdvertWithUserModel[]  
}
export class FavoriteAdvertUser{
    advert!:AdvertWithUserModel
}
export class OldImagesUrls{
    url!:string;
    position!:number;
}