"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
const headersTools_1 = require("../tools/headersTools");
const defaultModels_1 = require("../tools/defaultModels");
const dbConnection_1 = require("../../src/db/dbConnection");
const server_1 = require("../../src/server");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
(0, mocha_1.describe)("Advert controller tests.", () => {
    const server = new server_1.Server();
    const app = server.app;
    let userToken = "";
    let listen;
    before(async () => {
        const value = dbConnection_1.DBConnection.getInstance();
        await value.getDbClient();
        listen = await server.start();
    });
    (0, mocha_1.after)(async () => {
        listen.close();
    });
    (0, mocha_1.describe)("Create user", () => {
        (0, mocha_1.it)("should create user", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, user.password))
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.token).to.length(24);
            userToken = res.body.token;
        });
    });
    (0, mocha_1.describe)("Create advert post(/advert)", () => {
        (0, mocha_1.it)("should create advert", async () => {
            const advert = defaultModels_1.defaultAdvert;
            const res = await (0, supertest_1.default)(app).post(`/advert`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .attach("uploaded_file", fs_1.default.readFileSync(path_1.default.join(__dirname.split("controller")[0], "resources", "profileImage.jpeg")), { filename: "profileImage.jpeg", contentType: "image/jpeg" })
                .attach("title", advert.title, { contentType: "text/plain" })
                .attach("author", advert.author, { contentType: "text/plain" })
                .attach("description", advert.description, { contentType: "text/plain" })
                .attach("genreName", advert.genreName, { contentType: "text/plain" })
                .attach("genreType", advert.genreType, { contentType: "text/plain" })
                .attach("priceOption", advert.priceOption, { contentType: "text/plain" })
                .attach("condition", advert.condition, { contentType: "text/plain" });
            (0, chai_1.expect)(res.status).to.eq(200);
            (0, chai_1.expect)(res.body.success).to.eq("User advert successfully created.");
        });
    });
    (0, mocha_1.describe)("Delete user", () => {
        (0, mocha_1.it)("should delete user.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).delete(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, user.password, ""))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.success).to.eq("User was successfully deleted.");
        });
    });
});
