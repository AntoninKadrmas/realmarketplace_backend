import { ObjectId } from "mongodb";

/**
 * Represents a user model.
 */
export class UserModel {
    /** The unique identifier of the user. */
    _id?: ObjectId;
    /** The first name of the user. */
    firstName!: string;
    /** The last name of the user. */
    lastName!: string;
    /** The password of the user. */
    password?: string;
    /** The email address of the user. */
    email!: string;
    /** The phone number of the user. */
    phone!: string;
    /** The time stamp when the user was created. */
    createdIn!: Date;
    /** The gender of the user. */
    gender?: string;
    /** The validation status of the user. */
    validated!: UserValid;
    /** The URL of the user's main image. */
    mainImageUrl: string = "";
}
  
/**
 * Represents the validation status of a user.
 */
export class UserValid {
    /** Indicates if the user has a valid ID. */
    validID = false;
    /** Indicates if the user has a valid email address. */
    validEmail = false;
    /** Indicates if the user has a valid phone number. */
    validSMS = false;
}
  
/**
 * Represents a login model for a user.
 */
export class UserModelLogin {
    /** The email address of the user. */
    email!: string;
    /** The password of the user. */
    password!: string;
}
  
/**
 * Represents a light version of a user model.
 */
export class LightUser {
    /** The time stamp when the user was created. */
    createdIn!: string;
    /** The email address of the user. */
    email!: string;
    /** The first name of the user. */
    firstName!: string;
    /** The last name of the user. */
    lastName!: string;
    /** The phone number of the user. */
    phone!: string;
    /** The validation status of the user. */
    validated!: UserValid;
    /** The URL of the user's main image. */
    mainImageUrl!: string;
}