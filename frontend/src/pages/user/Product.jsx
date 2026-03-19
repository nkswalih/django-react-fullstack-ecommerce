import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, getUserById, patchUser } from '../../api/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import SimpleFooter from '../../components/SimpleFoot';

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState({
    storage: '',
    ram: '',
    imageIndex: 0
  });

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await getProductBySlug(slug);
      const foundProduct = response.data;

      if (foundProduct) {
        setProduct(foundProduct);
        const defaults = {
          storage: foundProduct.variants?.storage?.[0] || '',
          ram: foundProduct.variants?.ram?.[0] || '',
          imageIndex: 0
        };
        setSelectedOptions(defaults);
      } else {
        navigate('/404');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const updateSelectedOption = (type, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleNextImage = () => {
    if (!product.images || product.images.length === 0) return;
    setSelectedOptions(prev => ({
      ...prev,
      imageIndex: (prev.imageIndex + 1) % product.images.length
    }));
  };

  const handlePrevImage = () => {
    if (!product.images || product.images.length === 0) return;
    setSelectedOptions(prev => ({
      ...prev,
      imageIndex: (prev.imageIndex - 1 + product.images.length) % product.images.length
    }));
  };

  const handleAddToCart = async () => {
    if (addingToCart || product.stock === 0) return;
    setAddingToCart(true);

    try {
      const currentUserString = localStorage.getItem('currentUser');
      if (!currentUserString) {
        toast.error("Please log in to add items to cart");
        setAddingToCart(false);
        return;
      }

      const currentUser = JSON.parse(currentUserString);
      const userId = currentUser.id;

      const cartItem = {
        id: `${product.id}-${selectedOptions.storage}-${selectedOptions.ram}`,
        productId: product.id,
        storage: selectedOptions.storage,
        ram: selectedOptions.ram,
        quantity: quantity,
        addedAt: new Date().toISOString(),
        productName: product.name,
        productPrice: totalPrice,
        productImage: activeImage,
        productBrand: product.brand
      };

      let userData;
      try {
        const userResponse = await getUserById(userId);
        userData = userResponse.data;
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("User not found. Please log in again.");
          setAddingToCart(false);
          return;
        } else {
          throw err;
        }
      }

      const currentCart = userData.cart || [];
      const existingIndex = currentCart.findIndex(item => item.id === cartItem.id);

      let updatedCart;
      if (existingIndex > -1) {
        updatedCart = currentCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedCart = [...currentCart, cartItem];
      }

      await patchUser(userId, {
        cart: updatedCart
      });

      toast.success(`${quantity} ${product.name} added to cart!`);
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const getColorClass = (colorName) => {
    if (!colorName) return 'bg-gray-400';
    const c = colorName.toLowerCase().trim();
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
      'mist blue': 'bg-gradient-to-br from-blue-200 to-blue-400',
      'light gold': 'bg-gradient-to-br from-amber-100 to-amber-300',
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
    return colorMap[c] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] to-[#e8f1f8] flex items-center justify-center">
        <div className="text-gray-600 font-medium">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] to-[#e8f1f8] flex items-center justify-center">
        <div className="text-gray-600 font-medium">Product not found</div>
      </div>
    );
  }

  const basePrice = parseFloat(product.price) || 0;
  let extraCost = 0;
  if (selectedOptions.storage) {
    if (selectedOptions.storage.includes('256')) extraCost += 10000;
    if (selectedOptions.storage.includes('512')) extraCost += 20000;
    if (selectedOptions.storage.includes('1TB')) extraCost += 40000;
  }
  if (selectedOptions.ram) {
    if (selectedOptions.ram.includes('16')) extraCost += 15000;
    if (selectedOptions.ram.includes('32')) extraCost += 30000;
  }
  const totalPrice = basePrice + extraCost;

  const activeImageIndex = (product.images && product.images.length > selectedOptions.imageIndex)
    ? selectedOptions.imageIndex
    : 0;
  const activeImage = product.images?.[activeImageIndex]?.image_url || 'https://via.placeholder.com/600x600?text=No+Image';

  const bubbleButtonClass = "bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white transition-all hover:bg-gradient-to-b hover:from-gray-400 hover:to-gray-700 hover:scale-105 active:scale-95";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] font-sans pt-20 pb-12 overflow-x-hidden relative">

      {/* Zoom Overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <button onClick={() => setIsZoomed(false)} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 border border-white/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <motion.img
              src={activeImage}
              alt={product.name}
              className="max-w-[95vw] max-h-[90vh] object-contain drop-shadow-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav Area / Back Button */}
      <div className="max-w-[1500px] mx-auto px-6 py-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold text-sm w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Products
        </button>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-14 min-h-[750px] relative">

        {/* CENTER COLUMN (IMAGE): Order 1 on Mobile, 2 on Desktop */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center">

          {/* Glassmorphic Static Rounder Background for Image */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[600px] bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.03)] rounded-[3rem] p-6 flex flex-col items-center justify-center overflow-hidden">

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/40 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="absolute top-6 right-6 z-20">
              <button onClick={() => setIsZoomed(true)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${bubbleButtonClass}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                Preview
              </button>
            </div>

            {/* Product Image ABSOLUTELY centered so arrows don't jump */}
            <motion.img
              key={activeImage}
              src={activeImage}
              alt={product.name}
              onClick={() => setIsZoomed(true)}
              className="absolute z-10 w-[80%] h-[80%] object-contain mix-blend-multiply cursor-zoom-in"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />

            <svg className="absolute bottom-[8%] w-[60%] h-8 opacity-20 text-gray-500 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
              <ellipse cx="50" cy="10" rx="40" ry="8" fill="currentColor" filter="blur(5px)" />
            </svg>
          </div>

          {/* Image Rotators - Detached from image, attached below container */}
          {(product.images?.length > 1 || product.variants?.colors?.length > 1) && (
            <div className="flex gap-4 mt-6">
              <button onClick={handlePrevImage} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${bubbleButtonClass}`}>
                <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onClick={handleNextImage} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${bubbleButtonClass}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>

        {/* LEFT COLUMN (TITLE & PRICE): Order 2 on Mobile, 1 on Desktop */}
        <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col justify-start z-10 lg:pt-4 mt-8 lg:mt-0">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">{product.brand}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-gray-900 leading-none mb-2">
            {product.name}
          </h1>
          <div className="font-medium text-sm mb-8 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={product.stock > 0 ? 'text-green-700' : 'text-red-600'}>
              {product.stock > 0 ? `In Stock` : 'Out of Stock'}
            </span>
          </div>

          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] w-full max-w-sm flex flex-col mt-auto mb-6">
            <h3 className="font-semibold text-gray-800 mb-6 text-lg border-b border-gray-200/50 pb-2">Configuration Summary</h3>

            <div className="space-y-3 mb-6 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Base Model</span>
                <span className="font-medium">₹{basePrice.toLocaleString()}</span>
              </div>

              {selectedOptions.storage && (
                <div className="flex justify-between items-center">
                  <span>Storage: {selectedOptions.storage}</span>
                  <span className="font-medium text-gray-900">{extraCost > 0 ? `+ ₹${extraCost.toLocaleString()}` : 'Included'}</span>
                </div>
              )}

              {selectedOptions.ram && (
                <div className="flex justify-between items-center">
                  <span>Memory: {selectedOptions.ram}</span>
                  <span className="font-medium text-gray-900">Included</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200/50 border-dashed pt-4 mb-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-gray-400">Total Price</span>
                  <span className="text-[10px] text-gray-500">Free shipping available</span>
                </div>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={addingToCart || product.stock <= 0} className={`w-full py-4 rounded-full font-bold tracking-wide text-sm ${product.stock > 0 && !addingToCart ? bubbleButtonClass : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {addingToCart ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (OPTIONS): Order 3 on Mobile, 3 on Desktop */}
        <div className="order-3 lg:col-span-3 flex flex-col space-y-4 lg:pt-10 z-10 pb-10 lg:pb-20">

          {product.variants?.storage && product.variants.storage.length > 0 && (
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-5 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Storage Capacity</h4>
              <div className="flex flex-wrap gap-2">
                {product.variants.storage.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateSelectedOption('storage', opt)}
                    className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-all w-full md:w-auto flex-1 ${selectedOptions.storage === opt
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white/60 text-gray-700 hover:bg-white'
                      }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-[3px] ${selectedOptions.storage === opt ? 'border-gray-300 bg-white' : 'border-gray-300 bg-transparent'}`}></div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants?.colors && product.variants.colors.length > 0 && (
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-5 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)] relative">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Color & Finish</h4>
              <div className="flex flex-wrap gap-3">
                {product.variants.colors.map((color, idx) => (
                  <button
                    key={color}
                    onClick={() => updateSelectedOption('imageIndex', idx)}
                    className={`relative w-12 h-12 rounded-full outline-none transition-transform hover:scale-110 ${selectedOptions.imageIndex === idx ? 'ring-2 ring-gray-900 ring-offset-2 ring-offset-[#e2ebf4]' : ''}`}
                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                  >
                    <div
                      className={`absolute inset-[2px] rounded-full shadow-inner ring-1 ring-black/10 ${getColorClass(color)}`}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants?.ram && product.variants.ram.length > 0 && (
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-5 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Memory Options</h4>
              <div className="flex flex-col gap-2">
                {product.variants.ram.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateSelectedOption('ram', opt)}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${selectedOptions.ram === opt
                      ? 'bg-gray-100 border-gray-900 shadow-sm'
                      : 'bg-white/50 border-transparent hover:bg-white'
                      } border`}
                  >
                    <div className={`w-4 h-4 rounded-full border-[4px] ${selectedOptions.ram === opt ? 'border-gray-900 bg-white' : 'border-gray-300 bg-transparent'}`}></div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FULL WIDTH ROW: Description & Specs -> Order 4 */}
        <div className="order-4 lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-gray-300/50">

          {/* Description & Features */}
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Product Overview</h3>
            <p className="text-gray-600 leading-relaxed max-w-2xl mb-8 whitespace-pre-wrap text-[15px]">
              {product.shortDescription || product.description || "No description available for this product."}
            </p>

            {product.features && product.features.length > 0 && (
              <>
                <h4 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Key Features</h4>
                <ul className="space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600">
                      <svg className="w-5 h-5 text-gray-900 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-[15px]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Specifications */}
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Technical Specifications</h3>
            {product.specs ? (
              <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <table className="w-full text-[15px] text-left">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-white/30' : ''}>
                        <td className="py-4 px-6 font-semibold text-gray-900 w-1/3 capitalize border-r border-white/50 bg-white/10">{key}</td>
                        <td className="py-4 px-6 text-gray-600">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No specifications provided.</p>
            )}
          </div>

        </div>

      </div>

      <div className="mt-16">
        <SimpleFooter />
      </div>
    </div>
  );
};

export default ProductPage;