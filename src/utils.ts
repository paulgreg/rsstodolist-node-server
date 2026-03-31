import type { Request } from 'express'
import jschardet from 'jschardet'
import charset from 'charset'
import iconv from 'iconv-lite'

export const getStrParam = (req: Request, paramName: string, shortParamName: string): string | undefined => {
    const paramValue = req.query[paramName]
    const shortParamValue = req.query[shortParamName]
    if (typeof paramValue === 'string') return paramValue
    if (typeof shortParamValue === 'string') return shortParamValue
}

export const getIntParam = (req: Request, paramName: string, shortParamName: string): number | undefined => {
    const strParam = getStrParam(req, paramName, shortParamName)
    if (typeof strParam === 'string') return Math.abs(Number.parseInt(strParam, 10))
}

export async function fetchWithEncoding(url: string): Promise<{
    data: string
    status: number
    headers: Record<string, string>
}> {
    const timeout = 5000
    const headers = {
        'User-Agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0',
    }

    const controller = new AbortController()

    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            headers,
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Get array buffer for encoding detection (mimics axios responseType: 'arraybuffer')
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const chardetResult = jschardet.detect(buffer)
        const responseHeaders = Object.fromEntries(response.headers.entries())
        const encoding = chardetResult?.encoding || charset(responseHeaders, buffer)

        let data = buffer.toString('binary')
        if (encoding) {
            data = iconv.decode(buffer, encoding)
        }

        return {
            data,
            status: response.status,
            headers: responseHeaders,
        }
    } finally {
        clearTimeout(timeoutId)
    }
}
