import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { getOrderById } from '../../api/apiService';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await getOrderById(orderId);
        setOrder(response.data);
      } catch (fetchError) {
        console.error('Error fetching order:', fetchError);
        setError(fetchError.response?.data?.detail || 'Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'We could not find that order.'}</p>
          <Link
            to="/profile?section=orders"
            className="block w-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white py-3 rounded-xl font-medium hover:from-gray-400 hover:to-gray-700 transition-colors"
          >
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>

        <p className="text-gray-600 mb-2">Thank you for your purchase</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
          <p className="text-sm text-gray-500">
            Order ID: <span className="font-mono text-gray-800">{order.id}</span>
          </p>
          <p className="text-sm text-gray-500">
            Date: <span className="text-gray-800">{formatDate(order.createdAt || order.created_at)}</span>
          </p>
          <p className="text-sm text-gray-500">
            Status: <span className="capitalize text-gray-800">{order.status}</span>
          </p>
          <p className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
          </p>
        </div>

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
