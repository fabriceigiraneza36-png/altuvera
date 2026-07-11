// src/pages/Destinations.jsx
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiX, FiArrowRight, FiRefreshCw, FiMapPin,
  FiStar, FiGlobe, FiGrid, FiList,
  FiChevronLeft, FiChevronRight, FiAward,
  FiTrendingUp, FiCompass, FiCalendar,
  FiFilter, FiCheck, FiHeart, FiEye,
} from 'react-icons/fi';
import { useCountries }   from '../hooks/useCountries';
import { useHeroSlides }  from '../hooks/useHeroSlides';
import { getCountrySlug } from '../utils/countrySlugMap';
import DestinationCard, {
  DestinationCardSkeleton,
} from '../components/common/DestinationCard';
import { API_URL } from '../utils/apiBase';

/* ═══════════════════════════════════════════════════════════
   API HELPER
═══════════════════════════════════════════════════════════ */
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
    description: "Nyungwe Forest is one of Africa's oldest and most biodiverse rainforests, draped in mist and alive with the calls of 13 primate species.",
    image_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=90',
    cta_label: 'Explore Nyungwe',
    destination_slug: null,
  },
  {
    id: 'f2',
    title: 'Discover the Serengeti',
    subtitle: 'Where the Great Migration Begins',
    description: "Every year, over two million wildebeest thunder across the Serengeti plains in one of nature's most breathtaking spectacles.",
    image_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=90',
    cta_label: 'Explore Serengeti',
    destination_slug: null,
  },
  {
    id: 'f3',
    title: 'Climb Kilimanjaro',
    subtitle: "Africa's Rooftop Awaits You",
    description: "Standing at 5,895 metres above sea level, Kilimanjaro rises majestically above the clouds, its snow-capped summit calling to every soul.",
    image_url: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1920&q=90',
    cta_label: 'Explore Kilimanjaro',
    destination_slug: null,
  },
  {
    id: 'f4',
    title: 'Feel Zanzibar',
    subtitle: 'Spice Islands, Sapphire Seas',
    description: "Zanzibar's turquoise waters lap against shores of powdery white sand, while the scent of cloves drifts through Stone Town's ancient medina.",
    image_url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1920&q=90',
    cta_label: 'Explore Zanzibar',
    destination_slug: null,
  },
];

