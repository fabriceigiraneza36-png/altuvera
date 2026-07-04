// pages/Explore.jsx
// ============================================================
// Explore Page — Complete Redesign
// DB-driven destinations, countries, testimonials, YouTube video
// ============================================================
import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import SubscriptionForm from '../components/common/SubscriptionForm';
import DestinationCard, {
  DestinationCardSkeleton,
} from '../components/common/DestinationCard';
import { useCountries } from '../hooks/useCountries';
import { useFeaturedTestimonials } from '../hooks/useTestimonials';
import {
  FiArrowRight, FiMapPin, FiCompass, FiClock, FiStar,
  FiHeart, FiUsers, FiAward, FiTrendingUp, FiGlobe,
  FiCalendar, FiChevronLeft, FiChevronRight, FiShield,
  FiPhone, FiMail, FiCheck, FiTarget, FiFeather,
  FiBookOpen, FiArrowUpRight, FiSun, FiRefreshCw,
  FiPlay, FiVolume2, FiVolumeX, FiMaximize,
  FiEye, FiCamera, FiMap, FiZap, FiStar as FiStarIcon,
} from 'react-icons/fi';

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
   DATA HOOKS
═══════════════════════════════════════════════════════════ */
function useAllDestinations(limit = 10) {
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

function usePopularDestinations(limit = 10) {
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
   HELPER FUNCTIONS
═══════════════════════════════════════════════════════════ */
const getCountrySlug = (c) =>
  c.slug || c.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

const getFlag = (c) => c.flagUrl || c.flag_url || c.flag || '';
const isFlagEmoji = (f) => f && !f.startsWith('http') && !f.includes('/');

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <FiStar
      key={i}
      size={13}
      style={{
        fill: i < Math.floor(rating || 0) ? '#22C55E' : 'transparent',
        color: i < Math.floor(rating || 0) ? '#22C55E' : '#D0E3D0',
        flexShrink: 0,
      }}
    />
  ));

/* ═══════════════════════════════════════════════════════════
   SLIDESHOW HOOK
═══════════════════════════════════════════════════════════ */
function useSlideshow(length, interval = 4500) {
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
   WHY EAST AFRICA DATA
═══════════════════════════════════════════════════════════ */
const WHY_ITEMS = [
  {
    Icon: FiSun,
    title: 'Year-Round Sunshine',
    text: 'East Africa enjoys warm, pleasant weather throughout the year, making it perfect for travel any season.',
  },
  {
    Icon: FiTarget,
    title: 'Unmatched Biodiversity',
    text: 'Home to over 1,100 bird species, the Big Five, mountain gorillas, and marine ecosystems teeming with life.',
  },
  {
    Icon: FiFeather,
    title: 'Rich Cultural Heritage',
    text: 'From the Masai warriors to the ancient kingdoms of Uganda, cultures as diverse as the landscapes.',
  },
  {
    Icon: FiBookOpen,
    title: 'Stories That Last Forever',
    text: "These aren't vacations — they're life-changing experiences. Memories that define who you are.",
  },
];

/* ═══════════════════════════════════════════════════════════
   CSS — Complete Stylesheet
═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --ex-green: #059669;
  --ex-green-lt: #10b981;
  --ex-green-dk: #047857;
  --ex-forest: #022c22;
  --ex-mint: #ecfdf5;
  --ex-gold: #f59e0b;
  --ex-text: #0f172a;
  --ex-text-2: #475569;
  --ex-text-3: #94a3b8;
  --ex-border: #e2e8f0;
  --ex-surface: #ffffff;
  --ex-bg: #f8fafb;
  --ex-radius: 22px;
  --ex-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes ex-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ex-scale-in {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ex-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes ex-spin {
  to { transform: rotate(360deg); }
}
@keyframes ex-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ex-slide-in {
  from { opacity: 0; transform: translateX(60px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ex-pulse {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.6; }
}

/* ═══════ PAGE ═══════ */
.ex-page {
  background: var(--ex-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* ═══════ SECTIONS ═══════ */
.ex-section {
  padding: clamp(52px,7vw,96px) clamp(16px,5vw,56px);
}
.ex-section--alt { background: var(--ex-surface); }
.ex-section--mint { background: var(--ex-mint); }
.ex-section--forest {
  background: linear-gradient(135deg, #022c22, #064e3b 55%, #022c22);
}
.ex-inner { max-width: 1400px; margin: 0 auto; }

.ex-section-head {
  text-align: center;
  max-width: 780px;
  margin: 0 auto clamp(32px, 4.5vw, 56px);
}
.ex-section-head--left {
  text-align: left;
  max-width: none;
  margin-left: 0;
  margin-right: 0;
}
.ex-section-label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px; border-radius: 999px;
  background: var(--ex-mint); color: var(--ex-green-dk);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  border: 1px solid #a7f3d0;
  margin-bottom: 16px;
}
.ex-section-label--light {
  background: rgba(16,185,129,0.15);
  color: #a7f3d0;
  border-color: rgba(16,185,129,0.25);
}
.ex-section-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px, 4.5vw, 52px);
  font-weight: 400; line-height: 1.12;
  color: var(--ex-text); margin: 0 0 16px;
  letter-spacing: -0.025em;
}
.ex-section-title--light { color: #fff; }
.ex-section-desc {
  color: var(--ex-text-2);
  font-size: clamp(14px, 1.4vw, 17px);
  line-height: 1.78;
  max-width: 640px;
  margin: 0 auto;
}
.ex-section-desc--left { margin: 0; }
.ex-section-desc--light { color: rgba(255,255,255,0.72); }

/* ═══════ EDITORIAL INTRO ═══════ */
.ex-editorial {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}
.ex-editorial__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px, 4.5vw, 46px);
  font-weight: 400; line-height: 1.18;
  color: var(--ex-text);
  margin: 0 0 clamp(16px, 2vw, 24px);
  letter-spacing: -0.02em;
}
.ex-editorial__text {
  font-size: clamp(15px, 1.3vw, 17px);
  color: var(--ex-text-2);
  line-height: 1.82;
  margin: 0 0 14px;
}

