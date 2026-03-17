// components/AdminOrders/AdminOrderStats.jsx

import React from 'react';

const AdminOrderStats = ({ stats, formatPrice }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Total Orders</div>
        <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Total Revenue</div>
        <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Pending Orders</div>
        <div className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Avg. Order Value</div>
        <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.averageOrderValue)}</div>
      </div>
    </div>
  );
};

export default AdminOrderStats;