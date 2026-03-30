import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import useApi from "../../../hooks/useApi";
import AdminPagination from "../AdminPagination";
import AdminOrderFilters from "./AdminOrderFilters";
import AdminOrderStats from "./AdminOrderStats";
import AdminOrdersTable from "./AdminOrdersTable";

const ORDERS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const listParams = useMemo(
    () => ({
      limit: ORDERS_PER_PAGE,
      offset: (currentPage - 1) * ORDERS_PER_PAGE,
      ...(searchTerm ? { q: searchTerm } : {}),
      ...(selectedStatus !== "all" ? { status: selectedStatus } : {}),
      ...(selectedPaymentMethod !== "all" ? { payment_method: selectedPaymentMethod } : {}),
      ...(dateFilter !== "all" ? { date_filter: dateFilter } : {}),
      ...(sortBy ? { sort: sortBy } : {}),
    }),
    [currentPage, dateFilter, searchTerm, selectedPaymentMethod, selectedStatus, sortBy],
  );

  const {
    data,
    loading,
    error,
    refetch,
    patchData,
  } = useApi("orders", { listParams });

  const orders = Array.isArray(data) ? data : data?.results || [];
  const orderSummary = data?.summary;
  const totalFilteredOrders = data?.total ?? orders.length;

  useEffect(() => {
    if (selectedOrder?.id) {
      const nextOrder = orders.find((order) => order.id === selectedOrder.id);
      if (nextOrder) {
        setSelectedOrder(nextOrder);
      }
    }
  }, [orders, selectedOrder]);

  const filteredOrders = orders;
  const totalPages = Math.max(1, Math.ceil(totalFilteredOrders / ORDERS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPaymentMethod, dateFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    totalOrders: orderSummary?.total_orders ?? orders.length,
    totalRevenue: Number(orderSummary?.total_revenue ?? orders.reduce((sum, order) => sum + Number(order.total || 0), 0)),
    pendingOrders: orderSummary?.pending_orders ?? orders.filter((order) => order.status === "pending").length,
    completedOrders: orderSummary?.completed_orders ?? orders.filter((order) => order.status === "completed").length,
    averageOrderValue: Number(
      orderSummary?.average_order_value ??
        (orders.length
          ? Math.round(orders.reduce((sum, order) => sum + Number(order.total || 0), 0) / orders.length)
          : 0),
    ),
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
        <p className="text-gray-600">Manage and update customer orders ({stats.totalOrders} orders)</p>
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
        paginatedOrders={orders}
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
        pagination={
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFilteredOrders}
            itemsPerPage={ORDERS_PER_PAGE}
            itemLabel="orders"
            onPageChange={setCurrentPage}
          />
        }
      />
    </div>
  );
};

export default AdminOrders;
