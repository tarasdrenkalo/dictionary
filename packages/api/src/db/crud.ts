import { 
    Filter,
    MongoClient
} from "mongodb";
import {i18n, Languages} from "@dictionary/i18n";
import {
    Word,
    PartOfSpeech,
    Verb,
    Participle,
    Noun,
    Adverb,
    Determiner,
    Conjunction,
    Pronoun,
    Preposition,
    Propernoun,
    Adjective,
    WordReference,
    AdverbVariant,
    ConjunctionVariant,
    DeterminerVariant,
    PronounVariant

} from "@dictionary/word";
import {
    DictionaryDBModFlags,
    DictionaryDBSEOFlags
} from "./flags.js";
import {
    DictionaryDBWordsCollection,
    DictionaryDBEditorialCollection,
    DictionaryDBDefinitionsCollection,
    DictionaryDBLexemeCollection,
    DictionaryDBMorphemeCollection,
    DictionaryDBCollections,
    InsertCollectionsToDB,
    DictionaryDBFilters,
    DictionaryDBSearchQuery
} from "./mappings.js";
import { Definition, DefinitionInstance } from "@dictionary/definition";
import { 
    CasePlurality,
    CaseStructure
} from "@dictionary/conjugator";
import { MorphemeStructureInstance } from "@dictionary/morpheme";
import { DictionaryDBUtil } from "./utils.js";

