import pipe from './utils/pipe'

/**
 * Creates store from storage object
 *
 * @param {storage} storage - An object that implements storage methods.
 * @param {object} options - An object of options.
 *
 * @returns {store}
 */
export default (
  { get, set, remove, clear, afterGet, beforeSet },
  { namespace = '' } = {}
) => {
  return {
    get(key) {
      return pipe(
        key => get(namespace + key),
        ...(afterGet ? [afterGet] : [])
      )(key)
    },
    set(key, value) {
      return pipe(
        ...(beforeSet ? [beforeSet] : []),
        data => set(namespace + key, data)
      )(value)
    },
    remove(key) {
      remove(namespace + key)
    },
    clear
  }
}
