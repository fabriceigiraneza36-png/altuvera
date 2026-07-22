// src/pages/Booking/Booking.jsx
import React, {
  useEffect, useMemo, useRef, useCallback, useState,
} from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiShield,
  FiAlertCircle, FiX, FiMessageCircle, FiLock,
  FiGlobe, FiAward, FiMapPin, FiCalendar,
  FiUsers, FiStar, FiHeart, FiCompass, FiCheckCircle,
  FiChevronLeft, FiChevronRight, FiSend, FiClock,
  FiZap, FiEye, FiPhone,
} from "react-icons/fi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { MdVerified } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

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

/* ═══════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════ */
const BK_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

/* ── tokens ── */
:root{
  --ink:#0a1628;--ink2:#1e3a5f;--ink3:#4a6fa5;
  --sage:#2d6a4f;--sage2:#40916c;--sage3:#74c69d;
  --sage4:#b7e4c7;--sage5:#d8f3dc;--sage6:#f0faf2;
  --gold:#d4a853;--gold2:#f0c96e;
  --white:#ffffff;--off:#fafcfb;
  --border:rgba(45,106,79,.12);--border2:rgba(45,106,79,.22);
  --r4:4px;--r8:8px;--r12:12px;--r16:16px;--r20:20px;--r28:28px;
  --ease:cubic-bezier(.22,1,.36,1);
  --ease2:cubic-bezier(.4,0,.2,1);
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

/* ── animations ── */
@keyframes bk-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes bk-in{from{opacity:0}to{opacity:1}}
@keyframes bk-rx{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
@keyframes bk-lx{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
@keyframes bk-sd{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes bk-pop{0%{transform:scale(.82);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes bk-spin{to{transform:rotate(360deg)}}
@keyframes bk-pulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes bk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes bk-shimmer{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}
@keyframes bk-ripple{0%{transform:scale(0);opacity:.5}100%{transform:scale(3);opacity:0}}
@keyframes bk-wave{from{transform:scaleX(0)}to{transform:scaleX(1)}}

.bk-up  {animation:bk-up  .5s var(--ease) both}
.bk-in  {animation:bk-in  .35s ease both}
.bk-rx  {animation:bk-rx  .38s var(--ease) both}
.bk-sd  {animation:bk-sd  .25s ease both}
.bk-pop {animation:bk-pop .38s var(--ease) both}
.bk-wave{animation:bk-wave .3s var(--ease) both;transform-origin:left}

/* ══════════════════════════════════════
   PAGE
══════════════════════════════════════ */
.bk-page{
  font-family:'DM Sans',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
  background:var(--sage6);
  color:var(--ink);
}

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
.bk-hero{
  position:relative;
  height:clamp(260px,32vw,400px);
  overflow:hidden;
  background:var(--ink);
}
.bk-hero__img{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;object-position:center 35%;
  transition:transform 10s ease;
}
.bk-hero:hover .bk-hero__img{transform:scale(1.05)}
.bk-hero__grad{
  position:absolute;inset:0;
  background:linear-gradient(
    160deg,
    rgba(10,22,40,.25) 0%,
    rgba(10,22,40,.15) 35%,
    rgba(45,106,79,.55) 65%,
    rgba(10,22,40,.85) 100%
  );
}
.bk-hero__noise{
  position:absolute;inset:0;
  opacity:.04;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size:200px;
  pointer-events:none;
}

/* orbs */
.bk-hero__orbs{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.bk-hero__orb{
  position:absolute;border-radius:50%;
  background:radial-gradient(circle,rgba(116,198,157,.25),transparent 70%);
  animation:bk-float 5s ease-in-out infinite;
}

.bk-hero__body{
  position:relative;z-index:2;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;gap:14px;
  padding:0 clamp(20px,5vw,60px);
}
.bk-hero__badge{
  display:inline-flex;align-items:center;gap:7px;
  padding:6px 18px;border-radius:99px;
  background:rgba(255,255,255,.1);
  backdrop-filter:blur(14px);
  border:1px solid rgba(255,255,255,.18);
  font-size:11px;font-weight:600;color:rgba(255,255,255,.88);
  letter-spacing:.1em;text-transform:uppercase;
}
.bk-hero__dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--sage3);
  animation:bk-pulse 2.2s ease infinite;
}
.bk-hero__h1{
  font-family:'Cormorant Garamond',Georgia,serif;
  font-size:clamp(28px,5vw,58px);
  font-weight:700;color:#fff;
  line-height:1.06;letter-spacing:-.02em;
  text-shadow:0 2px 28px rgba(0,0,0,.28);
}
.bk-hero__h1 em{font-style:italic;color:var(--sage3)}
.bk-hero__sub{
  font-size:clamp(13px,1.4vw,16px);
  color:rgba(255,255,255,.72);
  line-height:1.68;font-weight:300;
  max-width:480px;
}
.bk-hero__pills{
  display:flex;align-items:center;gap:10px;
  flex-wrap:wrap;justify-content:center;
}
.bk-hero__pill{
  display:flex;align-items:center;gap:5px;
  padding:4px 12px;border-radius:99px;
  background:rgba(255,255,255,.1);
  backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,.14);
  font-size:11.5px;color:rgba(255,255,255,.82);font-weight:500;
}
.bk-hero__wave{
  position:absolute;bottom:-1px;left:0;right:0;line-height:0;
}

/* ══════════════════════════════════════
   BREADCRUMB
══════════════════════════════════════ */
.bk-crumb{
  max-width:1360px;margin:0 auto;
  padding:12px clamp(16px,3vw,40px) 0;
  display:flex;align-items:center;gap:6px;
  font-size:12px;color:var(--ink3);font-weight:500;
}
.bk-crumb a{color:var(--sage2);text-decoration:none;font-weight:600;transition:color .2s}
.bk-crumb a:hover{color:var(--sage)}
.bk-crumb__sep{color:var(--sage4);font-size:10px}

/* ══════════════════════════════════════
   LAYOUT
══════════════════════════════════════ */
.bk-layout{
  max-width:1360px;margin:0 auto;
  padding:0 clamp(16px,3vw,40px) 100px;
  display:grid;
  grid-template-columns:minmax(0,1fr) 380px;
  gap:clamp(20px,2.5vw,36px);
  align-items:start;
  margin-top:clamp(-80px,-10vw,-110px);
  position:relative;z-index:2;
}
.bk-form-col{
  position:sticky;top:20px;z-index:10;
  max-height:calc(100vh - 40px);
  display:flex;flex-direction:column;min-height:0;
}
.bk-side-col{display:flex;flex-direction:column;gap:14px}

@media(max-width:1100px){
  .bk-layout{grid-template-columns:1fr;margin-top:clamp(-55px,-8vw,-75px)}
  .bk-form-col{position:relative;top:auto;max-height:none}
}

/* ══════════════════════════════════════
   FORM CARD
══════════════════════════════════════ */
.bk-card{
  background:var(--white);
  border-radius:var(--r28);
  border:1px solid var(--border);
  box-shadow:
    0 0 0 1px rgba(45,106,79,.04),
    0 4px 6px rgba(0,0,0,.04),
    0 16px 48px rgba(45,106,79,.10),
    0 40px 80px rgba(0,0,0,.06);
  display:flex;flex-direction:column;
  overflow:hidden;flex:1;min-height:0;
}

/* Shimmer accent */
.bk-card__top{
  height:3px;flex-shrink:0;
  background:linear-gradient(90deg,var(--sage),var(--sage2),var(--gold),var(--sage2),var(--sage));
  background-size:300% 100%;
  animation:bk-shimmer 5s ease infinite;
}

/* ── Progress ── */
.bk-pbar{height:2px;background:rgba(45,106,79,.08);flex-shrink:0;overflow:hidden}
.bk-pbar__fill{
  height:100%;
  background:linear-gradient(90deg,var(--sage2),var(--sage3));
  border-radius:0 99px 99px 0;
  transition:width .7s var(--ease);
  position:relative;
}
.bk-pbar__dot{
  position:absolute;right:-4px;top:50%;transform:translateY(-50%);
  width:8px;height:8px;border-radius:50%;
  background:var(--sage2);
  box-shadow:0 0 0 3px rgba(64,145,108,.2);
}

/* ── Top bar ── */
.bk-topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px clamp(18px,2.5vw,28px);
  border-bottom:1px solid var(--border);
  background:linear-gradient(to right,var(--sage6),var(--white));
  flex-shrink:0;
}
.bk-topbar__left{display:flex;align-items:center;gap:12px}
.bk-topbar__ico{
  width:38px;height:38px;border-radius:11px;
  background:linear-gradient(135deg,var(--sage),var(--sage2));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 14px rgba(45,106,79,.28);
}
.bk-topbar__name{font-size:14px;font-weight:700;color:var(--ink);line-height:1.2}
.bk-topbar__step{font-size:11px;color:var(--ink3);font-weight:500;margin-top:1px}
.bk-topbar__wa{
  display:inline-flex;align-items:center;gap:6px;
  padding:8px 15px;border-radius:10px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;color:#fff;font-size:12px;font-weight:700;
  cursor:pointer;text-decoration:none;
  box-shadow:0 3px 12px rgba(34,197,94,.28);
  transition:all .28s var(--ease);
  font-family:'DM Sans',sans-serif;
}
.bk-topbar__wa:hover{transform:translateY(-2px);box-shadow:0 7px 22px rgba(34,197,94,.38)}

/* ══════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════ */
.bk-steps{
  display:flex;align-items:center;
  padding:0 clamp(18px,2.5vw,28px);
  border-bottom:1px solid var(--border);
  background:var(--off);
  overflow-x:auto;scrollbar-width:none;flex-shrink:0;
}
.bk-steps::-webkit-scrollbar{display:none}

.bk-step{
  flex:1;min-width:0;
  display:flex;flex-direction:column;align-items:center;gap:5px;
  padding:14px 6px;
  border:none;background:transparent;
  font-family:'DM Sans',sans-serif;
  cursor:default;position:relative;
  transition:all .25s;
}
.bk-step--done{cursor:pointer}
.bk-step--done:hover{background:rgba(45,106,79,.04)}

.bk-step__ring{
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:11.5px;font-weight:800;
  transition:all .35s var(--ease);flex-shrink:0;
  position:relative;
}
.bk-step__ring--pending{
  background:rgba(45,106,79,.07);color:var(--ink3);
  border:1.5px solid rgba(45,106,79,.15);
}
.bk-step__ring--active{
  background:linear-gradient(135deg,var(--sage2),var(--sage));
  color:#fff;
  box-shadow:0 4px 16px rgba(45,106,79,.3);
  animation:bk-pop .4s var(--ease);
}
.bk-step__ring--done{
  background:var(--sage5);color:var(--sage);
  border:1.5px solid var(--sage4);
}
.bk-step__lbl{
  font-size:10px;font-weight:600;letter-spacing:.02em;
  white-space:nowrap;line-height:1.2;transition:color .2s;
}
.bk-step--active .bk-step__lbl{color:var(--sage);font-weight:700}
.bk-step--done   .bk-step__lbl{color:var(--sage2)}
.bk-step--pending .bk-step__lbl{color:var(--ink3)}
.bk-step__underline{
  position:absolute;bottom:0;left:15%;right:15%;height:2px;
  border-radius:99px;
  background:linear-gradient(90deg,var(--sage2),var(--sage3));
  transform-origin:left;
}

/* connectors */
.bk-conn{display:flex;align-items:center;flex-shrink:0;padding-bottom:14px}
.bk-conn__line{
  width:24px;height:1.5px;
  background:rgba(45,106,79,.15);
  border-radius:99px;transition:background .4s;
}
.bk-conn__line--done{background:var(--sage3)}

/* ══════════════════════════════════════
   SCROLL AREA
══════════════════════════════════════ */
.bk-scroll{
  flex:1;overflow-y:auto;overflow-x:hidden;
  scrollbar-width:thin;scrollbar-color:var(--sage4) transparent;
}
.bk-scroll::-webkit-scrollbar{width:4px}
.bk-scroll::-webkit-scrollbar-track{background:transparent}
.bk-scroll::-webkit-scrollbar-thumb{background:var(--sage4);border-radius:99px}

/* ══════════════════════════════════════
   STEP HEADER
══════════════════════════════════════ */
.bk-shdr{
  padding:clamp(22px,3vw,32px) clamp(20px,2.5vw,30px) 0;
  text-align:center;
}
.bk-shdr__ico{
  display:inline-flex;align-items:center;justify-content:center;
  width:54px;height:54px;border-radius:17px;
  background:linear-gradient(135deg,var(--sage6),var(--sage5));
  border:1.5px solid var(--sage4);
  margin-bottom:14px;position:relative;overflow:hidden;
}
.bk-shdr__ico::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(64,145,108,.12),transparent);
}
.bk-shdr__tag{
  position:absolute;top:5px;right:6px;
  font-size:8.5px;font-weight:800;color:var(--sage2);letter-spacing:.05em;
}
.bk-shdr__h{
  font-family:'Cormorant Garamond',serif;
  font-size:clamp(20px,2.6vw,27px);
  font-weight:700;color:var(--ink);
  margin:0 0 6px;line-height:1.18;
}
.bk-shdr__p{font-size:13px;color:var(--ink3);line-height:1.65;margin:0}

/* ══════════════════════════════════════
   FORM BODY
══════════════════════════════════════ */
.bk-fbody{padding:clamp(18px,2.5vw,26px) clamp(20px,2.5vw,30px)}

/* ══════════════════════════════════════
   ERROR BANNER
══════════════════════════════════════ */
.bk-errbanner{
  display:flex;align-items:flex-start;gap:10px;
  padding:13px 16px;margin:14px clamp(20px,2.5vw,30px) 0;
  border-radius:var(--r12);
  background:#fef2f2;border:1.5px solid #fecaca;
  animation:bk-sd .25s ease;
}
.bk-errbanner__msg{font-size:13px;color:#b91c1c;margin:0 0 8px;line-height:1.55}
.bk-errbanner__close{
  border:none;background:transparent;cursor:pointer;
  color:#ef4444;padding:2px;border-radius:6px;
  transition:background .2s;flex-shrink:0;
}
.bk-errbanner__close:hover{background:#fee2e2}

/* ══════════════════════════════════════
   NAVIGATION
══════════════════════════════════════ */
.bk-nav{
  display:flex;align-items:center;gap:10px;
  padding:clamp(14px,2vw,18px) clamp(20px,2.5vw,30px);
  border-top:1px solid var(--border);
  background:linear-gradient(to top,var(--sage6) 0%,var(--white) 100%);
  flex-shrink:0;
}
.bk-btn-back{
  display:inline-flex;align-items:center;gap:7px;
  height:46px;padding:0 18px;
  border:1.5px solid rgba(45,106,79,.2);
  background:var(--white);border-radius:var(--r12);
  font-size:13.5px;font-weight:600;color:var(--ink2);
  cursor:pointer;transition:all .28s var(--ease);
  font-family:'DM Sans',sans-serif;flex-shrink:0;
}
.bk-btn-back:hover{
  background:var(--sage6);border-color:var(--sage3);
  color:var(--sage);transform:translateX(-2px);
}
.bk-btn-next{
  flex:1;height:50px;
  display:flex;align-items:center;justify-content:center;gap:9px;
  background:linear-gradient(135deg,var(--sage2),var(--sage));
  color:#fff;border:none;border-radius:var(--r12);
  font-size:15px;font-weight:700;cursor:pointer;
  transition:all .32s var(--ease);
  box-shadow:0 4px 22px rgba(45,106,79,.28);
  font-family:'DM Sans',sans-serif;
  position:relative;overflow:hidden;
}
.bk-btn-next::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.18),transparent);
  opacity:0;transition:opacity .25s;
}
.bk-btn-next:hover:not(:disabled)::before{opacity:1}
.bk-btn-next:hover:not(:disabled){
  transform:translateY(-2px);
  box-shadow:0 10px 34px rgba(45,106,79,.38);
}
.bk-btn-next:active:not(:disabled){transform:scale(.98)}
.bk-btn-next:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.bk-btn-next__ripple{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.28);
  width:120px;height:120px;
  margin:-60px 0 0 -60px;
  animation:bk-ripple .65s ease-out forwards;
  pointer-events:none;
}

