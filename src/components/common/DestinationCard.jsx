// src/components/destinations/DestinationCard.jsx
import {
  useState, useEffect, useCallback, memo, useRef, useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin, FiClock, FiStar, FiHeart, FiShare2,
  FiArrowRight, FiAward, FiTrendingUp, FiZap,
  FiCalendar, FiUsers, FiWind, FiChevronLeft, FiChevronRight,
  FiCompass, FiSun, FiCamera, FiBookmark, FiEye,
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
    cls: "dc2-badge--featured",
  },
  isNew: {
    Icon: FiZap,
    label: "New",
    cls: "dc2-badge--new",
  },
  isPopular: {
    Icon: FiTrendingUp,
    label: "Trending",
    cls: "dc2-badge--popular",
  },
};

const DIFF_CLS = {
  easy: "dc2-diff--easy",
  moderate: "dc2-diff--moderate",
  challenging: "dc2-diff--challenging",
  difficult: "dc2-diff--difficult",
  expert: "dc2-diff--expert",
};

const DIFF_LABEL = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
  difficult: "Difficult",
  expert: "Expert",
};

/* ─────────────────────────────────────────────────────────────
   INJECT STYLES (once)
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

/* ── Keyframes ── */
@keyframes dc2-heart-burst {
  0%   { transform:scale(1); }
  15%  { transform:scale(0.85); }
  30%  { transform:scale(1.35); }
  50%  { transform:scale(0.92); }
  70%  { transform:scale(1.12); }
  100% { transform:scale(1); }
}
@keyframes dc2-toast-slide {
  0%   { opacity:0; transform:translate(-50%,8px) scale(0.92); }
  12%  { opacity:1; transform:translate(-50%,0) scale(1); }
  82%  { opacity:1; }
  100% { opacity:0; transform:translate(-50%,-4px) scale(0.96); }
}
@keyframes dc2-shimmer {
  0%   { background-position:200% 0; }
  100% { background-position:-200% 0; }
}
@keyframes dc2-badge-enter {
  from { opacity:0; transform:translateY(-6px) scale(0.88); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes dc2-float {
  0%,100% { transform:translateY(0); }
  50%     { transform:translateY(-3px); }
}
@keyframes dc2-ring-pulse {
  0%   { box-shadow:0 0 0 0 rgba(16,185,129,0.35); }
  70%  { box-shadow:0 0 0 10px rgba(16,185,129,0); }
  100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
}
@keyframes dc2-gradient-shift {
  0%   { background-position:0% 50%; }
  50%  { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}
@keyframes dc2-arrow-nudge {
  0%,100% { transform:translateX(0); }
  50%     { transform:translateX(4px); }
}

/* ══════════════════════════════════════════════════════════
   CARD ROOT
══════════════════════════════════════════════════════════ */
.dc2-card {
  --dc2-radius: 20px;
  --dc2-accent: #059669;
  --dc2-accent-light: #10b981;
  --dc2-accent-dark: #047857;
  --dc2-accent-bg: #ecfdf5;
  --dc2-accent-border: #a7f3d0;
  --dc2-surface: #ffffff;
  --dc2-surface-2: #f8fafb;
  --dc2-text-primary: #0f172a;
  --dc2-text-secondary: #475569;
  --dc2-text-muted: #94a3b8;
  --dc2-border: #e2e8f0;
  --dc2-shadow-sm: 0 1px 3px rgba(15,23,42,.04), 0 1px 2px rgba(15,23,42,.06);
  --dc2-shadow-md: 0 4px 16px rgba(15,23,42,.06), 0 2px 6px rgba(15,23,42,.04);
  --dc2-shadow-lg: 0 20px 50px rgba(15,23,42,.1), 0 8px 24px rgba(5,150,105,.08);
  --dc2-shadow-xl: 0 28px 64px rgba(15,23,42,.12), 0 12px 32px rgba(5,150,105,.12);
  --dc2-transition: cubic-bezier(0.22, 1, 0.36, 1);

  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--dc2-surface);
  border-radius: var(--dc2-radius);
  overflow: hidden;
  border: 1px solid var(--dc2-border);
  box-shadow: var(--dc2-shadow-sm);
  cursor: pointer;
  transition:
    border-color 0.5s var(--dc2-transition),
    box-shadow 0.5s var(--dc2-transition),
    transform 0.5s var(--dc2-transition);
  outline: none;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
}
.dc2-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: calc(var(--dc2-radius) + 1px);
  padding: 1.5px;
  background: linear-gradient(135deg, transparent 40%, rgba(16,185,129,0) 50%, transparent 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.5s var(--dc2-transition);
  z-index: 1;
  pointer-events: none;
}
.dc2-card:hover::before,
.dc2-card--hovered::before {
  background: linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(5,150,105,0.2) 50%, rgba(16,185,129,0.4) 100%);
  opacity: 1;
}
.dc2-card:focus-visible {
  outline: 2.5px solid var(--dc2-accent);
  outline-offset: 3px;
}
.dc2-card:hover,
.dc2-card--hovered {
  border-color: rgba(5,150,105,0.2);
  box-shadow: var(--dc2-shadow-xl);
  transform: translateY(-8px) scale(1.005);
}

/* ══════════════════════════════════════════════════════════
   IMAGE AREA
══════════════════════════════════════════════════════════ */
.dc2-visual {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.dc2-visual__frame {
  position: relative;
  padding-top: 64%;
  overflow: hidden;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}
.dc2-card--compact .dc2-visual__frame {
  padding-top: 52%;
}

.dc2-visual__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition:
    opacity 0.8s ease,
    transform 8s cubic-bezier(0.25, 0, 0.15, 1);
  will-change: transform, opacity;
}
.dc2-visual__img--hidden {
  opacity: 0;
  transform: scale(1.06);
}
.dc2-visual__img--visible {
  opacity: 1;
  transform: scale(1);
}
.dc2-card:hover .dc2-visual__img--visible,
.dc2-card--hovered .dc2-visual__img--visible {
  transform: scale(1.08);
}

/* Glass overlay */
.dc2-visual__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg,
      rgba(15,23,42,0.12) 0%,
      transparent 35%,
      transparent 55%,
      rgba(15,23,42,0.55) 100%
    );
}
.dc2-visual__overlay-top {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100px;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(15,23,42,0.18) 0%, transparent 100%);
}

