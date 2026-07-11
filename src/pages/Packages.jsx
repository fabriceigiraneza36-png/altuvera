// ============================================================================
// src/pages/Packages.jsx — Premium Green/White Redesign (matching PackageDetail)
// ============================================================================

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, SlidersHorizontal, X, Clock, Users, MapPin,
  ArrowRight, Package, Loader2, Heart, Grid3X3, List,
  Sparkles, TrendingUp, Star, Zap, DollarSign, Globe,
  Shield, Calendar, Filter, MessageCircle, Check,
  ChevronRight, RefreshCw, Mountain, Compass, Leaf,
  Award, Wind, Coffee, Bookmark, ChevronDown,
} from 'lucide-react'

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
  { id: '',                    label: 'All',          icon: Globe       },
  { id: 'Safari',              label: 'Safari',       icon: Star        },
  { id: 'Beach & Coastal',     label: 'Beach',        icon: Wind        },
  { id: 'Mountain & Trekking', label: 'Trekking',     icon: Mountain    },
  { id: 'Cultural & Heritage', label: 'Cultural',     icon: Compass     },
  { id: 'Wildlife',            label: 'Wildlife',     icon: Leaf        },
  { id: 'Adventure',           label: 'Adventure',    icon: Zap         },
  { id: 'Honeymoon',           label: 'Honeymoon',    icon: Heart       },
  { id: 'Family',              label: 'Family',       icon: Users       },
  { id: 'Photography',         label: 'Photography',  icon: Award       },
  { id: 'Budget',              label: 'Budget',       icon: DollarSign  },
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
  { label: 'Any Price',     min: '',     max: ''    },
  { label: 'Under $500',    min: '',     max: '500' },
  { label: '$500 – $1,500', min: '500',  max: '1500'},
  { label: '$1,500 – $3K',  min: '1500', max: '3000'},
  { label: '$3,000+',       min: '3000', max: ''    },
]

const LIMIT = 12

