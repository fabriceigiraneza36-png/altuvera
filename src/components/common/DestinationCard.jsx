import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Map,
  ArrowRight,
  Users,
  Award,
  Leaf,
  Camera,
  Shield,
  Share2,
  Calendar,
  Bookmark,
  Eye,
  CheckCircle2,
  X,
  Copy,
  Twitter,
  Facebook,
  Mail,
  Wifi,
  Coffee,
  Car,
  Plane,
  Mountain,
  Waves,
  TreePine,
  Thermometer,
  CloudSun,
  Zap,
  TrendingUp,
  Globe,
  Phone,
  MessageCircle,
  ExternalLink,
  Info,
  ChevronDown,
  Grid3X3,
  Maximize2,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Professional Design Tokens
// ═══════════════════════════════════════════════════════════════════════════════

const theme = {
  colors: {
    primary: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B",
    },
    secondary: {
      50: "#F5F3FF",
      100: "#EDE9FE",
      200: "#DDD6FE",
      300: "#C4B5FD",
      400: "#A78BFA",
      500: "#8B5CF6",
      600: "#7C3AED",
      700: "#6D28D9",
      800: "#5B21B6",
      900: "#4C1D95",
    },
    neutral: {
      0: "#FFFFFF",
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E5E5E5",
      300: "#D4D4D4",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0A0A0A",
    },
    accent: {
      amber: { light: "#FEF3C7", main: "#F59E0B", dark: "#D97706" },
      rose: { light: "#FFE4E6", main: "#F43F5E", dark: "#E11D48" },
      sky: { light: "#E0F2FE", main: "#0EA5E9", dark: "#0284C7" },
      emerald: { light: "#D1FAE5", main: "#10B981", dark: "#059669" },
      violet: { light: "#EDE9FE", main: "#8B5CF6", dark: "#7C3AED" },
    },
    status: {
      success: "#22C55E",
      warning: "#EAB308",
      error: "#EF4444",
      info: "#3B82F6",
    },
    semantic: {
      available: "#22C55E",
      limited: "#F59E0B",
      soldOut: "#EF4444",
      popular: "#EC4899",
    },
  },
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    glow: (color) => `0 0 20px ${color}40, 0 0 40px ${color}20`,
    colored: (color) => `0 4px 14px ${color}30`,
  },
  radius: {
    none: "0",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    "3xl": "24px",
    full: "9999px",
  },
  spacing: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },
  typography: {
    fontFamily: {
      display: "'Playfair Display', Georgia, 'Times New Roman', serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
    },
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    default: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    smooth: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
    slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  zIndex: {
    base: 0,
    above: 10,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    tooltip: 500,
    max: 9999,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS INJECTION - Global Styles & Keyframes
// ═══════════════════════════════════════════════════════════════════════════════

const STYLE_ID = "modern-destination-card-styles";

if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const styleSheet = document.createElement("style");
  styleSheet.id = STYLE_ID;
  styleSheet.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes pulse-soft {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(0.98); }
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.2); }
      50% { transform: scale(1); }
      75% { transform: scale(1.15); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes progress-bar {
      from { width: 0; }
      to { width: 100%; }
    }

    @keyframes toast-slide {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    .destination-card-modern {
      --card-bg: #ffffff;
      --card-border: rgba(0, 0, 0, 0.08);
      --text-primary: #171717;
      --text-secondary: #525252;
      --text-muted: #737373;
    }

    .destination-card-modern.dark-mode {
      --card-bg: #1f1f1f;
      --card-border: rgba(255, 255, 255, 0.1);
      --text-primary: #fafafa;
      --text-secondary: #d4d4d4;
      --text-muted: #a3a3a3;
    }

    @media (prefers-reduced-motion: reduce) {
      .destination-card-modern * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    .destination-card-modern:focus-within {
      outline: 2px solid ${theme.colors.primary[500]};
      outline-offset: 2px;
    }

    /* Scrollbar Styling */
    .card-scrollable::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    .card-scrollable::-webkit-scrollbar-track {
      background: transparent;
    }

    .card-scrollable::-webkit-scrollbar-thumb {
      background: ${theme.colors.neutral[300]};
      border-radius: 4px;
    }

    .card-scrollable::-webkit-scrollbar-thumb:hover {
      background: ${theme.colors.neutral[400]};
    }

    /* Focus Visible */
    .destination-card-modern button:focus-visible,
    .destination-card-modern a:focus-visible {
      outline: 2px solid ${theme.colors.primary[500]};
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(styleSheet);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT & HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

// Card Context for sharing state
const CardContext = createContext(null);

const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) throw new Error("useCardContext must be used within CardProvider");
  return context;
};

// Media Query Hook
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

// Intersection Observer Hook
const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
};

// Long Press Hook
const useLongPress = (callback, ms = 500) => {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (startLongPress) {
      timerRef.current = setTimeout(() => {
        callbackRef.current?.();
      }, ms);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [startLongPress, ms]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatPrice = (price, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const calculateDiscount = (original, current) => {
  return Math.round(((original - current) / original) * 100);
};

const getAvailabilityStatus = (spotsLeft, totalSpots) => {
  const percentage = (spotsLeft / totalSpots) * 100;
  if (percentage === 0) return { status: "soldOut", label: "Sold Out", color: theme.colors.semantic.soldOut };
  if (percentage <= 20) return { status: "limited", label: `Only ${spotsLeft} left!`, color: theme.colors.semantic.limited };
  if (percentage <= 50) return { status: "filling", label: "Filling Fast", color: theme.colors.semantic.popular };
  return { status: "available", label: "Available", color: theme.colors.semantic.available };
};

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

// ═══════════════════════════════════════════════════════════════════════════════
// ATOMIC COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Shimmer Loading Skeleton
const Shimmer = memo(({ width = "100%", height = "100%", borderRadius = "0" }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, 
        ${theme.colors.neutral[200]} 0%, 
        ${theme.colors.neutral[100]} 40%, 
        ${theme.colors.neutral[200]} 100%
      )`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease-in-out infinite",
    }}
  />
));

// Icon Button Component
const IconButton = memo(({
  icon: Icon,
  label,
  onClick,
  active = false,
  variant = "ghost",
  size = "md",
  disabled = false,
  loading = false,
  badge = null,
  tooltip = null,
  className = "",
  style = {},
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizes = {
    sm: { button: 32, icon: 14 },
    md: { button: 40, icon: 18 },
    lg: { button: 48, icon: 22 },
  };

  const variants = {
    ghost: {
      bg: "rgba(255, 255, 255, 0.1)",
      hoverBg: "rgba(255, 255, 255, 0.2)",
      color: "#fff",
    },
    solid: {
      bg: theme.colors.primary[600],
      hoverBg: theme.colors.primary[700],
      color: "#fff",
    },
    glass: {
      bg: "rgba(255, 255, 255, 0.15)",
      hoverBg: "rgba(255, 255, 255, 0.25)",
      color: "#fff",
      backdrop: "blur(12px)",
    },
    danger: {
      bg: active ? theme.colors.accent.rose.main : "rgba(255, 255, 255, 0.15)",
      hoverBg: theme.colors.accent.rose.dark,
      color: "#fff",
    },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <div style={{ position: "relative" }}>
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && !loading) onClick?.(e);
        }}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        className={className}
        style={{
          width: s.button,
          height: s.button,
          borderRadius: theme.radius.lg,
          border: "none",
          background: v.bg,
          backdropFilter: v.backdrop,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          position: "relative",
          transition: `all ${theme.transitions.fast}`,
          ...style,
        }}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Zap size={s.icon} color={v.color} />
          </motion.div>
        ) : (
          <Icon
            size={s.icon}
            color={v.color}
            fill={active && variant === "danger" ? v.color : "none"}
            strokeWidth={2}
          />
        )}
        {badge && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: theme.radius.full,
              background: theme.colors.accent.rose.main,
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {badge}
          </span>
        )}
      </motion.button>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "6px 10px",
              background: theme.colors.neutral[800],
              color: "#fff",
              fontSize: "12px",
              fontWeight: 500,
              borderRadius: theme.radius.md,
              whiteSpace: "nowrap",
              zIndex: theme.zIndex.tooltip,
              boxShadow: theme.shadows.lg,
            }}
          >
            {tooltip}
            <div
              style={{
                position: "absolute",
                bottom: -4,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: `5px solid ${theme.colors.neutral[800]}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Badge Component
const Badge = memo(({
  children,
  variant = "default",
  size = "sm",
  icon: Icon,
  pulse = false,
  className = "",
}) => {
  const variants = {
    default: {
      bg: "rgba(255, 255, 255, 0.95)",
      color: theme.colors.neutral[700],
      border: "1px solid rgba(0, 0, 0, 0.08)",
    },
    primary: {
      bg: `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[400]})`,
      color: "#fff",
      border: "none",
    },
    featured: {
      bg: `linear-gradient(135deg, ${theme.colors.accent.amber.main}, #FBBF24)`,
      color: "#fff",
      border: "none",
    },
    eco: {
      bg: `linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[500]})`,
      color: "#fff",
      border: "none",
    },
    new: {
      bg: `linear-gradient(135deg, ${theme.colors.accent.sky.main}, #38BDF8)`,
      color: "#fff",
      border: "none",
    },
    popular: {
      bg: `linear-gradient(135deg, ${theme.colors.accent.rose.main}, #FB7185)`,
      color: "#fff",
      border: "none",
    },
    limited: {
      bg: `linear-gradient(135deg, ${theme.colors.semantic.warning}, #FCD34D)`,
      color: theme.colors.neutral[800],
      border: "none",
    },
    premium: {
      bg: `linear-gradient(135deg, ${theme.colors.secondary[600]}, ${theme.colors.secondary[500]})`,
      color: "#fff",
      border: "none",
    },
    success: {
      bg: theme.colors.status.success,
      color: "#fff",
      border: "none",
    },
  };

  const sizes = {
    xs: { padding: "3px 8px", fontSize: "10px", iconSize: 10 },
    sm: { padding: "5px 10px", fontSize: "11px", iconSize: 12 },
    md: { padding: "6px 12px", fontSize: "12px", iconSize: 14 },
    lg: { padding: "8px 16px", fontSize: "13px", iconSize: 16 },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: s.padding,
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: theme.radius.md,
        fontSize: s.fontSize,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        backdropFilter: variant === "default" ? "blur(12px)" : "none",
        boxShadow: theme.shadows.sm,
        animation: pulse ? "pulse-soft 2s ease-in-out infinite" : "none",
      }}
    >
      {Icon && <Icon size={s.iconSize} strokeWidth={2.5} />}
      {children}
    </span>
  );
});

// Star Rating Component
const StarRating = memo(({ rating = 0, maxRating = 5, size = 14, showValue = true, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: maxRating }).map((_, i) => {
          const isFull = i < fullStars;
          const isHalf = i === fullStars && hasHalfStar;

          return (
            <div key={i} style={{ position: "relative" }}>
              <Star
                size={size}
                fill={isFull ? theme.colors.accent.amber.main : theme.colors.neutral[200]}
                color={isFull || isHalf ? theme.colors.accent.amber.main : theme.colors.neutral[300]}
                strokeWidth={1.5}
              />
              {isHalf && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    width: "50%",
                  }}
                >
                  <Star
                    size={size}
                    fill={theme.colors.accent.amber.main}
                    color={theme.colors.accent.amber.main}
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: theme.colors.neutral[800],
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {count > 0 && (
        <span style={{ fontSize: "12px", color: theme.colors.neutral[500] }}>
          ({formatNumber(count)})
        </span>
      )}
    </div>
  );
});

// Price Display Component
const PriceDisplay = memo(({
  price,
  originalPrice,
  currency = "USD",
  period = "person",
  size = "md",
  showDiscount = true,
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? calculateDiscount(originalPrice, price) : 0;

  const sizes = {
    sm: { price: "18px", original: "13px", period: "11px" },
    md: { price: "22px", original: "14px", period: "12px" },
    lg: { price: "28px", original: "16px", period: "14px" },
  };

  const s = sizes[size];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontSize: s.price,
            fontWeight: 700,
            color: theme.colors.neutral[900],
            letterSpacing: "-0.02em",
          }}
        >
          {formatPrice(price, currency)}
        </span>
        <span
          style={{
            fontSize: s.period,
            color: theme.colors.neutral[500],
          }}
        >
          / {period}
        </span>
      </div>
      {hasDiscount && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: s.original,
              color: theme.colors.neutral[400],
              textDecoration: "line-through",
            }}
          >
            {formatPrice(originalPrice, currency)}
          </span>
          {showDiscount && (
            <Badge variant="popular" size="xs">
              {discount}% OFF
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});

// Feature Tag Component
const FeatureTag = memo(({ icon: Icon, children, color }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "6px 10px",
      background: theme.colors.neutral[100],
      borderRadius: theme.radius.md,
      fontSize: "12px",
      fontWeight: 500,
      color: theme.colors.neutral[600],
      transition: `all ${theme.transitions.fast}`,
    }}
  >
    <Icon
      size={12}
      strokeWidth={2}
      color={color || theme.colors.neutral[500]}
    />
    {children}
  </span>
));

// Availability Indicator
const AvailabilityIndicator = memo(({ spotsLeft, totalSpots = 20 }) => {
  const { status, label, color } = getAvailabilityStatus(spotsLeft, totalSpots);
  const percentage = (spotsLeft / totalSpots) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: theme.radius.full,
              background: color,
              animation: status === "limited" ? "pulse-soft 1s infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: color,
            }}
          >
            {label}
          </span>
        </div>
        <span style={{ fontSize: "11px", color: theme.colors.neutral[500] }}>
          {spotsLeft}/{totalSpots} spots
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: theme.colors.neutral[200],
          borderRadius: theme.radius.full,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            height: "100%",
            background: color,
            borderRadius: theme.radius.full,
          }}
        />
      </div>
    </div>
  );
});

