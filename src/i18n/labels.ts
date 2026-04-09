export interface i18n<T> {
    English:T;
    Polish?:T;
}
export type Languages = keyof i18n<any>;