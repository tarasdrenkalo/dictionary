import {Gerund} from "@dictionary/gerund";
import { EnglishTenseBlock, PolishTenseBlock, TenseContainer, TenseContainerByLanguage, TenseTime, TenseTimed } from "./base.v.js";
export class EnglishVerbConjugator {
    static BuildStructure(
        forms: (person:1|2|3, plural: boolean) => string
    ): EnglishTenseBlock<string> {
        let result:EnglishTenseBlock<string> = {
            1: {
                Singular: forms(1, false),
                Plural: forms(1, true)
            },
            2: {
                Singular: forms(2, false),
                Plural: forms(2, true)
            },
            3: {
                Singular: forms(3, false),
                Plural: forms(3, true)
            }
        }
        return result;
    }

    static GetTenseTimed(
        w: string,
        t: TenseTime,
        d: "GB"|"US"="GB"
    ): TenseTimed<typeof t, string>["English"] {
        const ing = Gerund.ing(w, d);
        const EdPast = Gerund.ed(w, d, false);
        const EdParticiple = Gerund.ed(w, d, true);
        let third: string;
        if (w.endsWith("s")) third = w + "es";
        else if (w.endsWith("y") && !"aeiou".includes(w.at(-2)!)) third = w.slice(0, -1) + "ies";
        else third = w + "s";
        const be = {
            Present: ["am", "are", "is", "are"],
            Past:    ["was", "were", "was", "were"],
            Future:  ["will be", "will be", "will be", "will be"],
            }[t];
        const have = {
            Present: ["have", "have", "has"],
            Past:    ["had", "had", "had"],
            Future:  ["will have", "will have", "will have"],
        }[t];
        const SimpleBase = t === "Past"   ? EdPast : t === "Future" ? `will ${w}`: w;
        const Simple = this.BuildStructure((p, plural) => {
            if (t === "Present" && p === 3 && !plural) return third;
            return SimpleBase;
        });
        const Prog = this.BuildStructure((p, plural) => {
            const aux = plural ? be[3] : be[p - 1];
            return `${aux} ${ing}`;
        });
        const Part = this.BuildStructure(() => EdParticiple);
        const Perf = this.BuildStructure((p, plural) => {
            const aux = plural ? have[0] : have[p - 1];
            return `${aux} ${EdParticiple}`;
        });
        let result:TenseTimed<typeof t, string>["English"] = {
            Simple: Simple,
            Progressive: Prog,
            Participle: Part,
            Perfect: Perf
        }

        return result;
    }
    static Conjugate(w: string, d: "GB"|"US" = "GB"): TenseContainer<"English", string> {
        let result:TenseContainer<"English", string> = {
            Present: this.GetTenseTimed(w, "Present", d),
            Past:    this.GetTenseTimed(w, "Past", d),
            Future:  this.GetTenseTimed(w, "Future", d),
        };
        return result;
    }
}
export class PolishVerbConjugator {
    static Conjugate(word:string):TenseContainerByLanguage<string>["Polish"] {
        let Stem = (w:string):string=>{
            return w.slice(0, (w.endsWith("ować") ? -5 : 
            w.endsWith("nąć") ? -4 : 
            w.endsWith("ać")||w.endsWith("ić")||w.endsWith("yć")||w.endsWith("uć")||w.endsWith("eć")||w.endsWith("ec")) ? -3: -2)
        }
        let present = (w:string):PolishTenseBlock<"Present", string>=>{
            let stem = Stem(w);
            let result:PolishTenseBlock<"Present", string> = {
                1: {
                    Singular: stem + (w.endsWith("ować")||w.endsWith("uć") ? "uję"
                    :  w.endsWith("ać") ? "am"
                    : w.endsWith("yć") ? "ję"
                    : w.endsWith("ić") ? "ię"
                    : w.endsWith("nąć") ? "nę"
                    : ""),
                    Plural: stem + (w.endsWith("ować")||w.endsWith("uć") ? "ujemy" 
                    : w.endsWith("ać") ? "amy"
                    : w.endsWith("yć") ? "jemy"
                    :w.endsWith("ić") ? "imy"
                    : w.endsWith("nąć") ? "niemy"
                    :""),
                },
                2: {
                    Singular: stem + (w.endsWith("ować")||w.endsWith("uć") ? "ujesz" 
                    : w.endsWith("ać") ? "asz"
                    : w.endsWith("yć") ? "jesz"
                    :w.endsWith("ić") ? "isz"
                    : w.endsWith("nąć") ? "niesz"
                    :""),
                    Plural: stem + (w.endsWith("ować")||w.endsWith("uć") ? "ujecie" 
                    : w.endsWith("ać") ? "acie"
                    : w.endsWith("yć") ? "jemy"
                    :w.endsWith("ić") ? "icie"
                    : w.endsWith("nąć") ? "niecie"
                    :""),
                },
                3: {
                    Singular: stem + (w.endsWith("ować")||w.endsWith("uć") ? "uje"
                    :w.endsWith("ać") ? "a"
                    : w.endsWith("yć") ? "je"
                    :w.endsWith("ić") ? "i"
                    : w.endsWith("nąć") ? "nie"
                    : ""),
                    Plural: stem + (w.endsWith("ować")||w.endsWith("uć") ? "ują"
                    : w.endsWith("ać") ? "ają"
                    : w.endsWith("yć") ? "ją"
                    :w.endsWith("ić") ? "ią"
                    : w.endsWith("nąć") ? "ną"
                    : ""),
                }
            }
            return result;
        }
        let PastFrom3M = (w: string): PolishTenseBlock<"Past", string> => {
            const stem = w.slice(0, -1); // robił → robi-
            let result:PolishTenseBlock<"Past", string> = {
                1: {
                    Singular: {
                        M: stem + "łem",
                        F: stem + "łam",
                    },
                    Plural: stem + "liśmy"
                },
                2: {
                    Singular: {
                        M: stem + "łeś",
                        F: stem + "łaś",
                    },
                    Plural: stem+"liście"
                },
                3: {
                    Singular: {
                        M: w,
                        F: stem + "ła",
                        N: stem + "ło"
                    },
                    Plural: stem + "li"
                }
            }
            return result;
        }
        let past = (w: string): PolishTenseBlock<"Past", string> => {
            const stem = Stem(w);
            if (w.endsWith("ać"))  return PastFrom3M(stem + "ał");
            if (w.endsWith("ić"))  return PastFrom3M(stem + "ił");
            if (w.endsWith("yć"))  return PastFrom3M(stem + "ył");
            if (w.endsWith("ować"))return PastFrom3M(stem + "ował");
            if (w.endsWith("nąć")) return PastFrom3M(stem + "nął");
            if (w.endsWith("uć"))  return PastFrom3M(stem + "uł");
            return PastFrom3M(stem + "ł");
        }
        let future = (w: string): PolishTenseBlock<"Future", string> => {
            const stem = Stem(w);
            let result:PolishTenseBlock<"Future", string> = {
                1: {
                    Singular: stem + "ę",
                    Plural: stem + "emy"
                },
                2: {
                    Singular: stem+"esz",
                    Plural: stem+"ecie"
                },
                3: {
                    Singular: stem+"e",
                    Plural: "ą"
                }
            }
            return result;
        }
        let result:TenseContainerByLanguage<string>["Polish"] = {
            Present: {
                Simple: present(word)
            },
            Past: {
                Simple: past(word)
            },
            Future: {
                Simple: future(word)
            }
        }
        return result;
    }
}