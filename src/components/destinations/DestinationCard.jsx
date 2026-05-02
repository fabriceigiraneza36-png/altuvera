// src/components/destinations/DestinationCard.jsx
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiStar,
  FiHeart,
  FiShare2,
  FiArrowRight,
  FiAward,
  FiTrendingUp,
  FiWind,
  FiZap,
  FiUsers,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";

const FALLBACK =
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85";

const BADGE_MAP = {
  isFeatured: {
    icon: FiAward,
    label: "Featured",
    bg: "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff",
    shadow: "0 2px 8px rgba(16,185,129,0.35)",
  },
  isNew: {
    icon: FiZap,
    label: "New",
    bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
    color: "#047857",
    shadow: "0 2px 8px rgba(16,185,129,0.15)",
  },
  isPopular: {
    icon: FiTrendingUp,
    label: "Popular",
    bg: "linear-gradient(135deg,#fef3c7,#fde68a)",
    color: "#92400e",
    shadow: "0 2px 8px rgba(245,158,11,0.2)",
  },
};

const DIFF_STYLE = {
  easy: { bg: "#d1fae5", color: "#065f46" },
  moderate: { bg: "#fef3c7", color: "#78350f" },
  challenging: { bg: "#fee2e2", color: "#7f1d1d" },
  difficult: { bg: "#fce7f3", color: "#831843" },
  expert: { bg: "#ede9fe", color: "#4c1d95" },
};

