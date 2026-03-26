import { Filter, MongoClient } from "mongodb";
import { Word, PartOfSpeech, Verb, Participle, Noun, Adverb, Determiner, Conjunction, Pronoun, Preposition, Propernoun, Adjective } from "../../domain/structure.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
import { DBWordsCollection, DBEditorialCollection, DBDefinitionsCollection, DBLexemeCollection, DBMorphemeCollection, DBCollections, InsertCollectionsToDB, DBFilters, DBSearchQuery } from "./mappings.js";
import { Definition } from "../../domain/definition.js";

export class DictionaryDB {
    private static MDBClient = new MongoClient(
        `mongodb://${process.env.MONGODB_HOST || "localhost"}:${process.env.MONGODB_PORT || "27017"}/`
    );
    private static MDBDictionary = DictionaryDB.MDBClient.db("Dictionary");
    private static MDBWordsColl = this.MDBDictionary.collection<DBWordsCollection>("Words");
    private static MDBEditColl = this.MDBDictionary.collection<DBEditorialCollection>("Editorial");
    private static MDBDefColl = this.MDBDictionary.collection<DBDefinitionsCollection>("Definitions");
    private static MDBLexColl = this.MDBDictionary.collection<DBLexemeCollection>("Lexeme");
    private static MDBIPAColl = this.MDBDictionary.collection<DBMorphemeCollection>("Morpheme");

    constructor(private client: MongoClient) {}
    private get db() { return this.client.db("Dictionary"); }
    private get Words() { return this.db.collection<DBWordsCollection>("Words"); }
    private get Editorial() { return this.db.collection<DBEditorialCollection>("Editorial"); }
    private get Definitions() { return this.db.collection<DBDefinitionsCollection>("Definitions"); }
    private get Lexemes() { return this.db.collection<DBLexemeCollection>("Lexeme"); }
    private get Morphemes() { return this.db.collection<DBMorphemeCollection>("Morpheme"); }

    private static BuildFlags(w: Word<keyof PartOfSpeech>): Set<DBModFlags> {
        const f = new Set<DBModFlags>();
        const rules: Array<[keyof Word<keyof PartOfSpeech>, DBModFlags, boolean]> = [
            ["HasBias", "Bias", true],
            ["IsColloquial","Colloquialism",true],
            ["IsUsedFormally","InformalOnly",false],
            ["IsUsedCasually","FormalOnly",false],
            ["IsProfane","Profane",true],
            ["IsDerogatory","Derogatory",true],
            ["IsOffensive","Offensive",true],
            ["IsArchaic","Archaic",true],
            ["IsNeologism","Neologism",true],
            ["IsParasitic","Parasitic",true],
            ["IsRecordComplete","Incomplete",false]
        ];
        if (w.POS === "Unknown") f.add("UnknownPartOfSpeech").add("Incomplete");
        for (const [prop, flag, positive] of rules) {
            if (!!w[prop] === positive) f.add(flag);
        }
        if (w instanceof Verb || w instanceof Participle) {
            if (w.IsTransitive) f.add("Transitive");
            if (w.IsActive) f.add("Active");
        }
        if (w instanceof Noun) {
            if (w.IsSingular) f.add("Singular");
            if (w.IsPlural) f.add("Plural");
            if (w.IsSingularOnly) f.add("SingularOnly");
            if (w.IsPluralOnly) f.add("PluralOnly");
            if (!w.IsCountable) f.add("Uncountable");
        }
        return f;
    }

    private static BuildSEO(w: Word<keyof PartOfSpeech>): Set<DBSEOFlags> {
        const s = new Set<DBSEOFlags>();
        if (w.Visible) s.add("Visible");
        if (w.Indexable) s.add("Indexable");
        if (w.Visible && w.Indexable) s.add("SEOIndexable");
        return s;
    }

