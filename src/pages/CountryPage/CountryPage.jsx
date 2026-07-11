// src/pages/CountryPage.jsx
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiArrowRight, FiArrowLeft, FiMapPin, FiCompass, FiClock,
  FiGlobe, FiCalendar, FiChevronLeft, FiChevronRight,
  FiShield, FiPhone, FiMail, FiBookOpen, FiSun, FiRefreshCw,
  FiWifiOff, FiInfo, FiAlertTriangle, FiFlag, FiTrendingUp,
  FiDroplet, FiCoffee, FiHeart, FiZap, FiCamera,
  FiChevronDown, FiChevronUp, FiPlus, FiMinus, FiX,
  FiExternalLink, FiUsers, FiSend,
} from "react-icons/fi";
import SEO from "@components/common/SEO";
import AnimatedSection from "@components/common/AnimatedSection";
import Loader from "@components/common/Loader";
import DestinationCard, {
  DestinationCardSkeleton,
} from "@components/common/DestinationCard";
import { useCountry, useCountryDestinations } from "../../hooks/useCountries";
import { getCountrySlug } from "../../utils/countrySlugMap";

/* ═══════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --cp-green: #059669;
  --cp-green-lt: #10b981;
  --cp-green-dk: #047857;
  --cp-forest: #022c22;
  --cp-mint: #ecfdf5;
  --cp-text: #0f172a;
  --cp-text2: #475569;
  --cp-text3: #94a3b8;
  --cp-border: #e2e8f0;
  --cp-surface: #ffffff;
  --cp-bg: #f8fafb;
  --cp-radius: 22px;
  --cp-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes cpFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cpFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes cpKenBurns {
  0%   { transform: scale(1); }
  100% { transform: scale(1.1); }
}
@keyframes cpProgress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes cpShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes cpGradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

*, *::before, *::after { box-sizing: border-box; }

.cp-page {
  background: var(--cp-bg);
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ═══════ SCROLL PROGRESS ═══════ */
.cp-scroll-bar {
  position: fixed; top: 0; left: 0; right: 0;
  height: 2px; z-index: 9999;
}
.cp-scroll-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  transition: width 80ms linear;
}

/* ═══════ HERO ═══════ */
.cp-hero {
  position: relative; overflow: hidden;
  background: var(--cp-forest);
  height: 100vh; height: 100dvh;
  min-height: 540px; max-height: 960px;
}
.cp-hero__slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
  will-change: opacity;
}
.cp-hero__slide--on { opacity: 1; z-index: 1; }
.cp-hero__slide img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.cp-hero__slide--on img {
  animation: cpKenBurns 14s ease-out forwards;
}
.cp-hero__no-img {
  position: absolute; inset: 0;
  background: linear-gradient(155deg, #0f172a, #064e3b);
  display: flex; align-items: center; justify-content: center;
}
.cp-hero::after {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(180deg,
    rgba(2,44,34,0.25) 0%,
    rgba(2,44,34,0.05) 30%,
    rgba(2,44,34,0.55) 78%,
    rgba(2,44,34,0.9) 100%
  );
  pointer-events: none;
}
.cp-hero::before {
  content: '';
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(90deg,
    rgba(2,44,34,0.55) 0%,
    transparent 50%
  );
  pointer-events: none;
}

/* Breadcrumb */
.cp-crumb {
  position: absolute; top: 0; left: 0; right: 0;
  z-index: 10; padding: 22px clamp(20px, 5vw, 60px);
}
.cp-crumb__list {
  display: flex; align-items: center;
  list-style: none; margin: 0; padding: 0;
}
.cp-crumb__list a {
  color: rgba(255,255,255,0.45);
  font-size: 13px; font-weight: 500;
  text-decoration: none; transition: color 0.2s;
}
.cp-crumb__list a:hover { color: rgba(255,255,255,0.9); }
.cp-crumb__sep {
  color: rgba(255,255,255,0.18);
  font-size: 12px; margin: 0 10px;
}
.cp-crumb__cur {
  color: rgba(255,255,255,0.8);
  font-size: 13px; font-weight: 600;
}

/* Hero content */
.cp-hero__body {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 0 clamp(24px, 6vw, 88px);
  padding-bottom: clamp(56px, 10vh, 110px);
}
.cp-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: clamp(12px, 2vw, 20px);
  opacity: 0; animation: cpFadeUp 0.9s var(--cp-ease) 0.05s forwards;
}
.cp-hero__eyebrow-line {
  height: 1.5px; border-radius: 1px;
  width: clamp(18px, 3.5vw, 44px);
}
.cp-hero__eyebrow-line--l {
  background: linear-gradient(90deg, transparent, rgba(16,185,129,0.8));
}
.cp-hero__eyebrow-line--r {
  background: linear-gradient(90deg, rgba(16,185,129,0.8), transparent);
}
.cp-hero__eyebrow-text {
  font-size: clamp(9px, 1vw, 12px);
  font-weight: 700; color: #10b981;
  letter-spacing: clamp(2px, 0.4vw, 4px);
  text-transform: uppercase;
}
.cp-hero__meta {
  display: flex; align-items: center; gap: 14px;
  flex-wrap: wrap; margin-bottom: 16px;
  opacity: 0; animation: cpFadeUp 0.9s var(--cp-ease) 0.15s forwards;
}
.cp-hero__meta-item {
  display: flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.5);
  font-size: 13px; font-weight: 500;
}
.cp-hero__meta-div {
  width: 1px; height: 14px;
  background: rgba(255,255,255,0.12);
}
.cp-hero__flag {
  width: 22px; height: 15px; border-radius: 3px;
  object-fit: cover;
  border: 1px solid rgba(255,255,255,0.15);
}
.cp-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(48px, 9vw, 110px);
  font-weight: 400; line-height: 0.96;
  color: #fff; margin: 0 0 16px;
  letter-spacing: -0.03em;
  opacity: 0; animation: cpFadeUp 0.9s var(--cp-ease) 0.2s forwards;
}
.cp-hero__tagline {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 20px);
  color: rgba(255,255,255,0.45);
  font-style: italic; margin: 0 0 28px;
  max-width: 500px;
  opacity: 0; animation: cpFadeUp 0.9s var(--cp-ease) 0.32s forwards;
}
.cp-hero__actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  opacity: 0; animation: cpFadeUp 0.9s var(--cp-ease) 0.45s forwards;
}

