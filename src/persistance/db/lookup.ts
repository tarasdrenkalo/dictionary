import { MongoClient } from "mongodb";
import { PartOfSpeech } from "../../domain/structure.js";
import { Language } from "../../domain/utils/language.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";

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
}