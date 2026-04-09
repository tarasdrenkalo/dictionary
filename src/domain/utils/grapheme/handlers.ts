import { i18n, Languages } from "../../../i18n/labels.js";
import { PartOfSpeech, Word } from "../../structure.js";
import { Letter } from "../language.js";
import { MorphemeStructure } from "../morpheme.js";
import { EnglishGraphemeContext, EnglishGraphemeSymbol, Grapheme, GraphemeContext, GraphemeSpelling, GraphemeSymbol, Phoneme, PolishGraphemeContext, PolishGraphemeSymbol } from "./base.js";
import { ENGLISH_GRAPHEMES } from "./misc.js";
import { ENGLISH_RULES_BY_GRAPHEME, POLISH_RULES_BY_GRAPHEME } from "./rules.js";
export class GraphemeExtractor {
    private static readonly ENGLISH_MULTI = /^(TCH|DGE|IGH|EER|EAR|AIR|URE|AR|ER|IR|OR|UR|SH|CH|TH|PH|NG|CK|QU|WH|GH|KN|WR|GN|AI|AY|EE|EA|OA|IE|EI|OU|OW|OO|AU|AW|OI|OY|EU)/i;
    private static readonly POLISH_MULTI = /^(DŹ|DŻ|CZ|SZ|RZ|CH|DZ|SI|ZI|CI)/i;

    static Extract(word:string, lang:"English"):GraphemeSymbol["English"][];
    static Extract(word:string, lang:"Polish"):GraphemeSymbol["Polish"][];
    static Extract(word:Word<keyof PartOfSpeech>, lang:"All"):i18n<GraphemeSymbol[Languages][]>;
    static Extract(word:Word<keyof PartOfSpeech>|string, lang:Languages|"All"){
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
            case "All":{
                if(!(word instanceof Word)) throw "";
                let result:i18n<GraphemeSymbol[Languages][]> = {
                    English:this.Extract(word.Name.English, "English")
                }
                if(typeof word.Name.Polish === "string") result.Polish = this.Extract(word.Name.Polish, "Polish");
                return result;
            }
        }
    }
}

export class GraphemeContextConstructor {
  static Build<L extends Languages>(options: {
    lang: L;
    graphemes: GraphemeSymbol[L][];
    letters?: Array<keyof Letter>;      // English only
    index: number;
    structure?: MorphemeStructure;      // English only
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

/// RESOLVE

export class EnglishGraphemeResolver {
  static Resolve(
    grapheme: EnglishGraphemeSymbol,
    word: string,
    index: number,
    graphemes: EnglishGraphemeSymbol[],
    structure: MorphemeStructure
  ): GraphemeSpelling["English"]|null {

    const letters = word.replace(/[^\p{L}]+/gu, "").toUpperCase().split("");

    const ctx = GraphemeContextConstructor.Build<"English">(
        {graphemes:graphemes,
            letters:letters as Array<keyof Letter>,
            index:index,
        structure:structure,
        lang:"English"
    });

    const rule = ENGLISH_RULES_BY_GRAPHEME[grapheme];
    return rule(grapheme, ctx, word);
  }
}

export class PolishGraphemeResolver {
  static Resolve(
    grapheme: PolishGraphemeSymbol,
    word: string,
    index: number,
    graphemes: PolishGraphemeSymbol[]
  ): GraphemeSpelling["Polish"] {

    const ctx = GraphemeContextConstructor.Build<"Polish">({graphemes:graphemes, index:index, lang:"Polish"});
    const rule = POLISH_RULES_BY_GRAPHEME[grapheme];
    const ipa = rule(grapheme, ctx, word);

    return ipa;
  }
}

export class GraphemeResolver {
  static Resolve<L extends Languages>(options: {
    lang: L,
    grapheme: GraphemeSymbol[L],
    graphemes: GraphemeSymbol[L][],
    word: string,
    index: number,
    structure: MorphemeStructure
  }): GraphemeSpelling[L] {

    if (options.lang === "English") {
      return EnglishGraphemeResolver.Resolve(
        options.grapheme as EnglishGraphemeSymbol,
        options.word,
        options.index,
        options.graphemes as EnglishGraphemeSymbol[],
        options.structure
      ) as GraphemeSpelling[L];
    }

    if (options.lang === "Polish") {
      return PolishGraphemeResolver.Resolve(
        options.grapheme as PolishGraphemeSymbol,
        options.word,
        options.index,
        options.graphemes as PolishGraphemeSymbol[]
      ) as GraphemeSpelling[L];
    }
    throw new Error("Unsupported language");
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