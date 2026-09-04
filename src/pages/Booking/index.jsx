// src/pages/Booking/Booking.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING v7.0 — Ultra Modern Professional Design
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useEffect, useMemo, useRef, useCallback, useState,
} from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import {
  HiArrowLeft, HiArrowRight, HiCheck, HiShieldCheck, HiExclamationCircle, HiX,
  HiChatAlt2, HiLockClosed, HiGlobe, HiBadgeCheck, HiLocationMarker, HiCalendar,
  HiUsers, HiStar, HiHeart, HiSparkles, HiCheckCircle, HiChevronLeft,
  HiChevronRight, HiPaperAirplane, HiClock, HiLightningBolt, HiEye, HiPhone,
  HiTrendingUp, HiCurrencyDollar, HiSupport, HiThumbUp,
} from "react-icons/hi";
import { HiOutlineSparkles } from "react-icons/hi2";

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
   ULTRA MODERN CSS
═══════════════════════════════════════════════════════════════════════════ */
const BK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --g:   #059669;
  --g2:  #10b981;
  --g3:  #34d399;
  --g4:  #6ee7b7;
  --g5:  #a7f3d0;
  --g6:  #d1fae5;
  --g7:  #ecfdf5;
  --g8:  #f0fdf4;
  --g-dark: #047857;
  --g-darker: #065f46;
  --ink: #0f172a;
  --ink2:#1e293b;
  --ink3:#334155;
  --ink4:#64748b;
  --ink5:#94a3b8;
  --ink6:#cbd5e1;
  --brd: #e2e8f0;
  --brd2:rgba(5,150,105,.12);
  --wh:  #ffffff;
  --off: #fafcfb;
  --ease:cubic-bezier(.22,1,.36,1);
  --ease2:cubic-bezier(.4,0,.2,1);
  --ease-bounce:cubic-bezier(.68,-.55,.265,1.55);
  --r10:10px; --r12:12px; --r14:14px; --r16:16px; --r20:20px; --r24:24px; --r28:28px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,.08);
  --shadow-lg: 0 8px 24px rgba(5,150,105,.12);
  --shadow-xl: 0 20px 48px rgba(5,150,105,.18);
  --shadow-glow: 0 0 40px rgba(16,185,129,.25);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

/* ── Keyframes ── */
@keyframes bkFadeUp   {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes bkFadeIn   {from{opacity:0}to{opacity:1}}
@keyframes bkSlideR   {from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes bkSlideD   {from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes bkScale    {from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes bkPop      {0%{transform:scale(.7);opacity:0}55%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes bkSpin     {to{transform:rotate(360deg)}}
@keyframes bkPulse    {0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.05)}}
@keyframes bkPulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}70%{box-shadow:0 0 0 10px rgba(16,185,129,0)}}
@keyframes bkFloat    {0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes bkShimmer  {0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes bkRipple   {0%{transform:scale(0);opacity:.6}100%{transform:scale(4);opacity:0}}
@keyframes bkWave     {from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes bkBounce   {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes bkGradient {0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

.bk-fade-up {animation:bkFadeUp .55s var(--ease) both}
.bk-slide-r {animation:bkSlideR .4s var(--ease) both}
.bk-slide-d {animation:bkSlideD .28s ease both}
.bk-pop     {animation:bkPop .4s var(--ease-bounce) both}
.bk-scale   {animation:bkScale .3s var(--ease) both}
.bk-wave-in {animation:bkWave .35s var(--ease) both;transform-origin:left}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
.bk-page {
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
  background:linear-gradient(180deg,#f0fdf4 0%,#ecfdf5 30%,#f8fffe 60%,#f0fdf4 100%);
  color:var(--ink);
  position:relative;
}

.bk-page::before {
  content:'';position:fixed;inset:0;
  background:
    radial-gradient(circle at 10% 20%,rgba(5,150,105,.05) 0%,transparent 50%),
    radial-gradient(circle at 90% 60%,rgba(16,185,129,.05) 0%,transparent 50%),
    radial-gradient(circle at 50% 90%,rgba(5,150,105,.03) 0%,transparent 40%);
  pointer-events:none;z-index:0;
}

/* ══════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════ */
.bk-hero {
  position:relative;
  height:clamp(320px,38vw,500px);
  overflow:hidden;
  background:var(--ink);
}

.bk-hero__img {
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;object-position:center 35%;
  transition:transform 14s ease;
  filter:brightness(.95);
}
.bk-hero:hover .bk-hero__img{transform:scale(1.08)}

.bk-hero__grad {
  position:absolute;inset:0;
  background:linear-gradient(
    165deg,
    rgba(15,23,42,.35) 0%,
    rgba(15,23,42,.2) 30%,
    rgba(5,150,105,.55) 65%,
    rgba(15,23,42,.9) 100%
  );
}

.bk-hero__mesh {
  position:absolute;inset:0;opacity:.4;
  background:
    radial-gradient(ellipse at 20% 30%,rgba(52,211,153,.15) 0%,transparent 50%),
    radial-gradient(ellipse at 80% 70%,rgba(16,185,129,.15) 0%,transparent 50%);
}

.bk-hero__orbs{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.bk-hero__orb{
  position:absolute;border-radius:50%;
  background:radial-gradient(circle,rgba(52,211,153,.25),transparent 70%);
  animation:bkFloat 6s ease-in-out infinite;
  filter:blur(20px);
}

.bk-hero__body {
  position:relative;z-index:2;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;gap:18px;
  padding:0 clamp(20px,5vw,60px);
}

.bk-hero__badge {
  display:inline-flex;align-items:center;gap:8px;
  padding:9px 22px;border-radius:50px;
  background:rgba(255,255,255,.12);
  backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,.2);
  font-size:11px;font-weight:700;
  color:rgba(255,255,255,.95);
  letter-spacing:.12em;text-transform:uppercase;
  box-shadow:0 4px 20px rgba(0,0,0,.15);
}

.bk-hero__dot {
  width:7px;height:7px;border-radius:50%;
  background:var(--g3);
  animation:bkPulseGlow 2s ease infinite;
  box-shadow:0 0 8px var(--g3);
}

.bk-hero__h1 {
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(32px,5.5vw,68px);
  font-weight:800;color:#fff;
  line-height:1.05;letter-spacing:-.025em;
  text-shadow:0 4px 40px rgba(0,0,0,.4);
}

.bk-hero__h1 em {
  font-style:italic;
  background:linear-gradient(135deg,#34d399,#6ee7b7,#a7f3d0);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:bkGradient 4s linear infinite;
}

.bk-hero__sub {
  font-size:clamp(14px,1.5vw,17px);
  color:rgba(255,255,255,.82);
  line-height:1.7;font-weight:400;
  max-width:540px;
  text-shadow:0 2px 20px rgba(0,0,0,.3);
}

.bk-hero__pills {
  display:flex;align-items:center;gap:10px;
  flex-wrap:wrap;justify-content:center;
  margin-top:4px;
}

.bk-hero__pill {
  display:flex;align-items:center;gap:7px;
  padding:8px 16px;border-radius:50px;
  background:rgba(255,255,255,.12);
  backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.18);
  font-size:12px;color:rgba(255,255,255,.9);font-weight:600;
  transition:all .3s var(--ease);
  cursor:default;
}
.bk-hero__pill:hover{
  background:rgba(255,255,255,.18);
  transform:translateY(-2px);
}
.bk-hero__pill svg{color:var(--g3)}

.bk-hero__wave {
  position:absolute;bottom:-1px;left:0;right:0;line-height:0;z-index:2;
}

/* ══════════════════════════════════════════════════════════
   BREADCRUMB
══════════════════════════════════════════════════════════ */
.bk-crumb {
  max-width:1400px;margin:0 auto;
  padding:16px clamp(16px,3vw,40px) 0;
  display:flex;align-items:center;gap:8px;
  font-size:12.5px;color:var(--ink4);font-weight:600;
  position:relative;z-index:2;
}
.bk-crumb a{
  color:var(--g);text-decoration:none;font-weight:700;
  transition:all .2s;
  padding:2px 4px;border-radius:6px;
}
.bk-crumb a:hover{color:var(--g-dark);background:var(--g8)}
.bk-crumb__sep{color:var(--g5);font-size:11px;opacity:.6}

/* ══════════════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════════════ */
.bk-layout {
  max-width:1400px;margin:0 auto;
  padding:0 clamp(16px,3vw,40px) 100px;
  display:grid;
  grid-template-columns:minmax(0,1fr) 410px;
  gap:clamp(20px,2.5vw,36px);
  align-items:start;
  margin-top:clamp(-90px,-11vw,-130px);
  position:relative;z-index:2;
}

.bk-form-col {
  position:sticky;top:20px;z-index:10;
  max-height:calc(100vh - 40px);
  display:flex;flex-direction:column;min-height:0;
}

.bk-side-col{display:flex;flex-direction:column;gap:14px}

@media(max-width:1100px) {
  .bk-layout{grid-template-columns:1fr;margin-top:clamp(-60px,-9vw,-90px)}
  .bk-form-col{position:relative;top:auto;max-height:none}
}

/* ══════════════════════════════════════════════════════════
   FORM CARD
══════════════════════════════════════════════════════════ */
.bk-card {
  background:white;
  border-radius:var(--r28);
  border:1px solid rgba(5,150,105,.08);
  box-shadow:
    0 0 0 1px rgba(5,150,105,.04),
    0 4px 6px rgba(0,0,0,.04),
    0 20px 60px rgba(5,150,105,.1),
    0 40px 100px rgba(0,0,0,.08);
  display:flex;flex-direction:column;
  overflow:hidden;flex:1;min-height:0;
  position:relative;
  transition:box-shadow .4s;
}

.bk-card__top {
  height:4px;flex-shrink:0;
  background:linear-gradient(90deg,var(--g-dark),var(--g),var(--g2),var(--g3),var(--g2),var(--g),var(--g-dark));
  background-size:300% 100%;
  animation:bkShimmer 6s ease infinite;
}

.bk-pbar {
  height:3px;background:rgba(5,150,105,.08);flex-shrink:0;overflow:hidden;position:relative;
}
.bk-pbar__fill {
  height:100%;
  background:linear-gradient(90deg,var(--g),var(--g2),var(--g3));
  border-radius:0 99px 99px 0;
  transition:width .8s var(--ease);
  position:relative;
  box-shadow:0 0 12px rgba(16,185,129,.4);
}
.bk-pbar__dot {
  position:absolute;right:-5px;top:50%;transform:translateY(-50%);
  width:11px;height:11px;border-radius:50%;
  background:var(--g2);
  box-shadow:0 0 0 3px rgba(16,185,129,.25), 0 0 12px var(--g2);
  animation:bkPulse 2s ease infinite;
}

/* ── Top Bar ── */
.bk-topbar {
  display:flex;align-items:center;justify-content:space-between;
  padding:16px clamp(18px,2.5vw,28px);
  border-bottom:1px solid rgba(5,150,105,.08);
  background:linear-gradient(to right,var(--g8),white);
  flex-shrink:0;
}
.bk-topbar__left{display:flex;align-items:center;gap:13px}
.bk-topbar__ico {
  width:44px;height:44px;border-radius:14px;
  background:linear-gradient(135deg,var(--g),var(--g2));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 18px rgba(5,150,105,.3);
  position:relative;
  overflow:hidden;
}
.bk-topbar__ico::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.2),transparent);
}
.bk-topbar__name{font-size:14.5px;font-weight:800;color:var(--ink);line-height:1.2}
.bk-topbar__step{
  font-size:11.5px;color:var(--ink4);font-weight:600;margin-top:2px;
  display:flex;align-items:center;gap:5px;
}
.bk-topbar__pct{
  color:var(--g);font-weight:800;
}
.bk-topbar__wa {
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 18px;border-radius:12px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;color:#fff;font-size:13px;font-weight:800;
  cursor:pointer;text-decoration:none;
  box-shadow:0 4px 16px rgba(34,197,94,.35);
  transition:all .3s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
  position:relative;overflow:hidden;
}
.bk-topbar__wa::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.18),transparent);
  opacity:0;transition:opacity .3s;
}
.bk-topbar__wa:hover::before{opacity:1}
.bk-topbar__wa:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(34,197,94,.42)}

