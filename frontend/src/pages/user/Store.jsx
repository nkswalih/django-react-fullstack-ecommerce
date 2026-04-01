import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { getProducts } from '../../api/apiService';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleFooter from '../../components/SimpleFoot';
import { useDebounce } from '../../hooks/useDebounce';
import { getCategoryKey } from '../../utils/productCatalog';

const PRODUCTS_PER_PAGE = 12;

const colorMap = {
      'black': 'bg-gradient-to-br from-gray-700 to-black',
      'blue': 'bg-gradient-to-br from-blue-600 to-blue-900',
      'white': 'bg-gradient-to-br from-gray-50 to-gray-200 border border-gray-300',
      'gold': 'bg-gradient-to-br from-amber-300 to-yellow-600',
      'green': 'bg-gradient-to-br from-green-500 to-green-800',
      'lemon': 'bg-gradient-to-tr from-yellow-200 to-green-200',
      'light green': 'bg-gradient-to-br from-green-50 to-green-200',
      'graphite': 'bg-gradient-to-br from-gray-600 to-gray-800',
      'silver': 'bg-gradient-to-br from-gray-200 to-gray-400',
      'gray': 'bg-gradient-to-br from-gray-400 to-gray-500',
      'citrus': 'bg-gradient-to-br from-yellow-400 to-green-500',
      'sky': 'bg-gradient-to-br from-sky-300 to-sky-600',
      'pink': 'bg-gradient-to-br from-pink-400 to-pink-600',
      'orange': 'bg-gradient-to-br from-orange-400 to-orange-600',
      'red': 'bg-gradient-to-br from-red-500 to-red-800',
      'deep blue': 'bg-gradient-to-br from-blue-900 to-blue-950',
      'lavender': 'bg-gradient-to-br from-purple-300 to-purple-500',
      'sage': 'bg-gradient-to-br from-green-300 to-green-500',
      'mist blue': 'bg-gradient-to-br from-blue-200 to-blue-400',
      'light gold': 'bg-gradient-to-br from-amber-50 to-amber-100',
      'teal': 'bg-gradient-to-br from-teal-400 to-teal-700',
      'purple': 'bg-gradient-to-br from-purple-500 to-purple-800',
      'yellow': 'bg-gradient-to-br from-yellow-300 to-yellow-500',
      'titanium': 'bg-gradient-to-br from-stone-400 to-stone-600',
      'natural': 'bg-gradient-to-br from-stone-200 to-stone-400',
      'space gray': 'bg-gradient-to-br from-zinc-600 to-zinc-800',
      'midnight': 'bg-gradient-to-br from-slate-800 to-slate-950',
      'starlight': 'bg-gradient-to-br from-amber-50 to-gray-200',
      'sierra blue': 'bg-gradient-to-br from-sky-300 to-blue-300',
      'alpine green': 'bg-gradient-to-br from-green-600 to-green-800',
      'brown': 'bg-gradient-to-br from-amber-700 to-amber-900',
};

