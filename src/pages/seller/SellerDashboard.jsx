import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/helpers'
import { BUTTONS, SECTIONS } from '../../constants/copywriting'
import FullPageLoader from '../../components/common/FullPageLoader'

const SellerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          const products = await productService.getMyProducts()
          setStats({
            total: products.length,
            pending: products.filter(p => p.status === 'pending').length,
            approved: products.filter(p => p.status === 'approved').length,
            rejected: products.filter(p => p.status === 'rejected').length
          })
        } catch (error) {
          console.error('Gagal mengambil statistik produk:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  if (loading) return <FullPageLoader message="Memuat dasbor toko..." />

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Penjual
          </h1>
          <p className="text-gray-600">
            Halo, {user?.name || user?.profile?.nama || 'Juragan'}! Kelola barang jualan kamu di sini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Produk</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="text-red-600" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="text-red-600" size={40} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Saldo</h2>
              <DollarSign className="text-green-600" size={32} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">Saldo Ketahan</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(user?.saldo?.ketahan || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Bisa Ditarik</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(user?.saldo?.bisaDitarik || 0)}
                </span>
              </div>
            </div>
            <Button variant="success" fullWidth className="mt-4">
              {BUTTONS.withdraw}
            </Button>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/toko/pesanan">
                <Button fullWidth className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-transparent hover:border-amber-300">
                  Pesanan Toko / Transaksi
                </Button>
              </Link>
              <Link to="/toko/produk/tambah">
                <Button fullWidth>{BUTTONS.sell}</Button>
              </Link>
              <Link to="/toko/produk">
                <Button fullWidth variant="outline">{SECTIONS.myProducts}</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default SellerDashboard
