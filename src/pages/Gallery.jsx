// src/pages/Gallery.jsx

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  memo,
  createContext,
  useContext,
  useReducer,
  lazy,
  Suspense,
} from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiHome,
  FiGrid,
  FiMaximize2,
  FiMinimize2,
  FiDownload,
  FiShare2,
  FiHeart,
  FiInfo,
  FiSearch,
  FiFilter,
  FiCamera,
  FiImage,
  FiZoomIn,
  FiZoomOut,
  FiArrowUp,
  FiCompass,
  FiStar,
  FiPlay,
  FiPause,
  FiColumns,
  FiList,
  FiAlertCircle,
  FiClock,
  FiCalendar,
  FiSliders,
  FiRefreshCw,
  FiCopy,
  FiExternalLink,
  FiMap,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiShuffle,
  FiRotateCw,
  FiSettings,
  FiTrash2,
  FiBookmark,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import { useGallery } from "../hooks/useGallery";
import { BRAND_LOGO_ALT, getBrandLogoUrl } from "../utils/seo";

/* ═══════════════════════════════════════════════════════
   CONSTANTS & CONFIGURATION
   ═══════════════════════════════════════════════════════ */
const CONFIG = {
  HERO_SLIDE_INTERVAL: 5000,
  SCROLL_THRESHOLD: 500,
  TOUCH_THRESHOLD: 50,
  DEBOUNCE_DELAY: 300,
  AUTOSAVE_DELAY: 1000,
  TOAST_DURATION: 3000,
  SLIDESHOW_INTERVAL: 4000,
  ZOOM_STEP: 0.25,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3,
  IMAGES_PER_PAGE: 12,
  PRELOAD_COUNT: 2,
};

const STORAGE_KEYS = {
  FAVORITES: "gallery_favorites",
  LAYOUT: "gallery_layout",
  CATEGORY: "gallery_category",
  SORT: "gallery_sort",
  VIEWED: "gallery_viewed",
  PREFERENCES: "gallery_preferences",
};

const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

const SORT_OPTIONS = [
  { value: "default", label: "Default", icon: <FiLayers size={14} /> },
  { value: "title-asc", label: "Title A-Z", icon: <FiArrowUp size={14} /> },
  {
    value: "title-desc",
    label: "Title Z-A",
    icon: <FiArrowUp size={14} style={{ transform: "rotate(180deg)" }} />,
  },
  { value: "location", label: "Location", icon: <FiMapPin size={14} /> },
  { value: "featured", label: "Featured First", icon: <FiStar size={14} /> },
  { value: "recent", label: "Recently Viewed", icon: <FiClock size={14} /> },
];

