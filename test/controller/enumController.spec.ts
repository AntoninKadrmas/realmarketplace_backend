import {after, describe, it} from "mocha";
import {expect} from "chai";
import request from "supertest";
import { Server } from "../../src/server";

describe("Enum controller tests.",()=>{
    const server = new Server()
    const app = server.app
    let listen: { close: () => void; };
    before(async ()=>{
        listen = await server.start()
    })
    after(async ()=>{
        listen.close()
    })
    describe("Price options endpoint get(/enum/price-option)",()=>{
        it('should return list of price options', async function () {
            const res = await request(app).get(`/enum/price-option`)
                .send();
            expect(res.status).to.eq(200)
            expect(res.body.length).to.be.greaterThan(0)
        });
    })
    describe("Condition options endpoint get(/enum/book-condition)",()=>{
        it('should return list of condition options', async function () {
            const res = await request(app).get(`/enum/book-condition`)
                .send();
            expect(res.status).to.eq(200)
            expect(res.body.length).to.be.greaterThan(0)
        });
    })
    describe("Genre types endpoint get(/enum/genre-type)",()=>{
        it('should return list of genre types', async function () {
            const res = await request(app).get(`/enum/genre-type`)
                .send();
            expect(res.status).to.eq(200)
            expect(res.body.length).to.be.greaterThan(0)
        });
    })
})
