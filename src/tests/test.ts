import { Dictionary } from "../core/db/mongodb.js";
import { Word } from "../core/word/structure.js";
const a = [];
let i;
const w = Word.Create("Noun", {word:"Tester",meaning:"Tester", category:"Test"});
for(i=1;i<=1000;i++){
    a.push(w);
    console.log(`Saving ${i} times`);
}

await Dictionary.Save(a);
console.log("Done! Check database");
