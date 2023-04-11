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
exports.ImageMiddleWare = void 0;
const multer_1 = __importDefault(require("multer"));
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
dotenv.config();
class ImageMiddleWare {
    constructor() {
        this.type = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/jpg": "jpg"
        };
    }
    getStorage(useFolder) {
        return (0, multer_1.default)({
            fileFilter(req, file, callback) {
                if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
                    return callback(new Error('Image is in bad format.'));
                }
                else {
                    callback(null, true);
                }
            },
            storage: multer_1.default.diskStorage({
                destination: (req, file, callback) => {
                    this.existsFolder(__dirname.split('src')[0] + useFolder);
                    callback(null, useFolder);
                },
                filename: (req, file, callback) => {
                    const extension = this.type[file.mimetype.toString()];
                    callback(null, `${(0, uuid_1.v4)()}_${new Date().getTime()}.${extension}`);
                }
            }),
        });
    }
    existsFolder(path) {
        if (!fs_1.default.existsSync(path)) {
            fs_1.default.mkdirSync(path);
        }
    }
}
exports.ImageMiddleWare = ImageMiddleWare;
