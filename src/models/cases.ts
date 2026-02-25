import { English, Language } from "./language.js";

export interface CasePlurality {
    Singular:string;
    Plural:string;
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
    static All(word:string, language:Language=English):CaseStructure{
        if(language != English) throw "Only English Supported!";
        return {
            Nominative:{"Singular":word, "Plural":word},
            Genitive:{"Singular":word, "Plural":word},
            Dative:{"Singular":word, "Plural":word},
            Accusative:{"Singular":word, "Plural":word},
            Ablative:{"Singular":word, "Plural":word},
            Local:{"Singular":word, "Plural":word},
            Vocative:{"Singular":word, "Plural":word}
        }
    }
}