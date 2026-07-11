// src/pages/Destinations.jsx
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiX, FiArrowRight, FiRefreshCw, FiMapPin,
  FiStar, FiGlobe, FiGrid, FiList,
  FiChevronLeft, FiChevronRight,
  FiTrendingUp, FiCompass, FiCalendar,
  FiMail, FiHeart, FiEye,
} from 'react-icons/fi';
import { useCountries }   from '../hooks/useCountries';
import { useHeroSlides }  from '../hooks/useHeroSlides';
import { getCountrySlug } from '../utils/countrySlugMap';
import DestinationCard, {
  DestinationCardSkeleton,
} from '../components/common/DestinationCard';
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
    id: 'f1', title: 'Explore Nyungwe', subtitle: 'Ancient Forest, Timeless Wonders',
    description: "Nyungwe Forest is one of Africa's oldest and most biodiverse rainforests, draped in mist and alive with the calls of 13 primate species.",
    image_url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=90',
    cta_label: 'Explore Nyungwe', destination_slug: null,
  },
  {
    id: 'f2', title: 'Discover the Serengeti', subtitle: 'Where the Great Migration Begins',
    description: "Every year, over two million wildebeest thunder across the Serengeti plains in one of nature's most breathtaking spectacles.",
    image_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=90',
    cta_label: 'Explore Serengeti', destination_slug: null,
  },
  {
    id: 'f3', title: 'Climb Kilimanjaro', subtitle: "Africa's Rooftop Awaits You",
    description: "Standing at 5,895 metres above sea level, Kilimanjaro rises majestically above the clouds.",
    image_url: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1920&q=90',
    cta_label: 'Explore Kilimanjaro', destination_slug: null,
  },
  {
    id: 'f4', title: 'Feel Zanzibar', subtitle: 'Spice Islands, Sapphire Seas',
    description: "Zanzibar's turquoise waters lap against shores of powdery white sand, while the scent of cloves drifts through Stone Town.",
    image_url: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1920&q=90',
    cta_label: 'Explore Zanzibar', destination_slug: null,
  },
];

const SORT_OPTIONS = [
  { value: 'featured', label: '✨ Featured' },
  { value: 'popular',  label: '🔥 Most Popular' },
  { value: 'rating',   label: '⭐ Top Rated' },
  { value: 'newest',   label: '🆕 Newest' },
  { value: 'name',     label: '🔤 Name A–Z' },
];

const CATEGORY_TABS = [
  { value: 'all',         label: 'All' },
  { value: 'safari',      label: 'Safari' },
  { value: 'beach',       label: 'Beach' },
  { value: 'mountain',    label: 'Mountain' },
  { value: 'cultural',    label: 'Cultural' },
  { value: 'wildlife',    label: 'Wildlife' },
  { value: 'adventure',   label: 'Adventure' },
  { value: 'eco_tourism', label: 'Eco' },
];