/* ═══════ SHOWCASE GRID ═══════ */
.ex-showcase {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(14px, 2vw, 22px);
}
.ex-showcase__full {
  grid-column: 1 / -1;
}

/* ── Showcase Card (Destinations / Countries) ── */
.ex-showcard {
  position: relative;
  border-radius: var(--ex-radius);
  overflow: hidden;
  background: var(--ex-forest);
  cursor: pointer;
  text-decoration: none; color: #fff;
  display: block;
  min-height: 440px;
  transition: all 0.5s var(--ex-ease);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.ex-showcard:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 56px rgba(5,150,105,0.18), 0 8px 24px rgba(0,0,0,0.1);
}
.ex-showcard__img-wrap {
  position: absolute; inset: 0;
  overflow: hidden;
}
.ex-showcard__img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  transition: transform 8s cubic-bezier(0.25,0,0.15,1), opacity 1s ease;
}
.ex-showcard:hover .ex-showcard__img {
  transform: scale(1.06);
}
.ex-showcard__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(2,44,34,0.25) 0%,
    rgba(2,44,34,0.12) 35%,
    rgba(2,44,34,0.65) 100%
  );
  z-index: 1;
}
.ex-showcard__content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding: clamp(24px, 3.5vw, 40px);
}
.ex-showcard__eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.35);
  backdrop-filter: blur(10px);
  color: #a7f3d0;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  width: fit-content;
  margin-bottom: 16px;
}
.ex-showcard__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(26px, 3.8vw, 42px);
  font-weight: 400; line-height: 1.12;
  color: #fff; margin: 0 0 12px;
  letter-spacing: -0.02em;
}
.ex-showcard__desc {
  font-size: clamp(14px, 1.2vw, 16px);
  color: rgba(255,255,255,0.78);
  line-height: 1.72;
  max-width: 480px;
  margin: 0 0 22px;
}
.ex-showcard__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 28px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 700; font-size: 14px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 6px 24px rgba(16,185,129,0.35);
  transition: all 0.3s var(--ex-ease);
  text-decoration: none;
  width: fit-content;
}
.ex-showcard__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,0.5);
}

/* ── Slideshow inside showcase ── */
.ex-showcard__slide-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: opacity 1.2s ease, transform 7s ease;
}
.ex-showcard__slide-img--hidden {
  opacity: 0; transform: scale(1.04);
}
.ex-showcard__slide-img--visible {
  opacity: 1; transform: scale(1);
}
.ex-showcard:hover .ex-showcard__slide-img--visible {
  transform: scale(1.06);
}
.ex-showcard__dots {
  display: flex; gap: 6px;
  position: absolute; bottom: 20px; right: clamp(24px, 3.5vw, 40px);
  z-index: 3;
}
.ex-showcard__dot {
  width: 8px; height: 8px; border-radius: 4px;
  border: none; padding: 0; cursor: pointer;
  background: rgba(255,255,255,0.35);
  transition: all 0.4s var(--ex-ease);
}
.ex-showcard__dot--active {
  width: 24px;
  background: #fff;
  box-shadow: 0 0 8px rgba(255,255,255,0.4);
}
.ex-showcard__nav {
  position: absolute; top: 50%; z-index: 3;
  transform: translateY(-50%);
  width: 38px; height: 38px; border-radius: 50%;
  border: none; cursor: pointer;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  color: #fff; display: grid; place-items: center;
  opacity: 0; transition: all 0.3s ease;
}
.ex-showcard:hover .ex-showcard__nav { opacity: 1; }
.ex-showcard__nav:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-50%) scale(1.08);
}
.ex-showcard__nav--prev { left: 14px; }
.ex-showcard__nav--next { right: 14px; }

/* ── Mini country chips inside showcase ── */
.ex-showcard__country-list {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 20px;
}
.ex-showcard__country-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.88);
  font-size: 12px; font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  white-space: nowrap;
}
.ex-showcard__country-chip:hover {
  background: rgba(255,255,255,0.22);
  border-color: rgba(16,185,129,0.4);
  color: #fff;
  transform: translateY(-1px);
}

