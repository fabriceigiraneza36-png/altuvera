// src/pages/Destinations.jsx
// ============================================================
// Destinations Page — Refined Design
// Hero (smooth auto-slideshow) → Countries → Popular → All Destinations
// ============================================================
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiX, FiArrowRight, FiRefreshCw, FiMapPin,
  FiStar, FiGlobe, FiGrid, FiList,
  FiChevronLeft, FiChevronRight, FiAward,
  FiTrendingUp, FiCompass, FiCalendar,
  FiFilter, FiCheck,
} from 'react-icons/fi';
import { useCountries }   from '../hooks/useCountries';
import { useHeroSlides }  from '../hooks/useHeroSlides';
import { getCountrySlug } from '../utils/countrySlugMap';
import DestinationCard, {
  DestinationCardSkeleton,
} from '../components/common/DestinationCard';

/* ═══════════════════════════════════════════════════════════
    API HELPER
 ═══════════════════════════════════════════════════════════ */
import { API_URL } from '../utils/apiBase';

const apiFetch = async (path, opts = {}) => {
  const r = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!r.ok) throw new Error(`API ${r.status}: ${r.statusText}`);
  return r.json();
};

/* ═══════════════════════════════════════════════════════════
   FALLBACK HERO SLIDES
═══════════════════════════════════════════════════════════ */
const FALLBACK_SLIDES = [
  {
    id: 'f1',
    title: 'Explore Nyungwe',
    subtitle: 'Ancient Forest, Timeless Wonders',
    description:
      "Nyungwe Forest is one of Africa's oldest and most biodiverse rainforests, draped in mist and alive with the calls of 13 primate species.",
    image_url:
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=90',
    cta_label: 'Explore Nyungwe',
    destination_slug: null,
  },
  {
    id: 'f2',
    title: 'Discover the Serengeti',
    subtitle: 'Where the Great Migration Begins',
    description:
      'Every year, over two million wildebeest thunder across the Serengeti plains in one of nature\'s most breathtaking spectacles.',
    image_url:
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=90',
    cta_label: 'Explore Serengeti',
    destination_slug: null,
  },
  {
    id: 'f3',
    title: 'Climb Kilimanjaro',
    subtitle: "Africa's Rooftop Awaits You",
    description:
      "Standing at 5,895 metres above sea level, Kilimanjaro rises majestically above the clouds, its snow-capped summit calling to every soul.",
    image_url:
      'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1920&q=90',
    cta_label: 'Explore Kilimanjaro',
    destination_slug: null,
  },
  {
    id: 'f4',
    title: 'Feel Zanzibar',
    subtitle: 'Spice Islands, Sapphire Seas',
    description:
      "Zanzibar's turquoise waters lap against shores of powdery white sand, while the scent of cloves drifts through Stone Town's ancient medina.",
    image_url:
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1920&q=90',
    cta_label: 'Explore Zanzibar',
    destination_slug: null,
  },
];

/* ═══════════════════════════════════════════════════════════
   SORT / CATEGORY OPTIONS
═══════════════════════════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: 'featured', label: '✨ Featured'     },
  { value: 'popular',  label: '🔥 Most Popular' },
  { value: 'rating',   label: '⭐ Top Rated'    },
  { value: 'newest',   label: '🆕 Newest'       },
  { value: 'name',     label: '🔤 Name A–Z'     },
];

const CATEGORY_TABS = [
  { value: 'all',        label: '🌍 All'       },
  { value: 'safari',     label: '🦁 Safari'    },
  { value: 'beach',      label: '🏖 Beach'     },
  { value: 'mountain',   label: '⛰ Mountain'  },
  { value: 'cultural',   label: '🏛 Cultural'  },
  { value: 'wildlife',   label: '🐘 Wildlife'  },
  { value: 'adventure',  label: '🎒 Adventure' },
  { value: 'eco_tourism',label: '🌿 Eco'       },
];

/* ═══════════════════════════════════════════════════════════
   GLOBAL CSS — REFINED
═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --ds-green:    #059669;
  --ds-green-lt: #10b981;
  --ds-green-dk: #047857;
  --ds-forest:   #022c22;
  --ds-mint:     #ecfdf5;
  --ds-gold:     #f59e0b;
  --ds-text:     #0f172a;
  --ds-text-2:   #475569;
  --ds-text-3:   #94a3b8;
  --ds-border:   #e2e8f0;
  --ds-surface:  #ffffff;
  --ds-bg:       #f8fafb;
  --ds-radius:   20px;
  --ds-ease:     cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes ds-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes ds-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes ds-scale-in {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1);    }
}
@keyframes ds-spin {
  to { transform: rotate(360deg); }
}
@keyframes ds-ken-burns {
  0%   { transform: scale(1.0); }
  100% { transform: scale(1.12); }
}
@keyframes ds-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* ── PAGE ── */
.ds-page {
  background: var(--ds-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* ════════════════════════════════════════════
   HERO — Cinematic full-screen auto-slideshow
════════════════════════════════════════════ */
.ds-hero {
  position: relative;
  height: 100vh;
  height: 100dvh;
  min-height: 520px;
  max-height: 960px;
  overflow: hidden;
}

/* Slides with crossfade */
.ds-hero__slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
  will-change: opacity;
}
.ds-hero__slide--active {
  opacity: 1;
  z-index: 1;
}
.ds-hero__slide img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}
.ds-hero__slide--active img {
  animation: ds-ken-burns 12s ease-out forwards;
}

