import { ENGLISH_MAGIC_E_LONG } from "./spellings.js";
import { EnglishGraphemeRule, EnglishGraphemeSymbol, PolishGraphemeRule, PolishGraphemeSymbol } from "./symbols.js";

export const ENGLISH_RULES_BY_GRAPHEME:Record<EnglishGraphemeSymbol, {
  British:EnglishGraphemeRule, American:EnglishGraphemeRule}> = {
    A:{
      British:()=>null,
      American:()=>null,
    },
    B:{
      British:()=>"b", American:()=>"b"
    },
    BB:{
      British:()=>"b", American:()=>"b"
    },
    C:{
      British:(g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "s" : "k"),
      American:(g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "s" : "k"),
    },
    CC:{
      British:(g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "ks" : "k"),
      American:(g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "ks" : "k"),
    },
    D:{
      British:()=>"d",
      American:()=>"d",
    },
    DD:{
      British:()=>"d",
      American:()=>"d",
    },
    E:{
      British:()=>null,
      American:()=>null,
    },
    F:{
      British:()=>"f",
      American:()=>"f",
    },
    FF:{
      British:()=>"f",
      American:()=>"f",
    },
    G:{
      British: (g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "dʒ" : "ɡ"),
      American: (g, ctx) => (["E","I","Y"].includes(ctx.Next ?? "") ? "dʒ" : "ɡ"),
    },
    GG:{
      British: (g, ctx) => (["A"].includes(ctx.Next ?? "") ? "gz" : "ɡ"),
      American: (g, ctx) => (["A"].includes(ctx.Next ?? "") ? "gz" : "ɡ"),
    },
    H:{
      British: ()=>"h",
      American: ()=>"h",
    },
    I:{
      British:()=>null,
      American:()=>null,
    },
    J:{
      British:(g, ctx)=>(!ctx.IsFirstLetter && ctx.Next?.startsWith("A")) ? "j": "dʒ",
      American:(g, ctx)=>(!ctx.IsFirstLetter && ctx.Next?.startsWith("A")) ? "j": "dʒ",
    },
    K:{
      British:()=>"k",
      American:()=>"k",
    },
    L:{
      British:()=>"l",
      American:()=>"l",
    },
    LL:{
      British:()=>"l",
      American:()=>"l",
    },
    M:{
      British:()=>"m",
      American:()=>"m",
    },
    MM:{
      British:()=>"m",
      American:()=>"m",
    },
    N:{
      British:()=>"n",
      American:()=>"n",
    },
    NN:{
      British:()=>"n",
      American:()=>"n",
    },
    O:{
      British:()=>null,
      American:()=>null,
    },
    P:{
      British:()=>"p",
      American:()=>"p",
    },
    PP:{
      British:()=>"p",
      American:()=>"p",
    },
    Q:{
      British:()=>"p",
      American:()=>"p",
    },
    R:{
      British:()=>"r",
      American:()=>"r",
    },
    RR:{
      British:()=>"r",
      American:()=>"r",
    },
    T:{
      British:()=>"t",
      American:()=>"t",
    },
    TT:{
      British:()=>"t",
      American:()=>"t",
    },
    U:{
      British:()=>null,
      American:()=>null,
    },
    V:{
      British:()=>"v",
      American:()=>"v",
    },
    VV:{
      British:()=>"v",
      American:()=>"v",
    },
    W:{
      British:()=>"w",
      American:()=>"w",
    },
    X:{
      British:(g, ctx) => {
        if (ctx.IsFirstLetter) return "z";   // xylophone
        if (ctx.PreviousIsVowel) return "gz"; // exam
        return "ks";                          // box
      },
      American:(g, ctx) => {
        if (ctx.IsFirstLetter) return "z";   // xylophone
        if (ctx.PreviousIsVowel) return "gz"; // exam
        return "ks";                          // box
      },
    },
    XX:{
      British:()=>"ks",
      American:()=>"ks",
    },
    Y:{
      British:(g, ctx) => {
        if(ctx.IsFirstLetter) return "j";
        return ctx.IsLastLetter ? "aɪ" : "ɪ"
      },
      American:(g, ctx) => {
        if(ctx.IsFirstLetter) return "j";
        return ctx.IsLastLetter ? "aɪ" : "ɪ"
      }
    },
    Z:{
      British:()=>"z",
      American:()=>"z"
    },
    ZZ:{
      British:()=>"z",
      American:()=>"z"
    },

    GH: {
      British: (g, ctx) => (!ctx.IsFirstLetter ? null : "ɡ"), // silent when not initial
      American: (g, ctx) => (!ctx.IsFirstLetter ? null : "ɡ"), // silent when not initial
    },
    KN: {
      British: () => "n",
      American: () => "n",
    },
    WR: {
      British: () => "r",
      American: () => "r",
    },
    WH: {
      British: (g, ctx) => (ctx.NextIsVowel ? "hw" : "w"),
      American: () => "w",
    },
    MB: {
      British: (g, ctx) => (ctx.IsLastLetter ? "m" : "mb"),
      American: (g, ctx) => (ctx.IsLastLetter ? "m" : "mb"),
    },
    LD: {
      British: (g, ctx) => (ctx.Previous === "OU" && (ctx.IsLastLetter || ctx.Next === "A")) ? "d":"ld",
      American: (g, ctx) => (ctx.Previous === "OU" && (ctx.IsLastLetter || ctx.Next === "A")) ? "d":"ld",
    },
    S: {
      British: (g, ctx) => (ctx.PreviousIsVowel && ctx.NextIsVowel ? "z" : "s"),
      American: (g, ctx) => (ctx.PreviousIsVowel && ctx.NextIsVowel ? "z" : "s"),
    },
    SS: {
      British: () => "s",
      American: () => "s",
    },
    A_E:{
      British:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
      American:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    },
    E_E:{
      British:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
      American:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    },
    I_E:{
      British:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
      American:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    },
    O_E:{
      British:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
      American:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    },
    U_E:{
      British:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
      American:(g) => ENGLISH_MAGIC_E_LONG[g] ?? null,
    },
    AI:{
      British:() => "eɪ",
      American:() => "eɪ"
    },
    AY:{
      British:() => "eɪ",
      American:() => "eɪ"
    },
    EE:{
      British:() => "iː",
      American:() => "iː"
    },
    EA:{
      British:(g, ctx) => {
        if (ctx.Next === "R") return "ɛə"; // bear
        if (ctx.IsLastLetter || ctx.IsFirstLetter) return "iː"; // sea
        return "ɛ";                        // head (default)
      },
      American:(g, ctx) => {
        if (ctx.Next === "R") return "ɛə"; // bear
        if (ctx.IsLastLetter || ctx.IsFirstLetter) return "iː"; // sea
        return "ɛ";                        // head (default)
      },
    },
    OA:{
      British:() => "oʊ", 
      American:() => "oʊ", 
    },
    IE:{
      British:(g, ctx) => (ctx.IsLastLetter ? "aɪ" : "iː"),
      American:(g, ctx) => (ctx.IsLastLetter ? "aɪ" : "iː"),
    },
    EI:{
      British:(g, ctx) => (ctx.Next === "G" ? "iː" : "eɪ"),
      American:(g, ctx) => (ctx.Next === "G" ? "iː" : "eɪ"),
    },
    OU:{
      British:(g, ctx) => {
        if (ctx.Next === "G" || ctx.Next === "GH") return "ʌ"; // rough, tough
        if (ctx.Next === "LD") return "oʊ";                    // shoulder
        return "aʊ";                                           // out (default)
      },
      American:(g, ctx) => {
        if (ctx.Next === "G" || ctx.Next === "GH") return "ʌ"; // rough, tough
        if (ctx.Next === "LD") return "oʊ";                    // shoulder
        return "aʊ";                                           // out (default)
      }
    },
    OW:{
      British:(g, ctx) => (ctx.IsLastLetter ? "oʊ" : "aʊ"),
      American:(g, ctx) => (ctx.IsLastLetter ? "oʊ" : "aʊ"),
    },
    EW:{
      British:()=>"juː",
      American:()=>"juː"
    },
    OO:{
      British:(g, ctx) =>(ctx.Next === "K" || (ctx.Next?.startsWith("T") && ctx.Previous?.endsWith("F"))||(ctx.Next?.startsWith("G") && ctx.Previous?.endsWith("D"))) ? "ʊ" : (ctx.Next === "R") ? "ɔː" :"uː",
      American:(g, ctx) =>(ctx.Next === "K" || (ctx.Next?.startsWith("T") && ctx.Previous?.endsWith("F"))||(ctx.Next?.startsWith("G") && ctx.Previous?.endsWith("D"))) ? "ʊ" : (ctx.Next === "R") ? "ɔː":"uː"
    },
    AU: {
      British:()=>"ɔː",
      American:()=>"ɔː"
    },
    AW: {
      British:()=>"ɔː",
      American:()=>"ɔː"
    },
    AR:{
      British:()=>"ɑː",
      American:()=>"ɑː",
    },
    ER:{
      British:()=>"ər",
      American:()=>"ər",
    },
    IR:{
      British:()=>"ər",
      American:()=>"ər",
    },
    UR:{
      British:()=>"ər",
      American:()=>"ər",
    },
    OR:{
      British:()=>"ɔː",
      American:()=>"ɔː",
    },
    OI:{
      British:()=>"ɔɪ",
      American:()=>"ɔɪ",
    },
    OY:{
      British:()=>"ɔɪ",
      American:()=>"ɔɪ",
    },
    EU:{
      British:()=>"juː",
      American:()=>"juː",
    },
    EER:{
      British:()=>"ɪə",
      American:()=>"ɪə",
    },
    EAR:{
      British:()=>"ɪə",
      American:()=>"ɪə",
    },
    AIR:{
      British:()=>"ɛə",
      American:()=>"ɛə",
    },
    URE:{
      British:()=>"jʊə",
      American:()=>"jʊə",
    },
    SH:{
      British:()=>"ʃ",
      American:()=>"ʃ",
    },
    CZ:{
      British:()=>"ʃ",
      American:()=>"ʃ",
    },
    CH:{
      British:()=>"tʃ",
      American:()=>"tʃ",
    }, 
    TH:{
      British:(g, ctx) => (ctx.PreviousIsVowel || ctx.NextIsVowel) ? "ð" : "θ",
      American:(g, ctx) => (ctx.PreviousIsVowel || ctx.NextIsVowel) ? "ð" : "θ",
    }, 
    GN:{
      British:()=>"n",
      American:()=>"n",
    }, 
    PH:{
      British:()=>"f",
      American:()=>"f",
    },
    NG:{
      British:()=>"ŋ",
      American:()=>"ŋ",
    },
    CK:{
      British:()=>"k",
      American:()=>"k",
    },
    QU:{
      British:()=>"kw",
      American:()=>"kw",
    },
    TCH:{
      British:()=>"tʃ",
      American:()=>"tʃ",
    },
    DGE:{
      British:()=>"dʒ",
      American:()=>"dʒ",
    },
    IGH:{
      British:()=>"aɪ",
      American:()=>"aɪ",
    },
}
export const POLISH_RULES_BY_GRAPHEME:Record<PolishGraphemeSymbol, PolishGraphemeRule> = {
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