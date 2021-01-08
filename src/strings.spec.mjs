import { truncate, slugify, cleanify } from './strings.mjs'

describe('strings', () => {
    describe('truncate', () => {
        test('should truncate', () => expect(truncate('abcdef', 3)).toBe('abc'))
        test('should not truncate if shorter', () =>
            expect(truncate('abc', 10)).toBe('abc'))
        test('should handle other type than string', () =>
            expect(truncate(5, 10)).toBe('5'))
        test('should handle undefined', () =>
            expect(truncate(undefined, 5)).toBe(''))
    })
    describe('slugify', () => {
        test('should do nothing if name is well formated', () =>
            expect(slugify('abcdef')).toBe('abcdef'))
        test('should accept numbers', () =>
            expect(slugify('abc123')).toBe('abc123'))
        test('should lower case', () => expect(slugify('AbC')).toBe('abc'))
        test('should remove space', () =>
            expect(slugify(' a b c ')).toBe('abc'))
        test('should remove accents', () => expect(slugify('-áéó-')).toBe('--'))
        test('should handle other type than string', () =>
            expect(slugify(5)).toBe('5'))
        test('should handle undefined', () =>
            expect(slugify(undefined)).toBe(''))
    })
    describe('cleanify', () => {
        test('should remove emoji', () =>
            expect(cleanify('Firefox OS 🦊🚀 - LinuxFr.org')).toBe(
                'Firefox OS  - LinuxFr.org'
            ))
    })
})
