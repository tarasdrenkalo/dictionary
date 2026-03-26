import { i18n } from "../i18n/labels.js";
import { CaseStructure, Cases } from "./cases.js";
import { Definition, DefinitionConstructiorOptions } from "./definition.js";
import { PersonPerspective, OptionsByPartOfSpeech, AdverbOptions, ConjunctionOptions, DeterminerOptions, PrepositionOptions, PronounOptions, WordOptions, NounOptions, VerbOptions, PropernounOptions } from "./options.js";
import { TenseContainer, TenseType, Tense } from "./tense.js";
import { Thesaurus } from "./thesaurus.js";
import { Grapheme } from "./utils/grapheme.js";
import { Morpheme, MorphemeStructure } from "./utils/morpheme.js";
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

export type UnitWord = {
    Name:i18n<string>;
    Exists:boolean;
    ExcludeFromWordChoice:boolean;
}
export type UnknownWord = UnitWord & {
    Exists:false;
    ExcludeFromWordChoice:true;
}
export type WordReference = UnitWord & {
    WordId:string;
    Exists:true;
}
export interface BaseWord extends UnitWord {
    Exists:true;
    Aliases:Array<WordReference>,
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
    Connotation?:Definition;
    UniqueId:string;
    POS:keyof PartOfSpeech;
    Morpheme:i18n<MorphemeStructure>;
    IPA:i18n<Grapheme[]>;
    Gender:Gender;
    Denotation:Definition;
    Thesaurus:Thesaurus;
    Tenses?:TenseContainer;
    CurrentTense?:TenseType;
    PersonPerspective:PersonPerspective;
    Euphemisms:Array<WordReference>;
    Cases?:CaseStructure;
    CurrentCase?:keyof CaseStructure;
    Contexts:Array<WordReference>;
    Category:string;
}
export class Word<T extends keyof PartOfSpeech> implements BaseWord {
    IsRecordComplete: boolean;
    HasBias: boolean;
    Exists: true;
    UniqueId: string;
    Name: i18n<string>;
    Aliases: WordReference[];
    POS:T;
    Morpheme: i18n<MorphemeStructure>;
    IPA: i18n<Grapheme[]>;
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
    Denotation: Definition;
    Thesaurus: Thesaurus;
    Tenses?: TenseContainer;
    CurrentTense?:TenseType;
    PersonPerspective: PersonPerspective;
    Euphemisms: Array<WordReference>;
    Cases?: CaseStructure;
    CurrentCase?: keyof CaseStructure;
    IsArchaic: boolean;
    IsNeologism: boolean;
    Contexts: Array<WordReference>;
    Category: string;
    IsParasitic: boolean;
    Visible: boolean;
    Indexable: boolean;
    ExcludeFromWordChoice: boolean;
    Connotation?: Definition;
    constructor(pos:T, options:OptionsByPartOfSpeech[keyof OptionsByPartOfSpeech]){
        if(!options.word || typeof options.word === "undefined") throw "Eh, did you forget something?";
        let uid = crypto.randomUUID();
        this.Aliases = [];
        let selfref:WordReference = {
            ExcludeFromWordChoice: options.excludefromwordchoices || false,
            Name: options.word,
            Exists: true,
            WordId: uid,
        }
        this.Aliases.push(selfref)
        this.IsRecordComplete = false;
        this.Exists = true;
        this.UniqueId = uid;
        this.Name = options.word;
        this.POS = pos;
        this.Morpheme = {English:Morpheme.GetStructure(options.word.English)};
        this.IPA = {English:Morpheme.Generate(options.word.English)};
        this.Gender = options.gender || "U";
        this.IsPropernoun = pos === "Propernoun";
        this.IsAbbreviation = options.isabbreviation ||false;
        this.IsColloquial = options.iscolloquial ||false;
        this.IsUsedFormally = options.isusedfomally||true;
        this.IsUsedCasually = options.isusedcasually||true;
        this.IsProfane = options.isprofane||false;
        this.IsDerogatory = options.isderogatory||false;
        this.IsOffensive = options.isoffensive||false;
        this.IsShortened = options.isshortened||false;
        this.IsConjugatable = (options.isconjugatable || false) && (pos === "Verb"||pos==="Participle");
        this.Denotation = new Definition({
            versioning:1,
            content:options.meaning,
            sources:options.sources||[],
            creator:"Test",
            createdat:Date.now(),
            lastmodified:Date.now(),
        });
        this.Connotation = undefined;
        this.Thesaurus = {};
        this.Tenses = (pos === "Verb" || pos === "Participle") ? Tense.BuildAll(this.Name.English):undefined;
        this.CurrentTense = "Present Simple";
        this.PersonPerspective = options.personperspective||0;
        this.Cases = (pos === "Noun"||pos === "Pronoun" || pos==="Propernoun"||pos==="Adjective") ? Cases.All(selfref) : undefined;
        this.Euphemisms = options.euphemisms||[];
        this.CurrentCase = options.case||"Nominative";
        this.IsArchaic = options.isarchaic||false;
        this.IsNeologism = options.isneologism||false;
        this.Contexts = [];
        this.Category = options.category||"Uncategorised";
        this.ExcludeFromWordChoice = options.excludefromwordchoices||false;
        this.IsParasitic = options.isparasitic||false;
        this.Visible = false;
        this.Indexable = false;
        this.HasBias = options.isbiased || false;
        this.IsRecordComplete = false;
    }
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
    ToWordReference():WordReference {
        let wr:WordReference = {
            Name:this.Name,
            Exists:true,
            ExcludeFromWordChoice:(this.IsProfane||this.IsDerogatory||this.IsOffensive||this.HasBias),
            WordId:this.UniqueId,
        }
        return wr;
    }
    AddAlias(word:i18n<string>, c?:keyof CaseStructure, p?:boolean){
        let wr:WordReference = {
            Name:word,
            Exists:true, 
            ExcludeFromWordChoice:this.ExcludeFromWordChoice, 
            WordId:crypto.randomUUID()
        }
        this.Aliases.push(wr);
        if(typeof this.Cases !== "undefined" && c && p) this.Cases[c][p?"Plural":"Singular"] = wr;
        return this;
    }
    TranslateMorpheme(l:keyof i18n<string>, m:MorphemeStructure){
        this.Morpheme[l] = m;
        return this;
    }
    TranslateDenotation(content:i18n<string>, ver:number, curr:boolean):this;
    TranslateDenotation(content:i18n<string>, ver:string, curr:boolean):this;
    TranslateDenotation(content:i18n<string>, ver:string|number, curr:boolean=true) {
        let deftomodify = this.Denotation.Versions.filter((defs)=>defs[typeof ver === "string" ? "id":"VersionNumber"]);
        deftomodify.forEach((def)=>{
            def.Content=content;
            if(curr) this.Denotation.Current = def;
        });
        this.Denotation.LastModifiedAt = Date.now();
        return this;
    }
    TranslateConnotation(content:i18n<string>, ver:number, curr:boolean):this;
    TranslateConnotation(content:i18n<string>, ver:string, curr:boolean):this;
    TranslateConnotation(content:i18n<string>, ver:string|number, curr:boolean=true) {
        let conn:Definition = this.Connotation ?? new Definition({
            content:content,
            versioning:1,
            createdat:Date.now(),
            sources:null,
            creator:"",
            lastmodified:Date.now()
        });
        let deftomodify = conn.Versions.filter((defs)=>defs[typeof ver === "string" ? "id":"VersionNumber"]);
        deftomodify.forEach((def)=>{
            def.Content=content;
            if(curr) conn.Current = def;
        });
        conn.LastModifiedAt = Date.now();
        return this;
    }
    AddContexts(...contexts:WordReference[]){
        this.Contexts.push(...contexts);
        return this;
    }
}
export class Interjection extends Word<"Interjection"> {}
export class Exclamation extends Word<"Exclamation"> {}
export class Adjective extends Word<"Adjective"> {
    Comparative?:WordReference;
    Superlative?:WordReference;
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
        let comp = {English:Adjective.CS(options.word.English.toLowerCase(), true)};
        let sup = {English:Adjective.CS(options.word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            WordId:crypto.randomUUID()
        }
        let supref:WordReference = {
            Name:sup,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            WordId:crypto.randomUUID()
        }
        this.Comparative = compref
        this.Superlative = supref
        this.Aliases.push(compref, supref);
    }
}
export class Adverb extends Word<"Adverb">{
    Kind?:AdverbVariant;
    constructor(pos:"Adverb",options:AdverbOptions) {
        super(pos, options);
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
        this.IsSingular = !options.word.English.endsWith("s");
        this.IsPlural = options.word.English.endsWith("s");
        this.IsCountable = options.iscountable||true;
        this.IsSingularOnly = options.singleonly||false;
        this.IsPluralOnly = options.pluralonly||false;
    }
    Pluralise(advanced:boolean=false){
        const word = this.Name.English;
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
    Comparative?:WordReference;
    Superlative?:WordReference;
    constructor(pos:"Participle",options:VerbOptions){
        super(pos, options);
        this.IsTransitive = options.istransitive||true;
        this.IsActive = options.isactive||true;
        super(pos, options);
        let comp = {English:Adjective.CS(options.word.English.toLowerCase(), true)};
        let sup = {English:Adjective.CS(options.word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            WordId:crypto.randomUUID()
        }
        let supref:WordReference = {
            Name:sup,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            WordId:crypto.randomUUID()
        }
        this.Comparative = compref
        this.Superlative = supref
        this.Aliases.push(compref, supref);
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
    Kind:string;
    constructor(pos:"Propernoun", options:PropernounOptions){
        super(pos, options);
        this.Kind = options.kind||"";
    }
}
export class Numeral extends Word<"Numeral"> {}