/* ══════════════════════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════════════════════ */
.bk-steps {
  display:flex;align-items:center;
  padding:0 clamp(18px,2.5vw,28px);
  border-bottom:1px solid rgba(5,150,105,.08);
  background:var(--g8);
  overflow-x:auto;scrollbar-width:none;flex-shrink:0;
}
.bk-steps::-webkit-scrollbar{display:none}

.bk-step {
  flex:1;min-width:0;
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:16px 6px;
  border:none;background:transparent;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:default;position:relative;
  transition:all .28s;
}
.bk-step--done{cursor:pointer}
.bk-step--done:hover{background:rgba(5,150,105,.05)}

.bk-step__ring {
  width:36px;height:36px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:800;
  transition:all .4s var(--ease);flex-shrink:0;
  position:relative;
}
.bk-step__ring--pending{
  background:rgba(5,150,105,.07);color:var(--ink4);
  border:2px solid rgba(5,150,105,.15);
}
.bk-step__ring--active{
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;
  box-shadow:0 6px 20px rgba(5,150,105,.35), 0 0 0 4px rgba(16,185,129,.15);
  animation:bkPop .5s var(--ease-bounce);
}
.bk-step__ring--active::before{
  content:'';position:absolute;inset:-6px;border-radius:50%;
  border:2px solid var(--g3);opacity:.5;
  animation:bkPulseGlow 2s ease infinite;
}
.bk-step__ring--done{
  background:linear-gradient(135deg,var(--g7),var(--g6));color:var(--g-dark);
  border:2px solid var(--g5);
}

.bk-step__lbl{
  font-size:10.5px;font-weight:700;letter-spacing:.03em;
  white-space:nowrap;line-height:1.2;transition:color .2s;
}
.bk-step--active  .bk-step__lbl{color:var(--g);font-weight:800}
.bk-step--done    .bk-step__lbl{color:var(--g2)}
.bk-step--pending .bk-step__lbl{color:var(--ink5)}

.bk-step__underline{
  position:absolute;bottom:0;left:15%;right:15%;height:3px;
  border-radius:99px 99px 0 0;
  background:linear-gradient(90deg,var(--g),var(--g3));
  transform-origin:left;
  box-shadow:0 0 8px rgba(16,185,129,.5);
}

.bk-conn{display:flex;align-items:center;flex-shrink:0;padding-bottom:16px}
.bk-conn__line{
  width:28px;height:2px;
  background:rgba(5,150,105,.14);border-radius:99px;transition:background .5s;
}
.bk-conn__line--done{background:linear-gradient(90deg,var(--g3),var(--g2))}

/* ══════════════════════════════════════════════════════════
   SCROLL AREA
══════════════════════════════════════════════════════════ */
.bk-scroll {
  flex:1;overflow-y:auto;overflow-x:hidden;
  scrollbar-width:thin;scrollbar-color:var(--g5) transparent;
}
.bk-scroll::-webkit-scrollbar{width:5px}
.bk-scroll::-webkit-scrollbar-track{background:transparent}
.bk-scroll::-webkit-scrollbar-thumb{background:var(--g5);border-radius:99px}
.bk-scroll::-webkit-scrollbar-thumb:hover{background:var(--g3)}

