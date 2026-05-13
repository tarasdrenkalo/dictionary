import { Filter, MongoClient } from "mongodb";
import {Word, POS, Verb, Adjective, Participle, Noun, Pronoun, Propernoun, Determiner, Adverb, Conjunction, Preposition} from "@dictionary/word";
import {i18n, Languages} from "@dictionary/i18n";
import { DictionaryDBModFlags,DictionaryDBSEOFlags } from "./flags.js";
import { DictionaryDBCollections, DictionaryDBDefinitionsCollection, DictionaryDBEditorialCollection, DictionaryDBFilters, DictionaryDBLexemeCollection, DictionaryDBMorphemeCollection, DictionaryDBSearchQuery, DictionaryDBWordsCollection } from "./mappings.js";
export class DictionaryDBUtil {
    static BuildModFlags(w:Word<POS>):i18n<DictionaryDBModFlags[]> {
        const flags:i18n<DictionaryDBModFlags[]> = {
            English:new Array<DictionaryDBModFlags>()
        }
        if(typeof w.Name.Polish === "string"){
            flags.Polish = new Array<DictionaryDBModFlags>();
        }
        const rules: Array<[keyof Word<POS>, DictionaryDBModFlags, boolean]> = [
            ["HasBias", "Bias", true],
            ["IsConjugatable", "NotConjugatable", false],
            ["IsColloquial","Colloquialism",true],
            ["IsUsedFormally","InformalOnly",false],
            ["IsUsedCasually","FormalOnly",false],
            ["IsProfane","Profane",true],
            ["IsDerogatory","Derogatory",true],
            ["IsOffensive","Offensive",true],
            ["IsArchaic","Archaic",true],
            ["IsNeologism","Neologism",true],
            ["IsParasitic","Parasitic",true]
        ];
        for(const lang of Object.keys(w.Name) as Languages[]) {
            if (w instanceof Verb) {
                if (w.IsTransitive[lang]) flags[lang]?.push("Transitive");
                if (w.IsActive[lang]) flags[lang]?.push("Active");
            }
            if (w instanceof Noun && w instanceof Pronoun && w instanceof Propernoun) {
                if (w.IsSingular) flags[lang]?.push("Singular");
                if (w.IsPlural) flags[lang]?.push("Plural");
                if (w.IsSingularOnly) flags[lang]?.push("SingularOnly");
                if (w.IsPluralOnly) flags[lang]?.push("PluralOnly");
                if (!w.IsCountable) flags[lang]?.push("Uncountable");
            }
            if (w instanceof Pronoun) {
                if (w.IsSingular) flags[lang]?.push("Singular");
                if (w.IsPlural) flags[lang]?.push("Plural");
                if (w.IsSingularOnly) flags[lang]?.push("SingularOnly");
                if (w.IsPluralOnly) flags[lang]?.push("PluralOnly");
                if (!w.IsCountable) flags[lang]?.push("Uncountable");
            }
            if (w instanceof Propernoun) {
                if (w.IsSingular) flags[lang]?.push("Singular");
                if (w.IsPlural) flags[lang]?.push("Plural");
                if (w.IsSingularOnly) flags[lang]?.push("SingularOnly");
                if (w.IsPluralOnly) flags[lang]?.push("PluralOnly");
                if (!w.IsCountable) flags[lang]?.push("Uncountable");
            }
        }
        return flags;
    }
    static BuildSEOFlags(w:Word<POS>):i18n<Array<DictionaryDBSEOFlags>> {
        const flags:i18n<Array<DictionaryDBSEOFlags>> ={
            English:new Array<DictionaryDBSEOFlags>()
        }
        if(typeof w.Name.Polish === "string") flags.Polish = new Array<DictionaryDBSEOFlags>();

        for(const lang of Object.keys(w.Name) as Languages[]){
            if(w.Visible[lang]) flags[lang]?.push("Visible");
            if(w.Indexable[lang]) flags[lang]?.push("Indexable");
            if(w.Visible[lang] && w.Indexable) flags[lang]?.push("SEOIndexable");
        }
        return flags;
    }
    static BuildLexeme(w:Word<POS>):DictionaryDBLexemeCollection {
        const NeedKind =
            w instanceof Adverb || w instanceof Determiner ||
            w instanceof Conjunction || w instanceof Pronoun ||
            w instanceof Preposition || w instanceof Propernoun;

        const NeedCases =
            w instanceof Adjective || w instanceof Noun ||
            w instanceof Pronoun || w instanceof Propernoun;
        let result:DictionaryDBLexemeCollection = {
            WordIds: w.Aliases.map(a=>a.id),
            POS: w.POS,
            Gender: w.Gender,
            CurrentCase:w.CurrentCase ?? null,
            CurrentTense:w.CurrentTense ?? null,
            PersonPerspective: w.PersonPerspective,
            Cases: NeedCases && w.Cases || null,
            Kind: NeedKind ? w.Kind : "Undetermined",
            Tenses:w.Tenses ?? null
        }
        return result;
    }
    static LexemeFingerPrint(l:DictionaryDBLexemeCollection) {
        return JSON.stringify(l, (k, v)=>typeof v !=="undefined" ? v:null)
    }
    static DefinitionFingerPrint(d:DictionaryDBDefinitionsCollection) {
        return JSON.stringify(d, (k, v)=>typeof v !=="undefined" ? v:null)
    }
    static EditorialFingerPrint(d:DictionaryDBEditorialCollection) {
        return JSON.stringify(d, (k, v)=>typeof v !=="undefined" ? v:null)
    }
    static PackSingle(w:Word<POS>):DictionaryDBCollections {
        const flags = this.BuildModFlags(w);
        const seo = this.BuildSEOFlags(w);
        const WordIds = w.Aliases.map(a => a.id);

        let result:DictionaryDBCollections = {
            Word: {
                Romanised:w.Romanised,
                WordId: w.id,
                Word: w.Name,
                Aliases: w.Aliases,
                Thesaurus:w.Thesaurus
            },
            Definition: {
                WordIds: WordIds,
                Denotation:w.Denotation,
                Connotation: w.Connotation
            },
            IPA: {
                WordIds: [w.id],
                IPA: w.IPA,
                Morpheme: w.Morpheme
            },
            Lexeme: this.BuildLexeme(w),
            Editorial: {
                WordIds: WordIds,
                Flags: flags,
                SEO: seo,
                KnownPOS:w.POS !== "Unknown",
                Complete:w.IsRecordComplete
            }
        };
        return result;
    }
    static Pack(...words: Word<POS>[]) {
        const IpaMap = new Map<string, DictionaryDBMorphemeCollection>();
        const LexMap = new Map<string, DictionaryDBLexemeCollection>();
        const DefMap = new Map<string, DictionaryDBDefinitionsCollection>();
        const EditMap = new Map<string, DictionaryDBEditorialCollection>();

        const out = {
            Word: new Array<DictionaryDBWordsCollection>(),
            Definition: new Array<DictionaryDBDefinitionsCollection>(),
            Editorial: new Array<DictionaryDBEditorialCollection>(),
            IPA: new Array<DictionaryDBMorphemeCollection>(),
            Lexeme: new Array<DictionaryDBLexemeCollection>()
        };

        for (const w of words) {
            const p = this.PackSingle(w);
            out.Word.push(p.Word);
            const IpaKey = JSON.stringify({
                IPA: p.IPA.IPA ?? null,
                Morpheme: p.IPA.Morpheme ?? null
            });
            const IpaExisting = IpaMap.get(IpaKey);
            if (IpaExisting) {
                IpaExisting.WordIds.push(...p.IPA.WordIds);
            } else {
                IpaMap.set(IpaKey, { ...p.IPA });
            }
            const LexKey = this.LexemeFingerPrint(p.Lexeme);
            const LexExisting = LexMap.get(LexKey);
            if (LexExisting) {
                LexExisting.WordIds.push(...p.Lexeme.WordIds);
            } else {
                LexMap.set(LexKey, { ...p.Lexeme });
            }
            const DefKey = this.DefinitionFingerPrint(p.Definition);
            const defExisting = DefMap.get(DefKey);
            if (defExisting) {
                defExisting.WordIds.push(...p.Definition.WordIds);
            } else {
                DefMap.set(DefKey, { ...p.Definition });
            }
            const EditKey = this.EditorialFingerPrint(p.Editorial);
            const EditExisting = EditMap.get(EditKey);
            if (EditExisting) {
                EditExisting.WordIds.push(...p.Editorial.WordIds);
            } else {
                EditMap.set(EditKey, { ...p.Editorial });
            }
        }
        out.IPA = [...IpaMap.values()].map(i => ({
            ...i,
            WordIds: [...new Set(i.WordIds)]
        }));
        out.Lexeme = [...LexMap.values()].map(l => ({
            ...l,
            WordIds: [...new Set(l.WordIds)]
        }));
        out.Definition = [...DefMap.values()].map(d => ({
            ...d,
            WordIds: [...new Set(d.WordIds)]
        }));
        out.Editorial = [...EditMap.values()].map(e => ({
            ...e,
            WordIds: [...new Set(e.WordIds)]
        }));

        return out;
    }
    static BuildUpserts<T>(items: T[],filter: (i: T) => any,update: (i: T) => any) {
        return items.map(i => ({
            updateOne: { filter: filter(i), update: update(i), upsert: true }
        }));
    }
    static BuildFilters(q: DictionaryDBSearchQuery): DictionaryDBFilters {
        const dbfilters: DictionaryDBFilters = {};
        const lang = q.language ?? "English";
        if (q.word) {
            let dbwordfilter:Filter<DictionaryDBWordsCollection> = { [`Word.${lang}`]: q.word }
            dbfilters.Word = dbwordfilter;
        }
        if (q.wordid) {
            dbfilters.Word = { ...(dbfilters.Word ?? {}), WordId: {$in:q.wordid} };
        }
        if (q.pos || q.gender || q.kind) {
            dbfilters.Lexeme = {
                ...(q.pos && { POS: q.pos }),
                ...(q.gender && { [`Gender.${lang}`]: q.gender }),
                ...(q.kind && { Kind: q.kind })
            };
        }
        if (q.ipa) {
            dbfilters.IPA = { IPA: q.ipa };
        }
        if (q.flags || q.SEO) {
            dbfilters.Editorial = {
                ...(q.flags && { [`Flags.${lang}`]: { $in: q.flags[lang] } }),
                ...(q.SEO && { [`SEO.${lang}`]: { $in: q.SEO[lang] } })
            };
        }
        return dbfilters;
    } 
}