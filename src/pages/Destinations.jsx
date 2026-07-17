// src/pages/Destinations.jsx
// ============================================================
// Destinations Page — Redesigned to match Explore.jsx styling
// Same typography, hero design, layout patterns & responsiveness
// ============================================================
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight, FiMapPin, FiCompass, FiClock, FiStar,
  FiHeart, FiUsers, FiAward, FiTrendingUp, FiGlobe,
  FiCalendar, FiChevronLeft, FiChevronRight, FiShield,
  FiPhone, FiMail, FiCheck, FiTarget, FiFeather,
  FiBookOpen, FiSun, FiEye, FiCamera, FiMap, FiZap,
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

function useFeaturedDestinations(limit = 8) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch(`/destinations?limit=${limit}&sort=featured`)
      .then(r => { if (!cancelled) setData(r.data || []); })
      .catch(() => { if (!cancelled) setData([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);
  return { data, loading };
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
   SLIDESHOW HOOK
═══════════════════════════════════════════════════════════ */
function useSlideshow(length, interval = 5000) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (length <= 1) return;
    timerRef.current = setInterval(
      () => setIdx(p => (p + 1) % length),
      interval,
    );
  }, [length, interval]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goNext = useCallback(() => {
    setIdx(p => (p + 1) % length);
    startTimer();
  }, [length, startTimer]);

  const goPrev = useCallback(() => {
    setIdx(p => (p - 1 + length) % length);
    startTimer();
  }, [length, startTimer]);

  const goTo = useCallback((i) => {
    setIdx(i);
    startTimer();
  }, [startTimer]);

  return { idx, goNext, goPrev, goTo };
}

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
  --dv-gold:     #f59e0b;
  --dv-text:     #0f172a;
  --dv-text-2:   #475569;
  --dv-text-3:   #94a3b8;
  --dv-border:   #e2e8f0;
  --dv-surface:  #ffffff;
  --dv-bg:       #f8fafb;
  --dv-radius:   22px;
  --dv-ease:     cubic-bezier(0.22, 1, 0.36, 1);
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
@keyframes dv-progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
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
@keyframes dv-spin {
  to { transform: rotate(360deg); }
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
@keyframes dv-pulse {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.6; }
}

*, *::before, *::after { box-sizing: border-box; }

.dv-page {
  background: var(--dv-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ═════════════════════════════════════════════════
   HERO  (identical structure & responsiveness to Explore hero)
═════════════════════════════════════════════════ */
.dv-hero {
  position: relative;
  height: 100vh; height: 100dvh;
  min-height: 540px; max-height: 980px;
  overflow: hidden;
  background: var(--dv-forest);
}
.dv-hero__slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 1.8s cubic-bezier(0.4,0,0.2,1);
  z-index: 0;
}
.dv-hero__slide--on { opacity: 1; z-index: 1; }
.dv-hero__slide img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}
.dv-hero__slide--on img { animation: dv-ken-burns 13s ease-out forwards; }

/* ── FOG LAYERS ── */
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
  opacity: 0.55;
  mix-blend-mode: screen;
}
.dv-hero__fog-layer--1 {
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.008' numOctaves='2' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/%3E%3CfeGaussianBlur stdDeviation='30'/%3E%3C/filter%3E%3Crect width='1200' height='800' filter='url(%23f)' opacity='0.7'/%3E%3C/svg%3E");
  animation: dv-fog-drift 32s ease-in-out infinite;
  opacity: 0.45;
}
.dv-hero__fog-layer--2 {
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cfilter id='f2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3' seed='19'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0'/%3E%3CfeGaussianBlur stdDeviation='40'/%3E%3C/filter%3E%3Crect width='1200' height='800' filter='url(%23f2)' opacity='0.6'/%3E%3C/svg%3E");
  animation: dv-fog-drift-slow 48s ease-in-out infinite;
  opacity: 0.35;
  transform-origin: center bottom;
}
.dv-hero__fog-bottom {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 45%;
  z-index: 2;
  background: linear-gradient(
    to top,
    rgba(255,255,255,0.35) 0%,
    rgba(255,255,255,0.15) 40%,
    rgba(255,255,255,0.05) 70%,
    transparent 100%
  );
  pointer-events: none;
  mix-blend-mode: screen;
}

