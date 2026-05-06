import { ENGLISH_GRAPHEMES } from "../components/spellings.js";
import {Languages} from "@dictionary/i18n";
import { EnglishGraphemeSymbol, GraphemeSymbol, PolishGraphemeSymbol } from "../components/symbols.js";

export class GraphemeExtractor {
    static readonly ENGLISH_MULTI = /^(TCH|DGE|IGH|EER|EAR|AIR|URE|AR|ER|IR|OR|UR|SH|CH|CZ|TH|PH|NG|CK|QU|WH|GH|KN|WR|GN|AI|AY|EE|EA|OA|IE|EI|OU|OW|OO|AU|AW|OI|OY|EU)/i;
    static readonly POLISH_MULTI = /^(DŹ|DŻ|CZ|SZ|RZ|CH|DZ|SI|ZI|CI)/i;
    static ExtractGraphemes(lang:"English", word:string):EnglishGraphemeSymbol[];
    static ExtractGraphemes(lang:"Polish", word:string):PolishGraphemeSymbol[];
    static ExtractGraphemes(lang:Languages, word:string):GraphemeSymbol[Languages][] {
        switch(lang){
            case "English":{
                const w = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
                const result: EnglishGraphemeSymbol[] = [];
                let i = 0;
                while(i<w.length) {
                    if (
                        i + 2 < w.length &&
                        ["A","E","I","O","U"].includes(w[i]!) &&
                        w[i+2] === "E" &&
                        !["A","E","I","O","U","Y"].includes(w[i+1]!)
                    ) {
                        const g1 = (w[i] + "_E") as EnglishGraphemeSymbol;
                        if (!ENGLISH_GRAPHEMES.has(g1)) throw new Error(`Invalid grapheme: ${g1}`);
                        result.push(g1);
                        const g2 = w[i+1] as EnglishGraphemeSymbol;
                        if (!ENGLISH_GRAPHEMES.has(g2)) throw new Error(`Invalid grapheme: ${g2}`);
                        result.push(g2);
                        i += 3;
                        continue;
                    }
                    const match = w.slice(i).match(this.ENGLISH_MULTI);
                    if (match) {
                        const g = match[0] as EnglishGraphemeSymbol;
                        if (!ENGLISH_GRAPHEMES.has(g)) throw new Error(`Invalid grapheme: ${g}`);
                        result.push(g);
                        i += g.length;
                        continue;
                    }
                    const g = w[i] as EnglishGraphemeSymbol;
                    if (!ENGLISH_GRAPHEMES.has(g)) throw new Error(`Invalid grapheme: ${g}`);
                    result.push(g);
                    i++;
                }
                return result;
            }
            case "Polish":{
                const w = word
                .replace(/[^\p{L}]+/gu, "")
                .toUpperCase()
                .normalize("NFC");
                const result: PolishGraphemeSymbol[] = [];
                let i = 0;
                while (i < w.length) {
                    const match = w.slice(i).match(this.POLISH_MULTI);
                    if (match) {
                        const g = match[0] as PolishGraphemeSymbol;
                        result.push(g);
                        i += g.length;
                        continue;
                    }
                    const g = w[i] as PolishGraphemeSymbol;
                    result.push(g);
                    i++;
                }
                return result;
            }
            default: throw "";
        }
    }
}