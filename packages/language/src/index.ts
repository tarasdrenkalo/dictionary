import {Languages} from "@dictionary/i18n";
import { ENGLISH_LANGUAGE_CONSTANT, POLISH_LANGUAGE_CONSTANT } from "./constants.js";

/** Interface for letters in different language alphabets */
export interface Letter {
    /** English alphabet letters */
    English:"A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";
    /** Polish alphabet letters */
    Polish:"A"|"Ą"|"B"|"C"|"Ć"|"D"|"E"|"Ę"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"Ł"|"M"|"N"|"Ń"|"O"|"Ó"|"P"|"R"|"S"|"Ś"|"T"|"U"|"W"|"Y"|"Z"|"Ź"|"Ż";
}

/** Type alias for letters in the English alphabet */
export type EnglishLetter = Letter["English"];

/** Type alias for letters in the Polish alphabet */
export type PolishLetter = Letter["Polish"];
export type AnyLetter = Letter[Languages];

export interface Language<L extends Languages> {
    Name:L;
    GetLetters():Array<Letter[L]>;
    HasLetter(l:any):boolean;
    GetOrderByLetter(l: Letter[L]):number|undefined;
    GetLetterByOrder(n: number):Letter[L]|undefined;
    readonly GRAPHEME_REGEX:RegExp;
    readonly VOWELS:Array<Letter[L]>;
}
export const LANGUAGE_CONSTANT = {
    English:ENGLISH_LANGUAGE_CONSTANT,
    Polish:POLISH_LANGUAGE_CONSTANT
}
export { ENGLISH_LANGUAGE_CONSTANT, POLISH_LANGUAGE_CONSTANT } from "./constants.js";