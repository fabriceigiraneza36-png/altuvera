// src/pages/Destinations.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  FiSearch, FiX, FiMap,
  FiArrowRight, FiRefreshCw, FiMapPin,
  FiStar, FiTrendingUp, FiGlobe,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import { useCountries } from "../hooks/useCountries";
import { getCountrySlug } from "../utils/countrySlugMap";

const CSS = `
  @keyframes dest-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes dest-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes dest-scaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes dest-spin {
    to { transform: rotate(360deg); }
  }

  .dc-grid {
    display: grid;
    gap: clamp(12px, 2vw, 20px);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  }

  .dc-card {
    cursor: pointer;
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
    border: 1px solid rgba(2,44,34,0.08);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.35s ease,
                border-color 0.3s ease;
    will-change: transform, box-shadow;
    display: flex;
    flex-direction: column;
    position: relative;
    animation: dest-fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both;
    text-decoration: none;
    color: inherit;
  }
  .dc-card:hover {
    transform: translateY(-6px) scale(1.008);
    box-shadow: 0 20px 48px rgba(2,44,34,0.16), 0 4px 14px rgba(0,0,0,0.05);
    border-color: rgba(5,150,105,0.3);
  }

  .dc-card__img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: #022C22;
    flex-shrink: 0;
  }
  .dc-card__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease;
  }
  .dc-card:hover .dc-card__img {
    transform: scale(1.1);
    filter: brightness(0.75);
  }

  .dc-card__gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(2,44,34,0.92) 0%,
      rgba(2,44,34,0.4) 40%,
      transparent 70%
    );
    z-index: 1;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .dc-card:hover .dc-card__gradient {
    opacity: 1;
  }

  .dc-card__hover-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 22px;
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .dc-card:hover .dc-card__hover-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .dc-card__name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(17px, 2vw, 22px);
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
    line-height: 1.2;
    transform: translateY(14px);
    transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1);
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .dc-card:hover .dc-card__name {
    transform: translateY(0);
  }

  .dc-card__sub {
    display: flex;
    align-items: center;
    gap: 5px;
    color: rgba(255,255,255,0.85);
    font-size: 12.5px;
    font-weight: 500;
    transform: translateY(14px);
    transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 0.04s;
    margin: 0;
  }
  .dc-card:hover .dc-card__sub {
    transform: translateY(0);
  }

  .dc-card__explore-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    border-radius: 10px;
    background: rgba(5,150,105,0.35);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(16,185,129,0.35);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    margin-top: 14px;
    transform: translateY(18px);
    transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1) 0.08s,
                background 0.25s ease;
    cursor: pointer;
    align-self: flex-start;
    text-decoration: none;
    letter-spacing: 0.02em;
  }
  .dc-card:hover .dc-card__explore-btn {
    transform: translateY(0);
  }
  .dc-card__explore-btn:hover {
    background: rgba(5,150,105,0.55);
  }

  .dc-card__flag {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 3;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255,255,255,0.9);
    background: rgba(2,44,34,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.25);
    font-size: 18px;
    line-height: 1;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .dc-card:hover .dc-card__flag {
    transform: scale(1.12);
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .dc-card__flag img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dc-card__top-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .dc-card__top-badge--featured {
    background: linear-gradient(135deg, #059669, #022C22);
    color: #ffffff;
    box-shadow: 0 2px 10px rgba(5,150,105,0.4);
  }
  .dc-card__top-badge--popular {
    background: rgba(2,44,34,0.5);
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .dc-card__accent {
    height: 3px;
    flex-shrink: 0;
    background: linear-gradient(90deg, #022C22, #059669, #022C22);
    opacity: 0.4;
    transition: opacity 0.4s;
  }
  .dc-card:hover .dc-card__accent {
    opacity: 1;
    background: linear-gradient(90deg, #059669, #10B981, #34D399);
  }

  .dc-card__map-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    z-index: 3;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: rgba(2,44,34,0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.2);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
  }
  .dc-card:hover .dc-card__map-btn {
    opacity: 1;
    transform: scale(1);
  }
  .dc-card__map-btn:hover {
    background: rgba(5,150,105,0.5);
  }

  .dc-map-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(2,44,34,0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: dest-scaleIn 0.3s ease;
  }
  .dc-map-modal {
    position: relative;
    width: 100%;
    max-width: 620px;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(5,150,105,0.15);
    box-shadow: 0 32px 80px rgba(2,44,34,0.25);
  }
  .dc-map-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(2,44,34,0.08);
    background: #f0fdf4;
  }
  .dc-map-modal__title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 17px;
    font-weight: 800;
    color: #022C22;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dc-map-modal__close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(2,44,34,0.12);
    background: #fff;
    color: #022C22;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    font-family: inherit;
  }
  .dc-map-modal__close:hover {
    background: #f0fdf4;
    border-color: #059669;
  }
  .dc-map-modal__body {
    padding: 0;
    height: 380px;
    background: #f0fdf4;
    position: relative;
  }
  .dc-map-modal__body iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  .dc-map-modal__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-top: 1px solid rgba(2,44,34,0.08);
    background: #f0fdf4;
    gap: 10px;
  }
  .dc-map-modal__explore {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 22px;
    border-radius: 11px;
    background: linear-gradient(135deg, #059669, #022C22);
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: box-shadow 0.25s, transform 0.25s;
    box-shadow: 0 4px 14px rgba(5,150,105,0.3);
    font-family: inherit;
  }
  .dc-map-modal__explore:hover {
    box-shadow: 0 6px 20px rgba(5,150,105,0.45);
    transform: translateY(-1px);
  }

  .dc-search__input:focus {
    outline: none;
    border-color: #059669 !important;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12) !important;
  }

  .dc-skel {
    background: linear-gradient(90deg, #ecfdf5 25%, #d1fae5 50%, #ecfdf5 75%);
    background-size: 400% 100%;
    animation: dest-shimmer 1.6s ease infinite;
    border-radius: 10px;
  }

  .dc-stat-strip {
    display: flex;
    gap: clamp(8px, 1.5vw, 16px);
    flex-wrap: wrap;
    justify-content: center;
  }
  .dc-stat-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 100px;
    backdrop-filter: blur(12px);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    transition: background 0.25s, transform 0.25s;
    cursor: default;
  }
  .dc-stat-pill:hover {
    background: rgba(255,255,255,0.18);
    transform: translateY(-2px);
  }
  .dc-stat-pill__num {
    font-size: 18px;
    font-weight: 800;
    color: #34D399;
  }

  .dc-tab {
    padding: 7px 16px;
    border-radius: 100px;
    border: 1px solid rgba(2,44,34,0.12);
    background: #fff;
    color: #022C22;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    white-space: nowrap;
    font-family: inherit;
  }
  .dc-tab:hover {
    border-color: #059669;
    color: #059669;
    background: #f0fdf4;
  }
  .dc-tab.dc-tab--active {
    background: linear-gradient(135deg, #059669, #022C22);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 3px 12px rgba(5,150,105,0.3);
  }

  .dc-sort {
    padding: 9px 32px 9px 14px;
    border: 1px solid rgba(2,44,34,0.12);
    border-radius: 11px;
    background: #fff;
    color: #022C22;
    font-size: 13px;
    font-weight: 600;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dc-sort:focus {
    outline: none;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }

  @media (max-width: 640px) {
    .dc-card__explore-btn { opacity: 1 !important; transform: none !important; }
    .dc-card__gradient { opacity: 1 !important; }
    .dc-card__hover-overlay { opacity: 1 !important; pointer-events: auto !important; }
    .dc-card__name { transform: none !important; font-size: 15px; }
    .dc-card__sub { transform: none !important; font-size: 11px; }
    .dc-card__map-btn { opacity: 1 !important; transform: scale(1) !important; }
    .dc-map-modal { max-width: 100%; border-radius: 16px 16px 0 0; }
    .dc-map-modal__body { height: 280px; }
  }
  @media (max-width: 480px) {
    .dc-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px !important;
    }
    .dc-card { border-radius: 10px; }
    .dc-card__img-wrap { aspect-ratio: 3 / 4; }
    .dc-card__hover-overlay { padding: 12px; }
    .dc-card__explore-btn { font-size: 10.5px; padding: 6px 12px; }
    .dc-card__flag { width: 28px; height: 28px; font-size: 14px; top: 8px; right: 8px; border-width: 1.5px; }
    .dc-card__top-badge { font-size: 8.5px; padding: 3px 8px; top: 8px; left: 8px; }
    .dc-card__map-btn { width: 26px; height: 26px; bottom: 8px; right: 8px; border-radius: 7px; }
    .dc-tab { padding: 6px 12px; font-size: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .dc-card, .dc-card__img, .dc-card__gradient,
    .dc-card__hover-overlay, .dc-card__name,
    .dc-card__sub, .dc-card__explore-btn,
    .dc-card__map-btn, .dc-card__flag { transition: none !important; }
    .dc-card:hover { transform: none !important; }
  }
`;

