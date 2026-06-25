// ============================================================================
// src/pages/Packages.jsx — Green/White Premium Package Listing
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
  ChevronRight, RefreshCw,
} from 'lucide-react'
import { useMessaging } from '../context/MessagingContext'

// ── API ───────────────────────────────────────────────────────────────────────

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

// ── Constants ─────────────────────────────────────────────────────────────────

const HERO_BG =
  'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1600&q=80&auto=format&fit=crop'

const CATEGORIES = [
  { id: '',                    label: 'All Packages', icon: Globe       },
  { id: 'Safari',              label: 'Safari',       icon: Star        },
  { id: 'Beach & Coastal',     label: 'Beach',        icon: Sparkles    },
  { id: 'Mountain & Trekking', label: 'Trekking',     icon: TrendingUp  },
  { id: 'Cultural & Heritage', label: 'Cultural',     icon: Globe       },
  { id: 'Wildlife',            label: 'Wildlife',     icon: Star        },
  { id: 'Adventure',           label: 'Adventure',    icon: Zap         },
  { id: 'Honeymoon',           label: 'Honeymoon',    icon: Heart       },
  { id: 'Family',              label: 'Family',       icon: Users       },
  { id: 'Photography',         label: 'Photography',  icon: Star        },
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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Injected CSS ──────────────────────────────────────────────────────────────

const PKG_STYLES = `
  .pkg-hide-scroll { scrollbar-width: none }
  .pkg-hide-scroll::-webkit-scrollbar { display: none }

  .pkg-card-img {
    transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .pkg-card:hover .pkg-card-img { transform: scale(1.08) }

  .pkg-fade-in {
    animation: pkgFadeUp 0.38s ease both;
  }
  @keyframes pkgFadeUp {
    from { opacity: 0; transform: translateY(14px) }
    to   { opacity: 1; transform: translateY(0) }
  }

  .pkg-drawer-enter {
    animation: pkgDrawer 0.26s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes pkgDrawer {
    from { opacity: 0; transform: translateX(100%) }
    to   { opacity: 1; transform: translateX(0) }
  }

  .pkg-card-lift {
    transition: transform 0.25s ease, box-shadow 0.25s ease,
                border-color 0.2s ease;
  }
  .pkg-card-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 48px -8px rgba(22,163,74,0.18),
                0 8px 20px -4px rgba(0,0,0,0.08);
  }

  .pkg-hero-shadow { text-shadow: 0 2px 24px rgba(0,0,0,0.45) }

  @media (max-width: 640px) {
    .pkg-grid-cols { grid-template-columns: 1fr !important }
  }
`

let _stylesInjected = false
function injectStyles() {
  if (_stylesInjected || typeof document === 'undefined') return
  if (document.getElementById('pkg-styles')) { _stylesInjected = true; return }
  const s = document.createElement('style')
  s.id = 'pkg-styles'
  s.textContent = PKG_STYLES
  document.head.appendChild(s)
  _stylesInjected = true
}

// ── Package Card ──────────────────────────────────────────────────────────────

const PackageCard = React.memo(function PackageCard({
  pkg, view = 'grid', wishlist, onWishlist, onAsk, index = 0,
}) {
  const isWish  = wishlist?.has(pkg.id)
  const accent  = pkg.accent_color || '#16a34a'
  const hasDisc = Number(pkg.discount_percent) > 0
  const origPx  = hasDisc
    ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100)
    : null
  const cover = pkg.cover_image_url || pkg.thumbnail_url || null
  const feats = useMemo(() => parseJsonField(pkg.features).slice(0, 3), [pkg.features])
  const to    = `/packages/${pkg.slug || pkg.id}`

  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation(); onWishlist?.(pkg.id)
  }
  const handleAsk = (e) => {
    e.preventDefault(); e.stopPropagation(); onAsk?.(pkg)
  }

  // ── LIST ──────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <Link
        to={to}
        className="pkg-card pkg-card-lift pkg-fade-in group flex bg-white
          rounded-2xl overflow-hidden border border-green-50
          hover:border-green-200 shadow-sm"
        style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}
      >
        {/* Thumbnail */}
        <div className="relative w-40 sm:w-56 lg:w-64 shrink-0 overflow-hidden bg-green-50">
          {cover ? (
            <img
              src={cover}
              alt={pkg.title}
              className="pkg-card-img w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full min-h-[160px] flex items-center justify-center"
              style={{ background: `linear-gradient(135deg,${accent}22,${accent}55)` }}
            >
              <Package size={32} style={{ color: accent }} className="opacity-40" />
            </div>
          )}

          {/* Overlays */}
          {pkg.badge_label && (
            <span
              className="absolute top-2.5 left-2.5 text-[10px] font-black
                uppercase tracking-widest px-2.5 py-0.5 rounded-full
                text-white shadow-md"
              style={{ backgroundColor: pkg.badge_color || accent }}
            >
              {pkg.badge_label}
            </span>
          )}
          {hasDisc && (
            <span className="absolute bottom-2.5 left-2.5 text-[10px] font-black
              bg-red-500 text-white px-2 py-0.5 rounded-full">
              -{pkg.discount_percent}% OFF
            </span>
          )}
          {pkg.is_sold_out && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="text-white font-black text-xs border border-white/40
                px-3 py-1 rounded-full backdrop-blur-sm">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                {pkg.category && (
                  <span className="block text-[10px] font-bold uppercase
                    tracking-widest text-green-600 mb-1">
                    {pkg.category}
                  </span>
                )}
                <h3 className="font-bold text-gray-800 text-base leading-snug
                  group-hover:text-green-700 transition-colors line-clamp-1">
                  {pkg.title}
                </h3>
              </div>
              <button
                onClick={handleWish}
                className="shrink-0 w-8 h-8 rounded-full bg-gray-50
                  hover:bg-red-50 border border-gray-100 hover:border-red-200
                  flex items-center justify-center transition-all"
              >
                <Heart
                  size={13}
                  className={isWish ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs
              text-gray-500 mb-2.5">
              {pkg.destination && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} className="text-green-500" />
                  {pkg.destination}
                </span>
              )}
              {pkg.duration_days && (
                <span className="flex items-center gap-1">
                  <Clock size={10} className="text-green-500" />
                  {fmtDuration(pkg.duration_days, pkg.duration_nights)}
                </span>
              )}
              {pkg.max_travelers && (
                <span className="flex items-center gap-1">
                  <Users size={10} className="text-green-500" />
                  Max {pkg.max_travelers}
                </span>
              )}
            </div>

            {pkg.short_description && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2.5">
                {pkg.short_description}
              </p>
            )}

            {feats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {feats.map((f, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2.5 py-1
                      rounded-full bg-green-50 text-green-700
                      border border-green-100"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mt-3 pt-3
            border-t border-green-50">
            <div>
              {hasDisc && (
                <p className="text-xs text-gray-400 line-through leading-none mb-0.5">
                  {fmtPrice(origPx, pkg.currency)}
                </p>
              )}
              <p className="text-lg font-black text-green-600 leading-none">
                {pkg.is_price_visible !== false
                  ? fmtPrice(pkg.price, pkg.currency)
                  : 'On Request'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {pkg.price_label || 'per person'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAsk}
                className="flex items-center gap-1.5 text-xs font-semibold
                  px-3 py-1.5 rounded-xl border border-green-200
                  text-green-600 hover:bg-green-50 transition-colors"
              >
                <MessageCircle size={12} /> Ask
              </button>
              <span
                className="flex items-center gap-1.5 text-xs font-bold
                  text-white px-3.5 py-2 rounded-xl bg-green-600
                  group-hover:bg-green-700 transition-colors shadow-sm"
              >
                View <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // ── GRID ──────────────────────────────────────────────────────────────────
  return (
    <Link
      to={to}
      className="pkg-card pkg-card-lift pkg-fade-in group flex flex-col
        bg-white rounded-2xl sm:rounded-3xl overflow-hidden
        border border-green-50 hover:border-green-200 shadow-sm"
      style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-green-50 shrink-0">
        {cover ? (
          <img
            src={cover}
            alt={pkg.title}
            className="pkg-card-img w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(145deg,${accent}22,${accent}66)`,
            }}
          >
            <Package size={44} style={{ color: accent }} className="opacity-35" />
          </div>
        )}

        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t
          from-black/55 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {pkg.badge_label && (
            <span
              className="text-[9px] font-black uppercase tracking-widest
                px-2.5 py-0.5 rounded-full text-white shadow-md backdrop-blur-sm"
              style={{ backgroundColor: pkg.badge_color || accent }}
            >
              {pkg.badge_label}
            </span>
          )}
          {!pkg.badge_label && pkg.is_featured && (
            <span className="text-[9px] font-black uppercase tracking-widest
              px-2.5 py-0.5 rounded-full text-white bg-amber-500 shadow-md">
              ⭐ Featured
            </span>
          )}
          {hasDisc && (
            <span className="text-[9px] font-black bg-red-500 text-white
              px-2 py-0.5 rounded-full uppercase tracking-wide">
              -{pkg.discount_percent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWish}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm
            rounded-full flex items-center justify-center shadow-md
            border border-white/50 hover:bg-white hover:scale-110
            transition-all duration-200"
        >
          <Heart
            size={13}
            className={isWish ? 'fill-red-500 text-red-500' : 'text-gray-500'}
          />
        </button>

        {/* Bottom overlays */}
        <div className="absolute bottom-0 left-0 right-0 p-3
          flex items-end justify-between">
          {pkg.category && (
            <span className="text-[9px] font-bold text-white/90
              bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full
              uppercase tracking-widest border border-white/10">
              {pkg.category}
            </span>
          )}
          {pkg.duration_days && (
            <span className="flex items-center gap-1 text-[10px] font-bold
              text-white bg-black/45 backdrop-blur-sm px-2.5 py-1
              rounded-full border border-white/10">
              <Clock size={9} />
              {fmtDuration(pkg.duration_days, pkg.duration_nights)}
            </span>
          )}
        </div>

        {/* Sold out */}
        {pkg.is_sold_out && (
          <div className="absolute inset-0 bg-black/60
            flex items-center justify-center">
            <span className="text-white font-black text-xs border border-white/40
              px-4 py-1.5 rounded-full backdrop-blur-sm tracking-widest uppercase">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        <div className="mb-3">
          <h3
            className="font-bold text-gray-800 text-[15px] sm:text-base
              leading-snug line-clamp-2 mb-1.5
              group-hover:text-green-700 transition-colors"
          >
            {pkg.title}
          </h3>
          {(pkg.destination || pkg.country) && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={10} className="text-green-500 shrink-0" />
              <span className="truncate">
                {[pkg.destination, pkg.country].filter(Boolean).join(', ')}
              </span>
            </p>
          )}
        </div>

        {pkg.short_description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed
            mb-3 flex-1">
            {pkg.short_description}
          </p>
        )}

        {feats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {feats.map((f, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full
                  bg-green-50 text-green-700 border border-green-100"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {(pkg.max_travelers || Number(pkg.booking_count) > 0) && (
          <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
            {pkg.max_travelers && (
              <span className="flex items-center gap-1">
                <Users size={9} className="text-green-500" />
                Max {pkg.max_travelers}
              </span>
            )}
            {Number(pkg.booking_count) > 0 && (
              <span className="flex items-center gap-1">
                <TrendingUp size={9} className="text-green-500" />
                {pkg.booking_count} booked
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-green-50">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              {hasDisc && (
                <p className="text-xs text-gray-400 line-through leading-none mb-0.5">
                  {fmtPrice(origPx, pkg.currency)}
                </p>
              )}
              <p className="text-xl sm:text-2xl font-black text-green-600 leading-none">
                {pkg.is_price_visible !== false
                  ? fmtPrice(pkg.price, pkg.currency)
                  : 'POA'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {pkg.price_label || 'per person'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleAsk}
                title="Ask about this package"
                className="w-8 h-8 rounded-xl border border-green-200
                  text-green-600 flex items-center justify-center
                  hover:bg-green-50 transition-colors"
              >
                <MessageCircle size={13} />
              </button>
              <span
                className="flex items-center gap-1 text-xs font-bold
                  text-white px-3 py-2 rounded-xl bg-green-600
                  group-hover:bg-green-700 transition-colors shadow-sm
                  shadow-green-200"
              >
                View <ArrowRight size={11} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
})

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard({ view = 'grid' }) {
  if (view === 'list') {
    return (
      <div className="flex bg-white rounded-2xl border border-green-50
        overflow-hidden animate-pulse shadow-sm">
        <div className="w-40 sm:w-56 h-40 bg-green-100 shrink-0" />
        <div className="flex-1 p-5 space-y-3">
          <div className="h-2.5 bg-green-100 rounded-full w-1/4" />
          <div className="h-4 bg-green-100 rounded-full w-3/4" />
          <div className="h-3 bg-green-50 rounded-full w-1/2" />
          <div className="h-10 bg-green-50 rounded-xl" />
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className="h-5 w-16 bg-green-50 rounded-full" />
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-6 w-24 bg-green-100 rounded-full" />
            <div className="h-8 w-28 bg-green-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-green-50
      overflow-hidden animate-pulse shadow-sm">
      <div className="h-48 sm:h-52 bg-green-100" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-4 bg-green-100 rounded-full w-4/5" />
        <div className="h-3 bg-green-50 rounded-full w-1/3" />
        <div className="h-3 bg-green-50 rounded-full w-full" />
        <div className="h-3 bg-green-50 rounded-full w-2/3" />
        <div className="flex gap-1.5">
          {[1, 2].map(i => (
            <div key={i} className="h-5 w-16 bg-green-50 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-end pt-3 border-t border-green-50">
          <div className="h-7 w-24 bg-green-100 rounded-full" />
          <div className="h-8 w-20 bg-green-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ search, onSearch, total, loading }) {
  const [local, setLocal] = useState(search)
  const inputRef = useRef(null)

  useEffect(() => setLocal(search), [search])

  const handleSubmit = (e) => { e.preventDefault(); onSearch(local) }
  const handleClear  = () => { setLocal(''); onSearch(''); inputRef.current?.focus() }

  return (
    <div className="relative min-h-[560px] sm:min-h-[620px] flex flex-col
      items-center justify-center overflow-hidden">

      {/* BG image */}
      <img
        src={HERO_BG}
        alt="African safari landscape"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Overlays */}
      <div className="absolute inset-0
        bg-gradient-to-b from-green-950/70 via-green-900/55 to-green-950/80" />
      <div className="absolute inset-0
        bg-gradient-to-r from-green-950/40 via-transparent to-green-950/30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6
        py-16 sm:py-24 text-center">

        {/* Pill */}
        <div
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md
            text-green-300 text-[11px] font-bold uppercase tracking-widest
            px-5 py-2.5 rounded-full mb-8 border border-green-400/30 shadow-lg"
        >
          <Sparkles size={11} className="text-green-400" />
          {loading
            ? 'Loading packages…'
            : `${total > 0 ? `${total} curated` : 'Curated'} packages`}
        </div>

        {/* Headline */}
        <h1
          className="pkg-hero-shadow text-4xl sm:text-5xl lg:text-6xl
            font-black text-white mb-5 leading-[1.06] tracking-tight"
        >
          Your Perfect
          <span
            className="block mt-1.5 text-transparent bg-clip-text"
            style={{
              backgroundImage:
                'linear-gradient(135deg,#86efac 0%,#4ade80 50%,#16a34a 100%)',
            }}
          >
            African Adventure
          </span>
        </h1>

        <p className="text-white/75 text-base sm:text-lg mb-10 max-w-xl
          mx-auto leading-relaxed font-light pkg-hero-shadow">
          Handcrafted safari experiences across Africa's most breathtaking
          destinations — built for extraordinary journeys.
        </p>

        {/* Search */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
          <div
            className="flex items-center bg-white/95 backdrop-blur-xl
              rounded-2xl shadow-2xl overflow-hidden border border-white/40
              focus-within:ring-4 focus-within:ring-green-400/30
              transition-all duration-300"
          >
            <div className="flex-1 flex items-center gap-2.5 px-4 sm:px-5">
              <Search size={16} className="text-green-500 shrink-0" />
              <input
                ref={inputRef}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Search destinations, safaris, activities…"
                className="flex-1 py-4 sm:py-5 text-gray-800 placeholder:text-gray-400
                  outline-none text-sm sm:text-base bg-transparent font-medium
                  min-w-0"
              />
              {local && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="shrink-0 w-5 h-5 rounded-full bg-gray-200
                    hover:bg-gray-300 flex items-center justify-center
                    transition-colors"
                >
                  <X size={11} className="text-gray-600" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="shrink-0 px-5 sm:px-7 py-4 sm:py-5 font-bold
                text-sm text-white flex items-center gap-1.5
                transition-all hover:gap-2.5 whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)',
              }}
            >
              <span className="hidden sm:inline">Search</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="flex items-center justify-center flex-wrap
          gap-5 sm:gap-8 mt-10">
          {[
            { icon: Star,     label: '5-Star Rated'    },
            { icon: Shield,   label: 'Safe & Secure'   },
            { icon: Calendar, label: 'Flexible Dates'  },
          ].map(({ icon: Ic, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-white/65 text-sm font-medium"
            >
              <Ic size={14} className="text-green-400" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,56 C480,0 960,0 1440,56 L1440,56 L0,56 Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </div>
  )
}

// ── Filter Content ────────────────────────────────────────────────────────────

function FilterContent({
  sort, onSort, duration, onDuration,
  priceRange, onPriceRange, onReset, activeCount,
}) {
  const Section = ({ title, children }) => (
    <div className="pb-5 mb-5 border-b border-green-50 last:border-0
      last:pb-0 last:mb-0">
      <p className="text-[10px] font-black text-green-600 uppercase
        tracking-[0.14em] mb-3">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )

  const Opt = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`w-full text-left text-sm px-3 py-2.5 rounded-xl
        transition-all duration-150 font-medium flex items-center gap-2 ${
        active
          ? 'bg-green-600 text-white shadow-sm shadow-green-200'
          : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
      }`}
    >
      {active && <Check size={12} className="shrink-0" />}
      {children}
    </button>
  )

  return (
    <div>
      <Section title="Sort By">
        {SORT_OPTIONS.map((o) => (
          <Opt key={o.value} active={sort === o.value} onClick={() => onSort(o.value)}>
            {o.label}
          </Opt>
        ))}
      </Section>

      <Section title="Duration">
        {DURATION_FILTERS.map((d) => (
          <Opt
            key={d.value}
            active={duration === d.value}
            onClick={() => onDuration(d.value)}
          >
            {d.label}
          </Opt>
        ))}
      </Section>

      <Section title="Price Range">
        {PRICE_RANGES.map((p, i) => (
          <Opt
            key={i}
            active={priceRange?.label === p.label}
            onClick={() => onPriceRange(p)}
          >
            {p.label}
          </Opt>
        ))}
      </Section>

      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3
            text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100
            border border-red-200 rounded-xl transition-colors mt-3"
        >
          <X size={13} /> Clear All ({activeCount})
        </button>
      )}
    </div>
  )
}

// ── Filter Panel (sidebar + mobile drawer) ────────────────────────────────────

function FilterPanel(props) {
  const { isOpen, onClose, activeCount } = props

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0">
        <div className="sticky top-[104px] bg-white rounded-2xl border border-green-100
          shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-green-100 flex items-center
            justify-between bg-gradient-to-r from-green-50 to-white">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <SlidersHorizontal size={15} className="text-green-600" />
              Filters & Sort
            </h3>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-green-600 text-white
                text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <div
            className="p-4 max-h-[calc(100vh-14rem)] overflow-y-auto pkg-hide-scroll"
          >
            <FilterContent {...props} />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div
            className="relative ml-auto w-[82vw] max-w-xs bg-white
              shadow-2xl flex flex-col h-full pkg-drawer-enter"
          >
            <div className="flex items-center justify-between px-5 py-4
              border-b border-green-100 bg-gradient-to-r from-green-50 to-white shrink-0">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <SlidersHorizontal size={15} className="text-green-600" />
                Filters
                {activeCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green-600 text-white
                    text-[10px] font-black flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                  flex items-center justify-center transition-colors"
              >
                <X size={15} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pkg-hide-scroll">
              <FilterContent {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold
      px-3 py-1.5 rounded-full bg-green-100 text-green-700
      border border-green-200">
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full hover:bg-green-200
          flex items-center justify-center transition-colors shrink-0"
      >
        <X size={9} />
      </button>
    </span>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onReset, hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-green-50 border border-green-100
        flex items-center justify-center mb-5 shadow-sm">
        <Package size={36} className="text-green-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        {hasFilters ? 'No packages match your filters' : 'No packages yet'}
      </h3>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        {hasFilters
          ? 'Try clearing some filters to see more options.'
          : 'Check back soon — new packages are added regularly.'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white
            font-bold text-sm rounded-xl hover:bg-green-700 transition-colors
            shadow-lg shadow-green-100"
        >
          <X size={14} /> Clear All Filters
        </button>
      )}
    </div>
  )
}

// ── Error State ───────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100
        flex items-center justify-center mb-5 shadow-sm">
        <Package size={36} className="text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">
        {!navigator.onLine ? 'No Internet Connection' : 'Something Went Wrong'}
      </h3>
      <p className="text-gray-400 text-sm max-w-sm mb-2 leading-relaxed">
        {!navigator.onLine
          ? 'Please check your connection and try again.'
          : error?.message || 'An unexpected error occurred.'}
      </p>
      {error?.status && (
        <p className="text-xs font-mono text-gray-300 mb-6">
          Error {error.status}
        </p>
      )}
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white
          font-bold text-sm rounded-xl hover:bg-green-700 transition-colors
          shadow-lg shadow-green-100"
      >
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function Packages() {
  useEffect(injectStyles, [])

  const { openPortal } = useMessaging()
  const [searchParams, setSearchParams] = useSearchParams()

  // Data
  const [packages,    setPackages]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [error,       setError]       = useState(null)

  // UI
  const [view,       setView]       = useState('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [wishlist,   setWishlist]   = useState(new Set())

  // Filters
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
    [
      duration,
      priceRange?.label !== 'Any Price' ? '1' : '',
    ].filter(Boolean).length,
  [duration, priceRange])

  // ── Load ───────────────────────────────────────────────────────────────────

  const loadPackages = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) { setLoading(true); setError(null) }
    else setLoadingMore(true)

    try {
      const q = {
        page: pg, limit: LIMIT,
        sortBy, order: sortOrder,
      }
      if (dSearch)         q.search    = dSearch
      if (category)        q.category  = category
      if (duration)        q.duration  = duration
      if (priceRange?.min) q.minPrice  = priceRange.min
      if (priceRange?.max) q.maxPrice  = priceRange.max

      const data = await apiGet('/packages', q)
      const rows = data?.data?.packages || data?.data || data?.packages || []
      const tot  = data?.data?.total ?? data?.pagination?.total ?? data?.total ?? rows.length

      setPackages((prev) => (append ? [...prev, ...rows] : rows))
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

  // ── Sync URL ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const p = {}
    if (search)   p.search   = search
    if (category) p.category = category
    setSearchParams(p, { replace: true })
  }, [search, category, setSearchParams])

  // ── Infinite scroll ────────────────────────────────────────────────────────

  useEffect(() => {
    const el = loaderRef.current
    if (!el || !hasMore) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadPackages(page + 1, true)
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, page, loadPackages])

  // ── Wishlist ───────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('altuvera_wishlist') || '[]')
      setWishlist(new Set(s))
    } catch { setWishlist(new Set()) }
  }, [])

  const handleWishlist = useCallback((id) => {
    setWishlist((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      try {
        localStorage.setItem('altuvera_wishlist', JSON.stringify([...n]))
      } catch {}
      return n
    })
  }, [])

  // ── Ask about package ──────────────────────────────────────────────────────

  const handleAsk = useCallback((pkg) => {
    openPortal({
      id:          pkg.id,
      title:       pkg.title,
      slug:        pkg.slug,
      image:       pkg.cover_image_url || pkg.thumbnail_url || null,
      destination: pkg.destination || null,
      price:       Number(pkg.price) || null,
      priceLabel:  pkg.price_label  || 'per person',
      currency:    pkg.currency     || 'USD',
    })
  }, [openPortal])

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setSearch(''); setCategory(''); setDuration('')
    setPriceRange(PRICE_RANGES[0]); setSort('sort_order:asc')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleCategory = useCallback((cat) => {
    setCategory(cat)
    setFilterOpen(false)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50" ref={topRef}>

      {/* Hero */}
      <Hero
        search={search}
        onSearch={setSearch}
        total={total}
        loading={loading}
      />

      {/* Category strip */}
      <div
        className="bg-white border-b border-green-100 shadow-sm
          sticky top-16 z-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="flex items-center gap-2 overflow-x-auto py-3 pkg-hide-scroll"
          >
            {CATEGORIES.map((cat) => {
              const active = cat.id === category
              const Ic     = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 text-sm
                    font-semibold px-4 py-2 rounded-full transition-all
                    duration-200 whitespace-nowrap border ${
                    active
                      ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                      : 'text-gray-600 border-transparent hover:bg-green-50 hover:border-green-200'
                  }`}
                >
                  <Ic
                    size={12}
                    className={active ? 'text-white' : 'text-green-500'}
                  />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-6 xl:gap-8">

          {/* Sidebar + drawer */}
          <FilterPanel
            sort={sort}             onSort={setSort}
            duration={duration}     onDuration={setDuration}
            priceRange={priceRange} onPriceRange={setPriceRange}
            onReset={handleReset}   activeCount={activeFilterCount}
            isOpen={filterOpen}     onClose={() => setFilterOpen(false)}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div className="min-w-0">
                {loading ? (
                  <div className="h-6 w-32 bg-green-100 rounded-full animate-pulse" />
                ) : !error ? (
                  <h2 className="font-bold text-gray-800 text-lg truncate">
                    {total.toLocaleString()}{' '}
                    Package{total !== 1 ? 's' : ''}
                    {category && (
                      <span className="text-green-600"> · {category}</span>
                    )}
                  </h2>
                ) : null}
                {dSearch && !loading && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    Results for{' '}
                    <span className="font-semibold text-gray-700">"{dSearch}"</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile filter btn */}
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold
                    px-3.5 py-2 rounded-xl border border-green-200 bg-white
                    hover:bg-green-50 transition-colors shadow-sm"
                >
                  <Filter size={14} className="text-green-600" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4.5 h-4.5 min-w-[18px] h-[18px] bg-green-600
                      text-white text-[10px] rounded-full flex items-center
                      justify-center font-black">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* View toggle */}
                <div className="flex bg-green-50 border border-green-100
                  rounded-xl overflow-hidden">
                  {[
                    { id: 'grid', Ic: Grid3X3 },
                    { id: 'list', Ic: List    },
                  ].map(({ id, Ic }) => (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      className={`p-2.5 transition-colors ${
                        view === id
                          ? 'bg-green-600 text-white'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <Ic size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(dSearch || category || duration || priceRange?.label !== 'Any Price') && (
              <div className="flex flex-wrap gap-2 mb-5">
                {dSearch && (
                  <Chip label={`"${dSearch}"`} onRemove={() => setSearch('')} />
                )}
                {category && (
                  <Chip label={category} onRemove={() => setCategory('')} />
                )}
                {duration && (
                  <Chip
                    label={
                      DURATION_FILTERS.find((d) => d.value === duration)?.label || duration
                    }
                    onRemove={() => setDuration('')}
                  />
                )}
                {priceRange?.label !== 'Any Price' && (
                  <Chip
                    label={priceRange.label}
                    onRemove={() => setPriceRange(PRICE_RANGES[0])}
                  />
                )}
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-red-500 hover:text-red-700
                    px-3 py-1.5 hover:bg-red-50 rounded-full transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <ErrorState error={error} onRetry={() => loadPackages(1)} />
            )}

            {/* Cards */}
            {!error && (
              <>
                {loading ? (
                  <div
                    className={
                      view === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 pkg-grid-cols'
                        : 'space-y-4'
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
                ) : (
                  <div
                    className={
                      view === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 pkg-grid-cols'
                        : 'space-y-4'
                    }
                  >
                    {packages.map((pkg, i) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        view={view}
                        wishlist={wishlist}
                        onWishlist={handleWishlist}
                        onAsk={handleAsk}
                        index={i}
                      />
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={loaderRef} className="h-8 mt-4" />

                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-500
                      text-sm font-medium bg-white border border-green-100
                      px-5 py-3 rounded-full shadow-sm">
                      <Loader2 size={18} className="animate-spin text-green-500" />
                      Loading more packages…
                    </div>
                  </div>
                )}

                {!hasMore && packages.length > 0 && !loading && (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center gap-2 text-sm
                      text-gray-400 bg-white border border-green-100
                      px-5 py-2.5 rounded-full font-medium shadow-sm">
                      <Sparkles size={13} className="text-green-500" />
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