const LAYOUTS = [
  { value: "grid", label: "Grid", icon: <FiGrid size={16} /> },
  { value: "masonry", label: "Masonry", icon: <FiColumns size={16} /> },
  { value: "list", label: "List", icon: <FiList size={16} /> },
  { value: "compact", label: "Compact", icon: <FiLayers size={16} /> },
];

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap');

  :root {
    --gl-green-50: #ECFDF5;
    --gl-green-100: #D1FAE5;
    --gl-green-200: #A7F3D0;
    --gl-green-300: #6EE7B7;
    --gl-green-400: #34D399;
    --gl-green-500: #10B981;
    --gl-green-600: #059669;
    --gl-green-700: #047857;
    --gl-green-800: #065F46;
    --gl-green-900: #064E3B;
    --gl-white: #FFFFFF;
    --gl-off-white: #FAFDF7;
    --gl-gray-50: #F9FAFB;
    --gl-gray-100: #F3F4F6;
    --gl-gray-200: #E5E7EB;
    --gl-gray-300: #D1D5DB;
    --gl-gray-400: #9CA3AF;
    --gl-gray-500: #6B7280;
    --gl-gray-600: #4B5563;
    --gl-gray-700: #374151;
    --gl-gray-800: #1F2937;
    --gl-gray-900: #111827;
    --gl-shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
    --gl-shadow-md: 0 4px 20px rgba(0,0,0,0.08);
    --gl-shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
    --gl-shadow-xl: 0 25px 60px rgba(0,0,0,0.16);
    --gl-shadow-green: 0 8px 30px rgba(5,150,105,0.25);
    --gl-radius-sm: 8px;
    --gl-radius-md: 14px;
    --gl-radius-lg: 20px;
    --gl-radius-xl: 28px;
    --gl-radius-full: 9999px;
    --gl-transition: cubic-bezier(0.4, 0, 0.2, 1);
    --gl-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes zoomIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }

  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes heartBeat {
    0% { transform: scale(1); }
    14% { transform: scale(1.3); }
    28% { transform: scale(1); }
    42% { transform: scale(1.3); }
    70% { transform: scale(1); }
  }

  @keyframes heroTextGlow {
    from { text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    to { text-shadow: 0 8px 40px rgba(0,0,0,0.7); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes progressBar {
    from { width: 0%; }
    to { width: 100%; }
  }

  @keyframes ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  /* Hero Section */
  .gl-hero {
    position: relative;
    height: 75vh;
    min-height: 520px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    overflow: hidden;
    background: #064E3B;
  }

  .gl-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 0%, rgba(6,78,59,0.4) 100%);
    z-index: 1;
    pointer-events: none;
  }

  .gl-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(6,78,59,0.3) 0%,
      rgba(6,78,59,0.15) 40%,
      rgba(6,78,59,0.5) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  .gl-slide {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1.5s ease-in-out, transform 8s ease;
    transform: scale(1.05);
    will-change: opacity, transform;
  }

  .gl-slide.active {
    opacity: 1;
    transform: scale(1);
  }

  .gl-hero-content {
    position: relative;
    z-index: 2;
    max-width: 900px;
    padding: 0 24px;
  }

  .gl-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    animation: heroTextGlow 3s infinite alternate ease-in-out;
    margin-bottom: 16px;
    line-height: 1.1;
  }

  .gl-hero p {
    font-family: 'Inter', sans-serif;
    font-size: clamp(1rem, 2vw, 1.4rem);
    font-weight: 300;
    margin-bottom: 24px;
    opacity: 0.9;
    line-height: 1.6;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .gl-breadcrumbs {
    display: flex;
    justify-content: center;
    gap: 8px;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.8);
    flex-wrap: wrap;
  }

  .gl-breadcrumbs a {
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(12px);
    padding: 8px 18px;
    border-radius: var(--gl-radius-full);
    transition: all 0.3s var(--gl-transition);
    border: 1px solid rgba(255,255,255,0.15);
    font-weight: 500;
    font-size: 14px;
  }

  .gl-breadcrumbs a:hover {
    background: rgba(255,255,255,0.22);
    transform: translateY(-2px);
  }

  /* Scrollbar */
  .gl-scrollbar-thin::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
  .gl-scrollbar-thin::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.03);
    border-radius: 4px;
  }
  .gl-scrollbar-thin::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #059669, #34D399);
    border-radius: 4px;
  }

  .gl-scrollbar-hidden::-webkit-scrollbar { display: none; }
  .gl-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }

  /* Focus */
  .gl-focus-ring:focus-visible {
    outline: 2px solid var(--gl-green-600);
    outline-offset: 2px;
  }

  .gl-focus-ring:focus:not(:focus-visible) {
    outline: none;
  }

  /* Buttons */
  .gl-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s var(--gl-transition);
    box-shadow: var(--gl-shadow-green);
    position: relative;
    overflow: hidden;
  }
  
  .gl-btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.2),
      transparent
    );
    transition: left 0.5s;
  }
  
  .gl-btn-primary:hover::before {
    left: 100%;
  }
  
  .gl-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 40px rgba(5,150,105,0.35);
  }
  
  .gl-btn-primary:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }
  
  .gl-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .gl-btn-secondary {
    background: white;
    color: #059669;
    border: 2px solid #E5E7EB;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s var(--gl-transition);
    box-shadow: var(--gl-shadow-sm);
  }
  
  .gl-btn-secondary:hover:not(:disabled) {
    border-color: #059669;
    transform: translateY(-2px);
    box-shadow: var(--gl-shadow-md);
  }

  .gl-btn-ghost {
    background: transparent;
    color: #374151;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .gl-btn-ghost:hover {
    color: #059669;
    background: #ECFDF5;
  }

  /* Lightbox */
  .gl-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(6,30,20,0.97);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  }

  .gl-lightbox-image {
    max-height: 80vh;
    max-width: 85vw;
    border-radius: var(--gl-radius-xl);
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
    border: 3px solid rgba(255,255,255,0.1);
    animation: zoomIn 0.35s var(--gl-spring);
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
    cursor: grab;
    transition: transform 0.2s ease;
  }
  
  .gl-lightbox-image.zoomed {
    cursor: move;
  }
  
  .gl-lightbox-image.dragging {
    cursor: grabbing;
    transition: none;
  }

  .gl-lightbox-btn {
    position: absolute;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s var(--gl-transition);
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.15);
    color: white;
  }
  
  .gl-lightbox-btn:hover {
    background: rgba(5,150,105,0.8);
    border-color: rgba(5,150,105,0.8);
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(5,150,105,0.4);
  }
  
  .gl-lightbox-btn:active {
    transform: scale(0.95);
  }

  .gl-lightbox-info {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(20px);
    padding: 18px 32px;
    border-radius: var(--gl-radius-xl);
    display: flex;
    gap: 20px;
    align-items: center;
    color: white;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    max-width: 90vw;
    animation: slideUp 0.4s var(--gl-spring) 0.1s both;
  }

  .gl-lightbox-counter {
    position: absolute;
    top: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    padding: 8px 20px;
    border-radius: var(--gl-radius-full);
    color: white;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(255,255,255,0.1);
    animation: fadeDown 0.4s var(--gl-spring) 0.1s both;
  }
  
  .gl-lightbox-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #34D399, #059669);
    border-radius: 0 3px 3px 0;
  }

  .gl-lightbox-sidebar {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 320px;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(16px);
    padding: 24px;
    overflow-y: auto;
    animation: slideInRight 0.4s var(--gl-spring);
    border-left: 1px solid rgba(255,255,255,0.1);
  }

  .gl-lightbox-thumbnails {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    padding: 8px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    border-radius: var(--gl-radius-lg);
    max-width: 80vw;
    overflow-x: auto;
    scrollbar-width: none;
    animation: slideUp 0.4s var(--gl-spring) 0.2s both;
  }
  
  .gl-lightbox-thumbnails::-webkit-scrollbar {
    display: none;
  }
  
  .gl-lightbox-thumb {
    width: 60px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    cursor: pointer;
    opacity: 0.5;
    transition: all 0.3s;
    border: 2px solid transparent;
    flex-shrink: 0;
  }
  
  .gl-lightbox-thumb:hover {
    opacity: 0.8;
  }
  
  .gl-lightbox-thumb.active {
    opacity: 1;
    border-color: #34D399;
    box-shadow: 0 0 12px rgba(52,211,153,0.5);
  }

  /* Card */
  .gl-card {
    position: relative;
    border-radius: var(--gl-radius-xl);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s var(--gl-transition);
    background: white;
    border: 2px solid transparent;
    box-shadow: var(--gl-shadow-md);
    transform-origin: center;
    will-change: transform, box-shadow;
  }

  .gl-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 30px 60px rgba(5,150,105,0.18);
    border-color: rgba(5,150,105,0.2);
    z-index: 10;
  }
  
  .gl-card.selected {
    border-color: #059669;
    box-shadow: 0 0 0 4px rgba(5,150,105,0.2);
  }

  .gl-card img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
    transition: transform 0.6s var(--gl-transition);
    user-select: none;
    -webkit-user-drag: none;
  }

  .gl-card:hover img {
    transform: scale(1.12);
  }

  .gl-card-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(6,78,59,0.95));
    color: white;
    padding: 24px;
    backdrop-filter: blur(4px);
    transform: translateY(100%);
    transition: transform 0.4s var(--gl-transition);
    pointer-events: none;
  }

  .gl-card:hover .gl-card-overlay {
    transform: translateY(0);
  }

  .gl-card-zoom {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(5,150,105,0.9), rgba(4,120,87,0.9));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s var(--gl-spring);
    box-shadow: 0 8px 24px rgba(5,150,105,0.4);
    pointer-events: none;
  }

  .gl-card:hover .gl-card-zoom {
    transform: translate(-50%, -50%) scale(1);
  }
  
  .gl-card-actions {
    position: absolute;
    top: 14px;
    right: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s var(--gl-transition);
    z-index: 5;
  }
  
  .gl-card:hover .gl-card-actions {
    opacity: 1;
    transform: translateX(0);
  }
  
  .gl-card-action-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #374151;
    transition: all 0.3s;
    box-shadow: var(--gl-shadow-sm);
  }
  
  .gl-card-action-btn:hover {
    transform: scale(1.15);
    background: white;
  }
  
  .gl-card-action-btn.favorited {
    color: #EF4444;
    animation: heartBeat 0.6s ease;
  }

  /* Masonry layout */
  .gl-masonry {
    columns: 3;
    column-gap: 24px;
  }
  .gl-masonry-item {
    break-inside: avoid;
    margin-bottom: 24px;
    display: inline-block;
    width: 100%;
  }

  /* Compact layout */
  .gl-compact {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
  
  .gl-compact .gl-card img {
    height: 140px;
  }
  
  .gl-compact .gl-card-overlay {
    padding: 12px;
  }
  
  .gl-compact .gl-card-overlay h3 {
    font-size: 0.95rem !important;
    margin-bottom: 4px !important;
  }

  /* List layout */
  .gl-list-item {
    display: flex;
    gap: 20px;
    background: white;
    border-radius: var(--gl-radius-lg);
    overflow: hidden;
    box-shadow: var(--gl-shadow-md);
    transition: all 0.3s var(--gl-transition);
    border: 2px solid transparent;
    cursor: pointer;
  }

  .gl-list-item:hover {
    transform: translateX(8px);
    box-shadow: var(--gl-shadow-lg);
    border-color: rgba(5,150,105,0.2);
  }
  
  .gl-list-item.selected {
    border-color: #059669;
    background: #ECFDF5;
  }

  /* Filter Panel */
  .gl-filter-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 380px;
    max-width: 100vw;
    background: white;
    box-shadow: -10px 0 40px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideInRight 0.3s var(--gl-spring);
    overflow-y: auto;
  }
  
  .gl-filter-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    animation: fadeIn 0.2s;
  }

  /* Toast notification */
  .gl-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: white;
    padding: 16px 24px;
    border-radius: var(--gl-radius-lg);
    box-shadow: var(--gl-shadow-xl);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    animation: slideInRight 0.3s var(--gl-spring);
    border-left: 4px solid var(--gl-green-600);
    max-width: calc(100vw - 48px);
  }
  
  .gl-toast.error {
    border-left-color: #EF4444;
  }
  
  .gl-toast.warning {
    border-left-color: #F59E0B;
  }
  
  .gl-toast.info {
    border-left-color: #0891B2;
  }

  /* Dropdown */
  .gl-dropdown {
    position: relative;
  }
  
  .gl-dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 200px;
    background: white;
    border-radius: var(--gl-radius-lg);
    box-shadow: var(--gl-shadow-xl);
    border: 1px solid #E5E7EB;
    z-index: 100;
    animation: scaleIn 0.2s var(--gl-spring);
    transform-origin: top right;
    overflow: hidden;
  }
  
  .gl-dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-size: 14px;
    color: #374151;
  }
  
  .gl-dropdown-item:hover {
    background: #F3F4F6;
  }
  
  .gl-dropdown-item.active {
    background: #ECFDF5;
    color: #059669;
    font-weight: 600;
  }

  /* Tooltip */
  .gl-tooltip {
    position: relative;
  }
  
  .gl-tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    background: #1F2937;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s;
    z-index: 100;
  }
  
  .gl-tooltip:hover::after {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  /* Selection Mode */
  .gl-selection-bar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 16px 28px;
    border-radius: var(--gl-radius-xl);
    box-shadow: var(--gl-shadow-xl);
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 100;
    animation: slideUp 0.3s var(--gl-spring);
    border: 2px solid #E5E7EB;
  }

  /* Responsive */
  @media (max-width: 1280px) {
    .gl-masonry { columns: 3; }
    .gl-compact { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  }

  @media (max-width: 1024px) {
    .gl-masonry { columns: 2; }
    .gl-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .gl-lightbox-sidebar { width: 280px; }
  }

  @media (max-width: 768px) {
    .gl-hero { height: 60vh; min-height: 400px; }
    .gl-filter-bar { flex-direction: column !important; }
    .gl-search-wrap { max-width: 100% !important; }
    .gl-category-scroll { width: 100% !important; }
    .gl-masonry { columns: 1; }
    .gl-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
    .gl-stats-row { flex-direction: column !important; }
    .gl-list-item { flex-direction: column; }
    .gl-filter-panel { width: 100%; }
    .gl-lightbox-info {
      flex-direction: column;
      gap: 12px;
      text-align: center;
      padding: 16px 20px;
      border-radius: var(--gl-radius-lg);
      bottom: 100px;
    }
    .gl-lightbox-btn { width: 44px; height: 44px; }
    .gl-lightbox-sidebar { display: none; }
    .gl-lightbox-thumbnails { bottom: 16px; }
    .gl-toast { right: 16px; bottom: 16px; left: 16px; }
    .gl-selection-bar { 
      width: calc(100% - 32px); 
      flex-wrap: wrap;
      justify-content: center;
      padding: 12px 16px;
      gap: 12px;
    }
  }

  @media (max-width: 480px) {
    .gl-card img { height: 220px; }
    .gl-compact .gl-card img { height: 120px; }
    .gl-hero { height: 55vh; min-height: 350px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media print {
    .gl-hero { height: auto; min-height: auto; page-break-after: always; }
    .gl-lightbox, .gl-toast, .gl-filter-panel { display: none !important; }
    .gl-card { break-inside: avoid; page-break-inside: avoid; }
  }
`;

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const heroImages = [
  {
    url: "https://i.pinimg.com/736x/17/3a/c4/173ac4d9888d328b75ac60e588501223.jpg",
    alt: "Safari landscape with acacia trees",
  },
  {
    url: "https://i.pinimg.com/736x/68/e6/cd/68e6cd9f11e9fd00ea3fb928103b8f2b.jpg",
    alt: "Wildlife in African savanna",
  },
  {
    url: "https://i.pinimg.com/736x/a5/f9/7b/a5f97b55b11b4edea1d93523ebebec28.jpg",
    alt: "Tropical beach paradise",
  },
  {
    url: "https://i.pinimg.com/1200x/09/50/d1/0950d1603c5db63616bd4ba472417273.jpg",
    alt: "Cultural heritage site",
  },
  {
    url: "https://i.pinimg.com/736x/1f/8e/71/1f8e71660a3c9341025268f50b91e6bd.jpg",
    alt: "Mountain adventure",
  },
];

const categories = [
  "all",
  "wildlife",
  "landscapes",
  "culture",
  "adventure",
  "beaches",
];

const categoryMeta = {
  all: {
    icon: <FiGrid size={14} />,
    color: "#059669",
    label: "All Photos",
    emoji: "🌍",
  },
  wildlife: {
    icon: <FiCamera size={14} />,
    color: "#059669",
    label: "Wildlife",
    emoji: "🦁",
  },
  landscapes: {
    icon: <FiImage size={14} />,
    color: "#0891B2",
    label: "Landscapes",
    emoji: "🏔️",
  },
  culture: {
    icon: <FiCompass size={14} />,
    color: "#7C3AED",
    label: "Culture",
    emoji: "🎭",
  },
  adventure: {
    icon: <FiStar size={14} />,
    color: "#EA580C",
    label: "Adventure",
    emoji: "🧗",
  },
  beaches: {
    icon: <FiPlay size={14} />,
    color: "#DB2777",
    label: "Beaches",
    emoji: "🏖️",
  },
};

const images = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=1200",
    thumb: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=200",
    category: "wildlife",
    title: "Lion at Dawn",
    location: "Maasai Mara, Rwanda",
    description:
      "The king of the savannah wakes to the golden sunrise, surveying his domain with regal presence.",
    featured: true,
    tags: ["lion", "sunrise", "maasai mara", "predator", "big cat"],
    date: "2024-01-15",
    photographer: "Safari Pro",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200",
    thumb: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=200",
    category: "wildlife",
    title: "Zebra Crossing",
    location: "Serengeti, Tanzania",
    description:
      "Stripes blur as the herd moves across the plains in their eternal migration.",
    tags: ["zebra", "serengeti", "migration", "herd"],
    date: "2024-02-10",
    photographer: "Nature Lens",
  },
  {
    id: 3,
    src: "https://i.pinimg.com/736x/1f/23/6f/1f236fcbf71dfb2418310a3f348a282d.jpg",
    thumb: "https://i.pinimg.com/736x/26/13/a4/2613a46cebebc11e9918a071ae731da8.jpg",
    category: "wildlife",
    title: "Mountain Gorilla",
    location: "Bwindi, Uganda",
    description:
      "A gentle giant in the misty rainforest, eyes full of ancient wisdom.",
    featured: true,
    tags: ["gorilla", "uganda", "rainforest", "primate"],
    date: "2024-01-20",
    photographer: "Wildlife Focus",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1200",
    thumb: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=200",
    category: "wildlife",
    title: "Elephant Herd",
    location: "Amboseli, Rwanda",
    description:
      "Matriarchs leading the way with Kilimanjaro watching over the ancient ritual.",
    tags: ["elephant", "amboseli", "kilimanjaro", "family"],
    date: "2024-03-05",
    photographer: "Safari Pro",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200",
    thumb: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200",
    category: "wildlife",
    title: "Cheetah Speed",
    location: "Serengeti, Tanzania",
    description:
      "The fastest land animal on the hunt, muscles rippling with explosive power.",
    tags: ["cheetah", "speed", "predator", "hunt"],
    date: "2024-02-28",
    photographer: "Action Wildlife",
  },
  {
    id: 6,
    src: "https://i.pinimg.com/736x/dd/f4/9d/ddf49dfd5f7192060fa9a5854dd04677.jpg",
    thumb: "https://i.pinimg.com/1200x/b8/9e/84/b89e845ed13c17320c2d3b4f05e28c9a.jpg",
    category: "wildlife",
    title: "Giraffe Sunset",
    location: "Musanze, Rwanda",
    description:
      "Towering silhouettes against the African dusk, nature's skyscrapers.",
    tags: ["giraffe", "sunset", "silhouette", "dusk"],
    date: "2024-01-30",
    photographer: "Golden Hour",
  },
  {
    id: 7,
    src: "https://i.pinimg.com/736x/36/f6/51/36f651f2a6456b18602a2a6a7ba4e976.jpg",
    thumb: "https://i.pinimg.com/736x/9f/70/fa/9f70fa48cbc07c3401afa86369c999e6.jpg",
    category: "landscapes",
    title: "Mount Rwanda",
    location: "Rwanda",
    description:
      "Snow-capped peaks nearly on the equator, Africa's second highest mountain.",
    tags: ["mountain", "snow", "peak", "equator"],
    date: "2024-02-15",
    photographer: "Peak Views",
  },
  {
    id: 8,
    src: "https://i.pinimg.com/736x/96/5a/c2/965ac2884e636cc9d2584b1257f04879.jpg",
    thumb: "https://i.pinimg.com/736x/6b/68/4a/6b684aa6f5b793647eebd8adbcd973bf.jpg",
    category: "landscapes",
    title: "Ngorongoro Crater",
    location: "Tanzania",
    description:
      "A natural amphitheater teeming with wildlife, the world's largest intact caldera.",
    featured: true,
    tags: ["crater", "landscape", "unesco", "caldera"],
    date: "2024-03-10",
    photographer: "Aerial Africa",
  },
  {
    id: 9,
    src: "https://i.pinimg.com/1200x/6d/44/df/6d44dfdbe9f06622d92a92ab3d574546.jpg",
    thumb: "https://i.pinimg.com/1200x/55/a9/e2/55a9e2811aff4371a7472d3fa95f59b6.jpg",
    category: "landscapes",
    title: "Volcanoes Park",
    location: "Rwanda",
    description:
      "Lush volcanic slopes where the endangered mountain gorillas make their home.",
    tags: ["volcano", "rwanda", "forest", "mist"],
    date: "2024-01-25",
    photographer: "Green Vistas",
  },
 
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
    thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200",
    category: "landscapes",
    title: "Great Rift Valley",
    location: "Rwanda",
    description:
      "Earth's ancient scar stretching to the horizon, a geological wonder.",
    tags: ["rift valley", "geology", "vista", "horizon"],
    date: "2024-03-01",
    photographer: "Geological Views",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200",
    thumb: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=200",
    category: "culture",
    title: "Lalibela Churches",
    location: "Ethiopia",
    description:
      "Rock-hewn wonders of faith and engineering, carved from living stone.",
    tags: ["church", "ethiopia", "heritage", "rock"],
    date: "2024-01-18",
    photographer: "Heritage Lens",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=1200",
    thumb: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=200",
    category: "culture",
    title: "Maasai Elders",
    location: "Rwanda",
    description:
      "Keepers of tradition in vibrant shúkàs, guardians of ancient wisdom.",
    tags: ["maasai", "culture", "tradition", "elders"],
    date: "2024-02-05",
    photographer: "Cultural Stories",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1529078155055-5d1f45d98bc5?w=1200",
    thumb: "https://images.unsplash.com/photo-1529078155055-5d1f45d98bc5?w=200",
    category: "culture",
    title: "Ethiopian Coffee",
    location: "Addis Ababa",
    description:
      "The birthplace of coffee, brewed with ceremony and centuries of tradition.",
    tags: ["coffee", "ceremony", "ethiopia", "tradition"],
    date: "2024-02-12",
    photographer: "Coffee Culture",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?w=1200",
    thumb: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?w=200",
    category: "culture",
    title: "Swahili Coast",
    location: "Lamu, Rwanda",
    description:
      "Ancient dhows and coral stone alleys, where African and Arabian cultures blend.",
    tags: ["swahili", "dhow", "coast", "lamu"],
    date: "2024-03-15",
    photographer: "Coastal Heritage",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200",
    thumb: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200",
    category: "adventure",
    title: "Kilimanjaro Summit",
    location: "Tanzania",
    description:
      "Standing at the roof of Africa, above the clouds, touching the sky.",
    tags: ["kilimanjaro", "summit", "mountain", "climb"],
    date: "2024-01-22",
    photographer: "Summit Stories",
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=1200",
    thumb: "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=200",
    category: "adventure",
    title: "Whitewater Rafting",
    location: "Jinja, Uganda",
    description:
      "Conquering the Nile's wild rapids, adrenaline meets ancient waters.",
    tags: ["rafting", "nile", "adventure", "rapids"],
    date: "2024-02-25",
    photographer: "Adventure Shots",
  },
  {
    id: 17,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200",
    category: "adventure",
    title: "Hot Air Balloon",
    location: "Serengeti",
    description:
      "Silent drift over the endless plains at dawn, the ultimate safari view.",
    tags: ["balloon", "safari", "aerial", "sunrise"],
    date: "2024-03-08",
    photographer: "Sky Views",
  },
  {
    id: 18,
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
    thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200",
    category: "beaches",
    title: "Diani Beach",
    location: "Rwanda",
    description:
      "Powder-white sand and turquoise Indian Ocean, paradise found.",
    tags: ["beach", "ocean", "paradise", "sand"],
    date: "2024-01-28",
    photographer: "Beach Life",
  },
  {
    id: 19,
    src: "https://images.unsplash.com/photo-1590523277543-a94c2e4ebc9b?w=1200",
    thumb: "https://images.unsplash.com/photo-1590523277543-a94c2e4ebc9b?w=200",
    category: "beaches",
    title: "Zanzibar Sunset",
    location: "Tanzania",
    description:
      "Spice island skies painted in orange and purple, a daily masterpiece.",
    tags: ["zanzibar", "sunset", "beach", "spice"],
    date: "2024-02-18",
    photographer: "Island Dreams",
  },
  {
    id: 20,
    src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200",
    thumb: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200",
    category: "beaches",
    title: "Paje Beach",
    location: "Zanzibar",
    description:
      "Kite surfers glide over shallow turquoise lagoons, wind and water dance.",
    tags: ["kite surfing", "lagoon", "zanzibar", "sports"],
    date: "2024-03-02",
    photographer: "Water Sports",
  },
  {
    id: 21,
    src: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200",
    thumb: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=200",
    category: "beaches",
    title: "Mnemba Island",
    location: "Tanzania",
    description:
      "An exclusive atoll surrounded by coral gardens, underwater paradise.",
    tags: ["island", "coral", "diving", "exclusive"],
    date: "2024-03-12",
    photographer: "Underwater World",
  },
];

/* ═══════════════════════════════════════════════════════
   CONTEXT & STATE MANAGEMENT
   ═══════════════════════════════════════════════════════ */
const GalleryContext = createContext(null);

const galleryReducer = (state, action) => {
  switch (action.type) {
    case "SET_CATEGORY":
      return { ...state, selectedCategory: action.payload };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "SET_LAYOUT":
      return { ...state, layout: action.payload };
    case "SET_SORT":
      return { ...state, sortBy: action.payload };
    case "TOGGLE_FAVORITE":
      const newFavorites = state.favorites.includes(action.payload)
        ? state.favorites.filter((id) => id !== action.payload)
        : [...state.favorites, action.payload];
      return { ...state, favorites: newFavorites };
    case "ADD_VIEWED":
      if (state.recentlyViewed.includes(action.payload)) {
        return {
          ...state,
          recentlyViewed: [
            action.payload,
            ...state.recentlyViewed.filter((id) => id !== action.payload),
          ].slice(0, 20),
        };
      }
      return {
        ...state,
        recentlyViewed: [action.payload, ...state.recentlyViewed].slice(0, 20),
      };
    case "TOGGLE_SELECTION":
      const newSelected = state.selectedImages.includes(action.payload)
        ? state.selectedImages.filter((id) => id !== action.payload)
        : [...state.selectedImages, action.payload];
      return { ...state, selectedImages: newSelected };
    case "SELECT_ALL":
      return { ...state, selectedImages: action.payload };
    case "CLEAR_SELECTION":
      return { ...state, selectedImages: [] };
    case "SET_FILTER_PANEL":
      return { ...state, showFilterPanel: action.payload };
    case "SET_FAVORITES_ONLY":
      return { ...state, showFavoritesOnly: action.payload };
    case "RESET_FILTERS":
      return {
        ...state,
        selectedCategory: "all",
        searchQuery: "",
        sortBy: "default",
        showFavoritesOnly: false,
      };
    default:
      return state;
  }
};

/* ═══════════════════════════════════════════════════════
   CUSTOM HOOKS
   ═══════════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return size;
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      Object.entries(shortcuts).forEach(([combo, callback]) => {
        const parts = combo.toLowerCase().split("+");
        const requiresCtrl = parts.includes("ctrl");
        const requiresShift = parts.includes("shift");
        const targetKey = parts[parts.length - 1];

        if (
          key === targetKey &&
          ctrl === requiresCtrl &&
          shift === requiresShift
        ) {
          e.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};

const useIntersectionObserver = (callback, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting, entry);
    }, options);

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [callback, options]);

  return ref;
};

const useImagePreloader = (imageUrls) => {
  const [loaded, setLoaded] = useState(new Set());

  useEffect(() => {
    imageUrls.forEach((url) => {
      if (!loaded.has(url)) {
        const img = new Image();
        img.onload = () => setLoaded((prev) => new Set([...prev, url]));
        img.src = url;
      }
    });
  }, [imageUrls, loaded]);

  return loaded;
};

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

// Pill Button Component
const Pill = memo(
  ({
    children,
    icon,
    active,
    onClick,
    count,
    variant = "default",
    size = "md",
    className = "",
  }) => {
    const sizes = {
      sm: { padding: "5px 12px", fontSize: "11px" },
      md: { padding: "10px 22px", fontSize: "13px" },
      lg: { padding: "12px 26px", fontSize: "14px" },
    };

    const variants = {
      default: {
        backgroundColor: active ? "#059669" : "white",
        color: active ? "white" : "#374151",
        border: active ? "2px solid #059669" : "2px solid #E5E7EB",
        boxShadow: active ? "var(--gl-shadow-green)" : "var(--gl-shadow-sm)",
      },
      glass: {
        backgroundColor: active
          ? "rgba(5,150,105,0.8)"
          : "rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
        color: "white",
        border: active
          ? "1px solid rgba(5,150,105,0.9)"
          : "1px solid rgba(255,255,255,0.15)",
      },
      subtle: {
        backgroundColor: active ? "#ECFDF5" : "#F9FAFB",
        color: active ? "#059669" : "#6B7280",
        border: active ? "1px solid #D1FAE5" : "1px solid transparent",
      },
    };

    return (
      <button
        onClick={onClick}
        className={`gl-focus-ring ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          borderRadius: "var(--gl-radius-full)",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.3s var(--gl-transition)",
          whiteSpace: "nowrap",
          textTransform: "capitalize",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.2px",
          ...sizes[size],
          ...variants[variant],
        }}
      >
        {icon}
        <span>{children}</span>
        {count !== undefined && (
          <span
            style={{
              backgroundColor: active ? "rgba(255,255,255,0.2)" : "#E5E7EB",
              padding: "2px 8px",
              borderRadius: "var(--gl-radius-full)",
              fontSize: "11px",
              fontWeight: 700,
              marginLeft: 2,
            }}
          >
            {count}
          </span>
        )}
      </button>
    );
  },
);

