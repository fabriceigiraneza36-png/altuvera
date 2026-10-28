// src/components/destinations/DestinationCard.jsx
import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FiMapPin,
  FiClock,
  FiHeart,
  FiThumbsUp,
  FiShare2,
  FiArrowRight,
  FiAward,
  FiTrendingUp,
  FiZap,
  FiCalendar,
  FiWind,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiSun,
  FiCamera,
  FiMail,
  FiMessageCircle,
  FiSend,
  FiCopy,
  FiX,
  FiCheck,
  FiLink,
} from "react-icons/fi";
import { useWishlist } from "../../hooks/useWishlist";
import { API_URL, apiFetch } from "../../utils/apiBase";
import { useDestinationLikes } from "../../hooks/useDestinationLikes";
import { useUserAuth } from "../../context/UserAuthContext";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const BADGE_CFG = {
  isFeatured: { Icon: FiAward,      label: "Featured", cls: "dc-badge--featured" },
  isNew:      { Icon: FiZap,        label: "New",      cls: "dc-badge--new"      },
  isPopular:  { Icon: FiTrendingUp, label: "Trending", cls: "dc-badge--popular"  },
};

const DIFF_CFG = {
  easy:        { cls: "dc-diff--easy",        label: "Easy"        },
  moderate:    { cls: "dc-diff--moderate",    label: "Moderate"    },
  challenging: { cls: "dc-diff--challenging", label: "Challenging" },
  difficult:   { cls: "dc-diff--difficult",   label: "Difficult"   },
  expert:      { cls: "dc-diff--expert",      label: "Expert"      },
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

@keyframes dc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes dc-heart {
  0%   { transform: scale(1); }
  20%  { transform: scale(0.82); }
  45%  { transform: scale(1.32); }
  70%  { transform: scale(0.94); }
  100% { transform: scale(1); }
}
@keyframes dc-arrow {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(5px); }
}
@keyframes dc-toast {
  0%   { opacity: 0; transform: translateY(4px); }
  15%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes dc-badge-in {
  from { opacity: 0; transform: translateY(-5px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dc-spin {
  to { transform: rotate(360deg); }
}

.dc-card {
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 1px 4px rgba(15,23,42,.06);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.4s cubic-bezier(0.22,1,0.36,1),
    box-shadow 0.4s cubic-bezier(0.22,1,0.36,1),
    border-color 0.4s cubic-bezier(0.22,1,0.36,1);
}
.dc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(15,23,42,.12), 0 6px 20px rgba(5,150,105,.10);
  border-color: rgba(5,150,105,0.25);
}
.dc-card:focus-visible {
  outline: 2.5px solid #059669;
  outline-offset: 3px;
}

.dc-img-wrap {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}
.dc-img-frame {
  position: relative;
  width: 100%;
  padding-top: 58%;
  overflow: hidden;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}
.dc-slider {
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: pan-y;
}
.dc-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.9s cubic-bezier(0.22,1,0.36,1);
  will-change: transform;
}
.dc-img {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.03);
  transition: transform 5.5s cubic-bezier(0.25,0,0.15,1);
  will-change: transform;
}
.dc-card:hover .dc-img { transform: scale(1.07); }

.dc-img-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(15,23,42,.18) 0%,
    transparent 30%,
    transparent 52%,
    rgba(15,23,42,.65) 100%
  );
  z-index: 1;
}

.dc-img-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #059669;
}
.dc-img-placeholder span {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.65;
}

.dc-nav {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-card:hover .dc-nav { opacity: 1; }

.dc-nav-btn {
  pointer-events: auto;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #334155;
  box-shadow: 0 2px 10px rgba(0,0,0,.12);
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
}
.dc-nav-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.dc-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  align-items: center;
  z-index: 4;
  padding: 3px 8px;
  border-radius: 20px;
  background: rgba(15,23,42,.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dc-dot {
  height: 4px;
  border-radius: 2px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(255,255,255,.4);
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-dot--active {
  width: 18px !important;
  background: #fff;
}

.dc-photo-count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 8px;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: rgba(255,255,255,.9);
  font-size: 10.5px;
  font-weight: 600;
}

.dc-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: dc-badge-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
  white-space: nowrap;
}
.dc-badge--featured {
  background: linear-gradient(135deg, rgba(16,185,129,.9), rgba(5,150,105,.9));
  color: #fff;
  box-shadow: 0 3px 10px rgba(5,150,105,.3);
}
.dc-badge--new {
  background: rgba(255,255,255,.88);
  color: #047857;
  border: 1px solid rgba(167,243,208,.6);
}
.dc-badge--popular {
  background: linear-gradient(135deg, rgba(251,191,36,.9), rgba(245,158,11,.9));
  color: #78350f;
  box-shadow: 0 3px 10px rgba(245,158,11,.25);
}
.dc-badge--eco {
  background: rgba(15,23,42,.65);
  color: #a7f3d0;
}

.dc-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.dc-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(15,23,42,.1);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}
.dc-action-btn:hover {
  transform: scale(1.12) translateY(-1px);
  box-shadow: 0 5px 16px rgba(15,23,42,.15);
  background: rgba(255,255,255,.95);
}
.dc-action-btn--liked {
  background: rgba(254,226,226,.92);
  color: #ef4444;
}
.dc-action-btn--heart-anim {
  animation: dc-heart 0.5s cubic-bezier(0.22,1,0.36,1);
}
.dc-action-btn--copied {
  background: rgba(236,253,245,.95);
  color: #059669;
}


.dc-toast {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  white-space: nowrap;
  background: #0f172a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 7px;
  pointer-events: none;
  animation: dc-toast 2s ease forwards;
  z-index: 10;
}

.dc-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  gap: 10px;
}

.dc-name {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(17px, 2vw, 21px);
  font-weight: 700;
  line-height: 1.25;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}
