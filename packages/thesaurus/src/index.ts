export interface ThesaurusAlternatives<O> {
    Adjective?: Array<O>,
    Adverb?: Array<O>,
    Conjunction?: Array<O>,
    Determiner?: Array<O>,
    Exclamation?: Array<O>,
    Interjection?: Array<O>,
    Noun?: Array<O>,
    Numeral?: Array<O>,
    Participle?: Array<O>,
    Preposition?: Array<O>,
    Pronoun?: Array<O>,
    Propernoun?: Array<O>,
    Verb?: Array<O>,
    Unknown?: Array<O>,
}


export interface Thesaurus<O> {
    Synonyms?:Array<O>,
    Antonyms?:Array<O>,
    Omonyms?:Array<O>,
    Paronyms?:Array<O>,
    Alternatives?: ThesaurusAlternatives<O>,
}