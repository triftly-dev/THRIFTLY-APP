import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Crosshair } from 'lucide-react'
import Button from './Button'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const MapPicker = ({ defaultLat, defaultLng, onLocationChange }) => {
  // Default to Jakarta if no coordinates are provided
  const center = [defaultLat || -6.200000, defaultLng || 106.816666]
  const [position, setPosition] = useState(defaultLat && defaultLng ? center : null)
  const [isLocating, setIsLocating] = useState(false)
  const mapRef = useRef(null)

  const handleLocationSelect = async (lat, lng) => {
    setPosition([lat, lng])
    try {
      // Create a reverse geocoding request to Nominatim OpenStreetMap
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      const data = await res.json()
      onLocationChange({ lat, lng, address: data.display_name })
    } catch (error) {
      console.error('Failed to reverse geocode', error)
      onLocationChange({ lat, lng, address: '' })
    }
  }

  const getCurrentLocation = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setPosition([latitude, longitude])
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 16)
          }
          handleLocationSelect(latitude, longitude)
          setIsLocating(false)
        },
        (error) => {
          console.error(error)
          alert('Gagal mengambil lokasi. Pastikan izin lokasi aktif.')
          setIsLocating(false)
        },
        { enableHighAccuracy: true }
      )
    } else {
      alert('Browser Anda tidak mendukung fitur lokasi.')
      setIsLocating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Tentukan Titik Pengiriman</label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={getCurrentLocation} 
          loading={isLocating}
          className="text-xs"
        >
          <Crosshair size={14} className="mr-1" /> Gunakan Lokasi Saat Ini
        </Button>
      </div>
      
      <div className="h-[300px] rounded-xl overflow-hidden border border-gray-300 relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 flex items-center">
        <MapPin size={12} className="mr-1" /> 
        Bisa geser peta atau klik di mana saja untuk memindahkan pin.
      </p>
    </div>
  )
}

export default MapPicker
