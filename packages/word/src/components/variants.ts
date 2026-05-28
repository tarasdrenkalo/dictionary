export type GenericVariant = "Undetermined";
export type InterjectionVariant = GenericVariant|"Volitive"|"Emotive"|"Cognitive";

export type AdverbVariant = GenericVariant | "Manner"|"Place"|"Time"|"Degree"|"Frequency";
export type DeterminerVariant = GenericVariant | "Definite"|"Indefinite"|"Quantifier"|"Demonstrative"|"Distributive"|"Possessive";
export type ConjunctionVariant = GenericVariant | "Coordinating"|"Subordinating"|"Correlative"|"Conjuctive";
export type PronounVariant = GenericVariant|"Reflexive"|"Personal"|"Interrogative"|"Possessive"|"Definitive";
export type PrepositionVariant = GenericVariant|"Spatial"|"Temporal"|"Causal"|"Agentive"|"Phrasal";
export type NumeralVariant = GenericVariant|"Numeric"|"Ordinal";
export interface VariantByPartOfSpeech {
    Adjective:GenericVariant;
    Adverb:AdverbVariant;
    Noun:GenericVariant;
    Numeral:NumeralVariant;
    Verb:GenericVariant;
    Determiner:DeterminerVariant;
    Pronoun:PronounVariant;
    Preposition:PrepositionVariant;
    Participle:GenericVariant;
    Conjunction:ConjunctionVariant;
    Propernoun:GenericVariant;
    Exclamation:GenericVariant;
    Interjection:InterjectionVariant;
    Unknown:GenericVariant;
}