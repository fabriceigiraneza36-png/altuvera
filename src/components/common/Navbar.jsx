// src/components/common/Navbar.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronDown, FiSearch, FiHeart, FiUser, FiLogOut,
  FiCalendar, FiSettings, FiMessageCircle,
} from "react-icons/fi";
import { useApp }       from "../../context/AppContext";
import { useUserAuth }  from "../../context/UserAuthContext";
import { useMessaging } from "../../context/MessagingContext";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import { getAllDestinations } from "../../data/destinations";
import { preloadRoute }      from "../../utils/routeUtils";
import { getCountrySlug }    from "../../utils/countrySlugMap";
import { useCountries }      from "../../hooks/useCountries";
import MessagePortal         from "../messaging/MessagePortal";
import "./Navbar.css";

const cn = (...c) => c.filter(Boolean).join(" ");

const Navbar = () => {
  const [isScrolled,           setIsScrolled]           = useState(false);
  const [navHidden,            setNavHidden]            = useState(false);
  const [isMobileMenuOpen,     setIsMobileMenuOpen]     = useState(false);
  const [activeDropdown,       setActiveDropdown]       = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [searchOpen,           setSearchOpen]           = useState(false);
  const [searchValue,          setSearchValue]          = useState("");
  const [searchResults,        setSearchResults]        = useState([]);
  const [isSearching,          setIsSearching]          = useState(false);
  const [userMenuOpen,         setUserMenuOpen]         = useState(false);
  const [avatarLoaded,         setAvatarLoaded]         = useState(false);

  const API_URL      = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const location     = useLocation();
  const navigate     = useNavigate();
  const { favorites }= useApp();
  const { user, isAuthenticated, authLoading, openModal, logout } = useUserAuth();
  const { countries: backendCountries } = useCountries({ limit: 12 });
  const {
    openPortal, closePortal, isOpen: isChatOpen,
    unreadCount: chatUnread, connectionState, adminOnline,
  } = useMessaging();

  const headerRef      = useRef(null);
  const userMenuRef    = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownTimer  = useRef(null);
  const searchAbortRef = useRef(null);
  const latestSearchRef= useRef("");
  const lastScrollYRef = useRef(0);

  const localDestinations = useMemo(() => getAllDestinations(), []);

  const destinationsDropdown = useMemo(() => {
    const items = [
      { name: "All Destinations", path: "/destinations", isOverview: true },
    ];
    if (backendCountries?.length > 0) {
      backendCountries.forEach((c) =>
        items.push({
          name: c.name,
          flag: c.flagUrl || c.flag_url || c.flag || "",
          info:
            c.tagline || c.region || c.capital || c.continent ||
            c.subRegion || c.shortDescription ||
            (c.description ? `${c.description.slice(0, 60)}…` : ""),
          path: `/country/${getCountrySlug(c)}`,
        })
      );
    }
    return items;
  }, [backendCountries]);

  const navLinks = useMemo(
    () => [
      { name: "Home",            path: "/" },
      { name: "Explore",         path: "/explore" },
      { name: "Destinations",    path: "/destinations", dropdown: destinationsDropdown },
      { name: "Interactive Map", path: "/interactive-map" },
      { name: "Tips",            path: "/tips" },
      { name: "Services",        path: "/services" },
      {
        name: "About",
        path: "/about",
        dropdown: [
          { name: "About",         path: "/about" },
          { name: "Payment Terms", path: "/payment-terms" },
          { name: "Team",          path: "/team" },
        ],
      },
      { name: "Contact", path: "/contact" },
    ],
    [destinationsDropdown]
  );

  const userMenuItems = useMemo(() => {
    const items = [
      { to: "/profile",     icon: FiUser,     label: "My Profile"  },
      { to: "/my-bookings", icon: FiCalendar, label: "My Bookings" },
      { to: "/wishlist",    icon: FiHeart,    label: "Wishlist"    },
      { to: "/settings",    icon: FiSettings, label: "Settings"    },
    ];
    if (user?.role === "admin" || user?.role === "manager")
      items.push({ to: "/admin/dashboard", icon: FiSettings, label: "Admin Dashboard" });
    return items;
  }, [user?.role]);

  /* ── Scroll ── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY    = lastScrollYRef.current;
        setIsScrolled(currentY > 20);
        if (currentY > 80) {
          if (currentY > lastY + 5)  setNavHidden(true);
          else if (currentY < lastY - 5) setNavHidden(false);
        } else {
          setNavHidden(false);
        }
        lastScrollYRef.current = currentY;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = useCallback(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveMobileDropdown(null);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, []);

  useEffect(() => closeAll(), [location.pathname, closeAll]);
  useEffect(() => setAvatarLoaded(false), [user?.avatar]);

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  /* ── Search ── */
  useEffect(() => {
    const q = searchValue.trim();
    latestSearchRef.current = q;
    if (searchAbortRef.current) { searchAbortRef.current.abort(); searchAbortRef.current = null; }
    if (q.length < 2) { setSearchResults([]); setIsSearching(false); return; }

    const norm = (v) => {
      if (typeof v === "string") return v;
      if (!v) return "";
      if (typeof v === "object") return v.name || v.countryName || v.location || v.slug || "";
      return String(v);
    };
    const key = (i) => i?._id || i?.id || i?.slug || i?.name;
    const toR = (i) => ({
      id: i?.id || i?._id || i?.slug,
      slug: i?.slug || i?.id,
      name: i?.title || i?.name || i?.category || "Result",
      country: norm(i?.country || i?.countryName || i?.location),
      category: norm(i?.category || i?.type || "Destination"),
      heroImage: i?.image || i?.heroImage || i?.images?.[0] || "",
      description: i?.description,
      price: i?.price,
      duration: i?.duration,
    });

    const ql    = q.toLowerCase();
    const local = localDestinations
      .filter((d) => {
        const n  = (d?.name || "").toLowerCase();
        const ds = (d?.description || "").toLowerCase();
        const co = norm(d?.country).toLowerCase();
        const lo = (d?.location || "").toLowerCase();
        return n.includes(ql) || ds.includes(ql) || co.includes(ql) || lo.includes(ql);
      })
      .sort((a, b) => {
        const as = (a?.name || "").toLowerCase().startsWith(ql) ? 1 : 0;
        const bs = (b?.name || "").toLowerCase().startsWith(ql) ? 1 : 0;
        return as !== bs ? bs - as : (a?.name || "").localeCompare(b?.name || "");
      })
      .slice(0, 6)
      .map(toR);

    setSearchResults(local);

    const tid = setTimeout(async () => {
      setIsSearching(true);
      const ctrl = new AbortController();
      searchAbortRef.current = ctrl;
      try {
        const res  = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}&limit=10`, { signal: ctrl.signal });
        const data = await res.json();
        if (latestSearchRef.current !== q) return;
        const remote = (data?.data || []).map(toR);
        const m      = new Map();
        for (const i of local)  m.set(key(i), i);
        for (const i of remote) m.set(key(i), i);
        setSearchResults(Array.from(m.values()).slice(0, 10));
      } catch { /* abort */ }
      finally { if (latestSearchRef.current === q) setIsSearching(false); }
    }, 300);
    return () => clearTimeout(tid);
  }, [searchValue, API_URL, localDestinations]);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && closeAll();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [closeAll]);

  useEffect(() => {
    const fn = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setActiveDropdown(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* ── Handlers ── */
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) { navigate(`/destinations?search=${encodeURIComponent(q)}`); setSearchOpen(false); setSearchValue(""); }
  }, [searchValue, navigate]);

  const toggleMobileDropdown = useCallback(
    (n) => setActiveMobileDropdown((p) => (p === n ? null : n)), []
  );
  const handleDropdownEnter   = useCallback((n) => { clearTimeout(dropdownTimer.current); setActiveDropdown(n); }, []);
  const handleDropdownLeave   = useCallback(() => { dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150); }, []);
  const handleDesktopClick    = useCallback((e, l) => { if (l.dropdown) { e.preventDefault(); setActiveDropdown((p) => (p === l.name ? null : l.name)); } }, []);
  const handleDesktopDblClick = useCallback((e, l) => { if (l.dropdown) { e.preventDefault(); setActiveDropdown(null); navigate(l.path); } }, [navigate]);

  const isActive = useCallback(
    (l) => location.pathname === l.path || l.dropdown?.some((d) => d.path === location.pathname) || false,
    [location.pathname]
  );

  const getInitials = useCallback(() => {
    const n = user?.fullName || user?.name || "";
    return n ? n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : user?.email?.[0]?.toUpperCase() || "U";
  }, [user]);

  const displayName   = useMemo(() => user?.fullName || user?.name || user?.email?.split("@")[0] || "User", [user]);
  const providerLabel = useMemo(() => {
    const p = (user?.authProvider || "").toLowerCase();
    return p === "google" ? "Google" : p === "github" ? "GitHub" : "Email";
  }, [user?.authProvider]);

  const handleLogout = useCallback(() => { closeAll(); logout(); navigate("/"); }, [closeAll, logout, navigate]);

  /* ── Chat button pulse ── */
  const chatBtnClass = cn(
    "nav__icon-btn nav__chat-btn",
    connectionState === "connected" && "nav__chat-btn--online",
    chatUnread > 0 && "nav__chat-btn--unread",
  );

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── NAVBAR ── */}
      <nav
        ref={headerRef}
        role="navigation"
        className={cn("nav", isScrolled && "nav--scrolled", navHidden && "nav--hidden")}
      >
        <div className="nav__inner">
          {/* Logo */}
          <Link to="/" className="nav__logo" aria-label="Altuvera Home">
            <div className="nav__logo-glow" />
            <div className="nav__logo-img-wrapper">
              <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="nav__logo-img" draggable={false} />
            </div>
            <span className="nav__logo-text">Altuvera</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav__links">
            {navLinks.map((link, i) => (
              <div
                key={link.name}
                className="nav__item"
                style={{ "--i": i }}
                onMouseEnter={() => link.dropdown && handleDropdownEnter(link.name)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={link.path}
                  onClick={(e) => handleDesktopClick(e, link)}
                  onDoubleClick={(e) => handleDesktopDblClick(e, link)}
                  onMouseEnter={() => preloadRoute(link.path)}
                  className={cn("nav__link", isActive(link) && "nav__link--active")}
                  aria-expanded={link.dropdown ? activeDropdown === link.name : undefined}
                >
                  <span className="nav__link-text">{link.name}</span>
                  {link.dropdown && (
                    <FiChevronDown
                      size={14}
                      className={cn("nav__chevron", activeDropdown === link.name && "nav__chevron--open")}
                    />
                  )}
                  <span className="nav__link-underline" />
                  <span className="nav__link-shine" />
                </Link>

                {link.dropdown && (
                  <div className={cn("nav__dropdown", activeDropdown === link.name && "nav__dropdown--open")}>
                    <div className="nav__dropdown-inner">
                      {link.dropdown.map((sub, si) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={cn("nav__dropdown-link", sub.info && "nav__dropdown-link--rich")}
                          style={{ "--si": si }}
                          onClick={() => setActiveDropdown(null)}
                        >
                          {sub.flag ? (
                            <span className="nav__dropdown-flag">
                              {sub.flag.startsWith("http") || sub.flag.includes("/")
                                ? <img src={sub.flag} alt={`${sub.name} flag`} />
                                : sub.flag}
                            </span>
                          ) : (
                            <span className="nav__dropdown-dot" />
                          )}
                          <div className="nav__dropdown-text-wrap">
                            <span className="nav__dropdown-name">{sub.name}</span>
                            {sub.info && <span className="nav__dropdown-info">{sub.info}</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="nav__actions">
            {/* Search */}
            <button className="nav__icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <FiSearch size={19} />
              <span className="nav__icon-ripple" />
            </button>

            {/* Wishlist / Gallery */}
            <Link to="/gallery" className="nav__icon-link">
              <span className="nav__icon-btn" role="button" aria-label="Favorites">
                <FiHeart size={19} />
                {favorites.length > 0 && <span className="nav__badge">{favorites.length}</span>}
                <span className="nav__icon-ripple" />
              </span>
            </Link>

            {/* ── LIVE CHAT BUTTON ── */}
            <button
              className={chatBtnClass}
              onClick={isChatOpen ? closePortal : openPortal}
              aria-label="Live Chat"
              title={
                connectionState === "connected" && adminOnline
                  ? "Support is online — Chat now"
                  : "Live Chat"
              }
            >
              <FiMessageCircle size={19} />
              {chatUnread > 0 && (
                <span className="nav__badge nav__badge--chat">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
              {connectionState === "connected" && adminOnline && (
                <span className="nav__chat-online-dot" />
              )}
              <span className="nav__icon-ripple" />
            </button>

            {/* Auth area */}
            {authLoading ? (
              <span className="nav__auth-skel" />
            ) : isAuthenticated ? (
              <div className="nav__user" ref={userMenuRef}>
                <button
                  className="nav__user-trigger"
                  onClick={() => setUserMenuOpen((p) => !p)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user?.avatar ? (
                    <span className="nav__avatar-wrap">
                      {!avatarLoaded && <span className="nav__avatar-spin" />}
                      <img src={user.avatar} alt="" className="nav__avatar-img"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)} />
                    </span>
                  ) : (
                    <span className="nav__avatar-initials">{getInitials()}</span>
                  )}
                  <span className="nav__user-info">
                    <span className="nav__user-name">{displayName}</span>
                    <small className="nav__user-role">
                      {user?.role === "admin" ? "Administrator" : user?.role === "manager" ? "Manager" : "Traveler"}
                    </small>
                  </span>
                  <FiChevronDown className={cn("nav__user-chev", userMenuOpen && "nav__user-chev--open")} />
                </button>

                <div className={cn("nav__user-drop", userMenuOpen && "nav__user-drop--open")}>
                  <div className="nav__user-drop-head">
                    <div className="nav__user-drop-profile">
                      {user?.avatar
                        ? <img src={user.avatar} alt="" className="nav__user-drop-avatar" />
                        : <span className="nav__user-drop-avatar-initials">{getInitials()}</span>
                      }
                      <div className="nav__user-drop-info">
                        <p className="nav__user-drop-name">{displayName}</p>
                        <p className="nav__user-drop-email">{user?.email}</p>
                        <span className="nav__pill">
                          {user?.isVerified ? "✓ Verified" : providerLabel} account
                        </span>
                      </div>
                    </div>
                  </div>
                  {userMenuItems.map((m, mi) => (
                    <Link
                      key={m.to}
                      to={m.to}
                      className="nav__user-drop-item"
                      style={{ "--mi": mi }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <m.icon size={16} /> {m.label}
                    </Link>
                  ))}
                  <button className="nav__user-drop-out" onClick={handleLogout}>
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button className="nav__sign-btn" onClick={() => openModal("login")}>
                <span>Sign In</span>
              </button>
            )}

            <Link to="/booking" className="nav__cta">
              <span>Book Now</span>
              <svg className="nav__cta-arrow" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className={cn("nav__hamburger", isMobileMenuOpen && "nav__hamburger--open")}
            onClick={() => setIsMobileMenuOpen((p) => !p)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="nav__hamburger-box">
              <span className="nav__hline nav__hline--1" />
              <span className="nav__hline nav__hline--2" />
              <span className="nav__hline nav__hline--3" />
            </span>
          </button>
        </div>
      </nav>

      {/* ── SEARCH OVERLAY ── */}
      <div className={cn("srch", searchOpen && "srch--open")} onClick={() => setSearchOpen(false)}>
        <div className="srch__box" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSearchSubmit} className="srch__form">
            <FiSearch className="srch__icon" size={22} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search destinations, experiences..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="srch__input"
            />
            {searchValue && (
              <button type="button" className="srch__clear" onClick={() => setSearchValue("")}>✕</button>
            )}
          </form>
          <div className="srch__results">
            {isSearching && (
              <p className="srch__status">
                <span className="srch__spinner" /> Searching…
              </p>
            )}
            {searchResults.length > 0 && (
              <div className="srch__list">
                {searchResults.map((r, ri) => (
                  <Link
                    key={r.id || r._id}
                    to={`/destination/${r.slug || r.id}`}
                    className="srch__item"
                    style={{ "--ri": ri }}
                    onClick={() => setSearchOpen(false)}
                  >
                    <img
                      src={r.heroImage || r.images?.[0] || "https://placehold.co/80x80/059669/ffffff?text=Altuvera"}
                      alt=""
                      className="srch__thumb"
                    />
                    <div>
                      <p className="srch__name">{r.name}</p>
                      <p className="srch__meta">
                        {r.country} · {r.category || "Destination"}
                        {r.duration && <span> · {r.duration}</span>}
                        {r.price && <span> · From ${r.price}</span>}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/destinations?search=${encodeURIComponent(searchValue)}`}
                  className="srch__all"
                  onClick={() => setSearchOpen(false)}
                >
                  View all results for &ldquo;{searchValue}&rdquo;
                </Link>
              </div>
            )}
            {!isSearching && searchValue.trim().length >= 2 && searchResults.length === 0 && (
              <p className="srch__status">No destinations found.</p>
            )}
          </div>
        </div>
        <button className="srch__close" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
      </div>

      {/* ── BACKDROP ── */}
      <div className={cn("backdrop", isMobileMenuOpen && "backdrop--open")} onClick={() => setIsMobileMenuOpen(false)} />

      {/* ── MOBILE MENU ── */}
      <aside className={cn("mm", isMobileMenuOpen && "mm--open")} aria-hidden={!isMobileMenuOpen}>
        <div className="mm__head">
          <Link to="/" className="mm__logo" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mm__logo-img-wrapper">
              <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="mm__logo-img" />
            </div>
            <span className="mm__logo-text">Altuvera</span>
          </Link>
          <button className="mm__close-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close">
            <span className="mm__close-x">✕</span>
          </button>
        </div>

        <div className="mm__body">
          {navLinks.map((link, idx) => (
            <div key={link.name} className="mm__item" style={{ "--idx": idx }}>
              {link.dropdown ? (
                <>
                  <button
                    className={cn("mm__toggle", activeMobileDropdown === link.name && "mm__toggle--on")}
                    onClick={() => toggleMobileDropdown(link.name)}
                    aria-expanded={activeMobileDropdown === link.name}
                  >
                    <span className="mm__toggle-text">{link.name}</span>
                    <FiChevronDown size={18} className={cn("mm__chev", activeMobileDropdown === link.name && "mm__chev--open")} />
                  </button>
                  <div className={cn("mm__sub", activeMobileDropdown === link.name && "mm__sub--open")}>
                    {link.dropdown.map((sub, si) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={cn("mm__sub-link", sub.info && "mm__sub-link--rich", location.pathname === sub.path && "mm__sub-link--active")}
                        style={{ "--si": si }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub.flag ? (
                          <span className="mm__sub-flag">
                            {sub.flag.startsWith("http") || sub.flag.includes("/")
                              ? <img src={sub.flag} alt={`${sub.name} flag`} />
                              : sub.flag}
                          </span>
                        ) : (
                          <span className="mm__sub-dot" />
                        )}
                        <div className="mm__sub-text-wrap">
                          <span className="mm__sub-name">{sub.name}</span>
                          {sub.info && <span className="mm__sub-info">{sub.info}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className={cn("mm__link", location.pathname === link.path && "mm__link--active")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          <div className="mm__divider" />

          {/* ── Mobile Chat Button ── */}
          <button
            className="mm__chat-btn"
            onClick={() => { setIsMobileMenuOpen(false); openPortal(); }}
          >
            <FiMessageCircle size={20} />
            <span>Live Support Chat</span>
            {chatUnread > 0 && (
              <span className="mm__chat-badge">{chatUnread > 9 ? "9+" : chatUnread}</span>
            )}
            {connectionState === "connected" && adminOnline && (
              <span className="mm__chat-online">● Online</span>
            )}
          </button>

          <div className="mm__auth">
            {isAuthenticated ? (
              <>
                <div className="mm__profile">
                  {user?.avatar ? (
                    <span className="mm__pav-wrap">
                      {!avatarLoaded && <span className="nav__avatar-spin" />}
                      <img src={user.avatar} alt="" className="mm__pav-img"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)} />
                    </span>
                  ) : (
                    <span className="mm__pav-init">{getInitials()}</span>
                  )}
                  <div>
                    <p className="mm__pname">{displayName}</p>
                    <p className="mm__pemail">{user?.email}</p>
                    <p className="mm__pprov">{providerLabel} account</p>
                  </div>
                </div>
                {userMenuItems.map((m) => (
                  <Link
                    key={m.to}
                    to={m.to}
                    className="mm__auth-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <m.icon size={18} /> {m.label}
                  </Link>
                ))}
                <button className="mm__out" onClick={handleLogout}>
                  <FiLogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <button
                className="mm__sign"
                onClick={() => { setIsMobileMenuOpen(false); openModal("login"); }}
              >
                Sign In / Sign Up
              </button>
            )}
          </div>

          <Link to="/booking" className="mm__cta" onClick={() => setIsMobileMenuOpen(false)}>
            Book Your Adventure
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </aside>

      {/* ── MESSAGE PORTAL ── */}
      <MessagePortal />
    </>
  );
};

export default Navbar;