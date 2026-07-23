// src/pages/auth/Dashboard.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// USER DASHBOARD v4.0 — Interactive Charts, Green/White Theme, Fully Responsive
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import { Helmet }           from "react-helmet-async";
import { Link }             from "react-router-dom";
import { useUserAuth }      from "../../context/UserAuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import DashboardLayout      from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";

import {
  Calendar, Heart, Star, ArrowRight, TrendingUp, Clock, Award,
  MapPin, Ticket, Map, BookOpen, Bell, Plane, Globe, Compass,
  Bookmark, Shield, CheckCircle, ChevronRight, Loader2,
  Sparkles, Trophy, Users, BarChart2, RefreshCw,
  LayoutDashboard, AlertCircle, Zap, Activity,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

/* ── Icon CDN (Iconify — online, no local files) ── */
const ICON = {
  plane:    "https://api.iconify.design/lucide/plane.svg?color=%23059669",
  globe:    "https://api.iconify.design/lucide/globe.svg?color=%237c3aed",
  trophy:   "https://api.iconify.design/lucide/trophy.svg?color=%23d97706",
  bell:     "https://api.iconify.design/lucide/bell.svg?color=%23e11d48",
  bookmark: "https://api.iconify.design/lucide/bookmark.svg?color=%23059669",
  zap:      "https://api.iconify.design/lucide/zap.svg?color=%23d97706",
  map:      "https://api.iconify.design/lucide/map.svg?color=%23059669",
  heart:    "https://api.iconify.design/lucide/heart.svg?color=%23e11d48",
  compass:  "https://api.iconify.design/lucide/compass.svg?color=%232563eb",
  award:    "https://api.iconify.design/lucide/award.svg?color=%23059669",
  chart:    "https://api.iconify.design/lucide/bar-chart-2.svg?color=%230369a1",
  trending: "https://api.iconify.design/lucide/trending-up.svg?color=%23059669",
};

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
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

const daysUntil = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
};

const safeFetch = async (authFetch, endpoint, options = {}) => {
  try {
    const result = await authFetch(endpoint, options);
    return { data: result, error: null };
  } catch (err) {
    const status = err?.status || err?.statusCode || 0;
    if (status === 403 || status === 401) return { data: null, error: `auth:${status}` };
    return { data: null, error: err.message || "Request failed" };
  }
};

/* Generate last-6-month labels */
const getMonthLabels = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleDateString("en-US", { month: "short" }));
  }
  return months;
};

