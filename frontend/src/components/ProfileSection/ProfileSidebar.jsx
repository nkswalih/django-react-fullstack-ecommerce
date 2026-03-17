import React from "react";
import { UserCircleIcon, ShoppingBagIcon, HeartIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

const menuItems = [
  { id: "overview", label: "Overview", Icon: UserCircleIcon, desc: "Your account summary" },
  { id: "orders", label: "My Orders", Icon: ClipboardDocumentListIcon, desc: "Track your purchases" },
  { id: "wishlist", label: "Wishlist", Icon: HeartIcon, desc: "Saved items" },
  { id: "cart", label: "My Cart", Icon: ShoppingBagIcon, desc: "Items in cart" },
];

const ProfileSidebar = ({ user, activeSection, setActiveSection }) => {
  const cartCount = user?.cart?.length || 0;
  const wishlistCount = user?.wishlist?.length || 0;
  const orderCount = user?.order?.length || 0;
  const counts = { orders: orderCount, wishlist: wishlistCount, cart: cartCount };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="lg:w-72 shrink-0 space-y-4">
      {/* Avatar Card */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center shadow-lg ring-4 ring-white/60">
              <span className="text-2xl font-bold text-white tracking-wide">{initials}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-tight">{user?.name || 'User'}</h2>
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-full px-2">{user?.email}</p>
          {user?.role && (
            <span className="mt-2 px-3 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest">{user.role}</span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: 'Orders', val: orderCount },
            { label: 'Wishlist', val: wishlistCount },
            { label: 'Cart', val: cartCount },
          ].map(s => (
            <div key={s.label} className="bg-white/60 border border-white/80 rounded-2xl py-2.5 text-center">
              <p className="text-lg font-bold text-gray-900 leading-none">{s.val}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {menuItems.map(({ id, label, Icon }) => {
            const count = counts[id] ?? null;
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all ${active
                    ? 'bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white'
                    : 'bg-white/0 text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                {count != null && count > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;