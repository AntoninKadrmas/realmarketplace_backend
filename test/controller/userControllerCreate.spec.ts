import { describe, it } from "mocha";
import {expect} from "chai";
import request from "supertest";
const app =  require("../../src/server");
import { HeadersTools } from "../tools/headersTools";

describe("Login default user to get validation token.",()=>{
    it("Create new user",async ()=>{
        const user = HeadersTools.defaultUser
        const res = await request.agent(app).post(`/user/register`)
                .set(HeadersTools.getAuthHeader(user.email,user.password!))
                .send(user);
        expect(res.status).to.be.eq(200);
        expect(res.body.token).to.length(24)
        HeadersTools.userToken=res.body.token
    })
})