/* ═══════════════════════════════════════════════════════════════════════════
   KEYFRAMES & GLOBAL STYLES
═══════════════════════════════════════════════════════════════════════════ */

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes dbFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes dbFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes dbSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes dbPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }
  @keyframes dbBarGrow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes dbLineGrow {
    from { stroke-dashoffset: 1000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes dbRingFill {
    from { stroke-dashoffset: 283; }
  }
  @keyframes dbCountUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes dbShimmer {
    from { background-position: -400px 0; }
    to   { background-position:  400px 0; }
  }
  @keyframes dbSlideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0);     }
  }
  @keyframes dbBadgePop {
    0%   { transform: scale(0.7); opacity: 0; }
    60%  { transform: scale(1.1); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes dbGlowPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0); }
    50%       { box-shadow: 0 0 0 8px rgba(5,150,105,0.12); }
  }

  .db-root {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    max-width: 1040px;
    margin: 0 auto;
    animation: dbFadeUp 0.5s ease-out both;
    -webkit-font-smoothing: antialiased;
  }

  /* Charts */
  .db-bar { transform-origin: bottom; animation: dbBarGrow 0.7s cubic-bezier(.34,1.56,.64,1) both; }
  .db-line-path { stroke-dasharray: 1000; animation: dbLineGrow 1.2s ease forwards; }
  .db-ring { animation: dbRingFill 1s ease forwards; }

  /* Hover interactions */
  .db-stat-card:hover  { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.10) !important; }
  .db-quick-card:hover { transform: translateY(-4px) !important; border-color: #a7f3d0 !important; box-shadow: 0 8px 24px rgba(5,150,105,0.12) !important; }
  .db-chart-bar:hover  { opacity: 0.8; cursor: pointer; }
  .db-trip-row:hover   { background: #f0fdf4 !important; border-radius: 12px; }

  /* Skeleton shimmer */
  .db-skeleton {
    background: linear-gradient(90deg, #f0fdf4 25%, #dcfce7 50%, #f0fdf4 75%);
    background-size: 400px 100%;
    animation: dbShimmer 1.4s ease infinite;
    border-radius: 10px;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .db-charts-row { grid-template-columns: 1fr !important; }
    .db-two-col    { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 680px) {
    .db-hero        { padding: 1.4rem 1.5rem !important; flex-direction: column !important; align-items: flex-start !important; }
    .db-stats-grid  { grid-template-columns: repeat(2, 1fr) !important; }
    .db-quick-grid  { grid-template-columns: repeat(2, 1fr) !important; }
    .db-prog-grid   { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 420px) {
    .db-stats-grid  { grid-template-columns: 1fr 1fr !important; }
    .db-quick-grid  { grid-template-columns: 1fr 1fr !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   INLINE STYLES OBJECT
═══════════════════════════════════════════════════════════════════════════ */

const S = {
  root: { /* managed by .db-root class */ },

  /* Hero */
  hero: {
    background:     "linear-gradient(135deg, #064e3b 0%, #065f46 45%, #047857 100%)",
    borderRadius:   24,
    padding:        "2.2rem 2.8rem",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    gap:            "1.5rem",
    flexWrap:       "wrap",
    position:       "relative",
    overflow:       "hidden",
  },
  heroBlob1: {
    position: "absolute", top: -90, right: -90,
    width: 280, height: 280, borderRadius: "50%",
    background: "rgba(255,255,255,0.05)", pointerEvents: "none",
  },
  heroBlob2: {
    position: "absolute", bottom: -70, left: "25%",
    width: 200, height: 200, borderRadius: "50%",
    background: "rgba(255,255,255,0.03)", pointerEvents: "none",
  },
  heroBlob3: {
    position: "absolute", top: "20%", left: -60,
    width: 160, height: 160, borderRadius: "50%",
    background: "rgba(255,255,255,0.03)", pointerEvents: "none",
  },
  heroLeft:     { zIndex: 1 },
  heroGreeting: {
    fontSize: "0.78rem", fontWeight: 700,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase", letterSpacing: "1.2px",
    margin: "0 0 6px",
  },
  heroName: {
    fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", fontWeight: 900,
    color: "#fff", margin: "0 0 6px",
    lineHeight: 1.15, letterSpacing: "-0.5px",
  },
  heroSub: { color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", margin: 0 },
  heroActions:    { display: "flex", gap: 10, flexWrap: "wrap", zIndex: 1 },
  heroBtnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 22px", borderRadius: 14,
    fontSize: "0.87rem", fontWeight: 700,
    background: "#fff", color: "#059669",
    border: "none", textDecoration: "none",
    boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
    transition: "all 0.22s", fontFamily: "inherit", cursor: "pointer",
  },
  heroBtnGhost: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 22px", borderRadius: 14,
    fontSize: "0.87rem", fontWeight: 700,
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.28)",
    backdropFilter: "blur(10px)", color: "#fff",
    textDecoration: "none", transition: "all 0.22s",
    fontFamily: "inherit", cursor: "pointer",
  },

  /* Section label */
  sectionLabel: {
    fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.7px",
    margin: "0 0 14px",
  },

  /* Stats grid */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 12,
  },

  /* Chart card */
  chartCard: {
    background: "#fff",
    borderRadius: 22,
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  chartHeader: {
    padding: "16px 22px 12px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    background: "#fafdfb",
  },
  chartTitle: {
    margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#0f172a",
    display: "flex", alignItems: "center", gap: 8,
  },
  chartBody: { padding: "18px 22px", flex: 1 },

  /* Quick actions */
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
  },
  quickCard: {
    background: "#fff", borderRadius: 18, padding: "18px 16px",
    border: "1.5px solid #e2e8f0",
    textDecoration: "none",
    display: "flex", flexDirection: "column", gap: 10,
    transition: "all 0.22s", cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  quickIcon: (bg) => ({
    width: 46, height: 46, borderRadius: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: bg, flexShrink: 0,
  }),
  quickLabel: { fontSize: "0.88rem", fontWeight: 800, color: "#0f172a", margin: "0 0 2px" },
  quickDesc:  { fontSize: "0.72rem", color: "#94a3b8", margin: 0 },

  /* Generic card */
  card: {
    background: "#fff", borderRadius: 22,
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 22px", borderBottom: "1px solid #f1f5f9",
    background: "#fafdfb",
  },
  cardTitle: {
    margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#0f172a",
    display: "flex", alignItems: "center", gap: 8,
  },
  cardSeeAll: {
    fontSize: "0.77rem", color: "#059669", fontWeight: 700,
    textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
  },
  cardBody:  { padding: "14px 22px" },

  /* Two col */
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem",
  },

  /* Trip item */
  tripRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "11px 6px", borderBottom: "1px solid #f8fafc",
    transition: "all 0.18s",
  },
  tripIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    background: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  tripName: {
    fontSize: "0.88rem", fontWeight: 800, color: "#0f172a",
    margin: "0 0 3px", whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
  },
  tripDate: {
    fontSize: "0.72rem", color: "#64748b", margin: 0,
    display: "flex", alignItems: "center", gap: 4,
  },

  /* Notif item */
  notifItem: {
    display: "flex", gap: 10, alignItems: "flex-start",
    padding: "10px 0", borderBottom: "1px solid #f8fafc",
  },
  notifDot: (read) => ({
    width: 8, height: 8, borderRadius: "50%",
    flexShrink: 0, marginTop: 6,
    background:  read ? "#e2e8f0" : "#059669",
    boxShadow:   read ? "none" : "0 0 0 3px rgba(5,150,105,0.18)",
    transition: "all 0.3s",
  }),
  notifTitle: {
    margin: 0, fontSize: "0.83rem", color: "#0f172a",
    fontWeight: 600, lineHeight: 1.45,
  },
  notifSub: { fontSize: "0.71rem", color: "#94a3b8" },

  /* Progress bar item */
  progressItem: {
    background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
    border: "1px solid #bbf7d0", borderRadius: 14,
    padding: "16px 12px", textAlign: "center",
  },
  progressValue: {
    fontSize: "1.55rem", fontWeight: 900, color: "#059669", margin: "0 0 4px",
  },
  progressLabel: {
    fontSize: "0.67rem", fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.4px", margin: 0,
  },

  /* Spinner */
  spinner: {
    width: 34, height: 34, borderRadius: "50%",
    border: "3px solid #e2e8f0", borderTopColor: "#059669",
    animation: "dbSpin 0.8s linear infinite",
    margin: "0 auto",
  },

  /* Level bar */
  levelBar: {
    padding: "14px 16px", background: "#f0fdf4",
    borderRadius: 13, border: "1px solid #bbf7d0",
    display: "flex", alignItems: "center", gap: 14,
  },

  /* Checklist CTA */
  checklistCta: {
    background: "linear-gradient(135deg,#fefce8,#fef9c3)",
    border: "1.5px solid #fde68a", borderRadius: 20,
    padding: "20px 24px",
    display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════════════════════════ */

function AnimatedNumber({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(null);
  const raf   = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }

    start.current = null;
    const step = (timestamp) => {
      if (!start.current) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{display}</>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD (with mini sparkline)
═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, value, label, color, iconBg, sparkData = [] }) {
  const max = Math.max(...sparkData, 1);

  return (
    <motion.div
      className="db-stat-card"
      style={{
        background: "#fff", borderRadius: 20, padding: "18px 16px",
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", gap: 8,
        transition: "all 0.22s", cursor: "default",
        position: "relative", overflow: "hidden",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={color} />
      </div>

      {/* Value */}
      <p style={{
        fontSize: "1.8rem", fontWeight: 900, margin: 0,
        color, lineHeight: 1, letterSpacing: "-0.5px",
        animation: "dbCountUp 0.4s ease both",
      }}>
        <AnimatedNumber value={value} />
      </p>

      {/* Label */}
      <p style={{
        fontSize: "0.68rem", fontWeight: 700, color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.5px", margin: 0,
      }}>
        {label}
      </p>

      {/* Mini sparkline */}
      {sparkData.length > 1 && (
        <div style={{ marginTop: 4, height: 28 }}>
          <svg width="100%" height="28" viewBox="0 0 80 28" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.45"
              points={sparkData.map((v, i) =>
                `${(i / (sparkData.length - 1)) * 80},${28 - (v / max) * 24}`
              ).join(" ")}
              style={{ animation: "dbLineGrow 1s ease forwards" }}
            />
          </svg>
        </div>
      )}

      {/* Subtle gradient overlay */}
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        width: 70, height: 70, borderRadius: "50%",
        background: iconBg, opacity: 0.5,
        transform: "translate(30%,30%)", pointerEvents: "none",
      }} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BAR CHART
═══════════════════════════════════════════════════════════════════════════ */

function BarChart({ data = [], labels = [], color = "#059669", height = 140 }) {
  const [tooltip, setTooltip] = useState(null);
  const max = Math.max(...data, 1);

  return (
    <div style={{ position: "relative" }}>
      {/* Y axis labels */}
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height }}>
        {data.map((v, i) => {
          const pct   = (v / max) * 100;
          const delay = `${i * 0.06}s`;
          return (
            <div
              key={i}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              {/* Tooltip */}
              {tooltip === i && (
                <div style={{
                  position: "absolute",
                  background: "#0f172a",
                  color: "#fff",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 8,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  top: `${height - (pct / 100) * height - 36}px`,
                  left: `${(i / data.length) * 100 + 100 / data.length / 2}%`,
                  transform: "translateX(-50%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}>
                  {v}
                </div>
              )}

              {/* Bar */}
              <div style={{
                width: "100%", height: `${pct}%`,
                minHeight: v > 0 ? 4 : 0,
                background: `linear-gradient(to top, ${color}, ${color}cc)`,
                borderRadius: "6px 6px 0 0",
                transformOrigin: "bottom",
                animation: `dbBarGrow 0.6s cubic-bezier(.34,1.56,.64,1) ${delay} both`,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
                className="db-chart-bar"
                onMouseEnter={() => setTooltip(i)}
                onMouseLeave={() => setTooltip(null)}
              />
            </div>
          );
        })}
      </div>

      {/* X labels */}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {labels.map((l, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center",
            fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600,
          }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LINE CHART (SVG path)
═══════════════════════════════════════════════════════════════════════════ */

function LineChart({ data = [], labels = [], color = "#059669", height = 140 }) {
  const [hovered, setHovered] = useState(null);
  const W   = 400;
  const H   = height;
  const pad = { t: 12, r: 10, b: 28, l: 24 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max    = Math.max(...data, 1);
  const min    = 0;

  const pts = data.map((v, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * innerW,
    y: pad.t + (1 - (v - min) / (max - min)) * innerH,
    v,
  }));

  const pathD = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")
    : "";

  const areaD = pts.length > 1
    ? `${pathD} L ${pts[pts.length - 1].x},${H - pad.b} L ${pts[0].x},${H - pad.b} Z`
    : "";

  const gradId = `lg-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((v) => (
        <line
          key={v}
          x1={pad.l} y1={pad.t + (1 - v) * innerH}
          x2={W - pad.r} y2={pad.t + (1 - v) * innerH}
          stroke="#f1f5f9" strokeWidth={1}
        />
      ))}

      {/* Area fill */}
      {areaD && (
        <path d={areaD} fill={`url(#${gradId})`} />
      )}

      {/* Line */}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          style={{ animation: "dbLineGrow 1.2s ease forwards" }}
        />
      )}

      {/* Dots */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x} cy={p.y} r={hovered === i ? 6 : 4}
            fill="#fff"
            stroke={color}
            strokeWidth={hovered === i ? 2.5 : 2}
            style={{ cursor: "pointer", transition: "r 0.15s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
          {hovered === i && (
            <g>
              <rect
                x={p.x - 20} y={p.y - 28}
                width={40} height={20}
                rx={6} fill="#0f172a"
              />
              <text
                x={p.x} y={p.y - 14}
                textAnchor="middle"
                fill="#fff"
                fontSize={9}
                fontWeight={700}
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {p.v}
              </text>
            </g>
          )}
        </g>
      ))}

      {/* X labels */}
      {labels.map((l, i) => {
        const x = pad.l + (i / Math.max(labels.length - 1, 1)) * innerW;
        return (
          <text
            key={i}
            x={x} y={H - 4}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={8.5}
            fontWeight={600}
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            {l}
          </text>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════════════════════════════════ */

function DonutChart({ segments = [], size = 130 }) {
  const r   = 40;
  const cx  = 50;
  const cy  = 50;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, g) => s + (g.value || 0), 0) || 1;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const pct    = seg.value / total;
    const dash   = pct * circ;
    const offset = circ * (1 - cumulative);
    cumulative  += pct;
    return { ...seg, dash, offset };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={12} />

        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={12}
            strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{
              animation: `dbRingFill 1s ease ${i * 0.15}s both`,
              transition: "stroke-dasharray 0.5s ease",
            }}
          />
        ))}

        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#0f172a"
          fontSize={13} fontWeight={900} fontFamily="Plus Jakarta Sans, sans-serif">
          {total}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fill="#94a3b8"
          fontSize={7} fontWeight={600} fontFamily="Plus Jakarta Sans, sans-serif">
          TOTAL
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: seg.color, flexShrink: 0,
            }} />
            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, flex: 1 }}>
              {seg.label}
            </span>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f172a" }}>
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACTIVITY HEATMAP (last 12 weeks)
═══════════════════════════════════════════════════════════════════════════ */

function ActivityHeatmap({ bookings = [] }) {
  const weeks  = 12;
  const days   = 7;
  const today  = new Date();

  const cellMap = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const d = b.created_at || b.createdAt || b.travel_date;
      if (!d) return;
      const key = new Date(d).toISOString().split("T")[0];
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [bookings]);

  const cells = useMemo(() => {
    const result = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const weekRow = [];
      for (let d = 0; d < days; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - w * 7 - (days - 1 - d));
        const key   = date.toISOString().split("T")[0];
        const count = cellMap[key] || 0;
        weekRow.push({ date: key, count });
      }
      result.push(weekRow);
    }
    return result;
  }, [cellMap]);

  const getColor = (count) => {
    if (count === 0) return "#f0fdf4";
    if (count === 1) return "#a7f3d0";
    if (count === 2) return "#34d399";
    if (count >= 3) return "#059669";
    return "#f0fdf4";
  };

  const [tooltip, setTooltip] = useState(null);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{
        display: "flex", gap: 3,
        minWidth: "fit-content",
      }}>
        {cells.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${cell.date}: ${cell.count} booking${cell.count !== 1 ? "s" : ""}`}
                style={{
                  width: 12, height: 12, borderRadius: 3,
                  background: getColor(cell.count),
                  border: "1px solid rgba(0,0,0,0.05)",
                  cursor: cell.count > 0 ? "pointer" : "default",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (cell.count > 0) e.currentTarget.style.transform = "scale(1.5)";
                  setTooltip({ date: cell.date, count: cell.count });
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  setTooltip(null);
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginTop: 10, justifyContent: "flex-end",
      }}>
        <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Less</span>
        {["#f0fdf4", "#a7f3d0", "#34d399", "#059669"].map((c) => (
          <div key={c} style={{
            width: 10, height: 10, borderRadius: 3,
            background: c, border: "1px solid rgba(0,0,0,0.05)",
          }} />
        ))}
        <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>More</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK ACTION CARD
═══════════════════════════════════════════════════════════════════════════ */

const QUICK_ACTIONS = [
  { label: "Book a Tour",    desc: "Plan your next adventure",    Icon: Map,      color: "#059669", iconBg: "#ecfdf5", to: "/booking"      },
  { label: "Destinations",   desc: "Explore East Africa",         Icon: Globe,    color: "#2563eb", iconBg: "#eff6ff", to: "/destinations" },
  { label: "My Bookings",    desc: "View and manage trips",       Icon: Bookmark, color: "#7c3aed", iconBg: "#faf5ff", to: "/my-bookings"  },
  { label: "Wishlist",       desc: "Your saved destinations",     Icon: Heart,    color: "#e11d48", iconBg: "#fff1f2", to: "/wishlist"     },
];

function QuickCard({ label, desc, Icon, color, iconBg, to }) {
  return (
    <Link
      to={to}
      className="db-quick-card"
      style={S.quickCard}
    >
      <div style={S.quickIcon(iconBg)}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={S.quickLabel}>{label}</p>
        <p style={S.quickDesc}>{desc}</p>
      </div>
      <ChevronRight size={14} color="#cbd5e1" style={{ marginTop: "auto", alignSelf: "flex-end" }} />
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION CARD WRAPPER
═══════════════════════════════════════════════════════════════════════════ */

function SectionCard({ icon: Icon, iconColor = "#059669", title, seeAllTo, badge, children }) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <h3 style={S.cardTitle}>
          <Icon size={16} color={iconColor} />
          {title}
          {badge != null && (
            <span style={{
              background: iconColor + "18", color: iconColor,
              fontSize: "0.65rem", fontWeight: 800,
              padding: "2px 8px", borderRadius: 20,
              animation: "dbBadgePop 0.4s ease both",
            }}>
              {badge}
            </span>
          )}
        </h3>
        {seeAllTo && (
          <Link to={seeAllTo} style={S.cardSeeAll}>
            See all <ArrowRight size={12} />
          </Link>
        )}
      </div>
      <div style={S.cardBody}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRIP ITEM
═══════════════════════════════════════════════════════════════════════════ */

function TripItem({ booking }) {
  const d = daysUntil(booking.travel_date);
  const urgency =
    d === 0    ? { bg: "#fef2f2", color: "#dc2626", label: "Today"      }
    : d === 1  ? { bg: "#fff7ed", color: "#ea580c", label: "Tomorrow"   }
    : d <= 3   ? { bg: "#fffbeb", color: "#d97706", label: `${d}d away` }
    : d <= 7   ? { bg: "#ecfdf5", color: "#059669", label: `${d}d away` }
    : d !== null ? { bg: "#f0f9ff", color: "#0369a1", label: fmtDate(booking.travel_date) }
    : { bg: "#f8fafc", color: "#64748b", label: booking.status || "—" };

  return (
    <div className="db-trip-row" style={S.tripRow}>
      <div style={S.tripIconWrap}>
        <Plane size={18} color="#059669" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={S.tripName}>
          {booking.destination_name || booking.package_title || "Adventure"}
        </p>
        <p style={S.tripDate}>
          <Calendar size={11} />
          {fmtDate(booking.travel_date)}
          {booking.travelers_count && (
            <span style={{ marginLeft: 6, display: "flex", alignItems: "center", gap: 3 }}>
              <Users size={11} /> {booking.travelers_count}
            </span>
          )}
        </p>
      </div>
      <span style={{
        fontSize: "0.64rem", fontWeight: 800, padding: "3px 9px",
        borderRadius: 8, background: urgency.bg, color: urgency.color,
        textTransform: "uppercase", letterSpacing: "0.3px", flexShrink: 0,
        animation: "dbBadgePop 0.35s ease both",
      }}>
        {urgency.label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════════════════ */

function EmptyInCard({ icon: Icon, text, cta, iconColor = "#059669" }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
      <div style={{
        width: 54, height: 54, borderRadius: 16,
        background: "#f0fdf4",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px",
      }}>
        <Icon size={24} color={iconColor} />
      </div>
      <p style={{ margin: "0 0 8px", fontSize: "0.84rem", fontWeight: 600, color: "#475569" }}>
        {text}
      </p>
      {cta && (
        <Link to={cta.to} style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          marginTop: 4, fontSize: "0.79rem", color: "#059669",
          fontWeight: 700, textDecoration: "none",
        }}>
          {cta.label} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════════════════════════════ */

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "18px 16px",
      border: "1.5px solid #e2e8f0",
    }}>
      <div className="db-skeleton" style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 10 }} />
      <div className="db-skeleton" style={{ width: "55%", height: 28, borderRadius: 8, marginBottom: 8 }} />
      <div className="db-skeleton" style={{ width: "80%", height: 12, borderRadius: 6 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */

export default function UserDashboard() {
  const { user, authFetch }            = useUserAuth();
  const { notifications, unreadCount } = useNotifications();

  const [bookings,  setBookings]  = useState([]);
  const [loadingB,  setLoadingB]  = useState(true);
  const [authWarn,  setAuthWarn]  = useState(null);
  const [fetchErr,  setFetchErr]  = useState(null);

  /* ── Fetch bookings ── */
  const fetchBookings = useCallback(async () => {
    setLoadingB(true);
    setAuthWarn(null);
    setFetchErr(null);

    let { data, error } = await safeFetch(
      authFetch, "/bookings/my-bookings?limit=50&page=1",
    );

    if ((error || !data) && !error?.startsWith("auth:")) {
      const fb = await safeFetch(
        authFetch, "/bookings?mine=true&limit=50&page=1",
      );
      if (!fb.error && fb.data) { data = fb.data; error = null; }
    }

    if (error) {
      if (error.startsWith("auth:"))
        setAuthWarn("Session may have expired. Please refresh or log in again.");
      else
        setFetchErr(error);
    } else {
      const rows =
        data?.data || data?.bookings || (Array.isArray(data) ? data : []);
      setBookings(rows);
    }

    setLoadingB(false);
  }, [authFetch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  /* ── Derived stats ── */
  const {
    upcomingTrips, travelStats, monthlyData, statusSegments, sparkData,
  } = useMemo(() => {
    const upcoming = bookings
      .filter((b) => {
        const d = daysUntil(b.travel_date);
        return b.status === "confirmed" && d !== null && d >= 0;
      })
      .sort((a, b) => new Date(a.travel_date) - new Date(b.travel_date))
      .slice(0, 5);

    const completed  = bookings.filter((b) => b.status === "completed").length;
    const confirmed  = bookings.filter((b) => b.status === "confirmed").length;
    const pending    = bookings.filter((b) => b.status === "pending").length;
    const cancelled  = bookings.filter((b) => b.status === "cancelled").length;
    const countries  = new Set(bookings.map((b) => b.country_name).filter(Boolean));

    /* Monthly counts (last 6 months) */
    const labels = getMonthLabels();
    const now    = new Date();
    const monthly = labels.map((_, i) => {
      const target = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return bookings.filter((b) => {
        const d = new Date(b.created_at || b.travel_date || 0);
        return d.getFullYear() === target.getFullYear() &&
               d.getMonth()    === target.getMonth();
      }).length;
    });

    /* Spark data for stat cards (last 6 pts) */
    const spark = {
      bookings:   monthly,
      upcoming:   monthly.map((v) => Math.round(v * 0.6)),
      countries:  monthly.map((_, i) => Math.min(i + 1, countries.size)),
      completed:  monthly.map((v, i) => i < monthly.length - 1 ? Math.round(v * 0.4) : completed),
    };

    return {
      upcomingTrips: upcoming,
      travelStats: {
        total:     bookings.length,
        upcoming:  upcoming.length,
        completed,
        countries: countries.size,
      },
      monthlyData:    { labels, values: monthly },
      statusSegments: [
        { label: "Completed", value: completed,  color: "#059669" },
        { label: "Confirmed", value: confirmed,  color: "#2563eb" },
        { label: "Pending",   value: pending,    color: "#d97706" },
        { label: "Cancelled", value: cancelled,  color: "#e11d48" },
      ],
      sparkData: spark,
    };
  }, [bookings]);

  const firstName = useMemo(() => {
    const n = user?.fullName || user?.name || "Traveler";
    return n.split(" ")[0];
  }, [user]);

  const adventureLevel =
    travelStats.completed >= 10 ? { label: "Elite Explorer",    pct: 100, next: null }
    : travelStats.completed >= 5  ? { label: "Expert Adventurer", pct: Math.round(travelStats.completed / 10 * 100), next: 10 }
    : travelStats.completed >= 2  ? { label: "Trailblazer",       pct: Math.round(travelStats.completed / 5  * 100), next: 5  }
    :                               { label: "Explorer",           pct: Math.round(travelStats.completed / 2  * 100), next: 2  };

  const recentActivity = useMemo(() => notifications.slice(0, 5), [notifications]);

  /* ═════════════════════════════════════════════════════════════════════
     RENDER
  ═════════════════════════════════════════════════════════════════════ */

  return (
    <>
      <Helmet>
        <title>Dashboard | Altuvera</title>
        <meta name="description" content="Your Altuvera travel dashboard." />
      </Helmet>

      <style>{KEYFRAMES}</style>

      <DashboardLayout title="" subtitle="">
        <div className="db-root" style={{
          display: "flex", flexDirection: "column", gap: "1.5rem",
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          maxWidth: 1040, margin: "0 auto",
          animation: "dbFadeUp 0.5s ease-out both",
          WebkitFontSmoothing: "antialiased",
        }}>

          {/* ── Auth warning ────────────────────────────────────────────── */}
          <AnimatePresence>
            {authWarn && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  padding: "12px 18px",
                  background: "#fffbeb", border: "1px solid #fde68a",
                  borderRadius: 14, color: "#92400e",
                  fontSize: "0.83rem", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <AlertCircle size={16} color="#d97706" />
                {authWarn}
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginLeft: "auto", border: "none", background: "transparent",
                    color: "#92400e", fontWeight: 700, cursor: "pointer",
                    textDecoration: "underline", fontSize: "0.82rem", padding: 0,
                  }}
                >
                  Reload
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Hero ────────────────────────────────────────────────────── */}
          <motion.div
            className="db-hero"
            style={S.hero}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
          >
            <div style={S.heroBlob1} />
            <div style={S.heroBlob2} />
            <div style={S.heroBlob3} />

            <div style={S.heroLeft}>
              <p style={S.heroGreeting}>{getGreeting()}, {firstName}</p>
              <h1 style={S.heroName}>Your Adventure Hub</h1>
              <p style={S.heroSub}>Track bookings, explore destinations and plan your next journey.</p>
            </div>

            <div style={S.heroActions}>
              <Link
                to="/booking"
                style={S.heroBtnPrimary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 26px rgba(0,0,0,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.18)";
                }}
              >
                <Map size={15} /> Book a Tour
              </Link>
              <Link
                to="/destinations"
                style={S.heroBtnGhost}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.13)"}
              >
                <Globe size={15} /> Destinations
              </Link>
            </div>
          </motion.div>

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <div>
            <p style={S.sectionLabel}>Overview</p>
            {loadingB ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }} className="db-stats-grid">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <motion.div
                className="db-stats-grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show:   { transition: { staggerChildren: 0.07 } },
                }}
              >
                {[
                  { icon: Bookmark,   value: travelStats.total,     label: "Total Bookings",    color: "#059669", iconBg: "#ecfdf5", sparkData: sparkData.bookings  },
                  { icon: Plane,      value: travelStats.upcoming,  label: "Upcoming Trips",    color: "#0369a1", iconBg: "#eff6ff", sparkData: sparkData.upcoming  },
                  { icon: Globe,      value: travelStats.countries, label: "Countries",         color: "#7c3aed", iconBg: "#faf5ff", sparkData: sparkData.countries },
                  { icon: Trophy,     value: travelStats.completed, label: "Completed",         color: "#d97706", iconBg: "#fffbeb", sparkData: sparkData.completed },
                  { icon: Bell,       value: unreadCount,           label: "Unread Alerts",     color: "#e11d48", iconBg: "#fff1f2", sparkData: [] },
                ].map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </motion.div>
            )}
          </div>

          {/* ── Quick Actions ────────────────────────────────────────────── */}
          <div>
            <p style={S.sectionLabel}>Quick Actions</p>
            <div
              className="db-quick-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}
            >
              {QUICK_ACTIONS.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <QuickCard {...a} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Charts Row ───────────────────────────────────────────────── */}
          <div>
            <p style={S.sectionLabel}>Analytics</p>
            <div
              className="db-charts-row"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}
            >

              {/* Bar chart — monthly bookings */}
              <motion.div
                style={S.chartCard}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div style={S.chartHeader}>
                  <h3 style={S.chartTitle}>
                    <BarChart2 size={16} color="#059669" />
                    Monthly Bookings
                  </h3>
                  <span style={{
                    fontSize: "0.7rem", color: "#94a3b8",
                    fontWeight: 600, background: "#f1f5f9",
                    padding: "3px 10px", borderRadius: 20,
                  }}>
                    Last 6 months
                  </span>
                </div>
                <div style={S.chartBody}>
                  {loadingB ? (
                    <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={S.spinner} />
                    </div>
                  ) : (
                    <>
                      <BarChart
                        data={monthlyData.values}
                        labels={monthlyData.labels}
                        color="#059669"
                        height={150}
                      />
                      <p style={{
                        margin: "14px 0 0", fontSize: "0.72rem", color: "#94a3b8",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        <TrendingUp size={12} color="#059669" />
                        {monthlyData.values.reduce((a, b) => a + b, 0)} bookings in total period
                      </p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Donut chart — booking status */}
              <motion.div
                style={S.chartCard}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18 }}
              >
                <div style={S.chartHeader}>
                  <h3 style={S.chartTitle}>
                    <Activity size={16} color="#7c3aed" />
                    Booking Status
                  </h3>
                  <span style={{
                    fontSize: "0.7rem", color: "#94a3b8",
                    fontWeight: 600, background: "#f1f5f9",
                    padding: "3px 10px", borderRadius: 20,
                  }}>
                    All time
                  </span>
                </div>
                <div style={S.chartBody}>
                  {loadingB ? (
                    <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={S.spinner} />
                    </div>
                  ) : travelStats.total === 0 ? (
                    <EmptyInCard
                      icon={Bookmark}
                      text="No booking data yet"
                      cta={{ to: "/booking", label: "Book your first tour" }}
                    />
                  ) : (
                    <DonutChart
                      segments={statusSegments.filter((s) => s.value > 0)}
                      size={140}
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* ── Line chart — travel trend + Heatmap ─────────────────────── */}
          <div
            className="db-charts-row"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}
          >
            {/* Line chart */}
            <motion.div
              style={S.chartCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
            >
              <div style={S.chartHeader}>
                <h3 style={S.chartTitle}>
                  <TrendingUp size={16} color="#0369a1" />
                  Travel Trend
                </h3>
                <span style={{
                  fontSize: "0.7rem", color: "#94a3b8",
                  fontWeight: 600, background: "#f1f5f9",
                  padding: "3px 10px", borderRadius: 20,
                }}>
                  6-month view
                </span>
              </div>
              <div style={S.chartBody}>
                {loadingB ? (
                  <div style={{ height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={S.spinner} />
                  </div>
                ) : (
                  <LineChart
                    data={monthlyData.values}
                    labels={monthlyData.labels}
                    color="#0369a1"
                    height={160}
                  />
                )}
              </div>
            </motion.div>

            {/* Activity heatmap */}
            <motion.div
              style={S.chartCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28 }}
            >
              <div style={S.chartHeader}>
                <h3 style={S.chartTitle}>
                  <Calendar size={16} color="#d97706" />
                  Booking Activity
                </h3>
                <span style={{
                  fontSize: "0.7rem", color: "#94a3b8",
                  fontWeight: 600, background: "#f1f5f9",
                  padding: "3px 10px", borderRadius: 20,
                }}>
                  Last 12 weeks
                </span>
              </div>
              <div style={{ ...S.chartBody, overflowX: "auto" }}>
                <ActivityHeatmap bookings={bookings} />
              </div>
            </motion.div>
          </div>

          {/* ── Upcoming Trips + Activity ─────────────────────────────────── */}
          <div className="db-two-col" style={S.twoCol}>

            {/* Upcoming Trips */}
            <SectionCard
              icon={Plane}
              iconColor="#059669"
              title="Upcoming Trips"
              seeAllTo="/my-bookings"
              badge={upcomingTrips.length || undefined}
            >
              {loadingB ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: "flex", gap: 10 }}>
                      <div className="db-skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="db-skeleton" style={{ height: 14, width: "60%", marginBottom: 8, borderRadius: 6 }} />
                        <div className="db-skeleton" style={{ height: 10, width: "40%", borderRadius: 6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingTrips.length === 0 ? (
                <EmptyInCard
                  icon={Plane}
                  text="No upcoming confirmed trips"
                  cta={{ to: "/booking", label: "Book your first adventure" }}
                />
              ) : (
                <AnimatePresence>
                  {upcomingTrips.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <TripItem booking={b} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </SectionCard>

            {/* Latest Activity */}
            <SectionCard
              icon={Bell}
              iconColor="#7c3aed"
              title="Latest Activity"
              seeAllTo="/notifications"
              badge={unreadCount || undefined}
            >
              {recentActivity.length === 0 ? (
                <EmptyInCard
                  icon={Bell}
                  text="No recent activity yet"
                  iconColor="#7c3aed"
                />
              ) : (
                <AnimatePresence>
                  {recentActivity.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={S.notifItem}
                    >
                      <div style={S.notifDot(n.is_read)} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={S.notifTitle}>{n.title}</p>
                        {n.message && (
                          <span style={S.notifSub}>
                            {n.message.length > 75
                              ? n.message.slice(0, 75) + "…"
                              : n.message}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </SectionCard>
          </div>

          {/* ── Adventure Level ──────────────────────────────────────────── */}
          <SectionCard
            icon={Award}
            iconColor="#d97706"
            title="Adventure Progress"
          >
            <div
              className="db-prog-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}
            >
              {[
                { value: travelStats.countries, label: "Countries Visited" },
                { value: travelStats.completed, label: "Tours Completed"   },
                { value: travelStats.total,     label: "Total Bookings"    },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  style={S.progressItem}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  <p style={S.progressValue}>
                    <AnimatedNumber value={item.value} />
                  </p>
                  <p style={S.progressLabel}>{item.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Level bar */}
            <div style={S.levelBar}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "linear-gradient(135deg,#059669,#047857)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, animation: "dbGlowPulse 2.5s ease infinite",
              }}>
                <Award size={20} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#065f46" }}>
                    {adventureLevel.label}
                  </p>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>
                    {adventureLevel.pct}%
                  </span>
                </div>
                <div style={{
                  height: 7, borderRadius: 99,
                  background: "#d1fae5", overflow: "hidden",
                }}>
                  <motion.div
                    style={{
                      height: "100%", borderRadius: 99,
                      background: "linear-gradient(90deg,#059669,#10b981)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, adventureLevel.pct)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                {adventureLevel.next && (
                  <p style={{ margin: "5px 0 0", fontSize: "0.72rem", color: "#059669" }}>
                    {travelStats.completed} / {adventureLevel.next} tours to reach next level
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Pre-trip CTA ─────────────────────────────────────────────── */}
          <motion.div
            style={S.checklistCta}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.38 }}
          >
            <div style={{
              width: 54, height: 54, borderRadius: 15,
              background: "#fef08a",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              animation: "dbGlowPulse 2.5s ease infinite",
            }}>
              <Zap size={26} color="#d97706" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 800, color: "#92400e" }}>
                Pre-Trip Checklist
              </h4>
              <p style={{ margin: 0, fontSize: "0.79rem", color: "#a16207" }}>
                Passport, visa, travel insurance, vaccines — make sure you are fully prepared.
              </p>
            </div>
            <Link
              to="/tips"
              style={{
                padding: "11px 20px", borderRadius: 12,
                background: "#d97706", color: "#fff",
                fontWeight: 700, fontSize: "0.83rem",
                textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
                flexShrink: 0, transition: "all 0.2s",
                boxShadow: "0 4px 16px rgba(217,119,6,0.28)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = "#b45309";
                e.currentTarget.style.transform   = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = "#d97706";
                e.currentTarget.style.transform   = "none";
              }}
            >
              View Tips <ArrowRight size={14} />
            </Link>
          </motion.div>

        </div>
      </DashboardLayout>
    </>
  );
}