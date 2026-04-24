import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Package, ShoppingBag, Settings, MapPin } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import MapPicker from '../../components/common/MapPicker'
import UserSidebar from '../../components/layout/UserSidebar'
import { useAuth } from '../../context/AuthContext'

const BuyerDashboard = () => {
  const { user, updateProfile } = useAuth()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newAlamat, setNewAlamat] = useState('')
  const [newLokasi, setNewLokasi] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateAlamat = async () => {
    if (!newAlamat.trim()) return
    setIsUpdating(true)
    await updateProfile({ 
      alamat: newAlamat.trim(),
      lokasi: newLokasi 
    })
    setIsUpdating(false)
    setIsEditModalOpen(false)
  }

  const parseLokasi = (lokasiString) => {
    if (!lokasiString || !lokasiString.includes(',')) return { lat: null, lng: null }
    const parts = lokasiString.split(',')
    return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) }
  }
  
  const currentCoords = parseLokasi(user?.lokasi || user?.profile?.lokasi)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar dengan Gradiasi */}
            <UserSidebar />

            <div className="flex-1">
              <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl border-2 border-white shadow-sm">
                    {user?.profile?.nama?.charAt(0).toUpperCase() || 'B'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Halo, {user?.profile?.nama || 'Bosku'}!
                    </h1>
                    <p className="text-gray-500">Selamat datang di dashboard belanja Anda.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/user/pesanan" className="group p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all bg-white flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Pesanan Saya</h3>
                      <p className="text-sm text-gray-500">Pantau status pesanan dan riwayat belanja Anda.</p>
                    </div>
                  </Link>

                  <Link to="/products" className="group p-6 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all bg-white flex items-start gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Mulai Belanja</h3>
                      <p className="text-sm text-gray-500">Eksplorasi ribuan barang bekas berkualitas.</p>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings size={20} className="text-gray-400" /> Pengaturan Profil
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1"><MapPin size={14} /> Alamat Pengiriman</p>
                        <p className="font-medium text-gray-900">{user?.alamat || user?.profile?.alamat || 'Belum diatur'}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setNewAlamat(user?.alamat || user?.profile?.alamat || '')
                        setNewLokasi(user?.lokasi || user?.profile?.lokasi || '')
                        setIsEditModalOpen(true)
                      }}>Edit Alamat</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* Edit Alamat Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Ubah Alamat Pengiriman" 
        size="md"
      >
        <div className="space-y-4">
          <MapPicker 
            defaultLat={currentCoords.lat} 
            defaultLng={currentCoords.lng}
            onLocationChange={(loc) => {
              setNewLokasi(`${loc.lat},${loc.lng}`)
              if (loc.address) setNewAlamat(loc.address)
            }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan / Detail Alamat
            </label>
            <textarea
              value={newAlamat}
              onChange={(e) => setNewAlamat(e.target.value)}
              placeholder="Detail tambahan seperti blok rumah, warna pagar..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
            <Button onClick={handleUpdateAlamat} isLoading={isUpdating} disabled={isUpdating}>
              Simpan Alamat
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}

export default BuyerDashboard
