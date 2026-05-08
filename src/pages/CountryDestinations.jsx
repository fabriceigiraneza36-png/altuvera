// src/pages/CountryDestinations.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiStar,
  FiArrowRight,
  FiClock,
  FiGrid,
  FiList,
  FiFilter,
  FiSearch,
  FiX,
  FiChevronDown,
  FiUsers,
  FiCalendar,
  FiHeart,
  FiShare2,
  FiArrowLeft,
  FiCheck,
  FiCamera,
  FiSun,
  FiCompass,
  FiAward,
  FiMessageCircle,
  FiChevronUp,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCountry, useCountryDestinations } from "../hooks/useCountries";

// ============================================================
// CONTACT INFO
// ============================================================
const CONTACT_INFO = {
  name: "IGIRANEZA Fabrice",
  phone1: "+250 792352409",
  phone2: "+250 792352409",
  whatsapp: "+250792352409",
};

// ============================================================
// GLOBAL STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap');

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .cd-card { animation: fadeIn 0.6s ease forwards; }
    .cd-card:hover .cd-card-img { transform: scale(1.08); }

    .cd-lift {
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.4s ease;
    }
    .cd-lift:hover {
      transform: translateY(-10px) scale(1.01);
      box-shadow: 0 26px 70px rgba(2,44,34,0.16);
    }

    input:focus, select:focus {
      outline: none;
      border-color: #43a047 !important;
      box-shadow: 0 0 0 4px rgba(67,160,71,0.15);
    }

    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #e8f5e9; border-radius: 10px; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #43a047, #1b5e20);
      border-radius: 10px;
    }
    ::selection { background: rgba(67,160,71,0.3); color: #1b5e20; }
  `}</style>
);

// ============================================================
// LOCAL HOOKS
// ============================================================
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

const useScrollPosition = () => {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const h = () => setPos(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return pos;
};

// ============================================================
// HELPERS
// ============================================================
const getWhatsAppLink = (destinationName) => {
  const msg = encodeURIComponent(
    `Hello ${CONTACT_INFO.name}! I'm interested in booking "${destinationName}". Could you please provide me with pricing details and availability?`
  );
  return `https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, "")}?text=${msg}`;
};

const safeArr = (v) => (Array.isArray(v) ? v : []);

// ── Normalise a destination row from the backend.
// The backend destinations table uses snake_case column names.
// We map them here to the camelCase the UI expects.
const normaliseDestination = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description || row.short_description || "",
  shortDescription: row.short_description || row.description || "",
  category: row.category || "General",
  location: row.location || row.countryName || "",
  country: row.country_name || row.countryName || "",
  imageUrl: row.image_url || row.imageUrl || safeArr(row.images)[0] || "",
  images: safeArr(row.images),
  highlights: safeArr(row.highlights),
  activities: safeArr(row.activities),
  isFeatured: row.is_featured || false,
  isActive: row.is_active !== false,
  rating: row.rating ? Number(row.rating) : null,
  mapPosition: row.mapPosition || {
    lat: row.latitude ? Number(row.latitude) : null,
    lng: row.longitude ? Number(row.longitude) : null,
  },
  // These fields don't exist in the schema — use graceful fallbacks
  duration: row.duration || null,
  groupSize: row.group_size || row.groupSize || null,
  bestSeason: row.best_season || row.bestSeason || null,
  reviews: row.reviews || row.review_count || null,
  type: row.category || row.type || "Destination",
});

// ============================================================
// SKELETON
// ============================================================
const DestinationCardSkeleton = () => (
  <div
    style={{
      background: "white",
      borderRadius: 28,
      overflow: "hidden",
      boxShadow: "0 25px 60px rgba(0,128,0,0.1)",
    }}
  >
    {[
      { h: 260, w: "100%" },
      { h: 28, w: "70%", m: "28px 28px 8px" },
      { h: 16, w: "50%", m: "0 28px 18px" },
      { h: 14, w: "100%", m: "0 28px 8px" },
      { h: 14, w: "85%", m: "0 28px 24px" },
    ].map((s, i) => (
      <div
        key={i}
        style={{
          height: s.h, width: s.w, margin: s.m || 0,
          background:
            "linear-gradient(90deg,#e8f5e9 25%,#c8e6c9 50%,#e8f5e9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: i === 0 ? 0 : 8,
        }}
      />
    ))}
  </div>
);

