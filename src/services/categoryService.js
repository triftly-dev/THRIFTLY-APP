import { storage, STORAGE_KEYS } from './localStorage'
import { CATEGORIES as INITIAL_CATEGORIES } from '../constants/categories'

export const categoryService = {
  getAllCategories() {
    const categories = storage.get(STORAGE_KEYS.CATEGORIES)
    if (!categories || categories.length === 0) {
      // Initialize with constants if empty
      storage.set(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
      return INITIAL_CATEGORIES
    }
    return categories
  },

  getCategoryById(id) {
    const categories = this.getAllCategories()
    return categories.find(cat => cat.id === id)
  },

  createCategory(categoryData) {
    const categories = this.getAllCategories()
    
    // Generate simple slug ID if not provided
    const id = categoryData.id || categoryData.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    if (categories.some(cat => cat.id === id)) {
      throw new Error('Kategori dengan ID tersebut sudah ada')
    }

    const newCategory = {
      id,
      nama: categoryData.nama,
      icon: categoryData.icon || '📦',
      deskripsi: categoryData.deskripsi || ''
    }

    categories.push(newCategory)
    storage.set(STORAGE_KEYS.CATEGORIES, categories)
    return newCategory
  },

  updateCategory(id, updates) {
    const categories = this.getAllCategories()
    const index = categories.findIndex(cat => cat.id === id)
    
    if (index === -1) {
      throw new Error('Kategori tidak ditemukan')
    }

    categories[index] = {
      ...categories[index],
      ...updates
    }

    storage.set(STORAGE_KEYS.CATEGORIES, categories)
    return categories[index]
  },

  deleteCategory(id) {
    const categories = this.getAllCategories()
    const filtered = categories.filter(cat => cat.id !== id)
    storage.set(STORAGE_KEYS.CATEGORIES, filtered)
    return true
  }
}
