import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import Loader from "../common/Loader";

export default function ProtectedRoute({ children, requiredRole, fallback = "/" }) {
  const { user, isAuthenticated, authLoading, openModal } = useUserAuth();
  const location = useLocation();

  if (authLoading) return <Loader />;

  if (!isAuthenticated) {
    setTimeout(() => openModal("login"), 150);
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}