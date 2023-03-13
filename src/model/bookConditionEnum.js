"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookCondition = exports.BookConditionEnum = void 0;
var BookConditionEnum;
(function (BookConditionEnum) {
    BookConditionEnum["NEW"] = "New";
    BookConditionEnum["LIKE_NEW"] = "Like New";
    BookConditionEnum["USED"] = "Used";
    BookConditionEnum["DAMAGED"] = "Damaged";
})(BookConditionEnum = exports.BookConditionEnum || (exports.BookConditionEnum = {}));
class BookCondition {
}
exports.BookCondition = BookCondition;
BookCondition.data = [
    'New',
    "Like New",
    'Used',
    'Damaged'
];
