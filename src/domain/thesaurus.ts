import { WordReference } from "./structure.js";

export interface ThesaurusAlternatives {
    Adjective?: Array<WordReference>,
    Adverb?: Array<WordReference>,
    Conjunction?: Array<WordReference>,
    Determiner?: Array<WordReference>,
    Exclamation?: Array<WordReference>,
    Interjection?: Array<WordReference>,
    Noun?: Array<WordReference>,
    Numeral?: Array<WordReference>,
    Participle?: Array<WordReference>,
    Preposition?: Array<WordReference>,
    Pronoun?: Array<WordReference>,
    Propernoun?: Array<WordReference>,
    Verb?: Array<WordReference>,
    Unknown?: Array<WordReference>,
}


export interface Thesaurus {
    Synonyms?:Array<WordReference>,
    Antonyms?:Array<WordReference>,
    Omonyms?:Array<WordReference>,
    Paronyms?:Array<WordReference>,
    Alternatives?: ThesaurusAlternatives,
}