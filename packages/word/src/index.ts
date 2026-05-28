export * from "./components/argoptions.js";
export * from "./components/variants.js";
import pluralize from "pluralize";
import {i18n, Languages} from "@dictionary/i18n";
import {Grapheme, GraphemeGenerator } from "@dictionary/grapheme";
import {MorphemeStructure, MorphemeStructureInstance} from "@dictionary/morpheme";
import {
    CaseStructure,
    EnglishTenseBlock,
    PolishTenseBlock,
    PolishSingular,
    TenseContainer,
    TenseTime,
    CasePlurality,
    EnglishVerbConjugator,
    PolishVerbConjugator,
    TenseContainerByLanguage,
    ENGLISH_DECLENCE_NOUN,
    POLISH_DECLENCE_NOUN,
    POLISH_DECLENCE_ADJECTIVE
} from "@dictionary/conjugator";
import {Gender, PersonPerspective} from "@dictionary/misc";
import {Definition, DefinitionInstance} from "@dictionary/definition";
import {Thesaurus, ThesaurusType} from "@dictionary/thesaurus";
import {
    AdverbOptions,
    ConjunctionOptions,
    DeterminerOptions,
    InterjectionOptions,
    NounOptions,
    OptionsByPartOfSpeech,
    PrepositionOptions,
    PronounOptions,
    PropernounOptions,
    VerbOptions,
    WordOptions
} from "./components/argoptions.js";
import {
    AdverbVariant,
    ConjunctionVariant,
    DeterminerVariant,
    InterjectionVariant,
    PrepositionVariant,
    PronounVariant
} from "./components/variants.js";
import assert from "assert";
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
    "Unknown":Word;
}
export type POS = keyof PartOfSpeech;

export interface UnitWord {
    Name:i18n<string>;
    Exists:boolean;
    ExcludeFromWordChoice:i18n<boolean>;
}
export interface WordReference extends UnitWord {
    id:string;
    Exists:true;
    IPA:i18n<Grapheme<Languages>[]>;
    Morpheme:i18n<MorphemeStructure<Languages>>;
}
export interface BaseWord extends UnitWord {
    Exists:true;
    IsRecordComplete:boolean;
    id:string;
    POS:POS;

    Aliases:Array<WordReference>;
    
    Name: i18n<string>;
    ExcludeFromWordChoice: i18n<boolean>;

    BiasType?:i18n<string>;
    SetBiasType(lang:Languages, type:string):void;

    Thesaurus:Thesaurus<WordReference>;
    SetThesaurus(type:ThesaurusType, record:WordReference):void;

    PersonPerspective:i18n<PersonPerspective>;
    SetPersonPerspective(lang:Languages, val:PersonPerspective):void;

    IPA:i18n<Grapheme<Languages>[]>;
    SetIPA(lang:Languages, graphs:Array<Grapheme<typeof lang>>):void;

    Gender:i18n<Gender>;
    SetGender(lang:Languages, val:Gender):void;
    
    IsBiased:i18n<boolean>;
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
    SetWordBooleans(lang:Languages, bools:{
        biased:boolean,
        propernoun:boolean,
        animate:boolean;
        abbreviation:boolean;
        colloquialism:boolean;
        formalusage:boolean;
        informalusage:boolean;
        profanity:boolean;
        derogatory:boolean;
        offensive:boolean;
        shortcut:boolean;
        conjugatable:boolean;
        archaism:boolean;
        neologism:boolean;
        parasitic:boolean;
    }):void;

    Visible:i18n<boolean>;
    SetVisibilityStatus(lang:Languages, visible:boolean):void;

    Indexable:i18n<boolean>;
    SetIndexabilityStatus(lang:Languages, indexable:boolean):void;

    Denotation:Definition;
    Connotation?:Definition;
    
    Morpheme:i18n<MorphemeStructure<Languages>>;
    SetMorpheme(lang:Languages, morphs:MorphemeStructure<typeof lang>):void;
    
    Tenses?:i18n<TenseContainer<Languages, WordReference>>;
    CurrentTense?:TenseTime;

    Cases?:CaseStructure<WordReference>;
    CurrentCase?:keyof CaseStructure<WordReference>;
    
