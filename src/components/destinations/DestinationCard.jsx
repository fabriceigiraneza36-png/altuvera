// src/components/destinations/DestinationCard.jsx
import {
  useState, useEffect, useCallback, memo, useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin, FiClock, FiStar, FiHeart, FiShare2,
  FiArrowRight, FiAward, FiTrendingUp, FiZap,
  FiCalendar, FiUsers, FiWind,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const FALLBACK =
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85";

const BADGE_CFG = {
  isFeatured: {
    Icon: FiAward,
    label: "Featured",
    cls: "dc-badge--featured",
  },
  isNew: {
    Icon: FiZap,
    label: "New",
    cls: "dc-badge--new",
  },
  isPopular: {
    Icon: FiTrendingUp,
    label: "Popular",
    cls: "dc-badge--popular",
  },
};

const DIFF_CLS = {
  easy:        "dc-pill--easy",
  moderate:    "dc-pill--moderate",
  challenging: "dc-pill--challenging",
  difficult:   "dc-pill--difficult",
  expert:      "dc-pill--expert",
};

/* ─────────────────────────────────────────────────────────────
   INJECT STYLES (once)
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ── Keyframes ── */
@keyframes dc-heart-pop {
  0%,100%{ transform:scale(1) }
  30%    { transform:scale(1.4) }
  60%    { transform:scale(0.88) }
}
@keyframes dc-toast-in {
  0%  { opacity:0; transform:translateX(-50%) translateY(6px) }
  15% { opacity:1; transform:translateX(-50%) translateY(0)   }
  80% { opacity:1 }
  100%{ opacity:0; transform:translateX(-50%) translateY(-5px)}
}
@keyframes dc-shimmer {
  0%  { background-position:200% 0 }
  100%{ background-position:-200% 0 }
}
@keyframes dc-slide-up {
  from{ opacity:0; transform:translateY(8px) }
  to  { opacity:1; transform:translateY(0)   }
}
@keyframes dc-dot-pulse {
  0%,100%{ transform:scaleX(1) }
  50%    { transform:scaleX(1.6) }
}

/* ══════════════════════════════════════════════════════════
   CARD ROOT
══════════════════════════════════════════════════════════ */
.dc-card {
  font-family:'Inter',system-ui,sans-serif;
  position:relative;
  display:flex;flex-direction:column;
  height:100%;
  background:#fff;
  border-radius:24px;
  overflow:hidden;
  border:1.5px solid #e5e7eb;
  box-shadow:0 2px 8px rgba(0,0,0,.05),0 1px 3px rgba(0,0,0,.04);
  cursor:pointer;
  transition:
    border-color .35s cubic-bezier(.4,0,.2,1),
    box-shadow   .35s cubic-bezier(.4,0,.2,1),
    transform    .35s cubic-bezier(.4,0,.2,1);
  outline:none;
  isolation:isolate;
  will-change:transform,box-shadow;
}
.dc-card:focus-visible {
  outline:2px solid #059669;
  outline-offset:3px;
}
.dc-card:hover,
.dc-card--hovered {
  border-color:rgba(5,150,105,.3);
  box-shadow:
    0 20px 48px rgba(0,0,0,.09),
    0 8px 20px rgba(5,150,105,.1),
    0 1px 4px rgba(0,0,0,.06);
  transform:translateY(-7px);
}

/* ══════════════════════════════════════════════════════════
   IMAGE AREA
══════════════════════════════════════════════════════════ */
.dc-img-wrap {
  position:relative;
  padding-top:62%;
  flex-shrink:0;
  overflow:hidden;
  background:#f1f5f9;
}
.dc-card--compact .dc-img-wrap { padding-top:52%; }

.dc-img {
  position:absolute;
  inset:0;width:100%;height:100%;
  object-fit:cover;object-position:center;
  transition:
    opacity 1s ease,
    transform 7s cubic-bezier(.2,0,.2,1);
}
.dc-img--hidden {
  opacity:0;
  transform:scale(1.04);
}
.dc-img--active {
  opacity:1;
  transform:scale(1);
}
.dc-img--zoom {
  transform:scale(1.07) !important;
}

/* Overlay gradients */
.dc-img-grad {
  position:absolute;inset:0;z-index:1;
  pointer-events:none;
  background:linear-gradient(
    180deg,
    transparent 28%,
    rgba(0,0,0,.04) 50%,
    rgba(0,0,0,.52) 100%
  );
}
.dc-img-grad-top {
  position:absolute;top:0;left:0;right:0;height:140px;z-index:1;
  pointer-events:none;
  background:linear-gradient(
    180deg,
    rgba(0,0,0,.22) 0%,
    transparent 100%
  );
}

/* ── Badges ── */
.dc-badges {
  position:absolute;top:14px;left:14px;
  display:flex;flex-wrap:wrap;gap:6px;z-index:4;
}
.dc-badge {
  display:inline-flex;align-items:center;gap:4px;
  padding:5px 12px;border-radius:999px;
  font-size:11px;font-weight:700;letter-spacing:.01em;
  white-space:nowrap;
  animation:dc-slide-up .35s ease both;
}
.dc-badge--featured {
  background:linear-gradient(135deg,#059669,#047857);
  color:#fff;
  box-shadow:0 3px 10px rgba(5,150,105,.35);
}
.dc-badge--new {
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);
  color:#047857;
  box-shadow:0 2px 8px rgba(5,150,105,.12);
}
.dc-badge--popular {
  background:linear-gradient(135deg,#fef3c7,#fde68a);
  color:#92400e;
  box-shadow:0 2px 8px rgba(245,158,11,.18);
}
.dc-badge--eco {
  background:rgba(5,46,22,.82);
  color:#d1fae5;
  backdrop-filter:blur(6px);
}

/* ── Action buttons ── */
.dc-actions {
  position:absolute;top:14px;right:14px;
  display:flex;flex-direction:column;gap:8px;z-index:4;
}
.dc-icon-btn {
  width:40px;height:40px;border-radius:50%;border:none;
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(12px);
  display:grid;place-items:center;
  cursor:pointer;
  box-shadow:0 2px 10px rgba(0,0,0,.12);
  transition:
    transform .3s cubic-bezier(.34,1.56,.64,1),
    box-shadow .3s ease,
    background .2s ease;
  position:relative;
}
.dc-icon-btn:hover {
  transform:scale(1.16);
  box-shadow:0 6px 20px rgba(0,0,0,.18);
}
.dc-icon-btn--active {
  background:rgba(254,226,226,.96);
}
.dc-icon-btn--heart-anim {
  animation:dc-heart-pop .5s ease;
}
.dc-icon-btn--copied {
  background:rgba(236,253,245,.96);
}

/* Copy toast */
.dc-toast {
  position:absolute;
  top:calc(100% + 8px);
  left:50%;
  white-space:nowrap;
  background:#1f2937;
  color:#fff;
  font-size:11px;font-weight:700;
  padding:4px 10px;border-radius:6px;
  pointer-events:none;
  animation:dc-toast-in 2.3s ease forwards;
  z-index:10;
}

/* ── Image dots ── */
.dc-dots {
  position:absolute;bottom:72px;left:50%;
  transform:translateX(-50%);
  display:flex;align-items:center;gap:5px;
  z-index:4;
  padding:5px 10px;border-radius:20px;
  background:rgba(0,0,0,.24);
  backdrop-filter:blur(8px);
}
.dc-dot {
  height:5px;border-radius:3px;border:none;padding:0;
  background:rgba(255,255,255,.4);cursor:pointer;
  transition:all .35s ease;
}
.dc-dot--active {
  width:18px !important;
  background:#fff;
  animation:dc-dot-pulse .6s ease;
}

/* ── Title overlay ── */
.dc-title-ov {
  position:absolute;bottom:0;left:0;right:0;
  z-index:2;
  padding:40px 18px 18px;
  background:linear-gradient(transparent, rgba(0,0,0,.48));
}
.dc-title {
  margin:0;
  color:#fff;
  font-family:'Playfair Display',serif;
  font-size:clamp(17px,2vw,22px);
  font-weight:700;
  line-height:1.18;
  letter-spacing:-.01em;
  text-shadow:0 2px 8px rgba(0,0,0,.32);
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.dc-location {
  display:flex;align-items:center;gap:5px;
  color:rgba(255,255,255,.88);
  font-size:clamp(11px,1.2vw,13px);
  font-weight:500;
  margin-top:5px;
}
.dc-flag {
  margin-left:2px;line-height:1;
}

/* ══════════════════════════════════════════════════════════
   CARD BODY
══════════════════════════════════════════════════════════ */
.dc-body {
  padding:clamp(14px,2vw,22px);
  display:flex;flex-direction:column;
  flex:1;
  gap:clamp(10px,1.4vw,14px);
}

/* ── Rating row ── */
.dc-rating-row {
  display:flex;justify-content:space-between;
  align-items:center;flex-wrap:wrap;gap:8px;
}
.dc-stars {
  display:flex;align-items:center;gap:5px;
}
.dc-stars__icons { display:flex;gap:2px; }
.dc-stars__score {
  font-weight:700;color:#111827;font-size:14px;
}
.dc-stars__count {
  color:#9ca3af;font-size:12px;
}

/* ── Pill row ── */
.dc-pills {
  display:flex;align-items:center;gap:6px;flex-wrap:wrap;
}
.dc-pill {
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:999px;
  font-size:11px;font-weight:700;white-space:nowrap;
}
.dc-pill--duration {
  background:#f0fdf4;color:#059669;border:1px solid #d1fae5;
}
.dc-pill--category {
  background:#f9fafb;color:#6b7280;border:1px solid #f3f4f6;
  text-transform:capitalize;
}
.dc-pill--easy        { background:#d1fae5;color:#065f46; }
.dc-pill--moderate    { background:#fef3c7;color:#78350f; }
.dc-pill--challenging { background:#fee2e2;color:#7f1d1d; }
.dc-pill--difficult   { background:#ede9fe;color:#4c1d95; }
.dc-pill--expert      { background:#fce7f3;color:#831843; }

/* ── Description ── */
.dc-desc {
  color:#4b5563;
  font-size:clamp(12.5px,1.1vw,13.5px);
  line-height:1.72;
  margin:0;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

/* ── Highlights ── */
.dc-highlights {
  display:flex;flex-wrap:wrap;gap:5px;
}
.dc-hl-tag {
  background:#f0fdf4;
  color:#166534;
  border:1px solid #dcfce7;
  padding:3px 10px;
  border-radius:999px;
  font-size:11px;font-weight:600;
}
.dc-hl-more {
  background:#f9fafb;color:#9ca3af;
  border:1px solid #f3f4f6;
  padding:3px 10px;border-radius:999px;
  font-size:11px;font-weight:600;
}

/* ── Divider ── */
.dc-divider {
  height:1px;background:#f3f4f6;
  margin:0;border:none;flex-shrink:0;
}

/* ══════════════════════════════════════════════════════════
   CTA FOOTER
══════════════════════════════════════════════════════════ */
.dc-footer {
  display:flex;justify-content:space-between;
  align-items:center;gap:12px;
  margin-top:auto;
}

/* Explore button */
.dc-explore-btn {
  display:inline-flex;align-items:center;gap:7px;
  padding:clamp(10px,1.2vw,13px) clamp(16px,2vw,24px);
  border-radius:14px;border:none;
  background:linear-gradient(135deg,#10b981,#059669);
  color:#fff;
  font-weight:700;font-size:clamp(12px,1vw,13.5px);
  font-family:inherit;
  cursor:pointer;
  white-space:nowrap;flex-shrink:0;
  letter-spacing:.01em;
  box-shadow:0 3px 10px rgba(16,185,129,.22);
  transition:
    background .3s ease,
    box-shadow  .3s ease,
    transform   .3s cubic-bezier(.34,1.56,.64,1);
}
.dc-explore-btn:hover {
  background:linear-gradient(135deg,#059669,#047857);
  box-shadow:0 8px 22px rgba(16,185,129,.38);
  transform:scale(1.04);
}
.dc-explore-btn__arrow {
  transition:transform .3s ease;
}
.dc-explore-btn:hover .dc-explore-btn__arrow {
  transform:translateX(3px);
}

/* Book button */
.dc-book-btn {
  display:inline-flex;align-items:center;gap:6px;
  padding:clamp(10px,1.2vw,13px) clamp(14px,1.8vw,20px);
  border-radius:14px;
  border:1.5px solid #059669;
  background:#fff;
  color:#059669;
  font-weight:700;font-size:clamp(12px,1vw,13.5px);
  font-family:inherit;
  cursor:pointer;
  white-space:nowrap;flex-shrink:0;
  letter-spacing:.01em;
  transition:
    background .25s ease,
    color       .25s ease,
    box-shadow  .25s ease,
    transform   .3s cubic-bezier(.34,1.56,.64,1);
}
.dc-book-btn:hover {
  background:#059669;
  color:#fff;
  box-shadow:0 6px 18px rgba(5,150,105,.28);
  transform:scale(1.04);
}

/* ══════════════════════════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════════════════════════ */
.dc-skeleton {
  background:#fff;
  border-radius:24px;
  overflow:hidden;
  border:1.5px solid #e5e7eb;
}
.dc-skeleton__img {
  width:100%;padding-top:62%;
  background:linear-gradient(90deg,#f3f4f6 0%,#e5e7eb 50%,#f3f4f6 100%);
  background-size:200%;
  animation:dc-shimmer 1.8s ease infinite;
}
.dc-skeleton__body { padding:20px;display:flex;flex-direction:column;gap:10px; }
.dc-skeleton__line {
  height:14px;border-radius:7px;
  background:linear-gradient(90deg,#f3f4f6 0%,#e5e7eb 50%,#f3f4f6 100%);
  background-size:200%;
  animation:dc-shimmer 1.8s ease infinite;
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width:640px) {
  .dc-body { padding:14px; }
  .dc-footer { flex-wrap:wrap; }
  .dc-explore-btn,
  .dc-book-btn { flex:1;justify-content:center; }
  .dc-title { font-size:17px; }
}
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc-styles")) return;
  const el = document.createElement("style");
  el.id    = "dc-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────────────────────────── */
function ImageSlider({ images, name, hovered }) {
  const [idx, setIdx]     = useState(0);
  const timerRef          = useRef(null);
  const totalRef          = useRef(images.length);
  totalRef.current        = images.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (totalRef.current <= 1) return;
    timerRef.current = setInterval(
      () => setIdx(p => (p + 1) % totalRef.current),
      4800
    );
  }, []);

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [startTimer]);

  const jump = useCallback((e, i) => {
    e.stopPropagation();
    setIdx(i);
    startTimer();
  }, [startTimer]);

  return (
    <>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          onError={e => { e.currentTarget.src = FALLBACK; }}
          className={[
            "dc-img",
            idx === i ? "dc-img--active" : "dc-img--hidden",
            hovered && idx === i ? "dc-img--zoom" : "",
          ].filter(Boolean).join(" ")}
        />
      ))}

      {images.length > 1 && (
        <div className="dc-dots">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => jump(e, i)}
              aria-label={`Image ${i + 1}`}
              className={`dc-dot${idx === i ? " dc-dot--active" : ""}`}
              style={{ width: idx === i ? 18 : 6 }}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   STARS
───────────────────────────────────────────────────────────── */
function Stars({ rating, count }) {
  const filled = Math.round((rating || 0) * 2) / 2;
  return (
    <div className="dc-stars">
      <div className="dc-stars__icons">
        {[1,2,3,4,5].map(s => (
          <FiStar
            key={s} size={13}
            color="#f59e0b"
            fill={s <= filled ? "#f59e0b" : "none"}
            style={{ flexShrink: 0 }}
          />
        ))}
      </div>
      <span className="dc-stars__score">
        {rating != null ? Number(rating).toFixed(1) : "New"}
      </span>
      {count > 0 && (
        <span className="dc-stars__count">
          ({count >= 1000 ? `${(count/1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ICON BUTTON
───────────────────────────────────────────────────────────── */
function IconBtn({ onClick, title, children, active, animating, copiedState }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={[
        "dc-icon-btn",
        active        ? "dc-icon-btn--active"     : "",
        animating     ? "dc-icon-btn--heart-anim"  : "",
        copiedState   ? "dc-icon-btn--copied"      : "",
      ].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────────── */
export function DestinationCardSkeleton() {
  useEffect(() => { injectStyles(); }, []);
  return (
    <div className="dc-skeleton">
      <div className="dc-skeleton__img" />
      <div className="dc-skeleton__body">
        <div className="dc-skeleton__line" style={{ width:"65%",height:18 }} />
        <div className="dc-skeleton__line" style={{ width:"40%" }} />
        <div className="dc-skeleton__line" style={{ width:"90%" }} />
        <div className="dc-skeleton__line" style={{ width:"75%" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CARD
───────────────────────────────────────────────────────────── */
const DestinationCard = memo(function DestinationCard({
  destination,
  compact      = false,
  priority     = false,
  onWishlistToggle,
}) {
  const navigate                    = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [hovered, setHovered]       = useState(false);
  const [copied,  setCopied]        = useState(false);
  const [heartAnim, setHeartAnim]   = useState(false);

  useEffect(() => { injectStyles(); }, []);

  if (!destination) return null;

  const {
    slug, id,
    name             = "Destination",
    images           = [],
    heroImage,
    location,
    country,
    countryFlag,
    duration,
    durationDays,
    rating           = 0,
    reviewCount      = 0,
    highlights       = [],
    shortDescription,
    description,
    isFeatured,
    isNew,
    isPopular,
    difficulty,
    category,
    isEcoFriendly,
  } = destination;

  /* Derive IDs — the booking wizard uses `String(d.id)` as value */
  const destId  = slug || id;          // for internal nav
  const bookId  = String(id || slug);  // for ?destination= param (wizard uses d.id)

  const isLiked  = isWishlisted(destId);
  const safeImgs = images.length > 0 ? images : [heroImage || FALLBACK];
  const activeBadges = Object.keys(BADGE_CFG).filter(k => destination[k]);

  const displayLocation = [location, country]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  /* ── Handlers ── */
  const goToDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate]
  );

  const goToBook = useCallback(
    (e) => {
      e.stopPropagation();
      /* Build query: destination id for auto-select, name for display */
      const params = new URLSearchParams();
      params.set("destination", bookId);
      if (name) params.set("destinationName", name);
      navigate(`/booking?${params.toString()}`);
    },
    [bookId, name, navigate]
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
          setTimeout(() => setCopied(false), 2300);
        }
      } catch { /* user cancelled */ }
    },
    [destId, name]
  );

  /* ── Render ── */
  return (
    <article
      onClick={goToDetail}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && goToDetail()}
      aria-label={`Explore ${name}`}
      className={[
        "dc-card",
        compact   ? "dc-card--compact" : "",
        hovered   ? "dc-card--hovered" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* ════ IMAGE AREA ════ */}
      <div className="dc-img-wrap">

        {/* Slides */}
        <ImageSlider images={safeImgs} name={name} hovered={hovered} />

        {/* Gradient overlays */}
        <div className="dc-img-grad-top" />
        <div className="dc-img-grad" />

        {/* Badges */}
        {(activeBadges.length > 0 || isEcoFriendly) && (
          <div className="dc-badges">
            {activeBadges.map(key => {
              const { Icon, label, cls } = BADGE_CFG[key];
              return (
                <span key={key} className={`dc-badge ${cls}`}>
                  <Icon size={10} /> {label}
                </span>
              );
            })}
            {isEcoFriendly && (
              <span className="dc-badge dc-badge--eco">🌿 Eco</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="dc-actions">
          {/* Wishlist */}
          <IconBtn
            onClick={handleWishlist}
            title={isLiked ? "Remove from wishlist" : "Save to wishlist"}
            active={isLiked}
            animating={heartAnim}
          >
            <FiHeart
              size={16}
              color={isLiked ? "#ef4444" : "#374151"}
              fill={isLiked ? "#ef4444" : "none"}
            />
          </IconBtn>

          {/* Share */}
          <div style={{ position: "relative" }}>
            <IconBtn
              onClick={handleShare}
              title="Share destination"
              copiedState={copied}
            >
              <FiShare2
                size={16}
                color={copied ? "#059669" : "#374151"}
              />
            </IconBtn>
            {copied && (
              <span className="dc-toast" style={{ transform:"translateX(-50%)" }}>
                ✓ Copied!
              </span>
            )}
          </div>
        </div>

        {/* Title overlay */}
        <div className="dc-title-ov">
          <h3 className="dc-title">{name}</h3>
          {displayLocation && (
            <div className="dc-location">
              <FiMapPin size={11} style={{ flexShrink:0 }} />
              <span>{displayLocation}</span>
              {countryFlag && (
                <span className="dc-flag">{countryFlag}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════ BODY ════ */}
      <div className="dc-body">

        {/* Rating + pills */}
        <div className="dc-rating-row">
          <Stars rating={rating} count={reviewCount} />
          <div className="dc-pills">
            {difficulty && (
              <span className={`dc-pill ${DIFF_CLS[difficulty] || DIFF_CLS.moderate}`}>
                <FiWind size={9} />
                {difficulty}
              </span>
            )}
            {(duration || durationDays) && (
              <span className="dc-pill dc-pill--duration">
                <FiClock size={10} />
                {duration || `${durationDays}d`}
              </span>
            )}
          </div>
        </div>

        {/* Category pill */}
        {category && !compact && (
          <div className="dc-pills">
            <span className="dc-pill dc-pill--category">
              {category.replace(/_/g, " ")}
            </span>
          </div>
        )}

        {/* Description */}
        {!compact && (
          <p className="dc-desc">
            {shortDescription || description ||
              "Experience unforgettable adventures, rich culture and breathtaking natural beauty."}
          </p>
        )}

        {/* Highlights */}
        {!compact && highlights.length > 0 && (
          <div className="dc-highlights">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="dc-hl-tag">{h}</span>
            ))}
            {highlights.length > 3 && (
              <span className="dc-hl-more">+{highlights.length - 3}</span>
            )}
          </div>
        )}

        <hr className="dc-divider" />

        {/* CTA Footer */}
        <div className="dc-footer">
          {/* Book Now */}
          <button
            className="dc-book-btn"
            onClick={goToBook}
            aria-label={`Book ${name}`}
          >
            <FiCalendar size={13} />
            Book Now
          </button>

          {/* Explore */}
          <button
            className="dc-explore-btn"
            onClick={e => { e.stopPropagation(); goToDetail(); }}
            aria-label={`Explore ${name}`}
          >
            Explore
            <FiArrowRight size={13} className="dc-explore-btn__arrow" />
          </button>
        </div>
      </div>
    </article>
  );
});

export default DestinationCard;