/* ── OVERLAYS ── */
.dv-hero__ov-bottom {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(2,44,34,0.22) 0%,
    rgba(2,44,34,0.04) 32%,
    rgba(2,44,34,0.52) 78%,
    rgba(2,44,34,0.92) 100%
  );
}
.dv-hero__ov-left {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: linear-gradient(90deg, rgba(2,44,34,0.58) 0%, transparent 52%);
}
.dv-hero__grain {
  position: absolute; inset: 0; z-index: 4; pointer-events: none; opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
}

/* ── BODY ── */
.dv-hero__body {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 0 clamp(28px,7vw,104px);
  padding-bottom: clamp(56px,10vh,116px);
}
.dv-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: clamp(12px,1.8vw,20px);
  opacity: 0; animation: dv-fade-up 0.85s var(--dv-ease) 0.05s forwards;
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
  font-size: clamp(38px,7vw,88px);
  font-weight: 400; line-height: 1.0; color: #fff;
  margin: 0; letter-spacing: -0.03em;
  max-width: 820px;
  opacity: 0; animation: dv-fade-up 0.9s var(--dv-ease) 0.14s forwards;
}
.dv-hero__title em { font-style: italic; color: rgba(255,255,255,0.65); display: block; }
.dv-hero__desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(13px,1.3vw,16px);
  color: rgba(255,255,255,0.68);
  line-height: 1.78; max-width: 500px;
  margin: clamp(10px,1.4vw,18px) 0 clamp(20px,2.8vw,36px);
  font-weight: 300;
  opacity: 0; animation: dv-fade-up 0.9s var(--dv-ease) 0.26s forwards;
}
.dv-hero__location {
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: clamp(20px,2.8vw,34px);
  opacity: 0; animation: dv-fade-up 0.9s var(--dv-ease) 0.38s forwards;
}
.dv-hero__loc-divider {
  width: clamp(12px,1.6vw,20px); height: 1px;
  border-radius: 1px;
  background: linear-gradient(90deg,rgba(16,185,129,0.5),rgba(16,185,129,0.1));
}
.dv-hero__loc-text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(11px,1.1vw,14px); font-weight: 600;
  color: rgba(255,255,255,0.88); letter-spacing: 0.3px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.25);
}

/* Animated location pin */
.dv-pin {
  position: relative; flex-shrink: 0;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
}
.dv-pin__ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid rgba(16,185,129,0.45);
  animation: dv-pin-ring 2.4s ease-out infinite;
}
.dv-pin__ring:nth-child(2) { animation-delay: 0.9s; }
.dv-pin__svg {
  position: relative; z-index: 2;
  animation: dv-pin-bounce 2.2s ease-in-out infinite;
  filter: drop-shadow(0 2px 5px rgba(16,185,129,0.4));
}

/* Hero buttons */
.dv-hero__actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  opacity: 0; animation: dv-fade-up 0.9s var(--dv-ease) 0.48s forwards;
}
.dv-hero__btn-primary {
  display: inline-flex; align-items: center; gap: 9px;
  padding: clamp(12px,1.3vw,15px) clamp(22px,2.5vw,34px);
  border-radius: 14px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff; font-weight: 700; font-size: clamp(13px,1.2vw,15px);
  cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 28px rgba(16,185,129,0.38);
  transition: all 0.35s var(--dv-ease); text-decoration: none;
}
.dv-hero__btn-primary:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 40px rgba(16,185,129,0.55);
}
.dv-hero__btn-ghost {
  display: inline-flex; align-items: center; gap: 9px;
  padding: clamp(12px,1.3vw,15px) clamp(20px,2.2vw,30px);
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px); color: #fff;
  font-weight: 700; font-size: clamp(13px,1.2vw,15px);
  cursor: pointer; font-family: inherit;
  transition: all 0.32s ease; text-decoration: none;
}
.dv-hero__btn-ghost:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.4);
  transform: translateY(-2px);
}

