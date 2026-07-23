// src/pages/Booking/Booking.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING v6.0 — Modern Professional Design, FAQ-inspired hero
// ═══════════════════════════════════════════════════════════════════════════════

import React, {
  useEffect, useMemo, useRef, useCallback, useState,
} from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Shield, AlertCircle, X,
  MessageCircle, Lock, Globe, Award, MapPin, Calendar,
  Users, Star, Heart, Compass, CheckCircle, ChevronLeft,
  ChevronRight, Send, Clock, Zap, Eye, Phone, Sparkles,
  ShieldCheck, BadgeCheck, TrendingUp,
} from "lucide-react";

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
   CSS
═══════════════════════════════════════════════════════════════════════════ */
const BK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

/* ── Design tokens ── */
:root {
  --g:   #059669;
  --g2:  #10b981;
  --g3:  #34d399;
  --g4:  #6ee7b7;
  --g5:  #a7f3d0;
  --g6:  #d1fae5;
  --g7:  #ecfdf5;
  --g8:  #f0fdf4;
  --ink: #0f172a;
  --ink2:#1e293b;
  --ink3:#475569;
  --ink4:#64748b;
  --ink5:#94a3b8;
  --brd: #e2e8f0;
  --brd2:rgba(5,150,105,.12);
  --brd3:rgba(5,150,105,.22);
  --wh:  #ffffff;
  --off: #fafcfb;
  --ease:cubic-bezier(.22,1,.36,1);
  --ease2:cubic-bezier(.4,0,.2,1);
  --r12:12px; --r16:16px; --r20:20px; --r24:24px; --r28:28px;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

/* ── Keyframes ── */
@keyframes bkFadeUp   {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes bkFadeIn   {from{opacity:0}to{opacity:1}}
@keyframes bkSlideR   {from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
@keyframes bkSlideD   {from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes bkPop      {0%{transform:scale(.82);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes bkSpin     {to{transform:rotate(360deg)}}
@keyframes bkPulse    {0%,100%{opacity:1}50%{opacity:.4}}
@keyframes bkFloat    {0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes bkShimmer  {0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes bkRipple   {0%{transform:scale(0);opacity:.5}100%{transform:scale(3);opacity:0}}
@keyframes bkWave     {from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes bkGlow     {0%,100%{box-shadow:0 0 20px rgba(5,150,105,.2)}50%{box-shadow:0 0 40px rgba(5,150,105,.4)}}

.bk-fade-up {animation:bkFadeUp .5s var(--ease) both}
.bk-slide-r {animation:bkSlideR .38s var(--ease) both}
.bk-slide-d {animation:bkSlideD .25s ease both}
.bk-pop     {animation:bkPop .38s var(--ease) both}
.bk-wave-in {animation:bkWave .3s var(--ease) both;transform-origin:left}

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
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(circle at 15% 20%,rgba(5,150,105,.04) 0%,transparent 50%),
    radial-gradient(circle at 85% 60%,rgba(16,185,129,.04) 0%,transparent 50%),
    radial-gradient(circle at 50% 90%,rgba(5,150,105,.03) 0%,transparent 40%);
  pointer-events:none;
}

/* ══════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════ */
.bk-hero {
  position:relative;
  height:clamp(300px,36vw,480px);
  overflow:hidden;
  background:var(--ink);
}

.bk-hero__img {
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;object-position:center 35%;
  transition:transform 12s ease;
}
.bk-hero:hover .bk-hero__img{transform:scale(1.06)}

.bk-hero__grad {
  position:absolute;inset:0;
  background:linear-gradient(
    160deg,
    rgba(15,23,42,.3) 0%,
    rgba(15,23,42,.18) 30%,
    rgba(5,150,105,.5) 65%,
    rgba(15,23,42,.88) 100%
  );
}

.bk-hero__noise {
  position:absolute;inset:0;opacity:.03;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:200px;pointer-events:none;
}

/* Orbs */
.bk-hero__orbs{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.bk-hero__orb{
  position:absolute;border-radius:50%;
  background:radial-gradient(circle,rgba(52,211,153,.2),transparent 70%);
  animation:bkFloat 5s ease-in-out infinite;
}

.bk-hero__body {
  position:relative;z-index:2;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;gap:16px;
  padding:0 clamp(20px,5vw,60px);
}

.bk-hero__badge {
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 20px;border-radius:50px;
  background:rgba(255,255,255,.1);
  backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,.18);
  font-size:11px;font-weight:700;
  color:rgba(255,255,255,.9);
  letter-spacing:.1em;text-transform:uppercase;
}

.bk-hero__dot {
  width:7px;height:7px;border-radius:50%;
  background:var(--g3);
  animation:bkPulse 2.2s ease infinite;
}

.bk-hero__h1 {
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(30px,5.5vw,64px);
  font-weight:800;color:#fff;
  line-height:1.06;letter-spacing:-.02em;
  text-shadow:0 2px 32px rgba(0,0,0,.3);
}

.bk-hero__h1 em {
  font-style:italic;
  background:linear-gradient(135deg,#34d399,#6ee7b7);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}

.bk-hero__sub {
  font-size:clamp(14px,1.5vw,17px);
  color:rgba(255,255,255,.75);
  line-height:1.7;font-weight:400;
  max-width:500px;
}

.bk-hero__pills {
  display:flex;align-items:center;gap:10px;
  flex-wrap:wrap;justify-content:center;
}

.bk-hero__pill {
  display:flex;align-items:center;gap:6px;
  padding:6px 14px;border-radius:50px;
  background:rgba(255,255,255,.1);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.15);
  font-size:12px;color:rgba(255,255,255,.85);font-weight:600;
}

.bk-hero__wave {
  position:absolute;bottom:-1px;left:0;right:0;line-height:0;
}

/* ══════════════════════════════════════════════════════════
   BREADCRUMB
══════════════════════════════════════════════════════════ */
.bk-crumb {
  max-width:1380px;margin:0 auto;
  padding:14px clamp(16px,3vw,40px) 0;
  display:flex;align-items:center;gap:6px;
  font-size:12px;color:var(--ink4);font-weight:600;
  position:relative;z-index:2;
}
.bk-crumb a{color:var(--g);text-decoration:none;font-weight:700;transition:color .2s}
.bk-crumb a:hover{color:#047857}
.bk-crumb__sep{color:var(--g5);font-size:11px}

/* ══════════════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════════════ */
.bk-layout {
  max-width:1380px;margin:0 auto;
  padding:0 clamp(16px,3vw,40px) 100px;
  display:grid;
  grid-template-columns:minmax(0,1fr) 400px;
  gap:clamp(20px,2.5vw,36px);
  align-items:start;
  margin-top:clamp(-90px,-11vw,-120px);
  position:relative;z-index:2;
}

.bk-form-col {
  position:sticky;top:20px;z-index:10;
  max-height:calc(100vh - 40px);
  display:flex;flex-direction:column;min-height:0;
}

.bk-side-col{display:flex;flex-direction:column;gap:14px}

@media(max-width:1100px) {
  .bk-layout{grid-template-columns:1fr;margin-top:clamp(-60px,-9vw,-80px)}
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
    0 16px 48px rgba(5,150,105,.08),
    0 40px 80px rgba(0,0,0,.06);
  display:flex;flex-direction:column;
  overflow:hidden;flex:1;min-height:0;
  position:relative;
}

/* Gradient shimmer top accent */
.bk-card__top {
  height:4px;flex-shrink:0;
  background:linear-gradient(90deg,var(--g),var(--g2),var(--g3),var(--g2),var(--g));
  background-size:300% 100%;
  animation:bkShimmer 5s ease infinite;
}

/* ── Progress Bar ── */
.bk-pbar {
  height:2px;background:rgba(5,150,105,.07);flex-shrink:0;overflow:hidden;
}
.bk-pbar__fill {
  height:100%;
  background:linear-gradient(90deg,var(--g),var(--g2),var(--g3));
  border-radius:0 99px 99px 0;
  transition:width .7s var(--ease);
  position:relative;
}
.bk-pbar__dot {
  position:absolute;right:-4px;top:50%;transform:translateY(-50%);
  width:8px;height:8px;border-radius:50%;
  background:var(--g2);
  box-shadow:0 0 0 3px rgba(16,185,129,.2);
}

/* ── Top Bar ── */
.bk-topbar {
  display:flex;align-items:center;justify-content:space-between;
  padding:14px clamp(18px,2.5vw,28px);
  border-bottom:1px solid rgba(5,150,105,.08);
  background:linear-gradient(to right,var(--g8),white);
  flex-shrink:0;
}
.bk-topbar__left{display:flex;align-items:center;gap:12px}
.bk-topbar__ico {
  width:40px;height:40px;border-radius:13px;
  background:linear-gradient(135deg,var(--g),var(--g2));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 14px rgba(5,150,105,.28);
}
.bk-topbar__name{font-size:14px;font-weight:800;color:var(--ink);line-height:1.2}
.bk-topbar__step{font-size:11px;color:var(--ink4);font-weight:600;margin-top:1px}
.bk-topbar__wa {
  display:inline-flex;align-items:center;gap:7px;
  padding:9px 16px;border-radius:11px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;color:#fff;font-size:12px;font-weight:800;
  cursor:pointer;text-decoration:none;
  box-shadow:0 3px 14px rgba(34,197,94,.28);
  transition:all .28s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-topbar__wa:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(34,197,94,.38)}

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
  display:flex;flex-direction:column;align-items:center;gap:5px;
  padding:14px 6px;
  border:none;background:transparent;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:default;position:relative;
  transition:all .25s;
}
.bk-step--done{cursor:pointer}
.bk-step--done:hover{background:rgba(5,150,105,.04)}

.bk-step__ring {
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:800;
  transition:all .35s var(--ease);flex-shrink:0;
  position:relative;
}
.bk-step__ring--pending{
  background:rgba(5,150,105,.07);color:var(--ink4);
  border:1.5px solid rgba(5,150,105,.15);
}
.bk-step__ring--active{
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;
  box-shadow:0 4px 16px rgba(5,150,105,.3);
  animation:bkPop .4s var(--ease);
}
.bk-step__ring--done{
  background:var(--g7);color:var(--g);
  border:1.5px solid var(--g6);
}

.bk-step__lbl{
  font-size:10px;font-weight:700;letter-spacing:.02em;
  white-space:nowrap;line-height:1.2;transition:color .2s;
}
.bk-step--active  .bk-step__lbl{color:var(--g);font-weight:800}
.bk-step--done    .bk-step__lbl{color:var(--g2)}
.bk-step--pending .bk-step__lbl{color:var(--ink5)}

.bk-step__underline{
  position:absolute;bottom:0;left:15%;right:15%;height:2.5px;
  border-radius:99px;
  background:linear-gradient(90deg,var(--g),var(--g3));
  transform-origin:left;
}

/* Connectors */
.bk-conn{display:flex;align-items:center;flex-shrink:0;padding-bottom:14px}
.bk-conn__line{
  width:24px;height:1.5px;
  background:rgba(5,150,105,.14);border-radius:99px;transition:background .4s;
}
.bk-conn__line--done{background:var(--g4)}

/* ══════════════════════════════════════════════════════════
   SCROLL AREA
══════════════════════════════════════════════════════════ */
.bk-scroll {
  flex:1;overflow-y:auto;overflow-x:hidden;
  scrollbar-width:thin;scrollbar-color:var(--g6) transparent;
}
.bk-scroll::-webkit-scrollbar{width:4px}
.bk-scroll::-webkit-scrollbar-track{background:transparent}
.bk-scroll::-webkit-scrollbar-thumb{background:var(--g6);border-radius:99px}

/* ══════════════════════════════════════════════════════════
   STEP HEADER
══════════════════════════════════════════════════════════ */
.bk-shdr {
  padding:clamp(24px,3vw,34px) clamp(20px,2.5vw,32px) 0;
  text-align:center;
}
.bk-shdr__ico {
  display:inline-flex;align-items:center;justify-content:center;
  width:60px;height:60px;border-radius:20px;
  background:linear-gradient(135deg,var(--g7),var(--g8));
  border:1.5px solid var(--g6);
  margin-bottom:16px;position:relative;overflow:hidden;
}
.bk-shdr__ico::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(5,150,105,.12),transparent);
}
.bk-shdr__tag{
  position:absolute;top:5px;right:6px;
  font-size:8px;font-weight:800;color:var(--g2);letter-spacing:.05em;
}
.bk-shdr__h{
  font-family:'Playfair Display',serif;
  font-size:clamp(20px,2.8vw,28px);
  font-weight:700;color:var(--ink);
  margin:0 0 8px;line-height:1.18;
}
.bk-shdr__p{font-size:14px;color:var(--ink4);line-height:1.65;margin:0;max-width:420px;margin:0 auto}

/* ══════════════════════════════════════════════════════════
   FORM BODY & FIELD STYLES
══════════════════════════════════════════════════════════ */
.bk-fbody{padding:clamp(20px,2.5vw,28px) clamp(20px,2.5vw,32px)}

/* Field groups */
.bk-field-group{display:flex;flex-direction:column;gap:6px;margin-bottom:20px}
.bk-field-group:last-child{margin-bottom:0}

.bk-label{
  font-size:11px;font-weight:800;color:var(--ink3);
  letter-spacing:.06em;text-transform:uppercase;
  display:flex;align-items:center;gap:6px;
}
.bk-label-req{color:var(--g)}

.bk-input-wrap{position:relative;display:flex;align-items:center}
.bk-input-ico{
  position:absolute;left:14px;
  color:var(--g4);pointer-events:none;
  transition:color .2s;
}
.bk-input-wrap:focus-within .bk-input-ico{color:var(--g)}

.bk-input, .bk-select, .bk-textarea {
  width:100%;padding:13px 14px 13px 42px;
  border:2px solid var(--brd);border-radius:var(--r16);
  font-size:14.5px;font-weight:500;color:var(--ink2);
  background:white;outline:none;
  font-family:'Plus Jakarta Sans',sans-serif;
  transition:all .25s var(--ease2);
  box-shadow:0 2px 8px rgba(0,0,0,.03);
}
.bk-input::placeholder,.bk-select::placeholder,.bk-textarea::placeholder{
  color:var(--ink5);font-weight:400;
}
.bk-input:focus,.bk-select:focus,.bk-textarea:focus{
  border-color:var(--g);
  box-shadow:0 0 0 4px rgba(5,150,105,.08),0 2px 8px rgba(0,0,0,.04);
  background:white;
}
.bk-input--err,.bk-select--err{
  border-color:#fca5a5;
  box-shadow:0 0 0 4px rgba(239,68,68,.06);
}
.bk-select{padding-left:42px;cursor:pointer;appearance:none}
.bk-textarea{padding:13px 14px;resize:vertical;min-height:100px}

.bk-field-err{
  display:flex;align-items:center;gap:5px;
  font-size:12px;color:#dc2626;font-weight:600;margin-top:3px;
}

/* Two-column grid for fields */
.bk-field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:480px){.bk-field-row{grid-template-columns:1fr}}

/* ══════════════════════════════════════════════════════════
   ERROR BANNER
══════════════════════════════════════════════════════════ */
.bk-errbanner {
  display:flex;align-items:flex-start;gap:12px;
  padding:14px 18px;
  margin:14px clamp(20px,2.5vw,32px) 0;
  border-radius:var(--r16);
  background:#fef2f2;border:2px solid #fecaca;
  animation:bkSlideD .25s ease;
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
   NAVIGATION BUTTONS
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
  height:50px;padding:0 20px;
  border:2px solid rgba(5,150,105,.15);
  background:white;border-radius:var(--r16);
  font-size:14px;font-weight:700;color:var(--ink3);
  cursor:pointer;transition:all .28s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;flex-shrink:0;
}
.bk-btn-back:hover{
  background:var(--g8);border-color:var(--g3);
  color:var(--g);transform:translateX(-2px);
}

.bk-btn-next {
  flex:1;height:52px;
  display:flex;align-items:center;justify-content:center;gap:9px;
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;border:none;border-radius:var(--r16);
  font-size:15.5px;font-weight:800;cursor:pointer;
  transition:all .32s var(--ease);
  box-shadow:0 4px 20px rgba(5,150,105,.28);
  font-family:'Plus Jakarta Sans',sans-serif;
  position:relative;overflow:hidden;letter-spacing:.01em;
}
.bk-btn-next::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.18),transparent);
  opacity:0;transition:opacity .25s;
}
.bk-btn-next:hover:not(:disabled)::before{opacity:1}
.bk-btn-next:hover:not(:disabled){
  transform:translateY(-2px);
  box-shadow:0 12px 36px rgba(5,150,105,.38);
}
.bk-btn-next:active:not(:disabled){transform:scale(.98)}
.bk-btn-next:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.bk-btn-next__ripple{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.28);
  width:120px;height:120px;
  margin:-60px 0 0 -60px;
  animation:bkRipple .65s ease-out forwards;
  pointer-events:none;
}

/* ══════════════════════════════════════════════════════════
   TRUST STRIP
══════════════════════════════════════════════════════════ */
.bk-trust {
  display:flex;align-items:center;justify-content:center;
  flex-wrap:wrap;gap:12px;
  padding:12px clamp(20px,2.5vw,32px);
  border-top:1px solid var(--g7);
  background:linear-gradient(135deg,rgba(5,150,105,.04),rgba(16,185,129,.02));
  flex-shrink:0;
}
.bk-trust__pill{
  display:flex;align-items:center;gap:6px;
  font-size:11px;color:var(--g);font-weight:700;
}
.bk-trust__ico{
  width:20px;height:20px;border-radius:6px;
  background:var(--g7);border:1px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g);flex-shrink:0;
}

.bk-ftr{
  padding:8px clamp(20px,2.5vw,32px);
  border-top:1px solid rgba(5,150,105,.06);
  background:var(--g8);text-align:center;flex-shrink:0;
}
.bk-ftr p{
  font-size:10.5px;color:var(--ink4);
  display:flex;align-items:center;justify-content:center;gap:5px;margin:0;
}

/* ══════════════════════════════════════════════════════════
   DATE PICKER
══════════════════════════════════════════════════════════ */
.bk-dp{position:relative;user-select:none}

.bk-dp-btn{
  display:flex;align-items:center;gap:12px;
  width:100%;padding:13px 16px;
  background:white;
  border:2px solid var(--brd);border-radius:var(--r16);
  cursor:pointer;transition:all .22s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
  box-shadow:0 2px 8px rgba(0,0,0,.03);
}
.bk-dp-btn:hover{border-color:var(--g4);background:var(--g8)}
.bk-dp-btn--open{border-color:var(--g);box-shadow:0 0 0 4px rgba(5,150,105,.08)}
.bk-dp-btn--err{border-color:#fca5a5;box-shadow:0 0 0 4px rgba(239,68,68,.06)}

.bk-dp-btn__ico{
  width:42px;height:42px;border-radius:12px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1.5px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g2);flex-shrink:0;transition:all .22s;
}
.bk-dp-btn--open .bk-dp-btn__ico{
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;border-color:transparent;
  box-shadow:0 3px 12px rgba(5,150,105,.28);
}

.bk-dp-btn__txt{flex:1;text-align:left;min-width:0}
.bk-dp-btn__lbl{font-size:10px;font-weight:800;color:var(--ink4);letter-spacing:.08em;text-transform:uppercase;margin:0 0 2px}
.bk-dp-btn__val{font-size:14px;font-weight:600;color:var(--ink2);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bk-dp-btn__ph{color:rgba(5,150,105,.35);font-weight:400;font-size:13px}
.bk-dp-btn__chev{color:var(--g4);transition:transform .25s var(--ease);flex-shrink:0}
.bk-dp-btn--open .bk-dp-btn__chev{transform:rotate(180deg);color:var(--g)}

/* Calendar dropdown */
.bk-cal{
  position:absolute;top:calc(100% + 10px);left:0;right:0;z-index:300;
  background:white;
  border:2px solid var(--g6);border-radius:var(--r20);
  box-shadow:0 20px 60px rgba(5,150,105,.14),0 4px 14px rgba(0,0,0,.06);
  padding:18px;
  animation:bkSlideD .2s var(--ease);
}
.bk-cal__hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.bk-cal__month{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--ink);margin:0}
.bk-cal__nav{
  width:32px;height:32px;border-radius:10px;
  border:1.5px solid rgba(5,150,105,.18);background:white;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--ink4);transition:all .2s var(--ease);
}
.bk-cal__nav:hover:not(:disabled){background:var(--g8);border-color:var(--g3);color:var(--g2)}
.bk-cal__nav:disabled{opacity:.25;cursor:default}
.bk-cal__wds{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.bk-cal__wd{text-align:center;font-size:10px;font-weight:800;color:var(--g2);letter-spacing:.07em;text-transform:uppercase;padding:3px 0}
.bk-cal__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.bk-cal__day{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:500;color:var(--ink);
  border-radius:10px;border:none;background:transparent;
  cursor:pointer;transition:all .14s ease;
  font-family:'Plus Jakarta Sans',sans-serif;position:relative;
}
.bk-cal__day:hover:not(:disabled):not(.bk-cal__day--sel){background:var(--g8);color:var(--g2);font-weight:600}
.bk-cal__day--today{font-weight:800;color:var(--g2)}
.bk-cal__day--today::after{
  content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:var(--g2);
}
.bk-cal__day--sel{
  background:linear-gradient(135deg,var(--g),var(--g2))!important;
  color:#fff!important;font-weight:700!important;
  box-shadow:0 3px 12px rgba(5,150,105,.32);
}
.bk-cal__day--sel::after{display:none}
.bk-cal__day:disabled{color:rgba(5,150,105,.2);cursor:default;background:transparent}
.bk-cal__day--empty{cursor:default}
.bk-cal__day--empty:hover{background:transparent}
.bk-cal__quick{
  display:flex;flex-wrap:wrap;gap:6px;
  margin-top:14px;padding-top:14px;border-top:1px solid var(--brd2);
}
.bk-cal__qbtn{
  padding:6px 12px;border-radius:9px;
  border:1.5px solid rgba(5,150,105,.18);background:white;
  font-size:11.5px;font-weight:700;color:var(--ink4);
  cursor:pointer;transition:all .2s var(--ease);
  font-family:'Plus Jakarta Sans',sans-serif;
}
.bk-cal__qbtn:hover{background:var(--g8);border-color:var(--g3);color:var(--g2)}

/* Date range bar */
.bk-drb{
  display:flex;align-items:center;gap:10px;
  padding:13px 18px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1.5px solid var(--g6);border-radius:var(--r16);
  margin-top:10px;animation:bkSlideD .25s var(--ease);
}
.bk-drb__item{flex:1;text-align:center;min-width:0}
.bk-drb__lbl{font-size:9px;font-weight:800;color:var(--g2);letter-spacing:.1em;text-transform:uppercase;margin:0 0 3px}
.bk-drb__val{font-size:13.5px;font-weight:700;color:var(--ink);margin:0}
.bk-drb__arr{color:var(--g4);flex-shrink:0}
.bk-drb__nts{
  padding:5px 14px;border-radius:9px;
  background:var(--g2);color:#fff;
  font-size:12px;font-weight:800;flex-shrink:0;white-space:nowrap;
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR CARDS
══════════════════════════════════════════════════════════ */
.bk-scard {
  background:white;
  border-radius:var(--r20);
  border:1px solid rgba(5,150,105,.08);
  box-shadow:0 2px 16px rgba(5,150,105,.06);
  overflow:hidden;
  transition:box-shadow .3s,transform .3s;
  position:relative;
}
.bk-scard::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--g),var(--g2),var(--g3),var(--g2),var(--g));
  background-size:300% 100%;animation:bkShimmer 6s ease infinite;
}
.bk-scard:hover{box-shadow:0 8px 32px rgba(5,150,105,.10)}

