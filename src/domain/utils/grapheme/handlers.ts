import { Languages } from "../../../i18n/labels.js";
import { English } from "../../../langs/english.js";
import { Polish } from "../../../langs/polish.js";
import { Letter } from "../language.js";
import { MorphemeStructure } from "../morpheme.js";
import { EnglishGraphemeContext, EnglishGraphemeSymbol, Grapheme, GraphemeContext, GraphemeSpelling, GraphemeSymbol, Phoneme, PolishGraphemeContext, PolishGraphemeSymbol } from "./base.js";
import { ENGLISH_GRAPHEMES } from "./misc.js";
import { ENGLISH_RULES_BY_GRAPHEME, POLISH_RULES_BY_GRAPHEME } from "./rules.js";
export class GraphemeExtractor {
    static readonly ENGLISH_MULTI = /^(TCH|DGE|IGH|EER|EAR|AIR|URE|AR|ER|IR|OR|UR|SH|CH|CZ|TH|PH|NG|CK|QU|WH|GH|KN|WR|GN|AI|AY|EE|EA|OA|IE|EI|OU|OW|OO|AU|AW|OI|OY|EU)/i;
    static readonly POLISH_MULTI = /^(DŹ|DŻ|CZ|SZ|RZ|CH|DZ|SI|ZI|CI)/i;
    static Extract<L extends "English">(word:string, lang:L):GraphemeSymbol[L][];
    static Extract<L extends "Polish">(word:string, lang:L):GraphemeSymbol[L][];
    static Extract<L extends Languages>(word:string, lang:L){
        switch(lang) {
            case "English":{
                if(typeof word !== "string") throw "";
                const w = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
                const result: GraphemeSymbol["English"][] = [];
                let i = 0;
                while(i<w.length) {
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
                    const match = w.slice(i).match(this.ENGLISH_MULTI);
                    if (match) {
                        const g = match[0] as GraphemeSymbol["English"];
                        if (!ENGLISH_GRAPHEMES.has(g)) throw new Error(`Invalid grapheme: ${g}`);
                        result.push(g);
                        i += g.length;
                        continue;
                    }
                    const g = w[i] as GraphemeSymbol["English"];
                    if (!ENGLISH_GRAPHEMES.has(g)) throw new Error(`Invalid grapheme: ${g}`);
                    result.push(g);
                    i++;
                }
                return result;
            }
            case "Polish":{
                if(typeof word !== "string") throw "";
                const w = word
                .replace(/[^\p{L}]+/gu, "")
                .toUpperCase()
                .normalize("NFC");
                const result: GraphemeSymbol["Polish"][] = [];
                let i = 0;
                while (i < w.length) {
                    const match = w.slice(i).match(this.POLISH_MULTI);
                    if (match) {
                        const g = match[0] as GraphemeSymbol["Polish"];
                        result.push(g);
                        i += g.length;
                        continue;
                    }
                    const g = w[i] as GraphemeSymbol["Polish"];
                    result.push(g);
                    i++;
                }
                return result;
            }
        }
    }
}

export class GraphemeContextConstructor {
  static Build<L extends "English">(options: {
    lang: L;
    graphemes: GraphemeSymbol[L][];
    letters: Array<Uppercase<Letter[L]>>;      // English only
    index: number;
    structure: MorphemeStructure<L>;      // English only
  }): GraphemeContext[L];
  static Build<L extends "Polish">(options: {
    lang: L;
    letters: undefined;
    graphemes: GraphemeSymbol[L][];
    index: number;
    structure: undefined;
  }): GraphemeContext[L];
  static Build<L extends Languages>(options: {
    lang: L;
    graphemes: GraphemeSymbol[L][];
    letters: L extends "English" ? Array<Uppercase<Letter[L]>> : undefined;
    index: number;
    structure: L extends "English" ? MorphemeStructure<L> : undefined;      // English only
  }): GraphemeContext[L] {
    const { lang, graphemes, letters, index, structure } = options;
    const prevLetter = letters?.[index - 1];
    const nextLetter = letters?.[index + 1];
    if (lang === "English") {
      const ctx: EnglishGraphemeContext = {
        Previous: graphemes[index - 1] as GraphemeSymbol["English"],
        Next: graphemes[index + 1] as GraphemeSymbol["English"],
        PreviousIsVowel: prevLetter ? structure!.Vowels.includes(prevLetter) : false,
        NextIsVowel: nextLetter ? structure!.Vowels.includes(nextLetter) : false,
        IsFirstLetter: index === 0,
        IsLastLetter: index === graphemes.length - 1,
        Schema: structure!.Schema,
        Language: "English",
      };
      return ctx as GraphemeContext[L];
    } else {
      const ctx: PolishGraphemeContext = {
        Previous: graphemes[index - 1] as GraphemeSymbol["Polish"],
        Next: graphemes[index + 1] as GraphemeSymbol["Polish"],
        IsFirstLetter: index === 0,
        IsLastLetter: index === graphemes.length - 1,
        Language: "Polish",
      };
      return ctx as GraphemeContext[L];
    }
  }
}