/* ═══════════════════════════════════════════════════════════
   OPTIONS
═══════════════════════════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: 'featured', label: '✨ Featured'     },
  { value: 'popular',  label: '🔥 Most Popular' },
  { value: 'rating',   label: '⭐ Top Rated'    },
  { value: 'newest',   label: '🆕 Newest'       },
  { value: 'name',     label: '🔤 Name A–Z'     },
];

const CATEGORY_TABS = [
  { value: 'all',         label: 'All'       },
  { value: 'safari',      label: 'Safari'    },
  { value: 'beach',       label: 'Beach'     },
  { value: 'mountain',    label: 'Mountain'  },
  { value: 'cultural',    label: 'Cultural'  },
  { value: 'wildlife',    label: 'Wildlife'  },
  { value: 'adventure',   label: 'Adventure' },
  { value: 'eco_tourism', label: 'Eco'       },
];

/* ═══════════════════════════════════════════════════════════
   CSS — Full Explore-likeness design system
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
  --ds-radius:   22px;
  --ds-ease:     cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes ds-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes ds-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ds-scale-in {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ds-spin {
  to { transform: rotate(360deg); }
}
@keyframes ds-ken-burns {
  0%   { transform: scale(1.0); }
  100% { transform: scale(1.1); }
}
@keyframes ds-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes ds-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ds-pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

/* ── PAGE ── */
.ds-page {
  background: var(--ds-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* ════════════════════════════════════════════
   HERO
════════════════════════════════════════════ */
.ds-hero {
  position: relative;
  height: 100vh;
  height: 100dvh;
  min-height: 520px;
  max-height: 980px;
  overflow: hidden;
  background: var(--ds-forest);
}
.ds-hero__slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}
.ds-hero__slide--active {
  opacity: 1; z-index: 1;
}
.ds-hero__slide img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}
.ds-hero__slide--active img {
  animation: ds-ken-burns 12s ease-out forwards;
}
.ds-hero::after {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(2,44,34,0.25) 0%,
    rgba(2,44,34,0.05) 35%,
    rgba(2,44,34,0.55) 80%,
    rgba(2,44,34,0.85) 100%
  );
  pointer-events: none;
}
.ds-hero::before {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(
    90deg,
    rgba(2,44,34,0.6) 0%,
    transparent 55%
  );
  pointer-events: none;
}
.ds-hero__body {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 0 clamp(28px, 7vw, 100px);
  padding-bottom: clamp(52px, 9vh, 108px);
}
.ds-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: clamp(14px, 2vw, 22px);
}
.ds-hero__eyebrow-line {
  height: 1.5px; border-radius: 1px;
  width: clamp(20px, 4vw, 48px);
}
.ds-hero__eyebrow-line--l {
  background: linear-gradient(90deg, transparent, rgba(16,185,129,0.8));
}
.ds-hero__eyebrow-line--r {
  background: linear-gradient(90deg, rgba(16,185,129,0.8), transparent);
}
.ds-hero__eyebrow-text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(10px, 1.1vw, 13px);
  font-weight: 700;
  color: #10b981;
  letter-spacing: clamp(2px, 0.4vw, 4px);
  text-transform: uppercase;
}
.ds-hero__label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.35);
  backdrop-filter: blur(10px);
  color: #a7f3d0;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  width: fit-content; margin-bottom: 16px;
}
.ds-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(34px, 6.5vw, 80px);
  font-weight: 400; line-height: 1.04;
  color: #fff; margin: 0 0 clamp(10px, 1.4vw, 18px);
  letter-spacing: -0.03em; max-width: 760px;
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.1s forwards;
}
.ds-hero__subtitle {
  font-size: clamp(14px, 1.5vw, 18px);
  color: rgba(255,255,255,0.65);
  font-style: italic; font-weight: 400;
  margin: 0 0 clamp(8px, 1.2vw, 16px);
  max-width: 560px; line-height: 1.6;
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.25s forwards;
}
.ds-hero__desc {
  font-size: clamp(13px, 1.2vw, 15.5px);
  line-height: 1.8; color: rgba(255,255,255,0.7);
  max-width: 520px; margin: 0 0 clamp(22px, 2.8vw, 36px);
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.4s forwards;
}
.ds-hero__actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  opacity: 0;
  animation: ds-fade-up 0.9s var(--ds-ease) 0.55s forwards;
}
.ds-hero__cta {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 14px 32px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 14px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 28px rgba(16,185,129,0.38);
  transition: all 0.35s var(--ds-ease);
  text-decoration: none; letter-spacing: 0.01em;
}
.ds-hero__cta:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 40px rgba(16,185,129,0.55);
}
.ds-hero__cta--ghost {
  background: rgba(255,255,255,0.08);
  border: 1.5px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(12px);
  box-shadow: none;
}
.ds-hero__cta--ghost:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.42);
  box-shadow: none;
  transform: translateY(-2px);
}
.ds-hero__dots {
  position: absolute;
  bottom: clamp(22px, 3.5vh, 44px);
  right: clamp(28px, 5vw, 72px);
  z-index: 5; display: flex; gap: 7px; align-items: center;
}
.ds-hero__dot {
  width: 7px; height: 7px; border-radius: 4px;
  background: rgba(255,255,255,0.28);
  border: none; padding: 0; cursor: pointer;
  transition: all 0.5s var(--ds-ease);
}
.ds-hero__dot--active {
  width: 26px; background: rgba(255,255,255,0.9);
  box-shadow: 0 0 8px rgba(255,255,255,0.3);
}
.ds-hero__progress {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; z-index: 5;
  background: rgba(255,255,255,0.06);
}
.ds-hero__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  transform-origin: left;
  animation: ds-progress 8s linear forwards;
}

