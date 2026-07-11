// src/pages/auth/Dashboard.jsx  (or UserDashboard.jsx)
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar, FiMapPin, FiHeart, FiSettings,
  FiBell, FiMessageSquare, FiCreditCard, FiStar,
  FiCheckSquare, FiBarChart2, FiArrowRight,
  FiGlobe, FiTrendingUp, FiClock, FiAward,
} from "react-icons/fi";
import {
  HiOutlineTicket, HiOutlineLocationMarker,
} from "react-icons/hi";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  .db-root * { box-sizing: border-box; }
  .db-root {
    display: flex; flex-direction: column; gap: 1.75rem;
    animation: dbFadeIn 0.5s ease-out;
  }

  /* ── Hero Welcome ── */
  .db-welcome {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
    border-radius: 22px; padding: 2rem 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1.5rem; flex-wrap: wrap; position: relative; overflow: hidden;
  }
  .db-welcome::before {
    content: ''; position: absolute; top: -80px; right: -80px;
    width: 250px; height: 250px; border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .db-welcome::after {
    content: ''; position: absolute; bottom: -60px; left: 20%;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(255,255,255,0.03);
  }
  .db-welcome-left { z-index: 1; }
  .db-welcome-greeting {
    font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.65);
    text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;
  }
  .db-welcome-name {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 800; color: #fff; margin: 0 0 8px;
  }
  .db-welcome-sub { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0; }
  .db-welcome-actions { display: flex; gap: 10px; flex-wrap: wrap; z-index: 1; }
  .db-welcome-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px; font-size: 0.88rem;
    font-weight: 700; cursor: pointer; border: none; transition: all 0.2s;
    font-family: inherit; text-decoration: none;
  }
  .db-welcome-btn-primary {
    background: #fff; color: #059669;
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  }
  .db-welcome-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
  .db-welcome-btn-ghost {
    background: rgba(255,255,255,0.15); color: #fff;
    border: 1px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(8px);
  }
  .db-welcome-btn-ghost:hover { background: rgba(255,255,255,0.25); }

  /* ── Quick Actions ── */
  .db-quick-title {
    font-size: 0.78rem; font-weight: 800; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 12px;
  }
  .db-quick-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
  }
  .db-quick-card {
    background: #fff; border-radius: 16px; padding: 18px;
    border: 1.5px solid #e2e8f0; text-decoration: none;
    display: flex; flex-direction: column; gap: 10px;
    transition: all 0.2s; cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }
  .db-quick-card:hover {
    transform: translateY(-3px); border-color: #bbf7d0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
  .db-quick-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
  }
  .db-quick-label {
    font-size: 0.88rem; font-weight: 700; color: #0f172a; margin: 0;
  }
  .db-quick-desc { font-size: 0.72rem; color: #94a3b8; margin: 0; }

  /* ── Stats Row ── */
  .db-stats {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }
  .db-stat {
    background: #fff; border-radius: 16px; padding: 18px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .db-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.07); }
  .db-stat-emoji { font-size: 1.4rem; margin-bottom: 8px; }
  .db-stat-value { font-size: 1.6rem; font-weight: 900; margin: 0; line-height: 1; }
  .db-stat-label { font-size: 0.7rem; color: #64748b; margin: 4px 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }

  /* ── Two-col section ── */
  .db-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }

  /* ── Card ── */
  .db-card {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    overflow: hidden;
  }
  .db-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
    background: #fafdfb;
  }
  .db-card-header h3 {
    font-size: 0.92rem; font-weight: 800; color: #0f172a; margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  .db-card-see-all {
    font-size: 0.78rem; color: #059669; font-weight: 700;
    text-decoration: none; display: flex; align-items: center; gap: 4px;
  }
  .db-card-see-all:hover { color: #047857; }
  .db-card-body { padding: 16px 20px; }

  /* ── Activity Feed ── */
  .db-activity-item {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 10px 0; border-bottom: 1px solid #f8fafc;
  }
  .db-activity-item:last-child { border-bottom: none; }
  .db-activity-dot {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
  }
  .db-activity-text { flex: 1; min-width: 0; }
  .db-activity-text p { margin: 0; font-size: 0.84rem; color: #0f172a; font-weight: 600; line-height: 1.4; }
  .db-activity-text span { font-size: 0.72rem; color: #94a3b8; }

  /* ── Upcoming Trip ── */
  .db-trip-item {
    display: flex; gap: 12px; align-items: center;
    padding: 12px 0; border-bottom: 1px solid #f8fafc;
  }
  .db-trip-item:last-child { border-bottom: none; }
  .db-trip-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg,#ecfdf5,#d1fae5);
    display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
  }
  .db-trip-info { flex: 1; min-width: 0; }
  .db-trip-name { font-size: 0.9rem; font-weight: 800; color: #0f172a; margin: 0 0 3px; }
  .db-trip-date { font-size: 0.75rem; color: #64748b; margin: 0; display: flex; align-items: center; gap: 4px; }
  .db-trip-badge {
    font-size: 0.68rem; font-weight: 800; padding: 3px 8px;
    border-radius: 6px; text-transform: uppercase; letter-spacing: 0.3px;
    flex-shrink: 0;
  }

  /* ── Travel Progress ── */
  .db-progress-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .db-progress-item {
    background: linear-gradient(135deg,#f0fdf4,#ecfdf5);
    border: 1px solid #bbf7d0; border-radius: 14px;
    padding: 16px; text-align: center;
  }
  .db-progress-value {
    font-size: 1.5rem; font-weight: 900; color: #059669; margin: 0 0 4px;
  }
  .db-progress-label {
    font-size: 0.7rem; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.4px; margin: 0;
  }

  /* ── Recent notification ── */
  .db-notif-item {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 10px 0; border-bottom: 1px solid #f8fafc;
  }
  .db-notif-item:last-child { border-bottom: none; }
  .db-notif-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 6px;
  }
  .db-notif-text { flex: 1; min-width: 0; }
  .db-notif-text p { margin: 0; font-size: 0.84rem; color: #0f172a; font-weight: 600; line-height: 1.4; }
  .db-notif-text span { font-size: 0.72rem; color: #94a3b8; }

  /* ── Checklist CTA ── */
  .db-checklist-cta {
    background: linear-gradient(135deg,#fefce8,#fef9c3);
    border: 1.5px solid #fde68a; border-radius: 14px;
    padding: 18px 20px; display: flex; align-items: center; gap: 16px;
  }
  .db-checklist-icon { font-size: 2.2rem; flex-shrink: 0; }
  .db-checklist-text h4 { margin: 0 0 4px; font-size: 0.95rem; font-weight: 800; color: #92400e; }
  .db-checklist-text p { margin: 0; font-size: 0.8rem; color: #a16207; }
  .db-checklist-btn {
    margin-left: auto; padding: 9px 18px; border-radius: 10px;
    background: #d97706; color: #fff; border: none;
    font-weight: 700; font-size: 0.82rem; cursor: pointer;
    transition: all 0.2s; text-decoration: none; display: inline-flex;
    align-items: center; gap: 6px; font-family: inherit; flex-shrink: 0;
  }
  .db-checklist-btn:hover { background: #b45309; transform: translateY(-1px); }

  /* ── Loading ── */
  .db-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid #e2e8f0; border-top-color: #059669;
    animation: dbSpin 0.8s linear infinite; margin: 0 auto;
  }

  /* ── Keyframes ── */
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  @keyframes dbSpin   { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

  @media (max-width: 768px) {
    .db-two-col { grid-template-columns: 1fr; }
    .db-welcome { padding: 1.5rem; }
    .db-welcome-name { font-size: 1.5rem; }
    .db-quick-grid { grid-template-columns: repeat(2, 1fr); }
    .db-progress-grid { grid-template-columns: repeat(2,1fr); }
    .db-checklist-cta { flex-direction: column; align-items: flex-start; }
    .db-checklist-btn { margin-left: 0; }
  }
`;

// ─── Greeting ─────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: "Book a Tour",
    desc: "Plan your adventure",
    icon: "🗺️",
    bg: "#ecfdf5", color: "#059669",
    to: "/booking",
  },
  {
    label: "Browse Destinations",
    desc: "Explore East Africa",
    icon: "🌍",
    bg: "#eff6ff", color: "#2563eb",
    to: "/destinations",
  },
  {
    label: "My Bookings",
    desc: "View & manage trips",
    icon: "📋",
    bg: "#faf5ff", color: "#7c3aed",
    to: "/my-bookings",
  },
  {
    label: "Request Checklist",
    desc: "Get trip checklist from admin",
    icon: "✅",
    bg: "#fefce8", color: "#d97706",
    to: "/checklist",
  },
  {
    label: "Wishlist",
    desc: "Your saved destinations",
    icon: "❤️",
    bg: "#fff1f2", color: "#e11d48",
    to: "/wishlist",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, authFetch } = useUserAuth();
  const { notifications, unreadCount } = useNotifications();

  const [bookings,   setBookings]   = useState([]);
  const [loadingB,   setLoadingB]   = useState(true);
  const [activities, setActivities] = useState([]);

  // Fetch recent bookings
  const fetchBookings = useCallback(async () => {
    try {
      const data = await authFetch("/bookings/my-bookings?limit=5");
      setBookings(data?.data || data?.bookings || []);
    } catch { /* silent */ } finally { setLoadingB(false); }
  }, [authFetch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Upcoming bookings (confirmed + future)
  const upcomingTrips = useMemo(
    () =>
      bookings
        .filter((b) => {
          const d = daysUntil(b.travel_date);
          return b.status === "confirmed" && d !== null && d >= 0;
        })
        .sort((a, b) => new Date(a.travel_date) - new Date(b.travel_date))
        .slice(0, 3),
    [bookings],
  );

  // Recent activity from notifications
  const recentActivity = useMemo(
    () => notifications.slice(0, 5),
    [notifications],
  );

  // Travel stats derived from bookings
  const travelStats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === "completed");
    const countries  = new Set(bookings.map((b) => b.country_name).filter(Boolean));
    return {
      toursCompleted: completed.length,
      countriesVisited: countries.size,
      totalBookings: bookings.length,
      upcomingCount: upcomingTrips.length,
    };
  }, [bookings, upcomingTrips]);

  const firstName = useMemo(() => {
    const name = user?.fullName || user?.name || "Traveler";
    return name.split(" ")[0];
  }, [user]);

  return (
    <>
      <Helmet>
        <title>Dashboard | Altuvera</title>
        <meta name="description" content="Your Altuvera travel dashboard." />
      </Helmet>

      <DashboardLayout
        title=""
        subtitle=""
      >
        <style>{css}</style>
        <div className="db-root">

          {/* ── Welcome Hero ── */}
          <div className="db-welcome">
            <div className="db-welcome-left">
              <p className="db-welcome-greeting">
                {getGreeting()}, {firstName} 👋
              </p>
              <h1 className="db-welcome-name">Your Adventure Hub</h1>
              <p className="db-welcome-sub">
                Ready to explore the wonders of East Africa?
              </p>
            </div>
            <div className="db-welcome-actions">
              <Link to="/booking" className="db-welcome-btn db-welcome-btn-primary">
                🗺️ Book a Tour
              </Link>
              <Link to="/destinations" className="db-welcome-btn db-welcome-btn-ghost">
                🌍 Browse Destinations
              </Link>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="db-stats">
            {[
              { emoji: "✈️",  value: travelStats.totalBookings,   label: "Total Bookings",    color: "#059669" },
              { emoji: "🗓️",  value: travelStats.upcomingCount,   label: "Upcoming Trips",    color: "#0891b2" },
              { emoji: "🌍",  value: travelStats.countriesVisited, label: "Countries Visited", color: "#7c3aed" },
              { emoji: "🏆",  value: travelStats.toursCompleted,  label: "Tours Completed",   color: "#d97706" },
              { emoji: "🔔",  value: unreadCount,                  label: "Unread Alerts",     color: "#e11d48" },
            ].map((s) => (
              <div key={s.label} className="db-stat">
                <div className="db-stat-emoji">{s.emoji}</div>
                <p className="db-stat-value" style={{ color: s.color }}>{s.value}</p>
                <p className="db-stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <div>
            <p className="db-quick-title">Quick Actions</p>
            <div className="db-quick-grid">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="db-quick-card"
                >
                  <div
                    className="db-quick-icon"
                    style={{ background: action.bg, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <p className="db-quick-label">{action.label}</p>
                    <p className="db-quick-desc">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Checklist CTA ── */}
          <div className="db-checklist-cta">
            <div className="db-checklist-icon">📋</div>
            <div className="db-checklist-text">
              <h4>Request a Trip Checklist</h4>
              <p>
                Ask our team to prepare a personalized PDF checklist for your
                upcoming trip — delivered directly to you via notification.
              </p>
            </div>
            <Link to="/checklist" className="db-checklist-btn">
              Request Now <FiArrowRight size={13} />
            </Link>
          </div>

          {/* ── Two Column: Upcoming + Activity ── */}
          <div className="db-two-col">

            {/* Upcoming Trips */}
            <div className="db-card">
              <div className="db-card-header">
                <h3><FiCalendar size={16} color="#059669" /> Upcoming Trips</h3>
                <Link to="/my-bookings" className="db-card-see-all">
                  View all <FiArrowRight size={12} />
                </Link>
              </div>
              <div className="db-card-body">
                {loadingB ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <div className="db-spinner" />
                  </div>
                ) : upcomingTrips.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>✈️</div>
                    <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
                      No upcoming trips
                    </p>
                    <Link
                      to="/booking"
                      style={{
                        display: "inline-block", marginTop: 10, fontSize: "0.8rem",
                        color: "#059669", fontWeight: 700, textDecoration: "none",
                      }}
                    >
                      Book your first adventure →
                    </Link>
                  </div>
                ) : (
                  upcomingTrips.map((b) => {
                    const d = daysUntil(b.travel_date);
                    const urgency =
                      d === 0 ? { bg: "#fef2f2", color: "#dc2626", label: "TODAY!" }
                      : d === 1 ? { bg: "#fff7ed", color: "#ea580c", label: "TOMORROW" }
                      : d <= 3  ? { bg: "#fffbeb", color: "#d97706", label: `${d} days` }
                      : { bg: "#f0fdf4", color: "#059669", label: `${d} days` };
                    return (
                      <div key={b.id} className="db-trip-item">
                        <div className="db-trip-icon">✈️</div>
                        <div className="db-trip-info">
                          <p className="db-trip-name">
                            {b.destination_name || "Adventure"}
                          </p>
                          <p className="db-trip-date">
                            <FiCalendar size={11} /> {fmtDate(b.travel_date)}
                          </p>
                        </div>
                        <span
                          className="db-trip-badge"
                          style={{ background: urgency.bg, color: urgency.color }}
                        >
                          {urgency.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="db-card">
              <div className="db-card-header">
                <h3><FiClock size={16} color="#7c3aed" /> Latest Activity</h3>
                <Link to="/notifications" className="db-card-see-all">
                  All <FiArrowRight size={12} />
                </Link>
              </div>
              <div className="db-card-body">
                {recentActivity.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔔</div>
                    <p style={{ margin: 0, fontSize: "0.85rem" }}>No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((n) => (
                    <div key={n.id} className="db-notif-item">
                      <div
                        className="db-notif-dot"
                        style={{ background: n.is_read ? "#e2e8f0" : "#059669" }}
                      />
                      <div className="db-notif-text">
                        <p>{n.title}</p>
                        <span>{n.message?.slice(0, 60)}…</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Travel Progress ── */}
          <div className="db-card">
            <div className="db-card-header">
              <h3><FiTrendingUp size={16} color="#059669" /> Travel Progress</h3>
            </div>
            <div className="db-card-body">
              <div className="db-progress-grid">
                {[
                  { value: travelStats.countriesVisited, label: "Countries Visited" },
                  { value: travelStats.toursCompleted,   label: "Tours Completed"   },
                  { value: travelStats.totalBookings,    label: "Total Bookings"    },
                ].map((item) => (
                  <div key={item.label} className="db-progress-item">
                    <p className="db-progress-value">{item.value}</p>
                    <p className="db-progress-label">{item.label}</p>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 16, padding: "12px 16px",
                background: "#f0fdf4", borderRadius: 10,
                border: "1px solid #bbf7d0",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <FiAward size={18} color="#059669" />
                <div>
                  <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#065f46" }}>
                    Adventure Level: Explorer
                  </p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#059669" }}>
                    Complete more tours to unlock Elite status
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}