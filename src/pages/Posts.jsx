// src/pages/Posts.jsx

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiUser,
  FiBookmark,
  FiHeart,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiTag,
  FiEye,
  FiArrowUp,
  FiBookOpen,
  FiCoffee,
  FiStar,
  FiMail,
  FiChevronDown,
  FiZap,
  FiFeather,
  FiAlertCircle,
  FiRefreshCw,
  FiFilter,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { apiFetch } from "../utils/apiBase";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

  :root {
    --ps-green-50:   #ECFDF5;
    --ps-green-100:  #D1FAE5;
    --ps-green-200:  #A7F3D0;
    --ps-green-300:  #6EE7B7;
    --ps-green-400:  #34D399;
    --ps-green-500:  #10B981;
    --ps-green-600:  #059669;
    --ps-green-700:  #047857;
    --ps-green-800:  #065F46;
    --ps-green-900:  #064E3B;
    --ps-white:      #FFFFFF;
    --ps-off-white:  #F8FFFE;
    --ps-gray-50:    #F9FAFB;
    --ps-gray-100:   #F3F4F6;
    --ps-gray-200:   #E5E7EB;
    --ps-gray-300:   #D1D5DB;
    --ps-gray-400:   #9CA3AF;
    --ps-gray-500:   #6B7280;
    --ps-gray-600:   #4B5563;
    --ps-gray-700:   #374151;
    --ps-gray-800:   #1F2937;
    --ps-gray-900:   #111827;
    --ps-shadow-sm:    0 1px 4px rgba(5,150,105,0.06);
    --ps-shadow-md:    0 4px 20px rgba(5,150,105,0.08);
    --ps-shadow-lg:    0 12px 44px rgba(5,150,105,0.12);
    --ps-shadow-xl:    0 25px 64px rgba(5,150,105,0.16);
    --ps-shadow-green: 0 8px 32px rgba(5,150,105,0.22);
    --ps-radius-sm:   8px;
    --ps-radius-md:   14px;
    --ps-radius-lg:   20px;
    --ps-radius-xl:   28px;
    --ps-radius-full: 9999px;
    --ps-transition:  cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.90); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes pulse-green {
    0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.3); }
    50%      { box-shadow: 0 0 0 8px rgba(5,150,105,0); }
  }
  @keyframes bounceIn {
    0%   { transform: scale(0.3); opacity: 0; }
    50%  { transform: scale(1.06); }
    70%  { transform: scale(0.92); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes gradientMove {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ── Card hover ─────────────────────────────────────── */
  .ps-card-hover {
    transition: all 0.4s var(--ps-transition);
    will-change: transform;
  }
  .ps-card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 64px rgba(5,150,105,0.14) !important;
  }

  /* ── Focus ring ─────────────────────────────────────── */
  .ps-focus-ring:focus-visible {
    outline: 2px solid var(--ps-green-600);
    outline-offset: 2px;
  }

  /* ── Line clamps ────────────────────────────────────── */
  .ps-line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .ps-line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Scrollbars ─────────────────────────────────────── */
  .ps-scrollbar-hidden::-webkit-scrollbar { display: none; }
  .ps-scrollbar-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* ── Primary button ─────────────────────────────────── */
  .ps-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s var(--ps-transition);
    box-shadow: var(--ps-shadow-green);
    position: relative;
    overflow: hidden;
  }
  .ps-btn-primary::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 0; height: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    transform: translate(-50%, -50%);
    transition: width 0.5s, height 0.5s;
  }
  .ps-btn-primary:hover::before { width: 320px; height: 320px; }
  .ps-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 14px 44px rgba(5,150,105,0.36);
  }
  .ps-btn-primary:active { transform: translateY(0) scale(0.98); }

  /* ── Shimmer skeleton ───────────────────────────────── */
  .ps-shimmer {
    background: linear-gradient(110deg,
      #d1fae5 8%, #ecfdf5 18%, #d1fae5 33%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease infinite;
  }

  /* ── Responsive grid ────────────────────────────────── */
  @media (max-width: 1200px) {
    .ps-posts-grid { grid-template-columns: repeat(2,1fr) !important; }
  }
  @media (max-width: 1024px) {
    .ps-featured-card { grid-template-columns: 1fr !important; }
    .ps-featured-image { min-height: 280px !important; height: 280px !important; }
    .ps-featured-content { padding: 32px !important; }
  }
  @media (max-width: 768px) {
    .ps-posts-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
    .ps-featured-title { font-size: 22px !important; }
    .ps-section-title  { font-size: 22px !important; }
    .ps-newsletter { padding: 36px 20px !important; }
    .ps-filter-row { flex-direction: column !important; align-items: stretch !important; }
    .ps-search-wrap { max-width: 100% !important; }
  }
  @media (max-width: 480px) {
    .ps-featured-content { padding: 22px !important; }
    .ps-post-content     { padding: 18px !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════
   UTILITY: window size hook
   ═══════════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    let t;
    const fn = () => {
      clearTimeout(t);
      t = setTimeout(() => setWidth(window.innerWidth), 120);
    };
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("resize", fn); clearTimeout(t); };
  }, []);
  return width;
};

