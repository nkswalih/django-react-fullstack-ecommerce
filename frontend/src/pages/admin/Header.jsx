import { LogOutIcon, SearchIcon, ShieldUserIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getOrders, getProducts, getUsers } from "../../api/apiService";
import { useAuth } from "../../contexts/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import { getProductsFromResponse, normalizeText } from "../../utils/productCatalog";

const Header = ({ setSidebarOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], products: [], orders: [] });
  const [searchData, setSearchData] = useState({ users: [], products: [], orders: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const { user, logout } = useAuth();
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const userInitials = (user?.name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchOpen || searchData.users.length || searchData.products.length || searchData.orders.length) {
      return;
    }

    let ignore = false;

    const loadSearchData = async () => {
      setLoading(true);
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([getUsers(), getProducts(), getOrders()]);

        if (ignore) return;

        setSearchData({
          users: Array.isArray(usersRes.data) ? usersRes.data : [],
          products: getProductsFromResponse(productsRes.data),
          orders: Array.isArray(ordersRes.data) ? ordersRes.data : [],
        });
      } catch (error) {
        if (!ignore) {
          console.error("Search error:", error);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadSearchData();

    return () => {
      ignore = true;
    };
  }, [searchData.orders.length, searchData.products.length, searchData.users.length, searchOpen]);

  useEffect(() => {
    const query = normalizeText(debouncedSearchQuery);

    if (!query) {
      setSearchResults({ users: [], products: [], orders: [] });
      return;
    }

    const users = searchData.users.filter(
      (item) =>
        normalizeText(item.name).includes(query) ||
        normalizeText(item.email).includes(query),
    ).slice(0, 5);

    const products = searchData.products.filter(
      (item) =>
        normalizeText(item.name).includes(query) ||
        normalizeText(item.category).includes(query) ||
        normalizeText(item.brand).includes(query),
    ).slice(0, 5);

    const orders = searchData.orders.filter(
      (item) =>
        normalizeText(item.id).includes(query) ||
        normalizeText(item.userName).includes(query) ||
        normalizeText(item.userEmail).includes(query) ||
        normalizeText(item.status).includes(query),
    ).slice(0, 5);

    setSearchResults({ users, products, orders });
  }, [debouncedSearchQuery, searchData]);

  const handleLogout = async () => {
    await logout();
    navigate("/sign_in");
  };

  const handleResultClick = (type) => {
    const routes = {
      user: "/admin/users/",
      product: "/admin/products/",
      order: "/admin/orders/",
    };

    navigate(routes[type]);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {searchOpen && <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-20" onClick={() => setSearchOpen(false)} />}

      <header className="bg-transparent border-b border-gray-200/50 z-30 sticky top-0">
        <div className="flex items-center justify-end h-16 px-4 md:px-6">
          <div className="flex items-center space-x-3">
            {/* <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button> */}

            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              {searchOpen && (
              <div 
                className="
                  /* Mobile styles: Fixed, centered, with side gaps */
                  fixed top-20 left-4 right-4 w-auto 
                  /* Desktop styles: Absolute, aligned right, fixed width */
                  md:absolute md:top-full md:left-auto md:right-0 md:mt-2 md:w-96 
                  /* Common styles */
                  bg-white/80 backdrop-blur-xl rounded-2xl 
                  shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 z-50
                "
              >
                <div className="p-4 border-b border-gray-200/50">
                  <div className="flex items-center">
                    <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search users, products, orders..."
                      className="flex-1 border-0 focus:ring-0 focus:outline-none text-sm bg-transparent"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1 text-gray-400 hover:text-gray-600">
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {loading && !searchData.users.length && !searchData.products.length && !searchData.orders.length ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500 text-sm">Searching...</p>
                      </div>
                    ) : (
                      <div>
                        {searchResults.users.length > 0 && (
                          <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Users ({searchResults.users.length})</h3>
                            <div className="space-y-2">
                              {searchResults.users.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => handleResultClick("user")}
                                  className="w-full text-left p-2 rounded hover:bg-gray-50 flex items-center space-x-3"
                                >
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-800">{item.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{item.email}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {searchResults.products.length > 0 && (
                          <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Products ({searchResults.products.length})</h3>
                            <div className="space-y-2">
                              {searchResults.products.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => handleResultClick("product")}
                                  className="w-full text-left p-2 rounded hover:bg-gray-50 flex items-center space-x-3"
                                >
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.images?.[0]?.image_url ? (
                                      <img src={item.images[0].image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <div className="text-xs text-gray-400">{item.name.charAt(0)}</div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-gray-500">{item.category}</span>
                                      <span className="text-xs font-medium">Rs. {Number(item.price).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {searchResults.orders.length > 0 && (
                          <div className="p-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Orders ({searchResults.orders.length})</h3>
                            <div className="space-y-2">
                              {searchResults.orders.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => handleResultClick("order")}
                                  className="w-full text-left p-2 rounded hover:bg-gray-50"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">#{item.id}</p>
                                      <p className="text-xs text-gray-500">{item.userName}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold">Rs. {Number(item.total).toLocaleString()}</p>
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{item.status}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {!loading &&
                          searchQuery &&
                          searchResults.users.length === 0 &&
                          searchResults.products.length === 0 &&
                          searchResults.orders.length === 0 && (
                            <div className="p-8 text-center">
                              <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
                            </div>
                          )}

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

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-11 max-w-[11rem] items-center gap-2 rounded-full border border-white/70 bg-white/65 px-2.5 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80 sm:max-w-[14rem]"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || "Admin"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[11px] font-semibold tracking-wide">{userInitials}</span>
                  )}
                </div>

                <div className="hidden min-w-0 flex-1 text-left sm:block">
                  <p className="truncate text-sm font-semibold text-gray-900">{user?.name || "Administrator"}</p>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 shrink-0">
                  <ShieldUserIcon className="w-3.5 h-3.5" />
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center shrink-0">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user?.name || "Admin"} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold tracking-wide">{userInitials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{user?.name || "Administrator"}</p>
                        <p className="truncate text-xs text-gray-500">Administrator</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-white/50 transition-colors">
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
  );
};

export default Header;
