import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { SUCCESS, ERRORS } from '../constants/copywriting'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('buyer') // State untuk Mode UI

  useEffect(() => {
    // Saat pertama dimuat, cek apakah ada token. Jika ada, minta profil user dari Backend.
    const checkUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // *Untuk sementara mengambil dari localStorage agar tampilan tetap jalan:
          const savedUser = localStorage.getItem('user_profile')
          if (savedUser) setUser(JSON.parse(savedUser))
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user_profile')
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'buyer' ? 'seller' : 'buyer')
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password })
      
      const loggedInUser = response.data.user
      const token = response.data.access_token || response.data.token // Tergantung variabel dari Laravel

      // Simpan Auth Token
      localStorage.setItem('token', token)
      // Simpan User sementara di lokal
      localStorage.setItem('user_profile', JSON.stringify(loggedInUser))
      
      setUser(loggedInUser)
      setViewMode('buyer') // Default ke buyer saat pertama kali login
      toast.success(SUCCESS.login)
      return { success: true, user: loggedInUser }
    } catch (error) {
      const errMsg = error.response?.data?.message || ERRORS.general
      toast.error(errMsg)
      return { success: false, error: errMsg }
    }
  }

  const register = async (userData) => {
    try {
      const payload = {
        name: userData.profile?.nama || 'Pengguna Baru',
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password,
        role: 'buyer',
        profile: userData.profile
      };

      const response = await api.post('/register', payload)
      toast.success('Registrasi berhasil! Silakan Login.')
      return { success: true, message: response.data.message }
    } catch (error) {
      const errMsg = error.response?.data?.message || ERRORS.general
      toast.error(errMsg)
      return { success: false, error: errMsg }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_profile')
    setUser(null)
    setLoading(false)
    toast.success(SUCCESS.logout)
  }

  const updateUser = async (updatedData) => { /* TODO */ }
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData)
      const updatedUser = response.data.user
      
      localStorage.setItem('user_profile', JSON.stringify(updatedUser))
      setUser(updatedUser)
      toast.success('Profil berhasil diupdate!')
      return { success: true }
    } catch (error) {
      toast.error('Gagal update manual')
      return { success: false }
    }
  }
  const refreshUser = async () => { /* TODO */ }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    refreshUser,
    viewMode,
    toggleViewMode,
    isAuthenticated: !!user,
    isSeller: !!user && viewMode === 'seller',
    isBuyer: !!user && viewMode === 'buyer',
    isAdmin: user?.role === 'admin'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