    private static buildLexeme(w: Word<keyof PartOfSpeech>): DBLexemeCollection {
        const NeedKind =
            w instanceof Adverb || w instanceof Determiner ||
            w instanceof Conjunction || w instanceof Pronoun ||
            w instanceof Preposition || w instanceof Propernoun;

        const NeedCases =
            w instanceof Adjective || w instanceof Noun ||
            w instanceof Pronoun || w instanceof Propernoun || w instanceof Propernoun;
        return {
            WordIds: [w.UniqueId],
            POS: w.POS,
            Gender: w.Gender,
            PersonPerspective: w.PersonPerspective,
            Cases: NeedCases ? w.Cases : undefined,
            Kind: NeedKind ? w.Kind : undefined,
            Comparative: (w instanceof Adjective || w instanceof Participle)
                ? w.Comparative ?? { English: Adjective.CS(w.Name.English, true) }
                : undefined,
            Superlative: (w instanceof Adjective || w instanceof Participle)
                ? w.Superlative ?? { English: Adjective.CS(w.Name.English, false) }
                : undefined
        };
    }

    private static LexemeFingerprint(l: DBLexemeCollection) {
        return JSON.stringify({
            POS: l.POS ?? null,
            Gender: l.Gender ?? null,
            Kind: l.Kind ?? null,
            Cases: l.Cases ?? null,
            Comparative: l.Comparative ?? null,
            Superlative: l.Superlative ?? null,
            PersonPerspective: l.PersonPerspective ?? null
        });
    }

    private static DefinitionFingerprint(d: DBDefinitionsCollection) {
        return JSON.stringify({
            Denotation: d.Denotation,
            Connotation: d.Connotation ?? null
        });
    }

    private static EditorialFingerprint(e: DBEditorialCollection) {
        return JSON.stringify({
            Flags: e.Flags ?? [],
            SEO: e.SEO ?? []
        });
    }

    static PackOne(w: Word<keyof PartOfSpeech>): DBCollections {
        const flags = this.BuildFlags(w);
        const seo = this.BuildSEO(w);
        const wordIds = Array.from(new Set([w.UniqueId, ...w.Aliases.map(a => a.WordId)]));

        return {
            Word: {
                WordId: w.UniqueId,
                Word: w.Name,
                Aliases: w.Aliases
            },
            Definition: {
                WordIds: wordIds,
                Denotation: w.Denotation.ToJSON(),
                Connotation: w.Connotation?.ToJSON()
            },
            IPA: {
                WordIds: [w.UniqueId],
                IPA: w.IPA,
                Morpheme: w.Morpheme
            },
            Lexeme: this.buildLexeme(w),
            Editorial: {
                WordIds: wordIds,
                Flags: [...flags],
                SEO: [...seo]
            }
        };
    }

    static Pack(...words: Word<keyof PartOfSpeech>[]): InsertCollectionsToDB {
        const IpaMap = new Map<string, DBMorphemeCollection>();
        const LexMap = new Map<string, DBLexemeCollection>();
        const DefMap = new Map<string, DBDefinitionsCollection>();
        const EditMap = new Map<string, DBEditorialCollection>();

        const out: InsertCollectionsToDB = {
            Word: [],
            Definition: [],
            Editorial: [],
            IPA: [],
            Lexeme: []
        };

        for (const w of words) {
            const p = this.PackOne(w);
            out.Word.push(p.Word);

            // IPA merge
            const ipaKey = JSON.stringify({
                IPA: p.IPA.IPA ?? null,
                Morpheme: p.IPA.Morpheme ?? null
            });
            const ipaExisting = IpaMap.get(ipaKey);
            if (ipaExisting) {
                ipaExisting.WordIds.push(...p.IPA.WordIds);
            } else {
                IpaMap.set(ipaKey, { ...p.IPA });
            }

            // Lexeme merge
            const lexKey = this.LexemeFingerprint(p.Lexeme);
            const lexExisting = LexMap.get(lexKey);
            if (lexExisting) {
                lexExisting.WordIds.push(...p.Lexeme.WordIds);
            } else {
                LexMap.set(lexKey, { ...p.Lexeme });
            }

            // Definition merge (grouped by denotation+connotation)
            const defKey = this.DefinitionFingerprint(p.Definition);
            const defExisting = DefMap.get(defKey);
            if (defExisting) {
                defExisting.WordIds.push(...p.Definition.WordIds);
            } else {
                DefMap.set(defKey, { ...p.Definition });
            }

            // Editorial merge (grouped by flags+SEO)
            const editKey = this.EditorialFingerprint(p.Editorial);
            const editExisting = EditMap.get(editKey);
            if (editExisting) {
                editExisting.WordIds.push(...p.Editorial.WordIds);
            } else {
                EditMap.set(editKey, { ...p.Editorial });
            }
        }
        out.IPA = [...IpaMap.values()].map(i => ({
            ...i,
            WordIds: [...new Set(i.WordIds)]
        }));
        out.Lexeme = [...LexMap.values()].map(l => ({
            ...l,
            WordIds: [...new Set(l.WordIds)]
        }));
        out.Definition = [...DefMap.values()].map(d => ({
            ...d,
            WordIds: [...new Set(d.WordIds)]
        }));
        out.Editorial = [...EditMap.values()].map(e => ({
            ...e,
            WordIds: [...new Set(e.WordIds)]
        }));

        return out;
    }
    private static BuildUpserts<T>(
        items: T[],
        filter: (i: T) => any,
        update: (i: T) => any
    ) {
        return items.map(i => ({
            updateOne: { filter: filter(i), update: update(i), upsert: true }
        }));
    }

