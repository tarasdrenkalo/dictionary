
import { i18n } from "../i18n/labels.js";
import { CaseStructure } from "./cases.js";
import { WordReference } from "./structure.js";
import { TenseType } from "./tense.js";
import { Gender, AdverbVariant, DeterminerVariant, ConjunctionVariant, PronounVariant, PrepositionVariant } from "./variants.js";
export type PersonPerspective = 0|1|2|3;
export type WordOptions = {
    case?:keyof CaseStructure;
    isbiased?:boolean;
    connotation?:string;
    excludefromwordchoices?:boolean;
    word:string;
    personperspective?:PersonPerspective;
    meaning:string;
    gender?:Gender;
    ispropernoun?:boolean;
    isabbreviation?: boolean;
    iscolloquial?:boolean;
    isusedfomally?: boolean;
    isusedcasually?: boolean;
    isprofane?: boolean;
    isderogatory?: boolean;
    isoffensive?: boolean;
    isshortened?: boolean;
    isconjugatable?: boolean;
    euphemisms?: Array<WordReference>;
    isarchaic?: boolean;
    isneologism?: boolean;
    contexts?: Array<WordReference>;
    category?:string;
    isparasitic?:boolean;
    sources?:Array<string>;
    language?:keyof i18n<undefined>;
}

export type AdverbOptions = WordOptions & {
    kind?:AdverbVariant;
}
export type DeterminerOptions = WordOptions & {
    kind?:DeterminerVariant;
}
export type ConjunctionOptions = WordOptions & {
    kind?:ConjunctionVariant;
}
export type NounOptions = WordOptions & {
    singleonly?:boolean;
    pluralonly?:boolean;
    issingle?:boolean;
    isplural?:boolean;
    iscountable?:boolean;
    currentcase?:keyof CaseStructure;
}
export type VerbOptions = WordOptions & {
    istransitive?:boolean;
    isactive?:boolean;
    currentense?:TenseType;
}
export type PronounOptions = WordOptions & {
    kind?:PronounVariant;
}
export type PropernounOptions = WordOptions & {
    kind?:string;
}
export type PrepositionOptions = WordOptions & {
    kind?:PrepositionVariant;
}
export interface OptionsByPartOfSpeech {
    Adjective: WordOptions;
    Adverb:AdverbOptions;
    Noun: NounOptions;
    Verb: VerbOptions;
    Numeral:WordOptions;
    Determiner: DeterminerOptions;
    Pronoun: PronounOptions;
    Preposition: PrepositionOptions;
    Participle: VerbOptions;
    Conjunction: ConjunctionOptions;
    Propernoun: PropernounOptions;
    Exclamation: WordOptions;
    Interjection: WordOptions;
    Unknown:WordOptions;
}