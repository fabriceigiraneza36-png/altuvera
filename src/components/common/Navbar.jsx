import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
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
import logoimg from "../../assets/altuvera.png";
import { getAllDestinations } from "../../data/destinations";
import { preloadRoute } from "../../utils/routeUtils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites } = useApp();
  const { user, isAuthenticated, authLoading, openModal, logout } =
    useUserAuth();

  const headerRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownTimer = useRef(null);
  const searchAbortRef = useRef(null);
  const latestSearchRef = useRef("");

  const localDestinations = useMemo(() => getAllDestinations(), []);

  const navLinks = useMemo(
    () => [
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
          { name: "Djibouti", path: "/country/djibouti" },
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
    ],
    [],
  );

  const userMenuItems = useMemo(
    () => [
      { to: "/profile", icon: FiUser, label: "My Profile" },
      { to: "/my-bookings", icon: FiCalendar, label: "My Bookings" },
      { to: "/wishlist", icon: FiHeart, label: "Wishlist" },
      { to: "/settings", icon: FiSettings, label: "Settings" },
    ],
    [],
  );

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setScrollY(currentY);
          setIsScrolled(currentY > 40);

          if (currentY > 300) {
            setNavVisible(currentY < lastScrollY || currentY < 100);
          } else {
            setNavVisible(true);
          }
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    const q = searchValue.trim();
    latestSearchRef.current = q;

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
      searchAbortRef.current = null;
    }

    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const normalizeKey = (item) =>
      item?._id || item?.id || item?.slug || item?.name;

    const toResult = (item) => ({
      id: item?._id || item?.id || item?.slug,
      slug: item?.slug || item?.id,
      name: item?.name || item?.title || "Destination",
      country: item?.country || item?.countryName || item?.location || "",
      category: item?.category || item?.type || "Destination",
      heroImage: item?.heroImage || item?.image || item?.images?.[0] || "",
    });

    const qLower = q.toLowerCase();
    const localMatches = localDestinations
      .filter((d) => {
        const name = (d?.name || "").toLowerCase();
        const desc = (d?.description || "").toLowerCase();
        const country = (d?.country || "").toLowerCase();
        const location = (d?.location || "").toLowerCase();
        return (
          name.includes(qLower) ||
          desc.includes(qLower) ||
          country.includes(qLower) ||
          location.includes(qLower)
        );
      })
      .sort((a, b) => {
        const an = (a?.name || "").toLowerCase();
        const bn = (b?.name || "").toLowerCase();
        const aStarts = an.startsWith(qLower) ? 1 : 0;
        const bStarts = bn.startsWith(qLower) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        return an.localeCompare(bn);
      })
      .slice(0, 6)
      .map(toResult);

    setSearchResults(localMatches);

    const id = setTimeout(async () => {
      setIsSearching(true);
      const controller = new AbortController();
      searchAbortRef.current = controller;

      try {
        const res = await fetch(
          `${API_URL}/destinations?search=${encodeURIComponent(q)}&limit=5`,
          { signal: controller.signal },
        );
        const data = await res.json();
        if (latestSearchRef.current !== q) return;

        const remoteItems = (data?.data || data || []).map(toResult);

        const merged = new Map();
        for (const item of localMatches) merged.set(normalizeKey(item), item);
        for (const item of remoteItems) merged.set(normalizeKey(item), item);

        setSearchResults(Array.from(merged.values()).slice(0, 8));
      } catch {
      } finally {
        if (latestSearchRef.current === q) setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [searchValue, API_URL, localDestinations]);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && closeAll();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [closeAll]);

  useEffect(() => {
    const fn = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target))
        setActiveDropdown(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const q = searchValue.trim();
      if (q) {
        navigate(`/destinations?search=${encodeURIComponent(q)}`);
        setSearchOpen(false);
        setSearchValue("");
      }
    },
    [searchValue, navigate],
  );

  const toggleMobileDropdown = useCallback((name) => {
    setActiveMobileDropdown((p) => (p === name ? null : name));
  }, []);

  const handleDropdownEnter = useCallback((name) => {
    clearTimeout(dropdownTimer.current);
    setActiveDropdown(name);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const handleDesktopClick = useCallback((e, link) => {
    if (link.dropdown) {
      e.preventDefault();
      setActiveDropdown((p) => (p === link.name ? null : link.name));
    }
  }, []);

  const handleDesktopDblClick = useCallback(
    (e, link) => {
      if (link.dropdown) {
        e.preventDefault();
        setActiveDropdown(null);
        navigate(link.path);
      }
    },
    [navigate],
  );

  const isActive = useCallback(
    (link) =>
      location.pathname === link.path ||
      link.dropdown?.some((d) => d.path === location.pathname) ||
      false,
    [location.pathname],
  );

  const getInitials = useCallback(() => {
    const n = user?.fullName || user?.name || "";
    return n
      ? n
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : user?.email?.[0]?.toUpperCase() || "U";
  }, [user]);

  const displayName = useMemo(
    () => user?.fullName || user?.name || user?.email?.split("@")[0] || "User",
    [user],
  );

  const providerLabel = useMemo(() => {
    const p = (user?.authProvider || "").toLowerCase();
    return p === "google" ? "Google" : p === "github" ? "GitHub" : "Email";
  }, [user?.authProvider]);

  const handleLogout = useCallback(() => {
    closeAll();
    logout();
    navigate("/");
  }, [closeAll, logout, navigate]);

  return (
    <>
      <nav
        ref={headerRef}
        className={`nav ${isScrolled ? "nav--scrolled" : ""} ${!navVisible && isScrolled ? "nav--hidden" : ""}`}
        role="navigation"
        style={{ "--scroll-progress": Math.min(scrollY / 200, 1) }}
      >
        <div className="nav__inner">
          <Link to="/" className="nav__logo" aria-label="Altuvera Home">
            <div className="nav__logo-glow" />
            <div className="nav__logo-img-wrapper">
              <img
                src={logoimg}
                alt="Altuvera"
                className="nav__logo-img"
                draggable={false}
              />
            </div>
            <span className="nav__logo-text">Altuvera</span>
          </Link>

          <div className="nav__links">
            {navLinks.map((link, i) => (
              <div
                key={link.name}
                className="nav__item"
                style={{ "--i": i }}
                onMouseEnter={() =>
                  link.dropdown && handleDropdownEnter(link.name)
                }
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={link.path}
                  onClick={(e) => handleDesktopClick(e, link)}
                  onDoubleClick={(e) => handleDesktopDblClick(e, link)}
                  onMouseEnter={() => preloadRoute(link.path)}
                  className={`nav__link ${isActive(link) ? "nav__link--active" : ""}`}
                  aria-expanded={
                    link.dropdown ? activeDropdown === link.name : undefined
                  }
                >
                  <span className="nav__link-text">{link.name}</span>
                  {link.dropdown && (
                    <FiChevronDown
                      size={14}
                      className={`nav__chevron ${activeDropdown === link.name ? "nav__chevron--open" : ""}`}
                    />
                  )}
                  <span className="nav__link-shine" />
                </Link>

                {link.dropdown && (
                  <div
                    className={`nav__dropdown ${activeDropdown === link.name ? "nav__dropdown--open" : ""}`}
                  >
                    <div className="nav__dropdown-inner">
                      {link.dropdown.map((sub, si) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className="nav__dropdown-link"
                          style={{ "--si": si }}
                          onClick={() => setActiveDropdown(null)}
                        >
                          <span className="nav__dropdown-dot" />
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="nav__actions">
            <button
              className="nav__icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch size={19} />
              <span className="nav__icon-ripple" />
            </button>

            <Link to="/gallery" className="nav__icon-link">
              <span
                className="nav__icon-btn"
                role="button"
                aria-label="Favorites"
              >
                <FiHeart size={19} />
                {favorites.length > 0 && (
                  <span className="nav__badge">{favorites.length}</span>
                )}
                <span className="nav__icon-ripple" />
              </span>
            </Link>

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
                      <img
                        src={user.avatar}
                        alt=""
                        className="nav__avatar-img"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)}
                      />
                    </span>
                  ) : (
                    <span className="nav__avatar-initials">
                      {getInitials()}
                    </span>
                  )}
                  <span className="nav__user-info">
                    {displayName}
                    <small>{providerLabel}</small>
                  </span>
                  <FiChevronDown
                    className={`nav__user-chev ${userMenuOpen ? "nav__user-chev--open" : ""}`}
                  />
                </button>

                <div
                  className={`nav__user-drop ${userMenuOpen ? "nav__user-drop--open" : ""}`}
                >
                  <div className="nav__user-drop-head">
                    <p className="nav__user-drop-name">{displayName}</p>
                    <p className="nav__user-drop-email">{user?.email}</p>
                    <span className="nav__pill">{providerLabel} account</span>
                  </div>
                  {userMenuItems.map((m, mi) => (
                    <Link
                      key={m.to}
                      to={m.to}
                      className="nav__user-drop-item"
                      style={{ "--mi": mi }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <m.icon size={16} />
                      {m.label}
                    </Link>
                  ))}
                  <button className="nav__user-drop-out" onClick={handleLogout}>
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="nav__sign-btn"
                onClick={() => openModal("login")}
              >
                <span>Sign In</span>
              </button>
            )}

            <Link to="/booking" className="nav__cta">
              <span>Book Now</span>
              <svg
                className="nav__cta-arrow"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <button
            className={`nav__hamburger ${isMobileMenuOpen ? "nav__hamburger--open" : ""}`}
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

        <div
          className="nav__progress"
          style={{
            transform: `scaleX(${Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1), 1)})`,
          }}
        />
      </nav>

      <div
        className={`srch ${searchOpen ? "srch--open" : ""}`}
        onClick={() => setSearchOpen(false)}
      >
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
              <button
                type="button"
                className="srch__clear"
                onClick={() => setSearchValue("")}
              >
                ✕
              </button>
            )}
          </form>
          <div className="srch__results">
            {isSearching && (
              <p className="srch__status">
                <span className="srch__spinner" />
                Searching…
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
                      src={
                        r.heroImage ||
                        r.images?.[0] ||
                        "https://via.placeholder.com/80"
                      }
                      alt=""
                      className="srch__thumb"
                    />
                    <div>
                      <p className="srch__name">{r.name}</p>
                      <p className="srch__meta">
                        {r.country} · {r.category || "Destination"}
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
            {!isSearching &&
              searchValue.trim().length >= 2 &&
              searchResults.length === 0 && (
                <p className="srch__status">No destinations found.</p>
              )}
          </div>
        </div>
        <button
          className="srch__close"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
        >
          ✕
        </button>
      </div>

      <div
        className={`backdrop ${isMobileMenuOpen ? "backdrop--open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`mm ${isMobileMenuOpen ? "mm--open" : ""}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mm__head">
          <Link
            to="/"
            className="mm__logo"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="mm__logo-img-wrapper">
              <img src={logoimg} alt="Altuvera" className="mm__logo-img" />
            </div>
            <span className="mm__logo-text">Altuvera</span>
          </Link>
          <button
            className="mm__close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close"
          >
            <span className="mm__close-x">✕</span>
          </button>
        </div>

        <div className="mm__body">
          {navLinks.map((link, idx) => (
            <div key={link.name} className="mm__item" style={{ "--idx": idx }}>
              {link.dropdown ? (
                <>
                  <button
                    className={`mm__toggle ${activeMobileDropdown === link.name ? "mm__toggle--on" : ""}`}
                    onClick={() => toggleMobileDropdown(link.name)}
                    aria-expanded={activeMobileDropdown === link.name}
                  >
                    <span className="mm__toggle-text">{link.name}</span>
                    <FiChevronDown
                      size={18}
                      className={`mm__chev ${activeMobileDropdown === link.name ? "mm__chev--open" : ""}`}
                    />
                  </button>
                  <div
                    className={`mm__sub ${activeMobileDropdown === link.name ? "mm__sub--open" : ""}`}
                  >
                    {link.dropdown.map((sub, si) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className="mm__sub-link"
                        style={{ "--si": si }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="mm__sub-dot" />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className={`mm__link ${location.pathname === link.path ? "mm__link--active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          <div className="mm__divider" />

          <div className="mm__auth">
            {isAuthenticated ? (
              <>
                <div className="mm__profile">
                  {user?.avatar ? (
                    <span className="mm__pav-wrap">
                      {!avatarLoaded && <span className="nav__avatar-spin" />}
                      <img
                        src={user.avatar}
                        alt=""
                        className="mm__pav-img"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)}
                      />
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
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openModal("login");
                }}
              >
                Sign In / Sign Up
              </button>
            )}
          </div>

          <Link
            to="/booking"
            className="mm__cta"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Book Your Adventure
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </aside>

      <style>{`
:root{
  --c:#059669;
  --ch:#047857;
  --cl:rgba(5,150,105,.1);
  --cg:linear-gradient(135deg,#059669,#10b981);
  --txt:#1a1a1a;
  --txt2:#4b5563;
  --mute:#888;
  --wh:#fff;
  --brd:#e5e7eb;
  --r:12px;
  --spring:cubic-bezier(.175,.885,.32,1.275);
  --smooth:cubic-bezier(.4,0,.2,1);
  --bounce:cubic-bezier(.68,-.55,.265,1.55);
  --fast:.2s;
  --med:.35s;
  --slow:.5s;
  --fd:'Playfair Display',serif;
  --fb:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
}

/* NAVBAR */
.nav{
  position:fixed;
  top:0;
  left:0;
  right:0;
  z-index:1000;
  padding:16px 0;
  background:transparent;
  transition:
    padding var(--med) var(--smooth),
    background var(--med) var(--smooth),
    box-shadow var(--med) var(--smooth),
    transform var(--med) var(--smooth);
  will-change:transform;
}
.nav--scrolled{
  padding:8px 0;
  background:rgba(255,255,255,.96);
  backdrop-filter:blur(24px) saturate(1.4);
  -webkit-backdrop-filter:blur(24px) saturate(1.4);
  box-shadow:
    0 1px 0 rgba(16,185,129,.08),
    0 8px 30px rgba(5,150,105,.08);
}
.nav--hidden{
  transform:translateY(-110%);
  box-shadow:none;
}
.nav__inner{
  max-width:1600px;
  width:100%;
  margin:0 auto;
  padding:0 clamp(14px,3vw,28px);
  display:flex;
  align-items:center;
  gap:12px;
}
.nav__progress{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  height:2px;
  background:var(--cg);
  transform-origin:left;
  transition:none;
  opacity:0;
}
.nav--scrolled .nav__progress{opacity:1}

/* LOGO */
.nav__logo{
  display:flex;
  align-items:center;
  gap:12px;
  text-decoration:none;
  flex-shrink:0;
  position:relative;
  transition:transform var(--fast) var(--smooth);
}
.nav__logo:hover{transform:scale(1.03)}
.nav__logo:active{transform:scale(.98)}

.nav__logo-glow{
  position:absolute;
  left:28px;
  top:50%;
  width:70px;
  height:70px;
  transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(16,185,129,.16) 0%,transparent 72%);
  border-radius:50%;
  pointer-events:none;
  opacity:0;
  transition:opacity var(--med);
}
.nav__logo:hover .nav__logo-glow{opacity:1}

.nav__logo-img-wrapper{
  position:relative;
  width:52px;
  height:52px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background:transparent;
  padding:0;
  box-shadow:none;
  border:none;
  outline:none;
}

.nav__logo-img{
  width:100%;
  height:100%;
  object-fit:contain;
  border:none !important;
  outline:none !important;
  background:transparent;
  border-radius:0 !important;
  box-shadow:none !important;
  filter:drop-shadow(0 8px 18px rgba(0,0,0,.14));
  transition:
    transform var(--med) var(--smooth),
    filter var(--med) var(--smooth);
  position:relative;
  z-index:1;
}

.nav__logo:hover .nav__logo-img{
  transform:translateY(-1px) scale(1.03);
  filter:drop-shadow(0 10px 22px rgba(5,150,105,.18));
}

.nav--scrolled .nav__logo-img-wrapper{
  width:48px;
  height:48px;
}

.nav--scrolled .nav__logo-img{
  filter:drop-shadow(0 3px 10px rgba(0,0,0,.08));
}

.nav__logo-text{
  font-family:var(--fd);
  font-size:clamp(24px,2.5vw,32px);
  font-weight:800;
  color:var(--wh);
  letter-spacing:-.8px;
  text-shadow:0 3px 15px rgba(0,0,0,.3);
  transition:all var(--med) var(--smooth);
  white-space:nowrap;
}
.nav--scrolled .nav__logo-text{
  color:var(--txt);
  text-shadow:none;
}

/* NAV LINKS */
.nav__links{
  display:flex;
  align-items:center;
  gap:2px;
  flex:1;
  justify-content:center;
  min-width:0;
}
.nav__item{
  position:relative;
  animation:navLinkIn .6s var(--smooth) calc(var(--i) * .06s) both;
}
@keyframes navLinkIn{
  from{opacity:0;transform:translateY(-10px)}
  to{opacity:1;transform:none}
}

.nav__link{
  display:inline-flex;
  align-items:center;
  gap:4px;
  padding:9px 13px;
  font-size:15px;
  font-weight:500;
  color:var(--wh);
  text-decoration:none;
  border-radius:8px;
  position:relative;
  overflow:hidden;
  transition:background var(--fast),color var(--fast),transform var(--fast);
  white-space:nowrap;
}
.nav--scrolled .nav__link{color:var(--txt)}
.nav__link:hover{
  background:rgba(255,255,255,.18);
  transform:translateY(-1px);
}
.nav--scrolled .nav__link:hover{
  background:var(--cl);
  color:var(--c);
}
.nav__link:active{transform:scale(.97)}

.nav__link::after{
  content:"";
  position:absolute;
  left:12px;
  right:12px;
  bottom:4px;
  height:2.5px;
  border-radius:99px;
  background:var(--cg);
  transform:scaleX(0);
  transform-origin:right;
  transition:transform .35s var(--spring);
}
.nav__link:hover::after,
.nav__link--active::after{
  transform:scaleX(1);
  transform-origin:left;
}

.nav__link-shine{
  position:absolute;
  top:0;
  left:-100%;
  width:100%;
  height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);
  transition:none;
  pointer-events:none;
}
.nav__link:hover .nav__link-shine{
  left:100%;
  transition:left .6s ease;
}

.nav__link--active{background:rgba(255,255,255,.16)}
.nav--scrolled .nav__link--active{
  background:var(--cl);
  color:var(--c);
}
.nav__chevron{transition:transform .3s var(--spring)}
.nav__chevron--open{transform:rotate(180deg)}

/* DESKTOP DROPDOWN */
.nav__dropdown{
  position:absolute;
  top:calc(100% + 8px);
  left:50%;
  min-width:240px;
  padding:0;
  transform:translateX(-50%) translateY(-8px) scale(.95);
  opacity:0;
  visibility:hidden;
  transition:all .3s var(--spring);
  z-index:100;
  pointer-events:none;
}
.nav__dropdown--open{
  opacity:1;
  visibility:visible;
  transform:translateX(-50%) translateY(0) scale(1);
  pointer-events:auto;
}
.nav__dropdown-inner{
  background:rgba(255,255,255,.98);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  border-radius:16px;
  border:1px solid #dcfce7;
  box-shadow:0 20px 50px rgba(6,78,59,.15),0 0 0 1px rgba(16,185,129,.06);
  padding:10px;
  overflow:hidden;
}
.nav__dropdown-link{
  display:flex;
  align-items:center;
  gap:10px;
  padding:11px 14px;
  font-size:14px;
  font-weight:600;
  color:#0f172a;
  text-decoration:none;
  border-radius:10px;
  transition:all var(--fast) var(--smooth);
  opacity:0;
  transform:translateX(-8px);
  animation:none;
}
.nav__dropdown--open .nav__dropdown-link{
  animation:dropIn .35s var(--smooth) calc(var(--si) * .05s) forwards;
}
@keyframes dropIn{
  to{opacity:1;transform:none}
}
.nav__dropdown-link:hover{
  background:#f0fdf4;
  color:var(--c);
  padding-left:18px;
}
.nav__dropdown-dot{
  width:6px;
  height:6px;
  border-radius:50%;
  background:var(--cg);
  opacity:.4;
  flex-shrink:0;
  transition:opacity var(--fast),transform var(--fast);
}
.nav__dropdown-link:hover .nav__dropdown-dot{
  opacity:1;
  transform:scale(1.3);
}

/* ACTIONS */
.nav__actions{
  display:flex;
  align-items:center;
  gap:8px;
  flex-shrink:0;
}
.nav__icon-link{text-decoration:none;display:flex}
.nav__icon-btn{
  width:42px;
  height:42px;
  border-radius:var(--r);
  border:none;
  background:rgba(255,255,255,.18);
  color:var(--wh);
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  position:relative;
  overflow:hidden;
  transition:transform var(--fast) var(--spring),background var(--fast),box-shadow var(--fast);
  box-shadow:0 6px 14px rgba(2,44,34,.1);
}
.nav--scrolled .nav__icon-btn{
  background:var(--cl);
  color:var(--c);
  box-shadow:0 4px 12px rgba(5,150,105,.1);
}
.nav__icon-btn:hover{transform:scale(1.08)}
.nav__icon-btn:active{transform:scale(.94)}

.nav__icon-ripple{
  position:absolute;
  inset:0;
  background:radial-gradient(circle at center,rgba(255,255,255,.3) 0%,transparent 70%);
  opacity:0;
  transform:scale(0);
  transition:none;
  pointer-events:none;
}
.nav__icon-btn:active .nav__icon-ripple{
  opacity:1;
  transform:scale(2.5);
  transition:transform .4s,opacity .4s;
}

.nav__badge{
  position:absolute;
  top:-4px;
  right:-4px;
  width:20px;
  height:20px;
  border-radius:50%;
  background:var(--c);
  color:var(--wh);
  font-size:11px;
  font-weight:700;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 2px 8px rgba(5,150,105,.4);
  animation:badgePop .4s var(--spring);
}
@keyframes badgePop{
  from{transform:scale(0)}
  to{transform:scale(1)}
}

.nav__auth-skel{
  width:80px;
  height:40px;
  border-radius:99px;
  background:rgba(255,255,255,.15);
  animation:skelPulse 1.4s ease infinite;
}
.nav--scrolled .nav__auth-skel{background:var(--cl)}
@keyframes skelPulse{0%,100%{opacity:.4}50%{opacity:.8}}

.nav__sign-btn{
  padding:9px 20px;
  border-radius:var(--r);
  font-size:14px;
  font-weight:600;
  border:none;
  cursor:pointer;
  color:var(--wh);
  background:var(--cg);
  position:relative;
  overflow:hidden;
  box-shadow:0 4px 14px rgba(5,150,105,.3);
  transition:transform var(--fast) var(--spring),box-shadow var(--fast);
}
.nav__sign-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 24px rgba(5,150,105,.35);
}
.nav__sign-btn:active{transform:scale(.96)}

.nav__cta{
  padding:10px 20px;
  background:var(--cg);
  color:var(--wh);
  border:none;
  border-radius:var(--r);
  font-size:14px;
  font-weight:600;
  text-decoration:none;
  display:inline-flex;
  align-items:center;
  gap:6px;
  box-shadow:0 4px 15px rgba(5,150,105,.3);
  position:relative;
  overflow:hidden;
  transition:transform var(--fast) var(--spring),box-shadow var(--fast),gap var(--fast);
  white-space:nowrap;
}
.nav__cta:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 24px rgba(5,150,105,.35);
  gap:10px;
}
.nav__cta:active{transform:scale(.96)}
.nav__cta-arrow{transition:transform var(--fast)}
.nav__cta:hover .nav__cta-arrow{transform:translateX(3px)}

/* USER MENU */
.nav__user{position:relative}
.nav__user-trigger{
  display:flex;
  align-items:center;
  gap:8px;
  padding:4px 12px 4px 4px;
  background:rgba(255,255,255,.15);
  border:1.5px solid rgba(255,255,255,.35);
  border-radius:99px;
  cursor:pointer;
  box-shadow:0 10px 22px rgba(5,150,105,.12);
  transition:all var(--fast) var(--smooth);
}
.nav--scrolled .nav__user-trigger{
  background:rgba(5,150,105,.08);
  border-color:rgba(16,185,129,.22);
}
.nav__user-trigger:hover{
  border-color:rgba(255,255,255,.6);
  transform:translateY(-1px);
  box-shadow:0 14px 28px rgba(5,150,105,.18);
}
.nav--scrolled .nav__user-trigger:hover{border-color:var(--c)}

.nav__avatar-initials{
  width:34px;
  height:34px;
  border-radius:50%;
  background:var(--cg);
  color:var(--wh);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
  font-weight:700;
  flex-shrink:0;
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.5),0 4px 10px rgba(6,78,59,.2);
}
.nav__avatar-wrap{
  position:relative;
  width:34px;
  height:34px;
  border-radius:50%;
  overflow:hidden;
  flex-shrink:0;
}
.nav__avatar-img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
}
.nav__avatar-spin{
  position:absolute;
  inset:0;
  border-radius:50%;
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);
  display:grid;
  place-items:center;
  z-index:2;
}
.nav__avatar-spin::after{
  content:"";
  width:14px;
  height:14px;
  border:2px solid #10b981;
  border-right-color:transparent;
  border-radius:50%;
  animation:spin .8s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}

.nav__user-info{
  display:flex;
  flex-direction:column;
  line-height:1.15;
  font-size:13px;
  font-weight:600;
  color:var(--wh);
  max-width:110px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.nav__user-info small{
  font-size:10px;
  text-transform:uppercase;
  letter-spacing:.04em;
  color:rgba(255,255,255,.8);
  font-weight:700;
  margin-top:1px;
}
.nav--scrolled .nav__user-info{color:var(--txt)}
.nav--scrolled .nav__user-info small{color:#6b7280}
.nav__user-chev{
  font-size:14px;
  color:rgba(255,255,255,.7);
  transition:transform .3s var(--spring);
}
.nav--scrolled .nav__user-chev{color:var(--mute)}
.nav__user-chev--open{transform:rotate(180deg)}

.nav__user-drop{
  position:absolute;
  top:calc(100% + 10px);
  right:0;
  width:260px;
  border-radius:16px;
  overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(249,255,252,.98));
  border:1px solid #d9f6e7;
  z-index:9999;
  box-shadow:0 24px 60px rgba(6,78,59,.18);
  opacity:0;
  visibility:hidden;
  transform:translateY(-10px) scale(.96);
  transition:all .3s var(--spring);
  pointer-events:none;
}
.nav__user-drop--open{
  opacity:1;
  visibility:visible;
  transform:none;
  pointer-events:auto;
}
.nav__user-drop-head{
  padding:14px 16px 12px;
  border-bottom:1px solid #f0fdf4;
}
.nav__user-drop-name{
  font-size:14px;
  font-weight:600;
  color:#111;
  margin:0;
}
.nav__user-drop-email{
  font-size:12px;
  color:var(--mute);
  margin:2px 0 0;
  overflow:hidden;
  text-overflow:ellipsis;
}
.nav__pill{
  display:inline-flex;
  margin-top:8px;
  padding:3px 10px;
  border-radius:99px;
  border:1px solid #97e9c0;
  background:linear-gradient(135deg,#f0fdf4,#dcfce7);
  color:#166534;
  font-size:11px;
  font-weight:700;
}
.nav__user-drop-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:11px 16px;
  font-size:14px;
  color:#444;
  text-decoration:none;
  opacity:0;
  transform:translateX(-6px);
  transition:background var(--fast),color var(--fast),padding-left var(--fast);
}
.nav__user-drop--open .nav__user-drop-item{
  animation:dropIn .3s var(--smooth) calc(var(--mi) * .04s + .1s) forwards;
}
.nav__user-drop-item:hover{
  background:#ecfdf5;
  color:var(--c);
  padding-left:20px;
}
.nav__user-drop-out{
  display:flex;
  align-items:center;
  gap:10px;
  padding:11px 16px;
  font-size:14px;
  color:#dc2626;
  border:none;
  background:none;
  width:100%;
  cursor:pointer;
  border-top:1px solid #f3f4f6;
  transition:background var(--fast);
}
.nav__user-drop-out:hover{background:#fef2f2}

/* HAMBURGER */
.nav__hamburger{
  display:none;
  width:48px;
  height:48px;
  border:none;
  border-radius:14px;
  cursor:pointer;
  background:rgba(255,255,255,.18);
  padding:0;
  flex-shrink:0;
  position:relative;
  transition:background var(--fast),transform var(--fast);
  -webkit-tap-highlight-color:transparent;
}
.nav--scrolled .nav__hamburger{background:var(--cl)}
.nav__hamburger:hover{transform:scale(1.05)}
.nav__hamburger:active{transform:scale(.93)}

.nav__hamburger-box{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:100%;
  height:100%;
  pointer-events:none;
}
.nav__hline{
  display:block;
  width:22px;
  height:2.5px;
  background:var(--wh);
  border-radius:4px;
  transition:
    transform .45s var(--spring),
    opacity .35s var(--smooth),
    width .35s var(--smooth),
    background .3s;
  transform-origin:center;
}
.nav--scrolled .nav__hline{background:var(--c)}
.nav__hline--1{transform:translateY(-4px)}
.nav__hline--2{width:16px}
.nav__hline--3{transform:translateY(4px)}

.nav__hamburger--open .nav__hline--1{
  transform:translateY(2.5px) rotate(45deg);
  width:24px;
}
.nav__hamburger--open .nav__hline--2{
  opacity:0;
  width:0;
  transform:translateX(10px);
}
.nav__hamburger--open .nav__hline--3{
  transform:translateY(-2.5px) rotate(-45deg);
  width:24px;
}

/* SEARCH */
.srch{
  position:fixed;
  inset:0;
  z-index:2005;
  background:rgba(2,44,34,.88);
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding-top:min(20vh,170px);
  opacity:0;
  visibility:hidden;
  transition:opacity .4s var(--smooth),visibility .4s;
  backdrop-filter:blur(8px);
}
.srch--open{opacity:1;visibility:visible}
.srch__box{
  width:100%;
  max-width:660px;
  padding:0 20px;
  transform:translateY(20px) scale(.97);
  transition:transform .45s var(--spring);
}
.srch--open .srch__box{transform:none}
.srch__form{position:relative;display:flex;align-items:center}
.srch__icon{position:absolute;left:20px;color:var(--c);pointer-events:none}
.srch__input{
  width:100%;
  padding:22px 60px 22px 54px;
  font-size:17px;
  border:2px solid #a7f3d0;
  border-radius:18px;
  background:var(--wh);
  outline:none;
  box-sizing:border-box;
  font-family:var(--fb);
  transition:border-color var(--fast),box-shadow var(--fast);
}
.srch__input:focus{
  border-color:var(--c);
  box-shadow:0 0 0 5px rgba(5,150,105,.1);
}
.srch__clear{
  position:absolute;
  right:18px;
  width:28px;
  height:28px;
  border-radius:50%;
  border:none;
  background:#f1f5f9;
  color:#666;
  font-size:13px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:background var(--fast),color var(--fast);
}
.srch__clear:hover{background:#fee2e2;color:#dc2626}

.srch__close{
  position:absolute;
  top:20px;
  right:20px;
  width:48px;
  height:48px;
  border-radius:50%;
  border:none;
  background:rgba(255,255,255,.12);
  color:var(--wh);
  font-size:20px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:all var(--fast) var(--spring);
}
.srch__close:hover{
  background:rgba(255,255,255,.25);
  transform:rotate(90deg) scale(1.1);
}

.srch__results{
  margin-top:16px;
  max-height:55vh;
  overflow-y:auto;
  scrollbar-width:thin;
  scrollbar-color:#059669 transparent;
}
.srch__status{
  padding:18px;
  text-align:center;
  color:rgba(255,255,255,.8);
  font-weight:500;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
}
.srch__spinner{
  width:18px;
  height:18px;
  border:2px solid rgba(255,255,255,.3);
  border-top-color:#10b981;
  border-radius:50%;
  animation:spin .7s linear infinite;
}
.srch__list{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.srch__item{
  display:flex;
  align-items:center;
  gap:14px;
  padding:12px;
  text-decoration:none;
  border:1px solid rgba(255,255,255,.08);
  border-radius:var(--r);
  opacity:0;
  transform:translateY(8px);
  animation:srchIn .35s var(--smooth) calc(var(--ri) * .06s) forwards;
  transition:background var(--fast),border-color var(--fast),transform var(--fast);
}
@keyframes srchIn{to{opacity:1;transform:none}}
.srch__item:hover{
  background:rgba(255,255,255,.1);
  border-color:#059669;
  transform:translateX(4px);
}
.srch__thumb{
  width:52px;
  height:52px;
  border-radius:10px;
  object-fit:cover;
  flex-shrink:0;
}
.srch__name{
  color:#fff;
  font-weight:600;
  font-size:15px;
  margin:0;
}
.srch__meta{
  color:rgba(255,255,255,.6);
  font-size:13px;
  margin:2px 0 0;
}
.srch__all{
  display:block;
  padding:14px;
  text-align:center;
  color:var(--c);
  font-weight:700;
  font-size:14px;
  text-decoration:none;
  border-top:1px solid rgba(255,255,255,.08);
  margin-top:8px;
  transition:color var(--fast);
}
.srch__all:hover{color:#34d399}

/* BACKDROP */
.backdrop{
  position:fixed;
  inset:0;
  z-index:1001;
  background:rgba(2,44,34,.45);
  backdrop-filter:blur(4px);
  opacity:0;
  visibility:hidden;
  transition:opacity var(--med) var(--smooth),visibility var(--med);
}
.backdrop--open{opacity:1;visibility:visible}

/* MOBILE MENU */
.mm{
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  width:min(400px,92vw);
  z-index:1002;
  background:var(--wh);
  box-shadow:-10px 0 50px rgba(6,78,59,.12);
  transform:translateX(105%);
  transition:transform .5s var(--smooth);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
.mm--open{transform:translateX(0)}

.mm__head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:14px 18px;
  border-bottom:1px solid var(--brd);
  background:var(--wh);
  flex-shrink:0;
}
.mm__logo{
  display:flex;
  align-items:center;
  gap:12px;
  text-decoration:none;
}
.mm__logo-img-wrapper{
  width:46px;
  height:46px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  border:none !important;
  outline:none !important;
  background:transparent;
  box-shadow:none;
}
.mm__logo-img{
  width:100%;
  height:100%;
  object-fit:contain;
  border:none !important;
  outline:none !important;
  border-radius:0 !important;
  background:transparent;
  box-shadow:none !important;
  filter:drop-shadow(0 4px 10px rgba(5,150,105,.16));
}
.mm__logo-text{
  font-family:var(--fd);
  font-size:24px;
  font-weight:700;
  color:var(--c);
  white-space:nowrap;
}

.mm__close-btn{
  width:40px;
  height:40px;
  border:none;
  border-radius:10px;
  background:var(--cl);
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:background var(--fast),transform .3s var(--spring);
}
.mm__close-btn:hover{
  background:rgba(5,150,105,.15);
  transform:rotate(90deg);
}
.mm__close-x{
  font-size:18px;
  color:var(--c);
  font-weight:700;
  line-height:1;
}

.mm__body{
  flex:1;
  overflow-y:auto;
  overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;
  padding:8px 18px calc(28px + env(safe-area-inset-bottom,0px));
}

.mm__item{
  border-bottom:1px solid #f3f4f6;
  opacity:0;
  transform:translateX(30px);
  transition:opacity .01s,transform .01s;
}
.mm--open .mm__item{
  animation:mmSlideIn .5s var(--smooth) calc(var(--idx) * .06s + .15s) forwards;
}
@keyframes mmSlideIn{
  0%{opacity:0;transform:translateX(40px)}
  60%{opacity:1}
  100%{opacity:1;transform:none}
}

.mm__link{
  display:flex;
  align-items:center;
  padding:16px 4px;
  font-size:18px;
  font-weight:700;
  color:var(--txt);
  text-decoration:none;
  font-family:var(--fd);
  position:relative;
  transition:color var(--fast),padding-left var(--fast);
}
.mm__link::before{
  content:"";
  position:absolute;
  left:0;
  top:50%;
  width:3px;
  height:0;
  border-radius:4px;
  background:var(--cg);
  transform:translateY(-50%);
  transition:height .25s var(--spring);
}
.mm__link:hover,
.mm__link--active{
  color:var(--c);
  padding-left:14px;
}
.mm__link:hover::before,
.mm__link--active::before{height:60%}

.mm__toggle{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:16px 4px;
  font-size:18px;
  font-weight:700;
  color:var(--txt);
  background:none;
  border:none;
  font-family:var(--fd);
  cursor:pointer;
  text-align:left;
  transition:color var(--fast);
}
.mm__toggle--on{color:var(--c)}
.mm__chev{transition:transform .35s var(--spring)}
.mm__chev--open{transform:rotate(180deg)}

.mm__sub{
  display:grid;
  gap:2px;
  max-height:0;
  overflow:hidden;
  opacity:0;
  transform:translateY(-6px);
  transition:
    max-height .4s var(--smooth),
    opacity .3s var(--smooth),
    transform .3s var(--smooth),
    padding .4s var(--smooth),
    margin .4s var(--smooth);
  padding:0 8px;
  margin:0;
  border-radius:14px;
  border:1px solid transparent;
  background:transparent;
}
.mm__sub--open{
  max-height:500px;
  opacity:1;
  transform:none;
  padding:10px;
  margin:4px 0 10px;
  border-color:#d1fae5;
  background:#f8fffc;
  box-shadow:0 6px 24px rgba(5,150,105,.08);
}
.mm__sub-link{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 12px;
  font-size:16px;
  color:var(--txt2);
  text-decoration:none;
  border-radius:10px;
  opacity:0;
  transform:translateX(-8px);
  transition:all var(--fast) var(--smooth);
}
.mm__sub--open .mm__sub-link{
  animation:subIn .35s var(--smooth) calc(var(--si) * .05s + .08s) forwards;
}
@keyframes subIn{to{opacity:1;transform:none}}
.mm__sub-link:hover{
  background:rgba(5,150,105,.08);
  color:var(--c);
  padding-left:16px;
}
.mm__sub-dot{
  width:5px;
  height:5px;
  border-radius:50%;
  background:var(--c);
  opacity:.35;
  flex-shrink:0;
  transition:opacity var(--fast),transform var(--fast);
}
.mm__sub-link:hover .mm__sub-dot{
  opacity:1;
  transform:scale(1.4);
}

.mm__divider{
  height:2px;
  margin:12px 0;
  border-radius:99px;
  background:linear-gradient(90deg,transparent,#d1fae5,transparent);
  opacity:0;
}
.mm--open .mm__divider{
  animation:divIn .6s var(--smooth) .5s forwards;
}
@keyframes divIn{to{opacity:1}}

.mm__auth{padding-top:12px}
.mm__profile{
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:14px;
}
.mm__pav-wrap{
  position:relative;
  width:46px;
  height:46px;
  border-radius:50%;
  overflow:hidden;
  flex-shrink:0;
}
.mm__pav-img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
}
.mm__pav-init{
  width:46px;
  height:46px;
  border-radius:50%;
  background:var(--cg);
  color:var(--wh);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:16px;
  font-weight:700;
  flex-shrink:0;
}
.mm__pname{
  font-size:17px;
  font-weight:700;
  color:#111;
  font-family:var(--fd);
  margin:0;
}
.mm__pemail{
  font-size:13px;
  color:var(--mute);
  margin:2px 0 0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  max-width:200px;
}
.mm__pprov{
  font-size:12px;
  color:var(--ch);
  font-weight:600;
  margin-top:4px;
}

.mm__auth-link{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 4px;
  font-size:16px;
  font-weight:600;
  color:#333;
  text-decoration:none;
  border-bottom:1px solid #f3f4f6;
  transition:color var(--fast),padding-left var(--fast);
}
.mm__auth-link:hover{
  color:var(--c);
  padding-left:8px;
}

.mm__out{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 4px;
  font-size:16px;
  font-weight:600;
  color:#dc2626;
  background:none;
  border:none;
  width:100%;
  cursor:pointer;
  margin-top:6px;
  transition:opacity var(--fast);
}
.mm__out:hover{opacity:.7}

.mm__sign{
  width:100%;
  padding:14px;
  border-radius:var(--r);
  border:none;
  background:var(--c);
  color:var(--wh);
  font-size:16px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 4px 14px rgba(5,150,105,.3);
  transition:transform var(--fast) var(--spring),box-shadow var(--fast);
}
.mm__sign:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 22px rgba(5,150,105,.35);
}
.mm__sign:active{transform:scale(.97)}

.mm__cta{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  margin-top:16px;
  padding:14px 22px;
  background:var(--cg);
  color:var(--wh);
  border:none;
  border-radius:var(--r);
  font-size:16px;
  font-weight:600;
  text-decoration:none;
  box-shadow:0 4px 15px rgba(5,150,105,.3);
  transition:transform var(--fast) var(--spring),box-shadow var(--fast),gap var(--fast);
}
.mm__cta:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 24px rgba(5,150,105,.35);
  gap:12px;
}
.mm__cta:active{transform:scale(.97)}

/* RESPONSIVE */
@media (max-width:1280px){
  .nav__inner{
    padding:0 clamp(12px,2.2vw,24px);
  }
  .nav__links{
    gap:0;
  }
  .nav__link{
    font-size:14px;
    padding:8px 10px;
  }
}

@media (max-width:1180px){
  .nav__link{
    font-size:13px;
    padding:8px 8px;
  }
  .nav__user-info{display:none}
  .nav__cta{
    padding:10px 16px;
  }
}

@media(max-width:1024px){
  .nav{
    padding:14px 0;
  }
  .nav__links,
  .nav__actions{display:none!important}
  .nav__hamburger{display:flex!important}
  .nav__inner{
    justify-content:space-between;
  }
}

@media(min-width:1025px){
  .nav__hamburger{display:none!important}
}

@media(max-width:860px){
  .nav__logo-text{display:none}
  .nav__logo-img-wrapper{
    width:48px;
    height:48px;
  }
}

@media(max-width:640px){
  .mm{
    width:100vw;
    border-radius:0;
  }
  .nav{
    padding:12px 0;
  }
  .nav--scrolled{
    padding:8px 0;
  }
  .nav__hamburger{
    width:44px;
    height:44px;
    border-radius:12px;
  }
  .nav__hline{width:20px}
  .srch{
    padding-top:min(14vh,120px);
  }
  .srch__box{padding:0 14px}
  .srch__input{
    font-size:16px;
    padding:18px 52px 18px 48px;
    border-radius:16px;
  }
  .srch__item{
    padding:10px;
    gap:12px;
  }
  .srch__thumb{
    width:46px;
    height:46px;
  }
  .nav__logo-img-wrapper{
    width:44px;
    height:44px;
  }
  .mm__body{
    padding-left:16px;
    padding-right:16px;
  }
  .mm__logo-img-wrapper{
    width:42px;
    height:42px;
  }
  .mm__logo-text{
    font-size:22px;
  }
}

@media(max-width:480px){
  .nav__inner{
    padding:0 14px;
  }
  .nav__logo-img-wrapper{
    width:40px;
    height:40px;
  }
  .nav__hamburger{
    width:42px;
    height:42px;
    border-radius:10px;
  }
  .srch__close{
    top:14px;
    right:14px;
    width:42px;
    height:42px;
  }
  .mm__link,
  .mm__toggle{
    font-size:17px;
    padding:14px 4px;
  }
  .mm__sub-link{
    font-size:15px;
  }
  .mm__auth-link,
  .mm__out{
    font-size:15px;
  }
  .mm__cta{
    font-size:15px;
    padding:13px 18px;
  }
}

@media(max-width:380px){
  .nav__logo-img-wrapper{
    width:38px;
    height:38px;
  }
  .nav__hamburger{
    width:40px;
    height:40px;
    border-radius:10px;
  }
  .nav__hline{
    width:18px;
    height:2px;
  }
  .nav__hline--1{transform:translateY(-3.5px)}
  .nav__hline--3{transform:translateY(3.5px)}
  .nav__hamburger--open .nav__hline--1{transform:translateY(2px) rotate(45deg)}
  .nav__hamburger--open .nav__hline--3{transform:translateY(-2px) rotate(-45deg)}
  .mm__body{
    padding-left:14px;
    padding-right:14px;
  }
  .mm__logo-img-wrapper{
    width:38px;
    height:38px;
  }
  .mm__logo-text{
    font-size:20px;
  }
}

/* REDUCED MOTION */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
  }
}
      `}</style>
    </>
  );
};

export default Navbar;