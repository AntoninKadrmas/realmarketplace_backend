import {after, describe, it} from "mocha";
import {expect} from "chai";
import request from "supertest";
import { HeadersTools } from "../tools/headersTools";
import { defaultUser } from "../tools/globalTool";
import { DBConnection } from "../../src/db/dbConnection";
import { Server } from "../../src/server";
import {ToolService} from "../../src/service/toolService";
import {LightUser} from "../../src/model/userModel";

describe("User controller tests.",()=>{
    const tools = new ToolService()
    const server = new Server()
    const app = server.app
    let userToken = ""
    let listen: { close: () => void; };
    before(async ()=>{
        const value = DBConnection.getInstance()
        await value.getDbClient()
        listen = await server.start()
    })
    after(async ()=>{
        listen.close()
    })
    describe("Register user endpoint post(/user/register)",()=>{
        it("should not create new user without user in body",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/register`)
                .set(HeadersTools.getAuthHeader(user.email,user.password!))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Body does not contains user model.")
        })
        it("should not create new user without Authorization header",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/register`)
                .send(user);
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Missing credential header.")
        })
        it("should not create new user with invalid password.",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/register`)
                .set(HeadersTools.getAuthHeader(user.email,"error"))
                .send(user);
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Invalid user model format.")
        })
        it("should not create new user with invalid email.",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/register`)
                .set(HeadersTools.getAuthHeader("error",user.password!))
                .send(user);
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Invalid user model format.")
        })
        it("should create new user",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/register`)
                    .set(HeadersTools.getAuthHeader(user.email,user.password!))
                    .send(user);
            expect(res.status).to.be.eq(200);
            expect(res.body.token).to.length(24)
            userToken=res.body.token
        })
        it("should not create a user with the same email.",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/register`)
                    .set(HeadersTools.getAuthHeader(user.email,user.password!))
                    .send(user);
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("User with same Email Address already exists.")
        })
    })
    describe("Login user endpoint post(/user/login)",()=>{
        it("should not login user without Authorization header",async ()=>{
            const res = await request(app).post(`/user/login`)
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Missing credential header.")
        })
        it("should not login user invalid email",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/login`)
                .set(HeadersTools.getAuthHeader("error",user.password!))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Invalid user email format.")
        })
        it("should not login user invalid password",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/login`)
                .set(HeadersTools.getAuthHeader(user.email,"error"))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Invalid user password format.")
        })
        it("should not login user incorrect email",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/login`)
                .set(HeadersTools.getAuthHeader(`error${user.email}`,user.password!))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Nor user exists with this Email Address.")
        })
        it("should not login user incorrect password",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/login`)
                .set(HeadersTools.getAuthHeader(user.email,`${user.password}error`))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Incorrect password.")
        })
        it("should login user",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user/login`)
                .set(HeadersTools.getAuthHeader(user.email,user.password!))
                .send();
            expect(res.status).to.be.eq(200);
            expect(res.body.token).to.length(24)
            userToken=res.body.token
        })
    })
    describe("Get user by id get(/user)",()=>{
        it("should not get user incorrect user token.",async ()=>{
            const res = await request(app).delete(`/user`)
                .set(HeadersTools.getTokenHeader("error"))
                .send();
            expect(res.status).to.be.eq(401);
            expect(res.body.error).to.eq("Incorrect token.")
        })
        it("should not delete old user incorrect user token.",async ()=>{
            const res = await request(app).get(`/user`)
                .set(HeadersTools.getTokenHeader(userToken))
                .send();
            const user = res.body as LightUser
            console.log(res.body)
            expect(res.status).to.be.eq(200);
            expect(user.email).to.eq(defaultUser.email)
            expect(user.phone).to.eq(defaultUser.phone)
            expect(user.firstName).to.eq(defaultUser.firstName)
            expect(user.lastName).to.eq(defaultUser.lastName)
            expect(user.mainImageUrl).to.eq(defaultUser.mainImageUrl)
            expect(user.validated).to.deep.eq(defaultUser.validated)
            defaultUser.createdIn=user.createdIn
            expect(tools.validUser(user,true)).to.be.true;
        })
    })
    describe("Update user password post(/user)",()=>{
        it("should not update user password missing Authorization header.",async ()=>{
            const res = await request(app).post(`/user`)
                .set(HeadersTools.getTokenHeader(userToken))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Missing credential header.")
        })
        it("should not update user password invalid new password.",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,user.password!,"error"))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Invalid new password format.")
        })
        it("should not update user password invalid old password.",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,"error",user.password!))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Invalid old password format.")
        })
        it("should not update user password incorrect old password.",async ()=>{
            const user = defaultUser
            const res = await request(app).post(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,user.password!+"error",user.password!))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Incorrect password.")
        })
        it("should update user password.",async ()=>{
            const user = defaultUser
            const newPassword = user.password!+"_new"
            const res = await request(app).post(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,user.password!,newPassword))
                .send();
            expect(res.status).to.be.eq(200);
            expect(res.body.success).to.eq("User password successfully updated.")
            defaultUser.password=newPassword
        })
    })
    describe("Delete user endpoint delete(/user)",()=>{
        it("should not delete old user missing Authorization header.",async ()=>{
            const res = await request(app).delete(`/user`)
                .set(HeadersTools.getTokenHeader(userToken))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Missing credential header.")
        })
        it("should not delete old user invalid password.",async ()=>{
            const res = await request(app).delete(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,"error",""))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Invalid user password.")
        })
        it("should not delete old user incorrect password.",async ()=>{
            const user = defaultUser
            const res = await request(app).delete(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,user.password+"error",""))
                .send();
            expect(res.status).to.be.eq(400);
            expect(res.body.error).to.eq("Incorrect password.")
        })
        it("should delete old user.",async ()=>{
            const user = defaultUser
            const res = await request(app).delete(`/user`)
                    .set(HeadersTools.getAuthHeaderWithToken(userToken,user.password!,""))
                    .send();
            expect(res.status).to.be.eq(200);
            expect(res.body.success).to.eq("User was successfully deleted.")
        })
        it("should not delete already deleted user",async ()=>{
            const user = defaultUser
            const res = await request(app).delete(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,user.password!,""))
                .send();
            expect(res.status).to.be.eq(401);
            expect(res.body.error).to.eq("Token expired.")
        })
    })
})
