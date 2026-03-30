import React, { createContext, useContext, useEffect, useState } from "react";

import { getProfile, logout as logoutRequest } from "../api/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUser(null);
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await getProfile();
        if (isMounted) {
          setUser(response.data);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        login,
        logout,
        isAdmin: () => user?.role === "Admin",
        isUser: () => user?.role === "Customer",
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
