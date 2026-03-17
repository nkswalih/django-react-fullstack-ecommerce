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

  const isAuthenticated = localStorage.getItem("isAuthenticated");

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
          bg-white/40 backdrop-blur-md shadow-xl
          rounded-2xl mx-4 mt-2
          lg:rounded-full lg:mx-44
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

            <Link to="/cart">
              <ShoppingBagIcon className="h-5 w-5 stroke-gray-900" />
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
          className="lg:hidden fixed inset-0 z-[60] bg-black/20"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              fixed right-4 top-20 z-[70]
              w-60 rounded-3xl
              bg-white/30 backdrop-blur-xl
              shadow-2xl ring-1 ring-white/30
              p-4
            "
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-800"
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="pt-4 border-t">
                {isAuthenticated ? (
                  <Link to="/profile">Profile</Link>
                ) : (
                  <>
                    <Link to="/sign_in">Sign in</Link>
                    <Link to="/sign_up">Create account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
