import { describe, it } from "mocha";
import {expect} from "chai";
import request from "supertest";
import { HeadersTools } from "../tools/headersTools";
import { Server } from "../../src/server";

const app = new Server()
app.start()
describe("Login default user to get validation token.",()=>{
    it("Create new user",async ()=>{
        const user = HeadersTools.defaultUser
        const res = await request.agent(app.app).post(`/user/register`)
                .set(HeadersTools.getAuthHeader(user.email,user.password!))
                .send(user);
        expect(res.status).to.be.eq(200);
        expect(res.body.token).to.length(24)
        HeadersTools.userToken=res.body.token
    })
})

