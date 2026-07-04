// src/components/maps/DestinationMap.jsx
import React, {
  useState, useEffect, useCallback, useRef, useMemo, memo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin, FiStar, FiArrowRight, FiX, FiMaximize2,
  FiMinimize2, FiLayers, FiNavigation, FiZoomIn,
  FiZoomOut, FiCompass, FiEye, FiCalendar, FiUsers,
  FiAward, FiTrendingUp, FiChevronRight, FiSearch,
  FiFilter, FiGlobe, FiCamera, FiWind,
} from "react-icons/fi";

/* ═════════════════════════════════════════════════════════
   CONFIG
═════════════════════════════════════════════════════════ */
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";
const API = import.meta.env.VITE_API_URL || "/api";

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8e6c9" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#388e3c" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bbdefb" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

const SATELLITE_STYLES = [];

const MAP_STYLE_DARK = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

const DIFFICULTY_COLORS = {
  easy: "#10b981",
  moderate: "#f59e0b",
  challenging: "#ef4444",
  difficult: "#8b5cf6",
  expert: "#ec4899",
};

const CATEGORY_ICONS = {
  safari: "🦁",
  beach: "🏖️",
  mountain: "⛰️",
  cultural: "🏛️",
  wildlife: "🐘",
  adventure: "🎒",
  eco_tourism: "🌿",
  gorilla_trekking: "🦍",
  bird_watching: "🦜",
  default: "📍",
};

const DEFAULT_CENTER = { lat: 0.5, lng: 32 };
const DEFAULT_ZOOM = 5;

/* ═════════════════════════════════════════════════════════
   STYLES
═════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ── Map Container ── */
.gm-wrap {
  --gm-green: #059669;
  --gm-green-l: #10b981;
  --gm-green-d: #047857;
  --gm-forest: #022c22;
  --gm-mint: #ecfdf5;
  --gm-text: #0f172a;
  --gm-text2: #475569;
  --gm-text3: #94a3b8;
  --gm-border: #e2e8f0;
  --gm-surface: #ffffff;
  --gm-radius: 16px;
  --gm-ease: cubic-bezier(0.22, 1, 0.36, 1);

  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  position: relative;
  width: 100%;
  border-radius: var(--gm-radius);
  overflow: hidden;
  border: 1px solid rgba(5,150,105,0.15);
  box-shadow:
    0 24px 60px rgba(2,44,34,0.12),
    0 4px 16px rgba(0,0,0,0.06);
}
.gm-wrap--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  border-radius: 0;
  border: none;
}

.gm-canvas {
  width: 100%;
  height: clamp(440px, 58vh, 640px);
  background: #e8f5e9;
  position: relative;
}
.gm-wrap--fullscreen .gm-canvas { height: 100%; }

/* ── Loading State ── */
.gm-loading {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  gap: 16px; z-index: 5;
}
.gm-loading__spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid #d1fae5;
  border-top-color: var(--gm-green);
  animation: gm-spin 0.7s linear infinite;
}
.gm-loading__text {
  font-size: 14px; color: var(--gm-text2); font-weight: 600;
}
@keyframes gm-spin { to { transform: rotate(360deg); } }
@keyframes gm-fade-in { from { opacity:0; } to { opacity:1; } }
@keyframes gm-slide-up {
  from { opacity:0; transform:translateY(12px); }
  to { opacity:1; transform:translateY(0); }
}
@keyframes gm-scale-in {
  from { opacity:0; transform:scale(0.9) translateY(8px); }
  to { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes gm-pulse {
  0%,100% { transform:scale(1); }
  50% { transform:scale(1.1); }
}
@keyframes gm-marker-drop {
  0% { transform: translateY(-30px) scale(0.7); opacity:0; }
  60% { transform: translateY(4px) scale(1.05); opacity:1; }
  100% { transform: translateY(0) scale(1); opacity:1; }
}

/* ── Toolbar ── */
.gm-toolbar {
  position: absolute; top: 14px; left: 14px; right: 14px;
  z-index: 10;
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
}
.gm-toolbar__search {
  flex: 1; min-width: 200px; max-width: 360px;
  position: relative;
}
.gm-toolbar__search-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%);
  color: var(--gm-text3); pointer-events: none;
}
.gm-toolbar__search-input {
  width: 100%; padding: 10px 38px 10px 38px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  font-size: 13px; font-weight: 500;
  color: var(--gm-text);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  font-family: inherit;
  transition: all 0.25s ease;
}
.gm-toolbar__search-input:focus {
  outline: none;
  border-color: var(--gm-green);
  background: rgba(255,255,255,0.98);
  box-shadow: 0 4px 20px rgba(5,150,105,0.15);
}
.gm-toolbar__search-clear {
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%);
  width: 22px; height: 22px; border-radius: 50%;
  border: none; background: #f1f5f9;
  display: grid; place-items: center;
  cursor: pointer; color: var(--gm-text2);
  transition: all 0.2s;
}
.gm-toolbar__search-clear:hover {
  background: #fee2e2; color: #dc2626;
}

