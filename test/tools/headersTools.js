"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadersTools = void 0;
const userModel_1 = require("../../src/model/userModel");
class HeadersTools {
    static getTokenHeader() {
        let header = {
            "Authentication": this.userToken
        };
        return header;
    }
    static getAuthHeader(value1, value2) {
        let header = {
            "Authorization": this.getBasicHeader(value1, value2)
        };
        return header;
    }
    static getBasicHeader(value1, value2) {
        return 'Basic ' + Buffer.from(value1 + ':' + value2).toString('base64');
    }
}
exports.HeadersTools = HeadersTools;
HeadersTools.defaultUser = {
    firstName: "Antonin",
    lastName: "Novak",
    email: "novak.antonin.test.realmarketplaceoriginal.2023@gmail.com",
    phone: "123456789",
    createdIn: new Date(),
    validated: new userModel_1.UserValid(),
    mainImageUrl: ""
};
