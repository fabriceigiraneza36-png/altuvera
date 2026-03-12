// src/pages/InteractiveMap.jsx

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import {
  FiMapPin,
  FiArrowRight,
  FiArrowLeft,
  FiZoomIn,
  FiZoomOut,
  FiSearch,
  FiShuffle,
  FiMap,
  FiGlobe,
  FiLayers,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiClock,
  FiStar,
  FiRefreshCw,
  FiAlertCircle,
  FiCompass,
  FiNavigation,
  FiMaximize2,
  FiMinimize2,
  FiGrid,
  FiHeart,
  FiShare2,
  FiBookmark,
  FiArrowUp,
  FiCamera,
  FiUsers,
  FiSun,
  FiThermometer,
  FiDollarSign,
  FiPhone,
  FiAward,
  FiExternalLink,
  FiDownload,
  FiEye,
  FiTarget,
  FiCrosshair,
  FiMove,
  FiRotateCcw,
  FiFilter,
  FiList,
  FiMail,
  FiMessageCircle,
  FiZap,
  FiTrendingUp,
  FiMousePointer,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import { useCountries } from "../hooks/useCountries";
import { toGoogleMapEmbedUrl } from "../utils/mediaEmbed";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════ */
const flagAnimVariant = (key = "") => {
  const s = String(key);
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return String((hash % 5) + 1);
};

const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

  :root {
    --im-green-50: #ECFDF5;
    --im-green-100: #D1FAE5;
    --im-green-200: #A7F3D0;
    --im-green-300: #6EE7B7;
    --im-green-400: #34D399;
    --im-green-500: #10B981;
    --im-green-600: #059669;
    --im-green-700: #047857;
    --im-green-800: #065F46;
    --im-green-900: #064E3B;
    --im-white: #FFFFFF;
    --im-off-white: #F7FDF9;
    --im-gray-50: #F9FAFB;
    --im-gray-100: #F3F4F6;
    --im-gray-200: #E5E7EB;
    --im-gray-300: #D1D5DB;
    --im-gray-400: #9CA3AF;
    --im-gray-500: #6B7280;
    --im-gray-600: #4B5563;
    --im-gray-700: #374151;
    --im-gray-800: #1F2937;
    --im-gray-900: #111827;
    --im-shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
    --im-shadow-md: 0 4px 20px rgba(0,0,0,0.08);
    --im-shadow-lg: 0 12px 40px rgba(0,0,0,0.1);
    --im-shadow-xl: 0 20px 60px rgba(0,0,0,0.14);
    --im-shadow-green: 0 8px 30px rgba(5,150,105,0.25);
    --im-radius-sm: 8px;
    --im-radius-md: 14px;
    --im-radius-lg: 20px;
    --im-radius-xl: 28px;
    --im-radius-full: 9999px;
    --im-transition: cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0 rgba(5,150,105,0.6); }
    70%  { box-shadow: 0 0 0 16px rgba(5,150,105,0); }
    100% { box-shadow: 0 0 0 0 rgba(5,150,105,0); }
  }

  @keyframes markerBounce {
    0%, 100% { transform: translate(-50%,-50%) scale(1); }
    50%      { transform: translate(-50%,-50%) scale(1.25); }
  }

  @keyframes slideInInfo {
    from { opacity: 0; transform: translateY(16px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }

  @keyframes bounceIn {
    0%   { transform: scale(0.3); opacity: 0; }
    50%  { transform: scale(1.05); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(5,150,105,0.2); }
    50%      { box-shadow: 0 0 40px rgba(5,150,105,0.4); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes ripple {
    0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.6; }
    100% { transform: translate(-50%,-50%) scale(4); opacity: 0; }
  }

  @keyframes compassSpin {
    0%   { transform: rotate(0deg); }
    25%  { transform: rotate(90deg); }
    50%  { transform: rotate(180deg); }
    75%  { transform: rotate(270deg); }
    100% { transform: rotate(360deg); }
  }

  /* Scrollbar styles */
  .im-scroll-track::-webkit-scrollbar { height: 5px; }
  .im-scroll-track::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.03); border-radius: 3px;
  }
  .im-scroll-track::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #059669, #34D399); border-radius: 3px;
  }

  .im-sidebar-scroll::-webkit-scrollbar { width: 4px; }
  .im-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
  .im-sidebar-scroll::-webkit-scrollbar-thumb {
    background: #D1D5DB; border-radius: 2px;
  }

  .im-no-scrollbar::-webkit-scrollbar { display: none; }
  .im-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Focus ring */
  .im-focus:focus-visible {
    outline: 2px solid var(--im-green-600);
    outline-offset: 2px;
  }

  /* Glass morphism */
  .im-glass {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.6);
  }

  .im-glass-dark {
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  /* Button primary */
  .im-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s var(--im-transition);
    box-shadow: var(--im-shadow-green);
    position: relative;
    overflow: hidden;
  }
  .im-btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .im-btn-primary:hover::before { opacity: 1; }
  .im-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 40px rgba(5,150,105,0.35);
  }
  .im-btn-primary:active {
    transform: translateY(0) scale(0.98);
  }

  /* Card hover */
  .im-card-hover {
    transition: all 0.4s var(--im-transition);
  }
  .im-card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(5,150,105,0.12);
  }

  /* Tooltip */
  .im-tooltip {
    position: relative;
  }
  .im-tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--im-gray-900);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    pointer-events: none;
    z-index: 100;
  }
  .im-tooltip:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }

  /* Line clamp */
  .im-line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .im-line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .im-main-grid {
      grid-template-columns: 1fr !important;
    }
    .im-sidebar {
      position: static !important;
      order: -1 !important;
    }
    .im-map-area {
      height: 500px !important;
    }
  }

  @media (max-width: 768px) {
    .im-map-area {
      height: 400px !important;
      border-radius: var(--im-radius-lg) !important;
    }
    .im-top-controls {
      flex-direction: column !important;
      gap: 8px !important;
    }
    .im-view-toggle {
      font-size: 11px !important;
      padding: 7px 12px !important;
    }
    .im-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .im-features-grid {
      grid-template-columns: 1fr !important;
    }
    .im-quick-nav-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 12px !important;
    }
    .im-zoom-controls {
      bottom: 12px !important;
      right: 12px !important;
    }
    .im-legend-bar {
      display: none !important;
    }
    .im-info-badge {
      top: 12px !important;
      left: 12px !important;
      font-size: 11px !important;
      padding: 8px 14px !important;
    }
    .im-cta-section {
      padding: 40px 20px !important;
    }
  }

  @media (max-width: 480px) {
    .im-map-area {
      height: 320px !important;
      border-radius: var(--im-radius-md) !important;
    }
    .im-thumb-card {
      flex: 0 0 200px !important;
      height: 130px !important;
    }
    .im-stats-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    .im-panel-body {
      padding: 0 20px 20px !important;
    }
    .im-panel-header {
      padding: 20px 20px 0 !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════
   MAP VIEWS
   ═══════════════════════════════════════════════════════ */
const mapViews = {
  physical: {
    name: "Terrain",
    type: "google",
    mapType: "p", // Terrain
    icon: <FiMap size={14} />,
    overlay: "rgba(5, 150, 105, 0.05)",
    description: "Live Google Terrain with elevation and natural features",
  },
  satellite: {
    name: "Satellite",
    type: "google",
    mapType: "k", // Satellite
    icon: <FiGlobe size={14} />,
    overlay: "rgba(15, 23, 42, 0.1)",
    description: "Real-time high-resolution orbital imagery",
  },
  hybrid: {
    name: "Hybrid",
    type: "google",
    mapType: "h", // Hybrid
    icon: <FiLayers size={14} />,
    overlay: "rgba(15, 23, 42, 0.05)",
    description: "Satellite imagery with geographic labels and infrastructure",
  },
  political: {
    name: "Roadmap",
    type: "google",
    mapType: "m", // Roadmap
    icon: <FiNavigation size={14} />,
    overlay: "rgba(30, 41, 59, 0.05)",
    description:
      "Standard political map with regional administrative boundaries",
  },
  topographic: {
    name: "Topographic",
    type: "image",
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1400&q=85",
    icon: <FiTarget size={14} />,
    overlay:
      "linear-gradient(135deg, rgba(2,44,34,0.4) 0%, rgba(5,150,105,0.2) 100%)",
    description: "Stylized artistic representation of vertical relief",
  },
  vintage: {
    name: "Vintage",
    type: "image",
    image:
      "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=1400&q=85",
    icon: <FiBookmark size={14} />,
    overlay: "rgba(107, 73, 43, 0.35)",
    description:
      "Exploring East Africa through a lens of history and exploration",
  },
  dark: {
    name: "Midnight",
    type: "image",
    image:
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1400&q=85",
    icon: <FiZap size={14} />,
    overlay: "rgba(10, 10, 25, 0.75)",
    description: "Clean, high-contrast dark mode optimized for night browsing",
  },
};

/* ═══════════════════════════════════════════════════════
   PREDEFINED MARKER POSITIONS
   ═══════════════════════════════════════════════════════ */
const countryPositions = {
  kenya: { top: "45%", left: "65%" },
  tanzania: { top: "60%", left: "60%" },
  uganda: { top: "40%", left: "50%" },
  rwanda: { top: "52%", left: "45%" },
  burundi: { top: "58%", left: "44%" },
  ethiopia: { top: "25%", left: "65%" },
  "south-sudan": { top: "30%", left: "50%" },
  eritrea: { top: "18%", left: "70%" },
  djibouti: { top: "22%", left: "78%" },
  somalia: { top: "35%", left: "80%" },
};

/* ═══════════════════════════════════════════════════════
   UTILITY HOOKS
   ═══════════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    let t;
    const h = () => {
      clearTimeout(t);
      t = setTimeout(() => setW(window.innerWidth), 150);
    };
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("resize", h);
      clearTimeout(t);
    };
  }, []);
  return w;
};

/* ═══════════════════════════════════════════════════════
   ICON BUTTON COMPONENT
   ═══════════════════════════════════════════════════════ */
const IconBtn = ({
  icon,
  label,
  onClick,
  active,
  variant = "glass",
  size = 44,
  tooltip,
  badge,
  disabled,
}) => {
  const variants = {
    glass: {
      backgroundColor: active
        ? "rgba(5,150,105,0.9)"
        : "rgba(255,255,255,0.92)",
      backdropFilter: "blur(14px)",
      border: "none",
      color: active ? "white" : "#374151",
      boxShadow: "0 3px 14px rgba(0,0,0,0.1)",
    },
    solid: {
      backgroundColor: active ? "#059669" : "#F3F4F6",
      border: "none",
      color: active ? "white" : "#6B7280",
    },
    outline: {
      backgroundColor: active ? "#059669" : "white",
      border: active ? "2px solid #059669" : "2px solid #E5E7EB",
      color: active ? "white" : "#374151",
      boxShadow: "var(--im-shadow-sm)",
    },
    ghost: {
      backgroundColor: "transparent",
      border: "none",
      color: active ? "#059669" : "#9CA3AF",
    },
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      data-tooltip={tooltip}
      disabled={disabled}
      className={`im-focus ${tooltip ? "im-tooltip" : ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: variant === "glass" ? "var(--im-radius-md)" : "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s var(--im-transition)",
        position: "relative",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        ...variants[variant],
      }}
      onMouseOver={(e) => {
        if (disabled) return;
        if (variant === "glass" && !active) {
          e.currentTarget.style.backgroundColor = "#059669";
          e.currentTarget.style.color = "white";
        }
        e.currentTarget.style.transform = "scale(1.08)";
      }}
      onMouseOut={(e) => {
        if (disabled) return;
        if (variant === "glass" && !active) {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.92)";
          e.currentTarget.style.color = "#374151";
        }
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {icon}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: "var(--im-radius-full)",
            backgroundColor: "#EF4444",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            border: "2px solid white",
            animation: "bounceIn 0.4s ease",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════
   PILL COMPONENT
   ═══════════════════════════════════════════════════════ */
const Pill = ({
  children,
  icon,
  variant = "green",
  size = "md",
  onClick,
  active,
}) => {
  const sizes = {
    sm: { padding: "4px 12px", fontSize: 11, gap: 4 },
    md: { padding: "8px 16px", fontSize: 13, gap: 6 },
    lg: { padding: "10px 22px", fontSize: 14, gap: 8 },
  };
  const variants = {
    green: {
      backgroundColor: "#ECFDF5",
      color: "#059669",
      border: "1px solid #D1FAE5",
    },
    solid: {
      background: "linear-gradient(135deg, #059669, #047857)",
      color: "white",
      border: "none",
    },
    outline: {
      backgroundColor: active ? "#059669" : "transparent",
      color: active ? "white" : "#6B7280",
      border: active ? "2px solid #059669" : "1px solid #E5E7EB",
    },
    glass: {
      backgroundColor: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(12px)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.15)",
    },
    white: {
      backgroundColor: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
      color: "#374151",
      border: "none",
      boxShadow: "var(--im-shadow-sm)",
    },
  };

  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={onClick ? "im-focus" : ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--im-radius-full)",
        fontWeight: 600,
        letterSpacing: "0.3px",
        textTransform: "uppercase",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s var(--im-transition)",
        whiteSpace: "nowrap",
        fontFamily: "'Inter', sans-serif",
        ...sizes[size],
        ...variants[variant],
      }}
      onMouseOver={(e) => {
        if (onClick)
          e.currentTarget.style.transform = "translateY(-1px) scale(1.03)";
      }}
      onMouseOut={(e) => {
        if (onClick) e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {icon && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: sizes[size].gap,
          }}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════
   SKELETON LOADERS
   ═══════════════════════════════════════════════════════ */
const shimmerBg = {
  background: "linear-gradient(110deg, #e8f5e9 8%, #f1f8f2 18%, #e8f5e9 33%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease infinite",
};

const SkeletonMap = () => (
  <div
    style={{
      borderRadius: "var(--im-radius-xl)",
      height: "620px",
      ...shimmerBg,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        width: 180,
        height: 40,
        borderRadius: 14,
        ...shimmerBg,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        width: 260,
        height: 44,
        borderRadius: 16,
        ...shimmerBg,
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{ width: 44, height: 44, borderRadius: 13, ...shimmerBg }}
        />
      ))}
    </div>
  </div>
);

const SkeletonSidebar = () => (
  <div
    style={{
      borderRadius: "var(--im-radius-xl)",
      height: "620px",
      ...shimmerBg,
    }}
  />
);

const SkeletonCard = () => (
  <div
    style={{
      flex: "0 0 260px",
      height: "160px",
      borderRadius: "var(--im-radius-lg)",
      ...shimmerBg,
    }}
  />
);

/* ═══════════════════════════════════════════════════════
   ERROR DISPLAY
   ═══════════════════════════════════════════════════════ */
const ErrorDisplay = ({ message, onRetry }) => (
  <div
    style={{
      textAlign: "center",
      padding: "80px 24px",
      background: "linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)",
      borderRadius: "var(--im-radius-xl)",
      maxWidth: "520px",
      margin: "0 auto",
      animation: "scaleIn 0.4s ease",
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
        animation: "pulse 2s ease infinite",
      }}
    >
      <FiAlertCircle size={36} color="#DC2626" />
    </div>
    <h3
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 26,
        color: "#991B1B",
        marginBottom: 12,
      }}
    >
      Map Data Unavailable
    </h3>
    <p
      style={{
        color: "#B91C1C",
        marginBottom: 32,
        lineHeight: 1.6,
        fontSize: 15,
      }}
    >
      {message}
    </p>
    <button
      onClick={onRetry}
      className="im-btn-primary im-focus"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 34px",
        borderRadius: "var(--im-radius-full)",
        fontSize: 15,
      }}
    >
      <FiRefreshCw size={17} /> Reload Map
    </button>
  </div>
);

ErrorDisplay.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

/* ═══════════════════════════════════════════════════════
   SHARE MODAL
   ═══════════════════════════════════════════════════════ */
const ShareModal = ({ country, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "var(--im-radius-xl)",
          padding: 36,
          maxWidth: 420,
          width: "100%",
          animation: "scaleIn 0.3s ease",
          boxShadow: "var(--im-shadow-xl)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Share {country?.name || "Map"}
          </h3>
          <IconBtn
            icon={<FiX size={18} />}
            label="Close"
            onClick={onClose}
            variant="ghost"
            size={36}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {["Twitter", "Facebook", "WhatsApp", "Email"].map((p) => (
            <button
              key={p}
              className="im-focus"
              style={{
                padding: "14px 8px",
                borderRadius: "var(--im-radius-md)",
                border: "1px solid #E5E7EB",
                backgroundColor: "white",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                color: "#374151",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#ECFDF5";
                e.currentTarget.style.borderColor = "#059669";
                e.currentTarget.style.color = "#059669";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#374151";
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "var(--im-radius-md)",
              border: "1px solid #E5E7EB",
              fontSize: 13,
              color: "#6B7280",
              backgroundColor: "#F9FAFB",
              outline: "none",
            }}
          />
          <button
            onClick={copyLink}
            className="im-btn-primary im-focus"
            style={{
              padding: "12px 20px",
              borderRadius: "var(--im-radius-md)",
              fontSize: 13,
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAP MARKER (memoized)
   ═══════════════════════════════════════════════════════ */
const MapMarker = React.memo(
  ({
    country,
    isSelected,
    isHovered,
    onClick,
    onHover,
    position,
    isMobile,
  }) => {
    const size = isSelected
      ? isMobile
        ? "24px"
        : "32px"
      : isHovered
        ? isMobile
          ? "20px"
          : "28px"
        : isMobile
          ? "16px"
          : "22px";

    return (
      <div
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          transform: "translate(-50%, -50%)",
          cursor: "pointer",
          zIndex: isSelected ? 25 : isHovered ? 20 : 10,
          transition: "z-index 0s",
        }}
        onClick={() => onClick(country)}
        onMouseOver={() => onHover(country)}
        onMouseOut={() => onHover(null)}
        onFocus={() => onHover(country)}
        onBlur={() => onHover(null)}
        role="button"
        tabIndex={0}
        aria-label={`Select ${country.name}`}
        onKeyDown={(e) => e.key === "Enter" && onClick(country)}
      >
        {/* Pulse ring */}
        {isSelected && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "40px" : "50px",
              height: isMobile ? "40px" : "50px",
              borderRadius: "50%",
              border: "2px solid rgba(5,150,105,0.35)",
              animation: "pulse 2s infinite",
            }}
          />
        )}

        {/* Ripple effect on click */}
        {isSelected && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "rgba(5,150,105,0.3)",
              animation: "ripple 1.5s ease infinite",
            }}
          />
        )}

        {/* Dot */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: isSelected
              ? "linear-gradient(135deg, #059669, #34D399)"
              : isHovered
                ? "linear-gradient(135deg, #10B981, #6EE7B7)"
                : "rgba(16,185,129,0.85)",
            border: isSelected
              ? "3px solid #fff"
              : "2.5px solid rgba(255,255,255,0.9)",
            boxShadow: isSelected
              ? "0 0 24px rgba(5,150,105,0.5)"
              : isHovered
                ? "0 0 16px rgba(5,150,105,0.3)"
                : "0 2px 10px rgba(0,0,0,0.25)",
            transition: "all 0.3s var(--im-transition)",
            animation:
              isSelected || isHovered ? "markerBounce 0.4s ease" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSelected && (
            <div
              style={{
                width: "40%",
                height: "40%",
                borderRadius: "50%",
                backgroundColor: "white",
              }}
            />
          )}
        </div>

        {/* Tooltip */}
        {(isHovered || isSelected) && !isMobile && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: "16px",
              padding: "12px 18px",
              backgroundColor: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(16px)",
              borderRadius: "var(--im-radius-md)",
              whiteSpace: "nowrap",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              pointerEvents: "none",
              zIndex: 35,
              border: "1px solid rgba(5,150,105,0.12)",
              animation: "slideInInfo 0.25s ease",
            }}
          >
            {/* Arrow */}
            <div
              style={{
                position: "absolute",
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: "12px",
                height: "12px",
                backgroundColor: "rgba(255,255,255,0.97)",
                border: "1px solid rgba(5,150,105,0.12)",
                borderTop: "none",
                borderLeft: "none",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                className="av-flag"
                data-av-flag-anim={flagAnimVariant(country?.code || country?.name)}
                style={{
                  "--av-flag-size": "22px",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
                }}
              >
                {country.flag}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {country.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#059669",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  {country.capital}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

MapMarker.displayName = "MapMarker";

/* ═══════════════════════════════════════════════════════
   COUNTRY QUICK CARD (bottom scroll)
   ═══════════════════════════════════════════════════════ */
const CountryQuickCard = ({
  country,
  isActive,
  onClick,
  isFav,
  onFav,
  index,
}) => (
  <div
    className="im-thumb-card"
    onClick={() => onClick(country)}
    role="button"
    tabIndex={0}
    aria-label={`View ${country.name}`}
    onKeyDown={(e) => e.key === "Enter" && onClick(country)}
    style={{
      flex: "0 0 260px",
      scrollSnapAlign: "start",
      position: "relative",
      borderRadius: "var(--im-radius-lg)",
      overflow: "hidden",
      cursor: "pointer",
      height: "160px",
      transition: "all 0.4s var(--im-transition)",
      border: isActive ? "3px solid #059669" : "3px solid transparent",
      boxShadow: isActive
        ? "0 8px 30px rgba(5,150,105,0.2), 0 0 0 1px rgba(5,150,105,0.1)"
        : "var(--im-shadow-md)",
      transform: isActive ? "translateY(-6px)" : "translateY(0)",
      opacity: isActive ? 1 : 0.9,
      animation: `slideUp 0.4s ease ${index * 0.04}s both`,
    }}
    onMouseOver={(e) => {
      if (!isActive) {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,0,0,0.12)";
      }
    }}
    onMouseOut={(e) => {
      if (!isActive) {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.opacity = "0.9";
        e.currentTarget.style.boxShadow = "var(--im-shadow-md)";
      }
    }}
  >
    {/* Background */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${country.image || country.thumbnail_url || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "transform 0.6s var(--im-transition)",
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    />

    {/* Gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 100%)",
      }}
    />

    {/* Active indicator */}
    {isActive && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #059669, #34D399, #6EE7B7)",
          animation: "glow 2s ease infinite",
        }}
      />
    )}

    {/* Favorite button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onFav?.(country.id);
      }}
      className="im-focus"
      aria-label="Favorite"
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(8px)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isFav ? "#EF4444" : "white",
        transition: "all 0.2s",
        zIndex: 5,
      }}
    >
      <FiHeart size={12} fill={isFav ? "#EF4444" : "none"} />
    </button>

    {/* Content */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 18px",
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
      }}
    >
      <span
        className="av-flag"
        data-av-flag-anim={flagAnimVariant((country?.code || country?.name) + ":hero")}
        style={{
          "--av-flag-size": "24px",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        {country.flag}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {country.name}
        </div>
        <div style={{ fontSize: 12, color: "#34D399", fontWeight: 500 }}>
          {country.capital}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════ */
const StatCard = ({ icon, value, label, color, bg }) => (
  <div
    className="im-card-hover"
    style={{
      backgroundColor: "white",
      borderRadius: "var(--im-radius-xl)",
      padding: "28px 24px",
      display: "flex",
      alignItems: "center",
      gap: 18,
      boxShadow: "var(--im-shadow-sm)",
      border: "1px solid #F3F4F6",
      cursor: "default",
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#6B7280",
          marginTop: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const InteractiveMap = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapView, setMapView] = useState("physical");
  const [searchTerm, setSearchTerm] = useState("");
  const [panelTab, setPanelTab] = useState("list");
  const [favorites, setFavorites] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [miniMapExpanded, setMiniMapExpanded] = useState(false);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const searchRef = useRef(null);
  const trackRef = useRef(null);

  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;
  const isDesktop = windowWidth >= 1200;

  const { countries, loading, error, refetch } = useCountries();

  /* ── Filtered countries ── */
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return countries;
    const q = searchTerm.toLowerCase();
    return countries.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q) ||
        c.tagline?.toLowerCase().includes(q),
    );
  }, [searchTerm, countries]);

  /* ── Handlers ── */
  const handleSelect = useCallback((country) => {
    setSelectedCountry((prev) => (prev?.id === country.id ? null : country));
    setPanelTab("detail");
  }, []);

  const handleHover = useCallback((c) => setHoveredCountry(c), []);

  const handleRandom = useCallback(() => {
    if (countries.length === 0) return;
    const idx = Math.floor(Math.random() * countries.length);
    setSelectedCountry(countries[idx]);
    setPanelTab("detail");
  }, [countries]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 2.5)), []);
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(z - 0.25, 0.5)),
    [],
  );
  const zoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* ── Panning Logic ── */
  const handleMapMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return; // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan],
  );

  const handleMapMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMapMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMapTouchStart = useCallback(
    (e) => {
      if (e.touches.length !== 1) return;
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    },
    [pan],
  );

  const handleMapTouchMove = useCallback(
    (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMapTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse up to catch drops outside the map
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mouseup", handleMapMouseUp);
      window.addEventListener("touchend", handleMapTouchEnd);
    }
    return () => {
      window.removeEventListener("mouseup", handleMapMouseUp);
      window.removeEventListener("touchend", handleMapTouchEnd);
    };
  }, [isDragging, handleMapMouseUp, handleMapTouchEnd]);

  /* ── Fullscreen ── */
  const toggleFullscreen = useCallback(() => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  /* ── Back to top ── */
  useEffect(() => {
    const h = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if (showShareModal) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          zoomIn();
        }
        if (e.key === "-") {
          e.preventDefault();
          zoomOut();
        }
        if (e.key === "0") {
          e.preventDefault();
          zoomReset();
        }
      }
      if (e.key === "Escape") {
        if (showShareModal) setShowShareModal(false);
        else setSelectedCountry(null);
      }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "r" || e.key === "R") handleRandom();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    zoomIn,
    zoomOut,
    zoomReset,
    toggleFullscreen,
    handleRandom,
    showShareModal,
  ]);

  /* ── Scroll selected card into view ── */
  useEffect(() => {
    if (!trackRef.current || !selectedCountry) return;
    const idx = countries.findIndex((c) => c.id === selectedCountry.id);
    const child = trackRef.current.children[idx];
    if (child) {
      child.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedCountry, countries]);

  const handleMapAreaStart = (e) => {
    if (e.type === "touchstart") handleMapTouchStart(e);
    else handleMapMouseDown(e);
  };

  const handleMapAreaMove = (e) => {
    if (e.type === "touchmove") handleMapTouchMove(e);
    else handleMapMouseMove(e);
  };

  const currentMap = mapViews[mapView];

  /* ── Features data ── */
  const features = [
    {
      icon: <FiMousePointer size={24} />,
      title: "Interactive Markers",
      desc: "Click any marker to explore country details, photos, and travel info",
      color: "#059669",
    },
    {
      icon: <FiLayers size={24} />,
      title: "Multiple Views",
      desc: "Switch between terrain, satellite, and political map views",
      color: "#0891B2",
    },
    {
      icon: <FiSearch size={24} />,
      title: "Smart Search",
      desc: "Find countries instantly by name, capital, or keywords",
      color: "#7C3AED",
    },
    {
      icon: <FiZoomIn size={24} />,
      title: "Zoom & Explore",
      desc: "Zoom in for details or out for the full East African overview",
      color: "#DB2777",
    },
    {
      icon: <FiShuffle size={24} />,
      title: "Random Discovery",
      desc: "Let serendipity guide you to your next adventure destination",
      color: "#EA580C",
    },
    {
      icon: <FiMaximize2 size={24} />,
      title: "Fullscreen Mode",
      desc: "Immerse yourself in the full map experience on any device",
      color: "#2563EB",
    },
  ];

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div style={{ backgroundColor: "var(--im-off-white)", minHeight: "100vh" }}>
      <style>{injectStyles}</style>

      <PageHeader
        title="Interactive Map"
        subtitle="Navigate East Africa's most extraordinary destinations through our immersive explorer"
        backgroundImage="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920"
        breadcrumbs={[{ label: "Interactive Map" }]}
      />

      <section
        style={{ padding: isMobile ? "32px 16px 80px" : "48px 24px 120px" }}
      >
        <div style={{ maxWidth: "1480px", margin: "0 auto" }}>
          {/* ── ERROR ── */}
          {error && <ErrorDisplay message={error} onRetry={refetch} />}

          {/* ── LOADING ── */}
          {loading && !error && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "1fr 380px" : "1fr",
                  gap: 28,
                  marginBottom: 36,
                }}
              >
                <SkeletonMap />
                {isDesktop && <SkeletonSidebar />}
              </div>
              <div style={{ display: "flex", gap: 16, overflow: "hidden" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          {!loading && !error && countries.length > 0 && (
            <>
              {/* ═══════ MAP + SIDEBAR GRID ═══════ */}
              <div
                className="im-main-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "1fr 380px" : "1fr",
                  gap: 28,
                  marginBottom: 36,
                  alignItems: "start",
                }}
              >
                {/* ── MAP AREA ── */}
                <AnimatedSection animation="fadeInUp">
                  <div
                    ref={mapContainerRef}
                    style={{
                      position: "relative",
                      backgroundColor: "#fff",
                      borderRadius: isFullscreen ? 0 : "var(--im-radius-xl)",
                      overflow: "hidden",
                      boxShadow: "var(--im-shadow-xl)",
                    }}
                  >
                    <div
                      ref={mapRef}
                      className="im-map-area"
                      onMouseDown={handleMapAreaStart}
                      onMouseMove={handleMapAreaMove}
                      onMouseUp={handleMapMouseUp}
                      onTouchStart={handleMapAreaStart}
                      onTouchMove={handleMapAreaMove}
                      onTouchEnd={handleMapTouchEnd}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: isFullscreen ? "100vh" : "620px",
                        overflow: "hidden",
                        cursor: isDragging ? "grabbing" : "grab",
                        userSelect: "none",
                      }}
                    >
                      {/* Background content */}
                      <div
                        style={{
                          position: "absolute",
                          inset: "-20%", // Oversize to allow for pan/zoom
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transition: "transform 0.4s var(--im-transition)",
                          transformOrigin: "center center",
                          zIndex: 1,
                        }}
                      >
                        {currentMap.type === "google" ? (
                          <iframe
                            title="Google Map Background"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{
                              border: 0,
                              width: "100%",
                              height: "100%",
                              pointerEvents: "none", // Prevent iframe from stealing clicks
                              filter:
                                zoom > 1.2
                                  ? "contrast(1.1) brightness(1.05)"
                                  : "none",
                            }}
                            src={toGoogleMapEmbedUrl({
                              query: "East Africa",
                              zoom: 4,
                              mapType: currentMap.mapType,
                            })}
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundImage: `url(${currentMap.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              filter: zoom > 1.5 ? "brightness(1.05)" : "none",
                              transition: "background-image 0.6s ease",
                            }}
                          />
                        )}
                      </div>

                      {/* Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: currentMap.overlay,
                          pointerEvents: "none",
                          transition: "background 0.6s ease",
                          zIndex: 2,
                        }}
                      />

                      {/* Green accent line */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "4px",
                          height: "100%",
                          background:
                            "linear-gradient(180deg, #059669, transparent)",
                          zIndex: 20,
                          opacity: isFullscreen ? 0 : 1,
                        }}
                      />

                      {/* Markers layer */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transition: "transform 0.4s var(--im-transition)",
                          transformOrigin: "center center",
                          zIndex: 10,
                        }}
                      >
                        {countries.map((country) => {
                          const pos = countryPositions[country.id] ||
                            countryPositions[country.slug] || {
                              top: "50%",
                              left: "50%",
                            };
                          return (
                            <MapMarker
                              key={country.id}
                              country={country}
                              isSelected={selectedCountry?.id === country.id}
                              isHovered={hoveredCountry?.id === country.id}
                              onClick={handleSelect}
                              onHover={handleHover}
                              position={pos}
                              isMobile={isMobile}
                            />
                          );
                        })}
                      </div>

                      {/* ── Top-left info badge ── */}
                      <div
                        className="im-info-badge im-glass"
                        style={{
                          position: "absolute",
                          top: 20,
                          left: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 18px",
                          borderRadius: "var(--im-radius-md)",
                          boxShadow: "var(--im-shadow-md)",
                          zIndex: 20,
                          fontSize: 13,
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        <FiCompass
                          size={16}
                          color="#059669"
                          style={{
                            animation: selectedCountry
                              ? "none"
                              : "spin 8s linear infinite",
                          }}
                        />
                        <span>
                          <strong>{countries.length}</strong> countries •{" "}
                          {currentMap.name}
                        </span>
                      </div>

                      {/* ── Map view toggle ── */}
                      <div
                        className="im-glass"
                        style={{
                          position: "absolute",
                          top: 20,
                          right: 20,
                          display: "flex",
                          gap: 4,
                          padding: 5,
                          borderRadius: "var(--im-radius-lg)",
                          boxShadow: "var(--im-shadow-md)",
                          zIndex: 20,
                        }}
                      >
                        {Object.entries(mapViews).map(([key, view]) => (
                          <button
                            key={key}
                            onClick={() => setMapView(key)}
                            aria-label={`${view.name} view`}
                            aria-pressed={mapView === key}
                            className="im-view-toggle im-focus"
                            data-tooltip={view.description}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              padding: "9px 16px",
                              borderRadius: "var(--im-radius-sm)",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 600,
                              transition: "all 0.25s ease",
                              backgroundColor:
                                mapView === key ? "#059669" : "transparent",
                              color: mapView === key ? "#fff" : "#4B5563",
                              fontFamily: "'Inter', sans-serif",
                            }}
                            onMouseOver={(e) => {
                              if (mapView !== key)
                                e.currentTarget.style.backgroundColor =
                                  "rgba(0,0,0,0.04)";
                            }}
                            onMouseOut={(e) => {
                              if (mapView !== key)
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                            }}
                          >
                            {view.icon}
                            {!isMobile && view.name}
                          </button>
                        ))}
                      </div>

                      {/* ── Zoom controls ── */}
                      <div
                        className="im-zoom-controls"
                        style={{
                          position: "absolute",
                          bottom: 20,
                          right: 20,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          zIndex: 20,
                        }}
                      >
                        <IconBtn
                          icon={<FiZoomIn size={18} />}
                          label="Zoom in"
                          onClick={zoomIn}
                          tooltip="Zoom in (Ctrl +)"
                          disabled={zoom >= 2.5}
                        />
                        <IconBtn
                          icon={<FiZoomOut size={18} />}
                          label="Zoom out"
                          onClick={zoomOut}
                          tooltip="Zoom out (Ctrl -)"
                          disabled={zoom <= 0.5}
                        />
                        <IconBtn
                          icon={<FiRotateCcw size={16} />}
                          label="Reset zoom"
                          onClick={zoomReset}
                          tooltip="Reset (Ctrl 0)"
                        />
                        <IconBtn
                          icon={
                            isFullscreen ? (
                              <FiMinimize2 size={16} />
                            ) : (
                              <FiMaximize2 size={16} />
                            )
                          }
                          label={
                            isFullscreen ? "Exit fullscreen" : "Fullscreen"
                          }
                          onClick={toggleFullscreen}
                          tooltip="Fullscreen (F)"
                        />

                        {/* Zoom level */}
                        <div
                          className="im-glass"
                          style={{
                            textAlign: "center",
                            padding: "6px 10px",
                            borderRadius: "var(--im-radius-sm)",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          {Math.round(zoom * 100)}%
                        </div>
                      </div>

                      {/* ── Bottom action bar ── */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 20,
                          left: 20,
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          zIndex: 20,
                        }}
                      >
                        {/* Legend */}
                        <div
                          className="im-legend-bar im-glass"
                          style={{
                            display: "flex",
                            gap: 16,
                            padding: "10px 18px",
                            borderRadius: "var(--im-radius-md)",
                            boxShadow: "var(--im-shadow-md)",
                            fontSize: 12,
                            color: "#6B7280",
                            fontWeight: 500,
                          }}
                        >
                          {[
                            { color: "#10B981", label: "Available" },
                            { color: "#059669", label: "Selected" },
                          ].map((item) => (
                            <span
                              key={item.label}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  backgroundColor: item.color,
                                  boxShadow: `0 0 8px ${item.color}50`,
                                }}
                              />
                              {item.label}
                            </span>
                          ))}
                        </div>

                        {/* Share button */}
                        <IconBtn
                          icon={<FiShare2 size={16} />}
                          label="Share map"
                          onClick={() => setShowShareModal(true)}
                          tooltip="Share"
                        />
                      </div>

                      {/* ── Selected country quick info (mobile overlay) ── */}
                      {selectedCountry && isMobile && (
                        <div
                          className="im-glass"
                          style={{
                            position: "absolute",
                            bottom: 70,
                            left: 16,
                            right: 16,
                            padding: "16px 20px",
                            borderRadius: "var(--im-radius-lg)",
                            boxShadow: "var(--im-shadow-lg)",
                            zIndex: 30,
                            animation: "slideUp 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <span
                            className="av-flag"
                            data-av-flag-anim={flagAnimVariant(
                              (selectedCountry?.code || selectedCountry?.name) +
                                ":toast",
                            )}
                            style={{ "--av-flag-size": "30px" }}
                          >
                            {selectedCountry.flag}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#111827",
                              }}
                            >
                              {selectedCountry.name}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#059669",
                                fontWeight: 500,
                              }}
                            >
                              {selectedCountry.capital}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedCountry(null)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#9CA3AF",
                              padding: 4,
                            }}
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedSection>

                {/* ── SIDEBAR PANEL ── */}
                <AnimatedSection animation="fadeInUp">
                  <div
                    className="im-sidebar"
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "var(--im-radius-xl)",
                      boxShadow: "var(--im-shadow-lg)",
                      overflow: "hidden",
                      position: isDesktop ? "sticky" : "static",
                      top: "100px",
                    }}
                  >
                    {/* Panel header */}
                    <div
                      className="im-panel-header"
                      style={{ padding: "28px 28px 0" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 20,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 14,
                              background: selectedCountry
                                ? "linear-gradient(135deg, #059669, #047857)"
                                : "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: selectedCountry ? "white" : "#059669",
                              transition: "all 0.3s",
                            }}
                          >
                            {selectedCountry ? (
                              <span
                                className="av-flag"
                                data-av-flag-anim={flagAnimVariant(
                                  (selectedCountry?.code ||
                                    selectedCountry?.name) + ":chip",
                                )}
                                style={{ "--av-flag-size": "20px" }}
                              >
                                {selectedCountry.flag}
                              </span>
                            ) : (
                              <FiCompass size={20} />
                            )}
                          </div>
                          <div>
                            <h3
                              style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#111827",
                                margin: 0,
                                lineHeight: 1.2,
                              }}
                            >
                              {selectedCountry
                                ? selectedCountry.name
                                : "Explorer"}
                            </h3>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#9CA3AF",
                                margin: 0,
                                marginTop: 2,
                              }}
                            >
                              {selectedCountry
                                ? selectedCountry.capital
                                : `${countries.length} countries`}
                            </p>
                          </div>
                        </div>

                        <IconBtn
                          icon={
                            <FiNavigation
                              size={16}
                              style={{
                                transform: selectedCountry
                                  ? "rotate(45deg)"
                                  : "none",
                                transition: "transform 0.3s",
                              }}
                            />
                          }
                          label="Navigate"
                          variant="solid"
                          size={36}
                          active={!!selectedCountry}
                        />
                      </div>

                      {/* Tabs */}
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          padding: 4,
                          backgroundColor: "#F3F4F6",
                          borderRadius: "var(--im-radius-md)",
                          marginBottom: 20,
                        }}
                      >
                        {[
                          {
                            key: "list",
                            label: "Countries",
                            icon: <FiGrid size={13} />,
                          },
                          {
                            key: "detail",
                            label: "Details",
                            icon: <FiInfo size={13} />,
                          },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setPanelTab(tab.key)}
                            className="im-focus"
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 7,
                              padding: 10,
                              borderRadius: "var(--im-radius-sm)",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 600,
                              transition: "all 0.25s",
                              backgroundColor:
                                panelTab === tab.key ? "#fff" : "transparent",
                              color:
                                panelTab === tab.key ? "#111827" : "#9CA3AF",
                              boxShadow:
                                panelTab === tab.key
                                  ? "var(--im-shadow-sm)"
                                  : "none",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Panel body */}
                    <div
                      className="im-panel-body"
                      style={{ padding: "0 28px 28px" }}
                    >
                      {/* ── LIST TAB ── */}
                      {panelTab === "list" && (
                        <>
                          {/* Search */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "11px 14px",
                              backgroundColor: "#F9FAFB",
                              borderRadius: "var(--im-radius-md)",
                              border: "2px solid transparent",
                              transition: "border-color 0.2s, box-shadow 0.2s",
                              marginBottom: 14,
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "#10B981";
                              e.currentTarget.style.boxShadow =
                                "0 0 0 4px rgba(16,185,129,0.08)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = "transparent";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <FiSearch size={16} color="#9CA3AF" />
                            <input
                              ref={searchRef}
                              type="text"
                              placeholder="Search countries..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              aria-label="Search countries"
                              className="im-focus"
                              style={{
                                flex: 1,
                                border: "none",
                                background: "transparent",
                                fontSize: 14,
                                outline: "none",
                                color: "#111827",
                                fontFamily: "'Inter', sans-serif",
                              }}
                            />
                            {searchTerm && (
                              <button
                                onClick={() => {
                                  setSearchTerm("");
                                  searchRef.current?.focus();
                                }}
                                aria-label="Clear search"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#9CA3AF",
                                  padding: 2,
                                  display: "flex",
                                }}
                              >
                                <FiX size={15} />
                              </button>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              marginBottom: 16,
                            }}
                          >
                            <button
                              onClick={handleRandom}
                              className="im-btn-primary im-focus"
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 9,
                                padding: 12,
                                borderRadius: "var(--im-radius-md)",
                                fontSize: 14,
                              }}
                            >
                              <FiShuffle size={16} /> Surprise Me
                            </button>
                            <IconBtn
                              icon={<FiHeart size={16} />}
                              label="Show favorites"
                              variant="outline"
                              size={44}
                              active={false}
                              badge={
                                favorites.size > 0 ? favorites.size : undefined
                              }
                              tooltip="Favorites"
                            />
                          </div>

                          {/* Results count */}
                          {searchTerm && (
                            <div
                              style={{
                                padding: "8px 14px",
                                backgroundColor: "#ECFDF5",
                                borderRadius: "var(--im-radius-sm)",
                                fontSize: 12,
                                color: "#065F46",
                                fontWeight: 500,
                                marginBottom: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                animation: "slideUp 0.2s ease",
                              }}
                            >
                              <FiSearch size={12} />
                              <strong>{filtered.length}</strong> result
                              {filtered.length !== 1 ? "s" : ""} for "
                              {searchTerm}"
                            </div>
                          )}

                          {/* Country list */}
                          <div
                            className="im-sidebar-scroll"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              maxHeight: isMobile ? "300px" : "360px",
                              overflowY: "auto",
                              paddingRight: 4,
                            }}
                          >
                            {filtered.length > 0 ? (
                              filtered.map((country, i) => {
                                const isActive =
                                  selectedCountry?.id === country.id;
                                const isFav = favorites.has(country.id);
                                return (
                                  <div
                                    key={country.id}
                                    onClick={() => handleSelect(country)}
                                    onMouseOver={() => handleHover(country)}
                                    onMouseOut={() => handleHover(null)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Select ${country.name}`}
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && handleSelect(country)
                                    }
                                    className="im-focus"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 14,
                                      padding: 14,
                                      borderRadius: "var(--im-radius-lg)",
                                      cursor: "pointer",
                                      transition: "all 0.25s ease",
                                      backgroundColor: isActive
                                        ? "#ECFDF5"
                                        : "transparent",
                                      border: isActive
                                        ? "2px solid #059669"
                                        : "2px solid transparent",
                                      boxShadow: isActive
                                        ? "0 4px 14px rgba(5,150,105,0.1)"
                                        : "none",
                                      animation: `slideUp 0.3s ease ${i * 0.03}s both`,
                                    }}
                                    onMouseOverCapture={(e) => {
                                      if (!isActive) {
                                        e.currentTarget.style.backgroundColor =
                                          "#F9FAFB";
                                        e.currentTarget.style.transform =
                                          "translateX(4px)";
                                      }
                                    }}
                                    onMouseOutCapture={(e) => {
                                      if (!isActive) {
                                        e.currentTarget.style.backgroundColor =
                                          "transparent";
                                        e.currentTarget.style.transform =
                                          "translateX(0)";
                                      }
                                    }}
                                  >
                                    <span
                                      className="av-flag"
                                      data-av-flag-anim={flagAnimVariant(
                                        (country?.code || country?.name) +
                                          ":list",
                                      )}
                                      style={{
                                        "--av-flag-size": "26px",
                                        filter:
                                          "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
                                      }}
                                    >
                                      {country.flag}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6,
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: 15,
                                            fontWeight: 600,
                                            color: "#111827",
                                          }}
                                        >
                                          {country.name}
                                        </span>
                                        {isFav && (
                                          <FiHeart
                                            size={12}
                                            fill="#EF4444"
                                            color="#EF4444"
                                          />
                                        )}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#6B7280",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          marginTop: 2,
                                        }}
                                      >
                                        {country.capital}
                                        {country.tagline &&
                                          ` • ${country.tagline}`}
                                      </div>
                                    </div>
                                    <FiArrowRight
                                      size={16}
                                      color={isActive ? "#059669" : "#D1D5DB"}
                                      style={{
                                        transition: "color 0.2s",
                                        flexShrink: 0,
                                      }}
                                    />
                                  </div>
                                );
                              })
                            ) : (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "48px 16px",
                                  color: "#9CA3AF",
                                  animation: "fadeUp 0.3s ease",
                                }}
                              >
                                <div
                                  style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                  }}
                                >
                                  <FiSearch size={24} color="#059669" />
                                </div>
                                <p style={{ fontSize: 14, marginBottom: 12 }}>
                                  No countries match "{searchTerm}"
                                </p>
                                <button
                                  onClick={() => {
                                    setSearchTerm("");
                                    searchRef.current?.focus();
                                  }}
                                  style={{
                                    color: "#059669",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: "underline",
                                  }}
                                >
                                  Clear search
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* ── DETAIL TAB ── */}
                      {panelTab === "detail" && (
                        <>
                          {selectedCountry ? (
                            <div
                              style={{ animation: "slideInInfo 0.35s ease" }}
                            >
                              {/* Flag hero */}
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "28px 0 24px",
                                  background:
                                    "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)",
                                  borderRadius: "var(--im-radius-lg)",
                                  marginBottom: 24,
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                {/* Decorative circles */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: -20,
                                    right: -20,
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    background: "rgba(5,150,105,0.06)",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: -15,
                                    left: -15,
                                    width: 60,
                                    height: 60,
                                    borderRadius: "50%",
                                    background: "rgba(52,211,153,0.08)",
                                  }}
                                />

                                <span
                                  className="av-flag"
                                  data-av-flag-anim={flagAnimVariant(
                                    (selectedCountry?.code ||
                                      selectedCountry?.name) + ":panel",
                                  )}
                                  style={{
                                    "--av-flag-size": "clamp(44px, 6vw, 60px)",
                                    display: "block",
                                    marginBottom: 12,
                                    filter:
                                      "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                                    position: "relative",
                                    zIndex: 1,
                                  }}
                                >
                                  {selectedCountry.flag}
                                </span>
                                <h4
                                  style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: "#111827",
                                    margin: "0 0 6px",
                                    letterSpacing: "-0.02em",
                                    position: "relative",
                                    zIndex: 1,
                                  }}
                                >
                                  {selectedCountry.name}
                                </h4>
                                <span
                                  style={{
                                    fontSize: 14,
                                    color: "#059669",
                                    fontWeight: 500,
                                    position: "relative",
                                    zIndex: 1,
                                  }}
                                >
                                  {selectedCountry.tagline || "East Africa"}
                                </span>

                                {/* Action buttons */}
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 8,
                                    marginTop: 16,
                                    position: "relative",
                                    zIndex: 1,
                                  }}
                                >
                                  <IconBtn
                                    icon={
                                      <FiHeart
                                        size={14}
                                        fill={
                                          favorites.has(selectedCountry.id)
                                            ? "#EF4444"
                                            : "none"
                                        }
                                      />
                                    }
                                    label="Favorite"
                                    variant="outline"
                                    size={34}
                                    active={favorites.has(selectedCountry.id)}
                                    onClick={() =>
                                      toggleFavorite(selectedCountry.id)
                                    }
                                  />
                                  <IconBtn
                                    icon={<FiShare2 size={14} />}
                                    label="Share"
                                    variant="outline"
                                    size={34}
                                    onClick={() => setShowShareModal(true)}
                                  />
                                  <IconBtn
                                    icon={<FiBookmark size={14} />}
                                    label="Save"
                                    variant="outline"
                                    size={34}
                                  />
                                </div>
                              </div>

                              {/* Description */}
                              <p
                                style={{
                                  fontSize: 14,
                                  color: "#4B5563",
                                  lineHeight: 1.75,
                                  marginBottom: 24,
                                }}
                              >
                                {selectedCountry.description ||
                                  `Discover the beauty of ${selectedCountry.name}, a jewel of East Africa with stunning landscapes, diverse wildlife, and vibrant cultural traditions waiting to be explored.`}
                              </p>

                              {/* Info grid */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: 10,
                                  marginBottom: 24,
                                }}
                              >
                                {[
                                  {
                                    label: "Capital",
                                    value: selectedCountry.capital,
                                    icon: <FiMapPin size={14} />,
                                    color: "#059669",
                                    bg: "#ECFDF5",
                                  },
                                  {
                                    label: "Best Time",
                                    value:
                                      selectedCountry.bestTime || "Year-round",
                                    icon: <FiSun size={14} />,
                                    color: "#F59E0B",
                                    bg: "#FFFBEB",
                                  },
                                  {
                                    label: "Region",
                                    value:
                                      selectedCountry.region || "East Africa",
                                    icon: <FiGlobe size={14} />,
                                    color: "#0891B2",
                                    bg: "#ECFEFF",
                                  },
                                  {
                                    label: "Highlights",
                                    value:
                                      selectedCountry.language ||
                                      "Safari & Culture",
                                    icon: <FiStar size={14} />,
                                    color: "#7C3AED",
                                    bg: "#F5F3FF",
                                  },
                                ].map((item) => (
                                  <div
                                    key={item.label}
                                    style={{
                                      padding: 14,
                                      backgroundColor: "#F9FAFB",
                                      borderRadius: "var(--im-radius-md)",
                                      border: "1px solid #F3F4F6",
                                      transition: "all 0.2s",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.borderColor = `${item.color}30`;
                                      e.currentTarget.style.backgroundColor =
                                        item.bg;
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.borderColor =
                                        "#F3F4F6";
                                      e.currentTarget.style.backgroundColor =
                                        "#F9FAFB";
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        marginBottom: 6,
                                      }}
                                    >
                                      <span style={{ color: item.color }}>
                                        {item.icon}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: 11,
                                          color: "#9CA3AF",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.5px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {item.label}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "#111827",
                                      }}
                                    >
                                      {item.value}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* CTA */}
                              <Button
                                to={`/country/${selectedCountry.slug || selectedCountry.id}`}
                                variant="primary"
                                fullWidth
                                icon={<FiArrowRight size={18} />}
                              >
                                Explore {selectedCountry.name}
                              </Button>

                              <button
                                onClick={() => {
                                  setSelectedCountry(null);
                                  setPanelTab("list");
                                }}
                                className="im-focus"
                                style={{
                                  marginTop: 14,
                                  width: "100%",
                                  padding: 12,
                                  background: "none",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "var(--im-radius-md)",
                                  color: "#6B7280",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                  fontFamily: "'Inter', sans-serif",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.borderColor = "#059669";
                                  e.currentTarget.style.color = "#059669";
                                  e.currentTarget.style.backgroundColor =
                                    "#ECFDF5";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.borderColor = "#E5E7EB";
                                  e.currentTarget.style.color = "#6B7280";
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }}
                              >
                                <FiArrowLeft size={14} /> Back to all countries
                              </button>
                            </div>
                          ) : (
                            /* No selection placeholder */
                            <div
                              style={{
                                textAlign: "center",
                                padding: "60px 20px",
                                animation: "fadeUp 0.4s ease",
                              }}
                            >
                              <div
                                style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 20px",
                                  animation: "float 3s ease infinite",
                                }}
                              >
                                <FiMapPin size={32} color="#059669" />
                              </div>
                              <h4
                                style={{
                                  fontFamily: "'Playfair Display', serif",
                                  fontSize: 22,
                                  fontWeight: 700,
                                  color: "#111827",
                                  marginBottom: 8,
                                }}
                              >
                                Select a Country
                              </h4>
                              <p
                                style={{
                                  fontSize: 14,
                                  color: "#9CA3AF",
                                  lineHeight: 1.6,
                                  marginBottom: 24,
                                }}
                              >
                                Click any marker on the map or browse the list
                                to discover East African destinations
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  onClick={() => setPanelTab("list")}
                                  className="im-btn-primary im-focus"
                                  style={{
                                    padding: "10px 24px",
                                    borderRadius: "var(--im-radius-full)",
                                    fontSize: 14,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <FiList size={16} /> Browse
                                </button>
                                <button
                                  onClick={handleRandom}
                                  className="im-focus"
                                  style={{
                                    padding: "10px 24px",
                                    borderRadius: "var(--im-radius-full)",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    backgroundColor: "#ECFDF5",
                                    color: "#059669",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    transition: "all 0.2s",
                                  }}
                                  onMouseOver={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "#D1FAE5")
                                  }
                                  onMouseOut={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "#ECFDF5")
                                  }
                                >
                                  <FiShuffle size={16} /> Random
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              {/* ═══════ QUICK NAVIGATE CAROUSEL ═══════ */}
              <AnimatedSection animation="fadeInUp">
                <div>
                  <div
                    className="im-quick-nav-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: isMobile ? "22px" : "28px",
                          fontWeight: 800,
                          color: "#111827",
                          marginBottom: 4,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Quick Navigate
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FiGlobe size={14} />
                        {countries.length} East African countries to explore
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <IconBtn
                        icon={<FiChevronLeft size={18} />}
                        label="Scroll left"
                        variant="outline"
                        size={42}
                        onClick={() =>
                          trackRef.current?.scrollBy({
                            left: -300,
                            behavior: "smooth",
                          })
                        }
                      />
                      <IconBtn
                        icon={<FiChevronRight size={18} />}
                        label="Scroll right"
                        variant="outline"
                        size={42}
                        onClick={() =>
                          trackRef.current?.scrollBy({
                            left: 300,
                            behavior: "smooth",
                          })
                        }
                      />
                    </div>
                  </div>

                  <div
                    ref={trackRef}
                    className="im-scroll-track"
                    style={{
                      display: "flex",
                      gap: 18,
                      overflowX: "auto",
                      scrollSnapType: "x mandatory",
                      paddingBottom: 10,
                      scrollBehavior: "smooth",
                    }}
                  >
                    {countries.map((country, index) => (
                      <CountryQuickCard
                        key={country.id}
                        country={country}
                        isActive={selectedCountry?.id === country.id}
                        onClick={handleSelect}
                        isFav={favorites.has(country.id)}
                        onFav={toggleFavorite}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* ═══════ STATS GRID ═══════ */}
              <AnimatedSection animation="fadeInUp">
                <div
                  className="im-stats-grid"
                  style={{
                    marginTop: 56,
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 20,
                  }}
                >
                  <StatCard
                    icon={<FiGlobe size={24} />}
                    value={countries.length}
                    label="Countries"
                    color="#059669"
                    bg="#ECFDF5"
                  />
                  <StatCard
                    icon={<FiMapPin size={24} />}
                    value="50+"
                    label="Destinations"
                    color="#0891B2"
                    bg="#ECFEFF"
                  />
                  <StatCard
                    icon={<FiLayers size={24} />}
                    value="3"
                    label="Map Views"
                    color="#7C3AED"
                    bg="#F5F3FF"
                  />
                  <StatCard
                    icon={<FiHeart size={24} />}
                    value={favorites.size || "∞"}
                    label="Favorites"
                    color="#DB2777"
                    bg="#FDF2F8"
                  />
                </div>
              </AnimatedSection>

              {/* ═══════ FEATURES SECTION ═══════ */}
              <AnimatedSection animation="fadeInUp">
                <div style={{ marginTop: 80 }}>
                  <div style={{ textAlign: "center", marginBottom: 56 }}>
                    <Pill variant="solid" size="md" icon={<FiZap size={12} />}>
                      Map Features
                    </Pill>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: isMobile ? "26px" : "clamp(30px, 3vw, 40px)",
                        fontWeight: 800,
                        color: "#111827",
                        marginTop: 20,
                        marginBottom: 12,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Explore With Confidence
                    </h3>
                    <p
                      style={{
                        fontSize: 16,
                        color: "#6B7280",
                        maxWidth: 520,
                        margin: "0 auto",
                        lineHeight: 1.7,
                      }}
                    >
                      Our interactive map is designed to make discovering East
                      Africa effortless and inspiring
                    </p>
                  </div>

                  <div
                    className="im-features-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 20,
                    }}
                  >
                    {features.map((feature, i) => (
                      <div
                        key={i}
                        className="im-card-hover"
                        style={{
                          backgroundColor: "white",
                          borderRadius: "var(--im-radius-xl)",
                          padding: "36px 28px",
                          textAlign: "center",
                          boxShadow: "var(--im-shadow-sm)",
                          border: "1px solid #F3F4F6",
                          cursor: "default",
                          position: "relative",
                          overflow: "hidden",
                          animation: `slideUp 0.4s ease ${i * 0.06}s both`,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: -25,
                            right: -25,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            background: `${feature.color}06`,
                          }}
                        />
                        <div
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 20,
                            background: `linear-gradient(135deg, ${feature.color}12, ${feature.color}06)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 18px",
                            color: feature.color,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          {feature.icon}
                        </div>
                        <h4
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: 8,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          {feature.title}
                        </h4>
                        <p
                          style={{
                            fontSize: 13,
                            color: "#6B7280",
                            lineHeight: 1.7,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* ═══════ KEYBOARD SHORTCUTS (Desktop) ═══════ */}
              {isDesktop && (
                <AnimatedSection animation="fadeInUp">
                  <div
                    style={{
                      marginTop: 48,
                      padding: "24px 32px",
                      backgroundColor: "white",
                      borderRadius: "var(--im-radius-xl)",
                      border: "1px solid #F3F4F6",
                      boxShadow: "var(--im-shadow-sm)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          backgroundColor: "#ECFDF5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#059669",
                        }}
                      >
                        <FiInfo size={16} />
                      </div>
                      <h4
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        Keyboard Shortcuts
                      </h4>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                      {[
                        { keys: "Ctrl +/-", label: "Zoom in/out" },
                        { keys: "Ctrl 0", label: "Reset zoom" },
                        { keys: "F", label: "Fullscreen" },
                        { keys: "R", label: "Random country" },
                        { keys: "Esc", label: "Deselect" },
                      ].map(({ keys, label }) => (
                        <div
                          key={keys}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <kbd
                            style={{
                              padding: "4px 10px",
                              backgroundColor: "#F3F4F6",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#374151",
                              border: "1px solid #E5E7EB",
                              fontFamily: "'Inter', monospace",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                          >
                            {keys}
                          </kbd>
                          <span
                            style={{
                              fontSize: 13,
                              color: "#6B7280",
                              fontWeight: 500,
                            }}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              )}

              {/* ═══════ CTA SECTION ═══════ */}
              <AnimatedSection animation="fadeInUp">
                <div
                  className="im-cta-section"
                  style={{
                    marginTop: 80,
                    padding: isMobile ? "48px 24px" : "64px 48px",
                    background:
                      "linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%)",
                    borderRadius: "var(--im-radius-xl)",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -80,
                      right: -80,
                      width: 250,
                      height: 250,
                      borderRadius: "50%",
                      background: "rgba(52,211,153,0.08)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: -50,
                      left: -50,
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      background: "rgba(110,231,183,0.06)",
                    }}
                  />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 22,
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 28px",
                        animation: "float 3s ease infinite",
                      }}
                    >
                      <FiCompass size={32} color="#34D399" />
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: isMobile
                          ? "26px"
                          : "clamp(30px, 3.5vw, 42px)",
                        fontWeight: 800,
                        color: "white",
                        marginBottom: 14,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.15,
                      }}
                    >
                      Ready to Start Your Journey?
                    </h3>

                    <p
                      style={{
                        fontSize: isMobile ? "15px" : "17px",
                        color: "rgba(255,255,255,0.8)",
                        maxWidth: 500,
                        margin: "0 auto 36px",
                        lineHeight: 1.7,
                      }}
                    >
                      From the savannahs of Kenya to the gorilla forests of
                      Rwanda — your East African adventure begins here.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="im-focus"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "16px 36px",
                          background: "linear-gradient(135deg, white, #F9FAFB)",
                          color: "#065F46",
                          border: "none",
                          borderRadius: "var(--im-radius-full)",
                          cursor: "pointer",
                          fontSize: 16,
                          fontWeight: 800,
                          transition: "all 0.3s",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(-3px) scale(1.03)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 30px rgba(0,0,0,0.2)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(0) scale(1)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 20px rgba(0,0,0,0.15)";
                        }}
                      >
                        <FiNavigation size={18} /> Plan Your Safari
                      </button>

                      <button
                        className="im-focus"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "16px 36px",
                          background: "transparent",
                          color: "white",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderRadius: "var(--im-radius-full)",
                          cursor: "pointer",
                          fontSize: 16,
                          fontWeight: 700,
                          transition: "all 0.3s",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.6)";
                          e.currentTarget.style.backgroundColor =
                            "rgba(255,255,255,0.1)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.3)";
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <FiMessageCircle size={16} /> Contact Us
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && !error && countries.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "100px 24px",
                animation: "fadeUp 0.5s ease",
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 28px",
                  animation: "float 3s ease infinite",
                }}
              >
                <FiMap size={48} color="#059669" />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 32,
                  color: "#111827",
                  marginBottom: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                No Countries Available
              </h3>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: 17,
                  maxWidth: 420,
                  margin: "0 auto 32px",
                  lineHeight: 1.6,
                }}
              >
                Country data is being prepared. Check back soon for the full
                interactive experience!
              </p>
              <button
                onClick={refetch}
                className="im-btn-primary im-focus"
                style={{
                  padding: "14px 32px",
                  borderRadius: "var(--im-radius-full)",
                  fontSize: 15,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiRefreshCw size={16} /> Refresh
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ SHARE MODAL ══════════ */}
      {showShareModal && (
        <ShareModal
          country={selectedCountry}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* ══════════ BACK TO TOP ══════════ */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="im-btn-primary im-focus"
          aria-label="Back to top"
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            width: 52,
            height: 52,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            animation: "bounceIn 0.4s ease",
            padding: 0,
          }}
        >
          <FiArrowUp size={22} />
        </button>
      )}
    </div>
  );
};

export default InteractiveMap;
