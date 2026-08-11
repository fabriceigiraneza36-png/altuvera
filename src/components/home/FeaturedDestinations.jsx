import React, { useState } from "react";
import { FiArrowRight, FiMapPin, FiClock, FiUsers, FiStar, FiHeart, FiCamera } from "react-icons/fi";
import AnimatedSection from "../common/AnimatedSection";
import Button from "../common/Button";
import { useDestinations } from "../../hooks/useDestinations";
import { useNavigate } from "react-router-dom";

// ── Difficulty Badge Colors ────────────────────────────────────────────────
const difficultyConfig = {
  easy:        { color: "#10B981", bg: "rgba(16,185,129,0.12)",  label: "Easy"        },
  moderate:    { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  label: "Moderate"    },
  challenging: { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label: "Challenging" },
  strenuous:   { color: "#DC2626", bg: "rgba(220,38,38,0.12)",   label: "Strenuous"   },
  expert:      { color: "#7C3AED", bg: "rgba(124,58,237,0.12)",  label: "Expert"      },
};

// ── Stat Pill ──────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, value, color = "#059669" }) {
  if (!value) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "100px",
        backgroundColor: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "600",
        border: "1px solid rgba(255,255,255,0.2)",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={11} />
      {value}
    </span>
  );
}

// ── Destination Card ───────────────────────────────────────────────────────
function DestinationCard({ destination, index = 0 }) {
  const navigate = useNavigate();
  const [wished,    setWished]    = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered,   setHovered]   = useState(false);

  const {
    id,
    name        = "Unknown Destination",
    country,
    countryName,
    region,
    category    = "Safari",
    difficulty  = "moderate",
    rating,
    reviewCount,
    duration,
    durationDays,
    minGroupSize,
    maxGroupSize,
    imageUrl,
    heroImage,
    thumbnailUrl,
    shortDescription,
    description,
    entranceFee,
    isFeatured,
    isPopular,
    isNew,
    isEcoFriendly,
    highlights  = [],
  } = destination;

  const imageSrc = !imgError && (heroImage || imageUrl || thumbnailUrl);
  const displayCountry = countryName || country?.name || "";
  const displayRegion  = region || "";
  const diffConf       = difficultyConfig[difficulty?.toLowerCase()] || difficultyConfig.moderate;

  const displayDuration = duration
    ? duration
    : durationDays
    ? `${durationDays} Day${durationDays > 1 ? "s" : ""}`
    : null;

  const displayGroup =
    minGroupSize || maxGroupSize
      ? `${minGroupSize || 1}–${maxGroupSize || "∞"} pax`
      : null;

  const displayRating = rating ? Number(rating).toFixed(1) : null;

  const blurb =
    shortDescription ||
    (description ? description.slice(0, 110) + (description.length > 110 ? "…" : "") : "");

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/book/${id}`);
  };

  const handleLearnMore = (e) => {
    e.stopPropagation();
    navigate(`/destinations/${id}`);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    setWished((w) => !w);
  };

  // Staggered animation delay
  const delay = `${index * 80}ms`;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: hovered
          ? "0 24px 60px rgba(0,0,0,0.18)"
          : "0 4px 24px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        animationDelay: delay,
        position: "relative",
        width: "100%",
      }}
      onClick={handleLearnMore}
      aria-label={`View details for ${name}`}
    >
      {/* ── Image Area ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "62%", // 16:10 aspect ratio
          backgroundColor: "#E5F0EB",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Skeleton shimmer */}
        {!imgLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg,#e8f4ee 25%,#d4ead e 50%,#e8f4ee 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.6s infinite",
            }}
          />
        )}

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.07)" : "scale(1)",
              opacity: imgLoaded ? 1 : 0,
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
              color: "#059669",
            }}
          >
            <FiCamera size={36} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: "12px", opacity: 0.6, marginTop: "8px" }}>
              No image
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
          }}
        />

        {/* Top-left badges */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {isFeatured && <Badge label="⭐ Featured" color="#F59E0B" />}
          {isPopular  && <Badge label="🔥 Popular"  color="#EF4444" />}
          {isNew      && <Badge label="🆕 New"      color="#3B82F6" />}
          {isEcoFriendly && <Badge label="🌿 Eco"   color="#10B981" />}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWish}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: wished
              ? "rgba(239,68,68,0.9)"
              : "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            color: wished ? "#fff" : "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            transform: wished ? "scale(1.15)" : "scale(1)",
          }}
        >
          <FiHeart
            size={16}
            fill={wished ? "currentColor" : "none"}
          />
        </button>

        {/* Bottom image stats */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            right: "12px",
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {displayDuration && (
            <StatPill icon={FiClock} value={displayDuration} />
          )}
          {displayGroup && (
            <StatPill icon={FiUsers} value={displayGroup} />
          )}
          {displayRating && (
            <StatPill icon={FiStar} value={`${displayRating} (${reviewCount ?? 0})`} />
          )}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flexGrow: 1,
        }}
      >
        {/* Category + Difficulty row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#059669",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              backgroundColor: "rgba(5,150,105,0.08)",
              padding: "3px 10px",
              borderRadius: "100px",
              border: "1px solid rgba(5,150,105,0.15)",
            }}
          >
            {category}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: diffConf.color,
              backgroundColor: diffConf.bg,
              padding: "3px 10px",
              borderRadius: "100px",
              textTransform: "capitalize",
            }}
          >
            {diffConf.label}
          </span>
        </div>

        {/* Name */}
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(18px, 2.5vw, 22px)",
            fontWeight: "800",
            color: "#111827",
            lineHeight: "1.25",
            margin: 0,
          }}
        >
          {name}
        </h3>

        {/* Location */}
        {(displayCountry || displayRegion) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#6B7280",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            <FiMapPin size={13} color="#059669" />
            <span>
              {[displayRegion, displayCountry].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Description */}
        {blurb && (
          <p
            style={{
              fontSize: "13.5px",
              color: "#4B5563",
              lineHeight: "1.7",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {blurb}
          </p>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {highlights.slice(0, 3).map((h, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  backgroundColor: "#F3F4F6",
                  padding: "3px 9px",
                  borderRadius: "100px",
                  fontWeight: "500",
                  border: "1px solid #E5E7EB",
                }}
              >
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  padding: "3px 9px",
                  fontWeight: "500",
                }}
              >
                +{highlights.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "#F3F4F6",
            margin: "4px 0",
          }}
        />

        {/* Price + CTA Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "auto",
          }}
        >
          {/* Price info */}
          <div>
            {entranceFee ? (
              <>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9CA3AF",
                    margin: "0 0 2px",
                    fontWeight: "500",
                  }}
                >
                  From
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#059669",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {entranceFee}
                </p>
              </>
            ) : (
              <p
                style={{
                  fontSize: "13px",
                  color: "#9CA3AF",
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                Price on request
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleLearnMore}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "2px solid #059669",
                backgroundColor: "transparent",
                color: "#059669",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#059669";
              }}
            >
              Learn More
            </button>

            <button
              onClick={handleBookNow}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "2px solid #059669",
                backgroundColor: "#059669",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#047857";
                e.currentTarget.style.borderColor = "#047857";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
                e.currentTarget.style.borderColor = "#059669";
              }}
            >
              Book Now <FiArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Small Badge ────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: "100px",
        backgroundColor: color,
        color: "#fff",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {label}
    </span>
  );
}

// ── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: "100%",
          paddingTop: "62%",
          backgroundColor: "#E5E7EB",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s infinite",
          }}
        />
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[80, 60, 100, 70].map((w, i) => (
          <div
            key={i}
            style={{
              height: i === 0 ? "20px" : "14px",
              width: `${w}%`,
              borderRadius: "8px",
              backgroundColor: "#E5E7EB",
              animation: "shimmer 1.6s infinite",
              background:
                "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
              backgroundSize: "200% 100%",
            }}
          />
        ))}
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: "36px",
                flex: 1,
                borderRadius: "10px",
                backgroundColor: "#E5E7EB",
                animation: "shimmer 1.6s infinite",
                background:
                  "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────────────────
const FeaturedDestinations = () => {
  const { destinations: allDestinations = [], loading } = useDestinations({
    limit: 6,
    sort: "-featured",
  });
  const destinations = allDestinations.slice(0, 6);

  return (
    <>
      {/* Global keyframe for shimmer + card animation */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dest-card-anim {
          animation: fadeSlideUp 0.55s ease both;
        }

        /* Responsive grid */
        .dest-grid {
          display: grid;
          gap: 28px;
          grid-template-columns: repeat(3, 1fr);
          margin-bottom: 72px;
        }
        @media (max-width: 1200px) {
          .dest-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 700px) {
          .dest-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>

      <section
        style={{
          padding: "clamp(72px, 10vw, 140px) clamp(16px, 5vw, 60px)",
          backgroundColor: "#F0FDF4",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative pattern */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Section header */}
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 22px",
                  backgroundColor: "rgba(5,150,105,0.08)",
                  borderRadius: "100px",
                  color: "#059669",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  border: "1px solid rgba(5,150,105,0.15)",
                }}
              >
                <FiMapPin size={13} /> Featured Destinations
              </span>

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(32px, 5.5vw, 60px)",
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: "20px",
                  lineHeight: "1.1",
                }}
              >
                Extraordinary Places Await
              </h2>

              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(15px, 1.8vw, 19px)",
                  color: "#6B7280",
                  maxWidth: "680px",
                  margin: "0 auto",
                  lineHeight: "1.85",
                }}
              >
                Discover handpicked destinations that showcase the very best of
                East Africa's natural wonders, wildlife, and cultural heritage.
              </p>
            </div>
          </AnimatedSection>

          {/* Cards grid */}
          <div className="dest-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : destinations.length > 0
              ? destinations.map((destination, index) => (
                  <div
                    key={destination.id}
                    className="dest-card-anim"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <DestinationCard destination={destination} index={index} />
                  </div>
                ))
              : (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#9CA3AF",
                  }}
                >
                  <FiMapPin size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
                  <p style={{ fontSize: "16px", fontWeight: "500" }}>
                    No destinations available at the moment.
                  </p>
                </div>
              )}
          </div>

          {/* View all CTA */}
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center" }}>
              <Button
                to="/destinations"
                variant="primary"
                size="large"
                icon={<FiArrowRight size={18} />}
              >
                View All Destinations
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default FeaturedDestinations;