import { Word } from "../domain/structure.js";
import { DictionaryDB } from "../persistance/db/core.js";

let poland = Word.Create("Propernoun", {
    word: {English:"Poland",Polish:"Polska"},
    meaning: {English:"Country in the Middle Europe", Polish:"Panstwo"},
    kind:"Country",
});

poland.Aliases.push({
    Name: {English:"Poland",Polish:"Polska"},
    Exists: true,
    ExcludeFromWordChoice: false,
    WordId: crypto.randomUUID()
});
poland.Name.Polish = "Polska";
await DictionaryDB.InsertToDB(DictionaryDB.Pack(poland));
console.log("Inserted to db.");
console.log(await DictionaryDB.Search({word:"Polska", language:"Polish"}));
console.log("Done.");