/* Dots */
.dv-hero__dots {
  position: absolute;
  bottom: clamp(22px,3.5vh,44px);
  right: clamp(28px,5vw,72px);
  z-index: 6; display: flex; gap: 7px;
}
.dv-hero__dot {
  width: 7px; height: 7px; border-radius: 4px;
  background: rgba(255,255,255,0.25);
  border: none; padding: 0; cursor: pointer;
  transition: all 0.5s var(--dv-ease);
}
.dv-hero__dot--on {
  width: 26px; background: rgba(255,255,255,0.88);
  box-shadow: 0 0 8px rgba(255,255,255,0.3);
}
.dv-hero__prog {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; z-index: 6;
  background: rgba(255,255,255,0.06);
}
.dv-hero__prog-fill {
  height: 100%;
  background: linear-gradient(90deg,#34d399,#10b981);
  transform-origin: left;
  animation: dv-progress 8s linear forwards;
}
.dv-hero__scroll {
  position: absolute;
  bottom: clamp(16px,3.5vh,42px);
  left: clamp(28px,7vw,104px);
  z-index: 6;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700;
  letter-spacing: 2.5px; text-transform: uppercase;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: none; border: none; cursor: pointer;
  transition: color 0.3s ease;
}
.dv-hero__scroll:hover { color: rgba(255,255,255,0.75); }
.dv-hero__scroll-line {
  width: 1px; height: 36px;
  background: linear-gradient(180deg, rgba(255,255,255,0.35), transparent);
  animation: dv-progress 2.5s ease-in-out infinite alternate;
}

/* ═════════════════════════════════════════════════
   SECTIONS
═════════════════════════════════════════════════ */
.dv-section {
  padding: clamp(52px,7vw,96px) clamp(16px,5vw,56px);
}
.dv-section--alt   { background: var(--dv-surface); }
.dv-section--mint  { background: var(--dv-mint); }
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

/* Section header (identical to Explore) */
.dv-section-head {
  text-align: center; max-width: 780px;
  margin: 0 auto clamp(32px,4.5vw,56px);
}
.dv-section-head--left {
  text-align: left; max-width: none;
  margin-left: 0; margin-right: 0;
}
.dv-section-head--split {
  text-align: left; max-width: none;
  margin-left: 0; margin-right: 0;
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 20px;
}
.dv-section-label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px; border-radius: 999px;
  background: var(--dv-mint); color: var(--dv-green-dk);
  font-size: 11px; font-weight: 700;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  letter-spacing: 0.08em; text-transform: uppercase;
  border: 1px solid #a7f3d0;
  margin-bottom: 16px;
}
.dv-section-label--light {
  background: rgba(16,185,129,0.15);
  color: #a7f3d0;
  border-color: rgba(16,185,129,0.25);
}
.dv-section-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px,4.5vw,52px);
  font-weight: 400; line-height: 1.12;
  color: var(--dv-text); margin: 0 0 16px;
  letter-spacing: -0.025em;
}
.dv-section-title--light { color: #fff; }
.dv-section-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: var(--dv-text-2);
  font-size: clamp(14px,1.4vw,17px);
  line-height: 1.78;
  max-width: 640px;
  margin: 0 auto;
}
.dv-section-desc--left { margin: 0; }
.dv-section-desc--light { color: rgba(255,255,255,0.72); }

/* ═════════════════════════════════════════════════
   EDITORIAL INTRO
═════════════════════════════════════════════════ */
.dv-editorial {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}
.dv-editorial__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px,4.5vw,46px);
  font-weight: 400; line-height: 1.18;
  color: var(--dv-text);
  margin: 0 0 clamp(16px,2vw,24px);
  letter-spacing: -0.02em;
}
.dv-editorial__text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(15px,1.3vw,17px);
  color: var(--dv-text-2);
  line-height: 1.82;
  margin: 0 0 14px;
}

