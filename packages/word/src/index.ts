import {i18n, Languages} from "@dictionary/i18n";
import {Grapheme, GraphemeGenerator} from "@dictionary/grapheme";
import {MorphemeStructure, MorphemeStructureInstance} from "@dictionary/morpheme";
import {CaseStructure, TenseContainer, TenseTime, CasePlurality} from "@dictionary/conjugator";
import {Gender, PersonPerspective} from "@dictionary/misc";
import {Definition, DefinitionInstance} from "@dictionary/definition";
import {Thesaurus} from "@dictionary/thesaurus";
import { AdverbOptions, ConjunctionOptions, DeterminerOptions, NounOptions, OptionsByPartOfSpeech, PrepositionOptions, PronounOptions, PropernounOptions, VerbOptions, WordOptions } from "./components/argoptions.js";
import { AdverbVariant, ConjunctionVariant, DeterminerVariant, PrepositionVariant, PronounVariant } from "./components/variants.js";
export interface PartOfSpeech {
    "Adjective":"Adjective";
    "Adverb":"Adverb";
    "Conjunction":"Conjunction";
    "Determiner":"Determiner";
    "Exclamation":"Exclamation";
    "Interjection":"Interjection";
    "Noun":"Noun";
    "Numeral":"Numeral";
    "Participle":"Participle";
    "Preposition":"Preposition";
    "Pronoun":"Pronoun";
    "Propernoun":"Propernoun";
    "Verb":"Verb";
    "Unknown":"Unknown";
}
export type POS = keyof PartOfSpeech;
export interface UnitWord {
    Name:i18n<string>;
    Exists:boolean;
    ExcludeFromWordChoice:i18n<boolean>;
}
export interface UnknownWord extends UnitWord {
    Exists:false;
    ExcludeFromWordChoice:i18n<true>;
}
export interface WordReference extends UnitWord {
    id:string;
    Exists:true;
    Romanised:i18n<string>;
    IPA:i18n<Grapheme<Languages>[]>;
    Morpheme:i18n<MorphemeStructure<Languages>>;
}
export interface BaseWord extends UnitWord {
    Exists:true;
    SupportedLanguages:i18n<boolean>;
    Romanised?:i18n<string>;
    Aliases:Array<WordReference>;
    IsRecordComplete:boolean;
    BiasType?:i18n<string>;
    Thesaurus:Thesaurus<WordReference>;
    PersonPerspective:i18n<PersonPerspective>;
    IPA:i18n<Grapheme<Languages>[]>;
    Gender:i18n<Gender>;

    HasBias:i18n<boolean>;
    IsPropernoun:i18n<boolean>;
    IsAnimate:i18n<boolean>;
    IsAbbreviation:i18n<boolean>;
    IsColloquial:i18n<boolean>;
    IsUsedFormally:i18n<boolean>;
    IsUsedCasually:i18n<boolean>;
    IsProfane:i18n<boolean>;
    IsDerogatory:i18n<boolean>;
    IsOffensive:i18n<boolean>;
    IsShortened:i18n<boolean>;
    IsConjugatable:i18n<boolean>;
    IsArchaic:i18n<boolean>;
    IsNeologism:i18n<boolean>;
    IsParasitic:i18n<boolean>;
    Visible:i18n<boolean>;
    Indexable:i18n<boolean>;

    Denotation:Definition;
    Connotation?:Definition;
    id:string;
    POS:POS;
    Morpheme:i18n<MorphemeStructure<Languages>>;
    
    Tenses?:i18n<TenseContainer<Languages, WordReference>>;
    CurrentTense?:TenseTime;

    Cases?:CaseStructure<WordReference>;
    CurrentCase?:keyof CaseStructure<WordReference>;
    
    Euphemisms:Array<WordReference>;
    Contexts:Array<WordReference>;
    Category:i18n<string>;
}

export class Word<P extends POS> implements BaseWord {
    Name:i18n<string>;
    ExcludeFromWordChoice:i18n<boolean>;

    Exists:true;
    SupportedLanguages:i18n<boolean>;
    Romanised:i18n<string>;
    Aliases:Array<WordReference>;
    IsRecordComplete:boolean;
    BiasType?:i18n<string>;
    Thesaurus:Thesaurus<WordReference>;
    PersonPerspective:i18n<PersonPerspective>;
    IPA:i18n<Grapheme<Languages>[]>;
    Gender:i18n<Gender>;

    HasBias:i18n<boolean>;
    IsPropernoun:i18n<boolean>;
    IsAnimate:i18n<boolean>;
    IsAbbreviation:i18n<boolean>;
    IsColloquial:i18n<boolean>;
    IsUsedFormally:i18n<boolean>;
    IsUsedCasually:i18n<boolean>;
    IsProfane:i18n<boolean>;
    IsDerogatory:i18n<boolean>;
    IsOffensive:i18n<boolean>;
    IsShortened:i18n<boolean>;
    IsConjugatable:i18n<boolean>;
    IsArchaic:i18n<boolean>;
    IsNeologism:i18n<boolean>;
    IsParasitic:i18n<boolean>;
    Visible:i18n<boolean>;
    Indexable:i18n<boolean>;

