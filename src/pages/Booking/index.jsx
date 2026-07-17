// src/pages/Booking/Booking.jsx
import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShield,
  FiAlertCircle, FiX, FiMessageCircle, FiLock,
  FiGlobe, FiAward, FiMapPin, FiCalendar,
  FiUsers, FiStar, FiHeart, FiCompass, FiCheckCircle,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { MdVerified } from "react-icons/md";

import { BookingProvider, useBookingContext } from "./BookingContext";
import GallerySlideshow from "./components/GallerySlideshow";
import SuccessScreen    from "./components/SuccessScreen";
import { Spinner }      from "./components/FormComponents";

import Step0Identity    from "./steps/Step0Identity";
import Step1Destination from "./steps/Step1Destination";
import Step2Trip        from "./steps/Step2Trip";
import Step3Contact     from "./steps/Step3Contact";

import { useCountriesList }    from "../../hooks/useCountriesList";
import { useDestinationsList } from "../../hooks/useDestinationsList";

const WA = "250785751391";

/* ═══════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════ */
const BK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --bk-green:#059669;--bk-green-lt:#10b981;--bk-green-dk:#047857;
  --bk-forest:#022c22;--bk-mint:#ecfdf5;--bk-text:#0f172a;
  --bk-text-2:#475569;--bk-text-3:#94a3b8;--bk-border:#e2e8f0;
  --bk-surface:#ffffff;--bk-bg:#f0fdf4;--bk-radius:18px;
  --bk-ease:cubic-bezier(0.22,1,0.36,1);
}

/* ── Animations ── */
@keyframes bk-fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes bk-fade-in{from{opacity:0}to{opacity:1}}
@keyframes bk-step-in{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
@keyframes bk-slide-down{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes bk-scale-x{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes bk-spin{to{transform:rotate(360deg)}}
@keyframes bk-pulse-ring{0%{box-shadow:0 0 0 0 rgba(16,185,129,.35)}70%{box-shadow:0 0 0 8px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}
@keyframes bk-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes bk-check-pop{0%{transform:scale(0) rotate(-45deg)}50%{transform:scale(1.2) rotate(0deg)}100%{transform:scale(1) rotate(0deg)}}

.bk-fade-up{animation:bk-fade-up .4s var(--bk-ease) both}
.bk-fade-in{animation:bk-fade-in .3s ease both}
.bk-step-in{animation:bk-step-in .35s var(--bk-ease) both}
.bk-slide-down{animation:bk-slide-down .25s ease both}
.bk-scale-x{animation:bk-scale-x .25s ease both;transform-origin:left}

/* ══════════════════════════════════════════
   PAGE LAYOUT — form fixed, rest scrolls
══════════════════════════════════════════ */
.bk-page{
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
  background:var(--bk-bg);
}

/* Hero */
.bk-hero{
  position:relative;height:clamp(180px,24vw,280px);overflow:hidden;background:var(--bk-forest);
  z-index:1;
}
.bk-hero__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 35%}
.bk-hero__overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(2,44,34,.4) 0%,rgba(2,44,34,.72) 100%)}
.bk-hero__content{
  position:relative;z-index:2;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
  padding:0 clamp(16px,4vw,48px);
}
.bk-hero__label{
  display:inline-flex;align-items:center;gap:6px;
  padding:4px 14px;border-radius:99px;
  background:rgba(16,185,129,.16);backdrop-filter:blur(10px);
  border:1px solid rgba(74,222,128,.3);
  color:#86efac;font-size:10px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;
}
.bk-hero__title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(22px,3.5vw,42px);font-weight:400;color:#fff;
  line-height:1.12;letter-spacing:-.02em;margin:0 0 8px;
  text-shadow:0 2px 20px rgba(0,0,0,.3);
}
.bk-hero__sub{font-size:clamp(12px,1.2vw,14px);color:rgba(255,255,255,.68);line-height:1.65;font-weight:300}
.bk-hero__wave{position:absolute;bottom:0;left:0;right:0;line-height:0}

/* Main layout */
.bk-layout{
  position:relative;
  max-width:1320px;margin:0 auto;
  padding:0 clamp(12px,2.5vw,32px);
  display:grid;
  grid-template-columns:1fr 340px;
  gap:clamp(16px,2vw,28px);
  align-items:start;
  /* Pull form up into hero */
  margin-top:clamp(-60px,-8vw,-90px);
  z-index:2;
  padding-bottom:60px;
}

/* Form column — sticky */
.bk-form-col{
  position:sticky;
  top:clamp(12px,2vw,20px);
  z-index:10;
  max-height:calc(100vh - clamp(24px,4vw,40px));
  display:flex;
  flex-direction:column;
}

/* Sidebar — scrolls naturally */
.bk-sidebar-col{
  display:flex;flex-direction:column;gap:14px;
  padding-top:0;
  /* extends past hero bottom */
}

