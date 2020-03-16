import pipe from './utils/pipe'

/**
 * Creates store from storage object
 *
 * @param {storage} storage - An object that implements storage methods.
 * @param {object} [options] - An object of options.
 * @param {string} [options.namespace] - A namespace to prefix keys.
 * @param {string[]} [options.ignore] - An array of keys to ignore.
 * @param {string[]} [options.only] - An array of keys to take into account exclusively.
 *
 * @returns {store}
 */
export default (
  { get, set, remove, clear, afterGet, beforeSet, onGetError, onSetError, onRemoveError, onClearError },
  { namespace = '', ignore = [], only = [] } = {}
) => {
  const shouldIgnore = key => {
    const inIgnoreList = ignore.includes(key)
    const inOnlyList = only.length && !only.includes(key)
    return inIgnoreList ? inIgnoreList : inOnlyList
  }

  return {
    get(key) {
      return pipe(
        key => {
          try {
            return get(namespace + key)
          } catch (err) {
            if (!onGetError) throw err

            return onGetError(err, key)
          }
        },
        ...(afterGet ? [afterGet] : [])
      )(key)
    },
    set(key, value) {
      return pipe(
        ...(beforeSet ? [beforeSet] : []),
        value => {
          try {
            if (!shouldIgnore(key)) return set(namespace + key, value)
          } catch (err) {
            if (!onSetError) throw err
            return onSetError(err, key, value)
          }
        }
      )(value)
    },
    remove(key) {
      try {
        return remove(namespace + key)
      } catch (err) {
        if (!onRemoveError) throw err

        return onRemoveError(err, key)
      }
    },
    clear() {
      try {
        clear()
      } catch (err) {
        if (!onClearError) throw err

        return onClearError(err)
      }
    }
  }
}
