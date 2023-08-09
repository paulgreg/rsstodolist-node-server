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

export const isValidUrl = (s = '') => s.startsWith('http://') || s.startsWith('https://')
