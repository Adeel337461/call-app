import React from 'react';

import * as jwt_decode from 'jwt-decode'; // Vite-compatible import
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
    const decoded = jwt_decode.default(token); // note .default for Vite
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.removeItem('accesstoken');
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    localStorage.removeItem('accesstoken');
    return <Navigate to="/login" replace />;
  }

  if (children) return children;
  return <Outlet />;
};

export default ProtectedRoute;
