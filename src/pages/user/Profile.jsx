import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowPathIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import ProfileSidebar from "../../components/ProfileSection/ProfileSidebar";
import OverviewSection from "../../components/ProfileSection/OverviewSection";
import OrdersSection from "../../components/ProfileSection/OrdersSection";
import WishlistSection from "../../components/ProfileSection/WishlistSection";
import CartSection from "../../components/ProfileSection/CartSection";
import SimpleFooter from "../../components/SimpleFoot";

const Profile = () => {
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000";

  const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
    catch { return null; }
  };

  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/profile/orders')) setActiveSection('orders');
    else if (path.includes('/profile/wishlist')) setActiveSection('wishlist');
    else if (path.includes('/profile/cart')) setActiveSection('cart');
    else setActiveSection('overview');

    if (currentUser?.id) fetchUserData(currentUser.id);
    else { setLoading(false); navigate('/sign_in'); }
  }, []);

  useEffect(() => {
    const paths = { overview: '/profile', orders: '/profile/orders', wishlist: '/profile/wishlist', cart: '/profile/cart' };
    navigate(paths[activeSection] || '/profile');
  }, [activeSection]);

  const fetchUserData = async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/users/${id}`);
      localStorage.setItem('currentUser', JSON.stringify(data));
      setCurrentUser(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    ['currentUser', 'isAuthenticated', 'user', 'activeUserId'].forEach(k => localStorage.removeItem(k));
    navigate("/sign_in");
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-gray-700 animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading your profile...</p>
      </div>
    </div>
  );

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!currentUser) return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] flex flex-col items-center justify-center gap-4 p-6"
      style={{ fontFamily: "'SF Pro Display','DM Sans',-apple-system,sans-serif" }}>
      <h2 className="text-2xl font-semibold text-gray-900">Please Sign In</h2>
      <button onClick={() => navigate("/sign_in")}
        className="px-6 py-3 rounded-full bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white font-semibold hover:from-gray-400 hover:to-gray-700 transition-all">
        Go to Login
      </button>
    </div>
  );

  const sectionLabels = { overview: 'Overview', orders: 'My Orders', wishlist: 'Wishlist', cart: 'My Cart' };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#d9e8f5] via-[#e2ebf4] to-[#f4f7fa] pt-20 pb-16"
      style={{ fontFamily: "'SF Pro Display','DM Sans',-apple-system,BlinkMacSystemFont,sans-serif" }}
    >
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">My Account</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              {sectionLabels[activeSection]}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, <span className="font-medium text-gray-700">{currentUser.name?.split(' ')[0]}</span>!</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUserData(currentUser.id)}
              title="Refresh"
              className="w-10 h-10 rounded-full bg-white/50 border border-white/70 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-800 transition-all shadow-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 border border-white/70 text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-sm"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <ProfileSidebar
            user={currentUser}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />

          {/* Content Panel */}
          <div className="flex-1 min-w-0">
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
              {activeSection === "overview" && <OverviewSection user={currentUser} setActiveSection={setActiveSection} />}
              {activeSection === "orders" && <OrdersSection user={currentUser} />}
              {activeSection === "wishlist" && <WishlistSection user={currentUser} />}
              {activeSection === "cart" && <CartSection user={currentUser} />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12"><SimpleFooter /></div>
    </div>
  );
};

export default Profile;