// Image Gallery Component
const ImageGallery = memo(({
  images = [],
  currentIndex = 0,
  onIndexChange,
  isHovered = false,
  onPlayVideo,
  hasVideo = false,
}) => {
  const [imageStates, setImageStates] = useState({});
  const [showAllImages, setShowAllImages] = useState(false);
  const touchStartRef = useRef(null);

  const handleImageLoad = (index) => {
    setImageStates((prev) => ({ ...prev, [index]: "loaded" }));
  };

  const handleImageError = (index) => {
    setImageStates((prev) => ({ ...prev, [index]: "error" }));
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      onIndexChange?.(
        diff > 0
          ? (currentIndex + 1) % images.length
          : (currentIndex - 1 + images.length) % images.length
      );
    }
    touchStartRef.current = null;
  };

  const currentImage =
    images[currentIndex] ||
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "260px",
        overflow: "hidden",
        background: theme.colors.neutral[200],
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Shimmer Skeleton */}
      {imageStates[currentIndex] !== "loaded" && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Shimmer />
        </div>
      )}

      {/* Main Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImage}
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          onLoad={() => handleImageLoad(currentIndex)}
          onError={() => handleImageError(currentIndex)}
          initial={{ opacity: 0 }}
          animate={{
            opacity: imageStates[currentIndex] === "loaded" ? 1 : 0,
            scale: isHovered ? 1.05 : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%),
            linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onIndexChange?.((currentIndex - 1 + images.length) % images.length);
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "12px",
                  transform: "translateY(-50%)",
                  width: "36px",
                  height: "36px",
                  borderRadius: theme.radius.full,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: theme.shadows.lg,
                  zIndex: 20,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Previous image"
              >
                <ChevronLeft size={18} color={theme.colors.neutral[700]} />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onIndexChange?.((currentIndex + 1) % images.length);
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "12px",
                  transform: "translateY(-50%)",
                  width: "36px",
                  height: "36px",
                  borderRadius: theme.radius.full,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: theme.shadows.lg,
                  zIndex: 20,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Next image"
              >
                <ChevronRight size={18} color={theme.colors.neutral[700]} />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "6px",
            padding: "6px 12px",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: theme.radius.full,
            zIndex: 20,
          }}
        >
          {images.slice(0, 7).map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onIndexChange?.(i);
              }}
              style={{
                width: i === currentIndex ? "20px" : "6px",
                height: "6px",
                borderRadius: theme.radius.full,
                border: "none",
                padding: 0,
                background: i === currentIndex ? "#fff" : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: `all ${theme.transitions.smooth}`,
              }}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === currentIndex}
            />
          ))}
          {images.length > 7 && (
            <span
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.8)",
                marginLeft: "4px",
              }}
            >
              +{images.length - 7}
            </span>
          )}
        </div>
      )}

      {/* Video Play Button */}
      {hasVideo && (
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlayVideo?.();
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "64px",
                height: "64px",
                borderRadius: theme.radius.full,
                border: "none",
                background: "rgba(255, 255, 255, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: theme.shadows.xl,
                zIndex: 15,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Play video"
            >
              <Play
                size={28}
                color={theme.colors.primary[600]}
                fill={theme.colors.primary[600]}
              />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            borderRadius: theme.radius.md,
            zIndex: 20,
          }}
        >
          <Camera size={12} color="rgba(255, 255, 255, 0.8)" />
          <span style={{ fontSize: "11px", color: "#fff", fontWeight: 500 }}>
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      )}
    </div>
  );
});

