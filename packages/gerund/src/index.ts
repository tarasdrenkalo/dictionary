import {MorphemeStructureInstance} from "@dictionary/morpheme";
import { ENGLISH_IRREGULAR_VERBS } from "./iv.js";
export * from "./iv.js";
export class Gerund {
    static ing(word: string, dialect:"GB"|"US" = "GB"):string {
        const schema = MorphemeStructureInstance.Build("English", word).Schema;
        if (word.endsWith("y")) {
            const form = word.slice(0, -1) + "ing";
            return form;
        }
        if (word.endsWith("e")) {
            if (word.length > 2 && word.at(-2) === "i") {
                const form = word.slice(0, -2) + "ying";
                return form;
            }
            const form = word.slice(0, -1) + "ing";
            return form;
        }
        if (schema.split("").filter(l => l === "v").length === 1 && !schema.endsWith("cc")) {
            const form = word + word.at(-1) + "ing";
            return form;
        }
        const form = word + "ing";
        return form;
    }
    static ed(word: string, dialect:"GB"|"US" = "GB", participle: boolean = false):string {
        const schema = MorphemeStructureInstance.Build("English", word).Schema;
        const entry = ENGLISH_IRREGULAR_VERBS[word];
        if (entry && typeof entry !== "undefined") {
            return participle ? (entry.Participle[dialect]) : (entry.Past[dialect]);
        }
        if (word.endsWith("e")) return word + "d";
        if (schema.endsWith("vc") && schema.split("").filter(l => l === "v").length === 1) {
            const form = word + word.at(-1) + "ed";
            return form;
        }
        if (word.endsWith("y") && schema.split("").filter(l => l === "v").length !== 1) {
            const form = word.slice(0, -1) + "ied";
            return form;
        }
        return word + "ed";
    }
}  