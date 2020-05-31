export const truncate = (s = '', length) => String(s).substring(0, length)

export const slugify = (s = '') =>
    String(s)
        .toLowerCase()
        .replace(/[^A-Za-z0-9-]/g, '')
