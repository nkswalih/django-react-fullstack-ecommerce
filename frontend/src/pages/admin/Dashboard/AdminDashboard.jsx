import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardStats from './DashboardStats'
import AnalyticsCharts from './AnalyticsCharts'
import RecentActivity from './RecentActivity'
import { getUsers, getOrders, getProducts } from '../../../api/apiService'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  // Get current user
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }, [])

  // Fetch and analyze data
  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch data from JSON Server
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        getUsers(),
        getOrders(),
        getProducts()
      ])

      if (!usersRes.data || !ordersRes.data || !productsRes.data) {
        throw new Error('Failed to fetch data')
      }

      const users = usersRes.data
      const orders = ordersRes.data
      const products = productsRes.data

      // Process the data to generate analytics
      const analyticsData = generateAnalyticsFromData({ users, orders, products })
      setAnalytics(analyticsData)
      
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  
  const generateAnalyticsFromData = ({ users, orders, products }) => {
    // Calculate basic stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalUsers = users.length
    
    // Calculate total sales (sum of all item quantities)
    let totalSales = 0
    orders.forEach(order => {
      order.items.forEach(item => {
        totalSales += item.quantity || 1 // Use quantity if available, otherwise count as 1
      })
    })

   
    const dailySales = []
    const ordersByDay = {}
    
    const today = new Date()
    
    //array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
      const dayName = date.toLocaleString('default', { weekday: 'short' })
      
      ordersByDay[dateString] = {
        name: dayName,
        revenue: 0,
        orders: 0,
        sales: 0,
        date: date
      }
    }
    
    // Process orders and group by day
    orders.forEach(order => {
      if (!order.date) return
      
      const orderDate = new Date(order.date)
      const dateString = orderDate.toISOString().split('T')[0] // YYYY-MM-DD
      
      if (ordersByDay[dateString]) {
        ordersByDay[dateString].revenue += order.total
        ordersByDay[dateString].orders += 1
        order.items.forEach(item => {
          ordersByDay[dateString].sales += item.quantity || 1
        })
      }
    })
    
    // Convertto array sorting by date
    Object.values(ordersByDay)
      .sort((a, b) => a.date - b.date)
      .forEach(dayData => {
        dailySales.push({
          name: dayData.name,
          revenue: dayData.revenue,
          orders: dayData.orders,
          sales: dayData.sales
        })
      })

    // If don't have data for all days, fill with zeros or estimate one

    if (dailySales.length === 0 || dailySales.every(day => day.revenue === 0)) {
      // Show last 7 days with sample data based on averages
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const dailyAverageRevenue = totalOrders > 0 ? totalRevenue / 7 : 0
      const dailyAverageOrders = totalOrders > 0 ? totalOrders / 7 : 0
      
      dailySales.length = 0
      
      daysOfWeek.forEach((day, index) => {
        
        const variation = 0.7 + Math.random() * 0.6 // 0.7 to 1.3
        dailySales.push({
          name: day,
          revenue: Math.floor(dailyAverageRevenue * variation),
          orders: Math.floor(dailyAverageOrders * variation),
          sales: Math.floor((totalSales / 7) * variation)
        })
      })
    }

    
    const categoryData = []
    const categoryMap = {}
    
   
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          const category = product.category || 'Uncategorized'
          if (!categoryMap[category]) {
            categoryMap[category] = {
              name: category,
              value: 0,
              revenue: 0
            }
          }
          categoryMap[category].value += item.quantity || 1
          categoryMap[category].revenue += (item.itemTotal || (item.productPrice * (item.quantity || 1)))
        }
      })
    })
    
    // Convert to array and add colors
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE']
    Object.values(categoryMap).forEach((cat, index) => {
      categoryData.push({
        ...cat,
        color: colors[index % colors.length]
      })
    })

    // Generate top selling products
    const productSales = {}
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          if (!productSales[product.id]) {
            productSales[product.id] = {
              name: product.name,
              sales: 0,
              revenue: 0,
              category: product.category || 'Uncategorized'
            }
          }
          productSales[product.id].sales += item.quantity || 1
          productSales[product.id].revenue += (item.itemTotal || (item.productPrice * (item.quantity || 1)))
        }
      })
    })
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Get recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        customer: order.customerInfo?.name || order.userName || 'Unknown',
        amount: order.total,
        status: order.status || 'pending',
        date: order.date ? new Date(order.date).toLocaleDateString() : 'N/A'
      }))

    // Generate order status distribution for bar chart
    const statusData = [
      { name: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
      { name: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
      { name: 'Pending', count: orders.filter(o => o.status === 'pending' || !o.status).length },
      { name: 'Completed', count: orders.filter(o => o.status === 'completed').length }
    ]

    return {
      stats: {
        totalSales,
        totalOrders,
        totalRevenue,
        totalUsers
      },
      monthlySales: dailySales, // Using dailySales as monthlySales for the chart
      categoryData,
      statusData,
      topProducts,
      recentOrders
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { stats, monthlySales, categoryData, statusData, topProducts, recentOrders } = analytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.name || 'Admin'}</p>
        </div>
      </div>

      <DashboardStats 
        stats={stats} 
        formatCurrency={formatCurrency} 
      />

      <AnalyticsCharts 
        monthlySales={monthlySales}
        categoryData={categoryData}
        statusData={statusData}
        topProducts={topProducts}
        formatCurrency={formatCurrency}
      />

      <RecentActivity 
        recentOrders={recentOrders}
        stats={stats}
        formatCurrency={formatCurrency}
        navigate={navigate}
      />
    </div>
  )
}

export default AdminDashboard