/* ══════════════════════════════════════
   TRUST STRIP
══════════════════════════════════════ */
.bk-trust{
  display:flex;align-items:center;justify-content:center;
  flex-wrap:wrap;gap:14px;
  padding:10px clamp(20px,2.5vw,30px);
  border-top:1px solid var(--sage5);
  background:var(--sage6);flex-shrink:0;
}
.bk-trust__pill{
  display:flex;align-items:center;gap:5px;
  font-size:10.5px;color:var(--sage);font-weight:600;
}
.bk-trust__ico{
  width:18px;height:18px;border-radius:5px;
  background:var(--sage5);border:1px solid var(--sage4);
  display:flex;align-items:center;justify-content:center;
  color:var(--sage);flex-shrink:0;
}

/* Footer */
.bk-ftr{
  padding:8px clamp(20px,2.5vw,30px);
  border-top:1px solid var(--border);
  background:var(--off);text-align:center;flex-shrink:0;
}
.bk-ftr p{
  font-size:10.5px;color:var(--ink3);
  display:flex;align-items:center;justify-content:center;gap:5px;margin:0;
}

/* ══════════════════════════════════════
   DATE PICKER
══════════════════════════════════════ */
.bk-dp{position:relative;user-select:none}
.bk-dp-btn{
  display:flex;align-items:center;gap:12px;
  width:100%;padding:12px 15px;
  background:var(--white);
  border:1.5px solid rgba(45,106,79,.2);
  border-radius:var(--r12);cursor:pointer;
  transition:all .22s var(--ease);
  font-family:'DM Sans',sans-serif;
}
.bk-dp-btn:hover{border-color:var(--sage3);background:var(--sage6)}
.bk-dp-btn--open{border-color:var(--sage2);box-shadow:0 0 0 3px rgba(64,145,108,.1)}
.bk-dp-btn--err{border-color:#fca5a5;box-shadow:0 0 0 3px rgba(239,68,68,.07)}
.bk-dp-btn__ico{
  width:40px;height:40px;border-radius:10px;
  background:linear-gradient(135deg,var(--sage6),var(--sage5));
  border:1px solid var(--sage4);
  display:flex;align-items:center;justify-content:center;
  color:var(--sage2);flex-shrink:0;transition:all .22s;
}
.bk-dp-btn--open .bk-dp-btn__ico{
  background:linear-gradient(135deg,var(--sage2),var(--sage));
  color:#fff;border-color:transparent;
  box-shadow:0 2px 10px rgba(45,106,79,.28);
}
.bk-dp-btn__txt{flex:1;text-align:left;min-width:0}
.bk-dp-btn__lbl{
  font-size:9.5px;font-weight:700;color:var(--ink3);
  letter-spacing:.08em;text-transform:uppercase;margin:0 0 2px;
}
.bk-dp-btn__val{
  font-size:14px;font-weight:600;color:var(--ink);margin:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.bk-dp-btn__ph{color:rgba(45,106,79,.35);font-weight:400;font-size:13px}
.bk-dp-btn__chev{color:var(--sage3);transition:transform .25s var(--ease);flex-shrink:0}
.bk-dp-btn--open .bk-dp-btn__chev{transform:rotate(180deg);color:var(--sage2)}

/* Calendar */
.bk-cal{
  position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:300;
  background:var(--white);
  border:1.5px solid var(--sage4);
  border-radius:var(--r16);
  box-shadow:0 20px 60px rgba(45,106,79,.14),0 4px 14px rgba(0,0,0,.07);
  padding:16px;
  animation:bk-sd .2s var(--ease);
}
.bk-cal__hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.bk-cal__month{
  font-family:'Cormorant Garamond',serif;
  font-size:16px;font-weight:700;color:var(--ink);margin:0;
}
.bk-cal__nav{
  width:30px;height:30px;border-radius:9px;
  border:1px solid rgba(45,106,79,.2);background:var(--white);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--ink3);transition:all .2s var(--ease);
}
.bk-cal__nav:hover:not(:disabled){
  background:var(--sage6);border-color:var(--sage3);color:var(--sage2);
}
.bk-cal__nav:disabled{opacity:.25;cursor:default}
.bk-cal__wds{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.bk-cal__wd{
  text-align:center;font-size:10px;font-weight:800;
  color:var(--sage2);letter-spacing:.07em;text-transform:uppercase;padding:3px 0;
}
.bk-cal__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.bk-cal__day{
  aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:500;color:var(--ink);
  border-radius:9px;border:none;background:transparent;
  cursor:pointer;transition:all .14s ease;
  font-family:'DM Sans',sans-serif;position:relative;
}
.bk-cal__day:hover:not(:disabled):not(.bk-cal__day--sel){
  background:var(--sage6);color:var(--sage2);font-weight:600;
}
.bk-cal__day--today{font-weight:800;color:var(--sage2)}
.bk-cal__day--today::after{
  content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
  width:4px;height:4px;border-radius:50%;background:var(--sage2);
}
.bk-cal__day--sel{
  background:linear-gradient(135deg,var(--sage2),var(--sage))!important;
  color:#fff!important;font-weight:700!important;
  box-shadow:0 3px 12px rgba(45,106,79,.32);
}
.bk-cal__day--sel::after{display:none}
.bk-cal__day:disabled{color:rgba(45,106,79,.2);cursor:default;background:transparent}
.bk-cal__day--empty{cursor:default}
.bk-cal__day--empty:hover{background:transparent}
.bk-cal__quick{
  display:flex;flex-wrap:wrap;gap:5px;
  margin-top:12px;padding-top:12px;border-top:1px solid var(--border);
}
.bk-cal__qbtn{
  padding:5px 10px;border-radius:8px;
  border:1.5px solid rgba(45,106,79,.18);background:var(--white);
  font-size:11px;font-weight:600;color:var(--ink3);
  cursor:pointer;transition:all .2s var(--ease);
  font-family:'DM Sans',sans-serif;
}
.bk-cal__qbtn:hover{background:var(--sage6);border-color:var(--sage3);color:var(--sage2)}

/* Date range bar */
.bk-drb{
  display:flex;align-items:center;gap:10px;
  padding:12px 16px;
  background:linear-gradient(135deg,var(--sage6),var(--sage5));
  border:1.5px solid var(--sage4);border-radius:var(--r12);
  margin-top:10px;animation:bk-sd .25s var(--ease);
}
.bk-drb__item{flex:1;text-align:center;min-width:0}
.bk-drb__lbl{
  font-size:9px;font-weight:800;color:var(--sage2);
  letter-spacing:.1em;text-transform:uppercase;margin:0 0 3px;
}
.bk-drb__val{font-size:13px;font-weight:700;color:var(--ink);margin:0}
.bk-drb__arr{color:var(--sage3);flex-shrink:0}
.bk-drb__nts{
  padding:4px 12px;border-radius:8px;
  background:var(--sage2);color:#fff;
  font-size:11px;font-weight:800;flex-shrink:0;white-space:nowrap;
}

/* ══════════════════════════════════════
   SIDEBAR
══════════════════════════════════════ */
.bk-scard{
  background:var(--white);
  border-radius:var(--r20);
  border:1px solid var(--border);
  box-shadow:0 2px 12px rgba(45,106,79,.06);
  overflow:hidden;
  transition:box-shadow .3s,transform .3s;
}
.bk-scard:hover{box-shadow:0 6px 28px rgba(45,106,79,.10)}

.bk-gallery{
  height:240px;border-radius:var(--r20);overflow:hidden;
  position:relative;border:1px solid var(--border);
  box-shadow:0 4px 20px rgba(45,106,79,.10);
}

/* Why book */
.bk-why{padding:20px 22px 18px}
.bk-why__hdr{
  display:flex;align-items:center;gap:9px;margin-bottom:16px;
}
.bk-why__icon-wrap{
  width:30px;height:30px;border-radius:9px;
  background:linear-gradient(135deg,var(--sage2),var(--sage));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 3px 10px rgba(45,106,79,.24);
}
.bk-why__h{
  font-family:'Cormorant Garamond',serif;
  font-size:16px;font-weight:700;color:var(--ink);margin:0;
}
.bk-why__item{
  display:flex;align-items:flex-start;gap:12px;
  padding:10px 0;border-bottom:1px solid var(--sage6);
  transition:all .25s;
}
.bk-why__item:last-child{border:none;padding-bottom:0}
.bk-why__item:hover{padding-left:4px}
.bk-why__ico{
  width:36px;height:36px;border-radius:10px;
  background:var(--sage6);border:1.5px solid var(--sage5);
  display:flex;align-items:center;justify-content:center;
  color:var(--sage2);flex-shrink:0;transition:all .3s var(--ease);
}
.bk-why__item:hover .bk-why__ico{
  background:linear-gradient(135deg,var(--sage2),var(--sage));
  color:#fff;border-color:transparent;
  box-shadow:0 4px 14px rgba(45,106,79,.28);transform:rotate(-5deg);
}
.bk-why__name{font-size:13px;font-weight:700;color:var(--ink);margin:0 0 2px}
.bk-why__desc{font-size:12px;color:var(--ink3);margin:0;line-height:1.5}

/* Trust */
.bk-tlist{padding:16px 22px}
.bk-tlist__h{
  font-size:10px;font-weight:800;text-transform:uppercase;
  letter-spacing:.12em;color:var(--sage2);margin:0 0 12px;
}
.bk-trow{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.bk-trow:last-child{margin:0}
.bk-trow__chk{
  width:22px;height:22px;border-radius:7px;
  background:var(--sage6);border:1.5px solid var(--sage4);
  display:flex;align-items:center;justify-content:center;
  color:var(--sage2);flex-shrink:0;
}
.bk-trow__txt{font-size:12.5px;color:var(--ink2);font-weight:500}

/* WA card */
.bk-wacard{padding:18px 22px}
.bk-wacard__h{
  font-family:'Cormorant Garamond',serif;
  font-size:15px;font-weight:700;color:var(--ink);margin:0 0 5px;
}
.bk-wacard__p{font-size:12.5px;color:var(--ink3);margin:0 0 14px;line-height:1.55}
.bk-wabtn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:13px 18px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  border:none;border-radius:var(--r12);
  color:#fff;font-size:13.5px;font-weight:700;
  cursor:pointer;text-decoration:none;
  transition:all .3s var(--ease);
  box-shadow:0 4px 18px rgba(34,197,94,.26);
  font-family:'DM Sans',sans-serif;position:relative;overflow:hidden;
}
.bk-wabtn::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.14),transparent);
  opacity:0;transition:opacity .2s;
}
.bk-wabtn:hover::before{opacity:1}
.bk-wabtn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(34,197,94,.36)}

