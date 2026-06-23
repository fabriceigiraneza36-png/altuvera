// ============================================================================
// src/pages/PackageDetail.jsx — Full Package Detail + Chat/Booking/InfoForms
// ============================================================================

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPin, Clock, Users, Star, ChevronLeft, ChevronRight,
  ChevronDown, Check, X, Send, MessageSquare, BookOpen,
  Calendar, DollarSign, Heart, Share2, Loader2, Package,
  Phone, Mail, User, ArrowRight, Sparkles, Shield,
  CheckCircle, XCircle, AlertCircle, Info, Palette,
  Sun, ImageIcon, RefreshCw, FileText, Camera,
} from 'lucide-react'
// This now works ✅
import { packagesAPI } from '../api/packages'
import { useUserAuth } from '../context/UserAuthContext'

// ── Constants ─────────────────────────────────────────────────────────────────

const CHAT_THEMES = {
  light: {
    wrap:       'bg-slate-50',
    header:     'bg-white border-b border-slate-100',
    messages:   'bg-slate-50',
    userBubble: 'bg-emerald-600 text-white',
    adminBubble:'bg-white text-slate-800 border border-slate-200 shadow-sm',
    input:      'bg-white border border-slate-200',
    inputText:  'text-slate-700 placeholder-slate-400',
    sendBtn:    'bg-emerald-600 hover:bg-emerald-700 text-white',
    timestamp:  'text-slate-400',
    name:       'text-slate-600',
  },
  dark: {
    wrap:       'bg-slate-900',
    header:     'bg-slate-800 border-b border-slate-700',
    messages:   'bg-slate-900',
    userBubble: 'bg-emerald-500 text-white',
    adminBubble:'bg-slate-700 text-slate-100 border border-slate-600',
    input:      'bg-slate-800 border border-slate-600',
    inputText:  'text-slate-200 placeholder-slate-500',
    sendBtn:    'bg-emerald-500 hover:bg-emerald-600 text-white',
    timestamp:  'text-slate-500',
    name:       'text-slate-400',
  },
  nature: {
    wrap:       'bg-green-50',
    header:     'bg-emerald-800 border-b border-emerald-700',
    messages:   'bg-green-50',
    userBubble: 'bg-emerald-700 text-white',
    adminBubble:'bg-white text-slate-800 border border-emerald-100 shadow-sm',
    input:      'bg-white border border-emerald-200',
    inputText:  'text-slate-700 placeholder-emerald-300',
    sendBtn:    'bg-emerald-700 hover:bg-emerald-800 text-white',
    timestamp:  'text-emerald-500',
    name:       'text-emerald-700',
  },
  ocean: {
    wrap:       'bg-blue-50',
    header:     'bg-blue-900 border-b border-blue-800',
    messages:   'bg-blue-50',
    userBubble: 'bg-blue-600 text-white',
    adminBubble:'bg-white text-slate-800 border border-blue-100 shadow-sm',
    input:      'bg-white border border-blue-200',
    inputText:  'text-slate-700 placeholder-blue-300',
    sendBtn:    'bg-blue-600 hover:bg-blue-700 text-white',
    timestamp:  'text-blue-400',
    name:       'text-blue-600',
  },
  sunset: {
    wrap:       'bg-orange-50',
    header:     'bg-orange-800 border-b border-orange-700',
    messages:   'bg-orange-50',
    userBubble: 'bg-orange-600 text-white',
    adminBubble:'bg-white text-slate-800 border border-orange-100 shadow-sm',
    input:      'bg-white border border-orange-200',
    inputText:  'text-slate-700 placeholder-orange-300',
    sendBtn:    'bg-orange-600 hover:bg-orange-700 text-white',
    timestamp:  'text-orange-400',
    name:       'text-orange-600',
  },
}

const BG_PRESETS = [
  { id: 'none',    label: 'None',         value: '' },
  { id: 'savanna', label: 'Savanna',
    value: 'linear-gradient(145deg, rgba(120,53,15,0.15), rgba(28,25,23,0.1))' },
  { id: 'forest',  label: 'Forest',
    value: 'linear-gradient(145deg, rgba(20,83,45,0.12), rgba(5,46,22,0.08))' },
  { id: 'ocean',   label: 'Ocean',
    value: 'linear-gradient(145deg, rgba(12,74,110,0.12), rgba(15,23,42,0.08))' },
  { id: 'desert',  label: 'Desert',
    value: 'linear-gradient(145deg, rgba(146,64,14,0.12), rgba(69,26,3,0.08))' },
  { id: 'mountain',label: 'Mountain',
    value: 'linear-gradient(145deg, rgba(30,58,95,0.15), rgba(15,23,42,0.1))' },
]

