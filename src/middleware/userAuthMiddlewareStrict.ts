import express, { NextFunction } from 'express';
import { TokenExistsModel } from '../model/tokenModel';
import { TokenService } from '../service/tokenService';
import { ObjectId } from 'mongodb';

export async function userAuthMiddlewareStrict(request: express.Request, response: express.Response, next: NextFunction) {
    try{
        var validToken = /^[a-f\d]{24}$/g
        const token = request.get("Authentication")
        if(!validToken.test(token!))throw Error("Incorrect token.")
        const tokenService:TokenService = await TokenService.getInstance()
        const tokenExists:TokenExistsModel = await tokenService.tokenExists(new ObjectId(token));
        console.log(tokenExists)
        if(!tokenExists.valid)throw Error("Token expired.")
        else {
            request.query.user =JSON.stringify(tokenExists.user)
            await tokenService.updateTokenByTokenId(token!)
        }
        next()
    }catch(e:any){
        console.log(e);
        response.status(401).send({error:e.message})
    }
}