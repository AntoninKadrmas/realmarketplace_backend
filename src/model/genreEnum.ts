/**
* Enum representing the possible genres of fiction books.
*/
export enum GenreFictionEnum{
    ACTION_AND_ADVETURE ='Action and adventure',
    ALTERNATE_HISTORY = 'Alternate history',
    ANTHOLOGY='Anthology',
    CHICK_LIT='Chick lit',
    CHILDRENS='Children\'s',
    CLASSIC='Classic',
    COMIC_BOOK='Comic book',
    COMING_OF_AGE='Coming-of-age',
    CRIME='Crime',
    DRAMA='Drama',
    FAIRYTALE='Fairytale',
    FANTASY='Fantasy',
    GRAPHIC_NOVEL='Graphic novel',
    HISTORICAL_FICTION='Historical fiction',
    HORROR='Horror',
    MYSTERY='Mystery',
    PARANORMAL_ROMANCE='Paranormal romance',
    PICTURE_BOOK='Picture book',
    POETRY='Poetry',
    POLITICAL_THRILLER='Political thriller',
    ROMANCE='Romance',
    SATIRE='Satire',
    SCIENCE_FICTION='Science fiction',
    SUSPENSE='Suspense',
    WESTERN='Western',
    YOUNG_ADULT='Young adult',
  }
/**
* Enum representing the possible genres of nonfiction books.
*/
export enum GenreNonFictionEnum{
  ART_ARCHITECTURE='Art/architecture',
  AUTOBIOGRAPHY='Autobiography',
  BIOGRAPHY='Biography',
  BUSINESS_ECONOMICS='Business/economics',
  CRAFTS_HOBBIES='Crafts/hobbies',
  COOKBOOK='Cookbook',
  DIARY='Diary',
  DICTIONARY='Dictionary',
  ENCYCLOPEDIA='Encyclopedia',
  GUIDE='Guide',
  HEALTH_FITNESS='Health/fitness',
  HISTORY='History',
  HOME_AND_GARDEN='Home and garden',
  HUMOR='Humor',
  JOURNAL='Journal',
  MATH='Math',
  MEMOIR='Memoir',
  PHILOSOPHY='Philosophy',
  PRAYER='Prayer',
  RELIGION_SPIRITUALITY_AND_NEW_AGE='Religion, spirituality, and new age',
  TEXTBOOK='Textbook',
  TRUE_CRIME='True crime',
  REVIEW='Review',
  SHORT_STORY='Short story',
  SCIENCE='Science',
  SELF_HELP='Self help',
  SPORT_AND_LEISURE='Sports and leisure',
  TRAVEL='Travel',
}
/**
* Represents a genre type model.
*/
export class GenreItem{
  /** The name of the genre. */
  name!:GenreFictionEnum|GenreNonFictionEnum;
  /** The type of the genre. */
  type!:GenreType;
}
/**
* Enum representing the possible genre types.
*/
export enum GenreType{
  NON_FICTION="Non Fiction",
  FICTION="Fiction"
}