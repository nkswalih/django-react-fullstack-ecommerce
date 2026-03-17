import React from 'react';

const ProductHeader = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <div className="mb-6">
        <span className="text-sm text-gray-500 font-light">{product.brand}</span>
        <h1 className="text-3xl font-dm-sans font-bold text-gray-900 mt-1">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-sm ${
            product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <span className="text-2xl font-dm-sans font-bold text-gray-900">
          {formatPrice(product.price)}
        </span>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 leading-relaxed">
          {product.shortDescription}
        </p>
      </div>
    </>
  );
};

export default ProductHeader;