export class DictionaryDB {
    static Client = new MongoClient(
        `mongodb://${process.env.MONGODB_HOST || "localhost"}:${process.env.MONGODB_PORT || "27017"}/`
    );
    static Collection(c:"Words"|"Editorial"|"Definitions"|"Lexeme"|"Morpheme") {
        return this.Client.db("Dictionary").collection(c);
    }
    static async Insert(data: InsertCollectionsToDB) {
        await this.Client.connect()
        await this.Collection("Words").bulkWrite(
            DictionaryDBUtil.BuildUpserts(
                data.Word,
                w => ({ WordId: w.WordId }),
                w => ({
                    $setOnInsert: {
                        WordId: w.WordId,
                        Word: w.Word,
                        Thesaurus: w.Thesaurus
                    },
                    $addToSet: { Aliases: { $each: w.Aliases ?? [] } }
                })
            )
        );
        await this.Collection("Definitions").bulkWrite(
            DictionaryDBUtil.BuildUpserts(
                data.Definition,
                d => ({
                    Denotation: d.Denotation,
                    Connotation: d.Connotation ?? null
                }),
                d => ({
                    $addToSet: { WordIds: { $each: d.WordIds } }
                })
            )
        );
        await this.Collection("Editorial").bulkWrite(
            DictionaryDBUtil.BuildUpserts(
                data.Editorial,
                e => ({
                    KnownPOS: e.KnownPOS,
                    Complete:e.Complete,
                    Flags: e.Flags,
                    SEO: e.SEO
                }),
                e => ({
                    $addToSet: { WordIds: { $each: e.WordIds } }
                })
            )
        );
        await this.Collection("Morpheme").bulkWrite(
            DictionaryDBUtil.BuildUpserts(
                data.IPA,
                i => ({ IPA: i.IPA}),
                i => ({ $addToSet: { WordIds: { $each: i.WordIds } } })
            )
        );
        await this.Collection("Lexeme").bulkWrite(
            DictionaryDBUtil.BuildUpserts(
                data.Lexeme,
                l => ({
                    POS: l.POS,
                    Gender: l.Gender,
                    Kind: l.Kind,
                    Cases: l.Cases,
                    Tenses: l.Tenses,
                    CurrentCase: l.CurrentCase,
                    CurrentTense: l.CurrentTense,
                    PersonPerspective: l.PersonPerspective
                }),
                l => ({ $addToSet: { WordIds: { $each: l.WordIds } } })
            )
        );
        await this.Client.close();
    }
    static async DeleteById(...ids: string[]) {
        if (ids.length === 0) return;
        await this.Client.connect();
        const UpdateCmds: Array<any> = [
            {
                updateMany: {
                    filter: { WordIds: { $in: ids } },
                    update: { $pull: { WordIds: { $in: ids } } }
                }
            },
            {
                deleteMany: {
                    filter: { WordIds: { $size: 0 } }
                }
            }
        ];
        try {
            await this.Collection("Words").bulkWrite([
                {
                    deleteMany: {
                        filter: { WordId: { $in: ids } }
                    }
                },
                {
                    updateMany: {
                        filter: { "Aliases.WordId": { $in: ids } },
                        update: { $pull: { "Aliases": { "WordId": { $in: ids } } } } as any
                    }
                }
            ]);
            await this.Collection("Definitions").bulkWrite(UpdateCmds);
            await this.Collection("Editorial").bulkWrite(UpdateCmds);
            await this.Collection("Lexeme").bulkWrite(UpdateCmds);
            await this.Collection("Morpheme").bulkWrite(UpdateCmds);
        } finally {
            await this.Client.close();
        }
    }
    static async PurgeBrokenReferences() {
        await this.Client.connect();
        try {
            const ValidIds = new Set(
                (await this.Collection("Words").find({},
                    { projection: { WordId: 1, _id: 0 } })
                    .toArray()
                ).map(d => d.WordId)
            );
            const ValidIdArray = [...ValidIds];
            const UpdateCmds: Array<any> = [
                {
                    deleteMany: {
                        filter:{WordIds: { $size: 0 }}
                    }
                },
                {
                    updateMany:{
                        filter:{},
                        update:{ $pull: { WordIds: { $nin: ValidIdArray } } }
                    }
                }
            ]

            await this.Collection("Words").updateMany(
                {},
                { $pull: { "Aliases": { "WordId": { $nin: ValidIdArray } } } } as any
            );
            await this.Collection("Definitions").bulkWrite(UpdateCmds)
            await this.Collection("Editorial").bulkWrite(UpdateCmds)
            await this.Collection("Lexeme").bulkWrite(UpdateCmds)
            await this.Collection("Morpheme").bulkWrite(UpdateCmds)
        } finally {
            await this.Client.close();
        }
    }
    static async Search(q: DictionaryDBSearchQuery): Promise<Word[]> {
        await this.Client.connect();
        const lang = q.language ?? "English";
        const raw = q.word ?? "";
        const regex = new RegExp(raw, "i");

        const LexemeCaseQueries = (() => {
            const cases: Array<keyof CaseStructure<string>> = [
                "Nominative", "Genitive", "Dative",
                "Accusative", "Instrumental", "Locative", "Vocative"
            ];
            const numbers: Array<keyof CasePlurality<string>> = ["Singular", "Plural"];
            const out: Record<string, any>[] = [];
            for (const c of cases) {
                for (const n of numbers) {
                    out.push({
                        [`Cases.${c}.${n}.Name.${lang}`]: regex
                    });
                }
            }
            return out;
        })();

        const pipeline = [
            // 1. Direct match
            {
                $match: {
                    $or: [
                        { [`Word.${lang}`]: regex },
                        { [`Normalised.${lang}`]: regex },
                        {
                            Aliases: {
                            $elemMatch: {
                                [`Name.${lang}`]: regex
                            }
                            }
                        }
                    ]
                }
            },
            { $addFields: { _source: "direct" } },
            {
                $unionWith: {
                    coll: "Lexeme",
                    pipeline: [
                        { $match: { $or: LexemeCaseQueries } },
                        { $project: { WordId: "$WordIds", _source: "lexeme" } },
                        { $unwind: "$WordId" }
                    ]
                }
            },
            {
                $group: {
                    _id: "$WordId",
                    sources: { $addToSet: "$_source" }
                }
            },
            {
                $addFields: {
                    isDirect: { $in: ["direct", "$sources"] },
                    isLexeme: { $in: ["lexeme", "$sources"] }
                }
            },
            {
                $group: {
                    _id: null,
                    rows: { $push: "$$ROOT" },
                    hasDirect: { $max: "$isDirect" }
                }
            },
            {
                $project: {
                    rows: {
                        $cond: [
                            "$hasDirect",
                            {
                                $filter: {
                                    input: "$rows",
                                    as: "r",
                                    cond: { $eq: ["$$r.isDirect", true] }
                                }
                            },
                            "$rows"
                        ]
                    }
                }
            },
            { $unwind: "$rows" },
            {
                $lookup: {
                    from: "Words",
                    localField: "rows._id",
                    foreignField: "WordId",
                    as: "word"
                }
            },
            { $unwind: "$word" },
            { $replaceRoot: { newRoot: "$word" } }
        ];
        const WordDocs = await this.Collection("Words").aggregate<DictionaryDBWordsCollection>(pipeline).toArray();

        const ids = WordDocs.map(w => w.WordId);
        const [lexemes, ipa, editorial, defs] = await Promise.all([
            this.Collection("Lexeme").find({ WordIds: { $in: ids } }).toArray(),
            this.Collection("Morpheme").find({ WordIds: { $in: ids } }).toArray(),
            this.Collection("Editorial").find({ WordIds: { $in: ids } }).toArray(),
            this.Collection("Definitions").find({ WordIds: { $in: ids } }).toArray()
        ]);
        const result: Word[] = [];
        for (const wdoc of WordDocs) {
            const id = wdoc.WordId;
            const lex = lexemes.find(l => l.WordIds.includes(id));
            if (!lex) continue;
            const def = defs.find(d => d.WordIds.includes(id));
            const IpaEntry = ipa.find(i => i.WordIds.includes(id));
            const edit = editorial.find(e => e.WordIds.includes(id));
            const word:Word = Word.Create(lex.POS, {
                word: wdoc.Word,
                meaning: { English: "" }
            });
        
            word.id = id;
            word.Name = wdoc.Word;
            word.Aliases = wdoc.Aliases ?? [];

            if (IpaEntry) {
                word.IPA = IpaEntry.IPA;
                word.Morpheme = IpaEntry.Morpheme;
            }
            if (def) {
                word.Denotation = DefinitionInstance.FromJSON(def.Denotation);
                if (def.Connotation)
                    word.Connotation = DefinitionInstance.FromJSON(def.Connotation);
            }
            if (edit) {
                word.IsRecordComplete = !edit.Flags.has("Incomplete");
                word.Visible = edit.SEO.includes("Visible");
                word.Indexable = edit.SEO.includes("Indexable");
                word.IsRecordComplete = edit.Complete;
                for(const lang of Object.keys(word.Name) as Languages[]) {
                    const f = new Set<DictionaryDBModFlags>(edit.Flags[lang]);
                    word.SetWordBooleans(lang, {
                        biased:f.has("Bias"),
                        colloquialism:f.has("Colloquialism"),
                        informalusage:!f.has("FormalOnly"),
                        formalusage:!f.has("InformalOnly"),
                        profanity:f.has("Profane"),
                        derogatory:f.has("Derogatory"),
                        offensive:f.has("Offensive"),
                        archaism:f.has("Archaic"),
                        neologism:f.has("Neologism"),
                        parasitic:f.has("Parasitic"),
                        shortcut:f.has("Shortened"),
                        animate:f.has("Animate"),
                        abbreviation:f.has("Abbreviation"),
                        conjugatable:f.has("Conjugatable")
                    })
                    if (word instanceof Noun) {
                        word.IsSingular[lang] = f.has("Singular");
                        word.IsPlural[lang] = f.has("Plural");
                        word.IsSingularOnly[lang] = f.has("SingularOnly");
                        word.IsPluralOnly[lang] = f.has("PluralOnly");
                        word.IsCountable[lang] = !f.has("Uncountable");
                    }
                    if (word instanceof Verb || word instanceof Participle) {
                        word.IsTransitive[lang] = f.has("Transitive");
                        word.IsActive[lang] = f.has("Active");
                    }
                }
            }
            word.Gender = lex.Gender;
            word.PersonPerspective = lex.PersonPerspective;
            const needskind = word instanceof Adverb || word instanceof Determiner || word instanceof Conjunction
             || word instanceof Pronoun ||word instanceof Verb|| word instanceof Noun || word instanceof Propernoun;
            if(needskind) {
                if(word instanceof Adverb) word.Kind = lex.Kind as AdverbVariant || "Undetermined";
                if(word instanceof Determiner) word.Kind = lex.Kind as DeterminerVariant || "Undetermined";
                if(word instanceof Conjunction) word.Kind = lex.Kind as ConjunctionVariant || "Undetermined";
                if(word instanceof Verb) word.Kind = lex.Kind || "Undetermined";
                if(word instanceof Pronoun) word.Kind = lex.Kind as PronounVariant || "Undetermined";
                if(word instanceof Noun) word.Kind = lex.Kind || "Undetermined";
                if(word instanceof Propernoun) word.Kind = lex.Kind || "Undetermined";
            }
            result.push(word);
        }
        await this.Client.close();
        return result;
    }
}