import { DictionaryDB } from "../persistance/db/core.js";
import { Dictionary } from "../persistance/dictionary.js";
let words = await Dictionary.Define({word:"love"});
await DictionaryDB.DeleteManyById(words.map(w=>w.UniqueId));
await DictionaryDB.PurgeBrokenReferences();
console.log("test");