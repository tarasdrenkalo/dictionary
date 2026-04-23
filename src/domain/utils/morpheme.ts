import { Languages } from "../../i18n/labels.js";
import { English } from "../../langs/english.js";
import { Polish } from "../../langs/polish.js";
import { Grapheme, GraphemeSymbol, GraphemeSpelling } from "./grapheme/base.js";
import { GraphemeExtractor, GraphemeResolver } from "./grapheme/handlers.js";
import { ENGLISH_POSSIBLE_SPELLINGS, POLISH_POSSIBLE_SPELLINGS } from "./grapheme/misc.js";
import { Language, Letter } from "./language.js";
export interface MorphemeStructure<L extends Languages> {
    Schema: string;
    Vowels: Array<Letter[L]>;
    Consonants: Array<Letter[L]>;
}
export class Morpheme {
    static Generate(lang: "English", word: string): Grapheme<"English">[];
    static Generate(lang: "Polish", word: string): Grapheme<"Polish">[];
    static Generate(lang: Languages, word: string): Grapheme<Languages>[];

    static Generate(lang: Languages, word: string): Grapheme<Languages>[] {
        switch (lang) {
        case "English": {
            const graphemes = GraphemeExtractor.Extract(word, "English");
            const structure = MorphemeStructureBuilder.Build("English", word);

            const result: Grapheme<"English">[] = graphemes.map((g, index) => {
            const options = ENGLISH_POSSIBLE_SPELLINGS[g];
            if (options.length === 1) {
                return Morpheme.BuildResolved("English", g, options[0]!);
            }
            const auto = GraphemeResolver.Resolve({
                lang: "English",
                grapheme: g,
                word,
                index,
                graphemes,
                structure
            });
            if (auto !== null && options.includes(auto)) {
                return Morpheme.BuildResolved("English", g, auto);
            }
            return {
                Grapheme: g,
                Phoneme: { State: "Ambiguous", Options: options }
            };
            });
            return result as Grapheme<Languages>[];
        }

        case "Polish": {
            const graphemes = GraphemeExtractor.Extract(word, "Polish");
            const result: Grapheme<"Polish">[] = graphemes.map((g, index) => {
            const options = POLISH_POSSIBLE_SPELLINGS[g];
            if (options.length === 1) {
                return Morpheme.BuildResolved("Polish", g, options[0]!);
            }
            const auto = GraphemeResolver.Resolve({
                lang: "Polish",
                grapheme: g,
                word,
                index,
                graphemes
            });
            if (auto !== null && options.includes(auto)) {
                return Morpheme.BuildResolved("Polish", g, auto);
            }
            return {
                Grapheme: g,
                Phoneme: { State: "Ambiguous", Options: options }
            };
            });
            return result as Grapheme<Languages>[];
        }
        }
    }
    private static BuildResolved(
        lang: "English",
        g: GraphemeSymbol["English"],
        ipa: GraphemeSpelling["English"]
    ): Grapheme<"English">;

    private static BuildResolved(
        lang: "Polish",
        g: GraphemeSymbol["Polish"],
        ipa: GraphemeSpelling["Polish"]
    ): Grapheme<"Polish">;

    private static BuildResolved(
        lang: Languages,
        g: GraphemeSymbol[Languages],
        ipa: GraphemeSpelling[Languages]
    ): Grapheme<Languages> {
        const L = {
        English: new English(),
        Polish: new Polish()
        };

        switch (lang) {
        case "English": {
            const isVowel = L.English.VOWEL_IPA.includes(ipa as GraphemeSpelling["English"]);
            const isShort = L.English.SHORT_VOWELS.includes(ipa as GraphemeSpelling["English"]);

            const G: Grapheme<"English"> = {
            Grapheme: g as GraphemeSymbol["English"],
            Phoneme: {
                State: "Resolved",
                Symbol: ipa as GraphemeSpelling["English"],
                IsVowel: isVowel,
                IsShort: isVowel ? isShort : false,
                IsLong: isVowel ? !isShort : false
            }
            };
            return G as Grapheme<Languages>;
        }

        case "Polish": {
            const isVowel = L.Polish.VOWEL_IPA.includes(ipa as GraphemeSpelling["Polish"]);
            const isShort = true; // or your real logic

            const G: Grapheme<"Polish"> = {
            Grapheme: g as GraphemeSymbol["Polish"],
            Phoneme: {
                State: "Resolved",
                Symbol: ipa as GraphemeSpelling["Polish"],
                IsVowel: isVowel,
                IsShort: isVowel ? isShort : false,
                IsLong: isVowel ? !isShort : false
            }
            };
            return G as Grapheme<Languages>;
        }
        }
    }
    static GetStructure(lang: Languages, word: string): MorphemeStructure<Languages> {
        return MorphemeStructureBuilder.Build(lang, word);
    }
}
export class MorphemeStructureBuilder {
    static Build(lang:"English", word: string): MorphemeStructure<"English">
    static Build(lang:"Polish", word: string): MorphemeStructure<"Polish">
    static Build(lang:Languages, word: string): MorphemeStructure<Languages>
    static Build(lang:Languages, word: string): MorphemeStructure<Languages> {
        switch(lang){
            case "English":{
                const normal = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
                const letters = normal.split("") as Array<Letter["English"]>;

                const consonants = new English()
                .GetLetters()
                .filter(l => !new English().VOWELS.includes(l));

                const schema = letters
                .map(l => consonants.includes(l) ? "c" : "v")
                .join("");
                let morph:MorphemeStructure<"English"> = {
                    Schema: schema,
                    Vowels: letters.filter(l => new English().VOWELS.includes(l)),
                    Consonants: letters.filter(l => consonants.includes(l))
                };
                return morph;
            };
            case "Polish":{
                const normal = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
                const letters = normal.split("") as Array<Letter["Polish"]>;

                const consonants = new Polish()
                .GetLetters()
                .filter(l => !new Polish().VOWELS.includes(l));

                const schema = letters
                .map(l => consonants.includes(l) ? "c" : "v")
                .join("");
                let morph:MorphemeStructure<"Polish"> = {
                    Schema: schema,
                    Vowels: letters.filter(l => new Polish().VOWELS.includes(l)),
                    Consonants: letters.filter(l => consonants.includes(l))
                };
                return morph;
            }
        }
    }
}