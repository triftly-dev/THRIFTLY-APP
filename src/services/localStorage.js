const STORAGE_KEYS = {
  USERS: 'secondnesia_users',
  PRODUCTS: 'secondnesia_products',
  TRANSACTIONS: 'secondnesia_transactions',
  MESSAGES: 'secondnesia_messages',
  CATEGORIES: 'secondnesia_categories',
  COMPLAINTS: 'secondnesia_complaints',
  CURRENT_USER: 'secondnesia_current_user'
}

class LocalStorageService {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return null
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error)
      return false
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  }

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  getSize() {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return (total / 1024 / 1024).toFixed(2)
  }

  checkSize() {
    const size = this.getSize()
    if (size > 5) {
      console.warn(`LocalStorage size: ${size}MB - mendekati limit!`)
      return false
    }
    return true
  }
}

export const storage = new LocalStorageService()
export { STORAGE_KEYS }
