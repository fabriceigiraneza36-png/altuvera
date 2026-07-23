// src/pages/user/MyBookings.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// MY BOOKINGS v3.0 — Green/White Theme, Online Icons, Fully Responsive
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";

// ── Lucide React (online CDN-friendly, tree-shakeable) ─────────────────────
import {
  Calendar, MapPin, Users, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Search, Shield, User, ChevronDown,
  ChevronUp, ExternalLink, DollarSign, Info, Send, RotateCcw,
  Slash, Filter, Loader2, Plane, Award, TrendingUp, Star,
  ArrowRight, X, ChevronRight, Package, FileText, Phone,
  Mail, Hash, Bookmark, AlertTriangle, CheckCheck,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */

const UPCOMING_DAYS = 7;
const LIMIT         = 10;
const API_BASE      =
  process.env.REACT_APP_API_URL ||
  "https://backend-jd8f.onrender.com/api";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
};

const fmt = (d, opts) =>
  d ? new Date(d).toLocaleDateString("en-US", opts) : "—";
const fmtFull  = (d) => fmt(d, { year: "numeric", month: "long",  day: "numeric" });
const fmtShort = (d) => fmt(d, { year: "numeric", month: "short", day: "numeric" });

const isAdminCreated = (b) =>
  b.source === "admin_manual" ||
  b.source === "admin" ||
  String(b.source || "").includes("admin");