/* ── Inject global keyframes once ── */
function injectKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc-kf")) return;
  const s = document.createElement("style");
  s.id = "dc-kf";
  s.textContent = `
    @keyframes dcHeartPop {
      0%,100% { transform:scale(1); }
      25%     { transform:scale(1.35); }
      55%     { transform:scale(0.9); }
    }
    @keyframes dcCopyToast {
      0%   { opacity:0; transform:translateX(-50%) translateY(6px); }
      12%  { opacity:1; transform:translateX(-50%) translateY(0);   }
      80%  { opacity:1; }
      100% { opacity:0; transform:translateX(-50%) translateY(-4px); }
    }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════
   IMAGE SLIDER
═══════════════════════════════════════════════════════ */
function ImageSlider({ images, name, hovered }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(
      () => setIdx((p) => (p + 1) % images.length),
      4200
    );
    return () => clearInterval(timer.current);
  }, [images.length]);

  const jump = useCallback(
    (e, i) => {
      e.stopPropagation();
      setIdx(i);
      clearInterval(timer.current);
      timer.current = setInterval(
        () => setIdx((p) => (p + 1) % images.length),
        4200
      );
    },
    [images.length]
  );

  return (
    <>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          onError={(e) => {
            e.currentTarget.src = FALLBACK;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: idx === i ? 1 : 0,
            transform:
              hovered && idx === i
                ? "scale(1.06)"
                : idx === i
                ? "scale(1)"
                : "scale(1.03)",
            transition: "opacity 1s ease, transform 6s cubic-bezier(0.2,0,0.2,1)",
            willChange: "opacity, transform",
          }}
        />
      ))}

      {images.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
            zIndex: 4,
            padding: "5px 10px",
            borderRadius: 20,
            background: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => jump(e, i)}
              aria-label={`Show image ${i + 1}`}
              style={{
                width: idx === i ? 18 : 6,
                height: 6,
                border: "none",
                borderRadius: 3,
                padding: 0,
                background: idx === i ? "#fff" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.35s ease",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   STAR DISPLAY
═══════════════════════════════════════════════════════ */
function Stars({ rating, count }) {
  const filled = Math.round((rating || 0) * 2) / 2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ display: "flex", gap: 1 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <FiStar
            key={s}
            size={14}
            color="#f59e0b"
            fill={s <= filled ? "#f59e0b" : "none"}
            style={{ flexShrink: 0 }}
          />
        ))}
      </div>
      <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>
        {rating ? rating.toFixed(1) : "New"}
      </span>
      {count > 0 && (
        <span style={{ color: "#9ca3af", fontSize: 12 }}>
          ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ICON BUTTON
═══════════════════════════════════════════════════════ */
function IconBtn({ onClick, title, children, active, animating }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "none",
        background: active
          ? "rgba(254,226,226,0.95)"
          : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        boxShadow: hov
          ? "0 6px 20px rgba(0,0,0,0.18)"
          : "0 2px 10px rgba(0,0,0,0.12)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hov ? "scale(1.15)" : "scale(1)",
        animation: animating ? "dcHeartPop 0.5s ease" : "none",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN CARD
═══════════════════════════════════════════════════════ */
const DestinationCard = memo(function DestinationCard({
  destination,
  compact = false,
  priority = false,
  onWishlistToggle,
}) {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  useEffect(() => {
    injectKeyframes();
  }, []);

  if (!destination) return null;

  const {
    slug,
    id,
    name = "Destination",
    images = [],
    heroImage,
    location,
    country,
    countryFlag,
    duration,
    durationDays,
    rating = 0,
    reviewCount = 0,
    highlights = [],
    shortDescription,
    description,
    isFeatured,
    isNew,
    isPopular,
    difficulty,
    category,
    isEcoFriendly,
  } = destination;

  const destId = slug || id;
  const isLiked = isWishlisted(destId);
  const diffCfg = DIFF_STYLE[difficulty] || DIFF_STYLE.moderate;
  const safeImgs = images.length > 0 ? images : [heroImage || FALLBACK];

  const goToDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate]
  );

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 550);
      toggleWishlist(destId);
      onWishlistToggle?.(destId, !isLiked);
    },
    [destId, isLiked, toggleWishlist, onWishlistToggle]
  );

  const handleShare = useCallback(
    async (e) => {
      e.stopPropagation();
      const url = `${window.location.origin}/destinations/${destId}`;
      try {
        if (navigator.share) {
          await navigator.share({ title: name, url });
        } else {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        }
      } catch {}
    },
    [destId, name]
  );

  const displayLocation = [location, country]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  /* ── badge keys present ── */
  const activeBadges = Object.keys(BADGE_MAP).filter(
    (k) => destination[k]
  );

  return (
    <article
      onClick={goToDetail}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && goToDetail()}
      aria-label={`Explore ${name}`}
      className="dest-card"
      style={{
        background: "#fff",
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid",
        borderColor: hovered
          ? "rgba(16,185,129,0.35)"
          : "rgba(0,0,0,0.06)",
        boxShadow: hovered
          ? "0 24px 48px rgba(0,0,0,0.1), 0 8px 24px rgba(16,185,129,0.08)"
          : "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        transition: "all 0.4s cubic-bezier(0.25,0.8,0.25,1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transform: hovered
          ? "translateY(-8px)"
          : "translateY(0)",
        willChange: "transform, box-shadow",
        outline: "none",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* ════ IMAGE ════ */}
      <div
        style={{
          position: "relative",
          paddingTop: compact ? "52%" : "62%",
          overflow: "hidden",
          flexShrink: 0,
          background: "#f3f4f6",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <ImageSlider
            images={safeImgs}
            name={name}
            hovered={hovered}
          />
        </div>

        {/* Gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Badges */}
        {activeBadges.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              zIndex: 3,
            }}
          >
            {activeBadges.map((key) => {
              const cfg = BADGE_MAP[key];
              const Icon = cfg.icon;
              return (
                <span
                  key={key}
                  style={{
                    background: cfg.bg,
                    color: cfg.color,
                    padding: "5px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    boxShadow: cfg.shadow,
                    letterSpacing: "0.01em",
                  }}
                >
                  <Icon size={11} />
                  {cfg.label}
                </span>
              );
            })}
            {isEcoFriendly && (
              <span
                style={{
                  background: "rgba(6,95,70,0.85)",
                  backdropFilter: "blur(6px)",
                  color: "#d1fae5",
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                🌿 Eco
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            zIndex: 3,
          }}
        >
          <IconBtn
            onClick={handleWishlist}
            title={isLiked ? "Remove from wishlist" : "Save"}
            active={isLiked}
            animating={heartAnim}
          >
            <FiHeart
              size={17}
              color={isLiked ? "#ef4444" : "#374151"}
              fill={isLiked ? "#ef4444" : "none"}
            />
          </IconBtn>

          <div style={{ position: "relative" }}>
            <IconBtn
              onClick={handleShare}
              title="Share"
              active={copied}
              animating={false}
            >
              <FiShare2
                size={17}
                color={copied ? "#10b981" : "#374151"}
              />
            </IconBtn>
            {copied && (
              <span
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#1f2937",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  animation: "dcCopyToast 2.2s ease forwards",
                  pointerEvents: "none",
                }}
              >
                ✓ Copied!
              </span>
            )}
          </div>
        </div>

        {/* Title overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: "32px 20px 18px",
            background:
              "linear-gradient(transparent, rgba(0,0,0,0.45))",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#fff",
              fontWeight: 800,
              fontSize: "clamp(17px, 2vw, 24px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              textShadow: "0 1px 6px rgba(0,0,0,0.35)",
            }}
          >
            {name}
          </h3>

          {displayLocation && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "rgba(255,255,255,0.88)",
                fontSize: "clamp(12px, 1.3vw, 14px)",
                marginTop: 5,
              }}
            >
              <FiMapPin size={12} style={{ flexShrink: 0 }} />
              <span>{displayLocation}</span>
              {countryFlag && (
                <span style={{ marginLeft: 2 }}>
                  {countryFlag}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════ CONTENT ════ */}
      <div
        className="dest-card-body"
        style={{
          padding: "clamp(14px, 2vw, 24px)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "clamp(10px, 1.5vw, 16px)",
        }}
      >
        {/* Row 1: rating + meta pills */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Stars rating={rating} count={reviewCount} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {difficulty && (
              <span
                style={{
                  background: diffCfg.bg,
                  color: diffCfg.color,
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  textTransform: "capitalize",
                }}
              >
                <FiWind size={10} />
                {difficulty}
              </span>
            )}

            {(duration || durationDays) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#059669",
                  fontWeight: 600,
                  fontSize: 12,
                  background: "#f0fdf4",
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                <FiClock size={11} />
                {duration || `${durationDays}d`}
              </span>
            )}

            {category && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#6b7280",
                  fontWeight: 600,
                  fontSize: 11,
                  background: "#f9fafb",
                  padding: "3px 10px",
                  borderRadius: 999,
                  textTransform: "capitalize",
                }}
              >
                {category.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        {/* Description (hidden on compact) */}
        {!compact && (
          <p
            style={{
              color: "#4b5563",
              fontSize: "clamp(13px, 1.2vw, 14px)",
              lineHeight: 1.7,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {shortDescription ||
              description ||
              "Experience unforgettable adventures, rich culture, and breathtaking natural beauty."}
          </p>
        )}

        {/* Highlights (hidden on compact) */}
        {!compact && highlights.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
            }}
          >
            {highlights.slice(0, 3).map((h, i) => (
              <span
                key={i}
                style={{
                  background: "#f0fdf4",
                  color: "#166534",
                  border: "1px solid #dcfce7",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span
                style={{
                  background: "#f9fafb",
                  color: "#9ca3af",
                  border: "1px solid #f3f4f6",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                +{highlights.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "clamp(10px, 1.2vw, 16px)",
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                color: "#d1d5db",
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.06em",
                marginBottom: 2,
              }}
            >
              Starting from
            </div>
            <div
              style={{
                fontWeight: 800,
                color: "#065f46",
                fontSize: "clamp(14px, 1.3vw, 16px)",
                whiteSpace: "nowrap",
              }}
            >
              Contact Us
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToDetail();
            }}
            style={{
              background: hovered
                ? "linear-gradient(135deg,#047857,#059669)"
                : "linear-gradient(135deg,#10b981,#059669)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "clamp(10px,1.2vw,14px) clamp(18px,2vw,28px)",
              fontWeight: 700,
              fontSize: "clamp(13px,1.1vw,14px)",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: hovered
                ? "0 8px 20px rgba(16,185,129,0.4)"
                : "0 2px 8px rgba(16,185,129,0.2)",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              letterSpacing: "0.01em",
            }}
          >
            Explore
            <FiArrowRight
              size={14}
              style={{
                transform: hovered
                  ? "translateX(3px)"
                  : "translateX(0)",
                transition: "transform 0.3s ease",
              }}
            />
          </button>
        </div>
      </div>
    </article>
  );
});

export default DestinationCard;