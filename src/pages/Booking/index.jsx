// ============================================================================
// src/pages/Booking/Booking.jsx — Full Page Layout (not a modal/popup)
// ============================================================================

import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useParams, useNavigate, Navigate, Link } from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShield, FiInfo,
  FiAlertCircle, FiCheckCircle, FiX, FiMessageCircle,
  FiLock, FiGlobe, FiAward, FiMapPin, FiCalendar,
  FiUsers, FiStar, FiHeart, FiCompass,
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

/* ── Inject Styles ──────────────────────────────────────────────────── */
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
  from { opacity: 0; }
  to   { opacity: 1; }
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
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes bk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes bk-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}
@keyframes bk-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.bk-fade-up    { animation: bk-fade-up   0.45s var(--bk-ease) both; }
.bk-fade-in    { animation: bk-fade-in   0.35s ease both; }
.bk-step-in    { animation: bk-step-in   0.38s var(--bk-ease) both; }
.bk-slide-down { animation: bk-slide-down 0.3s ease both; }
.bk-scale-x    { animation: bk-scale-x   0.28s ease both; transform-origin: left; }

/* ── Page root ── */
.bk-page {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--bk-bg);
  min-height: 100vh;
}

/* ── Hero banner ── */
.bk-hero {
  position: relative;
  height: clamp(220px, 30vw, 340px);
  overflow: hidden;
  background: var(--bk-forest);
}
.bk-hero__img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}
.bk-hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(2,44,34,0.45) 0%,
    rgba(2,44,34,0.72) 100%
  );
}
.bk-hero__content {
  position: relative; z-index: 2;
  height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 0 clamp(20px, 5vw, 60px);
}
.bk-hero__label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 18px; border-radius: 999px;
  background: rgba(16,185,129,0.18); backdrop-filter: blur(10px);
  border: 1px solid rgba(74,222,128,0.35);
  color: #86efac; font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 16px;
}
.bk-hero__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(28px, 4.5vw, 52px);
  font-weight: 400; color: white; line-height: 1.12;
  letter-spacing: -0.02em; margin: 0 0 12px;
  text-shadow: 0 2px 24px rgba(0,0,0,0.35);
}
.bk-hero__sub {
  font-size: clamp(13px, 1.4vw, 16px);
  color: rgba(255,255,255,0.72); line-height: 1.72;
  font-weight: 300;
}
.bk-hero__wave {
  position: absolute; bottom: 0; left: 0; right: 0;
  line-height: 0;
}

/* ── Main layout ── */
.bk-main {
  max-width: 1360px;
  margin: 0 auto;
  padding: clamp(24px, 3vw, 44px) clamp(16px, 3vw, 40px) 72px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: clamp(20px, 2.5vw, 36px);
  align-items: flex-start;
}
@media (max-width: 1024px) {
  .bk-main { grid-template-columns: 1fr; }
  .bk-sidebar { order: -1; }
}

/* ── Form card ── */
.bk-form-card {
  background: var(--bk-surface);
  border-radius: var(--bk-radius);
  border: 1.5px solid #d1fae5;
  box-shadow: 0 4px 32px rgba(5,150,105,0.08);
  overflow: hidden;
}

/* Top accent bar */
.bk-form-card__accent {
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669, #0d9488);
}

/* ── Stepper ── */
.bk-stepper {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 clamp(16px, 3vw, 28px);
  overflow-x: auto;
  scrollbar-width: none;
}
.bk-stepper::-webkit-scrollbar { display: none; }

