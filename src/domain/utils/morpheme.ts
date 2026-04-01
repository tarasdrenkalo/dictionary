import { English } from "../../langs/english.js";
import { GraphemeSpelling, Grapheme, EnglishGraphemeExtractor, GraphemeResolver, GraphemeSymbol, POSSIBLE_SPELLINGS } from "./grapheme.js";
import { Letter } from "./language.js";

export interface MorphemeStructure {
  Schema: string;
  Vowels: Array<keyof Letter>;
  Consonants: Array<keyof Letter>;
}

export class Morpheme {
  static Generate(word: string): Grapheme<"English">[] {
    const graphemes = EnglishGraphemeExtractor.extract(word);
    const structure = MorphemeStructureBuilder.Build("English", word);

    return graphemes.map((g, index) => {
      const options = POSSIBLE_SPELLINGS[g];

      if (options.length === 1) {
        return this.BuildResolved(g, options[0]!);
      }

      const auto = GraphemeResolver.resolve(
        g,
        word,
        index,
        graphemes,
        structure
      );

      if (auto !== null && options.includes(auto)) {
        return this.BuildResolved(g, auto);
      }
      return {
        Grapheme: g,
        Phoneme: { State: "Ambiguous", Options: options }
      };
    });
  }

  private static BuildResolved(
    g: GraphemeSymbol["English"],
    ipa: GraphemeSpelling["English"]
  ): Grapheme<"English"> {
    const isVowel = new English().VOWEL_IPA.includes(ipa);
    const isShort = new English().SHORT_VOWELS.includes(ipa);
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

  static GetStructure(word: string): MorphemeStructure {
    return MorphemeStructureBuilder.Build("English", word);
  }
}
export class MorphemeStructureBuilder {
  static Build(lang:"English", word: string): MorphemeStructure {
    const normal = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
    const letters = normal.split("") as Array<keyof Letter>;

    const consonants = new English()
      .GetLetters()
      .filter(l => !new English().VOWELS.includes(l));

    const schema = letters
      .map(l => consonants.includes(l) ? "c" : "v")
      .join("");

    return {
      Schema: schema,
      Vowels: letters.filter(l => new English().VOWELS.includes(l)),
      Consonants: letters.filter(l => consonants.includes(l))
    };
  }
}