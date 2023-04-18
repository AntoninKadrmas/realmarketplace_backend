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
const stringIndexAdvert_1 = require("./service/stringIndexAdvert");
const advertSearchService_1 = require("./service/advertSearchService");
const mongoSanitize = require("express-mongo-sanitize");
const toolService_1 = require("./service/toolService");
dotenv.config();
/**
 * Server class take care of server initialization.
 */
class Server {
    /**
     * Set all important modules used in express module and rewrite console lop function so now it work as logger.
     */
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use(require('body-parser').json());
        this.app.use((0, cors_1.default)());
        this.app.use(mongoSanitize({
            allowDots: true,
            onSanitize: ({ req, key }) => {
                console.log(`This request[${key}] is sanitized => ${req}`);
            },
        }));
        let log_file;
        console.log = function (d) {
            const actualDate = new Date();
            const date = `${actualDate.getFullYear()}_${actualDate.getMonth()}_${actualDate.getDate()}`;
            const folder = `${__dirname.split('src')[0]}${process.env.FOLDER_LOGS != undefined ? process.env.FOLDER_LOGS : "debug"}`;
            const path = `${folder}/${date}.log`;
            if (fs_1.default.existsSync(path)) {
                if (!log_file)
                    log_file = fs_1.default.createWriteStream(path, { flags: 'a' });
                log_file.write(`[${new Date()}] ${util_1.default.format(d) + '\n'}`);
            }
            else {
                if (!fs_1.default.existsSync(folder))
                    fs_1.default.mkdirSync(`${folder}`);
                log_file = fs_1.default.createWriteStream(path, { flags: 'a' });
                log_file.write(`[${new Date()}] ${util_1.default.format(d) + '\n'}`);
            }
        };
        this.setIndex().then();
    }
    /**
     * Create search index if it is not already exists.
     * @private
     */
    async setIndex() {
        const stringIndex = new stringIndexAdvert_1.StringIndexAdvert();
        await stringIndex.setSearchIndex();
    }
    /**
     * Set main controllers router and path to app.
     * @private
     */
    setControllers() {
        const userController = new userController_1.UserController(new userService_1.UserService(), new tokenService_1.TokenService(), new toolService_1.ToolService());
        const enumControl = new enumController_1.EnumController();
        const advertController = new advertController_1.AdvertController(new advertService_1.AdvertService(), new advertSearchService_1.AdvertSearchService(), new toolService_1.ToolService());
        this.app.use(userController.path, userController.router);
        this.app.use(enumControl.path, enumControl.router);
        this.app.use(advertController.path, advertController.router);
    }
    /**
     * Start node js backend application on port 3000.
     */
    async start() {
        this.setControllers();
        return this.app.listen(process.env.PORT != undefined ? parseInt(process.env.PORT) : 3000);
    }
}
exports.Server = Server;