/* Review */
.bk-rev{padding:16px 22px}
.bk-rev__stars{display:flex;gap:2px;margin-bottom:10px}
.bk-rev__q{
  font-size:13px;color:var(--ink2);font-style:italic;
  line-height:1.65;margin:0 0 8px;
}
.bk-rev__author{font-size:11px;color:var(--ink3);font-weight:700;margin:0}
.bk-rev__score{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 10px;border-radius:99px;
  background:var(--sage6);border:1px solid var(--sage4);
  font-size:11px;font-weight:800;color:var(--sage2);margin-left:8px;
}

/* Active badge */
.bk-active{
  display:flex;align-items:center;gap:9px;
  padding:11px 16px;
  background:linear-gradient(135deg,var(--sage6),var(--sage5));
  border:1px solid var(--sage4);border-radius:var(--r16);
  font-size:12px;color:var(--ink);font-weight:600;
}
.bk-active__dot{
  width:9px;height:9px;border-radius:50%;background:var(--sage2);
  animation:bk-pulse 2s ease infinite;flex-shrink:0;
  box-shadow:0 0 0 3px rgba(64,145,108,.2);
}

/* Dates summary */
.bk-dsum{padding:14px 18px}
.bk-dsum__h{
  font-size:10px;font-weight:800;text-transform:uppercase;
  letter-spacing:.12em;color:var(--sage2);margin:0 0 10px;
}

