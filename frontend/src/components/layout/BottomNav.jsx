import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ShoppingBag, Package, MessageCircle, User, PlusCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const BottomNav = () => {
  const { user, isBuyer, isSeller, isAdmin } = useAuth()
  const { unreadCount } = useApp()
  const location = useLocation()

  // Hide bottom nav on admin routes, auth routes, and specific full-screen pages if needed
  const hiddenRoutes = ['/admin', '/login', '/register']
  if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
    return null
  }

  const getNavItems = () => {
    // Guest Items
    if (!user) {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Cari', path: '/products' },
        { icon: User, label: 'Masuk', path: '/login' }
      ]
    }

    // Logged In User Items (Unified)
    if (user) {
      return [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Eksplor', path: '/products' },
        { icon: PlusCircle, label: 'Jual', path: '/toko/produk/tambah', primary: true },
        { icon: Package, label: 'Riwayat', path: '/user/pesanan' },
        { icon: User, label: 'Dasbor', path: '/user/dashboard' }
      ]
    }

    return []
  }

  const items = getNavItems()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path))
          const Icon = item.icon

          if (item.primary) {
            return (
              <Link 
                key={index} 
                to={item.path}
                className="flex flex-col items-center justify-center w-full h-full -mt-5"
              >
                <div className="bg-primary-600 text-white p-3 rounded-full shadow-lg border-4 border-white">
                  <Icon size={24} />
                </div>
                <span className="text-[10px] font-medium text-gray-600 mt-1">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link 
              key={index} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'fill-current opacity-20' : ''} />
                <Icon size={22} className="absolute inset-0" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default BottomNav