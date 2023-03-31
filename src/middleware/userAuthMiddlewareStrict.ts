import express, { NextFunction } from 'express';
import { TokenExistsModel } from '../model/tokenModel';
import { TokenService } from '../service/tokenService';
import { ObjectId } from 'mongodb';

export async function userAuthMiddlewareStrict(request: express.Request, response: express.Response, next: NextFunction) {
    try{
        const token = request.get("Authorization")
        if(token==null)throw Error("Token does not exists in header.")//token does not exists in header
        const tokenService:TokenService = await TokenService.getInstance()
        const tokenExists:TokenExistsModel = await tokenService.tokenExists(new ObjectId(token));
        if(!tokenExists.valid)throw Error("Token expired.")
        else {
            request.query.token =tokenExists.token?.userId.toString()
            await tokenService.updateTokenByTokenId(token)
        }
        next()
    }catch(e:any){
        console.log(e);
        response.status(401).send({error:e.message})
    }
}