/* ═══════════════════════════════════════════════════════════
   CSS — Exact Explore Design System
═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --dp-green:    #059669;
  --dp-green-lt: #10b981;
  --dp-green-dk: #047857;
  --dp-forest:   #022c22;
  --dp-mint:     #ecfdf5;
  --dp-gold:     #f59e0b;
  --dp-text:     #0f172a;
  --dp-text-2:   #475569;
  --dp-text-3:   #94a3b8;
  --dp-border:   #e2e8f0;
  --dp-surface:  #ffffff;
  --dp-bg:       #f8fafb;
  --dp-radius:   22px;
  --dp-ease:     cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes dp-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes dp-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dp-scale-in {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes dp-spin {
  to { transform: rotate(360deg); }
}
@keyframes dp-ken-burns {
  0%   { transform: scale(1.0); }
  100% { transform: scale(1.1); }
}
@keyframes dp-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes dp-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.dp-page {
  background: var(--dp-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* ════════════════════════
   HERO
════════════════════════ */
.dp-hero {
  position: relative;
  height: 100vh; height: 100dvh;
  min-height: 520px; max-height: 980px;
  overflow: hidden;
  background: var(--dp-forest);
}
.dp-hero__slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 1.8s cubic-bezier(0.4,0,0.2,1);
  z-index: 0;
}
.dp-hero__slide--active { opacity: 1; z-index: 1; }
.dp-hero__slide img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}
.dp-hero__slide--active img {
  animation: dp-ken-burns 12s ease-out forwards;
}
.dp-hero::after {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(180deg,
    rgba(2,44,34,0.25) 0%,
    rgba(2,44,34,0.05) 35%,
    rgba(2,44,34,0.55) 80%,
    rgba(2,44,34,0.88) 100%
  );
  pointer-events: none;
}
.dp-hero::before {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(90deg,
    rgba(2,44,34,0.6) 0%, transparent 55%
  );
  pointer-events: none;
}
.dp-hero__body {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 0 clamp(28px,7vw,100px);
  padding-bottom: clamp(56px,10vh,112px);
}
.dp-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: clamp(14px,2vw,22px);
  opacity: 0;
  animation: dp-fade-up 0.9s var(--dp-ease) 0.05s forwards;
}
.dp-hero__eyebrow-line {
  height: 1.5px; border-radius: 1px;
  width: clamp(20px,4vw,48px);
}
.dp-hero__eyebrow-line--l {
  background: linear-gradient(90deg, transparent, rgba(16,185,129,0.8));
}
.dp-hero__eyebrow-line--r {
  background: linear-gradient(90deg, rgba(16,185,129,0.8), transparent);
}
.dp-hero__eyebrow-text {
  font-size: clamp(10px,1.1vw,12px);
  font-weight: 700; color: #10b981;
  letter-spacing: clamp(2px,0.4vw,4px);
  text-transform: uppercase;
}
.dp-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(34px,6.5vw,80px);
  font-weight: 400; line-height: 1.04;
  color: #fff; margin: 0 0 clamp(10px,1.4vw,18px);
  letter-spacing: -0.03em; max-width: 760px;
  opacity: 0;
  animation: dp-fade-up 0.9s var(--dp-ease) 0.12s forwards;
}
.dp-hero__subtitle {
  font-size: clamp(14px,1.5vw,18px);
  color: rgba(255,255,255,0.62);
  font-style: italic; font-weight: 400;
  margin: 0 0 clamp(8px,1.2vw,16px);
  max-width: 540px; line-height: 1.6;
  opacity: 0;
  animation: dp-fade-up 0.9s var(--dp-ease) 0.25s forwards;
}
.dp-hero__desc {
  font-size: clamp(13px,1.15vw,15px);
  line-height: 1.8; color: rgba(255,255,255,0.68);
  max-width: 500px; margin: 0 0 clamp(22px,2.8vw,36px);
  opacity: 0;
  animation: dp-fade-up 0.9s var(--dp-ease) 0.38s forwards;
}
.dp-hero__actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  opacity: 0;
  animation: dp-fade-up 0.9s var(--dp-ease) 0.5s forwards;
}
.dp-hero__cta {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 14px 32px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 14px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 28px rgba(16,185,129,0.38);
  transition: all 0.35s var(--dp-ease);
  text-decoration: none;
}
.dp-hero__cta:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 40px rgba(16,185,129,0.55);
}
.dp-hero__cta--ghost {
  background: rgba(255,255,255,0.08);
  border: 1.5px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(12px);
  box-shadow: none;
}
.dp-hero__cta--ghost:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.42);
  box-shadow: none; transform: translateY(-2px);
}
.dp-hero__dots {
  position: absolute;
  bottom: clamp(22px,3.5vh,44px);
  right: clamp(28px,5vw,72px);
  z-index: 5; display: flex; gap: 7px;
}
.dp-hero__dot {
  width: 7px; height: 7px; border-radius: 4px;
  background: rgba(255,255,255,0.28);
  border: none; padding: 0; cursor: pointer;
  transition: all 0.5s var(--dp-ease);
}
.dp-hero__dot--active {
  width: 26px; background: rgba(255,255,255,0.9);
  box-shadow: 0 0 8px rgba(255,255,255,0.3);
}
.dp-hero__progress {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; z-index: 5;
  background: rgba(255,255,255,0.06);
}
.dp-hero__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  transform-origin: left;
  animation: dp-progress 8s linear forwards;
}

/* ════════════════════════
   SECTIONS — zero gap
════════════════════════ */
.dp-section {
  padding: clamp(48px,6.5vw,88px) clamp(16px,5vw,56px);
}
.dp-section--white { background: var(--dp-surface); }
.dp-section--bg    { background: var(--dp-bg); }
.dp-section--mint  { background: var(--dp-mint); }
.dp-inner { max-width: 1400px; margin: 0 auto; }

