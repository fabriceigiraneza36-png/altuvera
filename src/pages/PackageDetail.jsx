// ============================================================================
// src/pages/PackageDetail.jsx — Premium Green/White Redesign
// ============================================================================

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Clock, Users, Star, ChevronLeft, ChevronRight,
  ChevronDown, Check, X, BookOpen, Heart, Share2, Loader2,
  Package, Phone, Mail, User, Sparkles, Shield, CheckCircle,
  XCircle, AlertCircle, Info, Camera, MessageCircle,
  ArrowRight, Zap, Globe, Calendar, Mountain, Compass,
  Award, TrendingUp, Coffee, Sun, Wind, Leaf,
} from 'lucide-react'
import { packagesAPI } from '../api/packages'
import { createBooking } from '../api/bookingApi'
import { useUserAuth }  from '../context/UserAuthContext'
import { useMessaging } from '../context/MessagingContext'

/* ── helpers ─────────────────────────────────────────────────────────── */
const fmtPrice = (price, currency = 'USD') => {
  if (!price && price !== 0) return 'Contact Us'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(price)
  } catch { return `$${Number(price).toLocaleString()}` }
}

const fmtDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const parseJson = (val, fallback = []) => {
  if (!val) return fallback
  if (Array.isArray(val)) return val
  if (typeof val === 'string') { try { return JSON.parse(val) } catch { return fallback } }
  return fallback
}

