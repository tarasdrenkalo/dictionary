import { Languages } from "../i18n/labels.js";
import { PartOfSpeech, Word, WordReference } from "./structure.js";
import pluralize from "pluralize";
export interface CasePlurality<C extends WordReference|string> {
    Singular?:C;
    Plural?:C;
}
export interface CaseStructure<C extends WordReference|string> {
    Nominative:CasePlurality<C>,
    Genitive:CasePlurality<C>,
    Dative:CasePlurality<C>,
    Accusative:CasePlurality<C>,
    Instrumental:CasePlurality<C>,
    Locative:CasePlurality<C>,
    Vocative:CasePlurality<C>
}
export class Cases {
    static Generate(wr:Word<keyof PartOfSpeech>, lang:"English"):CaseStructure<string>;
    static Generate(wr:Word<keyof PartOfSpeech>, lang:"Polish"):null|CaseStructure<string>;
    static Generate(wr:Word<keyof PartOfSpeech>, lang:"All"):CaseStructure<WordReference>;
    static Generate(wr:Word<keyof PartOfSpeech>, lang:Languages|"All"):null|CaseStructure<string>|CaseStructure<WordReference> {
        switch(lang){
            case "English": {
                const singularised = pluralize.singular(wr.Name.English);
                const pluralised = pluralize.plural(wr.Name.English);
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
            case "Polish":{
                if(typeof wr.Name.Polish != "string" || typeof wr.Gender.Polish != "string") return null;
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
                const raw = wr.Name.Polish;
                const word = raw.toLowerCase().normalize("NFC");
                const gender = wr.Gender.Polish;
                const animacy = wr.IsAnimate ?? false;
                if (gender === "F") return DeclenseF(word);
                if (gender === "N" || /[oeę]$/.test(word)) return DeclenseN(word);
                return DeclenseM(word, animacy);
            }
            case "All": {
                if(typeof wr.Cases === undefined) throw "";
                let cs:CaseStructure<WordReference> = {
                    Nominative: {},
                    Genitive: {},
                    Dative: {},
                    Accusative: {},
                    Instrumental: {},
                    Locative: {},
                    Vocative: {}
                }
                const EnglishDeclensed = this.Generate(wr, "English");
                const PolishDeclensed = this.Generate(wr, "Polish");
                const allcasesarr:Array<keyof CaseStructure<string>> = [
                    "Nominative", "Genitive", "Dative",
                    "Accusative", "Instrumental", "Locative", "Vocative"
                ];
                const allnumbers:Array<keyof CasePlurality<string>> = ["Singular", "Plural"];
                const ispolishsupported = PolishDeclensed != null;
                for(const c of allcasesarr) {
                    for(const n of allnumbers) {
                        const rf:WordReference = {
                            ExcludeFromWordChoice:wr.ExcludeFromWordChoice,
                            Exists:true,
                            Name:{English:`${EnglishDeclensed[c][n]}`},
                            WordId:crypto.randomUUID()
                        }
                        rf.Name.Polish = ispolishsupported ? PolishDeclensed[c][n]: undefined;
                        cs[c][n] = rf;
                        wr.AddAlias(rf, c, n);
                    }
                }
                return cs;
            }
            default: {
                throw "Check your parametres!"
            }
        }
    }
}