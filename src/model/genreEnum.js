"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenreType = exports.GenreItem = exports.GenreNonFictionEnum = exports.GenreFictionEnum = void 0;
/**
* Enum representing the possible genres of fiction books.
*/
var GenreFictionEnum;
(function (GenreFictionEnum) {
    GenreFictionEnum["ACTION_AND_ADVETURE"] = "Action and adventure";
    GenreFictionEnum["ALTERNATE_HISTORY"] = "Alternate history";
    GenreFictionEnum["ANTHOLOGY"] = "Anthology";
    GenreFictionEnum["CHICK_LIT"] = "Chick lit";
    GenreFictionEnum["CHILDRENS"] = "Children's";
    GenreFictionEnum["CLASSIC"] = "Classic";
    GenreFictionEnum["COMIC_BOOK"] = "Comic book";
    GenreFictionEnum["COMING_OF_AGE"] = "Coming-of-age";
    GenreFictionEnum["CRIME"] = "Crime";
    GenreFictionEnum["DRAMA"] = "Drama";
    GenreFictionEnum["FAIRYTALE"] = "Fairytale";
    GenreFictionEnum["FANTASY"] = "Fantasy";
    GenreFictionEnum["GRAPHIC_NOVEL"] = "Graphic novel";
    GenreFictionEnum["HISTORICAL_FICTION"] = "Historical fiction";
    GenreFictionEnum["HORROR"] = "Horror";
    GenreFictionEnum["MYSTERY"] = "Mystery";
    GenreFictionEnum["PARANORMAL_ROMANCE"] = "Paranormal romance";
    GenreFictionEnum["PICTURE_BOOK"] = "Picture book";
    GenreFictionEnum["POETRY"] = "Poetry";
    GenreFictionEnum["POLITICAL_THRILLER"] = "Political thriller";
    GenreFictionEnum["ROMANCE"] = "Romance";
    GenreFictionEnum["SATIRE"] = "Satire";
    GenreFictionEnum["SCIENCE_FICTION"] = "Science fiction";
    GenreFictionEnum["SUSPENSE"] = "Suspense";
    GenreFictionEnum["WESTERN"] = "Western";
    GenreFictionEnum["YOUNG_ADULT"] = "Young adult";
})(GenreFictionEnum = exports.GenreFictionEnum || (exports.GenreFictionEnum = {}));
/**
* Enum representing the possible genres of nonfiction books.
*/
var GenreNonFictionEnum;
(function (GenreNonFictionEnum) {
    GenreNonFictionEnum["ART_ARCHITECTURE"] = "Art/architecture";
    GenreNonFictionEnum["AUTOBIOGRAPHY"] = "Autobiography";
    GenreNonFictionEnum["BIOGRAPHY"] = "Biography";
    GenreNonFictionEnum["BUSINESS_ECONOMICS"] = "Business/economics";
    GenreNonFictionEnum["CRAFTS_HOBBIES"] = "Crafts/hobbies";
    GenreNonFictionEnum["COOKBOOK"] = "Cookbook";
    GenreNonFictionEnum["DIARY"] = "Diary";
    GenreNonFictionEnum["DICTIONARY"] = "Dictionary";
    GenreNonFictionEnum["ENCYCLOPEDIA"] = "Encyclopedia";
    GenreNonFictionEnum["GUIDE"] = "Guide";
    GenreNonFictionEnum["HEALTH_FITNESS"] = "Health/fitness";
    GenreNonFictionEnum["HISTORY"] = "History";
    GenreNonFictionEnum["HOME_AND_GARDEN"] = "Home and garden";
    GenreNonFictionEnum["HUMOR"] = "Humor";
    GenreNonFictionEnum["JOURNAL"] = "Journal";
    GenreNonFictionEnum["MATH"] = "Math";
    GenreNonFictionEnum["MEMOIR"] = "Memoir";
    GenreNonFictionEnum["PHILOSOPHY"] = "Philosophy";
    GenreNonFictionEnum["PRAYER"] = "Prayer";
    GenreNonFictionEnum["RELIGION_SPIRITUALITY_AND_NEW_AGE"] = "Religion, spirituality, and new age";
    GenreNonFictionEnum["TEXTBOOK"] = "Textbook";
    GenreNonFictionEnum["TRUE_CRIME"] = "True crime";
    GenreNonFictionEnum["REVIEW"] = "Review";
    GenreNonFictionEnum["SHORT_STORY"] = "Short story";
    GenreNonFictionEnum["SCIENCE"] = "Science";
    GenreNonFictionEnum["SELF_HELP"] = "Self help";
    GenreNonFictionEnum["SPORT_AND_LEISURE"] = "Sports and leisure";
    GenreNonFictionEnum["TRAVEL"] = "Travel";
})(GenreNonFictionEnum = exports.GenreNonFictionEnum || (exports.GenreNonFictionEnum = {}));
/**
* Represents a genre type model.
*/
class GenreItem {
}
exports.GenreItem = GenreItem;
/**
* Enum representing the possible genre types.
*/
var GenreType;
(function (GenreType) {
    GenreType["NON_FICTION"] = "Non Fiction";
    GenreType["FICTION"] = "Fiction";
})(GenreType = exports.GenreType || (exports.GenreType = {}));
