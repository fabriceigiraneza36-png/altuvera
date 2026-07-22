// src/pages/Destinations.jsx
// ============================================================
// Destinations Page — Centered hero, scatter-merge card animations
// ============================================================
import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight, FiMapPin, FiGlobe,
  FiCalendar, FiChevronLeft, FiChevronRight,
  FiTrendingUp, FiMail, FiChevronDown,
} from 'react-icons/fi';
import SEO from '../components/common/SEO';
import AnimatedSection from '../components/common/AnimatedSection';
import DestinationCard, {
  DestinationCardSkeleton,
} from '../components/common/DestinationCard';
import { useCountries } from '../hooks/useCountries';
import { getCountrySlug } from '../utils/countrySlugMap';
import { API_URL } from '../utils/apiBase';

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
    apiFetch(`/destinations/popular?limit=${limit}`)
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
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=90',
    title: 'Explore Every Corner',
    subtitle: 'of East Africa',
    desc: 'From the thundering Serengeti plains to the misty gorilla forests of Rwanda — discover every handpicked destination in our collection.',
    location: 'East Africa',
  },
  {
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=90',
    title: 'Witness the Great',
    subtitle: 'Migration',
    desc: "Over two million wildebeest thunder across the Serengeti plains in one of nature's most breathtaking annual spectacles.",
    location: 'Tanzania & Kenya',
  },
  {
    image: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1920&q=90',
    title: "Conquer Africa's",
    subtitle: 'Highest Peak',
    desc: 'Standing at 5,895 metres above sea level, Kilimanjaro rises majestically above the clouds — calling to every adventurous soul.',
    location: 'Tanzania',
  },
  {
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1920&q=90',
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%,320px),1fr));
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
  s.textContent = CSS;
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
  const total                 = HERO_SLIDES.length;

  const advance = useCallback(() => {
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

  const slide = HERO_SLIDES[active];

  return (
    <section className="dv-hero">
      {HERO_SLIDES.map((sl, i) => (
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
  const heroImg   = country.hero_image_url || country.heroImage || country.coverImage || country.image ||
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=85';

  return (
    <div
      ref={ref}
      className={`dv-country-card ${inView ? 'dv-in-view' : ''}`}
      onClick={() => navigate(`/country/${slug}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/country/${slug}`)}
    >
      <div className="dv-country-card__img-wrap">
        <img className="dv-country-card__img" src={heroImg} alt={country.name} loading="lazy" draggable={false} />
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
          {country.emotional_description || country.description ||
           `Discover the breathtaking landscapes and vibrant cultures that make ${country.name} unforgettable.`}
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

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function Destinations() {
  useEffect(() => { injectCSS(); }, []);

  return (
    <>
      <SEO
        title="Destinations — East Africa"
        description="Explore curated destinations across East Africa. Handpicked places, iconic countries, and life-changing experiences."
        keywords={['east africa destinations', 'safari destinations', 'african countries']}
        url="/destinations"
        type="website"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Destinations', url: '/destinations' },
        ]}
      />

      <div className="dv-page">
        <HeroBanner />
        <CountriesSection />
        <PopularSlideshow />

        {/* FINAL CTA */}
        <section className="dv-section--forest">
          <div className="dv-inner dv-cta">
            <AnimatedSection animation="scaleIn">
              <h2 className="dv-cta__title">
                Your East African<br />Adventure Starts Here
              </h2>
              <p className="dv-cta__desc">
                Whether you dream of golden savannahs, misty mountains, or turquoise shores
                — our expert travel designers will craft a journey as unique as you are.
              </p>
              <div className="dv-cta__buttons">
                <Link to="/booking" className="dv-cta__btn-primary">
                  <FiCalendar size={17} /> Plan Your Trip
                </Link>
                <Link to="/contact" className="dv-cta__btn-secondary">
                  <FiMail size={17} /> Speak to an Expert
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  );
}