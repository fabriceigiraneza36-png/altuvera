import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import {
  FiUser,
  FiCalendar,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiMessageSquare,
  FiThumbsUp,
} from "react-icons/fi";
import AnimatedSection from "../common/AnimatedSection";

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "My Profile", path: "/profile", icon: <FiUser size={18} /> },
    { name: "Bookings", path: "/my-bookings", icon: <FiCalendar size={18} /> },
    { name: "Wishlist", path: "/wishlist", icon: <FiHeart size={18} /> },
    { name: "Settings", path: "/settings", icon: <FiSettings size={18} /> },
    // Mock links for likes, comments, posts as requested
    {
      name: "Likes & Comments",
      path: "#",
      icon: <FiThumbsUp size={18} />,
      disabled: true,
    },
    {
      name: "My Posts",
      path: "#",
      icon: <FiMessageSquare size={18} />,
      disabled: true,
    },
  ];

  return (
    <div className="dashboard-layout">
      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: calc(100vh - 80px); /* Adjust based on navbar height */
          background-color: #f8fafc;
          padding-top: 80px; /* Space for navbar */
        }

        .dashboard-sidebar {
          width: 280px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 80px;
          height: calc(100vh - 80px);
          overflow-y: auto;
          z-index: 10;
          transition: transform 0.3s ease;
        }

        .dashboard-user-card {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .dashboard-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669 0%, #34d399 100%);
          color: white;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 16px rgba(5, 150, 105, 0.15);
          object-fit: cover;
          transition: all 0.3s ease;
          border: 3px solid #fff;
        }

        .dashboard-user-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #0f172a;
          margin: 0 0 4px;
          font-weight: 700;
        }

        .dashboard-user-email {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .dashboard-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .dashboard-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          color: #475569;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .dashboard-nav-link:hover:not(.disabled) {
          background-color: #f1f5f9;
          color: #0f172a;
          transform: translateX(4px);
        }

        .dashboard-nav-link.active {
          background-color: #ecfdf5;
          color: #059669;
          font-weight: 600;
        }

        .dashboard-nav-link.active svg {
          color: #059669;
        }

        .dashboard-nav-link.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          position: relative;
        }
        
        .dashboard-nav-link.disabled::after {
          content: "Soon";
          position: absolute;
          right: 16px;
          background: #e2e8f0;
          color: #64748b;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 700;
        }

        .dashboard-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          color: #ef4444;
          font-size: 15px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.2s ease;
          margin-top: auto;
        }

        .dashboard-logout-btn:hover {
          background-color: #fef2f2;
        }

        .dashboard-content {
          flex: 1;
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .dashboard-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .dashboard-subtitle {
          color: #64748b;
          font-size: 16px;
          margin: 0;
        }
        
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #059669;
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
          z-index: 50;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .dashboard-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 40;
        }

        @media (max-width: 1024px) {
          .dashboard-content {
            padding: 32px 24px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            transform: translateX(-100%);
            z-index: 50;
          }
          
          .dashboard-sidebar.open {
            transform: translateX(0);
          }

          .dashboard-overlay.open {
            display: block;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .dashboard-content {
            padding: 24px 16px 80px; /* Extra bottom padding for fab */
          }
        }
      `}</style>

      {/* Mobile Overlay */}
      <div
        className={`dashboard-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="dashboard-user-card">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="dashboard-avatar" />
          ) : (
            <div className="dashboard-avatar">
              {(user?.fullName || user?.name || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <h2 className="dashboard-user-name">
            {user?.fullName || user?.name || "Safari Guest"}
          </h2>
          <p className="dashboard-user-email">{user?.email}</p>
        </div>

        <nav className="dashboard-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive && !link.disabled ? "active" : ""} ${link.disabled ? "disabled" : ""}`
              }
              onClick={(e) => {
                if (link.disabled) e.preventDefault();
                else setMobileMenuOpen(false);
              }}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}

          <button className="dashboard-logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <AnimatedSection animation="fadeInUp">
          {(title || subtitle) && (
            <header className="dashboard-header">
              {title && <h1 className="dashboard-title">{title}</h1>}
              {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
            </header>
          )}

          <div className="dashboard-inner-content">{children}</div>
        </AnimatedSection>
      </main>

      {/* Mobile Menu Toggle Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Dashboard Menu"
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
    </div>
  );
};

export default DashboardLayout;
