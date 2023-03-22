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
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const userController_1 = require("./controller/userController");
const userService_1 = require("./service/userService");
const enumController_1 = require("./controller/enumController");
const dotenv = __importStar(require("dotenv"));
const tokenService_1 = require("./service/tokenService");
const advertService_1 = require("./service/advertService");
const advertController_1 = require("./controller/advertController");
class Server {
    constructor() {
        dotenv.config();
        this.app = (0, express_1.default)();
        this.app.use(require('body-parser').json());
        this.app.use((0, cors_1.default)());
        var log_file = fs_1.default.createWriteStream(__dirname + '/debug.log', { flags: 'a' });
        console.log = function (d) {
            log_file.write(`[${new Date()}] ${util_1.default.format(d) + '\n'}`);
        };
    }
    setControllers() {
        const userController = new userController_1.UserController(new userService_1.UserService(), new tokenService_1.TokenService());
        const enumControl = new enumController_1.EnumController();
        const advertController = new advertController_1.AdvertController(new advertService_1.AdvertService());
        this.app.use(userController.path, userController.router);
        this.app.use(enumControl.path, enumControl.router);
        this.app.use(advertController.path, advertController.router);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setControllers();
            this.app.listen(process.env.PORT, () => {
                console.log('The application is listening '
                    + 'on port http://localhost:' + process.env.PORT);
            });
        });
    }
}
exports.Server = Server;
new Server().start();
