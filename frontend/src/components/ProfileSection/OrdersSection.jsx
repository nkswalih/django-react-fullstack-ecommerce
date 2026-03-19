import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBagIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { patchOrder, patchUser } from "../../api/apiService";
import { toast } from "react-toastify";

const OrdersSection = ({ user }) => {
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const orders = user?.order || [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Check if order can be cancelled
  const canCancelOrder = (order) => {
    const nonCancellableStatuses = ["shipped", "delivered", "completed", "cancelled", "refunded"];
    return !nonCancellableStatuses.includes(order.status?.toLowerCase());
  };

  // Cancel order function
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setLoading(true);
    setCancellingOrder(orderId);

    try {
      // First, update the order in orders collection
      await patchOrder(orderId, {
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      });

      // Then, update the order in user's order array
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: "cancelled", cancelledAt: new Date().toISOString() } : order
      );

      // Update user's orders in the database
      await patchUser(user.id, {
        order: updatedOrders
      });

      toast.success("Order cancelled successfully!");

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
      setCancellingOrder(null);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending";
  };

  // Get cancellation eligibility message
  const getCancellationMessage = (order) => {
    if (!canCancelOrder(order)) {
      if (order.status?.toLowerCase() === "cancelled") {
        return "Already cancelled";
      } else if (order.status?.toLowerCase() === "shipped") {
        return "Cannot cancel - order has been shipped";
      } else if (order.status?.toLowerCase() === "delivered") {
        return "Cannot cancel - order has been delivered";
      }
      return "Cannot cancel this order";
    }
    return null;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-dm-sans font-semibold text-gray-900 mb-6">
          Order History
        </h3>
        <div className="text-center py-12">
          <ShoppingBagIcon className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No orders yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Your orders will appear here once you make a purchase.
          </p>
          <Link
            to="/store"
            className="inline-block bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-400 hover:to-gray-700 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-dm-sans font-semibold text-gray-900 mb-6">
        Order History ({orders.length})
      </h3>

      <div className="space-y-4">
        {orders.map((order) => {
          const canCancel = canCancelOrder(order);
          const cancellationMessage = getCancellationMessage(order);

          return (
            <div
              key={order.id}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">
                      Order #{order.id?.substring(0, 8) || order.id}
                    </p>
                    {order.cancelledAt && (
                      <span className="text-xs text-red-600">
                        (Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-IN')})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Placed on: {order.date ? new Date(order.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Date not available'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>

                  {cancellationMessage && (
                    <span className="text-xs text-gray-500 text-right max-w-[150px]">
                      {cancellationMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.productName || item.name}
                        </span>
                        <div className="text-xs text-gray-500">
                          Qty: {item.quantity || 1} • Storage: {item.storage || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <span className="font-medium">
                      {formatPrice((item.productPrice || item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      Payment: <span className="font-medium capitalize">{order.paymentMethod || 'Not specified'}</span>
                    </p>
                    {order.customerInfo?.paymentMethod && (
                      <p className="text-xs text-gray-500">
                        via {order.customerInfo.paymentMethod}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(order.total || 0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Subtotal: {formatPrice(order.subtotal || order.total || 0)}
                    </p>
                  </div>
                </div>

                {/* Cancellation Button */}
                {canCancel && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={loading && cancellingOrder === order.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading && cancellingOrder === order.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4" />
                          Cancel Order
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Shipping Address (if available) */}
                {order.customerInfo?.address && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-1">Shipping Address:</p>
                    <p className="text-sm text-gray-600">
                      {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancellation Policy Info */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Cancellation Policy</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Orders can be cancelled before they are shipped</li>
          <li>Cancelled orders will be refunded within 5-7 business days</li>
          <li>Refund will be processed to your original payment method</li>
          <li>For shipped orders, please contact customer support for returns</li>
        </ul>
      </div>
    </div>
  );
};

export default OrdersSection;