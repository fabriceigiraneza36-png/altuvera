// src/components/auth/DashboardLayout.jsx
import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import {
  FiUser, FiCalendar, FiHeart, FiSettings,
  FiLogOut, FiMenu, FiX, FiBell,
  FiStar, FiHome,
} from "react-icons/fi";
import AnimatedSection from "../common/AnimatedSection";
import NotificationBell from "./NotificationBell";
import { useNotifications } from "../../hooks/useNotifications";

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout }    = useUserAuth();
  const navigate             = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tripAlerts, dismissTripAlert, unreadCount } = useNotifications();

  const handleLogout = () => { logout(); navigate("/"); };

  const navLinks = [
    { name: "Overview",       path: "/dashboard",      icon: <FiHome size={18} />        },
    { name: "My Profile",     path: "/profile",        icon: <FiUser size={18} />        },
    { name: "Bookings",       path: "/my-bookings",    icon: <FiCalendar size={18} />    },
    { name: "Wishlist",       path: "/wishlist",       icon: <FiHeart size={18} />       },
    { name: "Notifications",  path: "/notifications",  icon: <FiBell size={18} />        },
    { name: "Reviews",        path: "/reviews",        icon: <FiStar size={18} />        },
    { name: "Settings",       path: "/settings",       icon: <FiSettings size={18} />    },
  ];

  return (
    <div className="dashboard-layout">
      <style>{`
        .dashboard-layout {
          display: flex; min-height: calc(100vh - 80px);
          background-color: #f8fafc; padding-top: 80px;
        }
        .dashboard-sidebar {
          width: 260px; background: #ffffff;
          border-right: 1px solid #e2e8f0;
          padding: 24px 16px; display: flex; flex-direction: column;
          position: sticky; top: 80px; height: calc(100vh - 80px);
          overflow-y: auto; z-index: 10; transition: transform 0.3s ease;
        }
        .dashboard-user-card {
          text-align: center; margin-bottom: 24px;
          padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;
        }
        .dashboard-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #059669 0%, #34d399 100%);
          color: white; font-size: 28px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px; object-fit: cover;
          border: 3px solid #fff;
          box-shadow: 0 4px 14px rgba(5,150,105,0.2);
        }
        .dashboard-user-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px; color: #0f172a; margin: 0 0 3px; font-weight: 700;
        }
        .dashboard-user-email { font-size: 12px; color: #94a3b8; margin: 0; }
        .dashboard-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .dashboard-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 10px; color: #475569;
          font-size: 14px; font-weight: 500; text-decoration: none;
          transition: all 0.18s ease; position: relative;
        }
        .dashboard-nav-link:hover {
          background-color: #f1f5f9; color: #0f172a; transform: translateX(3px);
        }
        .dashboard-nav-link.active {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          color: #059669; font-weight: 700;
          border-left: 3px solid #059669;
        }
        .dashboard-nav-link .nav-badge {
          margin-left: auto; background: #059669; color: #fff;
          border-radius: 999px; font-size: 10px; font-weight: 800;
          padding: 1px 7px; min-width: 18px; text-align: center;
        }
        .dashboard-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 10px; color: #ef4444;
          font-size: 14px; font-weight: 500; background: none; border: none;
          cursor: pointer; width: 100%; text-align: left;
          transition: all 0.2s ease; margin-top: 8px;
        }
        .dashboard-logout-btn:hover { background-color: #fef2f2; }
        .dashboard-content {
          flex: 1; padding: 36px 32px; max-width: 1100px;
          margin: 0 auto; width: 100%;
        }
        .dashboard-header { margin-bottom: 28px; }
        .dashboard-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px; color: #0f172a; margin: 0 0 6px;
        }
        .dashboard-subtitle { color: #64748b; font-size: 15px; margin: 0; }
        .mobile-menu-toggle {
          display: none; position: fixed; bottom: 24px; right: 24px;
          width: 52px; height: 52px; border-radius: 50%;
          background: #059669; color: white; border: none;
          box-shadow: 0 4px 14px rgba(5,150,105,0.4); z-index: 50;
          align-items: center; justify-content: center; cursor: pointer;
        }
        .dashboard-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); z-index: 40;
        }
        .dashboard-version {
          font-size: 10px; color: #cbd5e1; text-align: center;
          padding-top: 12px; margin-top: 12px; border-top: 1px solid #f1f5f9;
        }
        @media (max-width: 768px) {
          .dashboard-sidebar {
            position: fixed; top: 0; left: 0; height: 100vh;
            transform: translateX(-100%); z-index: 50; padding-top: 20px;
          }
          .dashboard-sidebar.open { transform: translateX(0); }
          .dashboard-overlay.open { display: block; }
          .mobile-menu-toggle { display: flex; }
          .dashboard-content { padding: 20px 16px 80px; }
        }
        @media (max-width: 1024px) { .dashboard-content { padding: 28px 20px; } }
      `}</style>

      <div
        className={`dashboard-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="dashboard-user-card">
          <div style={{ position: "relative", display: "inline-block" }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="dashboard-avatar" />
            ) : (
              <div className="dashboard-avatar">
                {(user?.fullName || user?.name || user?.email || "U")
                  .charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ position: "absolute", top: -4, right: -4 }}>
              <NotificationBell />
            </div>
          </div>
          <h2 className="dashboard-user-name">
            {user?.fullName || user?.name || "Safari Guest"}
          </h2>
          <p className="dashboard-user-email">{user?.email}</p>
        </div>

        {/* Trip alert in sidebar */}
        {tripAlerts.slice(0, 1).map((alert) => (
          <div
            key={alert.id}
            style={{
              marginBottom: 12, padding: "10px 12px", borderRadius: 10,
              background: alert.type === "urgent" ? "#fef2f2"
                : alert.type === "warning" ? "#fffbeb" : "#f0fdf4",
              border: `1px solid ${
                alert.type === "urgent" ? "#fecaca"
                : alert.type === "warning" ? "#fde68a" : "#bbf7d0"
              }`,
              fontSize: 12, lineHeight: 1.5,
              color: alert.type === "urgent" ? "#991b1b"
                : alert.type === "warning" ? "#92400e" : "#166534",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>
                {alert.type === "urgent" ? "🚨 Urgent"
                 : alert.type === "warning" ? "⚠️ Soon" : "🗓️ Upcoming"}
              </span>
              <button
                onClick={() => dismissTripAlert(alert.id)}
                style={{
                  background: "transparent", border: "none",
                  cursor: "pointer", color: "inherit", fontSize: 14,
                }}
              >×</button>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 11 }}>{alert.message}</p>
          </div>
        ))}

        <nav className="dashboard-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon}
              {link.name}
              {link.name === "Notifications" && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}

          <button className="dashboard-logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} /> Sign Out
          </button>
        </nav>

        <div style={{ marginTop: 12 }}>
          <Link
            to="/auth/user-account-control"
            style={{
              display: "block", textAlign: "center", fontSize: 12,
              color: "#059669", fontWeight: 600, padding: "8px",
              borderRadius: 8, background: "#ecfdf5",
              textDecoration: "none", marginBottom: 8,
            }}
          >
            ⚙️ Manage Account
          </Link>
        </div>

        <div className="dashboard-version">Altuvera v2.0 • User Portal</div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <AnimatedSection animation="fadeInUp">
          {(title || subtitle) && (
            <header className="dashboard-header">
              {title    && <h1 className="dashboard-title">{title}</h1>}
              {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
            </header>
          )}
          <div className="dashboard-inner-content">{children}</div>
        </AnimatedSection>
      </main>

      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Dashboard Menu"
      >
        {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>
    </div>
  );
};

export default DashboardLayout;