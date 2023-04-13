"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthMiddlewareStrict = void 0;
const tokenService_1 = require("../service/tokenService");
const mongodb_1 = require("mongodb");
async function userAuthMiddlewareStrict(request, response, next) {
    try {
        var validToken = /^[a-f\d]{24}$/g;
        const token = request.get("Authentication");
        if (!validToken.test(token))
            throw Error("Incorrect token.");
        const tokenService = await tokenService_1.TokenService.getInstance();
        const tokenExists = await tokenService.tokenExists(new mongodb_1.ObjectId(token));
        console.log(tokenExists);
        if (!tokenExists.valid)
            throw Error("Token expired.");
        else {
            request.query.user = JSON.stringify(tokenExists.user);
            await tokenService.updateTokenByTokenId(token);
        }
        next();
    }
    catch (e) {
        console.log(e);
        response.status(401).send({ error: e.message });
    }
}
exports.userAuthMiddlewareStrict = userAuthMiddlewareStrict;
