import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const OrderConfirmation = () => {
  const { orderId } = useParams();

  // In a real app, you'd fetch the order details
  const order = {
    id: orderId,
    date: new Date().toLocaleDateString(),
    total: 0, // You'd calculate this
    status: 'confirmed'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Order Confirmed!
        </h1>

        <p className="text-gray-600 mb-2">
          Thank you for your purchase
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Order ID: <span className="font-mono">{orderId}</span>
        </p>

        <div className="space-y-4">
          <Link
            to="/profile?section=orders"
            className="block w-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white py-3 rounded-xl font-medium hover:from-gray-400 hover:to-gray-700 transition-colors"
          >
            View Order Details
          </Link>

          <Link
            to="/store"
            className="block w-full border border-gray-300 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;