    static async InsertToDB(data: InsertCollectionsToDB) {
        await DictionaryDB.MDBClient.connect();
        await DictionaryDB.MDBWordsColl.bulkWrite(
            DictionaryDB.BuildUpserts(
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
        await DictionaryDB.MDBDefColl.bulkWrite(
            DictionaryDB.BuildUpserts(
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
        await DictionaryDB.MDBEditColl.bulkWrite(
            DictionaryDB.BuildUpserts(
                data.Editorial,
                e => ({
                    Flags: e.Flags,
                    SEO: e.SEO
                }),
                e => ({
                    $addToSet: { WordIds: { $each: e.WordIds } }
                })
            )
        );
        await DictionaryDB.MDBIPAColl.bulkWrite(
            DictionaryDB.BuildUpserts(
                data.IPA,
                i => ({ IPA: i.IPA, Morpheme: i.Morpheme }),
                i => ({ $addToSet: { WordIds: { $each: i.WordIds } } })
            )
        );
        await DictionaryDB.MDBLexColl.bulkWrite(
            DictionaryDB.BuildUpserts(
                data.Lexeme,
                l => ({
                    POS: l.POS,
                    Gender: l.Gender,
                    Kind: l.Kind,
                    Cases: l.Cases,
                    Comparative: l.Comparative,
                    Superlative: l.Superlative,
                    PersonPerspective: l.PersonPerspective
                }),
                l => ({ $addToSet: { WordIds: { $each: l.WordIds } } })
            )
        );
        await DictionaryDB.MDBClient.close();
    }
    static async DeleteById(...ids: string[]) {
        if (ids.length === 0) return;
        await DictionaryDB.MDBClient.connect();
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
            await DictionaryDB.MDBWordsColl.bulkWrite([
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
            await DictionaryDB.MDBDefColl.bulkWrite(UpdateCmds);
            await DictionaryDB.MDBEditColl.bulkWrite(UpdateCmds);
            await DictionaryDB.MDBLexColl.bulkWrite(UpdateCmds);
            await DictionaryDB.MDBIPAColl.bulkWrite(UpdateCmds);
        } finally {
            await DictionaryDB.MDBClient.close();
        }
    }
    static async PurgeBrokenReferences() {
        await DictionaryDB.MDBClient.connect();
        try {
            const ValidIds = new Set(
                (await DictionaryDB.MDBWordsColl
                    .find({}, { projection: { WordId: 1, _id: 0 } })
                    .toArray()
                ).map(d => d.WordId)
            );
            const ValidIdArray = [...ValidIds];
            await DictionaryDB.MDBWordsColl.updateMany(
                {},
                { $pull: { Aliases: { WordId: { $nin: ValidIdArray } } } }
            );
            await DictionaryDB.MDBDefColl.updateMany(
                {},
                { $pull: { WordIds: { $nin: ValidIdArray } } }
            );
            await DictionaryDB.MDBDefColl.deleteMany({
                WordIds: { $size: 0 }
            });
            await DictionaryDB.MDBEditColl.updateMany(
                {},
                { $pull: { WordIds: { $nin: ValidIdArray } } }
            );
            await DictionaryDB.MDBEditColl.deleteMany({
                WordIds: { $size: 0 }
            });
            await DictionaryDB.MDBLexColl.updateMany(
                {},
                { $pull: { WordIds: { $nin: ValidIdArray } } }
            );
            await DictionaryDB.MDBLexColl.deleteMany({
                WordIds: { $size: 0 }
            });
            await DictionaryDB.MDBIPAColl.updateMany(
                {},
                { $pull: { WordIds: { $nin: ValidIdArray } } }
            );
            await DictionaryDB.MDBIPAColl.deleteMany({
                WordIds: { $size: 0 }
            });
        } finally {
            await DictionaryDB.MDBClient.close();
        }
    }
    static BuildFilters(q: DBSearchQuery): DBFilters {
    const f: DBFilters = {};
    if (q.word) {
        const lang = q.language ?? "English";
        f.Word = { [`Word.${lang}`]: q.word } as Filter<DBWordsCollection>;
    }
    if (q.wordid) {
        f.Word = { ...(f.Word ?? {}), WordId: q.wordid };
    }
    if (q.pos || q.gender || q.kind) {
        f.Lexeme = {
            ...(q.pos && { POS: q.pos }),
            ...(q.gender && { Gender: q.gender }),
            ...(q.kind && { Kind: q.kind })
        };
    }
    if (q.ipa) {
        f.IPA = { IPA: q.ipa };
    }
    if (q.flags || q.seo) {
        f.Editorial = {
            ...(q.flags && { Flags: { $in: q.flags } }),
            ...(q.seo && { SEO: { $in: q.seo } })
        };
    }
    return f;
    }
    private static DefaultClient() {
        return new MongoClient(
            `mongodb://${process.env.MONGODB_HOST || "localhost"}:${process.env.MONGODB_PORT || "27017"}/`
        );
    }
    static async Search(
        q: DBSearchQuery,
        IncludeParents: boolean = false
    ): Promise<Word<keyof PartOfSpeech>[]> {
        const db = new DictionaryDB(this.DefaultClient());
        await db.client.connect();
        const filters = DictionaryDB.BuildFilters(q);
        const RootWords = await db.Words
            .find(filters.Word ?? {})
            .toArray();
        if (RootWords.length === 0) {
            await db.client.close();
            return [];
        }
        const IdSet = new Set<string>();
        for (const w of RootWords) IdSet.add(w.WordId);
        if (IncludeParents) {
            const RootIds = RootWords.map(w => w.WordId);
            const parents = await db.Words.find({
                "Aliases.WordId": { $in: RootIds }
            }).toArray();
            for (const p of parents) IdSet.add(p.WordId);
        }
        const ids = [...IdSet];
        const [WordDocs, lexemes, ipa, editorial, defs] = await Promise.all([
            db.Words.find({ WordId: { $in: ids } }).toArray(),
            db.Lexemes.find({ WordIds: { $in: ids }, ...(filters.Lexeme ?? {}) }).toArray(),
            db.Morphemes.find({ WordIds: { $in: ids }, ...(filters.IPA ?? {}) }).toArray(),
            db.Editorial.find({ WordIds: { $in: ids }, ...(filters.Editorial ?? {}) }).toArray(),
            db.Definitions.find({ WordIds: { $in: ids } }).toArray()
        ]);
        const result: Word<keyof PartOfSpeech>[] = [];
        for (const wdoc of WordDocs) {
            const id = wdoc.WordId;
            const lex = lexemes.find(l => l.WordIds.includes(id));
            if (!lex) continue;
            const def = defs.find(d => d.WordIds.includes(id));
            const IpaEntry = ipa.find(i => i.WordIds.includes(id));
            const edit = editorial.find(e => e.WordIds.includes(id));
            const word = Word.Create(lex.POS, {
                word: wdoc.Word.English,
                meaning: ""
            });
            word.UniqueId = id;
            word.Name = wdoc.Word;
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
                word.Comparative = lex.Comparative ?? undefined;
                word.Superlative = lex.Superlative ?? undefined;
            }
            word.Gender = lex.Gender;
            word.PersonPerspective = lex.PersonPerspective;
            result.push(word);
        }
        await db.client.close();
        return result;
    }
}