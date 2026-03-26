import { WordReference } from "./structure.js";

export interface CasePlurality {
    Singular:WordReference;
    Plural:WordReference;
}
export interface CaseStructure {
    Nominative:CasePlurality,
    Genitive:CasePlurality,
    Dative:CasePlurality,
    Accusative:CasePlurality,
    Ablative:CasePlurality,
    Local:CasePlurality,
    Vocative:CasePlurality
}
export class Cases {
    static All(word:WordReference):CaseStructure{
        return {
            Nominative:{Singular:word, Plural:word},
            Genitive:{Singular:word, Plural:word},
            Dative:{Singular:word, Plural:word},
            Accusative:{Singular:word, Plural:word},
            Ablative:{Singular:word, Plural:word},
            Local:{Singular:word, Plural:word},
            Vocative:{Singular:word, Plural:word}
        }
    }
}