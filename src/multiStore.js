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
  return {
    get(key) {
      let data = null
      for (let i = 0; i < stores.length; i++) {
        try {
          data = stores[i].get(key)
        } catch (err) {
          if (!onGetError) throw err

          data = onGetError(err, key, stores[i], stores[i + 1])
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

          onSetError(err, key, value, stores[i], stores[i + 1])
        }
      })
    },
    remove(key) {
      stores.forEach((store, i) => {
        try {
          store.remove(key)
        } catch (err) {
          if (!onRemoveError) throw err

          onRemoveError(err, key, stores[i], stores[i + 1])
        }
      })
    },
    clear() {
      stores.forEach((store, i) => {
        try {
          store.clear()
        } catch (err) {
          if (!onClearError) throw err

          onClearError(err, stores[i], stores[i + 1])
        }
      })
    }
  }
}
