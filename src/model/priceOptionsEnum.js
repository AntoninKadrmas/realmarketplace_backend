"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceOption = exports.PriceOptionsEnum = void 0;
var PriceOptionsEnum;
(function (PriceOptionsEnum) {
    PriceOptionsEnum["EXACT_PRICE"] = "Exact Price";
    PriceOptionsEnum["APPROXIMATE_PRICE"] = "Approximate Price";
    PriceOptionsEnum["FREE"] = "Free";
    PriceOptionsEnum["IN_TEXT"] = "In Text";
    PriceOptionsEnum["ON_ARGUMENT"] = "On Argument";
    PriceOptionsEnum["FOR_RIDE"] = "For Ride";
    PriceOptionsEnum["OFFER"] = "Offer";
})(PriceOptionsEnum = exports.PriceOptionsEnum || (exports.PriceOptionsEnum = {}));
class PriceOption {
}
exports.PriceOption = PriceOption;
PriceOption.data = [
    "Exact Price",
    "Approximate Price",
    "Free",
    "In Text",
    "On Argument",
    "For Ride",
    "Offer",
];
