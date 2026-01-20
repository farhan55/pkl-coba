import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * PROTECTED ROUTE COMPONENT
 * Wrapper untuk routes yang membutuhkan authentication
 *
 * Features:
 * - Check token di localStorage
 * - Verify user role
 * - Redirect ke login jika tidak authenticated
 * - Redirect ke dashboard yang sesuai jika role tidak match
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  // Check authentication
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // Jika tidak ada token, redirect ke login
  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Parse user data
  const user = JSON.parse(userStr);

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect ke dashboard yang sesuai dengan role
    const redirectPath = user.role === "admin" ? "/admin" : "/mahasiswa";
    return <Navigate to={redirectPath} replace />;
  }

  // Token dan role valid, render children
  return <>{children}</>;
};

export default ProtectedRoute;
