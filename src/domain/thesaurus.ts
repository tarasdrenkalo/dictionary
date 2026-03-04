import { PartOfSpeech, Word, WordReference } from "./structure.js";

export let ThesaurusVariants:{[K in keyof PartOfSpeech]:Set<Word<keyof PartOfSpeech>|WordReference>} = {
    Adjective: new Set(),
    Adverb: new Set(),
    Conjunction: new Set(),
    Determiner: new Set(),
    Exclamation: new Set(),
    Interjection: new Set(),
    Noun: new Set(),
    Numeral: new Set(),
    Participle: new Set(),
    Preposition: new Set(),
    Pronoun: new Set(),
    Propernoun: new Set(),
    Verb: new Set(),
    Unknown: new Set(),
}