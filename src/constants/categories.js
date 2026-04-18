import { categoryService } from '../services/categoryService'

export const getCategoryById = (id) => {
  return categoryService.getCategoryById(id)
}

export const getCategoryName = (id) => {
  const category = getCategoryById(id)
  return category ? category.nama : 'Unknown Category'
}

export const getCategories = () => {
  return categoryService.getAllCategories()
}

// Keep this for initial seeding only
export const CATEGORIES = [
  {
    id: 'elektronik-gadget',
    nama: 'Tech',
    icon: '💻',
    deskripsi: 'Phones, Laptops, Tablets, Smartwatches'
  },
  {
    id: 'fashion-aksesoris',
    nama: 'Style',
    icon: '👕',
    deskripsi: 'Clothing, Shoes, Bags, Watches'
  },
  {
    id: 'kendaraan',
    nama: 'Auto',
    icon: '🏍️',
    deskripsi: 'Motorcycles, Cars, Bicycles'
  },
  {
    id: 'rumah-tangga',
    nama: 'Home',
    icon: '🛋️',
    deskripsi: 'Furniture, Kitchenware, Decor'
  },
  {
    id: 'hobi-olahraga',
    nama: 'Active',
    icon: '⚽',
    deskripsi: 'Sports gear, Gaming, Collectibles'
  },
  {
    id: 'buku-alat-tulis',
    nama: 'Books',
    icon: '📚',
    deskripsi: 'Books, Novels, Stationery'
  }
]
