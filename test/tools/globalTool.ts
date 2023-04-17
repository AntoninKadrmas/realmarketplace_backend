import { UserModel, UserValid } from "../../src/model/userModel";

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
