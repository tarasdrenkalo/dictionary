import { CasePlurality, CaseStructure } from "../domain/cases.js";
import { PartOfSpeech } from "../domain/structure.js";
import { TenseTime, TenseType } from "../domain/tense.js";
import { Thesaurus } from "../domain/thesaurus.js";
import { Gender } from "../domain/variants.js";
export interface i18n<T> {
    English:T;
    Polish?:T;
}
export const i18nPartOfSpeech: Record<keyof PartOfSpeech, i18n<string>> = {
    Adjective: { English: "Adjective", Polish: "Przymiotnik" },
    Adverb: { English: "Adverb", Polish: "Przysłówek" },
    Conjunction: { English: "Conjunction", Polish: "Spójnik" },
    Determiner: { English: "Determiner", Polish: "Określnik" },
    Exclamation: { English: "Exclamation", Polish: "Wykrzyknik" },
    Interjection: { English: "Interjection", Polish: "Wykrzyknienie" },
    Noun: { English: "Noun", Polish: "Rzeczownik" },
    Numeral: { English: "Numeral", Polish: "Liczebnik" },
    Participle: { English: "Participle", Polish: "Imiesłów" },
    Preposition: { English: "Preposition", Polish: "Przyimek" },
    Pronoun: { English: "Pronoun", Polish: "Zaimek" },
    Propernoun: { English: "Propernoun", Polish: "Nazwa Własna" },
    Verb: { English: "Verb", Polish: "Czasownik" },
    Unknown: { English: "Unknown", Polish: "Nieznane" }
}
export const i18nCasePlurality: Record<keyof CasePlurality, i18n<string>> = { 
    Singular: { English: "Singular", Polish: "Liczba Pojedyncza" },
    Plural: { English: "Plural", Polish: "Liczba Mnoga" },
}

export const i18nCaseStructure: Record<keyof CaseStructure, i18n<string>> = {
    Nominative: { English: "Nominative", Polish: "Mianownik" },
    Genitive: { English: "Genitive", Polish: "Dopełniacz" },
    Dative: { English: "Dative", Polish: "Celownik" },
    Accusative: { English: "Accusative", Polish: "Biernik" },
    Ablative: { English: "Ablative", Polish: "Ablatyw" },
    Local: { English: "Local", Polish: "Miejscownik" },
    Vocative: { English: "Vocative", Polish: "Wołacz" },
}

export const i18nThesaurus: Record<keyof Thesaurus, i18n<string>> = {
    Synonyms: { English: "Synonyms", Polish: "Synonimy" },
    Antonyms: { English: "Antonyms", Polish: "Antonimy" },
    Omonyms: { English: "Omonyms", Polish: "Homonimy" },
    Paronyms: { English: "Paronyms", Polish: "Paronimy" },
    Alternatives: { English: "Alternatives", Polish: "Alternatywy" }
}
export const i18nTenseTime: Record<TenseTime, i18n<string>> = {
    Present: { English: "Present", Polish: "Czas teraźniejszy" },
    Past: { English: "Past", Polish: "Czas przeszły" },
    Future: { English: "Future", Polish: "Czas przyszły" },
}
export const i18nTenseType: Record<TenseType, i18n<string>> = {
    "Present Simple": { English: "Present Simple", Polish: "Czas teraźniejszy prosty" },
    "Present Progressive": { English: "Present Progressive", Polish: "Czas teraźniejszy ciągły" },
    "Present Participle": { English: "Present Participle", Polish: "Imiesłów czasu teraźniejszego" },
    "Present Perfect": { English: "Present Perfect", Polish: "Czas teraźniejszy dokonany" },
    "Past Simple": { English: "Past Simple", Polish: "Czas przeszły prosty" },
    "Past Progressive": { English: "Past Progressive", Polish: "Czas przeszły ciągły" },
    "Past Participle": { English: "Past Participle", Polish: "Imiesłów czasu przeszłego" },
    "Past Perfect": { English: "Past Perfect", Polish: "Czas zaprzeszły" },
    "Future Simple": { English: "Future Simple", Polish: "Czas przyszły prosty" },
    "Future Progressive": { English: "Future Progressive", Polish: "Czas przyszły ciągły" },
    "Future Participle": { English: "Future Participle", Polish: "Imiesłów czasu przyszłego" },
    "Future Perfect": { English: "Future Perfect", Polish: "Czas przyszły dokonany" },
}
export const i18nGender: Record<Gender, i18n<string>> = {
    M: {English:"M", Polish:"M"},
    F: {English:"F", Polish:"F"},
    N: {English:"N", Polish:"N"},
    P: {English:"P", Polish:"P"},
    A: {English:"A", Polish:"A"},
    U: {English:"U", Polish:"U"},
}
