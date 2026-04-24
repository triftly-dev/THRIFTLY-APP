import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CreditCard, 
  Database,
  ShoppingBag,
  MessageSquareWarning
} from 'lucide-react'

const AdminSidebar = () => {
  const location = useLocation()

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard'
    },
    {
      title: 'Users',
      icon: <Users size={20} />,
      path: '/admin/users'
    },
    {
      title: 'Products Approval',
      icon: <CheckSquare size={20} />,
      path: '/admin/approval'
    },
    {
      title: 'Transactions',
      icon: <CreditCard size={20} />,
      path: '/admin/transactions'
    },
    {
      title: 'Complaints',
      icon: <MessageSquareWarning size={20} />,
      path: '/admin/complaints'
    },
    {
      title: 'Master Data',
      icon: <Database size={20} />,
      path: '/admin/categories'
    }
  ]

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 left-0 overflow-y-auto">
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-indigo-500/20 p-2 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
            <ShoppingBag className="text-indigo-400" size={24} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Stuffus Admin</span>
        </Link>
      </div>

      <div className="p-4 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          Menu Utama
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-xl p-4 text-sm">
          <p className="text-white font-medium mb-1">Stuffus v1.0.0</p>
          <p className="text-slate-400">Marketplace Admin Panel</p>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
