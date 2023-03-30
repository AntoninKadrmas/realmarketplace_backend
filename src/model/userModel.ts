export class UserModel{
    _id?:string;
    firstName!:string;
    lastName!:string;
    password?:string;
    email!:string;
    phone!:string;  
    createdIn!:Date;
    gender?:string;
    validated!:UserValid
}
export class UserValid{
    validID=false;
    validEmail=false;
    validSMS=false;
}
export class UserModelLogin{
    email!:string;
    password!:string;
}
export class LightUser{
    createdIn!: string;
    email!: string;
    first_name!: string;
    last_name!: string;
    phone!: string;
    validated!:UserValid
}