/* ── Helpers ─────────────────────────────────────────────────────────── */
const fmtPrice = (price, currency = 'USD') => {
  if (!price && price !== 0) return 'Contact Us'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(price)
  } catch { return `$${Number(price).toLocaleString()}` }
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
const PKG_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

  :root {
    --pkg-green-50:  #f0fdf4;
    --pkg-green-100: #dcfce7;
    --pkg-green-200: #bbf7d0;
    --pkg-green-300: #86efac;
    --pkg-green-400: #4ade80;
    --pkg-green-500: #22c55e;
    --pkg-green-600: #059669;
    --pkg-green-700: #047857;
    --pkg-green-800: #065f46;
    --pkg-green-900: #064e3b;
  }

  .pkg-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #f0fdf4;
    min-height: 100vh;
  }

  /* ── Animations ── */
  @keyframes pkg-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pkg-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pkg-shimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  @keyframes pkg-scaleIn {
    from { opacity: 0; transform: scale(0.93); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pkg-slideRight {
    from { opacity: 0; transform: translateX(100%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pkg-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes pkg-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }

  .pkg-fadeup  { animation: pkg-fadeUp 0.42s ease both; }
  .pkg-scalein { animation: pkg-scaleIn 0.3s ease both; }
  .pkg-spin    { animation: pkg-spin 0.85s linear infinite; }

  /* ── Hide scrollbar ── */
  .pkg-hide-scroll { scrollbar-width: none; }
  .pkg-hide-scroll::-webkit-scrollbar { display: none; }

  /* ── Card ── */
  .pkg-card {
    background: #ffffff;
    border-radius: 22px;
    border: 1px solid #dcfce7;
    box-shadow: 0 2px 14px rgba(5,150,105,0.06);
    transition: all 0.32s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
  }
  .pkg-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 22px 56px rgba(5,150,105,0.16);
    border-color: #a7f3d0;
  }
  .pkg-card-img {
    transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .pkg-card:hover .pkg-card-img { transform: scale(1.07); }

  /* ── List card ── */
  .pkg-list-card {
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #dcfce7;
    box-shadow: 0 2px 14px rgba(5,150,105,0.06);
    transition: all 0.3s ease;
    overflow: hidden;
    display: grid;
    grid-template-columns: clamp(180px,26%,280px) 1fr;
    text-decoration: none;
    color: inherit;
  }
  .pkg-list-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 44px rgba(5,150,105,0.14);
    border-color: #a7f3d0;
  }
  .pkg-list-card:hover .pkg-card-img { transform: scale(1.06); }

  /* ── Skeleton shimmer ── */
  .pkg-skeleton {
    background: linear-gradient(110deg, #d1fae5 8%, #ecfdf5 18%, #d1fae5 33%);
    background-size: 200% 100%;
    animation: pkg-shimmer 1.5s ease infinite;
    border-radius: 8px;
  }

  /* ── Drawer ── */
  .pkg-drawer {
    animation: pkg-slideRight 0.28s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* ── Category pill ── */
  .pkg-cat-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    transition: all 0.22s ease;
    cursor: pointer;
    border: 1.5px solid transparent;
    flex-shrink: 0;
  }
  .pkg-cat-pill.active {
    background: linear-gradient(135deg, #059669, #065f46);
    color: white;
    box-shadow: 0 4px 16px rgba(5,150,105,0.3);
    border-color: #059669;
  }
  .pkg-cat-pill:not(.active) {
    background: white;
    color: #6b7280;
    border-color: #e5e7eb;
  }
  .pkg-cat-pill:not(.active):hover {
    background: #f0fdf4;
    border-color: #a7f3d0;
    color: #059669;
    transform: translateY(-1px);
  }

  /* ── Filter option button ── */
  .pkg-filter-opt {
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #6b7280;
    font-family: 'Inter', sans-serif;
  }
  .pkg-filter-opt:hover { background: #f0fdf4; color: #059669; }
  .pkg-filter-opt.active {
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    color: #065f46;
    font-weight: 700;
    border: 1px solid #a7f3d0;
  }

  /* ── View toggle ── */
  .pkg-view-btn {
    padding: 9px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pkg-view-btn.active { background: white; box-shadow: 0 2px 8px rgba(5,150,105,0.14); }
  .pkg-view-btn:not(.active):hover { background: rgba(255,255,255,0.5); }

  /* ── CTA button ── */
  .pkg-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 11px 22px;
    background: linear-gradient(135deg, #059669, #065f46);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s ease;
    box-shadow: 0 4px 16px rgba(5,150,105,0.28);
    white-space: nowrap;
    font-family: 'Inter', sans-serif;
  }
  .pkg-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(5,150,105,0.38);
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .pkg-grid { grid-template-columns: 1fr !important; }
    .pkg-list-card { grid-template-columns: 1fr !important; }
    .pkg-list-card .pkg-list-img { height: 200px !important; }
  }
  @media (max-width: 1100px) {
    .pkg-sidebar-desktop { display: none !important; }
  }
`

let _stylesInjected = false
function injectStyles() {
  if (_stylesInjected || typeof document === 'undefined') return
  if (document.getElementById('pkg-styles-v2')) { _stylesInjected = true; return }
  const s = document.createElement('style')
  s.id = 'pkg-styles-v2'
  s.textContent = PKG_STYLES
  document.head.appendChild(s)
  _stylesInjected = true
}

/* ══════════════════════════════════════════════════════════════════════
   PACKAGE CARD — GRID
   ══════════════════════════════════════════════════════════════════════ */
const GridCard = React.memo(function GridCard({
  pkg, wishlist, onWishlist, onAsk, index = 0,
}) {
  const isWish  = wishlist?.has(pkg.id)
  const hasDisc = Number(pkg.discount_percent) > 0
  const origPx  = hasDisc ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100) : null
  const cover   = pkg.cover_image_url || pkg.thumbnail_url || null
  const feats   = useMemo(() => parseJsonField(pkg.features).slice(0, 3), [pkg.features])
  const to      = `/packages/${pkg.slug || pkg.id}`

  return (
    <Link
      to={to}
      className="pkg-card pkg-fadeup"
      style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 228, overflow: 'hidden', background: 'linear-gradient(135deg,#d1fae5,#f0fdf4)', flexShrink: 0 }}>
        {cover ? (
          <img
            src={cover} alt={pkg.title} loading="lazy"
            className="pkg-card-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mountain size={48} style={{ color: '#a7f3d0' }} />
          </div>
        )}

        {/* Gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,47,31,0.65) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)' }} />

        {/* Top badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pkg.badge_label && (
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '4px 10px', borderRadius: 50, color: 'white',
              background: pkg.badge_color || 'linear-gradient(135deg,#059669,#065f46)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {pkg.badge_label}
            </span>
          )}
          {!pkg.badge_label && pkg.is_featured && (
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '4px 10px', borderRadius: 50, color: 'white',
              background: 'linear-gradient(135deg,#d97706,#b45309)',
            }}>
              ⭐ Featured
            </span>
          )}
          {hasDisc && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 50, color: 'white', background: '#dc2626' }}>
              -{pkg.discount_percent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist?.(pkg.id) }}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={13} fill={isWish ? '#ef4444' : 'none'} color={isWish ? '#ef4444' : '#6b7280'} />
        </button>

        {/* Bottom row */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 14px',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          {pkg.category && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '4px 10px', borderRadius: 50, color: 'rgba(255,255,255,0.95)',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              {pkg.category}
            </span>
          )}
          {pkg.duration_days && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.95)',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
              padding: '4px 10px', borderRadius: 50,
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <Clock size={9} />
              {fmtDuration(pkg.duration_days, pkg.duration_nights)}
            </span>
          )}
        </div>

        {/* Sold out */}
        {pkg.is_sold_out && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              color: 'white', fontWeight: 800, fontSize: 12,
              border: '1.5px solid rgba(255,255,255,0.45)',
              padding: '6px 18px', borderRadius: 50,
              backdropFilter: 'blur(8px)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 20px 16px' }}>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 17, fontWeight: 700, color: '#064e3b',
          lineHeight: 1.35, marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          transition: 'color 0.2s',
        }}>
          {pkg.title}
        </h3>

        {(pkg.destination || pkg.country) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
            <MapPin size={11} style={{ color: '#059669', flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: '#6b7280', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {[pkg.destination, pkg.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {pkg.short_description && (
          <p style={{
            fontSize: 13, color: '#9ca3af', lineHeight: 1.65,
            marginBottom: 12, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {pkg.short_description}
          </p>
        )}

        {feats.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {feats.map((f, i) => (
              <span key={i} style={{
                fontSize: 10.5, fontWeight: 600, padding: '4px 10px', borderRadius: 50,
                background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0',
              }}>
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Price + actions */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          paddingTop: 12, borderTop: '1px solid #d1fae5', marginTop: 'auto',
        }}>
          <div>
            {hasDisc && (
              <p style={{ fontSize: 11.5, color: '#9ca3af', textDecoration: 'line-through', marginBottom: 1 }}>
                {fmtPrice(origPx, pkg.currency)}
              </p>
            )}
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 900, color: '#059669', lineHeight: 1,
            }}>
              {pkg.is_price_visible !== false ? fmtPrice(pkg.price, pkg.currency) : 'POA'}
            </p>
            <p style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>
              {pkg.price_label || 'per person'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <span className="pkg-cta" style={{ padding: '9px 18px', fontSize: 12.5 }}>
              View <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})

/* ══════════════════════════════════════════════════════════════════════
   PACKAGE CARD — LIST
   ══════════════════════════════════════════════════════════════════════ */
const ListCard = React.memo(function ListCard({
  pkg, wishlist, onWishlist, onAsk, index = 0,
}) {
  const isWish  = wishlist?.has(pkg.id)
  const hasDisc = Number(pkg.discount_percent) > 0
  const origPx  = hasDisc ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100) : null
  const cover   = pkg.cover_image_url || pkg.thumbnail_url || null
  const feats   = useMemo(() => parseJsonField(pkg.features).slice(0, 4), [pkg.features])
  const to      = `/packages/${pkg.slug || pkg.id}`

  return (
    <Link
      to={to}
      className="pkg-list-card pkg-fadeup"
      style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
    >
      {/* Image column */}
      <div className="pkg-list-img" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#d1fae5,#f0fdf4)', minHeight: 200 }}>
        {cover ? (
          <img
            src={cover} alt={pkg.title} loading="lazy"
            className="pkg-card-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', inset: 0 }}>
            <Mountain size={44} style={{ color: '#a7f3d0' }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(4,47,31,0.18))' }} />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {pkg.badge_label && (
            <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '3px 9px', borderRadius: 50, color: 'white', background: pkg.badge_color || '#059669' }}>
              {pkg.badge_label}
            </span>
          )}
          {hasDisc && (
            <span style={{ fontSize: 9.5, fontWeight: 800, padding: '3px 9px', borderRadius: 50, color: 'white', background: '#dc2626' }}>
              -{pkg.discount_percent}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist?.(pkg.id) }}
          style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={12} fill={isWish ? '#ef4444' : 'none'} color={isWish ? '#ef4444' : '#6b7280'} />
        </button>

        {/* Sold out */}
        {pkg.is_sold_out && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 11, border: '1px solid rgba(255,255,255,0.4)', padding: '5px 14px', borderRadius: 50, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content column */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {pkg.category && (
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#059669', display: 'block', marginBottom: 6,
            }}>
              {pkg.category}
            </span>
          )}
          <h3 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 19, fontWeight: 700, color: '#064e3b',
            lineHeight: 1.3, marginBottom: 8,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {pkg.title}
          </h3>

          {/* Meta chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {pkg.destination && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                <MapPin size={10} style={{ color: '#059669' }} /> {pkg.destination}
              </span>
            )}
            {pkg.duration_days && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                <Clock size={10} style={{ color: '#059669' }} /> {fmtDuration(pkg.duration_days, pkg.duration_nights)}
              </span>
            )}
            {pkg.max_travelers && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                <Users size={10} style={{ color: '#059669' }} /> Max {pkg.max_travelers}
              </span>
            )}
          </div>

          {pkg.short_description && (
            <p style={{
              fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 12,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {pkg.short_description}
            </p>
          )}

          {feats.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {feats.map((f, i) => (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 50,
                  background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0',
                }}>
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #d1fae5' }}>
          <div>
            {hasDisc && (
              <p style={{ fontSize: 11.5, color: '#9ca3af', textDecoration: 'line-through', marginBottom: 1 }}>
                {fmtPrice(origPx, pkg.currency)}
              </p>
            )}
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: '#059669', lineHeight: 1 }}>
              {pkg.is_price_visible !== false ? fmtPrice(pkg.price, pkg.currency) : 'On Request'}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{pkg.price_label || 'per person'}</p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="pkg-cta">
              View Details <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})

/* ══════════════════════════════════════════════════════════════════════
   SKELETON
   ══════════════════════════════════════════════════════════════════════ */
function SkeletonCard({ view = 'grid' }) {
  if (view === 'list') {
    return (
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #dcfce7', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'clamp(180px,26%,280px) 1fr' }}>
        <div className="pkg-skeleton" style={{ minHeight: 200 }} />
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="pkg-skeleton" style={{ width: '55%', height: 10 }} />
          <div className="pkg-skeleton" style={{ width: '85%', height: 20 }} />
          <div className="pkg-skeleton" style={{ width: '40%', height: 14 }} />
          <div className="pkg-skeleton" style={{ width: '100%', height: 13 }} />
          <div className="pkg-skeleton" style={{ width: '75%', height: 13 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3].map(i => <div key={i} className="pkg-skeleton" style={{ width: 60, height: 22, borderRadius: 50 }} />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div className="pkg-skeleton" style={{ width: 90, height: 28 }} />
            <div className="pkg-skeleton" style={{ width: 120, height: 36, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div style={{ background: 'white', borderRadius: 22, border: '1px solid #dcfce7', overflow: 'hidden' }}>
      <div className="pkg-skeleton" style={{ height: 228 }} />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="pkg-skeleton" style={{ width: '88%', height: 18 }} />
        <div className="pkg-skeleton" style={{ width: '45%', height: 13 }} />
        <div className="pkg-skeleton" style={{ width: '100%', height: 13 }} />
        <div className="pkg-skeleton" style={{ width: '70%', height: 13 }} />
        <div style={{ display: 'flex', gap: 5 }}>
          {[1,2].map(i => <div key={i} className="pkg-skeleton" style={{ width: 56, height: 22, borderRadius: 50 }} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 10, borderTop: '1px solid #d1fae5' }}>
          <div className="pkg-skeleton" style={{ width: 80, height: 26 }} />
          <div className="pkg-skeleton" style={{ width: 90, height: 34, borderRadius: 12 }} />
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
        fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em',
        color: '#059669', marginBottom: 10,
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
          <button
            key={o.value}
            onClick={() => onSort(o.value)}
            className={`pkg-filter-opt ${sort === o.value ? 'active' : ''}`}
          >
            {sort === o.value && <Check size={12} style={{ color: '#059669', flexShrink: 0 }} />}
            {o.label}
          </button>
        ))}
      </Section>

      <Section title="Trip Duration">
        {DURATION_FILTERS.map(d => (
          <button
            key={d.value}
            onClick={() => onDuration(d.value)}
            className={`pkg-filter-opt ${duration === d.value ? 'active' : ''}`}
          >
            {duration === d.value && <Check size={12} style={{ color: '#059669', flexShrink: 0 }} />}
            {d.label}
          </button>
        ))}
      </Section>

      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#059669', marginBottom: 10 }}>
          Price Range
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PRICE_RANGES.map((p, i) => (
            <button
              key={i}
              onClick={() => onPriceRange(p)}
              className={`pkg-filter-opt ${priceRange?.label === p.label ? 'active' : ''}`}
            >
              {priceRange?.label === p.label && <Check size={12} style={{ color: '#059669', flexShrink: 0 }} />}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={onReset}
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 12,
            background: '#fef2f2', border: '1.5px solid #fecaca',
            color: '#dc2626', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 7, transition: 'all 0.2s', fontFamily: 'inherit',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
          onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
        >
          <X size={13} /> Clear All ({activeCount})
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

  const Header = () => (
    <div style={{
      padding: '16px 20px', borderBottom: '1px solid #d1fae5',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(135deg, #f0fdf4, white)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, #059669, #065f46)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SlidersHorizontal size={15} color="white" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#064e3b', margin: 0 }}>Filters</p>
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
          background: 'linear-gradient(135deg,#059669,#065f46)', color: 'white',
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
      <aside
        className="pkg-sidebar-desktop"
        style={{ width: 234, flexShrink: 0, position: 'sticky', top: 96, alignSelf: 'flex-start' }}
      >
        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #d1fae5',
          boxShadow: '0 4px 20px rgba(5,150,105,0.08)', overflow: 'hidden',
        }}>
          <Header />
          <div style={{ padding: '16px 14px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
            className="pkg-hide-scroll">
            <FilterContent {...props} />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />
          <div
            className="pkg-drawer"
            style={{
              position: 'relative', marginLeft: 'auto',
              width: '82vw', maxWidth: 300,
              background: 'white', height: '100%',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-16px 0 48px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #d1fae5',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #f0fdf4, white)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#059669,#065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SlidersHorizontal size={14} color="white" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#064e3b' }}>Filters</span>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
              >
                <X size={15} color="#6b7280" />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }} className="pkg-hide-scroll">
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

  const handleSubmit = (e) => { e.preventDefault(); onSearch(local) }

  return (
    <div style={{ position: 'relative', minHeight: 'clamp(520px, 65vh, 700px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* BG */}
      <img
        src={HERO_BG} alt="African safari"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(2,44,22,0.22) 0%, rgba(4,47,31,0.62) 55%, rgba(1,30,15,0.88) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(4,47,31,0.28), transparent 60%)' }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 780, margin: '0 auto',
        padding: 'clamp(48px, 8vh, 96px) clamp(20px, 5vw, 60px)',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(74,222,128,0.35)',
          color: '#86efac', fontSize: 11, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          padding: '9px 22px', borderRadius: 50, marginBottom: 28,
        }}>
          <Sparkles size={11} style={{ color: '#4ade80' }} />
          {loading ? 'Loading…' : `${total > 0 ? `${total} curated` : 'Curated'} adventures`}
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(34px, 5.5vw, 60px)',
          fontWeight: 900, color: 'white', lineHeight: 1.1,
          letterSpacing: '-0.025em', marginBottom: 18,
          textShadow: '0 2px 24px rgba(0,0,0,0.4)',
        }}>
          Your Perfect
          <span style={{
            display: 'block', marginTop: 6,
            backgroundImage: 'linear-gradient(135deg, #86efac 0%, #4ade80 50%, #22c55e 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            African Adventure
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.7, marginBottom: 36, fontWeight: 300,
          textShadow: '0 1px 12px rgba(0,0,0,0.3)',
        }}>
          Handcrafted safari experiences across Africa's most breathtaking landscapes —
          built for extraordinary journeys.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 580, margin: '0 auto 32px' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
            borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: '1.5px solid rgba(255,255,255,0.5)',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px' }}>
              <Search size={17} style={{ color: '#059669', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={local}
                onChange={e => setLocal(e.target.value)}
                placeholder="Search destinations, safaris, activities…"
                style={{
                  flex: 1, padding: '17px 0', background: 'transparent',
                  border: 'none', outline: 'none', fontSize: 14.5,
                  color: '#1f2937', fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                }}
              />
              {local && (
                <button
                  type="button"
                  onClick={() => { setLocal(''); onSearch('') }}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#e5e7eb',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#d1d5db'}
                  onMouseOut={e => e.currentTarget.style.background = '#e5e7eb'}
                >
                  <X size={11} color="#6b7280" />
                </button>
              )}
            </div>
            <button
              type="submit"
              style={{
                flexShrink: 0, padding: '17px clamp(18px, 3vw, 32px)',
                background: 'linear-gradient(135deg, #059669, #065f46)',
                border: 'none', color: 'white', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #047857, #064e3b)'}
              onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #065f46)'}
            >
              <span style={{ display: 'none' }} className="sm:inline">Search</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </form>

        {/* Trust pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
          {[
            { icon: Star,     label: '5-Star Rated'   },
            { icon: Shield,   label: 'Safe & Secure'  },
            { icon: Calendar, label: 'Flexible Dates' },
            { icon: Award,    label: 'Expert Guides'  },
          ].map(({ icon: Ic, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px',
              background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 50, color: 'rgba(255,255,255,0.8)',
              fontSize: 12.5, fontWeight: 600,
            }}>
              <Ic size={12} style={{ color: '#4ade80' }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <svg viewBox="0 0 1440 52" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', display: 'block' }} preserveAspectRatio="none">
          <path d="M0,52 C480,0 960,0 1440,52 L1440,52 L0,52 Z" fill="#f0fdf4" />
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
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 50,
      background: '#f0fdf4', border: '1.5px solid #a7f3d0',
      color: '#065f46', fontSize: 12.5, fontWeight: 600,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          width: 16, height: 16, borderRadius: '50%', background: '#d1fae5',
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
          flexShrink: 0,
        }}
        onMouseOver={e => e.currentTarget.style.background = '#a7f3d0'}
        onMouseOut={e => e.currentTarget.style.background = '#d1fae5'}
      >
        <X size={9} color="#065f46" />
      </button>
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════════════════ */
function EmptyState({ onReset, hasFilters }) {
  return (
    <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 96px) 24px', animation: 'pkg-fadeUp 0.4s ease' }}>
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', animation: 'pkg-float 3s ease infinite',
      }}>
        <Package size={44} style={{ color: '#059669' }} />
      </div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#064e3b', marginBottom: 10 }}>
        {hasFilters ? 'No Packages Found' : 'No Packages Yet'}
      </h3>
      <p style={{ fontSize: 14.5, color: '#9ca3af', maxWidth: 340, margin: '0 auto 28px', lineHeight: 1.65 }}>
        {hasFilters
          ? 'Try adjusting your filters to discover more adventures.'
          : 'Check back soon — new packages are added regularly.'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="pkg-cta"
          style={{ margin: '0 auto' }}
        >
          <X size={14} /> Clear All Filters
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
    <div style={{ textAlign: 'center', padding: 'clamp(48px, 8vw, 96px) 24px' }}>
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <Package size={44} style={{ color: '#f87171' }} />
      </div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 10 }}>
        {!navigator.onLine ? 'No Internet Connection' : 'Something Went Wrong'}
      </h3>
      <p style={{ fontSize: 14.5, color: '#9ca3af', maxWidth: 340, margin: '0 auto 28px', lineHeight: 1.65 }}>
        {!navigator.onLine ? 'Please check your connection and try again.' : error?.message || 'An unexpected error occurred.'}
      </p>
      <button onClick={onRetry} className="pkg-cta" style={{ margin: '0 auto' }}>
        <RefreshCw size={14} /> Try Again
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
      if (entries[0].isIntersecting && !loadingMore && hasMore) loadPackages(page + 1, true)
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
    <div className="pkg-root" ref={topRef}>

      {/* ── HERO ── */}
      <Hero search={search} onSearch={setSearch} total={total} loading={loading} />

      {/* ── CATEGORY STRIP ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #d1fae5',
        boxShadow: '0 2px 12px rgba(5,150,105,0.06)',
        position: 'sticky', top: 64, zIndex: 30,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 clamp(16px,3vw,40px)' }}>
          <div
            className="pkg-hide-scroll"
            style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0' }}
          >
            {CATEGORIES.map(cat => {
              const active = cat.id === category
              const Ic = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`pkg-cat-pill ${active ? 'active' : ''}`}
                  style={{ fontFamily: 'inherit' }}
                >
                  <Ic size={12} style={{ flexShrink: 0 }} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,40px) 64px' }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <FilterPanel
            sort={sort}             onSort={setSort}
            duration={duration}     onDuration={setDuration}
            priceRange={priceRange} onPriceRange={setPriceRange}
            onReset={handleReset}   activeCount={activeFilterCount}
            isOpen={filterOpen}     onClose={() => setFilterOpen(false)}
          />

          {/* Content area */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 18, gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ minWidth: 0 }}>
                {loading ? (
                  <div className="pkg-skeleton" style={{ width: 140, height: 24 }} />
                ) : !error ? (
                  <div>
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 800,
                      color: '#064e3b', margin: 0, lineHeight: 1.2,
                    }}>
                      {total.toLocaleString()} Package{total !== 1 ? 's' : ''}
                      {category && (
                        <span style={{ color: '#059669', fontWeight: 600 }}> · {category}</span>
                      )}
                    </h2>
                    {dSearch && (
                      <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3, fontWeight: 500 }}>
                        Results for <strong style={{ color: '#6b7280' }}>"{dSearch}"</strong>
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Mobile filter button */}
                <button
                  onClick={() => setFilterOpen(true)}
                  style={{
                    display: 'none',
                    alignItems: 'center', gap: 7,
                    padding: '9px 16px', borderRadius: 12,
                    border: '1.5px solid #a7f3d0', background: 'white',
                    color: '#065f46', fontSize: 13.5, fontWeight: 600,
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.08)',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                    // shown via JS class below on mobile via inline style
                  }}
                  id="pkg-mobile-filter-btn"
                >
                  <Filter size={14} style={{ color: '#059669' }} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#059669,#065f46)', color: 'white',
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
                  border: '1px solid #d1fae5', borderRadius: 12, padding: 4,
                }}>
                  {[
                    { id: 'grid', Ic: Grid3X3 },
                    { id: 'list', Ic: List    },
                  ].map(({ id, Ic }) => (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      className={`pkg-view-btn ${view === id ? 'active' : ''}`}
                      style={{
                        color: view === id ? '#059669' : '#9ca3af',
                      }}
                    >
                      <Ic size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile filter btn (always visible on small screens) */}
            <style>{`
              @media (max-width: 1100px) {
                #pkg-mobile-filter-btn { display: flex !important; }
              }
            `}</style>

            {/* Active filter chips */}
            {hasActiveChips && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
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
                    padding: '6px 14px', borderRadius: 50, border: 'none',
                    background: '#fef2f2', color: '#dc2626', fontSize: 12.5,
                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
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
                    className="pkg-grid"
                    style={view === 'grid'
                      ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(14px,2vw,24px)' }
                      : { display: 'flex', flexDirection: 'column', gap: 18 }
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
                    className="pkg-grid"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'clamp(14px,2vw,24px)' }}
                  >
                    {packages.map((pkg, i) => (
                      <GridCard
                        key={pkg.id} pkg={pkg} index={i}
                        wishlist={wishlist} onWishlist={handleWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {packages.map((pkg, i) => (
                      <ListCard
                        key={pkg.id} pkg={pkg} index={i}
                        wishlist={wishlist} onWishlist={handleWishlist}
                      />
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={loaderRef} style={{ height: 32, marginTop: 16 }} />

                {/* Loading more */}
                {loadingMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 24px', background: 'white',
                      border: '1px solid #d1fae5', borderRadius: 50,
                      fontSize: 13.5, color: '#6b7280', fontWeight: 500,
                      boxShadow: '0 4px 16px rgba(5,150,105,0.08)',
                    }}>
                      <Loader2 size={17} style={{ color: '#059669', animation: 'pkg-spin 0.85s linear infinite' }} />
                      Loading more packages…
                    </div>
                  </div>
                )}

                {/* End of results */}
                {!hasMore && packages.length > 0 && !loading && (
                  <div style={{ textAlign: 'center', padding: '36px 0' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 24px', background: 'white',
                      border: '1px solid #d1fae5', borderRadius: 50,
                      fontSize: 13, color: '#9ca3af', fontWeight: 500,
                      boxShadow: '0 2px 10px rgba(5,150,105,0.06)',
                    }}>
                      <Sparkles size={13} style={{ color: '#059669' }} />
                      All {total.toLocaleString()} packages shown
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}