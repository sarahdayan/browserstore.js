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

          data = onGetError(key, formatError(err, i))
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

          onSetError(key, value, formatError(err, i))
        }
      })
    },
    remove(key) {
      stores.forEach((store, i) => {
        try {
          store.remove(key)
        } catch (err) {
          if (!onRemoveError) throw err

          onRemoveError(key, formatError(err, i))
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