// ============================================================
// DESTINATION CARD
// ============================================================
const DestinationCard = ({
  destination: raw,
  index,
  viewMode,
  wishlistIds,
  onToggleWishlist,
}) => {
  const d = useMemo(() => normaliseDestination(raw), [raw]);
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const isFav = wishlistIds.has(d.id);

  const images = d.images.length ? d.images : d.imageUrl ? [d.imageUrl] : [];

  // Image auto-rotate
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(
      () => setImgIdx((p) => (p + 1) % images.length),
      4000
    );
    return () => clearInterval(t);
  }, [images.length]);

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(d.id);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/destinations/${d.slug || d.id}`;
    navigator.share
      ? navigator.share({ title: d.name, url })
      : navigator.clipboard.writeText(url);
  };

  const handleWA = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(getWhatsAppLink(d.name), "_blank");
  };

  const isList = viewMode === "list";

  return (
    <Link
      to={`/destinations/${d.slug || d.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
      aria-label={`View ${d.name}`}
    >
      <article
        className="cd-card cd-lift"
        style={{
          height: "100%",
          background: "rgba(255,255,255,0.95)",
          borderRadius: 28,
          overflow: "hidden",
          border: "1px solid rgba(2,44,34,0.12)",
          display: isList ? "flex" : "block",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Image ─────────────────────────────── */}
        <div
          style={{
            position: "relative",
            height: isList ? "100%" : 260,
            minHeight: isList ? 280 : 260,
            width: isList ? 340 : "100%",
            flexShrink: 0,
            overflow: "hidden",
            background: "#e8f5e9",
          }}
        >
          {images.map((src, i) => (
            <img
              key={i}
              className="cd-card-img"
              src={src}
              alt={`${d.name} ${i + 1}`}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                opacity: i === imgIdx ? 1 : 0,
                transition: "opacity 1.2s ease, transform 6s ease",
                transform: i === imgIdx ? "scale(1.06)" : "scale(1)",
              }}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ))}
          {/* no-image placeholder */}
          {!images.length && (
            <div
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 48, color: "#81c784",
              }}
            >
              🗺️
            </div>
          )}

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute", inset: 0,
              background:
                "linear-gradient(to top,rgba(27,94,32,0.65),transparent 60%)",
              zIndex: 1,
            }}
          />

          {/* Category badge */}
          <div
            style={{
              position: "absolute", top: 16, left: 16, zIndex: 3,
              background: "linear-gradient(135deg,#43a047,#1b5e20)",
              color: "#fff", padding: "8px 18px", borderRadius: 30,
              fontSize: 12, fontWeight: 600, letterSpacing: "0.7px",
              textTransform: "uppercase",
              boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
            }}
          >
            {d.type}
          </div>

          {/* Rating badge */}
          {d.rating && (
            <div
              style={{
                position: "absolute", top: 16, right: 16, zIndex: 3,
                background: "rgba(255,255,255,0.95)",
                padding: "8px 14px", borderRadius: 30,
                fontSize: 14, fontWeight: 700, color: "#1b5e20",
                display: "flex", alignItems: "center", gap: 5,
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              }}
            >
              <FiStar
                size={15}
                style={{ fill: "#f59e0b", color: "#f59e0b" }}
              />
              {d.rating}
              {d.reviews != null && (
                <span
                  style={{ color: "#81c784", fontWeight: 400, fontSize: 12 }}
                >
                  ({d.reviews})
                </span>
              )}
            </div>
          )}

          {/* Hover action buttons */}
          <div
            style={{
              position: "absolute", bottom: 16, right: 16, zIndex: 3,
              display: "flex", gap: 10,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0)" : "translateY(10px)",
              transition: "all 0.35s ease",
            }}
          >
            {[
              {
                icon: (
                  <FiHeart
                    size={18}
                    style={{ fill: isFav ? "#ef4444" : "transparent" }}
                  />
                ),
                bg: isFav ? "#fee2e2" : "rgba(255,255,255,0.95)",
                color: isFav ? "#ef4444" : "#1b5e20",
                action: handleFav,
                label: isFav ? "Remove favourite" : "Add favourite",
              },
              {
                icon: <FiShare2 size={18} style={{ color: "#1b5e20" }} />,
                bg: "rgba(255,255,255,0.95)",
                action: handleShare,
                label: "Share",
              },
            ].map((btn, bi) => (
              <button
                key={bi}
                onClick={btn.action}
                aria-label={btn.label}
                style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: btn.bg, border: "none",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Image dots */}
          {images.length > 1 && (
            <div
              style={{
                position: "absolute", bottom: 16, left: 16,
                zIndex: 3, display: "flex", gap: 5,
              }}
            >
              {images.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === imgIdx ? 22 : 7,
                    height: 7, borderRadius: 10,
                    background:
                      i === imgIdx
                        ? "#fff"
                        : "rgba(255,255,255,0.5)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Content ──────────────────────────── */}
        <div
          style={{
            padding: isList ? 32 : 24,
            flex: 1, display: "flex",
            flexDirection: "column",
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isList ? 26 : 22,
              fontWeight: 700, color: "#1b5e20",
              margin: "0 0 8px", lineHeight: 1.3,
            }}
          >
            {d.name}
          </h3>

          {d.location && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 14, color: "#43a047", marginBottom: 14,
                fontWeight: 500,
              }}
            >
              <FiMapPin size={14} />
              {d.location}
            </div>
          )}

          {d.description && (
            <p
              style={{
                fontSize: 14, color: "#555", lineHeight: 1.8,
                marginBottom: 16,
                display: "-webkit-box",
                WebkitLineClamp: isList ? 4 : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                flex: isList ? 1 : "auto",
              }}
            >
              {d.description}
            </p>
          )}

          {/* Highlights/features */}
          {d.highlights.length > 0 && (
            <div
              style={{
                display: "flex", flexWrap: "wrap",
                gap: 8, marginBottom: 18,
              }}
            >
              {d.highlights.slice(0, 4).map((h, i) => (
                <span
                  key={i}
                  style={{
                    background:
                      "linear-gradient(135deg,#e8f5e9,#ffffff)",
                    color: "#2e7d32",
                    padding: "8px 14px", borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                    border: "1px solid rgba(67,160,71,0.15)",
                    boxShadow: "0 4px 12px rgba(0,128,0,0.06)",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Meta row — only render if we have values */}
          {(d.duration || d.groupSize || d.bestSeason) && (
            <div
              style={{
                display: "flex", flexWrap: "wrap", gap: 12,
                marginBottom: 18, padding: 14,
                background:
                  "linear-gradient(135deg,#f1f8e9,#e8f5e9)",
                borderRadius: 14,
              }}
            >
              {d.duration && (
                <MetaItem icon={FiClock} text={d.duration} />
              )}
              {d.groupSize && (
                <MetaItem icon={FiUsers} text={d.groupSize} />
              )}
              {d.bestSeason && (
                <MetaItem icon={FiCalendar} text={d.bestSeason} />
              )}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: "auto", paddingTop: 16,
              borderTop: "2px solid #e8f5e9",
              display: "flex", flexDirection: "column", gap: 10,
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13, color: "#5a7a5a", fontStyle: "italic",
              }}
            >
              <FiMessageCircle size={14} />
              Contact us for personalised pricing
            </div>
            <button
              onClick={handleWA}
              style={{
                padding: "14px 24px",
                background:
                  "linear-gradient(135deg,#25D366,#128C7E)",
                color: "#fff", border: "none", borderRadius: 30,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                boxShadow: "0 8px 24px rgba(37,211,102,0.28)",
                transition: "all 0.3s ease",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              <FaWhatsapp size={18} />
              Inquire on WhatsApp
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

const MetaItem = ({ icon: Icon, text }) => (
  <div
    style={{
      display: "flex", alignItems: "center",
      gap: 7, fontSize: 13, color: "#2e7d32", fontWeight: 500,
    }}
  >
    <div
      style={{
        width: 28, height: 28, borderRadius: 8,
        background: "white", display: "flex",
        alignItems: "center", justifyContent: "center",
        boxShadow: "0 3px 8px rgba(0,128,0,0.1)",
      }}
    >
      <Icon size={14} style={{ color: "#43a047" }} />
    </div>
    {text}
  </div>
);

// ============================================================
// STAT CARD
// ============================================================
const StatCard = ({ icon: Icon, value, label }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: hovered
          ? "linear-gradient(135deg,#43a047,#1b5e20)"
          : "rgba(255,255,255,0.95)",
        borderRadius: 22, padding: "24px 20px",
        textAlign: "center",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered
          ? "translateY(-6px) scale(1.02)"
          : "translateY(0)",
        boxShadow: hovered
          ? "0 22px 55px rgba(0,128,0,0.28)"
          : "0 12px 35px rgba(0,128,0,0.08)",
        cursor: "default",
        border: "1px solid rgba(67,160,71,0.1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 18,
          background: hovered
            ? "rgba(255,255,255,0.2)"
            : "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
          display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px",
          boxShadow: "0 6px 16px rgba(0,128,0,0.1)",
        }}
      >
        <Icon
          size={26}
          style={{ color: hovered ? "white" : "#43a047" }}
        />
      </div>
      <div
        style={{
          fontSize: 32, fontWeight: 800,
          color: hovered ? "white" : "#1b5e20",
          fontFamily: "'Poppins',sans-serif",
          transition: "color 0.4s",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 13, fontWeight: 600,
          color: hovered ? "rgba(255,255,255,0.85)" : "#5a7a5a",
          textTransform: "uppercase", letterSpacing: "0.5px",
          transition: "color 0.4s",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ============================================================
// SEARCH INPUT
// ============================================================
const SearchInput = ({ value, onChange, onClear }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
      <input
        type="text"
        placeholder="Search destinations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "14px 46px 14px 20px",
          background: "rgba(255,255,255,0.95)",
          border: focused
            ? "2px solid #43a047"
            : "2px solid #e8f5e9",
          borderRadius: 14, fontSize: 14, fontWeight: 500,
          color: "#1b5e20", fontFamily: "'Poppins',sans-serif",
          boxShadow: focused
            ? "0 8px 24px rgba(0,128,0,0.14)"
            : "0 3px 12px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease",
        }}
        aria-label="Search destinations"
      />
      <div
        style={{
          position: "absolute", right: 14, top: "50%",
          transform: "translateY(-50%)",
          display: "flex", alignItems: "center",
        }}
      >
        {value ? (
          <button
            onClick={onClear}
            style={{
              background: "#e8f5e9", border: "none",
              borderRadius: "50%", width: 24, height: 24,
              display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            <FiX size={14} style={{ color: "#43a047" }} />
          </button>
        ) : (
          <FiSearch size={18} style={{ color: "#81c784" }} />
        )}
      </div>
    </div>
  );
};

// ============================================================
// FILTER DROPDOWN
// ============================================================
const FilterDropdown = ({
  label, options, value, onChange, icon: Icon,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || label;

  return (
    <div ref={ref} style={{ position: "relative", zIndex: open ? 100 : 1 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "13px 20px",
          background: "rgba(255,255,255,0.95)",
          border: open ? "2px solid #43a047" : "2px solid #e8f5e9",
          borderRadius: 14, fontSize: 14, fontWeight: 600,
          color: "#1b5e20", cursor: "pointer",
          minWidth: 160, justifyContent: "space-between",
          fontFamily: "'Poppins',sans-serif",
          boxShadow: open
            ? "0 8px 24px rgba(0,128,0,0.14)"
            : "0 3px 12px rgba(0,0,0,0.05)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {Icon && <Icon size={16} style={{ color: "#43a047" }} />}
          {selectedLabel}
        </span>
        <FiChevronDown
          size={16}
          style={{
            color: "#43a047",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
      <div
        style={{
          position: "absolute", top: "calc(100% + 8px)",
          left: 0, right: 0,
          background: "rgba(255,255,255,0.98)",
          borderRadius: 14,
          boxShadow: "0 18px 45px rgba(0,128,0,0.14)",
          border: "1px solid #e8f5e9",
          overflow: "hidden",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition: "all 0.25s ease",
        }}
      >
        {options.map((opt, i) => (
          <div
            key={opt.value}
            onClick={() => { onChange(opt.value); setOpen(false); }}
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              fontSize: 14,
              color: value === opt.value ? "#1b5e20" : "#374151",
              background:
                value === opt.value ? "#f0fdf4" : "transparent",
              fontWeight: value === opt.value ? 600 : 400,
              cursor: "pointer",
              borderBottom:
                i < options.length - 1
                  ? "1px solid #f0fdf4"
                  : "none",
              fontFamily: "'Poppins',sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (value !== opt.value)
                e.currentTarget.style.background = "#f0fdf4";
            }}
            onMouseLeave={(e) => {
              if (value !== opt.value)
                e.currentTarget.style.background = "transparent";
            }}
          >
            {opt.label}
            {value === opt.value && (
              <FiCheck size={16} style={{ color: "#43a047" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// VIEW MODE TOGGLE
// ============================================================
const ViewModeToggle = ({ viewMode, onChange }) => (
  <div
    style={{
      display: "flex",
      background: "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
      borderRadius: 12, padding: 5,
    }}
  >
    {[
      { mode: "grid", Icon: FiGrid },
      { mode: "list", Icon: FiList },
    ].map(({ mode, Icon }) => (
      <button
        key={mode}
        onClick={() => onChange(mode)}
        aria-label={`${mode} view`}
        style={{
          padding: "10px 14px", borderRadius: 9, border: "none",
          background:
            viewMode === mode
              ? "white"
              : "transparent",
          cursor: "pointer",
          boxShadow:
            viewMode === mode
              ? "0 3px 10px rgba(0,128,0,0.14)"
              : "none",
          transition: "all 0.3s ease",
          display: "flex", alignItems: "center",
        }}
      >
        <Icon
          size={18}
          style={{
            color: viewMode === mode ? "#1b5e20" : "#81c784",
          }}
        />
      </button>
    ))}
  </div>
);

// ============================================================
// ACTIVE FILTER TAGS
// ============================================================
const ActiveFilterTags = ({ filters, onClearAll }) => {
  if (!filters.length) return null;
  return (
    <div
      style={{
        display: "flex", gap: 8,
        flexWrap: "wrap", alignItems: "center",
      }}
    >
      {filters.map((f) => (
        <span
          key={f.key}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px",
            background:
              "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
            borderRadius: 20, fontSize: 13,
            color: "#1b5e20", fontWeight: 600,
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          {f.label}
          <button
            onClick={f.clear}
            style={{
              width: 18, height: 18, borderRadius: "50%",
              background: "rgba(27,94,32,0.15)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX size={11} style={{ color: "#1b5e20" }} />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        style={{
          padding: "7px 12px", background: "transparent",
          border: "none", fontSize: 13, color: "#5a7a5a",
          fontWeight: 600, cursor: "pointer",
          textDecoration: "underline",
          fontFamily: "'Poppins',sans-serif",
        }}
      >
        Clear all
      </button>
    </div>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================
const EmptyState = ({ countryName, searchQuery, onClear }) => (
  <div
    style={{
      textAlign: "center", padding: "72px 32px",
      background: "rgba(255,255,255,0.95)",
      borderRadius: 28,
      boxShadow: "0 20px 50px rgba(0,128,0,0.09)",
    }}
  >
    <div
      style={{
        width: 120, height: 120, borderRadius: "50%",
        background:
          "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
        display: "flex", alignItems: "center",
        justifyContent: "center", margin: "0 auto 28px",
        fontSize: 52,
      }}
    >
      🗺️
    </div>
    <h3
      style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: 28, fontWeight: 700, color: "#1b5e20",
        marginBottom: 14,
      }}
    >
      {searchQuery ? "No Matching Destinations" : "No Destinations Yet"}
    </h3>
    <p
      style={{
        fontSize: 16, color: "#5a7a5a",
        maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.8,
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      {searchQuery
        ? `No destinations matching "${searchQuery}". Try adjusting your filters.`
        : `We're curating amazing experiences for ${countryName}. Check back soon!`}
    </p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      {searchQuery && (
        <button
          onClick={onClear}
          style={{
            padding: "13px 28px",
            background: "rgba(255,255,255,0.95)",
            border: "2px solid #e8f5e9", borderRadius: 30,
            fontSize: 15, fontWeight: 600, color: "#1b5e20",
            cursor: "pointer", fontFamily: "'Poppins',sans-serif",
          }}
        >
          Clear Filters
        </button>
      )}
      <Link
        to="/destinations"
        style={{
          padding: "13px 28px",
          background:
            "linear-gradient(135deg,#43a047,#1b5e20)",
          color: "#fff", borderRadius: 30, textDecoration: "none",
          fontSize: 15, fontWeight: 600,
          fontFamily: "'Poppins',sans-serif",
        }}
      >
        Explore All Destinations
      </Link>
    </div>
  </div>
);

// ============================================================
// NOT FOUND
// ============================================================
const CountryNotFound = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh", display: "flex",
        flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        background:
          "radial-gradient(ellipse at top left,#e8f5e9,#ffffff 60%)",
        textAlign: "center",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 72, marginBottom: 36,
          animation: "float 3s ease-in-out infinite",
        }}
      >
        🗺️
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 42, fontWeight: 700, color: "#1b5e20",
          marginBottom: 16,
        }}
      >
        Country Not Found
      </h1>
      <p
        style={{
          fontSize: 18, color: "#5a7a5a", maxWidth: 480,
          lineHeight: 1.8, marginBottom: 40,
        }}
      >
        The country you're looking for doesn't exist or may have been
        removed.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 30px",
            background: "rgba(255,255,255,0.95)",
            border: "2px solid #e8f5e9", borderRadius: 40,
            fontSize: 15, fontWeight: 600, color: "#1b5e20",
            cursor: "pointer",
          }}
        >
          <FiArrowLeft size={18} /> Go Back
        </button>
        <Link
          to="/destinations"
          style={{
            padding: "14px 30px",
            background:
              "linear-gradient(135deg,#43a047,#1b5e20)",
            color: "#fff", borderRadius: 40, textDecoration: "none",
            fontSize: 15, fontWeight: 600,
          }}
        >
          All Destinations
        </Link>
      </div>
    </div>
  );
};

// ============================================================
// FLOATING WHATSAPP
// ============================================================
const FloatingWhatsApp = () => {
  const [hov, setHov] = useState(false);
  const msg = encodeURIComponent(
    `Hello ${CONTACT_INFO.name}! I'm browsing your destinations and would like to know more about pricing and availability.`
  );
  return (
    <div
      style={{
        position: "fixed", bottom: 28, left: 28, zIndex: 1000,
        display: "flex", alignItems: "center", gap: 10,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {hov && (
        <div
          style={{
            background: "white", padding: "10px 16px",
            borderRadius: 12,
            boxShadow: "0 6px 22px rgba(0,0,0,0.14)",
            fontSize: 13, fontWeight: 600, color: "#1b5e20",
            whiteSpace: "nowrap",
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          Chat for pricing!
        </div>
      )}
      <button
        onClick={() =>
          window.open(
            `https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, "")}?text=${msg}`,
            "_blank"
          )
        }
        aria-label="WhatsApp"
        style={{
          width: 58, height: 58, borderRadius: "50%",
          background:
            "linear-gradient(135deg,#25D366,#128C7E)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 30px rgba(37,211,102,0.38)",
          transform: hov ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.3s ease",
        }}
      >
        <FaWhatsapp size={26} style={{ color: "white" }} />
      </button>
    </div>
  );
};

// ============================================================
// BACK TO TOP
// ============================================================
const BackToTop = ({ visible }) => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    aria-label="Back to top"
    style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 1000,
      width: 52, height: 52, borderRadius: "50%",
      background:
        "linear-gradient(135deg,#43a047,#1b5e20)",
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 10px 28px rgba(0,128,0,0.32)",
      opacity: visible ? 1 : 0,
      visibility: visible ? "visible" : "hidden",
      transform: visible ? "scale(1)" : "scale(0.7)",
      transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
    }}
  >
    <FiChevronUp size={22} style={{ color: "white" }} />
  </button>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const CountryDestinations = () => {
  const { countryId } = useParams();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const scrollPos = useScrollPosition();

  // ── UI state ──────────────────────────────────────
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // ── Data ──────────────────────────────────────────
  // useCountry returns the country object (no .data wrapper after fix)
  const { country, loading: countryLoading, error: countryError } =
    useCountry(countryId);

  // useCountryDestinations returns { destinations, pagination, countryMeta,
  // loading, error }
  const {
    destinations: rawDestinations,
    loading: destsLoading,
    error: destsError,
    pagination,
  } = useCountryDestinations(countryId);

  const isLoading = countryLoading || destsLoading;

  // ── Normalise destinations ────────────────────────
  const allDestinations = useMemo(
    () => rawDestinations.map(normaliseDestination),
    [rawDestinations]
  );

  // ── Wishlist (local for now) ──────────────────────
  const toggleWishlist = useCallback((id) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Filter / sort ─────────────────────────────────
  const filteredDestinations = useMemo(() => {
    let res = [...allDestinations];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    if (filterCategory) {
      res = res.filter(
        (d) =>
          d.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    if (sortBy === "rating")
      res.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sortBy === "name") res.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name-desc")
      res.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "reviews")
      res.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    return res;
  }, [allDestinations, searchQuery, filterCategory, sortBy]);

  // ── Category options ──────────────────────────────
  const categoryOptions = useMemo(() => {
    const cats = [
      ...new Set(allDestinations.map((d) => d.category).filter(Boolean)),
    ];
    return cats.map((c) => ({ value: c, label: c }));
  }, [allDestinations]);

  const sortOptions = [
    { value: "", label: "Default" },
    { value: "rating", label: "Highest Rated" },
    { value: "reviews", label: "Most Reviewed" },
    { value: "name", label: "Name: A–Z" },
    { value: "name-desc", label: "Name: Z–A" },
  ];

  const activeFilters = [
    ...(filterCategory
      ? [
          {
            key: "cat",
            label: filterCategory,
            clear: () => setFilterCategory(""),
          },
        ]
      : []),
    ...(sortBy
      ? [
          {
            key: "sort",
            label:
              sortOptions.find((s) => s.value === sortBy)?.label ?? sortBy,
            clear: () => setSortBy(""),
          },
        ]
      : []),
  ];

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("");
    setFilterCategory("");
  }, []);

  // ── Stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const rated = allDestinations.filter((d) => d.rating != null);
    return {
      total: allDestinations.length,
      avgRating:
        rated.length
          ? (rated.reduce((s, d) => s + d.rating, 0) / rated.length).toFixed(1)
          : "—",
      totalReviews: allDestinations.reduce(
        (s, d) => s + (d.reviews ?? 0), 0
      ),
      types: new Set(allDestinations.map((d) => d.category)).size,
    };
  }, [allDestinations]);

  // ── Not found ─────────────────────────────────────
  if (!country && !countryLoading) return <CountryNotFound />;

  if (!country && countryLoading) {
    return (
      <div
        style={{
          minHeight: "60vh", display: "grid",
          placeItems: "center", fontFamily: "'Poppins',sans-serif",
          color: "#43a047",
        }}
      >
        Loading…
      </div>
    );
  }

  // ── Layout helpers ────────────────────────────────
  const gridCols =
    viewMode === "list"
      ? "1fr"
      : isMobile
      ? "1fr"
      : isTablet
      ? "repeat(2,1fr)"
      : "repeat(3,1fr)";

  const heroImage =
    country.heroImage ||
    country.coverImageUrl ||
    country.imageUrl ||
    safeArr(country.images)[0];

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif" }}>
      <GlobalStyles />

      {/* ── Hero banner ─────────────────────────── */}
      <div
        style={{
          position: "relative",
          height: isMobile ? "45vh" : "55vh",
          minHeight: 320, overflow: "hidden",
        }}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt={country.name}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%", height: "100%",
              background:
                "linear-gradient(135deg,#1b5e20,#43a047)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute", inset: 0,
            background:
              "linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,.6) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: isMobile ? "28px 20px" : "44px 48px",
          }}
        >
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex", alignItems: "center",
              gap: 8, marginBottom: 14, flexWrap: "wrap",
            }}
          >
            {[
              { label: "Home", to: "/" },
              { label: "Destinations", to: "/destinations" },
              { label: country.name, to: `/country/${country.slug || countryId}` },
              { label: "All Destinations" },
            ].map((crumb, i, arr) => (
              <React.Fragment key={i}>
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      textDecoration: "none", fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      color: "rgba(255,255,255,0.95)",
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
                {i < arr.length - 1 && (
                  <FiArrowRight
                    size={12}
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div
            style={{
              display: "flex", alignItems: "center",
              gap: 16, marginBottom: 10,
            }}
          >
            {country.flag && (
              <span style={{ fontSize: isMobile ? 36 : 48 }}>
                {country.flag}
              </span>
            )}
            {country.flagUrl && !country.flag && (
              <img
                src={country.flagUrl}
                alt=""
                style={{
                  width: isMobile ? 44 : 56,
                  height: isMobile ? 31 : 40,
                  borderRadius: 6, objectFit: "cover",
                }}
              />
            )}
            <div>
              <h1
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: isMobile ? 28 : 42, fontWeight: 700,
                  color: "white", margin: 0, lineHeight: 1.1,
                }}
              >
                {country.name} Destinations
              </h1>
              {country.tagline && (
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(255,255,255,0.82)",
                    fontSize: isMobile ? 14 : 17, fontWeight: 500,
                  }}
                >
                  {country.tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main section ────────────────────────── */}
      <section
        style={{
          padding: isMobile ? "36px 16px 80px" : "52px 24px 100px",
          background:
            "radial-gradient(ellipse at top left,#e8f5e9,#ffffff 60%)",
          minHeight: "60vh",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>

          {/* Country intro */}
          {country.description && (
            <div
              style={{
                textAlign: "center", maxWidth: 700,
                margin: "0 auto 48px", padding: "0 16px",
              }}
            >
              <p
                style={{
                  fontSize: isMobile ? 16 : 18, color: "#5a7a5a",
                  lineHeight: 1.85,
                }}
              >
                {country.description}
              </p>
            </div>
          )}

          {/* WhatsApp banner */}
          <div
            style={{
              background:
                "linear-gradient(135deg,#e8f5e9,#c8e6c9)",
              borderRadius: 18, padding: "22px 28px",
              marginBottom: 36,
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              border: "2px solid rgba(67,160,71,0.2)",
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              <div
                style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#25D366,#128C7E)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaWhatsapp size={24} style={{ color: "white" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15, fontWeight: 700, color: "#1b5e20",
                  }}
                >
                  Get Personalised Pricing
                </div>
                <div style={{ fontSize: 13, color: "#5a7a5a" }}>
                  {CONTACT_INFO.phone1} · {CONTACT_INFO.phone2}
                </div>
              </div>
            </div>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${CONTACT_INFO.name}! I'm interested in exploring destinations in ${country.name}. Could you help me?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "13px 26px",
                background:
                  "linear-gradient(135deg,#25D366,#128C7E)",
                color: "#fff", border: "none", borderRadius: 28,
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 8px 22px rgba(37,211,102,0.28)",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              <FaWhatsapp size={18} /> Chat Now
            </a>
          </div>

          {/* Stats */}
          {allDestinations.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2,1fr)"
                  : "repeat(4,1fr)",
                gap: isMobile ? 14 : 24,
                marginBottom: isMobile ? 44 : 64,
              }}
            >
              <StatCard
                icon={FiMapPin}
                value={stats.total}
                label="Destinations"
              />
              <StatCard
                icon={FiStar}
                value={stats.avgRating}
                label="Avg. Rating"
              />
              <StatCard
                icon={FiUsers}
                value={
                  stats.totalReviews > 0
                    ? stats.totalReviews.toLocaleString()
                    : "—"
                }
                label="Reviews"
              />
              <StatCard
                icon={FiCompass}
                value={stats.types || "—"}
                label="Categories"
              />
            </div>
          )}

          {/* Error message */}
          {destsError && (
            <div
              style={{
                padding: "16px 24px", marginBottom: 24,
                background: "#FEF2F2", borderRadius: 12,
                border: "1px solid #FCA5A5",
                color: "#B91C1C", fontSize: 14,
              }}
            >
              ⚠️ {destsError}
            </div>
          )}

          {/* Toolbar */}
          {(allDestinations.length > 0 || isLoading) && (
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                gap: 16, marginBottom: 28,
                padding: "22px 24px",
                background: "rgba(255,255,255,0.9)",
                borderRadius: 22,
                boxShadow: "0 12px 40px rgba(0,128,0,0.07)",
                border: "1px solid rgba(67,160,71,0.1)",
              }}
            >
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
              />
              <div
                style={{
                  display: "flex", flexWrap: "wrap",
                  gap: 12, alignItems: "center",
                }}
              >
                {categoryOptions.length > 0 && (
                  <FilterDropdown
                    label="All Categories"
                    options={[
                      { value: "", label: "All Categories" },
                      ...categoryOptions,
                    ]}
                    value={filterCategory}
                    onChange={setFilterCategory}
                    icon={FiFilter}
                  />
                )}
                <FilterDropdown
                  label="Sort By"
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                />
                {!isMobile && (
                  <ViewModeToggle
                    viewMode={viewMode}
                    onChange={setViewMode}
                  />
                )}
              </div>
            </div>
          )}

          {/* Results info + active tags */}
          {allDestinations.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 12, marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontSize: 14, color: "#5a7a5a", fontWeight: 500,
                }}
              >
                Showing{" "}
                <strong style={{ color: "#1b5e20" }}>
                  {filteredDestinations.length}
                </strong>{" "}
                of{" "}
                <strong style={{ color: "#1b5e20" }}>
                  {allDestinations.length}
                </strong>{" "}
                destinations
                {pagination?.totalCount &&
                  pagination.totalCount > allDestinations.length && (
                    <span style={{ color: "#81c784" }}>
                      {" "}(page {pagination.page} of {pagination.totalPages})
                    </span>
                  )}
              </span>
              <ActiveFilterTags
                filters={activeFilters}
                onClearAll={clearFilters}
              />
            </div>
          )}

          {/* Destinations grid */}
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: isMobile ? 20 : 32,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <DestinationCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredDestinations.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: isMobile ? 20 : 32,
              }}
            >
              {filteredDestinations.map((d, i) => (
                <DestinationCard
                  key={d.id}
                  destination={d}
                  index={i}
                  viewMode={viewMode}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              countryName={country.name}
              searchQuery={searchQuery || filterCategory}
              onClear={clearFilters}
            />
          )}

          {/* No destinations at all */}
          {!isLoading && allDestinations.length === 0 && !destsError && (
            <EmptyState countryName={country.name} onClear={clearFilters} />
          )}

          {/* Back to country */}
          <div
            style={{ textAlign: "center", marginTop: 56 }}
          >
            <Link
              to={`/country/${country.slug || countryId}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 32px",
                background: "rgba(255,255,255,0.95)",
                border: "2px solid #e8f5e9",
                borderRadius: 40, fontSize: 15, fontWeight: 600,
                color: "#1b5e20", textDecoration: "none",
                fontFamily: "'Poppins',sans-serif",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "#c8e6c9";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.95)";
                e.currentTarget.style.borderColor = "#e8f5e9";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FiArrowLeft size={18} />
              Back to {country.name}
            </Link>
          </div>
        </div>
      </section>

      <FloatingWhatsApp />
      <BackToTop visible={scrollPos > 500} />
    </div>
  );
};

export default CountryDestinations;