import { UserModel, UserValid } from "../../src/model/userModel";

export class HeadersTools{
    public static defaultUser:UserModel={
        firstName: "Antonin",
        lastName: "Novak",
        email: "novak.antonin.test.realmarketplaceoriginal.2023@gmail.com",
        phone: "123456789",
        createdIn: new Date(),
        validated: new UserValid(),
        mainImageUrl: ""
    }
    public static userToken:string;
    public static getTokenHeader(){
        let header={
            "Authentication":this.userToken
        }
        return header
    }
    public static getAuthHeader(value1:string,value2:string){
        let header={
            "Authorization":this.getBasicHeader(value1,value2)
        }
        return header
    }
    static getBasicHeader(value1:string,value2:string):string{
        return 'Basic ' + Buffer.from(value1 + ':' + value2).toString('base64');
    }
}