/* Gradient overlays */
.ds-hero::after {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background:
    linear-gradient(180deg,
      rgba(0,0,0,0.18) 0%,
      rgba(0,0,0,0.0) 30%,
      rgba(0,0,0,0.0) 50%,
      rgba(2,44,34,0.72) 100%
    );
  pointer-events: none;
}
.ds-hero::before {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background:
    linear-gradient(90deg,
      rgba(2,44,34,0.52) 0%,
      transparent 50%
    );
  pointer-events: none;
}

/* Content */
.ds-hero__body {
  position: absolute;
  inset: 0; z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 clamp(24px,6vw,96px);
  padding-bottom: clamp(48px,8vh,96px);
}
.ds-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(36px,7vw,88px);
  font-weight: 400;
  line-height: 1.02;
  color: #fff;
  margin: 0 0 clamp(8px,1.2vw,16px);
  letter-spacing: -0.03em;
  max-width: 720px;
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.15s forwards;
}
.ds-hero__subtitle {
  font-size: clamp(14px,1.6vw,19px);
  color: rgba(255,255,255,0.65);
  font-style: italic;
  font-weight: 400;
  margin: 0 0 clamp(10px,1.5vw,20px);
  max-width: 560px;
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.3s forwards;
}
.ds-hero__desc {
  font-size: clamp(13px,1.2vw,15.5px);
  line-height: 1.75;
  color: rgba(255,255,255,0.72);
  max-width: 500px;
  margin: 0 0 clamp(20px,2.5vw,32px);
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.45s forwards;
}
.ds-hero__actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.6s forwards;
}
.ds-hero__cta {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 14px 34px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 14.5px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 28px rgba(16,185,129,0.35);
  transition: all 0.35s var(--ds-ease);
  text-decoration: none; letter-spacing: 0.01em;
}
.ds-hero__cta:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 38px rgba(16,185,129,0.5);
}
.ds-hero__cta--ghost {
  background: rgba(255,255,255,0.1);
  border: 1.5px solid rgba(255,255,255,0.28);
  backdrop-filter: blur(12px);
  box-shadow: none;
}
.ds-hero__cta--ghost:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.45);
  box-shadow: none;
  transform: translateY(-2px);
}

/* Progress indicator — minimal bottom bar */
.ds-hero__progress {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px; z-index: 5;
  background: rgba(255,255,255,0.08);
}
.ds-hero__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  transform-origin: left;
  animation: ds-progress 8s linear forwards;
}

/* Slide indicator dots — bottom right, tiny */
.ds-hero__dots {
  position: absolute;
  bottom: clamp(20px,3vh,40px);
  right: clamp(24px,4vw,64px);
  z-index: 5;
  display: flex; gap: 8px;
  align-items: center;
}
.ds-hero__dot {
  width: 6px; height: 6px; border-radius: 3px;
  background: rgba(255,255,255,0.3);
  border: none; padding: 0; cursor: pointer;
  transition: all 0.5s var(--ds-ease);
}
.ds-hero__dot--active {
  width: 24px;
  background: rgba(255,255,255,0.9);
}

/* ════════════════════════════════
   SECTIONS — tight spacing
════════════════════════════════ */
.ds-section {
  padding: clamp(32px,4.5vw,56px) clamp(16px,5vw,56px);
}
.ds-section--alt { background: var(--ds-surface); }
.ds-inner { max-width: 1400px; margin: 0 auto; }

.ds-section-head {
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 12px;
  margin-bottom: clamp(20px,3vw,36px);
}
.ds-section-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(24px,3.4vw,42px);
  font-weight: 400; line-height: 1.14;
  color: var(--ds-text); margin: 0;
  letter-spacing: -0.02em;
}
.ds-section-title--light { color: #fff; }
.ds-section-desc {
  color: var(--ds-text-2);
  font-size: clamp(13px,1.2vw,15px);
  max-width: 480px; line-height: 1.7;
  margin: 6px 0 0;
}
.ds-see-all {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; border-radius: 12px;
  border: 1.5px solid var(--ds-border);
  background: var(--ds-surface);
  color: var(--ds-text); font-weight: 700;
  font-size: 13px; cursor: pointer;
  text-decoration: none; font-family: inherit;
  transition: all 0.3s var(--ds-ease); white-space: nowrap;
}
.ds-see-all:hover {
  border-color: var(--ds-green); color: var(--ds-green);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(5,150,105,0.1);
}

/* ════════════════════════════════
   COUNTRY CARDS
════════════════════════════════ */
.ds-countries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%,300px),1fr));
  gap: clamp(12px,1.8vw,20px);
}

.ds-country-card {
  position: relative;
  background: var(--ds-surface);
  border-radius: var(--ds-radius);
  border: 1.5px solid var(--ds-border);
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: all 0.4s var(--ds-ease);
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.ds-country-card:hover {
  transform: translateY(-6px);
  border-color: rgba(5,150,105,0.2);
  box-shadow:
    0 20px 48px rgba(5,150,105,0.08),
    0 6px 20px rgba(15,23,42,0.06);
}

.ds-country-card__img-wrap {
  position: relative;
  padding-top: 52%;
  overflow: hidden;
  background: linear-gradient(135deg,#f1f5f9,#e2e8f0);
  flex-shrink: 0;
}
.ds-country-card__img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 6s cubic-bezier(0.25,0,0.15,1);
}
.ds-country-card:hover .ds-country-card__img {
  transform: scale(1.06);
}
.ds-country-card__img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(2,44,34,0.6) 100%);
}
.ds-country-card__flag-wrap {
  position: absolute;
  top: 12px; left: 12px;
  width: 40px; height: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  display: grid; place-items: center;
  font-size: 22px; line-height: 1;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.5);
  overflow: hidden;
}
.ds-country-card__flag-img {
  width: 100%; height: 100%; object-fit: cover;
}
.ds-country-card__dest-badge {
  position: absolute;
  bottom: 10px; right: 10px;
  padding: 4px 11px;
  border-radius: 999px;
  background: rgba(16,185,129,0.88);
  backdrop-filter: blur(8px);
  color: #fff; font-size: 11px; font-weight: 700;
  letter-spacing: 0.03em;
}