/* Response card */
.bk-resp{
  display:flex;align-items:center;gap:12px;
  padding:14px 18px;
}
.bk-resp__ico{
  width:38px;height:38px;border-radius:11px;
  background:linear-gradient(135deg,var(--sage6),var(--sage5));
  border:1.5px solid var(--sage4);
  display:flex;align-items:center;justify-content:center;
  color:var(--sage2);flex-shrink:0;
}
.bk-resp__h{font-size:13px;font-weight:700;color:var(--ink);margin:0 0 2px}
.bk-resp__p{font-size:12px;color:var(--ink3);margin:0}

/* Debug */
.bk-dbg{
  background:#fef9c3;border:1px solid #fde047;border-radius:8px;
  padding:9px 12px;margin-bottom:12px;font-size:11px;color:#713f12;
  font-family:'Courier New',monospace;line-height:1.6;
}

/* ══════════════════════════════════════
   REDUCED MOTION
══════════════════════════════════════ */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
`;

/* ── inject once ── */
let _css = false;
function injectStyles() {
  if (_css || typeof document === "undefined") return;
  if (document.getElementById("bk-v5")) { _css = true; return; }
  const s = document.createElement("style");
  s.id = "bk-v5"; s.textContent = BK_CSS;
  document.head.appendChild(s); _css = true;
}

/* ═══════════════════════════════════════════════════════
   DATE UTILITIES
═══════════════════════════════════════════════════════ */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDS    = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const toStr  = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const fmtS   = v => v ? new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
const fmtC   = v => v ? new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "";
const nights = (a,b) => (!a||!b) ? 0 : Math.round((new Date(b)-new Date(a))/864e5);

const makeQuickPicks = (base=null) => {
  const d = base ? new Date(base) : new Date();
  const add = n => { const r=new Date(d); r.setDate(r.getDate()+n); return toStr(r.getFullYear(),r.getMonth(),r.getDate()); };
  return [{label:"1 week",value:add(7)},{label:"2 weeks",value:add(14)},{label:"1 month",value:add(30)},{label:"3 months",value:add(90)}];
};
const makeDepartureQuickPicks = arrival => {
  if (!arrival) return [];
  const d = new Date(arrival);
  const add = n => { const r=new Date(d); r.setDate(r.getDate()+n); return toStr(r.getFullYear(),r.getMonth(),r.getDate()); };
  return [{label:"3 nights",value:add(3)},{label:"5 nights",value:add(5)},{label:"7 nights",value:add(7)},{label:"10 nights",value:add(10)},{label:"14 nights",value:add(14)}];
};

/* ═══════════════════════════════════════════════════════
   DATE PICKER
═══════════════════════════════════════════════════════ */
const BkDatePicker = React.memo(function BkDatePicker({
  label, value, onChange, placeholder="Select date",
  minDate=null, maxDate=null, error=false, icon=null, quickPicks=[],
}) {
  const [open,setOpen] = useState(false);
  const [vy,setVy]     = useState(()=>(value?new Date(value):new Date()).getFullYear());
  const [vm,setVm]     = useState(()=>(value?new Date(value):new Date()).getMonth());
  const ref = useRef(null);

  useEffect(()=>{
    if(!open) return;
    const dn = e=>{ if(!ref.current?.contains(e.target)) setOpen(false); };
    const dk = e=>{ if(e.key==="Escape") setOpen(false); };
    document.addEventListener("mousedown",dn);
    document.addEventListener("keydown",dk);
    return()=>{ document.removeEventListener("mousedown",dn); document.removeEventListener("keydown",dk); };
  },[open]);

  const tod = new Date(); tod.setHours(0,0,0,0);
  const minD = minDate?new Date(minDate):tod; minD.setHours(0,0,0,0);
  const maxD = maxDate?new Date(maxDate):null; if(maxD) maxD.setHours(0,0,0,0);

  const fd  = new Date(vy,vm,1).getDay();
  const dim = new Date(vy,vm+1,0).getDate();
  const canP = new Date(vy,vm,1) > minD;
  const canN = !maxD || new Date(vy,vm+1,1) <= maxD;

  const prev = ()=> vm===0  ? (setVm(11),setVy(y=>y-1)) : setVm(m=>m-1);
  const next = ()=> vm===11 ? (setVm(0), setVy(y=>y+1)) : setVm(m=>m+1);
  const pick = day=>{ onChange(toStr(vy,vm,day)); setOpen(false); };

  const dis = day=>{ const d=new Date(vy,vm,day); d.setHours(0,0,0,0); return d<minD||(maxD&&d>maxD); };
  const isT = day=> vy===tod.getFullYear()&&vm===tod.getMonth()&&day===tod.getDate();
  const isS = day=>{ if(!value) return false; const s=new Date(value); return vy===s.getFullYear()&&vm===s.getMonth()&&day===s.getDate(); };

  return (
    <div className="bk-dp" ref={ref}>
      <button type="button"
        className={["bk-dp-btn",open?"bk-dp-btn--open":"",error?"bk-dp-btn--err":""].join(" ")}
        onClick={()=>setOpen(p=>!p)}>
        <div className="bk-dp-btn__ico">{icon||<FiCalendar size={16}/>}</div>
        <div className="bk-dp-btn__txt">
          <p className="bk-dp-btn__lbl">{label}</p>
          <p className={`bk-dp-btn__val${!value?" bk-dp-btn__ph":""}`}>{value?fmtS(value):placeholder}</p>
        </div>
        <FiChevronRight size={15} className="bk-dp-btn__chev"/>
      </button>
      {open && (
        <div className="bk-cal">
          <div className="bk-cal__hdr">
            <button type="button" className="bk-cal__nav" onClick={prev} disabled={!canP}><FiChevronLeft size={13}/></button>
            <h4 className="bk-cal__month">{MONTHS[vm]} {vy}</h4>
            <button type="button" className="bk-cal__nav" onClick={next} disabled={!canN}><FiChevronRight size={13}/></button>
          </div>
          <div className="bk-cal__wds">{WDS.map(w=><span key={w} className="bk-cal__wd">{w}</span>)}</div>
          <div className="bk-cal__grid">
            {Array.from({length:fd}).map((_,i)=><span key={`e${i}`} className="bk-cal__day bk-cal__day--empty"/>)}
            {Array.from({length:dim}).map((_,i)=>{
              const day=i+1; const d=dis(day);
              let cls="bk-cal__day";
              if(isT(day)) cls+=" bk-cal__day--today";
              if(isS(day)) cls+=" bk-cal__day--sel";
              return <button key={day} type="button" className={cls} disabled={d} onClick={()=>!d&&pick(day)}>{day}</button>;
            })}
          </div>
          {quickPicks.length>0 && (
            <div className="bk-cal__quick">
              {quickPicks.map(qp=>(
                <button key={qp.label} type="button" className="bk-cal__qbtn"
                  onClick={()=>{ onChange(qp.value); setOpen(false); const d=new Date(qp.value); setVy(d.getFullYear()); setVm(d.getMonth()); }}>
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
const DateRangeBar = React.memo(function DateRangeBar({arrivalDate,departureDate}) {
  if (!arrivalDate && !departureDate) return null;
  const n = nights(arrivalDate,departureDate);
  return (
    <div className="bk-drb bk-sd">
      <div className="bk-drb__item">
        <p className="bk-drb__lbl">Arrival</p>
        <p className="bk-drb__val">{arrivalDate?fmtC(arrivalDate):"—"}</p>
      </div>
      <FiArrowRight size={14} className="bk-drb__arr"/>
      <div className="bk-drb__item">
        <p className="bk-drb__lbl">Departure</p>
        <p className="bk-drb__val">{departureDate?fmtC(departureDate):"—"}</p>
      </div>
      {n>0 && <span className="bk-drb__nts">{n} {n===1?"night":"nights"}</span>}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const STEP_META = [
  {icon:FiUsers,    label:"You",         desc:"Who's going on safari?"},
  {icon:FiMapPin,   label:"Destination", desc:"Choose your African escape."},
  {icon:FiCalendar, label:"Trip",        desc:"Dates, guests & preferences."},
  {icon:FiMessageCircle, label:"Review", desc:"Add notes & send your request."},
];

const WHY = [
  {Icon:FiShield,  title:"No Payment Now",      desc:"Free to enquire — pay only when confirmed."},
  {Icon:FiAward,   title:"Expert-Led Safaris",   desc:"Certified guides with 10+ years in the field."},
  {Icon:FiCompass, title:"Fully Bespoke",        desc:"Every itinerary crafted around your vision."},
  {Icon:FiZap,     title:"2-Hour Response",      desc:"Our team replies within 2 hours, guaranteed."},
];

const TRUST = [
  "100% free to enquire",
  "No hidden fees ever",
  "Response within 2 hours",
  "Certified local guides",
  "Flexible cancellation",
  "Fully insured & bonded",
];

/* ═══════════════════════════════════════════════════════
   DATA NORMALISATION
═══════════════════════════════════════════════════════ */
const norm_dest = d => ({
  value:       String(d.id),
  label:       d.name ?? "",
  countryId:   String(d.countryId ?? d.country_id ?? d.country?.id ?? ""),
  countrySlug: d.countrySlug ?? d.country_slug ?? d.country?.slug ?? "",
  country:     d.countryName ?? d.country_name ?? (typeof d.country==="string"?d.country:d.country?.name) ?? "",
  image:       d.heroImage ?? d.coverImageUrl ?? d.imageUrl ?? (Array.isArray(d.images)&&d.images[0]) ?? null,
  tagline:     d.tagline,
  shortDescription: d.shortDescription ?? d.short_description,
  difficulty:  d.difficulty, category: d.category,
  rating:      d.rating,    duration: d.duration,
  durationDays:d.durationDays ?? d.duration_days,
});
const norm_ctry = c => ({
  value: String(c.id), label: c.name ?? "",
  slug:  c.slug ?? "", flag: c.flag ?? c.flagUrl ?? c.flag_url ?? "",
});

/* ═══════════════════════════════════════════════════════
   BOOKING PAGE
═══════════════════════════════════════════════════════ */
function BookingPage() {
  useEffect(injectStyles,[]);

  const {data:rawC, loading:cL} = useCountriesList({limit:100});
  const {data:rawD, loading:dL} = useDestinationsList({limit:200});

  const countriesList    = useMemo(()=>(rawC??[]).map(norm_ctry),[rawC]);
  const destinationsList = useMemo(()=>(rawD??[]).map(norm_dest),[rawD]);

  const isDev    = import.meta.env.DEV;
  const form     = useBookingContext();
  const navigate = useNavigate();

  /* hero override from selected destination */
  const heroOverride = useMemo(()=>{
    if(!form.data.destinationId) return null;
    const dest = destinationsList.find(d=>d.value===String(form.data.destinationId));
    if(!dest?.image) return null;
    return {src:dest.image,alt:dest.label,caption:dest.label,tag:"Your selection"};
  },[destinationsList,form.data.destinationId]);

  /* URL prefill */
  const [sp]  = useSearchParams();
  const pfRef = useRef(null);
  useEffect(()=>{
    const s=sp.get("destination");
    if(!s||pfRef.current===s||!destinationsList.length) return;
    const m=destinationsList.find(d=>d.label.toLowerCase().replace(/\s+/g,"-")===s||d.value===s);
    if(m){ pfRef.current=s; form.set("destinationId",m.value); if(m.countryId) form.set("countryId",m.countryId); }
  },[sp,destinationsList]); // eslint-disable-line

  /* auto-focus */
  const firstInputRef = useRef(null);
  useEffect(()=>{
    const t=setTimeout(()=>firstInputRef.current?.focus(),380);
    return()=>clearTimeout(t);
  },[form.step]);

  /* ripple */
  const [ripple,setRipple] = useState(null);
  const triggerRipple = useCallback(e=>{
    const r=e.currentTarget.getBoundingClientRect();
    setRipple({x:e.clientX-r.left,y:e.clientY-r.top});
    setTimeout(()=>setRipple(null),700);
  },[]);

  const stepProps = {
    data:form.data, set:form.set, touch:form.touch,
    errors:form.errors, touched:form.touched,
    countriesList, destinationsList, firstInputRef,
    loading:cL||dL,
    DatePicker:BkDatePicker,
    DateRangeBar,
    makeQuickPicks,
    makeDepartureQuickPicks,
  };

  const renderStep = () => {
    switch(form.step){
      case 0: return <Step0Identity    {...stepProps}/>;
      case 1: return <Step1Destination {...stepProps}/>;
      case 2: return <Step2Trip        {...stepProps}/>;
      case 3: return <Step3Contact     {...stepProps}/>;
      default: return null;
    }
  };

  const isLast   = form.step === form.STEPS.length - 1;
  const progress = ((form.step+1)/form.STEPS.length)*100;

  const handleNext = e=>{
    triggerRipple(e);
    if(isLast) form.submit();
    else if(form.tryNext()) navigate(form.step+1>0?`/booking/step/${form.step+1}`:"/booking");
  };
  const handleBack = ()=>{
    form.goBack();
    navigate(form.step-1>0?`/booking/step/${form.step-1}`:"/booking");
  };
  const handleStepClick = i=>{
    if(i<form.step){ form.jumpTo(i); navigate(i>0?`/booking/step/${i}`:"/booking"); }
  };

  if(form.submitted) return <Navigate to="/booking/success" replace/>;

  const SM = STEP_META[form.step];
  const StepIcon = SM.icon;

  return (
    <div className="bk-page">

      {/* ── HERO ── */}
      <div className="bk-hero">
        <img src={HERO_IMG} alt="African safari" className="bk-hero__img"/>
        <div className="bk-hero__grad"/>
        <div className="bk-hero__noise"/>
        <div className="bk-hero__orbs" aria-hidden="true">
          {[{s:100,t:"14%",l:"7%",d:0},{s:60,t:"62%",l:"14%",d:1.4},{s:130,t:"18%",l:"78%",d:.7},{s:50,t:"72%",l:"88%",d:2.1}].map((o,i)=>(
            <div key={i} className="bk-hero__orb" style={{width:o.s,height:o.s,top:o.t,left:o.l,animationDelay:`${o.d}s`,animationDuration:`${4.5+i*.8}s`}}/>
          ))}
        </div>

        <div className="bk-hero__body">
          <div className="bk-hero__badge">
            <span className="bk-hero__dot"/><HiSparkles size={12}/>Safari Booking Portal
          </div>
          <h1 className="bk-hero__h1">Plan Your <em>African</em> Adventure</h1>
          <p className="bk-hero__sub">A few details and our expert guides will craft your perfect, personalised safari itinerary.</p>
          <div className="bk-hero__pills">
            {[[FiStar,"4.9/5 Rating"],[FiUsers,"2,400+ Guests"],[FiGlobe,"12 Countries"],[FiCheckCircle,"Free to Enquire"]].map(([Icon,t])=>(
              <div key={t} className="bk-hero__pill"><Icon size={11}/>{t}</div>
            ))}
          </div>
        </div>

        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 60" fill="none" style={{width:"100%",display:"block"}} preserveAspectRatio="none">
            <path d="M0,60 C300,8 600,0 900,22 C1100,38 1300,10 1440,0 L1440,60Z" fill="#f0faf2"/>
          </svg>
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <nav className="bk-crumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="bk-crumb__sep"><FiChevronRight size={10}/></span>
        <Link to="/packages">Packages</Link>
        <span className="bk-crumb__sep"><FiChevronRight size={10}/></span>
        <span style={{color:"var(--ink2)",fontWeight:600}}>Book Your Safari</span>
      </nav>

      {/* ── LAYOUT ── */}
      <div className="bk-layout bk-up">

        {/* ════ FORM ════ */}
        <div className="bk-form-col">
          <div className="bk-card">
            <div className="bk-card__top"/>

            {/* Progress */}
            <div className="bk-pbar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="bk-pbar__fill" style={{width:`${progress}%`}}>
                <div className="bk-pbar__dot"/>
              </div>
            </div>

            {/* Top bar */}
            <div className="bk-topbar">
              <div className="bk-topbar__left">
                <div className="bk-topbar__ico"><FiCompass size={18} color="#fff"/></div>
                <div>
                  <p className="bk-topbar__name">Safari Booking</p>
                  <p className="bk-topbar__step">Step {form.step+1} of {form.STEPS.length} · {Math.round(progress)}% complete</p>
                </div>
              </div>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-topbar__wa">
                <FiMessageCircle size={13}/> Chat
              </a>
            </div>

            {/* Stepper */}
            <div className="bk-steps" role="navigation" aria-label="Booking steps">
              {form.STEPS.map((s,i)=>{
                const active=form.step===i; const done=form.step>i;
                const state=active?"active":done?"done":"pending";
                return (
                  <React.Fragment key={s.id}>
                    <button type="button"
                      className={`bk-step bk-step--${state}`}
                      onClick={()=>done&&handleStepClick(i)}
                      aria-current={active?"step":undefined}
                      aria-label={`Step ${i+1}: ${s.label}`}>
                      <div className={`bk-step__ring bk-step__ring--${state}`}>
                        {done?<FiCheck size={12}/>:i+1}
                      </div>
                      <span className="bk-step__lbl">{s.label}</span>
                      {active && <div className="bk-step__underline bk-wave"/>}
                    </button>
                    {i<form.STEPS.length-1 && (
                      <div className="bk-conn">
                        <div className={`bk-conn__line${done?" bk-conn__line--done":""}`}/>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Scroll area */}
            <div className="bk-scroll">
              {/* Error */}
              {form.submitError && (
                <div className="bk-errbanner" role="alert">
                  <FiAlertCircle size={17} color="#dc2626" style={{flexShrink:0,marginTop:1}}/>
                  <div style={{flex:1}}>
                    <p className="bk-errbanner__msg">{form.submitError}</p>
                    <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
                       className="bk-wabtn" style={{width:"auto",padding:"7px 14px",fontSize:12,display:"inline-flex"}}>
                      <FiMessageCircle size={12}/> WhatsApp Us
                    </a>
                  </div>
                  <button className="bk-errbanner__close" onClick={()=>form.setSubmitError?.(null)} aria-label="Dismiss">
                    <FiX size={15}/>
                  </button>
                </div>
              )}

              {/* Step header */}
              <div className="bk-shdr">
                <div className="bk-shdr__ico">
                  <StepIcon size={23} color="var(--sage2)"/>
                  <span className="bk-shdr__tag">{form.step+1}/{form.STEPS.length}</span>
                </div>
                <h2 className="bk-shdr__h">
                  {form.step===0&&form.displayName?`Hi, ${form.displayName}!`
                    :SM.label==="You"?"Tell Us About You"
                    :SM.label==="Destination"?"Choose Your Destination"
                    :SM.label==="Trip"?"Trip Details"
                    :"Almost There!"}
                </h2>
                <p className="bk-shdr__p">{SM.desc}</p>
              </div>

              {/* Dev debug */}
              {isDev && form.step===1 && (
                <div className="bk-dbg" style={{margin:"12px 20px 0"}}>
                  <strong>🐛</strong> dest:<strong>{destinationsList.length}</strong> countries:<strong>{countriesList.length}</strong> countryId:<strong>"{form.data.countryId}"</strong> matches:<strong>{form.data.countryId?destinationsList.filter(d=>d.countryId===String(form.data.countryId)).length:"—"}</strong>
                </div>
              )}

              {/* Content */}
              <div className="bk-fbody">
                <div key={`s${form.step}`} className="bk-rx">
                  {renderStep()}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bk-nav">
              {form.step>0 && (
                <button type="button" className="bk-btn-back" onClick={handleBack} disabled={form.submitting}>
                  <FiArrowLeft size={14}/> Back
                </button>
              )}
              <button type="button" className="bk-btn-next" onClick={handleNext} disabled={form.submitting}>
                {ripple && <span className="bk-btn-next__ripple" style={{top:ripple.y,left:ripple.x}}/>}
                {form.submitting
                  ? <><Spinner/> Sending…</>
                  : isLast
                    ? <><FiSend size={14}/> Send My Request</>
                    : <>Continue <FiArrowRight size={14}/></>
                }
              </button>
            </div>

            {/* Trust strip */}
            <div className="bk-trust" role="list">
              {[{Icon:RiShieldKeyholeLine,t:"256-bit SSL"},{Icon:MdVerified,t:"No Payment"},{Icon:FiAward,t:"Expert Guided"},{Icon:FiLock,t:"Private & Safe"}].map(({Icon,t})=>(
                <div key={t} className="bk-trust__pill" role="listitem">
                  <div className="bk-trust__ico"><Icon size={10}/></div>{t}
                </div>
              ))}
            </div>

            <div className="bk-ftr">
              <p><RiShieldKeyholeLine size={11} style={{color:"var(--sage2)"}}/> Your information is private and never shared.</p>
            </div>
          </div>
        </div>

        {/* ════ SIDEBAR ════ */}
        <aside className="bk-side-col">

          {/* Gallery */}
          <div className="bk-gallery"><GallerySlideshow hero={heroOverride}/></div>

          {/* Live viewers */}
          <div className="bk-active">
            <div className="bk-active__dot"/>
            <FiEye size={13} style={{color:"var(--sage2)",flexShrink:0}}/>
            <span><strong style={{color:"var(--sage)"}}>14 travellers</strong> viewing safaris right now</span>
          </div>

          {/* Trip dates */}
          {(form.data.arrivalDate||form.data.departureDate) && (
            <div className="bk-scard">
              <div className="bk-dsum">
                <p className="bk-dsum__h">📅 Your Trip Dates</p>
                <DateRangeBar arrivalDate={form.data.arrivalDate} departureDate={form.data.departureDate}/>
              </div>
            </div>
          )}

          {/* Why book */}
          <div className="bk-scard">
            <div className="bk-why">
              <div className="bk-why__hdr">
                <div className="bk-why__icon-wrap"><FiHeart size={15} color="#fff"/></div>
                <h3 className="bk-why__h">Why Book With Altuvera?</h3>
              </div>
              {WHY.map(({Icon,title,desc})=>(
                <div key={title} className="bk-why__item">
                  <div className="bk-why__ico"><Icon size={16}/></div>
                  <div>
                    <p className="bk-why__name">{title}</p>
                    <p className="bk-why__desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div className="bk-scard">
            <div className="bk-tlist">
              <p className="bk-tlist__h">✅ Your Guarantee</p>
              {TRUST.map(item=>(
                <div key={item} className="bk-trow">
                  <div className="bk-trow__chk"><FiCheck size={11}/></div>
                  <span className="bk-trow__txt">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bk-scard">
            <div className="bk-wacard">
              <h4 className="bk-wacard__h">Prefer to chat directly?</h4>
              <p className="bk-wacard__p">Our safari experts are on WhatsApp — get instant, personalised answers.</p>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wabtn">
                <FiMessageCircle size={16}/> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Review */}
          <div className="bk-scard">
            <div className="bk-rev">
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div className="bk-rev__stars">
                  {[1,2,3,4,5].map(i=><FiStar key={i} size={13} style={{fill:"#d4a853",color:"#d4a853"}}/>)}
                </div>
                <span className="bk-rev__score">4.9 / 5.0</span>
              </div>
              <p className="bk-rev__q">"Absolutely flawless from start to finish — the booking was effortless, and the safari itself was the experience of a lifetime."</p>
              <p className="bk-rev__author">— Sarah M., United Kingdom · Rwanda 2024</p>
            </div>
          </div>

          {/* Response time */}
          <div className="bk-scard">
            <div className="bk-resp">
              <div className="bk-resp__ico"><FiClock size={16}/></div>
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

/* ═══════════════════════════════════════════════════════
   SUCCESS ROUTE
═══════════════════════════════════════════════════════ */
function BookingSuccessRoute() {
  useEffect(injectStyles,[]);
  const form = useBookingContext();
  if(!form.submitted) return <Navigate to="/booking" replace/>;

  return (
    <div className="bk-page">
      <div className="bk-hero" style={{height:"clamp(200px,22vw,270px)"}}>
        <img src={HERO_IMG} alt="" className="bk-hero__img"/>
        <div className="bk-hero__grad"/>
        <div className="bk-hero__body">
          <div className="bk-hero__badge"><FiCheckCircle size={12}/> Request Received</div>
          <h1 className="bk-hero__h1" style={{fontSize:"clamp(24px,4vw,44px)"}}>We've Got Your Request!</h1>
          <p className="bk-hero__sub">Our safari team will be in touch within 2 hours.</p>
        </div>
        <div className="bk-hero__wave">
          <svg viewBox="0 0 1440 60" fill="none" style={{width:"100%",display:"block"}} preserveAspectRatio="none">
            <path d="M0,60 C300,8 600,0 900,22 C1100,38 1300,10 1440,0 L1440,60Z" fill="#f0faf2"/>
          </svg>
        </div>
      </div>

      <div style={{maxWidth:1360,margin:"0 auto",padding:"0 clamp(16px,3vw,40px) 100px"}}>
        <div className="bk-up" style={{
          display:"grid",gridTemplateColumns:"minmax(0,1fr) 380px",
          gap:"clamp(20px,2.5vw,36px)",alignItems:"start",
          marginTop:"clamp(-55px,-8vw,-75px)",position:"relative",zIndex:2,
        }}>
          <style>{`@media(max-width:1100px){.bk-sg{grid-template-columns:1fr!important}}`}</style>
          <div className="bk-card bk-sg">
            <div className="bk-card__top"/>
            <SuccessScreen displayName={form.displayName} bookingRef={form.bookingRef} email={form.data.email} onReset={form.reset}/>
          </div>
          <aside className="bk-side-col bk-sg">
            <div className="bk-gallery"><GallerySlideshow/></div>
            <div className="bk-scard">
              <div className="bk-wacard">
                <h4 className="bk-wacard__h">Questions about your booking?</h4>
                <p className="bk-wacard__p">Our team is standing by on WhatsApp to help with anything you need.</p>
                <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bk-wabtn">
                  <FiMessageCircle size={16}/> Chat on WhatsApp
                </a>
              </div>
            </div>
            <div className="bk-scard">
              <div className="bk-tlist">
                <p className="bk-tlist__h">What Happens Next?</p>
                {["You'll receive a confirmation email shortly","Our team reviews your request within 2 hours","We'll send a bespoke itinerary tailored to you","A coordinator contacts you to finalise details"].map((item,i)=>(
                  <div key={i} className="bk-trow">
                    <div className="bk-trow__chk" style={{background:"linear-gradient(135deg,var(--sage2),var(--sage))",color:"#fff",border:"none",fontSize:10,fontWeight:800}}>{i+1}</div>
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

/* ═══════════════════════════════════════════════════════
   EXPORTS
═══════════════════════════════════════════════════════ */
export default function Booking() {
  return (
    <BookingProvider>
      <BookingRoutes/>
    </BookingProvider>
  );
}

function BookingRoutes() {
  const form = useBookingContext();
  if(form.submitted) return <BookingSuccessRoute/>;
  return <BookingPage/>;
}

export { BkDatePicker, DateRangeBar, makeQuickPicks, makeDepartureQuickPicks };