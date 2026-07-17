// ============================================================================
// src/pages/Packages.jsx — Premium Redesign matching Explore.jsx aesthetic
// v2.1 — Fixed: FiMountain replaced (not exported by react-icons/fi)
// ============================================================================

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiSearch, FiSliders, FiX, FiClock, FiUsers, FiMapPin,
  FiArrowRight, FiPackage, FiLoader, FiHeart, FiGrid,
  FiList, FiStar, FiZap, FiDollarSign, FiGlobe,
  FiShield, FiCalendar, FiFilter, FiCheck,
  FiChevronRight, FiRefreshCw, FiCompass,
  FiAward, FiWind, FiBookmark, FiTrendingUp,
  FiCamera, FiSun, FiTarget, FiEye, FiTriangle,
} from 'react-icons/fi'

// ✅ FiMountain does NOT exist in react-icons/fi
// Using FiTriangle as mountain substitute throughout

/* ── API ─────────────────────────────────────────────────────────────── */
const API_BASE =
  import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'

const getToken = () =>
  localStorage.getItem('altuvera_auth_token') ||
  localStorage.getItem('altuvera_token') ||
  localStorage.getItem('token') ||
  null

const apiGet = async (path, params = null) => {
  let url = `${API_BASE}${path}`
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    if (qs) url += `?${qs}`
  }
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(
      new Error(err?.error || err?.message || `Server error (${res.status})`),
      { status: res.status, data: err },
    )
  }
  return res.json()
}

/* ── Constants ───────────────────────────────────────────────────────── */
const HERO_BG =
  'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1600&q=80&auto=format&fit=crop'

const CATEGORIES = [
  { id: '',                    label: 'All',         Icon: FiGlobe      },
  { id: 'Safari',              label: 'Safari',      Icon: FiStar       },
  { id: 'Beach & Coastal',     label: 'Beach',       Icon: FiWind       },
  { id: 'Mountain & Trekking', label: 'Trekking',    Icon: FiTriangle   },
  { id: 'Cultural & Heritage', label: 'Cultural',    Icon: FiCompass    },
  { id: 'Wildlife',            label: 'Wildlife',    Icon: FiCamera     },
  { id: 'Adventure',           label: 'Adventure',   Icon: FiZap        },
  { id: 'Honeymoon',           label: 'Honeymoon',   Icon: FiHeart      },
  { id: 'Family',              label: 'Family',      Icon: FiUsers      },
  { id: 'Photography',         label: 'Photography', Icon: FiCamera     },
  { id: 'Budget',              label: 'Budget',      Icon: FiDollarSign },
]

const SORT_OPTIONS = [
  { value: 'sort_order:asc',    label: 'Featured First'    },
  { value: 'price:asc',         label: 'Price: Low → High' },
  { value: 'price:desc',        label: 'Price: High → Low' },
  { value: 'created_at:desc',   label: 'Newest First'      },
  { value: 'view_count:desc',   label: 'Most Popular'      },
  { value: 'duration_days:asc', label: 'Shortest First'    },
]

const DURATION_FILTERS = [
  { label: 'Any Duration', value: ''   },
  { label: '1 – 3 Days',   value: '3'  },
  { label: '4 – 7 Days',   value: '7'  },
  { label: '8 – 14 Days',  value: '14' },
  { label: '15+ Days',     value: '30' },
]

const PRICE_RANGES = [
  { label: 'Any Price',     min: '',     max: ''     },
  { label: 'Under $500',    min: '',     max: '500'  },
  { label: '$500 – $1,500', min: '500',  max: '1500' },
  { label: '$1,500 – $3K',  min: '1500', max: '3000' },
  { label: '$3,000+',       min: '3000', max: ''     },
]

const LIMIT = 12

/* ── Helpers ─────────────────────────────────────────────────────────── */
const fmtPrice = (price, currency = 'USD') => {
  if (!price && price !== 0) return 'Contact Us'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `$${Number(price).toLocaleString()}`
  }
}

const fmtDuration = (days, nights) => {
  if (!days) return null
  const n = nights ?? (days - 1)
  return `${days}D / ${n}N`
}

const parseJsonField = (val, fallback = []) => {
  if (!val) return fallback
  if (Array.isArray(val)) return val
  try { return JSON.parse(val) } catch { return fallback }
}

function useDebounce(value, delay) {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const PKG_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --pk-green:    #059669;
  --pk-green-lt: #10b981;
  --pk-green-dk: #047857;
  --pk-forest:   #022c22;
  --pk-mint:     #ecfdf5;
  --pk-gold:     #f59e0b;
  --pk-text:     #0f172a;
  --pk-text-2:   #475569;
  --pk-text-3:   #94a3b8;
  --pk-border:   #e2e8f0;
  --pk-surface:  #ffffff;
  --pk-bg:       #f0fdf4;
  --pk-radius:   22px;
  --pk-ease:     cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes pk-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pk-scale-in {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes pk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes pk-spin {
  to { transform: rotate(360deg); }
}
@keyframes pk-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes pk-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
@keyframes pk-gradient-shift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.pk-root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--pk-bg);
  min-height: 100vh;
}

.pk-hide-scroll { scrollbar-width: none; }
.pk-hide-scroll::-webkit-scrollbar { display: none; }

