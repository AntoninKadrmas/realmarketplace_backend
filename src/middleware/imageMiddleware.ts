import multer from "multer";
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
dotenv.config();
export class ImageMiddleWare{
    type:{ [id: string] : string; }=  {
        "image/jpeg":"jpg",
        "image/png":"png",
        "image/jpg":"jpg"
    }
    public getStorage() {
        return multer({
            fileFilter(req,file,callback){
                if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
                    return  callback(new Error('Image is in bad format.'))
                }
                else{
                    callback(null,true)
                }
            },
            storage:multer.diskStorage({
                destination:(req,file,callback)=>{
                    const publicFolder:string = process.env.IMAGE_PUBLIC!=undefined?process.env.IMAGE_PUBLIC:"public"
                    const privateFolder:string  = process.env.IMAGE_PRIVATE!=undefined?process.env.IMAGE_PRIVATE:"private"
                    const useFolder = publicFolder?publicFolder:privateFolder
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
    private existsFolder(path:string){
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
    }
}