/* ── Video Card ── */
.ex-videocard {
  position: relative;
  border-radius: var(--ex-radius);
  overflow: hidden;
  background: #000;
  min-height: 440px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.ex-videocard__iframe {
  position: absolute;
  top: 50%; left: 50%;
  width: 180%; height: 180%;
  transform: translate(-50%, -50%);
  border: none;
  pointer-events: none;
}
.ex-videocard__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(2,44,34,0.35) 0%,
    rgba(2,44,34,0.08) 40%,
    rgba(2,44,34,0.55) 100%
  );
  z-index: 1;
  pointer-events: none;
}
.ex-videocard__content {
  position: absolute; bottom: 0; left: 0; right: 0;
  z-index: 2; padding: clamp(24px, 3.5vw, 40px);
  pointer-events: none;
}
.ex-videocard__badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(239,68,68,0.85);
  backdrop-filter: blur(8px);
  color: #fff; font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  margin-bottom: 14px;
  width: fit-content;
}
.ex-videocard__badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #fff;
  animation: ex-pulse 1.5s ease infinite;
}
.ex-videocard__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(22px, 3vw, 36px);
  font-weight: 400; color: #fff;
  margin: 0 0 8px; line-height: 1.2;
}
.ex-videocard__desc {
  font-size: clamp(13px, 1.1vw, 15px);
  color: rgba(255,255,255,0.72);
  line-height: 1.65;
  max-width: 400px; margin: 0;
}

/* ═══════ WHY SECTION ═══════ */
.ex-why {
  display: flex;
  gap: clamp(28px, 5vw, 56px);
  align-items: stretch;
}
.ex-why__left {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
}
.ex-why__right {
  flex: 1; min-width: 0;
}
.ex-why__items {
  display: flex; flex-direction: column;
  gap: clamp(14px, 2vw, 20px);
  margin-top: clamp(20px, 3vw, 32px);
}
.ex-why__item {
  display: flex; gap: 16px; align-items: flex-start;
}
.ex-why__item-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: var(--ex-surface);
  border: 1.5px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--ex-green-dk);
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.ex-why__item:hover .ex-why__item-icon {
  background: var(--ex-green);
  color: #fff;
  border-color: var(--ex-green);
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(5,150,105,0.3);
}
.ex-why__item-title {
  font-weight: 700; font-size: 16px;
  color: var(--ex-text); margin: 0 0 4px;
}
.ex-why__item-text {
  font-size: 14px; color: var(--ex-text-2);
  line-height: 1.72; margin: 0;
}
.ex-why__image-card {
  position: relative;
  border-radius: var(--ex-radius);
  overflow: hidden;
  height: 100%; min-height: 480px;
  background: var(--ex-forest);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}
.ex-why__image-card img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: opacity 1.2s ease, transform 7s ease;
}
.ex-why__image-card img.ex-hidden { opacity: 0; transform: scale(1.04); }
.ex-why__image-card img.ex-visible { opacity: 1; transform: scale(1); }

/* ═══════ DESTINATION GRID ═══════ */
.ex-dest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: clamp(14px, 2vw, 22px);
}
.ex-dest-grid__card {
  animation: ex-fade-up 0.5s var(--ex-ease) both;
}
.ex-dest-cta {
  text-align: center;
  margin-top: clamp(36px, 4.5vw, 56px);
}

/* ═══════ TESTIMONIALS SLIDER ═══════ */
.ex-testi {
  position: relative;
  overflow: hidden;
}
.ex-testi__viewport {
  overflow: hidden;
}
.ex-testi__track {
  display: flex;
  transition: transform 0.7s var(--ex-ease);
}
.ex-testi__slide {
  flex: 0 0 100%;
  min-width: 0;
  padding: 0 clamp(8px, 2vw, 20px);
  box-sizing: border-box;
}
.ex-testi__card {
  background: var(--ex-surface);
  border-radius: var(--ex-radius);
  padding: clamp(28px, 4vw, 44px);
  border: 1.5px solid var(--ex-border);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  display: flex;
  gap: clamp(24px, 4vw, 48px);
  align-items: center;
  max-width: 960px;
  margin: 0 auto;
  transition: all 0.4s var(--ex-ease);
  position: relative;
  overflow: hidden;
}
.ex-testi__card::before {
  content: '';
  position: absolute;
  top: -40px; right: -20px;
  font-size: 160px;
  font-family: 'DM Serif Display', Georgia, serif;
  color: rgba(5,150,105,0.04);
  pointer-events: none;
  line-height: 1;
}
.ex-testi__card:hover {
  border-color: rgba(5,150,105,0.2);
  box-shadow: 0 16px 48px rgba(5,150,105,0.1);
  transform: translateY(-4px);
}
.ex-testi__avatar-wrap {
  flex-shrink: 0;
  width: clamp(80px, 12vw, 120px);
  height: clamp(80px, 12vw, 120px);
  border-radius: 20px;
  overflow: hidden;
  border: 3px solid #a7f3d0;
  box-shadow: 0 6px 24px rgba(5,150,105,0.12);
}
.ex-testi__avatar {
  width: 100%; height: 100%;
  object-fit: cover;
}
.ex-testi__body { flex: 1; min-width: 0; }
.ex-testi__stars {
  display: flex; gap: 3px;
  margin-bottom: 14px;
}
.ex-testi__quote {
  position: relative;
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(16px, 1.8vw, 20px);
  font-weight: 400; font-style: italic;
  color: var(--ex-text);
  line-height: 1.72;
  margin: 0 0 20px;
}
.ex-testi__quote::before {
  content: '"'; color: var(--ex-green-lt);
  font-size: 2em; line-height: 0;
  vertical-align: -0.2em; margin-right: 4px;
}
.ex-testi__quote::after {
  content: '"'; color: var(--ex-green-lt);
  font-size: 2em; line-height: 0;
  vertical-align: -0.2em; margin-left: 2px;
}
.ex-testi__meta {
  display: flex; align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--ex-border);
}
.ex-testi__author {
  display: flex; flex-direction: column;
}
.ex-testi__name {
  font-weight: 700; font-size: 15px;
  color: var(--ex-text);
}
.ex-testi__location {
  font-size: 13px; color: var(--ex-text-3);
  display: flex; align-items: center; gap: 4px;
}
.ex-testi__trip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 999px;
  background: var(--ex-mint);
  border: 1px solid #a7f3d0;
  font-size: 12px; font-weight: 600;
  color: var(--ex-green-dk);
}

