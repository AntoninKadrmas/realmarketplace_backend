import { ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { LightUser, UserModel } from "../model/userModel";
import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { AdvertService } from "./advertService";


export class UserService extends GenericService{
    salt_rounds!:number
    advertService = new AdvertService()
    constructor(){
        super()
        this.connect().then()
    }
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()        
        this.db = this.client.db(process.env.DB_NAME)
        this.collection.push(process.env.USER_COLLECTION)
        this.collection.push(process.env.ADVERT_COLLECTION)
        this.salt_rounds = process.env.SALT_ROUNDS!=null?parseInt(process.env.SALT_ROUNDS):10
    }
    async createNewUser(user:UserModel):Promise<{userId:string}|{error:string}>{
        user.password = await this.hashPassword(user.password!)
        try{
            let userExists = await this.db.collection(this.collection[0]).findOne({email : user.email})
            if(userExists!=null)return {error:"User with same Email Address already exists."}
            const new_user = await this.db.collection(this.collection[0]).insertOne(user)
            if(!new_user.acknowledged) return {error:"Database dose not response."}
            return {userId:new_user.insertedId.toString()}
        }
        catch{
            return {error:"Database dose not response."}
        }
    }
    async getUserDataById(userId:ObjectId):Promise<UserModel | {error:string}>{
        try{    
            const result =  await this.db.collection(this.collection[0]).aggregate([
                {$match:{'_id': userId}},
                {$project:{
                  _id:0,
                  createdIn:1,
                  email:1,
                  firstName:1,
                  lastName:1,
                  mainImageUrl:1,
                  phone:1,
                  validated:1
                }
              }]).toArray();
            if(result.length>0)return result[0]
            else return {error:"User does not exists."}
        }catch(e){   
            console.log(e)  
            return {error:"Database dose not response."}
        }
    }
    async getUserDataByEmail(email:string,password:string):Promise<UserModel | {error:string}>{
        try{
            const result:UserModel =  await this.db.collection(this.collection[0]).findOne({'email':email})
            if(!result) return {error:"Nor user exists with this Email Address."}
            if(await this.comparePassword(password,result.password!)){
                delete result.password
                return result
            }
            return {error:"Incorrect password."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async updateUserImage(userId:ObjectId,newUrl:string):Promise<{success:string} | {error:string}>{
        try{
            const result =  await this.db.collection(this.collection[0]).updateOne({_id:userId},{
                    $set:{
                        mainImageUrl:newUrl
                    }
                })
            if(result.acknowledged&&result.modifiedCount==1)return {success:"User image successfully updated."}
            else if(result.acknowledged&&result.modifiedCount==0)return {error:"User does not exists."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async updateUserPassword(userId:ObjectId,oldPassword:string,newPassword:string):Promise<{success:string} | {error:string}>{
        try{
            const verification = await this.verifyUser(userId,oldPassword)
            if(verification==2){
                const password = await this.hashPassword(newPassword)
                const result =  await this.db.collection(this.collection[0]).updateOne({_id:userId},{
                        $set:{
                            password:password
                        }
                    })
                if(result.acknowledged&&result.modifiedCount==1)return {success:"User password successfully updated."}
                else if(result.acknowledged&&result.modifiedCount==0)return {error:"User does not exists."}
                else return {error:"There is some problem with database."}
            }
            else if(verification==1) return {error:"Incorrect password."}
            else return {error:"User does not exists."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async updateUser(userId:ObjectId,user:LightUser):Promise<{success:string}|{error:string}>{
        try{
            const result =  await this.db.collection(this.collection[0]).updateOne({_id:userId},{
                    $set:{
                        firstName:user.firstName,
                        lastName:user.lastName,
                        phone:user.phone
                    }
                })
            if(result.acknowledged&&result.modifiedCount==1)return {success:"User profile successfully updated."}
            else if(result.acknowledged&&result.modifiedCount==0)return {error:"User does not exists."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async deleteUser(userId:ObjectId,password:string):Promise<{success:string}|{error:string}>{
        try{
            const verification = await this.verifyUser(userId,password)
            if(verification==2){
                const result =  await this.db.collection(this.collection[0]).delete({_id:userId})
                if(result.acknowledged&&result.deletedCount==1)return {success:"User was successfully deleted."}
                else if(result.acknowledged&&result.deletedCount==0)return {error:"User does not exists."}
                else return {error:"There is some problem with database."}
            }
            else if(verification==1) return {error:"Incorrect password."}
            else return {error:"User does not exists."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    async deleteUserAdverts(userId:ObjectId){
        try{
            const ids = await this.db.collection(this.collection[1]).find({userId:userId},{_id:1})
            for(let id of ids){
                const advertId = new ObjectId(id.toString())
                await this.advertService.deleteAdvert(advertId,userId)
            }
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    private async verifyUser(userId:ObjectId,oldPassword:string):Promise<number>{
        const user:UserModel = await this.db.collection(this.collection[0]).findOne({_id:userId})
        if(user.password==null||user.password=="")return 0
        return await this.comparePassword(oldPassword,user.password!)==true?2:1
    }
    private async hashPassword(password:string):Promise<string>{
        const salt = await bcrypt.genSalt(this.salt_rounds)
        return await bcrypt.hash(password, salt)
    }
    private async comparePassword(password:string,hash:string):Promise<boolean>{
        return await bcrypt.compare(password, hash)
    }
}