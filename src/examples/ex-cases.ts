import { Cases } from "../domain/cases.js";
import { Word } from "../domain/structure.js";
const w = Word.Create("Noun", {
    word: { English: "sky", Polish: "niebo" },
    meaning: {English:"sky", Polish:"niebo"},
    animate:true
})
console.log(Cases.Generate(w, "All"));
console.log(w.Aliases.map(a=>a.Name));