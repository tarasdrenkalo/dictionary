/** Internationalisation Interface */
export interface i18n<T> {
    English: T;
    Polish? :T;
}
export type Languages = keyof i18n<any>;
/** Available features by language */
export const I18N_FEATURES = {
    IPA:{
        Runtime:{
            English:false,
            Polish:true
        },
        Storage:{
            English:true,
            Polish:true
        }
    }
} as const;