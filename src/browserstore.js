export default stores => {
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