    Denotation:Definition;
    Connotation?:Definition;
    id:string;
    POS:P;
    Morpheme:i18n<MorphemeStructure<Languages>>;
    
    Tenses?:i18n<TenseContainer<Languages, WordReference>>;
    Cases?:CaseStructure<WordReference>;
    CurrentTense?:TenseTime;
    CurrentCase?:keyof CaseStructure<WordReference>;
    
    Euphemisms:Array<WordReference>;
    Contexts:Array<WordReference>;
    Category:i18n<string>;
    constructor(pos:P, options:OptionsByPartOfSpeech[keyof OptionsByPartOfSpeech]){
        //Step 1
        if(typeof options.Word.English === "undefined") throw "";
        this.id = crypto.randomUUID();
        this.Name = options.Word;
        let SupportedLanguages:i18n<boolean> = {
            English:true,
            Polish:typeof options.Word.Polish === "string"
        }
        this.Contexts = [];
        this.Thesaurus = {};
        this.Euphemisms = options.Euphemisms||[];
        this.SupportedLanguages = SupportedLanguages;
        this.IsRecordComplete = false;
        this.Exists = true;
        this.IsRecordComplete = false;
        this.SupportedLanguages = SupportedLanguages;
        this.Aliases = [];
        this.Romanised = options.Romanised;
        this.POS = pos;

        //Step 2
        this.IsAnimate = {
            English:options.Animate?.English || false,
        };
        this.IsAbbreviation = {
            English:options.Abbreviation?.English ||false,
        };
        this.IsColloquial = {
            English:options.Colloquial?.English ||false
        };
        this.IsUsedFormally = {
            English:options.Formal?.English ||false
        };
        this.IsUsedCasually = {
            English:options.Informal?.English||true
        };
        this.IsProfane = {
            English:options.Profane?.English||false
        };
        this.Gender = {English:options.Gender?.English || "U"}
        this.IPA = {English:GraphemeGenerator.Generate("English", options.Word.English)};
        this.IsDerogatory = {English:options.Derogatory?.English||false};
        this.IsOffensive = {English:options.Offensive?.English||false};
        this.IsShortened = {English:options.Shortened?.English||false};
        this.IsConjugatable = {English:true};
        this.IsPropernoun = {English:pos === "Propernoun"};
        this.IsArchaic = {English:options.Archaic?.English||false};
        this.IsNeologism = {English:options.Neologism?.English||false};
        this.Category = options.Category||{English:"Uncategorised"};
        this.ExcludeFromWordChoice = {
            English:options.WordChoiceExclusion?.English || !(this.IsOffensive.English||this.IsProfane.English||this.IsDerogatory.English||this.IsOffensive.English)
        };
        this.PersonPerspective={English:options.Perspective?.English || 0};
        this.Morpheme = {English:MorphemeStructureInstance.Build("English",options.Word.English)};
        this.IsParasitic = {English:options.Parasitic?.English||false};
        this.Visible = {English:false};
        this.HasBias = {English:false};
        this.Indexable = {English:false};
        
        //Step 3 (Polish Support)
        if(SupportedLanguages.Polish && typeof options.Word.Polish) {
            this.IsAnimate.Polish = options.Animate?.Polish || false;
            this.IsAbbreviation.Polish = options.Abbreviation?.Polish || false;
            this.IsColloquial.Polish = options.Colloquial?.Polish || false;
            this.IsUsedFormally.Polish = options.Formal?.Polish || true;
            this.IsUsedCasually.Polish = options.Informal?.Polish||true;
            this.IsProfane.Polish = options.Profane?.Polish||false;
            this.IsDerogatory.Polish = options.Derogatory?.Polish||false;
            this.IsOffensive.Polish = options.Offensive?.Polish||false;
            this.IsShortened.Polish = options.Shortened?.Polish||false;
            this.IsConjugatable.Polish = true;
            this.IsPropernoun.Polish = pos === "Propernoun";
            this.IsArchaic.Polish = options.Archaic?.Polish || false;
            this.IsNeologism.Polish = options.Neologism?.Polish || false;
            this.Category.Polish = "Bez Kategorii";
            this.ExcludeFromWordChoice.Polish = options.WordChoiceExclusion?.Polish || !(this.IsOffensive.Polish||this.IsProfane.Polish||this.IsDerogatory.Polish||this.IsOffensive.Polish)
            this.IsParasitic.Polish = options.Parasitic?.Polish || false;
            this.Morpheme.Polish = MorphemeStructureInstance.Build("Polish",options.Word.Polish as string);
            this.IPA.Polish = GraphemeGenerator.Generate("Polish", options.Word.Polish as string);
            this.Gender.Polish = options.Gender?.Polish || "U",
            this.PersonPerspective.Polish = options.Perspective?.Polish || 0;
            this.Visible.Polish = false;
            this.HasBias.Polish = false;
            this.Indexable.Polish = false;
        }

        this.Denotation = new DefinitionInstance({
            content:options.Denotation,
            sources:options.Sources||[],
            creator:"Test"
        });
    }
    ToWordReference():WordReference {
        let wr:WordReference = {
            Name:this.Name,
            Romanised:this.Romanised,
            Exists:true,
            IPA:this.IPA,
            Morpheme:this.Morpheme,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            id:this.id,
        }
        return wr;
    }
    AddAlias(ref:WordReference, c:keyof CaseStructure<WordReference>, p:keyof CasePlurality<WordReference>){
        this.Aliases.push(ref);
        if(typeof this.Cases !== "undefined") this.Cases[c][p] = ref;
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

    TranslateDenotation(content:i18n<string>, ver:string, curr:boolean=true) {
        let deftomodify = this.Denotation.Versions.filter(defs=>defs.Version===ver);
        deftomodify.forEach((def)=>{
            def.Content=content;
            if(curr) this.Denotation.Current = def;
        });
        this.Denotation.LastModifiedAt = Date.now();
        return this;
    }
    TranslateConnotation(content:i18n<string>, ver:string, curr:boolean=true) {
        let conn:Definition = this.Connotation ?? new DefinitionInstance({
            content:content,
            sources:[],
            creator:"",
        });
        let deftomodify = conn.Versions.filter(def=>def.Version===ver);
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

//PARTS OF SPEECH

export class Interjection extends Word<"Interjection"> {}
export class Exclamation extends Word<"Exclamation"> {}
export class Numeral extends Word<"Numeral"> {}

export class Adjective extends Word<"Adjective"> {
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
        else if (MorphemeStructureInstance.Build("English",w).Schema ==="cvc"){
            return w + w.at(-1) + "er";
        }
        return w;
    }
    constructor(pos:"Adjective",options:WordOptions) {
        super(pos, options);
        let comp:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), true)};
        let sup:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            id:crypto.randomUUID(),
            Romanised:comp,
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        let supref:WordReference = {
            Name:sup,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            id:crypto.randomUUID(),
            Romanised:comp,
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        if(typeof this.Name.Polish === "string") {
            compref.Name.Polish = this.Name.Polish;
            compref.Romanised.Polish = this.Romanised?.Polish 
            compref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            compref.IPA.Polish = this.IPA.Polish;
            compref.Morpheme.Polish = this.Morpheme.Polish

            supref.Name.Polish = this.Name.Polish;
            supref.Romanised.Polish = this.Romanised?.Polish 
            supref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            supref.IPA.Polish = this.IPA.Polish;
            supref.Morpheme.Polish = this.Morpheme.Polish;
        }
        this.Aliases.push(compref, supref);
    }
}


