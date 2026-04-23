import { EnglishIrregularVerb, IrregularVerbs as ivs } from "../domain/constants/irregverbs.en.js";
import { Prefix } from "../domain/constants/prefix.en.js";
import { Suffix } from "../domain/constants/suffix.en.js";
import { PrepositionWB, PronounWB } from "../domain/constants/wb.en.js";
import { GraphemeSpelling, GraphemeSymbol } from "../domain/utils/grapheme/base.js";
import { Language, Letter } from "../domain/utils/language.js";
import { MorphemeStructureBuilder } from "../domain/utils/morpheme.js";
export type EnglishDialect = "GB"|"US";
export class English implements Language<"English"> {
    VOWELS:Array<Letter["English"]> = ["A", "O", "Y", "E", "U", "I"];
    readonly Name = "English";
    readonly GRAPHEME_REGEX: RegExp = /^(TCH|DGE|IGH|EER|EAR|AIR|URE|AR|ER|IR|OR|UR|SH|CH|CZ|TH|PH|NG|CK|QU|WH|GH|KN|WR|GN|AI|AY|EE|EA|OA|IE|EI|OU|OW|OO|AU|AW|OI|OY|EU)/i;
    readonly SHORT_VOWELS:Array<GraphemeSpelling["English"]> = [
      "æ",  // cat
      "ɛ",  // bed
      "ɪ",  // sit
      "ɒ",  // British lot
      "ɑ",  // American lot (context-dependent)
      "ʌ",  // cup
      "ʊ"   // book
    ];
    readonly VOWEL_IPA: GraphemeSpelling["English"][] = [
        "æ","ɛ","ɪ","ɒ","ɑ","ʌ","ʊ",
        "iː","eɪ","aɪ","oʊ","uː",
        "ə","ɔː","ɔɪ","ɪə","ɛə","ɝ","jʊə","ʊə"
    ];
    GetLetters(): Array<Letter["English"]> {
        return ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    }
    HasLetter(l:any): boolean {
        return this.GetLetters().indexOf(l) != -1;
    }
    GetOrderByLetter(l: Letter["English"]): number | undefined {
        const assert = this.GetLetters().includes(l);
        if(!assert) return void l;
        return this.GetLetters().indexOf(l)+1;
    }
    GetLetterByOrder(n: number): Letter["English"] | undefined {
        const l =  this.GetLetters()[n];
        return typeof l !=="undefined" ? l : void l;
    }
    readonly Prefixes = Prefix;
    readonly Suffixes = Suffix;
    readonly IrregularVerbs = ivs;
    readonly PrepositionWB = PrepositionWB;
    readonly PronounWB = PronounWB;
    readonly Gerund = {
        ing: (word: string, dialect:EnglishDialect = "GB"):string => {
            const schema = MorphemeStructureBuilder.Build("English", word).Schema;
            if (word.endsWith("y")) {
                const form = word.slice(0, -1) + "ing";
                return form;
            }
            if (word.endsWith("e")) {
                if (word.length > 2 && word.at(-2) === "i") {
                    const form = word.slice(0, -2) + "ying";
                    return form;
                }
                const form = word.slice(0, -1) + "ing";
                return form;
            }
            if (schema.split("").filter(l => l === "v").length === 1 && !schema.endsWith("cc")) {
                const form = word + word.at(-1) + "ing";
                return form;
            }
            const form = word + "ing";
            return form;
        },
        ed: (word: string, dialect:EnglishDialect = "GB", participle: boolean = false):string => {
            const schema = MorphemeStructureBuilder.Build("English", word).Schema;
            const entry = (new English().IrregularVerbs as Record<string, EnglishIrregularVerb>)[word];
            if (entry && typeof entry !== "undefined") {
                return participle ? (entry.Participle[dialect]) : (entry.Past[dialect]);
            }
            if (word.endsWith("e")) return word + "d";
            if (schema.endsWith("vc") && schema.split("").filter(l => l === "v").length === 1) {
                const form = word + word.at(-1) + "ed";
                return form;
            }
            if (word.endsWith("y") && schema.split("").filter(l => l === "v").length !== 1) {
                const form = word.slice(0, -1) + "ied";
                return form;
            }
            return word + "ed";
        }  
    }
    readonly POSSIBLE_SPELLINGS:Record<GraphemeSymbol["English"], GraphemeSpelling["English"][]> = {
        A: ["æ", "eɪ", "ɑ", "ɔ", "ə"],
        E: ["ɛ", "iː", "ɪ", "ə"],
        I: ["ɪ", "aɪ", "iː"],
        O: ["ɒ", "ɑ", "oʊ", "ʌ", "ə", "uː"],
        U: ["ʌ", "juː", "uː", "ʊ", "ə"],
        Y: ["ɪ", "aɪ", "iː", "j"],
        B: ["b"],
        C: ["k", "s"],
        D: ["d"],
        F: ["f"],
        G: ["ɡ", "dʒ"],
        H: ["h"],
        J: ["dʒ"],
        K: ["k"],
        L: ["l"],
        M: ["m"],
        N: ["n", "ŋ"],
        P: ["p"],
        Q: ["k"],
        R: ["r", "ɹ", "ː"],
        S: ["s", "z", "ʒ"],
        T: ["t", "tʃ"],
        V: ["v"],
        W: ["w"],
        X: ["ks", "gz", "z"],
        Z: ["z"],
        SH: ["ʃ"],
        CH: ["tʃ", "k", "ʃ"],
        TH: ["θ", "ð"],
        PH: ["f"],
        NG: ["ŋ"],
        CK: ["k"],
        GH: ["f", "ɡ", ""],
        WH: ["w", "hw"],
        QU: ["kw"],
        WR: ["r"],
        KN: ["n"],
        GN: ["n"],
        EE: ["iː"],
        EA: ["iː", "ɛ", "eɪ"],
        AI: ["eɪ"],
        AY: ["eɪ"],
        OA: ["oʊ"],
        OW: ["oʊ", "aʊ"],
        OU: ["aʊ", "ʌ", "uː", "oʊ"],
        OO: ["uː", "ʊ"],
        IE: ["aɪ", "iː"],
        EI: ["iː", "eɪ"],
        AU: ["ɔː"],
        AW: ["ɔː"],
        OI: ["ɔɪ"],
        OY: ["ɔɪ"],
        EU: ["juː", "uː"],
        TCH: ["tʃ"],
        DGE: ["dʒ"],
        IGH: ["aɪ"],
        EAR: ["ɪə", "ɛə", "ɝ"],
        AIR: ["ɛə"],
        URE: ["jʊə", "ʊə"],
        A_E: ["eɪ"],
        O_E: ["oʊ"],
        U_E: ["juː", "uː"],
        I_E: ["aɪ"],
        E_E: ["iː"],
        ER: ["ɝ"],
        IR: ["ɝ"],
        UR: ["ɝ"],
        OR: ["ɔː"],
        AR: ["ɑː"],
        EER: ["ɪə", "ɛə", "ɝ"],
        CZ: ["tʃ"],
        LD: ["d","ld"],
        MB: ["m","mb"]
    }
}