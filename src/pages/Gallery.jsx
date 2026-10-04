// src/pages/Gallery.jsx
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiX,
  FiGrid,
  FiList,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiArrowUp,
  FiTag,
  FiMapPin,
  FiCamera,
  FiStar,
  FiHeart,
  FiDownload,
  FiShare2,
  FiZoomIn,
  FiRefreshCw,
  FiAlertCircle,
  FiImage,
  FiChevronDown,
  FiSliders,
} from "react-icons/fi";
import SEO from "../components/common/SEO";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import { useGallery } from "../hooks/useGallery";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap');

  :root {
    --g-green-50:   #ECFDF5;
    --g-green-100:  #D1FAE5;
    --g-green-200:  #A7F3D0;
    --g-green-400:  #34D399;
    --g-green-500:  #10B981;
    --g-green-600:  #059669;
    --g-green-700:  #047857;
    --g-green-800:  #065F46;
    --g-green-900:  #064E3B;
    --g-white:      #FFFFFF;
    --g-off-white:  #F8FFFE;
    --g-gray-50:    #F9FAFB;
    --g-gray-100:   #F3F4F6;
    --g-gray-200:   #E5E7EB;
    --g-gray-400:   #9CA3AF;
    --g-gray-500:   #6B7280;
    --g-gray-600:   #4B5563;
    --g-gray-700:   #374151;
    --g-gray-800:   #1F2937;
    --g-gray-900:   #111827;
    --g-shadow-sm:  0 1px 4px rgba(5,150,105,0.06);
    --g-shadow-md:  0 4px 20px rgba(5,150,105,0.10);
    --g-shadow-lg:  0 12px 44px rgba(5,150,105,0.14);
    --g-shadow-xl:  0 24px 64px rgba(5,150,105,0.18);
    --g-shadow-green: 0 8px 32px rgba(5,150,105,0.24);
    --g-radius-sm:  8px;
    --g-radius-md:  14px;
    --g-radius-lg:  20px;
    --g-radius-xl:  28px;
    --g-radius-full:9999px;
    --g-ease:       cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Animations ── */
  @keyframes gFadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gSlideUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gScaleIn {
    from { opacity:0; transform:scale(0.88); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes gShimmer {
    0%   { background-position:-200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes gFloat {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-8px); }
  }
  @keyframes gBounceIn {
    0%   { transform:scale(0.3); opacity:0; }
    50%  { transform:scale(1.06); }
    70%  { transform:scale(0.92); }
    100% { transform:scale(1);   opacity:1; }
  }
  @keyframes gLightboxIn {
    from { opacity:0; transform:scale(0.92) translateY(20px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  /* ── Shimmer ── */
  .g-shimmer {
    background: linear-gradient(110deg,#d1fae5 8%,#ecfdf5 18%,#d1fae5 33%);
    background-size: 200% 100%;
    animation: gShimmer 1.6s ease infinite;
  }

  /* ── Card hover ── */
  .g-card {
    transition: all 0.38s var(--g-ease);
    cursor: pointer;
  }
  .g-card:hover { transform: translateY(-6px); }
  .g-card:hover .g-card-overlay { opacity: 1; }
  .g-card:hover .g-card-img { transform: scale(1.08); }
  .g-card:hover .g-card-actions { opacity:1; transform:translateY(0); }

  /* ── Card overlay ── */
  .g-card-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(6,79,70,0.88) 0%, rgba(6,79,70,0.3) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.38s var(--g-ease);
  }

  /* ── Card image ── */
  .g-card-img {
    transition: transform 0.6s var(--g-ease);
    will-change: transform;
  }

  /* ── Card actions ── */
  .g-card-actions {
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s var(--g-ease);
  }

  /* ── Focus ring ── */
  .g-focus:focus-visible {
    outline: 2px solid var(--g-green-600);
    outline-offset: 2px;
  }

  /* ── Primary button ── */
  .g-btn-primary {
    background: linear-gradient(135deg,#059669,#047857);
    color: white; border: none; cursor: pointer;
    font-weight: 700;
    transition: all 0.3s var(--g-ease);
    box-shadow: var(--g-shadow-green);
    position: relative; overflow: hidden;
  }
  .g-btn-primary::before {
    content:''; position:absolute; top:50%; left:50%;
    width:0; height:0; border-radius:50%;
    background:rgba(255,255,255,0.18);
    transform:translate(-50%,-50%);
    transition: width 0.5s, height 0.5s;
  }
  .g-btn-primary:hover::before { width:320px; height:320px; }
  .g-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 14px 44px rgba(5,150,105,0.36);
  }
  .g-btn-primary:active { transform: translateY(0) scale(0.98); }

  /* ── Scrollbar hidden ── */
  .g-scroll-hidden::-webkit-scrollbar { display:none; }
  .g-scroll-hidden { -ms-overflow-style:none; scrollbar-width:none; }

  /* ── Pill ── */
  .g-pill-hover:hover {
    border-color: #059669 !important;
    color: #059669 !important;
    transform: translateY(-1px) scale(1.03);
  }

  /* ── Masonry grid ── */
  .g-masonry {
    columns: 4;
    column-gap: 16px;
  }
  .g-masonry-item {
    break-inside: avoid;
    margin-bottom: 16px;
    display: block;
  }

  /* ── Lightbox ── */
  .g-lightbox-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.96);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: gFadeUp 0.2s ease;
  }
  .g-lightbox-content {
    animation: gLightboxIn 0.35s var(--g-ease);
    max-width: 1500px;
    width: 100%;
    height: 90vh;
  }

  /* ── Responsive ── */
  @media (max-width: 1200px) {
    .g-masonry { columns: 3; }
    .g-grid-4  { grid-template-columns: repeat(3,1fr) !important; }
  }
  @media (max-width: 900px) {
    .g-masonry { columns: 2; }
    .g-grid-4  { grid-template-columns: repeat(2,1fr) !important; }
    .g-filter-bar { flex-direction:column !important; align-items:stretch !important; }
    .g-search-wrap { max-width:100% !important; }
  }
  @media (max-width: 768px) {
    .g-lightbox-backdrop {
      padding: 8px;
    }

    .g-lightbox-nav {
      display: none !important;
    }

    .g-lightbox-content {
      height: 100vh !important;
      max-height: 100vh !important;
    }
  }
  @media (max-width: 600px) {
    .g-masonry { columns: 1; }
    .g-grid-4  { grid-template-columns: 1fr !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════
   UTILITY: window width hook
   ═══════════════════════════════════════════════════════ */
const useWidth = () => {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    let t;
    const fn = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 100); };
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("resize", fn); clearTimeout(t); };
  }, []);
  return w;
};

/* ═══════════════════════════════════════════════════════
   SKELETON CARD
   ═══════════════════════════════════════════════════════ */
const SkeletonCard = ({ height = 240 }) => (
  <div style={{
    borderRadius: "var(--g-radius-lg)",
    overflow: "hidden",
    backgroundColor: "white",
    boxShadow: "var(--g-shadow-sm)",
  }}>
    <div className="g-shimmer" style={{ height }} />
    <div style={{ padding: "14px 16px" }}>
      <div className="g-shimmer" style={{ height: 14, width: "70%", borderRadius: 6, marginBottom: 8 }} />
      <div className="g-shimmer" style={{ height: 12, width: "50%", borderRadius: 6 }} />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════ */
const ErrorState = ({ message, onRetry }) => (
  <div style={{
    textAlign: "center", padding: "72px 24px",
    animation: "gFadeUp 0.4s ease",
  }}>
    <div style={{
      width: 92, height: 92, borderRadius: "50%",
      background: "linear-gradient(135deg,#FEF2F2,#FEE2E2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      <FiAlertCircle size={40} color="#EF4444" />
    </div>
    <h3 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 22, color: "#111827", marginBottom: 8,
    }}>
      Failed to Load Gallery
    </h3>
    <p style={{ color: "#6B7280", marginBottom: 24, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 24px" }}>
      {message || "Something went wrong. Please try again."}
    </p>
    <button
      onClick={onRetry}
      className="g-btn-primary g-focus"
      style={{
        padding: "12px 28px", borderRadius: "var(--g-radius-full)",
        fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8,
      }}
    >
      <FiRefreshCw size={15} /> Try Again
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════ */
const EmptyState = ({ onClear }) => (
  <div style={{
    textAlign: "center", padding: "80px 24px",
    animation: "gFadeUp 0.4s ease",
  }}>
    <div style={{
      width: 100, height: 100, borderRadius: "50%",
      background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 24px",
      animation: "gFloat 3s ease infinite",
    }}>
      <FiImage size={42} color="#059669" />
    </div>
    <h3 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 24, color: "#111827", marginBottom: 8,
    }}>
      No Images Found
    </h3>
    <p style={{ color: "#6B7280", marginBottom: 24, lineHeight: 1.6 }}>
      Try adjusting your filters or search query.
    </p>
    <button
      onClick={onClear}
      className="g-btn-primary g-focus"
      style={{
        padding: "12px 28px", borderRadius: "var(--g-radius-full)", fontSize: 14,
      }}
    >
      Clear Filters
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   PILL COMPONENT
   ═══════════════════════════════════════════════════════ */
const Pill = ({ children, icon, active, onClick, size = "md", variant = "default" }) => {
  const sz = {
    sm: { padding: "4px 10px",  fontSize: 11.5, gap: 4 },
    md: { padding: "7px 16px",  fontSize: 13,   gap: 6 },
    lg: { padding: "10px 22px", fontSize: 14,   gap: 8 },
  }[size];

  const v = {
    default: {
      backgroundColor: active ? "#059669" : "white",
      color:  active ? "white" : "#374151",
      border: active ? "2px solid #059669" : "2px solid #E5E7EB",
      boxShadow: active ? "var(--g-shadow-green)" : "var(--g-shadow-sm)",
    },
    green: {
      backgroundColor: "#ECFDF5", color: "#059669", border: "1px solid #D1FAE5",
    },
    glass: {
      backgroundColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)",
      color: "white", border: "1px solid rgba(255,255,255,0.2)",
    },
  }[variant] || {};

  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={onClick ? "g-focus g-pill-hover" : ""}
      onKeyDown={(e) => { if (onClick && e.key === "Enter") onClick(); }}
      style={{
        display: "inline-flex", alignItems: "center",
        borderRadius: "var(--g-radius-full)", fontWeight: 600,
        letterSpacing: "0.3px", cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s var(--g-ease)", whiteSpace: "nowrap",
        ...sz, ...v,
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════ */
const StatCard = ({ icon, value, label }) => (
  <div
    style={{
      flex: "1 1 160px",
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 18px",
      backgroundColor: "white",
      borderRadius: "var(--g-radius-lg)",
      border: "1px solid #ECFDF5",
      boxShadow: "var(--g-shadow-sm)",
      transition: "all 0.3s var(--g-ease)",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "var(--g-shadow-md)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "var(--g-shadow-sm)";
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#059669", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   GALLERY CARD — GRID / MASONRY
   ═══════════════════════════════════════════════════════ */
const GalleryCard = ({ image, index, onOpen, isFav, onFav }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="g-card"
      onClick={() => onOpen(image)}
      style={{
        borderRadius: "var(--g-radius-lg)",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "white",
        boxShadow: "var(--g-shadow-sm)",
        border: "1px solid #F3F4F6",
        animation: `gSlideUp 0.4s ease ${index * 0.04}s both`,
      }}
    >
      {/* Skeleton */}
      {!loaded && (
        <div className="g-shimmer" style={{ height: 240, position: "absolute", inset: 0, zIndex: 1 }} />
      )}

      {/* Image */}
      <img
        src={image.thumb || image.src}
        alt={image.alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="g-card-img"
        style={{
          width: "100%", height: 240, objectFit: "cover", display: "block",
        }}
      />

      {/* Gradient overlay */}
      <div className="g-card-overlay" />

      {/* Featured badge */}
      {image.isFeatured && (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3 }}>
          <Pill variant="glass" size="sm" icon={<FiStar size={10} />}>Featured</Pill>
        </div>
      )}

      {/* Category badge */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
        <Pill variant="green" size="sm">
          {image.category}
        </Pill>
      </div>

      {/* Action buttons */}
      <div
        className="g-card-actions"
        style={{
          position: "absolute", top: 42, right: 10, zIndex: 3,
          display: "flex", flexDirection: "column", gap: 6,
        }}
      >
        {[
          {
            icon: <FiHeart size={13} fill={isFav ? "#EF4444" : "none"} />,
            color: isFav ? "#EF4444" : "rgba(255,255,255,0.9)",
            bg: isFav ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.15)",
            label: "Favourite",
            onClick: (e) => { e.stopPropagation(); onFav(image.id); },
          },
          {
            icon: <FiZoomIn size={13} />,
            color: "rgba(255,255,255,0.9)",
            bg: "rgba(255,255,255,0.15)",
            label: "Zoom",
            onClick: null,
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            aria-label={btn.label}
            className="g-focus"
            style={{
              width: 30, height: 30, borderRadius: "50%",
              backgroundColor: btn.bg, backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: btn.color, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.25s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.18)")}
            onMouseOut={(e)  => (e.currentTarget.style.transform = "scale(1)")}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Bottom info */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "20px 14px 14px", zIndex: 3,
        transform: "none",
      }}>
        {image.title && (
          <h4 style={{
            color: "white", fontSize: 14, fontWeight: 700,
            lineHeight: 1.3, marginBottom: 4,
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {image.title}
          </h4>
        )}
        {(image.location || image.countryName) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            color: "rgba(255,255,255,0.8)", fontSize: 11.5,
          }}>
            <FiMapPin size={10} />
            {image.location || image.countryName}
          </div>
        )}

        {/* View count */}
        <div style={{
          position: "absolute", bottom: 14, right: 14,
          display: "flex", alignItems: "center", gap: 4,
          color: "rgba(255,255,255,0.7)", fontSize: 11,
        }}>
          <FiEye size={11} /> {image.viewCount}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MASONRY GALLERY CARD (variable height)
   ═══════════════════════════════════════════════════════ */
const MasonryCard = ({ image, index, onOpen, isFav, onFav }) => {
  const [loaded, setLoaded] = useState(false);

  /* Calculate pseudo-random height based on index */
  const heights = [260, 320, 200, 280, 360, 220, 300, 240];
  const h = heights[index % heights.length];

  return (
    <div
      className="g-masonry-item g-card"
      onClick={() => onOpen(image)}
      style={{
        borderRadius: "var(--g-radius-lg)",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "white",
        boxShadow: "var(--g-shadow-sm)",
        border: "1px solid #F3F4F6",
        animation: `gSlideUp 0.4s ease ${index * 0.05}s both`,
      }}
    >
      {!loaded && (
        <div className="g-shimmer" style={{ height: h, position: "absolute", inset: 0, zIndex: 1 }} />
      )}
      <img
        src={image.thumb || image.src}
        alt={image.alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="g-card-img"
        style={{ width: "100%", height: h, objectFit: "cover", display: "block" }}
      />
      <div className="g-card-overlay" />

      {image.isFeatured && (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3 }}>
          <Pill variant="glass" size="sm" icon={<FiStar size={10} />}>Featured</Pill>
        </div>
      )}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
        <Pill variant="green" size="sm">{image.category}</Pill>
      </div>

      {/* Fav button */}
      <button
        onClick={(e) => { e.stopPropagation(); onFav(image.id); }}
        className="g-card-actions g-focus"
        aria-label="Favourite"
        style={{
          position: "absolute", top: 44, right: 10, zIndex: 3,
          width: 30, height: 30, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.18)"
