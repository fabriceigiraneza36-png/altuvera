// src/pages/CountryPage.jsx
import React, { useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiMapPin, FiCalendar, FiDollarSign, FiGlobe, FiUsers,
  FiBookOpen, FiStar, FiCamera, FiArrowRight, FiArrowLeft,
  FiCompass, FiSun, FiClock, FiMap,
  FiInfo, FiAward,
  FiAlertCircle, FiRefreshCw,
  FiThermometer, FiShield, FiFeather,
  FiTrendingUp, FiHeart, FiEye,
} from "react-icons/fi";
import AnimatedSection from "../components/common/AnimatedSection";
import DestinationCard from "../components/destinations/DestinationCard";
import { useCountry, useCountryDestinations } from "../hooks/useCountries";
import { getCountrySlug } from "../utils/countrySlugMap";
import Loader from "../components/common/Loader";

/* ═══════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap');

  :root {
    --cp-green-950: #022c22;
    --cp-green-900: #064e3b;
    --cp-green-800: #065f46;
    --cp-green-700: #047857;
    --cp-green-600: #059669;
    --cp-green-500: #10b981;
    --cp-green-400: #34d399;
    --cp-green-300: #6ee7b7;
    --cp-green-100: #d1fae5;
    --cp-green-50:  #ecfdf5;
    --cp-green-30:  #f0fdf4;
    --cp-white:     #ffffff;
    --cp-gray-900:  #0f172a;
    --cp-gray-800:  #1e293b;
    --cp-gray-700:  #334155;
    --cp-gray-600:  #475569;
    --cp-gray-500:  #64748b;
    --cp-gray-400:  #94a3b8;
    --cp-gray-300:  #cbd5e1;
    --cp-gray-200:  #e2e8f0;
    --cp-gray-100:  #f1f5f9;
    --cp-gray-50:   #f8fafc;
    --cp-shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --cp-shadow-md: 0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
    --cp-shadow-lg: 0 12px 40px rgba(0,0,0,.1), 0 4px 16px rgba(0,0,0,.06);
    --cp-shadow-xl: 0 24px 64px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.06);
    --cp-shadow-green: 0 8px 32px rgba(4,120,87,.2);
    --cp-radius-sm: 4px;
    --cp-radius-md: 8px;
    --cp-radius-lg: 16px;
    --cp-radius-xl: 24px;
    --cp-transition: all .3s cubic-bezier(.4,0,.2,1);
    --cp-transition-slow: all .6s cubic-bezier(.16,1,.3,1);
  }

  @keyframes cpFadeInUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes cpFadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes cpSlideInLeft {
    from { opacity:0; transform:translateX(-40px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes cpSlideInRight {
    from { opacity:0; transform:translateX(40px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes cpScaleIn {
    from { opacity:0; transform:scale(.92); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes cpShimmer {
    0%   { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }
  @keyframes cpPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:.5; transform:scale(.88); }
  }
  @keyframes cpFloat {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-8px); }
  }
  @keyframes cpSpin {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes cpBarFill {
    from { width:0; }
    to   { width:var(--cp-bar-w,100%); }
  }
  @keyframes cpHeroKen {
    0%   { transform:scale(1) translateY(0); }
    100% { transform:scale(1.08) translateY(-2%); }
  }
  @keyframes cpProgress {
    from { transform:scaleX(0); }
    to   { transform:scaleX(1); }
  }
  @keyframes cpTypewriter {
    from { width:0; }
    to   { width:100%; }
  }
  @keyframes cpBlink {
    0%,100% { opacity:1; }
    50%     { opacity:0; }
  }
  @keyframes cpGlow {
    0%,100% { box-shadow:0 0 20px rgba(16,185,129,.3); }
    50%     { box-shadow:0 0 40px rgba(16,185,129,.6); }
  }
  @keyframes cpOrb {
    0%   { transform:translate(0,0) scale(1); }
    33%  { transform:translate(20px,-15px) scale(1.05); }
    66%  { transform:translate(-10px,10px) scale(.95); }
    100% { transform:translate(0,0) scale(1); }
  }

  /* ── Global Reset ── */
  .cp3 *, .cp3 *::before, .cp3 *::after {
    box-sizing: border-box;
  }
  .cp3 {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--cp-white);
    color: var(--cp-gray-900);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Scroll Progress ── */
  .cp3-scroll-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 9999;
    background: rgba(255,255,255,.1);
  }
  .cp3-scroll-bar__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--cp-green-500), var(--cp-green-300));
    transform-origin: left;
    transition: transform .1s linear;
  }

  /* ── Container ── */
  .cp3-container {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 48px);
    width: 100%;
  }
  .cp3-container--narrow {
    max-width: 860px;
  }

  /* ══════════════════════════════════════════
     HERO SECTION
  ══════════════════════════════════════════ */
  .cp3-hero {
    position: relative;
    height: clamp(500px, 70vh, 780px);
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    background: var(--cp-green-950);
  }

  /* Slides */
  .cp3-hero__slides {
    position: absolute;
    inset: 0;
  }
  .cp3-hero__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1.2s ease;
  }
  .cp3-hero__slide.active {
    opacity: 1;
  }
  .cp3-hero__slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: cpHeroKen 12s ease-out forwards;
  }
  .cp3-hero__slide--empty {
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--cp-green-950), var(--cp-green-900));
  }

  /* Overlays */
  .cp3-hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(2,44,34,.15) 0%,
      rgba(2,44,34,.3) 30%,
      rgba(2,44,34,.75) 70%,
      rgba(2,44,34,.92) 100%
    );
    z-index: 1;
  }
  .cp3-hero__overlay-top {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 70% 30%, rgba(16,185,129,.08), transparent 60%);
    z-index: 1;
  }

  /* Slide dots */
  .cp3-hero__dots {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
  }
  .cp3-hero__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,.4);
    border: none;
    cursor: pointer;
    transition: var(--cp-transition);
    padding: 0;
  }
  .cp3-hero__dot.active {
    width: 24px;
    border-radius: 3px;
    background: var(--cp-green-400);
  }

  /* Nav / Breadcrumb */
  .cp3-hero__nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    padding: 24px 0;
    background: linear-gradient(180deg, rgba(2,44,34,.5), transparent);
  }
  .cp3-hero__crumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .06em;
    flex-wrap: wrap;
  }
  .cp3-hero__crumbs li {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,.7);
  }
  .cp3-hero__crumbs li:last-child { color: #fff; }
  .cp3-hero__crumbs li::after {
    content: "/";
    color: rgba(255,255,255,.3);
  }
  .cp3-hero__crumbs li:last-child::after { display: none; }
  .cp3-hero__crumbs a {
    color: rgba(255,255,255,.75);
    text-decoration: none;
    transition: color .2s;
  }
  .cp3-hero__crumbs a:hover { color: var(--cp-green-300); }

  /* Body */
  .cp3-hero__body {
    position: relative;
    z-index: 5;
    padding: 0 0 clamp(48px, 7vh, 80px);
    width: 100%;
  }

  /* Chips */
  .cp3-hero__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    animation: cpFadeIn .6s .4s both;
  }

  /* Title */
  .cp3-hero__title {
    margin: 0 0 16px;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(42px, 7vw, 88px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -.03em;
    color: #fff;
    animation: cpFadeInUp .8s .6s both;
    text-shadow: 0 2px 20px rgba(0,0,0,.3);
  }
  .cp3-hero__title em {
    font-style: italic;
    color: var(--cp-green-300);
  }

  /* Tagline */
  .cp3-hero__tagline {
    margin: 0 0 28px;
    font-size: clamp(15px, 2vw, 18px);
    line-height: 1.7;
    color: rgba(255,255,255,.85);
    max-width: 580px;
    animation: cpFadeInUp .8s .8s both;
  }

  /* Meta */
  .cp3-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 28px;
    animation: cpFadeInUp .8s 1s both;
  }

  /* CTAs */
  .cp3-hero__ctas {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    animation: cpFadeInUp .8s 1.2s both;
  }

  /* Scroll hint */
  .cp3-hero__scroll-hint {
    position: absolute;
    right: clamp(20px, 3vw, 48px);
    bottom: clamp(24px, 4vh, 48px);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255,255,255,.6);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    animation: cpFadeIn 1s 1.8s both;
  }
  .cp3-hero__scroll-line {
    width: 1px;
    height: 48px;
    background: linear-gradient(180deg, rgba(255,255,255,.4), transparent);
    position: relative;
    overflow: hidden;
  }
  .cp3-hero__scroll-line::after {
    content: "";
    position: absolute;
    top: -100%;
    left: 0;
    right: 0;
    height: 100%;
    background: var(--cp-green-400);
    animation: cpFadeInUp 1.5s 2s ease-in-out infinite;
  }

  /* Flag element */
  .cp3-hero__flag {
    position: absolute;
    bottom: clamp(24px, 4vh, 48px);
    right: clamp(20px, 3vw, 48px);
    z-index: 10;
    width: 72px;
    height: 72px;
    border: 3px solid rgba(255,255,255,.9);
    background: rgba(255,255,255,.15);
    backdrop-filter: blur(12px);
    overflow: hidden;
    display: grid;
    place-items: center;
    font-size: 36px;
    box-shadow: 0 8px 32px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.1);
    animation: cpScaleIn .6s 1.4s both;
  }
  .cp3-hero__flag img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* ══════════════════════════════════════════
     STATS BAR
  ══════════════════════════════════════════ */
  .cp3-stats-bar {
    background: var(--cp-white);
    border-bottom: 1px solid var(--cp-gray-200);
    box-shadow: var(--cp-shadow-md);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .cp3-stats-bar__inner {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .cp3-stats-bar__inner::-webkit-scrollbar { display: none; }
  .cp3-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 28px;
    border-right: 1px solid var(--cp-gray-100);
    white-space: nowrap;
    flex-shrink: 0;
    transition: background .2s;
    cursor: default;
  }
  .cp3-stat:hover { background: var(--cp-green-30); }
  .cp3-stat:last-child { border-right: none; }
  .cp3-stat__icon {
    width: 36px;
    height: 36px;
    background: var(--cp-green-50);
    color: var(--cp-green-700);
    display: grid;
    place-items: center;
    border-radius: var(--cp-radius-sm);
    flex-shrink: 0;
  }
  .cp3-stat__body {}
  .cp3-stat__label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--cp-gray-400);
    margin-bottom: 3px;
  }
  .cp3-stat__val {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: var(--cp-gray-900);
  }
  .cp3-stat__val--accent {
    color: var(--cp-green-700);
  }

  /* ══════════════════════════════════════════
     SECTION BASE
  ══════════════════════════════════════════ */
  .cp3-sec {
    padding: clamp(56px, 7vw, 96px) 0;
    position: relative;
  }
  .cp3-sec--white { background: var(--cp-white); }
  .cp3-sec--soft  { background: var(--cp-green-30); }
  .cp3-sec--dark  {
    background: var(--cp-green-950);
    color: var(--cp-white);
  }
  .cp3-sec--dark .cp3-sec-title__h3 { color: var(--cp-white); }
  .cp3-sec--dark .cp3-sec-title__sub { color: rgba(255,255,255,.7); }

  /* Section header */
  .cp3-sec-title {
    margin-bottom: clamp(36px, 5vw, 60px);
  }
  .cp3-sec-title--center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cp3-sec-title__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .18em;
    color: var(--cp-green-700);
    margin-bottom: 14px;
  }
  .cp3-sec-title__eyebrow-line {
    width: 28px;
    height: 2px;
    background: linear-gradient(90deg, var(--cp-green-500), var(--cp-green-400));
  }
  .cp3-sec-title__eyebrow-dot {
    width: 8px;
    height: 8px;
    background: var(--cp-green-500);
    border-radius: 50%;
    animation: cpPulse 2s ease-in-out infinite;
  }
  .cp3-sec-title__h3 {
    margin: 0 0 12px;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(26px, 3.5vw, 42px);
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -.022em;
    color: var(--cp-gray-900);
  }
  .cp3-sec-title__bar {
    width: 48px;
    height: 3px;
    background: linear-gradient(90deg, var(--cp-green-500), var(--cp-green-400));
    margin-top: 16px;
  }
  .cp3-sec-title--center .cp3-sec-title__bar {
    margin-left: auto;
    margin-right: auto;
  }
  .cp3-sec-title__sub {
    margin: 0;
    font-size: 15px;
    line-height: 1.75;
    color: var(--cp-gray-500);
    max-width: 560px;
  }
  .cp3-sec-title--center .cp3-sec-title__sub {
    text-align: center;
  }

  /* ══════════════════════════════════════════
     OVERVIEW PANEL
  ══════════════════════════════════════════ */
  .cp3-overview {
    display: grid;
    grid-template-columns: 1fr;
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    box-shadow: var(--cp-shadow-lg);
    overflow: hidden;
  }
  @media (min-width: 900px) {
    .cp3-overview {
      grid-template-columns: 480px 1fr;
    }
  }
  @media (min-width: 1100px) {
    .cp3-overview {
      grid-template-columns: 560px 1fr;
    }
  }

  /* Media half */
  .cp3-overview__media {
    position: relative;
    min-height: 380px;
    overflow: hidden;
    background: var(--cp-green-950);
  }
  @media (max-width: 899px) {
    .cp3-overview__media {
      aspect-ratio: 16/9;
      min-height: unset;
    }
  }
  .cp3-overview__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1s cubic-bezier(.16,1,.3,1);
  }
  .cp3-overview:hover .cp3-overview__img {
    transform: scale(1.05);
  }
  .cp3-overview__media-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(2,44,34,.5) 100%);
  }
  .cp3-overview__badges {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    z-index: 2;
  }
  .cp3-overview__flag {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 68px;
    height: 68px;
    border: 3px solid rgba(255,255,255,.95);
    background: rgba(255,255,255,.15);
    backdrop-filter: blur(12px);
    overflow: hidden;
    display: grid;
    place-items: center;
    font-size: 34px;
    box-shadow: 0 6px 24px rgba(0,0,0,.25);
    z-index: 2;
  }
  .cp3-overview__flag img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Body half */
  .cp3-overview__body {
    padding: clamp(28px, 4vw, 52px);
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: var(--cp-white);
  }
  .cp3-overview__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .18em;
    color: var(--cp-green-700);
  }
  .cp3-overview__pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--cp-green-500);
    animation: cpPulse 2.5s ease-in-out infinite;
  }
  .cp3-overview__name {
    margin: 0;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(32px, 4.5vw, 52px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -.028em;
    color: var(--cp-gray-900);
  }
  .cp3-overview__tagline {
    margin: 0;
    font-size: 16px;
    line-height: 1.75;
    color: var(--cp-gray-600);
    max-width: 520px;
  }
  .cp3-overview__divider {
    width: 52px;
    height: 3px;
    background: linear-gradient(90deg, var(--cp-green-500), var(--cp-green-400));
  }
  .cp3-overview__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .cp3-overview__meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--cp-green-30);
    border: 1px solid var(--cp-green-100);
    color: var(--cp-green-800);
    font-size: 13px;
    font-weight: 700;
    border-radius: var(--cp-radius-sm);
    white-space: nowrap;
  }
  .cp3-overview__actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    padding-top: 20px;
    border-top: 1px solid var(--cp-gray-100);
    margin-top: auto;
  }

  /* ══════════════════════════════════════════
     BUTTONS
  ══════════════════════════════════════════ */
  .cp3-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: var(--cp-radius-sm);
    transition: var(--cp-transition);
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }
  .cp3-btn::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.12);
    opacity: 0;
    transition: opacity .2s;
  }
  .cp3-btn:hover::after { opacity: 1; }

  .cp3-btn--primary {
    background: var(--cp-green-700);
    color: var(--cp-white);
    border-color: var(--cp-green-700);
    box-shadow: 0 4px 12px rgba(4,120,87,.25);
  }
  .cp3-btn--primary:hover {
    background: var(--cp-green-800);
    border-color: var(--cp-green-800);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(4,120,87,.35);
  }
  .cp3-btn--outline {
    background: transparent;
    color: var(--cp-gray-700);
    border-color: var(--cp-gray-300);
  }
  .cp3-btn--outline:hover {
    border-color: var(--cp-green-500);
    color: var(--cp-green-700);
    background: var(--cp-green-30);
    transform: translateY(-2px);
  }
  .cp3-btn--ghost-dark {
    background: rgba(255,255,255,.08);
    color: var(--cp-white);
    border-color: rgba(255,255,255,.25);
  }
  .cp3-btn--ghost-dark:hover {
    background: var(--cp-white);
    color: var(--cp-green-800);
    border-color: var(--cp-white);
  }
  .cp3-btn--lg {
    padding: 16px 32px;
    font-size: 14px;
  }
  .cp3-btn--sm {
    padding: 10px 18px;
    font-size: 12px;
  }
  .cp3-btn--full { width: 100%; justify-content: center; }

  /* ══════════════════════════════════════════
     CHIPS / BADGES
  ══════════════════════════════════════════ */
  .cp3-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .04em;
    border-radius: 2px;
    white-space: nowrap;
    transition: var(--cp-transition);
  }
  .cp3-chip--green {
    background: var(--cp-green-700);
    color: var(--cp-white);
  }
  .cp3-chip--gold {
    background: #d97706;
    color: var(--cp-white);
  }
  .cp3-chip--glass {
    background: rgba(255,255,255,.15);
    color: var(--cp-white);
    border: 1px solid rgba(255,255,255,.3);
    backdrop-filter: blur(8px);
  }
  .cp3-chip--dark {
    background: rgba(15,23,42,.6);
    color: var(--cp-white);
    backdrop-filter: blur(8px);
  }
  .cp3-chip--soft-green {
    background: var(--cp-green-50);
    color: var(--cp-green-800);
    border: 1px solid var(--cp-green-100);
  }
  .cp3-chip--soft-gray {
    background: var(--cp-gray-100);
    color: var(--cp-gray-700);
  }

  /* ══════════════════════════════════════════
     FACTS GRID
  ══════════════════════════════════════════ */
  .cp3-facts-grid {
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    background: var(--cp-gray-200);
  }
  .cp3-fact {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
    background: var(--cp-white);
    transition: background .25s;
    position: relative;
    overflow: hidden;
  }
  .cp3-fact::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: transparent;
    transition: background .25s;
  }
  .cp3-fact:hover {
    background: var(--cp-green-30);
  }
  .cp3-fact:hover::before {
    background: var(--cp-green-500);
  }
  .cp3-fact__icon {
    width: 44px;
    height: 44px;
    background: var(--cp-green-50);
    color: var(--cp-green-700);
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: var(--cp-radius-sm);
    transition: var(--cp-transition);
  }
  .cp3-fact:hover .cp3-fact__icon {
    background: var(--cp-green-700);
    color: var(--cp-white);
    transform: scale(1.05);
  }
  .cp3-fact__label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--cp-gray-400);
    margin-bottom: 5px;
  }
  .cp3-fact__value {
    display: block;
    font-size: 14.5px;
    font-weight: 700;
    color: var(--cp-gray-800);
    line-height: 1.45;
  }

  /* ══════════════════════════════════════════
     ABOUT / DESCRIPTION
  ══════════════════════════════════════════ */
  .cp3-about {
    display: grid;
    gap: clamp(32px, 4vw, 56px);
  }
  @media (min-width: 900px) {
    .cp3-about {
      grid-template-columns: 1fr 420px;
      align-items: start;
    }
  }
  .cp3-prose {
    font-size: 16px;
    line-height: 1.9;
    color: var(--cp-gray-700);
  }
  .cp3-prose p { margin: 0 0 20px; }
  .cp3-prose p:last-child { margin-bottom: 0; }

  /* Quote block */
  .cp3-quote {
    border-left: 4px solid var(--cp-green-500);
    padding: 24px 28px;
    background: var(--cp-green-30);
    margin: 0;
    border-radius: 0 var(--cp-radius-md) var(--cp-radius-md) 0;
    position: relative;
  }
  .cp3-quote__mark {
    font-family: 'Playfair Display', serif;
    font-size: 80px;
    line-height: 1;
    color: var(--cp-green-300);
    position: absolute;
    top: -8px;
    left: 16px;
    pointer-events: none;
    user-select: none;
  }
  .cp3-quote p {
    margin: 0;
    font-size: 15.5px;
    line-height: 1.8;
    color: var(--cp-gray-700);
    padding-top: 20px;
    font-style: italic;
  }

  /* About sidebar card */
  .cp3-about__sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 80px;
  }
  .cp3-quick-info {
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    box-shadow: var(--cp-shadow-md);
    overflow: hidden;
  }
  .cp3-quick-info__header {
    background: linear-gradient(135deg, var(--cp-green-800), var(--cp-green-950));
    color: var(--cp-white);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cp3-quick-info__header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .cp3-quick-info__body {
    padding: 4px 0;
  }
  .cp3-quick-info__row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--cp-gray-50);
    transition: background .2s;
  }
  .cp3-quick-info__row:last-child { border-bottom: none; }
  .cp3-quick-info__row:hover { background: var(--cp-green-30); }
  .cp3-quick-info__icon {
    width: 32px;
    height: 32px;
    background: var(--cp-green-50);
    color: var(--cp-green-700);
    display: grid;
    place-items: center;
    border-radius: var(--cp-radius-sm);
    flex-shrink: 0;
  }
  .cp3-quick-info__label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--cp-gray-400);
    margin-bottom: 2px;
  }
  .cp3-quick-info__val {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--cp-gray-800);
  }

  /* Trust block */
  .cp3-trust {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: var(--cp-gray-200);
    border: 1px solid var(--cp-gray-200);
    overflow: hidden;
  }
  .cp3-trust__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 12px;
    background: var(--cp-white);
    text-align: center;
    transition: background .2s;
    cursor: default;
  }
  .cp3-trust__item:hover { background: var(--cp-green-30); }
  .cp3-trust__icon {
    width: 40px;
    height: 40px;
    background: var(--cp-green-50);
    color: var(--cp-green-700);
    display: grid;
    place-items: center;
    border-radius: 50%;
  }
  .cp3-trust__label {
    font-size: 11px;
    font-weight: 700;
    color: var(--cp-gray-600);
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  /* ══════════════════════════════════════════
     HIGHLIGHTS
  ══════════════════════════════════════════ */
  .cp3-highlights-grid {
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    background: var(--cp-gray-200);
  }
  .cp3-hl-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
    background: var(--cp-white);
    position: relative;
    overflow: hidden;
    transition: background .25s;
  }
  .cp3-hl-card::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--cp-green-500), var(--cp-green-300));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .35s ease;
  }
  .cp3-hl-card:hover {
    background: var(--cp-green-30);
  }
  .cp3-hl-card:hover::after {
    transform: scaleX(1);
  }
  .cp3-hl-card__num {
    width: 36px;
    height: 36px;
    background: var(--cp-green-700);
    color: var(--cp-white);
    font-family: 'Playfair Display', serif;
    font-size: 14px;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: var(--cp-radius-sm);
  }
  .cp3-hl-card p {
    margin: 0;
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--cp-gray-700);
    font-weight: 500;
    padding-top: 6px;
  }

  /* ══════════════════════════════════════════
     DESTINATIONS PREVIEW
  ══════════════════════════════════════════ */
  .cp3-dest-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: clamp(32px, 4vw, 48px);
  }
  .cp3-dest-grid {
    display: grid;
    gap: clamp(20px, 3vw, 32px);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  }
  .cp3-dest-skeleton {
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    overflow: hidden;
    border-radius: var(--cp-radius-md);
  }
  .cp3-shimmer {
    background: linear-gradient(
      90deg,
      var(--cp-gray-100) 0%,
      var(--cp-gray-200) 50%,
      var(--cp-gray-100) 100%
    );
    background-size: 200% 100%;
    animation: cpShimmer 1.8s ease-in-out infinite;
  }

  /* ══════════════════════════════════════════
     GALLERY
  ══════════════════════════════════════════ */
  .cp3-gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 3px;
    border-radius: var(--cp-radius-md);
    overflow: hidden;
  }
  .cp3-gallery-item {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    cursor: pointer;
    background: var(--cp-gray-200);
  }
  .cp3-gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .7s cubic-bezier(.16,1,.3,1);
  }
  .cp3-gallery-item:hover img { transform: scale(1.12); }
  .cp3-gallery-item__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(2,44,34,.8));
    opacity: 0;
    transition: opacity .35s ease;
    display: flex;
    align-items: flex-end;
    padding: 16px;
  }
  .cp3-gallery-item:hover .cp3-gallery-item__overlay { opacity: 1; }
  .cp3-gallery-item__label {
    color: var(--cp-white);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  /* Hero gallery item */
  .cp3-gallery-item--hero {
    grid-column: span 2;
    grid-row: span 2;
    aspect-ratio: unset;
  }
  @media (max-width: 640px) {
    .cp3-gallery-item--hero {
      grid-column: span 1;
      grid-row: span 1;
      aspect-ratio: 4/3;
    }
  }

  /* Gallery Lightbox */
  .cp3-lb {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cp3-lb__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(2,14,10,.95);
    backdrop-filter: blur(10px);
  }
  .cp3-lb__close {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 2;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.2);
    color: var(--cp-white);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: var(--cp-transition);
  }
  .cp3-lb__close:hover { background: rgba(255,255,255,.25); }
  .cp3-lb__stage {
    position: relative;
    z-index: 1;
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cp3-lb__img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: var(--cp-radius-md);
    box-shadow: 0 32px 80px rgba(0,0,0,.6);
  }
  .cp3-lb__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.2);
    color: var(--cp-white);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: var(--cp-transition);
  }
  .cp3-lb__arrow:hover { background: var(--cp-green-700); border-color: var(--cp-green-700); }
  .cp3-lb__arrow--prev { left: 20px; }
  .cp3-lb__arrow--next { right: 20px; }
  .cp3-lb__footer {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .cp3-lb__thumbs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 0 16px;
    scrollbar-width: none;
  }
  .cp3-lb__thumbs::-webkit-scrollbar { display: none; }
  .cp3-lb__thumb {
    width: 52px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    flex-shrink: 0;
    opacity: .6;
    transition: var(--cp-transition);
    background: none;
    padding: 0;
  }
  .cp3-lb__thumb.active { border-color: var(--cp-green-400); opacity: 1; }
  .cp3-lb__thumb img { width: 100%; height: 100%; object-fit: cover; }
  .cp3-lb__counter {
    color: rgba(255,255,255,.7);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .08em;
  }

  /* ══════════════════════════════════════════
     BEST TIME
  ══════════════════════════════════════════ */
  .cp3-besttime {
    display: grid;
    gap: clamp(20px, 3vw, 36px);
  }
  @media (min-width: 760px) {
    .cp3-besttime { grid-template-columns: 1fr 1fr; }
  }
  .cp3-besttime__hero {
    background: linear-gradient(135deg, var(--cp-green-800), var(--cp-green-950));
    color: var(--cp-white);
    padding: clamp(28px, 4vw, 44px);
    position: relative;
    overflow: hidden;
    border-radius: var(--cp-radius-md);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cp3-besttime__hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 80%, rgba(16,185,129,.2), transparent 60%);
  }
  .cp3-besttime__label {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--cp-green-300);
    position: relative;
    z-index: 1;
  }
  .cp3-besttime__val {
    font-family: 'Playfair Display', serif;
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 700;
    line-height: 1.2;
    position: relative;
    z-index: 1;
  }
  .cp3-besttime__note {
    font-size: 14px;
    line-height: 1.75;
    color: rgba(255,255,255,.75);
    position: relative;
    z-index: 1;
    margin: 0;
  }
  .cp3-besttime__temps {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  .cp3-besttime__cal {
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    padding: clamp(20px, 3vw, 32px);
    border-radius: var(--cp-radius-md);
    box-shadow: var(--cp-shadow-sm);
  }
  .cp3-besttime__cal-label {
    display: block;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .12em;
    color: var(--cp-gray-400);
    margin-bottom: 16px;
  }
  .cp3-besttime__months {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    margin-bottom: 20px;
  }
  @media (max-width: 480px) {
    .cp3-besttime__months { grid-template-columns: repeat(4, 1fr); }
  }
  .cp3-besttime__month {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 6px;
    border-radius: var(--cp-radius-sm);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    transition: var(--cp-transition);
    cursor: default;
  }
  .cp3-besttime__month--best {
    background: var(--cp-green-700);
    color: var(--cp-white);
  }
  .cp3-besttime__month--avoid {
    background: #fef2f2;
    color: #ef4444;
  }
  .cp3-besttime__month--ok {
    background: var(--cp-gray-100);
    color: var(--cp-gray-600);
  }
  .cp3-besttime__pip {
    width: 4px;
    height: 4px;
    border-radius: 50%;
  }
  .cp3-besttime__month--best .cp3-besttime__pip { background: rgba(255,255,255,.6); }
  .cp3-besttime__month--avoid .cp3-besttime__pip { background: #ef4444; }
  .cp3-besttime__month--ok .cp3-besttime__pip { background: var(--cp-gray-400); }
  .cp3-besttime__legend {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .cp3-besttime__legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 600;
    color: var(--cp-gray-500);
  }
  .cp3-besttime__legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .cp3-besttime__legend-dot--best { background: var(--cp-green-500); }
  .cp3-besttime__legend-dot--avoid { background: #ef4444; }
  .cp3-besttime__legend-dot--ok { background: var(--cp-gray-400); }

  /* ══════════════════════════════════════════
     TIPS
  ══════════════════════════════════════════ */
  .cp3-tips-grid {
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
    background: var(--cp-gray-200);
  }
  .cp3-tip {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 24px;
    background: var(--cp-white);
    transition: background .25s;
  }
  .cp3-tip:hover { background: var(--cp-green-30); }
  .cp3-tip__num {
    width: 38px;
    height: 38px;
    background: var(--cp-green-700);
    color: var(--cp-white);
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: var(--cp-radius-sm);
  }
  .cp3-tip__text {
    font-size: 14.5px;
    line-height: 1.75;
    color: var(--cp-gray-700);
    padding-top: 6px;
    font-weight: 500;
  }

  /* ══════════════════════════════════════════
     ALERTS
  ══════════════════════════════════════════ */
  .cp3-alert {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 24px;
    border-radius: var(--cp-radius-md);
    border: 1px solid;
  }
  .cp3-alert--amber {
    background: #fffbeb;
    border-color: #fcd34d;
    color: #92400e;
  }
  .cp3-alert--red {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #991b1b;
  }
  .cp3-alert--green {
    background: var(--cp-green-30);
    border-color: var(--cp-green-200);
    color: var(--cp-green-800);
  }
  .cp3-alert__icon { flex-shrink: 0; margin-top: 2px; }
  .cp3-alert__title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
  .cp3-alert__text { font-size: 14px; line-height: 1.65; opacity: .85; }

  /* ══════════════════════════════════════════
     FAQ ACCORDION
  ══════════════════════════════════════════ */
  .cp3-faqs {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: var(--cp-gray-200);
    border-radius: var(--cp-radius-md);
    overflow: hidden;
  }
  .cp3-faq {
    background: var(--cp-white);
    transition: background .2s;
  }
  .cp3-faq:hover { background: var(--cp-green-30); }
  .cp3-faq__btn {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 20px 24px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 14.5px;
    font-weight: 600;
    color: var(--cp-gray-800);
    text-align: left;
    transition: color .2s;
  }
  .cp3-faq.open .cp3-faq__btn { color: var(--cp-green-700); }
  .cp3-faq__num {
    width: 32px;
    height: 32px;
    background: var(--cp-green-50);
    color: var(--cp-green-700);
    border-radius: var(--cp-radius-sm);
    font-size: 12px;
    font-weight: 800;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    font-family: 'Playfair Display', serif;
    transition: var(--cp-transition);
  }
  .cp3-faq.open .cp3-faq__num {
    background: var(--cp-green-700);
    color: var(--cp-white);
  }
  .cp3-faq__text { flex: 1; }
  .cp3-faq__toggle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--cp-gray-100);
    color: var(--cp-gray-500);
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: var(--cp-transition);
  }
  .cp3-faq.open .cp3-faq__toggle {
    background: var(--cp-green-700);
    color: var(--cp-white);
    transform: rotate(45deg);
  }
  .cp3-faq__answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height .4s cubic-bezier(.4,0,.2,1);
  }
  .cp3-faq.open .cp3-faq__answer { max-height: 400px; }
  .cp3-faq__answer-inner {
    padding: 0 24px 20px 72px;
    font-size: 14px;
    line-height: 1.8;
    color: var(--cp-gray-600);
  }

  /* ══════════════════════════════════════════
     REVIEWS
  ══════════════════════════════════════════ */
  .cp3-reviews-agg {
    display: flex;
    gap: clamp(24px, 4vw, 48px);
    align-items: center;
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    padding: clamp(24px, 3vw, 40px);
    margin-bottom: 36px;
    box-shadow: var(--cp-shadow-sm);
    border-radius: var(--cp-radius-md);
    flex-wrap: wrap;
  }
  .cp3-reviews-agg__score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
    min-width: 100px;
  }
  .cp3-reviews-agg__num {
    font-family: 'Playfair Display', serif;
    font-size: 56px;
    font-weight: 900;
    line-height: 1;
    color: var(--cp-green-700);
  }
  .cp3-reviews-agg__stars {
    display: flex;
    gap: 4px;
    color: #f59e0b;
  }
  .cp3-reviews-agg__total {
    font-size: 12px;
    font-weight: 600;
    color: var(--cp-gray-400);
    letter-spacing: .04em;
  }
  .cp3-reviews-agg__bars {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cp3-rev-bar {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cp3-rev-bar__label {
    font-size: 12px;
    font-weight: 700;
    color: var(--cp-gray-500);
    width: 24px;
  }
  .cp3-rev-bar__track {
    flex: 1;
    height: 6px;
    background: var(--cp-gray-100);
    border-radius: 3px;
    overflow: hidden;
  }
  .cp3-rev-bar__fill {
    height: 100%;
    background: linear-gradient(90deg, var(--cp-green-500), var(--cp-green-400));
    border-radius: 3px;
    transition: width 1s ease;
  }
  .cp3-rev-bar__pct {
    font-size: 11px;
    font-weight: 600;
    color: var(--cp-gray-400);
    width: 32px;
    text-align: right;
  }
  .cp3-reviews-grid {
    display: grid;
    gap: clamp(16px, 2.5vw, 24px);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  }
  .cp3-rev-card {
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    padding: 24px;
    border-radius: var(--cp-radius-md);
    box-shadow: var(--cp-shadow-sm);
    transition: var(--cp-transition);
    position: relative;
    overflow: hidden;
  }
  .cp3-rev-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--cp-green-500), var(--cp-green-300));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .35s ease;
  }
  .cp3-rev-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--cp-shadow-lg);
  }
  .cp3-rev-card:hover::before { transform: scaleX(1); }
  .cp3-rev-card__top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }
  .cp3-rev-card__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--cp-green-100);
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 700;
    color: var(--cp-green-700);
    flex-shrink: 0;
  }
  .cp3-rev-card__avatar img { width: 100%; height: 100%; object-fit: cover; }
  .cp3-rev-card__name { font-size: 14px; font-weight: 700; color: var(--cp-gray-900); }
  .cp3-rev-card__meta { font-size: 12px; color: var(--cp-gray-400); font-weight: 500; }
  .cp3-rev-card__stars {
    display: flex;
    gap: 3px;
    color: #f59e0b;
    margin-bottom: 12px;
  }
  .cp3-star--on { color: #f59e0b; }
  .cp3-star--off { color: var(--cp-gray-200); }
  .cp3-rev-card__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--cp-gray-800);
    margin: 0 0 8px;
    font-style: italic;
  }
  .cp3-rev-card__body {
    font-size: 14px;
    line-height: 1.75;
    color: var(--cp-gray-600);
    margin: 0;
  }
  .cp3-rev-card__helpful {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--cp-gray-400);
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--cp-gray-100);
    font-weight: 600;
  }

  /* ══════════════════════════════════════════
     CTA BANNER
  ══════════════════════════════════════════ */
  .cp3-cta {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, var(--cp-green-950) 0%, var(--cp-green-900) 50%, var(--cp-green-800) 100%);
    padding: clamp(64px, 9vw, 120px) 0;
    text-align: center;
    color: var(--cp-white);
  }
  .cp3-cta__orbs {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .cp3-cta__orb {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,.25), transparent 70%);
    animation: cpOrb 8s ease-in-out infinite;
  }
  .cp3-cta__inner {
    position: relative;
    z-index: 1;
    max-width: 760px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 48px);
  }
  .cp3-cta__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .2em;
    color: var(--cp-green-300);
    margin-bottom: 20px;
  }
  .cp3-cta__title {
    margin: 0 0 20px;
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 5vw, 52px);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -.025em;
  }
  .cp3-cta__desc {
    margin: 0 auto 36px;
    font-size: 16px;
    line-height: 1.8;
    color: rgba(255,255,255,.8);
    max-width: 580px;
  }
  .cp3-cta__actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
  .cp3-cta__trust {
    display: flex;
    gap: 28px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .cp3-cta__trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,.65);
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  /* ══════════════════════════════════════════
     LOADING / ERROR
  ══════════════════════════════════════════ */
  .cp3-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--cp-white);
  }
  .cp3-error {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--cp-white);
    padding: 24px;
  }
  .cp3-error__inner {
    max-width: 480px;
    text-align: center;
    padding: 56px 40px;
    background: var(--cp-white);
    border: 1px solid #fecaca;
    border-radius: var(--cp-radius-xl);
    box-shadow: 0 16px 48px rgba(239,68,68,.08);
  }
  .cp3-error__icon {
    width: 72px;
    height: 72px;
    background: #fef2f2;
    border-radius: 50%;
    display: grid;
    place-items: center;
    margin: 0 auto 20px;
    color: #ef4444;
  }
  .cp3-error__h3 {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: #991b1b;
    margin: 0 0 10px;
  }
  .cp3-error__p {
    font-size: 14.5px;
    line-height: 1.7;
    color: var(--cp-gray-500);
    margin: 0 0 28px;
  }
  .cp3-error__btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ══════════════════════════════════════════
     HOW TO GET THERE MAP
  ══════════════════════════════════════════ */
  .cp3-getthere {
    display: grid;
    gap: clamp(20px, 3vw, 36px);
  }
  @media (min-width: 900px) {
    .cp3-getthere--map {
      grid-template-columns: 1fr 1fr;
    }
  }
  .cp3-getthere__map {
    border-radius: var(--cp-radius-md);
    overflow: hidden;
    min-height: 340px;
    box-shadow: var(--cp-shadow-md);
  }
  .cp3-getthere__map iframe {
    width: 100%;
    height: 100%;
    min-height: 340px;
    border: none;
  }
  .cp3-getthere__rows {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: var(--cp-gray-200);
    border-radius: var(--cp-radius-md);
    overflow: hidden;
  }
  .cp3-info-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    background: var(--cp-white);
    transition: background .2s;
  }
  .cp3-info-row:hover { background: var(--cp-green-30); }
  .cp3-info-row__icon {
    width: 40px;
    height: 40px;
    background: var(--cp-green-50);
    color: var(--cp-green-700);
    display: grid;
    place-items: center;
    border-radius: var(--cp-radius-sm);
    flex-shrink: 0;
  }
  .cp3-info-row__label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--cp-gray-400);
    margin-bottom: 3px;
  }
  .cp3-info-row__val {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--cp-gray-800);
  }

  /* ══════════════════════════════════════════
     ACTIVITIES
  ══════════════════════════════════════════ */
  .cp3-act-grid {
    display: grid;
    gap: clamp(12px, 2vw, 20px);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
  }
  .cp3-act-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 28px 20px;
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    border-radius: var(--cp-radius-md);
    text-align: center;
    cursor: default;
    transition: var(--cp-transition);
    position: relative;
    overflow: hidden;
  }
  .cp3-act-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--cp-green-30), var(--cp-green-50));
    opacity: 0;
    transition: opacity .3s;
  }
  .cp3-act-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--cp-shadow-green);
    border-color: var(--cp-green-200);
  }
  .cp3-act-card:hover::before { opacity: 1; }
  .cp3-act-card__ring {
    position: relative;
    z-index: 1;
    width: 56px;
    height: 56px;
    background: var(--cp-green-700);
    color: var(--cp-white);
    border-radius: 50%;
    display: grid;
    place-items: center;
    transition: var(--cp-transition);
  }
  .cp3-act-card:hover .cp3-act-card__ring {
    background: var(--cp-green-800);
    transform: scale(1.1);
  }
  .cp3-act-card h4 {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--cp-gray-700);
    line-height: 1.4;
  }

  /* ══════════════════════════════════════════
     WILDLIFE PILLS
  ══════════════════════════════════════════ */
  .cp3-wildlife-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .cp3-wildlife-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    background: var(--cp-white);
    border: 1.5px solid var(--cp-gray-200);
    border-radius: 2px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--cp-gray-700);
    transition: var(--cp-transition);
    cursor: default;
  }
  .cp3-wildlife-pill:hover {
    border-color: var(--cp-green-400);
    background: var(--cp-green-30);
    color: var(--cp-green-800);
    transform: translateY(-2px);
  }
  .cp3-wildlife-pill__dot {
    width: 8px;
    height: 8px;
    background: var(--cp-green-500);
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ══════════════════════════════════════════
     PRACTICAL INFO
  ══════════════════════════════════════════ */
  .cp3-prac-grid {
    display: grid;
    gap: clamp(16px, 2.5vw, 24px);
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
    margin-top: 24px;
  }
  .cp3-prac-card {
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    border-radius: var(--cp-radius-md);
    overflow: hidden;
    box-shadow: var(--cp-shadow-sm);
    transition: var(--cp-transition);
  }
  .cp3-prac-card:hover {
    box-shadow: var(--cp-shadow-md);
    transform: translateY(-2px);
  }
  .cp3-prac-card__hdr {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 20px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--cp-white);
  }
  .cp3-prac-card__hdr--green { background: var(--cp-green-700); }
  .cp3-prac-card__hdr--amber { background: #d97706; }
  .cp3-prac-card__hdr--blue { background: #1d4ed8; }
  .cp3-prac-card__hdr--purple { background: #7c3aed; }
  .cp3-prac-card__body { padding: 20px; }
  .cp3-prac-card__note {
    font-size: 13.5px;
    line-height: 1.7;
    color: var(--cp-gray-600);
    margin: 14px 0 0;
  }
  .cp3-prac-card__kv {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--cp-gray-100);
    font-size: 13px;
    gap: 12px;
  }
  .cp3-prac-card__kv:last-child { border-bottom: none; }
  .cp3-prac-card__kv span:first-child { color: var(--cp-gray-500); font-weight: 600; }
  .cp3-prac-card__kv span:last-child { color: var(--cp-gray-800); font-weight: 700; text-align: right; }
  .cp3-prac-card__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cp3-prac-card__list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--cp-gray-700);
  }
  .cp3-prac-card__list li::before {
    content: "";
    width: 6px;
    height: 6px;
    background: var(--cp-green-500);
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 7px;
  }
  .cp3-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .cp3-chip-row--center { justify-content: center; }
  .cp3-mini-label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .12em;
    color: var(--cp-gray-400);
    margin-bottom: 10px;
  }
  .cp3-prac-card__group { margin-bottom: 14px; }

  /* ══════════════════════════════════════════
     SIDEBAR / CONTACT CARD
  ══════════════════════════════════════════ */
  .cp3-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: sticky;
    top: 80px;
  }
  .cp3-sidebar-card {
    background: var(--cp-white);
    border: 1px solid var(--cp-gray-200);
    border-radius: var(--cp-radius-lg);
    overflow: hidden;
    box-shadow: var(--cp-shadow-md);
  }
  .cp3-sidebar-card__header {
    background: linear-gradient(135deg, var(--cp-green-800), var(--cp-green-950));
    padding: 28px 24px;
    color: var(--cp-white);
    position: relative;
    overflow: hidden;
  }
  .cp3-sidebar-card__header::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 80%, rgba(16,185,129,.3), transparent 60%);
  }
  .cp3-sidebar-card__globe {
    position: relative;
    z-index: 1;
    width: 48px;
    height: 48px;
    background: rgba(255,255,255,.1);
    border-radius: 50%;
    display: grid;
    place-items: center;
    margin-bottom: 14px;
    color: var(--cp-green-300);
  }
  .cp3-sidebar-card__header h3 {
    margin: 0 0 6px;
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }
  .cp3-sidebar-card__header p {
    margin: 0;
    font-size: 13px;
    color: rgba(255,255,255,.75);
    line-height: 1.6;
    position: relative;
    z-index: 1;
  }
  .cp3-sidebar-card__body { padding: 20px; }
  .cp3-sidebar-card__btns { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .cp3-sidebar-card__divider {
    height: 1px;
    background: var(--cp-gray-100);
    margin: 20px 0;
  }
  .cp3-sidebar-card__info { display: flex; flex-direction: column; gap: 2px; }
  .cp3-sidebar-card__row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--cp-radius-sm);
    transition: background .2s;
  }
  .cp3-sidebar-card__row:hover { background: var(--cp-green-30); }
  .cp3-sidebar-card__row-icon {
    width: 32px;
    height: 32px;
    background: var(--cp-green-50);
    color: var(--cp-green-700);
    display: grid;
    place-items: center;
    border-radius: var(--cp-radius-sm);
    flex-shrink: 0;
  }
  .cp3-sidebar-card__row-label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--cp-gray-400);
    margin-bottom: 2px;
  }
  .cp3-sidebar-card__row-val {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--cp-gray-800);
  }
  .cp3-sidebar-card__trust {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: var(--cp-gray-100);
    margin-top: 20px;
    border-radius: var(--cp-radius-md);
    overflow: hidden;
  }
  .cp3-sidebar-card__trust-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 8px;
    background: var(--cp-white);
    text-align: center;
  }
  .cp3-sidebar-card__trust-icon { color: var(--cp-green-700); }
  .cp3-sidebar-card__trust-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--cp-gray-500);
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  /* ══════════════════════════════════════════
     2-COL LAYOUT
  ══════════════════════════════════════════ */
  .cp3-layout-2col {
    display: grid;
    gap: clamp(32px, 5vw, 64px);
  }
  @media (min-width: 1024px) {
    .cp3-layout-2col {
      grid-template-columns: 1fr 380px;
      align-items: start;
    }
  }
  @media (min-width: 1280px) {
    .cp3-layout-2col {
      grid-template-columns: 1fr 420px;
    }
  }

  /* ══════════════════════════════════════════
     VIDEO PLAYER WRAPPER
  ══════════════════════════════════════════ */
  .cp3-video-wrap {
    border-radius: var(--cp-radius-lg);
    overflow: hidden;
    box-shadow: var(--cp-shadow-xl);
    background: var(--cp-gray-900);
  }

  /* ══════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════ */
  @media (max-width: 640px) {
    .cp3-hero__flag { width: 56px; height: 56px; font-size: 28px; }
    .cp3-hero__ctas { flex-direction: column; }
    .cp3-btn { justify-content: center; width: 100%; }
    .cp3-overview__actions { flex-direction: column; }
    .cp3-stats-bar__inner { gap: 0; }
    .cp3-stat { padding: 14px 16px; }
    .cp3-cta__actions { flex-direction: column; align-items: center; }
    .cp3-cta__actions .cp3-btn { width: auto; }
    .cp3-faq__answer-inner { padding-left: 24px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cp3 *, .cp3 *::before, .cp3 *::after {
      animation-duration: .01ms !important;
      transition-duration: .01ms !important;
    }
  }
`;

/* ── Inject CSS ── */
function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cp3-styles")) return;
  const s = document.createElement("style");
  s.id = "cp3-styles";
  s.textContent = PAGE_CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const txt = (v) => {
  if (!v) return "";
  if (typeof v === "string" || typeof v === "number") return String(v).trim();
  if (Array.isArray(v)) return v.map(txt).filter(Boolean).join(", ");
  if (typeof v === "object")
    return txt(v.name || v.label || v.value || v.code || v.title || "");
  return "";
};

const pick = (...vals) => {
  for (const v of vals) {
    const t = txt(v);
    if (t) return t;
  }
  return "";
};

const splitToArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(splitToArray).filter(Boolean);
  if (typeof value === "object")
    return splitToArray(value.name || value.label || value.value || "");
  return String(value)
    .split(/[,·|/•;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const formatPopulation = (p) => {
  const n = Number(p);
  if (!n || isNaN(n)) return "";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

const FACT_ICONS = {
  Capital: FiMapPin,
  Currency: FiDollarSign,
  "Best Time to Visit": FiSun,
  Languages: FiBookOpen,
  Population: FiUsers,
  "Time Zone": FiClock,
  Visa: FiShield,
  Climate: FiThermometer,
  Region: FiGlobe,
  Electricity: FiFeather,
};

const extractFacts = (c) => {
  if (!c) return [];
  const facts = [];
  const add = (label, value) => {
    const v = txt(value);
    if (v) facts.push({ label, value: v, icon: FACT_ICONS[label] || FiInfo });
  };
  add("Capital", pick(c.capital, c.capitalCity));
  add("Currency", pick(c.currency, c.currencies, c.money));
  add("Best Time to Visit", pick(c.bestTimeToVisit, c.best_time_to_visit, c.bestSeason));
  add("Languages", pick(c.languages, c.language, c.officialLanguages));
  const pop = formatPopulation(c.population || c.populationCount);
  if (pop) facts.push({ label: "Population", value: pop, icon: FiUsers });
  add("Time Zone", pick(c.timezone, c.timeZone, c.time_zone));
  add("Visa", pick(c.visaInfo, c.visa_info, c.visaRequirements));
  add("Climate", pick(c.climate, c.weatherInfo));
  add("Region", pick(c.region, c.continent, c.subRegion));
  return facts;
};

const extractHighlights = (c) => {
  if (!c) return [];
  const sources = [
    c.knownFor, c.highlights, c.topActivities, c.signatureExperiences,
    c.interests, c.tags, c.wildlifeHighlights, c.culturalHighlights,
  ];
  const unique = new Set();
  sources.forEach((src) => splitToArray(src).forEach((v) => unique.add(v)));
  return Array.from(unique).slice(0, 12);
};

const extractTips = (c) => {
  if (!c) return [];
  const sources = [c.travelTips, c.travel_tips, c.tips, c.advisories, c.safety];
  for (const src of sources) {
    const arr = splitToArray(src);
    if (arr.length) return arr.slice(0, 6);
  }
  return [];
};

const extractGallery = (c) => {
  if (!c) return [];
  const sources = [c.galleryImages, c.gallery, c.images, c.photos];
  for (const src of sources) {
    if (Array.isArray(src) && src.length > 0) {
      return src
        .map((img) =>
          typeof img === "string" ? img : img?.url || img?.src || ""
        )
        .filter(Boolean)
        .slice(0, 10);
    }
  }
  return [];
};

const getHero = (c) =>
  pick(
    c?.heroImage, c?.hero_image, c?.coverImage, c?.cover_image,
    c?.image, c?.bannerImage, c?.banner_image
  ) || (Array.isArray(c?.images) ? c.images[0] : "");

const getFlag = (c) => pick(c?.flagUrl, c?.flag_url, c?.flag);
const getRegion = (c) => pick(c?.region, c?.continent, c?.subRegion);
const getDestsCount = (c) =>
  c?.destinationsCount ?? c?.destinations_count ?? c?.destinationCount ?? c?.totalDestinations ?? null;
const getRating = (c) => c?.averageRating ?? c?.average_rating ?? c?.rating ?? null;
const getTagline = (c) =>
  pick(c?.tagline, c?.shortDescription, c?.short_description, c?.intro);
const getDesc = (c) =>
  pick(c?.description, c?.overview, c?.about, c?.summary, c?.content);
const getReviews = (c) => c?.reviews || [];
const getReviewAgg = (c) => c?.reviewAggregate || null;
const getFaqs = (c) => c?.faqs || [];
const getWildlife = (c) => {
  const src = c?.wildlife || c?.animals || c?.fauna || [];
  if (Array.isArray(src)) return src.map((x) => txt(x)).filter(Boolean).slice(0, 20);
  return splitToArray(src).slice(0, 20);
};
const getActivities = (c) => {
  const src = c?.activities || c?.topActivities || c?.things_to_do || [];
  if (Array.isArray(src)) return src.map((x) => txt(x)).filter(Boolean).slice(0, 12);
  return splitToArray(src).slice(0, 12);
};
const getHowToGetThere = (c) => c?.howToGetThere || null;
const getPracticalInfo = (c) => c?.practicalInfo || null;
const getAlerts = (c) => [
  { icon: <FiSun size={18} />, title: "Local Tips", text: c?.localTips, theme: "amber" },
  { icon: <FiAlertCircle size={18} />, title: "Safety Info", text: c?.safetyInfo, theme: "red" },
].filter((a) => a.text);

/* ═══════════════════════════════════════════════════════
   SIMPLE ICON WRAPPER (for inline SVGs without fi)
═══════════════════════════════════════════════════════ */
const SVGIcon = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/* ═══════════════════════════════════════════════════════
   SCROLL PROGRESS
═══════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const [progress, setProgress] = React.useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="cp3-scroll-bar">
      <div className="cp3-scroll-bar__fill" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════ */
const HeroSection = ({ country, hero, flag, region, tagline, destsCount, rating, slug }) => {
  const [slide, setSlide] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  // Gather all hero images
  const allImgs = useMemo(() => {
    const imgs = [];
    if (hero) imgs.push(hero);
    if (Array.isArray(country.images)) imgs.push(...country.images.filter(Boolean));
    if (Array.isArray(country.gallery)) {
      country.gallery.forEach((g) => {
        const url = typeof g === "string" ? g : g?.url || g?.src || "";
        if (url) imgs.push(url);
      });
    }
    return [...new Set(imgs)].slice(0, 5);
  }, [country, hero]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (allImgs.length <= 1) return;
    const iv = setInterval(() => setSlide((p) => (p + 1) % allImgs.length), 7000);
    return () => clearInterval(iv);
  }, [allImgs.length]);

  const isFlagEmoji = flag && !flag.startsWith("http") && !flag.includes("/");
  const isFlagUrl = flag && (flag.startsWith("http") || flag.includes("/"));

  return (
    <header className="cp3-hero">
      {/* Slides */}
      <div className="cp3-hero__slides">
        {allImgs.length > 0 ? (
          allImgs.map((img, i) => (
            <div key={i} className={`cp3-hero__slide ${slide === i ? "active" : ""}`}>
              <img src={img} alt={country.name} loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))
        ) : (
          <div className="cp3-hero__slide active cp3-hero__slide--empty">
            <FiGlobe size={120} style={{ opacity: 0.08, color: "#fff" }} />
          </div>
        )}
      </div>
      <div className="cp3-hero__overlay" />
      <div className="cp3-hero__overlay-top" />

      {/* Dots */}
      {allImgs.length > 1 && (
        <div className="cp3-hero__dots">
          {allImgs.map((_, i) => (
            <button
              key={i}
              className={`cp3-hero__dot ${slide === i ? "active" : ""}`}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Breadcrumb nav */}
      <nav className="cp3-hero__nav" aria-label="Breadcrumb">
        <div className="cp3-container">
          <ol className="cp3-hero__crumbs">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/destinations">Destinations</Link></li>
            <li aria-current="page">{country.name}</li>
          </ol>
        </div>
      </nav>

      {/* Body */}
      <div className="cp3-hero__body">
        <div className="cp3-container">
          {/* Chips */}
          <div className="cp3-hero__chips">
            {country.isFeatured && (
              <span className="cp3-chip cp3-chip--gold">
                <FiAward size={12} /> Featured
              </span>
            )}
            {country.isPopular && (
              <span className="cp3-chip cp3-chip--gold">
                <FiTrendingUp size={12} /> Popular
              </span>
            )}
            {region && (
              <span className="cp3-chip cp3-chip--glass">
                <FiGlobe size={12} /> {region}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="cp3-hero__title">{country.name}</h1>

          {tagline && <p className="cp3-hero__tagline">{tagline}</p>}

          {/* Meta */}
          <div className="cp3-hero__meta">
            {rating != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="cp3-chip cp3-chip--dark">
                  <FiStar size={13} style={{ color: "#fbbf24" }} />
                  <span style={{ color: "#fff", fontWeight: 700 }}>{Number(rating).toFixed(1)}</span>
                </span>
              </div>
            )}
            {destsCount != null && (
              <span className="cp3-chip cp3-chip--dark">
                <FiCamera size={12} /> {destsCount} Destinations
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="cp3-hero__ctas">
            <Link to={`/country/${slug}/destinations`} className="cp3-btn cp3-btn--primary cp3-btn--lg">
              <FiCompass size={16} /> Explore Destinations
              <FiArrowRight size={15} />
            </Link>
            <button
              className="cp3-btn cp3-btn--ghost-dark cp3-btn--lg"
              onClick={() =>
                document.getElementById("cp3-overview")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Discover More
            </button>
          </div>
        </div>
      </div>

      {/* Flag */}
      <div className="cp3-hero__flag" aria-hidden="true">
        {isFlagUrl ? <img src={flag} alt="flag" /> :
         isFlagEmoji ? <span>{flag}</span> :
         <FiGlobe size={28} color="#fff" />}
      </div>
    </header>
  );
};

/* ═══════════════════════════════════════════════════════
   STATS BAR
═══════════════════════════════════════════════════════ */
const StatsBar = ({ country, facts }) => {
  const stats = facts.slice(0, 6);
  if (!stats.length) return null;
  return (
    <div className="cp3-stats-bar">
      <div className="cp3-container">
        <div className="cp3-stats-bar__inner">
          {stats.map((fact, i) => (
            <div key={i} className="cp3-stat">
              <div className="cp3-stat__icon">
                <fact.icon size={16} />
              </div>
              <div className="cp3-stat__body">
                <span className="cp3-stat__label">{fact.label}</span>
                <span className="cp3-stat__val">{fact.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SECTION TITLE
═══════════════════════════════════════════════════════ */
const SecTitle = ({ eyebrow, children, sub, center, icon: Icon }) => (
  <div className={`cp3-sec-title ${center ? "cp3-sec-title--center" : ""}`}>
    <div className="cp3-sec-title__eyebrow">
      <span className="cp3-sec-title__eyebrow-line" />
      {Icon && <Icon size={14} />}
      {eyebrow}
    </div>
    <h3 className="cp3-sec-title__h3">{children}</h3>
    {sub && <p className="cp3-sec-title__sub">{sub}</p>}
    <div className="cp3-sec-title__bar" />
  </div>
);

/* ═══════════════════════════════════════════════════════
   OVERVIEW PANEL
═══════════════════════════════════════════════════════ */
const OverviewPanel = ({ country, hero, flag, region, tagline, destsCount, rating, slug, navigate }) => {
  const isFlagEmoji = flag && !flag.startsWith("http") && !flag.includes("/");
  const isFlagUrl = flag && (flag.startsWith("http") || flag.includes("/"));

  return (
    <AnimatedSection animation="fadeInUp">
      <div className="cp3-overview">
        {/* Media */}
        <div className="cp3-overview__media">
          {hero ? (
            <img src={hero} alt={country.name} className="cp3-overview__img" />
          ) : (
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, var(--cp-green-950), var(--cp-green-800))",
              display: "grid", placeItems: "center",
            }}>
              <FiGlobe size={80} style={{ color: "rgba(255,255,255,.15)" }} />
            </div>
          )}
          <div className="cp3-overview__media-overlay" />
          <div className="cp3-overview__badges">
            {country.isFeatured && (
              <span className="cp3-chip cp3-chip--green"><FiAward size={12} /> Featured</span>
            )}
            {region && (
              <span className="cp3-chip cp3-chip--glass"><FiGlobe size={12} /> {region}</span>
            )}
          </div>
          <div className="cp3-overview__flag">
            {isFlagUrl ? <img src={flag} alt="flag" /> :
             isFlagEmoji ? <span>{flag}</span> :
             <FiGlobe size={26} color="#fff" />}
          </div>
        </div>

        {/* Body */}
        <div className="cp3-overview__body">
          <div className="cp3-overview__eyebrow">
            <span className="cp3-overview__pulse" />
            Country Guide
          </div>
          <h2 className="cp3-overview__name">{country.name}</h2>
          {tagline && <p className="cp3-overview__tagline">{tagline}</p>}
          <div className="cp3-overview__divider" />
          <div className="cp3-overview__meta">
            {destsCount != null && (
              <span className="cp3-overview__meta-pill">
                <FiCamera size={14} /> {destsCount} Destination{destsCount === 1 ? "" : "s"}
              </span>
            )}
            {rating != null && (
              <span className="cp3-overview__meta-pill">
                <FiStar size={14} style={{ color: "#f59e0b" }} /> {Number(rating).toFixed(1)} Rating
              </span>
            )}
            {region && (
              <span className="cp3-overview__meta-pill"><FiGlobe size={14} /> {region}</span>
            )}
          </div>
          <div className="cp3-overview__actions">
            <Link to={`/country/${slug}/destinations`} className="cp3-btn cp3-btn--primary">
              <FiCompass size={16} /> Explore Destinations <FiArrowRight size={15} />
            </Link>
            <Link to="/interactive-map" className="cp3-btn cp3-btn--outline">
              <FiMap size={15} /> View on Map
            </Link>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

/* ═══════════════════════════════════════════════════════
   SIDEBAR CARD (contact / plan)
═══════════════════════════════════════════════════════ */
const SidebarCard = ({ country, navigate, facts }) => {
  const topFacts = facts.slice(0, 5);
  return (
    <div className="cp3-sidebar">
      <div className="cp3-sidebar-card">
        <div className="cp3-sidebar-card__header">
          <div className="cp3-sidebar-card__globe"><FiGlobe size={22} /></div>
          <h3>Plan Your Visit</h3>
          <p>Let our experts design your perfect {country.name} experience</p>
        </div>
        <div className="cp3-sidebar-card__body">
          <div className="cp3-sidebar-card__btns">
            <button
              className="cp3-btn cp3-btn--primary cp3-btn--full"
              onClick={() => navigate("/contact")}
            >
              <FiCalendar size={16} /> Enquire Now
            </button>
            <button
              className="cp3-btn cp3-btn--outline cp3-btn--full"
              onClick={() => navigate("/contact")}
            >
              <FiCompass size={16} /> Talk to an Expert
            </button>
          </div>
          {topFacts.length > 0 && (
            <>
              <div className="cp3-sidebar-card__divider" />
              <div className="cp3-sidebar-card__info">
                {topFacts.map((f, i) => (
                  <div key={i} className="cp3-sidebar-card__row">
                    <div className="cp3-sidebar-card__row-icon">
                      <f.icon size={14} />
                    </div>
                    <div>
                      <span className="cp3-sidebar-card__row-label">{f.label}</span>
                      <span className="cp3-sidebar-card__row-val">{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="cp3-sidebar-card__trust">
            {[
              { icon: <FiAward size={18} />, label: "Expert Guides" },
              { icon: <FiShield size={18} />, label: "Safe Travel" },
              { icon: <FiUsers size={18} />, label: "24/7 Support" },
            ].map((item, i) => (
              <div key={i} className="cp3-sidebar-card__trust-item">
                <div className="cp3-sidebar-card__trust-icon">{item.icon}</div>
                <span className="cp3-sidebar-card__trust-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   GALLERY WITH LIGHTBOX
═══════════════════════════════════════════════════════ */
const GallerySection = ({ country, gallery }) => {
  const [lb, setLb] = React.useState({ open: false, idx: 0 });

  const openLb = (i) => {
    setLb({ open: true, idx: i });
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    setLb({ open: false, idx: 0 });
    document.body.style.overflow = "";
  };
  const prev = (e) => {
    e?.stopPropagation();
    setLb((p) => ({ ...p, idx: (p.idx - 1 + gallery.length) % gallery.length }));
  };
  const next = (e) => {
    e?.stopPropagation();
    setLb((p) => ({ ...p, idx: (p.idx + 1) % gallery.length }));
  };

  useEffect(() => {
    if (!lb.open) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lb.open]);

  if (!gallery.length) return null;

  return (
    <section className="cp3-sec cp3-sec--soft">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="Gallery" icon={FiCamera} sub={`A visual journey through ${country.name}`}>
            Photo Gallery
          </SecTitle>
        </AnimatedSection>
        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <div className="cp3-gallery-grid">
            {gallery.map((src, i) => (
              <div
                key={i}
                className={`cp3-gallery-item ${i === 0 ? "cp3-gallery-item--hero" : ""}`}
                onClick={() => openLb(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openLb(i)}
              >
                <img src={src} alt={`${country.name} ${i + 1}`} loading="lazy"
                  onError={(e) => { e.currentTarget.closest(".cp3-gallery-item").style.display = "none"; }} />
                <div className="cp3-gallery-item__overlay">
                  <span className="cp3-gallery-item__label">
                    {country.name} · {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Lightbox */}
      {lb.open && (
        <div className="cp3-lb" onClick={closeLb}>
          <div className="cp3-lb__backdrop" />
          <button className="cp3-lb__close" onClick={closeLb} aria-label="Close">
            <FiArrowLeft size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
          <div className="cp3-lb__stage" onClick={(e) => e.stopPropagation()}>
            <img src={gallery[lb.idx]} alt={`${country.name} ${lb.idx + 1}`} className="cp3-lb__img" />
          </div>
          {gallery.length > 1 && (
            <>
              <button className="cp3-lb__arrow cp3-lb__arrow--prev" onClick={prev} aria-label="Prev">
                <FiArrowLeft size={22} />
              </button>
              <button className="cp3-lb__arrow cp3-lb__arrow--next" onClick={next} aria-label="Next">
                <FiArrowRight size={22} />
              </button>
              <div className="cp3-lb__footer" onClick={(e) => e.stopPropagation()}>
                <div className="cp3-lb__thumbs">
                  {gallery.slice(0, 14).map((img, i) => (
                    <button
                      key={i}
                      className={`cp3-lb__thumb ${lb.idx === i ? "active" : ""}`}
                      onClick={() => setLb((p) => ({ ...p, idx: i }))}
                    >
                      <img src={img} alt="" />
                    </button>
                  ))}
                </div>
                <span className="cp3-lb__counter">{lb.idx + 1} / {gallery.length}</span>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   BEST TIME SECTION
═══════════════════════════════════════════════════════ */
const BestTimeSection = ({ country, facts }) => {
  const bestTimeFact = facts.find((f) => f.label === "Best Time to Visit");
  const climate = country?.practicalInfo?.climate || null;
  const climateFact = facts.find((f) => f.label === "Climate");
  if (!bestTimeFact && !climateFact) return null;

  const mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const best = climate?.bestMonths || [];
  const avoid = climate?.avoidMonths || [];
  const status = (m) => {
    const ml = m.toLowerCase();
    if (best.some((b) => b.toLowerCase().startsWith(ml.slice(0, 3)))) return "best";
    if (avoid.some((a) => a.toLowerCase().startsWith(ml.slice(0, 3)))) return "avoid";
    return "ok";
  };

  return (
    <section className="cp3-sec cp3-sec--white" id="best-time">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="When to Go" icon={FiCalendar} center sub="Plan your visit at the perfect time">
            Best Time to Visit
          </SecTitle>
        </AnimatedSection>
        <div className="cp3-besttime">
          <AnimatedSection animation="fadeInLeft" delay={0.1}>
            <div className="cp3-besttime__hero">
              <span className="cp3-besttime__label">Recommended Season</span>
              <h4 className="cp3-besttime__val">{bestTimeFact?.value || "Year-round"}</h4>
              {climateFact && (
                <p className="cp3-besttime__note">{climateFact.value}</p>
              )}
              {climate?.climateNotes && (
                <p className="cp3-besttime__note">{climate.climateNotes}</p>
              )}
              {(climate?.avgTempLowC != null || climate?.avgTempHighC != null) && (
                <div className="cp3-besttime__temps">
                  {climate.avgTempLowC != null && (
                    <span className="cp3-chip cp3-chip--glass">
                      <FiThermometer size={12} /> {climate.avgTempLowC}°C Low
                    </span>
                  )}
                  {climate.avgTempHighC != null && (
                    <span className="cp3-chip cp3-chip--glass">
                      <FiSun size={12} /> {climate.avgTempHighC}°C High
                    </span>
                  )}
                </div>
              )}
            </div>
          </AnimatedSection>

          {best.length > 0 ? (
            <AnimatedSection animation="fadeInRight" delay={0.15}>
              <div className="cp3-besttime__cal">
                <span className="cp3-besttime__cal-label">Monthly Guide</span>
                <div className="cp3-besttime__months">
                  {mons.map((m) => {
                    const s = status(m);
                    return (
                      <div key={m} className={`cp3-besttime__month cp3-besttime__month--${s}`}>
                        <span>{m}</span>
                        <div className="cp3-besttime__pip" />
                      </div>
                    );
                  })}
                </div>
                <div className="cp3-besttime__legend">
                  {[
                    { c: "best", l: "Best" },
                    { c: "ok", l: "OK" },
                    { c: "avoid", l: "Avoid" },
                  ].map((x) => (
                    <div key={x.c} className="cp3-besttime__legend-item">
                      <div className={`cp3-besttime__legend-dot cp3-besttime__legend-dot--${x.c}`} />
                      {x.l}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ) : (
            <AnimatedSection animation="fadeInRight" delay={0.15}>
              <div className="cp3-besttime__cal" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <span className="cp3-besttime__cal-label">Travel Information</span>
                {facts.filter(f => ["Climate", "Best Time to Visit"].includes(f.label)).map((f, i) => (
                  <div key={i} className="cp3-info-row">
                    <div className="cp3-info-row__icon"><f.icon size={16} /></div>
                    <div>
                      <span className="cp3-info-row__label">{f.label}</span>
                      <span className="cp3-info-row__val">{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   FAQ SECTION
═══════════════════════════════════════════════════════ */
const FAQSection = ({ country, faqs }) => {
  const [open, setOpen] = React.useState(null);
  if (!faqs.length) return null;
  return (
    <section className="cp3-sec cp3-sec--white">
      <div className="cp3-container cp3-container--narrow">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="FAQ" icon={FiInfo} center sub="Common questions answered">
            Frequently Asked Questions
          </SecTitle>
        </AnimatedSection>
        <div className="cp3-faqs">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} animation="fadeInUp" delay={0.04 + i * 0.05}>
              <div className={`cp3-faq ${open === i ? "open" : ""}`}>
                <button className="cp3-faq__btn" onClick={() => setOpen(open === i ? null : i)}>
                  <span className="cp3-faq__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cp3-faq__text">{faq.question}</span>
                  <div className="cp3-faq__toggle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <path d={open === i ? "M18 6L6 18M6 6l12 12" : "M12 5v14M5 12h14"} />
                    </svg>
                  </div>
                </button>
                <div className="cp3-faq__answer">
                  <div className="cp3-faq__answer-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   REVIEWS SECTION
═══════════════════════════════════════════════════════ */
const ReviewsSection = ({ country, reviews, reviewAgg }) => {
  if (!reviews.length && !reviewAgg) return null;

  const total = reviewAgg?.totalReviews || country?.reviewCount || 0;
  const avg = reviewAgg?.avgRating || country?.rating || 0;
  const dist = reviewAgg?.distribution;
  const bars = dist ? [
    { l: "5★", c: dist.fiveStar || 0 },
    { l: "4★", c: dist.fourStar || 0 },
    { l: "3★", c: dist.threeStar || 0 },
    { l: "2★", c: dist.twoStar || 0 },
    { l: "1★", c: dist.oneStar || 0 },
  ] : [];

  return (
    <section className="cp3-sec cp3-sec--soft">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="Reviews" icon={FiStar} center sub="What travelers say about this destination">
            Traveler Reviews
          </SecTitle>
        </AnimatedSection>

        {reviewAgg && (
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <div className="cp3-reviews-agg">
              <div className="cp3-reviews-agg__score">
                <span className="cp3-reviews-agg__num">{Number(avg).toFixed(1)}</span>
                <div className="cp3-reviews-agg__stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FiStar key={i} size={18}
                      style={{ fill: i < Math.round(avg) ? "#f59e0b" : "none",
                               color: i < Math.round(avg) ? "#f59e0b" : "#e2e8f0" }} />
                  ))}
                </div>
                <span className="cp3-reviews-agg__total">{total.toLocaleString()} reviews</span>
              </div>
              {bars.length > 0 && (
                <div className="cp3-reviews-agg__bars">
                  {bars.map((b) => {
                    const pct = total > 0 ? Math.round((b.c / total) * 100) : 0;
                    return (
                      <div key={b.l} className="cp3-rev-bar">
                        <span className="cp3-rev-bar__label">{b.l}</span>
                        <div className="cp3-rev-bar__track">
                          <div className="cp3-rev-bar__fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="cp3-rev-bar__pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedSection>
        )}

        {reviews.length > 0 && (
          <div className="cp3-reviews-grid">
            {reviews.map((rev, i) => (
              <AnimatedSection key={i} animation="fadeInUp" delay={0.06 + i * 0.07}>
                <div className="cp3-rev-card">
                  <div className="cp3-rev-card__top">
                    <div className="cp3-rev-card__avatar">
                      {rev.reviewerAvatar ? (
                        <img src={rev.reviewerAvatar} alt="" />
                      ) : (
                        <span>{(rev.reviewerName || "A")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="cp3-rev-card__name">{rev.reviewerName || "Anonymous"}</div>
                      <div className="cp3-rev-card__meta">
                        {rev.reviewerCountry}
                        {rev.tripDate && ` · ${new Date(rev.tripDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                      </div>
                    </div>
                    {rev.isVerified && (
                      <FiAward size={16} style={{ color: "var(--cp-green-600)", marginLeft: "auto" }} />
                    )}
                  </div>
                  <div className="cp3-rev-card__stars">
                    {Array.from({ length: 5 }, (_, s) => (
                      <FiStar key={s} size={14}
                        style={{ fill: s < Math.round(rev.rating) ? "#f59e0b" : "none",
                                 color: s < Math.round(rev.rating) ? "#f59e0b" : "#e2e8f0" }} />
                    ))}
                  </div>
                  {rev.title && <p className="cp3-rev-card__title">"{rev.title}"</p>}
                  <p className="cp3-rev-card__body">{rev.content}</p>
                  {rev.helpfulCount > 0 && (
                    <div className="cp3-rev-card__helpful">
                      <FiHeart size={12} /> {rev.helpfulCount} found helpful
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   ACTIVITIES SECTION
═══════════════════════════════════════════════════════ */
const ACT_ICON_MAP = {
  "game drives": FiCompass, "safari": FiCompass,
  "bird": FiEye, "photo": FiCamera,
  "walk": FiMapPin, "hike": FiMapPin, "trek": FiMapPin,
  "culture": FiBookOpen, "village": FiBookOpen,
  "balloon": FiSun, "fishing": FiCompass,
  "boat": FiCompass, "swim": FiCompass, "snorkel": FiCompass,
};
const getActIcon = (act) => {
  const a = act.toLowerCase();
  for (const [k, v] of Object.entries(ACT_ICON_MAP)) {
    if (a.includes(k)) return v;
  }
  return FiCompass;
};

const ActivitiesSection = ({ country, activities }) => {
  if (!activities.length) return null;
  return (
    <section className="cp3-sec cp3-sec--soft">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="Things To Do" icon={FiCompass} center
            sub={`Experiences awaiting you in ${country.name}`}>
            Activities & Experiences
          </SecTitle>
        </AnimatedSection>
        <div className="cp3-act-grid">
          {activities.map((act, i) => {
            const ActIcon = getActIcon(act);
            return (
              <AnimatedSection key={i} animation="scaleIn" delay={0.04 + i * 0.05}>
                <div className="cp3-act-card">
                  <div className="cp3-act-card__ring"><ActIcon size={22} /></div>
                  <h4>{act}</h4>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   WILDLIFE SECTION
═══════════════════════════════════════════════════════ */
const WildlifeSection = ({ country, wildlife }) => {
  if (!wildlife.length) return null;
  return (
    <section className="cp3-sec cp3-sec--white">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="Wildlife" icon={FiEye}
            sub={`Species found in ${country.name}`}>
            Wildlife & Nature
          </SecTitle>
        </AnimatedSection>
        <div className="cp3-wildlife-wrap">
          {wildlife.map((animal, i) => (
            <AnimatedSection key={i} animation="scaleIn" delay={0.03 + i * 0.03}>
              <div className="cp3-wildlife-pill">
                <div className="cp3-wildlife-pill__dot" />
                <span>{animal}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   HOW TO GET THERE
═══════════════════════════════════════════════════════ */
const GetThereSection = ({ country }) => {
  const hgt = getHowToGetThere(country);
  const lat = hgt?.mapPosition?.lat ?? country.latitude;
  const lng = hgt?.mapPosition?.lng ?? country.longitude;
  const hasMap = lat && lng;

  const rows = [
    { icon: FiCompass, label: "Nearest Airport", val: hgt?.nearestAirport || country.nearestAirport,
      sub: hgt?.distanceFromAirport || (country.distanceFromAirportKm ? `${country.distanceFromAirportKm} km` : null) },
    { icon: FiMapPin, label: "Nearest City", val: hgt?.nearestCity || country.nearestCity },
    { icon: FiMap, label: "Getting Around", val: hgt?.generalInfo || country.gettingThere },
  ].filter((r) => r.val);

  const transport = hgt?.transportOptions || [];

  if (!rows.length && !hasMap && !transport.length) return null;

  return (
    <section className="cp3-sec cp3-sec--white">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="Getting There" icon={FiMapPin}
            sub="Travel logistics and directions">
            How to Get There
          </SecTitle>
        </AnimatedSection>
        <div className={`cp3-getthere ${hasMap ? "cp3-getthere--map" : ""}`}>
          {hasMap && (
            <AnimatedSection animation="fadeInLeft" delay={0.1}>
              <div className="cp3-getthere__map">
                <iframe
                  title={`Map of ${country.name}`}
                  src={`https://www.google.com/maps?q=${lat},${lng}&z=6&output=embed`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </AnimatedSection>
          )}
          <AnimatedSection animation="fadeInRight" delay={0.15}>
            <div className="cp3-getthere__rows">
              {transport.length > 0 && (
                <div style={{ padding: "18px 20px", background: "var(--cp-white)", borderBottom: "1px solid var(--cp-gray-100)" }}>
                  <span className="cp3-mini-label">Transport Options</span>
                  <div className="cp3-chip-row">
                    {transport.map((t, i) => (
                      <span key={i} className="cp3-chip cp3-chip--soft-green">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {rows.map((row, i) => (
                <div key={i} className="cp3-info-row">
                  <div className="cp3-info-row__icon"><row.icon size={16} /></div>
                  <div>
                    <span className="cp3-info-row__label">{row.label}</span>
                    <span className="cp3-info-row__val">{row.val}</span>
                    {row.sub && (
                      <span style={{ display: "block", fontSize: 12, color: "var(--cp-gray-400)", marginTop: 2 }}>
                        {row.sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   PRACTICAL INFO
═══════════════════════════════════════════════════════ */
const PracticalSection = ({ country }) => {
  const pi = getPracticalInfo(country);
  const alerts = getAlerts(country);
  const packing = pi?.packing?.essentials || [];
  const vaccReq = pi?.healthAndSafety?.vaccinationsRequired || [];
  const vaccRec = pi?.healthAndSafety?.vaccinationsRecommended || [];
  const malaria = pi?.healthAndSafety?.malariaRisk;
  const safetyNotes = pi?.healthAndSafety?.safetyNotes;
  const permits = pi?.permitsAndRegulations?.permitsRequired || [];
  const leadTime = pi?.permitsAndRegulations?.bookingLeadTime;
  const visitorLimits = pi?.permitsAndRegulations?.visitorLimits;
  const etiquette = pi?.culture?.localEtiquette || [];
  const tipping = pi?.culture?.tippingCulture;
  const photoRules = pi?.culture?.photographyRules;

  const cards = [];
  if (packing.length) cards.push({ type: "packing", packing, clothingTips: pi?.packing?.clothingTips });
  if (vaccReq.length || vaccRec.length || malaria) cards.push({ type: "health", vaccReq, vaccRec, malaria, safetyNotes });
  if (permits.length || leadTime || visitorLimits) cards.push({ type: "permits", permits, leadTime, visitorLimits });
  if (etiquette.length || tipping || photoRules) cards.push({ type: "culture", etiquette, tipping, photoRules });

  if (!cards.length && !alerts.length) return null;

  const cardHeaders = {
    packing: { title: "What to Pack", theme: "green" },
    health: { title: "Health & Safety", theme: "amber" },
    permits: { title: "Permits & Regulations", theme: "blue" },
    culture: { title: "Local Culture", theme: "purple" },
  };

  return (
    <section className="cp3-sec cp3-sec--soft">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <SecTitle eyebrow="Practical Info" icon={FiInfo} center sub="Everything you need to know">
            Travel Essentials
          </SecTitle>
        </AnimatedSection>

        {alerts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {alerts.map((a, i) => (
              <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.08}>
                <div className={`cp3-alert cp3-alert--${a.theme}`}>
                  <span className="cp3-alert__icon">{a.icon}</span>
                  <div>
                    <div className="cp3-alert__title">{a.title}</div>
                    <div className="cp3-alert__text">{a.text}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        <div className="cp3-prac-grid">
          {cards.map((card, ci) => {
            const hdr = cardHeaders[card.type];
            return (
              <AnimatedSection key={ci} animation="fadeInUp" delay={0.05 + ci * 0.1}>
                <div className="cp3-prac-card">
                  <div className={`cp3-prac-card__hdr cp3-prac-card__hdr--${hdr.theme}`}>
                    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>
                      {hdr.title}
                    </span>
                  </div>
                  <div className="cp3-prac-card__body">
                    {card.type === "packing" && (
                      <>
                        <div className="cp3-chip-row">
                          {card.packing.map((p, i) => (
                            <span key={i} className="cp3-chip cp3-chip--soft-green">{p}</span>
                          ))}
                        </div>
                        {card.clothingTips && <p className="cp3-prac-card__note">{card.clothingTips}</p>}
                      </>
                    )}
                    {card.type === "health" && (
                      <>
                        {card.malaria && (
                          <div className="cp3-alert cp3-alert--red" style={{ padding: "12px 16px", marginBottom: 12 }}>
                            <FiAlertCircle size={14} className="cp3-alert__icon" />
                            <span style={{ fontSize: 13 }}>Malaria Risk: {card.malaria}</span>
                          </div>
                        )}
                        {card.vaccReq.length > 0 && (
                          <div className="cp3-prac-card__group">
                            <span className="cp3-mini-label">Required Vaccinations</span>
                            <div className="cp3-chip-row">
                              {card.vaccReq.map((v, i) => (
                                <span key={i} className="cp3-chip cp3-chip--soft-gray">{v}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {card.vaccRec.length > 0 && (
                          <div className="cp3-prac-card__group">
                            <span className="cp3-mini-label">Recommended</span>
                            <div className="cp3-chip-row">
                              {card.vaccRec.map((v, i) => (
                                <span key={i} className="cp3-chip cp3-chip--soft-green">{v}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {card.safetyNotes && <p className="cp3-prac-card__note">{card.safetyNotes}</p>}
                      </>
                    )}
                    {card.type === "permits" && (
                      <>
                        {card.permits.length > 0 && (
                          <div className="cp3-prac-card__group">
                            <span className="cp3-mini-label">Required Permits</span>
                            <div className="cp3-chip-row">
                              {card.permits.map((p, i) => (
                                <span key={i} className="cp3-chip cp3-chip--soft-gray">{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {[
                          { l: "Booking Lead Time", v: card.leadTime },
                          { l: "Visitor Limits", v: card.visitorLimits },
                        ].filter((r) => r.v).map((r, i) => (
                          <div key={i} className="cp3-prac-card__kv">
                            <span>{r.l}</span><span>{r.v}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {card.type === "culture" && (
                      <>
                        {card.etiquette.length > 0 && (
                          <ul className="cp3-prac-card__list">
                            {card.etiquette.map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                        )}
                        {card.tipping && <p className="cp3-prac-card__note"><strong>Tipping:</strong> {card.tipping}</p>}
                        {card.photoRules && <p className="cp3-prac-card__note"><strong>Photography:</strong> {card.photoRules}</p>}
                      </>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   DESTINATIONS PREVIEW
═══════════════════════════════════════════════════════ */
const DestinationsPreview = ({ country, slug, allDests, previewDests, destsLoading }) => {
  if (!previewDests.length && !destsLoading) return null;
  return (
    <section className="cp3-sec cp3-sec--white">
      <div className="cp3-container">
        <AnimatedSection animation="fadeInUp">
          <div className="cp3-dest-header">
            <div>
              <SecTitle eyebrow="Top Destinations" icon={FiCamera}
                sub={`Curated highlights across ${country.name}`}>
                Must-Visit Places
              </SecTitle>
            </div>
            {allDests.length > 3 && (
              <Link to={`/country/${slug}/destinations`} className="cp3-btn cp3-btn--outline cp3-btn--sm">
                View All {allDests.length} <FiArrowRight size={14} />
              </Link>
            )}
          </div>
        </AnimatedSection>

        {destsLoading ? (
          <div className="cp3-dest-grid">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="cp3-dest-skeleton">
                <div className="cp3-shimmer" style={{ aspectRatio: "16/10" }} />
                <div style={{ padding: 20 }}>
                  <div className="cp3-shimmer" style={{ height: 22, width: "60%", marginBottom: 10, borderRadius: 4 }} />
                  <div className="cp3-shimmer" style={{ height: 14, width: "85%", marginBottom: 8, borderRadius: 4 }} />
                  <div className="cp3-shimmer" style={{ height: 14, width: "50%", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cp3-dest-grid">
            {previewDests.map((dest, i) => (
              <AnimatedSection
                key={dest.slug || dest.id || i}
                animation={["fadeInUp", "fadeInLeft", "fadeInRight"][i % 3]}
                delay={0.07 + i * 0.07}
              >
                <DestinationCard destination={dest} priority={i === 0} />
              </AnimatedSection>
            ))}
          </div>
        )}

        {allDests.length > 3 && (
          <AnimatedSection animation="fadeInUp" delay={0.2}>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Link to={`/country/${slug}/destinations`} className="cp3-btn cp3-btn--primary cp3-btn--lg">
                See All {allDests.length} Destinations <FiArrowRight size={15} />
              </Link>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   CTA FOOTER BANNER
═══════════════════════════════════════════════════════ */
const CTABanner = ({ country, slug, navigate }) => (
  <div className="cp3-cta">
    <div className="cp3-cta__orbs" aria-hidden="true">
      {[
        { s: 320, style: { top: "-10%", left: "-5%", animationDuration: "9s" } },
        { s: 200, style: { bottom: "-5%", right: "-3%", animationDuration: "12s", animationDelay: "3s" } },
        { s: 140, style: { top: "30%", right: "15%", animationDuration: "7s", animationDelay: "1.5s" } },
      ].map((o, i) => (
        <div key={i} className="cp3-cta__orb" style={{ width: o.s, height: o.s, ...o.style }} />
      ))}
    </div>
    <div className="cp3-cta__inner">
      <div className="cp3-cta__eyebrow">
        <span style={{ width: 28, height: 1, background: "var(--cp-green-400)", display: "inline-block" }} />
        Your Adventure Awaits
      </div>
      <h3 className="cp3-cta__title">Ready to explore {country.name}?</h3>
      <p className="cp3-cta__desc">
        Browse curated destinations, plan your perfect itinerary, and let our
        safari experts craft an unforgettable journey across {country.name}.
      </p>
      <div className="cp3-cta__actions">
        <Link
          to={`/country/${slug}/destinations`}
          className="cp3-btn cp3-btn--primary cp3-btn--lg"
          style={{ background: "#fff", color: "var(--cp-green-800)", borderColor: "#fff" }}
        >
          <FiCompass size={16} /> Explore Destinations <FiArrowRight size={15} />
        </Link>
        <button
          className="cp3-btn cp3-btn--ghost-dark cp3-btn--lg"
          onClick={() => navigate("/contact")}
        >
          <FiCalendar size={15} /> Plan My Trip
        </button>
      </div>
      <div className="cp3-cta__trust">
        {[
          { icon: <FiAward size={18} />, label: "Expert Guides" },
          { icon: <FiShield size={18} />, label: "Safe & Ethical" },
          { icon: <FiUsers size={18} />, label: "24/7 Support" },
          { icon: <FiStar size={18} />, label: "Top Rated" },
        ].map((item, i) => (
          <div key={i} className="cp3-cta__trust-item">
            {item.icon} {item.label}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════ */
const CountryPage = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    injectCSS();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [countryId]);

  const { country, loading: countryLoading, error: countryError, refetch: retryCountry } =
    useCountry(countryId);
  const { destinations: allDests = [], loading: destsLoading } =
    useCountryDestinations(countryId);
  const previewDests = useMemo(() => allDests.slice(0, 3), [allDests]);

  /* ── Loading ── */
  if (countryLoading) {
    return (
      <div className="cp3">
        <div className="cp3-loading">
          <Loader />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (countryError || !country) {
    return (
      <div className="cp3">
        <div className="cp3-error">
          <div className="cp3-error__inner">
            <div className="cp3-error__icon">
              <FiAlertCircle size={32} />
            </div>
            <h3 className="cp3-error__h3">Country Not Found</h3>
            <p className="cp3-error__p">
              {countryError || `We couldn't load details for "${countryId}". Please try again.`}
            </p>
            <div className="cp3-error__btns">
              <button className="cp3-btn cp3-btn--outline" onClick={() => navigate(-1)}>
                <FiArrowLeft size={15} /> Go Back
              </button>
              <button className="cp3-btn cp3-btn--primary" onClick={retryCountry}>
                <FiRefreshCw size={15} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Extract Data ── */
  const slug = getCountrySlug(country);
  const hero = getHero(country);
  const flag = getFlag(country);
  const region = getRegion(country);
  const tagline = getTagline(country);
  const desc = getDesc(country);
  const facts = extractFacts(country);
  const highlights = extractHighlights(country);
  const tips = extractTips(country);
  const gallery = extractGallery(country);
  const destsCount = getDestsCount(country);
  const rating = getRating(country);
  const reviews = getReviews(country);
  const reviewAgg = getReviewAgg(country);
  const faqs = getFaqs(country);
  const wildlife = getWildlife(country);
  const activities = getActivities(country);

  return (
    <div className="cp3">
      <ScrollProgress />

      {/* ── HERO ── */}
      <HeroSection
        country={country} hero={hero} flag={flag} region={region}
        tagline={tagline} destsCount={destsCount} rating={rating} slug={slug}
      />

      {/* ── STATS BAR ── */}
      <StatsBar country={country} facts={facts} />

      {/* ── OVERVIEW PANEL ── */}
      <section className="cp3-sec cp3-sec--white" id="cp3-overview">
        <div className="cp3-container">
          <OverviewPanel
            country={country} hero={hero} flag={flag} region={region}
            tagline={tagline} destsCount={destsCount} rating={rating}
            slug={slug} navigate={navigate}
          />
        </div>
      </section>

      {/* ── FACTS + ABOUT (2-col) ── */}
      {(facts.length > 0 || desc) && (
        <section className="cp3-sec cp3-sec--soft">
          <div className="cp3-container">
            <div className="cp3-about">
              {/* Main: about text + highlights */}
              <div>
                {desc && (
                  <AnimatedSection animation="fadeInLeft" delay={0.05}>
                    <SecTitle eyebrow="Overview" icon={FiGlobe}
                      sub={`What makes ${country.name} special`}>
                      About {country.name}
                    </SecTitle>

                    {/* Quote if short overview */}
                    {(country.overview || country.intro) && (
                      <div className="cp3-quote" style={{ marginBottom: 28 }}>
                        <span className="cp3-quote__mark">"</span>
                        <p>{country.overview || country.intro}</p>
                      </div>
                    )}

                    <div className="cp3-prose">
                      {desc.split(/\n\n|\r\n\r\n/).filter(Boolean).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </AnimatedSection>
                )}

                {highlights.length > 0 && (
                  <AnimatedSection animation="fadeInUp" delay={0.15}>
                    <div style={{ marginTop: 40 }}>
                      <SecTitle eyebrow="Highlights" icon={FiStar}
                        sub={`Signature experiences in ${country.name}`}>
                        What {country.name} is Known For
                      </SecTitle>
                      <div className="cp3-highlights-grid">
                        {highlights.map((h, i) => (
                          <AnimatedSection key={i} animation="scaleIn" delay={0.03 + i * 0.04}>
                            <div className="cp3-hl-card">
                              <span className="cp3-hl-card__num">{String(i + 1).padStart(2, "0")}</span>
                              <p>{h}</p>
                            </div>
                          </AnimatedSection>
                        ))}
                      </div>
                    </div>
                  </AnimatedSection>
                )}
              </div>

              {/* Sidebar */}
              <AnimatedSection animation="fadeInRight" delay={0.1}>
                <SidebarCard country={country} navigate={navigate} facts={facts} />
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* ── FACTS GRID ── */}
      {facts.length > 0 && (
        <section className="cp3-sec cp3-sec--white">
          <div className="cp3-container">
            <AnimatedSection animation="fadeInUp">
              <SecTitle eyebrow="Quick Facts" icon={FiInfo} center
                sub={`Essential information about ${country.name}`}>
                Travel Information
              </SecTitle>
            </AnimatedSection>
            <div className="cp3-facts-grid">
              {facts.map((fact, i) => (
                <AnimatedSection key={`${fact.label}-${i}`} animation="fadeInUp" delay={0.04 + i * 0.04}>
                  <div className="cp3-fact">
                    <div className="cp3-fact__icon"><fact.icon size={18} /></div>
                    <div>
                      <span className="cp3-fact__label">{fact.label}</span>
                      <span className="cp3-fact__value">{fact.value}</span>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BEST TIME ── */}
      {(facts.find(f => f.label === "Best Time to Visit") || facts.find(f => f.label === "Climate")) && (
        <BestTimeSection country={country} facts={facts} />
      )}

      {/* ── ACTIVITIES ── */}
      <ActivitiesSection country={country} activities={activities} />

      {/* ── WILDLIFE ── */}
      <WildlifeSection country={country} wildlife={wildlife} />

      {/* ── DESTINATIONS PREVIEW ── */}
      <DestinationsPreview
        country={country} slug={slug}
        allDests={allDests} previewDests={previewDests}
        destsLoading={destsLoading}
      />

      {/* ── GALLERY ── */}
      <GallerySection country={country} gallery={gallery} />

      {/* ── HOW TO GET THERE ── */}
      <GetThereSection country={country} />

      {/* ── PRACTICAL INFO ── */}
      <PracticalSection country={country} />

      {/* ── TIPS ── */}
      {tips.length > 0 && (
        <section className="cp3-sec cp3-sec--white">
          <div className="cp3-container">
            <AnimatedSection animation="fadeInUp">
              <SecTitle eyebrow="Travel Tips" icon={FiBookOpen}
                sub="Practical advice from travelers and local experts">
                Know Before You Go
              </SecTitle>
            </AnimatedSection>
            <div className="cp3-tips-grid">
              {tips.map((tip, i) => (
                <AnimatedSection key={i} animation="fadeInUp" delay={0.04 + i * 0.05}>
                  <div className="cp3-tip">
                    <span className="cp3-tip__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="cp3-tip__text">{tip}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ── */}
      <ReviewsSection country={country} reviews={reviews} reviewAgg={reviewAgg} />

      {/* ── FAQ ── */}
      <FAQSection country={country} faqs={faqs} />

      {/* ── CTA BANNER ── */}
      <CTABanner country={country} slug={slug} navigate={navigate} />
    </div>
  );
};

export default CountryPage;