.ds-country-card__body {
  padding: clamp(16px,1.8vw,22px);
  display: flex; flex-direction: column;
  flex: 1; gap: 10px;
}
.ds-country-card__name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(18px,2vw,24px);
  font-weight: 400; margin: 0;
  color: var(--ds-text); line-height: 1.2;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}
.ds-country-card:hover .ds-country-card__name {
  color: var(--ds-green-dk);
}
.ds-country-card__region {
  display: flex; align-items: center; gap: 5px;
  color: var(--ds-text-3); font-size: 12px; font-weight: 500;
}
.ds-country-card__desc {
  font-size: clamp(12.5px,1vw,13.5px);
  line-height: 1.7;
  color: var(--ds-text-2);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}
.ds-country-card__best-for {
  display: flex; align-items: flex-start; gap: 7px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--ds-mint);
  border: 1px solid #a7f3d0;
}
.ds-country-card__best-for-label {
  font-size: 10px; font-weight: 700;
  color: var(--ds-green-dk); text-transform: uppercase;
  letter-spacing: 0.06em; flex-shrink: 0; margin-top: 1px;
}
.ds-country-card__best-for-val {
  font-size: 11.5px; color: #166534; font-weight: 500;
  line-height: 1.5;
}
.ds-country-card__footer {
  display: flex; align-items: center;
  justify-content: space-between; gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--ds-border);
  margin-top: auto;
}
.ds-country-card__quote {
  font-size: 11.5px; font-style: italic;
  color: var(--ds-text-3); line-height: 1.5;
  flex: 1; min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ds-country-card__btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 11px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff; font-weight: 700; font-size: 12.5px;
  cursor: pointer; font-family: inherit;
  white-space: nowrap; flex-shrink: 0;
  text-decoration: none;
  box-shadow: 0 3px 12px rgba(16,185,129,0.25);
  transition: all 0.3s var(--ds-ease);
}
.ds-country-card__btn:hover {
  box-shadow: 0 6px 20px rgba(16,185,129,0.4);
  transform: translateY(-1px);
}

/* Country skeleton */
.ds-country-skel {
  border-radius: var(--ds-radius);
  overflow: hidden;
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
}
.ds-country-skel__img {
  padding-top: 52%;
  background: linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 40%,#f1f5f9 80%);
  background-size: 200%;
  animation: ds-shimmer 1.6s ease infinite;
}
.ds-country-skel__body {
  padding: 18px; display: flex; flex-direction: column; gap: 10px;
}
.ds-country-skel__line {
  border-radius: 6px;
  background: linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 40%,#f1f5f9 80%);
  background-size: 200%;
  animation: ds-shimmer 1.6s ease infinite;
}

/* ════════════════════════════════
   POPULAR SLIDESHOW
════════════════════════════════ */
.ds-popular { position: relative; }
.ds-popular__viewport {
  overflow: hidden;
  border-radius: 16px;
}
.ds-popular__track {
  display: flex;
  gap: clamp(12px,1.8vw,20px);
  transition: transform 0.6s var(--ds-ease);
  will-change: transform;
}
.ds-popular__item {
  flex: 0 0 clamp(260px,30vw,360px);
  min-width: 0;
}
.ds-popular__arrow {
  position: absolute; top: 50%;
  transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  border: none; cursor: pointer;
  background: var(--ds-surface);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: grid; place-items: center;
  color: var(--ds-text); z-index: 3;
  transition: all 0.3s var(--ds-ease);
}
.ds-popular__arrow:hover {
  background: var(--ds-green);
  color: #fff;
  box-shadow: 0 6px 24px rgba(5,150,105,0.35);
  transform: translateY(-50%) scale(1.08);
}
.ds-popular__arrow:disabled {
  opacity: 0; pointer-events: none;
}
.ds-popular__arrow--prev { left: -24px; }
.ds-popular__arrow--next { right: -24px; }

.ds-popular__counter {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; margin-top: 20px;
}
.ds-popular__counter-text {
  font-size: 12px; font-weight: 700;
  color: var(--ds-text-3); min-width: 50px; text-align: center;
}
.ds-popular__counter-text strong { color: var(--ds-green); }
.ds-popular__counter-bars { display: flex; gap: 5px; }
.ds-popular__counter-bar {
  height: 3px; border-radius: 2px;
  background: var(--ds-border);
  transition: all 0.4s var(--ds-ease);
  border: none; padding: 0; cursor: pointer;
}
.ds-popular__counter-bar--active {
  background: var(--ds-green);
  width: 24px !important;
}

/* ════════════════════════════════
   TOOLBAR & GRID
════════════════════════════════ */
.ds-toolbar {
  background: var(--ds-surface);
  border-radius: var(--ds-radius);
  border: 1px solid var(--ds-border);
  padding: clamp(14px,2vw,22px);
  box-shadow: 0 1px 12px rgba(0,0,0,0.03);
  margin-bottom: clamp(18px,2.5vw,28px);
}
.ds-toolbar__top {
  display: flex; gap: 10px;
  flex-wrap: wrap; align-items: center;
}
.ds-search-wrap {
  flex: 1; min-width: clamp(180px,26vw,300px);
  position: relative;
}
.ds-search-icon {
  position: absolute; left: 14px; top: 50%;
  transform: translateY(-50%);
  color: var(--ds-text-3); pointer-events: none;
}
.ds-search-input {
  width: 100%; padding: 11px 40px;
  font-size: 13.5px; font-weight: 500;
  border: 1.5px solid var(--ds-border);
  border-radius: 12px; background: var(--ds-bg);
  color: var(--ds-text); font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}