/* ── Navigation arrows ── */
.dc2-nav-arrows {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc2-card:hover .dc2-nav-arrows,
.dc2-card--hovered .dc2-nav-arrows {
  opacity: 1;
}
.dc2-nav-btn {
  pointer-events: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  transition: all 0.25s var(--dc2-transition);
  color: #334155;
}
.dc2-nav-btn:hover {
  background: #fff;
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}

/* ── Badges ── */
.dc2-badges {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  z-index: 4;
}
.dc2-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 10px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  animation: dc2-badge-enter 0.4s var(--dc2-transition) both;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.dc2-badge--featured {
  background: linear-gradient(135deg, rgba(16,185,129,0.92), rgba(5,150,105,0.92));
  color: #fff;
  box-shadow: 0 4px 14px rgba(5,150,105,0.35);
}
.dc2-badge--new {
  background: rgba(255,255,255,0.88);
  color: var(--dc2-accent-dark);
  border: 1px solid rgba(167,243,208,0.5);
  box-shadow: 0 2px 8px rgba(5,150,105,0.1);
}
.dc2-badge--popular {
  background: linear-gradient(135deg, rgba(251,191,36,0.92), rgba(245,158,11,0.92));
  color: #78350f;
  box-shadow: 0 4px 14px rgba(245,158,11,0.3);
}
.dc2-badge--eco {
  background: rgba(15,23,42,0.72);
  color: #a7f3d0;
  backdrop-filter: blur(10px);
}

/* ── Action cluster ── */
.dc2-actions {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 6;
}
.dc2-action-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(15,23,42,0.1);
  transition: all 0.3s var(--dc2-transition);
  position: relative;
  color: #475569;
}
.dc2-action-btn:hover {
  transform: scale(1.14) translateY(-1px);
  box-shadow: 0 6px 20px rgba(15,23,42,0.16);
  background: rgba(255,255,255,0.95);
}
.dc2-action-btn--liked {
  background: rgba(254,226,226,0.92);
  color: #ef4444;
}
.dc2-action-btn--liked:hover {
  background: rgba(254,226,226,1);
}
.dc2-action-btn--anim {
  animation: dc2-heart-burst 0.55s var(--dc2-transition);
}
.dc2-action-btn--copied {
  background: rgba(236,253,245,0.95);
  color: var(--dc2-accent);
}

