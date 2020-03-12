import localStorageAdapter from '../adapters/localStorage'
import sessionStorageAdapter from '../adapters/sessionStorage'
import urlAdapter from '../adapters/url'
import { createStore, multiStore } from '../browserstore'

const getParams = () =>
  new URLSearchParams(new URL(window.location.href).search)

const errorStoreAdapter = {
  get(key) { throw Error('This is an error') },
  set(key) { throw Error('This is an error') },
  remove(key){ throw Error('This is an error')},
  clear(){ throw Error('This is an error')},
}

const errorHandler = jest.fn()

const errorStores = multiStore([
  createStore(errorStoreAdapter, { namespace: 'browserstore_' }),
  createStore(localStorageAdapter, { namespace: 'browserstore_' })
], {
  onGetError(key, e) { errorHandler(key, e) },
  onSetError(key, data, e) { errorHandler(key, data, e) },
  onRemoveError(key, e) { errorHandler(key, e) },
  onClearError(e) { errorHandler(e) },
})

const stores = multiStore([
  createStore(localStorageAdapter, { namespace: 'browserstore_' }),
  createStore(sessionStorageAdapter, { ignore: ['bar'] }),
  createStore(urlAdapter, { only: ['foo'] })
])

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.history.pushState({}, '', window.location.pathname)
  errorHandler.mockClear()
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
    test('calls the error handler if an error is thrown', () => {
      errorStores.get('foo')
      expect(errorHandler).toBeCalledTimes(1)
    })
  })
  describe('#set', () => {
    test('sets data in every store according to their respective rules', () => {
      stores.set('foo', 'bar')
      stores.set('bar', 'baz')
      expect(localStorage.getItem('browserstore_foo')).toBe('bar')
      expect(localStorage.getItem('browserstore_bar')).toBe('baz')
      expect(sessionStorage.getItem('foo')).toBe('bar')
      expect(sessionStorage.getItem('bar')).toBeNull()
      expect(getParams().get('foo')).toBe('bar')
      expect(getParams().get('bar')).toBeNull()
    })
    test('calls the error handler if an error is thrown', () => {
      errorStores.set('foo', 'bar')
      expect(errorHandler).toBeCalledTimes(1)
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
    test('calls the error handler if an error is thrown', () => {
      errorStores.remove('foo')
      expect(errorHandler).toBeCalledTimes(1)
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
    test('calls the error handler if an error is thrown', () => {
      errorStores.clear()
      expect(errorHandler).toBeCalledTimes(1)
    })
  })
})