.ds-search-input:focus {
  outline: none;
  border-color: var(--ds-green);
  background: var(--ds-surface);
  box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
}
.ds-search-clear {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  width: 20px; height: 20px; border-radius: 50%;
  border: none; background: #f1f5f9;
  display: grid; place-items: center;
  cursor: pointer; color: var(--ds-text-2);
  transition: all 0.2s;
}
.ds-search-clear:hover { background: #fee2e2; color: #dc2626; }
.ds-search-spinner {
  position: absolute; right: 12px; top: 50%;
  transform: translateY(-50%);
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid #d1fae5; border-top-color: var(--ds-green);
  animation: ds-spin 0.65s linear infinite;
}
.ds-select {
  padding: 10px 34px 10px 13px;
  border: 1.5px solid var(--ds-border);
  border-radius: 12px; background: var(--ds-bg);
  color: var(--ds-text); font-size: 13px; font-weight: 600;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.ds-select:focus {
  outline: none; border-color: var(--ds-green);
  box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
}
.ds-view-toggle {
  display: flex; gap: 3px;
  background: var(--ds-bg); border-radius: 10px; padding: 3px;
  border: 1.5px solid var(--ds-border);
}
.ds-view-btn {
  width: 36px; height: 36px; border-radius: 8px;
  border: none; cursor: pointer; background: transparent;
  display: grid; place-items: center;
  color: var(--ds-text-3);
  transition: all 0.25s ease;
}
.ds-view-btn--active {
  background: var(--ds-surface); color: var(--ds-green);
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
.ds-toolbar__filters {
  display: flex; gap: 6px; flex-wrap: wrap;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--ds-border);
}
.ds-filter-tab {
  padding: 6px 16px; border-radius: 999px;
  border: 1.5px solid var(--ds-border);
  background: var(--ds-surface);
  color: var(--ds-text-2); font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.25s var(--ds-ease); white-space: nowrap;
}
.ds-filter-tab:hover {
  border-color: var(--ds-green); color: var(--ds-green);
  background: var(--ds-mint);
}
.ds-filter-tab--active {
  background: linear-gradient(135deg,#10b981,#059669);
  border-color: transparent; color: #fff;
  box-shadow: 0 3px 12px rgba(5,150,105,0.25);
}
.ds-toolbar__meta {
  display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid var(--ds-border);
}
.ds-toolbar__count {
  font-size: 12.5px; color: var(--ds-text-3);
}
.ds-toolbar__count strong { color: var(--ds-green); }
.ds-clear-btn {
  background: none; border: none;
  color: var(--ds-green); font-weight: 700; font-size: 12px;
  cursor: pointer; text-decoration: underline;
  font-family: inherit; padding: 0;
}

/* Grid */
.ds-grid {
  display: grid; gap: clamp(12px,1.8vw,20px);
  grid-template-columns: repeat(auto-fill,minmax(min(100%,290px),1fr));
}
.ds-grid--list { grid-template-columns: 1fr; }
.ds-grid__card {
  animation: ds-fade-up 0.45s var(--ds-ease) both;
}

/* Empty / Error */
.ds-empty, .ds-error {
  grid-column: 1/-1; text-align: center;
  padding: clamp(44px,6vw,72px) 20px;
  background: var(--ds-surface);
  border-radius: var(--ds-radius);
  border: 1px solid var(--ds-border);
  animation: ds-scale-in 0.35s var(--ds-ease);
}
.ds-empty__emoji, .ds-error__emoji {
  font-size: clamp(40px,7vw,56px); margin-bottom: 14px;
}
.ds-empty h3, .ds-error h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px,2.8vw,28px);
  color: var(--ds-text); margin: 0 0 6px;
}
.ds-empty p, .ds-error p {
  color: var(--ds-text-2); font-size: 13.5px;
  max-width: 380px; margin: 0 auto 20px; line-height: 1.7;
}

.ds-btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 12px 28px; border-radius: 13px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff; font-weight: 700; font-size: 13.5px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 16px rgba(5,150,105,0.28);
  transition: all 0.3s var(--ds-ease); text-decoration: none;
}
.ds-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(5,150,105,0.4);
}

/* Load more */
.ds-load-more { text-align: center; margin-top: clamp(28px,3.5vw,44px); }
.ds-load-more__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 36px; border-radius: 14px;
  border: 1.5px solid var(--ds-border);
  background: var(--ds-surface);
  color: var(--ds-text); font-weight: 700; font-size: 13.5px;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s var(--ds-ease);
}
.ds-load-more__btn:hover {
  border-color: var(--ds-green); color: var(--ds-green);
  background: var(--ds-mint); transform: translateY(-2px);
  box-shadow: 0 4px 18px rgba(5,150,105,0.1);
}

