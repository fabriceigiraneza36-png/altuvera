// src/pages/Booking/Booking.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING v8.0 — Ultra Modern Premium Responsive Design
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, AlertCircle, X, MessageSquare, Lock, Globe, Award, MapPin, Calendar, Users, Star, Heart, Sparkles, CheckCircle, ChevronLeft, ChevronRight, Send, Clock, Zap, Eye, Phone, ThumbsUp, CalendarDays, Mail, Compass, Shield } from "lucide-react";

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

const WA       = "250785751391";
const HERO_IMG = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80&auto=format&fit=crop";

/* ═══════════════════════════════════════════════════════════════════════════
   PREMIUM CUSTOM DESIGN STYLES
═══════════════════════════════════════════════════════════════════════════ */
const BK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --sb-emerald: #059669;
  --sb-emerald-light: #10b981;
  --sb-mint: #ecfdf5;
  --sb-forest: #022c22;
  --sb-slate-dark: #0f172a;
  --sb-slate-gray: #475569;
  --sb-slate-light: #94a3b8;
  --sb-border: #e2e8f0;
  --sb-bg: #f8fafc;
  --sb-card-shadow: 0 10px 30px -10px rgba(2, 44, 34, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02);
  --sb-transition: cubic-bezier(0.16, 1, 0.3, 1);
}

.bk-page {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  background-color: var(--sb-bg);
  color: var(--sb-slate-dark);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ── Hero Banner ── */
.bk-hero {
  position: relative;
  height: clamp(280px, 30vw, 420px);
  background-color: var(--sb-forest);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bk-hero__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  opacity: 0.55;
  filter: contrast(1.05) saturate(0.9);
}
.bk-hero__grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(2, 44, 34, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%);
  z-index: 1;
}
.bk-hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
}
.bk-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  padding: 6px 14px;
  border-radius: 100px;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.bk-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px, 4.5vw, 54px);
  font-weight: 400;
  color: #fff;
  line-height: 1.15;
  margin-bottom: 12px;
}
.bk-hero__title em {
  font-style: italic;
  color: var(--sb-emerald-light);
}
.bk-hero__sub {
  font-size: clamp(14px, 1.2vw, 16px);
  color: rgba(255, 255, 255, 0.7);
  max-width: 580px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Breadcrumb ── */
.bk-crumb {
  max-width: 1280px;
  margin: 20px auto 0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--sb-slate-gray);
}
.bk-crumb a {
  text-decoration: none;
  color: var(--sb-slate-gray);
  transition: color 0.2s ease;
}
.bk-crumb a:hover {
  color: var(--sb-emerald);
}
.bk-crumb__sep {
  color: var(--sb-slate-light);
  display: flex;
}

/* ── Layout ── */
.bk-layout {
  max-width: 1280px;
  margin: -60px auto 100px;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  position: relative;
  z-index: 10;
}

@media (max-width: 1024px) {
  .bk-layout {
    grid-template-columns: 1fr;
    margin-top: -30px;
  }
}

/* ── Main Form Card ── */
.bk-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--sb-border);
  box-shadow: var(--sb-card-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.bk-pbar {
  height: 4px;
  background-color: #f1f5f9;
}
.bk-pbar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sb-emerald-light), var(--sb-emerald));
  transition: width 0.4s var(--sb-transition);
}
.bk-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--sb-border);
}
.bk-topbar__title {
  font-size: 18px;
  font-weight: 800;
  color: var(--sb-slate-dark);
}
.bk-topbar__step {
  font-size: 13px;
  color: var(--sb-slate-gray);
  font-weight: 500;
  margin-top: 2px;
}
.bk-topbar__pct {
  color: var(--sb-emerald);
  font-weight: 700;
}
.bk-topbar__wa {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #22c55e;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 12px;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.bk-topbar__wa:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
}

