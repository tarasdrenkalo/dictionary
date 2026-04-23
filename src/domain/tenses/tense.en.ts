import { EnglishDialect, English } from "../../langs/english.js";
import { PersonPerspective } from "../options.js";
import { EnglishTenseBlock, TenseTime, TenseTimed, PolishTenseBlock, TenseContainer } from "../tense.js";

export class EnglishConjugator {
    private static BuildStructure(
        forms: (person: Exclude<PersonPerspective, 0>, plural: boolean) => string
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
        d: EnglishDialect = "GB"
    ): TenseTimed<typeof t, string>["English"] {
        const gerund = new English().Gerund;
        const ing = gerund.ing(w, d);
        const EdPast = gerund.ed(w, d, false);
        const EdParticiple = gerund.ed(w, d, true);
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
    static Conjugate(w: string, d: EnglishDialect = "GB"): TenseContainer<"English", string> {
        let result:TenseContainer<"English", string> = {
            Present: this.GetTenseTimed(w, "Present", d),
            Past:    this.GetTenseTimed(w, "Past", d),
            Future:  this.GetTenseTimed(w, "Future", d),
        };
        return result;
    }
}