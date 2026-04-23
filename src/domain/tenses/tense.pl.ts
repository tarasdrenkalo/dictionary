import { TenseContainer, PolishTenseBlock, TenseContainerByLanguage } from "../tense.js";
export class PolishConjugator {
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