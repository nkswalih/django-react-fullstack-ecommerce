import React, { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, ComposedChart
} from 'recharts'
import { Package } from 'lucide-react'

// Define gradients and colors for the stylized charts
const PIE_COLORS_DATA = [
  { gradientId: 'pieGradient1', color1: '#f97316', color2: '#ea580c' }, // Orange
  { gradientId: 'pieGradient2', color1: '#10b981', color2: '#059669' }, // Emerald
  { gradientId: 'pieGradient3', color1: '#6366f1', color2: '#4f46e5' }, // Indigo
  { gradientId: 'pieGradient4', color1: '#ef4444', color2: '#dc2626' }, // Red
  { gradientId: 'pieGradient5', color1: '#3b82f6', color2: '#2563eb' }, // Blue
];

const BAR_COLORS = {
  gradientId: 'barGradient',
  color1: '#8b5cf6', // Violet-500
  color2: '#c084fc', // Violet-400
};

// Custom Tooltip for the main Composed Chart
const AnalyticsTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    const revenueData = payload.find(p => p.dataKey === 'revenue')
    const ordersData = payload.find(p => p.dataKey === 'orders')

    return (
      <div className="bg-white/80 border border-white/60 shadow-xl rounded-2xl p-4 transition-all duration-300 backdrop-blur-md font-inter">
        <div className="mb-3">
          <p className="text-sm font-bold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">Daily Performance Metrics</p>
        </div>

        <div className="space-y-3">
          {revenueData && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 mr-2.5 shadow-md"></div>
                <span className="text-sm font-medium text-gray-700">Revenue</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(revenueData.value)}
              </span>
            </div>
          )}

          {ordersData && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 mr-2.5 shadow-md"></div>
                <span className="text-sm font-medium text-gray-700">Order Volume</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {ordersData.value} orders
              </span>
            </div>
          )}
        </div>

        {revenueData && ordersData && ordersData.value > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Avg. Order Value:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(revenueData.value / ordersData.value)}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

// Custom Tooltip for the Pie Chart
const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Calculate total from all categories in payload (assuming data has been pre-validated)
    const total = payload.reduce((sum, entry) => sum + entry.payload.value, 0); 
    const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white/80 border border-white/60 shadow-xl rounded-2xl p-3 backdrop-blur-md font-inter">
        <p className="text-sm font-bold text-gray-900">{data.name}</p>
        <p className="text-xs text-gray-700 mt-1">
          <span className="font-semibold">{data.value}</span> units
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ({percent}%) of sales
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for the Bar Chart
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/80 border border-white/60 shadow-xl rounded-2xl p-3 backdrop-blur-md font-inter">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-700 mt-1">
          <span className="font-semibold" style={{ color: data.color }}>{data.value}</span> {data.name}
        </p>
      </div>
    );
  }
  return null;
};


