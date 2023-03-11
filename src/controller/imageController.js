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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const express_1 = __importDefault(require("express"));
const imageMiddleware_1 = require("../middleware/imageMiddleware");
const dotenv = __importStar(require("dotenv"));
const path = require('path');
const fs_1 = __importDefault(require("fs"));
dotenv.config();
class ImageController {
    constructor() {
        this.path = '/image';
        this.router = express_1.default.Router();
        this.uploadImagePublic = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.files == undefined)
                res.status(401).send();
            else {
                try {
                    //@ts-ignore 
                    for (let file of req.files) {
                        const imageUrl = `${this.path}/${file.filename}`;
                        const dirUrl = __dirname.split('src')[0] + "public/" + file.filename;
                        if (!fs_1.default.existsSync(dirUrl)) {
                            res.status(401).send();
                        }
                    }
                }
                catch (_a) {
                    res.status(401).send();
                }
            }
            res.status(200).send();
        });
        this.uploadImagePrivate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const imageUrl = `${this.path}/${(_b = req.file) === null || _b === void 0 ? void 0 : _b.filename}`;
            console.log(imageUrl);
        });
        this.initRouter();
    }
    initRouter() {
        const upload_public = new imageMiddleware_1.ImageMiddleWare().getStorage(true);
        const upload_private = new imageMiddleware_1.ImageMiddleWare().getStorage(false);
        this.router.post('/public', upload_public.array('uploaded_file', 10), this.uploadImagePublic);
        this.router.post('/private', upload_private.array('uploaded_file', 10), this.uploadImagePrivate);
        this.router.use(express_1.default.static(path.join(__dirname.split('src')[0], process.env.IMAGE_PUBLIC)));
    }
}
exports.ImageController = ImageController;
