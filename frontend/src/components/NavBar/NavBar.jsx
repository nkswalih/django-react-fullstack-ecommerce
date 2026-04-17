import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Bars3Icon,
  ShoppingBagIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AuthButton from "../ui/AuthButton";
import SearchDropdown from "../ui/SearchDropDown.jsx";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext.jsx";

// Nav item
const NavItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-300
        ${isActive
          ? "text-white bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600"
          : "text-gray-900 hover:bg-gray-100/50"
        }`
      }
    >
      {label}
    </NavLink>
  );
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/store", label: "Store" },
    { path: "/apple", label: "Apple" },
    { path: "/laptop", label: "Lap" },
    { path: "/accessories", label: "Accessories" },
    { path: "/support", label: "Support" },
  ];

  /* 🔑 IMPORTANT PART */
  const navContainerClasses = `
    fixed top-0 left-0 right-0 z-[999999] transition-all duration-500 ease-out
    ${scrolled && !mobileMenuOpen
      ? `
          bg-white shadow-xl
          rounded-2xl mx-4 mt-2
          lg:rounded-full lg:mx-44
          backdrop-blur-md bg-white/40
          
        `
      : `
          bg-transparent
          mx-0 mt-0
        `
    }
  `;

  return (
    <div className={navContainerClasses}>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14">
        <div className="flex h-14 items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-10">
            <Link to="/">
              <img
                src="/Echoo-transparent.png"
                alt="EchOo"
                className="h-7"
              />
            </Link>

            <div className="hidden lg:flex gap-2">
              {navItems.map((item) => (
                <NavItem key={item.path} to={item.path} label={item.label} />
              ))}
            </div>
          </div>

         {/* RIGHT */}
          <div className="flex items-center gap-5">
            <SearchDropdown />

            {/* CART ICON WITH BADGE */}
            <Link to="/cart" className="relative flex items-center">
              <ShoppingBagIcon className="h-5 w-5 stroke-gray-900" />
              
              {/* BADGE UI */}
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-gray-900 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link to="/profile">
                <UserCircleIcon className="h-5 w-5 stroke-gray-900" />
              </Link>
            ) : (
              <AuthButton />
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden"
            >
              <Bars3Icon className="h-6 w-6 stroke-gray-900" />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU — UNCHANGED */}
      {mobileMenuOpen && (
  <div
    className="lg:hidden fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity"
    onClick={() => setMobileMenuOpen(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        fixed right-4 top-20 z-[70]
        w-64 rounded-3xl
        bg-white
        shadow-2xl ring-1 ring-black/5
        p-5
      "
    >
      {/* Close Button Header */}
      <div className="flex justify-end pb-2">
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="mt-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-3 text-base font-medium text-gray-800 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Auth Section - Improved Design */}
      <div className="pt-5 mt-4 border-t border-gray-100">
        {isAuthenticated ? (
          <Link 
            to="/profile"
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </Link>
        ) : (
          /* Added flex-col and gap-3 for perfect vertical spacing */
          <div className="flex flex-col gap-3">
            <Link 
              to="/sign_in"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              to="/sign_up"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
