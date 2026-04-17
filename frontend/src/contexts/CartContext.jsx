import React, { createContext, useContext, useState, useEffect } from "react";
import { getCart } from "../api/apiService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const res = await getCart();
      // Adjust this based on your Django API response!
      // If it returns an array of items: const items = res.data;
      // If it returns an object with items: const items = res.data.items;
      const items = res.data?.items || res.data || [];
      
      // Calculate total quantity of items in cart
      const totalItems = items.reduce((total, item) => total + (item.quantity || 1), 0);
      
      setCartCount(totalItems);
    } catch (error) {
      console.error("Failed to fetch cart details", error);
    }
  };

  // Fetch cart when the user logs in or app loads
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCart, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);