import { MongoClient } from "mongodb";
import { Word, PartOfSpeech, Verb, Participle, Noun, Adverb, Determiner, Conjunction, Pronoun, Preposition, Propernoun, WordReference, Adjective } from "../../domain/structure.js";
import { DBModFlags, DBSEOFlags } from "./flags.js";
import { DBCollections, InsertCollectionsToDB, DBWordsCollection, DBMorphemeCollection, DBLexemeCollection, DBEditorialCollection, DBDefinitionsCollection, DBSearchQuery, DBFilters } from "./mappings.js";
import { Definition } from "../../domain/definition.js";

export class DictionaryDB {
    private static MDBClient = new MongoClient(`mongodb://${process.env.MONGODB_HOST||"localhost"}:${process.env.MONGODB_PORT||"27017"}/`);
    private static MDBDictionary = this.MDBClient.db("Dictionary");
    private static MDBWordsColl = this.MDBDictionary.collection<DBWordsCollection>("Words");
    private static MDBEditColl = this.MDBDictionary.collection<DBEditorialCollection>("Editorial");
    private static MDBDefColl = this.MDBDictionary.collection<DBDefinitionsCollection>("Definitions");
    private static MDBLexColl = this.MDBDictionary.collection<DBLexemeCollection>("Lexeme");
    private static MDBIPAColl = this.MDBDictionary.collection<DBMorphemeCollection>("IPA");

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
                Word: w.Name,
                WordId: w.UniqueId,
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
    static PackMany(...words: Word<keyof PartOfSpeech>[]):InsertCollectionsToDB {
        const WordMap = new Map<string, DBWordsCollection>();
        const IPAMap = new Map<string, DBMorphemeCollection>();
        const LexemeMap = new Map<string, DBLexemeCollection>();
        let PackedCollections = {
            Editorial: [] as DBEditorialCollection[],
            Lexeme: [] as DBLexemeCollection[],
            IPA: [] as DBMorphemeCollection[],
            Word: [] as DBWordsCollection[],
            Definition: [] as DBDefinitionsCollection[],
        };
        for (const word of words) {
            const packed = this.Pack(word);
            const wkey = JSON.stringify(packed.Word.Word);

            if (WordMap.has(wkey)) {
                const existing = WordMap.get(wkey)!;
                existing.Aliases.push({
                    Exists: true,
                    WordId: packed.Word.WordId,
                    Name: packed.Word.Word,
                    ExcludeFromWordChoice: false
                });
            } else {
                WordMap.set(wkey,{ ...packed.Word });
            }
            PackedCollections.Definition.push(packed.Definition);
            PackedCollections.Editorial.push(packed.Editorial);
            const ipaKey = JSON.stringify({
                IPA: packed.IPA.IPA,
                Morpheme: packed.IPA.Morpheme
            });
            if (IPAMap.has(ipaKey)) {
                IPAMap.get(ipaKey)!.WordIds.push(packed.Word.WordId);
            } else {
                IPAMap.set(ipaKey, { ...packed.IPA });
            }
            const LexemeKey = JSON.stringify({
                POS: packed.Lexeme.POS,
                Gender: packed.Lexeme.Gender,
                Kind: packed.Lexeme.Kind,
                Comparative: packed.Lexeme.Comparative,
                Superlative: packed.Lexeme.Superlative,
                PersonPerspective: packed.Lexeme.PersonPerspective
            });

            if (LexemeMap.has(LexemeKey)) {
                LexemeMap.get(LexemeKey)!.WordIds.push(packed.Word.WordId);
            } else {
                LexemeMap.set(LexemeKey, { ...packed.Lexeme });
            }
        }

        PackedCollections.Word = [...WordMap.values()];
        PackedCollections.IPA = [...IPAMap.values()];
        PackedCollections.Lexeme = [...LexemeMap.values()];
        return PackedCollections;
    }
    static async InsertToDB(query: InsertCollectionsToDB) {
        await this.MDBClient.connect();
        await this.MDBWordsColl.bulkWrite(
        query.Word.map(w => ({
            updateOne: {
            filter: { "Word.English": w.Word.English },
            update: {
                $setOnInsert: {
                Word: w.Word,
                WordId: w.WordId,
                Thesaurus: w.Thesaurus
                },
                $addToSet: { Aliases: { $each: w.Aliases } }
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
            const lang = q.language ?? "English";
            filters.Word = {
                [`Word.${lang}`]: q.word
            };
        }
        if (q.wordId) {
            filters.Word = {
                ...(filters.Word ?? {}),
                WordId: q.wordId
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
            filters.IPA = {
                IPA: q.ipa
            };
        }
        if (q.flags || q.seo) {
            filters.Editorial = {
                ...(q.flags && { Flags: { $in: q.flags } }),
                ...(q.seo && { SEO: { $in: q.seo } })
            };
        }
        return filters;
    }
    static async Search(q: DBSearchQuery): Promise<Word<keyof PartOfSpeech>[]> {
        await this.MDBClient.connect();
        const filters = this.BuildFilters(q);
        const words = await this.MDBWordsColl
            .find(filters.Word ?? {})
            .toArray();
        if (words.length === 0) return [];
        const ids = words.map(w => w.WordId);
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
        const result: Word<keyof PartOfSpeech>[] = [];
        for (const w of words) {
            const lex = lexemes.find(l => l.WordIds.includes(w.WordId));
            if (!lex) continue;
            const def = defs.find(d => d.WordId === w.WordId);
            const ipaEntry = ipa.find(i => i.WordIds.includes(w.WordId));
            const edit = editorial.find(e => e.WordId === w.WordId);
            const word = Word.Create(lex.POS, {
                word: w.Word.English,
                meaning: ""
            });
            word.UniqueId = w.WordId;
            word.Name = w.Word;
            word.Aliases = w.Aliases;
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
                if(word instanceof Noun) {
                    word.IsSingular = f.has("Singular");
                    word.IsPlural = f.has("Plural");
                    word.IsSingularOnly = f.has("SingularOnly");
                    word.IsPluralOnly = f.has("PluralOnly");
                    word.IsCountable = !f.has("Uncountable");
                }
                if(word instanceof Verb || word instanceof Participle){
                    word.IsTransitive = f.has("Transitive");
                    word.IsActive = f.has("Active");
                }
            }
            if(word instanceof Adjective || word instanceof Participle){
                word.Comparative = lex.Comparative||undefined;
                word.Superlative = lex.Superlative||undefined;
            }
            word.Gender = lex.Gender;
            word.PersonPerspective = lex.PersonPerspective;
            result.push(word);
        }
        await this.MDBClient.close();
        return result;
    }
}