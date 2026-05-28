import { Filter } from "mongodb";
import { Definition } from "@dictionary/definition";
import { WordReference, PartOfSpeech } from "@dictionary/word";
import { Thesaurus } from "@dictionary/thesaurus";
import { Grapheme } from "@dictionary/grapheme";
import { Gender, PersonPerspective } from "@dictionary/misc";
import { i18n, Languages } from "@dictionary/i18n";
import { TenseContainer,TenseTime, CaseStructure } from "@dictionary/conjugator";
import { DictionaryDBModFlags, DictionaryDBSEOFlags } from "./flags.js";
export interface DictionaryDBWordsCollection {
    WordId:string;
    Word:i18n<string>,
    Aliases:Array<WordReference>,
    Thesaurus:Thesaurus<WordReference>,
}
export interface DictionaryDBMorphemeCollection {
    WordIds:Array<string>,
    IPA:i18n<Grapheme<Languages>[]>
}
export interface DictionaryDBDefinitionsCollection {
    WordIds:string[],
    Denotation:Definition,
    Connotation?:Definition,
}
export interface DictionaryDBEditorialCollection {
    WordIds:Array<string>,
    Complete:boolean,
    KnownPOS:boolean,
    Flags:i18n<Array<DictionaryDBModFlags>>,
    SEO:i18n<Array<DictionaryDBSEOFlags>>
}
export interface DictionaryDBLexemeCollection {
    WordIds:Array<string>,
    POS:keyof PartOfSpeech,
    Gender:i18n<Gender>,
    CurrentTense:TenseTime|null;
    Tenses:i18n<TenseContainer<Languages, WordReference>>|null,
    Cases:CaseStructure<WordReference>|null,
    CurrentCase:keyof CaseStructure<WordReference>|null,
    Kind:string,
    PersonPerspective:i18n<PersonPerspective>;
}

export interface DictionaryDBCollections {
    Word:DictionaryDBWordsCollection;
    Definition:DictionaryDBDefinitionsCollection;
    IPA:DictionaryDBMorphemeCollection;
    Lexeme:DictionaryDBLexemeCollection;
    Editorial:DictionaryDBEditorialCollection;
}
export type InsertCollectionsToDB = {[k in keyof DictionaryDBCollections]:DictionaryDBCollections[k][]}

export interface DictionaryDBSearchQuery {
    word?: string;
    wordid?: string[];
    pos?: keyof PartOfSpeech;
    gender?: Gender;
    kind?: string;
    ipa?: Grapheme<Languages>[];
    flags?:i18n<Array<DictionaryDBModFlags>>,
    SEO?:i18n<Array<DictionaryDBSEOFlags>>
    language?: Languages;
}
export interface DictionaryDBFilters {
    Word?: Filter<DictionaryDBWordsCollection>;
    Lexeme?: Filter<DictionaryDBLexemeCollection>;
    IPA?: Filter<DictionaryDBMorphemeCollection>;
    Editorial?: Filter<DictionaryDBEditorialCollection>;
    Definition?: Filter<DictionaryDBDefinitionsCollection>;
}