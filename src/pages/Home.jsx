// src/pages/Home.jsx
import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { HiOutlineArrowRight } from "react-icons/hi2";
import { FaStar, FaRegStar } from "react-icons/fa6";
import {
  MdOutlineArticle, MdOutlineDateRange, MdOutlineVisibility,
  MdClose, MdOutlineLocationOn, MdOutlineExplore, MdPlayArrow,
  MdSkipNext, MdSkipPrevious, MdPlaylistPlay,
} from "react-icons/md";
import {
  IoChevronBack, IoChevronForward, IoCompassOutline, IoEarthOutline,
  IoHeartOutline, IoHeart,
} from "react-icons/io5";
import {
  Clock, MapPin, ArrowRight, Package, Heart,
} from "lucide-react";
import {
  FiChevronLeft, FiChevronRight, FiMapPin,
} from "react-icons/fi";

import Hero, { HERO_SLIDES } from "../components/home/Hero";
import TestimonialShowcase from "../components/home/TestimonialShowcase";
import Button from "../components/common/Button";
import SEO from "../components/common/SEO";

import { useApp } from "../context/AppContext";
import { useDestinations } from "../hooks/useDestinations";
import { usePosts } from "../hooks/usePosts";
import { useWishlist } from "../hooks/useWishlist";

import "../styles/Home.css";

/* ═══════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════ */
const THEME = {
  default: { accent: "#059669" }, dark: { accent: "#f59e0b" },
  earth: { accent: "#d97706" }, ocean: { accent: "#2563eb" },
  sunset: { accent: "#ea580c" }, minimal: { accent: "#334155" },
};

/* ═══════════════════════════════════════════
    API / HELPERS
 ═══════════════════════════════════════════ */
import { API_URL } from "../utils/apiBase";

const API_BASE = API_URL;

const apiGet = async (path, params = null) => {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }
  const token = localStorage.getItem("altuvera_auth_token")
    || localStorage.getItem("altuvera_token")
    || localStorage.getItem("token") || null;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) throw new Error(`Server error (${res.status})`);
  return res.json();
};

const fmtPrice = (price, currency = "USD") => {
  if (!price && price !== 0) return "Contact Us";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(price);
  } catch { return `$${Number(price).toLocaleString()}`; }
};

const fmtDuration = (days, nights) => {
  if (!days) return null;
  return `${days}D / ${(nights ?? days - 1)}N`;
};

const parseJsonField = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

/* ═══════════════════════════════════════════
   INJECTED STYLES
═══════════════════════════════════════════ */
const HOME_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap');

