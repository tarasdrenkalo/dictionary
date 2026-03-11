import { English } from "../domain/utils/language.js";
import { DictionaryDBLookup } from "../persistance/db/lookup.js";

console.log(DictionaryDBLookup.BuldQuery("test", {
    categories:["Test"],
    uid:"123",
    language:English,
}));