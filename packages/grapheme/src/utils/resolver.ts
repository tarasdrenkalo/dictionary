import { Languages } from "@dictionary/i18n";
import { EnglishLetter, LANGUAGE_CONSTANT } from "@dictionary/language";
import { MorphemeStructure } from "@dictionary/morpheme";
import { EnglishGraphemeContextOptions, GraphemeContextConstructor } from "../components/context.js";
import { ENGLISH_RULES_BY_GRAPHEME, POLISH_RULES_BY_GRAPHEME } from "../components/rules.js";
import { EnglishGraphemeSpelling, EnglishGraphemeSymbol, Grapheme, GraphemeSpelling, GraphemeSymbol, PolishGraphemeSpelling, PolishGraphemeSymbol } from "../components/symbols.js";

export interface EnglishGraphemeResolveOptions {
  grapheme: EnglishGraphemeSymbol,
  graphemes: EnglishGraphemeSymbol[],
  word: string,
  index: number,
  structure: MorphemeStructure<"English">
};

export interface PolishGraphemeResolveOptions {
  grapheme: PolishGraphemeSymbol,
  graphemes: PolishGraphemeSymbol[],
  word: string,
  index: number
};

export interface GraphemeResolverOptions {
    English:EnglishGraphemeResolveOptions;
    Polish:PolishGraphemeResolveOptions;
};

export class GraphemeResolver {
  static Resolve(lang:"English", options:EnglishGraphemeResolveOptions):EnglishGraphemeSpelling|null;
  static Resolve(lang:"Polish", options:PolishGraphemeResolveOptions):PolishGraphemeSpelling;
  static Resolve(lang:Languages, options:GraphemeResolverOptions[Languages]):GraphemeSpelling[Languages]|null{
    switch(lang){
      case "English":{
        const letters:Array<EnglishLetter> = options.word
          .replace(/[^\p{L}]+/gu, "")
          .toUpperCase()
          .split("").map(l=>l as EnglishLetter);

        const r:EnglishGraphemeContextOptions = {
          "graphemes":options.graphemes as EnglishGraphemeSymbol[],
          "index":options.index,
          "letters":letters,
          "structure":(options as  EnglishGraphemeResolveOptions).structure as MorphemeStructure<"English">
        }
        const ctx = GraphemeContextConstructor.Build("English", r);
        const rule = ENGLISH_RULES_BY_GRAPHEME[options.grapheme as EnglishGraphemeSymbol];
        return rule(options.grapheme as EnglishGraphemeSymbol, ctx, options.word);
      }
      case "Polish": {
        const ctx = GraphemeContextConstructor.Build("Polish", {
          graphemes: options.graphemes as PolishGraphemeSymbol[],
          index: options.index
        });
        const rule = POLISH_RULES_BY_GRAPHEME[options.grapheme as PolishGraphemeSymbol];
        return rule(options.grapheme as PolishGraphemeSymbol, ctx, options.word);
      }
      default:{
        throw "";
      }
    }
  }
  static BuildResolved(lang:"English", symbol:EnglishGraphemeSymbol, ipa:EnglishGraphemeSpelling):Grapheme<"English">;
  static BuildResolved(lang:"Polish", symbol:PolishGraphemeSymbol, ipa:PolishGraphemeSpelling):Grapheme<"Polish">;
  static BuildResolved(lang:Languages, symbol:GraphemeSymbol[Languages], ipa:GraphemeSpelling[Languages]):Grapheme<Languages> {
    switch (lang) {
      case "English": {
        const IsVowel = [
          "æ","ɛ","ɪ","ɒ","ɑ","ʌ","ʊ","iː","eɪ","aɪ","oʊ","uː",
          "ə","ɔː","ɔɪ","ɪə","ɛə","ɝ","jʊə","ʊə"
        ].includes(ipa as GraphemeSpelling["English"]);
        const IsShort = ["æ","ɛ","ɪ","ɒ","ɑ","ʌ","ʊ"].includes(ipa as GraphemeSpelling["English"]);
        const G: Grapheme<"English"> = {
          Grapheme: symbol as GraphemeSymbol["English"],
          Phoneme: {
            State: "Resolved",
            Symbol: ipa as GraphemeSpelling["English"],
            IsVowel: IsVowel,
              IsShort: IsVowel ? IsShort : false,
              IsLong: IsVowel ? !IsShort : false
          }
        };
        return G as Grapheme<Languages>;
      }
      case "Polish": {
        const IsVowel = ["a","ɔm","ɔŋ","ɔ̃","ɛ","ɛm","ɛŋ","ɛ","ɛ̃",
              "ɔ","u","ɨ"].includes(ipa as GraphemeSpelling["Polish"]);
        const IsShort = true;

        const G: Grapheme<"Polish"> = {
          Grapheme: symbol as GraphemeSymbol["Polish"],
          Phoneme: {
            State: "Resolved",
            Symbol: ipa as GraphemeSpelling["Polish"],
            IsVowel: IsVowel,
            IsShort: IsVowel ? IsShort : false,
            IsLong: IsVowel ? !IsShort : false
          }
        };
        return G as Grapheme<Languages>;
      }
      default:{throw ""}
    }
  };
}