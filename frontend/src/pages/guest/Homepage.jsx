import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, ChevronRight, Zap } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import ProductCard from '../../components/common/ProductCard'
import Button from '../../components/common/Button'
import { productService } from '../../services/productService'
import { getCategories } from '../../constants/categories'
import { SECTIONS, PLACEHOLDERS } from '../../constants/copywriting'
import FullPageLoader from '../../components/common/FullPageLoader'

const Homepage = () => {
  const navigate = useNavigate()
  const [buProducts, setBuProducts] = useState([])
  const [latestProducts, setLatestProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const categories = getCategories()

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const buData = await productService.getBUProducts()
        const latestData = await productService.getLatestProducts(8)
        setBuProducts(buData.slice(0, 4))
        setLatestProducts(latestData)
      } catch (error) {
        console.error('Gagal mengambil data produk:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (loading) return <FullPageLoader message="Memuat beranda Stuffus..." />

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop" 
            alt="Modern lifestyle tech and home objects" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto mt-16">
          <h1 className="text-[120px] md:text-[180px] font-black text-white/90 leading-none tracking-tighter mix-blend-overlay">
            SHOP
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 font-light tracking-wide -mt-8 md:-mt-12">
            Barang bekas berkualitas buat gaya hidup modern kamu.
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto transform translate-y-1/2">
            <div className="relative flex items-center bg-white rounded-full p-2 shadow-soft-lg">
              <div className="pl-4 text-gray-400">
                <Search size={24} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={PLACEHOLDERS.search}
                className="w-full px-4 py-3 bg-transparent border-none text-gray-900 text-lg focus:outline-none placeholder-gray-400"
              />
              <Button type="submit" size="lg" className="rounded-full px-8 py-3.5">
                Cari
              </Button>
            </div>
          </form>
        </div>
      </section>

      <Container className="pt-24 pb-16">
        {/* Categories */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{SECTIONS.categories}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group bg-gray-50 rounded-2xl p-6 text-center hover:bg-primary-50 transition-colors border border-gray-100"
              >
                <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{category.nama}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Hot Deals (BU) */}
        {buProducts.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-accent-100 p-2 rounded-lg text-accent-600">
                  <Zap size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{SECTIONS.buProducts}</h2>
              </div>
              <Link to="/products?bu=true" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 group">
                Lihat semua <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {buProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Recommendations Carousel */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{SECTIONS.popularProducts}</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {latestProducts.map((product) => (
              <div key={product.id} className="min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* CTA Panel */}
      <section className="bg-gray-900 py-20 px-4 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Siap Berburu Barang Baru?
          </h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg">
            Langganan newsletter kita biar nggak ketinggalan update barang-barang premium yang baru masuk.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Masukin email kamu" 
              className="flex-1 px-5 py-3.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <Button size="lg" className="rounded-xl whitespace-nowrap">
              Gas Langganan
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Homepage
