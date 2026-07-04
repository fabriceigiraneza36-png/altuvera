// src/pages/auth/Payments.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCreditCard, FiCheckCircle, FiClock, FiAlertCircle,
  FiRefreshCw, FiDownload, FiCalendar, FiMapPin,
  FiDollarSign, FiArrowRight,
} from "react-icons/fi";

const css = `
  .pay-root * { box-sizing: border-box; }
  .pay-root { display: flex; flex-direction: column; gap: 1.5rem; animation: payFadeIn 0.5s ease-out; }

  .pay-hero {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
    border-radius: 20px; padding: 2rem 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1.5rem; flex-wrap: wrap; position: relative; overflow: hidden;
  }
  .pay-hero::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 220px; height: 220px; border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .pay-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0 0 6px;
  }
  .pay-hero-sub { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0; }
  .pay-hero-stats { display: flex; gap: 14px; flex-wrap: wrap; z-index: 1; }
  .pay-hero-stat {
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px; padding: 12px 18px; text-align: center;
    backdrop-filter: blur(8px);
  }
  .pay-hero-stat-num { font-size: 1.5rem; font-weight: 900; color: #fff; display: block; }
  .pay-hero-stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.65); text-transform: uppercase; letter-spacing: 0.4px; font-weight: 700; }

  /* ── Cards ── */
  .pay-card {
    background: #fff; border-radius: 18px; border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03); overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: 12px;
  }
  .pay-card.paid    { border-color: #bbf7d0; }
  .pay-card.pending { border-color: #fde68a; }
  .pay-card.overdue { border-color: #fecaca; }

  .pay-card-strip { height: 4px; }
  .pay-card-body { padding: 18px 22px; }
  .pay-card-top {
    display: flex; justify-content: space-between;
    align-items: flex-start; gap: 12px; flex-wrap: wrap;
  }
  .pay-booking-num {
    font-family: monospace; font-size: 0.9rem; font-weight: 900;
    color: #4338ca; letter-spacing: 0.06em;
  }
  .pay-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 8px;
    font-size: 0.72rem; font-weight: 800; border: 1px solid;
    text-transform: uppercase; letter-spacing: 0.3px;
  }
  .pay-card-meta {
    display: flex; gap: 18px; margin-top: 12px; flex-wrap: wrap;
  }
  .pay-meta-item {
    display: flex; align-items: center; gap: 6px; font-size: 0.84rem;
  }
  .pay-amount {
    font-size: 1.4rem; font-weight: 900; margin-top: 14px;
  }
  .pay-notice {
    margin-top: 14px; padding: 12px 16px; border-radius: 10px;
    font-size: 0.83rem; font-weight: 600; line-height: 1.55;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .pay-actions {
    display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;
  }
  .pay-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 10px; border: none;
    font-size: 0.82rem; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: all 0.18s; text-decoration: none;
  }
  .pay-btn-primary {
    background: linear-gradient(135deg,#4338ca,#3730a3);
    color: #fff; box-shadow: 0 3px 10px rgba(67,56,202,0.3);
  }
  .pay-btn-primary:hover { transform: translateY(-1px); }
  .pay-btn-ghost {
    background: #f8fafc; color: #475569; border: 1.5px solid #e2e8f0;
  }
  .pay-btn-ghost:hover { background: #f1f5f9; }

  /* ── Empty ── */
  .pay-empty {
    text-align: center; padding: 64px 24px;
    background: #fff; border-radius: 20px; border: 1.5px dashed #e2e8f0;
  }

  /* ── Loading ── */
  .pay-spinner {
    width: 44px; height: 44px; border-radius: 50%;
    border: 4px solid #e2e8f0; border-top-color: #4338ca;
    animation: paySpin 0.8s linear infinite; margin: 32px auto;
  }

  @keyframes payFadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  @keyframes paySpin   { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  .pay-spin { animation: paySpin 1s linear infinite; }

  @media (max-width: 640px) {
    .pay-hero { padding: 1.5rem; }
    .pay-card-body { padding: 14px 16px; }
  }
`;

