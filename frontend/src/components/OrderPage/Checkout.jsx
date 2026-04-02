import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, getCart, createRazorpayOrder, verifyRazorpayPayment } from '../../api/apiService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  paymentMethod: 'razorpay',
};

const CheckoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoadingCart(false);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      firstName: currentUser.name?.split(' ')[0] || '',
      lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
      email: currentUser.email || '',
    }));

    const fetchCartItems = async () => {
      try {
        const response = await getCart();
        setCartItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error('Failed to load cart');
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCartItems();
  }, [currentUser]);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.productPrice || item.product_price || 0) * item.quantity, 0),
    [cartItems],
  );

  const shipping = subtotal > 50000 ? 0 : 99;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) return navigate('/sign_in');

    const requiredFields = ['firstName','lastName','email','phone','address','city','state','pincode'];
    if (requiredFields.some((f) => !String(formData[f] || '').trim())) {
      toast.error('Please complete all shipping fields');
      return;
    }

    const shippingPayload = {
    first_name: formData.firstName.trim(),
    last_name:  formData.lastName.trim(),
    email:      formData.email.trim(),
    phone:      formData.phone.trim(),
    address:    formData.address.trim(),
    city:       formData.city.trim(),
    state:      formData.state.trim(),
    pincode:    formData.pincode.trim(),
  };

  setLoading(true);

  // ── Non-Razorpay methods (COD / UPI direct / card) ──────────────────────
  if (formData.paymentMethod !== 'razorpay') {
    try {
      const response = await createOrder({
        payment_method: formData.paymentMethod,
        ...shippingPayload,
      });
      toast.success(`Order placed! ID: ${response.data.id}`);
      navigate(`/order-confirmation/${response.data.id}`, {
        state: { order: response.data },
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
    return;
  }

  // ── Razorpay flow ────────────────────────────────────────────────────────
  try {
    // Step 1: get rzp order_id from backend
    const { data: rzpData } = await createRazorpayOrder({});

    const options = {
      key:        rzpData.key_id,
      amount:     rzpData.amount,
      currency:   rzpData.currency,
      order_id:   rzpData.razorpay_order_id,
      name:       'Echo Store',
      description:'Your order',
      prefill: {
        name:  `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: '#111827' },

      handler: async (response) => {
        // Step 2: verify on backend, create DB order
        try {
          const verifyRes = await verifyRazorpayPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_signature:  response.razorpay_signature,
            ...shippingPayload,
          });

          toast.success(`Order confirmed! ID: ${verifyRes.data.id}`);
          navigate(`/order-confirmation/${verifyRes.data.id}`, {
            state: { order: verifyRes.data },
          });
        } catch (err) {
          toast.error('Payment received but order setup failed. Contact support.');
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          toast.info('Payment cancelled');
          setLoading(false);
        },
      },
    };

    if (!window.Razorpay) {
      toast.error('Payment system failed to load. Please refresh the page.');
      setLoading(false);
      return;
    }

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });
    rzp.open();

  } catch (error) {
    toast.error('Could not initiate payment. Please try again.');
    setLoading(false);
  }
};

  const inputClass = "w-full bg-white/50 border border-white/80 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all placeholder:text-gray-400 text-gray-800 text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";
  const bubbleButtonClass = "bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white transition-all hover:from-gray-400 hover:to-gray-700 active:scale-[0.98]";
  const glassPanelClass = "bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 lg:p-8";

  if (loadingCart) return <div className="min-h-screen bg-[#d9e8f5] flex items-center justify-center text-gray-600">Loading checkout...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] font-sans pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-xs uppercase tracking-widest mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              Review Cart
            </button>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 leading-none">Checkout</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <span className="text-gray-900 border-b-2 border-gray-900 pb-1">Shipping</span>
            <span>➔</span>
            <span>Payment</span>
            <span>➔</span>
            <span>Success</span>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-8 w-full">
            
            {/* Shipping Info */}
            <div className={glassPanelClass}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputClass} placeholder="John" />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass} placeholder="Doe" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="john@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+91 00000 00000" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Street Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className={`${inputClass} resize-none`} placeholder="House No, Building, Street..." />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>PIN</label>
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className={glassPanelClass}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Direct Credit/Debit Card Option */}
                <label className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all cursor-pointer hover:bg-white/40 ${formData.paymentMethod === 'card' ? 'border-gray-900 bg-white/60 shadow-lg' : 'border-transparent bg-white/20'}`}>
                  <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="hidden" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg" className="h-3" alt="Visa" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3" alt="MC" />
                    </div>
                    {formData.paymentMethod === 'card' && (
                      <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">Credit / Debit Card</span>
                  <span className="text-xs text-gray-500 mt-1">Direct Secure Payment</span>
                </label>

                {/* 2. Razorpay Option (Wallets & Netbanking) */}
                <label className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all cursor-pointer hover:bg-white/40 ${formData.paymentMethod === 'razorpay' ? 'border-gray-900 bg-white/60 shadow-lg' : 'border-transparent bg-white/20'}`}>
                  <input type="radio" name="paymentMethod" value="razorpay" checked={formData.paymentMethod === 'razorpay'} onChange={handleInputChange} className="hidden" />
                  <div className="flex justify-between items-start mb-4">
                    <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="h-6 w-6 object-contain" />
                    {formData.paymentMethod === 'razorpay' && (
                      <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">Wallets & Netbanking</span>
                  <span className="text-xs text-gray-500 mt-1">Secure Pay via Razorpay</span>
                </label>

                {/* 3. UPI Option */}
                <label className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all cursor-pointer hover:bg-white/40 ${formData.paymentMethod === 'upi' ? 'border-gray-900 bg-white/60 shadow-lg' : 'border-transparent bg-white/20'}`}>
                  <input type="radio" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={handleInputChange} className="hidden" />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-black text-blue-800">UPI</span>
                    {formData.paymentMethod === 'upi' && (
                      <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">Direct UPI / QR</span>
                  <div className="flex gap-3 mt-3 opacity-70">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" className="h-4" alt="GPay" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" className="h-4" alt="UPI" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1280px-PhonePe_Logo.svg.png" className="h-4" alt="PhonePe" />
                  </div>
                </label>

                {/* 4. Cash on Delivery Option */}
                <label className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all cursor-pointer hover:bg-white/40 ${formData.paymentMethod === 'cod' ? 'border-gray-900 bg-white/60 shadow-lg' : 'border-transparent bg-white/20'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="hidden" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    {formData.paymentMethod === 'cod' && (
                      <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">Cash on Delivery</span>
                  <span className="text-xs text-gray-500 mt-1">Pay at your doorstep</span>
                </label>

              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5 w-full sticky top-28">
            <div className={`${glassPanelClass} !p-0 overflow-hidden`}>
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-white/60 rounded-2xl flex items-center justify-center p-2 border border-white/80 shadow-sm shrink-0">
                        <img src={item.productImage || item.product_image} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.productName || item.product_name}</h4>
                        <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-tighter">
                          {item.storage} {item.ram && `• ${item.ram}`} • Qty {item.quantity}
                        </p>
                        <p className="font-bold text-gray-900 mt-1">₹{(Number(item.productPrice) * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/5 p-8 space-y-4">
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                   <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-gray-400">Total Payable</span>
                    <span className="text-[10px] text-gray-500">Includes all taxes</span>
                   </div>
                   <span className="text-3xl font-black text-gray-900 tracking-tight">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className={`w-full mt-6 py-5 rounded-3xl font-black uppercase tracking-widest text-sm ${bubbleButtonClass}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    `Complete Purchase`
                  )}
                </button>
              </div>
            </div>

            {/* Extra Trust Info */}
            <div className="mt-6 flex items-center justify-center gap-6 opacity-40">
               <div className="flex flex-col items-center gap-1">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 <span className="text-[10px] font-bold">SECURE SSL</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 <span className="text-[10px] font-bold">EASY RETURNS</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default CheckoutPage;