import { Language } from "./index.js";

export const ENGLISH_LANGUAGE_CONSTANT:Language<"English"> = {
    Name:"English",
    GetLetters:()=>["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
    HasLetter: (l:any) => ENGLISH_LANGUAGE_CONSTANT.GetLetters().indexOf(l) != -1,
    GetOrderByLetter: (l:any)=>{
        const assert = ENGLISH_LANGUAGE_CONSTANT.GetLetters().includes(l);
        if(!assert) return void l;
        return ENGLISH_LANGUAGE_CONSTANT.GetLetters().indexOf(l)+1;
    },
    GetLetterByOrder: (n:number)=> {
        const l = ENGLISH_LANGUAGE_CONSTANT.GetLetters()[n];
        return typeof l !== "undefined" ? l: void l;
    },
    VOWELS:["A", "O", "Y", "E", "U", "I"],
    GRAPHEME_REGEX:/^(TCH|DGE|IGH|EER|EAR|AIR|URE|AR|ER|IR|OR|UR|SH|CH|CZ|TH|PH|NG|CK|QU|WH|GH|KN|WR|GN|AI|AY|EE|EA|OA|IE|EI|OU|OW|OO|AU|AW|OI|OY|EU)/i,
}
export const POLISH_LANGUAGE_CONSTANT:Language<"Polish"> = {
    Name:"Polish",
    GetLetters:()=>["A","Ą","B","C","Ć","D","E","Ę","F","G","H","I","J","K","L","Ł","M","N","O","Ó","P","R","S","Ś","T","U","W","Y","Z","Ź","Ż"],
    HasLetter: (l:any) => POLISH_LANGUAGE_CONSTANT.GetLetters().indexOf(l) != -1,
    GetOrderByLetter: (l:any)=>{
        const assert = POLISH_LANGUAGE_CONSTANT.GetLetters().includes(l);
        if(!assert) return void l;
        return POLISH_LANGUAGE_CONSTANT.GetLetters().indexOf(l)+1;
    },
    GetLetterByOrder: (n:number)=> {
        const l = POLISH_LANGUAGE_CONSTANT.GetLetters()[n];
        return typeof l !== "undefined" ? l: void l;
    },
    GRAPHEME_REGEX: /^(DŹ|DŻ|CZ|SZ|RZ|CH|DZ|SI|ZI|CI)/i,
    VOWELS:["A", "Ą", "E", "Ę", "O", "Ó", "Y", "U"]
}