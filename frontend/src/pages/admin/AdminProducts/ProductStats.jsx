import React from 'react'

const ProductStats = ({ products, formatPrice }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Total Products</div>
        <div className="text-2xl font-bold text-gray-900">{products.length}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Out of Stock</div>
        <div className="text-2xl font-bold text-gray-900">
          {products.filter(p => p.stock === 0).length}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Low Stock (&lt;10)</div>
        <div className="text-2xl font-bold text-gray-900">
          {products.filter(p => p.stock > 0 && p.stock < 10).length}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Total Value</div>
        <div className="text-2xl font-bold text-gray-900">
          {formatPrice(products.reduce((sum, p) => sum + (p.price * p.stock), 0), 'INR')}
        </div>
      </div>
    </div>
  )
}

export default ProductStats