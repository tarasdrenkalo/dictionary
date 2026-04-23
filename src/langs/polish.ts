import { PolishGraphemeSpelling, PolishGraphemeSymbol } from "../domain/utils/grapheme/base.js";
import { Language, Letter } from "../domain/utils/language.js";

export class Polish implements Language<"Polish"> {
    Name: "Polish" = "Polish";
    GetLetters(): Letter["Polish"][] {
        return ["A","Ą","B","C","Ć","D","E","Ę","F","G","H","I","J","K","L","Ł","M","N","O","Ó","P","R","S","Ś","T","U","W","Y","Z","Ź","Ż"];
    }
    HasLetter(l:any): boolean {
        return this.GetLetters().indexOf(l) != -1;
    }
    GetOrderByLetter(l: Letter["Polish"]): number | undefined {
        const assert = this.GetLetters().includes(l);
        if(!assert) return void l;
        return this.GetLetters().indexOf(l)+1;
    }
    GetLetterByOrder(n: number): Letter["Polish"] | undefined {
        const l =  this.GetLetters()[n];
        return typeof l !=="undefined" ? l : void l;
    }
    readonly GRAPHEME_REGEX:RegExp = /^(DŹ|DŻ|CZ|SZ|RZ|CH|DZ|SI|ZI|CI)/i;
    readonly VOWELS:Letter["Polish"][] = ["A", "Ą", "E", "Ę", "O", "Ó", "Y", "U"];
    readonly VOWEL_IPA:PolishGraphemeSpelling[] = ["a"];
    readonly POSSIBLE_SPELLINGS: Record<PolishGraphemeSymbol, PolishGraphemeSpelling[]> = {
        A: ["a"],
        Ą: ["ɔm","ɔŋ","ɔ̃"],
        B: ["b"],
        C: ["t͡s"],
        Ć: ["t͡ɕ"],
        D: ["d"],
        E: ["ɛ"],
        Ę: ["ɛm","ɛŋ","ɛ","ɛ̃"],
        F: ["f"],
        G: ["ɡ"],
        H: ["x"],
        I: ["i"],
        J: ["j"],
        K: ["k"],
        L: ["l"],
        Ł: ["w"],
        M: ["m"],
        N: ["n"],
        O: ["ɔ"],
        Ó: ["u"],
        P: ["p"],
        R: ["r"],
        S: ["s"],
        Ś: ["ɕ"],
        T: ["ɕi"],
        U: ["u"],
        W: ["v"],
        Y: ["ɨ"],
        Z: ["z"],
        Ź: ["ʑ"],
        Ż: ["ʐ"],
        Ń: ["ɲ"],
        CZ: ["t͡ʂ"],
        SZ: ["ʂ"],
        DZ: ["d͡z"],
        DŻ: ["d͡ʐ"],
        DŹ: ["d͡ʑ"],
        RZ: ["ʐ"],
        CH: ["x"],
        CI: ["t͡ɕi"],
        SI: ["ɕi"],
        ZI: ["ʑi"]
    };
}