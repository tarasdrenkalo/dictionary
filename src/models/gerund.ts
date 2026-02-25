import { IrregularVerbs, IrregularVerb } from "../components/irregverbs.js";
import { Morpheme } from "./morpheme.js";

export class Gerund {
  public static ing(word: string):Array<string> {
    const schema = Morpheme.GetStructure(word).Schema;

    if (word.endsWith("y")) {
      const form = word.slice(0, -1) + "ing";
      return [form, form];
    }

    if (word.endsWith("e")) {
      if (word.length > 2 && word.at(-2) === "i") {
        const form = word.slice(0, -2) + "ying";
        return [form, form];
      }
      const form = word.slice(0, -1) + "ing";
      return [form, form];
    }

    if (schema.split("").filter(l => l === "v").length === 1 && !schema.endsWith("cc")) {
      const form = word + word.at(-1) + "ing";
      return [form, form];
    }

    const form = word + "ing";
    return [form, form];
  }
  public static ed(word: string, participle: boolean = false):Array<string> {
    const schema = Morpheme.GetStructure(word).Schema;

    const entry = (IrregularVerbs as Record<string, IrregularVerb>)[word];
    if (entry && typeof entry !== "undefined") {
      return [
        participle ? entry.Participle.UK : entry.Past.UK,
        participle ? entry.Participle.US : entry.Past.US
      ];
    }

    if (word.endsWith("e")) return [word + "d", word + "d"];

    if (schema.endsWith("vc") && schema.split("").filter(l => l === "v").length === 1) {
      const form = word + word.at(-1) + "ed";
      return [form, form];
    }

    if (word.endsWith("y") && schema.split("").filter(l => l === "v").length !== 1) {
      const form = word.slice(0, -1) + "ied";
      return [form, form];
    }

    return [word + "ed", word + "ed"];
  }
}