import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings,
  X,
  Menu,
  ChevronRight,
  PackageOpen,
  ShoppingBag
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: Package },
]

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const Navigate = useNavigate()

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-4 left-4 z-50 w-72 m-4 bg-white/50 backdrop-blur-xl rounded-[2rem] transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 transition-all duration-300 ease-in-out
        border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)]
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3 hover:cursor-pointer"  onClick={() => Navigate("/admin")}>
            <img
                alt="EchOo."
                src="/src/assets/images/Echoo-transparent.png"
                className="h-12 w-auto"
              />
            <div>
              <h1 className="text-lg font-bold text-gray-900">EchOo</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const IconComponent = item.icon
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-2xl 
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white' 
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 border border-transparent hover:border-white/50 hover:shadow-sm'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <IconComponent className={`
                      w-5 h-5 transition-colors
                      ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}
                    `} />
                    <span className="ml-3 font-medium">{item.name}</span>
                  </div>
                  
                  <ChevronRight className={`
                    w-4 h-4 transition-all
                    ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-gray-400'}
                    ${isActive ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}
                  `} />
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User info at bottom */}
        {/* <div className="absolute bottom-6 left-6 right-6 ">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@echoo.com</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-40 p-3 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/60"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
    </>
  )
}

export default Sidebar