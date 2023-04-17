import { defaultUser } from "../tools/globalTool";
export class HeadersTools{
    static getTokenHeader(token:string){
        return{
            "Authentication":token
        }
    }
    static getAuthHeader(value1:string,value2:string){
        return{
            "Authorization":this.getBasicHeader(value1,value2)
        }
    }
    static getAuthHeaderWithToken(token:string,value1:string,value2:string){
        return{
            "Authorization":this.getBasicHeader(value1,value2),
            "Authentication":token
        }
    }
    static getBasicHeader(value1:string,value2:string):string{
        return 'Basic ' + Buffer.from(value1 + ':' + value2).toString('base64');
    }
}