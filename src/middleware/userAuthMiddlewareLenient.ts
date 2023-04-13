import express, { NextFunction } from 'express';
import { TokenExistsModel } from '../model/tokenModel';
import { TokenService } from '../service/tokenService';
import { ObjectId } from 'mongodb';

export async function userAuthMiddlewareLenient(request: express.Request, response: express.Response, next: NextFunction) {
    try{
        const token = request.get("Authentication")
        if(token==null)throw Error("Token does not exists in header.")
        const tokenService:TokenService = await TokenService.getInstance()
        const tokenExists:TokenExistsModel = await tokenService.tokenExists(new ObjectId(token));
        if(!tokenExists.valid) request.query.user=""
        else {
            request.query.user =JSON.stringify(tokenExists.user)
            await tokenService.updateTokenByTokenId(token)
        }
        next()
    }catch(e:any){
        request.query.token=""
        next()
    }
}