import { Word } from "../domain/structure.js";
import { WordMapping } from "../persistance/db/mappings.js";
import { Dictionary } from "../persistance/dictionary/main.js";

const words = [
    Word.Create("Noun", {meaning: "Test entry", word: "test"}),
    Word.Create("Verb",{meaning: "Test entry",word: "test"}),
    Word.Create("Noun",{meaning:"Help", word:"help"}),
    Word.Create("Verb",{meaning:"Another help", word:"help"}),
]
await WordMapping.Insert(...words);
for await(let word of Dictionary.Define("help")) {
    console.log(word);
}