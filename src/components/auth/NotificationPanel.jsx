import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BellRing, CalendarDays, Pencil, CheckCircle2, XCircle, Trash2, MapPinned, Globe2, FileText, Package, PartyPopper, AlertTriangle, Siren, Settings, MessageCircle, RefreshCw } from 'lucide-react'

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_META = {
  booking_created:   { icon: CalendarDays, color: '#059669', label: 'Booking Created'    },
  booking_updated:   { icon: Pencil, color: '#0ea5e9', label: 'Booking Updated'    },
  booking_confirmed: { icon: CheckCircle2, color: '#16a34a', label: 'Booking Confirmed'  },
  booking_cancelled: { icon: XCircle, color: '#dc2626', label: 'Booking Cancelled'  },
  booking_deleted:   { icon: Trash2, color: '#7c3aed', label: 'Booking Removed'   },
  new_destination:   { icon: MapPinned, color: '#0891b2', label: 'New Destination'   },
  new_country:       { icon: Globe2, color: '#0891b2', label: 'New Country'        },
  new_post:          { icon: FileText, color: '#7c3aed', label: 'New Blog Post'      },
  new_package:       { icon: Package, color: '#d97706', label: 'New Package'        },
  promotion:         { icon: PartyPopper, color: '#db2777', label: 'Promotion'          },
  warning:           { icon: AlertTriangle, color: '#f59e0b', label: 'Warning'            },
  alert:             { icon: Siren, color: '#dc2626', label: 'Alert'              },
  system:            { icon: Settings, color: '#64748b', label: 'System'             },
  general:           { icon: MessageCircle, color: '#059669', label: 'Message'            },
}

const formatAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m    = Math.floor(diff / 60_000)
  if (m < 1)   return 'Just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)   return `${d}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─── Single notification item ──────────────────────────────────────────────────
