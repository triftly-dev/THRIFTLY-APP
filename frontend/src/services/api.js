import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.thriftly.my.id/api',
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

export default api
