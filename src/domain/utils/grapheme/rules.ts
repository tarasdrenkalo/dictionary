import { GraphemeSymbol, GraphemeRule } from "./base.js";
import { ENGLISH_MAGIC_E_LONG } from "./misc.js";

export const ENGLISH_RULES_BY_GRAPHEME:Record<GraphemeSymbol["English"], GraphemeRule<"English">> = {
    B: () => "b",
    C: (g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "s" : "k"),
    D: () => "d",
    F: () => "f",
    G: (g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "dʒ" : "ɡ"),
    H: () => "h",
    J: () => "dʒ",
    K: () => "k",
    L: () => "l",
    M: () => "m",
    N: () => "n",
    P: () => "p",
    Q: () => "kw",
    R: () => "r",
    T: () => "t",
    V: () => "v",
    W: () => "w",
    X: (g, ctx) => {
      if (ctx.IsFirstLetter) return "z";   // xylophone
      if (ctx.PreviousIsVowel) return "gz"; // exam
      return "ks";                          // box
    },
    Y: (g, ctx) => (ctx.IsLastLetter ? "aɪ" : "ɪ"),
    Z: () => "z",
    GH: (g, ctx) => (ctx.IsFirstLetter ? null : ""), // silent when not initial
    KN: () => "n",
    WR: () => "r",
    GN: () => "n",
    MB: (g, ctx) => (ctx.IsLastLetter ? "m" : "mb"),
    LD: (g, ctx) => ctx.IsLastLetter ? "d":"ld",
    S: (g, ctx) => (ctx.PreviousIsVowel && ctx.NextIsVowel ? "z" : "s"),
    A: () => null,
    E: () => null,
    I: () => null,
    O: () => null,
    U: () => null,
    A_E: (g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    E_E: (g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    I_E: (g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    O_E: (g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    U_E: (g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    // --- Common vowel digraphs / diphthongs ---
    AI: () => "eɪ",
    AY: () => "eɪ",
    EE: () => "iː",
    EA: (g, ctx) => {
      if (ctx.Next === "R") return "ɛə"; // bear
      if (ctx.IsLastLetter) return "iː"; // sea
      return "ɛ";                        // head (default)
    },
    OA: () => "oʊ",                      // boat (default)
    IE: (g, ctx) => (ctx.IsLastLetter ? "aɪ" : "iː"),
    EI: (g, ctx) => (ctx.Next === "G" ? "iː" : "eɪ"),
    OU: (g, ctx) => {
      if (ctx.Next === "G" || ctx.Next === "GH") return "ʌ"; // rough, tough
      if (ctx.Next === "LD") return "oʊ";                    // shoulder
      return "aʊ";                                           // out (default)
    },
    OW: (g, ctx) => (ctx.IsLastLetter ? "oʊ" : "aʊ"),
    OO: (g, ctx) => (ctx.Next === "K" ? "ʊ" : "uː"),
    AU: () => "ɔː",
    AW: () => "ɔː",
    AR: () => "ɑː",
    ER: () => "ɝ",
    IR: () => "ɝ",
    UR: () => "ɝ",
    OR: () => "ɔː",
    OI: () => "ɔɪ",
    OY: () => "ɔɪ",
    EU: () => "juː",
    EER: () => "ɪə",
    EAR: () => "ɪə",   // default (bear, fear)
    AIR: () => "ɛə",
    URE: () => "jʊə",
    SH: () => "ʃ",
    CZ: () => "tʃ",
    CH: () => "tʃ",
    TH: () => "ð",      // default voiced; unvoiced handled elsewhere if needed
    PH: () => "f",
    NG: () => "ŋ",
    CK: () => "k",
    QU: () => "kw",
    WH: () => "w",
    // --- TCH / DGE / IGH ---
    TCH: () => "tʃ",
    DGE: () => "dʒ",
    IGH: () => "aɪ",
};
export const POLISH_RULES_BY_GRAPHEME:Record<GraphemeSymbol["Polish"], GraphemeRule<"Polish">> = {
    "A":()=>"a",
    "Ą":(g, ctx)=>{
        if (ctx.Next === "P" || ctx.Next === "B") return "ɔm";
        if (ctx.Next === "K" || ctx.Next === "G")return "ɔŋ";
        return "ɔ̃";
    },
    "B":()=>"b",
    "C":()=>"t͡s",
    "Ć":()=>"t͡ɕ",
    "CI":()=>"t͡ɕi",
    "CH":()=>"x",
    "CZ":()=>"t͡ʂ",
    "D":()=>"d",
    "DZ":()=>"d͡z",
    "DŹ":()=>"d͡ʑ",
    "DŻ":()=>"d͡ʐ",
    "E":()=>"ɛ",
    "Ę":(g, ctx)=>{
        if (ctx.Next === "P" || ctx.Next === "B") return "ɛm";
        if (ctx.Next === "G" || ctx.Next === "K") return "ɛŋ";
        if(ctx.IsLastLetter) return "ɛ";
        return "ɛ̃";
    },
    "F":()=>"f",
    "G":()=>"ɡ",
    "H":()=>"x",
    "I":()=>"i",
    "J":()=>"j",
    "K":()=>"k",
    "L":()=>"l",
    "Ł":()=>"w",
    "M":()=>"m",
    "N":()=>"n",
    "Ń":()=>"ɲ",
    "O":()=>"ɔ",
    "Ó":()=>"u",
    "P":()=>"p",
    "R":()=>"r",
    "RZ":()=>"ʐ",
    "S":()=>"s",
    "Ś":()=>"ɕ",
    "SI":()=>"ɕi",
    "SZ":()=>"ʂ",
    "T":()=>"t",
    "U":()=>"u",
    "W":()=>"v",
    "Y":()=>"ɨ",
    "Z":()=>"z",
    "Ź":()=>"ʑ",
    "ZI":()=>"ʑi",
    "Ż":()=>"ʐ"
}