Pill.displayName = "Pill";

// Toast Notification
const Toast = memo(({ message, type = "success", onClose, action }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, CONFIG.TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <FiCheck size={20} color="#059669" />,
    error: <FiAlertCircle size={20} color="#EF4444" />,
    warning: <FiAlertCircle size={20} color="#F59E0B" />,
    info: <FiInfo size={20} color="#0891B2" />,
  };

  return (
    <div className={`gl-toast ${type}`} role="alert" aria-live="polite">
      {icons[type]}
      <span
        style={{ fontSize: 14, fontWeight: 500, color: "#374151", flex: 1 }}
      >
        {message}
      </span>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: "none",
            border: "none",
            color: "#059669",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="gl-focus-ring"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          display: "flex",
          color: "#9CA3AF",
          borderRadius: 4,
        }}
        aria-label="Close notification"
      >
        <FiX size={16} />
      </button>
    </div>
  );
});

Toast.displayName = "Toast";

// Image Skeleton Loader
const ImageSkeleton = memo(({ height = 280, style = {} }) => (
  <div
    style={{
      height,
      background:
        "linear-gradient(110deg, #e8f5e9 8%, #f1f8f2 18%, #e8f5e9 33%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease infinite",
      borderRadius: "var(--gl-radius-xl)",
      ...style,
    }}
    aria-hidden="true"
  />
));

