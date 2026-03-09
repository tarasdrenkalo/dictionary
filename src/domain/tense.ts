import { Morpheme } from "./utils/morpheme.js";
import { Gerund } from "./utils/gerund.js";


export type TenseTime = "Present"|"Past"|"Future";
export type TenseType = "Present Simple"|"Present Progressive"|"Present Participle"|"Present Perfect"|
"Past Simple"|"Past Progressive"|"Past Participle"|"Past Perfect"|
"Future Simple"|"Future Progressive"|"Future Participle"|"Future Perfect";
export interface TenseStructure {
  UK:{
    1:{
      Singular:string|undefined,
      Plural:string|undefined,
    },
    2:{
      Singular:string|undefined,
      Plural:string|undefined,
    },
    3:{
      Singular:string|undefined,
      Plural:string|undefined,
    },
  },
  US:{
    1:{
      Singular:string|undefined,
      Plural:string|undefined,
    },
    2:{
      Singular:string|undefined,
      Plural:string|undefined,
    },
    3:{
      Singular:string|undefined,
      Plural:string|undefined,
    },
  }
}
export interface TenseTimed {
  Simple:TenseStructure,
  Progressive:TenseStructure,
  Participle:TenseStructure,
  Perfect:TenseStructure,
}
export interface TenseContainer {
  Present:TenseTimed,
  Past:TenseTimed,
  Future:TenseTimed
}
export class Tense {
  static Build(w: string, t: TenseTime): TenseTimed {
    const schema = Morpheme.GetStructure(w).Schema;
    const [gbing, using] = Gerund.ing(w);
    const [gbed, used] = Gerund.ed(w);
    const [gbedParticiple, usedParticiple] = Gerund.ed(w, true);

    let end: string;
    if (w.endsWith("s")) end = w + "es";
    else if (schema.endsWith("cv") && w.endsWith("y"))
      end = w.slice(0, -1) + "ies";
    else end = w + "s";

    const AuxBe =
      t === "Present"
        ? ["am", "is", "is", "are"]
        : t === "Past"
        ? ["was", "was", "was", "were"]
        : ["will be", "will be", "will be", "will be"];

    const AuxHave =
      t === "Present"
        ? ["have", "has"]
        : t === "Past"
        ? ["had", "had"]
        : ["will have", "will have"];

    const SimpleBG =
      t === "Past" ? gbed : t === "Future" ? `will ${w}` : w;

    const SimpleUS =
      t === "Past" ? used : t === "Future" ? `will ${w}` : w;

    return {
      Simple: {
        UK: {
          1: {
            Singular: SimpleBG,
            Plural: SimpleBG,
          },
          2: {
            Singular: SimpleBG,
            Plural: SimpleBG,
          },
          3: {
            Singular:
              t === "Past"
                ? gbed
                : t === "Future"
                ? `will ${w}`
                : end,
            Plural: SimpleBG,
          },
        },
        US: {
          1: {
            Singular: SimpleUS,
            Plural: SimpleUS,
          },
          2: {
            Singular: SimpleUS,
            Plural: SimpleUS,
          },
          3: {
            Singular:
              t === "Past"
                ? used
                : t === "Future"
                ? `will ${w}`
                : end,
            Plural: SimpleUS,
          },
        },
      },

      Progressive: {
        UK: {
          1: {
            Singular: `${AuxBe[0]} ${gbing}`,
            Plural: `${AuxBe[3]} ${gbing}`,
          },
          2: {
            Singular: `${AuxBe[1]} ${gbing}`,
            Plural: `${AuxBe[3]} ${gbing}`,
          },
          3: {
            Singular: `${AuxBe[2]} ${gbing}`,
            Plural: `${AuxBe[3]} ${gbing}`,
          },
        },
        US: {
          1: {
            Singular: `${AuxBe[0]} ${using}`,
            Plural: `${AuxBe[3]} ${using}`,
          },
          2: {
            Singular: `${AuxBe[1]} ${using}`,
            Plural: `${AuxBe[3]} ${using}`,
          },
          3: {
            Singular: `${AuxBe[2]} ${using}`,
            Plural: `${AuxBe[3]} ${using}`,
          },
        },
      },

      Participle: {
        UK: {
          1: { Singular: gbedParticiple, Plural: gbedParticiple },
          2: { Singular: gbedParticiple, Plural: gbedParticiple },
          3: { Singular: gbedParticiple, Plural: gbedParticiple },
        },
        US: {
          1: { Singular: usedParticiple, Plural: usedParticiple },
          2: { Singular: usedParticiple, Plural: usedParticiple },
          3: { Singular: usedParticiple, Plural: usedParticiple },
        },
      },
      Perfect: {
        UK: {
          1: {
            Singular: `${AuxHave[0]} ${gbedParticiple}`,
            Plural: `${AuxHave[0]} ${gbedParticiple}`,
          },
          2: {
            Singular: `${AuxHave[1]} ${gbedParticiple}`,
            Plural: `${AuxHave[0]} ${gbedParticiple}`,
          },
          3: {
            Singular: `${AuxHave[1]} ${gbedParticiple}`,
            Plural: `${AuxHave[0]} ${gbedParticiple}`,
          },
        },
        US: {
          1: {
            Singular: `${AuxHave[0]} ${usedParticiple}`,
            Plural: `${AuxHave[0]} ${usedParticiple}`,
          },
          2: {
            Singular: `${AuxHave[1]} ${usedParticiple}`,
            Plural: `${AuxHave[0]} ${usedParticiple}`,
          },
          3: {
            Singular: `${AuxHave[1]} ${usedParticiple}`,
            Plural: `${AuxHave[0]} ${usedParticiple}`,
          },
        },
      },
    };
  }
  static BuildAll(w:string):TenseContainer{
    const Result:TenseContainer = {
      Present: Tense.Build(w, "Present"),
      Past: Tense.Build(w, "Past"),
      Future: Tense.Build(w, "Future"),
    };
    return Result;
  }
}