.bk-step-btn {
  position: relative;
  display: flex; align-items: center; gap: 9px;
  padding: 16px clamp(12px, 2vw, 20px);
  font-size: 13px; font-weight: 600;
  border: none; background: transparent;
  cursor: default; white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: color 0.25s;
  flex-shrink: 0;
}
.bk-step-btn--active  { color: #059669; cursor: default; }
.bk-step-btn--done    { color: #10b981; cursor: pointer; }
.bk-step-btn--pending { color: #94a3b8; }
.bk-step-btn--done:hover { color: #047857; }

.bk-step-num {
  width: 24px; height: 24px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; flex-shrink: 0;
  transition: all 0.25s;
}
.bk-step-num--active  { background: linear-gradient(135deg,#10b981,#059669); color: white; box-shadow: 0 3px 10px rgba(5,150,105,0.3); }
.bk-step-num--done    { background: #d1fae5; color: #047857; }
.bk-step-num--pending { background: #f1f5f9; color: #94a3b8; }

.bk-step-underline {
  position: absolute; bottom: 0; left: 12px; right: 12px;
  height: 2.5px; border-radius: 999px;
  background: linear-gradient(90deg, #10b981, #059669);
}

/* ── Form header ── */
.bk-form-header {
  padding: clamp(20px, 3vw, 32px) clamp(16px, 3vw, 32px) 0;
  text-align: center;
}
.bk-form-header__icon {
  width: 56px; height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1.5px solid #a7f3d0;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
  color: #059669;
}
.bk-form-header__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(22px, 2.8vw, 30px);
  font-weight: 400; color: var(--bk-forest);
  margin: 0 0 6px; line-height: 1.2;
}
.bk-form-header__desc {
  font-size: 14px; color: var(--bk-text-3);
  margin: 0; line-height: 1.65;
}

/* ── Form body ── */
.bk-form-body {
  padding: clamp(20px, 3vw, 28px) clamp(16px, 3vw, 32px);
}

/* ── Nav buttons ── */
.bk-nav {
  display: flex; align-items: center;
  padding: 0 clamp(16px,3vw,32px) clamp(20px,3vw,28px);
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
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(16,185,129,0.45);
}
.bk-btn-next:active:not(:disabled) { transform: scale(0.98); }
.bk-btn-next:disabled {
  opacity: 0.55; cursor: not-allowed;
  transform: none; box-shadow: none;
}

/* ── Trust strip ── */
.bk-trust-strip {
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 18px;
  padding: 14px clamp(16px,3vw,32px);
  border-top: 1px solid #f0fdf4;
  background: #fafffe;
}
.bk-trust-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--bk-text-3); font-weight: 500;
}
.bk-trust-item svg { color: #059669; flex-shrink: 0; }

/* ── Form footer ── */
.bk-form-footer {
  padding: 12px clamp(16px,3vw,32px);
  border-top: 1px solid #f1f5f9;
  background: #fafffe;
  text-align: center;
}
.bk-form-footer p {
  font-size: 11px; color: var(--bk-text-3);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin: 0;
}

/* ── Error banner ── */
.bk-error-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-radius: 14px;
  background: #fef2f2; border: 1.5px solid #fecaca;
  margin: 0 clamp(16px,3vw,32px) 0;
  animation: bk-slide-down 0.3s ease;
}
.bk-error-banner p { font-size: 14px; color: #b91c1c; margin: 0 0 10px; line-height: 1.6; }

/* ── Sidebar ── */
.bk-sidebar {
  display: flex; flex-direction: column; gap: 18px;
  position: sticky; top: 96px;
}
.bk-sidebar-card {
  background: var(--bk-surface);
  border-radius: var(--bk-radius);
  border: 1.5px solid #d1fae5;
  box-shadow: 0 4px 24px rgba(5,150,105,0.07);
  overflow: hidden;
}

/* Gallery card */
.bk-gallery-card {
  height: 260px; position: relative;
  background: var(--bk-forest);
  border-radius: var(--bk-radius);
  overflow: hidden;
  border: 1.5px solid #d1fae5;
  box-shadow: 0 4px 24px rgba(5,150,105,0.07);
}

/* Why card */
.bk-why-card {
  padding: 22px;
}
.bk-why-card__title {
  font-family: 'DM Serif Display', serif;
  font-size: 17px; font-weight: 400;
  color: var(--bk-forest); margin: 0 0 14px;
}
.bk-why-item {
  display: flex; align-items: flex-start; gap: 12px;
  margin-bottom: 13px;
}
.bk-why-item:last-child { margin-bottom: 0; }
.bk-why-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bk-mint); border: 1px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--bk-green-dk); flex-shrink: 0;
}
.bk-why-title { font-size: 13.5px; font-weight: 700; color: var(--bk-text); margin: 0 0 2px; }
.bk-why-desc  { font-size: 12.5px; color: var(--bk-text-3); margin: 0; line-height: 1.6; }

/* Trust card */
.bk-trust-card { padding: 20px 22px; }
.bk-trust-card__title {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--bk-green); margin: 0 0 14px;
}
.bk-trust-row {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 10px;
}
.bk-trust-row:last-child { margin-bottom: 0; }
.bk-trust-check {
  width: 22px; height: 22px; border-radius: 6px;
  background: var(--bk-mint); border: 1px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--bk-green-dk);
}
.bk-trust-text { font-size: 13px; color: var(--bk-text-2); font-weight: 500; }

/* WA button */
.bk-wa-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 14px 20px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none; border-radius: 14px;
  color: white; font-size: 14px; font-weight: 700;
  cursor: pointer; text-decoration: none;
  transition: all 0.3s var(--bk-ease);
  box-shadow: 0 6px 22px rgba(34,197,94,0.3);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.bk-wa-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(34,197,94,0.42);
}

/* Progress bar */
.bk-progress {
  height: 3px;
  background: #f0fdf4;
  border-radius: 0;
  overflow: hidden;
}
.bk-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.5s var(--bk-ease);
  border-radius: 0 999px 999px 0;
}

