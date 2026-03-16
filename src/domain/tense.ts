import { i18n } from "../i18n/labels.js";
import { Gerund } from "./utils/gerund.js";
import { Morpheme } from "./utils/morpheme.js";



export type TenseTime = "Present"|"Past"|"Future";
export type TenseType = "Present Simple"|"Present Progressive"|"Present Participle"|"Present Perfect"|
"Past Simple"|"Past Progressive"|"Past Participle"|"Past Perfect"|
"Future Simple"|"Future Progressive"|"Future Participle"|"Future Perfect";
export interface TenseStructure {
  UK:{
    1:{
      Singular:i18n<string>,
      Plural:i18n<string>,
    },
    2:{
      Singular:i18n<string>,
      Plural:i18n<string>,
    },
    3:{
      Singular:i18n<string>,
      Plural:i18n<string>,
    },
  },
  US:{
    1:{
      Singular:i18n<string>,
      Plural:i18n<string>,
    },
    2:{
      Singular:i18n<string>,
      Plural:i18n<string>,
    },
    3:{
      Singular:i18n<string>,
      Plural:i18n<string>,
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
            Singular: {English:SimpleBG||""},
            Plural: {English:SimpleBG||""},
          },
          2: {
            Singular: {English:SimpleBG||""},
            Plural: {English:SimpleBG||""},
          },
          3: {
            Singular:{English:(t === "Past"
                ? gbed
                : t === "Future"
                ? `will ${w}`
                : end)||""},
              
            Plural: {English:SimpleBG||""},
          },
        },
        US: {
          1: {
            Singular: {English:SimpleUS||""},
            Plural: {English:SimpleUS||""},
          },
          2: {
            Singular: {English:SimpleUS||""},
            Plural: {English:SimpleUS||""},
          },
          3: {
            Singular:{English:(t === "Past"
                ? used
                : t === "Future"
                ? `will ${w}`
                : end)||""},
            Plural: {English:SimpleUS||""},
          },
        },
      },

      Progressive: {
        UK: {
          1: {
            Singular: {English:`${AuxBe[0]} ${gbing}`},
            Plural: {English:`${AuxBe[3]} ${gbing}`},
          },
          2: {
            Singular: {English:`${AuxBe[1]} ${gbing}`},
            Plural: {English:`${AuxBe[3]} ${gbing}`},
          },
          3: {
            Singular: {English:`${AuxBe[2]} ${gbing}`},
            Plural: {English:`${AuxBe[3]} ${gbing}`},
          },
        },
        US: {
          1: {
            Singular: {English:`${AuxBe[0]} ${using}`},
            Plural: {English:`${AuxBe[3]} ${using}`},
          },
          2: {
            Singular: {English:`${AuxBe[1]} ${using}`},
            Plural: {English:`${AuxBe[3]} ${using}`},
          },
          3: {
            Singular: {English:`${AuxBe[2]} ${using}`},
            Plural: {English:`${AuxBe[3]} ${using}`},
          },
        },
      },

      Participle: {
        UK: {
          1: { Singular: {English:gbedParticiple||""}, Plural: {English:gbedParticiple||""}},
          2: { Singular: {English:gbedParticiple||""}, Plural: {English:gbedParticiple||""}},
          3: { Singular: {English:gbedParticiple||""}, Plural: {English:gbedParticiple||""}},
        },
        US: {
          1: { Singular: {English:usedParticiple||""}, Plural: {English:usedParticiple||""}},
          2: { Singular: {English:usedParticiple||""}, Plural: {English:usedParticiple||""}},
          3: { Singular: {English:usedParticiple||""}, Plural: {English:usedParticiple||""}},
        },
      },
      Perfect: {
        UK: {
          1: {
            Singular: {English:`${AuxHave[0]} ${gbedParticiple}`},
            Plural: {English:`${AuxHave[0]} ${gbedParticiple}`},
          },
          2: {
            Singular: {English:`${AuxHave[1]} ${gbedParticiple}`},
            Plural: {English:`${AuxHave[0]} ${gbedParticiple}`},
          },
          3: {
            Singular: {English:`${AuxHave[1]} ${gbedParticiple}`},
            Plural: {English:`${AuxHave[1]} ${gbedParticiple}`},
          },
        },
        US: {
          1: {
            Singular: {English:`${AuxHave[0]} ${usedParticiple}`},
            Plural: {English:`${AuxHave[0]} ${usedParticiple}`},
          },
          2: {
            Singular: {English:`${AuxHave[1]} ${usedParticiple}`},
            Plural: {English:`${AuxHave[0]} ${usedParticiple}`},
          },
          3: {
            Singular: {English:`${AuxHave[1]} ${usedParticiple}`},
            Plural: {English:`${AuxHave[0]} ${usedParticiple}`},
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