/* ════════════════════════════════
   SECTIONS
════════════════════════════════ */
.ds-section {
  padding: clamp(52px, 7vw, 96px) clamp(16px, 5vw, 56px);
}
.ds-section--alt  { background: var(--ds-surface); }
.ds-section--mint { background: var(--ds-mint); }
.ds-section--forest {
  background: linear-gradient(135deg, #022c22, #064e3b 55%, #022c22);
}
.ds-inner { max-width: 1400px; margin: 0 auto; }

/* Section header (Explore-style centered) */
.ds-section-head-center {
  text-align: center;
  max-width: 780px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
}
.ds-section-head-split {
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 14px;
  margin-bottom: clamp(24px, 3.5vw, 44px);
}
.ds-section-label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px; border-radius: 999px;
  background: var(--ds-mint); color: var(--ds-green-dk);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  border: 1px solid #a7f3d0;
  margin-bottom: 14px;
}
.ds-section-label--light {
  background: rgba(16,185,129,0.15);
  color: #a7f3d0;
  border-color: rgba(16,185,129,0.25);
}
.ds-section-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px, 4.5vw, 52px);
  font-weight: 400; line-height: 1.12;
  color: var(--ds-text); margin: 0 0 14px;
  letter-spacing: -0.025em;
}
.ds-section-title--light { color: #fff; }
.ds-section-desc {
  color: var(--ds-text-2);
  font-size: clamp(14px, 1.4vw, 17px);
  line-height: 1.78; margin: 0 auto;
  max-width: 640px;
}
.ds-section-desc--light { color: rgba(255,255,255,0.7); }
.ds-section-desc--left { margin: 0; }

/* See All Link */
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
   COUNTRY CARDS  (Explore showcard style)
════════════════════════════════ */
.ds-countries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: clamp(14px, 2vw, 22px);
}

.ds-country-card {
  position: relative;
  border-radius: var(--ds-radius);
  overflow: hidden;
  background: var(--ds-forest);
  cursor: pointer;
  text-decoration: none; color: #fff;
  display: block;
  min-height: 400px;
  transition: all 0.5s var(--ds-ease);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.ds-country-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 56px rgba(5,150,105,0.18), 0 8px 24px rgba(0,0,0,0.1);
}
.ds-country-card__img-wrap {
  position: absolute; inset: 0; overflow: hidden;
}
.ds-country-card__img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 8s cubic-bezier(0.25, 0, 0.15, 1);
}
.ds-country-card:hover .ds-country-card__img {
  transform: scale(1.07);
}
.ds-country-card__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(2,44,34,0.22) 0%,
    rgba(2,44,34,0.1) 35%,
    rgba(2,44,34,0.68) 100%
  );
  z-index: 1;
}
.ds-country-card__content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: clamp(22px, 3vw, 36px);
}
.ds-country-card__eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 4px 12px; border-radius: 999px;
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.35);
  backdrop-filter: blur(8px);
  color: #a7f3d0; font-size: 11px; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  width: fit-content; margin-bottom: 12px;
}
.ds-country-card__flag-wrap {
  position: absolute;
  top: 16px; left: 16px; z-index: 3;
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  display: grid; place-items: center;
  font-size: 24px; line-height: 1;
  box-shadow: 0 3px 14px rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.5);
  overflow: hidden;
}
.ds-country-card__flag-img {
  width: 100%; height: 100%; object-fit: cover;
}
.ds-country-card__dest-badge {
  position: absolute;
  top: 16px; right: 16px; z-index: 3;
  padding: 5px 12px; border-radius: 999px;
  background: rgba(16,185,129,0.88);
  backdrop-filter: blur(8px);
  color: #fff; font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em;
}
.ds-country-card__name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 400; margin: 0 0 8px;
  color: #fff; line-height: 1.1;
  letter-spacing: -0.02em;
}
.ds-country-card__region {
  display: flex; align-items: center; gap: 5px;
  color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 500;
  margin-bottom: 10px;
}
.ds-country-card__desc {
  font-size: clamp(12.5px, 1vw, 14px);
  line-height: 1.72; color: rgba(255,255,255,0.75);
  margin: 0 0 18px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ds-country-card__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 24px; border-radius: 13px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 13px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 6px 22px rgba(16,185,129,0.35);
  transition: all 0.3s var(--ds-ease);
  text-decoration: none; width: fit-content;
}
.ds-country-card__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,0.5);
}