/* ═══════════════════════════════════════════════════════
   UTILITY: reading-time icon
   ═══════════════════════════════════════════════════════ */
const readIcon = (rt) => {
  const m = parseInt(rt) || 5;
  if (m <= 3) return <FiZap size={11} />;
  if (m <= 7) return <FiCoffee size={11} />;
  return <FiBookOpen size={11} />;
};

/* ═══════════════════════════════════════════════════════
   UTILITY: format backend date
   ═══════════════════════════════════════════════════════ */
const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return ""; }
};

/* ═══════════════════════════════════════════════════════
   UTILITY: normalise a raw backend post row
   ═══════════════════════════════════════════════════════ */
const normalise = (p) => ({
  id: p.id,
  slug: p.slug,
  title: p.title || "Untitled",
  excerpt: p.excerpt || "",
  image: p.image_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  author: p.author_name || "Altuvera Team",
  authorImage: p.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author_name || "A")}&background=059669&color=fff`,
  date: fmtDate(p.published_at || p.created_at),
  readTime: p.read_time ? `${p.read_time} min read` : "5 min read",
  category: p.category || "General",
  tags: Array.isArray(p.tags) ? p.tags : [],
  views: p.view_count || 0,
  likes: p.like_count || 0,
  featured: p.is_featured || false,
});

/* ═══════════════════════════════════════════════════════
   PILL
   ═══════════════════════════════════════════════════════ */
const Pill = ({
  children, icon, active = false,
  onClick, variant = "default", size = "md",
}) => {
  const sz = {
    sm: { padding: "4px 10px", fontSize: "11px", gap: "4px" },
    md: { padding: "7px 16px", fontSize: "13px", gap: "6px" },
    lg: { padding: "10px 22px", fontSize: "14px", gap: "8px" },
  }[size];

  const v = {
    default: {
      backgroundColor: active ? "#059669" : "white",
      color: active ? "white" : "#374151",
      border: active ? "2px solid #059669" : "2px solid #E5E7EB",
      boxShadow: active ? "var(--ps-shadow-green)" : "var(--ps-shadow-sm)",
    },
    green: {
      backgroundColor: "#ECFDF5",
      color: "#059669",
      border: "1px solid #D1FAE5",
    },
    solid: {
      background: "linear-gradient(135deg,#059669,#047857)",
      color: "white", border: "none",
    },
    glass: {
      backgroundColor: "rgba(255,255,255,0.14)",
      backdropFilter: "blur(12px)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.18)",
    },
  }[variant] || {};

  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={onClick ? "ps-focus-ring" : ""}
      onKeyDown={(e) => { if (onClick && e.key === "Enter") onClick(); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--ps-radius-full)",
        fontWeight: "600",
        letterSpacing: "0.3px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s var(--ps-transition)",
        whiteSpace: "nowrap",
        ...sz, ...v,
      }}
      onMouseOver={(e) => {
        if (onClick && !active) {
          e.currentTarget.style.transform = "translateY(-1px) scale(1.03)";
          if (variant === "default") {
            e.currentTarget.style.borderColor = "#059669";
            e.currentTarget.style.color = "#059669";
          }
        }
      }}
      onMouseOut={(e) => {
        if (onClick && !active) {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          if (variant === "default") {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.color = "#374151";
          }
        }
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════
   SKELETON CARD
   ═══════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div style={{
    backgroundColor: "white",
    borderRadius: "var(--ps-radius-xl)",
    overflow: "hidden",
    boxShadow: "var(--ps-shadow-sm)",
    border: "1px solid #F3F4F6",
  }}>
    <div className="ps-shimmer" style={{ height: 220 }} />
    <div style={{ padding: 24 }}>
      <div className="ps-shimmer" style={{ width: 80, height: 22, borderRadius: 30, marginBottom: 14 }} />
      <div className="ps-shimmer" style={{ width: "90%", height: 20, borderRadius: 6, marginBottom: 8 }} />
      <div className="ps-shimmer" style={{ width: "65%", height: 20, borderRadius: 6, marginBottom: 14 }} />
      <div className="ps-shimmer" style={{ width: "100%", height: 13, borderRadius: 4, marginBottom: 5 }} />
      <div className="ps-shimmer" style={{ width: "80%", height: 13, borderRadius: 4, marginBottom: 18 }} />
      <div style={{ display: "flex", gap: 10, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
        <div className="ps-shimmer" style={{ width: 38, height: 38, borderRadius: "50%" }} />
        <div>
          <div className="ps-shimmer" style={{ width: 100, height: 13, borderRadius: 4, marginBottom: 4 }} />
          <div className="ps-shimmer" style={{ width: 140, height: 11, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonListCard = () => (
  <div style={{
    display: "grid", gridTemplateColumns: "260px 1fr",
    backgroundColor: "white", borderRadius: "var(--ps-radius-xl)",
    overflow: "hidden", boxShadow: "var(--ps-shadow-sm)",
    border: "1px solid #F3F4F6",
  }}>
    <div className="ps-shimmer" style={{ minHeight: 180 }} />
    <div style={{ padding: 28 }}>
      <div className="ps-shimmer" style={{ width: 80, height: 22, borderRadius: 30, marginBottom: 14 }} />
      <div className="ps-shimmer" style={{ width: "85%", height: 20, borderRadius: 6, marginBottom: 8 }} />
      <div className="ps-shimmer" style={{ width: "60%", height: 20, borderRadius: 6, marginBottom: 14 }} />
      <div className="ps-shimmer" style={{ width: "100%", height: 13, borderRadius: 4, marginBottom: 5 }} />
      <div className="ps-shimmer" style={{ width: "75%", height: 13, borderRadius: 4 }} />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════ */
const ErrorState = ({ message, onRetry }) => (
  <div style={{
    textAlign: "center", padding: "60px 24px",
    animation: "fadeUp 0.4s ease",
  }}>
    <div style={{
      width: 90, height: 90, borderRadius: "50%",
      background: "linear-gradient(135deg,#FEF2F2,#FEE2E2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      <FiAlertCircle size={38} color="#EF4444" />
    </div>
    <h3 style={{
      fontFamily: "'Playfair Display', serif", fontSize: 22,
      color: "#111827", marginBottom: 8,
    }}>Failed to Load Articles</h3>
    <p style={{ color: "#6B7280", marginBottom: 24, lineHeight: 1.6 }}>
      {message || "Something went wrong. Please try again."}
    </p>
    <button
      onClick={onRetry}
      className="ps-btn-primary ps-focus-ring"
      style={{
        padding: "12px 28px", borderRadius: "var(--ps-radius-full)",
        fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8,
      }}
    >
      <FiRefreshCw size={15} /> Try Again
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════ */
const EmptyState = ({ onClear }) => (
  <div style={{
    textAlign: "center", padding: "80px 24px",
    animation: "fadeUp 0.4s ease",
  }}>
    <div style={{
      width: 100, height: 100, borderRadius: "50%",
      background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 24px",
      animation: "float 3s ease infinite",
    }}>
      <FiSearch size={40} color="#059669" />
    </div>
    <h3 style={{
      fontFamily: "'Playfair Display', serif", fontSize: 24,
      color: "#111827", marginBottom: 8,
    }}>No Articles Found</h3>
    <p style={{ color: "#6B7280", marginBottom: 24, lineHeight: 1.6 }}>
      Try adjusting your search or filter criteria.
    </p>
    <button
      onClick={onClear}
      className="ps-btn-primary ps-focus-ring"
      style={{
        padding: "12px 28px", borderRadius: "var(--ps-radius-full)", fontSize: 14,
      }}
    >
      Clear All Filters
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   POST CARD — GRID VIEW
   ═══════════════════════════════════════════════════════ */
const GridCard = ({ post, index, isBookmarked, onBookmark }) => {
  const [liked, setLiked] = useState(false);
  const [imgOk, setImgOk] = useState(false);

  return (
    <div style={{ position: "relative", animation: `slideUp 0.4s ease ${index * 0.06}s both` }}>
      <Link to={`/post/${post.slug}`} style={{ textDecoration: "none" }}>
        <div
          className="ps-card-hover"
          style={{
            backgroundColor: "white",
            borderRadius: "var(--ps-radius-xl)",
            overflow: "hidden",
            boxShadow: "var(--ps-shadow-sm)",
            border: "1px solid #F3F4F6",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Image */}
          <div style={{ overflow: "hidden", position: "relative", flexShrink: 0 }}>
            {!imgOk && (
              <div className="ps-shimmer" style={{
                height: 220, position: "absolute", inset: 0, zIndex: 1,
              }} />
            )}
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              onLoad={() => setImgOk(true)}
              style={{
                height: 220, width: "100%", objectFit: "cover", display: "block",
                transition: "transform 0.6s var(--ps-transition)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            {/* overlay */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
              background: "linear-gradient(transparent,rgba(0,0,0,0.28))",
              pointerEvents: "none",
            }} />
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              <Pill variant="green" size="sm" icon={<FiTag size={10} />}>
                {post.category}
              </Pill>
            </div>
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <Pill variant="glass" size="sm" icon={readIcon(post.readTime)}>
                {post.readTime}
              </Pill>
            </div>
            {post.featured && (
              <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                <Pill variant="solid" size="sm" icon={<FiStar size={10} />}>
                  Featured
                </Pill>
              </div>
            )}
          </div>

          {/* Body */}
          <div
            className="ps-post-content"
            style={{ padding: "22px 22px 18px", flex: 1, display: "flex", flexDirection: "column" }}
          >
            <h3
              className="ps-line-clamp-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 19, fontWeight: 700, color: "#111827",
                marginBottom: 9, lineHeight: 1.35, letterSpacing: "-0.01em",
              }}
            >
              {post.title}
            </h3>
            <p
              className="ps-line-clamp-3"
              style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.7, marginBottom: 16, flex: 1 }}
            >
              {post.excerpt}
            </p>

            {/* Stats row */}
            <div style={{
              display: "flex", gap: 12, marginBottom: 14,
            }}>
              {[
                { icon: <FiEye size={12} />, val: post.views },
                { icon: <FiHeart size={12} />, val: post.likes },
              ].map((s, i) => (
                <span key={i} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 12, color: "#9CA3AF",
                }}>
                  {s.icon} {s.val}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 14, borderTop: "1px solid #F3F4F6",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src={post.authorImage} alt={post.author}
                  style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #ECFDF5" }}
                />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>{post.author}</div>
                  <div style={{ fontSize: 11.5, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 3 }}>
                    <FiCalendar size={10} /> {post.date}
                  </div>
                </div>
              </div>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                color: "#059669", fontSize: 12.5, fontWeight: 600,
              }}>
                Read <FiArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div style={{
        position: "absolute", bottom: 78, right: 12,
        display: "flex", flexDirection: "column", gap: 6, zIndex: 5,
      }}>
        {[
          {
            label: "Like",
            icon: <FiHeart size={13} fill={liked ? "#EF4444" : "none"} />,
            color: liked ? "#EF4444" : "#9CA3AF",
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); setLiked((p) => !p); },
          },
          {
            label: "Bookmark",
            icon: <FiBookmark size={13} fill={isBookmarked ? "#059669" : "none"} />,
            color: isBookmarked ? "#059669" : "#9CA3AF",
            onClick: (e) => { e.preventDefault(); e.stopPropagation(); onBookmark?.(post.id); },
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="ps-focus-ring"
            aria-label={btn.label}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(0,0,0,0.06)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.25s", color: btn.color,
              boxShadow: "var(--ps-shadow-sm)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.18)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   POST CARD — LIST VIEW
   ═══════════════════════════════════════════════════════ */
const ListCard = ({ post, index }) => (
  <Link to={`/post/${post.slug}`} style={{ textDecoration: "none" }}>
    <div
      className="ps-card-hover"
      style={{
        display: "grid",
        gridTemplateColumns: "clamp(200px,28%,300px) 1fr",
        backgroundColor: "white",
        borderRadius: "var(--ps-radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--ps-shadow-sm)",
        border: "1px solid #F3F4F6",
        animation: `slideUp 0.4s ease ${index * 0.05}s both`,
      }}
    >
      <div style={{ overflow: "hidden", position: "relative" }}>
        <img
          src={post.image} alt={post.title} loading="lazy"
          style={{
            width: "100%", height: "100%", minHeight: 190,
            objectFit: "cover",
            transition: "transform 0.6s var(--ps-transition)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <Pill variant="green" size="sm" icon={<FiTag size={10} />}>{post.category}</Pill>
        </div>
      </div>

      <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 21, fontWeight: 700, color: "#111827",
          marginBottom: 9, lineHeight: 1.35,
        }}>
          {post.title}
        </h3>
        <p className="ps-line-clamp-2" style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 14 }}>
          {post.excerpt}
        </p>

        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          {[
            { icon: <FiEye size={12} />, v: post.views },
            { icon: <FiHeart size={12} />, v: post.likes },
            { icon: <FiClock size={12} />, v: post.readTime },
          ].map((s, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9CA3AF" }}>
              {s.icon} {s.v}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={post.authorImage} alt={post.author}
              style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #ECFDF5" }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{post.author}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{post.date}</div>
            </div>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669", fontSize: 13, fontWeight: 600 }}>
            Read More <FiArrowRight size={13} />
          </span>
        </div>
      </div>
    </div>
  </Link>
);

/* ═══════════════════════════════════════════════════════
   FEATURED POST CARD
   ═══════════════════════════════════════════════════════ */
const FeaturedCard = ({ post }) => (
  <Link to={`/post/${post.slug}`} style={{ textDecoration: "none" }}>
    <div
      className="ps-featured-card ps-card-hover"
      style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        backgroundColor: "white",
        borderRadius: "var(--ps-radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--ps-shadow-md)",
        border: "1px solid #F3F4F6",
        position: "relative",
      }}
    >
      {/* Image */}
      <div style={{ overflow: "hidden", position: "relative" }}>
        <img
          src={post.image} alt={post.title}
          className="ps-featured-image"
          style={{
            height: "100%", minHeight: 420, width: "100%", objectFit: "cover",
            transition: "transform 0.6s var(--ps-transition)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg,rgba(5,150,105,0.12),transparent)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <Pill variant="solid" size="md" icon={<FiStar size={12} />}>Featured</Pill>
        </div>
      </div>

      {/* Content */}
      <div
        className="ps-featured-content"
        style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}
      >
        <Pill variant="green" size="md" icon={<FiTag size={11} />}>{post.category}</Pill>

        <h3
          className="ps-featured-title"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28, fontWeight: 800, color: "#111827",
            marginTop: 18, marginBottom: 12, lineHeight: 1.25, letterSpacing: "-0.02em",
          }}
        >
          {post.title}
        </h3>

        <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.75, marginBottom: 22 }}>
          {post.excerpt}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
          {[
            { icon: <FiCalendar size={13} />, t: post.date },
            { icon: <FiClock size={13} />, t: post.readTime },
            { icon: <FiEye size={13} />, t: `${post.views} views` },
          ].map((m, i) => (
            <span key={i} style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 13, color: "#9CA3AF", fontWeight: 500,
            }}>
              {m.icon} {m.t}
            </span>
          ))}
        </div>

        {/* Author */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 26,
          padding: "12px 16px",
          backgroundColor: "#F8FFFE",
          borderRadius: "var(--ps-radius-md)",
          border: "1px solid #ECFDF5",
        }}>
          <img
            src={post.authorImage} alt={post.author}
            style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #D1FAE5" }}
          />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{post.author}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>Travel Writer</div>
          </div>
        </div>

        <span
          className="ps-btn-primary"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "13px 28px", borderRadius: "var(--ps-radius-full)",
            fontSize: 14, width: "fit-content",
          }}
        >
          Read Full Article <FiArrowRight size={15} />
        </span>
      </div>
    </div>
  </Link>
);

/* ═══════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════ */
const StatCard = ({ icon, value, label }) => (
  <div
    style={{
      flex: "1 1 180px",
      display: "flex", alignItems: "center", gap: 14,
      padding: "16px 20px",
      backgroundColor: "white",
      borderRadius: "var(--ps-radius-lg)",
      border: "1px solid #ECFDF5",
      boxShadow: "var(--ps-shadow-sm)",
      transition: "all 0.3s var(--ps-transition)",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "var(--ps-shadow-md)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "var(--ps-shadow-sm)";
    }}
  >
    <div style={{
      width: 42, height: 42, borderRadius: 13,
      background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#059669", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 21, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const Posts = () => {
  /* ── Remote data ─────────────────────────────────────── */
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  /* ── UI state ────────────────────────────────────────── */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("created");
  const [viewMode, setViewMode] = useState("grid");
  const [bookmarks, setBookmarks] = useState(new Set());
  const [backToTop, setBackToTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const POSTS_PER_PAGE = 9;
  const w = useWindowSize();
  const isMobile = w < 768;

  /* ── Fetch posts from backend ────────────────────────── */
  const fetchPosts = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        sort,
        ...(category !== "all" && { category }),
        ...(search.trim() && { search: search.trim() }),
      });

      const res = await apiFetch(`/posts?${params}`, { signal });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();

      const raw = json?.data || json?.posts || json || [];
      setPosts(Array.isArray(raw) ? raw.map(normalise) : []);
      setTotalCount(json?.totalCount || json?.total || raw.length || 0);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sort, category, search, retryKey]); // eslint-disable-line

  /* ── Fetch categories ────────────────────────────────── */
  const fetchCategories = useCallback(async (signal) => {
    try {
      const res = await apiFetch("/posts/categories", { signal });
      if (!res.ok) return;
      const json = await res.json();
      const rows = json?.data || [];
      setCategories(rows.map((r) => r.category).filter(Boolean));
    } catch { /* silent */ }
  }, []);

  /* ── Fetch blog stats ────────────────────────────────── */
  const fetchStats = useCallback(async (signal) => {
    try {
      const res = await apiFetch("/posts/stats", { signal });
      if (!res.ok) return;
      const json = await res.json();
      setStats(json?.data || null);
    } catch { /* silent */ }
  }, []);

  /* ── Initial data load ───────────────────────────────── */
  useEffect(() => {
    const ac = new AbortController();
    fetchCategories(ac.signal);
    fetchStats(ac.signal);
    return () => ac.abort();
  }, [fetchCategories, fetchStats]);

  /* ── Posts refetch on deps change ───────────────────── */
  useEffect(() => {
    const ac = new AbortController();
    fetchPosts(ac.signal);
    return () => ac.abort();
  }, [fetchPosts]);

  /* ── Reset page when filters change ─────────────────── */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sort]);

  /* ── Back-to-top ─────────────────────────────────────── */
  useEffect(() => {
    const fn = () => setBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Bookmark toggle ─────────────────────────────────── */
  const toggleBookmark = useCallback((id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ── Newsletter ──────────────────────────────────────── */
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3200);
  };

  /* ── Derived ─────────────────────────────────────────── */
  const featuredPost = useMemo(() => posts.find((p) => p.featured), [posts]);
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const displayPosts = useMemo(() => {
    if (search.trim() || category !== "all") return posts;
    return featuredPost ? posts.filter((p) => !p.featured) : posts;
  }, [posts, featuredPost, search, category]);

  /* ── Stat values ─────────────────────────────────────── */
  const statItems = [
    { icon: <FiFeather size={17} />, value: stats?.total_published ?? "…", label: "Articles Published" },
    { icon: <FiUser size={17} />, value: stats?.total_featured ?? "…", label: "Featured Posts" },
    { icon: <FiTag size={17} />, value: stats?.total_categories ?? categories.length ?? "…", label: "Categories" },
    { icon: <FiEye size={17} />, value: stats?.total_views ?? "…", label: "Total Views" },
  ];

  /* ════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════ */
  return (
    <div style={{ backgroundColor: "var(--ps-off-white)", minHeight: "100vh" }}>
      <style>{globalStyles}</style>

      <PageHeader
        title="Travel Journal"
        subtitle="Stories, guides and inspiration from East Africa's most experienced travelers"
        backgroundImage="https://i.pinimg.com/1200x/01/4e/6b/014e6b237eb7a5b6f7c70cd9b8b5b253.jpg"
        breadcrumbs={[{ label: "Posts" }]}
      />

      <section style={{
        padding: isMobile ? "28px 16px 72px" : "56px 24px 112px",
        maxWidth: 1280, margin: "0 auto",
      }}>

        {/* ════ STATS BAR ════ */}
        <AnimatedSection animation="fadeInUp">
          <div style={{
            display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap",
          }}>
            {statItems.map((s, i) => (
              <StatCard key={i} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </div>
        </AnimatedSection>

        {/* ════ FILTER BAR ════ */}
        <AnimatedSection animation="fadeInUp">
          <div
            className="ps-filter-row"
            style={{
              display: "flex", gap: 14, marginBottom: 36,
              alignItems: "center", flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div
              className="ps-search-wrap"
              style={{ position: "relative", flex: "1 1 300px", maxWidth: isMobile ? "100%" : 400 }}
            >
              <FiSearch size={17} style={{
                position: "absolute", left: 15, top: "50%",
                transform: "translateY(-50%)", color: "#9CA3AF",
              }} />
              <input
                type="text"
                placeholder="Search articles, authors, topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-focus-ring"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "13px 42px 13px 46px",
                  borderRadius: "var(--ps-radius-full)",
                  border: "2px solid #E5E7EB",
                  backgroundColor: "white", fontSize: 13.5,
                  color: "#374151", outline: "none",
                  transition: "all 0.3s var(--ps-transition)",
                  boxShadow: "var(--ps-shadow-sm)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.boxShadow = "var(--ps-shadow-sm)";
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "#9CA3AF", padding: 3,
                    display: "flex", transition: "color 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  <FiX size={15} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div
              className="ps-scrollbar-hidden"
              style={{ display: "flex", gap: 8, overflowX: "auto", flexWrap: "nowrap" }}
            >
              <Pill
                active={category === "all"}
                onClick={() => setCategory("all")}
                size="md"
              >
                All
              </Pill>
              {categories.map((c) => (
                <Pill
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                  size="md"
                >
                  {c}
                </Pill>
              ))}
            </div>

            {/* Controls */}
            <div style={{
              display: "flex", gap: 8, alignItems: "center",
              marginLeft: isMobile ? 0 : "auto",
            }}>
              {/* Sort */}
              <div style={{ position: "relative" }}>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="ps-focus-ring"
                  style={{
                    padding: "9px 34px 9px 12px",
                    borderRadius: "var(--ps-radius-sm)",
                    border: "2px solid #E5E7EB",
                    backgroundColor: "white",
                    fontSize: 13, fontWeight: 600, color: "#374151",
                    cursor: "pointer", outline: "none", appearance: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#059669")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="created">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="views">Most Viewed</option>
                  <option value="likes">Most Liked</option>
                  <option value="title">A → Z</option>
                </select>
                <FiChevronDown size={13} style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none",
                }} />
              </div>

              {/* View toggle */}
              <div style={{
                display: "flex", padding: 4,
                backgroundColor: "#F3F4F6", borderRadius: "var(--ps-radius-sm)",
              }}>
                {[
                  { mode: "grid", icon: <FiGrid size={15} /> },
                  { mode: "list", icon: <FiList size={15} /> },
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="ps-focus-ring"
                    style={{
                      width: 34, height: 34, borderRadius: 6,
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: viewMode === mode ? "white" : "transparent",
                      color: viewMode === mode ? "#059669" : "#9CA3AF",
                      boxShadow: viewMode === mode ? "var(--ps-shadow-sm)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Search results info */}
        {search && !loading && (
          <div style={{
            marginBottom: 22,
            padding: "11px 18px",
            backgroundColor: "#ECFDF5",
            borderRadius: "var(--ps-radius-md)",
            display: "flex", alignItems: "center", gap: 8,
            animation: "slideUp 0.3s ease",
            border: "1px solid #D1FAE5",
          }}>
            <FiSearch size={13} color="#059669" />
            <span style={{ fontSize: 13.5, color: "#065F46" }}>
              Found <strong>{totalCount}</strong> result{totalCount !== 1 ? "s" : ""} for "{search}"
            </span>
            <button
              onClick={() => { setSearch(""); setCategory("all"); }}
              style={{
                marginLeft: "auto", background: "none", border: "none",
                cursor: "pointer", color: "#059669", fontSize: 12.5,
                fontWeight: 600, textDecoration: "underline",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* ════ FEATURED POST ════ */}
        {featuredPost && category === "all" && !search && !loading && (
          <AnimatedSection animation="fadeInUp">
            <div style={{ marginBottom: 52 }}>
              {/* Section heading */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: "linear-gradient(135deg,#059669,#047857)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white",
                }}>
                  <FiStar size={18} />
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em",
                  }}>
                    Featured Article
                  </h2>
                  <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>Editor's pick</p>
                </div>
              </div>
              <FeaturedCard post={featuredPost} />
            </div>
          </AnimatedSection>
        )}

        {/* ════ ARTICLES SECTION HEADING ════ */}
        <AnimatedSection animation="fadeInUp">
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 22, flexWrap: "wrap", gap: 10,
          }}>
            <h2
              className="ps-section-title"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em",
              }}
            >
              {category === "all" ? "All Articles" : category}
            </h2>
            {!loading && (
              <span style={{
                fontSize: 13, color: "#9CA3AF", fontWeight: 500,
                padding: "4px 12px", backgroundColor: "#F3F4F6",
                borderRadius: "var(--ps-radius-full)",
              }}>
                {totalCount} article{totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* ── Loading ── */}
          {loading ? (
            viewMode === "list" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonListCard key={i} />)}
              </div>
            ) : (
              <div
                className="ps-posts-grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}
              >
                {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )
          ) : error ? (
            <ErrorState message={error} onRetry={() => setRetryKey((k) => k + 1)} />
          ) : displayPosts.length === 0 ? (
            <EmptyState onClear={() => { setSearch(""); setCategory("all"); }} />
          ) : viewMode === "list" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {displayPosts.map((p, i) => (
                <ListCard key={p.id} post={p} index={i} />
              ))}
            </div>
          ) : (
            <div
              className="ps-posts-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}
            >
              {displayPosts.map((p, i) => (
                <GridCard
                  key={p.id}
                  post={p}
                  index={i}
                  isBookmarked={bookmarks.has(p.id)}
                  onBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </AnimatedSection>

        {/* ════ PAGINATION ════ */}
        {!loading && !error && totalPages > 1 && (
          <AnimatedSection animation="fadeInUp">
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              gap: 8, marginTop: 48, flexWrap: "wrap",
            }}>
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="ps-focus-ring"
                style={{
                  width: 40, height: 40, borderRadius: "var(--ps-radius-sm)",
                  border: "1px solid #E5E7EB", backgroundColor: "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: currentPage === 1 ? "#D1D5DB" : "#374151",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => { if (currentPage !== 1) { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; } }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = currentPage === 1 ? "#D1D5DB" : "#374151"; }}
              >
                <FiChevronLeft size={17} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`dots-${idx}`} style={{ padding: "0 6px", color: "#9CA3AF", fontSize: 14 }}>…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className="ps-focus-ring"
                      style={{
                        width: 40, height: 40, borderRadius: "var(--ps-radius-sm)",
                        border: item === currentPage ? "2px solid #059669" : "1px solid #E5E7EB",
                        backgroundColor: item === currentPage ? "#059669" : "white",
                        color: item === currentPage ? "white" : "#374151",
                        cursor: "pointer", fontSize: 13.5,
                        fontWeight: item === currentPage ? 700 : 500,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                        boxShadow: item === currentPage ? "0 4px 14px rgba(5,150,105,0.28)" : "none",
                      }}
                      onMouseOver={(e) => { if (item !== currentPage) { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; } }}
                      onMouseOut={(e) => { if (item !== currentPage) { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; } }}
                    >
                      {item}
                    </button>
                  )
                )}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ps-focus-ring"
                style={{
                  width: 40, height: 40, borderRadius: "var(--ps-radius-sm)",
                  border: "1px solid #E5E7EB", backgroundColor: "white",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: currentPage === totalPages ? "#D1D5DB" : "#374151",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; } }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = currentPage === totalPages ? "#D1D5DB" : "#374151"; }}
              >
                <FiChevronRight size={17} />
              </button>
            </div>

            {/* Page info */}
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#9CA3AF", marginTop: 12 }}>
              Page {currentPage} of {totalPages} · {totalCount} articles
            </p>
          </AnimatedSection>
        )}

        {/* ════ NEWSLETTER ════ */}
        <AnimatedSection animation="fadeInUp">
          <div
            className="ps-newsletter"
            style={{
              marginTop: 76,
              padding: isMobile ? "40px 22px" : "56px 48px",
              background: "linear-gradient(135deg,#064E3B 0%,#065F46 40%,#047857 100%)",
              borderRadius: "var(--ps-radius-xl)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative blobs */}
            {[
              { top: -80, right: -80, size: 240 },
              { bottom: -60, left: -60, size: 170 },
            ].map((b, i) => (
              <div key={i} style={{
                position: "absolute",
                top: b.top, bottom: b.bottom,
                left: b.left, right: b.right,
                width: b.size, height: b.size,
                borderRadius: "50%",
                background: "rgba(52,211,153,0.07)",
                pointerEvents: "none",
              }} />
            ))}

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 62, height: 62, borderRadius: 18,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 22px",
                animation: "float 3s ease infinite",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                <FiMail size={27} color="#34D399" />
              </div>

              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isMobile ? 22 : 30,
                fontWeight: 800, color: "white",
                marginBottom: 10, letterSpacing: "-0.02em",
              }}>
                Never Miss a Story
              </h3>

              <p style={{
                fontSize: isMobile ? 13.5 : 15.5,
                color: "rgba(255,255,255,0.72)",
                maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7,
              }}>
                Get the latest travel stories, tips and exclusive content delivered
                straight to your inbox every week.
              </p>

              <form
                onSubmit={handleSubscribe}
                style={{
                  display: "flex", gap: 10,
                  maxWidth: 460, margin: "0 auto",
                  flexWrap: isMobile ? "wrap" : "nowrap",
                }}
              >
                <EmailAutocompleteInput
                  value={email}
                  onValueChange={setEmail}
                  placeholder="Enter your email address"
                  required
                  className="ps-focus-ring"
                  style={{
                    flex: 1,
                    padding: "13px 18px",
                    borderRadius: "var(--ps-radius-full)",
                    border: "2px solid rgba(255,255,255,0.18)",
                    backgroundColor: "rgba(255,255,255,0.09)",
                    color: "white", fontSize: 13.5, outline: "none",
                    transition: "border-color 0.3s",
                    backdropFilter: "blur(8px)",
                    minWidth: isMobile ? "100%" : "auto",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.55)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.18)")}
                />
                <button
                  type="submit"
                  className="ps-focus-ring"
                  style={{
                    padding: "13px 26px",
                    borderRadius: "var(--ps-radius-full)",
                    background: subscribed
                      ? "linear-gradient(135deg,#34D399,#10B981)"
                      : "linear-gradient(135deg,white,#F9FAFB)",
                    color: subscribed ? "white" : "#065F46",
                    border: "none", cursor: "pointer",
                    fontSize: 13.5, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 8,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
                    transition: "all 0.3s",
                    minWidth: isMobile ? "100%" : "auto",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) => { if (!subscribed) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.24)"; } }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.18)"; }}
                >
                  {subscribed
                    ? <><FiStar size={15} /> Subscribed!</>
                    : <><FiMail size={15} /> Subscribe</>}
                </button>
              </form>

              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.38)", marginTop: 14 }}>
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ════ BACK TO TOP ════ */}
      {backToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="ps-btn-primary ps-focus-ring"
          aria-label="Back to top"
          style={{
            position: "fixed", bottom: 30, right: 30,
            width: 50, height: 50, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 0,
            animation: "bounceIn 0.4s ease",
          }}
        >
          <FiArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default Posts;