.gm-toolbar__pills {
  display: flex; gap: 6px; overflow-x: auto;
  scrollbar-width: none; -ms-overflow-style: none;
  padding: 2px 0;
}
.gm-toolbar__pills::-webkit-scrollbar { display: none; }
.gm-toolbar__pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(12px);
  color: var(--gm-text2);
  font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.25s var(--gm-ease);
}
.gm-toolbar__pill:hover {
  background: rgba(255,255,255,0.96);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
}
.gm-toolbar__pill--active {
  background: var(--gm-green);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(5,150,105,0.35);
}
.gm-toolbar__pill--active:hover {
  background: var(--gm-green-d);
}

/* ── Controls ── */
.gm-controls {
  position: absolute; right: 14px; bottom: 80px;
  z-index: 10;
  display: flex; flex-direction: column; gap: 6px;
}
.gm-ctrl-btn {
  width: 42px; height: 42px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  display: grid; place-items: center;
  cursor: pointer; color: var(--gm-text);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transition: all 0.25s var(--gm-ease);
  position: relative;
}
.gm-ctrl-btn:hover {
  background: rgba(255,255,255,0.98);
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
.gm-ctrl-btn--active {
  background: var(--gm-green);
  color: #fff;
  border-color: transparent;
}
.gm-ctrl-btn--active:hover {
  background: var(--gm-green-d);
}
.gm-ctrl-btn__tooltip {
  position: absolute; right: calc(100% + 8px); top: 50%;
  transform: translateY(-50%);
  background: var(--gm-forest);
  color: #fff; font-size: 11px; font-weight: 600;
  padding: 5px 10px; border-radius: 8px;
  white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity 0.2s;
}
.gm-ctrl-btn:hover .gm-ctrl-btn__tooltip { opacity: 1; }

/* ── Stats Bar ── */
.gm-stats-bar {
  position: absolute; bottom: 14px; left: 14px; right: 14px;
  z-index: 10;
  display: flex; align-items: center;
  gap: clamp(6px, 1vw, 12px);
  justify-content: center;
  flex-wrap: wrap;
}
.gm-stat-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  font-size: 12px; font-weight: 600;
  color: var(--gm-text);
  animation: gm-slide-up 0.5s var(--gm-ease) both;
}
.gm-stat-chip__num {
  font-weight: 800; color: var(--gm-green);
  font-size: 14px;
}

/* ── Country List Sidebar ── */
.gm-sidebar {
  position: absolute; left: 14px; top: 60px; bottom: 56px;
  width: clamp(220px, 26vw, 280px);
  z-index: 10;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 14px;
  border: 1px solid rgba(5,150,105,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: gm-slide-up 0.4s var(--gm-ease);
}
.gm-sidebar--hidden { display: none; }
.gm-sidebar__header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--gm-border);
  display: flex; align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.gm-sidebar__title {
  font-size: 13px; font-weight: 700;
  color: var(--gm-text); margin: 0;
  display: flex; align-items: center; gap: 6px;
}
.gm-sidebar__close {
  width: 26px; height: 26px; border-radius: 8px;
  border: 1px solid var(--gm-border);
  background: #f8fafb; cursor: pointer;
  display: grid; place-items: center;
  color: var(--gm-text2);
  transition: all 0.2s;
}
.gm-sidebar__close:hover {
  background: #fee2e2; border-color: #fca5a5; color: #dc2626;
}
.gm-sidebar__list {
  flex: 1; overflow-y: auto;
  padding: 6px;
  scrollbar-width: thin;
  scrollbar-color: #d1fae5 transparent;
}
.gm-sidebar__item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s var(--gm-ease);
  border: 1px solid transparent;
}
.gm-sidebar__item:hover {
  background: var(--gm-mint);
  border-color: #a7f3d0;
}
.gm-sidebar__item--active {
  background: var(--gm-mint);
  border-color: var(--gm-green);
}
.gm-sidebar__item-flag {
  font-size: 20px; line-height: 1; flex-shrink: 0;
}
.gm-sidebar__item-info { min-width: 0; }
.gm-sidebar__item-name {
  font-size: 13px; font-weight: 700;
  color: var(--gm-text);
  white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis;
}
.gm-sidebar__item-meta {
  font-size: 11px; color: var(--gm-text3);
  font-weight: 500;
}
.gm-sidebar__item-count {
  margin-left: auto; flex-shrink: 0;
  background: var(--gm-mint);
  color: var(--gm-green);
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 999px;
  border: 1px solid #a7f3d0;
}

