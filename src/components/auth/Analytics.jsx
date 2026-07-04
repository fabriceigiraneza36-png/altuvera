// src/pages/auth/Analytics.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import {
  FiBarChart2, FiMapPin, FiCalendar,
  FiTrendingUp, FiStar, FiDollarSign,
} from "react-icons/fi";

const css = `
  .an-root * { box-sizing: border-box; }
  .an-root { display: flex; flex-direction: column; gap: 1.5rem; animation: anFade 0.5s ease-out; }

  .an-hero {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
    border-radius: 20px; padding: 2rem 2.5rem; position: relative; overflow: hidden;
  }
  .an-hero-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0 0 6px; position: relative; z-index: 1; }
  .an-hero-sub { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0; position: relative; z-index: 1; }

  .an-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
  .an-stat {
    background: #fff; border-radius: 16px; border: 1.5px solid #e2e8f0;
    padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .an-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
  .an-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 12px; }
  .an-stat-value { font-size: 1.7rem; font-weight: 900; color: #0f172a; margin: 0 0 4px; line-height: 1; }
  .an-stat-label { font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin: 0; }

  .an-card {
    background: #fff; border-radius: 18px; border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03); overflow: hidden;
  }
  .an-card-header {
    padding: 16px 22px; border-bottom: 1px solid #f1f5f9; background: #fafdfb;
    display: flex; align-items: center; gap: 10px;
  }
  .an-card-header h3 { font-size: 0.92rem; font-weight: 800; color: #0f172a; margin: 0; }
  .an-card-body { padding: 20px 22px; }

  .an-dest-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 10px 0; border-bottom: 1px solid #f8fafc;
  }
  .an-dest-row:last-child { border-bottom: none; }
  .an-dest-name { font-size: 0.88rem; font-weight: 700; color: #0f172a; }
  .an-dest-count { font-size: 0.78rem; color: #64748b; margin: 2px 0 0; }
  .an-bar-wrap { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; margin: 0 12px; }
  .an-bar { height: 100%; border-radius: 3px; transition: width 0.8s ease; }

  .an-month-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; }
  .an-month-cell {
    background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;
    padding: 12px; text-align: center;
  }
  .an-month-cell.active { background: #f0fdf4; border-color: #bbf7d0; }
  .an-month-name { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; margin: 0 0 4px; }
  .an-month-count { font-size: 1.1rem; font-weight: 900; color: #059669; margin: 0; }

  .an-explorer-badge {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1.5px solid #bbf7d0; border-radius: 16px;
    padding: 20px; display: flex; align-items: center; gap: 16px;
  }
  .an-badge-icon { font-size: 2.5rem; }
  .an-badge-title { font-size: 1.1rem; font-weight: 900; color: #065f46; margin: 0 0 4px; }
  .an-badge-sub { font-size: 0.82rem; color: #059669; margin: 0; }

  @keyframes anFade { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  .an-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid #e2e8f0; border-top-color: #4338ca;
    animation: anSpin 0.8s linear infinite; margin: 32px auto;
  }
  @keyframes anSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

  @media (max-width: 640px) { .an-stats { grid-template-columns: repeat(2,1fr); } }
`;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Analytics() {
  const { authFetch } = useUserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await authFetch("/bookings/my-bookings?limit=100");
      setBookings(data?.data || data?.bookings || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === "completed");
    const countries  = new Set(bookings.map((b) => b.country_name).filter(Boolean));
    const cities     = new Set(bookings.map((b) => b.destination_name).filter(Boolean));
    const thisYear   = new Date().getFullYear();
    const tripsThisYear = bookings.filter(
      (b) => new Date(b.travel_date || b.created_at).getFullYear() === thisYear,
    ).length;

    const paid = bookings.filter((b) => b.payment_status === "paid");
    const totalSpent = paid.reduce(
      (sum, b) => sum + parseFloat(b.total_price || b.amount || 0), 0,
    );

    return {
      tripsThisYear,
      countriesVisited: countries.size,
      citiesVisited:    cities.size,
      toursCompleted:   completed.length,
      totalBookings:    bookings.length,
      totalSpent,
    };
  }, [bookings]);

  // Top destinations
  const topDestinations = useMemo(() => {
    const counts = {};
    bookings.forEach((b) => {
      if (b.destination_name) {
        counts[b.destination_name] = (counts[b.destination_name] || 0) + 1;
      }
    });
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  }, [bookings]);

  // Bookings by month (this year)
  const monthlyBookings = useMemo(() => {
    const counts = Array(12).fill(0);
    const year = new Date().getFullYear();
    bookings.forEach((b) => {
      const d = new Date(b.travel_date || b.created_at);
      if (d.getFullYear() === year) counts[d.getMonth()]++;
    });
    return counts;
  }, [bookings]);

  // Adventure level
  const level =
    stats.toursCompleted >= 20 ? { label: "Elite Explorer", icon: "🏆", color: "#d97706" }
    : stats.toursCompleted >= 10 ? { label: "Expert Adventurer", icon: "🌟", color: "#7c3aed" }
    : stats.toursCompleted >= 5  ? { label: "Explorer",     icon: "🧭", color: "#0891b2" }
    : { label: "Beginner Traveler", icon: "🌱", color: "#059669" };

  const ANALYTICS_STATS = [
    { icon: <FiCalendar size={18} />, iconBg: "#eff6ff", iconColor: "#2563eb", value: stats.tripsThisYear,    label: "Trips This Year"    },
    { icon: <FiMapPin   size={18} />, iconBg: "#f0fdf4", iconColor: "#059669", value: stats.countriesVisited, label: "Countries Visited"   },
    { icon: <FiMapPin   size={18} />, iconBg: "#faf5ff", iconColor: "#7c3aed", value: stats.citiesVisited,    label: "Cities Visited"      },
    { icon: <FiTrendingUp size={18}/>,iconBg: "#fef9c3", iconColor: "#d97706", value: stats.toursCompleted,   label: "Tours Completed"     },
    {
      icon: <FiDollarSign size={18} />, iconBg: "#f0fdf4", iconColor: "#059669",
      value: `$${stats.totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      label: "Total Invested",
    },
    { icon: <FiBarChart2 size={18} />, iconBg: "#f0f9ff", iconColor: "#0891b2", value: stats.totalBookings, label: "Total Bookings" },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics | Altuvera</title>
      </Helmet>
      <DashboardLayout
        title="Travel Analytics"
        subtitle="Your complete travel statistics and insights."
      >
        <style>{css}</style>
        <div className="an-root">

          <div className="an-hero">
            <div style={{ fontSize: "2rem", marginBottom: 8, position: "relative", zIndex: 1 }}>📊</div>
            <h1 className="an-hero-title">Travel Analytics</h1>
            <p className="an-hero-sub">
              Deep insights into your East African adventures
            </p>
          </div>

          {loading ? (
            <div className="an-spinner" />
          ) : (
            <>
              {/* Stats */}
              <div className="an-stats">
                {ANALYTICS_STATS.map((s) => (
                  <div key={s.label} className="an-stat">
                    <div className="an-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                      {s.icon}
                    </div>
                    <p className="an-stat-value">{s.value}</p>
                    <p className="an-stat-label">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Explorer Badge */}
              <div className="an-explorer-badge">
                <div className="an-badge-icon">{level.icon}</div>
                <div>
                  <p className="an-badge-title" style={{ color: level.color }}>
                    Adventure Level: {level.label}
                  </p>
                  <p className="an-badge-sub">
                    {stats.toursCompleted} tours completed •{" "}
                    {stats.countriesVisited} countries explored
                  </p>
                </div>
              </div>

              {/* Top Destinations */}
              {topDestinations.length > 0 && (
                <div className="an-card">
                  <div className="an-card-header">
                    <FiMapPin size={16} color="#059669" />
                    <h3>Top Destinations</h3>
                  </div>
                  <div className="an-card-body">
                    {topDestinations.map((d, i) => (
                      <div key={d.name} className="an-dest-row">
                        <div>
                          <p className="an-dest-name">
                            {i + 1}. {d.name}
                          </p>
                          <p className="an-dest-count">{d.count} booking{d.count !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="an-bar-wrap">
                          <div
                            className="an-bar"
                            style={{
                              width: `${d.pct}%`,
                              background: `linear-gradient(90deg, #059669, #34d399)`,
                            }}
                          />
                        </div>
                        <span style={{
                          fontFamily: "monospace", fontSize: "0.85rem",
                          fontWeight: 800, color: "#059669", minWidth: 28, textAlign: "right",
                        }}>
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly */}
              <div className="an-card">
                <div className="an-card-header">
                  <FiCalendar size={16} color="#4338ca" />
                  <h3>Trips by Month ({new Date().getFullYear()})</h3>
                </div>
                <div className="an-card-body">
                  <div className="an-month-grid">
                    {MONTHS.map((month, i) => (
                      <div
                        key={month}
                        className={`an-month-cell ${monthlyBookings[i] > 0 ? "active" : ""}`}
                      >
                        <p className="an-month-name">{month}</p>
                        <p className="an-month-count">
                          {monthlyBookings[i] || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}