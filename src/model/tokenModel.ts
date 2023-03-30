import { ObjectId } from "mongodb"

export class TokenModel{
    _id?:string
    userId!:ObjectId
    expirationTime!:number
}
export class TokenExistsModel{
    valid!:boolean
    token?:TokenModel
}