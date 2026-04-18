import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { productService } from '../services/productService'
import { messageService } from '../services/messageService'
import { useAuth } from './AuthContext'
import axios from 'axios' // Pastikan axios diimport jika ingin langsung tembak API

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Gunakan useCallback agar fungsi tidak dibuat ulang setiap render (menghindari infinite loop)
  const refreshProducts = useCallback(async () => {
    setLoading(true)
    try {
      // Gunakan getApprovedProducts untuk publik (Marketplace)
      const allProducts = await productService.getApprovedProducts()
      setProducts(allProducts)
      
      /* NANTI: Jika API Laravel sudah siap, ganti menjadi:
      const response = await axios.get('http://localhost:8000/api/products');
      setProducts(response.data);
      */
    } catch (error) {
      console.error("Gagal refresh produk:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUnreadCount = useCallback(() => {
    // Tambahkan pengecekan user.id agar tidak error saat logout
    if (user && user.id) {
      try {
        const count = messageService.getUnreadCount(user.id)
        setUnreadCount(count)
      } catch (error) {
        console.error("Gagal refresh unread count:", error)
      }
    } else {
      setUnreadCount(0)
    }
  }, [user])

  // Load produk saat pertama kali aplikasi jalan
  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  // Interval untuk cek pesan, hanya jika user sudah login
  useEffect(() => {
    if (!user) return; // Jangan jalankan interval jika tidak ada user

    refreshUnreadCount()
    const interval = setInterval(() => {
      refreshUnreadCount()
    }, 5000)

    return () => clearInterval(interval)
  }, [user, refreshUnreadCount])

  const value = {
    products,
    unreadCount,
    loading,
    setLoading,
    refreshProducts,
    refreshUnreadCount
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}