export class Adverb extends Word<"Adverb">{
    Kind:AdverbVariant;
    constructor(pos:"Adverb",options:AdverbOptions) {
        super(pos, options);
        this.Kind = options.Kind || "Undetermined";

    }
}
export class Determiner extends Word<"Determiner"> {
    Kind:DeterminerVariant;
    constructor(pos:"Determiner",options:DeterminerOptions) {
        super(pos, options);
        this.Kind = options.Kind||"Undetermined";
    }
}
export class Conjunction extends Word<"Conjunction"> {
    Kind:ConjunctionVariant;
    constructor(pos: "Conjunction", options:ConjunctionOptions) {
        super(pos, options);
        this.Kind = options.Kind||"Undetermined";
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
        this.Kind = options.Kind || "Undetermined";
        this.IsSingular = !options.Word.English.endsWith("s");
        this.IsPlural = options.Word.English.endsWith("s");
        this.IsCountable = options.Countable||true;
        this.IsSingularOnly = options.Singleonly||false;
        this.IsPluralOnly = options.Pluralonly||false;
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
        this.IsTransitive = options.Transitive||true;
        this.IsActive = options.Active||true;
        this.Kind = options.Kind || "Undetermined";
    }
}
export class Participle extends Word<"Participle"> {
    constructor(pos:"Participle",options:VerbOptions){
        super(pos, options);
        let comp:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), true)};
        let sup:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            id:crypto.randomUUID(),
            Romanised:comp,
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        let supref:WordReference = {
            Name:sup,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            id:crypto.randomUUID(),
            Romanised:comp,
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        if(typeof this.Name.Polish === "string") {
            compref.Name.Polish = this.Name.Polish;
            compref.Romanised.Polish = this.Romanised?.Polish 
            compref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            compref.IPA.Polish = this.IPA.Polish;
            compref.Morpheme.Polish = this.Morpheme.Polish

            supref.Name.Polish = this.Name.Polish;
            supref.Romanised.Polish = this.Romanised?.Polish 
            supref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            supref.IPA.Polish = this.IPA.Polish;
            supref.Morpheme.Polish = this.Morpheme.Polish;
        }
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