const PAYMENT_STATUS = {
  paid:    { label: "Paid",    color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", Icon: FiCheckCircle },
  pending: { label: "Pending", color: "#d97706", bg: "#fffbeb", border: "#fde68a", Icon: FiClock       },
  unpaid:  { label: "Unpaid",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: FiAlertCircle },
  overdue: { label: "Overdue", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", Icon: FiAlertCircle },
  partial: { label: "Partial", color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe", Icon: FiClock       },
};

const getPayStatus = (s) =>
  PAYMENT_STATUS[s] || PAYMENT_STATUS.pending;

function fmtCurrency(amount, currency = "USD") {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
  }).format(amount);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Payment Card ─────────────────────────────────────────────────────────────
function PaymentCard({ booking }) {
  const pst = getPayStatus(booking.payment_status);

  const cardClass =
    booking.payment_status === "paid"    ? "paid"    :
    booking.payment_status === "overdue" ? "overdue" :
    booking.payment_status === "unpaid"  ? "overdue" : "pending";

  const stripColor =
    booking.payment_status === "paid"
      ? "linear-gradient(90deg, #059669, #34d399)"
      : booking.payment_status === "unpaid" || booking.payment_status === "overdue"
      ? "linear-gradient(90deg, #dc2626, #f87171)"
      : "linear-gradient(90deg, #d97706, #fbbf24)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className={`pay-card ${cardClass}`}
    >
      <div className="pay-card-strip" style={{ background: stripColor }} />
      <div className="pay-card-body">
        <div className="pay-card-top">
          <div>
            <div className="pay-booking-num">
              {booking.booking_number || `#${booking.id}`}
            </div>
            <span
              className="pay-status-badge"
              style={{
                color: pst.color, background: pst.bg,
                borderColor: pst.border, marginTop: 6, display: "inline-flex",
              }}
            >
              <pst.Icon size={12} /> {pst.label}
            </span>
          </div>
          {booking.payment_status === "paid" && (
            <button
              className="pay-btn pay-btn-ghost"
              title="Download receipt"
            >
              <FiDownload size={13} /> Receipt
            </button>
          )}
        </div>

        <div className="pay-card-meta">
          {booking.destination_name && (
            <div className="pay-meta-item">
              <FiMapPin size={13} color="#059669" />
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                {booking.destination_name}
              </span>
            </div>
          )}
          {booking.travel_date && (
            <div className="pay-meta-item" style={{ color: "#64748b" }}>
              <FiCalendar size={13} color="#0891b2" />
              {fmtDate(booking.travel_date)}
            </div>
          )}
        </div>

        {/* Amount */}
        {(booking.total_price || booking.amount) && (
          <div
            className="pay-amount"
            style={{
              color: booking.payment_status === "paid" ? "#059669" : "#0f172a",
            }}
          >
            <FiDollarSign size={18} style={{ verticalAlign: "middle" }} />
            {fmtCurrency(booking.total_price || booking.amount, booking.currency || "USD")}
          </div>
        )}

        {/* Notices */}
        {booking.payment_status === "paid" && (
          <div
            className="pay-notice"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" }}
          >
            <FiCheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Payment confirmed by Altuvera team.
              {booking.confirmed_at && ` Confirmed on ${fmtDate(booking.confirmed_at)}.`}
            </span>
          </div>
        )}

        {(booking.payment_status === "unpaid" || booking.payment_status === "pending") && (
          <div
            className="pay-notice"
            style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}
          >
            <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Payment required to confirm your booking. Our team will contact you
              with payment instructions. Please check your notifications.
            </span>
          </div>
        )}

        {booking.payment_status === "overdue" && (
          <div
            className="pay-notice"
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}
          >
            <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Your payment is overdue. Please contact us immediately to avoid
              cancellation of your booking.
            </span>
          </div>
        )}

        <div className="pay-actions">
          <Link
            to="/my-bookings"
            className="pay-btn pay-btn-primary"
          >
            <FiArrowRight size={13} /> View Booking
          </Link>
          <Link
            to="/messages"
            className="pay-btn pay-btn-ghost"
          >
            💬 Contact Team
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Payments() {
  const { authFetch } = useUserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch("/bookings/my-bookings?limit=50");
      setBookings(data?.data || data?.bookings || []);
    } catch (err) {
      setError(err.message || "Failed to load payment information.");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const stats = useMemo(() => ({
    total:   bookings.length,
    paid:    bookings.filter((b) => b.payment_status === "paid").length,
    pending: bookings.filter((b) =>
      ["pending", "unpaid"].includes(b.payment_status)).length,
    overdue: bookings.filter((b) => b.payment_status === "overdue").length,
  }), [bookings]);

  const displayed = useMemo(() => {
    if (filter === "paid")    return bookings.filter((b) => b.payment_status === "paid");
    if (filter === "pending") return bookings.filter((b) => ["pending","unpaid"].includes(b.payment_status));
    if (filter === "overdue") return bookings.filter((b) => b.payment_status === "overdue");
    return bookings;
  }, [bookings, filter]);

  const filters = [
    { key: "all",     label: `All (${stats.total})`       },
    { key: "paid",    label: `✅ Paid (${stats.paid})`    },
    { key: "pending", label: `⏳ Pending (${stats.pending})` },
    { key: "overdue", label: `🚨 Overdue (${stats.overdue})` },
  ];

  return (
    <>
      <Helmet>
        <title>Payments | Altuvera</title>
        <meta name="description" content="Track your travel payment status." />
      </Helmet>

      <DashboardLayout
        title="Payments"
        subtitle="Track your payment status for all bookings."
      >
        <style>{css}</style>
        <div className="pay-root">

          {/* Hero */}
          <div className="pay-hero">
            <div style={{ zIndex: 1 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>💳</div>
              <h1 className="pay-hero-title">Payment Tracker</h1>
              <p className="pay-hero-sub">
                Stay on top of all your booking payments
              </p>
            </div>
            <div className="pay-hero-stats">
              <div className="pay-hero-stat">
                <span className="pay-hero-stat-num">{stats.paid}</span>
                <span className="pay-hero-stat-label">Paid</span>
              </div>
              <div className="pay-hero-stat">
                <span className="pay-hero-stat-num">{stats.pending}</span>
                <span className="pay-hero-stat-label">Pending</span>
              </div>
              {stats.overdue > 0 && (
                <div className="pay-hero-stat" style={{ borderColor: "#f87171" }}>
                  <span className="pay-hero-stat-num" style={{ color: "#fca5a5" }}>
                    {stats.overdue}
                  </span>
                  <span className="pay-hero-stat-label">Overdue</span>
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: "flex", gap: 6, background: "#f1f5f9",
            borderRadius: 12, padding: 4, width: "fit-content", flexWrap: "wrap",
          }}>
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: "8px 16px", borderRadius: 9, border: "none",
                  background: filter === f.key ? "#fff" : "transparent",
                  color: filter === f.key ? "#4338ca" : "#64748b",
                  fontWeight: filter === f.key ? 800 : 500,
                  fontSize: "0.8rem", cursor: "pointer",
                  boxShadow: filter === f.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  fontFamily: "inherit", transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={fetchBookings}
              disabled={loading}
              style={{
                padding: "8px 14px", borderRadius: 9,
                border: "1.5px solid #e2e8f0", background: "#fff",
                color: "#64748b", fontSize: "0.78rem", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: 5, fontFamily: "inherit",
              }}
            >
              <FiRefreshCw size={13} className={loading ? "pay-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "14px 18px", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 12,
              color: "#991b1b", fontSize: "0.88rem", fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && <div className="pay-spinner" />}

          {/* Empty */}
          {!loading && displayed.length === 0 && (
            <div className="pay-empty">
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>💳</div>
              <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontWeight: 800 }}>
                {filter === "all" ? "No bookings found" : `No ${filter} payments`}
              </h3>
              <p style={{ color: "#64748b", margin: "0 0 20px" }}>
                {filter === "all"
                  ? "Book a tour to see your payment status here."
                  : `You have no ${filter} payments.`}
              </p>
              {filter === "all" && (
                <Link
                  to="/booking"
                  style={{
                    display: "inline-block", padding: "11px 26px",
                    background: "linear-gradient(135deg,#4338ca,#3730a3)",
                    color: "#fff", borderRadius: 12, textDecoration: "none",
                    fontWeight: 800, fontSize: "0.9rem",
                  }}
                >
                  Book a Tour
                </Link>
              )}
            </div>
          )}

          {/* List */}
          {!loading && displayed.length > 0 && (
            <AnimatePresence>
              {displayed.map((b) => (
                <PaymentCard key={b.id} booking={b} />
              ))}
            </AnimatePresence>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}