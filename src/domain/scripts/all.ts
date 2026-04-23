import { Cyrillic } from "./cyrillic.js";
import { Latin } from "./latin.js";

export interface LanguageScripts {
    Latin:typeof Latin;
    Cyrillic:typeof Cyrillic;
}