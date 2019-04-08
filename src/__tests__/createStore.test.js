import localStorageAdapter from '../adapters/localStorage'
import { createStore } from '../browserstore'

const localStorageAdapterNoTransforms = Object.assign({}, localStorageAdapter)
delete localStorageAdapterNoTransforms.beforeSet
delete localStorageAdapterNoTransforms.afterGet

const store = createStore(localStorageAdapter, { namespace: 'browserstore_' })
const storeNoTransforms = createStore(localStorageAdapterNoTransforms)

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
    test('works as expected when storage#afterGet is not implemented', () => {
      localStorage.setItem('foo', 'baz')
      expect(storeNoTransforms.get('foo')).toBe('baz')
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
    test('works as expected when storage#beforeSet is not implemented', () => {
      storeNoTransforms.set('foo', 'bar')
      expect(localStorage.getItem('foo')).toBe('bar')
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
