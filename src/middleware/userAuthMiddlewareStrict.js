"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthMiddlewareStrict = void 0;
const tokenService_1 = require("../service/tokenService");
const mongodb_1 = require("mongodb");
function userAuthMiddlewareStrict(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var validToken = /^[a-f\d]{24}$/g;
            const token = request.get("Authentication");
            if (!validToken.test(token))
                throw Error("Incorrect token.");
            const tokenService = yield tokenService_1.TokenService.getInstance();
            const tokenExists = yield tokenService.tokenExists(new mongodb_1.ObjectId(token));
            console.log(tokenExists);
            if (!tokenExists.valid)
                throw Error("Token expired.");
            else {
                request.query.user = JSON.stringify(tokenExists.user);
                yield tokenService.updateTokenByTokenId(token);
            }
            next();
        }
        catch (e) {
            console.log(e);
            response.status(401).send({ error: e.message });
        }
    });
}
exports.userAuthMiddlewareStrict = userAuthMiddlewareStrict;
