"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightUser = exports.UserModelLogin = exports.UserValid = exports.UserModel = void 0;
/**
 * Represents a user model.
 */
class UserModel {
    constructor() {
        /** The URL of the user's main image. */
        this.mainImageUrl = "";
    }
}
exports.UserModel = UserModel;
/**
 * Represents the validation status of a user.
 */
class UserValid {
    constructor() {
        /** Indicates if the user has a valid ID. */
        this.validID = false;
        /** Indicates if the user has a valid email address. */
        this.validEmail = false;
        /** Indicates if the user has a valid phone number. */
        this.validSMS = false;
    }
}
exports.UserValid = UserValid;
/**
 * Represents a login model for a user.
 */
class UserModelLogin {
}
exports.UserModelLogin = UserModelLogin;
/**
 * Represents a light version of a user model.
 */
class LightUser {
}
exports.LightUser = LightUser;
