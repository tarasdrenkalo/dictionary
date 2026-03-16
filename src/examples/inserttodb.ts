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
DictionaryDB.InsertToDB(DictionaryDB.PackMany(lovefeeling, loveaction));
console.log(await DictionaryDB.Search({word:"love", pos:"Noun"}));