/* View all banner */
.ds-view-all-banner {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  gap: 16px;
  padding: clamp(32px,5vw,56px) clamp(20px,5vw,48px);
  background: linear-gradient(135deg,#022c22,#064e3b 55%,#022c22);
  border-radius: 20px;
  margin-top: clamp(24px,3.5vw,40px);
  position: relative; overflow: hidden;
}
.ds-view-all-banner::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 20% 50%,
      rgba(16,185,129,0.1) 0%, transparent 70%),
    radial-gradient(ellipse 50% 60% at 80% 50%,
      rgba(5,150,105,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.ds-view-all-banner > * { position: relative; z-index: 1; }
.ds-view-all-banner__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(22px,3.5vw,44px);
  font-weight: 400; color: #fff; margin: 0;
  letter-spacing: -0.02em; line-height: 1.12;
}
.ds-view-all-banner__desc {
  color: rgba(255,255,255,0.62);
  font-size: clamp(13px,1.3vw,15px);
  max-width: 440px; line-height: 1.7; margin: 0;
}
.ds-view-all-banner__btn {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 14px 40px; border-radius: 14px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff; font-weight: 800; font-size: 15px;
  cursor: pointer; font-family: inherit; text-decoration: none;
  box-shadow: 0 8px 32px rgba(16,185,129,0.4);
  transition: all 0.35s var(--ds-ease);
}
.ds-view-all-banner__btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 44px rgba(16,185,129,0.55);
}
.ds-view-all-banner__stats {
  display: flex; gap: 32px; flex-wrap: wrap; justify-content: center;
}
.ds-view-all-banner__stat {
  display: flex; flex-direction: column;
  align-items: center; gap: 3px;
}
.ds-view-all-banner__stat-val {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(22px,2.6vw,36px); font-weight: 400;
  color: #fff; line-height: 1;
}
.ds-view-all-banner__stat-label {
  font-size: 11px; color: rgba(255,255,255,0.5);
  font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ds-spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2.5px solid #d1fae5; border-top-color: var(--ds-green);
  animation: ds-spin 0.65s linear infinite;
  display: inline-block;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .ds-hero { max-height: 820px; }
}
@media (max-width: 900px) {
  .ds-popular__arrow--prev { left: 4px; }
  .ds-popular__arrow--next { right: 4px; }
  .ds-popular__arrow {
    width: 40px; height: 40px;
  }
}
@media (max-width: 768px) {
  .ds-hero {
    min-height: 480px;
    max-height: 720px;
  }
  .ds-hero__title {
    font-size: clamp(32px,9vw,52px);
  }
  .ds-section {
    padding: clamp(28px,4vw,40px) clamp(14px,4vw,28px);
  }
  .ds-countries {
    grid-template-columns: repeat(auto-fill, minmax(min(100%,260px),1fr));
  }
}
@media (max-width: 640px) {
  .ds-hero {
    height: 85vh;
    height: 85dvh;
    min-height: 440px;
    max-height: 640px;
  }
  .ds-hero__body {
    padding: 0 20px;
    padding-bottom: 56px;
  }
  .ds-hero__dots {
    right: 20px;
    bottom: 16px;
  }
  .ds-hero__cta--ghost { display: none; }
  .ds-countries { grid-template-columns: 1fr; }
  .ds-popular__item { flex: 0 0 clamp(230px,78vw,290px); }
  .ds-toolbar__top { flex-direction: column; align-items: stretch; }
  .ds-search-wrap { min-width: 0; }
  .ds-view-toggle { display: none; }
  .ds-country-card__best-for { display: none; }
  .ds-view-all-banner__stats { gap: 18px; }
  .ds-section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 380px) {
  .ds-grid { grid-template-columns: 1fr; }
  .ds-hero {
    height: 80vh;
    min-height: 400px;
    max-height: 560px;
  }
  .ds-hero__title {
    font-size: clamp(28px,8.5vw,42px);
  }
}
@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ds-styles')) return;
  const s = document.createElement('style');
  s.id = 'ds-styles';
  s.textContent = PAGE_CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   DATA HOOKS
