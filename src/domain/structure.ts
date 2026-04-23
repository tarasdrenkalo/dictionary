import { i18n, Languages } from "../i18n/labels.js";
import { CasePlurality, CaseStructure, Cases } from "./cases.js";
import { Definition } from "./definition.js";
import { PersonPerspective, OptionsByPartOfSpeech, AdverbOptions, ConjunctionOptions, DeterminerOptions, PrepositionOptions, PronounOptions, WordOptions, NounOptions, VerbOptions, PropernounOptions } from "./options.js";
import { TenseContainer, TenseTime } from "./tense.js";
import { Tense } from "./tenses/tense.all.js";

import { Thesaurus } from "./thesaurus.js";
import { Grapheme } from "./utils/grapheme/base.js";
import { Morpheme, MorphemeStructure } from "./utils/morpheme.js";
import { Gender, AdverbVariant, DeterminerVariant, ConjunctionVariant, PronounVariant, PrepositionVariant, GenericVariant } from "./variants.js";

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
    Normalised:i18n<string>;
    IPA:i18n<Grapheme<Languages>[]>;
    Morpheme: i18n<MorphemeStructure<Languages>>;
}
export interface BaseWord extends UnitWord {
    Exists:true;
    LanguagesSupported:i18n<boolean>
    Normalised:i18n<string>
    Aliases:Array<WordReference>,
    IsRecordComplete:boolean;
    HasBias:boolean;
    IsPropernoun:boolean;
    IsAnimate:boolean;
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
    Connotation:Definition|null;
    UniqueId:string;
    POS:keyof PartOfSpeech;
    Morpheme:i18n<MorphemeStructure<Languages>>;
    IPA:i18n<Grapheme<Languages>[]>;
    Gender:i18n<Gender>;
    Denotation:Definition;
    Thesaurus:Thesaurus;
    Tenses:i18n<TenseContainer<Languages, WordReference>>|null;
    CurrentTense:TenseTime|null;
    PersonPerspective:i18n<PersonPerspective>;
    Euphemisms:Array<WordReference>;
    Cases:CaseStructure<WordReference>|null;
    CurrentCase:keyof CaseStructure<WordReference>|null;
    Contexts:Array<WordReference>;
    Categories:string[];
}
export class Word<T extends keyof PartOfSpeech> implements BaseWord {
    IsRecordComplete: boolean;
    LanguagesSupported: i18n<boolean>;
    Normalised: i18n<string>;
    HasBias: boolean;
    Exists: true;
    UniqueId: string;
    Name: i18n<string>;
    Aliases: WordReference[];
    POS:T;
    IsAnimate: boolean;
    Morpheme: i18n<MorphemeStructure<Languages>>;
    IPA: i18n<Grapheme<Languages>[]>;
    Gender: i18n<Gender>;
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
    Tenses:i18n<TenseContainer<Languages, WordReference>>|null;
    CurrentTense:TenseTime|null;
    PersonPerspective: i18n<PersonPerspective>;
    Euphemisms: Array<WordReference>;
    Cases: CaseStructure<WordReference>|null;
    CurrentCase: keyof CaseStructure<WordReference>|null;
    IsArchaic: boolean;
    IsNeologism: boolean;
    Contexts: Array<WordReference>;
    Categories: string[];
    IsParasitic: boolean;
    Visible: boolean;
    Indexable: boolean;
    ExcludeFromWordChoice: boolean;
    Connotation: Definition|null;
    constructor(pos:T, options:OptionsByPartOfSpeech[keyof OptionsByPartOfSpeech]){
        // English is always required
        if(!options.word.English || typeof options.word.English === "undefined") throw "Eh, did you forget something?";
        let SupportedLanguages:i18n<boolean> = {
            English:true,
            Polish:typeof options.word.Polish !== "undefined"
        }

        //Booleans
        this.IsRecordComplete = false;
        this.Exists = true;
        this.IsAnimate = options.animate || false;
        this.IsAbbreviation = options.isabbreviation ||false;
        this.IsColloquial = options.iscolloquial ||false;
        this.IsUsedFormally = options.isusedfomally||true;
        this.IsUsedCasually = options.isusedcasually||true;
        this.IsProfane = options.isprofane||false;
        this.IsDerogatory = options.isderogatory||false;
        this.IsOffensive = options.isoffensive||false;
        this.IsShortened = options.isshortened||false;
        this.IsConjugatable = (options.isconjugatable || false);
        this.Connotation = null;
        this.CurrentTense = null;
        this.IsPropernoun = pos === "Propernoun";
        this.Connotation = null;
        this.Thesaurus = {};
        this.CurrentTense = null;
        this.Euphemisms = options.euphemisms||[];
        this.CurrentCase = options.cases||"Nominative";
        this.IsArchaic = options.isarchaic||false;
        this.IsNeologism = options.isneologism||false;
        this.Contexts = [];
        this.Categories = options.category||["Uncategorised"];
        this.ExcludeFromWordChoice = options.excludefromwordchoices||false;
        this.IsParasitic = options.isparasitic||false;
        this.Visible = false;
        this.Indexable = false;
        this.HasBias = options.isbiased || false;
        this.IsRecordComplete = false;
        this.LanguagesSupported = SupportedLanguages;

        let uid = crypto.randomUUID();
        this.Aliases = [];
        this.UniqueId = uid;
        this.Name = options.word;
        this.Normalised = options.word;
        this.POS = pos;

        this.Morpheme = {English:Morpheme.GetStructure("English",options.word.English)};
        this.IPA = {English:Morpheme.Generate("English", options.word.English)};

        this.Gender = options.gender || {English:"U", Polish:"U"};
        this.PersonPerspective = options.personperspective||{English:0, Polish:0};
        this.Denotation = new Definition({
            versioning:1,
            content:options.meaning,
            sources:options.sources||[],
            creator:"Test",
            createdat:Date.now(),
            lastmodified:Date.now(),
        });
        
        this.Tenses = (pos === "Verb" || pos === "Participle") ? Tense.Conjugate(this):null;
        this.Cases = (pos === "Noun"||pos === "Pronoun" || pos==="Propernoun"||pos==="Adjective") ? Cases.Generate(this, "All") : null;
        if(this.Cases !== null && typeof this.Cases.Nominative.Singular !== "undefined")
            this.UniqueId = this.Cases.Nominative.Singular.WordId;

        if(typeof this.Name.Polish === "string") {
            this.Morpheme.Polish = Morpheme.GetStructure("Polish",this.Name.Polish);
            this.IPA.Polish = Morpheme.Generate("Polish", this.Name.Polish);
        }
        if (!SupportedLanguages.Polish) {
            delete this.Name.Polish;
            if (this.Normalised?.Polish !== undefined) {
                delete this.Normalised.Polish;
            }
            if (this.IPA?.Polish !== undefined) {
                delete this.IPA.Polish;
            }
            if (this.Morpheme?.Polish !== undefined) {
                delete this.Morpheme.Polish;
            }
            if (this.Gender?.Polish !== undefined) {
                delete this.Gender.Polish;
            }
            if (this.PersonPerspective?.Polish !== undefined) {
                delete this.PersonPerspective.Polish;
            }

            if (this.Tenses?.Polish !== undefined) {
                delete this.Tenses.Polish;
            }
            if (this.Cases !== null) {
                for (let c in this.Cases) {
                    for(const n of ["Singular", "Plural"] as ["Singular", "Plural"]) {
                        if (this.Cases[c as keyof CaseStructure<string>]?.Singular?.Name.Polish !== undefined) {
                            delete this.Cases[c as keyof CaseStructure<string>][n]?.Name.Polish;
                            delete this.Cases[c as keyof CaseStructure<string>][n]?.Normalised.Polish;
                            delete this.Cases[c as keyof CaseStructure<string>][n]?.IPA.Polish;
                            delete this.Cases[c as keyof CaseStructure<string>][n]?.Morpheme.Polish;
                        }
                    }
                }
            }
        }

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
            IPA:this.IPA,
            Morpheme:this.Morpheme,
            Normalised:this.Normalised,
            ExcludeFromWordChoice:(this.IsProfane||this.IsDerogatory||this.IsOffensive||this.HasBias),
            WordId:this.UniqueId,
        }
        return wr;
    }
    AddAlias(ref:WordReference, c:keyof CaseStructure<WordReference>, p:keyof CasePlurality<WordReference>){
        this.Aliases.push(ref);
        if(this.Cases !== null) this.Cases[c][p] = ref;
        return this;
    }
    TranslateMorpheme(l:keyof i18n<string>, m:MorphemeStructure<Languages>){
        this.Morpheme[l] = m;
        return this;
    }
    AddGraphehe(l:keyof i18n<string>, m:Grapheme<Languages>[]){
        this.IPA[l] = m;
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
    Comparative:WordReference|null;
    Superlative:WordReference|null;
    public static GetDegree(w:string, s:boolean):string{
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
        else if (Morpheme.GetStructure("English",w).Schema ==="cvc"){
            return w + w.at(-1) + "er";
        }
        return w;
    }
    constructor(pos:"Adjective",options:WordOptions) {
        super(pos, options);
        let comp = {English:Adjective.GetDegree(options.word.English.toLowerCase(), true)};
        let sup = {English:Adjective.GetDegree(options.word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            Morpheme:{English:Morpheme.GetStructure("English",this.Name.English)},
            WordId:crypto.randomUUID(),
            Normalised:comp,
            IPA:{English:Morpheme.Generate("English", comp.English)}
        }
        let supref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            WordId:crypto.randomUUID(),
            Normalised:comp,
             Morpheme:{English:Morpheme.GetStructure("English",this.Name.English)},
            IPA:{English:Morpheme.Generate("English", comp.English)}
        }
        this.Comparative = compref
        this.Superlative = supref
        this.Aliases.push(compref, supref);
    }
}
export class Adverb extends Word<"Adverb">{
    Kind:AdverbVariant;
    constructor(pos:"Adverb",options:AdverbOptions) {
        super(pos, options);
        this.Kind = options.kind||"Undetermined";
    }
}
export class Determiner extends Word<"Determiner"> {
    Kind:DeterminerVariant;
    constructor(pos:"Determiner",options:DeterminerOptions) {
        super(pos, options);
        this.Kind = options.kind||"Undetermined";
    }
}
export class Conjunction extends Word<"Conjunction"> {
    Kind:ConjunctionVariant;
    constructor(pos: "Conjunction", options:ConjunctionOptions) {
        super(pos, options);
        this.Kind = options.kind||"Undetermined";
    }
}
export class Noun extends Word<"Noun"> {
    Kind:string;
    IsSingular:boolean;
    IsPlural:boolean;
    IsCountable:boolean;
    IsSingularOnly:boolean;
    IsPluralOnly:boolean;
    constructor(pos:"Noun",options:NounOptions){
        super(pos, options);
        this.Kind = options.kind || "Undetermined";
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
    Kind:string;
    constructor(pos:"Verb",options:VerbOptions){
        super(pos, options);
        this.IsTransitive = options.istransitive||true;
        this.IsActive = options.isactive||true;
        this.Kind = options.kind || "Undetermined";
    }
}
export class Participle extends Word<"Participle"> {
    IsTransitive:boolean;
    IsActive:boolean;
    Comparative:WordReference|null;
    Superlative:WordReference|null;
    constructor(pos:"Participle",options:VerbOptions){
        super(pos, options);
        this.IsTransitive = options.istransitive||true;
        this.IsActive = options.isactive||true;
        let comp = {English:Adjective.GetDegree(options.word.English.toLowerCase(), true)};
        let sup = {English:Adjective.GetDegree(options.word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            Morpheme:{English:Morpheme.GetStructure("English",this.Name.English)},
            WordId:crypto.randomUUID(),
            Normalised:comp,
            IPA:{English:Morpheme.Generate("English", comp.English)}
        }
        let supref:WordReference = {
            Name:sup,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            WordId:crypto.randomUUID(),
            Normalised:sup,
            Morpheme:{English:Morpheme.GetStructure("English",this.Name.English)},
            IPA:{English:Morpheme.Generate("English", comp.English)}
        }
        this.Comparative = compref
        this.Superlative = supref
        this.Aliases.push(compref, supref);
    }
}
export class Pronoun extends Word<"Pronoun"> {
    Kind:PronounVariant;
    constructor(pos:"Pronoun",options:PronounOptions){
        super(pos, options);
        this.Kind = options.kind||"Undetermined";
    }
}
export class Preposition extends Word<"Preposition"> {
    Kind:PrepositionVariant;
    constructor(pos:"Preposition", options:PrepositionOptions) {
        super(pos, options);
        this.Kind = options.kind||"Undetermined";
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