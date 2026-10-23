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
  FiGlobe,
  FiCompass,
  FiHome,
  FiMap,
  FiInfo,
  FiMail,
  FiBookOpen,
  FiBriefcase,
  FiCreditCard,
  FiUsers,
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import { useUserAuth } from "../../context/UserAuthContext";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import { preloadRoute } from "../../utils/routeUtils";
import { getCountrySlug } from "../../utils/countrySlugMap";
import { useCountries } from "../../hooks/useCountries";
import { useDestinationsList } from "../../hooks/useDestinationsList";
import { adaptDestination } from "../../utils/destinationAdapter";
import ExploreDestinationCard from "./DestinationCard";
import "./Navbar.css";

const cn = (...c) => c.filter(Boolean).join(" ");

const normalizeSearchValue = (value) => String(value ?? "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ")
  .replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

const isSearchTypingTarget = (target) => {
  if (!target) return false;
  const tag = target.tagName?.toLowerCase();
  return target.isContentEditable || ["input", "textarea", "select"].includes(tag);
};

// API country/destination fields can be populated objects; never render them directly.
const safeText = (value, fallback = "") => {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((item) => safeText(item)).filter(Boolean).join(", ") || fallback;
  if (typeof value === "object") {
    const candidate = value.name ?? value.label ?? value.title ?? value.slug ?? value.region ?? value.continent;
    return candidate == null || candidate === value ? fallback : safeText(candidate, fallback);
  }
  return fallback;
};

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
              alt={`${safeText(destination.name, "Destination")} ${i + 1}`}
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
          <span className="srch-card__badge">{safeText(destination.category)}</span>
        )}
      </div>

      {/* Hover overlay with description */}
      <div
        className={cn(
          "srch-card__overlay",
          isHovered && "srch-card__overlay--visible"
        )}
      >
        <h4 className="srch-card__overlay-title">{safeText(destination.name, "Destination")}</h4>
        {destination.country && (
          <p className="srch-card__overlay-loc">
            <FiMapPin size={12} /> {safeText(destination.country)}
          </p>
        )}
        <p className="srch-card__overlay-desc">
          {safeText(destination.description)
            ? safeText(destination.description).slice(0, 120) + "…"
            : safeText(destination.shortDescription) ||
              "Discover this amazing destination"}
        </p>
        <span className="srch-card__overlay-cta">
          View Details <FiArrowRight size={14} />
        </span>
      </div>

      {/* Bottom info bar (always visible) */}
      <div className="srch-card__info">
        <h4 className="srch-card__name">{safeText(destination.name, "Destination")}</h4>
        <div className="srch-card__meta-row">
          {destination.country && (
            <p className="srch-card__location">
              <FiMapPin size={11} /> {safeText(destination.country)}
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
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const mobileProfileRef = useRef(null);
  const mobileAccountModalRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSort, setSearchSort] = useState("featured");
  const [searchResultsView, setSearchResultsView] = useState(false);
  const [searchFiltersOpen, setSearchFiltersOpen] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [visibleSearchResults, setVisibleSearchResults] = useState(20);
  const [visibleCountryResults, setVisibleCountryResults] = useState(20);
  const [recentSearches, setRecentSearches] = useState([]);
  const storyRailRef = useRef(null);
  const searchDialogRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTriggerRef = useRef(null);
  const touchStartRef = useRef(null);
  const [mobileDragX, setMobileDragX] = useState(0);
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites } = useApp();
  const { user, isAuthenticated, authLoading, openModal, logout } =
    useUserAuth();
  const { countries: backendCountries = [], loading: countriesLoading, error: countriesError } = useCountries({ limit: 500 });
  const { data: searchDestinations = [], loading: destinationsLoading, error: destinationsError } = useDestinationsList({ limit: 1000 });
  const searchDataLoading = countriesLoading || destinationsLoading;
  const searchDataError = Boolean(countriesError || destinationsError);

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

  const displaySearchText = (value, fallback = "") => {
    if (value == null) return fallback;
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(item => displaySearchText(item)).filter(Boolean).join(", ") || fallback;
    if (typeof value === "object") {
      const readable = value.name ?? value.title ?? value.label ?? value.slug ?? value.region ?? value.continent;
      return readable == null || readable === value ? fallback : displaySearchText(readable, fallback);
    }
    return fallback;
  };

  const getCountryFlagUrl = (country) => {
    const value = country?.flagUrl || country?.flag_url || country?.flag;
    return typeof value === "string" && /^https?:\/\//i.test(value) ? value : "";
  };

  // Use the same real, admin-managed country photography as the Destinations page.
  const getCountryImageUrl = (country) => {
    const candidates = [
      country?.hero_image_url, country?.heroImageUrl, country?.heroImage,
      country?.hero_image, country?.coverImage, country?.cover_image,
      country?.cover_image_url, country?.image_url, country?.imageUrl,
      country?.image, country?.thumbnail_url, country?.thumbnailUrl,
      ...(Array.isArray(country?.images) ? country.images : []),
      ...(Array.isArray(country?.gallery) ? country.gallery : []),
    ];
    for (const candidate of candidates) {
      const url = typeof candidate === "string"
        ? candidate
        : candidate?.url || candidate?.imageUrl || candidate?.image_url || candidate?.src || candidate?.secure_url;
      if (typeof url === "string" && /^https?:\/\//i.test(url)) return url;
    }
    return "";
  };

  const searchResults = useMemo(() => {
    const query = normalizeSearchValue(searchQuery);
    const mediaKey = /^(?:image|images|gallery|heroImage|heroImages|hero_images|imageUrl|image_url|imageUrls|thumbnailUrl|thumbnail_url|coverImage|cover_image|coverImageUrl|cover_image_url|video|videos|createdAt|updatedAt|__v)$/i;
    const flatten = (value, seen = new WeakSet()) => {
      if (value == null || typeof value === "boolean" || typeof value === "function") return "";
      if (typeof value === "string" || typeof value === "number") return String(value);
      if (typeof value !== "object" || seen.has(value)) return "";
      seen.add(value);
      if (Array.isArray(value)) return value.map(v => flatten(v, seen)).filter(Boolean).join(" ");
      return Object.entries(value).filter(([key]) => !mediaKey.test(key)).map(([key, val]) => key.replace(/[_-]/g, " ") + " " + flatten(val, seen)).filter(Boolean).join(" ");
    };
    const countries = (backendCountries || []).map(country => ({
      ...country, _isCountry: true,
      _label: displaySearchText(country.name || country.title || country.slug, "Country"),
    }));
    const destinations = (searchDestinations || []).map(item => {
      const adapted = { ...adaptDestination(item), ...item };
      const label = displaySearchText(item.name || item.title || item.destination_name || adapted.name, "Destination");
      return {
        ...adapted,
        name: label,
        shortDescription: displaySearchText(item.shortDescription || item.short_description || item.summary || adapted.shortDescription),
        description: displaySearchText(item.description || item.details || item.overview || adapted.description),
        category: displaySearchText(item.category || item.type || item.activityType || adapted.category),
        duration: displaySearchText(item.duration || item.durationText || adapted.duration),
        location: displaySearchText(item.location || item.city || adapted.location),
        region: displaySearchText(item.region || item.region_name || adapted.region),
        countryName: displaySearchText(item.countryName || item.country_name || adapted.countryName),
        countryFlag: displaySearchText(item.countryFlag || item.country_flag || adapted.countryFlag),
        difficulty: displaySearchText(item.difficulty || adapted.difficulty),
        highlights: Array.isArray(item.highlights || item.highlights_list) ? (item.highlights || item.highlights_list).map(value => displaySearchText(value)).filter(Boolean) : [],
        durationDays: Number(item.durationDays || item.duration_days || adapted.durationDays) || undefined,
        minGroupSize: Number(item.minGroupSize || item.min_group_size || adapted.minGroupSize) || undefined,
        maxGroupSize: Number(item.maxGroupSize || item.max_group_size || adapted.maxGroupSize) || undefined,
        _isCountry: false, _label: label,
      };
    });
    const matches = (item) => {
      if (!query) return true;
      const label = normalizeSearchValue(item._label || item.name || item.title);
      const searchable = normalizeSearchValue(flatten(item));
      if (label.includes(query) || searchable.includes(query)) return true;
      const words = query.split(" ").filter(Boolean);
      if (words.length > 1 && words.every(word => searchable.includes(word))) return true;
      if (query.length >= 5 && words.length === 1) {
        return searchable.split(" ").some(word => word.length >= 4 &&
          (word.startsWith(query) || query.startsWith(word) ||
          (Math.abs(word.length - query.length) <= 1 && (() => {
            let differences = 0, i = 0, k = 0;
            while (i < word.length && k < query.length) {
              if (word[i] === query[k]) { i++; k++; continue; }
              differences++;
              if (differences > 1) return false;
              if (word.length > query.length) i++;
              else if (query.length > word.length) k++;
              else { i++; k++; }
            }
            return differences + (i < word.length || k < query.length ? 1 : 0) <= 1;
          })())));
      }
      return false;
    };
    const metric = (item, fields) => fields.reduce((score, field) => score + (Number(item[field]) || 0), 0);
    const rankScore = (item, fields) => {
      const label = normalizeSearchValue(item._label || item.name || item.title);
      const boost = query && label === query ? 100000 : query && label.startsWith(query) ? 10000 : query && label.includes(query) ? 1000 : 0;
      return boost + metric(item, fields);
    };
    const ranked = (items, fields) => [...items].filter(matches).sort((a, b) => rankScore(b, fields) - rankScore(a, fields));
    const countryFields = searchSort === "searched" ? ["search_count", "searchCount", "searches", "views"] : ["featured_score", "is_featured", "featured", "visit_count", "visits", "popularity"];
    const destinationFields = searchSort === "searched" ? ["search_count", "searchCount", "searches", "searches_count"] : searchSort === "visited" ? ["visit_count", "visitCount", "visits", "views", "view_count", "popularity"] : ["featured_score", "is_featured", "featured", "isFeatured", "visit_count", "visits", "rating"];
    const matchedDestinations = ranked(destinations, destinationFields);
    const matchedCountries = ranked(countries, countryFields);
    const countryNames = new Set();
    matchedDestinations.forEach(destination => [destination.country, destination.countryName, destination.country_name, destination.countryObj, destination.country_id, destination.countryId].forEach(value => {
      const text = displaySearchText(value).trim().toLocaleLowerCase();
      if (text) countryNames.add(text);
    }));
    const relatedCountries = query ? countries.filter(country => {
      const name = displaySearchText(country.name || country.title || country.slug).trim().toLocaleLowerCase();
      const slug = displaySearchText(country.slug).trim().toLocaleLowerCase();
      return matchedCountries.some(match => match.id === country.id || match._label === country._label) || countryNames.has(name) || (slug && countryNames.has(slug));
    }).sort((a, b) => metric(b, countryFields) - metric(a, countryFields)) : matchedCountries;
    return { countries: matchedCountries, destinations: matchedDestinations, relatedCountries };
  }, [backendCountries, searchDestinations, searchQuery, searchSort]);

  const rememberSearch = (value) => {
    const term = String(value || "").trim().replace(/\s+/g, " ");
    if (!term) return;
    setRecentSearches(previous => {
      const next = [term, ...previous.filter(item => normalizeSearchValue(item) !== normalizeSearchValue(term))].slice(0, 6);
      try { window.localStorage.setItem("altuvera-recent-searches", JSON.stringify(next)); } catch { /* storage may be unavailable */ }
      return next;
    });
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setDesktopSearchOpen(false);
    setSearchQuery("");
    setSearchResultsView(false);
    setActiveStoryIndex(0);
    setSelectedSuggestionIndex(0);
    setVisibleSearchResults(20);
    setVisibleCountryResults(20);
  };

  const openSearch = (event) => {
    if (event?.currentTarget) searchTriggerRef.current = event.currentTarget;
    setSearchOpen(true);
    setDesktopSearchOpen(false);
  };

  const selectSearchSuggestion = (item) => {
    const term = String(item?._label || "").trim();
    if (!term) return;
    rememberSearch(term);
    if (item?._isCountry) {
      closeSearch();
      navigate("/country/" + getCountrySlug(item));
      return;
    }
    setSearchQuery(term);
    setSearchResultsView(true);
    setSelectedSuggestionIndex(0);
    if (searchInputRef.current) searchInputRef.current.blur();
  };

  const handleSuggestionKeyDown = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const suggestions = Array.from(searchDialogRef.current?.querySelectorAll('[data-search-suggestion="true"]') || []);
    if (!suggestions.length) return;
    const currentIndex = suggestions.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % suggestions.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + suggestions.length) % suggestions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = suggestions.length - 1;
    event.preventDefault();
    suggestions[nextIndex]?.focus();
  };

  const handleSearchInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      searchDialogRef.current?.querySelector('[data-search-suggestion="true"]')?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const suggestions = searchDialogRef.current?.querySelectorAll('[data-search-suggestion="true"]');
      suggestions?.[suggestions.length - 1]?.focus();
    } else if (event.key === "Enter" && searchQuery.trim()) {
      event.preventDefault();
      rememberSearch(searchQuery);
      setSearchResultsView(true);
      searchInputRef.current?.blur();
    }
  };

  const handleStoryRailScroll = useCallback(() => {
    const rail = storyRailRef.current;
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll(".nav-search-story-card"));
    if (!cards.length) return;
    const center = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    let nearest = 0; let nearestDistance = Infinity;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < nearestDistance) { nearestDistance = distance; nearest = index; }
    });
    setActiveStoryIndex(nearest);
  }, []);

  useEffect(() => {
    if (!searchOpen || searchResultsView || searchQuery.trim()) return undefined;
    const frame = requestAnimationFrame(handleStoryRailScroll);
    return () => cancelAnimationFrame(frame);
  }, [searchOpen, searchResultsView, searchQuery, searchResults.destinations.length, handleStoryRailScroll]);


  const navLinks = useMemo(
    () => [
      { name: "Home", path: "/", icon: FiHome },
      { name: "Explore", path: "/explore", icon: FiCompass },
      { name: "Destinations", path: "/destinations", icon: FiMapPin },
      { name: "Interactive Map", path: "/interactive-map", icon: FiMap },
      { name: "Tips", path: "/tips", icon: FiBookOpen },
      {
        name: "About",
        path: "/about",
        icon: FiInfo,
        dropdown: [
          { name: "About Us", path: "/about", icon: FiInfo },
          { name: "Our Services", path: "/services", icon: FiBriefcase },
          { name: "Payment Terms", path: "/payment-terms", icon: FiCreditCard },
          { name: "Our Team", path: "/team", icon: FiUsers },
        ],
      },
      { name: "Contact", path: "/contact", icon: FiMail },
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

  useEffect(() => {
    if (!mobileAccountOpen) return undefined;
    const frame = requestAnimationFrame(() => {
      mobileAccountModalRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      mobileAccountModalRef.current?.focus?.({ preventScroll: true });
    });
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileAccountOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileAccountOpen]);

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
  useEffect(() => { setSearchOpen(false); setDesktopSearchOpen(false); setSearchQuery(""); setSearchResultsView(false); setActiveStoryIndex(0); setSelectedSuggestionIndex(0); }, [location.pathname]);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("altuvera-recent-searches") || "[]");
      if (Array.isArray(saved)) setRecentSearches(saved.filter(item => typeof item === "string").slice(0, 6));
    } catch { setRecentSearches([]); }
  }, []);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    const onDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
        window.requestAnimationFrame(() => searchTriggerRef.current?.focus?.());
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = searchDialogRef.current;
      const focusable = dialog?.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) { event.preventDefault(); dialog?.focus(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onDialogKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onDialogKeyDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    const onGlobalShortcut = (event) => {
      if (searchOpen || isSearchTypingTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); openSearch();
      } else if (event.key === "/" && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault(); openSearch();
      }
    };
    document.addEventListener("keydown", onGlobalShortcut);
    return () => document.removeEventListener("keydown", onGlobalShortcut);
  }, [searchOpen]);
  useEffect(() => {
    const start = e => {
      if (window.innerWidth > 1024 || !e.touches?.length) return;
      const touch = e.touches[0];
      const drawer = document.querySelector(".mm");
      const inDrawer = drawer?.contains(e.target);
      const fromRightEdge = touch.clientX >= window.innerWidth - 36;
      if ((isMobileMenuOpen && inDrawer) || (!isMobileMenuOpen && fromRightEdge)) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, opened: isMobileMenuOpen, horizontal: false };
        setMobileDragX(0);
        setIsDraggingMenu(true);
      } else {
        touchStartRef.current = null;
        setIsDraggingMenu(false);
      }
    };
    const move = e => {
      if (!touchStartRef.current || !e.touches?.length || window.innerWidth > 1024) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      if (!touchStartRef.current.horizontal && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        touchStartRef.current = null;
        setIsDraggingMenu(false);
        setMobileDragX(0);
        return;
      }
      touchStartRef.current.horizontal = true;
      const width = Math.min(400, window.innerWidth * .92);
      const offset = touchStartRef.current.opened ? Math.max(0, Math.min(width, dx)) : Math.max(-width, Math.min(0, dx));
      setMobileDragX(offset);
    };
    const end = e => {
      if (!touchStartRef.current) { setIsDraggingMenu(false); setMobileDragX(0); return; }
      const start = touchStartRef.current;
      const dx = e.changedTouches?.[0]?.clientX - start.x || 0;
      const dy = e.changedTouches?.[0]?.clientY - start.y || 0;
      const horizontal = start.horizontal && Math.abs(dx) > Math.abs(dy) * 1.15;
      touchStartRef.current = null;
      setIsDraggingMenu(false);
      setMobileDragX(0);
      if (!horizontal) return;
      if (start.opened && dx > 70) setIsMobileMenuOpen(false);
      else if (!start.opened && dx < -70) setIsMobileMenuOpen(true);
    };
    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", end, { passive: true });
    document.addEventListener("touchcancel", end, { passive: true });
    return () => {
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
    };
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
                        <div className={cn("nav-search-desktop", desktopSearchOpen && "nav-search-desktop--open")} onMouseEnter={() => { if (window.innerWidth > 760) setDesktopSearchOpen(true); }} onMouseLeave={() => { if (window.innerWidth > 760 && !searchQuery) setDesktopSearchOpen(false); }}>
              <button type="button" className="nav__search-trigger" aria-label="Search destinations and countries" aria-haspopup="dialog" onClick={(event) => { if (window.innerWidth <= 760) openSearch(event); else setDesktopSearchOpen(true); }} onFocus={() => { if (window.innerWidth > 760) setDesktopSearchOpen(true); }}><FiSearch size={19} /></button>
              <input className="nav-search-desktop-input" aria-label="Search destinations and countries" placeholder="Search places..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setDesktopSearchOpen(true)} onKeyDown={e => { if (e.key === "Escape") { setDesktopSearchOpen(false); setSearchQuery(""); } if (e.key === "Enter") setSearchOpen(true); }} />
              {desktopSearchOpen && searchQuery.trim() && <div className="nav-search-desktop-results" role="listbox" aria-label="Search suggestions">{searchResults.countries.slice(0,4).map((item,i)=><button type="button" role="option" aria-label={`Open country ${displaySearchText(item._label,"country")}`} key={item.id || item._label+i} onClick={()=>selectSearchSuggestion(item)}><span className="nav-search-result-icon nav-search-result-icon--country" aria-hidden="true"><FiGlobe size={16}/></span><span className="nav-search-result-name">{displaySearchText(item._label,"Country")}</span><FiArrowRight className="nav-search-result-arrow" size={15} aria-hidden="true"/></button>)}{searchResults.destinations.slice(0,8).map((item,i)=><button type="button" role="option" aria-label={`Open destination ${displaySearchText(item._label,"destination")}`} key={item.id || item._label+i} onClick={()=>selectSearchSuggestion(item)}><span className="nav-search-result-icon nav-search-result-icon--destination" aria-hidden="true"><FiMapPin size={16}/></span><span className="nav-search-result-name">{displaySearchText(item._label,"Destination")}</span><FiArrowRight className="nav-search-result-arrow" size={15} aria-hidden="true"/></button>)}<button className="nav-search-view-all" onClick={()=>selectSearchSuggestion({_label:searchQuery})}>See all matching results <FiArrowRight size={14}/></button></div>}
            </div>
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
                  <span className="nav__link-text">{link.icon && <link.icon className="nav__link-icon" size={15} aria-hidden="true" />}<span>{link.name}</span></span>
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
                          {sub.icon && <span className="nav__dropdown-icon"><sub.icon size={16} aria-hidden="true" /></span>}
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
        className={cn("mm", isMobileMenuOpen && "mm--open", isDraggingMenu && "mm--dragging")}
        style={isDraggingMenu ? { transform: `translateX(calc(${isMobileMenuOpen ? "0%" : "100%"} + ${mobileDragX}px))`, transition: "none", touchAction: "pan-y" } : undefined}
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
          <button type="button" className="mm__search-link" onClick={(event) => { setIsMobileMenuOpen(false); openSearch(event); }}><FiSearch size={19}/><span>Search destinations & countries</span><FiArrowRight size={17}/></button>
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
                    <span className="mm__toggle-text">{link.icon && <link.icon className="mm__nav-icon" size={19} aria-hidden="true" />}<span>{link.name}</span></span>
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
                        {sub.icon && <span className="mm__sub-icon"><sub.icon size={17} aria-hidden="true" /></span>}
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
                  {link.icon && <link.icon className="mm__nav-icon" size={19} aria-hidden="true" />}
                  <span>{link.name}</span>
                </Link>
              )}
            </div>
          ))}

          <div className="mm__divider" />

          {/* Mobile Auth */}
          <div className="mm__auth">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  ref={mobileProfileRef}
                  className={cn("mm__profile", mobileAccountOpen && "mm__profile--open")}
                  onClick={() => setMobileAccountOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={mobileAccountOpen}
                  aria-controls="mm-account-modal"
                >
                  <span className="mm__profile-avatar-frame">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="mm__pav-img"
                        onLoad={() => setAvatarLoaded(true)}
                        onError={() => setAvatarLoaded(true)}
                      />
                    ) : (
                      <span className="mm__pav-init">{getInitials()}</span>
                    )}
                    <span className="mm__avatar-glow" aria-hidden="true" />
                    <span className="mm__avatar-edit-mark" aria-hidden="true"><FiUser size={13} /></span>
                  </span>
                  <span className="mm__profile-copy">
                    <span className="mm__pname">{displayName}</span>
                    <span className="mm__pemail">{user?.email}</span>
                    <span className="mm__pprov">{providerLabel} account</span>
                  </span>
                  <span className="mm__profile-open-indicator"><FiChevronDown size={17} /></span>
                </button>
                <AnimatePresence>
                  {mobileAccountOpen && (
                    <motion.div
                      className="mm__account-overlay"
                      role="presentation"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={(event) => {
                        if (event.target === event.currentTarget) setMobileAccountOpen(false);
                      }}
                    >
                      <motion.section
                        id="mm-account-modal"
                        ref={mobileAccountModalRef}
                        className="mm__account-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mm-account-modal-title"
                        initial={{ opacity: 0, y: 28, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                      >
                        <div className="mm__account-modal-top">
                          <span className="mm__account-modal-kicker">YOUR ACCOUNT</span>
                          <button type="button" className="mm__account-modal-close" onClick={() => setMobileAccountOpen(false)} aria-label="Close account menu">
                            <FiX size={21} />
                          </button>
                        </div>
                        <div className="mm__account-hero">
                          <span className="mm__account-avatar-wrap">
                            {user?.avatar ? (
                              <img src={user.avatar} alt="" className="mm__account-avatar" />
                            ) : (
                              <span className="mm__account-avatar mm__account-avatar--initials">{getInitials()}</span>
                            )}
                            <span className="mm__account-avatar-ring" aria-hidden="true" />
                            <span className="mm__account-online" aria-hidden="true" />
                          </span>
                          <div className="mm__account-hero-copy">
                            <h3 id="mm-account-modal-title">{displayName}</h3>
                            <p>{user?.email}</p>
                            <span className="mm__account-provider"><FiUser size={12} /> {providerLabel} account</span>
                          </div>
                        </div>
                        <div className="mm__account-modal-links">
                          {userMenuItems.map((m, mi) => (
                            <Link
                              key={m.to}
                              to={m.to}
                              className="mm__account-modal-link"
                              style={{ "--account-i": mi }}
                              onClick={() => { setIsMobileMenuOpen(false); setMobileAccountOpen(false); }}
                            >
                              <span className="mm__account-modal-icon"><m.icon size={19} /></span>
                              <span>{m.label}</span>
                              <FiChevronRight size={17} className="mm__account-modal-arrow" />
                            </Link>
                          ))}
                        </div>
                        <button className="mm__account-modal-signout" onClick={() => { setMobileAccountOpen(false); handleLogout(); }}>
                          <FiLogOut size={18} /> Sign Out
                        </button>
                        <p className="mm__account-modal-foot">Your journeys, all in one place.</p>
                      </motion.section>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          <motion.div className="nav-search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) closeSearch(); }}>
            <motion.section ref={searchDialogRef} className="nav-search-modal" role="dialog" aria-modal="true" aria-labelledby="nav-search-dialog-title" aria-describedby="nav-search-dialog-description" tabIndex={-1} initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .2 }}>
              <div className="nav-search-top"><div><span className="nav-search-eyebrow">DISCOVER ALTUVERA</span><h2 id="nav-search-dialog-title">Where would you like to go?</h2><p id="nav-search-dialog-description" className="nav-search-dialog-description">Find countries, destinations, and experiences across East Africa.</p></div><button type="button" className="nav-search-close" aria-label="Close search" onClick={() => { closeSearch(); window.requestAnimationFrame(() => searchTriggerRef.current?.focus?.()); }}><FiX size={20}/></button></div>
              <div className="nav-search-input-wrap"><FiSearch size={19} aria-hidden="true"/><input ref={searchInputRef} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchResultsView(false); setSelectedSuggestionIndex(0); setVisibleSearchResults(20); setVisibleCountryResults(20); }} onKeyDown={handleSearchInputKeyDown} placeholder="Search countries, destinations, activities..." aria-label="Search destinations" aria-controls="nav-search-results" aria-autocomplete="list"/>{searchQuery && <button type="button" onClick={() => { setSearchQuery(""); setSearchResultsView(false); searchInputRef.current?.focus(); }} aria-label="Clear search"><FiX size={17}/></button>}</div>
              <div className="nav-search-filter-shell">
                <button type="button" className="nav-search-filter-toggle" aria-expanded={searchFiltersOpen} onClick={() => setSearchFiltersOpen(open => !open)}>
                  <span className="nav-search-filter-toggle__icon"><FiTrendingUp size={15}/></span>
                  <span><strong>Discovery filters</strong><small>Sort and explore by interest</small></span>
                  <FiChevronDown className={searchFiltersOpen ? "is-open" : ""} size={17}/>
                </button>
                <AnimatePresence initial={false}>
                  {searchFiltersOpen && (
                    <motion.div className="nav-search-quick nav-search-filter-panel" initial={{height:0,opacity:0,y:-6}} animate={{height:"auto",opacity:1,y:0}} exit={{height:0,opacity:0,y:-6}} transition={{duration:.24,ease:[.22,1,.36,1]}}>
                      <div className="nav-search-filter-sort" role="group" aria-label="Sort discovery results">
                        {[{label:"Featured",value:"featured"},{label:"Most visited",value:"visited"},{label:"Most searched",value:"searched"}].map(option=><button type="button" aria-pressed={searchSort===option.value} className={searchSort===option.value?"is-active":""} key={option.value} onClick={()=>setSearchSort(option.value)}>{option.label}</button>)}
                      </div>
                      <div className="nav-search-filter-tags" role="group" aria-label="Popular searches">
                        {["Safari","Wildlife","Nature","Adventure","Gorilla trekking","Culture"].map(term=><button type="button" key={term} onClick={()=>{setSearchQuery(term);setSearchResultsView(true);rememberSearch(term);}}>{term}<FiArrowRight size={12}/></button>)}
                      </div>
                      <button type="button" className="nav-search-reset" onClick={()=>{setSearchSort("featured");setSearchQuery("");setSearchResultsView(false);}}> <FiX size={13}/> Reset filters & search</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="nav-search-results" id="nav-search-results" aria-live="polite" aria-busy={searchDataLoading ? "true" : "false"}>
                {searchQuery.trim() && !searchResultsView ? <>
                  {searchDataLoading && !searchResults.countries.length && !searchResults.destinations.length ? <div className="nav-search-loading" role="status"><span className="nav-search-spinner"/><span>Finding your next adventure…</span></div> : <>
                    <div className="nav-search-suggestion-group"><span className="nav-search-suggestion-label"><FiGlobe size={13}/> Countries <span className="nav-search-result-count">{searchResults.countries.length}</span></span><div className="nav-search-inline" role="listbox" aria-label="Matching countries">{searchResults.countries.slice(0,8).map((item,i)=><button type="button" role="option" aria-label={`Open country ${displaySearchText(item._label,"country")}`} aria-selected={selectedSuggestionIndex===i} data-search-suggestion="true" key={item.id || item.slug || item._label+i} onFocus={()=>setSelectedSuggestionIndex(i)} onKeyDown={handleSuggestionKeyDown} onClick={()=>selectSearchSuggestion(item)}><span className="nav-search-result-icon nav-search-result-icon--country" aria-hidden="true"><FiGlobe size={15}/></span><span className="nav-search-result-name">{displaySearchText(item._label,"Country")}</span><FiArrowRight className="nav-search-result-arrow" size={14} aria-hidden="true"/></button>)}</div></div>
                    <div className="nav-search-suggestion-group"><span className="nav-search-suggestion-label"><FiMapPin size={13}/> Destinations <span className="nav-search-result-count">{searchResults.destinations.length}</span></span><div className="nav-search-inline" role="listbox" aria-label="Matching destinations">{searchResults.destinations.slice(0,12).map((item,i)=><button type="button" role="option" aria-label={`Open destination ${displaySearchText(item._label,"destination")}`} aria-selected={selectedSuggestionIndex===i+searchResults.countries.slice(0,8).length} data-search-suggestion="true" key={item.id || item.slug || item._label+i} onFocus={()=>setSelectedSuggestionIndex(i+searchResults.countries.slice(0,8).length)} onKeyDown={handleSuggestionKeyDown} onClick={()=>selectSearchSuggestion(item)}><span className="nav-search-result-icon nav-search-result-icon--destination" aria-hidden="true"><FiMapPin size={15}/></span><span className="nav-search-result-name">{displaySearchText(item._label,"Destination")}</span><FiArrowRight className="nav-search-result-arrow" size={14} aria-hidden="true"/></button>)}</div></div>
                    {!searchResults.countries.length && !searchResults.destinations.length && <div className="nav-search-empty-state"><p className="nav-search-empty" role="status">{searchDataError ? "Search data could not be loaded. Check your connection and try again." : "No suggestions found. Try another name, activity, or destination."}</p><div className="nav-search-empty-actions">{["Wildlife","Nature","Adventure"].map(term=><button type="button" key={term} onClick={()=>{setSearchQuery(term);setSearchResultsView(false);setSelectedSuggestionIndex(0);rememberSearch(term);}}>{term}<FiArrowRight size={12}/></button>)}</div></div>}
                    <button type="button" className="nav-search-view-all" onClick={()=>{rememberSearch(searchQuery);setSearchResultsView(true);}}>View all matching results <FiArrowRight size={14}/></button>
                  </>}
                </> : searchResultsView ? <>
                  <div className="nav-search-results-summary" role="status" aria-live="polite"><span><strong>{searchResults.destinations.length}</strong> destination{searchResults.destinations.length===1?"":"s"} <span aria-hidden="true">·</span> <strong>{searchResults.relatedCountries.length}</strong> related countr{searchResults.relatedCountries.length===1?"y":"ies"}</span><button type="button" className="nav-search-back" onClick={()=>{setSearchResultsView(false);searchInputRef.current?.focus();}}>← Edit search</button></div>
                  <h3 className="nav-search-section-title">Destinations matching “{searchQuery}”</h3>
                  <div className="nav-search-destination-grid">{searchResults.destinations.slice(0,visibleSearchResults).map((item,i)=><div className="nav-search-explore-card" key={item.id||item._id||item.slug||item._label+i}><ExploreDestinationCard destination={item}/></div>)}</div>
                  {searchResults.destinations.length > visibleSearchResults && <button type="button" className="nav-search-view-all" onClick={()=>setVisibleSearchResults(count=>count+20)}>Load 20 more destinations <FiArrowRight size={14}/></button>}
                  {!searchResults.destinations.length && <p className="nav-search-empty">No matching destinations found. Try a broader search.</p>}
                  <h3 className="nav-search-section-title">Related countries</h3>
                  <div className="nav-search-country-grid">{searchResults.relatedCountries.slice(0,visibleCountryResults).map((item,i)=><button type="button" className="nav-search-country-card nav-search-country-card--photo" style={{ "--country-index": i }} key={item.id||item.slug||item._label+i} onClick={()=>{closeSearch();navigate(`/country/${getCountrySlug(item)}`);}}><span className="nav-search-country-photo">{getCountryImageUrl(item) ? <img src={getCountryImageUrl(item)} alt="" loading="lazy" onError={e=>{e.currentTarget.style.visibility="hidden";e.currentTarget.parentElement?.classList.add("has-image-error");}}/> : <span className="nav-search-country-photo-placeholder"><FiGlobe size={34}/></span>}<span className="nav-search-country-photo-shade"/></span><span className="nav-search-country-flag">{getCountryFlagUrl(item) ? <img src={getCountryFlagUrl(item)} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/> : <FiGlobe/>}</span>{(item.destinationsCount ?? item.destinations_count ?? item.destinationCount) > 0 && <span className="nav-search-country-count">{item.destinationsCount ?? item.destinations_count ?? item.destinationCount} destinations</span>}<span className="nav-search-country-copy"><strong>{displaySearchText(item._label,"Country")}</strong><small>{displaySearchText(item.region||item.continent,"Explore country")}</small>{(item.emotional_description || item.description) && <span className="nav-search-country-description">{displaySearchText(item.emotional_description || item.description).slice(0,110)}</span>}<span className="nav-search-country-cta">Explore {displaySearchText(item._label,"country")} <FiArrowRight size={13}/></span></span></button>)}</div>
                  {searchResults.relatedCountries.length > visibleCountryResults && <button type="button" className="nav-search-view-all" onClick={()=>setVisibleCountryResults(count=>count+20)}>Load 20 more countries <FiArrowRight size={14}/></button>}
                </> : <>
                  {recentSearches.length > 0 && <div className="nav-search-recent-group"><div className="nav-search-recent-heading"><span><FiClock size={13}/> Recent searches</span><button type="button" onClick={()=>{setRecentSearches([]);try{window.localStorage.removeItem("altuvera-recent-searches");}catch{ /* storage may be unavailable */ }}}>Clear history</button></div><div className="nav-search-inline">{recentSearches.map((term,i)=><button type="button" key={term + "-" + i} aria-label={`Search again for ${term}`} onClick={()=>{setSearchQuery(term);setSearchResultsView(true);setSelectedSuggestionIndex(0);rememberSearch(term);}}><FiClock size={12}/><span className="nav-search-recent-term">{term}</span><FiArrowRight size={12} aria-hidden="true"/></button>)}</div></div>}
                  <div className="nav-search-story-heading"><span className="nav-search-suggestion-label">DESTINATION STORIES</span><small>Swipe to explore</small></div>
                  <div className="nav-search-story-rail" ref={storyRailRef} onScroll={handleStoryRailScroll}>{searchResults.destinations.slice(0,20).map((item,i)=>{const rawImage=item.heroImage||item.hero_image||item.imageUrl||item.image_url||item.thumbnailUrl||item.coverImageUrl||item.cover_image_url||item.coverImage||item.images?.[0]||item.gallery?.[0]||item.heroImages?.[0]||item.hero_images?.[0];const img=typeof rawImage==="string"?rawImage:(rawImage?.url||rawImage?.imageUrl||rawImage?.image_url||rawImage?.src||"");return <button type="button" className={`nav-search-story-card${i===activeStoryIndex?" is-active":""}`} style={{ "--story-index": i }} key={item.id||item._id||item.slug||item._label+i} onClick={()=>selectSearchSuggestion(item)}>{img?<img src={img} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/>:<span className="nav-search-story-placeholder"><FiMapPin/></span>}<span className="nav-search-story-float"><FiCompass/></span><strong>{displaySearchText(item._label,"Destination")}</strong></button>;})}</div>
                  <div className="nav-search-story-heading"><span className="nav-search-suggestion-label"><FiGlobe size={13}/> COUNTRIES</span><small>Featured places</small></div>
                  <div className="nav-search-country-rail" tabIndex={0} aria-label="Countries carousel"><div className="nav-search-country-track">{[...searchResults.countries,...searchResults.countries,...searchResults.countries].map((item,i)=><button type="button" className="nav-search-country-card nav-search-country-card--photo" style={{ "--country-index": i }} key={(item.id||item.slug||item._label)+i} onClick={()=>{closeSearch();navigate(`/country/${getCountrySlug(item)}`);}}><span className="nav-search-country-photo">{getCountryImageUrl(item) ? <img src={getCountryImageUrl(item)} alt="" loading="lazy" onError={e=>{e.currentTarget.style.visibility="hidden";e.currentTarget.parentElement?.classList.add("has-image-error");}}/> : <span className="nav-search-country-photo-placeholder"><FiGlobe size={34}/></span>}<span className="nav-search-country-photo-shade"/></span><span className="nav-search-country-flag">{getCountryFlagUrl(item) ? <img src={getCountryFlagUrl(item)} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/> : <FiGlobe/>}</span>{(item.destinationsCount ?? item.destinations_count ?? item.destinationCount) > 0 && <span className="nav-search-country-count">{item.destinationsCount ?? item.destinations_count ?? item.destinationCount} destinations</span>}<span className="nav-search-country-copy"><strong>{displaySearchText(item._label,"Country")}</strong><small>{displaySearchText(item.region||item.continent,"Explore country")}</small>{(item.emotional_description || item.description) && <span className="nav-search-country-description">{displaySearchText(item.emotional_description || item.description).slice(0,110)}</span>}<span className="nav-search-country-cta">Explore {displaySearchText(item._label,"country")} <FiArrowRight size={13}/></span></span></button>)}</div></div>
                  <h3 className="nav-search-section-title">Explore destinations</h3>
                  <div className="nav-search-destination-grid">{searchResults.destinations.slice(0,20).map((item,i)=><div className="nav-search-explore-card" key={item.id||item._id||item.slug||item._label+i}><ExploreDestinationCard destination={item}/></div>)}</div>
                </>}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;