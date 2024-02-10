export const trim = (s = '') => String(s).trim()

export const truncate = (s = '', length) => String(s).substring(0, length)

export const slugify = (s = '') =>
    String(s)
        .toLowerCase()
        .replace(/[^A-Za-z0-9-]/g, '')

const UNICODE_RANGE = '[\uDC00-\uDFFF]'

const UNICODE_FILTER_REGEX =
    `(` +
    `[\u2700-\u27BF]|` +
    `[\uE000-\uF8FF]` +
    `|\uD83C${UNICODE_RANGE}` +
    `|\uD83D${UNICODE_RANGE}` +
    `|\uD83E${UNICODE_RANGE}` +
    `|[\u2011-\u26FF]` +
    `|\uD83E[\uDD10-\uDDFF]` +
    `|\u000b` +
    `)`

export const cleanify = (s = '') => String(s).replace(new RegExp(UNICODE_FILTER_REGEX, 'g'), '')

export const sanitize = (s = '') =>
    cleanify(String(s))
        .replace(/%/g, '')
        .replace(/['"\/\\]/g, '')

export const RE_WIKIPEDIA_VALID_URL = new RegExp('^https?://[a-z]{2}.wikipedia.org/')
const RE_VALID_URL = new RegExp('^https?://')

export const isValidUrl = (s = '', wikipediaOnly = false) =>
    (wikipediaOnly ? RE_WIKIPEDIA_VALID_URL : RE_VALID_URL).test(s)
