import { Languages } from "@dictionary/i18n";
import { Grapheme, Phoneme } from "../components/symbols.js";

export class GraphemeCompare {
    static ArePhonemeSame<L extends Languages>(a: Phoneme<L>, b: Phoneme<L>): boolean {
        if (a.State !== b.State) return false;
        switch (a.State) {
        case "Silent":
            return b.State === "Silent";
        case "Resolved":
            return (
            b.State === "Resolved" &&
            a.Symbol === b.Symbol &&
            a.IsVowel === b.IsVowel &&
            a.IsShort === b.IsShort &&
            a.IsLong === b.IsLong
            );
        case "Ambiguous":
            return (
            b.State === "Ambiguous" &&
            a.Options.length === b.Options.length &&
            a.Options.every((opt, i) => opt === b.Options[i])
            );
        }
    }
    static IsGraphemeSame<L extends Languages>(l:L, a: Grapheme<L>, b: Grapheme<L>): boolean {
        return (
            a.Grapheme === b.Grapheme &&
            GraphemeCompare.ArePhonemeSame(a.Phoneme, b.Phoneme)
        );
    }
    static AreGraphemesSame<L extends Languages>(l:L, a: Grapheme<L>[], b: Grapheme<L>[]): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!GraphemeCompare.IsGraphemeSame(l, a[i]!, b[i]!)) return false;
        }
        return true;
    }
}