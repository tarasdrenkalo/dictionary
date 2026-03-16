import { i18n } from "../i18n/labels.js";

export interface CasePlurality {
    Singular:i18n<string>;
    Plural:i18n<string>;
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
    static All(word:string):CaseStructure{
        return {
            Nominative:{Singular:{English:word}, Plural:{English:word}},
            Genitive:{Singular:{English:word}, Plural:{English:word}},
            Dative:{Singular:{English:word}, Plural:{English:word}},
            Accusative:{Singular:{English:word}, Plural:{English:word}},
            Ablative:{Singular:{English:word}, Plural:{English:word}},
            Local:{Singular:{English:word}, Plural:{English:word}},
            Vocative:{Singular:{English:word}, Plural:{English:word}}
        }
    }
}