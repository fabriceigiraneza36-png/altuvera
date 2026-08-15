// src/components/destinations/DestinationCard.jsx
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiHeart,
  FiShare2,
  FiArrowRight,
  FiAward,
  FiTrendingUp,
  FiZap,
  FiCalendar,
  FiWind,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiSun,
  FiCamera,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const FALLBACK =
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85";

const BADGE_CFG = {
  isFeatured: { Icon: FiAward,      label: "Featured", cls: "dc-badge--featured" },
  isNew:      { Icon: FiZap,        label: "New",      cls: "dc-badge--new"      },
  isPopular:  { Icon: FiTrendingUp, label: "Trending", cls: "dc-badge--popular"  },
};

const DIFF_CFG = {
  easy:        { cls: "dc-diff--easy",        label: "Easy"        },
  moderate:    { cls: "dc-diff--moderate",    label: "Moderate"    },
  challenging: { cls: "dc-diff--challenging", label: "Challenging" },
  difficult:   { cls: "dc-diff--difficult",   label: "Difficult"   },
  expert:      { cls: "dc-diff--expert",      label: "Expert"      },
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

@keyframes dc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes dc-heart {
  0%   { transform: scale(1); }
  20%  { transform: scale(0.82); }
  45%  { transform: scale(1.32); }
  70%  { transform: scale(0.94); }
  100% { transform: scale(1); }
}
@keyframes dc-arrow {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(5px); }
}
@keyframes dc-toast {
  0%   { opacity: 0; transform: translateY(4px); }
  15%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes dc-badge-in {
  from { opacity: 0; transform: translateY(-5px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dc-spin {
  to { transform: rotate(360deg); }
}

.dc-card {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15,23,42,.06);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.4s cubic-bezier(0.22,1,0.36,1),
    box-shadow 0.4s cubic-bezier(0.22,1,0.36,1),
    border-color 0.4s cubic-bezier(0.22,1,0.36,1);
}
.dc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(15,23,42,.12), 0 6px 20px rgba(5,150,105,.10);
  border-color: rgba(5,150,105,0.25);
}
.dc-card:focus-visible {
  outline: 2.5px solid #059669;
  outline-offset: 3px;
}

.dc-img-wrap {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.dc-img-frame {
  position: relative;
  width: 100%;
  padding-top: 58%;
  overflow: hidden;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}
.dc-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.6s ease, transform 6s cubic-bezier(0.25,0,0.15,1);
  will-change: transform, opacity;
}
.dc-img--hidden  { opacity: 0; transform: scale(1.05); }
.dc-img--visible { opacity: 1; transform: scale(1); }
.dc-card:hover .dc-img--visible { transform: scale(1.07); }

.dc-img-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(15,23,42,.18) 0%,
    transparent 30%,
    transparent 52%,
    rgba(15,23,42,.65) 100%
  );
  z-index: 1;
}

.dc-img-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}
.dc-img-placeholder span {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.65;
}

.dc-nav {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-card:hover .dc-nav { opacity: 1; }

.dc-nav-btn {
  pointer-events: auto;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #334155;
  box-shadow: 0 2px 10px rgba(0,0,0,.12);
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
}
.dc-nav-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.dc-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  align-items: center;
  z-index: 4;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(15,23,42,.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dc-dot {
  height: 4px;
  border-radius: 2px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(255,255,255,.4);
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-dot--active {
  width: 18px !important;
  background: #fff;
}

.dc-photo-count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgba(255,255,255,.9);
  font-size: 10.5px;
  font-weight: 600;
}

.dc-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: dc-badge-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
  white-space: nowrap;
}
.dc-badge--featured {
  background: linear-gradient(135deg, rgba(16,185,129,.9), rgba(5,150,105,.9));
  color: #fff;
  box-shadow: 0 3px 10px rgba(5,150,105,.3);
}
.dc-badge--new {
  background: rgba(255,255,255,.88);
  color: #047857;
  border: 1px solid rgba(167,243,208,.6);
}
.dc-badge--popular {
  background: linear-gradient(135deg, rgba(251,191,36,.9), rgba(245,158,11,.9));
  color: #78350f;
  box-shadow: 0 3px 10px rgba(245,158,11,.25);
}
.dc-badge--eco {
  background: rgba(15,23,42,.65);
  color: #a7f3d0;
}

.dc-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.dc-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15,23,42,.1);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}
.dc-action-btn:hover {
  transform: scale(1.12) translateY(-1px);
  box-shadow: 0 5px 16px rgba(15,23,42,.15);
  background: rgba(255,255,255,.95);
}
.dc-action-btn--liked {
  background: rgba(254,226,226,.92);
  color: #ef4444;
}
.dc-action-btn--heart-anim {
  animation: dc-heart 0.5s cubic-bezier(0.22,1,0.36,1);
}
.dc-action-btn--copied {
  background: rgba(236,253,245,.95);
  color: #059669;
}

.dc-toast {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  white-space: nowrap;
  background: #0f172a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 7px;
  pointer-events: none;
  animation: dc-toast 2s ease forwards;
  z-index: 10;
}

.dc-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  gap: 10px;
}

.dc-name {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 700;
  line-height: 1.25;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}
