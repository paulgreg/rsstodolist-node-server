import type { Request, Response, NextFunction } from 'express'
import en from '../locales/en.json' with { type: 'json' }
import fr from '../locales/fr.json' with { type: 'json' }
import type {
    TranslationParams,
    Translations,
    TranslateFunction,
    TranslationSection,
} from '../types/translations.js'

const translations: Translations = { en, fr }

export const detectLocale = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 1. first cookie
    let locale = req.cookies?.rsstodolist_lang as keyof Translations | undefined

    // 2. Then `Accept-Language`
    if (!locale) {
        const acceptLang = req.headers['accept-language']?.split(',')[0] || 'en'
        locale = acceptLang.startsWith('fr') ? 'fr' : 'en'
    }

    // 3. Default `en` fallback
    res.locals.locale = ['en', 'fr'].includes(locale) ? locale : 'en'

    res.locals.t = ((key: string, params: TranslationParams = {}): string => {
        const keys = key.split('.')
        const result = keys.reduce<
            TranslationSection | string | string[] | undefined
        >(
            (obj, k) => {
                if (typeof obj === 'string' || obj === undefined) {
                    return undefined
                }

                if (Array.isArray(obj)) {
                    const index = Number(k)
                    return Number.isInteger(index) ? obj[index] : undefined
                }

                return obj[k]
            },
            translations[res.locals.locale as keyof Translations]
        )

        if (typeof result !== 'string') {
            return key
        }

        return Object.entries(params).reduce(
            (text, [paramKey, value]) =>
                text.replaceAll(`{${paramKey}}`, String(value)),
            result
        )
    }) satisfies TranslateFunction

    res.set('Referrer-Policy', 'same-origin')
    res.set('Vary', `accept-language, accept-encoding, cookie`)

    next()
}