    Euphemisms:Array<WordReference>;
    Contexts:Array<WordReference>;

    Category:i18n<string>;
    AddToCategory(lang:Languages, name:string):void;


    IsDerivativeOf:WordReference;
    Derive():void;
    Conjugate():void;

    AddAlias(ref:WordReference, c:keyof CaseStructure<WordReference>, p:keyof CasePlurality<WordReference>):this;
    TranslateDenotation(content:i18n<string>, ver:string, curr:boolean):this;
    TranslateConnotation(content:i18n<string>, ver:string, curr:boolean):this;
}

export class Word implements BaseWord {
    Exists:true;
    IsRecordComplete:boolean;
    id:string;
    POS:POS;

    Aliases:Array<WordReference>;

    IsDerivativeOf!:WordReference;
    ToWordReference():WordReference {
        let wr:WordReference = {
            Name:this.Name,
            Exists:true,
            IPA:this.IPA,
            Morpheme:this.Morpheme,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            id:this.id,
        }
        return wr;
    }

    
    Name: i18n<string>;
    ExcludeFromWordChoice: i18n<boolean>;

    BiasType?:i18n<string>;
    SetBiasType(lang:Languages, type:string) {
        switch(lang) {
            case "English": {
                this.BiasType!.English = this.BiasType?.English ?? type
            }
            case "Polish": {
                this.BiasType!.Polish = type
            }
        }
    };

    Thesaurus:Thesaurus<WordReference>;
    SetThesaurus(type:ThesaurusType, record:WordReference) {
        this.Thesaurus[type]?.push(record);
    };

    PersonPerspective!:i18n<PersonPerspective>;
    SetPersonPerspective(lang:Languages, val:PersonPerspective) {
        switch(lang) {
            case "English": {
                this.PersonPerspective = this.PersonPerspective ?? {English:val}
            }
            case "Polish": {
                this.PersonPerspective!.Polish = val
            }
        };
    }

    IPA!:i18n<Grapheme<Languages>[]>;
    SetIPA(lang:Languages, graphs:Array<Grapheme<typeof lang>>) {
        switch(lang) {
            case "English": {
                this.IPA ??= {English:graphs}
            }
            case "Polish": {
                this.IPA!.Polish = graphs
            }
        }
    };

    Gender!:i18n<Gender>;
    SetGender(lang:Languages, val:Gender) {
        switch(lang) {
            case "English": {
                
                this.Gender = this.Gender ?? {English:val}
            }
            case "Polish": {
                this.Gender!.Polish = val;
            }
        }
    };

    IsBiased!:i18n<boolean>;
    IsAnimate!:i18n<boolean>;
    IsAbbreviation!:i18n<boolean>;
    IsColloquial!:i18n<boolean>;
    IsUsedFormally!:i18n<boolean>;
    IsUsedCasually!:i18n<boolean>;
    IsProfane!:i18n<boolean>;
    IsDerogatory!:i18n<boolean>;
    IsOffensive!:i18n<boolean>; 
    IsShortened!:i18n<boolean>;
    IsConjugatable!:i18n<boolean>;
    IsArchaic!:i18n<boolean>;
    IsNeologism!:i18n<boolean>;
    IsParasitic!:i18n<boolean>;
    SetWordBooleans(lang:Languages, bools:{
        biased:boolean,
        animate:boolean;
        abbreviation:boolean;
        colloquialism:boolean;
        formalusage:boolean;
        informalusage:boolean;
        profanity:boolean;
        derogatory:boolean;
        offensive:boolean;
        shortcut:boolean;
        conjugatable:boolean;
        archaism:boolean;
        neologism:boolean;
        parasitic:boolean;
    }) {
        let propmap:{[k in keyof Word]?:keyof typeof bools} = 
            {
                IsBiased:"biased",
                IsAnimate:"animate",
                IsAbbreviation:"abbreviation",
                IsColloquial:"colloquialism",
                IsUsedFormally:"formalusage",
                IsUsedCasually:"informalusage",
                IsProfane:"profanity",
                IsDerogatory:"derogatory",
                IsOffensive:"offensive",
                IsShortened:"shortcut",
                IsConjugatable:"conjugatable",
                IsArchaic:"archaism",
                IsNeologism:"neologism",
                IsParasitic:"parasitic",
            }
        switch(lang) {
            case "English":{
                for(let [objprop, argprop] of Object.entries(propmap)) {
                    (this[objprop as keyof Word] as i18n<boolean>) ??= {
                        English: bools[argprop as keyof typeof bools]
                    };
                }
            }
            case "Polish":{
                for(let [objprop, argprop] of Object.entries(propmap)) {
                    (this[objprop as keyof Word] as i18n<boolean>)!.Polish = bools[argprop as keyof typeof bools]
                }
            }
        }   
    }