/* Country skeleton */
.ds-country-skel {
  border-radius: var(--ds-radius);
  overflow: hidden;
  min-height: 400px;
  background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 40%, #e2e8f0 80%);
  background-size: 200%;
  animation: ds-shimmer 1.6s ease infinite;
}

/* ════════════════════════════════
   POPULAR SLIDESHOW
════════════════════════════════ */
.ds-popular { position: relative; }
.ds-popular__viewport {
  overflow: hidden; border-radius: 16px;
}
.ds-popular__track {
  display: flex;
  gap: clamp(14px, 2vw, 22px);
  transition: transform 0.65s var(--ds-ease);
  will-change: transform;
}
.ds-popular__item {
  flex: 0 0 clamp(260px, 30vw, 360px);
  min-width: 0;
}
.ds-popular__arrow {
  width: 46px; height: 46px; border-radius: 50%;
  border: 1.5px solid var(--ds-border);
  background: var(--ds-surface);
  display: grid; place-items: center;
  color: var(--ds-text); cursor: pointer;
  transition: all 0.3s var(--ds-ease);
  flex-shrink: 0;
}
.ds-popular__arrow:hover {
  background: var(--ds-green); color: #fff;
  border-color: var(--ds-green);
  box-shadow: 0 6px 20px rgba(5,150,105,0.3);
  transform: scale(1.08);
}
.ds-popular__arrow:disabled { opacity: 0.3; pointer-events: none; }
.ds-popular__counter {
  display: flex; align-items: center;
  justify-content: center; gap: 14px;
  margin-top: 22px;
}
.ds-popular__counter-text {
  font-size: 12px; font-weight: 700;
  color: var(--ds-text-3); min-width: 50px; text-align: center;
}
.ds-popular__counter-text strong { color: var(--ds-green); }
.ds-popular__counter-bars { display: flex; gap: 5px; }
.ds-popular__counter-bar {
  height: 3px; border-radius: 2px;
  width: 8px;
  background: var(--ds-border);
  transition: all 0.4s var(--ds-ease);
  border: none; padding: 0; cursor: pointer;
}
.ds-popular__counter-bar--active {
  background: var(--ds-green); width: 26px;
}

/* ════════════════════════════════
   TOOLBAR
════════════════════════════════ */
.ds-toolbar {
  background: var(--ds-surface);
  border-radius: var(--ds-radius);
  border: 1.5px solid var(--ds-border);
  padding: clamp(16px, 2.2vw, 26px);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  margin-bottom: clamp(20px, 2.8vw, 32px);
}
.ds-toolbar__top {
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
}
.ds-search-wrap {
  flex: 1; min-width: clamp(180px, 26vw, 300px); position: relative;
}
.ds-search-icon {
  position: absolute; left: 14px; top: 50%;
  transform: translateY(-50%);
  color: var(--ds-text-3); pointer-events: none;
}
.ds-search-input {
  width: 100%; padding: 11px 42px;
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
  width: 22px; height: 22px; border-radius: 50%;
  border: none; background: #f1f5f9;
  display: grid; place-items: center;
  cursor: pointer; color: var(--ds-text-2);
  transition: all 0.2s ease;
}
.ds-search-clear:hover { background: #fee2e2; color: #dc2626; }
.ds-search-spinner {
  position: absolute; right: 13px; top: 50%;
  transform: translateY(-50%);
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid #d1fae5; border-top-color: var(--ds-green);
  animation: ds-spin 0.65s linear infinite;
}
.ds-select {
  padding: 10px 34px 10px 14px;
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
  background: var(--ds-bg); border-radius: 11px; padding: 3px;
  border: 1.5px solid var(--ds-border);
}
.ds-view-btn {
  width: 36px; height: 36px; border-radius: 9px;
  border: none; cursor: pointer; background: transparent;
  display: grid; place-items: center;
  color: var(--ds-text-3); transition: all 0.25s ease;
}
.ds-view-btn--active {
  background: var(--ds-surface); color: var(--ds-green);
  box-shadow: 0 1px 8px rgba(0,0,0,0.07);
}

/* Category Tabs */
.ds-toolbar__filters {
  display: flex; gap: 6px; flex-wrap: wrap;
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid var(--ds-border);
}
.ds-filter-tab {
  padding: 7px 18px; border-radius: 999px;
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
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: transparent; color: #fff;
  box-shadow: 0 3px 12px rgba(5,150,105,0.28);
}

/* Meta row */
.ds-toolbar__meta {
  display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--ds-border);
}
.ds-toolbar__count { font-size: 12.5px; color: var(--ds-text-3); }
.ds-toolbar__count strong { color: var(--ds-green); }
.ds-clear-btn {
  background: none; border: none;
  color: var(--ds-green); font-weight: 700; font-size: 12px;
  cursor: pointer; text-decoration: underline;
  font-family: inherit; padding: 0;
}