/* Steps Navigation */
.bk-steps {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid var(--sb-border);
  overflow-x: auto;
  scrollbar-width: none;
}
.bk-steps::-webkit-scrollbar {
  display: none;
}
.bk-step {
  flex: 1;
  min-width: 120px;
  background: none;
  border: none;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.bk-step:disabled {
  cursor: default;
}
.bk-step--active {
  background: #fff;
  border-bottom: 2px solid var(--sb-emerald);
}
.bk-step__ring {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s ease;
}
.bk-step__ring--pending {
  background: #e2e8f0;
  color: var(--sb-slate-gray);
}
.bk-step__ring--active {
  background: var(--sb-emerald);
  color: #fff;
}
.bk-step__ring--done {
  background: var(--sb-mint);
  color: var(--sb-emerald);
}
.bk-step__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--sb-slate-gray);
}
.bk-step--active .bk-step__label {
  color: var(--sb-slate-dark);
  font-weight: 700;
}

/* Scroll Area & Form Controls */
.bk-scroll {
  padding: 40px;
  background: #fff;
}
@media (max-width: 640px) {
  .bk-scroll {
    padding: 24px;
  }
}
.bk-shdr {
  margin-bottom: 32px;
}
.bk-shdr__ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--sb-mint);
  color: var(--sb-emerald);
  margin-bottom: 16px;
}
.bk-shdr__h {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 28px;
  color: var(--sb-slate-dark);
  margin-bottom: 8px;
}
.bk-shdr__p {
  color: var(--sb-slate-gray);
  font-size: 15px;
  line-height: 1.5;
}

/* Injected Step Fields Styling */
.bk-field-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bk-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--sb-slate-dark);
}
.bk-input-wrap {
  position: relative;
}
.bk-input, .bk-select, .bk-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--sb-border);
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #fff;
}
.bk-input:focus, .bk-select:focus, .bk-textarea:focus {
  border-color: var(--sb-emerald);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}
.bk-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 640px) {
  .bk-field-row {
    grid-template-columns: 1fr;
  }
}

/* Destination Choices Grid */
.bk-dest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.bk-dest-card {
  border: 1.5px solid var(--sb-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s var(--sb-transition);
}
.bk-dest-card:hover {
  transform: translateY(-2px);
  border-color: var(--sb-emerald-light);
  box-shadow: 0 10px 20px -10px rgba(0,0,0,0.1);
}
.bk-dest-card--active {
  border-color: var(--sb-emerald);
  background: var(--sb-mint);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}
.bk-dest-card__img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}
.bk-dest-card__body {
  padding: 12px;
}
.bk-dest-card__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--sb-slate-dark);
}
.bk-dest-card__ctry {
  font-size: 12px;
  color: var(--sb-slate-gray);
  margin-top: 2px;
}

/* Chip Picker Selection */
.bk-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.bk-chip {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--sb-border);
  background: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bk-chip:hover {
  border-color: var(--sb-emerald-light);
}
.bk-chip--active {
  background: var(--sb-mint);
  border-color: var(--sb-emerald);
  color: var(--sb-emerald);
}

/* Counters */
.bk-counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border: 1px solid var(--sb-border);
  border-radius: 12px;
}
.bk-counter__lbl {
  font-size: 14px;
  font-weight: 700;
  color: var(--sb-slate-dark);
}
.bk-counter__sub {
  font-size: 12px;
  color: var(--sb-slate-gray);
}
.bk-counter__ctrl {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bk-counter__btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--sb-border);
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bk-counter__btn:hover {
  border-color: var(--sb-emerald);
  color: var(--sb-emerald);
}
.bk-counter__val {
  font-size: 16px;
  font-weight: 700;
  width: 20px;
  text-align: center;
}

/* Action Navigation Bar */
.bk-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 40px;
  background: #f8fafc;
  border-top: 1px solid var(--sb-border);
}
@media (max-width: 640px) {
  .bk-nav {
    padding: 20px 24px;
  }
}
.bk-btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--sb-border);
  border-radius: 10px;
  padding: 14px 24px;
  font-size: 14px;
  font-weight: 700;
  color: var(--sb-slate-gray);
  cursor: pointer;
  transition: all 0.2s ease;
}
.bk-btn-back:hover {
  background: #f1f5f9;
  border-color: var(--sb-slate-light);
}
.bk-btn-next {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--sb-emerald);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}
.bk-btn-next:hover {
  background: var(--sb-emerald-light);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

/* Custom Checkbox Elements */
.bk-check-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}
.bk-check {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--sb-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  background: #fff;
  flex-shrink: 0;
}
.bk-check--on {
  background: var(--sb-emerald);
  border-color: var(--sb-emerald);
  color: #fff;
}
.bk-check-txt {
  font-size: 13.5px;
  color: var(--sb-slate-gray);
  line-height: 1.4;
}

/* Form Error UI */
.bk-field-err {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ef4444;
  font-size: 12.5px;
  font-weight: 600;
  margin-top: 4px;
}
.bk-errbanner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  padding: 16px 20px;
  margin: 20px 40px 0;
  border-radius: 12px;
}
.bk-errbanner__msg {
  font-size: 14px;
  color: #b91c1c;
  font-weight: 500;
  flex: 1;
}

/* ── Calendar Picker Dropdown ── */
.bk-cal {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border: 1px solid var(--sb-border);
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  padding: 16px;
}
.bk-cal__hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.bk-cal__month {
  font-size: 14px;
  font-weight: 700;
}
.bk-cal__nav {
  border: 1px solid var(--sb-border);
  background: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.bk-cal__wds {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--sb-slate-light);
  margin-bottom: 4px;
}
.bk-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.bk-cal__day {
  aspect-ratio: 1;
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}
.bk-cal__day:hover:not(:disabled) {
  background: #f1f5f9;
}
.bk-cal__day--sel {
  background: var(--sb-emerald) !important;
  color: #fff !important;
}
.bk-cal__day:disabled {
  color: var(--sb-slate-light);
  opacity: 0.35;
  cursor: default;
}
.bk-cal__quick {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--sb-border);
}
.bk-cal__qbtn {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--sb-border);
  background: #fff;
  cursor: pointer;
}

/* Double Dates Preview */
.bk-drb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 8px;
  border: 1px solid var(--sb-border);
}
.bk-drb__lbl {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--sb-slate-gray);
}
.bk-drb__val {
  font-size: 13px;
  font-weight: 700;
  margin-top: 2px;
}

