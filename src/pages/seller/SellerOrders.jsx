import { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle2, AlertCircle, ShoppingBag, Truck, XCircle, TrendingUp } from 'lucide-react'
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

const SellerOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Semua')
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState(null)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      const sellerOrders = await transactionService.getTransactionsBySeller(user.id)
      
      // Enrich orders with product and buyer data asynchronously
      const enrichedOrders = await Promise.all(sellerOrders.map(async (order) => {
        let product = null;
        let buyer = null;
        try {
          product = await productService.getProductById(order.productId)
        } catch(e) {}
        try {
          buyer = await userService.getUserById(order.buyerId)
        } catch(e) {}
        
        return {
          ...order,
          product,
          buyer
        }
      }))
      
      enrichedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(enrichedOrders)
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKirimBarang = (id) => {
    try {
      transactionService.markAsShipped(id, 'https://example.com/video') // Simulasi aja
      toast.success('Status diubah menjadi Dikirim!')
      loadOrders()
    } catch (error) {
      toast.error('Gagal memproses pesanan')
    }
  }

  const handleBatalkan = (id) => {
    setSelectedOrderIdToCancel(id)
    setIsCancelModalOpen(true)
  }

  const confirmBatalkan = () => {
    if (selectedOrderIdToCancel) {
      try {
        const transactions = transactionService.getAllTransactions()
        const index = transactions.findIndex(t => t.id === selectedOrderIdToCancel)
        if (index > -1) {
          transactions[index].status = 'retur' // Kita anggap retur/batal
          transactionService.getAllTransactions = () => transactions; // hack for memory mock
          localStorage.setItem('secondnesia_transactions', JSON.stringify(transactions))
        }
        toast.success('Pesanan dibatalkan.')
        loadOrders()
      } catch (error) {
        toast.error('Gagal membatalkan pesanan')
      } finally {
        setIsCancelModalOpen(false)
        setSelectedOrderIdToCancel(null)
      }
    }
  }

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'Perlu Diproses': return order.status === 'paid'
      case 'Telah Diproses': return order.status === 'shipped' || order.status === 'completed'
      case 'Pembatalan': return order.status === 'retur' || order.status === 'canceled'
      default: return true
    }
  })

  // Calculate Stats
  const statPerluDiproses = orders.filter(o => o.status === 'paid').length
  const statTelahDiproses = orders.filter(o => o.status === 'shipped' || o.status === 'completed').length
  const statPembatalan = orders.filter(o => o.status === 'retur' || o.status === 'canceled').length
  const statPendapatan = orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + curr.hargaFinal, 0)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Menunggu Pembayaran</Badge>
      case 'paid': return <Badge variant="info">Perlu Dikirim</Badge>
      case 'shipped': return <Badge variant="primary">Sedang Dikirim</Badge>
      case 'completed': return <Badge variant="success">Selesai</Badge>
      case 'retur': return <Badge variant="error">Dibatalkan/Retur</Badge>
      default: return <Badge>{status}</Badge>
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
        <Container maxWidth="max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu Transaksi (Orderan)</h1>

          {/* Stats Summary like Shopee */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 text-center cursor-pointer hover:border-primary-300 transition-colors" onClick={() => setActiveTab('Perlu Diproses')}>
              <div className="text-3xl font-black text-primary-600 mb-2">{statPerluDiproses}</div>
              <div className="text-sm font-medium text-gray-600">Pengiriman Perlu Diproses</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 text-center cursor-pointer hover:border-primary-300 transition-colors" onClick={() => setActiveTab('Telah Diproses')}>
              <div className="text-3xl font-black text-primary-600 mb-2">{statTelahDiproses}</div>
              <div className="text-sm font-medium text-gray-600">Pengiriman Telah Diproses</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 text-center cursor-pointer hover:border-rose-300 transition-colors" onClick={() => setActiveTab('Pembatalan')}>
              <div className="text-3xl font-black text-rose-600 mb-2">{statPembatalan}</div>
              <div className="text-sm font-medium text-gray-600">Pengembalian/Pembatalan</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 text-center">
              <div className="text-xl font-black text-emerald-600 mb-2 mt-2">{formatCurrency(statPendapatan)}</div>
              <div className="text-sm font-medium text-gray-600">Total Pendapatan Sukses</div>
            </div>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 border-b border-gray-200">
            {['Semua', 'Perlu Diproses', 'Telah Diproses', 'Pembatalan'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-soft border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Belum ada orderan di kategori ini</h2>
              <p className="text-gray-500">Terus promosikan produkmu agar laris manis!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">Pembeli: {order.buyer?.name || order.buyer?.profile?.nama || 'Anonymous'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                      <img 
                        src={order.product?.fotos?.[0] || 'https://via.placeholder.com/150'} 
                        alt={order.product?.nama} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{order.product?.nama || 'Produk tidak tersedia'}</h3>
                      <p className="text-sm text-gray-500 mb-2">Tagihan Dibayar Pembeli</p>
                      <p className="font-bold text-primary-700">{formatCurrency(order.hargaFinal + order.ongkir + 2500)}</p>
                    </div>
                  </div>

                  {order.status === 'paid' && (
                    <div className="bg-amber-50 rounded-xl p-4 mb-4 flex items-start gap-3 border border-amber-100">
                      <Clock className="text-amber-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Pembeli sudah membayar</p>
                        <p className="text-xs text-amber-700 mt-1">Segera kirimkan barang dan masukkan layanan pengiriman.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={() => window.location.href = `/chat?product=${order.productId}&user=${order.buyerId}`}>
                      Chat Pembeli
                    </Button>
                    
                    {order.status === 'paid' && (
                      <Button onClick={() => handleKirimBarang(order.id)}>
                        Kirim Barang Sekarang
                      </Button>
                    )}
                    
                    {order.status === 'pending' && (
                      <Button variant="danger" onClick={() => handleBatalkan(order.id)}>
                        Batalkan Order
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

      {/* Tailwind Cancel Modal */}
      <Modal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        title="Batalkan Pesanan"
        size="sm"
      >
        <div className="text-center pb-4">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-rose-500" />
          </div>
          <p className="text-gray-700 text-lg mb-6">Yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} className="px-6">Kembali</Button>
            <Button variant="danger" onClick={confirmBatalkan} className="px-6 bg-rose-600 hover:bg-rose-700 text-white">Ya, Batalkan</Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default SellerOrders