// Quick Info Pills
const QuickInfoPills = memo(({ duration, groupSize, difficulty }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    }}
  >
    {duration && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 10px",
          background: theme.colors.neutral[100],
          borderRadius: theme.radius.full,
          fontSize: "12px",
          color: theme.colors.neutral[600],
        }}
      >
        <Clock size={12} />
        <span>{duration}</span>
      </div>
    )}
    {groupSize && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 10px",
          background: theme.colors.neutral[100],
          borderRadius: theme.radius.full,
          fontSize: "12px",
          color: theme.colors.neutral[600],
        }}
      >
        <Users size={12} />
        <span>{groupSize}</span>
      </div>
    )}
    {difficulty && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 10px",
          background:
            difficulty === "Easy"
              ? theme.colors.primary[100]
              : difficulty === "Moderate"
              ? theme.colors.accent.amber.light
              : theme.colors.accent.rose.light,
          borderRadius: theme.radius.full,
          fontSize: "12px",
          color:
            difficulty === "Easy"
              ? theme.colors.primary[700]
              : difficulty === "Moderate"
              ? theme.colors.accent.amber.dark
              : theme.colors.accent.rose.dark,
          fontWeight: 500,
        }}
      >
        <Mountain size={12} />
        <span>{difficulty}</span>
      </div>
    )}
  </div>
));

