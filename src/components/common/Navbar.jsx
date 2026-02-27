import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiSearch,
  FiHeart,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiSettings,
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import { useUserAuth } from "../../context/UserAuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { favorites } = useApp();
  const { user, isAuthenticated, authLoading, openModal, logout } = useUserAuth();
  const headerRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Navigation links configuration
  const navLinks = useMemo(() => [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    {
      name: "Destinations",
      path: "/destinations",
      dropdown: [
        { name: "All Destinations", path: "/destinations" },
        { name: "Kenya", path: "/country/kenya" },
        { name: "Tanzania", path: "/country/tanzania" },
        { name: "Uganda", path: "/country/uganda" },
        { name: "Rwanda", path: "/country/rwanda" },
        { name: "Ethiopia", path: "/country/ethiopia" },
      ],
    },
    { name: "Interactive Map", path: "/interactive-map" },
    { name: "Tips", path: "/tips" },
    { name: "Services", path: "/services" },
    {
      name: "About",
      path: "/about",
      dropdown: [
        { name: "About", path: "/about" },
        { name: "Payment Terms", path: "/payment-terms" },
        { name: "Team", path: "/team" },
      ],
    },
    { name: "Contact", path: "/contact" },
  ], []);

  // Scroll handler with throttle
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveMobileDropdown(null);
    setUserMenuOpen(false);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  // Body overflow control
  useEffect(() => {
    const shouldLock = isMobileMenuOpen || searchOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, searchOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // ESC key handler
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        closeMobileMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMobileMenu]);

  // Click outside handler
  useEffect(() => {
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search submit handler
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/destinations?search=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
      setSearchValue("");
    }
  }, [searchValue, navigate]);

  // Toggle functions
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleMobileDropdown = useCallback((name) => {
    setActiveMobileDropdown((prev) => (prev === name ? null : name));
  }, []);

  const handleDropdownEnter = useCallback((name) => {
    setActiveDropdown(name);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  // Desktop nav click handlers
  const handleDesktopNavClick = useCallback((e, link) => {
    if (link.dropdown) {
      e.preventDefault();
      setActiveDropdown((prev) => (prev === link.name ? null : link.name));
    }
  }, []);

  const handleDesktopNavDoubleClick = useCallback((e, link) => {
    if (link.dropdown) {
      e.preventDefault();
      setActiveDropdown(null);
      navigate(link.path);
    }
  }, [navigate]);

  // User helper functions
  const getInitials = useCallback(() => {
    const name = user?.fullName || user?.name || "";
    if (name) {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  }, [user]);

  const getDisplayName = useCallback(() => {
    return user?.fullName || user?.name || user?.email?.split("@")[0] || "User";
  }, [user]);

  const handleLogout = useCallback(() => {
    closeMobileMenu();
    logout();
    navigate("/");
  }, [closeMobileMenu, logout, navigate]);

  // Check if link is active
  const isLinkActive = useCallback((link) => {
    if (location.pathname === link.path) return true;
    return link.dropdown?.some((item) => item.path === location.pathname) || false;
  }, [location.pathname]);

  // User menu items
  const userMenuItems = useMemo(() => [
    { to: "/profile", icon: FiUser, label: "My Profile" },
    { to: "/my-bookings", icon: FiCalendar, label: "My Bookings" },
    { to: "/wishlist", icon: FiHeart, label: "Wishlist" },
    { to: "/settings", icon: FiSettings, label: "Settings" },
  ], []);

  return (
    <>
      <nav
        ref={headerRef}
        className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}
      >
        <div className="navbar__container">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-icon">A</div>
            <span className="navbar__logo-text">Altuvera</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar__nav desktop-nav">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="navbar__nav-item"
                onMouseEnter={() => link.dropdown && handleDropdownEnter(link.name)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={link.path}
                  onClick={(e) => handleDesktopNavClick(e, link)}
                  onDoubleClick={(e) => handleDesktopNavDoubleClick(e, link)}
                  aria-expanded={link.dropdown ? activeDropdown === link.name : undefined}
                  className={`navbar__nav-link ${isLinkActive(link) ? "navbar__nav-link--active" : ""}`}
                >
                  {link.name}
                  {link.dropdown && (
                    <FiChevronDown
                      size={14}
                      className={`navbar__chevron ${activeDropdown === link.name ? "navbar__chevron--open" : ""}`}
                    />
                  )}
                </Link>

                {link.dropdown && (
                  <div
                    className={`navbar__dropdown ${activeDropdown === link.name ? "navbar__dropdown--open" : ""}`}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="navbar__dropdown-link"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="navbar__actions desktop-actions">
            {/* Search Button */}
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            {/* Favorites Button */}
            <Link to="/gallery" className="navbar__icon-btn-link">
              <button className="navbar__icon-btn" aria-label="Favorites">
                <FiHeart size={20} />
                {favorites.length > 0 && (
                  <span className="navbar__badge">{favorites.length}</span>
                )}
              </button>
            </Link>

            {/* Auth Section */}
            {authLoading ? (
              <div className="navbar__auth-skeleton" />
            ) : isAuthenticated ? (
              <div className="navbar__user-menu" ref={userMenuRef}>
                <button
                  className="navbar__user-trigger"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={getDisplayName()}
                      className="navbar__user-avatar-img"
                    />
                  ) : (
                    <span className="navbar__user-avatar">{getInitials()}</span>
                  )}
                  <span className="navbar__user-name desktop-user-name">
                    {getDisplayName()}
                  </span>
                  <FiChevronDown
                    className={`navbar__user-chevron ${userMenuOpen ? "navbar__user-chevron--open" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="navbar__user-dropdown">
                    <div className="navbar__user-dropdown-header">
                      <p className="navbar__user-dropdown-name">{getDisplayName()}</p>
                      <p className="navbar__user-dropdown-email">{user?.email}</p>
                    </div>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="navbar__user-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      className="navbar__user-dropdown-logout"
                      onClick={handleLogout}
                    >
                      <FiLogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="navbar__auth-btn"
                onClick={() => openModal("login")}
              >
                Sign In / Sign Up
              </button>
            )}

            {/* Book Now CTA */}
            <Link to="/booking" className="navbar__cta">
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="navbar__mobile-btn mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Search Overlay */}
      <div
        className={`search-overlay ${searchOpen ? "search-overlay--open" : ""}`}
        onClick={() => setSearchOpen(false)}
      >
        <div className="search-overlay__container" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSearchSubmit} className="search-overlay__form">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search destinations, experiences..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-overlay__input"
            />
            <button type="submit" className="search-overlay__submit" aria-label="Submit search">
              <FiSearch size={20} />
            </button>
          </form>
        </div>
        <button
          className="search-overlay__close"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      <div
        className={`mobile-backdrop ${isMobileMenuOpen ? "mobile-backdrop--open" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "mobile-menu--open" : ""}`}>
        <div className="mobile-menu__content">
          {navLinks.map((link) => (
            <div key={link.name} className="mobile-menu__item">
              {link.dropdown ? (
                <>
                  <button
                    type="button"
                    className={`mobile-menu__toggle ${activeMobileDropdown === link.name ? "mobile-menu__toggle--active" : ""}`}
                    onClick={() => toggleMobileDropdown(link.name)}
                    aria-expanded={activeMobileDropdown === link.name}
                  >
                    <span>{link.name}</span>
                    <FiChevronDown
                      size={18}
                      className={`mobile-menu__toggle-icon ${activeMobileDropdown === link.name ? "mobile-menu__toggle-icon--open" : ""}`}
                    />
                  </button>
                  <div
                    className={`mobile-menu__dropdown ${activeMobileDropdown === link.name ? "mobile-menu__dropdown--open" : ""}`}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="mobile-menu__dropdown-link"
                        onClick={closeMobileMenu}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className="mobile-menu__link"
                  onClick={closeMobileMenu}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile Auth Section */}
          <div className="mobile-menu__auth">
            {isAuthenticated ? (
              <>
                <div className="mobile-menu__user-info">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={getDisplayName()}
                      className="mobile-menu__user-avatar-img"
                    />
                  ) : (
                    <div className="mobile-menu__user-avatar">{getInitials()}</div>
                  )}
                  <div className="mobile-menu__user-details">
                    <div className="mobile-menu__user-name">{getDisplayName()}</div>
                    <div className="mobile-menu__user-email">{user?.email}</div>
                  </div>
                </div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="mobile-menu__auth-link"
                    onClick={closeMobileMenu}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
                <button className="mobile-menu__logout-btn" onClick={handleLogout}>
                  <FiLogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="mobile-menu__auth-btn"
                onClick={() => {
                  closeMobileMenu();
                  openModal("login");
                }}
              >
                Sign In / Sign Up
              </button>
            )}
          </div>

          {/* Mobile CTA */}
          <Link
            to="/booking"
            className="mobile-menu__cta"
            onClick={closeMobileMenu}
          >
            Book Your Adventure
          </Link>
        </div>
      </div>

      {/* Styles - No linear-gradient animations, proper CSS transitions */}
      <style>{`
        /* ========== CSS Custom Properties ========== */
        :root {
          --navbar-height: 80px;
          --navbar-height-scrolled: 68px;
          --primary-color: #059669;
          --primary-hover: #047857;
          --primary-light: rgba(5, 150, 105, 0.1);
          --primary-gradient: linear-gradient(135deg, #059669, #10B981);
          --text-dark: #1a1a1a;
          --text-light: #4B5563;
          --text-muted: #888;
          --white: #ffffff;
          --white-alpha-20: rgba(255, 255, 255, 0.2);
          --white-alpha-15: rgba(255, 255, 255, 0.15);
          --border-light: #e5e7eb;
          --border-primary: #d1fae5;
          --shadow-sm: 0 4px 15px rgba(5, 150, 105, 0.15);
          --shadow-md: 0 4px 30px rgba(5, 150, 105, 0.1);
          --shadow-lg: 0 18px 42px rgba(6, 78, 59, 0.2);
          --transition-fast: 0.2s ease;
          --transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          --font-display: 'Playfair Display', serif;
          --font-body: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ========== Navbar Base ========== */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 18px 0;
          background-color: transparent;
          transition: var(--transition-base);
        }

        .navbar--scrolled {
          padding: 10px 0;
          background-color: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: var(--shadow-md);
        }

        .navbar__container {
          position: relative;
          width: 100%;
          max-width: none;
          margin: 0 auto;
          padding: 0 clamp(16px, 3vw, 28px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* ========== Logo ========== */
        .navbar__logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: transform var(--transition-fast);
        }

        .navbar__logo:hover {
          transform: scale(1.02);
        }

        .navbar__logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-display);
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
          /* No animation on gradient - it stays static */
        }

        .navbar__logo-text {
          font-family: var(--font-display);
          font-size: clamp(21px, 2.2vw, 28px);
          font-weight: 700;
          color: var(--white);
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transition: color var(--transition-base), text-shadow var(--transition-base);
        }

        .navbar--scrolled .navbar__logo-text {
          color: var(--primary-color);
          text-shadow: none;
        }

        /* ========== Navigation Links ========== */
        .navbar__nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
          min-width: 0;
        }

        .navbar__nav-item {
          position: relative;
        }

        .navbar__nav-link {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
          text-decoration: none;
          color: var(--white);
          font-size: 15px;
          font-weight: 500;
          border-radius: 8px;
          transition: background-color var(--transition-fast), color var(--transition-fast);
          cursor: pointer;
        }

        .navbar--scrolled .navbar__nav-link {
          color: var(--text-dark);
        }

        .navbar__nav-link:hover {
          background-color: var(--white-alpha-20);
        }

        .navbar--scrolled .navbar__nav-link:hover {
          background-color: var(--primary-light);
          color: var(--primary-color);
        }

        .navbar__nav-link--active {
          background-color: var(--white-alpha-20);
        }

        .navbar--scrolled .navbar__nav-link--active {
          background-color: var(--primary-light);
          color: var(--primary-color);
        }

        .navbar__chevron {
          transition: transform var(--transition-fast);
        }

        .navbar__chevron--open {
          transform: rotate(180deg);
        }

        /* ========== Dropdown ========== */
        .navbar__dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          box-shadow: var(--shadow-lg);
          border: 1px solid #DCFCE7;
          padding: 12px;
          min-width: 250px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px) scale(0.98);
          transform-origin: top left;
          transition: var(--transition-base);
          z-index: 100;
        }

        .navbar__dropdown--open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .navbar__dropdown-link {
          display: flex;
          align-items: center;
          padding: 12px 14px;
          text-decoration: none;
          color: #0f172a;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .navbar__dropdown-link:hover {
          background-color: #F0FDF4;
          color: var(--primary-color);
        }

        /* ========== Actions ========== */
        .navbar__actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navbar__icon-btn-link {
          text-decoration: none;
        }

        .navbar__icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: none;
          background-color: var(--white-alpha-20);
          color: var(--white);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform var(--transition-fast), background-color var(--transition-fast);
        }

        .navbar--scrolled .navbar__icon-btn {
          background-color: var(--primary-light);
          color: var(--primary-color);
        }

        .navbar__icon-btn:hover {
          transform: scale(1.05);
        }

        .navbar__badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: var(--primary-color);
          color: var(--white);
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.4);
        }

        .navbar__auth-skeleton {
          width: 80px;
          height: 42px;
          border-radius: 100px;
          background-color: var(--white-alpha-20);
          opacity: 0.5;
        }

        .navbar--scrolled .navbar__auth-skeleton {
          background-color: var(--primary-light);
        }

        .navbar__auth-btn {
          padding: 9px 18px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background-color: var(--primary-color);
          color: var(--white);
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .navbar__auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }

        .navbar__cta {
          padding: 11px 22px;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .navbar__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }

        /* ========== User Menu ========== */
        .navbar__user-menu {
          position: relative;
        }

        .navbar__user-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 4px;
          background: var(--white-alpha-15);
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: 100px;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .navbar--scrolled .navbar__user-trigger {
          background: rgba(5, 150, 105, 0.08);
          border-color: var(--border-primary);
        }

        .navbar__user-trigger:hover {
          border-color: rgba(255, 255, 255, 0.6);
        }

        .navbar--scrolled .navbar__user-trigger:hover {
          border-color: var(--primary-color);
        }

        .navbar__user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-gradient);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .navbar__user-avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .navbar__user-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--white);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .navbar--scrolled .navbar__user-name {
          color: var(--text-dark);
        }

        .navbar__user-chevron {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          transition: transform var(--transition-fast);
        }

        .navbar--scrolled .navbar__user-chevron {
          color: var(--text-muted);
        }

        .navbar__user-chevron--open {
          transform: rotate(180deg);
        }

        .navbar__user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          background-color: var(--white);
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(6, 78, 59, 0.18);
          border: 1px solid #ecfdf5;
          z-index: 9999;
          overflow: hidden;
          animation: userMenuDrop 0.2s ease;
        }

        @keyframes userMenuDrop {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar__user-dropdown-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f0fdf4;
        }

        .navbar__user-dropdown-name {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          margin: 0;
        }

        .navbar__user-dropdown-email {
          font-size: 12px;
          color: var(--text-muted);
          margin: 2px 0 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .navbar__user-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 14px;
          color: #444;
          text-decoration: none;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .navbar__user-dropdown-item:hover {
          background-color: #f0fdf4;
          color: var(--primary-color);
        }

        .navbar__user-dropdown-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 14px;
          color: #dc2626;
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          border-top: 1px solid #f3f4f6;
          transition: background-color var(--transition-fast);
        }

        .navbar__user-dropdown-logout:hover {
          background-color: #fef2f2;
        }

        /* ========== Mobile Button ========== */
        .navbar__mobile-btn {
          display: none;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: none;
          background-color: var(--white-alpha-20);
          color: var(--white);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: background-color var(--transition-fast);
        }

        .navbar--scrolled .navbar__mobile-btn {
          background-color: var(--primary-light);
          color: var(--primary-color);
        }

        /* ========== Search Overlay ========== */
        .search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(2, 44, 34, 0.82);
          z-index: 2005;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition-base);
        }

        .search-overlay--open {
          opacity: 1;
          visibility: visible;
        }

        .search-overlay__container {
          width: 100%;
          max-width: 680px;
          padding: 0 24px;
        }

        .search-overlay__form {
          position: relative;
        }

        .search-overlay__input {
          width: 100%;
          padding: 22px 62px 22px 24px;
          font-size: 18px;
          border: 2px solid #A7F3D0;
          border-radius: 16px;
          background-color: var(--white);
          outline: none;
          box-sizing: border-box;
          transition: border-color var(--transition-fast);
        }

        .search-overlay__input:focus {
          border-color: var(--primary-color);
        }

        .search-overlay__submit {
          position: absolute;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          padding: 8px;
        }

        .search-overlay__close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background-color: rgba(255, 255, 255, 0.16);
          color: var(--white);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color var(--transition-fast);
        }

        .search-overlay__close:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }

        /* ========== Mobile Backdrop ========== */
        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(2, 44, 34, 0.35);
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition-base);
        }

        .mobile-backdrop--open {
          opacity: 1;
          visibility: visible;
        }

        /* ========== Mobile Menu ========== */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          width: min(420px, 88vw);
          bottom: 0;
          background-color: var(--white);
          z-index: 1002;
          box-shadow: -12px 0 36px rgba(6, 78, 59, 0.18);
          transform: translateX(105%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .mobile-menu--open {
          transform: translateX(0);
        }

        .mobile-menu__content {
          padding: 92px 22px 36px;
        }

        .mobile-menu__item {
          border-bottom: 1px solid var(--border-light);
        }

        .mobile-menu__link {
          display: block;
          padding: 14px 0;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-dark);
          text-decoration: none;
          font-family: var(--font-display);
          transition: color var(--transition-fast);
        }

        .mobile-menu__link:hover {
          color: var(--primary-color);
        }

        .mobile-menu__toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-dark);
          background: transparent;
          border: none;
          font-family: var(--font-display);
          cursor: pointer;
          text-align: left;
          transition: color var(--transition-fast);
        }

        .mobile-menu__toggle--active {
          color: var(--primary-color);
        }

        .mobile-menu__toggle-icon {
          transition: transform var(--transition-fast);
        }

        .mobile-menu__toggle-icon--open {
          transform: rotate(180deg);
        }

        .mobile-menu__dropdown {
          display: grid;
          gap: 4px;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-4px);
          transition: max-height 0.3s ease, opacity 0.25s ease, transform 0.25s ease;
          margin-top: 8px;
          margin-bottom: 6px;
          padding: 0 10px;
          border-radius: 14px;
          border: 1px solid transparent;
          background-color: transparent;
        }

        .mobile-menu__dropdown--open {
          max-height: 420px;
          opacity: 1;
          transform: translateY(0);
          border-color: #D1FAE5;
          background-color: #F8FFFC;
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.12);
          padding: 10px;
        }

        .mobile-menu__dropdown-link {
          display: block;
          text-decoration: none;
          font-size: 18px;
          font-family: var(--font-body);
          padding: 11px 10px 11px 14px;
          color: var(--text-light);
          border-radius: 10px;
          transition: color var(--transition-fast), background-color var(--transition-fast);
        }

        .mobile-menu__dropdown-link:hover {
          color: var(--primary-color);
          background-color: rgba(5, 150, 105, 0.08);
        }

        /* ========== Mobile Auth Section ========== */
        .mobile-menu__auth {
          margin-top: 24px;
          padding: 20px 0;
          border-top: 2px solid #ecfdf5;
        }

        .mobile-menu__user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .mobile-menu__user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--primary-gradient);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .mobile-menu__user-avatar-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .mobile-menu__user-details {
          overflow: hidden;
        }

        .mobile-menu__user-name {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          font-family: var(--font-display);
        }

        .mobile-menu__user-email {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mobile-menu__auth-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 0;
          font-size: 17px;
          font-weight: 600;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #f3f4f6;
          font-family: var(--font-body);
          transition: color var(--transition-fast);
        }

        .mobile-menu__auth-link:hover {
          color: var(--primary-color);
        }

        .mobile-menu__logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 0;
          font-size: 17px;
          font-weight: 600;
          color: #dc2626;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          font-family: var(--font-body);
          margin-top: 8px;
          transition: opacity var(--transition-fast);
        }

        .mobile-menu__logout-btn:hover {
          opacity: 0.8;
        }

        .mobile-menu__auth-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background-color: var(--primary-color);
          color: var(--white);
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-body);
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .mobile-menu__auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(5, 150, 105, 0.4);
        }

        .mobile-menu__cta {
          display: block;
          text-align: center;
          margin-top: 16px;
          padding: 14px 22px;
          background-color: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .mobile-menu__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }

        /* ========== Responsive Styles ========== */
        @media (max-width: 1024px) {
          .desktop-nav,
          .desktop-actions {
            display: none !important;
          }
          
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        @media (min-width: 1025px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }

        @media (max-width: 1400px) {
          .navbar__actions {
            gap: 8px;
          }
        }

        @media (max-width: 1280px) {
          .navbar__nav-link {
            font-size: 14px;
            padding: 9px 11px;
          }
        }

        @media (max-width: 1180px) {
          .navbar__nav-link {
            font-size: 13px;
            padding: 9px 9px;
          }
          
          .navbar__auth-btn,
          .navbar__cta {
            font-size: 13px;
            padding: 9px 14px;
          }
        }

        @media (max-width: 860px) {
          .navbar__logo-text {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .navbar__mobile-btn {
            width: 44px;
            height: 44px;
          }
          
          .desktop-user-name {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;