.dc-card:hover .dc-name { color: #047857; }

.dc-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 500;
  flex-wrap: wrap;
}
.dc-location svg { color: #10b981; flex-shrink: 0; }
.dc-flag { font-size: 13px; margin-left: 2px; line-height: 1; }

.dc-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.dc-stat svg { color: #94a3b8; flex-shrink: 0; }
.dc-stat strong { color: #0f172a; font-weight: 700; }
.dc-divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.dc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.dc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.dc-chip--cat {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  text-transform: capitalize;
}
.dc-chip--dur {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.dc-diff {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.dc-diff--easy        { background: #d1fae5; color: #065f46; }
.dc-diff--moderate    { background: #fef3c7; color: #78350f; }
.dc-diff--challenging { background: #fed7aa; color: #7c2d12; }
.dc-diff--difficult   { background: #e9d5ff; color: #581c87; }
.dc-diff--expert      { background: #fce7f3; color: #831843; }

.dc-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-hl {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #dcfce7;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.2s ease;
}
.dc-hl:hover { background: #dcfce7; }
.dc-hl-more {
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
}

.dc-desc {
  margin: 0;
  font-size: clamp(12.5px, 1.1vw, 13.5px);
  color: #64748b;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dc-sep {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  border: none;
  flex-shrink: 0;
  margin: 2px 0;
}

.dc-price-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 2px;
}
.dc-price-value {
  font-size: 17px;
  font-weight: 800;
  color: #059669;
  line-height: 1;
  font-family: 'Playfair Display', serif;
}
.dc-price-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 3px;
}
.dc-price-request {
  font-size: 12.5px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

.dc-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.dc-btn-learn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #a7f3d0;
  background: #ffffff;
  color: #059669;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-learn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ecfdf5;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-btn-learn:hover::before { transform: scaleX(1); }
.dc-btn-learn:hover {
  border-color: #059669;
  color: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(5,150,105,.15);
}
.dc-btn-learn:active { transform: scale(0.97); }
.dc-btn-learn > * { position: relative; z-index: 1; }
.dc-btn-learn:hover .dc-btn-arrow {
  animation: dc-arrow 0.7s ease infinite;
}

.dc-btn-book {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(16,185,129,.28), inset 0 1px 0 rgba(255,255,255,.15);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-book::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.14) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-btn-book:hover::before { opacity: 1; }
.dc-btn-book:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(16,185,129,.4);
}
.dc-btn-book:active { transform: scale(0.97); }
.dc-btn-book > * { position: relative; z-index: 1; }

.dc-skeleton {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
}
.dc-skel-img {
  width: 100%;
  padding-top: 58%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.dc-skel-line {
  border-radius: 7px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-row { display: flex; gap: 8px; }
.dc-skel-chip {
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}

@media (max-width: 480px) {
  .dc-body      { padding: 13px; gap: 8px; }
  .dc-name      { font-size: 17px; }
  .dc-img-frame { padding-top: 62%; }
  .dc-btn-learn,
  .dc-btn-book  { padding: 10px 12px; font-size: 12.5px; }
  .dc-stat      { font-size: 11.5px; }
  .dc-nav       { display: none; }
  .dc-footer    { gap: 6px; }
}
@media (max-width: 360px) {
  .dc-btn-learn,
  .dc-btn-book  { padding: 9px 10px; font-size: 12px; gap: 4px; }
  .dc-action-btn { width: 32px; height: 32px; }
  .dc-stats     { gap: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .dc-card, .dc-img, .dc-btn-book,
  .dc-btn-learn, .dc-action-btn, .dc-nav-btn {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* ─────────────────────────────────────────────────────────────
   STYLE INJECTOR  (runs once per page)
───────────────────────────────────────────────────────────── */
function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc-styles")) return;
  const el = document.createElement("style");
  el.id = "dc-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   STAR SVG
───────────────────────────────────────────────────────────── */
function StarSVG({ filled }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   STARS component
───────────────────────────────────────────────────────────── */
function Stars({ rating, count }) {
  const filled = Math.round((Number(rating) || 0) * 2) / 2;

  return (
    <div
      className="dc-stat"
      aria-label={`Rating: ${rating != null ? Number(rating).toFixed(1) : "New"} out of 5`}
    >
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <StarSVG key={s} filled={s <= filled} />
        ))}
      </div>

      <strong style={{ marginLeft: 4 }}>
        {rating != null ? Number(rating).toFixed(1) : "New"}
      </strong>

      {Number(count) > 0 && (
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>
          ({Number(count) >= 1000
            ? `${(Number(count) / 1000).toFixed(1)}k`
            : count})
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────────────────────────── */
function ImageSlider({ images, name }) {
  const [idx, setIdx] = useState(0);
  const timerRef      = useRef(null);
  const total         = images.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(
      () => setIdx((p) => (p + 1) % total),
      5000,
    );
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const go = useCallback(
    (e, i) => { e.stopPropagation(); setIdx(i); startTimer(); },
    [startTimer],
  );
  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p - 1 + total) % total);
      startTimer();
    },
    [total, startTimer],
  );
  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p + 1) % total);
      startTimer();
    },
    [total, startTimer],
  );

  return (
    <>
      {images.map((src, i) => (
        <img
          key={`slide-${i}`}
          src={src}
          alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          onError={(ev) => { ev.currentTarget.src = FALLBACK; }}
          className={`dc-img ${idx === i ? "dc-img--visible" : "dc-img--hidden"}`}
        />
      ))}

      {total > 1 && (
        <>
          <div className="dc-nav" aria-hidden="true">
            <button
              className="dc-nav-btn"
              onClick={prev}
              aria-label="Previous image"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              className="dc-nav-btn"
              onClick={next}
              aria-label="Next image"
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          <div className="dc-dots" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={(e) => go(e, i)}
                aria-label={`Go to image ${i + 1}`}
                className={`dc-dot${idx === i ? " dc-dot--active" : ""}`}
                style={{ width: idx === i ? 18 : 6 }}
              />
            ))}
          </div>

          <div className="dc-photo-count" aria-hidden="true">
            <FiCamera size={9} />
            <span>{idx + 1}/{total}</span>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON  (named export)
───────────────────────────────────────────────────────────── */
export function DestinationCardSkeleton() {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div
      className="dc-skeleton"
      aria-busy="true"
      aria-label="Loading destination card"
    >
      <div className="dc-skel-img" />
      <div className="dc-skel-body">
        <div className="dc-skel-line" style={{ width: "72%", height: 20 }} />
        <div className="dc-skel-line" style={{ width: "44%", height: 12 }} />
        <div className="dc-skel-row">
          <div className="dc-skel-chip" style={{ width: 56, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 76, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 50, height: 26 }} />
        </div>
        <div className="dc-skel-line" style={{ width: "100%", height: 12 }} />
        <div className="dc-skel-line" style={{ width: "80%",  height: 12 }} />
        <div className="dc-skel-line" style={{ width: "60%",  height: 12 }} />
        <div className="dc-skel-row" style={{ marginTop: 6 }}>
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CARD  (default export)
───────────────────────────────────────────────────────────── */
const DestinationCard = memo(function DestinationCard({
  destination,
  compact          = false,
  onWishlistToggle,
}) {
  const navigate = useNavigate();

  /* safe hook call ─ fallback if context missing */
  const wishlistHook   = useWishlist?.() ?? {};
  const isWishlisted   = wishlistHook.isWishlisted  ?? (() => false);
  const toggleWishlist = wishlistHook.toggleWishlist ?? (() => {});

  const [heartAnim, setHeartAnim] = useState(false);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => { injectStyles(); }, []);

  /* ── guard ── */
  if (!destination) return <DestinationCardSkeleton />;

  /* ── destructure destination safely ── */
  const {
    slug,
    id,
    name             = "Destination",
    images           = [],
    gallery          = [],
    heroImage,
    imageUrl,
    thumbnailUrl,
    location,
    country,
    countryName,
    countryFlag,
    region,
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
    isEcoFriendly,
    difficulty,
    category,
    entranceFee,
    minGroupSize,
    maxGroupSize,
  } = destination;

  /* ── derived values ── */
  const destId = slug || id;
  const isLiked = isWishlisted(destId);

  const resolvedCountry =
    typeof country === "string"
      ? country
      : country?.name ?? country?.label ?? "";

  const safeImgs = (() => {
    const merged = [
      ...(Array.isArray(images)  ? images  : []),
      ...(Array.isArray(gallery) ? gallery : []),
    ].filter(Boolean);
    if (merged.length > 0) return merged;
    const singles = [heroImage, imageUrl, thumbnailUrl].filter(Boolean);
    return singles.length > 0 ? singles : [FALLBACK];
  })();

  const locationStr = [region, location, countryName || resolvedCountry]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  const blurb =
    shortDescription ||
    (description
      ? description.slice(0, 130) + (description.length > 130 ? "…" : "")
      : "");

  const durationStr =
    duration ||
    (durationDays
      ? `${durationDays} day${Number(durationDays) !== 1 ? "s" : ""}`
      : null);

  const groupStr =
    minGroupSize || maxGroupSize
      ? `${minGroupSize ?? 1}–${maxGroupSize ?? "∞"}`
      : null;

  const activeBadges = Object.keys(BADGE_CFG).filter((k) => destination[k]);
  const diffConf = DIFF_CFG[difficulty?.toLowerCase?.() ?? ""] ?? null;

  /* ── handlers ── */
  const goDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate],
  );

  const goBook = useCallback(
    (e) => {
      e.stopPropagation();
      const params = new URLSearchParams();
      params.set("destination", String(destId));
      if (name) params.set("destinationName", name);
      navigate(`/booking?${params.toString()}`);
    },
    [destId, name, navigate],
  );

  const handleLearnMore = useCallback(
    (e) => { e.stopPropagation(); goDetail(); },
    [goDetail],
  );

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 560);
      toggleWishlist(destId);
      onWishlistToggle?.(destId, !isLiked);
    },
    [destId, isLiked, toggleWishlist, onWishlistToggle],
  );

  /* ── FIX: handleShare is now clean with no duplicate code inside ── */
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
      } catch {
        /* user cancelled or API unavailable */
      }
    },
    [destId, name],
  );

  /* ── render ── */
  return (
    <article
      className={`dc-card${compact ? " dc-card--compact" : ""}`}
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
      aria-label={`View details for ${name}`}
    >
      {/* ════ IMAGE SECTION ════ */}
      <div className="dc-img-wrap">
        <div className="dc-img-frame">

          {safeImgs.length > 0 ? (
            <ImageSlider images={safeImgs} name={name} />
          ) : (
            <div className="dc-img-placeholder">
              <FiCamera size={32} aria-hidden="true" />
              <span>No photo yet</span>
            </div>
          )}

          <div className="dc-img-overlay" aria-hidden="true" />

          {(activeBadges.length > 0 || isEcoFriendly) && (
            <div className="dc-badges">
              {activeBadges.map((key, i) => {
                const { Icon, label, cls } = BADGE_CFG[key];
                return (
                  <span
                    key={key}
                    className={`dc-badge ${cls}`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <Icon size={9} aria-hidden="true" />
                    {label}
                  </span>
                );
              })}
              {isEcoFriendly && (
                <span className="dc-badge dc-badge--eco">🌿 Eco</span>
              )}
            </div>
          )}

          <div className="dc-actions">
            <button
              onClick={handleWishlist}
              aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={isLiked}
              className={[
                "dc-action-btn",
                isLiked   ? "dc-action-btn--liked"      : "",
                heartAnim ? "dc-action-btn--heart-anim" : "",
              ].filter(Boolean).join(" ")}
            >
              <FiHeart
                size={15}
                aria-hidden="true"
                style={{
                  fill:       isLiked ? "#ef4444" : "none",
                  color:      isLiked ? "#ef4444" : "#64748b",
                  transition: "all 0.2s ease",
                }}
              />
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={handleShare}
                aria-label="Share this destination"
                className={[
                  "dc-action-btn",
                  copied ? "dc-action-btn--copied" : "",
                ].filter(Boolean).join(" ")}
              >
                <FiShare2
                  size={14}
                  aria-hidden="true"
                  style={{ color: copied ? "#059669" : "#64748b" }}
                />
              </button>
              {copied && (
                <span className="dc-toast" role="status" aria-live="polite">
                  ✓ Link copied
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ════ CARD BODY ════ */}
      <div className="dc-body">

        <h3 className="dc-name">{name}</h3>

        {locationStr && (
          <div className="dc-location">
            <FiMapPin size={12} aria-hidden="true" />
            <span>{locationStr}</span>
            {countryFlag && (
              <span className="dc-flag" aria-hidden="true">
                {countryFlag}
              </span>
            )}
          </div>
        )}

        <div className="dc-stats">
          <Stars rating={rating} count={reviewCount} />

          {durationStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <FiClock size={11} aria-hidden="true" />
                <span>{durationStr}</span>
              </div>
            </>
          )}

          {groupStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <span aria-hidden="true" style={{ fontSize: 11 }}>👥</span>
                <span>{groupStr} pax</span>
              </div>
            </>
          )}
        </div>

        {(category || diffConf || (durationStr && !compact)) && (
          <div className="dc-chips">
            {category && (
              <span className="dc-chip dc-chip--cat">
                <FiCompass size={10} aria-hidden="true" />
                {String(category).replace(/_/g, " ")}
              </span>
            )}
            {durationStr && !compact && (
              <span className="dc-chip dc-chip--dur">
                <FiSun size={10} aria-hidden="true" />
                {durationStr}
              </span>
            )}
            {diffConf && (
              <span className={`dc-diff ${diffConf.cls}`}>
                <FiWind size={9} aria-hidden="true" />
                {diffConf.label}
              </span>
            )}
          </div>
        )}

        {!compact && highlights.length > 0 && (
          <div className="dc-highlights">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={`hl-${i}`} className="dc-hl">
                <FiSun size={9} aria-hidden="true" />
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span className="dc-hl-more">+{highlights.length - 3}</span>
            )}
          </div>
        )}

        {blurb && <p className="dc-desc">{blurb}</p>}

        {entranceFee ? (
          <div>
            <div className="dc-price-label">From</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="dc-price-value">{entranceFee}</span>
              <span className="dc-price-sub">/ person</span>
            </div>
          </div>
        ) : (
          <p className="dc-price-request">Price on request</p>
        )}

        <hr className="dc-sep" />

        <div className="dc-footer">
          <button
            className="dc-btn-learn"
            onClick={handleLearnMore}
            aria-label={`Learn more about ${name}`}
          >
            <span>Learn More</span>
            <FiArrowRight
              size={13}
              aria-hidden="true"
              className="dc-btn-arrow"
            />
          </button>

          <button
            className="dc-btn-book"
            onClick={goBook}
            aria-label={`Book ${name} now`}
          >
            <FiCalendar size={13} aria-hidden="true" />
            <span>Book Now</span>
          </button>
        </div>

      </div>
    </article>
  );
});

