import { storage, STORAGE_KEYS } from './localStorage'
import { generateId, hashPassword, verifyPassword } from '../utils/helpers'
import api from './api'

export const userService = {
  async getAllUsers() {
    try {
      const response = await api.get('/users')
      // Map API fields to the frontend structure
      return response.data.map(user => ({
        ...user,
        createdAt: user.created_at,
        profile: {
          nama: user.name,
          lokasi: user.lokasi || 'N/A'
        }
      }))
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Access to user list denied (Admin only). Returning empty list.')
        return []
      }
      console.error('Error fetching users:', error)
      return []
    }
  },

  async getUserById(id) {
    if (!id) return null
    try {
      const users = await this.getAllUsers()
      if (!users || users.length === 0) return null
      return users.find(user => String(user.id) === String(id))
    } catch (error) {
      return null
    }
  },

  async getUserByEmail(email) {
    if (!email) return null
    const users = await this.getAllUsers()
    return users.find(user => user.email.toLowerCase() === email.toLowerCase())
  },

  createUser(userData) {
    const users = this.getAllUsers()
    
    if (this.getUserByEmail(userData.email)) {
      throw new Error('Email sudah terdaftar')
    }

    const newUser = {
      id: generateId(),
      email: userData.email,
      password: hashPassword(userData.password),
      role: userData.role || 'buyer',
      profile: {
        nama: userData.profile?.nama || '',
        ttl: userData.profile?.ttl || '',
        alamat: userData.profile?.alamat || '',
        noRekening: userData.profile?.noRekening || '',
        ktpUrl: userData.profile?.ktpUrl || '',
        latitude: userData.profile?.latitude || 0,
        longitude: userData.profile?.longitude || 0,
        lokasi: userData.profile?.lokasi || '',
        noTelp: userData.profile?.noTelp || ''
      },
      saldo: {
        ketahan: 0,
        bisaDitarik: 0
      },
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    storage.set(STORAGE_KEYS.USERS, users)
    return newUser
  },

  updateUser(id, updates) {
    const users = this.getAllUsers()
    const index = users.findIndex(user => user.id === id)
    
    if (index === -1) {
      throw new Error('User tidak ditemukan')
    }

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    storage.set(STORAGE_KEYS.USERS, users)
    return users[index]
  },

  updateProfile(id, profileData) {
    const users = this.getAllUsers()
    const index = users.findIndex(user => user.id === id)
    
    if (index === -1) {
      throw new Error('User tidak ditemukan')
    }

    users[index].profile = {
      ...users[index].profile,
      ...profileData
    }
    users[index].updatedAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.USERS, users)
    return users[index]
  },

  updateSaldo(id, saldoData) {
    const users = this.getAllUsers()
    const index = users.findIndex(user => user.id === id)
    
    if (index === -1) {
      throw new Error('User tidak ditemukan')
    }

    users[index].saldo = {
      ...users[index].saldo,
      ...saldoData
    }
    users[index].updatedAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.USERS, users)
    return users[index]
  },

  login(email, password) {
    const user = this.getUserByEmail(email)
    
    if (!user) {
      throw new Error('Email atau password salah')
    }

    if (!verifyPassword(password, user.password)) {
      throw new Error('Email atau password salah')
    }

    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password

    storage.set(STORAGE_KEYS.CURRENT_USER, userWithoutPassword)
    return userWithoutPassword
  },

  logout() {
    storage.remove(STORAGE_KEYS.CURRENT_USER)
  },

  getCurrentUser() {
    return storage.get(STORAGE_KEYS.CURRENT_USER)
  },

  isAuthenticated() {
    return !!this.getCurrentUser()
  },

  deleteUser(id) {
    const users = this.getAllUsers()
    const filtered = users.filter(user => user.id !== id)
    storage.set(STORAGE_KEYS.USERS, filtered)
    return true
  }
}
