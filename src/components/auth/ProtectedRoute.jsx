import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../common/Loader";

export default function ProtectedRoute({ children, requiredRole, fallback = "/" }) {
  const { user, isAuthenticated, authLoading, openModal } = useUserAuth();
  const toast = useToast();
  const location = useLocation();
  const openRef = useRef(false);

  useEffect(() => {
    if (authLoading || isAuthenticated || openRef.current) return;
    openRef.current = true;

    if (location.pathname === "/booking") {
      toast.info("Please sign in to continue to booking.", {
        title: "Login required",
      });
      setTimeout(
        () => openModal("login", { skipNotLoggedInMessage: true }),
        150,
      );
    } else {
      setTimeout(() => openModal("login"), 150);
    }
  }, [authLoading, isAuthenticated, location.pathname, openModal, toast]);

  if (authLoading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}