const getCls = (c) => colorMap[c?.toLowerCase()?.trim()] || 'bg-gray-300';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const CategoryIcon = ({ id }) => {
  const icons = {
    all: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    smartphone: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    laptop: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    tablet: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    audio: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
    watch: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    accessory: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  };

  return icons[id?.toLowerCase()] || <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>;
};

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [showAltImage, setShowAltImage] = useState(false);
  const hoverTimerRef = useRef(null);
  const primaryImage = product.images?.[0]?.image_url || "/no-image.png";
  const secondaryImage = product.images?.[1]?.image_url;

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
    }
  }, []);

  const stockStatus = product.stock > 10
    ? { label: 'In Stock', dot: 'bg-emerald-400' }
    : product.stock > 0
      ? { label: 'Limited', dot: 'bg-orange-400' }
      : { label: 'Sold Out', dot: 'bg-red-400' };

  return (
    <Link to={`/product/${product.slug}`}>
      <motion.div
        className="group relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] transition-all duration-300 cursor-pointer flex flex-col"
        onMouseEnter={() => {
          setHovered(true);
          if (secondaryImage) {
            hoverTimerRef.current = window.setTimeout(() => {
              setShowAltImage(true);
            }, 220);
          }
        }}
        onMouseLeave={() => {
          if (hoverTimerRef.current) {
            window.clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
          }
          setHovered(false);
          setShowAltImage(false);
        }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
      >
        <div className="relative bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] aspect-square flex items-center justify-center overflow-hidden p-4">
          <motion.img
            src={primaryImage}
            alt={product.name}
            className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-all duration-500 ${showAltImage ? 'scale-[1.03] opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-0'}`}
          />
          {secondaryImage && (
            <motion.img
              src={secondaryImage}
              alt={product.name}
              className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-all duration-500 ${showAltImage ? 'scale-[1.05] opacity-100 blur-0' : 'scale-[1.01] opacity-0 blur-[6px]'}`}
            />
          )}

          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[10px] font-bold text-gray-700 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot} shrink-0`}></span>
              {stockStatus.label}
            </span>
          </div>

          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute top-3 right-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div
                  onClick={(event) => { event.preventDefault(); }}
                  className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors border border-white/60"
                  title="Quick View"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 flex flex-col gap-1 flex-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{product.brand}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 leading-tight">{product.name}</h3>

          <div className="flex items-center justify-between mt-auto pt-3">
            <span className="text-base font-bold text-gray-900 tracking-tight">{formatPrice(product.price)}</span>
            {product.variants?.colors?.length > 0 && (
              <div className="flex gap-1">
                {product.variants.colors.slice(0, 4).map((c, index) => (
                  <div key={index} className={`w-3 h-3 rounded-full ${getCls(c)} shadow-sm`} title={c} />
                ))}
                {product.variants.colors.length > 4 && (
                  <span className="text-[10px] text-gray-400 self-center">+{product.variants.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const StorePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All', count: 0 }]);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const debouncedSearchQuery = useDebounce(deferredSearchQuery, 300);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      if (loading) {
        setLoading(true);
      } else {
        setIsFetching(true);
      }

      try {
        const sortMap = {
          featured: 'newest',
          'price-low': 'price_low',
          'price-high': 'price_high',
        };

        const response = await getProducts({
          q: debouncedSearchQuery.trim() || undefined,
          category: activeCategory !== 'all' ? activeCategory : undefined,
          sort: sortMap[sortBy],
          limit: PRODUCTS_PER_PAGE,
          offset: (page - 1) * PRODUCTS_PER_PAGE,
        });

        if (ignore) return;

        setProducts(response.data.results || []);
        setTotal(response.data.total || 0);
        setTotalAvailable(response.data.total_available ?? response.data.total ?? 0);
        setCategories([
          { id: 'all', name: 'All', count: response.data.total_available ?? response.data.total ?? 0 },
          ...((response.data.category_counts || []).map((category) => ({
            ...category,
            id: getCategoryKey(category.id || category.name),
          }))),
        ]);
      } catch {
        if (ignore) return;
        setProducts([]);
        setTotal(0);
        setTotalAvailable(0);
        setCategories([{ id: 'all', name: 'All', count: 0 }]);
      } finally {
        if (!ignore) {
          setLoading(false);
          setIsFetching(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [activeCategory, debouncedSearchQuery, page, sortBy]);

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const startItem = total === 0 ? 0 : ((page - 1) * PRODUCTS_PER_PAGE) + 1;
  const endItem = Math.min(page * PRODUCTS_PER_PAGE, total);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-700 animate-spin"></div>
          <span className="text-gray-500 font-medium text-sm">Loading Store...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-16"
      style={{ fontFamily: "'SF Pro Display', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Echoo Store</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-none">
              Shop All Products
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {totalAvailable} {totalAvailable === 1 ? 'product' : 'products'} available
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-4 py-2.5 rounded-full bg-white/60 border border-white/80 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 w-48 sm:w-64 shadow-sm"
              />
            </div>

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-full bg-white/60 border border-white/80 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm appearance-none pr-8"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${activeCategory === cat.id
                ? 'bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white'
                : 'bg-white/50 backdrop-blur-md border border-white/70 text-gray-600 hover:bg-white/80 hover:shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
              }`}
            >
              <span className="shrink-0"><CategoryIcon id={cat.id} /></span>
              {cat.name}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100/80 text-gray-500'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        {isFetching && (
          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-gray-500 shadow-sm backdrop-blur-md">
              <div className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
              Updating products...
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">?</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search or category filter.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); setPage(1); }} className="mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            key={`${activeCategory}-${page}`}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isFetching ? 0.7 : 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full bg-white/60 border border-white/80 flex items-center justify-center shadow-sm text-gray-700 hover:bg-white disabled:opacity-30 transition-all"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${page === pageNumber
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white/60 border border-white/80 text-gray-700 hover:bg-white shadow-sm'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full bg-white/60 border border-white/80 flex items-center justify-center shadow-sm text-gray-700 hover:bg-white disabled:opacity-30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Showing {startItem}-{endItem} of {total} products
          </p>
        )}
      </div>

      <div className="mt-20">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default StorePage;
