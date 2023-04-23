import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import handlebars from 'handlebars';

export class EmailService{
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>
    htmlResetPassword:string=""

    constructor() {
        dotenv.config();
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
                auth: {
                    user: 'realmarketplaceoriginal@gmail.com',
                    pass: process.env.EMAIL_PASSWORD
                }
        });
        this.loadHtml().then()
    }
    async loadHtml(){
        this.htmlResetPassword = await this.getHtmlFile("restartLoginCredential.html")
    }
    async sendEmailForgetPassword(to:String):Promise<{success:string,password:string}|{error:string}>{
        try{
            let newHtml = this.htmlResetPassword.toString()
            const newPassword = `Pas_${uuidv4().replaceAll('-','_')}_!`
            newHtml = newHtml.replace('value_that_would_be_replaced_wit_password',newPassword.toString())
            const mailOptions = {
                from: 'realmarketplaceoriginal@gmail.com',
                to: to,
                subject: "Recover password.",
                html: newHtml
            };
            // @ts-ignore
            await this.transporter.sendMail(mailOptions)
            return {success:"Email successfully sent.",password:newPassword.toString()}
        }catch (e) {
            console.log(e)
            return {error:"Error during sending the email."}
        }
    }
    private async getHtmlFile(email:string):Promise<string>{
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname.split("service")[0], "email", email), function (error, html) {
                if (error) {
                    throw ReferenceError(`Html ${email} does not exists.`)
                }
                resolve(html.toString())
            });
        })
    }
}