function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dest-hub-css")) return;
  const s = document.createElement("style");
  s.id = "dest-hub-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const getHeroImage = (c) =>
  c.heroImage || c.hero_image || c.coverImage || c.cover_image ||
  c.image || c.flagImageUrl || c.flag_image_url ||
  (Array.isArray(c.images) && c.images[0]) || "";

const getFlag = (c) => c.flagUrl || c.flag_url || c.flag || "";
const getRegion = (c) => c.region || c.continent || c.subRegion || c.sub_region || "";
const getDestCount = (c) =>
  c.destinationsCount ?? c.destinations_count ?? c.destinationCount ??
  c.totalDestinations ?? c.total_destinations ?? null;
const getRating = (c) => c.averageRating ?? c.average_rating ?? c.rating ?? null;
const getCapital = (c) => c.capital || "";

const getCoordinates = (c) => {
  if (c.latitude && c.longitude) return { lat: c.latitude, lng: c.longitude };
  if (c.lat && c.lng) return { lat: c.lat, lng: c.lng };
  if (c.coordinates) return { lat: c.coordinates.lat || c.coordinates.latitude, lng: c.coordinates.lng || c.coordinates.longitude };
  return null;
};

function MapModal({ country, onClose }) {
  const slug = getCountrySlug(country);
  const to = `/country/${slug}`;
  const coords = getCoordinates(country);
  const flag = getFlag(country);
  const isFlagEmoji = flag && !flag.startsWith("http") && !flag.includes("/");

  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 3},${coords.lat - 2},${coords.lng + 3},${coords.lat + 2}&layer=mapnik&marker=${coords.lat},${coords.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=-20,-35,55,40&layer=mapnik`;

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="dc-map-modal-overlay" onClick={onClose}>
      <div className="dc-map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dc-map-modal__header">
          <h3 className="dc-map-modal__title">
            {isFlagEmoji && <span>{flag}</span>}
            <FiMap size={15} style={{ color: "#059669" }} />
            {country.name}
          </h3>
          <button className="dc-map-modal__close" onClick={onClose}>
            <FiX size={15} />
          </button>
        </div>
        <div className="dc-map-modal__body">
          <iframe
            title={`Map of ${country.name}`}
            src={mapSrc}
            loading="lazy"
          />
        </div>
        <div className="dc-map-modal__footer">
          <span style={{ fontSize: 12.5, color: "#6b7280", fontWeight: 500 }}>
            {getRegion(country) && <>{getRegion(country)} · </>}
            {getCapital(country) && <>Capital: {getCapital(country)}</>}
          </span>
          <Link to={to} className="dc-map-modal__explore" onClick={onClose}>
            Explore {country.name}
            <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="dc-card" style={{ pointerEvents: "none", animation: "none", cursor: "default" }}>
      <div className="dc-card__img-wrap">
        <div className="dc-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
      </div>
      <div className="dc-card__accent" />
    </div>
  );
}

function CountryCard({ country, index, onMapClick }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();

  const hero = getHeroImage(country);
  const flag = getFlag(country);
  const region = getRegion(country);
  const cap = getCapital(country);
  const slug = getCountrySlug(country);
  const to = `/country/${slug}`;

  const isFlagEmoji = flag && !flag.startsWith("http") && !flag.includes("/");
  const isFlagUrl = flag && (flag.startsWith("http") || flag.includes("/"));
  const delay = `${Math.min(index, 11) * 0.05}s`;

  const handleCardClick = (e) => {
    if (e.target.closest(".dc-card__map-btn")) return;
    navigate(to);
  };

  const handleMapClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onMapClick(country);
  };

  return (
    <div
      className="dc-card"
      style={{ animationDelay: delay }}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      aria-label={`Explore ${country.name}`}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(to); }}
    >
      <div className="dc-card__img-wrap">
        {!imgLoaded && !imgError && (
          <div className="dc-skel" style={{ position: "absolute", inset: 0, borderRadius: 0, zIndex: 1 }} />
        )}

        {hero && !imgError ? (
          <img
            src={hero}
            alt={country.name}
            loading={index < 6 ? "eager" : "lazy"}
            className="dc-card__img"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.5s ease" }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg,
              hsl(${155 + (index * 12) % 30}, 45%, 18%) 0%,
              hsl(${165 + (index * 12) % 30}, 40%, 10%) 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 56, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
              {isFlagEmoji ? flag : "🌍"}
            </span>
          </div>
        )}

        <div className="dc-card__gradient" />

        {country.isFeatured && (
          <span className="dc-card__top-badge dc-card__top-badge--featured">
            <FiStar size={9} fill="currentColor" /> Featured
          </span>
        )}
        {country.isPopular && !country.isFeatured && (
          <span className="dc-card__top-badge dc-card__top-badge--popular">
            <FiTrendingUp size={9} /> Popular
          </span>
        )}

        <div className="dc-card__flag">
          {isFlagUrl ? (
            <img src={flag} alt={`${country.name} flag`} />
          ) : isFlagEmoji ? (
            <span style={{ fontSize: 18 }}>{flag}</span>
          ) : (
            <FiGlobe size={14} color="rgba(255,255,255,0.6)" />
          )}
        </div>

        <button
          className="dc-card__map-btn"
          onClick={handleMapClick}
          title={`View ${country.name} on map`}
          aria-label={`Quick map view of ${country.name}`}
        >
          <FiMap size={13} />
        </button>

        <div className="dc-card__hover-overlay">
          <h3 className="dc-card__name">{country.name}</h3>
          {(cap || region) && (
            <p className="dc-card__sub">
              <FiMapPin size={10} style={{ color: "#34D399" }} />
              {cap || region}
            </p>
          )}
          <span className="dc-card__explore-btn">
            Explore <FiArrowRight size={11} />
          </span>
        </div>
      </div>
      <div className="dc-card__accent" />
    </div>
  );
}

function EmptyState({ query, onClear }) {
  return (
    <div style={{
      gridColumn: "1/-1", textAlign: "center",
      padding: "clamp(48px, 8vw, 80px) 24px",
      background: "#fff", borderRadius: 20,
      border: "1px solid rgba(2,44,34,0.08)",
      animation: "dest-scaleIn 0.4s ease",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{query ? "🔍" : "🌍"}</div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(18px, 3vw, 26px)",
        fontWeight: 700, color: "#022C22", margin: "0 0 8px",
      }}>
        {query ? `No countries match "${query}"` : "No countries yet"}
      </h3>
      <p style={{
        color: "#6b7280", fontSize: "clamp(13px, 1.5vw, 15px)",
        maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.65,
      }}>
        {query ? "Try a different search term or clear the filters." : "Countries will appear here once published."}
      </p>
      {query && (
        <button onClick={onClear} style={{
          background: "linear-gradient(135deg, #059669, #022C22)",
          color: "#fff", border: "none", borderRadius: 12,
          padding: "11px 28px", fontWeight: 700, fontSize: 14,
          cursor: "pointer", boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
          fontFamily: "inherit",
        }}>
          Clear Search
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      gridColumn: "1/-1", textAlign: "center",
      padding: "clamp(48px, 8vw, 80px) 24px",
      background: "#fff", borderRadius: 20,
      border: "1px solid rgba(2,44,34,0.1)",
      animation: "dest-scaleIn 0.4s ease",
    }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
      <h3 style={{ fontSize: "clamp(17px, 2.5vw, 22px)", color: "#022C22", fontWeight: 700, margin: "0 0 8px" }}>
        Could not load countries
      </h3>
      <p style={{ color: "#6b7280", margin: "0 0 20px", fontSize: 13, lineHeight: 1.6 }}>
        {message || "Something went wrong. Please try again."}
      </p>
      <button onClick={onRetry} style={{
        background: "linear-gradient(135deg, #059669, #022C22)",
        color: "#fff", border: "none", borderRadius: 12,
        padding: "11px 24px", fontWeight: 700, cursor: "pointer",
        fontSize: 14, display: "inline-flex", alignItems: "center", gap: 7,
        fontFamily: "inherit",
      }}>
        <FiRefreshCw size={14} /> Try Again
      </button>
    </div>
  );
}

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("search") || "");
  const [debounced, setDebounced] = useState(() => searchParams.get("search") || "");
  const [region, setRegion] = useState(() => searchParams.get("region") || "all");
  const [sortBy, setSortBy] = useState("featured");
  const [searching, setSearching] = useState(false);
  const [mapCountry, setMapCountry] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => { injectCSS(); }, []);

  const { countries: raw = [], loading, error, refetch } = useCountries({ limit: 50 });

  const regions = useMemo(() => {
    const set = new Set();
    raw.forEach((c) => { const r = getRegion(c); if (r) set.add(r); });
    return Array.from(set).sort();
  }, [raw]);

  const stats = useMemo(() => ({
    countries: raw.length,
    destinations: raw.reduce((a, c) => a + (getDestCount(c) || 0), 0),
    featured: raw.filter((c) => c.isFeatured).length,
    regions: regions.length,
  }), [raw, regions]);

  const filtered = useMemo(() => {
    let list = raw;
    if (region !== "all") list = list.filter((c) => getRegion(c) === region);
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter((c) =>
        [c.name, getRegion(c), getCapital(c)].filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "name": return (a.name || "").localeCompare(b.name || "");
        case "rating": return (getRating(b) || 0) - (getRating(a) || 0);
        case "destinations": return (getDestCount(b) || 0) - (getDestCount(a) || 0);
        case "popular": return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        default: return ((b.isFeatured ? 2 : 0) + (b.isPopular ? 1 : 0)) - ((a.isFeatured ? 2 : 0) + (a.isPopular ? 1 : 0));
      }
    });
  }, [raw, region, debounced, sortBy]);

  useEffect(() => {
    if (query === debounced) { setSearching(false); return; }
    setSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setDebounced(query); setSearching(false); }, 280);
    return () => clearTimeout(timerRef.current);
  }, [query, debounced]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (debounced) p.set("search", debounced);
    if (region !== "all") p.set("region", region);
    setSearchParams(p, { replace: true });
  }, [debounced, region, setSearchParams]);

  const clearAll = useCallback(() => { setQuery(""); setDebounced(""); setRegion("all"); }, []);
  const hasFilters = Boolean(debounced) || region !== "all";
  const skeletons = typeof window !== "undefined" && window.innerWidth < 640 ? 4 : 8;

  return (
    <div style={{ background: "#f8faf9", minHeight: "100vh" }}>
      <PageHeader
        title="Explore the World"
        subtitle="Discover extraordinary countries across East Africa and beyond — rich in wildlife, culture, and breathtaking landscapes."
        backgroundImage="https://i.pinimg.com/1200x/ca/2b/b9/ca2bb955ebe6cde00add738468d44f30.jpg"
        breadcrumbs={[{ label: "Destinations" }]}
        height="480px"
        tagline="Choose Your Destination"
      >
        {!loading && raw.length > 0 && (
          <div className="dc-stat-strip">
            {[
              { num: stats.countries, label: "Countries" },
              stats.destinations > 0 && { num: stats.destinations, label: "Experiences" },
              stats.featured > 0 && { num: stats.featured, label: "Featured" },
              stats.regions > 0 && { num: stats.regions, label: "Regions" },
            ].filter(Boolean).map((s) => (
              <div key={s.label} className="dc-stat-pill">
                <span className="dc-stat-pill__num">{s.num}</span>
                <span style={{ opacity: 0.85 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </PageHeader>

      <section style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(14px, 3vw, 28px) 80px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <AnimatedSection animation="fadeInUp" delay={0.05}>
            <div style={{
              background: "#fff", borderRadius: 18,
              padding: "clamp(16px, 2vw, 24px)",
              marginBottom: "clamp(16px, 2.5vw, 28px)",
              boxShadow: "0 2px 16px rgba(2,44,34,0.05)",
              border: "1px solid rgba(2,44,34,0.06)",
            }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: "clamp(160px, 30vw, 300px)", position: "relative" }}>
                  <FiSearch size={15} style={{
                    position: "absolute", left: 12, top: "50%",
                    transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none",
                  }} />
                  <input
                    type="text"
                    className="dc-search__input"
                    placeholder="Search countries, regions…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 40px 10px 38px",
                      fontSize: 13.5, fontWeight: 500,
                      border: `1px solid ${searching ? "#059669" : "rgba(2,44,34,0.1)"}`,
                      borderRadius: 11, boxSizing: "border-box",
                      background: "#fff", color: "#022C22", fontFamily: "inherit",
                      boxShadow: searching ? "0 0 0 3px rgba(5,150,105,0.08)" : "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  />
                  <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
                    {searching ? (
                      <span style={{
                        width: 14, height: 14, border: "2px solid #d1fae5",
                        borderTopColor: "#059669", borderRadius: "50%",
                        display: "block", animation: "dest-spin 0.7s linear infinite",
                      }} />
                    ) : query ? (
                      <button onClick={() => setQuery("")} style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: "none", background: "#f0fdf4",
                        display: "grid", placeItems: "center",
                        cursor: "pointer", color: "#059669",
                      }}>
                        <FiX size={11} />
                      </button>
                    ) : null}
                  </div>
                </div>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="dc-sort">
                  <option value="featured">✨ Featured</option>
                  <option value="popular">🔥 Popular</option>
                  <option value="rating">⭐ Top Rated</option>
                  <option value="destinations">📍 Most Destinations</option>
                  <option value="name">🔤 A–Z</option>
                </select>

                {hasFilters && (
                  <button onClick={clearAll} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "8px 14px", border: "1px solid rgba(2,44,34,0.15)",
                    borderRadius: 10, background: "#f0fdf4", color: "#022C22",
                    cursor: "pointer", fontWeight: 700, fontSize: 12.5,
                    whiteSpace: "nowrap", fontFamily: "inherit",
                  }}>
                    <FiX size={12} /> Clear
                  </button>
                )}
              </div>

              {regions.length > 0 && (
                <div style={{
                  display: "flex", gap: 6, flexWrap: "wrap",
                  marginTop: 14, paddingTop: 14,
                  borderTop: "1px solid rgba(2,44,34,0.05)",
                  overflowX: "auto", paddingBottom: 2,
                }}>
                  <button
                    className={`dc-tab${region === "all" ? " dc-tab--active" : ""}`}
                    onClick={() => setRegion("all")}
                  >
                    🌍 All
                  </button>
                  {regions.map((r) => (
                    <button key={r}
                      className={`dc-tab${region === r ? " dc-tab--active" : ""}`}
                      onClick={() => setRegion(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 12, paddingTop: 12,
                borderTop: "1px solid rgba(2,44,34,0.05)",
                flexWrap: "wrap", gap: 6,
              }}>
                <span style={{ fontSize: 12.5, color: "#6b7280" }}>
                  {loading || searching ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        width: 12, height: 12, border: "2px solid #d1fae5",
                        borderTopColor: "#059669", borderRadius: "50%",
                        display: "inline-block", animation: "dest-spin 0.7s linear infinite",
                      }} />
                      {searching ? "Searching…" : "Loading…"}
                    </span>
                  ) : (
                    <>
                      <strong style={{ color: "#059669" }}>{filtered.length}</strong>
                      {" "}countr{filtered.length === 1 ? "y" : "ies"}
                      {debounced && <> for <em style={{ color: "#022C22" }}>"{debounced}"</em></>}
                      {region !== "all" && <> in <em style={{ color: "#022C22" }}>{region}</em></>}
                    </>
                  )}
                </span>
                {hasFilters && !loading && (
                  <button onClick={clearAll} style={{
                    background: "none", border: "none", color: "#059669",
                    fontWeight: 600, fontSize: 12, cursor: "pointer",
                    padding: 0, textDecoration: "underline", fontFamily: "inherit",
                  }}>
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </AnimatedSection>

          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (
            <div className="dc-grid">
              {loading
                ? Array.from({ length: skeletons }, (_, i) => <SkeletonCard key={i} />)
                : filtered.length === 0
                  ? <EmptyState query={debounced} onClear={clearAll} />
                  : filtered.map((country, i) => (
                      <CountryCard key={country.id || country.slug || country.name}
                        country={country} index={i} onMapClick={setMapCountry}
                      />
                    ))}
            </div>
          )}

          {!loading && !error && filtered.length >= 4 && (
            <div style={{ textAlign: "center", marginTop: "clamp(40px, 5vw, 64px)" }}>
              <p style={{ color: "#9ca3af", fontSize: 12.5, marginBottom: 14 }}>
                {filtered.length} countr{filtered.length === 1 ? "y" : "ies"} · Your next adventure awaits
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ height: 1, width: 60, background: "linear-gradient(to right, transparent, #d1fae5)" }} />
                <FiGlobe size={18} color="#059669" />
                <div style={{ height: 1, width: 60, background: "linear-gradient(to left, transparent, #d1fae5)" }} />
              </div>
              <div style={{ marginTop: 28 }}>
                <Link to="/interactive-map" style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #059669, #022C22)",
                  color: "#fff", borderRadius: 12, fontWeight: 700,
                  fontSize: 14, textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(5,150,105,0.3)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(5,150,105,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(5,150,105,0.3)";
                  }}
                >
                  <FiMap size={16} /> Explore Interactive Map
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {mapCountry && <MapModal country={mapCountry} onClose={() => setMapCountry(null)} />}
    </div>
  );
}