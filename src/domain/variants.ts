export type Gender = "M"|"F"|"N"|"P"|"A"|"U";
export type GenericVariant = "Undetermined";
export type AdverbVariant = GenericVariant | "Manner"|"Place"|"Time"|"Degree"|"Frequency";
export type DeterminerVariant = GenericVariant | "Definite"|"Indefinite"|"Quantifier"|"Demonstrative"|"Distributive"|"Possessive";
export type ConjunctionVariant = GenericVariant | "Coordinating"|"Subordinating"|"Correlative"|"Conjuctive";
export type PronounVariant = GenericVariant|"Reflexive"|"Personal"|"Interrogative"|"Possessive"|"Definitive";
export type PrepositionVariant = GenericVariant|"Spatial"|"Temporal"|"Causal"|"Agentive"|"Phrasal";
export interface VariantByPartOfSpeech<GenericVariant> {
    Adjective:GenericVariant;
    Adverb:AdverbVariant;
    Noun:GenericVariant;
    Verb:GenericVariant;
    Determiner:DeterminerVariant;
    Pronoun:PronounVariant;
    Preposition:PrepositionVariant;
    Participle:GenericVariant;
    Conjunction:ConjunctionVariant;
    Propernoun:GenericVariant;
    Exclamation:GenericVariant;
    Interjection:GenericVariant;
    Unknown:GenericVariant;
}