/* ═════════════════════════════════════════════════
   COUNTRIES GRID  (matching Explore showcase card style)
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
  transition: all 0.5s var(--dv-ease);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.dv-country-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 56px rgba(5,150,105,0.18), 0 8px 24px rgba(0,0,0,0.1);
}
.dv-country-card__img-wrap {
  position: absolute; inset: 0; overflow: hidden;
}
.dv-country-card__img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 8s cubic-bezier(0.25,0,0.15,1);
}
.dv-country-card:hover .dv-country-card__img { transform: scale(1.06); }
.dv-country-card__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(2,44,34,0.25) 0%,
    rgba(2,44,34,0.1) 35%,
    rgba(2,44,34,0.68) 100%
  );
  z-index: 1;
}
.dv-country-card__content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: clamp(24px,3.5vw,40px);
}
.dv-country-card__eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.35);
  backdrop-filter: blur(10px);
  color: #a7f3d0;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  width: fit-content; margin-bottom: 16px;
}
.dv-country-card__flag {
  position: absolute; top: 18px; left: 18px; z-index: 3;
  width: 46px; height: 46px; border-radius: 12px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  display: grid; place-items: center;
  font-size: 24px; line-height: 1;
  box-shadow: 0 3px 14px rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.5);
  overflow: hidden;
}
.dv-country-card__flag img {
  width: 100%; height: 100%; object-fit: cover;
}
.dv-country-card__badge {
  position: absolute; top: 18px; right: 18px; z-index: 3;
  padding: 6px 13px; border-radius: 999px;
  background: rgba(16,185,129,0.88);
  backdrop-filter: blur(8px);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em;
}
.dv-country-card__name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(26px,3.8vw,42px);
  font-weight: 400; margin: 0 0 8px; color: #fff;
  line-height: 1.12; letter-spacing: -0.02em;
}
.dv-country-card__region {
  display: flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.62);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600; margin-bottom: 12px;
  letter-spacing: 0.02em;
}
.dv-country-card__desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(13px,1.2vw,15px);
  line-height: 1.72; color: rgba(255,255,255,0.78);
  margin: 0 0 22px; max-width: 460px;
  display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden;
}
.dv-country-card__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 28px; border-radius: 14px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 700; font-size: 14px;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(16,185,129,0.35);
  transition: all 0.3s var(--dv-ease);
  text-decoration: none; width: fit-content;
}
.dv-country-card__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,0.5);
}
.dv-country-skel {
  border-radius: var(--dv-radius); overflow: hidden;
  min-height: 440px;
  background: linear-gradient(90deg,#e2e8f0 0%,#f1f5f9 40%,#e2e8f0 80%);
  background-size: 200%;
  animation: dv-shimmer 1.6s ease infinite;
}

/* ═════════════════════════════════════════════════
   DESTINATIONS GRID
═════════════════════════════════════════════════ */
.dv-dest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%,300px),1fr));
  gap: clamp(14px,2vw,22px);
}
.dv-dest-grid__card {
  animation: dv-fade-up 0.5s var(--dv-ease) both;
}

/* ═════════════════════════════════════════════════
   SLIDER / POPULAR
═════════════════════════════════════════════════ */
.dv-slider {
  position: relative;
}
.dv-slider__viewport { overflow: hidden; }
.dv-slider__track {
  display: flex; gap: clamp(14px,2vw,22px);
  transition: transform 0.65s var(--dv-ease);
}
.dv-slider__item {
  flex: 0 0 clamp(260px,30vw,360px); min-width: 0;
}
.dv-arrow {
  width: 48px; height: 48px; border-radius: 50%;
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
  gap: 8px; margin-top: 24px;
}
.dv-slider__dot {
  width: 8px; height: 8px; border-radius: 4px;
  border: none; padding: 0; cursor: pointer;
  background: var(--dv-border);
  transition: all 0.35s var(--dv-ease);
}
.dv-slider__dot--on { width: 28px; background: var(--dv-green); }

