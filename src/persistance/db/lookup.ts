import { MongoClient } from "mongodb";
import { English, Language } from "../../domain/utils/language.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
import { PartOfSpeech, Preposition, Word, Words } from "../../domain/structure.js";
import { Definition } from "../../domain/definition.js";
import { Grapheme } from "../../domain/utils/grapheme.js";
import { Gender } from "../../domain/variants.js";
import { MorphemeStructure } from "../../domain/utils/morpheme.js";
import { TenseContainer } from "../../domain/tense.js";
import { CaseStructure } from "../../domain/cases.js";
import { Thesaurus } from "../../domain/thesaurus.js";

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
    static BuldQuery(word?:string, from:DictionaryDBQuery={}){
        let needsflags = from.needsattention||from.includebiased||from.includeoffensive||from.includeuncategorised;
        let querytmpl:DictionaryDBAggregate = {
            Lexeme:{},
            Editorial:{},
        };
        if(typeof needsflags === "boolean" && needsflags) querytmpl.Editorial.Flags = {$in:[]};
        if(typeof from.uid !=="undefined") {querytmpl.Lexeme.UniqueId = from.uid; querytmpl.Editorial.WordId = from.uid}
        if(typeof from.language !=="undefined") querytmpl.Lexeme.Language = from.language.Name;
        if(typeof word !== "undefined") querytmpl.Lexeme.Name = word;
        if(from.needsattention) querytmpl.Editorial.Flags?.$in.push("Incomplete");
        if(from.includebiased) querytmpl.Editorial.Flags?.$in.push("Bias");
        if(from.includeoffensive) querytmpl.Editorial.Flags?.$in.push("Offensive");
        if(from.includeuncategorised) querytmpl.Editorial.Flags?.$in.push("Uncategorised");
        return querytmpl;
    }
    static async Lookup(word:string, options:DictionaryDBQuery){
        const mdbclient = new MongoClient("mongodb://localhost:27017/");
        const mdblex = mdbclient.db("Dictionary").collection("Words");
        const mdbmod = mdbclient.db("Dictionary").collection("Metadata");
        const mdblexres = await mdblex.find(DictionaryDBLookup.BuldQuery(word, options).Lexeme).toArray();
        let words:Words = [];
        for(let mdblexre of mdblexres) {
            const editorial = await mdbmod.findOne(DictionaryDBLookup.BuldQuery(word, options).Editorial);
            let w = Word.Create(mdblexre.POS as keyof PartOfSpeech, {
                word: mdblexre.Name,
                meaning: mdblexre.Meaning
            });
            w.UniqueId = mdblexre.UniqueId;
            w.POS = mdblexre.POS as keyof PartOfSpeech;
            w.Language = English;
            words.push(w);
            w.IPA = mdblexre.IPA as Grapheme[];
            w.Gender = mdblexre.Gender as Gender;
            //w.Meaning = Definition;
            w.Morpheme = mdblexre.Morpheme as MorphemeStructure;
            w.IsPropernoun = w.POS === "Propernoun";
            w.IsAbbreviation = mdblexre.IsAbbreviation;
            w.IsShortened = mdblexre.IsShortened;
            w.IsConjugatable = mdblexre.IsConjugatable;
            w.Tenses = mdblexre.Tenses as TenseContainer||undefined;
            w.Cases = mdblexre.Cases as CaseStructure || undefined;
            w.Thesaurus = mdblexre.Thesaurus as Thesaurus;
            w.Category = mdblexre.Category as string;

            let flags = editorial?.Flags as Array<DBModFlags>||undefined;
            let seoflags = editorial?.Flags as Array<DBSEOFlags>||undefined;
            w.HasBias = flags.includes("Bias");
            w.IsColloquial = flags.includes("Colloqualism");
            w.IsUsedFormally = !flags.includes("InformalOnly")
            w.IsUsedCasually = !flags.includes("FormalOnly");
            w.IsProfane = flags.includes("Profane");
            w.IsDerogatory = flags.includes("Derogatory");
            w.IsOffensive = flags.includes("Offensive");
            w.ExcludeFromWordChoice = w.IsProfane || w.IsDerogatory || w.IsOffensive || w.HasBias;
            w.IsArchaic = flags.includes("Archaic");
            w.IsNeologism = flags.includes("Neologism");
            w.IsParasitic = flags.includes("Parasitic");
            w.IsRecordComplete = !flags.includes("Incomplete");
            w.Visible = seoflags.includes("Visible");
            w.Indexable = seoflags.includes("Indexable");
            words.push(w);
        }
        console.log(words);
    }
}