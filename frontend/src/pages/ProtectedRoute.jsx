import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, authLoading } = useAuth();
  const location = useLocation();
  const warnedRef = useRef("");

  const needsAdmin = requiredRole === "Admin" && user?.role !== "Admin";
  const needsUser = requiredRole === "User" && user?.role !== "User";

  useEffect(() => {
    if (!needsAdmin) {
      warnedRef.current = "";
      return;
    }

    const warningKey = `${location.pathname}-admin`;
    if (warnedRef.current === warningKey) {
      return;
    }

    warnedRef.current = warningKey;
    toast.error("Access denied! Admin privileges required.");
  }, [location.pathname, needsAdmin]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-700">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign_in" state={{ from: location }} replace />;
  }

  if (needsAdmin) {
    return <Navigate to="/" replace />;
  }

  if (needsUser) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
