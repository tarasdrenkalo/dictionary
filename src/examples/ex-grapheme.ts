import { GraphemeUtil } from "../domain/utils/grapheme.js";
import { Morpheme } from "../domain/utils/morpheme.js";

let g1 = Morpheme.Generate("Poland");
let g2 = Morpheme.Generate("czech");
g2.forEach((g)=>console.log(g.Phoneme));
//console.log(g1, g2, GraphemeUtil.AreGraphemesSame(g1, g2));