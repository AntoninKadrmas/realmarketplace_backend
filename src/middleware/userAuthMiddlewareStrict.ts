import express, { NextFunction } from 'express';
import { TokenExistsModel } from '../model/tokenModel';
import { TokenService } from '../service/tokenService';

export async function userAuthMiddlewareStrict(request: express.Request, response: express.Response, next: NextFunction) {
    try{
        const token = request.get("Authorization")
        console.log(token)
        if(token==null)throw Error("Application error.")//token does not exists in header
        const tokenService:TokenService = await TokenService.getInstance()
        const tokenExists:TokenExistsModel = await tokenService.tokenExists(token);
        if(!tokenExists.valid)throw Error("Token expired.")
        else {
            response.set("Authorization",tokenExists.token?.userId)
            await tokenService.updateTokenByTokenId(token)
        }
        next()
    }catch(e:any){
        console.log(e);
        response.status(401).send({error:e.message})
    }
}