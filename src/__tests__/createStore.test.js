import localStorageAdapter from '../adapters/localStorage'
import { createStore } from '../browserstore'

const localStorageAdapterNoTransforms = { ...localStorageAdapter }
delete localStorageAdapterNoTransforms.beforeSet
delete localStorageAdapterNoTransforms.afterGet

const storeFactory = options => createStore(localStorageAdapter, options)

const store = storeFactory({ namespace: 'browserstore_' })
const storeNoTransforms = createStore(localStorageAdapterNoTransforms)
const storeWithIgnore = storeFactory({ ignore: ['bar', 'baz'] })
const storeWithOnly = storeFactory({ only: ['foo'] })
const storeWithConflicts = storeFactory({ only: ['bar'], ignore: ['bar'] })

const errorHandler = jest.fn()
const errorStoreAdapter = {
  get(key) { throw Error('Error getting key') },
  set(key, value) { throw Error('Error setting key') },
  clear() {throw Error('Error clearing storage') },
  remove(key) { throw Error('Error removing key') },
  afterGet() {},
  beforeSet(data) { return data },
  onGetError(err, key) { errorHandler(err, key) },
  onSetError(err, key, data) { errorHandler(err, key, data) },
  onRemoveError(err, key) { errorHandler(err, key) },
  onClearError(err) { errorHandler(err) },
}
const errorStore = createStore(errorStoreAdapter)

beforeEach(() => {
  localStorage.clear()
  errorHandler.mockReset()
})

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
    test('does not set ignored data in the storage', () => {
      storeWithIgnore.set('foo', 'bar')
      storeWithIgnore.set('bar', 'baz')
      storeWithIgnore.set('baz', 'qux')
      expect(localStorage.getItem('foo')).not.toBeNull()
      expect(localStorage.getItem('bar')).toBeNull()
      expect(localStorage.getItem('baz')).toBeNull()
    })
    test('only sets selected data in the storage', () => {
      storeWithOnly.set('foo', 'bar')
      storeWithOnly.set('bar', 'baz')
      storeWithOnly.set('baz', 'qux')
      expect(localStorage.getItem('foo')).not.toBeNull()
      expect(localStorage.getItem('bar')).toBeNull()
      expect(localStorage.getItem('baz')).toBeNull()
    })
    test('gives precedence to ignore when there are conflicts with only', () => {
      storeWithConflicts.set('foo', 'bar')
      storeWithConflicts.set('bar', 'baz')
      storeWithConflicts.set('baz', 'qux')
      expect(localStorage.getItem('foo')).toBeNull()
      expect(localStorage.getItem('bar')).toBeNull()
      expect(localStorage.getItem('baz')).toBeNull()
    })
  })
  describe('#remove', () => {
    test('remove data by namespaced key in the storage', () => {
      localStorage.setItem('browserstore_foo', 'baz')
      store.remove('foo')
      expect(localStorage.getItem('browserstore_foo')).toBeNull()
    })
  })
  describe('#onGetError', () => {
    test('calls error handler when there is an error', () => {
      errorStore.get('error')
      expect(errorHandler).toBeCalledTimes(1)
    })
  })
  describe('#onSetError', () => {
    test('calls error handler when there is an errorr', () => {
      errorStore.set('error', 'error')
      expect(errorHandler).toBeCalledTimes(1)
    })
  })
  describe('#onClearError', () => {
    test('calls error handler when there is an error', () => {
      errorStore.clear()
      expect(errorHandler).toBeCalledTimes(1)
    })
  })
  describe('#onRemoveError', () => {
    test('calls error handler when there is an error', () => {
      errorStore.remove('error')
      expect(errorHandler).toBeCalledTimes(1)
    })
  })
})