/* ═════════════════════════════════════════════════
   WHY DESTINATIONS
═════════════════════════════════════════════════ */
.dv-why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%,280px),1fr));
  gap: clamp(14px,2vw,22px);
}
.dv-why-card {
  display: flex; flex-direction: column; gap: 16px;
  padding: clamp(24px,3vw,32px);
  border-radius: 18px;
  background: var(--dv-surface);
  border: 1.5px solid var(--dv-border);
  transition: all 0.35s var(--dv-ease);
}
.dv-why-card:hover {
  border-color: rgba(5,150,105,0.28);
  transform: translateY(-4px);
  box-shadow: 0 14px 40px rgba(5,150,105,0.1);
}
.dv-why-card__icon {
  width: 54px; height: 54px;
  border-radius: 16px;
  background: var(--dv-mint);
  border: 1px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--dv-green-dk);
  transition: all 0.3s ease;
}
.dv-why-card:hover .dv-why-card__icon {
  background: var(--dv-green);
  color: #fff;
  border-color: var(--dv-green);
  transform: scale(1.06);
}
.dv-why-card__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-weight: 400; font-size: 20px;
  color: var(--dv-text);
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}
.dv-why-card__text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14px; color: var(--dv-text-2);
  line-height: 1.72; margin: 0;
}

/* ═════════════════════════════════════════════════
   FINAL CTA
═════════════════════════════════════════════════ */
.dv-cta {
  text-align: center; position: relative; z-index: 1;
  padding: clamp(52px,8vw,96px) clamp(20px,5vw,64px);
}
.dv-cta__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(34px,6vw,60px);
  font-weight: 400; color: #fff;
  line-height: 1.12; margin: 0 0 20px;
  letter-spacing: -0.02em;
}
.dv-cta__desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(15px,1.4vw,18px);
  color: rgba(255,255,255,0.7);
  line-height: 1.78; max-width: 600px;
  margin: 0 auto 40px;
}
.dv-cta__buttons {
  display: flex; gap: 16px;
  justify-content: center; flex-wrap: wrap;
}
.dv-cta__btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 40px; border-radius: 16px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 800; font-size: 16px;
  cursor: pointer;
  box-shadow: 0 10px 36px rgba(16,185,129,0.42);
  transition: all 0.35s var(--dv-ease); text-decoration: none;
}
.dv-cta__btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 44px rgba(16,185,129,0.58);
}
.dv-cta__btn-secondary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 36px; border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-weight: 700; font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease; text-decoration: none;
}
.dv-cta__btn-secondary:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.42);
  transform: translateY(-2px);
}

