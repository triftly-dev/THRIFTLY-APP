import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import ProductCard from '../../components/common/ProductCard'
import Button from '../../components/common/Button'
import { productService } from '../../services/productService'
import { getCategories } from '../../constants/categories'
import { CONDITIONS } from '../../constants/conditions'
import { ALL_LOCATIONS } from '../../constants/locations'
import { EMPTY_STATES, BUTTONS } from '../../constants/copywriting'
import { useDebounce } from '../../hooks/useDebounce'
import FullPageLoader from '../../components/common/FullPageLoader'

const Accordion = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-gray-100 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600 transition-colors"
      >
        {title}
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {isOpen && <div className="mt-4 space-y-2">{children}</div>}
    </div>
  )
}

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const categories = getCategories()
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [isBU, setIsBU] = useState(searchParams.get('bu') === 'true')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getApprovedProducts()
        setProducts(data)
      } catch (error) {
        console.error('Gagal mengambil daftar produk:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(p => 
        p.nama.toLowerCase().includes(query) ||
        p.deskripsi.toLowerCase().includes(query)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.kategori === selectedCategory)
    }

    if (selectedCondition) {
      filtered = filtered.filter(p => p.kondisi === selectedCondition)
    }

    if (selectedLocation) {
      filtered = filtered.filter(p => p.lokasi === selectedLocation)
    }

    if (isBU) {
      filtered = filtered.filter(p => p.isBU)
    }

    setFilteredProducts(filtered)
  }, [products, debouncedSearch, selectedCategory, selectedCondition, selectedLocation, isBU])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedCondition('')
    setSelectedLocation('')
    setIsBU(false)
    setSearchParams({})
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedCondition || selectedLocation || isBU

  const SidebarContent = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filter Dulu</h2>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-accent-500 hover:text-accent-600 font-medium">
            Hapus Semua
          </button>
        )}
      </div>

      <Accordion title="Kategori">
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              checked={selectedCategory === ''} 
              onChange={() => setSelectedCategory('')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span className={`text-sm ${selectedCategory === '' ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>Semua Kategori</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category" 
                checked={selectedCategory === cat.id} 
                onChange={() => setSelectedCategory(cat.id)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className={`text-sm flex items-center gap-2 ${selectedCategory === cat.id ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                <span className="text-lg">{cat.icon}</span> {cat.nama}
              </span>
            </label>
          ))}
        </div>
      </Accordion>

      <Accordion title="Kondisi">
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="condition" 
              checked={selectedCondition === ''} 
              onChange={() => setSelectedCondition('')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span className={`text-sm ${selectedCondition === '' ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>Semua Kondisi</span>
          </label>
          {CONDITIONS.map(cond => (
            <label key={cond.id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="condition" 
                checked={selectedCondition === cond.id} 
                onChange={() => setSelectedCondition(cond.id)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className={`text-sm ${selectedCondition === cond.id ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{cond.label}</span>
            </label>
          ))}
        </div>
      </Accordion>

      <Accordion title="Lokasi">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        >
          <option value="">Semua Lokasi</option>
          {ALL_LOCATIONS.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.nama}</option>
          ))}
        </select>
      </Accordion>

      <Accordion title="Promo Spesial">
        <label className="flex items-center gap-3 cursor-pointer p-3 bg-accent-50 rounded-xl border border-accent-100">
          <input
            type="checkbox"
            checked={isBU}
            onChange={(e) => setIsBU(e.target.checked)}
            className="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-accent-800">Cuma Barang BU</span>
        </label>
      </Accordion>
    </div>
  )

  if (loading) return <FullPageLoader message="Mencari barang menarik..." />

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
      <Header />
      
      <div className="bg-gray-50 border-b border-gray-200 py-8">
        <Container className="py-0">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {isBU ? 'Barang BU (Butuh Uang)' : selectedCategory ? categories.find(c => c.id === selectedCategory)?.nama : 'Semua Produk'}
          </h1>
          <p className="text-gray-500 mt-2">
            Nemu {filteredProducts.length} barang nih
          </p>
        </Container>
      </div>

      <Container className="flex-1 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <div className="relative flex-1 mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari barang..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <Button variant="outline" onClick={() => setShowMobileFilters(true)} className="shrink-0">
              <Filter size={18} />
              Filter
            </Button>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="relative w-4/5 max-w-sm bg-white h-full overflow-y-auto p-6 shadow-xl">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"
                >
                  <X size={24} />
                </button>
                <SidebarContent />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <main className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Barang nggak ketemu</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">{EMPTY_STATES.noProducts}</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Hapus Semua Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

export default ProductList