/* Section label */
.bk-section-label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px; border-radius: 999px;
  background: var(--bk-mint); color: var(--bk-green-dk);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  border: 1px solid #a7f3d0;
}

/* Breadcrumb */
.bk-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--bk-text-3); font-weight: 500;
  margin-bottom: 28px;
  padding: clamp(16px,2.5vw,32px) clamp(16px,3vw,40px) 0;
  max-width: 1360px; margin-left: auto; margin-right: auto;
}
.bk-breadcrumb a {
  color: var(--bk-green); text-decoration: none; font-weight: 600;
  transition: color 0.2s;
}
.bk-breadcrumb a:hover { color: var(--bk-green-dk); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

let _bkInjected = false;
function injectBkStyles() {
  if (_bkInjected || typeof document === "undefined") return;
  if (document.getElementById("bk-styles")) { _bkInjected = true; return; }
  const s = document.createElement("style");
  s.id = "bk-styles";
  s.textContent = BK_CSS;
  document.head.appendChild(s);
  _bkInjected = true;
}

/* ── Step icons ─────────────────────────────────────────────────────── */
const STEP_ICONS = [FiUsers, FiMapPin, FiCalendar, FiMessageCircle];

/* ── Why book items ─────────────────────────────────────────────────── */
const WHY_ITEMS = [
  { Icon: FiShield,   title: "No Payment Now",      desc: "Submit your request completely free — pay later." },
  { Icon: FiAward,    title: "Expert-Led Safaris",   desc: "Locally certified guides with 10+ years experience." },
  { Icon: FiCompass,  title: "Bespoke Itineraries",  desc: "Every trip custom-crafted around your exact wishes." },
  { Icon: FiHeart,    title: "24/7 Support",          desc: "Our team is always reachable, wherever you are." },
];

/* ── Hero background ────────────────────────────────────────────────── */
const HERO_IMG = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80&auto=format&fit=crop";

/* ══════════════════════════════════════════════════════════════════════
   BOOKING PAGE — INNER
══════════════════════════════════════════════════════════════════════ */
function BookingPage() {
  useEffect(injectBkStyles, []);

  const { data: rc = [] } = useCountriesList?.() || {};
  const { data: rd = [] } = useDestinationsList?.() || {};

  const countriesList = useMemo(
    () => rc.map(c => ({ value: String(c.id), label: c.name })), [rc]);

  const destinationsList = useMemo(
    () => rd.map(d => {
      const countryId =
        d.country_id || d.countryId ||
        (d.country && d.country.id) || (d.countryObj && d.countryObj.id) || "";
      const countryName =
        d.country_name || d.countryName ||
        (typeof d.country === "string" ? d.country : "") ||
        (d.country && d.country.name) || (d.countryObj && d.countryObj.name) || "";
      return {
        value: String(d.id), label: d.name,
        countryId: countryId ? String(countryId) : "",
        country: countryName,
        image: d.heroImage || d.imageUrl ||
          (Array.isArray(d.images) ? d.images[0] : undefined) ||
          (Array.isArray(d.gallery) && d.gallery[0]?.imageUrl) || null,
      };
    }), [rd]);

  const form = useBookingContext();
  const navigate = useNavigate();

  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(
      d => String(d.value) === String(form.data.destinationId));
    if (!dest || !dest.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Your selection" };
  }, [destinationsList, form.data.destinationId]);

  /* Prefill from ?destination= */
  const [sp] = useSearchParams();
  const ar = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    if (!s || ar.current === s || !destinationsList.length) return;
    const m = destinationsList.find(
      d => d.label.toLowerCase().replace(/\s+/g, "-") === s || String(d.value) === s);
    if (m) {
      ar.current = s;
      form.set("destinationId", m.value);
      if (m.countryId) form.set("countryId", m.countryId);
    }
  }, [sp, destinationsList]); // eslint-disable-line

  const firstInputRef = useRef(null);
  useEffect(() => { setTimeout(() => firstInputRef.current?.focus(), 350); }, [form.step]);

  const props = {
    data: form.data, set: form.set, touch: form.touch,
    errors: form.errors, touched: form.touched,
    countriesList, destinationsList, firstInputRef,
  };

  const renderStep = () => {
    switch (form.step) {
      case 0: return <Step0Identity    {...props} />;
      case 1: return <Step1Destination {...props} />;
      case 2: return <Step2Trip        {...props} />;
      case 3: return <Step3Contact     {...props} />;
      default: return null;
    }
  };

  const isLast = form.step === form.STEPS.length - 1;

  const goStep = useCallback((s) => {
    navigate(s > 0 ? `/booking/step/${s}` : "/booking");
  }, [navigate]);

  const handleNext = () => {
    if (isLast) { form.submit(); }
    else if (form.tryNext()) { goStep(form.step + 1); }
  };
  const handleBack = () => {
    form.goBack();
    goStep(form.step - 1);
  };
  const handleStepClick = (i) => {
    if (i <= form.step) { form.jumpTo(i); goStep(i); }
  };

  if (form.submitted) return <Navigate to="/booking/success" replace />;

  const HEADINGS = [
    form.displayName ? `Hi ${form.displayName}!` : "Let's get started",
    "Where to?",
    "When & how many?",
    "Send your request",
  ];

  const progressPct = ((form.step + 1) / form.STEPS.length) * 100;
  const StepIcon = STEP_ICONS[form.step] || FiCompass;

  return (
    <div className="bk-page">

      {/* ── Hero Banner ── */}
      <div className="bk-hero">
        <img src={HERO_IMG} alt="African safari" className="bk-hero__img" />
        <div className="bk-hero__overlay" />
        <div className="bk-hero__content">
          <div className="bk-hero__label">
            <FiCompass size={11} />
            Safari Booking
          </div>
          <h1 className="bk-hero__title">
            Plan Your African Adventure
          </h1>
          <p className="bk-hero__sub">
            Fill in a few details and our expert team will craft your perfect itinerary.
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
      <div style={{
        maxWidth: 1360, margin: "0 auto",
        padding: "16px clamp(16px,3vw,40px) 0",
      }}>
        <div className="bk-breadcrumb" style={{ margin: 0, padding: 0 }}>
          <Link to="/">Home</Link>
          <FiArrowRight size={12} />
          <Link to="/packages">Packages</Link>
          <FiArrowRight size={12} />
          <span style={{ color: "#0f172a" }}>Book Your Safari</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="bk-main bk-fade-up">

        {/* ── LEFT: Form card ── */}
        <div>
          <div className="bk-form-card">
            {/* Top accent */}
            <div className="bk-form-card__accent" />

            {/* Progress bar */}
            <div className="bk-progress">
              <div className="bk-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Header row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px clamp(16px,3vw,28px)", borderBottom: "1px solid #f0fdf4",
            }}>
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
                style={{ width: "auto", padding: "9px 18px", fontSize: 13 }}>
                <FiMessageCircle size={15} />
                Chat with Expert
              </a>
            </div>

            {/* Stepper */}
            <div className="bk-stepper">
              {form.STEPS.map((s, i) => {
                const active  = form.step === i;
                const done    = form.step > i;
                const canClick = done;
                const cls = active ? "bk-step-btn--active" : done ? "bk-step-btn--done" : "bk-step-btn--pending";
                const numCls = active ? "bk-step-num--active" : done ? "bk-step-num--done" : "bk-step-num--pending";
                return (
                  <button key={s.id} type="button"
                    className={`bk-step-btn ${cls}`}
                    onClick={() => canClick && handleStepClick(i)}
                    disabled={!canClick}>
                    <span className={`bk-step-num ${numCls}`}>
                      {done ? <FiCheck size={11} /> : i + 1}
                    </span>
                    <span style={{ display: "none" }} className="sm-inline">{s.label}</span>
                    <span style={{ fontSize: 12 }} className="step-label-desktop">{s.label}</span>
                    {active && <span className="bk-step-underline bk-scale-x" />}
                  </button>
                );
              })}
            </div>

            {/* Error banner */}
            {form.submitError && (
              <div className="bk-error-banner" style={{ margin: "16px clamp(16px,3vw,28px)" }}>
                <FiAlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <p>{form.submitError}</p>
                  <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                    className="bk-wa-btn"
                    style={{ width: "auto", padding: "8px 16px", fontSize: 12, display: "inline-flex" }}>
                    <FiMessageCircle size={13} /> Contact via WhatsApp
                  </a>
                </div>
                <button onClick={() => form.setSubmitError?.(null)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: 4, borderRadius: 6 }}>
                  <FiX size={16} />
                </button>
              </div>
            )}

            {/* Form heading */}
            <div className="bk-form-header">
              <div className="bk-form-header__icon">
                <StepIcon size={26} />
              </div>
              <h2 className="bk-form-header__title">{HEADINGS[form.step]}</h2>
              <p className="bk-form-header__desc">{form.STEPS[form.step]?.desc}</p>
            </div>

            {/* Step content */}
            <div className="bk-form-body">
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
                {form.submitting ? (
                  <><Spinner /> Sending…</>
                ) : isLast ? (
                  <><FiCheck size={16} /> Send My Request</>
                ) : (
                  <>Continue <FiArrowRight size={16} /></>
                )}
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
                  <Icon size={14} />
                  <span>{text}</span>
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

        {/* ── RIGHT: Sidebar ── */}
        <aside className="bk-sidebar">

          {/* Gallery card */}
          <div className="bk-gallery-card">
            <GallerySlideshow hero={heroOverride} />
          </div>

          {/* Why book card */}
          <div className="bk-sidebar-card">
            <div className="bk-why-card">
              <h3 className="bk-why-card__title">Why Book With Us?</h3>
              {WHY_ITEMS.map(({ Icon, title, desc }) => (
                <div key={title} className="bk-why-item">
                  <div className="bk-why-icon">
                    <Icon size={17} />
                  </div>
                  <div>
                    <p className="bk-why-title">{title}</p>
                    <p className="bk-why-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust checklist card */}
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
                  <div className="bk-trust-check">
                    <FiCheck size={12} />
                  </div>
                  <span className="bk-trust-text">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="bk-sidebar-card" style={{ padding: 20 }}>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 16, fontWeight: 400, color: "#022c22",
              margin: "0 0 8px",
            }}>
              Prefer to chat directly?
            </p>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 }}>
              Our safari experts are available on WhatsApp — get instant answers and personalised advice.
            </p>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
              className="bk-wa-btn">
              <FiMessageCircle size={17} />
              Chat on WhatsApp
            </a>
          </div>

          {/* Ratings snippet */}
          <div className="bk-sidebar-card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={14}
                    style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                ))}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>4.9 / 5</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 6px", lineHeight: 1.65 }}>
              "Absolutely flawless experience — from booking to the final sunset drive. The team went above and beyond."
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
      {/* Hero */}
      <div className="bk-hero" style={{ height: "clamp(180px,22vw,260px)" }}>
        <img src={HERO_IMG} alt="Success" className="bk-hero__img" />
        <div className="bk-hero__overlay" />
        <div className="bk-hero__content">
          <div className="bk-hero__label">
            <FiCheckCircle size={11} /> Booking Confirmed
          </div>
          <h1 className="bk-hero__title" style={{ fontSize: "clamp(24px,3.5vw,42px)" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "flex-start" }}
          className="bk-fade-up bk-success-grid">
          <style>{`
            @media (max-width: 1024px) {
              .bk-success-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>

          {/* Success card */}
          <div className="bk-form-card">
            <div className="bk-form-card__accent" />
            <SuccessScreen
              displayName={form.displayName}
              bookingRef={form.bookingRef}
              email={form.data.email}
              onReset={form.reset}
            />
          </div>

          {/* Sidebar */}
          <aside className="bk-sidebar" style={{ top: 96 }}>
            <div className="bk-gallery-card">
              <GallerySlideshow />
            </div>
            <div className="bk-sidebar-card" style={{ padding: 20 }}>
              <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, fontWeight: 400, color: "#022c22", margin: "0 0 8px" }}>
                Questions about your booking?
              </p>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.6 }}>
                Our team is standing by to assist you with any questions or special requests.
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
   STEP ROUTE
══════════════════════════════════════════════════════════════════════ */
function BookingStepRoute() {
  const { step } = useParams();
  const navigate = useNavigate();
  const form = useBookingContext();
  const idx = step === undefined ? 0 : parseInt(step, 10);

  useEffect(() => {
    if (Number.isNaN(idx) || idx < 0 || idx > form.STEPS.length - 1) {
      navigate("/booking", { replace: true });
      return;
    }
    if (idx !== form.step) form.goTo(idx);
  }, [idx, form.step]); // eslint-disable-line

  return <BookingPage />;
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