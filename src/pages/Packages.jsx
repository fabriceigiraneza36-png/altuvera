// ============================================================================
// src/pages/Packages.jsx — Public Package Listing (Premium Design)
// ============================================================================

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, SlidersHorizontal, X, Clock, Users, MapPin,
  ArrowRight, Package, Loader2, Heart, Grid3X3, List,
  Sparkles, TrendingUp, ChevronRight, Star, Zap,
  DollarSign, Calendar, Globe, Filter,
} from 'lucide-react'

// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'

const getToken = () =>
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
      { status: res.status, data: err }
    )
  }
  return res.json()
}

// ── Constants ─────────────────────────────────────────────────────────────────

const HERO_BG =
  'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1600&q=80&auto=format&fit=crop'

const CATEGORIES = [
  { id: '',                   label: 'All Packages',      icon: Globe },
  { id: 'Safari',             label: 'Safari',            icon: Star },
  { id: 'Beach & Coastal',    label: 'Beach & Coastal',   icon: Sparkles },
  { id: 'Mountain & Trekking',label: 'Trekking',          icon: TrendingUp },
  { id: 'Cultural & Heritage',label: 'Cultural',          icon: Globe },
  { id: 'Wildlife',           label: 'Wildlife',          icon: Star },
  { id: 'Adventure',          label: 'Adventure',         icon: Zap },
  { id: 'Honeymoon',          label: 'Honeymoon',         icon: Heart },
  { id: 'Family',             label: 'Family',            icon: Users },
  { id: 'Photography',        label: 'Photography',       icon: Star },
  { id: 'Budget',             label: 'Budget',            icon: DollarSign },
]

const SORT_OPTIONS = [
  { value: 'sort_order:asc',    label: 'Featured First' },
  { value: 'price:asc',         label: 'Price: Low → High' },
  { value: 'price:desc',        label: 'Price: High → Low' },
  { value: 'created_at:desc',   label: 'Newest First' },
  { value: 'view_count:desc',   label: 'Most Popular' },
  { value: 'duration_days:asc', label: 'Shortest First' },
]

const DURATION_FILTERS = [
  { label: 'Any Duration', value: '' },
  { label: '1 – 3 Days',   value: '3' },
  { label: '4 – 7 Days',   value: '7' },
  { label: '8 – 14 Days',  value: '14' },
  { label: '15+ Days',     value: '30' },
]

const PRICE_RANGES = [
  { label: 'Any Price',     min: '',     max: '' },
  { label: 'Under $500',    min: '',     max: '500' },
  { label: '$500 – $1,500', min: '500',  max: '1500' },
  { label: '$1,500 – $3K',  min: '1500', max: '3000' },
  { label: '$3,000+',       min: '3000', max: '' },
]