.pk-cat-pill {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 18px; border-radius: 999px;
  font-size: 13px; font-weight: 600;
  white-space: nowrap; cursor: pointer;
  border: 1.5px solid transparent;
  flex-shrink: 0; transition: all 0.25s var(--pk-ease);
  font-family: inherit;
}
.pk-cat-pill.active {
  background: linear-gradient(135deg, var(--pk-green), var(--pk-forest));
  color: white;
  box-shadow: 0 4px 18px rgba(5,150,105,0.32);
  border-color: var(--pk-green);
}
.pk-cat-pill:not(.active) {
  background: white; color: var(--pk-text-2);
  border-color: var(--pk-border);
}
.pk-cat-pill:not(.active):hover {
  background: var(--pk-mint); border-color: #a7f3d0;
  color: var(--pk-green-dk); transform: translateY(-1px);
}

.pk-card {
  background: var(--pk-surface);
  border-radius: var(--pk-radius);
  border: 1.5px solid #dcfce7;
  box-shadow: 0 2px 16px rgba(5,150,105,0.06);
  transition: all 0.35s var(--pk-ease);
  overflow: hidden;
  display: flex; flex-direction: column;
  text-decoration: none; color: inherit;
  animation: pk-fade-up 0.45s var(--pk-ease) both;
}
.pk-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 24px 60px rgba(5,150,105,0.16);
  border-color: #a7f3d0;
}
.pk-card-img {
  transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
}
.pk-card:hover .pk-card-img { transform: scale(1.07); }

.pk-list-card {
  background: var(--pk-surface);
  border-radius: var(--pk-radius);
  border: 1.5px solid #dcfce7;
  box-shadow: 0 2px 16px rgba(5,150,105,0.06);
  transition: all 0.35s var(--pk-ease);
  overflow: hidden;
  display: grid;
  grid-template-columns: clamp(180px,26%,290px) 1fr;
  text-decoration: none; color: inherit;
  animation: pk-fade-up 0.45s var(--pk-ease) both;
}
.pk-list-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 48px rgba(5,150,105,0.14);
  border-color: #a7f3d0;
}
.pk-list-card:hover .pk-card-img { transform: scale(1.06); }

