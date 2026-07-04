// ─────────────────────────────────────────────────────────────────
// Add these to your tailwind.config.js:
//
// theme: {
//   extend: {
//     colors: {
//       primary: '#059669',
//       'primary-light': '#10B981',
//       'primary-lighter': '#D1FAE5',
//       'primary-bg': '#F0FDF4',
//       accent: '#F59E0B',
//       'accent-light': '#FBBF24',
//       danger: '#EF4444',
//       'danger-light': '#F87171',
//     },
//     borderRadius: {
//       'xl2': '20px',
//     },
//     boxShadow: {
//       'card': '0 4px 16px rgba(0,0,0,0.08)',
//       'card-hover': '0 24px 48px rgba(5,92,60,0.14), 0 8px 16px rgba(0,0,0,0.06)',
//       'badge-amber': '0 2px 8px rgba(245,158,11,0.35)',
//       'badge-green': '0 2px 8px rgba(5,150,105,0.35)',
//       'badge-purple': '0 2px 8px rgba(139,92,246,0.35)',
//       'fav-active': '0 4px 12px rgba(239,68,68,0.3)',
//       'fav-inactive': '0 2px 8px rgba(0,0,0,0.1)',
//     },
//     keyframes: {
//       cardShimmer: {
//         '0%': { backgroundPosition: '-200% 0' },
//         '100%': { backgroundPosition: '200% 0' },
//       },
//       cardHeartPulse: {
//         '0%, 100%': { transform: 'scale(1)' },
//         '25%': { transform: 'scale(1.2)' },
//         '50%': { transform: 'scale(0.95)' },
//         '75%': { transform: 'scale(1.1)' },
//       },
//       cardBadgeSlide: {
//         from: { opacity: '0', transform: 'translateY(-8px) scale(0.9)' },
//         to: { opacity: '1', transform: 'translateY(0) scale(1)' },
//       },
//       cardFadeIn: {
//         from: { opacity: '0' },
//         to: { opacity: '1' },
//       },
//     },
//     animation: {
//       'card-shimmer': 'cardShimmer 1.4s ease-in-out infinite',
//       'card-heart-pulse': 'cardHeartPulse 0.5s ease',
//       'card-badge-slide': 'cardBadgeSlide 0.3s ease-out both',
//       'card-fade-in': 'cardFadeIn 0.3s ease',
//     },
//   },
// },
// ─────────────────────────────────────────────────────────────────

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
   Sub-components
───────────────────────────────────────────────────────────────── */

const Shimmer = () => (
  <div
    className="absolute inset-0 animate-card-shimmer"
    style={{
      background:
        "linear-gradient(90deg, #E8ECEF 0%, #F8F9FA 50%, #E8ECEF 100%)",
      backgroundSize: "200% 100%",
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
    <span className="inline-flex items-center gap-0.5">
      {stars.map((star, i) => (
        <Star
          key={i}
          size={size}
          fill={star.filled ? "#F59E0B" : "none"}
          color={star.filled || star.partial ? "#F59E0B" : "#D1D5DB"}
          strokeWidth={star.filled ? 0 : 1.5}
          className="shrink-0"
        />
      ))}
    </span>
  );
};

const Badge = ({ children, variant = "default", icon: Icon, className = "" }) => {
  const variantClasses = {
    default:
      "bg-white/95 text-emerald-600 border border-white/50 backdrop-blur-sm",
    featured: "text-white shadow-badge-amber",
    success: "text-white shadow-badge-green",
    trending: "text-white shadow-badge-purple",
  };

  const variantStyles = {
    featured: {
      background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    },
    success: {
      background: "linear-gradient(135deg, #059669, #10B981)",
    },
    trending: {
      background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    },
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide rounded-lg animate-card-badge-slide ${variantClasses[variant]} ${className}`}
      style={variantStyles[variant] || {}}
    >
      {Icon && <Icon size={10} strokeWidth={2.5} />}
      {children}
    </span>
  );
};

const MetaChip = ({ icon: Icon, children, variant = "default" }) => {
  const variantClasses = {
    default:
      "bg-gray-50 border border-gray-200 text-gray-600",
    primary:
      "bg-green-50 border border-emerald-100 text-emerald-700",
  };

  const iconColors = {
    default: "#6B7280",
    primary: "#059669",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${variantClasses[variant]}`}
    >
      <Icon size={12} color={iconColors[variant]} strokeWidth={2} />
      {children}
    </span>
  );
};

