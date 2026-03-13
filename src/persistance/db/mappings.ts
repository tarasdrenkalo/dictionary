import { GenericDefinition } from "../../domain/definition.js";
import { MorphemeStructure } from "../../domain/utils/morpheme.js";
import { PartOfSpeech, Word, Words } from "../../domain/structure.js";
import { Grapheme } from "../../domain/utils/grapheme.js";
import { Gender } from "../../domain/variants.js";
import { TenseContainer } from "../../domain/tense.js";
import { CaseStructure } from "../../domain/cases.js";
import { Thesaurus } from "../../domain/thesaurus.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
import { Language } from "../../domain/utils/language.js";
import { MongoClient } from "mongodb";
export interface DBLexemeCollection {
    UniqueId:string,
    Name:string,
    POS:keyof PartOfSpeech,
    Language:Language,
    Meaning:GenericDefinition,
    IPA:Grapheme[],
    Morpheme:MorphemeStructure,
    Gender:Gender,
    IsPropernoun:boolean,
    IsAbbreviation:boolean,
    IsShortened:boolean,
    IsConjugatable:boolean,
    Tenses?:TenseContainer,
    Cases?:CaseStructure,
    Thesaurus?:Thesaurus,
    Category?:string
}
export interface DBModCollection {
    WordId:string,
    Flags:Array<DBModFlags>,
    SEO:Array<DBSEOFlags>;
}
export interface StorableCollection {
    Lexeme:DBLexemeCollection;
    Editorial:DBModCollection;
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
        return {
            Lexeme: {
                UniqueId: w.UniqueId,
                Name: w.Name,
                POS: w.POS,
                Language: w.Language,
                Meaning: w.Meaning,
                IPA: w.IPA,
                Morpheme: w.Morpheme,
                Gender: w.Gender,
                IsPropernoun: w.IsPropernoun,
                IsAbbreviation: w.IsAbbreviation,
                IsShortened: w.IsShortened,
                IsConjugatable: w.IsConjugatable,
                Tenses: w.Tenses,
                Cases: w.Cases,
                Thesaurus: w.Thesaurus,
                Category:w.Category
            },
            Editorial: {
                WordId: w.UniqueId,
                Flags: flags.values().toArray(),
                SEO: seo.values().toArray()
            }
        };
    }
    static *PackMany(f:"E"|"L",...w:Word<keyof PartOfSpeech>[]){
        const iter = w.map(WordMapping.Pack);
        for(let i of iter){
            yield f==="E"? i.Editorial : i.Lexeme;
        }
    }

    static async Insert(...entries:Word<keyof PartOfSpeech>[]){
        const mdbclient  = new MongoClient("mongodb://localhost:27017/");
        const mdblexcoll = mdbclient.db("Dictionary").collection("Words");
        const mdbmodcoll = mdbclient.db("Dictionary").collection("Metadata");
        await mdblexcoll.insertMany(WordMapping.PackMany("L", ...entries).toArray());
        await mdbmodcoll.insertMany(WordMapping.PackMany("E", ...entries).toArray());
        await mdbclient.close();
        console.log(`Successfully inserted into database`);
    }
}