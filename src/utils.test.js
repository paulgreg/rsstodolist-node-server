import { getStrParam, getIntParam } from './utils.ts'

describe('utils', () => {
    describe('getStrParam', () => {
        test('should return value by name', () =>
            expect(getStrParam({ query: { name: 'test' } }, 'name', 'n')).toEqual('test'))
        test('should return value by short name', () =>
            expect(getStrParam({ query: { n: 'test' } }, 'name', 'n')).toEqual('test'))
    })
    describe('getIntParam', () => {
        test('should return value by name', () =>
            expect(getIntParam({ query: { limit: '12' } }, 'limit', 'l')).toEqual(12))
        test('should return value by short name', () =>
            expect(getIntParam({ query: { l: '12' } }, 'limit', 'l')).toEqual(12))

        test('should return positive value', () =>
            expect(getIntParam({ query: { limit: '-12' } }, 'limit', 'l')).toEqual(12))
    })
})
