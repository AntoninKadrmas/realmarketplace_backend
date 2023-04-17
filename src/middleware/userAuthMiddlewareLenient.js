"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthMiddlewareLenient = void 0;
const tokenService_1 = require("../service/tokenService");
const mongodb_1 = require("mongodb");
/**
 * Found if user token is still valid and continue with user whom token belongs to if is valid and if not it will continue without the user.
 * @param request The request come from user.
 * @param response The response that will be send back to the user.
 * @param next The function used to send request and response to another function.
 */
async function userAuthMiddlewareLenient(request, response, next) {
    try {
        const token = request.get("Authentication");
        if (token == null)
            throw Error("Token does not exists in header.");
        const tokenService = await tokenService_1.TokenService.getInstance();
        const tokenExists = await tokenService.tokenExists(new mongodb_1.ObjectId(token));
        if (!tokenExists.valid)
            request.query.user = "";
        else {
            request.query.user = JSON.stringify(tokenExists.user);
            await tokenService.updateTokenByTokenId(token);
        }
        next();
    }
    catch (e) {
        request.query.token = "";
        next();
    }
}
exports.userAuthMiddlewareLenient = userAuthMiddlewareLenient;
