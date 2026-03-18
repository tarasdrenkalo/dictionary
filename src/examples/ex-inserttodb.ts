import { Word } from "../domain/structure.js";
import { DictionaryDB } from "../persistance/db/core.js";

let lovefeeling = Word.Create("Noun", {
    word: "love",
    meaning: "Feeling"
});
let loveaction = Word.Create("Verb", {
    word: "love",
    meaning: "Deed"
});
await DictionaryDB.InsertToDB(DictionaryDB.PackMany(lovefeeling, loveaction));
console.log("Inserted to db.");
console.log(await DictionaryDB.Search({word:"love", pos:"Noun"}));
console.log("Done.");