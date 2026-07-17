// src/pages/Booking/Booking.jsx
import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShield,
  FiAlertCircle, FiX, FiMessageCircle, FiLock,
  FiGlobe, FiAward, FiMapPin, FiCalendar,
  FiUsers, FiStar, FiHeart, FiCompass, FiCheckCircle,
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

/* ── Styles ─────────────────────────────────────────────────────────── */
const BK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --bk-green:    #059669;
  --bk-green-lt: #10b981;
  --bk-green-dk: #047857;
  --bk-forest:   #022c22;
  --bk-mint:     #ecfdf5;
  --bk-text:     #0f172a;
  --bk-text-2:   #475569;
  --bk-text-3:   #94a3b8;
  --bk-border:   #e2e8f0;
  --bk-surface:  #ffffff;
  --bk-bg:       #f0fdf4;
  --bk-radius:   20px;
  --bk-ease:     cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes bk-fade-up {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bk-fade-in {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes bk-step-in {
  from { opacity: 0; transform: translateX(18px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes bk-slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bk-scale-x {
  from { transform: scaleX(0); } to { transform: scaleX(1); }
}
@keyframes bk-spin {
  to { transform: rotate(360deg); }
}
@keyframes bk-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}
@keyframes bk-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bk-fade-up    { animation: bk-fade-up    0.45s var(--bk-ease) both; }
.bk-fade-in    { animation: bk-fade-in    0.35s ease both; }
.bk-step-in    { animation: bk-step-in    0.38s var(--bk-ease) both; }
.bk-slide-down { animation: bk-slide-down 0.3s  ease both; }
.bk-scale-x    { animation: bk-scale-x    0.28s ease both; transform-origin: left; }

/* ── Page ── */
.bk-page {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--bk-bg);
  min-height: 100vh;
}

/* ── Hero ── */
.bk-hero {
  position: relative;
  height: clamp(200px, 28vw, 320px);
  overflow: hidden;
  background: var(--bk-forest);
}
.bk-hero__img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 35%;
}
.bk-hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(2,44,34,0.42) 0%, rgba(2,44,34,0.75) 100%);
}
.bk-hero__content {
  position: relative; z-index: 2; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 0 clamp(20px, 5vw, 60px);
}
.bk-hero__label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 18px; border-radius: 999px;
  background: rgba(16,185,129,0.18); backdrop-filter: blur(10px);
  border: 1px solid rgba(74,222,128,0.35);
  color: #86efac; font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 14px;
}
.bk-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(26px, 4vw, 48px);
  font-weight: 400; color: white; line-height: 1.12;
  letter-spacing: -0.02em; margin: 0 0 10px;
  text-shadow: 0 2px 24px rgba(0,0,0,0.35);
}
.bk-hero__sub {
  font-size: clamp(13px, 1.3vw, 15px);
  color: rgba(255,255,255,0.72); line-height: 1.7; font-weight: 300;
}
.bk-hero__wave {
  position: absolute; bottom: 0; left: 0; right: 0; line-height: 0;
}

/* ── Layout ── */
.bk-main {
  max-width: 1360px; margin: 0 auto;
  padding: clamp(24px,3vw,44px) clamp(16px,3vw,40px) 72px;
  display: grid;
  grid-template-columns: 1fr 370px;
  gap: clamp(20px,2.5vw,32px);
  align-items: flex-start;
}
@media (max-width: 1024px) {
  .bk-main { grid-template-columns: 1fr; }
}

/* ── Breadcrumb ── */
.bk-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--bk-text-3); font-weight: 500;
  max-width: 1360px; margin: 0 auto;
  padding: 14px clamp(16px,3vw,40px) 0;
}
.bk-breadcrumb a {
  color: var(--bk-green); text-decoration: none; font-weight: 600;
  transition: color 0.2s;
}
.bk-breadcrumb a:hover { color: var(--bk-green-dk); }

/* ── Form card ── */
.bk-form-card {
  background: var(--bk-surface);
  border-radius: var(--bk-radius);
  border: 1.5px solid #d1fae5;
  box-shadow: 0 4px 32px rgba(5,150,105,0.08);
  overflow: hidden;
}
.bk-form-card__accent {
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669, #0d9488);
}

/* ── Progress ── */
.bk-progress { height: 3px; background: #f0fdf4; overflow: hidden; }
.bk-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.55s var(--bk-ease);
  border-radius: 0 999px 999px 0;
}