/* Hero dots */
.cp-hero__dots {
  position: absolute;
  bottom: clamp(20px, 3.5vh, 40px);
  right: clamp(24px, 5vw, 68px);
  z-index: 8; display: flex; gap: 7px;
}
.cp-hero__dot {
  width: 7px; height: 7px; border-radius: 4px;
  background: rgba(255,255,255,0.25);
  border: none; padding: 0; cursor: default;
  transition: all 0.5s var(--cp-ease);
}
.cp-hero__dot--on {
  width: 26px;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 0 8px rgba(255,255,255,0.3);
}
.cp-hero__prog {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; z-index: 8;
  background: rgba(255,255,255,0.06);
}
.cp-hero__prog-fill {
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  transform-origin: left;
}

/* ═══════ BUTTONS (shared) ═══════ */
.cp-btn {
  display: inline-flex; align-items: center; gap: 9px;
  font-family: inherit; font-weight: 700; font-size: 14px;
  border-radius: 14px; cursor: pointer; text-decoration: none;
  transition: all 0.32s var(--cp-ease);
  white-space: nowrap; line-height: 1;
}
.cp-btn--primary {
  padding: 14px 32px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 8px 28px rgba(16,185,129,0.35);
}
.cp-btn--primary:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 14px 38px rgba(16,185,129,0.5);
}
.cp-btn--ghost {
  padding: 14px 30px;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px); color: #fff;
}
.cp-btn--ghost:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.38);
  transform: translateY(-2px);
}
.cp-btn--outline {
  padding: 13px 28px;
  border: 1.5px solid var(--cp-border);
  background: var(--cp-surface);
  color: var(--cp-text);
}
.cp-btn--outline:hover {
  border-color: var(--cp-green); color: var(--cp-green);
  background: var(--cp-mint); transform: translateY(-2px);
  box-shadow: 0 4px 18px rgba(5,150,105,0.1);
}

/* ═══════ SECTIONS ═══════ */
.cp-sec {
  padding: clamp(40px, 5vw, 68px) clamp(16px, 5vw, 56px);
}
.cp-sec--white { background: var(--cp-surface); }
.cp-sec--bg    { background: var(--cp-bg); }
.cp-sec--mint  { background: var(--cp-mint); }
.cp-sec--dark  {
  background: linear-gradient(160deg, #0f172a 0%, #022c22 40%, #064e3b 100%);
  background-size: 200% 200%;
  animation: cpGradientShift 12s ease infinite;
  position: relative; overflow: hidden;
}
.cp-sec--dark::before {
  content: '';
  position: absolute; top: 8%; left: 4%;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.cp-sec--dark::after {
  content: '';
  position: absolute; bottom: 5%; right: 7%;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.cp-inner { max-width: 1400px; margin: 0 auto; }
.cp-inner--md { max-width: 1200px; margin: 0 auto; }

/* Section heads */
.cp-head {
  margin-bottom: clamp(22px, 3vw, 38px);
}
.cp-head--center { text-align: center; max-width: 720px; margin-left: auto; margin-right: auto; }
.cp-head--split {
  display: flex; justify-content: space-between;
  align-items: flex-end; flex-wrap: wrap; gap: 14px;
}
.cp-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(26px, 4vw, 48px);
  font-weight: 400; line-height: 1.12;
  color: var(--cp-text); margin: 0 0 12px;
  letter-spacing: -0.025em;
}
.cp-title--light { color: #fff; }
.cp-desc {
  color: var(--cp-text2);
  font-size: clamp(14px, 1.3vw, 16px);
  line-height: 1.78; margin: 0;
  max-width: 580px;
}
.cp-desc--center { margin-left: auto; margin-right: auto; }
.cp-desc--light { color: rgba(255,255,255,0.6); }

/* ═══════ ABOUT STRIP ═══════ */
.cp-about {
  background: var(--cp-surface);
  border-bottom: 1px solid var(--cp-border);
}
.cp-about__wrap {
  max-width: 1320px; margin: 0 auto;
  padding: clamp(28px, 3.5vw, 48px) clamp(20px, 5vw, 56px);
}
.cp-about__row {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: start;
  margin-bottom: clamp(24px, 3vw, 38px);
}
.cp-about__heading {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(24px, 3.2vw, 38px);
  font-weight: 400; line-height: 1.14;
  color: var(--cp-text); margin: 0 0 14px;
  letter-spacing: -0.02em;
}
.cp-about__text {
  font-size: clamp(14px, 1.1vw, 15.5px);
  line-height: 1.82; color: var(--cp-text2); margin: 0;
}
.cp-about__highlights {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.cp-hl-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 14px;
  background: var(--cp-bg);
  border: 1.5px solid var(--cp-border);
  transition: all 0.25s var(--cp-ease);
}
.cp-hl-card:hover {
  border-color: #a7f3d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(5,150,105,0.07);
}
.cp-hl-card__icon {
  width: 38px; height: 38px; border-radius: 10px;
  flex-shrink: 0;
  background: var(--cp-mint); border: 1px solid #a7f3d0;
  color: var(--cp-green-dk);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s ease;
}
.cp-hl-card:hover .cp-hl-card__icon {
  background: var(--cp-green); color: #fff;
  border-color: var(--cp-green);
}
.cp-hl-card__label {
  font-size: 10px; font-weight: 700;
  color: var(--cp-text3);
  text-transform: uppercase; letter-spacing: 0.07em;
  margin-bottom: 1px;
}
.cp-hl-card__value {
  font-size: 13.5px; font-weight: 700;
  color: var(--cp-text); line-height: 1.35;
}

/* Stats row */
.cp-about__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  border-radius: 16px; overflow: hidden;
  border: 1.5px solid var(--cp-border);
}
.cp-stat {
  text-align: center; padding: 20px 12px;
  background: var(--cp-bg);
  border-right: 1px solid var(--cp-border);
}
.cp-stat:last-child { border-right: none; }
.cp-stat__val {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px, 2.5vw, 30px);
  font-weight: 400; color: var(--cp-green-dk);
  line-height: 1; margin-bottom: 4px;
}
.cp-stat__label {
  font-size: 10.5px; font-weight: 700;
  color: var(--cp-text3);
  text-transform: uppercase; letter-spacing: 0.07em;
}

/* ═══════ DESTINATIONS ═══════ */
.cp-dest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: clamp(14px, 2vw, 22px);
}
.cp-dest-grid__item {
  animation: cpFadeUp 0.5s var(--cp-ease) both;
}
.cp-dest-empty {
  grid-column: 1 / -1; text-align: center;
  padding: clamp(52px, 6vw, 80px) 24px;
  background: var(--cp-surface);
  border-radius: var(--cp-radius);
  border: 1.5px solid var(--cp-border);
}
.cp-dest-empty h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px, 2.6vw, 28px);
  color: var(--cp-text); margin: 0 0 7px;
}
.cp-dest-empty p {
  color: var(--cp-text2); font-size: 14px;
  max-width: 380px; margin: 0 auto;
  line-height: 1.7;
}
.cp-show-more {
  text-align: center;
  margin-top: clamp(24px, 3vw, 40px);
}

