import fs from 'fs';
import { UserModel } from '../model/userModel';

export class ToolService{
    /**
     * Delete files by its name in public folder.
     * @param imagesUrls Name of all file that has to be deleted if exists.
     */
    deleteFiles(imagesUrls:string[],folder:string){
        for(var image of imagesUrls){
            const oldDirUrl=__dirname.split('src')[0]+folder+image
            if(fs.existsSync(oldDirUrl)) fs.unlink(oldDirUrl,(err)=>{
                console.log(err)
            })
        }
    }
    /**
     * True if given string exists.
     * @param value string that would be tested
     * @returns Boolean value true if string exists else false.
     */
    validString(value:string):boolean{
        return value!=null &&
            value!=undefined &&
            value!=""
    }
    /**
     * True if given email address is correct.
     * @param email email address that would be tested
     * @returns Boolean value true if email address is correct else false.
     */
    validEmail(email:string):boolean{
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email)
    }
    /**
     * True if given number exists.
     * @param number number that would be tested
     * @returns Boolean value true if number is valid else false.
     */
    validNumber(number:string):boolean{
        try{
            parseFloat(number)
            return true
        }
        catch(e) {return false}
    }
    /**
     * True if given number exists.
     * @param value value which length would be tested
     * @param minLength the minimum length of the number 
     * @param maxLength the maximum length of the number 
     * @returns Boolean value true if number is valid else false.
     */
    validLength(value:string,minLength:number=-1,maxLength:number=-1){
        let min = value.length>=minLength||length==-1
        let max = value.length<=maxLength||length==-1
        return min&&max
    }
    /**
     * True if given password is valid.
     * @param password string contains plain text password 
     * @returns Boolean value true if password is valid else false.
     */
    validPassword(password:string):boolean{
        return /.*[a-z]+.*/g.test(password)&&
            /.*[A-Z]+.*/g.test(password)&&
            /.*[0-9]+./g.test(password)&&
            /.*[^A-Za-z0-9\\s]+./g.test(password)&&
            password.indexOf(":")==-1
    }
    validDate(dateString:Date):boolean{
        try{
            Date.parse(dateString.toISOString())
            return true
        }
        catch(e){return false}
    }
    createdIn!: Date;

    validUser(user:UserModel,ignorePassword:boolean,ignoreCreatedIn:boolean):boolean{
        return this.validString(user.firstName)&&
            this.validString(user.lastName)&&
            this.validNumber(user.phone)&&this.validLength(user.phone,9,9)&&
            (this.validString(user.mainImageUrl)||user.mainImageUrl=="")&&
            this.validEmail(user.email)&&
            (this.validPassword(user.password!=undefined?user.password.toString():"")||ignorePassword)&&
            (this.validDate(user.createdIn)||ignoreCreatedIn)
    }
}