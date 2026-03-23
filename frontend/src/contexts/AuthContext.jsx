import React, { createContext, useContext, useEffect, useState } from "react";

import { clearAuth as clearStoredAuth } from "../api/apiService";

const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("currentUser") || localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    setUser(null);
    clearStoredAuth();
  };

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setAuthLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        login,
        logout,
        isAdmin: () => user?.role === "Admin",
        isUser: () => user?.role === "User",
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
