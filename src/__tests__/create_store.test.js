import local from '../storages/local_storage'
import { createStore } from '../browserstore'

const store = createStore(local, { namespace: 'browserstore_' })

beforeEach(() => localStorage.clear())

describe('createStore', () => {
  describe('#get', () => {
    test('returns data by namespaced key from storage', () => {
      localStorage.setItem('browserstore_foo', 'baz')
      expect(store.get('foo')).toBe('baz')
    })
    test('returns transformed data using storage#afterGet', () => {
      localStorage.setItem('browserstore_foo', '{"foo":"bar"}')
      expect(store.get('foo')).toEqual({ foo: 'bar' })
    })
  })
  describe('#set', () => {
    test('sets data by namespaced key in the storage', () => {
      store.set('foo', 'bar')
      expect(localStorage.getItem('browserstore_foo')).toBe('bar')
    })
    test('sets transformed data using storage#beforeSet', () => {
      store.set('foo', { foo: 'bar' })
      expect(localStorage.getItem('browserstore_foo')).toBe('{"foo":"bar"}')
    })
  })
  describe('#remove', () => {
    test('remove data by namespaced key in the storage', () => {
      localStorage.setItem('browserstore_foo', 'baz')
      store.remove('foo')
      expect(localStorage.getItem('browserstore_foo')).toBeNull()
    })
  })
})
