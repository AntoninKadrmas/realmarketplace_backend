import { describe, it } from "mocha";
import {expect} from "chai";
import request from "supertest";
const app = require("../../src/server");
import { HeadersTools } from "../tools/headersTools";

describe("Login default user to get validation token.",()=>{
    it("Create new user",async ()=>{
        const res = await request(app).get(`/`)
                .set(HeadersTools.getTokenHeader())
                .send();
        expect(false).to.be.false;
    })
})

