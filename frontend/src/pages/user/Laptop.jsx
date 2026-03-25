import React, { useEffect, useRef, useState } from 'react';
import { getProducts } from '../../api/apiService';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleFooter from '../../components/SimpleFoot';
import { getProductsFromResponse, isBrandMatch, isCategoryMatch } from '../../utils/productCatalog';

const colorMap = {
  'black': 'bg-gradient-to-br from-gray-700 to-black',
  'blue': 'bg-gradient-to-br from-blue-600 to-blue-900',
  'white': 'bg-gradient-to-br from-gray-50 to-gray-200 border border-gray-300',
  'gold': 'bg-gradient-to-br from-amber-300 to-yellow-600',
  'green': 'bg-gradient-to-br from-green-500 to-green-800',
  'graphite': 'bg-gradient-to-br from-gray-600 to-gray-800',
  'silver': 'bg-gradient-to-br from-gray-200 to-gray-400',
  'sky': 'bg-gradient-to-br from-sky-300 to-sky-600',
  'pink': 'bg-gradient-to-br from-pink-400 to-pink-600',
  'orange': 'bg-gradient-to-br from-orange-400 to-orange-600',
  'red': 'bg-gradient-to-br from-red-500 to-red-800',
  'deep blue': 'bg-gradient-to-br from-blue-800 to-blue-950',
  'lavender': 'bg-gradient-to-br from-purple-300 to-purple-500',
  'sage': 'bg-gradient-to-br from-green-300 to-green-500',
  'teal': 'bg-gradient-to-br from-teal-400 to-teal-700',
  'space gray': 'bg-gradient-to-br from-zinc-600 to-zinc-800',
  'midnight': 'bg-gradient-to-br from-slate-800 to-slate-950',
  'starlight': 'bg-gradient-to-br from-amber-50 to-gray-200',
  'titanium': 'bg-gradient-to-br from-stone-400 to-stone-600',
  'natural': 'bg-gradient-to-br from-stone-200 to-stone-400',
};
const getCls = (c) => colorMap[c?.toLowerCase()?.trim()] || 'bg-gray-300';
const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
const bubbleBtn = 'bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white hover:from-gray-400 hover:to-gray-700 hover:scale-105 active:scale-95';
const disabledBtn = 'bg-white/30 border border-white/50 text-gray-300 cursor-not-allowed';

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [showAltImage, setShowAltImage] = useState(false);
  const hoverTimerRef = useRef(null);
  const primaryImage = product.images?.[0]?.image_url || product.images?.[0] || "/no-image.png";
  const secondaryImage = product.images?.[1]?.image_url || product.images?.[1];
  const stockStatus = product.stock > 10
    ? { label: 'In Stock', dot: 'bg-emerald-400' }
    : product.stock > 0 ? { label: 'Limited', dot: 'bg-orange-400' }
      : { label: 'Sold Out', dot: 'bg-red-400' };

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
    }
  }, []);

  return (
    <Link to={`/product/${product.slug}`}
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
      }}>
      <motion.div className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] transition-shadow duration-300 flex flex-col h-full cursor-pointer"
        whileHover={{ y: -4 }} transition={{ duration: 0.22 }}>
        <div className="relative bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] aspect-square flex items-center justify-center overflow-hidden p-5">
          <motion.img src={primaryImage} alt={product.name}
            className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-all duration-500 ${showAltImage ? 'scale-[1.03] opacity-0 blur-[2px]' : 'scale-100 opacity-100 blur-0'}`} />
          {secondaryImage && (
            <motion.img src={secondaryImage} alt={product.name}
              className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-all duration-500 ${showAltImage ? 'scale-[1.05] opacity-100 blur-0' : 'scale-[1.01] opacity-0 blur-[6px]'}`} />
          )}
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[10px] font-bold text-gray-700 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stockStatus.dot}`}></span>{stockStatus.label}
            </span>
          </div>
          <AnimatePresence>{hovered && (
            <motion.div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-white/60"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </motion.div>
          )}</AnimatePresence>
        </div>
        <div className="p-4 flex flex-col gap-1 flex-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{product.brand}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{product.shortDescription}</p>
          <div className="flex items-center justify-between mt-auto pt-3">
            <span className="text-base font-bold text-gray-900">{fmt(product.price || 0)}</span>
            {product.variants?.colors?.length > 0 && (
              <div className="flex gap-1">
                {product.variants.colors.slice(0, 4).map((c, i) => <div key={i} className={`w-3 h-3 rounded-full ${getCls(c)} shadow-sm`} title={c} />)}
                {product.variants.colors.length > 4 && <span className="text-[10px] text-gray-400 self-center">+{product.variants.colors.length - 4}</span>}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const Section = ({ title, subtitle, products, idx, setIdx }) => {
  if (!products.length) return null;
  const perPage = 4;
  const total = Math.ceil(products.length / perPage);
  const visible = products.slice(idx * perPage, idx * perPage + perPage);
  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{subtitle}</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
        </div>
        {total > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">{idx + 1} / {total}</span>
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${idx === 0 ? disabledBtn : bubbleBtn}`}>
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button onClick={() => setIdx(i => Math.min(total - 1, i + 1))} disabled={idx === total - 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${idx === total - 1 ? disabledBtn : bubbleBtn}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
      <motion.div key={idx} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {visible.map(p => <ProductCard key={p.id} product={p} />)}
      </motion.div>
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-gray-700' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`} />
          ))}
        </div>
      )}
    </section>
  );
};

const LaptopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [macIdx, setMacIdx] = useState(0);
  const [gamingIdx, setGamingIdx] = useState(0);
  const [otherIdx, setOtherIdx] = useState(0);

  useEffect(() => {
    getProducts()
      .then((r) => { setProducts(getProductsFromResponse(r.data)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const macs = products.filter((p) => isBrandMatch(p.brand, 'Apple') && isCategoryMatch(p.category, 'laptop'));
  const gaming = products.filter((p) => isCategoryMatch(p.category, 'laptop') && p.name?.toLowerCase().includes('gaming') && !isBrandMatch(p.brand, 'Apple'));
  const other = products.filter((p) => isCategoryMatch(p.category, 'laptop') && !p.name?.toLowerCase().includes('gaming') && !isBrandMatch(p.brand, 'Apple'));

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-700 animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading laptops...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-16"
      style={{ fontFamily: "'SF Pro Display', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-6 pb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Echoo Laptops</p>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-gray-900 leading-none mb-3">The latest Laptops.</h1>
        <p className="text-gray-500 text-lg font-light">Powerful Performance. <span className="text-gray-900 font-medium">Find the perfect laptop for your needs.</span></p>
      </div>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 mb-10"><div className="h-px bg-white/60 rounded-full"></div></div>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        <Section title="MacBook" subtitle="Apple" products={macs} idx={macIdx} setIdx={setMacIdx} />
        <Section title="Gaming Laptops" subtitle="For Power Users" products={gaming} idx={gamingIdx} setIdx={setGamingIdx} />
        <Section title="Professional Laptops" subtitle="Work & Productivity" products={other} idx={otherIdx} setIdx={setOtherIdx} />
        {!macs.length && !gaming.length && !other.length && (
          <div className="text-center py-24"><p className="text-2xl font-medium text-gray-500">No laptops available.</p></div>
        )}
      </div>
      <div className="mt-10"><SimpleFooter /></div>
    </div>
  );
};

export default LaptopPage;