export default DestinationCard;// src/components/destinations/DestinationCard.jsx
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiHeart,
  FiShare2,
  FiArrowRight,
  FiAward,
  FiTrendingUp,
  FiZap,
  FiCalendar,
  FiWind,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiSun,
  FiCamera,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const FALLBACK =
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85";

const BADGE_CFG = {
  isFeatured: { Icon: FiAward,      label: "Featured", cls: "dc-badge--featured" },
  isNew:      { Icon: FiZap,        label: "New",      cls: "dc-badge--new"      },
  isPopular:  { Icon: FiTrendingUp, label: "Trending", cls: "dc-badge--popular"  },
};

const DIFF_CFG = {
  easy:        { cls: "dc-diff--easy",        label: "Easy"        },
  moderate:    { cls: "dc-diff--moderate",    label: "Moderate"    },
  challenging: { cls: "dc-diff--challenging", label: "Challenging" },
  difficult:   { cls: "dc-diff--difficult",   label: "Difficult"   },
  expert:      { cls: "dc-diff--expert",      label: "Expert"      },
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

@keyframes dc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes dc-heart {
  0%   { transform: scale(1); }
  20%  { transform: scale(0.82); }
  45%  { transform: scale(1.32); }
  70%  { transform: scale(0.94); }
  100% { transform: scale(1); }
}
@keyframes dc-arrow {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(5px); }
}
@keyframes dc-toast {
  0%   { opacity: 0; transform: translateY(4px); }
  15%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes dc-badge-in {
  from { opacity: 0; transform: translateY(-5px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dc-spin {
  to { transform: rotate(360deg); }
}

.dc-card {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15,23,42,.06);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.4s cubic-bezier(0.22,1,0.36,1),
    box-shadow 0.4s cubic-bezier(0.22,1,0.36,1),
    border-color 0.4s cubic-bezier(0.22,1,0.36,1);
}
.dc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(15,23,42,.12), 0 6px 20px rgba(5,150,105,.10);
  border-color: rgba(5,150,105,0.25);
}
.dc-card:focus-visible {
  outline: 2.5px solid #059669;
  outline-offset: 3px;
}

.dc-img-wrap {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.dc-img-frame {
  position: relative;
  width: 100%;
  padding-top: 58%;
  overflow: hidden;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}
.dc-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.6s ease, transform 6s cubic-bezier(0.25,0,0.15,1);
  will-change: transform, opacity;
}
.dc-img--hidden  { opacity: 0; transform: scale(1.05); }
.dc-img--visible { opacity: 1; transform: scale(1); }
.dc-card:hover .dc-img--visible { transform: scale(1.07); }

.dc-img-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(15,23,42,.18) 0%,
    transparent 30%,
    transparent 52%,
    rgba(15,23,42,.65) 100%
  );
  z-index: 1;
}

.dc-img-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}
.dc-img-placeholder span {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.65;
}

.dc-nav {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-card:hover .dc-nav { opacity: 1; }

.dc-nav-btn {
  pointer-events: auto;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #334155;
  box-shadow: 0 2px 10px rgba(0,0,0,.12);
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
}
.dc-nav-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.dc-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  align-items: center;
  z-index: 4;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(15,23,42,.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dc-dot {
  height: 4px;
  border-radius: 2px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(255,255,255,.4);
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-dot--active {
  width: 18px !important;
  background: #fff;
}

.dc-photo-count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgba(255,255,255,.9);
  font-size: 10.5px;
  font-weight: 600;
}

.dc-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: dc-badge-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
  white-space: nowrap;
}
.dc-badge--featured {
  background: linear-gradient(135deg, rgba(16,185,129,.9), rgba(5,150,105,.9));
  color: #fff;
  box-shadow: 0 3px 10px rgba(5,150,105,.3);
}
.dc-badge--new {
  background: rgba(255,255,255,.88);
  color: #047857;
  border: 1px solid rgba(167,243,208,.6);
}
.dc-badge--popular {
  background: linear-gradient(135deg, rgba(251,191,36,.9), rgba(245,158,11,.9));
  color: #78350f;
  box-shadow: 0 3px 10px rgba(245,158,11,.25);
}
.dc-badge--eco {
  background: rgba(15,23,42,.65);
  color: #a7f3d0;
}

.dc-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.dc-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15,23,42,.1);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}
.dc-action-btn:hover {
  transform: scale(1.12) translateY(-1px);
  box-shadow: 0 5px 16px rgba(15,23,42,.15);
  background: rgba(255,255,255,.95);
}
.dc-action-btn--liked {
  background: rgba(254,226,226,.92);
  color: #ef4444;
}
.dc-action-btn--heart-anim {
  animation: dc-heart 0.5s cubic-bezier(0.22,1,0.36,1);
}
.dc-action-btn--copied {
  background: rgba(236,253,245,.95);
  color: #059669;
}

.dc-toast {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  white-space: nowrap;
  background: #0f172a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 7px;
  pointer-events: none;
  animation: dc-toast 2s ease forwards;
  z-index: 10;
}

.dc-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  gap: 10px;
}

.dc-name {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 700;
  line-height: 1.25;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}
