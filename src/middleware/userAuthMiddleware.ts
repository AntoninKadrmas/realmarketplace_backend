import express, { NextFunction } from 'express';
import { TokenService } from '../service/tokenService';

export async function userAuthMiddleware(request: express.Request, response: express.Response, next: NextFunction) {
    try{
        const token = request.headers["AuthToken"]?.toString()
        if(token==null)throw Error("Token does not exists in query params")
        const tokenService:TokenService = await TokenService.getInstance()
        const tokenExists = await tokenService.tokenExists(token);
        if(!tokenExists)throw Error("Token does not exists in database")
        else await tokenService.updateTokenByTokenId(token)
        next()
    }catch(e){
        console.log(e);
        response.status(401).send(e)
    }
}