.pk-skel {
  background: linear-gradient(90deg, #d1fae5 0%, #ecfdf5 40%, #d1fae5 80%);
  background-size: 200%; border-radius: 10px;
  animation: pk-shimmer 1.6s ease infinite;
}

.pk-view-btn {
  padding: 9px; border: none; background: transparent;
  cursor: pointer; border-radius: 10px;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.pk-view-btn.active {
  background: white;
  box-shadow: 0 2px 10px rgba(5,150,105,0.15);
}
.pk-view-btn:not(.active):hover { background: rgba(255,255,255,0.55); }

.pk-filter-opt {
  width: 100%; text-align: left;
  padding: 10px 14px; border-radius: 12px;
  font-size: 13.5px; font-weight: 500;
  border: none; cursor: pointer;
  transition: all 0.2s ease;
  display: flex; align-items: center; gap: 8px;
  background: transparent; color: var(--pk-text-2);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.pk-filter-opt:hover { background: var(--pk-mint); color: var(--pk-green); }
.pk-filter-opt.active {
  background: linear-gradient(135deg, var(--pk-mint), #d1fae5);
  color: var(--pk-forest); font-weight: 700;
  border: 1px solid #a7f3d0;
}

.pk-cta {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 13px 28px;
  background: linear-gradient(135deg, var(--pk-green-lt), var(--pk-green));
  color: white; border: none; border-radius: 14px;
  font-size: 14px; font-weight: 700;
  cursor: pointer; text-decoration: none;
  transition: all 0.3s var(--pk-ease);
  box-shadow: 0 6px 24px rgba(16,185,129,0.35);
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.pk-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(16,185,129,0.5);
}
.pk-cta--outline {
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(10px);
  box-shadow: none;
}
.pk-cta--outline:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.5);
  box-shadow: none;
}

@keyframes pk-slide-in {
  from { opacity: 0; transform: translateX(100%); }
  to   { opacity: 1; transform: translateX(0); }
}
.pk-drawer { animation: pk-slide-in 0.3s var(--pk-ease) both; }

.pk-section-label {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 16px; border-radius: 999px;
  background: var(--pk-mint); color: var(--pk-green-dk);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  border: 1px solid #a7f3d0;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .pk-grid { grid-template-columns: 1fr !important; }
  .pk-list-card { grid-template-columns: 1fr !important; }
  .pk-list-img  { height: 200px !important; }
}
@media (max-width: 1100px) {
  .pk-sidebar-desktop { display: none !important; }
}
@media (max-width: 1100px) {
  #pk-mobile-filter-btn { display: flex !important; }
}
`

let _injected = false
function injectStyles() {
  if (_injected || typeof document === 'undefined') return
  if (document.getElementById('pk-styles-v3')) { _injected = true; return }
  const s = document.createElement('style')
  s.id = 'pk-styles-v3'
  s.textContent = PKG_CSS
  document.head.appendChild(s)
  _injected = true
}

/* ══════════════════════════════════════════════════════════════════════
   PLACEHOLDER ICON — replaces FiMountain everywhere
   A simple inline SVG mountain shape for empty-state cards
══════════════════════════════════════════════════════════════════════ */
const MountainPlaceholder = React.memo(function MountainPlaceholder({ size = 48, color = '#a7f3d0' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 21l4.5-9L17 21" />
      <path d="M2 21l6-10.5L14 21" />
      <path d="M14.5 21L18 13l4 8" />
      <path d="M12 3l1.5 3L12 9l-1.5-3z" />
    </svg>
  )
})

/* ══════════════════════════════════════════════════════════════════════
   GRID CARD
══════════════════════════════════════════════════════════════════════ */
const GridCard = React.memo(function GridCard({ pkg, wishlist, onWishlist, index = 0 }) {
  const isWish  = wishlist?.has(pkg.id)
  const hasDisc = Number(pkg.discount_percent) > 0
  const origPx  = hasDisc ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100) : null
  const cover   = pkg.cover_image_url || pkg.thumbnail_url || null
  const feats   = useMemo(() => parseJsonField(pkg.features).slice(0, 3), [pkg.features])
  const to      = `/packages/${pkg.slug || pkg.id}`

  return (
    <Link
      to={to}
      className="pk-card"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      {/* ── Image ── */}
      <div style={{
        position: 'relative', height: 236,
        overflow: 'hidden', flexShrink: 0,
        background: 'linear-gradient(135deg,#d1fae5,#f0fdf4)',
      }}>
        {cover
          ? <img src={cover} alt={pkg.title} loading="lazy" className="pk-card-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MountainPlaceholder size={48} />
            </div>
        }

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(2,44,34,0.72) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
        }} />

        {/* Top-left badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pkg.badge_label && (
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '4px 11px', borderRadius: 999, color: 'white',
              background: pkg.badge_color || 'linear-gradient(135deg,#10b981,#059669)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              {pkg.badge_label}
            </span>
          )}
          {!pkg.badge_label && pkg.is_featured && (
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '4px 11px', borderRadius: 999, color: 'white',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              Featured
            </span>
          )}
          {hasDisc && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '4px 11px',
              borderRadius: 999, color: 'white', background: '#ef4444',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              -{pkg.discount_percent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onWishlist?.(pkg.id) }}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.25s',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <FiHeart
            size={14}
            style={{
              fill: isWish ? '#ef4444' : 'none',
              color: isWish ? '#ef4444' : '#6b7280',
              transition: 'all 0.2s',
            }}
          />
        </button>

        {/* Bottom meta */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '14px 16px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          {pkg.category && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '4px 11px', borderRadius: 999, color: 'rgba(255,255,255,0.95)',
              background: 'rgba(2,44,34,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              {pkg.category}
            </span>
          )}
          {pkg.duration_days && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.95)',
              background: 'rgba(2,44,34,0.55)', backdropFilter: 'blur(8px)',
              padding: '4px 11px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <FiClock size={9} />
              {fmtDuration(pkg.duration_days, pkg.duration_nights)}
            </span>
          )}
        </div>

        {/* Sold out */}
        {pkg.is_sold_out && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              color: 'white', fontWeight: 800, fontSize: 12,
              border: '1.5px solid rgba(255,255,255,0.45)',
              padding: '7px 20px', borderRadius: 999,
              backdropFilter: 'blur(8px)', letterSpacing: '0.09em', textTransform: 'uppercase',
            }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 22px 18px' }}>
        <h3 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 18, fontWeight: 400, color: '#022c22',
          lineHeight: 1.32, marginBottom: 7,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {pkg.title}
        </h3>

        {(pkg.destination || pkg.country) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
            <FiMapPin size={11} style={{ color: '#059669', flexShrink: 0 }} />
            <span style={{
              fontSize: 13, color: '#475569', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {[pkg.destination, pkg.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {pkg.short_description && (
          <p style={{
            fontSize: 13.5, color: '#64748b', lineHeight: 1.7,
            marginBottom: 13, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {pkg.short_description}
          </p>
        )}

        {feats.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {feats.map((f, i) => (
              <span key={i} style={{
                fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 999,
                background: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0',
              }}>
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingTop: 14, borderTop: '1px solid #d1fae5', marginTop: 'auto',
        }}>
          <div>
            {hasDisc && (
              <p style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through', marginBottom: 2 }}>
                {fmtPrice(origPx, pkg.currency)}
              </p>
            )}
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 24, fontWeight: 400, color: '#059669', lineHeight: 1,
            }}>
              {pkg.is_price_visible !== false ? fmtPrice(pkg.price, pkg.currency) : 'POA'}
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
              {pkg.price_label || 'per person'}
            </p>
          </div>
          <span className="pk-cta" style={{ padding: '10px 20px', fontSize: 13 }}>
            View <FiArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  )
})

/* ══════════════════════════════════════════════════════════════════════
   LIST CARD
══════════════════════════════════════════════════════════════════════ */
const ListCard = React.memo(function ListCard({ pkg, wishlist, onWishlist, index = 0 }) {
  const isWish  = wishlist?.has(pkg.id)
  const hasDisc = Number(pkg.discount_percent) > 0
  const origPx  = hasDisc ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100) : null
  const cover   = pkg.cover_image_url || pkg.thumbnail_url || null
  const feats   = useMemo(() => parseJsonField(pkg.features).slice(0, 4), [pkg.features])
  const to      = `/packages/${pkg.slug || pkg.id}`

  return (
    <Link
      to={to}
      className="pk-list-card"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      {/* Image column */}
      <div className="pk-list-img" style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg,#d1fae5,#f0fdf4)', minHeight: 210,
      }}>
        {cover
          ? <img src={cover} alt={pkg.title} loading="lazy" className="pk-card-img"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block', position: 'absolute', inset: 0,
              }} />
          : <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'absolute', inset: 0,
            }}>
              <MountainPlaceholder size={44} />
            </div>
        }

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 55%, rgba(2,44,34,0.2))',
        }} />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {pkg.badge_label && (
            <span style={{
              fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 999,
              color: 'white', background: pkg.badge_color || '#059669',
            }}>
              {pkg.badge_label}
            </span>
          )}
          {hasDisc && (
            <span style={{
              fontSize: 9.5, fontWeight: 800, padding: '3px 10px',
              borderRadius: 999, color: 'white', background: '#ef4444',
            }}>
              -{pkg.discount_percent}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onWishlist?.(pkg.id) }}
          style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <FiHeart size={13} style={{
            fill: isWish ? '#ef4444' : 'none',
            color: isWish ? '#ef4444' : '#6b7280',
          }} />
        </button>

        {pkg.is_sold_out && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.58)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              color: 'white', fontWeight: 700, fontSize: 11,
              border: '1px solid rgba(255,255,255,0.4)',
              padding: '5px 16px', borderRadius: 999,
              textTransform: 'uppercase', letterSpacing: '0.09em',
            }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content column */}
      <div style={{
        padding: '22px 26px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          {pkg.category && (
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#059669', display: 'block', marginBottom: 7,
            }}>
              {pkg.category}
            </span>
          )}

          <h3 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 20, fontWeight: 400, color: '#022c22',
            lineHeight: 1.28, marginBottom: 10,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {pkg.title}
          </h3>

          {/* Meta chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 11 }}>
            {pkg.destination && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, color: '#475569', fontWeight: 500,
              }}>
                <FiMapPin size={11} style={{ color: '#059669' }} /> {pkg.destination}
              </span>
            )}
            {pkg.duration_days && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, color: '#475569', fontWeight: 500,
              }}>
                <FiClock size={11} style={{ color: '#059669' }} />
                {fmtDuration(pkg.duration_days, pkg.duration_nights)}
              </span>
            )}
            {pkg.max_travelers && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, color: '#475569', fontWeight: 500,
              }}>
                <FiUsers size={11} style={{ color: '#059669' }} /> Max {pkg.max_travelers}
              </span>
            )}
          </div>

          {pkg.short_description && (
            <p style={{
              fontSize: 14, color: '#64748b', lineHeight: 1.72, marginBottom: 13,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {pkg.short_description}
            </p>
          )}

          {feats.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
              {feats.map((f, i) => (
                <span key={i} style={{
                  fontSize: 11.5, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                  background: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0',
                }}>
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingTop: 16, borderTop: '1px solid #d1fae5',
        }}>
          <div>
            {hasDisc && (
              <p style={{
                fontSize: 12, color: '#94a3b8',
                textDecoration: 'line-through', marginBottom: 2,
              }}>
                {fmtPrice(origPx, pkg.currency)}
              </p>
            )}
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26, fontWeight: 400, color: '#059669', lineHeight: 1,
            }}>
              {pkg.is_price_visible !== false ? fmtPrice(pkg.price, pkg.currency) : 'On Request'}
            </p>
            <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>
              {pkg.price_label || 'per person'}
            </p>
          </div>
          <span className="pk-cta">
            View Details <FiArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
})

/* ══════════════════════════════════════════════════════════════════════
   SKELETON CARDS
══════════════════════════════════════════════════════════════════════ */
function SkeletonCard({ view = 'grid' }) {
  if (view === 'list') {
    return (
      <div style={{
        background: 'white', borderRadius: 22,
        border: '1.5px solid #dcfce7', overflow: 'hidden',
        display: 'grid', gridTemplateColumns: 'clamp(180px,26%,290px) 1fr',
      }}>
        <div className="pk-skel" style={{ minHeight: 210 }} />
        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="pk-skel" style={{ width: '50%', height: 10 }} />
          <div className="pk-skel" style={{ width: '82%', height: 22 }} />
          <div className="pk-skel" style={{ width: '38%', height: 13 }} />
          <div className="pk-skel" style={{ width: '100%', height: 13 }} />
          <div className="pk-skel" style={{ width: '72%', height: 13 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="pk-skel" style={{ width: 64, height: 24, borderRadius: 999 }} />
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 8,
          }}>
            <div className="pk-skel" style={{ width: 100, height: 30 }} />
            <div className="pk-skel" style={{ width: 130, height: 42, borderRadius: 14 }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white', borderRadius: 22,
      border: '1.5px solid #dcfce7', overflow: 'hidden',
    }}>
      <div className="pk-skel" style={{ height: 236 }} />
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div className="pk-skel" style={{ width: '86%', height: 20 }} />
        <div className="pk-skel" style={{ width: '44%', height: 13 }} />
        <div className="pk-skel" style={{ width: '100%', height: 13 }} />
        <div className="pk-skel" style={{ width: '68%', height: 13 }} />
        <div style={{ display: 'flex', gap: 5 }}>
          {[1, 2].map(i => (
            <div key={i} className="pk-skel" style={{ width: 60, height: 24, borderRadius: 999 }} />
          ))}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingTop: 12, borderTop: '1px solid #d1fae5',
        }}>
          <div className="pk-skel" style={{ width: 88, height: 28 }} />
          <div className="pk-skel" style={{ width: 96, height: 40, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   FILTER CONTENT
══════════════════════════════════════════════════════════════════════ */
function FilterContent({ sort, onSort, duration, onDuration, priceRange, onPriceRange, onReset, activeCount }) {
  const Section = ({ title, children }) => (
    <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid #d1fae5' }}>
      <p style={{
        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.12em', color: '#059669', marginBottom: 10,
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </div>
    </div>
  )

  return (
    <div>
      <Section title="Sort By">
        {SORT_OPTIONS.map(o => (
          <button key={o.value} onClick={() => onSort(o.value)}
            className={`pk-filter-opt ${sort === o.value ? 'active' : ''}`}>
            {sort === o.value && <FiCheck size={12} style={{ color: '#059669', flexShrink: 0 }} />}
            {o.label}
          </button>
        ))}
      </Section>

      <Section title="Trip Duration">
        {DURATION_FILTERS.map(d => (
          <button key={d.value} onClick={() => onDuration(d.value)}
            className={`pk-filter-opt ${duration === d.value ? 'active' : ''}`}>
            {duration === d.value && <FiCheck size={12} style={{ color: '#059669', flexShrink: 0 }} />}
            {d.label}
          </button>
        ))}
      </Section>

      <div style={{ marginBottom: 18 }}>
        <p style={{
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: '#059669', marginBottom: 10,
        }}>
          Price Range
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PRICE_RANGES.map((p, i) => (
            <button key={i} onClick={() => onPriceRange(p)}
              className={`pk-filter-opt ${priceRange?.label === p.label ? 'active' : ''}`}>
              {priceRange?.label === p.label && <FiCheck size={12} style={{ color: '#059669', flexShrink: 0 }} />}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={onReset}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12,
            background: '#fef2f2', border: '1.5px solid #fecaca',
            color: '#dc2626', fontSize: 13.5, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 7, transition: 'all 0.2s',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
        >
          <FiX size={13} /> Clear All ({activeCount})
        </button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   FILTER PANEL
══════════════════════════════════════════════════════════════════════ */
function FilterPanel(props) {
  const { isOpen, onClose, activeCount } = props

  const HeaderInner = ({ compact }) => (
    <div style={{
      padding: compact ? '14px 18px' : '16px 20px',
      borderBottom: '1px solid #d1fae5',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(135deg, var(--pk-mint), white)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: compact ? 30 : 34, height: compact ? 30 : 34,
          borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiSliders size={compact ? 14 : 15} color="white" />
        </div>
        <div>
          <p style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: '#022c22', margin: 0 }}>
            Filters
          </p>
          {activeCount > 0 && (
            <p style={{ fontSize: 11, color: '#059669', margin: 0, fontWeight: 600 }}>
              {activeCount} active
            </p>
          )}
        </div>
      </div>
      {activeCount > 0 && (
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white',
          fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {activeCount}
        </span>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="pk-sidebar-desktop" style={{
        width: 240, flexShrink: 0,
        position: 'sticky', top: 96, alignSelf: 'flex-start',
      }}>
        <div style={{
          background: 'white', borderRadius: 20,
          border: '1.5px solid #d1fae5',
          boxShadow: '0 4px 24px rgba(5,150,105,0.08)', overflow: 'hidden',
        }}>
          <HeaderInner compact={false} />
          <div
            style={{ padding: '16px 14px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
            className="pk-hide-scroll"
          >
            <FilterContent {...props} />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(6px)',
            }}
            onClick={onClose}
          />
          <div
            className="pk-drawer"
            style={{
              position: 'relative', marginLeft: 'auto',
              width: '82vw', maxWidth: 310, background: 'white',
              height: '100%', display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 52px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid #d1fae5',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, var(--pk-mint), white)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiSliders size={14} color="white" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#022c22' }}>Filters</span>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9',
                  border: 'none', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                <FiX size={15} color="#64748b" />
              </button>
            </div>
            <div
              style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}
              className="pk-hide-scroll"
            >
              <FilterContent {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════════════ */
function Hero({ search, onSearch, total, loading }) {
  const [local, setLocal] = useState(search)
  const inputRef = useRef(null)

  useEffect(() => setLocal(search), [search])
  const handleSubmit = e => { e.preventDefault(); onSearch(local) }

  return (
    <div style={{
      position: 'relative',
      minHeight: 'clamp(540px, 68vh, 720px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* BG image */}
      <img
        src={HERO_BG}
        alt="African safari landscape"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
        }}
      />

      {/* Overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(2,44,22,0.25) 0%, rgba(2,44,34,0.65) 55%, rgba(1,30,15,0.92) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(2,44,34,0.3), transparent 65%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 800, margin: '0 auto',
        padding: 'clamp(52px, 9vh, 100px) clamp(20px, 5vw, 60px)',
        textAlign: 'center',
      }}>
        {/* Section label badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 22px', borderRadius: 999,
          background: 'rgba(16,185,129,0.15)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(74,222,128,0.35)',
          color: '#86efac', fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 28,
        }}>
          <FiCompass size={12} style={{ color: '#4ade80' }} />
          {loading ? 'Loading…' : `${total > 0 ? `${total} Curated` : 'Curated'} Adventures`}
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 400, color: 'white', lineHeight: 1.1,
          letterSpacing: '-0.02em', marginBottom: 20,
          textShadow: '0 2px 28px rgba(0,0,0,0.4)',
        }}>
          Your Perfect
          <span style={{
            display: 'block', marginTop: 8,
            backgroundImage: 'linear-gradient(135deg, #86efac 0%, #4ade80 50%, #22c55e 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            African Adventure
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 1.8vw, 18px)',
          color: 'rgba(255,255,255,0.72)', lineHeight: 1.78,
          marginBottom: 40, fontWeight: 300,
          textShadow: '0 1px 14px rgba(0,0,0,0.3)',
        }}>
          Handcrafted safari experiences across Africa's most breathtaking landscapes —
          built for extraordinary, life-changing journeys.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 600, margin: '0 auto 34px' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
            borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
            border: '1.5px solid rgba(255,255,255,0.55)',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
              <FiSearch size={18} style={{ color: '#059669', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={local}
                onChange={e => setLocal(e.target.value)}
                placeholder="Search destinations, safaris, activities…"
                style={{
                  flex: 1, padding: '18px 0', background: 'transparent',
                  border: 'none', outline: 'none', fontSize: 15,
                  color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                }}
              />
              {local && (
                <button
                  type="button"
                  onClick={() => { setLocal(''); onSearch('') }}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#e2e8f0',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#cbd5e1'}
                  onMouseOut={e => e.currentTarget.style.background = '#e2e8f0'}
                >
                  <FiX size={12} color="#64748b" />
                </button>
              )}
            </div>
            <button
              type="submit"
              style={{
                flexShrink: 0, padding: '18px clamp(18px, 3vw, 36px)',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', color: 'white', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.25s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)'}
            >
              Search <FiArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Trust pills */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', gap: 10,
        }}>
          {[
            { Icon: FiStar,     label: '5-Star Rated'   },
            { Icon: FiShield,   label: 'Safe & Secure'  },
            { Icon: FiCalendar, label: 'Flexible Dates' },
            { Icon: FiAward,    label: 'Expert Guides'  },
          ].map(({ Icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '7px 17px',
              background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999, color: 'rgba(255,255,255,0.82)',
              fontSize: 13, fontWeight: 600,
            }}>
              <Icon size={12} style={{ color: '#4ade80' }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Wave transition */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 54" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', display: 'block' }} preserveAspectRatio="none"
        >
          <path d="M0,54 C480,0 960,0 1440,54 L1440,54 L0,54 Z" fill="#f0fdf4" />
        </svg>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   ACTIVE FILTER CHIP
══════════════════════════════════════════════════════════════════════ */
function ActiveChip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px', borderRadius: 999,
      background: '#f0fdf4', border: '1.5px solid #a7f3d0',
      color: '#047857', fontSize: 13, fontWeight: 600,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          width: 18, height: 18, borderRadius: '50%', background: '#d1fae5',
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
          flexShrink: 0,
        }}
        onMouseOver={e => e.currentTarget.style.background = '#a7f3d0'}
        onMouseOut={e => e.currentTarget.style.background = '#d1fae5'}
      >
        <FiX size={10} color="#047857" />
      </button>
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════════════════ */
function EmptyState({ onReset, hasFilters }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 'clamp(52px, 8vw, 100px) 24px',
      animation: 'pk-fade-up 0.4s ease',
    }}>
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
        animation: 'pk-float 3.5s ease infinite',
      }}>
        <FiPackage size={46} style={{ color: '#059669' }} />
      </div>
      <h3 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 26, fontWeight: 400, color: '#022c22', marginBottom: 12,
      }}>
        {hasFilters ? 'No Packages Found' : 'No Packages Yet'}
      </h3>
      <p style={{
        fontSize: 15, color: '#94a3b8', maxWidth: 360,
        margin: '0 auto 30px', lineHeight: 1.72,
      }}>
        {hasFilters
          ? 'Try adjusting your filters to discover more adventures.'
          : 'Check back soon — new packages are added regularly.'}
      </p>
      {hasFilters && (
        <button onClick={onReset} className="pk-cta" style={{ margin: '0 auto' }}>
          <FiX size={14} /> Clear All Filters
        </button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   ERROR STATE
══════════════════════════════════════════════════════════════════════ */
function ErrorState({ error, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: 'clamp(52px, 8vw, 100px) 24px' }}>
      <div style={{
        width: 100, height: 100, borderRadius: 28,
        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <FiPackage size={46} style={{ color: '#f87171' }} />
      </div>
      <h3 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 26, fontWeight: 400, color: '#0f172a', marginBottom: 12,
      }}>
        {!navigator.onLine ? 'No Internet Connection' : 'Something Went Wrong'}
      </h3>
      <p style={{
        fontSize: 15, color: '#94a3b8', maxWidth: 360,
        margin: '0 auto 30px', lineHeight: 1.72,
      }}>
        {!navigator.onLine
          ? 'Please check your connection and try again.'
          : error?.message || 'An unexpected error occurred.'}
      </p>
      <button onClick={onRetry} className="pk-cta" style={{ margin: '0 auto' }}>
        <FiRefreshCw size={14} /> Try Again
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
export default function Packages() {
  useEffect(injectStyles, [])

  const [searchParams, setSearchParams] = useSearchParams()

  const [packages,    setPackages]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [error,       setError]       = useState(null)

  const [view,       setView]       = useState('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [wishlist,   setWishlist]   = useState(new Set())

  const [search,     setSearch]     = useState(searchParams.get('search') || '')
  const [category,   setCategory]   = useState(searchParams.get('category') || '')
  const [sort,       setSort]       = useState('sort_order:asc')
  const [duration,   setDuration]   = useState('')
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0])

  const dSearch   = useDebounce(search, 480)
  const loaderRef = useRef(null)
  const topRef    = useRef(null)

  const [sortBy, sortOrder] = sort.split(':')

  const activeFilterCount = useMemo(() =>
    [duration, priceRange?.label !== 'Any Price' ? '1' : ''].filter(Boolean).length,
  [duration, priceRange])

  const loadPackages = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) { setLoading(true); setError(null) }
    else setLoadingMore(true)
    try {
      const q = { page: pg, limit: LIMIT, sortBy, order: sortOrder }
      if (dSearch)         q.search   = dSearch
      if (category)        q.category = category
      if (duration)        q.duration = duration
      if (priceRange?.min) q.minPrice = priceRange.min
      if (priceRange?.max) q.maxPrice = priceRange.max
      const data = await apiGet('/packages', q)
      const rows = data?.data?.packages || data?.data || data?.packages || []
      const tot  = data?.data?.total ?? data?.pagination?.total ?? data?.total ?? rows.length
      setPackages(prev => append ? [...prev, ...rows] : rows)
      setTotal(tot)
      setHasMore(pg * LIMIT < tot)
      setPage(pg)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [dSearch, category, sortBy, sortOrder, duration, priceRange])

  useEffect(() => { loadPackages(1, false) }, [loadPackages])

  useEffect(() => {
    const p = {}
    if (search)   p.search   = search
    if (category) p.category = category
    setSearchParams(p, { replace: true })
  }, [search, category, setSearchParams])

  useEffect(() => {
    const el = loaderRef.current
    if (!el || !hasMore) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore && hasMore) {
        loadPackages(page + 1, true)
      }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, page, loadPackages])

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('altuvera_wishlist') || '[]')
      setWishlist(new Set(s))
    } catch { setWishlist(new Set()) }
  }, [])

  const handleWishlist = useCallback((id) => {
    setWishlist(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      try { localStorage.setItem('altuvera_wishlist', JSON.stringify([...n])) } catch {}
      return n
    })
  }, [])

  const handleReset = useCallback(() => {
    setSearch(''); setCategory(''); setDuration('')
    setPriceRange(PRICE_RANGES[0]); setSort('sort_order:asc')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleCategory = useCallback((cat) => {
    setCategory(cat); setFilterOpen(false)
  }, [])

  const hasActiveChips = dSearch || category || duration || priceRange?.label !== 'Any Price'

  return (
    <div className="pk-root" ref={topRef}>

      {/* ── HERO ── */}
      <Hero search={search} onSearch={setSearch} total={total} loading={loading} />

      {/* ── CATEGORY STRIP ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #d1fae5',
        boxShadow: '0 2px 14px rgba(5,150,105,0.07)',
        position: 'sticky', top: 64, zIndex: 30,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 clamp(16px,3vw,40px)' }}>
          <div
            className="pk-hide-scroll"
            style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0' }}
          >
            {CATEGORIES.map(cat => {
              const active = cat.id === category
              const { Icon } = cat
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`pk-cat-pill ${active ? 'active' : ''}`}
                >
                  <Icon size={12} style={{ flexShrink: 0 }} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: 'clamp(24px,3vw,44px) clamp(16px,3vw,40px) 72px',
      }}>
        <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <FilterPanel
            sort={sort}             onSort={setSort}
            duration={duration}     onDuration={setDuration}
            priceRange={priceRange} onPriceRange={setPriceRange}
            onReset={handleReset}   activeCount={activeFilterCount}
            isOpen={filterOpen}     onClose={() => setFilterOpen(false)}
          />

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: 0 }}>
                {loading ? (
                  <div className="pk-skel" style={{ width: 150, height: 26 }} />
                ) : !error ? (
                  <div>
                    <h2 style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 'clamp(19px,2.5vw,26px)', fontWeight: 400,
                      color: '#022c22', margin: 0, lineHeight: 1.2,
                    }}>
                      {total.toLocaleString()} Package{total !== 1 ? 's' : ''}
                      {category && (
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#059669', fontWeight: 600, fontSize: '0.75em',
                        }}> · {category}</span>
                      )}
                    </h2>
                    {dSearch && (
                      <p style={{
                        fontSize: 13.5, color: '#94a3b8', marginTop: 4, fontWeight: 500,
                      }}>
                        Results for <strong style={{ color: '#475569' }}>"{dSearch}"</strong>
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Mobile filter button */}
                <button
                  id="pk-mobile-filter-btn"
                  onClick={() => setFilterOpen(true)}
                  style={{
                    display: 'none', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 12,
                    border: '1.5px solid #a7f3d0', background: 'white',
                    color: '#047857', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', boxShadow: '0 2px 10px rgba(5,150,105,0.08)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}
                >
                  <FiFilter size={14} style={{ color: '#059669' }} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span style={{
                      width: 21, height: 21, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white',
                      fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* View toggle */}
                <div style={{
                  display: 'flex', background: '#f0fdf4',
                  border: '1.5px solid #d1fae5', borderRadius: 12, padding: 4,
                }}>
                  {[
                    { id: 'grid', Icon: FiGrid },
                    { id: 'list', Icon: FiList },
                  ].map(({ id, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      className={`pk-view-btn ${view === id ? 'active' : ''}`}
                      style={{ color: view === id ? '#059669' : '#94a3b8' }}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveChips && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {dSearch && <ActiveChip label={`"${dSearch}"`} onRemove={() => setSearch('')} />}
                {category && <ActiveChip label={category} onRemove={() => setCategory('')} />}
                {duration && (
                  <ActiveChip
                    label={DURATION_FILTERS.find(d => d.value === duration)?.label || duration}
                    onRemove={() => setDuration('')}
                  />
                )}
                {priceRange?.label !== 'Any Price' && (
                  <ActiveChip label={priceRange.label} onRemove={() => setPriceRange(PRICE_RANGES[0])} />
                )}
                <button
                  onClick={handleReset}
                  style={{
                    padding: '6px 15px', borderRadius: 999, border: 'none',
                    background: '#fef2f2', color: '#dc2626', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Error */}
            {error && <ErrorState error={error} onRetry={() => loadPackages(1)} />}

            {/* Cards */}
            {!error && (
              <>
                {loading ? (
                  <div
                    className="pk-grid"
                    style={view === 'grid'
                      ? {
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                          gap: 'clamp(14px,2vw,24px)',
                        }
                      : { display: 'flex', flexDirection: 'column', gap: 20 }
                    }
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} view={view} />
                    ))}
                  </div>
                ) : packages.length === 0 ? (
                  <EmptyState
                    onReset={handleReset}
                    hasFilters={!!(category || duration || dSearch || priceRange?.label !== 'Any Price')}
                  />
                ) : view === 'grid' ? (
                  <div
                    className="pk-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                      gap: 'clamp(14px,2vw,24px)',
                    }}
                  >
                    {packages.map((pkg, i) => (
                      <GridCard
                        key={pkg.id} pkg={pkg} index={i}
                        wishlist={wishlist} onWishlist={handleWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {packages.map((pkg, i) => (
                      <ListCard
                        key={pkg.id} pkg={pkg} index={i}
                        wishlist={wishlist} onWishlist={handleWishlist}
                      />
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={loaderRef} style={{ height: 36, marginTop: 16 }} />

                {/* Loading more indicator */}
                {loadingMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '13px 28px', background: 'white',
                      border: '1.5px solid #d1fae5', borderRadius: 999,
                      fontSize: 14, color: '#475569', fontWeight: 500,
                      boxShadow: '0 4px 20px rgba(5,150,105,0.08)',
                    }}>
                      <FiLoader
                        size={17}
                        style={{ color: '#059669', animation: 'pk-spin 0.9s linear infinite' }}
                      />
                      Loading more packages…
                    </div>
                  </div>
                )}

                {!hasMore && packages.length > 0 && !loading && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '11px 26px', background: 'white',
                      border: '1.5px solid #d1fae5', borderRadius: 999,
                      fontSize: 13.5, color: '#94a3b8', fontWeight: 500,
                      boxShadow: '0 2px 12px rgba(5,150,105,0.06)',
                    }}>
                      <FiCompass size={14} style={{ color: '#059669' }} />
                      All {total.toLocaleString()} packages shown
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Final CTA Banner ── */}
            {!loading && !error && packages.length > 0 && !hasMore && (
              <div style={{
                marginTop: 48,
                padding: 'clamp(36px, 5vw, 56px) clamp(24px, 5vw, 56px)',
                borderRadius: 24,
                background: 'linear-gradient(160deg, #0f172a 0%, #022c22 45%, #064e3b 100%)',
                backgroundSize: '200% 200%',
                animation: 'pk-gradient-shift 14s ease infinite',
                textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative orbs */}
                <div style={{
                  position: 'absolute', top: '-20%', left: '-5%',
                  width: 320, height: 320, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', bottom: '-15%', right: '-3%',
                  width: 240, height: 240, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 20px', borderRadius: 999,
                    background: 'rgba(16,185,129,0.15)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#86efac', fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    marginBottom: 20,
                  }}>
                    <FiTarget size={11} style={{ color: '#4ade80' }} />
                    Ready to Explore?
                  </div>

                  <h3 style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 400,
                    color: 'white', lineHeight: 1.15,
                    marginBottom: 14, letterSpacing: '-0.02em',
                  }}>
                    Can't Find What You're Looking For?
                  </h3>

                  <p style={{
                    fontSize: 'clamp(14px, 1.4vw, 16px)',
                    color: 'rgba(255,255,255,0.68)', lineHeight: 1.78,
                    maxWidth: 520, margin: '0 auto 32px', fontWeight: 300,
                  }}>
                    Our travel specialists craft bespoke African adventures tailored precisely to your
                    dream — no detail too small, no wish too bold.
                  </p>

                  <div style={{
                    display: 'flex', gap: 14,
                    justifyContent: 'center', flexWrap: 'wrap',
                  }}>
                    <Link
                      to="/contact"
                      className="pk-cta"
                      style={{ padding: '15px 36px', fontSize: 15 }}
                    >
                      <FiCompass size={17} />
                      Plan My Trip
                    </Link>
                    <Link
                      to="/contact"
                      className="pk-cta pk-cta--outline"
                      style={{ padding: '15px 32px', fontSize: 15, color: 'white' }}
                    >
                      <FiGlobe size={17} />
                      Speak to an Expert
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}