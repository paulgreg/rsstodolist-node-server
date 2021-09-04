export const truncate = (s = '', length) => String(s).trim().substring(0, length)

export const slugify = (s = '') =>
    String(s)
        .toLowerCase()
        .replace(/[^A-Za-z0-9-]/g, '')

export const cleanify = (s = '') =>
    String(s).replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ''
    )