ImageSkeleton.displayName = "ImageSkeleton";

// Dropdown Component
const Dropdown = memo(
  ({ trigger, children, isOpen, onClose, align = "right" }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen, onClose]);

    return (
      <div className="gl-dropdown" ref={dropdownRef}>
        {trigger}
        {isOpen && (
          <div
            className="gl-dropdown-menu"
            style={{ [align === "left" ? "left" : "right"]: 0 }}
            role="menu"
          >
            {children}
          </div>
        )}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

// Stats Card
const StatCard = memo(({ icon, value, label, trend, delay = 0 }) => (
  <div
    style={{
      flex: "1 1 180px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "16px 20px",
      backgroundColor: "white",
      borderRadius: "var(--gl-radius-lg)",
      border: "1px solid #F3F4F6",
      boxShadow: "var(--gl-shadow-sm)",
      transition: "all 0.3s var(--gl-transition)",
      animation: `fadeUp 0.5s ease ${delay}s both`,
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "var(--gl-shadow-md)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "var(--gl-shadow-sm)";
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#059669",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {value}
        {trend && (
          <span
            style={{
              fontSize: 11,
              color: trend > 0 ? "#059669" : "#EF4444",
              fontWeight: 600,
            }}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#9CA3AF",
          fontWeight: 500,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

// Hero Slideshow
const HeroSlideshow = memo(({ images, activeIndex, onSlideChange }) => {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {images.map((img, idx) => {
        const url = img?.url || getBrandLogoUrl();
        const alt = img?.alt || BRAND_LOGO_ALT;
        return (
          <div
            key={idx}
            className={`gl-slide ${idx === activeIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${url})` }}
            role="img"
            aria-label={alt}
            aria-hidden={idx !== activeIndex}
          />
        );
      })}
    </div>
  );
});

HeroSlideshow.displayName = "HeroSlideshow";

// Gallery Card Component
const GalleryCard = memo(
  ({
    image,
    index,
    onClick,
    isFavorited,
    onFavorite,
    layout,
    isSelected,
    onSelect,
    selectionMode,
    isViewed,
  }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [hovered, setHovered] = useState(false);

    const heights =
      layout === "masonry"
        ? [260, 340, 300, 280, 320, 380, 280, 300]
        : layout === "compact"
          ? [140]
          : [280];

    const cardHeight =
      layout === "masonry" ? heights[index % heights.length] : heights[0];

    const handleFavoriteClick = useCallback(
      (e) => {
        e.stopPropagation();
        onFavorite?.(image.id);
      },
      [image.id, onFavorite],
    );

    const handleSelectClick = useCallback(
      (e) => {
        e.stopPropagation();
        onSelect?.(image.id);
      },
      [image.id, onSelect],
    );

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (selectionMode) {
            onSelect?.(image.id);
          } else {
            onClick(index);
          }
        }
      },
      [index, onClick, selectionMode, onSelect, image.id],
    );

    // List Layout
    if (layout === "list") {
      return (
        <div
          className={`gl-list-item ${isSelected ? "selected" : ""}`}
          onClick={() =>
            selectionMode ? onSelect?.(image.id) : onClick(index)
          }
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{ animation: `fadeUp 0.5s ease ${index * 0.04}s both` }}
        >
          <div style={{ width: 200, flexShrink: 0, position: "relative" }}>
            {!loaded && !error && (
              <ImageSkeleton height={140} style={{ borderRadius: 0 }} />
            )}
            {error ? (
              <div
                style={{
                  height: 140,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#F3F4F6",
                  color: "#9CA3AF",
                }}
              >
                <FiImage size={32} />
              </div>
            ) : (
              <img
                src={image.src || getBrandLogoUrl()}
                alt={image.title || BRAND_LOGO_ALT}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                  setError(true);
                  e.currentTarget.src = getBrandLogoUrl();
                  e.currentTarget.alt = BRAND_LOGO_ALT;
                }}
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  display: loaded ? "block" : "none",
                }}
              />
            )}
            {selectionMode && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: isSelected ? "#059669" : "rgba(255,255,255,0.9)",
                  border: isSelected
                    ? "2px solid #059669"
                    : "2px solid #D1D5DB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isSelected && <FiCheck size={14} color="white" />}
              </div>
            )}
          </div>
          <div style={{ flex: 1, padding: "16px 20px 16px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {image.title}
                  {image.featured && (
                    <FiStar size={14} color="#F59E0B" fill="#F59E0B" />
                  )}
                </h3>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                    color: "#059669",
                    margin: "4px 0 0 0",
                  }}
                >
                  <FiMapPin size={12} /> {image.location}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleFavoriteClick}
                  className="gl-focus-ring"
                  style={{
                    background: isFavorited ? "#FEF2F2" : "#F9FAFB",
                    border: "none",
                    borderRadius: 8,
                    padding: 8,
                    cursor: "pointer",
                    color: isFavorited ? "#EF4444" : "#9CA3AF",
                    transition: "all 0.2s",
                  }}
                  aria-label={
                    isFavorited ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <FiHeart size={16} fill={isFavorited ? "#EF4444" : "none"} />
                </button>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#6B7280",
                lineHeight: 1.5,
                margin: "0 0 12px 0",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {image.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  background: "#ECFDF5",
                  color: "#059669",
                  borderRadius: "var(--gl-radius-sm)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {categoryMeta[image.category]?.icon}
                {image.category}
              </span>
              {image.photographer && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FiCamera size={10} /> {image.photographer}
                </span>
              )}
              {isViewed && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FiEye size={10} /> Viewed
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Grid/Masonry/Compact Layout
    return (
      <div
        className={`gl-card ${isSelected ? "selected" : ""}`}
        onClick={() => (selectionMode ? onSelect?.(image.id) : onClick(index))}
        role="button"
        tabIndex={0}
        aria-label={`${selectionMode ? "Select" : "View"} ${image.title}`}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ animation: `fadeUp 0.5s ease ${index * 0.03}s both` }}
      >
        <div style={{ overflow: "hidden", position: "relative" }}>
          {!loaded && !error && <ImageSkeleton height={cardHeight} />}

          {error ? (
            <div
              style={{
                height: cardHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
                background: "#F3F4F6",
                color: "#9CA3AF",
              }}
            >
              <FiImage size={40} />
              <span style={{ fontSize: 12 }}>Failed to load</span>
            </div>
          ) : (
            <img
              src={image.src}
              alt={image.title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              style={{
                height: cardHeight,
                display: loaded ? "block" : "none",
              }}
            />
          )}

          {/* Zoom icon */}
          {!selectionMode && (
            <div className="gl-card-zoom">
              <FiZoomIn size={24} color="white" />
            </div>
          )}

          {/* Selection checkbox */}
          {selectionMode && (
            <div
              onClick={handleSelectClick}
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: isSelected ? "#059669" : "rgba(255,255,255,0.9)",
                border: isSelected ? "2px solid #059669" : "2px solid #D1D5DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                transition: "all 0.2s",
                boxShadow: "var(--gl-shadow-sm)",
              }}
            >
              {isSelected && <FiCheck size={16} color="white" />}
            </div>
          )}

          {/* Featured badge */}
          {image.featured && (
            <div
              style={{
                position: "absolute",
                top: 14,
                left: selectionMode ? 50 : 14,
                zIndex: 5,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 12px",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: "white",
                  borderRadius: "var(--gl-radius-full)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
                }}
              >
                <FiStar size={10} /> Featured
              </span>
            </div>
          )}

          {/* Category badge */}
          {layout !== "compact" && (
            <div
              style={{ position: "absolute", top: 14, right: 14, zIndex: 5 }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 12px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  color: "white",
                  borderRadius: "var(--gl-radius-full)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {categoryMeta[image.category]?.emoji}
                {image.category}
              </span>
            </div>
          )}

          {/* Action buttons */}
          {!selectionMode && (
            <div className="gl-card-actions">
              <button
                onClick={handleFavoriteClick}
                className={`gl-card-action-btn ${isFavorited ? "favorited" : ""} gl-focus-ring`}
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <FiHeart size={14} fill={isFavorited ? "#EF4444" : "none"} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Download handler would go here
                }}
                className="gl-card-action-btn gl-focus-ring"
                aria-label="Download"
              >
                <FiDownload size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Share handler would go here
                }}
                className="gl-card-action-btn gl-focus-ring"
                aria-label="Share"
              >
                <FiShare2 size={14} />
              </button>
            </div>
          )}

          {/* Viewed indicator */}
          {isViewed && !hovered && (
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                borderRadius: "var(--gl-radius-full)",
                color: "white",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              <FiEye size={10} /> Viewed
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className="gl-card-overlay">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: layout === "compact" ? "0.95rem" : "1.25rem",
              fontWeight: 700,
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            {image.title}
          </h3>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: layout === "compact" ? "0.8rem" : "0.9rem",
              color: "#34D399",
              fontWeight: 500,
              marginBottom: layout === "compact" ? 0 : 10,
            }}
          >
            <FiMapPin size={12} /> {image.location}
          </span>
          {layout !== "compact" && (
            <p
              style={{
                fontSize: "0.85rem",
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.8)",
                fontStyle: "italic",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: 10,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {image.description}
            </p>
          )}
        </div>
      </div>
    );
  },
);

