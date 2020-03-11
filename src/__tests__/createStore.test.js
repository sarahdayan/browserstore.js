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

  const getMock = jest.fn((error, key) => {
    if (key !== 'error') throw error
  })
  const setMock = jest.fn((error, key, data) => {
    if (key !== 'error') throw error
  })
  const errorStoreAdapter = {
    get(key) {
      if (key === 'error') throw Error('Error getting key')
    },
    set(key, value) {
      if (key === 'error') throw Error('Error setting key')
    },
    clear() {},
    afterGet() {},
    onGetError(error, key) {
      getMock(error, key)
    },
    beforeSet(data) { return data },
    onSetError(error, key, data) {
      setMock(error, key, data)
    },
  }
  const errorStore = createStore(errorStoreAdapter)

  describe('#onGetError', () => {
    test('does not call onGetError when there is no error', () => {
      expect(errorStore.get('noError')).toBe(undefined)
    })
    test('does call onGetError when there is an error', () => {
      errorStore.get('error')

      expect(getMock.mock.calls.length).toBe(1);
      expect(typeof getMock.mock.calls[0][0]).toBe('object');
      expect(getMock.mock.calls[0][1]).toBe('error');
    })
  })
  describe('#onSetError', () => {
    test('does not call onSetError when there is no error', () => {
      expect(errorStore.set('noError', 'bar')).toBe(undefined)
    })
    test('does call onSetError when there is an error', () => {
      errorStore.set('error', 'foo')

      expect(setMock.mock.calls.length).toBe(1);
      expect(typeof setMock.mock.calls[0][0]).toBe('object');
      expect(setMock.mock.calls[0][1]).toBe('error');
      expect(setMock.mock.calls[0][2]).toBe('foo');
    })
  })
})
