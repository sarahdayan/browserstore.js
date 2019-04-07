import localStorageAdapter from '../adapters/local_storage_adapter'
import sessionStorageAdapter from '../adapters/session_storage_adapter'
import { createStore, multiStore } from '../browserstore'

const stores = multiStore([
  createStore(localStorageAdapter, { namespace: 'browserstore_' }),
  createStore(sessionStorageAdapter)
])

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('multiStore', () => {
  describe('#get', () => {
    test('returns data from the first storage that has it', () => {
      localStorage.setItem('browserstore_foo', 'bar')
      sessionStorage.setItem('foo', 'baz')

      expect(stores.get('foo')).toBe('bar')
    })
    test('moves to the next storage until it finds data', () => {
      sessionStorage.setItem('foo', 'baz')
      expect(stores.get('foo')).toBe('baz')
    })
  })
  describe('#set', () => {
    test('sets data in every store according to their respective rules', () => {
      stores.set('foo', 'bar')
      expect(localStorage.getItem('browserstore_foo')).toBe('bar')
      expect(sessionStorage.getItem('foo')).toBe('bar')
    })
  })
  describe('#remove', () => {
    test('removes data in every store', () => {
      localStorage.setItem('browserstore_foo', 'bar')
      sessionStorage.setItem('foo', 'baz')
      stores.remove('foo')
      expect(localStorage.getItem('browserstore_foo')).toBeNull()
      expect(sessionStorage.getItem('foo')).toBeNull()
    })
  })
  describe('#clear', () => {
    test('clears data in every store', () => {
      localStorage.setItem('foo', 'bar')
      localStorage.setItem('browserstore_foo', 'bar')
      sessionStorage.setItem('foo', 'baz')
      sessionStorage.setItem('browserstore_foo', 'baz')
      stores.clear()
      expect(localStorage.getItem('foo')).toBeNull()
      expect(localStorage.getItem('browserstore_foo')).toBeNull()
      expect(sessionStorage.getItem('foo')).toBeNull()
      expect(sessionStorage.getItem('browserstore_foo')).toBeNull()
    })
  })
})