.dp-head {
  text-align: center;
  max-width: 780px;
  margin: 0 auto clamp(28px,4vw,52px);
}
.dp-head--left {
  text-align: left;
  max-width: none;
  margin-left: 0; margin-right: 0;
}
.dp-head--split {
  text-align: left;
  max-width: none;
  margin-left: 0; margin-right: 0;
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 14px;
}
.dp-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px,4.5vw,52px);
  font-weight: 400; line-height: 1.12;
  color: var(--dp-text); margin: 0 0 14px;
  letter-spacing: -0.025em;
}
.dp-desc {
  color: var(--dp-text-2);
  font-size: clamp(14px,1.4vw,17px);
  line-height: 1.78; margin: 0;
  max-width: 640px;
}
.dp-desc--center { margin: 0 auto; }

/* ════════════════════════
   COUNTRY SHOWCARDS
════════════════════════ */
.dp-countries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: clamp(14px,2vw,22px);
}
.dp-showcard {
  position: relative;
  border-radius: var(--dp-radius);
  overflow: hidden;
  background: var(--dp-forest);
  cursor: pointer;
  text-decoration: none; color: #fff;
  display: block;
  min-height: 420px;
  transition: all 0.5s var(--dp-ease);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.dp-showcard:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 56px rgba(5,150,105,0.18), 0 8px 24px rgba(0,0,0,0.1);
}
.dp-showcard__img-wrap {
  position: absolute; inset: 0; overflow: hidden;
}
.dp-showcard__img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 8s cubic-bezier(0.25,0,0.15,1), opacity 1s ease;
}
.dp-showcard:hover .dp-showcard__img { transform: scale(1.06); }
.dp-showcard__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(160deg,
    rgba(2,44,34,0.25) 0%,
    rgba(2,44,34,0.12) 35%,
    rgba(2,44,34,0.65) 100%
  );
  z-index: 1;
}
.dp-showcard__content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: clamp(24px,3.5vw,40px);
}
.dp-showcard__eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.35);
  backdrop-filter: blur(10px);
  color: #a7f3d0;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  width: fit-content; margin-bottom: 14px;
}
.dp-showcard__flag {
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
.dp-showcard__flag img {
  width: 100%; height: 100%; object-fit: cover;
}
.dp-showcard__badge {
  position: absolute;
  top: 16px; right: 16px; z-index: 3;
  padding: 5px 12px; border-radius: 999px;
  background: rgba(16,185,129,0.88);
  backdrop-filter: blur(8px);
  color: #fff; font-size: 11px; font-weight: 700;
}
.dp-showcard__name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(24px,3.5vw,38px);
  font-weight: 400; margin: 0 0 8px;
  color: #fff; line-height: 1.12;
  letter-spacing: -0.02em;
}
.dp-showcard__region {
  display: flex; align-items: center; gap: 5px;
  color: rgba(255,255,255,0.55); font-size: 12px;
  font-weight: 500; margin-bottom: 10px;
}
.dp-showcard__text {
  font-size: clamp(13px,1.1vw,14.5px);
  line-height: 1.72; color: rgba(255,255,255,0.72);
  margin: 0 0 20px; max-width: 420px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dp-showcard__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 26px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 13px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 6px 24px rgba(16,185,129,0.35);
  transition: all 0.3s var(--dp-ease);
  text-decoration: none; width: fit-content;
}
.dp-showcard__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,0.5);
}

/* Skeleton */
.dp-showcard-skel {
  border-radius: var(--dp-radius);
  overflow: hidden; min-height: 420px;
  background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 40%, #e2e8f0 80%);
  background-size: 200%;
  animation: dp-shimmer 1.6s ease infinite;
}

