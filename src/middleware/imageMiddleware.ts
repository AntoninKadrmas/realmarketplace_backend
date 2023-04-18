import multer from "multer";
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
dotenv.config();
/**
 * Middleware used to save images in the server folder. 
 */
export class ImageMiddleWare{
    type:{ [id: string] : string; }=  {
        "image/jpeg":"jpg",
        "image/png":"png",
        "image/jpg":"jpg"
    }
    /**
     * Method that prepare each file. 
     * Filter through them. 
     * Give them place on the disk and name.
     * @param useFolder The folder which define place where are images stored.
     * @returns Configured multer instance.
     */
    public getStorage(useFolder:string) {
        return multer({
            fileFilter(req,file,callback){
                if(!file.originalname.match(/\.*(png|jpg|jpeg)$/)){
                    return  callback(new Error('Image is in bad format.'))
                }
                else{
                    callback(null,true)
                }
            },
            storage:multer.diskStorage({
                destination:(req,file,callback)=>{
                    this.existsFolder(__dirname.split('src')[0]+useFolder)
                    callback(null,useFolder)
                },
                filename:(req,file,callback)=>{
                    const extension = this.type[file.mimetype.toString()]
                    callback(null,`${uuidv4()}_${new Date().getTime()}.${extension}`)
                }
            }),
        })
    }
    /**
     * Create folder if it already does not exists.
     * @param path The absolute path to the folder.
     */
    private existsFolder(path:string){
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
    }
}
