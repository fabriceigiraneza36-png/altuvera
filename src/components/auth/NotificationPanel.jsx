import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_META = {
  booking_created:   { icon: '📅', color: '#059669', label: 'Booking Created'    },
  booking_updated:   { icon: '✏️', color: '#0ea5e9', label: 'Booking Updated'    },
  booking_confirmed: { icon: '✅', color: '#16a34a', label: 'Booking Confirmed'  },
  booking_cancelled: { icon: '❌', color: '#dc2626', label: 'Booking Cancelled'  },
  booking_deleted:   { icon: '🗑️', color: '#7c3aed', label: 'Booking Removed'   },
  new_destination:   { icon: '🗺️', color: '#0891b2', label: 'New Destination'   },
  new_country:       { icon: '🌍', color: '#0891b2', label: 'New Country'        },
  new_post:          { icon: '📝', color: '#7c3aed', label: 'New Blog Post'      },
  new_package:       { icon: '📦', color: '#d97706', label: 'New Package'        },
  promotion:         { icon: '🎉', color: '#db2777', label: 'Promotion'          },
  warning:           { icon: '⚠️', color: '#f59e0b', label: 'Warning'            },
  alert:             { icon: '🚨', color: '#dc2626', label: 'Alert'              },
  system:            { icon: '⚙️', color: '#64748b', label: 'System'             },
  general:           { icon: '💬', color: '#059669', label: 'Message'            },
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
const NotifItem = ({
  notif,
  onMarkRead,
  onReact,
  onReply,
  onDelete,
}) => {
  const [showReply,  setShowReply]  = useState(false)
  const [replyText,  setReplyText]  = useState('')
  const [replying,   setReplying]   = useState(false)
  const meta = TYPE_META[notif.type] || TYPE_META.general

  const handleReply = async () => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      await onReply(notif.id, replyText)
      setReplyText('')
      setShowReply(false)
    } finally {
      setReplying(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0    }}
      exit={{    opacity: 0, x:  10  }}
      style={{
        padding:      '14px 16px',
        borderBottom: '1px solid #f1f5f9',
        background:   notif.is_read ? '#fff' : '#f0fdf4',
        cursor:       'default',
        position:     'relative',
      }}
    >
      {/* Unread dot */}
      {!notif.is_read && (
        <div style={{
          position:     'absolute',
          top:          16,
          left:         6,
          width:        7,
          height:       7,
          borderRadius: '50%',
          background:   '#059669',
        }} />
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width:        36,
          height:       36,
          borderRadius: 10,
          background:   `${meta.color}18`,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     18,
          flexShrink:   0,
        }}>
          {meta.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <p style={{
              margin:     0,
              fontSize:   13,
              fontWeight: notif.is_read ? 500 : 700,
              color:      '#0f172a',
              lineHeight: 1.4,
            }}>
              {notif.title}
            </p>
            <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
              {formatAgo(notif.created_at)}
            </span>
          </div>

          <p style={{
            margin:     '4px 0 0',
            fontSize:   12,
            color:      '#475569',
            lineHeight: 1.5,
          }}>
            {notif.message}
          </p>

          {/* Action button */}
          {notif.action_url && (
            <a
              href={notif.action_url}
              style={{
                display:        'inline-block',
                marginTop:      8,
                fontSize:       12,
                fontWeight:     600,
                color:          meta.color,
                textDecoration: 'none',
                padding:        '4px 10px',
                background:     `${meta.color}12`,
                borderRadius:   6,
              }}
              onClick={() => !notif.is_read && onMarkRead(notif.id)}
            >
              {notif.action_label || 'View'} →
            </a>
          )}

          {/* Admin reply */}
          {notif.admin_reply && (
            <div style={{
              marginTop:    8,
              padding:      '8px 10px',
              background:   '#f0fdf4',
              borderRadius: 8,
              border:       '1px solid #bbf7d0',
            }}>
              <p style={{ margin: 0, fontSize: 11, color: '#166534', fontWeight: 700 }}>
                Admin replied:
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#166534' }}>
                {notif.admin_reply}
              </p>
            </div>
          )}

          {/* User's own reply */}
          {notif.reply_text && !notif.admin_reply && (
            <div style={{
              marginTop:    8,
              padding:      '6px 10px',
              background:   '#f8fafc',
              borderRadius: 8,
              border:       '1px solid #e2e8f0',
            }}>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                Your reply: {notif.reply_text}
              </p>
            </div>
          )}

          {/* Action row */}
          <div style={{
            display:    'flex',
            gap:        8,
            marginTop:  8,
            flexWrap:   'wrap',
            alignItems: 'center',
          }}>
            {!notif.is_read && (
              <button
                onClick={() => onMarkRead(notif.id)}
                style={actionBtnStyle('#059669')}
              >
                ✓ Mark read
              </button>
            )}

            {/* Reaction buttons */}
            <button
              onClick={() => onReact(notif.id, notif.reaction === 'like' ? null : 'like')}
              style={actionBtnStyle(notif.reaction === 'like' ? '#059669' : '#94a3b8')}
              title="Like"
            >
              👍 {notif.reaction === 'like' ? 'Liked' : 'Like'}
            </button>

            {/* Reply button — only if no existing reply */}
            {!notif.reply_text && (
              <button
                onClick={() => setShowReply(v => !v)}
                style={actionBtnStyle('#0ea5e9')}
                title="Reply"
              >
                💬 Reply
              </button>
            )}

            <button
              onClick={() => onDelete(notif.id)}
              style={actionBtnStyle('#ef4444')}
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {showReply && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 8, overflow: 'hidden' }}
              >
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write your reply…"
                  rows={2}
                  style={{
                    width:        '100%',
                    fontSize:     12,
                    padding:      '8px 10px',
                    borderRadius: 8,
                    border:       '1px solid #e2e8f0',
                    resize:       'none',
                    fontFamily:   'inherit',
                    outline:      'none',
                    boxSizing:    'border-box',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    style={{
                      ...actionBtnStyle('#059669'),
                      opacity: replying || !replyText.trim() ? 0.5 : 1,
                    }}
                  >
                    {replying ? 'Sending…' : 'Send Reply'}
                  </button>
                  <button
                    onClick={() => setShowReply(false)}
                    style={actionBtnStyle('#94a3b8')}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

const actionBtnStyle = (color) => ({
  background:   'transparent',
  border:       `1px solid ${color}40`,
  color:        color,
  borderRadius: 6,
  padding:      '3px 8px',
  fontSize:     11,
  fontWeight:   600,
  cursor:       'pointer',
})

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

  const displayed =
    tab === 'all'     ? groupedNotifications.all     :
    tab === 'booking' ? groupedNotifications.booking :
    groupedNotifications.system

  return (
    <div style={{
      background:   '#fff',
      borderRadius: 20,
      boxShadow:    '0 20px 60px rgba(0,0,0,0.15)',
      border:       '1px solid #e2e8f0',
      overflow:     'hidden',
      display:      'flex',
      flexDirection:'column',
      maxHeight:    520,
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
          <span style={{ fontSize: 18 }}>🔔</span>
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
        padding:     '0 16px',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding:      '10px 14px',
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
      <div style={{ overflowY: 'auto', flex: 1 }}>
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
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
            <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>
              All caught up!
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>
              No {tab === 'all' ? '' : tab} notifications yet.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayed.map(n => (
              <NotifItem
                key={n.id}
                notif={n}
                onMarkRead={markRead}
                onReact={react}
                onReply={reply}
                onDelete={deleteOne}
              />
            ))}
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
        <div style={{
          padding:      '10px 16px',
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}