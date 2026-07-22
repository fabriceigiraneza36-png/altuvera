import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar, FiMapPin, FiUsers, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiRefreshCw, FiSearch, FiShield, FiUser,
  FiChevronDown, FiChevronUp, FiExternalLink,
  FiSlash, FiDollarSign, FiInfo, FiSend, FiFileText, FiRotateCcw,
} from "react-icons/fi";
import {
  HiOutlineTicket, HiLocationMarker,
} from "react-icons/hi";

// ─── Constants ────────────────────────────────────────────────────────────────
const UPCOMING_THRESHOLD_DAYS = 7;
const LIMIT = 10;
const API_BASE = process.env.REACT_APP_API_URL || "https://backend-jd8f.onrender.com/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
};
const fmt = (d, opts) =>
  d ? new Date(d).toLocaleDateString("en-US", opts) : "—";
const fmtFull  = (d) => fmt(d, { year: "numeric", month: "long",  day: "numeric" });
const fmtShort = (d) => fmt(d, { year: "numeric", month: "short", day: "numeric" });

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending:   { label: "Pending Review", color: "#d97706", bg: "#fffbeb", border: "#fde68a", Icon: FiClock },
  confirmed: { label: "Confirmed",      color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", Icon: FiCheckCircle },
  completed: { label: "Completed",      color: "#0891b2", bg: "#f0f9ff", border: "#bae6fd", Icon: FiCheckCircle },
  cancelled: { label: "Cancelled",      color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: FiXCircle },
  "on-hold": { label: "On Hold",        color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe", Icon: FiAlertCircle },
};
const getStatus = (s) =>
  STATUS[s] || { label: s, color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", Icon: FiClock };

const isAdmin = (b) =>
  b.source === "admin_manual" || b.source === "admin" ||
  String(b.source || "").includes("admin");

// ─── Safe authFetch wrapper ───────────────────────────────────────────────────
// Prevents 403s from crashing the whole page
const safeFetch = async (authFetch, endpoint, options = {}) => {
  try {
    const result = await authFetch(endpoint, options);
    return { data: result, error: null };
  } catch (err) {
    // 403 = forbidden (token expired / missing scope) — return gracefully
    const status = err?.status || err?.statusCode || 0;
    if (status === 403 || status === 401) {
      console.warn(`[MyBookings] Auth error on ${endpoint}:`, err.message);
      return { data: null, error: `Auth error (${status})` };
    }
    return { data: null, error: err.message || "Request failed" };
  }
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  .mb-root * { box-sizing: border-box; }
  .mb-root { display: flex; flex-direction: column; gap: 1.5rem; animation: mbFadeIn 0.5s ease-out; }

  /* ── Stats ── */
  .mb-stats {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }
  .mb-stat {
    background: #fff; border-radius: 16px; padding: 16px 18px;
    border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .mb-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
  .mb-stat-emoji { font-size: 1.5rem; margin-bottom: 6px; }
  .mb-stat-value { font-size: 1.6rem; font-weight: 900; margin: 0; line-height: 1; }
  .mb-stat-label { font-size: 0.72rem; color: #64748b; margin: 4px 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }

  /* ── Controls ── */
  .mb-controls {
    display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  }
  .mb-search-wrap { position: relative; flex: 1 1 200px; max-width: 320px; }
  .mb-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
  .mb-search {
    width: 100%; padding: 10px 12px 10px 36px;
    border-radius: 12px; border: 1.5px solid #e2e8f0;
    font-size: 0.88rem; outline: none; background: #fff;
    font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mb-search:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.1); }

  .mb-filter-tabs {
    display: flex; gap: 4px; background: #f1f5f9;
    border-radius: 12px; padding: 4px; overflow-x: auto; flex-wrap: nowrap;
  }
  .mb-filter-tab {
    padding: 8px 14px; border-radius: 9px; border: none;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    white-space: nowrap; transition: all 0.18s; font-family: inherit;
  }
  .mb-filter-tab.active {
    background: #fff; color: #059669; font-weight: 800;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .mb-filter-tab:not(.active) { background: transparent; color: #64748b; }
  .mb-filter-tab:not(.active):hover { color: #0f172a; background: rgba(255,255,255,0.6); }

  .mb-refresh-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 14px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; background: #fff;
    color: #64748b; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .mb-refresh-btn:hover:not(:disabled) { background: #f8fafc; color: #0f172a; }
  .mb-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Section heading ── */
  .mb-section-heading {
    display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
  }
  .mb-section-heading h3 { margin: 0; font-size: 0.9rem; font-weight: 800; color: #0f172a; }
  .mb-section-count {
    font-size: 0.68rem; font-weight: 800; padding: 2px 8px;
    border-radius: 20px; text-transform: uppercase; letter-spacing: 0.3px;
  }

  /* ── Card ── */
  .mb-card {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #e2e8f0; overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    transition: box-shadow 0.2s, border-color 0.2s;
    margin-bottom: 14px;
  }
  .mb-card:hover {
    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    border-color: #cbd5e1;
  }
  .mb-card.upcoming-confirmed {
    border-color: #bbf7d0;
    box-shadow: 0 4px 20px rgba(5,150,105,0.10);
  }
  .mb-card-strip { height: 4px; }

  /* ── Proximity Banner ── */
  .mb-proximity {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; border-radius: 10px; margin: 14px 20px 0;
    font-size: 0.82rem; font-weight: 700;
  }
  .mb-proximity-emoji { font-size: 1.1rem; }

  /* ── Card main ── */
  .mb-card-main { padding: 18px 22px; }
  .mb-card-top {
    display: flex; justify-content: space-between;
    align-items: flex-start; gap: 12px; flex-wrap: wrap;
  }
  .mb-booking-num {
    font-family: monospace; font-size: 0.9rem; font-weight: 900;
    color: #059669; letter-spacing: 0.06em;
  }
  .mb-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    font-size: 0.72rem; font-weight: 800; margin-top: 6px;
    border: 1px solid;
  }
  .mb-admin-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.65rem; font-weight: 800; color: #7c3aed;
    background: #faf5ff; border: 1px solid #ddd6fe;
    border-radius: 6px; padding: 2px 7px;
    text-transform: uppercase; letter-spacing: 0.04em;
    margin-left: 6px;
  }
  .mb-card-meta {
    display: flex; gap: 18px; margin-top: 14px; flex-wrap: wrap;
  }
  .mb-meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.85rem;
  }

  /* ── Admin notice ── */
  .mb-admin-notice {
    margin-top: 12px; padding: 10px 14px; border-radius: 10px;
    background: #faf5ff; border: 1px solid #ddd6fe;
    display: flex; gap: 8px; align-items: flex-start;
  }
  .mb-admin-notice p { margin: 0; font-size: 0.78rem; line-height: 1.5; }

  /* ── Toggle button ── */
  .mb-toggle-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; font-size: 0.78rem;
    font-weight: 700; cursor: pointer; border: 1.5px solid #e2e8f0;
    background: #f8fafc; color: #475569; transition: all 0.18s;
    font-family: inherit;
  }
  .mb-toggle-btn:hover { background: #f1f5f9; color: #0f172a; }

  /* ── Expanded details ── */
  .mb-details {
    padding: 16px 22px 20px; border-top: 1px solid #f1f5f9;
  }
  .mb-detail-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 16px;
  }
  .mb-detail-field p:first-child {
    margin: 0 0 3px; font-size: 0.65rem; font-weight: 800;
    color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .mb-detail-field p:last-child {
    margin: 0; font-size: 0.88rem; color: #0f172a; font-weight: 600;
  }
  .mb-notes-block {
    margin-top: 14px; padding: 12px 14px; border-radius: 10px;
    font-size: 0.85rem; line-height: 1.65;
  }
  .mb-notes-block p:first-child {
    margin: 0 0 5px; font-size: 0.65rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .mb-notes-block p:last-child { margin: 0; }

  /* ── Divider ── */
  .mb-divider {
    border: none; border-top: 2px dashed #e2e8f0; margin: 8px 0 24px;
  }

  /* ── Empty / loading ── */
  .mb-empty {
    text-align: center; padding: 64px 24px;
    background: #fff; border-radius: 20px;
    border: 1.5px dashed #e2e8f0;
  }
  .mb-empty-icon { font-size: 3rem; margin-bottom: 14px; }
  .mb-empty h3 { margin: 0 0 8px; font-size: 1.1rem; color: #0f172a; font-weight: 800; }
  .mb-empty p { margin: 0 0 20px; color: #64748b; font-size: 0.9rem; }
  .mb-empty-cta {
    display: inline-block; padding: 11px 26px;
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff; border-radius: 12px; text-decoration: none;
    font-weight: 800; font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(5,150,105,0.3);
    transition: all 0.2s;
  }
  .mb-empty-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(5,150,105,0.4); }

  .mb-loading { text-align: center; padding: 64px 24px; }
  .mb-spinner {
    width: 44px; height: 44px; border-radius: 50%;
    border: 4px solid #e2e8f0; border-top-color: #059669;
    animation: mbSpin 0.8s linear infinite; margin: 0 auto 16px;
  }
  .mb-loading p { color: #64748b; font-size: 0.9rem; margin: 0; }

  .mb-error {
    padding: 14px 18px; background: #fef2f2;
    border: 1px solid #fecaca; border-radius: 12px;
    color: #991b1b; font-size: 0.88rem; font-weight: 600;
    display: flex; align-items: center; gap: 10px;
  }

  /* ── Auth warning ── */
  .mb-auth-warn {
    padding: 12px 16px; background: #fffbeb;
    border: 1px solid #fde68a; border-radius: 12px;
    color: #92400e; font-size: 0.82rem; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Load more ── */
  .mb-load-more { text-align: center; margin-top: 8px; }
  .mb-load-more-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 30px; border-radius: 12px;
    border: 1.5px solid #059669; background: #fff;
    color: #059669; font-weight: 800; font-size: 0.88rem;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .mb-load-more-btn:hover:not(:disabled) {
    background: #ecfdf5; transform: translateY(-1px);
  }
  .mb-load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Keyframes ── */
  .mb-spin-icon { animation: mbSpin 1s linear infinite; }
  @keyframes mbFadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  @keyframes mbSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .mb-card-main { padding: 14px 16px; }
    .mb-details { padding: 12px 16px 16px; }
    .mb-card-top { flex-direction: column; }
    .mb-filter-tabs { width: 100%; }
    .mb-stats { grid-template-columns: repeat(2, 1fr); }
  }

  /* ── Request button ── */
  .mb-req-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; font-size: 0.78rem;
    font-weight: 700; cursor: pointer; font-family: inherit;
    border: 1.5px solid #fca5a5; background: #fef2f2; color: #b91c1c;
    transition: all 0.18s;
  }
  .mb-req-btn:hover { background: #fee2e2; color: #991b1b; }

  /* ── Request status banner ── */
  .mb-request-banner {
    margin: 14px 20px 0; padding: 12px 16px; border-radius: 12px;
    font-size: 0.82rem; line-height: 1.5;
  }
  .mb-rb-head { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
  .mb-rb-icon { display: inline-flex; }
  .mb-rb-status {
    margin-left: auto; font-size: 0.62rem; font-weight: 800;
    padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .mb-rb-reason {
    margin: 8px 0 0; display: flex; gap: 6px; align-items: flex-start;
    font-weight: 600; opacity: 0.92;
  }
  .mb-rb-reason svg { flex-shrink: 0; margin-top: 3px; }
  .mb-rb-note { margin: 6px 0 0; opacity: 0.92; }

  /* ── Request modal ── */
  .mb-modal-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15,23,42,0.55); backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: mbFadeIn 0.2s ease-out;
  }
  .mb-modal {
    width: 100%; max-width: 460px; background: #fff;
    border-radius: 20px; padding: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.25);
    animation: mbFadeIn 0.25s ease-out;
  }
  .mb-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .mb-modal-head h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
  .mb-modal-x {
    border: none; background: transparent; color: #94a3b8; cursor: pointer;
    display: inline-flex; padding: 4px; border-radius: 8px;
  }
  .mb-modal-x:hover { background: #f1f5f9; color: #0f172a; }
  .mb-modal-sub { margin: 8px 0 18px; color: #64748b; font-size: 0.85rem; }
  .mb-modal-bk { font-family: monospace; font-weight: 800; color: #059669; }

  .mb-req-types { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .mb-req-type {
    display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
    padding: 14px; border-radius: 14px; cursor: pointer; text-align: left;
    border: 2px solid #e2e8f0; background: #f8fafc; transition: all 0.18s; font-family: inherit;
  }
  .mb-req-type:hover { border-color: #fca5a5; }
  .mb-req-type.active { border-color: #dc2626; background: #fef2f2; }
  .mb-rt-title { font-size: 0.9rem; font-weight: 800; color: #0f172a; }
  .mb-rt-desc { font-size: 0.72rem; color: #64748b; }

  .mb-req-label {
    display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 6px;
  }
  .mb-req-req { color: #dc2626; }
  .mb-req-textarea {
    width: 100%; border-radius: 12px; border: 1.5px solid #e2e8f0;
    padding: 12px 14px; font-size: 0.88rem; font-family: inherit; resize: vertical;
    outline: none; box-sizing: border-box;
  }
  .mb-req-textarea:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.1); }

  .mb-modal-actions { display: flex; gap: 10px; margin-top: 18px; }
  .mb-req-cancel {
    flex: 0 0 auto; padding: 11px 18px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; background: #fff; color: #475569;
    font-weight: 700; font-size: 0.85rem; cursor: pointer; font-family: inherit;
  }
  .mb-req-cancel:hover:not(:disabled) { background: #f8fafc; }
  .mb-req-submit {
    flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 11px 18px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff;
    font-weight: 800; font-size: 0.85rem; cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 12px rgba(220,38,38,0.3); transition: all 0.2s;
  }
  .mb-req-submit:hover:not(:disabled) { transform: translateY(-1px); }
  .mb-req-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .mb-req-foot { margin: 12px 2px 0; font-size: 0.74rem; color: #64748b; display: flex; gap: 5px; align-items: center; }

  @media (max-width: 640px) {
    .mb-req-types { grid-template-columns: 1fr; }
  }
`;

// ─── Proximity Banner ─────────────────────────────────────────────────────────
function ProximityBanner({ days, dest }) {
  if (days === null || days < 0) return null;
  const cfg =
    days === 0 ? { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", emoji: "🛫", msg: `Your trip to ${dest || "your destination"} is TODAY!` } :
    days === 1 ? { bg: "#fff7ed", border: "#fed7aa", color: "#9a3412", emoji: "✈️",  msg: `Your trip to ${dest || "your destination"} is TOMORROW!` } :
    days <= 3  ? { bg: "#fffbeb", border: "#fde68a", color: "#92400e", emoji: "⏰", msg: `${days} days until your trip to ${dest || "your destination"}` } :
    days <= 7  ? { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", emoji: "🗓️", msg: `${days} days until your trip to ${dest || "your destination"}` } :
    null;
  if (!cfg) return null;
  return (
    <div
      className="mb-proximity"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <span className="mb-proximity-emoji">{cfg.emoji}</span>
      {cfg.msg}
    </div>
  );
}

// ─── Cancellation / Refund helpers ───────────────────────────────────────────
const requestEligibility = (b) => {
  const s = b.status;
  const hasPending = b.cancel_request_status === "pending";
  const finalized  =
    ["cancelled", "refunded"].includes(s) || b.cancel_request_status === "approved";
  const canCancel = ["pending", "confirmed", "on-hold"].includes(s);
  const canRefund = ["confirmed", "completed"].includes(s);
  return {
    hasPending,
    finalized,
    canCancel,
    canRefund,
    canRequest: !finalized && (canCancel || canRefund),
  };
};

// ─── Request Status Banner ────────────────────────────────────────────────────
function RequestStatusBanner({ booking }) {
  if (!booking.cancel_request_status || booking.cancel_request_status === "none")
    return null;
  const isRefund = booking.cancel_request_type === "refund";
  const status   = booking.cancel_request_status;
  const cfg =
    status === "pending"  ? { bg: "#fffbeb", border: "#fde68a", color: "#92400e", badge: "#f59e0b", label: "Under Review" } :
    status === "approved" ? { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", badge: "#059669", label: isRefund ? "Refund Approved" : "Cancellation Approved" } :
                            { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", badge: "#dc2626", label: "Request Declined" };

  return (
    <div
      className="mb-request-banner"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <div className="mb-rb-head">
        <span className="mb-rb-icon">
          {isRefund ? <FiDollarSign size={15} /> : <FiSlash size={15} />}
        </span>
        <strong>{isRefund ? "Refund" : "Cancellation"} Request</strong>
        <span className="mb-rb-status" style={{ background: cfg.badge, color: "#fff" }}>
          {cfg.label}
        </span>
      </div>
      {booking.cancel_request_reason && (
        <p className="mb-rb-reason"><FiInfo size={12} /> {booking.cancel_request_reason}</p>
      )}
      {status === "pending" && (
        <p className="mb-rb-note">
          We've notified our team. You'll see the outcome here as soon as it's reviewed.
        </p>
      )}
      {status === "approved" && (
        <p className="mb-rb-note">
          ✅ Your request was approved
          {isRefund && booking.refund_amount != null
            ? ` — refund of ${booking.currency || ""} ${booking.refund_amount}`
            : ""}.
          Booking is now <strong>{booking.status}</strong>.
        </p>
      )}
      {status === "rejected" && booking.cancel_admin_response && (
        <p className="mb-rb-note">
          <strong>Our note: </strong>{booking.cancel_admin_response}
        </p>
      )}
    </div>
  );
}

// ─── Request Modal ────────────────────────────────────────────────────────────
function RequestModal({ booking, onClose, onSubmit, submitting, error }) {
  const [type,   setType]   = useState(
    booking && booking.status === "completed" ? "refund" : "cancellation");
  const [reason, setReason] = useState("");
  const elig = requestEligibility(booking);

  if (!booking) return null;

  return (
    <div className="mb-modal-overlay" onClick={onClose}>
      <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mb-modal-head">
          <h3>
            Request {booking.status === "completed" ? "Refund" : "Cancellation or Refund"}
          </h3>
          <button className="mb-modal-x" onClick={onClose} aria-label="Close">
            <FiXCircle size={20} />
          </button>
        </div>

        <p className="mb-modal-sub">
          Booking <span className="mb-modal-bk">{booking.booking_number || `#${booking.id}`}</span>
          {" "}· {booking.destination_name || "your trip"}
        </p>

        <div className="mb-req-types">
          {elig.canCancel && (
            <button
              type="button"
              className={`mb-req-type ${type === "cancellation" ? "active" : ""}`}
              onClick={() => setType("cancellation")}
            >
              <FiSlash size={18} />
              <span className="mb-rt-title">Cancel Trip</span>
              <span className="mb-rt-desc">Void this booking entirely</span>
            </button>
          )}
          {elig.canRefund && (
            <button
              type="button"
              className={`mb-req-type ${type === "refund" ? "active" : ""}`}
              onClick={() => setType("refund")}
            >
              <FiDollarSign size={18} />
              <span className="mb-rt-title">Request Refund</span>
              <span className="mb-rt-desc">For paid / completed trips</span>
            </button>
          )}
        </div>

        <label className="mb-req-label">
          Reason <span className="mb-req-req">*</span>
        </label>
        <textarea
          className="mb-req-textarea"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tell us why you'd like to cancel or request a refund…"
        />

        {error && (
          <div className="mb-error" style={{ marginTop: 10 }}>⚠️ {error}</div>
        )}

        <div className="mb-modal-actions">
          <button className="mb-req-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="mb-req-submit"
            disabled={submitting || !reason.trim()}
            onClick={() => onSubmit(booking, type, reason.trim())}
          >
            {submitting ? (
              <><FiRefreshCw size={15} className="mb-spin-icon" /> Submitting…</>
            ) : (
              <><FiSend size={15} /> Submit Request</>
            )}
          </button>
        </div>
        <p className="mb-req-foot">
          <FiInfo size={12} /> Our team reviews every request and replies here.
        </p>
      </div>
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, onRequest }) {
  const [expanded, setExpanded] = useState(false);
  const st    = getStatus(booking.status);
  const admin = isAdmin(booking);
  const elig  = requestEligibility(booking);
  const days  = daysUntil(booking.travel_date);
  const upcomingConfirmed =
    days !== null && days >= 0 && days <= UPCOMING_THRESHOLD_DAYS &&
    booking.status === "confirmed";

  const detailFields = [
    ["Full Name",      booking.full_name],
    ["Email",          booking.email],
    ["Phone",          booking.phone],
    ["Accommodation",  booking.accommodation_type],
    ["Country",        booking.country_name],
    ["Service",        booking.service_name],
    ["Travel Date",    fmtFull(booking.travel_date)],
    ["Return Date",    fmtFull(booking.return_date)],
    ["Booking Date",   fmtFull(booking.created_at)],
    ["Payment Status", booking.payment_status],
  ].filter(([, val]) => val && val !== "—");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={`mb-card ${upcomingConfirmed ? "upcoming-confirmed" : ""}`}
    >
      {/* Color strip */}
      <div
        className="mb-card-strip"
        style={{
          background: admin
            ? "linear-gradient(90deg, #7c3aed, #a855f7)"
            : `linear-gradient(90deg, ${st.color}, ${st.color}99)`,
        }}
      />

      {/* Proximity banner */}
      {upcomingConfirmed && (
        <ProximityBanner days={days} dest={booking.destination_name} />
      )}

      {/* Request status */}
      <RequestStatusBanner booking={booking} />

      {/* Main body */}
      <div className="mb-card-main">
        <div className="mb-card-top">
          <div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span className="mb-booking-num">
                {booking.booking_number || `#${booking.id}`}
              </span>
              {admin && (
                <span className="mb-admin-badge">
                  <FiShield size={9} /> Admin Created
                </span>
              )}
            </div>
            <div style={{ marginTop: 6 }}>
              <span
                className="mb-status-badge"
                style={{ color: st.color, background: st.bg, borderColor: st.border }}
              >
                <st.Icon size={13} /> {st.label}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {elig.canRequest && (
              <button
                className="mb-req-btn"
                onClick={() => onRequest && onRequest(booking)}
              >
                <FiRotateCcw size={14} />
                {elig.canRefund && elig.canCancel
                  ? "Cancel / Refund"
                  : elig.canRefund ? "Request Refund" : "Request Cancellation"}
              </button>
            )}
            <button
              className="mb-toggle-btn"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded
                ? <><FiChevronUp size={14} /> Less</>
                : <><FiChevronDown size={14} /> Details</>}
            </button>
          </div>
        </div>

        {/* Summary row */}
        <div className="mb-card-meta">
          {booking.destination_name && (
            <div className="mb-meta-item">
              <FiMapPin size={14} color="#059669" />
              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
                {booking.destination_name}
              </span>
            </div>
          )}
          {booking.travel_date && (
            <div className="mb-meta-item" style={{ color: "#475569" }}>
              <FiCalendar size={14} color="#0891b2" />
              {fmtShort(booking.travel_date)}
              {booking.return_date && ` → ${fmtShort(booking.return_date)}`}
            </div>
          )}
          {booking.number_of_travelers && (
            <div className="mb-meta-item" style={{ color: "#475569" }}>
              <FiUsers size={14} color="#7c3aed" />
              {booking.number_of_travelers} traveler
              {booking.number_of_travelers !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Admin notice */}
        {admin && (
          <div className="mb-admin-notice">
            <FiShield size={15} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 800, color: "#7c3aed", marginBottom: 3 }}>
                Created by Altuvera Team
              </p>
              <p style={{ color: "#6d28d9" }}>
                This booking was arranged on your behalf. Contact us if you have any questions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div className="mb-details">
              <div className="mb-detail-grid">
                {detailFields.map(([label, value]) => (
                  <div key={label} className="mb-detail-field">
                    <p>{label}</p>
                    <p>{value}</p>
                  </div>
                ))}
              </div>

              {booking.special_requests && (
                <div
                  className="mb-notes-block"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <p style={{ color: "#64748b" }}>Special Requests</p>
                  <p style={{ color: "#374151" }}>{booking.special_requests}</p>
                </div>
              )}
              {booking.admin_notes && (
                <div
                  className="mb-notes-block"
                  style={{ background: "#faf5ff", border: "1px solid #ddd6fe" }}
                >
                  <p style={{ color: "#7c3aed" }}>Notes from Altuvera Team</p>
                  <p style={{ color: "#6d28d9" }}>{booking.admin_notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyBookings() {
  const { authFetch, user, token } = useUserAuth();

  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [authWarning, setAuthWarning] = useState(null);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("all");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);

  // Modal state
  const [reqBooking,    setReqBooking]    = useState(null);
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqError,      setReqError]      = useState(null);

  // ── Fetch bookings ──────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (pageNum = 1) => {
    setLoading(true);
    if (pageNum === 1) {
      setError(null);
      setAuthWarning(null);
    }

    const params = new URLSearchParams({ page: pageNum, limit: LIMIT });
    const { data, error: fetchErr } = await safeFetch(
      authFetch,
      `/bookings/my-bookings?${params}`
    );

    if (fetchErr) {
      // If it's an auth error, show a soft warning but don't crash
      if (fetchErr.includes("Auth error")) {
        setAuthWarning("Session may have expired. Please refresh or log in again.");
      } else {
        setError(fetchErr);
      }
      setLoading(false);
      return;
    }

    const rows = data?.data || data?.bookings || [];
    setBookings((prev) => (pageNum === 1 ? rows : [...prev, ...rows]));
    setTotal(data?.pagination?.total ?? rows.length);
    setTotalPages(data?.pagination?.total_pages ?? 1);
    setPage(pageNum);
    setLoading(false);
  }, [authFetch]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  // ── Derived lists ───────────────────────────────────────────────────────────
  const { selfB, adminB, upcomingB, displayed } = useMemo(() => {
    const q = search.toLowerCase().trim();
    const all = bookings.filter((b) =>
      !q ||
      (b.booking_number  || "").toLowerCase().includes(q) ||
      (b.destination_name || "").toLowerCase().includes(q) ||
      (b.full_name        || "").toLowerCase().includes(q)
    );

    const selfB     = all.filter((b) => !isAdmin(b));
    const adminB    = all.filter((b) =>  isAdmin(b));
    const upcomingB = all.filter((b) => {
      const d = daysUntil(b.travel_date);
      return d !== null && d >= 0 && d <= UPCOMING_THRESHOLD_DAYS &&
             b.status === "confirmed";
    });

    const displayed =
      filter === "self"     ? selfB     :
      filter === "admin"    ? adminB    :
      filter === "upcoming" ? upcomingB : all;

    return { selfB, adminB, upcomingB, displayed };
  }, [bookings, search, filter]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = [
    { emoji: "📋", value: total || bookings.length, label: "Total",         color: "#059669" },
    { emoji: "👤", value: selfB.length,              label: "Self-Booked",   color: "#0891b2" },
    { emoji: "🛡️", value: adminB.length,             label: "Team-Arranged", color: "#7c3aed" },
    { emoji: "✈️", value: upcomingB.length,           label: "Coming Soon",   color: "#d97706" },
  ];

  const filters = [
    { key: "all",      label: "All" },
    { key: "self",     label: "👤 My Bookings" },
    { key: "admin",    label: "🛡️ Team Created" },
    { key: "upcoming", label: "✈️ Coming Soon" },
  ];

  const showSplit =
    filter === "all" && selfB.length > 0 && adminB.length > 0;

  // ── Request handlers ────────────────────────────────────────────────────────
  const openRequest = useCallback((b) => {
    setReqError(null);
    setReqBooking(b);
  }, []);

  const submitRequest = useCallback(async (booking, type, reason) => {
    setReqSubmitting(true);
    setReqError(null);
    const { error: submitErr } = await safeFetch(
      authFetch,
      `/bookings/${booking.id}/request-cancellation`,
      {
        method: "POST",
        body: JSON.stringify({ type, reason }),
      }
    );
    if (submitErr) {
      setReqError(submitErr);
      setReqSubmitting(false);
      return;
    }
    setReqBooking(null);
    setReqSubmitting(false);
    await fetchBookings(1);
  }, [authFetch, fetchBookings]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>My Bookings | Altuvera</title>
        <meta name="description" content="View and manage all your travel bookings." />
      </Helmet>

      <DashboardLayout
        title="My Bookings"
        subtitle="Track all your adventures — self-booked and team-arranged."
      >
        <style>{css}</style>
        <div className="mb-root">

          {/* Stats */}
          <div className="mb-stats">
            {stats.map((s) => (
              <div key={s.label} className="mb-stat">
                <div className="mb-stat-emoji">{s.emoji}</div>
                <p className="mb-stat-value" style={{ color: s.color }}>{s.value}</p>
                <p className="mb-stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="mb-controls">
            <div className="mb-search-wrap">
              <FiSearch size={15} className="mb-search-icon" />
              <input
                type="text"
                className="mb-search"
                placeholder="Search bookings…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search bookings"
              />
            </div>

            <div className="mb-filter-tabs">
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`mb-filter-tab ${filter === f.key ? "active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  {f.key !== "all" && (
                    <span style={{ marginLeft: 4, opacity: 0.7 }}>
                      ({f.key === "self" ? selfB.length
                        : f.key === "admin" ? adminB.length
                        : upcomingB.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              className="mb-refresh-btn"
              onClick={() => fetchBookings(1)}
              disabled={loading}
              aria-label="Refresh bookings"
            >
              <FiRefreshCw
                size={14}
                className={loading ? "mb-spin-icon" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Auth warning (non-blocking) */}
          {authWarning && (
            <div className="mb-auth-warn">
              <FiAlertCircle size={16} />
              {authWarning}
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginLeft: "auto", border: "none", background: "transparent",
                  color: "#92400e", fontWeight: 700, cursor: "pointer",
                  textDecoration: "underline", padding: 0, fontSize: "0.82rem",
                }}
              >
                Reload
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-error">
              <FiAlertCircle size={16} />
              {error}
              <button
                onClick={() => fetchBookings(1)}
                style={{
                  marginLeft: "auto", border: "none", background: "transparent",
                  color: "#991b1b", fontWeight: 700, cursor: "pointer",
                  textDecoration: "underline", padding: 0, fontSize: "0.82rem",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && displayed.length === 0 && (
            <div className="mb-loading">
              <div className="mb-spinner" />
              <p>Loading your bookings…</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && displayed.length === 0 && (
            <div className="mb-empty">
              <div className="mb-empty-icon">
                {filter === "upcoming" ? "✈️" : "📋"}
              </div>
              <h3>
                {filter === "upcoming" ? "No upcoming confirmed trips"
                  : filter === "admin"   ? "No team-arranged bookings yet"
                  : filter === "self"    ? "No self-booked trips yet"
                  : "No bookings found"}
              </h3>
              <p>
                {filter === "upcoming"
                  ? "Confirmed trips within 7 days will appear here."
                  : filter === "admin"
                  ? "When our team creates a booking for you, it will appear here."
                  : search
                  ? `No results for "${search}". Try a different search term.`
                  : "Ready to plan your next adventure?"}
              </p>
              {filter === "all" && !search && (
                <a href="/booking" className="mb-empty-cta">
                  Book an Adventure
                </a>
              )}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "10px 22px", border: "1.5px solid #e2e8f0",
                    borderRadius: 12, background: "#fff", color: "#475569",
                    fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <FiXCircle size={14} /> Clear Search
                </button>
              )}
            </div>
          )}

          {/* Split view: self-booked + admin-created */}
          {!loading && showSplit && (
            <>
              <div className="mb-section-heading">
                <FiUser size={16} color="#0891b2" />
                <h3>My Self-Booked Adventures</h3>
                <span
                  className="mb-section-count"
                  style={{ background: "#e0f2fe", color: "#0369a1" }}
                >
                  {selfB.length}
                </span>
              </div>
              <AnimatePresence>
                {selfB.map((b) => (
                  <BookingCard key={b.id} booking={b} onRequest={openRequest} />
                ))}
              </AnimatePresence>

              <hr className="mb-divider" />

              <div className="mb-section-heading">
                <FiShield size={16} color="#7c3aed" />
                <h3>Arranged by Altuvera Team</h3>
                <span
                  className="mb-section-count"
                  style={{ background: "#f3e8ff", color: "#7c3aed" }}
                >
                  {adminB.length}
                </span>
              </div>
              <AnimatePresence>
                {adminB.map((b) => (
                  <BookingCard key={b.id} booking={b} onRequest={openRequest} />
                ))}
              </AnimatePresence>
            </>
          )}

          {/* Flat list (filtered view) */}
          {!loading && !showSplit && displayed.length > 0 && (
            <AnimatePresence>
              {displayed.map((b) => (
                <BookingCard key={b.id} booking={b} onRequest={openRequest} />
              ))}
            </AnimatePresence>
          )}

          {/* Load more */}
          {page < totalPages && !loading && (
            <div className="mb-load-more">
              <button
                className="mb-load-more-btn"
                onClick={() => fetchBookings(page + 1)}
                disabled={loading}
              >
                <FiChevronDown size={16} /> Load More Bookings
              </button>
            </div>
          )}

        </div>

        {/* Request modal */}
        {reqBooking && (
          <RequestModal
            booking={reqBooking}
            onClose={() => setReqBooking(null)}
            onSubmit={submitRequest}
            submitting={reqSubmitting}
            error={reqError}
          />
        )}

      </DashboardLayout>
    </>
  );
}