/* Toast */
.dc2-share-toast {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  white-space: nowrap;
  background: var(--dc2-text-primary);
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 8px;
  pointer-events: none;
  animation: dc2-toast-slide 2.2s ease forwards;
  z-index: 10;
  letter-spacing: 0.02em;
}

/* ── Image indicator ── */
.dc2-indicators {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 4;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(15,23,42,0.28);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.dc2-indicator {
  height: 4px;
  border-radius: 2px;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.4s var(--dc2-transition);
  background: rgba(255,255,255,0.35);
}
.dc2-indicator--active {
  width: 20px !important;
  background: #fff;
  box-shadow: 0 0 6px rgba(255,255,255,0.5);
}

/* ── Image counter pill ── */
.dc2-img-counter {
  position: absolute;
  bottom: 14px;
  right: 14px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.92);
  font-size: 10.5px;
  font-weight: 600;
}

/* ══════════════════════════════════════════════════════════
   CARD BODY
══════════════════════════════════════════════════════════ */
.dc2-body {
  padding: clamp(16px, 2.2vw, 22px);
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: clamp(10px, 1.4vw, 14px);
}

/* ── Header area ── */
.dc2-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dc2-name {
  margin: 0;
  font-family: 'DM Serif Display', 'Georgia', serif;
  font-size: clamp(18px, 2.2vw, 23px);
  font-weight: 400;
  line-height: 1.22;
  letter-spacing: -0.01em;
  color: var(--dc2-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}
.dc2-card:hover .dc2-name {
  color: var(--dc2-accent-dark);
}
.dc2-loc {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--dc2-text-muted);
  font-size: 12.5px;
  font-weight: 500;
}
.dc2-loc__icon {
  color: var(--dc2-accent-light);
  flex-shrink: 0;
}
.dc2-loc__flag {
  margin-left: 2px;
  line-height: 1;
  font-size: 13px;
}

/* ── Stats row ── */
.dc2-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.dc2-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--dc2-text-secondary);
  font-weight: 500;
}
.dc2-stat__icon {
  flex-shrink: 0;
  color: var(--dc2-text-muted);
}
.dc2-stat--rating .dc2-stat__icon {
  color: #f59e0b;
}
.dc2-stat__value {
  font-weight: 700;
  color: var(--dc2-text-primary);
}
.dc2-stat__label {
  color: var(--dc2-text-muted);
  font-size: 11px;
}
.dc2-stat-divider {
  width: 1px;
  height: 14px;
  background: var(--dc2-border);
  flex-shrink: 0;
}

/* ── Meta chips ── */
.dc2-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.dc2-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.25s ease;
  letter-spacing: 0.01em;
}
.dc2-chip--duration {
  background: var(--dc2-accent-bg);
  color: var(--dc2-accent-dark);
  border: 1px solid var(--dc2-accent-border);
}
.dc2-chip--category {
  background: var(--dc2-surface-2);
  color: var(--dc2-text-secondary);
  border: 1px solid var(--dc2-border);
  text-transform: capitalize;
}

