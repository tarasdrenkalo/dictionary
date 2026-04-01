import { i18n } from "../i18n/labels.js";
import { English, EnglishDialect } from "../langs/english.js";
import { PersonPerspective } from "./options.js";

export type TenseTime = "Present" | "Past" | "Future";

export interface TenseStructure {
    1: { Singular: i18n<string>; Plural: i18n<string> };
    2: { Singular: i18n<string>; Plural: i18n<string> };
    3: { Singular: i18n<string>; Plural: i18n<string> };
}

export interface TenseTimed {
    Simple: TenseStructure;
    Progressive: TenseStructure;
    Participle: TenseStructure;
    Perfect: TenseStructure;
}

export interface TenseContainer {
    Present: TenseTimed;
    Past: TenseTimed;
    Future: TenseTimed;
}

export class Tense {
    private static BuildStructure(
        forms: (person: Exclude<PersonPerspective, 0>, plural: boolean) => string
    ): TenseStructure {
        return {
            1: {
                Singular: { English: forms(1, false) },
                Plural: { English: forms(1, true) },
            },
            2: {
                Singular: { English: forms(2, false) },
                Plural: { English: forms(2, true) },
            },
            3: {
                Singular: { English: forms(3, false) },
                Plural: { English: forms(3, true) },
            },
        };
    }
    static English(w: string, t: TenseTime, d: EnglishDialect = "GB"): TenseTimed {
        const gerund = new English().Gerund;

        const ing = gerund.ing(w, d);
        const ed_past = gerund.ed(w, d, false);
        const ed_participle = gerund.ed(w, d, true);

        let third: string;
        if (w.endsWith("s")) third = w + "es";
        else if (w.endsWith("y") && !"aeiou".includes(w.at(-2)!))
        third = w.slice(0, -1) + "ies";
        else third = w + "s";

        const be = {
        Present: ["am", "are", "is", "are"],
        Past: ["was", "were", "was", "were"],
        Future: ["will be", "will be", "will be", "will be"],
        }[t];

        const have = {
        Present: ["have", "have", "has"],
        Past: ["had", "had", "had"],
        Future: ["will have", "will have", "will have"],
        }[t];

        const simpleBase =
        t === "Past" ? ed_past : t === "Future" ? `will ${w}` : w;

        return {
        Simple: this.BuildStructure((p, plural) => {
            if (t === "Present" && p === 3 && !plural) return third;
            return simpleBase;
        }),

        Progressive: this.BuildStructure((p, plural) => {
            const aux = plural ? be[3] : be[p - 1];
            return `${aux} ${ing}`;
        }),

        Participle: this.BuildStructure(() => ed_participle),

        Perfect: this.BuildStructure((p, plural) => {
            const aux = plural ? have[0] : have[p - 1];
            return `${aux} ${ed_participle}`;
        }),
        };
    }
    static EnglishAll(w: string, d: EnglishDialect = "GB"): TenseContainer {
        return {
            Present: this.English(w, "Present", d),
            Past: this.English(w, "Past", d),
            Future: this.English(w, "Future", d),
        };
    }
}