/* ── Elegant Refined Sidebar Cards ── */
.bk-scard {
  background: #fff;
  border: 1px solid var(--sb-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--sb-card-shadow);
}
.bk-scard__h {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.bk-scard__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.bk-scard__item:last-child {
  margin-bottom: 0;
}
.bk-scard__ico {
  color: var(--sb-emerald);
  flex-shrink: 0;
  margin-top: 2px;
}
.bk-scard__lbl {
  font-size: 13.5px;
  font-weight: 700;
}
.bk-scard__desc {
  font-size: 12px;
  color: var(--sb-slate-gray);
  margin-top: 2px;
  line-height: 1.4;
}
.bk-active {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--sb-border);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: var(--sb-card-shadow);
}
.bk-active__dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}
.bk-gallery {
  border-radius: 16px;
  overflow: hidden;
  height: 240px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const ID = "bk-v8-premium";
  if (document.getElementById(ID)) return;
  const s = document.createElement("style");
  s.id = ID;
  s.textContent = BK_CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATE UTILITIES
═══════════════════════════════════════════════════════════════════════════ */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDS    = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const toStr  = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const fmtS   = v => v ? new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
const fmtC   = v => v ? new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "";
const nights = (a, b) => (!a || !b) ? 0 : Math.round((new Date(b) - new Date(a)) / 864e5);

const makeQuickPicks = (base = null) => {
  const d = base ? new Date(base) : new Date();
  const add = n => { const r = new Date(d); r.setDate(r.getDate() + n); return toStr(r.getFullYear(), r.getMonth(), r.getDate()); };
  return [
    { label: "1 week",   value: add(7)  },
    { label: "2 weeks",  value: add(14) },
    { label: "1 month",  value: add(30) },
  ];
};

const makeDepartureQuickPicks = arrival => {
  if (!arrival) return [];
  const d = new Date(arrival);
  const add = n => { const r = new Date(d); r.setDate(r.getDate() + n); return toStr(r.getFullYear(), r.getMonth(), r.getDate()); };
  return [
    { label: "5 nights",  value: add(5)  },
    { label: "7 nights",  value: add(7)  },
    { label: "10 nights", value: add(10) },
    { label: "14 nights", value: add(14) },
  ];
};

/* ═══════════════════════════════════════════════════════════════════════════
   CALENDAR COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const BkDatePicker = React.memo(function BkDatePicker({
  label, value, onChange, placeholder = "Select date",
  minDate = null, maxDate = null, error = false,
  icon = null, quickPicks = [],
}) {
  const [open, setOpen] = useState(false);
  const [vy, setVy] = useState(() => (value ? new Date(value) : new Date()).getFullYear());
  const [vm, setVm] = useState(() => (value ? new Date(value) : new Date()).getMonth());
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const dn = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const dk = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", dn);
    document.addEventListener("keydown", dk);
    return () => { document.removeEventListener("mousedown", dn); document.removeEventListener("keydown", dk); };
  }, [open]);

  const tod = new Date(); tod.setHours(0,0,0,0);
  const minD = minDate ? new Date(minDate) : tod; minD.setHours(0,0,0,0);
  const maxD = maxDate ? new Date(maxDate) : null; if (maxD) maxD.setHours(0,0,0,0);

  const fd  = new Date(vy, vm, 1).getDay();
  const dim = new Date(vy, vm+1, 0).getDate();
  const canP = new Date(vy, vm, 1) > minD;
  const canN = !maxD || new Date(vy, vm+1, 1) <= maxD;

  const prev = () => vm === 0  ? (setVm(11), setVy(y => y - 1)) : setVm(m => m - 1);
  const next = () => vm === 11 ? (setVm(0),  setVy(y => y + 1)) : setVm(m => m + 1);
  const pick = day => { onChange(toStr(vy, vm, day)); setOpen(false); };

  const dis = day => { const d = new Date(vy, vm, day); d.setHours(0,0,0,0); return d < minD || (maxD && d > maxD); };
  const isT = day => vy === tod.getFullYear() && vm === tod.getMonth() && day === tod.getDate();
  const isS = day => { if (!value) return false; const s = new Date(value); return vy === s.getFullYear() && vm === s.getMonth() && day === s.getDate(); };

  return (
    <div className="bk-dp" ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={`bk-input ${error ? "bk-input--err" : ""}`}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}
        onClick={() => setOpen(p => !p)}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {icon || <Calendar size={18} />}
          <span>
            <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--sb-slate-gray)", textTransform: "uppercase" }}>{label}</span>
            <span style={{ display: "block", fontSize: "14px", fontWeight: 600, marginTop: "2px" }}>{value ? fmtS(value) : placeholder}</span>
          </span>
        </span>
        <ChevronRight size={16} style={{ color: "var(--sb-slate-light)" }} />
      </button>

      {open && (
        <div className="bk-cal">
          <div className="bk-cal__hdr">
            <button type="button" className="bk-cal__nav" onClick={prev} disabled={!canP}><ChevronLeft size={14} /></button>
            <span className="bk-cal__month">{MONTHS[vm]} {vy}</span>
            <button type="button" className="bk-cal__nav" onClick={next} disabled={!canN}><ChevronRight size={14} /></button>
          </div>
          <div className="bk-cal__wds">{WDS.map(w => <span key={w}>{w}</span>)}</div>
          <div className="bk-cal__grid">
            {Array.from({ length: fd }).map((_, i) => <span key={`e-${i}`} />)}
            {Array.from({ length: dim }).map((_, i) => {
              const day = i + 1;
              const disabled = dis(day);
              let classes = "bk-cal__day";
              if (isT(day)) classes += " bk-cal__day--today";
              if (isS(day)) classes += " bk-cal__day--sel";
              return (
                <button
                  key={day} type="button" className={classes} disabled={disabled}
                  onClick={() => !disabled && pick(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {quickPicks.length > 0 && (
            <div className="bk-cal__quick">
              {quickPicks.map(qp => (
                <button
                  key={qp.label} type="button" className="bk-cal__qbtn"
                  onClick={() => { onChange(qp.value); setOpen(false); }}
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

const DateRangeBar = React.memo(function DateRangeBar({ arrivalDate, departureDate }) {
  if (!arrivalDate && !departureDate) return null;
  const n = nights(arrivalDate, departureDate);
  return (
    <div className="bk-drb">
      <div>
        <span className="bk-drb__lbl">Arrival</span>
        <div className="bk-drb__val">{arrivalDate ? fmtC(arrivalDate) : "—"}</div>
      </div>
      <ArrowRight size={16} style={{ color: "var(--sb-slate-light)" }} />
      <div>
        <span className="bk-drb__lbl">Departure</span>
        <div className="bk-drb__val">{departureDate ? fmtC(departureDate) : "—"}</div>
      </div>
      {n > 0 && (
        <span style={{ fontSize: "12px", background: "var(--sb-mint)", color: "var(--sb-emerald)", fontWeight: 700, padding: "4px 8px", borderRadius: "6px" }}>
          {n} {n === 1 ? "night" : "nights"}
        </span>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   DATA NORMALISATION
═══════════════════════════════════════════════════════════════════════════ */
const norm_dest = d => ({
  value:            String(d.id),
  label:            d.name ?? "",
  countryId:        String(d.countryId ?? d.country_id ?? d.country?.id ?? ""),
  countrySlug:      d.countrySlug ?? d.country_slug ?? d.country?.slug ?? "",
  country:          d.countryName ?? d.country_name ?? (typeof d.country === "string" ? d.country : d.country?.name) ?? "",
  image:            d.heroImage ?? d.coverImageUrl ?? d.imageUrl ?? (Array.isArray(d.images) && d.images[0]) ?? null,
  tagline:          d.tagline,
  shortDescription: d.shortDescription ?? d.short_description,
  difficulty:       d.difficulty,
  category:         d.category,
  rating:           d.rating,
  duration:         d.duration,
  durationDays:     d.durationDays ?? d.duration_days,
});

const norm_ctry = c => ({
  value: String(c.id),
  label: c.name ?? "",
  slug:  c.slug ?? "",
  flag:  c.flag ?? c.flagUrl ?? c.flag_url ?? "",
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN BOOKING PROCESS COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
function BookingPage() {
  useEffect(injectStyles, []);

  const { data: rawC, loading: cL } = useCountriesList({ limit: 100 });
  const { data: rawD, loading: dL } = useDestinationsList({ limit: 200 });

  const countriesList    = useMemo(() => (rawC ?? []).map(norm_ctry),  [rawC]);
  const destinationsList = useMemo(() => (rawD ?? []).map(norm_dest),  [rawD]);

  const form     = useBookingContext();
  const navigate = useNavigate();

  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(d => d.value === String(form.data.destinationId));
    if (!dest?.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Selected Safari" };
  }, [destinationsList, form.data.destinationId]);

  const [sp] = useSearchParams();
  const pfRef = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    const attraction = sp.get("attraction");
    if (!s || pfRef.current === s || !destinationsList.length) return;
    const m = destinationsList.find(
      d => d.label.toLowerCase().replace(/\s+/g, "-") === s || d.value === s,
    );
    if (m) {
      pfRef.current = s;
      form.set("destinationId", m.value);
      if (m.countryId) form.set("countryId", m.countryId);
      if (attraction) form.set("attractionName", attraction);
    }
  }, [sp, destinationsList]); // eslint-disable-line

  const firstInputRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [form.step]);

  const stepProps = {
    data:             form.data,
    set:              form.set,
    touch:            form.touch,
    errors:           form.errors,
    touched:          form.touched,
    countriesList,
    destinationsList,
    firstInputRef,
    loading:          cL || dL,
    DatePicker:       BkDatePicker,
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

  const handleNext = () => {
    if (isLast) form.submit();
    else if (form.tryNext()) navigate(form.step + 1 > 0 ? `/booking/step/${form.step + 1}` : "/booking");
  };

  const handleBack = () => {
    form.goBack();
    navigate(form.step - 1 > 0 ? `/booking/step/${form.step - 1}` : "/booking");
  };

  const handleStepClick = i => {
    if (i < form.step) { form.jumpTo(i); navigate(i > 0 ? `/booking/step/${i}` : "/booking"); }
  };

  if (form.submitted) return <Navigate to="/booking/success" replace />;

  const SM = form.STEPS[form.step];

  return (
    <div className="bk-page">
      {/* Hero Header */}
      <header className="bk-hero">
        <img src={HERO_IMG} alt="Scenic African savannah safari" className="bk-hero__img" />
        <div className="bk-hero__grad" />
        <div className="bk-hero__content">
          <div className="bk-hero__badge">
            <Sparkles size={11} />
            Bespoke African Safaris
          </div>
          <h1 className="bk-hero__title">Tailor-Made <em>Safaris</em> Crafted For You</h1>
          <p className="bk-hero__sub">Enquire today with zero upfront payment. Our experienced local specialists will craft your perfect custom itinerary.</p>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="bk-crumb">
        <Link to="/">Home</Link>
        <span className="bk-crumb__sep"><ChevronRight size={11} /></span>
        <Link to="/packages">Packages</Link>
        <span className="bk-crumb__sep"><ChevronRight size={11} /></span>
        <span style={{ color: "var(--sb-slate-dark)", fontWeight: 700 }}>Safari Configurator</span>
      </nav>

      {/* Grid Layout Container */}
      <main className="bk-layout">
        <section className="bk-layout__main">
          <div className="bk-card">
            <div className="bk-pbar">
              <div className="bk-pbar__fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="bk-topbar">
              <div>
                <h2 className="bk-topbar__title">Plan Your African Odyssey</h2>
                <p className="bk-topbar__step">Step {form.step + 1} of {form.STEPS.length} — <span className="bk-topbar__pct">{Math.round(progress)}% Complete</span></p>
              </div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-topbar__wa">
                <MessageSquare size={14} /> Live Agent Chat
              </a>
            </div>

            {/* Stepper Navigation */}
            <nav className="bk-steps" aria-label="Step Progress">
              {form.STEPS.map((s, i) => {
                const active = form.step === i;
                const done   = form.step > i;
                const state  = active ? "active" : done ? "done" : "pending";
                return (
                  <button
                    key={s.id} type="button" className={`bk-step bk-step--${state}`}
                    disabled={!done} onClick={() => done && handleStepClick(i)}
                  >
                    <span className={`bk-step__ring bk-step__ring--${state}`}>
                      {done ? <Check size={12} /> : i + 1}
                    </span>
                    <span className="bk-step__label">{s.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Error Banner */}
            {form.submitError && (
              <div className="bk-errbanner" role="alert">
                <AlertCircle size={20} style={{ color: "#ef4444", flexShrink: 0 }} />
                <span className="bk-errbanner__msg">{form.submitError}</span>
                <button type="button" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }} onClick={() => form.setSubmitError?.(null)}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Step Body */}
            <div className="bk-scroll">
              <div className="bk-shdr">
                <h3 className="bk-shdr__h">
                  {form.step === 0 && form.displayName ? `Hi, ${form.displayName}!` : SM.label}
                </h3>
                <p className="bk-shdr__p">Please fill in your details below to proceed.</p>
              </div>
              <div key={`step-${form.step}`} className="bk-form-view">
                {renderStep()}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="bk-nav">
              {form.step > 0 && (
                <button type="button" className="bk-btn-back" onClick={handleBack} disabled={form.submitting}>
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <button type="button" className="bk-btn-next" onClick={handleNext} disabled={form.submitting}>
                {form.submitting ? (
                  <><Spinner /> Crafting Journey...</>
                ) : isLast ? (
                  <><Send size={15} /> Submit My Request</>
                ) : (
                  <>Continue <ArrowRight size={15} /></>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="bk-side-col" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="bk-gallery">
            <GallerySlideshow hero={heroOverride} />
          </div>

          <div className="bk-active">
            <div className="bk-active__dot" />
            <Eye size={14} style={{ color: "var(--sb-emerald)" }} />
            <span><strong>14 travelers</strong> viewing standard packages currently</span>
          </div>

          {(form.data.arrivalDate || form.data.departureDate) && (
            <div className="bk-scard">
              <h4 className="bk-scard__h"><CalendarDays size={16} /> Travel Schedule</h4>
              <DateRangeBar arrivalDate={form.data.arrivalDate} departureDate={form.data.departureDate} />
            </div>
          )}

          {/* Cleaned Value Props Card */}
          <div className="bk-scard">
            <h4 className="bk-scard__h"><Award size={16} /> Our Guarantee</h4>
            <div className="bk-scard__item">
              <ShieldCheck className="bk-scard__ico" size={18} />
              <div>
                <div className="bk-scard__lbl">Zero Upfront Risk</div>
                <div className="bk-scard__desc">Enquire 100% free. Pay only after your design is confirmed.</div>
              </div>
            </div>
            <div className="bk-scard__item">
              <Sparkles className="bk-scard__ico" size={18} />
              <div>
                <div className="bk-scard__lbl">Tailor-Made For You</div>
                <div className="bk-scard__desc">Customize activities, accommodations, pacing, and routes.</div>
              </div>
            </div>
            <div className="bk-scard__item">
              <Clock className="bk-scard__ico" size={18} />
              <div>
                <div className="bk-scard__lbl">Rapid Response Time</div>
                <div className="bk-scard__desc">Get a personalized itinerary drafted by experts in under 2 hours.</div>
              </div>
            </div>
          </div>

          {/* Social Proof Review */}
          <div className="bk-scard" style={{ borderLeft: "4px solid var(--sb-emerald)" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
            </div>
            <p style={{ fontSize: "13px", fontStyle: "italic", lineHeight: 1.5, color: "var(--sb-slate-gray)" }}>
              "The custom design was flawless. They made booking easy, matched our budget perfectly, and supported us 24/7."
            </p>
            <div style={{ fontSize: "11px", fontWeight: 700, marginTop: "8px", color: "var(--sb-slate-dark)" }}>
              — Sarah M., UK (Rwanda Safari)
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUCCESS SCREEN ROUTE
═══════════════════════════════════════════════════════════════════════════ */
function BookingSuccessRoute() {
  useEffect(injectStyles, []);
  const form = useBookingContext();
  if (!form.submitted) return <Navigate to="/booking" replace />;

  return (
    <div className="bk-page">
      <header className="bk-hero" style={{ height: "260px" }}>
        <img src={HERO_IMG} alt="" className="bk-hero__img" />
        <div className="bk-hero__grad" />
        <div className="bk-hero__content">
          <div className="bk-hero__badge"><CheckCircle size={11} /> Request Filed</div>
          <h1 className="bk-hero__title" style={{ fontSize: "clamp(24px, 4vw, 42px)" }}>Enquiry Successfully Logged</h1>
        </div>
      </header>

      <main style={{ maxWidth: "1280px", margin: "-40px auto 100px", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
        <section className="bk-card">
          <SuccessScreen
            displayName={form.displayName}
            bookingRef={form.bookingRef}
            email={form.data.email}
            onReset={form.reset}
          />
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="bk-scard">
            <h4 className="bk-scard__h"><Clock size={16} /> What Happens Next?</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px", fontSize: "13px" }}>
                <span style={{ background: "var(--sb-mint)", color: "var(--sb-emerald)", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center", fontWeight: "bold", flexShrink: 0 }}>1</span>
                <span>An automated email confirmation is sent to your inbox.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", fontSize: "13px" }}>
                <span style={{ background: "var(--sb-mint)", color: "var(--sb-emerald)", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center", fontWeight: "bold", flexShrink: 0 }}>2</span>
                <span>Our local travel architects analyze your criteria & pacing.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", fontSize: "13px" }}>
                <span style={{ background: "var(--sb-mint)", color: "var(--sb-emerald)", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justify: "center", fontWeight: "bold", flexShrink: 0 }}>3</span>
                <span>A bespoke day-by-day program gets compiled.</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

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

export { BkDatePicker, DateRangeBar, makeQuickPicks, makeDepartureQuickPicks };