.dc-card:hover .dc-name { color: #047857; }

.dc-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 500;
  flex-wrap: wrap;
}
.dc-location svg { color: #10b981; flex-shrink: 0; }
.dc-flag { font-size: 13px; margin-left: 2px; line-height: 1; }

.dc-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.dc-stat svg { color: #94a3b8; flex-shrink: 0; }
.dc-stat strong { color: #0f172a; font-weight: 700; }
.dc-divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.dc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.dc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.dc-chip--cat {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  text-transform: capitalize;
}
.dc-chip--dur {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.dc-diff {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.dc-diff--easy        { background: #d1fae5; color: #065f46; }
.dc-diff--moderate    { background: #fef3c7; color: #78350f; }
.dc-diff--challenging { background: #fed7aa; color: #7c2d12; }
.dc-diff--difficult   { background: #e9d5ff; color: #581c87; }
.dc-diff--expert      { background: #fce7f3; color: #831843; }

.dc-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-hl {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #dcfce7;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.2s ease;
}
.dc-hl:hover { background: #dcfce7; }
.dc-hl-more {
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
}

.dc-desc {
  margin: 0;
  font-size: clamp(12.5px, 1.1vw, 13.5px);
  color: #64748b;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dc-sep {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  border: none;
  flex-shrink: 0;
  margin: 2px 0;
}

.dc-price-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 2px;
}
.dc-price-value {
  font-size: 17px;
  font-weight: 800;
  color: #059669;
  line-height: 1;
  font-family: 'Playfair Display', serif;
}
.dc-price-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 3px;
}
.dc-price-request {
  font-size: 12.5px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

.dc-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.dc-btn-learn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #a7f3d0;
  background: #ffffff;
  color: #059669;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-learn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ecfdf5;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-btn-learn:hover::before { transform: scaleX(1); }
.dc-btn-learn:hover {
  border-color: #059669;
  color: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(5,150,105,.15);
}
.dc-btn-learn:active { transform: scale(0.97); }
.dc-btn-learn > * { position: relative; z-index: 1; }
.dc-btn-learn:hover .dc-btn-arrow {
  animation: dc-arrow 0.7s ease infinite;
}

.dc-btn-book {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(16,185,129,.28), inset 0 1px 0 rgba(255,255,255,.15);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-book::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.14) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-btn-book:hover::before { opacity: 1; }
.dc-btn-book:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(16,185,129,.4);
}
.dc-btn-book:active { transform: scale(0.97); }
.dc-btn-book > * { position: relative; z-index: 1; }

.dc-skeleton {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
}
.dc-skel-img {
  width: 100%;
  padding-top: 58%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.dc-skel-line {
  border-radius: 7px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-row { display: flex; gap: 8px; }
.dc-skel-chip {
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}

@media (max-width: 480px) {
  .dc-body      { padding: 13px; gap: 8px; }
  .dc-name      { font-size: 17px; }
  .dc-img-frame { padding-top: 62%; }
  .dc-btn-learn,
  .dc-btn-book  { padding: 10px 12px; font-size: 12.5px; }
  .dc-stat      { font-size: 11.5px; }
  .dc-nav       { display: none; }
  .dc-footer    { gap: 6px; }
}
@media (max-width: 360px) {
  .dc-btn-learn,
  .dc-btn-book  { padding: 9px 10px; font-size: 12px; gap: 4px; }
  .dc-action-btn { width: 32px; height: 32px; }
  .dc-stats     { gap: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .dc-card, .dc-img, .dc-btn-book,
  .dc-btn-learn, .dc-action-btn, .dc-nav-btn {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* ─────────────────────────────────────────────────────────────
   STYLE INJECTOR  (runs once per page)
───────────────────────────────────────────────────────────── */
function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc-styles")) return;
  const el = document.createElement("style");
  el.id = "dc-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   STAR SVG
───────────────────────────────────────────────────────────── */
function StarSVG({ filled }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   STARS component
───────────────────────────────────────────────────────────── */
function Stars({ rating, count }) {
  const filled = Math.round((Number(rating) || 0) * 2) / 2;

  return (
    <div
      className="dc-stat"
      aria-label={`Rating: ${rating != null ? Number(rating).toFixed(1) : "New"} out of 5`}
    >
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <StarSVG key={s} filled={s <= filled} />
        ))}
      </div>

      <strong style={{ marginLeft: 4 }}>
        {rating != null ? Number(rating).toFixed(1) : "New"}
      </strong>

      {Number(count) > 0 && (
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>
          ({Number(count) >= 1000
            ? `${(Number(count) / 1000).toFixed(1)}k`
            : count})
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────────────────────────── */
function ImageSlider({ images, name }) {
  const [idx, setIdx] = useState(0);
  const timerRef      = useRef(null);
  const total         = images.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(
      () => setIdx((p) => (p + 1) % total),
      5000,
    );
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const go = useCallback(
    (e, i) => { e.stopPropagation(); setIdx(i); startTimer(); },
    [startTimer],
  );
  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p - 1 + total) % total);
      startTimer();
    },
    [total, startTimer],
  );
  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p + 1) % total);
      startTimer();
    },
    [total, startTimer],
  );

  return (
    <>
      {images.map((src, i) => (
        <img
          key={`slide-${i}`}
          src={src}
          alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          onError={(ev) => { ev.currentTarget.src = FALLBACK; }}
          className={`dc-img ${idx === i ? "dc-img--visible" : "dc-img--hidden"}`}
        />
      ))}

      {total > 1 && (
        <>
          <div className="dc-nav" aria-hidden="true">
            <button
              className="dc-nav-btn"
              onClick={prev}
              aria-label="Previous image"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              className="dc-nav-btn"
              onClick={next}
              aria-label="Next image"
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          <div className="dc-dots" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={(e) => go(e, i)}
                aria-label={`Go to image ${i + 1}`}
                className={`dc-dot${idx === i ? " dc-dot--active" : ""}`}
                style={{ width: idx === i ? 18 : 6 }}
              />
            ))}
          </div>

          <div className="dc-photo-count" aria-hidden="true">
            <FiCamera size={9} />
            <span>{idx + 1}/{total}</span>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON  (named export)
───────────────────────────────────────────────────────────── */
export function DestinationCardSkeleton() {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div
      className="dc-skeleton"
      aria-busy="true"
      aria-label="Loading destination card"
    >
      <div className="dc-skel-img" />
      <div className="dc-skel-body">
        <div className="dc-skel-line" style={{ width: "72%", height: 20 }} />
        <div className="dc-skel-line" style={{ width: "44%", height: 12 }} />
        <div className="dc-skel-row">
          <div className="dc-skel-chip" style={{ width: 56, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 76, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 50, height: 26 }} />
        </div>
        <div className="dc-skel-line" style={{ width: "100%", height: 12 }} />
        <div className="dc-skel-line" style={{ width: "80%",  height: 12 }} />
        <div className="dc-skel-line" style={{ width: "60%",  height: 12 }} />
        <div className="dc-skel-row" style={{ marginTop: 6 }}>
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CARD  (default export)
───────────────────────────────────────────────────────────── */
const DestinationCard = memo(function DestinationCard({
  destination,
  compact          = false,
  onWishlistToggle,
}) {
  const navigate = useNavigate();

  /* safe hook call ─ fallback if context missing */
  const wishlistHook   = useWishlist?.() ?? {};
  const isWishlisted   = wishlistHook.isWishlisted  ?? (() => false);
  const toggleWishlist = wishlistHook.toggleWishlist ?? (() => {});

  const [heartAnim, setHeartAnim] = useState(false);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => { injectStyles(); }, []);

  /* ── guard ── */
  if (!destination) return <DestinationCardSkeleton />;

  /* ── destructure destination safely ── */
  const {
    slug,
    id,
    name             = "Destination",
    images           = [],
    gallery          = [],
    heroImage,
    imageUrl,
    thumbnailUrl,
    location,
    country,
    countryName,
    countryFlag,
    region,
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
    isEcoFriendly,
    difficulty,
    category,
    entranceFee,
    minGroupSize,
    maxGroupSize,
  } = destination;

  /* ── derived values ── */
  const destId = slug || id;
  const isLiked = isWishlisted(destId);

  const resolvedCountry =
    typeof country === "string"
      ? country
      : country?.name ?? country?.label ?? "";

  const safeImgs = (() => {
    const merged = [
      ...(Array.isArray(images)  ? images  : []),
      ...(Array.isArray(gallery) ? gallery : []),
    ].filter(Boolean);
    if (merged.length > 0) return merged;
    const singles = [heroImage, imageUrl, thumbnailUrl].filter(Boolean);
    return singles.length > 0 ? singles : [FALLBACK];
  })();

  const locationStr = [region, location, countryName || resolvedCountry]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  const blurb =
    shortDescription ||
    (description
      ? description.slice(0, 130) + (description.length > 130 ? "…" : "")
      : "");

  const durationStr =
    duration ||
    (durationDays
      ? `${durationDays} day${Number(durationDays) !== 1 ? "s" : ""}`
      : null);

  const groupStr =
    minGroupSize || maxGroupSize
      ? `${minGroupSize ?? 1}–${maxGroupSize ?? "∞"}`
      : null;

  const activeBadges = Object.keys(BADGE_CFG).filter((k) => destination[k]);
  const diffConf = DIFF_CFG[difficulty?.toLowerCase?.() ?? ""] ?? null;

  /* ── handlers ── */
  const goDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate],
  );

  const goBook = useCallback(
    (e) => {
      e.stopPropagation();
      const params = new URLSearchParams();
      params.set("destination", String(destId));
      if (name) params.set("destinationName", name);
      navigate(`/booking?${params.toString()}`);
    },
    [destId, name, navigate],
  );

  const handleLearnMore = useCallback(
    (e) => { e.stopPropagation(); goDetail(); },
    [goDetail],
  );

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 560);
      toggleWishlist(destId);
      onWishlistToggle?.(destId, !isLiked);
    },
    [destId, isLiked, toggleWishlist, onWishlistToggle],
  );

  /* ── FIX: handleShare is now clean with no duplicate code inside ── */
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
      } catch {
        /* user cancelled or API unavailable */
      }
    },
    [destId, name],
  );

  /* ── render ── */
  return (
    <article
      className={`dc-card${compact ? " dc-card--compact" : ""}`}
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
      aria-label={`View details for ${name}`}
    >
      {/* ════ IMAGE SECTION ════ */}
      <div className="dc-img-wrap">
        <div className="dc-img-frame">

          {safeImgs.length > 0 ? (
            <ImageSlider images={safeImgs} name={name} />
          ) : (
            <div className="dc-img-placeholder">
              <FiCamera size={32} aria-hidden="true" />
              <span>No photo yet</span>
            </div>
          )}

          <div className="dc-img-overlay" aria-hidden="true" />

          {(activeBadges.length > 0 || isEcoFriendly) && (
            <div className="dc-badges">
              {activeBadges.map((key, i) => {
                const { Icon, label, cls } = BADGE_CFG[key];
                return (
                  <span
                    key={key}
                    className={`dc-badge ${cls}`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <Icon size={9} aria-hidden="true" />
                    {label}
                  </span>
                );
              })}
              {isEcoFriendly && (
                <span className="dc-badge dc-badge--eco">🌿 Eco</span>
              )}
            </div>
          )}

          <div className="dc-actions">
            <button
              onClick={handleWishlist}
              aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={isLiked}
              className={[
                "dc-action-btn",
                isLiked   ? "dc-action-btn--liked"      : "",
                heartAnim ? "dc-action-btn--heart-anim" : "",
              ].filter(Boolean).join(" ")}
            >
              <FiHeart
                size={15}
                aria-hidden="true"
                style={{
                  fill:       isLiked ? "#ef4444" : "none",
                  color:      isLiked ? "#ef4444" : "#64748b",
                  transition: "all 0.2s ease",
                }}
              />
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={handleShare}
                aria-label="Share this destination"
                className={[
                  "dc-action-btn",
                  copied ? "dc-action-btn--copied" : "",
                ].filter(Boolean).join(" ")}
              >
                <FiShare2
                  size={14}
                  aria-hidden="true"
                  style={{ color: copied ? "#059669" : "#64748b" }}
                />
              </button>
              {copied && (
                <span className="dc-toast" role="status" aria-live="polite">
                  ✓ Link copied
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ════ CARD BODY ════ */}
      <div className="dc-body">

        <h3 className="dc-name">{name}</h3>

        {locationStr && (
          <div className="dc-location">
            <FiMapPin size={12} aria-hidden="true" />
            <span>{locationStr}</span>
            {countryFlag && (
              <span className="dc-flag" aria-hidden="true">
                {countryFlag}
              </span>
            )}
          </div>
        )}

        <div className="dc-stats">
          <Stars rating={rating} count={reviewCount} />

          {durationStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <FiClock size={11} aria-hidden="true" />
                <span>{durationStr}</span>
              </div>
            </>
          )}

          {groupStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <span aria-hidden="true" style={{ fontSize: 11 }}>👥</span>
                <span>{groupStr} pax</span>
              </div>
            </>
          )}
        </div>

        {(category || diffConf || (durationStr && !compact)) && (
          <div className="dc-chips">
            {category && (
              <span className="dc-chip dc-chip--cat">
                <FiCompass size={10} aria-hidden="true" />
                {String(category).replace(/_/g, " ")}
              </span>
            )}
            {durationStr && !compact && (
              <span className="dc-chip dc-chip--dur">
                <FiSun size={10} aria-hidden="true" />
                {durationStr}
              </span>
            )}
            {diffConf && (
              <span className={`dc-diff ${diffConf.cls}`}>
                <FiWind size={9} aria-hidden="true" />
                {diffConf.label}
              </span>
            )}
          </div>
        )}

        {!compact && highlights.length > 0 && (
          <div className="dc-highlights">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={`hl-${i}`} className="dc-hl">
                <FiSun size={9} aria-hidden="true" />
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span className="dc-hl-more">+{highlights.length - 3}</span>
            )}
          </div>
        )}

        {blurb && <p className="dc-desc">{blurb}</p>}

        {entranceFee ? (
          <div>
            <div className="dc-price-label">From</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="dc-price-value">{entranceFee}</span>
              <span className="dc-price-sub">/ person</span>
            </div>
          </div>
        ) : (
          <p className="dc-price-request">Price on request</p>
        )}

        <hr className="dc-sep" />

        <div className="dc-footer">
          <button
            className="dc-btn-learn"
            onClick={handleLearnMore}
            aria-label={`Learn more about ${name}`}
          >
            <span>Learn More</span>
            <FiArrowRight
              size={13}
              aria-hidden="true"
              className="dc-btn-arrow"
            />
          </button>

          <button
            className="dc-btn-book"
            onClick={goBook}
            aria-label={`Book ${name} now`}
          >
            <FiCalendar size={13} aria-hidden="true" />
            <span>Book Now</span>
          </button>
        </div>

      </div>
    </article>
  );
});

