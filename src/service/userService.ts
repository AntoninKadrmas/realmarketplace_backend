import { ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { UserModel } from "../model/userModel";
import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';


export class UserService extends GenericService{
    salt_rounds!:number
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
        this.salt_rounds = process.env.SALT_ROUNDS!=null?parseInt(process.env.SALT_ROUNDS):10
    }
    async createNewUser(user:UserModel):Promise<{userId:string}|{error:string}>{
        user.password = await this.hashPassword(user.password!)
        try{
            let userExists = await this.db.collection(this.collection[0]).findOne({phone : user.phone})
            if(userExists!=null)return {error:"User with same Phone number already exists."}
            userExists = await this.db.collection(this.collection[0]).findOne({email : user.email})
            if(userExists!=null)return {error:"User with same Email Address already exists."}
            const new_user = await this.db.collection(this.collection[0]).insertOne(user)
            if(!new_user.acknowledged) {
                return {error:"Database dose not response."}
            }
            return {userId:new_user.insertedId.toString()}
        }
        catch{
            return {error:"Database dose not response."}
        }
    }
    async getUserDataById(userId?:ObjectId):Promise<UserModel | {error:string}>{
        try{    
            const result =  await this.db.collection(this.collection[0]).find({'_id':userId },{
                _id:0,
                createdIn:1,
                email:1,
                firstName:1,
                lastName:1,
                mainImageUrl:1,
                phone:1,
                validated:1
            })
            return result
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
    private async hashPassword(password:string):Promise<string>{
        const salt = await bcrypt.genSalt(this.salt_rounds)
        return await bcrypt.hash(password, salt)
    }
    private async comparePassword(password:string,hash:string):Promise<boolean>{
        return await bcrypt.compare(password, hash)
    }
}