/* ═══════ GALLERY ═══════ */
.cp-gal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: clamp(150px, 14vw, 230px);
  gap: clamp(6px, 0.8vw, 12px);
}
.cp-gal-grid > :nth-child(1) {
  grid-column: span 2; grid-row: span 2;
}
.cp-gal-item {
  position: relative; overflow: hidden;
  border-radius: 14px; cursor: pointer;
  background: var(--cp-bg);
}
.cp-gal-item img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform 0.6s var(--cp-ease);
}
.cp-gal-item:hover img { transform: scale(1.05); }
.cp-gal-item__overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0);
  transition: background 0.3s ease;
  display: flex; align-items: center; justify-content: center;
}
.cp-gal-item:hover .cp-gal-item__overlay {
  background: rgba(0,0,0,0.28);
}
.cp-gal-item__icon {
  color: #fff; opacity: 0;
  transform: scale(0.8);
  transition: all 0.32s var(--cp-ease);
}
.cp-gal-item:hover .cp-gal-item__icon {
  opacity: 1; transform: scale(1);
}

/* Lightbox */
.cp-lb {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,0.94);
  backdrop-filter: blur(20px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: cpFadeIn 0.2s ease;
}
.cp-lb img {
  max-width: 90vw; max-height: 86vh;
  border-radius: 14px; object-fit: contain;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}
.cp-lb__close {
  position: absolute; top: 20px; right: 20px;
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  color: #fff; cursor: pointer;
  display: grid; place-items: center;
  transition: all 0.2s ease;
}
.cp-lb__close:hover { background: rgba(255,255,255,0.16); }
.cp-lb__nav {
  position: absolute; top: 50%;
  transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  color: #fff; cursor: pointer;
  display: grid; place-items: center;
  transition: all 0.2s ease;
}
.cp-lb__nav:hover { background: rgba(255,255,255,0.16); }
.cp-lb__nav--l { left: 20px; }
.cp-lb__nav--r { right: 20px; }
.cp-lb__count {
  position: absolute; bottom: 22px;
  left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.42);
  font-size: 13px; font-weight: 600;
}

/* ═══════ INFO SECTION ═══════ */
.cp-info-toggle {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 36px; border-radius: 14px;
  border: 1.5px solid var(--cp-border);
  background: var(--cp-surface); color: var(--cp-text);
  font-weight: 700; font-size: 14px; cursor: pointer;
  font-family: inherit;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  transition: all 0.3s var(--cp-ease);
}
.cp-info-toggle:hover {
  border-color: var(--cp-green); color: var(--cp-green);
  box-shadow: 0 4px 18px rgba(5,150,105,0.09);
  transform: translateY(-2px);
}
.cp-info-toggle--on {
  background: var(--cp-green); color: #fff;
  border-color: var(--cp-green);
}
.cp-info-toggle--on:hover {
  background: var(--cp-green-dk); color: #fff;
}
.cp-info-panel {
  overflow: hidden;
  transition: max-height 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.42s ease;
}

/* Facts grid */
.cp-facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
  gap: 12px; margin-bottom: clamp(24px, 3vw, 38px);
}
.cp-fact-card {
  display: flex; align-items: center; gap: 13px;
  padding: 15px 16px; border-radius: 14px;
  background: var(--cp-surface);
  border: 1.5px solid var(--cp-border);
  transition: all 0.25s var(--cp-ease);
}
.cp-fact-card:hover {
  border-color: #a7f3d0;
  box-shadow: 0 4px 16px rgba(5,150,105,0.07);
  transform: translateY(-2px);
}
.cp-fact-card__icon {
  width: 36px; height: 36px; border-radius: 10px;
  flex-shrink: 0;
  background: var(--cp-mint); color: var(--cp-green-dk);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s ease;
}
.cp-fact-card:hover .cp-fact-card__icon {
  background: var(--cp-green); color: #fff;
}
.cp-fact-card__label {
  font-size: 10px; font-weight: 700;
  color: var(--cp-text3);
  text-transform: uppercase; letter-spacing: 0.07em;
  margin-bottom: 2px;
}
.cp-fact-card__value {
  font-size: 13px; font-weight: 700;
  color: var(--cp-text); line-height: 1.35;
}

