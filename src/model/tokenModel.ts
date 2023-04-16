import { ObjectId } from "mongodb"
import { UserModel } from "./userModel"

/**
 * Represents a token model.
 */
export class TokenModel {
    /** The unique identifier of the token. */
    _id?: ObjectId;
    /** The identifier of the user associated with the token. */
    userId!: ObjectId;
    /** The expiration time of the token in milliseconds. */
    expirationTime!: number;
}
/**
 * Represents the result of checking if a token exists.
 */
export class TokenExistsModel {
    /** Indicates whether the token is valid or not. */
    valid!: boolean;
    /** The user associated with the token if it is valid. */
    user?: UserModel;
}