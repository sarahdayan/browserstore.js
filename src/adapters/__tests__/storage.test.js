import storage from '../storage'

const s = storage(localStorage)

beforeEach(() => localStorage.clear())

describe('storage', () => {
  describe('#get', () => {
    test('returns data by key from storage', () => {
      localStorage.setItem('foo', 'bar')
      expect(s.get('foo')).toBe('bar')
    })
  })
  describe('#set', () => {
    test('sets data by key in the storage', () => {
      s.set('bar', 'baz')
      expect(localStorage.getItem('bar')).toBe('baz')
    })
  })
  describe('#remove', () => {
    test('removes data by key from storage', () => {
      localStorage.setItem('foo', 'bar')
      s.remove('foo')
      expect(localStorage.getItem('foo')).toBeNull()
    })
  })
  describe('#clear', () => {
    beforeEach(() => {
      localStorage.setItem('foo', 'bar')
      localStorage.setItem('baz', 'quux')
    })
    test('clear all data from storage', () => {
      s.clear()
      expect(localStorage.getItem('foo')).toBeNull()
      expect(localStorage.getItem('bar')).toBeNull()
    })
  })
  describe('#afterGet', () => {
    test('unstringifies numbers', () => {
      expect(s.afterGet('1')).toBe(1)
    })
    test('unstringifies objects', () => {
      expect(s.afterGet('{"foo":"bar"}')).toEqual({ foo: 'bar' })
    })
    test('unstringifies arrays', () => {
      expect(s.afterGet('["foo","bar"]')).toEqual(['foo', 'bar'])
    })
    test('leaves strings untouched', () => {
      expect(s.afterGet('foo')).toBe('foo')
    })
  })
  describe('#beforeSet', () => {
    test('stringifies numbers', () => {
      expect(s.beforeSet(1)).toBe('1')
    })
    test('stringifies objects', () => {
      expect(s.beforeSet({ foo: 'bar' })).toBe('{"foo":"bar"}')
    })
    test('unstringifies arrays', () => {
      expect(s.beforeSet(['foo', 'bar'])).toEqual('["foo","bar"]')
    })
    test('leaves strings untouched', () => {
      expect(s.beforeSet('foo')).toBe('foo')
    })
  })
})