/* ══════════════════════════════════════════════════════════════════════
   INJECT STYLES
   ══════════════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

  .pkd-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #f0fdf4;
    min-height: 100vh;
  }

  /* ── Hero ── */
  .pkd-hero {
    position: relative;
    height: 70vh;
    min-height: 480px;
    max-height: 680px;
    overflow: hidden;
  }
  .pkd-hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 8s ease;
  }
  .pkd-hero:hover .pkd-hero-img { transform: scale(1.04); }
  .pkd-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgba(2,44,22,0.18) 0%,
      rgba(4,47,31,0.55) 60%,
      rgba(1,30,15,0.85) 100%
    );
  }
  .pkd-hero-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(24px, 5vw, 64px);
  }
  .pkd-hero-nav {
    position: absolute;
    top: 0; left: 0; right: 0;
    padding: clamp(16px, 3vw, 28px) clamp(20px, 5vw, 64px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
    background: linear-gradient(to bottom, rgba(0,0,0,0.35), transparent);
  }

  /* ── Layout ── */
  .pkd-layout {
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 clamp(16px, 3vw, 40px);
  }
  .pkd-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 32px;
    align-items: start;
  }
  @media (max-width: 1100px) {
    .pkd-grid { grid-template-columns: 1fr; }
  }

  /* ── Cards ── */
  .pkd-card {
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #dcfce7;
    box-shadow: 0 2px 16px rgba(5,150,105,0.06);
    overflow: hidden;
  }
  .pkd-card-p { padding: clamp(20px, 4vw, 36px); }

  /* ── Sidebar sticky ── */
  .pkd-sidebar {
    position: sticky;
    top: 88px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  @media (max-width: 1100px) {
    .pkd-sidebar { position: static; }
  }

  /* ── Tabs ── */
  .pkd-tabs {
    display: flex;
    gap: 0;
    background: #f0fdf4;
    border-radius: 16px;
    padding: 5px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .pkd-tabs::-webkit-scrollbar { display: none; }
  .pkd-tab {
    flex-shrink: 0;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.22s ease;
    color: #6b7280;
    background: transparent;
    white-space: nowrap;
  }
  .pkd-tab.active {
    background: #ffffff;
    color: #065f46;
    box-shadow: 0 2px 12px rgba(5,150,105,0.14);
  }
  .pkd-tab:not(.active):hover { color: #059669; background: rgba(255,255,255,0.5); }

  /* ── Itinerary timeline ── */
  .pkd-timeline { display: flex; flex-direction: column; gap: 0; }
  .pkd-timeline-item { display: flex; gap: 20px; }
  .pkd-timeline-left {
    display: flex; flex-direction: column; align-items: center;
    flex-shrink: 0; width: 44px;
  }
  .pkd-timeline-dot {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #059669, #065f46);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 13px;
    box-shadow: 0 4px 14px rgba(5,150,105,0.35);
    flex-shrink: 0; position: relative; z-index: 1;
  }
  .pkd-timeline-line {
    width: 2px; flex: 1; min-height: 24px;
    background: linear-gradient(to bottom, #bbf7d0, #dcfce7);
    margin: 4px 0;
  }
  .pkd-timeline-body {
    flex: 1; padding-bottom: 28px;
  }
  .pkd-timeline-card {
    background: linear-gradient(135deg, #f0fdf4, #ffffff);
    border: 1px solid #bbf7d0;
    border-radius: 18px;
    padding: 18px 22px;
    transition: all 0.2s ease;
  }
  .pkd-timeline-card:hover {
    border-color: #86efac;
    box-shadow: 0 6px 24px rgba(5,150,105,0.10);
    transform: translateX(4px);
  }

  /* ── Gallery grid ── */
  .pkd-gallery-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 8px;
  }
  .pkd-gallery-main {
    grid-row: span 2;
    border-radius: 18px 0 0 18px;
    overflow: hidden;
    position: relative;
    min-height: 300px;
    cursor: zoom-in;
  }
  .pkd-gallery-thumb {
    border-radius: 0;
    overflow: hidden;
    cursor: pointer;
    position: relative;
  }
  .pkd-gallery-thumb:first-of-type { border-radius: 0 18px 0 0; }
  .pkd-gallery-thumb:last-of-type  { border-radius: 0 0 18px 0; }

  /* ── Price badge ── */
  .pkd-price-tag {
    font-family: 'Playfair Display', Georgia, serif;
  }

  /* ── Inclusion items ── */
  .pkd-inc-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px;
    border-radius: 12px;
    background: #f0fdf4;
    border: 1px solid #d1fae5;
    font-size: 13.5px;
    color: #1f2937;
    line-height: 1.5;
    transition: all 0.18s;
  }
  .pkd-inc-item:hover { background: #dcfce7; border-color: #86efac; }
  .pkd-exc-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px;
    border-radius: 12px;
    background: #fef2f2;
    border: 1px solid #fee2e2;
    font-size: 13.5px;
    color: #1f2937;
    line-height: 1.5;
    transition: all 0.18s;
  }
  .pkd-exc-item:hover { background: #fee2e2; }

  /* ── Highlight pill ── */
  .pkd-highlight {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    border: 1px solid #a7f3d0;
    border-radius: 14px;
    transition: all 0.2s;
  }
  .pkd-highlight:hover {
    border-color: #6ee7b7;
    box-shadow: 0 4px 16px rgba(5,150,105,0.12);
    transform: translateY(-2px);
  }

  /* ── Booking form inputs ── */
  .pkd-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #d1fae5;
    border-radius: 12px;
    font-size: 13.5px;
    color: #111827;
    background: #f9fffe;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }
  .pkd-input:focus {
    border-color: #059669;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.10);
  }
  .pkd-input.error { border-color: #f87171; background: #fff5f5; }
  .pkd-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
  }

  /* ── CTA button ── */
  .pkd-cta {
    width: 100%;
    padding: 15px 24px;
    background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s ease;
    box-shadow: 0 8px 28px rgba(5,150,105,0.32);
    letter-spacing: 0.01em;
    position: relative;
    overflow: hidden;
  }
  .pkd-cta::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 0; height: 0;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    transform: translate(-50%,-50%);
    transition: width 0.5s, height 0.5s;
  }
  .pkd-cta:hover::before { width: 400px; height: 400px; }
  .pkd-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(5,150,105,0.42);
  }
  .pkd-cta:active { transform: translateY(0); }
  .pkd-cta:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  /* ── Trust badges ── */
  .pkd-trust-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 10px;
    border-radius: 14px;
    transition: all 0.2s;
    cursor: default;
  }
  .pkd-trust-item:hover { background: #f0fdf4; }

  /* ── Stat chips ── */
  .pkd-stat-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #f0fdf4;
    border: 1px solid #a7f3d0;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    color: #065f46;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .pkd-stat-chip:hover {
    background: #dcfce7;
    border-color: #6ee7b7;
    transform: translateY(-1px);
  }

  /* ── FAQ ── */
  .pkd-faq {
    border: 1.5px solid #d1fae5;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.2s;
  }
  .pkd-faq.open { border-color: #6ee7b7; box-shadow: 0 4px 20px rgba(5,150,105,0.10); }
  .pkd-faq-q {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 12px;
    transition: background 0.2s;
  }
  .pkd-faq-q:hover { background: #f0fdf4; }
  .pkd-faq-a {
    padding: 0 20px 16px;
    font-size: 13.5px;
    color: #4b5563;
    line-height: 1.75;
    border-top: 1px solid #d1fae5;
    padding-top: 14px;
  }

  /* ── Photo counter ── */
  .pkd-photo-counter {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(8px);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* ── Scroll hide ── */
  .hide-scroll { scrollbar-width: none; }
  .hide-scroll::-webkit-scrollbar { display: none; }

  /* ── Animations ── */
  @keyframes pkd-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pkd-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pkd-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  .pkd-fadeup   { animation: pkd-fadeUp 0.5s ease forwards; }
  .pkd-spin     { animation: pkd-spin 0.8s linear infinite; }
  .pkd-skeleton {
    background: linear-gradient(110deg, #d1fae5 8%, #ecfdf5 18%, #d1fae5 33%);
    background-size: 200% 100%;
    animation: shimmer-pkd 1.5s ease infinite;
  }
  @keyframes shimmer-pkd {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }

  /* ── Section label ── */
  .pkd-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  .pkd-section-label-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #059669, #065f46);
    display: flex; align-items: center; justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  .pkd-section-label h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(17px, 2.5vw, 22px);
    font-weight: 700;
    color: #064e3b;
    margin: 0;
  }
  .pkd-section-label p {
    font-size: 12px;
    color: #9ca3af;
    margin: 0;
  }

  /* ── Lightbox ── */
  .pkd-lightbox {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.96);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    backdrop-filter: blur(12px);
  }
  .pkd-lightbox-img {
    max-width: 100%; max-height: 90vh;
    object-fit: contain;
    border-radius: 16px;
    box-shadow: 0 0 80px rgba(0,0,0,0.8);
  }

  @media (max-width: 640px) {
    .pkd-hero { height: 55vh; min-height: 360px; }
    .pkd-card-p { padding: 18px; }
    .pkd-grid { gap: 20px; }
    .pkd-tab { padding: 9px 14px; font-size: 12.5px; }
  }
`

let _stylesInjected = false
function injectStyles() {
  if (_stylesInjected || typeof document === 'undefined') return
  if (document.getElementById('pkd-styles')) { _stylesInjected = true; return }
  const s = document.createElement('style')
  s.id = 'pkd-styles'
  s.textContent = STYLES
  document.head.appendChild(s)
  _stylesInjected = true
}

/* ══════════════════════════════════════════════════════════════════════
   IMAGE GALLERY
   ══════════════════════════════════════════════════════════════════════ */
function ImageGallery({ images = [], cover, title }) {
  const [lightbox, setLightbox] = useState(null)
  const [mainIdx, setMainIdx]   = useState(0)

  const all = useMemo(() => {
    const parsed = parseJson(images)
    const arr = cover ? [cover, ...parsed.filter(i => i !== cover)] : parsed
    return arr.length ? arr : null
  }, [images, cover])

  if (!all) {
    return (
      <div style={{
        height: 420, borderRadius: 24, overflow: 'hidden',
        background: 'linear-gradient(135deg, #064e3b, #022c22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #d1fae5',
      }}>
        <div style={{ textAlign: 'center', color: '#6ee7b7' }}>
          <Mountain size={56} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, opacity: 0.6 }}>No photos available</p>
        </div>
      </div>
    )
  }

  const mainSrc  = all[mainIdx]
  const thumbs   = all.filter((_, i) => i !== mainIdx).slice(0, 3)
  const remaining = all.length - 4

  return (
    <>
      {/* Grid layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: all.length > 1 ? '1fr 1fr' : '1fr',
        gridTemplateRows:    all.length > 2 ? '1fr 1fr' : '1fr',
        gap: 8,
        height: 'clamp(300px, 45vw, 520px)',
        borderRadius: 24,
        overflow: 'hidden',
      }}>
        {/* Main image */}
        <div
          onClick={() => setLightbox(mainIdx)}
          style={{
            gridRow: all.length > 1 ? 'span 2' : '1',
            position: 'relative', overflow: 'hidden', cursor: 'zoom-in',
          }}
        >
          <img
            src={mainSrc} alt={title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s ease',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* Nav arrows */}
          {all.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setMainIdx(i => (i - 1 + all.length) % all.length) }}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                  color: '#065f46', transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setMainIdx(i => (i + 1) % all.length) }}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                  color: '#065f46', transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          {/* Counter */}
          <div className="pkd-photo-counter">
            <Camera size={11} /> {mainIdx + 1} / {all.length}
          </div>
        </div>

        {/* Thumbnails */}
        {all.length > 1 && thumbs.map((src, i) => {
          const isLast = i === thumbs.length - 1 && remaining > 0
          return (
            <div
              key={i}
              onClick={() => isLast ? setLightbox(mainIdx + i + 1) : setMainIdx(
                all.indexOf(src)
              )}
              style={{
                position: 'relative', overflow: 'hidden', cursor: 'pointer',
              }}
            >
              <img
                src={src} alt=""
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              {isLast && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(4,47,31,0.72)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                }}>
                  <Camera size={22} style={{ marginBottom: 6 }} />
                  <span style={{ fontSize: 16, fontWeight: 800 }}>+{remaining + 1}</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>more photos</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="pkd-lightbox" onClick={() => setLightbox(null)}>
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <X size={20} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setLightbox(i => (i - 1 + all.length) % all.length) }}
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <img
            src={all[lightbox]}
            alt={title}
            className="pkd-lightbox-img"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % all.length) }}
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ChevronRight size={22} />
          </button>
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600,
          }}>
            {lightbox + 1} / {all.length}
          </div>
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   FAQ ITEM
   ══════════════════════════════════════════════════════════════════════ */
function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`pkd-faq ${open ? 'open' : ''}`}>
      <button className="pkd-faq-q" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: open ? 'linear-gradient(135deg,#059669,#065f46)' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 800,
              color: open ? 'white' : '#059669',
            }}>Q{index + 1}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: 1.5 }}>
            {faq.question || faq.title}
          </span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: '#059669', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        />
      </button>
      {open && (
        <div className="pkd-faq-a">
          {faq.answer || faq.content}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   BOOKING FORM
   ══════════════════════════════════════════════════════════════════════ */
function BookingForm({ pkg, user }) {
  const [form, setForm] = useState({
    guest_name:       user?.fullName || user?.full_name || user?.name || '',
    guest_email:      user?.email  || '',
    guest_phone:      user?.phone  || '',
    adults:           1,
    children:         0,
    travel_date:      '',
    end_date:         '',
    special_requests: '',
  })
  const [sending, setSending] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [success, setSuccess] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    if (!user) return
    setForm(p => ({
      ...p,
      guest_name:  p.guest_name  || user.fullName || user.full_name || user.name || '',
      guest_email: p.guest_email || user.email  || '',
      guest_phone: p.guest_phone || user.phone  || '',
    }))
  }, [user?.id]) // eslint-disable-line

  const upd = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: '' }))
  }

  const total     = (parseInt(form.adults) || 1) + (parseInt(form.children) || 0)
  const estimate  = Number(pkg.price) * total
  const today     = new Date().toISOString().split('T')[0]

  const validate = () => {
    const e = {}
    if (!form.guest_name?.trim())  e.guest_name  = 'Full name is required'
    if (!form.guest_email?.trim()) e.guest_email = 'Email is required'
    if (form.guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email))
      e.guest_email = 'Enter a valid email'
    if (!form.travel_date) e.travel_date = 'Please pick a start date'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSending(true)
    try {
      const payload = {
        ...form,
        booking_type:       'package',
        package_id:         pkg.id,
        package_title:      pkg.title,
        package_price:      pkg.price,
        currency:           pkg.currency || 'USD',
        travelers_count:    total,
        total_price:        estimate,
        number_of_adults:   parseInt(form.adults) || 1,
        number_of_children: parseInt(form.children) || 0,
      }
      const body = await createBooking(payload)
      setSuccess(true)
      setBookingRef(body?.data?.booking_number || body?.data?.booking_ref || '')
    } catch (err) {
      setErrors({ _form: err?.message || 'Failed to submit booking.' })
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 16px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669, #065f46)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 12px 36px rgba(5,150,105,0.35)',
        }}>
          <CheckCircle size={34} color="white" />
        </div>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20, fontWeight: 700, color: '#064e3b', marginBottom: 8,
        }}>
          Request Received!
        </h3>
        {bookingRef && (
          <div style={{
            display: 'inline-block',
            background: '#f0fdf4', border: '1px solid #a7f3d0',
            borderRadius: 10, padding: '6px 16px',
            fontFamily: 'monospace', fontSize: 13, color: '#059669',
            fontWeight: 700, marginBottom: 12,
          }}>
            Ref: {bookingRef}
          </div>
        )}
        <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 20 }}>
          Our team will review your booking and reach out within 24 hours to confirm details.
        </p>
        <button
          onClick={() => { setSuccess(false); setBookingRef('') }}
          style={{
            background: 'none', border: '1.5px solid #059669',
            color: '#059669', borderRadius: 10,
            padding: '9px 20px', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = 'white' }}
          onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#059669' }}
        >
          Submit Another Request
        </button>
      </div>
    )
  }

  const fieldStyle = (errKey) => ({
    width: '100%', padding: '10px 14px', paddingLeft: errKey ? '14px' : undefined,
    border: `1.5px solid ${errors[errKey] ? '#f87171' : '#d1fae5'}`,
    borderRadius: 12, fontSize: 13.5, color: '#111827',
    background: errors[errKey] ? '#fff5f5' : '#f9fffe',
    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
    fontFamily: 'inherit',
  })

  const iconFieldStyle = (errKey) => ({
    ...fieldStyle(errKey),
    paddingLeft: '36px',
  })

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {errors._form && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 14px', background: '#fef2f2',
          border: '1px solid #fecaca', borderRadius: 12,
          fontSize: 13, color: '#dc2626',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {errors._form}
        </div>
      )}

      {/* Name + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Full Name *
          </label>
          <div style={{ position: 'relative' }}>
            <User size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={form.guest_name}
              onChange={e => upd('guest_name', e.target.value)}
              placeholder="Your name"
              style={iconFieldStyle('guest_name')}
              onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = errors.guest_name ? '#f87171' : '#d1fae5'; e.target.style.boxShadow = 'none'; e.target.style.background = errors.guest_name ? '#fff5f5' : '#f9fffe' }}
            />
          </div>
          {errors.guest_name && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>{errors.guest_name}</p>}
        </div>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Email *
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="email"
              value={form.guest_email}
              onChange={e => upd('guest_email', e.target.value)}
              placeholder="you@email.com"
              style={iconFieldStyle('guest_email')}
              onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = errors.guest_email ? '#f87171' : '#d1fae5'; e.target.style.boxShadow = 'none'; e.target.style.background = errors.guest_email ? '#fff5f5' : '#f9fffe' }}
            />
          </div>
          {errors.guest_email && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>{errors.guest_email}</p>}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Phone Number
        </label>
        <div style={{ position: 'relative' }}>
          <Phone size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="tel"
            value={form.guest_phone}
            onChange={e => upd('guest_phone', e.target.value)}
            placeholder="+1 234 567 8900"
            style={iconFieldStyle()}
            onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fffe' }}
          />
        </div>
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Start Date *
          </label>
          <input
            type="date"
            value={form.travel_date}
            onChange={e => upd('travel_date', e.target.value)}
            min={today}
            style={fieldStyle('travel_date')}
            onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = errors.travel_date ? '#f87171' : '#d1fae5'; e.target.style.boxShadow = 'none'; e.target.style.background = errors.travel_date ? '#fff5f5' : '#f9fffe' }}
          />
          {errors.travel_date && <p style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>{errors.travel_date}</p>}
        </div>
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Return Date
          </label>
          <input
            type="date"
            value={form.end_date}
            onChange={e => upd('end_date', e.target.value)}
            min={form.travel_date || today}
            style={fieldStyle()}
            onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fffe' }}
          />
        </div>
      </div>

      {/* Travelers */}
      <div>
        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Travelers
        </label>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          background: '#f0fdf4', borderRadius: 14, padding: 14,
          border: '1px solid #d1fae5',
        }}>
          {[
            { key: 'adults',   label: 'Adults',   sub: '18+ years', min: 1 },
            { key: 'children', label: 'Children', sub: 'Under 18',  min: 0 },
          ].map(({ key, label, sub, min }) => (
            <div key={key}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{sub}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => upd(key, Math.max(min, parseInt(form[key]) - 1))}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'white', border: '1.5px solid #d1fae5',
                    color: '#059669', fontWeight: 800, fontSize: 16,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = 'white' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#059669' }}
                >
                  −
                </button>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', minWidth: 24, textAlign: 'center' }}>
                  {form[key]}
                </span>
                <button
                  type="button"
                  onClick={() => upd(key, parseInt(form[key]) + 1)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'white', border: '1.5px solid #d1fae5',
                    color: '#059669', fontWeight: 800, fontSize: 16,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = 'white' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#059669' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special requests */}
      <div>
        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Special Requests
        </label>
        <textarea
          rows={3}
          value={form.special_requests}
          onChange={e => upd('special_requests', e.target.value)}
          placeholder="Dietary needs, accessibility, special occasions…"
          style={{
            ...fieldStyle(),
            resize: 'none', lineHeight: 1.6, paddingTop: 10,
          }}
          onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; e.target.style.background = '#fff' }}
          onBlur={e => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fffe' }}
        />
      </div>

      {/* Price estimate */}
      {pkg.is_price_visible !== false && Number(pkg.price) > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
          border: '1px solid #a7f3d0', borderRadius: 14, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              {fmtPrice(pkg.price, pkg.currency)} × {total} traveler{total > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#059669' }}>
              {fmtPrice(estimate, pkg.currency)}
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
            *Estimated total. Final price confirmed by our team.
          </p>
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={sending} className="pkd-cta">
        {sending
          ? <><Loader2 size={16} style={{ animation: 'pkd-spin 0.8s linear infinite' }} /> Sending Request…</>
          : <><BookOpen size={16} /> Request to Book</>
        }
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#9ca3af' }}>
        <Shield size={11} style={{ color: '#059669' }} />
        No payment now · We confirm availability first
      </div>
    </form>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   SECTION LABEL
   ══════════════════════════════════════════════════════════════════════ */
function SectionLabel({ icon: Icon, title, subtitle }) {
  return (
    <div className="pkd-section-label">
      <div className="pkd-section-label-icon">
        <Icon size={17} />
      </div>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   LOADING STATE
   ══════════════════════════════════════════════════════════════════════ */
function LoadingState() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, #059669, #065f46)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 16px 48px rgba(5,150,105,0.35)',
          animation: 'pkd-pulse 2s ease infinite',
        }}>
          <Compass size={36} color="white" />
        </div>
        <Loader2 size={22} style={{ color: '#059669', animation: 'pkd-spin 0.8s linear infinite', margin: '0 auto 12px', display: 'block' }} />
        <p style={{ color: '#6b7280', fontWeight: 500, fontSize: 14 }}>Loading your adventure…</p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   ERROR STATE
   ══════════════════════════════════════════════════════════════════════ */
function ErrorState({ message }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Mountain size={36} style={{ color: '#059669' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#064e3b', marginBottom: 10 }}>
          {message || 'Package Not Found'}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14, lineHeight: 1.65 }}>
          The package you're looking for might have been removed or is temporarily unavailable.
        </p>
        <Link
          to="/packages"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 14,
            background: 'linear-gradient(135deg, #059669, #065f46)',
            color: 'white', fontWeight: 700, fontSize: 14,
            textDecoration: 'none',
            boxShadow: '0 8px 28px rgba(5,150,105,0.32)',
          }}
        >
          <ChevronLeft size={16} /> Browse All Packages
        </Link>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */
export default function PackageDetail() {
  const { slug }                  = useParams()
  const { user }                  = useUserAuth()
  const { openPortal }            = useMessaging()

  const [pkg,       setPkg]       = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [wishlist,  setWishlist]  = useState(false)
  const [copied,    setCopied]    = useState(false)

  useEffect(() => { injectStyles() }, [])

  const images       = useMemo(() => parseJson(pkg?.images),        [pkg?.images])
  const features     = useMemo(() => parseJson(pkg?.features),      [pkg?.features])
  const inclusions   = useMemo(() => parseJson(pkg?.inclusions),    [pkg?.inclusions])
  const exclusions   = useMemo(() => parseJson(pkg?.exclusions),    [pkg?.exclusions])
  const highlights   = useMemo(() => parseJson(pkg?.highlights),    [pkg?.highlights])
  const itinerary    = useMemo(() => parseJson(pkg?.itinerary),     [pkg?.itinerary])
  const faqs         = useMemo(() => parseJson(pkg?.faqs),          [pkg?.faqs])
  const pricingTiers = useMemo(() => parseJson(pkg?.pricing_tiers), [pkg?.pricing_tiers])

  const hasDisc  = Number(pkg?.discount_percent) > 0
  const origPrice = hasDisc
    ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100)
    : null

  useEffect(() => {
    if (!slug) return
    setLoading(true); setError(null)
    const fn = /^\d+$/.test(slug)
      ? () => packagesAPI.getById(slug)
      : () => packagesAPI.getBySlug(slug)
    fn()
      .then(body => {
        const d = body?.data || body
        if (!d?.id) { setError('Package not found'); return }
        setPkg(d)
        try {
          const saved = JSON.parse(localStorage.getItem('altuvera_wishlist') || '[]')
          setWishlist(saved.includes(d.id))
        } catch {}
      })
      .catch(err => {
        setError(err?.status === 404 ? 'Package not found' : err?.message || 'Failed to load')
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleAskSupport = useCallback(() => {
    if (!pkg) return
    openPortal({
      id:          pkg.id,
      title:       pkg.title,
      slug:        pkg.slug,
      image:       pkg.cover_image_url || pkg.thumbnail_url || null,
      destination: pkg.destination     || null,
      price:       Number(pkg.price)   || null,
      priceLabel:  pkg.price_label     || 'per person',
      currency:    pkg.currency        || 'USD',
    })
  }, [pkg, openPortal])

  const toggleWishlist = () => {
    if (!pkg) return
    setWishlist(w => {
      const next = !w
      try {
        const saved   = JSON.parse(localStorage.getItem('altuvera_wishlist') || '[]')
        const updated = next
          ? [...new Set([...saved, pkg.id])]
          : saved.filter(i => i !== pkg.id)
        localStorage.setItem('altuvera_wishlist', JSON.stringify(updated))
      } catch {}
      return next
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: pkg.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {})
    }
  }

  if (loading) return <LoadingState />
  if (error || !pkg) return <ErrorState message={error} />

  const tabs = [
    { id: 'overview',   label: 'Overview',                                    icon: BookOpen  },
    { id: 'itinerary',  label: `Itinerary${itinerary.length ? ` (${itinerary.length}d)` : ''}`, icon: Calendar  },
    { id: 'inclusions', label: 'Included',                                    icon: CheckCircle },
    { id: 'faqs',       label: `FAQs${faqs.length ? ` (${faqs.length})` : ''}`, icon: Info },
  ]

  return (
    <div className="pkd-root">

      {/* ── HERO GALLERY BANNER ── */}
      <div className="pkd-hero">
        {(pkg.cover_image_url || images[0]) ? (
          <img
            src={pkg.cover_image_url || images[0]}
            alt={pkg.title}
            className="pkd-hero-img"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #014421 100%)',
          }} />
        )}
        <div className="pkd-hero-overlay" />

        {/* Top nav bar */}
        <div className="pkd-hero-nav">
          <Link
            to="/packages"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'white', textDecoration: 'none',
              padding: '9px 18px', borderRadius: 50,
              fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.24)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
          >
            <ChevronLeft size={15} /> All Packages
          </Link>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* Breadcrumb hints */}
            {pkg.category && (
              <div style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.9)',
                padding: '6px 14px', borderRadius: 50,
                fontSize: 12, fontWeight: 600,
              }}>
                {pkg.category}
              </div>
            )}
            {pkg.is_featured && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.85), rgba(217,119,6,0.85))',
                backdropFilter: 'blur(12px)',
                color: 'white',
                padding: '6px 14px', borderRadius: 50,
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Star size={10} fill="white" /> Featured
              </div>
            )}
          </div>
        </div>

        {/* Hero bottom content */}
        <div className="pkd-hero-content">
          {/* Stat chips row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {pkg.destination && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'white', padding: '7px 14px', borderRadius: 50,
                fontSize: 13, fontWeight: 600,
              }}>
                <MapPin size={13} /> {pkg.destination}
              </div>
            )}
            {pkg.duration_days && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'white', padding: '7px 14px', borderRadius: 50,
                fontSize: 13, fontWeight: 600,
              }}>
                <Clock size={13} /> {pkg.duration_days} days
                {pkg.duration_nights ? ` / ${pkg.duration_nights} nights` : ''}
              </div>
            )}
            {pkg.max_travelers && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'white', padding: '7px 14px', borderRadius: 50,
                fontSize: 13, fontWeight: 600,
              }}>
                <Users size={13} /> Max {pkg.max_travelers}
              </div>
            )}
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(26px, 4.5vw, 52px)',
            fontWeight: 900, color: 'white',
            lineHeight: 1.15, letterSpacing: '-0.02em',
            marginBottom: 0, textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            maxWidth: 760,
          }}>
            {pkg.title}
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="pkd-layout" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="pkd-grid">

          {/* ════ LEFT COLUMN ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Action bar */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              gap: 10, padding: '14px 20px',
              background: 'white', borderRadius: 18,
              border: '1px solid #dcfce7',
              boxShadow: '0 2px 12px rgba(5,150,105,0.06)',
            }}>
              <button
                onClick={toggleWishlist}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 12,
                  border: `1.5px solid ${wishlist ? '#fca5a5' : '#e5e7eb'}`,
                  background: wishlist ? '#fff5f5' : 'white',
                  color: wishlist ? '#ef4444' : '#6b7280',
                  fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Heart size={15} fill={wishlist ? '#ef4444' : 'none'} />
                {wishlist ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={handleShare}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 12,
                  border: '1.5px solid #e5e7eb',
                  background: copied ? '#f0fdf4' : 'white',
                  color: copied ? '#059669' : '#6b7280',
                  fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />}
                {copied ? 'Copied!' : 'Share'}
              </button>

              <button
                onClick={handleAskSupport}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #059669, #065f46)',
                  color: 'white', border: 'none',
                  fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(5,150,105,0.28)',
                  transition: 'all 0.25s',
                  marginLeft: 'auto',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(5,150,105,0.38)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,0.28)' }}
              >
                <MessageCircle size={15} /> Ask Support
              </button>

              {pkg.is_sold_out && (
                <span style={{
                  padding: '6px 14px', borderRadius: 50,
                  background: '#fef2f2', border: '1.5px solid #fecaca',
                  color: '#dc2626', fontSize: 12, fontWeight: 700,
                }}>
                  Sold Out
                </span>
              )}
            </div>

            {/* Gallery */}
            <ImageGallery
              images={pkg.images}
              cover={pkg.cover_image_url}
              title={pkg.title}
            />

            {/* Description snippet */}
            {pkg.short_description && (
              <div className="pkd-card pkd-card-p">
                <p style={{ fontSize: 15.5, color: '#374151', lineHeight: 1.8, margin: 0 }}>
                  {pkg.short_description}
                </p>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="pkd-card pkd-card-p">
                <SectionLabel icon={Sparkles} title="Trip Highlights" subtitle="What makes this package special" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {highlights.map((h, i) => (
                    <div key={i} className="pkd-highlight">
                      <div style={{
                        width: 30, height: 30, borderRadius: 9,
                        background: 'linear-gradient(135deg, #059669, #065f46)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={14} color="white" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 13.5, color: '#1f2937', lineHeight: 1.5, fontWeight: 500 }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="pkd-card pkd-card-p">
                <SectionLabel icon={Zap} title="Package Features" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {features.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '8px 16px', borderRadius: 50,
                        background: '#f0fdf4', border: '1.5px solid #a7f3d0',
                        color: '#065f46', fontSize: 13.5, fontWeight: 600,
                        transition: 'all 0.2s', cursor: 'default',
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseOut={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <Leaf size={12} style={{ color: '#059669' }} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabbed content */}
            <div className="pkd-card" style={{ overflow: 'hidden' }}>
              {/* Tab bar */}
              <div style={{ padding: '16px 20px 0', borderBottom: '1px solid #d1fae5' }}>
                <div className="pkd-tabs">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pkd-tab ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div style={{ height: 16 }} />
              </div>

              <div className="pkd-card-p">

                {/* ── Overview ── */}
                {activeTab === 'overview' && (
                  <div>
                    {(pkg.description || pkg.content)
                      ? (
                        <div
                          style={{
                            fontSize: 14.5, color: '#374151', lineHeight: 1.85,
                            maxWidth: '72ch',
                          }}
                          dangerouslySetInnerHTML={{ __html: pkg.description || pkg.content }}
                        />
                      )
                      : (
                        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                          <BookOpen size={40} style={{ color: '#d1fae5', margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 14 }}>
                            No description available yet.
                          </p>
                        </div>
                      )
                    }
                  </div>
                )}

                {/* ── Itinerary ── */}
                {activeTab === 'itinerary' && (
                  <div className="pkd-timeline">
                    {!itinerary.length ? (
                      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <Calendar size={40} style={{ color: '#d1fae5', margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 14 }}>
                          Detailed itinerary coming soon.
                        </p>
                      </div>
                    ) : itinerary.map((day, i) => (
                      <div key={i} className="pkd-timeline-item">
                        <div className="pkd-timeline-left">
                          <div className="pkd-timeline-dot">{day.day || i + 1}</div>
                          {i < itinerary.length - 1 && <div className="pkd-timeline-line" />}
                        </div>
                        <div className="pkd-timeline-body">
                          <div className="pkd-timeline-card">
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                            }}>
                              <span style={{
                                fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#059669', background: '#f0fdf4',
                                padding: '3px 10px', borderRadius: 50,
                                border: '1px solid #a7f3d0',
                              }}>
                                Day {day.day || i + 1}
                              </span>
                              {day.location && (
                                <span style={{
                                  fontSize: 11.5, color: '#9ca3af',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                  <MapPin size={10} /> {day.location}
                                </span>
                              )}
                            </div>
                            <h4 style={{
                              fontSize: 15, fontWeight: 700, color: '#064e3b',
                              marginBottom: 8, lineHeight: 1.4,
                            }}>
                              {day.title}
                            </h4>
                            <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
                              {day.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Inclusions ── */}
                {activeTab === 'inclusions' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
                    <div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                        paddingBottom: 12, borderBottom: '2px solid #d1fae5',
                      }}>
                        <CheckCircle size={18} style={{ color: '#059669' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#064e3b', margin: 0 }}>
                          What's Included
                        </h3>
                      </div>
                      {!inclusions.length
                        ? <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 13.5 }}>Not specified</p>
                        : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {inclusions.map((item, i) => (
                              <div key={i} className="pkd-inc-item">
                                <Check size={13} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                                {item}
                              </div>
                            ))}
                          </div>
                        )
                      }
                    </div>
                    <div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                        paddingBottom: 12, borderBottom: '2px solid #fee2e2',
                      }}>
                        <XCircle size={18} style={{ color: '#f87171' }} />
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                          Not Included
                        </h3>
                      </div>
                      {!exclusions.length
                        ? <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 13.5 }}>Not specified</p>
                        : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {exclusions.map((item, i) => (
                              <div key={i} className="pkd-exc-item">
                                <X size={13} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
                                {item}
                              </div>
                            ))}
                          </div>
                        )
                      }
                    </div>
                  </div>
                )}

                {/* ── FAQs ── */}
                {activeTab === 'faqs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {!faqs.length ? (
                      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <Info size={40} style={{ color: '#d1fae5', margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 14 }}>
                          No FAQs added yet.
                        </p>
                      </div>
                    ) : faqs.map((faq, i) => (
                      <FaqItem key={i} faq={faq} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ════ RIGHT SIDEBAR ════ */}
          <div className="pkd-sidebar">

            {/* Price Card */}
            <div style={{
              background: 'linear-gradient(165deg, #064e3b 0%, #022c22 100%)',
              borderRadius: 24, padding: 'clamp(22px, 3vw, 32px)',
              boxShadow: '0 20px 60px rgba(4,47,31,0.30)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative blobs */}
              <div style={{
                position: 'absolute', top: -40, right: -40, width: 160, height: 160,
                borderRadius: '50%', background: 'rgba(16,185,129,0.08)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: -30, left: -30, width: 120, height: 120,
                borderRadius: '50%', background: 'rgba(16,185,129,0.06)',
                pointerEvents: 'none',
              }} />

              {pkg.is_sold_out && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#dc2626', color: 'white',
                  padding: '5px 18px', fontSize: 11, fontWeight: 700,
                  borderRadius: '0 24px 0 12px', letterSpacing: '0.06em',
                }}>
                  SOLD OUT
                </div>
              )}

              {/* Price */}
              {pkg.is_price_visible !== false ? (
                <div style={{ marginBottom: 20 }}>
                  {hasDisc && (
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'line-through', marginBottom: 4 }}>
                      {fmtPrice(origPrice, pkg.currency)}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(30px, 5vw, 44px)',
                      fontWeight: 900, color: '#4ade80', lineHeight: 1,
                    }}>
                      {fmtPrice(pkg.price, pkg.currency)}
                    </span>
                    {hasDisc && (
                      <span style={{
                        background: '#dc2626', color: 'white',
                        fontSize: 12, fontWeight: 800,
                        padding: '4px 10px', borderRadius: 50, marginBottom: 4,
                      }}>
                        −{pkg.discount_percent}%
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                    {pkg.price_label || 'per person'}
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                    Price on Request
                  </p>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>Contact us for pricing</p>
                </div>
              )}

              {/* Quick stats grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                marginBottom: 20,
              }}>
                {[
                  pkg.duration_days && { icon: Clock, label: 'Duration', val: `${pkg.duration_days}d${pkg.duration_nights ? ` / ${pkg.duration_nights}n` : ''}` },
                  pkg.max_travelers && { icon: Users, label: 'Max Group', val: `${pkg.max_travelers} people` },
                  pkg.destination   && { icon: MapPin, label: 'Destination', val: pkg.destination },
                  pkg.difficulty    && { icon: TrendingUp, label: 'Difficulty', val: pkg.difficulty },
                ].filter(Boolean).map(({ icon: Ic, label, val }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 14, padding: '12px 14px',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <Ic size={12} style={{ color: '#4ade80' }} />
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {label}
                      </span>
                    </div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>
                      {val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Availability note */}
              {pkg.availability_note && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 12, padding: '10px 14px', marginBottom: 16,
                }}>
                  <Info size={13} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
                    {pkg.availability_note}
                  </p>
                </div>
              )}

              {/* Chat button */}
              <button
                onClick={handleAskSupport}
                style={{
                  width: '100%', padding: '12px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  color: 'white', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s', marginBottom: 0,
                  backdropFilter: 'blur(8px)',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              >
                <MessageCircle size={16} /> Ask about this package
              </button>
            </div>

            {/* Pricing tiers */}
            {pricingTiers.filter(t => t.label || t.price).length > 0 && (
              <div className="pkd-card pkd-card-p">
                <SectionLabel icon={Award} title="Pricing Options" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pricingTiers.filter(t => t.label || t.price).map((tier, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: i === 0 ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : '#fafafa',
                      border: `1.5px solid ${i === 0 ? '#a7f3d0' : '#e5e7eb'}`,
                      borderRadius: 14, gap: 12,
                    }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#064e3b', margin: '0 0 2px' }}>
                          {tier.label}
                        </p>
                        {tier.description && (
                          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{tier.description}</p>
                        )}
                      </div>
                      <span style={{
                        fontSize: 16, fontWeight: 800, color: '#059669', flexShrink: 0,
                      }}>
                        {fmtPrice(tier.price, pkg.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Form Card */}
            <div className="pkd-card pkd-card-p">
              <SectionLabel
                icon={BookOpen}
                title={pkg.is_sold_out ? 'Join Waitlist' : 'Reserve Your Spot'}
                subtitle={pkg.is_sold_out ? 'Be notified when available' : 'No payment required now'}
              />

              {pkg.is_sold_out ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: '#fef2f2', border: '2px solid #fecaca',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <XCircle size={28} style={{ color: '#f87171' }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Currently Sold Out
                  </p>
                  <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 18, lineHeight: 1.6 }}>
                    This package is fully booked. Contact us to join the waitlist.
                  </p>
                  <button
                    onClick={handleAskSupport}
                    className="pkd-cta"
                  >
                    <MessageCircle size={16} /> Chat with Us
                  </button>
                </div>
              ) : (
                <BookingForm pkg={pkg} user={user} />
              )}
            </div>

            {/* Trust badges */}
            <div className="pkd-card" style={{ padding: '16px 20px' }}>
              <p style={{
                fontSize: 10.5, fontWeight: 800, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                textAlign: 'center', marginBottom: 14,
              }}>
                Why Book With Us
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {[
                  { icon: Shield,      label: 'Secure',      sub: 'Booking' },
                  { icon: CheckCircle, label: 'Verified',    sub: 'Packages' },
                  { icon: Users,       label: 'Expert',      sub: 'Guides' },
                  { icon: Star,        label: '5-Star',      sub: 'Rated' },
                  { icon: Globe,       label: 'Local',       sub: 'Knowledge' },
                  { icon: Award,       label: 'Award',       sub: 'Winning' },
                ].map(({ icon: Ic, label, sub }) => (
                  <div key={label} className="pkd-trust-item">
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ic size={16} style={{ color: '#059669' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#064e3b', margin: 0, lineHeight: 1.2 }}>{label}</p>
                      <p style={{ fontSize: 10.5, color: '#9ca3af', margin: 0 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}