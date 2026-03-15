import { Release, Version } from "../../domain/release.js";
import { DictionaryDBLookup, DictionaryDBQuery } from "../db/lookup.js";

export class Dictionary {
    static RELEASE = Release;
    static VERSION = Version;
    static async *Define(word:string, options:Pick<DictionaryDBQuery, "categories"|"includebiased"|"includeoffensive"|"includeuncategorised"|"language">={}) {
        let entries = await DictionaryDBLookup.Lookup(word, options);
        for(let entry of entries) {
            yield entry;
        }
    }
}