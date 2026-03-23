import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getOrders, getProducts, getUsers } from "../../../api/apiService";
import AnalyticsCharts from "./AnalyticsCharts";
import DashboardStats from "./DashboardStats";
import RecentActivity from "./RecentActivity";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes, productsRes] = await Promise.all([getUsers(), getOrders(), getProducts()]);
      setAnalytics(generateAnalyticsFromData({
        users: usersRes.data,
        orders: ordersRes.data,
        products: productsRes.data,
      }));
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsFromData = ({ users, orders, products }) => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;

    let totalSales = 0;
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        totalSales += item.quantity || 1;
      });
    });

    const ordersByDay = {};
    const today = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      ordersByDay[key] = {
        name: date.toLocaleString("default", { weekday: "short" }),
        revenue: 0,
        orders: 0,
        sales: 0,
        date,
      };
    }

    orders.forEach((order) => {
      const createdAt = order.createdAt || order.created_at;
      if (!createdAt) return;
      const key = new Date(createdAt).toISOString().split("T")[0];
      if (!ordersByDay[key]) return;
      ordersByDay[key].revenue += Number(order.total || 0);
      ordersByDay[key].orders += 1;
      order.items?.forEach((item) => {
        ordersByDay[key].sales += item.quantity || 1;
      });
    });

    const dailySales = Object.values(ordersByDay)
      .sort((a, b) => a.date - b.date)
      .map((day) => ({
        name: day.name,
        revenue: day.revenue,
        orders: day.orders,
        sales: day.sales,
      }));

    const categoryMap = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;
        const category = product.category || "Uncategorized";
        if (!categoryMap[category]) {
          categoryMap[category] = { name: category, value: 0, revenue: 0 };
        }
        categoryMap[category].value += item.quantity || 1;
        categoryMap[category].revenue += Number(item.itemTotal || 0);
      });
    });

    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];
    const categoryData = Object.values(categoryMap).map((category, index) => ({
      ...category,
      color: colors[index % colors.length],
    }));

    const productSales = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;
        if (!productSales[product.id]) {
          productSales[product.id] = {
            name: product.name,
            sales: 0,
            revenue: 0,
            category: product.category || "Uncategorized",
          };
        }
        productSales[product.id].sales += item.quantity || 1;
        productSales[product.id].revenue += Number(item.itemTotal || 0);
      });
    });

    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        customer: order.userName || order.userEmail || "Unknown",
        amount: Number(order.total || 0),
        status: order.status || "pending",
        date: order.createdAt || order.created_at,
      }));

    const statusData = [
      { name: "Confirmed", count: orders.filter((order) => order.status === "confirmed").length },
      { name: "Shipped", count: orders.filter((order) => order.status === "shipped").length },
      { name: "Pending", count: orders.filter((order) => order.status === "pending").length },
      { name: "Completed", count: orders.filter((order) => order.status === "completed").length },
    ];

    return {
      stats: {
        totalSales,
        totalOrders,
        totalRevenue,
        totalUsers,
      },
      monthlySales: dailySales,
      categoryData,
      statusData,
      topProducts,
      recentOrders,
    };
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
          <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, monthlySales, categoryData, statusData, topProducts, recentOrders } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.name || "Admin"}</p>
        </div>
      </div>

      <DashboardStats stats={stats} formatCurrency={formatCurrency} />
      <AnalyticsCharts
        monthlySales={monthlySales}
        categoryData={categoryData}
        statusData={statusData}
        topProducts={topProducts}
        formatCurrency={formatCurrency}
      />
      <RecentActivity recentOrders={recentOrders} stats={stats} formatCurrency={formatCurrency} navigate={navigate} />
    </div>
  );
};

export default AdminDashboard;
