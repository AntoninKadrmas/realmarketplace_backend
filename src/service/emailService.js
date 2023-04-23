"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
class EmailService {
    constructor() {
        this.htmlResetPassword = "";
        dotenv.config();
        this.transporter = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'realmarketplaceoriginal@gmail.com',
                pass: process.env.EMAIL_PASSWORD
            }
        });
        this.loadHtml().then();
    }
    async loadHtml() {
        this.htmlResetPassword = await this.getHtmlFile("restartLoginCredential.html");
    }
    async sendEmailForgetPassword(to) {
        try {
            let newHtml = this.htmlResetPassword.toString();
            const newPassword = `Pas_${(0, uuid_1.v4)().toString().replaceAll('-', '_')}_!`;
            newHtml = newHtml.replace('value_that_would_be_replaced_wit_password', newPassword.toString());
            const mailOptions = {
                from: 'realmarketplaceoriginal@gmail.com',
                to: to,
                subject: "Recover password.",
                html: newHtml
            };
            // @ts-ignore
            await this.transporter.sendMail(mailOptions);
            return { success: "Email successfully sent.", password: newPassword.toString() };
        }
        catch (e) {
            console.log(e);
            return { error: "Error during sending the email." };
        }
    }
    async getHtmlFile(email) {
        return new Promise((resolve, reject) => {
            fs_1.default.readFile(path_1.default.join(__dirname.split("service")[0], "email", email), function (error, html) {
                if (error) {
                    throw ReferenceError(`Html ${email} does not exists.`);
                }
                resolve(html.toString());
            });
        });
    }
}
exports.EmailService = EmailService;
