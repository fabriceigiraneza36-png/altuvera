// src/pages/Destinations.jsx
// ============================================================
// Destinations Page — Centered hero, scatter-merge card animations
// ============================================================
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiArrowRight, FiMapPin, FiGlobe,
  FiCalendar, FiChevronLeft, FiChevronRight,
  FiTrendingUp, FiMail, FiChevronDown, FiFilter, FiSearch, FiX, FiStar, FiCompass,
} from 'react-icons/fi';
import SEO from '../components/common/SEO';
import AnimatedSection from '../components/common/AnimatedSection';
import DestinationCard, {
  DestinationCardSkeleton,
} from '../components/common/DestinationCard';
import { useCountries } from '../hooks/useCountries';
import { getCountrySlug } from '../utils/countrySlugMap';
import { API_URL } from '../utils/apiBase';
import { useDestinationsList } from '../hooks/useDestinationsList';

/* ═══════════════════════════════════════════════════════════
   API HELPER
═══════════════════════════════════════════════════════════ */
const apiFetch = async (path, opts = {}) => {
  const r = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
};

/* ═══════════════════════════════════════════════════════════
   DATA HOOKS
═══════════════════════════════════════════════════════════ */
function usePopularDestinations(limit = 14) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/destinations/popular?limit=${limit}&include=gallery`)
      .then(r => { if (!cancelled) setData(r.data || []); })
      .catch(() => { if (!cancelled) setData([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);
  return { data, loading };
}

/* ═══════════════════════════════════════════════════════════
   USE IN VIEW — for scroll-triggered animations
═══════════════════════════════════════════════════════════ */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

/* ═══════════════════════════════════════════════════════════
   HERO SLIDES
═══════════════════════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    image: 'https://i.pinimg.com/736x/62/e5/16/62e51677c4c82b392e217cb317b8b381.jpg',
    title: 'Explore Every Corner',
    subtitle: 'of East Africa',
    desc: 'From the thundering Serengeti plains to the misty gorilla forests of Rwanda — discover every handpicked destination in our collection.',
    location: 'East Africa',
  },
  {
    image: 'https://i.pinimg.com/736x/fa/02/5c/fa025c7189d3be96222a7a5d3167d3a5.jpg',
    title: 'Witness the Great',
    subtitle: 'Migration',
    desc: "Over two million wildebeest thunder across the Serengeti plains in one of nature's most breathtaking annual spectacles.",
    location: 'Tanzania & Kenya',
  },
  {
    image: 'https://i.pinimg.com/736x/de/f5/9c/def59c5b8ada86765cbfb235e1d6062b.jpg',
    title: "Conquer Africa's",
    subtitle: 'Highest Peak',
    desc: 'Standing at 5,895 metres above sea level, Kilimanjaro rises majestically above the clouds — calling to every adventurous soul.',
    location: 'Tanzania',
  },
  {
    image: 'https://i.pinimg.com/1200x/75/ca/38/75ca38e363d078e400d289867e9f1e1e.jpg',
    title: 'Sapphire Seas &',
    subtitle: 'Spice Islands',
    desc: "Zanzibar's turquoise waters lap against powdery white shores while the scent of cloves drifts through Stone Town's medina.",
    location: 'Zanzibar, Tanzania',
  },
];

/* ═══════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --dv-green:    #059669;
  --dv-green-lt: #10b981;
  --dv-green-dk: #047857;
  --dv-forest:   #022c22;
  --dv-mint:     #ecfdf5;
  --dv-text:     #0f172a;
  --dv-text-2:   #475569;
  --dv-text-3:   #94a3b8;
  --dv-border:   #e2e8f0;
  --dv-surface:  #ffffff;
  --dv-bg:       #f8fafb;
  --dv-radius:   22px;
  --dv-ease:     cubic-bezier(0.22, 1, 0.36, 1);
  --dv-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dv-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dv-scale-in {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes dv-ken-burns {
  0%   { transform: scale(1.0); }
  100% { transform: scale(1.1); }
}
@keyframes dv-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes dv-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes dv-pin-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-2.5px); }
}
@keyframes dv-pin-ring {
  0%   { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes dv-fog-drift {
  0%   { transform: translateX(-8%) translateY(0); }
  50%  { transform: translateX(6%) translateY(-2%); }
  100% { transform: translateX(-8%) translateY(0); }
}
@keyframes dv-fog-drift-slow {
  0%   { transform: translateX(5%) translateY(2%); }
  50%  { transform: translateX(-5%) translateY(0); }
  100% { transform: translateX(5%) translateY(2%); }
}
@keyframes dv-scroll-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50%       { transform: translateY(6px); opacity: 1; }
}
@keyframes dv-scroll-line {
  0%   { transform: scaleY(0); transform-origin: top; }
  40%  { transform: scaleY(1); transform-origin: top; }
  60%  { transform: scaleY(1); transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}

*, *::before, *::after { box-sizing: border-box; }

.dv-page {
  background: var(--dv-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ═════════════════════════════════════════════════
   HERO  — medium-height, centred, with fog
═════════════════════════════════════════════════ */
.dv-hero {
  position: relative;
  height: clamp(460px, 65vh, 640px);
  overflow: hidden;
  background: var(--dv-forest);
}
.dv-hero__slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 1.6s cubic-bezier(0.4,0,0.2,1);
  z-index: 0;
}
.dv-hero__slide--on { opacity: 1; z-index: 1; }
.dv-hero__slide img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}
.dv-hero__slide--on img { animation: dv-ken-burns 13s ease-out forwards; }

/* Fog */
.dv-hero__fog {
  position: absolute; inset: 0;
  z-index: 2; pointer-events: none;
  overflow: hidden;
}
.dv-hero__fog-layer {
  position: absolute; inset: -20%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  mix-blend-mode: screen;
}
.dv-hero__fog-layer--1 {
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.008' numOctaves='2' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/%3E%3CfeGaussianBlur stdDeviation='30'/%3E%3C/filter%3E%3Crect width='1200' height='800' filter='url(%23f)' opacity='0.7'/%3E%3C/svg%3E");
  animation: dv-fog-drift 32s ease-in-out infinite;
  opacity: 0.42;
}
.dv-hero__fog-layer--2 {
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cfilter id='f2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='19'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0'/%3E%3CfeGaussianBlur stdDeviation='40'/%3E%3C/filter%3E%3Crect width='1200' height='800' filter='url(%23f2)' opacity='0.6'/%3E%3C/svg%3E");
  animation: dv-fog-drift-slow 48s ease-in-out infinite;
  opacity: 0.33;
}
.dv-hero__fog-bottom {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 45%;
  z-index: 2;
  background: linear-gradient(
    to top,
    rgba(255,255,255,0.3) 0%,
    rgba(255,255,255,0.12) 40%,
    rgba(255,255,255,0.04) 70%,
    transparent 100%
  );
  pointer-events: none;
  mix-blend-mode: screen;
}

/* Overlays */
.dv-hero__ov-bottom {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(2,44,34,0.30) 0%,
    rgba(2,44,34,0.15) 45%,
    rgba(2,44,34,0.60) 82%,
    rgba(2,44,34,0.85) 100%
  );
}
.dv-hero__ov-radial {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(2,44,34,0.35) 100%
  );
}
.dv-hero__grain {
  position: absolute; inset: 0; z-index: 4; pointer-events: none; opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
}

/* HERO BODY — centered, medium height */
.dv-hero__body {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 clamp(20px, 5vw, 60px);
  padding-bottom: 60px;
}
.dv-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: clamp(12px,1.8vw,20px);
  opacity: 0; animation: dv-fade-up 0.8s var(--dv-ease) 0.05s forwards;
}
.dv-hero__ey-line {
  height: 1.5px; border-radius: 1px;
  width: clamp(18px,3.5vw,44px);
}
.dv-hero__ey-line--l { background: linear-gradient(90deg,transparent,rgba(16,185,129,0.85)); }
.dv-hero__ey-line--r { background: linear-gradient(90deg,rgba(16,185,129,0.85),transparent); }
.dv-hero__ey-text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(9px,1vw,12px); font-weight: 700;
  color: #10b981; letter-spacing: clamp(2px,0.4vw,4px);
  text-transform: uppercase;
}
.dv-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(34px,5.5vw,66px);
  font-weight: 400; line-height: 1.05;
  color: #fff;
  margin: 0; letter-spacing: -0.03em;
  max-width: 860px;
  opacity: 0; animation: dv-fade-up 0.85s var(--dv-ease) 0.14s forwards;
}
.dv-hero__title em {
  font-style: italic;
  color: rgba(255,255,255,0.68);
  display: block;
}
.dv-hero__desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(13px,1.3vw,16px);
  color: rgba(255,255,255,0.76);
  line-height: 1.75;
  max-width: 580px;
  margin: clamp(14px,2vw,20px) auto clamp(18px,2.5vw,28px);
  font-weight: 300;
  opacity: 0; animation: dv-fade-up 0.85s var(--dv-ease) 0.26s forwards;
}
.dv-hero__location {
  display: inline-flex; align-items: center; gap: 10px;
  justify-content: center;
  margin-bottom: clamp(20px,2.6vw,30px);
  opacity: 0; animation: dv-fade-up 0.85s var(--dv-ease) 0.38s forwards;
}
.dv-hero__loc-divider {
  width: clamp(14px,1.8vw,22px); height: 1px;
  border-radius: 1px;
  background: linear-gradient(90deg,rgba(16,185,129,0.55),rgba(16,185,129,0.15));
}
.dv-hero__loc-text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(11px,1.1vw,14px); font-weight: 600;
  color: rgba(255,255,255,0.9); letter-spacing: 0.3px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

/* Location pin */
.dv-pin {
  position: relative; flex-shrink: 0;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
}
.dv-pin__ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid rgba(16,185,129,0.5);
  animation: dv-pin-ring 2.4s ease-out infinite;
}
.dv-pin__ring:nth-child(2) { animation-delay: 0.9s; }
.dv-pin__svg {
  position: relative; z-index: 2;
  animation: dv-pin-bounce 2.2s ease-in-out infinite;
  filter: drop-shadow(0 2px 5px rgba(16,185,129,0.45));
}

/* Hero action buttons */
.dv-hero__actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  justify-content: center;
  opacity: 0; animation: dv-fade-up 0.85s var(--dv-ease) 0.48s forwards;
}
.dv-hero__btn-primary {
  display: inline-flex; align-items: center; gap: 9px;
  padding: clamp(12px,1.3vw,15px) clamp(22px,2.5vw,32px);
  border-radius: 14px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 700; font-size: clamp(13px,1.2vw,14.5px);
  cursor: pointer;
  box-shadow: 0 8px 26px rgba(16,185,129,0.4);
  transition: all 0.35s var(--dv-ease); text-decoration: none;
}
.dv-hero__btn-primary:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 38px rgba(16,185,129,0.55);
}
.dv-hero__btn-ghost {
  display: inline-flex; align-items: center; gap: 9px;
  padding: clamp(12px,1.3vw,15px) clamp(20px,2.3vw,30px);
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.09);
  backdrop-filter: blur(12px); color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 700; font-size: clamp(13px,1.2vw,14.5px);
  cursor: pointer;
  transition: all 0.32s ease; text-decoration: none;
}
.dv-hero__btn-ghost:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.42);
  transform: translateY(-2px);
}

/* Slide dots (centered) */
.dv-hero__dots {
  position: absolute;
  bottom: clamp(58px, 8vh, 78px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 6; display: flex; gap: 8px;
}
.dv-hero__dot {
  width: 7px; height: 7px; border-radius: 4px;
  background: rgba(255,255,255,0.3);
  border: none; padding: 0; cursor: pointer;
  transition: all 0.5s var(--dv-ease);
}
.dv-hero__dot--on {
  width: 28px; background: rgba(255,255,255,0.92);
  box-shadow: 0 0 8px rgba(255,255,255,0.35);
}

/* Scroll-down link (centered, bottom) */
.dv-hero__scroll {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: clamp(14px, 2.5vh, 24px);
  z-index: 6;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: rgba(255,255,255,0.7);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 2.5px; text-transform: uppercase;
  background: none; border: none; cursor: pointer;
  padding: 6px 10px;
  transition: color 0.3s ease;
  opacity: 0; animation: dv-fade-up 0.9s var(--dv-ease) 0.6s forwards;
}
.dv-hero__scroll:hover { color: #fff; }
.dv-hero__scroll-line {
  width: 1px; height: 26px;
  background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.15));
  animation: dv-scroll-line 2s ease-in-out infinite;
}
.dv-hero__scroll-icon {
  animation: dv-scroll-bounce 2s ease-in-out infinite;
}

/* ═════════════════════════════════════════════════
   SECTIONS  — tight spacing
═════════════════════════════════════════════════ */
.dv-section {
  padding: clamp(36px,4.5vw,64px) clamp(16px,5vw,56px);
}
.dv-section--alt   { background: var(--dv-surface); }
.dv-section--forest {
  background: linear-gradient(160deg, #0f172a 0%, #022c22 40%, #064e3b 100%);
  background-size: 200% 200%;
  animation: dv-gradient-shift 12s ease infinite;
  position: relative; overflow: hidden;
}
.dv-section--forest::before {
  content: '';
  position: absolute; top: 10%; left: 5%;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.dv-section--forest::after {
  content: '';
  position: absolute; bottom: 5%; right: 8%;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.dv-inner { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }

.dv-section-head {
  text-align: center; max-width: 780px;
  margin: 0 auto clamp(24px,3vw,36px);
}
.dv-section-head--split {
  text-align: left; max-width: none;
  margin-left: 0; margin-right: 0;
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 20px;
  margin-bottom: clamp(24px,3vw,36px);
}
.dv-section-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(26px,4vw,44px);
  font-weight: 400; line-height: 1.15;
  color: var(--dv-text); margin: 0 0 12px;
  letter-spacing: -0.025em;
}
.dv-section-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: var(--dv-text-2);
  font-size: clamp(14px,1.35vw,16px);
  line-height: 1.75;
  max-width: 620px;
  margin: 0 auto;
}
.dv-section-desc--left { margin: 0; }

/* ═════════════════════════════════════════════════
   COUNTRY CARDS  — centred content + scatter-merge animation
═════════════════════════════════════════════════ */
.dv-countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%,260px),1fr));
  gap: clamp(14px,2vw,22px);
}
.dv-country-card {
  position: relative; border-radius: var(--dv-radius);
  overflow: hidden; background: var(--dv-forest);
  cursor: pointer; text-decoration: none; color: #fff;
  display: block; min-height: 440px;
  transition: transform 0.55s var(--dv-ease), box-shadow 0.55s var(--dv-ease);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.dv-country-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 56px rgba(5,150,105,0.2), 0 8px 24px rgba(0,0,0,0.1);
}
.dv-country-card__img-wrap {
  position: absolute; inset: 0; overflow: hidden;
}
.dv-country-card__img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 8s cubic-bezier(0.25,0,0.15,1), filter 0.55s ease;
  filter: brightness(0.98) saturate(1.05);
}
.dv-country-card:hover .dv-country-card__img {
  transform: scale(1.08);
  filter: brightness(1.05) saturate(1.15);
}
.dv-country-card__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(2,44,34,0.30) 0%,
    rgba(2,44,34,0.15) 35%,
    rgba(2,44,34,0.72) 100%
  );
  z-index: 1;
}
.dv-country-card__content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  justify-content: center;      /* ← vertically centred */
  align-items: center;           /* ← horizontally centred */
  text-align: center;
  height: 100%;
  padding: clamp(22px,3vw,36px);
}

/* Scattered → merged element animations */
.dv-scatter {
  opacity: 0;
  transition:
    opacity 0.7s var(--dv-ease),
    transform 0.9s var(--dv-ease-bounce),
    filter 0.7s var(--dv-ease);
  will-change: opacity, transform, filter;
  filter: blur(4px);
}

.dv-country-card:not(.dv-in-view) .dv-country-card__flag {
  opacity: 0;
  transform: translate(-50px, -60px) rotate(-25deg) scale(0.5);
  filter: blur(6px);
}
.dv-country-card:not(.dv-in-view) .dv-country-card__badge {
  opacity: 0;
  transform: translate(60px, -50px) rotate(20deg) scale(0.5);
  filter: blur(6px);
}
.dv-country-card:not(.dv-in-view) .dv-country-card__name {
  opacity: 0;
  transform: translateY(45px) scale(0.85);
  filter: blur(6px);
}
.dv-country-card:not(.dv-in-view) .dv-country-card__region {
  opacity: 0;
  transform: translateX(-55px) scale(0.8);
  filter: blur(6px);
}
.dv-country-card:not(.dv-in-view) .dv-country-card__desc {
  opacity: 0;
  transform: translateX(55px) scale(0.9);
  filter: blur(6px);
}
.dv-country-card:not(.dv-in-view) .dv-country-card__btn {
  opacity: 0;
  transform: translateY(55px) scale(0.7);
  filter: blur(6px);
}

/* When card enters view — everything merges into place */
.dv-country-card.dv-in-view .dv-country-card__flag,
.dv-country-card.dv-in-view .dv-country-card__badge,
.dv-country-card.dv-in-view .dv-country-card__name,
.dv-country-card.dv-in-view .dv-country-card__region,
.dv-country-card.dv-in-view .dv-country-card__desc,
.dv-country-card.dv-in-view .dv-country-card__btn {
  opacity: 1;
  transform: translate(0, 0) rotate(0) scale(1);
  filter: blur(0);
  transition:
    opacity 0.75s var(--dv-ease),
    transform 0.9s var(--dv-ease-bounce),
    filter 0.6s var(--dv-ease);
}

/* Staggered delays for merge */
.dv-country-card.dv-in-view .dv-country-card__flag   { transition-delay: 0.05s; }
.dv-country-card.dv-in-view .dv-country-card__badge  { transition-delay: 0.12s; }
.dv-country-card.dv-in-view .dv-country-card__name   { transition-delay: 0.22s; }
.dv-country-card.dv-in-view .dv-country-card__region { transition-delay: 0.32s; }
.dv-country-card.dv-in-view .dv-country-card__desc   { transition-delay: 0.42s; }
.dv-country-card.dv-in-view .dv-country-card__btn    { transition-delay: 0.52s; }

/* Element styling */
.dv-country-card__flag {
  position: absolute; top: 18px; left: 18px; z-index: 3;
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  display: grid; place-items: center;
  font-size: 22px; line-height: 1;
  box-shadow: 0 3px 14px rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.5);
  overflow: hidden;
}
.dv-country-card__flag img {
  width: 100%; height: 100%; object-fit: cover;
}
.dv-country-card__badge {
  position: absolute; top: 18px; right: 18px; z-index: 3;
  padding: 5px 12px; border-radius: 999px;
  background: rgba(16,185,129,0.9);
  backdrop-filter: blur(8px);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em;
}
.dv-country-card__name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(24px,3.5vw,38px);
  font-weight: 400; margin: 0 0 8px; color: #fff;
  line-height: 1.12; letter-spacing: -0.02em;
}
.dv-country-card__region {
  display: inline-flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.65);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600; margin-bottom: 14px;
  letter-spacing: 0.02em;
}
.dv-country-card__desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(13px,1.15vw,14.5px);
  line-height: 1.7; color: rgba(255,255,255,0.78);
  margin: 0 0 22px; max-width: 380px;
  display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden;
}
.dv-country-card__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 26px; border-radius: 14px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 700; font-size: 13.5px;
  cursor: pointer;
  box-shadow: 0 6px 22px rgba(16,185,129,0.4);
  transition: transform 0.3s var(--dv-ease), box-shadow 0.3s var(--dv-ease);
  text-decoration: none;
}
.dv-country-card__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,0.55);
}
.dv-country-skel {
  border-radius: var(--dv-radius); overflow: hidden;
  min-height: 440px;
  background: linear-gradient(90deg,#e2e8f0 0%,#f1f5f9 40%,#e2e8f0 80%);
  background-size: 200%;
  animation: dv-shimmer 1.6s ease infinite;
}

/* ═════════════════════════════════════════════════
   POPULAR SLIDER
═════════════════════════════════════════════════ */
.dv-slider__viewport { overflow: hidden; }
.dv-slider__track {
  display: flex; gap: clamp(14px,2vw,22px);
  transition: transform 0.65s var(--dv-ease);
}
.dv-slider__item {
  flex: 0 0 clamp(260px,30vw,360px); min-width: 0;
}
@media (max-width: 639px) {
  .dv-slider__viewport {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .dv-slider__viewport::-webkit-scrollbar { display: none; }
  .dv-slider__track {
    width: max-content;
    transform: none !important;
    transition: none;
  }
  .dv-slider__item {
    flex-basis: min(84vw, 360px) !important;
    scroll-snap-align: start;
  }
}
.dv-arrow {
  width: 46px; height: 46px; border-radius: 50%;
  border: 1.5px solid var(--dv-border);
  background: var(--dv-surface);
  display: grid; place-items: center;
  color: var(--dv-text); cursor: pointer;
  transition: all 0.3s var(--dv-ease);
}
.dv-arrow:hover:not(:disabled) {
  background: var(--dv-green); color: #fff;
  border-color: var(--dv-green);
  box-shadow: 0 6px 20px rgba(5,150,105,0.3);
  transform: scale(1.08);
}
.dv-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
.dv-slider__controls {
  display: flex; gap: 10px; flex-shrink: 0;
}
.dv-slider__dots {
  display: flex; justify-content: center;
  gap: 8px; margin-top: 22px;
}
.dv-slider__dot {
  width: 8px; height: 8px; border-radius: 4px;
  border: none; padding: 0; cursor: pointer;
  background: var(--dv-border);
  transition: all 0.35s var(--dv-ease);
}
.dv-slider__dot--on { width: 28px; background: var(--dv-green); }

/* ═════════════════════════════════════════════════
   FINAL CTA
═════════════════════════════════════════════════ */
.dv-cta {
  text-align: center; position: relative; z-index: 1;
  padding: clamp(44px,6vw,72px) clamp(20px,5vw,64px);
}
.dv-cta__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(30px,5vw,52px);
  font-weight: 400; color: #fff;
  line-height: 1.12; margin: 0 0 16px;
  letter-spacing: -0.02em;
}
.dv-cta__desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(14px,1.3vw,17px);
  color: rgba(255,255,255,0.72);
  line-height: 1.75; max-width: 580px;
  margin: 0 auto 32px;
}
.dv-cta__buttons {
  display: flex; gap: 14px;
  justify-content: center; flex-wrap: wrap;
}
.dv-cta__btn-primary {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 15px 34px; border-radius: 14px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 700; font-size: 15px;
  cursor: pointer;
  box-shadow: 0 10px 32px rgba(16,185,129,0.42);
  transition: all 0.35s var(--dv-ease); text-decoration: none;
}
.dv-cta__btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 14px 40px rgba(16,185,129,0.55);
}
.dv-cta__btn-secondary {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 15px 32px; border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 700; font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease; text-decoration: none;
}
.dv-cta__btn-secondary:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.42);
  transform: translateY(-2px);
}

.dv-empty {
  text-align: center; padding: 48px 24px; color: var(--dv-text-3);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* ═════════════════════════════════════════════════
   RESPONSIVE
═════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .dv-hero { height: clamp(440px, 60vh, 560px); }
}
@media (max-width: 768px) {
  .dv-hero { height: clamp(420px, 55vh, 520px); }
  .dv-hero__btn-ghost { display: none; }
  .dv-countries-grid { grid-template-columns: repeat(auto-fill,minmax(min(100%,280px),1fr)); }
  .dv-country-card { min-height: 400px; }
  .dv-section-head--split { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 640px) {
  .dv-hero { height: clamp(400px, 60vh, 480px); }
  .dv-hero__body { padding: 0 20px; padding-bottom: 70px; }
  .dv-countries-grid { grid-template-columns: 1fr; }
  .dv-country-card { min-height: 360px; }
  .dv-slider__item { flex: 0 0 clamp(240px,80vw,300px); }
  .dv-cta__buttons { flex-direction: column; align-items: center; }
  .dv-cta__btn-primary,
  .dv-cta__btn-secondary { width: 100%; max-width: 320px; justify-content: center; }
}
@media (max-width: 380px) {
  .dv-hero__title { font-size: clamp(28px,8.5vw,44px); }
}
@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .dv-country-card:not(.dv-in-view) .dv-country-card__flag,
  .dv-country-card:not(.dv-in-view) .dv-country-card__badge,
  .dv-country-card:not(.dv-in-view) .dv-country-card__name,
  .dv-country-card:not(.dv-in-view) .dv-country-card__region,
  .dv-country-card:not(.dv-in-view) .dv-country-card__desc,
  .dv-country-card:not(.dv-in-view) .dv-country-card__btn {
    opacity: 1; transform: none; filter: none;
  }
}
`;

function injectCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('dv-styles')) return;
  const s = document.createElement('style');
  s.id = 'dv-styles';
  s.textContent = CSS + `
.dv-discovery{background:#f8fafb;padding:clamp(20px,4vw,48px) 0 12px}.dv-discovery__inner{width:min(1240px,calc(100% - 36px));margin:0 auto}.dv-filterbar{border:1px solid #dce9e3;background:rgba(255,255,255,.94);border-radius:20px;padding:14px 16px;box-shadow:0 10px 34px rgba(15,50,35,.05)}.dv-filterbar__top{display:flex;align-items:center;justify-content:space-between;gap:14px}.dv-filterbar__title{display:flex;align-items:center;gap:10px;color:#064e3b;font-weight:800;font-size:clamp(15px,2vw,18px)}.dv-filter-toggle{display:inline-flex;align-items:center;justify-content:center;gap:9px;border:1px solid #cce5d9;border-radius:12px;padding:10px 14px;background:#f0fdf6;color:#047857;font-weight:750;cursor:pointer;transition:transform .25s ease,background .25s ease}.dv-filter-toggle:hover{transform:translateY(-1px);background:#dcfce7}.dv-filter-panel{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .35s cubic-bezier(.22,1,.36,1),opacity .25s ease}.dv-filter-panel.is-open{grid-template-rows:1fr;opacity:1}.dv-filter-panel__clip{overflow:hidden;min-height:0}.dv-filter-panel__content{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding-top:0;transform:translateY(-6px);transition:padding .3s ease,transform .3s ease}.dv-filter-panel.is-open .dv-filter-panel__content{padding-top:16px;transform:translateY(0)}.dv-filter-label{width:100%;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#718579;font-weight:800;margin-top:3px}.dv-filter-chip{display:inline-flex;align-items:center;gap:7px;border:1px solid #dce9e3;background:#fff;color:#40564a;border-radius:999px;padding:9px 13px;font-size:13px;font-weight:700;cursor:pointer;transition:all .22s ease}.dv-filter-chip:hover{border-color:#6ee7b7;transform:translateY(-1px)}.dv-filter-chip.is-active{background:#047857;color:white;border-color:#047857;box-shadow:0 5px 14px #04785726}.dv-discovery__meta{font-size:13px;color:#718579;margin:14px 2px 0}.dv-story-section{padding:clamp(28px,4vw,48px) 0 12px}.dv-story-head,.dv-discovery-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:20px}.dv-story-kicker{font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;color:#059669;margin-bottom:8px}.dv-story-title,.dv-discovery-title{font-family:'DM Serif Display',Georgia,serif;font-weight:400;letter-spacing:-.025em;color:#102c20;font-size:clamp(26px,3.8vw,42px);line-height:1.08;margin:0}.dv-story-sub,.dv-discovery-sub{color:#64756b;line-height:1.65;font-size:14px;margin:9px 0 0;max-width:620px}.dv-story-rail{display:flex;gap:clamp(12px,2vw,22px);overflow-x:auto;overflow-y:visible;scroll-snap-type:x mandatory;scroll-padding-inline:calc((100% - min(76vw,390px))/2);padding:18px max(2px,calc((100% - min(76vw,390px))/2)) 30px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-inline:contain}.dv-story-rail::-webkit-scrollbar{display:none}.dv-story-card{position:relative;isolation:isolate;flex:0 0 clamp(220px,29vw,330px);height:clamp(250px,34vw,350px);border-radius:24px;overflow:hidden;scroll-snap-align:center;transform:scale(.91);filter:brightness(.56) saturate(.72);opacity:.8;transition:transform .55s cubic-bezier(.22,1,.36,1),filter .55s ease,opacity .4s ease,box-shadow .55s ease;background:#173b2b;box-shadow:0 10px 24px #062c1d16;text-decoration:none;color:white}.dv-story-card.is-active{transform:scale(1);filter:brightness(1) saturate(1.05);opacity:1;box-shadow:0 22px 50px #062c1d35}.dv-story-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.22,1,.36,1)}.dv-story-card.is-active img{transform:scale(1.07)}.dv-story-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#071d1510 20%,#071d1560 58%,#061b14ed 100%);z-index:0}.dv-story-card__float{position:absolute;z-index:2;right:18px;top:18px;width:34px;height:34px;display:grid;place-items:center;border:1px solid #ffffff70;border-radius:50%;background:#ffffff20;backdrop-filter:blur(8px);animation:dv-float-icon 3.8s ease-in-out infinite;color:white}.dv-story-card:nth-child(3n) .dv-story-card__float{animation-delay:-1.4s}.dv-story-card:nth-child(2n) .dv-story-card__float{animation-delay:-2.2s}.dv-story-card__content{position:absolute;z-index:2;left:20px;right:20px;bottom:20px;transform:translateY(8px);opacity:.82;transition:transform .45s ease,opacity .45s ease}.dv-story-card.is-active .dv-story-card__content{transform:translateY(0);opacity:1}.dv-story-card__eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#a7f3d0;font-weight:800;margin-bottom:7px}.dv-story-card__name{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(22px,2.5vw,30px);line-height:1.08;margin:0 0 8px;color:#fff}.dv-story-card__country{font-size:12px;color:#e2f8eb;display:flex;align-items:center;gap:6px}.dv-story-hint{display:flex;justify-content:center;align-items:center;gap:8px;color:#829187;font-size:11px;letter-spacing:.12em;text-transform:uppercase}.dv-country-marquee{overflow:hidden;position:relative;padding:10px 0 28px;mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)}.dv-country-marquee__track{display:flex;align-items:stretch;gap:18px;width:max-content;animation:dv-country-marquee 60s linear infinite}.dv-country-marquee:hover .dv-country-marquee__track,.dv-country-marquee:focus-within .dv-country-marquee__track{animation-play-state:paused}.dv-country-marquee__track>div{flex:0 0 clamp(250px,28vw,330px);width:clamp(250px,28vw,330px)}.dv-country-marquee__track .dv-country-card{width:100%;min-height:390px;cursor:pointer}.dv-country-marquee__track .dv-country-card:hover{transform:translateY(-5px) scale(1.015)}@keyframes dv-country-marquee{from{transform:translateX(0)}to{transform:translateX(-33.333333%)}}@keyframes dv-float-icon{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-8px) rotate(5deg)}}.dv-results-section{padding:clamp(30px,4vw,54px) 0}.dv-results-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,2vw,24px);align-items:stretch}.dv-results-grid>*{min-width:0}.dv-results-empty{padding:34px 20px;border:1px dashed #cbdcd2;border-radius:20px;background:white;text-align:center;color:#64756b}.dv-related-countries{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:18px;margin-top:22px}.dv-related-countries .dv-country-card{min-height:350px}.dv-related-countries .dv-country-card__desc{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.dv-filter-clear{border:0;background:transparent;color:#047857;text-decoration:underline;font-weight:700;cursor:pointer;padding:8px}@media(max-width:900px){.dv-results-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dv-story-card{flex-basis:clamp(230px,38vw,310px)}}@media(max-width:600px){.dv-discovery__inner{width:calc(100% - 28px)}.dv-filterbar{padding:12px;border-radius:17px}.dv-filterbar__top{align-items:flex-start}.dv-filter-toggle{padding:9px 11px;font-size:12px}.dv-filterbar__title{font-size:15px}.dv-filter-chip{padding:8px 11px;font-size:12px}.dv-story-head,.dv-discovery-head{align-items:flex-start;flex-direction:column}.dv-story-rail{gap:12px;scroll-padding-inline:calc((100% - 78vw)/2);padding:12px calc((100% - 78vw)/2) 22px}.dv-story-card{flex-basis:78vw;height:300px;transform:scale(.88)}.dv-story-card.is-active{transform:scale(1)}.dv-story-card__content{left:17px;right:17px;bottom:17px}.dv-country-marquee__track{animation-duration:75s}.dv-country-marquee__track>div{flex-basis:78vw;width:78vw}.dv-country-marquee__track .dv-country-card{min-height:360px}.dv-results-grid{grid-template-columns:minmax(0,1fr);gap:18px}.dv-results-section{padding:28px 0}.dv-related-countries{grid-template-columns:1fr}.dv-story-hint{font-size:10px}}@media(prefers-reduced-motion:reduce){.dv-story-card__float,.dv-country-marquee__track{animation:none!important}.dv-story-card,.dv-story-card img,.dv-story-card__content{transition:none!important}}
`;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   LOCATION PIN
═══════════════════════════════════════════════════════════ */
function LocationPin({ size = 17 }) {
  return (
    <div className="dv-pin">
      <div className="dv-pin__ring" />
      <div className="dv-pin__ring" />
      <svg
        className="dv-pin__svg"
        width={size} height={size}
        viewBox="0 0 24 24" fill="none"
      >
        <defs>
          <linearGradient id="dv-pin-g" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="55%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="url(#dv-pin-g)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="0.7"
        />
        <circle cx="12" cy="9" r="2.8" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" />
        <circle cx="12" cy="9" r="1" fill="rgba(255,255,255,0.85)" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO BANNER  — centered, medium-height, scroll link
═══════════════════════════════════════════════════════════ */
function HeroBanner() {
  const [active, setActive]   = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef              = useRef(null);
  const [slides, setSlides]   = useState([]);
  const total                 = slides.length;

  useEffect(() => {
    let cancelled = false;
    apiFetch('/destinations/featured?limit=4')
      .then(r => {
        if (cancelled) return;
        const dests = r.data || [];
        if (dests.length) {
          setSlides(dests.map(d => ({
            image: d.heroImage || d.imageUrl || d.images?.[0] || null,
            title: d.name || 'Destination',
            subtitle: d.country?.name || '',
            desc: d.shortDescription || d.description || '',
            location: d.country?.name || '',
          })));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const advance = useCallback(() => {
    if (!total) return;
    setActive(p => (p + 1) % total);
    setAnimKey(k => k + 1);
  }, [total]);

  useEffect(() => {
    timerRef.current = setInterval(advance, 8000);
    return () => clearInterval(timerRef.current);
  }, [advance]);

  const goTo = useCallback((i) => {
    setActive(i); setAnimKey(k => k + 1);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 8000);
  }, [advance]);

  const scrollToCountries = () => {
    document.getElementById('countries')?.scrollIntoView({ behavior: 'smooth' });
  };

  const slide = slides[active];

  if (!slide) return null;

  return (
    <section className="dv-hero">
      {slides.map((sl, i) => (
        <div key={i} className={`dv-hero__slide${i === active ? ' dv-hero__slide--on' : ''}`}>
          <img src={sl.image} alt={sl.title} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
        </div>
      ))}

      {/* Fog */}
      <div className="dv-hero__fog">
        <div className="dv-hero__fog-layer dv-hero__fog-layer--1" />
        <div className="dv-hero__fog-layer dv-hero__fog-layer--2" />
      </div>
      <div className="dv-hero__fog-bottom" />

      {/* Overlays */}
      <div className="dv-hero__ov-bottom" />
      <div className="dv-hero__ov-radial" />
      <div className="dv-hero__grain" />

      {/* Centered body */}
      <div className="dv-hero__body">
        <div className="dv-hero__eyebrow" key={`ey-${animKey}`}>
          <div className="dv-hero__ey-line dv-hero__ey-line--l" />
          <span className="dv-hero__ey-text">Curated East Africa Destinations</span>
          <div className="dv-hero__ey-line dv-hero__ey-line--r" />
        </div>

        <h1 className="dv-hero__title" key={`t-${animKey}`}>
          {slide.title}
          <em>{slide.subtitle}</em>
        </h1>

        <p className="dv-hero__desc" key={`d-${animKey}`}>{slide.desc}</p>

        <div className="dv-hero__location" key={`l-${animKey}`}>
          <LocationPin size={17} />
          <div className="dv-hero__loc-divider" />
          <span className="dv-hero__loc-text">{slide.location}</span>
        </div>

        <div className="dv-hero__actions" key={`a-${animKey}`}>
          <a href="#countries" className="dv-hero__btn-primary">
            <FiGlobe size={14} /> Browse by Country
          </a>
          <a href="#popular" className="dv-hero__btn-ghost">
            <FiTrendingUp size={14} /> Popular Picks
          </a>
        </div>
      </div>

      {/* Dots */}
      <div className="dv-hero__dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`dv-hero__dot${i === active ? ' dv-hero__dot--on' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll-down link (centered bottom) */}
      <button className="dv-hero__scroll" onClick={scrollToCountries} aria-label="Scroll to countries">
        <span>Scroll</span>
        <div className="dv-hero__scroll-line" />
        <FiChevronDown size={16} className="dv-hero__scroll-icon" />
      </button>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTRY CARD  — with scatter → merge animation
═══════════════════════════════════════════════════════════ */
function CountryCard({ country }) {
  const navigate  = useNavigate();
  const [ref, inView] = useInView();
  const slug      = getCountrySlug(country);
  const flag      = country.flagUrl || country.flag_url || country.flag || '';
  const isImg     = flag && (flag.startsWith('http') || flag.includes('/'));
  const isEmoji   = flag && !isImg;
  const destCount = country.destinationsCount ?? country.destinations_count ?? country.destinationCount ?? null;
  const heroImg   = country.hero_image_url || country.heroImage || country.hero_image ||
    country.coverImage || country.cover_image || country.cover_image_url ||
    country.image_url || country.image || null;

  return (
    <div
      ref={ref}
      className={`dv-country-card ${inView ? 'dv-in-view' : ''}`}
      onClick={() => navigate(`/country/${slug}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/country/${slug}`)}
    >
      <div className="dv-country-card__img-wrap">
        {heroImg ? <img className="dv-country-card__img" src={heroImg} alt={country.name} loading="lazy" draggable={false} /> : <div className="dv-country-card__img" aria-label="No photo yet" />}
      </div>
      <div className="dv-country-card__overlay" />

      <div className="dv-country-card__flag">
        {isImg ? <img src={flag} alt="" /> : isEmoji ? <span>{flag}</span> : <FiGlobe size={18} color="#059669" />}
      </div>

      {destCount > 0 && (
        <div className="dv-country-card__badge">
          {destCount} destination{destCount !== 1 ? 's' : ''}
        </div>
      )}

      <div className="dv-country-card__content">
        <h3 className="dv-country-card__name">{country.name}</h3>
        {(country.region || country.continent) && (
          <div className="dv-country-card__region">
            <FiMapPin size={11} /> {country.region || country.continent}
          </div>
        )}
        <p className="dv-country-card__desc">
          {country.emotional_description || country.description || ""}
        </p>
        <Link to={`/country/${slug}`} className="dv-country-card__btn" onClick={e => e.stopPropagation()}>
          Explore {country.name} <FiArrowRight size={13} />
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
    <section className="dv-section dv-section--alt" id="countries">
      <div className="dv-inner">
        <AnimatedSection animation="fadeInUp">
          <div className="dv-section-head">
            <h2 className="dv-section-title">Choose Your Country</h2>
            <p className="dv-section-desc">
              Each country holds its own magnificent story — from ancient forests
              and volcanic peaks to golden savannahs and turquoise coastlines.
            </p>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="dv-countries-grid">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="dv-country-skel" />)}
          </div>
        ) : countries.length === 0 ? (
          <div className="dv-empty">
            <FiGlobe size={44} style={{ opacity: 0.35, marginBottom: 14 }} />
            <p style={{ margin: 0, fontSize: 15 }}>No countries found.</p>
          </div>
        ) : (
          <div className="dv-countries-grid">
            {countries.map(c => <CountryCard key={c.id || c.slug} country={c} />)}
          </div>
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
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 540) setVisible(1);
      else if (window.innerWidth < 900) setVisible(2);
      else setVisible(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIdx = Math.max(0, data.length - visible);
  const itemW  = 'clamp(260px,30vw,360px)';
  const gap    = 'clamp(14px,2vw,22px)';

  if (loading) {
    return (
      <section className="dv-section" id="popular">
        <div className="dv-inner">
          <div className="dv-section-head--split">
            <div>
              <h2 className="dv-section-title">Popular Destinations</h2>
            </div>
          </div>
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
  }

  if (!data.length) return null;

  return (
    <section className="dv-section" id="popular">
      <div className="dv-inner">
        <AnimatedSection animation="fadeInUp">
          <div className="dv-section-head--split">
            <div>
              <h2 className="dv-section-title">Popular Destinations</h2>
              <p className="dv-section-desc dv-section-desc--left">
                Beloved by travellers from every corner of the world — these
                destinations have captured hearts and created lifelong memories.
              </p>
            </div>
            <div className="dv-slider__controls">
              <button
                className="dv-arrow"
                onClick={() => setIdx(p => Math.max(0, p - 1))}
                disabled={idx === 0}
                aria-label="Previous"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                className="dv-arrow"
                onClick={() => setIdx(p => Math.min(maxIdx, p + 1))}
                disabled={idx >= maxIdx}
                aria-label="Next"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </AnimatedSection>

        <div className="dv-slider__viewport">
          <div
            className="dv-slider__track"
            style={{ transform: `translateX(calc(-${idx} * (${itemW} + ${gap})))` }}
          >
            {data.map((dest, i) => (
              <div key={dest.id} className="dv-slider__item" style={{ flex: `0 0 ${itemW}` }}>
                <DestinationCard destination={dest} priority={i < 3} />
              </div>
            ))}
          </div>
        </div>

        {maxIdx > 0 && (
          <div className="dv-slider__dots">
            {Array.from({ length: maxIdx + 1 }, (_, i) => (
              <button
                key={i}
                className={`dv-slider__dot${i === idx ? ' dv-slider__dot--on' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


function DiscoveryFilters({query,category,setCategory,sort,setSort,resultCount,onClear}){const[open,setOpen]=useState(false);const categories=["All","Wildlife","Nature","Culture","Adventure","Gorilla Trekking","Beach","Hiking"];return <section className="dv-discovery" aria-label="Find your destination"><div className="dv-discovery__inner"><div className="dv-filterbar"><div className="dv-filterbar__top"><div className="dv-filterbar__title"><FiCompass size={20}/><span>Find your next adventure</span></div><button type="button" className="dv-filter-toggle" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><FiFilter size={16}/>{open?"Hide filters":"Quick filters"}<FiChevronDown size={15} style={{transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .25s ease"}}/></button></div><div className={`dv-filter-panel ${open?"is-open":""}`} aria-hidden={!open}><div className="dv-filter-panel__clip"><div className="dv-filter-panel__content"><span className="dv-filter-label">Experience</span>{categories.map(item=><button type="button" key={item} className={`dv-filter-chip ${category===item?"is-active":""}`} onClick={()=>setCategory(item)}>{item}</button>)}<span className="dv-filter-label">Sort destinations</span>{[["featured","Featured"],["visited","Most visited"],["searched","Most searched"],["az","A–Z"]].map(([value,label])=><button type="button" key={value} className={`dv-filter-chip ${sort===value?"is-active":""}`} onClick={()=>setSort(value)}>{value==="featured"&&<FiStar size={13}/>} {label}</button>)}{(query||category!=="All"||sort!=="featured")&&<button type="button" className="dv-filter-clear" onClick={onClear}><FiX size={13}/> Clear filters</button>}</div></div></div></div><p className="dv-discovery__meta">{query?<>Showing matches for <strong>“{query}”</strong> · {resultCount} destination{resultCount===1?"":"s"}</>:<>Explore curated places and countries, handpicked for your next journey.</>}</p></div></section>}
function searchableText(value,seen=new WeakSet()){if(value==null||typeof value==="boolean")return"";if(typeof value==="string"||typeof value==="number")return String(value);if(typeof value!=="object"||seen.has(value))return"";seen.add(value);if(Array.isArray(value))return value.map(item=>searchableText(item,seen)).join(" ");return Object.entries(value).filter(([key])=>!/^(?:image|images|gallery|heroImage|hero_images|imageUrl|image_url|thumbnailUrl|createdAt|updatedAt|__v)$/i.test(key)).map(([key,item])=>key+" "+searchableText(item,seen)).join(" ")}
const normalizeSearch=value=>String(value||"").normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function destinationCountryName(item){const country=item?.country??item?.country_name??item?.countryName??"";return typeof country==="string"?country:(country?.name||country?.label||country?.title||"")}
function DestinationStoryRail({destinations}){const[activeId,setActiveId]=useState("");const railRef=useRef(null);useEffect(()=>{if(!destinations.length||!railRef.current)return;const nodes=[...railRef.current.querySelectorAll("[data-story-id]")];if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActiveId(visible.target.dataset.storyId)},{root:railRef.current,threshold:[.35,.55,.75],rootMargin:"0px -20% 0px -20%"});nodes.forEach(node=>observer.observe(node));return()=>observer.disconnect()},[destinations]);return <section className="dv-story-section dv-discovery__inner" aria-label="Destination stories"><div className="dv-story-head"><div><div className="dv-story-kicker">A little inspiration</div><h2 className="dv-story-title">Stories worth travelling for</h2><p className="dv-story-sub">Swipe through places that make East Africa unforgettable. The destination in focus comes to life.</p></div></div>{destinations.length?<div className="dv-story-rail" ref={railRef}>{destinations.slice(0,18).map((item,i)=>{const id=String(item.id||item.slug||item.name||i);const raw=item.heroImage||item.hero_image||item.hero_image_url||item.coverImageUrl||item.cover_image_url||item.imageUrl||item.image_url||item.thumbnailUrl||(Array.isArray(item.images)?item.images[0]:"")||(Array.isArray(item.gallery)?item.gallery[0]:"");const image=typeof raw==="string"?raw:(raw?.url||raw?.image_url||"");return <Link to={`/destinations/${item.slug||item.id}`} key={id} data-story-id={id} className={`dv-story-card ${activeId===id?"is-active":""}`} onFocus={()=>setActiveId(id)} onMouseEnter={()=>{if(window.matchMedia("(hover:hover)").matches)setActiveId(id)}} aria-label={`Explore ${item.name||"destination"}`}>{image&&<img src={image} alt="" loading="lazy" draggable="false"/>}<span className="dv-story-card__float">{i%3===0?<FiMapPin size={16}/>:i%3===1?<FiCompass size={16}/>:<FiStar size={15}/>}</span><div className="dv-story-card__content"><div className="dv-story-card__eyebrow">Destination story</div><h3 className="dv-story-card__name">{item.name||item.title||"Explore destination"}</h3><div className="dv-story-card__country"><FiMapPin size={13}/>{destinationCountryName(item)||item.region||"East Africa"} <FiArrowRight size={13}/></div></div></Link>})}</div>:<div className="dv-results-empty">Destination stories will appear as destinations are added.</div>}<div className="dv-story-hint"><FiChevronLeft size={14}/> Swipe or scroll to explore <FiChevronRight size={14}/></div></section>}
function CountryCarouselSection({countries,loading}){const list=useMemo(()=>countries.length?[...countries,...countries,...countries]:[],[countries]);return <section className="dv-section dv-section--alt" id="countries"><div className="dv-inner"><AnimatedSection animation="fadeInUp"><div className="dv-section-head"><h2 className="dv-section-title">Explore by country</h2><p className="dv-section-desc">Every country has a different rhythm, landscape and story. Choose the one that speaks to you.</p></div></AnimatedSection>{loading?<div className="dv-countries-grid">{Array.from({length:3},(_,i)=><div key={i} className="dv-country-skel"/>)}</div>:countries.length?<div className="dv-country-marquee" aria-label="Countries carousel"><div className="dv-country-marquee__track">{list.map((country,i)=><div key={`${country.id||country.slug||country.name}-${i}`}><CountryCard country={country}/></div>)}</div></div>:<div className="dv-empty">No countries are available yet.</div>}</div></section>}
function DestinationResultsSection({destinations,loading,countries,query,category}){const related=useMemo(()=>{if(!query)return[];const names=new Set(destinations.map(destinationCountryName).map(normalizeSearch).filter(Boolean));const q=normalizeSearch(query);return countries.filter(country=>names.has(normalizeSearch(country.name||country.title))||names.has(normalizeSearch(country.slug))||normalizeSearch(searchableText(country)).includes(q)).slice(0,8)},[countries,destinations,query]);const heading=query?"Matching destinations":category!=="All"?category+" destinations":"Discover destinations";return <section className="dv-results-section dv-discovery__inner" id="destination-results"><div className="dv-discovery-head"><div><div className="dv-story-kicker">{query?"Your search results":"Made for your next journey"}</div><h2 className="dv-discovery-title">{heading}</h2><p className="dv-discovery-sub">{query?"Destinations matching your search, followed by the countries they belong to.":"Explore the first 20 destinations. Search above to find more from the full catalogue."}</p></div></div>{loading?<div className="dv-results-grid">{Array.from({length:6},(_,i)=><DestinationCardSkeleton key={i}/>)}</div>:destinations.length?<div className="dv-results-grid">{destinations.slice(0,20).map((destination,i)=><DestinationCard key={destination.id||destination.slug||destination.name||i} destination={destination}/>)}</div>:<div className="dv-results-empty"><FiSearch size={28}/><h3>No matching destinations found</h3><p>Try a different name, country, activity, feature, or detail.</p></div>}{query&&<div style={{marginTop:42}}><div className="dv-discovery-head"><div><div className="dv-story-kicker">Keep exploring</div><h2 className="dv-discovery-title">Countries related to your search</h2><p className="dv-discovery-sub">Explore the countries connected to the destinations above.</p></div></div>{related.length?<div className="dv-related-countries">{related.map(country=><CountryCard key={country.id||country.slug||country.name} country={country}/>)}</div>:<div className="dv-results-empty">No matching countries found for this search.</div>}</div>}</section>}
/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function Destinations(){useEffect(()=>{injectCSS()},[]);const[searchParams,setSearchParams]=useSearchParams();const query=searchParams.get("search")||"";const[category,setCategory]=useState("All");const[sort,setSort]=useState("featured");const{countries,loading:countriesLoading}=useCountries({limit:100,is_active:true});const{data:allDestinations=[],loading:destinationsLoading}=useDestinationsList({limit:500});const filtered=useMemo(()=>{const q=normalizeSearch(query),cat=category==="All"?"":normalizeSearch(category);const rows=(allDestinations||[]).filter(item=>{const text=normalizeSearch(searchableText(item));const queryMatches=!q||text.includes(q);const ctext=normalizeSearch([item.category,item.type,item.experience,item.activity,item.tags,item.highlights,item.shortDescription,item.description,item.name,item.title].map(searchableText).join(" "));const cm=!cat||ctext.includes(cat)||(cat==="nature"&&/wildlife|forest|mountain|lake|national park|landscape|bird/.test(ctext))||(cat==="adventure"&&/trek|hike|climb|rafting|safari|adventure/.test(ctext))||(cat==="culture"&&/culture|community|heritage|traditional|museum|village/.test(ctext))||(cat==="wildlife"&&/wildlife|gorilla|elephant|lion|chimpanzee|safari|animal/.test(ctext))||(cat==="beach"&&/beach|coast|ocean|island|shore|lake/.test(ctext))||(cat==="gorilla trekking"&&/gorilla|trekking/.test(ctext))||(cat==="hiking"&&/hiking|hike|mountain|climb|trail/.test(ctext));return queryMatches&&cm});const score=item=>["featured_score","featuredScore","is_featured","isFeatured","featured","popularity","rating","visit_count","visitCount","views","search_count","searchCount"].reduce((sum,key)=>sum+(Number(item?.[key])||0),0);return rows.sort((a,b)=>sort==="az"?String(a.name||a.title||"").localeCompare(String(b.name||b.title||"")):sort==="visited"?(Number(b.visit_count||b.visitCount||b.visits||b.views||b.popularity)||0)-(Number(a.visit_count||a.visitCount||a.visits||a.views||a.popularity)||0):sort==="searched"?(Number(b.search_count||b.searchCount||b.searches||b.searches_count)||0)-(Number(a.search_count||a.searchCount||a.searches||a.searches_count)||0):score(b)-score(a))},[allDestinations,query,category,sort]);const clearFilters=()=>{setCategory("All");setSort("featured");setSearchParams({})};const hasSearch=Boolean(query.trim());return <><SEO title="Destinations — East Africa" description="Explore curated destinations across East Africa. Search every destination detail and discover countries, experiences, and remarkable places." keywords={["east africa destinations","safari destinations","african countries"]} url="/destinations" type="website" breadcrumbs={[{name:"Home",url:"/"},{name:"Destinations",url:"/destinations"}]}/><div className="dv-page"><HeroBanner/><DiscoveryFilters query={query} category={category} setCategory={setCategory} sort={sort} setSort={setSort} resultCount={filtered.length} onClear={clearFilters}/>{!hasSearch&&<DestinationStoryRail destinations={allDestinations}/ >}{!hasSearch&&<CountryCarouselSection countries={countries} loading={countriesLoading}/>}<DestinationResultsSection destinations={filtered.slice(0,20)} loading={destinationsLoading} countries={countries} query={query} category={category}/>{!hasSearch&&<section className="dv-section--forest"><div className="dv-inner dv-cta"><AnimatedSection animation="scaleIn"><h2 className="dv-cta__title">Your East African<br/>Adventure Starts Here</h2><p className="dv-cta__desc">Whether you dream of golden savannahs, misty mountains, or turquoise shores — our expert travel designers will craft a journey as unique as you are.</p><div className="dv-cta__buttons"><Link to="/booking" className="dv-cta__btn-primary"><FiCalendar size={17}/> Plan Your Trip</Link><Link to="/contact" className="dv-cta__btn-secondary"><FiMail size={17}/> Speak to an Expert</Link></div></AnimatedSection></div></section>}</div></>}