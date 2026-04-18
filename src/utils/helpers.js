export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const hashPassword = (password) => {
  return btoa(password)
}

export const verifyPassword = (password, hash) => {
  return btoa(password) === hash
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Baru saja'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Baru saja'
  
  const now = new Date()
  const diff = now - date
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  if (days < 7) return `${days} hari yang lalu`
  
  return formatDate(dateString)
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^(\+62|62|0)[0-9]{9,12}$/
  return re.test(phone)
}

export const sanitizeInput = (input) => {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const getFileSize = (base64String) => {
  const stringLength = base64String.length - 'data:image/png;base64,'.length
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812
  const sizeInKb = sizeInBytes / 1000
  const sizeInMb = sizeInKb / 1000
  return { bytes: sizeInBytes, kb: sizeInKb, mb: sizeInMb }
}

export const compressImage = (base64, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
  })
}
