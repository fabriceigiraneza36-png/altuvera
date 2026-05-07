import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../common/Loader";

export default function ProtectedRoute({ children, requiredRole, fallback = "/" }) {
  const { user, isAuthenticated, authLoading, openModal } = useUserAuth();
  const toast = useToast();
  const location = useLocation();

  if (authLoading) return <Loader />;

  if (!isAuthenticated) {
    if (location.pathname === "/booking") {
      toast.info("Please sign in to continue to booking.");
      setTimeout(() => openModal("login", { skipNotLoggedInMessage: true }), 150);
    } else {
      setTimeout(() => openModal("login"), 150);
    }
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}