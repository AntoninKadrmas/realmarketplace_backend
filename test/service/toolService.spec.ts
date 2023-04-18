import {before} from "mocha";
import {ToolService} from "../../src/service/toolService";
import {expect} from "chai";

describe("Tool service unit tests",()=>{
    let toolService:ToolService
    before(()=>{
        toolService = new ToolService()
    })
    describe("Valid string function",()=>{
        it("should return false -> null",()=>{
            const result = toolService.validString(null)
            expect(result).to.be.false;
        })
        it("should return false -> undefined",()=>{
            const result = toolService.validString(undefined)
            expect(result).to.be.false;
        })
        it("should return false -> ''",()=>{
            const result = toolService.validString('')
            expect(result).to.be.false;
        })
        it("should return false -> 99",()=>{
            const result = toolService.validString(99)
            expect(result).to.be.false;
        })
        it("should return false -> {}",()=>{
            const result = toolService.validString({})
            expect(result).to.be.false;
        })
        it("should return true -> 'string'",()=>{
            const result = toolService.validString("string")
            expect(result).to.be.true;
        })
    })
    describe("Valid number function",()=>{
        it("should return false -> null",()=>{
            const result = toolService.validNumber(null)
            expect(result).to.be.false;
        })
        it("should return false -> undefined",()=>{
            const result = toolService.validNumber(undefined)
            expect(result).to.be.false;
        })
        it('should return false -> "string"',()=>{
            const result = toolService.validNumber("string")
            expect(result).to.be.false;
        })
        it("should return false -> '99'",()=>{
            const result = toolService.validNumber('99')
            expect(result).to.be.true;
        })
        it("should return true -> 99",()=>{
            const result = toolService.validNumber(99)
            expect(result).to.be.true;
        })
        it("should return true -> -99",()=>{
            const result = toolService.validNumber(-99)
            expect(result).to.be.true;
        })
        it("should return true -> 99.99",()=>{
            const result = toolService.validNumber(99.99)
            expect(result).to.be.true;
        })
    })
    describe("Valid email function",()=>{
        it('should return false -> null', function () {
            const  result = toolService.validEmail(null)
            expect(result).to.be.false
        });
        it('should return false -> undefined', function () {
            const  result = toolService.validEmail(undefined)
            expect(result).to.be.false
        });
        it('should return false -> ""', function () {
            const  result = toolService.validEmail("")
            expect(result).to.be.false
        });
        it('should return false -> 99', function () {
            const  result = toolService.validEmail(99)
            expect(result).to.be.false
        });
        it('should return false -> "jan.novak"', function () {
            const  result = toolService.validEmail("jan.novak")
            expect(result).to.be.false
        });
        it('should return false -> "jan.novak@"', function () {
            const  result = toolService.validEmail("jan.novak@")
            expect(result).to.be.false
        });
        it('should return false -> "jan.novak@gmail"', function () {
            const  result = toolService.validEmail("jan.novak@gmail")
            expect(result).to.be.false
        });
        it('should return false -> "jan.novak@gmail."', function () {
            const  result = toolService.validEmail("jan.novak@gmail.")
            expect(result).to.be.false
        });
        it('should return false -> "@gmail.com"', function () {
            const  result = toolService.validEmail("@gmail.com")
            expect(result).to.be.false
        });
        it('should return false -> "jan.$novak@gmail.com"', function () {
            const  result = toolService.validEmail("jan.$novak@gmail.com")
            expect(result).to.be.false
        });
        it('should return false -> "jan.novak@gmail.:com"', function () {
            const  result = toolService.validEmail("jan.novak@gmail.:com")
            expect(result).to.be.false
        });
        it('should return false -> "jan.novak@gm@ail.com"', function () {
            const  result = toolService.validEmail("jan.novak@gm@ail.com")
            expect(result).to.be.false
        });
        it('should return true -> "jan.novak@gmail.com"', function () {
            const  result = toolService.validEmail("jan.novak@gmail.com")
            expect(result).to.be.true
        });
    })
    describe("Valid length function",()=>{
        it('should return false -> null', function () {
            const  result = toolService.validLength(null)
            expect(result).to.be.false
        });
        it('should return false -> undefined', function () {
            const  result = toolService.validLength(undefined)
            expect(result).to.be.false
        });
        it('should return true -> 100', function () {
            const  result = toolService.validLength(100)
            expect(result).to.be.true
        });
        it('should return true -> 100, min 1, max 4', function () {
            const  result = toolService.validLength(100,1,4)
            expect(result).to.be.true
        });
        it('should return true -> 100, min 3, max 3', function () {
            const  result = toolService.validLength(100,3,3)
            expect(result).to.be.true
        });
        it('should return false -> 100, min 4, max 4', function () {
            const  result = toolService.validLength(100,4,4)
            expect(result).to.be.false
        });
        it('should return false -> 100, min 2, max 2', function () {
            const  result = toolService.validLength(100,2,2)
            expect(result).to.be.false
        });
        it('should return false -> 100, min 4, max 1', function () {
            const  result = toolService.validLength(100,4,1)
            expect(result).to.be.false
        });
    })
    describe("Valid password function",()=>{
        it('should return false -> null', function () {
            const  result = toolService.validPassword(null)
            expect(result).to.be.false
        });
        it('should return false -> undefined', function () {
            const  result = toolService.validPassword(undefined)
            expect(result).to.be.false
        });
        it('should return false lower than eight characters -> "Pa143!"', function () {
            const  result = toolService.validPassword("Pa143!")
            expect(result).to.be.false
        });
        it('should return false not a special character -> "Pass143431"', function () {
            const  result = toolService.validPassword("Pass143431")
            expect(result).to.be.false
        });
        it('should return false not uppercase letters -> "pass143!"', function () {
            const  result = toolService.validPassword("pass143!")
            expect(result).to.be.false
        });
        it('should return false not lowercase letters -> "PASS143!"', function () {
            const  result = toolService.validPassword("pass143!")
            expect(result).to.be.false
        });
        it('should return false not digits -> "PASSpass!"', function () {
            const  result = toolService.validPassword("PASSpass!")
            expect(result).to.be.false
        });
        it('should return false invalid special character-> "Pass143:"', function () {
            const  result = toolService.validPassword("Pass143:")
            expect(result).to.be.false
        });
        it('should return true -> "Pass143!"', function () {
            const  result = toolService.validPassword("Pass143!")
            expect(result).to.be.true
        });
    })
})