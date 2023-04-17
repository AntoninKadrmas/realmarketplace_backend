"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadersTools = void 0;
class HeadersTools {
    static getTokenHeader(token) {
        return {
            "Authentication": token
        };
    }
    static getAuthHeader(value1, value2) {
        return {
            "Authorization": this.getBasicHeader(value1, value2)
        };
    }
    static getAuthHeaderWithToken(token, value1, value2) {
        return {
            "Authorization": this.getBasicHeader(value1, value2),
            "Authentication": token
        };
    }
    static getBasicHeader(value1, value2) {
        return 'Basic ' + Buffer.from(value1 + ':' + value2).toString('base64');
    }
}
exports.HeadersTools = HeadersTools;
