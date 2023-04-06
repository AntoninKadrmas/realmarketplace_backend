"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightUser = exports.UserModelLogin = exports.UserValid = exports.UserModel = void 0;
class UserModel {
    constructor() {
        this.mainImageUrl = "";
    }
}
exports.UserModel = UserModel;
class UserValid {
    constructor() {
        this.validID = false;
        this.validEmail = false;
        this.validSMS = false;
    }
}
exports.UserValid = UserValid;
class UserModelLogin {
}
exports.UserModelLogin = UserModelLogin;
class LightUser {
}
exports.LightUser = LightUser;
