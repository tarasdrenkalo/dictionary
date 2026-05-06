import {EnglishLetter} from "@dictionary/language";
import {Languages} from "@dictionary/i18n";
import { EnglishGraphemeSymbol, GraphemeSymbol, PolishGraphemeSymbol } from "./symbols.js";
import { MorphemeStructure } from "@dictionary/morpheme";
export interface BaseGraphemeContext<L extends Languages> {
  Previous?: GraphemeSymbol[L];
  Next?: GraphemeSymbol[L];
  IsFirstLetter: boolean;
  IsLastLetter: boolean;
  Language: L;
}
export interface EnglishGraphemeContext extends BaseGraphemeContext<"English"> {
  PreviousIsVowel: boolean;
  NextIsVowel: boolean;
  Schema: string;
}

export interface PolishGraphemeContext extends BaseGraphemeContext<"Polish"> {}

export interface GraphemeContext {
    English: EnglishGraphemeContext
    Polish:PolishGraphemeContext
}

export interface EnglishGraphemeContextOptions {
    graphemes:EnglishGraphemeSymbol[];
    letters:EnglishLetter[];
    index:number;
    structure:MorphemeStructure<"English">;
}
export interface PolishGraphemeContextOptions {
    graphemes:PolishGraphemeSymbol[];
    index:number;
}
export interface GraphemeContextOptions {
    English:EnglishGraphemeContextOptions;
    Polish:PolishGraphemeContextOptions;
}

export class GraphemeContextConstructor {
    static Build<L extends "English">(lang:L, options:GraphemeContextOptions[L]):GraphemeContext[L];
    static Build<L extends "Polish">(lang:L, options:GraphemeContextOptions[L]):GraphemeContext[L];
    static Build<L extends Languages>(lang:L, options:GraphemeContextOptions[L]):GraphemeContext[L] {  
        switch(lang) {
            case "English":{
                const { graphemes, letters, index, structure } = options as EnglishGraphemeContextOptions;
                const PreviousLetter = letters[index - 1] as EnglishLetter;
                const NextLetter = letters[index + 1] as EnglishLetter;
                const ctx: EnglishGraphemeContext = {
                    Previous: graphemes[index - 1] as GraphemeSymbol["English"],
                    Next: graphemes[index + 1] as GraphemeSymbol["English"],
                    PreviousIsVowel: PreviousLetter ? structure!.Vowels.includes(PreviousLetter) : false,
                    NextIsVowel: NextLetter ? structure!.Vowels.includes(NextLetter) : false,
                    IsFirstLetter: index === 0,
                    IsLastLetter: index === graphemes.length - 1,
                    Schema: structure!.Schema,
                    Language: "English",
                };
                return ctx as GraphemeContext[L];
            }
            case "Polish":{
                const { graphemes, index } = options as EnglishGraphemeContextOptions;
                const ctx: PolishGraphemeContext = {
                    Previous: graphemes[index - 1] as GraphemeSymbol["Polish"],
                    Next: graphemes[index + 1] as GraphemeSymbol["Polish"],
                    IsFirstLetter: index === 0,
                    IsLastLetter: index === graphemes.length - 1,
                    Language: "Polish",
                };
                return ctx as GraphemeContext[L];
            }
            default: throw "";
        }
    }  
}