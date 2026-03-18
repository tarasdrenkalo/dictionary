import { MongoClient } from "mongodb";
import { Word, PartOfSpeech, Verb, Participle, Noun, Adverb, Determiner, Conjunction, Pronoun, Preposition, Propernoun, WordReference, Adjective } from "../../domain/structure.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
import { DBCollections, InsertCollectionsToDB, DBWordsCollection, DBMorphemeCollection, DBLexemeCollection, DBEditorialCollection, DBDefinitionsCollection, DBSearchQuery, DBFilters } from "./mappings.js";
import { Definition } from "../../domain/definition.js";

export class DictionaryDB {
    public static MDBClient = new MongoClient(`mongodb://${process.env.MONGODB_HOST||"localhost"}:${process.env.MONGODB_PORT||"27017"}/`);
    private static MDBDictionary = this.MDBClient.db("Dictionary");
    private static MDBWordsColl = this.MDBDictionary.collection<DBWordsCollection>("Words");
    private static MDBEditColl = this.MDBDictionary.collection<DBEditorialCollection>("Editorial");
    private static MDBDefColl = this.MDBDictionary.collection<DBDefinitionsCollection>("Definitions");
    private static MDBLexColl = this.MDBDictionary.collection<DBLexemeCollection>("Lexeme");
    private static MDBIPAColl = this.MDBDictionary.collection<DBMorphemeCollection>("Morpheme");

