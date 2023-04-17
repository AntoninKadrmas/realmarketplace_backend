"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
const headersTools_1 = require("../tools/headersTools");
const globalTool_1 = require("../tools/globalTool");
const dbConnection_1 = require("../../src/db/dbConnection");
const server_1 = require("../../src/server");
(0, mocha_1.describe)("User controller tests.", () => {
    const server = new server_1.Server();
    const app = server.app;
    let userToken = "";
    before(async () => {
        const value = dbConnection_1.DBConnection.getInstance();
        await value.getDbClient();
        await server.start();
    });
    (0, mocha_1.describe)("Register user endpoint post(/user/register)", () => {
        (0, mocha_1.it)("Create new user", async () => {
            const user = globalTool_1.defaultUser;
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, user.password))
                .send(user);
            console.log(res.body);
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.token).to.length(24);
            userToken = res.body.token;
        });
        // it("Try to create a user with the same email.",async ()=>{
        //     const user = defaultUser
        //     const res = await request(app).post(`/user/register`)
        //             .set(HeadersTools.getAuthHeader(user.email,user.password!))
        //             .send(user);
        //     console.log(res.body)
        //     expect(res.status).to.be.eq(400);
        //     expect(res.body.error).to.eq("User with same Email Address already exists.")
        //     userToken=res.body.token
        // })
    });
    // describe("Delete user endpoint delete(/user)",()=>{
    //     it("Create new user",async ()=>{
    //         const user = defaultUser
    //         const res = await request(app).post(`/user/register`)
    //                 .set(HeadersTools.getAuthHeader(user.email,user.password!))
    //                 .send(user);
    //         expect(res.status).to.be.eq(200);
    //         expect(res.body.token).to.length(24)
    //         userToken=res.body.token
    //     })
    // })
});
