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
    setTimeout(() => openModal("login"), 150);
  }, [authLoading, isAuthenticated, openModal, toast]);

  if (authLoading) return <Loader />;

  if (!isAuthenticated) {
    // Keep the requested URL mounted while authentication is required.
    // Redirecting to "/" here discarded the destination and left the auth
    // modal with no reliable way to restore the page after login/sign-up.
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Sign in to continue</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Sign in or create an account to access this page. After authentication, you’ll return here.
          </p>
          <button
            type="button"
            onClick={() => openModal("login")}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Sign in or sign up
          </button>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}