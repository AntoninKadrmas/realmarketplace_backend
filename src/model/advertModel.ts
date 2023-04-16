import { ObjectId } from "mongodb";
import { BookConditionEnum } from "./bookConditionEnum";
import { GenreFictionEnum, GenreNonFictionEnum, GenreType } from "./genreEnum";
import { PriceOptionsEnum } from "./priceOptionsEnum";
import { LightUser } from "./userModel";

/**
 * Represents an advertisement model.
 */
export class AdvertModel {
    /** The unique identifier of the advertisement. */
    _id?: string;
    /** The identifier of the user who created the advertisement. */
    userId?: ObjectId;
    /** The title of the advertisement. */
    title!: string;
    /** The author of the advertised book. */
    author!: string;
    /** The description of the advertised book. */
    description!: string;
    /** The condition of the advertised book. */
    condition!: BookConditionEnum;
    /** The price of the advertised book. */
    price!: string;
    /** The options for the price of the advertised book. */
    priceOption!: PriceOptionsEnum;
    /** The genre name of the advertised book. */
    genreName!: GenreFictionEnum | GenreNonFictionEnum;
    /** The type of the genre of the advertised book. */
    genreType!: GenreType;
    /** The location where the advertised book is available. */
    place?: string;
    /** The date when the advertisement was created. */
    createdIn!: Date;
    /** The main image URL of the advertised book. */
    mainImageUrl?: string;
    /** The additional images URLs of the advertised book. */
    imagesUrls?: string[];
    /** Indicates whether the advertisement is visible or not. */
    visible!: boolean;
  }
  
/**
 * Represents an advertisement model with user details.
 */
export class AdvertWithUserModel extends AdvertModel {
    /** The user who created the advertisement. */
    user?: LightUser;
  }
  
  /**
   * Represents a search result for advertisements.
   */
  export class SearchAdvertModel {
    /** The total count of search results. */
    count!: number[];
    /** The list of advertisements matching the search criteria. */
    advert!: AdvertWithUserModel[];
  }
  
  /**
   * Represents a favorite advertisement for a user.
   */
  export class FavoriteAdvertUser {
    /** The advertisement marked as favorite by the user. */
    advert!: AdvertWithUserModel;
  }
  
  /**
   * Represents a list of old images URLs.
   */
  export class OldImagesUrls {
    /** The URL of the old image. */
    url!: string;
    /** The position of the old image in the list of images. */
    position!: number;
  }