.dv-empty {
  text-align: center; padding: 60px 24px; color: var(--dv-text-3);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* ═════════════════════════════════════════════════
   RESPONSIVE
═════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .dv-hero { min-height: 500px; }
}
@media (max-width: 768px) {
  .dv-hero { min-height: 480px; max-height: 740px; }
  .dv-hero__btn-ghost { display: none; }
  .dv-hero__scroll { display: none; }
  .dv-countries-grid { grid-template-columns: repeat(auto-fill,minmax(min(100%,280px),1fr)); }
  .dv-country-card { min-height: 380px; }
  .dv-dest-grid { grid-template-columns: repeat(2,1fr); }
  .dv-section-head--split { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 640px) {
  .dv-hero { height: 88vh; height: 88dvh; min-height: 440px; }
  .dv-hero__body { padding: 0 20px; padding-bottom: 60px; }
  .dv-hero__dots { right: 20px; bottom: 18px; }
  .dv-countries-grid { grid-template-columns: 1fr; }
  .dv-country-card { min-height: 340px; }
  .dv-dest-grid { grid-template-columns: 1fr; }
  .dv-slider__item { flex: 0 0 clamp(240px,80vw,300px); }
  .dv-cta__buttons { flex-direction: column; align-items: center; }
  .dv-cta__btn-primary, .dv-cta__btn-secondary { width: 100%; max-width: 320px; justify-content: center; }
}
@media (max-width: 380px) {
  .dv-hero__title { font-size: clamp(32px,10vw,52px); }
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
  if (document.getElementById('dv-styles')) return;
  const s = document.createElement('style');
  s.id = 'dv-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED LOCATION PIN
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
   HERO BANNER (with fog layers)
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

  const slide = HERO_SLIDES[active];

  return (
    <section className="dv-hero">
      {HERO_SLIDES.map((sl, i) => (
        <div key={i} className={`dv-hero__slide${i === active ? ' dv-hero__slide--on' : ''}`}>
          <img src={sl.image} alt={sl.title} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
        </div>
      ))}

      {/* FOG LAYERS */}
      <div className="dv-hero__fog">
        <div className="dv-hero__fog-layer dv-hero__fog-layer--1" />
        <div className="dv-hero__fog-layer dv-hero__fog-layer--2" />
      </div>
      <div className="dv-hero__fog-bottom" />

      {/* Overlays */}
      <div className="dv-hero__ov-bottom" />
      <div className="dv-hero__ov-left" />
      <div className="dv-hero__grain" />

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

      <div className="dv-hero__prog">
        <div className="dv-hero__prog-fill" key={`p-${animKey}`} />
      </div>

      <button className="dv-hero__scroll" onClick={() => {
        document.getElementById('countries')?.scrollIntoView({ behavior: 'smooth' });
      }}>
        <div className="dv-hero__scroll-line" />
        Scroll
      </button>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNTRY CARD
═══════════════════════════════════════════════════════════ */
function CountryCard({ country, index }) {
  const navigate  = useNavigate();
  const slug      = getCountrySlug(country);
  const flag      = country.flagUrl || country.flag_url || country.flag || '';
  const isImg     = flag && (flag.startsWith('http') || flag.includes('/'));
  const isEmoji   = flag && !isImg;
  const destCount = country.destinationsCount ?? country.destinations_count ?? country.destinationCount ?? null;
  const heroImg   = country.hero_image_url || country.heroImage || country.coverImage || country.image ||
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=85';

  return (
    <div
      className="dv-country-card"
      onClick={() => navigate(`/country/${slug}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/country/${slug}`)}
      style={{ animationDelay: `${Math.min(index, 5) * 0.06}s`, animation: 'dv-fade-up 0.5s var(--dv-ease) both' }}
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
        <div className="dv-country-card__eyebrow">
          <FiGlobe size={10} /> {country.region || country.continent || 'Africa'}
        </div>
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
              <div className="dv-section-label"><FiTrendingUp size={11} /> Popular</div>
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
              <div className="dv-section-label">
                <FiTrendingUp size={11} /> Popular
              </div>
              <h2 className="dv-section-title">Popular Destinations</h2>
              <p className="dv-section-desc dv-section-desc--left">
                Beloved by travellers from every corner of the world — these remarkable
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
   COUNTRIES SECTION
═══════════════════════════════════════════════════════════ */
function CountriesSection() {
  const { countries, loading } = useCountries({ limit: 12, is_active: true });

  return (
    <section className="dv-section dv-section--alt" id="countries">
      <div className="dv-inner">
        <AnimatedSection animation="fadeInUp">
          <div className="dv-section-head">
            <div className="dv-section-label">
              <FiGlobe size={11} /> By Country
            </div>
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
            {countries.map((c, i) => <CountryCard key={c.id || c.slug} country={c} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURED DESTINATIONS GRID
═══════════════════════════════════════════════════════════ */
function FeaturedDestinationsSection() {
  const { data, loading } = useFeaturedDestinations(8);

  return (
    <section className="dv-section dv-section--alt">
      <div className="dv-inner">
        <AnimatedSection animation="fadeInUp">
          <div className="dv-section-head">
            <div className="dv-section-label">
              <FiCompass size={11} /> Featured Destinations
            </div>
            <h2 className="dv-section-title">Unforgettable Adventures Await</h2>
            <p className="dv-section-desc">
              Hand-picked experiences that showcase the very best of East Africa —
              from heart-pounding safaris and gorilla encounters to tropical retreats.
            </p>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="dv-dest-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="dv-dest-grid__card" style={{ animationDelay: `${i * 0.06}s` }}>
                <DestinationCardSkeleton />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="dv-empty">
            <FiGlobe size={44} style={{ opacity: 0.35, marginBottom: 14 }} />
            <p style={{ margin: 0, fontSize: 15 }}>No destinations found. Check back soon!</p>
          </div>
        ) : (
          <div className="dv-dest-grid">
            {data.map((dest, i) => (
              <div key={dest.id} className="dv-dest-grid__card" style={{ animationDelay: `${Math.min(i, 5) * 0.06}s` }}>
                <DestinationCard destination={dest} priority={i < 4} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WHY DESTINATIONS DATA + SECTION
═══════════════════════════════════════════════════════════ */
const WHY_ITEMS = [
  {
    Icon: FiTarget,
    title: 'Handpicked Destinations',
    text: 'Every destination in our collection is personally vetted by our travel experts for authenticity and impact.',
  },
  {
    Icon: FiFeather,
    title: 'Authentic Experiences',
    text: 'Move beyond tourist trails to connect with local communities, cultures and wild landscapes.',
  },
  {
    Icon: FiShield,
    title: 'Trusted Local Partners',
    text: 'We work with certified guides, licensed operators and eco-conscious lodges in every region.',
  },
  {
    Icon: FiSun,
    title: 'Year-Round Wonder',
    text: 'From dry-season safaris to migration spectacles — each destination shines in every season.',
  },
];

function WhyDestinationsSection() {
  return (
    <section className="dv-section dv-section--mint">
      <div className="dv-inner">
        <AnimatedSection animation="fadeInUp">
          <div className="dv-section-head">
            <div className="dv-section-label">
              <FiHeart size={11} /> Why Us
            </div>
            <h2 className="dv-section-title">Destinations You Can Trust</h2>
            <p className="dv-section-desc">
              Every place in our collection has been curated with care — chosen not
              just for beauty, but for the stories, people and ecosystems that make it unforgettable.
            </p>
          </div>
        </AnimatedSection>

        <div className="dv-why-grid">
          {WHY_ITEMS.map((item, i) => (
            <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.08}>
              <div className="dv-why-card">
                <div className="dv-why-card__icon">
                  <item.Icon size={24} />
                </div>
                <div>
                  <h4 className="dv-why-card__title">{item.title}</h4>
                  <p className="dv-why-card__text">{item.text}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
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

        {/* EDITORIAL INTRO */}
        <section className="dv-section dv-section--alt">
          <div className="dv-inner">
            <AnimatedSection animation="fadeInUp">
              <div className="dv-editorial">
                <h2 className="dv-editorial__title">
                  Every Corner of East Africa, Curated for the Curious
                </h2>
                <p className="dv-editorial__text">
                  From the golden savannahs of the Maasai Mara to the mist-shrouded
                  volcanoes of Rwanda, each destination we feature tells a story worth
                  travelling for. These are not just places on a map — they are windows
                  into extraordinary landscapes, cultures, and encounters.
                </p>
                <p className="dv-editorial__text" style={{ marginBottom: 0 }}>
                  Whether you dream of tracking mountain gorillas, following the great migration,
                  or watching the sun rise from Kilimanjaro's summit — every journey begins here.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* COUNTRIES */}
        <CountriesSection />

        {/* POPULAR SLIDER */}
        <PopularSlideshow />

        {/* FEATURED DESTINATIONS GRID */}
        <FeaturedDestinationsSection />

        {/* WHY DESTINATIONS */}
        <WhyDestinationsSection />

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
                  <FiCalendar size={18} /> Plan Your Trip
                </Link>
                <Link to="/contact" className="dv-cta__btn-secondary">
                  <FiMail size={18} /> Speak to an Expert
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  );
}