import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, getCart } from '../../api/apiService';
import { toast } from 'react-toastify';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  paymentMethod: 'card',
};

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
  };

  useEffect(() => {
    if (!notification.show) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotification({ show: false, message: '', type: 'error' });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [notification.show]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      setLoadingCart(false);
      showNotification('Please log in to checkout', 'error');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        firstName: parsedUser.name?.split(' ')[0] || '',
        lastName: parsedUser.name?.split(' ').slice(1).join(' ') || '',
        email: parsedUser.email || '',
      }));
    } catch (error) {
      console.error('Error parsing current user:', error);
      setLoadingCart(false);
      showNotification('Please log in again', 'error');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await getCart();
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching cart:', error);
        showNotification(error.response?.data?.detail || 'Failed to load cart items', 'error');
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartItems();
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.productPrice || item.product_price || 0) * item.quantity, 0),
    [cartItems],
  );

  const shipping = subtotal > 50000 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      showNotification('Please log in to place an order', 'error');
      return;
    }

    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const hasMissingFields = requiredFields.some((field) => !String(formData[field] || '').trim());

    if (hasMissingFields) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (!cartItems.length) {
      showNotification('Cart is empty', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await createOrder({
        payment_method: formData.paymentMethod,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      const createdOrder = response.data;
      toast.success(`Order placed successfully! Order ID: ${createdOrder.id}`);
      navigate(`/order-confirmation/${createdOrder.id}`, { state: { order: createdOrder } });
    } catch (error) {
      console.error('Error placing order:', error);
      const message =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.[0] ||
        error.response?.data?.error ||
        'Failed to place order. Please try again.';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to checkout.</p>
          <button
            onClick={() => navigate('/sign_in')}
            className="bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-400 hover:to-gray-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Hello, {currentUser.name || currentUser.email}!</p>
          <button
            onClick={() => navigate('/store')}
            className="bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-400 hover:to-gray-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <img
                          src={item.productImage || item.product_image}
                          alt={item.productName || item.product_name}
                          className="w-10 h-10 object-contain"
                          onError={(event) => {
                            event.target.onerror = null;
                            event.target.src = 'https://via.placeholder.com/40?text=No+Image';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.productName || item.product_name}</p>
                        <p className="text-gray-500 text-sm">
                          {[item.storage, item.ram].filter(Boolean).join(' | ')} {` Qty: ${item.quantity}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      Rs.{(Number(item.productPrice || item.product_price || 0) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs.{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : 'Rs.99'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>Rs.{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="text-gray-600 focus:ring-gray-500"
                  />
                  <span>Credit/Debit Card</span>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleInputChange}
                    className="text-gray-600 focus:ring-gray-500"
                  />
                  <span>UPI</span>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="text-gray-600 focus:ring-gray-500"
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white py-4 rounded-xl font-semibold hover:from-gray-400 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Placing Order...' : `Place Order - Rs.${total.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
