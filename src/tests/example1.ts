import { Word } from "../domain/structure.js";
import { DictionaryDBLookup } from "../persistance/db/lookup.js";
import { WordMapping } from "../persistance/db/mappings.js";
const w = Word.Create("Noun", {
    meaning: "Test entry",
    word: "test",
});
const w2 = Word.Create("Verb", {
    meaning: "Test entry",
    word: "test",
});
await WordMapping.Insert(w, w2);
await DictionaryDBLookup.Lookup(w.Name, {uid:w.UniqueId});