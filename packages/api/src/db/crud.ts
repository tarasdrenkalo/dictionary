import { 
    Filter,
    MongoClient
} from "mongodb";
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
import { Definition } from "@dictionary/definition";
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
                        Romanised:w.Romanised,
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
                i => ({ IPA: i.IPA, Morpheme: i.Morpheme }),
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
        const UpdateCmds = [
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
                        update: { $pull: { Aliases: { WordId: { $in: ids } } } }
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
            const UpdateCmds = [
                {
                    updateMany:{
                        filter:{},
                        update:{ $pull: { WordIds: { $nin: ValidIdArray } } }
                    }
                },
                {
                    deleteMany: {
                        filter:{WordIds: { $size: 0 }}
                    }
                }
            ]

            await this.Collection("Words").updateMany(
                {},
                { $pull: { Aliases: { WordId: { $nin: ValidIdArray } } } }
            );
            await this.Collection("Definitions").bulkWrite(UpdateCmds)
            await this.Collection("Editorial").bulkWrite(UpdateCmds)
            await this.Collection("Lexeme").bulkWrite(UpdateCmds)
            await this.Collection("Morpheme").bulkWrite(UpdateCmds)
        } finally {
            await this.Client.close();
        }
    }
    static async Search(q: DictionaryDBSearchQuery): Promise<Word<keyof PartOfSpeech>[]> {
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
        const result: Word<keyof PartOfSpeech>[] = [];
        for (const wdoc of WordDocs) {
            const id = wdoc.WordId;
            const lex = lexemes.find(l => l.WordIds.includes(id));
            if (!lex) continue;
            const def = defs.find(d => d.WordIds.includes(id));
            const IpaEntry = ipa.find(i => i.WordIds.includes(id));
            const edit = editorial.find(e => e.WordIds.includes(id));
            const word:Word<keyof PartOfSpeech> = Word.Create(lex.POS, {
                word: wdoc.Word,
                meaning: { English: "" }
            });
        
            word.id = id;
            word.Name = wdoc.Word;
            word.Romanised = wdoc.Romanised;
            word.Aliases = wdoc.Aliases ?? [];

            if (IpaEntry) {
                word.IPA = IpaEntry.IPA;
                word.Morpheme = IpaEntry.Morpheme;
            }
            if (def) {
                word.Denotation = Definition.FromJSON(def.Denotation);
                if (def.Connotation)
                    word.Connotation = Definition.FromJSON(def.Connotation);
            }
            if (edit) {
                const f = new Set(edit.Flags);
                word.IsRecordComplete = !f.has("Incomplete");
                word.HasBias = f.has("Bias");
                word.IsColloquial = f.has("Colloquialism");
                word.IsUsedCasually = !f.has("FormalOnly");
                word.IsUsedFormally = !f.has("InformalOnly");
                word.IsProfane = f.has("Profane");
                word.IsDerogatory = f.has("Derogatory");
                word.IsOffensive = f.has("Offensive");
                word.IsArchaic = f.has("Archaic");
                word.IsNeologism = f.has("Neologism");
                word.IsParasitic = f.has("Parasitic");
                word.Visible = edit.SEO.includes("Visible");
                word.Indexable = edit.SEO.includes("Indexable");
                word.IsShortened = f.has("Shortened");
                if (word instanceof Noun) {
                    word.IsSingular = f.has("Singular");
                    word.IsPlural = f.has("Plural");
                    word.IsSingularOnly = f.has("SingularOnly");
                    word.IsPluralOnly = f.has("PluralOnly");
                    word.IsCountable = !f.has("Uncountable");
                }
                if (word instanceof Verb || word instanceof Participle) {
                    word.IsTransitive = f.has("Transitive");
                    word.IsActive = f.has("Active");
                }
            }
            if (word instanceof Adjective || word instanceof Participle) {
                word.Comparative = lex.Comparative ?? null;
                word.Superlative = lex.Superlative ?? null;
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