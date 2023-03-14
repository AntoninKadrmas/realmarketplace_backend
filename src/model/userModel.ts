export class UserModel{
    _id?:string;
    lightUserId?:string;
    firstName!:string;
    lastName!:string;
    cardId!:string;
    password?:string;
    email!:string;
    phone!:string;  
    createdIn!:Date;
    validated!:UserValid
    gender?:string;
}
export class LightUserModel{
    _id?:string;
    firstName!:string;
    lastName!:string;
    email!:string;
    phone!:string;  
    createdIn!:Date;
}
export class UserValid{
    validIdFront=false;
    validIdBack=false;
    validSecondIdFront=false;
    valideSeoncIdBack=false;
    validIdAndFace=false;
}