import { Gender } from "../../components/gender.js";
import { TenseType } from "../../components/tense.js";
import { CaseStructure } from "../../models/cases.js";
import { Language } from "../../models/language.js";
import { WordReference } from "./structure.js";
import { AdverbVariant, ConjunctionVariant, DeterminerVariant, PrepositionVariant, PronounVariant } from "./variants.js";
export type PersonPerspective = 0|1|2|3;
export type WordOptions = {
    isbiased?:boolean;
    connotation?:string;
    excludefromwordchoices?:boolean;
    word:string;
    personperspective?:PersonPerspective;
    meaning:string;
    gender?:Gender;
    derive?:WordReference;
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
    euphemisms?: Array<WordReference|string>;
    isarchaic?: boolean;
    isneologism?: boolean;
    contexts?: Array<WordReference|string>;
    category:string;
    isparasitic?:boolean;
    sources?:Array<string>;
    language?:Language;
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