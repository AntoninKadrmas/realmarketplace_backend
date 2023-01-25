// Importing module
import express from 'express';
import {DbController} from "./controller/dbController";
const bodyparser = require('body-parser')
// const cors = require('cors')
const app = express();
const PORT:Number=3000;
// app.use(cors())
app.use(bodyparser.json())
// Server setup
const controller = new DbController()
app.use('',controller.router);
app.listen(PORT,() => {
    console.log('The application is listening '
        + 'on port http://localhost:'+PORT);
})