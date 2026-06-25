// ============================================================================
// src/pages/PackageDetail.jsx — Green/White, no separate chat, uses portal
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
  ArrowRight, Zap, Globe, Calendar,
} from 'lucide-react'
import { packagesAPI } from '../api/packages'
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

/* ── Image Gallery ────────────────────────────────────────────────────── */
function ImageGallery({ images = [], cover, title }) {
  const [idx, setIdx] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const all = useMemo(() => {
    const parsed = parseJson(images)
    return cover ? [cover, ...parsed.filter(i => i !== cover)] : parsed
  }, [images, cover])

  if (!all.length) {
    return (
      <div className="h-72 sm:h-[460px] bg-gradient-to-br from-green-800 to-green-950
        flex items-center justify-center rounded-2xl sm:rounded-3xl">
        <Package size={64} className="text-green-300 opacity-40" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative h-72 sm:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden group cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <img
          src={all[idx]}
          alt={`${title} ${idx + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {all.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + all.length) % all.length) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11
                rounded-full bg-white/90 hover:bg-white text-green-800
                flex items-center justify-center shadow-lg transition-all
                opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % all.length) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11
                rounded-full bg-white/90 hover:bg-white text-green-800
                flex items-center justify-center shadow-lg transition-all
                opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {all.slice(0, 8).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIdx(i) }}
                  className={`rounded-full transition-all ${
                    i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm
          text-white text-xs font-semibold px-2.5 py-1.5 rounded-full
          flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera size={11} /> {idx + 1}/{all.length}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <p className="text-white font-black text-lg sm:text-2xl drop-shadow-lg line-clamp-2">
            {title}
          </p>
        </div>
      </div>

      {/* Thumbnails */}
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-xl overflow-hidden
                transition-all duration-200 ${
                i === idx
                  ? 'ring-2 ring-green-500 ring-offset-2 opacity-100'
                  : 'opacity-60 hover:opacity-90'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={all[idx]}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10
              hover:bg-white/20 text-white flex items-center justify-center"
            onClick={() => setZoomed(false)}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── FAQ Item ─────────────────────────────────────────────────────────── */
function FaqItem({ faq, accent = '#16a34a' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
      open ? 'border-green-200 shadow-sm' : 'border-gray-100'
    }`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4
          hover:bg-green-50/50 transition-colors text-left gap-3"
      >
        <span className="font-semibold text-gray-800 text-sm leading-relaxed">
          {faq.question || faq.title}
        </span>
        <ChevronDown
          size={16}
          className={`text-green-500 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed
          border-t border-green-100">
          {faq.answer || faq.content}
        </div>
      )}
    </div>
  )
}

/* ── Booking Panel ────────────────────────────────────────────────────── */
function BookingPanel({ pkg, user, onSuccess }) {
  const [form, setForm] = useState({
    guest_name:       user?.fullName || user?.full_name || user?.name || '',
    guest_email:      user?.email  || '',
    guest_phone:      user?.phone  || '',
    travelers_count:  1,
    adults:           1,
    children:         0,
    travel_date:      '',
    end_date:         '',
    special_requests: '',
  })
  const [sending,    setSending]    = useState(false)
  const [errors,     setErrors]     = useState({})
  const [success,    setSuccess]    = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  useEffect(() => {
    if (!user) return
    setForm(p => ({
      ...p,
      guest_name:  p.guest_name  || user.fullName || user.full_name || user.name || '',
      guest_email: p.guest_email || user.email || '',
      guest_phone: p.guest_phone || user.phone || '',
    }))
  }, [user?.id]) // eslint-disable-line

  const upd = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: '' }))
  }

  const totalTravelers  = (parseInt(form.adults) || 1) + (parseInt(form.children) || 0)
  const estimatedPrice  = Number(pkg.price) * totalTravelers

  const validate = () => {
    const e = {}
    if (!form.guest_name?.trim())  e.guest_name  = 'Name is required'
    if (!form.guest_email?.trim()) e.guest_email = 'Email is required'
    if (form.guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email))
      e.guest_email = 'Invalid email'
    if (!form.travel_date) e.travel_date = 'Travel date is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSending(true)
    try {
      const body = await packagesAPI.createBooking(pkg.id, {
        ...form, travelers_count: totalTravelers,
        total_price: estimatedPrice,
      })
      setSuccess(true)
      setBookingRef(body?.data?.booking_ref || '')
      onSuccess?.()
    } catch (err) {
      setErrors({ _form: err?.message || 'Failed to submit booking.' })
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
          justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Request Sent!</h3>
        {bookingRef && (
          <p className="text-sm font-mono bg-green-50 text-green-700
            px-4 py-2 rounded-xl inline-block mb-3">
            Ref: {bookingRef}
          </p>
        )}
        <p className="text-gray-500 text-sm mb-5">
          We'll review your request and get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSuccess(false); setBookingRef('') }}
          className="text-sm text-green-600 hover:underline font-semibold"
        >
          Make another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {errors._form && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200
          rounded-xl text-sm text-red-600">
          <AlertCircle size={14} /> {errors._form}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
          <div className="relative">
            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={form.guest_name}
              onChange={e => upd('guest_name', e.target.value)}
              placeholder="Your name"
              className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none
                focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all
                ${errors.guest_name ? 'border-red-400' : 'border-gray-200'}`}
            />
          </div>
          {errors.guest_name && <p className="text-xs text-red-500 mt-1">{errors.guest_name}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
          <div className="relative">
            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email" value={form.guest_email}
              onChange={e => upd('guest_email', e.target.value)}
              placeholder="you@email.com"
              className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm outline-none
                focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all
                ${errors.guest_email ? 'border-red-400' : 'border-gray-200'}`}
            />
          </div>
          {errors.guest_email && <p className="text-xs text-red-500 mt-1">{errors.guest_email}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone</label>
        <div className="relative">
          <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="tel" value={form.guest_phone}
            onChange={e => upd('guest_phone', e.target.value)}
            placeholder="+1 234 567 8900"
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200
              text-sm outline-none focus:ring-2 focus:ring-green-100
              focus:border-green-400 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Travel Date *</label>
          <input
            type="date" value={form.travel_date}
            onChange={e => upd('travel_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none
              focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all
              ${errors.travel_date ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.travel_date && <p className="text-xs text-red-500 mt-1">{errors.travel_date}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Return Date</label>
          <input
            type="date" value={form.end_date}
            onChange={e => upd('end_date', e.target.value)}
            min={form.travel_date || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200
              text-sm outline-none focus:ring-2 focus:ring-green-100
              focus:border-green-400 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Adults</label>
          <input
            type="number" min="1" max={pkg.max_travelers || 99}
            value={form.adults}
            onChange={e => upd('adults', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm
              outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Children</label>
          <input
            type="number" min="0" value={form.children}
            onChange={e => upd('children', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm
              outline-none focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Special Requests</label>
        <textarea
          rows={3} value={form.special_requests}
          onChange={e => upd('special_requests', e.target.value)}
          placeholder="Dietary needs, accessibility, preferences…"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none
            focus:ring-2 focus:ring-green-100 focus:border-green-400 transition-all resize-none"
        />
      </div>

      {pkg.is_price_visible !== false && Number(pkg.price) > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              {fmtPrice(pkg.price, pkg.currency)} × {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-green-700">
              {fmtPrice(estimatedPrice, pkg.currency)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            *Estimated. Final price confirmed by our team.
          </p>
        </div>
      )}

      <button
        type="submit" disabled={sending}
        className={`w-full py-3.5 rounded-xl font-bold text-sm text-white
          flex items-center justify-center gap-2 transition-all
          bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100
          ${sending ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-xl'}`}
      >
        {sending
          ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
          : <><BookOpen size={15} /> Request Booking</>}
      </button>

      <p className="text-center text-xs text-gray-400">
        <Shield size={10} className="inline mr-1" />
        No payment required. We'll confirm availability first.
      </p>
    </form>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════ */
export default function PackageDetail() {
  const { slug }                  = useParams()
  const { user, isAuthenticated } = useUserAuth()
  const { openPortal }            = useMessaging()

  const [pkg,       setPkg]       = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidePanel, setSidePanel] = useState('booking')
  const [wishlist,  setWishlist]  = useState(false)

  const images       = useMemo(() => parseJson(pkg?.images),        [pkg?.images])
  const features     = useMemo(() => parseJson(pkg?.features),      [pkg?.features])
  const inclusions   = useMemo(() => parseJson(pkg?.inclusions),    [pkg?.inclusions])
  const exclusions   = useMemo(() => parseJson(pkg?.exclusions),    [pkg?.exclusions])
  const highlights   = useMemo(() => parseJson(pkg?.highlights),    [pkg?.highlights])
  const itinerary    = useMemo(() => parseJson(pkg?.itinerary),     [pkg?.itinerary])
  const faqs         = useMemo(() => parseJson(pkg?.faqs),          [pkg?.faqs])
  const pricingTiers = useMemo(() => parseJson(pkg?.pricing_tiers), [pkg?.pricing_tiers])
  const hasDisc      = Number(pkg?.discount_percent) > 0
  const origPrice    = hasDisc
    ? Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100)
    : null

  /* Load package */
  useEffect(() => {
    if (!slug) return
    setLoading(true); setError(null)
    const fn = /^\d+$/.test(slug)
      ? () => packagesAPI.getById(slug)
      : () => packagesAPI.getBySlug(slug)
    fn()
      .then(body => {
        const pkgData = body?.data || body
        if (!pkgData?.id) { setError('Package not found'); return }
        setPkg(pkgData)
        try {
          const saved = JSON.parse(localStorage.getItem('altuvera_wishlist') || '[]')
          setWishlist(saved.includes(pkgData.id))
        } catch {}
      })
      .catch(err => {
        if (err?.status === 404) setError('Package not found')
        else setError(err?.message || 'Failed to load package')
      })
      .finally(() => setLoading(false))
  }, [slug])

  /* Open chat with package context */
  const handleAskSupport = useCallback(() => {
    if (!pkg) return
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
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied!'))
        .catch(() => {})
    }
  }

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen bg-green-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center
            justify-center mx-auto mb-4 animate-pulse">
            <Package size={32} className="text-green-600" />
          </div>
          <Loader2 size={24} className="animate-spin text-green-500 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">Loading package details…</p>
        </div>
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-green-50/30 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Package size={56} className="text-green-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{error || 'Package not found'}</h2>
          <p className="text-gray-400 mb-6 text-sm">
            The package you're looking for doesn't exist or is unavailable.
          </p>
          <Link
            to="/packages"
            className="px-6 py-3 bg-green-600 text-white font-semibold
              rounded-xl hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Browse Packages
          </Link>
        </div>
      </div>
    )
  }

  const accent = pkg.accent_color || '#16a34a'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2
          text-sm text-gray-500 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <Link to="/" className="hover:text-green-600 transition-colors shrink-0">Home</Link>
          <ChevronRight size={14} className="text-gray-300 shrink-0" />
          <Link to="/packages" className="hover:text-green-600 transition-colors shrink-0">
            Packages
          </Link>
          <ChevronRight size={14} className="text-gray-300 shrink-0" />
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{pkg.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">

          {/* ── LEFT: Main content ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Gallery */}
            <ImageGallery
              images={pkg.images}
              cover={pkg.cover_image_url}
              title={pkg.title}
            />

            {/* Title block */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8
              shadow-sm border border-green-50">

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {pkg.category && (
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest
                      px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    {pkg.category}
                  </span>
                )}
                {pkg.badge_label && (
                  <span
                    className="text-[11px] font-black uppercase tracking-wider
                      px-3 py-1 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: pkg.badge_color || accent }}
                  >
                    {pkg.badge_label}
                  </span>
                )}
                {pkg.is_featured && (
                  <span className="flex items-center gap-1 text-[11px] font-bold
                    text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Star size={10} className="fill-amber-500" /> Featured
                  </span>
                )}
                {pkg.is_sold_out && (
                  <span className="text-[11px] font-bold text-red-600 bg-red-50
                    px-3 py-1 rounded-full border border-red-200">
                    Sold Out
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900
                leading-tight mb-4">
                {pkg.title}
              </h1>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {pkg.destination && (
                  <div className="flex items-center gap-1.5 bg-green-50
                    border border-green-100 px-3 py-1.5 rounded-full">
                    <MapPin size={12} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-800">
                      {pkg.destination}
                    </span>
                  </div>
                )}
                {pkg.duration_days && (
                  <div className="flex items-center gap-1.5 bg-green-50
                    border border-green-100 px-3 py-1.5 rounded-full">
                    <Clock size={12} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-800">
                      {pkg.duration_days} days
                      {pkg.duration_nights ? ` / ${pkg.duration_nights} nights` : ''}
                    </span>
                  </div>
                )}
                {pkg.max_travelers && (
                  <div className="flex items-center gap-1.5 bg-green-50
                    border border-green-100 px-3 py-1.5 rounded-full">
                    <Users size={12} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-800">
                      Max {pkg.max_travelers}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <button
                  onClick={toggleWishlist}
                  className={`flex items-center gap-1.5 text-sm font-semibold
                    px-4 py-2 rounded-xl border transition-all ${
                    wishlist
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Heart size={14} className={wishlist ? 'fill-red-500' : ''} />
                  {wishlist ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm font-semibold
                    px-4 py-2 rounded-xl border border-gray-200 text-gray-500
                    hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={14} /> Share
                </button>

                {/* Ask Support — opens chat portal with package context */}
                <button
                  onClick={handleAskSupport}
                  className="flex items-center gap-1.5 text-sm font-semibold
                    px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700
                    text-white transition-all shadow-sm shadow-green-200
                    hover:shadow-md hover:-translate-y-0.5"
                >
                  <MessageCircle size={14} /> Ask Support
                </button>
              </div>

              {pkg.short_description && (
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {pkg.short_description}
                </p>
              )}
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8
                shadow-sm border border-green-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4
                  flex items-center gap-2">
                  <Sparkles size={18} style={{ color: accent }} />
                  Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3
                      p-3 rounded-xl bg-green-50/50 border border-green-100">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center
                          shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accent}20` }}
                      >
                        <Check size={11} style={{ color: accent }} />
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8
                shadow-sm border border-green-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                  Package Features
                </h2>
                <div className="flex flex-wrap gap-2">
                  {features.map((f, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-2 text-sm font-semibold
                        px-3.5 py-2 rounded-full border"
                      style={{
                        borderColor:     `${accent}30`,
                        color:           accent,
                        backgroundColor: `${accent}08`,
                      }}
                    >
                      <Check size={12} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content tabs */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm
              border border-green-50 overflow-hidden">
              {/* Tab nav */}
              <div className="flex overflow-x-auto border-b border-gray-100"
                style={{ scrollbarWidth: 'none' }}>
                {[
                  { id: 'overview',   label: 'Overview'   },
                  { id: 'itinerary',  label: `Itinerary${itinerary.length ? ` (${itinerary.length})` : ''}` },
                  { id: 'inclusions', label: "Included"   },
                  { id: 'faqs',       label: `FAQs${faqs.length ? ` (${faqs.length})` : ''}` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 px-5 py-3.5 text-sm font-semibold border-b-2
                      transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-700 bg-green-50/60'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-8">
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="prose prose-sm sm:prose-base max-w-none
                    prose-headings:text-gray-800 prose-p:text-gray-600
                    prose-strong:text-gray-800 prose-a:text-green-600">
                    {pkg.description
                      ? <div dangerouslySetInnerHTML={{ __html: pkg.description }} />
                      : pkg.content
                      ? <div dangerouslySetInnerHTML={{ __html: pkg.content }} />
                      : <p className="text-gray-400 italic text-center py-8">No description available.</p>
                    }
                  </div>
                )}

                {/* Itinerary */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    {!itinerary.length && (
                      <div className="text-center py-12">
                        <Calendar size={36} className="text-green-200 mx-auto mb-3" />
                        <p className="text-gray-400 italic">No itinerary added yet.</p>
                      </div>
                    )}
                    {itinerary.map((day, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="shrink-0 flex flex-col items-center">
                          <div
                            className="w-10 h-10 rounded-2xl font-black text-sm
                              flex items-center justify-center text-white shadow-md"
                            style={{ background: `linear-gradient(135deg,${accent},#15803d)` }}
                          >
                            {day.day || i + 1}
                          </div>
                          {i < itinerary.length - 1 && (
                            <div className="w-0.5 flex-1 my-2"
                              style={{ background: `${accent}30` }} />
                          )}
                        </div>
                        <div className={`flex-1 pb-4 ${i < itinerary.length - 1 ? 'border-b border-green-50' : ''}`}>
                          <h4 className="font-bold text-gray-800 mb-1.5 text-sm sm:text-base">
                            {day.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {day.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inclusions */}
                {activeTab === 'inclusions' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2
                        text-sm sm:text-base">
                        <CheckCircle size={16} className="text-green-500" /> Included
                      </h3>
                      {!inclusions.length
                        ? <p className="text-gray-400 italic text-sm">Not specified</p>
                        : (
                          <ul className="space-y-2.5">
                            {inclusions.map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                <Check size={13} className="text-green-500 mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2
                        text-sm sm:text-base">
                        <XCircle size={16} className="text-red-400" /> Not Included
                      </h3>
                      {!exclusions.length
                        ? <p className="text-gray-400 italic text-sm">Not specified</p>
                        : (
                          <ul className="space-y-2.5">
                            {exclusions.map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                <X size={13} className="text-red-400 mt-0.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  </div>
                )}

                {/* FAQs */}
                {activeTab === 'faqs' && (
                  <div className="space-y-3">
                    {!faqs.length
                      ? (
                        <div className="text-center py-12">
                          <Info size={36} className="text-green-200 mx-auto mb-3" />
                          <p className="text-gray-400 italic">No FAQs added yet.</p>
                        </div>
                      )
                      : faqs.map((faq, i) => (
                        <FaqItem key={i} faq={faq} accent={accent} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="space-y-4">
            <div className="xl:sticky xl:top-24 space-y-4">

              {/* Price card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg
                border border-green-100 p-5 sm:p-6">

                {pkg.is_price_visible !== false ? (
                  <>
                    {hasDisc && (
                      <p className="text-sm text-gray-400 line-through leading-none mb-1">
                        {fmtPrice(origPrice, pkg.currency)}
                      </p>
                    )}
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-3xl sm:text-4xl font-black" style={{ color: accent }}>
                        {fmtPrice(pkg.price, pkg.currency)}
                      </span>
                      {hasDisc && (
                        <span className="text-xs font-bold text-red-500 bg-red-50
                          px-2 py-1 rounded-full mb-1">
                          -{pkg.discount_percent}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{pkg.price_label || 'per person'}</p>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xl font-black text-gray-700">Price on Request</p>
                    <p className="text-xs text-gray-400 mt-1">Contact us for pricing</p>
                  </div>
                )}

                {/* Pricing tiers */}
                {pricingTiers.filter(t => t.label || t.price).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Pricing Options
                    </p>
                    {pricingTiers.filter(t => t.label || t.price).map((tier, i) => (
                      <div key={i}
                        className="flex items-center justify-between px-3 py-2.5
                          bg-green-50 rounded-xl border border-green-100">
                        <div>
                          <p className="text-sm font-bold text-gray-700">{tier.label}</p>
                          {tier.description && (
                            <p className="text-xs text-gray-400">{tier.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-black" style={{ color: accent }}>
                          {fmtPrice(tier.price, pkg.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-green-100">
                  {pkg.duration_days && (
                    <div className="text-center p-3 bg-green-50 rounded-2xl
                      border border-green-100">
                      <Clock size={16} className="mx-auto mb-1" style={{ color: accent }} />
                      <p className="text-xl font-black text-gray-800">{pkg.duration_days}</p>
                      <p className="text-xs text-gray-400">Days</p>
                    </div>
                  )}
                  {pkg.max_travelers && (
                    <div className="text-center p-3 bg-green-50 rounded-2xl
                      border border-green-100">
                      <Users size={16} className="mx-auto mb-1" style={{ color: accent }} />
                      <p className="text-xl font-black text-gray-800">{pkg.max_travelers}</p>
                      <p className="text-xs text-gray-400">Max People</p>
                    </div>
                  )}
                </div>

                {/* Availability note */}
                {pkg.availability_note && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50
                    border border-amber-100 rounded-xl">
                    <Info size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">{pkg.availability_note}</p>
                  </div>
                )}

                {/* Ask Support CTA */}
                <button
                  onClick={handleAskSupport}
                  className="w-full mt-5 flex items-center justify-center gap-2
                    py-3 rounded-xl border-2 border-green-200 text-green-700
                    font-semibold text-sm hover:bg-green-50 hover:border-green-400
                    transition-all group"
                >
                  <MessageCircle size={16}
                    className="group-hover:scale-110 transition-transform" />
                  Ask about this package
                </button>

                {/* Panel toggle */}
                <div className="flex mt-3 bg-green-50 rounded-2xl p-1 border border-green-100">
                  {[
                    { id: 'booking', label: 'Book Now',  icon: BookOpen    },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setSidePanel(tab.id)}
                      className="flex-1 flex items-center justify-center gap-2
                        text-sm font-bold py-2.5 rounded-xl transition-all
                        bg-white shadow-sm text-gray-800"
                    >
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking panel */}
              {sidePanel === 'booking' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg
                  border border-green-100 p-5 sm:p-6">
                  <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-base">
                    <BookOpen size={17} style={{ color: accent }} />
                    Request Booking
                  </h3>
                  {pkg.is_sold_out ? (
                    <div className="text-center py-6">
                      <XCircle size={36} className="text-red-400 mx-auto mb-3" />
                      <p className="font-bold text-gray-700 text-sm">This package is sold out</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">
                        Contact us to join the waitlist.
                      </p>
                      <button
                        onClick={handleAskSupport}
                        className="text-sm font-semibold text-green-600
                          hover:underline flex items-center gap-1 mx-auto"
                      >
                        <MessageCircle size={14} /> Chat with us
                      </button>
                    </div>
                  ) : (
                    <BookingPanel pkg={pkg} user={user} onSuccess={() => {}} />
                  )}
                </div>
              )}

              {/* Trust badges */}
              <div className="bg-white rounded-2xl border border-green-100 p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    { icon: Shield,      text: 'Secure Booking'    },
                    { icon: CheckCircle, text: 'Verified Packages' },
                    { icon: Users,       text: 'Expert Guides'     },
                    { icon: Star,        text: '5-Star Rated'      },
                  ].map(({ icon: Ic, text }) => (
                    <div key={text} className="flex flex-col items-center gap-1.5 p-2
                      rounded-xl hover:bg-green-50 transition-colors">
                      <Ic size={16} style={{ color: accent }} />
                      <span className="text-xs font-semibold text-gray-600">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}