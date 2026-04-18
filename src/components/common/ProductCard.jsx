import { useNavigate } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import Badge from './Badge'
import { formatCurrency } from '../../utils/helpers'
import { getLocationName } from '../../constants/locations'
import { getCategoryById } from '../../constants/categories'
import { LABELS } from '../../constants/copywriting'

const ProductCard = ({ product }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/products/${product.id}`)
  }

  // Simulate a rating for the UI
  const rating = (4.0 + Math.random()).toFixed(1)
  const category = getCategoryById(product.kategori)

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-soft hover:shadow-soft-lg border border-gray-100 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full relative"
    >
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-lg" title={category?.nama}>
        {category?.icon}
      </div>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
        <img
          src={product.fotos[0]}
          alt={product.nama}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
          loading="lazy"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isBU && (
            <Badge variant="bu" size="sm">{LABELS.bu}</Badge>
          )}
          {product.hargaLama && (
            <Badge variant="discount" size="sm">{LABELS.discount}</Badge>
          )}
          {product.status === 'sold' && (
            <Badge variant="sold" size="sm">{LABELS.sold}</Badge>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 leading-snug">
            {product.nama}
          </h3>
        </div>

        <div className="mt-auto pt-3 space-y-3">
          <div>
            {product.hargaLama && (
              <p className="text-xs text-gray-400 line-through mb-0.5">
                {formatCurrency(product.hargaLama)}
              </p>
            )}
            <p className="text-lg font-bold text-primary-700">
              {formatCurrency(product.harga)}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <MapPin size={14} className="mr-1 text-gray-400" />
              <span className="truncate max-w-[100px]">{getLocationName(product.lokasi)}</span>
            </div>
            <div className="flex items-center text-accent-500 font-medium">
              <Star size={14} className="mr-1 fill-current" />
              <span>{rating}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
