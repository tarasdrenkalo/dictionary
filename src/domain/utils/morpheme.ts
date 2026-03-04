import { GraphemeSpelling, GraphemeSymbol, Grapheme, POSSIBLE_SPELLINGS, SHORT_VOWELS } from "./grapheme.js";
import { Language, Letter, English } from "./language.js";

export interface MorphemeStructure {
  Word: string;
  Language: Language;
  Schema: string;
  Vowels: Array<keyof Letter>;
  Consonants: Array<keyof Letter>;
}

const VOWEL_IPA: GraphemeSpelling[] = [
  "æ","ɛ","ɪ","ɒ","ɑ","ʌ","ʊ",
  "iː","eɪ","aɪ","oʊ","uː",
  "ə","ɔː","ɔɪ","ɪə","ɛə","ɝ","jʊə","ʊə"
];

export class Morpheme {

  private static readonly LETTER_VOWELS: Array<keyof Letter> =
    ["A","E","I","O","U","Y"];

  /* ============================
     1️⃣ BASIC LETTER SCHEMA
     ============================ */

  static GetSchema(word: string, lang: Language): string {
    const letters = word
      .replace(/[^\p{L}]+/gu, "")
      .toUpperCase()
      .split("") as Array<keyof Letter>;

    const consonants = lang
      .GetLetters()
      .filter(l => !this.LETTER_VOWELS.includes(l));

    return letters
      .map(l => consonants.includes(l) ? "c" : "v")
      .join("");
  }
  /* ============================
     2️⃣ GRAPHEME EXTRACTION
     Handles split digraphs
     ============================ */

  static ExtractGraphemes(word: string): GraphemeSymbol[] {
    const w = word
      .replace(/[^\p{L}]+/gu, "")
      .toUpperCase();
    const result: GraphemeSymbol[] = [];
    let i = 0;
    while (i < w.length) {
      // ---- Split digraphs (A_E, O_E etc.) ----
      if (
        i + 2 < w.length &&
        ["A","E","I","O","U"].includes(w[i] as string) &&
        w[i + 2] === "E" &&
        !["A","E","I","O","U","Y"].includes(w[i + 1] as string)
      ) {
        result.push((w[i] + "_E") as GraphemeSymbol);
        result.push((w[i+1]) as GraphemeSymbol);
        i += 3;
        continue;
      }
      // ---- Multi-letter graphemes ----
      const match = w
        .slice(i)
        .match(/^(TCH|DGE|IGH|EAR|AIR|URE|SH|CH|TH|PH|NG|CK|EE|OO|AI|EA|OA|IE|OU|OW|WR|KN|GN|WH|QU|AY|EI|AU|AW|OI|OY|EU)/);
      if (match) {
        result.push(match[0] as GraphemeSymbol);
        i += match[0].length;
        continue;
      }
      // ---- Single letter fallback ----
      result.push(w[i] as GraphemeSymbol);
      i++;
    }
    return result;
  }
  /* ============================
     3️⃣ AUTO RESOLUTION RULES
     ============================ */
  private static TryResolve(
    grapheme: GraphemeSymbol,
    word: string,
    index: number
  ): GraphemeSpelling | null {
    const w = word.toUpperCase();
    // C soft rule
    if (grapheme === "C") {
      const next = w[index + 1] ||"";
      if (["E","I","Y"].includes(next))
        return "s";
      return "k";
    }
    if(grapheme === "S") {
      const next = w[index+1]||"";
      const previous = w[index-1]||"";
      if(["A","O","U","I","E"].includes(previous) && next ==="E") {
        return "z";
      }
      return "s";
    }
    // G soft rule
    if (grapheme === "G") {
      const next = w[index + 1] ||"";
      if (["E","I","Y"].includes(next))
        return "dʒ";
      return "ɡ";
    }
    // Silent GH (rough heuristic)
    if (grapheme === "GH" && index > 0) {
      return "";
    }
    if(["A","O","U","E","I"].includes(grapheme) && Array.from(Morpheme.GetStructure(w).Schema.matchAll(/v/gi)).length < 2) {
      return "ɑ";
    }
    return null;
  }
  /* ============================
     4️⃣ SMART GENERATOR
     ============================ */
  static Generate(word: string): Grapheme[] {
    const graphemes = this.ExtractGraphemes(word);
    return graphemes.map((g, index) => {
      const options = POSSIBLE_SPELLINGS[g];
      // Single-option → resolved
      if (options.length === 1) {
        return this.BuildResolved(g, options[0] as GraphemeSpelling);
      }
      // Try auto rules
      const auto = this.TryResolve(g, word, index);
      if (auto !== null && options.includes(auto)) {
        return this.BuildResolved(g, auto);
      }
      // Ambiguous → needs picker
      return {
        Grapheme: g,
        Phoneme: {
          State: "Ambiguous",
          Options: options
        }
      };
    });
  }

  /* ============================
     5️⃣ RESOLVED BUILDER
     ============================ */

  private static BuildResolved(
    g: GraphemeSymbol,
    ipa: GraphemeSpelling
  ): Grapheme {
    const isVowel = VOWEL_IPA.includes(ipa);
    const isShort = SHORT_VOWELS.includes(ipa);
    return {
      Grapheme: g,
      Phoneme: {
        State: "Resolved",
        Symbol: ipa,
        IsVowel: isVowel,
        IsShort: isVowel ? isShort : false,
        IsLong: isVowel ? !isShort : false
      }
    };
  }

  /* ============================
     6️⃣ BASIC MORPHEME STRUCTURE
     ============================ */

  static GetStructure(word: string): MorphemeStructure {

    const normalized = word
      .replace(/[^\p{L}]+/gu, "")
      .toUpperCase();

    const letters = normalized.split("") as Array<keyof Letter>;

    const consonants = English
      .GetLetters()
      .filter(l => !this.LETTER_VOWELS.includes(l));

    return {
      Word: word,
      Language: English,
      Schema: this.GetSchema(word, English),
      Vowels: letters.filter(l => this.LETTER_VOWELS.includes(l)),
      Consonants: letters.filter(l => consonants.includes(l)),
    };
  }
}