GalleryCard.displayName = "GalleryCard";

// Lightbox Component
const Lightbox = memo(
  ({
    images,
    activeIndex,
    onClose,
    onNext,
    onPrev,
    onFavorite,
    isFavorited,
    onShare,
    onDownload,
  }) => {
    const [loaded, setLoaded] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const [isSlideshow, setIsSlideshow] = useState(false);
    const [slideshowProgress, setSlideshowProgress] = useState(0);

    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const dragStart = useRef({ x: 0, y: 0 });
    const touchStart = useRef(null);
    const slideshowRef = useRef(null);

    const currentImage = images[activeIndex];
    const { width: windowWidth } = useWindowSize();
    const isMobile = windowWidth < BREAKPOINTS.md;

    // Reset state when image changes
    useEffect(() => {
      setLoaded(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setSlideshowProgress(0);
    }, [activeIndex]);

    // Slideshow timer
    useEffect(() => {
      if (isSlideshow) {
        const startTime = Date.now();
        const duration = CONFIG.SLIDESHOW_INTERVAL;

        slideshowRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / duration) * 100, 100);
          setSlideshowProgress(progress);

          if (progress >= 100) {
            onNext();
          }
        }, 50);

        return () => {
          if (slideshowRef.current) {
            clearInterval(slideshowRef.current);
          }
        };
      }
    }, [isSlideshow, activeIndex, onNext]);

    // Preload adjacent images
    useImagePreloader(
      [
        images[activeIndex > 0 ? activeIndex - 1 : images.length - 1]?.src,
        images[activeIndex < images.length - 1 ? activeIndex + 1 : 0]?.src,
      ].filter(Boolean),
    );

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
      setZoom((prev) => Math.min(prev + CONFIG.ZOOM_STEP, CONFIG.MAX_ZOOM));
    }, []);

    const handleZoomOut = useCallback(() => {
      setZoom((prev) => {
        const newZoom = Math.max(prev - CONFIG.ZOOM_STEP, CONFIG.MIN_ZOOM);
        if (newZoom <= 1) setPosition({ x: 0, y: 0 });
        return newZoom;
      });
    }, []);

    const handleResetZoom = useCallback(() => {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }, []);

    // Fullscreen handler
    const handleFullscreen = useCallback(() => {
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }, []);

    // Touch handlers
    const handleTouchStart = useCallback((e) => {
      touchStart.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(
      (e) => {
        if (!touchStart.current || zoom > 1) return;
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > CONFIG.TOUCH_THRESHOLD) {
          if (diff > 0) onNext();
          else onPrev();
        }
        touchStart.current = null;
      },
      [zoom, onNext, onPrev],
    );

    // Drag handlers for zoomed image
    const handleMouseDown = useCallback(
      (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        dragStart.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        };
      },
      [zoom, position],
    );

    const handleMouseMove = useCallback(
      (e) => {
        if (!isDragging) return;
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      },
      [isDragging],
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // Keyboard shortcuts
    useKeyboardShortcuts({
      escape: onClose,
      arrowright: onNext,
      arrowleft: onPrev,
      "+": handleZoomIn,
      "-": handleZoomOut,
      0: handleResetZoom,
      f: handleFullscreen,
      i: () => setShowInfo((prev) => !prev),
      t: () => setShowThumbnails((prev) => !prev),
      " ": () => setIsSlideshow((prev) => !prev),
    });

    return (
      <div
        ref={containerRef}
        className="gl-lightbox"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="dialog"
        aria-label="Image lightbox"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          className="gl-lightbox-btn gl-focus-ring"
          onClick={onClose}
          aria-label="Close lightbox (Escape)"
          style={{ top: 24, right: 24 }}
        >
          <FiX size={22} />
        </button>

        {/* Top toolbar */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 90,
            display: "flex",
            gap: 8,
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="gl-lightbox-btn gl-focus-ring gl-tooltip"
            onClick={handleZoomOut}
            data-tooltip="Zoom out (-)"
            style={{ position: "static", width: 44, height: 44 }}
            disabled={zoom <= CONFIG.MIN_ZOOM}
          >
            <FiZoomOut size={18} />
          </button>
          <button
            className="gl-lightbox-btn gl-focus-ring gl-tooltip"
            onClick={handleResetZoom}
            data-tooltip="Reset zoom (0)"
            style={{
              position: "static",
              width: 44,
              height: 44,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            className="gl-lightbox-btn gl-focus-ring gl-tooltip"
            onClick={handleZoomIn}
            data-tooltip="Zoom in (+)"
            style={{ position: "static", width: 44, height: 44 }}
            disabled={zoom >= CONFIG.MAX_ZOOM}
          >
            <FiZoomIn size={18} />
          </button>
          <button
            className="gl-lightbox-btn gl-focus-ring gl-tooltip"
            onClick={handleFullscreen}
            data-tooltip="Fullscreen (F)"
            style={{ position: "static", width: 44, height: 44 }}
          >
            {isFullscreen ? (
              <FiMinimize2 size={18} />
            ) : (
              <FiMaximize2 size={18} />
            )}
          </button>
          <button
            className="gl-lightbox-btn gl-focus-ring gl-tooltip"
            onClick={() => setIsSlideshow((prev) => !prev)}
            data-tooltip="Slideshow (Space)"
            style={{
              position: "static",
              width: 44,
              height: 44,
              background: isSlideshow ? "rgba(5,150,105,0.8)" : undefined,
            }}
          >
            {isSlideshow ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
        </div>

        {/* Counter */}
        <div className="gl-lightbox-counter" aria-live="polite">
          {activeIndex + 1} / {images.length}
          {isSlideshow && (
            <div
              className="gl-lightbox-progress"
              style={{ width: `${slideshowProgress}%` }}
            />
          )}
        </div>

        {/* Previous button */}
        <button
          className="gl-lightbox-btn gl-focus-ring"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image (←)"
          style={{
            left: isMobile ? 12 : 24,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Image */}
        <img
          ref={imageRef}
          src={currentImage?.src || getBrandLogoUrl()}
          alt={currentImage?.title || BRAND_LOGO_ALT}
          className={`gl-lightbox-image ${zoom > 1 ? "zoomed" : ""} ${isDragging ? "dragging" : ""}`}
          onClick={(e) => e.stopPropagation()}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = getBrandLogoUrl();
            e.currentTarget.alt = BRAND_LOGO_ALT;
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleZoomIn}
          style={{
            opacity: loaded ? 1 : 0,
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          draggable={false}
        />

        {/* Loading spinner */}
        {!loaded && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            aria-label="Loading image"
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "#34D399",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        )}

        {/* Next button */}
        <button
          className="gl-lightbox-btn gl-focus-ring"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next image (→)"
          style={{
            right: isMobile ? 12 : 24,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <FiChevronRight size={24} />
        </button>

        {/* Thumbnails */}
        {showThumbnails && !isMobile && (
          <div
            className="gl-lightbox-thumbnails"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <img
                key={img.id}
                src={img.thumb || img.src || getBrandLogoUrl()}
                alt={img.title || BRAND_LOGO_ALT}
                className={`gl-lightbox-thumb ${idx === activeIndex ? "active" : ""}`}
                onClick={() => {
                  // Navigate to this image
                  const diff = idx - activeIndex;
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) onNext();
                  } else {
                    for (let i = 0; i < -diff; i++) onPrev();
                  }
                }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = getBrandLogoUrl();
                  e.currentTarget.alt = BRAND_LOGO_ALT;
                }}
              />
            ))}
          </div>
        )}

        {/* Info bar */}
        {showInfo && (
          <div
            className="gl-lightbox-info"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: isMobile ? "1rem" : "1.2rem",
                  fontWeight: 700,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentImage?.title}
              </h3>
              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#34D399",
                  fontWeight: 500,
                  fontSize: isMobile ? 12 : 13,
                  margin: "4px 0 0 0",
                }}
              >
                <FiMapPin size={12} /> {currentImage?.location}
              </p>
            </div>

            {!isMobile && (
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  fontStyle: "italic",
                  maxWidth: 280,
                  lineHeight: 1.4,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {currentImage?.description}
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => onFavorite?.(currentImage?.id)}
                className="gl-lightbox-btn gl-focus-ring"
                style={{ position: "static", width: 44, height: 44 }}
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <FiHeart
                  size={18}
                  fill={isFavorited ? "#EF4444" : "none"}
                  color={isFavorited ? "#EF4444" : "white"}
                />
              </button>
              <button
                onClick={() => onShare?.(currentImage)}
                className="gl-lightbox-btn gl-focus-ring"
                style={{ position: "static", width: 44, height: 44 }}
                aria-label="Share image"
              >
                <FiShare2 size={18} />
              </button>
              <button
                onClick={() => onDownload?.(currentImage)}
                className="gl-lightbox-btn gl-focus-ring"
                style={{ position: "static", width: 44, height: 44 }}
                aria-label="Download image"
              >
                <FiDownload size={18} />
              </button>
              <button
                onClick={() => setShowInfo(false)}
                className="gl-lightbox-btn gl-focus-ring"
                style={{ position: "static", width: 44, height: 44 }}
                aria-label="Hide info"
              >
                <FiEyeOff size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Show info button when hidden */}
        {!showInfo && (
          <button
            onClick={() => setShowInfo(true)}
            className="gl-lightbox-btn gl-focus-ring"
            style={{ bottom: 24, left: "50%", transform: "translateX(-50%)" }}
            aria-label="Show info"
          >
            <FiInfo size={20} />
          </button>
        )}
      </div>
    );
  },
);

