/**
 * Creates a multi-store
 *
 * @param {store[]} stores - The stores to sync.
 * @param {function} [options.onGetError] - A callback to execute if a store errors when getting a value.
 * @param {function} [options.onSetError] - A callback to execute if a store errors when setting a value.
 * @param {function} [options.onClearError] - A callback to execute if a store errors when clearing all values.
 * @param {function} [options.onRemoveError] - A callback to execute if a store errors when removing a value.
 *
 * @returns {object}
 */
export default (
  stores, 
  { onGetError, onSetError, onClearError, onRemoveError } = {}
) => {
  const formatError = (err, storeIndex) => {
    err.currentStore = stores[storeIndex]
    err.nextStore = stores[storeIndex + 1]

    return err
  }

  return {
    get(key) {
      let data = null
      for (let i = 0; i < stores.length; i++) {
        try {
          data = stores[i].get(key)
        } catch (err) {
          if (!onGetError) throw err

          data = onGetError(formatError(err, i), key)
        }

        if (data) break
      }
      return data
    },
    set(key, value) {
      stores.forEach((store, i) => {
        try {
          store.set(key, value)
        } catch (err) {
          if (!onSetError) throw err

          onSetError(formatError(err, i), key, value)
        }
      })
    },
    remove(key) {
      stores.forEach((store, i) => {
        try {
          store.remove(key)
        } catch (err) {
          if (!onRemoveError) throw err

          onRemoveError(formatError(err, i), key)
        }
      })
    },
    clear() {
      stores.forEach((store, i) => {
        try {
          store.clear()
        } catch (err) {
          if (!onClearError) throw err

          onClearError(formatError(err, i))
        }
      })
    }
  }
}
