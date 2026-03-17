import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, authLoading } = useAuth();
  const location = useLocation();

  //WAIT until auth is fully loaded from localStorage
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-700">Checking authentication...</span>
      </div>
    );
  }

  // Not authenticated? → send back to login

  if (!isAuthenticated) {
    return <Navigate to="/sign_in" state={{ from: location }} replace />;
  }

  //If this route needs a specific role
  if (requiredRole) {
    // --- Admin only pages ---
    if (requiredRole === 'Admin' && user?.role !== 'Admin') {
      toast.error("Access denied! Admin privileges required.");
      return <Navigate to="/" replace />;
    }

    // --- User only pages ---
    if (requiredRole === 'User' && user?.role !== 'User') {
      return <Navigate to="/admin" replace />;
    }
  }

  // 4. Access granted
  return children;
};

export default ProtectedRoute;
