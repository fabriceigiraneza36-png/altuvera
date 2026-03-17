// src/pages/VirtualTour.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  FiPlay,
  FiPause,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiClock,
  FiMapPin,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
  FiAlertCircle,
  FiVolume2,
  FiVolumeX,
  FiCompass,
  FiCamera,
  FiHeadphones,
  FiMonitor,
  FiShare2,
  FiHeart,
  FiDownload,
  FiGrid,
  FiList,
  FiSearch,
  FiFilter,
  FiX,
  FiStar,
  FiArrowUp,
  FiGlobe,
  FiZap,
  FiAward,
  FiUsers,
  FiMessageCircle,
  FiBookmark,
  FiExternalLink,
  FiInfo,
  FiChevronDown,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import PackageChecklist from "../components/common/PackageChecklist";
import { Helmet } from "react-helmet-async";
import { useApp } from "../context/AppContext";
import { useVirtualTours } from "../hooks/useVirtualTours";
import { BRAND_LOGO_ALT, getBrandLogoUrl } from "../utils/seo";
import virtualTourService from "../services/virtualTourService";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES — injected once
   ═══════════════════════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap');

  :root {
    --vt-green-50: #ECFDF5;
    --vt-green-100: #D1FAE5;
    --vt-green-200: #A7F3D0;
    --vt-green-300: #6EE7B7;
    --vt-green-400: #34D399;
    --vt-green-500: #10B981;
    --vt-green-600: #059669;
    --vt-green-700: #047857;
    --vt-green-800: #065F46;
    --vt-green-900: #064E3B;
    --vt-white: #FFFFFF;
    --vt-off-white: #FAFDF7;
    --vt-gray-50: #F9FAFB;
    --vt-gray-100: #F3F4F6;
    --vt-gray-200: #E5E7EB;
    --vt-gray-300: #D1D5DB;
    --vt-gray-400: #9CA3AF;
    --vt-gray-500: #6B7280;
    --vt-gray-600: #4B5563;
    --vt-gray-700: #374151;
    --vt-gray-800: #1F2937;
    --vt-gray-900: #111827;
    --vt-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --vt-shadow-md: 0 4px 16px rgba(0,0,0,0.08);
    --vt-shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
    --vt-shadow-xl: 0 25px 80px rgba(0,0,0,0.18);
    --vt-shadow-green: 0 8px 30px rgba(5,150,105,0.3);
    --vt-radius-sm: 8px;
    --vt-radius-md: 14px;
    --vt-radius-lg: 20px;
    --vt-radius-xl: 28px;
    --vt-radius-full: 9999px;
    --vt-transition: cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.05); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(60px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes progressBar {
    from { width: 0%; }
    to   { width: 100%; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(5,150,105,0.2); }
    50%      { box-shadow: 0 0 40px rgba(5,150,105,0.4); }
  }

  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(4); opacity: 0; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }

  .vt-thumb-track::-webkit-scrollbar {
    height: 6px;
  }
  .vt-thumb-track::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.04);
    border-radius: 3px;
  }
  .vt-thumb-track::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #059669, #34D399);
    border-radius: 3px;
  }

  .vt-glass {
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.12);
  }

  .vt-glass-dark {
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .vt-glass-white {
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.9);
  }

  .vt-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s var(--vt-transition);
    box-shadow: var(--vt-shadow-green);
    position: relative;
    overflow: hidden;
  }

  .vt-btn-primary::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .vt-btn-primary:hover::before {
    width: 300px;
    height: 300px;
  }

  .vt-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 40px rgba(5,150,105,0.45);
  }

  .vt-btn-primary:active {
    transform: translateY(0) scale(0.98);
  }

  .vt-card-hover {
    transition: all 0.4s var(--vt-transition);
  }

  .vt-card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(5,150,105,0.15);
  }

  .vt-tooltip {
    position: relative;
  }

  .vt-tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--vt-gray-900);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    pointer-events: none;
    z-index: 50;
  }

  .vt-tooltip:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }

  .vt-focus-ring:focus-visible {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }

  /* Stats counter animation */
  .vt-counter {
    display: inline-block;
    font-variant-numeric: tabular-nums;
  }

  /* Responsive grid */
  @media (max-width: 1200px) {
    .vt-features-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .vt-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 768px) {
    .vt-hero-content {
      padding: 0 20px 28px !important;
    }
    .vt-hero-title {
      font-size: 26px !important;
    }
    .vt-hero-desc {
      font-size: 14px !important;
    }
    .vt-hero-viewer {
      height: 55vh !important;
      min-height: 400px !important;
      border-radius: 20px !important;
    }
    .vt-controls-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .vt-meta-pills {
      flex-wrap: wrap !important;
    }
    .vt-features-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .vt-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px !important;
    }
    .vt-section-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 16px !important;
    }
    .vt-nav-arrows {
      display: none !important;
    }
    .vt-hero-arrows button {
      width: 40px !important;
      height: 40px !important;
    }
    .vt-top-bar {
      top: 12px !important;
      left: 14px !important;
      right: 14px !important;
    }
    .vt-filter-bar {
      flex-direction: column !important;
    }
    .vt-search-wrap {
      width: 100% !important;
    }
    .vt-category-btns {
      width: 100% !important;
      overflow-x: auto !important;
      padding-bottom: 4px !important;
    }
    .vt-cta-section {
      padding: 48px 24px !important;
    }
  }

  @media (max-width: 480px) {
    .vt-hero-viewer {
      height: 45vh !important;
      min-height: 320px !important;
      border-radius: 16px !important;
    }
    .vt-thumb-card {
      flex: 0 0 220px !important;
      height: 150px !important;
    }
    .vt-play-btn {
      padding: 12px 24px !important;
      font-size: 14px !important;
    }
    .vt-feature-card {
      padding: 28px 20px !important;
    }
    .vt-stats-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Smooth scroll for the whole page */
  html {
    scroll-behavior: smooth;
  }
`;

/* ═══════════════════════════════════════════════════════
   UTILITY: useMeasure for responsive checks
   ═══════════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, []);

  return size;
};

/* ═══════════════════════════════════════════════════════
   SKELETON COMPONENTS
   ═══════════════════════════════════════════════════════ */
const shimmerBg = {
  background:
    "linear-gradient(110deg, #e8f5e9 8%, #f1f8f2 18%, #e8f5e9 33%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease infinite",
};

const SkeletonHero = () => (
  <div
    style={{
      borderRadius: "var(--vt-radius-xl)",
      height: "65vh",
      minHeight: "500px",
      ...shimmerBg,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        bottom: "40px",
        left: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ width: 120, height: 28, borderRadius: 30, ...shimmerBg }} />
      <div style={{ width: 350, height: 40, borderRadius: 8, ...shimmerBg }} />
      <div style={{ width: 260, height: 20, borderRadius: 6, ...shimmerBg }} />
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 8,
        }}
      >
        <div
          style={{ width: 140, height: 48, borderRadius: 30, ...shimmerBg }}
        />
        <div
          style={{ width: 100, height: 48, borderRadius: 30, ...shimmerBg }}
        />
      </div>
    </div>
  </div>
);

const SkeletonSlide = () => (
  <div
    style={{
      flex: "0 0 280px",
      height: "180px",
      borderRadius: "var(--vt-radius-lg)",
      ...shimmerBg,
    }}
  />
);

const SkeletonFeature = () => (
  <div
    style={{
      borderRadius: "var(--vt-radius-lg)",
      height: "220px",
      ...shimmerBg,
    }}
  />
);

/* ═══════════════════════════════════════════════════════
   LOADING SPINNER
   ═══════════════════════════════════════════════════════ */
const LoadingSpinner = ({ size = 24, color = "#059669" }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `3px solid ${color}20`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
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
      borderRadius: "var(--vt-radius-xl)",
      margin: "0 auto",
      maxWidth: "560px",
      animation: "scaleIn 0.4s ease",
    }}
  >
    <div
      style={{
        width: "80px",
        height: "80px",
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
        fontSize: "26px",
        color: "#991B1B",
        marginBottom: "12px",
      }}
    >
      Unable to Load Tours
    </h3>
    <p
      style={{
        color: "#B91C1C",
        marginBottom: "32px",
        lineHeight: 1.6,
        fontSize: "15px",
      }}
    >
      {message}
    </p>
    <button
      onClick={onRetry}
      className="vt-btn-primary vt-focus-ring"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 36px",
        borderRadius: "var(--vt-radius-full)",
        fontSize: "16px",
      }}
    >
      <FiRefreshCw size={18} />
      Try Again
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════ */
const EmptyState = () => (
  <div
    style={{
      textAlign: "center",
      padding: "100px 24px",
      animation: "fadeUp 0.5s ease",
    }}
  >
    <div
      style={{
        width: "140px",
        height: "140px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 32px",
        animation: "float 3s ease infinite",
      }}
    >
      <FiCamera size={56} color="#059669" />
    </div>
    <h3
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "32px",
        color: "#111827",
        marginBottom: "12px",
      }}
    >
      No Virtual Tours Yet
    </h3>
    <p
      style={{
        color: "#6B7280",
        fontSize: "18px",
        maxWidth: "420px",
        margin: "0 auto 32px",
        lineHeight: 1.6,
      }}
    >
      Immersive safari experiences are being crafted. Check back soon for
      breathtaking virtual adventures!
    </p>
    <button
      className="vt-btn-primary vt-focus-ring"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 32px",
        borderRadius: "var(--vt-radius-full)",
        fontSize: "15px",
      }}
    >
      <FiGlobe size={18} />
      Explore Destinations
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   ICON BUTTON COMPONENT
   ═══════════════════════════════════════════════════════ */
const IconButton = ({
  icon,
  label,
  onClick,
  active = false,
  size = 44,
  variant = "glass",
  tooltip,
  badge,
  className = "",
}) => {
  const baseStyles = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s var(--vt-transition)",
    position: "relative",
    flexShrink: 0,
  };

  const variants = {
    glass: {
      backgroundColor: active
        ? "rgba(5,150,105,0.9)"
        : "rgba(255,255,255,0.12)",
      backdropFilter: "blur(12px)",
      border: active
        ? "1px solid rgba(5,150,105,0.9)"
        : "1px solid rgba(255,255,255,0.15)",
      color: "white",
    },
    solid: {
      backgroundColor: active ? "#059669" : "white",
      border: active ? "1px solid #059669" : "1px solid #E5E7EB",
      color: active ? "white" : "#374151",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    ghost: {
      backgroundColor: "transparent",
      border: "none",
      color: active ? "#059669" : "#6B7280",
    },
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      data-tooltip={tooltip}
      className={`vt-focus-ring ${tooltip ? "vt-tooltip" : ""} ${className}`}
      style={{
        ...baseStyles,
        ...variants[variant],
      }}
      onMouseOver={(e) => {
        if (variant === "glass") {
          e.currentTarget.style.backgroundColor = active
            ? "rgba(5,150,105,1)"
            : "rgba(255,255,255,0.25)";
        } else if (variant === "solid") {
          e.currentTarget.style.backgroundColor = "#059669";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.borderColor = "#059669";
        } else {
          e.currentTarget.style.color = "#059669";
        }
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseOut={(e) => {
        if (variant === "glass") {
          e.currentTarget.style.backgroundColor = active
            ? "rgba(5,150,105,0.9)"
            : "rgba(255,255,255,0.12)";
        } else if (variant === "solid") {
          e.currentTarget.style.backgroundColor = active ? "#059669" : "white";
          e.currentTarget.style.color = active ? "white" : "#374151";
          e.currentTarget.style.borderColor = active ? "#059669" : "#E5E7EB";
        } else {
          e.currentTarget.style.color = active ? "#059669" : "#6B7280";
        }
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {icon}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: "#EF4444",
            color: "white",
            fontSize: "10px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
   PILL / BADGE COMPONENT
   ═══════════════════════════════════════════════════════ */
const Pill = ({
  icon,
  children,
  variant = "glass",
  color,
  size = "md",
  onClick,
  active = false,
}) => {
  const sizes = {
    sm: { padding: "5px 12px", fontSize: "11px", gap: "4px" },
    md: { padding: "8px 16px", fontSize: "13px", gap: "6px" },
    lg: { padding: "10px 20px", fontSize: "14px", gap: "8px" },
  };

  const variants = {
    glass: {
      backgroundColor: active
        ? "rgba(5,150,105,0.85)"
        : "rgba(255,255,255,0.12)",
      backdropFilter: "blur(12px)",
      color: "white",
      border: active
        ? "1px solid rgba(5,150,105,0.9)"
        : "1px solid rgba(255,255,255,0.1)",
    },
    solid: {
      backgroundColor: active ? "#059669" : "#ECFDF5",
      color: active ? "white" : "#059669",
      border: active ? "1px solid #059669" : "1px solid #D1FAE5",
    },
    green: {
      background: "linear-gradient(135deg, #059669, #047857)",
      color: "white",
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: active ? "#059669" : "#6B7280",
      border: active ? "2px solid #059669" : "1px solid #E5E7EB",
    },
    custom: {
      backgroundColor: `${color}15`,
      color: color,
      border: `1px solid ${color}25`,
    },
  };

  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={onClick ? "vt-focus-ring" : ""}
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--vt-radius-full)",
        fontWeight: "600",
        letterSpacing: "0.3px",
        textTransform: "uppercase",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s var(--vt-transition)",
        whiteSpace: "nowrap",
        ...sizes[size],
        ...variants[variant],
      }}
      onMouseOver={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "scale(1.05)";
        }
      }}
      onMouseOut={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      {icon}
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════
   STAT COUNTER COMPONENT
   ═══════════════════════════════════════════════════════ */
const StatCounter = ({ icon, value, label, color = "#059669" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const target = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;

          const counter = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(counter);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const suffix = value.replace(/[0-9,]/g, "");

  return (
    <div
      ref={ref}
      style={{
        textAlign: "center",
        padding: "32px 20px",
        backgroundColor: "white",
        borderRadius: "var(--vt-radius-lg)",
        border: "1px solid #F3F4F6",
        transition: "all 0.4s var(--vt-transition)",
      }}
      className="vt-card-hover"
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `${color}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          color: color,
        }}
      >
        {icon}
      </div>
      <div
        className="vt-counter"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "36px",
          fontWeight: "800",
          color: "#111827",
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <p style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>
        {label}
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SHARE MODAL
   ═══════════════════════════════════════════════════════ */
