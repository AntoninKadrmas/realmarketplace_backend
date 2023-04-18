import {after, describe, it} from "mocha";
import {expect, use} from "chai";
import request from "supertest";
import { HeadersTools } from "../tools/headersTools";
import {defaultAdvert, defaultUser} from "../tools/defaultModels";
import { DBConnection } from "../../src/db/dbConnection";
import { Server } from "../../src/server";
import fs from "fs";
import path from "path";

describe("Advert controller tests.",()=>{
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
    describe("Create user",()=>{
        it("should create user",async ()=>{
            const user = {...defaultUser}
            const res = await request(app).post(`/user/register`)
                .set(HeadersTools.getAuthHeader(user.email,user.password!))
                .send(user);
            expect(res.status).to.be.eq(200);
            expect(res.body.token).to.length(24)
            userToken=res.body.token
        })
    })
    describe("Create advert post(/advert)",()=>{
        it("should create advert",async ()=>{
            const advert = defaultAdvert
            const res = await request(app).post(`/advert`)
                .set(HeadersTools.getTokenHeader(userToken))
                .attach("uploaded_file",fs.readFileSync(path.join(__dirname.split("controller")[0],"resources","profileImage.jpeg")),
                    {filename:"profileImage.jpeg",contentType:"image/jpeg"})
                .attach("title",advert.title,{contentType:"text/plain"})
                .attach("author",advert.author,{contentType:"text/plain"})
                .attach("description",advert.description,{contentType:"text/plain"})
                .attach("genreName",advert.genreName,{contentType:"text/plain"})
                .attach("genreType",advert.genreType,{contentType:"text/plain"})
                .attach("priceOption",advert.priceOption,{contentType:"text/plain"})
                .attach("condition",advert.condition,{contentType:"text/plain"})
            expect(res.status).to.eq(200);
            expect(res.body.success).to.eq("User advert successfully created.")
        })
    })
    describe("Delete user",()=>{
        it("should delete user.",async ()=>{
            const user = {...defaultUser}
            const res = await request(app).delete(`/user`)
                .set(HeadersTools.getAuthHeaderWithToken(userToken,user.password!,""))
                .send();
            expect(res.status).to.be.eq(200);
            expect(res.body.success).to.eq("User was successfully deleted.")
        })
    })
})