/* ── Status config ── */
const STATUS_MAP = {
  pending:   { label: "Pending Review", color: "#d97706", bg: "#fffbeb", border: "#fde68a", Icon: Clock },
  confirmed: { label: "Confirmed",      color: "#059669", bg: "#ecfdf5", border: "#6ee7b7", Icon: CheckCircle },
  completed: { label: "Completed",      color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe", Icon: CheckCheck },
  cancelled: { label: "Cancelled",      color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: XCircle },
  "on-hold": { label: "On Hold",        color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff", Icon: AlertCircle },
  refunded:  { label: "Refunded",       color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", Icon: DollarSign },
};

const getStatus = (s) =>
  STATUS_MAP[s] || {
    label: s || "Unknown", color: "#64748b",
    bg: "#f8fafc", border: "#e2e8f0", Icon: Clock,
  };

/* ── Safe fetch ── */
const safeFetch = async (authFetch, endpoint, options = {}) => {
  try {
    const result = await authFetch(endpoint, options);
    return { data: result, error: null };
  } catch (err) {
    const status = err?.status || err?.statusCode || 0;
    if (status === 403 || status === 401) {
      console.warn(`[MyBookings] Auth error on ${endpoint}:`, err.message);
      return { data: null, error: `auth:${status}` };
    }
    return { data: null, error: err.message || "Request failed" };
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   INLINE STYLES (single source of truth, no class collisions)
═══════════════════════════════════════════════════════════════════════════ */

const S = {
  /* Root */
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: 900,
    margin: "0 auto",
  },

  /* Stats grid */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
  },
  statCard: {
    background: "#fff",
    borderRadius: 18,
    padding: "18px 20px",
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: "1.8rem",
    fontWeight: 900,
    lineHeight: 1,
    margin: 0,
  },
  statLabel: {
    fontSize: "0.72rem",
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: 0,
  },

  /* Controls bar */
  controls: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 220px",
    maxWidth: 340,
  },
  searchIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "11px 14px 11px 40px",
    borderRadius: 13,
    border: "1.5px solid #e2e8f0",
    fontSize: "0.88rem",
    outline: "none",
    background: "#fff",
    fontFamily: "inherit",
    color: "#0f172a",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  filterRow: {
    display: "flex",
    gap: 4,
    background: "#f1f5f9",
    borderRadius: 13,
    padding: 4,
    overflowX: "auto",
    flexWrap: "nowrap",
  },
  filterBtn: (active) => ({
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    fontSize: "0.78rem",
    fontWeight: active ? 800 : 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.18s",
    fontFamily: "inherit",
    background: active ? "#fff" : "transparent",
    color: active ? "#059669" : "#64748b",
    boxShadow: active ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
  }),
  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 16px",
    borderRadius: 13,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    flexShrink: 0,
  },

  /* Section heading */
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "0.92rem",
    fontWeight: 800,
    color: "#0f172a",
  },
  sectionBadge: (bg, color) => ({
    fontSize: "0.68rem",
    fontWeight: 800,
    padding: "2px 9px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    background: bg,
    color,
  }),

  /* Divider */
  divider: {
    border: "none",
    borderTop: "2px dashed #e2e8f0",
    margin: "8px 0 24px",
  },

  /* Empty */
  empty: {
    textAlign: "center",
    padding: "72px 24px",
    background: "#fff",
    borderRadius: 22,
    border: "1.5px dashed #e2e8f0",
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  emptyTitle: {
    margin: "0 0 8px",
    fontSize: "1.1rem",
    color: "#0f172a",
    fontWeight: 800,
  },
  emptyText: {
    margin: "0 0 24px",
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: 1.6,
  },
  emptyCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 28px",
    background: "linear-gradient(135deg, #059669, #047857)",
    color: "#fff",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 800,
    fontSize: "0.9rem",
    boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
  },

  /* Loading */
  loadingWrap: { textAlign: "center", padding: "72px 24px" },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "4px solid #e2e8f0",
    borderTopColor: "#059669",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 16px",
  },

  /* Error / warning banners */
  errorBanner: {
    padding: "14px 18px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 13,
    color: "#991b1b",
    fontSize: "0.88rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  warnBanner: {
    padding: "12px 16px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 13,
    color: "#92400e",
    fontSize: "0.82rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  /* Card */
  card: (isUpcoming) => ({
    background: "#fff",
    borderRadius: 20,
    border: `1.5px solid ${isUpcoming ? "#6ee7b7" : "#e2e8f0"}`,
    overflow: "hidden",
    boxShadow: isUpcoming
      ? "0 4px 20px rgba(5,150,105,0.1)"
      : "0 2px 12px rgba(0,0,0,0.04)",
    marginBottom: 14,
    transition: "box-shadow 0.2s, border-color 0.2s",
  }),
  cardStrip: (color, isAdmin) => ({
    height: 4,
    background: isAdmin
      ? "linear-gradient(90deg, #7c3aed, #a855f7)"
      : `linear-gradient(90deg, ${color}, ${color}88)`,
  }),

  /* Proximity banner */
  proximity: (bg, border, color) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 20px",
    borderRadius: 12,
    margin: "14px 20px 0",
    fontSize: "0.83rem",
    fontWeight: 700,
    background: bg,
    border: `1px solid ${border}`,
    color,
  }),

  /* Card body */
  cardMain: { padding: "20px 24px" },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  bookingNum: {
    fontFamily: "monospace",
    fontSize: "0.95rem",
    fontWeight: 900,
    color: "#059669",
    letterSpacing: "0.06em",
  },
  statusBadge: (color, bg, border) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 11px",
    borderRadius: 9,
    fontSize: "0.72rem",
    fontWeight: 800,
    marginTop: 6,
    border: `1px solid ${border}`,
    color,
    background: bg,
  }),
  adminBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.65rem",
    fontWeight: 800,
    color: "#7c3aed",
    background: "#faf5ff",
    border: "1px solid #e9d5ff",
    borderRadius: 7,
    padding: "2px 8px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginLeft: 7,
  },
  cardMeta: {
    display: "flex",
    gap: 20,
    marginTop: 14,
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.85rem",
  },

  /* Admin notice */
  adminNotice: {
    marginTop: 14,
    padding: "12px 16px",
    borderRadius: 12,
    background: "#faf5ff",
    border: "1px solid #e9d5ff",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },

  /* Action buttons */
  cancelBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    border: "1.5px solid #fca5a5",
    background: "#fef2f2",
    color: "#b91c1c",
    transition: "all 0.18s",
  },
  toggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    transition: "all 0.18s",
    fontFamily: "inherit",
  },

  /* Expanded details */
  details: { padding: "18px 24px 22px", borderTop: "1px solid #f1f5f9" },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 18,
  },
  detailLabel: {
    margin: "0 0 3px",
    fontSize: "0.65rem",
    fontWeight: 800,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  detailValue: {
    margin: 0,
    fontSize: "0.87rem",
    color: "#0f172a",
    fontWeight: 600,
  },
  notesBlock: (bg, border) => ({
    marginTop: 16,
    padding: "13px 16px",
    borderRadius: 12,
    fontSize: "0.85rem",
    lineHeight: 1.65,
    background: bg,
    border: `1px solid ${border}`,
  }),

  /* Request banner */
  reqBanner: (bg, border) => ({
    margin: "14px 20px 0",
    padding: "13px 18px",
    borderRadius: 13,
    fontSize: "0.82rem",
    lineHeight: 1.5,
    background: bg,
    border: `1px solid ${border}`,
  }),

  /* Modal */
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(15,23,42,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  /* Load more */
  loadMore: { textAlign: "center", marginTop: 8 },
  loadMoreBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 32px",
    borderRadius: 14,
    border: "1.5px solid #059669",
    background: "#fff",
    color: "#059669",
    fontWeight: 800,
    fontSize: "0.88rem",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
};

/* Keyframe injection */
const KEYFRAMES = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 640px) {
    .mb-card-main { padding: 14px 16px !important; }
    .mb-details   { padding: 12px 16px 16px !important; }
    .mb-req-banner { margin: 10px 14px 0 !important; }
    .mb-proximity  { margin: 10px 14px 0 !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   PROXIMITY BANNER
═══════════════════════════════════════════════════════════════════════════ */

function ProximityBanner({ days, dest }) {
  if (days === null || days < 0) return null;

  const cfg =
    days === 0
      ? { bg: "#fef2f2", border: "#fecaca", color: "#991b1b",
          icon: <Plane size={15} />, msg: `Your trip to ${dest || "your destination"} is TODAY!` }
    : days === 1
      ? { bg: "#fff7ed", border: "#fed7aa", color: "#9a3412",
          icon: <Plane size={15} />, msg: `Your trip to ${dest || "your destination"} is TOMORROW!` }
    : days <= 3
      ? { bg: "#fffbeb", border: "#fde68a", color: "#92400e",
          icon: <Clock size={15} />, msg: `${days} days until your trip to ${dest || "your destination"}` }
    : days <= 7
      ? { bg: "#ecfdf5", border: "#6ee7b7", color: "#166534",
          icon: <Calendar size={15} />, msg: `${days} days until your trip to ${dest || "your destination"}` }
    : null;

  if (!cfg) return null;

  return (
    <div
      className="mb-proximity"
      style={S.proximity(cfg.bg, cfg.border, cfg.color)}
    >
      {cfg.icon}
      <span>{cfg.msg}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REQUEST STATUS BANNER
═══════════════════════════════════════════════════════════════════════════ */

function RequestBanner({ booking }) {
  const status = booking.cancel_request_status;
  if (!status || status === "none") return null;

  const isRefund = booking.cancel_request_type === "refund";

  const cfg =
    status === "pending"
      ? { bg: "#fffbeb", border: "#fde68a", color: "#92400e",
          badge: "#f59e0b", label: "Under Review" }
    : status === "approved"
      ? { bg: "#ecfdf5", border: "#6ee7b7", color: "#166534",
          badge: "#059669", label: isRefund ? "Refund Approved" : "Cancellation Approved" }
      : { bg: "#fef2f2", border: "#fecaca", color: "#991b1b",
          badge: "#dc2626", label: "Declined" };

  return (
    <div
      className="mb-req-banner"
      style={S.reqBanner(cfg.bg, cfg.border)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: cfg.color }}>
        {isRefund
          ? <DollarSign size={15} />
          : <Slash size={15} />}
        <strong style={{ fontSize: "0.85rem" }}>
          {isRefund ? "Refund" : "Cancellation"} Request
        </strong>
        <span style={{
          marginLeft: "auto",
          fontSize: "0.62rem",
          fontWeight: 800,
          padding: "3px 10px",
          borderRadius: 20,
          textTransform: "uppercase",
          background: cfg.badge,
          color: "#fff",
        }}>
          {cfg.label}
        </span>
      </div>

      {booking.cancel_request_reason && (
        <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: cfg.color, display: "flex", gap: 5 }}>
          <Info size={12} style={{ flexShrink: 0, marginTop: 2 }} />
          {booking.cancel_request_reason}
        </p>
      )}

      {status === "pending" && (
        <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: cfg.color }}>
          Our team is reviewing your request. You'll be notified here.
        </p>
      )}

      {status === "approved" && (
        <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: cfg.color }}>
          Your request was approved
          {isRefund && booking.refund_amount != null
            ? ` — refund of ${booking.currency || ""} ${booking.refund_amount}`
            : ""}.
        </p>
      )}

      {status === "rejected" && booking.cancel_admin_response && (
        <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: cfg.color }}>
          <strong>Admin note: </strong>{booking.cancel_admin_response}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REQUEST MODAL
