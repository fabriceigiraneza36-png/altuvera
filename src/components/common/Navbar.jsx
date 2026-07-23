// src/components/common/Navbar.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR v5.0 — Green/White Theme, Beautiful Search Cards, Fully Responsive
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search, Heart, User, LogOut, Calendar, Settings,
  ChevronDown, ChevronLeft, ChevronRight, MapPin, X,
  Menu, ArrowRight, Globe, Compass, TrendingUp,
  Plane, Star, Clock, Users, Shield, Camera,
  Mountain, Sparkles, Bookmark, Map as MapIcon,
} from 'lucide-react'
import { useApp }           from '../../context/AppContext'
import { useUserAuth }      from '../../context/UserAuthContext'
import { getBrandLogoUrl, BRAND_LOGO_ALT } from '../../utils/seo'
import { preloadRoute }     from '../../utils/routeUtils'
import { getCountrySlug }   from '../../utils/countrySlugMap'
import { useCountries }     from '../../hooks/useCountries'
import { adaptDestination } from '../../utils/destinationAdapter'

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES — Injected once
═══════════════════════════════════════════════════════════════════════════ */

const NAVBAR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap');

  /* ── CSS Variables ── */
  :root {
    --nav-green-50:  #f0fdf4;
    --nav-green-100: #dcfce7;
    --nav-green-200: #bbf7d0;
    --nav-green-300: #86efac;
    --nav-green-400: #4ade80;
    --nav-green-500: #22c55e;
    --nav-green-600: #059669;
    --nav-green-700: #047857;
    --nav-green-800: #065f46;
    --nav-green-900: #064e3b;
    --nav-white:     #ffffff;
    --nav-gray-50:   #f9fafb;
    --nav-gray-100:  #f3f4f6;
    --nav-gray-200:  #e5e7eb;
    --nav-gray-300:  #d1d5db;
    --nav-gray-400:  #9ca3af;
    --nav-gray-500:  #6b7280;
    --nav-gray-600:  #4b5563;
    --nav-gray-700:  #374151;
    --nav-gray-800:  #1f2937;
    --nav-gray-900:  #111827;
    --nav-font:      'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --nav-radius:    16px;
    --nav-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --nav-height:    72px;
    --nav-shadow:    0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --nav-shadow-lg: 0 10px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04);
    --nav-z:         1000;
  }

  /* ══════════════════════════════════════════════════════════════════════
     NAVBAR BASE
  ══════════════════════════════════════════════════════════════════════ */

  .nv5 {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: var(--nav-z);
    height: var(--nav-height);
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid transparent;
    transition: all var(--nav-transition);
    font-family: var(--nav-font);
    -webkit-font-smoothing: antialiased;
  }

  .nv5--scrolled {
    background: rgba(255,255,255,0.97);
    border-bottom-color: var(--nav-green-100);
    box-shadow: var(--nav-shadow);
  }

  .nv5--hidden {
    transform: translateY(-100%);
    pointer-events: none;
  }

  .nv5__inner {
    max-width: 1360px;
    margin: 0 auto;
    height: 100%;
    padding: 0 clamp(16px, 3vw, 32px);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Logo ── */
  .nv5__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  .nv5__logo-img-wrap {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 10px rgba(5,150,105,0.15);
    transition: transform 0.3s ease;
  }

  .nv5__logo:hover .nv5__logo-img-wrap {
    transform: scale(1.05);
  }

  .nv5__logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .nv5__logo-text {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.3rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--nav-green-800), var(--nav-green-600));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }

  /* ── Floating Logo ── */
  .nv5__float-logo {
    position: fixed;
    top: 14px;
    z-index: 1100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s ease;
  }

  .nv5__float-logo--visible {
    opacity: 0.3;
    pointer-events: auto;
  }

  .nv5__float-logo:hover {
    opacity: 1 !important;
  }

  /* ── Desktop Links ── */
  .nv5__links {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
    margin-right: 10px;
  }

  .nv5__item {
    position: relative;
  }

  .nv5__link {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--nav-gray-600);
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
    white-space: nowrap;
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  .nv5__link:hover {
    color: var(--nav-green-700);
    background: var(--nav-green-50);
  }

  .nv5__link--active {
    color: var(--nav-green-700);
    font-weight: 700;
  }

  .nv5__link--active::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 18px;
    height: 2.5px;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--nav-green-500), var(--nav-green-600));
  }

  .nv5__chevron {
    transition: transform 0.25s ease;
    opacity: 0.5;
  }

  .nv5__chevron--open {
    transform: rotate(180deg);
    opacity: 1;
  }

  /* ── Desktop Dropdown ── */
  .nv5__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    min-width: 240px;
    max-height: 420px;
    overflow-y: auto;
    background: var(--nav-white);
    border-radius: var(--nav-radius);
    border: 1px solid var(--nav-green-100);
    box-shadow: var(--nav-shadow-lg);
    padding: 8px;
    transition: all 0.22s ease;
    z-index: 100;
    scrollbar-width: thin;
    scrollbar-color: var(--nav-green-200) transparent;
  }

  .nv5__dropdown--open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
  }

  .nv5__dropdown-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    color: var(--nav-gray-700);
    text-decoration: none;
    font-size: 0.84rem;
    font-weight: 600;
    transition: all 0.18s ease;
  }

  .nv5__dropdown-link:hover {
    background: var(--nav-green-50);
    color: var(--nav-green-800);
    transform: translateX(2px);
  }

  .nv5__dropdown-flag {
    width: 28px;
    height: 20px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid var(--nav-gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
  }

  .nv5__dropdown-flag img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .nv5__dropdown-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nav-green-300);
    flex-shrink: 0;
  }

  .nv5__dropdown-name {
    display: block;
    font-weight: 600;
  }

  .nv5__dropdown-info {
    display: block;
    font-size: 0.72rem;
    color: var(--nav-gray-400);
    margin-top: 1px;
  }

  /* ── Actions ── */
  .nv5__actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .nv5__icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--nav-green-100);
    background: var(--nav-white);
    color: var(--nav-green-700);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-decoration: none;
  }

  .nv5__icon-btn:hover {
    background: var(--nav-green-50);
    border-color: var(--nav-green-200);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(5,150,105,0.12);
  }

  .nv5__icon-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    border-radius: 99px;
    background: var(--nav-green-600);
    color: white;
    font-size: 0.6rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid white;
    line-height: 1;
  }

  /* ── User ── */
  .nv5__user {
    position: relative;
  }

  .nv5__avatar-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid var(--nav-green-200);
    background: linear-gradient(135deg, var(--nav-green-100), var(--nav-green-50));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.22s ease;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--nav-green-700);
  }

  .nv5__avatar-btn:hover {
    border-color: var(--nav-green-400);
    transform: scale(1.06);
  }

  .nv5__avatar-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* User dropdown */
  .nv5__user-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 280px;
    background: var(--nav-white);
    border-radius: 18px;
    border: 1px solid var(--nav-green-100);
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    padding: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(8px) scale(0.97);
    transition: all 0.22s ease;
    z-index: 200;
  }

  .nv5__user-menu--open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }

  .nv5__user-header {
    padding: 14px;
    border-bottom: 1px solid var(--nav-green-50);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nv5__user-header-avatar {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    overflow: hidden;
    border: 2px solid var(--nav-green-200);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--nav-green-100), var(--nav-green-50));
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--nav-green-700);
  }

  .nv5__user-header-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .nv5__user-header-name {
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--nav-gray-800);
    margin: 0;
    line-height: 1.2;
  }

  .nv5__user-header-email {
    font-size: 0.72rem;
    color: var(--nav-gray-400);
    margin: 2px 0 0;
  }

  .nv5__user-header-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 0.62rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
    background: var(--nav-green-50);
    color: var(--nav-green-700);
    border: 1px solid var(--nav-green-200);
    margin-top: 4px;
  }

  .nv5__user-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    color: var(--nav-gray-700);
    text-decoration: none;
    font-size: 0.84rem;
    font-weight: 600;
    transition: all 0.15s ease;
    border: none;
    background: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }

  .nv5__user-menu-item:hover {
    background: var(--nav-green-50);
    color: var(--nav-green-800);
  }

  .nv5__user-menu-logout {
    color: #dc2626;
    border-top: 1px solid var(--nav-gray-100);
    margin-top: 4px;
    padding-top: 10px;
  }

  .nv5__user-menu-logout:hover {
    background: #fef2f2;
    color: #b91c1c;
  }

  /* ── Sign In ── */
  .nv5__signin-btn {
    padding: 8px 18px;
    border-radius: 10px;
    border: 1.5px solid var(--nav-green-200);
    background: var(--nav-white);
    color: var(--nav-green-700);
    font-size: 0.84rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    white-space: nowrap;
  }

  .nv5__signin-btn:hover {
    background: var(--nav-green-50);
    border-color: var(--nav-green-300);
    transform: translateY(-1px);
  }

  /* ── CTA Button ── */
  .nv5__cta {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--nav-green-600), var(--nav-green-800));
    color: white;
    font-size: 0.84rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.25s ease;
    box-shadow: 0 4px 14px rgba(5,150,105,0.28);
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }

  .nv5__cta::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 0; height: 0;
    background: rgba(255,255,255,0.12);
    border-radius: 50%;
    transform: translate(-50%,-50%);
    transition: width 0.4s, height 0.4s;
  }

  .nv5__cta:hover::before {
    width: 280px; height: 280px;
  }

  .nv5__cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(5,150,105,0.38);
  }

  /* ── Auth Skeleton ── */
  .nv5__auth-skel {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(110deg, var(--nav-green-100) 8%, var(--nav-green-50) 18%, var(--nav-green-100) 33%);
    background-size: 200% 100%;
    animation: nv5-shimmer 1.5s ease infinite;
  }

  @keyframes nv5-shimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }

  /* ── Hamburger ── */
  .nv5__hamburger {
    display: none;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1.5px solid var(--nav-green-100);
    background: var(--nav-white);
    cursor: pointer;
    position: relative;
    z-index: 2;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .nv5__hbox {
    width: 18px;
    height: 14px;
    position: relative;
  }

  .nv5__hline {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    border-radius: 2px;
    background: var(--nav-green-700);
    transition: all 0.3s ease;
  }

  .nv5__hline--1 { top: 0; }
  .nv5__hline--2 { top: 6px; }
  .nv5__hline--3 { top: 12px; }

  .nv5__hamburger--open .nv5__hline--1 { transform: translateY(6px) rotate(45deg); }
  .nv5__hamburger--open .nv5__hline--2 { opacity: 0; }
  .nv5__hamburger--open .nv5__hline--3 { transform: translateY(-6px) rotate(-45deg); }

  /* ══════════════════════════════════════════════════════════════════════
     SEARCH OVERLAY
  ══════════════════════════════════════════════════════════════════════ */

  .srch5 {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(6,78,59,0.25);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    flex-direction: column;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .srch5--open {
    opacity: 1;
    visibility: visible;
  }

  .srch5__container {
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(255,255,255,0.98);
    border-radius: 0 0 28px 28px;
    overflow: hidden;
    transform: translateY(-20px);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  }

  .srch5--open .srch5__container {
    transform: translateY(0);
  }

  /* ── Search Header ── */
  .srch5__header {
    padding: 20px 28px 16px;
    border-bottom: 1px solid var(--nav-green-100);
    background: var(--nav-white);
    flex-shrink: 0;
  }

  .srch5__header-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .srch5__back {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1.5px solid var(--nav-green-100);
    background: var(--nav-white);
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--nav-green-700);
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .srch5__back:hover {
    background: var(--nav-green-50);
  }

  .srch5__form {
    flex: 1;
    display: flex;
  }

  .srch5__input-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .srch5__input-icon {
    position: absolute;
    left: 16px;
    color: var(--nav-green-500);
    pointer-events: none;
  }

  .srch5__input {
    width: 100%;
    padding: 14px 48px 14px 48px;
    border: 2px solid var(--nav-green-200);
    border-radius: 14px;
    font-size: 1rem;
    font-weight: 500;
    color: var(--nav-gray-800);
    background: var(--nav-green-50);
    outline: none;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .srch5__input:focus {
    border-color: var(--nav-green-400);
    background: var(--nav-white);
    box-shadow: 0 0 0 4px rgba(5,150,105,0.08);
  }

  .srch5__input::placeholder {
    color: var(--nav-gray-400);
    font-weight: 500;
  }

  .srch5__clear {
    position: absolute;
    right: 12px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: var(--nav-green-100);
    color: var(--nav-green-700);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .srch5__clear:hover {
    background: var(--nav-green-200);
  }

  .srch5__spinner {
    position: absolute;
    right: 14px;
    width: 22px;
    height: 22px;
    border: 2.5px solid var(--nav-green-200);
    border-top-color: var(--nav-green-600);
    border-radius: 50%;
    animation: nv5-spin 0.7s linear infinite;
  }

  @keyframes nv5-spin {
    to { transform: rotate(360deg); }
  }

  .srch5__close-desktop {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1.5px solid var(--nav-green-100);
    background: var(--nav-white);
    color: var(--nav-green-700);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .srch5__close-desktop:hover {
    background: var(--nav-green-50);
    border-color: var(--nav-green-200);
  }

  /* ── Search Meta ── */
  .srch5__meta {
    margin-top: 12px;
    font-size: 0.8rem;
    color: var(--nav-gray-500);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .srch5__meta-count {
    font-weight: 800;
    color: var(--nav-green-700);
  }

  .srch5__meta-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--nav-green-200);
    border-top-color: var(--nav-green-600);
    border-radius: 50%;
    animation: nv5-spin 0.7s linear infinite;
    margin-right: 4px;
  }

  /* ── Search Body ── */
  .srch5__body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px 28px;
    scrollbar-width: thin;
    scrollbar-color: var(--nav-green-200) transparent;
  }

  .srch5__body::-webkit-scrollbar {
    width: 6px;
  }

  .srch5__body::-webkit-scrollbar-track {
    background: transparent;
  }

  .srch5__body::-webkit-scrollbar-thumb {
    background: var(--nav-green-200);
    border-radius: 99px;
  }

  /* ── Search Prompt (initial state) ── */
  .srch5__prompt {
    text-align: center;
    padding: 48px 24px 32px;
  }

  .srch5__prompt-icon {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    background: linear-gradient(135deg, var(--nav-green-50), var(--nav-green-100));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 18px;
    color: var(--nav-green-600);
    border: 1px solid var(--nav-green-200);
  }

  .srch5__prompt-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--nav-green-900);
    margin: 0 0 8px;
  }

  .srch5__prompt-text {
    font-size: 0.88rem;
    color: var(--nav-gray-500);
    margin: 0 0 28px;
    line-height: 1.6;
  }

  .srch5__popular {
    margin-top: 20px;
  }

  .srch5__popular-label {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--nav-gray-400);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin: 0 0 12px;
  }

  .srch5__popular-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .srch5__popular-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 50px;
    border: 1.5px solid var(--nav-green-200);
    background: var(--nav-white);
    color: var(--nav-green-700);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .srch5__popular-tag:hover {
    background: var(--nav-green-50);
    border-color: var(--nav-green-300);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(5,150,105,0.10);
  }

  /* ── Results Grid ── */
  .srch5__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  /* ── Result Card ── */
  .srch5__card {
    background: var(--nav-white);
    border-radius: 18px;
    border: 1.5px solid var(--nav-green-100);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    text-align: left;
    padding: 0;
    font-family: inherit;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    position: relative;
    animation: nv5-cardIn 0.35s ease both;
    animation-delay: calc(var(--ci, 0) * 0.05s);
  }

  @keyframes nv5-cardIn {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .srch5__card:hover {
    transform: translateY(-4px);
    border-color: var(--nav-green-300);
    box-shadow: 0 12px 32px rgba(5,150,105,0.12);
  }

  .srch5__card-img-wrap {
    position: relative;
    height: 150px;
    overflow: hidden;
    background: linear-gradient(135deg, var(--nav-green-50), var(--nav-green-100));
  }

  .srch5__card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.5s ease, transform 6s ease;
  }

  .srch5__card-img--active {
    opacity: 1;
  }

  .srch5__card:hover .srch5__card-img--active {
    transform: scale(1.06);
  }

  .srch5__card-img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--nav-green-400);
    font-size: 0.72rem;
    font-weight: 600;
  }

  .srch5__card-dots {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    z-index: 2;
  }

  .srch5__card-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    transition: all 0.2s;
  }

  .srch5__card-dot--active {
    background: white;
    width: 14px;
    border-radius: 99px;
  }

  .srch5__card-arrows {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .srch5__card:hover .srch5__card-arrows {
    opacity: 1;
  }

  .srch5__card-arrow {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--nav-green-800);
    transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .srch5__card-arrow:hover {
    background: white;
    transform: scale(1.1);
  }

  .srch5__card-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 3px 10px;
    border-radius: 20px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(8px);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--nav-green-800);
    text-transform: uppercase;
    letter-spacing: 0.4px;
    z-index: 2;
    border: 1px solid rgba(255,255,255,0.5);
  }

  .srch5__card-gradient {
    position: absolute;
    bottom: 0;
    left: 0; right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
    z-index: 1;
    pointer-events: none;
  }

  .srch5__card-body {
    padding: 14px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .srch5__card-name {
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--nav-gray-800);
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .srch5__card-loc {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.73rem;
    color: var(--nav-gray-400);
    font-weight: 600;
    margin: 0;
  }

  .srch5__card-desc {
    font-size: 0.74rem;
    color: var(--nav-gray-500);
    line-height: 1.5;
    margin: 2px 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .srch5__card-price {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid var(--nav-green-50);
  }

  .srch5__card-price-val {
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--nav-green-700);
  }

  .srch5__card-price-label {
    font-size: 0.65rem;
    color: var(--nav-gray-400);
    font-weight: 600;
  }

  .srch5__card-cta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--nav-green-600);
  }

  /* ── Empty State ── */
  .srch5__empty {
    text-align: center;
    padding: 40px 24px;
  }

  .srch5__empty-icon {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    background: var(--nav-green-50);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: var(--nav-green-400);
    border: 1px solid var(--nav-green-100);
  }

  .srch5__empty-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--nav-gray-800);
    margin: 0 0 8px;
  }

  .srch5__empty-text {
    font-size: 0.85rem;
    color: var(--nav-gray-500);
    margin: 0 0 20px;
    line-height: 1.6;
  }

  .srch5__empty-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .srch5__empty-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    text-decoration: none;
    border: 1.5px solid var(--nav-green-200);
    background: var(--nav-white);
    color: var(--nav-green-700);
  }

  .srch5__empty-btn:hover {
    background: var(--nav-green-50);
    transform: translateY(-1px);
  }

  .srch5__empty-btn--primary {
    background: linear-gradient(135deg, var(--nav-green-600), var(--nav-green-800));
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 14px rgba(5,150,105,0.25);
  }

  .srch5__empty-btn--primary:hover {
    box-shadow: 0 8px 24px rgba(5,150,105,0.35);
    background: linear-gradient(135deg, var(--nav-green-700), var(--nav-green-900));
  }

  /* ── Skeleton ── */
  .srch5__skel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .srch5__skel-card {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid var(--nav-green-100);
    animation: nv5-cardIn 0.35s ease both;
    animation-delay: calc(var(--si, 0) * 0.07s);
  }

  .srch5__skel-img {
    height: 150px;
    background: linear-gradient(110deg, var(--nav-green-100) 8%, var(--nav-green-50) 18%, var(--nav-green-100) 33%);
    background-size: 200% 100%;
    animation: nv5-shimmer 1.4s ease infinite;
  }

  .srch5__skel-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .srch5__skel-line {
    border-radius: 6px;
    background: linear-gradient(110deg, var(--nav-green-100) 8%, var(--nav-green-50) 18%, var(--nav-green-100) 33%);
    background-size: 200% 100%;
    animation: nv5-shimmer 1.4s ease infinite;
  }

  .srch5__skel-line--title { height: 14px; width: 70%; }
  .srch5__skel-line--sub   { height: 10px; width: 45%; }

  /* ══════════════════════════════════════════════════════════════════════
     BACKDROP
  ══════════════════════════════════════════════════════════════════════ */

  .nv5__backdrop {
    position: fixed;
    inset: 0;
    background: rgba(6,78,59,0.3);
    backdrop-filter: blur(4px);
    z-index: 998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nv5__backdrop--open {
    opacity: 1;
    visibility: visible;
  }

  /* ══════════════════════════════════════════════════════════════════════
     MOBILE MENU
  ══════════════════════════════════════════════════════════════════════ */

  .mm5 {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    max-width: 85vw;
    z-index: 999;
    background: var(--nav-white);
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,0.1);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--nav-green-200) transparent;
  }

  .mm5--open {
    transform: translateX(0);
  }

  .mm5__head {
    padding: 16px 20px;
    border-bottom: 1px solid var(--nav-green-100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    background: var(--nav-green-50);
  }

  .mm5__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }

  .mm5__logo-img-wrap {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(5,150,105,0.12);
  }

  .mm5__logo-img { width: 100%; height: 100%; object-fit: cover; }

  .mm5__logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--nav-green-800);
  }

  .mm5__close {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1.5px solid var(--nav-green-100);
    background: var(--nav-white);
    color: var(--nav-green-700);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mm5__search-bar {
    padding: 12px 20px;
    border-bottom: 1px solid var(--nav-green-50);
  }

  .mm5__search-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 16px;
    border-radius: 12px;
    border: 1.5px solid var(--nav-green-200);
    background: var(--nav-green-50);
    color: var(--nav-gray-400);
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    text-align: left;
  }

  .mm5__search-trigger:hover {
    border-color: var(--nav-green-300);
    background: var(--nav-white);
  }

  .mm5__body {
    flex: 1;
    padding: 12px 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mm5__link {
    display: flex;
    align-items: center;
    padding: 13px 14px;
    border-radius: 12px;
    color: var(--nav-gray-700);
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 700;
    transition: all 0.18s;
  }

  .mm5__link:hover, .mm5__link--active {
    background: var(--nav-green-50);
    color: var(--nav-green-800);
  }

  .mm5__link--active {
    font-weight: 800;
    position: relative;
  }

  .mm5__link--active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    border-radius: 0 99px 99px 0;
    background: var(--nav-green-600);
  }

  .mm5__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 14px;
    border-radius: 12px;
    color: var(--nav-gray-700);
    font-size: 0.92rem;
    font-weight: 700;
    border: none;
    background: none;
    cursor: pointer;
    width: 100%;
    font-family: inherit;
    transition: all 0.18s;
  }

  .mm5__toggle:hover, .mm5__toggle--active {
    background: var(--nav-green-50);
    color: var(--nav-green-800);
  }

  .mm5__toggle-chev {
    transition: transform 0.25s ease;
  }

  .mm5__toggle-chev--open {
    transform: rotate(180deg);
  }

  .mm5__sub {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease;
    padding-left: 12px;
  }

  .mm5__sub--open {
    max-height: 600px;
  }

  .mm5__sub-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    color: var(--nav-gray-600);
    text-decoration: none;
    font-size: 0.84rem;
    font-weight: 600;
    transition: all 0.15s;
  }

  .mm5__sub-link:hover, .mm5__sub-link--active {
    background: var(--nav-green-50);
    color: var(--nav-green-800);
  }

  .mm5__sub-flag {
    width: 24px;
    height: 18px;
    border-radius: 3px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid var(--nav-gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }

  .mm5__sub-flag img { width: 100%; height: 100%; object-fit: cover; }

  .mm5__sub-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--nav-green-300);
    flex-shrink: 0;
  }

  .mm5__sub-info {
    display: block;
    font-size: 0.68rem;
    color: var(--nav-gray-400);
    margin-top: 1px;
  }

  .mm5__divider {
    height: 1px;
    background: var(--nav-green-100);
    margin: 10px 0;
  }

  /* Mobile Auth */
  .mm5__auth { display: flex; flex-direction: column; gap: 2px; }

  .mm5__profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: 14px;
    background: var(--nav-green-50);
    margin-bottom: 8px;
  }

  .mm5__profile-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid var(--nav-green-200);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--nav-green-100);
    font-weight: 800;
    color: var(--nav-green-700);
    font-size: 0.85rem;
  }

  .mm5__profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .mm5__profile-name {
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--nav-gray-800);
    margin: 0;
  }

  .mm5__profile-email {
    font-size: 0.72rem;
    color: var(--nav-gray-400);
    margin: 2px 0 0;
  }

  .mm5__profile-badge {
    font-size: 0.62rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
    background: var(--nav-green-100);
    color: var(--nav-green-700);
    display: inline-block;
    margin-top: 3px;
  }

  .mm5__auth-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-radius: 10px;
    color: var(--nav-gray-700);
    text-decoration: none;
    font-size: 0.86rem;
    font-weight: 600;
    transition: all 0.15s;
  }

  .mm5__auth-link:hover {
    background: var(--nav-green-50);
    color: var(--nav-green-800);
  }

  .mm5__logout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-radius: 10px;
    border: none;
    background: none;
    color: #dc2626;
    font-size: 0.86rem;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    font-family: inherit;
    transition: all 0.15s;
    border-top: 1px solid var(--nav-gray-100);
    margin-top: 4px;
  }

  .mm5__logout:hover { background: #fef2f2; }

  .mm5__signin {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 20px;
    border-radius: 12px;
    border: 1.5px solid var(--nav-green-200);
    background: var(--nav-white);
    color: var(--nav-green-700);
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }

  .mm5__signin:hover {
    background: var(--nav-green-50);
    border-color: var(--nav-green-300);
  }

  .mm5__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--nav-green-600), var(--nav-green-800));
    color: white;
    font-size: 0.92rem;
    font-weight: 700;
    text-decoration: none;
    margin-top: 12px;
    box-shadow: 0 4px 16px rgba(5,150,105,0.3);
    transition: all 0.2s;
  }

  .mm5__cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(5,150,105,0.4);
  }

  /* ══════════════════════════════════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════════════════════════════════ */

  @media (max-width: 1024px) {
    .nv5__links { display: none; }
    .nv5__cta   { display: none; }
    .nv5__hamburger { display: flex; }
  }

  @media (max-width: 640px) {
    .nv5 { --nav-height: 64px; }
    .nv5__signin-btn { display: none; }
    .srch5__back { display: flex; }
    .srch5__close-desktop { display: none; }
    .srch5__container {
      max-width: 100%;
      border-radius: 0;
    }
    .srch5__header { padding: 14px 16px 12px; }
    .srch5__body   { padding: 16px; }
    .srch5__grid   { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
    .srch5__card-img-wrap { height: 120px; }
    .mm5 { width: 100%; max-width: 100%; }
  }

  @media (min-width: 641px) {
    .srch5__back { display: none; }
  }

  @media (min-width: 1025px) {
    .nv5__hamburger { display: none; }
  }
`

let _navStylesInjected = false
function injectNavStyles() {
  if (_navStylesInjected || typeof document === 'undefined') return
  if (document.getElementById('nv5-styles')) { _navStylesInjected = true; return }
  const el = document.createElement('style')
  el.id = 'nv5-styles'
  el.textContent = NAVBAR_STYLES
  document.head.appendChild(el)
  _navStylesInjected = true
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════════════════ */

const cn = (...c) => c.filter(Boolean).join(' ')

const POPULAR_SEARCHES = [
  { label: 'Safari Tours',    query: 'safari',    icon: Compass },
  { label: 'Mountain Treks',  query: 'mountain',  icon: TrendingUp },
  { label: 'Beach Getaways',  query: 'beach',     icon: Globe },
  { label: 'Cultural Tours',  query: 'cultural',  icon: MapPin },
]

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH DESTINATION CARD
═══════════════════════════════════════════════════════════════════════════ */

function SearchCard({ destination, onClick, index }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imgError, setImgError]         = useState(new Set())
  const slideTimer = useRef(null)

  const images = useMemo(() => {
    const imgs = new Set()
    if (destination.heroImage) imgs.add(destination.heroImage)
    for (const arr of [destination.images, destination.gallery]) {
      if (Array.isArray(arr)) {
        arr.forEach(img => {
          const url = typeof img === 'string' ? img : img?.url || img?.src
          if (url) imgs.add(url)
        })
      }
    }
    return [...imgs].slice(0, 5)
  }, [destination])

  const validImages = useMemo(
    () => images.filter((_, i) => !imgError.has(i)),
    [images, imgError],
  )

  useEffect(() => {
    if (validImages.length <= 1) return
    slideTimer.current = setInterval(() => {
      setCurrentSlide(p => (p + 1) % validImages.length)
    }, 3200 + index * 300)
    return () => clearInterval(slideTimer.current)
  }, [validImages.length, index])

  const goSlide = (dir, e) => {
    e.stopPropagation()
    e.preventDefault()
    clearInterval(slideTimer.current)
    setCurrentSlide(p =>
      dir === 'next'
        ? (p + 1) % validImages.length
        : (p - 1 + validImages.length) % validImages.length
    )
    slideTimer.current = setInterval(() => {
      setCurrentSlide(p => (p + 1) % validImages.length)
    }, 3500)
  }

  return (
    <button
      className="srch5__card"
      style={{ '--ci': index }}
      onClick={onClick}
      type="button"
      tabIndex={0}
      aria-label={`View ${destination.name}`}
    >
      <div className="srch5__card-img-wrap">
        {validImages.length > 0 ? (
          validImages.map((img, i) => (
            <img
              key={`${img}-${i}`}
              src={img}
              alt={`${destination.name} ${i + 1}`}
              className={cn(
                'srch5__card-img',
                i === currentSlide && 'srch5__card-img--active',
              )}
              loading="lazy"
              draggable={false}
              onError={() => setImgError(prev => new Set([...prev, images.indexOf(img)]))}
            />
          ))
        ) : (
          <div className="srch5__card-img-placeholder">
            <Mountain size={24} />
            <span>No image</span>
          </div>
        )}

        {validImages.length > 1 && (
          <>
            <div className="srch5__card-dots">
              {validImages.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'srch5__card-dot',
                    i === currentSlide && 'srch5__card-dot--active',
                  )}
                />
              ))}
            </div>
            <div className="srch5__card-arrows">
              <button
                className="srch5__card-arrow"
                onClick={e => goSlide('prev', e)}
                type="button"
                aria-label="Previous"
              >
                <ChevronLeft size={12} />
              </button>
              <button
                className="srch5__card-arrow"
                onClick={e => goSlide('next', e)}
                type="button"
                aria-label="Next"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </>
        )}

        {destination.category && (
          <span className="srch5__card-badge">{destination.category}</span>
        )}
        <div className="srch5__card-gradient" />
      </div>

      <div className="srch5__card-body">
        <h4 className="srch5__card-name">{destination.name}</h4>
        {destination.country && (
          <p className="srch5__card-loc">
            <MapPin size={10} /> {destination.country}
          </p>
        )}
        {destination.description && (
          <p className="srch5__card-desc">
            {destination.description.slice(0, 80)}
            {destination.description.length > 80 ? '...' : ''}
          </p>
        )}
        {destination.price && (
          <div className="srch5__card-price">
            <div>
              <span className="srch5__card-price-label">From</span>
              <span className="srch5__card-price-val"> ${destination.price}</span>
            </div>
            <span className="srch5__card-cta">
              View <ArrowRight size={11} />
            </span>
          </div>
        )}
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH OVERLAY
═══════════════════════════════════════════════════════════════════════════ */

function SearchOverlay({
  isOpen, onClose, searchValue, setSearchValue,
  searchResults, isSearching, onResultClick,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const hasQuery   = searchValue.trim().length >= 2
  const hasResults = searchResults.length > 0
  const showEmpty  = hasQuery && !isSearching && !hasResults
  const showPrompt = !hasQuery && !isSearching && !hasResults

  return (
    <div
      className={cn('srch5', isOpen && 'srch5--open')}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search destinations"
    >
      <div
        className="srch5__container"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="srch5__header">
          <div className="srch5__header-row">
            <button
              className="srch5__back"
              onClick={onClose}
              type="button"
              aria-label="Close search"
            >
              <ChevronLeft size={20} />
            </button>

            <form
              onSubmit={e => { e.preventDefault() }}
              className="srch5__form"
            >
              <div className="srch5__input-wrap">
                <Search className="srch5__input-icon" size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search destinations, countries..."
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  className="srch5__input"
                  autoComplete="off"
                  spellCheck={false}
                />
                {searchValue && !isSearching && (
                  <button
                    type="button"
                    className="srch5__clear"
                    onClick={() => {
                      setSearchValue('')
                      inputRef.current?.focus()
                    }}
                    aria-label="Clear"
                  >
                    <X size={14} />
                  </button>
                )}
                {isSearching && <div className="srch5__spinner" />}
              </div>
            </form>

            <button
              className="srch5__close-desktop"
              onClick={onClose}
              type="button"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {hasQuery && (
            <div className="srch5__meta">
              {isSearching ? (
                <>
                  <span className="srch5__meta-spinner" />
                  Searching for "{searchValue}"...
                </>
              ) : hasResults ? (
                <>
                  <span className="srch5__meta-count">{searchResults.length}</span>
                  {` destination${searchResults.length !== 1 ? 's' : ''} found for `}
                  <strong>"{searchValue}"</strong>
                </>
              ) : (
                <span style={{ color: 'var(--nav-gray-400)' }}>
                  No results for <strong>"{searchValue}"</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="srch5__body">

          {/* Prompt */}
          {showPrompt && (
            <div className="srch5__prompt">
              <div className="srch5__prompt-icon">
                <Compass size={30} />
              </div>
              <h3 className="srch5__prompt-title">
                Discover your next adventure
              </h3>
              <p className="srch5__prompt-text">
                Search from hundreds of destinations across Africa and beyond.
              </p>
              <div className="srch5__popular">
                <p className="srch5__popular-label">Popular searches</p>
                <div className="srch5__popular-tags">
                  {POPULAR_SEARCHES.map(({ label, query, icon: Icon }) => (
                    <button
                      key={query}
                      type="button"
                      className="srch5__popular-tag"
                      onClick={() => {
                        setSearchValue(query)
                        inputRef.current?.focus()
                      }}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skeleton */}
          {isSearching && !hasResults && (
            <div className="srch5__skel-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="srch5__skel-card" style={{ '--si': i }}>
                  <div className="srch5__skel-img" />
                  <div className="srch5__skel-body">
                    <div className="srch5__skel-line srch5__skel-line--title" />
                    <div className="srch5__skel-line srch5__skel-line--sub" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {showEmpty && (
            <div className="srch5__empty">
              <div className="srch5__empty-icon">
                <Search size={30} />
              </div>
              <h3 className="srch5__empty-title">No destinations found</h3>
              <p className="srch5__empty-text">
                We couldn't find anything matching "{searchValue}".
                Try different keywords or explore all destinations.
              </p>
              <div className="srch5__empty-actions">
                <button
                  type="button"
                  className="srch5__empty-btn"
                  onClick={() => {
                    setSearchValue('')
                    inputRef.current?.focus()
                  }}
                >
                  <X size={14} /> Clear search
                </button>
                <Link
                  to="/destinations"
                  className="srch5__empty-btn srch5__empty-btn--primary"
                  onClick={onClose}
                >
                  <Globe size={14} /> Browse all
                </Link>
              </div>

              <div style={{ marginTop: 24 }}>
                <p className="srch5__popular-label">Try searching for:</p>
                <div className="srch5__popular-tags">
                  {POPULAR_SEARCHES.map(({ label, query }) => (
                    <button
                      key={query}
                      type="button"
                      className="srch5__popular-tag"
                      onClick={() => {
                        setSearchValue(query)
                        inputRef.current?.focus()
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="srch5__grid">
              {searchResults.map((dest, idx) => (
                <SearchCard
                  key={dest.id || dest.slug || idx}
                  destination={dest}
                  index={idx}
                  onClick={() => onResultClick(dest)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════════════════ */

const Navbar = () => {
  useEffect(() => { injectNavStyles() }, [])

  /* ── State ── */
  const [isScrolled, setIsScrolled]     = useState(false)
  const [navHidden, setNavHidden]       = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [activeDD, setActiveDD]         = useState(null)
  const [activeMDD, setActiveMDD]       = useState(null)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searchValue, setSearchValue]   = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [logoDetached, setLogoDetached] = useState(false)
  const [logoRect, setLogoRect]         = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  /* ── Hooks ── */
  const location  = useLocation()
  const navigate  = useNavigate()
  const { favorites } = useApp()
  const { user, isAuthenticated, authLoading, openModal, logout } = useUserAuth()
  const { countries: backendCountries } = useCountries({ limit: 12 })

  /* ── Refs ── */
  const headerRef       = useRef(null)
  const userMenuRef     = useRef(null)
  const ddTimer         = useRef(null)
  const searchAbort     = useRef(null)
  const latestSearch    = useRef('')
  const lastScrollY     = useRef(0)
  const prevHidden      = useRef(false)
  const logoTimer       = useRef(null)
  const logoRef         = useRef(null)

  /* ── Nav Links ── */
  const destinationsDD = useMemo(() => {
    const items = [{ name: 'All Destinations', path: '/destinations', isOverview: true }]
    if (backendCountries?.length > 0) {
      backendCountries.forEach(c =>
        items.push({
          name: c.name,
          flag: c.flagUrl || c.flag_url || c.flag || '',
          info: c.tagline || c.region || c.capital || c.continent ||
                c.subRegion || c.shortDescription ||
                (c.description ? `${c.description.slice(0, 55)}...` : ''),
          path: `/country/${getCountrySlug(c)}`,
        }),
      )
    }
    return items
  }, [backendCountries])

  const navLinks = useMemo(() => [
    { name: 'Home',            path: '/' },
    { name: 'Explore',         path: '/explore' },
    { name: 'Destinations',    path: '/destinations' },
    { name: 'Interactive Map', path: '/interactive-map' },
    { name: 'Tips',            path: '/tips' },
    {
      name: 'About',
      path: '/about',
      dropdown: [
        { name: 'About Us',       path: '/about' },
        { name: 'Our Services',   path: '/services' },
        { name: 'Payment Terms',  path: '/payment-terms' },
        { name: 'Our Team',       path: '/team' },
      ],
    },
    { name: 'Contact', path: '/contact' },
  ], [])

  const userMenuItems = useMemo(() => {
    const items = [
      { to: '/dashboard',   icon: Bookmark,  label: 'Dashboard' },
      { to: '/profile',     icon: User,      label: 'Profile' },
      { to: '/my-bookings', icon: Calendar,  label: 'Your Bookings' },
      { to: '/wishlist',    icon: Heart,     label: 'Wishlist' },
      { to: '/settings',    icon: Settings,  label: 'Settings' },
    ]
    if (user?.role === 'admin' || user?.role === 'manager') {
      items.push({ to: '/admin/dashboard', icon: Shield, label: 'Admin Panel' })
    }
    return items
  }, [user?.role])

  /* ── Scroll handling ── */
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        setIsScrolled(y > 20)
        if (y > 80) {
          if (y > lastScrollY.current + 5)      setNavHidden(true)
          else if (y < lastScrollY.current - 5) setNavHidden(false)
        } else setNavHidden(false)
        lastScrollY.current = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Floating logo ── */
  useEffect(() => {
    const prev = prevHidden.current
    prevHidden.current = navHidden
    if (navHidden && !prev) {
      if (logoRef.current) {
        const r = logoRef.current.getBoundingClientRect()
        setLogoRect({ top: r.top, left: r.left })
      }
      setLogoDetached(true)
    } else if (!navHidden && prev) {
      logoTimer.current = setTimeout(() => setLogoDetached(false), 500)
    }
    return () => clearTimeout(logoTimer.current)
  }, [navHidden])

  /* ── Close all on route change ── */
  const closeAll = useCallback(() => {
    setMobileOpen(false)
    setActiveDD(null)
    setActiveMDD(null)
    setUserMenuOpen(false)
    setSearchOpen(false)
  }, [])

  useEffect(() => closeAll(), [location.pathname, closeAll])
  useEffect(() => setAvatarLoaded(false), [user?.avatar])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* ── Live search ── */
  useEffect(() => {
    const q = searchValue.trim()
    latestSearch.current = q

    if (searchAbort.current) {
      searchAbort.current.abort()
      searchAbort.current = null
    }

    if (q.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const tid = setTimeout(async () => {
      setIsSearching(true)
      const ctrl = new AbortController()
      searchAbort.current = ctrl
      try {
        const res = await fetch(
          `${API_URL}/destinations/suggestions?q=${encodeURIComponent(q)}&limit=12`,
          { signal: ctrl.signal },
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (latestSearch.current !== q) return
        const raw     = data?.data || data?.results || data || []
        const adapted = Array.isArray(raw)
          ? raw.map(adaptDestination).filter(Boolean)
          : []
        setSearchResults(adapted.slice(0, 12))
      } catch (err) {
        if (err.name !== 'AbortError' && latestSearch.current === q) {
          setSearchResults([])
        }
      } finally {
        if (latestSearch.current === q) setIsSearching(false)
      }
    }, 280)

    return () => clearTimeout(tid)
  }, [searchValue, API_URL])

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const fn = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setActiveDD(null)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* ── Handlers ── */
  const handleResultClick = useCallback((dest) => {
    navigate(`/destinations/${dest.slug || dest.id}`)
    setSearchOpen(false)
    setSearchValue('')
    setSearchResults([])
  }, [navigate])

  const handleDDEnter = useCallback((n) => {
    clearTimeout(ddTimer.current)
    setActiveDD(n)
  }, [])

  const handleDDLeave = useCallback(() => {
    ddTimer.current = setTimeout(() => setActiveDD(null), 150)
  }, [])

  const isActive = useCallback((l) =>
    location.pathname === l.path ||
    l.dropdown?.some(d => d.path === location.pathname) ||
    false,
  [location.pathname])

  const getInitials = useCallback(() => {
    const n = user?.fullName || user?.name || ''
    return n
      ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : user?.email?.[0]?.toUpperCase() || 'U'
  }, [user])

  const displayName = useMemo(
    () => user?.fullName || user?.name || user?.email?.split('@')[0] || 'User',
    [user],
  )

  const providerLabel = useMemo(() => {
    const p = (user?.authProvider || '').toLowerCase()
    return p === 'google' ? 'Google' : p === 'github' ? 'GitHub' : 'Email'
  }, [user?.authProvider])

  const handleLogout = useCallback(() => {
    closeAll()
    logout()
    navigate('/')
  }, [closeAll, logout, navigate])

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */

  return (
    <>
      {/* Floating logo */}
      {logoDetached && logoRect && (
        <Link
          to="/"
          className={cn('nv5__float-logo', navHidden && 'nv5__float-logo--visible')}
          style={{ left: logoRect.left }}
          aria-label="Home"
        >
          <div className="nv5__logo-img-wrap">
            <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="nv5__logo-img" draggable={false} />
          </div>
        </Link>
      )}

      {/* NAVBAR */}
      <nav
        ref={headerRef}
        role="navigation"
        className={cn(
          'nv5',
          isScrolled && 'nv5--scrolled',
          navHidden  && 'nv5--hidden',
        )}
      >
        <div className="nv5__inner">
          {/* Logo */}
          <Link ref={logoRef} to="/" className="nv5__logo" aria-label="Altuvera Home">
            <div className="nv5__logo-img-wrap">
              <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="nv5__logo-img" draggable={false} />
            </div>
            <span className="nv5__logo-text">Altuvera</span>
          </Link>

          {/* Desktop Links */}
          <div className="nv5__links">
            {navLinks.map(link => (
              <div
                key={link.name}
                className="nv5__item"
                onMouseEnter={() => link.dropdown && handleDDEnter(link.name)}
                onMouseLeave={handleDDLeave}
              >
                <Link
                  to={link.path}
                  onClick={e => { if (link.dropdown) { e.preventDefault(); setActiveDD(p => p === link.name ? null : link.name) } }}
                  onMouseEnter={() => preloadRoute(link.path)}
                  className={cn('nv5__link', isActive(link) && 'nv5__link--active')}
                >
                  {link.name}
                  {link.dropdown && (
                    <ChevronDown
                      size={13}
                      className={cn('nv5__chevron', activeDD === link.name && 'nv5__chevron--open')}
                    />
                  )}
                </Link>

                {link.dropdown && (
                  <div className={cn('nv5__dropdown', activeDD === link.name && 'nv5__dropdown--open')}>
                    {link.dropdown.map(sub => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className="nv5__dropdown-link"
                        onClick={() => setActiveDD(null)}
                      >
                        {sub.flag ? (
                          <span className="nv5__dropdown-flag">
                            {sub.flag.startsWith('http') || sub.flag.includes('/')
                              ? <img src={sub.flag} alt="" />
                              : sub.flag}
                          </span>
                        ) : (
                          <span className="nv5__dropdown-dot" />
                        )}
                        <div>
                          <span className="nv5__dropdown-name">{sub.name}</span>
                          {sub.info && <span className="nv5__dropdown-info">{sub.info}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="nv5__actions">
            {/* Search */}
            <button
              className="nv5__icon-btn"
              onClick={() => setSearchOpen(true)}
              type="button"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Favorites */}
            <Link to="/gallery" className="nv5__icon-btn" aria-label="Favorites">
              <Heart size={18} />
              {favorites.length > 0 && (
                <span className="nv5__icon-badge">{favorites.length}</span>
              )}
            </Link>

            {/* User */}
            {authLoading ? (
              <span className="nv5__auth-skel" />
            ) : isAuthenticated ? (
              <div className="nv5__user" ref={userMenuRef}>
                <button
                  className="nv5__avatar-btn"
                  onClick={() => setUserMenuOpen(p => !p)}
                  type="button"
                  aria-expanded={userMenuOpen}
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" onLoad={() => setAvatarLoaded(true)} />
                  ) : (
                    getInitials()
                  )}
                </button>

                <div className={cn('nv5__user-menu', userMenuOpen && 'nv5__user-menu--open')}>
                  <div className="nv5__user-header">
                    <div className="nv5__user-header-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" />
                      ) : getInitials()}
                    </div>
                    <div>
                      <p className="nv5__user-header-name">{displayName}</p>
                      <p className="nv5__user-header-email">{user?.email}</p>
                      <span className="nv5__user-header-badge">
                        <Shield size={9} />
                        {user?.isVerified ? 'Verified' : providerLabel}
                      </span>
                    </div>
                  </div>

                  {userMenuItems.map(m => (
                    <Link
                      key={m.to}
                      to={m.to}
                      className="nv5__user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <m.icon size={16} /> {m.label}
                    </Link>
                  ))}

                  <button
                    className="nv5__user-menu-item nv5__user-menu-logout"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="nv5__signin-btn"
                onClick={() => openModal('login', { skipNotLoggedInMessage: true })}
                type="button"
              >
                Sign In
              </button>
            )}

            {/* CTA */}
            <Link to="/booking" className="nv5__cta">
              <span>Book Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className={cn('nv5__hamburger', mobileOpen && 'nv5__hamburger--open')}
            onClick={() => setMobileOpen(p => !p)}
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="nv5__hbox">
              <span className="nv5__hline nv5__hline--1" />
              <span className="nv5__hline nv5__hline--2" />
              <span className="nv5__hline nv5__hline--3" />
            </span>
          </button>
        </div>
      </nav>

      {/* SEARCH OVERLAY */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchValue('') }}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        searchResults={searchResults}
        isSearching={isSearching}
        onResultClick={handleResultClick}
      />

      {/* BACKDROP */}
      <div
        className={cn('nv5__backdrop', mobileOpen && 'nv5__backdrop--open')}
        onClick={() => setMobileOpen(false)}
      />

      {/* MOBILE MENU */}
      <aside
        className={cn('mm5', mobileOpen && 'mm5--open')}
        aria-hidden={!mobileOpen}
      >
        <div className="mm5__head">
          <Link to="/" className="mm5__logo" onClick={() => setMobileOpen(false)}>
            <div className="mm5__logo-img-wrap">
              <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="mm5__logo-img" />
            </div>
            <span className="mm5__logo-text">Altuvera</span>
          </Link>
          <button className="mm5__close" onClick={() => setMobileOpen(false)} type="button" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="mm5__search-bar">
          <button
            className="mm5__search-trigger"
            onClick={() => {
              setMobileOpen(false)
              setTimeout(() => setSearchOpen(true), 200)
            }}
            type="button"
          >
            <Search size={16} />
            <span>Search destinations...</span>
          </button>
        </div>

        <div className="mm5__body">
          {navLinks.map(link => (
            <div key={link.name}>
              {link.dropdown ? (
                <>
                  <button
                    className={cn('mm5__toggle', activeMDD === link.name && 'mm5__toggle--active')}
                    onClick={() => setActiveMDD(p => p === link.name ? null : link.name)}
                    type="button"
                  >
                    {link.name}
                    <ChevronDown
                      size={16}
                      className={cn('mm5__toggle-chev', activeMDD === link.name && 'mm5__toggle-chev--open')}
                    />
                  </button>
                  <div className={cn('mm5__sub', activeMDD === link.name && 'mm5__sub--open')}>
                    {link.dropdown.map(sub => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={cn(
                          'mm5__sub-link',
                          location.pathname === sub.path && 'mm5__sub-link--active',
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.flag ? (
                          <span className="mm5__sub-flag">
                            {sub.flag.startsWith('http') || sub.flag.includes('/')
                              ? <img src={sub.flag} alt="" />
                              : sub.flag}
                          </span>
                        ) : (
                          <span className="mm5__sub-dot" />
                        )}
                        <div>
                          <span>{sub.name}</span>
                          {sub.info && <span className="mm5__sub-info">{sub.info}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.path}
                  className={cn('mm5__link', location.pathname === link.path && 'mm5__link--active')}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          <div className="mm5__divider" />

          <div className="mm5__auth">
            {isAuthenticated ? (
              <>
                <div className="mm5__profile">
                  <div className="mm5__profile-avatar">
                    {user?.avatar ? <img src={user.avatar} alt="" /> : getInitials()}
                  </div>
                  <div>
                    <p className="mm5__profile-name">{displayName}</p>
                    <p className="mm5__profile-email">{user?.email}</p>
                    <span className="mm5__profile-badge">
                      {user?.isVerified ? 'Verified' : providerLabel}
                    </span>
                  </div>
                </div>

                {userMenuItems.map(m => (
                  <Link
                    key={m.to}
                    to={m.to}
                    className="mm5__auth-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    <m.icon size={16} /> {m.label}
                  </Link>
                ))}

                <button className="mm5__logout" onClick={handleLogout} type="button">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <button
                className="mm5__signin"
                onClick={() => {
                  setMobileOpen(false)
                  openModal('login', { skipNotLoggedInMessage: true })
                }}
                type="button"
              >
                <User size={16} /> Sign In / Sign Up
              </button>
            )}
          </div>

          <Link
            to="/booking"
            className="mm5__cta"
            onClick={() => setMobileOpen(false)}
          >
            Book Your Adventure
            <ArrowRight size={16} />
          </Link>
        </div>
      </aside>
    </>
  )
}

export default Navbar