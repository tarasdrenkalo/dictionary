import { writeFile } from "fs";
import { Word } from "../core/word/structure.js";

const w = Word.Create("Noun", {word:"test",meaning:"Test", kind:"",category:"None"});
let i=100;
do {
    writeFile(`./storage/${i}.json`, JSON.stringify(w), {encoding:"utf-8"}, console.log);
    i--;
} while (i>=0);