/* ══════════════════════════════════════════════════════════
   STEP HEADER
══════════════════════════════════════════════════════════ */
.bk-shdr {
  padding:clamp(26px,3.2vw,36px) clamp(20px,2.5vw,32px) 0;
  text-align:center;
}
.bk-shdr__ico {
  display:inline-flex;align-items:center;justify-content:center;
  width:64px;height:64px;border-radius:20px;
  background:linear-gradient(135deg,var(--g7),var(--g8));
  border:2px solid var(--g6);
  margin-bottom:16px;position:relative;overflow:hidden;
  box-shadow:0 8px 24px rgba(5,150,105,.15);
  animation:bkPop .5s var(--ease-bounce);
}
.bk-shdr__ico::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(5,150,105,.12),transparent);
}
.bk-shdr__tag{
  position:absolute;top:5px;right:6px;
  font-size:8.5px;font-weight:800;color:var(--g);letter-spacing:.05em;
  background:white;padding:2px 5px;border-radius:5px;
  border:1px solid var(--g6);
  line-height:1;
}
.bk-shdr__h{
  font-family:'Playfair Display',serif;
  font-size:clamp(22px,2.9vw,30px);
  font-weight:700;color:var(--ink);
  margin:0 0 8px;line-height:1.18;
  letter-spacing:-.01em;
}
.bk-shdr__p{
  font-size:14.5px;color:var(--ink4);line-height:1.65;margin:0;
  max-width:440px;margin:0 auto;
}

/* ══════════════════════════════════════════════════════════
   FORM BODY & FIELDS
══════════════════════════════════════════════════════════ */
.bk-fbody{padding:clamp(24px,2.8vw,32px) clamp(20px,2.5vw,32px)}

.bk-field-group{display:flex;flex-direction:column;gap:7px;margin-bottom:22px}
.bk-field-group:last-child{margin-bottom:0}

.bk-label{
  font-size:11.5px;font-weight:800;color:var(--ink3);
  letter-spacing:.06em;text-transform:uppercase;
  display:flex;align-items:center;gap:6px;
}
.bk-label-req{color:var(--g);font-size:13px;line-height:1}

.bk-hint{
  font-size:11.5px;color:var(--ink5);font-weight:500;margin-top:2px;
  display:flex;align-items:center;gap:5px;
}

.bk-input-wrap{position:relative;display:flex;align-items:center}
.bk-input-ico{
  position:absolute;left:14px;
  color:var(--g4);pointer-events:none;
  transition:all .25s;z-index:2;
  display:flex;align-items:center;justify-content:center;
}
.bk-input-wrap:focus-within .bk-input-ico{
  color:var(--g);transform:scale(1.1);
}

.bk-check-ico{
  position:absolute;right:14px;
  color:var(--g2);z-index:2;
  animation:bkPop .3s var(--ease-bounce);
}

.bk-input, .bk-select, .bk-textarea {
  width:100%;padding:14px 14px 14px 44px;
  border:2px solid var(--brd);border-radius:var(--r14);
  font-size:14.5px;font-weight:500;color:var(--ink2);
  background:white;outline:none;
  font-family:'Plus Jakarta Sans',sans-serif;
  transition:all .25s var(--ease2);
  box-shadow:0 2px 8px rgba(0,0,0,.03);
}
.bk-input::placeholder,.bk-textarea::placeholder{
  color:var(--ink5);font-weight:400;
}
.bk-input:hover,.bk-select:hover,.bk-textarea:hover{
  border-color:var(--g4);
}
.bk-input:focus,.bk-select:focus,.bk-textarea:focus{
  border-color:var(--g);
  box-shadow:0 0 0 4px rgba(5,150,105,.1),0 2px 8px rgba(0,0,0,.04);
  background:white;
}
.bk-input--valid{
  border-color:var(--g3);
  padding-right:44px;
}
.bk-input--err{
  border-color:#fca5a5;
  box-shadow:0 0 0 4px rgba(239,68,68,.06);
}
.bk-select{padding-left:44px;padding-right:38px;cursor:pointer;appearance:none;
  background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2334d399' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat:no-repeat;background-position:right 14px center;background-size:15px;
}
.bk-textarea{padding:14px 14px;resize:vertical;min-height:110px;line-height:1.55}

.bk-field-err{
  display:flex;align-items:center;gap:5px;
  font-size:12px;color:#dc2626;font-weight:600;margin-top:4px;
  animation:bkSlideD .25s ease;
}

.bk-field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:480px){.bk-field-row{grid-template-columns:1fr}}

/* Choice cards / chip picker */
.bk-chip-grid{display:flex;flex-wrap:wrap;gap:8px}
.bk-chip{
  display:inline-flex;align-items:center;gap:7px;
  padding:10px 16px;border-radius:12px;
  border:2px solid var(--brd);background:white;
  font-size:13px;font-weight:700;color:var(--ink3);
  cursor:pointer;transition:all .25s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
  position:relative;
}
.bk-chip:hover{border-color:var(--g4);background:var(--g8);color:var(--g)}
.bk-chip--active{
  border-color:var(--g);background:linear-gradient(135deg,var(--g7),var(--g8));
  color:var(--g-dark);
  box-shadow:0 4px 12px rgba(5,150,105,.18);
}
.bk-chip__check{
  width:18px;height:18px;border-radius:50%;
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:white;display:flex;align-items:center;justify-content:center;
  animation:bkPop .3s var(--ease-bounce);
}

