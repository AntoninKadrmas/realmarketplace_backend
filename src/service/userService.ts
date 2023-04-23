import { MongoServerError, ObjectId } from "mongodb";
import { DBConnection } from "../db/dbConnection";
import { LightUser, UserModel } from "../model/userModel";
import { GenericService } from "./genericService";
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { AdvertService } from "./advertService";

/**
 * A service class that provides functionalities related to users in a MongoDB database.
 * Extends GenericService class.
 */
export class UserService extends GenericService{
    salt_rounds!:number
    advertService = new AdvertService()
    expirationTime=0

    /**
    * Creates an instance of UserService.
    * Calls the parent constructor and connects to the database.
    */
    constructor(){
        super()
        this.connect().then()
    }
    /**
     * Connects to the database.
     * Loads environment variables from the dotenv module.
     * Initializes the database client and adds the advert and user collections.
     */
    override async connect(){
        dotenv.config();
        const instance = DBConnection.getInstance()
        this.client = await instance.getDbClient()        
        this.db = this.client.db(process.env.MONGO_DB_NAME)
        this.collection.push(process.env.MONGO_USER_COLLECTION)
        this.collection.push(process.env.MONGO_ADVERT_COLLECTION)
        this.expirationTime = !!process.env.USER_RESET_PASSWORD_TIME?parseInt(process.env.USER_RESET_PASSWORD_TIME):300000
        this.salt_rounds = process.env.SALT_ROUNDS!=null?parseInt(process.env.SALT_ROUNDS):10
    }
    /**
   * Creates a new user in the database with the provided user data.
   * Hashes the user's password before storing it in the database.
   * @param user The user data to be stored in the database.
   * @returns An object containing the ID of the newly created user or an error message.
   */
    async createNewUser(user:UserModel):Promise<{userId:string}|{error:string}>{
        user.password = await this.hashPassword(user.password!)
        try{
            const new_user = await this.db.collection(this.collection[0]).insertOne(user)
            if(!new_user.acknowledged) return {error:"Database dose not response."}
            return {userId:new_user.insertedId.toString()}
        }
        catch(e){
            if(e instanceof MongoServerError){
                return { error: "User with same Email Address already exists." };
            }else{
                console.log(e)
                return {error:"Database dose not response."}
            }
        }
    }
    /**
    * Add user temporary password to user account.
     * @param userId The ID of the user whose temporary password would be updated.
     * @returns The user data or an error message.
    */
    async addTemporaryPasswordToUser(userId:ObjectId,password:string):Promise<{success:string} | {error:string}>{
        try{
            const result = await this.db.collection(this.collection[0]).updateOne({_id:userId},{
                $set:{
                    resetPassword:{
                        expirationTime:this.getActualValidTime(),
                        password:await this.hashPassword(password)
                    }
                }
            })
            if(result.acknowledged&&result.modifiedCount==1)return {success:"User temporary password was updated."}
            else if(result.acknowledged&&result.modifiedCount==0)return {error:"User does not exists."}
            else return {error:"There is some problem with database."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
     * Gets the expiration time of tokens, in milliseconds, from the environment variables or uses a default value.
     * @returns The expiration time of tokens, in milliseconds.
     * @private
     */
    private getActualValidTime():number{
        return Date.now()+this.expirationTime
    }
    /**
     * Retrieves user data by email.
     * @param email The user email address which would be used to find user
     * @returns A Promise that resolves to either a UserModel if email exists or error message.
     */
    async getUserByEmail(email:string):Promise<UserModel | {error:string}>{
        try{
            const result:UserModel =  await this.db.collection(this.collection[0]).findOne({'email':email})
            return result
        }catch (e) {
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
    * Retrieves user data by email and password.
    * @param email The user email address which would be used to find user
    * @param password TThe password that would authenticate user.
    * @returns A Promise that resolves to either a UserModel if email and password are correct or error message.
    */
    async getUserDataByEmailPassword(email:string,password:string):Promise<UserModel | {error:string}>{
        try{
            let result:UserModel | {error:string} = await this.getUserByEmail(email)
            if(!result) return {error:"Nor user exists with this Email Address."}
            const user = result as UserModel
            if(await this.comparePassword(password,user.password!)){
                delete user.password
                if(user.resetPassword!=null)delete user.resetPassword
                return user
            }else if(user.resetPassword!=null){
                if(await this.comparePassword(password,user.resetPassword.password)
                    && parseFloat(user.resetPassword.expirationTime)>=(Date.now())){
                    delete user.password
                    delete user.resetPassword
                    return user
                }
            }
            return {error:"Incorrect password."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
    * Updates user main image URL.
    * @param userId The ID of the user whose image will be updated.
    * @param newUrl The new URL for user main image.
    * @returns A Promise that resolves to either a success or error message.
    */
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
    /**
    * Update user password if user authenticate him self.
    * @param user The user model contains password for authenticate and id for delete.
    * @param oldPassword The old password user authenticate him self.
    * @param newPassword The new password that would update the old one.
    * @returns A Promise that resolves to either a success or error message.
    */
    async updateUserPassword(user:UserModel,oldPassword:string,newPassword:string):Promise<{success:string} | {error:string}>{
        try{
            let exists=false
            if(await this.comparePassword(oldPassword,user.password!))exists=true
            else if(user.resetPassword!=null){
                if(await this.comparePassword(oldPassword,user.resetPassword.password)
                    && parseFloat(user.resetPassword.expirationTime)>=(Date.now())
                )exists=true
            }
            if(exists){
                const password = await this.hashPassword(newPassword)
                const userId=new ObjectId(user._id!.toString())
                const result =  await this.db.collection(this.collection[0]).updateOne({_id:userId},{
                        $set:{
                            password:password
                        }
                    })
                if(result.acknowledged&&result.modifiedCount==1)return {success:"User password successfully updated."}
                else if(result.acknowledged&&result.modifiedCount==0)return {error:"User does not exists."}
                else return {error:"There is some problem with database."}
            }
            else return {error:"Incorrect password."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
    * Update user profile information's.
    * @param userId The ID of the user whose information would be updated
    * @param user The user model contains updated data
    * @returns A Promise that resolves to either a success or error message.
    */
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
    /**
    * Delete user if user authenticate him self.
    * @param user The user model contains password for authenticate and id for delete.
    * @param password The user password used to verify user
    * @returns A Promise that resolves to either a success or error message.
    */
    async deleteUser(user:UserModel,password:string):Promise<{success:string}|{error:string}>{
        try{
            if(await this.comparePassword(password,user.password!)){
                const userId=new ObjectId(user._id!.toString())
                const result =  await this.db.collection(this.collection[0]).deleteOne({_id:userId})
                    if(result.acknowledged&&result.deletedCount==1)return {success:"User was successfully deleted."}
                else if(result.acknowledged&&result.deletedCount==0)return {error:"User does not exists."}
                else return {error:"There is some problem with database."}
            }
            else return {error:"Incorrect password."}
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
    * Deletes all user adverts and collect all images of deleted advert.
    * @param userId The ID of the user whose advert would be deleted.
    * @returns A Promise that resolves to either a URLs of deleted images or error message.
    */
    async deleteUserAdverts(userId:ObjectId):Promise<string[]|{error:string}>{
        try{
            let deleteImageUrls:string[]=[]
            const ids:{_id:ObjectId,imagesUrls:string[]}[] = await this.db.collection(this.collection[1]).aggregate([
                {$match:{'userId': userId}},
                {$project:{
                  _id:1,
                  imagesUrls:1
                }
              }]).toArray();
            for(let id of ids){
                id.imagesUrls.forEach(url=>deleteImageUrls.push(url))
                const advertId = new ObjectId(id._id.toString())
                await this.advertService.deleteAdvert(advertId,userId)
            }
            await this.advertService.deleteFavoriteAdvertWhole(userId)
            return deleteImageUrls
        }catch(e){
            console.log(e)
            return {error:"Database dose not response."}
        }
    }
    /**
    * Hashes the given password.
    * @param password The plain text password to be hashed
    * @returns A Promise that resolves with hashed password.
    * @private
    */
    private async hashPassword(password:string):Promise<string>{
        const salt = await bcrypt.genSalt(this.salt_rounds)
        return await bcrypt.hash(password, salt)
    }
    /**
    * Compares the given plain text password and hashed password.
    * @param password The plain text password to be compared
    * @param hash The hashed password to be compared
    * @returns A promise that resolves with a boolean, whether the password matches the hash or not.
    */
    private async comparePassword(password:string,hash:string):Promise<boolean>{
        return await bcrypt.compare(password, hash)
    }
}