/* ════════════════════════════════
   DESTINATION GRID
════════════════════════════════ */
.ds-grid {
  display: grid; gap: clamp(14px, 2vw, 22px);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
}
.ds-grid--list { grid-template-columns: 1fr; }
.ds-grid__card { animation: ds-fade-up 0.45s var(--ds-ease) both; }

/* Empty / Error */
.ds-empty, .ds-error {
  grid-column: 1/-1; text-align: center;
  padding: clamp(52px, 7vw, 80px) 20px;
  background: var(--ds-surface);
  border-radius: var(--ds-radius);
  border: 1.5px solid var(--ds-border);
  animation: ds-scale-in 0.35s var(--ds-ease);
}
.ds-empty__icon, .ds-error__icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(135deg, rgba(236,253,245,0.8), rgba(209,250,229,0.4));
  border: 1.5px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--ds-green); margin: 0 auto 16px; font-size: 28px;
}
.ds-empty h3, .ds-error h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px, 2.8vw, 28px);
  color: var(--ds-text); margin: 0 0 8px;
}
.ds-empty p, .ds-error p {
  color: var(--ds-text-2); font-size: 14px;
  max-width: 380px; margin: 0 auto 22px; line-height: 1.75;
}
.ds-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px; border-radius: 13px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 13.5px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 16px rgba(5,150,105,0.28);
  transition: all 0.3s var(--ds-ease); text-decoration: none;
}
.ds-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(5,150,105,0.42);
}

/* Load more */
.ds-load-more { text-align: center; margin-top: clamp(32px, 4vw, 52px); }
.ds-load-more__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 36px; border-radius: 14px;
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

