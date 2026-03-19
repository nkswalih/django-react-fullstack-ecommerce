import { ShieldUserIcon, BellIcon, SearchIcon, LogOutIcon, XIcon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getUsers, getProducts, getOrders } from '../../api/apiService'

const Header = ({ setSidebarOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ users: [], products: [], orders: [] })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const { user } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search function
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], products: [], orders: [] })
      return
    }

    setLoading(true)
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        getUsers(),
        getProducts(),
        getOrders()
      ])

      const users = usersRes.data
      const products = productsRes.data
      const orders = ordersRes.data

      const term = query.toLowerCase()
      
      const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      ).slice(0, 5)

      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term)
      ).slice(0, 5)

      const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.userName.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term)
      ).slice(0, 5)

      setSearchResults({ users: filteredUsers, products: filteredProducts, orders: filteredOrders })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query) {
      performSearch(query)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
    navigate('/sign_in')
  }

  const handleResultClick = (type, item) => {
    const routes = {
      user: `/admin/users/`,
      product: `/admin/products/`,
      order: `/admin/orders/`
    }
    navigate(routes[type])
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* Blur overlay when search is open */}
      {searchOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={() => setSearchOpen(false)}
        />
      )}

      <header className="bg-white shadow-sm border-b border-gray-200 z-30 sticky top-0">
        <div className="flex items-center justify-end h-16 px-4 md:px-6">
          {/* Left side: Icons */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search Icon */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              {/* Search Dropdown */}
              {searchOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search users, products, orders..."
                        className="flex-1 border-0 focus:ring-0 focus:outline-none text-sm"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500 text-sm">Searching...</p>
                      </div>
                    ) : (
                      <div>
                        {/* Users */}
                        {searchResults.users.length > 0 && (
                          <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Users ({searchResults.users.length})</h3>
                            <div className="space-y-2">
                              {searchResults.users.map(user => (
                                <button
                                  key={user.id}
                                  onClick={() => handleResultClick('user', user)}
                                  className="w-full text-left p-2 rounded hover:bg-gray-50 flex items-center space-x-3"
                                >
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-800">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Products */}
                        {searchResults.products.length > 0 && (
                          <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Products ({searchResults.products.length})</h3>
                            <div className="space-y-2">
                              {searchResults.products.map(product => (
                                <button
                                  key={product.id}
                                  onClick={() => handleResultClick('product', product)}
                                  className="w-full text-left p-2 rounded hover:bg-gray-50 flex items-center space-x-3"
                                >
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {product.images?.[0] ? (
                                      <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <div className="text-xs text-gray-400">{product.name.charAt(0)}</div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-gray-500">{product.category}</span>
                                      <span className="text-xs font-medium">₹{product.price.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Orders */}
                        {searchResults.orders.length > 0 && (
                          <div className="p-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Orders ({searchResults.orders.length})</h3>
                            <div className="space-y-2">
                              {searchResults.orders.map(order => (
                                <button
                                  key={order.id}
                                  onClick={() => handleResultClick('order', order)}
                                  className="w-full text-left p-2 rounded hover:bg-gray-50"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{order.id}</p>
                                      <p className="text-xs text-gray-500">{order.userName}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold">₹{order.total.toLocaleString()}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {order.status}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No Results */}
                        {!loading && searchQuery && 
                         searchResults.users.length === 0 && 
                         searchResults.products.length === 0 && 
                         searchResults.orders.length === 0 && (
                          <div className="p-8 text-center">
                            <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
                          </div>
                        )}

                        {/* Empty Search */}
                        {!searchQuery && (
                          <div className="p-8 text-center">
                            <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Type to search users, products, or orders</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          {/* Right side: User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <ShieldUserIcon className="w-4 h-4 text-white" />
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOutIcon className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </header>
    </>
  )
}

export default Header