    Visible!:i18n<boolean>;
    SetVisibilityStatus(lang:Languages, visible:boolean) {
        switch(lang) {
            case "English":{
                this.Visible ??= {
                    English: visible
                }
            }
            case "Polish":{
                this.Visible!.Polish = visible
            }
        }
    };

    Indexable!:i18n<boolean>;
    SetIndexabilityStatus(lang:Languages, indexable:boolean) {
        switch(lang) {
            case "English":{
                this.Indexable ??= {English:indexable}
            }
            case "Polish":{
                this.Indexable!.Polish = indexable
            }
        }
    };

    Denotation:Definition;
    Connotation?:Definition;
    
    Morpheme!:i18n<MorphemeStructure<Languages>>
    SetMorpheme(lang:Languages, morphs:MorphemeStructure<typeof lang>) {
        switch(lang) {
            case "English": {
                this.Morpheme.English = morphs;
            }
            case "Polish": {
                this.Morpheme.Polish = morphs;
            }
        }
    };
    
    Tenses?:i18n<TenseContainer<Languages, WordReference>>;
    CurrentTense?:TenseTime;

    Cases?:CaseStructure<WordReference>;
    CurrentCase?:keyof CaseStructure<WordReference>;
    
    Euphemisms:Array<WordReference>;
    Contexts:Array<WordReference>;

    Category!:i18n<string>;
    AddToCategory(lang:Languages, name:string) {
        switch(lang) {
            case "English":{
                this.Category.English ??= name
            };
            case "Polish":{
                this.Category.Polish ??= name
            }
        };
    }
    Derive() {}

    Conjugate() {};

    constructor(options:OptionsByPartOfSpeech[keyof OptionsByPartOfSpeech]){
        //Step 1
        assert(options.Word.English, "You did not define word!")
        if(typeof options.Word.English !== "string") throw "";
        this.id = crypto.randomUUID();
        this.Contexts = [];
        this.Thesaurus = {};
        this.IsRecordComplete = false;
        this.Exists = true;
        this.Aliases = [];
        this.Name = options.Word;
        this.Euphemisms = options.Euphemisms||[];
        this.POS = (this.constructor.name === "Word" ? "Unknown" : this.constructor.name) as POS;

        this.SetWordBooleans("English", {
            animate:options.Animate?.English ?? false,
            abbreviation:options.Abbreviation?.English ?? false,
            colloquialism:options.Colloquial?.English ?? false,
            formalusage:options.Formal?.English ?? false,
            informalusage:options.Informal?.English ?? false,
            profanity:options.Profane?.English ?? false,
            derogatory:options.Derogatory?.English ?? false,
            offensive:options.Offensive?.English ?? false,
            shortcut:options.Shortened?.English ?? false,
            conjugatable:["Verb", "Adjective", "Participle", "Noun", "Pronoun", "Propernoun"].includes(this.constructor.name || this.POS),
            archaism:options.Archaic?.English ?? false,
            neologism:options.Neologism?.English ?? false,
            biased:false,
            parasitic:options.Parasitic?.English ?? false
        });
        this.SetGender("English", options.Gender?.English ?? "U");
        this.SetIPA("English", GraphemeGenerator.Generate("English", options.Word.English));
        this.AddToCategory("English", options.Category?.English ?? "Uncategorised");
        this.SetPersonPerspective("English", options.Perspective?.English ?? 0);
        this.SetMorpheme("English", MorphemeStructureInstance.Build("English", options.Word.English));
        this.SetVisibilityStatus("English", false);
        this.SetIndexabilityStatus("English", false);
        
        this.ExcludeFromWordChoice = {
            English: !(this.IsOffensive.English||this.IsProfane.English||this.IsDerogatory.English),
        }
        
        if(typeof options.Word.Polish === "string") {
            this.SetWordBooleans("Polish", {
                animate:options.Animate?.Polish ?? false,
                abbreviation:options.Abbreviation?.Polish ?? false,
                colloquialism:options.Colloquial?.Polish ?? false,
                formalusage:options.Formal?.Polish ?? false,
                informalusage:options.Informal?.Polish ?? false,
                profanity:options.Profane?.Polish ?? false,
                derogatory:options.Derogatory?.Polish ?? false,
                offensive:options.Offensive?.Polish ?? false,
                shortcut:options.Shortened?.Polish ?? false,
                conjugatable:["Verb", "Adjective", "Participle", "Noun", "Pronoun", "Propernoun"].includes(this.POS),
                archaism:options.Archaic?.Polish ?? false,
                neologism:options.Neologism?.Polish ?? false,
                biased:false,
                parasitic:options.Parasitic?.Polish ?? false
            })
            this.AddToCategory("Polish", "Bez Kategorii");
            this.SetMorpheme("Polish", MorphemeStructureInstance.Build("Polish",options.Word.Polish))
            this.SetIPA("Polish", GraphemeGenerator.Generate("Polish", options.Word.Polish))
            this.SetGender("Polish", options.Gender?.Polish ?? "U")
            this.SetPersonPerspective("Polish", options.Perspective?.Polish ?? 0)
            this.SetVisibilityStatus("Polish", false)
            this.SetIndexabilityStatus("Polish", false)
            this.ExcludeFromWordChoice.Polish = !(this.IsOffensive.Polish||this.IsProfane.Polish||this.IsDerogatory.Polish);

        }

        this.Denotation = new DefinitionInstance({
            content:options.Denotation,
            sources:options.Sources||[],
            creator:"Test"
        });
        this.Conjugate();
    }
    