const AnalyticsCharts = ({ monthlySales, categoryData, statusData, topProducts, formatCurrency }) => {
  
  // FIX: Defensive coding for undefined props (addresses the reduce error)
  const safeMonthlySales = useMemo(() => monthlySales || [], [monthlySales]);
  const safeCategoryData = useMemo(() => categoryData || [], [categoryData]);
  const safeStatusData = useMemo(() => statusData || [], [statusData]);
  const safeTopProducts = useMemo(() => topProducts || [], [topProducts]);
  
  // Stats calculations using safe data
  const totalRevenue = safeMonthlySales.reduce((sum, day) => sum + (day.revenue || 0), 0);
  const totalOrders = safeMonthlySales.reduce((sum, day) => sum + (day.orders || 0), 0);
  const avgDailyRevenue = totalRevenue / (safeMonthlySales.length || 1);
  const orderConversion = (totalOrders / (safeMonthlySales.length || 1)) * 100;
  const peakRevenue = Math.max(...safeMonthlySales.map(day => day.revenue || 0));


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-inter">
      {/* Revenue Performance Chart (Composed Chart) - Original Logic Maintained */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
            <p className="text-sm text-gray-500">Daily performance metrics</p>
          </div>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg shadow-violet-500/50"></div>
              <span className="text-xs font-semibold text-gray-700">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50"></div>
              <span className="text-xs font-semibold text-gray-700">Order Volume</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {/* Using safeMonthlySales */}
            <ComposedChart data={safeMonthlySales}> 
              <defs>
                {/* Revenue Area Gradient */}
                <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                </linearGradient>
                {/* Orders Area Gradient */}
                <linearGradient id="ordersArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                {/* Revenue Line Gradient */}
                <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
                {/* Orders Line Gradient */}
                <linearGradient id="ordersLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }} padding={{ left: 20, right: 20 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }} tickFormatter={(value) => {
                if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                return `₹${value}`;
              }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }} tickFormatter={(value) => `${value}`} />
              
              <Tooltip content={<AnalyticsTooltip formatCurrency={formatCurrency} />} cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "5 5" }} />
              <Legend wrapperStyle={{ display: "none" }} />

              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="none" fill="url(#revenueArea)" fillOpacity={1} animationDuration={1500} />
              <Area yAxisId="right" type="monotone" dataKey="orders" stroke="none" fill="url(#ordersArea)" fillOpacity={1} animationDuration={1500} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="url(#revenueLine)" strokeWidth={3.5} dot={false} activeDot={{ r: 7, strokeWidth: 3, stroke: "#ffffff", fill: "#a855f7", style: { filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))' } }} strokeLinecap="round" animationDuration={1500} />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="url(#ordersLine)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 3, stroke: "#ffffff", fill: "#06b6d4", style: { filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))' } }} strokeLinecap="round" animationDuration={1500} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Daily Revenue</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrency(avgDailyRevenue)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Conversion</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {orderConversion.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Peak Performance</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrency(peakRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution Pie Chart (MODERN DONUT STYLE) */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Sales by Category</h3>
          <p className="text-sm text-gray-500">Product category distribution</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Gradients for Pie/Donut Slices */}
                {safeCategoryData.map((entry, index) => {
                  const colorConfig = PIE_COLORS_DATA[index % PIE_COLORS_DATA.length];
                  return (
                    <linearGradient key={`gradient-${index}`} id={colorConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colorConfig.color1} stopOpacity={1} />
                      <stop offset="100%" stopColor={colorConfig.color2} stopOpacity={1} />
                    </linearGradient>
                  );
                })}
                {/* Shadow Filter for Glow Effect */}
                <filter id="pieShadow" height="200%">
                  <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Using safeCategoryData */}
              <Pie
                data={safeCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={60} // Donut style
                outerRadius={90} // Donut size
                paddingAngle={4}
                dataKey="value"
                cornerRadius={10} // Rounded corners
                stroke="none"
              >
                {safeCategoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#${PIE_COLORS_DATA[index % PIE_COLORS_DATA.length].gradientId})`}
                    style={{ filter: 'url(#pieShadow)' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', fontSize: '14px', fontWeight: '500', color: '#334155' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Status Distribution Bar Chart */}
      
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
          <p className="text-sm text-gray-500">Distribution of order statuses</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {/* Using safeStatusData, set to vertical layout for horizontal bars */}
            <BarChart data={safeStatusData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                {/* Gradient for Horizontal Bars */}
                <linearGradient id={BAR_COLORS.gradientId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={BAR_COLORS.color1} stopOpacity={1} />
                  <stop offset="100%" stopColor={BAR_COLORS.color2} stopOpacity={1} />
                </linearGradient>
                {/* Shadow Filter for Glow Effect */}
                <filter id="barShadow" height="200%">
                  <feDropShadow dx="5" dy="0" stdDeviation="4" floodColor={BAR_COLORS.color1} floodOpacity="0.4" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} vertical={true} />
              {/* YAxis is now the category axis (Status Name) */}
              <YAxis dataKey="name" type="category" stroke="#6b7280" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
              {/* XAxis is the value axis (Count) */}
              <XAxis type="number" stroke="#6b7280" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
              <Tooltip content={<BarTooltip />} />
              <Legend wrapperStyle={{ display: "none" }} />
              <Bar
                dataKey="count"
                name="Orders"
                fill={`url(#${BAR_COLORS.gradientId})`}
                radius={[0, 8, 8, 0]} // Rounded corners on the right side
                barSize={30}
                style={{ filter: 'url(#barShadow)' }}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products - Original Style Maintained */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
          <p className="text-sm text-gray-500">By revenue and units sold</p>
        </div>
        <div className="space-y-4">
          {safeTopProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-indigo-50/50 rounded-xl transition duration-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                  <Package className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsCharts