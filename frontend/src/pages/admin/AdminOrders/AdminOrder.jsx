import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import useApi from '../../../hooks/useApi'
import AdminOrderStats from './AdminOrderStats'
import AdminOrderFilters from './AdminOrderFilters'
import AdminOrdersTable from './AdminOrdersTable'

// Helper functions (moved from the original component)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentColor = (method) => {
  switch (method?.toLowerCase()) {
    case 'card':
    case 'credit':
      return 'bg-purple-100 text-purple-800';
    case 'upi':
      return 'bg-blue-100 text-blue-800';
    case 'cod':
      return 'bg-orange-100 text-orange-800';
    case 'netbanking':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const statusOptions = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'
];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { 
    data: orders = [], 
    loading, 
    error, 
    refetch,
    patchData 
  } = useApi("orders");

  // Get users data to update user's orders
  const { 
    data: users = [],
    refetch: refetchUsers,
    patchData: patchUserData 
  } = useApi("users");

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesPayment = selectedPaymentMethod === 'all' || 
        (order.paymentMethod || order.customerInfo?.paymentMethod) === selectedPaymentMethod;
      
      // Date filtering
      const orderDate = new Date(order.date);
      const now = new Date();
      let matchesDate = true;
      
      switch(dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case 'this-week':
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          matchesDate = orderDate >= startOfWeek;
          break;
        case 'this-month':
          matchesDate = orderDate.getMonth() === now.getMonth() && 
                       orderDate.getFullYear() === now.getFullYear();
          break;
        default:
          matchesDate = true;
      }
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'total-high':
          return b.total - a.total;
        case 'total-low':
          return a.total - b.total;
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  // View order details
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  }, []);

  // Update order status in both orders and users/orders
  const handleUpdateStatus = useCallback(async (orderId, newStatus) => {
    try {
      // Update in orders collection
      await patchData(orderId, { status: newStatus });
      
      // Find the user who placed this order
      const orderToUpdate = orders.find(order => order.id === orderId);
      if (orderToUpdate?.userId) {
        // Find the user
        const user = users.find(u => u.id === orderToUpdate.userId);
        if (user) {
          // Update the order in user's orders array
          const updatedUserOrders = user.order.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          );
          
          // Update user data
          await patchUserData(user.id, { order: updatedUserOrders });
        }
      }
      
      toast.success(`Order status updated to ${newStatus}`);
      refetch(); // Refresh orders data
      refetchUsers(); // Refresh users data
      // If the modal is open, ensure the selected order status is updated immediately
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
      
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  }, [orders, users, patchData, patchUserData, refetch, refetchUsers]);

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
    averageOrderValue: orders.length > 0 ? 
      Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length) : 0
  };

  // Loading/Error handling
  if (loading && !orders.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error loading orders</div>
        <div className="text-red-600 text-sm mt-1">{error.message || error}</div>
        <button
          onClick={refetch}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600">Manage and update customer orders ({orders.length} orders)</p>
      </div>

      {/* Stats Cards */}
      <AdminOrderStats 
        stats={stats} 
        formatPrice={formatPrice} 
      />

      {/* Search and Filter Bar */}
      <AdminOrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        statusOptions={statusOptions}
      />

      {/* Orders Table */}
      <AdminOrdersTable
        filteredOrders={filteredOrders}
        handleViewDetails={handleViewDetails}
        handleUpdateStatus={handleUpdateStatus}
        formatDate={formatDate}
        formatPrice={formatPrice}
        getStatusColor={getStatusColor}
        getPaymentColor={getPaymentColor}
        statusOptions={statusOptions}
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedPaymentMethod={selectedPaymentMethod}
        dateFilter={dateFilter}
      />
    </div>
  )
}

export default AdminOrders