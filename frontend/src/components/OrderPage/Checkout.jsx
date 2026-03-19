import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserById, patchUser, getProductById, patchProduct, createOrder } from '../../api/apiService';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'card'
  });

  // Get current user from localStorage
  useEffect(() => {
    const getUserFromStorage = () => {
      const userString = localStorage.getItem('currentUser');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setCurrentUser(user);
          return user;
        } catch (e) {
          console.error('Error parsing currentUser:', e);
          return null;
        }
      }
      return null;
    };

    const user = getUserFromStorage();
    if (user) {
      fetchCartItems(user.id);
    } else {
      showNotification('Please log in to checkout', 'error');
      setLoadingCart(false);
    }
  }, []);

  // Show notification helper
  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  // Fetch cart items from server using current user ID
  const fetchCartItems = async (userId) => {
    try {
      setLoadingCart(true);
      const response = await getUserById(userId);
      
      // Set cart items from user's cart
      const userCart = response.data?.cart || [];
      setCartItems(userCart);
      
      // Auto-fill user data if available
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          firstName: response.data.name?.split(' ')[0] || '',
          lastName: response.data.name?.split(' ')[1] || '',
          email: response.data.email || ''
        }));
      }
      
    } catch (error) {
      console.error('Error fetching cart:', error);
      if(error.response?.status === 404) {
        showNotification('User not found. Please log in again.', 'error');
        setCartItems([]);
      } else {
        showNotification('Failed to load cart items', 'error');
      }
    } finally {
      setLoadingCart(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.productPrice || 0) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 50000 ? 0 : 99;
    return subtotal + shipping;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fetch product data to check real-time stock
const fetchProduct = async (productId) => {
  try {
    const response = await getProductById(productId);
    if (!response.data) {
      throw new Error(`Product ${productId} not found`);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.response?.status === 404) {
      throw new Error(`Product ${productId} not found in database`);
    }
    throw error;
  }
};

  // Update product stock
  const updateStock = async (productId, newStock) => {
    try {
      await patchProduct(productId, {
        stock: newStock 
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  // Clear cart on server (Empty the user's cart array)
  const clearCart = async () => {
    if (!currentUser) return;
    
    try {
      // Update user's cart to empty array
      await patchUser(currentUser.id, {
        cart: []
      });
      
      // Update localStorage user data
      const updatedUser = { ...currentUser, cart: [] };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
  if (!currentUser) {
    showNotification("Please log in to place an order", "error");
    return;
  }

  // Validate form
  if (!formData.firstName || !formData.lastName || !formData.email || 
      !formData.phone || !formData.address || !formData.city || 
      !formData.state || !formData.pincode) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (!cartItems.length) {
    showNotification("Cart is empty", "error");
    return;
  }

  setLoading(true);

  try {
    const originalStocks = {};
    
    // Check stock availability for all items
    for (const item of cartItems) {
      // FIX: Try both productId and id fields
      const productId = item.productId || (item.id && item.id.split('-')[0]);
      
      if (!productId) {
        showNotification(`Invalid product in cart: ${item.productName}`, "error");
        setLoading(false);
        return;
      }
      
      const product = await fetchProduct(productId);
      originalStocks[product.id] = product.stock ?? 0;

      if ((product.stock ?? 0) < item.quantity) {
        showNotification(`Not enough stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`, "error");
        setLoading(false);
        return;
      }
    }

    // Update stock for all items
    for (const item of cartItems) {
      // FIX: Try both productId and id fields
      const productId = item.productId || (item.id && item.id.split('-')[0]);
      const newStock = originalStocks[productId] - item.quantity;
      await updateStock(productId, newStock);
    }

    //Create order object
    const order = {
      id: 'ORD' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      date: new Date().toISOString(),
      items: cartItems.map(item => ({
        ...item,
        // Ensure productId is properly included
        productId: item.productId || (item.id && item.id.split('-')[0]),
        itemTotal: item.productPrice * item.quantity
      })),
      subtotal: calculateSubtotal(),
      shipping: calculateSubtotal() > 50000 ? 0 : 99,
      total: calculateTotal(),
      status: 'pending',
      customerInfo: {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`
      },
      paymentMethod: formData.paymentMethod
    };

    // Save order to server
    await createOrder(order);

    //  Also add order to user's orders array
    try {
      const userResponse = await getUserById(currentUser.id);
      const user = userResponse.data;
      const updatedUserOrders = [...(user.order || []), order];
      
      await patchUser(currentUser.id, {
        order: updatedUserOrders
      });
    } catch (error) {
      console.error('Error updating user orders:', error);
      // Continue even if updating user orders fails
    }

    // Clear cart on server
    await clearCart();

    showNotification('Order placed successfully!', 'success');

    //Show success and redirect
    setTimeout(() => {
      toast.success(`Order placed successfully!\nOrder ID: ${order.id}\nTotal: ₹${order.total.toLocaleString('en-IN')}`);
      navigate('/cart'); // Or redirect to orders page
    }, 1000);

  } catch (error) {
    console.error('Error placing order:', error);
    // More specific error message
    if (error.response) {
      if (error.response.status === 404) {
        showNotification('Product not found. Please refresh and try again.', 'error');
      } else if (error.response.status === 400) {
        showNotification('Bad request. Please check your data.', 'error');
      } else {
        showNotification('Failed to place order. Please try again.', 'error');
      }
    } else {
      showNotification('Network error. Please check your connection.', 'error');
    }
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
            onClick={() => navigate('/login')}
            className="bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-400 hover:to-gray-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Hello, {currentUser.name}!</p>
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
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
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

          {/* Order Summary & Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white  rounded-lg flex items-center justify-center">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/40?text=No+Image";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-gray-500 text-sm">
                          {item.storage} | {item.ram} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ₹{(item.productPrice * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{calculateSubtotal() > 50000 ? 'Free' : '₹99'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
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

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white py-4 rounded-xl font-semibold hover:from-gray-400 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Placing Order...' : `Place Order - ₹${calculateTotal().toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;