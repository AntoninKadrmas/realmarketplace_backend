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
const toolService_1 = require("../../src/service/toolService");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
(0, mocha_1.describe)("User controller tests.", () => {
    const tools = new toolService_1.ToolService();
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
    (0, mocha_1.describe)("Register user endpoint post(/user/register)", () => {
        (0, mocha_1.it)("should not create new user without user in body", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, user.password))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Body does not contains user model.");
        });
        (0, mocha_1.it)("should not create new user without Authorization header", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Missing credential header.");
        });
        (0, mocha_1.it)("should not create new user with invalid password.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, "error"))
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid user model format.");
        });
        (0, mocha_1.it)("should not create new user with invalid email.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .set(headersTools_1.HeadersTools.getAuthHeader("error", user.password))
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid user model format.");
        });
        (0, mocha_1.it)("should create new user", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, user.password))
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.token).to.length(24);
            userToken = res.body.token;
        });
        (0, mocha_1.it)("should not create a user with the same email.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/register`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, user.password))
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("User with same Email Address already exists.");
        });
    });
    (0, mocha_1.describe)("Login user endpoint post(/user/login)", () => {
        (0, mocha_1.it)("should not login user without Authorization header", async () => {
            const res = await (0, supertest_1.default)(app).post(`/user/login`)
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Missing credential header.");
        });
        (0, mocha_1.it)("should not login user invalid email", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/login`)
                .set(headersTools_1.HeadersTools.getAuthHeader("error", user.password))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid user email format.");
        });
        (0, mocha_1.it)("should not login user invalid password", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/login`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, "error"))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid user password format.");
        });
        (0, mocha_1.it)("should not login user incorrect email", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/login`)
                .set(headersTools_1.HeadersTools.getAuthHeader(`error${user.email}`, user.password))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Nor user exists with this Email Address.");
        });
        (0, mocha_1.it)("should not login user incorrect password", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/login`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, `${user.password}error`))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Incorrect password.");
        });
        (0, mocha_1.it)("should login user", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user/login`)
                .set(headersTools_1.HeadersTools.getAuthHeader(user.email, user.password))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.token).to.length(24);
            userToken = res.body.token;
        });
    });
    (0, mocha_1.describe)("Get user by id get(/user)", () => {
        (0, mocha_1.it)("should not get user incorrect user token.", async () => {
            const res = await (0, supertest_1.default)(app).delete(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader("error"))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(401);
            (0, chai_1.expect)(res.body.error).to.eq("Incorrect token.");
        });
        (0, mocha_1.it)("should not delete old user incorrect user token.", async () => {
            const res = await (0, supertest_1.default)(app).get(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send();
            const user = res.body;
            console.log(res.body);
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(user.email).to.eq(defaultModels_1.defaultUser.email);
            (0, chai_1.expect)(user.phone).to.eq(defaultModels_1.defaultUser.phone);
            (0, chai_1.expect)(user.firstName).to.eq(defaultModels_1.defaultUser.firstName);
            (0, chai_1.expect)(user.lastName).to.eq(defaultModels_1.defaultUser.lastName);
            (0, chai_1.expect)(user.mainImageUrl).to.eq(defaultModels_1.defaultUser.mainImageUrl);
            (0, chai_1.expect)(user.validated).to.deep.eq(defaultModels_1.defaultUser.validated);
            defaultModels_1.defaultUser.createdIn = user.createdIn;
            (0, chai_1.expect)(tools.validUser(user, true)).to.be.true;
        });
    });
    (0, mocha_1.describe)("Update user password post(/user)", () => {
        (0, mocha_1.it)("should not update user password missing Authorization header.", async () => {
            const res = await (0, supertest_1.default)(app).post(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Missing credential header.");
        });
        (0, mocha_1.it)("should not update user password invalid new password.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, user.password, "error"))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid new password format.");
        });
        (0, mocha_1.it)("should not update user password invalid old password.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, "error", user.password))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid old password format.");
        });
        (0, mocha_1.it)("should not update user password incorrect old password.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).post(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, user.password + "error", user.password))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Incorrect password.");
        });
        (0, mocha_1.it)("should update user password.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const newPassword = user.password + "_new";
            const res = await (0, supertest_1.default)(app).post(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, user.password, newPassword))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.success).to.eq("User password successfully updated.");
            defaultModels_1.defaultUser.password = newPassword;
        });
    });
    (0, mocha_1.describe)("Update user profile put(/user)", () => {
        (0, mocha_1.it)("should not update user profile missing body.", async () => {
            const res = await (0, supertest_1.default)(app).put(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Body does not contains user model.");
        });
        (0, mocha_1.it)("should not update user profile invalid user model.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            user.email = "error";
            const res = await (0, supertest_1.default)(app).put(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid user model format.");
        });
        (0, mocha_1.it)("should update user profile.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            user.phone = "987654321";
            user.firstName = "Pepa";
            const res = await (0, supertest_1.default)(app).put(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send(user);
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.success).to.eq("User profile successfully updated.");
            defaultModels_1.defaultUser.phone = user.phone;
            defaultModels_1.defaultUser.firstName = user.firstName;
        });
        (0, mocha_1.it)("should get updated user information's.", async () => {
            const res = await (0, supertest_1.default)(app).get(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send();
            const user = res.body;
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(user.email).to.eq(defaultModels_1.defaultUser.email);
            (0, chai_1.expect)(user.phone).to.eq(defaultModels_1.defaultUser.phone); //new
            (0, chai_1.expect)(user.firstName).to.eq(defaultModels_1.defaultUser.firstName); //new
        });
    });
    (0, mocha_1.describe)("Upload user profile image post(/user/image)", () => {
        (0, mocha_1.it)("should not update user profile image missing form-data.", async () => {
            const res = await (0, supertest_1.default)(app).post(`/user/image`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("No image was send to upload.");
        });
        (0, mocha_1.it)("should update user profile image", async () => {
            const res = await (0, supertest_1.default)(app).post(`/user/image`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .attach("uploaded_file", fs_1.default.readFileSync(path_1.default.join(__dirname.split("controller")[0], "resources", "profileImage.jpeg")), { filename: "profileImage.jpeg", contentType: "image/jpeg" });
            (0, chai_1.expect)(res.status).to.eq(200);
            (0, chai_1.expect)(res.body.success).to.eq("User image successfully updated.");
        });
        (0, mocha_1.it)("should update user profile image and delete the old one", async () => {
            const res = await (0, supertest_1.default)(app).post(`/user/image`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .attach("uploaded_file", fs_1.default.readFileSync(path_1.default.join(__dirname.split("controller")[0], "resources", "profileImage.jpeg")), { filename: "profileImage.jpeg", contentType: "image/jpeg" });
            (0, chai_1.expect)(res.status).to.eq(200);
            (0, chai_1.expect)(res.body.success).to.eq("User image successfully updated.");
        });
    });
    (0, mocha_1.describe)("Delete user endpoint delete(/user)", () => {
        (0, mocha_1.it)("should not delete old user missing Authorization header.", async () => {
            const res = await (0, supertest_1.default)(app).delete(`/user`)
                .set(headersTools_1.HeadersTools.getTokenHeader(userToken))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Missing credential header.");
        });
        (0, mocha_1.it)("should not delete old user invalid password.", async () => {
            const res = await (0, supertest_1.default)(app).delete(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, "error", ""))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Invalid user password.");
        });
        (0, mocha_1.it)("should not delete old user incorrect password.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).delete(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, user.password + "error", ""))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(400);
            (0, chai_1.expect)(res.body.error).to.eq("Incorrect password.");
        });
        (0, mocha_1.it)("should delete old user.", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).delete(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, user.password, ""))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(200);
            (0, chai_1.expect)(res.body.success).to.eq("User was successfully deleted.");
        });
        (0, mocha_1.it)("should not delete already deleted user", async () => {
            const user = { ...defaultModels_1.defaultUser };
            const res = await (0, supertest_1.default)(app).delete(`/user`)
                .set(headersTools_1.HeadersTools.getAuthHeaderWithToken(userToken, user.password, ""))
                .send();
            (0, chai_1.expect)(res.status).to.be.eq(401);
            (0, chai_1.expect)(res.body.error).to.eq("Token expired.");
        });
    });
});