    static Create<K extends keyof PartOfSpeech>(pos:K, options:OptionsByPartOfSpeech[K]):PartOfSpeech[K] {
        const Constructors:PartOfSpeech = {
            "Adjective":new Adjective(options),
            "Adverb":new Adverb(options as AdverbOptions),
            "Conjunction":new Conjunction(options as ConjunctionOptions),
            "Determiner":new Determiner(options as DeterminerOptions),
            "Exclamation":new Exclamation(options),
            "Interjection":new Interjection(options as InterjectionOptions),
            "Noun":new Noun(options),
            "Numeral":new Numeral(options),
            "Participle":new Participle(options),
            "Preposition":new Preposition(options as PrepositionOptions),
            "Pronoun":new Pronoun(options as PronounOptions),
            "Propernoun":new Propernoun(options),
            "Verb":new Verb(options as VerbOptions),
            "Unknown":new Word(options),
        }
        return Constructors[pos];
    }
    
    AddAlias(ref:WordReference, c:keyof CaseStructure<WordReference>, p:keyof CasePlurality<WordReference>){
        this.CurrentCase = c;
        this.Aliases.push(ref);
        if(typeof this.Cases !== "undefined") this.Cases[c][p] = ref;
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
}

//PARTS OF SPEECH

export class Interjection extends Word {
    Kind: InterjectionVariant;
    constructor(options:InterjectionOptions) {
        super(options)
        this.Kind = options.Kind || "Undetermined";
    }
}
export class Exclamation extends Word {}
export class Numeral extends Word {}

export class Adjective extends Word {
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
    Conjugate() {
        let cs:CaseStructure<WordReference> = {
            Nominative: {},
            Genitive: {},
            Dative: {},
            Accusative: {},
            Instrumental: {},
            Locative: {},
            Vocative: {}
        }
        const EnglishDeclensed = ENGLISH_DECLENCE_NOUN(this.Name.English);
        const PolishDeclensed = (typeof this.Name.Polish === "string" && typeof this.Gender.Polish === "string") ? POLISH_DECLENCE_ADJECTIVE(this.Name.Polish):undefined;
        const allcasesarr:Array<keyof CaseStructure<string>> = [
            "Nominative", "Genitive", "Dative",
            "Accusative", "Instrumental", "Locative", "Vocative"
        ];
        const allnumbers:Array<keyof CasePlurality<string>> = ["Singular", "Plural"];
        for(const c of allcasesarr) {
            for(const n of allnumbers) {
                let rf:WordReference = {
                    ExcludeFromWordChoice:this.ExcludeFromWordChoice,
                    Exists:true,
                    Name:{English:`${EnglishDeclensed[c][n]}`},
                    id:crypto.randomUUID() as string,
                    IPA:{English:GraphemeGenerator.Generate("English", `${EnglishDeclensed[c][n]}`)},
                    Morpheme:{English:MorphemeStructureInstance.Build("English", `${EnglishDeclensed[c][n]}`)}
                }
                if(typeof PolishDeclensed !== "undefined") {
                    rf.Name.Polish = PolishDeclensed[c][n];
                    rf.Morpheme.Polish = MorphemeStructureInstance.Build("Polish", `${PolishDeclensed[c][n]}`);
                }
                cs[c][n] = rf;
                this.AddAlias(rf, c, n);
            }
        }
        this.Cases = cs;
    }
    constructor(options:WordOptions) {
        super(options);
        let comp:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), true)};
        let sup:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            id:crypto.randomUUID(),
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        let supref:WordReference = {
            Name:sup,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            id:crypto.randomUUID(),
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        if(typeof this.Name.Polish === "string") {
            compref.Name.Polish = this.Name.Polish;
            compref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            compref.IPA.Polish = this.IPA.Polish;
            compref.Morpheme.Polish = this.Morpheme.Polish

            supref.Name.Polish = this.Name.Polish;
            supref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            supref.IPA.Polish = this.IPA.Polish;
            supref.Morpheme.Polish = this.Morpheme.Polish;
        }
        this.Aliases.push(compref, supref);
        this.Conjugate();
    }
}


