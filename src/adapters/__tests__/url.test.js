import urlAdapter from '../url'

const getParams = () =>
  new URLSearchParams(new URL(window.location.href).search)
const persist = (params = '') =>
  window.history.pushState({}, '', `${window.location.pathname}?${params}`)

beforeEach(() => persist())

describe('URL', () => {
  describe('#get', () => {
    test('returns data by key from storage', () => {
      const params = getParams()
      params.set('foo', 'bar')
      persist(params)
      expect(urlAdapter.get('foo')).toBe('bar')
    })
    describe('#set', () => {
      test('sets data by key in the storage', () => {
        urlAdapter.set('bar', 'baz')
        expect(getParams().get('bar')).toBe('baz')
      })
    })
    describe('#remove', () => {
      test('removes data by key from storage', () => {
        const params = getParams()
        params.set('foo', 'bar')
        persist(params)
        urlAdapter.remove('foo')
        expect(getParams().get('bar')).toBeNull()
      })
    })
    describe('#clear', () => {
      test('clear all data from storage', () => {
        const params = getParams()
        params.set('foo', 'bar')
        params.set('baz', 'quux')
        persist(params)
        urlAdapter.clear()
        expect(getParams().get('foo')).toBeNull()
        expect(getParams().get('bar')).toBeNull()
      })
    })
    describe('#afterGet', () => {
      test('unstringifies numbers', () => {
        expect(urlAdapter.afterGet('1')).toBe(1)
      })
      test('unstringifies objects', () => {
        expect(urlAdapter.afterGet('{"foo":"bar"}')).toEqual({ foo: 'bar' })
      })
      test('unstringifies arrays', () => {
        expect(urlAdapter.afterGet('["foo","bar"]')).toEqual(['foo', 'bar'])
      })
      test('leaves strings untouched', () => {
        expect(urlAdapter.afterGet('foo')).toBe('foo')
      })
    })
    describe('#beforeSet', () => {
      test('stringifies numbers', () => {
        expect(urlAdapter.beforeSet(1)).toBe('1')
      })
      test('stringifies objects', () => {
        expect(urlAdapter.beforeSet({ foo: 'bar' })).toBe('{"foo":"bar"}')
      })
      test('unstringifies arrays', () => {
        expect(urlAdapter.beforeSet(['foo', 'bar'])).toEqual('["foo","bar"]')
      })
      test('leaves strings untouched', () => {
        expect(urlAdapter.beforeSet('foo')).toBe('foo')
      })
    })
  })
})