.dc-card:hover .dc-name { color: #047857; }

.dc-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
  font-size: 12.5px;
  font-weight: 500;
  flex-wrap: wrap;
}
.dc-location svg { color: #10b981; flex-shrink: 0; }
.dc-flag { font-size: 13px; margin-left: 2px; line-height: 1; }

.dc-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.dc-stat svg { color: #94a3b8; flex-shrink: 0; }
.dc-stat strong { color: #0f172a; font-weight: 700; }
.dc-divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.dc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.dc-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.dc-chip--cat {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  text-transform: capitalize;
}
.dc-chip--dur {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.dc-diff {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.dc-diff--easy        { background: #d1fae5; color: #065f46; }
.dc-diff--moderate    { background: #fef3c7; color: #78350f; }
.dc-diff--challenging { background: #fed7aa; color: #7c2d12; }
.dc-diff--difficult   { background: #e9d5ff; color: #581c87; }
.dc-diff--expert      { background: #fce7f3; color: #831843; }

.dc-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.dc-hl {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  color: #166534;
  border: 1px solid #dcfce7;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  transition: background 0.2s ease;
}
.dc-hl:hover { background: #dcfce7; }
.dc-hl-more {
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
}

.dc-desc {
  margin: 0;
  font-size: clamp(12.5px, 1.1vw, 13.5px);
  color: #64748b;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dc-sep {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  border: none;
  flex-shrink: 0;
  margin: 2px 0;
}



.dc-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Keep actions directly beneath the destination details instead of pinning
     them to the bottom of a tall equal-height card. */
  margin-top: 0;
}

.dc-btn-learn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid #a7f3d0;
  background: #ffffff;
  color: #059669;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-learn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ecfdf5;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.dc-btn-learn:hover::before { transform: scaleX(1); }
.dc-btn-learn:hover {
  border-color: #059669;
  color: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(5,150,105,.15);
}
.dc-btn-learn:active { transform: scale(0.97); }
.dc-btn-learn > * { position: relative; z-index: 1; }
.dc-btn-learn:hover .dc-btn-arrow {
  animation: dc-arrow 0.7s ease infinite;
}

.dc-btn-book {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(16,185,129,.28), inset 0 1px 0 rgba(255,255,255,.15);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.dc-btn-book::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.14) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.dc-btn-book:hover::before { opacity: 1; }
.dc-btn-book:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(16,185,129,.4);
}
.dc-btn-book:active { transform: scale(0.97); }
.dc-btn-book > * { position: relative; z-index: 1; }

.dc-skeleton {
  background: #ffffff;
  border-radius: 18px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
}
.dc-skel-img {
  width: 100%;
  padding-top: 58%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.dc-skel-line {
  border-radius: 7px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}
.dc-skel-row { display: flex; gap: 8px; }
.dc-skel-chip {
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200%;
  animation: dc-shimmer 1.6s ease infinite;
}

@media (max-width: 480px) {
  .dc-body      { padding: 13px; gap: 8px; }
  .dc-name      { font-size: 17px; }
  .dc-img-frame { padding-top: 62%; }
  .dc-btn-learn,
  .dc-btn-book  { padding: 10px 12px; font-size: 12.5px; }
  .dc-stat      { font-size: 11.5px; }
  .dc-nav       { display: none; }
  .dc-footer    { gap: 6px; }
}
@media (max-width: 360px) {
  .dc-btn-learn,
  .dc-btn-book  { padding: 9px 10px; font-size: 12px; gap: 4px; }
  .dc-action-btn { width: 32px; height: 32px; }
  .dc-stats     { gap: 6px; }
}
.dc-like-action { position: relative; }
.dc-public-like-btn { overflow: visible; }
.dc-public-like-btn:disabled { opacity: .65; cursor: wait; }
.dc-public-like-btn--liked { background: rgba(220,252,231,.97); color: #064e3b; box-shadow: 0 3px 12px rgba(6,78,59,.2); }
.dc-like-count { position: absolute; left: -5px; bottom: -5px; min-width: 18px; height: 17px; padding: 0 4px; display: grid; place-items: center; border-radius: 999px; background: #fff; color: #064e3b; border: 1px solid #bbf7d0; box-shadow: 0 1px 4px rgba(15,23,42,.12); font-size: 9px; font-weight: 800; line-height: 1; }
.dc-live-like-label { position: absolute; left: 12px; bottom: 12px; z-index: 7; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-width: 36px; min-height: 44px; padding: 5px 7px; border: 1px solid rgba(255,255,255,.28); border-radius: 12px; color: #fff; background: rgba(15,23,42,.58); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); cursor: pointer; font: inherit; transition: color .2s, background .2s, transform .2s; }
.dc-live-like-label:hover { transform: translateY(-2px); background: rgba(255,255,255,.95); color: #064e3b; }
.dc-live-like-label--liked { background: rgba(220,252,231,.96); color: #064e3b; }
.dc-live-like-label:disabled { opacity: .65; cursor: wait; }
.dc-live-like-count { font-size: 10px; line-height: 1; font-weight: 800; color: inherit; }
.dc-like-error { position: absolute; left: 56px; bottom: 16px; z-index: 8; max-width: calc(100% - 76px); padding: 6px 9px; border-radius: 8px; background: #7f1d1d; color: #fff; font-size: 11px; line-height: 1.3; box-shadow: 0 2px 10px #0003; }

.dc-rating-stat{display:inline-flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0}
.dc-rating-row{display:inline-flex;align-items:center;gap:4px;min-width:0}
.dc-rating-stars{display:inline-flex;align-items:center;gap:1px}
.dc-rating-btn{width:17px;height:20px;padding:0;display:inline-grid;place-items:center;line-height:1;border:0;background:transparent;cursor:pointer;border-radius:4px;transition:transform .16s ease,background .16s ease}
.dc-rating-btn svg{width:13px;height:13px;display:block}
.dc-rating-btn:hover:not(:disabled),.dc-rating-btn:focus-visible:not(:disabled){transform:translateY(-1px) scale(1.16);background:#fffbeb;outline:2px solid #fde68a;outline-offset:1px}
.dc-rating-btn:disabled{cursor:default}
.dc-rating-value{margin-left:2px;color:#475569;font-size:11.5px;font-weight:800}
.dc-rating-count{color:#94a3b8;font-size:11px}
.dc-rating-message{display:block;max-width:210px;color:#047857;font-size:9.5px;font-weight:700;line-height:1.3;white-space:normal}
.dc-rating-message.is-error{color:#b91c1c}
@media(max-width:480px){.dc-rating-btn{width:18px;height:22px}.dc-rating-btn svg{width:14px;height:14px}.dc-rating-message{max-width:190px}}
@media (prefers-reduced-motion: reduce) {
  .dc-card, .dc-track, .dc-img, .dc-btn-book,
  .dc-btn-learn, .dc-action-btn, .dc-nav-btn {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* Responsive destination-share sheet */
@keyframes dc-share-fade-in { from { opacity:0; } to { opacity:1; } }
@keyframes dc-share-panel-in { from { opacity:0; transform:translateY(12px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }
.dc-share-overlay { position:fixed; inset:0; z-index:10050; box-sizing:border-box; display:grid; place-items:center; padding:max(16px,env(safe-area-inset-top)) 16px max(16px,env(safe-area-inset-bottom)); background:rgba(3,20,13,.64); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); animation:dc-share-fade-in .18s ease both; font-family:'Inter',system-ui,sans-serif; }
.dc-share-dialog { box-sizing:border-box; width:min(100%,620px); max-height:min(90dvh,780px); overflow-y:auto; scrollbar-width:none; -ms-overflow-style:none; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; touch-action:pan-y; padding:clamp(18px,3.8vw,28px); border-radius:26px; border:1px solid rgba(255,255,255,.8); background:linear-gradient(155deg,#fff 0%,#f8fffb 68%,#f1fbf5 100%); color:#102a20; box-shadow:0 30px 100px rgba(0,0,0,.34),inset 0 1px 0 #fff; animation:dc-share-panel-in .25s cubic-bezier(.22,1,.36,1) both; }
.dc-share-dialog::-webkit-scrollbar { display:none; width:0; height:0; }
.dc-share-overlay { overflow:hidden; }
.dc-share-grabber { display:none; }
.dc-share-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px; }
.dc-share-header-copy { min-width:0; }
.dc-share-eyebrow { display:flex; align-items:center; gap:6px; color:#047857; font-size:10px; line-height:1.2; font-weight:800; letter-spacing:.14em; }
.dc-share-header h2 { margin:7px 0 5px; color:#103b2b; font-family:'Playfair Display',Georgia,serif; font-size:clamp(22px,4vw,29px); line-height:1.18; letter-spacing:-.025em; }
.dc-share-header p { margin:0; color:#718176; font-size:12.5px; line-height:1.5; }
.dc-share-close { display:grid; place-items:center; flex:0 0 40px; width:40px; height:40px; border:1px solid #e0eee6; border-radius:14px; color:#355748; background:#fff; cursor:pointer; box-shadow:0 3px 10px rgba(15,23,42,.05); transition:background .2s,transform .2s,border-color .2s; }
.dc-share-close:hover { background:#ecfdf5; border-color:#a7f3d0; transform:rotate(4deg); }
.dc-share-preview { display:flex; align-items:center; gap:14px; min-width:0; padding:11px; margin-bottom:21px; border:1px solid #dfeee5; border-radius:18px; background:linear-gradient(110deg,#f2fcf6,#fff); box-shadow:0 5px 18px rgba(6,78,59,.045); }
.dc-share-preview-image,.dc-share-preview-placeholder { width:82px; height:82px; flex:0 0 82px; border-radius:13px; object-fit:cover; background:linear-gradient(145deg,#064e3b,#10b981); }
.dc-share-preview-placeholder { display:grid; place-items:center; color:#d1fae5; }
.dc-share-preview-copy { min-width:0; }
.dc-share-preview-copy>span { display:block; margin-bottom:4px; color:#059669; font-size:8.5px; font-weight:850; letter-spacing:.13em; }
.dc-share-preview-copy strong { display:block; overflow:hidden; color:#163c2d; font-size:15px; line-height:1.3; text-overflow:ellipsis; white-space:nowrap; }
.dc-share-preview-copy small { display:flex; align-items:center; gap:4px; margin-top:4px; color:#64756b; font-size:10.5px; line-height:1.35; overflow-wrap:anywhere; }
.dc-share-preview-copy p { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin:5px 0 0; color:#748177; font-size:10.5px; line-height:1.45; }
.dc-share-section-head { display:flex; justify-content:space-between; align-items:baseline; gap:10px; margin:0 2px 11px; }
.dc-share-section-head strong { color:#173d2d; font-size:13px; font-weight:800; }
.dc-share-section-head span { color:#94a3a0; font-size:10px; font-weight:600; }
.dc-share-app-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
.dc-share-app { min-width:0; min-height:96px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; padding:11px 5px; border:1px solid #e4eee8; border-radius:15px; background:rgba(255,255,255,.88); color:#385447; text-align:center; text-decoration:none; font-family:inherit; font-size:10.5px; font-weight:750; cursor:pointer; transition:transform .2s,border-color .2s,background .2s,box-shadow .2s; }
.dc-share-app:hover,.dc-share-app:focus-visible { transform:translateY(-2px); border-color:#a7f3d0; background:#fff; box-shadow:0 7px 18px rgba(6,78,59,.09); outline:none; }
.dc-share-app:active { transform:scale(.97); }
.dc-share-app:disabled { opacity:.58; cursor:wait; transform:none; box-shadow:none; }
.dc-share-app-icon { width:43px; height:43px; display:grid; place-items:center; border-radius:14px; color:#fff; background:#fff; box-shadow:0 5px 14px rgba(15,23,42,.09),inset 0 0 0 1px rgba(15,23,42,.045); overflow:hidden; } .dc-share-app-icon img { width:25px; height:25px; object-fit:contain; display:block; } .dc-share-app-icon:has(img:not([style*="display: none"])) > svg,.dc-share-app-icon:has(img:not([style*="display: none"])) > b { display:none; }
.dc-share-app-icon b { font-family:Arial,sans-serif; font-size:27px; font-weight:800; line-height:1; }
.dc-share-app-icon--whatsapp,.dc-share-app-icon--facebook,.dc-share-app-icon--telegram,.dc-share-app-icon--x,.dc-share-app-icon--email,.dc-share-app-icon--instagram { background:linear-gradient(145deg,#fff,#f8fafc); } .dc-share-app-icon--linkedin { background:linear-gradient(145deg,#0a66c2,#004182); color:#fff; box-shadow:0 5px 14px rgba(10,102,194,.24),inset 0 0 0 1px rgba(255,255,255,.22); } .dc-share-app-icon--linkedin img { filter:brightness(0) invert(1); } .dc-share-app-icon--linkedin b { color:#fff; } .dc-share-app-icon--sms { background:linear-gradient(135deg,#e2f5eb,#c7ecd8); color:#087443; } .dc-share-app-icon--copy { background:linear-gradient(135deg,#d1fae5,#a7f3d0); color:#047857; } .dc-share-app-icon--copy.is-copied { background:#047857; color:#fff; }
.dc-share-link-box { display:flex; align-items:center; gap:10px; min-width:0; margin-top:17px; padding:10px 11px; border:1px solid #dbece2; border-radius:15px; background:rgba(240,253,244,.72); }
.dc-share-link-icon { display:grid; place-items:center; flex:0 0 34px; width:34px; height:34px; border-radius:11px; color:#047857; background:#d9fbe8; }
.dc-share-link-value { min-width:0; flex:1; }
.dc-share-link-value small { display:block; margin-bottom:3px; color:#64756b; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
.dc-share-link-value a { display:block; overflow:hidden; color:#2f5a46; font-size:10.5px; text-overflow:ellipsis; white-space:nowrap; text-decoration:none; border-radius:3px; } .dc-share-link-value a:hover { color:#047857; text-decoration:underline; } .dc-share-link-value a:focus-visible { outline:2px solid #059669; outline-offset:2px; }
.dc-share-copy-btn { display:flex; align-items:center; justify-content:center; gap:5px; flex:0 0 auto; min-height:36px; padding:0 10px; border:1px solid #b6e6ca; border-radius:10px; color:#047857; background:#fff; font:800 10px/1 'Inter',sans-serif; cursor:pointer; transition:background .2s,color .2s; }
.dc-share-copy-btn:hover { background:#047857; color:#fff; }
.dc-share-native { display:flex; align-items:center; gap:12px; width:100%; min-height:62px; margin-top:12px; padding:10px 14px; border:0; border-radius:15px; color:#fff; background:linear-gradient(110deg,#064e3b,#047857); box-shadow:0 7px 20px rgba(6,78,59,.18); text-align:left; cursor:pointer; transition:transform .2s,box-shadow .2s; }
.dc-share-native:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(6,78,59,.24); }
.dc-share-native>svg:first-child { flex:0 0 22px; } .dc-share-native>span { display:flex; flex:1; min-width:0; flex-direction:column; gap:4px; } .dc-share-native strong { font-size:12px; font-weight:800; } .dc-share-native small { color:rgba(255,255,255,.72); font-size:10px; font-weight:500; } .dc-share-native-arrow { opacity:.75; }
.dc-share-copy-caption { box-sizing:border-box; display:flex; align-items:center; gap:11px; width:100%; min-height:54px; margin-top:9px; padding:10px 14px; border:1px solid #dcece2; border-radius:14px; color:#155e41; background:rgba(255,255,255,.92); text-align:left; font-family:inherit; cursor:pointer; transition:border-color .2s,background .2s,transform .2s,box-shadow .2s; }
.dc-share-copy-caption:hover,.dc-share-copy-caption:focus-visible { border-color:#86d6a9; background:#fff; box-shadow:0 5px 16px rgba(6,78,59,.07); outline:none; }
.dc-share-copy-caption:active { transform:scale(.99); }
.dc-share-copy-caption>svg { flex:0 0 18px; color:#047857; }
.dc-share-copy-caption>span { display:flex; flex:1; min-width:0; flex-direction:column; gap:3px; }
.dc-share-copy-caption strong { font-size:11.5px; font-weight:800; }
.dc-share-copy-caption small { color:#728176; font-size:10px; font-weight:500; line-height:1.35; }
.dc-share-copy-caption:focus-visible { outline:2px solid #059669; outline-offset:2px; }
.dc-share-feedback { margin:12px 0 0; padding:9px 11px; border:1px solid #bbf7d0; border-radius:11px; color:#166534; background:#f0fdf4; font-size:11px; line-height:1.45; }
.dc-share-footnote { margin:12px 0 0; color:#9aa8a0; font-size:9.5px; text-align:center; line-height:1.4; }
@media(max-width:520px) {
 .dc-share-overlay { align-items:end; padding:0; padding-top:env(safe-area-inset-top); padding-bottom:0; }
 .dc-share-dialog { width:100%; max-height:calc(91dvh - env(safe-area-inset-top)); padding:19px 16px max(18px,env(safe-area-inset-bottom)); border-radius:24px 24px 0 0; border-bottom:0; animation:dc-share-panel-in .24s cubic-bezier(.22,1,.36,1) both; }
 .dc-share-grabber { display:block; width:38px; height:4px; margin:-7px auto 17px; border-radius:99px; background:#cbded2; }
 .dc-share-header { margin-bottom:14px; } .dc-share-close { flex-basis:36px; width:36px; height:36px; border-radius:12px; }
 .dc-share-preview { gap:11px; padding:9px; margin-bottom:17px; border-radius:15px; }
 .dc-share-preview-image,.dc-share-preview-placeholder { width:70px; height:70px; flex-basis:70px; border-radius:11px; }
 .dc-share-preview-copy strong { font-size:13.5px; } .dc-share-preview-copy p { font-size:10px; }
 .dc-share-app-grid { grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; }
 .dc-share-app { min-height:82px; gap:7px; padding:8px 2px; border-radius:12px; font-size:9.5px; }
 .dc-share-app-icon { width:37px; height:37px; border-radius:12px; } .dc-share-app-icon b { font-size:24px; }
 .dc-share-link-box { gap:7px; padding:8px; } .dc-share-link-icon { flex-basis:30px; width:30px; height:30px; } .dc-share-copy-btn { min-height:34px; padding:0 8px; }
}
@media(max-width:350px) { .dc-share-dialog { padding-inline:11px; } .dc-share-app-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } .dc-share-preview-image,.dc-share-preview-placeholder { width:62px; height:62px; flex-basis:62px; } .dc-share-header h2 { font-size:21px; } }
@media(prefers-reduced-motion:reduce) { .dc-share-overlay,.dc-share-dialog { animation:none!important; } .dc-share-close,.dc-share-app,.dc-share-copy-btn,.dc-share-native,.dc-share-copy-caption { transition:none!important; } }

`;

/* ─────────────────────────────────────────────────────────────
   STYLE INJECTOR  (runs once per page)
───────────────────────────────────────────────────────────── */
function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dc-styles")) return;
  const el = document.createElement("style");
  el.id = "dc-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   STAR SVG
───────────────────────────────────────────────────────────── */
function StarSVG({ filled }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   STARS component
───────────────────────────────────────────────────────────── */
function Stars({ rating, count, onRate, busy = false, rated = false, userRating = null, message = "" }) {
  const [hovered, setHovered] = useState(0);
  const value = Number(rating) || 0;
  const filled = hovered || Math.round(value);
  const countText = Number(count) >= 1000
    ? `${(Number(count) / 1000).toFixed(1)}k`
    : Number(count) || 0;

  return (
    <div className="dc-rating-stat" onClick={(event) => event.stopPropagation()}>
      <div className="dc-rating-row" role="group" aria-label={`Rate this destination. Average rating: ${value ? value.toFixed(2) : "No ratings yet"} out of 5`}>
        <div className="dc-rating-stars" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`dc-rating-btn${star <= filled ? " is-filled" : ""}`}
              aria-label={`Rate ${star} out of 5 stars`}
              aria-pressed={userRating === star}
              title={rated ? `You already rated this destination ${userRating}/5` : `Rate ${star}/5`}
              disabled={busy || rated}
              onMouseEnter={() => !rated && setHovered(star)}
              onFocus={() => !rated && setHovered(star)}
              onBlur={() => setHovered(0)}
              onClick={(event) => onRate?.(event, star)}
            >
              <StarSVG filled={star <= filled} />
            </button>
          ))}
        </div>

        <strong className="dc-rating-value">{value > 0 ? value.toFixed(1) : "New"}</strong>
        {Number(count) > 0 && <span className="dc-rating-count">({countText})</span>}
      </div>
      {(rated || message) && (
        <span className={`dc-rating-message${message && /couldn.t|already|sign in|failed|unable/i.test(message) ? " is-error" : ""}`} role="status">
          {message || (userRating ? `Your rating: ${userRating}/5` : "")}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   IMAGE SLIDER
───────────────────────────────────────────────────────────── */
function ImageSlider({ images, name, totalPhotoCount = images.length }) {
  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const timerRef      = useRef(null);
  const total         = images.length;

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(
      () => setIdx((p) => (p + 1) % total),
      5000,
    );
  }, [total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const go = useCallback(
    (e, i) => { e.stopPropagation(); setIdx(i); startTimer(); },
    [startTimer],
  );
  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p - 1 + total) % total);
      startTimer();
    },
    [total, startTimer],
  );
  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setIdx((p) => (p + 1) % total);
      startTimer();
    },
    [total, startTimer],
  );

  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches?.[0]?.clientX ?? null);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStart == null || total < 2) return;
    const end = e.changedTouches?.[0]?.clientX ?? touchStart;
    const delta = end - touchStart;
    setTouchStart(null);
    if (Math.abs(delta) < 35) return;
    setIdx((p) => (delta < 0 ? (p + 1) % total : (p - 1 + total) % total));
    startTimer();
  }, [startTimer, touchStart, total]);

  return (
    <div
      className="dc-slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={startTimer}
      aria-label={`${name} destination photos`}
    >
      <div
        className="dc-track"
        style={{ transform: `translate3d(-${idx * 100}%,0,0)` }}
      >
        {images.map((src, i) => (
          <img
            key={`slide-${i}`}
            src={src}
            alt={i === 0 ? name : `${name} — photo ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            onError={(ev) => { ev.currentTarget.style.display = "none"; }}
            className="dc-img"
          />
        ))}
      </div>

      {total > 1 && (
        <>
          <div className="dc-nav" aria-hidden="true">
            <button
              className="dc-nav-btn"
              onClick={prev}
              aria-label="Previous image"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              className="dc-nav-btn"
              onClick={next}
              aria-label="Next image"
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          <div className="dc-dots" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={(e) => go(e, i)}
                aria-label={`Go to image ${i + 1}`}
                className={`dc-dot${idx === i ? " dc-dot--active" : ""}`}
                style={{ width: idx === i ? 18 : 6 }}
              />
            ))}
          </div>

        </>
      )}
      {totalPhotoCount > 0 && (
        <div className="dc-photo-count" aria-label={`${totalPhotoCount} destination photos`}>
          <FiCamera size={10} />
          <span>{totalPhotoCount} {totalPhotoCount === 1 ? "photo" : "photos"}</span>
        </div>
      )}
    </div>
  );
}

const getImageUrl = (image) => {
    // Helper to resolve a relative URL against the web origin (backend origin)
    const resolveRelative = (value) => {
        const url = String(value || "").trim();
        if (!url) return "";
        
        // If already absolute, return as-is
        if (/^https?:\/\//i.test(url)) return url;
        
        // Handle data URLs
        if (url.startsWith("data:")) return url;
        
        // Resolve relative URL against web origin
        // Web origin is API_URL without the "/api" suffix
        // Since API_URL always ends with "/api" due to buildBase logic
        const webOrigin = API_URL.slice(0, -4); // Remove trailing "/api"
        
        try {
            return new URL(url, webOrigin).toString();
        } catch {
            // Fallback to simple concatenation if URL constructor fails
            const normalizedWebOrigin = webOrigin.endsWith('/') 
                ? webOrigin.slice(0, -1) 
                : webOrigin;
            const normalizedUrl = url.startsWith('/') 
                ? url.slice(1) 
                : url;
            return `${normalizedWebOrigin}/${normalizedUrl}`;
        }
    };

    if (typeof image === "string") {
        return resolveRelative(image);
    }
    
    if (!image || typeof image !== "object") {
        return "";
    }
    
    // Extract URL from object, trying multiple possible field names
    const url = 
        image.imageUrl ||
        image.image_url ||
        image.image ||
        image.url ||
        image.thumbnailUrl ||
        image.thumbnail_url ||
        "";
    
    return resolveRelative(url);
};

/* ─────────────────────────────────────────────────────────────
   SKELETON  (named export)
───────────────────────────────────────────────────────────── */
export function DestinationCardSkeleton() {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div
      className="dc-skeleton"
      aria-busy="true"
      aria-label="Loading destination card"
    >
      <div className="dc-skel-img" />
      <div className="dc-skel-body">
        <div className="dc-skel-line" style={{ width: "72%", height: 20 }} />
        <div className="dc-skel-line" style={{ width: "44%", height: 12 }} />
        <div className="dc-skel-row">
          <div className="dc-skel-chip" style={{ width: 56, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 76, height: 26 }} />
          <div className="dc-skel-chip" style={{ width: 50, height: 26 }} />
        </div>
        <div className="dc-skel-line" style={{ width: "100%", height: 12 }} />
        <div className="dc-skel-line" style={{ width: "80%",  height: 12 }} />
        <div className="dc-skel-line" style={{ width: "60%",  height: 12 }} />
        <div className="dc-skel-row" style={{ marginTop: 6 }}>
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
          <div className="dc-skel-chip" style={{ flex: 1, height: 42, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN CARD  (default export)
───────────────────────────────────────────────────────────── */
const DestinationCard = memo(function DestinationCard({
  destination,
  compact          = false,
  onWishlistToggle,
}) {
  const navigate = useNavigate();

  /* safe hook call ─ fallback if context missing */
  const wishlistHook   = useWishlist?.() ?? {};
  const isWishlisted   = wishlistHook.isWishlisted  ?? (() => false);
  const toggleWishlist = wishlistHook.toggleWishlist ?? (() => {});

  const [heartAnim, setHeartAnim] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [shareImageFile, setShareImageFile] = useState(null);
  const [shareImageStatus, setShareImageStatus] = useState("idle");
  const shareFeedbackTimer = useRef(null);
  const shareImageSource = useMemo(() => {
    const toList = (value) => Array.isArray(value) ? value : value ? [value] : [];
    const candidates = [
      ...toList(destination?.heroImages), ...toList(destination?.hero_images),
      ...toList(destination?.images), ...toList(destination?.gallery),
      ...toList(destination?.image_urls), ...toList(destination?.imageUrls),
      destination?.heroImage, destination?.hero_image, destination?.coverImageUrl,
      destination?.cover_image_url, destination?.imageUrl, destination?.image_url,
      destination?.image, destination?.thumbnailUrl, destination?.thumbnail_url,
    ].map(getImageUrl).filter(Boolean);
    return candidates[0] || "";
  }, [destination]);
  const [showFavouriteIcon, setShowFavouriteIcon] = useState(false);
  const favouriteToastTimer = useRef(null);
  useEffect(() => () => {
    if (favouriteToastTimer.current) window.clearTimeout(favouriteToastTimer.current);
    if (shareFeedbackTimer.current) window.clearTimeout(shareFeedbackTimer.current);
  }, []);

  useEffect(() => {
    if (!shareModalOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShareModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [shareModalOpen]);

  useEffect(() => {
    if (!shareModalOpen) {
      setShareImageFile(null);
      setShareImageStatus("idle");
      return undefined;
    }
    if (!shareImageSource) {
      setShareImageFile(null);
      setShareImageStatus("unavailable");
      return undefined;
    }

    let cancelled = false;
    const prepareShareImage = async () => {
      setShareImageFile(null);
      setShareImageStatus("loading");
      try {
        const response = await fetch(shareImageSource, { mode: "cors", credentials: "omit" });
        if (!response.ok) throw new Error("Destination photo could not be downloaded");
        const sourceBlob = await response.blob();
        if (!sourceBlob.type.startsWith("image/")) throw new Error("Destination photo is not an image");

        let outputBlob = sourceBlob;
        if (typeof createImageBitmap === "function") {
          let bitmap;
          try {
            bitmap = await createImageBitmap(sourceBlob);
            const cropSize = Math.min(bitmap.width, bitmap.height);
            const sx = Math.max(0, (bitmap.width - cropSize) / 2);
            const sy = Math.max(0, (bitmap.height - cropSize) / 2);
            const canvas = document.createElement("canvas");
            canvas.width = 1200;
            canvas.height = 1200;
            const context = canvas.getContext("2d");
            if (context) {
              context.drawImage(bitmap, sx, sy, cropSize, cropSize, 0, 0, 1200, 1200);
              const squarePhoto = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
              if (squarePhoto) outputBlob = squarePhoto;
            }
          } finally {
            bitmap?.close?.();
          }
        }

        const safeName = String(destination?.slug || destination?.name || "destination")
          .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "destination";
        const mime = outputBlob.type || sourceBlob.type || "image/jpeg";
        const extension = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "jpg";
        const file = new File([outputBlob], `altuvera-${safeName}.${extension}`, { type: mime });
        const canShareFile = typeof navigator !== "undefined" &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [file] });
        if (!cancelled) {
          setShareImageFile(canShareFile ? file : null);
          setShareImageStatus(canShareFile ? "ready" : "unsupported");
          if (!canShareFile) setShareFeedback("This browser cannot attach photos through its share sheet. You can still share the destination link and details.");
        }
      } catch {
        if (!cancelled) {
          setShareImageFile(null);
          setShareImageStatus("error");
          // Photo preparation is optional; never surface a card-level error for a browser/CORS limitation.
        }
      }
    };
    prepareShareImage();
    return () => { cancelled = true; };
  }, [shareModalOpen, shareImageSource, destination?.slug, destination?.name]);
  const { isAuthenticated = false, openModal } = useUserAuth() || {};
  const likeId = destination?.numericId || destination?.id || destination?._id || destination?.slug;
  const ratingIdValue = destination?.numericId || destination?.id || destination?._id;
  const ratingId = /^\d+$/.test(String(ratingIdValue ?? "")) ? String(ratingIdValue) : null;
  const { likes: destinationLikes, loading: likesLoading, error: destinationLikeError, toggleLike } = useDestinationLikes(likeId, "destination");
  const [likeBusy, setLikeBusy] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [myRating, setMyRating] = useState(null);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftReview, setDraftReview] = useState("");

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    let active = true;
    setRatingSummary(null);
    setRatingMessage("");
    if (!isAuthenticated || !ratingId) {
      setMyRating(null);
      return () => { active = false; };
    }
    apiFetch(`/destination-ratings/${encodeURIComponent(ratingId)}/ratings/user`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) return;
        const userValue = payload?.data?.rating?.rating;
        if (active) setMyRating(userValue == null ? null : Number(userValue));
      })
      .catch(() => { /* rating summary remains available if the account check fails */ });
    return () => { active = false; };
  }, [isAuthenticated, ratingId]);

  useEffect(() => {
    const onRatingUpdate = (event) => {
      if (String(event.detail?.destinationId) !== String(ratingId)) return;
      setRatingSummary({ rating: Number(event.detail.rating), count: Number(event.detail.reviewCount) });
    };
    window.addEventListener("altuvera:destination-rating-updated", onRatingUpdate);
    return () => window.removeEventListener("altuvera:destination-rating-updated", onRatingUpdate);
  }, [ratingId]);

  useEffect(() => {
    if (!ratingId) return undefined;
    let active = true;
    const refreshStats = async () => {
      try {
        const response = await apiFetch("/destination-ratings/" + encodeURIComponent(ratingId) + "/ratings/stats");
        const payload = await response.json();
        if (!active || !response.ok || payload?.status !== "success") return;
        const stats = payload.data || {};
        setRatingSummary({ rating: Number(stats.averageRating) || 0, count: Number(stats.totalRatings) || 0 });
      } catch { /* Keep the current summary if live stats are temporarily unavailable. */ }
    };
    refreshStats();
    const timer = window.setInterval(refreshStats, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [ratingId]);

  const openRatingModal = useCallback((event, score) => {
    event?.stopPropagation();
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      return;
    }
    setDraftRating(myRating ?? score ?? 0);
    setDraftReview("");
    setRatingMessage(myRating !== null ? `You already rated this destination ${myRating}/5` : "");
    setRatingModalOpen(true);
  }, [isAuthenticated, openModal, myRating]);

  const rateDestination = useCallback(async (event, score) => {
    event?.stopPropagation();
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      return;
    }
    if (!ratingId || ratingBusy || myRating !== null) return;

    setRatingBusy(true);
    setRatingMessage("");
    try {
      const response = await apiFetch(`/destination-ratings/${encodeURIComponent(ratingId)}/ratings`, {
        method: "POST",
        body: JSON.stringify({ rating: score, review: draftReview.trim() }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        const existingRating = Number(payload?.data?.rating?.rating);
        if (Number.isInteger(existingRating) && existingRating >= 1 && existingRating <= 5) setMyRating(existingRating);
        setRatingMessage(payload?.message || "You have already rated this destination");
        return;
      }
      if (!response.ok || payload?.status !== "success") {
        throw new Error(payload?.message || "We couldn't save your rating. Please try again.");
      }
      const stats = payload?.data?.stats || {};
      const average = Number(stats.averageRating ?? score);
      const totalRatings = Number(stats.totalRatings ?? 1);
      setMyRating(score);
      setRatingSummary({ rating: average, count: totalRatings });
      setRatingMessage(`Thanks — you rated ${score}/5`);
      window.dispatchEvent(new CustomEvent("altuvera:destination-rating-updated", {
        detail: { destinationId: ratingId, rating: average, reviewCount: totalRatings },
      }));
      setRatingModalOpen(false);
    } catch (error) {
      setRatingMessage(error?.message || "Unable to save your rating");
    } finally {
      setRatingBusy(false);
    }
  }, [isAuthenticated, openModal, ratingId, ratingBusy, myRating, draftReview]);

  /* ── guard ── */
  if (!destination) return <DestinationCardSkeleton />;

  /* ── destructure destination safely ── */
const {
     slug,
     id,
     name             = "Destination",
     images           = [],
     gallery          = [],
     heroImages       = [],
     hero_images,
     heroImage,
     imageUrl,
     thumbnailUrl,
     location,
     country,
     countryName,
     countryFlag,
     region,
     duration,
     durationDays,
     rating: sourceRating,
     reviewCount: sourceReviewCount,
     highlights       = [],
     shortDescription,
     description,
     isFeatured,
     isNew,
     isPopular,
     isEcoFriendly,
     difficulty,
     category,
       minGroupSize,
     maxGroupSize,
   } = destination;

   // Normalize rating fields from both camelCase and API snake_case responses.
   // A destination with no submitted ratings should read "New", not "0.0".
   const ratingValue = destination.average_rating
     ?? destination.averageRating
     ?? sourceRating;
   const normalizedRating = ratingValue == null || ratingValue === ""
     ? null
     : Number(ratingValue);
   const reviewCountValue = destination.review_count
     ?? destination.reviewCount
     ?? destination.total_reviews
     ?? destination.totalReviews
     ?? destination.reviews_count
     ?? sourceReviewCount
     ?? (Array.isArray(destination.reviews) ? destination.reviews.length : 0);
   const reviewCount = Array.isArray(reviewCountValue)
     ? reviewCountValue.length
     : Math.max(0, Number(reviewCountValue) || 0);
   // Only show a numeric rating when it is in range and supported by reviews.
   // APIs often send average_rating: 0 for an empty aggregate; that means unrated,
   // not a genuine zero-star score.
   const rating = Number.isFinite(normalizedRating)
     && normalizedRating >= 0
     && normalizedRating <= 5
     && (reviewCount > 0 || normalizedRating > 0)
     ? normalizedRating
     : null;

   // Clean unwanted text from description fields
   const cleanText = (text) => {
     if (!text) return text;
     return text.replace(/experience unforgattable adventures rich, culture and breathtaking naturel beauty/gi, '').trim();
   };
   const cleanShortDescription = cleanText(shortDescription);
   const cleanDescription = cleanText(description);

  /* ── derived values ── */
  const destId = slug || id || destination?._id;
  const isLiked = isWishlisted(destId);

  const toDisplayText = (value) => {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(toDisplayText).filter(Boolean).join(", ");
    if (typeof value === "object") {
      const candidate = value.name ?? value.label ?? value.title ?? value.region ?? value.continent;
      return candidate == null || candidate === value ? "" : toDisplayText(candidate);
    }
    return "";
  };

  const resolvedCountry = toDisplayText(country);
  // API responses can accidentally place a full country object in countryFlag.
  // Normalize it before rendering so React never receives an object child.
  const safeCountryFlag = toDisplayText(countryFlag) || toDisplayText(country?.flag) || "";

const safeImgs = [...new Set([
    ...(Array.isArray(destination.images) ? destination.images : []),
    ...(Array.isArray(gallery) ? gallery : []),
    ...(Array.isArray(destination.image_urls) ? destination.image_urls : []),
    ...(Array.isArray(destination.imageUrls) ? destination.imageUrls : []),
    ...(Array.isArray(heroImages) ? heroImages : []),
    ...(Array.isArray(hero_images) ? hero_images : []),
    ...(Array.isArray(destination.attractions) ? destination.attractions : []),
    heroImage,
    imageUrl,
    thumbnailUrl,
    destination.coverImageUrl,
    destination.cover_image_url,
  ].map(getImageUrl).filter(Boolean))];

  // Prefer the three dedicated hero images supplied by the admin, then fill
  // remaining slots from the gallery. Existing destination data is read-only here.
  const cardImages = [...new Set([
    ...(Array.isArray(heroImages) ? heroImages : []),
    ...(Array.isArray(hero_images) ? hero_images : []),
    ...safeImgs,
  ].map(getImageUrl).filter(Boolean))].slice(0, 4);

  const locationStr = [region, location, countryName || resolvedCountry]
    .map(toDisplayText)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

const blurb =
     cleanShortDescription ||
     (cleanDescription
       ? cleanDescription.slice(0, 130) + (cleanDescription.length > 130 ? "…" : "")
       : "");

  const durationStr =
    duration ||
    (durationDays
      ? `${durationDays} day${Number(durationDays) !== 1 ? "s" : ""}`
      : null);

  const groupStr =
    minGroupSize || maxGroupSize
      ? `${minGroupSize ?? 1}–${maxGroupSize ?? "∞"}`
      : null;

  const activeBadges = Object.keys(BADGE_CFG).filter((k) => destination[k]);
  const diffConf = DIFF_CFG[difficulty?.toLowerCase?.() ?? ""] ?? null;

  /* ── handlers ── */
  const goDetail = useCallback(
    () => navigate(`/destinations/${destId}`),
    [destId, navigate],
  );

  const goBook = useCallback(
    (e) => {
      e.stopPropagation();
      const params = new URLSearchParams();
      params.set("destination", String(destId));
      if (name) params.set("destinationName", name);
      navigate(`/booking?${params.toString()}`);
    },
    [destId, name, navigate],
  );

  const handleLearnMore = useCallback(
    (e) => { e.stopPropagation(); goDetail(); },
    [goDetail],
  );

  const handleDestinationLike = useCallback(async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      return;
    }
    if (!likeId || likeBusy) return;
    setLikeBusy(true);
    try { await toggleLike(likeId); } catch (error) { console.error("Could not update destination like:", error); }
    finally { setLikeBusy(false); }
  }, [isAuthenticated, openModal, likeId, likeBusy, toggleLike]);

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      setHeartAnim(true);
      window.setTimeout(() => setHeartAnim(false), 560);
      toggleWishlist(destId);
      const nextIsLiked = !isLiked;
      setShowFavouriteIcon(nextIsLiked);
      if (favouriteToastTimer.current) window.clearTimeout(favouriteToastTimer.current);
      favouriteToastTimer.current = window.setTimeout(() => setShowFavouriteIcon(false), 2000);
      onWishlistToggle?.(destId, nextIsLiked);
    },
    [destId, isLiked, toggleWishlist, onWishlistToggle],
  );

  const shareUrl = destId
    ? `https://www.altuverasafaris.com/destinations/${encodeURIComponent(String(destId))}`
    : "https://www.altuverasafaris.com/destinations";
  const shareTitle = `Discover ${name} with Altuvera Safaris`;
  const shareMessage = `${name}${locationStr ? ` — ${locationStr}` : ""}\n${blurb || "Discover this East African experience with Altuvera Safaris."}`;
  const shareTextWithLink = `${shareMessage}\n\nExplore this destination with Altuvera Safaris:\n${shareUrl}`;

  const showShareFeedback = useCallback((message) => {
    setShareFeedback(message);
    if (shareFeedbackTimer.current) window.clearTimeout(shareFeedbackTimer.current);
    shareFeedbackTimer.current = window.setTimeout(() => setShareFeedback(""), 4500);
  }, []);

  const handleShare = useCallback((event) => {
    event.stopPropagation();
    setShareFeedback("");
    setShareModalOpen(true);
  }, []);

  // Allow the browser/app share navigation to start before closing this portal.
  const handleShareLinkLaunch = useCallback(() => {
    window.setTimeout(() => setShareModalOpen(false), 650);
  }, []);

  const handleCopyShareLink = useCallback(async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const field = document.createElement("textarea");
        field.value = shareUrl;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        field.style.pointerEvents = "none";
        document.body.appendChild(field);
        field.select();
        const copiedToClipboard = document.execCommand("copy");
        field.remove();
        if (!copiedToClipboard) throw new Error("Clipboard access unavailable");
      }
      setCopied(true);
      showShareFeedback("Link copied — it’s ready to paste anywhere.");
      if (shareFeedbackTimer.current) window.clearTimeout(shareFeedbackTimer.current);
      shareFeedbackTimer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      showShareFeedback("Copying was blocked by your browser. You can still select the link above and copy it.");
    }
  }, [shareUrl, showShareFeedback]);

  // Keep link-first sharing reliable, and include the same caption/link when a photo is attached.
  const handleCopyShareCaption = useCallback(async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareTextWithLink);
      } else {
        const field = document.createElement("textarea");
        field.value = shareTextWithLink;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        field.style.pointerEvents = "none";
        document.body.appendChild(field);
        field.select();
        const copiedToClipboard = document.execCommand("copy");
        field.remove();
        if (!copiedToClipboard) throw new Error("Clipboard access unavailable");
      }
      showShareFeedback("Caption and destination link copied. Paste them into the post or message after attaching the photo.");
    } catch {
      showShareFeedback("Copying was blocked. Use the destination-link Copy button, or select the caption and copy it manually.");
    }
  }, [shareTextWithLink, showShareFeedback]);

  const handleNativeShare = useCallback(async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      showShareFeedback("Your browser does not offer a system share sheet. Choose an app above or copy the link.");
      return;
    }
    try {
      await navigator.share({ title: shareTitle, text: shareMessage, url: shareUrl });
      showShareFeedback("Destination details and link shared.");
    } catch (error) {
      if (error?.name !== "AbortError") showShareFeedback("The share sheet could not complete this action. Try Copy link or Copy caption + link.");
    }
  }, [shareTitle, shareTextWithLink, shareUrl, showShareFeedback]);

  const handlePhotoShare = useCallback(async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!shareImageFile || typeof navigator === "undefined" || typeof navigator.share !== "function" ||
        typeof navigator.canShare !== "function" || !navigator.canShare({ files: [shareImageFile] })) {
      showShareFeedback("Photo sharing isn't supported here. Use Share link & details or copy the caption manually if needed.");
      return;
    }
    try {
      // Android share targets may ignore the separate "url" field when a file is attached.
      // Send the URL as the *only* text so the link can accompany the image without the
      // long destination description being duplicated in the recipient's conversation.
      await navigator.share({ title: shareTitle, text: shareUrl, url: shareUrl, files: [shareImageFile] });
      showShareFeedback("Photo share completed. The image and destination URL were sent without the long caption. If your app still drops links on image shares, use Share link & details.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        showShareFeedback("Couldn't share the photo. Try Share link & details, or copy the caption manually if needed.");
      }
    }
  }, [shareTitle, shareUrl, shareImageFile, showShareFeedback]);

  /* ── render ── */
  return (
    <>
    <article className={`dc-card${compact ? " dc-card--compact" : ""}`}>

      {/* ════ IMAGE SECTION ════ */}
      <div className="dc-img-wrap">
        <div className="dc-img-frame">

          {cardImages.length > 0 ? (
            <ImageSlider images={cardImages} name={name} totalPhotoCount={safeImgs.length} />
          ) : (
            <div className="dc-img-placeholder">
              <FiCamera size={32} aria-hidden="true" />
              <span>No photo yet</span>
            </div>
          )}

          <div className="dc-img-overlay" aria-hidden="true" />
          {showFavouriteIcon && <span title="Favourite updated" aria-label="Favourite updated" style={{ position: "absolute", top: 12, right: 56, zIndex: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 999, color: "#be123c", background: "rgba(255,255,255,.96)", border: "1px solid rgba(251,113,133,.3)", boxShadow: "0 5px 18px rgba(15,23,42,.16)", pointerEvents: "none" }}><FiHeart size={15} fill="currentColor" aria-hidden="true" /></span>}
          <button type="button" className={`dc-live-like-label${destinationLikes.isLiked ? " dc-live-like-label--liked" : ""}`} onClick={handleDestinationLike} disabled={likeBusy || likesLoading} aria-label={destinationLikes.isLiked ? `Unlike ${name}` : `Like ${name}`} aria-pressed={destinationLikes.isLiked} title={destinationLikeError || (destinationLikes.isLiked ? "Unlike destination" : "Like destination")}>
            <FiThumbsUp size={17} aria-hidden="true" />
            <span className="dc-live-like-count">{Number(destinationLikes.total || 0).toLocaleString()}</span>
          </button>
          {destinationLikeError && <span className="dc-like-error" role="alert">{destinationLikeError}</span>}

          {(activeBadges.length > 0 || isEcoFriendly) && (
            <div className="dc-badges">
              {activeBadges.map((key, i) => {
                const { Icon, label, cls } = BADGE_CFG[key];
                return (
                  <span
                    key={key}
                    className={`dc-badge ${cls}`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <Icon size={9} aria-hidden="true" />
                    {label}
                  </span>
                );
              })}
              {isEcoFriendly && (
                <span className="dc-badge dc-badge--eco">🌿 Eco</span>
              )}
            </div>
          )}

          <div className="dc-actions">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={isLiked}
              className={[
                "dc-action-btn",
                isLiked   ? "dc-action-btn--liked"      : "",
                heartAnim ? "dc-action-btn--heart-anim" : "",
              ].filter(Boolean).join(" ")}
            >
              <FiHeart
                size={15}
                aria-hidden="true"
                style={{
                  fill:       isLiked ? "#ef4444" : "none",
                  color:      isLiked ? "#ef4444" : "#64748b",
                  transition: "all 0.2s ease",
                }}
              />
            </button>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={handleShare}
                aria-label={`Share ${name}`}
                aria-haspopup="dialog"
                aria-expanded={shareModalOpen}
                className={[
                  "dc-action-btn",
                  copied ? "dc-action-btn--copied" : "",
                ].filter(Boolean).join(" ")}
              >
                <FiShare2
                  size={14}
                  aria-hidden="true"
                  style={{ color: copied ? "#059669" : "#64748b" }}
                />
              </button>
              {copied && (
                <span className="dc-toast" role="status" aria-live="polite">
                  ✓ Link copied
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ════ CARD BODY ════ */}
      <div className="dc-body">

        <h3 className="dc-name">{name}</h3>

        {locationStr && (
          <div className="dc-location">
            <FiMapPin size={12} aria-hidden="true" />
            <span>{locationStr}</span>
            {safeCountryFlag && (
              <span className="dc-flag" aria-hidden="true">
                {safeCountryFlag}
              </span>
            )}
          </div>
        )}

        <div className="dc-stats">
          <Stars rating={ratingSummary?.rating ?? rating} count={ratingSummary?.count ?? reviewCount} onRate={openRatingModal} busy={ratingBusy} rated={false} userRating={myRating} message={ratingMessage} />

          {durationStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <FiClock size={11} aria-hidden="true" />
                <span>{durationStr}</span>
              </div>
            </>
          )}

          {groupStr && (
            <>
              <div className="dc-divider" aria-hidden="true" />
              <div className="dc-stat">
                <span aria-hidden="true" style={{ fontSize: 11 }}>👥</span>
                <span>{groupStr} pax</span>
              </div>
            </>
          )}
        </div>

        {!compact && blurb && (
          <p className="dc-desc">{blurb}</p>
        )}

        {(category || diffConf || (durationStr && !compact)) && (
          <div className="dc-chips">
            {category && (
              <span className="dc-chip dc-chip--cat">
                <FiCompass size={10} aria-hidden="true" />
                {String(category).replace(/_/g, " ")}
              </span>
            )}
            {durationStr && !compact && (
              <span className="dc-chip dc-chip--dur">
                <FiSun size={10} aria-hidden="true" />
                {durationStr}
              </span>
            )}
            {diffConf && (
              <span className={`dc-diff ${diffConf.cls}`}>
                <FiWind size={9} aria-hidden="true" />
                {diffConf.label}
              </span>
            )}
          </div>
        )}

        {!compact && highlights.length > 0 && (
          <div className="dc-highlights">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={`hl-${i}`} className="dc-hl">
                <FiSun size={9} aria-hidden="true" />
                {h}
              </span>
            ))}
            {highlights.length > 3 && (
              <span className="dc-hl-more">+{highlights.length - 3}</span>
            )}
          </div>
        )}


        <hr className="dc-sep" />

        <div className="dc-footer">
          <button
            className="dc-btn-learn"
            onClick={handleLearnMore}
            aria-label={`Learn more about ${name}`}
          >
            <span>Learn More</span>
            <FiArrowRight
              size={13}
              aria-hidden="true"
              className="dc-btn-arrow"
            />
          </button>

          <button
            className="dc-btn-book"
            onClick={goBook}
            aria-label={`Book ${name} now`}
          >
            <FiCalendar size={13} aria-hidden="true" />
            <span>Book Now</span>
          </button>
        </div>

      </div>
      {ratingModalOpen && (
        <div
          role="presentation"
          onClick={(event) => { event.stopPropagation(); setRatingModalOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 10000, display: "grid", placeItems: "center", overflowY: "auto", padding: "max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom))", background: "rgba(2, 20, 13, .64)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`dc-rating-title-${ratingId || "destination"}`}
            onClick={(event) => event.stopPropagation()}
            style={{ boxSizing: "border-box", width: "min(100%, 460px)", maxHeight: "min(88dvh, 760px)", overflowY: "auto", overscrollBehavior: "contain", padding: "clamp(18px, 4.5vw, 28px)", border: "1px solid rgba(255,255,255,.75)", borderRadius: "clamp(18px, 4vw, 26px)", background: "linear-gradient(155deg, #ffffff 0%, #f8fffb 100%)", boxShadow: "0 28px 90px rgba(0,0,0,.3)", color: "#0f172a", margin: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
              <div>
                <p style={{ margin: 0, color: "#047857", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Traveller review</p>
                <h3 id={`dc-rating-title-${ratingId || "destination"}`} style={{ margin: "6px 0 0", fontSize: 21, fontWeight: 800 }}>Rate {name}</h3>
              </div>
              <button type="button" onClick={() => setRatingModalOpen(false)} aria-label="Close rating dialog" style={{ border: 0, background: "#f1f5f9", borderRadius: 999, width: 34, height: 34, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <p style={{ margin: "12px 0 16px", color: "#64748b", fontSize: 13 }}>Your rating helps travellers discover experiences they will love.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "16px 0" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => myRating === null && setDraftRating(star)}
                  aria-label={`${star} out of 5 stars`} aria-pressed={draftRating === star}
                  disabled={myRating !== null}
                  style={{ border: 0, background: "transparent", padding: 4, cursor: myRating !== null ? "default" : "pointer", color: star <= (myRating ?? draftRating) ? "#f59e0b" : "#cbd5e1", transform: draftRating === star ? "scale(1.16)" : "scale(1)", transition: "transform .15s ease" }}>
                  <StarSVG filled={star <= (myRating ?? draftRating)} />
                </button>
              ))}
            </div>
            <p style={{ minHeight: 20, textAlign: "center", margin: "0 0 14px", color: ratingMessage && /couldn't|already|unable|failed/i.test(ratingMessage) ? "#b91c1c" : "#475569", fontSize: 13 }} role="status">
              {myRating !== null ? `You have already rated this destination ${myRating}/5.` : ratingMessage || (draftRating ? `${draftRating} out of 5 stars selected` : "Choose a star rating")}
            </p>
            {myRating === null && (
              <label style={{ display: "block", margin: "0 0 14px", color: "#334155", fontSize: 12, fontWeight: 700 }}>
                Your experience (optional)
                <textarea value={draftReview} onChange={(event) => setDraftReview(event.target.value.slice(0, 4000))}
                  maxLength={4000} rows={3} placeholder="Share a helpful comment for other travellers…"
                  style={{ display: "block", boxSizing: "border-box", width: "100%", marginTop: 7, padding: 11, border: "1px solid #cbd5e1", borderRadius: 10, resize: "vertical", font: "inherit", fontWeight: 400 }} />
                <span style={{ display: "block", marginTop: 4, color: "#94a3b8", textAlign: "right", fontWeight: 400 }}>{draftReview.length}/4000</span>
              </label>
            )}
            <button type="button" disabled={ratingBusy || myRating !== null || !draftRating}
              onClick={(event) => rateDestination(event, draftRating)}
              style={{ width: "100%", border: 0, borderRadius: 12, padding: "13px 16px", color: "#fff", background: ratingBusy || myRating !== null || !draftRating ? "#94a3b8" : "#047857", fontWeight: 800, cursor: ratingBusy || myRating !== null || !draftRating ? "not-allowed" : "pointer" }}>
              {ratingBusy ? "Saving rating…" : myRating !== null ? "Rating already submitted" : "Submit rating"}
            </button>
            <p style={{ margin: "12px 0 0", color: "#94a3b8", fontSize: 11, textAlign: "center" }}>One rating per traveller for each destination.</p>
          </section>
        </div>
      )}
    </article>
    {shareModalOpen && typeof document !== "undefined" && createPortal(
      <div className="dc-share-overlay" role="presentation" onClick={(event) => { event.stopPropagation(); setShareModalOpen(false); }}>
        <section className="dc-share-dialog" role="dialog" aria-modal="true" aria-labelledby={`dc-share-title-${destId || "destination"}`} onClick={(event) => event.stopPropagation()}>
          <div className="dc-share-grabber" aria-hidden="true" />
          <header className="dc-share-header">
            <div className="dc-share-header-copy">
              <span className="dc-share-eyebrow"><FiShare2 size={12} /> SHARE THE JOURNEY</span>
              <h2 id={`dc-share-title-${destId || "destination"}`}>Share this destination</h2>
              <p>Send a little East African inspiration to someone.</p>
            </div>
            <button type="button" className="dc-share-close" onClick={() => setShareModalOpen(false)} aria-label="Close share options"><FiX size={19} /></button>
          </header>
          <div className="dc-share-preview">
            {cardImages[0] ? <img src={cardImages[0]} alt="" className="dc-share-preview-image" /> : <div className="dc-share-preview-placeholder"><FiCompass size={25} /></div>}
            <div className="dc-share-preview-copy">
              <span>ALTUVERA SAFARIS</span><strong>{name}</strong>
              {locationStr && <small><FiMapPin size={12} /> {locationStr}</small>}
              <p>{blurb || "A destination worth discovering, curated by Altuvera Safaris."}</p>
            </div>
          </div>
          <div className="dc-share-section-head"><strong>Share using</strong><span>Choose an app</span></div>
          <div className="dc-share-app-grid">
            <a className="dc-share-app" href={`https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" onClick={handleShareLinkLaunch}>
              <span className="dc-share-app-icon dc-share-app-icon--whatsapp"><img src="https://cdn.simpleicons.org/whatsapp/25D366" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><FiMessageCircle size={23} /></span><span>WhatsApp</span>
            </a>
            <a className="dc-share-app" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer" onClick={handleShareLinkLaunch}>
              <span className="dc-share-app-icon dc-share-app-icon--facebook"><img src="https://cdn.simpleicons.org/facebook/0866FF" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><b>f</b></span><span>Facebook</span>
            </a>
            <a className="dc-share-app" href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer" onClick={handleShareLinkLaunch}>
              <span className="dc-share-app-icon dc-share-app-icon--telegram"><img src="https://cdn.simpleicons.org/telegram/26A5E4" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><FiSend size={22} /></span><span>Telegram</span>
            </a>
            <a className="dc-share-app" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" onClick={handleShareLinkLaunch}>
              <span className="dc-share-app-icon dc-share-app-icon--x"><img src="https://cdn.simpleicons.org/x/000000" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><b>𝕏</b></span><span>X</span>
            </a>
            <button type="button" className="dc-share-app" onClick={handlePhotoShare} disabled={shareImageStatus === "loading" || !shareImageFile} aria-label="Share destination photo using your device's apps">
              <span className="dc-share-app-icon dc-share-app-icon--instagram"><img src="https://cdn.simpleicons.org/instagram/E4405F" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><FiCamera size={22} /></span><span>Share photo</span>
            </button>
            <a className="dc-share-app" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" onClick={handleShareLinkLaunch}>
              <span className="dc-share-app-icon dc-share-app-icon--linkedin"><img src="https://cdn.simpleicons.org/linkedin/0A66C2" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><b>in</b></span><span>LinkedIn</span>
            </a>
            <a className="dc-share-app" href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareMessage}\n\n${shareUrl}`)}`} onClick={handleShareLinkLaunch}>
              <span className="dc-share-app-icon dc-share-app-icon--email"><img src="https://cdn.simpleicons.org/gmail/EA4335" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><FiMail size={22} /></span><span>Email</span>
            </a>
            <a className="dc-share-app" href={`sms:?body=${encodeURIComponent(`${shareMessage}\n${shareUrl}`)}`} onClick={handleShareLinkLaunch}>
              <span className="dc-share-app-icon dc-share-app-icon--sms"><img src="https://cdn.simpleicons.org/googlemessages/0B57D0" alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = "none"; }} /><FiMessageCircle size={22} /></span><span>Messages</span>
            </a>
            <button type="button" className="dc-share-app" onClick={handleCopyShareLink}>
              <span className={`dc-share-app-icon dc-share-app-icon--copy${copied ? " is-copied" : ""}`}>{copied ? <FiCheck size={22} /> : <FiCopy size={21} />}</span><span>{copied ? "Copied" : "Copy link"}</span>
            </button>
          </div>
          <div className="dc-share-link-box">
            <span className="dc-share-link-icon"><FiLink size={16} /></span>
            <div className="dc-share-link-value"><small>Destination link · tap to open</small><a href={shareUrl} title={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a></div>
            <button type="button" className="dc-share-copy-btn" onClick={handleCopyShareLink} aria-label="Copy destination link">
              {copied ? <FiCheck size={17} /> : <FiCopy size={17} />}<span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <button type="button" className="dc-share-native" onClick={handleNativeShare}>
              <FiLink size={18} />
              <span>
                <strong>Share link & details</strong>
                <small>Send the destination URL and caption through your device</small>
              </span>
              <FiChevronRight size={18} className="dc-share-native-arrow" />
            </button>
          )}
          <button type="button" className="dc-share-copy-caption" onClick={handleCopyShareCaption}>
            <FiCopy size={17} aria-hidden="true" />
            <span><strong>Copy caption + destination link</strong><small>Paste it into a post or message after attaching the photo.</small></span>
          </button>
          {shareFeedback && <p className="dc-share-feedback" role="status" aria-live="polite">{shareFeedback}</p>}
          <p className="dc-share-footnote">Photo shares include the link when the receiving app supports it. If an app drops the caption, paste the copied caption and destination URL into the post.</p>
        </section>
      </div>,
      document.body
    )}
    </>
  );
});

export default DestinationCard;// src/components/destinations/DestinationCard.jsx
