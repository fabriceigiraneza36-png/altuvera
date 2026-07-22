// src/pages/Booking/Booking.jsx
import React, {
  useEffect, useMemo, useRef, useCallback, useState,
} from "react";
import {
  useSearchParams, useNavigate, Navigate, Link,
} from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShield,
  FiAlertCircle, FiX, FiMessageCircle, FiLock,
  FiGlobe, FiAward, FiMapPin, FiCalendar,
  FiUsers, FiStar, FiHeart, FiCompass, FiCheckCircle,
  FiChevronLeft, FiChevronRight, FiSend, FiInfo,
  FiClock, FiZap, FiTrendingUp, FiEye,
} from "react-icons/fi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { MdVerified } from "react-icons/md";

import { BookingProvider, useBookingContext } from "./BookingContext";
import GallerySlideshow  from "./components/GallerySlideshow";
import SuccessScreen     from "./components/SuccessScreen";
import { Spinner }       from "./components/FormComponents";

import Step0Identity    from "./steps/Step0Identity";
import Step1Destination from "./steps/Step1Destination";
import Step2Trip        from "./steps/Step2Trip";
import Step3Contact     from "./steps/Step3Contact";

import { useCountriesList }    from "../../hooks/useCountriesList";
import { useDestinationsList } from "../../hooks/useDestinationsList";

const WA = "250785751391";

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS & CSS
═══════════════════════════════════════════════════════════════════════════ */
const BK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ── Tokens ── */
:root {
  --g50:#f0fdf4; --g100:#dcfce7; --g200:#bbf7d0; --g300:#86efac;
  --g400:#4ade80; --g500:#22c55e; --g600:#16a34a; --g700:#15803d;
  --g800:#166534; --g900:#14532d;
  --e50:#ecfdf5;  --e100:#d1fae5; --e200:#a7f3d0; --e300:#6ee7b7;
  --e400:#34d399; --e500:#10b981; --e600:#059669; --e700:#047857;
  --e800:#065f46; --e900:#022c22;

  --slate50:#f8fafc; --slate100:#f1f5f9; --slate200:#e2e8f0;
  --slate300:#cbd5e1; --slate400:#94a3b8; --slate500:#64748b;
  --slate600:#475569; --slate700:#334155; --slate800:#1e293b;
  --slate900:#0f172a;

  --radius-sm:10px; --radius-md:14px; --radius-lg:20px; --radius-xl:24px;
  --shadow-sm:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 16px rgba(0,0,0,.08),0 1px 4px rgba(0,0,0,.04);
  --shadow-lg:0 12px 40px rgba(0,0,0,.10),0 2px 8px rgba(0,0,0,.05);
  --shadow-green:0 8px 32px rgba(5,150,105,.20),0 2px 8px rgba(5,150,105,.12);
  --ease:cubic-bezier(0.22,1,0.36,1);
  --ease-in:cubic-bezier(0.4,0,1,1);
  --ease-out:cubic-bezier(0,0,0.2,1);
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Keyframes ── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideRight{ from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
@keyframes scaleX   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
@keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
@keyframes ripple   { 0%{transform:scale(0);opacity:.6} 100%{transform:scale(2.5);opacity:0} }
@keyframes countPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
@keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes gradShift{ 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

.bk-fade-up    { animation: fadeUp    .45s var(--ease) both }
.bk-fade-in    { animation: fadeIn    .3s  ease both }
.bk-slide-down { animation: slideDown .25s ease both }
.bk-slide-right{ animation: slideRight .3s var(--ease) both }
.bk-scale-x    { animation: scaleX   .3s  var(--ease) both; transform-origin:left }
.bk-count-pop  { animation: countPop .35s var(--ease) both }

/* ── Page wrapper ── */
.bk-page {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background: var(--g50);
  color: var(--slate900);
}

/* ══════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════ */
.bk-hero {
  position: relative;
  height: clamp(240px, 30vw, 360px);
  overflow: hidden;
  background: var(--e900);
}
.bk-hero__img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 40%;
  transition: transform 8s ease;
}
.bk-hero:hover .bk-hero__img { transform: scale(1.04); }
.bk-hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    165deg,
    rgba(2,44,34,.55) 0%,
    rgba(2,44,34,.30) 40%,
    rgba(2,44,34,.75) 100%
  );
}
/* Decorative particles */
.bk-hero__particles {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
}
.bk-hero__particle {
  position: absolute; border-radius: 50%;
  background: rgba(52,211,153,.2);
  animation: float 4s ease-in-out infinite;
}

.bk-hero__content {
  position: relative; z-index: 2;
  height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 0 clamp(20px, 5vw, 60px);
  gap: 12px;
}
.bk-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px;
  border-radius: 99px;
  background: rgba(16,185,129,.18);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(110,231,183,.35);
  color: #a7f3d0;
  font-size: 10.5px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
}
.bk-hero__eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #34d399;
  animation: pulse 2s ease infinite;
}
.bk-hero__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(26px, 4.5vw, 52px);
  font-weight: 700; color: #fff;
  line-height: 1.1; letter-spacing: -.025em;
  text-shadow: 0 2px 24px rgba(0,0,0,.25);
}
.bk-hero__title em {
  font-style: italic; color: #6ee7b7;
}
.bk-hero__subtitle {
  font-size: clamp(13px, 1.4vw, 16px);
  color: rgba(255,255,255,.70);
  line-height: 1.65; font-weight: 300;
  max-width: 520px;
}
.bk-hero__stats {
  display: flex; align-items: center; gap: 24px;
  margin-top: 4px; flex-wrap: wrap; justify-content: center;
}
.bk-hero__stat {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: rgba(255,255,255,.7); font-weight: 500;
}
.bk-hero__stat svg { color: #34d399; }
.bk-hero__wave {
  position: absolute; bottom: -1px; left: 0; right: 0; line-height: 0;
}

/* ══════════════════════════════════════════════════
   BREADCRUMB
══════════════════════════════════════════════════ */
.bk-breadcrumb {
  max-width: 1340px; margin: 0 auto;
  padding: 12px clamp(16px, 3vw, 36px) 0;
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--slate400); font-weight: 500;
}
.bk-breadcrumb a {
  color: var(--e600); text-decoration: none; font-weight: 600;
  transition: color .2s;
}
.bk-breadcrumb a:hover { color: var(--e700); }
.bk-breadcrumb__sep { color: var(--slate300); }

/* ══════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════ */
.bk-layout {
  max-width: 1340px; margin: 0 auto;
  padding: 0 clamp(16px, 3vw, 36px) 80px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: clamp(20px, 2.5vw, 32px);
  align-items: start;
  margin-top: clamp(-70px, -9vw, -100px);
  position: relative; z-index: 2;
}
.bk-form-col {
  position: sticky;
  top: 20px; z-index: 10;
  max-height: calc(100vh - 40px);
  display: flex; flex-direction: column;
  min-height: 0;
}
.bk-sidebar-col {
  display: flex; flex-direction: column; gap: 16px;
}

