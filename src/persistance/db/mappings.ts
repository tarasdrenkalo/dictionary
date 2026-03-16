import { CaseStructure } from "../../domain/cases.js";
import { GenericDefinition } from "../../domain/definition.js";
import { PersonPerspective } from "../../domain/options.js";
import { WordReference, PartOfSpeech } from "../../domain/structure.js";
import { TenseContainer } from "../../domain/tense.js";
import { Thesaurus } from "../../domain/thesaurus.js";
import { Grapheme } from "../../domain/utils/grapheme.js";
import { MorphemeStructure } from "../../domain/utils/morpheme.js";
import { Gender } from "../../domain/variants.js";
import { i18n } from "../../i18n/labels.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
export interface DBWordsCollection {
    Word:i18n<string>,
    WordId:string,
    Aliases:Array<WordReference>,
    Thesaurus?:Thesaurus,
}
export interface DBMorphemeCollection {
    WordIds:Array<string>,
    IPA:i18n<Grapheme[]>,
    Morpheme:i18n<MorphemeStructure>,
}
export interface DBDefinitionsCollection {
    WordId:string,
    Denotation:GenericDefinition,
    Connotation?:GenericDefinition,
}
export interface DBEditorialCollection {
    WordId:string,
    Flags:Array<DBModFlags>,
    SEO:Array<DBSEOFlags>;
}
export interface DBLexemeCollection {
    WordIds:Array<string>,
    POS:keyof PartOfSpeech,
    Gender:Gender,
    Tenses?:TenseContainer,
    Cases?:CaseStructure,
    CurrentCase?:keyof CaseStructure;
    Kind?:string,
    Comparative?:i18n<string>,
    Superlative?:i18n<string>,
    PersonPerspective:PersonPerspective;
}

export interface DBCollections {
    Word:DBWordsCollection;
    Definition:DBDefinitionsCollection;
    IPA:DBMorphemeCollection;
    Lexeme:DBLexemeCollection;
    Editorial:DBEditorialCollection;
}
export type InsertCollectionsToDB = {[k in keyof DBCollections]:DBCollections[k][]}

export interface DBSearchQuery {
    word?: string;
    wordId?: string;
    pos?: keyof PartOfSpeech;
    gender?: Gender;
    kind?: string;
    ipa?: Grapheme[];
    flags?: DBModFlags[];
    seo?: DBSEOFlags[];
    language?: keyof i18n<undefined>;
}
import { Filter } from "mongodb";
export interface DBFilters {
    Word?: Filter<DBWordsCollection>;
    Lexeme?: Filter<DBLexemeCollection>;
    IPA?: Filter<DBMorphemeCollection>;
    Editorial?: Filter<DBEditorialCollection>;
    Definition?: Filter<DBDefinitionsCollection>;
}