/* ════════════════════════════════
   FINAL CTA BANNER  (mirrors Explore .ex-cta)
════════════════════════════════ */
.ds-cta-banner {
  text-align: center;
  padding: clamp(52px, 8vw, 96px) clamp(20px, 5vw, 64px);
  background: linear-gradient(160deg, #0f172a 0%, #022c22 40%, #064e3b 100%);
  background-size: 200% 200%;
  animation: ds-gradient-shift 12s ease infinite;
  position: relative; overflow: hidden;
  border-radius: var(--ds-radius);
  margin-top: clamp(28px, 4vw, 48px);
}
.ds-cta-banner::before {
  content: '';
  position: absolute;
  top: 8%; left: 4%; width: 380px; height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.ds-cta-banner::after {
  content: '';
  position: absolute;
  bottom: 4%; right: 6%; width: 280px; height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.ds-cta-banner > * { position: relative; z-index: 1; }
.ds-cta-banner__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(30px, 5.5vw, 58px);
  font-weight: 400; color: #fff;
  line-height: 1.1; margin: 0 0 16px;
  letter-spacing: -0.02em;
}
.ds-cta-banner__desc {
  font-size: clamp(14px, 1.4vw, 17px);
  color: rgba(255,255,255,0.68);
  line-height: 1.78; max-width: 560px;
  margin: 0 auto 36px;
}
.ds-cta-banner__stats {
  display: flex; gap: clamp(20px, 4vw, 48px);
  flex-wrap: wrap; justify-content: center;
  margin-bottom: 36px;
}
.ds-cta-banner__stat-val {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(26px, 3.5vw, 44px);
  font-weight: 400; color: #fff; line-height: 1;
}
.ds-cta-banner__stat-label {
  font-size: 11px; color: rgba(255,255,255,0.45);
  font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; margin-top: 5px;
}
.ds-cta-banner__buttons {
  display: flex; gap: 14px;
  justify-content: center; flex-wrap: wrap;
}
.ds-cta-banner__btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 38px; border-radius: 16px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 800; font-size: 15px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 10px 36px rgba(16,185,129,0.4);
  transition: all 0.35s var(--ds-ease); text-decoration: none;
}
.ds-cta-banner__btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 44px rgba(16,185,129,0.55);
}
.ds-cta-banner__btn-secondary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 34px; border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(12px);
  color: #fff; font-weight: 700; font-size: 15px;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s ease; text-decoration: none;
}
.ds-cta-banner__btn-secondary:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.42);
  transform: translateY(-2px);
}

