import { ObjectId } from "mongodb"
import { UserModel } from "./userModel"

export class TokenModel{
    _id?:ObjectId
    userId!:ObjectId
    expirationTime!:number
}
export class TokenExistsModel{
    valid!:boolean
    user?:UserModel
}