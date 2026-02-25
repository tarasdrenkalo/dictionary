import {unlink, writeFileSync} from "fs";
import {Word} from "./core/word/structure.js";
const w = Word.Create("Noun", {word:"fare", meaning:"price to ride bus", kind:"", category:"None"});
const file = "./test.json"
writeFileSync(file, JSON.stringify(w), {encoding:"utf-8"});
console.log("Resolved: ./test.json");
console.log(w);
setTimeout((()=>{
    unlink(file, (e)=>{if(e){console.error(e);}console.log("Deleted")});
}), 3000);