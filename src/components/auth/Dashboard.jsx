// src/pages/auth/Dashboard.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// USER DASHBOARD v3.0 — Green/White Theme, Lucide Icons, Fully Responsive
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet }    from "react-helmet-async";
import { Link }      from "react-router-dom";
import { useUserAuth }       from "../../context/UserAuthContext";
import { useNotifications }  from "../../hooks/useNotifications";
import DashboardLayout       from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";

// ── Lucide React (no local SVG files, fully tree-shakeable) ─────────────────
import {
  Calendar, Heart, Star, ArrowRight, TrendingUp, Clock, Award,
  MapPin, Ticket, Map, BookOpen, Bell, Plane, Globe, Compass,
  Bookmark, Shield, CheckCircle, ChevronRight, Loader2,
  Sparkles, Trophy, Users, BarChart2, RefreshCw,
  LayoutDashboard, AlertCircle, Zap,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day:   "numeric",
        year:  "numeric",
      })
    : "—";

const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
};

/* ── Safe authFetch wrapper (mirrors MyBookings pattern) ── */
const safeFetch = async (authFetch, endpoint, options = {}) => {
  try {
    const result = await authFetch(endpoint, options);
    return { data: result, error: null };
  } catch (err) {
    const status = err?.status || err?.statusCode || 0;
    if (status === 403 || status === 401) {
      return { data: null, error: `auth:${status}` };
    }
    return { data: null, error: err.message || "Request failed" };
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES (inline — same approach as MyBookings v3)
═══════════════════════════════════════════════════════════════════════════ */

const S = {
  root: {
    display:       "flex",
    flexDirection: "column",
    gap:           "1.5rem",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: 960,
    margin:   "0 auto",
    animation: "dbFadeUp 0.45s ease-out both",
  },

  /* ── Welcome hero ─────────────────────────────────────────────────────── */
  hero: {
    background:
      "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)",
    borderRadius:   22,
    padding:        "2rem 2.5rem",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    gap:            "1.5rem",
    flexWrap:       "wrap",
    position:       "relative",
    overflow:       "hidden",
  },
  heroBubble1: {
    position:     "absolute",
    top:          -80,
    right:        -80,
    width:        250,
    height:       250,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.04)",
    pointerEvents: "none",
  },
  heroBubble2: {
    position:     "absolute",
    bottom:       -60,
    left:         "22%",
    width:        180,
    height:       180,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.03)",
    pointerEvents: "none",
  },
  heroLeft: { zIndex: 1 },
  heroGreeting: {
    fontSize:      "0.8rem",
    fontWeight:    700,
    color:         "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin:        "0 0 6px",
  },
  heroName: {
    fontSize:    "clamp(1.4rem, 3vw, 2rem)",
    fontWeight:  900,
    color:       "#fff",
    margin:      "0 0 6px",
    lineHeight:  1.15,
    letterSpacing: "-0.5px",
  },
  heroSub: {
    color:     "rgba(255,255,255,0.7)",
    fontSize:  "0.9rem",
    margin:    0,
  },
  heroActions: {
    display:  "flex",
    gap:      10,
    flexWrap: "wrap",
    zIndex:   1,
  },
  heroBtnPrimary: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            8,
    padding:        "11px 22px",
    borderRadius:   13,
    fontSize:       "0.88rem",
    fontWeight:     700,
    cursor:         "pointer",
    border:         "none",
    background:     "#fff",
    color:          "#059669",
    textDecoration: "none",
    boxShadow:      "0 4px 16px rgba(0,0,0,0.15)",
    transition:     "all 0.2s",
    fontFamily:     "inherit",
  },
  heroBtnGhost: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            8,
    padding:        "11px 22px",
    borderRadius:   13,
    fontSize:       "0.88rem",
    fontWeight:     700,
    cursor:         "pointer",
    border:         "1px solid rgba(255,255,255,0.3)",
    background:     "rgba(255,255,255,0.14)",
    color:          "#fff",
    backdropFilter: "blur(8px)",
    textDecoration: "none",
    transition:     "all 0.2s",
    fontFamily:     "inherit",
  },

  /* ── Stats grid ───────────────────────────────────────────────────────── */
  statsGrid: {
    display:               "grid",
    gridTemplateColumns:   "repeat(auto-fit, minmax(150px, 1fr))",
    gap:                   12,
  },
  statCard: {
    background:   "#fff",
    borderRadius: 18,
    padding:      "18px 20px",
    border:       "1.5px solid #e2e8f0",
    boxShadow:    "0 2px 12px rgba(0,0,0,0.04)",
    display:      "flex",
    flexDirection: "column",
    gap:           6,
    transition:   "transform 0.2s, box-shadow 0.2s",
    cursor:       "default",
  },
  statIcon: (bg) => ({
    width:           40,
    height:          40,
    borderRadius:    12,
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    background:      bg,
    marginBottom:    4,
    flexShrink:      0,
  }),
  statValue: {
    fontSize:   "1.75rem",
    fontWeight: 900,
    lineHeight: 1,
    margin:     0,
  },
  statLabel: {
    fontSize:      "0.7rem",
    color:         "#64748b",
    fontWeight:    700,
    textTransform: "uppercase",
    letterSpacing: "0.45px",
    margin:        0,
  },

  /* ── Quick actions ────────────────────────────────────────────────────── */
  sectionLabel: {
    fontSize:      "0.75rem",
    fontWeight:    800,
    color:         "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    margin:        "0 0 12px",
  },
  quickGrid: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap:                 12,
  },
  quickCard: {
    background:     "#fff",
    borderRadius:   17,
    padding:        "18px 16px",
    border:         "1.5px solid #e2e8f0",
    textDecoration: "none",
    display:        "flex",
    flexDirection:  "column",
    gap:            10,
    transition:     "all 0.22s",
    cursor:         "pointer",
    boxShadow:      "0 2px 8px rgba(0,0,0,0.03)",
  },
  quickIcon: (bg) => ({
    width:          44,
    height:         44,
    borderRadius:   13,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    background:     bg,
    flexShrink:     0,
  }),
  quickLabel: {
    fontSize:   "0.88rem",
    fontWeight: 700,
    color:      "#0f172a",
    margin:     "0 0 2px",
  },
  quickDesc: {
    fontSize: "0.72rem",
    color:    "#94a3b8",
    margin:   0,
  },

  /* ── Card wrapper ─────────────────────────────────────────────────────── */
  card: {
    background:   "#fff",
    borderRadius: 20,
    border:       "1.5px solid #e2e8f0",
    boxShadow:    "0 2px 12px rgba(0,0,0,0.04)",
    overflow:     "hidden",
  },
  cardHeader: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "14px 20px",
    borderBottom:   "1px solid #f1f5f9",
    background:     "#fafdfb",
  },
  cardTitle: {
    margin:      0,
    fontSize:    "0.9rem",
    fontWeight:  800,
    color:       "#0f172a",
    display:     "flex",
    alignItems:  "center",
    gap:         8,
  },
  cardSeeAll: {
    fontSize:       "0.78rem",
    color:          "#059669",
    fontWeight:     700,
    textDecoration: "none",
    display:        "flex",
    alignItems:     "center",
    gap:            4,
  },
  cardBody: { padding: "14px 20px" },

  /* ── Two column ───────────────────────────────────────────────────────── */
  twoCol: {
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 "1.25rem",
  },

  /* ── Trip item ────────────────────────────────────────────────────────── */
  tripItem: {
    display:      "flex",
    gap:          12,
    alignItems:   "center",
    padding:      "12px 0",
    borderBottom: "1px solid #f8fafc",
  },
  tripIconWrap: {
    width:          46,
    height:         46,
    borderRadius:   13,
    background:     "linear-gradient(135deg,#ecfdf5,#d1fae5)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  tripName: {
    fontSize:   "0.9rem",
    fontWeight: 800,
    color:      "#0f172a",
    margin:     "0 0 3px",
    whiteSpace: "nowrap",
    overflow:   "hidden",
    textOverflow: "ellipsis",
  },
  tripDate: {
    fontSize:   "0.74rem",
    color:      "#64748b",
    margin:     0,
    display:    "flex",
    alignItems: "center",
    gap:        4,
  },
  tripBadge: (bg, color) => ({
    fontSize:      "0.66rem",
    fontWeight:    800,
    padding:       "3px 9px",
    borderRadius:  7,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    background:    bg,
    color,
    flexShrink:    0,
  }),

  /* ── Notification item ────────────────────────────────────────────────── */
  notifItem: {
    display:      "flex",
    gap:          10,
    alignItems:   "flex-start",
    padding:      "11px 0",
    borderBottom: "1px solid #f8fafc",
  },
  notifDot: (read) => ({
    width:        8,
    height:       8,
    borderRadius: "50%",
    flexShrink:   0,
    marginTop:    6,
    background:   read ? "#e2e8f0" : "#059669",
    boxShadow:    read ? "none" : "0 0 0 3px rgba(5,150,105,0.15)",
  }),
  notifTitle: {
    margin:      0,
    fontSize:    "0.84rem",
    color:       "#0f172a",
    fontWeight:  600,
    lineHeight:  1.4,
  },
  notifSub: { fontSize: "0.72rem", color: "#94a3b8" },

  /* ── Progress panel ───────────────────────────────────────────────────── */
  progressGrid: {
    display:             "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap:                 10,
    marginBottom:        16,
  },
  progressItem: {
    background:   "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
    border:       "1px solid #bbf7d0",
    borderRadius: 14,
    padding:      "16px 12px",
    textAlign:    "center",
  },
  progressValue: {
    fontSize:   "1.5rem",
    fontWeight: 900,
    color:      "#059669",
    margin:     "0 0 4px",
  },
  progressLabel: {
    fontSize:      "0.68rem",
    fontWeight:    700,
    color:         "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    margin:        0,
  },

  /* ── Adventure level bar ─────────────────────────────────────────────── */
  levelBar: {
    padding:      "14px 16px",
    background:   "#f0fdf4",
    borderRadius: 12,
    border:       "1px solid #bbf7d0",
    display:      "flex",
    alignItems:   "center",
    gap:          12,
  },

  /* ── Checklist CTA ────────────────────────────────────────────────────── */
  checklistCta: {
    background:   "linear-gradient(135deg,#fefce8,#fef9c3)",
    border:       "1.5px solid #fde68a",
    borderRadius: 16,
    padding:      "18px 20px",
    display:      "flex",
    alignItems:   "center",
    gap:          16,
    flexWrap:     "wrap",
  },

  /* ── Empty & loading ──────────────────────────────────────────────────── */
  emptyInCard: {
    textAlign: "center",
    padding:   "24px 0",
    color:     "#94a3b8",
  },
  spinner: {
    width:          36,
    height:         36,
    borderRadius:   "50%",
    border:         "3px solid #e2e8f0",
    borderTopColor: "#059669",
    animation:      "dbSpin 0.8s linear infinite",
    margin:         "0 auto",
  },
};