/* Arrows */
.ex-testi__arrows {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}
.ex-testi__arrow {
  width: 48px; height: 48px; border-radius: 50%;
  border: 1.5px solid var(--ex-border);
  background: var(--ex-surface);
  display: grid; place-items: center;
  color: var(--ex-text);
  cursor: pointer;
  transition: all 0.3s var(--ex-ease);
}
.ex-testi__arrow:hover {
  background: var(--ex-green);
  border-color: var(--ex-green);
  color: #fff;
  box-shadow: 0 6px 20px rgba(5,150,105,0.3);
  transform: scale(1.08);
}
.ex-testi__arrow:disabled {
  opacity: 0.3; pointer-events: none;
}
.ex-testi__dots {
  display: flex; justify-content: center;
  gap: 8px; margin-top: 18px;
}
.ex-testi__dot {
  width: 8px; height: 8px; border-radius: 4px;
  border: none; padding: 0; cursor: pointer;
  background: var(--ex-border);
  transition: all 0.35s var(--ex-ease);
}
.ex-testi__dot--active {
  width: 28px; background: var(--ex-green);
}

/* Skeleton for testimonials */
.ex-testi__skeleton {
  display: flex; gap: 32px; align-items: center;
  max-width: 960px; margin: 0 auto;
  padding: 40px;
  background: var(--ex-surface);
  border-radius: var(--ex-radius);
  border: 1px solid var(--ex-border);
}
.ex-skel {
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 40%, #f1f5f9 80%);
  background-size: 200%; border-radius: 10px;
  animation: ex-shimmer 1.6s ease infinite;
}

/* ═══════ TRUST BADGES ═══════ */
.ex-trust-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: clamp(12px, 2vw, 20px);
}
.ex-trust-card {
  display: flex; align-items: flex-start; gap: 16px;
  padding: clamp(20px, 2.5vw, 28px);
  border-radius: 18px;
  background: var(--ex-surface);
  border: 1.5px solid var(--ex-border);
  transition: all 0.35s var(--ex-ease);
}
.ex-trust-card:hover {
  border-color: rgba(5,150,105,0.25);
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(5,150,105,0.08);
}
.ex-trust-card__icon {
  width: 52px; height: 52px;
  border-radius: 16px;
  background: var(--ex-mint);
  border: 1px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--ex-green-dk);
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.ex-trust-card:hover .ex-trust-card__icon {
  background: var(--ex-green);
  color: #fff;
  border-color: var(--ex-green);
}
.ex-trust-card__title {
  font-weight: 700; font-size: 15px;
  color: var(--ex-text);
  margin: 0 0 5px;
}
.ex-trust-card__desc {
  font-size: 13px; color: var(--ex-text-2);
  line-height: 1.68; margin: 0;
}

/* ═══════ CTA SECTION ═══════ */
.ex-cta {
  text-align: center;
  padding: clamp(48px, 8vw, 88px) clamp(20px, 5vw, 60px);
  background: linear-gradient(160deg, #0f172a 0%, #022c22 40%, #064e3b 100%);
  background-size: 200% 200%;
  animation: ex-gradient-shift 12s ease infinite;
  position: relative; overflow: hidden;
}
.ex-cta::before, .ex-cta::after {
  content: ''; position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.ex-cta::before {
  top: 10%; left: 5%; width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
}
.ex-cta::after {
  bottom: 5%; right: 8%; width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%);
}
.ex-cta > * { position: relative; z-index: 1; }
.ex-cta__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(34px, 6vw, 60px);
  font-weight: 400; color: #fff;
  line-height: 1.12; margin: 0 0 20px;
  letter-spacing: -0.02em;
}
.ex-cta__desc {
  font-size: clamp(15px, 1.4vw, 18px);
  color: rgba(255,255,255,0.7);
  line-height: 1.78;
  max-width: 600px;
  margin: 0 auto 40px;
}
.ex-cta__buttons {
  display: flex; gap: 16px;
  justify-content: center; flex-wrap: wrap;
}
.ex-cta__btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 40px; border-radius: 16px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 800; font-size: 16px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 10px 36px rgba(16,185,129,0.4);
  transition: all 0.35s var(--ex-ease);
  text-decoration: none;
}
.ex-cta__btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 44px rgba(16,185,129,0.55);
}
.ex-cta__btn-secondary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 36px; border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  color: #fff; font-weight: 700; font-size: 16px;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s ease;
  text-decoration: none;
}
.ex-cta__btn-secondary:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.45);
  transform: translateY(-2px);
}

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 1024px) {
  .ex-why { flex-direction: column; }
  .ex-testi__card { flex-direction: column; text-align: center; }
  .ex-testi__meta { justify-content: center; }
}
@media (max-width: 768px) {
  .ex-showcase { grid-template-columns: 1fr; }
  .ex-dest-grid { grid-template-columns: repeat(2, 1fr); }
  .ex-testi__slide { padding: 0 8px; }
  .ex-testi__card { padding: 24px; }
  .ex-testi__avatar-wrap { width: 72px; height: 72px; }
}
@media (max-width: 540px) {
  .ex-dest-grid { grid-template-columns: 1fr; }
  .ex-showcard { min-height: 360px; }
  .ex-videocard { min-height: 320px; }
  .ex-why__image-card { min-height: 360px; }
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
  if (document.getElementById('ex-styles')) return;
  const s = document.createElement('style');
  s.id = 'ex-styles';
  s.textContent = PAGE_CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   DESTINATION IMAGES for showcase
═══════════════════════════════════════════════════════════ */
const DEST_SHOWCASE_IMAGES = [
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=85',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=85',
  'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1200&q=85',
  'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&q=85',
];

const COUNTRY_SHOWCASE_IMAGES = [
  'https://images.unsplash.com/photo-1580746738015-4a94e67a0e8b?w=1200&q=85',
  'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=85',
  'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200&q=85',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85',
];

const WHY_SLIDESHOW_IMAGES = [
  'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1200&q=85',
  'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&q=85',
  'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200&q=85',
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=85',
];

/* ═══════════════════════════════════════════════════════════
   SHOWCASE: DESTINATIONS CARD (all destinations)
═══════════════════════════════════════════════════════════ */
function DestinationsShowcaseCard() {
  const { idx, goNext, goPrev, goTo } = useSlideshow(DEST_SHOWCASE_IMAGES.length, 5500);

  return (
    <Link to="/destinations" className="ex-showcard" style={{ textDecoration: 'none' }}>
      <div className="ex-showcard__img-wrap">
        {DEST_SHOWCASE_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            className={`ex-showcard__slide-img ${i === idx ? 'ex-showcard__slide-img--visible' : 'ex-showcard__slide-img--hidden'}`}
          />
        ))}
      </div>
      <div className="ex-showcard__overlay" />

      <button className="ex-showcard__nav ex-showcard__nav--prev" onClick={e => { e.preventDefault(); e.stopPropagation(); goPrev(); }}>
        <FiChevronLeft size={16} />
      </button>
      <button className="ex-showcard__nav ex-showcard__nav--next" onClick={e => { e.preventDefault(); e.stopPropagation(); goNext(); }}>
        <FiChevronRight size={16} />
      </button>

      <div className="ex-showcard__dots">
        {DEST_SHOWCASE_IMAGES.map((_, i) => (
          <button key={i} className={`ex-showcard__dot ${i === idx ? 'ex-showcard__dot--active' : ''}`}
            onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(i); }} />
        ))}
      </div>

      <div className="ex-showcard__content">
        <div className="ex-showcard__eyebrow">
          <FiCompass size={11} /> All Destinations
        </div>
        <h3 className="ex-showcard__title">
          Extraordinary Places<br />Waiting for You
        </h3>
        <p className="ex-showcard__desc">
          From the thundering Serengeti plains to the misty gorilla forests of Rwanda — discover every
          handpicked destination in our collection.
        </p>
        <span className="ex-showcard__btn">
          Explore All Destinations <FiArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHOWCASE: COUNTRIES CARD
═══════════════════════════════════════════════════════════ */
function CountriesShowcaseCard({ countries }) {
  const { idx, goNext, goPrev, goTo } = useSlideshow(COUNTRY_SHOWCASE_IMAGES.length, 6000);
  const displayCountries = (countries || []).slice(0, 6);

  return (
    <Link to="/destinations" className="ex-showcard" style={{ textDecoration: 'none' }}>
      <div className="ex-showcard__img-wrap">
        {COUNTRY_SHOWCASE_IMAGES.map((src, i) => (
          <img key={src} src={src} alt="" loading="lazy" draggable={false}
            className={`ex-showcard__slide-img ${i === idx ? 'ex-showcard__slide-img--visible' : 'ex-showcard__slide-img--hidden'}`} />
        ))}
      </div>
      <div className="ex-showcard__overlay" />

      <button className="ex-showcard__nav ex-showcard__nav--prev" onClick={e => { e.preventDefault(); e.stopPropagation(); goPrev(); }}>
        <FiChevronLeft size={16} />
      </button>
      <button className="ex-showcard__nav ex-showcard__nav--next" onClick={e => { e.preventDefault(); e.stopPropagation(); goNext(); }}>
        <FiChevronRight size={16} />
      </button>

      <div className="ex-showcard__dots">
        {COUNTRY_SHOWCASE_IMAGES.map((_, i) => (
          <button key={i} className={`ex-showcard__dot ${i === idx ? 'ex-showcard__dot--active' : ''}`}
            onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(i); }} />
        ))}
      </div>

      <div className="ex-showcard__content">
        <div className="ex-showcard__eyebrow">
          <FiGlobe size={11} /> Countries
        </div>

        {displayCountries.length > 0 && (
          <div className="ex-showcard__country-list">
            {displayCountries.map(c => {
              const flag = getFlag(c);
              return (
                <span key={c.id || c.name} className="ex-showcard__country-chip">
                  {isFlagEmoji(flag) ? <span>{flag}</span> : <FiGlobe size={12} />}
                  {c.name}
                </span>
              );
            })}
          </div>
        )}

        <h3 className="ex-showcard__title">
          Explore by Country
        </h3>
        <p className="ex-showcard__desc">
          Each country holds its own story — volcanic peaks, golden savannahs,
          turquoise coastlines and ancient cultures waiting to be discovered.
        </p>
        <span className="ex-showcard__btn">
          Browse Countries <FiArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHOWCASE: VIDEO CARD (East Africa beauty)
═══════════════════════════════════════════════════════════ */
function VideoShowcaseCard({
  videoId = 'X3MHIq09mnY',
  title = 'Wonders of East Africa',
  description = 'Immerse yourself in the breathtaking beauty of East Africa — from sweeping savannahs to volcanic highlands, captured in stunning cinematic 4K.',
  badge = 'Cinematic Experience',
}) {
  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0`;

  return (
    <div className="ex-videocard">
      <iframe
        className="ex-videocard__iframe"
        src={embedSrc}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="eager"
        allowFullScreen
      />
      <div className="ex-videocard__overlay" />
      <div className="ex-videocard__content">
        <div className="ex-videocard__badge">
          <span className="ex-videocard__badge-dot" />
          {badge}
        </div>
        <h3 className="ex-videocard__title">
          {title}
        </h3>
        <p className="ex-videocard__desc">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WHY IMAGE SLIDESHOW
═══════════════════════════════════════════════════════════ */
function WhyImageSlideshow() {
  const { idx } = useSlideshow(WHY_SLIDESHOW_IMAGES.length, 5000);

  return (
    <div className="ex-why__image-card">
      {WHY_SLIDESHOW_IMAGES.map((src, i) => (
        <img key={src} src={src} alt="" loading="lazy" draggable={false}
          className={i === idx ? 'ex-visible' : 'ex-hidden'} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS SLIDER
═══════════════════════════════════════════════════════════ */
function TestimonialsSlider() {
  const { testimonials, loading, error } = useFeaturedTestimonials(12);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const total = testimonials.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(
      () => setIdx(p => (p + 1) % total),
      6000,
    );
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = useCallback((i) => {
    setIdx(i);
    startTimer();
  }, [startTimer]);

  const goPrev = useCallback(() => {
    setIdx(p => (p - 1 + total) % total);
    startTimer();
  }, [total, startTimer]);

  const goNext = useCallback(() => {
    setIdx(p => (p + 1) % total);
    startTimer();
  }, [total, startTimer]);

  if (loading) {
    return (
      <div className="ex-testi__skeleton">
        <div className="ex-skel" style={{ width: 100, height: 100, borderRadius: 20, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ex-skel" style={{ height: 14, width: '40%' }} />
          <div className="ex-skel" style={{ height: 18, width: '100%' }} />
          <div className="ex-skel" style={{ height: 18, width: '85%' }} />
          <div className="ex-skel" style={{ height: 18, width: '60%' }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div className="ex-skel" style={{ height: 14, width: 100 }} />
            <div className="ex-skel" style={{ height: 14, width: 80 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !total) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <FiUsers size={40} style={{ opacity: 0.4, marginBottom: 14 }} />
        <p style={{ margin: 0, fontSize: 15 }}>
          {error ? 'Could not load testimonials' : 'No testimonials yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="ex-testi">
      <div className="ex-testi__viewport">
        <div
          className="ex-testi__track"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {testimonials.map((t) => (
            <div key={t.id} className="ex-testi__slide">
              <div className="ex-testi__card">
                {/* Avatar */}
                {t.avatar_url && (
                  <div className="ex-testi__avatar-wrap">
                    <img
                      className="ex-testi__avatar"
                      src={t.avatar_url}
                      alt={t.name}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Body */}
                <div className="ex-testi__body">
                  <div className="ex-testi__stars">
                    {renderStars(t.rating)}
                  </div>

                  <p className="ex-testi__quote">
                    {t.testimonial_text || t.text}
                  </p>

                  <div className="ex-testi__meta">
                    <div className="ex-testi__author">
                      <span className="ex-testi__name">{t.name}</span>
                      {t.location && (
                        <span className="ex-testi__location">
                          <FiMapPin size={11} />
                          {t.location}
                        </span>
                      )}
                    </div>

                    {t.trip && (
                      <span className="ex-testi__trip">
                        <FiCompass size={11} />
                        {t.trip}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="ex-testi__arrows">
        <button className="ex-testi__arrow" onClick={goPrev} aria-label="Previous testimonial">
          <FiChevronLeft size={20} />
        </button>
        <button className="ex-testi__arrow" onClick={goNext} aria-label="Next testimonial">
          <FiChevronRight size={20} />
        </button>
      </div>

      {total > 1 && (
        <div className="ex-testi__dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`ex-testi__dot ${i === idx ? 'ex-testi__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRUST DATA
═══════════════════════════════════════════════════════════ */
const TRUST_ITEMS = [
  {
    Icon: FiShield,
    title: '100% Financial Protection',
    desc: 'Your payments are fully secured and insured. Book with absolute confidence.',
  },
  {
    Icon: FiCalendar,
    title: 'Flexible Cancellation',
    desc: 'Plans change — cancel up to 30 days before departure for a full refund.',
  },
  {
    Icon: FiPhone,
    title: '24/7 Expert Support',
    desc: 'Our travel specialists are always available, wherever you are in the world.',
  },
  {
    Icon: FiAward,
    title: 'Award-Winning Company',
    desc: 'Recognized by leading publications for excellence in African travel.',
  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function Explore() {
  const navigate = useNavigate();
  const { countries = [], loading: countriesLoading } = useCountries({ limit: 12 });
  const { data: destinations, loading: destsLoading } = useAllDestinations(10);

  useEffect(() => { injectCSS(); }, []);

  return (
    <>
      <SEO
        title="Explore Experiences"
        description="Explore curated travel experiences across East Africa. From safari adventures to mountain climbing and cultural immersion."
        keywords={['travel experiences', 'safari adventures', 'East Africa tours']}
        url="/explore"
        type="website"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Explore', url: '/explore' },
        ]}
      />

      <PageHeader
        title="Explore East Africa"
        subtitle="Discover the world's most extraordinary wildlife, landscapes, and cultures in a region where every horizon tells a different story."
        backgroundImage="https://res.cloudinary.com/doijjawna/image/upload/v1772201526/Gemini_Generated_Image_xd99sdxd99sdxd99_ermxfz.png"
        breadcrumbs={[{ label: 'Explore', path: '/explore' }]}
      />

      <div className="ex-page">

        {/* ════════ 1. EDITORIAL INTRO ════════ */}
        <section className="ex-section ex-section--alt">
          <div className="ex-inner">
            <AnimatedSection animation="fadeInUp">
              <div className="ex-editorial">
                <h2 className="ex-editorial__title">
                  Where the Wild Heart of Africa Beats Loudest
                </h2>
                <p className="ex-editorial__text">
                  East Africa is a land of superlatives — home to the world's greatest
                  wildlife migration, Africa's tallest mountain, the planet's second-deepest
                  lake, and some of the last remaining mountain gorillas on earth. From the
                  sun-scorched plains of the Serengeti to the misty peaks of the Virunga
                  volcanoes, every corner pulses with life, colour, and ancient stories
                  waiting to be discovered.
                </p>
                <p className="ex-editorial__text" style={{ marginBottom: 0 }}>
                  For over a decade, we have been crafting journeys that go beyond ordinary
                  tourism. We connect travellers with local communities, support conservation
                  efforts, and design experiences that leave both visitors and destinations
                  better for the encounter.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ════════ 2. SHOWCASE: Destinations · Countries · Video ════════ */}
        <section className="ex-section">
          <div className="ex-inner">
            <AnimatedSection animation="fadeInUp">
              <div className="ex-section-head">
                <div className="ex-section-label">
                  <FiEye size={11} /> Discover
                </div>
                <h2 className="ex-section-title">
                  Places That Take Your Breath Away
                </h2>
                <p className="ex-section-desc">
                  Explore our most beloved destinations, countries and cinematic experiences —
                  each one delivering moments you will remember forever.
                </p>
              </div>
            </AnimatedSection>

            <div className="ex-showcase">
              <AnimatedSection animation="fadeInUp" delay={0}>
                <DestinationsShowcaseCard />
              </AnimatedSection>

              <AnimatedSection animation="fadeInUp" delay={0.12}>
                <CountriesShowcaseCard countries={countries} />
              </AnimatedSection>

              <AnimatedSection animation="fadeInUp" delay={0.2}>
                <div className="ex-showcase__full">
                  <VideoShowcaseCard />
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fadeInUp" delay={0.28}>
                <div className="ex-showcase__full">
                  <VideoShowcaseCard
                    videoId="CxqcJ-5IMTk"
                    title="Wildlife Adventures in Kenya"
                    description="Step into the raw, untamed beauty of Kenya’s wild landscapes — where dramatic predator encounters, sweeping plains, and unforgettable safari moments come alive in motion."
                    badge="Wildlife Adventure"
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ════════ 3. WHY EAST AFRICA ════════ */}
        <section className="ex-section ex-section--mint">
          <div className="ex-inner">
            <div className="ex-why">
              <div className="ex-why__left">
                <AnimatedSection animation="fadeInUp">
                  <div className="ex-section-head ex-section-head--left" style={{ marginBottom: 0 }}>
                    <div className="ex-section-label">
                      <FiTarget size={11} /> Why East Africa
                    </div>
                    <h2 className="ex-section-title">
                      A Region Like No Other
                    </h2>
                    <p className="ex-section-desc ex-section-desc--left">
                      East Africa offers something no other destination can — an
                      unfiltered connection with nature at its most raw and magnificent.
                    </p>
                  </div>

                  <div className="ex-why__items">
                    {WHY_ITEMS.map((item, i) => (
                      <div key={i} className="ex-why__item">
                        <div className="ex-why__item-icon">
                          <item.Icon size={22} />
                        </div>
                        <div>
                          <h4 className="ex-why__item-title">{item.title}</h4>
                          <p className="ex-why__item-text">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
              </div>

              <div className="ex-why__right">
                <AnimatedSection animation="fadeInUp" delay={0.15}>
                  <WhyImageSlideshow />
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ 4. DESTINATION CARDS GRID (first 10) ════════ */}
        <section className="ex-section">
          <div className="ex-inner">
            <AnimatedSection animation="fadeInUp">
              <div className="ex-section-head">
                <div className="ex-section-label">
                  <FiCompass size={11} /> Featured Destinations
                </div>
                <h2 className="ex-section-title">
                  Unforgettable Adventures Await
                </h2>
                <p className="ex-section-desc">
                  Hand-picked experiences that showcase the very best of East Africa —
                  from heart-pounding safaris and gorilla encounters to tropical retreats.
                </p>
              </div>
            </AnimatedSection>

            {destsLoading ? (
              <div className="ex-dest-grid">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="ex-dest-grid__card" style={{ animationDelay: `${i * 0.06}s` }}>
                    <DestinationCardSkeleton />
                  </div>
                ))}
              </div>
            ) : destinations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                <FiGlobe size={44} style={{ opacity: 0.35, marginBottom: 14 }} />
                <p>No destinations found. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="ex-dest-grid">
                  {destinations.map((dest, i) => (
                    <div key={dest.id} className="ex-dest-grid__card" style={{ animationDelay: `${Math.min(i, 5) * 0.06}s` }}>
                      <DestinationCard destination={dest} priority={i < 4} />
                    </div>
                  ))}
                </div>

                <div className="ex-dest-cta">
                  <Link to="/destinations" className="ex-cta__btn-primary" style={{ display: 'inline-flex' }}>
                    <FiGlobe size={16} />
                    View All Destinations
                    <FiArrowRight size={15} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ════════ 5. TESTIMONIALS ════════ */}
        <section className="ex-section ex-section--alt">
          <div className="ex-inner">
            <AnimatedSection animation="fadeInUp">
              <div className="ex-section-head">
                <div className="ex-section-label">
                  <FiHeart size={11} /> Traveller Stories
                </div>
                <h2 className="ex-section-title">
                  Voices of Our Community
                </h2>
                <p className="ex-section-desc">
                  Real stories from real travellers who experienced the magic of
                  East Africa with us — and came back transformed.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeInUp" delay={0.1}>
              <TestimonialsSlider />
            </AnimatedSection>
          </div>
        </section>

        {/* ════════ 6. TRUST BADGES ════════ */}
        <section className="ex-section">
          <div className="ex-inner">
            <AnimatedSection animation="fadeInUp">
              <div className="ex-section-head">
                <div className="ex-section-label">
                  <FiShield size={11} /> Your Confidence
                </div>
                <h2 className="ex-section-title">
                  Travel With Complete Confidence
                </h2>
                <p className="ex-section-desc">
                  Your safety, satisfaction, and peace of mind are our top priorities
                  from first enquiry to final farewell.
                </p>
              </div>
            </AnimatedSection>

            <div className="ex-trust-grid">
              {TRUST_ITEMS.map((item, i) => (
                <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.08}>
                  <div className="ex-trust-card">
                    <div className="ex-trust-card__icon">
                      <item.Icon size={24} />
                    </div>
                    <div>
                      <h4 className="ex-trust-card__title">{item.title}</h4>
                      <p className="ex-trust-card__desc">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ 7. NEWSLETTER ════════ */}
        <section className="ex-section ex-section--mint">
          <div className="ex-inner">
            <AnimatedSection animation="fadeInUp">
              <SubscriptionForm
                theme="dark"
                title="Get Exclusive Travel Inspiration"
                description="Join adventurers receiving hand-picked destination stories, insider tips, and members-only offers every week."
                sectionLabel="Stay Inspired"
                icon={<FiMail size={14} />}
              />
            </AnimatedSection>
          </div>
        </section>

        {/* ════════ 8. FINAL CTA ════════ */}
        <section className="ex-cta">
          <AnimatedSection animation="scaleIn">
            <h2 className="ex-cta__title">
              Your East African<br />
              Adventure Starts Here
            </h2>
            <p className="ex-cta__desc">
              Whether you dream of golden savannas, misty mountains, or turquoise shores
              — our expert travel designers will craft a journey as unique as you are.
              No detail too small, no dream too big.
            </p>
            <div className="ex-cta__buttons">
              <Link to="/booking" className="ex-cta__btn-primary">
                <FiCalendar size={18} />
                Plan Your Trip
              </Link>
              <Link to="/contact" className="ex-cta__btn-secondary">
                <FiMail size={18} />
                Speak to an Expert
              </Link>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </>
  );
}