export default DestinationCard;// src/components/destinations/DestinationCard.jsx
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiHeart,
  FiShare2,
  FiArrowRight,
  FiAward,
  FiTrendingUp,
  FiZap,
  FiCalendar,
  FiWind,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiSun,
  FiCamera,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const FALLBACK =
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85";

const BADGE_CFG = {
  isFeatured: { Icon: FiAward,      label: "Featured", cls: "dc-badge--featured" },
  isNew:      { Icon: FiZap,        label: "New",      cls: "dc-badge--new"      },
  isPopular:  { Icon: FiTrendingUp, label: "Trending", cls: "dc-badge--popular"  },
};

const DIFF_CFG = {
  easy:        { cls: "dc-diff--easy",        label: "Easy"        },
  moderate:    { cls: "dc-diff--moderate",    label: "Moderate"    },
  challenging: { cls: "dc-diff--challenging", label: "Challenging" },
  difficult:   { cls: "dc-diff--difficult",   label: "Difficult"   },
  expert:      { cls: "dc-diff--expert",      label: "Expert"      },
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

@keyframes dc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes dc-heart {
  0%   { transform: scale(1); }
  20%  { transform: scale(0.82); }
  45%  { transform: scale(1.32); }
  70%  { transform: scale(0.94); }
  100% { transform: scale(1); }
}
@keyframes dc-arrow {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(5px); }
}
@keyframes dc-toast {
  0%   { opacity: 0; transform: translateY(4px); }
  15%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes dc-badge-in {
  from { opacity: 0; transform: translateY(-5px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dc-spin {
  to { transform: rotate(360deg); }
}

.dc-card {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15,23,42,.06);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.4s cubic-bezier(0.22,1,0.36,1),
    box-shadow 0.4s cubic-bezier(0.22,1,0.36,1),
    border-color 0.4s cubic-bezier(0.22,1,0.36,1);
}
.dc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(15,23,42,.12), 0 6px 20px rgba(5,150,105,.10);
  border-color: rgba(5,150,105,0.25);
}
.dc-card:focus-visible {
  outline: 2.5px solid #059669;
  outline-offset: 3px;
}

.dc-img-wrap {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.dc-img-frame {
  position: relative;
  width: 100%;
  padding-top: 58%;
  overflow: hidden;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}
.dc-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.6s ease, transform 6s cubic-bezier(0.25,0,0.15,1);
  will-change: transform, opacity;
}
.dc-img--hidden  { opacity: 0; transform: scale(1.05); }
.dc-img--visible { opacity: 1; transform: scale(1); }
.dc-card:hover .dc-img--visible { transform: scale(1.07); }

.dc-img-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(15,23,42,.18) 0%,
    transparent 30%,
    transparent 52%,
    rgba(15,23,42,.65) 100%
  );
  z-index: 1;
}

.dc-img-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}
.dc-img-placeholder span {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.65;
}

.dc-nav {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-card:hover .dc-nav { opacity: 1; }

.dc-nav-btn {
  pointer-events: auto;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #334155;
  box-shadow: 0 2px 10px rgba(0,0,0,.12);
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
}
.dc-nav-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.dc-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  align-items: center;
  z-index: 4;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(15,23,42,.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dc-dot {
  height: 4px;
  border-radius: 2px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(255,255,255,.4);
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-dot--active {
  width: 18px !important;
  background: #fff;
}

.dc-photo-count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgba(255,255,255,.9);
  font-size: 10.5px;
  font-weight: 600;
}

.dc-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: dc-badge-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
  white-space: nowrap;
}
.dc-badge--featured {
  background: linear-gradient(135deg, rgba(16,185,129,.9), rgba(5,150,105,.9));
  color: #fff;
  box-shadow: 0 3px 10px rgba(5,150,105,.3);
}
.dc-badge--new {
  background: rgba(255,255,255,.88);
  color: #047857;
  border: 1px solid rgba(167,243,208,.6);
}
.dc-badge--popular {
  background: linear-gradient(135deg, rgba(251,191,36,.9), rgba(245,158,11,.9));
  color: #78350f;
  box-shadow: 0 3px 10px rgba(245,158,11,.25);
}
.dc-badge--eco {
  background: rgba(15,23,42,.65);
  color: #a7f3d0;
}

.dc-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.dc-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15,23,42,.1);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}
.dc-action-btn:hover {
  transform: scale(1.12) translateY(-1px);
  box-shadow: 0 5px 16px rgba(15,23,42,.15);
  background: rgba(255,255,255,.95);
}
.dc-action-btn--liked {
  background: rgba(254,226,226,.92);
  color: #ef4444;
}
.dc-action-btn--heart-anim {
  animation: dc-heart 0.5s cubic-bezier(0.22,1,0.36,1);
}
.dc-action-btn--copied {
  background: rgba(236,253,245,.95);
  color: #059669;
}

.dc-toast {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  white-space: nowrap;
  background: #0f172a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 7px;
  pointer-events: none;
  animation: dc-toast 2s ease forwards;
  z-index: 10;
}

.dc-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  gap: 10px;
}

.dc-name {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 700;
  line-height: 1.25;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}
