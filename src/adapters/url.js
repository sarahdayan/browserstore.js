import pipe from '../utils/pipe'

export default () => {
  const getParams = () =>
    new URLSearchParams(new URL(window.location.href).search)
  const persistPipe = fn =>
    pipe(
      fn,
      (params = '') =>
        window.history.pushState(
          {},
          '',
          `${window.location.pathname}?${params}`
        )
    )(getParams())
  return {
    get(key) {
      return getParams().get(key)
    },
    set(key, value) {
      persistPipe(params => {
        params.set(key, value)
        return params
      })
    },
    remove(key) {
      persistPipe(params => {
        params.delete(key)
        return params
      })
    },
    clear() {
      persistPipe(params => {
        params.forEach((_value, key) => params.delete(key))
        return params
      })
    },
    afterGet(data) {
      try {
        return JSON.parse(data)
      } catch (err) {
        return data
      }
    },
    beforeSet(data) {
      return typeof data === 'string' ? data : JSON.stringify(data)
    }
  }
}