/* ── Info Window ── */
.gm-info {
  position: absolute; z-index: 20;
  width: clamp(280px, 32vw, 340px);
  background: var(--gm-surface);
  border-radius: 18px;
  box-shadow:
    0 20px 50px rgba(2,44,34,0.18),
    0 4px 14px rgba(0,0,0,0.06);
  border: 1px solid rgba(5,150,105,0.12);
  overflow: hidden;
  animation: gm-scale-in 0.35s var(--gm-ease);
  cursor: default;
  pointer-events: auto;
}
.gm-info__img {
  width: 100%; height: 140px;
  object-fit: cover; object-position: center;
  display: block;
  background: linear-gradient(135deg, #f0fdf4, #e2e8f0);
}
.gm-info__badges {
  position: absolute; top: 10px; left: 10px;
  display: flex; gap: 5px; z-index: 2;
}
.gm-info__badge {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 3px 9px; border-radius: 8px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
  backdrop-filter: blur(8px);
}
.gm-info__badge--featured {
  background: rgba(16,185,129,0.9); color: #fff;
}
.gm-info__badge--popular {
  background: rgba(251,191,36,0.9); color: #78350f;
}
.gm-info__close {
  position: absolute; top: 10px; right: 10px;
  width: 30px; height: 30px; border-radius: 10px;
  border: none;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  color: #fff; display: grid; place-items: center;
  cursor: pointer; z-index: 2;
  transition: all 0.2s;
}
.gm-info__close:hover {
  background: rgba(220,38,38,0.8);
  transform: scale(1.1);
}
.gm-info__body {
  padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.gm-info__category-icon {
  position: absolute; top: 118px; right: 16px;
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--gm-surface);
  border: 2px solid var(--gm-surface);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  display: grid; place-items: center;
  font-size: 18px; z-index: 2;
}
.gm-info__name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 17px; font-weight: 400;
  color: var(--gm-text); margin: 0;
  line-height: 1.25;
}
.gm-info__location {
  display: flex; align-items: center; gap: 5px;
  color: var(--gm-text3); font-size: 12px; font-weight: 500;
}
.gm-info__location svg { color: var(--gm-green-l); flex-shrink: 0; }

.gm-info__stats {
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap;
}
.gm-info__stat {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--gm-text2);
}
.gm-info__stat svg { flex-shrink: 0; }
.gm-info__stat--rating svg { color: #f59e0b; }
.gm-info__stat--diff { font-weight: 700; }

.gm-info__desc {
  font-size: 12.5px; color: var(--gm-text2);
  line-height: 1.65; margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.gm-info__actions {
  display: flex; gap: 8px; margin-top: 4px;
}
.gm-info__btn {
  flex: 1; display: inline-flex;
  align-items: center; justify-content: center;
  gap: 6px; padding: 9px 14px;
  border-radius: 10px; border: none;
  font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.3s var(--gm-ease);
  text-decoration: none;
}
.gm-info__btn--primary {
  background: linear-gradient(135deg, var(--gm-green-l), var(--gm-green));
  color: #fff;
  box-shadow: 0 4px 12px rgba(5,150,105,0.25);
}
.gm-info__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(5,150,105,0.4);
}
.gm-info__btn--secondary {
  background: var(--gm-mint);
  color: var(--gm-green);
  border: 1px solid #a7f3d0;
}
.gm-info__btn--secondary:hover {
  background: #dcfce7;
  transform: translateY(-2px);
}

/* ── No API Key Fallback ── */
.gm-no-key {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; padding: 48px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  text-align: center;
  height: 100%;
}
.gm-no-key__icon { font-size: 48px; }
.gm-no-key h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 22px; color: var(--gm-forest);
  margin: 0;
}
.gm-no-key p {
  font-size: 14px; color: var(--gm-text2);
  max-width: 400px; line-height: 1.7;
  margin: 0;
}

