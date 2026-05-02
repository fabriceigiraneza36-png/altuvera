// src/pages/Destinations.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiX,
  FiWifiOff,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiMapPin,
  FiSliders,
  FiColumns,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import DestinationCard from "../components/destinations/DestinationCard";
import { useCountries } from "../hooks/useCountries";
import {
  useDestinations,
  useCountryDestinations,
} from "../hooks/useDestinations";

/* ═══════════════════════════════════════════════════════
   KEYFRAMES + RESPONSIVE CSS
═══════════════════════════════════════════════════════ */
const GLOBAL_STYLES = `
  @keyframes skeletonPulse {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  /* ── Responsive grid: 1→2→3 columns ── */
  .dest-grid {
    display: grid;
    gap: 20px;
    align-items: start;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .dest-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
  }
  @media (min-width: 1024px) {
    .dest-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
  }
  .dest-grid.view-list {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  /* ── Responsive filter panel ── */
  .dest-filters-panel {
    padding: 22px 20px;
  }
  @media (min-width: 640px) {
    .dest-filters-panel { padding: 26px 28px; }
  }
  @media (min-width: 1024px) {
    .dest-filters-panel { padding: 30px 36px; }
  }

  /* ── Responsive page section ── */
  .dest-page-section {
    padding: 28px 16px 80px;
  }
  @media (min-width: 640px) {
    .dest-page-section { padding: 36px 24px 100px; }
  }
  @media (min-width: 1024px) {
    .dest-page-section { padding: 48px 32px 120px; }
  }

  /* ── Select focus ── */
  .dest-select:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
  }
  .dest-search:focus {
    border-color: #10b981 !important;
    box-shadow: 0 0 0 4px rgba(16,185,129,0.1) !important;
  }

  /* ── Skeleton card responsive height ── */
  .skeleton-img { padding-top: 62%; }
  @media (max-width: 639px) {
    .skeleton-img { padding-top: 56%; }
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dest-page-css")) return;
  const s = document.createElement("style");
  s.id = "dest-page-css";
  s.textContent = GLOBAL_STYLES;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════
   SKELETON CARD
═══════════════════════════════════════════════════════ */
function SkeletonCard() {
  const shimmer =
    "linear-gradient(90deg,#f3f4f6 25%,#e9ecef 50%,#f3f4f6 75%)";
  const bar = (w, h, delay) => ({
    height: h,
    borderRadius: 8,
    width: w,
    background: shimmer,
    backgroundSize: "400% 100%",
    animation: `skeletonPulse 1.6s ease ${delay}s infinite`,
  });

  return (
    <div
      style={{
        borderRadius: 22,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="skeleton-img"
        style={{
          position: "relative",
          background: shimmer,
          backgroundSize: "400% 100%",
          animation: "skeletonPulse 1.6s ease infinite",
        }}
      />
      <div
        style={{
          padding: "clamp(14px,2vw,24px)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={bar("70%", 20, 0)} />
        <div style={bar("50%", 14, 0.1)} />
        <div style={bar("90%", 14, 0.2)} />
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 4,
          }}
        >
          <div style={bar("55px", 24, 0.15)} />
          <div style={bar("45px", 24, 0.2)} />
          <div style={bar("50px", 24, 0.25)} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "1px solid #f3f4f6",
            marginTop: 4,
          }}
        >
          <div style={bar("70px", 18, 0.3)} />
          <div
            style={{
              ...bar("110px", 42, 0.35),
              borderRadius: 14,
              background:
                "linear-gradient(90deg,#d1fae5 25%,#a7f3d0 50%,#d1fae5 75%)",
              backgroundSize: "400% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════ */
function EmptyState({ query, onClear }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "clamp(50px,8vw,90px) 24px",
        background: "#fff",
        borderRadius: 22,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: "clamp(48px,8vw,72px)", marginBottom: 18 }}>
        {query ? "🔍" : "🌍"}
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(20px,3vw,28px)",
          fontWeight: 700,
          color: "#111827",
          margin: "0 0 10px",
        }}
      >
        {query ? `No results for "${query}"` : "No destinations yet"}
      </h3>
      <p
        style={{
          color: "#6b7280",
          fontSize: "clamp(14px,1.5vw,16px)",
          maxWidth: 420,
          margin: "0 auto 28px",
          lineHeight: 1.6,
        }}
      >
        {query
          ? "Try different keywords or remove some filters."
          : "Destinations will appear here once published."}
      </p>
      {query && (
        <button
          onClick={onClear}
          style={{
            background: "linear-gradient(135deg,#10b981,#059669)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
          }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════════════ */
function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "clamp(50px,8vw,80px) 24px",
        background: "#fff",
        borderRadius: 22,
        border: "1px solid #fee2e2",
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
      <h3
        style={{
          fontSize: "clamp(18px,2.5vw,24px)",
          color: "#991b1b",
          fontWeight: 700,
          margin: "0 0 10px",
        }}
      >
        Could not load destinations
      </h3>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          padding: "12px 28px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 15,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <FiRefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED SELECT STYLE
═══════════════════════════════════════════════════════ */
const SELECT_BASE = {
  padding: "12px 40px 12px 16px",
  fontSize: 14,
  fontWeight: 600,
  border: "1.5px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
  cursor: "pointer",
  outline: "none",
  color: "#374151",
  appearance: "none",
  WebkitAppearance: "none",
  flex: 1,
  minWidth: 0,
  transition: "border-color 0.2s, box-shadow 0.2s",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  fontFamily: "inherit",
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [debounced, setDebounced] = useState(
    () => searchParams.get("search") || ""
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    () => searchParams.get("country") || "all"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "all"
  );
  const [selectedDiff, setSelectedDiff] = useState(
    () => searchParams.get("difficulty") || "all"
  );
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    injectStyles();
  }, []);

  /* ── Data ─────────────────────────────────────── */
  const {
    countries = [],
    loading: countriesLoading,
    error: countriesError,
    refetch: retryCountries,
  } = useCountries();

  const allParams = useMemo(() => {
    const p = {};
    if (selectedCategory !== "all") p.category = selectedCategory;
    if (selectedDiff !== "all") p.difficulty = selectedDiff;
    if (debounced) p.search = debounced;
    return p;
  }, [selectedCategory, selectedDiff, debounced]);

  const {
    destinations: allDests = [],
    loading: allLoading,
    error: allError,
    refetch: retryAll,
  } = useDestinations(selectedCountry === "all" ? allParams : {});

  const {
    destinations: countryDests = [],
    loading: countryLoading,
    error: countryError,
    refetch: retryCountry,
  } = useCountryDestinations(
    selectedCountry !== "all" ? selectedCountry : null
  );

  const raw = selectedCountry === "all" ? allDests : countryDests;
  const loading = selectedCountry === "all" ? allLoading : countryLoading;
  const error = selectedCountry === "all" ? allError : countryError;
  const retry = selectedCountry === "all" ? retryAll : retryCountry;

  const categories = useMemo(
    () => [...new Set(allDests.map((d) => d.category).filter(Boolean))],
    [allDests]
  );
  const difficulties = useMemo(
    () => [...new Set(allDests.map((d) => d.difficulty).filter(Boolean))],
    [allDests]
  );

  /* ── Filter + sort ─────────────────────────────── */
  const filteredDestinations = useMemo(() => {
    let list = raw;
    if (selectedCountry !== "all") {
      if (selectedCategory !== "all")
        list = list.filter((d) => d.category === selectedCategory);
      if (selectedDiff !== "all")
        list = list.filter((d) => d.difficulty === selectedDiff);
      if (debounced) {
        const q = debounced.toLowerCase();
        list = list.filter((d) =>
          [
            d.name,
            d.description,
            d.shortDescription,
            d.location,
            d.country,
            d.category,
            ...(Array.isArray(d.highlights) ? d.highlights : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      }
    }
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "newest":
          return (
            new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
          );
        case "popular":
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case "duration":
          return (a.durationDays || 0) - (b.durationDays || 0);
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [raw, selectedCountry, selectedCategory, selectedDiff, debounced, sortBy]);

  /* ── Debounce ─────────────────────────────────── */
  useEffect(() => {
    if (searchQuery === debounced) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebounced(searchQuery);
      setIsSearching(false);
    }, 320);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery, debounced]);

  /* ── URL sync ─────────────────────────────────── */
  useEffect(() => {
    const next = new URLSearchParams();
    if (debounced) next.set("search", debounced);
    if (selectedCountry !== "all") next.set("country", selectedCountry);
    if (selectedCategory !== "all") next.set("category", selectedCategory);
    if (selectedDiff !== "all") next.set("difficulty", selectedDiff);
    setSearchParams(next, { replace: true });
  }, [debounced, selectedCountry, selectedCategory, selectedDiff, setSearchParams]);

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setDebounced("");
    setSelectedCountry("all");
    setSelectedCategory("all");
    setSelectedDiff("all");
  }, []);

  const activeCount = [
    Boolean(debounced),
    selectedCountry !== "all",
    selectedCategory !== "all",
    selectedDiff !== "all",
  ].filter(Boolean).length;

  const hasFilters = activeCount > 0;

  const chips = useMemo(() => {
    const c = [];
    if (debounced)
      c.push({ label: `"${debounced}"`, clear: () => setSearchQuery("") });
    if (selectedCountry !== "all") {
      const found = countries.find(
        (x) => (x.slug || String(x.id)) === selectedCountry
      );
      c.push({
        label: found ? `${found.flag || ""} ${found.name}` : selectedCountry,
        clear: () => setSelectedCountry("all"),
      });
    }
    if (selectedCategory !== "all")
      c.push({
        label: selectedCategory.replace(/_/g, " "),
        clear: () => setSelectedCategory("all"),
      });
    if (selectedDiff !== "all")
      c.push({ label: selectedDiff, clear: () => setSelectedDiff("all") });
    return c;
  }, [debounced, selectedCountry, selectedCategory, selectedDiff, countries]);

  const skeletonCount = typeof window !== "undefined" && window.innerWidth < 640 ? 2 : 6;

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div style={{ background: "#fafbfc", minHeight: "100vh" }}>
      <PageHeader
        title="Explore Destinations"
        subtitle="Discover extraordinary places across East Africa — from wildlife-rich savannas to ancient cultural wonders."
        backgroundImage="https://i.pinimg.com/1200x/ca/2b/b9/ca2bb955ebe6cde00add738468d44f30.jpg"
        breadcrumbs={[{ label: "Destinations" }]}
      />

      <section className="dest-page-section">
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* ── FILTER PANEL ─────────────────────── */}
          <AnimatedSection animation="fadeInUp">
            <div
              className="dest-filters-panel"
              style={{
                background: "#fff",
                borderRadius: 22,
                marginBottom: "clamp(20px,3vw,36px)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* Search row */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {/* Search input */}
                <div
                  style={{
                    flex: 1,
                    minWidth: "clamp(200px,40vw,320px)",
                    position: "relative",
                  }}
                >
                  <FiSearch
                    size={17}
                    style={{
                      position: "absolute",
                      left: 15,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search destinations…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="dest-search"
                    style={{
                      width: "100%",
                      padding: "12px 44px 12px 44px",
                      fontSize: 14,
                      border: "1.5px solid",
                      borderColor: isSearching ? "#10b981" : "#e5e7eb",
                      borderRadius: 12,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxShadow: isSearching
                        ? "0 0 0 3px rgba(16,185,129,0.1)"
                        : "none",
                      color: "#1f2937",
                      background: "#fff",
                      fontFamily: "inherit",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {isSearching ? (
                      <span
                        style={{
                          width: 15,
                          height: 15,
                          display: "block",
                          border: "2px solid #e5e7eb",
                          borderTop: "2px solid #10b981",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    ) : searchQuery ? (
                      <button
                        onClick={() => setSearchQuery("")}
                        style={{
                          background: "#f3f4f6",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                          color: "#6b7280",
                        }}
                      >
                        <FiX size={13} />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters((p) => !p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "12px 20px",
                    border: "1.5px solid",
                    borderColor: showFilters ? "#10b981" : "#e5e7eb",
                    borderRadius: 12,
                    background: showFilters ? "#f0fdf4" : "#fff",
                    color: showFilters ? "#065f46" : "#374151",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  <FiSliders size={15} />
                  Filters
                  {activeCount > 0 && (
                    <span
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        fontSize: 11,
                        fontWeight: 800,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Collapsible selects */}
              {showFilters && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #f3f4f6",
                    animation: "fadeSlideUp 0.2s ease",
                  }}
                >
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    style={SELECT_BASE}
                    className="dest-select"
                    disabled={countriesLoading}
                  >
                    <option value="all">🌍 All Countries</option>
                    {countriesLoading && countries.length === 0 && (
                      <option disabled>Loading…</option>
                    )}
                    {countries.map((c) => (
                      <option
                        key={c.id || c.slug}
                        value={c.slug || String(c.id)}
                      >
                        {c.flag || "🏳"} {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={SELECT_BASE}
                    className="dest-select"
                  >
                    <option value="all">📂 All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() +
                          c.slice(1).replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDiff}
                    onChange={(e) => setSelectedDiff(e.target.value)}
                    style={SELECT_BASE}
                    className="dest-select"
                  >
                    <option value="all">⚡ All Difficulties</option>
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>

                  {hasFilters && (
                    <button
                      onClick={clearAll}
                      style={{
                        padding: "12px 18px",
                        border: "1.5px solid #fee2e2",
                        borderRadius: 12,
                        background: "#fff5f5",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        fontFamily: "inherit",
                      }}
                    >
                      <FiX size={14} />
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Results bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <span style={{ fontSize: 14, color: "#6b7280" }}>
                  {loading || isSearching ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid #e5e7eb",
                          borderTop: "2px solid #10b981",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      {isSearching ? "Searching…" : "Loading…"}
                    </span>
                  ) : (
                    <span>
                      <strong style={{ color: "#059669" }}>
                        {filteredDestinations.length}
                      </strong>{" "}
                      destination
                      {filteredDestinations.length !== 1 ? "s" : ""}
                      {debounced && (
                        <span style={{ color: "#9ca3af" }}>
                          {" for "}
                          <em style={{ color: "#374151" }}>
                            &ldquo;{debounced}&rdquo;
                          </em>
                        </span>
                      )}
                    </span>
                  )}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {countriesError && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: "#ef4444",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      <FiWifiOff size={12} />
                      <button
                        onClick={retryCountries}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#059669",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 12,
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        Retry
                      </button>
                    </span>
                  )}

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="dest-select"
                    style={{
                      ...SELECT_BASE,
                      flex: "none",
                      minWidth: "auto",
                      padding: "8px 32px 8px 12px",
                      fontSize: 13,
                    }}
                  >
                    <option value="featured">✨ Featured</option>
                    <option value="rating">⭐ Top Rated</option>
                    <option value="newest">🆕 Newest</option>
                    <option value="popular">🔥 Popular</option>
                    <option value="name">🔤 A–Z</option>
                    <option value="duration">⏱ Duration</option>
                  </select>

                  <div
                    style={{
                      display: "flex",
                      background: "#f3f4f6",
                      borderRadius: 10,
                      padding: 3,
                    }}
                  >
                    {[
                      { m: "grid", icon: FiGrid },
                      { m: "list", icon: FiList },
                    ].map(({ m, icon: Icon }) => (
                      <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        title={`${m} view`}
                        style={{
                          width: 32,
                          height: 32,
                          border: "none",
                          borderRadius: 8,
                          background:
                            viewMode === m ? "#fff" : "transparent",
                          boxShadow:
                            viewMode === m
                              ? "0 1px 4px rgba(0,0,0,0.08)"
                              : "none",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                          color:
                            viewMode === m ? "#10b981" : "#9ca3af",
                          transition: "all 0.2s",
                        }}
                      >
                        <Icon size={15} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── CHIPS ────────────────────────────── */}
          {hasFilters && !loading && chips.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: "clamp(16px,2vw,28px)",
              }}
            >
              {chips.map((chip, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#ecfdf5",
                    color: "#065f46",
                    border: "1px solid #a7f3d0",
                    padding: "5px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {chip.label}
                  <button
                    onClick={chip.clear}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#059669",
                      display: "grid",
                      placeItems: "center",
                      padding: 0,
                    }}
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAll}
                style={{
                  background: "none",
                  border: "1px dashed #d1d5db",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 12,
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── GRID ─────────────────────────────── */}
          {error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : (
            <div
              className={`dest-grid${viewMode === "list" ? " view-list" : ""}`}
            >
              {loading
                ? Array.from({ length: skeletonCount }, (_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : filteredDestinations.length === 0
                ? <EmptyState query={debounced} onClear={clearAll} />
                : filteredDestinations.map((dest, i) => (
                    <div
                      key={dest.slug || dest.id || i}
                      style={{
                        animation: `fadeSlideUp 0.4s ease ${
                          Math.min(i, 8) * 0.06
                        }s both`,
                        opacity: isSearching ? 0.55 : 1,
                        transition: "opacity 0.3s",
                      }}
                    >
                      <DestinationCard
                        destination={dest}
                        compact={viewMode === "list"}
                        priority={i === 0}
                      />
                    </div>
                  ))}
            </div>
          )}

          {/* ── Footer ────────────────────────────── */}
          {!loading && !error && filteredDestinations.length >= 6 && (
            <div style={{ textAlign: "center", marginTop: "clamp(40px,5vw,72px)" }}>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  marginBottom: 14,
                }}
              >
                Showing all {filteredDestinations.length} destinations
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    height: 1,
                    width: 80,
                    background: "linear-gradient(to right,transparent,#d1fae5)",
                  }}
                />
                <FiMapPin size={18} color="#10b981" />
                <div
                  style={{
                    height: 1,
                    width: 80,
                    background: "linear-gradient(to left,transparent,#d1fae5)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Destinations;