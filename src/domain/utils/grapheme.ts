import { Languages } from "../../i18n/labels.js";
import { Letter } from "./language.js";
import { MorphemeStructure, MorphemeStructureBuilder } from "./morpheme.js";

export interface GraphemeSymbol {
    English:"A"|"B"|"C"|"D"|"E"|
    "F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|"N"|"O"|"P"|"Q"|"R"|"S"|
    "T"|"U"|"V"|"W"|"X"|"Y"|"Z"|"WR"|"KN"|"AY"|"EI"|"AU"|"AW"|"OI"|
    "OY"|"EU"|"ER"|"IR"|"UR"|"OR"|"EAR"|"AR"|"EER"|"AIR"|"URE"|"GN"|"SH"|"QU"|"GH"|"CH"|"TH"|"LD"|"MB"|"PH"|"NG"|"CK"|
    "EE"|"EA"|"AI"|"OA"|"IE"|"OU"|"OW"|"WH"|"OO"|"TCH"|"DGE"|"IGH"|"A_E"|"O_E"|"U_E"|"E_E"|"I_E";

    Polish: "A"|"Ą"|"B"|"C"|"Ć"|"D"|"E"|"Ę"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"Ł"|"M"|"N"|
    "Ń"|"O"|"Ó"|"P"|"R"|"S"|"Ś"|"T"|"U"|"W"|"Y"|"Z"|"Ź"|"Ż"|"CZ"|"SZ"|"DŻ"|"DŹ"|"RZ"|"CH";
}

export interface GraphemeSpelling {
    English: ""|"æ"|"eɪ"|"ɑ"|"ɔ"|"ə"|"ɛ"|"iː"|"ɪ"|
    "ə"|"ɪ"|"aɪ"|"iː"|"ɑː"|"ɒ"|"ɑ"|"oʊ"|"ʌ"|"ə"|"uː"|"ʌ"|"juː"|
    "uː"|"ʊ"|"ə"|"ɪ"|"aɪ"|"iː"|"j"|"b"|"k"|"mb"|"ld"|"s"|"d"|"f"|"ɡ"|
    "dʒ"|"h"|"dʒ"|"k"|"l"|"m"|"n"|"ŋ"|"p"|"k"|"r"|"ɹ"|
    "s"|"z"|"ʒ"|"t"|"tʃ"|"v"|"w"|"ks"|"gz"|"z"|"z"|
    "ʃ"|"tʃ"|"k"|"ʃ"|"θ"|"ð"|"f"|"ŋ"|"k"|"f"|"ɡ"|""|"ː"|"w"|
    "hw"|"kw"|"r"|"n"|"n"|"iː"|"iː"|"ɛ"|"eɪ"|"eɪ"|"eɪ"|"oʊ"|
    "oʊ"|"aʊ"|"aʊ"|"ʌ"|"uː"|"oʊ"|"uː"|"ʊ"|"aɪ"|"iː"|"iː"|"eɪ"|
    "ɔː"|"ɔː"|"ɔɪ"|"ɔɪ"|"juː"|"uː"|"tʃ"|"dʒ"|"aɪ"|
    "ɪə"|"ɛə"|"ɝ"|"ɛə"|"jʊə"|"ʊə";
    Polish:"";
}

export interface GraphemeContext<L extends Languages> {
  Previous?: GraphemeSymbol[L];
  Next?: GraphemeSymbol[L];
  PreviousIsVowel: boolean;
  NextIsVowel: boolean;
  IsFirstLetter: boolean;
  IsLastLetter: boolean;
  Schema: string;
}
export type GraphemeRule<L extends Languages> = (
  g: GraphemeSymbol[L],
  ctx: GraphemeContext<L>,
  word: string
) => GraphemeSpelling[L] | null;


type Phoneme<L extends Languages> =
  | { State: "Resolved"; Symbol: GraphemeSpelling[L]; IsVowel: boolean, IsShort?:boolean, IsLong?:boolean }
  | { State: "Ambiguous"; Options: GraphemeSpelling[L][] }
  | { State: "Silent" };

export interface Grapheme<L extends Languages> {
  Grapheme: GraphemeSymbol[L];
  Phoneme: Phoneme<L>;
}

const MAGIC_E_LONG: Record<string, GraphemeSpelling["English"]> = {
  A: "eɪ",
  E: "iː",
  I: "aɪ",
  O: "oʊ",
  U: "juː",
};

