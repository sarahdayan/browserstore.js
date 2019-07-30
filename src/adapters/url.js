import pipe from '../utils/pipe'

const getParams = () =>
  new URLSearchParams(new URL(window.location.href).search)
const persistPipe = fn =>
  pipe(
    fn,
    (params = '') =>
      window.history.pushState({}, '', `${window.location.pathname}${window.location.hash}?${params}`)
  )(getParams())

export default {
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
      Array.from(params.entries()).forEach(item => params.delete(item[0]))
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