@media (max-width: 1080px) {
  .bk-layout {
    grid-template-columns: 1fr;
    margin-top: clamp(-50px, -7vw, -70px);
  }
  .bk-form-col {
    position: relative; top: auto;
    max-height: none;
  }
}

/* ══════════════════════════════════════════════════
   FORM CARD
══════════════════════════════════════════════════ */
.bk-form-card {
  background: #fff;
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--e100);
  box-shadow: var(--shadow-green);
  display: flex; flex-direction: column;
  overflow: hidden;
  flex: 1; min-height: 0;
}

/* Animated gradient top accent */
.bk-form-card__accent {
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669, #0d9488, #10b981);
  background-size: 300% 100%;
  animation: gradShift 4s ease infinite;
  flex-shrink: 0;
}

/* Progress bar */
.bk-progress {
  height: 3px;
  background: var(--slate100);
  flex-shrink: 0;
  overflow: hidden;
}
.bk-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 0 99px 99px 0;
  transition: width .6s var(--ease);
  position: relative;
}
.bk-progress__fill::after {
  content: '';
  position: absolute; right: 0; top: 50%;
  transform: translateY(-50%);
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #059669;
  box-shadow: 0 0 0 3px rgba(5,150,105,.25);
}

/* Card top bar */
.bk-card-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px clamp(16px, 2.5vw, 24px);
  border-bottom: 1px solid var(--slate100);
  background: linear-gradient(to right, var(--e50), #fff);
  flex-shrink: 0;
}
.bk-card-topbar__brand {
  display: flex; align-items: center; gap: 10px;
}
.bk-card-topbar__icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 12px rgba(5,150,105,.3);
}
.bk-card-topbar__name {
  font-size: 13.5px; font-weight: 700; color: var(--e900); line-height: 1.2;
}
.bk-card-topbar__step {
  font-size: 11px; color: var(--slate400); font-weight: 500; margin-top: 1px;
}
.bk-card-topbar__wa {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 13px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none; border-radius: 10px;
  color: #fff; font-size: 12px; font-weight: 700;
  cursor: pointer; text-decoration: none;
  box-shadow: 0 3px 12px rgba(34,197,94,.3);
  transition: all .25s var(--ease);
  font-family: 'Inter', sans-serif;
}
.bk-card-topbar__wa:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(34,197,94,.4);
}

/* ══════════════════════════════════════════════════
   STEPPER
══════════════════════════════════════════════════ */
.bk-stepper {
  display: flex; align-items: stretch;
  padding: 0;
  border-bottom: 1px solid var(--slate100);
  background: #fafffe;
  overflow-x: auto; scrollbar-width: none;
  flex-shrink: 0;
}
.bk-stepper::-webkit-scrollbar { display: none; }

.bk-step-tab {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px; padding: 12px 8px;
  border: none; background: transparent;
  font-family: 'Inter', sans-serif;
  cursor: default; position: relative;
  transition: background .2s;
}
.bk-step-tab--done   { cursor: pointer; }
.bk-step-tab--done:hover { background: var(--e50); }

.bk-step-tab__bubble {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  transition: all .3s var(--ease); flex-shrink: 0;
  position: relative; overflow: hidden;
}
.bk-step-tab__bubble--pending {
  background: var(--slate100); color: var(--slate400);
  border: 1.5px solid var(--slate200);
}
.bk-step-tab__bubble--active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 3px 14px rgba(5,150,105,.35);
  animation: countPop .35s var(--ease);
}
.bk-step-tab__bubble--done {
  background: var(--e100); color: var(--e700);
  border: 1.5px solid var(--e200);
}
.bk-step-tab__label {
  font-size: 10.5px; font-weight: 600;
  letter-spacing: .01em; line-height: 1.2;
  white-space: nowrap;
  transition: color .2s;
}
.bk-step-tab--active .bk-step-tab__label { color: var(--e700); font-weight: 700; }
.bk-step-tab--done   .bk-step-tab__label { color: var(--e600); }
.bk-step-tab--pending .bk-step-tab__label { color: var(--slate400); }
.bk-step-tab__bar {
  position: absolute; bottom: 0; left: 10%; right: 10%;
  height: 2.5px; border-radius: 99px;
  background: linear-gradient(90deg, #10b981, #059669);
  transform-origin: left;
}
/* Connector dots between steps */
.bk-step-connector {
  display: flex; align-items: center; flex-shrink: 0;
  padding-bottom: 12px;
}
.bk-step-connector__line {
  width: 20px; height: 1.5px;
  background: var(--slate200);
  transition: background .4s;
}
.bk-step-connector__line--done { background: var(--e300); }

/* ══════════════════════════════════════════════════
   FORM SCROLL AREA
══════════════════════════════════════════════════ */
.bk-form-scroll {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--e200) transparent;
}
.bk-form-scroll::-webkit-scrollbar { width: 4px; }
.bk-form-scroll::-webkit-scrollbar-track { background: transparent; }
.bk-form-scroll::-webkit-scrollbar-thumb {
  background: var(--e200); border-radius: 99px;
}
.bk-form-scroll::-webkit-scrollbar-thumb:hover { background: var(--e300); }

/* ══════════════════════════════════════════════════
   STEP HEADER
══════════════════════════════════════════════════ */
.bk-step-header {
  padding: clamp(20px,2.5vw,28px) clamp(18px,2.5vw,28px) 0;
  text-align: center;
}
.bk-step-header__icon-wrap {
  display: inline-flex; align-items: center; justify-content: center;
  width: 52px; height: 52px; border-radius: 16px;
  background: linear-gradient(135deg, var(--e50), var(--e100));
  border: 1.5px solid var(--e200);
  margin-bottom: 12px;
  position: relative; overflow: hidden;
}
.bk-step-header__icon-wrap::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(16,185,129,.1), transparent);
}
.bk-step-header__num {
  position: absolute; top: 4px; right: 6px;
  font-size: 9px; font-weight: 800; color: var(--e500); letter-spacing: .06em;
}
.bk-step-header__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(19px, 2.4vw, 24px);
  font-weight: 700; color: var(--e900);
  margin: 0 0 5px; line-height: 1.2;
}
.bk-step-header__desc {
  font-size: 13px; color: var(--slate400);
  line-height: 1.65; margin: 0; font-weight: 400;
}

/* ══════════════════════════════════════════════════
   FORM BODY
══════════════════════════════════════════════════ */
.bk-form-body {
  padding: clamp(16px,2.5vw,22px) clamp(18px,2.5vw,28px);
}

