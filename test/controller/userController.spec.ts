import { describe, it } from "mocha";
import {expect} from "chai";
import request from "supertest";
import { HeadersTools } from "../tools/headersTools";
import { defaultUser } from "../tools/globalTool";
import { DBConnection } from "../../src/db/dbConnection";
import { Server } from "../../src/server";

describe("User controller tests.",()=>{
    const server = new Server()
    const app = server.app
    let userToken = ""
    before(async ()=>{
        const value = DBConnection.getInstance()
        await value.getDbClient()
        await server.start()
    })
    describe("Register user endpoint post(/user/register)",()=>{
        it("Create new user",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/register`)
                    .set(HeadersTools.getAuthHeader(user.email,user.password!))
                    .send(user);
            console.log(res.body)
            expect(res.status).to.be.eq(200);
            expect(res.body.token).to.length(24)
            userToken=res.body.token
        })
        // it("Try to create a user with the same email.",async ()=>{
        //     const user = defaultUser
        //     const res = await request(app).post(`/user/register`)
        //             .set(HeadersTools.getAuthHeader(user.email,user.password!))
        //             .send(user);
        //     console.log(res.body)
        //     expect(res.status).to.be.eq(400);
        //     expect(res.body.error).to.eq("User with same Email Address already exists.")
        //     userToken=res.body.token
        // })
    })
    // describe("Delete user endpoint delete(/user)",()=>{
    //     it("Create new user",async ()=>{
    //         const user = defaultUser
    //         const res = await request(app).post(`/user/register`)
    //                 .set(HeadersTools.getAuthHeader(user.email,user.password!))
    //                 .send(user);
    //         expect(res.status).to.be.eq(200);
    //         expect(res.body.token).to.length(24)
    //         userToken=res.body.token
    //     })
    // })
})
