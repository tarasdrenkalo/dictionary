import pluralize from "pluralize";
import { CasePlurality, CaseStructure } from "./base.n.js";
import {Gender} from "@dictionary/misc";

export function ENGLISH_DECLENCE_NOUN(word:string):CaseStructure<string>{
    const singularised = pluralize.singular(word);
    const pluralised = pluralize.plural(word);
    let tbp:CasePlurality<string> = {
        Singular:singularised, Plural:pluralised
    }
    let tbl:CaseStructure<string> = {
        Nominative: tbp,
        Genitive: tbp,
        Dative: tbp,
        Accusative: tbp,
        Instrumental: tbp,
        Locative: tbp,
        Vocative: tbp
    }
    return tbl;
}
export function POLISH_DECLENCE_NOUN(word:string,gender:Gender, animate:boolean=false){
    const HARD_CONSONANTS = new Set([
        "p", "b", "m", "f", "w",
        "t", "d", "s", "z", "n", "r", "ł",
        "k", "g", "h", "ch",
    ]);
    const SOFT_CONSONANTS = new Set([
        "ś", "ź", "ć", "dź", "ń", "ż", "rz", "sz", "cz", "j", "l",
    ]);
    const SOFTEN_MAP: Record<string, string> = {
        "k": "c",
        "g": "dz",
        "ch": "sz",
    };
    let LastLetter = (word: string) => word.slice(-1);
    let SoftenStem = (word: string) => {
        for (const [hard, soft] of Object.entries(SOFTEN_MAP)) {
            if (word.endsWith(hard)) {
                return word.slice(0, -hard.length) + soft;
            }
        }
        return word;
    }
    let PluralYorI = (stem: string) => {
        const c = LastLetter(stem);
        return SOFT_CONSONANTS.has(c) ? stem + "i": stem + "y";
    }
    let DeclenseF = (base: string) => {
        const stem = base.slice(0, -1);
        const plural = PluralYorI(stem);
        let cs: CaseStructure<string> = {
            Nominative:   { Singular: base, Plural: plural },
            Genitive:     { Singular: stem + (base.endsWith("a") ? "y" : "i"), Plural: stem + "ów" },
            Dative:       { Singular: stem + (base.endsWith("a") ? "ie" : "y"), Plural: stem + "om" },
            Accusative:   { Singular: base, Plural: plural },
            Instrumental: { Singular: stem + "ą", Plural: stem + "ami" },
            Locative:     { Singular: stem + (base.endsWith("a") ? "ie" : "y"), Plural: stem + "ach" },
            Vocative:     { Singular: stem + (base.endsWith("a") ? "o" : ""), Plural: plural }
        };
        return cs;
    }
    let DeclenseM = (base: string, animacy: boolean) => {
        const softened = SoftenStem(base);
        const plural = PluralYorI(softened);
        const gen = base + (animacy ? "a" : "u");
        const acc = animacy ? gen : base;
        let cs: CaseStructure<string> = {
            Nominative:   { Singular: base, Plural: plural },
            Genitive:     { Singular: gen, Plural: softened + "ów" },
            Dative:       { Singular: base + "owi", Plural: softened + "om" },
            Accusative:   { Singular: acc, Plural: softened + "ów" },
            Instrumental: { Singular: base + "em", Plural: softened + "ami" },
            Locative:     { Singular: base + "e", Plural: softened + "ach" },
            Vocative:     { Singular: softened + "u", Plural: plural }
        };
        return cs;
    };
    let DeclenseN = (base: string) => {
        const stem = base.slice(0, -1); // -o / -e
        const plural = stem + "a";
        let cs:CaseStructure<string> = {
            Nominative: {Singular:base, Plural:plural},
            Genitive: {Singular:stem+"a", Plural:stem+"ów"},
            Dative:{Singular: stem+"u",Plural:stem+"om"},
            Accusative:{Singular:base,Plural: plural },
            Instrumental:{Singular:stem+"em",Plural: stem+"ami" },
            Locative: {Singular: stem + "e",Plural: stem + "ach" },
            Vocative: {Singular: base, Plural: plural },
        }
        return cs;
    }
    const raw = word;
    const normalised = raw.toLowerCase().normalize("NFC");
    const animacy = animate ?? false;
    if (gender === "F") return DeclenseF(normalised);
    if (gender === "N" || /[oeę]$/.test(normalised)) return DeclenseN(normalised);
    return DeclenseM(word, animacy);
}
export function POLISH_DECLENCE_ADJECTIVE(word:string){
    let stem = word.slice(0, -1);
    if(word.endsWith("y")){
        let cs:CaseStructure<string> = {
            Nominative:{Singular:word, Plural:stem+"i"},
            Genitive:{Singular:stem+"ego", Plural:stem+"ych"},
            Dative:{Singular:stem+"emu", Plural:stem+"ym"},
            Accusative:{Singular:word, Plural:stem+"ych"},
            Instrumental:{Singular:stem+"ym", Plural:stem+"ymi"},
            Locative:{Singular:stem+"ym", Plural:stem+"ych"},
            Vocative:{Singular:word, Plural:stem+"i"}
        }
        return cs;
    }
    else if(word.endsWith("a")){
        let cs:CaseStructure<string> = {
            Nominative:{Singular:stem+"a", Plural:stem+"e"},
            Genitive:{Singular:stem+"ej", Plural:stem+"ych"},
            Dative:{Singular:stem+"ej", Plural:stem+"ym"},
            Accusative:{Singular:stem+"ą", Plural:stem+"e"},
            Instrumental:{Singular:stem+"ą", Plural:stem+"ymi"},
            Locative:{Singular:stem+"ej", Plural:stem+"ych"},
            Vocative:{Singular:stem+"a", Plural:stem+"e"}
        }
        return cs;
    }
    else if(word.endsWith("e")){
        let cs:CaseStructure<string> = {
            Nominative:{Singular:stem+"e", Plural:stem+"e"},
            Genitive:{Singular:stem+"ego", Plural:stem+"ych"},
            Dative:{Singular:stem+"emu", Plural:stem+"ym"},
            Accusative:{Singular:stem+"e", Plural:stem+"e"},
            Instrumental:{Singular:stem+"ym", Plural:stem+"ymi"},
            Locative:{Singular:stem+"ym", Plural:stem+"ych"},
            Vocative:{Singular:stem+"e", Plural:stem+"e"}
        }
        return cs;
    }
}