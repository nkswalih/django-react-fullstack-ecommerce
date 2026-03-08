import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';

const ProductGrid = ({ products }) => {
  const getColorClass = (color) => {
    const colorMap = {
      'black': 'bg-gray-900',
      'sky blue': 'bg-sky-200',
      'white': 'bg-white border border-gray-300',
      'gold': 'bg-amber-200',
      'green': 'bg-green-500',
      'graphite': 'bg-gray-700',
      'silver': 'bg-gray-300',
      'sky': 'bg-sky-400',
      'pink': 'bg-pink-400',
      'lavender': 'bg-fuchsia-200',
      'orange': 'bg-orange-600',
      'teal': 'bg-teal-600',
      'deep blue': 'bg-blue-950',
      'light gold': 'bg-amber-100',
      'sage': 'bg-lime-200',
      'mist blue': 'bg-blue-300',
      'blue': 'bg-blue-500',
    };
    return colorMap[color.toLowerCase()] || 'bg-gray-200';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="relative mb-4 overflow-hidden rounded-xl">
              <div className="aspect-square bg-white flex items-center justify-center p-0 w-auto h-auto">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* Stock Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-dm-sans font-bold ${
                  product.stock > 10 ? 'bg-green-700 text-white' : product.stock > 0 ? 'bg-orange-700 text-white' : 'bg-red-700 text-white' 
                }`}>
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Limited Stock' : 'Stock Out'}
                </span>
              </div>

              {/* Hover Actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-colors">
                  <HeartIcon className="size-4 text-gray-700" />
                </button> */}
                <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-sm transition-colors">
                  <EyeIcon className="size-4 text-gray-700" />
                </button>
              </div>

              {/* Quick Add to Cart */}
              {/* <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                className="w-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white py-3 rounded-xl font-medium hover:from-gray-400 hover:to-gray-700 transition-colors text-sm"
                onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
                }}>
                  Add to Bag
                </button>
              </div> */}
            </div>

            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-light uppercase tracking-wide">
                {product.brand}
              </span>
              
              <Link to={`/product/${product.id}`}>
                <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-gray-700 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-lg font-dm-sans font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Color bar */}
              {product.variants?.colors && (
                <div className="flex gap-1 mt-2">
                  {product.variants.colors.slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${getColorClass(color)}`}
                      title={color}
                    />
                  ))}
                  {product.variants.colors.length > 4 && (
                    <div className="text-xs text-gray-500 flex items-center">
                      +{product.variants.colors.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;