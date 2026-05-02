// src/components/destinations/DestinationCard.jsx
import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin, FiClock, FiStar, FiHeart, FiShare2,
  FiAward, FiTrendingUp, FiArrowRight, FiWind,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";

const BADGE_CONFIG = {
  isFeatured: { icon: FiAward,      label: "Featured", bg: "#10b981", color: "#fff" },
  isNew:      { icon: null,         label: "New",      bg: "#ecfdf5", color: "#047857" },
  isPopular:  { icon: FiTrendingUp, label: "Popular",  bg: "#f0fdf4", color: "#166534" },
};

const DIFF_COLORS = {
  easy:        { bg: "#d1fae5", color: "#065f46" },
  moderate:    { bg: "#fef3c7", color: "#92400e" },
  challenging: { bg: "#fee2e2", color: "#991b1b" },
  difficult:   { bg: "#fce7f3", color: "#9d174d" },
};

const Badge = ({ type, destination }) => {
  const cfg = BADGE_CONFIG[type];
  if (!cfg || !destination[type]) return null;
  const Icon = cfg.icon;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
      display: "flex", alignItems: "center", gap: 5,
    }}>
      {Icon && <Icon size={11} />}
      {cfg.label}
    </span>
  );
};

const ImageSlider = ({ images, name, height }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <img
          key={i} src={src} alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";
          }}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover",
            opacity: current === i ? 1 : 0,
            transform: current === i ? "scale(1)" : "scale(1.04)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        />
      ))}
      {images.length > 1 && (
        <div style={{
          position: "absolute", bottom: 70, right: 16,
          display: "flex", gap: 5, zIndex: 3,
        }}>
          {images.map((_, i) => (
            <span
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              style={{
                width: current === i ? 18 : 6, height: 6,
                borderRadius: 3, background: current === i ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer", transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

const DestinationCard = memo(({
  destination,
  showPrice   = false,
  compact     = false,
  priority    = false,
  onWishlistToggle,
}) => {
  const navigate               = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [hovered, setHovered]  = useState(false);
  const [shared,  setShared]   = useState(false);

  if (!destination) return null;

  const {
    slug, id, name, images = [], heroImage,
    location, country, duration, rating, reviewCount,
    highlights, isFeatured, isNew, isPopular,
    shortDescription, description, difficulty, category,
  } = destination;

  const destId  = slug || id;
  const isLiked = isWishlisted(destId);
  const safeImgs = images.length ? images : [heroImage || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"];
  const diffStyle = DIFF_COLORS[difficulty] || DIFF_COLORS.moderate;

  const handleNavigate = useCallback(() => navigate(`/destinations/${destId}`), [destId]);

  const handleWishlist = useCallback((e) => {
    e.stopPropagation();
    toggleWishlist(destId);
    onWishlistToggle?.(destId, !isLiked);
  }, [destId, isLiked]);

  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/destinations/${destId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {}
  }, [destId, name]);

  const cardH   = compact ? 220 : 280;
  const radius  = compact ? 20  : 26;

  return (
    <article
      onClick={handleNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Destination: ${name}`}
      style={{
        background: "#fff", borderRadius: radius, overflow: "hidden",
        border: `1px solid ${priority ? "#10b981" : "#e5e7eb"}`,
        boxShadow: hovered
          ? "0 24px 48px rgba(16,185,129,0.18)"
          : "0 4px 20px rgba(0,0,0,0.07)",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        cursor: "pointer", display: "flex", flexDirection: "column",
        height: "100%",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        willChange: "transform, box-shadow",
      }}
    >
      {/* ── IMAGE ── */}
      <div style={{ position: "relative", height: cardH, overflow: "hidden", flexShrink: 0 }}>
        <ImageSlider images={safeImgs} name={name} height={cardH} />

        {/* Gradient */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
        }} />

        {/* Badges */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          display: "flex", flexWrap: "wrap", gap: 6, zIndex: 2,
        }}>
          {["isFeatured", "isNew", "isPopular"].map(t => (
            <Badge key={t} type={t} destination={destination} />
          ))}
          {category && (
            <span style={{
              background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
              color: "#fff", padding: "5px 10px", borderRadius: 999,
              fontSize: 11, fontWeight: 600, textTransform: "capitalize",
            }}>
              {category}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          display: "flex", flexDirection: "column", gap: 8, zIndex: 2,
        }}>
          {[
            { handler: handleWishlist, label: "Wishlist",
              icon: <FiHeart size={17} color={isLiked ? "#ef4444" : "#374151"} fill={isLiked ? "#ef4444" : "none"} /> },
            { handler: handleShare, label: shared ? "Copied!" : "Share",
              icon: <FiShare2 size={17} color={shared ? "#10b981" : "#374151"} /> },
          ].map(({ handler, label, icon }) => (
            <button
              key={label} onClick={handler} title={label}
              style={{
                width: 40, height: 40, borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
                cursor: "pointer", display: "grid", placeItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Title overlay */}
        <div style={{
          position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 2,
        }}>
          <h3 style={{
            margin: 0, color: "#fff", fontWeight: 800,
            fontSize: compact ? 18 : 22, lineHeight: 1.2,
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}>
            {name}
          </h3>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 5,
          }}>
            <FiMapPin size={13} />
            <span>{location || country}</span>
            {country && location !== country && (
              <span style={{ opacity: 0.7 }}>· {country}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{
        padding: compact ? "16px 18px" : "22px 24px",
        display: "flex", flexDirection: "column", flex: 1, gap: 14,
      }}>
        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FiStar size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: 700, color: "#111", fontSize: 15 }}>{rating || "New"}</span>
            {reviewCount > 0 && (
              <span style={{ color: "#9ca3af", fontSize: 13 }}>({reviewCount})</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {difficulty && (
              <span style={{
                ...diffStyle, padding: "4px 10px",
                borderRadius: 999, fontSize: 12, fontWeight: 600,
              }}>
                <FiWind size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                {difficulty}
              </span>
            )}
            {duration && (
              <span style={{
                display: "flex", alignItems: "center", gap: 5,
                color: "#059669", fontWeight: 600, fontSize: 13,
              }}>
                <FiClock size={13} />
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {!compact && (
          <p style={{
            color: "#6b7280", fontSize: 14, lineHeight: 1.65, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {shortDescription || description ||
              "Experience unforgettable adventures, rich culture, and breathtaking natural beauty."}
          </p>
        )}

        {/* Highlights */}
        {!compact && highlights?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {highlights.slice(0, 3).map((h, i) => (
              <span key={i} style={{
                background: "#f0fdf4", color: "#166534",
                padding: "5px 11px", borderRadius: 999,
                fontSize: 12, fontWeight: 600,
              }}>
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span style={{
                background: "#f3f4f6", color: "#6b7280",
                padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              }}>
                +{highlights.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* CTA row */}
        <div style={{
          marginTop: "auto", paddingTop: 14,
          borderTop: "1px solid #f3f4f6",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 1 }}>Starting from</div>
            <div style={{ fontWeight: 700, color: "#065f46", fontSize: 16 }}>Contact us</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
            style={{
              background: hovered
                ? "linear-gradient(135deg, #059669, #10b981)"
                : "linear-gradient(135deg, #10b981, #34d399)",
              color: "#fff", border: "none", borderRadius: 14,
              padding: compact ? "10px 18px" : "12px 22px",
              fontWeight: 700, fontSize: 14,
              display: "flex", alignItems: "center", gap: 6,
              cursor: "pointer", transition: "all 0.3s",
              boxShadow: hovered ? "0 4px 16px rgba(16,185,129,0.4)" : "none",
            }}
          >
            Explore
            <FiArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Bottom accent */}
      <div style={{
        height: 4, flexShrink: 0,
        background: hovered
          ? "linear-gradient(to right, #059669, #10b981, #34d399)"
          : "linear-gradient(to right, #d1fae5, #10b981, #d1fae5)",
        transition: "background 0.4s",
      }} />
    </article>
  );
});

DestinationCard.displayName = "DestinationCard";
export default DestinationCard;