/* ══════════════════════════════════════════════════
   NAV BAR
══════════════════════════════════════════════════ */
.bk-nav {
  display: flex; align-items: center; gap: 10px;
  padding: clamp(12px,2vw,16px) clamp(18px,2.5vw,28px);
  border-top: 1px solid var(--slate100);
  background: linear-gradient(to top, var(--e50), #fff);
  flex-shrink: 0;
}
.bk-btn-back {
  display: inline-flex; align-items: center; gap: 7px;
  height: 44px; padding: 0 16px;
  border: 1.5px solid var(--slate200);
  background: #fff; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600; color: var(--slate600);
  cursor: pointer; transition: all .25s var(--ease);
  font-family: 'Inter', sans-serif; flex-shrink: 0;
}
.bk-btn-back:hover {
  background: var(--slate50); border-color: var(--slate300);
  color: var(--slate900); transform: translateX(-2px);
}
.bk-btn-next {
  flex: 1; height: 48px;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff; border: none; border-radius: var(--radius-md);
  font-size: 14.5px; font-weight: 700; cursor: pointer;
  transition: all .3s var(--ease);
  box-shadow: 0 4px 20px rgba(16,185,129,.30);
  font-family: 'Inter', sans-serif;
  position: relative; overflow: hidden;
}
.bk-btn-next::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  opacity: 0; transition: opacity .25s;
}
.bk-btn-next:hover:not(:disabled)::before { opacity: 1; }
.bk-btn-next:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,.40);
}
.bk-btn-next:active:not(:disabled) { transform: scale(.98); }
.bk-btn-next:disabled {
  opacity: .5; cursor: not-allowed;
  transform: none; box-shadow: none;
}

/* Ripple on next button */
.bk-btn-next__ripple {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,.3);
  width: 100px; height: 100px;
  margin: -50px 0 0 -50px;
  animation: ripple .6s ease-out forwards;
  pointer-events: none;
}

/* ══════════════════════════════════════════════════
   TRUST STRIP
══════════════════════════════════════════════════ */
.bk-trust-strip {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 16px;
  padding: 10px clamp(18px,2.5vw,28px);
  border-top: 1px solid var(--e100);
  background: var(--e50);
  flex-shrink: 0;
}
.bk-trust-pill {
  display: flex; align-items: center; gap: 5px;
  font-size: 10.5px; color: var(--e700); font-weight: 600;
}
.bk-trust-pill__icon {
  width: 18px; height: 18px; border-radius: 5px;
  background: var(--e200);
  display: flex; align-items: center; justify-content: center;
  color: var(--e700); flex-shrink: 0;
}

/* Form footer */
.bk-form-footer {
  padding: 9px clamp(18px,2.5vw,28px);
  border-top: 1px solid var(--slate100);
  background: #fafffe;
  text-align: center; flex-shrink: 0;
}
.bk-form-footer p {
  font-size: 10.5px; color: var(--slate400);
  display: flex; align-items: center; justify-content: center; gap: 5px; margin: 0;
}

/* ══════════════════════════════════════════════════
   ERROR BANNER
══════════════════════════════════════════════════ */
.bk-error-banner {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 13px 16px;
  margin: 14px clamp(18px,2.5vw,28px) 0;
  border-radius: var(--radius-md);
  background: #fef2f2; border: 1.5px solid #fecaca;
  animation: slideDown .25s ease;
}
.bk-error-banner__msg { font-size: 13px; color: #b91c1c; margin: 0 0 9px; line-height: 1.55; }
.bk-error-banner__close {
  border: none; background: transparent; cursor: pointer;
  color: #ef4444; padding: 3px; border-radius: 6px;
  transition: background .2s; flex-shrink: 0;
}
.bk-error-banner__close:hover { background: #fee2e2; }

/* ══════════════════════════════════════════════════
   DATE PICKER
══════════════════════════════════════════════════ */
.bk-dp { position: relative; user-select: none; }

.bk-dp-trigger {
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 11px 14px;
  background: #fff; border: 1.5px solid var(--slate200);
  border-radius: var(--radius-md); cursor: pointer;
  transition: all .2s var(--ease);
  font-family: 'Inter', sans-serif;
}
.bk-dp-trigger:hover { border-color: var(--e300); background: var(--e50); }
.bk-dp-trigger--open { border-color: var(--e400); box-shadow: 0 0 0 3px rgba(16,185,129,.12); }
.bk-dp-trigger--error { border-color: #fca5a5; box-shadow: 0 0 0 3px rgba(239,68,68,.08); }

.bk-dp-trigger__icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: linear-gradient(135deg, var(--e50), var(--e100));
  border: 1px solid var(--e200);
  display: flex; align-items: center; justify-content: center;
  color: var(--e600); flex-shrink: 0;
  transition: all .2s;
}
.bk-dp-trigger--open .bk-dp-trigger__icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; border-color: transparent;
  box-shadow: 0 2px 8px rgba(5,150,105,.3);
}
.bk-dp-trigger__text { flex: 1; text-align: left; min-width: 0; }
.bk-dp-trigger__label {
  font-size: 10px; font-weight: 700; color: var(--slate400);
  letter-spacing: .07em; text-transform: uppercase;
  margin: 0 0 2px; line-height: 1;
}
.bk-dp-trigger__value {
  font-size: 14px; font-weight: 600; color: var(--slate900); margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.bk-dp-trigger__placeholder { color: var(--slate300); font-weight: 400; font-size: 13px; }
.bk-dp-trigger__chevron {
  color: var(--slate300); transition: transform .25s var(--ease); flex-shrink: 0;
}
.bk-dp-trigger--open .bk-dp-trigger__chevron { transform: rotate(180deg); color: var(--e500); }

/* Calendar dropdown */
.bk-cal-drop {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 200;
  background: #fff;
  border: 1.5px solid var(--e200);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(5,150,105,.14), 0 4px 12px rgba(0,0,0,.06);
  padding: 16px;
  animation: slideDown .2s var(--ease);
}

.bk-cal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.bk-cal-month-label {
  font-family: 'Playfair Display', serif;
  font-size: 15px; font-weight: 700; color: var(--e900); margin: 0;
}
.bk-cal-nav-btn {
  width: 30px; height: 30px; border-radius: 9px;
  border: 1.5px solid var(--slate200); background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--slate500);
  transition: all .2s var(--ease);
}
.bk-cal-nav-btn:hover:not(:disabled) {
  background: var(--e50); border-color: var(--e300); color: var(--e700);
}
.bk-cal-nav-btn:disabled { opacity: .3; cursor: default; }

.bk-cal-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.bk-cal-wd {
  text-align: center; font-size: 10px; font-weight: 800;
  color: var(--e600); letter-spacing: .08em; text-transform: uppercase;
  padding: 3px 0;
}

.bk-cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
}
.bk-cal-day {
  aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 500; color: var(--slate700);
  border-radius: 9px; border: none; background: transparent;
  cursor: pointer; transition: all .15s ease;
  font-family: 'Inter', sans-serif; position: relative;
}
.bk-cal-day:hover:not(:disabled):not(.bk-cal-day--sel) {
  background: var(--e50); color: var(--e700); font-weight: 600;
}
.bk-cal-day--today {
  font-weight: 800; color: var(--e600);
}
.bk-cal-day--today::after {
  content: ''; position: absolute; bottom: 3px; left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px; border-radius: 50%; background: var(--e500);
}
.bk-cal-day--sel {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: #fff !important; font-weight: 700 !important;
  box-shadow: 0 3px 12px rgba(5,150,105,.35);
}
.bk-cal-day--sel::after { display: none; }
.bk-cal-day:disabled { color: var(--slate200); cursor: default; background: transparent; }
.bk-cal-day--empty { cursor: default; }
.bk-cal-day--empty:hover { background: transparent; }