/* Destination cards */
.bk-dest-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));
  gap:12px;
}
.bk-dest-card{
  display:flex;flex-direction:column;
  border-radius:var(--r16);border:2px solid var(--brd);
  background:white;cursor:pointer;overflow:hidden;
  transition:all .3s var(--ease);
  position:relative;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-dest-card:hover{
  border-color:var(--g4);
  transform:translateY(-3px);
  box-shadow:0 8px 24px rgba(5,150,105,.14);
}
.bk-dest-card--active{
  border-color:var(--g);
  box-shadow:0 8px 28px rgba(5,150,105,.22),0 0 0 3px rgba(16,185,129,.1);
}
.bk-dest-card__img{
  width:100%;aspect-ratio:16/10;object-fit:cover;
  background:linear-gradient(135deg,var(--g7),var(--g6));
  display:flex;align-items:center;justify-content:center;
  color:var(--g3);
}
.bk-dest-card__body{padding:11px 12px}
.bk-dest-card__name{
  font-size:13.5px;font-weight:800;color:var(--ink);margin:0;
  line-height:1.3;
}
.bk-dest-card__ctry{
  font-size:11px;color:var(--ink4);font-weight:600;margin-top:2px;
  display:flex;align-items:center;gap:3px;
}
.bk-dest-card__badge{
  position:absolute;top:9px;right:9px;
  width:26px;height:26px;border-radius:50%;
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:white;display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(5,150,105,.4);
  animation:bkPop .35s var(--ease-bounce);
}

/* Selected preview */
.bk-selected {
  display:flex;align-items:center;gap:14px;
  padding:14px 16px;border-radius:var(--r16);
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1.5px solid var(--g6);
  margin-top:12px;animation:bkSlideD .3s var(--ease);
}
.bk-selected__img{
  width:56px;height:56px;border-radius:12px;overflow:hidden;
  background:var(--g7);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  color:var(--g3);
}
.bk-selected__img img{width:100%;height:100%;object-fit:cover}
.bk-selected__body{min-width:0;flex:1}
.bk-selected__tag{
  font-size:9.5px;font-weight:800;color:var(--g2);
  letter-spacing:.14em;text-transform:uppercase;margin:0 0 3px;
  display:flex;align-items:center;gap:4px;
}
.bk-selected__name{
  font-size:14.5px;font-weight:800;color:var(--ink);margin:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.bk-selected__ctry{
  font-size:12px;color:var(--ink4);font-weight:600;margin-top:1px;
}

/* Counter */
.bk-counter{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;
  background:linear-gradient(135deg,var(--g8),white);
  border-radius:var(--r14);border:2px solid var(--brd);
  transition:all .25s;
}
.bk-counter:hover{border-color:var(--g4)}
.bk-counter__info{display:flex;align-items:center;gap:12px}
.bk-counter__icn{
  width:38px;height:38px;border-radius:11px;
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:white;display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(5,150,105,.25);
  flex-shrink:0;
}
.bk-counter__lbl{font-size:14px;font-weight:800;color:var(--ink);margin:0;line-height:1.2}
.bk-counter__sub{font-size:11.5px;color:var(--ink4);font-weight:500;margin-top:2px}
.bk-counter__ctrl{display:flex;align-items:center;gap:10px}
.bk-counter__btn{
  width:34px;height:34px;border-radius:10px;
  border:2px solid var(--brd);background:white;
  display:flex;align-items:center;justify-content:center;
  color:var(--ink4);cursor:pointer;
  transition:all .2s var(--ease);
}
.bk-counter__btn:hover:not(:disabled){
  border-color:var(--g);background:var(--g8);color:var(--g);
  transform:scale(1.05);
}
.bk-counter__btn:active:not(:disabled){transform:scale(.95)}
.bk-counter__btn:disabled{opacity:.35;cursor:not-allowed}
.bk-counter__val{
  min-width:26px;text-align:center;
  font-size:17px;font-weight:800;color:var(--ink);
  font-variant-numeric:tabular-nums;
}

/* Month picker */
.bk-months{
  display:grid;grid-template-columns:repeat(4,1fr);gap:6px;
}
@media(min-width:480px){.bk-months{grid-template-columns:repeat(6,1fr)}}
.bk-month{
  padding:9px 4px;border-radius:10px;
  border:2px solid var(--brd);background:white;
  font-size:11.5px;font-weight:800;color:var(--ink4);
  cursor:pointer;transition:all .2s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-month:hover{border-color:var(--g4);color:var(--g)}
.bk-month--active{
  background:linear-gradient(135deg,var(--g),var(--g2));
  border-color:transparent;color:white;
  box-shadow:0 4px 12px rgba(5,150,105,.28);
}

/* Custom checkbox */
.bk-check-row{
  display:flex;align-items:flex-start;gap:12px;
  padding:12px;border-radius:var(--r12);
  cursor:pointer;transition:all .2s;
}
.bk-check-row:hover{background:var(--g8)}
.bk-check-row--terms{
  padding:14px 16px;
  border:2px solid var(--brd);background:var(--off);
}
.bk-check-row--terms.bk-check-row--on{
  border-color:var(--g4);background:var(--g8);
}
.bk-check-row--err{border-color:#fca5a5!important;background:#fef2f2!important}

.bk-check {
  width:22px;height:22px;border-radius:7px;
  border:2px solid var(--ink6);background:white;
  display:flex;align-items:center;justify-content:center;
  color:transparent;cursor:pointer;transition:all .2s var(--ease);
  flex-shrink:0;margin-top:1px;
}
.bk-check:hover{border-color:var(--g)}
.bk-check--on{
  background:linear-gradient(135deg,var(--g),var(--g2));
  border-color:transparent;color:white;
  box-shadow:0 3px 10px rgba(5,150,105,.3);
}
.bk-check-txt{
  font-size:13.5px;color:var(--ink3);font-weight:500;line-height:1.5;
}
.bk-check-txt a{
  color:var(--g);font-weight:700;text-decoration:none;
  border-bottom:1.5px solid var(--g5);
  transition:all .2s;
}
.bk-check-txt a:hover{color:var(--g-dark);border-color:var(--g)}

/* ══════════════════════════════════════════════════════════
   ERROR BANNER
══════════════════════════════════════════════════════════ */
.bk-errbanner {
  display:flex;align-items:flex-start;gap:12px;
  padding:14px 18px;
  margin:14px clamp(20px,2.5vw,32px) 0;
  border-radius:var(--r14);
  background:#fef2f2;border:2px solid #fecaca;
  animation:bkSlideD .3s ease;
}
.bk-errbanner__msg{
  font-size:13.5px;color:#b91c1c;margin:0 0 10px;line-height:1.55;font-weight:500;
}
.bk-errbanner__close{
  border:none;background:transparent;cursor:pointer;
  color:#ef4444;padding:2px;border-radius:8px;
  transition:background .2s;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.bk-errbanner__close:hover{background:#fee2e2}

/* ══════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════ */
.bk-nav {
  display:flex;align-items:center;gap:10px;
  padding:clamp(14px,2vw,20px) clamp(20px,2.5vw,32px);
  border-top:1px solid rgba(5,150,105,.08);
  background:linear-gradient(to top,var(--g8) 0%,white 100%);
  flex-shrink:0;
}

.bk-btn-back {
  display:inline-flex;align-items:center;gap:7px;
  height:52px;padding:0 22px;
  border:2px solid rgba(5,150,105,.18);
  background:white;border-radius:var(--r14);
  font-size:14px;font-weight:700;color:var(--ink3);
  cursor:pointer;transition:all .3s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;flex-shrink:0;
}
.bk-btn-back:hover{
  background:var(--g8);border-color:var(--g3);
  color:var(--g);transform:translateX(-3px);
}

.bk-btn-next {
  flex:1;height:54px;
  display:flex;align-items:center;justify-content:center;gap:9px;
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;border:none;border-radius:var(--r14);
  font-size:15.5px;font-weight:800;cursor:pointer;
  transition:all .35s var(--ease);
  box-shadow:0 6px 24px rgba(5,150,105,.32);
  font-family:'Plus Jakarta Sans',sans-serif;
  position:relative;overflow:hidden;letter-spacing:.01em;
}
.bk-btn-next::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.2),transparent 60%);
  opacity:0;transition:opacity .3s;
}
.bk-btn-next:hover:not(:disabled)::before{opacity:1}
.bk-btn-next:hover:not(:disabled){
  transform:translateY(-3px);
  box-shadow:0 14px 40px rgba(5,150,105,.42);
}
.bk-btn-next:active:not(:disabled){transform:scale(.98)}
.bk-btn-next:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
.bk-btn-next__ripple{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.35);
  width:120px;height:120px;
  margin:-60px 0 0 -60px;
  animation:bkRipple .7s ease-out forwards;
  pointer-events:none;
}

/* ══════════════════════════════════════════════════════════
   TRUST STRIP
══════════════════════════════════════════════════════════ */
.bk-trust {
  display:flex;align-items:center;justify-content:center;
  flex-wrap:wrap;gap:14px;
  padding:14px clamp(20px,2.5vw,32px);
  border-top:1px solid var(--g7);
  background:linear-gradient(135deg,rgba(5,150,105,.04),rgba(16,185,129,.02));
  flex-shrink:0;
}
.bk-trust__pill{
  display:flex;align-items:center;gap:7px;
  font-size:11.5px;color:var(--g);font-weight:700;
}
.bk-trust__ico{
  width:22px;height:22px;border-radius:7px;
  background:var(--g7);border:1px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g);flex-shrink:0;
}

.bk-ftr{
  padding:10px clamp(20px,2.5vw,32px);
  border-top:1px solid rgba(5,150,105,.06);
  background:var(--g8);text-align:center;flex-shrink:0;
}
.bk-ftr p{
  font-size:11px;color:var(--ink4);
  display:flex;align-items:center;justify-content:center;gap:5px;margin:0;
  font-weight:500;
}

/* ══════════════════════════════════════════════════════════
   DATE PICKER
══════════════════════════════════════════════════════════ */
.bk-dp{position:relative;user-select:none}

.bk-dp-btn{
  display:flex;align-items:center;gap:12px;
  width:100%;padding:14px 16px;
  background:white;
  border:2px solid var(--brd);border-radius:var(--r14);
  cursor:pointer;transition:all .25s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
  box-shadow:0 2px 8px rgba(0,0,0,.03);
}
.bk-dp-btn:hover{border-color:var(--g4);background:var(--g8)}
.bk-dp-btn--open{
  border-color:var(--g);
  box-shadow:0 0 0 4px rgba(5,150,105,.1);
}
.bk-dp-btn--err{border-color:#fca5a5;box-shadow:0 0 0 4px rgba(239,68,68,.06)}

.bk-dp-btn__ico{
  width:44px;height:44px;border-radius:12px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:2px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g2);flex-shrink:0;transition:all .25s;
}
.bk-dp-btn--open .bk-dp-btn__ico{
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;border-color:transparent;
  box-shadow:0 4px 14px rgba(5,150,105,.32);
}

.bk-dp-btn__txt{flex:1;text-align:left;min-width:0}
.bk-dp-btn__lbl{
  font-size:10.5px;font-weight:800;color:var(--ink4);
  letter-spacing:.08em;text-transform:uppercase;margin:0 0 3px;
}
.bk-dp-btn__val{
  font-size:14px;font-weight:700;color:var(--ink2);margin:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.bk-dp-btn__ph{color:var(--ink5);font-weight:500;font-size:13.5px}
.bk-dp-btn__chev{color:var(--g4);transition:transform .3s var(--ease);flex-shrink:0}
.bk-dp-btn--open .bk-dp-btn__chev{transform:rotate(180deg);color:var(--g)}

.bk-cal{
  position:absolute;top:calc(100% + 10px);left:0;right:0;z-index:300;
  background:white;
  border:2px solid var(--g6);border-radius:var(--r20);
  box-shadow:0 20px 60px rgba(5,150,105,.18),0 4px 14px rgba(0,0,0,.08);
  padding:20px;
  animation:bkSlideD .22s var(--ease);
}
.bk-cal__hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.bk-cal__month{
  font-family:'Playfair Display',serif;
  font-size:17px;font-weight:700;color:var(--ink);margin:0;
}
.bk-cal__nav{
  width:34px;height:34px;border-radius:10px;
  border:2px solid rgba(5,150,105,.2);background:white;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--ink4);transition:all .2s var(--ease);
}
.bk-cal__nav:hover:not(:disabled){
  background:var(--g8);border-color:var(--g3);color:var(--g);
  transform:scale(1.05);
}
.bk-cal__nav:disabled{opacity:.25;cursor:default}
.bk-cal__wds{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.bk-cal__wd{
  text-align:center;font-size:10.5px;font-weight:800;color:var(--g2);
  letter-spacing:.07em;text-transform:uppercase;padding:4px 0;
}
.bk-cal__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.bk-cal__day{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:600;color:var(--ink);
  border-radius:10px;border:none;background:transparent;
  cursor:pointer;transition:all .15s ease;
  font-family:'Plus Jakarta Sans',sans-serif;position:relative;
}
.bk-cal__day:hover:not(:disabled):not(.bk-cal__day--sel){
  background:var(--g8);color:var(--g);font-weight:700;
  transform:scale(1.05);
}
.bk-cal__day--today{font-weight:800;color:var(--g)}
.bk-cal__day--today::after{
  content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:var(--g);
}
.bk-cal__day--sel{
  background:linear-gradient(135deg,var(--g),var(--g2))!important;
  color:#fff!important;font-weight:800!important;
  box-shadow:0 4px 14px rgba(5,150,105,.35);
  transform:scale(1.05);
}
.bk-cal__day--sel::after{display:none}
.bk-cal__day:disabled{color:rgba(5,150,105,.2);cursor:default;background:transparent}
.bk-cal__day--empty{cursor:default}
.bk-cal__day--empty:hover{background:transparent;transform:none}
.bk-cal__quick{
  display:flex;flex-wrap:wrap;gap:6px;
  margin-top:16px;padding-top:14px;border-top:1px solid var(--brd2);
}
.bk-cal__qbtn{
  padding:7px 13px;border-radius:9px;
  border:2px solid rgba(5,150,105,.18);background:white;
  font-size:11.5px;font-weight:700;color:var(--ink4);
  cursor:pointer;transition:all .2s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-cal__qbtn:hover{
  background:linear-gradient(135deg,var(--g),var(--g2));
  border-color:transparent;color:white;
  box-shadow:0 3px 10px rgba(5,150,105,.25);
}

.bk-drb{
  display:flex;align-items:center;gap:10px;
  padding:14px 18px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1.5px solid var(--g6);border-radius:var(--r14);
  margin-top:12px;animation:bkSlideD .28s var(--ease);
}
.bk-drb__item{flex:1;text-align:center;min-width:0}
.bk-drb__lbl{
  font-size:9.5px;font-weight:800;color:var(--g);
  letter-spacing:.1em;text-transform:uppercase;margin:0 0 4px;
}
.bk-drb__val{font-size:13.5px;font-weight:700;color:var(--ink);margin:0}
.bk-drb__arr{color:var(--g3);flex-shrink:0}
.bk-drb__nts{
  padding:6px 14px;border-radius:9px;
  background:linear-gradient(135deg,var(--g),var(--g2));color:#fff;
  font-size:12px;font-weight:800;flex-shrink:0;white-space:nowrap;
  box-shadow:0 3px 10px rgba(5,150,105,.28);
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR CARDS
══════════════════════════════════════════════════════════ */
.bk-scard {
  background:white;
  border-radius:var(--r20);
  border:1px solid rgba(5,150,105,.08);
  box-shadow:0 4px 20px rgba(5,150,105,.06);
  overflow:hidden;
  transition:all .35s var(--ease);
  position:relative;
}
.bk-scard::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--g),var(--g2),var(--g3),var(--g2),var(--g));
  background-size:300% 100%;animation:bkShimmer 6s ease infinite;
}
.bk-scard:hover{
  box-shadow:0 10px 36px rgba(5,150,105,.12);
  transform:translateY(-2px);
}

.bk-gallery{
  height:280px;border-radius:var(--r20);overflow:hidden;
  position:relative;border:1px solid rgba(5,150,105,.1);
  box-shadow:0 8px 32px rgba(5,150,105,.12);
}

/* Why book card */
.bk-why{padding:24px 24px 22px}
.bk-why__hdr{display:flex;align-items:center;gap:11px;margin-bottom:20px}
.bk-why__icon-wrap{
  width:34px;height:34px;border-radius:11px;
  background:linear-gradient(135deg,var(--g),var(--g2));
  display:flex;align-items:center;justify-content:center;
  color:white;
  box-shadow:0 4px 14px rgba(5,150,105,.28);
}
.bk-why__h{
  font-family:'Playfair Display',serif;
  font-size:17.5px;font-weight:700;color:var(--ink);margin:0;
}
.bk-why__item{
  display:flex;align-items:flex-start;gap:13px;
  padding:12px 0;border-bottom:1px solid var(--g8);
  transition:all .28s;
}
.bk-why__item:last-child{border:none;padding-bottom:0}
.bk-why__item:hover{padding-left:6px}
.bk-why__ico{
  width:40px;height:40px;border-radius:12px;
  background:var(--g8);border:1.5px solid var(--g7);
  display:flex;align-items:center;justify-content:center;
  color:var(--g);flex-shrink:0;transition:all .3s var(--ease);
}
.bk-why__item:hover .bk-why__ico{
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;border-color:transparent;
  box-shadow:0 5px 18px rgba(5,150,105,.3);
  transform:rotate(-8deg) scale(1.05);
}
.bk-why__name{font-size:13.5px;font-weight:800;color:var(--ink);margin:0 0 2px}
.bk-why__desc{font-size:12.5px;color:var(--ink4);margin:0;line-height:1.55}

/* Trust list */
.bk-tlist{padding:22px 24px}
.bk-tlist__h{
  font-size:10.5px;font-weight:800;text-transform:uppercase;
  letter-spacing:.12em;color:var(--g);margin:0 0 14px;
  display:flex;align-items:center;gap:6px;
}
.bk-trow{display:flex;align-items:center;gap:11px;margin-bottom:11px}
.bk-trow:last-child{margin:0}
.bk-trow__chk{
  width:26px;height:26px;border-radius:8px;
  background:linear-gradient(135deg,var(--g7),var(--g8));border:1.5px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g);flex-shrink:0;
}
.bk-trow__txt{font-size:13px;color:var(--ink3);font-weight:600}

