import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, User, Settings, CreditCard } from 'lucide-react'

const UserSidebar = () => {
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/user/dashboard' },
    { icon: Package, label: 'Pesanan Saya', path: '/user/pesanan' },
    { icon: ShoppingBag, label: 'Mulai Belanja', path: '/products' },
    { icon: CreditCard, label: 'Pembayaran', path: '/user/pesanan' },
    { icon: User, label: 'Profil Saya', path: '/user/dashboard' },
    { icon: Settings, label: 'Pengaturan', path: '/user/dashboard' },
  ]

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden sticky top-24">
        {/* Header Sidebar dengan Gradiasi */}
        <div className="h-24 bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
          <h2 className="text-white font-bold text-lg">Menu Belanja</h2>
          <p className="text-emerald-50 text-xs opacity-80">Kelola aktivitas belanjamu</p>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 shadow-sm border-l-4 border-emerald-500' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'} />
                <span className={`font-medium ${isActive ? 'text-emerald-700' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default UserSidebar
