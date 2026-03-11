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
    Categories?:string[]
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
        const flags:Array<DBModFlags> = [];
        const seo:Array<DBSEOFlags> = [];
        if(w.POS === "Unknown") flags.push("UnknownPartOfSpeech");
        if (w.HasBias) flags.push("Bias");
        if (w.IsColloquial) flags.push("Colloqualism");
        if (!w.IsUsedFormally) flags.push("InformalOnly");
        if (!w.IsUsedCasually) flags.push("FormalOnly");
        if (w.IsProfane) flags.push("Profane");
        if (w.IsDerogatory) flags.push("Derogatory");
        if (w.IsOffensive) flags.push("Offensive");
        if (w.IsArchaic) flags.push("Archaic");
        if (w.IsNeologism) flags.push("Neologism");
        if (w.IsParasitic) flags.push("Parasitic");
        if (!w.IsRecordComplete)
            flags.push("Incomplete");
        if (!w.Categories || w.Categories.includes("") || w.Categories.length === 0)
            flags.push("Uncategorised");
        if (w.Visible)
            seo.push("Visible");
        if (w.Indexable)
            seo.push("Indexable");
        if (w.Visible && w.Indexable)
            seo.push("SEOIndexable");
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
                Categories:w.Categories
            },
            Editorial: {
                WordId: w.UniqueId,
                Flags: flags,
                SEO: seo
            }
        };
    }
    static *PackMany(f:"E"|"L",...w:Word<keyof PartOfSpeech>[]){
        const iter = w.map((e)=>WordMapping.Pack(e));
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
        console.log("Done!");
    }
}