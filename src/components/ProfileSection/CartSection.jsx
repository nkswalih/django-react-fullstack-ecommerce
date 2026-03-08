import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBagIcon, TrashIcon } from "@heroicons/react/24/outline";

const CartSection = ({ user }) => {
  const cartItems = user?.cart || [];
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-dm-sans font-semibold text-gray-900 mb-6">
          My Cart
        </h3>
        <div className="text-center py-12">
          <ShoppingBagIcon className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Your cart is empty</p>
          <Link
            to="/store"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-dm-sans font-semibold text-gray-900 mb-6">
        My Cart ({cartItems.length} items)
      </h3>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/64?text=No+Image";
                }}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {item.productName}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                {item.storage && <span>Storage: {item.storage}</span>}
                {item.ram && <span>RAM: {item.ram}</span>}
              </div>
              <p className="text-lg font-dm-sans font-bold text-gray-900 mt-2">
                {formatPrice(item.productPrice)} × {item.quantity}
              </p>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <TrashIcon className="size-4" />
            </button>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="font-semibold text-gray-900">
            Total:{" "}
            {formatPrice(
              cartItems.reduce(
                (total, item) => total + item.productPrice * item.quantity,
                0
              )
            )}
          </span>
          <Link
            to="/cart"
            className="bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:from-gray-400 hover:to-gray-700 transition-colors"
          >
            Go to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartSection;