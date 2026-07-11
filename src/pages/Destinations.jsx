// src/pages/Destinations.jsx
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight, FiMapPin, FiGlobe,
  FiChevronLeft, FiChevronRight,
  FiTrendingUp, FiCompass, FiCalendar, FiMail,
} from 'react-icons/fi';
import { useCountries } from '../hooks/useCountries';
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
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
};

/* ═══════════════════════════════════════════════════════════
   HERO SLIDES  (same cinematic pattern as Explore)
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
    desc: 'Over two million wildebeest thunder across the Serengeti plains in one of nature\'s most breathtaking annual spectacles.',
    location: 'Tanzania & Kenya',
  },
  {
    image: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1920&q=90',
    title: 'Conquer Africa\'s',
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

*, *::before, *::after { box-sizing: border-box; }

.dv-page {
  background: var(--dv-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ════════════════════════════════
   HERO  (full Explore-style)
════════════════════════════════ */
.dv-hero {
  position: relative;
  height: 100vh; height: 100dvh;
  min-height: 540px; max-height: 980px;
  overflow: hidden;
  background: var(--dv-forest);
}

/* slides */
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

/* overlays */
.dv-hero__ov-bottom {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(2,44,34,0.22) 0%,
    rgba(2,44,34,0.04) 32%,
    rgba(2,44,34,0.52) 78%,
    rgba(2,44,34,0.92) 100%
  );
}
.dv-hero__ov-left {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: linear-gradient(90deg, rgba(2,44,34,0.58) 0%, transparent 52%);
}
.dv-hero__grain {
  position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
}

/* content */
.dv-hero__body {
  position: absolute; inset: 0; z-index: 4;
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
  font-size: clamp(13px,1.3vw,16px);
  color: rgba(255,255,255,0.68);
  line-height: 1.78; max-width: 500px;
  margin: clamp(10px,1.4vw,18px) 0 clamp(20px,2.8vw,36px);
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

/* hero actions */
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

/* dots */
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

/* scroll hint */
.dv-hero__scroll {
  position: absolute;
  bottom: clamp(16px,3.5vh,42px);
  left: clamp(28px,7vw,104px);
  z-index: 6;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 700;
  letter-spacing: 2.5px; text-transform: uppercase;
  background: none; border: none; cursor: pointer;
  transition: color 0.3s ease;
}
.dv-hero__scroll:hover { color: rgba(255,255,255,0.75); }
.dv-hero__scroll-line {
  width: 1px; height: 36px;
  background: linear-gradient(180deg, rgba(255,255,255,0.35), transparent);
  animation: dv-progress 2.5s ease-in-out infinite alternate;
}

/* ════════════════════════════════
   SECTIONS  — tight vertical
════════════════════════════════ */
.dv-sec {
  padding: clamp(44px,6vw,80px) clamp(16px,5vw,56px);
}
.dv-sec--white { background: var(--dv-surface); }
.dv-sec--bg    { background: var(--dv-bg); }
.dv-sec--forest {
  background: linear-gradient(160deg, #0f172a 0%, #022c22 40%, #064e3b 100%);
  background-size: 200% 200%;
  animation: dv-gradient-shift 12s ease infinite;
  position: relative; overflow: hidden;
}
.dv-sec--forest::before {
  content: '';
  position: absolute; top: 8%; left: 4%;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.dv-sec--forest::after {
  content: '';
  position: absolute; bottom: 5%; right: 7%;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.dv-inner { max-width: 1400px; margin: 0 auto; }

/* Section headings */
.dv-head {
  text-align: center; max-width: 720px;
  margin: 0 auto clamp(28px,3.5vw,48px);
}
.dv-head--split {
  text-align: left; max-width: none;
  margin-left: 0; margin-right: 0;
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 14px;
  margin-bottom: clamp(28px,3.5vw,48px);
}
.dv-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px,4.5vw,52px);
  font-weight: 400; line-height: 1.12;
  color: var(--dv-text); margin: 0 0 12px;
  letter-spacing: -0.025em;
}
.dv-title--light { color: #fff; }
.dv-desc {
  color: var(--dv-text-2);
  font-size: clamp(14px,1.35vw,17px);
  line-height: 1.78; margin: 0; max-width: 620px;
}
.dv-desc--center { margin: 0 auto; }
.dv-desc--light { color: rgba(255,255,255,0.62); }
.dv-desc--left { margin: 0; }

/* ════════════════════════════════
   COUNTRY SHOWCARDS
════════════════════════════════ */
.dv-countries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%,300px),1fr));
  gap: clamp(14px,2vw,22px);
}
.dv-showcard {
  position: relative; border-radius: var(--dv-radius);
  overflow: hidden; background: var(--dv-forest);
  cursor: pointer; text-decoration: none; color: #fff;
  display: block; min-height: 400px;
  transition: all 0.5s var(--dv-ease);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.dv-showcard:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 56px rgba(5,150,105,0.18), 0 8px 24px rgba(0,0,0,0.1);
}
.dv-showcard__img-wrap {
  position: absolute; inset: 0; overflow: hidden;
}
.dv-showcard__img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 8s cubic-bezier(0.25,0,0.15,1);
}
.dv-showcard:hover .dv-showcard__img { transform: scale(1.06); }
.dv-showcard__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(2,44,34,0.25) 0%,
    rgba(2,44,34,0.1) 35%,
    rgba(2,44,34,0.68) 100%
  );
  z-index: 1;
}
.dv-showcard__content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: clamp(22px,3vw,38px);
}
.dv-showcard__eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.35);
  backdrop-filter: blur(10px);
  color: #a7f3d0; font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  width: fit-content; margin-bottom: 14px;
}
.dv-showcard__flag {
  position: absolute; top: 16px; left: 16px; z-index: 3;
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  display: grid; place-items: center;
  font-size: 24px; line-height: 1;
  box-shadow: 0 3px 14px rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.5);
  overflow: hidden;
}
.dv-showcard__flag img {
  width: 100%; height: 100%; object-fit: cover;
}
.dv-showcard__badge {
  position: absolute; top: 16px; right: 16px; z-index: 3;
  padding: 5px 12px; border-radius: 999px;
  background: rgba(16,185,129,0.88);
  backdrop-filter: blur(8px);
  color: #fff; font-size: 11px; font-weight: 700;
}
.dv-showcard__name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(24px,3.5vw,38px);
  font-weight: 400; margin: 0 0 8px; color: #fff;
  line-height: 1.1; letter-spacing: -0.02em;
}
.dv-showcard__region {
  display: flex; align-items: center; gap: 5px;
  color: rgba(255,255,255,0.52); font-size: 12px;
  font-weight: 500; margin-bottom: 10px;
}
.dv-showcard__text {
  font-size: clamp(13px,1.1vw,14.5px);
  line-height: 1.72; color: rgba(255,255,255,0.7);
  margin: 0 0 20px; max-width: 420px;
  display: -webkit-box;
  -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden;
}
.dv-showcard__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 26px; border-radius: 14px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff; font-weight: 700; font-size: 13px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 6px 24px rgba(16,185,129,0.35);
  transition: all 0.3s var(--dv-ease);
  text-decoration: none; width: fit-content;
}
.dv-showcard__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,0.5);
}
.dv-showcard-skel {
  border-radius: var(--dv-radius); overflow: hidden;
  min-height: 400px;
  background: linear-gradient(90deg,#e2e8f0 0%,#f1f5f9 40%,#e2e8f0 80%);
  background-size: 200%;
  animation: dv-shimmer 1.6s ease infinite;
}

/* ════════════════════════════════
   POPULAR SLIDER
════════════════════════════════ */
.dv-slider__viewport { overflow: hidden; border-radius: 16px; }
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
.dv-arrow:hover {
  background: var(--dv-green); color: #fff;
  border-color: var(--dv-green);
  box-shadow: 0 6px 20px rgba(5,150,105,0.3);
  transform: scale(1.08);
}
.dv-arrow:disabled { opacity: 0.3; pointer-events: none; }
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

/* ════════════════════════════════
   CTA FINAL
════════════════════════════════ */
.dv-cta {
  text-align: center; position: relative; z-index: 1;
  padding: clamp(52px,8vw,96px) clamp(20px,5vw,64px);
}
.dv-cta__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(32px,5.5vw,60px);
  font-weight: 400; color: #fff;
  line-height: 1.1; margin: 0 0 18px;
  letter-spacing: -0.02em;
}
.dv-cta__desc {
  font-size: clamp(14px,1.4vw,18px);
  color: rgba(255,255,255,0.62);
  line-height: 1.78; max-width: 580px;
  margin: 0 auto 36px;
}
.dv-cta__buttons {
  display: flex; gap: 16px;
  justify-content: center; flex-wrap: wrap;
}
.dv-cta__btn-a {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 40px; border-radius: 16px; border: none;
  background: linear-gradient(135deg,#10b981,#059669);
  color: #fff; font-weight: 800; font-size: 15px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 10px 36px rgba(16,185,129,0.42);
  transition: all 0.35s var(--dv-ease); text-decoration: none;
}
.dv-cta__btn-a:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 44px rgba(16,185,129,0.58);
}
.dv-cta__btn-b {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 36px; border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  color: #fff; font-weight: 700; font-size: 15px;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s ease; text-decoration: none;
}
.dv-cta__btn-b:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.42);
  transform: translateY(-2px);
}

