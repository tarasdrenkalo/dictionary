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
import {Thesaurus} from "@dictionary/thesaurus";
import {
    AdverbOptions,
    ConjunctionOptions,
    DeterminerOptions,
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
    PrepositionVariant,
    PronounVariant
} from "./components/variants.js";
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
    Conjugate():void;
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
    Conjugate():void {}

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
        this.IsConjugatable = {English:["Verb", "Adjective", "Participle", "Noun", "Pronoun", "Propernoun"].includes(this.POS)};
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
            this.IsConjugatable.Polish = this.IsConjugatable.English;
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

        this.Conjugate();
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
            "Verb":new Verb("Verb", options as VerbOptions),
            "Unknown":new Word("Unknown", options),
        }
        return Constructors[pos];
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
        this.CurrentCase = c;
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
    GENERATE_CONJUGATED_VERBS() {
            let MergeRef = (
                    base: WordReference,
                    translate:Partial<i18n<string>>
                ): WordReference => {
                let ref: WordReference = {
                    ...base,
                    id: crypto.randomUUID(),
                    Romanised: { ...(base.Romanised ?? {}) },
                    IPA: { ...(base.IPA ?? {}) },
                };

                if (translate.English) {
                    ref.Romanised.English = translate.English;
                    ref.IPA.English = GraphemeGenerator.Generate("English", translate.English);
                }
                if (translate.Polish) {
                    ref.Romanised.Polish = translate.Polish;
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
    get CONJUGATE_VERB(){
        return this.Tenses;
    }
    GENERATE_CONJUGATED_NOUNS() {
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
                    Romanised:{English:`${EnglishDeclensed[c][n]}`},
                    id:crypto.randomUUID() as string,
                    IPA:{English:GraphemeGenerator.Generate("English", `${EnglishDeclensed[c][n]}`)},
                    Morpheme:{English:MorphemeStructureInstance.Build("English", `${EnglishDeclensed[c][n]}`)}
                }
                if(ispolishsupported) {
                    rf.Name.Polish = PolishDeclensed[c][n];
                    rf.Romanised.Polish = PolishDeclensed[c][n];
                    rf.Morpheme.Polish = MorphemeStructureInstance.Build("Polish", `${PolishDeclensed[c][n]}`);
                }
                cs[c][n] = rf;
                this.AddAlias(rf, c, n);
            }
        }
        this.Cases = cs;
    }
    GENERATE_CONJUGATED_ADJECTIVES():void {
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
        const PolishDeclensed = (typeof this.Name.Polish === "string"&& typeof this.Gender.Polish === "string")? POLISH_DECLENCE_ADJECTIVE(this.Name.Polish):undefined;
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
                    Romanised:{English:`${EnglishDeclensed[c][n]}`},
                    id:crypto.randomUUID() as string,
                    IPA:{English:GraphemeGenerator.Generate("English", `${EnglishDeclensed[c][n]}`)},
                    Morpheme:{English:MorphemeStructureInstance.Build("English", `${EnglishDeclensed[c][n]}`)}
                }
                if(ispolishsupported) {
                    rf.Name.Polish = PolishDeclensed[c][n];
                    rf.Romanised.Polish = PolishDeclensed[c][n];
                    rf.Morpheme.Polish = MorphemeStructureInstance.Build("Polish", `${PolishDeclensed[c][n]}`);
                }
                cs[c][n] = rf;
                this.AddAlias(rf, c, n);
            }
        }
        this.Cases = cs;
    }
    CONJUGATE_ADJECTIVE() {
        if(typeof this.Cases === undefined) throw "";
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
            const PolishDeclensed = (typeof this.Name.Polish === "string"&& typeof this.Gender.Polish === "string")? POLISH_DECLENCE_ADJECTIVE(this.Name.Polish):undefined;
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
                        Romanised:{English:`${EnglishDeclensed[c][n]}`},
                        id:crypto.randomUUID() as string,
                        IPA:{English:GraphemeGenerator.Generate("English", `${EnglishDeclensed[c][n]}`)},
                        Morpheme:{English:MorphemeStructureInstance.Build("English", `${EnglishDeclensed[c][n]}`)}
                    }
                    if(ispolishsupported) {
                        rf.Name.Polish = PolishDeclensed[c][n];
                        rf.Romanised.Polish = PolishDeclensed[c][n];
                        rf.Morpheme.Polish = MorphemeStructureInstance.Build("Polish", `${PolishDeclensed[c][n]}`);
                    }
                    cs[c][n] = rf;
                    this.AddAlias(rf, c, n);
                }
            }
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
    Conjugate() {
        this.GENERATE_CONJUGATED_ADJECTIVES();
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
    IsSingular:i18n<boolean>;
    IsPlural:i18n<boolean>;
    IsCountable:i18n<boolean>;
    IsSingularOnly:i18n<boolean>;
    IsPluralOnly:i18n<boolean>;
    Conjugate() {
        this.GENERATE_CONJUGATED_NOUNS();
    }
    constructor(pos:"Noun",options:NounOptions){
        super(pos, options);
        this.Kind = options.Kind || "Undetermined";
        let EW = options.Word.English;
        let PW = options.Word.Polish
        this.IsSingular = {English:pluralize.isSingular(EW)};
        this.IsPlural = {English:pluralize.isPlural(EW)};
        this.IsCountable = {English:!(pluralize.plural(EW)==pluralize.singular(EW))};
        this.IsSingularOnly = {English:(pluralize.plural(EW)==EW)};
        this.IsPluralOnly = {English:(pluralize.singular(EW)==EW)};
        if(typeof PW === "string"){
            this.IsSingular.Polish = true;
            this.IsPlural.Polish = true;
            this.IsCountable.Polish = true;
            this.IsSingularOnly.Polish = false;
            this.IsPluralOnly.Polish = false;
        }
    }
}
export class Verb extends Word<"Verb">{
    Kind:string;
    IsTransitive:i18n<boolean>;
    IsActive:i18n<boolean>;
    Conjugate() {
        this.GENERATE_CONJUGATED_VERBS();
    }
    constructor(pos:"Verb",options:VerbOptions){
        super(pos, options);
        this.IsTransitive = {English:true};
        this.IsActive = {English:true};
        this.Kind = options.Kind || "Undetermined";
        if(typeof this.Name.Polish === "string"){
            this.IsTransitive.Polish = true;
            this.IsActive.Polish = true;
        }
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