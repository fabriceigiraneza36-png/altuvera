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
  } from "react-icons/fi";
  import {
    HiOutlineTicket, HiLocationMarker,
  } from "react-icons/hi";

  // ─── Constants ────────────────────────────────────────────────────────────────
  const UPCOMING_THRESHOLD_DAYS = 7;
  const LIMIT = 10;

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
      padding: 0 22px 20px; border-top: 1px solid #f1f5f9; padding-top: 16px;
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
    }

    /* ── Load more ── */
    .mb-load-more { text-align: center; }
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
      .mb-details { padding: 14px 16px; padding-top: 12px; }
      .mb-card-top { flex-direction: column; }
      .mb-filter-tabs { width: 100%; }
      .mb-stats { grid-template-columns: repeat(2, 1fr); }
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

  // ─── Booking Card ─────────────────────────────────────────────────────────────
  function BookingCard({ booking }) {
    const [expanded, setExpanded] = useState(false);
    const st    = getStatus(booking.status);
    const admin = isAdmin(booking);
    const days  = daysUntil(booking.travel_date);
    const upcomingConfirmed =
      days !== null && days >= 0 && days <= UPCOMING_THRESHOLD_DAYS &&
      booking.status === "confirmed";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className={`mb-card ${upcomingConfirmed ? "upcoming-confirmed" : ""}`}
      >
        {/* Top strip */}
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

        {/* Main */}
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
            <button className="mb-toggle-btn" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <><FiChevronUp size={14} /> Less</> : <><FiChevronDown size={14} /> Details</>}
            </button>
          </div>

          {/* Summary */}
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
                {booking.number_of_travelers} traveler{booking.number_of_travelers !== 1 ? "s" : ""}
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
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden" }}
            >
              <div className="mb-details">
                <div className="mb-detail-grid">
                  {[
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
                  ].map(([label, value]) => (
                    <div key={label} className="mb-detail-field">
                      <p>{label}</p>
                      <p>{value || "—"}</p>
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
    const { authFetch } = useUserAuth();
    const [bookings,   setBookings]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [search,     setSearch]     = useState("");
    const [filter,     setFilter]     = useState("all");
    const [page,       setPage]       = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total,      setTotal]      = useState(0);

    const fetchBookings = useCallback(async (pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: pageNum, limit: LIMIT });
        const data = await authFetch(`/bookings/my-bookings?${params}`);
        const rows = data?.data || data?.bookings || [];
        setBookings((prev) => (pageNum === 1 ? rows : [...prev, ...rows]));
        setTotal(data?.pagination?.total || rows.length);
        setTotalPages(data?.pagination?.total_pages || 1);
        setPage(pageNum);
      } catch (err) {
        setError(err.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }, [authFetch, filter]);

    useEffect(() => { fetchBookings(1); }, [fetchBookings]);

    const { selfB, adminB, upcomingB, displayed } = useMemo(() => {
      const q = search.toLowerCase().trim();
      const all = bookings.filter((b) =>
        !q ||
        (b.booking_number || "").toLowerCase().includes(q) ||
        (b.destination_name || "").toLowerCase().includes(q) ||
        (b.full_name || "").toLowerCase().includes(q),
      );
      const selfB     = all.filter((b) => !isAdmin(b));
      const adminB    = all.filter((b) =>  isAdmin(b));
      const upcomingB = all.filter((b) => {
        const d = daysUntil(b.travel_date);
        return d !== null && d >= 0 && d <= UPCOMING_THRESHOLD_DAYS && b.status === "confirmed";
      });
      const displayed =
        filter === "self"     ? selfB     :
        filter === "admin"    ? adminB    :
        filter === "upcoming" ? upcomingB : all;
      return { selfB, adminB, upcomingB, displayed };
    }, [bookings, search, filter]);

    const stats = [
      { emoji: "📋", value: bookings.length, label: "Total",         color: "#059669" },
      { emoji: "👤", value: selfB.length,    label: "Self-Booked",   color: "#0891b2" },
      { emoji: "🛡️", value: adminB.length,   label: "Team-Arranged", color: "#7c3aed" },
      { emoji: "✈️", value: upcomingB.length, label: "Coming Soon",  color: "#d97706" },
    ];

    const filters = [
      { key: "all",      label: "All" },
      { key: "self",     label: "👤 My Bookings" },
      { key: "admin",    label: "🛡️ Team Created" },
      { key: "upcoming", label: "✈️ Coming Soon" },
    ];

    const showSplit = filter === "all" && selfB.length > 0 && adminB.length > 0;

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

            {/* ── Stats ── */}
            <div className="mb-stats">
              {stats.map((s) => (
                <div key={s.label} className="mb-stat">
                  <div className="mb-stat-emoji">{s.emoji}</div>
                  <p className="mb-stat-value" style={{ color: s.color }}>{s.value}</p>
                  <p className="mb-stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── Controls ── */}
            <div className="mb-controls">
              <div className="mb-search-wrap">
                <FiSearch size={15} className="mb-search-icon" />
                <input
                  type="text"
                  className="mb-search"
                  placeholder="Search bookings…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                  </button>
                ))}
              </div>
              <button
                className="mb-refresh-btn"
                onClick={() => fetchBookings(1)}
                disabled={loading}
              >
                <FiRefreshCw size={14} className={loading ? "mb-spin-icon" : ""} />
                Refresh
              </button>
            </div>

            {/* ── Error ── */}
            {error && <div className="mb-error">⚠️ {error}</div>}

            {/* ── Loading ── */}
            {loading && displayed.length === 0 && (
              <div className="mb-loading">
                <div className="mb-spinner" />
                <p>Loading your bookings…</p>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && displayed.length === 0 && (
              <div className="mb-empty">
                <div className="mb-empty-icon">
                  {filter === "upcoming" ? "✈️" : "📋"}
                </div>
                <h3>
                  {filter === "upcoming" ? "No upcoming confirmed trips"
                  : filter === "admin"   ? "No team-arranged bookings yet"
                  : "No bookings found"}
                </h3>
                <p>
                  {filter === "upcoming"
                    ? "Confirmed trips within 7 days will appear here."
                    : filter === "admin"
                    ? "When our team creates a booking for you, it will appear here."
                    : "Ready to plan your next adventure?"}
                </p>
                {filter === "all" && (
                  <a href="/booking" className="mb-empty-cta">
                    Book an Adventure
                  </a>
                )}
              </div>
            )}

            {/* ── Split View (all + both types) ── */}
            {showSplit && (
              <>
                <div className="mb-section-heading">
                  <FiUser size={16} color="#0891b2" />
                  <h3>My Self-Booked Adventures</h3>
                  <span className="mb-section-count" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                    {selfB.length}
                  </span>
                </div>
                <AnimatePresence>
                  {selfB.map((b) => <BookingCard key={b.id} booking={b} />)}
                </AnimatePresence>

                <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: 24, marginTop: 10 }}>
                  <div className="mb-section-heading">
                    <FiShield size={16} color="#7c3aed" />
                    <h3>Arranged by Altuvera Team</h3>
                    <span className="mb-section-count" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                      {adminB.length}
                    </span>
                  </div>
                  <AnimatePresence>
                    {adminB.map((b) => <BookingCard key={b.id} booking={b} />)}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* ── Default flat list ── */}
            {!showSplit && displayed.length > 0 && (
              <AnimatePresence>
                {displayed.map((b) => <BookingCard key={b.id} booking={b} />)}
              </AnimatePresence>
            )}

            {/* ── Load more ── */}
            {page < totalPages && !loading && (
              <div className="mb-load-more">
                <button
                  className="mb-load-more-btn"
                  onClick={() => fetchBookings(page + 1)}
                >
                  <FiChevronDown size={16} /> Load More Bookings
                </button>
              </div>
            )}

          </div>
        </DashboardLayout>
      </>
    );
  }