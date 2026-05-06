export type TenseTime = "Present" | "Past" | "Future";
export type PolishSingular<P extends TenseTime, O> = P extends "Past" ? { M: O; F: O; N?: O }: O;
export interface EnglishTenseBlock<O> {
    1: { Singular: O; Plural: O };
    2: { Singular: O; Plural: O };
    3: { Singular: O; Plural: O };
}
export interface PolishTenseBlock<P extends TenseTime, O> {
    1: { Singular: PolishSingular<P, O>; Plural: O };
    2: { Singular: PolishSingular<P, O>; Plural: O };
    3: { Singular: PolishSingular<P, O>; Plural: O };
}
export interface TenseStructure<P extends TenseTime, O> {
    English: EnglishTenseBlock<O>;
    Polish: PolishTenseBlock<P, O>;
}
export interface TenseTimed<P extends TenseTime, O> {
    English: {
        Simple: EnglishTenseBlock<O>;
        Progressive: EnglishTenseBlock<O>;
        Participle: EnglishTenseBlock<O>;
        Perfect: EnglishTenseBlock<O>;
    };
    Polish: {
        Simple: PolishTenseBlock<P, O>;
    };
}

export interface TenseContainerByLanguage<O> {
    English: {
        Present: TenseTimed<"Present",O>["English"];
        Past:    TenseTimed<"Past",O>["English"];
        Future:  TenseTimed<"Future",O>["English"];
    };
    Polish?: {
        Present: TenseTimed<"Present",O>["Polish"];
        Past:    TenseTimed<"Past",O>["Polish"];
        Future:  TenseTimed<"Future",O>["Polish"];
    };
}
export type TenseContainer<L extends keyof TenseContainerByLanguage<string>, O> = TenseContainerByLanguage<O>[L];