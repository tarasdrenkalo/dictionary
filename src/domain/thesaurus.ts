import { Words } from "./structure.js";
export interface ThesaurusAlternatives {
    Adjective?: Words,
    Adverb?: Words,
    Conjunction?: Words,
    Determiner?: Words,
    Exclamation?: Words,
    Interjection?: Words,
    Noun?: Words,
    Numeral?: Words,
    Participle?: Words,
    Preposition?: Words,
    Pronoun?: Words,
    Propernoun?: Words,
    Verb?: Words,
    Unknown?: Words,
}


export interface Thesaurus {
    Synonyms?:Words,
    Antonyms?:Words,
    Omonyms?:Words,
    Paronyms?:Words,
    Alternatives?: ThesaurusAlternatives,
}