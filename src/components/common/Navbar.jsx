// src/components/common/Navbar.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import { getAllDestinations } from "../../data/destinations";
import { preloadRoute } from "../../utils/routeUtils";
import { useCountries } from "../../hooks/useCountries";

const cn = (...c) => c.filter(Boolean).join(" ");

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites } = useApp();
  const { user, isAuthenticated, authLoading, openModal, logout } =
    useUserAuth();
  const { countries: backendCountries } = useCountries({ limit: 12 });

  const headerRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownTimer = useRef(null);
  const searchAbortRef = useRef(null);
  const latestSearchRef = useRef("");
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
            c.tagline ||
            c.region ||
            c.capital ||
            c.continent ||
            c.subRegion ||
            c.shortDescription ||
            (c.description ? `${c.description.slice(0, 60)}…` : ""),
          path: `/country/${c.slug || c.id || c.name.toLowerCase()}`,
        })
      );
    }
    return items;
  }, [backendCountries]);

  const navLinks = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Explore", path: "/explore" },
      {
        name: "Destinations",
        path: "/destinations",
        dropdown: destinationsDropdown,
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
    [destinationsDropdown]
  );

  const userMenuItems = useMemo(() => {
    const items = [
      { to: "/profile", icon: FiUser, label: "My Profile" },
      { to: "/my-bookings", icon: FiCalendar, label: "My Bookings" },
      { to: "/wishlist", icon: FiHeart, label: "Wishlist" },
      { to: "/settings", icon: FiSettings, label: "Settings" },
    ];
    if (user?.role === "admin" || user?.role === "manager")
      items.push({
        to: "/admin/dashboard",
        icon: FiSettings,
        label: "Admin Dashboard",
      });
    return items;
  }, [user?.role]);

  // ── Scroll handler ────────────────────────────────────────────────────
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

  // ── Search logic ──────────────────────────────────────────────────────
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
    const norm = (v) => {
      if (typeof v === "string") return v;
      if (!v) return "";
      if (typeof v === "object")
        return v.name || v.countryName || v.location || v.slug || "";
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
    const ql = q.toLowerCase();
    const local = localDestinations
      .filter((d) => {
        const n = (d?.name || "").toLowerCase();
        const ds = (d?.description || "").toLowerCase();
        const co = norm(d?.country).toLowerCase();
        const lo = (d?.location || "").toLowerCase();
        return (
          n.includes(ql) ||
          ds.includes(ql) ||
          co.includes(ql) ||
          lo.includes(ql)
        );
      })
      .sort((a, b) => {
        const as = (a?.name || "").toLowerCase().startsWith(ql) ? 1 : 0;
        const bs = (b?.name || "").toLowerCase().startsWith(ql) ? 1 : 0;
        return as !== bs
          ? bs - as
          : (a?.name || "").localeCompare(b?.name || "");
      })
      .slice(0, 6)
      .map(toR);
    setSearchResults(local);
    const tid = setTimeout(async () => {
      setIsSearching(true);
      const ctrl = new AbortController();
      searchAbortRef.current = ctrl;
      try {
        const res = await fetch(
          `${API_URL}/search?q=${encodeURIComponent(q)}&limit=10`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        if (latestSearchRef.current !== q) return;
        const remote = (data?.data || []).map(toR);
        const m = new Map();
        for (const i of local) m.set(key(i), i);
        for (const i of remote) m.set(key(i), i);
        setSearchResults(Array.from(m.values()).slice(0, 10));
      } catch {
        /* abort */
      } finally {
        if (latestSearchRef.current === q) setIsSearching(false);
      }
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
      if (headerRef.current && !headerRef.current.contains(e.target))
        setActiveDropdown(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────
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
    [searchValue, navigate]
  );
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

  // ════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav
        ref={headerRef}
        role="navigation"
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] will-change-transform",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled
            ? "py-2 bg-white/[0.96] backdrop-blur-[24px] [backdrop-filter:blur(24px)_saturate(1.4)] shadow-[0_1px_0_rgba(16,185,129,0.08),0_8px_30px_rgba(5,150,105,0.08)]"
            : "py-4 bg-transparent",
          navHidden
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100 pointer-events-auto"
        )}
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-[clamp(14px,3vw,28px)] max-lg:justify-between">
          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            to="/"
            aria-label="Altuvera Home"
            className="group relative flex flex-shrink-0 items-center gap-3 no-underline transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.03] active:scale-[0.98]"
          >
            {/* glow */}
            <div className="pointer-events-none absolute left-7 top-1/2 h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16)_0%,transparent_72%)] opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100" />

            <div
              className={cn(
                "relative flex flex-shrink-0 items-center justify-center transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                isScrolled ? "h-12 w-12" : "h-[52px] w-[52px]",
                "max-[860px]:h-12 max-[860px]:w-12",
                "max-[640px]:h-11 max-[640px]:w-11",
                "max-[480px]:h-10 max-[480px]:w-10",
                "max-[380px]:h-[38px] max-[380px]:w-[38px]",
                "max-[320px]:h-9 max-[320px]:w-9"
              )}
            >
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                draggable={false}
                className={cn(
                  "relative z-[1] h-full w-full border-none object-contain outline-none",
                  "transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                  isScrolled
                    ? "drop-shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                    : "drop-shadow-[0_8px_18px_rgba(0,0,0,0.14)]",
                  "group-hover:-translate-y-px group-hover:scale-[1.03]",
                  isScrolled
                    ? "group-hover:drop-shadow-[0_6px_16px_rgba(5,150,105,0.14)]"
                    : "group-hover:drop-shadow-[0_10px_22px_rgba(5,150,105,0.18)]"
                )}
              />
            </div>

            <span
              className={cn(
                "whitespace-nowrap font-['Playfair_Display',serif] text-[clamp(24px,2.5vw,32px)] font-extrabold tracking-[-0.8px]",
                "transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                isScrolled
                  ? "text-gray-900 [text-shadow:none]"
                  : "text-white [text-shadow:0_3px_15px_rgba(0,0,0,0.3)]",
                "max-[860px]:hidden"
              )}
            >
              Altuvera
            </span>
          </Link>

          {/* ── Desktop Nav Links ──────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 max-lg:hidden">
            {navLinks.map((link, i) => (
              <div
                key={link.name}
                className="nav-item-anim relative"
                style={{ "--i": i }}
                onMouseEnter={() =>
                  link.dropdown && handleDropdownEnter(link.name)
                }
                onMouseLeave={handleDropdownLeave}
              >
                {/* ── Nav Link ─────────────────────────────────────────── */}
                <Link
                  to={link.path}
                  onClick={(e) => handleDesktopClick(e, link)}
                  onDoubleClick={(e) => handleDesktopDblClick(e, link)}
                  onMouseEnter={() => preloadRoute(link.path)}
                  aria-expanded={
                    link.dropdown
                      ? activeDropdown === link.name
                      : undefined
                  }
                  className={cn(
                    // Base
                    "group/link relative inline-flex items-center gap-1 overflow-hidden rounded-lg",
                    "px-[13px] py-[9px] text-[15px] font-medium no-underline whitespace-nowrap",
                    "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "hover:-translate-y-px active:scale-[0.97]",

                    // Responsive font sizes
                    "max-xl:text-sm max-xl:px-2.5 max-xl:py-2",
                    "max-[1180px]:text-[13px] max-[1180px]:px-2",

                    // ── Transparent state (not scrolled) ──
                    !isScrolled && [
                      "text-white",
                      "hover:bg-white/[0.18]",
                      isActive(link) && "bg-white/[0.16]",
                    ],

                    // ── Scrolled state ──
                    isScrolled && [
                      "text-gray-900",
                      "hover:bg-[rgba(5,150,105,0.1)] hover:text-emerald-600",
                      isActive(link) &&
                        "bg-[rgba(5,150,105,0.1)] text-emerald-600",
                    ]
                  )}
                >
                  {/* Link text */}
                  <span className="relative z-[1]">{link.name}</span>

                  {/* Chevron for dropdowns */}
                  {link.dropdown && (
                    <FiChevronDown
                      size={14}
                      className={cn(
                        "relative z-[1] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                        activeDropdown === link.name && "rotate-180"
                      )}
                    />
                  )}

                  {/* ── Active / hover underline ─── */}
                  <span
                    className={cn(
                      "absolute bottom-1 left-3 right-3 h-[2.5px] rounded-full",
                      "bg-gradient-to-r from-emerald-600 to-emerald-500",
                      "origin-right scale-x-0",
                      "transition-transform duration-[350ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      "group-hover/link:origin-left group-hover/link:scale-x-100",
                      isActive(link) && "!origin-left !scale-x-100"
                    )}
                  />

                  {/* ── Shine sweep ─── */}
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-0 -left-full",
                      "bg-gradient-to-r from-transparent via-white/15 to-transparent",
                      "group-hover/link:left-full",
                      "group-hover/link:transition-[left] group-hover/link:duration-600 group-hover/link:ease-linear"
                    )}
                  />
                </Link>

                {/* ── Desktop Dropdown ──────────────────────────────────── */}
                {link.dropdown && (
                  <div
                    className={cn(
                      "absolute left-1/2 top-[calc(100%+8px)] z-[100] min-w-[240px] -translate-x-1/2",
                      "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      activeDropdown === link.name
                        ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none invisible -translate-y-2 scale-95 opacity-0"
                    )}
                  >
                    <div className="overflow-hidden rounded-2xl border border-[#dcfce7] bg-white/[0.98] p-2.5 shadow-[0_20px_50px_rgba(6,78,59,0.15),0_0_0_1px_rgba(16,185,129,0.06)] backdrop-blur-[20px]">
                      {link.dropdown.map((sub, si) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setActiveDropdown(null)}
                          className={cn(
                            "group/sub flex items-center gap-3 rounded-md px-4 py-2.5 text-[0.95rem] font-medium text-gray-900 no-underline",
                            "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                            "hover:bg-[rgba(5,150,105,0.08)] hover:text-emerald-600",
                            sub.info && "items-start py-3",
                            activeDropdown === link.name
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-2.5 opacity-0"
                          )}
                          style={{
                            transitionDelay:
                              activeDropdown === link.name
                                ? `${si * 50}ms`
                                : "0ms",
                          }}
                        >
                          {sub.flag ? (
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[1.1rem]">
                              {sub.flag.startsWith("http") ||
                              sub.flag.includes("/") ? (
                                <img
                                  src={sub.flag}
                                  alt={`${sub.name} flag`}
                                  className="h-full w-full rounded-full object-cover shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                                />
                              ) : (
                                sub.flag
                              )}
                            </span>
                          ) : (
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-40 transition-all duration-200 group-hover/sub:scale-[1.3] group-hover/sub:opacity-100" />
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span>{sub.name}</span>
                            {sub.info && (
                              <span className="text-xs text-gray-500">
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

          {/* ── Actions ────────────────────────────────────────────────── */}
          <div className="flex flex-shrink-0 items-center gap-2 max-lg:hidden">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={cn(
                "relative inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-none",
                "transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                "hover:scale-[1.08] active:scale-[0.94]",
                isScrolled
                  ? "bg-[rgba(5,150,105,0.1)] text-emerald-600 shadow-[0_4px_12px_rgba(5,150,105,0.1)]"
                  : "bg-white/[0.18] text-white shadow-[0_6px_14px_rgba(2,44,34,0.1)]"
              )}
            >
              <FiSearch size={19} />
            </button>

            {/* Favorites */}
            <Link to="/gallery" className="flex no-underline">
              <span
                role="button"
                aria-label="Favorites"
                className={cn(
                  "relative inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center overflow-hidden rounded-xl",
                  "transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                  "hover:scale-[1.08] active:scale-[0.94]",
                  isScrolled
                    ? "bg-[rgba(5,150,105,0.1)] text-emerald-600 shadow-[0_4px_12px_rgba(5,150,105,0.1)]"
                    : "bg-white/[0.18] text-white shadow-[0_6px_14px_rgba(2,44,34,0.1)]"
                )}
              >
                <FiHeart size={19} />
                {favorites.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-[badgePop_0.4s_ease-[cubic-bezier(0.175,0.885,0.32,1.275)]] items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.4)]">
                    {favorites.length}
                  </span>
                )}
              </span>
            </Link>

            {/* Auth */}
            {authLoading ? (
              <span
                className={cn(
                  "h-10 w-20 animate-[skelPulse_1.4s_ease_infinite] rounded-full",
                  isScrolled
                    ? "bg-[rgba(5,150,105,0.1)]"
                    : "bg-white/15"
                )}
              />
            ) : isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3",
                    "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "hover:-translate-y-px",
                    isScrolled
                      ? "border-[1.5px] border-emerald-500/[0.22] bg-[rgba(5,150,105,0.08)] shadow-[0_10px_22px_rgba(5,150,105,0.12)] hover:border-emerald-600 hover:shadow-[0_14px_28px_rgba(5,150,105,0.18)]"
                      : "border-[1.5px] border-white/[0.35] bg-white/15 shadow-[0_10px_22px_rgba(5,150,105,0.12)] hover:border-white/60 hover:shadow-[0_14px_28px_rgba(5,150,105,0.18)]"
                  )}
                >
                  {user?.avatar ? (
                    <span className="relative h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full">
                      {!avatarLoaded && (
                        <span className="absolute inset-0 z-[2] grid place-items-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent" />
                        </span>
                      )}
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)}
                      />
                    </span>
                  ) : (
                    <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 text-[13px] font-bold text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.5),0_4px_10px_rgba(6,78,59,0.2)]">
                      {getInitials()}
                    </span>
                  )}

                  <span
                    className={cn(
                      "flex max-w-[110px] flex-col overflow-hidden text-ellipsis whitespace-nowrap leading-[1.15] max-[1180px]:hidden",
                      isScrolled ? "text-gray-900" : "text-white"
                    )}
                  >
                    <span className="text-[13px] font-semibold">
                      {displayName}
                    </span>
                    <small
                      className={cn(
                        "mt-px text-[10px] font-bold uppercase tracking-[0.04em]",
                        isScrolled ? "text-gray-500" : "text-white/80"
                      )}
                    >
                      {user?.role === "admin"
                        ? "Administrator"
                        : user?.role === "manager"
                          ? "Manager"
                          : "Traveler"}
                    </small>
                  </span>

                  <FiChevronDown
                    className={cn(
                      "text-sm transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      isScrolled ? "text-gray-400" : "text-white/70",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* User dropdown */}
                <div
                  className={cn(
                    "absolute right-0 top-[calc(100%+10px)] z-[9999] w-[260px] overflow-hidden rounded-2xl",
                    "border border-[#d9f6e7] bg-gradient-to-b from-white/[0.99] to-[rgba(249,255,252,0.98)]",
                    "shadow-[0_24px_60px_rgba(6,78,59,0.18)]",
                    "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                    userMenuOpen
                      ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none invisible -translate-y-2.5 scale-[0.96] opacity-0"
                  )}
                >
                  <div className="border-b border-[#f0fdf4] px-4 pb-3 pt-3.5">
                    <div className="flex items-center gap-2.5">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 text-sm font-bold text-white">
                          {getInitials()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-sm font-semibold text-gray-900">
                          {displayName}
                        </p>
                        <p className="m-0 mt-0.5 truncate text-xs text-gray-400">
                          {user?.email}
                        </p>
                        <span className="mt-2 inline-flex rounded-full border border-[#97e9c0] bg-gradient-to-br from-green-50 to-green-100 px-2.5 py-[3px] text-[11px] font-bold text-green-800">
                          {user?.isVerified
                            ? "✓ Verified"
                            : providerLabel}{" "}
                          account
                        </span>
                      </div>
                    </div>
                  </div>
                  {userMenuItems.map((m, mi) => (
                    <Link
                      key={m.to}
                      to={m.to}
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-[11px] text-sm text-gray-600 no-underline",
                        "transition-all duration-200",
                        "hover:bg-emerald-50 hover:pl-5 hover:text-emerald-600",
                        userMenuOpen
                          ? "animate-[dropIn_0.3s_ease-[cubic-bezier(0.4,0,0.2,1)]_forwards]"
                          : "-translate-x-1.5 opacity-0"
                      )}
                      style={{
                        animationDelay: userMenuOpen
                          ? `${mi * 40 + 100}ms`
                          : "0ms",
                      }}
                    >
                      <m.icon size={16} />
                      {m.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2.5 border-t border-gray-100 bg-transparent px-4 py-[11px] text-sm text-red-600 transition-colors duration-200 hover:bg-red-50"
                  >
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openModal("login")}
                className="relative cursor-pointer overflow-hidden rounded-xl border-none bg-gradient-to-br from-emerald-600 to-emerald-500 px-5 py-[9px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(5,150,105,0.35)] active:scale-[0.96]"
              >
                Sign In
              </button>
            )}

            {/* CTA */}
            <Link
              to="/booking"
              className="group/cta relative inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 px-5 py-[10px] text-sm font-semibold text-white no-underline shadow-[0_4px_15px_rgba(5,150,105,0.3)] transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-0.5 hover:gap-2.5 hover:shadow-[0_8px_24px_rgba(5,150,105,0.35)] active:scale-[0.96]"
            >
              <span>Book Now</span>
              <svg
                className="transition-transform duration-200 group-hover/cta:translate-x-[3px]"
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

          {/* ── Hamburger ──────────────────────────────────────────────── */}
          <button
            onClick={() => setIsMobileMenuOpen((p) => !p)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className={cn(
              "relative hidden h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-[14px] border-none p-0 [-webkit-tap-highlight-color:transparent]",
              "transition-all duration-200 hover:scale-[1.05] active:scale-[0.93]",
              "lg:!hidden max-lg:!flex",
              "max-[640px]:h-11 max-[640px]:w-11 max-[640px]:rounded-xl",
              "max-[480px]:h-[42px] max-[480px]:w-[42px] max-[480px]:rounded-[10px]",
              "max-[380px]:h-10 max-[380px]:w-10",
              "max-[320px]:h-[38px] max-[320px]:w-[38px] max-[320px]:rounded-lg",
              isScrolled ? "bg-[rgba(5,150,105,0.1)]" : "bg-white/[0.18]"
            )}
          >
            <span className="pointer-events-none flex h-full w-full flex-col items-center justify-center">
              <span
                className={cn(
                  "block h-[2.5px] w-[22px] rounded-full transition-all duration-[450ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-center",
                  "max-[640px]:w-5 max-[380px]:w-[18px] max-[380px]:h-0.5 max-[320px]:w-4",
                  isScrolled ? "bg-emerald-600" : "bg-white",
                  isMobileMenuOpen
                    ? "translate-y-[2.5px] rotate-45 !w-6 max-[380px]:translate-y-0.5 max-[320px]:translate-y-[1.5px]"
                    : "-translate-y-1 max-[380px]:-translate-y-[3.5px] max-[320px]:-translate-y-[3px]"
                )}
              />
              <span
                className={cn(
                  "block h-[2.5px] w-4 rounded-full transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "max-[380px]:h-0.5 max-[320px]:w-4",
                  isScrolled ? "bg-emerald-600" : "bg-white",
                  isMobileMenuOpen && "w-0 opacity-0 translate-x-2.5"
                )}
              />
              <span
                className={cn(
                  "block h-[2.5px] w-[22px] rounded-full transition-all duration-[450ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-center",
                  "max-[640px]:w-5 max-[380px]:w-[18px] max-[380px]:h-0.5 max-[320px]:w-4",
                  isScrolled ? "bg-emerald-600" : "bg-white",
                  isMobileMenuOpen
                    ? "-translate-y-[2.5px] -rotate-45 !w-6 max-[380px]:-translate-y-0.5 max-[320px]:-translate-y-[1.5px]"
                    : "translate-y-1 max-[380px]:translate-y-[3.5px] max-[320px]:translate-y-[3px]"
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* ── SEARCH OVERLAY ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[2005] flex items-start justify-center bg-[rgba(2,44,34,0.88)] pt-[min(20vh,170px)] backdrop-blur-[8px]",
          "transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          "max-[640px]:pt-[min(14vh,120px)]",
          searchOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
        onClick={() => setSearchOpen(false)}
      >
        <div
          className={cn(
            "w-full max-w-[660px] px-5",
            "transition-transform duration-[450ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
            "max-[640px]:px-3.5 max-[320px]:px-2.5",
            searchOpen
              ? "translate-y-0 scale-100"
              : "translate-y-5 scale-[0.97]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <FiSearch
              className="pointer-events-none absolute left-5 text-emerald-600"
              size={22}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search destinations, experiences..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={cn(
                "w-full rounded-[18px] border-2 border-emerald-300 bg-white py-[22px] pl-[54px] pr-[60px]",
                "font-['Poppins',sans-serif] text-[17px] outline-none",
                "transition-all duration-200",
                "focus:border-emerald-600 focus:shadow-[0_0_0_5px_rgba(5,150,105,0.1)]",
                "max-[640px]:rounded-2xl max-[640px]:py-[18px] max-[640px]:pl-12 max-[640px]:pr-[52px] max-[640px]:text-base",
                "max-[320px]:py-4 max-[320px]:pl-11 max-[320px]:pr-12 max-[320px]:text-[15px]"
              )}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-[18px] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-gray-100 text-[13px] text-gray-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600"
              >
                ✕
              </button>
            )}
          </form>

          <div className="mt-4 max-h-[55vh] overflow-y-auto [scrollbar-color:theme(colors.emerald.600)_transparent] [scrollbar-width:thin]">
            {isSearching && (
              <p className="flex items-center justify-center gap-2.5 p-[18px] text-center font-medium text-white/80">
                <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-emerald-500" />
                Searching…
              </p>
            )}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2">
                {searchResults.map((r, ri) => (
                  <Link
                    key={r.id || ri}
                    to={`/destination/${r.slug || r.id}`}
                    onClick={() => setSearchOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 rounded-xl border border-white/[0.08] p-3 no-underline",
                      "animate-[srchIn_0.35s_ease_forwards] translate-y-2 opacity-0",
                      "transition-all duration-200",
                      "hover:translate-x-1 hover:border-emerald-600 hover:bg-white/10",
                      "max-[640px]:gap-3 max-[640px]:p-2.5"
                    )}
                    style={{ animationDelay: `${ri * 60}ms` }}
                  >
                    <img
                      src={
                        r.heroImage ||
                        "https://placehold.co/80x80/059669/ffffff?text=Altuvera"
                      }
                      alt=""
                      className="h-[52px] w-[52px] flex-shrink-0 rounded-[10px] object-cover max-[640px]:h-[46px] max-[640px]:w-[46px]"
                    />
                    <div>
                      <p className="m-0 text-[15px] font-semibold text-white">
                        {r.name}
                      </p>
                      <p className="m-0 mt-0.5 text-[13px] text-white/60">
                        {r.country} · {r.category || "Destination"}
                        {r.duration && <span> · {r.duration}</span>}
                        {r.price && <span> · From ${r.price}</span>}
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/destinations?search=${encodeURIComponent(searchValue)}`}
                  onClick={() => setSearchOpen(false)}
                  className="mt-2 block border-t border-white/[0.08] p-3.5 text-center text-sm font-bold text-emerald-500 no-underline transition-colors duration-200 hover:text-emerald-400"
                >
                  View all results for &ldquo;{searchValue}&rdquo;
                </Link>
              </div>
            )}
            {!isSearching &&
              searchValue.trim().length >= 2 &&
              searchResults.length === 0 && (
                <p className="p-[18px] text-center font-medium text-white/80">
                  No destinations found.
                </p>
              )}
          </div>
        </div>

        <button
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
          className={cn(
            "absolute right-5 top-5 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/[0.12] text-xl text-white",
            "transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
            "hover:rotate-90 hover:scale-110 hover:bg-white/25",
            "max-[480px]:right-3.5 max-[480px]:top-3.5 max-[480px]:h-[42px] max-[480px]:w-[42px]"
          )}
        >
          ✕
        </button>
      </div>

      {/* ── BACKDROP ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[1001] bg-[rgba(2,44,34,0.45)] backdrop-blur-[4px]",
          "transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          isMobileMenuOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ── MOBILE MENU ─────────────────────────────────────────────────── */}
      <aside
        aria-hidden={!isMobileMenuOpen}
        className={cn(
          "fixed bottom-0 right-0 top-0 z-[1002] flex flex-col overflow-hidden bg-white",
          "w-[min(400px,92vw)] max-[640px]:w-screen max-[640px]:rounded-none",
          "shadow-[-10px_0_50px_rgba(6,78,59,0.12)]",
          "transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-[105%]"
        )}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-[18px] py-3.5">
          <Link
            to="/"
            className="flex items-center gap-3 no-underline"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className={cn(
                "flex flex-shrink-0 items-center justify-center bg-transparent",
                "h-[46px] w-[46px]",
                "max-[640px]:h-[42px] max-[640px]:w-[42px]",
                "max-[380px]:h-[38px] max-[380px]:w-[38px]",
                "max-[320px]:h-9 max-[320px]:w-9"
              )}
            >
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                className="h-full w-full border-none object-contain outline-none drop-shadow-[0_4px_10px_rgba(5,150,105,0.16)]"
              />
            </div>
            <span
              className={cn(
                "whitespace-nowrap font-['Playfair_Display',serif] text-2xl font-bold text-emerald-600",
                "max-[640px]:text-[22px]",
                "max-[380px]:text-xl",
                "max-[320px]:text-lg"
              )}
            >
              Altuvera
            </span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border-none bg-[rgba(5,150,105,0.1)] transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:rotate-90 hover:bg-[rgba(5,150,105,0.15)]"
          >
            <span className="text-lg font-bold leading-none text-emerald-600">
              ✕
            </span>
          </button>
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
            "px-[18px] pb-[calc(28px+env(safe-area-inset-bottom,0px))] pt-2",
            "max-[640px]:px-4",
            "max-[380px]:px-3.5",
            "max-[320px]:px-3"
          )}
        >
          {navLinks.map((link, idx) => (
            <div
              key={link.name}
              className={cn(
                "border-b border-gray-100",
                isMobileMenuOpen
                  ? "animate-[mmSlideIn_0.5s_ease_forwards]"
                  : "translate-x-[30px] opacity-0"
              )}
              style={{
                animationDelay: isMobileMenuOpen
                  ? `${idx * 60 + 150}ms`
                  : "0ms",
              }}
            >
              {link.dropdown ? (
                <>
                  <button
                    onClick={() => toggleMobileDropdown(link.name)}
                    aria-expanded={activeMobileDropdown === link.name}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-1 py-4 text-left font-['Playfair_Display',serif] text-lg font-bold",
                      "transition-colors duration-200",
                      "max-[480px]:text-[17px] max-[480px]:py-3.5",
                      "max-[320px]:text-base max-[320px]:py-3",
                      activeMobileDropdown === link.name
                        ? "text-emerald-600"
                        : "text-gray-900"
                    )}
                  >
                    <span>{link.name}</span>
                    <FiChevronDown
                      size={18}
                      className={cn(
                        "transition-transform duration-[350ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                        activeMobileDropdown === link.name && "rotate-180"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid gap-0.5 overflow-hidden rounded-[14px] border bg-transparent px-2",
                      "transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                      activeMobileDropdown === link.name
                        ? "my-1 mb-2.5 max-h-[500px] translate-y-0 border-green-200 bg-[#f8fffc] py-2.5 opacity-100 shadow-[0_6px_24px_rgba(5,150,105,0.08)]"
                        : "my-0 max-h-0 -translate-y-1.5 border-transparent py-0 opacity-0"
                    )}
                  >
                    {link.dropdown.map((sub, si) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-[0.95rem] text-gray-500 no-underline",
                          "transition-all duration-200",
                          "hover:bg-[rgba(5,150,105,0.08)] hover:pl-4 hover:text-emerald-600",
                          "max-[480px]:text-[15px] max-[320px]:text-sm",
                          sub.info && "items-start py-3",
                          location.pathname === sub.path &&
                            "bg-[rgba(5,150,105,0.1)] text-emerald-700",
                          activeMobileDropdown === link.name &&
                            "animate-[subIn_0.35s_ease_forwards]"
                        )}
                        style={{
                          animationDelay:
                            activeMobileDropdown === link.name
                              ? `${si * 50 + 80}ms`
                              : "0ms",
                        }}
                      >
                        {sub.flag ? (
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[1.1rem]">
                            {sub.flag.startsWith("http") ||
                            sub.flag.includes("/") ? (
                              <img
                                src={sub.flag}
                                alt={`${sub.name} flag`}
                                className="h-full w-full rounded-full object-cover shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                              />
                            ) : (
                              sub.flag
                            )}
                          </span>
                        ) : (
                          <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-emerald-600 opacity-[0.35] transition-all duration-200" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span>{sub.name}</span>
                          {sub.info && (
                            <span className="text-xs text-gray-400">
                              {sub.info}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "group/ml relative flex items-center px-1 py-4 font-['Playfair_Display',serif] text-lg font-bold text-gray-900 no-underline",
                    "transition-all duration-200",
                    "hover:pl-3.5 hover:text-emerald-600",
                    "max-[480px]:text-[17px] max-[480px]:py-3.5",
                    "max-[320px]:text-base max-[320px]:py-3",
                    location.pathname === link.path &&
                      "pl-3.5 text-emerald-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded bg-gradient-to-b from-emerald-600 to-emerald-500",
                      "transition-all duration-[250ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      location.pathname === link.path
                        ? "h-[60%]"
                        : "h-0 group-hover/ml:h-[60%]"
                    )}
                  />
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          {/* Divider */}
          <div
            className={cn(
              "my-3 h-0.5 rounded-full bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-0",
              isMobileMenuOpen &&
                "animate-[divIn_0.6s_ease_0.5s_forwards]"
            )}
          />

          {/* Auth */}
          <div className="pt-3">
            {isAuthenticated ? (
              <>
                <div className="mb-3.5 flex items-center gap-3">
                  {user?.avatar ? (
                    <span className="relative h-[46px] w-[46px] flex-shrink-0 overflow-hidden rounded-full">
                      {!avatarLoaded && (
                        <span className="absolute inset-0 z-[2] grid place-items-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent" />
                        </span>
                      )}
                      <img
                        src={user.avatar}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)}
                      />
                    </span>
                  ) : (
                    <span className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 text-base font-bold text-white">
                      {getInitials()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="m-0 font-['Playfair_Display',serif] text-[17px] font-bold text-gray-900">
                      {displayName}
                    </p>
                    <p className="m-0 mt-0.5 max-w-[200px] truncate text-[13px] text-gray-400">
                      {user?.email}
                    </p>
                    <p className="m-0 mt-1 text-xs font-semibold text-emerald-700">
                      {providerLabel} account
                    </p>
                  </div>
                </div>

                {userMenuItems.map((m) => (
                  <Link
                    key={m.to}
                    to={m.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 border-b border-gray-100 px-1 py-3 text-base font-semibold text-gray-700 no-underline",
                      "transition-all duration-200",
                      "hover:pl-2 hover:text-emerald-600",
                      "max-[480px]:text-[15px] max-[320px]:text-sm"
                    )}
                  >
                    <m.icon size={18} /> {m.label}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className={cn(
                    "mt-1.5 flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-1 py-3 text-base font-semibold text-red-600",
                    "transition-opacity duration-200 hover:opacity-70",
                    "max-[480px]:text-[15px] max-[320px]:text-sm"
                  )}
                >
                  <FiLogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openModal("login");
                }}
                className="w-full cursor-pointer rounded-xl border-none bg-emerald-600 px-3.5 py-3.5 text-base font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(5,150,105,0.35)] active:scale-[0.97]"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>

          {/* Mobile CTA */}
          <Link
            to="/booking"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 px-[22px] py-3.5 text-base font-semibold text-white no-underline",
              "shadow-[0_4px_15px_rgba(5,150,105,0.3)]",
              "transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
              "hover:-translate-y-0.5 hover:gap-3 hover:shadow-[0_8px_24px_rgba(5,150,105,0.35)] active:scale-[0.97]",
              "max-[480px]:text-[15px] max-[480px]:py-[13px] max-[480px]:px-[18px]",
              "max-[320px]:text-sm max-[320px]:py-3 max-[320px]:px-4"
            )}
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

      {/* ── Keyframes ───────────────────────────────────────────────────── */}
      <style>{`
        @keyframes navLinkIn {
          from { opacity: 0; transform: translateY(-10px) }
          to   { opacity: 1; transform: none }
        }
        .nav-item-anim {
          animation: navLinkIn 0.6s cubic-bezier(0.4,0,0.2,1) calc(var(--i) * 0.06s) both;
        }
        @keyframes badgePop {
          from { transform: scale(0) }
          to   { transform: scale(1) }
        }
        @keyframes skelPulse {
          0%, 100% { opacity: 0.4 }
          50%      { opacity: 0.8 }
        }
        @keyframes dropIn {
          to { opacity: 1; transform: none }
        }
        @keyframes srchIn {
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes mmSlideIn {
          0%   { opacity: 0; transform: translateX(40px) }
          60%  { opacity: 1 }
          100% { opacity: 1; transform: none }
        }
        @keyframes subIn {
          to { opacity: 1; transform: none }
        }
        @keyframes divIn {
          to { opacity: 1 }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;