═══════════════════════════════════════════════════════════ */
function usePopularDestinations(limit = 12) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/destinations/popular?limit=${limit}`)
      .then(r  => { if (!cancelled) setData(r.data || []); })
      .catch(() => { if (!cancelled) setData([]);           })
      .finally(()=> { if (!cancelled) setLoading(false);   });
    return () => { cancelled = true; };
  }, [limit]);

  return { data, loading };
}

function useDestinations(params = {}) {
  const [data, setData]             = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const paramStr = useMemo(() => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '' && v !== 'all') q.set(k, v);
    });
    return q.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    apiFetch(`/destinations?${paramStr}`)
      .then(r => {
        if (!cancelled) {
          setData(r.data || []);
          setPagination(r.pagination || null);
        }
      })
      .catch(e => { if (!cancelled) { setError(e.message); setData([]); } })
      .finally(()=> { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [paramStr]);

  return { data, pagination, loading, error };
}

/* ═══════════════════════════════════════════════════════════
   HERO BANNER — Smooth auto-slideshow, no controls
═══════════════════════════════════════════════════════════ */
function HeroBanner() {
  const { slides: dbSlides, loading } = useHeroSlides();
  const slides = (!loading && dbSlides.length > 0) ? dbSlides : FALLBACK_SLIDES;

  const [active, setActive]   = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef              = useRef(null);

  const advance = useCallback(() => {
    setActive(p => (p + 1) % slides.length);
    setAnimKey(k => k + 1);
  }, [slides.length]);

  useEffect(() => {
    timerRef.current = setInterval(advance, 8000);
    return () => clearInterval(timerRef.current);
  }, [advance]);

  const goTo = useCallback((i) => {
    setActive(i);
    setAnimKey(k => k + 1);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 8000);
  }, [advance]);

  const slide = slides[active] || slides[0];
  if (!slide) return null;

  const destHref = slide.destination_slug
    ? `/destinations/${slide.destination_slug}`
    : '#destinations';

  return (
    <section className="ds-hero" aria-label="Hero banner">
      {/* Slides */}
      {slides.map((sl, i) => (
        <div
          key={sl.id || i}
          className={`ds-hero__slide${i === active ? ' ds-hero__slide--active' : ''}`}
        >
          <img
            src={sl.image_url}
            alt={sl.title}
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        </div>
      ))}

      {/* Content */}
      <div className="ds-hero__body">
        <h1 className="ds-hero__title" key={`t-${animKey}`}>
          {slide.title}
        </h1>
        <p className="ds-hero__subtitle" key={`s-${animKey}`}>
          {slide.subtitle}
        </p>
        <p className="ds-hero__desc" key={`d-${animKey}`}>
          {slide.description}
        </p>
        <div className="ds-hero__actions" key={`a-${animKey}`}>
          <Link to={destHref} className="ds-hero__cta">
            <FiCompass size={15} />
            {slide.cta_label || 'Explore'}
          </Link>
          <a href="#destinations" className="ds-hero__cta ds-hero__cta--ghost">
            <FiGlobe size={14} />
            All Destinations
          </a>
        </div>
      </div>

      {/* Minimal dots */}
      <div className="ds-hero__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`ds-hero__dot${i === active ? ' ds-hero__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="ds-hero__progress">
        <div className="ds-hero__progress-fill" key={`p-${animKey}`} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTRY CARD
═══════════════════════════════════════════════════════════ */
function CountryCard({ country, index }) {
  const navigate = useNavigate();
  const slug     = getCountrySlug(country);

  const flag  = country.flagUrl || country.flag_url || country.flag || '';
  const isImg = flag && (flag.startsWith('http') || flag.includes('/'));
  const isEmoji = flag && !isImg;

  const destCount =
    country.destinationsCount ??
    country.destinations_count ??
    country.destinationCount ?? null;

  const heroImg =
    country.hero_image_url ||
    country.heroImage ||
    country.coverImage ||
    country.image ||
    `https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80`;

  return (
    <div
      className="ds-country-card"
      onClick={() => navigate(`/country/${slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/country/${slug}`)}
      aria-label={`Explore ${country.name}`}
      style={{ animationDelay: `${index * 0.06}s`, animation: 'ds-fade-up 0.5s var(--ds-ease) both' }}
    >
      <div className="ds-country-card__img-wrap">
        <img
          className="ds-country-card__img"
          src={heroImg}
          alt={country.name}
          loading="lazy"
          draggable={false}
        />
        <div className="ds-country-card__img-overlay" />

        <div className="ds-country-card__flag-wrap">
          {isImg ? (
            <img className="ds-country-card__flag-img" src={flag} alt={`${country.name} flag`} />
          ) : isEmoji ? (
            <span style={{ fontSize: 22 }}>{flag}</span>
          ) : (
            <FiGlobe size={18} color="#059669" />
          )}
        </div>

        {destCount > 0 && (
          <div className="ds-country-card__dest-badge">
            {destCount} destination{destCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="ds-country-card__body">
        <h3 className="ds-country-card__name">{country.name}</h3>

        {(country.region || country.continent) && (
          <div className="ds-country-card__region">
            <FiMapPin size={10} color="#10b981" />
            {country.region || country.continent}
          </div>
        )}

        <p className="ds-country-card__desc">
          {country.emotional_description ||
           country.description ||
           `Discover the breathtaking landscapes and vibrant cultures that make ${country.name} unforgettable.`}
        </p>

        {country.best_for && (
          <div className="ds-country-card__best-for">
            <span className="ds-country-card__best-for-label">Best for</span>
            <span className="ds-country-card__best-for-val">{country.best_for}</span>
          </div>
        )}

        <div className="ds-country-card__footer">
          {country.traveler_quote ? (
            <p className="ds-country-card__quote">{country.traveler_quote}</p>
          ) : (
            <span />
          )}
          <Link
            to={`/country/${slug}`}
            className="ds-country-card__btn"
            onClick={e => e.stopPropagation()}
          >
            Explore <FiArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CountrySkeleton() {
  return (
    <div className="ds-country-skel">
      <div className="ds-country-skel__img" />
      <div className="ds-country-skel__body">
        <div className="ds-country-skel__line" style={{ height: 24, width: '55%' }} />
        <div className="ds-country-skel__line" style={{ height: 11, width: '35%' }} />
        <div className="ds-country-skel__line" style={{ height: 12, width: '100%' }} />
        <div className="ds-country-skel__line" style={{ height: 12, width: '85%' }} />
        <div className="ds-country-skel__line" style={{ height: 12, width: '70%' }} />
        <div className="ds-country-skel__line" style={{ height: 36, width: '40%', borderRadius: 10, marginTop: 4 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTRIES SECTION
═══════════════════════════════════════════════════════════ */
function CountriesSection() {
  const { countries, loading } = useCountries({ limit: 12, is_active: true });

  return (
    <section className="ds-section ds-section--alt" id="countries">
      <div className="ds-inner">
        <div className="ds-section-head">
          <div>
            <h2 className="ds-section-title">Choose Your Country</h2>
            <p className="ds-section-desc">
              Each country holds its own magnificent story — from ancient forests and volcanic peaks
              to golden savannahs and turquoise coastlines.
            </p>
          </div>
          <Link to="/countries" className="ds-see-all">
            All Countries <FiArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="ds-countries">
            {Array.from({ length: 6 }, (_, i) => <CountrySkeleton key={i} />)}
          </div>
        ) : countries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <FiGlobe size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No countries found.</p>
          </div>
        ) : (
          <div className="ds-countries">
            {countries.map((c, i) => (
              <CountryCard key={c.id || c.slug} country={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   POPULAR DESTINATIONS SLIDESHOW
═══════════════════════════════════════════════════════════ */
function PopularSlideshow() {
  const { data, loading } = usePopularDestinations(14);
  const [idx, setIdx]     = useState(0);

  const VISIBLE = useMemo(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 540)  return 1;
    if (window.innerWidth < 900)  return 2;
    return 3;
  }, []);

  const maxIdx = Math.max(0, data.length - VISIBLE);

  const goPrev = () => setIdx(p => Math.max(0, p - 1));
  const goNext = () => setIdx(p => Math.min(maxIdx, p + 1));
  const goTo   = (i) => setIdx(Math.max(0, Math.min(i, maxIdx)));

  const itemW = `clamp(260px, 30vw, 360px)`;
  const gap   = `clamp(12px, 1.8vw, 20px)`;

  if (loading) {
    return (
      <section className="ds-section" id="popular">
        <div className="ds-inner">
          <div style={{ display: 'flex', gap: 18, overflow: 'hidden' }}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} style={{ flex: `0 0 ${itemW}`, minWidth: 0 }}>
                <DestinationCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data.length) return null;

  return (
    <section className="ds-section" id="popular">
      <div className="ds-inner">
        <div className="ds-section-head">
          <div>
            <h2 className="ds-section-title">Popular Destinations</h2>
            <p className="ds-section-desc">
              Beloved by travellers from every corner of the world — these remarkable destinations
              have captured hearts and created lifelong memories.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="ds-popular__arrow"
              onClick={goPrev}
              disabled={idx === 0}
              aria-label="Previous"
              style={{ position: 'static', transform: 'none', width: 42, height: 42 }}
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              className="ds-popular__arrow"
              onClick={goNext}
              disabled={idx >= maxIdx}
              aria-label="Next"
              style={{ position: 'static', transform: 'none', width: 42, height: 42 }}
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="ds-popular" style={{ padding: '0 0 4px' }}>
          <div className="ds-popular__viewport">
            <div
              className="ds-popular__track"
              style={{
                transform: `translateX(calc(-${idx} * (${itemW} + ${gap})))`,
              }}
            >
              {data.map((dest, i) => (
                <div
                  key={dest.id}
                  className="ds-popular__item"
                  style={{ flex: `0 0 ${itemW}` }}
                >
                  <DestinationCard destination={dest} priority={i < 3} />
                </div>
              ))}
            </div>
          </div>

          <div className="ds-popular__counter">
            <div className="ds-popular__counter-bars">
              {Array.from({ length: maxIdx + 1 }, (_, i) => (
                <button
                  key={i}
                  className={`ds-popular__counter-bar${i === idx ? ' ds-popular__counter-bar--active' : ''}`}
                  style={{ width: i === idx ? 24 : 7 }}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="ds-popular__counter-text">
              <strong>{idx + 1}</strong> / {maxIdx + 1}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESTINATION GRID
═══════════════════════════════════════════════════════════ */
function DestinationsGrid({ stats }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]         = useState(() => searchParams.get('search') || '');
  const [debounced, setDebounced] = useState(() => searchParams.get('search') || '');
  const [category, setCategory]   = useState(() => searchParams.get('category') || 'all');
  const [difficulty, setDifficulty] = useState(() => searchParams.get('difficulty') || 'all');
  const [sortBy, setSortBy]       = useState(() => searchParams.get('sort') || 'featured');
  const [view, setView]           = useState('grid');
  const [page, setPage]           = useState(1);
  const [allDests, setAllDests]   = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef                  = useRef(null);

  const DIFFS = ['easy', 'moderate', 'challenging', 'difficult', 'expert'];

  const apiParams = useMemo(() => ({
    page, limit: 12, sort: sortBy,
    ...(debounced ? { search: debounced } : {}),
    ...(category && category !== 'all' ? { category } : {}),
    ...(difficulty && difficulty !== 'all' ? { difficulty } : {}),
  }), [page, sortBy, debounced, category, difficulty]);

  const { data, pagination, loading, error } = useDestinations(apiParams);

  useEffect(() => {
    if (loading) return;
    setAllDests(prev => page === 1 ? data : [...prev, ...data]);
  }, [data, page, loading]);

  useEffect(() => {
    setPage(1); setAllDests([]);
  }, [debounced, category, difficulty, sortBy]);

  useEffect(() => {
    if (query === debounced) { setSearching(false); return; }
    setSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setDebounced(query); setSearching(false); }, 320);
    return () => clearTimeout(timerRef.current);
  }, [query, debounced]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (debounced) p.set('search', debounced);
    if (category !== 'all') p.set('category', category);
    if (difficulty !== 'all') p.set('difficulty', difficulty);
    if (sortBy !== 'featured') p.set('sort', sortBy);
    setSearchParams(p, { replace: true });
  }, [debounced, category, difficulty, sortBy, setSearchParams]);

  const clearAll = () => {
    setQuery(''); setDebounced('');
    setCategory('all'); setDifficulty('all'); setSortBy('featured');
  };

  const hasFilters = Boolean(debounced) || category !== 'all' || difficulty !== 'all';
  const hasMore    = pagination && page < pagination.totalPages;
  const total      = pagination?.total ?? 0;

  return (
    <section className="ds-section" id="destinations">
      <div className="ds-inner">
        <div className="ds-section-head">
          <div>
            <h2 className="ds-section-title">Find Your Adventure</h2>
            <p className="ds-section-desc">
              Browse, filter and discover{stats.total > 0 ? ` ${stats.total}` : ''} incredible
              destinations across Africa and beyond.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ds-toolbar">
          <div className="ds-toolbar__top">
            <div className="ds-search-wrap">
              <FiSearch size={14} className="ds-search-icon" />
              <input
                type="text"
                className="ds-search-input"
                placeholder="Search destinations, countries…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {searching && <div className="ds-search-spinner" />}
              {!searching && query && (
                <button className="ds-search-clear" onClick={() => setQuery('')}>
                  <FiX size={10} />
                </button>
              )}
            </div>

            <select
              className="ds-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              className="ds-select"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              {DIFFS.map(d => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>

            <div className="ds-view-toggle">
              <button
                className={`ds-view-btn${view === 'grid' ? ' ds-view-btn--active' : ''}`}
                onClick={() => setView('grid')}
              >
                <FiGrid size={14} />
              </button>
              <button
                className={`ds-view-btn${view === 'list' ? ' ds-view-btn--active' : ''}`}
                onClick={() => setView('list')}
              >
                <FiList size={14} />
              </button>
            </div>
          </div>

          <div className="ds-toolbar__filters">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.value}
                className={`ds-filter-tab${category === tab.value ? ' ds-filter-tab--active' : ''}`}
                onClick={() => setCategory(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ds-toolbar__meta">
            <span className="ds-toolbar__count">
              {loading && page === 1 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="ds-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                  Loading…
                </span>
              ) : (
                <>
                  <strong>{allDests.length}</strong>
                  {total > allDests.length && ` of ${total}`}
                  {' '}destination{allDests.length !== 1 ? 's' : ''}
                  {debounced && <> for <em style={{ color: '#0f172a' }}>"{debounced}"</em></>}
                </>
              )}
            </span>
            {hasFilters && (
              <button className="ds-clear-btn" onClick={clearAll}>
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {error ? (
          <div className="ds-error">
            <div className="ds-error__emoji">⚠️</div>
            <h3>Could not load destinations</h3>
            <p>{error}</p>
            <button className="ds-btn-primary" onClick={() => window.location.reload()}>
              <FiRefreshCw size={13} /> Try Again
            </button>
          </div>
        ) : (
          <>
            <div className={`ds-grid${view === 'list' ? ' ds-grid--list' : ''}`}>
              {loading && page === 1
                ? Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="ds-grid__card" style={{ animationDelay: `${i * 0.05}s` }}>
                      <DestinationCardSkeleton />
                    </div>
                  ))
                : allDests.length === 0
                  ? (
                    <div className="ds-empty">
                      <div className="ds-empty__emoji">🔍</div>
                      <h3>{debounced ? `No results for "${debounced}"` : 'No destinations found'}</h3>
                      <p>Try adjusting your filters or searching for something different.</p>
                      <button className="ds-btn-primary" onClick={clearAll}>
                        Clear Filters <FiArrowRight size={13} />
                      </button>
                    </div>
                  )
                  : allDests.map((dest, i) => (
                      <div
                        key={dest.id}
                        className="ds-grid__card"
                        style={{ animationDelay: `${Math.min(i % 6, 5) * 0.05}s` }}
                      >
                        <DestinationCard destination={dest} priority={i < 6} />
                      </div>
                    ))
              }
            </div>

            {hasMore && !loading && (
              <div className="ds-load-more">
                <button
                  className="ds-load-more__btn"
                  onClick={() => setPage(p => p + 1)}
                >
                  Load More Destinations
                  <FiChevronRight size={15} />
                </button>
              </div>
            )}

            {loading && page > 1 && (
              <div style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8' }}>
                <span className="ds-spinner" />
              </div>
            )}
          </>
        )}

        {/* VIEW ALL BANNER */}
        {!loading && allDests.length > 0 && (
          <div className="ds-view-all-banner">
            <h2 className="ds-view-all-banner__title">
              {total > 0 ? `${total} Destinations` : 'Every Destination'}<br />
              <span style={{ fontStyle: 'italic', opacity: 0.85 }}>Waiting for You</span>
            </h2>
            <p className="ds-view-all-banner__desc">
              Our complete collection spans extraordinary wilderness, ancient cultures and pristine
              coastlines across the continent.
            </p>
            <Link to="/destinations" className="ds-view-all-banner__btn">
              <FiGlobe size={16} />
              View All Destinations
              <FiArrowRight size={15} />
            </Link>
            <div className="ds-view-all-banner__stats">
              {stats.total > 0 && (
                <div className="ds-view-all-banner__stat">
                  <div className="ds-view-all-banner__stat-val">{stats.total}+</div>
                  <div className="ds-view-all-banner__stat-label">Destinations</div>
                </div>
              )}
              {stats.countries > 0 && (
                <div className="ds-view-all-banner__stat">
                  <div className="ds-view-all-banner__stat-val">{stats.countries}</div>
                  <div className="ds-view-all-banner__stat-label">Countries</div>
                </div>
              )}
              <div className="ds-view-all-banner__stat">
                <div className="ds-view-all-banner__stat-val">5★</div>
                <div className="ds-view-all-banner__stat-label">Avg Rating</div>
              </div>
              <div className="ds-view-all-banner__stat">
                <div className="ds-view-all-banner__stat-val">100%</div>
                <div className="ds-view-all-banner__stat-label">Authentic</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function Destinations() {
  const [stats, setStats] = useState({ total: 0, countries: 0, featured: 0 });

  useEffect(() => { injectCSS(); }, []);

  useEffect(() => {
    apiFetch('/destinations/stats')
      .then(r => {
        const ov = r.data?.overview || {};
        setStats({
          total:     ov.total     || 0,
          countries: ov.countries || 0,
          featured:  ov.featured  || 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="ds-page">
      <HeroBanner />
      <CountriesSection />
      <PopularSlideshow />
      <DestinationsGrid stats={stats} />
    </div>
  );
}