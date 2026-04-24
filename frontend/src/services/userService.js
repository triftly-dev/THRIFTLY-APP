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

  async createUser(userData) {
    const users = await this.getAllUsers()
    
    const existingUser = await this.getUserByEmail(userData.email)
    if (existingUser) {
      throw new Error('Email sudah terdaftar')
    }

    // Catatan: Pembuatan user idealnya via API. 
    // Bagian ini masih menggunakan localStorage sebagai fallback jika dibutuhkan.
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

  async updateUser(id, updates) {
    const currentUser = this.getCurrentUser()
    
    // Jika yang di-update adalah diri sendiri, langsung update localStorage
    if (currentUser && String(currentUser.id) === String(id)) {
      const updatedUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() }
      storage.set(STORAGE_KEYS.CURRENT_USER, updatedUser)
      
      // Update juga di list users (jika ada di local)
      const users = storage.get(STORAGE_KEYS.USERS) || []
      const index = users.findIndex(u => String(u.id) === String(id))
      if (index !== -1) {
        users[index] = updatedUser
        storage.set(STORAGE_KEYS.USERS, users)
      }
      return updatedUser
    }

    // Jika admin mengupdate user lain (butuh akses khusus)
    const users = await this.getAllUsers()
    const index = users.findIndex(user => String(user.id) === String(id))
    
    if (index === -1) {
      throw new Error('User tidak ditemukan atau akses terbatas')
    }

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    storage.set(STORAGE_KEYS.USERS, users)
    return users[index]
  },

  async updateProfile(id, profileData) {
    const currentUser = this.getCurrentUser()
    
    if (currentUser && String(currentUser.id) === String(id)) {
      const updatedUser = { 
        ...currentUser, 
        profile: { ...currentUser.profile, ...profileData },
        updatedAt: new Date().toISOString() 
      }
      storage.set(STORAGE_KEYS.CURRENT_USER, updatedUser)
      return updatedUser
    }

    const users = await this.getAllUsers()
    const index = users.findIndex(user => String(user.id) === String(id))
    
    if (index === -1) {
      throw new Error('User tidak ditemukan atau akses terbatas')
    }

    users[index].profile = {
      ...users[index].profile,
      ...profileData
    }
    users[index].updatedAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.USERS, users)
    return users[index]
  },

  async updateSaldo(id, saldoData) {
    const currentUser = this.getCurrentUser()
    
    if (currentUser && String(currentUser.id) === String(id)) {
      const updatedUser = { 
        ...currentUser, 
        saldo: { ...currentUser.saldo, ...saldoData },
        updatedAt: new Date().toISOString() 
      }
      storage.set(STORAGE_KEYS.CURRENT_USER, updatedUser)
      return updatedUser
    }

    const users = await this.getAllUsers()
    const index = users.findIndex(user => String(user.id) === String(id))
    
    if (index === -1) {
      throw new Error('User tidak ditemukan atau akses terbatas')
    }

    users[index].saldo = {
      ...users[index].saldo,
      ...saldoData
    }
    users[index].updatedAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.USERS, users)
    return users[index]
  },


  async login(email, password) {
    const user = await this.getUserByEmail(email)
    
    if (!user) {
      throw new Error('Email atau password salah')
    }

    if (user.password && !verifyPassword(password, user.password)) {
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

  async deleteUser(id) {
    const users = await this.getAllUsers()
    const filtered = users.filter(user => user.id !== id)
    storage.set(STORAGE_KEYS.USERS, filtered)
    return true
  }
}