/* ════════════════════════
   POPULAR SLIDER
════════════════════════ */
.dp-slider { position: relative; }
.dp-slider__viewport { overflow: hidden; border-radius: 16px; }
.dp-slider__track {
  display: flex;
  gap: clamp(14px,2vw,22px);
  transition: transform 0.65s var(--dp-ease);
}
.dp-slider__item {
  flex: 0 0 clamp(260px,30vw,360px);
  min-width: 0;
}
.dp-slider__arrows {
  display: flex; gap: 10px;
}
.dp-arrow {
  width: 48px; height: 48px; border-radius: 50%;
  border: 1.5px solid var(--dp-border);
  background: var(--dp-surface);
  display: grid; place-items: center;
  color: var(--dp-text); cursor: pointer;
  transition: all 0.3s var(--dp-ease);
}
.dp-arrow:hover {
  background: var(--dp-green); color: #fff;
  border-color: var(--dp-green);
  box-shadow: 0 6px 20px rgba(5,150,105,0.3);
  transform: scale(1.08);
}
.dp-arrow:disabled { opacity: 0.3; pointer-events: none; }
.dp-slider__dots {
  display: flex; justify-content: center;
  gap: 8px; margin-top: 22px;
}
.dp-slider__dot {
  width: 8px; height: 8px; border-radius: 4px;
  border: none; padding: 0; cursor: pointer;
  background: var(--dp-border);
  transition: all 0.35s var(--dp-ease);
}
.dp-slider__dot--active {
  width: 28px; background: var(--dp-green);
}

/* ════════════════════════
   TOOLBAR
════════════════════════ */
.dp-toolbar {
  background: var(--dp-surface);
  border-radius: var(--dp-radius);
  border: 1.5px solid var(--dp-border);
  padding: clamp(16px,2.2vw,26px);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  margin-bottom: clamp(20px,2.8vw,32px);
}
.dp-toolbar__top {
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
}
.dp-search-wrap {
  flex: 1; min-width: clamp(180px,26vw,300px); position: relative;
}
.dp-search-icon {
  position: absolute; left: 14px; top: 50%;
  transform: translateY(-50%);
  color: var(--dp-text-3); pointer-events: none;
}
.dp-search-input {
  width: 100%; padding: 11px 42px;
  font-size: 13.5px; font-weight: 500;
  border: 1.5px solid var(--dp-border);
  border-radius: 12px; background: var(--dp-bg);
  color: var(--dp-text); font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}
.dp-search-input:focus {
  outline: none; border-color: var(--dp-green);
  background: var(--dp-surface);
  box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
}
.dp-search-clear {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  width: 22px; height: 22px; border-radius: 50%;
  border: none; background: #f1f5f9;
  display: grid; place-items: center;
  cursor: pointer; color: var(--dp-text-2);
  transition: all 0.2s ease;
}
.dp-search-clear:hover { background: #fee2e2; color: #dc2626; }
.dp-search-spinner {
  position: absolute; right: 13px; top: 50%;
  transform: translateY(-50%);
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid #d1fae5; border-top-color: var(--dp-green);
  animation: dp-spin 0.65s linear infinite;
}
.dp-select {
  padding: 10px 34px 10px 14px;
  border: 1.5px solid var(--dp-border);
  border-radius: 12px; background: var(--dp-bg);
  color: var(--dp-text); font-size: 13px; font-weight: 600;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.dp-select:focus {
  outline: none; border-color: var(--dp-green);
  box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
}
.dp-view-toggle {
  display: flex; gap: 3px;
  background: var(--dp-bg); border-radius: 11px; padding: 3px;
  border: 1.5px solid var(--dp-border);
}
.dp-view-btn {
  width: 36px; height: 36px; border-radius: 9px;
  border: none; cursor: pointer; background: transparent;
  display: grid; place-items: center;
  color: var(--dp-text-3); transition: all 0.25s ease;
}
.dp-view-btn--active {
  background: var(--dp-surface); color: var(--dp-green);
  box-shadow: 0 1px 8px rgba(0,0,0,0.07);
}
.dp-toolbar__filters {
  display: flex; gap: 6px; flex-wrap: wrap;
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid var(--dp-border);
}
.dp-filter-tab {
  padding: 7px 18px; border-radius: 999px;
  border: 1.5px solid var(--dp-border);
  background: var(--dp-surface);
  color: var(--dp-text-2); font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all 0.25s var(--dp-ease); white-space: nowrap;
}
.dp-filter-tab:hover {
  border-color: var(--dp-green); color: var(--dp-green);
  background: var(--dp-mint);
}
.dp-filter-tab--active {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: transparent; color: #fff;
  box-shadow: 0 3px 12px rgba(5,150,105,0.28);
}
.dp-toolbar__meta {
  display: flex; justify-content: space-between;
  align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--dp-border);
}
.dp-toolbar__count { font-size: 12.5px; color: var(--dp-text-3); }
.dp-toolbar__count strong { color: var(--dp-green); }
.dp-clear-btn {
  background: none; border: none;
  color: var(--dp-green); font-weight: 700; font-size: 12px;
  cursor: pointer; text-decoration: underline;
  font-family: inherit; padding: 0;
}

/* ════════════════════════
   GRID
════════════════════════ */
.dp-grid {
  display: grid; gap: clamp(14px,2vw,22px);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}
.dp-grid--list { grid-template-columns: 1fr; }
.dp-grid__card { animation: dp-fade-up 0.45s var(--dp-ease) both; }

/* Empty / Error */
.dp-empty {
  grid-column: 1/-1; text-align: center;
  padding: clamp(52px,7vw,80px) 20px;
  background: var(--dp-surface);
  border-radius: var(--dp-radius);
  border: 1.5px solid var(--dp-border);
  animation: dp-scale-in 0.35s var(--dp-ease);
}
.dp-empty h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px,2.8vw,28px);
  color: var(--dp-text); margin: 0 0 8px;
}
.dp-empty p {
  color: var(--dp-text-2); font-size: 14px;
  max-width: 380px; margin: 0 auto 22px; line-height: 1.75;
}
.dp-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px; border-radius: 13px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 13.5px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 16px rgba(5,150,105,0.28);
  transition: all 0.3s var(--dp-ease); text-decoration: none;
}
.dp-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(5,150,105,0.42);
}

