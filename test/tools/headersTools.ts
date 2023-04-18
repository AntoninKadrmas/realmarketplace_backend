
/**
 * The HeadersTools class provides utility functions for constructing headers for HTTPS requests.
 */
export class HeadersTools {
    /**
     * Returns an object representing an HTTPS header containing an authentication user token.
     *
     * @param token The authentication user token to be included in the header.
     * @returns An object representing an HTTPS header containing the provided authentication user token.
     */
    static getTokenHeader(token: string) {
        return {
            "Authentication": token
        };
    }

    /**
     * Returns an object representing an HTTPS header containing a basic authorization token.
     *
     * @param value1 The first part of the credentials for the basic authorization header.
     * @param value2 The second part of the credentials for the basic authorization header.
     * @returns An object representing an HTTPS header containing a basic authorization token.
     */
    static getAuthHeader(value1: string, value2: string) {
        return {
            "Authorization": this.getBasicHeader(value1, value2)
        };
    }

    /**
     * Returns an object representing an HTTPS header containing both an authentication user token and a basic authorization token.
     *
     * @param token The authentication user token to be included in the header.
     * @param value1 The first part of the credentials for the basic authorization header.
     * @param value2 The second part of the credentials for the basic authorization header.
     * @returns An object representing an HTTPS header containing both an authentication user token and a basic authorization token.
     */
    static getAuthHeaderWithToken(token: string, value1: string, value2: string) {
        return {
            "Authorization": this.getBasicHeader(value1, value2),
            "Authentication": token
        };
    }

    /**
     * Returns a string representing a basic authorization token.
     *
     * @param value1 The first part of the credentials for the basic authorization token.
     * @param value2 The second part of the credentials for the basic authorization token.
     * @returns A string representing a basic authorization token.
     */
    static getBasicHeader(value1: string, value2: string): string {
        return 'Basic ' + Buffer.from(value1 + ':' + value2).toString('base64');
    }
}