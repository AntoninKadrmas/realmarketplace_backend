import express, { NextFunction } from 'express';
import { TokenExistsModel } from '../model/tokenModel';
import { TokenService } from '../service/tokenService';
import { ObjectId } from 'mongodb';

/**
 * Found if user token is still valid and continue with user whom token belongs to if is valid and if not it will return with 401(unauthorized).
 * @param request The request come from user.
 * @param response The response that will be sent back to the user.
 * @param next The function used to send request and response to another function.
 */
export async function userAuthMiddlewareStrict(request: express.Request, response: express.Response, next: NextFunction) {
    try{
        var validToken = /^[a-f\d]{24}$/g
        const token = request.get("Authentication")
        const valid = validToken.test(token!)
        if(!valid)response.status(401).send({error:"Incorrect token."})
        else{
            const tokenService:TokenService = await TokenService.getInstance()
            const tokenExists:TokenExistsModel = await tokenService.tokenExists(new ObjectId(token));
            console.log(tokenExists)
            if(!tokenExists.valid)response.status(401).send({error:"Token expired."})
            else {
                request.query.user =JSON.stringify(tokenExists.user)
                await tokenService.updateTokenByTokenId(token!)
                next()
            }
        }
    }catch(e:any){
        console.log(e);
        response.status(401).send({error:"Some error during token handling."})
    }
}