.dc-card:hover .dc-name { color: #047857; }

.dc-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 500;
  flex-wrap: wrap;
}
.dc-location svg { color: #10b981; flex-shrink: 0; }
.dc-flag { font-size: 13px; margin-left: 2px; line-height: 1; }

.dc-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.dc-stat svg { color: #94a3b8; flex-shrink: 0; }
.dc-stat strong { color: #0f172a; font-weight: 700; }
.dc-divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.dc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.dc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.dc-chip--cat {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  text-transform: capitalize;
}
.dc-chip--dur {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.dc-diff {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.dc-diff--easy        { background: #d1fae5; color: #065f46; }
.dc-diff--moderate    { background: #fef3c7; color: #78350f; }
.dc-diff--challenging { background: #fed7aa; color: #7c2d12; }
.dc-diff--difficult   { background: #e9d5ff; color: #581c87; }
.dc-diff--expert      { background: #fce7f3; color: #831843; }

.dc-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-hl {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #dcfce7;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.2s ease;
}
.dc-hl:hover { background: #dcfce7; }
.dc-hl-more {
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
}

.dc-desc {
  margin: 0;
  font-size: clamp(12.5px, 1.1vw, 13.5px);
  color: #64748b;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dc-sep {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  border: none;
  flex-shrink: 0;
  margin: 2px 0;
}

.dc-price-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 2px;
}
.dc-price-value {
  font-size: 17px;
  font-weight: 800;
  color: #059669;
  line-height: 1;
  font-family: 'Playfair Display', serif;
}
.dc-price-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 3px;
}
.dc-price-request {
  font-size: 12.5px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

.dc-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.dc-btn-learn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #a7f3d0;
  background: #ffffff;
  color: #059669;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-learn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ecfdf5;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-btn-learn:hover::before { transform: scaleX(1); }
.dc-btn-learn:hover {
  border-color: #059669;
  color: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(5,150,105,.15);
}
.dc-btn-learn:active { transform: scale(0.97); }
.dc-btn-learn > * { position: relative; z-index: 1; }
.dc-btn-learn:hover .dc-btn-arrow {
  animation: dc-arrow 0.7s ease infinite;
}

.dc-btn-book {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(16,185,129,.28), inset 0 1px 0 rgba(255,255,255,.15);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-book::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.14) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-btn-book:hover::before { opacity: 1; }
.dc-btn-book:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(16,185,129,.4);
}
.dc-btn-book:active { transform: scale(0.97); }
.dc-btn-book > * { position: relative; z-index: 1; }

.dc-skeleton {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
}
.dc-skel-img {
  width: 100%;
  padding-top: 58%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.dc-skel-line {
  border-radius: 7px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-row { display: flex; gap: 8px; }
.dc-skel-chip {
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}

@media (max-width: 480px) {
  .dc-body      { padding: 13px; gap: 8px; }
  .dc-name      { font-size: 17px; }
  .dc-img-frame { padding-top: 62%; }
  .dc-btn-learn,
  .dc-btn-book  { padding: 10px 12px; font-size: 12.5px; }
  .dc-stat      { font-size: 11.5px; }
  .dc-nav       { display: none; }
  .dc-footer    { gap: 6px; }
}
@media (max-width: 360px) {
  .dc-btn-learn,
  .dc-btn-book  { padding: 9px 10px; font-size: 12px; gap: 4px; }
  .dc-action-btn { width: 32px; height: 32px; }
  .dc-stats     { gap: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .dc-card, .dc-img, .dc-btn-book,
  .dc-btn-learn, .dc-action-btn, .dc-nav-btn {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* ─────────────────────────────────────────────────────────────
   STYLE INJECTOR  (runs once per page)
───────────────────────────────────────────────────────────── */
function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc-styles")) return;
  const el = document.createElement("style");
  el.id = "dc-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   STAR SVG
───────────────────────────────────────────────────────────── */
function StarSVG({ filled }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   STARS component
───────────────────────────────────────────────────────────── */
function Stars({ rating, count }) {
  const filled = Math.round((Number(rating) || 0) * 2) / 2;

  return (
    <div
      className="dc-stat"
      aria-label={`Rating: ${rating != null ? Number(rating).toFixed(1) : "New"} out of 5`}
    >
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <StarSVG key={s} filled={s <= filled} />
        ))}
      </div>

      <strong style={{ marginLeft: 4 }}>
        {rating != null ? Number(rating).toFixed(1) : "New"}
      </strong>

      {Number(count) > 0 && (
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>
          ({Number(count) >= 1000
            ? `${(Number(count) / 1000).toFixed(1)}k`
            : count})
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────────────────────────── */
function ImageSlider({ images, name }) {
  const [idx, setIdx] = useState(0);
  const timerRef      = useRef(null);
  const total         = images.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(
      () => setIdx((p) => (p + 1) % total),
      5000,
    );
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const go = useCallback(
    (e, i) => { e.stopPropagation(); setIdx(i); startTimer(); },
    [startTimer],
  );
  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p - 1 + total) % total);
      startTimer();
    },
    [total, startTimer],
  );
  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p + 1) % total);
      startTimer();
    },
    [total, startTimer],
  );

  return (
    <>
      {images.map((src, i) => (
        <img
          key={`slide-${i}`}
          src={src}
          alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          onError={(ev) => { ev.currentTarget.src = FALLBACK; }}
          className={`dc-img ${idx === i ? "dc-img--visible" : "dc-img--hidden"}`}
        />
      ))}

      {total > 1 && (
        <>
          <div className="dc-nav" aria-hidden="true">
            <button
              className="dc-nav-btn"
              onClick={prev}
              aria-label="Previous image"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              className="dc-nav-btn"
              onClick={next}
              aria-label="Next image"
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          <div className="dc-dots" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={(e) => go(e, i)}
                aria-label={`Go to image ${i + 1}`}
                className={`dc-dot${idx === i ? " dc-dot--active" : ""}`}
                style={{ width: idx === i ? 18 : 6 }}
              />
            ))}
          </div>

          <div className="dc-photo-count" aria-hidden="true">
            <FiCamera size={9} />
            <span>{idx + 1}/{total}</span>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON  (named export)
───────────────────────────────────────────────────────────── */
export function DestinationCardSkeleton() {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div
      className="dc-skeleton"
      aria-busy="true"
      aria-label="Loading destination card"
    >
      <div className="dc-skel-img" />
      <div className="dc-skel-body">
        <div className="dc-skel-line" style={{ width: "72%", height: 20 }} />
        <div className="dc-skel-line" style={{ width: "44%", height: 12 }} />
        <div className="dc-skel-row">
          <div className="dc-skel-chip" style={{ width: 56, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 76, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 50, height: 26 }} />
        </div>
        <div className="dc-skel-line" style={{ width: "100%", height: 12 }} />
        <div className="dc-skel-line" style={{ width: "80%",  height: 12 }} />
        <div className="dc-skel-line" style={{ width: "60%",  height: 12 }} />
        <div className="dc-skel-row" style={{ marginTop: 6 }}>
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CARD  (default export)
───────────────────────────────────────────────────────────── */
const DestinationCard = memo(function DestinationCard({
  destination,
  compact          = false,
  onWishlistToggle,
}) {
  const navigate = useNavigate();

  /* safe hook call ─ fallback if context missing */
  const wishlistHook   = useWishlist?.() ?? {};
  const isWishlisted   = wishlistHook.isWishlisted  ?? (() => false);
  const toggleWishlist = wishlistHook.toggleWishlist ?? (() => {});

  const [heartAnim, setHeartAnim] = useState(false);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => { injectStyles(); }, []);

  /* ── guard ── */
  if (!destination) return <DestinationCardSkeleton />;

  /* ── destructure destination safely ── */
  const {
    slug,
    id,
    name             = "Destination",
    images           = [],
    gallery          = [],
    heroImage,
    imageUrl,
    thumbnailUrl,
    location,
    country,
    countryName,
    countryFlag,
    region,
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
    isEcoFriendly,
    difficulty,
    category,
    entranceFee,
    minGroupSize,
    maxGroupSize,
  } = destination;

  /* ── derived values ── */
  const destId = slug || id;
  const isLiked = isWishlisted(destId);

  const resolvedCountry =
    typeof country === "string"
      ? country
      : country?.name ?? country?.label ?? "";

  const safeImgs = (() => {
    const merged = [
      ...(Array.isArray(images)  ? images  : []),
      ...(Array.isArray(gallery) ? gallery : []),
    ].filter(Boolean);
    if (merged.length > 0) return merged;
    const singles = [heroImage, imageUrl, thumbnailUrl].filter(Boolean);
    return singles.length > 0 ? singles : [FALLBACK];
  })();

  const locationStr = [region, location, countryName || resolvedCountry]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  const blurb =
    shortDescription ||
    (description
      ? description.slice(0, 130) + (description.length > 130 ? "…" : "")
      : "");

  const durationStr =
    duration ||
    (durationDays
      ? `${durationDays} day${Number(durationDays) !== 1 ? "s" : ""}`
      : null);

  const groupStr =
    minGroupSize || maxGroupSize
      ? `${minGroupSize ?? 1}–${maxGroupSize ?? "∞"}`
      : null;

  const activeBadges = Object.keys(BADGE_CFG).filter((k) => destination[k]);
  const diffConf = DIFF_CFG[difficulty?.toLowerCase?.() ?? ""] ?? null;

  /* ── handlers ── */
  const goDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate],
  );

  const goBook = useCallback(
    (e) => {
      e.stopPropagation();
      const params = new URLSearchParams();
      params.set("destination", String(destId));
      if (name) params.set("destinationName", name);
      navigate(`/booking?${params.toString()}`);
    },
    [destId, name, navigate],
  );

  const handleLearnMore = useCallback(
    (e) => { e.stopPropagation(); goDetail(); },
    [goDetail],
  );

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 560);
      toggleWishlist(destId);
      onWishlistToggle?.(destId, !isLiked);
    },
    [destId, isLiked, toggleWishlist, onWishlistToggle],
  );

  /* ── FIX: handleShare is now clean with no duplicate code inside ── */
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
      } catch {
        /* user cancelled or API unavailable */
      }
    },
    [destId, name],
  );

  /* ── render ── */
  return (
    <article
      className={`dc-card${compact ? " dc-card--compact" : ""}`}
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
      aria-label={`View details for ${name}`}
    >
      {/* ════ IMAGE SECTION ════ */}
      <div className="dc-img-wrap">
        <div className="dc-img-frame">

          {safeImgs.length > 0 ? (
            <ImageSlider images={safeImgs} name={name} />
          ) : (
            <div className="dc-img-placeholder">
              <FiCamera size={32} aria-hidden="true" />
              <span>No photo yet</span>
            </div>
          )}

          <div className="dc-img-overlay" aria-hidden="true" />

          {(activeBadges.length > 0 || isEcoFriendly) && (
            <div className="dc-badges">
              {activeBadges.map((key, i) => {
                const { Icon, label, cls } = BADGE_CFG[key];
                return (
                  <span
                    key={key}
                    className={`dc-badge ${cls}`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <Icon size={9} aria-hidden="true" />
                    {label}
                  </span>
                );
              })}
              {isEcoFriendly && (
                <span className="dc-badge dc-badge--eco">🌿 Eco</span>
              )}
            </div>
          )}

          <div className="dc-actions">
            <button
              onClick={handleWishlist}
              aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={isLiked}
              className={[
                "dc-action-btn",
                isLiked   ? "dc-action-btn--liked"      : "",
                heartAnim ? "dc-action-btn--heart-anim" : "",
              ].filter(Boolean).join(" ")}
            >
              <FiHeart
                size={15}
                aria-hidden="true"
                style={{
                  fill:       isLiked ? "#ef4444" : "none",
                  color:      isLiked ? "#ef4444" : "#64748b",
                  transition: "all 0.2s ease",
                }}
              />
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={handleShare}
                aria-label="Share this destination"
                className={[
                  "dc-action-btn",
                  copied ? "dc-action-btn--copied" : "",
                ].filter(Boolean).join(" ")}
              >
                <FiShare2
                  size={14}
                  aria-hidden="true"
                  style={{ color: copied ? "#059669" : "#64748b" }}
                />
              </button>
              {copied && (
                <span className="dc-toast" role="status" aria-live="polite">
                  ✓ Link copied
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ════ CARD BODY ════ */}
      <div className="dc-body">

        <h3 className="dc-name">{name}</h3>

        {locationStr && (
          <div className="dc-location">
            <FiMapPin size={12} aria-hidden="true" />
            <span>{locationStr}</span>
            {countryFlag && (
              <span className="dc-flag" aria-hidden="true">
                {countryFlag}
              </span>
            )}
          </div>
        )}

        <div className="dc-stats">
          <Stars rating={rating} count={reviewCount} />

          {durationStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <FiClock size={11} aria-hidden="true" />
                <span>{durationStr}</span>
              </div>
            </>
          )}

          {groupStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <span aria-hidden="true" style={{ fontSize: 11 }}>👥</span>
                <span>{groupStr} pax</span>
              </div>
            </>
          )}
        </div>

        {(category || diffConf || (durationStr && !compact)) && (
          <div className="dc-chips">
            {category && (
              <span className="dc-chip dc-chip--cat">
                <FiCompass size={10} aria-hidden="true" />
                {String(category).replace(/_/g, " ")}
              </span>
            )}
            {durationStr && !compact && (
              <span className="dc-chip dc-chip--dur">
                <FiSun size={10} aria-hidden="true" />
                {durationStr}
              </span>
            )}
            {diffConf && (
              <span className={`dc-diff ${diffConf.cls}`}>
                <FiWind size={9} aria-hidden="true" />
                {diffConf.label}
              </span>
            )}
          </div>
        )}

        {!compact && highlights.length > 0 && (
          <div className="dc-highlights">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={`hl-${i}`} className="dc-hl">
                <FiSun size={9} aria-hidden="true" />
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span className="dc-hl-more">+{highlights.length - 3}</span>
            )}
          </div>
        )}

        {blurb && <p className="dc-desc">{blurb}</p>}

        {entranceFee ? (
          <div>
            <div className="dc-price-label">From</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span className="dc-price-value">{entranceFee}</span>
              <span className="dc-price-sub">/ person</span>
            </div>
          </div>
        ) : (
          <p className="dc-price-request">Price on request</p>
        )}

        <hr className="dc-sep" />

        <div className="dc-footer">
          <button
            className="dc-btn-learn"
            onClick={handleLearnMore}
            aria-label={`Learn more about ${name}`}
          >
            <span>Learn More</span>
            <FiArrowRight
              size={13}
              aria-hidden="true"
              className="dc-btn-arrow"
            />
          </button>

          <button
            className="dc-btn-book"
            onClick={goBook}
            aria-label={`Book ${name} now`}
          >
            <FiCalendar size={13} aria-hidden="true" />
            <span>Book Now</span>
          </button>
        </div>

      </div>
    </article>
  );
});

