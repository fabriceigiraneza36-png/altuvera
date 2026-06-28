import React, { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useUserAuth } from '../../context/UserAuthContext'
import DashboardLayout from '../../components/auth/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCalendar, FiMapPin, FiUsers, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiRefreshCw, FiSearch, FiFilter,
  FiShield, FiUser,
} from 'react-icons/fi'

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE =
  import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'

const TOKEN_KEY = 'altuvera_auth_token'

// Days until a booking is considered "upcoming soon" for highlighting
const UPCOMING_THRESHOLD_DAYS = 7

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY)   ||
      sessionStorage.getItem(TOKEN_KEY) ||
      null
    )
  } catch { return null }
}

const daysUntil = (dateStr) => {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const formatShortDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label:   'Pending Review',
    color:   '#f59e0b',
    bg:      '#fffbeb',
    border:  '#fde68a',
    icon:    <FiClock size={14} />,
  },
  confirmed: {
    label:   'Confirmed',
    color:   '#059669',
    bg:      '#f0fdf4',
    border:  '#bbf7d0',
    icon:    <FiCheckCircle size={14} />,
  },
  completed: {
    label:   'Completed',
    color:   '#0891b2',
    bg:      '#f0f9ff',
    border:  '#bae6fd',
    icon:    <FiCheckCircle size={14} />,
  },
  cancelled: {
    label:   'Cancelled',
    color:   '#dc2626',
    bg:      '#fef2f2',
    border:  '#fecaca',
    icon:    <FiXCircle size={14} />,
  },
  'on-hold': {
    label:   'On Hold',
    color:   '#7c3aed',
    bg:      '#faf5ff',
    border:  '#ddd6fe',
    icon:    <FiAlertCircle size={14} />,
  },
}

const getStatusCfg = (status) =>
  STATUS_CONFIG[status] || {
    label: status, color: '#64748b', bg: '#f8fafc',
    border: '#e2e8f0', icon: <FiClock size={14} />,
  }

// ─── Source badge ─────────────────────────────────────────────────────────────
// Clearly distinguishes admin-created bookings from user-created ones
const SourceBadge = ({ source }) => {
  const isAdminCreated =
    source === 'admin_manual' ||
    source === 'admin'        ||
    String(source || '').includes('admin')

  if (!isAdminCreated) return null

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          4,
      fontSize:     10,
      fontWeight:   700,
      color:        '#7c3aed',
      background:   '#faf5ff',
      border:       '1px solid #ddd6fe',
      borderRadius: 6,
      padding:      '2px 7px',
      textTransform:'uppercase',
      letterSpacing: '0.04em',
    }}>
      <FiShield size={9} />
      Admin Created
    </span>
  )
}