.bk-gallery{
  height:260px;border-radius:var(--r20);overflow:hidden;
  position:relative;border:1px solid rgba(5,150,105,.08);
  box-shadow:0 4px 24px rgba(5,150,105,.10);
}

/* Why book card */
.bk-why{padding:22px 24px 20px}
.bk-why__hdr{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.bk-why__icon-wrap{
  width:32px;height:32px;border-radius:10px;
  background:linear-gradient(135deg,var(--g),var(--g2));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 3px 12px rgba(5,150,105,.24);
}
.bk-why__h{
  font-family:'Playfair Display',serif;
  font-size:17px;font-weight:700;color:var(--ink);margin:0;
}
.bk-why__item{
  display:flex;align-items:flex-start;gap:12px;
  padding:11px 0;border-bottom:1px solid var(--g8);
  transition:all .25s;
}
.bk-why__item:last-child{border:none;padding-bottom:0}
.bk-why__item:hover{padding-left:5px}
.bk-why__ico{
  width:38px;height:38px;border-radius:12px;
  background:var(--g8);border:1.5px solid var(--g7);
  display:flex;align-items:center;justify-content:center;
  color:var(--g2);flex-shrink:0;transition:all .3s var(--ease);
}
.bk-why__item:hover .bk-why__ico{
  background:linear-gradient(135deg,var(--g),var(--g2));
  color:#fff;border-color:transparent;
  box-shadow:0 4px 16px rgba(5,150,105,.28);transform:rotate(-5deg);
}
.bk-why__name{font-size:13.5px;font-weight:700;color:var(--ink);margin:0 0 2px}
.bk-why__desc{font-size:12px;color:var(--ink4);margin:0;line-height:1.55}

/* Trust list */
.bk-tlist{padding:20px 24px}
.bk-tlist__h{
  font-size:10px;font-weight:800;text-transform:uppercase;
  letter-spacing:.12em;color:var(--g2);margin:0 0 14px;
}
.bk-trow{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.bk-trow:last-child{margin:0}
.bk-trow__chk{
  width:24px;height:24px;border-radius:8px;
  background:var(--g8);border:1.5px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g2);flex-shrink:0;
}
.bk-trow__txt{font-size:13px;color:var(--ink3);font-weight:600}

/* WhatsApp card */
.bk-wacard{padding:20px 24px}
.bk-wacard__h{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--ink);margin:0 0 6px}
.bk-wacard__p{font-size:13px;color:var(--ink4);margin:0 0 16px;line-height:1.6}
.bk-wabtn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:14px 18px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;border-radius:var(--r16);
  color:#fff;font-size:14px;font-weight:800;
  cursor:pointer;text-decoration:none;
  transition:all .3s var(--ease);
  box-shadow:0 4px 20px rgba(34,197,94,.28);
  font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden;
}
.bk-wabtn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent);opacity:0;transition:opacity .2s}
.bk-wabtn:hover::before{opacity:1}
.bk-wabtn:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(34,197,94,.38)}

