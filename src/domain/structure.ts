import { CaseStructure, Cases } from "./cases.js";
import { GenericDefinition, Definition } from "./definition.js";
import { MorphemeStructure, Morpheme } from "./morpheme.js";
import { PersonPerspective, OptionsByPartOfSpeech, AdverbOptions, ConjunctionOptions, DeterminerOptions, PrepositionOptions, PronounOptions, WordOptions, NounOptions, VerbOptions, PropernounOptions } from "./options.js";
import { TenseContainer, TenseType, Tense } from "./tense.js";
import { Grapheme } from "./utils/grapheme.js";
import { Language, English } from "./utils/language.js";
import { Gender, AdverbVariant, DeterminerVariant, ConjunctionVariant, PronounVariant, PrepositionVariant } from "./variants.js";

export interface PartOfSpeech {
    "Adjective":Adjective;
    "Adverb":Adverb;
    "Conjunction":Conjunction;
    "Determiner":Determiner;
    "Exclamation":Exclamation;
    "Interjection":Interjection;
    "Noun":Noun;
    "Numeral":Numeral;
    "Participle":Participle;
    "Preposition":Preposition;
    "Pronoun":Pronoun;
    "Propernoun":Propernoun;
    "Verb":Verb;
    "Unknown":Word<"Unknown">;
}

export interface UnitWord {
    Name:string;
    Exists:boolean;
    ExcludeFromWordChoice:boolean;
}
export interface UnknownWord extends UnitWord {
    Exists:false;
    ExcludeFromWordChoice:true;
}
export interface WordReference extends UnitWord {
    WordId:string;
    Exists:true;
}
export interface BaseWord extends UnitWord {
    Exists:true;
    IsRecordComplete:boolean;
    HasBias:boolean;
    IsPropernoun:boolean;
    IsAbbreviation:boolean;
    IsColloquial:boolean;
    IsUsedFormally:boolean;
    IsUsedCasually:boolean;
    IsProfane:boolean;
    IsDerogatory:boolean;
    IsOffensive:boolean;
    IsShortened:boolean;
    IsConjugatable:boolean;
    IsArchaic:boolean;
    IsNeologism:boolean;
    IsParasitic:boolean;
    Visible:boolean;
    Indexable:boolean;
    Connotation?:Array<string|WordReference>;

