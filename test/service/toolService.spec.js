"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const toolService_1 = require("../../src/service/toolService");
const chai_1 = require("chai");
describe("Tool service unit tests", () => {
    let toolService;
    (0, mocha_1.before)(() => {
        toolService = new toolService_1.ToolService();
    });
    describe("Valid string function", () => {
        it("should return false -> null", () => {
            const result = toolService.validString(null);
            (0, chai_1.expect)(result).to.be.false;
        });
        it("should return false -> undefined", () => {
            const result = toolService.validString(undefined);
            (0, chai_1.expect)(result).to.be.false;
        });
        it("should return false -> ''", () => {
            const result = toolService.validString('');
            (0, chai_1.expect)(result).to.be.false;
        });
        it("should return false -> 99", () => {
            const result = toolService.validString(99);
            (0, chai_1.expect)(result).to.be.false;
        });
        it("should return false -> {}", () => {
            const result = toolService.validString({});
            (0, chai_1.expect)(result).to.be.false;
        });
        it("should return true -> 'string'", () => {
            const result = toolService.validString("string");
            (0, chai_1.expect)(result).to.be.true;
        });
    });
    describe("Valid number function", () => {
        it("should return false -> null", () => {
            const result = toolService.validNumber(null);
            (0, chai_1.expect)(result).to.be.false;
        });
        it("should return false -> undefined", () => {
            const result = toolService.validNumber(undefined);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "string"', () => {
            const result = toolService.validNumber("string");
            (0, chai_1.expect)(result).to.be.false;
        });
        it("should return false -> '99'", () => {
            const result = toolService.validNumber('99');
            (0, chai_1.expect)(result).to.be.true;
        });
        it("should return true -> 99", () => {
            const result = toolService.validNumber(99);
            (0, chai_1.expect)(result).to.be.true;
        });
        it("should return true -> -99", () => {
            const result = toolService.validNumber(-99);
            (0, chai_1.expect)(result).to.be.true;
        });
        it("should return true -> 99.99", () => {
            const result = toolService.validNumber(99.99);
            (0, chai_1.expect)(result).to.be.true;
        });
    });
    describe("Valid email function", () => {
        it('should return false -> null', function () {
            const result = toolService.validEmail(null);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> undefined', function () {
            const result = toolService.validEmail(undefined);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> ""', function () {
            const result = toolService.validEmail("");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> 99', function () {
            const result = toolService.validEmail(99);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "jan.novak"', function () {
            const result = toolService.validEmail("jan.novak");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "jan.novak@"', function () {
            const result = toolService.validEmail("jan.novak@");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "jan.novak@gmail"', function () {
            const result = toolService.validEmail("jan.novak@gmail");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "jan.novak@gmail."', function () {
            const result = toolService.validEmail("jan.novak@gmail.");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "@gmail.com"', function () {
            const result = toolService.validEmail("@gmail.com");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "jan.$novak@gmail.com"', function () {
            const result = toolService.validEmail("jan.$novak@gmail.com");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "jan.novak@gmail.:com"', function () {
            const result = toolService.validEmail("jan.novak@gmail.:com");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "jan.novak@gm@ail.com"', function () {
            const result = toolService.validEmail("jan.novak@gm@ail.com");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return true -> "jan.novak@gmail.com"', function () {
            const result = toolService.validEmail("jan.novak@gmail.com");
            (0, chai_1.expect)(result).to.be.true;
        });
    });
    describe("Valid length function", () => {
        it('should return false -> null', function () {
            const result = toolService.validLength(null);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> undefined', function () {
            const result = toolService.validLength(undefined);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return true -> 100', function () {
            const result = toolService.validLength(100);
            (0, chai_1.expect)(result).to.be.true;
        });
        it('should return true -> 100, min 1, max 4', function () {
            const result = toolService.validLength(100, 1, 4);
            (0, chai_1.expect)(result).to.be.true;
        });
        it('should return true -> 100, min 3, max 3', function () {
            const result = toolService.validLength(100, 3, 3);
            (0, chai_1.expect)(result).to.be.true;
        });
        it('should return false -> 100, min 4, max 4', function () {
            const result = toolService.validLength(100, 4, 4);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> 100, min 2, max 2', function () {
            const result = toolService.validLength(100, 2, 2);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> 100, min 4, max 1', function () {
            const result = toolService.validLength(100, 4, 1);
            (0, chai_1.expect)(result).to.be.false;
        });
    });
    describe("Valid password function", () => {
        it('should return false -> null', function () {
            const result = toolService.validPassword(null);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> undefined', function () {
            const result = toolService.validPassword(undefined);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false lower than eight characters -> "Pa143!"', function () {
            const result = toolService.validPassword("Pa143!");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false not a special character -> "Pass143431"', function () {
            const result = toolService.validPassword("Pass143431");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false not uppercase letters -> "pass143!"', function () {
            const result = toolService.validPassword("pass143!");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false not lowercase letters -> "PASS143!"', function () {
            const result = toolService.validPassword("pass143!");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false not digits -> "PASSpass!"', function () {
            const result = toolService.validPassword("PASSpass!");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false invalid special character-> "Pass143:"', function () {
            const result = toolService.validPassword("Pass143:");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return true -> "Pass143!"', function () {
            const result = toolService.validPassword("Pass143!");
            (0, chai_1.expect)(result).to.be.true;
        });
    });
    describe("Valid boolean function", () => {
        it('should return false -> null', function () {
            const result = toolService.validBoolean(null);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> undefined', function () {
            const result = toolService.validBoolean(undefined);
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> ""', function () {
            const result = toolService.validBoolean("");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return false -> "tru"', function () {
            const result = toolService.validBoolean("tru");
            (0, chai_1.expect)(result).to.be.false;
        });
        it('should return true -> "fals"', function () {
            const result = toolService.validBoolean("fals");
            (0, chai_1.expect)(result).to.be.true;
        });
        it('should return true -> "false"', function () {
            const result = toolService.validBoolean("false");
            (0, chai_1.expect)(result).to.be.true;
        });
        it('should return true -> "true"', function () {
            const result = toolService.validBoolean("true");
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
