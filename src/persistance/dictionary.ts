import { Release, Version } from "../domain/release.js";
import { DictionaryDB } from "./db/core.js";
import { DBSearchQuery } from "./db/mappings.js";

export class Dictionary {
    static VERSION = Version;
    static RELEASE = Release;
    static async Define(query:DBSearchQuery){
        return await DictionaryDB.Search(query);
    }
}