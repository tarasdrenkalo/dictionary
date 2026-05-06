import {Languages} from "@dictionary/i18n";
import { GraphemeContext } from "./context.js";
export type EnglishGraphemeSymbol = "A"|"B"|"C"|"D"|"E"|
    "F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|
    "T"|"U"|"V"|"W"|"X"|"Y"|"Z"|"WR"|"KN"|"AY"|"EI"|"AU"|"AW"|"OI"|
    "OY"|"EU"|"ER"|"IR"|"UR"|"OR"|"EAR"|"AR"|"EER"|"AIR"|"URE"|"GN"|"SH"|"QU"|"GH"|"CH"|"CZ"|"TH"|"LD"|"MB"|"PH"|"NG"|"CK"|
    "EE"|"EA"|"AI"|"OA"|"IE"|"OU"|"OW"|"WH"|"OO"|"TCH"|"DGE"|"IGH"|"A_E"|"O_E"|"U_E"|"E_E"|"I_E";
export type PolishGraphemeSymbol = "A"|"Ą"|"B"|"C"|"Ć"|"D"|"E"|"Ę"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"Ł"|"M"|"N"|
    "Ń"|"O"|"Ó"|"P"|"R"|"S"|"Ś"|"T"|"U"|"W"|"Y"|"Z"|"Ź"|"Ż"|"CZ"|"SZ"|"DZ"|"DŻ"|"DŹ"|"RZ"|"CH"|"CI"|"SI"|"ZI";

export interface GraphemeSymbol {
    English:EnglishGraphemeSymbol
    Polish: PolishGraphemeSymbol;
}
export type EnglishGraphemeSpelling = ""|"æ"|"eɪ"|"ɑ"|"ɔ"|"ə"|"ɛ"|"iː"|"ɪ"|
    "ə"|"ɪ"|"aɪ"|"iː"|"ɑː"|"ɒ"|"ɑ"|"oʊ"|"ʌ"|"ə"|"uː"|"ʌ"|"juː"|
    "uː"|"ʊ"|"ə"|"ɪ"|"aɪ"|"iː"|"j"|"b"|"k"|"mb"|"ld"|"s"|"d"|"f"|"ɡ"|
    "dʒ"|"h"|"dʒ"|"k"|"l"|"m"|"n"|"ŋ"|"p"|"k"|"r"|"ɹ"|
    "s"|"z"|"ʒ"|"t"|"tʃ"|"v"|"w"|"ks"|"gz"|"z"|"z"|
    "ʃ"|"tʃ"|"k"|"ʃ"|"θ"|"ð"|"f"|"ŋ"|"k"|"f"|"ɡ"|""|"ː"|"w"|
    "hw"|"kw"|"r"|"n"|"n"|"iː"|"iː"|"ɛ"|"eɪ"|"eɪ"|"eɪ"|"oʊ"|
    "oʊ"|"aʊ"|"aʊ"|"ʌ"|"uː"|"oʊ"|"uː"|"ʊ"|"aɪ"|"iː"|"iː"|"eɪ"|
    "ɔː"|"ɔː"|"ɔɪ"|"ɔɪ"|"juː"|"uː"|"tʃ"|"dʒ"|"aɪ"|
    "ɪə"|"ɛə"|"ɝ"|"ɛə"|"jʊə"|"ʊə";
export type PolishGraphemeSpelling = ""|"a"|"ɔ̃"|"b"|"t͡s"|"t͡ɕ"|"t͡ɕi"|"x"|"t͡ʂ"|"d"|"d͡z"|"d͡ʑ"|"d͡ʐ"|"ɛ"|
    "ɛ̃"|"f"|"ɡ"|"x"|"i"|"j"|"k"|"l"|"w"|"m"|"n"|"ɲ"|"ɔ"|"u"|"p"|"r"|"ʐ"|
    "s"|"ɕ"|"ɕi"|"ʂ"|"t"|"u"|"v"|"ɨ"|"z"|"ʑ"|"ʑi"|"ʐ"|"ɔm"|"ɔŋ"|"ɛŋ"|"ɛŋ"|"ɛm";
export interface GraphemeSpelling {
    English: EnglishGraphemeSpelling;
    Polish: PolishGraphemeSpelling;
}


export type GraphemeRule<L extends Languages> = (
  g: GraphemeSymbol[L],
  ctx: GraphemeContext[L],
  word: string
) => L extends "English" ? (GraphemeSpelling[L] | null):GraphemeSpelling[L];

export type EnglishGraphemeRule = GraphemeRule<"English">;
export type PolishGraphemeRule = GraphemeRule<"Polish">;

export interface Grapheme<L extends Languages> {
  Grapheme: GraphemeSymbol[L];
  Phoneme: Phoneme<L>;
}
export type Phoneme<L extends Languages> =
  | { State: "Resolved"; Symbol: GraphemeSpelling[L]; IsVowel: boolean, IsShort?:boolean, IsLong?:boolean }
  | { State: "Ambiguous"; Options: GraphemeSpelling[L][] }
  | { State: "Silent"};