/* Details grid */
.cp-details-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px; margin-bottom: clamp(24px, 3vw, 38px);
}
.cp-detail-card {
  border-radius: var(--cp-radius); overflow: hidden;
  border: 1.5px solid var(--cp-border);
  background: var(--cp-surface);
  transition: box-shadow 0.28s ease;
}
.cp-detail-card:hover {
  box-shadow: 0 8px 28px rgba(5,150,105,0.08);
}
.cp-detail-card__head {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  background: var(--cp-bg);
  border-bottom: 1px solid var(--cp-border);
}
.cp-detail-card__icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--cp-green); color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cp-detail-card__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 16px; font-weight: 400;
  color: var(--cp-text); margin: 0;
}
.cp-detail-card__body {
  padding: 18px 20px;
  font-size: 14px; color: var(--cp-text2);
  line-height: 1.82; white-space: pre-line;
}

/* FAQs */
.cp-faq-item {
  border: 1.5px solid var(--cp-border);
  border-radius: 14px;
  background: var(--cp-surface);
  overflow: hidden; margin-bottom: 8px;
  transition: all 0.25s ease;
}
.cp-faq-item--open {
  border-color: #a7f3d0;
  box-shadow: 0 4px 18px rgba(5,150,105,0.07);
}
.cp-faq-item__btn {
  width: 100%; display: flex;
  align-items: center; gap: 14px;
  padding: 16px 20px; border: none;
  background: transparent; cursor: pointer;
  font-family: inherit; text-align: left;
}
.cp-faq-item__num {
  width: 28px; height: 28px; border-radius: 8px;
  font-size: 11px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.25s ease;
}
.cp-faq-item__num--on { background: var(--cp-green); color: #fff; }
.cp-faq-item__num--off { background: var(--cp-bg); color: var(--cp-text3); }
.cp-faq-item__q {
  flex: 1; font-weight: 700; font-size: 14px;
  color: var(--cp-text); line-height: 1.4;
}
.cp-faq-item__chev {
  width: 24px; height: 24px; border-radius: 6px;
  color: var(--cp-text3); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s ease;
}
.cp-faq-item__chev--on {
  color: var(--cp-green); transform: rotate(180deg);
}
.cp-faq-item__ans {
  overflow: hidden;
  transition: max-height 0.4s ease, opacity 0.3s ease;
}
.cp-faq-item__ans-inner {
  padding: 0 20px 18px 62px;
  font-size: 14px; color: var(--cp-text2); line-height: 1.86;
}

/* Contact bar */
.cp-contact {
  display: flex; align-items: center;
  flex-wrap: wrap; gap: 18px;
  padding: 20px 26px; border-radius: 18px;
  background: var(--cp-surface);
  border: 1.5px solid #a7f3d0;
}
.cp-contact__icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: var(--cp-green); color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cp-contact__body { flex: 1; min-width: 160px; }
.cp-contact__title {
  font-weight: 800; font-size: 15px;
  color: var(--cp-text); margin-bottom: 3px;
}
.cp-contact__text {
  font-size: 13.5px; color: var(--cp-text2);
}

/* ═══════ CTA ═══════ */
.cp-cta { text-align: center; position: relative; z-index: 1; }
.cp-cta__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(30px, 5.5vw, 56px);
  font-weight: 400; color: #fff;
  line-height: 1.1; margin: 0 0 16px;
  letter-spacing: -0.02em;
}
.cp-cta__title em { font-style: italic; opacity: 0.85; }
.cp-cta__desc {
  font-size: clamp(14px, 1.3vw, 17px);
  color: rgba(255,255,255,0.6);
  line-height: 1.78; max-width: 520px;
  margin: 0 auto 36px;
}
.cp-cta__buttons {
  display: flex; gap: 14px;
  justify-content: center; flex-wrap: wrap;
}
.cp-cta__btn-a {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 40px; border-radius: 16px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; font-weight: 800; font-size: 15px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 10px 36px rgba(16,185,129,0.4);
  transition: all 0.35s var(--cp-ease);
  text-decoration: none;
}
.cp-cta__btn-a:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 16px 44px rgba(16,185,129,0.55);
}
.cp-cta__btn-b {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 17px 36px; border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  color: #fff; font-weight: 700; font-size: 15px;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s ease; text-decoration: none;
}
.cp-cta__btn-b:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.42);
  transform: translateY(-2px);
}

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 1100px) {
  .cp-gal-grid { grid-template-columns: repeat(3, 1fr); }
  .cp-gal-grid > :nth-child(1) { grid-column: span 2; grid-row: span 1; }
}
@media (max-width: 900px) {
  .cp-about__row { grid-template-columns: 1fr; gap: 20px; }
  .cp-about__highlights { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .cp-hero { min-height: 480px; max-height: 740px; }
  .cp-hero__actions { flex-direction: column; align-items: flex-start; }
  .cp-btn--ghost { display: none; }
  .cp-details-grid { grid-template-columns: 1fr; }
  .cp-gal-grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 160px;
  }
  .cp-gal-grid > :nth-child(1) { grid-column: span 1; grid-row: span 1; }
  .cp-contact { flex-direction: column; text-align: center; }
  .cp-cta__buttons { flex-direction: column; align-items: center; }
  .cp-head--split { flex-direction: column; align-items: flex-start; }
  .cp-about__stats { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }
}
@media (max-width: 640px) {
  .cp-hero { height: 88vh; height: 88dvh; min-height: 440px; }
  .cp-hero__body { padding: 0 20px; padding-bottom: 60px; }
  .cp-hero__dots { right: 20px; bottom: 18px; }
  .cp-about__highlights { grid-template-columns: 1fr; }
  .cp-facts-grid { grid-template-columns: 1fr 1fr; }
  .cp-gal-grid { grid-template-columns: 1fr; grid-auto-rows: 210px; }
  .cp-dest-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .cp-hero__title { font-size: clamp(38px, 12vw, 58px); }
  .cp-hero__meta-div { display: none; }
  .cp-hero__meta { gap: 8px; }
  .cp-facts-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

function injectCSS() {
  if (typeof document === "undefined") return;
  const ID = "cp-styles-v13";
  const existing = document.getElementById(ID);
  if (existing) existing.remove();
  const el = document.createElement("style");
  el.id = ID;
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS
═══════════════════════════════════════════════════════════ */
function ScrollBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="cp-scroll-bar">
      <div className="cp-scroll-bar__fill" style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DATA HELPERS
═══════════════════════════════════════════════════════════ */
const pick = (...v) => {
  for (const x of v) if (x && typeof x === "string" && x.trim()) return x.trim();
  return "";
};

const getHeroImages = (c) => {
  const s = new Set();
  const a = (v) => { if (v && typeof v === "string" && v.trim()) s.add(v.trim()); };
  if (Array.isArray(c?.hero_images)) c.hero_images.forEach(a);
  a(c?.image_url); a(c?.heroImage); a(c?.coverImageUrl);
  c?.media?.hero_images?.forEach?.(a);
  c?.media?.gallery?.forEach?.(a);
  if (Array.isArray(c?.images)) c.images.forEach(a);
  return [...s].filter(Boolean).slice(0, 8);
};

const getGalleryImages = (c) => {
  const s = new Set();
  const a = (v) => { if (v && typeof v === "string" && v.trim()) s.add(v.trim()); };
  c?.media?.gallery?.forEach?.(a);
  c?.media?.hero_images?.forEach?.(a);
  if (Array.isArray(c?.hero_images)) c.hero_images.forEach(a);
  if (Array.isArray(c?.images)) c.images.forEach(a);
  a(c?.image_url);
  return [...s].filter(Boolean);
};

const getHighlights = (c) => {
  const r = [];
  const a = (l, v, ic) => { if (v && String(v).trim()) r.push({ label: l, value: String(v).trim(), icon: ic }); };
  a("Capital", pick(c?.capital), <FiMapPin size={15} />);
  a("Best Time", pick(c?.best_time_to_visit, c?.climate_detail?.best_time), <FiCalendar size={15} />);
  a("Currency", pick(c?.currency, c?.practical_info?.currency?.name), <FiTrendingUp size={15} />);
  a("Languages", c?.languages?.official?.length ? c.languages.official.join(", ") : "", <FiGlobe size={15} />);
  return r.slice(0, 4);
};

const getStats = (c) => {
  const r = [];
  const dc = c?.destination_count || c?.destinations?.length || 0;
  if (dc > 0) r.push({ val: `${dc}+`, lbl: "Destinations" });
  const exp = Array.isArray(c?.experiences) ? c.experiences.length : Array.isArray(c?.highlights) ? c.highlights.length : 0;
  if (exp > 0) r.push({ val: `${exp}+`, lbl: "Experiences" });
  if (c?.key_facts?.area) r.push({ val: c.key_facts.area, lbl: "Total Area" });
  else if (c?.key_facts?.population || c?.extra_info?.population)
    r.push({ val: c.key_facts?.population || c.extra_info?.population, lbl: "Population" });
  return r;
};

const getFacts = (c) => {
  const r = [];
  const a = (l, v, ic) => { if (v && String(v).trim()) r.push({ label: l, value: String(v).trim(), icon: ic }); };
  a("Timezone", pick(c?.timezone), <FiClock size={14} />);
  a("Visa", pick(c?.visa_info, c?.practical_info?.visa), <FiShield size={14} />);
  a("Continent", pick(c?.continent), <FiGlobe size={14} />);
  a("Region", pick(c?.region), <FiCompass size={14} />);
  const kf = c?.key_facts || {};
  if (kf.population) a("Population", kf.population, <FiUsers size={14} />);
  if (kf.area) a("Area", kf.area, <FiGlobe size={14} />);
  if (kf.life_expectancy) a("Life Expectancy", kf.life_expectancy, <FiHeart size={14} />);
  if (kf.literacy_rate) a("Literacy", kf.literacy_rate, <FiBookOpen size={14} />);
  const ei = c?.extra_info || {};
  if (ei.population && !kf.population) a("Population", ei.population, <FiUsers size={14} />);
  if (ei.driving_side || c?.driving_side) a("Driving Side", ei.driving_side || c.driving_side, <FiFlag size={14} />);
  if (ei.calling_code || c?.calling_code) a("Calling Code", ei.calling_code || c.calling_code, <FiPhone size={14} />);
  if (ei.water_safety) a("Water Safety", ei.water_safety, <FiDroplet size={14} />);
  const pi = c?.practical_info || {};
  if (pi.electricity?.plug_type) a("Plug Type", pi.electricity.plug_type, <FiZap size={14} />);
  if (pi.electricity?.voltage) a("Voltage", pi.electricity.voltage, <FiZap size={14} />);
  const seen = new Set();
  return r.filter(i => { if (seen.has(i.label)) return false; seen.add(i.label); return true; });
};

const getDetails = (c) => {
  const s = [];
  const a = (l, v, ic) => { if (v && String(v).trim()) s.push({ label: l, value: String(v).trim(), icon: ic }); };
  const ei = c?.extra_info || {};
  a("Health", ei.health || pick(c?.health_info, c?.practical_info?.health), <FiAlertTriangle size={14} />);
  const fd = pick(c?.full_description);
  if (fd && fd.length > 100) a("Overview", fd, <FiBookOpen size={14} />);
  if (c?.wildlife) {
    const p = [];
    c.wildlife.primates?.length && p.push(`Primates: ${c.wildlife.primates.join(", ")}`);
    c.wildlife.big_five?.length && p.push(`Big Five: ${c.wildlife.big_five.join(", ")}`);
    c.wildlife.birds?.length && p.push(`Birds: ${c.wildlife.birds.join(", ")}`);
    if (p.length) a("Wildlife", p.join(". "), <FiCamera size={14} />);
  }
  if (c?.cuisine) {
    const p = [];
    c.cuisine.famous_dishes?.length && p.push(`Famous: ${c.cuisine.famous_dishes.join(", ")}`);
    c.cuisine.staples?.length && p.push(`Staples: ${c.cuisine.staples.join(", ")}`);
    c.cuisine.beverages?.length && p.push(`Beverages: ${c.cuisine.beverages.join(", ")}`);
    if (p.length) a("Cuisine", p.join(". "), <FiCoffee size={14} />);
  }
  if (c?.geography) {
    const g = c.geography, p = [];
    g.terrain && p.push(g.terrain);
    g.highest_point && p.push(`Highest: ${g.highest_point}`);
    g.lakes?.length && p.push(`Lakes: ${g.lakes.join(", ")}`);
    g.volcanoes?.length && p.push(`Volcanoes: ${g.volcanoes.join(", ")}`);
    if (p.length) a("Geography", p.join(". "), <FiMapPin size={14} />);
  }
  if (c?.climate_detail) {
    const cd = c.climate_detail, p = [];
    cd.overview && p.push(cd.overview);
    cd.seasons && Object.entries(cd.seasons).forEach(([n, d]) => {
      d.months && p.push(`${n}: ${d.months}${d.note ? ` (${d.note})` : ""}`);
    });
    if (p.length) a("Climate", p.join(". "), <FiSun size={14} />);
  }
  if (Array.isArray(c?.travel_tips) && c.travel_tips.length)
    a("Travel Tips", "• " + c.travel_tips.join("\n• "), <FiInfo size={14} />);
  if (Array.isArray(c?.neighboring_countries) && c.neighboring_countries.length)
    a("Neighbors", c.neighboring_countries.join(", "), <FiGlobe size={14} />);
  const seen = new Set();
  return s.filter(x => { if (seen.has(x.label)) return false; seen.add(x.label); return true; });
};

const getFaqs = (c) => {
  if (Array.isArray(c?.faqs) && c.faqs.length > 0)
    return c.faqs.filter(f => (f.question || f.q) && (f.answer || f.a))
      .map(f => ({ question: f.question || f.q, answer: f.answer || f.a }));
  const r = [], n = c?.name || "this country";
  const visa = pick(c?.visa_info, c?.practical_info?.visa);
  if (visa) r.push({ question: `Do I need a visa to visit ${n}?`, answer: visa });
  if (c?.languages?.official?.length)
    r.push({ question: `What languages are spoken in ${n}?`, answer: `Official: ${c.languages.official.join(", ")}.` });
  r.push({ question: `Is ${n} safe for tourists?`, answer: `${n} is generally welcoming. Always check current advisories.` });
  const bt = pick(c?.best_time_to_visit, c?.climate_detail?.best_time);
  if (bt) r.push({ question: `Best time to visit ${n}?`, answer: bt });
  const cur = pick(c?.currency, c?.practical_info?.currency?.name);
  if (cur) r.push({ question: `What currency is used?`, answer: `The official currency is the ${cur}.` });
  return r.slice(0, 8);
};

/* ═══════════════════════════════════════════════════════════
   1. HERO
═══════════════════════════════════════════════════════════ */
function HeroSection({ country, navigate }) {
  const images = useMemo(() => getHeroImages(country), [country]);
  const [active, setActive] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timer = useRef(null);

  const advance = useCallback(() => {
    if (images.length <= 1) return;
    setActive(p => (p + 1) % images.length);
    setAnimKey(k => k + 1);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(advance, 9000);
    return () => clearInterval(timer.current);
  }, [advance, images.length]);

  const flag = country?.flag_url;
  const dc = country?.destination_count || country?.destinations?.length || 0;

  return (
    <header className="cp-hero">
      {images.length > 0
        ? images.map((src, i) => (
            <div key={src + i} className={`cp-hero__slide${i === active ? " cp-hero__slide--on" : ""}`}>
              <img src={src} alt={country.name} loading={i === 0 ? "eager" : "lazy"} draggable={false} />
            </div>
          ))
        : <div className="cp-hero__no-img"><FiGlobe size={120} style={{ color: "rgba(255,255,255,0.04)" }} /></div>
      }
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(180deg,rgba(2,44,34,0.25) 0%,rgba(2,44,34,0.05) 30%,rgba(2,44,34,0.55) 78%,rgba(2,44,34,0.9) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(90deg,rgba(2,44,34,0.55) 0%,transparent 50%)" }} />

      <nav className="cp-crumb">
        <ol className="cp-crumb__list">
          <li><Link to="/">Home</Link></li>
          <li><span className="cp-crumb__sep">/</span></li>
          <li><Link to="/destinations">Destinations</Link></li>
          <li><span className="cp-crumb__sep">/</span></li>
          <li><span className="cp-crumb__cur">{country.name}</span></li>
        </ol>
      </nav>

      <div className="cp-hero__body">
        <div className="cp-hero__eyebrow">
          <div className="cp-hero__eyebrow-line cp-hero__eyebrow-line--l" />
          <span className="cp-hero__eyebrow-text">Explore {country.continent || "Africa"}</span>
          <div className="cp-hero__eyebrow-line cp-hero__eyebrow-line--r" />
        </div>

        <div className="cp-hero__meta">
          {flag && (
            <>
              <span className="cp-hero__meta-item"><img src={flag} alt="" className="cp-hero__flag" /></span>
              <div className="cp-hero__meta-div" />
            </>
          )}
          {country.continent && <span className="cp-hero__meta-item"><FiGlobe size={13} /> {country.continent}</span>}
          {country.region && <><div className="cp-hero__meta-div" /><span className="cp-hero__meta-item"><FiCompass size={13} /> {country.region}</span></>}
          {dc > 0 && <><div className="cp-hero__meta-div" /><span className="cp-hero__meta-item"><FiMapPin size={13} /> {dc} Destination{dc !== 1 ? "s" : ""}</span></>}
        </div>

        <h1 className="cp-hero__title">{country.name}</h1>
        {country.tagline && <p className="cp-hero__tagline">{country.tagline}</p>}

        <div className="cp-hero__actions">
          <button className="cp-btn cp-btn--primary"
            onClick={() => document.getElementById("cp-destinations")?.scrollIntoView({ behavior: "smooth" })}>
            <FiCompass size={14} /> Explore Destinations
          </button>
          <button className="cp-btn cp-btn--ghost" onClick={() => navigate("/contact")}>
            <FiSend size={14} /> Plan My Trip
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="cp-hero__dots">
          {images.map((_, i) => <span key={i} className={`cp-hero__dot${i === active ? " cp-hero__dot--on" : ""}`} />)}
        </div>
      )}
      {images.length > 1 && (
        <div className="cp-hero__prog">
          <div className="cp-hero__prog-fill" key={`p-${animKey}`} style={{ animation: "cpProgress 9s linear forwards" }} />
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. ABOUT
═══════════════════════════════════════════════════════════ */
function AboutSection({ country }) {
  const desc = pick(country?.description, country?.short_notes);
  const hl = useMemo(() => getHighlights(country), [country]);
  const stats = useMemo(() => getStats(country), [country]);
  const text = useMemo(() => {
    if (!desc) return "";
    return desc.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 4).join(" ");
  }, [desc]);

  if (!text && hl.length === 0 && stats.length === 0) return null;

  return (
    <section className="cp-about">
      <div className="cp-about__wrap">
        <div className="cp-about__row">
          <div>
            <h2 className="cp-about__heading">Discover {country.name}</h2>
            {text && <p className="cp-about__text">{text}</p>}
          </div>
          {hl.length > 0 && (
            <div className="cp-about__highlights">
              {hl.map((h, i) => (
                <div key={i} className="cp-hl-card">
                  <div className="cp-hl-card__icon">{h.icon}</div>
                  <div>
                    <div className="cp-hl-card__label">{h.label}</div>
                    <div className="cp-hl-card__value">{h.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {stats.length > 0 && (
          <div className="cp-about__stats">
            {stats.map((s, i) => (
              <div key={i} className="cp-stat">
                <div className="cp-stat__val">{s.val}</div>
                <div className="cp-stat__label">{s.lbl}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. DESTINATIONS
═══════════════════════════════════════════════════════════ */
function DestinationsSection({ country, allDests, destsLoading }) {
  const [showAll, setShowAll] = useState(false);
  const INIT = 6;
  const shown = showAll ? allDests : allDests.slice(0, INIT);
  const hasMore = allDests.length > INIT;

  return (
    <section id="cp-destinations" className="cp-sec cp-sec--bg">
      <div className="cp-inner">
        <div className="cp-head cp-head--center">
          <h2 className="cp-title">Destinations in {country.name}</h2>
          <p className="cp-desc cp-desc--center">
            {allDests.length > 0
              ? `${allDests.length} carefully selected destination${allDests.length !== 1 ? "s" : ""} — each offering unique, authentic experiences.`
              : "Curated destinations crafted for unforgettable journeys."}
          </p>
        </div>

        {destsLoading ? (
          <div className="cp-dest-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="cp-dest-grid__item" style={{ animationDelay: `${i * 60}ms` }}>
                <DestinationCardSkeleton />
              </div>
            ))}
          </div>
        ) : allDests.length === 0 ? (
          <div className="cp-dest-empty">
            <h3>Destinations Coming Soon</h3>
            <p>We're curating incredible experiences in {country.name}. Check back shortly.</p>
          </div>
        ) : (
          <>
            <div className="cp-dest-grid">
              {shown.map((dest, i) => (
                <div key={dest.id || dest.slug || i} className="cp-dest-grid__item"
                  style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                  <DestinationCard destination={dest} priority={i < 4} />
                </div>
              ))}
            </div>
            {hasMore && !showAll && (
              <div className="cp-show-more">
                <button className="cp-btn cp-btn--outline" onClick={() => setShowAll(true)}>
                  View All {allDests.length} Destinations <FiArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. GALLERY
═══════════════════════════════════════════════════════════ */
function LightboxModal({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const next = () => setIdx(p => (p + 1) % images.length);
  const prev = () => setIdx(p => (p - 1 + images.length) % images.length);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="cp-lb" onClick={onClose}>
      <img src={images[idx]} alt={`Gallery ${idx + 1}`} onClick={e => e.stopPropagation()} />
      <button className="cp-lb__close" onClick={onClose}><FiX size={18} /></button>
      {images.length > 1 && (
        <>
          <button className="cp-lb__nav cp-lb__nav--l" onClick={e => { e.stopPropagation(); prev(); }}><FiChevronLeft size={20} /></button>
          <button className="cp-lb__nav cp-lb__nav--r" onClick={e => { e.stopPropagation(); next(); }}><FiChevronRight size={20} /></button>
          <div className="cp-lb__count">{idx + 1} / {images.length}</div>
        </>
      )}
    </div>
  );
}

function GallerySection({ country }) {
  const images = useMemo(() => getGalleryImages(country), [country]);
  const [lbIdx, setLbIdx] = useState(null);
  if (images.length < 3) return null;

  return (
    <>
      <section className="cp-sec cp-sec--white">
        <div className="cp-inner">
          <div className="cp-head cp-head--center">
            <h2 className="cp-title">{country.name} in Pictures</h2>
            <p className="cp-desc cp-desc--center">
              Landscapes, wildlife and culture — a visual preview of what awaits.
            </p>
          </div>
          <div className="cp-gal-grid">
            {images.slice(0, 7).map((src, i) => (
              <div key={src + i} className="cp-gal-item" onClick={() => setLbIdx(i)}
                role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setLbIdx(i)}>
                <img src={src} alt={`${country.name} ${i + 1}`} loading="lazy" />
                <div className="cp-gal-item__overlay">
                  <FiExternalLink className="cp-gal-item__icon" size={22} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {lbIdx !== null && <LightboxModal images={images} startIdx={lbIdx} onClose={() => setLbIdx(null)} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. INFO — Expandable
═══════════════════════════════════════════════════════════ */
function FaqItem({ faq, index, isOpen, onToggle }) {
  return (
    <div className={`cp-faq-item${isOpen ? " cp-faq-item--open" : ""}`}>
      <button className="cp-faq-item__btn" onClick={onToggle}>
        <span className={`cp-faq-item__num${isOpen ? " cp-faq-item__num--on" : " cp-faq-item__num--off"}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="cp-faq-item__q">{faq.question}</span>
        <span className={`cp-faq-item__chev${isOpen ? " cp-faq-item__chev--on" : ""}`}>
          <FiChevronDown size={14} />
        </span>
      </button>
      <div className="cp-faq-item__ans" style={{ maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0 }}>
        <div className="cp-faq-item__ans-inner">{faq.answer}</div>
      </div>
    </div>
  );
}

function InfoSection({ country }) {
  const [open, setOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const panelRef = useRef(null);

  const facts = useMemo(() => getFacts(country), [country]);
  const details = useMemo(() => getDetails(country), [country]);
  const faqs = useMemo(() => getFaqs(country), [country]);
  const name = country?.name || "this destination";

  if (facts.length === 0 && details.length === 0 && faqs.length === 0) return null;

  const toggle = () => {
    if (!open) {
      setOpen(true);
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 140);
    } else {
      setOpen(false);
    }
  };

  return (
    <section className="cp-sec cp-sec--mint">
      <div className="cp-inner--md">
        <div className="cp-head cp-head--center">
          <h2 className="cp-title">Know Before You Go</h2>
          <p className="cp-desc cp-desc--center">
            Essential details about {name} — climate, logistics, wildlife, cuisine, and more.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: open ? 36 : 0 }}>
          <button className={`cp-info-toggle${open ? " cp-info-toggle--on" : ""}`} onClick={toggle}>
            {open ? <FiMinus size={15} /> : <FiPlus size={15} />}
            {open ? "Hide Details" : `View Details About ${name}`}
            {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </div>

        <div ref={panelRef} className="cp-info-panel"
          style={{ maxHeight: open ? 99999 : 0, opacity: open ? 1 : 0 }}>

          {facts.length > 0 && (
            <div className="cp-facts-grid">
              {facts.map((f, i) => (
                <div key={i} className="cp-fact-card">
                  <div className="cp-fact-card__icon">{f.icon}</div>
                  <div>
                    <div className="cp-fact-card__label">{f.label}</div>
                    <div className="cp-fact-card__value">{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {details.length > 0 && (
            <div className="cp-details-grid">
              {details.map((item, i) => (
                <div key={i} className="cp-detail-card">
                  <div className="cp-detail-card__head">
                    <div className="cp-detail-card__icon">{item.icon}</div>
                    <h3 className="cp-detail-card__title">{item.label}</h3>
                  </div>
                  <div className="cp-detail-card__body">{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {faqs.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              {faqs.map((faq, i) => (
                <FaqItem key={i} faq={faq} index={i}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}

              <div className="cp-contact" style={{ marginTop: 16 }}>
                <div className="cp-contact__icon"><FiMail size={20} /></div>
                <div className="cp-contact__body">
                  <div className="cp-contact__title">Still have questions?</div>
                  <div className="cp-contact__text">Our {name} specialists are happy to help.</div>
                </div>
                <Link to="/contact" className="cp-btn cp-btn--primary" style={{ padding: "12px 24px", fontSize: 13 }}>
                  <FiMail size={14} /> Get in Touch
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. CTA
═══════════════════════════════════════════════════════════ */
function CtaSection({ country }) {
  const name = country?.name || "East Africa";
  return (
    <section className="cp-sec cp-sec--dark cp-cta">
      <div className="cp-inner--md">
        <h2 className="cp-cta__title">
          Your {name} Adventure<br /><em>Begins Here</em>
        </h2>
        <p className="cp-cta__desc">
          From misty mountain gorillas to golden savannahs — our local experts
          craft journeys as unique as you are.
        </p>
        <div className="cp-cta__buttons">
          <Link to="/booking" className="cp-cta__btn-a">
            <FiCalendar size={16} /> Plan My Trip
          </Link>
          <Link to="/contact" className="cp-cta__btn-b">
            <FiMail size={16} /> Speak to an Expert
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function CountryPage() {
  const { countryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    injectCSS();
  }, [countryId]);

  const { country, loading, error, refetch } = useCountry(countryId);
  const { destinations: allDests = [], loading: destsLoading } = useCountryDestinations(countryId);

  const slug = country ? getCountrySlug(country) : "";
  const heroImages = country ? getHeroImages(country) : [];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafb" }}>
        <Loader />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8fafb", padding: "0 24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "#fef2f2", margin: "0 auto 24px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FiWifiOff size={32} style={{ color: "#f87171" }} />
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 28, fontWeight: 400, color: "#0f172a", marginBottom: 10,
          }}>
            Country Not Found
          </h2>
          <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            {error || `We couldn't find "${countryId}". Please try again.`}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => navigate(-1)} className="cp-btn cp-btn--outline">
              <FiArrowLeft size={14} /> Go Back
            </button>
            <button onClick={refetch} className="cp-btn cp-btn--primary">
              <FiRefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <ScrollBar />

      <SEO
        title={`Explore ${country.name}`}
        description={pick(country?.tagline, country?.short_notes, country?.description) || `Discover ${country.name}.`}
        keywords={[country.name, country.continent, country.region, "safari", "travel"].filter(Boolean)}
        url={`/country/${slug}`}
        image={heroImages[0]}
        type="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Destinations", url: "/destinations" },
          { name: country.name, url: `/country/${slug}` },
        ]}
      />

      <HeroSection country={country} navigate={navigate} />
      <AboutSection country={country} />
      <DestinationsSection country={country} allDests={allDests} destsLoading={destsLoading} />
      <GallerySection country={country} />
      <InfoSection country={country} />
      <CtaSection country={country} />
    </div>
  );
}