const THEME = {
  default: { price: 'text-emerald-600', btn: 'from-emerald-500 to-emerald-700', tag: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  dark:    { price: 'text-amber-400',   btn: 'from-slate-700 to-slate-900',     tag: 'bg-slate-100 text-slate-700 ring-slate-200' },
  earth:   { price: 'text-amber-700',   btn: 'from-amber-600 to-amber-800',     tag: 'bg-amber-50 text-amber-700 ring-amber-100' },
  ocean:   { price: 'text-blue-600',    btn: 'from-blue-500 to-blue-700',       tag: 'bg-blue-50 text-blue-700 ring-blue-100' },
  sunset:  { price: 'text-orange-600',  btn: 'from-orange-500 to-red-600',      tag: 'bg-orange-50 text-orange-700 ring-orange-100' },
  minimal: { price: 'text-slate-800',   btn: 'from-slate-700 to-slate-900',     tag: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

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

// ── Inline styles ─────────────────────────────────────────────────────────────

const PKG_STYLES = `
  .pkg-scrollbar-hide { scrollbar-width:none }
  .pkg-scrollbar-hide::-webkit-scrollbar { display:none }

  .pkg-card-img { transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94) }
  .pkg-card:hover .pkg-card-img { transform: scale(1.08) }

  .pkg-btn-gradient {
    background-size: 200% auto;
    transition: background-position 0.4s ease, box-shadow 0.3s ease,
                transform 0.2s ease;
  }
  .pkg-btn-gradient:hover {
    background-position: right center;
    box-shadow: 0 8px 25px -5px rgba(0,0,0,0.3);
    transform: translateY(-1px);
  }

  .pkg-filter-enter {
    animation: pkgSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes pkgSlideIn {
    from { opacity:0; transform:translateX(100%) }
    to   { opacity:1; transform:translateX(0) }
  }

  .pkg-fade-in {
    animation: pkgFade 0.4s ease both;
  }
  @keyframes pkgFade {
    from { opacity:0; transform:translateY(12px) }
    to   { opacity:1; transform:translateY(0) }
  }

  .pkg-hero-text {
    text-shadow: 0 2px 20px rgba(0,0,0,0.4);
  }

  @media (max-width: 640px) {
    .pkg-grid { grid-template-columns: 1fr !important }
  }
`

let stylesInjected = false
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  const el = document.getElementById('pkg-styles')
  if (el) { stylesInjected = true; return }
  const s = document.createElement('style')
  s.id = 'pkg-styles'
  s.textContent = PKG_STYLES
  document.head.appendChild(s)
  stylesInjected = true
}

// ── PACKAGE CARD ──────────────────────────────────────────────────────────────

const PackageCard = React.memo(function PackageCard({
  pkg, view = 'grid', wishlist, onWishlist, index = 0,
}) {
  const t       = THEME[pkg.card_theme] || THEME.default
  const isWish  = wishlist?.has(pkg.id)
  const accent  = pkg.accent_color || '#059669'
  const hasDisc = Number(pkg.discount_percent) > 0
  const origPx  = hasDisc
    ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100)
    : null
  const cover  = pkg.cover_image_url || pkg.thumbnail_url || null
  const feats  = useMemo(() => parseJsonField(pkg.features).slice(0, 3), [pkg.features])
  const to     = `/packages/${pkg.slug || pkg.id}`

  const handleWish = (e) => { e.preventDefault(); e.stopPropagation(); onWishlist?.(pkg.id) }

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <Link
        to={to}
        className="pkg-card group flex bg-white rounded-2xl overflow-hidden
          border border-slate-100 hover:border-emerald-200
          shadow-sm hover:shadow-xl transition-all duration-300
          pkg-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Image */}
        <div className="relative w-48 sm:w-64 shrink-0 overflow-hidden bg-slate-100">
          {cover
            ? <img src={cover} alt={pkg.title}
                className="pkg-card-img w-full h-full object-cover" />
            : <div className="w-full h-full min-h-[180px] flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${accent}22,${accent}55)` }}>
                <Package size={36} style={{ color: accent }} className="opacity-40" />
              </div>
          }
          {/* Badge */}
          {pkg.badge_label && (
            <span className="absolute top-3 left-3 text-[10px] font-black
              uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow"
              style={{ backgroundColor: pkg.badge_color || accent }}>
              {pkg.badge_label}
            </span>
          )}
          {/* Discount */}
          {hasDisc && (
            <span className="absolute bottom-3 left-3 text-[10px] font-black
              bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
              -{pkg.discount_percent}% OFF
            </span>
          )}
          {/* Sold out */}
          {pkg.is_sold_out && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-widest uppercase
                border border-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1 min-w-0">
                {pkg.category && (
                  <span className="text-[10px] font-bold uppercase tracking-widest
                    text-emerald-600 mb-1 block">{pkg.category}</span>
                )}
                <h3 className="font-bold text-slate-800 text-lg leading-snug
                  group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {pkg.title}
                </h3>
              </div>
              <button onClick={handleWish}
                className="shrink-0 w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50
                  flex items-center justify-center transition-colors border border-slate-200
                  hover:border-red-200">
                <Heart size={14}
                  className={isWish ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
              {pkg.destination && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-500" />
                  {pkg.destination}
                </span>
              )}
              {pkg.duration_days && (
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-emerald-500" />
                  {fmtDuration(pkg.duration_days, pkg.duration_nights)}
                </span>
              )}
              {pkg.max_travelers && (
                <span className="flex items-center gap-1">
                  <Users size={11} className="text-emerald-500" />
                  Max {pkg.max_travelers}
                </span>
              )}
            </div>

            {pkg.short_description && (
              <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {pkg.short_description}
              </p>
            )}

            {feats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {feats.map((f, i) => (
                  <span key={i}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
                      ring-1 ${t.tag}`}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between mt-4 pt-4
            border-t border-slate-100">
            <div>
              {hasDisc && (
                <p className="text-xs text-slate-400 line-through leading-none mb-0.5">
                  {fmtPrice(origPx, pkg.currency)}
                </p>
              )}
              <p className={`text-xl font-black ${t.price}`}>
                {pkg.is_price_visible !== false
                  ? fmtPrice(pkg.price, pkg.currency)
                  : 'Price on Request'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {pkg.price_label || 'per person'}
              </p>
            </div>
            <span className={`flex items-center gap-2 text-sm font-bold text-white
              px-5 py-2.5 rounded-xl bg-gradient-to-r ${t.btn}
              pkg-btn-gradient shadow-md`}>
              View Details <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // ── GRID CARD ─────────────────────────────────────────────────────────────
  return (
    <Link
      to={to}
      className="pkg-card group flex flex-col bg-white rounded-3xl overflow-hidden
        border border-slate-100 hover:border-emerald-200
        shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1
        pkg-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52 sm:h-56 bg-slate-100">
        {cover
          ? <img src={cover} alt={pkg.title}
              className="pkg-card-img w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(145deg,${accent}33,${accent}77)` }}>
              <Package size={52} style={{ color: accent }} className="opacity-30" />
            </div>
        }

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t
          from-black/50 via-black/5 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {pkg.badge_label && (
            <span className="text-[10px] font-black uppercase tracking-widest
              px-2.5 py-1 rounded-full text-white shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: pkg.badge_color || accent }}>
              {pkg.badge_label}
            </span>
          )}
          {!pkg.badge_label && pkg.is_featured && (
            <span className="text-[10px] font-black uppercase tracking-widest
              px-2.5 py-1 rounded-full text-white bg-amber-500 shadow-lg">
              ⭐ Featured
            </span>
          )}
          {hasDisc && (
            <span className="text-[10px] font-black bg-red-500 text-white
              px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              -{pkg.discount_percent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={handleWish}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm
            rounded-full flex items-center justify-center shadow-md
            hover:scale-110 hover:bg-white transition-all duration-200 border border-white/50">
          <Heart size={15}
            className={isWish ? 'fill-red-500 text-red-500' : 'text-slate-600'} />
        </button>

        {/* Duration bottom right */}
        {pkg.duration_days && (
          <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm
            text-white text-[11px] font-bold px-3 py-1.5 rounded-full
            flex items-center gap-1.5 border border-white/10">
            <Clock size={10} />
            {fmtDuration(pkg.duration_days, pkg.duration_nights)}
          </div>
        )}

        {/* Category bottom left */}
        {pkg.category && (
          <div className="absolute bottom-3 left-3 bg-black/55 backdrop-blur-sm
            text-white text-[10px] font-bold px-2.5 py-1 rounded-full
            uppercase tracking-wider border border-white/10">
            {pkg.category}
          </div>
        )}

        {/* Sold out */}
        {pkg.is_sold_out && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
            <span className="text-white font-black text-sm tracking-widest uppercase
              border border-white/40 px-5 py-2 rounded-2xl backdrop-blur-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">
        {/* Title + location */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-800 text-[17px] leading-snug mb-1.5
            group-hover:text-emerald-700 transition-colors line-clamp-2">
            {pkg.title}
          </h3>
          {(pkg.destination || pkg.country) && (
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={11} className="text-emerald-500 shrink-0" />
              {[pkg.destination, pkg.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Short desc */}
        {pkg.short_description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">
            {pkg.short_description}
          </p>
        )}

        {/* Features */}
        {feats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {feats.map((f, i) => (
              <span key={i}
                className={`text-[11px] font-semibold px-2.5 py-1
                  rounded-full ring-1 ${t.tag}`}>
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4">
          {pkg.max_travelers && (
            <span className="flex items-center gap-1">
              <Users size={10} className="text-emerald-500" />
              Max {pkg.max_travelers}
            </span>
          )}
          {Number(pkg.booking_count) > 0 && (
            <span className="flex items-center gap-1">
              <TrendingUp size={10} className="text-emerald-500" />
              {pkg.booking_count} booked
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-end justify-between gap-3">
            <div>
              {hasDisc && (
                <p className="text-xs text-slate-400 line-through leading-none mb-0.5">
                  {fmtPrice(origPx, pkg.currency)}
                </p>
              )}
              <p className={`text-2xl font-black leading-none ${t.price}`}>
                {pkg.is_price_visible !== false
                  ? fmtPrice(pkg.price, pkg.currency)
                  : 'POA'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {pkg.price_label || 'per person'}
              </p>
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 text-sm font-bold
              text-white px-4 py-2.5 rounded-xl bg-gradient-to-r ${t.btn}
              pkg-btn-gradient shadow-md`}>
              Explore <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})

// ── SKELETON ──────────────────────────────────────────────────────────────────

function SkeletonCard({ view = 'grid' }) {
  if (view === 'list') {
    return (
      <div className="flex bg-white rounded-2xl border border-slate-100
        overflow-hidden animate-pulse">
        <div className="w-48 sm:w-64 h-44 bg-slate-200 shrink-0" />
        <div className="flex-1 p-6 space-y-3">
          <div className="h-3 bg-slate-200 rounded w-1/4" />
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="flex gap-2">
            {[1,2,3].map(i=><div key={i} className="h-6 w-16 bg-slate-100 rounded-full"/>)}
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-7 w-24 bg-slate-200 rounded" />
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-3xl border border-slate-100
      overflow-hidden animate-pulse">
      <div className="h-52 sm:h-56 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
        <div className="flex gap-2">
          {[1,2].map(i=><div key={i} className="h-6 w-20 bg-slate-100 rounded-full"/>)}
        </div>
        <div className="flex justify-between items-end pt-3 border-t border-slate-100">
          <div className="h-8 w-28 bg-slate-200 rounded" />
          <div className="h-10 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── HERO ──────────────────────────────────────────────────────────────────────

function Hero({ search, onSearch, total, loading }) {
  const [local, setLocal] = useState(search)
  const inputRef = useRef(null)

  const handleSubmit = (e) => { e.preventDefault(); onSearch(local) }
  const handleClear  = () => { setLocal(''); onSearch(''); inputRef.current?.focus() }

  return (
    <div className="relative min-h-[580px] sm:min-h-[640px] flex flex-col
      items-center justify-center overflow-hidden">

      {/* Background image */}
      <img
        src={HERO_BG}
        alt="Safari landscape"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Multi-layer overlay for perfect text readability */}
      <div className="absolute inset-0 bg-gradient-to-b
        from-black/70 via-black/50 to-black/75" />
      <div className="absolute inset-0 bg-gradient-to-r
        from-emerald-950/40 via-transparent to-emerald-950/30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4
        sm:px-6 py-20 text-center">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-white/10
          backdrop-blur-md text-emerald-300 text-xs font-bold
          uppercase tracking-widest px-5 py-2.5 rounded-full mb-8
          border border-emerald-400/30 shadow-lg">
          <Sparkles size={12} className="text-emerald-400" />
          {loading ? 'Loading packages…' : `${total > 0 ? total + ' curated' : 'Curated'} packages`}
        </div>

        {/* Heading */}
        <h1 className="pkg-hero-text text-4xl sm:text-5xl lg:text-6xl
          xl:text-7xl font-black text-white mb-5 leading-[1.05] tracking-tight">
          Your Perfect
          <span className="block mt-1 text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)',
            }}>
            African Adventure
          </span>
        </h1>

        <p className="text-white/80 text-lg sm:text-xl mb-10 max-w-2xl
          mx-auto font-light leading-relaxed pkg-hero-text">
          Discover handcrafted safari packages tailored for extraordinary
          East African experiences.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
          <div className="flex bg-white/95 backdrop-blur-xl rounded-2xl
            shadow-2xl overflow-hidden border border-white/50
            focus-within:ring-4 focus-within:ring-emerald-400/30
            transition-all duration-300">
            <div className="flex-1 flex items-center gap-3 px-5">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={local}
                onChange={e => setLocal(e.target.value)}
                placeholder="Search destinations, safaris, activities…"
                className="flex-1 py-4 sm:py-5 text-slate-700
                  placeholder-slate-400 outline-none text-sm sm:text-base
                  bg-transparent font-medium"
              />
              {local && (
                <button type="button" onClick={handleClear}
                  className="shrink-0 w-6 h-6 rounded-full bg-slate-200
                    hover:bg-slate-300 flex items-center justify-center
                    transition-colors">
                  <X size={13} className="text-slate-500" />
                </button>
              )}
            </div>
            <button type="submit"
              className="shrink-0 px-6 sm:px-8 py-4 sm:py-5 font-bold
                text-sm sm:text-base text-white flex items-center gap-2
                transition-all duration-200 hover:gap-3"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }}>
              <span className="hidden sm:inline">Search</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

        {/* Quick stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mt-10 flex-wrap">
          {[
            { icon: Star,     label: '5-Star Rated' },
            { icon: Shield,   label: 'Safe & Secure' },
            { icon: Calendar, label: 'Flexible Dates' },
          ].map(({ icon: Ic, label }) => (
            <div key={label} className="flex items-center gap-2
              text-white/70 text-sm font-medium">
              <Ic size={15} className="text-emerald-400" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none"
          xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z"
            fill="#f8fafc" />
        </svg>
      </div>
    </div>
  )
}

// Need to import Shield and Calendar for Hero stats
import { Shield } from 'lucide-react'

// ── FILTER DRAWER (mobile) + SIDEBAR (desktop) ────────────────────────────────

function FilterContent({
  sort, onSort, duration, onDuration,
  priceRange, onPriceRange, onReset, activeCount,
}) {
  const Section = ({ title, children }) => (
    <div className="pb-5 mb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
      <p className="text-[10px] font-black text-slate-400 uppercase
        tracking-[0.15em] mb-3">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )

  const Opt = ({ active, onClick, children }) => (
    <button onClick={onClick}
      className={`w-full text-left text-sm px-3 py-2.5 rounded-xl
        transition-all duration-150 font-medium ${
        active
          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}>
      {children}
    </button>
  )

  return (
    <div>
      <Section title="Sort By">
        {SORT_OPTIONS.map(o => (
          <Opt key={o.value} active={sort === o.value} onClick={() => onSort(o.value)}>
            {o.label}
          </Opt>
        ))}
      </Section>

      <Section title="Duration">
        {DURATION_FILTERS.map(d => (
          <Opt key={d.value} active={duration === d.value}
            onClick={() => onDuration(d.value)}>
            {d.label}
          </Opt>
        ))}
      </Section>

      <Section title="Price Range">
        {PRICE_RANGES.map((p, i) => (
          <Opt key={i} active={priceRange?.label === p.label}
            onClick={() => onPriceRange(p)}>
            {p.label}
          </Opt>
        ))}
      </Section>

      {activeCount > 0 && (
        <button onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3
            text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100
            border border-red-200 rounded-xl transition-colors mt-2">
          <X size={14} /> Clear All ({activeCount})
        </button>
      )}
    </div>
  )
}

function FilterPanel(props) {
  const { isOpen, onClose, activeCount } = props

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0">
        <div className="sticky top-24 bg-white rounded-3xl border border-slate-100
          shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center
            justify-between bg-gradient-to-r from-emerald-50 to-white">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <SlidersHorizontal size={16} className="text-emerald-600" />
              Filters & Sort
            </h3>
            {activeCount > 0 && (
              <span className="text-xs bg-emerald-500 text-white
                w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </div>
          <div className="p-5 max-h-[calc(100vh-12rem)] overflow-y-auto
            pkg-scrollbar-hide">
            <FilterContent {...props} />
          </div>
        </div>
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-[85vw] max-w-sm bg-white
            shadow-2xl flex flex-col h-full pkg-filter-enter">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4
              border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white
              shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-emerald-600" />
                Filters & Sort
                {activeCount > 0 && (
                  <span className="text-xs bg-emerald-500 text-white
                    w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </h3>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200
                  flex items-center justify-center transition-colors">
                <X size={16} className="text-slate-600" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-5 pkg-scrollbar-hide">
              <FilterContent {...props} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── ERROR STATE ───────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry }) {
  const isNetwork   = !navigator.onLine || error?.message?.includes('fetch')
  const isNotFound  = error?.status === 404
  const isServer    = error?.status >= 500

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100
        flex items-center justify-center mb-6 shadow-sm">
        <Package size={36} className="text-red-400" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {isNetwork  ? 'No Internet Connection'   :
         isNotFound ? 'Packages Not Found'       :
         isServer   ? 'Server Error'             :
                      'Something Went Wrong'}
      </h3>

      <p className="text-slate-500 text-sm max-w-sm mb-2 leading-relaxed">
        {isNetwork  ? 'Please check your connection and try again.' :
         isNotFound ? 'We couldn\'t find any packages at this time.' :
         isServer   ? 'Our servers are having trouble. Please try again shortly.' :
                      error?.message || 'An unexpected error occurred.'}
      </p>

      {error?.status && (
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Error code: {error.status}
        </p>
      )}

      <button onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600
          text-white font-bold text-sm rounded-xl hover:bg-emerald-700
          transition-colors shadow-lg shadow-emerald-100">
        <ArrowRight size={15} /> Try Again
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function Packages() {
  useEffect(injectStyles, [])

  const [searchParams, setSearchParams] = useSearchParams()

  // Data state
  const [packages,    setPackages]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total,       setTotal]       = useState(0)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [error,       setError]       = useState(null)

  // UI state
  const [view,       setView]       = useState('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const [wishlist,   setWishlist]   = useState(new Set())

  // Filters
  const [search,     setSearch]     = useState(searchParams.get('search') || '')
  const [category,   setCategory]   = useState(searchParams.get('category') || '')
  const [sort,       setSort]       = useState('sort_order:asc')
  const [duration,   setDuration]   = useState('')
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0])

  const dSearch  = useDebounce(search, 500)
  const loaderRef = useRef(null)
  const topRef    = useRef(null)

  const [sortBy, sortOrder] = sort.split(':')

  const activeFilterCount = useMemo(() =>
    [duration, priceRange?.label !== 'Any Price' ? '1' : ''].filter(Boolean).length
  , [duration, priceRange])

  // ── Load packages ──────────────────────────────────────────────────────────

  const loadPackages = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) { setLoading(true); setError(null) }
    else setLoadingMore(true)

    try {
      const q = { page: pg, limit: LIMIT, sortBy, order: sortOrder }
      if (dSearch)       q.search   = dSearch
      if (category)      q.category = category
      if (duration)      q.duration = duration
      if (priceRange?.min) q.minPrice = priceRange.min
      if (priceRange?.max) q.maxPrice = priceRange.max

      const data = await apiGet('/packages', q)
      const rows = data.data || []
      const tot  = data.pagination?.total ?? data.total ?? 0

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

  // ── Sync URL ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const p = {}
    if (search)   p.search   = search
    if (category) p.category = category
    setSearchParams(p, { replace: true })
  }, [search, category, setSearchParams])

  // ── Infinite scroll ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore && hasMore) {
        loadPackages(page + 1, true)
      }
    }, { threshold: 0.1 })
    obs.observe(loaderRef.current)
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
    setWishlist(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      try { localStorage.setItem('altuvera_wishlist', JSON.stringify([...n])) } catch {}
      return n
    })
  }, [])

  // ── Reset filters ──────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setSearch(''); setCategory(''); setDuration('')
    setPriceRange(PRICE_RANGES[0]); setSort('sort_order:asc')
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ── Category change ────────────────────────────────────────────────────────

  const handleCategory = useCallback((cat) => {
    setCategory(cat)
    setFilterOpen(false)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50" ref={topRef}>

      {/* Hero */}
      <Hero search={search} onSearch={setSearch} total={total} loading={loading} />

      {/* ── Category pills bar ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3
            pkg-scrollbar-hide">
            {CATEGORIES.map(cat => {
              const active = cat.id === category
              const Icon   = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-2 text-sm font-semibold
                    px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap
                    border ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                      : 'text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  <Icon size={13} className={active ? 'text-white' : 'text-emerald-500'} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 xl:gap-8">

          {/* Sidebar + drawer */}
          <FilterPanel
            sort={sort}             onSort={setSort}
            duration={duration}     onDuration={setDuration}
            priceRange={priceRange} onPriceRange={setPriceRange}
            onReset={handleReset}   activeCount={activeFilterCount}
            isOpen={filterOpen}     onClose={() => setFilterOpen(false)}
          />

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <div>
                {loading ? (
                  <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                ) : error ? null : (
                  <h2 className="font-bold text-slate-800 text-lg">
                    {total.toLocaleString()}{' '}
                    Package{total !== 1 ? 's' : ''}
                    {category && (
                      <span className="text-emerald-600"> · {category}</span>
                    )}
                  </h2>
                )}
                {dSearch && !loading && (
                  <p className="text-sm text-slate-400 mt-0.5">
                    Results for <span className="font-semibold text-slate-600">
                      "{dSearch}"
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold
                    px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                    hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <Filter size={15} className="text-emerald-600" />
                  Filters
                  {(activeFilterCount > 0) && (
                    <span className="w-5 h-5 bg-emerald-500 text-white text-[11px]
                      rounded-full flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* View toggle */}
                <div className="flex bg-white border border-slate-200
                  rounded-xl overflow-hidden shadow-sm">
                  {[
                    { id: 'grid', Icon: Grid3X3 },
                    { id: 'list', Icon: List },
                  ].map(({ id, Icon: Ic }) => (
                    <button key={id} onClick={() => setView(id)}
                      className={`p-2.5 transition-colors ${
                        view === id
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}>
                      <Ic size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(category || duration || priceRange?.label !== 'Any Price' || dSearch) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {dSearch && (
                  <Chip label={`"${dSearch}"`} color="slate"
                    onRemove={() => setSearch('')} />
                )}
                {category && (
                  <Chip label={category} color="emerald"
                    onRemove={() => setCategory('')} />
                )}
                {duration && (
                  <Chip
                    label={DURATION_FILTERS.find(d => d.value === duration)?.label || duration}
                    color="blue"
                    onRemove={() => setDuration('')}
                  />
                )}
                {priceRange?.label !== 'Any Price' && (
                  <Chip label={priceRange.label} color="amber"
                    onRemove={() => setPriceRange(PRICE_RANGES[0])} />
                )}
                <button onClick={handleReset}
                  className="text-xs font-bold text-red-500 hover:text-red-700
                    px-3 py-1.5 hover:bg-red-50 rounded-full transition-colors">
                  Clear all
                </button>
              </div>
            )}

            {/* ── Error ── */}
            {error && <ErrorState error={error} onRetry={() => loadPackages(1)} />}

            {/* ── Grid/List ── */}
            {!error && (
              <>
                {loading ? (
                  <div className={
                    view === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6'
                      : 'space-y-4'
                  }>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} view={view} />
                    ))}
                  </div>
                ) : packages.length === 0 ? (
                  <EmptyState onReset={handleReset} hasFilters={
                    !!(category || duration || dSearch ||
                       priceRange?.label !== 'Any Price')
                  } />
                ) : (
                  <div className={
                    view === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6'
                      : 'space-y-4'
                  }>
                    {packages.map((pkg, i) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        view={view}
                        wishlist={wishlist}
                        onWishlist={handleWishlist}
                        index={i}
                      />
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={loaderRef} className="h-8 mt-6" />

                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                      <Loader2 size={20} className="animate-spin text-emerald-500" />
                      Loading more packages…
                    </div>
                  </div>
                )}

                {!hasMore && packages.length > 0 && !loading && (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center gap-2 text-sm
                      text-slate-400 bg-slate-100 px-5 py-2.5 rounded-full font-medium">
                      <Sparkles size={14} className="text-emerald-500" />
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

// ── CHIP ──────────────────────────────────────────────────────────────────────

function Chip({ label, color = 'emerald', onRemove }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    blue:    'bg-blue-100 text-blue-700 ring-blue-200',
    amber:   'bg-amber-100 text-amber-700 ring-amber-200',
    slate:   'bg-slate-100 text-slate-700 ring-slate-200',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
      px-3 py-1.5 rounded-full ring-1 ${colors[color] || colors.slate}`}>
      {label}
      <button onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full hover:bg-black/10
          flex items-center justify-center transition-colors shrink-0">
        <X size={10} />
      </button>
    </span>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────

function EmptyState({ onReset, hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-50
        to-emerald-100 border border-emerald-200 flex items-center
        justify-center mb-6 shadow-inner">
        <Package size={40} className="text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">
        {hasFilters ? 'No packages match your filters' : 'No packages available'}
      </h3>
      <p className="text-slate-400 text-sm max-w-xs mb-8 leading-relaxed">
        {hasFilters
          ? 'Try adjusting or clearing your filters to see more options.'
          : 'Check back soon — we\'re adding new packages regularly.'}
      </p>
      {hasFilters && (
        <button onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600
            text-white font-bold text-sm rounded-xl hover:bg-emerald-700
            transition-colors shadow-lg shadow-emerald-100">
          <X size={15} /> Clear All Filters
        </button>
      )}
    </div>
  )
}