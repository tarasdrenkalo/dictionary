import { ENGLISH_POSSIBLE_SPELLINGS, POLISH_POSSIBLE_SPELLINGS } from "../components/spellings.js";
import { Grapheme } from "../components/symbols.js";
import {Languages} from "@dictionary/i18n";
import { GraphemeExtractor } from "./extractor.js";
import { GraphemeResolver } from "./resolver.js";
import {MorphemeStructureInstance} from "@dictionary/morpheme"
export class GraphemeGenerator {
    static Generate(lang: "English", word: string): Grapheme<"English">[];
    static Generate(lang: "Polish", word: string): Grapheme<"Polish">[];
    static Generate(lang: Languages, word: string): Grapheme<Languages>[] {
        switch (lang) {
            case "English": {
                const graphemes = GraphemeExtractor.ExtractGraphemes("English", word);
            const structure = MorphemeStructureInstance.Build("English", word);

            const result: Grapheme<"English">[] = graphemes.map((g, index) => {
                const options = ENGLISH_POSSIBLE_SPELLINGS[g];
                if (options.length === 1) {
                    return GraphemeResolver.BuildResolved("English", g, options[0]!);
                }
                const auto = GraphemeResolver.Resolve("English", {
                        grapheme: g,
                        word,
                        index,
                        graphemes,
                        structure
                    });
                    if (auto !== null && options.includes(auto)) {
                        return GraphemeResolver.BuildResolved("English", g, auto);
                    }
                    return {
                        Grapheme: g,
                        Phoneme: { State: "Ambiguous", Options: options }
                    };
                });
                return result as Grapheme<Languages>[];
            }
            case "Polish": {
                const graphemes = GraphemeExtractor.ExtractGraphemes("Polish", word);
                const result: Grapheme<"Polish">[] = graphemes.map((g, index) => {
                    const options = POLISH_POSSIBLE_SPELLINGS[g];
                    if (options.length === 1) {
                        return GraphemeResolver.BuildResolved("Polish", g, options[0]!);
                    }
                    const auto = GraphemeResolver.Resolve("Polish",{
                        grapheme: g,
                        word,
                        index,
                        graphemes
                    });
                    if (auto !== null && options.includes(auto)) {
                        return GraphemeResolver.BuildResolved("Polish", g, auto);
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
}