/* Load more */
.dp-load-more { text-align: center; margin-top: clamp(32px,4vw,52px); }
.dp-load-more__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 36px; border-radius: 14px;
  border: 1.5px solid var(--dp-border);
  background: var(--dp-surface);
  color: var(--dp-text); font-weight: 700; font-size: 13.5px;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s var(--dp-ease);
}
.dp-load-more__btn:hover {
  border-color: var(--dp-green); color: var(--dp-green);
  background: var(--dp-mint); transform: translateY(-2px);
  box-shadow: 0 4px 18px rgba(5,150,105,0.1);
}

/* ════════════════════════
   CTA BANNER
════════════════════════ */
.dp-cta {
  text-align: center;
  padding: clamp(48px,8vw,88px) clamp(20px,5vw,60px);
  background: linear-gradient(160deg, #0f172a 0%, #022c22 40%, #064e3b 100%);
  background-size: 200% 200%;
  animation: dp-gradient-shift 12s ease infinite;
  position: relative; overflow: hidden;
}
.dp-cta::before, .dp-cta::after {
  content: ''; position: absolute;
  border-radius: 50%; pointer-events: none;
}
.dp-cta::before {
  top: 10%; left: 5%; width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
}
.dp-cta::after {
  bottom: 5%; right: 8%; width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%);
}
.dp-cta > * { position: relative; z-index: 1; }
.dp-cta__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(34px,6vw,60px);
  font-weight: 400; color: #fff;
  line-height: 1.12; margin: 0 0 20px;
  letter-spacing: -0.02em;
}
.dp-cta__desc {
  font-size: clamp(15px,1.4vw,18px);
  color: rgba(255,255,255,0.7);
  line-height: 1.78; max-width: 600px;
  margin: 0 auto 40px;
}
.dp-cta__buttons {
  display: flex; gap: 16px;
  justify-content: center; flex-wrap: wrap;
}
.dp-cta__btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 40px; border-radius: 16px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 800; font-size: 16px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 10px 36px rgba(16,185,129,0.4);
  transition: all 0.35s var(--dp-ease); text-decoration: none;
}
.dp-cta__btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 44px rgba(16,185,129,0.55);
}
.dp-cta__btn-secondary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 36px; border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  color: #fff; font-weight: 700; font-size: 16px;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s ease; text-decoration: none;
}
.dp-cta__btn-secondary:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.45);
  transform: translateY(-2px);
}

.dp-spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2.5px solid #d1fae5; border-top-color: var(--dp-green);
  animation: dp-spin 0.65s linear infinite;
  display: inline-block; vertical-align: middle;
}