.bk-cal-quick {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid var(--slate100);
}
.bk-cal-quick-btn {
  padding: 5px 11px; border-radius: 8px;
  border: 1.5px solid var(--slate200); background: #fff;
  font-size: 11px; font-weight: 600; color: var(--slate500);
  cursor: pointer; transition: all .2s var(--ease);
  font-family: 'Inter', sans-serif;
}
.bk-cal-quick-btn:hover {
  background: var(--e50); border-color: var(--e300); color: var(--e700);
}

/* Date range bar */
.bk-date-range-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px;
  background: linear-gradient(135deg, var(--e50), var(--e100));
  border: 1.5px solid var(--e200); border-radius: var(--radius-md);
  margin-top: 12px;
  animation: slideDown .25s var(--ease);
}
.bk-drb__item { flex: 1; text-align: center; min-width: 0; }
.bk-drb__label {
  font-size: 9px; font-weight: 800; color: var(--e600);
  letter-spacing: .1em; text-transform: uppercase;
  margin: 0 0 3px; line-height: 1;
}
.bk-drb__value {
  font-size: 13px; font-weight: 700; color: var(--e900); margin: 0;
}
.bk-drb__arrow { color: var(--e500); flex-shrink: 0; }
.bk-drb__nights {
  padding: 5px 11px; border-radius: 9px;
  background: var(--e600); color: #fff;
  font-size: 11px; font-weight: 800; flex-shrink: 0;
  white-space: nowrap;
}

/* ══════════════════════════════════════════════════
   SIDEBAR CARDS
══════════════════════════════════════════════════ */
.bk-scard {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--e100);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow .3s, transform .3s;
}
.bk-scard:hover {
  box-shadow: 0 6px 24px rgba(5,150,105,.10);
}

.bk-gallery-card {
  height: 230px; border-radius: var(--radius-lg);
  overflow: hidden; position: relative;
  border: 1.5px solid var(--e100);
  box-shadow: var(--shadow-md);
}

/* Why book */
.bk-why { padding: 20px 20px 18px; }
.bk-why__title {
  font-family: 'Playfair Display', serif;
  font-size: 16px; font-weight: 700; color: var(--e900);
  margin: 0 0 16px; display: flex; align-items: center; gap: 8px;
}
.bk-why__title-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--e500);
}
.bk-why-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--e50);
  transition: all .25s;
}
.bk-why-item:last-child { border: none; padding-bottom: 0; }
.bk-why-item:hover { padding-left: 4px; }
.bk-why-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--e50); border: 1.5px solid var(--e200);
  display: flex; align-items: center; justify-content: center;
  color: var(--e700); flex-shrink: 0;
  transition: all .3s var(--ease);
}
.bk-why-item:hover .bk-why-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; border-color: transparent;
  box-shadow: 0 4px 14px rgba(5,150,105,.3);
  transform: rotate(-5deg);
}
.bk-why-name { font-size: 13px; font-weight: 700; color: var(--slate800); margin: 0 0 2px; }
.bk-why-desc { font-size: 12px; color: var(--slate400); margin: 0; line-height: 1.5; }

/* Trust list */
.bk-trust-list { padding: 16px 20px; }
.bk-trust-list__title {
  font-size: 10.5px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .12em; color: var(--e600); margin: 0 0 12px;
}
.bk-trust-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 9px;
}
.bk-trust-row:last-child { margin: 0; }
.bk-trust-row__check {
  width: 22px; height: 22px; border-radius: 7px;
  background: var(--e50); border: 1.5px solid var(--e200);
  display: flex; align-items: center; justify-content: center;
  color: var(--e700); flex-shrink: 0;
}
.bk-trust-row__text { font-size: 12.5px; color: var(--slate600); font-weight: 500; }

/* WhatsApp card */
.bk-wa-card { padding: 18px 20px; }
.bk-wa-card__title {
  font-family: 'Playfair Display', serif;
  font-size: 15px; font-weight: 700; color: var(--e900); margin: 0 0 6px;
}
.bk-wa-card__desc {
  font-size: 12.5px; color: var(--slate500); margin: 0 0 14px; line-height: 1.55;
}
.bk-wa-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 12px 18px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none; border-radius: var(--radius-md);
  color: #fff; font-size: 13.5px; font-weight: 700;
  cursor: pointer; text-decoration: none;
  transition: all .3s var(--ease);
  box-shadow: 0 4px 18px rgba(34,197,94,.28);
  font-family: 'Inter', sans-serif; position: relative; overflow: hidden;
}
.bk-wa-btn::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  opacity: 0; transition: opacity .2s;
}
.bk-wa-btn:hover::before { opacity: 1; }
.bk-wa-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(34,197,94,.38);
}

/* Review card */
.bk-review { padding: 14px 18px; }
.bk-review__stars { display: flex; gap: 3px; margin-bottom: 8px; }
.bk-review__text {
  font-size: 12.5px; color: var(--slate600); margin: 0 0 6px;
  line-height: 1.65; font-style: italic;
}
.bk-review__author {
  font-size: 11px; color: var(--slate400); font-weight: 700; margin: 0;
}
.bk-review__score {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 99px;
  background: var(--e50); border: 1px solid var(--e200);
  font-size: 11px; font-weight: 800; color: var(--e700);
  margin-left: 8px;
}

/* Dates summary in sidebar */
.bk-dates-summary { padding: 14px 18px; }
.bk-dates-summary__title {
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .12em; color: var(--e600); margin: 0 0 10px;
}

/* Active travelers badge */
.bk-active-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, var(--e50), var(--e100));
  border: 1px solid var(--e200); border-radius: var(--radius-md);
  font-size: 12px; color: var(--e800); font-weight: 600;
}
.bk-active-badge__dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--e500);
  animation: pulse 2s ease infinite; flex-shrink: 0;
}

/* Debug bar */
.bk-debug {
  background: #fef9c3; border: 1px solid #fde047;
  border-radius: 8px; padding: 9px 12px;
  margin-bottom: 12px; font-size: 11px; color: #713f12;
  font-family: 'Courier New', monospace; line-height: 1.6;
}

