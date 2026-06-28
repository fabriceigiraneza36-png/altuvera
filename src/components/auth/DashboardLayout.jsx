import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUserAuth } from '../../context/UserAuthContext'
import {
  FiUser, FiCalendar, FiHeart, FiSettings,
  FiLogOut, FiMenu, FiX, FiMessageSquare,
  FiThumbsUp, FiBell,
} from 'react-icons/fi'
import AnimatedSection from '../common/AnimatedSection'
import { Link } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useNotifications } from '../../hooks/useNotifications'

const DashboardLayout = ({ children, title, subtitle }) => {
  const { user, logout }    = useUserAuth()
  const navigate             = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { tripAlerts, dismissTripAlert }    = useNotifications()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { name: 'My Profile',       path: '/profile',       icon: <FiUser size={18} />        },
    { name: 'Bookings',         path: '/my-bookings',   icon: <FiCalendar size={18} />    },
    { name: 'Notifications',    path: '/notifications', icon: <FiBell size={18} />        },
    { name: 'Wishlist',         path: '/wishlist',      icon: <FiHeart size={18} />       },
    { name: 'Settings',         path: '/settings',      icon: <FiSettings size={18} />    },
    { name: 'Likes & Comments', path: '#',              icon: <FiThumbsUp size={18} />,    disabled: true },
    { name: 'My Posts',         path: '#',              icon: <FiMessageSquare size={18} />, disabled: true },
  ]

  return (
    <div className="dashboard-layout">
      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: calc(100vh - 80px);
          background-color: #f8fafc;
          padding-top: 80px;
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
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #059669 0%, #34d399 100%);
          color: white; font-size: 32px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 16px rgba(5,150,105,0.15);
          object-fit: cover; transition: all 0.3s ease;
          border: 3px solid #fff;
        }
        .dashboard-user-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; color: #0f172a; margin: 0 0 4px; font-weight: 700;
        }
        .dashboard-user-email { font-size: 14px; color: #64748b; margin: 0; }
        .dashboard-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .dashboard-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border-radius: 12px; color: #475569;
          font-size: 15px; font-weight: 500; text-decoration: none;
          transition: all 0.2s ease;
        }
        .dashboard-nav-link:hover:not(.disabled) {
          background-color: #f1f5f9; color: #0f172a; transform: translateX(4px);
        }
        .dashboard-nav-link.active { background-color: #ecfdf5; color: #059669; font-weight: 600; }
        .dashboard-nav-link.disabled { opacity: 0.5; cursor: not-allowed; position: relative; }
        .dashboard-nav-link.disabled::after {
          content: "Soon"; position: absolute; right: 16px;
          background: #e2e8f0; color: #64748b; font-size: 10px;
          padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700;
        }
        .dashboard-logout-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; border-radius: 12px; color: #ef4444;
          font-size: 15px; font-weight: 500; background: none; border: none;
          cursor: pointer; width: 100%; text-align: left; transition: all 0.2s ease;
          margin-top: auto;
        }
        .dashboard-logout-btn:hover { background-color: #fef2f2; }
        .dashboard-content { flex: 1; padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%; }
        .dashboard-header { margin-bottom: 32px; }
        .dashboard-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #0f172a; margin: 0 0 8px; }
        .dashboard-subtitle { color: #64748b; font-size: 16px; margin: 0; }
        .mobile-menu-toggle {
          display: none; position: fixed; bottom: 24px; right: 24px;
          width: 56px; height: 56px; border-radius: 50%;
          background: #059669; color: white; border: none;
          box-shadow: 0 4px 12px rgba(5,150,105,0.4); z-index: 50;
          align-items: center; justify-content: center; cursor: pointer;
        }
        .dashboard-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); z-index: 40;
        }
        @media (max-width: 768px) {
          .dashboard-sidebar { position: fixed; top: 0; left: 0; height: 100vh; transform: translateX(-100%); z-index: 50; }
          .dashboard-sidebar.open { transform: translateX(0); }
          .dashboard-overlay.open { display: block; }
          .mobile-menu-toggle { display: flex; }
          .dashboard-content { padding: 24px 16px 80px; }
        }
        @media (max-width: 1024px) { .dashboard-content { padding: 32px 24px; } }
      `}</style>

      {/* Mobile Overlay */}
      <div
        className={`dashboard-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* User card with notification bell */}
        <div className="dashboard-user-card">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="dashboard-avatar" />
            ) : (
              <div className="dashboard-avatar">
                {(user?.fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            {/* Bell sits top-right of avatar */}
            <div style={{
              position: 'absolute', top: -4, right: -4,
            }}>
              <NotificationBell />
            </div>
          </div>
          <h2 className="dashboard-user-name">
            {user?.fullName || user?.name || 'Safari Guest'}
          </h2>
          <p className="dashboard-user-email">{user?.email}</p>
        </div>

        {/* Trip alerts in sidebar */}
        {tripAlerts.slice(0, 1).map(alert => (
          <div key={alert.id} style={{
            marginBottom:  12,
            padding:       '10px 12px',
            borderRadius:  10,
            background:    alert.type === 'urgent' ? '#fef2f2' :
                           alert.type === 'warning' ? '#fffbeb' : '#f0fdf4',
            border:        `1px solid ${
              alert.type === 'urgent' ? '#fecaca' :
              alert.type === 'warning' ? '#fde68a' : '#bbf7d0'
            }`,
            fontSize:      12,
            lineHeight:    1.5,
            color:         alert.type === 'urgent' ? '#991b1b' :
                           alert.type === 'warning' ? '#92400e' : '#166534',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                {alert.type === 'urgent' ? '🚨 Urgent' :
                 alert.type === 'warning' ? '⚠️ Soon' : '🗓️ Upcoming'}
              </span>
              <button
                onClick={() => dismissTripAlert(alert.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 14 }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: '4px 0 0' }}>{alert.message}</p>
          </div>
        ))}

        <nav className="dashboard-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive && !link.disabled ? 'active' : ''} ${link.disabled ? 'disabled' : ''}`
              }
              onClick={(e) => {
                if (link.disabled) e.preventDefault()
                else setMobileMenuOpen(false)
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

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Dashboard Menu"
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div style={{ marginTop: '1rem' }}>
        <Link to="/auth/user-account-control" style={{ color: '#10b981', fontWeight: '600' }}>
          Manage Account
        </Link>
      </div>
    </div>
  )
}

export default DashboardLayout