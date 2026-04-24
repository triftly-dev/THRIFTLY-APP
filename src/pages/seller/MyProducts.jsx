import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, Trash2 } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/helpers'
import { STATUS } from '../../constants/copywriting'
import toast from 'react-hot-toast'

const MyProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      if (user) {
        try {
          const data = await productService.getMyProducts()
          setProducts(data)
        } catch (error) {
          toast.error('Gagal mengambil daftar produk')
        }
      }
    }
    fetchProducts()
  }, [user])

  const handleDelete = async (id) => {
    if (window.confirm('Yakin mau hapus produk ini?')) {
      try {
        await productService.deleteProduct(id)
        setProducts(products.filter(p => p.id !== id))
        toast.success('Produk berhasil dihapus')
      } catch (error) {
        toast.error('Gagal menghapus produk')
      }
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    }
    return <Badge variant={variants[status]}>{STATUS[status]}</Badge>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Produk Saya</h1>
          <Link to="/toko/produk/tambah">
            <Button>Tambah Produk</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex gap-4">
                <img
                  src={product.fotos[0]}
                  alt={product.nama}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{product.nama}</h3>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {formatCurrency(product.harga)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/toko/produk/edit/${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    {product.stok <= 0 ? (
                      <Badge variant="error" className="bg-rose-100 text-rose-700">Stok Habis</Badge>
                    ) : (
                      <>
                        {getStatusBadge(product.status)}
                        <Badge variant="info">Stok: {product.stok}</Badge>
                      </>
                    )}
                    {product.isBU && <Badge variant="bu">BU</Badge>}
                  </div>
                  
                  {product.adminNote && (
                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Catatan Admin:</p>
                      <p className="text-sm text-gray-600">{product.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default MyProducts