    static Pack(w: Word<keyof PartOfSpeech>): DBCollections {
        const flags:Set<DBModFlags> = new Set();
        const seo:Set<DBSEOFlags> = new Set();
        if(w.POS === "Unknown") flags.add("UnknownPartOfSpeech").add("Incomplete");
        if (w.HasBias) flags.add("Bias");
        if (w.IsColloquial) flags.add("Colloquialism");
        if (!w.IsUsedFormally) flags.add("InformalOnly");
        if (!w.IsUsedCasually) flags.add("FormalOnly");
        if (w.IsProfane) flags.add("Profane");
        if (w.IsDerogatory) flags.add("Derogatory");
        if (w.IsOffensive) flags.add("Offensive");
        if (w.IsArchaic) flags.add("Archaic");
        if (w.IsNeologism) flags.add("Neologism");
        if (w.IsParasitic) flags.add("Parasitic");
        if (!w.IsRecordComplete) flags.add("Incomplete");
        if (w.Category === "Uncategorised") flags.add("Uncategorised");
        if (w.Visible) seo.add("Visible");
        if (w.Indexable) seo.add("Indexable");
        if (w.Visible && w.Indexable) seo.add("SEOIndexable");

        if(w instanceof Verb || w instanceof Participle) {
            if(w.IsTransitive) flags.add("Transitive");
            if(w.IsActive) flags.add("Active");
        }
        if(w instanceof Noun){
            if(w.IsSingular) flags.add("Singular")
            if(w.IsPlural) flags.add("Plural");
            if(w.IsSingularOnly) flags.add("SingularOnly");
            if(w.IsPluralOnly) flags.add("PluralOnly");
            if(!w.IsCountable) flags.add("Uncountable");
        }

        const needskind = w instanceof Adverb || w instanceof Determiner ||
        w instanceof Conjunction || w instanceof Pronoun || w instanceof Preposition || w instanceof Propernoun;
        const needscases = (w.POS === "Adjective" || w.POS === "Noun" || w.POS === "Pronoun" || w.POS === "Participle");
        let selfreference:WordReference = {
            Exists:true,
            WordId:w.UniqueId,
            Name:w.Name,
            ExcludeFromWordChoice:w.ExcludeFromWordChoice
        };
        let ReturnCollections:DBCollections = {
            Word: {
                WordId:w.UniqueId,
                Word: w.Name,
                Aliases: [selfreference],
            },
            Definition: {
                WordId: w.UniqueId,
                Denotation: w.Denotation.ToJSON(),
                Connotation:w.Connotation?.ToJSON()
            },
            IPA: {
                WordIds: [w.UniqueId],
                IPA: w.IPA,
                Morpheme: w.Morpheme
            },
            Lexeme: {
                WordIds: [w.UniqueId],
                POS: w.POS,
                Gender: w.Gender,
                Cases:needscases?w.Cases:undefined,
                PersonPerspective: w.PersonPerspective,
                Comparative: (w instanceof Adjective || w instanceof Participle) ? w.Comparative ||{English:Adjective.CS(w.Name.English, true)} : undefined,
                Superlative: (w instanceof Adjective || w instanceof Participle) ? w.Superlative ||{English:Adjective.CS(w.Name.English, false)} : undefined,
                Kind:needskind ? w.Kind: undefined,
            },
            Editorial: {
                WordId: w.UniqueId,
                Flags: [...flags],
                SEO: [...seo]
            }
        }
        return ReturnCollections;
    }
    static PackMany(...words: Word<keyof PartOfSpeech>[]): InsertCollectionsToDB {
        const IPAMap = new Map<string, DBMorphemeCollection>();
        const LexemeMap = new Map<string, DBLexemeCollection>();
        const PackedCollections: InsertCollectionsToDB = {
            Editorial: [],
            Lexeme: [],
            IPA: [],
            Word: [],
            Definition: [],
        };
        for (const word of words) {
            const packed = this.Pack(word);
            PackedCollections.Word.push(packed.Word);
            PackedCollections.Definition.push(packed.Definition);
            PackedCollections.Editorial.push(packed.Editorial);
            const IpaKey = JSON.stringify({
                IPA: packed.IPA.IPA,
                Morpheme: packed.IPA.Morpheme
            });
            if (IPAMap.has(IpaKey)) {
                IPAMap.get(IpaKey)!.WordIds.push(word.UniqueId);
            } else {
                IPAMap.set(IpaKey, { ...packed.IPA });
            }
            const LexemeKey = JSON.stringify({
                POS: packed.Lexeme.POS,
                Gender: packed.Lexeme.Gender,
                Kind: packed.Lexeme.Kind,
                Cases: packed.Lexeme.Cases,
                Comparative: packed.Lexeme.Comparative,
                Superlative: packed.Lexeme.Superlative,
                PersonPerspective: packed.Lexeme.PersonPerspective
            });
            if (LexemeMap.has(LexemeKey)) {
                LexemeMap.get(LexemeKey)!.WordIds.push(word.UniqueId);
            } else {
                LexemeMap.set(LexemeKey, { ...packed.Lexeme });
            }
        }

        PackedCollections.IPA = [...IPAMap.values()];
        PackedCollections.Lexeme = [...LexemeMap.values()];

        return PackedCollections;
    }
    static async InsertToDB(query: InsertCollectionsToDB) {
        await this.MDBClient.connect();
        await this.MDBWordsColl.bulkWrite(
            query.Word.map(w => ({
                updateOne: {
                    filter: { WordId: w.WordId },
                    update: {
                        $setOnInsert: {
                            WordId: w.WordId,
                            Word: w.Word,
                            Thesaurus: w.Thesaurus
                        },
                        $addToSet: { Aliases: { $each: w.Aliases ?? [] } }
                    },
                    upsert: true
                }
            }))
        );
        await this.MDBDefColl.insertMany(query.Definition);
        await this.MDBEditColl.insertMany(query.Editorial);
        await this.MDBIPAColl.bulkWrite(
            query.IPA.map(i => ({
                updateOne: {
                    filter: {
                        IPA: i.IPA,
                        Morpheme: i.Morpheme
                    },
                    update: {
                        $addToSet: { WordIds: { $each: i.WordIds } }
                    },
                    upsert: true
                }
            }))
        );
        await this.MDBLexColl.bulkWrite(
            query.Lexeme.map(l => ({
                updateOne: {
                    filter: {
                        POS: l.POS,
                        Gender: l.Gender,
                        Kind: l.Kind,
                        Cases: l.Cases,
                        Comparative: l.Comparative,
                        Superlative: l.Superlative,
                        PersonPerspective: l.PersonPerspective
                    },
                    update: {
                        $addToSet: { WordIds: { $each: l.WordIds } }
                    },
                    upsert: true
                }
            }))
        );

        await this.MDBClient.close();
    }
    static BuildFilters(q: DBSearchQuery): DBFilters {
        const filters: DBFilters = {};
        if (q.word) {
            const lang = q.language ??"English";
            filters.Word = {
                [`Word.${lang}`]: q.word
            };
        }
        if (q.wordid) {
            filters.Word = {
                ...(filters.Word ?? {}),
                WordId: q.wordid
            };
        }
        if (q.pos || q.gender || q.kind) {
            filters.Lexeme = {
                ...(q.pos && { POS: q.pos }),
                ...(q.gender && { Gender: q.gender }),
                ...(q.kind && { Kind: q.kind })
            };
        }
        if (q.ipa) {
            filters.IPA = { IPA: q.ipa };
        }
        if (q.flags || q.seo) {
            filters.Editorial = {
                ...(q.flags && { Flags: { $in: q.flags } }),
                ...(q.seo && { SEO: { $in: q.seo } })
            };
        }
        return filters;
    }
    static async Search(
        q: DBSearchQuery,
        IncludeParents: boolean = false
    ): Promise<Word<keyof PartOfSpeech>[]> {
        await this.MDBClient.connect();
        const filters = this.BuildFilters(q);
        const RootWords = await this.MDBWordsColl
            .find(filters.Word ?? {})
            .toArray();
        if (RootWords.length === 0) {
            await this.MDBClient.close();
            return [];
        }
        const IdSet = new Set<string>();
        // Always include matched words
        for (const w of RootWords) {
            IdSet.add(w.WordId);
        }
        // 2️⃣ Optionally include parents
        if (IncludeParents) {
            const RootIds = RootWords.map(w => w.WordId);
            const parents = await this.MDBWordsColl.find({
                "Aliases.WordId": { $in: RootIds }
            }).toArray();
            for (const p of parents) {
                IdSet.add(p.WordId);
            }
        }
        const ids = [...IdSet];
        const WordDocs = await this.MDBWordsColl.find({
            WordId: { $in: ids }
        }).toArray();

        // 4️⃣ Load related collections
        const lexemes = await this.MDBLexColl.find({
            WordIds: { $in: ids },
            ...(filters.Lexeme ?? {})
        }).toArray();

        const ipa = await this.MDBIPAColl.find({
            WordIds: { $in: ids },
            ...(filters.IPA ?? {})
        }).toArray();

        const editorial = await this.MDBEditColl.find({
            WordId: { $in: ids },
            ...(filters.Editorial ?? {})
        }).toArray();

        const defs = await this.MDBDefColl.find({
            WordId: { $in: ids }
        }).toArray();

        // 5️⃣ Build domain objects
        const result: Word<keyof PartOfSpeech>[] = [];

        for (const wdoc of WordDocs) {
            const id = wdoc.WordId;

            const lex = lexemes.find(l => l.WordIds.includes(id));
            if (!lex) continue;

            const def = defs.find(d => d.WordId === id);
            const ipaEntry = ipa.find(i => i.WordIds.includes(id));
            const edit = editorial.find(e => e.WordId === id);

            const word = Word.Create(lex.POS, {
                word: wdoc.Word.English,
                meaning: ""
            });

            word.UniqueId = id;
            word.Name = wdoc.Word;
            word.Aliases = wdoc.Aliases ?? [];

            if (ipaEntry) {
                word.IPA = ipaEntry.IPA;
                word.Morpheme = ipaEntry.Morpheme;
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
        await this.MDBClient.close();
        return result;
    }
    static async DeleteById(id: string) {
    await this.MDBClient.connect();
        try {
            await this.MDBWordsColl.deleteOne({ WordId: id });
            await this.MDBWordsColl.updateMany(
                { "Aliases.WordId": id },
                { $pull: { Aliases: { WordId: id } } }
            );
            await this.MDBDefColl.deleteOne({ WordId: id });
            await this.MDBEditColl.deleteOne({ WordId: id });
            await this.MDBLexColl.updateMany(
                { WordIds: id },
                { $pull: { WordIds: id } }
            );
            await this.MDBIPAColl.updateMany(
                { WordIds: id },
                { $pull: { WordIds: id } }
            );
            await this.MDBLexColl.deleteMany({ WordIds: { $size: 0 } });
            await this.MDBIPAColl.deleteMany({ WordIds: { $size: 0 } });
        } finally {
            await this.MDBClient.close();
        }
    }

    static async DeleteManyById(ids: string[]) {
        await this.MDBClient.connect();
        try {
            await this.MDBWordsColl.deleteMany({ WordId: { $in: ids } });
            await this.MDBWordsColl.updateMany(
                { "Aliases.WordId": { $in: ids } },
                { $pull: { Aliases: { WordId: { $in: ids } } } }
            );
            await this.MDBDefColl.deleteMany({ WordId: { $in: ids } });
            await this.MDBEditColl.deleteMany({ WordId: { $in: ids } });
            await this.MDBLexColl.updateMany(
                { WordIds: { $in: ids } },
                { $pull: { WordIds: { $in: ids } } }
            );
            await this.MDBIPAColl.updateMany(
                { WordIds: { $in: ids } },
                { $pull: { WordIds: { $in: ids } } }
            );
            await this.MDBLexColl.deleteMany({ WordIds: { $size: 0 } });
            await this.MDBIPAColl.deleteMany({ WordIds: { $size: 0 } });
        } finally {
            await this.MDBClient.close();
        }
    }
    static async PurgeBrokenReferences() {
        await this.MDBClient.connect();
        try {
            const words = await this.MDBWordsColl
                .find({}, { projection: { WordId: 1 } })
                .toArray();
            const ValidIds = new Set(words.map(w => w.WordId));
            const valid = [...ValidIds];
            const lexemes = await this.MDBLexColl.find().toArray();
            for (const l of lexemes) {
                const filtered = (l.WordIds ?? []).filter(id => ValidIds.has(id));
                if (filtered.length === 0) {
                    await this.MDBLexColl.deleteOne({ _id: l._id });
                } else if (filtered.length !== l.WordIds.length) {
                    await this.MDBLexColl.updateOne(
                        { _id: l._id },
                        { $set: { WordIds: filtered } }
                    );
                }
            }
            const ipa = await this.MDBIPAColl.find().toArray();
            for (const i of ipa) {
                const filtered = (i.WordIds ?? []).filter(id => ValidIds.has(id));
                if (filtered.length === 0) {
                    await this.MDBIPAColl.deleteOne({ _id: i._id });
                } else if (filtered.length !== i.WordIds.length) {
                    await this.MDBIPAColl.updateOne(
                        { _id: i._id },
                        { $set: { WordIds: filtered } }
                    );
                }
            }
            await this.MDBDefColl.deleteMany({ WordId: { $nin: valid } });
            await this.MDBEditColl.deleteMany({ WordId: { $nin: valid } });
            await this.MDBWordsColl.updateMany(
                {},
                { $pull: { Aliases: { WordId: { $nin: valid } } } }
            );
        } finally {
            await this.MDBClient.close();
        }
    }
}