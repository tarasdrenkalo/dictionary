import { Languages } from "../../i18n/labels.js";
import { GraphemeSpelling, GraphemeSymbol } from "./grapheme/base.js";
export interface Letter {
    English:"A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";
    Polish:"A"|"Ą"|"B"|"C"|"Ć"|"D"|"E"|"Ę"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"Ł"|"M"|"N"|"O"|"Ó"|"P"|"R"|"S"|"Ś"|"T"|"U"|"W"|"Y"|"Z"|"Ź"|"Ż";
}
export type AnyLetter = Letter[Languages];
export interface Language<L extends Languages> {
    Name:L;
    GetLetters(): Array<Letter[L]>;
    HasLetter(l: any): boolean;
    GetOrderByLetter(l: Letter[L]): number|undefined;
    GetLetterByOrder(n: number): Letter[L]|undefined;
    readonly GRAPHEME_REGEX:RegExp;
    readonly VOWELS:Array<Uppercase<Letter[L]>>;
    readonly POSSIBLE_SPELLINGS:Record<GraphemeSymbol[L], GraphemeSpelling[L][]>;
}