export type EnglishResolveOptions = {
  lang: "English",
  grapheme: EnglishGraphemeSymbol,
  graphemes: EnglishGraphemeSymbol[],
  word: string,
  index: number,
  structure: MorphemeStructure<"English">
};

export type PolishResolveOptions = {
  lang: "Polish",
  grapheme: PolishGraphemeSymbol,
  graphemes: PolishGraphemeSymbol[],
  word: string,
  index: number
};

/// RESOLVE

export class GraphemeResolver {
  // English overload
  static Resolve(
    options: {
      lang: "English",
      grapheme: EnglishGraphemeSymbol,
      graphemes: EnglishGraphemeSymbol[],
      word: string,
      index: number,
      structure: MorphemeStructure<"English">
    }
  ): GraphemeSpelling["English"] | null;

  // Polish overload
  static Resolve(
    options: {
      lang: "Polish",
      grapheme: PolishGraphemeSymbol,
      graphemes: PolishGraphemeSymbol[],
      word: string,
      index: number
    }
  ): GraphemeSpelling["Polish"];

  // Implementation signature – union, not generic, and NOT English-only spelling
  static Resolve(
    options: {
      lang: Languages,
      grapheme: GraphemeSymbol[Languages],
      graphemes: GraphemeSymbol[Languages][],
      word: string,
      index: number,
      structure?: MorphemeStructure<"English">,
    }
  ): GraphemeSpelling[Languages] | null {
    if (options.lang === "English") {
      return this.#resolveEnglish(options as EnglishResolveOptions);
    }
    if (options.lang === "Polish") {
      return this.#resolvePolish(options as PolishResolveOptions);
    }
    throw new Error("Unsupported language");
  }

    static #resolveEnglish(options: {
    lang: "English",
    grapheme: EnglishGraphemeSymbol,
    graphemes: EnglishGraphemeSymbol[],
    word: string,
    index: number,
    structure: MorphemeStructure<"English">
  }): GraphemeSpelling["English"]|null {
    const letters:Array<Letter["English"]> = options.word
      .replace(/[^\p{L}]+/gu, "")
      .toUpperCase()
      .split("").map(l=>l as Letter["English"]);
    const ctx = GraphemeContextConstructor.Build<"English">({
      lang: "English",
      graphemes: options.graphemes,
      letters,
      index: options.index,
      structure: options.structure
    });
    const rule = ENGLISH_RULES_BY_GRAPHEME[options.grapheme];
    return rule(options.grapheme, ctx, options.word);
  }
    static #resolvePolish(options: {
    lang: "Polish",
    grapheme: PolishGraphemeSymbol,
    graphemes: PolishGraphemeSymbol[],
    word: string,
    index: number
  }): GraphemeSpelling["Polish"] {

    const ctx = GraphemeContextConstructor.Build<"Polish">({
      lang: "Polish",
      graphemes: options.graphemes,
      index: options.index,
      letters: undefined,
      structure: undefined
    });

    const rule = POLISH_RULES_BY_GRAPHEME[options.grapheme];
    return rule(options.grapheme, ctx, options.word);
  }

}

export class GraphemeUtil {
    static ArePhonemeSame<L extends Languages>(a: Phoneme<L>, b: Phoneme<L>): boolean {
        if (a.State !== b.State) return false;
        switch (a.State) {
        case "Silent":
            return b.State === "Silent";
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
            GraphemeUtil.ArePhonemeSame(a.Phoneme, b.Phoneme)
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