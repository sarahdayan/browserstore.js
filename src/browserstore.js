import pipe from './utils/pipe'

/**
 * Creates store from storage object
 *
 * @param {storage} storage - An object that implements storage methods.
 * @param {object} options - An object of options.
 *
 * @returns {store}
 */
export const createStore = (
  { get, set, remove, clear, afterGet, beforeSet },
  { namespace = '' } = {}
) => {
  return {
    get(key) {
      return pipe(
        key => get(namespace + key),
        afterGet
      )(key)
    },
    set(key, value) {
      return pipe(
        beforeSet,
        data => set(namespace + key, data)
      )(value)
    },
    remove(key) {
      remove(namespace + key)
    },
    clear
  }
}

/**
 * Creates a multi-store
 *
 * @param {array} stores - The stores to sync.
 *
 * @returns {object}
 */
export const multiStore = stores => {
  return {
    get(key) {
      let data = null
      for (let i = 0; i < stores.length; i++) {
        data = stores[i].get(key)
        if (data) break
      }
      return data
    },
    set(key, value) {
      stores.forEach(store => store.set(key, value))
    },
    remove(key) {
      stores.forEach(store => store.remove(key))
    },
    clear() {
      stores.forEach(store => store.clear())
    }
  }
}
