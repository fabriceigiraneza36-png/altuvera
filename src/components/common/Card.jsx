import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Heart,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   Inject keyframes once (SSR-safe)
───────────────────────────────────────────────────────────────── */
const KEYFRAMES_ID = "altuvera-card-keyframes";

if (typeof document !== "undefined" && !document.getElementById(KEYFRAMES_ID)) {
  const styleSheet = document.createElement("style");
  styleSheet.id = KEYFRAMES_ID;
  styleSheet.textContent = `
    @keyframes cardShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes cardHeartPulse {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.2); }
      50% { transform: scale(0.95); }
      75% { transform: scale(1.1); }
    }
    @keyframes cardBadgeSlide {
      from { opacity: 0; transform: translateY(-8px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes cardFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(styleSheet);
}

/* ─────────────────────────────────────────────────────────────────
   Design Tokens
───────────────────────────────────────────────────────────────── */
const tokens = {
  colors: {
    primary: "#059669",
    primaryLight: "#10B981",
    primaryLighter: "#D1FAE5",
    primaryBg: "#F0FDF4",
    accent: "#F59E0B",
    accentLight: "#FBBF24",
    danger: "#EF4444",
    dangerLight: "#F87171",
    text: {
      primary: "#111827",
      secondary: "#4B5563",
      tertiary: "#6B7280",
      muted: "#9CA3AF",
    },
    border: {
      light: "#F3F4F6",
      default: "#E5E7EB",
      subtle: "rgba(0,0,0,0.07)",
    },
    bg: {
      white: "#ffffff",
      skeleton: "#E8ECEF",
      hover: "#F9FAFB",
    },
  },
  shadows: {
    sm: "0 2px 8px rgba(0,0,0,0.08)",
    md: "0 4px 16px rgba(0,0,0,0.08)",
    lg: "0 12px 32px rgba(5,92,60,0.12), 0 4px 12px rgba(0,0,0,0.06)",
    xl: "0 24px 48px rgba(5,92,60,0.14), 0 8px 16px rgba(0,0,0,0.06)",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "100px",
  },
  timing: {
    fast: "0.2s ease",
    default: "0.3s ease",
    smooth: "0.4s cubic-bezier(0.22, 1, 0.36, 1)",
    elastic: "0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
};

/* ─────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────── */
const Shimmer = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `linear-gradient(90deg, ${tokens.colors.bg.skeleton} 0%, #F8F9FA 50%, ${tokens.colors.bg.skeleton} 100%)`,
      backgroundSize: "200% 100%",
      animation: "cardShimmer 1.4s ease-in-out infinite",
    }}
  />
);

const StarRating = ({ value, size = 13 }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(value);
      const partial = !filled && i < value;
      return { filled, partial };
    });
  }, [value]);

  return (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {stars.map((star, i) => (
        <Star
          key={i}
          size={size}
          fill={star.filled ? tokens.colors.accent : "none"}
          color={star.filled || star.partial ? tokens.colors.accent : "#D1D5DB"}
          strokeWidth={star.filled ? 0 : 1.5}
          style={{ flexShrink: 0 }}
        />
      ))}
    </span>
  );
};

const Badge = ({ children, variant = "default", icon: Icon, style = {} }) => {
  const variants = {
    default: {
      background: "rgba(255,255,255,0.95)",
      color: tokens.colors.primary,
      border: "1px solid rgba(255,255,255,0.5)",
    },
    featured: {
      background: `linear-gradient(135deg, ${tokens.colors.accent}, ${tokens.colors.accentLight})`,
      color: "#fff",
      boxShadow: "0 2px 8px rgba(245,158,11,0.35)",
    },
    success: {
      background: `linear-gradient(135deg, ${tokens.colors.primary}, ${tokens.colors.primaryLight})`,
      color: "#fff",
      boxShadow: "0 2px 8px rgba(5,150,105,0.35)",
    },
    trending: {
      background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(139,92,246,0.35)",
    },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "5px 10px",
        fontSize: "10px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderRadius: tokens.radius.sm,
        backdropFilter: variant === "default" ? "blur(8px)" : "none",
        animation: "cardBadgeSlide 0.3s ease-out both",
        ...variants[variant],
        ...style,
      }}
    >
      {Icon && <Icon size={10} strokeWidth={2.5} />}
      {children}
    </span>
  );
};