═══════════════════════════════════════════════════════════════════════════ */

function RequestModal({ booking, onClose, onSubmit, submitting, error }) {
  const canCancel = ["pending", "confirmed", "on-hold"].includes(booking?.status);
  const canRefund = ["confirmed", "completed"].includes(booking?.status);

  const [type,   setType]   = useState(
    booking?.status === "completed" ? "refund" : "cancellation"
  );
  const [reason, setReason] = useState("");

  if (!booking) return null;

  return (
    <div style={S.overlay} onClick={onClose}>
      <motion.div
        style={S.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.22 }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
            {booking.status === "completed" ? "Request Refund" : "Cancel or Refund"}
          </h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer",
                     color: "#94a3b8", padding: 4, borderRadius: 8, display: "flex" }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "0.85rem" }}>
          Booking{" "}
          <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#059669" }}>
            {booking.booking_number || `#${booking.id}`}
          </span>
          {" · "}{booking.destination_name || "your trip"}
        </p>

        {/* Type selector */}
        <div style={{ display: "grid", gridTemplateColumns: canCancel && canRefund ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 20 }}>
          {canCancel && (
            <button
              type="button"
              onClick={() => setType("cancellation")}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                gap: 5, padding: 16, borderRadius: 14, cursor: "pointer", textAlign: "left",
                border: `2px solid ${type === "cancellation" ? "#dc2626" : "#e2e8f0"}`,
                background: type === "cancellation" ? "#fef2f2" : "#f8fafc",
                transition: "all 0.18s", fontFamily: "inherit",
              }}
            >
              <Slash size={18} color={type === "cancellation" ? "#dc2626" : "#94a3b8"} />
              <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>Cancel Trip</span>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Void this booking</span>
            </button>
          )}
          {canRefund && (
            <button
              type="button"
              onClick={() => setType("refund")}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                gap: 5, padding: 16, borderRadius: 14, cursor: "pointer", textAlign: "left",
                border: `2px solid ${type === "refund" ? "#dc2626" : "#e2e8f0"}`,
                background: type === "refund" ? "#fef2f2" : "#f8fafc",
                transition: "all 0.18s", fontFamily: "inherit",
              }}
            >
              <DollarSign size={18} color={type === "refund" ? "#dc2626" : "#94a3b8"} />
              <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>Request Refund</span>
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>For paid or completed trips</span>
            </button>
          )}
        </div>

        {/* Reason */}
        <label style={{
          display: "block", fontSize: "0.7rem", fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "0.06em",
          color: "#94a3b8", marginBottom: 8,
        }}>
          Reason <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please explain why you'd like to cancel or request a refund…"
          style={{
            width: "100%", borderRadius: 13, border: "1.5px solid #e2e8f0",
            padding: "12px 14px", fontSize: "0.88rem", fontFamily: "inherit",
            resize: "vertical", outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#059669"; }}
          onBlur={(e)  => { e.target.style.borderColor = "#e2e8f0"; }}
        />

        {error && (
          <div style={{ ...S.errorBanner, marginTop: 12 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              flexShrink: 0, padding: "11px 18px", borderRadius: 12,
              border: "1.5px solid #e2e8f0", background: "#fff",
              color: "#475569", fontWeight: 700, fontSize: "0.85rem",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            disabled={submitting || !reason.trim()}
            onClick={() => onSubmit(booking, type, reason.trim())}
            style={{
              flex: 1, display: "inline-flex", alignItems: "center",
              justifyContent: "center", gap: 7, padding: "11px 18px",
              borderRadius: 12, border: "none",
              background: submitting || !reason.trim()
                ? "#f87171"
                : "linear-gradient(135deg, #dc2626, #b91c1c)",
              color: "#fff", fontWeight: 800, fontSize: "0.85rem",
              cursor: submitting || !reason.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              boxShadow: "0 4px 14px rgba(220,38,38,0.25)",
              opacity: submitting || !reason.trim() ? 0.7 : 1,
            }}
          >
            {submitting
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>
              : <><Send size={15} /> Submit Request</>}
          </button>
        </div>

        <p style={{ margin: "12px 0 0", fontSize: "0.74rem", color: "#64748b", display: "flex", gap: 5, alignItems: "center" }}>
          <Info size={12} /> Our team reviews every request within 1–2 business days.
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKING CARD
═══════════════════════════════════════════════════════════════════════════ */

function BookingCard({ booking, onRequest, onMessage }) {
  const [expanded, setExpanded] = useState(false);

  const st        = getStatus(booking.status);
  const admin     = isAdminCreated(booking);
  const days      = daysUntil(booking.travel_date);
  const isUpcoming =
    days !== null && days >= 0 && days <= UPCOMING_DAYS &&
    booking.status === "confirmed";

  const hasPending = booking.cancel_request_status === "pending";
  const finalized  =
    ["cancelled", "refunded"].includes(booking.status) ||
    booking.cancel_request_status === "approved";
  const canCancel  = ["pending", "confirmed", "on-hold"].includes(booking.status);
  const canRefund  = ["confirmed", "completed"].includes(booking.status);
  const canRequest = !finalized && (canCancel || canRefund) && !hasPending;

  const fields = [
    ["Full Name",      booking.full_name],
    ["Email",          booking.email],
    ["Phone",          booking.phone],
    ["Accommodation",  booking.accommodation_type],
    ["Country",        booking.country_name],
    ["Service",        booking.service_name],
    ["Travel Date",    fmtFull(booking.travel_date)],
    ["Return Date",    fmtFull(booking.return_date)],
    ["Booked On",      fmtFull(booking.created_at)],
    ["Payment Status", booking.payment_status],
  ].filter(([, v]) => v && v !== "—");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={S.card(isUpcoming)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.1)";
        e.currentTarget.style.borderColor = isUpcoming ? "#34d399" : "#cbd5e1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isUpcoming
          ? "0 4px 20px rgba(5,150,105,0.1)"
          : "0 2px 12px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = isUpcoming ? "#6ee7b7" : "#e2e8f0";
      }}
    >
      {/* Color strip */}
      <div style={S.cardStrip(st.color, admin)} />

      {/* Proximity banner */}
      {isUpcoming && <ProximityBanner days={days} dest={booking.destination_name} />}

      {/* Request status banner */}
      <RequestBanner booking={booking} />

      {/* Main body */}
      <div className="mb-card-main" style={S.cardMain}>
        <div style={S.cardTop}>
          {/* Left: ID + status */}
          <div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span style={S.bookingNum}>
                {booking.booking_number || `#${booking.id}`}
              </span>
              {admin && (
                <span style={S.adminBadge}>
                  <Shield size={9} /> Admin Created
                </span>
              )}
            </div>
            <div>
              <span style={S.statusBadge(st.color, st.bg, st.border)}>
                <st.Icon size={12} />
                {st.label}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {canRequest && (
              <button
                style={S.cancelBtn}
                onClick={() => onRequest && onRequest(booking)}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
              >
                <RotateCcw size={13} />
                {canRefund && canCancel
                  ? "Cancel / Refund"
                  : canRefund ? "Request Refund" : "Cancel Trip"}
              </button>
            )}
              <button
                style={S.toggleBtn}
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; }}
              >
                {expanded ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> Details</>}
              </button>
              <button
                onClick={() => onMessage && onMessage(booking)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "7px 14px", borderRadius: 9, fontSize: "0.78rem",
                  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  border: "1.5px solid #059669", background: "#fff", color: "#059669",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ecfdf5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
              >
                <Send size={13} /> Message
              </button>
            </div>
        </div>

        {/* Meta row */}
        <div style={S.cardMeta}>
          {booking.destination_name && (
            <div style={S.metaItem}>
              <MapPin size={14} color="#059669" />
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                {booking.destination_name}
              </span>
            </div>
          )}
          {booking.travel_date && (
            <div style={{ ...S.metaItem, color: "#475569" }}>
              <Calendar size={14} color="#0369a1" />
              <span>{fmtShort(booking.travel_date)}
                {booking.return_date && ` → ${fmtShort(booking.return_date)}`}
              </span>
            </div>
          )}
          {booking.number_of_travelers && (
            <div style={{ ...S.metaItem, color: "#475569" }}>
              <Users size={14} color="#7c3aed" />
              <span>
                {booking.number_of_travelers} traveler
                {booking.number_of_travelers !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Admin notice */}
        {admin && (
          <div style={S.adminNotice}>
            <Shield size={15} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: "0 0 3px", fontWeight: 800, color: "#7c3aed", fontSize: "0.83rem" }}>
                Created by Altuvera Team
              </p>
              <p style={{ margin: 0, color: "#6d28d9", fontSize: "0.8rem" }}>
                This booking was arranged on your behalf. Contact us with any questions.
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
            <div className="mb-details" style={S.details}>
              <div style={S.detailGrid}>
                {fields.map(([label, value]) => (
                  <div key={label}>
                    <p style={S.detailLabel}>{label}</p>
                    <p style={S.detailValue}>{value}</p>
                  </div>
                ))}
              </div>

              {booking.special_requests && (
                <div style={S.notesBlock("#f8fafc", "#e2e8f0")}>
                  <p style={{ ...S.detailLabel, marginBottom: 5 }}>Special Requests</p>
                  <p style={{ margin: 0, color: "#374151", fontSize: "0.86rem" }}>
                    {booking.special_requests}
                  </p>
                </div>
              )}

              {booking.admin_notes && (
                <div style={S.notesBlock("#faf5ff", "#e9d5ff")}>
                  <p style={{ ...S.detailLabel, color: "#7c3aed", marginBottom: 5 }}>
                    Notes from Altuvera Team
                  </p>
                  <p style={{ margin: 0, color: "#6d28d9", fontSize: "0.86rem" }}>
                    {booking.admin_notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, value, label, color, iconBg }) {
  return (
    <div
      style={S.statCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{ ...S.statIcon, background: iconBg }}>
        <Icon size={20} color={color} />
      </div>
      <p style={{ ...S.statValue, color }}>{value}</p>
      <p style={S.statLabel}>{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */

export default function MyBookings() {
  const { authFetch, user } = useUserAuth();

  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [authWarn,    setAuthWarn]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("all");
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);

  const [reqBooking,    setReqBooking]    = useState(null);
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqError,      setReqError]      = useState(null);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */

  const fetchBookings = useCallback(async (pageNum = 1) => {
    setLoading(true);
    if (pageNum === 1) { setError(null); setAuthWarn(null); }

    const params = new URLSearchParams({ page: pageNum, limit: LIMIT });

    // Try primary endpoint first
    let { data, error: err } = await safeFetch(
      authFetch,
      `/bookings/my-bookings?${params}`
    );

    // Fallback: some backends use /bookings?user_id=me
    if ((err || !data) && !err?.startsWith("auth:")) {
      const fb = await safeFetch(authFetch, `/bookings?mine=true&${params}`);
      if (!fb.error && fb.data) { data = fb.data; err = null; }
    }

    if (err) {
      if (err.startsWith("auth:")) {
        setAuthWarn("Session expired. Please refresh or log in again.");
      } else {
        setError(err);
      }
      setLoading(false);
      return;
    }

    // Normalise response shape
    const rows =
      data?.data ||
      data?.bookings ||
      (Array.isArray(data) ? data : []);

    setBookings((prev) => (pageNum === 1 ? rows : [...prev, ...rows]));
    setTotal(data?.pagination?.total ?? data?.total ?? rows.length);
    setTotalPages(data?.pagination?.total_pages ?? data?.totalPages ?? 1);
    setPage(pageNum);
    setLoading(false);
  }, [authFetch]);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  /* ── Derived ────────────────────────────────────────────────────────────── */

  const { selfB, adminB, upcomingB, displayed } = useMemo(() => {
    const q = search.toLowerCase().trim();

    const all = bookings.filter((b) =>
      !q ||
      (b.booking_number   || "").toLowerCase().includes(q) ||
      (b.destination_name || "").toLowerCase().includes(q) ||
      (b.full_name        || "").toLowerCase().includes(q)
    );

    const selfB     = all.filter((b) => !isAdminCreated(b));
    const adminB    = all.filter((b) =>  isAdminCreated(b));
    const upcomingB = all.filter((b) => {
      const d = daysUntil(b.travel_date);
      return d !== null && d >= 0 && d <= UPCOMING_DAYS && b.status === "confirmed";
    });

    const displayed =
      filter === "self"     ? selfB     :
      filter === "admin"    ? adminB    :
      filter === "upcoming" ? upcomingB : all;

    return { selfB, adminB, upcomingB, displayed };
  }, [bookings, search, filter]);

  /* ── Request handlers ───────────────────────────────────────────────────── */

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
      { method: "POST", body: JSON.stringify({ type, reason }) }
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

  /* ── Message handlers ──────────────────────────────────────────────────── */

  const [msgBooking, setMsgBooking] = useState(null);
  const [msgConvo, setMsgConvo] = useState(null);
  const [msgMessages, setMsgMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgSending, setMsgSending] = useState(false);
  const [msgDraft, setMsgDraft] = useState("");
  const [msgError, setMsgError] = useState(null);
  const msgScrollRef = useRef(null);

  const openMessage = useCallback(async (booking) => {
    setMsgBooking(booking);
    setMsgConvo(null);
    setMsgMessages([]);
    setMsgDraft("");
    setMsgError(null);
    setMsgLoading(true);
    try {
      const res = await authFetch(
        `/messages/conversations/by-booking/${booking.id}`
      );
      if (res.ok) {
        const data = await res.json();
        setMsgConvo(data.data);
        setMsgMessages(data.data?.messages || []);
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          const createRes = await authFetch(`/messages/conversations`, {
            method: "POST",
            body: JSON.stringify({
              bookingId: booking.id,
              bookingNumber: booking.booking_number,
              subject: `Booking ${booking.booking_number || booking.id}`,
              firstMessage: "",
            }),
          });
          const created = await createRes.json();
          if (created.success) {
            setMsgConvo(created.data);
            setMsgMessages([]);
          } else {
            setMsgError(created.message || "Failed to open conversation");
          }
        } else {
          setMsgError(data.message || "Failed to load conversation");
        }
      }
    } catch {
      setMsgError("Network error");
    } finally {
      setMsgLoading(false);
      setTimeout(() => msgScrollRef.current?.scrollTo({ top: msgScrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  }, [authFetch]);

  const closeMessage = useCallback(() => {
    setMsgBooking(null);
    setMsgConvo(null);
    setMsgMessages([]);
    setMsgDraft("");
    setMsgError(null);
    setMsgSending(false);
  }, []);

  const sendClientMessage = useCallback(async () => {
    const text = msgDraft.trim();
    if (!text || !msgConvo?.id || msgSending) return;
    setMsgSending(true);
    setMsgError(null);
    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversationId: msgConvo.id,
      senderType: "user",
      senderName: "You",
      body: text,
      isRead: false,
      reactions: {},
      replyToId: null,
      createdAt: new Date().toISOString(),
    };
    setMsgMessages(prev => [...prev, optimistic]);
    setMsgDraft("");
    setTimeout(() => msgScrollRef.current?.scrollTo({ top: msgScrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    try {
      const res = await authFetch(
        `/messages/conversations/${msgConvo.id}/messages`,
        { method: "POST", body: JSON.stringify({ body: text }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setMsgMessages(prev => prev.map(m => m.id === optimistic.id ? { ...data.data, senderType: "user", senderName: "You" } : m));
      setMsgConvo(prev => prev ? { ...prev, last_message: text, last_message_at: new Date().toISOString() } : prev);
    } catch (e) {
      setMsgMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setMsgError(e.message);
      setMsgDraft(text);
    } finally {
      setMsgSending(false);
    }
  }, [msgDraft, msgConvo, msgSending, authFetch]);

  /* ── Layout helpers ─────────────────────────────────────────────────────── */

  const showSplit =
    filter === "all" && selfB.length > 0 && adminB.length > 0;

  const filters = [
    { key: "all",      label: "All",          count: null },
    { key: "self",     label: "My Bookings",  count: selfB.length },
    { key: "admin",    label: "Team Created", count: adminB.length },
    { key: "upcoming", label: "Coming Soon",  count: upcomingB.length },
  ];

  const stats = [
    { icon: Bookmark, value: total || bookings.length, label: "Total Bookings",  color: "#059669", iconBg: "#ecfdf5" },
    { icon: User,     value: selfB.length,              label: "Self-Booked",     color: "#0369a1", iconBg: "#eff6ff" },
    { icon: Shield,   value: adminB.length,             label: "Team-Arranged",   color: "#7c3aed", iconBg: "#faf5ff" },
    { icon: Plane,    value: upcomingB.length,          label: "Coming Soon",     color: "#d97706", iconBg: "#fffbeb" },
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════ */

  return (
    <>
      <Helmet>
        <title>My Bookings | Altuvera</title>
        <meta name="description" content="View and manage all your travel bookings with Altuvera." />
      </Helmet>

      <style>{KEYFRAMES}</style>

      <DashboardLayout
        title="My Bookings"
        subtitle="Track all your adventures — self-booked and team-arranged."
      >
        <div style={S.root}>

          {/* ── Stats ──────────────────────────────────────────────────── */}
          <div style={S.statsGrid}>
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* ── Controls ───────────────────────────────────────────────── */}
          <div style={S.controls}>
            {/* Search */}
            <div style={S.searchWrap}>
              <Search size={15} style={S.searchIcon} />
              <input
                type="text"
                style={S.searchInput}
                placeholder="Search bookings…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search bookings"
                onFocus={(e)  => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)"; }}
                onBlur={(e)   => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Filter tabs */}
            <div style={S.filterRow}>
              {filters.map((f) => (
                <button
                  key={f.key}
                  style={S.filterBtn(filter === f.key)}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                  {f.count !== null && (
                    <span style={{
                      marginLeft: 5, opacity: 0.7, fontSize: "0.72rem",
                    }}>
                      ({f.count})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              style={S.refreshBtn}
              onClick={() => fetchBookings(1)}
              disabled={loading}
              aria-label="Refresh"
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; }}
            >
              <RefreshCw
                size={14}
                style={loading ? { animation: "spin 1s linear infinite" } : undefined}
              />
              Refresh
            </button>
          </div>

          {/* ── Auth warning ────────────────────────────────────────────── */}
          {authWarn && (
            <div style={S.warnBanner}>
              <AlertTriangle size={16} />
              {authWarn}
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

          {/* ── Error ──────────────────────────────────────────────────── */}
          {error && (
            <div style={S.errorBanner}>
              <AlertCircle size={16} />
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

          {/* ── Loading ─────────────────────────────────────────────────── */}
          {loading && displayed.length === 0 && (
            <div style={S.loadingWrap}>
              <div style={S.spinner} />
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                Loading your bookings…
              </p>
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {!loading && !error && displayed.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={S.empty}
            >
              <div style={S.emptyIconWrap}>
                {filter === "upcoming"
                  ? <Plane size={36} color="#059669" />
                  : filter === "admin"
                  ? <Shield size={36} color="#059669" />
                  : <Bookmark size={36} color="#059669" />}
              </div>
              <h3 style={S.emptyTitle}>
                {filter === "upcoming" ? "No upcoming confirmed trips"
                  : filter === "admin"   ? "No team-arranged bookings"
                  : filter === "self"    ? "No self-booked trips yet"
                  : search ? `No results for "${search}"`
                  : "No bookings yet"}
              </h3>
              <p style={S.emptyText}>
                {filter === "upcoming"
                  ? "Confirmed trips within the next 7 days will appear here."
                  : filter === "admin"
                  ? "When our team creates a booking on your behalf, it appears here."
                  : search
                  ? "Try a different search term or clear the search."
                  : "Ready to plan your next adventure? Book with Altuvera today!"}
              </p>
              {filter === "all" && !search && (
                <a href="/booking" style={S.emptyCta}>
                  Book an Adventure <ArrowRight size={16} />
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
                  <X size={14} /> Clear Search
                </button>
              )}
            </motion.div>
          )}

          {/* ── Split view ──────────────────────────────────────────────── */}
          {!loading && showSplit && (
            <>
              <div style={S.sectionHead}>
                <User size={16} color="#0369a1" />
                <h3 style={S.sectionTitle}>My Self-Booked Adventures</h3>
                <span style={S.sectionBadge("#e0f2fe", "#0369a1")}>{selfB.length}</span>
              </div>
              <AnimatePresence>
                {selfB.map((b) => (
                  <BookingCard key={b.id} booking={b} onRequest={openRequest} onMessage={openMessage} />
                ))}
              </AnimatePresence>

              <hr style={S.divider} />

              <div style={S.sectionHead}>
                <Shield size={16} color="#7c3aed" />
                <h3 style={S.sectionTitle}>Arranged by Altuvera Team</h3>
                <span style={S.sectionBadge("#f3e8ff", "#7c3aed")}>{adminB.length}</span>
              </div>
              <AnimatePresence>
                {adminB.map((b) => (
                  <BookingCard key={b.id} booking={b} onRequest={openRequest} onMessage={openMessage} />
                ))}
              </AnimatePresence>
            </>
          )}

          {/* ── Flat list ───────────────────────────────────────────────── */}
          {!loading && !showSplit && displayed.length > 0 && (
            <AnimatePresence>
              {displayed.map((b) => (
                <BookingCard key={b.id} booking={b} onRequest={openRequest} />
              ))}
            </AnimatePresence>
          )}

          {/* ── Load more ───────────────────────────────────────────────── */}
          {page < totalPages && !loading && (
            <div style={S.loadMore}>
              <button
                style={S.loadMoreBtn}
                onClick={() => fetchBookings(page + 1)}
                disabled={loading}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#ecfdf5"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <ChevronDown size={16} /> Load More
              </button>
            </div>
          )}

        </div>

        {/* ── Request modal ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {reqBooking && (
            <div style={S.overlay} onClick={() => setReqBooking(null)}>
              <RequestModal
                booking={reqBooking}
                onClose={() => setReqBooking(null)}
                onSubmit={submitRequest}
                submitting={reqSubmitting}
                error={reqError}
              />
            </div>
          )}
        </AnimatePresence>

        {/* ── Message modal ──────────────────────────────────────────────── */}
        {msgBooking && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "mbFadeIn 0.2s ease-out",
          }} onClick={closeMessage}>
            <div style={{
              width: "100%", maxWidth: 460, background: "#fff",
              borderRadius: 20, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              display: "flex", flexDirection: "column", maxHeight: "85vh",
              animation: "mbFadeIn 0.25s ease-out",
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    Message Altuvera
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                    Booking {msgBooking.booking_number || `#${msgBooking.id}`} · {msgBooking.email}
                  </p>
                </div>
                <button onClick={closeMessage} style={{ border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", display: "inline-flex", padding: 4, borderRadius: 8 }}>
                  <X size={18} />
                </button>
              </div>

              <div ref={msgScrollRef} style={{ flex: 1, overflowY: "auto", marginBottom: 12, maxHeight: "40vh", minHeight: 160, padding: "8px 4px" }}>
                {msgLoading ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>
                    <RefreshCw size={24} className="mb-2 animate-spin opacity-40" style={{ margin: "0 auto 12px", display: "block" }} />
                    Loading conversation...
                  </div>
                ) : msgError ? (
                  <div style={{ padding: "14px 18px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: "#991b1b", fontSize: "0.88rem", fontWeight: 600 }}>
                    {msgError}
                  </div>
                ) : msgMessages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: 30, fontSize: "0.88rem" }}>
                    No messages yet. Start the conversation below.
                  </div>
                ) : (
                  msgMessages.map(m => {
                    const mine = m.sender_type === "user" || m.senderType === "user";
                    return (
                      <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 8 }}>
                        <div style={{
                          maxWidth: "80%", padding: "10px 14px", borderRadius: 16, fontSize: "0.88rem",
                          lineHeight: 1.5, background: mine ? "#059669" : "#f1f5f9",
                          color: mine ? "#fff" : "#0f172a",
                          borderBottomRightRadius: mine ? 4 : 16,
                          borderBottomLeftRadius: mine ? 16 : 4,
                        }}>
                          {!mine && (
                            <p style={{ margin: "0 0 4px", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.7 }}>
                              {m.sender_name || "Altuvera"}
                            </p>
                          )}
                          <p style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</p>
                          <p style={{ margin: "4px 0 0", fontSize: "0.65rem", opacity: 0.6, textAlign: "right" }}>
                            {new Date(m.created_at || m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                {msgConvo?.status === "closed" && (
                  <div style={{ marginBottom: 8, padding: "8px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: "0.78rem", color: "#64748b", textAlign: "center" }}>
                    This conversation is closed. Sending a message will reopen it.
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <textarea
                    value={msgDraft}
                    onChange={e => setMsgDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendClientMessage();
                      }
                    }}
                    rows={1}
                    placeholder="Type your message... (Enter to send)"
                    style={{
                      flex: 1, resize: "none", fontSize: "0.88rem", padding: "10px 14px",
                      borderRadius: 14, border: "1.5px solid #e2e8f0", outline: "none",
                      maxHeight: 120, fontFamily: "inherit",
                    }}
                  />
                  <button
                    onClick={sendClientMessage}
                    disabled={!msgDraft.trim() || msgSending}
                    style={{
                      height: 40, padding: "0 18px", borderRadius: 14,
                      background: "#059669", color: "#fff", fontWeight: 700, fontSize: "0.88rem",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                      opacity: (!msgDraft.trim() || msgSending) ? 0.5 : 1,
                    }}
                  >
                    <Send size={15} />
                    <span style={{ display: "none" }}>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  );
}