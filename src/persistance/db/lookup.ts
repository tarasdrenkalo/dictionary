import { PartOfSpeech } from "../../domain/structure.js";

export interface DictionaryDBQuery {
    word?:string;
    pos?:keyof PartOfSpeech;
    uid?:string;
    needsattention?:boolean;
}
export class DictionaryDBLookup {
    
}