/* Review */
.bk-rev{padding:18px 24px}
.bk-rev__stars{display:flex;gap:2px;margin-bottom:10px}
.bk-rev__q{font-size:13.5px;color:var(--ink3);font-style:italic;line-height:1.7;margin:0 0 10px}
.bk-rev__author{font-size:11px;color:var(--ink5);font-weight:700;margin:0}
.bk-rev__score{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 11px;border-radius:99px;
  background:var(--g8);border:1px solid var(--g6);
  font-size:11px;font-weight:800;color:var(--g2);margin-left:8px;
}

/* Live viewers */
.bk-active{
  display:flex;align-items:center;gap:10px;
  padding:12px 18px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1px solid var(--g6);border-radius:var(--r16);
  font-size:12.5px;color:var(--ink2);font-weight:600;
}
.bk-active__dot{
  width:9px;height:9px;border-radius:50%;background:var(--g2);
  animation:bkPulse 2s ease infinite;flex-shrink:0;
  box-shadow:0 0 0 3px rgba(16,185,129,.2);
}

/* Dates summary */
.bk-dsum{padding:16px 20px}
.bk-dsum__h{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--g2);margin:0 0 10px}

/* Response time */
.bk-resp{display:flex;align-items:center;gap:13px;padding:16px 20px}
.bk-resp__ico{
  width:40px;height:40px;border-radius:13px;
  background:linear-gradient(135deg,var(--g8),var(--g7));
  border:1.5px solid var(--g6);
  display:flex;align-items:center;justify-content:center;
  color:var(--g2);flex-shrink:0;
}
.bk-resp__h{font-size:13.5px;font-weight:800;color:var(--ink);margin:0 0 2px}
.bk-resp__p{font-size:12px;color:var(--ink4);margin:0}