const MetaChip = ({ icon: Icon, children, variant = "default" }) => {
  const styles = {
    default: {
      background: tokens.colors.bg.hover,
      border: `1px solid ${tokens.colors.border.default}`,
      color: tokens.colors.text.secondary,
      iconColor: tokens.colors.text.tertiary,
    },
    primary: {
      background: tokens.colors.primaryBg,
      border: `1px solid ${tokens.colors.primaryLighter}`,
      color: "#047857",
      iconColor: tokens.colors.primary,
    },
  };

  const s = styles[variant];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 10px",
        background: s.background,
        border: s.border,
        borderRadius: tokens.radius.sm,
        fontSize: "12px",
        fontWeight: 500,
        color: s.color,
      }}
    >
      <Icon size={12} color={s.iconColor} strokeWidth={2} />
      {children}
    </span>
  );
};

const FavoriteButton = ({ isFavorite, isAnimating, onClick }) => (
  <button
    onClick={onClick}
    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    style={{
      position: "absolute",
      top: 14,
      right: 14,
      zIndex: 6,
      width: 36,
      height: 36,
      borderRadius: tokens.radius.md,
      border: "none",
      background: isFavorite
        ? `linear-gradient(135deg, ${tokens.colors.danger}, ${tokens.colors.dangerLight})`
        : "rgba(255,255,255,0.2)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: `all ${tokens.timing.default}`,
      boxShadow: isFavorite
        ? "0 4px 12px rgba(239,68,68,0.3)"
        : "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <Heart
      size={16}
      color="#fff"
      fill={isFavorite ? "#fff" : "none"}
      strokeWidth={2}
      style={{
        animation: isAnimating ? "cardHeartPulse 0.5s ease" : "none",
        transition: `fill ${tokens.timing.fast}`,
      }}
    />
  </button>
);

const LocationPill = ({ location }) => (
  <div
    style={{
      position: "absolute",
      bottom: 14,
      left: 14,
      zIndex: 5,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(12px)",
      borderRadius: tokens.radius.full,
      color: "#fff",
      fontSize: "12px",
      fontWeight: 500,
      animation: "cardFadeIn 0.3s ease",
    }}
  >
    <MapPin size={12} color={tokens.colors.primaryLight} strokeWidth={2.5} />
    {location}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   Main Card Component
───────────────────────────────────────────────────────────────── */
const Card = ({
  image,
  title,
  subtitle,
  description,
  location,
  rating,
  reviews,
  duration,
  travelers,
  price,
  type,
  to,
  badge,
  badgeVariant = "success",
  featured = false,
  trending = false,
  horizontal = false,
  onFavoriteClick,
  isFavorite = false,
  className = "",
  style: customStyle = {},
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);

  const handleFavoriteClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setFavAnimating(true);
      setTimeout(() => setFavAnimating(false), 500);
      onFavoriteClick?.();
    },
    [onFavoriteClick]
  );

  const handleImageLoad = useCallback(() => setImgLoaded(true), []);
  const handleImageError = useCallback(() => {
    setImgError(true);
    setImgLoaded(true);
  }, []);

  const Wrapper = to ? Link : "div";
  const fallbackImage = "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80";

  /* ── Styles ── */
  const cardStyle = useMemo(
    () => ({
      position: "relative",
      display: "flex",
      flexDirection: horizontal ? "row" : "column",
      backgroundColor: tokens.colors.bg.white,
      borderRadius: tokens.radius.xl,
      overflow: "hidden",
      border: `1px solid ${tokens.colors.border.subtle}`,
      boxShadow: isHovered ? tokens.shadows.xl : tokens.shadows.md,
      transform: isHovered && !horizontal
        ? "translateY(-4px)"
        : "translateY(0)",
      transition: `transform ${tokens.timing.smooth}, box-shadow ${tokens.timing.smooth}`,
      textDecoration: "none",
      color: "inherit",
      height: "100%",
      cursor: to ? "pointer" : "default",
      ...customStyle,
    }),
    [isHovered, horizontal, to, customStyle]
  );

  const imageWrapperStyle = {
    position: "relative",
    height: horizontal ? "100%" : "clamp(200px, 24vw, 240px)",
    width: horizontal ? "clamp(220px, 32%, 300px)" : "100%",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: tokens.colors.bg.skeleton,
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: `transform 0.6s ${tokens.timing.smooth}`,
    transform: isHovered ? "scale(1.06)" : "scale(1)",
    opacity: imgLoaded && !imgError ? 1 : 0,
    display: "block",
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)",
    zIndex: 2,
    opacity: isHovered ? 0.9 : 0.7,
    transition: `opacity ${tokens.timing.default}`,
  };

  const contentStyle = {
    padding: horizontal ? "24px 24px 24px 28px" : "20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const accentBarStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.primaryLight})`,
    transform: isHovered ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: "left",
    transition: `transform ${tokens.timing.smooth}`,
    zIndex: 10,
  };

  return (
    <Wrapper
      to={to}
      style={cardStyle}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Section ── */}
      <div style={imageWrapperStyle}>
        {!imgLoaded && <Shimmer />}

        <img
          src={imgError ? fallbackImage : image}
          alt={title}
          style={imageStyle}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        <div style={overlayStyle} />

        {/* Badges Row */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: onFavoriteClick ? 58 : 14,
            zIndex: 5,
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {type && <Badge variant="default">{type}</Badge>}
          {featured && (
            <Badge variant="featured" icon={Award}>
              Featured
            </Badge>
          )}
          {trending && (
            <Badge variant="trending" icon={TrendingUp}>
              Trending
            </Badge>
          )}
          {badge && !featured && !trending && (
            <Badge variant={badgeVariant} icon={Sparkles}>
              {badge}
            </Badge>
          )}
        </div>

        {onFavoriteClick && (
          <FavoriteButton
            isFavorite={isFavorite}
            isAnimating={favAnimating}
            onClick={handleFavoriteClick}
          />
        )}

        {location && <LocationPill location={location} />}
      </div>

      {/* ── Content Section ── */}
      <div style={contentStyle}>
        {/* Title */}
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: horizontal ? "20px" : "18px",
            fontWeight: 700,
            color: isHovered ? tokens.colors.primary : tokens.colors.text.primary,
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            transition: `color ${tokens.timing.default}`,
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: "13px",
              color: tokens.colors.text.tertiary,
              margin: "2px 0 0",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Rating */}
        {rating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <StarRating value={rating} />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: tokens.colors.text.primary,
              }}
            >
              {rating.toFixed(1)}
            </span>
            {reviews && (
              <span
                style={{
                  fontSize: "12px",
                  color: tokens.colors.text.muted,
                }}
              >
                ({reviews.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p
            style={{
              fontSize: "13px",
              color: tokens.colors.text.secondary,
              lineHeight: 1.6,
              margin: "8px 0 0",
              display: "-webkit-box",
              WebkitLineClamp: horizontal ? 3 : 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        )}

        {/* Meta Chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "auto",
            paddingTop: "12px",
          }}
        >
          {duration && (
            <MetaChip icon={Clock} variant="primary">
              {duration}
            </MetaChip>
          )}
          {travelers && (
            <MetaChip icon={Users}>
              {typeof travelers === "number"
                ? `${travelers.toLocaleString()}+`
                : travelers}
            </MetaChip>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "14px",
            marginTop: "12px",
            borderTop: `1px solid ${tokens.colors.border.light}`,
          }}
        >
          {price ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: tokens.colors.primary,
                }}
              >
                {price}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: tokens.colors.text.muted,
                }}
              >
                / person
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: tokens.colors.primary,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Explore
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                style={{
                  transform: isHovered ? "translateX(3px)" : "translateX(0)",
                  transition: `transform ${tokens.timing.default}`,
                }}
              />
            </span>
          )}

          {/* Visual accent dots */}
          <div style={{ display: "flex", gap: "4px" }}>
            {[tokens.colors.primary, tokens.colors.primaryLight, tokens.colors.primaryLighter].map(
              (color, i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: color,
                    transform: isHovered ? `scale(${1.3 - i * 0.1})` : "scale(1)",
                    transition: `transform ${tokens.timing.elastic}`,
                    transitionDelay: `${i * 30}ms`,
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Accent Bar */}
      <div style={accentBarStyle} />
    </Wrapper>
  );
};

export default Card;