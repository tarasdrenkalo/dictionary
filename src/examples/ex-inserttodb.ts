import { Word } from "../domain/structure.js";
import { DictionaryDB } from "../persistance/db/core.js";

let poland = Word.Create("Propernoun", {
    word: {English:"Poland",Polish:"Polska"},
    meaning: {English:"Country in the Middle Europe", Polish:"Panstwo"},
    kind:"Country",
});
poland.AddAlias({English:"Polandia", Polish:"Polski"}, "Nominative");
await DictionaryDB.InsertToDB(DictionaryDB.Pack(poland));
console.log("Inserted to db.");
console.log(await DictionaryDB.Search({word:"Polska", language:"Polish"}));
console.log("Done.");