/* Keyframe injection */
const KEYFRAMES = `
  @keyframes dbFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes dbSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    .db-two-col   { grid-template-columns: 1fr !important; }
    .db-hero      { padding: 1.5rem !important; }
    .db-prog-grid { grid-template-columns: repeat(2,1fr) !important; }
    .db-quick-grid { grid-template-columns: repeat(2,1fr) !important; }
  }
  @media (max-width: 480px) {
    .db-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
    .db-quick-grid { grid-template-columns: 1fr 1fr !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK ACTIONS CONFIG
═══════════════════════════════════════════════════════════════════════════ */

const QUICK_ACTIONS = [
  {
    label: "Book a Tour",
    desc:  "Plan your next adventure",
    Icon:  Map,
    color: "#059669",
    iconBg: "#ecfdf5",
    to:    "/booking",
  },
  {
    label: "Destinations",
    desc:  "Explore East Africa",
    Icon:  Globe,
    color: "#2563eb",
    iconBg: "#eff6ff",
    to:    "/destinations",
  },
  {
    label: "My Bookings",
    desc:  "View and manage trips",
    Icon:  Bookmark,
    color: "#7c3aed",
    iconBg: "#faf5ff",
    to:    "/my-bookings",
  },
  {
    label: "Wishlist",
    desc:  "Your saved destinations",
    Icon:  Heart,
    color: "#e11d48",
    iconBg: "#fff1f2",
    to:    "/wishlist",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

/* ── Stat Card ── */
function StatCard({ icon: Icon, value, label, color, iconBg }) {
  return (
    <div
      style={S.statCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform  = "translateY(-3px)";
        e.currentTarget.style.boxShadow  = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = "translateY(0)";
        e.currentTarget.style.boxShadow  = "0 2px 12px rgba(0,0,0,0.04)";
      }}
    >
      <div style={S.statIcon(iconBg)}>
        <Icon size={20} color={color} />
      </div>
      <p style={{ ...S.statValue, color }}>{value}</p>
      <p style={S.statLabel}>{label}</p>
    </div>
  );
}

/* ── Quick Action Card ── */
function QuickCard({ label, desc, Icon, color, iconBg, to }) {
  return (
    <Link
      to={to}
      style={S.quickCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform   = "translateY(-3px)";
        e.currentTarget.style.borderColor = "#bbf7d0";
        e.currentTarget.style.boxShadow   = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform   = "translateY(0)";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow   = "0 2px 8px rgba(0,0,0,0.03)";
      }}
    >
      <div style={S.quickIcon(iconBg)}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={S.quickLabel}>{label}</p>
        <p style={S.quickDesc}>{desc}</p>
      </div>
    </Link>
  );
}

/* ── Section Card wrapper ── */
function SectionCard({ icon: Icon, iconColor = "#059669", title, seeAllTo, seeAllLabel = "See all", children }) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <h3 style={S.cardTitle}>
          <Icon size={16} color={iconColor} />
          {title}
        </h3>
        {seeAllTo && (
          <Link to={seeAllTo} style={S.cardSeeAll}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#047857"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#059669"; }}
          >
            {seeAllLabel} <ArrowRight size={12} />
          </Link>
        )}
      </div>
      <div style={S.cardBody}>
        {children}
      </div>
    </div>
  );
}

/* ── Trip Item ── */
function TripItem({ booking }) {
  const d = daysUntil(booking.travel_date);

  const urgency =
    d === 0    ? { bg: "#fef2f2", color: "#dc2626", label: "TODAY!" }
    : d === 1  ? { bg: "#fff7ed", color: "#ea580c", label: "TOMORROW" }
    : d <= 3   ? { bg: "#fffbeb", color: "#d97706", label: `${d} days` }
    : d <= 7   ? { bg: "#ecfdf5", color: "#059669", label: `${d} days` }
    :            { bg: "#f0f9ff", color: "#0369a1", label: fmtDate(booking.travel_date) };

  return (
    <div style={S.tripItem}>
      <div style={S.tripIconWrap}>
        <Plane size={20} color="#059669" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={S.tripName}>
          {booking.destination_name || "Adventure"}
        </p>
        <p style={S.tripDate}>
          <Calendar size={11} />
          {fmtDate(booking.travel_date)}
        </p>
      </div>
      <span style={S.tripBadge(urgency.bg, urgency.color)}>
        {urgency.label}
      </span>
    </div>
  );
}

/* ── Notification Item ── */
function NotifItem({ notif }) {
  return (
    <div style={S.notifItem}>
      <div style={S.notifDot(notif.is_read)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={S.notifTitle}>{notif.title}</p>
        {notif.message && (
          <span style={S.notifSub}>
            {notif.message.slice(0, 70)}{notif.message.length > 70 ? "…" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Empty in card ── */
function EmptyInCard({ icon: Icon, text, cta }) {
  return (
    <div style={S.emptyInCard}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: "#f0fdf4", display: "flex",
        alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px",
      }}>
        <Icon size={26} color="#059669" />
      </div>
      <p style={{ margin: "0 0 8px", fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>
        {text}
      </p>
      {cta && (
        <Link to={cta.to} style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          marginTop: 4, fontSize: "0.8rem", color: "#059669",
          fontWeight: 700, textDecoration: "none",
        }}>
          {cta.label} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function UserDashboard() {
  const { user, authFetch }            = useUserAuth();
  const { notifications, unreadCount } = useNotifications();

  const [bookings, setBookings]   = useState([]);
  const [loadingB, setLoadingB]   = useState(true);
  const [authWarn, setAuthWarn]   = useState(null);
  const [fetchErr, setFetchErr]   = useState(null);

  /* ── Fetch recent bookings (mirrors MyBookings fetch logic) ── */
  const fetchBookings = useCallback(async () => {
    setLoadingB(true);
    setAuthWarn(null);
    setFetchErr(null);

    // Primary endpoint
    let { data, error } = await safeFetch(
      authFetch,
      "/bookings/my-bookings?limit=5&page=1",
    );

    // Fallback
    if ((error || !data) && !error?.startsWith("auth:")) {
      const fb = await safeFetch(
        authFetch,
        "/bookings?mine=true&limit=5&page=1",
      );
      if (!fb.error && fb.data) { data = fb.data; error = null; }
    }

    if (error) {
      if (error.startsWith("auth:")) {
        setAuthWarn("Session may have expired. Please refresh or log in again.");
      } else {
        setFetchErr(error);
      }
    } else {
      const rows =
        data?.data ||
        data?.bookings ||
        (Array.isArray(data) ? data : []);
      setBookings(rows);
    }

    setLoadingB(false);
  }, [authFetch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  /* ── Derived data ── */
  const upcomingTrips = useMemo(
    () =>
      bookings
        .filter((b) => {
          const d = daysUntil(b.travel_date);
          return b.status === "confirmed" && d !== null && d >= 0;
        })
        .sort((a, b) => new Date(a.travel_date) - new Date(b.travel_date))
        .slice(0, 4),
    [bookings],
  );

  const recentActivity = useMemo(
    () => notifications.slice(0, 5),
    [notifications],
  );

  const travelStats = useMemo(() => {
    const completed  = bookings.filter((b) => b.status === "completed");
    const countries  = new Set(
      bookings.map((b) => b.country_name).filter(Boolean),
    );
    return {
      total:            bookings.length,
      upcoming:         upcomingTrips.length,
      completed:        completed.length,
      countriesVisited: countries.size,
    };
  }, [bookings, upcomingTrips]);

  const firstName = useMemo(() => {
    const name = user?.fullName || user?.name || "Traveler";
    return name.split(" ")[0];
  }, [user]);

  /* ── Adventure level ── */
  const adventureLevel =
    travelStats.completed >= 10 ? { label: "Elite Explorer",   pct: 100, next: null }
    : travelStats.completed >= 5  ? { label: "Expert Adventurer", pct: Math.round(travelStats.completed / 10 * 100), next: 10 }
    : travelStats.completed >= 2  ? { label: "Trailblazer",       pct: Math.round(travelStats.completed / 5  * 100), next: 5 }
    :                               { label: "Explorer",           pct: Math.round(travelStats.completed / 2  * 100), next: 2 };

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */

  return (
    <>
      <Helmet>
        <title>Dashboard | Altuvera</title>
        <meta name="description" content="Your Altuvera travel dashboard." />
      </Helmet>

      <style>{KEYFRAMES}</style>

      <DashboardLayout title="" subtitle="">
        <div style={S.root}>

          {/* ── Auth / error warnings ─────────────────────────────────── */}
          {authWarn && (
            <div style={{
              padding: "12px 16px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 13,
              color: "#92400e",
              fontSize: "0.83rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <AlertCircle size={16} color="#d97706" />
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

          {/* ── Hero Welcome ──────────────────────────────────────────── */}
          <motion.div
            className="db-hero"
            style={S.hero}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Decorative bubbles */}
            <div style={S.heroBubble1} />
            <div style={S.heroBubble2} />

            <div style={S.heroLeft}>
              <p style={S.heroGreeting}>{getGreeting()}, {firstName}</p>
              <h1 style={S.heroName}>Your Adventure Hub</h1>
              <p style={S.heroSub}>
                Ready to explore the wonders of East Africa?
              </p>
            </div>

            <div style={S.heroActions}>
              <Link
                to="/booking"
                style={S.heroBtnPrimary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform  = "translateY(-2px)";
                  e.currentTarget.style.boxShadow  = "0 6px 22px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform  = "translateY(0)";
                  e.currentTarget.style.boxShadow  = "0 4px 16px rgba(0,0,0,0.15)";
                }}
              >
                <Map size={16} /> Book a Tour
              </Link>
              <Link
                to="/destinations"
                style={S.heroBtnGhost}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.24)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                }}
              >
                <Globe size={16} /> Browse Destinations
              </Link>
            </div>
          </motion.div>

          {/* ── Stats ─────────────────────────────────────────────────── */}
          <div
            className="db-stats-grid"
            style={S.statsGrid}
          >
            {[
              { icon: Bookmark,  value: travelStats.total,            label: "Total Bookings",     color: "#059669", iconBg: "#ecfdf5" },
              { icon: Plane,     value: travelStats.upcoming,          label: "Upcoming Trips",     color: "#0369a1", iconBg: "#eff6ff" },
              { icon: Globe,     value: travelStats.countriesVisited,  label: "Countries Visited",  color: "#7c3aed", iconBg: "#faf5ff" },
              { icon: Trophy,    value: travelStats.completed,         label: "Tours Completed",    color: "#d97706", iconBg: "#fffbeb" },
              { icon: Bell,      value: unreadCount,                   label: "Unread Alerts",      color: "#e11d48", iconBg: "#fff1f2" },
            ].map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* ── Quick Actions ─────────────────────────────────────────── */}
          <div>
            <p style={S.sectionLabel}>Quick Actions</p>
            <div className="db-quick-grid" style={S.quickGrid}>
              {QUICK_ACTIONS.map((a) => (
                <QuickCard key={a.label} {...a} />
              ))}
            </div>
          </div>

          {/* ── Two-column: Upcoming + Activity ──────────────────────── */}
          <div className="db-two-col" style={S.twoCol}>

            {/* Upcoming Trips */}
            <SectionCard
              icon={Plane}
              iconColor="#059669"
              title="Upcoming Trips"
              seeAllTo="/my-bookings"
              seeAllLabel="View all"
            >
              {loadingB ? (
                <div style={{ textAlign: "center", padding: 28 }}>
                  <div style={S.spinner} />
                </div>
              ) : upcomingTrips.length === 0 ? (
                <EmptyInCard
                  icon={Plane}
                  text="No upcoming confirmed trips"
                  cta={{ to: "/booking", label: "Book your first adventure" }}
                />
              ) : (
                upcomingTrips.map((b) => (
                  <TripItem key={b.id} booking={b} />
                ))
              )}
            </SectionCard>

            {/* Latest Activity */}
            <SectionCard
              icon={Bell}
              iconColor="#7c3aed"
              title="Latest Activity"
              seeAllTo="/notifications"
              seeAllLabel="All"
            >
              {recentActivity.length === 0 ? (
                <EmptyInCard
                  icon={Bell}
                  text="No recent activity yet"
                />
              ) : (
                recentActivity.map((n) => (
                  <NotifItem key={n.id} notif={n} />
                ))
              )}
            </SectionCard>
          </div>

          {/* ── Travel Progress ───────────────────────────────────────── */}
          <SectionCard
            icon={TrendingUp}
            iconColor="#059669"
            title="Travel Progress"
          >
            <div className="db-prog-grid" style={S.progressGrid}>
              {[
                { value: travelStats.countriesVisited, label: "Countries Visited" },
                { value: travelStats.completed,        label: "Tours Completed"   },
                { value: travelStats.total,            label: "Total Bookings"    },
              ].map((item) => (
                <div key={item.label} style={S.progressItem}>
                  <p style={S.progressValue}>{item.value}</p>
                  <p style={S.progressLabel}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* Level indicator */}
            <div style={S.levelBar}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg,#059669,#047857)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Award size={20} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 5px", fontSize: "0.87rem", fontWeight: 800, color: "#065f46" }}>
                  {adventureLevel.label}
                </p>
                {/* Progress bar */}
                <div style={{
                  height: 6, borderRadius: 99,
                  background: "#d1fae5", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width:  `${Math.min(100, adventureLevel.pct)}%`,
                    borderRadius: 99,
                    background: "linear-gradient(90deg,#059669,#10b981)",
                    transition: "width 1s ease",
                  }} />
                </div>
                {adventureLevel.next && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#059669" }}>
                    {travelStats.completed}/{adventureLevel.next} tours to next level
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Travel Checklist CTA ──────────────────────────────────── */}
          <div style={S.checklistCta}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "#fef08a",
              display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <Zap size={26} color="#d97706" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 800, color: "#92400e" }}>
                Pre-Trip Checklist
              </h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#a16207" }}>
                Make sure you're ready — passport, visa, travel insurance and more.
              </p>
            </div>
            <Link
              to="/tips"
              style={{
                padding: "10px 18px", borderRadius: 11,
                background: "#d97706", color: "#fff",
                border: "none", fontWeight: 700, fontSize: "0.83rem",
                cursor: "pointer", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
                flexShrink: 0, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = "#b45309";
                e.currentTarget.style.transform   = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = "#d97706";
                e.currentTarget.style.transform   = "translateY(0)";
              }}
            >
              View Tips <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}