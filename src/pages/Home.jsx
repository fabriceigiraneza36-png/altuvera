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
  IoHeartOutline, IoHeart, IoPlayCircle,
} from "react-icons/io5";
import {
  Clock, MapPin, ArrowRight, Package, Heart,
} from "lucide-react";
import {
  FiChevronLeft, FiChevronRight, FiMapPin, FiStar,
} from "react-icons/fi";

import Hero, { HERO_SLIDES } from "../components/home/Hero";
import Button from "../components/common/Button";
import SEO from "../components/common/SEO";

import { useApp } from "../context/AppContext";
import { useDestinations } from "../hooks/useDestinations";
import { usePosts } from "../hooks/usePosts";
import { useWishlist } from "../hooks/useWishlist";
import { useFeaturedTestimonials } from "../hooks/useTestimonials";

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
const HOME_PKG_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap');

/* ── Scroll row ── */
.mixed-scroll-row{display:flex;gap:1.5rem;overflow-x:auto;padding-bottom:1.25rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.mixed-scroll-row::-webkit-scrollbar{display:none;}
.mixed-scroll-row>*{scroll-snap-align:start;flex-shrink:0;}

/* ── Scroll nav buttons ── */
.scroll-nav-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:2.75rem;height:2.75rem;border-radius:50%;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border:1.5px solid rgba(16,185,129,.2);box-shadow:0 4px 20px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#059669;transition:all .25s cubic-bezier(.34,1.56,.64,1);}
.scroll-nav-btn:hover{background:#059669;color:#fff;border-color:#059669;box-shadow:0 6px 24px rgba(5,150,105,.35);transform:translateY(-50%) scale(1.1);}
.scroll-nav-btn:disabled{opacity:.35;cursor:not-allowed;transform:translateY(-50%) scale(1);}
.scroll-nav-btn--left{left:-1.25rem;}.scroll-nav-btn--right{right:-1.25rem;}

/* ── Package card ── */
.hpkg-card{width:300px;border-radius:1.5rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;box-shadow:0 2px 12px rgba(0,0,0,.06);display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease,border-color .25s ease;cursor:pointer;text-decoration:none;color:inherit;position:relative;}
.hpkg-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:0 24px 56px rgba(0,0,0,.14),0 4px 16px rgba(5,150,105,.1);border-color:rgba(16,185,129,.3);}
.hpkg-card:hover .hpkg-img{transform:scale(1.08);}
.hpkg-img-wrap{position:relative;height:190px;overflow:hidden;background:#e2e8f0;}
.hpkg-img{width:100%;height:100%;object-fit:cover;transition:transform .65s cubic-bezier(.25,.46,.45,.94);}
.hpkg-img-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55) 0%,transparent 60%);pointer-events:none;}
.hpkg-body{padding:1.1rem 1.2rem 1.2rem;display:flex;flex-direction:column;flex:1;gap:.5rem;}
.hpkg-category{font-size:.6rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#059669;font-family:'Inter',sans-serif;}
.hpkg-title{font-size:1rem;font-weight:700;color:#1e293b;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s;font-family:'Inter',sans-serif;}
.hpkg-card:hover .hpkg-title{color:#059669;}
.hpkg-meta{display:flex;flex-wrap:wrap;gap:.6rem;font-size:.72rem;color:#94a3b8;font-family:'Inter',sans-serif;}
.hpkg-meta-item{display:flex;align-items:center;gap:.25rem;}
.hpkg-desc{font-size:.8rem;color:#64748b;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;font-family:'Inter',sans-serif;}
.hpkg-footer{display:flex;align-items:flex-end;justify-content:space-between;margin-top:.5rem;padding-top:.75rem;border-top:1px solid #f1f5f9;gap:.5rem;}
.hpkg-price{font-size:1.35rem;font-weight:900;line-height:1;color:#059669;font-family:'Inter',sans-serif;}
.hpkg-price-label{font-size:.65rem;color:#94a3b8;margin-top:.2rem;font-family:'Inter',sans-serif;}
.hpkg-cta{display:inline-flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:700;color:#fff;padding:.55rem 1rem;border-radius:.75rem;background:linear-gradient(135deg,#059669,#047857);box-shadow:0 4px 14px rgba(5,150,105,.3);transition:all .25s ease;white-space:nowrap;flex-shrink:0;font-family:'Inter',sans-serif;}
.hpkg-card:hover .hpkg-cta{box-shadow:0 8px 22px rgba(5,150,105,.45);transform:scale(1.04);}
.hpkg-badge{position:absolute;top:.75rem;left:.75rem;font-size:.6rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;padding:.3rem .6rem;border-radius:99px;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2);font-family:'Inter',sans-serif;}
.hpkg-discount{position:absolute;top:.75rem;right:.75rem;font-size:.6rem;font-weight:900;background:#ef4444;color:#fff;padding:.25rem .5rem;border-radius:99px;font-family:'Inter',sans-serif;}
.hpkg-duration-pill{position:absolute;bottom:.75rem;right:.75rem;font-size:.65rem;font-weight:700;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;padding:.3rem .65rem;border-radius:99px;display:flex;align-items:center;gap:.3rem;border:1px solid rgba(255,255,255,.12);font-family:'Inter',sans-serif;}
.hpkg-wish{position:absolute;top:.75rem;right:.75rem;width:2rem;height:2rem;border-radius:50%;background:rgba(255,255,255,.92);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.12);cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s;}
.hpkg-wish:hover{transform:scale(1.18);background:#fff;}

/* ── Post card ── */
.hpost-card{width:280px;border-radius:1.5rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;box-shadow:0 2px 12px rgba(0,0,0,.06);display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease,border-color .25s ease;cursor:pointer;text-decoration:none;color:inherit;}
.hpost-card:hover{transform:translateY(-6px) scale(1.012);box-shadow:0 20px 48px rgba(0,0,0,.12);border-color:rgba(16,185,129,.25);}
.hpost-card:hover .hpost-img{transform:scale(1.07);}
.hpost-img-wrap{position:relative;height:170px;overflow:hidden;background:#e2e8f0;flex-shrink:0;}
.hpost-img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.25,.46,.45,.94);}
.hpost-category{position:absolute;top:.75rem;left:.75rem;font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;padding:.3rem .65rem;border-radius:99px;border:1px solid rgba(255,255,255,.15);font-family:'Inter',sans-serif;}
.hpost-body{padding:1rem 1.1rem 1.2rem;display:flex;flex-direction:column;gap:.45rem;flex:1;}
.hpost-meta{display:flex;align-items:center;gap:.5rem;font-size:.68rem;color:#94a3b8;flex-wrap:wrap;font-family:'Inter',sans-serif;}
.hpost-title{font-size:.95rem;font-weight:700;color:#1e293b;line-height:1.38;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s;font-family:'Inter',sans-serif;}
.hpost-card:hover .hpost-title{color:#059669;}
.hpost-excerpt{font-size:.78rem;color:#64748b;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;font-family:'Inter',sans-serif;}
.hpost-readmore{display:inline-flex;align-items:center;gap:.3rem;font-size:.75rem;font-weight:700;color:#059669;margin-top:.25rem;transition:gap .2s;font-family:'Inter',sans-serif;}
.hpost-card:hover .hpost-readmore{gap:.55rem;}

/* ── Skeletons ── */
.hpkg-skeleton{width:300px;border-radius:1.5rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;flex-shrink:0;animation:hSkeletonPulse 1.6s ease-in-out infinite;}
.hpost-skeleton{width:280px;border-radius:1.5rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;flex-shrink:0;animation:hSkeletonPulse 1.6s ease-in-out infinite;}
@keyframes hSkeletonPulse{0%,100%{opacity:1}50%{opacity:.55}}
.h-skel{background:#e2e8f0;border-radius:.5rem;}
.mixed-card-reveal{animation:mixedReveal .55s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes mixedReveal{from{opacity:0;transform:translateY(24px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.scroll-progress-bar{height:3px;border-radius:99px;background:#e2e8f0;overflow:hidden;margin-top:1rem;}
.scroll-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#059669,#34d399);transition:width .2s ease;}

/* ══════════════════════════════════════════
   DESTINATION SLIDESHOW
══════════════════════════════════════════ */
.dest-slideshow-wrap{position:relative;width:100%;overflow:hidden;}
.dest-slideshow-track{display:flex;transition:transform .55s cubic-bezier(.77,0,.175,1);}
.dest-slide-card{flex-shrink:0;position:relative;border-radius:1.75rem;overflow:hidden;cursor:pointer;background:#0f1b0f;box-shadow:0 8px 32px rgba(0,0,0,.12);transition:box-shadow .35s ease;}
.dest-slide-card:hover{box-shadow:0 20px 56px rgba(0,0,0,.2);}
.dest-slide-img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.25,.46,.45,.94);display:block;}
.dest-slide-card:hover .dest-slide-img{transform:scale(1.06);}
.dest-slide-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,37,20,.88) 0%,rgba(5,37,20,.3) 50%,transparent 100%);pointer-events:none;}
.dest-slide-content{position:absolute;bottom:0;left:0;right:0;padding:clamp(1.25rem,3vw,2rem);z-index:2;}
.dest-slide-tag{display:inline-block;font-family:'Inter',sans-serif;font-size:.6rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#86efac;margin-bottom:.6rem;}
.dest-slide-name{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.4rem,2.8vw,2rem);font-weight:700;color:#fff;line-height:1.15;margin-bottom:.4rem;}
.dest-slide-country{display:flex;align-items:center;gap:.3rem;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:500;color:rgba(255,255,255,.7);margin-bottom:.9rem;}
.dest-slide-cta{display:inline-flex;align-items:center;gap:.45rem;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:700;color:#fff;padding:.5rem 1.1rem;border-radius:99px;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);transition:all .25s ease;cursor:pointer;}
.dest-slide-cta:hover{background:rgba(255,255,255,.25);}
.dest-slide-num{position:absolute;top:1.1rem;right:1.1rem;font-family:'Inter',sans-serif;font-size:.65rem;font-weight:900;letter-spacing:.08em;color:rgba(255,255,255,.5);background:rgba(0,0,0,.3);backdrop-filter:blur(6px);padding:.25rem .6rem;border-radius:99px;border:1px solid rgba(255,255,255,.12);}
.dest-arr{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:3rem;height:3rem;border-radius:50%;border:none;cursor:pointer;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;color:#15803d;box-shadow:0 4px 20px rgba(0,0,0,.15);transition:all .25s cubic-bezier(.34,1.56,.64,1);}
.dest-arr:hover{background:#15803d;color:#fff;transform:translateY(-50%) scale(1.1);box-shadow:0 8px 28px rgba(21,128,61,.4);}
.dest-arr--left{left:1rem;}.dest-arr--right{right:1rem;}
.dest-dots{display:flex;justify-content:center;gap:.55rem;margin-top:1.5rem;}
.dest-dot{height:.5rem;border-radius:99px;border:none;cursor:pointer;background:#d0e3d0;transition:all .35s ease;padding:0;}
.dest-dot.active{background:#15803d;width:1.75rem;}
.dest-dot:not(.active){width:.5rem;}
.dest-dot:not(.active):hover{background:#86efac;}
.dest-modal-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(5,37,20,.6);backdrop-filter:blur(12px);}
.dest-modal-card{position:relative;width:100%;max-width:560px;max-height:90vh;border-radius:2rem;overflow:hidden;background:#fff;box-shadow:0 40px 100px rgba(0,0,0,.3);display:flex;flex-direction:column;}
.dest-modal-close{position:absolute;top:1rem;right:1rem;z-index:10;width:2.5rem;height:2.5rem;border-radius:50%;border:none;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#334155;box-shadow:0 2px 12px rgba(0,0,0,.15);transition:all .2s;}
.dest-modal-close:hover{background:#fff;transform:scale(1.1);}
.dest-modal-image-section{position:relative;height:260px;flex-shrink:0;}
.dest-modal-image{width:100%;height:100%;object-fit:cover;}
.dest-modal-image-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,37,20,.75) 0%,transparent 55%);}
.dest-modal-image-placeholder{width:100%;height:100%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:3rem;color:#94a3b8;}
.dest-modal-image-badges{position:absolute;top:1rem;left:1rem;display:flex;gap:.5rem;flex-wrap:wrap;}
.dest-modal-badge{font-family:'Inter',sans-serif;font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:.3rem .7rem;border-radius:99px;background:rgba(0,0,0,.5);backdrop-filter:blur(6px);color:#fff;border:1px solid rgba(255,255,255,.15);}
.dest-modal-badge--price{background:rgba(21,128,61,.8);}
.dest-modal-wishlist{position:absolute;top:1rem;right:3.5rem;width:2.25rem;height:2.25rem;border-radius:50%;border:none;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#64748b;transition:all .2s;}
.dest-modal-wishlist.active{color:#ef4444;}
.dest-modal-wishlist:hover{transform:scale(1.1);}
.dest-modal-image-content{position:absolute;bottom:0;left:0;right:0;padding:1.25rem 1.5rem;}
.dest-modal-name{font-family:'Playfair Display',Georgia,serif;font-size:1.65rem;font-weight:700;color:#fff;margin-bottom:.3rem;line-height:1.15;}
.dest-modal-location{display:flex;align-items:center;gap:.3rem;font-family:'Inter',sans-serif;font-size:.8rem;color:rgba(255,255,255,.75);}
.dest-modal-body{padding:1.5rem;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:1rem;}
.dest-modal-rating{display:flex;align-items:center;gap:.3rem;}
.dest-modal-star{color:#d1d5db;font-size:.9rem;}
.dest-modal-star.filled{color:#f59e0b;}
.dest-modal-rating-text{font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;color:#475569;margin-left:.25rem;}
.dest-modal-duration{display:flex;align-items:center;gap:.4rem;font-family:'Inter',sans-serif;font-size:.82rem;color:#64748b;}
.dest-modal-description{font-family:'Inter',sans-serif;font-size:.88rem;color:#475569;line-height:1.7;}
.dest-modal-highlights h4{font-family:'Inter',sans-serif;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#15803d;margin-bottom:.6rem;}
.dest-modal-highlights ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.4rem;}
.dest-modal-highlights li{display:flex;align-items:center;gap:.5rem;font-family:'Inter',sans-serif;font-size:.82rem;color:#475569;}
.dest-modal-highlight-dot{width:.4rem;height:.4rem;border-radius:50%;background:#15803d;flex-shrink:0;}
.dest-modal-actions{margin-top:.5rem;}
.dest-modal-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.9rem 1.5rem;border:none;border-radius:1rem;background:linear-gradient(135deg,#15803d,#059669);color:#fff;font-family:'Inter',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .25s ease;box-shadow:0 4px 16px rgba(21,128,61,.3);}
.dest-modal-cta:hover{box-shadow:0 8px 28px rgba(21,128,61,.45);transform:translateY(-1px);}
.dest-modal-glow{position:absolute;bottom:-4rem;right:-4rem;width:12rem;height:12rem;border-radius:50%;background:radial-gradient(circle,rgba(21,128,61,.08) 0%,transparent 70%);pointer-events:none;}

/* ══════════════════════════════════════════
   REDESIGNED TESTIMONIALS
══════════════════════════════════════════ */
.htestimonial-section{padding:clamp(3rem,6vw,5rem) 0;background:#F0FDF4;position:relative;overflow:hidden;}
.htestimonial-section::before{content:'';position:absolute;top:-6rem;left:-8rem;width:28rem;height:28rem;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,.08) 0%,transparent 70%);pointer-events:none;}
.htestimonial-section::after{content:'';position:absolute;bottom:-5rem;right:-6rem;width:22rem;height:22rem;border-radius:50%;background:radial-gradient(circle,rgba(21,128,61,.07) 0%,transparent 70%);pointer-events:none;}
.htestimonial-header{text-align:center;margin-bottom:clamp(1.75rem,3.5vw,3rem);position:relative;z-index:1;}
.htestimonial-eyebrow{font-family:'Inter',sans-serif;font-size:.68rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#16a34a;margin-bottom:.85rem;display:block;}
.htestimonial-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:800;color:#14532d;line-height:1.1;margin-bottom:.9rem;}
.htestimonial-subtitle{font-family:'Inter',sans-serif;font-size:clamp(.9rem,1.4vw,1.05rem);color:#5A7A5A;line-height:1.65;max-width:560px;margin:0 auto;}
.htestimonial-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem;position:relative;z-index:1;}
@media(max-width:700px){.htestimonial-grid{grid-template-columns:1fr;}}
.htestimonial-card{background:#fff;border-radius:1.5rem;padding:2rem;border:1.5px solid #DCFCE7;box-shadow:0 2px 16px rgba(0,0,0,.04);display:flex;flex-direction:column;gap:1.1rem;position:relative;overflow:hidden;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease,border-color .25s;}
.htestimonial-card:hover{transform:translateY(-6px);box-shadow:0 20px 52px rgba(22,163,74,.12);border-color:#BBF7D0;}
.htestimonial-card-glyph{position:absolute;top:.75rem;right:1.25rem;font-family:'Playfair Display',Georgia,serif;font-size:5rem;line-height:1;color:#DCFCE7;pointer-events:none;user-select:none;}
.htestimonial-stars{display:flex;gap:.25rem;}
.htestimonial-star{font-size:.85rem;color:#d1d5db;}
.htestimonial-star.filled{color:#f59e0b;}
.htestimonial-quote{font-family:'Inter',sans-serif;font-size:.9rem;line-height:1.78;color:#3F5C3F;font-style:italic;flex:1;position:relative;z-index:1;}
.htestimonial-person{display:flex;align-items:center;gap:.85rem;padding-top:1rem;border-top:1.5px solid #F0FDF4;flex-wrap:wrap;}
.htestimonial-avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2.5px solid #BBF7D0;flex-shrink:0;}
.htestimonial-avatar-init{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#15803d,#22c55e);display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Inter',sans-serif;font-weight:800;font-size:1.1rem;flex-shrink:0;border:2.5px solid #BBF7D0;}
.htestimonial-name{font-family:'Inter',sans-serif;font-size:.9rem;font-weight:700;color:#14532d;}
.htestimonial-meta{font-family:'Inter',sans-serif;font-size:.72rem;color:#7A9E7A;margin-top:.1rem;}
.htestimonial-trip-badge{margin-left:auto;padding:.3rem .85rem;border-radius:99px;background:#F0FDF4;border:1px solid #BBF7D0;font-family:'Inter',sans-serif;font-size:.65rem;font-weight:700;color:#15803d;letter-spacing:.04em;white-space:nowrap;}
.htestimonial-skeleton{background:#fff;border-radius:1.5rem;padding:2rem;border:1.5px solid #DCFCE7;animation:htSkeletonPulse 1.6s ease-in-out infinite;}
@keyframes htSkeletonPulse{0%,100%{opacity:1}50%{opacity:.5}}

/* ══════════════════════════════════════════
   WHY ALTUVERA — NEW GREEN CARD DESIGN
══════════════════════════════════════════ */
.why-section {
  padding: clamp(3rem,6vw,5rem) 0;
  background: #f0fdf4;
}
.why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.why-card {
  background: #fff;
  border-radius: 1.75rem;
  overflow: hidden;
  border: 1px solid #d1fae5;
  box-shadow: 0 4px 20px rgba(5,150,105,0.06);
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  text-decoration: none;
  color: inherit;
}
.why-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 25px 50px -12px rgba(16,185,129,0.25);
  border-color: #a7f3d0;
}
.why-card-img-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #059669, #047857);
}
.why-card-img-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(16,185,129,0.15));
  opacity: 0;
  transition: opacity 0.3s ease;
}
.why-card:hover .why-card-img-wrap::after {
  opacity: 1;
}
.why-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
  display: block;
}
.why-card:hover .why-card-img {
  transform: scale(1.06);
}
.why-card-icon-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #059669, #047857);
  position: relative;
}
.why-card-icon-wrap::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -40%;
  width: 80%;
  height: 80%;
  background: rgba(255,255,255,0.12);
  border-radius: 50%;
  filter: blur(20px);
}
.why-card-icon {
  color: rgba(255,255,255,0.95);
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.18));
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}
.why-card:hover .why-card-icon {
  transform: scale(1.1);
}
.why-card-eco-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.95);
  color: #059669;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  padding: .3rem .7rem;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: .3rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: 'Inter', sans-serif;
  z-index: 2;
}
.why-card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: .75rem;
}
.why-card-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #064e3b;
  line-height: 1.3;
  margin: 0;
}
.why-card-desc {
  font-family: 'Inter', sans-serif;
  font-size: .88rem;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
  flex: 1;
}
.why-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}
.why-card-tag {
  font-family: 'Inter', sans-serif;
  font-size: .68rem;
  font-weight: 600;
  padding: .25rem .65rem;
  border-radius: 99px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #d1fae5;
  cursor: pointer;
  transition: all .2s ease;
}
.why-card-tag:hover {
  background: #d1fae5;
  color: #047857;
}
.why-card-footer {
  padding: 1rem 1.5rem;
  background: #f0fdf4;
  border-top: 1px solid #d1fae5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
}
.why-card-footer-left {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  color: #059669;
}
.why-card-footer-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669, #047857);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: .65rem;
  font-weight: 800;
}
.why-card-cta {
  display: flex;
  align-items: center;
  gap: .35rem;
  font-size: .78rem;
  font-weight: 700;
  color: #fff;
  background: #059669;
  border: none;
  border-radius: .65rem;
  padding: .5rem 1rem;
  cursor: pointer;
  transition: all .25s ease;
  text-decoration: none;
}
.why-card-cta:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(5,150,105,0.35);
}

/* ── Feature blocks (country sections) ── */
.feature-block{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:center;padding:clamp(2.5rem,5vw,4.5rem) 0;}
.feature-block--reverse{direction:rtl;}.feature-block--reverse>*{direction:ltr;}
.feature-block-media{position:relative;}
.feature-block-img-wrap{border-radius:1.75rem;overflow:hidden;aspect-ratio:4/3;position:relative;box-shadow:0 12px 40px rgba(0,0,0,.1);}
.feature-block-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .8s ease,transform .8s ease;transform:scale(1.04);}
.feature-block-img--active{opacity:1;transform:scale(1);}
.feature-block-img--exiting{opacity:0;transform:scale(.97);}
.feature-block-img-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(5,46,22,.12) 0%,transparent 60%);pointer-events:none;}
.feature-block-dots{display:flex;justify-content:center;gap:.5rem;margin-top:1rem;}
.feature-block-dot{width:.55rem;height:.55rem;border-radius:50%;border:none;cursor:pointer;background:#d0e3d0;transition:all .3s ease;padding:0;}
.feature-block-dot.active{background:#15803d;transform:scale(1.3);}
.feature-block-body{display:flex;flex-direction:column;justify-content:center;}
.feature-block-body-inner{max-width:480px;}
.feature-block-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.6rem,2.8vw,2.2rem);font-weight:700;color:#14532d;line-height:1.2;margin-bottom:1.1rem;}
.feature-block-divider{width:3.5rem;height:.2rem;background:linear-gradient(90deg,#15803d,#22c55e);border-radius:99px;margin-bottom:1.25rem;}
.feature-block-desc{font-family:'Inter',sans-serif;font-size:clamp(.88rem,1.2vw,1rem);color:#5A7A5A;line-height:1.75;margin-bottom:1.25rem;}
.feature-block-bullets{list-style:none;padding:0;margin:0 0 1.75rem;display:flex;flex-direction:column;gap:.7rem;}
.feature-block-bullets li{display:flex;align-items:center;gap:.65rem;font-family:'Inter',sans-serif;font-size:.88rem;color:#3F5C3F;font-weight:500;}
.feature-block-bullet-mark{width:.45rem;height:.45rem;border-radius:50%;background:#15803d;flex-shrink:0;}
.feature-block-cta{display:inline-flex;align-items:center;gap:.5rem;font-family:'Inter',sans-serif;font-size:.88rem;font-weight:700;color:#fff;padding:.8rem 1.6rem;border-radius:99px;background:linear-gradient(135deg,#15803d,#059669);text-decoration:none;box-shadow:0 4px 16px rgba(21,128,61,.3);transition:all .25s ease;width:fit-content;}
.feature-block-cta:hover{box-shadow:0 8px 28px rgba(21,128,61,.45);transform:translateY(-1px);}
@media(max-width:900px){.feature-block{grid-template-columns:1fr;}.feature-block--reverse{direction:ltr;}}

/* Section headers */
.home-section-eyebrow{font-family:'Inter',sans-serif;font-size:.68rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#16a34a;margin-bottom:.75rem;display:block;}
.home-section-title-serif{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:800;color:#14532d;line-height:1.1;margin-bottom:.85rem;}
.home-section-subtitle-new{font-family:'Inter',sans-serif;font-size:clamp(.88rem,1.3vw,1rem);color:#5A7A5A;line-height:1.65;max-width:580px;}

/* Video modal */
.vmodal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:1rem;}
.vmodal-container{position:relative;width:100%;max-width:900px;background:#0a0a0a;border-radius:1.5rem;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.5);}
.vmodal-close{position:absolute;top:.75rem;right:.75rem;z-index:20;width:2.5rem;height:2.5rem;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);backdrop-filter:blur(8px);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.vmodal-close:hover{background:rgba(255,255,255,.15);transform:scale(1.1);}
.vmodal-video-area{position:relative;width:100%;aspect-ratio:16/9;background:#000;}
.vmodal-yt-player{width:100%;height:100%;}
.vmodal-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;color:rgba(255,255,255,.7);font-family:'Inter',sans-serif;font-size:.85rem;}
.vmodal-loading-spinner{width:2.5rem;height:2.5rem;border:2.5px solid rgba(255,255,255,.1);border-top-color:#16a34a;border-radius:50%;animation:vModalSpin .8s linear infinite;}
@keyframes vModalSpin{to{transform:rotate(360deg)}}
.vmodal-error-state{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;color:#fff;font-family:'Inter',sans-serif;}
.vmodal-error-title{font-size:1rem;font-weight:700;margin-bottom:.25rem;}
.vmodal-error-actions{display:flex;gap:.75rem;}
.vmodal-error-retry,.vmodal-error-skip{display:flex;align-items:center;gap:.35rem;padding:.55rem 1.1rem;border-radius:.75rem;border:none;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;}
.vmodal-error-retry{background:#16a34a;color:#fff;}
.vmodal-error-skip{background:rgba(255,255,255,.1);color:#fff;}
.vmodal-controls{padding:.85rem 1.25rem;background:#111;}
.vmodal-controls-row{display:flex;align-items:center;gap:.75rem;}
.vmodal-controls-left{display:flex;align-items:center;gap:.35rem;}
.vmodal-btn{width:2.25rem;height:2.25rem;border-radius:50%;border:none;background:rgba(255,255,255,.08);color:rgba(255,255,255,.8);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.vmodal-btn:hover,.vmodal-btn.active{background:#16a34a;color:#fff;}
.vmodal-btn--play{width:2.75rem;height:2.75rem;background:#16a34a;color:#fff;}
.vmodal-track-info{flex:1;display:flex;flex-direction:column;gap:.1rem;overflow:hidden;}
.vmodal-track-title{font-family:'Inter',sans-serif;font-size:.82rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.vmodal-track-sub{font-family:'Inter',sans-serif;font-size:.7rem;color:rgba(255,255,255,.5);}
.vmodal-playlist{background:#0d0d0d;border-top:1px solid rgba(255,255,255,.06);max-height:220px;overflow-y:auto;}
.vmodal-playlist-header{display:flex;align-items:center;gap:.45rem;padding:.75rem 1.25rem;font-family:'Inter',sans-serif;font-size:.75rem;font-weight:700;color:rgba(255,255,255,.5);border-bottom:1px solid rgba(255,255,255,.06);}
.vmodal-playlist-item{width:100%;display:flex;align-items:center;gap:.75rem;padding:.65rem 1.25rem;border:none;background:none;cursor:pointer;transition:background .2s;}
.vmodal-playlist-item:hover,.vmodal-playlist-item.active{background:rgba(22,163,74,.1);}
.vmodal-playlist-thumb{width:3rem;height:3rem;border-radius:.5rem;overflow:hidden;position:relative;flex-shrink:0;}
.vmodal-playlist-thumb img{width:100%;height:100%;object-fit:cover;}
.vmodal-playlist-playing{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;gap:2px;}
.vmodal-playlist-playing span{width:3px;height:12px;background:#22c55e;border-radius:2px;animation:vModalBars .8s ease-in-out infinite alternate;}
.vmodal-playlist-playing span:nth-child(2){animation-delay:.2s;}
.vmodal-playlist-playing span:nth-child(3){animation-delay:.4s;}
@keyframes vModalBars{from{transform:scaleY(.4)}to{transform:scaleY(1)}}
.vmodal-playlist-meta{flex:1;text-align:left;}
.vmodal-playlist-name{font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;color:#fff;display:block;}
.vmodal-playlist-desc{font-family:'Inter',sans-serif;font-size:.68rem;color:rgba(255,255,255,.45);display:block;margin-top:.1rem;}
.vmodal-playlist-num{font-family:'Inter',sans-serif;font-size:.65rem;color:rgba(255,255,255,.3);font-weight:700;}

/* Why grid responsive */
@media(max-width:900px){.why-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:600px){.why-grid{grid-template-columns:1fr;}}
`;

let homeStylesInjected = false;
function injectHomeStyles() {
  if (homeStylesInjected || typeof document === "undefined") return;
  if (document.getElementById("home-pkg-styles")) { homeStylesInjected = true; return; }
  const s = document.createElement("style");
  s.id = "home-pkg-styles";
  s.textContent = HOME_PKG_STYLES;
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
  { src: "https://i.pinimg.com/736x/8b/8b/61/8b8b61c3e5aa4d7e96b4bc15e26aba78.jpg", alt: "African Culture" },
  { src: "https://i.pinimg.com/1200x/33/b4/bc/33b4bc7083952ab04349188419bbcdcb.jpg", alt: "Safari Landscape" },
];

/* ═══════════════════════════════════════════
   WHY ALTUVERA DATA
═══════════════════════════════════════════ */
const WHY_CARDS = [
  {
    id: 1,
    title: "Expert Local Guides",
    description: "Our guides are born and raised in the regions they lead. Decades of field experience, wildlife knowledge, and cultural fluency turn every game drive into a master class.",
    tags: ["Certified", "Multilingual", "Wildlife Experts"],
    badge: "Top Rated",
    badgeIcon: "⭐",
    image: "https://i.pinimg.com/736x/f3/8e/5d/f38e5ddcc6677a39515284b5c2c7a2e4.jpg",
    footer: "Guided by Altuvera Pros",
    link: "/team",
    ctaLabel: "Meet the Team",
    iconType: "compass",
  },
  {
    id: 2,
    title: "Sustainable Safari Practices",
    description: "Every journey we design actively protects the ecosystems you visit. From carbon offset programs to direct community investment, we travel with purpose.",
    tags: ["Eco-Certified", "Carbon Offset", "Community Impact"],
    badge: "Eco",
    badgeIcon: "🌿",
    image: "https://i.pinimg.com/1200x/33/7b/76/337b768498fe758d5146b5b0fcbac0ad.jpg",
    footer: "Conservation First",
    link: "/about#mission",
    ctaLabel: "Our Mission",
    iconType: "leaf",
  },
  {
    id: 3,
    title: "Fully Tailored Itineraries",
    description: "No two travelers are alike. We craft each journey from scratch — adjusting pacing, accommodations, and experiences to match your exact vision and travel style.",
    tags: ["Bespoke", "Flexible", "Curated"],
    badge: "Custom",
    badgeIcon: "✦",
    image: "https://i.pinimg.com/1200x/48/c9/f7/48c9f7d212a4a2933b84ec65c19e4628.jpg",
    footer: "Your Journey, Your Rules",
    link: "/packages",
    ctaLabel: "View Packages",
    iconType: "map",
  },
  {
    id: 4,
    title: "Authentic Cultural Immersion",
    description: "Beyond wildlife — we connect you with the people who define these landscapes. Share meals with Maasai elders, visit gorilla conservation projects, witness living traditions.",
    tags: ["Cultural", "Authentic", "Immersive"],
    badge: "Unique",
    badgeIcon: "🏛",
    image: "https://i.pinimg.com/736x/4a/9d/29/4a9d29a741657c485053b0883aa0df29.jpg",
    footer: "Real Connections",
    link: "/destinations",
    ctaLabel: "Explore",
    iconType: "heart",
  },
  {
    id: 5,
    title: "Seamless End-to-End Service",
    description: "From your first enquiry to your final transfer home, our team is with you every step. 24/7 in-country support means no detail goes unmanaged.",
    tags: ["24/7 Support", "Logistics", "Hassle-Free"],
    badge: "Premium",
    badgeIcon: "💎",
    image: "https://i.pinimg.com/1200x/f0/33/77/f033774e32b1ba127ac4b4e6900b89af.jpg",
    footer: "Always by Your Side",
    link: "/contact",
    ctaLabel: "Contact Us",
    iconType: "shield",
  },
  {
    id: 6,
    title: "Award-Winning Experiences",
    description: "Recognised by travellers and industry bodies alike for excellence in responsible tourism. Our track record speaks through the stories our guests share.",
    tags: ["Award-Winning", "5-Star Rated", "Trusted"],
    badge: "Best in Class",
    badgeIcon: "🏆",
    image: "https://i.pinimg.com/736x/52/a6/89/52a689bd83f6a3a1c2dd75e822b70f39.jpg",
    footer: "Recognised Excellence",
    link: "/about",
    ctaLabel: "Learn More",
    iconType: "star",
  },
];

/* SVG icons for why cards */
const WhyCardIcon = ({ type, size = 52 }) => {
  const icons = {
    compass: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>
    ),
    leaf: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    map: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
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
    return () => {
      clearTimeout(t);
      if (playerRef.current) { try { playerRef.current.destroy(); } catch { } playerRef.current = null; }
    };
  }, [isOpen, currentIdx, playlist]);

  const playNext = useCallback(() => setCurrentIdx((p) => (p + 1) % playlist.length), [playlist.length]);
  const playPrev = useCallback(() => setCurrentIdx((p) => (p - 1 + playlist.length) % playlist.length), [playlist.length]);

  if (!isOpen) return null;
  const current = playlist[currentIdx];

  return (
    <div className="vmodal-overlay" onClick={onClose}>
      <div className="vmodal-container" onClick={(e) => e.stopPropagation()}>
        <button className="vmodal-close" onClick={onClose}><MdClose size={22} /></button>
        <div className="vmodal-video-area">
          {videoError ? (
            <div className="vmodal-error-state">
              <h3 className="vmodal-error-title">Unable to Play Video</h3>
              <div className="vmodal-error-actions">
                <button className="vmodal-error-retry" onClick={() => setVideoError(false)}><MdPlayArrow size={18} /> Retry</button>
                {playlist.length > 1 && <button className="vmodal-error-skip" onClick={playNext}><MdSkipNext size={18} /> Next</button>}
              </div>
            </div>
          ) : (<div ref={containerRef} className="vmodal-yt-player" />)}
          {!videoError && !isReady && (
            <div className="vmodal-loading">
              <div className="vmodal-loading-spinner" />
              <p>Loading video…</p>
            </div>
          )}
        </div>
        <div className="vmodal-controls">
          <div className="vmodal-controls-row">
            <div className="vmodal-controls-left">
              <button className="vmodal-btn" onClick={playPrev}><MdSkipPrevious size={22} /></button>
              <button className="vmodal-btn vmodal-btn--play" onClick={() => {
                if (!playerRef.current || !window.YT) return;
                const s = playerRef.current.getPlayerState();
                s === window.YT.PlayerState.PLAYING ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
              }}><MdPlayArrow size={22} /></button>
              <button className="vmodal-btn" onClick={playNext}><MdSkipNext size={22} /></button>
            </div>
            <div className="vmodal-track-info">
              <span className="vmodal-track-title">{current.title}</span>
              <span className="vmodal-track-sub">{current.subtitle}</span>
            </div>
            <button className={`vmodal-btn ${showPlaylist ? "active" : ""}`} onClick={() => setShowPlaylist((p) => !p)}>
              <MdPlaylistPlay size={22} />
            </button>
          </div>
        </div>
        {showPlaylist && (
          <div className="vmodal-playlist">
            <div className="vmodal-playlist-header"><MdPlaylistPlay size={18} /><span>Playlist ({playlist.length})</span></div>
            {playlist.map((item, i) => (
              <button key={item.id} className={`vmodal-playlist-item ${i === currentIdx ? "active" : ""}`}
                onClick={() => { setCurrentIdx(i); setVideoError(false); }}>
                <div className="vmodal-playlist-thumb">
                  <img src={item.poster} alt={item.title} />
                  {i === currentIdx && isReady && (
                    <div className="vmodal-playlist-playing"><span /><span /><span /></div>
                  )}
                </div>
                <div className="vmodal-playlist-meta">
                  <span className="vmodal-playlist-name">{item.title}</span>
                  <span className="vmodal-playlist-desc">{item.subtitle}</span>
                </div>
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
    setIsReady(false);
    setVideoError(false);

    const destroyPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };

    const init = () => {
      if (!containerRef.current || !window.YT) return;
      destroyPlayer();
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: "100%",
          width: "100%",
          videoId: playlist[currentIdx]?.videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            enablejsapi: 1,
            playsinline: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
          },
          events: {
            onReady: () => setIsReady(true),
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                setCurrentIdx((p) => (p + 1) % playlist.length);
              }
            },
            onError: () => setVideoError(true),
          },
        });
      } catch {
        setVideoError(true);
      }
    };

    let timeoutId;
    if (window.YT) {
      timeoutId = setTimeout(init, 300);
    } else if (window._ytApiReadyCb) {
      window._ytApiReadyCb.push(() => { timeoutId = setTimeout(init, 300); });
    }

    return () => {
      clearTimeout(timeoutId);
      destroyPlayer();
    };
  }, [currentIdx, playlist]);

  const current = playlist[currentIdx];

  return (
    <div className="intro-yt-bg">
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
  const fv = VIDEO_PLAYLIST[0];
  return (
    <>
      <div className="intro-media-panel">
        <div className="intro-main-card">
          <InlineVideoPlayer playlist={VIDEO_PLAYLIST} startIndex={0} />
          <div className="intro-main-card-overlay" />
          <div className="intro-main-card-label">
            <span className="intro-main-card-badge">▶ Watch Reel</span>
            <h3 className="intro-main-card-title">{fv?.title}</h3>
            <p className="intro-main-card-sub">{fv?.subtitle}</p>
          </div>
        </div>
        <div className="intro-side-col">
          {INTRO_SIDE_IMAGES.map((img, i) => (
            <div key={i} className="intro-side-card">
              <img src={img.src} alt={img.alt} className="intro-side-card-img" />
              <div className="intro-side-card-overlay" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════
   DESTINATION MODAL
═══════════════════════════════════════════ */
const DestinationModal = ({ destination, isOpen, onClose, isWishlisted, onWishlistToggle }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen || !destination) return null;

  const name = destination?.name || destination?.title || "Destination";
  const country = (typeof destination?.country === "object" && destination.country?.name)
    || destination?.countryObj?.name
    || (typeof destination?.country === "string" ? destination.country : "") || "";
  const description = destination?.description || destination?.shortDescription
    || destination?.excerpt || "Discover this breathtaking destination.";
  const img = destination?.heroImage || destination?.imageUrl || destination?.image_url
    || destination?.image
    || (Array.isArray(destination?.images) ? destination.images[0] : "")
    || (Array.isArray(destination?.gallery) ? destination.gallery[0]?.imageUrl : "");
  const slug = destination?.slug || destination?.id || destination?._id;
  const rating = destination?.rating || destination?.averageRating || 0;
  const price = destination?.price || destination?.startingPrice || null;
  const duration = destination?.duration || destination?.tripDuration || null;
  const category = destination?.category || destination?.type || "";
  const highlights = destination?.highlights || destination?.features || [];

  return (
    <div className="dest-modal-overlay" onClick={onClose}>
      <div className="dest-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="dest-modal-close" onClick={onClose}><MdClose /></button>
        <div className="dest-modal-image-section">
          {img ? <img src={img} alt={name} className="dest-modal-image" /> : (
            <div className="dest-modal-image-placeholder"><IoCompassOutline /></div>
          )}
          <div className="dest-modal-image-overlay" />
          <div className="dest-modal-image-badges">
            {category && <span className="dest-modal-badge">{category}</span>}
            {price && <span className="dest-modal-badge dest-modal-badge--price">From ${typeof price === "number" ? price.toLocaleString() : price}</span>}
          </div>
          <button className={`dest-modal-wishlist ${isWishlisted ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(destination?._id || destination?.id || destination?.slug); }}>
            {isWishlisted ? <IoHeart /> : <IoHeartOutline />}
          </button>
          <div className="dest-modal-image-content">
            <h2 className="dest-modal-name">{name}</h2>
            {country && <span className="dest-modal-location"><MdOutlineLocationOn /> {country}</span>}
          </div>
        </div>
        <div className="dest-modal-body">
          {rating > 0 && (
            <div className="dest-modal-rating">
              {Array.from({ length: 5 }).map((_, i) =>
                i < Math.round(rating)
                  ? <FaStar key={i} className="dest-modal-star filled" />
                  : <FaRegStar key={i} className="dest-modal-star" />
              )}
              <span className="dest-modal-rating-text">{rating.toFixed(1)}</span>
            </div>
          )}
          {duration && <div className="dest-modal-duration"><MdOutlineExplore /><span>{duration}</span></div>}
          <p className="dest-modal-description">
            {description.length > 280 ? description.substring(0, 280) + "…" : description}
          </p>
          {highlights.length > 0 && (
            <div className="dest-modal-highlights">
              <h4>Highlights</h4>
              <ul>
                {highlights.slice(0, 4).map((h, i) => (
                  <li key={i}><span className="dest-modal-highlight-dot" />{typeof h === "string" ? h : h.text || h.title || ""}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="dest-modal-actions">
            <button className="dest-modal-cta" onClick={() => { onClose(); if (slug) navigate(`/destinations/${slug}`); }}>
              <span>Explore Destination</span><HiOutlineArrowRight />
            </button>
          </div>
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
  const containerRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCardsPerView(1);
      else if (w < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, destinations.length - cardsPerView);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  const goTo = useCallback((idx) => setCurrentIndex(Math.max(0, Math.min(idx, maxIndex))), [maxIndex]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  useEffect(() => {
    const h = (e) => {
      if (modalOpen) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goPrev, goNext, modalOpen]);

  const cardWidthPct = 100 / cardsPerView;
  const totalDots = maxIndex + 1;

  const getName = (d) => d?.name || d?.title || "Destination";
  const getCountry = (d) => (typeof d?.country === "object" && d.country?.name)
    || d?.countryObj?.name
    || (typeof d?.country === "string" ? d.country : "") || "";
  const getImage = (d) => d?.heroImage || d?.imageUrl || d?.image_url || d?.image
    || (Array.isArray(d?.images) ? d.images[0] : "")
    || (Array.isArray(d?.gallery) ? d.gallery[0]?.imageUrl : "");
  const getCategory = (d) => d?.category || d?.type || "";

  if (!destinations.length) return null;

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <button className="dest-arr dest-arr--left" onClick={goPrev} disabled={!canPrev}
        style={{ opacity: canPrev ? 1 : 0.3, pointerEvents: canPrev ? "auto" : "none" }}>
        <FiChevronLeft size={22} />
      </button>
      <button className="dest-arr dest-arr--right" onClick={goNext} disabled={!canNext}
        style={{ opacity: canNext ? 1 : 0.3, pointerEvents: canNext ? "auto" : "none" }}>
        <FiChevronRight size={22} />
      </button>
      <div className="dest-slideshow-wrap" style={{ padding: "0 3.5rem" }}>
        <div ref={trackRef} className="dest-slideshow-track"
          style={{ transform: `translateX(-${currentIndex * cardWidthPct}%)` }}>
          {destinations.map((dest, idx) => {
            const name = getName(dest);
            const country = getCountry(dest);
            const img = getImage(dest);
            const category = getCategory(dest);
            return (
              <div key={dest?._id || dest?.slug || idx} className="dest-slide-card"
                style={{ width: `calc(${cardWidthPct}% - 1rem)`, height: "420px", margin: "0 0.5rem" }}
                onClick={() => { setSelectedDest(dest); setModalOpen(true); }}
                role="button" tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setSelectedDest(dest), setModalOpen(true))}>
                {img ? (
                  <img src={img} alt={name} className="dest-slide-img" loading="lazy" />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#14532d,#166534)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IoEarthOutline size={64} style={{ color: "rgba(255,255,255,.3)" }} />
                  </div>
                )}
                <div className="dest-slide-gradient" />
                <span className="dest-slide-num">{String(idx + 1).padStart(2, "0")}</span>
                <div className="dest-slide-content">
                  {category && <span className="dest-slide-tag">{category}</span>}
                  <h3 className="dest-slide-name">{name}</h3>
                  {country && <div className="dest-slide-country"><FiMapPin size={12} />{country}</div>}
                  <div className="dest-slide-cta">Discover <HiOutlineArrowRight size={13} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {totalDots > 1 && (
        <div className="dest-dots">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button key={i} className={`dest-dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => goTo(i)} />
          ))}
        </div>
      )}
      <DestinationModal
        destination={selectedDest} isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedDest(null); }}
        isWishlisted={selectedDest ? isWishlisted(selectedDest?._id || selectedDest?.id || selectedDest?.slug) : false}
        onWishlistToggle={onWishlistToggle}
      />
    </div>
  );
};

const DestSlideshowSkeleton = () => (
  <div style={{ display: "flex", gap: "1rem", padding: "0 3.5rem" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ flex: "1", height: "420px", borderRadius: "1.75rem", background: "linear-gradient(135deg,#e2e8f0,#f1f5f9)", animation: "hSkeletonPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   WHY ALTUVERA CARD COMPONENT
═══════════════════════════════════════════ */
const WhyCard = ({ card, index }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={card.link}
      className="why-card mixed-card-reveal"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={card.ctaLabel}
    >
      {/* Image / Icon top area */}
      <div className="why-card-img-wrap">
        {!imgError && card.image ? (
          <img
            src={card.image}
            alt={card.title}
            className="why-card-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="why-card-icon-wrap">
            <div className="why-card-icon">
              <WhyCardIcon type={card.iconType} size={56} />
            </div>
          </div>
        )}
        {/* ECO / type badge */}
        <div className="why-card-eco-badge">
          <span>{card.badgeIcon}</span>
          <span>{card.badge}</span>
        </div>
      </div>

      {/* Body */}
      <div className="why-card-body">
        <h3 className="why-card-title">{card.title}</h3>
        <p className="why-card-desc">{card.description}</p>
        <div className="why-card-tags">
          {card.tags.map((tag, i) => (
            <span key={i} className="why-card-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="why-card-footer">
        <div className="why-card-footer-left">
          <div className="why-card-footer-avatar">
            {card.footer.charAt(0)}
          </div>
          <span style={{ fontWeight: 600, fontSize: ".75rem" }}>{card.footer}</span>
        </div>
        <span className="why-card-cta">
          {card.ctaLabel}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════
   FEATURE BLOCK (Country Sections)
═══════════════════════════════════════════ */
const FeatureBlock = ({ data, index }) => {
  const reverse = index % 2 === 1;
  const [curImg, setCurImg] = useState(0);
  const [isT, setT] = useState(false);

  useEffect(() => {
    if (!data.images || data.images.length <= 1) return;
    const iv = setInterval(() => {
      setT(true);
      setTimeout(() => { setCurImg((p) => (p + 1) % data.images.length); setT(false); }, 600);
    }, 5000);
    return () => clearInterval(iv);
  }, [data.images]);

  return (
    <section className={`feature-block ${reverse ? "feature-block--reverse" : ""}`}>
      <div className="feature-block-media">
        <div className="feature-block-img-wrap">
          {data.images.map((src, i) => (
            <img key={i} src={src} alt={`${data.title} ${i + 1}`}
              className={`feature-block-img ${i === curImg ? "feature-block-img--active" : ""} ${isT && i === curImg ? "feature-block-img--exiting" : ""}`}
              loading="lazy"
            />
          ))}
          <div className="feature-block-img-overlay" />
        </div>
        {data.images.length > 1 && (
          <div className="feature-block-dots">
            {data.images.map((_, i) => (
              <button key={i} className={`feature-block-dot ${i === curImg ? "active" : ""}`}
                onClick={() => { setT(false); setCurImg(i); }} />
            ))}
          </div>
        )}
      </div>
      <div className="feature-block-body">
        <div className="feature-block-body-inner">
          <h3 className="feature-block-title">{data.title}</h3>
          <div className="feature-block-divider" />
          <p className="feature-block-desc">{data.descriptions ? data.descriptions[0] : data.description}</p>
          {data.bullets && (
            <ul className="feature-block-bullets">
              {data.bullets.map((b, i) => (
                <li key={i}><span className="feature-block-bullet-mark" /><span>{b}</span></li>
              ))}
            </ul>
          )}
          <Link to={data.link} className="feature-block-cta">
            <span>{data.ctaLabel}</span><HiOutlineArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   TESTIMONIAL SECTION
═══════════════════════════════════════════ */
const TestimonialCard = ({ slide }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="htestimonial-card"
      style={{
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 20px 52px rgba(22,163,74,.12)" : "0 2px 16px rgba(0,0,0,.04)",
        borderColor: hovered ? "#BBF7D0" : "#DCFCE7",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="htestimonial-card-glyph">&ldquo;</div>
      <div className="htestimonial-stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`htestimonial-star ${i < (slide.rating || 5) ? "filled" : ""}`}>★</span>
        ))}
      </div>
      <p className="htestimonial-quote">&ldquo;{slide.quote}&rdquo;</p>
      <div className="htestimonial-person">
        {slide.image ? (
          <img src={slide.image} alt={slide.name} className="htestimonial-avatar" />
        ) : (
          <div className="htestimonial-avatar-init">{(slide.name || "T")[0]}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="htestimonial-name">{slide.name}</div>
          {slide.meta && <div className="htestimonial-meta">{slide.meta}</div>}
        </div>
        {slide.trip && <span className="htestimonial-trip-badge">{slide.trip}</span>}
      </div>
    </div>
  );
};

const TestimonialSection = () => {
  const { testimonials, loading } = useFeaturedTestimonials(6);

  const slides = useMemo(() => {
    if (loading) return [];
    return testimonials.map((t) => ({
      id: t.id, name: t.name, trip: t.trip,
      meta: [t.location, t.date_text].filter(Boolean).join(" · "),
      image: t.avatar_url || null,
      rating: parseInt(t.rating) || 5,
      quote: t.testimonial_text,
    }));
  }, [testimonials, loading]);

  return (
    <section className="htestimonial-section">
      <div className="home-container">
        <div className="htestimonial-header">
          <span className="htestimonial-eyebrow">Guest Experiences</span>
          <h2 className="htestimonial-title">Voices From the Field</h2>
          <p className="htestimonial-subtitle">
            Real stories from real travellers — people whose lives were quietly, profoundly changed
            by the places they visited and the moments they couldn't have planned.
          </p>
        </div>
        {loading ? (
          <div className="htestimonial-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="htestimonial-skeleton" style={{ height: 260 }}>
                <div style={{ height: 14, width: "45%", background: "#BBF7D0", borderRadius: 6, marginBottom: 16 }} />
                <div style={{ height: 10, width: "95%", background: "#DCFCE7", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 10, width: "80%", background: "#DCFCE7", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 10, width: "65%", background: "#DCFCE7", borderRadius: 4, marginBottom: 24 }} />
                <div style={{ height: 40, display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #F0FDF4", paddingTop: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#BBF7D0" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, width: "50%", background: "#DCFCE7", borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 10, width: "35%", background: "#F0FDF4", borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : slides.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#7A9E7A", fontFamily: "'Inter',sans-serif" }}>
            <p style={{ fontWeight: 600, color: "#14532d" }}>No reviews yet</p>
            <p style={{ fontSize: ".88rem" }}>Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="htestimonial-grid">
            {slides.map((slide, i) => <TestimonialCard key={slide.id || i} slide={slide} />)}
          </div>
        )}
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
    <Link to={`/packages/${pkg.slug || pkg.id}`} className="hpkg-card mixed-card-reveal" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="hpkg-img-wrap">
        {cover ? (
          <img src={cover} alt={pkg.title} className="hpkg-img" loading="lazy" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(145deg,${accent}33,${accent}77)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={40} style={{ color: accent, opacity: 0.4 }} />
          </div>
        )}
        <div className="hpkg-img-gradient" />
        {pkg.badge_label ? (
          <span className="hpkg-badge" style={{ backgroundColor: pkg.badge_color || accent }}>{pkg.badge_label}</span>
        ) : pkg.is_featured && (
          <span className="hpkg-badge" style={{ backgroundColor: "#f59e0b" }}>Featured</span>
        )}
        {hasDisc && <span className="hpkg-discount">-{pkg.discount_percent}% OFF</span>}
        {!hasDisc && (
          <button className="hpkg-wish" onClick={handleWish}>
            <Heart size={14} style={{ fill: isWish ? "#ef4444" : "none", color: isWish ? "#ef4444" : "#64748b" }} />
          </button>
        )}
        {pkg.duration_days && (
          <div className="hpkg-duration-pill">
            <Clock size={10} />{fmtDuration(pkg.duration_days, pkg.duration_nights)}
          </div>
        )}
        {pkg.is_sold_out && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: ".75rem", letterSpacing: ".1em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,.4)", padding: ".4rem 1rem", borderRadius: "99px", backdropFilter: "blur(6px)" }}>Sold Out</span>
          </div>
        )}
      </div>
      <div className="hpkg-body">
        {pkg.category && <span className="hpkg-category">{pkg.category}</span>}
        <h3 className="hpkg-title">{pkg.title}</h3>
        {/* Meta — location only, no group size */}
        <div className="hpkg-meta">
          {(pkg.destination || pkg.country) && (
            <span className="hpkg-meta-item">
              <MapPin size={10} style={{ color: "#059669", flexShrink: 0 }} />
              {[pkg.destination, pkg.country].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
        {pkg.short_description && <p className="hpkg-desc">{pkg.short_description}</p>}
        {feats.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
            {feats.map((f, i) => (
              <span key={i} style={{ fontSize: ".65rem", fontWeight: 700, padding: ".2rem .6rem", borderRadius: "99px", background: `${accent}15`, color: accent, border: `1px solid ${accent}30`, fontFamily: "'Inter',sans-serif" }}>{f}</span>
            ))}
          </div>
        )}
        <div className="hpkg-footer">
          <div>
            {hasDisc && (() => {
              const orig = Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100);
              return <p style={{ fontSize: ".7rem", color: "#94a3b8", textDecoration: "line-through", lineHeight: 1, marginBottom: ".15rem", fontFamily: "'Inter',sans-serif" }}>{fmtPrice(orig, pkg.currency)}</p>;
            })()}
            <p className="hpkg-price" style={{ color: accent }}>{pkg.is_price_visible !== false ? fmtPrice(pkg.price, pkg.currency) : "POA"}</p>
            <p className="hpkg-price-label">{pkg.price_label || "per person"}</p>
          </div>
          <span className="hpkg-cta">Explore <ArrowRight size={12} /></span>
        </div>
      </div>
    </Link>
  );
});

const HorizontalPostCard = React.memo(function HorizontalPostCard({ post, index }) {
  const date = post.published_at || post.created_at;
  const formatted = date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <Link to={`/blog/${post.slug}`} className="hpost-card mixed-card-reveal" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="hpost-img-wrap">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="hpost-img" loading="lazy" />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#e2e8f0,#f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MdOutlineArticle size={36} style={{ color: "#94a3b8" }} />
          </div>
        )}
        {post.category && <span className="hpost-category">{post.category}</span>}
      </div>
      <div className="hpost-body">
        <div className="hpost-meta">
          {formatted && <span style={{ display: "flex", alignItems: "center", gap: ".2rem" }}><MdOutlineDateRange size={11} /> {formatted}</span>}
          {post.read_time > 0 && <span>· {post.read_time} min</span>}
          {post.view_count > 0 && <span style={{ display: "flex", alignItems: "center", gap: ".2rem" }}><MdOutlineVisibility size={11} /> {post.view_count}</span>}
        </div>
        <h3 className="hpost-title">{post.title}</h3>
        {post.excerpt && <p className="hpost-excerpt">{post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + "…" : post.excerpt}</p>}
        <span className="hpost-readmore">Read article <HiOutlineArrowRight size={13} /></span>
      </div>
    </Link>
  );
});

const PackageSkeleton = () => (
  <div className="hpkg-skeleton">
    <div className="h-skel" style={{ height: 190 }} />
    <div style={{ padding: "1.1rem 1.2rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
      <div className="h-skel" style={{ height: 10, width: "40%" }} />
      <div className="h-skel" style={{ height: 18, width: "85%" }} />
      <div className="h-skel" style={{ height: 10, width: "60%" }} />
      <div className="h-skel" style={{ height: 32, width: "100%" }} />
      <div style={{ display: "flex", gap: ".5rem" }}>
        <div className="h-skel" style={{ height: 22, width: 60, borderRadius: 99 }} />
        <div className="h-skel" style={{ height: 22, width: 50, borderRadius: 99 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: ".5rem", borderTop: "1px solid #f1f5f9" }}>
        <div className="h-skel" style={{ height: 28, width: 80 }} />
        <div className="h-skel" style={{ height: 34, width: 90, borderRadius: 10 }} />
      </div>
    </div>
  </div>
);

const PostSkeleton = () => (
  <div className="hpost-skeleton">
    <div className="h-skel" style={{ height: 170 }} />
    <div style={{ padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: ".65rem" }}>
      <div className="h-skel" style={{ height: 10, width: "50%" }} />
      <div className="h-skel" style={{ height: 16, width: "90%" }} />
      <div className="h-skel" style={{ height: 14, width: "70%" }} />
      <div className="h-skel" style={{ height: 28, width: "100%" }} />
      <div className="h-skel" style={{ height: 12, width: "40%" }} />
    </div>
  </div>
);

const MixedScrollRow = ({ packages, posts, loadingPkgs, loadingPosts, wishlist, onWishlist }) => {
  const rowRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const items = useMemo(() => {
    const result = [];
    const pkgs = packages.slice(0, 12);
    const strs = posts.slice(0, 6);
    let pi = 0, si = 0;
    while (pi < pkgs.length || si < strs.length) {
      for (let k = 0; k < 2 && pi < pkgs.length; k++, pi++) result.push({ type: "pkg", data: pkgs[pi], idx: pi });
      if (si < strs.length) { result.push({ type: "post", data: strs[si], idx: si }); si++; }
    }
    return result;
  }, [packages, posts]);

  const updateScrollState = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pct = max > 0 ? el.scrollLeft / max : 0;
    setScrollProgress(pct * 100);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState, items]);

  const scroll = useCallback((dir) => {
    rowRef.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  }, []);

  const isLoading = loadingPkgs || loadingPosts;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: ".75rem" }}>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <Link to="/packages" style={{ fontSize: ".78rem", fontWeight: 700, color: "#15803d", textDecoration: "none", display: "flex", alignItems: "center", gap: ".3rem", padding: ".4rem .85rem", border: "1.5px solid rgba(21,128,61,.25)", borderRadius: "99px", background: "rgba(21,128,61,.05)", fontFamily: "'Inter',sans-serif" }}>
            All Packages <ArrowRight size={12} />
          </Link>
          <Link to="/blog" style={{ fontSize: ".78rem", fontWeight: 700, color: "#6366f1", textDecoration: "none", display: "flex", alignItems: "center", gap: ".3rem", padding: ".4rem .85rem", border: "1.5px solid rgba(99,102,241,.2)", borderRadius: "99px", background: "rgba(99,102,241,.04)", fontFamily: "'Inter',sans-serif" }}>
            All Stories <ArrowRight size={12} />
          </Link>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <button className="scroll-nav-btn scroll-nav-btn--left" onClick={() => scroll("left")} disabled={!canLeft}>
          <IoChevronBack size={18} />
        </button>
        <div ref={rowRef} className="mixed-scroll-row" style={{ padding: ".5rem .25rem 1.25rem" }}>
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => i % 3 === 2 ? <PostSkeleton key={i} /> : <PackageSkeleton key={i} />)
            : items.map((item, i) =>
              item.type === "pkg"
                ? <HorizontalPackageCard key={`pkg-${item.data.id || i}`} pkg={item.data} index={i} wishlist={wishlist} onWishlist={onWishlist} />
                : <HorizontalPostCard key={`post-${item.data.id || item.data.slug || i}`} post={item.data} index={i} />
            )
          }
        </div>
        <button className="scroll-nav-btn scroll-nav-btn--right" onClick={() => scroll("right")} disabled={!canRight}>
          <IoChevronForward size={18} />
        </button>
      </div>
      <div className="scroll-progress-bar">
        <div className="scroll-progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>
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
  const [pkgWishlist, setPkgWishlist] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("altuvera_wishlist") || "[]")); }
    catch { return new Set(); }
  });

  useEffect(() => {
    setLoadingPkgs(true);
    apiGet("/packages", { limit: 12, sortBy: "sort_order", order: "asc", is_active: true })
      .then((data) => setPackages(data.data || []))
      .catch(() => setPackages([]))
      .finally(() => setLoadingPkgs(false));
  }, []);

  const handlePkgWishlist = useCallback((id) => {
    setPkgWishlist((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      try { localStorage.setItem("altuvera_wishlist", JSON.stringify([...n])); } catch { }
      return n;
    });
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
    {
      title: "Encounter Mountain Gorillas & Explore the Land of a Thousand Hills",
      description: "Rwanda offers one of Africa's most exclusive wildlife experiences. Trek through the misty forests of Volcanoes National Park to meet endangered mountain gorillas.",
      bullets: ["World-famous mountain gorilla trekking", "Nyungwe Forest canopy walk & chimpanzee tracking", "Big Five safaris in Akagera National Park", "Luxury eco-lodges with expert local guides"],
      ctaLabel: "Explore Rwanda", link: "/country/rwanda",
      images: ["https://i.pinimg.com/736x/8a/3d/69/8a3d695b613a5f68bc14cb3507d7ec9d.jpg", "https://i.pinimg.com/1200x/47/49/a6/4749a673fd707e5f24b78d530ec65265.jpg", "https://i.pinimg.com/736x/46/fe/c8/46fec850388090f1f6bbdd4246b9a049.jpg],"],
    },
    {
      title: "Witness the Great Migration & Conquer Africa's Highest Peak",
      description: "From the endless plains of the Serengeti to the snow-capped summit of Mount Kilimanjaro, Tanzania delivers bucket-list adventures.",
      bullets: ["The Great Wildebeest Migration in Serengeti", "Mount Kilimanjaro climbing expeditions", "Ngorongoro Crater Big Five safaris", "Zanzibar beach escapes & cultural tours"],
      ctaLabel: "Explore Tanzania", link: "/country/tanzania",
      images: ["https://i.pinimg.com/1200x/cc/86/5b/cc865b52a3d1cce78d91e973ba8507da.jpg", "https://i.pinimg.com/736x/3e/f8/62/3ef8623a8cc3a998f5781b1f6e9a6352.jpg", "https://i.pinimg.com/736x/c6/9c/61/c69c61402e05bd6adee85a4bcfcc8bc4.jpg"],
    },
    {
      title: "Experience Legendary Safaris & Coastal Paradise",
      description: "Kenya combines iconic wildlife encounters with spectacular landscapes and pristine Indian Ocean beaches.",
      bullets: ["Maasai Mara Great Migration safaris", "Amboseli elephant encounters with Kilimanjaro views", "Sunrise hot-air balloon adventures", "Diani Beach & Swahili coastal experiences"],
      ctaLabel: "Explore Kenya", link: "/country/kenya",
      images: ["https://i.pinimg.com/736x/b7/0a/30/b70a3053497810dd71c003ce63ab1fd7.jpg"],
    },
  ], []);

  return (
    <div className="home-root">
      <SEO title="Altuvera Travel — True Adventures in High Places & Deep Culture" />
      <Hero />

      {/* ── Intro ── */}
      <section className="home-section intro-section">
        <div className="home-container">
          <div className="intro-layout">
            <div className="intro-text">
              <h2 className="intro-heading">
                Your Gateway to <span className="text-gradient">East Africa</span>
              </h2>
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

      {/* ── Destinations Slideshow ── */}
      <section className="home-section destinations-section" style={{ paddingBottom: "3rem" }}>
        <div className="home-container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="home-section-eyebrow">Where Will You Go?</span>
            <h2 className="home-section-title-serif">
              Handpicked <span style={{ color: "#22c55e" }}>Destinations</span>
            </h2>
            <p className="home-section-subtitle-new" style={{ margin: "0 auto" }}>
              Each place chosen for the stories it holds, the wildlife it shelters,
              and the people who call it home.
            </p>
          </div>
          {destLoading ? <DestSlideshowSkeleton /> : (
            <DestinationSlideshow
              destinations={allDest.slice(0, 12)}
              isWishlisted={(id) => isWishlisted(id)}
              onWishlistToggle={toggleWishlist}
            />
          )}
          <div className="section-cta" style={{ marginTop: "2.5rem" }}>
            <Button to="/destinations" variant="primary" size="large" icon={<HiOutlineArrowRight size={18} />}>
              View All Destinations
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why Altuvera — NEW GREEN CARD DESIGN ── */}
      <section className="why-section">
        <div className="home-container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 className="home-section-title-serif">
              The Altuvera <span style={{ color: "#22c55e" }}>Difference</span>
            </h2>
            <p className="home-section-subtitle-new" style={{ margin: "0 auto" }}>
              Experience the difference that comes with expertise, passion, and an
              unwavering commitment to excellence in every journey we craft.
            </p>
          </div>
          <div className="why-grid">
            {WHY_CARDS.map((card, i) => (
              <WhyCard key={card.id} card={card} index={i} />
            ))}
          </div>
          <div className="section-cta" style={{ marginTop: "2.5rem" }}>
            <Button to="/about" variant="primary" size="large" icon={<HiOutlineArrowRight size={18} />}>
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>

      {/* ── Feature Blocks ── */}
      <section className="home-section feature-blocks-section" style={{ background: "#F0FDF4" }}>
        <div className="home-container">
          <div className="section-header" style={{ textAlign: "center", paddingTop: "clamp(2rem,4vw,3.5rem)" }}>
            <span className="home-section-eyebrow">The Altuvera Way</span>
            <h2 className="home-section-title-serif">
              The People Who Go{" "}
              <span style={{ color: "#22c55e" }}>Never Quite Come Back</span>{" "}
              the Same
            </h2>
            <p className="home-section-subtitle-new" style={{ margin: "0 auto" }}>
              Every journey we craft is built around a simple truth — the most important
              thing you'll bring home isn't a souvenir.
            </p>
          </div>
        </div>
        <div className="feature-blocks-stack">
          {featureBlocks.map((block, i) => (
            <FeatureBlock key={block.title} data={block} index={i} />
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <TestimonialSection />

      {/* ── Packages & Stories ── */}
      <section className="home-section posts-section">
        <div className="home-container">
          <div className="section-header" style={{ marginBottom: "0.5rem" }}>
            <span className="home-section-eyebrow">Curated For You</span>
            <h2 className="home-section-title-serif">
              Explore Packages &{" "}
              <span style={{ color: "#22c55e" }}>Stories</span>
            </h2>
            <p className="home-section-subtitle-new">
              Curated adventures and field notes — scroll to discover.
            </p>
          </div>
          <MixedScrollRow
            packages={packages}
            posts={posts}
            loadingPkgs={loadingPkgs}
            loadingPosts={postsLoading}
            wishlist={pkgWishlist}
            onWishlist={handlePkgWishlist}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;