Lightbox.displayName = "Lightbox";

// Filter Panel Component
const FilterPanel = memo(
  ({ isOpen, onClose, state, dispatch, categoryCounts }) => {
    if (!isOpen) return null;

    return (
      <>
        <div
          className="gl-filter-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className="gl-filter-panel gl-scrollbar-thin"
          role="dialog"
          aria-label="Filter options"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "1px solid #E5E7EB",
              position: "sticky",
              top: 0,
              background: "white",
              zIndex: 10,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              <FiSliders style={{ marginRight: 10, verticalAlign: "middle" }} />
              Filters
            </h2>
            <button
              onClick={onClose}
              className="gl-btn-ghost gl-focus-ring"
              style={{ borderRadius: 8, padding: 8 }}
              aria-label="Close filters"
            >
              <FiX size={20} />
            </button>
          </div>

          <div style={{ padding: 24 }}>
            {/* Categories */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Category
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      dispatch({ type: "SET_CATEGORY", payload: cat })
                    }
                    className={`gl-dropdown-item ${state.selectedCategory === cat ? "active" : ""}`}
                    style={{ borderRadius: 8 }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background:
                          state.selectedCategory === cat
                            ? "#ECFDF5"
                            : "#F9FAFB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {categoryMeta[cat]?.emoji}
                    </span>
                    <span style={{ flex: 1 }}>{categoryMeta[cat]?.label}</span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        background: "#F3F4F6",
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}
                    >
                      {categoryCounts[cat] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Sort By
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      dispatch({ type: "SET_SORT", payload: option.value })
                    }
                    className={`gl-dropdown-item ${state.sortBy === option.value ? "active" : ""}`}
                    style={{ borderRadius: 8 }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Quick Filters
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={state.showFavoritesOnly}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FAVORITES_ONLY",
                        payload: e.target.checked,
                      })
                    }
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: "#059669",
                      cursor: "pointer",
                    }}
                  />
                  <FiHeart size={18} color="#EF4444" />
                  <span>Favorites only</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12,
                      color: "#9CA3AF",
                      background: "#F3F4F6",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    {state.favorites.length}
                  </span>
                </label>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => dispatch({ type: "RESET_FILTERS" })}
              className="gl-btn-secondary gl-focus-ring"
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <FiRefreshCw size={16} />
              Reset All Filters
            </button>
          </div>
        </div>
      </>
    );
  },
);

FilterPanel.displayName = "FilterPanel";

// Selection Bar Component
const SelectionBar = memo(
  ({
    selectedCount,
    onClearSelection,
    onSelectAll,
    onDownloadSelected,
    onDeleteSelected,
    totalCount,
  }) => {
    if (selectedCount === 0) return null;

    return (
      <div className="gl-selection-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#059669",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {selectedCount}
          </div>
          <span style={{ fontWeight: 600, color: "#374151" }}>
            {selectedCount} selected
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onSelectAll}
            className="gl-btn-ghost gl-focus-ring"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {selectedCount === totalCount ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={onDownloadSelected}
            className="gl-btn-secondary gl-focus-ring"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FiDownload size={14} /> Download
          </button>
          <button
            onClick={onClearSelection}
            className="gl-btn-ghost gl-focus-ring"
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              color: "#EF4444",
            }}
          >
            <FiX size={14} /> Clear
          </button>
        </div>
      </div>
    );
  },
);

SelectionBar.displayName = "SelectionBar";

/* ═══════════════════════════════════════════════════════
   MAIN GALLERY COMPONENT
   ═══════════════════════════════════════════════════════ */