/* Difficulty */
.dc2-diff {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.dc2-diff--easy        { background:#d1fae5; color:#065f46; }
.dc2-diff--moderate    { background:#fef3c7; color:#78350f; }
.dc2-diff--challenging { background:#fed7aa; color:#7c2d12; }
.dc2-diff--difficult   { background:#e9d5ff; color:#581c87; }
.dc2-diff--expert      { background:#fce7f3; color:#831843; }

/* ── Description ── */
.dc2-desc {
  color: var(--dc2-text-secondary);
  font-size: clamp(12.5px, 1.1vw, 13.5px);
  line-height: 1.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 400;
}

/* ── Highlights ── */
.dc2-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc2-hl-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--dc2-accent-bg);
  color: #166534;
  border: 1px solid #dcfce7;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.dc2-hl-chip:hover {
  background: #dcfce7;
  border-color: #bbf7d0;
}
.dc2-hl-more {
  background: var(--dc2-surface-2);
  color: var(--dc2-text-muted);
  border: 1px solid var(--dc2-border);
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

/* ── Separator ── */
.dc2-sep {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--dc2-border), transparent);
  margin: 2px 0;
  border: none;
  flex-shrink: 0;
}

/* ══════════════════════════════════════════════════════════
   CTA FOOTER
══════════════════════════════════════════════════════════ */
.dc2-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}

.dc2-btn-explore {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: clamp(10px, 1.2vw, 13px) clamp(18px, 2.2vw, 26px);
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--dc2-accent-light), var(--dc2-accent));
  background-size: 200% 200%;
  color: #fff;
  font-weight: 700;
  font-size: clamp(12px, 1vw, 13.5px);
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.02em;
  box-shadow:
    0 4px 14px rgba(16,185,129,0.25),
    inset 0 1px 0 rgba(255,255,255,0.15);
  transition: all 0.35s var(--dc2-transition);
  position: relative;
  overflow: hidden;
}
.dc2-btn-explore::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc2-btn-explore:hover::before {
  opacity: 1;
}
.dc2-btn-explore:hover {
  box-shadow:
    0 8px 28px rgba(16,185,129,0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transform: translateY(-2px);
}
.dc2-btn-explore:active {
  transform: translateY(0) scale(0.97);
}
.dc2-btn-explore__arrow {
  transition: transform 0.35s var(--dc2-transition);
}
.dc2-btn-explore:hover .dc2-btn-explore__arrow {
  animation: dc2-arrow-nudge 0.7s ease infinite;
}

.dc2-btn-book {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: clamp(10px, 1.2vw, 13px) clamp(14px, 1.8vw, 20px);
  border-radius: 12px;
  border: 1.5px solid var(--dc2-accent-border);
  background: var(--dc2-surface);
  color: var(--dc2-accent);
  font-weight: 700;
  font-size: clamp(12px, 1vw, 13.5px);
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.02em;
  transition: all 0.3s var(--dc2-transition);
  position: relative;
  overflow: hidden;
}
.dc2-btn-book::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--dc2-accent);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.35s var(--dc2-transition);
  z-index: 0;
}
.dc2-btn-book:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
.dc2-btn-book > * {
  position: relative;
  z-index: 1;
}
.dc2-btn-book:hover {
  color: #fff;
  border-color: var(--dc2-accent);
  box-shadow: 0 6px 20px rgba(5,150,105,0.2);
  transform: translateY(-2px);
}
.dc2-btn-book:active {
  transform: translateY(0) scale(0.97);
}