const FavoriteButton = ({ isFavorite, isAnimating, onClick }) => (
  <button
    onClick={onClick}
    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    className={`absolute top-3.5 right-3.5 z-[6] w-9 h-9 rounded-xl border-none flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${
      isFavorite
        ? "shadow-fav-active"
        : "shadow-fav-inactive"
    }`}
    style={{
      background: isFavorite
        ? "linear-gradient(135deg, #EF4444, #F87171)"
        : "rgba(255,255,255,0.2)",
    }}
  >
    <Heart
      size={16}
      color="#fff"
      fill={isFavorite ? "#fff" : "none"}
      strokeWidth={2}
      className={`transition-all duration-200 ${
        isAnimating ? "animate-card-heart-pulse" : ""
      }`}
    />
  </button>
);

const LocationPill = ({ location }) => (
  <div
    className="absolute bottom-3.5 left-3.5 z-[5] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium backdrop-blur-xl animate-card-fade-in"
    style={{ background: "rgba(0,0,0,0.55)" }}
  >
    <MapPin size={12} color="#10B981" strokeWidth={2.5} />
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
  const fallbackImage =
    "https://drive.google.com/uc?export=view&id=1BfTgabjQR1J8gj-HEHZ-68WxTvnZrDD1";

  return (
    <Wrapper
      to={to}
      className={`relative flex ${
        horizontal ? "flex-row" : "flex-col"
      } bg-white rounded-[20px] overflow-hidden no-underline text-inherit h-full transition-all duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isHovered
          ? `shadow-card-hover ${!horizontal ? "-translate-y-1" : ""}`
          : "shadow-card translate-y-0"
      } ${to ? "cursor-pointer" : "cursor-default"} ${className}`}
      style={{
        border: "1px solid rgba(0,0,0,0.07)",
        ...customStyle,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Section ── */}
      <div
        className={`relative shrink-0 overflow-hidden bg-[#E8ECEF] ${
          horizontal ? "h-full" : ""
        }`}
        style={{
          height: horizontal ? "100%" : "clamp(200px, 24vw, 240px)",
          width: horizontal ? "clamp(220px, 32%, 300px)" : "100%",
        }}
      >
        {!imgLoaded && <Shimmer />}

        <img
          src={imgError ? fallbackImage : image}
          alt={title}
          className={`w-full h-full object-cover block transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isHovered ? "scale-[1.06]" : "scale-100"
          }`}
          style={{
            opacity: imgLoaded && !imgError ? 1 : 0,
          }}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 z-[2] transition-opacity duration-300 ${
            isHovered ? "opacity-90" : "opacity-70"
          }`}
          style={{
            background:
              "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Badges Row */}
        <div
          className={`absolute top-3.5 left-3.5 z-[5] flex flex-wrap gap-2 ${
            onFavoriteClick ? "right-[58px]" : "right-3.5"
          }`}
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
      <div
        className={`flex-1 flex flex-col gap-1 ${
          horizontal ? "p-6 pl-7" : "p-5"
        }`}
      >
        {/* Title */}
        <h3
          className={`font-serif text-lg font-bold m-0 leading-tight tracking-tight transition-colors duration-300 ${
            horizontal ? "text-xl" : "text-lg"
          } ${isHovered ? "text-emerald-600" : "text-gray-900"}`}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[13px] text-gray-500 mt-0.5 mb-0 leading-snug">
            {subtitle}
          </p>
        )}

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2 mt-2">
            <StarRating value={rating} />
            <span className="text-[13px] font-semibold text-gray-900">
              {rating.toFixed(1)}
            </span>
            {reviews && (
              <span className="text-xs text-gray-400">
                ({reviews.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p
            className="text-[13px] text-gray-600 leading-relaxed mt-2 mb-0 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: horizontal ? 3 : 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </p>
        )}

        {/* Meta Chips */}
        <div className="flex flex-wrap gap-2 mt-auto pt-3">
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
        <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-gray-100">
          {price ? (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-emerald-600">
                {price}
              </span>
              <span className="text-xs text-gray-400">/ person</span>
            </div>
          ) : (
            <span className="text-[13px] font-semibold text-emerald-600 flex items-center gap-1.5">
              Explore
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className={`transition-transform duration-300 ${
                  isHovered ? "translate-x-[3px]" : "translate-x-0"
                }`}
              />
            </span>
          )}

          {/* Visual accent dots */}
          <div className="flex gap-1">
            {["#059669", "#10B981", "#D1FAE5"].map((color, i) => (
              <span
                key={i}
                className="w-[5px] h-[5px] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  background: color,
                  transform: isHovered
                    ? `scale(${1.3 - i * 0.1})`
                    : "scale(1)",
                  transitionDelay: `${i * 30}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Accent Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[3px] z-10 origin-left transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isHovered ? "scale-x-100" : "scale-x-0"
        }`}
        style={{
          background: "linear-gradient(90deg, #059669, #10B981)",
        }}
      />
    </Wrapper>
  );
};

export default Card;