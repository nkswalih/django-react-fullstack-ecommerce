import React, { useState } from 'react';
import { ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { getUserById, patchUser } from '../../api/apiService';

const ProductActions = ({ product, selectedOptions, quantity, onQuantityChange }) => {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToBag = async () => {
    if (addingToCart || product.stock === 0) return;

    setAddingToCart(true);

    try {
      // Get current user from localStorage (the logged-in user)
      const currentUserString = localStorage.getItem('currentUser');

      if (!currentUserString) {
        toast.error("Please log in to add items to cart");
        setAddingToCart(false);
        return;
      }

      const currentUser = JSON.parse(currentUserString);
      const userId = currentUser.id;

      console.log('Found user:', userId, currentUser.name);

      const cartItem = {
        id: `${product.id}-${selectedOptions.storage}-${selectedOptions.ram}`,
        productId: product.id,
        storage: selectedOptions.storage,
        ram: selectedOptions.ram,
        quantity: quantity,
        addedAt: new Date().toISOString(),
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0]?.image_url || '/no-image.png',
        productBrand: product.brand
      };

      // Get current user data from server
      let userData;
      try {
        const userResponse = await getUserById(userId);
        userData = userResponse.data;
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("User not found. Please log in again.");
          setAddingToCart(false);
          return;
        } else {
          throw err;
        }
      }

      // Get current cart from server
      const currentCart = userData.cart || [];

      // Check if item exists in cart
      const existingIndex = currentCart.findIndex(item => item.id === cartItem.id);

      let updatedCart;
      if (existingIndex > -1) {
        // Update quantity if item exists
        updatedCart = currentCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        updatedCart = [...currentCart, cartItem];
      }

      // Update user's cart on server
      await patchUser(userId, {
        cart: updatedCart
      });

      toast.success(`${quantity} ${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "rounded-xl",
      });

    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium text-gray-900">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={quantity >= product.stock}
            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAddToBag}
          disabled={addingToCart || product.stock === 0}
          className="flex-1 bg-gradient-to-b from-gray-500 to-gray-800 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_4px_8px_rgba(0,0,0,0.4)] ring-1 ring-gray-600 text-white py-4 px-6 rounded-xl font-medium hover:from-gray-400 hover:to-gray-700 transition-colors flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBagIcon className="size-5" />
          {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
        </button>
        <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
          <HeartIcon className="size-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ProductActions;