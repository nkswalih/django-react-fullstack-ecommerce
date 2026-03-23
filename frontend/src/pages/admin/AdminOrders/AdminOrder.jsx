import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import useApi from "../../../hooks/useApi";
import AdminOrderFilters from "./AdminOrderFilters";
import AdminOrderStats from "./AdminOrderStats";
import AdminOrdersTable from "./AdminOrdersTable";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price || 0);

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "completed":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentColor = (method) => {
  switch (method?.toLowerCase()) {
    case "card":
      return "bg-purple-100 text-purple-800";
    case "upi":
      return "bg-blue-100 text-blue-800";
    case "cod":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const statusOptions = ["pending", "confirmed", "shipped", "completed", "cancelled"];

const AdminOrders = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const {
    data: orders = [],
    loading,
    error,
    refetch,
    patchData,
  } = useApi("orders");

  useEffect(() => {
    if (selectedOrder?.id) {
      const nextOrder = orders.find((order) => order.id === selectedOrder.id);
      if (nextOrder) {
        setSelectedOrder(nextOrder);
      }
    }
  }, [orders, selectedOrder]);

  const filteredOrders = [...orders]
    .filter((order) => {
      const search = searchTerm.toLowerCase();
      const paymentMethod = order.paymentMethod || order.payment_method;
      const createdAt = order.createdAt || order.created_at;
      const shippingAddress = order.shippingAddress || order.shipping_address || {};

      const matchesSearch =
        String(order.id).toLowerCase().includes(search) ||
        (order.userName || "").toLowerCase().includes(search) ||
        (order.userEmail || "").toLowerCase().includes(search) ||
        (shippingAddress.full_name || "").toLowerCase().includes(search);

      const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
      const matchesPayment = selectedPaymentMethod === "all" || paymentMethod === selectedPaymentMethod;

      let matchesDate = true;
      if (createdAt && dateFilter !== "all") {
        const orderDate = new Date(createdAt);
        const now = new Date();
        switch (dateFilter) {
          case "today":
            matchesDate = orderDate.toDateString() === now.toDateString();
            break;
          case "this-week": {
            const startOfWeek = new Date();
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            matchesDate = orderDate >= startOfWeek;
            break;
          }
          case "this-month":
            matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdAt || a.created_at || 0);
      const bDate = new Date(b.createdAt || b.created_at || 0);
      switch (sortBy) {
        case "oldest":
          return aDate - bDate;
        case "total-high":
          return Number(b.total) - Number(a.total);
        case "total-low":
          return Number(a.total) - Number(b.total);
        case "newest":
        default:
          return bDate - aDate;
      }
    });

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  }, []);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        await patchData(orderId, { status: newStatus });
        toast.success(`Order status updated to ${newStatus}`);
      } catch (updateError) {
        toast.error("Failed to update order status");
        console.error("Error updating order status:", updateError);
      }
    },
    [patchData],
  );

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    completedOrders: orders.filter((order) => order.status === "completed").length,
    averageOrderValue: orders.length
      ? Math.round(orders.reduce((sum, order) => sum + Number(order.total || 0), 0) / orders.length)
      : 0,
  };

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
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button onClick={refetch} className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600">Manage and update customer orders ({orders.length} orders)</p>
      </div>

      <AdminOrderStats stats={stats} formatPrice={formatPrice} />
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
  );
};

export default AdminOrders;
