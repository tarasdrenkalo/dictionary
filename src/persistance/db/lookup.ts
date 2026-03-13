import { MongoClient } from "mongodb";
import { English, Language } from "../../domain/utils/language.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
import { Grapheme } from "../../domain/utils/grapheme.js";
import { Gender } from "../../domain/variants.js";
import { MorphemeStructure } from "../../domain/utils/morpheme.js";
import { TenseContainer } from "../../domain/tense.js";
import { CaseStructure } from "../../domain/cases.js";
import { Thesaurus } from "../../domain/thesaurus.js";
import { Words, Word, PartOfSpeech, Adjective, Participle, Adverb, Conjunction, Determiner, Preposition, Pronoun, Propernoun, Noun, Verb } from "../../domain/structure.js";

export type DictionaryDBLexemeQuery = {
    uid?:string;
    language?:Language;
    categories?:string[];
}
export type DictionaryDBModQuery = {
    needsattention?:boolean;
    includebiased?:boolean;
    includeoffensive?:boolean;
    includeuncategorised?:boolean;
}
export type DictionaryDBAggregate = {
    Lexeme:{
        Name?:string,
        UniqueId?: string,
        Language?: string,
    },
    Editorial:{
        Name?:string,
        WordId?:string,
        Flags?:{
            $in:Array<DBModFlags>
        };
        SEO?:Array<DBSEOFlags>;
    }
}
export type DictionaryDBQuery = DictionaryDBLexemeQuery & DictionaryDBModQuery;
export class DictionaryDBLookup {

    private static client = new MongoClient(`mongodb://${process.env.MONGODB_HOST||"localhost"}:${process.env.MONGODB_PORT||"27017"}/`);
    private static db = DictionaryDBLookup.client.db("Dictionary");

    private static WordsCollection = DictionaryDBLookup.db.collection("Words");
    private static MetadataCollection = DictionaryDBLookup.db.collection("Metadata");

    static BuildQuery(word?: string, from: DictionaryDBQuery = {}) {
        const needsflags =
            from.needsattention ||
            from.includebiased ||
            from.includeoffensive ||
            from.includeuncategorised;
        const query: DictionaryDBAggregate = {
            Lexeme: {},
            Editorial: {}
        };
        if (needsflags) query.Editorial.Flags = { $in: [] };
        if (from.uid) {
            query.Lexeme.UniqueId = from.uid;
            query.Editorial.WordId = from.uid;
        }
        if (from.language) {
            query.Lexeme.Language = from.language.Name;
        }
        if (word) {
            query.Lexeme.Name = word;
        }
        if (from.needsattention) query.Editorial.Flags?.$in.push("Incomplete");
        if (from.includebiased) query.Editorial.Flags?.$in.push("Bias");
        if (from.includeoffensive) query.Editorial.Flags?.$in.push("Offensive");
        if (from.includeuncategorised) query.Editorial.Flags?.$in.push("Uncategorised");
        return query;
    }
    static async Lookup(word: string, options: DictionaryDBQuery = {}) {
        const query = DictionaryDBLookup.BuildQuery(word, options);
        const lexemes = await this.WordsCollection.find(query.Lexeme).toArray();
        if (lexemes.length === 0) return [];
        // Fetch all metadata in one query
        const ids = lexemes.map(l => l.UniqueId as string);
        const Metadata = await this.MetadataCollection.find({ WordId: { $in: ids } }).toArray();
        const MetadataMap = new Map(Metadata.map(m => [m.WordId, m]));
        const words: Words = [];
        for (const lex of lexemes) {
            const editorial = MetadataMap.get(lex.UniqueId);
            const w = Word.Create(lex.POS as keyof PartOfSpeech, {
                word: lex.Name,
                meaning: lex.Meaning
            });
            w.UniqueId = lex.UniqueId;
            w.POS = lex.POS as keyof PartOfSpeech;
            w.Language = English;
            w.IPA = lex.IPA as Grapheme[];
            w.DerivativeOf = lex.DerivativeOf || {Exists:true, Name:w.Name, ExcludeFromWordChoice:w.ExcludeFromWordChoice, WordId:w.UniqueId}
            w.Gender = lex.Gender as Gender;
            w.Morpheme = lex.Morpheme as MorphemeStructure;
            w.IsPropernoun = w.POS === "Propernoun";
            w.IsAbbreviation = lex.IsAbbreviation;
            w.IsShortened = lex.IsShortened;
            w.IsConjugatable = lex.IsConjugatable;
            w.Tenses = lex.Tenses as TenseContainer || undefined;
            w.Cases = lex.Cases as CaseStructure || undefined;
            w.Thesaurus = lex.Thesaurus as Thesaurus;
            w.Category = lex.Category;
            w.CurrentCase = lex.CurrentCase as keyof CaseStructure || undefined;
            const flags: DBModFlags[] = editorial?.Flags ?? [];
            const seoflags: DBSEOFlags[] = editorial?.SEO ?? [];
            w.HasBias = flags.includes("Bias");
            w.IsColloquial = flags.includes("Colloquialism");
            w.IsUsedFormally = !flags.includes("InformalOnly");
            w.IsUsedCasually = !flags.includes("FormalOnly");
            w.IsProfane = flags.includes("Profane");
            w.IsDerogatory = flags.includes("Derogatory");
            w.IsOffensive = flags.includes("Offensive");
            w.ExcludeFromWordChoice =
                w.IsProfane ||
                w.IsDerogatory ||
                w.IsOffensive ||
                w.HasBias;
            w.IsArchaic = flags.includes("Archaic");
            w.IsNeologism = flags.includes("Neologism");
            w.IsParasitic = flags.includes("Parasitic");
            w.IsRecordComplete = !flags.includes("Incomplete");
            w.Visible = seoflags.includes("Visible");
            w.Indexable = seoflags.includes("Indexable");
            w.PersonPerspective = lex.PersonPerspective;
            if(w instanceof Adjective || w instanceof Participle) {
                w.Comparative = lex.Comparative;
                w.Superlative = lex.Superlative;
            }
            const needskind = w instanceof Adverb || w instanceof Determiner ||
                    w instanceof Conjunction || w instanceof Pronoun || w instanceof Preposition || w instanceof Propernoun;
            if(needskind) w.Kind = lex.Kind;
            if(w instanceof Noun) {
                w.IsSingular = flags.includes("Singular");
                w.IsPlural = flags.includes("Plural");
                w.IsSingularOnly = !flags.includes("SingularOnly");
                w.IsPluralOnly = !flags.includes("PluralOnly");
                w.IsCountable = !flags.includes("Uncountable");
            }
            if(w instanceof Verb || w instanceof Participle) {
                w.IsTransitive = flags.includes("Transitive");
                w.IsActive = flags.includes("Active");
            }
            words.push(w);
        }
        return words;
    }
}