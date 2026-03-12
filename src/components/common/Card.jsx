import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiStar,
  FiClock,
  FiArrowRight,
  FiHeart,
  FiUsers,
} from "react-icons/fi";

/* ─────────────────────────────────────────────────────────────────
   Inject card keyframes once (no external CSS dependency needed)
───────────────────────────────────────────────────────────────── */
const KEYFRAMES_ID = "altuvera-card-kf";
if (typeof document !== "undefined" && !document.getElementById(KEYFRAMES_ID)) {
  const s = document.createElement("style");
  s.id = KEYFRAMES_ID;
  s.textContent = `
    @keyframes cardShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes cardHeartPop {
      0%   { transform: scale(1); }
      30%  { transform: scale(1.35); }
      60%  { transform: scale(0.9); }
      100% { transform: scale(1); }
    }
    @keyframes cardBadgePop {
      from { transform: scale(0.7) translateY(-6px); opacity: 0; }
      to   { transform: scale(1)   translateY(0);    opacity: 1; }
    }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────── */
const Shimmer = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(90deg,#e8ecef 0%,#f5f6f8 50%,#e8ecef 100%)",
      backgroundSize: "200% 100%",
      animation: "cardShimmer 1.6s infinite linear",
    }}
  />
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
  type,
  to,
  badge,
  featured = false,
  horizontal = false,
  onFavoriteClick,
  isFavorite = false,
  className = "",
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [favAnim, setFavAnim] = useState(false);

  const handleFav = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setFavAnim(true);
      setTimeout(() => setFavAnim(false), 600);
      onFavoriteClick?.();
    },
    [onFavoriteClick],
  );

  const Wrapper = to ? Link : "div";

  /* ── Render stars ── */
  const Stars = ({ value }) => (
    <span style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          size={12}
          style={{
            fill: n <= Math.round(value) ? "#F59E0B" : "none",
            color: n <= Math.round(value) ? "#F59E0B" : "#D1D5DB",
            flexShrink: 0,
          }}
        />
      ))}
    </span>
  );

  /* ── Styles ── */
  const card = {
    position: "relative",
    display: "flex",
    flexDirection: horizontal ? "row" : "column",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow: hovered
      ? "0 24px 56px rgba(5,92,60,0.14), 0 6px 16px rgba(0,0,0,0.06)"
      : "0 4px 18px rgba(0,0,0,0.07)",
    transform:
      hovered && !horizontal
        ? "translateY(-6px) scale(1.005)"
        : "translateY(0) scale(1)",
    transition:
      "transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s cubic-bezier(0.22,1,0.36,1)",
    textDecoration: "none",
    color: "inherit",
    height: "100%",
    cursor: "pointer",
  };

  const imgWrap = {
    position: "relative",
    height: horizontal ? "100%" : "clamp(210px,26vw,260px)",
    width: horizontal ? "clamp(240px,35%,320px)" : "100%",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#e8ecef",
  };

  const img = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
    transform: hovered ? "scale(1.09)" : "scale(1)",
    opacity: imgLoaded && !imgError ? 1 : 0,
    display: "block",
  };

  const scrim = {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,0.52) 100%)",
    zIndex: 2,
    transition: "opacity 0.35s ease",
    opacity: hovered ? 1 : 0.6,
  };

  const content = {
    padding: horizontal ? "28px 28px 28px 32px" : "24px 24px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0",
  };

  /* ── accent bar at bottom ── */
  const accentBar = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(90deg,#059669,#34D399)",
    transform: hovered ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.4s ease",
    zIndex: 10,
  };

  return (
    <Wrapper
      to={to}
      style={card}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image area ── */}
      <div style={imgWrap}>
        {/* Shimmer skeleton */}
        {!imgLoaded && <Shimmer />}

        <img
          src={
            imgError
              ? "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800"
              : image
          }
          alt={title}
          style={img}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
        />

        {/* Gradient scrim */}
        <div style={scrim} />

        {/* Type badge – top left */}
        {type && (
          <span
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 5,
              padding: "5px 12px",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.9px",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              borderRadius: "8px",
              color: "#047857",
              animation: "cardBadgePop 0.4s ease both",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            {type}
          </span>
        )}

        {/* Featured badge – top right */}
        {featured && (
          <span
            style={{
              position: "absolute",
              top: 14,
              right: onFavoriteClick ? 60 : 14,
              zIndex: 5,
              padding: "5px 12px",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              background: "linear-gradient(135deg,#F59E0B,#FBBF24)",
              borderRadius: "8px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
            }}
          >
            <FiStar size={10} style={{ fill: "#fff", color: "#fff" }} /> Top
            Pick
          </span>
        )}

        {/* Custom badge */}
        {badge && !featured && (
          <span
            style={{
              position: "absolute",
              top: 14,
              right: onFavoriteClick ? 60 : 14,
              zIndex: 5,
              padding: "5px 12px",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              background: "linear-gradient(135deg,#059669,#10B981)",
              borderRadius: "8px",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(5,150,105,0.4)",
            }}
          >
            {badge}
          </span>
        )}

        {/* Favourite button */}
        {onFavoriteClick && (
          <button
            onClick={handleFav}
            aria-label={
              isFavorite ? "Remove from favourites" : "Add to favourites"
            }
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              zIndex: 6,
              width: 38,
              height: 38,
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.25)",
              background: isFavorite
                ? "linear-gradient(135deg,#EF4444,#F87171)"
                : "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.3s ease, transform 0.2s ease",
              boxShadow: isFavorite
                ? "0 4px 12px rgba(239,68,68,0.35)"
                : "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            <FiHeart
              size={16}
              style={{
                color: isFavorite ? "#fff" : "#fff",
                fill: isFavorite ? "#fff" : "none",
                animation: favAnim ? "cardHeartPop 0.6s ease" : "none",
                transition: "fill 0.25s ease",
              }}
            />
          </button>
        )}

        {/* Location pill floating on image bottom-left */}
        {location && (
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 14,
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 11px",
              background: "rgba(0,0,0,0.48)",
              backdropFilter: "blur(8px)",
              borderRadius: "100px",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            <FiMapPin size={12} style={{ color: "#34D399", flexShrink: 0 }} />
            {location}
          </div>
        )}
      </div>

      {/* ── Content area ── */}
      <div style={content}>
        {/* Title */}
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: horizontal ? "22px" : "19px",
            fontWeight: 700,
            color: hovered ? "#059669" : "#111827",
            margin: "0 0 6px",
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            transition: "color 0.3s ease",
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: "13px",
              color: "#6B7280",
              margin: "0 0 10px",
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Rating row */}
        {rating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Stars value={rating} />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {rating}
            </span>
            {reviews && (
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                ({reviews.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p
            style={{
              fontSize: "13.5px",
              color: "#4B5563",
              lineHeight: 1.7,
              margin: "0 0 14px",
              display: "-webkit-box",
              WebkitLineClamp: horizontal ? 3 : 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: horizontal ? 1 : "initial",
            }}
          >
            {description}
          </p>
        )}

        {/* Meta chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "16px",
            flex: 1,
            alignItems: "flex-end",
          }}
        >
          {duration && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: "#F0FDF4",
                border: "1px solid #D1FAE5",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#047857",
              }}
            >
              <FiClock size={12} style={{ color: "#059669" }} />
              {duration}
            </span>
          )}
          {travelers && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#4B5563",
              }}
            >
              <FiUsers size={12} style={{ color: "#6B7280" }} />
              {typeof travelers === "number"
                ? `${travelers.toLocaleString()}+ travelers`
                : travelers}
            </span>
          )}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "14px",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#059669",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "gap 0.3s ease",
            }}
          >
            Explore
            <FiArrowRight
              size={15}
              style={{
                transform: hovered ? "translateX(4px)" : "translateX(0)",
                transition: "transform 0.3s ease",
              }}
            />
          </span>

          {/* Accent dot group */}
          <div style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    i === 0 ? "#059669" : i === 1 ? "#10B981" : "#D1FAE5",
                  transition: "transform 0.3s ease",
                  transform: hovered ? `scale(${1.2 - i * 0.15})` : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Accent underline bar */}
      <div style={accentBar} />
    </Wrapper>
  );
};

export default Card;
