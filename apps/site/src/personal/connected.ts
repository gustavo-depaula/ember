// Whether this browser is one of an account's devices. Read on every page
// before anything else of the account loads, so a visitor who never connected
// downloads none of it.
const key = 'ember-connected'

export const connected = {
  get: (): boolean => {
    try {
      return localStorage.getItem(key) === '1'
    } catch {
      return false
    }
  },
  set: (on: boolean): void => {
    try {
      if (on) localStorage.setItem(key, '1')
      else localStorage.removeItem(key)
    } catch {
      // Private mode: the account lasts for this page only.
    }
  },
}