/* WhatsApp card */
.bk-wacard{padding:22px 24px}
.bk-wacard__h{
  font-family:'Playfair Display',serif;
  font-size:16.5px;font-weight:700;color:var(--ink);margin:0 0 6px;
}
.bk-wacard__p{font-size:13px;color:var(--ink4);margin:0 0 16px;line-height:1.6}
.bk-wabtn{
  display:flex;align-items:center;justify-content:center;gap:9px;
  width:100%;padding:14px 18px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;border-radius:var(--r14);
  color:#fff;font-size:14px;font-weight:800;
  cursor:pointer;text-decoration:none;
  transition:all .3s var(--ease);
  box-shadow:0 5px 20px rgba(34,197,94,.3);
  font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden;
}
.bk-wabtn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.16),transparent);opacity:0;transition:opacity .25s}
.bk-wabtn:hover::before{opacity:1}
.bk-wabtn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(34,197,94,.4)}

/* Review */
.bk-rev{padding:20px 24px}
.bk-rev__stars{display:flex;gap:2px;margin-bottom:10px}
.bk-rev__q{font-size:13.5px;color:var(--ink3);font-style:italic;line-height:1.7;margin:0 0 10px}
.bk-rev__author{font-size:11.5px;color:var(--ink5);font-weight:700;margin:0}
.bk-rev__score{
  display:inline-flex;align-items:center;gap:4px;
  padding:4px 12px;border-radius:99px;
  background:var(--g8);border:1px solid var(--g6);
  font-size:11px;font-weight:800;color:var(--g);margin-left:8px;
}

