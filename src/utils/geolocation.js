import { ALL_LOCATIONS } from '../constants/locations'

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung oleh browser kamu'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let errorMessage = 'Gagal mendapatkan lokasi'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Izinkan akses lokasi di browser kamu ya!'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia'
            break
          case error.TIMEOUT:
            errorMessage = 'Request lokasi timeout'
            break
        }
        
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

const LOCATION_COORDINATES = {
  'semarang': { lat: -6.9667, lng: 110.4167 },
  'surakarta': { lat: -7.5667, lng: 110.8167 },
  'salatiga': { lat: -7.3317, lng: 110.4917 },
  'magelang-kota': { lat: -7.4797, lng: 110.2178 },
  'pekalongan-kota': { lat: -6.8886, lng: 109.6753 },
  'tegal-kota': { lat: -6.8694, lng: 109.1403 },
  'yogyakarta': { lat: -7.7956, lng: 110.3695 },
  'sleman': { lat: -7.7056, lng: 110.3539 },
  'bantul': { lat: -7.8881, lng: 110.3289 },
  'kulon-progo': { lat: -7.8211, lng: 110.1586 },
  'gunung-kidul': { lat: -7.9608, lng: 110.5881 }
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const reverseGeocode = (latitude, longitude) => {
  let closestLocation = null
  let minDistance = Infinity

  for (const [locationId, coords] of Object.entries(LOCATION_COORDINATES)) {
    const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng)
    
    if (distance < minDistance) {
      minDistance = distance
      closestLocation = locationId
    }
  }

  if (closestLocation && minDistance < 100) {
    const location = ALL_LOCATIONS.find(loc => loc.id === closestLocation)
    return location || null
  }

  if (latitude >= -8.5 && latitude <= -6.5 && longitude >= 109 && longitude <= 111) {
    return ALL_LOCATIONS.find(loc => loc.id === 'semarang')
  }

  return null
}

export const getLocationFromCoordinates = async () => {
  try {
    const position = await getCurrentPosition()
    const location = reverseGeocode(position.latitude, position.longitude)
    
    if (!location) {
      throw new Error('Lokasi kamu di luar jangkauan Jawa Tengah dan DIY')
    }

    return {
      ...position,
      location
    }
  } catch (error) {
    throw error
  }
}

export const isLocationInServiceArea = (latitude, longitude) => {
  if (latitude >= -8.5 && latitude <= -6.5 && longitude >= 109 && longitude <= 111) {
    return true
  }
  return false
}