/* ══════════════════════════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════════════════════════ */
.dc2-skeleton {
  background: var(--dc2-surface);
  border-radius: var(--dc2-radius, 20px);
  overflow: hidden;
  border: 1px solid var(--dc2-border, #e2e8f0);
}
.dc2-skeleton__visual {
  width: 100%;
  padding-top: 64%;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 40%, #f1f5f9 80%);
  background-size: 200%;
  animation: dc2-shimmer 1.6s ease infinite;
  position: relative;
}
.dc2-skeleton__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dc2-skeleton__line {
  height: 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 40%, #f1f5f9 80%);
  background-size: 200%;
  animation: dc2-shimmer 1.6s ease infinite;
}
.dc2-skeleton__row {
  display: flex;
  gap: 8px;
}
.dc2-skeleton__chip {
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 40%, #f1f5f9 80%);
  background-size: 200%;
  animation: dc2-shimmer 1.6s ease infinite;
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width:640px) {
  .dc2-body { padding: 14px; }
  .dc2-footer { flex-wrap: wrap; }
  .dc2-btn-explore,
  .dc2-btn-book { flex: 1; justify-content: center; }
  .dc2-name { font-size: 18px; }
  .dc2-visual__frame { padding-top: 58%; }
  .dc2-card--compact .dc2-visual__frame { padding-top: 48%; }
  .dc2-nav-arrows { display: none; }
  .dc2-action-btn { width: 34px; height: 34px; }
}

@media (max-width:380px) {
  .dc2-stats { gap: 8px; }
  .dc2-stat { font-size: 11px; }
  .dc2-footer { gap: 6px; }
  .dc2-btn-explore,
  .dc2-btn-book { padding: 10px 14px; font-size: 12px; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .dc2-card,
  .dc2-card::before,
  .dc2-visual__img,
  .dc2-action-btn,
  .dc2-btn-explore,
  .dc2-btn-book,
  .dc2-nav-btn,
  .dc2-chip,
  .dc2-hl-chip {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc2-styles")) return;
  const el = document.createElement("style");
  el.id = "dc2-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────────────────────────── */
function ImageSlider({ images, name, hovered }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const total = images.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(
      () => setIdx(p => (p + 1) % total),
      5200,
    );
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = useCallback((e, i) => {
    e.stopPropagation();
    setIdx(i);
    startTimer();
  }, [startTimer]);

  const goPrev = useCallback((e) => {
    e.stopPropagation();
    setIdx(p => (p - 1 + total) % total);
    startTimer();
  }, [total, startTimer]);

  const goNext = useCallback((e) => {
    e.stopPropagation();
    setIdx(p => (p + 1) % total);
    startTimer();
  }, [total, startTimer]);

  return (
    <>
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={i === 0 ? name : ""}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          onError={e => { e.currentTarget.src = FALLBACK; }}
          className={[
            "dc2-visual__img",
            idx === i ? "dc2-visual__img--visible" : "dc2-visual__img--hidden",
          ].join(" ")}
        />
      ))}

      {total > 1 && (
        <>
          {/* Nav arrows */}
          <div className="dc2-nav-arrows">
            <button className="dc2-nav-btn" onClick={goPrev} aria-label="Previous image">
              <FiChevronLeft size={15} />
            </button>
            <button className="dc2-nav-btn" onClick={goNext} aria-label="Next image">
              <FiChevronRight size={15} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="dc2-indicators">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => goTo(e, i)}
                aria-label={`View image ${i + 1}`}
                className={`dc2-indicator${idx === i ? " dc2-indicator--active" : ""}`}
                style={{ width: idx === i ? 20 : 6 }}
              />
            ))}
          </div>

          {/* Counter pill */}
          <div className="dc2-img-counter">
            <FiCamera size={10} />
            {idx + 1}/{total}
          </div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAR RATING
───────────────────────────────────────────────────────────── */
function StarRating({ rating, count }) {
  const filled = Math.round((rating || 0) * 2) / 2;
  return (
    <div className="dc2-stat dc2-stat--rating">
      <div style={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map(s => (
          <FiStar
            key={s}
            size={12}
            color="#f59e0b"
            fill={s <= filled ? "#f59e0b" : "none"}
            style={{ flexShrink: 0 }}
          />
        ))}
      </div>
      <span className="dc2-stat__value">
        {rating != null ? Number(rating).toFixed(1) : "New"}
      </span>
      {count > 0 && (
        <span className="dc2-stat__label">
          ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────────── */
export function DestinationCardSkeleton() {
  useEffect(() => { injectStyles(); }, []);
  return (
    <div className="dc2-skeleton">
      <div className="dc2-skeleton__visual" />
      <div className="dc2-skeleton__body">
        <div className="dc2-skeleton__line" style={{ width: "70%", height: 20 }} />
        <div className="dc2-skeleton__line" style={{ width: "45%", height: 12 }} />
        <div className="dc2-skeleton__row">
          <div className="dc2-skeleton__chip" style={{ width: 60 }} />
          <div className="dc2-skeleton__chip" style={{ width: 80 }} />
          <div className="dc2-skeleton__chip" style={{ width: 50 }} />
        </div>
        <div className="dc2-skeleton__line" style={{ width: "100%", height: 12 }} />
        <div className="dc2-skeleton__line" style={{ width: "82%", height: 12 }} />
        <div className="dc2-skeleton__row" style={{ marginTop: 4 }}>
          <div className="dc2-skeleton__chip" style={{ width: "48%", height: 40, borderRadius: 12 }} />
          <div className="dc2-skeleton__chip" style={{ width: "48%", height: 40, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CARD
───────────────────────────────────────────────────────────── */
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

  useEffect(() => { injectStyles(); }, []);

  if (!destination) return null;

  const {
    slug, id,
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
  const bookId = String(slug || id);
  const isLiked = isWishlisted(destId);
  const safeImgs = images.length > 0 ? images : [heroImage || FALLBACK];
  const activeBadges = Object.keys(BADGE_CFG).filter(k => destination[k]);

  const displayLocation = [location, country]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  /* ── Handlers ── */
  const goToDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate],
  );

  const goToBook = useCallback(
    (e) => {
      e.stopPropagation();
      const params = new URLSearchParams();
      params.set("destination", bookId);
      if (name) params.set("destinationName", name);
      navigate(`/booking?${params.toString()}`);
    },
    [bookId, name, navigate],
  );

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 600);
      toggleWishlist(destId);
      onWishlistToggle?.(destId, !isLiked);
    },
    [destId, isLiked, toggleWishlist, onWishlistToggle],
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
      } catch { /* cancelled */ }
    },
    [destId, name],
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
        "dc2-card",
        compact ? "dc2-card--compact" : "",
        hovered ? "dc2-card--hovered" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* ════ VISUAL AREA ════ */}
      <div className="dc2-visual">
        <div className="dc2-visual__frame">
          <ImageSlider images={safeImgs} name={name} hovered={hovered} />
          <div className="dc2-visual__overlay-top" />
          <div className="dc2-visual__overlay" />

          {/* Badges */}
          {(activeBadges.length > 0 || isEcoFriendly) && (
            <div className="dc2-badges">
              {activeBadges.map((key, i) => {
                const { Icon, label, cls } = BADGE_CFG[key];
                return (
                  <span
                    key={key}
                    className={`dc2-badge ${cls}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <Icon size={10} /> {label}
                  </span>
                );
              })}
              {isEcoFriendly && (
                <span className="dc2-badge dc2-badge--eco">🌿 Eco-Friendly</span>
              )}
            </div>
          )}

          {/* Action cluster */}
          <div className="dc2-actions">
            <button
              onClick={handleWishlist}
              title={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              className={[
                "dc2-action-btn",
                isLiked ? "dc2-action-btn--liked" : "",
                heartAnim ? "dc2-action-btn--anim" : "",
              ].filter(Boolean).join(" ")}
            >
              <FiHeart
                size={15}
                color={isLiked ? "#ef4444" : "#475569"}
                fill={isLiked ? "#ef4444" : "none"}
              />
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={handleShare}
                title="Share destination"
                aria-label="Share destination"
                className={[
                  "dc2-action-btn",
                  copied ? "dc2-action-btn--copied" : "",
                ].filter(Boolean).join(" ")}
              >
                <FiShare2 size={14} color={copied ? "#059669" : "#475569"} />
              </button>
              {copied && (
                <span className="dc2-share-toast">✓ Link copied</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════ BODY ════ */}
      <div className="dc2-body">
        {/* Header */}
        <div className="dc2-header">
          <h3 className="dc2-name">{name}</h3>
          {displayLocation && (
            <div className="dc2-loc">
              <FiMapPin size={12} className="dc2-loc__icon" />
              <span>{displayLocation}</span>
              {countryFlag && (
                <span className="dc2-loc__flag">{countryFlag}</span>
              )}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="dc2-stats">
          <StarRating rating={rating} count={reviewCount} />

          {(duration || durationDays) && (
            <>
              <div className="dc2-stat-divider" />
              <div className="dc2-stat">
                <FiClock size={12} className="dc2-stat__icon" />
                <span>{duration || `${durationDays} days`}</span>
              </div>
            </>
          )}

          {difficulty && (
            <>
              <div className="dc2-stat-divider" />
              <span className={`dc2-diff ${DIFF_CLS[difficulty] || DIFF_CLS.moderate}`}>
                <FiWind size={10} />
                {DIFF_LABEL[difficulty] || difficulty}
              </span>
            </>
          )}
        </div>

        {/* Category + meta chips */}
        {(category || isEcoFriendly) && !compact && (
          <div className="dc2-meta">
            {category && (
              <span className="dc2-chip dc2-chip--category">
                <FiCompass size={10} />
                {category.replace(/_/g, " ")}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {!compact && (
          <p className="dc2-desc">
            {shortDescription || description ||
              "Experience unforgettable adventures, rich culture and breathtaking natural beauty in this remarkable destination."}
          </p>
        )}

        {/* Highlights */}
        {!compact && highlights.length > 0 && (
          <div className="dc2-highlights">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="dc2-hl-chip">
                <FiSun size={9} />
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span className="dc2-hl-more">+{highlights.length - 3} more</span>
            )}
          </div>
        )}

        <hr className="dc2-sep" />

        {/* CTA Footer */}
        <div className="dc2-footer">
          <button
            className="dc2-btn-book"
            onClick={goToBook}
            aria-label={`Book ${name}`}
          >
            <FiCalendar size={13} />
            <span>Book Now</span>
          </button>

          <button
            className="dc2-btn-explore"
            onClick={e => { e.stopPropagation(); goToDetail(); }}
            aria-label={`Explore ${name}`}
          >
            Explore
            <FiArrowRight size={13} className="dc2-btn-explore__arrow" />
          </button>
        </div>
      </div>
    </article>
  );
});

export default DestinationCard;