/* ══════════════════════════════════════════
   GLOBAL SECTION SPACING — COMPACT
══════════════════════════════════════════ */
.home-section--compact {
  padding: clamp(1.5rem, 3vw, 2.5rem) 0;
}
.home-section--compact-top {
  padding-top: clamp(1.5rem, 3vw, 2.5rem);
}
.home-section--compact-bottom {
  padding-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

/* Section headers — no eyebrow badges */
.hsec-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  font-weight: 800;
  color: #14532d;
  line-height: 1.15;
  margin: 0 0 .5rem;
}
.hsec-title span { color: #22c55e; }
.hsec-sub {
  font-family: 'Inter', sans-serif;
  font-size: clamp(.82rem, 1.15vw, .95rem);
  color: #5A7A5A;
  line-height: 1.6;
  max-width: 540px;
  margin: 0;
}
.hsec-center { text-align: center; }
.hsec-center .hsec-sub { margin: 0 auto; }
.hsec-header {
  margin-bottom: clamp(1rem, 2vw, 1.75rem);
}

/* ══════════════════════════════════════════
   INTRO MEDIA PANEL — FIXED SIZE
══════════════════════════════════════════ */
.intro-media-grid {
  width: 100%;
  max-width: 520px;
  height: 380px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: .65rem;
  flex-shrink: 0;
  position: relative;
}
.intro-media-main {
  grid-row: 1 / -1;
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #0f1b0f;
  box-shadow: 0 12px 40px rgba(0,0,0,.16);
  cursor: pointer;
  transition: box-shadow .4s ease;
}
.intro-media-main:hover {
  box-shadow: 0 20px 56px rgba(0,0,0,.24);
}
.intro-media-main::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(5,37,20,.72) 0%, rgba(5,37,20,.12) 45%, transparent 100%);
  pointer-events: none;
  z-index: 2;
}
.intro-media-main-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.intro-media-main-badge {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  width: fit-content;
  font-family: 'Inter', sans-serif;
  font-size: .55rem;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #86efac;
  background: rgba(16,185,129,.15);
  backdrop-filter: blur(8px);
  padding: .2rem .5rem;
  border-radius: 99px;
  border: 1px solid rgba(134,239,172,.2);
}
.intro-media-main-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin: 0;
}
.intro-media-main-sub {
  font-family: 'Inter', sans-serif;
  font-size: .68rem;
  color: rgba(255,255,255,.6);
  margin: 0;
}
.intro-media-play-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255,255,255,.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
  animation: introPlayPulse 2.5s ease-in-out infinite;
}
.intro-media-play-ring:hover {
  background: rgba(16,185,129,.6);
  border-color: #34d399;
  transform: translate(-50%, -50%) scale(1.12);
  animation: none;
}
.intro-media-play-ring svg { color: #fff; margin-left: 2px; }
@keyframes introPlayPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.4); }
  50% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
}
.intro-media-main-glow {
  position: absolute;
  top: -2.5rem;
  right: -2.5rem;
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,.2) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}
.intro-media-side {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  background: #e2e8f0;
  box-shadow: 0 6px 24px rgba(0,0,0,.1);
  transition: all .4s cubic-bezier(.34,1.56,.64,1);
  cursor: pointer;
}
.intro-media-side:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 36px rgba(0,0,0,.16);
}
.intro-media-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .65s cubic-bezier(.25,.46,.45,.94);
}
.intro-media-side:hover img { transform: scale(1.07); }
.intro-media-side::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(5,37,20,.45) 0%, transparent 50%);
  pointer-events: none;
}
.intro-media-side-label {
  position: absolute;
  bottom: .6rem;
  left: .6rem;
  z-index: 2;
}
.intro-media-side-tag {
  font-family: 'Inter', sans-serif;
  font-size: .5rem;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(0,0,0,.35);
  backdrop-filter: blur(6px);
  padding: .18rem .45rem;
  border-radius: 99px;
  border: 1px solid rgba(255,255,255,.1);
}
.intro-media-float-badge {
  position: absolute;
  z-index: 10;
  background: #fff;
  border-radius: .85rem;
  padding: .45rem .7rem;
  box-shadow: 0 6px 24px rgba(0,0,0,.13);
  display: flex;
  align-items: center;
  gap: .4rem;
  animation: introFloatBounce 4s ease-in-out infinite;
  border: 1px solid #f1f5f9;
}
.intro-media-float-badge--top { top: -.6rem; right: -.4rem; animation-delay: 0s; }
.intro-media-float-badge--bottom { bottom: -.6rem; left: 1.5rem; animation-delay: 1.5s; }
@keyframes introFloatBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.intro-float-icon {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: .45rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.intro-float-icon--green { background: #ecfdf5; color: #059669; }
.intro-float-icon--amber { background: #fffbeb; color: #d97706; }
.intro-float-text { display: flex; flex-direction: column; gap: .02rem; }
.intro-float-title {
  font-family: 'Inter', sans-serif;
  font-size: .62rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}
.intro-float-sub {
  font-family: 'Inter', sans-serif;
  font-size: .52rem;
  color: #94a3b8;
  line-height: 1.2;
}
.intro-media-grid .intro-media-main {
  animation: introCardEnter .7s cubic-bezier(.34,1.56,.64,1) .2s both;
}
.intro-media-grid .intro-media-side:nth-child(2) {
  animation: introCardEnter .7s cubic-bezier(.34,1.56,.64,1) .4s both;
}
.intro-media-grid .intro-media-side:nth-child(3) {
  animation: introCardEnter .7s cubic-bezier(.34,1.56,.64,1) .55s both;
}
.intro-media-float-badge--top {
  animation: introCardEnter .7s cubic-bezier(.34,1.56,.64,1) .7s both, introFloatBounce 4s ease-in-out .7s infinite;
}
.intro-media-float-badge--bottom {
  animation: introCardEnter .7s cubic-bezier(.34,1.56,.64,1) .85s both, introFloatBounce 4s ease-in-out 2.35s infinite;
}
@keyframes introCardEnter {
  from { opacity: 0; transform: translateY(24px) scale(.93); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (max-width: 1024px) {
  .intro-media-grid { max-width: 440px; height: 340px; }
}
@media (max-width: 900px) {
  .intro-media-grid { max-width: 100%; height: 300px; margin-top: 1.25rem; }
  .intro-media-float-badge { display: none; }
}
@media (max-width: 600px) {
  .intro-media-grid { height: 240px; grid-template-columns: 1.3fr 1fr; gap: .4rem; }
  .intro-media-main-title { font-size: .85rem; }
  .intro-media-play-ring { width: 2.5rem; height: 2.5rem; }
  .intro-media-main-label { padding: .75rem; }
  .intro-media-side-tag { font-size: .45rem; }
}

/* ── Scroll row ── */
.mixed-scroll-row{display:flex;gap:1.25rem;overflow-x:auto;padding-bottom:1rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.mixed-scroll-row::-webkit-scrollbar{display:none;}
.mixed-scroll-row>*{scroll-snap-align:start;flex-shrink:0;}

/* ── Scroll nav ── */
.scroll-nav-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border:1.5px solid rgba(16,185,129,.2);box-shadow:0 4px 16px rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#059669;transition:all .25s cubic-bezier(.34,1.56,.64,1);}
.scroll-nav-btn:hover{background:#059669;color:#fff;border-color:#059669;box-shadow:0 6px 20px rgba(5,150,105,.3);transform:translateY(-50%) scale(1.08);}
.scroll-nav-btn:disabled{opacity:.3;cursor:not-allowed;transform:translateY(-50%) scale(1);}
.scroll-nav-btn--left{left:-1rem;}.scroll-nav-btn--right{right:-1rem;}

/* ── Package card ── */
.hpkg-card{width:280px;border-radius:1.25rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;box-shadow:0 2px 10px rgba(0,0,0,.05);display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease,border-color .25s ease;cursor:pointer;text-decoration:none;color:inherit;position:relative;}
.hpkg-card:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 20px 48px rgba(0,0,0,.12),0 4px 14px rgba(5,150,105,.08);border-color:rgba(16,185,129,.25);}
.hpkg-card:hover .hpkg-img{transform:scale(1.06);}
.hpkg-img-wrap{position:relative;height:170px;overflow:hidden;background:#e2e8f0;}
.hpkg-img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.25,.46,.45,.94);}
.hpkg-img-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 55%);pointer-events:none;}
.hpkg-body{padding:1rem;display:flex;flex-direction:column;flex:1;gap:.4rem;}
.hpkg-category{font-size:.55rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#059669;font-family:'Inter',sans-serif;}
.hpkg-title{font-size:.92rem;font-weight:700;color:#1e293b;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s;font-family:'Inter',sans-serif;}
.hpkg-card:hover .hpkg-title{color:#059669;}
.hpkg-meta{display:flex;flex-wrap:wrap;gap:.5rem;font-size:.68rem;color:#94a3b8;font-family:'Inter',sans-serif;}
.hpkg-meta-item{display:flex;align-items:center;gap:.2rem;}
.hpkg-desc{font-size:.75rem;color:#64748b;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;font-family:'Inter',sans-serif;}
.hpkg-footer{display:flex;align-items:flex-end;justify-content:space-between;margin-top:.4rem;padding-top:.6rem;border-top:1px solid #f1f5f9;gap:.4rem;}
.hpkg-price{font-size:1.2rem;font-weight:900;line-height:1;color:#059669;font-family:'Inter',sans-serif;}
.hpkg-price-label{font-size:.6rem;color:#94a3b8;margin-top:.15rem;font-family:'Inter',sans-serif;}
.hpkg-cta{display:inline-flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:700;color:#fff;padding:.45rem .85rem;border-radius:.65rem;background:linear-gradient(135deg,#059669,#047857);box-shadow:0 3px 12px rgba(5,150,105,.25);transition:all .25s ease;white-space:nowrap;flex-shrink:0;font-family:'Inter',sans-serif;}
.hpkg-card:hover .hpkg-cta{box-shadow:0 6px 18px rgba(5,150,105,.4);transform:scale(1.03);}
.hpkg-badge{position:absolute;top:.6rem;left:.6rem;font-size:.55rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;padding:.25rem .55rem;border-radius:99px;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.18);font-family:'Inter',sans-serif;}
.hpkg-discount{position:absolute;top:.6rem;right:.6rem;font-size:.55rem;font-weight:900;background:#ef4444;color:#fff;padding:.2rem .45rem;border-radius:99px;font-family:'Inter',sans-serif;}
.hpkg-duration-pill{position:absolute;bottom:.6rem;right:.6rem;font-size:.6rem;font-weight:700;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);color:#fff;padding:.25rem .55rem;border-radius:99px;display:flex;align-items:center;gap:.25rem;border:1px solid rgba(255,255,255,.1);font-family:'Inter',sans-serif;}
.hpkg-wish{position:absolute;top:.6rem;right:.6rem;width:1.8rem;height:1.8rem;border-radius:50%;background:rgba(255,255,255,.9);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.1);cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s;}
.hpkg-wish:hover{transform:scale(1.15);background:#fff;}

/* ── Post card ── */
.hpost-card{width:260px;border-radius:1.25rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;box-shadow:0 2px 10px rgba(0,0,0,.05);display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease,border-color .25s ease;cursor:pointer;text-decoration:none;color:inherit;}
.hpost-card:hover{transform:translateY(-5px) scale(1.01);box-shadow:0 16px 40px rgba(0,0,0,.1);border-color:rgba(16,185,129,.2);}
.hpost-card:hover .hpost-img{transform:scale(1.06);}
.hpost-img-wrap{position:relative;height:150px;overflow:hidden;background:#e2e8f0;flex-shrink:0;}
.hpost-img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.25,.46,.45,.94);}
.hpost-category{position:absolute;top:.6rem;left:.6rem;font-size:.55rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);color:#fff;padding:.25rem .55rem;border-radius:99px;border:1px solid rgba(255,255,255,.12);font-family:'Inter',sans-serif;}
.hpost-body{padding:.85rem 1rem;display:flex;flex-direction:column;gap:.35rem;flex:1;}
.hpost-meta{display:flex;align-items:center;gap:.4rem;font-size:.62rem;color:#94a3b8;flex-wrap:wrap;font-family:'Inter',sans-serif;}
.hpost-title{font-size:.88rem;font-weight:700;color:#1e293b;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s;font-family:'Inter',sans-serif;}
.hpost-card:hover .hpost-title{color:#059669;}
.hpost-excerpt{font-size:.72rem;color:#64748b;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;font-family:'Inter',sans-serif;}
.hpost-readmore{display:inline-flex;align-items:center;gap:.25rem;font-size:.7rem;font-weight:700;color:#059669;margin-top:.2rem;transition:gap .2s;font-family:'Inter',sans-serif;}
.hpost-card:hover .hpost-readmore{gap:.5rem;}

/* ── Skeletons ── */
.hpkg-skeleton{width:280px;border-radius:1.25rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;flex-shrink:0;animation:hSkelPulse 1.6s ease-in-out infinite;}
.hpost-skeleton{width:260px;border-radius:1.25rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;flex-shrink:0;animation:hSkelPulse 1.6s ease-in-out infinite;}
@keyframes hSkelPulse{0%,100%{opacity:1}50%{opacity:.5}}
.h-skel{background:#e2e8f0;border-radius:.4rem;}
.mixed-card-reveal{animation:mixedReveal .5s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes mixedReveal{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.scroll-progress-bar{height:2.5px;border-radius:99px;background:#e2e8f0;overflow:hidden;margin-top:.75rem;}
.scroll-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#059669,#34d399);transition:width .2s ease;}

/* ══════════════════════════════════════════
   DESTINATION SLIDESHOW
══════════════════════════════════════════ */
.dest-slideshow-wrap{position:relative;width:100%;overflow:hidden;}
.dest-slideshow-track{display:flex;transition:transform .55s cubic-bezier(.77,0,.175,1);}
.dest-slide-card{flex-shrink:0;position:relative;border-radius:1.5rem;overflow:hidden;cursor:pointer;background:#0f1b0f;box-shadow:0 6px 28px rgba(0,0,0,.1);transition:box-shadow .35s ease;}
.dest-slide-card:hover{box-shadow:0 16px 48px rgba(0,0,0,.18);}
.dest-slide-img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.25,.46,.45,.94);display:block;}
.dest-slide-card:hover .dest-slide-img{transform:scale(1.05);}
.dest-slide-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,37,20,.85) 0%,rgba(5,37,20,.25) 50%,transparent 100%);pointer-events:none;}
.dest-slide-content{position:absolute;bottom:0;left:0;right:0;padding:clamp(1rem,2.5vw,1.5rem);z-index:2;}
.dest-slide-tag{display:inline-block;font-family:'Inter',sans-serif;font-size:.55rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#86efac;margin-bottom:.4rem;}
.dest-slide-name{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.2rem,2.4vw,1.7rem);font-weight:700;color:#fff;line-height:1.15;margin-bottom:.3rem;}
.dest-slide-country{display:flex;align-items:center;gap:.25rem;font-family:'Inter',sans-serif;font-size:.72rem;font-weight:500;color:rgba(255,255,255,.65);margin-bottom:.7rem;}
.dest-slide-cta{display:inline-flex;align-items:center;gap:.35rem;font-family:'Inter',sans-serif;font-size:.72rem;font-weight:700;color:#fff;padding:.4rem .9rem;border-radius:99px;background:rgba(255,255,255,.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.2);transition:all .25s ease;cursor:pointer;}
.dest-slide-cta:hover{background:rgba(255,255,255,.22);}
.dest-slide-num{position:absolute;top:.9rem;right:.9rem;font-family:'Inter',sans-serif;font-size:.6rem;font-weight:900;letter-spacing:.08em;color:rgba(255,255,255,.45);background:rgba(0,0,0,.25);backdrop-filter:blur(6px);padding:.2rem .5rem;border-radius:99px;border:1px solid rgba(255,255,255,.1);}
.dest-arr{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:2.75rem;height:2.75rem;border-radius:50%;border:none;cursor:pointer;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;color:#15803d;box-shadow:0 4px 16px rgba(0,0,0,.12);transition:all .25s cubic-bezier(.34,1.56,.64,1);}
.dest-arr:hover{background:#15803d;color:#fff;transform:translateY(-50%) scale(1.08);box-shadow:0 6px 24px rgba(21,128,61,.35);}
.dest-arr--left{left:.75rem;}.dest-arr--right{right:.75rem;}
.dest-dots{display:flex;justify-content:center;gap:.45rem;margin-top:1.25rem;}
.dest-dot{height:.4rem;border-radius:99px;border:none;cursor:pointer;background:#d0e3d0;transition:all .3s ease;padding:0;}
.dest-dot.active{background:#15803d;width:1.5rem;}
.dest-dot:not(.active){width:.4rem;}
.dest-dot:not(.active):hover{background:#86efac;}

/* Dest modal */
.dest-modal-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(5,37,20,.55);backdrop-filter:blur(12px);}
.dest-modal-card{position:relative;width:100%;max-width:520px;max-height:88vh;border-radius:1.75rem;overflow:hidden;background:#fff;box-shadow:0 36px 90px rgba(0,0,0,.28);display:flex;flex-direction:column;}
.dest-modal-close{position:absolute;top:.85rem;right:.85rem;z-index:10;width:2.25rem;height:2.25rem;border-radius:50%;border:none;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#334155;box-shadow:0 2px 10px rgba(0,0,0,.12);transition:all .2s;}
.dest-modal-close:hover{background:#fff;transform:scale(1.08);}
.dest-modal-image-section{position:relative;height:230px;flex-shrink:0;}
.dest-modal-image{width:100%;height:100%;object-fit:cover;}
.dest-modal-image-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,37,20,.7) 0%,transparent 50%);}
.dest-modal-image-placeholder{width:100%;height:100%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:#94a3b8;}
.dest-modal-image-badges{position:absolute;top:.85rem;left:.85rem;display:flex;gap:.4rem;flex-wrap:wrap;}
.dest-modal-badge{font-family:'Inter',sans-serif;font-size:.55rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:.25rem .6rem;border-radius:99px;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);color:#fff;border:1px solid rgba(255,255,255,.12);}
.dest-modal-badge--price{background:rgba(21,128,61,.75);}
.dest-modal-wishlist{position:absolute;top:.85rem;right:3.25rem;width:2rem;height:2rem;border-radius:50%;border:none;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;color:#64748b;transition:all .2s;}
.dest-modal-wishlist.active{color:#ef4444;}
.dest-modal-wishlist:hover{transform:scale(1.1);}
.dest-modal-image-content{position:absolute;bottom:0;left:0;right:0;padding:1rem 1.25rem;}
.dest-modal-name{font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;font-weight:700;color:#fff;margin-bottom:.2rem;line-height:1.15;}
.dest-modal-location{display:flex;align-items:center;gap:.25rem;font-family:'Inter',sans-serif;font-size:.75rem;color:rgba(255,255,255,.7);}
.dest-modal-body{padding:1.25rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:.85rem;}
.dest-modal-rating{display:flex;align-items:center;gap:.25rem;}
.dest-modal-star{color:#d1d5db;font-size:.8rem;}
.dest-modal-star.filled{color:#f59e0b;}
.dest-modal-rating-text{font-family:'Inter',sans-serif;font-size:.75rem;font-weight:700;color:#475569;margin-left:.2rem;}
.dest-modal-duration{display:flex;align-items:center;gap:.35rem;font-family:'Inter',sans-serif;font-size:.78rem;color:#64748b;}
.dest-modal-description{font-family:'Inter',sans-serif;font-size:.82rem;color:#475569;line-height:1.65;}
.dest-modal-highlights h4{font-family:'Inter',sans-serif;font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#15803d;margin-bottom:.5rem;}
.dest-modal-highlights ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.35rem;}
.dest-modal-highlights li{display:flex;align-items:center;gap:.45rem;font-family:'Inter',sans-serif;font-size:.78rem;color:#475569;}
.dest-modal-highlight-dot{width:.35rem;height:.35rem;border-radius:50%;background:#15803d;flex-shrink:0;}
.dest-modal-actions{margin-top:.35rem;}
.dest-modal-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.8rem 1.25rem;border:none;border-radius:.85rem;background:linear-gradient(135deg,#15803d,#059669);color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .25s ease;box-shadow:0 4px 14px rgba(21,128,61,.25);}
.dest-modal-cta:hover{box-shadow:0 6px 22px rgba(21,128,61,.4);transform:translateY(-1px);}
.dest-modal-glow{position:absolute;bottom:-3rem;right:-3rem;width:10rem;height:10rem;border-radius:50%;background:radial-gradient(circle,rgba(21,128,61,.06) 0%,transparent 70%);pointer-events:none;}

/* ══════════════════════════════════════════
   WHY ALTUVERA
══════════════════════════════════════════ */
.why-section{padding:clamp(1.5rem,3vw,2.5rem) 0;background:#f0fdf4;}
.why-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;}
.why-card{background:#fff;border-radius:1.5rem;overflow:hidden;border:1px solid #d1fae5;box-shadow:0 3px 16px rgba(5,150,105,.05);display:flex;flex-direction:column;transition:all .4s cubic-bezier(.4,0,.2,1);position:relative;text-decoration:none;color:inherit;}
.why-card:hover{transform:translateY(-8px);box-shadow:0 20px 44px -8px rgba(16,185,129,.2);border-color:#a7f3d0;}
.why-card-img-wrap{position:relative;height:175px;overflow:hidden;background:linear-gradient(135deg,#059669,#047857);}
.why-card-img-wrap::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent,rgba(16,185,129,.12));opacity:0;transition:opacity .3s;}
.why-card:hover .why-card-img-wrap::after{opacity:1;}
.why-card-img{width:100%;height:100%;object-fit:cover;transition:transform .55s cubic-bezier(.4,0,.2,1);display:block;}
.why-card:hover .why-card-img{transform:scale(1.05);}
.why-card-icon-wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#059669,#047857);position:relative;}
.why-card-icon-wrap::before{content:'';position:absolute;top:-40%;right:-40%;width:80%;height:80%;background:rgba(255,255,255,.1);border-radius:50%;filter:blur(20px);}
.why-card-icon{color:rgba(255,255,255,.92);filter:drop-shadow(0 3px 12px rgba(0,0,0,.15));transition:transform .3s ease;position:relative;z-index:1;}
.why-card:hover .why-card-icon{transform:scale(1.08);}
.why-card-eco-badge{position:absolute;top:.85rem;right:.85rem;background:rgba(255,255,255,.92);color:#059669;font-size:.58rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:.25rem .6rem;border-radius:99px;display:flex;align-items:center;gap:.25rem;box-shadow:0 2px 8px rgba(0,0,0,.08);font-family:'Inter',sans-serif;z-index:2;}
.why-card-body{padding:1.25rem;display:flex;flex-direction:column;flex:1;gap:.6rem;}
.why-card-title{font-family:'Playfair Display',Georgia,serif;font-size:1.05rem;font-weight:700;color:#064e3b;line-height:1.3;margin:0;}
.why-card-desc{font-family:'Inter',sans-serif;font-size:.8rem;color:#4b5563;line-height:1.65;margin:0;flex:1;}
.why-card-tags{display:flex;flex-wrap:wrap;gap:.35rem;}
.why-card-tag{font-family:'Inter',sans-serif;font-size:.62rem;font-weight:600;padding:.2rem .55rem;border-radius:99px;background:#ecfdf5;color:#059669;border:1px solid #d1fae5;transition:all .2s ease;}
.why-card-tag:hover{background:#d1fae5;color:#047857;}
.why-card-footer{padding:.85rem 1.25rem;background:#f0fdf4;border-top:1px solid #d1fae5;display:flex;align-items:center;justify-content:space-between;font-family:'Inter',sans-serif;}
.why-card-footer-left{display:flex;align-items:center;gap:.4rem;font-size:.68rem;color:#059669;}
.why-card-footer-avatar{width:1.35rem;height:1.35rem;border-radius:50%;background:linear-gradient(135deg,#059669,#047857);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.58rem;font-weight:800;}
.why-card-cta{display:flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:700;color:#fff;background:#059669;border:none;border-radius:.55rem;padding:.4rem .85rem;cursor:pointer;transition:all .25s ease;text-decoration:none;}
.why-card-cta:hover{background:#047857;transform:translateY(-1px);box-shadow:0 3px 12px rgba(5,150,105,.3);}

/* ── Feature blocks ── */
.feature-block{display:grid;grid-template-columns:1fr 1fr;gap:clamp(1.5rem,4vw,3.5rem);align-items:center;padding:clamp(1.5rem,3vw,2.5rem) 0;}
.feature-block--reverse{direction:rtl;}.feature-block--reverse>*{direction:ltr;}
.feature-block-media{position:relative;}
.feature-block-img-wrap{border-radius:1.5rem;overflow:hidden;aspect-ratio:4/3;position:relative;box-shadow:0 10px 32px rgba(0,0,0,.08);}
.feature-block-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .7s ease,transform .7s ease;transform:scale(1.03);}
.feature-block-img--active{opacity:1;transform:scale(1);}
.feature-block-img--exiting{opacity:0;transform:scale(.97);}
.feature-block-img-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(5,46,22,.1) 0%,transparent 55%);pointer-events:none;}
.feature-block-dots{display:flex;justify-content:center;gap:.4rem;margin-top:.75rem;}
.feature-block-dot{width:.45rem;height:.45rem;border-radius:50%;border:none;cursor:pointer;background:#d0e3d0;transition:all .3s ease;padding:0;}
.feature-block-dot.active{background:#15803d;transform:scale(1.25);}
.feature-block-body{display:flex;flex-direction:column;justify-content:center;}
.feature-block-body-inner{max-width:440px;}
.feature-block-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.35rem,2.4vw,1.85rem);font-weight:700;color:#14532d;line-height:1.2;margin-bottom:.85rem;}
.feature-block-divider{width:3rem;height:.18rem;background:linear-gradient(90deg,#15803d,#22c55e);border-radius:99px;margin-bottom:1rem;}
.feature-block-desc{font-family:'Inter',sans-serif;font-size:clamp(.82rem,1.1vw,.92rem);color:#5A7A5A;line-height:1.7;margin-bottom:1rem;}
.feature-block-bullets{list-style:none;padding:0;margin:0 0 1.25rem;display:flex;flex-direction:column;gap:.55rem;}
.feature-block-bullets li{display:flex;align-items:center;gap:.55rem;font-family:'Inter',sans-serif;font-size:.82rem;color:#3F5C3F;font-weight:500;}
.feature-block-bullet-mark{width:.4rem;height:.4rem;border-radius:50%;background:#15803d;flex-shrink:0;}
.feature-block-cta{display:inline-flex;align-items:center;gap:.4rem;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:700;color:#fff;padding:.65rem 1.35rem;border-radius:99px;background:linear-gradient(135deg,#15803d,#059669);text-decoration:none;box-shadow:0 3px 12px rgba(21,128,61,.25);transition:all .25s ease;width:fit-content;}
.feature-block-cta:hover{box-shadow:0 6px 22px rgba(21,128,61,.4);transform:translateY(-1px);}
@media(max-width:900px){
  .feature-block{grid-template-columns:1fr;}
  .feature-block--reverse{direction:ltr;}
  .why-grid{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:600px){
  .why-grid{grid-template-columns:1fr;}
}

/* Video modal */
.vmodal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:1rem;}
.vmodal-container{position:relative;width:100%;max-width:860px;background:#0a0a0a;border-radius:1.25rem;overflow:hidden;box-shadow:0 36px 90px rgba(0,0,0,.5);}
.vmodal-close{position:absolute;top:.65rem;right:.65rem;z-index:20;width:2.25rem;height:2.25rem;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);backdrop-filter:blur(8px);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.vmodal-close:hover{background:rgba(255,255,255,.14);transform:scale(1.08);}
.vmodal-video-area{position:relative;width:100%;aspect-ratio:16/9;background:#000;}
.vmodal-yt-player{width:100%;height:100%;}
.vmodal-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.85rem;color:rgba(255,255,255,.65);font-family:'Inter',sans-serif;font-size:.8rem;}
.vmodal-loading-spinner{width:2.25rem;height:2.25rem;border:2.5px solid rgba(255,255,255,.08);border-top-color:#16a34a;border-radius:50%;animation:vSpin .8s linear infinite;}
@keyframes vSpin{to{transform:rotate(360deg)}}
.vmodal-error-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.65rem;color:#fff;font-family:'Inter',sans-serif;}
.vmodal-error-title{font-size:.92rem;font-weight:700;}
.vmodal-error-actions{display:flex;gap:.65rem;}
.vmodal-error-retry,.vmodal-error-skip{display:flex;align-items:center;gap:.3rem;padding:.45rem 1rem;border-radius:.65rem;border:none;font-family:'Inter',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;}
.vmodal-error-retry{background:#16a34a;color:#fff;}
.vmodal-error-skip{background:rgba(255,255,255,.08);color:#fff;}
.vmodal-controls{padding:.7rem 1.1rem;background:#111;}
.vmodal-controls-row{display:flex;align-items:center;gap:.65rem;}
.vmodal-controls-left{display:flex;align-items:center;gap:.3rem;}
.vmodal-btn{width:2rem;height:2rem;border-radius:50%;border:none;background:rgba(255,255,255,.07);color:rgba(255,255,255,.75);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.vmodal-btn:hover,.vmodal-btn.active{background:#16a34a;color:#fff;}
.vmodal-btn--play{width:2.5rem;height:2.5rem;background:#16a34a;color:#fff;}
.vmodal-track-info{flex:1;display:flex;flex-direction:column;gap:.05rem;overflow:hidden;}
.vmodal-track-title{font-family:'Inter',sans-serif;font-size:.78rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.vmodal-track-sub{font-family:'Inter',sans-serif;font-size:.65rem;color:rgba(255,255,255,.45);}
.vmodal-playlist{background:#0d0d0d;border-top:1px solid rgba(255,255,255,.05);max-height:200px;overflow-y:auto;}
.vmodal-playlist-header{display:flex;align-items:center;gap:.4rem;padding:.65rem 1.1rem;font-family:'Inter',sans-serif;font-size:.7rem;font-weight:700;color:rgba(255,255,255,.45);border-bottom:1px solid rgba(255,255,255,.05);}
.vmodal-playlist-item{width:100%;display:flex;align-items:center;gap:.65rem;padding:.55rem 1.1rem;border:none;background:none;cursor:pointer;transition:background .2s;}
.vmodal-playlist-item:hover,.vmodal-playlist-item.active{background:rgba(22,163,74,.08);}
.vmodal-playlist-thumb{width:2.75rem;height:2.75rem;border-radius:.4rem;overflow:hidden;position:relative;flex-shrink:0;}
.vmodal-playlist-thumb img{width:100%;height:100%;object-fit:cover;}
.vmodal-playlist-playing{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;gap:2px;}
.vmodal-playlist-playing span{width:2.5px;height:10px;background:#22c55e;border-radius:2px;animation:vBars .8s ease-in-out infinite alternate;}
.vmodal-playlist-playing span:nth-child(2){animation-delay:.2s;}
.vmodal-playlist-playing span:nth-child(3){animation-delay:.4s;}
@keyframes vBars{from{transform:scaleY(.4)}to{transform:scaleY(1)}}
.vmodal-playlist-meta{flex:1;text-align:left;}
.vmodal-playlist-name{font-family:'Inter',sans-serif;font-size:.72rem;font-weight:600;color:#fff;display:block;}
.vmodal-playlist-desc{font-family:'Inter',sans-serif;font-size:.62rem;color:rgba(255,255,255,.4);display:block;margin-top:.05rem;}
.vmodal-playlist-num{font-family:'Inter',sans-serif;font-size:.6rem;color:rgba(255,255,255,.25);font-weight:700;}

/* ── CTA row ── */
.section-link-row{display:flex;gap:.45rem;flex-wrap:wrap;}
.section-link-pill{font-family:'Inter',sans-serif;font-size:.72rem;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:.25rem;padding:.35rem .75rem;border-radius:99px;transition:all .2s ease;}
.section-link-pill--green{color:#15803d;border:1.5px solid rgba(21,128,61,.2);background:rgba(21,128,61,.04);}
.section-link-pill--green:hover{background:rgba(21,128,61,.1);border-color:rgba(21,128,61,.35);}
.section-link-pill--indigo{color:#6366f1;border:1.5px solid rgba(99,102,241,.18);background:rgba(99,102,241,.03);}
.section-link-pill--indigo:hover{background:rgba(99,102,241,.08);border-color:rgba(99,102,241,.3);}
`;

let homeStylesInjected = false;
function injectHomeStyles() {
  if (homeStylesInjected || typeof document === "undefined") return;
  if (document.getElementById("home-styles-v2")) { homeStylesInjected = true; return; }
  const s = document.createElement("style");
  s.id = "home-styles-v2";
  s.textContent = HOME_STYLES;
  document.head.appendChild(s);
  homeStylesInjected = true;
}

/* ═══════════════════════════════════════════
   VIDEO DATA
═══════════════════════════════════════════ */
const VIDEO_PLAYLIST = [
  { id: 1, title: "Serengeti Great Migration", subtitle: "Tanzania's endless plains", videoId: "jIwyy2D5iag", poster: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "Mountain Gorillas of Rwanda", subtitle: "Volcanoes National Park", videoId: "b1V4pzuncg", poster: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "Zanzibar Paradise", subtitle: "Indian Ocean coastline", videoId: "DZnw2TeLuEU", poster: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80" },
  { id: 4, title: "Masai Mara Sunset", subtitle: "Kenya's golden hour", videoId: "--rk-kMATUc", poster: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
];

const INTRO_SIDE_IMAGES = [
  { src: "https://i.pinimg.com/736x/aa/c0/4c/aac04c789034e5993003ddc53818a06d.jpg", alt: "East African Culture", tag: "Culture" },
  { src: "https://i.pinimg.com/1200x/8f/f4/63/8ff463499be98f73c3c9626985e674ee.jpg", alt: "Safari Landscape", tag: "Safari" },
];

/* ═══════════════════════════════════════════
   WHY ALTUVERA DATA
═══════════════════════════════════════════ */
const WHY_CARDS = [
  { id: 1, title: "Expert Local Guides", description: "Our guides are born and raised in the regions they lead. Decades of field experience turn every game drive into a master class.", tags: ["Certified", "Multilingual", "Wildlife Experts"], badge: "Top Rated", badgeIcon: "⭐", image: "https://i.pinimg.com/236x/14/f8/7f/14f87f11922888cf40a8ca405d731246.jpg", footer: "Guided by Altuvera Pros", link: "/team", ctaLabel: "Meet the Team", iconType: "compass" },
  { id: 2, title: "Sustainable Safari Practices", description: "Every journey actively protects the ecosystems you visit. Carbon offset programs and direct community investment.", tags: ["Eco-Certified", "Carbon Offset", "Community Impact"], badge: "Eco", badgeIcon: "🌿", image: "", footer: "Conservation First", link: "/about#mission", ctaLabel: "Our Mission", iconType: "leaf" },
  { id: 3, title: "Fully Tailored Itineraries", description: "No two travelers are alike. We craft each journey from scratch to match your exact vision and travel style.", tags: ["Bespoke", "Flexible", "Curated"], badge: "Custom", badgeIcon: "✦", image: "https://i.pinimg.com/1200x/8f/9d/e8/8f9de8dad8e26fc74268e13f37149f92.jpg", footer: "Your Journey, Your Rules", link: "/packages", ctaLabel: "View Packages", iconType: "map" },
  { id: 4, title: "Authentic Cultural Immersion", description: "Beyond wildlife — share meals with Maasai elders, visit gorilla conservation projects, witness living traditions.", tags: ["Cultural", "Authentic", "Immersive"], badge: "Unique", badgeIcon: "🏛", image: "https://i.pinimg.com/736x/e1/5b/9e/e15b9ef8fe7dfae13d170068d8d3008e.jpg", footer: "Real Connections", link: "/destinations", ctaLabel: "Explore", iconType: "heart" },
  { id: 5, title: "Seamless End-to-End Service", description: "From first enquiry to final transfer. 24/7 in-country support means no detail goes unmanaged.", tags: ["24/7 Support", "Logistics", "Hassle-Free"], badge: "Premium", badgeIcon: "💎", image: "https://i.pinimg.com/1200x/19/8d/ab/198dab499b95cff53e2a48a8ba02c673.jpg", footer: "Always by Your Side", link: "/contact", ctaLabel: "Contact Us", iconType: "shield" },
  { id: 6, title: "Award-Winning Experiences", description: "Recognised for excellence in responsible tourism. Our track record speaks through the stories our guests share.", tags: ["Award-Winning", "5-Star Rated", "Trusted"], badge: "Best in Class", badgeIcon: "🏆", image: "https://i.pinimg.com/736x/08/73/a9/0873a9c33c198ea63293106972294bf0.jpg", footer: "Recognised Excellence", link: "/about", ctaLabel: "Learn More", iconType: "star" },
];

const WhyCardIcon = ({ type, size = 48 }) => {
  const icons = {
    compass: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>),
    leaf: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>),
    map: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>),
    heart: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
    shield: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>),
    star: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  };
  return icons[type] || icons.compass;
};

/* ═══════════════════════════════════════════
   VIDEO PLAYER MODAL
═══════════════════════════════════════════ */
const VideoPlayerModal = ({ isOpen, onClose, playlist, startIndex = 0 }) => {
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => { setCurrentIdx(startIndex); setVideoError(false); setIsReady(false); }, [startIndex]);
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", h); };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !window.YT) return;
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
    setIsReady(false); setVideoError(false);
    const hsc = (e) => {
      if (e.data === window.YT.PlayerState.ENDED) setCurrentIdx((p) => (p + 1) % playlist.length);
      if (e.data === window.YT.PlayerState.PLAYING) setVideoError(false);
    };
    const init = () => {
      if (!containerRef.current) return;
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: "100%", width: "100%", videoId: playlist[currentIdx]?.videoId,
          playerVars: { autoplay: 1, modestbranding: 1, rel: 0, fs: 1, enablejsapi: 1 },
          events: { onReady: () => setIsReady(true), onStateChange: hsc, onError: () => setVideoError(true) },
        });
      } catch { setVideoError(true); }
    };
    const t = setTimeout(init, 300);
    return () => { clearTimeout(t); if (playerRef.current) { try { playerRef.current.destroy(); } catch {} playerRef.current = null; } };
  }, [isOpen, currentIdx, playlist]);

  const playNext = useCallback(() => setCurrentIdx((p) => (p + 1) % playlist.length), [playlist.length]);
  const playPrev = useCallback(() => setCurrentIdx((p) => (p - 1 + playlist.length) % playlist.length), [playlist.length]);

  if (!isOpen) return null;
  const current = playlist[currentIdx];

  return (
    <div className="vmodal-overlay" onClick={onClose}>
      <div className="vmodal-container" onClick={(e) => e.stopPropagation()}>
        <button className="vmodal-close" onClick={onClose}><MdClose size={20} /></button>
        <div className="vmodal-video-area">
          {videoError ? (
            <div className="vmodal-error-state">
              <h3 className="vmodal-error-title">Unable to Play Video</h3>
              <div className="vmodal-error-actions">
                <button className="vmodal-error-retry" onClick={() => setVideoError(false)}><MdPlayArrow size={16} /> Retry</button>
                {playlist.length > 1 && <button className="vmodal-error-skip" onClick={playNext}><MdSkipNext size={16} /> Next</button>}
              </div>
            </div>
          ) : (<div ref={containerRef} className="vmodal-yt-player" />)}
          {!videoError && !isReady && (<div className="vmodal-loading"><div className="vmodal-loading-spinner" /><p>Loading…</p></div>)}
        </div>
        <div className="vmodal-controls">
          <div className="vmodal-controls-row">
            <div className="vmodal-controls-left">
              <button className="vmodal-btn" onClick={playPrev}><MdSkipPrevious size={20} /></button>
              <button className="vmodal-btn vmodal-btn--play" onClick={() => {
                if (!playerRef.current || !window.YT) return;
                const s = playerRef.current.getPlayerState();
                s === window.YT.PlayerState.PLAYING ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
              }}><MdPlayArrow size={20} /></button>
              <button className="vmodal-btn" onClick={playNext}><MdSkipNext size={20} /></button>
            </div>
            <div className="vmodal-track-info">
              <span className="vmodal-track-title">{current.title}</span>
              <span className="vmodal-track-sub">{current.subtitle}</span>
            </div>
            <button className={`vmodal-btn ${showPlaylist ? "active" : ""}`} onClick={() => setShowPlaylist((p) => !p)}><MdPlaylistPlay size={20} /></button>
          </div>
        </div>
        {showPlaylist && (
          <div className="vmodal-playlist">
            <div className="vmodal-playlist-header"><MdPlaylistPlay size={16} /><span>Playlist ({playlist.length})</span></div>
            {playlist.map((item, i) => (
              <button key={item.id} className={`vmodal-playlist-item ${i === currentIdx ? "active" : ""}`} onClick={() => { setCurrentIdx(i); setVideoError(false); }}>
                <div className="vmodal-playlist-thumb">
                  <img src={item.poster} alt={item.title} />
                  {i === currentIdx && isReady && (<div className="vmodal-playlist-playing"><span /><span /><span /></div>)}
                </div>
                <div className="vmodal-playlist-meta"><span className="vmodal-playlist-name">{item.title}</span><span className="vmodal-playlist-desc">{item.subtitle}</span></div>
                <span className="vmodal-playlist-num">{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   INLINE VIDEO PLAYER
═══════════════════════════════════════════ */
const InlineVideoPlayer = ({ playlist, startIndex = 0 }) => {
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  const [isReady, setIsReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => { setCurrentIdx(startIndex); }, [startIndex]);
  useEffect(() => {
    setIsReady(false); setVideoError(false);
    const destroy = () => { if (playerRef.current) { try { playerRef.current.destroy(); } catch {} playerRef.current = null; } };
    const init = () => {
      if (!containerRef.current || !window.YT) return;
      destroy();
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: "100%", width: "100%", videoId: playlist[currentIdx]?.videoId,
          playerVars: { autoplay: 1, mute: 1, modestbranding: 1, rel: 0, fs: 0, enablejsapi: 1, playsinline: 1, iv_load_policy: 3, cc_load_policy: 0, controls: 0, showinfo: 0 },
          events: {
            onReady: () => setIsReady(true),
            onStateChange: (e) => { if (e.data === window.YT.PlayerState.ENDED) setCurrentIdx((p) => (p + 1) % playlist.length); },
            onError: () => setVideoError(true),
          },
        });
      } catch { setVideoError(true); }
    };
    let tid;
    if (window.YT) { tid = setTimeout(init, 300); }
    else if (window._ytApiReadyCb) { window._ytApiReadyCb.push(() => { tid = setTimeout(init, 300); }); }
    return () => { clearTimeout(tid); destroy(); };
  }, [currentIdx, playlist]);

  const current = playlist[currentIdx];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {(!isReady || videoError) && (
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src={current?.poster} alt={current?.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 1 }} />
    </div>
  );
};

/* ═══════════════════════════════════════════
   INTRO MEDIA PANEL
═══════════════════════════════════════════ */
const IntroMediaPanel = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoStartIdx, setVideoStartIdx] = useState(0);
  const fv = VIDEO_PLAYLIST[0];

  const openVideo = useCallback((idx = 0) => { setVideoStartIdx(idx); setVideoModalOpen(true); }, []);

  return (
    <>
      <div className="intro-media-grid">
        <div className="intro-media-float-badge intro-media-float-badge--top">
          <div className="intro-float-icon intro-float-icon--green">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div className="intro-float-text"><span className="intro-float-title">100% Trusted</span><span className="intro-float-sub">Verified local partners</span></div>
        </div>
        <div className="intro-media-float-badge intro-media-float-badge--bottom">
          <div className="intro-float-icon intro-float-icon--amber">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div className="intro-float-text"><span className="intro-float-title">4.9★ Rated</span><span className="intro-float-sub">500+ happy travellers</span></div>
        </div>
        <div className="intro-media-main" onClick={() => openVideo(0)}>
          <InlineVideoPlayer playlist={VIDEO_PLAYLIST} startIndex={0} />
          <div className="intro-media-main-glow" />
          <div className="intro-media-play-ring"><MdPlayArrow size={20} /></div>
          <div className="intro-media-main-label">
            <span className="intro-media-main-badge">▶ Watch Reel</span>
            <h3 className="intro-media-main-title">{fv?.title}</h3>
            <p className="intro-media-main-sub">{fv?.subtitle}</p>
          </div>
        </div>
        {INTRO_SIDE_IMAGES.map((img, i) => (
          <div key={i} className="intro-media-side">
            <img src={img.src} alt={img.alt} loading="lazy" />
            <div className="intro-media-side-label"><span className="intro-media-side-tag">{img.tag}</span></div>
          </div>
        ))}
      </div>
      <VideoPlayerModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} playlist={VIDEO_PLAYLIST} startIndex={videoStartIdx} />
    </>
  );
};

/* ═══════════════════════════════════════════
   DESTINATION MODAL
═══════════════════════════════════════════ */
const DestinationModal = ({ destination, isOpen, onClose, isWishlisted, onWishlistToggle }) => {
  const navigate = useNavigate();
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);
  useEffect(() => { const h = (e) => { if (e.key === "Escape") onClose(); }; if (isOpen) window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [isOpen, onClose]);
  if (!isOpen || !destination) return null;
  const name = destination?.name || destination?.title || "Destination";
  const country = (typeof destination?.country === "object" && destination.country?.name) || destination?.countryObj?.name || (typeof destination?.country === "string" ? destination.country : "") || "";
  const description = destination?.description || destination?.shortDescription || destination?.excerpt || "Discover this breathtaking destination.";
  const img = destination?.heroImage || destination?.imageUrl || destination?.image_url || destination?.image || (Array.isArray(destination?.images) ? destination.images[0] : "") || (Array.isArray(destination?.gallery) ? destination.gallery[0]?.imageUrl : "");
  const slug = destination?.slug || destination?.id || destination?._id;
  const rating = destination?.rating || destination?.averageRating || 0;
  const price = destination?.price || destination?.startingPrice || null;
  const duration = destination?.duration || destination?.tripDuration || null;
  const category = destination?.category || destination?.type || "";
  const highlights = destination?.highlights || destination?.features || [];

  return (
    <div className="dest-modal-overlay" onClick={onClose}>
      <div className="dest-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="dest-modal-close" onClick={onClose}><MdClose size={18} /></button>
        <div className="dest-modal-image-section">
          {img ? <img src={img} alt={name} className="dest-modal-image" /> : <div className="dest-modal-image-placeholder"><IoCompassOutline /></div>}
          <div className="dest-modal-image-overlay" />
          <div className="dest-modal-image-badges">
            {category && <span className="dest-modal-badge">{category}</span>}
            {price && <span className="dest-modal-badge dest-modal-badge--price">From ${typeof price === "number" ? price.toLocaleString() : price}</span>}
          </div>
          <button className={`dest-modal-wishlist ${isWishlisted ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); onWishlistToggle(destination?._id || destination?.id || destination?.slug); }}>
            {isWishlisted ? <IoHeart /> : <IoHeartOutline />}
          </button>
          <div className="dest-modal-image-content">
            <h2 className="dest-modal-name">{name}</h2>
            {country && <span className="dest-modal-location"><MdOutlineLocationOn /> {country}</span>}
          </div>
        </div>
        <div className="dest-modal-body">
          {rating > 0 && (<div className="dest-modal-rating">{Array.from({ length: 5 }).map((_, i) => i < Math.round(rating) ? <FaStar key={i} className="dest-modal-star filled" /> : <FaRegStar key={i} className="dest-modal-star" />)}<span className="dest-modal-rating-text">{rating.toFixed(1)}</span></div>)}
          {duration && <div className="dest-modal-duration"><MdOutlineExplore /><span>{duration}</span></div>}
          <p className="dest-modal-description">{description.length > 260 ? description.substring(0, 260) + "…" : description}</p>
          {highlights.length > 0 && (<div className="dest-modal-highlights"><h4>Highlights</h4><ul>{highlights.slice(0, 4).map((h, i) => (<li key={i}><span className="dest-modal-highlight-dot" />{typeof h === "string" ? h : h.text || h.title || ""}</li>))}</ul></div>)}
          <div className="dest-modal-actions"><button className="dest-modal-cta" onClick={() => { onClose(); if (slug) navigate(`/destinations/${slug}`); }}><span>Explore Destination</span><HiOutlineArrowRight /></button></div>
        </div>
        <div className="dest-modal-glow" />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   DESTINATION SLIDESHOW
═══════════════════════════════════════════ */
const DestinationSlideshow = ({ destinations, isWishlisted, onWishlistToggle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [selectedDest, setSelectedDest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const update = () => { const w = window.innerWidth; setCardsPerView(w < 600 ? 1 : w < 900 ? 2 : 3); };
    update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, destinations.length - cardsPerView);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;
  const goTo = useCallback((idx) => setCurrentIndex(Math.max(0, Math.min(idx, maxIndex))), [maxIndex]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  useEffect(() => { const h = (e) => { if (modalOpen) return; if (e.key === "ArrowLeft") goPrev(); if (e.key === "ArrowRight") goNext(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [goPrev, goNext, modalOpen]);

  const cardWidthPct = 100 / cardsPerView;
  const totalDots = maxIndex + 1;
  const getName = (d) => d?.name || d?.title || "Destination";
  const getCountry = (d) => (typeof d?.country === "object" && d.country?.name) || d?.countryObj?.name || (typeof d?.country === "string" ? d.country : "") || "";
  const getImage = (d) => d?.heroImage || d?.imageUrl || d?.image_url || d?.image || (Array.isArray(d?.images) ? d.images[0] : "") || (Array.isArray(d?.gallery) ? d.gallery[0]?.imageUrl : "");
  const getCategory = (d) => d?.category || d?.type || "";

  if (!destinations.length) return null;

  return (
    <div style={{ position: "relative" }}>
      <button className="dest-arr dest-arr--left" onClick={goPrev} disabled={!canPrev} style={{ opacity: canPrev ? 1 : .3, pointerEvents: canPrev ? "auto" : "none" }}><FiChevronLeft size={20} /></button>
      <button className="dest-arr dest-arr--right" onClick={goNext} disabled={!canNext} style={{ opacity: canNext ? 1 : .3, pointerEvents: canNext ? "auto" : "none" }}><FiChevronRight size={20} /></button>
      <div className="dest-slideshow-wrap" style={{ padding: "0 3rem" }}>
        <div ref={trackRef} className="dest-slideshow-track" style={{ transform: `translateX(-${currentIndex * cardWidthPct}%)` }}>
          {destinations.map((dest, idx) => {
            const name = getName(dest); const country = getCountry(dest); const img = getImage(dest); const category = getCategory(dest);
            return (
              <div key={dest?._id || dest?.slug || idx} className="dest-slide-card" style={{ width: `calc(${cardWidthPct}% - .75rem)`, height: "380px", margin: "0 .375rem" }}
                onClick={() => { setSelectedDest(dest); setModalOpen(true); }} role="button" tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setSelectedDest(dest), setModalOpen(true))}>
                {img ? <img src={img} alt={name} className="dest-slide-img" loading="lazy" /> : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#14532d,#166534)", display: "flex", alignItems: "center", justifyContent: "center" }}><IoEarthOutline size={56} style={{ color: "rgba(255,255,255,.25)" }} /></div>
                )}
                <div className="dest-slide-gradient" />
                <span className="dest-slide-num">{String(idx + 1).padStart(2, "0")}</span>
                <div className="dest-slide-content">
                  {category && <span className="dest-slide-tag">{category}</span>}
                  <h3 className="dest-slide-name">{name}</h3>
                  {country && <div className="dest-slide-country"><FiMapPin size={11} />{country}</div>}
                  <div className="dest-slide-cta">Discover <HiOutlineArrowRight size={12} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {totalDots > 1 && (<div className="dest-dots">{Array.from({ length: totalDots }).map((_, i) => (<button key={i} className={`dest-dot ${i === currentIndex ? "active" : ""}`} onClick={() => goTo(i)} />))}</div>)}
      <DestinationModal destination={selectedDest} isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedDest(null); }}
        isWishlisted={selectedDest ? isWishlisted(selectedDest?._id || selectedDest?.id || selectedDest?.slug) : false} onWishlistToggle={onWishlistToggle} />
    </div>
  );
};

const DestSlideshowSkeleton = () => (
  <div style={{ display: "flex", gap: ".75rem", padding: "0 3rem" }}>
    {[0, 1, 2].map((i) => (<div key={i} style={{ flex: 1, height: "380px", borderRadius: "1.5rem", background: "linear-gradient(135deg,#e2e8f0,#f1f5f9)", animation: "hSkelPulse 1.6s ease-in-out infinite", animationDelay: `${i * .15}s` }} />))}
  </div>
);

/* ═══════════════════════════════════════════
   WHY CARD
═══════════════════════════════════════════ */
const WhyCard = ({ card, index }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <Link to={card.link} className="why-card mixed-card-reveal" style={{ animationDelay: `${index * 70}ms` }} aria-label={card.ctaLabel}>
      <div className="why-card-img-wrap">
        {!imgError && card.image ? (<img src={card.image} alt={card.title} className="why-card-img" loading="lazy" onError={() => setImgError(true)} />) : (<div className="why-card-icon-wrap"><div className="why-card-icon"><WhyCardIcon type={card.iconType} size={48} /></div></div>)}
        <div className="why-card-eco-badge"><span>{card.badgeIcon}</span><span>{card.badge}</span></div>
      </div>
      <div className="why-card-body">
        <h3 className="why-card-title">{card.title}</h3>
        <p className="why-card-desc">{card.description}</p>
        <div className="why-card-tags">{card.tags.map((tag, i) => (<span key={i} className="why-card-tag">{tag}</span>))}</div>
      </div>
      <div className="why-card-footer">
        <div className="why-card-footer-left"><div className="why-card-footer-avatar">{card.footer.charAt(0)}</div><span style={{ fontWeight: 600, fontSize: ".68rem" }}>{card.footer}</span></div>
        <span className="why-card-cta">{card.ctaLabel}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════
   FEATURE BLOCK
═══════════════════════════════════════════ */
const FeatureBlock = ({ data, index }) => {
  const reverse = index % 2 === 1;
  const [curImg, setCurImg] = useState(0);
  const [isT, setT] = useState(false);

  useEffect(() => {
    if (!data.images || data.images.length <= 1) return;
    const iv = setInterval(() => { setT(true); setTimeout(() => { setCurImg((p) => (p + 1) % data.images.length); setT(false); }, 500); }, 5000);
    return () => clearInterval(iv);
  }, [data.images]);

  return (
    <section className={`feature-block ${reverse ? "feature-block--reverse" : ""}`}>
      <div className="feature-block-media">
        <div className="feature-block-img-wrap">
          {data.images.map((src, i) => (<img key={i} src={src} alt={`${data.title} ${i + 1}`} className={`feature-block-img ${i === curImg ? "feature-block-img--active" : ""} ${isT && i === curImg ? "feature-block-img--exiting" : ""}`} loading="lazy" />))}
          <div className="feature-block-img-overlay" />
        </div>
        {data.images.length > 1 && (<div className="feature-block-dots">{data.images.map((_, i) => (<button key={i} className={`feature-block-dot ${i === curImg ? "active" : ""}`} onClick={() => { setT(false); setCurImg(i); }} />))}</div>)}
      </div>
      <div className="feature-block-body">
        <div className="feature-block-body-inner">
          <h3 className="feature-block-title">{data.title}</h3>
          <div className="feature-block-divider" />
          <p className="feature-block-desc">{data.descriptions ? data.descriptions[0] : data.description}</p>
          {data.bullets && (<ul className="feature-block-bullets">{data.bullets.map((b, i) => (<li key={i}><span className="feature-block-bullet-mark" /><span>{b}</span></li>))}</ul>)}
          <Link to={data.link} className="feature-block-cta"><span>{data.ctaLabel}</span><HiOutlineArrowRight /></Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   PACKAGE + POST CARDS
═══════════════════════════════════════════ */
const HorizontalPackageCard = React.memo(function HorizontalPackageCard({ pkg, index, wishlist, onWishlist }) {
  const t = THEME[pkg.card_theme] || THEME.default;
  const isWish = wishlist?.has(pkg.id);
  const accent = pkg.accent_color || t.accent || "#059669";
  const hasDisc = Number(pkg.discount_percent) > 0;
  const cover = pkg.cover_image_url || pkg.thumbnail_url || null;
  const feats = useMemo(() => parseJsonField(pkg.features).slice(0, 2), [pkg.features]);
  const handleWish = (e) => { e.preventDefault(); e.stopPropagation(); onWishlist?.(pkg.id); };

  return (
    <Link to={`/packages/${pkg.slug || pkg.id}`} className="hpkg-card mixed-card-reveal" style={{ animationDelay: `${index * 70}ms` }}>
      <div className="hpkg-img-wrap">
        {cover ? <img src={cover} alt={pkg.title} className="hpkg-img" loading="lazy" /> : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(145deg,${accent}33,${accent}77)`, display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={36} style={{ color: accent, opacity: .4 }} /></div>
        )}
        <div className="hpkg-img-gradient" />
        {pkg.badge_label ? <span className="hpkg-badge" style={{ backgroundColor: pkg.badge_color || accent }}>{pkg.badge_label}</span> : pkg.is_featured && <span className="hpkg-badge" style={{ backgroundColor: "#f59e0b" }}>Featured</span>}
        {hasDisc && <span className="hpkg-discount">-{pkg.discount_percent}% OFF</span>}
        {!hasDisc && <button className="hpkg-wish" onClick={handleWish}><Heart size={12} style={{ fill: isWish ? "#ef4444" : "none", color: isWish ? "#ef4444" : "#64748b" }} /></button>}
        {pkg.duration_days && <div className="hpkg-duration-pill"><Clock size={9} />{fmtDuration(pkg.duration_days, pkg.duration_nights)}</div>}
        {pkg.is_sold_out && (<div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontWeight: 900, fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,.35)", padding: ".35rem .85rem", borderRadius: "99px", backdropFilter: "blur(6px)" }}>Sold Out</span></div>)}
      </div>
      <div className="hpkg-body">
        {pkg.category && <span className="hpkg-category">{pkg.category}</span>}
        <h3 className="hpkg-title">{pkg.title}</h3>
        <div className="hpkg-meta">{(pkg.destination || pkg.country) && (<span className="hpkg-meta-item"><MapPin size={9} style={{ color: "#059669", flexShrink: 0 }} />{[pkg.destination, pkg.country].filter(Boolean).join(", ")}</span>)}</div>
        {pkg.short_description && <p className="hpkg-desc">{pkg.short_description}</p>}
        {feats.length > 0 && (<div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>{feats.map((f, i) => (<span key={i} style={{ fontSize: ".6rem", fontWeight: 700, padding: ".18rem .5rem", borderRadius: "99px", background: `${accent}12`, color: accent, border: `1px solid ${accent}28`, fontFamily: "'Inter',sans-serif" }}>{f}</span>))}</div>)}
        <div className="hpkg-footer">
          <div>
            {hasDisc && (() => { const orig = Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100); return <p style={{ fontSize: ".65rem", color: "#94a3b8", textDecoration: "line-through", lineHeight: 1, marginBottom: ".1rem", fontFamily: "'Inter',sans-serif" }}>{fmtPrice(orig, pkg.currency)}</p>; })()}
            <p className="hpkg-price" style={{ color: accent }}>{pkg.is_price_visible !== false ? fmtPrice(pkg.price, pkg.currency) : "POA"}</p>
            <p className="hpkg-price-label">{pkg.price_label || "per person"}</p>
          </div>
          <span className="hpkg-cta">Explore <ArrowRight size={11} /></span>
        </div>
      </div>
    </Link>
  );
});

const HorizontalPostCard = React.memo(function HorizontalPostCard({ post, index }) {
  const date = post.published_at || post.created_at;
  const formatted = date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <Link to={`/blog/${post.slug}`} className="hpost-card mixed-card-reveal" style={{ animationDelay: `${index * 70}ms` }}>
      <div className="hpost-img-wrap">
        {post.image_url ? <img src={post.image_url} alt={post.title} className="hpost-img" loading="lazy" /> : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#e2e8f0,#f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center" }}><MdOutlineArticle size={32} style={{ color: "#94a3b8" }} /></div>
        )}
        {post.category && <span className="hpost-category">{post.category}</span>}
      </div>
      <div className="hpost-body">
        <div className="hpost-meta">
          {formatted && <span style={{ display: "flex", alignItems: "center", gap: ".15rem" }}><MdOutlineDateRange size={10} /> {formatted}</span>}
          {post.read_time > 0 && <span>· {post.read_time} min</span>}
          {post.view_count > 0 && <span style={{ display: "flex", alignItems: "center", gap: ".15rem" }}><MdOutlineVisibility size={10} /> {post.view_count}</span>}
        </div>
        <h3 className="hpost-title">{post.title}</h3>
        {post.excerpt && <p className="hpost-excerpt">{post.excerpt.length > 110 ? post.excerpt.substring(0, 110) + "…" : post.excerpt}</p>}
        <span className="hpost-readmore">Read article <HiOutlineArrowRight size={12} /></span>
      </div>
    </Link>
  );
});

const PackageSkeleton = () => (<div className="hpkg-skeleton"><div className="h-skel" style={{ height: 170 }} /><div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: ".6rem" }}><div className="h-skel" style={{ height: 9, width: "38%" }} /><div className="h-skel" style={{ height: 16, width: "82%" }} /><div className="h-skel" style={{ height: 9, width: "55%" }} /><div className="h-skel" style={{ height: 28, width: "100%" }} /><div style={{ display: "flex", justifyContent: "space-between", paddingTop: ".4rem", borderTop: "1px solid #f1f5f9" }}><div className="h-skel" style={{ height: 24, width: 70 }} /><div className="h-skel" style={{ height: 30, width: 80, borderRadius: 8 }} /></div></div></div>);
const PostSkeleton = () => (<div className="hpost-skeleton"><div className="h-skel" style={{ height: 150 }} /><div style={{ padding: ".85rem 1rem", display: "flex", flexDirection: "column", gap: ".55rem" }}><div className="h-skel" style={{ height: 9, width: "45%" }} /><div className="h-skel" style={{ height: 14, width: "85%" }} /><div className="h-skel" style={{ height: 12, width: "65%" }} /><div className="h-skel" style={{ height: 24, width: "100%" }} /><div className="h-skel" style={{ height: 10, width: "35%" }} /></div></div>);

const MixedScrollRow = ({ packages, posts, loadingPkgs, loadingPosts, wishlist, onWishlist }) => {
  const rowRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const items = useMemo(() => {
    const result = []; const pkgs = packages.slice(0, 12); const strs = posts.slice(0, 6);
    let pi = 0, si = 0;
    while (pi < pkgs.length || si < strs.length) {
      for (let k = 0; k < 2 && pi < pkgs.length; k++, pi++) result.push({ type: "pkg", data: pkgs[pi], idx: pi });
      if (si < strs.length) { result.push({ type: "post", data: strs[si], idx: si }); si++; }
    }
    return result;
  }, [packages, posts]);

  const updateScroll = useCallback(() => {
    const el = rowRef.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0);
    setCanLeft(el.scrollLeft > 4); setCanRight(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => { const el = rowRef.current; if (!el) return; el.addEventListener("scroll", updateScroll, { passive: true }); updateScroll(); return () => el.removeEventListener("scroll", updateScroll); }, [updateScroll, items]);
  const scroll = useCallback((dir) => { rowRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" }); }, []);
  const isLoading = loadingPkgs || loadingPosts;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <div className="section-link-row">
          <Link to="/packages" className="section-link-pill section-link-pill--green">All Packages <ArrowRight size={11} /></Link>
          <Link to="/blog" className="section-link-pill section-link-pill--indigo">All Stories <ArrowRight size={11} /></Link>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <button className="scroll-nav-btn scroll-nav-btn--left" onClick={() => scroll("left")} disabled={!canLeft}><IoChevronBack size={16} /></button>
        <div ref={rowRef} className="mixed-scroll-row" style={{ padding: ".35rem .2rem 1rem" }}>
          {isLoading ? Array.from({ length: 9 }).map((_, i) => i % 3 === 2 ? <PostSkeleton key={i} /> : <PackageSkeleton key={i} />)
            : items.map((item, i) => item.type === "pkg"
              ? <HorizontalPackageCard key={`pkg-${item.data.id || i}`} pkg={item.data} index={i} wishlist={wishlist} onWishlist={onWishlist} />
              : <HorizontalPostCard key={`post-${item.data.id || item.data.slug || i}`} post={item.data} index={i} />
            )}
        </div>
        <button className="scroll-nav-btn scroll-nav-btn--right" onClick={() => scroll("right")} disabled={!canRight}><IoChevronForward size={16} /></button>
      </div>
      <div className="scroll-progress-bar"><div className="scroll-progress-fill" style={{ width: `${scrollProgress}%` }} /></div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN HOME
═══════════════════════════════════════════ */
const Home = () => {
  useEffect(injectHomeStyles, []);
  const { setIsLoading } = useApp();
  const hasCompletedRef = useRef(false);

  const { destinations: allDest = [], loading: destLoading } = useDestinations({ limit: 100, sort: "-featured" });
  const { posts = [], loading: postsLoading } = usePosts({ limit: 12, sort: "created" });
  const { loadWishlist, toggleWishlist, isWishlisted } = useWishlist();

  const [packages, setPackages] = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [pkgWishlist, setPkgWishlist] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem("altuvera_wishlist") || "[]")); } catch { return new Set(); } });

  useEffect(() => {
    setLoadingPkgs(true);
    apiGet("/packages", { limit: 12, sortBy: "sort_order", order: "asc", is_active: true })
      .then((data) => setPackages(data.data || []))
      .catch(() => setPackages([]))
      .finally(() => setLoadingPkgs(false));
  }, []);

  const handlePkgWishlist = useCallback((id) => {
    setPkgWishlist((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); try { localStorage.setItem("altuvera_wishlist", JSON.stringify([...n])); } catch {} return n; });
  }, []);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  useEffect(() => {
    if (hasCompletedRef.current) return;
    if (destLoading) { setIsLoading(true); return; }
    let cancelled = false;
    const preload = (src) => new Promise((r) => { const img = new Image(); img.onload = r; img.onerror = r; img.src = src; });
    (async () => {
      setIsLoading(true);
      await new Promise((r) => requestAnimationFrame(r));
      const urls = new Set();
      HERO_SLIDES?.forEach((s) => { if (s.image) urls.add(s.image); if (s.fallback) urls.add(s.fallback); });
      await Promise.all([...urls].filter(Boolean).slice(0, 5).map(preload));
      if (!cancelled) { hasCompletedRef.current = true; setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [destLoading, setIsLoading]);

  const featureBlocks = useMemo(() => [
    { title: "Encounter Mountain Gorillas & Explore the Land of a Thousand Hills", description: "Rwanda offers one of Africa's most exclusive wildlife experiences. Trek through the misty forests of Volcanoes National Park to meet endangered mountain gorillas.", bullets: ["World-famous mountain gorilla trekking", "Nyungwe Forest canopy walk & chimpanzee tracking", "Big Five safaris in Akagera National Park", "Luxury eco-lodges with expert local guides"], ctaLabel: "Explore Rwanda", link: "/country/rwanda", images: ["https://i.pinimg.com/1200x/5d/1a/90/5d1a90a3a3f9ad6bcddf570344ff2fc4.jpg", "https://i.pinimg.com/1200x/73/f0/ee/73f0ee6d0c2fab1906c16ce20c251f56.jpg", "https://i.pinimg.com/736x/46/fe/c8/46fec850388090f1f6bbdd4246b9a049.jpg"] },
    { title: "Witness the Great Migration & Conquer Africa's Highest Peak", description: "From the endless plains of the Serengeti to the snow-capped summit of Mount Kilimanjaro, Tanzania delivers bucket-list adventures.", bullets: ["The Great Wildebeest Migration in Serengeti", "Mount Kilimanjaro climbing expeditions", "Ngorongoro Crater Big Five safaris", "Zanzibar beach escapes & cultural tours"], ctaLabel: "Explore Tanzania", link: "/country/tanzania", images: ["https://i.pinimg.com/1200x/d7/c2/55/d7c255030d2c381093145fc8409270b0.jpg", "https://i.pinimg.com/1200x/7c/5b/d9/7c5bd9c6303f68eec25ff948f1b0f11e.jpg", "https://i.pinimg.com/1200x/7b/7f/33/7b7f33e40af1ff8d756c610703f32f6e.jpg"] },
    { title: "Experience Legendary Safaris & Coastal Paradise", description: "Kenya combines iconic wildlife encounters with spectacular landscapes and pristine Indian Ocean beaches.", bullets: ["Maasai Mara Great Migration safaris", "Amboseli elephant encounters with Kilimanjaro views", "Sunrise hot-air balloon adventures", "Diani Beach & Swahili coastal experiences"], ctaLabel: "Explore Kenya", link: "/country/kenya", images: ["https://i.pinimg.com/1200x/82/1c/3c/821c3c64c9ef926ad79900314de0ea9b.jpg", "https://i.pinimg.com/1200x/0f/c4/6f/0fc46fc0a5e286b126ab6e78697c5e5f.jpg", "https://i.pinimg.com/736x/cc/5f/49/cc5f496af04db30b07c3559d5a708cb7.jpg"] },
  ], []);

  return (
    <div className="home-root">
      <SEO title="Altuvera Travel — True Adventures in High Places & Deep Culture" />
      <Hero />

      {/* ── Intro ── */}
      <section className="home-section home-section--compact">
        <div className="home-container">
          <div className="intro-layout">
            <div className="intro-text">
              <h2 className="intro-heading">Your Gateway to <span className="text-gradient">East Africa</span></h2>
              <div className="intro-divider" />
              <p className="intro-paragraph">
                From the thundering hooves of the Great Migration across the Serengeti,
                to the quiet wonder of a silverback gorilla's gaze in Bwindi,
                to the warm hospitality of Maasai elders beneath star-filled skies —
                Altuvera transforms wanderlust into life-defining adventures.
              </p>
            </div>
            <IntroMediaPanel />
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="home-section home-section--compact">
        <div className="home-container">
          <div className="hsec-header hsec-center">
            <h2 className="hsec-title">Handpicked <span>Destinations</span></h2>
            <p className="hsec-sub">Each place chosen for the stories it holds, the wildlife it shelters, and the people who call it home.</p>
          </div>
          {destLoading ? <DestSlideshowSkeleton /> : (
            <DestinationSlideshow destinations={allDest.slice(0, 12)} isWishlisted={(id) => isWishlisted(id)} onWishlistToggle={toggleWishlist} />
          )}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Button to="/destinations" variant="primary" size="large" icon={<HiOutlineArrowRight size={16} />}>View All Destinations</Button>
          </div>
        </div>
      </section>

      {/* ── Why Altuvera ── */}
      <section className="why-section">
        <div className="home-container">
          <div className="hsec-header hsec-center">
            <h2 className="hsec-title">The Altuvera <span>Difference</span></h2>
            <p className="hsec-sub">Expertise, passion, and an unwavering commitment to excellence in every journey we craft.</p>
          </div>
          <div className="why-grid">{WHY_CARDS.map((card, i) => (<WhyCard key={card.id} card={card} index={i} />))}</div>
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Button to="/about" variant="primary" size="large" icon={<HiOutlineArrowRight size={16} />}>Learn More About Us</Button>
          </div>
        </div>
      </section>

      {/* ── Feature Blocks ── */}
      <section className="home-section home-section--compact" style={{ background: "#F0FDF4" }}>
        <div className="home-container">
          <div className="hsec-header hsec-center">
            <h2 className="hsec-title">The People Who Go <span>Never Quite Come Back</span> the Same</h2>
            <p className="hsec-sub">Every journey we craft is built around a simple truth — the most important thing you'll bring home isn't a souvenir.</p>
          </div>
        </div>
        <div className="feature-blocks-stack">
          {featureBlocks.map((block, i) => (<FeatureBlock key={block.title} data={block} index={i} />))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <TestimonialShowcase />

      {/* ── Packages & Stories ── */}
      <section className="home-section home-section--compact">
        <div className="home-container">
          <div className="hsec-header">
            <h2 className="hsec-title">Explore Packages & <span>Stories</span></h2>
            <p className="hsec-sub">Curated adventures and field notes — scroll to discover.</p>
          </div>
          <MixedScrollRow packages={packages} posts={posts} loadingPkgs={loadingPkgs} loadingPosts={postsLoading} wishlist={pkgWishlist} onWishlist={handlePkgWishlist} />
        </div>
      </section>
    </div>
  );
};

export default Home;