    UniqueId:string;
    POS:keyof PartOfSpeech;
    Language:Language;
    Morpheme:MorphemeStructure;
    IPA:Array<Grapheme>;
    Gender:Gender;
    Meaning:GenericDefinition;
    Thesaurus:string; //TODO
    Tenses?:TenseContainer;
    CurrentTense?:TenseType;
    PersonPerspective:PersonPerspective;
    Euphemisms:Array<string|WordReference>;
    Cases?:CaseStructure;
    CurrentCase?:keyof CaseStructure;
    Contexts:Array<string|WordReference>;
    Category:string;
}
export class Word<T extends keyof PartOfSpeech> implements BaseWord {
    IsRecordComplete: boolean;
    HasBias: boolean;
    Exists: true;
    UniqueId: string;
    Name: string;
    POS:T;
    Language: Language;
    Morpheme: MorphemeStructure;
    IPA: Array<Grapheme>;
    Gender: Gender;
    IsPropernoun: boolean;
    IsAbbreviation: boolean;
    IsColloquial: boolean;
    IsUsedFormally: boolean;
    IsUsedCasually: boolean;
    IsProfane: boolean;
    IsDerogatory: boolean;
    IsOffensive: boolean;
    IsShortened: boolean;
    IsConjugatable: boolean;
    Meaning: GenericDefinition;
    Thesaurus: string; //TODO
    Tenses?: TenseContainer;
    CurrentTense?:TenseType;
    PersonPerspective: PersonPerspective;
    Euphemisms: Array<string|WordReference>;
    Cases?: CaseStructure;
    CurrentCase?: keyof CaseStructure;
    IsArchaic: boolean;
    IsNeologism: boolean;
    Contexts: Array<string|WordReference>;
    Category: string;
    IsParasitic: boolean;
    Visible: boolean;
    Indexable: boolean;
    ExcludeFromWordChoice: boolean;
    constructor(pos:T, options:OptionsByPartOfSpeech[keyof OptionsByPartOfSpeech]){
        this.IsRecordComplete = false;
        this.Exists = true;
        this.UniqueId = crypto.randomUUID();
        this.Name = options.word;
        this.POS = pos;
        this.Language = English;
        this.Morpheme = Morpheme.GetStructure(options.word);
        this.IPA = Morpheme.Generate(options.word);
        this.Gender = options.gender || "U";
        this.IsPropernoun = pos === "Propernoun";
        this.IsAbbreviation = options.isabbreviation ||false;
        this.IsColloquial = options.iscolloquial ||false;
        this.IsUsedFormally = /(\w)\1{2,}/gmi.test(options.word) && (options.isusedfomally||true);
        this.IsUsedCasually = options.isusedcasually||true;
        this.IsProfane = options.isprofane||false;
        this.IsDerogatory = options.isderogatory||false;
        this.IsOffensive = options.isoffensive||false;
        this.IsShortened = options.isshortened||false;
        this.IsConjugatable = (options.isconjugatable || false) && (pos === "Verb"||pos==="Participle");
        this.Meaning = new Definition({
            versioning:1,
            content:options.meaning,
            sources:options.sources||[],
            category:options.category,
            creator:"Test",
            createdat:Date.now(),
            lastmodified:Date.now(),
        });
        this.Thesaurus = ""; //TODO
        this.Tenses = (pos === "Verb" || pos === "Participle") ? Tense.BuildAll(this.Name):undefined;
        this.CurrentTense = "Present Simple";
        this.PersonPerspective = options.personperspective||0;
        this.Cases = (pos === "Noun") ? Cases.All(this.Name, English) : undefined;
        this.Euphemisms = options.euphemisms||[];
        this.CurrentCase = undefined;
        this.IsArchaic = options.isarchaic||false;
        this.IsNeologism = options.isneologism||false;
        this.Contexts = [""];
        this.Category = options.category||"Uncategorised";
        this.ExcludeFromWordChoice = options.excludefromwordchoices||false;
        this.IsParasitic = options.isparasitic||false;
        this.Visible = false;
        this.Indexable = false;
        this.HasBias = false;
    }
    Connotation?: Array<string|WordReference>;
    static Create<K extends keyof PartOfSpeech>(pos:K, options:OptionsByPartOfSpeech[K]):PartOfSpeech[K] {
        const Constructors:PartOfSpeech = {
            "Adjective":new Adjective("Adjective", options),
            "Adverb":new Adverb("Adverb", options as AdverbOptions),
            "Conjunction":new Conjunction("Conjunction", options as ConjunctionOptions),
            "Determiner":new Determiner("Determiner", options as DeterminerOptions),
            "Exclamation":new Exclamation("Exclamation", options),
            "Interjection":new Interjection("Interjection", options),
            "Noun":new Noun("Noun", options),
            "Numeral":new Numeral("Numeral", options),
            "Participle":new Participle("Participle", options),
            "Preposition":new Preposition("Preposition", options as PrepositionOptions),
            "Pronoun":new Pronoun("Pronoun", options as PronounOptions),
            "Propernoun":new Propernoun("Propernoun", options),
            "Verb":new Verb("Verb", options),
            "Unknown":new Word("Unknown", options),
        }
        return Constructors[pos];
    }
}
export class Interjection extends Word<"Interjection"> {}
export class Exclamation extends Word<"Exclamation"> {}
export class Adjective extends Word<"Adjective"> {
    Comparative:string;
    Superlative:string;
    public static CS(w:string, s:boolean):string{
        if(w.endsWith("e")){
            return w + (s ? "r" : "st");
        }
        else if(w.endsWith("y")){
            return w.slice(0, -1) + (s ? "ier" : "iest");
        }
        else if(w.endsWith("p")||w.endsWith("t")){
            return w + w.at(-1) + (s ? "ier" : "iest");
        }
        else if(w.endsWith("w")){
            return w.at(-2) === "o" ? w + (s ? "er" : "est") : w;
        }
        else if (Morpheme.GetStructure(w).Schema ==="cvc"){
            return w + w.at(-1) + "er";
        }
        return w;
    }
    constructor(pos:"Adjective",options:WordOptions) {
        super(pos, options);
        this.Comparative = Adjective.CS(options.word.toLowerCase(), true);
        this.Superlative = Adjective.CS(options.word.toLowerCase(), false);
    }
}
export class Adverb extends Word<"Adverb">{
    Kind?:AdverbVariant;
    constructor(pos:"Adverb",options:AdverbOptions) {
        super("Adverb", options);
        this.Kind = options.kind;
    }
}
export class Determiner extends Word<"Determiner"> {
    Kind?:DeterminerVariant;
    constructor(pos:"Determiner",options:DeterminerOptions) {
        super(pos, options);
        this.Kind = options.kind;
    }
}
export class Conjunction extends Word<"Conjunction"> {
    Kind?:ConjunctionVariant;
    constructor(pos: "Conjunction", options:ConjunctionOptions) {
        super(pos, options);
        this.Kind = options.kind;
    }
}
export class Noun extends Word<"Noun"> {
    IsSingular:boolean;
    IsPlural:boolean;
    IsCountable:boolean;
    IsSingularOnly:boolean;
    IsPluralOnly:boolean;
    constructor(pos:"Noun",options:NounOptions){
        super(pos, options);
        this.IsSingular = !options.word.endsWith("s");
        this.IsPlural = options.word.endsWith("s");
        this.IsCountable = options.iscountable||true;
        this.IsSingularOnly = options.singleonly||false;
        this.IsPluralOnly = options.pluralonly||false;
    }
    Pluralise(advanced:boolean=false){
        const word = this.Name;
        if(word.at(-1) === "y" && !"aeiou".includes(word.at(-2)||"")){
            return word.slice(0, -1) + "ies";
        }
        else if(/(s|sh|ch|x|z)\b/gmi.test(word)){
            return word + "es";
        }
        else if(word.endsWith("um")||word.endsWith("on")){
            return advanced ? word.slice(0, -2) + "a": word + "s";
        }
        else{
            return word + "s";
        }
    }
}
export class Verb extends Word<"Verb">{
    IsTransitive:boolean;
    IsActive:boolean;
    constructor(pos:"Verb",options:VerbOptions){
        super(pos, options);
        this.IsTransitive = options.istransitive||true;
        this.IsActive = options.isactive||true;
    }
}
export class Participle extends Word<"Participle"> {
    IsTransitive:boolean;
    IsActive:boolean;
    Comparative:string;
    Superlative:string;
    constructor(pos:"Participle",options:VerbOptions){
        super(pos, options);
        this.IsTransitive = options.istransitive||true;
        this.IsActive = options.isactive||true;
        this.Comparative = Adjective.CS(this.Name, true);
        this.Superlative = Adjective.CS(this.Name, false);
    }
}
export class Pronoun extends Word<"Pronoun"> {
    Kind?:PronounVariant;
    constructor(pos:"Pronoun",options:PronounOptions){
        super(pos, options);
        this.Kind = options.kind;
    }
}
export class Preposition extends Word<"Preposition"> {
    Kind?:PrepositionVariant;
    constructor(pos:"Preposition", options:PrepositionOptions) {
        super(pos, options);
        this.Kind = options.kind;
    }
}
export class Propernoun extends Word<"Propernoun"> {
    Kind!:string;
    constructor(pos:"Propernoun", options:PropernounOptions){
        super(pos, options);
        this.Kind = options.kind||"";
    }
}
export class Numeral extends Word<"Numeral"> {}