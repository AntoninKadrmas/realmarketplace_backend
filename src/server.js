"use strict";
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
// Importing module
const express_1 = __importDefault(require("express"));
const userController_1 = require("./controller/userController");
const userService_1 = require("./service/userService");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use(require('body-parser').json());
    }
    setControllers() {
        const userController = new userController_1.UserController(new userService_1.UserService());
        this.app.use(userController.path, userController.router);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            require('dotenv').config();
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
