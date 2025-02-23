import type { Request } from 'express'

export const getStrParam = (req: Request, paramName: string, shortParamName: string): string | undefined => {
    const paramValue = req.query[paramName]
    const shortParamValue = req.query[shortParamName]
    if (typeof paramValue === 'string') return paramValue
    if (typeof shortParamValue === 'string') return shortParamValue
}

export const getIntParam = (req: Request, paramName: string, shortParamName: string): number | undefined => {
    const strParam = getStrParam(req, paramName, shortParamName)
    if (typeof strParam === 'string') return Math.abs(parseInt(strParam, 10))
}
