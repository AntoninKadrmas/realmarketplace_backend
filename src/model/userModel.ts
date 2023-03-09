export class UserModel{
    _id?:string;
    first_name!:string;
    last_name!:string;
    idCard!:string;
    password!:string;
    email!:string;
    phone!:string;  
    age!:Date;
    createdIn!:Date;
    validated:boolean=false;
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