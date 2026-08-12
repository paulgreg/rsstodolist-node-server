export type TranslationSection = {
    [key: string]: string | string[] | TranslationSection
}

export type Translations = {
    en: TranslationSection
    fr: TranslationSection
}

export type TranslationParams = Record<string, string | number>

export type TranslateFunction = (
    key: string,
    params?: TranslationParams
) => string
