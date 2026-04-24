import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../context/AuthContext'
import { transactionService } from '../../services/transactionService'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MyOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Semua')
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedOrderIdToComplete, setSelectedOrderIdToComplete] = useState(null)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'Belum Bayar': return order.status === 'pending'
      case 'Disiapkan': return order.status === 'paid'
      case 'Dikirim': return order.status === 'shipped'
      case 'Selesai': return order.status === 'completed'
      case 'Ditolak': return order.status === 'retur' || order.status === 'canceled' || order.status === 'failed'
      default: return true
    }
  })

  const loadOrders = async () => {
    try {
      const userOrders = await transactionService.getTransactionsByBuyer(user.id)
      
      // Enrich orders with product and seller data
      const enrichedOrders = await Promise.all(userOrders.map(async (order) => {
        let product = null;
        let seller = null;
        try {
          product = await productService.getProductById(order.productId)
        } catch(e) {}
        try {
          seller = await userService.getUserById(order.sellerId)
        } catch(e) {}
        
        return {
          ...order,
          product,
          seller
        }
      }))
      
      enrichedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      setOrders(enrichedOrders)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelesaikanPesanan = (id) => {
    setSelectedOrderIdToComplete(id)
    setIsCompleteModalOpen(true)
  }

  const confirmSelesaikanPesanan = () => {
    if (selectedOrderIdToComplete) {
      try {
        transactionService.markAsCompleted(selectedOrderIdToComplete)
        toast.success('Pesanan selesai! Terima kasih.')
        loadOrders()
      } catch (error) {
        toast.error('Gagal menyelesaikan pesanan')
      } finally {
        setIsCompleteModalOpen(false)
        setSelectedOrderIdToComplete(null)
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Menunggu Pembayaran</Badge>
      case 'paid':
        return <Badge variant="info">Dikemas Penjual</Badge>
      case 'shipped':
        return <Badge variant="primary">Sedang Dikirim</Badge>
      case 'completed':
        return <Badge variant="success">Selesai</Badge>
      case 'retur':
        return <Badge variant="error">Diretur</Badge>
      default:
        return <Badge>{status}</Badge>
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
            <p className="text-gray-500 font-medium animate-pulse">Memuat pesanan...</p>
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
        <Container maxWidth="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>

          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
            {['Semua', 'Belum Bayar', 'Disiapkan', 'Dikirim', 'Selesai', 'Ditolak'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  activeTab === tab
                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-soft border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pesanan nih</h2>
              <p className="text-gray-500 mb-6">Yuk mulai cari barang-barang menarik di Stuffus!</p>
              <Button onClick={() => window.location.href = '/products'}>Mulai Belanja</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">Belanja dari {order.seller?.name || order.seller?.profile?.nama || 'Penjual'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                      <img 
                        src={order.product?.fotos?.[0] || 'https://via.placeholder.com/150'} 
                        alt={order.product?.nama} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{order.product?.nama || 'Produk tidak tersedia'}</h3>
                      <p className="text-sm text-gray-500 mb-2">Total Belanja</p>
                      <p className="font-bold text-primary-700">{formatCurrency(order.hargaFinal + order.ongkir + 2500)}</p>
                    </div>
                  </div>

                  {order.status === 'shipped' && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-4 flex items-start gap-3 border border-blue-100">
                      <Clock className="text-blue-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Barang sedang dalam perjalanan</p>
                        <p className="text-xs text-blue-700 mt-1">Silakan klik "Selesaikan Pesanan" jika barang sudah diterima dengan baik.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => window.location.href = `/chat?product=${order.productId}&user=${order.sellerId}`}>
                      Chat Penjual
                    </Button>
                    {order.status === 'shipped' && (
                      <Button onClick={() => handleSelesaikanPesanan(order.id)}>
                        Selesaikan Pesanan
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <Button variant="secondary" onClick={() => window.location.href = `/products/${order.productId}`}>
                        Beli Lagi
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />

      {/* Tailwind Confirm Modal */}
      <Modal 
        isOpen={isCompleteModalOpen} 
        onClose={() => setIsCompleteModalOpen(false)} 
        title="Selesaikan Pesanan"
        size="sm"
      >
        <div className="text-center pb-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <p className="text-gray-700 text-lg mb-6">Pastikan barang sudah diterima dengan baik dan sesuai. Dana akan diteruskan ke penjual. Lanjutkan?</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)} className="px-6">Batal</Button>
            <Button variant="success" onClick={confirmSelesaikanPesanan} className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white border-none">Ya, Selesaikan</Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default MyOrders