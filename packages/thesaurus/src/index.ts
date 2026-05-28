export interface Thesaurus<O> {
    Synonyms?:Array<O>,
    Antonyms?:Array<O>,
    Omonyms?:Array<O>,
    Paronyms?:Array<O>,
}
export type ThesaurusType = keyof Thesaurus<any>;