export default storage => {
  return {
    get(key) {
      return storage.getItem(key)
    },
    set(key, value) {
      storage.setItem(key, value)
    },
    remove(key) {
      storage.removeItem(key)
    },
    clear() {
      storage.clear()
    },
    afterGet(data) {
      try {
        return JSON.parse(data)
      } catch (err) {
        return data
      }
    },
    onGetError(error) {
      throw error
    },
    beforeSet(data) {
      return typeof data === 'string' ? data : JSON.stringify(data)
    },
    onSetError(error) {
      throw error
    }
  }
}
