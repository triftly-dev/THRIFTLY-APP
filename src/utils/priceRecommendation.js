import { productService } from '../services/productService'

export const getPriceRecommendation = async (kategori, kondisi) => {
  const products = await productService.getApprovedProducts()
  
  const similarProducts = products.filter(product => 
    product.kategori === kategori && product.kondisi === kondisi
  )

  if (similarProducts.length === 0) {
    return getDefaultPriceRange(kategori, kondisi)
  }

  const prices = similarProducts.map(product => product.harga).sort((a, b) => a - b)
  
  const median = prices.length % 2 === 0
    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
    : prices[Math.floor(prices.length / 2)]

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length

  return {
    recommended: Math.round(median),
    min: Math.round(min),
    max: Math.round(max),
    avg: Math.round(avg),
    count: similarProducts.length
  }
}

const getDefaultPriceRange = (kategori, kondisi) => {
  const baseRanges = {
    'elektronik-gadget': { min: 500000, max: 10000000 },
    'fashion-aksesoris': { min: 50000, max: 1000000 },
    'kendaraan': { min: 5000000, max: 50000000 },
    'rumah-tangga': { min: 100000, max: 5000000 },
    'hobi-olahraga': { min: 100000, max: 3000000 },
    'buku-alat-tulis': { min: 10000, max: 200000 }
  }

  const conditionMultiplier = {
    'like-new': 0.8,
    'bagus': 0.6,
    'oke': 0.4
  }

  const range = baseRanges[kategori] || { min: 50000, max: 1000000 }
  const multiplier = conditionMultiplier[kondisi] || 0.5

  const min = Math.round(range.min * multiplier)
  const max = Math.round(range.max * multiplier)
  const recommended = Math.round((min + max) / 2)

  return {
    recommended,
    min,
    max,
    avg: recommended,
    count: 0
  }
}

export const formatPriceRecommendation = (recommendation) => {
  if (recommendation.count === 0) {
    return {
      message: 'Belum ada data harga untuk kategori ini. Ini estimasi harga pasaran:',
      range: `Rp ${recommendation.min.toLocaleString('id-ID')} - Rp ${recommendation.max.toLocaleString('id-ID')}`,
      recommended: `Rp ${recommendation.recommended.toLocaleString('id-ID')}`
    }
  }

  return {
    message: `Berdasarkan ${recommendation.count} produk serupa yang terjual:`,
    range: `Rp ${recommendation.min.toLocaleString('id-ID')} - Rp ${recommendation.max.toLocaleString('id-ID')}`,
    recommended: `Rp ${recommendation.recommended.toLocaleString('id-ID')}`
  }
}

export const isPriceReasonable = (price, kategori, kondisi) => {
  const recommendation = getPriceRecommendation(kategori, kondisi)
  
  if (price < recommendation.min * 0.5) {
    return {
      reasonable: false,
      message: 'Harga terlalu murah. Apa kamu yakin?'
    }
  }

  if (price > recommendation.max * 1.5) {
    return {
      reasonable: false,
      message: 'Harga terlalu mahal. Mungkin susah laku nih.'
    }
  }

  if (price >= recommendation.min && price <= recommendation.max) {
    return {
      reasonable: true,
      message: 'Harga pas! Kemungkinan cepet laku.'
    }
  }

  return {
    reasonable: true,
    message: 'Harga masih wajar kok.'
  }
}
