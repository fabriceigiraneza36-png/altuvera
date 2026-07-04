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
    max-width: 1100px;
    width: 100%;
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
  @media (max-width: 600px) {
    .g-masonry { columns: 1; }
    .g-grid-4  { grid-template-columns: 1fr !important; }
    .g-lightbox-nav { display:none !important; }
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
          border: "1px solid rgba(255,255,255,0.18)",
          color: isFav ? "#EF4444" : "rgba(255,255,255,0.9)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s",
        }}
      >
        <FiHeart size={13} fill={isFav ? "#EF4444" : "none"} />
      </button>

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "16px 12px 12px", zIndex: 3,
      }}>
        {image.title && (
          <h4 style={{
            color: "white", fontSize: 13, fontWeight: 700,
            lineHeight: 1.3, marginBottom: 3,
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}>
            {image.title}
          </h4>
        )}
        {image.location && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            color: "rgba(255,255,255,0.75)", fontSize: 11,
          }}>
            <FiMapPin size={9} /> {image.location}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   LIGHTBOX
   ═══════════════════════════════════════════════════════ */
const Lightbox = ({ image, images, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const idx = images.findIndex((i) => i.id === image.id);

  return (
    <div
      className="g-lightbox-backdrop"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="g-focus"
        aria-label="Close lightbox"
        style={{
          position: "fixed", top: 20, right: 20, zIndex: 10001,
          width: 44, height: 44, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "white", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          fontSize: 22, fontWeight: 300,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.3)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
        }}
      >
        <FiX size={20} />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="g-lightbox-nav g-focus"
        aria-label="Previous"
        disabled={idx === 0}
        style={{
          position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)",
          zIndex: 10001, width: 48, height: 48, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "white", cursor: idx === 0 ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: idx === 0 ? 0.35 : 1,
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => { if (idx !== 0) e.currentTarget.style.backgroundColor = "rgba(5,150,105,0.3)"; }}
        onMouseOut={(e)  => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
      >
        <FiChevronLeft size={22} />
      </button>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="g-lightbox-nav g-focus"
        aria-label="Next"
        disabled={idx === images.length - 1}
        style={{
          position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
          zIndex: 10001, width: 48, height: 48, borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "white", cursor: idx === images.length - 1 ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: idx === images.length - 1 ? 0.35 : 1,
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => { if (idx !== images.length - 1) e.currentTarget.style.backgroundColor = "rgba(5,150,105,0.3)"; }}
        onMouseOut={(e)  => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
      >
        <FiChevronRight size={22} />
      </button>

      {/* Content */}
      <div
        className="g-lightbox-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 0,
          backgroundColor: "#0a0a0a",
          borderRadius: "var(--g-radius-xl)",
          overflow: "hidden",
          maxHeight: "90vh",
        }}
      >
        {/* Image */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "#000", maxHeight: "90vh", overflow: "hidden",
        }}>
          <img
            src={image.src || image.thumb}
            alt={image.alt}
            style={{
              maxWidth: "100%", maxHeight: "90vh",
              objectFit: "contain", display: "block",
            }}
          />
        </div>

        {/* Info panel */}
        <div style={{
          width: 280, padding: "28px 22px",
          backgroundColor: "#111", color: "white",
          overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 18,
        }}>
          {/* Category */}
          <Pill variant="green" size="sm" icon={<FiTag size={10} />}>
            {image.category}
          </Pill>

          {/* Title */}
          {image.title && (
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700, color: "white",
              lineHeight: 1.3,
            }}>
              {image.title}
            </h3>
          )}

          {/* Description */}
          {image.description && (
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
              {image.description}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              image.location     && { icon: <FiMapPin size={13} />,   label: "Location",   val: image.location },
              image.countryName  && { icon: <FiHome size={13} />,     label: "Country",    val: image.countryName },
              image.photographer && { icon: <FiCamera size={13} />,   label: "Photographer", val: image.photographer },
              image.viewCount    && { icon: <FiEye size={13} />,      label: "Views",      val: image.viewCount },
            ].filter(Boolean).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{
                  color: "#34D399", marginTop: 1, flexShrink: 0,
                }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                    {item.val}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {image.tags?.length > 0 && (
            <div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {image.tags.map((t) => (
                  <span key={t} style={{
                    padding: "3px 10px", borderRadius: "var(--g-radius-full)",
                    backgroundColor: "rgba(5,150,105,0.15)",
                    color: "#34D399", fontSize: 11.5, fontWeight: 500,
                  }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Counter */}
          <div style={{
            marginTop: "auto", paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12, color: "rgba(255,255,255,0.35)",
            textAlign: "center",
          }}>
            {idx + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN GALLERY PAGE
   ═══════════════════════════════════════════════════════ */
const Gallery = () => {
  const {
    images, categories, tags, loading, error,
    pagination, params, updateParams, setPage, refetch,
  } = useGallery();

  /* ── Local UI state ─────────────────────────────────── */
  const [layout,     setLayout]     = useState("grid");    // "grid" | "masonry" | "list"
  const [lightbox,   setLightbox]   = useState(null);
  const [favourites, setFavourites] = useState(new Set());
  const [backToTop,  setBackToTop]  = useState(false);
  const [showFilters,setShowFilters]= useState(false);
  const [search,     setSearch]     = useState("");
  const searchTimer = useRef(null);

  const w        = useWidth();
  const isMobile = w < 768;

  /* ── Debounced search ────────────────────────────────── */
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      updateParams({ search: val });
    }, 400);
  };

  /* ── Back-to-top ─────────────────────────────────────── */
  useEffect(() => {
    const fn = () => setBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Lightbox navigation ─────────────────────────────── */
  const openLightbox = useCallback((img) => setLightbox(img), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const lbIndex = useMemo(
    () => images.findIndex((i) => i.id === lightbox?.id),
    [images, lightbox]
  );

  const prevImage = useCallback(() => {
    if (lbIndex > 0) setLightbox(images[lbIndex - 1]);
  }, [lbIndex, images]);

  const nextImage = useCallback(() => {
    if (lbIndex < images.length - 1) setLightbox(images[lbIndex + 1]);
  }, [lbIndex, images]);

  /* ── Favourites ──────────────────────────────────────── */
  const toggleFav = useCallback((id) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ── Stats ───────────────────────────────────────────── */
  const totalImages    = pagination?.total || images.length;
  const totalCats      = categories.length;
  const featuredCount  = images.filter((i) => i.isFeatured).length;

  /* ── Sort options ────────────────────────────────────── */
  const SORT_OPTS = [
    { value: "featured", label: "Featured First" },
    { value: "newest",   label: "Newest" },
    { value: "oldest",   label: "Oldest" },
    { value: "popular",  label: "Most Viewed" },
    { value: "title_asc",label: "Title A→Z" },
  ];

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <>
      <SEO
        title="Gallery - Altuvera"
        description="Explore stunning images from East Africa's most extraordinary destinations"
        url="/gallery"
        keywords={["east africa", "gallery", "travel photography", "safari", "wildlife"]}
      />

      <style>{STYLES}</style>

      <PageHeader
        title="Photo Gallery"
        subtitle="A curated collection of East Africa's most breathtaking landscapes, wildlife and culture"
        backgroundImage="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600"
        breadcrumbs={[{ label: "Gallery" }]}
      />

      <section style={{
        padding: isMobile ? "28px 16px 72px" : "56px 24px 112px",
        maxWidth: 1380, margin: "0 auto",
      }}>

        {/* ════ STATS ════ */}
        <AnimatedSection animation="fadeInUp">
          <div style={{ display: "flex", gap: 14, marginBottom: 38, flexWrap: "wrap" }}>
            {[
              { icon: <FiImage size={17} />,   value: loading ? "…" : totalImages, label: "Total Images" },
              { icon: <FiTag size={17} />,     value: loading ? "…" : totalCats,   label: "Categories" },
              { icon: <FiStar size={17} />,    value: loading ? "…" : featuredCount, label: "Featured" },
              { icon: <FiHeart size={17} />,   value: favourites.size,              label: "Your Favourites" },
            ].map((s, i) => (
              <StatCard key={i} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </div>
        </AnimatedSection>

        {/* ════ FILTER BAR ════ */}
        <AnimatedSection animation="fadeInUp">
          <div style={{
            display: "flex", gap: 12, marginBottom: 28,
            alignItems: "center", flexWrap: "wrap",
          }}>
            {/* Search */}
            <div className="g-search-wrap" style={{
              position: "relative", flex: "1 1 280px",
              maxWidth: isMobile ? "100%" : 380,
            }}>
              <FiSearch size={16} style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", color: "#9CA3AF",
              }} />
              <input
                type="text"
                placeholder="Search images, locations…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="g-focus"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 40px 12px 44px",
                  borderRadius: "var(--g-radius-full)",
                  border: "2px solid #E5E7EB", backgroundColor: "white",
                  fontSize: 13.5, color: "#374151", outline: "none",
                  transition: "all 0.3s var(--g-ease)",
                  boxShadow: "var(--g-shadow-sm)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.boxShadow   = "0 0 0 3px rgba(5,150,105,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow   = "var(--g-shadow-sm)";
                }}
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#9CA3AF", padding: 3, display: "flex",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseOut={(e)  => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="g-scroll-hidden" style={{
              display: "flex", gap: 7, overflowX: "auto", flexWrap: "nowrap", flex: "2 1 auto",
            }}>
              <Pill
                active={params.category === ""}
                onClick={() => updateParams({ category: "" })}
                size="md"
              >
                All
              </Pill>
              {categories.map((c) => (
                <Pill
                  key={c.category}
                  active={params.category === c.category}
                  onClick={() => updateParams({ category: c.category })}
                  size="md"
                >
                  {c.category}
                  <span style={{
                    marginLeft: 5, fontSize: 10.5, opacity: 0.65,
                    backgroundColor: "rgba(0,0,0,0.06)",
                    padding: "1px 5px", borderRadius: 8,
                  }}>
                    {c.count}
                  </span>
                </Pill>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
              {/* Sort */}
              <div style={{ position: "relative" }}>
                <select
                  value={params.sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="g-focus"
                  style={{
                    padding: "9px 32px 9px 12px",
                    borderRadius: "var(--g-radius-sm)",
                    border: "2px solid #E5E7EB", backgroundColor: "white",
                    fontSize: 13, fontWeight: 600, color: "#374151",
                    cursor: "pointer", outline: "none", appearance: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#059669")}
                  onBlur={(e)  => (e.target.style.borderColor = "#E5E7EB")}
                >
                  {SORT_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <FiChevronDown size={12} style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none",
                }} />
              </div>

              {/* Layout toggle */}
              <div style={{
                display: "flex", padding: 4,
                backgroundColor: "#F3F4F6", borderRadius: "var(--g-radius-sm)",
              }}>
                {[
                  { mode: "grid",    icon: <FiGrid size={14} /> },
                  { mode: "masonry", icon: <FiSliders size={14} /> },
                  { mode: "list",    icon: <FiList size={14} /> },
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setLayout(mode)}
                    className="g-focus"
                    title={mode}
                    style={{
                      width: 32, height: 32, borderRadius: 6, border: "none",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: layout === mode ? "white" : "transparent",
                      color: layout === mode ? "#059669" : "#9CA3AF",
                      boxShadow: layout === mode ? "var(--g-shadow-sm)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Tags row */}
        {tags.length > 0 && (
          <div className="g-scroll-hidden" style={{
            display: "flex", gap: 6, marginBottom: 24,
            overflowX: "auto", flexWrap: "nowrap",
            paddingBottom: 4,
          }}>
            {tags.slice(0, 20).map((t) => (
              <button
                key={t.tag}
                onClick={() => updateParams({ tag: params.tag === t.tag ? "" : t.tag })}
                className="g-focus"
                style={{
                  padding: "4px 11px", borderRadius: "var(--g-radius-full)",
                  border: "1px solid",
                  borderColor: params.tag === t.tag ? "#059669" : "#E5E7EB",
                  backgroundColor: params.tag === t.tag ? "#ECFDF5" : "white",
                  color: params.tag === t.tag ? "#059669" : "#6B7280",
                  fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}
              >
                #{t.tag}
                <span style={{ marginLeft: 4, opacity: 0.55 }}>{t.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Section header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 8,
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em",
          }}>
            {params.category ? params.category : "All Photos"}
          </h2>
          {!loading && (
            <span style={{
              fontSize: 13, color: "#9CA3AF", fontWeight: 500,
              padding: "4px 12px", backgroundColor: "#F3F4F6",
              borderRadius: "var(--g-radius-full)",
            }}>
              {totalImages} image{totalImages !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ════ CONTENT ════ */}
        <AnimatedSection animation="fadeInUp">
          {loading ? (
            /* Skeletons */
            layout === "masonry" ? (
              <div className="g-masonry">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="g-masonry-item">
                    <SkeletonCard height={[240, 300, 200, 280][i % 4]} />
                  </div>
                ))}
              </div>
            ) : layout === "list" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{
                    height: 120, borderRadius: "var(--g-radius-lg)",
                    overflow: "hidden",
                  }}>
                    <div className="g-shimmer" style={{ height: "100%" }} />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="g-grid-4"
                style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}
              >
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : images.length === 0 ? (
            <EmptyState onClear={() => updateParams({
              category: "", search: "", tag: "",
            })} />
          ) : layout === "masonry" ? (
            <div className="g-masonry">
              {images.map((img, i) => (
                <MasonryCard
                  key={img.id}
                  image={img}
                  index={i}
                  onOpen={openLightbox}
                  isFav={favourites.has(img.id)}
                  onFav={toggleFav}
                />
              ))}
            </div>
          ) : layout === "list" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="g-card"
                  onClick={() => openLightbox(img)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "clamp(140px,22%,220px) 1fr",
                    borderRadius: "var(--g-radius-lg)",
                    overflow: "hidden",
                    backgroundColor: "white",
                    boxShadow: "var(--g-shadow-sm)",
                    border: "1px solid #F3F4F6",
                    animation: `gSlideUp 0.4s ease ${i * 0.04}s both`,
                  }}
                >
                  <div style={{ overflow: "hidden", position: "relative" }}>
                    <img
                      src={img.thumb || img.src} alt={img.alt} loading="lazy"
                      className="g-card-img"
                      style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                    />
                    {img.isFeatured && (
                      <div style={{ position: "absolute", top: 6, left: 6 }}>
                        <Pill variant="glass" size="sm" icon={<FiStar size={9} />}>★</Pill>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Pill variant="green" size="sm" style={{ marginBottom: 6 }}>{img.category}</Pill>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4, lineHeight: 1.3 }}>
                      {img.title || "Untitled"}
                    </h4>
                    {img.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9CA3AF" }}>
                        <FiMapPin size={11} /> {img.location}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#9CA3AF" }}>
                        <FiEye size={11} /> {img.viewCount}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFav(img.id); }}
                        className="g-focus"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: favourites.has(img.id) ? "#EF4444" : "#9CA3AF",
                          display: "flex", alignItems: "center", gap: 3,
                          fontSize: 11.5, padding: 0, transition: "color 0.2s",
                        }}
                      >
                        <FiHeart size={11} fill={favourites.has(img.id) ? "#EF4444" : "none"} />
                        {favourites.has(img.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid (default) */
            <div
              className="g-grid-4"
              style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}
            >
              {images.map((img, i) => (
                <GalleryCard
                  key={img.id}
                  image={img}
                  index={i}
                  onOpen={openLightbox}
                  isFav={favourites.has(img.id)}
                  onFav={toggleFav}
                />
              ))}
            </div>
          )}
        </AnimatedSection>

        {/* ════ PAGINATION ════ */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <AnimatedSection animation="fadeInUp">
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              gap: 8, marginTop: 48, flexWrap: "wrap",
            }}>
              <button
                onClick={() => setPage(Math.max(1, params.page - 1))}
                disabled={params.page === 1}
                className="g-focus"
                style={{
                  width: 40, height: 40, borderRadius: "var(--g-radius-sm)",
                  border: "1px solid #E5E7EB", backgroundColor: "white",
                  cursor: params.page === 1 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: params.page === 1 ? "#D1D5DB" : "#374151",
                  opacity: params.page === 1 ? 0.5 : 1, transition: "all 0.2s",
                }}
                onMouseOver={(e) => { if (params.page !== 1) { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; } }}
                onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = params.page === 1 ? "#D1D5DB" : "#374151"; }}
              >
                <FiChevronLeft size={17} />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - params.page) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && arr[i - 1] !== p - 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`d-${idx}`} style={{ padding: "0 4px", color: "#9CA3AF", fontSize: 14 }}>…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className="g-focus"
                      style={{
                        width: 40, height: 40, borderRadius: "var(--g-radius-sm)",
                        border: item === params.page ? "2px solid #059669" : "1px solid #E5E7EB",
                        backgroundColor: item === params.page ? "#059669" : "white",
                        color: item === params.page ? "white" : "#374151",
                        cursor: "pointer", fontSize: 13.5,
                        fontWeight: item === params.page ? 700 : 500,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                        boxShadow: item === params.page ? "0 4px 14px rgba(5,150,105,0.28)" : "none",
                      }}
                      onMouseOver={(e) => { if (item !== params.page) { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; } }}
                      onMouseOut={(e)  => { if (item !== params.page) { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; } }}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(Math.min(pagination.totalPages, params.page + 1))}
                disabled={params.page === pagination.totalPages}
                className="g-focus"
                style={{
                  width: 40, height: 40, borderRadius: "var(--g-radius-sm)",
                  border: "1px solid #E5E7EB", backgroundColor: "white",
                  cursor: params.page === pagination.totalPages ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: params.page === pagination.totalPages ? "#D1D5DB" : "#374151",
                  opacity: params.page === pagination.totalPages ? 0.5 : 1, transition: "all 0.2s",
                }}
                onMouseOver={(e) => { if (params.page !== pagination.totalPages) { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; } }}
                onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = params.page === pagination.totalPages ? "#D1D5DB" : "#374151"; }}
              >
                <FiChevronRight size={17} />
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 10 }}>
              Page {params.page} of {pagination.totalPages} · {totalImages} images
            </p>
          </AnimatedSection>
        )}
      </section>

      {/* ════ LIGHTBOX ════ */}
      {lightbox && (
        <Lightbox
          image={lightbox}
          images={images}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

      {/* ════ BACK TO TOP ════ */}
      {backToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="g-btn-primary g-focus"
          aria-label="Back to top"
          style={{
            position: "fixed", bottom: 28, right: 28,
            width: 48, height: 48, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 0,
            animation: "gBounceIn 0.4s ease",
          }}
        >
          <FiArrowUp size={19} />
        </button>
      )}
    </>
  );
};

export default Gallery;