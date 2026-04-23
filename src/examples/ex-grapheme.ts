import { Cases } from "../domain/cases.js";
import { Word } from "../domain/structure.js";
import { GraphemeUtil } from "../domain/utils/grapheme/handlers.js";
import { Morpheme } from "../domain/utils/morpheme.js";

let g1 = Morpheme.Generate("Polish", "przyjemnego");
let g2 = Morpheme.Generate("Polish", "przyjemnego");
const w = Word.Create("Noun", {word:{English:"thing", "Polish":"rzecz"}, "meaning":{English:"", Polish:""}, kind:"Thing"})
const c = Cases.Generate(w, "Polish")
const t = GraphemeUtil.AreGraphemesSame("Polish", g1, g2);

const i = `/${g2.map(a=>{if(a.Phoneme.State === "Resolved") return a.Phoneme.Symbol}).join("")}/`
console.log(i)