.dv-spinner {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2.5px solid #d1fae5; border-top-color: var(--dv-green);
  animation: dv-spin 0.65s linear infinite;
  display: inline-block;
}

/* ════════ Responsive ════════ */
@media (max-width: 768px) {
  .dv-hero { min-height: 480px; max-height: 740px; }
  .dv-hero__btn-ghost { display: none; }
  .dv-hero__scroll { display: none; }
  .dv-countries { grid-template-columns: repeat(auto-fill,minmax(min(100%,260px),1fr)); }
  .dv-showcard { min-height: 340px; }
  .dv-head--split { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 640px) {
  .dv-hero { height: 88vh; height: 88dvh; min-height: 440px; }
  .dv-hero__body { padding: 0 20px; padding-bottom: 60px; }
  .dv-hero__dots { right: 20px; bottom: 18px; }
  .dv-countries { grid-template-columns: 1fr; }
  .dv-slider__item { flex: 0 0 clamp(230px,78vw,290px); }
  .dv-showcard { min-height: 300px; }
  .dv-cta__buttons { flex-direction: column; align-items: center; }
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
   ANIMATED LOCATION PIN (matches Hero.jsx pattern)
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
   DATA HOOKS
═══════════════════════════════════════════════════════════ */
function usePopularDestinations(limit = 14) {
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

/* ═══════════════════════════════════════════════════════════
   HERO
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

      <div className="dv-hero__ov-bottom" />
      <div className="dv-hero__ov-left" />
      <div className="dv-hero__grain" />

      <div className="dv-hero__body">
        {/* Eyebrow */}
        <div className="dv-hero__eyebrow" key={`ey-${animKey}`}>
          <div className="dv-hero__ey-line dv-hero__ey-line--l" />
          <span className="dv-hero__ey-text">Curated East Africa Destinations</span>
          <div className="dv-hero__ey-line dv-hero__ey-line--r" />
        </div>

        {/* Title */}
        <h1 className="dv-hero__title" key={`t-${animKey}`}>
          {slide.title}
          <em>{slide.subtitle}</em>
        </h1>

        {/* Desc */}
        <p className="dv-hero__desc" key={`d-${animKey}`}>{slide.desc}</p>

        {/* Location */}
        <div className="dv-hero__location" key={`l-${animKey}`}>
          <LocationPin size={17} />
          <div className="dv-hero__loc-divider" />
          <span className="dv-hero__loc-text">{slide.location}</span>
        </div>

        {/* Buttons */}
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

      {/* Progress */}
      <div className="dv-hero__prog">
        <div className="dv-hero__prog-fill" key={`p-${animKey}`} />
      </div>

      {/* Scroll hint */}
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
      className="dv-showcard"
      onClick={() => navigate(`/country/${slug}`)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/country/${slug}`)}
      style={{ animationDelay: `${index * 0.06}s`, animation: 'dv-fade-up 0.5s var(--dv-ease) both' }}
    >
      <div className="dv-showcard__img-wrap">
        <img className="dv-showcard__img" src={heroImg} alt={country.name} loading="lazy" draggable={false} />
      </div>
      <div className="dv-showcard__overlay" />

      <div className="dv-showcard__flag">
        {isImg ? <img src={flag} alt="" /> : isEmoji ? <span>{flag}</span> : <FiGlobe size={18} color="#059669" />}
      </div>

      {destCount > 0 && (
        <div className="dv-showcard__badge">
          {destCount} destination{destCount !== 1 ? 's' : ''}
        </div>
      )}

      <div className="dv-showcard__content">
        <div className="dv-showcard__eyebrow">
          <FiGlobe size={10} /> {country.region || country.continent || 'Africa'}
        </div>
        <h3 className="dv-showcard__name">{country.name}</h3>
        {(country.region || country.continent) && (
          <div className="dv-showcard__region">
            <FiMapPin size={10} /> {country.region || country.continent}
          </div>
        )}
        <p className="dv-showcard__text">
          {country.emotional_description || country.description ||
           `Discover the breathtaking landscapes and vibrant cultures that make ${country.name} unforgettable.`}
        </p>
        <Link to={`/country/${slug}`} className="dv-showcard__btn" onClick={e => e.stopPropagation()}>
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
    <section className="dv-sec dv-sec--white" id="countries">
      <div className="dv-inner">
        <div className="dv-head">
          <h2 className="dv-title">Choose Your Country</h2>
          <p className="dv-desc dv-desc--center">
            Each country holds its own magnificent story — from ancient forests
            and volcanic peaks to golden savannahs and turquoise coastlines.
          </p>
        </div>

        {loading ? (
          <div className="dv-countries">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="dv-showcard-skel" />)}
          </div>
        ) : countries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <FiGlobe size={40} style={{ opacity: 0.35, marginBottom: 14 }} />
            <p style={{ margin: 0, fontSize: 15 }}>No countries found.</p>
          </div>
        ) : (
          <div className="dv-countries">
            {countries.map((c, i) => <CountryCard key={c.id || c.slug} country={c} index={i} />)}
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

  const VISIBLE = useMemo(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 540) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  }, []);

  const maxIdx = Math.max(0, data.length - VISIBLE);
  const itemW  = 'clamp(260px,30vw,360px)';
  const gap    = 'clamp(14px,2vw,22px)';

  if (loading) return (
    <section className="dv-sec dv-sec--bg" id="popular">
      <div className="dv-inner">
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
    <section className="dv-sec dv-sec--bg" id="popular">
      <div className="dv-inner">
        <div className="dv-head--split">
          <div>
            <h2 className="dv-title">Popular Destinations</h2>
            <p className="dv-desc dv-desc--left">
              Beloved by travellers from every corner of the world — these remarkable
              destinations have captured hearts and created lifelong memories.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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

        <div className="dv-slider__dots">
          {Array.from({ length: maxIdx + 1 }, (_, i) => (
            <button
              key={i}
              className={`dv-slider__dot${i === idx ? ' dv-slider__dot--on' : ''}`}
              style={{ width: i === idx ? 28 : 8 }}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
            />
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
    <div className="dv-page">
      <HeroBanner />
      <CountriesSection />
      <PopularSlideshow />

      {/* CTA */}
      <section className="dv-sec--forest">
        <div className="dv-inner dv-cta">
          <h2 className="dv-cta__title">
            Your East African<br />Adventure Starts Here
          </h2>
          <p className="dv-cta__desc">
            Whether you dream of golden savannas, misty mountains, or turquoise shores
            — our expert travel designers will craft a journey as unique as you are.
          </p>
          <div className="dv-cta__buttons">
            <Link to="/booking" className="dv-cta__btn-a">
              <FiCalendar size={17} /> Plan Your Trip
            </Link>
            <Link to="/contact" className="dv-cta__btn-b">
              <FiMail size={17} /> Speak to an Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}