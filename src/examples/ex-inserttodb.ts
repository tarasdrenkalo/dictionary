import { Word } from "../domain/structure.js";
import { DictionaryDB } from "../persistance/db/core.js";

let sky = Word.Create("Noun", {
    word: {English:"sky",Polish:"niebo"},
    meaning: {English:"Sky", Polish:"Niebo"},
    kind:"Country",
});
await DictionaryDB.InsertToDB(DictionaryDB.Pack(sky));
console.log("Inserted to db.");
console.log(await DictionaryDB.Search({word:"niebo", language:"Polish"}));
console.log("Done.");