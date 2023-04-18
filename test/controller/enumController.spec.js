"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../src/server");
(0, mocha_1.describe)("Enum controller tests.", () => {
    const server = new server_1.Server();
    const app = server.app;
    let listen;
    before(async () => {
        listen = await server.start();
    });
    (0, mocha_1.after)(async () => {
        listen.close();
    });
    (0, mocha_1.describe)("Price options endpoint get(/enum/price-option)", () => {
        (0, mocha_1.it)('should return list of price options', async function () {
            const res = await (0, supertest_1.default)(app).get(`/enum/price-option`)
                .send();
            (0, chai_1.expect)(res.status).to.eq(200);
            (0, chai_1.expect)(res.body.length).to.be.greaterThan(0);
        });
    });
    (0, mocha_1.describe)("Condition options endpoint get(/enum/book-condition)", () => {
        (0, mocha_1.it)('should return list of condition options', async function () {
            const res = await (0, supertest_1.default)(app).get(`/enum/book-condition`)
                .send();
            (0, chai_1.expect)(res.status).to.eq(200);
            (0, chai_1.expect)(res.body.length).to.be.greaterThan(0);
        });
    });
    (0, mocha_1.describe)("Genre types endpoint get(/enum/genre-type)", () => {
        (0, mocha_1.it)('should return list of genre types', async function () {
            const res = await (0, supertest_1.default)(app).get(`/enum/genre-type`)
                .send();
            (0, chai_1.expect)(res.status).to.eq(200);
            (0, chai_1.expect)(res.body.length).to.be.greaterThan(0);
        });
    });
});
