export type GraphemeSymbol = "A"|"B"|"C"|"D"|"E"|
"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|
"T"|"U"|"V"|"W"|"X"|"Y"|"Z"|"WR"|"KN"|"AY"|"EI"|"AU"|"AW"|"OI"|
"OY"|"EU"|"EAR"|"AIR"|"URE"|"GN"|"SH"|"QU"|"GH"|"CH"|"TH"|"PH"|"NG"|"CK"|
"EE"|"EA"|"AI"|"OA"|"IE"|"OU"|"OW"|"WH"|"OO"|"TCH"|"DGE"|"IGH"|"A_E"|"O_E"|"U_E"|"E_E"|"I_E";
export const GRAPHEME_REGEX = /(TCH|DGE|IGH|SH|CH|TH|PH|NG|CK|EE|OO|AI|EA|OA|IE|OU|OW|.)/gi;
export type GraphemeSpelling = "æ"|"eɪ"|"ɑ"|"ɔ"|"ə"|"ɛ"|"iː"|"ɪ"|
"ə"|"ɪ"|"aɪ"|"iː"|"ɒ"|"ɑ"|"oʊ"|"ʌ"|"ə"|"uː"|"ʌ"|"juː"|
"uː"|"ʊ"|"ə"|"ɪ"|"aɪ"|"iː"|"j"|"b"|"k"|"s"|"d"|"f"|"ɡ"|
"dʒ"|"h"|"dʒ"|"k"|"l"|"m"|"n"|"ŋ"|"p"|"k"|"r"|"ɹ"|
"s"|"z"|"ʒ"|"t"|"tʃ"|"v"|"w"|"ks"|"gz"|"z"|"z"|
"ʃ"|"tʃ"|"k"|"ʃ"|"θ"|"ð"|"f"|"ŋ"|"k"|"f"|"ɡ"|""|"w"|
"hw"|"kw"|"r"|"n"|"n"|"iː"|"iː"|"ɛ"|"eɪ"|"eɪ"|"eɪ"|"oʊ"|
"oʊ"|"aʊ"|"aʊ"|"ʌ"|"uː"|"oʊ"|"uː"|"ʊ"|"aɪ"|"iː"|"iː"|"eɪ"|
"ɔː"|"ɔː"|"ɔɪ"|"ɔɪ"|"juː"|"uː"|"tʃ"|"dʒ"|"aɪ"|
"ɪə"|"ɛə"|"ɝ"|"ɛə"|"jʊə"|"ʊə";
export const POSSIBLE_SPELLINGS:Record<GraphemeSymbol, Array<GraphemeSpelling>> = {
    A:  ["æ", "eɪ", "ɑ", "ɔ", "ə"],
    E:  ["ɛ", "iː", "ɪ", "ə"],
    I:  ["ɪ", "aɪ", "iː"],
    O:  ["ɒ", "ɑ", "oʊ", "ʌ", "ə", "uː"],
    U:  ["ʌ", "juː", "uː", "ʊ", "ə"],
    Y:  ["ɪ", "aɪ", "iː", "j"],
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
    R: ["r", "ɹ"],
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
    U_E: ["juː","uː"],
    I_E: ["aɪ"],
    E_E: ["iː"],
}

export const SHORT_VOWELS:Array<GraphemeSpelling> = [
  "æ",  // cat
  "ɛ",  // bed
  "ɪ",  // sit
  "ɒ",  // British lot
  "ɑ",  // American lot (context-dependent)
  "ʌ",  // cup
  "ʊ"   // book
];
export const VOWEL_IPA: GraphemeSpelling[] = [
  "æ","ɛ","ɪ","ɒ","ɑ","ʌ","ʊ",
  "iː","eɪ","aɪ","oʊ","uː",
  "ə","ɔː","ɔɪ","ɪə","ɛə","ɝ","jʊə","ʊə"
];
type Phoneme =
  | { State: "Resolved"; Symbol: GraphemeSpelling; IsVowel: boolean, IsShort?:boolean, IsLong?:boolean }
  | { State: "Ambiguous"; Options: GraphemeSpelling[] }
  | { State: "Silent" };
export interface Grapheme {
    Grapheme:GraphemeSymbol;
    Phoneme: Phoneme;
}