/* ══════════════════════════════════════════════════════════
   REDUCED MOTION
══════════════════════════════════════════════════════════ */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
`;

/* Style injection */
let _css = false;
function injectStyles() {
  if (_css || typeof document === "undefined") return;
  if (document.getElementById("bk-v6")) { _css = true; return; }
  const s = document.createElement("style");
  s.id = "bk-v6"; s.textContent = BK_CSS;
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
   DATE PICKER COMPONENT
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

  const IconEl = icon || <Calendar size={16} />;

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
        <ChevronRight size={15} className="bk-dp-btn__chev" />
      </button>

      {open && (
        <div className="bk-cal">
          <div className="bk-cal__hdr">
            <button type="button" className="bk-cal__nav" onClick={prev} disabled={!canP}>
              <ChevronLeft size={13} />
            </button>
            <h4 className="bk-cal__month">{MONTHS[vm]} {vy}</h4>
            <button type="button" className="bk-cal__nav" onClick={next} disabled={!canN}>
              <ChevronRight size={13} />
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

/* ── Date range bar ── */
const DateRangeBar = React.memo(function DateRangeBar({ arrivalDate, departureDate }) {
  if (!arrivalDate && !departureDate) return null;
  const n = nights(arrivalDate, departureDate);
  return (
    <div className="bk-drb">
      <div className="bk-drb__item">
        <p className="bk-drb__lbl">Arrival</p>
        <p className="bk-drb__val">{arrivalDate ? fmtC(arrivalDate) : "—"}</p>
      </div>
      <ArrowRight size={14} className="bk-drb__arr" />
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
  { icon: Users,         label: "You",         desc: "Who's going on safari?"           },
  { icon: MapPin,        label: "Destination", desc: "Choose your African escape."      },
  { icon: Calendar,      label: "Trip",         desc: "Dates, guests & preferences."    },
  { icon: MessageCircle, label: "Review",       desc: "Add notes & send your request."  },
];

const WHY = [
  { Icon: Shield,   title: "No Payment Now",    desc: "Free to enquire — pay only when confirmed."         },
  { Icon: Award,    title: "Expert-Led Safaris", desc: "Certified guides with 10+ years in the field."      },
  { Icon: Compass,  title: "Fully Bespoke",      desc: "Every itinerary crafted around your vision."        },
  { Icon: Zap,      title: "2-Hour Response",    desc: "Our team replies within 2 hours, guaranteed."       },
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

  /* Hero override from selected destination */
  const heroOverride = useMemo(() => {
    if (!form.data.destinationId) return null;
    const dest = destinationsList.find(d => d.value === String(form.data.destinationId));
    if (!dest?.image) return null;
    return { src: dest.image, alt: dest.label, caption: dest.label, tag: "Your selection" };
  }, [destinationsList, form.data.destinationId]);

  /* URL prefill */
  const [sp]  = useSearchParams();
  const pfRef = useRef(null);
  useEffect(() => {
    const s = sp.get("destination");
    if (!s || pfRef.current === s || !destinationsList.length) return;
    const m = destinationsList.find(
      d => d.label.toLowerCase().replace(/\s+/g, "-") === s || d.value === s,
    );
    if (m) { pfRef.current = s; form.set("destinationId", m.value); if (m.countryId) form.set("countryId", m.countryId); }
  }, [sp, destinationsList]); // eslint-disable-line

  /* Auto-focus first input */
  const firstInputRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [form.step]);

  /* Ripple effect */
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
        <div className="bk-hero__noise" />

        <div className="bk-hero__orbs" aria-hidden="true">
          {[
            { s: 100, t: "14%", l: "7%",  d: 0   },
            { s: 60,  t: "62%", l: "14%", d: 1.4 },
            { s: 130, t: "18%", l: "78%", d: 0.7 },
            { s: 50,  t: "72%", l: "88%", d: 2.1 },
          ].map((o, i) => (
            <div
              key={i}
              className="bk-hero__orb"
              style={{
                width: o.s, height: o.s,
                top: o.t, left: o.l,
                animationDelay: `${o.d}s`,
                animationDuration: `${4.5 + i * 0.8}s`,
              }}
            />
          ))}
        </div>

        <div className="bk-hero__body">
          <div className="bk-hero__badge">
            <span className="bk-hero__dot" />
            <Sparkles size={12} />
            Safari Booking Portal
          </div>
          <h1 className="bk-hero__h1">Plan Your <em>African</em> Adventure</h1>
          <p className="bk-hero__sub">
            A few details and our expert guides will craft your perfect, personalised safari itinerary.
          </p>
          <div className="bk-hero__pills">
            {[
              [Star,         "4.9/5 Rating"      ],
              [Users,        "2,400+ Guests"      ],
              [Globe,        "12 Countries"       ],
              [CheckCircle,  "Free to Enquire"    ],
            ].map(([Icon, t]) => (
              <div key={t} className="bk-hero__pill">
                <Icon size={11} /> {t}
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
        <span className="bk-crumb__sep"><ChevronRight size={10} /></span>
        <Link to="/packages">Packages</Link>
        <span className="bk-crumb__sep"><ChevronRight size={10} /></span>
        <span style={{ color: "var(--ink3)", fontWeight: 700 }}>Book Your Safari</span>
      </nav>

      {/* ── LAYOUT ── */}
      <div className="bk-layout bk-fade-up">

        {/* ════ FORM COLUMN ════ */}
        <div className="bk-form-col">
          <div className="bk-card">

            {/* Shimmer accent */}
            <div className="bk-card__top" />

            {/* Progress bar */}
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

            {/* Top bar */}
            <div className="bk-topbar">
              <div className="bk-topbar__left">
                <div className="bk-topbar__ico">
                  <Compass size={18} color="#fff" />
                </div>
                <div>
                  <p className="bk-topbar__name">Safari Booking</p>
                  <p className="bk-topbar__step">
                    Step {form.step + 1} of {form.STEPS.length} · {Math.round(progress)}% complete
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bk-topbar__wa"
              >
                <MessageCircle size={13} /> Chat
              </a>
            </div>

            {/* Step indicator */}
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
                        {done ? <Check size={12} /> : i + 1}
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

            {/* Scrollable content */}
            <div className="bk-scroll">

              {/* Error banner */}
              {form.submitError && (
                <div className="bk-errbanner" role="alert">
                  <AlertCircle size={17} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1 }}>
                    <p className="bk-errbanner__msg">{form.submitError}</p>
                    <a
                      href={`https://wa.me/${WA}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bk-wabtn"
                      style={{ width: "auto", padding: "7px 14px", fontSize: 12, display: "inline-flex" }}
                    >
                      <MessageCircle size={12} /> WhatsApp Us
                    </a>
                  </div>
                  <button
                    className="bk-errbanner__close"
                    onClick={() => form.setSubmitError?.(null)}
                    aria-label="Dismiss error"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Step header */}
              <div className="bk-shdr">
                <div className="bk-shdr__ico">
                  <StepIcon size={24} color="var(--g2)" />
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

              {/* Dev debug badge */}
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

              {/* Step content */}
              <div className="bk-fbody">
                <div key={`step-${form.step}`} className="bk-slide-r">
                  {renderStep()}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bk-nav">
              {form.step > 0 && (
                <button
                  type="button"
                  className="bk-btn-back"
                  onClick={handleBack}
                  disabled={form.submitting}
                >
                  <ArrowLeft size={14} /> Back
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
                  ? <><Send size={15} /> Send My Request</>
                  : <>Continue <ArrowRight size={15} /></>}
              </button>
            </div>

            {/* Trust strip */}
            <div className="bk-trust" role="list">
              {[
                { Icon: ShieldCheck,  label: "256-bit SSL"   },
                { Icon: BadgeCheck,   label: "No Payment"    },
                { Icon: Award,        label: "Expert Guided" },
                { Icon: Lock,         label: "Private & Safe"},
              ].map(({ Icon, label }) => (
                <div key={label} className="bk-trust__pill" role="listitem">
                  <div className="bk-trust__ico"><Icon size={11} /></div>
                  {label}
                </div>
              ))}
            </div>

            <div className="bk-ftr">
              <p>
                <ShieldCheck size={11} style={{ color: "var(--g2)" }} />
                Your information is private and never shared with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside className="bk-side-col">

          {/* Gallery */}
          <div className="bk-gallery">
            <GallerySlideshow hero={heroOverride} />
          </div>

          {/* Live viewers */}
          <div className="bk-active">
            <div className="bk-active__dot" />
            <Eye size={13} style={{ color: "var(--g2)", flexShrink: 0 }} />
            <span>
              <strong style={{ color: "var(--g)" }}>14 travellers</strong>{" "}
              viewing safaris right now
            </span>
          </div>

          {/* Trip dates */}
          {(form.data.arrivalDate || form.data.departureDate) && (
            <div className="bk-scard">
              <div className="bk-dsum" style={{ paddingTop: 22 }}>
                <p className="bk-dsum__h">Your Trip Dates</p>
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
              <div className="bk-why__hdr">
                <div className="bk-why__icon-wrap">
                  <Heart size={15} color="#fff" />
                </div>
                <h3 className="bk-why__h">Why Book With Altuvera?</h3>
              </div>
              {WHY.map(({ Icon, title, desc }) => (
                <div key={title} className="bk-why__item">
                  <div className="bk-why__ico"><Icon size={16} /></div>
                  <div>
                    <p className="bk-why__name">{title}</p>
                    <p className="bk-why__desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust checklist */}
          <div className="bk-scard">
            <div className="bk-tlist">
              <p className="bk-tlist__h">Your Guarantee</p>
              {TRUST.map(item => (
                <div key={item} className="bk-trow">
                  <div className="bk-trow__chk"><Check size={11} /></div>
                  <span className="bk-trow__txt">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
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
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bk-scard">
            <div className="bk-rev">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div className="bk-rev__stars">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13} style={{ fill: "#d4a853", color: "#d4a853" }} />
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

          {/* Response time */}
          <div className="bk-scard">
            <div className="bk-resp">
              <div className="bk-resp__ico"><Clock size={16} /></div>
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
            <CheckCircle size={12} />
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

      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(16px,3vw,40px) 100px" }}>
        <div
          className="bk-fade-up"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 400px",
            gap: "clamp(20px,2.5vw,36px)",
            alignItems: "start",
            marginTop: "clamp(-60px,-9vw,-80px)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <style>{`@media(max-width:1100px){.bk-sg{grid-template-columns:1fr!important}}`}</style>

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
                  <MessageCircle size={16} /> Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="bk-scard">
              <div className="bk-tlist">
                <p className="bk-tlist__h">What Happens Next?</p>
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

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
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

export { BkDatePicker, DateRangeBar, makeQuickPicks, makeDepartureQuickPicks };