const Gallery = () => {
  // Load persisted state
  const [persistedFavorites] = useLocalStorage(STORAGE_KEYS.FAVORITES, []);
  const [persistedLayout] = useLocalStorage(STORAGE_KEYS.LAYOUT, "grid");
  const [persistedCategory] = useLocalStorage(STORAGE_KEYS.CATEGORY, "all");
  const [persistedViewed] = useLocalStorage(STORAGE_KEYS.VIEWED, []);

  // Reducer for complex state
  const [state, dispatch] = useReducer(galleryReducer, {
    selectedCategory: persistedCategory,
    searchQuery: "",
    layout: persistedLayout,
    sortBy: "default",
    favorites: persistedFavorites,
    recentlyViewed: persistedViewed,
    selectedImages: [],
    showFilterPanel: false,
    showFavoritesOnly: false,
  });

  // Local state
  const [activeIndex, setActiveIndex] = useState(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Refs
  const heroIntervalRef = useRef(null);
  const galleryRef = useRef(null);

  // Custom hooks
  const { width: windowWidth } = useWindowSize();
  const { fetchedImages, loading: galleryFetching } = useGallery();
  const debouncedSearch = useDebounce(state.searchQuery, CONFIG.DEBOUNCE_DELAY);

  const allImages = useMemo(() => {
    return [...images, ...fetchedImages];
  }, [fetchedImages]);

  const isMobile = windowWidth < BREAKPOINTS.md;
  const isTablet =
    windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg;

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(state.favorites),
    );
  }, [state.favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(state.layout));
  }, [state.layout]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.CATEGORY,
      JSON.stringify(state.selectedCategory),
    );
  }, [state.selectedCategory]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.VIEWED,
      JSON.stringify(state.recentlyViewed),
    );
  }, [state.recentlyViewed]);

  // Hero slideshow
  useEffect(() => {
    heroIntervalRef.current = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, CONFIG.HERO_SLIDE_INTERVAL);

    return () => {
      if (heroIntervalRef.current) clearInterval(heroIntervalRef.current);
    };
  }, []);

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () =>
      setShowBackToTop(window.scrollY > CONFIG.SCROLL_THRESHOLD);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtered and sorted images
  const filteredImages = useMemo(() => {
    let result = [...allImages];

    // Category filter
    if (state.selectedCategory !== "all") {
      result = result.filter((img) => img.category === state.selectedCategory);
    }

    // Favorites filter
    if (state.showFavoritesOnly) {
      result = result.filter((img) => state.favorites.includes(img.id));
    }

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (img) =>
          img.title.toLowerCase().includes(query) ||
          img.location.toLowerCase().includes(query) ||
          img.description.toLowerCase().includes(query) ||
          img.category.toLowerCase().includes(query) ||
          img.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          img.photographer?.toLowerCase().includes(query),
      );
    }

    // Sorting
    switch (state.sortBy) {
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "location":
        result.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "recent":
        result.sort((a, b) => {
          const aIndex = state.recentlyViewed.indexOf(a.id);
          const bIndex = state.recentlyViewed.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        break;
      default:
        break;
    }

    return result;
  }, [
    state.selectedCategory,
    state.showFavoritesOnly,
    state.favorites,
    state.sortBy,
    state.recentlyViewed,
    debouncedSearch,
    allImages,
  ]);

  // Paginated images
  const paginatedImages = useMemo(() => {
    return filteredImages.slice(0, page * CONFIG.IMAGES_PER_PAGE);
  }, [filteredImages, page]);

  const hasMore = paginatedImages.length < filteredImages.length;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: images.length };
    images.forEach((img) => {
      counts[img.category] = (counts[img.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Stats
  const stats = useMemo(
    () => ({
      totalPhotos: images.length,
      locations: new Set(images.map((i) => i.location)).size,
      categories: categories.length - 1,
      favorites: state.favorites.length,
      viewed: state.recentlyViewed.length,
    }),
    [state.favorites.length, state.recentlyViewed.length],
  );

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (state.selectedCategory !== "all") count++;
    if (state.sortBy !== "default") count++;
    if (state.showFavoritesOnly) count++;
    if (state.searchQuery) count++;
    return count;
  }, [
    state.selectedCategory,
    state.sortBy,
    state.showFavoritesOnly,
    state.searchQuery,
  ]);

  // Toast helper
  const showToast = useCallback((message, type = "success", action = null) => {
    setToast({ message, type, action });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Lightbox handlers
  const openLightbox = useCallback(
    (index) => {
      setActiveIndex(index);
      document.body.style.overflow = "hidden";

      // Track viewed
      const imageId = paginatedImages[index]?.id;
      if (imageId) {
        dispatch({ type: "ADD_VIEWED", payload: imageId });
      }
    },
    [paginatedImages],
  );

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    document.body.style.overflow = "";
  }, []);

  const nextImage = useCallback(() => {
    setActiveIndex((prev) => {
      const newIndex = prev === paginatedImages.length - 1 ? 0 : prev + 1;
      const imageId = paginatedImages[newIndex]?.id;
      if (imageId) dispatch({ type: "ADD_VIEWED", payload: imageId });
      return newIndex;
    });
  }, [paginatedImages]);

  const prevImage = useCallback(() => {
    setActiveIndex((prev) => {
      const newIndex = prev === 0 ? paginatedImages.length - 1 : prev - 1;
      const imageId = paginatedImages[newIndex]?.id;
      if (imageId) dispatch({ type: "ADD_VIEWED", payload: imageId });
      return newIndex;
    });
  }, [paginatedImages]);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIndex !== null) return; // Lightbox handles its own shortcuts

      if (e.key === "Escape" && selectionMode) {
        setSelectionMode(false);
        dispatch({ type: "CLEAR_SELECTION" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, selectionMode]);

  // Favorite toggle
  const toggleFavorite = useCallback(
    (id) => {
      const isFavorited = state.favorites.includes(id);
      dispatch({ type: "TOGGLE_FAVORITE", payload: id });
      showToast(
        isFavorited ? "Removed from favorites" : "Added to favorites",
        "success",
        !isFavorited
          ? {
              label: "Undo",
              onClick: () => dispatch({ type: "TOGGLE_FAVORITE", payload: id }),
            }
          : null,
      );
    },
    [state.favorites, showToast],
  );

  // Share handler
  const handleShare = useCallback(
    async (image) => {
      const shareData = {
        title: image.title,
        text: `${image.title} - ${image.location}\n${image.description}`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          showToast("Shared successfully");
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Share failed:", error);
          }
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast("Link copied to clipboard");
        } catch (error) {
          showToast("Failed to copy link", "error");
        }
      }
    },
    [showToast],
  );

  // Download handler
  const handleDownload = useCallback(
    async (image) => {
      try {
        showToast("Starting download...", "info");
        const response = await fetch(image.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(image.title || "altuvera-moment").replace(/\s+/g, "-").toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast("Download complete!");
      } catch (error) {
        console.error("Download failed:", error);
        showToast("Failed to download image", "error");
      }
    },
    [showToast],
  );

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (state.selectedImages.length === paginatedImages.length) {
      dispatch({ type: "CLEAR_SELECTION" });
    } else {
      dispatch({
        type: "SELECT_ALL",
        payload: paginatedImages.map((img) => img.id),
      });
    }
  }, [state.selectedImages.length, paginatedImages]);

  const handleDownloadSelected = useCallback(async () => {
    const selectedImages = paginatedImages.filter((img) =>
      state.selectedImages.includes(img.id),
    );
    showToast(`Downloading ${selectedImages.length} images...`, "info");

    for (const image of selectedImages) {
      await handleDownload(image);
    }

    showToast(`Downloaded ${selectedImages.length} images`, "success");
    setSelectionMode(false);
    dispatch({ type: "CLEAR_SELECTION" });
  }, [paginatedImages, state.selectedImages, handleDownload, showToast]);

  // Load more
  const loadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
    }, 500);
  }, []);

  // Intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(
    useCallback(
      (isVisible) => {
        if (isVisible && hasMore && !isLoading) {
          loadMore();
        }
      },
      [hasMore, isLoading, loadMore],
    ),
    { threshold: 0.1 },
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    state.selectedCategory,
    state.searchQuery,
    state.sortBy,
    state.showFavoritesOnly,
  ]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
    showToast("Filters cleared");
  }, [showToast]);

  // Render
  return (
    <>
      <SEO
        title="Photo Gallery"
        description="Explore breathtaking photos of East African wildlife, landscapes, and culture. Browse our curated collection of safari moments captured by expert photographers."
        keywords={["photo gallery", "East Africa wildlife", "safari photos", "travel photography", "landscapes"]}
        url="/gallery"
        image={getBrandLogoUrl()}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" }
        ]}
      />

      <style>{styles}</style>

      {/* ══════════ HERO ══════════ */}
      <div className="gl-hero">
        <HeroSlideshow
          images={heroImages}
          activeIndex={heroSlideIndex}
          onSlideChange={setHeroSlideIndex}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg, #059669, #34D399, #6EE7B7, #34D399, #059669)",
            zIndex: 3,
          }}
        />

        <div className="gl-hero-content">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              backgroundColor: "rgba(5,150,105,0.3)",
              backdropFilter: "blur(12px)",
              borderRadius: "var(--gl-radius-full)",
              marginBottom: 20,
              border: "1px solid rgba(52,211,153,0.3)",
              animation: "fadeUp 0.5s ease",
            }}
          >
            <FiCamera size={16} color="#34D399" />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#D1FAE5",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Photo Gallery
            </span>
          </div>

          <h1>Captured Moments</h1>
          <p>
            A visual journey through the breathtaking wonders of East Africa
          </p>

          <div className="gl-breadcrumbs">
            <Link to="/">
              <FiHome size={14} /> Home
            </Link>
            <span style={{ margin: "0 4px", color: "rgba(255,255,255,0.4)" }}>
              /
            </span>
            <span
              style={{
                background: "rgba(5,150,105,0.3)",
                backdropFilter: "blur(12px)",
                padding: "8px 18px",
                borderRadius: "var(--gl-radius-full)",
                border: "1px solid rgba(52,211,153,0.3)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Gallery
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 28,
            }}
          >
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className="gl-focus-ring"
                style={{
                  width: heroSlideIndex === i ? 28 : 8,
                  height: 8,
                  borderRadius: "var(--gl-radius-full)",
                  backgroundColor:
                    heroSlideIndex === i ? "#34D399" : "rgba(255,255,255,0.3)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.4s var(--gl-transition)",
                  padding: 0,
                }}
              />
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
          </div>
        </div>
      </div>

      {/* ══════════ MAIN SECTION ══════════ */}
      <section
        ref={galleryRef}
        style={{
          padding: isMobile ? "24px 16px 60px" : "45px 24px 90px",
          maxWidth: "1440px",
          margin: "0 auto",
          backgroundColor: "var(--gl-off-white)",
          minHeight: "100vh",
        }}
      >
        {/* Stats row */}
        <div
          className="gl-stats-row"
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            icon={<FiImage size={20} />}
            value={stats.totalPhotos}
            label="Photos"
            delay={0}
          />
          <StatCard
            icon={<FiMapPin size={20} />}
            value={stats.locations}
            label="Locations"
            delay={0.1}
          />
          <StatCard
            icon={<FiGrid size={20} />}
            value={stats.categories}
            label="Categories"
            delay={0.2}
          />
          <StatCard
            icon={<FiHeart size={20} />}
            value={stats.favorites}
            label="Favorites"
            delay={0.3}
          />
        </div>

        {/* Filter bar */}
        <div
          className="gl-filter-bar"
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 32,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div
            className="gl-search-wrap"
            style={{
              position: "relative",
              flex: "1 1 300px",
              maxWidth: isMobile ? "100%" : "400px",
            }}
          >
            <FiSearch
              size={18}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9CA3AF",
              }}
            />
            <input
              type="text"
              placeholder="Search photos, locations, tags..."
              value={state.searchQuery}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH", payload: e.target.value })
              }
              className="gl-focus-ring"
              aria-label="Search gallery"
              style={{
                width: "100%",
                padding: "14px 42px 14px 48px",
                borderRadius: "var(--gl-radius-full)",
                border: "2px solid #E5E7EB",
                backgroundColor: "white",
                fontSize: 14,
                color: "#374151",
                outline: "none",
                transition: "all 0.3s",
                boxShadow: "var(--gl-shadow-sm)",
                boxSizing: "border-box",
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E5E7EB";
                e.target.style.boxShadow = "var(--gl-shadow-sm)";
              }}
            />
            {state.searchQuery && (
              <button
                onClick={() => dispatch({ type: "SET_SEARCH", payload: "" })}
                className="gl-focus-ring"
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: "50%",
                  width: 24,
                  height: 24,
                  cursor: "pointer",
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Categories (horizontal scroll on mobile) */}
          <div
            className="gl-category-scroll gl-scrollbar-hidden"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              flex: isMobile ? "1 1 100%" : "0 1 auto",
              paddingBottom: 4,
            }}
          >
            {categories.map((cat) => (
              <Pill
                key={cat}
                active={state.selectedCategory === cat}
                onClick={() => dispatch({ type: "SET_CATEGORY", payload: cat })}
                icon={categoryMeta[cat]?.icon}
                count={categoryCounts[cat]}
              >
                {categoryMeta[cat]?.label}
              </Pill>
            ))}
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginLeft: isMobile ? 0 : "auto",
              alignItems: "center",
            }}
          >
            {/* Filter button */}
            <button
              onClick={() =>
                dispatch({ type: "SET_FILTER_PANEL", payload: true })
              }
              className="gl-btn-secondary gl-focus-ring"
              style={{
                padding: "10px 16px",
                borderRadius: "var(--gl-radius-full)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                position: "relative",
              }}
            >
              <FiFilter size={16} />
              {!isMobile && "Filters"}
              {activeFiltersCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#059669",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Selection mode toggle */}
            <button
              onClick={() => {
                setSelectionMode((prev) => !prev);
                if (selectionMode) dispatch({ type: "CLEAR_SELECTION" });
              }}
              className={`${selectionMode ? "gl-btn-primary" : "gl-btn-secondary"} gl-focus-ring`}
              style={{
                padding: "10px 16px",
                borderRadius: "var(--gl-radius-full)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
              }}
            >
              <FiCheck size={16} />
              {!isMobile && (selectionMode ? "Cancel" : "Select")}
            </button>

            {/* Layout toggle */}
            <div
              style={{
                display: "flex",
                gap: 0,
                padding: 4,
                backgroundColor: "#F3F4F6",
                borderRadius: "var(--gl-radius-md)",
              }}
            >
              {LAYOUTS.map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() =>
                    dispatch({ type: "SET_LAYOUT", payload: value })
                  }
                  className="gl-focus-ring gl-tooltip"
                  data-tooltip={label}
                  aria-label={`Switch to ${label} layout`}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      state.layout === value ? "white" : "transparent",
                    color: state.layout === value ? "#059669" : "#9CA3AF",
                    boxShadow:
                      state.layout === value ? "var(--gl-shadow-sm)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search results / Active filters indicator */}
        {(state.searchQuery || activeFiltersCount > 0) && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 20px",
              backgroundColor: "#ECFDF5",
              borderRadius: "var(--gl-radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              animation: "slideUp 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FiInfo size={16} color="#059669" />
              <span style={{ fontSize: 14, color: "#065F46" }}>
                Found <strong>{filteredImages.length}</strong> photo
                {filteredImages.length !== 1 ? "s" : ""}
                {state.searchQuery && ` matching "${state.searchQuery}"`}
              </span>
            </div>
            <button
              onClick={resetFilters}
              className="gl-focus-ring"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#059669",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <FiRefreshCw size={14} />
              Clear all
            </button>
          </div>
        )}

        {/* Results header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "24px" : "30px",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.02em",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {categoryMeta[state.selectedCategory]?.emoji}{" "}
            {categoryMeta[state.selectedCategory]?.label}
          </h2>
          <span
            style={{
              fontSize: 14,
              color: "#6B7280",
              fontWeight: 500,
              background: "#F3F4F6",
              padding: "6px 14px",
              borderRadius: "var(--gl-radius-full)",
            }}
          >
            {filteredImages.length} photo
            {filteredImages.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Gallery Grid */}
        {paginatedImages.length === 0 ? (
          /* Empty state */
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              animation: "fadeUp 0.4s ease",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                animation: "float 3s ease infinite",
              }}
            >
              <FiCamera size={48} color="#059669" />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                color: "#111827",
                marginBottom: 12,
              }}
            >
              No Photos Found
            </h3>
            <p
              style={{
                color: "#6B7280",
                marginBottom: 28,
                maxWidth: 400,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.6,
              }}
            >
              We couldn't find any photos matching your current filters. Try
              adjusting your search or browse all categories.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={resetFilters}
                className="gl-btn-primary gl-focus-ring"
                style={{
                  padding: "14px 32px",
                  borderRadius: "var(--gl-radius-full)",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiRefreshCw size={16} />
                Clear Filters
              </button>
              <button
                onClick={() =>
                  dispatch({ type: "SET_CATEGORY", payload: "all" })
                }
                className="gl-btn-secondary gl-focus-ring"
                style={{
                  padding: "14px 32px",
                  borderRadius: "var(--gl-radius-full)",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiGrid size={16} />
                Browse All
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Compact Layout */}
            {state.layout === "compact" && (
              <div className="gl-compact">
                {paginatedImages.map((image, index) => (
                  <GalleryCard
                    key={image.id}
                    image={image}
                    index={index}
                    onClick={openLightbox}
                    isFavorited={state.favorites.includes(image.id)}
                    onFavorite={toggleFavorite}
                    layout="compact"
                    isSelected={state.selectedImages.includes(image.id)}
                    onSelect={(id) =>
                      dispatch({ type: "TOGGLE_SELECTION", payload: id })
                    }
                    selectionMode={selectionMode}
                    isViewed={state.recentlyViewed.includes(image.id)}
                  />
                ))}
              </div>
            )}

            {/* List Layout */}
            {state.layout === "list" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {paginatedImages.map((image, index) => (
                  <GalleryCard
                    key={image.id}
                    image={image}
                    index={index}
                    onClick={openLightbox}
                    isFavorited={state.favorites.includes(image.id)}
                    onFavorite={toggleFavorite}
                    layout="list"
                    isSelected={state.selectedImages.includes(image.id)}
                    onSelect={(id) =>
                      dispatch({ type: "TOGGLE_SELECTION", payload: id })
                    }
                    selectionMode={selectionMode}
                    isViewed={state.recentlyViewed.includes(image.id)}
                  />
                ))}
              </div>
            )}

            {/* Masonry Layout */}
            {state.layout === "masonry" && (
              <div className="gl-masonry">
                {paginatedImages.map((image, index) => (
                  <div key={image.id} className="gl-masonry-item">
                    <GalleryCard
                      image={image}
                      index={index}
                      onClick={openLightbox}
                      isFavorited={state.favorites.includes(image.id)}
                      onFavorite={toggleFavorite}
                      layout="masonry"
                      isSelected={state.selectedImages.includes(image.id)}
                      onSelect={(id) =>
                        dispatch({ type: "TOGGLE_SELECTION", payload: id })
                      }
                      selectionMode={selectionMode}
                      isViewed={state.recentlyViewed.includes(image.id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Grid Layout */}
            {state.layout === "grid" && (
              <div
                className="gl-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "24px",
                }}
              >
                {paginatedImages.map((image, index) => (
                  <GalleryCard
                    key={image.id}
                    image={image}
                    index={index}
                    onClick={openLightbox}
                    isFavorited={state.favorites.includes(image.id)}
                    onFavorite={toggleFavorite}
                    layout="grid"
                    isSelected={state.selectedImages.includes(image.id)}
                    onSelect={(id) =>
                      dispatch({ type: "TOGGLE_SELECTION", payload: id })
                    }
                    selectionMode={selectionMode}
                    isViewed={state.recentlyViewed.includes(image.id)}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "48px 0",
                }}
              >
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="gl-btn-secondary gl-focus-ring"
                  style={{
                    padding: "16px 48px",
                    borderRadius: "var(--gl-radius-full)",
                    fontSize: 15,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 200,
                    justifyContent: "center",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          border: "2px solid #E5E7EB",
                          borderTopColor: "#059669",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw size={18} />
                      Load More (
                      {filteredImages.length - paginatedImages.length}{" "}
                      remaining)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* End of results */}
            {!hasMore && paginatedImages.length > 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "#9CA3AF",
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 24px",
                    background: "#F9FAFB",
                    borderRadius: "var(--gl-radius-full)",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <FiCheck size={16} color="#059669" />
                  You've seen all {filteredImages.length} photos
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ══════════ LIGHTBOX ══════════ */}
      {activeIndex !== null && paginatedImages[activeIndex] && (
        <Lightbox
          images={paginatedImages}
          activeIndex={activeIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          onFavorite={toggleFavorite}
          isFavorited={state.favorites.includes(
            paginatedImages[activeIndex]?.id,
          )}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      )}

      {/* ══════════ FILTER PANEL ══════════ */}
      <FilterPanel
        isOpen={state.showFilterPanel}
        onClose={() => dispatch({ type: "SET_FILTER_PANEL", payload: false })}
        state={state}
        dispatch={dispatch}
        categoryCounts={categoryCounts}
      />

      {/* ══════════ SELECTION BAR ══════════ */}
      {selectionMode && (
        <SelectionBar
          selectedCount={state.selectedImages.length}
          totalCount={paginatedImages.length}
          onClearSelection={() => {
            dispatch({ type: "CLEAR_SELECTION" });
            setSelectionMode(false);
          }}
          onSelectAll={handleSelectAll}
          onDownloadSelected={handleDownloadSelected}
        />
      )}

      {/* ══════════ BACK TO TOP ══════════ */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="gl-btn-primary gl-focus-ring gl-tooltip"
          data-tooltip="Back to top"
          aria-label="Scroll back to top"
          style={{
            position: "fixed",
            bottom: selectionMode ? 100 : 32,
            right: 32,
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99,
            animation: "bounceIn 0.4s var(--gl-spring)",
            padding: 0,
            transition: "bottom 0.3s ease",
          }}
        >
          <FiArrowUp size={24} />
        </button>
      )}

      {/* ══════════ TOAST NOTIFICATION ══════════ */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onClose={hideToast}
        />
      )}

      {/* ══════════ KEYBOARD SHORTCUTS HELP ══════════ */}
      <KeyboardShortcutsModal />
    </>
  );
};

// Keyboard Shortcuts Modal Component
const KeyboardShortcutsModal = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts({
    "shift+/": () => setIsOpen((prev) => !prev),
  });

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ["←", "→"], description: "Navigate images in lightbox" },
    { keys: ["Esc"], description: "Close lightbox or cancel selection" },
    { keys: ["+", "-"], description: "Zoom in/out in lightbox" },
    { keys: ["0"], description: "Reset zoom" },
    { keys: ["F"], description: "Toggle fullscreen" },
    { keys: ["Space"], description: "Toggle slideshow" },
    { keys: ["I"], description: "Toggle image info" },
    { keys: ["T"], description: "Toggle thumbnails" },
    { keys: ["?"], description: "Show/hide this help" },
  ];

  return (
    <>
      <div
        className="gl-filter-overlay"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          borderRadius: "var(--gl-radius-xl)",
          padding: "32px",
          maxWidth: "420px",
          width: "calc(100% - 48px)",
          zIndex: 1001,
          boxShadow: "var(--gl-shadow-xl)",
          animation: "scaleIn 0.3s var(--gl-spring)",
        }}
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="gl-btn-ghost gl-focus-ring"
            style={{ borderRadius: 8, padding: 8 }}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom:
                  index < shortcuts.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <span style={{ color: "#6B7280", fontSize: 14 }}>
                {shortcut.description}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {shortcut.keys.map((key, i) => (
                  <kbd
                    key={i}
                    style={{
                      background: "#F3F4F6",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      border: "1px solid #E5E7EB",
                      fontFamily: "monospace",
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Press{" "}
          <kbd
            style={{
              background: "#F3F4F6",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
            }}
          >
            Shift
          </kbd>{" "}
          +{" "}
          <kbd
            style={{
              background: "#F3F4F6",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
            }}
          >
            ?
          </kbd>{" "}
          to toggle this help
        </p>
      </div>
    </>
  );
});

KeyboardShortcutsModal.displayName = "KeyboardShortcutsModal";

// Add missing FiCheck import simulation (already imported above)
const FiCheck = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Gallery;
