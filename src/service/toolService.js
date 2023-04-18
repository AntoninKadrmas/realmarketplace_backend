"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ToolService {
    /**
     * Delete files by its name in public folder.
     * @param imagesUrls Name of all image files that have to be deleted if exists.
     * @param folder Folder string where would be image files deleted
     */
    deleteFiles(imagesUrls, folder) {
        for (let image of imagesUrls) {
            image = image.replace("/", "");
            const oldDirUrl = path_1.default.join(__dirname.split('src')[0], folder, image);
            if (fs_1.default.existsSync(oldDirUrl))
                fs_1.default.unlink(oldDirUrl, (err) => {
                    console.log(err);
                });
        }
    }
    /**
     * True if given string exists.
     * @param value String that would be tested
     * @returns Boolean value true if string exists else false.
     */
    validString(value) {
        return value != null &&
            value != undefined &&
            value != "" &&
            typeof (value) == "string";
    }
    /**
     * True if given email address is correct.
     * @param email Email address that would be tested
     * @returns Boolean value true if email address is correct else false.
     */
    validEmail(email) {
        try {
            return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
        }
        catch (e) {
            return false;
        }
    }
    /**
     * True if given number exists.
     * @param number Number that would be tested
     * @returns Boolean value true if number is valid else false.
     */
    validNumber(number) {
        try {
            let value = parseFloat(number);
            return Number.isFinite(value);
        }
        catch (e) {
            return false;
        }
    }
    /**
     * True if given number exists.
     * @param value Value which length would be tested
     * @param minLength The minimum length of the number
     * @param maxLength The maximum length of the number
     * @returns Boolean value true if number is valid else false.
     */
    validLength(value, minLength = -1, maxLength = -1) {
        try {
            value = value.toString();
            let min = value.length >= minLength || minLength == -1;
            let max = value.length <= maxLength || maxLength == -1;
            return min && max;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * True if given password is valid.
     * @param password String contains plain text password
     * @returns Boolean value true if password is valid else false.
     */
    validPassword(password) {
        try {
            password = password.toString();
            return /.*[a-z]+.*/g.test(password) &&
                /.*[A-Z]+.*/g.test(password) &&
                /.*\d+.*/g.test(password) &&
                /.*[^A-Za-z\d\s]+.*/g.test(password) &&
                password.length >= 8 &&
                password.indexOf(":") == -1;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * True if given password is valid.
     * @param user User model that would be tested
     * @param ignorePassword Boolean variable that decide if password filed would or would not be tested
     * @returns Boolean value true if user model is valid else false.
     */
    validUser(user, ignorePassword) {
        return this.validString(user.firstName) &&
            this.validString(user.lastName) &&
            this.validNumber(user.phone) && this.validLength(user.phone, 9, 9) &&
            (this.validString(user.mainImageUrl) || user.mainImageUrl == "") &&
            this.validEmail(user.email) &&
            (this.validPassword(user.password != undefined ? user.password.toString() : "") || ignorePassword);
    }
}
exports.ToolService = ToolService;
