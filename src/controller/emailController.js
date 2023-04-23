"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
class EmailController {
    constructor(emailService, userService, toolService) {
        this.emailService = emailService;
        this.userService = userService;
        this.toolService = toolService;
        this.path = "/email";
        this.router = express_1.default.Router();
        this.passwordRecovery = async (req, res) => {
            try {
                const email = req.query.email?.toString();
                if (!this.toolService.validEmail(email))
                    res.status(400).send({ error: "Invalid user email format." });
                else {
                    let result = await this.userService.getUserByEmail(email);
                    if (!result)
                        res.status(400).send({ error: "Nor user exists with this Email Address." });
                    else {
                        const user = result;
                        const userId = new mongodb_1.ObjectId(user._id.toString());
                        const response = await this.emailService.sendEmailForgetPassword(user.email);
                        if (response.hasOwnProperty("error"))
                            res.status(400).send(response);
                        else {
                            const success = response;
                            const response2 = await this.userService.addTemporaryPasswordToUser(userId, success.password);
                            if (response2.hasOwnProperty("error"))
                                res.status(400).send(response2);
                            else
                                res.status(200).send({ "success": success.success });
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
                return res.status(400).send({ error: "Database dose not response." });
            }
        };
        this.initRouter();
    }
    initRouter() {
        this.router.post("/passwordRecovery", this.passwordRecovery);
    }
}
exports.EmailController = EmailController;
