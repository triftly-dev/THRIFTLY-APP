import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, X, MapPin, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { getCategories } from '../../constants/categories'
import { CONDITIONS } from '../../constants/conditions'
import { ALL_LOCATIONS } from '../../constants/locations'
import { useImageUpload } from '../../hooks/useImageUpload'
import { formatCurrency } from '../../utils/helpers'

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { images, setImages, handleImageUpload, removeImage, isUploading } = useImageUpload(5)
  const categories = getCategories()

  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    kategori: '',
    kondisi: '',
    deskripsi: '',
    lokasi: '',
    isBU: false,
    stok: 1
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id)
        if (!data) {
          toast.error('Produk tidak ditemukan')
          navigate('/toko/produk')
          return
        }
        
        let ownerId = data.sellerId || data.user_id;
        if (ownerId !== user.id && user.role !== 'admin') {
          toast.error('Anda tidak memiliki akses ke produk ini')
          navigate('/toko/produk')
          return
        }

        setProduct(data)
        setFormData({
          nama: data.nama,
          harga: data.harga.toString(),
          kategori: data.kategori,
          kondisi: data.kondisi,
          deskripsi: data.deskripsi,
          lokasi: data.lokasi || data.location,
          isBU: data.isBU || data.is_bu || false,
          stok: data.stok || data.stock || 1
        })
        setImages(data.fotos || [])
      } catch (error) {
        toast.error('Gagal memuat data produk')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, user.id, navigate, setImages])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (images.length === 0) {
      toast.error('Minimal upload 1 foto produk')
      return
    }

    setIsSubmitting(true)
    
    try {
      const updates = {
        ...formData,
        harga: parseInt(formData.harga),
        fotos: images,
      }

      productService.updateProduct(id, updates)
      toast.success('Produk berhasil diupdate!')
      navigate('/toko/produk')
    } catch (error) {
      toast.error(error.message || 'Gagal mengupdate produk')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <Container className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-primary-50 p-4 rounded-3xl animate-bounce shadow-soft mb-6 border border-primary-100">
              <ShoppingBag className="text-primary-600 w-12 h-12" />
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Menyiapkan form...</p>
          </div>
        </Container>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-3xl">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/toko/produk')}
              className="flex items-center text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Kembali ke Produk Saya
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
              <p className="text-gray-500 mt-1">Perbarui informasi produk Anda di bawah ini.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Foto Produk */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Foto Produk <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500">Format: JPG, PNG. Maksimal 5 foto.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                      <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-500 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-primary-50 transition-colors">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Upload</span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Informasi Dasar */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Informasi Produk</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Contoh: iPhone 13 Pro Max 256GB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="harga"
                    value={formData.harga}
                    onChange={handleChange}
                    required
                    min="1000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Contoh: 15000000"
                  />
                  {formData.harga && (
                    <p className="text-sm text-gray-500 mt-1">
                      Format: {formatCurrency(parseInt(formData.harga))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Contoh: 1"
                  />
                </div>
              </div>

              {/* Detail Produk */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Detail Produk</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kondisi <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kondisi"
                      value={formData.kondisi}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                    >
                      <option value="">Pilih Kondisi</option>
                      {CONDITIONS.map(cond => (
                        <option key={cond.id} value={cond.id}>{cond.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasi Barang <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      name="lokasi"
                      value={formData.lokasi}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                    >
                      <option value="">Pilih Lokasi</option>
                      {ALL_LOCATIONS.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Produk <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                    placeholder="Jelaskan kondisi barang, kelengkapan, minus (jika ada), dan alasan dijual..."
                  ></textarea>
                </div>
              </div>

              {/* Opsi Tambahan */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Opsi Tambahan</h3>
                
                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      name="isBU"
                      checked={formData.isBU}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <span className="block font-medium text-gray-900">Tandai sebagai "Butuh Uang" (BU)</span>
                    <span className="block text-sm text-gray-500 mt-1">
                      Barang akan mendapatkan badge khusus dan masuk ke kategori pencarian prioritas. Cocok untuk barang yang ingin cepat laku.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  fullWidth 
                  onClick={() => navigate('/toko/produk')}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isSubmitting || isUploading}
                  disabled={isSubmitting || isUploading}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

export default EditProduct