export default DestinationCard;// src/components/destinations/DestinationCard.jsx
import { useState, useEffect, useCallback, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiHeart,
  FiShare2,
  FiArrowRight,
  FiAward,
  FiTrendingUp,
  FiZap,
  FiCalendar,
  FiWind,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiSun,
  FiCamera,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const FALLBACK =
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85";

const BADGE_CFG = {
  isFeatured: { Icon: FiAward,      label: "Featured", cls: "dc-badge--featured" },
  isNew:      { Icon: FiZap,        label: "New",      cls: "dc-badge--new"      },
  isPopular:  { Icon: FiTrendingUp, label: "Trending", cls: "dc-badge--popular"  },
};

const DIFF_CFG = {
  easy:        { cls: "dc-diff--easy",        label: "Easy"        },
  moderate:    { cls: "dc-diff--moderate",    label: "Moderate"    },
  challenging: { cls: "dc-diff--challenging", label: "Challenging" },
  difficult:   { cls: "dc-diff--difficult",   label: "Difficult"   },
  expert:      { cls: "dc-diff--expert",      label: "Expert"      },
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

@keyframes dc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes dc-heart {
  0%   { transform: scale(1); }
  20%  { transform: scale(0.82); }
  45%  { transform: scale(1.32); }
  70%  { transform: scale(0.94); }
  100% { transform: scale(1); }
}
@keyframes dc-arrow {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(5px); }
}
@keyframes dc-toast {
  0%   { opacity: 0; transform: translateY(4px); }
  15%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes dc-badge-in {
  from { opacity: 0; transform: translateY(-5px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dc-spin {
  to { transform: rotate(360deg); }
}

.dc-card {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15,23,42,.06);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.4s cubic-bezier(0.22,1,0.36,1),
    box-shadow 0.4s cubic-bezier(0.22,1,0.36,1),
    border-color 0.4s cubic-bezier(0.22,1,0.36,1);
}
.dc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(15,23,42,.12), 0 6px 20px rgba(5,150,105,.10);
  border-color: rgba(5,150,105,0.25);
}
.dc-card:focus-visible {
  outline: 2.5px solid #059669;
  outline-offset: 3px;
}

.dc-img-wrap {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.dc-img-frame {
  position: relative;
  width: 100%;
  padding-top: 58%;
  overflow: hidden;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}
.dc-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: opacity 0.6s ease, transform 6s cubic-bezier(0.25,0,0.15,1);
  will-change: transform, opacity;
}
.dc-img--hidden  { opacity: 0; transform: scale(1.05); }
.dc-img--visible { opacity: 1; transform: scale(1); }
.dc-card:hover .dc-img--visible { transform: scale(1.07); }

.dc-img-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(15,23,42,.18) 0%,
    transparent 30%,
    transparent 52%,
    rgba(15,23,42,.65) 100%
  );
  z-index: 1;
}

.dc-img-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}
.dc-img-placeholder span {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.65;
}

.dc-nav {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-card:hover .dc-nav { opacity: 1; }

.dc-nav-btn {
  pointer-events: auto;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #334155;
  box-shadow: 0 2px 10px rgba(0,0,0,.12);
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
}
.dc-nav-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.dc-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  align-items: center;
  z-index: 4;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(15,23,42,.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dc-dot {
  height: 4px;
  border-radius: 2px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(255,255,255,.4);
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-dot--active {
  width: 18px !important;
  background: #fff;
}

.dc-photo-count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgba(255,255,255,.9);
  font-size: 10.5px;
  font-weight: 600;
}

.dc-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: dc-badge-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
  white-space: nowrap;
}
.dc-badge--featured {
  background: linear-gradient(135deg, rgba(16,185,129,.9), rgba(5,150,105,.9));
  color: #fff;
  box-shadow: 0 3px 10px rgba(5,150,105,.3);
}
.dc-badge--new {
  background: rgba(255,255,255,.88);
  color: #047857;
  border: 1px solid rgba(167,243,208,.6);
}
.dc-badge--popular {
  background: linear-gradient(135deg, rgba(251,191,36,.9), rgba(245,158,11,.9));
  color: #78350f;
  box-shadow: 0 3px 10px rgba(245,158,11,.25);
}
.dc-badge--eco {
  background: rgba(15,23,42,.65);
  color: #a7f3d0;
}

.dc-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.dc-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15,23,42,.1);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}
.dc-action-btn:hover {
  transform: scale(1.12) translateY(-1px);
  box-shadow: 0 5px 16px rgba(15,23,42,.15);
  background: rgba(255,255,255,.95);
}
.dc-action-btn--liked {
  background: rgba(254,226,226,.92);
  color: #ef4444;
}
.dc-action-btn--heart-anim {
  animation: dc-heart 0.5s cubic-bezier(0.22,1,0.36,1);
}
.dc-action-btn--copied {
  background: rgba(236,253,245,.95);
  color: #059669;
}

.dc-toast {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  white-space: nowrap;
  background: #0f172a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 7px;
  pointer-events: none;
  animation: dc-toast 2s ease forwards;
  z-index: 10;
}

.dc-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  gap: 10px;
}

.dc-name {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 700;
  line-height: 1.25;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}