// ─── Proximity banner ─────────────────────────────────────────────────────────
const ProximityBanner = ({ days, destination }) => {
  if (days === null || days < 0) return null

  const cfg =
    days === 0 ? { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', emoji: '🛫', msg: `Your trip to ${destination || 'your destination'} is TODAY!` } :
    days === 1 ? { bg: '#fff7ed', border: '#fed7aa', color: '#9a3412', emoji: '✈️', msg: `Trip to ${destination || 'your destination'} is TOMORROW!` } :
    days <= 3  ? { bg: '#fffbeb', border: '#fde68a', color: '#92400e', emoji: '⏰', msg: `${days} days until your trip to ${destination || 'your destination'}` } :
    days <= 7  ? { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', emoji: '🗓️', msg: `${days} days until your trip to ${destination || 'your destination'}` } :
    null

  if (!cfg) return null

  return (
    <div style={{
      padding:      '8px 14px',
      background:   cfg.bg,
      border:       `1px solid ${cfg.border}`,
      borderRadius: 10,
      marginBottom: 12,
      display:      'flex',
      alignItems:   'center',
      gap:          8,
    }}>
      <span style={{ fontSize: 18 }}>{cfg.emoji}</span>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: cfg.color }}>
        {cfg.msg}
      </p>
    </div>
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, isAdminCreated }) => {
  const [expanded, setExpanded] = useState(false)
  const status = getStatusCfg(booking.status)
  const days   = daysUntil(booking.travel_date)
  const isUpcoming = days !== null && days >= 0 && days <= UPCOMING_THRESHOLD_DAYS

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{    opacity: 0, y: -8 }}
      style={{
        background:   '#fff',
        borderRadius: 20,
        border:       `1.5px solid ${isUpcoming && booking.status === 'confirmed' ? '#bbf7d0' : '#e2e8f0'}`,
        overflow:     'hidden',
        boxShadow:    isUpcoming && booking.status === 'confirmed'
          ? '0 4px 20px rgba(5,150,105,0.10)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: 16,
        transition:   'box-shadow 0.2s',
      }}
    >
      {/* Admin-created indicator strip */}
      {isAdminCreated && (
        <div style={{
          height:     4,
          background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
        }} />
      )}

      {/* Upcoming trip banner */}
      {isUpcoming && booking.status === 'confirmed' && (
        <div style={{ padding: '12px 20px 0' }}>
          <ProximityBanner
            days={days}
            destination={booking.destination_name}
          />
        </div>
      )}

      {/* Card main */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
          flexWrap:       'wrap',
          gap:            12,
        }}>
          {/* Left: booking number + badges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily:  'monospace',
                fontSize:    15,
                fontWeight:  800,
                color:       '#059669',
                letterSpacing: '0.05em',
              }}>
                {booking.booking_number || `#${booking.id}`}
              </span>
              <SourceBadge source={booking.source} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{
                display:    'inline-flex',
                alignItems: 'center',
                gap:        5,
                padding:    '4px 10px',
                borderRadius: 8,
                fontSize:   12,
                fontWeight: 700,
                color:      status.color,
                background: status.bg,
                border:     `1px solid ${status.border}`,
              }}>
                {status.icon} {status.label}
              </span>
            </div>
          </div>

          {/* Right: toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              background:   '#f8fafc',
              border:       '1px solid #e2e8f0',
              borderRadius: 10,
              padding:      '8px 16px',
              fontSize:     13,
              fontWeight:   600,
              color:        '#374151',
              cursor:       'pointer',
              transition:   'all 0.2s',
            }}
          >
            {expanded ? 'Less ↑' : 'Details ↓'}
          </button>
        </div>

        {/* Summary row */}
        <div style={{
          display:   'flex',
          gap:       20,
          marginTop: 16,
          flexWrap:  'wrap',
        }}>
          {booking.destination_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiMapPin size={14} color="#059669" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                {booking.destination_name}
              </span>
            </div>
          )}
          {booking.travel_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiCalendar size={14} color="#0891b2" />
              <span style={{ fontSize: 14, color: '#475569' }}>
                {formatShortDate(booking.travel_date)}
                {booking.return_date && ` → ${formatShortDate(booking.return_date)}`}
              </span>
            </div>
          )}
          {booking.number_of_travelers && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiUsers size={14} color="#7c3aed" />
              <span style={{ fontSize: 14, color: '#475569' }}>
                {booking.number_of_travelers} traveler{booking.number_of_travelers !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Admin-created notice */}
        {isAdminCreated && (
          <div style={{
            marginTop:    14,
            padding:      '10px 14px',
            background:   '#faf5ff',
            border:       '1px solid #ddd6fe',
            borderRadius: 10,
            display:      'flex',
            gap:          8,
            alignItems:   'flex-start',
          }}>
            <FiShield size={15} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>
                Created by Altuvera Team
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6d28d9', lineHeight: 1.5 }}>
                This booking was arranged on your behalf by our travel team.
                Contact us if you have any questions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding:    '0 24px 24px',
              borderTop:  '1px solid #f1f5f9',
              paddingTop: 16,
            }}>
              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap:                 16,
              }}>
                <DetailField label="Full Name"         value={booking.full_name} />
                <DetailField label="Email"             value={booking.email} />
                <DetailField label="Phone"             value={booking.phone || '—'} />
                <DetailField label="Accommodation"     value={booking.accommodation_type || '—'} />
                <DetailField label="Country"           value={booking.country_name || '—'} />
                <DetailField label="Service"           value={booking.service_name || '—'} />
                <DetailField label="Travel Date"       value={formatDate(booking.travel_date)} />
                <DetailField label="Return Date"       value={formatDate(booking.return_date)} />
                <DetailField label="Booking Date"      value={formatDate(booking.created_at)} />
                <DetailField label="Payment Status"    value={booking.payment_status || '—'} />
              </div>

              {booking.special_requests && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Special Requests
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6, background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    {booking.special_requests}
                  </p>
                </div>
              )}

              {booking.admin_notes && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Notes from Altuvera Team
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: '#6d28d9', lineHeight: 1.6, background: '#faf5ff', padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd6fe' }}>
                    {booking.admin_notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const DetailField = ({ label, value }) => (
  <div>
    <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </p>
    <p style={{ margin: 0, fontSize: 14, color: '#0f172a', fontWeight: 500 }}>
      {value || '—'}
    </p>
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyBookings() {
  const { user, authFetch } = useUserAuth()

  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')  // all | self | admin | upcoming
  const [page,      setPage]      = useState(1)
  const [totalPages,setTotalPages]= useState(1)
  const [total,     setTotal]     = useState(0)

  const LIMIT = 10

  // ── Fetch bookings ─────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page:  pageNum,
        limit: LIMIT,
      })
      if (filter === 'upcoming') params.set('status', 'confirmed')

      const data = await authFetch(`/bookings/my-bookings?${params}`)
      const rows = data?.data || data?.bookings || []

      setBookings(pageNum === 1 ? rows : prev => [...prev, ...rows])
      setTotal(data?.pagination?.total || rows.length)
      setTotalPages(data?.pagination?.total_pages || 1)
      setPage(pageNum)
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [authFetch, filter])

  useEffect(() => { fetchBookings(1) }, [fetchBookings])

  // ── Derived — split self vs admin-created ─────────────────────────────────
  const { selfBookings, adminBookings, upcomingBookings, filteredBookings } =
    React.useMemo(() => {
      const q = search.toLowerCase().trim()
      const all = bookings.filter(b => {
        if (!q) return true
        return (
          (b.booking_number || '').toLowerCase().includes(q) ||
          (b.destination_name || '').toLowerCase().includes(q) ||
          (b.full_name || '').toLowerCase().includes(q)
        )
      })

      const isAdminCreated = (b) =>
        b.source === 'admin_manual' ||
        b.source === 'admin'        ||
        String(b.source || '').includes('admin')

      const self     = all.filter(b => !isAdminCreated(b))
      const admin    = all.filter(b => isAdminCreated(b))
      const upcoming = all.filter(b => {
        const d = daysUntil(b.travel_date)
        return d !== null && d >= 0 && d <= UPCOMING_THRESHOLD_DAYS && b.status === 'confirmed'
      })

      const displayed =
        filter === 'self'     ? self     :
        filter === 'admin'    ? admin    :
        filter === 'upcoming' ? upcoming :
        all

      return {
        selfBookings:    self,
        adminBookings:   admin,
        upcomingBookings: upcoming,
        filteredBookings: displayed,
      }
    }, [bookings, search, filter])

  // ── Stats banner ───────────────────────────────────────────────────────────
  const stats = React.useMemo(() => ({
    total:    bookings.length,
    self:     selfBookings.length,
    admin:    adminBookings.length,
    upcoming: upcomingBookings.length,
  }), [bookings, selfBookings, adminBookings, upcomingBookings])

  return (
    <>
      <Helmet>
        <title>My Bookings | Altuvera</title>
        <meta name="description" content="View and manage all your travel bookings" />
      </Helmet>

      <DashboardLayout
        title="My Bookings"
        subtitle="Track all your adventures — self-booked and team-arranged."
      >
        {/* ── Stats ── */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap:                 12,
          marginBottom:        24,
        }}>
          {[
            { label: 'Total',         value: stats.total,    color: '#059669', emoji: '📋' },
            { label: 'Self-Booked',   value: stats.self,     color: '#0891b2', emoji: '👤' },
            { label: 'Team-Arranged', value: stats.admin,    color: '#7c3aed', emoji: '🛡️' },
            { label: 'Coming Soon',   value: stats.upcoming, color: '#f59e0b', emoji: '✈️' },
          ].map(s => (
            <div key={s.label} style={{
              background:   '#fff',
              borderRadius: 16,
              padding:      '16px 18px',
              border:       '1px solid #e2e8f0',
              boxShadow:    '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <p style={{ margin: 0, fontSize: 22, }}>
                {s.emoji}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: s.color }}>
                {s.value}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters & Search ── */}
        <div style={{
          display:      'flex',
          gap:          12,
          marginBottom: 24,
          flexWrap:     'wrap',
          alignItems:   'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 340 }}>
            <FiSearch style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8',
            }} />
            <input
              type="text"
              placeholder="Search bookings…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:        '100%',
                padding:      '10px 12px 10px 36px',
                borderRadius: 12,
                border:       '1.5px solid #e2e8f0',
                fontSize:     14,
                outline:      'none',
                background:   '#fff',
                boxSizing:    'border-box',
              }}
            />
          </div>

          {/* Filter tabs */}
          {[
            { key: 'all',      label: 'All'          },
            { key: 'self',     label: '👤 My Bookings' },
            { key: 'admin',    label: '🛡️ Team Created'},
            { key: 'upcoming', label: '✈️ Coming Soon' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding:      '9px 16px',
                borderRadius: 10,
                border:       `1.5px solid ${filter === f.key ? '#059669' : '#e2e8f0'}`,
                background:   filter === f.key ? '#ecfdf5' : '#fff',
                color:        filter === f.key ? '#059669' : '#475569',
                fontSize:     13,
                fontWeight:   filter === f.key ? 700 : 500,
                cursor:       'pointer',
                transition:   'all 0.15s',
                whiteSpace:   'nowrap',
              }}
            >
              {f.label}
            </button>
          ))}

          {/* Refresh */}
          <button
            onClick={() => fetchBookings(1)}
            disabled={loading}
            style={{
              padding:      '9px 14px',
              borderRadius: 10,
              border:       '1.5px solid #e2e8f0',
              background:   '#fff',
              color:        '#64748b',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              fontSize:     13,
            }}
          >
            <FiRefreshCw
              size={14}
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            />
            Refresh
          </button>
        </div>

        {/* ── Section header for admin bookings ── */}
        {filter === 'all' && adminBookings.length > 0 && selfBookings.length > 0 && (
          <>
            {/* Self-booked section */}
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        10,
              marginBottom: 16,
            }}>
              <FiUser size={16} color="#0891b2" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                My Self-Booked Adventures
              </h3>
              <span style={{
                background: '#e0f2fe', color: '#0369a1',
                borderRadius: 999, fontSize: 11, fontWeight: 700,
                padding: '2px 8px',
              }}>
                {selfBookings.length}
              </span>
            </div>

            <AnimatePresence>
              {selfBookings.map(b => (
                <BookingCard key={b.id} booking={b} isAdminCreated={false} />
              ))}
            </AnimatePresence>

            {/* Admin-created section */}
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          10,
              margin:       '28px 0 16px',
              paddingTop:   24,
              borderTop:    '2px solid #e2e8f0',
            }}>
              <FiShield size={16} color="#7c3aed" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Arranged by Altuvera Team
              </h3>
              <span style={{
                background: '#f3e8ff', color: '#7c3aed',
                borderRadius: 999, fontSize: 11, fontWeight: 700,
                padding: '2px 8px',
              }}>
                {adminBookings.length}
              </span>
            </div>

            <AnimatePresence>
              {adminBookings.map(b => (
                <BookingCard key={b.id} booking={b} isAdminCreated={true} />
              ))}
            </AnimatePresence>
          </>
        )}

        {/* ── Default: no split needed ── */}
        {(filter !== 'all' || adminBookings.length === 0 || selfBookings.length === 0) && (
          <>
            {/* Error */}
            {error && (
              <div style={{
                padding:      16,
                background:   '#fef2f2',
                border:       '1px solid #fecaca',
                borderRadius: 12,
                color:        '#991b1b',
                marginBottom: 16,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && filteredBookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  width:        48,
                  height:       48,
                  borderRadius: '50%',
                  border:       '4px solid #e5e7eb',
                  borderTopColor: '#059669',
                  animation:    'spin 1s linear infinite',
                  margin:       '0 auto 16px',
                }} />
                <p style={{ color: '#6b7280', margin: 0 }}>Loading your bookings…</p>
              </div>
            )}

            {/* Empty */}
            {!loading && filteredBookings.length === 0 && (
              <div style={{
                textAlign:    'center',
                padding:      '64px 24px',
                background:   '#fff',
                borderRadius: 20,
                border:       '1px dashed #e2e8f0',
              }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>
                  {filter === 'upcoming' ? '✈️' : '📋'}
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>
                  {filter === 'upcoming'
                    ? 'No upcoming confirmed trips'
                    : filter === 'admin'
                    ? 'No team-arranged bookings yet'
                    : 'No bookings found'}
                </h3>
                <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 15 }}>
                  {filter === 'upcoming'
                    ? 'When you have confirmed trips within 7 days they will appear here.'
                    : filter === 'admin'
                    ? 'When our team creates a booking for you, it will appear here.'
                    : 'Ready to plan your next adventure?'}
                </p>
                {filter === 'all' && (
                  <a
                    href="/booking"
                    style={{
                      display:        'inline-block',
                      padding:        '12px 28px',
                      background:     '#059669',
                      color:          '#fff',
                      borderRadius:   12,
                      textDecoration: 'none',
                      fontWeight:     700,
                      fontSize:       15,
                    }}
                  >
                    Book an Adventure
                  </a>
                )}
              </div>
            )}

            {/* Booking list */}
            <AnimatePresence>
              {filteredBookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  isAdminCreated={
                    b.source === 'admin_manual' ||
                    b.source === 'admin'        ||
                    String(b.source || '').includes('admin')
                  }
                />
              ))}
            </AnimatePresence>

            {/* Load more */}
            {page < totalPages && !loading && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={() => fetchBookings(page + 1)}
                  style={{
                    padding:      '12px 32px',
                    borderRadius: 12,
                    border:       '1.5px solid #059669',
                    background:   '#fff',
                    color:        '#059669',
                    fontWeight:   700,
                    fontSize:     14,
                    cursor:       'pointer',
                  }}
                >
                  Load More Bookings
                </button>
              </div>
            )}
          </>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </DashboardLayout>
    </>
  )
}