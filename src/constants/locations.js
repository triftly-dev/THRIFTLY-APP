export const JAWA_TENGAH = [
  { id: 'semarang', nama: 'Kota Semarang', provinsi: 'Jawa Tengah' },
  { id: 'surakarta', nama: 'Kota Surakarta (Solo)', provinsi: 'Jawa Tengah' },
  { id: 'salatiga', nama: 'Kota Salatiga', provinsi: 'Jawa Tengah' },
  { id: 'magelang-kota', nama: 'Kota Magelang', provinsi: 'Jawa Tengah' },
  { id: 'pekalongan-kota', nama: 'Kota Pekalongan', provinsi: 'Jawa Tengah' },
  { id: 'tegal-kota', nama: 'Kota Tegal', provinsi: 'Jawa Tengah' },
  { id: 'banyumas', nama: 'Kab. Banyumas', provinsi: 'Jawa Tengah' },
  { id: 'cilacap', nama: 'Kab. Cilacap', provinsi: 'Jawa Tengah' },
  { id: 'purbalingga', nama: 'Kab. Purbalingga', provinsi: 'Jawa Tengah' },
  { id: 'banjarnegara', nama: 'Kab. Banjarnegara', provinsi: 'Jawa Tengah' },
  { id: 'kebumen', nama: 'Kab. Kebumen', provinsi: 'Jawa Tengah' },
  { id: 'purworejo', nama: 'Kab. Purworejo', provinsi: 'Jawa Tengah' },
  { id: 'wonosobo', nama: 'Kab. Wonosobo', provinsi: 'Jawa Tengah' },
  { id: 'magelang', nama: 'Kab. Magelang', provinsi: 'Jawa Tengah' },
  { id: 'boyolali', nama: 'Kab. Boyolali', provinsi: 'Jawa Tengah' },
  { id: 'klaten', nama: 'Kab. Klaten', provinsi: 'Jawa Tengah' },
  { id: 'sukoharjo', nama: 'Kab. Sukoharjo', provinsi: 'Jawa Tengah' },
  { id: 'wonogiri', nama: 'Kab. Wonogiri', provinsi: 'Jawa Tengah' },
  { id: 'karanganyar', nama: 'Kab. Karanganyar', provinsi: 'Jawa Tengah' },
  { id: 'sragen', nama: 'Kab. Sragen', provinsi: 'Jawa Tengah' },
  { id: 'grobogan', nama: 'Kab. Grobogan', provinsi: 'Jawa Tengah' },
  { id: 'blora', nama: 'Kab. Blora', provinsi: 'Jawa Tengah' },
  { id: 'rembang', nama: 'Kab. Rembang', provinsi: 'Jawa Tengah' },
  { id: 'pati', nama: 'Kab. Pati', provinsi: 'Jawa Tengah' },
  { id: 'kudus', nama: 'Kab. Kudus', provinsi: 'Jawa Tengah' },
  { id: 'jepara', nama: 'Kab. Jepara', provinsi: 'Jawa Tengah' },
  { id: 'demak', nama: 'Kab. Demak', provinsi: 'Jawa Tengah' },
  { id: 'semarang-kab', nama: 'Kab. Semarang', provinsi: 'Jawa Tengah' },
  { id: 'temanggung', nama: 'Kab. Temanggung', provinsi: 'Jawa Tengah' },
  { id: 'kendal', nama: 'Kab. Kendal', provinsi: 'Jawa Tengah' },
  { id: 'batang', nama: 'Kab. Batang', provinsi: 'Jawa Tengah' },
  { id: 'pekalongan', nama: 'Kab. Pekalongan', provinsi: 'Jawa Tengah' },
  { id: 'pemalang', nama: 'Kab. Pemalang', provinsi: 'Jawa Tengah' },
  { id: 'tegal', nama: 'Kab. Tegal', provinsi: 'Jawa Tengah' },
  { id: 'brebes', nama: 'Kab. Brebes', provinsi: 'Jawa Tengah' }
]

export const DIY = [
  { id: 'yogyakarta', nama: 'Kota Yogyakarta', provinsi: 'DI Yogyakarta' },
  { id: 'sleman', nama: 'Kab. Sleman', provinsi: 'DI Yogyakarta' },
  { id: 'bantul', nama: 'Kab. Bantul', provinsi: 'DI Yogyakarta' },
  { id: 'kulon-progo', nama: 'Kab. Kulon Progo', provinsi: 'DI Yogyakarta' },
  { id: 'gunung-kidul', nama: 'Kab. Gunung Kidul', provinsi: 'DI Yogyakarta' }
]

export const ALL_LOCATIONS = [...JAWA_TENGAH, ...DIY]

export const getLocationById = (id) => {
  return ALL_LOCATIONS.find(loc => loc.id === id)
}

export const getLocationName = (id) => {
  const location = getLocationById(id)
  return location ? location.nama : 'Lokasi Tidak Diketahui'
}

export const getLocationsByProvinsi = (provinsi) => {
  if (provinsi === 'Jawa Tengah') return JAWA_TENGAH
  if (provinsi === 'DI Yogyakarta') return DIY
  return ALL_LOCATIONS
}