const NotifItem = ({ notif, onMarkRead, onDelete }) => {
  const swipeStartX = useRef(null)
  const swipeDeltaX = useRef(0)
  const meta = TYPE_META[notif.type] || TYPE_META.general
  const Icon = meta.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, backgroundColor: '#f8fbf9' }}
      exit={{ opacity: 0, x: 18, scale: 0.985 }}
      whileHover={{ backgroundColor: '#ffffff', boxShadow: '0 10px 26px rgba(15, 75, 51, 0.10)', y: -1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        margin: '7px 10px',
        padding: '15px 14px',
        borderRadius: 17,
        border: '1px solid rgba(16, 115, 77, 0.07)',
        boxShadow: '0 2px 8px rgba(15, 75, 51, 0.045)',
        background: '#f8fbf9',
        cursor: 'default',
        position: 'relative',
        touchAction: 'pan-y',
        transition: 'background-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
      }}
      onTouchStart={(e) => { swipeStartX.current = e.touches[0]?.clientX ?? null; swipeDeltaX.current = 0; }}
      onTouchMove={(e) => { if (swipeStartX.current === null) return; swipeDeltaX.current = e.touches[0].clientX - swipeStartX.current; e.currentTarget.style.transform = 'translateX(' + swipeDeltaX.current + 'px)'; e.currentTarget.style.opacity = String(Math.max(.25, 1 - Math.abs(swipeDeltaX.current) / 260)); }}
      onTouchEnd={(e) => { const delta = swipeDeltaX.current; swipeStartX.current = null; swipeDeltaX.current = 0; if (Math.abs(delta) > 95) { onDelete(notif.id); } else { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = ''; } }}
      onClick={() => { if (!notif.is_read) onMarkRead(notif.id) }}
    >
      {!notif.is_read && (
        <span aria-label="Unread notification" style={{ position:'absolute', top:17, left:8, width:7, height:7, borderRadius:'50%', background:'#079669', boxShadow:'0 0 0 4px rgba(7,150,105,.10)' }} />
      )}

      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <span style={{
          width:44, height:44, flex:'0 0 44px', borderRadius:15,
          display:'grid', placeItems:'center', color:meta.color,
          background:`linear-gradient(145deg, ${meta.color}14, ${meta.color}08)`,
          boxShadow:`inset 0 1px 0 rgba(255,255,255,.85), 0 3px 10px ${meta.color}0d`,
        }}>
          <Icon size={21} strokeWidth={1.85} />
        </span>

        <div style={{ flex:1, minWidth:0, paddingLeft:2 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
            <p style={{ margin:0, fontSize:14, fontWeight:notif.is_read ? 600 : 750, color:'#123b2c', lineHeight:1.4, overflowWrap:'anywhere' }}>
              {notif.title}
            </p>
            <span style={{ fontSize:11, color:'#8ba096', flexShrink:0, whiteSpace:'nowrap', paddingTop:2 }}>
              {formatAgo(notif.created_at)}
            </span>
          </div>

          <p style={{ margin:'6px 0 0', fontSize:13, color:'#53675d', lineHeight:1.6, overflowWrap:'anywhere' }}>
            {notif.message}
          </p>

          {notif.action_url && (
            <a href={notif.action_url} style={{
              display:'inline-flex', alignItems:'center', gap:6, marginTop:10,
              fontSize:12, fontWeight:700, color:meta.color, textDecoration:'none',
              padding:'8px 12px', background:`${meta.color}0d`, borderRadius:10,
            }} onClick={(e) => { e.stopPropagation(); if (!notif.is_read) onMarkRead(notif.id) }}>
              {notif.action_label || 'View'} <span aria-hidden="true">→</span>
            </a>
          )}

          {notif.admin_reply && (
            <div style={{ marginTop:10, padding:'10px 12px', background:'#f0faf4', borderRadius:12, color:'#166534', boxShadow:'inset 0 0 0 1px rgba(22,101,52,.07)' }}>
              <p style={{ margin:0, fontSize:11, fontWeight:750 }}>Admin replied</p>
              <p style={{ margin:'4px 0 0', fontSize:12, lineHeight:1.5 }}>{notif.admin_reply}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(notif.id) }}
          aria-label="Delete notification"
          title="Delete notification"
          style={{
            flex:'0 0 36px', width:36, height:36, display:'grid', placeItems:'center',
            border:0, borderRadius:12, color:'#8a9a91', background:'transparent',
            cursor:'pointer', transition:'background .18s ease, color .18s ease, transform .18s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background='#fff0f1'; e.currentTarget.style.color='#d94655'; e.currentTarget.style.transform='scale(1.04)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8a9a91'; e.currentTarget.style.transform='scale(1)' }}
        >
          <Trash2 size={17} strokeWidth={1.8} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Panel tabs ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',     label: 'All'      },
  { key: 'booking', label: 'Bookings' },
  { key: 'system',  label: 'Updates'  },
]

// ─── Main Panel ────────────────────────────────────────────────────────────────
export default function NotificationPanel({
  notifications,
  groupedNotifications,
  unreadCount,
  loading,
  hasMore,
  tripAlerts,
  markRead,
  markAllRead,
  react,
  reply,
  deleteOne,
  clearAll,
  loadMore,
  refresh,
  dismissTripAlert,
  dismissAllTripAlerts,
  onClose,
}) {
  const [tab, setTab] = useState('all')
  const categoryTouchRef = useRef(null)
  const tabOrder = TABS.map(item => item.key)
  const handleCategoryTouchStart = (event) => {
    const touch = event.touches?.[0]
    if (touch) categoryTouchRef.current = { x: touch.clientX, y: touch.clientY }
  }
  const handleCategoryTouchEnd = (event) => {
    const start = categoryTouchRef.current
    categoryTouchRef.current = null
    const touch = event.changedTouches?.[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.2) return
    const index = tabOrder.indexOf(tab)
    const next = dx < 0 ? Math.min(tabOrder.length - 1, index + 1) : Math.max(0, index - 1)
    if (next !== index) setTab(tabOrder[next])
  }

  const displayed =
    tab === 'all'     ? groupedNotifications.all     :
    tab === 'booking' ? groupedNotifications.booking :
    groupedNotifications.system

  return (
    <div style={{
      background:   '#fff',
      borderRadius: 24,
      boxShadow:    '0 24px 80px rgba(2,25,18,0.24)',
      border:       '1px solid #dceee4',
      overflow:     'hidden',
      display:      'flex',
      flexDirection:'column',
      flex:         '1 1 auto',
      minHeight:    0,
      height:       '100%',
      maxHeight:    '100%',
    }}>

      {/* Header */}
      <div style={{
        padding:        '16px 18px 12px',
        borderBottom:   '1px solid #f1f5f9',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexShrink:     0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{display:'grid',placeItems:'center',width:40,height:40,borderRadius:14,background:'linear-gradient(145deg,#e9f8ef,#d5f0e0)',color:'#087f58',border:'1px solid #c5e8d4'}}><BellRing size={21} strokeWidth={1.9} /></span>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span style={{
              background:   '#059669',
              color:        '#fff',
              borderRadius: 999,
              fontSize:     11,
              fontWeight:   700,
              padding:      '1px 7px',
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                fontSize:   11, fontWeight: 600,
                color:      '#059669', background: 'transparent',
                border:     'none', cursor: 'pointer', padding: '4px 8px',
                borderRadius: 6,
              }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              fontSize:   11, color: '#94a3b8', background: 'transparent',
              border:     'none', cursor: 'pointer', padding: '4px 8px',
            }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* Trip Proximity Alerts */}
      <AnimatePresence>
        {tripAlerts.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              flexShrink:  0,
              overflow:    'hidden',
              borderBottom:'1px solid #fde68a',
            }}
          >
            <div style={{ padding: '0 0 4px' }}>
              {tripAlerts.slice(0, 2).map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding:    '10px 16px',
                    background: alert.type === 'urgent' ? '#fef2f2' :
                                alert.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                    borderLeft: `4px solid ${
                      alert.type === 'urgent' ? '#ef4444' :
                      alert.type === 'warning' ? '#f59e0b' : '#059669'
                    }`,
                    display:    'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap:        8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin:     0,
                      fontSize:   12,
                      fontWeight: 700,
                      color:      alert.type === 'urgent' ? '#991b1b' :
                                  alert.type === 'warning' ? '#92400e' : '#166534',
                    }}>
                      {alert.message}
                    </p>
                    {alert.travelDate && (
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#94a3b8' }}>
                        Departure: {new Date(alert.travelDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => dismissTripAlert(alert.id)}
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: 14, color: '#9ca3af',
                      padding: '0 2px', flexShrink: 0,
                    }}
                    aria-label="Dismiss alert"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
              {tripAlerts.length > 2 && (
                <div style={{
                  padding: '6px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    +{tripAlerts.length - 2} more trip alerts
                  </span>
                  <button
                    onClick={dismissAllTripAlerts}
                    style={{
                      fontSize: 11, color: '#94a3b8', background: 'transparent',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    Dismiss all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div style={{
        display:     'flex',
        borderBottom:'1px solid #f1f5f9',
        flexShrink:  0,
        padding:     '0 12px',
        overflowX:   'auto',
        scrollbarWidth:'none',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding:      '13px 14px',
              whiteSpace:   'nowrap',
              fontSize:     12,
              fontWeight:   tab === t.key ? 700 : 500,
              color:        tab === t.key ? '#059669' : '#64748b',
              background:   'transparent',
              border:       'none',
              borderBottom: tab === t.key ? '2px solid #059669' : '2px solid transparent',
              cursor:       'pointer',
              transition:   'all 0.15s',
            }}
          >
            {t.label}
            {t.key === 'all' && groupedNotifications.all.length > 0 && (
              <span style={{
                marginLeft: 5, fontSize: 10,
                background: '#e2e8f0', borderRadius: 999,
                padding: '1px 5px', color: '#64748b',
              }}>
                {groupedNotifications.all.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div onTouchStart={handleCategoryTouchStart} onTouchEnd={handleCategoryTouchEnd} style={{ overflowY: 'auto', overflowX:'hidden', flex: '1 1 auto', minHeight:0, overscrollBehavior:'contain', WebkitOverflowScrolling:'touch', touchAction:'pan-y' }}>
        {loading && displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid #e5e7eb', borderTopColor: '#059669',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px',
            }} />
            Loading notifications…
          </div>
        ) : displayed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 16px',
            color: '#94a3b8',
          }}>
            <div style={{ width:64,height:64,borderRadius:22,margin:'0 auto 14px',display:'grid',placeItems:'center',background:'linear-gradient(145deg,#effbf4,#dff4e8)',color:'#087f58',border:'1px solid #ccebd9' }}><BellRing size={28} strokeWidth={1.7} /></div>
            <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>
              All caught up!
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>
              No {tab === 'all' ? '' : tab} notifications yet.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false} mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18, ease: 'easeOut' }} style={{ minHeight: '100%' }}>
            {displayed.map(n => (
              <NotifItem
                key={n.id}
                notif={n}
                onMarkRead={markRead}
                onDelete={deleteOne}
              />
            ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Load more */}
        {hasMore && (
          <div style={{ textAlign: 'center', padding: '12px 16px' }}>
            <button
              onClick={loadMore}
              disabled={loading}
              style={{
                fontSize:     12,
                color:        '#059669',
                background:   'transparent',
                border:       '1px solid #059669',
                borderRadius: 8,
                padding:      '6px 16px',
                cursor:       'pointer',
                fontWeight:   600,
              }}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {displayed.length > 0 && (
        <div className="notification-panel-footer" style={{
          padding:      '14px 18px max(14px, env(safe-area-inset-bottom))',
          borderTop:    '1px solid #f1f5f9',
          display:      'flex',
          justifyContent: 'space-between',
          flexShrink:   0,
        }}>
          <a
            href="/notifications"
            style={{
              fontSize: 12, color: '#059669',
              fontWeight: 600, textDecoration: 'none',
            }}
            onClick={onClose}
          >
            View all notifications →
          </a>
          <button
            onClick={clearAll}
            style={{
              fontSize: 12, color: '#94a3b8', background: 'transparent',
              border: 'none', cursor: 'pointer',
            }}
          >
            Clear all
          </button>
        </div>
      )}

      <style>{`
        @media (max-width:640px) { .notification-panel-footer { flex-wrap:wrap; gap:10px; } }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}