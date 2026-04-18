import axios from 'axios'

const api = axios.create({
  baseURL: 'http://13.211.219.19/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Pasang Interceptor untuk selalu membawa Bearer Token (Sanctum) yang tersimpan
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Pasang Interceptor untuk menangani error respons secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika Unauthorized, hapus data auth karena token sudah tidak valid
      localStorage.removeItem('token')
      localStorage.removeItem('user_profile')
      
      // Opsional: Redirect ke login atau reload halaman untuk reset state aplikasi
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
