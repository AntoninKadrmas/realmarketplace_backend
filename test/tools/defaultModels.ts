import {UserModel, UserValid} from "../../src/model/userModel";
import {AdvertModel} from "../../src/model/advertModel";
import {BookConditionEnum} from "../../src/model/bookConditionEnum";
import {GenreNonFictionEnum, GenreType} from "../../src/model/genreEnum";
import {PriceOptionsEnum} from "../../src/model/priceOptionsEnum";

export var defaultUser:UserModel={
    firstName: "Antonin",
    lastName: "Novak",
    email: "novak.antonin.test.realmarketplaceoriginal.2023@gmail.com",
    phone: "123456789",
    password:"AntoninNovak1984!!!!!!!",
    createdIn: new Date(),
    validated: new UserValid(),
    mainImageUrl: ""
}
export var defaultAdvert:AdvertModel={
    author: "Test_Evzen_Polivka_2023",
    condition: BookConditionEnum.LIKE_NEW,
    createdIn: new Date(),
    description: "The cook book you have probably dreamed about. All recopies from the world in one place.",
    genreName: GenreNonFictionEnum.COOKBOOK,
    genreType: GenreType.NON_FICTION,
    price: "1000",
    priceOption: PriceOptionsEnum.EXACT_PRICE,
    title: "The_best_cook_book_written_by_Evzen_Polivka",
    visible: false

}
