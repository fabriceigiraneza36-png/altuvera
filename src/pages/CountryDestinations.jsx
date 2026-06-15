// src/pages/CountryDestinations.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch, FiX, FiGrid, FiList, FiMapPin, FiStar,
  FiArrowRight, FiArrowLeft, FiRefreshCw, FiCompass,
  FiGlobe, FiCamera, FiSliders, FiWind, FiAlertCircle,
  FiChevronRight, FiHome, FiMap, FiCalendar, FiFilter,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import DestinationCard from "../components/destinations/DestinationCard";
import { useCountry, useCountryDestinations as useCountryDestsHook } from "../hooks/useCountries";
import { useCountryDestinations } from "../hooks/useDestinations";
import { getCountrySlug } from "../utils/countrySlugMap";
import Loader from "../components/common/Loader";

/* ═══════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @keyframes cdShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes cdFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes cdSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes cdSlideDown {
    from { opacity: 0; max-height: 0; }
    to   { opacity: 1; max-height: 400px; }
  }

  .cd-shell {
    background:
      radial-gradient(circle at 10% 20%, rgba(16,185,129,.03), transparent 30%),
      #f8fafc;
    min-height: 100vh;
  }
  .cd-inner {
    max-width: 1380px;
    margin: 0 auto;
    padding: clamp(28px,4vw,56px) clamp(16px,3vw,32px) 120px;
  }

  /* ── Country context banner ── */
  .cd-context {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 20px 24px;
    border-radius: 20px;
    background: #fff;
    border: 1px solid rgba(15,23,42,.06);
    box-shadow: 0 4px 18px rgba(15,23,42,.04);
    margin-bottom: clamp(20px,2.5vw,32px);
    cursor: pointer;
    transition: all .28s ease;
    text-decoration: none;
    color: inherit;
  }
  .cd-context:hover {
    border-color: rgba(16,185,129,.18);
    box-shadow: 0 8px 28px rgba(16,185,129,.08);
    transform: translateY(-2px);
  }
  .cd-context__flag {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg,#f0fdf4,#d1fae5);
    border: 2px solid #a7f3d0;
    flex-shrink: 0;
    font-size: 26px;
    line-height: 1;
  }
  .cd-context__flag img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .cd-context__info {
    min-width: 0;
    flex: 1;
  }
  .cd-context__name {
    margin: 0;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(18px,2vw,24px);
    color: #0f172a;
    font-weight: 700;
  }
  .cd-context__meta {
    margin: 4px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 13px;
    color: #64748b;
  }
  .cd-context__meta-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
  }
  .cd-context__cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 14px;
    border: 1.5px solid #bbf7d0;
    background: #f0fdf4;
    color: #059669;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    transition: all .24s ease;
    white-space: nowrap;
  }
  .cd-context__cta:hover {
    background: #ecfdf5;
    border-color: #10b981;
    transform: translateY(-1px);
  }

  /* ── Filter toolbar ── */
  .cd-toolbar {
    background: #fff;
    border-radius: 22px;
    padding: clamp(16px,2.2vw,24px);
    border: 1px solid rgba(15,23,42,.06);
    box-shadow: 0 4px 18px rgba(15,23,42,.04);
    margin-bottom: clamp(18px,2.5vw,32px);
  }
  .cd-toolbar__row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .cd-toolbar__search-wrap {
    flex: 1;
    min-width: clamp(180px,30vw,300px);
    position: relative;
  }
  .cd-toolbar__search {
    width: 100%;
    padding: 12px 40px 12px 42px;
    font-size: 14px;
    font-weight: 500;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    background: #fff;
    color: #0f172a;
    font-family: inherit;
    box-sizing: border-box;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .cd-toolbar__search:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16,185,129,.1);
  }
  .cd-toolbar__search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
  }
  .cd-toolbar__search-end {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
  }
  .cd-toolbar__clear {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    display: grid;
    place-items: center;
    cursor: pointer;
  }
  .cd-toolbar__clear:hover { background: #e2e8f0; }
  .cd-toolbar__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e2e8f0;
    border-top-color: #10b981;
    border-radius: 50%;
    display: block;
    animation: cdSpin .7s linear infinite;
  }
  .cd-toolbar__filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 12px 18px;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    background: #fff;
    color: #334155;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all .2s ease;
    white-space: nowrap;
  }
  .cd-toolbar__filter-btn.active {
    border-color: #10b981;
    background: #f0fdf4;
    color: #065f46;
  }
  .cd-toolbar__filter-btn:hover {
    border-color: #10b981;
  }
  .cd-toolbar__badge {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #10b981;
    color: #fff;
    font-size: 11px;
    font-weight: 900;
    display: grid;
    place-items: center;
  }
  .cd-toolbar__filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
    animation: cdSlideDown .3s ease;
  }
  .cd-toolbar__select {
    padding: 11px 36px 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    color: #334155;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    flex: 1 1 auto;
    min-width: 0;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  .cd-toolbar__select:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,.1);
  }
  .cd-toolbar__clear-all {
    padding: 11px 16px;
    border: 1.5px solid #fecaca;
    border-radius: 12px;
    background: #fef2f2;
    color: #ef4444;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .cd-toolbar__clear-all:hover { background: #fee2e2; }

  .cd-toolbar__status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
    font-size: 13.5px;
    color: #64748b;
  }
  .cd-toolbar__status strong { color: #059669; }
  .cd-toolbar__controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cd-toolbar__sort {
    padding: 9px 32px 9px 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
    color: #334155;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    outline: none;
    transition: border-color .2s;
  }
  .cd-toolbar__sort:focus { border-color: #10b981; }
  .cd-toolbar__view-toggle {
    display: flex;
    padding: 3px;
    background: #f1f5f9;
    border-radius: 12px;
    gap: 2px;
    border: 1px solid rgba(15,23,42,.04);
  }
  .cd-toolbar__view-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all .2s;
  }
  .cd-toolbar__view-btn.active {
    background: #fff;
    color: #10b981;
    box-shadow: 0 2px 8px rgba(15,23,42,.08);
  }
  .cd-toolbar__view-btn:hover:not(.active) {
    color: #334155;
    background: rgba(255,255,255,.5);
  }

  /* ── Destinations grid ── */
  .cd-dest-grid {
    display: grid;
    gap: clamp(16px,2.3vw,28px);
    grid-template-columns: repeat(auto-fill, minmax(min(100%,330px), 1fr));
    align-items: stretch;
  }
  .cd-dest-grid.cd-dest-list {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }

  /* ── Empty / error ── */
  .cd-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: clamp(56px,8vw,90px) 24px;
    border-radius: 26px;
    background: #fff;
    border: 1px solid rgba(15,23,42,.06);
    box-shadow: 0 6px 22px rgba(15,23,42,.04);
  }
  .cd-empty h3 {
    margin: 0 0 10px;
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px,3vw,30px);
    color: #0f172a;
  }
  .cd-empty p {
    max-width: 440px;
    margin: 0 auto 24px;
    color: #64748b;
    line-height: 1.7;
    font-size: 14.5px;
  }
  .cd-error {
    max-width: 520px;
    margin: 60px auto;
    text-align: center;
    padding: 48px 32px;
    border-radius: 24px;
    background: #fff;
    border: 1px solid #fecaca;
    box-shadow: 0 12px 36px rgba(239,68,68,.08);
  }
  .cd-error h3 {
    margin: 16px 0 8px;
    font-size: 22px;
    color: #991b1b;
  }
  .cd-error p {
    margin: 0 0 24px;
    color: #6b7280;
    line-height: 1.6;
    font-size: 14.5px;
  }
  .cd-retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    border-radius: 14px;
    padding: 12px 20px;
    background: #ef4444;
    color: #fff;
    font-weight: 800;
    font-size: 14px;
  }
  .cd-clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    border-radius: 14px;
    padding: 12px 24px;
    background: linear-gradient(135deg,#10b981,#059669);
    color: #fff;
    font-weight: 800;
    font-size: 14px;
    box-shadow: 0 4px 16px rgba(16,185,129,.25);
  }

  /* ── CTA footer ── */
  .cd-footer-cta {
    text-align: center;
    padding: clamp(40px,5vw,70px) 20px;
    margin-top: clamp(28px,3vw,48px);
    border-radius: 26px;
    background: linear-gradient(135deg,#064e3b,#065f46,#047857);
    position: relative;
    overflow: hidden;
  }
  .cd-footer-cta::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(16,185,129,.2), transparent 45%),
      radial-gradient(circle at 85% 15%, rgba(52,211,153,.15), transparent 40%);
  }
  .cd-footer-cta * { position: relative; z-index: 1; }
  .cd-footer-cta h3 {
    margin: 0 0 12px;
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px,3vw,36px);
    color: #fff;
  }
  .cd-footer-cta p {
    margin: 0 auto 28px;
    max-width: 500px;
    color: rgba(255,255,255,.82);
    font-size: 15px;
    line-height: 1.7;
  }

  /* ── Skeleton ── */
  .cd-skel {
    background: linear-gradient(90deg,#f3f4f6 25%,#e9ecef 50%,#f3f4f6 75%);
    background-size: 400% 100%;
    animation: cdShimmer 1.6s ease infinite;
  }

  /* ── Responsive ── */
  @media (max-width: 760px) {
    .cd-context {
      padding: 16px 18px;
      gap: 12px;
    }
    .cd-context__flag {
      width: 44px;
      height: 44px;
      font-size: 22px;
    }
  }
  @media (max-width: 640px) {
    .cd-dest-grid {
      grid-template-columns: 1fr;
    }
    .cd-toolbar__controls {
      width: 100%;
      justify-content: space-between;
    }
  }
  @media (prefers-reduced-motion:reduce) {
    .cd-context,
    .cd-toolbar__filter-btn {
      transition: none !important;
    }
    .cd-context:hover {
      transform: none !important;
    }
  }
`;

function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("country-dests-css-v2")) return;
  const s = document.createElement("style");
  s.id = "country-dests-css-v2";
  s.textContent = PAGE_CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const pick = (...v) => { for (const x of v) { const t = (typeof x === "string" ? x : "").trim(); if (t) return t; } return ""; };
const getFlag = (c) => pick(c?.flagUrl, c?.flag_url, c?.flag);
const getRegion = (c) => pick(c?.region, c?.continent, c?.subRegion);
const getHero = (c) => pick(c?.heroImage, c?.hero_image, c?.coverImage, c?.cover_image, c?.image, c?.bannerImage) || (Array.isArray(c?.images) ? c.images[0] : "");
const getCapital = (c) => pick(c?.capital, c?.capitalCity);
const getRating = (c) => c?.averageRating ?? c?.average_rating ?? c?.rating ?? null;

/* ═══════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════ */
function DestSkeleton() {
  return (
    <div style={{
      borderRadius: 22, overflow: "hidden", background: "#fff",
      border: "1px solid rgba(0,0,0,.06)",
    }}>
      <div className="cd-skel" style={{ aspectRatio: "16/10" }} />
      <div style={{ padding: 20, display: "grid", gap: 10 }}>
        <div className="cd-skel" style={{ height: 20, width: "60%", borderRadius: 8 }} />
        <div className="cd-skel" style={{ height: 14, width: "85%", borderRadius: 8 }} />
        <div className="cd-skel" style={{ height: 14, width: "45%", borderRadius: 8 }} />
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <div className="cd-skel" style={{ width: 70, height: 28, borderRadius: 999 }} />
          <div className="cd-skel" style={{ width: 90, height: 28, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
function CountryDestinationsPage() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery]             = useState(() => searchParams.get("search") || "");
  const [debounced, setDebounced]     = useState(() => searchParams.get("search") || "");
  const [searching, setSearching]     = useState(false);
  const [category, setCategory]       = useState(() => searchParams.get("category") || "all");
  const [difficulty, setDifficulty]   = useState(() => searchParams.get("difficulty") || "all");
  const [sortBy, setSortBy]           = useState("featured");
  const [view, setView]               = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => { injectCSS(); }, []);

  const { country, loading: countryLoading, error: countryError, refetch: retryCountry } = useCountry(countryId);
  const { destinations: rawDests = [], loading: destsLoading, error: destsError, refetch: retryDests } = useCountryDestinations(countryId);

  const categories = useMemo(() => [...new Set(rawDests.map(d => d.category).filter(Boolean))], [rawDests]);
  const difficulties = useMemo(() => [...new Set(rawDests.map(d => d.difficulty).filter(Boolean))], [rawDests]);

  const filtered = useMemo(() => {
    let list = rawDests;
    if (category !== "all") list = list.filter(d => d.category === category);
    if (difficulty !== "all") list = list.filter(d => d.difficulty === difficulty);
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter(d =>
        [d.name, d.description, d.shortDescription, d.location, d.category, ...(d.highlights || [])]
          .filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "rating":   return (b.rating || 0) - (a.rating || 0);
        case "name":     return (a.name || "").localeCompare(b.name || "");
        case "newest":   return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
        case "popular":  return (b.reviewCount || 0) - (a.reviewCount || 0);
        case "duration": return (a.durationDays || 0) - (b.durationDays || 0);
        default:         return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [rawDests, category, difficulty, debounced, sortBy]);

  useEffect(() => {
    if (query === debounced) { setSearching(false); return; }
    setSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setDebounced(query); setSearching(false); }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query, debounced]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (debounced) p.set("search", debounced);
    if (category !== "all") p.set("category", category);
    if (difficulty !== "all") p.set("difficulty", difficulty);
    setSearchParams(p, { replace: true });
  }, [debounced, category, difficulty, setSearchParams]);

  const clearAll = useCallback(() => {
    setQuery(""); setDebounced(""); setCategory("all"); setDifficulty("all");
  }, []);

  const activeFilters = [Boolean(debounced), category !== "all", difficulty !== "all"].filter(Boolean).length;
  const loading = countryLoading || destsLoading;
  const error = countryError || destsError;
  const retry = countryError ? retryCountry : retryDests;
  const skeletonCount = typeof window !== "undefined" && window.innerWidth < 640 ? 2 : 6;

  const slug = country ? getCountrySlug(country) : countryId;
  const flag = country ? getFlag(country) : "";
  const region = country ? getRegion(country) : "";
  const capital = country ? getCapital(country) : "";
  const hero = country ? getHero(country) : "";
  const rating = country ? getRating(country) : null;
  const isFlagEmoji = flag && !flag.startsWith("http") && !flag.includes("/");
  const isFlagUrl = flag && (flag.startsWith("http") || flag.includes("/"));
  const countryName = country?.name || countryId;

  if (countryLoading && !country) {
    return <div className="cd-shell"><div style={{ textAlign: "center", padding: "120px 24px" }}><Loader /></div></div>;
  }

  if (countryError && !country) {
    return (
      <div className="cd-shell">
        <div className="cd-error">
          <FiAlertCircle size={44} color="#ef4444" />
          <h3>Country not found</h3>
          <p>{countryError}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="cd-retry-btn" onClick={retryCountry}><FiRefreshCw size={14}/> Retry</button>
            <Link to="/destinations" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 18px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
              <FiGlobe size={14}/> All Countries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-shell">
      <PageHeader
        title={`Destinations in ${countryName}`}
        subtitle={`Explore curated experiences and must-visit places across ${countryName}.`}
        backgroundImage={hero}
        breadcrumbs={[
          { label: "Destinations", path: "/destinations" },
          { label: countryName, path: `/country/${slug}` },
          { label: "All Destinations" },
        ]}
        height="440px"
      />

      <div className="cd-inner">
        {/* ── Country context banner ── */}
        {country && (
          <AnimatedSection animation="fadeInUp" delay={0.04}>
            <Link to={`/country/${slug}`} className="cd-context">
              <div className="cd-context__flag">
                {isFlagUrl ? <img src={flag} alt="flag" /> : isFlagEmoji ? <span>{flag}</span> : <FiGlobe size={20} color="#059669" />}
              </div>
              <div className="cd-context__info">
                <h3 className="cd-context__name">{countryName}</h3>
                <div className="cd-context__meta">
                  {region && <span className="cd-context__meta-item"><FiGlobe size={12} color="#10b981" />{region}</span>}
                  {capital && <span className="cd-context__meta-item"><FiMapPin size={12} color="#10b981" />{capital}</span>}
                  {rating != null && <span className="cd-context__meta-item"><FiStar size={12} color="#f59e0b" fill="#f59e0b" />{Number(rating).toFixed(1)}</span>}
                  <span className="cd-context__meta-item"><FiCamera size={12} color="#10b981" />{rawDests.length} Destinations</span>
                </div>
              </div>
              <span className="cd-context__cta" onClick={(e) => e.stopPropagation()}>
                <FiArrowLeft size={13} /> Country Guide
              </span>
            </Link>
          </AnimatedSection>
        )}

        {/* ── Toolbar ── */}
        <AnimatedSection animation="fadeInUp" delay={0.06}>
          <div className="cd-toolbar">
            <div className="cd-toolbar__row">
              <div className="cd-toolbar__search-wrap">
                <FiSearch size={16} className="cd-toolbar__search-icon" />
                <input
                  type="text" className="cd-toolbar__search"
                  placeholder={`Search destinations in ${countryName}…`}
                  value={query} onChange={(e) => setQuery(e.target.value)}
                />
                <div className="cd-toolbar__search-end">
                  {searching
                    ? <span className="cd-toolbar__spinner" />
                    : query
                      ? <button className="cd-toolbar__clear" onClick={() => setQuery("")}><FiX size={12} /></button>
                      : null}
                </div>
              </div>

              <button
                className={`cd-toolbar__filter-btn${showFilters ? " active" : ""}`}
                onClick={() => setShowFilters(p => !p)}
              >
                <FiFilter size={14} />
                Filters
                {activeFilters > 0 && <span className="cd-toolbar__badge">{activeFilters}</span>}
              </button>
            </div>

            {showFilters && (
              <div className="cd-toolbar__filters">
                <select className="cd-toolbar__select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, " ")}</option>)}
                </select>
                <select className="cd-toolbar__select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="all">All Difficulties</option>
                  {difficulties.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
                {activeFilters > 0 && (
                  <button className="cd-toolbar__clear-all" onClick={clearAll}><FiX size={13} /> Clear</button>
                )}
              </div>
            )}

            <div className="cd-toolbar__status">
              <span>
                {loading || searching ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="cd-toolbar__spinner" />
                    {searching ? "Searching…" : "Loading…"}
                  </span>
                ) : (
                  <>
                    <strong>{filtered.length}</strong> destination{filtered.length === 1 ? "" : "s"}
                    {debounced && <> matching "<em>{debounced}</em>"</>}
                  </>
                )}
              </span>

              <div className="cd-toolbar__controls">
                <select className="cd-toolbar__sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">✨ Featured</option>
                  <option value="rating">⭐ Top Rated</option>
                  <option value="newest">🆕 Newest</option>
                  <option value="popular">🔥 Popular</option>
                  <option value="name">🔤 A–Z</option>
                  <option value="duration">⏱ Duration</option>
                </select>

                <div className="cd-toolbar__view-toggle">
                  {[{ m: "grid", I: FiGrid }, { m: "list", I: FiList }].map(({ m, I }) => (
                    <button key={m} className={`cd-toolbar__view-btn${view === m ? " active" : ""}`}
                      onClick={() => setView(m)} title={`${m} view`}>
                      <I size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Grid ── */}
        {error && !rawDests.length ? (
          <div className="cd-error">
            <FiAlertCircle size={40} color="#ef4444" />
            <h3>Failed to load destinations</h3>
            <p>{error}</p>
            <button className="cd-retry-btn" onClick={retry}><FiRefreshCw size={14} /> Try Again</button>
          </div>
        ) : (
          <div className={`cd-dest-grid${view === "list" ? " cd-dest-list" : ""}`}>
            {loading ? (
              Array.from({ length: skeletonCount }, (_, i) => <DestSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="cd-empty">
                <div style={{ fontSize: 60, marginBottom: 16 }}>{debounced ? "🔍" : "🗺️"}</div>
                <h3>{debounced ? `No results for "${debounced}"` : `No destinations in ${countryName} yet`}</h3>
                <p>{debounced ? "Try a different keyword or clear the filters." : "Destinations for this country will appear here once published."}</p>
                {debounced && <button className="cd-clear-btn" onClick={clearAll}>Clear Filters</button>}
              </div>
            ) : (
              filtered.map((dest, i) => (
                <AnimatedSection
                  key={dest.slug || dest.id || i}
                  animation="fadeInUp"
                  delay={Math.min(i * 0.05, 0.35)}
                  threshold={0.08}
                  rootMargin="60px 0px -30px 0px"
                  style={{ height: "100%" }}
                >
                  <DestinationCard
                    destination={dest}
                    compact={view === "list"}
                    priority={i < 3}
                  />
                </AnimatedSection>
              ))
            )}
          </div>
        )}

        {/* ── Footer CTA ── */}
        {!loading && filtered.length > 0 && (
          <AnimatedSection animation="scaleIn" delay={0.08}>
            <div className="cd-footer-cta">
              <h3>Plan your {countryName} adventure</h3>
              <p>
                Ready to experience the best of {countryName}? Start planning your
                itinerary or talk to our travel experts.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/booking" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 26px", borderRadius: 16,
                  background: "#fff", color: "#065f46",
                  fontWeight: 800, fontSize: 14, textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                  transition: "transform .2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                >
                  <FiCalendar size={15} /> Book a Trip
                </Link>
                <Link to={`/country/${slug}`} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 26px", borderRadius: 16,
                  background: "transparent", color: "#fff",
                  border: "1.5px solid rgba(255,255,255,.3)",
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                  transition: "all .2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = ""; }}
                >
                  <FiArrowLeft size={14} /> Back to Country Guide
                </Link>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}

export default CountryDestinationsPage;