// src/components/common/Navbar.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiHeart,
  FiUser,
  FiLogOut,
  FiCalendar,
  FiSettings,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiStar,
  FiClock,
  FiX,
  FiMenu,
  FiArrowRight,
  FiCamera,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import { preloadRoute } from "../../utils/routeUtils";
import { getCountrySlug } from "../../utils/countrySlugMap";
import { useCountries } from "../../hooks/useCountries";
import { useDestinationsList } from "../../hooks/useDestinationsList";
import { adaptDestination } from "../../utils/destinationAdapter";
import "./Navbar.css";

const cn = (...c) => c.filter(Boolean).join(" ");

/* ── Slideshow Card Component ── */
const DestinationCard = ({ destination, onClick, style, index }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideTimer = useRef(null);

  const images = useMemo(() => {
    const imgs = [];
    if (destination.heroImage) imgs.push(destination.heroImage);
    if (Array.isArray(destination.heroImages)) destination.heroImages.forEach((img) => { const url = typeof img === "string" ? img : img?.url || img?.imageUrl || img?.image_url; if (url && !imgs.includes(url)) imgs.push(url); });
    if (Array.isArray(destination.image_urls)) destination.image_urls.forEach((url) => { if (typeof url === "string" && url && !imgs.includes(url)) imgs.push(url); });
    if (destination.coverImageUrl && !imgs.includes(destination.coverImageUrl)) imgs.push(destination.coverImageUrl);
    if (destination.images && Array.isArray(destination.images)) {
      destination.images.forEach((img) => {
        const url = typeof img === "string" ? img : img?.url || img?.src;
        if (url && !imgs.includes(url)) imgs.push(url);
      });
    }
    if (destination.gallery && Array.isArray(destination.gallery)) {
      destination.gallery.forEach((img) => {
        const url = typeof img === "string" ? img : img?.url || img?.src;
        if (url && !imgs.includes(url)) imgs.push(url);
      });
    }
    return imgs.length > 0 ? imgs.slice(0, 5) : [];
  }, [destination]);

  useEffect(() => {
    if (images.length <= 1) return;
    slideTimer.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % images.length);
    }, 3000);
    return () => clearInterval(slideTimer.current);
  }, [images.length]);

  const totalPhotoCount = useMemo(() => {
    const raw = [
      destination.heroImage,
      destination.coverImageUrl,
      ...(Array.isArray(destination.heroImages) ? destination.heroImages : []),
      ...(Array.isArray(destination.images) ? destination.images : []),
      ...(Array.isArray(destination.image_urls) ? destination.image_urls : []),
      ...(Array.isArray(destination.gallery) ? destination.gallery : []),
      ...(Array.isArray(destination.attractions) ? destination.attractions : []),
    ];
    const urls = raw.map((item) => typeof item === "string" ? item : item?.url || item?.imageUrl || item?.image_url || item?.image).filter(Boolean);
    return new Set(urls).size;
  }, [destination]);

  const goSlide = (dir, e) => {
    e.stopPropagation();
    e.preventDefault();
    clearInterval(slideTimer.current);
    setCurrentSlide((p) =>
      dir === "next"
        ? (p + 1) % images.length
        : (p - 1 + images.length) % images.length
    );
    slideTimer.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % images.length);
    }, 3000);
  };

  return (
    <div
      className="srch-card"
      style={{ ...style, "--card-i": index }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="srch-card__img-wrap">
        {images.length > 0 ? (
          images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${destination.name} ${i + 1}`}
              className={cn(
                "srch-card__img",
                i === currentSlide && "srch-card__img--active"
              )}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ))
        ) : (
          <div className="srch-card__img-placeholder">
            <FiMapPin size={28} />
          </div>
        )}

        {/* Slide indicators */}
        {images.length > 1 && (
          <div className="srch-card__dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "srch-card__dot",
                  i === currentSlide && "srch-card__dot--active"
                )}
              />
            ))}
          </div>
        )}

        {/* Slide arrows on hover */}
        {images.length > 1 && isHovered && (
          <>
            <button
              className="srch-card__arrow srch-card__arrow--prev"
              onClick={(e) => goSlide("prev", e)}
              aria-label="Previous image"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              className="srch-card__arrow srch-card__arrow--next"
              onClick={(e) => goSlide("next", e)}
              aria-label="Next image"
            >
              <FiChevronRight size={16} />
            </button>
          </>
        )}

        {/* Destination photo count */}
        {images.length > 0 && (
          <span style={{position:"absolute",right:10,bottom:10,zIndex:5,display:"inline-flex",alignItems:"center",gap:5,padding:"5px 8px",borderRadius:999,background:"rgba(15,23,42,.72)",color:"#fff",fontSize:11,fontWeight:700,backdropFilter:"blur(8px)"}}>
            <FiCamera size={12}/>{totalPhotoCount} {totalPhotoCount === 1 ? "photo" : "photos"}
          </span>
        )}

        {/* Category badge */}
        {destination.category && (
          <span className="srch-card__badge">{destination.category}</span>
        )}
      </div>

      {/* Hover overlay with description */}
      <div
        className={cn(
          "srch-card__overlay",
          isHovered && "srch-card__overlay--visible"
        )}
      >
        <h4 className="srch-card__overlay-title">{destination.name}</h4>
        {destination.country && (
          <p className="srch-card__overlay-loc">
            <FiMapPin size={12} /> {destination.country}
          </p>
        )}
        <p className="srch-card__overlay-desc">
          {destination.description
            ? destination.description.slice(0, 120) + "…"
            : destination.shortDescription ||
              "Discover this amazing destination"}
        </p>
        <span className="srch-card__overlay-cta">
          View Details <FiArrowRight size={14} />
        </span>
      </div>

      {/* Bottom info bar (always visible) */}
      <div className="srch-card__info">
        <h4 className="srch-card__name">{destination.name}</h4>
        <div className="srch-card__meta-row">
          {destination.country && (
            <p className="srch-card__location">
              <FiMapPin size={11} /> {destination.country}
            </p>
          )}
          {!destination.isCountry && Number(destination.rating) > 0 && (
            <span className="srch-card__rating">
              <FiStar size={10} fill="currentColor" /> {Number(destination.rating).toFixed(1)}
            </span>
          )}
          {!destination.isCountry && destination.duration && (
            <span className="srch-card__duration">
              <FiClock size={10} /> {destination.duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   NAVBAR MAIN
   ══════════════════════════════════════════════════════ */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSort, setSearchSort] = useState("featured");
  const searchInputRef = useRef(null);
  const touchStartRef = useRef(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites } = useApp();
  const { user, isAuthenticated, authLoading, openModal, logout } =
    useUserAuth();
  const { countries: backendCountries } = useCountries({ limit: 100 });
  const { data: searchDestinations = [] } = useDestinationsList({ limit: 200 });

  const headerRef = useRef(null);
  const userMenuRef = useRef(null);
  const dropdownTimer = useRef(null);
  const lastScrollYRef = useRef(0);
  const prevNavHiddenRef = useRef(false);
  const logoDetachedTimerRef = useRef(null);
  const logoRef = useRef(null);
  const [logoDetached, setLogoDetached] = useState(false);
  const [logoRect, setLogoRect] = useState(null);

  /* ── Dropdown Data ── */
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
            c.tagline ||
            c.region ||
            c.capital ||
            c.continent ||
            c.subRegion ||
            c.shortDescription ||
            (c.description ? `${c.description.slice(0, 60)}…` : ""),
          path: `/country/${getCountrySlug(c)}`,
        })
      );
    }
    return items;
  }, [backendCountries]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const countries = (backendCountries || []).map(country => ({ ...country, _isCountry: true, _label: country.name || country.title || "" }));
    const destinations = (searchDestinations || []).map(item => ({ ...adaptDestination(item), ...item, _isCountry: false, _label: item.name || item.title || item.destination_name || "" }));
    const matches = item => !query || `${item._label} ${item.country || item.country_name || item.region || item.continent || ""} ${item.description || item.shortDescription || ""}`.toLowerCase().includes(query);
    const metric = (item, fields) => fields.reduce((score, field) => score + (Number(item[field]) || 0), 0);
    const ranked = (items, fields) => [...items].filter(matches).sort((a,b) => metric(b, fields) - metric(a, fields));
    const countryFields = searchSort === "searched" ? ["search_count","searchCount","searches","views"] : ["featured_score","is_featured","featured","visit_count","visits","popularity"];
    const destinationFields = searchSort === "searched" ? ["search_count","searchCount","searches","searches_count"] : searchSort === "visited" ? ["visit_count","visitCount","visits","views","view_count","popularity"] : ["featured_score","is_featured","featured","isFeatured","visit_count","visits","rating"];
    return { countries: ranked(countries, countryFields).slice(0, 8), destinations: ranked(destinations, destinationFields).slice(0, 12) };
  }, [backendCountries, searchDestinations, searchQuery]);

  const navLinks = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Explore", path: "/explore" },
      { name: "Destinations", path: "/destinations" },
      { name: "Interactive Map", path: "/interactive-map" },
      { name: "Tips", path: "/tips" },
      {
        name: "About",
        path: "/about",
        dropdown: [
          { name: "About Us", path: "/about" },
          { name: "Our Services", path: "/services" },
          { name: "Payment Terms", path: "/payment-terms" },
          { name: "Our Team", path: "/team" },
        ],
      },
      { name: "Contact", path: "/contact" },
    ],
    [destinationsDropdown]
  );

  const userMenuItems = useMemo(() => {
    const items = [
      { to: "/profile", icon: FiUser, label: "Profile" },
      { to: "/my-bookings", icon: FiCalendar, label: "Your Bookings" },
      { to: "/wishlist", icon: FiHeart, label: "Your Wishlist" },
      { to: "/settings", icon: FiSettings, label: "Your Settings" },
    ];
    if (user?.role === "admin" || user?.role === "manager")
      items.push({
        to: "/admin/dashboard",
        icon: FiSettings,
        label: "Admin Dashboard",
      });
    return items;
  }, [user?.role]);

  /* ── Scroll Logic ── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY = lastScrollYRef.current;
        setIsScrolled(currentY > 20);
        if (currentY > 80) {
          if (currentY > lastY + 5) setNavHidden(true);
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

  /* ── Logo detach on scroll hide ── */
  useEffect(() => {
    const prevHidden = prevNavHiddenRef.current;
    prevNavHiddenRef.current = navHidden;
    if (navHidden && !prevHidden) {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        setLogoRect({ top: rect.top, left: rect.left });
      }
      setLogoDetached(true);
      if (logoDetachedTimerRef.current)
        clearTimeout(logoDetachedTimerRef.current);
    } else if (!navHidden && prevHidden) {
      if (logoDetachedTimerRef.current)
        clearTimeout(logoDetachedTimerRef.current);
      logoDetachedTimerRef.current = setTimeout(() => {
        setLogoDetached(false);
      }, 500);
    }
    return () => {
      if (logoDetachedTimerRef.current)
        clearTimeout(logoDetachedTimerRef.current);
    };
  }, [navHidden]);

  /* ── Utilities ── */
  const closeAll = useCallback(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveMobileDropdown(null);
    setUserMenuOpen(false);
  }, []);

  useEffect(() => closeAll(), [location.pathname, closeAll]);
  useEffect(() => { setSearchOpen(false); setDesktopSearchOpen(false); setSearchQuery(""); }, [location.pathname]);
  useEffect(() => { if (searchOpen) requestAnimationFrame(() => searchInputRef.current?.focus()); }, [searchOpen]);
  useEffect(() => {
    const start = e => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const end = e => {
      if (!touchStartRef.current) return;
      const start = touchStartRef.current;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      touchStartRef.current = null;
      if (Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 1.25 || window.innerWidth > 760) return;
      if (dx < 0 && start.x > window.innerWidth - 70) setIsMobileMenuOpen(true);
      else if (dx > 0 && isMobileMenuOpen) setIsMobileMenuOpen(false);
      else if (dx > 0 && start.x < 70) setIsMobileMenuOpen(false);
    };
    document.addEventListener("touchstart", start, { passive: true }); document.addEventListener("touchend", end, { passive: true });
    return () => { document.removeEventListener("touchstart", start); document.removeEventListener("touchend", end); };
  }, [isMobileMenuOpen]);
  useEffect(() => setAvatarLoaded(false), [user?.avatar]);

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

  /* ── Handlers ── */

  const toggleMobileDropdown = useCallback(
    (n) => setActiveMobileDropdown((p) => (p === n ? null : n)),
    []
  );

  const handleDropdownEnter = useCallback((n) => {
    clearTimeout(dropdownTimer.current);
    setActiveDropdown(n);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const handleDesktopClick = useCallback((e, l) => {
    if (l.dropdown) {
      e.preventDefault();
      setActiveDropdown((p) => (p === l.name ? null : l.name));
    }
  }, []);

  const handleDesktopDblClick = useCallback(
    (e, l) => {
      if (l.dropdown) {
        e.preventDefault();
        setActiveDropdown(null);
        navigate(l.path);
      }
    },
    [navigate]
  );

  const isActive = useCallback(
    (l) =>
      location.pathname === l.path ||
      l.dropdown?.some((d) => d.path === location.pathname) ||
      false,
    [location.pathname]
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
    () =>
      user?.fullName || user?.name || user?.email?.split("@")[0] || "User",
    [user]
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

  /* ══════════════════════════════════════
     RENDER
     ══════════════════════════════════════ */
  return (
    <>
      {/* ── FLOATING LOGO when nav hidden ── */}
      {logoDetached && logoRect && (
        <Link
          to="/"
          className="nav__logo nav__logo--floating"
          style={{
            position: "fixed",
            top: 12,
            left: logoRect.left,
            zIndex: 1100,
            opacity: navHidden ? 0.35 : 0,
            transition: "opacity 0.4s ease",
            pointerEvents: navHidden ? "auto" : "none",
          }}
          aria-label="Home"
        >
          <div className="nav__logo-glow" />
          <div className="nav__logo-img-wrapper">
            <img
              src={getBrandLogoUrl()}
              alt={BRAND_LOGO_ALT}
              className="nav__logo-img"
              draggable={false}
            />
          </div>
          <span className="nav__logo-text">Altuvera</span>
        </Link>
      )}

      {/* ══════ NAVBAR ══════ */}
      <nav
        ref={headerRef}
        role="navigation"
        className={cn(
          "nav",
          isScrolled && "nav--scrolled",
          navHidden && "nav--hidden"
        )}
      >
        <div className="nav__inner">
          {/* Logo */}
          <Link
            ref={logoRef}
            to="/"
            className="nav__logo"
            aria-label="Altuvera Home"
          >
            <div className="nav__logo-glow" />
            <div className="nav__logo-img-wrapper">
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                className="nav__logo-img"
                draggable={false}
              />
            </div>
            <span className="nav__logo-text">Altuvera</span>
          </Link>

          {/* ── Desktop Links ── */}
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
                  onTouchStart={() =>
                    link.dropdown && handleDropdownEnter(link.name)
                  }
                  onMouseEnter={() => preloadRoute(link.path)}
                  className={cn(
                    "nav__link",
                    isActive(link) && "nav__link--active"
                  )}
                  aria-expanded={
                    link.dropdown ? activeDropdown === link.name : undefined
                  }
                >
                  <span className="nav__link-text">{link.name}</span>
                  {link.dropdown && (
                    <FiChevronDown
                      size={14}
                      className={cn(
                        "nav__chevron",
                        activeDropdown === link.name && "nav__chevron--open"
                      )}
                    />
                  )}
                  <span className="nav__link-underline" />
                  <span className="nav__link-shine" />
                </Link>

                {link.dropdown && (
                  <div
                    className={cn(
                      "nav__dropdown",
                      activeDropdown === link.name && "nav__dropdown--open"
                    )}
                  >
                    <div className="nav__dropdown-inner">
                      {link.dropdown.map((sub, si) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={cn(
                            "nav__dropdown-link",
                            sub.info && "nav__dropdown-link--rich"
                          )}
                          style={{ "--si": si }}
                          onClick={() => setActiveDropdown(null)}
                        >
                          {sub.flag ? (
                            <span className="nav__dropdown-flag">
                              {sub.flag.startsWith("http") ||
                              sub.flag.includes("/") ? (
                                <img src={sub.flag} alt={`${sub.name} flag`} />
                              ) : (
                                sub.flag
                              )}
                            </span>
                          ) : (
                            <span className="nav__dropdown-dot" />
                          )}
                          <div className="nav__dropdown-text-wrap">
                            <span className="nav__dropdown-name">
                              {sub.name}
                            </span>
                            {sub.info && (
                              <span className="nav__dropdown-info">
                                {sub.info}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="nav__actions">
            <div className={cn("nav-search-desktop", desktopSearchOpen && "nav-search-desktop--open")} onMouseEnter={() => { if (window.innerWidth > 760) setDesktopSearchOpen(true); }} onMouseLeave={() => { if (window.innerWidth > 760 && !searchQuery) setDesktopSearchOpen(false); }}>
              <button type="button" className="nav__search-trigger" aria-label="Search destinations and countries" onClick={() => { if (window.innerWidth <= 760) setSearchOpen(true); else setDesktopSearchOpen(true); }} onFocus={() => { if (window.innerWidth > 760) setDesktopSearchOpen(true); }}><FiSearch size={19} /></button>
              <input className="nav-search-desktop-input" aria-label="Search destinations and countries" placeholder="Search places..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setDesktopSearchOpen(true)} onKeyDown={e => { if (e.key === "Escape") { setDesktopSearchOpen(false); setSearchQuery(""); } if (e.key === "Enter") setSearchOpen(true); }} />
              {desktopSearchOpen && searchQuery.trim() && <div className="nav-search-desktop-results">{searchResults.countries.slice(0,3).map((item,i)=><button key={item.id || item._label+i} onClick={()=>{navigate(`/country/${getCountrySlug(item)}`);setDesktopSearchOpen(false);setSearchQuery("");}}><FiMapPin size={14}/><span>{item._label}</span><small>Country</small></button>)}{searchResults.destinations.slice(0,4).map((item,i)=><button key={item.id || item._label+i} onClick={()=>{navigate(`/destinations/${item.id || item.slug}`);setDesktopSearchOpen(false);setSearchQuery("");}}><FiMapPin size={14}/><span>{item._label}</span><small>Destination</small></button>)}<button className="nav-search-view-all" onClick={()=>setSearchOpen(true)}>View all results <FiArrowRight size={14}/></button></div>}
            </div>
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

            {/* Auth */}
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
                </button>

                <div
                  className={cn(
                    "nav__user-drop",
                    userMenuOpen && "nav__user-drop--open"
                  )}
                >
                  <div className="nav__user-drop-head">
                    <div className="nav__user-drop-profile">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="nav__user-drop-avatar"
                        />
                      ) : (
                        <span className="nav__user-drop-avatar-initials">
                          {getInitials()}
                        </span>
                      )}
                      <div className="nav__user-drop-info">
                        <p className="nav__user-drop-name">{displayName}</p>
                        <p className="nav__user-drop-email">{user?.email}</p>
                        <span className="nav__pill">
                          {user?.isVerified ? "✓ Verified" : providerLabel}{" "}
                          account
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
                  <button
                    className="nav__user-drop-out"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="nav__sign-btn"
                onClick={() =>
                  openModal("login", { skipNotLoggedInMessage: true })
                }
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

          {/* Hamburger */}
          <button
            className={cn(
              "nav__hamburger",
              isMobileMenuOpen && "nav__hamburger--open"
            )}
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

      {/* ── BACKDROP ── */}
      <div
        className={cn("backdrop", isMobileMenuOpen && "backdrop--open")}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ══════ MOBILE MENU ══════ */}
      <aside
        className={cn("mm", isMobileMenuOpen && "mm--open")}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Mobile Header */}
        <div className="mm__head">
          <Link
            to="/"
            className="mm__logo"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="mm__logo-img-wrapper">
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                className="mm__logo-img"
              />
            </div>
            <span className="mm__logo-text">Altuvera</span>
          </Link>
          <button
            className="mm__close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Mobile Body */}
        <div className="mm__body">
          {navLinks.map((link, idx) => (
            <div key={link.name} className="mm__item" style={{ "--idx": idx }}>
              {link.dropdown ? (
                <>
                  <button
                    className={cn(
                      "mm__toggle",
                      activeMobileDropdown === link.name && "mm__toggle--on"
                    )}
                    onClick={() => toggleMobileDropdown(link.name)}
                    aria-expanded={activeMobileDropdown === link.name}
                  >
                    <span className="mm__toggle-text">{link.name}</span>
                    <FiChevronDown
                      size={18}
                      className={cn(
                        "mm__chev",
                        activeMobileDropdown === link.name && "mm__chev--open"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "mm__sub",
                      activeMobileDropdown === link.name && "mm__sub--open"
                    )}
                  >
                    {link.dropdown.map((sub, si) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={cn(
                          "mm__sub-link",
                          sub.info && "mm__sub-link--rich",
                          location.pathname === sub.path &&
                            "mm__sub-link--active"
                        )}
                        style={{ "--si": si }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub.flag ? (
                          <span className="mm__sub-flag">
                            {sub.flag.startsWith("http") ||
                            sub.flag.includes("/") ? (
                              <img src={sub.flag} alt={`${sub.name} flag`} />
                            ) : (
                              sub.flag
                            )}
                          </span>
                        ) : (
                          <span className="mm__sub-dot" />
                        )}
                        <div className="mm__sub-text-wrap">
                          <span className="mm__sub-name">{sub.name}</span>
                          {sub.info && (
                            <span className="mm__sub-info">{sub.info}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className={cn(
                    "mm__link",
                    location.pathname === link.path && "mm__link--active"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          <div className="mm__divider" />

          {/* Mobile Auth */}
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
                  openModal("login", { skipNotLoggedInMessage: true });
                }}
              >
                <FiUser size={18} />
                Sign In / Sign Up
              </button>
            )}
          </div>

          {/* Mobile CTA */}
          <Link
            to="/booking"
            className="mm__cta"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span>Book Your Adventure</span>
            <FiArrowRight size={18} />
          </Link>
        </div>
      </aside>
      <AnimatePresence>
        {searchOpen && (
          <motion.div className="nav-search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
            <motion.section className="nav-search-modal" role="dialog" aria-modal="true" aria-label="Search countries and destinations" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .2 }}>
              <div className="nav-search-top"><div><span className="nav-search-eyebrow">DISCOVER ALTUVERA</span><h2>Where would you like to go?</h2></div><button className="nav-search-close" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}><FiX size={20}/></button></div>
              <div className="nav-search-input-wrap"><FiSearch size={19}/><input ref={searchInputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search countries, destinations, places..." aria-label="Search destinations"/>{searchQuery && <button onClick={() => setSearchQuery("")} aria-label="Clear search"><FiX size={17}/></button>}</div>
              {!searchQuery.trim() && <div className="nav-search-quick"><span>Discover</span>{[{label:"Featured",value:"featured"},{label:"Most visited",value:"visited"},{label:"Most searched",value:"searched"}].map(option=><button className={searchSort===option.value?"is-active":""} key={option.value} onClick={()=>setSearchSort(option.value)}>{option.label}</button>)}{["Safari","Wildlife","Nature","Adventure"].map(term=><button key={term} onClick={()=>setSearchQuery(term)}>{term}</button>)}</div>}
              <div className="nav-search-results">
                <div className="nav-search-section"><h3><FiTrendingUp size={16}/> Countries</h3><div className="nav-search-grid">{searchResults.countries.map((item,i)=><button className="nav-search-card nav-search-country" key={item.id || item.slug || item._label+i} onClick={()=>{setSearchOpen(false);navigate(`/country/${getCountrySlug(item)}`)}}>{(item.coverImage || item.cover_image || item.image || item.flagUrl || item.flag_url) && <img src={item.coverImage || item.cover_image || item.image || item.flagUrl || item.flag_url} alt="" loading="lazy"/>}<span><strong>{item._label}</strong><small>{item.region || item.continent || item.capital || "Explore country"}</small></span><FiArrowRight size={16}/></button>)}</div></div>
                <div className="nav-search-section"><h3><FiMapPin size={16}/> Destinations</h3><div className="nav-search-grid nav-search-destinations">{searchResults.destinations.map((item,i)=><button className="nav-search-card nav-search-destination" key={item.id || item.slug || item._label+i} onClick={()=>{setSearchOpen(false);navigate(`/destinations/${item.id || item.slug}`)}}>{(item.image || item.image_url || item.coverImage || item.cover_image || item.thumbnail || item.heroImage) && <img src={item.image || item.image_url || item.coverImage || item.cover_image || item.thumbnail || item.heroImage} alt="" loading="lazy"/>}<span><strong>{item._label}</strong><small>{item.country_name || item.country || item.region || "Explore destination"}</small></span><FiArrowRight size={16}/></button>)}</div></div>
                {!searchResults.countries.length && !searchResults.destinations.length && <p className="nav-search-empty">No matches yet. Try another country or destination.</p>}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;