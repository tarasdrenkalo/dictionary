import {EnglishLetter, PolishLetter, Letter, LANGUAGE_CONSTANT} from "@dictionary/language";
import {Languages} from "@dictionary/i18n";
export interface MorphemeStructure<L extends Languages> {
    Schema: string;
    Vowels: Array<Letter[L]>;
    Consonants: Array<Letter[L]>;
}
export type EnglishMorphmeStructure = MorphemeStructure<"English">;
export type PolishMorphmeStructure = MorphemeStructure<"Polish">;

export class MorphemeStructureInstance {
    static Build(lang:"English", word: string): MorphemeStructure<"English">
    static Build(lang:"Polish", word: string): MorphemeStructure<"Polish">
    static Build(lang:Languages, word: string): MorphemeStructure<Languages> {
        switch(lang){
            case "English":{
                const normal = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
                const letters = normal.split("") as Array<EnglishLetter>;

                const consonants = LANGUAGE_CONSTANT["English"]
                .GetLetters()
                .filter(l => !LANGUAGE_CONSTANT["English"].VOWELS.includes(l));

                const schema = letters
                .map(l => consonants.includes(l) ? "c" : "v")
                .join("");
                let morph:EnglishMorphmeStructure = {
                    Schema: schema,
                    Vowels: letters.filter(l => LANGUAGE_CONSTANT["English"].VOWELS.includes(l)),
                    Consonants: letters.filter(l => consonants.includes(l))
                };
                return morph;
            };
            case "Polish":{
                const normal = word.replace(/[^\p{L}]+/gu, "").toUpperCase();
                const letters = normal.split("") as Array<Letter["Polish"]>;

                const consonants = LANGUAGE_CONSTANT["Polish"]
                .GetLetters()
                .filter(l => !(LANGUAGE_CONSTANT["Polish"].VOWELS.includes(l)));

                const schema = letters
                .map(l => consonants.includes(l) ? "c" : "v")
                .join("");
                let morph:MorphemeStructure<"Polish"> = {
                    Schema: schema,
                    Vowels: letters.filter(l => LANGUAGE_CONSTANT["Polish"].VOWELS.includes(l)),
                    Consonants: letters.filter(l => consonants.includes(l))
                };
                return morph;
            }
        }
    }
}