export class UserModel{
    _id?:string;
    first_name!:string;
    last_name!:string;
    cardId!:string;
    password!:string;
    email!:string;
    phone!:string;  
    createdIn!:Date;
    validated!:UserValid
    gender?:string;
}
export class LightUserModel{
    _id?:string;
    userId!:string;
    first_name!:string;
    last_name!:string;
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