/* ── Cluster ── */
.gm-cluster {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gm-green-l), var(--gm-green));
  color: #fff; font-weight: 800; font-size: 14px;
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(5,150,105,0.35);
  cursor: pointer;
  transition: all 0.3s ease;
}
.gm-cluster:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 24px rgba(5,150,105,0.5);
}
.gm-cluster--large {
  width: 52px; height: 52px; font-size: 16px;
  background: linear-gradient(135deg, #059669, #022c22);
}

/* ── Custom Marker ── */
.gm-marker {
  cursor: pointer;
  transition: all 0.3s var(--gm-ease);
  animation: gm-marker-drop 0.5s var(--gm-ease) both;
  position: relative;
}
.gm-marker:hover {
  transform: scale(1.15) translateY(-4px);
  z-index: 100 !important;
}
.gm-marker__pin {
  width: 38px; height: 38px; border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: grid; place-items: center;
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  position: relative;
}
.gm-marker__pin-icon {
  transform: rotate(45deg);
  font-size: 14px; line-height: 1;
}
.gm-marker__label {
  position: absolute; top: calc(100% + 4px);
  left: 50%; transform: translateX(-50%);
  background: rgba(2,44,34,0.85);
  backdrop-filter: blur(8px);
  color: #fff; font-size: 10px; font-weight: 700;
  padding: 3px 8px; border-radius: 6px;
  white-space: nowrap;
  opacity: 0; transition: opacity 0.2s;
  pointer-events: none;
}
.gm-marker:hover .gm-marker__label { opacity: 1; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .gm-sidebar { display: none; }
  .gm-toolbar { flex-direction: column; align-items: stretch; }
  .gm-toolbar__search { max-width: none; }
  .gm-toolbar__pills { justify-content: flex-start; }
  .gm-info { width: clamp(260px, 90vw, 320px); }
  .gm-controls { bottom: 64px; }
}
@media (max-width: 480px) {
  .gm-canvas { height: clamp(360px, 70vh, 500px); }
  .gm-info { width: calc(100vw - 28px); }
  .gm-info__img { height: 120px; }
  .gm-stats-bar { flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  .gm-marker, .gm-info, .gm-sidebar,
  .gm-stat-chip, .gm-ctrl-btn {
    animation: none !important;
    transition: none !important;
  }
}
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("gm-map-styles")) return;
  const el = document.createElement("style");
  el.id = "gm-map-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* ═════════════════════════════════════════════════════════
   GOOGLE MAPS LOADER
═════════════════════════════════════════════════════════ */
let _loadPromise = null;

function loadGoogleMaps() {
  if (_loadPromise) return _loadPromise;
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  _loadPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_KEY) {
      reject(new Error("No Google Maps API key"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return _loadPromise;
}

/* ═════════════════════════════════════════════════════════
   DATA FETCHING
═════════════════════════════════════════════════════════ */
async function fetchMapData() {
  const res = await fetch(`${API}/destinations/map?limit=500`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

async function fetchCountries() {
  const res = await fetch(`${API}/countries?limit=50`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  return json.data || json.countries || [];
}

/* ═════════════════════════════════════════════════════════
   INFO WINDOW COMPONENT
═════════════════════════════════════════════════════════ */
function InfoPanel({ dest, onClose, onExplore, onBook }) {
  if (!dest) return null;

  const catIcon = CATEGORY_ICONS[dest.category] || CATEGORY_ICONS.default;
  const diffColor = DIFFICULTY_COLORS[dest.difficulty] || "#6b7280";
  const imgUrl = dest.imageUrl || dest.image_url ||
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80";

  return (
    <div className="gm-info">
      <div style={{ position: "relative" }}>
        <img
          src={imgUrl}
          alt={dest.name}
          className="gm-info__img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80";
          }}
        />
        <div className="gm-info__category-icon">{catIcon}</div>

        <div className="gm-info__badges">
          {dest.isFeatured && (
            <span className="gm-info__badge gm-info__badge--featured">
              <FiAward size={9} /> Featured
            </span>
          )}
          {dest.isPopular && (
            <span className="gm-info__badge gm-info__badge--popular">
              <FiTrendingUp size={9} /> Popular
            </span>
          )}
        </div>

        <button className="gm-info__close" onClick={onClose} aria-label="Close">
          <FiX size={14} />
        </button>
      </div>

      <div className="gm-info__body">
        <h4 className="gm-info__name">{dest.name}</h4>

        <div className="gm-info__location">
          <FiMapPin size={12} />
          <span>
            {[dest.country?.name, dest.country?.flag].filter(Boolean).join(" ")}
          </span>
        </div>

        <div className="gm-info__stats">
          {dest.rating > 0 && (
            <span className="gm-info__stat gm-info__stat--rating">
              <FiStar size={12} fill="#f59e0b" />
              <strong>{Number(dest.rating).toFixed(1)}</strong>
              {dest.reviewCount > 0 && (
                <span style={{ color: "#94a3b8" }}>
                  ({dest.reviewCount})
                </span>
              )}
            </span>
          )}
          {dest.difficulty && (
            <span
              className="gm-info__stat gm-info__stat--diff"
              style={{ color: diffColor }}
            >
              <FiWind size={11} />
              {dest.difficulty}
            </span>
          )}
          {dest.category && (
            <span className="gm-info__stat">
              {catIcon} {dest.category.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {dest.shortDescription && (
          <p className="gm-info__desc">{dest.shortDescription}</p>
        )}

        <div className="gm-info__actions">
          <button className="gm-info__btn gm-info__btn--secondary" onClick={onBook}>
            <FiCalendar size={12} /> Book
          </button>
          <button className="gm-info__btn gm-info__btn--primary" onClick={onExplore}>
            Explore <FiArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   MAIN MAP COMPONENT
═════════════════════════════════════════════════════════ */
const DestinationMap = memo(function DestinationMap({
  height,
  destinations: propDests,
  countries: propCountries,
  showToolbar = true,
  showSidebar = true,
  showControls = true,
  showStats = true,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  category: initialCategory = "all",
  onMarkerClick,
}) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const overlayRefs = useRef([]);
  const infoOverlayRef = useRef(null);

  /* ── State ── */
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState(propDests || []);
  const [countries, setCountries] = useState(propCountries || []);
  const [selected, setSelected] = useState(null);
  const [infoPos, setInfoPos] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [mapStyle, setMapStyle] = useState("default");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);
  const [activeCountry, setActiveCountry] = useState(null);

  useEffect(() => { injectStyles(); }, []);

  /* ── Fetch data if not provided ── */
  useEffect(() => {
    if (propDests?.length) return;
    fetchMapData()
      .then(setDestinations)
      .catch((e) => console.warn("Map data fetch failed:", e.message));
  }, [propDests]);

  useEffect(() => {
    if (propCountries?.length) return;
    fetchCountries()
      .then(setCountries)
      .catch((e) => console.warn("Countries fetch failed:", e.message));
  }, [propCountries]);

  /* ── Filter destinations ── */
  const filtered = useMemo(() => {
    let list = destinations.filter(
      (d) => d.position?.lat && d.position?.lng
    );

    if (category !== "all") {
      list = list.filter((d) => d.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) =>
        (d.name || "").toLowerCase().includes(q) ||
        (d.country?.name || "").toLowerCase().includes(q)
      );
    }

    if (activeCountry) {
      list = list.filter(
        (d) =>
          d.country?.slug === activeCountry ||
          d.country?.name === activeCountry
      );
    }

    return list;
  }, [destinations, category, search, activeCountry]);

  /* ── Categories ── */
  const categories = useMemo(() => {
    const map = {};
    destinations.forEach((d) => {
      if (d.category) {
        map[d.category] = (map[d.category] || 0) + 1;
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [destinations]);

  /* ── Country stats ── */
  const countryList = useMemo(() => {
    const map = {};
    destinations.forEach((d) => {
      const cn = d.country?.name;
      if (!cn) return;
      if (!map[cn]) {
        map[cn] = {
          name: cn,
          slug: d.country.slug,
          flag: d.country.flag || "",
          count: 0,
          lat: d.position.lat,
          lng: d.position.lng,
        };
      }
      map[cn].count++;
    });

    // Merge with prop countries
    countries.forEach((c) => {
      const name = c.name;
      if (!map[name] && c.latitude && c.longitude) {
        map[name] = {
          name,
          slug: c.slug,
          flag: c.flag || c.flag_url || "",
          count: c.destination_count || c.destinationCount || 0,
          lat: parseFloat(c.latitude),
          lng: parseFloat(c.longitude),
        };
      }
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [destinations, countries]);

  /* ── Init Google Maps ── */
  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
          clickableIcons: false,
          minZoom: 3,
          maxZoom: 18,
        });

        mapInstanceRef.current = map;
        setLoaded(true);

        map.addListener("click", () => setSelected(null));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => { cancelled = true; };
  }, []);

  /* ── Render Markers ── */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !loaded) return;

    // Clear existing
    markersRef.current.forEach((m) => {
      if (m.setMap) m.setMap(null);
      if (m.map) m.map = null;
    });
    overlayRefs.current.forEach((o) => {
      if (o.setMap) o.setMap(null);
    });
    markersRef.current = [];
    overlayRefs.current = [];

    if (!filtered.length) return;

    const google = window.google;
    if (!google?.maps) return;

    const bounds = new google.maps.LatLngBounds();

    filtered.forEach((dest, i) => {
      const pos = { lat: dest.position.lat, lng: dest.position.lng };
      bounds.extend(pos);

      const catIcon = CATEGORY_ICONS[dest.category] || CATEGORY_ICONS.default;
      const diffColor = DIFFICULTY_COLORS[dest.difficulty] || "#059669";

      // Create custom overlay
      const markerDiv = document.createElement("div");
      markerDiv.className = "gm-marker";
      markerDiv.style.animationDelay = `${Math.min(i, 20) * 0.03}s`;
      markerDiv.innerHTML = `
        <div class="gm-marker__pin" style="background:${dest.isFeatured ? "linear-gradient(135deg,#f59e0b,#d97706)" : `linear-gradient(135deg,${diffColor},${diffColor}dd)`}">
          <span class="gm-marker__pin-icon">${catIcon}</span>
        </div>
        <div class="gm-marker__label">${dest.name}</div>
      `;

      markerDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelected(dest);
        onMarkerClick?.(dest);

        // Position info window near marker
        const mapDiv = mapRef.current;
        if (mapDiv) {
          const rect = mapDiv.getBoundingClientRect();
          const proj = map.getProjection();
          if (proj) {
            const latLng = new google.maps.LatLng(pos.lat, pos.lng);
            const worldPoint = proj.fromLatLngToPoint(latLng);
            const zoom = map.getZoom();
            const scale = Math.pow(2, zoom);
            const topRight = proj.fromLatLngToPoint(map.getBounds().getNorthEast());
            const bottomLeft = proj.fromLatLngToPoint(map.getBounds().getSouthWest());

            const pixelX = (worldPoint.x - bottomLeft.x) * scale;
            const pixelY = (worldPoint.y - topRight.y) * scale;

            setInfoPos({
              x: Math.min(Math.max(pixelX, 160), rect.width - 180),
              y: Math.min(Math.max(pixelY - 160, 10), rect.height - 320),
            });
          }
        }
      });

      markerDiv.addEventListener("mouseenter", () => {
        markerDiv.style.zIndex = "100";
      });
      markerDiv.addEventListener("mouseleave", () => {
        markerDiv.style.zIndex = "";
      });

      // Use OverlayView for custom HTML markers
      const overlay = new google.maps.OverlayView();
      overlay.onAdd = function () {
        const pane = this.getPanes().overlayMouseTarget;
        pane.appendChild(markerDiv);
      };
      overlay.draw = function () {
        const projection = this.getProjection();
        const point = projection.fromLatLngToDivPixel(
          new google.maps.LatLng(pos.lat, pos.lng)
        );
        if (point) {
          markerDiv.style.position = "absolute";
          markerDiv.style.left = `${point.x - 19}px`;
          markerDiv.style.top = `${point.y - 38}px`;
        }
      };
      overlay.onRemove = function () {
        if (markerDiv.parentNode) {
          markerDiv.parentNode.removeChild(markerDiv);
        }
      };
      overlay.setMap(map);
      overlayRefs.current.push(overlay);
    });

    // Fit bounds
    if (filtered.length > 1) {
      map.fitBounds(bounds, {
        padding: {
          top: 80,
          right: showSidebar && sidebarOpen ? 320 : 60,
          bottom: 80,
          left: 60,
        },
      });
    } else if (filtered.length === 1) {
      map.setCenter({
        lat: filtered[0].position.lat,
        lng: filtered[0].position.lng,
      });
      map.setZoom(10);
    }
  }, [filtered, loaded, sidebarOpen]);

  /* ── Map Controls ── */
  const handleZoomIn = useCallback(() => {
    mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 5) + 1);
  }, []);
  const handleZoomOut = useCallback(() => {
    mapInstanceRef.current?.setZoom((mapInstanceRef.current.getZoom() || 5) - 1);
  }, []);

  const handleStyleToggle = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const next = mapStyle === "default" ? "satellite" : mapStyle === "satellite" ? "dark" : "default";
    setMapStyle(next);
    if (next === "satellite") {
      map.setMapTypeId("hybrid");
      map.setOptions({ styles: SATELLITE_STYLES });
    } else if (next === "dark") {
      map.setMapTypeId("roadmap");
      map.setOptions({ styles: MAP_STYLE_DARK });
    } else {
      map.setMapTypeId("roadmap");
      map.setOptions({ styles: MAP_STYLES });
    }
  }, [mapStyle]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((p) => !p);
    setTimeout(() => {
      window.google?.maps?.event?.trigger(mapInstanceRef.current, "resize");
    }, 100);
  }, []);

  const handleResetView = useCallback(() => {
    mapInstanceRef.current?.setCenter(initialCenter);
    mapInstanceRef.current?.setZoom(initialZoom);
    setActiveCountry(null);
    setSelected(null);
    setSearch("");
    setCategory("all");
  }, [initialCenter, initialZoom]);

  const handleCountryClick = useCallback(
    (country) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      setActiveCountry(
        activeCountry === country.slug ? null : country.slug || country.name
      );
      if (country.lat && country.lng) {
        map.panTo({ lat: country.lat, lng: country.lng });
        map.setZoom(7);
      }
      setSelected(null);
    },
    [activeCountry]
  );

  const handleExplore = useCallback(() => {
    if (selected?.slug) navigate(`/destinations/${selected.slug}`);
  }, [selected, navigate]);

  const handleBook = useCallback(() => {
    if (selected) {
      const params = new URLSearchParams();
      params.set("destination", String(selected.id || selected.slug));
      if (selected.name) params.set("destinationName", selected.name);
      navigate(`/booking?${params.toString()}`);
    }
  }, [selected, navigate]);

  /* ── Render ── */
  return (
    <div className={`gm-wrap${isFullscreen ? " gm-wrap--fullscreen" : ""}`}>
      <div
        className="gm-canvas"
        style={height ? { height } : undefined}
      >
        {/* Map Container */}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

        {/* Loading */}
        {!loaded && !error && (
          <div className="gm-loading">
            <div className="gm-loading__spinner" />
            <span className="gm-loading__text">Loading map…</span>
          </div>
        )}

        {/* No API Key / Error */}
        {error && (
          <div className="gm-no-key">
            <div className="gm-no-key__icon">🗺️</div>
            <h3>Interactive Map</h3>
            <p>
              {GOOGLE_MAPS_KEY
                ? "Map could not load. Please try refreshing."
                : "Configure VITE_GOOGLE_MAPS_KEY to enable the interactive map."}
            </p>
          </div>
        )}

        {/* Toolbar */}
        {loaded && showToolbar && (
          <div className="gm-toolbar">
            <div className="gm-toolbar__search">
              <FiSearch size={14} className="gm-toolbar__search-icon" />
              <input
                type="text"
                className="gm-toolbar__search-input"
                placeholder="Search destinations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="gm-toolbar__search-clear"
                  onClick={() => setSearch("")}
                >
                  <FiX size={11} />
                </button>
              )}
            </div>

            <div className="gm-toolbar__pills">
              <button
                className={`gm-toolbar__pill${category === "all" ? " gm-toolbar__pill--active" : ""}`}
                onClick={() => { setCategory("all"); setActiveCountry(null); }}
              >
                🌍 All
              </button>
              {categories.map(([cat, count]) => (
                <button
                  key={cat}
                  className={`gm-toolbar__pill${category === cat ? " gm-toolbar__pill--active" : ""}`}
                  onClick={() => setCategory(category === cat ? "all" : cat)}
                >
                  {CATEGORY_ICONS[cat] || "📍"} {cat.replace(/_/g, " ")}
                  <span style={{ opacity: 0.7 }}>({count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar */}
        {loaded && showSidebar && (
          <div className={`gm-sidebar${!sidebarOpen ? " gm-sidebar--hidden" : ""}`}>
            <div className="gm-sidebar__header">
              <h4 className="gm-sidebar__title">
                <FiGlobe size={14} /> Countries
              </h4>
              <button
                className="gm-sidebar__close"
                onClick={() => setSidebarOpen(false)}
              >
                <FiX size={12} />
              </button>
            </div>
            <div className="gm-sidebar__list">
              {countryList.map((c) => (
                <div
                  key={c.slug || c.name}
                  className={`gm-sidebar__item${
                    activeCountry === (c.slug || c.name) ? " gm-sidebar__item--active" : ""
                  }`}
                  onClick={() => handleCountryClick(c)}
                >
                  <span className="gm-sidebar__item-flag">
                    {c.flag && !c.flag.startsWith("http") ? c.flag : <FiGlobe size={16} color="#059669" />}
                  </span>
                  <div className="gm-sidebar__item-info">
                    <div className="gm-sidebar__item-name">{c.name}</div>
                    <div className="gm-sidebar__item-meta">
                      {c.count} destination{c.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {c.count > 0 && (
                    <span className="gm-sidebar__item-count">{c.count}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        {loaded && showControls && (
          <div className="gm-controls">
            <button className="gm-ctrl-btn" onClick={handleZoomIn}>
              <FiZoomIn size={16} />
              <span className="gm-ctrl-btn__tooltip">Zoom In</span>
            </button>
            <button className="gm-ctrl-btn" onClick={handleZoomOut}>
              <FiZoomOut size={16} />
              <span className="gm-ctrl-btn__tooltip">Zoom Out</span>
            </button>
            <button
              className={`gm-ctrl-btn${mapStyle !== "default" ? " gm-ctrl-btn--active" : ""}`}
              onClick={handleStyleToggle}
            >
              <FiLayers size={16} />
              <span className="gm-ctrl-btn__tooltip">
                {mapStyle === "default" ? "Satellite" : mapStyle === "satellite" ? "Dark" : "Default"}
              </span>
            </button>
            <button className="gm-ctrl-btn" onClick={handleResetView}>
              <FiCompass size={16} />
              <span className="gm-ctrl-btn__tooltip">Reset View</span>
            </button>
            <button className="gm-ctrl-btn" onClick={handleFullscreen}>
              {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              <span className="gm-ctrl-btn__tooltip">
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </span>
            </button>
            {!sidebarOpen && showSidebar && (
              <button className="gm-ctrl-btn" onClick={() => setSidebarOpen(true)}>
                <FiGlobe size={16} />
                <span className="gm-ctrl-btn__tooltip">Countries</span>
              </button>
            )}
          </div>
        )}

        {/* Stats Bar */}
        {loaded && showStats && (
          <div className="gm-stats-bar">
            <div className="gm-stat-chip" style={{ animationDelay: "0s" }}>
              <FiMapPin size={13} color="#059669" />
              <span className="gm-stat-chip__num">{filtered.length}</span>
              <span>Destinations</span>
            </div>
            <div className="gm-stat-chip" style={{ animationDelay: "0.08s" }}>
              <FiGlobe size={13} color="#059669" />
              <span className="gm-stat-chip__num">{countryList.length}</span>
              <span>Countries</span>
            </div>
            {activeCountry && (
              <div className="gm-stat-chip" style={{ animationDelay: "0.16s" }}>
                <FiFilter size={13} color="#059669" />
                <span>Showing: <strong>{activeCountry}</strong></span>
                <button
                  onClick={() => { setActiveCountry(null); handleResetView(); }}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", color: "#dc2626",
                    marginLeft: 4, padding: 0,
                  }}
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Panel */}
        {selected && (
          <div
            style={{
              position: "absolute",
              left: `${infoPos.x}px`,
              top: `${infoPos.y}px`,
              zIndex: 20,
            }}
          >
            <InfoPanel
              dest={selected}
              onClose={() => setSelected(null)}
              onExplore={handleExplore}
              onBook={handleBook}
            />
          </div>
        )}
      </div>
    </div>
  );
});

/* ═════════════════════════════════════════════════════════
   LOADING SKELETON
═════════════════════════════════════════════════════════ */
export function DestinationMapSkeleton() {
  useEffect(() => { injectStyles(); }, []);
  return (
    <div className="gm-wrap">
      <div className="gm-canvas">
        <div className="gm-loading">
          <div className="gm-loading__spinner" />
          <span className="gm-loading__text">Preparing map…</span>
        </div>
      </div>
    </div>
  );
}

export default DestinationMap;