/* Spinner */
.ds-spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2.5px solid #d1fae5; border-top-color: var(--ds-green);
  animation: ds-spin 0.65s linear infinite;
  display: inline-block; vertical-align: middle;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .ds-hero { max-height: 840px; }
}
@media (max-width: 768px) {
  .ds-hero { min-height: 480px; max-height: 740px; }
  .ds-hero__cta--ghost { display: none; }
  .ds-countries {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  }
  .ds-country-card { min-height: 340px; }
}
@media (max-width: 640px) {
  .ds-hero { height: 88vh; height: 88dvh; min-height: 440px; }
  .ds-hero__body { padding: 0 20px; padding-bottom: 60px; }
  .ds-hero__dots { right: 20px; bottom: 18px; }
  .ds-countries { grid-template-columns: 1fr; }
  .ds-popular__item { flex: 0 0 clamp(230px, 78vw, 290px); }
  .ds-toolbar__top { flex-direction: column; align-items: stretch; }
  .ds-search-wrap { min-width: 0; }
  .ds-view-toggle { display: none; }
  .ds-section-head-split { flex-direction: column; align-items: flex-start; }
  .ds-cta-banner__stats { gap: 20px; }
}
@media (max-width: 380px) {
  .ds-grid { grid-template-columns: 1fr; }
  .ds-country-card { min-height: 300px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ds-styles-v2')) return;
  const s = document.createElement('style');
  s.id = 'ds-styles-v2';
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
      .catch(() => { if (!cancelled) setData([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
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
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [paramStr]);

  return { data, pagination, loading, error };
}

/* ═══════════════════════════════════════════════════════════
   HERO BANNER
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
    setActive(i); setAnimKey(k => k + 1);
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
      {slides.map((sl, i) => (
        <div key={sl.id || i} className={`ds-hero__slide${i === active ? ' ds-hero__slide--active' : ''}`}>
          <img src={sl.image_url} alt={sl.title} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
        </div>
      ))}

      <div className="ds-hero__body">
        {/* Eyebrow */}
        <div className="ds-hero__eyebrow">
          <div className="ds-hero__eyebrow-line ds-hero__eyebrow-line--l" />
          <span className="ds-hero__eyebrow-text">East Africa's Finest</span>
          <div className="ds-hero__eyebrow-line ds-hero__eyebrow-line--r" />
        </div>

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
            <FiCompass size={14} />
            {slide.cta_label || 'Explore'}
          </Link>
          <a href="#destinations" className="ds-hero__cta ds-hero__cta--ghost">
            <FiGlobe size={14} />
            All Destinations
          </a>
        </div>
      </div>

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

  const flag    = country.flagUrl || country.flag_url || country.flag || '';
  const isImg   = flag && (flag.startsWith('http') || flag.includes('/'));
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
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80';

  return (
    <div
      className="ds-country-card"
      onClick={() => navigate(`/country/${slug}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/country/${slug}`)}
      aria-label={`Explore ${country.name}`}
      style={{ animationDelay: `${index * 0.06}s`, animation: 'ds-fade-up 0.5s var(--ds-ease) both' }}
    >
      <div className="ds-country-card__img-wrap">
        <img
          className="ds-country-card__img"
          src={heroImg} alt={country.name}
          loading="lazy" draggable={false}
        />
        <div className="ds-country-card__overlay" />
      </div>

      {/* Flag */}
      <div className="ds-country-card__flag-wrap">
        {isImg ? (
          <img className="ds-country-card__flag-img" src={flag} alt={`${country.name} flag`} />
        ) : isEmoji ? (
          <span style={{ fontSize: 24 }}>{flag}</span>
        ) : (
          <FiGlobe size={18} color="#059669" />
        )}
      </div>

      {/* Dest count */}
      {destCount > 0 && (
        <div className="ds-country-card__dest-badge">
          {destCount} destination{destCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Content */}
      <div className="ds-country-card__content">
        <div className="ds-country-card__eyebrow">
          <FiGlobe size={10} />
          {country.region || country.continent || 'Africa'}
        </div>
        <h3 className="ds-country-card__name">{country.name}</h3>
        {(country.region || country.continent) && (
          <div className="ds-country-card__region">
            <FiMapPin size={10} />
            {country.region || country.continent}
          </div>
        )}
        <p className="ds-country-card__desc">
          {country.emotional_description ||
           country.description ||
           `Discover the breathtaking landscapes and vibrant cultures that make ${country.name} unforgettable.`}
        </p>
        <Link
          to={`/country/${slug}`}
          className="ds-country-card__btn"
          onClick={e => e.stopPropagation()}
        >
          Explore <FiArrowRight size={12} />
        </Link>
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
        <div className="ds-section-head-center">
          <div className="ds-section-label">
            <FiGlobe size={11} /> Countries
          </div>
          <h2 className="ds-section-title">Choose Your Country</h2>
          <p className="ds-section-desc">
            Each country holds its own magnificent story — from ancient forests and volcanic peaks
            to golden savannahs and turquoise coastlines.
          </p>
        </div>

        {loading ? (
          <div className="ds-countries">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="ds-country-skel" />
            ))}
          </div>
        ) : countries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <FiGlobe size={40} style={{ marginBottom: 14, opacity: 0.35 }} />
            <p style={{ margin: 0, fontSize: 15 }}>No countries found.</p>
          </div>
        ) : (
          <>
            <div className="ds-countries">
              {countries.map((c, i) => (
                <CountryCard key={c.id || c.slug} country={c} index={i} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <Link to="/countries" className="ds-cta-banner__btn-primary" style={{ display: 'inline-flex' }}>
                <FiGlobe size={15} /> Browse All Countries <FiArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   POPULAR SLIDESHOW
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
  const itemW  = 'clamp(260px, 30vw, 360px)';
  const gap    = 'clamp(14px, 2vw, 22px)';

  if (loading) return (
    <section className="ds-section" id="popular">
      <div className="ds-inner">
        <div style={{ display: 'flex', gap: 20, overflow: 'hidden' }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ flex: `0 0 ${itemW}`, minWidth: 0 }}>
              <DestinationCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!data.length) return null;

  return (
    <section className="ds-section" id="popular">
      <div className="ds-inner">
        <div className="ds-section-head-split">
          <div>
            <div className="ds-section-label">
              <FiTrendingUp size={11} /> Popular
            </div>
            <h2 className="ds-section-title">Popular Destinations</h2>
            <p className="ds-section-desc ds-section-desc--left">
              Beloved by travellers from every corner of the world — these remarkable destinations
              have captured hearts and created lifelong memories.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="ds-popular__arrow"
              onClick={goPrev} disabled={idx === 0}
              aria-label="Previous"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              className="ds-popular__arrow"
              onClick={goNext} disabled={idx >= maxIdx}
              aria-label="Next"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="ds-popular">
          <div className="ds-popular__viewport">
            <div
              className="ds-popular__track"
              style={{ transform: `translateX(calc(-${idx} * (${itemW} + ${gap})))` }}
            >
              {data.map((dest, i) => (
                <div key={dest.id} className="ds-popular__item" style={{ flex: `0 0 ${itemW}` }}>
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
                  style={{ width: i === idx ? 26 : 8 }}
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

  useEffect(() => { setPage(1); setAllDests([]); }, [debounced, category, difficulty, sortBy]);

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
    <section className="ds-section ds-section--alt" id="destinations">
      <div className="ds-inner">
        <div className="ds-section-head-center">
          <div className="ds-section-label">
            <FiCompass size={11} /> Destinations
          </div>
          <h2 className="ds-section-title">Find Your Adventure</h2>
          <p className="ds-section-desc">
            Browse, filter and discover{stats.total > 0 ? ` all ${stats.total}` : ''} incredible
            destinations across Africa and beyond.
          </p>
        </div>

        {/* Toolbar */}
        <div className="ds-toolbar">
          <div className="ds-toolbar__top">
            <div className="ds-search-wrap">
              <FiSearch size={14} className="ds-search-icon" />
              <input
                type="text" className="ds-search-input"
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

            <select className="ds-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select className="ds-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="all">All Levels</option>
              {DIFFS.map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
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
              <button className="ds-clear-btn" onClick={clearAll}>Clear all filters</button>
            )}
          </div>
        </div>

        {/* Grid */}
        {error ? (
          <div className="ds-error">
            <div className="ds-error__icon">⚠️</div>
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
                      <div className="ds-empty__icon">
                        <FiSearch size={28} />
                      </div>
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
                <button className="ds-load-more__btn" onClick={() => setPage(p => p + 1)}>
                  Load More Destinations <FiChevronRight size={15} />
                </button>
              </div>
            )}
            {loading && page > 1 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <span className="ds-spinner" />
              </div>
            )}
          </>
        )}

        {/* CTA BANNER */}
        {!loading && allDests.length > 0 && (
          <div className="ds-cta-banner">
            <h2 className="ds-cta-banner__title">
              {total > 0 ? `${total} Destinations` : 'Every Destination'}<br />
              <span style={{ fontStyle: 'italic', opacity: 0.88 }}>Waiting for You</span>
            </h2>
            <p className="ds-cta-banner__desc">
              Our complete collection spans extraordinary wilderness, ancient cultures and pristine
              coastlines across the continent.
            </p>

            {(stats.total > 0 || stats.countries > 0) && (
              <div className="ds-cta-banner__stats">
                {stats.total > 0 && (
                  <div>
                    <div className="ds-cta-banner__stat-val">{stats.total}+</div>
                    <div className="ds-cta-banner__stat-label">Destinations</div>
                  </div>
                )}
                {stats.countries > 0 && (
                  <div>
                    <div className="ds-cta-banner__stat-val">{stats.countries}</div>
                    <div className="ds-cta-banner__stat-label">Countries</div>
                  </div>
                )}
                <div>
                  <div className="ds-cta-banner__stat-val">5★</div>
                  <div className="ds-cta-banner__stat-label">Avg Rating</div>
                </div>
                <div>
                  <div className="ds-cta-banner__stat-val">100%</div>
                  <div className="ds-cta-banner__stat-label">Authentic</div>
                </div>
              </div>
            )}

            <div className="ds-cta-banner__buttons">
              <Link to="/booking" className="ds-cta-banner__btn-primary">
                <FiCalendar size={16} /> Plan Your Trip
              </Link>
              <Link to="/contact" className="ds-cta-banner__btn-secondary">
                <FiCompass size={16} /> Speak to an Expert
              </Link>
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
        setStats({ total: ov.total || 0, countries: ov.countries || 0, featured: ov.featured || 0 });
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