const ShareModal = ({ tour, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "var(--vt-radius-xl)",
          padding: "36px",
          maxWidth: "420px",
          width: "100%",
          animation: "scaleIn 0.3s ease",
          boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Share This Tour
          </h3>
          <IconButton
            icon={<FiX size={18} />}
            label="Close"
            onClick={onClose}
            variant="ghost"
            size={36}
          />
        </div>

        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            marginBottom: "24px",
            lineHeight: 1.5,
          }}
        >
          Share "{tour?.title}" with friends and family
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            justifyContent: "center",
          }}
        >
          {["Facebook", "Twitter", "WhatsApp", "Email"].map((platform) => (
            <button
              key={platform}
              className="vt-focus-ring"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "var(--vt-radius-md)",
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#ECFDF5";
                e.currentTarget.style.borderColor = "#059669";
                e.currentTarget.style.color = "#059669";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#374151";
              }}
            >
              {platform}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "var(--vt-radius-md)",
              border: "1px solid #E5E7EB",
              fontSize: "13px",
              color: "#6B7280",
              backgroundColor: "#F9FAFB",
              outline: "none",
            }}
          />
          <button
            onClick={copyLink}
            className="vt-btn-primary vt-focus-ring"
            style={{
              padding: "12px 20px",
              borderRadius: "var(--vt-radius-md)",
              fontSize: "13px",
              whiteSpace: "nowrap",
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
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const VirtualTour = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("carousel");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const trackRef = useRef(null);
  const autoPlayRef = useRef(null);
  const progressRef = useRef(null);
  const heroRef = useRef(null);
  const containerRef = useRef(null);

  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const { playVideo, activeVideoId, isPlayerOpen } = useApp();

  const { tours, loading, error, refetch } = useVirtualTours({
    sort: "sort_order",
    order: "asc",
    limit: 20,
  });

  // Categories derived from tours
  const categories = useMemo(() => {
    const cats = new Set(["all"]);
    tours.forEach((tour) => {
      if (tour.media_type) cats.add(tour.media_type);
      if (tour.meta?.category) cats.add(tour.meta.category);
    });
    return Array.from(cats);
  }, [tours]);

  // Filtered tours
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesSearch =
        !searchQuery ||
        tour.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.tags?.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        activeCategory === "all" ||
        tour.media_type === activeCategory ||
        tour.meta?.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tours, searchQuery, activeCategory]);

  const displayTours = filteredTours.length > 0 ? filteredTours : tours;
  const currentTour = useMemo(
    () => displayTours[currentIndex] || null,
    [displayTours, currentIndex]
  );

  const currentVideoId = useMemo(() => {
    if (!currentTour) return null;
    return (
      currentTour.video_id ||
      virtualTourService.constructor.getVideoId(currentTour.video_url)
    );
  }, [currentTour]);

  const getLocation = useCallback((tour) => {
    if (!tour) return "";
    if (tour.meta?.location) return tour.meta.location;
    if (tour.destination_name) return tour.destination_name;
    return "East Africa";
  }, []);

  /* ── Favorites ── */
  const toggleFavorite = useCallback((tourId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(tourId)) {
        next.delete(tourId);
      } else {
        next.add(tourId);
      }
      return next;
    });
  }, []);

  /* ── Fullscreen ── */
  const toggleFullscreen = useCallback(() => {
    if (!heroRef.current) return;
    if (!document.fullscreenElement) {
      heroRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  /* ── Back to top ── */
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Navigation ── */
  const goTo = useCallback(
    (index) => {
      if (isTransitioning || displayTours.length === 0) return;
      const safeIndex =
        ((index % displayTours.length) + displayTours.length) %
        displayTours.length;
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentIndex(safeIndex);
        setIsTransitioning(false);
      }, 350);
    },
    [isTransitioning, displayTours.length]
  );

  const next = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const prev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  /* ── Auto-play ── */
  useEffect(() => {
    if (!autoPlay || displayTours.length <= 1 || isPlayerOpen) return;

    const DURATION = 8000;
    const TICK = 50;
    let elapsed = 0;

    progressRef.current = setInterval(() => {
      elapsed += TICK;
      setProgress((elapsed / DURATION) * 100);
    }, TICK);

    autoPlayRef.current = setTimeout(() => {
      next();
    }, DURATION);

    return () => {
      clearTimeout(autoPlayRef.current);
      clearInterval(progressRef.current);
    };
  }, [autoPlay, currentIndex, displayTours.length, next, isPlayerOpen]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e) => {
      if (showShareModal) return;
      if (e.key === "ArrowRight") {
        setAutoPlay(false);
        next();
      }
      if (e.key === "ArrowLeft") {
        setAutoPlay(false);
        prev();
      }
      if (e.key === " " && !e.target.closest("input, textarea")) {
        e.preventDefault();
        setAutoPlay((p) => !p);
      }
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
      if (e.key === "m" || e.key === "M") {
        setIsMuted((p) => !p);
      }
      if (e.key === "Escape") {
        if (showShareModal) setShowShareModal(false);
        if (filterOpen) setFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, toggleFullscreen, showShareModal, filterOpen]);

  /* ── Touch gestures ── */
  const touchStart = useRef(null);
  const handleTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchStart.current) return;
      const diff = touchStart.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        setAutoPlay(false);
        if (diff > 0) next();
        else prev();
      }
      touchStart.current = null;
    },
    [next, prev]
  );

  /* ── Scroll active thumbnail into view ── */
  useEffect(() => {
    if (!trackRef.current) return;
    const active = trackRef.current.children[currentIndex];
    if (active) {
      active.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  /* ── Reset index when filters change ── */
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [searchQuery, activeCategory]);

  /* ── Features data ── */
  const features = [
    {
      icon: <FiCamera size={28} />,
      title: "360° Panorama",
      desc: "Full immersive panoramic views of every destination with interactive controls",
      color: "#059669",
      stats: "5+ Views",
    },
    {
      icon: <FiHeadphones size={28} />,
      title: "Audio Narration",
      desc: "Professional guides narrate each destination's unique story and history",
      color: "#0891B2",
      stats: "15+ Languages",
    },
    {
      icon: <FiCompass size={28} />,
      title: "Interactive Maps",
      desc: "Navigate and explore locations in real-time with GPS-tracked waypoints",
      color: "#7C3AED",
      stats: "Real-time GPS",
    },
    {
      icon: <FiMonitor size={28} />,
      title: "4K Ultra HD",
      desc: "Crystal clear quality on any screen size with adaptive streaming",
      color: "#DB2777",
      stats: "Up to 8K",
    },
    {
      icon: <FiGlobe size={28} />,
      title: "VR Compatible",
      desc: "Full virtual reality support for the most immersive experience possible",
      color: "#EA580C",
      stats: "All Headsets",
    },
    {
      icon: <FiZap size={28} />,
      title: "Instant Load",
      desc: "Progressive loading ensures tours start instantly on any connection",
      color: "#2563EB",
      stats: "< 2s Load",
    },
  ];

  /* ── Stats data ── */
  const stats = [
    {
      icon: <FiCamera size={24} />,
      value: `${tours.length || 25}`,
      label: "Virtual Tours",
      color: "#059669",
    },
    {
      icon: <FiGlobe size={24} />,
      value: "12",
      label: "Destinations",
      color: "#0891B2",
    },
    {
      icon: <FiUsers size={24} />,
      value: "50000+",
      label: "Happy Viewers",
      color: "#7C3AED",
    },
    {
      icon: <FiStar size={24} />,
      value: "98",
      label: "Satisfaction Rate %",
      color: "#DB2777",
    },
  ];

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div ref={containerRef} style={{ backgroundColor: "var(--vt-off-white)" }}>
      <style>{globalStyles}</style>

      <Helmet>
        <title>Virtual Tours | Altuvera Safaris</title>
        <meta
          name="description"
          content="Experience East Africa through immersive 360° virtual tours. Explore wildlife, landscapes, and culture from anywhere."
        />
        <meta property="og:title" content="Virtual Tours | Altuvera Safaris" />
        <meta
          property="og:description"
          content="Experience East Africa through immersive 360° virtual tours. Explore wildlife, landscapes, and culture from anywhere."
        />
        <meta property="og:image" content={getBrandLogoUrl()} />
        <meta property="og:image:alt" content={BRAND_LOGO_ALT} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={getBrandLogoUrl()} />
        <meta name="twitter:image:alt" content={BRAND_LOGO_ALT} />
      </Helmet>

      <PageHeader
        title="Virtual Tours"
        subtitle="Explore East Africa's most breathtaking destinations from anywhere in the world"
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
        breadcrumbs={[{ label: "Virtual Tours" }]}
      />

      <section
        style={{
          padding: isMobile ? "32px 16px 80px" : "60px 24px 120px",
          maxWidth: "1480px",
          margin: "0 auto",
        }}
      >
        {/* ── ERROR ── */}
        {error && <ErrorDisplay message={error} onRetry={refetch} />}

        {/* ── LOADING ── */}
        {loading && !error && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <SkeletonHero />
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "32px",
                overflowX: "hidden",
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonSlide key={i} />
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "24px",
                marginTop: "80px",
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonFeature key={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── EMPTY ── */}
        {!loading && !error && tours.length === 0 && <EmptyState />}

        {/* ── MAIN CONTENT ── */}
        {!loading && !error && tours.length > 0 && (
          <>
            {/* ══════════ SEARCH & FILTER BAR ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div
                className="vt-filter-bar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                }}
              >
                {/* Search */}
                <div
                  className="vt-search-wrap"
                  style={{
                    position: "relative",
                    flex: "1 1 300px",
                    maxWidth: isMobile ? "100%" : "400px",
                  }}
                >
                  <FiSearch
                    size={18}
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search tours, destinations, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="vt-focus-ring"
                    style={{
                      width: "100%",
                      padding: "14px 16px 14px 48px",
                      borderRadius: "var(--vt-radius-full)",
                      border: "1px solid #E5E7EB",
                      backgroundColor: "white",
                      fontSize: "14px",
                      color: "#374151",
                      outline: "none",
                      transition: "all 0.3s",
                      boxShadow: "var(--vt-shadow-sm)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#059669";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(5,150,105,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E5E7EB";
                      e.target.style.boxShadow = "var(--vt-shadow-sm)";
                    }}
                  />
                  {searchQuery && (
                    <>
                      <button
                        onClick={() => setSearchQuery("")}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9CA3AF",
                          padding: "4px",
                          display: "flex",
                        }}
                      >
                        <FiX size={16} />
                      </button>

                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                        <PackageChecklist tourData={{ tourName: 'Virtual Tour' }} className="virtualtour-checklist" />
                      </div>
                    </>
                  )}
                </div>

                {/* Category filters */}
                <div
                  className="vt-category-btns"
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "nowrap",
                  }}
                >
                  {categories.map((cat) => (
                    <Pill
                      key={cat}
                      variant="outline"
                      size="md"
                      active={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat === "all"
                        ? "All Tours"
                        : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Pill>
                  ))}
                </div>

                {/* View mode toggle */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    padding: "4px",
                    backgroundColor: "#F3F4F6",
                    borderRadius: "var(--vt-radius-sm)",
                    marginLeft: "auto",
                  }}
                >
                  <IconButton
                    icon={<FiGrid size={16} />}
                    label="Grid view"
                    variant="ghost"
                    size={36}
                    active={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                  />
                  <IconButton
                    icon={<FiList size={16} />}
                    label="Carousel view"
                    variant="ghost"
                    size={36}
                    active={viewMode === "carousel"}
                    onClick={() => setViewMode("carousel")}
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Search results info */}
            {searchQuery && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "12px 20px",
                  backgroundColor: "#ECFDF5",
                  borderRadius: "var(--vt-radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  animation: "slideUp 0.3s ease",
                }}
              >
                <FiInfo size={16} color="#059669" />
                <span style={{ fontSize: "14px", color: "#065F46" }}>
                  Found{" "}
                  <strong>{filteredTours.length}</strong> tour
                  {filteredTours.length !== 1 ? "s" : ""} matching "
                  {searchQuery}"
                </span>
                {filteredTours.length === 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#059669",
                      fontSize: "14px",
                      fontWeight: "600",
                      textDecoration: "underline",
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* ══════════ HERO VIEWER ══════════ */}
            {currentTour && (
              <AnimatedSection animation="fadeInUp">
                <div
                  ref={heroRef}
                  className="vt-hero-viewer"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    position: "relative",
                    borderRadius: isFullscreen
                      ? "0"
                      : "var(--vt-radius-xl)",
                    overflow: "hidden",
                    boxShadow: isFullscreen ? "none" : "var(--vt-shadow-xl)",
                    height: isFullscreen ? "100vh" : "65vh",
                    minHeight: isFullscreen ? "100vh" : "500px",
                    maxHeight: isFullscreen ? "100vh" : "750px",
                    transition: "border-radius 0.3s",
                  }}
                >
                  {/* Background image with parallax effect */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "-20px",
                      backgroundImage: `url(${currentTour.panorama_url || currentTour.thumbnail_url || getBrandLogoUrl()})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition:
                        "opacity 0.6s var(--vt-transition), transform 0.6s var(--vt-transition)",
                      opacity: isTransitioning ? 0.3 : 1,
                      transform: isTransitioning
                        ? "scale(1.1)"
                        : "scale(1.02)",
                      filter: isTransitioning ? "blur(4px)" : "blur(0px)",
                    }}
                  />

                  {/* Multi-layer gradient overlays */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `
                        linear-gradient(180deg,
                          rgba(0,0,0,0.3) 0%,
                          transparent 30%,
                          transparent 50%,
                          rgba(0,0,0,0.85) 100%
                        )`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, transparent 55%)",
                    }}
                  />

                  {/* Decorative green accent */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "4px",
                      height: "100%",
                      background:
                        "linear-gradient(180deg, #059669, transparent)",
                      zIndex: 3,
                      opacity: isFullscreen ? 0 : 1,
                    }}
                  />

                  {/* ── Top bar ── */}
                  <div
                    className="vt-top-bar"
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "24px",
                      right: "24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      zIndex: 5,
                    }}
                  >
                    {/* Left: Counter + Category */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Pill variant="glass" size="md">
                        <FiCompass size={13} style={{ marginRight: 4 }} />
                        {currentIndex + 1} / {displayTours.length}
                      </Pill>
                      {currentTour.media_type && (
                        <Pill variant="green" size="sm">
                          {currentTour.media_type === "panorama"
                            ? "360°"
                            : currentTour.media_type === "mixed"
                              ? "Mixed"
                              : "Video"}
                        </Pill>
                      )}
                    </div>

                    {/* Right: Controls */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        icon={
                          autoPlay ? (
                            <FiPause size={14} />
                          ) : (
                            <FiPlay size={14} />
                          )
                        }
                        label={autoPlay ? "Pause autoplay" : "Start autoplay"}
                        active={autoPlay}
                        size={38}
                        onClick={() => setAutoPlay((p) => !p)}
                        tooltip={autoPlay ? "Pause" : "Play"}
                      />
                      <IconButton
                        icon={
                          favorites.has(currentTour?.id) ? (
                            <FiHeart
                              size={16}
                              fill="#EF4444"
                              color="#EF4444"
                            />
                          ) : (
                            <FiHeart size={16} />
                          )
                        }
                        label="Favorite"
                        size={38}
                        onClick={() => toggleFavorite(currentTour?.id)}
                        tooltip="Favorite"
                      />
                      <IconButton
                        icon={<FiShare2 size={16} />}
                        label="Share"
                        size={38}
                        onClick={() => setShowShareModal(true)}
                        tooltip="Share"
                      />
                      <IconButton
                        icon={<FiBookmark size={16} />}
                        label="Bookmark"
                        size={38}
                        tooltip="Save for later"
                      />
                    </div>
                  </div>

                  {/* ── Navigation arrows ── */}
                  {displayTours.length > 1 && (
                    <div className="vt-hero-arrows">
                      <button
                        onClick={() => {
                          setAutoPlay(false);
                          prev();
                        }}
                        aria-label="Previous tour"
                        className="vt-focus-ring"
                        style={{
                          position: "absolute",
                          left: isMobile ? "12px" : "24px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: isMobile ? "44px" : "56px",
                          height: isMobile ? "44px" : "56px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          transition: "all 0.3s var(--vt-transition)",
                          zIndex: 4,
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(5,150,105,0.9)";
                          e.currentTarget.style.border =
                            "1px solid rgba(5,150,105,0.9)";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1.15)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 30px rgba(5,150,105,0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255,255,255,0.1)";
                          e.currentTarget.style.border =
                            "1px solid rgba(255,255,255,0.2)";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <FiChevronLeft size={isMobile ? 20 : 24} />
                      </button>

                      <button
                        onClick={() => {
                          setAutoPlay(false);
                          next();
                        }}
                        aria-label="Next tour"
                        className="vt-focus-ring"
                        style={{
                          position: "absolute",
                          right: isMobile ? "12px" : "24px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: isMobile ? "44px" : "56px",
                          height: isMobile ? "44px" : "56px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          transition: "all 0.3s var(--vt-transition)",
                          zIndex: 4,
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(5,150,105,0.9)";
                          e.currentTarget.style.border =
                            "1px solid rgba(5,150,105,0.9)";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1.15)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 30px rgba(5,150,105,0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255,255,255,0.1)";
                          e.currentTarget.style.border =
                            "1px solid rgba(255,255,255,0.2)";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <FiChevronRight size={isMobile ? 20 : 24} />
                      </button>
                    </div>
                  )}

                  {/* ── Bottom content ── */}
                  <div
                    className="vt-hero-content"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: isMobile
                        ? "0 20px 28px"
                        : "0 40px 44px",
                      zIndex: 3,
                      opacity: isTransitioning ? 0 : 1,
                      transform: isTransitioning
                        ? "translateY(20px)"
                        : "translateY(0)",
                      transition:
                        "opacity 0.4s var(--vt-transition), transform 0.4s var(--vt-transition)",
                    }}
                  >
                    {/* Location & category */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Pill variant="green" size="md" icon={<FiMapPin size={13} />}>
                        {getLocation(currentTour)}
                      </Pill>

                      {currentTour.tags?.slice(0, 2).map((tag) => (
                        <Pill key={tag} variant="glass" size="sm">
                          #{tag}
                        </Pill>
                      ))}
                    </div>

                    {/* Title */}
                    <h2
                      className="vt-hero-title"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: isMobile
                          ? "26px"
                          : "clamp(32px, 4vw, 52px)",
                        fontWeight: "800",
                        color: "white",
                        marginBottom: "10px",
                        lineHeight: 1.1,
                        maxWidth: "700px",
                        textShadow: "0 2px 30px rgba(0,0,0,0.3)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {currentTour.title}
                    </h2>

                    {/* Description */}
                    <p
                      className="vt-hero-desc"
                      style={{
                        fontSize: isMobile ? "14px" : "clamp(15px, 1.3vw, 18px)",
                        color: "rgba(255,255,255,0.85)",
                        maxWidth: "580px",
                        marginBottom: "24px",
                        lineHeight: 1.65,
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 2 : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {currentTour.description}
                    </p>

                    {/* Controls row */}
                    <div
                      className="vt-controls-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Play button */}
                      <button
                        className="vt-btn-primary vt-focus-ring vt-play-btn"
                        onClick={() => {
                          if (currentVideoId) {
                            setAutoPlay(false);
                            playVideo(currentVideoId, currentTour.title);
                          }
                        }}
                        aria-label="Play tour video"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "14px 32px",
                          borderRadius: "var(--vt-radius-full)",
                          fontSize: "16px",
                        }}
                      >
                        {isPlayerOpen && activeVideoId === currentVideoId ? (
                          <FiPause size={20} />
                        ) : (
                          <FiPlay size={20} />
                        )}
                        {isPlayerOpen && activeVideoId === currentVideoId
                          ? "Now Playing"
                          : "Watch Tour"}
                      </button>

                      {/* Meta info pills */}
                      <div
                        className="vt-meta-pills"
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {currentTour.duration && (
                          <Pill
                            variant="glass"
                            size="lg"
                            icon={<FiClock size={15} />}
                          >
                            {currentTour.duration}
                          </Pill>
                        )}

                        {currentTour.view_count > 0 && (
                          <Pill
                            variant="glass"
                            size="lg"
                            icon={<FiEye size={15} />}
                          >
                            {currentTour.view_count.toLocaleString()} views
                          </Pill>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginLeft: isMobile ? 0 : "auto",
                        }}
                      >
                        <IconButton
                          icon={
                            isMuted ? (
                              <FiVolumeX size={18} />
                            ) : (
                              <FiVolume2 size={18} />
                            )
                          }
                          label={isMuted ? "Unmute" : "Mute"}
                          size={44}
                          onClick={() => setIsMuted((p) => !p)}
                          active={!isMuted}
                          tooltip={isMuted ? "Unmute" : "Mute"}
                        />
                        <IconButton
                          icon={
                            isFullscreen ? (
                              <FiMinimize2 size={18} />
                            ) : (
                              <FiMaximize2 size={18} />
                            )
                          }
                          label={
                            isFullscreen
                              ? "Exit fullscreen"
                              : "Fullscreen"
                          }
                          size={44}
                          onClick={toggleFullscreen}
                          tooltip={
                            isFullscreen ? "Exit Fullscreen" : "Fullscreen"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto-play progress bar */}
                  {autoPlay && displayTours.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        zIndex: 6,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          background:
                            "linear-gradient(90deg, #059669, #34D399, #6EE7B7)",
                          transition: "width 0.05s linear",
                          borderRadius: "0 2px 2px 0",
                          boxShadow: "0 0 10px rgba(52,211,153,0.5)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </AnimatedSection>
            )}

            {/* ══════════ DOT INDICATORS ══════════ */}
            {displayTours.length > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "20px 0 8px",
                }}
              >
                {displayTours.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAutoPlay(false);
                      goTo(i);
                    }}
                    aria-label={`Go to tour ${i + 1}`}
                    className="vt-focus-ring"
                    style={{
                      width: currentIndex === i ? "32px" : "8px",
                      height: "8px",
                      borderRadius: "var(--vt-radius-full)",
                      backgroundColor:
                        currentIndex === i ? "#059669" : "#D1D5DB",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.4s var(--vt-transition)",
                      padding: 0,
                      boxShadow:
                        currentIndex === i
                          ? "0 0 8px rgba(5,150,105,0.4)"
                          : "none",
                    }}
                    onMouseOver={(e) => {
                      if (currentIndex !== i) {
                        e.currentTarget.style.backgroundColor = "#9CA3AF";
                        e.currentTarget.style.width = "16px";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentIndex !== i) {
                        e.currentTarget.style.backgroundColor = "#D1D5DB";
                        e.currentTarget.style.width = "8px";
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {/* ══════════ THUMBNAIL CAROUSEL ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div style={{ marginTop: "24px" }}>
                {/* Section header */}
                <div
                  className="vt-section-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: isMobile ? "22px" : "28px",
                        fontWeight: "800",
                        color: "#111827",
                        marginBottom: "4px",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Explore All Tours
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6B7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FiCamera size={14} />
                      {displayTours.length} immersive experience
                      {displayTours.length !== 1 ? "s" : ""} available
                    </p>
                  </div>

                  {/* Scroll controls */}
                  <div
                    className="vt-nav-arrows"
                    style={{ display: "flex", gap: "8px" }}
                  >
                    <IconButton
                      icon={<FiChevronLeft size={20} />}
                      label="Scroll left"
                      variant="solid"
                      size={42}
                      onClick={() => {
                        if (trackRef.current) {
                          trackRef.current.scrollBy({
                            left: -320,
                            behavior: "smooth",
                          });
                        }
                      }}
                    />
                    <IconButton
                      icon={<FiChevronRight size={20} />}
                      label="Scroll right"
                      variant="solid"
                      size={42}
                      onClick={() => {
                        if (trackRef.current) {
                          trackRef.current.scrollBy({
                            left: 320,
                            behavior: "smooth",
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* ── VIEW: Carousel ── */}
                {viewMode === "carousel" && (
                  <div
                    ref={trackRef}
                    className="vt-thumb-track"
                    style={{
                      display: "flex",
                      gap: "16px",
                      overflowX: "auto",
                      scrollSnapType: "x mandatory",
                      paddingBottom: "12px",
                      scrollBehavior: "smooth",
                    }}
                  >
                    {displayTours.map((tour, index) => {
                      const isActive = currentIndex === index;
                      const isFav = favorites.has(tour.id);
                      return (
                        <div
                          key={tour.id}
                          className="vt-thumb-card"
                          onClick={() => {
                            setAutoPlay(false);
                            goTo(index);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`View ${tour.title}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setAutoPlay(false);
                              goTo(index);
                            }
                          }}
                          style={{
                            flex: "0 0 280px",
                            scrollSnapAlign: "start",
                            position: "relative",
                            borderRadius: "var(--vt-radius-lg)",
                            overflow: "hidden",
                            cursor: "pointer",
                            height: "180px",
                            transition:
                              "all 0.4s var(--vt-transition)",
                            border: isActive
                              ? "3px solid #059669"
                              : "3px solid transparent",
                            boxShadow: isActive
                              ? "0 8px 30px rgba(5,150,105,0.25), 0 0 0 1px rgba(5,150,105,0.1)"
                              : "var(--vt-shadow-md)",
                            transform: isActive
                              ? "translateY(-6px)"
                              : "translateY(0)",
                            opacity: isActive ? 1 : 0.88,
                          }}
                          onMouseOver={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.transform =
                                "translateY(-6px)";
                              e.currentTarget.style.opacity = "1";
                              e.currentTarget.style.boxShadow =
                                "0 12px 35px rgba(0,0,0,0.15)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.transform =
                                "translateY(0)";
                              e.currentTarget.style.opacity = "0.88";
                              e.currentTarget.style.boxShadow =
                                "var(--vt-shadow-md)";
                            }
                          }}
                        >
                          <img
                            src={tour.thumbnail_url || getBrandLogoUrl()}
                            alt={tour.title || BRAND_LOGO_ALT}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition:
                                "transform 0.6s var(--vt-transition)",
                            }}
                            onError={(e) => {
                              e.currentTarget.src = getBrandLogoUrl();
                              e.currentTarget.alt = BRAND_LOGO_ALT;
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.transform =
                                "scale(1.1)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.transform =
                                "scale(1)")
                            }
                          />

                          {/* Overlay gradient */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: `linear-gradient(180deg, transparent 25%, rgba(0,0,0,0.85) 100%)`,
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
                                background:
                                  "linear-gradient(90deg, #059669, #34D399, #6EE7B7)",
                                animation: "glow 2s ease infinite",
                              }}
                            />
                          )}

                          {/* Favorite badge */}
                          {isFav && (
                            <div
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                animation: "bounceIn 0.4s ease",
                              }}
                            >
                              <FiHeart
                                size={16}
                                fill="#EF4444"
                                color="#EF4444"
                              />
                            </div>
                          )}

                          {/* Center play icon */}
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              backgroundColor: isActive
                                ? "rgba(5,150,105,0.9)"
                                : "rgba(255,255,255,0.2)",
                              backdropFilter: "blur(8px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s",
                              opacity: isActive ? 1 : 0,
                              boxShadow: isActive
                                ? "0 4px 20px rgba(5,150,105,0.4)"
                                : "none",
                            }}
                          >
                            <FiPlay
                              size={16}
                              color="white"
                              style={{ marginLeft: "2px" }}
                            />
                          </div>

                          {/* Bottom content */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: "14px 16px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "white",
                                marginBottom: "6px",
                                lineHeight: 1.3,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tour.title}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "12px",
                                  color: "#34D399",
                                  fontWeight: "600",
                                }}
                              >
                                <FiMapPin size={11} />
                                {tour.meta?.location ||
                                  tour.destination_name ||
                                  ""}
                              </span>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "11px",
                                  color: "rgba(255,255,255,0.6)",
                                }}
                              >
                                <FiClock size={10} />
                                {tour.duration || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── VIEW: Grid ── */}
                {viewMode === "grid" && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : isTablet
                          ? "repeat(2, 1fr)"
                          : "repeat(3, 1fr)",
                      gap: "20px",
                    }}
                  >
                    {displayTours.map((tour, index) => {
                      const isActive = currentIndex === index;
                      const isFav = favorites.has(tour.id);
                      return (
                        <div
                          key={tour.id}
                          onClick={() => {
                            setAutoPlay(false);
                            goTo(index);
                          }}
                          role="button"
                          tabIndex={0}
                          className="vt-card-hover vt-focus-ring"
                          style={{
                            position: "relative",
                            borderRadius: "var(--vt-radius-lg)",
                            overflow: "hidden",
                            cursor: "pointer",
                            height: "260px",
                            border: isActive
                              ? "3px solid #059669"
                              : "3px solid transparent",
                            boxShadow: isActive
                              ? "0 8px 30px rgba(5,150,105,0.2)"
                              : "var(--vt-shadow-md)",
                            animation: `slideUp 0.4s ease ${index * 0.05}s both`,
                          }}
                        >
                          <img
                            src={tour.thumbnail_url || getBrandLogoUrl()}
                            alt={tour.title || BRAND_LOGO_ALT}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition:
                                "transform 0.6s var(--vt-transition)",
                            }}
                            onError={(e) => {
                              e.currentTarget.src = getBrandLogoUrl();
                              e.currentTarget.alt = BRAND_LOGO_ALT;
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.transform = "scale(1.08)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          />

                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)`,
                            }}
                          />

                          {/* Top badges */}
                          <div
                            style={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              right: 12,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {tour.media_type && (
                              <Pill variant="green" size="sm">
                                {tour.media_type === "panorama"
                                  ? "360°"
                                  : tour.media_type}
                              </Pill>
                            )}
                            <div style={{ display: "flex", gap: 4 }}>
                              {isFav && (
                                <FiHeart
                                  size={16}
                                  fill="#EF4444"
                                  color="#EF4444"
                                />
                              )}
                            </div>
                          </div>

                          {/* Center play */}
                          <div
                            style={{
                              position: "absolute",
                              top: "45%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "56px",
                              height: "56px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s",
                              boxShadow:
                                "0 4px 20px rgba(5,150,105,0.4)",
                            }}
                            className="grid-play-icon"
                          >
                            <FiPlay
                              size={22}
                              color="white"
                              style={{ marginLeft: 3 }}
                            />
                          </div>

                          {/* Bottom */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: "20px",
                            }}
                          >
                            <h4
                              style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: "white",
                                marginBottom: "8px",
                                lineHeight: 1.3,
                              }}
                            >
                              {tour.title}
                            </h4>
                            <p
                              style={{
                                fontSize: "13px",
                                color: "rgba(255,255,255,0.7)",
                                marginBottom: "10px",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.5,
                              }}
                            >
                              {tour.description}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "12px",
                                  color: "#34D399",
                                  fontWeight: "600",
                                }}
                              >
                                <FiMapPin size={11} />
                                {tour.meta?.location ||
                                  tour.destination_name ||
                                  "East Africa"}
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                }}
                              >
                                {tour.duration && (
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                      fontSize: "11px",
                                      color: "rgba(255,255,255,0.6)",
                                    }}
                                  >
                                    <FiClock size={10} />
                                    {tour.duration}
                                  </span>
                                )}
                                {tour.view_count > 0 && (
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                      fontSize: "11px",
                                      color: "rgba(255,255,255,0.6)",
                                    }}
                                  >
                                    <FiEye size={10} />
                                    {tour.view_count.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* ══════════ STATS SECTION ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div style={{ marginTop: "80px" }}>
                <div
                  className="vt-stats-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "20px",
                  }}
                >
                  {stats.map((stat, i) => (
                    <StatCounter key={i} {...stat} />
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* ══════════ FEATURES SECTION ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div style={{ marginTop: "80px" }}>
                <div style={{ textAlign: "center", marginBottom: "56px" }}>
                  <Pill
                    variant="solid"
                    size="md"
                    icon={<FiZap size={14} />}
                  >
                    Why Virtual Tours
                  </Pill>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: isMobile ? "28px" : "clamp(30px, 3vw, 42px)",
                      fontWeight: "800",
                      color: "#111827",
                      marginTop: "20px",
                      marginBottom: "14px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Immersive Experience Features
                  </h3>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#6B7280",
                      maxWidth: "560px",
                      margin: "0 auto",
                      lineHeight: 1.7,
                    }}
                  >
                    Every virtual tour is crafted with cutting-edge technology
                    for the most realistic safari experience possible
                  </p>
                </div>

                <div
                  className="vt-features-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="vt-card-hover vt-feature-card"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "var(--vt-radius-xl)",
                        padding: "40px 28px",
                        textAlign: "center",
                        boxShadow: "var(--vt-shadow-sm)",
                        border: "1px solid #F3F4F6",
                        cursor: "default",
                        position: "relative",
                        overflow: "hidden",
                        animation: `slideUp 0.4s ease ${index * 0.08}s both`,
                      }}
                    >
                      {/* Decorative background circle */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-30px",
                          right: "-30px",
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background: `${feature.color}06`,
                          transition: "all 0.4s",
                        }}
                      />

                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "20px",
                          background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}08)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          color: feature.color,
                          transition: "all 0.4s var(--vt-transition)",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {feature.icon}
                      </div>

                      <h4
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#111827",
                          marginBottom: "8px",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {feature.title}
                      </h4>

                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          lineHeight: 1.7,
                          marginBottom: "16px",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {feature.desc}
                      </p>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 14px",
                          borderRadius: "var(--vt-radius-full)",
                          backgroundColor: `${feature.color}10`,
                          color: feature.color,
                          fontSize: "12px",
                          fontWeight: "700",
                          letterSpacing: "0.3px",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {feature.stats}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* ══════════ KEYBOARD SHORTCUTS INFO ══════════ */}
            {!isMobile && (
              <AnimatedSection animation="fadeInUp">
                <div
                  style={{
                    marginTop: "60px",
                    padding: "28px 36px",
                    backgroundColor: "white",
                    borderRadius: "var(--vt-radius-xl)",
                    border: "1px solid #F3F4F6",
                    boxShadow: "var(--vt-shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: "#ECFDF5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#059669",
                      }}
                    >
                      <FiInfo size={18} />
                    </div>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      Keyboard Shortcuts
                    </h4>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "24px",
                    }}
                  >
                    {[
                      { keys: "← →", label: "Navigate tours" },
                      { keys: "Space", label: "Toggle autoplay" },
                      { keys: "F", label: "Toggle fullscreen" },
                      { keys: "M", label: "Toggle mute" },
                      { keys: "Esc", label: "Close modals" },
                    ].map(({ keys, label }) => (
                      <div
                        key={keys}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <kbd
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "#F3F4F6",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
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
                            fontSize: "13px",
                            color: "#6B7280",
                            fontWeight: "500",
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

            {/* ══════════ CTA SECTION ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div
                className="vt-cta-section"
                style={{
                  marginTop: "80px",
                  padding: isMobile ? "48px 24px" : "64px 48px",
                  background:
                    "linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%)",
                  borderRadius: "var(--vt-radius-xl)",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative elements */}
                <div
                  style={{
                    position: "absolute",
                    top: "-100px",
                    right: "-100px",
                    width: "300px",
                    height: "300px",
                    borderRadius: "50%",
                    background: "rgba(52,211,153,0.08)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-60px",
                    left: "-60px",
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background: "rgba(110,231,183,0.06)",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "24px",
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(12px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 28px",
                      animation: "float 3s ease infinite",
                    }}
                  >
                    <FiGlobe size={36} color="#34D399" />
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: isMobile
                        ? "28px"
                        : "clamp(32px, 3.5vw, 44px)",
                      fontWeight: "800",
                      color: "white",
                      marginBottom: "16px",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                    }}
                  >
                    Ready for the Real Thing?
                  </h3>

                  <p
                    style={{
                      fontSize: isMobile ? "15px" : "18px",
                      color: "rgba(255,255,255,0.8)",
                      maxWidth: "520px",
                      margin: "0 auto 36px",
                      lineHeight: 1.7,
                    }}
                  >
                    Experience the magic of East Africa in person. Let us craft
                    your perfect safari adventure with expert guides and
                    unforgettable moments.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="vt-focus-ring"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "16px 36px",
                        background:
                          "linear-gradient(135deg, white 0%, #F9FAFB 100%)",
                        color: "#065F46",
                        border: "none",
                        borderRadius: "var(--vt-radius-full)",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "800",
                        transition: "all 0.3s var(--vt-transition)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
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
                      <FiCompass size={20} />
                      Plan Your Safari
                    </button>

                    <button
                      className="vt-focus-ring"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "16px 36px",
                        background: "transparent",
                        color: "white",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderRadius: "var(--vt-radius-full)",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "700",
                        transition: "all 0.3s var(--vt-transition)",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.6)";
                        e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.1)";
                        e.currentTarget.style.transform =
                          "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.3)";
                        e.currentTarget.style.backgroundColor =
                          "transparent";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <FiMessageCircle size={18} />
                      Contact Us
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </>
        )}
      </section>

      {/* ══════════ SHARE MODAL ══════════ */}
      {showShareModal && (
        <ShareModal
          tour={currentTour}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* ══════════ BACK TO TOP ══════════ */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="vt-btn-primary vt-focus-ring"
          aria-label="Back to top"
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            width: "52px",
            height: "52px",
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

export default VirtualTour;