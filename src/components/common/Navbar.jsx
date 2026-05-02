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

  // ── Scroll: transparent→white, hide on scroll down, show on scroll up ──
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY = lastScrollYRef.current;

        // Transparent at top, white when scrolled
        setIsScrolled(currentY > 20);

        // Hide/show logic: only after scrolling past 80px
        if (currentY > 80) {
          if (currentY > lastY + 5) {
            // Scrolling DOWN → hide
            setNavHidden(true);
          } else if (currentY < lastY - 5) {
            // Scrolling UP → show
            setNavHidden(false);
          }
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

          // Transparent at top → glass white on scroll
          isScrolled
            ? "py-2 bg-white/[0.92] backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(5,150,105,0.06)] border-b border-white/60"
            : "py-3.5 bg-transparent border-b border-transparent",

          // Hide on scroll down, show on scroll up
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
            className="group relative flex flex-shrink-0 items-center gap-3 no-underline transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute left-7 top-1/2 h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,transparent_72%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div
              className={cn(
                "relative flex flex-shrink-0 items-center justify-center transition-all duration-500",
                isScrolled ? "h-10 w-10" : "h-12 w-12",
                "max-[640px]:h-10 max-[640px]:w-10",
                "max-[380px]:h-9 max-[380px]:w-9"
              )}
            >
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                draggable={false}
                className={cn(
                  "relative z-[1] h-full w-full object-contain transition-all duration-500",
                  isScrolled
                    ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    : "drop-shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
                  "group-hover:-translate-y-0.5 group-hover:scale-[1.05]"
                )}
              />
            </div>

            <span
              className={cn(
                "whitespace-nowrap font-['Playfair_Display',serif] font-extrabold tracking-[-0.8px] transition-all duration-500",
                isScrolled
                  ? "text-[clamp(20px,2vw,26px)] text-gray-900"
                  : "text-[clamp(24px,2.5vw,32px)] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.25)]",
                "max-[860px]:hidden"
              )}
            >
              Altuvera
            </span>
          </Link>

          {/* ── Desktop Nav Links ──────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 max-lg:hidden">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
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
                  aria-expanded={
                    link.dropdown
                      ? activeDropdown === link.name
                      : undefined
                  }
                  className={cn(
                    "group/link relative inline-flex items-center gap-1 overflow-hidden rounded-lg px-3 py-2 text-[15px] font-medium no-underline whitespace-nowrap",
                    "transition-all duration-300 hover:-translate-y-px active:scale-[0.97]",
                    "max-xl:text-sm max-xl:px-2.5 max-[1180px]:text-[13px] max-[1180px]:px-2",
                    // Color depends on scroll state
                    isScrolled
                      ? cn(
                          "text-gray-700 hover:bg-emerald-600/10 hover:text-emerald-600",
                          isActive(link) &&
                            "bg-emerald-600/10 text-emerald-600"
                        )
                      : cn(
                          "text-white/90 hover:bg-white/15 hover:text-white",
                          isActive(link) && "bg-white/15 text-white"
                        )
                  )}
                >
                  <span>{link.name}</span>
                  {link.dropdown && (
                    <FiChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                        activeDropdown === link.name && "rotate-180"
                      )}
                    />
                  )}
                  {/* underline */}
                  <span
                    className={cn(
                      "absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full",
                      "origin-right scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      "group-hover/link:origin-left group-hover/link:scale-x-100",
                      isActive(link) && "!origin-left !scale-x-100",
                      isScrolled
                        ? "bg-emerald-600"
                        : "bg-white"
                    )}
                  />
                  {/* shine */}
                  <span className="pointer-events-none absolute inset-0 -left-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/link:left-full group-hover/link:transition-[left] group-hover/link:duration-700" />
                </Link>

                {/* Dropdown */}
                {link.dropdown && (
                  <div
                    className={cn(
                      "absolute left-1/2 top-[calc(100%+8px)] z-[100] min-w-[240px] -translate-x-1/2",
                      "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      activeDropdown === link.name
                        ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none invisible -translate-y-3 scale-[0.92] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden rounded-2xl border border-green-100/80 bg-white/[0.98] p-2.5 shadow-[0_20px_50px_rgba(6,78,59,0.12),0_0_0_1px_rgba(16,185,129,0.04)] backdrop-blur-xl">
                      {link.dropdown.map((sub, si) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setActiveDropdown(null)}
                          className={cn(
                            "group/sub flex items-center gap-3 rounded-lg px-4 py-2.5 text-[0.95rem] font-medium text-gray-700 no-underline",
                            "transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600",
                            sub.info && "items-start py-3",
                            activeDropdown === link.name
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-3 opacity-0"
                          )}
                          style={{
                            transitionDelay:
                              activeDropdown === link.name
                                ? `${si * 40}ms`
                                : "0ms",
                          }}
                        >
                          {sub.flag ? (
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-lg">
                              {sub.flag.startsWith("http") ||
                              sub.flag.includes("/") ? (
                                <img
                                  src={sub.flag}
                                  alt={`${sub.name} flag`}
                                  className="h-full w-full rounded-full object-cover shadow-sm"
                                />
                              ) : (
                                sub.flag
                              )}
                            </span>
                          ) : (
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500 opacity-40 transition-all duration-200 group-hover/sub:scale-150 group-hover/sub:opacity-100" />
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span>{sub.name}</span>
                            {sub.info && (
                              <span className="text-xs text-gray-400 group-hover/sub:text-emerald-500/70">
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
                "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-none transition-all duration-300 hover:scale-110 active:scale-95",
                isScrolled
                  ? "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                  : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              <FiSearch size={18} />
            </button>

            {/* Favorites */}
            <Link to="/gallery" className="flex no-underline">
              <span
                role="button"
                aria-label="Favorites"
                className={cn(
                  "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95",
                  isScrolled
                    ? "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                    : "bg-white/15 text-white hover:bg-white/25"
                )}
              >
                <FiHeart size={18} />
                {favorites.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] animate-[badgePop_0.4s_ease] items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.4)] ring-2 ring-white">
                    {favorites.length}
                  </span>
                )}
              </span>
            </Link>

            {/* Auth */}
            {authLoading ? (
              <span
                className={cn(
                  "h-9 w-20 animate-pulse rounded-full",
                  isScrolled ? "bg-gray-100" : "bg-white/15"
                )}
              />
            ) : isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-all duration-300 hover:-translate-y-px",
                    isScrolled
                      ? "border border-gray-200 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md"
                      : "border border-white/25 bg-white/15 backdrop-blur-sm hover:border-white/50 hover:bg-white/25"
                  )}
                >
                  {user?.avatar ? (
                    <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                      {!avatarLoaded && (
                        <span className="absolute inset-0 z-[2] grid place-items-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent" />
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
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-bold text-white">
                      {getInitials()}
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex max-w-[100px] flex-col overflow-hidden text-ellipsis whitespace-nowrap leading-tight max-[1180px]:hidden",
                      isScrolled ? "text-gray-800" : "text-white"
                    )}
                  >
                    <span className="text-[13px] font-semibold">
                      {displayName}
                    </span>
                    <small
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        isScrolled ? "text-gray-400" : "text-white/60"
                      )}
                    >
                      {user?.role === "admin"
                        ? "Admin"
                        : user?.role === "manager"
                          ? "Manager"
                          : "Traveler"}
                    </small>
                  </span>
                  <FiChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      isScrolled ? "text-gray-400" : "text-white/60",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* User Dropdown */}
                <div
                  className={cn(
                    "absolute right-0 top-[calc(100%+8px)] z-[9999] w-[260px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
                    "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                    userMenuOpen
                      ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none invisible -translate-y-3 scale-[0.95] opacity-0"
                  )}
                >
                  <div className="border-b border-gray-50 px-4 pb-3 pt-3.5">
                    <div className="flex items-center gap-2.5">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-emerald-100"
                        />
                      ) : (
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
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
                        <span className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-px text-[10px] font-bold text-emerald-700">
                          {user?.isVerified
                            ? "✓ Verified"
                            : providerLabel}{" "}
                          account
                        </span>
                      </div>
                    </div>
                  </div>
                  {userMenuItems.map((m) => (
                    <Link
                      key={m.to}
                      to={m.to}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 no-underline transition-all duration-200 hover:bg-emerald-50 hover:pl-5 hover:text-emerald-600"
                    >
                      <m.icon size={16} />
                      {m.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2.5 border-t border-gray-100 bg-transparent px-4 py-2.5 text-sm text-red-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openModal("login")}
                className={cn(
                  "cursor-pointer rounded-xl border-none px-5 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.96]",
                  isScrolled
                    ? "bg-emerald-600 text-white shadow-[0_4px_14px_rgba(5,150,105,0.25)] hover:bg-emerald-700 hover:shadow-[0_6px_20px_rgba(5,150,105,0.3)]"
                    : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                )}
              >
                Sign In
              </button>
            )}

            {/* CTA */}
            <Link
              to="/booking"
              className="group/cta inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:gap-2.5 hover:shadow-[0_8px_24px_rgba(5,150,105,0.35)] active:scale-[0.96]"
            >
              <span>Book Now</span>
              <svg
                className="transition-transform duration-300 group-hover/cta:translate-x-[3px]"
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
              "relative hidden h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl border-none p-0 [-webkit-tap-highlight-color:transparent]",
              "transition-all duration-300 hover:scale-105 active:scale-90",
              "lg:!hidden max-lg:!flex",
              "max-[380px]:h-10 max-[380px]:w-10 max-[380px]:rounded-lg",
              isScrolled
                ? "bg-gray-100 text-gray-700"
                : "bg-white/15 text-white backdrop-blur-sm"
            )}
          >
            <span className="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-[5px]">
              <span
                className={cn(
                  "block h-[2px] rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                  isScrolled ? "bg-gray-700" : "bg-white",
                  isMobileMenuOpen
                    ? "w-5 translate-y-[7px] rotate-45"
                    : "w-5"
                )}
              />
              <span
                className={cn(
                  "block h-[2px] rounded-full transition-all duration-300",
                  isScrolled ? "bg-gray-700" : "bg-white",
                  isMobileMenuOpen
                    ? "w-0 opacity-0"
                    : "w-3.5 opacity-100"
                )}
              />
              <span
                className={cn(
                  "block h-[2px] rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                  isScrolled ? "bg-gray-700" : "bg-white",
                  isMobileMenuOpen
                    ? "w-5 -translate-y-[7px] -rotate-45"
                    : "w-5"
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* ── SEARCH OVERLAY ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[2005] flex items-start justify-center bg-black/60 pt-[min(18vh,160px)] backdrop-blur-md",
          "transition-all duration-400",
          "max-[640px]:pt-[min(12vh,100px)]",
          searchOpen ? "visible opacity-100" : "invisible opacity-0"
        )}
        onClick={() => setSearchOpen(false)}
      >
        <div
          className={cn(
            "w-full max-w-[640px] px-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "max-[640px]:px-4 max-[320px]:px-3",
            searchOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-95 opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center"
          >
            <FiSearch
              className="pointer-events-none absolute left-5 text-emerald-600"
              size={20}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search destinations, experiences..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-2xl border-2 border-emerald-200 bg-white py-4 pl-13 pr-14 text-base font-medium outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.1)] max-[640px]:py-3.5 max-[640px]:text-[15px]"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-gray-100 text-xs text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </form>

          <div className="mt-3 max-h-[50vh] overflow-y-auto rounded-2xl [scrollbar-width:thin]">
            {isSearching && (
              <p className="flex items-center justify-center gap-2 py-6 text-center text-sm font-medium text-white/80">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-emerald-400" />
                Searching…
              </p>
            )}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {searchResults.map((r, ri) => (
                  <Link
                    key={r.id || ri}
                    to={`/destination/${r.slug || r.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex animate-[srchIn_0.35s_ease_forwards] items-center gap-3 rounded-xl bg-white/[0.08] p-3 opacity-0 no-underline ring-1 ring-white/[0.06] transition-all duration-200 hover:bg-white/15 hover:ring-emerald-500/30 max-[640px]:p-2.5"
                    style={{ animationDelay: `${ri * 50}ms` }}
                  >
                    <img
                      src={
                        r.heroImage ||
                        "https://placehold.co/80x80/059669/ffffff?text=Altuvera"
                      }
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover max-[640px]:h-10 max-[640px]:w-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-semibold text-white">
                        {r.name}
                      </p>
                      <p className="m-0 mt-0.5 truncate text-xs text-white/50">
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
                  className="mt-1 block rounded-xl bg-white/[0.05] p-3 text-center text-sm font-semibold text-emerald-400 no-underline transition-colors duration-200 hover:bg-white/10 hover:text-emerald-300"
                >
                  View all results for &ldquo;{searchValue}&rdquo;
                </Link>
              </div>
            )}
            {!isSearching &&
              searchValue.trim().length >= 2 &&
              searchResults.length === 0 && (
                <p className="py-6 text-center text-sm font-medium text-white/60">
                  No destinations found.
                </p>
              )}
          </div>
        </div>

        <button
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
          className="absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-lg text-white transition-all duration-300 hover:rotate-90 hover:scale-110 hover:bg-white/20 max-[480px]:right-3 max-[480px]:top-3 max-[480px]:h-10 max-[480px]:w-10"
        >
          ✕
        </button>
      </div>

      {/* ── BACKDROP ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[1001] bg-black/40 backdrop-blur-sm transition-all duration-400",
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
          "fixed bottom-0 right-0 top-0 z-[1002] flex w-[min(380px,90vw)] flex-col overflow-hidden bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)]",
          "transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          "max-[640px]:w-screen",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center max-[380px]:h-9 max-[380px]:w-9">
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-['Playfair_Display',serif] text-xl font-bold text-emerald-600 max-[380px]:text-lg">
              Altuvera
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-gray-100 text-gray-500 transition-all duration-300 hover:rotate-90 hover:bg-red-50 hover:text-red-500"
          >
            <span className="text-base font-medium leading-none">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-2 max-[380px]:px-4">
          {navLinks.map((link, idx) => (
            <div
              key={link.name}
              className={cn(
                "border-b border-gray-50",
                isMobileMenuOpen
                  ? "animate-[mmSlideIn_0.5s_ease_forwards]"
                  : "translate-x-8 opacity-0"
              )}
              style={{
                animationDelay: isMobileMenuOpen
                  ? `${idx * 50 + 100}ms`
                  : "0ms",
              }}
            >
              {link.dropdown ? (
                <>
                  <button
                    onClick={() => toggleMobileDropdown(link.name)}
                    aria-expanded={
                      activeMobileDropdown === link.name
                    }
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-0 py-3.5 text-left text-base font-semibold transition-colors duration-200",
                      activeMobileDropdown === link.name
                        ? "text-emerald-600"
                        : "text-gray-800"
                    )}
                  >
                    <span>{link.name}</span>
                    <FiChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                        activeMobileDropdown === link.name &&
                          "rotate-180"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid overflow-hidden rounded-xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      activeMobileDropdown === link.name
                        ? "mb-3 max-h-[500px] border border-emerald-100 bg-emerald-50/50 p-2 opacity-100"
                        : "max-h-0 border-transparent p-0 opacity-0"
                    )}
                  >
                    {link.dropdown.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-600 no-underline transition-all duration-200",
                          "hover:bg-emerald-100/60 hover:text-emerald-600",
                          sub.info && "items-start",
                          location.pathname === sub.path &&
                            "bg-emerald-100/80 font-medium text-emerald-700"
                        )}
                      >
                        {sub.flag ? (
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-base">
                            {sub.flag.startsWith("http") ||
                            sub.flag.includes("/") ? (
                              <img
                                src={sub.flag}
                                alt={`${sub.name} flag`}
                                className="h-full w-full rounded-full object-cover shadow-sm"
                              />
                            ) : (
                              sub.flag
                            )}
                          </span>
                        ) : (
                          <span className="h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500/40" />
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
                    "group/ml relative flex items-center px-0 py-3.5 text-base font-semibold text-gray-800 no-underline transition-all duration-200",
                    "hover:text-emerald-600",
                    location.pathname === link.path &&
                      "text-emerald-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-0 w-[3px] -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                      "group-hover/ml:h-5",
                      location.pathname === link.path && "!h-5"
                    )}
                  />
                  <span className="transition-transform duration-200 group-hover/ml:translate-x-2">
                    {link.name}
                  </span>
                </Link>
              )}
            </div>
          ))}

          {/* Divider */}
          <div
            className={cn(
              "my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0",
              isMobileMenuOpen &&
                "animate-[divIn_0.5s_ease_0.5s_forwards]"
            )}
          />

          {/* Auth section */}
          <div className="pt-1">
            {isAuthenticated ? (
              <>
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  {user?.avatar ? (
                    <span className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-100">
                      {!avatarLoaded && (
                        <span className="absolute inset-0 z-[2] grid place-items-center rounded-full bg-emerald-50">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent" />
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
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
                      {getInitials()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-semibold text-gray-900">
                      {displayName}
                    </p>
                    <p className="m-0 mt-0.5 truncate text-xs text-gray-400">
                      {user?.email}
                    </p>
                    <p className="m-0 mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                      {providerLabel} account
                    </p>
                  </div>
                </div>

                {userMenuItems.map((m) => (
                  <Link
                    key={m.to}
                    to={m.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group/mi flex items-center gap-2.5 border-b border-gray-50 px-0 py-3 text-sm font-medium text-gray-600 no-underline transition-all duration-200 hover:text-emerald-600"
                  >
                    <m.icon
                      size={16}
                      className="transition-transform duration-200 group-hover/mi:scale-110"
                    />{" "}
                    <span className="transition-transform duration-200 group-hover/mi:translate-x-1">
                      {m.label}
                    </span>
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className="mt-2 flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-0 py-3 text-sm font-medium text-red-500 transition-colors duration-200 hover:text-red-600"
                >
                  <FiLogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openModal("login");
                }}
                className="w-full cursor-pointer rounded-xl border-none bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(5,150,105,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_8px_20px_rgba(5,150,105,0.3)] active:scale-[0.97]"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>

          {/* Mobile CTA */}
          <Link
            to="/booking"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(5,150,105,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:gap-3 hover:shadow-[0_8px_24px_rgba(5,150,105,0.3)] active:scale-[0.97]"
          >
            Book Your Adventure
            <svg
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
      </aside>

      {/* ── Keyframes ───────────────────────────────────────────────────── */}
      <style>{`
        @keyframes badgePop { from { transform: scale(0) } to { transform: scale(1) } }
        @keyframes srchIn { to { opacity: 1; transform: translateY(0) } }
        @keyframes mmSlideIn {
          0% { opacity: 0; transform: translateX(40px) }
          60% { opacity: 1 }
          100% { opacity: 1; transform: none }
        }
        @keyframes divIn { to { opacity: 1 } }
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