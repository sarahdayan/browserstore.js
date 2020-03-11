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
  { get, set, remove, clear, afterGet, beforeSet, onGetError, onSetError },
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
          } catch (e) {
            if (!onGetError) throw e

            return onGetError(e, key)
          }
        },
        ...(afterGet ? [afterGet] : [])
      )(key)
    },
    set(key, value) {
      return pipe(
        ...(beforeSet ? [beforeSet] : []),
        data => {
          try {
            if (! shouldIgnore(key)) return set(namespace + key, data)
          } catch (e) {
            if (!onSetError) throw e

            return onSetError(e, key, data)

          }
        }
      )(value)
    },
    remove(key) {
      remove(namespace + key)
    },
    clear
  }
}
