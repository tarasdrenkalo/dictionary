import {Gender} from "@dictionary/misc";
import {i18n, Languages} from "@dictionary/i18n";
import {PersonPerspective} from "@dictionary/misc";
import { WordReference } from "../index.js";
import { AdverbVariant, ConjunctionVariant, DeterminerVariant, InterjectionVariant, PrepositionVariant, PronounVariant } from "./variants.js";
export interface WordOptions {
    Biased?:boolean;
    Connotation?:string;
    WordChoiceExclusion?:i18n<boolean>;
    Word:i18n<string>;
    Perspective?:i18n<PersonPerspective>;
    Denotation:i18n<string>;
    Gender?:i18n<Gender>;
    Propernoun?:i18n<boolean>;
    Animate?:i18n<boolean>;
    Abbreviation?: i18n<boolean>;
    Colloquial?:i18n<boolean>;
    Formal?: i18n<boolean>;
    Informal?: i18n<boolean>;
    Profane?: i18n<boolean>;
    Derogatory?: i18n<boolean>;
    Offensive?: i18n<boolean>;
    Shortened?: i18n<boolean>;
    Euphemisms?: Array<WordReference>;
    Archaic?: i18n<boolean>;
    Neologism?: i18n<boolean>;
    Contexts?: Array<WordReference>;
    Category?:i18n<string>;
    Parasitic?:i18n<boolean>;
    Sources?:Array<string>;
}
export interface InterjectionOptions extends WordOptions {
    Kind?:InterjectionVariant;
}
export interface AdverbOptions extends WordOptions {
    Kind?:AdverbVariant;
}
export interface DeterminerOptions extends WordOptions {
    Kind?:DeterminerVariant;
}
export interface ConjunctionOptions extends WordOptions {
    Kind?:ConjunctionVariant;
}
export interface NounOptions extends WordOptions  {
    Kind?:string;
    Singleonly?:boolean;
    Pluralonly?:boolean;
    Single?:boolean;
    Plural?:boolean;
    Countable?:boolean;
}
export interface VerbOptions extends WordOptions  {
    Kind?:string;
}
export interface PronounOptions extends WordOptions  {
    kind?:PronounVariant;
}
export interface PropernounOptions extends WordOptions  {
    kind?:string;
}
export interface PrepositionOptions extends WordOptions  {
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
    Interjection: InterjectionOptions;
    Unknown: WordOptions;
}