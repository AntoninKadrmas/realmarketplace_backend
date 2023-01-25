"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing module
const express_1 = __importDefault(require("express"));
const dbController_1 = require("./controller/dbController");
const bodyparser = require('body-parser');
// const cors = require('cors')
const app = (0, express_1.default)();
const PORT = 3000;
// app.use(cors())
app.use(bodyparser.json());
// Server setup
const controller = new dbController_1.DbController();
app.use('', controller.router);
app.listen(PORT, () => {
    console.log('The application is listening '
        + 'on port http://localhost:' + PORT);
});
