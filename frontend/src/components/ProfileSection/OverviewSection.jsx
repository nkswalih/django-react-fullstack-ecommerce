import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBagIcon, HeartIcon, EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";

const OverviewSection = ({ user, setActiveSection }) => {
  const cartItems = user?.cart || [];
  const wishlistItems = user?.wishlist || [];
  const orders = user?.order || [];

  const statCards = [
    {
      id: 'cart', label: 'Shopping Cart', sub: 'Items in cart',
      count: cartItems.length, link: 'View Cart',
      Icon: ShoppingBagIcon,
      iconBg: 'bg-sky-100', iconColor: 'text-sky-600',
    },
    {
      id: 'orders', label: 'My Orders', sub: 'Orders placed',
      count: orders.length, link: 'View Orders',
      Icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      ),
      iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    },
    {
      id: 'wishlist', label: 'Wishlist', sub: 'Saved items',
      count: wishlistItems.length, link: 'View Wishlist',
      Icon: HeartIcon,
      iconBg: 'bg-rose-100', iconColor: 'text-rose-500',
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-950 rounded-2xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Subtle bg glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Welcome back</p>
            <h2 className="text-2xl font-bold leading-tight">
              {user?.name?.split(' ')[0] || 'User'}! 👋
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {cartItems.length > 0
                ? `You have ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} waiting in your cart.`
                : 'Ready to discover your next favourite tech?'}
            </p>
          </div>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/20 transition-all shrink-0"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ id, label, sub, count, link, Icon, iconBg, iconColor }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className="bg-white/50 backdrop-blur-md border border-white/70 rounded-2xl p-5 text-left hover:bg-white/80 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <p className="text-sm font-semibold text-gray-700">{label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{count}</p>
            <p className="text-xs text-gray-500">{sub}</p>
            <p className="mt-3 text-xs font-semibold text-gray-500 group-hover:text-gray-800 transition-colors">
              {link} →
            </p>
          </button>
        ))}
      </div>

      {/* Personal Info */}
      <div className="bg-white/50 backdrop-blur-md border border-white/70 rounded-2xl p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { Icon: EnvelopeIcon, label: 'Email', value: user?.email || '—' },
            { Icon: UserIcon, label: 'Full Name', value: user?.name || '—' },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-4 bg-white/60 border border-white/80 rounded-2xl">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;