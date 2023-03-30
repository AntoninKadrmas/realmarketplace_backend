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
exports.userAuthMiddleware = void 0;
const tokenService_1 = require("../service/tokenService");
function userAuthMiddleware(request, response, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = (_a = request.headers["AuthToken"]) === null || _a === void 0 ? void 0 : _a.toString();
            if (token == null)
                throw Error("Token does not exists in query params");
            const tokenService = yield tokenService_1.TokenService.getInstance();
            const tokenExists = yield tokenService.tokenExists(token);
            if (!tokenExists)
                throw Error("Token does not exists in database");
            else
                yield tokenService.updateTokenByTokenId(token);
            next();
        }
        catch (e) {
            console.log(e);
            response.status(401).send(e);
        }
    });
}
exports.userAuthMiddleware = userAuthMiddleware;
