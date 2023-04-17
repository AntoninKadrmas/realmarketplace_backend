"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultUser = void 0;
const userModel_1 = require("../../src/model/userModel");
exports.defaultUser = {
    firstName: "Antonin",
    lastName: "Novak",
    email: "novak.antonin.test.realmarketplaceoriginal.2023@gmail.com",
    phone: "123456789",
    password: "AntoninNovak1984!!!!!!!",
    createdIn: new Date(),
    validated: new userModel_1.UserValid(),
    mainImageUrl: ""
};