/* ════════ Responsive ════════ */
@media (max-width: 768px) {
  .dp-hero { min-height: 480px; max-height: 740px; }
  .dp-hero__cta--ghost { display: none; }
  .dp-countries { grid-template-columns: repeat(auto-fill, minmax(min(100%,260px),1fr)); }
  .dp-showcard { min-height: 340px; }
  .dp-section { padding: clamp(32px,5vw,52px) clamp(14px,4vw,28px); }
}
@media (max-width: 640px) {
  .dp-hero { height: 88vh; height: 88dvh; min-height: 440px; }
  .dp-hero__body { padding: 0 20px; padding-bottom: 60px; }
  .dp-hero__dots { right: 20px; bottom: 18px; }
  .dp-countries { grid-template-columns: 1fr; }
  .dp-slider__item { flex: 0 0 clamp(230px,78vw,290px); }
  .dp-toolbar__top { flex-direction: column; align-items: stretch; }
  .dp-search-wrap { min-width: 0; }
  .dp-view-toggle { display: none; }
  .dp-head--split { flex-direction: column; align-items: flex-start; }
  .dp-showcard { min-height: 300px; }
}
@media (max-width: 380px) {
  .dp-grid { grid-template-columns: 1fr; }
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
  if (document.getElementById('dp-styles')) return;
  const s = document.createElement('style');
  s.id = 'dp-styles';
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
    let c = false;
    setLoading(true);
    apiFetch(`/destinations/popular?limit=${limit}`)
      .then(r => { if (!c) setData(r.data || []); })
      .catch(() => { if (!c) setData([]); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
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
      if (v != null && v !== '' && v !== 'all') q.set(k, v);
    });
    return q.toString();
  }, [JSON.stringify(params)]);
  useEffect(() => {
    let c = false;
    setLoading(true); setError(null);
    apiFetch(`/destinations?${paramStr}`)
      .then(r => { if (!c) { setData(r.data || []); setPagination(r.pagination || null); } })
      .catch(e => { if (!c) { setError(e.message); setData([]); } })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, [paramStr]);
  return { data, pagination, loading, error };
}