const BG_IMAGES = [
  { id: 'safari1', label: 'Savanna',
    url: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=60' },
  { id: 'safari2', label: 'Elephants',
    url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&q=60' },
  { id: 'beach',   label: 'Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60' },
  { id: 'mtn',     label: 'Kilimanjaro',
    url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=60' },
  { id: 'jungle',  label: 'Jungle',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=60' },
  { id: 'stars',   label: 'Night Sky',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=60' },
]

const MSG_TYPES = [
  { value: 'inquiry',         label: 'General Inquiry',  icon: MessageSquare },
  { value: 'question',        label: 'Question',         icon: Info },
  { value: 'booking_request', label: 'Booking Request',  icon: BookOpen },
  { value: 'wish',            label: 'Special Wish',     icon: Sparkles },
]

const INFO_REQUEST_THEME_STYLES = {
  default: {
    header:  'bg-gradient-to-r from-emerald-600 to-emerald-700',
    accent:  '#059669',
    input:   'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100',
    btn:     'bg-emerald-600 hover:bg-emerald-700 text-white',
    wrap:    'bg-white border border-emerald-100',
  },
  elegant: {
    header:  'bg-gradient-to-r from-slate-800 to-slate-900',
    accent:  '#334155',
    input:   'border-slate-300 focus:border-slate-500 focus:ring-slate-100',
    btn:     'bg-slate-800 hover:bg-slate-900 text-white',
    wrap:    'bg-white border border-slate-200',
  },
  nature: {
    header:  'bg-gradient-to-r from-green-700 to-emerald-800',
    accent:  '#15803d',
    input:   'border-green-200 focus:border-green-400 focus:ring-green-100',
    btn:     'bg-green-700 hover:bg-green-800 text-white',
    wrap:    'bg-green-50 border border-green-200',
  },
  ocean: {
    header:  'bg-gradient-to-r from-blue-700 to-blue-900',
    accent:  '#1d4ed8',
    input:   'border-blue-200 focus:border-blue-400 focus:ring-blue-100',
    btn:     'bg-blue-700 hover:bg-blue-800 text-white',
    wrap:    'bg-blue-50 border border-blue-200',
  },
  sunset: {
    header:  'bg-gradient-to-r from-orange-600 to-red-700',
    accent:  '#ea580c',
    input:   'border-orange-200 focus:border-orange-400 focus:ring-orange-100',
    btn:     'bg-orange-600 hover:bg-orange-700 text-white',
    wrap:    'bg-orange-50 border border-orange-200',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtPrice = (price, currency = 'USD') => {
  if (!price && price !== 0) return 'Contact Us'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(price)
}

const fmtTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const fmtDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const parseJson = (val, fallback = []) => {
  if (!val) return fallback
  if (typeof val !== 'string') return Array.isArray(val) ? val : fallback
  try { return JSON.parse(val) } catch { return fallback }
}

const PREFS_KEY = 'altuvera_pkg_chat_prefs'

const loadLocalPrefs = () => {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  catch { return {} }
}
const saveLocalPrefs = (prefs) => {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch {}
}

// ── IMAGE GALLERY ─────────────────────────────────────────────────────────────

const ImageGallery = ({ images = [], cover, title }) => {
  const [idx, setIdx] = useState(0)
  const all = useMemo(() => {
    const parsed = parseJson(images)
    return cover ? [cover, ...parsed.filter(i => i !== cover)] : parsed
  }, [images, cover])

  if (!all.length) {
    return (
      <div className="h-80 sm:h-[480px] bg-gradient-to-br from-emerald-800 to-emerald-950
        flex items-center justify-center rounded-3xl">
        <Package size={64} className="text-emerald-300 opacity-50" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative h-80 sm:h-[480px] rounded-3xl overflow-hidden group">
        <img
          src={all[idx]} alt={`${title} ${idx + 1}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {all.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => (i - 1 + all.length) % all.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white
                flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setIdx(i => (i + 1) % all.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white
                flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {all.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${
                    i === idx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                  }`} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm
          text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
          <Camera size={12} /> {idx + 1} / {all.length}
        </div>
      </div>

      {/* Thumbnails */}
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {all.map((src, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`relative shrink-0 w-20 h-16 rounded-xl overflow-hidden
                transition-all duration-200 ${
                i === idx ? 'ring-2 ring-emerald-500 ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── INFO REQUEST FORM (rendered when admin sends a dynamic form) ───────────────

const InfoRequestForm = ({ infoRequest, pkg, user, onSubmit }) => {
  const theme  = infoRequest.theme || 'default'
  const styles = INFO_REQUEST_THEME_STYLES[theme] || INFO_REQUEST_THEME_STYLES.default
  const accent = infoRequest.accent_color || styles.accent

  const fields  = parseJson(infoRequest.fields || infoRequest.info_request_fields, [])
  const [values, setValues]   = useState({})
  const [errors, setErrors]   = useState({})
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)

  // Auto-fill logged-in user credentials
  useEffect(() => {
    if (!user) return
    const autofill = {}
    fields.forEach(f => {
      const label = (f.label || '').toLowerCase()
      if ((label.includes('name') || f.type === 'text') && !autofill[f.id]) {
        autofill[f.id] = user.fullName || user.full_name || user.name || ''
      }
      if (label.includes('email') || f.type === 'email') {
        autofill[f.id] = user.email || ''
      }
      if (label.includes('phone') || f.type === 'tel') {
        autofill[f.id] = user.phone || ''
      }
    })
    setValues(prev => ({ ...autofill, ...prev }))
  }, [user, fields.length])

  const handleChange = (id, val) => {
    setValues(p => ({ ...p, [id]: val }))
    setErrors(p => ({ ...p, [id]: '' }))
  }

  const validate = () => {
    const errs = {}
    fields.forEach(f => {
      if (f.required && !values[f.id]?.toString().trim()) {
        errs[f.id] = `${f.label} is required`
      }
      if (f.type === 'email' && values[f.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.id])) {
          errs[f.id] = 'Invalid email address'
        }
      }
    })
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSending(true)
    try {
      const reqId = infoRequest.info_request_id || infoRequest.id
      await packagesAPI.submitInfoResponse(pkg.id, reqId, values)
      setDone(true)
      onSubmit?.()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.error || 'Failed to submit. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className={`rounded-2xl overflow-hidden shadow-lg ${styles.wrap}`}>
        <div className={`${styles.header} p-5 text-white text-center`}>
          <CheckCircle size={32} className="mx-auto mb-2" />
          <h4 className="font-bold text-lg">Information Submitted!</h4>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-600">
            Thank you! We've received your information and will process your request shortly.
          </p>
        </div>
      </div>
    )
  }

  const renderField = (field) => {
    const base = `w-full px-4 py-3 rounded-xl border text-sm outline-none
      transition-all focus:ring-2 focus:ring-opacity-20 ${styles.input}`
    const err  = errors[field.id]
    const val  = values[field.id] || ''

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={val} onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder} rows={4}
            className={`${base} resize-none ${err ? 'border-red-400' : ''}`}
          />
        )
      case 'select':
        return (
          <select value={val} onChange={e => handleChange(field.id, e.target.value)}
            className={`${base} ${err ? 'border-red-400' : ''}`}>
            <option value="">Choose an option…</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-colors ${val === opt ? 'border-current bg-current' : 'border-slate-300'}`}
                  style={{ borderColor: val === opt ? accent : undefined,
                           backgroundColor: val === opt ? accent : undefined }}>
                  {val === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <input type="radio" className="sr-only"
                  checked={val === opt} onChange={() => handleChange(field.id, opt)} />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => handleChange(field.id, !val)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center
                cursor-pointer transition-all ${val ? 'border-current' : 'border-slate-300'}`}
              style={{ borderColor: val ? accent : undefined,
                       backgroundColor: val ? accent : undefined }}>
              {val && <Check size={12} className="text-white" />}
            </div>
            <span className="text-sm text-slate-700">{field.label}</span>
          </label>
        )
      case 'date':
        return (
          <input type="date" value={val}
            onChange={e => handleChange(field.id, e.target.value)}
            className={`${base} ${err ? 'border-red-400' : ''}`} />
        )
      default:
        return (
          <input
            type={field.type || 'text'} value={val}
            onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${base} ${err ? 'border-red-400' : ''}`}
          />
        )
    }
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${styles.wrap}`}>
      {/* Header */}
      <div className={`${styles.header} p-5 text-white`}>
        {infoRequest.header_image && (
          <img src={infoRequest.header_image} alt=""
            className="w-full h-24 object-cover rounded-xl mb-4" />
        )}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="font-bold text-lg leading-tight">{infoRequest.title}</h4>
            {infoRequest.description && (
              <p className="text-white/80 text-sm mt-1">{infoRequest.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Fields */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {errors._form && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={15} /> {errors._form}
          </div>
        )}

        {fields.map(field => (
          field.type === 'checkbox' ? (
            <div key={field.id}>
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
              )}
            </div>
          ) : (
            <div key={field.id}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
              )}
            </div>
          )
        ))}

        <button
          type="submit" disabled={sending}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center
            justify-center gap-2 transition-all ${styles.btn}
            ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {sending
            ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
            : <><Send size={15} /> Submit Information</>}
        </button>
      </form>
    </div>
  )
}

// ── CHAT PREFERENCES PANEL ────────────────────────────────────────────────────

const ChatPrefsPanel = ({ prefs, onChange, onClose, isAuthenticated }) => (
  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl
    border border-slate-100 z-30 overflow-hidden animate-in fade-in slide-in-from-top-2">
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 text-white">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm flex items-center gap-2"><Palette size={14} />Chat Theme</h4>
        <button onClick={onClose}><X size={14} /></button>
      </div>
    </div>

    <div className="p-4 space-y-4">
      {/* Theme */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color Theme</p>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.keys(CHAT_THEMES).map(t => (
            <button key={t}
              onClick={() => onChange('theme', t)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                prefs.theme === t ? 'border-emerald-400 bg-emerald-50' : 'border-transparent hover:bg-slate-50'
              }`}>
              <div className={`w-6 h-6 rounded-full ${
                { light: 'bg-slate-200', dark: 'bg-slate-800',
                  nature: 'bg-green-600', ocean: 'bg-blue-600', sunset: 'bg-orange-500' }[t]
              }`} />
              <span className="text-[9px] font-semibold text-slate-500 capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BG preset */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Background Gradient
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {BG_PRESETS.map(bg => (
            <button key={bg.id}
              onClick={() => onChange('bg_preset', bg.id)}
              className={`relative h-12 rounded-xl border overflow-hidden transition-all ${
                prefs.bg_preset === bg.id ? 'ring-2 ring-emerald-400' : 'hover:ring-1 ring-slate-200'
              }`}
              style={bg.value ? { background: bg.value } : { background: '#f8fafc' }}>
              <span className="absolute inset-0 flex items-center justify-center
                text-[9px] font-bold text-slate-700 bg-white/40 backdrop-blur-sm">
                {bg.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BG images */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Background Image
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ id: 'none-img', label: 'None', url: '' }, ...BG_IMAGES].map(img => (
            <button key={img.id}
              onClick={() => onChange('bg_image', img.url)}
              className={`relative h-14 rounded-xl border overflow-hidden transition-all ${
                prefs.bg_image === img.url ? 'ring-2 ring-emerald-400' : 'hover:ring-1 ring-slate-200'
              }`}
              style={img.url
                ? { backgroundImage: `url(${img.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: '#f1f5f9' }
              }>
              <span className="absolute inset-0 flex items-center justify-center
                text-[9px] font-bold text-white bg-black/30">
                {img.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!isAuthenticated && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200
          rounded-lg px-3 py-2 text-center">
          Sign in to save your theme preferences
        </p>
      )}
    </div>
  </div>
)

// ── BOOKING FORM ──────────────────────────────────────────────────────────────

const BookingPanel = ({ pkg, user, onSuccess }) => {
  const [form, setForm] = useState({
    guest_name:      user?.fullName || user?.full_name || user?.name || '',
    guest_email:     user?.email || '',
    guest_phone:     user?.phone || '',
    travelers_count: 1, adults: 1, children: 0,
    travel_date: '', end_date: '', special_requests: '',
    dietary_needs: '', pickup_location: '',
  })
  const [sending, setSending]   = useState(false)
  const [errors,  setErrors]    = useState({})
  const [success, setSuccess]   = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  // Sync user data if they log in after component mounts
  useEffect(() => {
    if (!user) return
    setForm(p => ({
      ...p,
      guest_name:  p.guest_name  || user.fullName || user.full_name || user.name || '',
      guest_email: p.guest_email || user.email || '',
      guest_phone: p.guest_phone || user.phone || '',
    }))
  }, [user?.id])

  const upd = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })) }

  const totalTravelers = (parseInt(form.adults) || 1) + (parseInt(form.children) || 0)
  const estimatedPrice = pkg.price * totalTravelers

  const validate = () => {
    const e = {}
    if (!form.guest_name?.trim())  e.guest_name  = 'Name is required'
    if (!form.guest_email?.trim()) e.guest_email = 'Email is required'
    if (form.guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email)) {
      e.guest_email = 'Invalid email'
    }
    if (!form.travel_date) e.travel_date = 'Travel date is required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSending(true)
    try {
      const { data } = await packagesAPI.createBooking(pkg.id, {
        ...form,
        travelers_count: totalTravelers,
        total_price: estimatedPrice,
      })
      setSuccess(true)
      setBookingRef(data.data?.booking_ref || '')
      onSuccess?.()
    } catch (err) {
      setErrors({ _form: err?.response?.data?.error || 'Failed to submit booking.' })
    } finally { setSending(false) }
  }

  if (success) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Request Sent!</h3>
        {bookingRef && (
          <p className="text-sm font-mono bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl
            inline-block mb-3">
            Ref: {bookingRef}
          </p>
        )}
        <p className="text-slate-500 text-sm mb-6">
          We'll review your request and get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSuccess(false); setBookingRef('') }}
          className="text-sm text-emerald-600 hover:underline font-semibold"
        >
          Make another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors._form && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} /> {errors._form}
        </div>
      )}

      {/* Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">
            Full Name *
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={form.guest_name}
              onChange={e => upd('guest_name', e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none
                focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all
                ${errors.guest_name ? 'border-red-400' : 'border-slate-200'}`}
              placeholder="Your name"
            />
          </div>
          {errors.guest_name && <p className="text-xs text-red-500 mt-1">{errors.guest_name}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Email *</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email" value={form.guest_email}
              onChange={e => upd('guest_email', e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none
                focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all
                ${errors.guest_email ? 'border-red-400' : 'border-slate-200'}`}
              placeholder="you@email.com"
            />
          </div>
          {errors.guest_email && <p className="text-xs text-red-500 mt-1">{errors.guest_email}</p>}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone</label>
        <div className="relative">
          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel" value={form.guest_phone}
            onChange={e => upd('guest_phone', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none
              focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      {/* Travel date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Travel Date *</label>
          <input
            type="date" value={form.travel_date}
            onChange={e => upd('travel_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none
              focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all
              ${errors.travel_date ? 'border-red-400' : 'border-slate-200'}`}
          />
          {errors.travel_date && <p className="text-xs text-red-500 mt-1">{errors.travel_date}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Return Date</label>
          <input
            type="date" value={form.end_date}
            onChange={e => upd('end_date', e.target.value)}
            min={form.travel_date || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none
              focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* Travelers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Adults</label>
          <input
            type="number" min="1" max={pkg.max_travelers || 99} value={form.adults}
            onChange={e => upd('adults', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none
              focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Children</label>
          <input
            type="number" min="0" value={form.children}
            onChange={e => upd('children', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none
              focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* Special requests */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Special Requests</label>
        <textarea
          value={form.special_requests}
          onChange={e => upd('special_requests', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none
            focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all resize-none"
          placeholder="Dietary needs, accessibility, preferred room type…"
        />
      </div>

      {/* Price estimate */}
      {pkg.is_price_visible !== false && pkg.price > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">
              {fmtPrice(pkg.price, pkg.currency)} × {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-emerald-700">{fmtPrice(estimatedPrice, pkg.currency)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">*Estimated total. Final price confirmed by our team.</p>
        </div>
      )}

      <button
        type="submit" disabled={sending}
        className={`w-full py-4 rounded-xl font-bold text-sm text-white
          flex items-center justify-center gap-2 transition-all
          bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100
          ${sending ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-xl'}`}
      >
        {sending
          ? <><Loader2 size={16} className="animate-spin" /> Sending Request…</>
          : <><BookOpen size={15} /> Request Booking</>}
      </button>

      <p className="text-center text-xs text-slate-400">
        <Shield size={10} className="inline mr-1" />
        No payment required now. We'll confirm availability first.
      </p>
    </form>
  )
}

// ── PACKAGE CHAT ──────────────────────────────────────────────────────────────

const PackageChat = ({ pkg, user, isAuthenticated }) => {
  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)

  // Prefs
  const [prefs, setPrefs]         = useState(() => ({
    theme: 'light', bg_preset: 'none', bg_image: '', ...loadLocalPrefs()
  }))
  const [prefsOpen, setPrefsOpen] = useState(false)

  // Messages
  const [messages,  setMessages]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [sending,   setSending]   = useState(false)
  const [body,      setBody]      = useState('')
  const [msgType,   setMsgType]   = useState('inquiry')
  const [guestName, setGuestName] = useState('')
  const [guestEmail,setGuestEmail]= useState('')
  const [showIntro, setShowIntro] = useState(true)
  const [infoResponded, setInfoResponded] = useState(new Set())

  const themeStyles = CHAT_THEMES[prefs.theme] || CHAT_THEMES.light

  // Chat background style
  const chatBgStyle = useMemo(() => {
    const style = {}
    if (prefs.bg_image) {
      style.backgroundImage = `url(${prefs.bg_image})`
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
    } else {
      const preset = BG_PRESETS.find(b => b.id === prefs.bg_preset)
      if (preset?.value) style.background = preset.value
    }
    return style
  }, [prefs.bg_image, prefs.bg_preset])

  // Handle prefs change
  const handlePrefChange = useCallback((key, val) => {
    setPrefs(p => {
      const next = { ...p, [key]: val }
      saveLocalPrefs(next)
      // If authenticated, save to server too (fire and forget)
      if (isAuthenticated) {
        packagesAPI.saveChatPreferences?.(next).catch(() => {})
      }
      return next
    })
  }, [isAuthenticated])

  // Load messages (only for authenticated users — history)
  const loadMessages = useCallback(async () => {
    if (!isAuthenticated || !pkg?.id) return
    setLoading(true)
    try {
      const { data } = await packagesAPI.getMessages(pkg.id)
      setMessages(data.data || [])
    } catch (e) {
      console.error('[Chat] load messages error:', e)
    } finally {
      setLoading(false)
    }
  }, [pkg?.id, isAuthenticated])

  useEffect(() => {
    loadMessages()
    // Load server chat prefs if authenticated
    if (isAuthenticated) {
      packagesAPI.getChatPreferences?.()
        .then(({ data }) => {
          if (data.data) {
            const serverPrefs = data.data
            setPrefs(p => {
              const merged = { ...p, ...serverPrefs }
              saveLocalPrefs(merged)
              return merged
            })
          }
        })
        .catch(() => {})
    }
  }, [loadMessages, isAuthenticated])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const trimmed = body.trim()
    if (!trimmed) return

    // Guest validation
    if (!isAuthenticated) {
      if (!guestName.trim()) {
        alert('Please enter your name.')
        return
      }
      if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        alert('Please enter a valid email.')
        return
      }
    }

    setSending(true)
    try {
      const { data } = await packagesAPI.sendMessage(pkg.id, {
        body: trimmed,
        message_type: msgType,
        sender_name:  guestName  || user?.fullName || user?.name,
        sender_email: guestEmail || user?.email,
      })

      if (data.data) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === data.data.id)
          return exists ? prev : [...prev, data.data]
        })
      }

      setBody('')
      setShowIntro(false)
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleInfoResponded = (reqId) => {
    setInfoResponded(prev => new Set([...prev, reqId]))
    loadMessages()
  }

  const MessageBubble = ({ msg }) => {
    const isUser  = msg.sender_type === 'user' || msg.sender_type === 'guest'
    const isAdmin = msg.sender_type === 'admin'
    const isInfo  = msg.message_type === 'info_request'
    const isInfoRes = msg.message_type === 'info_response'

    const reqId = msg.metadata?.info_request_id || null
    const alreadyResponded = reqId && infoResponded.has(String(reqId))

    return (
      <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
          text-xs font-bold shrink-0 self-end ${
          isAdmin ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isAdmin ? 'A' : (msg.sender_name?.[0] || 'U').toUpperCase()}
        </div>

        <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Name + time */}
          <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
            <span className={`text-[11px] font-semibold ${themeStyles.name}`}>
              {isAdmin ? 'Altuvera Team' : msg.sender_name || 'You'}
            </span>
            <span className={`text-[10px] ${themeStyles.timestamp}`}>
              {fmtTime(msg.created_at)}
            </span>
          </div>

          {/* Info request form */}
          {isInfo && (
            <div className="w-full max-w-sm">
              {alreadyResponded || msg.info_request_status === 'responded' ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200
                  rounded-2xl text-sm text-emerald-700">
                  <CheckCircle size={16} /> Information submitted successfully
                </div>
              ) : (
                <InfoRequestForm
                  infoRequest={{
                    ...msg,
                    info_request_id: reqId,
                    fields: msg.info_request_fields,
                    theme: msg.info_request_theme || 'default',
                    accent_color: msg.info_request_accent,
                    status: msg.info_request_status,
                  }}
                  pkg={pkg}
                  user={user}
                  onSubmit={() => handleInfoResponded(String(reqId))}
                />
              )}
            </div>
          )}

          {/* Info response bubble */}
          {isInfoRes && (
            <div className={`px-4 py-3 rounded-2xl ${
              isUser ? themeStyles.userBubble : themeStyles.adminBubble
            } text-sm`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="font-semibold text-xs opacity-80">Information Submitted</span>
              </div>
              <p className="opacity-90">{msg.body}</p>
            </div>
          )}

          {/* Normal message */}
          {!isInfo && !isInfoRes && (
            <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
              isUser ? themeStyles.userBubble
                : isAdmin ? themeStyles.adminBubble
                : themeStyles.adminBubble
            }`}>
              {msg.message_type && msg.message_type !== 'reply' && (
                <span className={`inline-block text-[9px] font-black uppercase tracking-widest
                  opacity-70 mb-1.5 ${isUser ? 'text-white/80' : ''}`}>
                  {MSG_TYPES.find(t => t.value === msg.message_type)?.label || msg.message_type}
                </span>
              )}
              <p>{msg.body}</p>
            </div>
          )}

          {/* Date */}
          <span className={`text-[10px] mt-1 ${themeStyles.timestamp}`}>
            {fmtDate(msg.created_at)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col rounded-3xl overflow-hidden shadow-xl
      border border-slate-200 ${themeStyles.wrap}`}
      style={{ height: '600px' }}>

      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between shrink-0 ${themeStyles.header}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">Ask About This Package</h4>
            <p className="text-xs text-slate-500">We typically reply within a few hours</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button onClick={loadMessages}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center
                text-slate-500 transition-colors">
              <RefreshCw size={13} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setPrefsOpen(p => !p)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center
                text-slate-500 transition-colors"
            >
              <Palette size={13} />
            </button>
            {prefsOpen && (
              <ChatPrefsPanel
                prefs={prefs}
                onChange={handlePrefChange}
                onClose={() => setPrefsOpen(false)}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        className={`flex-1 overflow-y-auto p-4 ${themeStyles.messages}`}
        style={chatBgStyle}
      >
        {/* Intro / welcome message */}
        {showIntro && !messages.length && !loading && (
          <div className="flex gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center
              text-xs font-bold text-white shrink-0">A</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Altuvera Team</span>
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm ${themeStyles.adminBubble}`}>
                <p className="font-semibold mb-1">👋 Hi there!</p>
                <p>
                  Welcome to the <strong>{pkg.title}</strong> package page.
                  Feel free to ask any questions, request a booking, or share your
                  travel wishes — we're here to help make your dream trip a reality!
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {MSG_TYPES.map(t => (
                    <button key={t.value}
                      onClick={() => setMsgType(t.value)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full
                        border transition-all ${
                        msgType === t.value
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-slate-200 text-slate-500 hover:border-emerald-300'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-emerald-500" />
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Guest name/email inputs (only if not logged in and no messages yet) */}
      {!isAuthenticated && (
        <div className={`px-4 pt-3 pb-0 space-y-2 border-t ${themeStyles.input} border-opacity-50`}>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={guestName} onChange={e => setGuestName(e.target.value)}
              placeholder="Your name *"
              className={`px-3 py-2 rounded-xl border text-xs outline-none ${themeStyles.input} ${themeStyles.inputText}`}
            />
            <input
              type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
              placeholder="Email *"
              className={`px-3 py-2 rounded-xl border text-xs outline-none ${themeStyles.input} ${themeStyles.inputText}`}
            />
          </div>
        </div>
      )}

      {/* Message type selector */}
      <div className={`px-4 pt-3 flex gap-1.5 overflow-x-auto scrollbar-hide border-t ${
        prefs.theme === 'dark' ? 'border-slate-700' : 'border-slate-100'
      }`}>
        {MSG_TYPES.map(t => (
          <button key={t.value}
            onClick={() => setMsgType(t.value)}
            className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full
              border transition-all ${
              msgType === t.value
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : `border-slate-200 ${prefs.theme === 'dark' ? 'text-slate-400 border-slate-600' : 'text-slate-500'}
                   hover:border-emerald-300`
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className={`px-4 pb-4 pt-2 flex items-end gap-2 shrink-0`}>
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            msgType === 'booking_request'
              ? 'Describe your ideal trip dates, group size…'
              : msgType === 'question'
              ? 'What would you like to know?'
              : msgType === 'wish'
              ? 'Share your special request or wish…'
              : 'Type your message…'
          }
          rows={2}
          className={`flex-1 px-4 py-3 rounded-2xl border text-sm outline-none
            focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400
            transition-all resize-none ${themeStyles.input} ${themeStyles.inputText}`}
        />
        <button
          onClick={handleSend} disabled={sending || !body.trim()}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center
            transition-all shrink-0 ${themeStyles.sendBtn}
            ${(!body.trim() || sending) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          {sending
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function PackageDetail() {
  const { slug }    = useParams()
  const navigate    = useNavigate()
  const { user, isAuthenticated } = useUserAuth()

  const [pkg,        setPkg]        = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('overview') // overview|itinerary|inclusions|faqs
  const [sidePanel,  setSidePanel]  = useState('chat')     // chat|booking
  const [wishlist,   setWishlist]   = useState(false)

  // Derived
  const images      = useMemo(() => parseJson(pkg?.images),        [pkg?.images])
  const features    = useMemo(() => parseJson(pkg?.features),      [pkg?.features])
  const inclusions  = useMemo(() => parseJson(pkg?.inclusions),    [pkg?.inclusions])
  const exclusions  = useMemo(() => parseJson(pkg?.exclusions),    [pkg?.exclusions])
  const highlights  = useMemo(() => parseJson(pkg?.highlights),    [pkg?.highlights])
  const itinerary   = useMemo(() => parseJson(pkg?.itinerary),     [pkg?.itinerary])
  const faqs        = useMemo(() => parseJson(pkg?.faqs),          [pkg?.faqs])
  const pricingTiers= useMemo(() => parseJson(pkg?.pricing_tiers), [pkg?.pricing_tiers])
  const hasDisc     = pkg?.discount_percent > 0
  const origPrice   = hasDisc ? pkg.price / (1 - pkg.discount_percent / 100) : null

  // Load
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    const fn = /^\d+$/.test(slug)
      ? () => packagesAPI.getById(slug)
      : () => packagesAPI.getBySlug(slug)

    fn()
      .then(({ data }) => {
        setPkg(data.data)
        // Check wishlist
        try {
          const saved = JSON.parse(localStorage.getItem('altuvera_wishlist') || '[]')
          setWishlist(saved.includes(data.data?.id))
        } catch {}
      })
      .catch(err => {
        if (err?.response?.status === 404) setError('Package not found')
        else setError('Failed to load package')
      })
      .finally(() => setLoading(false))
  }, [slug])

  const toggleWishlist = () => {
    if (!pkg) return
    setWishlist(w => {
      const next = !w
      try {
        const saved = JSON.parse(localStorage.getItem('altuvera_wishlist') || '[]')
        const updated = next ? [...new Set([...saved, pkg.id])] : saved.filter(i => i !== pkg.id)
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
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => {})
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading package details…</p>
        </div>
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Package size={64} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">{error || 'Package not found'}</h2>
          <p className="text-slate-400 mb-6">The package you're looking for doesn't exist or is unavailable.</p>
          <Link to="/packages"
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl
              hover:bg-emerald-700 transition-colors inline-flex items-center gap-2">
            <ChevronLeft size={16} /> Back to Packages
          </Link>
        </div>
      </div>
    )
  }

  const accent = pkg.accent_color || '#047857'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/packages" className="hover:text-emerald-600 transition-colors">Packages</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{pkg.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT / MAIN CONTENT ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Gallery */}
            <ImageGallery
              images={pkg.images}
              cover={pkg.cover_image_url}
              title={pkg.title}
            />

            {/* Title block */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {pkg.category && (
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${accent}15`, color: accent }}>
                    {pkg.category}
                  </span>
                )}
                {pkg.badge_label && (
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1
                    rounded-full text-white" style={{ backgroundColor: pkg.badge_color || accent }}>
                    {pkg.badge_label}
                  </span>
                )}
                {pkg.is_featured && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600
                    bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <Star size={11} className="fill-amber-500" /> Featured
                  </span>
                )}
                {pkg.is_sold_out && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    Sold Out
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight mb-3">
                {pkg.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-5">
                {pkg.destination && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-500" /> {pkg.destination}
                  </span>
                )}
                {pkg.country && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-300">·</span> {pkg.country}
                  </span>
                )}
                {pkg.duration_days && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-500" />
                    {pkg.duration_days} days
                    {pkg.duration_nights && ` / ${pkg.duration_nights} nights`}
                  </span>
                )}
                {pkg.max_travelers && (
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-emerald-500" />
                    Max {pkg.max_travelers} travelers
                  </span>
                )}
              </div>

              {/* Action row */}
              <div className="flex items-center gap-3">
                <button onClick={toggleWishlist}
                  className={`flex items-center gap-1.5 text-sm font-semibold
                    px-4 py-2 rounded-xl border transition-all ${
                    wishlist
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}>
                  <Heart size={15} className={wishlist ? 'fill-red-500' : ''} />
                  {wishlist ? 'Saved' : 'Save'}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm font-semibold
                    px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                  <Share2 size={15} /> Share
                </button>
              </div>

              {/* Short description */}
              {pkg.short_description && (
                <p className="mt-5 text-slate-600 leading-relaxed text-base">
                  {pkg.short_description}
                </p>
              )}
            </div>

            {/* Highlights (if any) */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles size={18} style={{ color: accent }} /> Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accent}15` }}>
                        <Check size={12} style={{ color: accent }} />
                      </div>
                      <span className="text-sm text-slate-700">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features pills */}
            {features.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Package Features</h2>
                <div className="flex flex-wrap gap-2">
                  {features.map((f, i) => (
                    <span key={i}
                      className="flex items-center gap-2 text-sm font-medium px-4 py-2
                        rounded-full border"
                      style={{ borderColor: `${accent}30`, color: accent,
                               backgroundColor: `${accent}08` }}>
                      <Check size={13} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs: Overview | Itinerary | Inclusions | FAQs */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex overflow-x-auto border-b border-slate-100">
                {[
                  { id: 'overview',    label: 'Overview' },
                  { id: 'itinerary',   label: `Itinerary${itinerary.length ? ` (${itinerary.length})` : ''}` },
                  { id: 'inclusions',  label: 'What\'s Included' },
                  { id: 'faqs',        label: `FAQs${faqs.length ? ` (${faqs.length})` : ''}` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">

                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="prose prose-slate max-w-none">
                    {pkg.description
                      ? <div dangerouslySetInnerHTML={{ __html: pkg.description }} />
                      : pkg.content
                      ? <div dangerouslySetInnerHTML={{ __html: pkg.content }} />
                      : <p className="text-slate-400 italic">No description available.</p>
                    }
                  </div>
                )}

                {/* Itinerary */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    {itinerary.length === 0 && (
                      <p className="text-slate-400 italic text-center py-6">
                        No itinerary added yet.
                      </p>
                    )}
                    {itinerary.map((day, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="w-10 h-10 rounded-xl font-black text-sm
                            flex items-center justify-center text-white"
                            style={{ backgroundColor: accent }}>
                            {day.day || i + 1}
                          </div>
                          {i < itinerary.length - 1 && (
                            <div className="w-0.5 flex-1 my-2 bg-slate-200" />
                          )}
                        </div>
                        <div className="pb-4 flex-1">
                          <h4 className="font-bold text-slate-800 mb-1">{day.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{day.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inclusions & Exclusions */}
                {activeTab === 'inclusions' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        Included
                      </h3>
                      {inclusions.length === 0 && (
                        <p className="text-slate-400 italic text-sm">Not specified</p>
                      )}
                      <ul className="space-y-2">
                        {inclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <XCircle size={18} className="text-red-400" />
                        Not Included
                      </h3>
                      {exclusions.length === 0 && (
                        <p className="text-slate-400 italic text-sm">Not specified</p>
                      )}
                      <ul className="space-y-2">
                        {exclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* FAQs */}
                {activeTab === 'faqs' && (
                  <div className="space-y-3">
                    {faqs.length === 0 && (
                      <p className="text-slate-400 italic text-center py-6">No FAQs added yet.</p>
                    )}
                    {faqs.map((faq, i) => (
                      <FaqItem key={i} faq={faq} accent={accent} />
                    ))}
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-6">

            {/* Pricing card (sticky) */}
            <div className="sticky top-24 space-y-4">

              {/* Price + toggle */}
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                {pkg.is_price_visible !== false ? (
                  <>
                    {hasDisc && (
                      <p className="text-sm text-slate-400 line-through">
                        {fmtPrice(origPrice, pkg.currency)}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-black"
                        style={{ color: accent }}>
                        {fmtPrice(pkg.price, pkg.currency)}
                      </span>
                      {hasDisc && (
                        <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          -{pkg.discount_percent}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{pkg.price_label || 'per person'}</p>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-2xl font-black text-slate-700">Price on Request</p>
                    <p className="text-xs text-slate-400 mt-1">Contact us for pricing</p>
                  </div>
                )}

                {/* Pricing tiers */}
                {pricingTiers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing Options</p>
                    {pricingTiers.map((tier, i) => (
                      <div key={i}
                        className="flex items-center justify-between px-3 py-2.5
                          bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{tier.label}</p>
                          {tier.description && (
                            <p className="text-xs text-slate-400">{tier.description}</p>
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
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
                  {pkg.duration_days && (
                    <div className="text-center p-3 bg-slate-50 rounded-2xl">
                      <Clock size={18} className="mx-auto mb-1" style={{ color: accent }} />
                      <p className="text-lg font-black text-slate-800">{pkg.duration_days}</p>
                      <p className="text-xs text-slate-400">Days</p>
                    </div>
                  )}
                  {pkg.max_travelers && (
                    <div className="text-center p-3 bg-slate-50 rounded-2xl">
                      <Users size={18} className="mx-auto mb-1" style={{ color: accent }} />
                      <p className="text-lg font-black text-slate-800">{pkg.max_travelers}</p>
                      <p className="text-xs text-slate-400">Max People</p>
                    </div>
                  )}
                </div>

                {/* Availability note */}
                {pkg.availability_note && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50
                    border border-amber-100 rounded-xl">
                    <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">{pkg.availability_note}</p>
                  </div>
                )}

                {/* Panel toggle */}
                <div className="flex mt-5 bg-slate-100 rounded-2xl p-1">
                  {[
                    { id: 'chat',    label: 'Ask Us',    icon: MessageSquare },
                    { id: 'booking', label: 'Book Now',  icon: BookOpen },
                  ].map(tab => (
                    <button key={tab.id}
                      onClick={() => setSidePanel(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2
                        text-sm font-bold py-2.5 rounded-xl transition-all ${
                        sidePanel === tab.id
                          ? 'bg-white shadow-md text-slate-800'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}>
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat panel */}
              {sidePanel === 'chat' && (
                <PackageChat
                  pkg={pkg}
                  user={user}
                  isAuthenticated={isAuthenticated}
                />
              )}

              {/* Booking panel */}
              {sidePanel === 'booking' && (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <BookOpen size={18} style={{ color: accent }} />
                    Request Booking
                  </h3>
                  {pkg.is_sold_out ? (
                    <div className="text-center py-6">
                      <XCircle size={40} className="text-red-400 mx-auto mb-3" />
                      <p className="font-bold text-slate-700">This package is sold out</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Contact us to join the waitlist.
                      </p>
                      <button
                        onClick={() => setSidePanel('chat')}
                        className="mt-4 text-sm font-semibold text-emerald-600 hover:underline">
                        Chat with us →
                      </button>
                    </div>
                  ) : (
                    <BookingPanel
                      pkg={pkg}
                      user={user}
                      onSuccess={() => {}}
                    />
                  )}
                </div>
              )}

              {/* Trust badges */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    { icon: Shield,       text: 'Secure Booking' },
                    { icon: CheckCircle,  text: 'Verified Packages' },
                    { icon: Users,        text: 'Expert Guides' },
                    { icon: Star,         text: '5-Star Rated' },
                  ].map(({ icon: Ic, text }) => (
                    <div key={text} className="flex flex-col items-center gap-1.5 p-2">
                      <Ic size={18} style={{ color: accent }} />
                      <span className="text-xs font-semibold text-slate-600">{text}</span>
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

// ── FAQ Item (accordion) ──────────────────────────────────────────────────────

function FaqItem({ faq, accent }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4
          hover:bg-slate-50 transition-colors text-left gap-3"
      >
        <span className="font-semibold text-slate-800 text-sm">{faq.question || faq.title}</span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
          style={{ borderColor: `${accent}20` }}>
          {faq.answer || faq.content}
        </div>
      )}
    </div>
  )
}