// Share Modal
const ShareModal = memo(({ isOpen, onClose, destination, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: Copy,
      color: theme.colors.neutral[600],
      action: handleCopy,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "#1DA1F2",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=Check out ${destination?.name}!&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "#4267B2",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
      },
    },
    {
      name: "Email",
      icon: Mail,
      color: theme.colors.primary[600],
      action: () => {
        window.location.href = `mailto:?subject=Check out ${destination?.name}&body=${shareUrl}`;
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: theme.zIndex.modal,
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: theme.radius["2xl"],
            padding: "24px",
            maxWidth: "360px",
            width: "100%",
            boxShadow: theme.shadows["2xl"],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: theme.colors.neutral[900],
                margin: 0,
              }}
            >
              Share this destination
            </h3>
            <button
              onClick={onClose}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: theme.radius.full,
                border: "none",
                background: theme.colors.neutral[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} color={theme.colors.neutral[600]} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {shareOptions.map((option) => (
              <motion.button
                key={option.name}
                onClick={option.action}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px",
                  background: theme.colors.neutral[50],
                  border: `1px solid ${theme.colors.neutral[200]}`,
                  borderRadius: theme.radius.lg,
                  cursor: "pointer",
                  transition: `all ${theme.transitions.fast}`,
                }}
              >
                <option.icon size={18} color={option.color} />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: theme.colors.neutral[700],
                  }}
                >
                  {option.name === "Copy Link" && copied ? "Copied!" : option.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// CTA Button
const CTAButton = memo(({ to, children, variant = "primary", size = "md", fullWidth = false, onClick }) => {
  const variants = {
    primary: {
      bg: theme.colors.primary[600],
      hoverBg: theme.colors.primary[700],
      color: "#fff",
    },
    secondary: {
      bg: theme.colors.neutral[100],
      hoverBg: theme.colors.neutral[200],
      color: theme.colors.neutral[700],
    },
    outline: {
      bg: "transparent",
      hoverBg: theme.colors.primary[50],
      color: theme.colors.primary[600],
      border: `2px solid ${theme.colors.primary[600]}`,
    },
  };

  const sizes = {
    sm: { padding: "10px 16px", fontSize: "13px" },
    md: { padding: "12px 20px", fontSize: "14px" },
    lg: { padding: "16px 28px", fontSize: "15px" },
  };

  const v = variants[variant];
  const s = sizes[size];

  const content = (
    <motion.span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: s.padding,
        background: v.bg,
        color: v.color,
        border: v.border || "none",
        borderRadius: theme.radius.lg,
        fontSize: s.fontSize,
        fontWeight: 600,
        textDecoration: "none",
        width: fullWidth ? "100%" : "auto",
        boxShadow: variant === "primary" ? theme.shadows.colored(theme.colors.primary[600]) : "none",
      }}
      whileHover={{
        background: v.hoverBg,
        boxShadow:
          variant === "primary"
            ? `0 8px 25px ${theme.colors.primary[600]}40`
            : theme.shadows.sm,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.span>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none", width: fullWidth ? "100%" : "auto" }}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        cursor: "pointer",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {content}
    </button>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DESTINATION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ModernDestinationCard = ({
  destination,
  index = 0,
  variant = "default",
  showPrice = true,
  showAvailability = false,
  compact = false,
  onFavorite,
  onShare,
  onQuickView,
  onCompare,
  className = "",
}) => {
  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(destination?.isFavorite || false);
  const [isComparing, setIsComparing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Refs
  const cardRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Hooks
  const [inViewRef, isInView] = useInView({ threshold: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const navigate = useNavigate();

  // Derived Data
  const images = useMemo(() => {
    const imgs = destination?.images || [destination?.heroImage];
    return imgs.filter(Boolean).length > 0
      ? imgs.filter(Boolean)
      : ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80"];
  }, [destination]);

  const destinationId = destination?._id || destination?.id || destination?.slug;
  const hasVideo = destination?.videoId || destination?.hasVideo;

  // Auto-advance images
  useEffect(() => {
    if (images.length <= 1 || !isInView) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000 + index * 300);

    return () => clearInterval(autoPlayRef.current);
  }, [images.length, isInView, index]);

  // Pause on hover
  useEffect(() => {
    if (isHovered && autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, [isHovered]);

  // Handlers
  const handleFavoriteToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
    onFavorite?.(destinationId, !isFavorite);
  }, [destinationId, isFavorite, onFavorite]);

  const handleShare = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share && isMobile) {
      navigator.share({
        title: destination?.name,
        text: destination?.description,
        url: `/destination/${destination?.slug}`,
      });
    } else {
      setShowShareModal(true);
    }
    onShare?.(destinationId);
  }, [destination, destinationId, isMobile, onShare]);

  const handleQuickView = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(destination);
  }, [destination, onQuickView]);

  const handleCompare = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsComparing((prev) => !prev);
    onCompare?.(destinationId, !isComparing);
  }, [destinationId, isComparing, onCompare]);

  const handlePlayVideo = useCallback(() => {
    // Implementation depends on your video player
    console.log("Play video:", destination?.videoId);
  }, [destination?.videoId]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <>
      <motion.article
        ref={(el) => {
          cardRef.current = el;
          inViewRef.current = el;
        }}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`destination-card-modern ${className}`}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          background: theme.colors.neutral[0],
          borderRadius: theme.radius["2xl"],
          overflow: "hidden",
          boxShadow: isHovered ? theme.shadows["2xl"] : theme.shadows.lg,
          transform: isHovered && !isMobile ? "translateY(-8px)" : "translateY(0)",
          transition: `all ${theme.transitions.smooth}`,
          height: "100%",
          border: isComparing
            ? `2px solid ${theme.colors.primary[500]}`
            : "1px solid rgba(0, 0, 0, 0.05)",
        }}
        role="article"
        aria-label={`${destination?.name} destination card`}
      >
        {/* ═══════════ IMAGE SECTION ═══════════ */}
        <ImageGallery
          images={images}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
          isHovered={isHovered}
          onPlayVideo={handlePlayVideo}
          hasVideo={hasVideo}
        />

        {/* ═══════════ BADGES OVERLAY ═══════════ */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            maxWidth: "70%",
            zIndex: 15,
          }}
        >
          {destination?.isFeatured && (
            <Badge variant="featured" icon={Award}>
              Featured
            </Badge>
          )}
          {destination?.isNew && (
            <Badge variant="new" icon={Zap}>
              New
            </Badge>
          )}
          {destination?.isEcoFriendly && (
            <Badge variant="eco" icon={Leaf}>
              Eco-Friendly
            </Badge>
          )}
          {destination?.isPopular && (
            <Badge variant="popular" icon={TrendingUp} pulse>
              Popular
            </Badge>
          )}
          {destination?.discount && (
            <Badge variant="limited">-{destination.discount}%</Badge>
          )}
          <Badge>{destination?.type || destination?.category || "Adventure"}</Badge>
        </div>

        {/* ═══════════ ACTION BUTTONS OVERLAY ═══════════ */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 15,
          }}
        >
          <IconButton
            icon={Heart}
            label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={handleFavoriteToggle}
            variant="danger"
            active={isFavorite}
            tooltip={isFavorite ? "Saved" : "Save"}
          />

          <AnimatePresence>
            {(isHovered || isMobile) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <IconButton
                  icon={Share2}
                  label="Share"
                  onClick={handleShare}
                  variant="glass"
                  tooltip="Share"
                />
                <IconButton
                  icon={Eye}
                  label="Quick view"
                  onClick={handleQuickView}
                  variant="glass"
                  tooltip="Quick View"
                />
                <IconButton
                  icon={Map}
                  label="View on map"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Open map functionality
                  }}
                  variant="glass"
                  tooltip="Map"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════ LOCATION PILL ═══════════ */}
        <div
          style={{
            position: "absolute",
            bottom: compact ? "auto" : "270px",
            top: compact ? "auto" : "auto",
            left: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            borderRadius: theme.radius.full,
            zIndex: 15,
            boxShadow: theme.shadows.md,
          }}
        >
          <MapPin size={14} color={theme.colors.primary[600]} strokeWidth={2.5} />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: theme.colors.neutral[700],
            }}
          >
            {destination?.location || destination?.country || "East Africa"}
          </span>
          {destination?.distance && (
            <span
              style={{
                fontSize: "11px",
                color: theme.colors.neutral[500],
                marginLeft: "4px",
              }}
            >
              • {destination.distance}
            </span>
          )}
        </div>

        {/* ═══════════ CONTENT SECTION ═══════════ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: compact ? "16px" : "20px",
            flex: 1,
          }}
        >
          {/* Header with Title and Rating */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Link
              to={`/destination/${destination?.slug || destinationId}`}
              style={{ textDecoration: "none", flex: 1 }}
            >
              <h3
                style={{
                  fontFamily: theme.typography.fontFamily.display,
                  fontSize: compact ? "18px" : "20px",
                  fontWeight: 700,
                  color: isHovered
                    ? theme.colors.primary[700]
                    : theme.colors.neutral[900],
                  lineHeight: theme.typography.lineHeight.snug,
                  margin: 0,
                  transition: `color ${theme.transitions.fast}`,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {destination?.name}
              </h3>
            </Link>

            <StarRating
              rating={destination?.rating || 4.8}
              count={destination?.reviewCount || destination?.reviews}
              size={14}
            />
          </div>

          {/* Description */}
          {!compact && (
            <p
              style={{
                fontSize: "14px",
                lineHeight: theme.typography.lineHeight.relaxed,
                color: theme.colors.neutral[600],
                margin: "0 0 16px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {destination?.shortDescription ||
                destination?.description ||
                "Experience the breathtaking beauty and unforgettable adventures of this stunning destination."}
            </p>
          )}

          {/* Quick Info Pills */}
          <QuickInfoPills
            duration={destination?.duration}
            groupSize={destination?.groupSize}
            difficulty={destination?.difficulty}
          />

          {/* Features/Amenities */}
          {!compact && destination?.highlights && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "12px",
                marginBottom: "16px",
              }}
            >
              {destination.highlights.slice(0, 3).map((highlight, i) => (
                <FeatureTag key={i} icon={CheckCircle2}>
                  {highlight}
                </FeatureTag>
              ))}
              {destination.highlights.length > 3 && (
                <span
                  style={{
                    fontSize: "12px",
                    color: theme.colors.primary[600],
                    fontWeight: 500,
                    padding: "6px 10px",
                  }}
                >
                  +{destination.highlights.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Availability */}
          {showAvailability && destination?.spotsLeft !== undefined && (
            <div style={{ marginTop: "auto", marginBottom: "16px" }}>
              <AvailabilityIndicator
                spotsLeft={destination.spotsLeft}
                totalSpots={destination.totalSpots || 20}
              />
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: theme.colors.neutral[200],
              margin: "auto 0 16px",
            }}
          />

          {/* Footer: Price and CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            {showPrice && (
              <PriceDisplay
                price={destination?.price || destination?.startingPrice || 299}
                originalPrice={destination?.originalPrice}
                period={destination?.pricePeriod || "person"}
                size={compact ? "sm" : "md"}
              />
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              {onCompare && (
                <CTAButton
                  variant="outline"
                  size="sm"
                  onClick={handleCompare}
                >
                  {isComparing ? <CheckCircle2 size={16} /> : <Grid3X3 size={16} />}
                </CTAButton>
              )}
              <CTAButton
                to={`/destination/${destination?.slug || destinationId}`}
                variant="primary"
                size={compact ? "sm" : "md"}
              >
                <span>Explore</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </CTAButton>
            </div>
          </div>
        </div>

        {/* ═══════════ HOVER ACCENT LINE ═══════════ */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${theme.colors.primary[500]}, ${theme.colors.primary[400]}, ${theme.colors.secondary[500]})`,
            transformOrigin: "left",
          }}
        />

        {/* ═══════════ COMPARE INDICATOR ═══════════ */}
        {isComparing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60px",
              height: "60px",
              borderRadius: theme.radius.full,
              background: theme.colors.primary[500],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: theme.shadows.xl,
              zIndex: 30,
              animation: "bounce-in 0.3s ease-out",
            }}
          >
            <CheckCircle2 size={28} color="#fff" strokeWidth={2.5} />
          </div>
        )}
      </motion.article>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        destination={destination}
        url={`/destination/${destination?.slug}`}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CARD VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

// Compact Card Variant
export const CompactDestinationCard = (props) => (
  <ModernDestinationCard {...props} compact />
);

// Featured Card Variant (Larger)
export const FeaturedDestinationCard = ({ destination, ...props }) => (
  <ModernDestinationCard
    {...props}
    destination={{ ...destination, isFeatured: true }}
    showAvailability
  />
);

// List Card Variant (Horizontal)
export const ListDestinationCard = memo(({ destination, index = 0, onFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(destination?.isFavorite || false);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
    onFavorite?.(destination?.id, !isFavorite);
  };

  if (isMobile) {
    return <ModernDestinationCard destination={destination} index={index} compact />;
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        background: theme.colors.neutral[0],
        borderRadius: theme.radius.xl,
        overflow: "hidden",
        boxShadow: isHovered ? theme.shadows.xl : theme.shadows.md,
        transition: `all ${theme.transitions.smooth}`,
        border: "1px solid rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Image Section */}
      <div
        style={{
          position: "relative",
          width: "280px",
          minHeight: "200px",
          flexShrink: 0,
        }}
      >
        <img
          src={destination?.images?.[0] || destination?.heroImage}
          alt={destination?.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transition: `transform ${theme.transitions.slow}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 60%, rgba(0,0,0,0.1) 100%)",
          }}
        />
        {destination?.isFeatured && (
          <div style={{ position: "absolute", top: "12px", left: "12px" }}>
            <Badge variant="featured" icon={Award}>
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={14} color={theme.colors.primary[600]} />
            <span style={{ fontSize: "13px", color: theme.colors.neutral[500] }}>
              {destination?.location}
            </span>
          </div>
          <StarRating rating={destination?.rating || 4.8} count={destination?.reviews} size={12} />
        </div>

        <Link
          to={`/destination/${destination?.slug}`}
          style={{ textDecoration: "none" }}
        >
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.display,
              fontSize: "22px",
              fontWeight: 700,
              color: isHovered ? theme.colors.primary[700] : theme.colors.neutral[900],
              margin: "0 0 8px",
              transition: `color ${theme.transitions.fast}`,
            }}
          >
            {destination?.name}
          </h3>
        </Link>

        <p
          style={{
            fontSize: "14px",
            color: theme.colors.neutral[600],
            lineHeight: 1.6,
            margin: "0 0 16px",
            flex: 1,
          }}
        >
          {truncateText(destination?.description, 150)}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <PriceDisplay
            price={destination?.price || 299}
            originalPrice={destination?.originalPrice}
            size="md"
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <IconButton
              icon={Heart}
              label="Save"
              onClick={handleFavoriteToggle}
              active={isFavorite}
              variant={isFavorite ? "danger" : "glass"}
              style={{
                background: isFavorite
                  ? theme.colors.accent.rose.main
                  : theme.colors.neutral[100],
              }}
            />
            <CTAButton to={`/destination/${destination?.slug}`}>
              <span>View Details</span>
              <ArrowRight size={16} />
            </CTAButton>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

// Grid of Cards Component
export const DestinationCardGrid = memo(({
  destinations = [],
  columns = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = "24px",
  variant = "default",
  showLoadMore = true,
  onLoadMore,
  loading = false,
  emptyState,
}) => {
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);

  const getColumns = () => {
    if (isMobile) return columns.mobile;
    if (isTablet) return columns.tablet;
    return columns.desktop;
  };

  if (!destinations.length && !loading) {
    return (
      emptyState || (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: theme.colors.neutral[500],
          }}
        >
          <Globe size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
            No destinations found
          </h3>
          <p style={{ fontSize: "14px" }}>Try adjusting your filters</p>
        </div>
      )
    );
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
          gap,
        }}
      >
        {destinations.map((destination, index) => {
          const CardComponent =
            variant === "list"
              ? ListDestinationCard
              : variant === "compact"
              ? CompactDestinationCard
              : ModernDestinationCard;

          return (
            <CardComponent
              key={destination._id || destination.id || index}
              destination={destination}
              index={index}
            />
          );
        })}

        {/* Loading Skeletons */}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              style={{
                borderRadius: theme.radius["2xl"],
                overflow: "hidden",
                background: theme.colors.neutral[0],
              }}
            >
              <Shimmer height="260px" />
              <div style={{ padding: "20px" }}>
                <Shimmer height="24px" width="80%" borderRadius={theme.radius.md} />
                <div style={{ height: "12px" }} />
                <Shimmer height="16px" width="60%" borderRadius={theme.radius.sm} />
                <div style={{ height: "16px" }} />
                <Shimmer height="40px" borderRadius={theme.radius.lg} />
              </div>
            </div>
          ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && onLoadMore && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <CTAButton variant="outline" size="lg" onClick={onLoadMore}>
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Zap size={18} />
                </motion.span>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More Destinations</span>
                <ChevronDown size={18} />
              </>
            )}
          </CTAButton>
        </div>
      )}
    </div>
  );
});

// Export main component and variants
export default memo(ModernDestinationCard);