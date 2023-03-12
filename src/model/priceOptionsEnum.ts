export enum PriceOptionsEnum{
    EXACT_PRICE = "Exact Price",
    APPROXIMATE_PRICE="Approximate Price",
    FREE = "Free",
    IN_TEXT = "In Text",
    ON_ARGUMENT = "On Argument",
    FOR_RIDE = "For Ride",
    OFFER = "Offer",
}   
export class PriceOption{
    public static data = [
        ["EXACT_PRICE" , "Exact Price"],
        ["APPROXIMATE_PRICE","Approximate Price"],
        ["FREE" , "Free"],
        ["IN_TEXT" , "In Text"],
        ["ON_ARGUMENT" , "On Argument"],
        ["FOR_RIDE" , "For Ride"],
        ["OFFER" , "Offer"],
    ]
}