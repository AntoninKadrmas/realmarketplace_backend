"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthMiddlewareStrict = void 0;
const tokenService_1 = require("../service/tokenService");
const mongodb_1 = require("mongodb");
/**
 * Found if user token is still valid and continue with user whom token belongs to if is valid and if not it will return with 401(unauthorized).
 * @param request The request come from user.
 * @param response The response that will be sent back to the user.
 * @param next The function used to send request and response to another function.
 */
async function userAuthMiddlewareStrict(request, response, next) {
    try {
        var validToken = /^[a-f\d]{24}$/g;
        const token = request.get("Authentication");
        const valid = validToken.test(token);
        if (!valid)
            response.status(401).send({ error: "Incorrect token." });
        else {
            const tokenService = await tokenService_1.TokenService.getInstance();
            const tokenExists = await tokenService.tokenExists(new mongodb_1.ObjectId(token));
            console.log(tokenExists);
            if (!tokenExists.valid)
                response.status(401).send({ error: "Token expired." });
            else {
                request.query.user = JSON.stringify(tokenExists.user);
                await tokenService.updateTokenByTokenId(token);
                next();
            }
        }
    }
    catch (e) {
        console.log(e);
        response.status(401).send({ error: "Some error during token handling." });
    }
}
exports.userAuthMiddlewareStrict = userAuthMiddlewareStrict;
