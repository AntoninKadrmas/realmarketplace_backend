"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAdvert = exports.defaultUser = void 0;
const userModel_1 = require("../../src/model/userModel");
const bookConditionEnum_1 = require("../../src/model/bookConditionEnum");
const genreEnum_1 = require("../../src/model/genreEnum");
const priceOptionsEnum_1 = require("../../src/model/priceOptionsEnum");
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
exports.defaultAdvert = {
    author: "Test_Evzen_Polivka_2023",
    condition: bookConditionEnum_1.BookConditionEnum.LIKE_NEW,
    createdIn: new Date(),
    description: "The cook book you have probably dreamed about. All recopies from the world in one place.",
    genreName: genreEnum_1.GenreNonFictionEnum.COOKBOOK,
    genreType: genreEnum_1.GenreType.NON_FICTION,
    price: "1000",
    priceOption: priceOptionsEnum_1.PriceOptionsEnum.EXACT_PRICE,
    title: "The_best_cook_book_written_by_Evzen_Polivka",
    visible: false
};
