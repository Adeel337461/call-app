import React from 'react';

import { jwtDecode } from 'jwt-decode'; // Use this import
import {
  Navigate,
  Outlet,
} from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accesstoken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token); // call directly
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.removeItem('accesstoken');
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error("JWT decode error:", err);
    localStorage.removeItem('accesstoken');
    return <Navigate to="/login" replace />;
  }

  if (children) return children;
  return <Outlet />;
};

export default ProtectedRoute;
