import api from './api'

export const productService = {
  // Mengambil semua produk yang disetujui untuk marketplace
  async getApprovedProducts() {
    const response = await api.get('/products')
    return response.data.map(p => ({
      ...p,
      nama: p.name,
      harga: p.price,
      fotos: p.images || [],
      isBU: p.is_bu,
      lokasi: p.location
    }))
  },

  async getAllProducts() {
    const response = await api.get('/admin/products')
    return response.data.map(p => ({
      ...p,
      nama: p.name,
      harga: p.price,
      fotos: p.images || [],
      isBU: p.is_bu,
      sellerId: p.user_id,
      lokasi: p.location
    }))
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`)
    const p = response.data
    return {
      ...p,
      nama: p.name,
      harga: p.price,
      fotos: p.images || [],
      isBU: p.is_bu,
      stok: p.stock,
      sellerId: p.user_id,
      lokasi: p.location
    }
  },

  // Mengambil produk milik penjual yang sedang aktif
  async getMyProducts() {
    const response = await api.get('/my-products')
    return response.data.map(p => ({
      ...p,
      nama: p.name,
      harga: p.price,
      fotos: p.images || [],
      isBU: p.is_bu,
      stok: p.stock,
      lokasi: p.location
    }))
  },

  // Menambah produk baru (Seller Mode)
  async createProduct(productData) {
    const response = await api.post('/products', {
      name: productData.nama,
      description: productData.deskripsi,
      price: productData.harga,
      category: productData.kategori,
      location: productData.lokasi,
      is_bu: productData.isBU,
      images: productData.fotos,
      stock: productData.stok || 1
    })
    return response.data
  },

  // Mengupdate produk (Seller Mode)
  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, {
      name: productData.nama,
      description: productData.deskripsi,
      price: productData.harga,
      category: productData.kategori,
      location: productData.lokasi,
      is_bu: productData.isBU,
      images: productData.fotos,
      stock: productData.stok !== undefined ? productData.stok : 1
    })
    return response.data
  },

  // Menurunkan/Menghapus produk (Seller Mode)
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  // Tandai produk sebagai terjual
  async markAsSold(id) {
    const response = await api.put(`/products/${id}/sold`)
    return response.data
  },

  async approveProduct(id, note = '') {
    const response = await api.put(`/admin/products/${id}/approve`, { note })
    return response.data
  },

  async rejectProduct(id, note = '') {
    const response = await api.put(`/admin/products/${id}/reject`, { note })
    return response.data
  },

  // --- Fungsi Pencarian & Filter (Public) ---
  async searchProducts(query, filters = {}) {
    let products = await this.getApprovedProducts()

    if (query) {
      const lowerQuery = query.toLowerCase()
      products = products.filter(product => 
        product.nama.toLowerCase().includes(lowerQuery) ||
        product.description?.toLowerCase().includes(lowerQuery)
      )
    }

    if (filters.category) {
      products = products.filter(product => product.category === filters.category)
    }

    return products
  },

  async getBUProducts() {
    const products = await this.getApprovedProducts()
    return products.filter(p => p.isBU)
  },

  async getLatestProducts(limit = 10) {
    const products = await this.getApprovedProducts()
    return products.slice(0, limit)
  },

  async getProductsByCategory(category) {
    const products = await this.getApprovedProducts()
    return products.filter(p => p.category === category)
  },

  // --- Fungsi Tambahan (Legacy Support jika masih dibutuhkan UI) ---
  getProductsBySeller(sellerId) {
     return this.getMyProducts() 
  }
}