/* ── Card top bar ── */
.bk-card-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px clamp(16px,3vw,28px); border-bottom: 1px solid #f0fdf4;
}

/* ── Stepper ── */
.bk-stepper {
  display: flex; border-bottom: 1px solid #f1f5f9;
  padding: 0 clamp(16px,3vw,28px);
  overflow-x: auto; scrollbar-width: none;
}
.bk-stepper::-webkit-scrollbar { display: none; }
.bk-step-btn {
  position: relative; display: flex; align-items: center; gap: 8px;
  padding: 15px clamp(10px,2vw,18px);
  font-size: 13px; font-weight: 600;
  border: none; background: transparent;
  white-space: nowrap; flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: color 0.25s;
}
.bk-step-btn--active  { color: #059669; cursor: default; }
.bk-step-btn--done    { color: #10b981; cursor: pointer; }
.bk-step-btn--pending { color: #94a3b8; cursor: default; }
.bk-step-btn--done:hover { color: #047857; }
.bk-step-num {
  width: 24px; height: 24px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; flex-shrink: 0; transition: all 0.25s;
}
.bk-step-num--active  { background: linear-gradient(135deg,#10b981,#059669); color: white; box-shadow: 0 3px 10px rgba(5,150,105,0.3); }
.bk-step-num--done    { background: #d1fae5; color: #047857; }
.bk-step-num--pending { background: #f1f5f9; color: #94a3b8; }
.bk-step-underline {
  position: absolute; bottom: 0; left: 10px; right: 10px;
  height: 2.5px; border-radius: 999px;
  background: linear-gradient(90deg, #10b981, #059669);
}

/* ── Form heading ── */
.bk-form-header {
  padding: clamp(20px,3vw,30px) clamp(16px,3vw,32px) 0;
  text-align: center;
}
.bk-form-header__icon {
  width: 54px; height: 54px; border-radius: 16px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1.5px solid #a7f3d0;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 12px; color: #059669;
}
.bk-form-header__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px, 2.6vw, 28px);
  font-weight: 400; color: var(--bk-forest);
  margin: 0 0 6px; line-height: 1.2;
}
.bk-form-header__desc {
  font-size: 14px; color: var(--bk-text-3);
  margin: 0; line-height: 1.65;
}

/* ── Form body ── */
.bk-form-body {
  padding: clamp(18px,3vw,26px) clamp(16px,3vw,32px);
}

/* ── Nav ── */
.bk-nav {
  display: flex; align-items: center;
  padding: 0 clamp(16px,3vw,32px) clamp(18px,3vw,26px);
  gap: 12px;
}
.bk-btn-back {
  display: flex; align-items: center; gap: 8px;
  height: 46px; padding: 0 18px;
  border: 1.5px solid var(--bk-border);
  background: white; border-radius: 14px;
  font-size: 14px; font-weight: 600; color: var(--bk-text-2);
  cursor: pointer; transition: all 0.25s var(--bk-ease);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.bk-btn-back:hover {
  background: #f8fafc; border-color: #cbd5e1; color: var(--bk-text);
  transform: translateX(-2px);
}
.bk-btn-next {
  flex: 1; height: 50px;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white; border: none; border-radius: 14px;
  font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.3s var(--bk-ease);
  box-shadow: 0 6px 24px rgba(16,185,129,0.32);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.bk-btn-next:hover:not(:disabled) {
  transform: translateY(-2px); box-shadow: 0 10px 32px rgba(16,185,129,0.45);
}
.bk-btn-next:active:not(:disabled) { transform: scale(0.98); }
.bk-btn-next:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

/* ── Trust strip ── */
.bk-trust-strip {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 18px;
  padding: 13px clamp(16px,3vw,32px);
  border-top: 1px solid #f0fdf4; background: #fafffe;
}
.bk-trust-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--bk-text-3); font-weight: 500;
}
.bk-trust-item svg { color: #059669; flex-shrink: 0; }

/* ── Footer ── */
.bk-form-footer {
  padding: 12px clamp(16px,3vw,32px);
  border-top: 1px solid #f1f5f9; background: #fafffe; text-align: center;
}
.bk-form-footer p {
  font-size: 11px; color: var(--bk-text-3);
  display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0;
}

/* ── Error banner ── */
.bk-error-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-radius: 14px;
  background: #fef2f2; border: 1.5px solid #fecaca;
  margin: 16px clamp(16px,3vw,28px);
  animation: bk-slide-down 0.3s ease;
}
.bk-error-banner p { font-size: 14px; color: #b91c1c; margin: 0 0 10px; line-height: 1.6; }

/* ── Sidebar ── */
.bk-sidebar {
  display: flex; flex-direction: column; gap: 18px;
  position: sticky; top: 88px;
}
.bk-sidebar-card {
  background: var(--bk-surface);
  border-radius: var(--bk-radius);
  border: 1.5px solid #d1fae5;
  box-shadow: 0 4px 24px rgba(5,150,105,0.07);
  overflow: hidden;
}
.bk-gallery-card {
  height: 250px; position: relative; background: var(--bk-forest);
  border-radius: var(--bk-radius); overflow: hidden;
  border: 1.5px solid #d1fae5;
  box-shadow: 0 4px 24px rgba(5,150,105,0.07);
}

/* ── Why card ── */
.bk-why-card { padding: 20px 22px; }
.bk-why-card__title {
  font-family: 'DM Serif Display', serif;
  font-size: 17px; font-weight: 400; color: var(--bk-forest); margin: 0 0 14px;
}
.bk-why-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 13px; }
.bk-why-item:last-child { margin-bottom: 0; }
.bk-why-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bk-mint); border: 1px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--bk-green-dk); flex-shrink: 0; transition: all 0.3s ease;
}
.bk-why-item:hover .bk-why-icon {
  background: var(--bk-green); color: white; border-color: var(--bk-green);
}
.bk-why-title { font-size: 13.5px; font-weight: 700; color: var(--bk-text); margin: 0 0 2px; }
.bk-why-desc  { font-size: 12.5px; color: var(--bk-text-3); margin: 0; line-height: 1.6; }

/* ── Trust checklist ── */
.bk-trust-card { padding: 18px 20px; }
.bk-trust-card__title {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--bk-green); margin: 0 0 13px;
}
.bk-trust-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
.bk-trust-row:last-child { margin-bottom: 0; }
.bk-trust-check {
  width: 22px; height: 22px; border-radius: 6px;
  background: var(--bk-mint); border: 1px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--bk-green-dk);
}
.bk-trust-text { font-size: 13px; color: var(--bk-text-2); font-weight: 500; }

/* ── WhatsApp btn ── */
.bk-wa-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 13px 20px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none; border-radius: 14px;
  color: white; font-size: 14px; font-weight: 700;
  cursor: pointer; text-decoration: none;
  transition: all 0.3s var(--bk-ease);
  box-shadow: 0 6px 22px rgba(34,197,94,0.28);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.bk-wa-btn:hover {
  transform: translateY(-2px); box-shadow: 0 10px 30px rgba(34,197,94,0.4);
}

/* ── Debug badge (dev only) ── */
.bk-debug {
  background: #fef9c3; border: 1px solid #fde047;
  border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;
  font-size: 12px; color: #713f12; font-family: monospace;
  line-height: 1.6;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

let _bkInjected = false;
function injectBkStyles() {
  if (_bkInjected || typeof document === "undefined") return;
  if (document.getElementById("bk-styles-v2")) { _bkInjected = true; return; }
  const s = document.createElement("style");
  s.id = "bk-styles-v2";
  s.textContent = BK_CSS;
  document.head.appendChild(s);
  _bkInjected = true;
}

/* ── Constants ───────────────────────────────────────────────────────── */
const HERO_IMG = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80&auto=format&fit=crop";
const STEP_ICONS = [FiUsers, FiMapPin, FiCalendar, FiMessageCircle];

const WHY_ITEMS = [
  { Icon: FiShield,   title: "No Payment Now",       desc: "Submit your request free — pay only when you confirm." },
  { Icon: FiAward,    title: "Expert-Led Safaris",    desc: "Locally certified guides with 10+ years of experience." },
  { Icon: FiCompass,  title: "Bespoke Itineraries",   desc: "Every trip custom-crafted around your exact wishes." },
  { Icon: FiHeart,    title: "24 / 7 Support",         desc: "Our team is always reachable, wherever you are." },
];

/* ══════════════════════════════════════════════════════════════════════
   DATA NORMALISATION — called once after fetch, fixes ALL type mismatches
══════════════════════════════════════════════════════════════════════ */

/**
 * Takes a raw destination row from the API and returns a normalised object
 * where every ID field is a STRING and every human-readable field is clean.
 */
function normaliseDestination(d) {
  // Resolve countryId from every possible field shape
  const rawCountryId =
    d.countryId     ??
    d.country_id    ??
    d.country?.id   ??
    d.countryObj?.id ??
    "";

  const rawCountryName =
    d.countryName      ??
    d.country_name     ??
    (typeof d.country === "string" ? d.country : "") ??
    d.country?.name    ??
    d.countryObj?.name ??
    "";

  const rawCountrySlug =
    d.countrySlug      ??
    d.country_slug     ??
    d.country?.slug    ??
    d.countryObj?.slug ??
    "";

  return {
    value      : String(d.id),
    label      : d.name ?? "",
    // ← ALL IDs stored as STRING so === comparisons always work
    countryId  : rawCountryId !== "" && rawCountryId !== null ? String(rawCountryId) : "",
    countrySlug: rawCountrySlug,
    country    : rawCountryName,
    image      :
      d.heroImage     ??
      d.coverImageUrl ??
      d.imageUrl      ??
      (Array.isArray(d.images) && d.images[0]) ??
      null,
    // pass through the rest so Step1 can render details
    tagline          : d.tagline,
    shortDescription : d.shortDescription ?? d.short_description,
    difficulty       : d.difficulty,
    category         : d.category,
    rating           : d.rating,
    duration         : d.duration,
    durationDays     : d.durationDays ?? d.duration_days,
  };
}

/**
 * Takes a raw country row and returns a normalised option shape.
 */
function normaliseCountry(c) {
  return {
    value: String(c.id),
    label: c.name ?? "",
    slug : c.slug ?? "",
    flag : c.flag ?? c.flagUrl ?? c.flag_url ?? "",
  };
}

/* ══════════════════════════════════════════════════════════════════════
   BOOKING PAGE — INNER
══════════════════════════════════════════════════════════════════════ */
function BookingPage() {
  useEffect(injectBkStyles, []);

  /* ── Raw API data ── */
  const { data: rawCountries,     loading: countriesLoading }    = useCountriesList({ limit: 100 });
  const { data: rawDestinations,  loading: destinationsLoading } = useDestinationsList({ limit: 200 });

  /* ── Normalised lists — consistent types, every ID is a STRING ── */
  const countriesList = useMemo(
    () => (rawCountries ?? []).map(normaliseCountry),
    [rawCountries],
  );

  const destinationsList = useMemo(
    () => (rawDestinations ?? []).map(normaliseDestination),
    [rawDestinations],
  );

  /* ── Debug in dev ── */
  const isDev = import.meta.env.DEV;

  const form     = useBookingContext();
  const navigate = useNavigate();

  /* Hero image override when a destination is chosen */
  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(d => d.value === String(form.data.destinationId));
    if (!dest?.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Your selection" };
  }, [destinationsList, form.data.destinationId]);

  /* Prefill from ?destination= query param */
  const [sp] = useSearchParams();
  const prefillRef = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    if (!s || prefillRef.current === s || !destinationsList.length) return;
    const match = destinationsList.find(
      d => d.label.toLowerCase().replace(/\s+/g, "-") === s || d.value === s,
    );
    if (match) {
      prefillRef.current = s;
      form.set("destinationId", match.value);
      if (match.countryId) form.set("countryId", match.countryId);
    }
  }, [sp, destinationsList]); // eslint-disable-line

  /* Auto-focus first input on step change */
  const firstInputRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [form.step]);

  /* Props passed to every step */
  const stepProps = {
    data             : form.data,
    set              : form.set,
    touch            : form.touch,
    errors           : form.errors,
    touched          : form.touched,
    countriesList,        // ← normalised
    destinationsList,     // ← normalised (all IDs are strings)
    firstInputRef,
    loading: countriesLoading || destinationsLoading,
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
  const StepIcon    = STEP_ICONS[form.step] ?? FiCompass;

  return (
    <div className="bk-page">

      {/* ── Hero ── */}
      <div className="bk-hero">
        <img src={HERO_IMG} alt="African safari" className="bk-hero__img" />
        <div className="bk-hero__overlay" />
        <div className="bk-hero__content">
          <div className="bk-hero__label">
            <FiCompass size={11} /> Safari Booking
          </div>
          <h1 className="bk-hero__title">Plan Your African Adventure</h1>
          <p className="bk-hero__sub">
            A few details and our experts will craft your perfect itinerary.
          </p>
        </div>
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", display: "block" }} preserveAspectRatio="none">
            <path d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="bk-breadcrumb">
        <Link to="/">Home</Link>
        <FiArrowRight size={12} />
        <Link to="/packages">Packages</Link>
        <FiArrowRight size={12} />
        <span style={{ color: "#0f172a" }}>Book Your Safari</span>
      </div>

      {/* ── Main grid ── */}
      <div className="bk-main bk-fade-up">

        {/* ══ FORM COLUMN ══ */}
        <div>
          <div className="bk-form-card">
            <div className="bk-form-card__accent" />

            {/* Progress bar */}
            <div className="bk-progress">
              <div className="bk-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Top bar */}
            <div className="bk-card-bar">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FiCompass size={17} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#022c22", margin: 0 }}>
                    Book Your Safari
                  </p>
                  <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
                    Step {form.step + 1} of {form.STEPS.length}
                  </p>
                </div>
              </div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="bk-wa-btn"
                style={{ width: "auto", padding: "9px 16px", fontSize: 13 }}>
                <FiMessageCircle size={15} />
                Chat with Expert
              </a>
            </div>

            {/* Stepper */}
            <div className="bk-stepper">
              {form.STEPS.map((s, i) => {
                const active = form.step === i;
                const done   = form.step > i;
                const cls    = active ? "bk-step-btn--active" : done ? "bk-step-btn--done" : "bk-step-btn--pending";
                const numCls = active ? "bk-step-num--active" : done ? "bk-step-num--done" : "bk-step-num--pending";
                return (
                  <button key={s.id} type="button"
                    className={`bk-step-btn ${cls}`}
                    onClick={() => done && handleStepClick(i)}>
                    <span className={`bk-step-num ${numCls}`}>
                      {done ? <FiCheck size={11} /> : i + 1}
                    </span>
                    <span>{s.label}</span>
                    {active && <span className="bk-step-underline bk-scale-x" />}
                  </button>
                );
              })}
            </div>

            {/* Error banner */}
            {form.submitError && (
              <div className="bk-error-banner">
                <FiAlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <p>{form.submitError}</p>
                  <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                    className="bk-wa-btn"
                    style={{ width: "auto", padding: "8px 14px", fontSize: 12, display: "inline-flex" }}>
                    <FiMessageCircle size={13} /> Contact via WhatsApp
                  </a>
                </div>
                <button onClick={() => form.setSubmitError?.(null)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 6 }}>
                  <FiX size={16} />
                </button>
              </div>
            )}

            {/* Step heading */}
            <div className="bk-form-header">
              <div className="bk-form-header__icon">
                <StepIcon size={25} />
              </div>
              <h2 className="bk-form-header__title">{HEADINGS[form.step]}</h2>
              <p className="bk-form-header__desc">{form.STEPS[form.step]?.desc}</p>
            </div>

            {/* Step content */}
            <div className="bk-form-body">
              {/* Dev debug info */}
              {isDev && form.step === 1 && (
                <div className="bk-debug">
                  <strong>🐛 Debug (dev only)</strong><br />
                  destinations loaded: <strong>{destinationsList.length}</strong> |{" "}
                  countries loaded: <strong>{countriesList.length}</strong><br />
                  selected countryId: <strong>"{form.data.countryId}"</strong> (type: {typeof form.data.countryId})<br />
                  matching destinations:{" "}
                  <strong>
                    {form.data.countryId
                      ? destinationsList.filter(d => d.countryId === String(form.data.countryId)).length
                      : "—"}
                  </strong>
                </div>
              )}
              <div key={form.step} className="bk-step-in">
                {renderStep()}
              </div>
            </div>

            {/* Navigation */}
            <div className="bk-nav">
              {form.step > 0 && (
                <button type="button" className="bk-btn-back"
                  onClick={handleBack} disabled={form.submitting}>
                  <FiArrowLeft size={16} /> Back
                </button>
              )}
              <button type="button" className="bk-btn-next"
                onClick={handleNext} disabled={form.submitting}>
                {form.submitting
                  ? <><Spinner /> Sending…</>
                  : isLast
                    ? <><FiCheck size={16} /> Send My Request</>
                    : <>Continue <FiArrowRight size={16} /></>
                }
              </button>
            </div>

            {/* Trust strip */}
            <div className="bk-trust-strip">
              {[
                { Icon: RiShieldKeyholeLine, text: "256-bit SSL Encrypted"  },
                { Icon: MdVerified,          text: "No Payment Required"    },
                { Icon: FiAward,             text: "Expert-Guided Safaris"  },
              ].map(({ Icon, text }) => (
                <div key={text} className="bk-trust-item">
                  <Icon size={14} /> <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bk-form-footer">
              <p>
                <RiShieldKeyholeLine size={12} style={{ color: "#059669" }} />
                Your data is private and never shared with third parties
              </p>
            </div>
          </div>
        </div>

        {/* ══ SIDEBAR ══ */}
        <aside className="bk-sidebar">

          <div className="bk-gallery-card">
            <GallerySlideshow hero={heroOverride} />
          </div>

          {/* Why book */}
          <div className="bk-sidebar-card">
            <div className="bk-why-card">
              <h3 className="bk-why-card__title">Why Book With Us?</h3>
              {WHY_ITEMS.map(({ Icon, title, desc }) => (
                <div key={title} className="bk-why-item">
                  <div className="bk-why-icon"><Icon size={17} /></div>
                  <div>
                    <p className="bk-why-title">{title}</p>
                    <p className="bk-why-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust checklist */}
          <div className="bk-sidebar-card">
            <div className="bk-trust-card">
              <p className="bk-trust-card__title">Your Guarantee</p>
              {[
                "100% free to enquire",
                "No hidden fees or charges",
                "Response within 2 hours",
                "Certified local guides",
                "Flexible cancellation policy",
                "Fully insured & bonded",
              ].map(item => (
                <div key={item} className="bk-trust-row">
                  <div className="bk-trust-check"><FiCheck size={12} /></div>
                  <span className="bk-trust-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp card */}
          <div className="bk-sidebar-card" style={{ padding: 20 }}>
            <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, fontWeight: 400, color: "#022c22", margin: "0 0 8px" }}>
              Prefer to chat directly?
            </p>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 }}>
              Our safari experts are on WhatsApp — get instant answers and personalised advice.
            </p>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
              className="bk-wa-btn">
              <FiMessageCircle size={17} /> Chat on WhatsApp
            </a>
          </div>

          {/* Review snippet */}
          <div className="bk-sidebar-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={13} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>4.9 / 5</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 6px", lineHeight: 1.65 }}>
              "Absolutely flawless — from booking to the final sunset drive. The team went above and beyond."
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontWeight: 600 }}>
              — Sarah M., United Kingdom
            </p>
          </div>

        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SUCCESS PAGE
══════════════════════════════════════════════════════════════════════ */
function BookingSuccessRoute() {
  useEffect(injectBkStyles, []);
  const form = useBookingContext();
  if (!form.submitted) return <Navigate to="/booking" replace />;

  return (
    <div className="bk-page">
      <div className="bk-hero" style={{ height: "clamp(170px,20vw,240px)" }}>
        <img src={HERO_IMG} alt="" className="bk-hero__img" />
        <div className="bk-hero__overlay" />
        <div className="bk-hero__content">
          <div className="bk-hero__label">
            <FiCheckCircle size={11} /> Booking Confirmed
          </div>
          <h1 className="bk-hero__title" style={{ fontSize: "clamp(22px,3.2vw,38px)" }}>
            We've Got Your Request!
          </h1>
        </div>
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", display: "block" }} preserveAspectRatio="none">
            <path d="M0,48 C480,0 960,0 1440,48 L1440,48 L0,48 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "clamp(24px,3vw,44px) clamp(16px,3vw,40px) 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: 28, alignItems: "flex-start" }}
          className="bk-fade-up bk-success-grid">
          <style>{`@media(max-width:1024px){.bk-success-grid{grid-template-columns:1fr!important}}`}</style>

          <div className="bk-form-card">
            <div className="bk-form-card__accent" />
            <SuccessScreen
              displayName={form.displayName}
              bookingRef={form.bookingRef}
              email={form.data.email}
              onReset={form.reset}
            />
          </div>

          <aside className="bk-sidebar">
            <div className="bk-gallery-card"><GallerySlideshow /></div>
            <div className="bk-sidebar-card" style={{ padding: 20 }}>
              <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, fontWeight: 400, color: "#022c22", margin: "0 0 8px" }}>
                Questions about your booking?
              </p>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 }}>
                Our team is standing by to help with any questions or special requests.
              </p>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                className="bk-wa-btn">
                <FiMessageCircle size={17} /> Chat on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PUBLIC EXPORT
══════════════════════════════════════════════════════════════════════ */
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