export class Adverb extends Word {
    Kind:AdverbVariant;
    constructor(options:AdverbOptions) {
        super(options);
        this.Kind = options.Kind || "Undetermined";
    }
}
export class Determiner extends Word {
    Kind:DeterminerVariant;
    constructor(options:DeterminerOptions) {
        super(options);
        this.Kind = options.Kind||"Undetermined";
    }
}
export class Conjunction extends Word {
    Kind:ConjunctionVariant;
    constructor(options:ConjunctionOptions) {
        super(options);
        this.Kind = options.Kind||"Undetermined";
    }
}
export class Noun extends Word {
    Kind:string;
    IsSingular:i18n<boolean>;
    IsPlural:i18n<boolean>;
    IsCountable:i18n<boolean>;
    IsSingularOnly:i18n<boolean>;
    IsPluralOnly:i18n<boolean>;

    Conjugate() {
        let cs:CaseStructure<WordReference> = {
            Nominative: {},
            Genitive: {},
            Dative: {},
            Accusative: {},
            Instrumental: {},
            Locative: {},
            Vocative: {}
        }
        const EnglishDeclensed = ENGLISH_DECLENCE_NOUN(this.Name.English);
        const PolishDeclensed = (typeof this.Name.Polish === "string"&& typeof this.Gender.Polish === "string")? POLISH_DECLENCE_NOUN(this.Name.Polish, this.Gender.Polish, false):undefined;
        const allcasesarr:Array<keyof CaseStructure<string>> = [
            "Nominative", "Genitive", "Dative",
            "Accusative", "Instrumental", "Locative", "Vocative"
        ];
        const allnumbers:Array<keyof CasePlurality<string>> = ["Singular", "Plural"];
        const ispolishsupported = PolishDeclensed != null;
        for(const c of allcasesarr) {
            for(const n of allnumbers) {
                let rf:WordReference = {
                    ExcludeFromWordChoice:this.ExcludeFromWordChoice,
                    Exists:true,
                    Name:{English:`${EnglishDeclensed[c][n]}`},
                    id:crypto.randomUUID() as string,
                    IPA:{English:GraphemeGenerator.Generate("English", `${EnglishDeclensed[c][n]}`)},
                    Morpheme:{English:MorphemeStructureInstance.Build("English", `${EnglishDeclensed[c][n]}`)}
                }
                if(ispolishsupported) {
                    rf.Name.Polish = PolishDeclensed[c][n];
                    rf.Morpheme.Polish = MorphemeStructureInstance.Build("Polish", `${PolishDeclensed[c][n]}`);
                }
                cs[c][n] = rf;
                this.AddAlias(rf, c, n);
            }
        }
        this.Cases = cs;
    }
    constructor(options:NounOptions){
        super(options);
        this.Kind = options.Kind || "Undetermined";
        this.IsSingular = {English:pluralize.isSingular(options.Word.English)};
        this.IsPlural = {English:pluralize.isPlural(options.Word.English)};
        this.IsCountable = {English:!(pluralize.plural(options.Word.English)==pluralize.singular(options.Word.English))};
        this.IsSingularOnly = {English:(pluralize.plural(options.Word.English)==options.Word.English)};
        this.IsPluralOnly = {English:(pluralize.singular(options.Word.English)==options.Word.English)};
        if(typeof options.Word.Polish === "string"){
            this.IsSingular.Polish = true;
            this.IsPlural.Polish = true;
            this.IsCountable.Polish = true;
            this.IsSingularOnly.Polish = false;
            this.IsPluralOnly.Polish = false;
        }
        this.Conjugate()
    }
}
export class Verb extends Word {
    Kind:string;
    IsTransitive:i18n<boolean>;
    IsActive:i18n<boolean>;
    Conjugate() {
        let MergeRef = (
                    base: WordReference,
                    translate:Partial<i18n<string>>
                ): WordReference => {
                let ref: WordReference = {
                    ...base,
                    id: crypto.randomUUID(),
                    IPA: { ...(base.IPA ?? {}) },
                };

                if (translate.English) {
                    ref.IPA.English = GraphemeGenerator.Generate("English", translate.English);
                }
                if (translate.Polish) {
                    ref.IPA.Polish = GraphemeGenerator.Generate("Polish", translate.Polish);
                }
                return ref;
            };

            let MapEnglishBlock = (
                base: WordReference,
                blocks:{
                    English:EnglishTenseBlock<string>,
                    Polish?:PolishTenseBlock<TenseTime, string>
                }
            ): EnglishTenseBlock<WordReference> => ({
                1: {
                    Singular: MergeRef(base, {
                        English:blocks.English[1].Singular,
                        Polish:blocks.Polish?.[1].Singular as any
                    }),
                    Plural:   MergeRef(base, {
                        English:blocks.English[1].Plural,
                        Polish:blocks.Polish?.[1].Plural as any
                    }),
                },
                2: {
                    Singular: MergeRef(base, {
                        English:blocks.English[2].Singular,
                        Polish:blocks.Polish?.[2].Singular as any}
                    ),
                    Plural:   MergeRef(base, {
                        English:blocks.English[2].Plural,
                        Polish:blocks.Polish?.[2].Plural}
                    ),
                },
                3: {
                    Singular: MergeRef(base, {
                        English:blocks.English[3].Singular,
                        Polish:blocks.Polish?.[3].Singular as any}
                    ),
                    Plural:   MergeRef(base, {
                        English:blocks.English[3].Plural,
                        Polish:blocks.Polish?.[3].Plural}
                    ),
                },
            });

            let MapPolishSingular = <P extends TenseTime>(
                base: WordReference,
                t:{
                    Polish:PolishSingular<P, string>,
                    English?:string
                }
            ): PolishSingular<P, WordReference> => {
                if (typeof t.Polish === "string") {
                    return MergeRef(base, {English:t.English, Polish:t.Polish}) as PolishSingular<P, WordReference>;
                }
                return {
                    M: MergeRef(base, {English:t.English, Polish:t.Polish.M}),
                    F: MergeRef(base, {English:t.English, Polish:t.Polish.F}),
                    ...(t.Polish.N ? { N: MergeRef(base, {English:t.English, Polish:t.Polish.N}) } : {}),
                } as PolishSingular<P, WordReference>;
            };
            let MapPolishBlock = <P extends TenseTime>(
                base: WordReference,
                blocks:{
                    Polish:PolishTenseBlock<P, string>,
                    English?:EnglishTenseBlock<string>
                }
            ): PolishTenseBlock<P, WordReference> => ({
                1: {
                    Singular: MapPolishSingular<P>(base, {Polish:blocks.Polish[1].Singular, English:blocks.English?.[1].Singular}),
                    Plural:   MergeRef(base, {English:blocks.English?.[1].Plural, Polish:blocks.Polish[1].Plural}),
                },
                2: {
                    Singular: MapPolishSingular<P>(base, {Polish:blocks.Polish[2].Singular, English:blocks.English?.[2].Singular}),
                    Plural:   MergeRef(base, {English:blocks.English?.[3].Plural, Polish:blocks.Polish[3].Plural}),
                },
                3: {
                    Singular: MapPolishSingular<P>(base, {Polish:blocks.Polish[3].Singular, English:blocks.English?.[3].Singular}),
                    Plural:   MergeRef(base, {English:blocks.English?.[3].Plural, Polish:blocks.Polish[3].Plural}),
                },
            });
            let CONJUGATE_EN = EnglishVerbConjugator.Conjugate(this.Name.English);
            let CONJUGATE_PL = typeof this.Name.Polish === "string" ? PolishVerbConjugator.Conjugate(this.Name.Polish) : undefined;
            let Base = this.ToWordReference();


            let English: TenseContainerByLanguage<WordReference>["English"] = {
                Present: {
                    Simple:      MapEnglishBlock(Base, {English:CONJUGATE_EN.Present.Simple, Polish:CONJUGATE_PL?.Present?.Simple}),
                    Progressive: MapEnglishBlock(Base,{English:CONJUGATE_EN.Present.Progressive, Polish:CONJUGATE_PL?.Present?.Simple}),
                    Participle:  MapEnglishBlock(Base, {English:CONJUGATE_EN.Present.Participle, Polish:CONJUGATE_PL?.Past?.Simple}),
                    Perfect:     MapEnglishBlock(Base, {English:CONJUGATE_EN.Present.Perfect, Polish:CONJUGATE_PL?.Past?.Simple}),
                },
                Past: {
                    Simple:      MapEnglishBlock(Base, {English:CONJUGATE_EN.Past.Simple, Polish:CONJUGATE_PL?.Past?.Simple}),
                    Progressive: MapEnglishBlock(Base, {English:CONJUGATE_EN.Past.Progressive, Polish:CONJUGATE_PL?.Past?.Simple}),
                    Participle:  MapEnglishBlock(Base, {English:CONJUGATE_EN.Past.Participle, Polish:CONJUGATE_PL?.Past?.Simple}),
                    Perfect:     MapEnglishBlock(Base, {English:CONJUGATE_EN.Past.Perfect, Polish:CONJUGATE_PL?.Past?.Simple}),
                },
                Future: {
                    Simple:      MapEnglishBlock(Base, {English:CONJUGATE_EN.Future.Simple, Polish:CONJUGATE_PL?.Future?.Simple}),
                    Progressive: MapEnglishBlock(Base, {English:CONJUGATE_EN.Future.Progressive, Polish:CONJUGATE_PL?.Future?.Simple}),
                    Participle:  MapEnglishBlock(Base, {English:CONJUGATE_EN.Future.Participle, Polish:CONJUGATE_PL?.Future?.Simple}),
                    Perfect:     MapEnglishBlock(Base, {English:CONJUGATE_EN.Future.Perfect, Polish:CONJUGATE_PL?.Future?.Simple}),
                },
            };
            let result: TenseContainerByLanguage<WordReference> = {English};

            if (typeof CONJUGATE_PL !== "undefined") {
                result.Polish = {
                    Present: { Simple: MapPolishBlock<"Present">(Base, {Polish:CONJUGATE_PL?.Present?.Simple, English:CONJUGATE_EN.Present.Simple}) },
                    Past:    { Simple: MapPolishBlock<"Past">(Base,    {Polish:CONJUGATE_PL?.Past?.Simple, English:CONJUGATE_EN.Past.Simple}) },
                    Future:  { Simple: MapPolishBlock<"Future">(Base,  {Polish:CONJUGATE_PL?.Future?.Simple, English:CONJUGATE_EN.Future.Simple}) },
                };
            }
            this.Tenses = result;
    }
    constructor(options:VerbOptions){
        super(options);
        this.IsTransitive = {English:true};
        this.IsActive = {English:true};
        this.Kind = options.Kind || "Undetermined";
        if(typeof this.Name.Polish === "string"){
            this.IsTransitive.Polish = true;
            this.IsActive.Polish = true;
        }
    }
}
export class Participle extends Word {
    IsTransitive:i18n<boolean>;
    IsActive:i18n<boolean>;
    constructor(options:VerbOptions){
        super(options);
        this.IsTransitive = {English: true};
        this.IsActive = {English: true};
        if(typeof this.Name.Polish === "string"){
            this.IsTransitive.Polish = true;
            this.IsActive.Polish = true;
        }
        let comp:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), true)};
        let sup:i18n<string> = {English:Adjective.GetDegree(options.Word.English.toLowerCase(), false)};
        let compref:WordReference = {
            Name:comp,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            id:crypto.randomUUID(),
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        let supref:WordReference = {
            Name:sup,
            ExcludeFromWordChoice:this.ExcludeFromWordChoice,
            Exists:true,
            id:crypto.randomUUID(),
            Morpheme:{English:MorphemeStructureInstance.Build("English",this.Name.English)},
            IPA:{English:GraphemeGenerator.Generate("English", comp.English)}
        }
        if(typeof this.Name.Polish === "string") {
            compref.Name.Polish = this.Name.Polish;
            compref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            compref.IPA.Polish = this.IPA.Polish;
            compref.Morpheme.Polish = this.Morpheme.Polish

            supref.Name.Polish = this.Name.Polish;
            supref.ExcludeFromWordChoice.Polish = this.ExcludeFromWordChoice.Polish;
            supref.IPA.Polish = this.IPA.Polish;
            supref.Morpheme.Polish = this.Morpheme.Polish;
        }
        this.Aliases.push(compref, supref);
        this.Conjugate()
    }
    Conjugate() {
        let cs:CaseStructure<WordReference> = {
            Nominative: {},
            Genitive: {},
            Dative: {},
            Accusative: {},
            Instrumental: {},
            Locative: {},
            Vocative: {}
        }
        const EnglishDeclensed = ENGLISH_DECLENCE_NOUN(this.Name.English);
        const PolishDeclensed = (typeof this.Name.Polish === "string" && typeof this.Gender.Polish === "string") ? POLISH_DECLENCE_ADJECTIVE(this.Name.Polish):undefined;
        const allcasesarr:Array<keyof CaseStructure<string>> = [
            "Nominative", "Genitive", "Dative",
            "Accusative", "Instrumental", "Locative", "Vocative"
        ];
        const allnumbers:Array<keyof CasePlurality<string>> = ["Singular", "Plural"];
        for(const c of allcasesarr) {
            for(const n of allnumbers) {
                let rf:WordReference = {
                    ExcludeFromWordChoice:this.ExcludeFromWordChoice,
                    Exists:true,
                    Name:{English:`${EnglishDeclensed[c][n]}`},
                    id:crypto.randomUUID() as string,
                    IPA:{English:GraphemeGenerator.Generate("English", `${EnglishDeclensed[c][n]}`)},
                    Morpheme:{English:MorphemeStructureInstance.Build("English", `${EnglishDeclensed[c][n]}`)}
                }
                if(typeof PolishDeclensed !== "undefined") {
                    rf.Name.Polish = PolishDeclensed[c][n];
                    rf.Morpheme.Polish = MorphemeStructureInstance.Build("Polish", `${PolishDeclensed[c][n]}`);
                }
                cs[c][n] = rf;
                this.AddAlias(rf, c, n);
            }
        }
        this.Cases = cs;
    }
}
export class Pronoun extends Noun {
    Kind:PronounVariant;
    constructor(options:PronounOptions){
        super(options);
        this.Kind = options.kind||"Undetermined";
    }
}
export class Preposition extends Word {
    Kind:PrepositionVariant;
    constructor(options:PrepositionOptions) {
        super(options);
        this.Kind = options.kind||"Undetermined";
    }
}
export class Propernoun extends Noun {
    Kind:string;
    constructor(options:PropernounOptions){
        super(options);
        this.Kind = options.kind||"";
    }
}