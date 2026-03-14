import { GenericDefinition } from "../../domain/definition.js";
import { MorphemeStructure } from "../../domain/utils/morpheme.js";
import { Adjective, Adverb, Conjunction, Determiner, Noun, Participle, PartOfSpeech, Preposition, Pronoun, Propernoun, Verb, Word, WordReference } from "../../domain/structure.js";
import { Grapheme } from "../../domain/utils/grapheme.js";
import { Gender } from "../../domain/variants.js";
import { TenseContainer } from "../../domain/tense.js";
import { CaseStructure } from "../../domain/cases.js";
import { Thesaurus } from "../../domain/thesaurus.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
import { Language } from "../../domain/utils/language.js";
import { MongoClient } from "mongodb";
import { PersonPerspective } from "../../domain/options.js";
export interface DBLexemeCollection {
    UniqueId:string,
    Name:string,
    DerivativeOf:WordReference,
    POS:keyof PartOfSpeech,
    Language:Language,
    Meaning:GenericDefinition,
    Morpheme:MorphemeStructure,
    Gender:Gender,
    IsPropernoun:boolean,
    IsAbbreviation:boolean,
    IsShortened:boolean,
    IsConjugatable:boolean,
    Tenses?:TenseContainer,
    Cases?:CaseStructure,
    CurrentCase?:keyof CaseStructure;
    Thesaurus?:Thesaurus,
    Category?:string,
    Kind?:string,
    Comparative?:string,
    Superlative?:string,
    PersonPerspective:PersonPerspective;
}
export interface DBModCollection {
    WordId:string,
    Flags:Array<DBModFlags>,
    SEO:Array<DBSEOFlags>;
}
export interface DBIPACollection {
    Word:string;
    WordIds:string[];
    IPA?:Grapheme[],
}
export interface StorableCollection {
    Lexeme:DBLexemeCollection;
    Editorial:DBModCollection;
    IPA:DBIPACollection;
}

export class WordMapping {
    static Pack(w: Word<keyof PartOfSpeech>): StorableCollection {
        const flags:Set<DBModFlags> = new Set();
        const seo:Set<DBSEOFlags> = new Set();
        if(w.POS === "Unknown") flags.add("UnknownPartOfSpeech").add("Incomplete");
        if (w.HasBias) flags.add("Bias");
        if (w.IsColloquial) flags.add("Colloquialism");
        if (!w.IsUsedFormally) flags.add("InformalOnly");
        if (!w.IsUsedCasually) flags.add("FormalOnly");
        if (w.IsProfane) flags.add("Profane");
        if (w.IsDerogatory) flags.add("Derogatory");
        if (w.IsOffensive) flags.add("Offensive");
        if (w.IsArchaic) flags.add("Archaic");
        if (w.IsNeologism) flags.add("Neologism");
        if (w.IsParasitic) flags.add("Parasitic");
        if (!w.IsRecordComplete)
            flags.add("Incomplete");
        if (w.Category === "Uncategorised")
            flags.add("Uncategorised");
        if (w.Visible)
            seo.add("Visible");
        if (w.Indexable)
            seo.add("Indexable");
        if (w.Visible && w.Indexable)
            seo.add("SEOIndexable");
        if(w instanceof Verb || w instanceof Participle) {
            if(w.IsTransitive) flags.add("Transitive");
            if(w.IsActive) flags.add("Active");
        }
        if(w instanceof Noun){
            if(w.IsSingular) flags.add("Singular")
            if(w.IsPlural) flags.add("Plural");
            if(w.IsSingularOnly) flags.add("SingularOnly");
            if(w.IsPluralOnly) flags.add("PluralOnly");
            if(!w.IsCountable) flags.add("Uncountable");
        }
        const needskind = w instanceof Adverb || w instanceof Determiner ||
        w instanceof Conjunction || w instanceof Pronoun || w instanceof Preposition || w instanceof Propernoun;
        const needscases = (w.POS === "Adjective" || w.POS === "Noun" || w.POS === "Pronoun" || w.POS === "Participle");
        return {
            Lexeme: {
                UniqueId: w.UniqueId,
                Name: w.Name,
                PersonPerspective:w.PersonPerspective,
                POS: w.POS,
                DerivativeOf:w.DerivativeOf,
                Language: w.Language,
                Meaning: w.Meaning.ToJSON(),
                Morpheme: w.Morpheme,
                Gender: w.Gender,
                IsPropernoun: w.IsPropernoun,
                IsAbbreviation: w.IsAbbreviation,
                IsShortened: w.IsShortened,
                IsConjugatable: w.IsConjugatable,
                Tenses: w.Tenses,
                Cases: needscases ? w.Cases:undefined,
                CurrentCase: needscases ? w.CurrentCase : undefined,
                Thesaurus: w.Thesaurus,
                Category:w.Category,
                Comparative: w instanceof Adjective || w instanceof Participle ? w.Comparative:Adjective.CS(w.Name, true),
                Superlative: w instanceof Adjective || w instanceof Participle ? w.Superlative:Adjective.CS(w.Name, false),
                Kind:needskind ? w.Kind: undefined,
            },
            Editorial: {
                WordId: w.UniqueId,
                Flags: [...flags],
                SEO: [...seo]
            },
            IPA:{
                Word: w.Name,
                WordIds:[w.UniqueId],
                IPA:w.IPA
            }
        };
    }
    static PackMany(f:"E"|"L", ...w:Word<keyof PartOfSpeech>[]) {
        return w.map(v => {
            const p = WordMapping.Pack(v);
            return f === "E" ? p.Editorial : p.Lexeme;
        });
    }

    static async Insert(...entries:Word<keyof PartOfSpeech>[]){
        const mclient  = new MongoClient(`mongodb://${process.env.MONGODB_HOST||"localhost"}:${process.env.MONGODB_PORT||"27017"}/`);
        await mclient.connect();
        const ddb = mclient.db("Dictionary");
        const lex = ddb.collection("Words");
        const mod = ddb.collection("Metadata");
        const ipa = ddb.collection("IPA");
        const packed = entries.map(WordMapping.Pack);
        await lex.insertMany(packed.map(p => p.Lexeme));
        await mod.insertMany(packed.map(p => p.Editorial));

        for (const p of packed) {
            await ipa.findOneAndUpdate(
                { Word: p.IPA.Word },
                {$addToSet: { WordIds: p.Lexeme.UniqueId }},
                { upsert: true }
            );
        }
        await mclient.close();
        console.log(`Successfully inserted into database`);
    }
}