/* ══════════════════════════════════════════════════
   REDUCED MOTION
══════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
`;

/* ── Style injection (once) ── */
let _injected = false;
function injectStyles() {
  if (_injected || typeof document === "undefined") return;
  if (document.getElementById("bk-styles-v4")) { _injected = true; return; }
  const el = document.createElement("style");
  el.id = "bk-styles-v4";
  el.textContent = BK_CSS;
  document.head.appendChild(el);
  _injected = true;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATE UTILITIES
═══════════════════════════════════════════════════════════════════════════ */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const toStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

const fmtShort  = (v) => v ? new Date(v).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "";
const fmtCompact= (v) => v ? new Date(v).toLocaleDateString("en-US", { month:"short", day:"numeric" }) : "";
const daysBetween = (a, b) => (!a || !b) ? 0 : Math.round((new Date(b) - new Date(a)) / 864e5);

const makeQuickPicks = (base = null) => {
  const d = base ? new Date(base) : new Date();
  const add = (n) => { const r = new Date(d); r.setDate(r.getDate() + n); return toStr(r.getFullYear(), r.getMonth(), r.getDate()); };
  return [
    { label: "1 week",   value: add(7) },
    { label: "2 weeks",  value: add(14) },
    { label: "1 month",  value: add(30) },
    { label: "3 months", value: add(90) },
  ];
};

const makeDepartureQuickPicks = (arrival) => {
  if (!arrival) return [];
  const d = new Date(arrival);
  const add = (n) => { const r = new Date(d); r.setDate(r.getDate() + n); return toStr(r.getFullYear(), r.getMonth(), r.getDate()); };
  return [
    { label: "3 nights",  value: add(3) },
    { label: "5 nights",  value: add(5) },
    { label: "7 nights",  value: add(7) },
    { label: "10 nights", value: add(10) },
    { label: "14 nights", value: add(14) },
  ];
};

/* ═══════════════════════════════════════════════════════════════════════════
   DATE PICKER
═══════════════════════════════════════════════════════════════════════════ */
const BkDatePicker = React.memo(function BkDatePicker({
  label, value, onChange, placeholder = "Select date",
  minDate = null, maxDate = null, error = false, icon = null, quickPicks = [],
}) {
  const [open, setOpen] = useState(false);
  const [vy, setVy] = useState(() => (value ? new Date(value) : new Date()).getFullYear());
  const [vm, setVm] = useState(() => (value ? new Date(value) : new Date()).getMonth());
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey  = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const today = new Date(); today.setHours(0,0,0,0);
  const minD  = minDate ? new Date(minDate) : today; minD.setHours(0,0,0,0);
  const maxD  = maxDate ? new Date(maxDate) : null; if (maxD) maxD.setHours(0,0,0,0);

  const firstDay    = new Date(vy, vm, 1).getDay();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const canPrev     = new Date(vy, vm, 1) > minD;
  const canNext     = !maxD || new Date(vy, vm + 1, 1) <= maxD;

  const navPrev = () => vm === 0  ? (setVm(11), setVy(y => y-1)) : setVm(m => m-1);
  const navNext = () => vm === 11 ? (setVm(0),  setVy(y => y+1)) : setVm(m => m+1);

  const selectDay = (day) => {
    const ds = toStr(vy, vm, day);
    onChange(ds); setOpen(false);
  };

  const isDisabled = (day) => {
    const d = new Date(vy, vm, day); d.setHours(0,0,0,0);
    return d < minD || (maxD && d > maxD);
  };
  const isToday = (day) => vy === today.getFullYear() && vm === today.getMonth() && day === today.getDate();
  const isSel   = (day) => {
    if (!value) return false;
    const s = new Date(value);
    return vy === s.getFullYear() && vm === s.getMonth() && day === s.getDate();
  };

  return (
    <div className="bk-dp" ref={ref}>
      <button
        type="button"
        className={[
          "bk-dp-trigger",
          open  ? "bk-dp-trigger--open"  : "",
          error ? "bk-dp-trigger--error" : "",
        ].join(" ")}
        onClick={() => setOpen(p => !p)}
      >
        <div className="bk-dp-trigger__icon">
          {icon || <FiCalendar size={16} />}
        </div>
        <div className="bk-dp-trigger__text">
          <p className="bk-dp-trigger__label">{label}</p>
          <p className={`bk-dp-trigger__value ${!value ? "bk-dp-trigger__placeholder" : ""}`}>
            {value ? fmtShort(value) : placeholder}
          </p>
        </div>
        <FiChevronRight size={15} className="bk-dp-trigger__chevron" />
      </button>

      {open && (
        <div className="bk-cal-drop">
          <div className="bk-cal-header">
            <button type="button" className="bk-cal-nav-btn" onClick={navPrev} disabled={!canPrev}>
              <FiChevronLeft size={13} />
            </button>
            <h4 className="bk-cal-month-label">{MONTHS[vm]} {vy}</h4>
            <button type="button" className="bk-cal-nav-btn" onClick={navNext} disabled={!canNext}>
              <FiChevronRight size={13} />
            </button>
          </div>

          <div className="bk-cal-weekdays">
            {WEEKDAYS_SHORT.map(w => <span key={w} className="bk-cal-wd">{w}</span>)}
          </div>

          <div className="bk-cal-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`e${i}`} className="bk-cal-day bk-cal-day--empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDisabled(day);
              let cls = "bk-cal-day";
              if (isToday(day)) cls += " bk-cal-day--today";
              if (isSel(day))   cls += " bk-cal-day--sel";
              return (
                <button
                  key={day} type="button" className={cls}
                  disabled={disabled}
                  onClick={() => !disabled && selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {quickPicks.length > 0 && (
            <div className="bk-cal-quick">
              {quickPicks.map(qp => (
                <button
                  key={qp.label} type="button" className="bk-cal-quick-btn"
                  onClick={() => {
                    onChange(qp.value); setOpen(false);
                    const d = new Date(qp.value);
                    setVy(d.getFullYear()); setVm(d.getMonth());
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

/* ── Date range display bar ── */
const DateRangeBar = React.memo(function DateRangeBar({ arrivalDate, departureDate }) {
  if (!arrivalDate && !departureDate) return null;
  const nights = daysBetween(arrivalDate, departureDate);
  return (
    <div className="bk-date-range-bar bk-slide-down">
      <div className="bk-drb__item">
        <p className="bk-drb__label">Arrival</p>
        <p className="bk-drb__value">{arrivalDate ? fmtCompact(arrivalDate) : "—"}</p>
      </div>
      <FiArrowRight size={14} className="bk-drb__arrow" />
      <div className="bk-drb__item">
        <p className="bk-drb__label">Departure</p>
        <p className="bk-drb__value">{departureDate ? fmtCompact(departureDate) : "—"}</p>
      </div>
      {nights > 0 && (
        <span className="bk-drb__nights">{nights} {nights === 1 ? "night" : "nights"}</span>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const HERO_IMG = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80&auto=format&fit=crop";

const STEP_META = [
  { icon: FiUsers,       color: "#10b981", label: "You",       desc: "Who's going on safari?" },
  { icon: FiMapPin,      color: "#059669", label: "Destination", desc: "Choose your African escape." },
  { icon: FiCalendar,    color: "#047857", label: "Trip",       desc: "Dates, guests & preferences." },
  { icon: FiMessageCircle, color: "#065f46", label: "Review",  desc: "Add notes & send." },
];

const WHY_ITEMS = [
  { Icon: FiShield,  title: "No Payment Required",  desc: "100% free to enquire. Pay only when confirmed." },
  { Icon: FiAward,   title: "Expert Safari Guides", desc: "Certified professionals with 10+ years in the field." },
  { Icon: FiCompass, title: "Bespoke Itineraries",  desc: "Every trip custom-crafted around your vision." },
  { Icon: FiZap,     title: "2-Hour Response",      desc: "We reply within 2 hours, guaranteed." },
];

const TRUST_ITEMS = [
  "100% free to enquire",
  "No hidden fees ever",
  "Response within 2 hours",
  "Certified local guides",
  "Flexible cancellation",
  "Fully insured & bonded",
];

/* ═══════════════════════════════════════════════════════════════════════════
   DATA NORMALISATION
═══════════════════════════════════════════════════════════════════════════ */
const normaliseDestination = (d) => ({
  value: String(d.id),
  label: d.name ?? "",
  countryId:    String(d.countryId ?? d.country_id ?? d.country?.id ?? ""),
  countrySlug:  d.countrySlug ?? d.country_slug ?? d.country?.slug ?? "",
  country:      d.countryName ?? d.country_name ?? (typeof d.country === "string" ? d.country : d.country?.name) ?? "",
  image:        d.heroImage ?? d.coverImageUrl ?? d.imageUrl ?? (Array.isArray(d.images) && d.images[0]) ?? null,
  tagline:      d.tagline,
  shortDescription: d.shortDescription ?? d.short_description,
  difficulty:   d.difficulty, category: d.category,
  rating:       d.rating, duration: d.duration,
  durationDays: d.durationDays ?? d.duration_days,
});

const normaliseCountry = (c) => ({
  value: String(c.id),
  label: c.name ?? "",
  slug:  c.slug ?? "",
  flag:  c.flag ?? c.flagUrl ?? c.flag_url ?? "",
});

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKING PAGE — INNER
═══════════════════════════════════════════════════════════════════════════ */
function BookingPage() {
  useEffect(injectStyles, []);

  const { data: rawCountries,     loading: cLoading } = useCountriesList({ limit: 100 });
  const { data: rawDestinations,  loading: dLoading } = useDestinationsList({ limit: 200 });

  const countriesList    = useMemo(() => (rawCountries    ?? []).map(normaliseCountry),    [rawCountries]);
  const destinationsList = useMemo(() => (rawDestinations ?? []).map(normaliseDestination), [rawDestinations]);

  const isDev    = import.meta.env.DEV;
  const form     = useBookingContext();
  const navigate = useNavigate();

  /* Hero image override from selected destination */
  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(d => d.value === String(form.data.destinationId));
    if (!dest?.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Your selection" };
  }, [destinationsList, form.data.destinationId]);

  /* Prefill from URL params */
  const [sp]  = useSearchParams();
  const pfRef = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    if (!s || pfRef.current === s || !destinationsList.length) return;
    const match = destinationsList.find(d =>
      d.label.toLowerCase().replace(/\s+/g, "-") === s || d.value === s
    );
    if (match) {
      pfRef.current = s;
      form.set("destinationId", match.value);
      if (match.countryId) form.set("countryId", match.countryId);
    }
  }, [sp, destinationsList]); // eslint-disable-line

  /* Auto-focus first input on step change */
  const firstInputRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [form.step]);

  /* Ripple on CTA */
  const [ripple, setRipple] = useState(null);
  const triggerRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 650);
  }, []);

  /* Build props for step components */
  const stepProps = {
    data: form.data, set: form.set, touch: form.touch,
    errors: form.errors, touched: form.touched,
    countriesList, destinationsList, firstInputRef,
    loading: cLoading || dLoading,
    DatePicker: BkDatePicker,
    DateRangeBar,
    makeQuickPicks,
    makeDepartureQuickPicks,
  };

  const renderStep = () => {
    switch (form.step) {
      case 0: return <Step0Identity    {...stepProps} />;
      case 1: return <Step1Destination {...stepProps} />;
      case 2: return <Step2Trip        {...stepProps} />;
      case 3: return <Step3Contact     {...stepProps} />;
      default: return null;
    }
  };

  const isLast   = form.step === form.STEPS.length - 1;
  const progress = ((form.step + 1) / form.STEPS.length) * 100;

  const handleNext = (e) => {
    triggerRipple(e);
    if (isLast) form.submit();
    else if (form.tryNext()) navigate(form.step + 1 > 0 ? `/booking/step/${form.step + 1}` : "/booking");
  };
  const handleBack = () => {
    form.goBack();
    navigate(form.step - 1 > 0 ? `/booking/step/${form.step - 1}` : "/booking");
  };
  const handleStepClick = (i) => {
    if (i < form.step) { form.jumpTo(i); navigate(i > 0 ? `/booking/step/${i}` : "/booking"); }
  };

  if (form.submitted) return <Navigate to="/booking/success" replace />;

  const SM = STEP_META[form.step];
  const StepIcon = SM.icon;

  return (
    <div className="bk-page">

      {/* ── HERO ── */}
      <div className="bk-hero">
        <img src={HERO_IMG} alt="African safari landscape" className="bk-hero__img" />
        <div className="bk-hero__overlay" />

        {/* Decorative particles */}
        <div className="bk-hero__particles" aria-hidden="true">
          {[
            { size: 80,  top: "15%", left: "8%",  delay: "0s"   },
            { size: 50,  top: "60%", left: "15%", delay: "1.5s" },
            { size: 120, top: "20%", left: "80%", delay: "0.8s" },
            { size: 40,  top: "70%", left: "88%", delay: "2.2s" },
          ].map((p, i) => (
            <div
              key={i}
              className="bk-hero__particle"
              style={{
                width: p.size, height: p.size,
                top: p.top, left: p.left,
                animationDelay: p.delay,
                animationDuration: `${3.5 + i * 0.7}s`,
              }}
            />
          ))}
        </div>

        <div className="bk-hero__content">
          <div className="bk-hero__eyebrow">
            <div className="bk-hero__eyebrow-dot" />
            <FiCompass size={11} />
            Safari Booking Portal
          </div>
          <h1 className="bk-hero__title">
            Plan Your <em>African</em> Adventure
          </h1>
          <p className="bk-hero__subtitle">
            A few details and our expert guides will craft your perfect,
            personalised safari itinerary.
          </p>
          <div className="bk-hero__stats">
            {[
              [FiStar,     "4.9/5 Rating"],
              [FiUsers,    "2,400+ Guests"],
              [FiGlobe,    "12 Countries"],
              [FiCheckCircle, "Free to Enquire"],
            ].map(([Icon, text]) => (
              <div key={text} className="bk-hero__stat">
                <Icon size={12} />{text}
              </div>
            ))}
          </div>
        </div>

        {/* Wave separator */}
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg"
               style={{ width:"100%", display:"block" }} preserveAspectRatio="none">
            <path d="M0,56 C360,0 720,0 1080,28 C1260,42 1380,14 1440,0 L1440,56 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <nav className="bk-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="bk-breadcrumb__sep"><FiChevronRight size={11} /></span>
        <Link to="/packages">Packages</Link>
        <span className="bk-breadcrumb__sep"><FiChevronRight size={11} /></span>
        <span style={{ color: "var(--slate700)", fontWeight: 600 }}>Book Your Safari</span>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div className="bk-layout bk-fade-up">

        {/* ════════════════════════════════
            FORM COLUMN — STICKY
        ════════════════════════════════ */}
        <div className="bk-form-col">
          <div className="bk-form-card">

            {/* Animated accent bar */}
            <div className="bk-form-card__accent" />

            {/* Progress */}
            <div className="bk-progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="bk-progress__fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Top bar */}
            <div className="bk-card-topbar">
              <div className="bk-card-topbar__brand">
                <div className="bk-card-topbar__icon">
                  <FiCompass size={17} color="#fff" />
                </div>
                <div>
                  <p className="bk-card-topbar__name">Safari Booking</p>
                  <p className="bk-card-topbar__step">Step {form.step + 1} of {form.STEPS.length} · {Math.round(progress)}% complete</p>
                </div>
              </div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-card-topbar__wa">
                <FiMessageCircle size={13} /> Chat
              </a>
            </div>

            {/* Stepper */}
            <div className="bk-stepper" role="navigation" aria-label="Booking steps">
              {form.STEPS.map((s, i) => {
                const active = form.step === i;
                const done   = form.step > i;
                const state  = active ? "active" : done ? "done" : "pending";
                return (
                  <React.Fragment key={s.id}>
                    <button
                      type="button"
                      className={`bk-step-tab bk-step-tab--${state}`}
                      onClick={() => done && handleStepClick(i)}
                      aria-current={active ? "step" : undefined}
                      aria-label={`Step ${i + 1}: ${s.label}`}
                    >
                      <div className={`bk-step-tab__bubble bk-step-tab__bubble--${state}`}>
                        {done ? <FiCheck size={11} /> : i + 1}
                      </div>
                      <span className="bk-step-tab__label">{s.label}</span>
                      {active && <div className="bk-step-tab__bar bk-scale-x" />}
                    </button>
                    {i < form.STEPS.length - 1 && (
                      <div className="bk-step-connector">
                        <div className={`bk-step-connector__line ${done ? "bk-step-connector__line--done" : ""}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Scrollable form area */}
            <div className="bk-form-scroll">

              {/* Error banner */}
              {form.submitError && (
                <div className="bk-error-banner" role="alert">
                  <FiAlertCircle size={17} color="#dc2626" style={{ flexShrink:0, marginTop:1 }} />
                  <div style={{ flex:1 }}>
                    <p className="bk-error-banner__msg">{form.submitError}</p>
                    <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                       className="bk-wa-btn" style={{ width:"auto", padding:"7px 13px", fontSize:12, display:"inline-flex" }}>
                      <FiMessageCircle size={13} /> WhatsApp Us
                    </a>
                  </div>
                  <button className="bk-error-banner__close" onClick={() => form.setSubmitError?.(null)} aria-label="Dismiss">
                    <FiX size={15} />
                  </button>
                </div>
              )}

              {/* Step heading */}
              <div className="bk-step-header">
                <div className="bk-step-header__icon-wrap">
                  <StepIcon size={22} color={SM.color} />
                  <span className="bk-step-header__num">{form.step + 1}/{form.STEPS.length}</span>
                </div>
                <h2 className="bk-step-header__title">
                  {form.step === 0 && form.displayName
                    ? `Hi, ${form.displayName}!`
                    : SM.label === "You" ? "Tell Us About You"
                    : SM.label === "Destination" ? "Choose Your Destination"
                    : SM.label === "Trip" ? "Trip Details"
                    : "Almost There!"}
                </h2>
                <p className="bk-step-header__desc">{SM.desc}</p>
              </div>

              {/* Dev debug */}
              {isDev && form.step === 1 && (
                <div className="bk-debug" style={{ margin: "12px 18px 0" }}>
                  <strong>🐛 Debug</strong><br />
                  dest: <strong>{destinationsList.length}</strong> |
                  countries: <strong>{countriesList.length}</strong><br />
                  countryId: <strong>"{form.data.countryId}"</strong> ({typeof form.data.countryId})<br />
                  matches: <strong>
                    {form.data.countryId
                      ? destinationsList.filter(d => d.countryId === String(form.data.countryId)).length
                      : "—"}
                  </strong>
                </div>
              )}

              {/* Step content with animation */}
              <div className="bk-form-body">
                <div key={`step-${form.step}`} className="bk-slide-right">
                  {renderStep()}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bk-nav">
              {form.step > 0 && (
                <button type="button" className="bk-btn-back" onClick={handleBack} disabled={form.submitting}>
                  <FiArrowLeft size={14} /> Back
                </button>
              )}
              <button
                type="button" className="bk-btn-next"
                onClick={handleNext} disabled={form.submitting}
              >
                {ripple && (
                  <span
                    className="bk-btn-next__ripple"
                    style={{ top: ripple.y, left: ripple.x }}
                  />
                )}
                {form.submitting ? (
                  <><Spinner /> Sending your request…</>
                ) : isLast ? (
                  <><FiSend size={14} /> Send My Request</>
                ) : (
                  <>Continue <FiArrowRight size={14} /></>
                )}
              </button>
            </div>

            {/* Trust strip */}
            <div className="bk-trust-strip" role="list">
              {[
                { Icon: RiShieldKeyholeLine, text: "256-bit SSL" },
                { Icon: MdVerified,          text: "No Payment" },
                { Icon: FiAward,             text: "Expert Guided" },
                { Icon: FiLock,              text: "Private & Safe" },
              ].map(({ Icon, text }) => (
                <div key={text} className="bk-trust-pill" role="listitem">
                  <div className="bk-trust-pill__icon">
                    <Icon size={10} />
                  </div>
                  {text}
                </div>
              ))}
            </div>

            <div className="bk-form-footer">
              <p>
                <RiShieldKeyholeLine size={11} style={{ color:"var(--e600)" }} />
                Your information is private and never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            SIDEBAR — SCROLLS NATURALLY
        ════════════════════════════════ */}
        <aside className="bk-sidebar-col">

          {/* Gallery */}
          <div className="bk-gallery-card">
            <GallerySlideshow hero={heroOverride} />
          </div>

          {/* Active travellers badge */}
          <div className="bk-active-badge">
            <div className="bk-active-badge__dot" />
            <FiEye size={13} style={{ color:"var(--e600)", flexShrink:0 }} />
            <span>
              <strong style={{ color:"var(--e800)" }}>14 travellers</strong>{" "}
              are viewing safaris right now
            </span>
          </div>

          {/* Date range summary */}
          {(form.data.arrivalDate || form.data.departureDate) && (
            <div className="bk-scard">
              <div className="bk-dates-summary">
                <p className="bk-dates-summary__title">📅 Your Trip Dates</p>
                <DateRangeBar
                  arrivalDate={form.data.arrivalDate}
                  departureDate={form.data.departureDate}
                />
              </div>
            </div>
          )}

          {/* Why book */}
          <div className="bk-scard">
            <div className="bk-why">
              <h3 className="bk-why__title">
                <div className="bk-why__title-dot" />
                Why Book With Altuvera?
              </h3>
              {WHY_ITEMS.map(({ Icon, title, desc }) => (
                <div key={title} className="bk-why-item">
                  <div className="bk-why-icon"><Icon size={16} /></div>
                  <div>
                    <p className="bk-why-name">{title}</p>
                    <p className="bk-why-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust checklist */}
          <div className="bk-scard">
            <div className="bk-trust-list">
              <p className="bk-trust-list__title">✅ Your Guarantee</p>
              {TRUST_ITEMS.map(item => (
                <div key={item} className="bk-trust-row">
                  <div className="bk-trust-row__check">
                    <FiCheck size={11} />
                  </div>
                  <span className="bk-trust-row__text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bk-scard">
            <div className="bk-wa-card">
              <h4 className="bk-wa-card__title">Prefer to chat directly?</h4>
              <p className="bk-wa-card__desc">
                Our safari experts are on WhatsApp — get instant, personalised answers.
              </p>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wa-btn">
                <FiMessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Review */}
          <div className="bk-scard">
            <div className="bk-review">
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div className="bk-review__stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} size={13} style={{ fill:"#f59e0b", color:"#f59e0b" }} />
                  ))}
                </div>
                <span className="bk-review__score">4.9 / 5.0</span>
              </div>
              <p className="bk-review__text">
                "Absolutely flawless from start to finish — the booking process
                was effortless, and the safari itself was the experience of a lifetime."
              </p>
              <p className="bk-review__author">— Sarah M., United Kingdom · Rwanda 2024</p>
            </div>
          </div>

          {/* Response time notice */}
          <div className="bk-scard" style={{ padding:"12px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:"linear-gradient(135deg,var(--e50),var(--e100))",
                border:"1.5px solid var(--e200)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--e600)", flexShrink:0,
              }}>
                <FiClock size={16} />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:"var(--e900)", margin:"0 0 2px" }}>
                  Average Response: 47 min
                </p>
                <p style={{ fontSize:12, color:"var(--slate400)", margin:0 }}>
                  Our team typically replies within 2 hours.
                </p>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUCCESS ROUTE
═══════════════════════════════════════════════════════════════════════════ */
function BookingSuccessRoute() {
  useEffect(injectStyles, []);
  const form = useBookingContext();
  if (!form.submitted) return <Navigate to="/booking" replace />;

  return (
    <div className="bk-page">
      {/* Hero */}
      <div className="bk-hero" style={{ height:"clamp(180px,20vw,250px)" }}>
        <img src={HERO_IMG} alt="" className="bk-hero__img" />
        <div className="bk-hero__overlay" />
        <div className="bk-hero__content">
          <div className="bk-hero__eyebrow">
            <FiCheckCircle size={11} /> Request Received
          </div>
          <h1 className="bk-hero__title" style={{ fontSize:"clamp(22px,3.5vw,40px)" }}>
            We've Got Your Request!
          </h1>
          <p className="bk-hero__subtitle">
            Our safari team will be in touch within 2 hours.
          </p>
        </div>
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg"
               style={{ width:"100%", display:"block" }} preserveAspectRatio="none">
            <path d="M0,56 C360,0 720,0 1080,28 C1260,42 1380,14 1440,0 L1440,56 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth:1340, margin:"0 auto", padding:"0 clamp(16px,3vw,36px) 80px" }}>
        <div
          className="bk-fade-up"
          style={{
            display:"grid",
            gridTemplateColumns:"minmax(0,1fr) 360px",
            gap:"clamp(20px,2.5vw,32px)",
            alignItems:"start",
            marginTop:"clamp(-50px,-7vw,-70px)",
          }}
        >
          <style>{`@media(max-width:1080px){ .bk-success-grid{grid-template-columns:1fr!important} }`}</style>

          <div className="bk-form-card bk-success-grid">
            <div className="bk-form-card__accent" />
            <SuccessScreen
              displayName={form.displayName}
              bookingRef={form.bookingRef}
              email={form.data.email}
              onReset={form.reset}
            />
          </div>

          <aside className="bk-sidebar-col bk-success-grid">
            <div className="bk-gallery-card"><GallerySlideshow /></div>
            <div className="bk-scard">
              <div className="bk-wa-card">
                <h4 className="bk-wa-card__title">Questions about your booking?</h4>
                <p className="bk-wa-card__desc">
                  Our team is standing by on WhatsApp to help with anything you need.
                </p>
                <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wa-btn">
                  <FiMessageCircle size={16} /> Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="bk-scard">
              <div className="bk-trust-list">
                <p className="bk-trust-list__title">What Happens Next?</p>
                {[
                  "You'll receive a confirmation email shortly",
                  "Our team reviews your request within 2 hours",
                  "We'll send a bespoke itinerary tailored to you",
                  "A coordinator contacts you to finalise details",
                ].map((item, i) => (
                  <div key={i} className="bk-trust-row">
                    <div className="bk-trust-row__check" style={{
                      background:`linear-gradient(135deg,#10b981,#059669)`,
                      color:"#fff", border:"none",
                      minWidth:22, width:22, height:22,
                      borderRadius:7, fontSize:10, fontWeight:800,
                    }}>
                      {i + 1}
                    </div>
                    <span className="bk-trust-row__text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export default function Booking() {
  return (
    <BookingProvider>
      <BookingRoutes />
    </BookingProvider>
  );
}

function BookingRoutes() {
  const form = useBookingContext();
  if (form.submitted) return <BookingSuccessRoute />;
  return <BookingPage />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAMED EXPORTS (consumed by step files)
═══════════════════════════════════════════════════════════════════════════ */
export {
  BkDatePicker,
  DateRangeBar,
  makeQuickPicks,
  makeDepartureQuickPicks,
};