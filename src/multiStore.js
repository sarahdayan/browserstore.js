/**
 * Creates a multi-store
 *
 * @param {store[]} stores - The stores to sync.
 * @param {object} [errorHandlers] - Functions to override the error handling behavior.
 * @param {function} [errorHandlers.onGetError] - A function to execute if a store errors when getting a value.
 * @param {function} [errorHandlers.onSetError] - A function to execute if a store errors when setting a value.
 * @param {function} [errorHandlers.onClearError] - A function to execute if a store errors when clearing all values.
 * @param {function} [errorHandlers.onRemoveError] - A function to execute if a store errors when removing a value.
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
        } catch (e) {
          if (!onGetError) throw e

          data = onGetError(key, formatError(e, i))
        }

        if (data) break
      }
      return data
    },
    set(key, value) {
      stores.forEach((store, i) => {
        try {
          store.set(key, value)
        } catch (e) {
          if (!onSetError) throw e

          onSetError(key, value, formatError(e, i))
        }
      })
    },
    remove(key) {
      stores.forEach((store, i) => {
        try {
          store.remove(key)
        } catch (e) {
          if (!onRemoveError) throw e

          onRemoveError(key, formatError(e, i))
        }
      })
    },
    clear() {
      stores.forEach((store, i) => {
        try {
          store.clear()
        } catch (e) {
          if (!onClearError) throw e

          onClearError(formatError(e, i))
        }
      })
    }
  }
}