export const RULES_BY_GRAPHEME: Record<GraphemeSymbol["English"],GraphemeRule<"English">> = {
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

  A_E: (g) => MAGIC_E_LONG[g] ?? null,
  E_E: (g) => MAGIC_E_LONG[g] ?? null,
  I_E: (g) => MAGIC_E_LONG[g] ?? null,
  O_E: (g) => MAGIC_E_LONG[g] ?? null,
  U_E: (g) => MAGIC_E_LONG[g] ?? null,

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

const ENGLISH_GRAPHEMES = new Set<GraphemeSymbol["English"]>([
  "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S",
  "T","U","V","W","X","Y","Z",
  "WR","KN","AY","EI","AU","AW","OI","OY","EU",
  "ER","IR","UR","OR","AR","EAR","EER","AIR","URE",
  "GN","SH","QU","GH","CH","TH","LD","MB","PH","NG","CK",
  "EE","EA","AI","OA","IE","OU","OW","WH","OO",
  "TCH","DGE","IGH",
  "A_E","O_E","U_E","E_E","I_E"
]);

export const POSSIBLE_SPELLINGS: Record<
  GraphemeSymbol["English"],
  GraphemeSpelling["English"][]
> = {
  // Single letters
  A: ["æ","eɪ","ɑ","ɔ","ə"],
  B: ["b"],
  C: ["k","s"],
  D: ["d"],
  E: ["ɛ","iː","ɪ","ə"],
  F: ["f"],
  G: ["ɡ","dʒ"],
  H: ["h"],
  I: ["ɪ","aɪ","iː"],
  J: ["dʒ"],
  K: ["k"],
  L: ["l"],
  M: ["m"],
  N: ["n","ŋ"],
  O: ["ɒ","ɑ","oʊ","ʌ","ə","uː"],
  P: ["p"],
  Q: ["kw"],
  R: ["r","ɹ"],
  S: ["s","z","ʒ"],
  T: ["t","tʃ"],
  U: ["ʌ","juː","uː","ʊ","ə"],
  V: ["v"],
  W: ["w"],
  X: ["ks","gz","z"],
  Y: ["ɪ","aɪ","iː","j"],
  Z: ["z"],

  // Digraphs & clusters
  SH: ["ʃ"],
  CH: ["tʃ","k","ʃ"],
  TH: ["θ","ð"],
  PH: ["f"],
  NG: ["ŋ"],
  CK: ["k"],
  GH: ["f","ɡ",""],

  WR: ["r"],
  KN: ["n"],
  GN: ["n"],
  MB: ["m","mb"],
  LD: ["ld","d"],

  QU: ["kw"],
  WH: ["w"],

  // Vowel digraphs
  EE: ["iː"],
  EA: ["iː","ɛ","eɪ","ɪ","ɛə"],
  AI: ["eɪ"],
  AY: ["eɪ"],
  OA: ["oʊ"],
  IE: ["aɪ","iː"],
  EI: ["iː","eɪ"],
  OU: ["aʊ","ʌ","uː","oʊ"],
  OW: ["oʊ","aʊ"],
  OO: ["uː","ʊ"],
  AU: ["ɔː"],
  AW: ["ɔː"],
  OI: ["ɔɪ"],
  OY: ["ɔɪ"],
  EU: ["juː"],

  // R-controlled vowels
  AR: ["ɑː"],
  ER: ["ɝ"],
  IR: ["ɝ"],
  UR: ["ɝ"],
  OR: ["ɔː"],

  // Triphthongs / special sequences
  EAR: ["ɪə","ɛə","ɝ"],
  AIR: ["ɛə"],
  URE: ["jʊə","ʊə"],
  EER: ["ɪə"],

  // Magic-E
  A_E: ["eɪ"],
  E_E: ["iː"],
  I_E: ["aɪ"],
  O_E: ["oʊ"],
  U_E: ["juː","uː"],

  // Special endings
  TCH: ["tʃ"],
  DGE: ["dʒ"],
  IGH: ["aɪ"],
};

export class EnglishGraphemeExtractor {
  private static readonly MULTI =
    /^(TCH|DGE|IGH|EER|EAR|AIR|URE|AR|ER|IR|OR|UR|SH|CH|TH|PH|NG|CK|QU|WH|GH|KN|WR|GN|AI|AY|EE|EA|OA|IE|EI|OU|OW|OO|AU|AW|OI|OY|EU)/;
  static extract(word: string): GraphemeSymbol["English"][] {
    const w = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
    const result: GraphemeSymbol["English"][] = [];
    let i = 0;
    while (i < w.length) {
      // Magic-E
      if (
        i + 2 < w.length &&
        ["A","E","I","O","U"].includes(w[i]!) &&
        w[i+2] === "E" &&
        !["A","E","I","O","U","Y"].includes(w[i+1]!)
      ) {
        const g1 = (w[i] + "_E") as GraphemeSymbol["English"];
        if (!ENGLISH_GRAPHEMES.has(g1)) throw new Error(`Invalid grapheme: ${g1}`);
        result.push(g1);

        const g2 = w[i+1] as GraphemeSymbol["English"];
        if (!ENGLISH_GRAPHEMES.has(g2)) throw new Error(`Invalid grapheme: ${g2}`);
        result.push(g2);

        i += 3;
        continue;
      }

      // Multi-letter
      const match = w.slice(i).match(this.MULTI);
      if (match) {
        const g = match[0] as GraphemeSymbol["English"];
        if (!ENGLISH_GRAPHEMES.has(g)) throw new Error(`Invalid grapheme: ${g}`);
        result.push(g);
        i += g.length;
        continue;
      }
      // Single letter
      const g = w[i] as GraphemeSymbol["English"];
      if (!ENGLISH_GRAPHEMES.has(g)) throw new Error(`Invalid grapheme: ${g}`);
      result.push(g);
      i++;
    }
    return result;
  }
}

export class GraphemeContextBuilder {
  static build(
    graphemes: GraphemeSymbol["English"][],
    letters: Array<keyof Letter>,
    index: number,
    structure: MorphemeStructure
  ): GraphemeContext<"English"> {

    const prevLetter = letters[index - 1];
    const nextLetter = letters[index + 1];

    return {
      Previous: graphemes[index - 1],
      Next: graphemes[index + 1],
      PreviousIsVowel: prevLetter ? structure.Vowels.includes(prevLetter) : false,
      NextIsVowel: nextLetter ? structure.Vowels.includes(nextLetter) : false,

      IsFirstLetter: index === 0,
      IsLastLetter: index === graphemes.length - 1,
      Schema: structure.Schema
    };
  }
}

export class GraphemeResolver {
  static resolve(
    grapheme: GraphemeSymbol["English"],
    word: string,
    index: number,
    graphemes: GraphemeSymbol["English"][],
    structure: MorphemeStructure
  ): GraphemeSpelling["English"] | null {

    const letters = word.replace(/[^\p{L}]+/gu, "").toUpperCase().split("");
    const ctx = GraphemeContextBuilder.build(graphemes, letters as Array<keyof Letter>, index, structure);

    const rule = RULES_BY_GRAPHEME[grapheme];
    if (!rule) return null;

    return rule(grapheme, ctx, word);
  }
}
export class GraphemeUtil {
  static ArePhonemeSame<L extends Languages>(l:L, a: Phoneme<L>, b: Phoneme<L>): boolean {
    if (a.State !== b.State) return false;
    switch (a.State) {
      case "Silent":
        return b.State == "Silent";
      case "Resolved":
        return (
          b.State === "Resolved" &&
          a.Symbol === b.Symbol &&
          a.IsVowel === b.IsVowel &&
          a.IsShort === b.IsShort &&
          a.IsLong === b.IsLong
        );
      case "Ambiguous":
        return (
          b.State === "Ambiguous" &&
          a.Options.length === b.Options.length &&
          a.Options.every((opt, i) => opt === b.Options[i])
        );
    }
  }
  static IsGraphemeSame<L extends Languages>(l:L, a: Grapheme<L>, b: Grapheme<L>): boolean {
    return (
      a.Grapheme === b.Grapheme &&
      GraphemeUtil.ArePhonemeSame(l, a.Phoneme, b.Phoneme)
    );
  }
  static AreGraphemesSame<L extends Languages>(l:L, a: Grapheme<L>[], b: Grapheme<L>[]): boolean {
  if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!GraphemeUtil.IsGraphemeSame(l, a[i]!, b[i]!)) return false;
    }
    return true;
  }
}