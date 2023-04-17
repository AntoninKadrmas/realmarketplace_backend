"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../src/server");
const headersTools_1 = require("../tools/headersTools");
const app = new server_1.Server();
(0, mocha_1.describe)("Advert controller test", () => {
    (0, mocha_1.it)("test", async () => {
        const res = await (0, supertest_1.default)(app).get(`/`)
            .set(headersTools_1.HeadersTools.getTokenHeader())
            .send();
        (0, chai_1.expect)(false).to.be.false;
    });
});
