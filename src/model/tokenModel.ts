export class TokenModel{
    _id?:string
    userId!:string
    expirationTime!:number
}
export class TokenExistsModel{
    valid!:boolean
    token?:TokenModel
}