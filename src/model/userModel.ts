export class UserModel{
    id!:string;
    first_name!:string;
    last_name!:string;
    email!:string;
    phone!:string;
    age!:Date;
    createdIn!:Date;
    validated:boolean=false;
    gender?:string;
}