@media(max-width:1024px){
  .bk-layout{
    grid-template-columns:1fr;
    margin-top:clamp(-40px,-6vw,-60px);
  }
  .bk-form-col{
    position:relative;
    top:auto;
    max-height:none;
  }
  .bk-sidebar-col{
    order:2;
  }
}

/* ── Form card ── */
.bk-form-card{
  background:var(--bk-surface);border-radius:var(--bk-radius);
  border:1.5px solid #d1fae5;
  box-shadow:0 8px 40px rgba(5,150,105,.1),0 1px 3px rgba(0,0,0,.06);
  overflow:hidden;display:flex;flex-direction:column;
  flex:1;min-height:0;
}
.bk-form-card__accent{height:3px;background:linear-gradient(90deg,#10b981,#059669,#0d9488);flex-shrink:0}

/* Scrollable form interior */
.bk-form-scroll{
  flex:1;overflow-y:auto;overflow-x:hidden;
  scrollbar-width:thin;scrollbar-color:#d1fae5 transparent;
}
.bk-form-scroll::-webkit-scrollbar{width:5px}
.bk-form-scroll::-webkit-scrollbar-track{background:transparent}
.bk-form-scroll::-webkit-scrollbar-thumb{background:#d1fae5;border-radius:99px}
.bk-form-scroll::-webkit-scrollbar-thumb:hover{background:#a7f3d0}

/* Progress */
.bk-progress{height:2.5px;background:#f0fdf4;overflow:hidden;flex-shrink:0}
.bk-progress__fill{height:100%;background:linear-gradient(90deg,#10b981,#059669);transition:width .5s var(--bk-ease);border-radius:0 99px 99px 0}

/* Card top bar */
.bk-card-bar{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px clamp(14px,2.5vw,22px);border-bottom:1px solid #f0fdf4;
  flex-shrink:0;
}

/* Stepper */
.bk-stepper{
  display:flex;border-bottom:1px solid #f1f5f9;
  padding:0 clamp(14px,2.5vw,22px);overflow-x:auto;scrollbar-width:none;
  flex-shrink:0;
}
.bk-stepper::-webkit-scrollbar{display:none}
.bk-step-btn{
  position:relative;display:flex;align-items:center;gap:6px;
  padding:12px clamp(8px,1.5vw,14px);font-size:12px;font-weight:600;
  border:none;background:transparent;white-space:nowrap;flex-shrink:0;
  font-family:'Plus Jakarta Sans',sans-serif;transition:color .25s;cursor:default;
}
.bk-step-btn--active{color:#059669}
.bk-step-btn--done{color:#10b981;cursor:pointer}
.bk-step-btn--pending{color:#94a3b8}
.bk-step-btn--done:hover{color:#047857}
.bk-step-num{
  width:22px;height:22px;border-radius:50%;
  display:inline-flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:800;flex-shrink:0;transition:all .25s;
}
.bk-step-num--active{background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 2px 8px rgba(5,150,105,.25)}
.bk-step-num--done{background:#d1fae5;color:#047857}
.bk-step-num--pending{background:#f1f5f9;color:#94a3b8}
.bk-step-underline{
  position:absolute;bottom:0;left:8px;right:8px;height:2px;
  border-radius:99px;background:linear-gradient(90deg,#10b981,#059669);
}

/* Form heading */
.bk-form-header{padding:clamp(16px,2.5vw,24px) clamp(14px,2.5vw,26px) 0;text-align:center}
.bk-form-header__icon{
  width:46px;height:46px;border-radius:14px;
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1.5px solid #a7f3d0;
  display:inline-flex;align-items:center;justify-content:center;
  margin-bottom:10px;color:#059669;
}
.bk-form-header__title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(18px,2.4vw,24px);font-weight:400;color:var(--bk-forest);
  margin:0 0 4px;line-height:1.2;
}
.bk-form-header__desc{font-size:13px;color:var(--bk-text-3);margin:0;line-height:1.6}

/* Form body */
.bk-form-body{padding:clamp(14px,2.5vw,22px) clamp(14px,2.5vw,26px)}

/* Nav */
.bk-nav{
  display:flex;align-items:center;gap:10px;
  padding:0 clamp(14px,2.5vw,26px) clamp(14px,2.5vw,20px);
  flex-shrink:0;
}
.bk-btn-back{
  display:flex;align-items:center;gap:6px;height:42px;padding:0 14px;
  border:1.5px solid var(--bk-border);background:#fff;border-radius:12px;
  font-size:13px;font-weight:600;color:var(--bk-text-2);cursor:pointer;
  transition:all .25s var(--bk-ease);font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-btn-back:hover{background:#f8fafc;border-color:#cbd5e1;color:var(--bk-text);transform:translateX(-2px)}
.bk-btn-next{
  flex:1;height:46px;display:flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:12px;
  font-size:14px;font-weight:700;cursor:pointer;transition:all .3s var(--bk-ease);
  box-shadow:0 4px 20px rgba(16,185,129,.28);font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-btn-next:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(16,185,129,.4)}
.bk-btn-next:active:not(:disabled){transform:scale(.98)}
.bk-btn-next:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}

/* Trust strip */
.bk-trust-strip{
  display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:14px;
  padding:10px clamp(14px,2.5vw,26px);border-top:1px solid #f0fdf4;background:#fafffe;
  flex-shrink:0;
}
.bk-trust-item{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--bk-text-3);font-weight:500}
.bk-trust-item svg{color:#059669;flex-shrink:0}

/* Footer */
.bk-form-footer{
  padding:10px clamp(14px,2.5vw,26px);border-top:1px solid #f1f5f9;background:#fafffe;
  text-align:center;flex-shrink:0;
}
.bk-form-footer p{font-size:10px;color:var(--bk-text-3);display:flex;align-items:center;justify-content:center;gap:5px;margin:0}

/* Error banner */
.bk-error-banner{
  display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:12px;
  background:#fef2f2;border:1.5px solid #fecaca;margin:12px clamp(14px,2.5vw,22px);
  animation:bk-slide-down .25s ease;
}
.bk-error-banner p{font-size:13px;color:#b91c1c;margin:0 0 8px;line-height:1.55}

/* ══════════════════════════════════════════
   DATE PICKER
══════════════════════════════════════════ */
.bk-datepicker{
  position:relative;user-select:none;
}
.bk-datepicker-trigger{
  display:flex;align-items:center;gap:10px;
  width:100%;padding:12px 14px;
  background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;
  cursor:pointer;transition:all .2s ease;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-datepicker-trigger:hover{border-color:#a7f3d0}
.bk-datepicker-trigger--focused{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.12)}
.bk-datepicker-trigger--error{border-color:#fca5a5;box-shadow:0 0 0 3px rgba(239,68,68,.08)}
.bk-datepicker-trigger__icon{
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);
  display:flex;align-items:center;justify-content:center;
  color:#059669;flex-shrink:0;
}
.bk-datepicker-trigger__text{flex:1;text-align:left}
.bk-datepicker-trigger__label{font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:.06em;text-transform:uppercase;margin:0 0 2px}
.bk-datepicker-trigger__value{font-size:14px;font-weight:600;color:#0f172a;margin:0}
.bk-datepicker-trigger__value--placeholder{color:#94a3b8;font-weight:400}
.bk-datepicker-trigger__chevron{color:#94a3b8;transition:transform .2s}
.bk-datepicker-trigger--focused .bk-datepicker-trigger__chevron{transform:rotate(180deg)}

/* Calendar dropdown */
.bk-cal-dropdown{
  position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:100;
  background:#fff;border:1.5px solid #d1fae5;border-radius:16px;
  box-shadow:0 16px 48px rgba(5,150,105,.12),0 2px 8px rgba(0,0,0,.06);
  padding:14px;
  animation:bk-slide-down .2s ease;
}
.bk-cal-header{
  display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;
}
.bk-cal-month{font-family:'DM Serif Display',serif;font-size:15px;font-weight:400;color:var(--bk-forest);margin:0}
.bk-cal-nav{
  width:28px;height:28px;border-radius:8px;border:1px solid #e2e8f0;
  background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:#475569;transition:all .2s;
}
.bk-cal-nav:hover{background:#ecfdf5;border-color:#a7f3d0;color:#059669}
.bk-cal-nav:disabled{opacity:.3;cursor:default}
.bk-cal-weekdays{
  display:grid;grid-template-columns:repeat(7,1fr);gap:0;margin-bottom:4px;
}
.bk-cal-weekday{
  text-align:center;font-size:10px;font-weight:700;color:#94a3b8;
  letter-spacing:.06em;text-transform:uppercase;padding:4px 0;
}
.bk-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.bk-cal-day{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:500;color:#334155;border-radius:10px;
  border:none;background:transparent;cursor:pointer;
  transition:all .15s ease;position:relative;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-cal-day:hover:not(:disabled):not(.bk-cal-day--selected){background:#ecfdf5;color:#059669}
.bk-cal-day--today{font-weight:800;color:#059669}
.bk-cal-day--today::after{
  content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:#059669;
}
.bk-cal-day--selected{
  background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;
  box-shadow:0 2px 10px rgba(5,150,105,.3);
}
.bk-cal-day--selected::after{display:none}
.bk-cal-day--in-range{background:#d1fae5;color:#047857;border-radius:4px}
.bk-cal-day--range-start{border-radius:10px 4px 4px 10px}
.bk-cal-day--range-end{border-radius:4px 10px 10px 4px}
.bk-cal-day:disabled{color:#d1d5db;cursor:default;background:transparent}
.bk-cal-day--empty{cursor:default}
.bk-cal-day--empty:hover{background:transparent}

/* Quick picks */
.bk-cal-quick{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9}
.bk-cal-quick-btn{
  padding:5px 10px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;
  font-size:11px;font-weight:600;color:#475569;cursor:pointer;
  transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-cal-quick-btn:hover{background:#ecfdf5;border-color:#a7f3d0;color:#059669}

/* Date range display */
.bk-date-range-display{
  display:flex;align-items:center;gap:8px;padding:10px 14px;
  background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;
  margin-top:12px;
}
.bk-date-range-display__item{flex:1;text-align:center}
.bk-date-range-display__label{font-size:9px;font-weight:700;color:#059669;letter-spacing:.08em;text-transform:uppercase;margin:0 0 2px}
.bk-date-range-display__value{font-size:13px;font-weight:700;color:#022c22;margin:0}
.bk-date-range-display__arrow{color:#059669;flex-shrink:0}
.bk-date-range-display__duration{
  padding:4px 10px;border-radius:8px;background:#059669;color:#fff;
  font-size:11px;font-weight:700;flex-shrink:0;
}

/* ══════════════════════════════════════════
   SIDEBAR CARDS
══════════════════════════════════════════ */
.bk-sidebar-card{
  background:var(--bk-surface);border-radius:var(--bk-radius);
  border:1.5px solid #d1fae5;box-shadow:0 3px 20px rgba(5,150,105,.06);
  overflow:hidden;
}
.bk-gallery-card{
  height:220px;position:relative;background:var(--bk-forest);
  border-radius:var(--bk-radius);overflow:hidden;
  border:1.5px solid #d1fae5;box-shadow:0 3px 20px rgba(5,150,105,.06);
}
.bk-why-card{padding:16px 18px}
.bk-why-card__title{font-family:'DM Serif Display',serif;font-size:15px;font-weight:400;color:var(--bk-forest);margin:0 0 12px}
.bk-why-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.bk-why-item:last-child{margin-bottom:0}
.bk-why-icon{
  width:32px;height:32px;border-radius:9px;background:var(--bk-mint);border:1px solid #a7f3d0;
  display:flex;align-items:center;justify-content:center;color:var(--bk-green-dk);flex-shrink:0;
  transition:all .3s ease;
}
.bk-why-item:hover .bk-why-icon{background:var(--bk-green);color:#fff;border-color:var(--bk-green)}
.bk-why-title{font-size:12.5px;font-weight:700;color:var(--bk-text);margin:0 0 1px}
.bk-why-desc{font-size:11.5px;color:var(--bk-text-3);margin:0;line-height:1.55}
.bk-trust-card{padding:14px 16px}
.bk-trust-card__title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--bk-green);margin:0 0 10px}
.bk-trust-row{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.bk-trust-row:last-child{margin-bottom:0}
.bk-trust-check{
  width:20px;height:20px;border-radius:6px;background:var(--bk-mint);border:1px solid #a7f3d0;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--bk-green-dk);
}
.bk-trust-text{font-size:12px;color:var(--bk-text-2);font-weight:500}
.bk-wa-btn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:11px 16px;background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;border-radius:12px;color:#fff;font-size:13px;font-weight:700;
  cursor:pointer;text-decoration:none;transition:all .3s var(--bk-ease);
  box-shadow:0 4px 18px rgba(34,197,94,.24);font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-wa-btn:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(34,197,94,.35)}

/* Breadcrumb */
.bk-breadcrumb{
  display:flex;align-items:center;gap:6px;font-size:12px;color:var(--bk-text-3);font-weight:500;
  max-width:1320px;margin:0 auto;padding:10px clamp(12px,2.5vw,32px) 0;
}
.bk-breadcrumb a{color:var(--bk-green);text-decoration:none;font-weight:600;transition:color .2s}
.bk-breadcrumb a:hover{color:var(--bk-green-dk)}

/* Debug */
.bk-debug{background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:#713f12;font-family:monospace;line-height:1.5}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

let _bkInjected = false;
function injectBkStyles() {
  if (_bkInjected || typeof document === "undefined") return;
  if (document.getElementById("bk-styles-v3")) { _bkInjected = true; return; }
  const s = document.createElement("style");
  s.id = "bk-styles-v3";
  s.textContent = BK_CSS;
  document.head.appendChild(s);
  _bkInjected = true;
}

/* ═══════════════════════════════════════════════════════════════════
   DATE PICKER COMPONENT
═══════════════════════════════════════════════════════════════════ */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function formatDateShort(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateCompact(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysBetween(d1, d2) {
  if (!d1 || !d2) return 0;
  const a = new Date(d1); const b = new Date(d2);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const BkDatePicker = React.memo(function BkDatePicker({
  label, value, onChange, placeholder = "Select date",
  minDate = null, maxDate = null, error = false, icon = null,
  quickPicks = [],
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return d.getMonth();
  });
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minD = minDate ? new Date(minDate) : today;
  minD.setHours(0, 0, 0, 0);

  const maxD = maxDate ? new Date(maxDate) : null;
  if (maxD) maxD.setHours(0, 0, 0, 0);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const canPrev = new Date(viewYear, viewMonth, 1) > minD;
  const canNext = !maxD || new Date(viewYear, viewMonth + 1, 1) <= maxD;

  const goPrev = () => {
    if (!canPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (!canNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day) => {
    const ds = toDateStr(viewYear, viewMonth, day);
    onChange(ds);
    setOpen(false);
  };

  const isDayDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (d < minD) return true;
    if (maxD && d > maxD) return true;
    return false;
  };

  const isDayToday = (day) => {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
  };

  const isDaySelected = (day) => {
    if (!value) return false;
    const sel = new Date(value);
    return viewYear === sel.getFullYear() && viewMonth === sel.getMonth() && day === sel.getDate();
  };

  return (
    <div className="bk-datepicker" ref={ref}>
      <button
        type="button"
        className={`bk-datepicker-trigger ${open ? "bk-datepicker-trigger--focused" : ""} ${error ? "bk-datepicker-trigger--error" : ""}`}
        onClick={() => setOpen(p => !p)}
      >
        <div className="bk-datepicker-trigger__icon">
          {icon || <FiCalendar size={16} />}
        </div>
        <div className="bk-datepicker-trigger__text">
          <p className="bk-datepicker-trigger__label">{label}</p>
          <p className={`bk-datepicker-trigger__value ${!value ? "bk-datepicker-trigger__value--placeholder" : ""}`}>
            {value ? formatDateShort(value) : placeholder}
          </p>
        </div>
        <FiChevronRight size={16} className="bk-datepicker-trigger__chevron" />
      </button>

      {open && (
        <div className="bk-cal-dropdown">
          <div className="bk-cal-header">
            <button type="button" className="bk-cal-nav" onClick={goPrev} disabled={!canPrev}>
              <FiChevronLeft size={14} />
            </button>
            <h4 className="bk-cal-month">{MONTHS[viewMonth]} {viewYear}</h4>
            <button type="button" className="bk-cal-nav" onClick={goNext} disabled={!canNext}>
              <FiChevronRight size={14} />
            </button>
          </div>

          <div className="bk-cal-weekdays">
            {WEEKDAYS.map(w => <span key={w} className="bk-cal-weekday">{w}</span>)}
          </div>

          <div className="bk-cal-grid">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <span key={`e-${i}`} className="bk-cal-day bk-cal-day--empty" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDayDisabled(day);
              const isToday = isDayToday(day);
              const selected = isDaySelected(day);
              let cls = "bk-cal-day";
              if (isToday) cls += " bk-cal-day--today";
              if (selected) cls += " bk-cal-day--selected";
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
                <button key={qp.label} type="button" className="bk-cal-quick-btn"
                  onClick={() => { onChange(qp.value); setOpen(false); const d = new Date(qp.value); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }}>
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

/* Date range display bar */
const DateRangeBar = ({ arrivalDate, departureDate }) => {
  if (!arrivalDate && !departureDate) return null;
  const nights = arrivalDate && departureDate ? daysBetween(arrivalDate, departureDate) : 0;
  return (
    <div className="bk-date-range-display bk-slide-down">
      <div className="bk-date-range-display__item">
        <p className="bk-date-range-display__label">Arrival</p>
        <p className="bk-date-range-display__value">{arrivalDate ? formatDateCompact(arrivalDate) : "—"}</p>
      </div>
      <FiArrowRight size={14} className="bk-date-range-display__arrow" />
      <div className="bk-date-range-display__item">
        <p className="bk-date-range-display__label">Departure</p>
        <p className="bk-date-range-display__value">{departureDate ? formatDateCompact(departureDate) : "—"}</p>
      </div>
      {nights > 0 && (
        <span className="bk-date-range-display__duration">{nights}N</span>
      )}
    </div>
  );
};

/* Quick pick date generators */
function makeQuickPicks(baseDate = null) {
  const base = baseDate ? new Date(baseDate) : new Date();
  const add = (d, days) => { const r = new Date(d); r.setDate(r.getDate() + days); return toDateStr(r.getFullYear(), r.getMonth(), r.getDate()); };
  return [
    { label: "In 1 week", value: add(base, 7) },
    { label: "In 2 weeks", value: add(base, 14) },
    { label: "In 1 month", value: add(base, 30) },
    { label: "In 3 months", value: add(base, 90) },
  ];
}

function makeDepartureQuickPicks(arrivalDate) {
  if (!arrivalDate) return [];
  const base = new Date(arrivalDate);
  const add = (d, days) => { const r = new Date(d); r.setDate(r.getDate() + days); return toDateStr(r.getFullYear(), r.getMonth(), r.getDate()); };
  return [
    { label: "3 nights", value: add(base, 3) },
    { label: "5 nights", value: add(base, 5) },
    { label: "7 nights", value: add(base, 7) },
    { label: "10 nights", value: add(base, 10) },
    { label: "14 nights", value: add(base, 14) },
  ];
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════ */
const HERO_IMG = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80&auto=format&fit=crop";
const STEP_ICONS = [FiUsers, FiMapPin, FiCalendar, FiMessageCircle];

const WHY_ITEMS = [
  { Icon: FiShield,  title: "No Payment Now",     desc: "Submit free — pay only when confirmed." },
  { Icon: FiAward,   title: "Expert-Led Safaris",  desc: "Certified guides, 10+ years experience." },
  { Icon: FiCompass, title: "Bespoke Itineraries", desc: "Custom-crafted around your wishes." },
  { Icon: FiHeart,   title: "24/7 Support",        desc: "Reachable anytime, wherever you are." },
];

/* ═══════════════════════════════════════════════════════════════════
   DATA NORMALISATION
═══════════════════════════════════════════════════════════════════ */
function normaliseDestination(d) {
  const rawCountryId = d.countryId ?? d.country_id ?? d.country?.id ?? d.countryObj?.id ?? "";
  const rawCountryName = d.countryName ?? d.country_name ?? (typeof d.country === "string" ? d.country : "") ?? d.country?.name ?? d.countryObj?.name ?? "";
  const rawCountrySlug = d.countrySlug ?? d.country_slug ?? d.country?.slug ?? d.countryObj?.slug ?? "";
  return {
    value: String(d.id), label: d.name ?? "",
    countryId: rawCountryId !== "" && rawCountryId !== null ? String(rawCountryId) : "",
    countrySlug: rawCountrySlug, country: rawCountryName,
    image: d.heroImage ?? d.coverImageUrl ?? d.imageUrl ?? (Array.isArray(d.images) && d.images[0]) ?? null,
    tagline: d.tagline, shortDescription: d.shortDescription ?? d.short_description,
    difficulty: d.difficulty, category: d.category, rating: d.rating,
    duration: d.duration, durationDays: d.durationDays ?? d.duration_days,
  };
}

function normaliseCountry(c) {
  return { value: String(c.id), label: c.name ?? "", slug: c.slug ?? "", flag: c.flag ?? c.flagUrl ?? c.flag_url ?? "" };
}

/* ═══════════════════════════════════════════════════════════════════
   BOOKING PAGE — INNER
═══════════════════════════════════════════════════════════════════ */
function BookingPage() {
  useEffect(injectBkStyles, []);

  const { data: rawCountries, loading: countriesLoading } = useCountriesList({ limit: 100 });
  const { data: rawDestinations, loading: destinationsLoading } = useDestinationsList({ limit: 200 });

  const countriesList = useMemo(() => (rawCountries ?? []).map(normaliseCountry), [rawCountries]);
  const destinationsList = useMemo(() => (rawDestinations ?? []).map(normaliseDestination), [rawDestinations]);

  const isDev = import.meta.env.DEV;
  const form = useBookingContext();
  const navigate = useNavigate();

  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(d => d.value === String(form.data.destinationId));
    if (!dest?.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Your selection" };
  }, [destinationsList, form.data.destinationId]);

  const [sp] = useSearchParams();
  const prefillRef = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    if (!s || prefillRef.current === s || !destinationsList.length) return;
    const match = destinationsList.find(d => d.label.toLowerCase().replace(/\s+/g, "-") === s || d.value === s);
    if (match) { prefillRef.current = s; form.set("destinationId", match.value); if (match.countryId) form.set("countryId", match.countryId); }
  }, [sp, destinationsList]); // eslint-disable-line

  const firstInputRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => firstInputRef.current?.focus(), 350); return () => clearTimeout(t); }, [form.step]);

  const stepProps = {
    data: form.data, set: form.set, touch: form.touch, errors: form.errors, touched: form.touched,
    countriesList, destinationsList, firstInputRef,
    loading: countriesLoading || destinationsLoading,
    // Pass date picker and range bar as render props
    DatePicker: BkDatePicker,
    DateRangeBar,
    makeQuickPicks,
    makeDepartureQuickPicks,
  };

  const renderStep = () => {
    switch (form.step) {
      case 0: return <Step0Identity {...stepProps} />;
      case 1: return <Step1Destination {...stepProps} />;
      case 2: return <Step2Trip {...stepProps} />;
      case 3: return <Step3Contact {...stepProps} />;
      default: return null;
    }
  };

  const isLast = form.step === form.STEPS.length - 1;

  const handleNext = () => {
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

  const HEADINGS = [
    form.displayName ? `Hi ${form.displayName}!` : "Let's get started",
    "Where would you like to go?",
    "When & how many travellers?",
    "Send your request",
  ];

  const progressPct = ((form.step + 1) / form.STEPS.length) * 100;
  const StepIcon = STEP_ICONS[form.step] ?? FiCompass;

  return (
    <div className="bk-page">
      {/* Hero */}
      <div className="bk-hero">
        <img src={HERO_IMG} alt="African safari" className="bk-hero__img" />
        <div className="bk-hero__overlay" />
        <div className="bk-hero__content">
          <div className="bk-hero__label"><FiCompass size={10} /> Safari Booking</div>
          <h1 className="bk-hero__title">Plan Your African Adventure</h1>
          <p className="bk-hero__sub">A few details and our experts will craft your perfect itinerary.</p>
        </div>
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }} preserveAspectRatio="none">
            <path d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bk-breadcrumb">
        <Link to="/">Home</Link><FiArrowRight size={10} />
        <Link to="/packages">Packages</Link><FiArrowRight size={10} />
        <span style={{ color: "#0f172a" }}>Book Your Safari</span>
      </div>

      {/* Main layout */}
      <div className="bk-layout bk-fade-up">

        {/* ══ FORM COLUMN — STICKY ══ */}
        <div className="bk-form-col">
          <div className="bk-form-card">
            <div className="bk-form-card__accent" />
            <div className="bk-progress"><div className="bk-progress__fill" style={{ width: `${progressPct}%` }} /></div>

            {/* Top bar */}
            <div className="bk-card-bar">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiCompass size={15} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#022c22", margin: 0 }}>Book Your Safari</p>
                  <p style={{ fontSize: 10.5, color: "#94a3b8", margin: 0, fontWeight: 500 }}>Step {form.step + 1} of {form.STEPS.length}</p>
                </div>
              </div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wa-btn" style={{ width: "auto", padding: "7px 12px", fontSize: 11.5 }}>
                <FiMessageCircle size={13} /> Chat
              </a>
            </div>

            {/* Stepper */}
            <div className="bk-stepper">
              {form.STEPS.map((s, i) => {
                const active = form.step === i; const done = form.step > i;
                const cls = active ? "bk-step-btn--active" : done ? "bk-step-btn--done" : "bk-step-btn--pending";
                const numCls = active ? "bk-step-num--active" : done ? "bk-step-num--done" : "bk-step-num--pending";
                return (
                  <button key={s.id} type="button" className={`bk-step-btn ${cls}`} onClick={() => done && handleStepClick(i)}>
                    <span className={`bk-step-num ${numCls}`}>{done ? <FiCheck size={10} /> : i + 1}</span>
                    <span>{s.label}</span>
                    {active && <span className="bk-step-underline bk-scale-x" />}
                  </button>
                );
              })}
            </div>

            {/* Scrollable interior */}
            <div className="bk-form-scroll">
              {/* Error banner */}
              {form.submitError && (
                <div className="bk-error-banner">
                  <FiAlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1 }}>
                    <p>{form.submitError}</p>
                    <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wa-btn" style={{ width: "auto", padding: "6px 12px", fontSize: 11, display: "inline-flex" }}>
                      <FiMessageCircle size={12} /> WhatsApp
                    </a>
                  </div>
                  <button onClick={() => form.setSubmitError?.(null)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: 3, borderRadius: 6 }}>
                    <FiX size={14} />
                  </button>
                </div>
              )}

              {/* Step heading */}
              <div className="bk-form-header">
                <div className="bk-form-header__icon"><StepIcon size={22} /></div>
                <h2 className="bk-form-header__title">{HEADINGS[form.step]}</h2>
                <p className="bk-form-header__desc">{form.STEPS[form.step]?.desc}</p>
              </div>

              {/* Step content */}
              <div className="bk-form-body">
                {isDev && form.step === 1 && (
                  <div className="bk-debug">
                    <strong>🐛 Debug</strong><br />
                    dest: <strong>{destinationsList.length}</strong> |
                    countries: <strong>{countriesList.length}</strong><br />
                    countryId: <strong>"{form.data.countryId}"</strong> ({typeof form.data.countryId})<br />
                    matching: <strong>{form.data.countryId ? destinationsList.filter(d => d.countryId === String(form.data.countryId)).length : "—"}</strong>
                  </div>
                )}
                <div key={form.step} className="bk-step-in">{renderStep()}</div>
              </div>
            </div>

            {/* Nav */}
            <div className="bk-nav">
              {form.step > 0 && (
                <button type="button" className="bk-btn-back" onClick={handleBack} disabled={form.submitting}>
                  <FiArrowLeft size={14} /> Back
                </button>
              )}
              <button type="button" className="bk-btn-next" onClick={handleNext} disabled={form.submitting}>
                {form.submitting ? <><Spinner /> Sending…</> : isLast ? <><FiCheck size={14} /> Send My Request</> : <>Continue <FiArrowRight size={14} /></>}
              </button>
            </div>

            {/* Trust strip */}
            <div className="bk-trust-strip">
              {[
                { Icon: RiShieldKeyholeLine, text: "256-bit SSL" },
                { Icon: MdVerified, text: "No Payment Required" },
                { Icon: FiAward, text: "Expert Guided" },
              ].map(({ Icon, text }) => (
                <div key={text} className="bk-trust-item"><Icon size={12} /><span>{text}</span></div>
              ))}
            </div>

            <div className="bk-form-footer">
              <p><RiShieldKeyholeLine size={10} style={{ color: "#059669" }} /> Your data is private & never shared</p>
            </div>
          </div>
        </div>

        {/* ══ SIDEBAR — SCROLLS NATURALLY ══ */}
        <aside className="bk-sidebar-col">
          <div className="bk-gallery-card"><GallerySlideshow hero={heroOverride} /></div>

          {/* Date range summary — always visible */}
          {(form.data.arrivalDate || form.data.departureDate) && (
            <div className="bk-sidebar-card" style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: "#059669", margin: "0 0 8px" }}>
                Your Trip Dates
              </p>
              <DateRangeBar arrivalDate={form.data.arrivalDate} departureDate={form.data.departureDate} />
            </div>
          )}

          {/* Why book */}
          <div className="bk-sidebar-card">
            <div className="bk-why-card">
              <h3 className="bk-why-card__title">Why Book With Us?</h3>
              {WHY_ITEMS.map(({ Icon, title, desc }) => (
                <div key={title} className="bk-why-item">
                  <div className="bk-why-icon"><Icon size={15} /></div>
                  <div><p className="bk-why-title">{title}</p><p className="bk-why-desc">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust checklist */}
          <div className="bk-sidebar-card">
            <div className="bk-trust-card">
              <p className="bk-trust-card__title">Your Guarantee</p>
              {["100% free to enquire", "No hidden fees", "Response within 2 hours", "Certified local guides", "Flexible cancellation", "Fully insured & bonded"].map(item => (
                <div key={item} className="bk-trust-row">
                  <div className="bk-trust-check"><FiCheck size={10} /></div>
                  <span className="bk-trust-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bk-sidebar-card" style={{ padding: 16 }}>
            <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 14, fontWeight: 400, color: "#022c22", margin: "0 0 6px" }}>Prefer to chat directly?</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.55 }}>Our safari experts are on WhatsApp — get instant answers.</p>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wa-btn"><FiMessageCircle size={15} /> Chat on WhatsApp</a>
          </div>

          {/* Review */}
          <div className="bk-sidebar-card" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 2 }}>{Array.from({ length: 5 }).map((_, i) => (<FiStar key={i} size={11} style={{ fill: "#f59e0b", color: "#f59e0b" }} />))}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>4.9 / 5</span>
            </div>
            <p style={{ fontSize: 11.5, color: "#64748b", margin: "0 0 4px", lineHeight: 1.6 }}>"Absolutely flawless — from booking to the final sunset drive."</p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 600 }}>— Sarah M., UK</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SUCCESS PAGE
═══════════════════════════════════════════════════════════════════ */
function BookingSuccessRoute() {
  useEffect(injectBkStyles, []);
  const form = useBookingContext();
  if (!form.submitted) return <Navigate to="/booking" replace />;

  return (
    <div className="bk-page">
      <div className="bk-hero" style={{ height: "clamp(150px,18vw,210px)" }}>
        <img src={HERO_IMG} alt="" className="bk-hero__img" />
        <div className="bk-hero__overlay" />
        <div className="bk-hero__content">
          <div className="bk-hero__label"><FiCheckCircle size={10} /> Booking Confirmed</div>
          <h1 className="bk-hero__title" style={{ fontSize: "clamp(20px,3vw,34px)" }}>We've Got Your Request!</h1>
        </div>
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }} preserveAspectRatio="none">
            <path d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "clamp(20px,3vw,36px) clamp(12px,2.5vw,32px) 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }} className="bk-fade-up bk-success-grid">
          <style>{`@media(max-width:1024px){.bk-success-grid{grid-template-columns:1fr!important}}`}</style>
          <div className="bk-form-card">
            <div className="bk-form-card__accent" />
            <SuccessScreen displayName={form.displayName} bookingRef={form.bookingRef} email={form.data.email} onReset={form.reset} />
          </div>
          <aside className="bk-sidebar-col">
            <div className="bk-gallery-card"><GallerySlideshow /></div>
            <div className="bk-sidebar-card" style={{ padding: 16 }}>
              <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 14, fontWeight: 400, color: "#022c22", margin: "0 0 6px" }}>Questions about your booking?</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.55 }}>Our team is standing by to help.</p>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wa-btn"><FiMessageCircle size={15} /> Chat on WhatsApp</a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PUBLIC EXPORT
═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   EXPORTED COMPONENTS FOR STEP FILES
═══════════════════════════════════════════════════════════════════ */
export { BkDatePicker, DateRangeBar, makeQuickPicks, makeDepartureQuickPicks };