import React from 'react'

const ProductStats = ({ products, summary, formatPrice }) => {
  const totalProducts = summary?.total_products ?? products.length;
  const outOfStock = summary?.out_of_stock ?? products.filter((product) => product.stock === 0).length;
  const lowStock = summary?.low_stock ?? products.filter((product) => product.stock > 0 && product.stock < 10).length;
  const totalValue = Number(summary?.total_value ?? products.reduce((sum, product) => sum + (product.price * product.stock), 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Total Products</div>
        <div className="text-2xl font-bold text-gray-900">{totalProducts}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Out of Stock</div>
        <div className="text-2xl font-bold text-gray-900">{outOfStock}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Low Stock (&lt;10)</div>
        <div className="text-2xl font-bold text-gray-900">{lowStock}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Total Value</div>
        <div className="text-2xl font-bold text-gray-900">{formatPrice(totalValue, 'INR')}</div>
      </div>
    </div>
  )
}

export default ProductStats
