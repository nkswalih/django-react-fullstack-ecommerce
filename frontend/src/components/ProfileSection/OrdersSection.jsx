import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBagIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import { cancelOrder } from "../../api/apiService";

const OrdersSection = ({ user, onRefresh }) => {
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const orders = user?.order || [];

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);

  const canCancelOrder = (order) => !["shipped", "completed", "cancelled"].includes(order.status?.toLowerCase());

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "processing":
        return "bg-blue-100 text-blue-800";

      case "shipped":
        return "bg-purple-100 text-purple-800";

      case "completed":
        return "bg-green-100 text-green-800";

      case "confirmed":
        return "bg-green-100 text-green-800";

      case "cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      await cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      await onRefresh?.();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error?.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  };

  if (!orders.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-dm-sans font-semibold text-gray-900 mb-6">Order History</h3>
        <div className="text-center py-12">
          <ShoppingBagIcon className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No orders yet</p>
          <p className="text-sm text-gray-400 mb-4">Your orders will appear here once you make a purchase.</p>
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
      <h3 className="text-lg font-dm-sans font-semibold text-gray-900 mb-6">Order History ({orders.length})</h3>

      <div className="space-y-4">
        {orders.map((order) => {
          const shippingAddress = order.shippingAddress || order.shipping_address || {};

          return (
            <div key={order.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-sm transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    Placed on{" "}
                    {new Date(order.createdAt || order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
                        <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{item.productName}</span>
                        <div className="text-xs text-gray-500">
                          Qty: {item.quantity}
                          {item.storage ? ` • Storage: ${item.storage}` : ""}
                          {item.ram ? ` • RAM: ${item.ram}` : ""}
                        </div>
                      </div>
                    </div>
                    <span className="font-medium">{formatPrice(item.itemTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      Payment: <span className="font-medium capitalize">{order.paymentMethod || order.payment_method}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Ship to: {shippingAddress.full_name || user?.name}, {shippingAddress.city || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(order.total)}</p>
                    <p className="text-sm text-gray-500">Subtotal: {formatPrice(order.subtotal)}</p>
                  </div>
                </div>

                {canCancelOrder(order) && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingOrder === order.id ? (
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersSection;
