import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import Loader from "../common/Loader";

export default function ProtectedRoute({ children, requiredRole, fallback = "/" }) {
  const { user, isAuthenticated, authLoading, openModal } = useUserAuth();
  const location = useLocation();
  const openRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) { openRef.current = false; return; }
    if (openRef.current) return;
    openRef.current = true;
    openModal("login", {
      skipNotLoggedInMessage: true,
      resumePendingVerification: false,
      resumeSavedForm: false,
    });
  }, [authLoading, isAuthenticated, openModal]);

  if (authLoading) return <Loader />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[58vh] w-full max-w-xl items-center justify-center px-5 py-12">
        <div className="w-full rounded-3xl border border-emerald-100 bg-white p-7 text-center shadow-xl shadow-emerald-950/5 sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <span aria-hidden="true" className="text-2xl">↗</span>
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Account access required</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Sign in to continue</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            This private Altuvera page is being kept ready. Sign in with the account that owns it and you will return to this exact link.
          </p>
          <button type="button" onClick={() => openModal("login", { skipNotLoggedInMessage: true, resumePendingVerification: false, resumeSavedForm: false })} className="mt-6 min-h-12 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">
            Open secure sign-in
          </button>
          <p className="mt-5 break-all text-[11px] text-slate-400">Requested page: {location.pathname}</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    window.location.replace(fallback);
    return <Loader />;
  }

  return children;
}