/* Live viewers */
.bk-active{
  display:flex;align-items:center;gap:11px;
  padding:14px 18px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1px solid var(--g6);border-radius:var(--r14);
  font-size:12.5px;color:var(--ink2);font-weight:600;
  box-shadow:0 4px 16px rgba(5,150,105,.08);
}
.bk-active__dot{
  width:10px;height:10px;border-radius:50%;background:var(--g2);
  animation:bkPulseGlow 2s ease infinite;flex-shrink:0;
}

/* Dates summary */
.bk-dsum{padding:18px 20px}
.bk-dsum__h{
  font-size:10.5px;font-weight:800;text-transform:uppercase;
  letter-spacing:.12em;color:var(--g);margin:0 0 10px;
  display:flex;align-items:center;gap:6px;
}

/* Response time */
.bk-resp{display:flex;align-items:center;gap:14px;padding:18px 22px}
.bk-resp__ico{
  width:42px;height:42px;border-radius:13px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1.5px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g);flex-shrink:0;
}
.bk-resp__h{font-size:13.5px;font-weight:800;color:var(--ink);margin:0 0 2px}
.bk-resp__p{font-size:12px;color:var(--ink4);margin:0}

@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
`;

let _css = false;
function injectStyles() {
  if (_css || typeof document === "undefined") return;
  if (document.getElementById("bk-v7")) { _css = true; return; }
  const s = document.createElement("style");
  s.id = "bk-v7"; s.textContent = BK_CSS;
  document.head.appendChild(s); _css = true;
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
    { label: "3 months", value: add(90) },
  ];
};

const makeDepartureQuickPicks = arrival => {
  if (!arrival) return [];
  const d = new Date(arrival);
  const add = n => { const r = new Date(d); r.setDate(r.getDate() + n); return toStr(r.getFullYear(), r.getMonth(), r.getDate()); };
  return [
    { label: "3 nights",  value: add(3)  },
    { label: "5 nights",  value: add(5)  },
    { label: "7 nights",  value: add(7)  },
    { label: "10 nights", value: add(10) },
    { label: "14 nights", value: add(14) },
  ];
};

/* ═══════════════════════════════════════════════════════════════════════════
   DATE PICKER
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

  const IconEl = icon || <HiCalendar size={18} />;

  return (
    <div className="bk-dp" ref={ref}>
      <button
        type="button"
        className={["bk-dp-btn", open ? "bk-dp-btn--open" : "", error ? "bk-dp-btn--err" : ""].join(" ")}
        onClick={() => setOpen(p => !p)}
      >
        <div className="bk-dp-btn__ico">{IconEl}</div>
        <div className="bk-dp-btn__txt">
          <p className="bk-dp-btn__lbl">{label}</p>
          <p className={`bk-dp-btn__val${!value ? " bk-dp-btn__ph" : ""}`}>
            {value ? fmtS(value) : placeholder}
          </p>
        </div>
        <HiChevronRight size={16} className="bk-dp-btn__chev" />
      </button>

      {open && (
        <div className="bk-cal">
          <div className="bk-cal__hdr">
            <button type="button" className="bk-cal__nav" onClick={prev} disabled={!canP}>
              <HiChevronLeft size={15} />
            </button>
            <h4 className="bk-cal__month">{MONTHS[vm]} {vy}</h4>
            <button type="button" className="bk-cal__nav" onClick={next} disabled={!canN}>
              <HiChevronRight size={15} />
            </button>
          </div>

          <div className="bk-cal__wds">{WDS.map(w => <span key={w} className="bk-cal__wd">{w}</span>)}</div>

          <div className="bk-cal__grid">
            {Array.from({ length: fd }).map((_, i) => (
              <span key={`e${i}`} className="bk-cal__day bk-cal__day--empty" />
            ))}
            {Array.from({ length: dim }).map((_, i) => {
              const day = i + 1;
              const d   = dis(day);
              let cls   = "bk-cal__day";
              if (isT(day)) cls += " bk-cal__day--today";
              if (isS(day)) cls += " bk-cal__day--sel";
              return (
                <button
                  key={day} type="button"
                  className={cls}
                  disabled={d}
                  onClick={() => !d && pick(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {quickPicks.length > 0 && (
            <div className="bk-cal__quick">
              {quickPicks.map(qp => (
                <button key={qp.label} type="button" className="bk-cal__qbtn"
                  onClick={() => {
                    onChange(qp.value);
                    setOpen(false);
                    const d = new Date(qp.value);
                    setVy(d.getFullYear());
                    setVm(d.getMonth());
                  }}>
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
      <div className="bk-drb__item">
        <p className="bk-drb__lbl">Arrival</p>
        <p className="bk-drb__val">{arrivalDate ? fmtC(arrivalDate) : "—"}</p>
      </div>
      <HiArrowRight size={16} className="bk-drb__arr" />
      <div className="bk-drb__item">
        <p className="bk-drb__lbl">Departure</p>
        <p className="bk-drb__val">{departureDate ? fmtC(departureDate) : "—"}</p>
      </div>
      {n > 0 && (
        <span className="bk-drb__nts">{n} {n === 1 ? "night" : "nights"}</span>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */

const STEP_META = [
  { icon: HiUsers,        label: "You",         desc: "Let's start with who you are and where you're from." },
  { icon: HiLocationMarker, label: "Destination", desc: "Pick your dream destination — we handle the rest."   },
  { icon: HiCalendar,     label: "Trip",         desc: "When you'd like to travel and who's coming with you." },
  { icon: HiChatAlt2,     label: "Review",       desc: "Add any special requests and send your enquiry."      },
];

const WHY = [
  { Icon: HiShieldCheck, title: "No Payment Now",    desc: "Free to enquire — pay only when confirmed." },
  { Icon: HiBadgeCheck,  title: "Expert-Led Safaris", desc: "Certified guides with 10+ years in the field." },
  { Icon: HiSparkles,    title: "Fully Bespoke",      desc: "Every itinerary crafted around your vision." },
  { Icon: HiLightningBolt, title: "2-Hour Response",  desc: "Our team replies within 2 hours, guaranteed." },
];

const TRUST = [
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
   BOOKING PAGE
═══════════════════════════════════════════════════════════════════════════ */

function BookingPage() {
  useEffect(injectStyles, []);

  const { data: rawC, loading: cL } = useCountriesList({ limit: 100 });
  const { data: rawD, loading: dL } = useDestinationsList({ limit: 200 });

  const countriesList    = useMemo(() => (rawC ?? []).map(norm_ctry),  [rawC]);
  const destinationsList = useMemo(() => (rawD ?? []).map(norm_dest),  [rawD]);

  const isDev    = import.meta.env.DEV;
  const form     = useBookingContext();
  const navigate = useNavigate();

  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(d => d.value === String(form.data.destinationId));
    if (!dest?.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Your selection" };
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

  const [ripple, setRipple] = useState(null);
  const triggerRipple = useCallback(e => {
    const r = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - r.left, y: e.clientY - r.top });
    setTimeout(() => setRipple(null), 700);
  }, []);

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

  const handleNext = e => {
    triggerRipple(e);
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

  const SM       = STEP_META[form.step];
  const StepIcon = SM.icon;

  return (
    <div className="bk-page">

      {/* ── HERO ── */}
      <div className="bk-hero">
        <img src={HERO_IMG} alt="African safari landscape" className="bk-hero__img" />
        <div className="bk-hero__grad" />
        <div className="bk-hero__mesh" />

        <div className="bk-hero__orbs" aria-hidden="true">
          {[
            { s: 120, t: "14%", l: "7%",  d: 0   },
            { s: 70,  t: "62%", l: "14%", d: 1.4 },
            { s: 140, t: "18%", l: "78%", d: 0.7 },
            { s: 60,  t: "72%", l: "88%", d: 2.1 },
          ].map((o, i) => (
            <div
              key={i}
              className="bk-hero__orb"
              style={{
                width: o.s, height: o.s,
                top: o.t, left: o.l,
                animationDelay: `${o.d}s`,
                animationDuration: `${5 + i * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="bk-hero__body">
          <div className="bk-hero__badge">
            <span className="bk-hero__dot" />
            <HiSparkles size={13} />
            Safari Booking Portal
          </div>
          <h1 className="bk-hero__h1">Plan Your <em>African</em> Adventure</h1>
          <p className="bk-hero__sub">
            A few details and our expert guides will craft your perfect, personalised safari itinerary.
          </p>
          <div className="bk-hero__pills">
            {[
              [HiStar,        "4.9/5 Rating"    ],
              [HiUsers,       "2,400+ Guests"   ],
              [HiGlobe,       "12 Countries"    ],
              [HiCheckCircle, "Free to Enquire" ],
            ].map(([Icon, t]) => (
              <div key={t} className="bk-hero__pill">
                <Icon size={13} /> {t}
              </div>
            ))}
          </div>
        </div>

        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 60" fill="none" style={{ width: "100%", display: "block" }} preserveAspectRatio="none">
            <path d="M0,60 C300,8 600,0 900,22 C1100,38 1300,10 1440,0 L1440,60Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <nav className="bk-crumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="bk-crumb__sep"><HiChevronRight size={11} /></span>
        <Link to="/packages">Packages</Link>
        <span className="bk-crumb__sep"><HiChevronRight size={11} /></span>
        <span style={{ color: "var(--ink3)", fontWeight: 700 }}>Book Your Safari</span>
      </nav>

      {/* ── LAYOUT ── */}
      <div className="bk-layout bk-fade-up">

        {/* ════ FORM COLUMN ════ */}
        <div className="bk-form-col">
          <div className="bk-card">
            <div className="bk-card__top" />

            <div
              className="bk-pbar"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="bk-pbar__fill" style={{ width: `${progress}%` }}>
                <div className="bk-pbar__dot" />
              </div>
            </div>

            <div className="bk-topbar">
              <div className="bk-topbar__left">
                <div className="bk-topbar__ico">
                  <HiSparkles size={20} color="#fff" />
                </div>
                <div>
                  <p className="bk-topbar__name">Safari Booking</p>
                  <p className="bk-topbar__step">
                    Step {form.step + 1} of {form.STEPS.length} · <span className="bk-topbar__pct">{Math.round(progress)}%</span> complete
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bk-topbar__wa"
              >
                <HiChatAlt2 size={15} /> Chat
              </a>
            </div>

            <div className="bk-steps" role="navigation" aria-label="Booking steps">
              {form.STEPS.map((s, i) => {
                const active = form.step === i;
                const done   = form.step > i;
                const state  = active ? "active" : done ? "done" : "pending";
                return (
                  <React.Fragment key={s.id}>
                    <button
                      type="button"
                      className={`bk-step bk-step--${state}`}
                      onClick={() => done && handleStepClick(i)}
                      aria-current={active ? "step" : undefined}
                      aria-label={`Step ${i + 1}: ${s.label}`}
                    >
                      <div className={`bk-step__ring bk-step__ring--${state}`}>
                        {done ? <HiCheck size={14} /> : i + 1}
                      </div>
                      <span className="bk-step__lbl">{s.label}</span>
                      {active && <div className="bk-step__underline bk-wave-in" />}
                    </button>
                    {i < form.STEPS.length - 1 && (
                      <div className="bk-conn">
                        <div className={`bk-conn__line${done ? " bk-conn__line--done" : ""}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="bk-scroll">
              {form.submitError && (
                <div className="bk-errbanner" role="alert">
                  <HiExclamationCircle size={19} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1 }}>
                    <p className="bk-errbanner__msg">{form.submitError}</p>
                    <a
                      href={`https://wa.me/${WA}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bk-wabtn"
                      style={{ width: "auto", padding: "8px 15px", fontSize: 12, display: "inline-flex" }}
                    >
                      <HiChatAlt2 size={13} /> WhatsApp Us
                    </a>
                  </div>
                  <button
                    className="bk-errbanner__close"
                    onClick={() => form.setSubmitError?.(null)}
                    aria-label="Dismiss error"
                  >
                    <HiX size={16} />
                  </button>
                </div>
              )}

              <div className="bk-shdr">
                <div className="bk-shdr__ico">
                  <StepIcon size={26} color="var(--g)" />
                  <span className="bk-shdr__tag">{form.step + 1}/{form.STEPS.length}</span>
                </div>
                <h2 className="bk-shdr__h">
                  {form.step === 0 && form.displayName
                    ? `Hi, ${form.displayName}!`
                    : SM.label === "You"          ? "Tell Us About You"
                    : SM.label === "Destination"  ? "Choose Your Destination"
                    : SM.label === "Trip"         ? "Your Trip Details"
                    : "Almost There!"}
                </h2>
                <p className="bk-shdr__p">{SM.desc}</p>
              </div>

              {isDev && form.step === 1 && (
                <div style={{
                  background: "#fef9c3", border: "1px solid #fde047",
                  borderRadius: 10, padding: "9px 14px",
                  margin: "12px 20px 0", fontSize: 11, color: "#713f12",
                  fontFamily: "monospace", lineHeight: 1.6,
                }}>
                  dest:<strong>{destinationsList.length}</strong>{" "}
                  countries:<strong>{countriesList.length}</strong>{" "}
                  countryId:<strong>"{form.data.countryId}"</strong>{" "}
                  matches:<strong>
                    {form.data.countryId
                      ? destinationsList.filter(d => d.countryId === String(form.data.countryId)).length
                      : "—"}
                  </strong>
                </div>
              )}

              <div className="bk-fbody">
                <div key={`step-${form.step}`} className="bk-slide-r">
                  {renderStep()}
                </div>
              </div>
            </div>

            <div className="bk-nav">
              {form.step > 0 && (
                <button
                  type="button"
                  className="bk-btn-back"
                  onClick={handleBack}
                  disabled={form.submitting}
                >
                  <HiArrowLeft size={15} /> Back
                </button>
              )}
              <button
                type="button"
                className="bk-btn-next"
                onClick={handleNext}
                disabled={form.submitting}
              >
                {ripple && (
                  <span
                    className="bk-btn-next__ripple"
                    style={{ top: ripple.y, left: ripple.x }}
                  />
                )}
                {form.submitting
                  ? <><Spinner /> Sending…</>
                  : isLast
                  ? <><HiPaperAirplane size={16} /> Send My Request</>
                  : <>Continue <HiArrowRight size={16} /></>}
              </button>
            </div>

            <div className="bk-trust" role="list">
              {[
                { Icon: HiShieldCheck, label: "256-bit SSL"   },
                { Icon: HiBadgeCheck,  label: "No Payment"    },
                { Icon: HiThumbUp,     label: "Expert Guided" },
                { Icon: HiLockClosed,  label: "Private & Safe"},
              ].map(({ Icon, label }) => (
                <div key={label} className="bk-trust__pill" role="listitem">
                  <div className="bk-trust__ico"><Icon size={12} /></div>
                  {label}
                </div>
              ))}
            </div>

            <div className="bk-ftr">
              <p>
                <HiShieldCheck size={12} style={{ color: "var(--g)" }} />
                Your information is private and never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside className="bk-side-col">
          <div className="bk-gallery">
            <GallerySlideshow hero={heroOverride} />
          </div>

          <div className="bk-active">
            <div className="bk-active__dot" />
            <HiEye size={14} style={{ color: "var(--g)", flexShrink: 0 }} />
            <span>
              <strong style={{ color: "var(--g-dark)" }}>14 travellers</strong>{" "}
              viewing safaris right now
            </span>
          </div>

          {(form.data.arrivalDate || form.data.departureDate) && (
            <div className="bk-scard">
              <div className="bk-dsum" style={{ paddingTop: 22 }}>
                <p className="bk-dsum__h"><HiCalendar size={12} /> Your Trip Dates</p>
                <DateRangeBar
                  arrivalDate={form.data.arrivalDate}
                  departureDate={form.data.departureDate}
                />
              </div>
            </div>
          )}

          <div className="bk-scard">
            <div className="bk-why">
              <div className="bk-why__hdr">
                <div className="bk-why__icon-wrap">
                  <HiHeart size={16} />
                </div>
                <h3 className="bk-why__h">Why Book With Altuvera?</h3>
              </div>
              {WHY.map(({ Icon, title, desc }) => (
                <div key={title} className="bk-why__item">
                  <div className="bk-why__ico"><Icon size={17} /></div>
                  <div>
                    <p className="bk-why__name">{title}</p>
                    <p className="bk-why__desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bk-scard">
            <div className="bk-tlist">
              <p className="bk-tlist__h"><HiShieldCheck size={12} /> Your Guarantee</p>
              {TRUST.map(item => (
                <div key={item} className="bk-trow">
                  <div className="bk-trow__chk"><HiCheck size={13} /></div>
                  <span className="bk-trow__txt">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bk-scard">
            <div className="bk-wacard">
              <h4 className="bk-wacard__h">Prefer to chat directly?</h4>
              <p className="bk-wacard__p">
                Our safari experts are on WhatsApp — get instant, personalised answers.
              </p>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bk-wabtn"
              >
                <HiChatAlt2 size={17} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="bk-scard">
            <div className="bk-rev">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div className="bk-rev__stars">
                  {[1,2,3,4,5].map(i => (
                    <HiStar key={i} size={14} style={{ color: "#f59e0b" }} />
                  ))}
                </div>
                <span className="bk-rev__score">4.9 / 5.0</span>
              </div>
              <p className="bk-rev__q">
                "Absolutely flawless from start to finish — the booking was effortless,
                and the safari itself was the experience of a lifetime."
              </p>
              <p className="bk-rev__author">
                — Sarah M., United Kingdom · Rwanda 2024
              </p>
            </div>
          </div>

          <div className="bk-scard">
            <div className="bk-resp">
              <div className="bk-resp__ico"><HiClock size={18} /></div>
              <div>
                <p className="bk-resp__h">Average Response: 47 min</p>
                <p className="bk-resp__p">We typically reply within 2 hours.</p>
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
      <div className="bk-hero" style={{ height: "clamp(220px,24vw,300px)" }}>
        <img src={HERO_IMG} alt="" className="bk-hero__img" />
        <div className="bk-hero__grad" />
        <div className="bk-hero__body">
          <div className="bk-hero__badge">
            <HiCheckCircle size={13} />
            Request Received
          </div>
          <h1 className="bk-hero__h1" style={{ fontSize: "clamp(26px,4.5vw,48px)" }}>
            We've Got Your Request!
          </h1>
          <p className="bk-hero__sub">
            Our safari team will be in touch within 2 hours.
          </p>
        </div>
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 60" fill="none" style={{ width: "100%", display: "block" }} preserveAspectRatio="none">
            <path d="M0,60 C300,8 600,0 900,22 C1100,38 1300,10 1440,0 L1440,60Z" fill="#f0fdf4" />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(16px,3vw,40px) 100px" }}>
        <div
          className="bk-fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 410px",
            gap: "clamp(20px,2.5vw,36px)",
            alignItems: "start",
            marginTop: "clamp(-60px,-9vw,-80px)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div className="bk-card">
            <div className="bk-card__top" />
            <SuccessScreen
              displayName={form.displayName}
              bookingRef={form.bookingRef}
              email={form.data.email}
              onReset={form.reset}
            />
          </div>

          <aside className="bk-side-col">
            <div className="bk-gallery">
              <GallerySlideshow />
            </div>
            <div className="bk-scard">
              <div className="bk-wacard">
                <h4 className="bk-wacard__h">Questions about your booking?</h4>
                <p className="bk-wacard__p">
                  Our team is standing by on WhatsApp to help with anything you need.
                </p>
                <a
                  href={`https://wa.me/${WA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bk-wabtn"
                >
                  <HiChatAlt2 size={17} /> Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="bk-scard">
              <div className="bk-tlist">
                <p className="bk-tlist__h"><HiSparkles size={12} /> What Happens Next?</p>
                {[
                  "You'll receive a confirmation email shortly",
                  "Our team reviews your request within 2 hours",
                  "We'll send a bespoke itinerary tailored to you",
                  "A coordinator contacts you to finalise details",
                ].map((item, i) => (
                  <div key={i} className="bk-trow">
                    <div
                      className="bk-trow__chk"
                      style={{
                        background: "linear-gradient(135deg,var(--g),var(--g2))",
                        color: "#fff", border: "none",
                        fontSize: 10, fontWeight: 800,
                        justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className="bk-trow__txt">{item}</span>
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