import { useEffect, useState } from 'react'
import { Eye, Edit, CheckCircle, Trash2, X } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    sold: 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const labels = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    sold: 'Terjual'
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}

const ApprovalQueue = () => {
  const { refreshProducts } = useApp()
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [productToApprove, setProductToApprove] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      // Fetch both products and users concurrently instead of sequentially
      const [allProducts, allUsers] = await Promise.all([
        productService.getAllProducts(),
        userService.getAllUsers()
      ])
      
      // Enrich with seller info
      const enrichedProducts = allProducts.map(p => {
        const sellerIdToMatch = p.sellerId || p.user_id
        const seller = allUsers.find(u => u.id === sellerIdToMatch)
        
        return {
          ...p,
          sellerName: seller?.name || seller?.profile?.nama || 'Penjual Tidak Diketahui',
          sellerEmail: seller?.email || ''
        }
      })
      
      setProducts(enrichedProducts.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)))
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveClick = (product) => {
    setProductToApprove(product)
    setShowApproveModal(true)
  }

  const handleApproveConfirm = async () => {
    if (productToApprove) {
      try {
        await productService.approveProduct(productToApprove.id, 'Disetujui oleh admin')
        toast.success('Produk berhasil disetujui')
        setShowApproveModal(false)
        setProductToApprove(null)
        loadProducts()
        refreshProducts()
      } catch (err) {
        toast.error('Gagal menyetujui produk')
      }
    }
  }

  const handleRejectClick = (product) => {
    setSelectedProduct(product)
    setShowRejectModal(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectNote.trim()) {
      toast.error('Mohon isi alasan penolakan')
      return
    }
    try {
      await productService.rejectProduct(selectedProduct.id, rejectNote)
      toast.success('Produk berhasil ditolak')
      setShowRejectModal(false)
      setRejectNote('')
      setSelectedProduct(null)
      loadProducts()
      refreshProducts()
    } catch (err) {
      toast.error('Gagal menolak produk')
    }
  }

  const handleDelete = async (product) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${product.nama}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await productService.deleteProduct(product.id)
        toast.success('Produk berhasil dihapus')
        loadProducts()
        refreshProducts()
      } catch (err) {
        toast.error('Gagal menghapus produk')
      }
    }
  }

  const columns = [
    {
      header: 'Produk',
      accessor: 'nama',
      className: 'w-1/3',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img src={row.fotos[0]} alt={row.nama} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-gray-900 line-clamp-1">{row.nama}</p>
            <p className="text-xs text-gray-500 mt-0.5">ID: {row.id.toString().substring(0, 8)}...</p>
          </div>
        </div>
      )
    },
    {
      header: 'Info Penjual',
      accessor: 'sellerName',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.sellerName}</p>
          <p className="text-xs text-gray-500">{row.sellerEmail}</p>
        </div>
      )
    },
    {
      header: 'Harga',
      accessor: 'harga',
      render: (row) => (
        <span className="font-medium text-gray-900">{formatCurrency(row.harga)}</span>
      )
    },
    {
      header: 'Tanggal',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-gray-600">{formatDate(row.created_at || row.createdAt)}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Aksi',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => window.open(`/products/${row.id}`, '_blank')}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <Eye size={18} />
          </button>
          
          {row.status === 'pending' && (
            <>
              <button 
                onClick={() => handleApproveClick(row)}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Setujui"
              >
                <CheckCircle size={18} />
              </button>
              <button 
                onClick={() => handleRejectClick(row)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Tolak"
              >
                <X size={18} />
              </button>
            </>
          )}
          
          <button 
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          
          <button 
            onClick={() => handleDelete(row)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Produk</h1>
        <p className="text-gray-500 mt-1">Tinjau, setujui, atau kelola semua produk di marketplace.</p>
      </div>

      <DataTable 
        title="Semua Produk"
        columns={columns}
        data={products}
        itemsPerPage={8}
        isLoading={isLoading}
      />

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setRejectNote('')
        }}
        title="Tolak Produk"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
            <h4 className="font-medium text-rose-800 mb-1">Anda akan menolak:</h4>
            <p className="text-sm text-rose-600">{selectedProduct?.nama}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan penolakan
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm resize-none"
              placeholder="Contoh: Foto terlalu buram, mohon unggah ulang foto produk yang lebih jelas."
            />
            <p className="text-xs text-gray-500 mt-2">Catatan ini akan dikirimkan kepada penjual.</p>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false)
                setRejectNote('')
              }}
            >
              Batal
            </Button>
            <Button 
              variant="danger" 
              className="flex-1"
              onClick={handleRejectSubmit}
            >
              Konfirmasi Tolak
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false)
          setProductToApprove(null)
        }}
        title="Setujui Produk"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            <p className="text-sm">
              Apakah Anda yakin ingin menyetujui <strong>{productToApprove?.nama}</strong>?<br/>
              Produk ini akan langsung terlihat oleh semua pembeli di marketplace.
            </p>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                setShowApproveModal(false)
                setProductToApprove(null)
              }}
            >
              Batal
            </Button>
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
              onClick={handleApproveConfirm}
            >
              Setujui
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default ApprovalQueue
