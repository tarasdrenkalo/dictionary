import { i18n, Languages } from "../../i18n/labels.js";
import { Word, PartOfSpeech, WordReference } from "../structure.js";
import {
  EnglishTenseBlock,
  PolishTenseBlock,
  TenseContainerByLanguage,
  TenseTime,
  TenseTimed,
  PolishSingular,
} from "../tense.js";
import { Morpheme } from "../utils/morpheme.js";
import { EnglishConjugator } from "./tense.en.js";
import { PolishConjugator } from "./tense.pl.js";

export class Tense {
  static Conjugate(word: Word<keyof PartOfSpeech>): TenseContainerByLanguage<WordReference> {
    // ---------------------------------------------
    // INTERNAL HELPERS (all arrow functions)
    // ---------------------------------------------

    let makeRef = (base: WordReference, lang: Languages, surface: string): WordReference => {
      return {
        ...base,
        WordId: crypto.randomUUID(),
        Normalised: { ...(base.Normalised ?? {}), [lang]: surface },
        IPA: { ...(base.IPA ?? {}), [lang]: Morpheme.Generate(lang, surface) },
      };
    };

    let mergeRef = (
      base: WordReference,
      en: string | undefined,
      pl: string | undefined
    ): WordReference => {
      let ref: WordReference = {
        ...base,
        WordId: crypto.randomUUID(),
        Normalised: { ...(base.Normalised ?? {}) },
        IPA: { ...(base.IPA ?? {}) },
      };

      if (en) {
        ref.Normalised.English = en;
        ref.IPA.English = Morpheme.Generate("English", en);
      }
      if (pl) {
        ref.Normalised.Polish = pl;
        ref.IPA.Polish = Morpheme.Generate("Polish", pl);
      }
      return ref;
    };

    let mapEnglishBlock = (
      base: WordReference,
      block: EnglishTenseBlock<string>,
      polishBlock?: PolishTenseBlock<TenseTime, string>
    ): EnglishTenseBlock<WordReference> => ({
      1: {
        Singular: mergeRef(base, block[1].Singular, polishBlock?.[1].Singular as any),
        Plural:   mergeRef(base, block[1].Plural,   polishBlock?.[1].Plural),
      },
      2: {
        Singular: mergeRef(base, block[2].Singular, polishBlock?.[2].Singular as any),
        Plural:   mergeRef(base, block[2].Plural,   polishBlock?.[2].Plural),
      },
      3: {
        Singular: mergeRef(base, block[3].Singular, polishBlock?.[3].Singular as any),
        Plural:   mergeRef(base, block[3].Plural,   polishBlock?.[3].Plural),
      },
    });

    let mapPolishSingular = <P extends TenseTime>(
      base: WordReference,
      s: PolishSingular<P, string>,
      en: string | undefined
    ): PolishSingular<P, WordReference> => {
      if (typeof s === "string") {
        return mergeRef(base, en, s) as PolishSingular<P, WordReference>;
      }
      return {
        M: mergeRef(base, en, s.M),
        F: mergeRef(base, en, s.F),
        ...(s.N ? { N: mergeRef(base, en, s.N) } : {}),
      } as PolishSingular<P, WordReference>;
    };

    let mapPolishBlock = <P extends TenseTime>(
      base: WordReference,
      block: PolishTenseBlock<P, string>,
      englishBlock?: EnglishTenseBlock<string>
    ): PolishTenseBlock<P, WordReference> => ({
      1: {
        Singular: mapPolishSingular<P>(base, block[1].Singular, englishBlock?.[1].Singular),
        Plural:   mergeRef(base, englishBlock?.[1].Plural, block[1].Plural),
      },
      2: {
        Singular: mapPolishSingular<P>(base, block[2].Singular, englishBlock?.[2].Singular),
        Plural:   mergeRef(base, englishBlock?.[2].Plural, block[2].Plural),
      },
      3: {
        Singular: mapPolishSingular<P>(base, block[3].Singular, englishBlock?.[3].Singular),
        Plural:   mergeRef(base, englishBlock?.[3].Plural, block[3].Plural),
      },
    });

    // ---------------------------------------------
    // RAW CONJUGATION
    // ---------------------------------------------

    let en = EnglishConjugator.Conjugate(word.Name.English); // TenseContainer<"English", string>
    let pl = typeof word.Name.Polish === "string"
      ? PolishConjugator.Conjugate(word.Name.Polish)        // TenseContainer<"Polish", string>
      : undefined;

    let base = word.ToWordReference();

    // ---------------------------------------------
    // ENGLISH ALWAYS PRESENT
    // ---------------------------------------------

    let English: TenseContainerByLanguage<WordReference>["English"] = {
      Present: {
        Simple:      mapEnglishBlock(base, en.Present.Simple,      pl?.Present?.Simple),
        Progressive: mapEnglishBlock(base, en.Present.Progressive, pl?.Present?.Simple),
        Participle:  mapEnglishBlock(base, en.Present.Participle,  pl?.Past?.Simple),
        Perfect:     mapEnglishBlock(base, en.Present.Perfect,     pl?.Past?.Simple),
      },
      Past: {
        Simple:      mapEnglishBlock(base, en.Past.Simple,      pl?.Past?.Simple),
        Progressive: mapEnglishBlock(base, en.Past.Progressive, pl?.Past?.Simple),
        Participle:  mapEnglishBlock(base, en.Past.Participle,  pl?.Past?.Simple),
        Perfect:     mapEnglishBlock(base, en.Past.Perfect,     pl?.Past?.Simple),
      },
      Future: {
        Simple:      mapEnglishBlock(base, en.Future.Simple,      pl?.Future?.Simple),
        Progressive: mapEnglishBlock(base, en.Future.Progressive, pl?.Future?.Simple),
        Participle:  mapEnglishBlock(base, en.Future.Participle,  pl?.Future?.Simple),
        Perfect:     mapEnglishBlock(base, en.Future.Perfect,     pl?.Future?.Simple),
      },
    };

    // ---------------------------------------------
    // POLISH OPTIONAL
    // ---------------------------------------------

    let result: TenseContainerByLanguage<WordReference> = {English};

    if (typeof pl !== "undefined") {
      result.Polish = {
        Present: { Simple: mapPolishBlock<"Present">(base, pl?.Present?.Simple, en.Present.Simple) },
        Past:    { Simple: mapPolishBlock<"Past">(base,    pl?.Past?.Simple,    en.Present.Perfect) },
        Future:  { Simple: mapPolishBlock<"Future">(base,  pl?.Future?.Simple,  en.Future.Simple) },
      };
    }

    return result;
  }
}