/* ═══════════════════════════════════════════════════════════
   HERO
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
    ? `/destinations/${slide.destination_slug}` : '#all-destinations';

  return (
    <section className="dp-hero">
      {slides.map((sl, i) => (
        <div key={sl.id || i} className={`dp-hero__slide${i === active ? ' dp-hero__slide--active' : ''}`}>
          <img src={sl.image_url} alt={sl.title} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
        </div>
      ))}
      <div className="dp-hero__body">
        <div className="dp-hero__eyebrow">
          <div className="dp-hero__eyebrow-line dp-hero__eyebrow-line--l" />
          <span className="dp-hero__eyebrow-text">East Africa's Finest</span>
          <div className="dp-hero__eyebrow-line dp-hero__eyebrow-line--r" />
        </div>
        <h1 className="dp-hero__title" key={`t-${animKey}`}>{slide.title}</h1>
        <p className="dp-hero__subtitle" key={`s-${animKey}`}>{slide.subtitle}</p>
        <p className="dp-hero__desc" key={`d-${animKey}`}>{slide.description}</p>
        <div className="dp-hero__actions" key={`a-${animKey}`}>
          <Link to={destHref} className="dp-hero__cta">
            <FiCompass size={14} /> {slide.cta_label || 'Explore'}
          </Link>
          <a href="#all-destinations" className="dp-hero__cta dp-hero__cta--ghost">
            <FiGlobe size={14} /> All Destinations
          </a>
        </div>
      </div>
      <div className="dp-hero__dots">
        {slides.map((_, i) => (
          <button key={i} className={`dp-hero__dot${i === active ? ' dp-hero__dot--active' : ''}`}
            onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
      <div className="dp-hero__progress">
        <div className="dp-hero__progress-fill" key={`p-${animKey}`} />
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
  const flag     = country.flagUrl || country.flag_url || country.flag || '';
  const isImg    = flag && (flag.startsWith('http') || flag.includes('/'));
  const isEmoji  = flag && !isImg;
  const destCount = country.destinationsCount ?? country.destinations_count ?? country.destinationCount ?? null;
  const heroImg  = country.hero_image_url || country.heroImage || country.coverImage || country.image ||
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80';

  return (
    <div
      className="dp-showcard"
      onClick={() => navigate(`/country/${slug}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/country/${slug}`)}
      style={{ animationDelay: `${index * 0.06}s`, animation: 'dp-fade-up 0.5s var(--dp-ease) both' }}
    >
      <div className="dp-showcard__img-wrap">
        <img className="dp-showcard__img" src={heroImg} alt={country.name} loading="lazy" draggable={false} />
      </div>
      <div className="dp-showcard__overlay" />

      <div className="dp-showcard__flag">
        {isImg ? <img src={flag} alt="" /> : isEmoji ? <span>{flag}</span> : <FiGlobe size={18} color="#059669" />}
      </div>

      {destCount > 0 && (
        <div className="dp-showcard__badge">{destCount} destination{destCount !== 1 ? 's' : ''}</div>
      )}

      <div className="dp-showcard__content">
        <div className="dp-showcard__eyebrow">
          <FiGlobe size={10} /> {country.region || country.continent || 'Africa'}
        </div>
        <h3 className="dp-showcard__name">{country.name}</h3>
        {(country.region || country.continent) && (
          <div className="dp-showcard__region">
            <FiMapPin size={10} /> {country.region || country.continent}
          </div>
        )}
        <p className="dp-showcard__text">
          {country.emotional_description || country.description ||
           `Discover the breathtaking landscapes and vibrant cultures that make ${country.name} unforgettable.`}
        </p>
        <Link to={`/country/${slug}`} className="dp-showcard__btn" onClick={e => e.stopPropagation()}>
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
    <section className="dp-section dp-section--white">
      <div className="dp-inner">
        <div className="dp-head">
          <h2 className="dp-title">Choose Your Country</h2>
          <p className="dp-desc dp-desc--center">
            Each country holds its own magnificent story — from ancient forests
            and volcanic peaks to golden savannahs and turquoise coastlines.
          </p>
        </div>

        {loading ? (
          <div className="dp-countries">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="dp-showcard-skel" />)}
          </div>
        ) : countries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <FiGlobe size={40} style={{ opacity: 0.35, marginBottom: 14 }} />
            <p style={{ margin: 0, fontSize: 15 }}>No countries found.</p>
          </div>
        ) : (
          <>
            <div className="dp-countries">
              {countries.map((c, i) => <CountryCard key={c.id || c.slug} country={c} index={i} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <Link to="/countries" className="dp-cta__btn-primary" style={{ display: 'inline-flex' }}>
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
    if (window.innerWidth < 540) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  }, []);

  const maxIdx = Math.max(0, data.length - VISIBLE);
  const goPrev = () => setIdx(p => Math.max(0, p - 1));
  const goNext = () => setIdx(p => Math.min(maxIdx, p + 1));
  const itemW  = 'clamp(260px,30vw,360px)';
  const gap    = 'clamp(14px,2vw,22px)';

  if (loading) return (
    <section className="dp-section dp-section--bg">
      <div className="dp-inner">
        <div style={{ display: 'flex', gap: 20, overflow: 'hidden' }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ flex: `0 0 ${itemW}`, minWidth: 0 }}><DestinationCardSkeleton /></div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!data.length) return null;

  return (
    <section className="dp-section dp-section--bg">
      <div className="dp-inner">
        <div className="dp-head--split">
          <div>
            <h2 className="dp-title">Popular Destinations</h2>
            <p className="dp-desc" style={{ margin: 0 }}>
              Beloved by travellers from every corner of the world — these remarkable
              destinations have captured hearts and created lifelong memories.
            </p>
          </div>
          <div className="dp-slider__arrows">
            <button className="dp-arrow" onClick={goPrev} disabled={idx === 0} aria-label="Previous">
              <FiChevronLeft size={20} />
            </button>
            <button className="dp-arrow" onClick={goNext} disabled={idx >= maxIdx} aria-label="Next">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="dp-slider">
          <div className="dp-slider__viewport">
            <div className="dp-slider__track" style={{ transform: `translateX(calc(-${idx} * (${itemW} + ${gap})))` }}>
              {data.map((dest, i) => (
                <div key={dest.id} className="dp-slider__item" style={{ flex: `0 0 ${itemW}` }}>
                  <DestinationCard destination={dest} priority={i < 3} />
                </div>
              ))}
            </div>
          </div>
          <div className="dp-slider__dots">
            {Array.from({ length: maxIdx + 1 }, (_, i) => (
              <button key={i} className={`dp-slider__dot${i === idx ? ' dp-slider__dot--active' : ''}`}
                onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ALL DESTINATIONS
═══════════════════════════════════════════════════════════ */
function AllDestinations() {
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
    ...(category !== 'all' ? { category } : {}),
    ...(difficulty !== 'all' ? { difficulty } : {}),
  }), [page, sortBy, debounced, category, difficulty]);

  const { data, pagination, loading, error } = useDestinations(apiParams);

  useEffect(() => { if (!loading) setAllDests(prev => page === 1 ? data : [...prev, ...data]); }, [data, page, loading]);
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
    <section className="dp-section dp-section--white" id="all-destinations">
      <div className="dp-inner">
        {/* Toolbar only — no heading */}
        <div className="dp-toolbar">
          <div className="dp-toolbar__top">
            <div className="dp-search-wrap">
              <FiSearch size={14} className="dp-search-icon" />
              <input type="text" className="dp-search-input"
                placeholder="Search destinations, countries…"
                value={query} onChange={e => setQuery(e.target.value)} />
              {searching && <div className="dp-search-spinner" />}
              {!searching && query && (
                <button className="dp-search-clear" onClick={() => setQuery('')}><FiX size={10} /></button>
              )}
            </div>
            <select className="dp-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className="dp-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="all">All Levels</option>
              {DIFFS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
            <div className="dp-view-toggle">
              <button className={`dp-view-btn${view === 'grid' ? ' dp-view-btn--active' : ''}`} onClick={() => setView('grid')}>
                <FiGrid size={14} />
              </button>
              <button className={`dp-view-btn${view === 'list' ? ' dp-view-btn--active' : ''}`} onClick={() => setView('list')}>
                <FiList size={14} />
              </button>
            </div>
          </div>

          <div className="dp-toolbar__filters">
            {CATEGORY_TABS.map(tab => (
              <button key={tab.value}
                className={`dp-filter-tab${category === tab.value ? ' dp-filter-tab--active' : ''}`}
                onClick={() => setCategory(tab.value)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="dp-toolbar__meta">
            <span className="dp-toolbar__count">
              {loading && page === 1 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="dp-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Loading…
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
            {hasFilters && <button className="dp-clear-btn" onClick={clearAll}>Clear all filters</button>}
          </div>
        </div>

        {/* Grid */}
        {error ? (
          <div className="dp-empty">
            <h3>Could not load destinations</h3>
            <p>{error}</p>
            <button className="dp-btn-primary" onClick={() => window.location.reload()}>
              <FiRefreshCw size={13} /> Try Again
            </button>
          </div>
        ) : (
          <>
            <div className={`dp-grid${view === 'list' ? ' dp-grid--list' : ''}`}>
              {loading && page === 1
                ? Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="dp-grid__card" style={{ animationDelay: `${i * 0.05}s` }}>
                      <DestinationCardSkeleton />
                    </div>
                  ))
                : allDests.length === 0
                  ? (
                    <div className="dp-empty">
                      <h3>{debounced ? `No results for "${debounced}"` : 'No destinations found'}</h3>
                      <p>Try adjusting your filters or searching for something different.</p>
                      <button className="dp-btn-primary" onClick={clearAll}>
                        Clear Filters <FiArrowRight size={13} />
                      </button>
                    </div>
                  )
                  : allDests.map((dest, i) => (
                    <div key={dest.id} className="dp-grid__card"
                      style={{ animationDelay: `${Math.min(i % 6, 5) * 0.05}s` }}>
                      <DestinationCard destination={dest} priority={i < 6} />
                    </div>
                  ))
              }
            </div>

            {hasMore && !loading && (
              <div className="dp-load-more">
                <button className="dp-load-more__btn" onClick={() => setPage(p => p + 1)}>
                  Load More Destinations <FiChevronRight size={15} />
                </button>
              </div>
            )}
            {loading && page > 1 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}><span className="dp-spinner" /></div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function Destinations() {
  useEffect(() => { injectCSS(); }, []);

  return (
    <div className="dp-page">
      <HeroBanner />
      <CountriesSection />
      <PopularSlideshow />
      <AllDestinations />
      {/* CTA — exact Explore final section */}
      <section className="dp-cta">
        <h2 className="dp-cta__title">
          Your East African<br />
          Adventure Starts Here
        </h2>
        <p className="dp-cta__desc">
          Whether you dream of golden savannas, misty mountains, or turquoise shores
          — our expert travel designers will craft a journey as unique as you are.
        </p>
        <div className="dp-cta__buttons">
          <Link to="/booking" className="dp-cta__btn-primary">
            <FiCalendar size={18} /> Plan Your Trip
          </Link>
          <Link to="/contact" className="dp-cta__btn-secondary">
            <FiMail size={18} /> Speak to an Expert
          </Link>
        </div>
      </section>
    </div>
  );
}