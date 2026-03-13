import { Noun, Word } from "../domain/structure.js";
import { DictionaryDBLookup } from "../persistance/db/lookup.js";
import { WordMapping } from "../persistance/db/mappings.js";
const w = Word.Create("Noun", {
    meaning: "Test entry",
    word: "test",
});
const w2 = Word.Create("Verb", {
    meaning: "Test entry",
    word: "test",
})
w2.Meaning.Edit("Secod defintion version", "Test", []);
await WordMapping.Insert(w, w2);
let e = await DictionaryDBLookup.Lookup(w.Name, {uid:w.UniqueId});
for(let f of e){
    console.log(f instanceof Word ? f.Meaning.Versions: "");
}