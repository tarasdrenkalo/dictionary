import { Word } from "../domain/structure.js";
import { WordMapping } from "../persistance/db/mappings.js";

await WordMapping.Insert(Word.Create("Noun", {word:"fare", meaning:"Test", category:""}));