.dc-card:hover .dc-name { color: #047857; }

.dc-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 500;
  flex-wrap: wrap;
}
.dc-location svg { color: #10b981; flex-shrink: 0; }
.dc-flag { font-size: 13px; margin-left: 2px; line-height: 1; }

.dc-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.dc-stat svg { color: #94a3b8; flex-shrink: 0; }
.dc-stat strong { color: #0f172a; font-weight: 700; }
.dc-divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.dc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.dc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.dc-chip--cat {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  text-transform: capitalize;
}
.dc-chip--dur {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.dc-diff {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.dc-diff--easy        { background: #d1fae5; color: #065f46; }
.dc-diff--moderate    { background: #fef3c7; color: #78350f; }
.dc-diff--challenging { background: #fed7aa; color: #7c2d12; }
.dc-diff--difficult   { background: #e9d5ff; color: #581c87; }
.dc-diff--expert      { background: #fce7f3; color: #831843; }

.dc-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-hl {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #dcfce7;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.2s ease;
}
.dc-hl:hover { background: #dcfce7; }
.dc-hl-more {
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
}

.dc-desc {
  margin: 0;
  font-size: clamp(12.5px, 1.1vw, 13.5px);
  color: #64748b;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dc-sep {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  border: none;
  flex-shrink: 0;
  margin: 2px 0;
}

.dc-price-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 2px;
}
.dc-price-value {
  font-size: 17px;
  font-weight: 800;
  color: #059669;
  line-height: 1;
  font-family: 'Playfair Display', serif;
}
.dc-price-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 3px;
}
.dc-price-request {
  font-size: 12.5px;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}

.dc-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.dc-btn-learn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #a7f3d0;
  background: #ffffff;
  color: #059669;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-learn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ecfdf5;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-btn-learn:hover::before { transform: scaleX(1); }
.dc-btn-learn:hover {
  border-color: #059669;
  color: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(5,150,105,.15);
}
.dc-btn-learn:active { transform: scale(0.97); }
.dc-btn-learn > * { position: relative; z-index: 1; }
.dc-btn-learn:hover .dc-btn-arrow {
  animation: dc-arrow 0.7s ease infinite;
}

.dc-btn-book {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(16,185,129,.28), inset 0 1px 0 rgba(255,255,255,.15);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-book::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.14) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-btn-book:hover::before { opacity: 1; }
.dc-btn-book:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(16,185,129,.4);
}
.dc-btn-book:active { transform: scale(0.97); }
.dc-btn-book > * { position: relative; z-index: 1; }

.dc-skeleton {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
}
.dc-skel-img {
  width: 100%;
  padding-top: 58%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.dc-skel-line {
  border-radius: 7px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-row { display: flex; gap: 8px; }
.dc-skel-chip {
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}

@media (max-width: 480px) {
  .dc-body      { padding: 13px; gap: 8px; }
  .dc-name      { font-size: 17px; }
  .dc-img-frame { padding-top: 62%; }
  .dc-btn-learn,
  .dc-btn-book  { padding: 10px 12px; font-size: 12.5px; }
  .dc-stat      { font-size: 11.5px; }
  .dc-nav       { display: none; }
  .dc-footer    { gap: 6px; }
}
@media (max-width: 360px) {
  .dc-btn-learn,
  .dc-btn-book  { padding: 9px 10px; font-size: 12px; gap: 4px; }
  .dc-action-btn { width: 32px; height: 32px; }
  .dc-stats     { gap: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .dc-card, .dc-img, .dc-btn-book,
  .dc-btn-learn, .dc-action-btn, .dc-nav-btn {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

/* ─────────────────────────────────────────────────────────────
   STYLE INJECTOR  (runs once per page)
───────────────────────────────────────────────────────────── */
function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc-styles")) return;
  const el = document.createElement("style");
  el.id = "dc-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   STAR SVG
───────────────────────────────────────────────────────────── */
function StarSVG({ filled }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   STARS component
───────────────────────────────────────────────────────────── */
function Stars({ rating, count }) {
  const filled = Math.round((Number(rating) || 0) * 2) / 2;

  return (
    <div
      className="dc-stat"
      aria-label={`Rating: ${rating != null ? Number(rating).toFixed(1) : "New"} out of 5`}
    >
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <StarSVG key={s} filled={s <= filled} />
        ))}
      </div>

      <strong style={{ marginLeft: 4 }}>
        {rating != null ? Number(rating).toFixed(1) : "New"}
      </strong>

      {Number(count) > 0 && (
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>
          ({Number(count) >= 1000
            ? `${(Number(count) / 1000).toFixed(1)}k`
            : count})
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────────────────────────── */
function ImageSlider({ images, name }) {
  const [idx, setIdx] = useState(0);
  const timerRef      = useRef(null);
  const total         = images.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(
      () => setIdx((p) => (p + 1) % total),
      5000,
    );
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const go = useCallback(
    (e, i) => { e.stopPropagation(); setIdx(i); startTimer(); },
    [startTimer],
  );
  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p - 1 + total) % total);
      startTimer();
    },
    [total, startTimer],
  );
  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p + 1) % total);
      startTimer();
    },
    [total, startTimer],
  );

  return (
    <>
      {images.map((src, i) => (
        <img
          key={`slide-${i}`}
          src={src}
          alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          onError={(ev) => { ev.currentTarget.src = FALLBACK; }}
          className={`dc-img ${idx === i ? "dc-img--visible" : "dc-img--hidden"}`}
        />
      ))}

      {total > 1 && (
        <>
          <div className="dc-nav" aria-hidden="true">
            <button
              className="dc-nav-btn"
              onClick={prev}
              aria-label="Previous image"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              className="dc-nav-btn"
              onClick={next}
              aria-label="Next image"
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          <div className="dc-dots" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={(e) => go(e, i)}
                aria-label={`Go to image ${i + 1}`}
                className={`dc-dot${idx === i ? " dc-dot--active" : ""}`}
                style={{ width: idx === i ? 18 : 6 }}
              />
            ))}
          </div>

          <div className="dc-photo-count" aria-hidden="true">
            <FiCamera size={9} />
            <span>{idx + 1}/{total}</span>
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON  (named export)
───────────────────────────────────────────────────────────── */
export function DestinationCardSkeleton() {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div
      className="dc-skeleton"
      aria-busy="true"
      aria-label="Loading destination card"
    >
      <div className="dc-skel-img" />
      <div className="dc-skel-body">
        <div className="dc-skel-line" style={{ width: "72%", height: 20 }} />
        <div className="dc-skel-line" style={{ width: "44%", height: 12 }} />
        <div className="dc-skel-row">
          <div className="dc-skel-chip" style={{ width: 56, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 76, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 50, height: 26 }} />
        </div>
        <div className="dc-skel-line" style={{ width: "100%", height: 12 }} />
        <div className="dc-skel-line" style={{ width: "80%",  height: 12 }} />
        <div className="dc-skel-line" style={{ width: "60%",  height: 12 }} />
        <div className="dc-skel-row" style={{ marginTop: 6 }}>
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CARD  (default export)
───────────────────────────────────────────────────────────── */
const DestinationCard = memo(function DestinationCard({
  destination,
  compact          = false,
  onWishlistToggle,
}) {
  const navigate = useNavigate();

  /* safe hook call ─ fallback if context missing */
  const wishlistHook   = useWishlist?.() ?? {};
  const isWishlisted   = wishlistHook.isWishlisted  ?? (() => false);
  const toggleWishlist = wishlistHook.toggleWishlist ?? (() => {});

  const [heartAnim, setHeartAnim] = useState(false);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => { injectStyles(); }, []);

  /* ── guard ── */
  if (!destination) return <DestinationCardSkeleton />;

  /* ── destructure destination safely ── */
  const {
    slug,
    id,
    name             = "Destination",
    images           = [],
    gallery          = [],
    heroImage,
    imageUrl,
    thumbnailUrl,
    location,
    country,
    countryName,
    countryFlag,
    region,
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
    isEcoFriendly,
    difficulty,
    category,
    entranceFee,
    minGroupSize,
    maxGroupSize,
  } = destination;

  /* ── derived values ── */
  const destId = slug || id;
  const isLiked = isWishlisted(destId);

  const resolvedCountry =
    typeof country === "string"
      ? country
      : country?.name ?? country?.label ?? "";

  const safeImgs = (() => {
    const merged = [
      ...(Array.isArray(images)  ? images  : []),
      ...(Array.isArray(gallery) ? gallery : []),
    ].filter(Boolean);
    if (merged.length > 0) return merged;
    const singles = [heroImage, imageUrl, thumbnailUrl].filter(Boolean);
    return singles.length > 0 ? singles : [FALLBACK];
  })();

  const locationStr = [region, location, countryName || resolvedCountry]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  const blurb =
    shortDescription ||
    (description
      ? description.slice(0, 130) + (description.length > 130 ? "…" : "")
      : "");

  const durationStr =
    duration ||
    (durationDays
      ? `${durationDays} day${Number(durationDays) !== 1 ? "s" : ""}`
      : null);

  const groupStr =
    minGroupSize || maxGroupSize
      ? `${minGroupSize ?? 1}–${maxGroupSize ?? "∞"}`
      : null;

  const activeBadges = Object.keys(BADGE_CFG).filter((k) => destination[k]);
  const diffConf = DIFF_CFG[difficulty?.toLowerCase?.() ?? ""] ?? null;

  /* ── handlers ── */
  const goDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate],
  );

  const goBook = useCallback(
    (e) => {
      e.stopPropagation();
      const params = new URLSearchParams();
      params.set("destination", String(destId));
      if (name) params.set("destinationName", name);
      navigate(`/booking?${params.toString()}`);
    },
    [destId, name, navigate],
  );

  const handleLearnMore = useCallback(
    (e) => { e.stopPropagation(); goDetail(); },
    [goDetail],
  );

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 560);
      toggleWishlist(destId);
      onWishlistToggle?.(destId, !isLiked);
    },
    [destId, isLiked, toggleWishlist, onWishlistToggle],
  );

  /* ── FIX: handleShare is now clean with no duplicate code inside ── */
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
      } catch {
        /* user cancelled or API unavailable */
      }
    },
    [destId, name],
  );

  /* ── render ── */
  return (
    <article
      className={`dc-card${compact ? " dc-card--compact" : ""}`}
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goDetail();
        }
      }}
      aria-label={`View details for ${name}`}
    >
      {/* ════ IMAGE SECTION ════ */}
      <div className="dc-img-wrap">
        <div className="dc-img-frame">

          {safeImgs.length > 0 ? (
            <ImageSlider images={safeImgs} name={name} />
          ) : (
            <div className="dc-img-placeholder">
              <FiCamera size={32} aria-hidden="true" />
              <span>No photo yet</span>
            </div>
          )}

          <div className="dc-img-overlay" aria-hidden="true" />

          {(activeBadges.length > 0 || isEcoFriendly) && (
            <div className="dc-badges">
              {activeBadges.map((key, i) => {
                const { Icon, label, cls } = BADGE_CFG[key];
                return (
                  <span
                    key={key}
                    className={`dc-badge ${cls}`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <Icon size={9} aria-hidden="true" />
                    {label}
                  </span>
                );
              })}
              {isEcoFriendly && (
                <span className="dc-badge dc-badge--eco">🌿 Eco</span>
              )}
            </div>
          )}

          <div className="dc-actions">
            <button
              onClick={handleWishlist}
              aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={isLiked}
              className={[
                "dc-action-btn",
                isLiked   ? "dc-action-btn--liked"      : "",
                heartAnim ? "dc-action-btn--heart-anim" : "",
              ].filter(Boolean).join(" ")}
            >
              <FiHeart
                size={15}
                aria-hidden="true"
                style={{
                  fill:       isLiked ? "#ef4444" : "none",
                  color:      isLiked ? "#ef4444" : "#64748b",
                  transition: "all 0.2s ease",
                }}
              />
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={handleShare}
                aria-label="Share this destination"
                className={[
                  "dc-action-btn",
                  copied ? "dc-action-btn--copied" : "",
                ].filter(Boolean).join(" ")}
              >
                <FiShare2
                  size={14}
                  aria-hidden="true"
                  style={{ color: copied ? "#059669" : "#64748b" }}
                />
              </button>
              {copied && (
                <span className="dc-toast" role="status" aria-live="polite">
                  ✓ Link copied
                </span>
              )}
            </div>
</div>
 
         </div>
       </div>
 
       {/* ════ CARD BODY ════ */}
       <div className="dc-body">
         <div className="dc-footer">
           <button
             className="dc-btn-learn"
             onClick={handleLearnMore}
             aria-label={`Learn more about ${name}`}
           >
             <span>Learn More</span>
             <FiArrowRight
               size={13}
               aria-hidden="true"
               className="dc-btn-arrow"
             />
           </button>
 
           <button
             className="dc-btn-book"
             onClick={goBook}
             aria-label={`Book ${name} now`}
           >
             <FiCalendar size={13} aria-hidden="true" />
             <span>Book Now</span>
           </button>
         </div>
       </div>
     </article>
   );
 
export default DestinationCard;
