export interface CasePlurality<C> {
    Singular?:C;
    Plural?:C;
}
export interface CaseStructure<C> {
    Nominative:CasePlurality<C>,
    Genitive:CasePlurality<C>,
    Dative:CasePlurality<C>,
    Accusative:CasePlurality<C>,
    Instrumental:CasePlurality<C>,
    Locative:CasePlurality<C>,
    Vocative:CasePlurality<C>
}