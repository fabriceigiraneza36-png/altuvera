import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BellRing, RefreshCw, Trash2, X } from 'lucide-react'
import { getNotificationContextRows, getNotificationActionUrl, getNotificationPresentation } from '../../utils/notificationPresentation'

// ─── Single notification item ──────────────────────────────────────────────────
const NotifItem = ({ notif, onMarkRead, onDelete }) => {
  const swipeStartX = useRef(null);
  const swipeDeltaX = useRef(0);
  const meta = getNotificationPresentation(notif);
  const Icon = meta.icon;
  const contextRows = getNotificationContextRows(notif);
  const actionUrl = getNotificationActionUrl(notif);
  const hasAction = Boolean(notif.action_url || notif.actionUrl || meta.isMessage);
  const title = notif.title || meta.label;
  const body = notif.message || notif.body || "You have a new update from Altuvera.";
  const createdAt = notif.created_at || notif.createdAt;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 22, scale: 0.985 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="alt-notification-item"
      style={{
        margin: "5px 12px",
        padding: "11px 12px",
        borderRadius: 14,
        border: "none",
        boxShadow: notif.is_read ? "0 1px 7px rgba(15,75,51,.035)" : "0 4px 14px rgba(7,132,91,.055)",
        background: notif.is_read ? "#fff" : "linear-gradient(120deg,#f1faf4,#ffffff 76%)",
        position: "relative",
        minWidth: 0,
        cursor: "default",
        touchAction: "pan-y",
        overflow: "hidden",
      }}
      onTouchStart={(event) => {
        swipeStartX.current = event.touches?.[0]?.clientX ?? null;
        swipeDeltaX.current = 0;
      }}
      onTouchMove={(event) => {
        if (swipeStartX.current === null) return;
        const touch = event.touches?.[0];
        if (!touch) return;
        const delta = touch.clientX - swipeStartX.current;
        swipeDeltaX.current = delta;
        if (Math.abs(delta) > 5) {
          event.currentTarget.style.transform = `translate3d(${delta}px,0,0)`;
          event.currentTarget.style.opacity = String(Math.max(.25, 1 - Math.abs(delta) / 260));
        }
      }}
      onTouchEnd={(event) => {
        const delta = swipeDeltaX.current;
        swipeStartX.current = null;
        swipeDeltaX.current = 0;
        if (Math.abs(delta) > 95) {
          onDelete(notif.id);
        } else {
          event.currentTarget.style.transform = "";
          event.currentTarget.style.opacity = "";
        }
      }}
      onTouchCancel={(event) => {
        swipeStartX.current = null;
        swipeDeltaX.current = 0;
        event.currentTarget.style.transform = "";
        event.currentTarget.style.opacity = "";
      }}
      onClick={() => { if (!notif.is_read) onMarkRead(notif.id); }}
    >
      {!notif.is_read && (
        <span
          aria-label="Unread notification"
          style={{ position: "absolute", top: 17, left: 7, width: 7, height: 7, borderRadius: 99, background: "#079669", boxShadow: "0 0 0 4px rgba(7,150,105,.10)" }}
        />
      )}

      <div className="alt-notification-item-row" style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
        <span style={{
          width: 38, height: 38, flex: "0 0 38px", borderRadius: 12,
          display: "grid", placeItems: "center", color: meta.color,
          background: `linear-gradient(145deg,${meta.color}1c,${meta.color}09)`,
          border: `1px solid ${meta.color}20`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.9), 0 3px 10px rgba(15,23,42,.035)",
        }}>
          <Icon size={18} strokeWidth={1.9} aria-hidden="true"/>
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
            <div style={{ minWidth: 0, flex: "1 1 auto" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: notif.is_read ? 650 : 800, color: "#123b2c", lineHeight: 1.4, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                {title}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 5 }}>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 7px", borderRadius: 999, background: `${meta.color}12`, color: meta.color, fontSize: 9, fontWeight: 850, letterSpacing: ".055em", textTransform: "uppercase" }}>
                  {meta.label}
                </span>
                {!notif.is_read && <span style={{ display: "inline-flex", padding: "3px 7px", borderRadius: 999, background: "#dff7e9", color: "#047857", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}>New</span>}
                {meta.isUrgent && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 7px", borderRadius: 999, background: "#fff0ef", color: "#b42332", fontSize: 9, fontWeight: 900, textTransform: "uppercase" }}><X size={10}/> Important</span>}
              </div>
            </div>
            <span style={{ fontSize: 10, color: "#8ba096", flex: "0 0 auto", whiteSpace: "nowrap", paddingTop: 2 }}>
              {formatAgo(createdAt)}
            </span>
          </div>

          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#53675d", lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>
            {body}
          </p>

          {contextRows.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
              {contextRows.map(([label, value]) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "baseline", flexWrap: "wrap", gap: 4, maxWidth: "100%", padding: "4px 7px", borderRadius: 8, background: "#f5faf7", border: "none", color: "#52675c", fontSize: 10, lineHeight: 1.4 }}>
                  <strong style={{ color: "#82948a", fontWeight: 750 }}>{label}</strong>
                  <span style={{ fontWeight: 750, overflowWrap: "anywhere" }}>{String(value)}</span>
                </span>
              ))}
            </div>
          )}

          {notif.admin_reply && (
            <div style={{ marginTop: 10, padding: "10px 11px", borderRadius: 12, background: "#f0faf4", border: "1px solid #d7efdf" }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 850, color: "#08734f", letterSpacing: ".06em", textTransform: "uppercase" }}>Reply from Altuvera</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: 1.55, color: "#315b45", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{notif.admin_reply}</p>
            </div>
          )}

          {(notif.reply_text || notif.replyText) && (
            <div style={{ marginTop: 9, padding: "9px 11px", borderRadius: 11, background: "#f7f9fb", border: "1px solid #e6ebef" }}>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                Your reply: {notif.reply_text || notif.replyText}
                {!notif.admin_reply && <span style={{ marginLeft: 5, color: "#94a3b8", fontStyle: "italic" }}>Awaiting response</span>}
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, marginTop: 8 }}>
            {hasAction && (
              <a
                href={actionUrl}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!notif.is_read) onMarkRead(notif.id);
                }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 31, padding: "6px 10px", borderRadius: 11, background: meta.color, color: "#fff", boxShadow: `0 4px 11px ${meta.color}22`, fontSize: 11, fontWeight: 850, textDecoration: "none", maxWidth: "100%" }}
              >
                {notif.action_label || notif.actionLabel || (meta.isMessage ? "Open conversation" : "View details")}
                <span aria-hidden="true">↗</span>
              </a>
            )}
            {!notif.is_read && (
              <button type="button" onClick={(event) => { event.stopPropagation(); onMarkRead(notif.id); }} style={{ minHeight: 31, padding: "6px 9px", borderRadius: 10, border: "1px solid #dcebe1", background: "#fff", color: "#087c53", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>
                Mark as read
              </button>
            )}
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onDelete(notif.id); }}
              aria-label="Dismiss notification"
              title="Dismiss notification"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, minHeight: 31, padding: "6px 8px", border: "1px solid #f0e1e1", borderRadius: 10, color: "#a65d63", background: "#fffafa", fontSize: 10, fontWeight: 750, cursor: "pointer" }}
            >
              <Trash2 size={14}/> Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

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
      borderRadius: 20,
      boxShadow:    '0 18px 48px rgba(2,25,18,0.16)',
      border:       'none',
      overflow:     'hidden',
      display:      'flex',
      flexDirection:'column',
      flex:         '1 1 auto',
      minHeight:    0,
      height:       'auto',
      maxHeight:    'min(78dvh, 680px)',
    }}>

      {/* Header */}
      <div style={{
        padding:        '12px 14px 10px',
        borderBottom:   '1px solid #f1f5f9',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flexShrink:     0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{display:'grid',placeItems:'center',width:40,height:40,borderRadius:14,background:'linear-gradient(145deg,#e9f8ef,#d5f0e0)',color:'#087f58',border:'1px solid #c5e8d4'}}><BellRing size={21} strokeWidth={1.9} /></span>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 750, color: '#0f172a' }}>
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
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            title="Close"
            style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: 10, border: 'none', background: '#f1f7f3', color: '#426052', cursor: 'pointer' }}
          >
            <X size={17}/>
          </button>
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
                    borderLeft: 'none',
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
          padding:      '10px 14px max(10px, env(safe-area-inset-bottom))',
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
        @media (max-width:640px) {  .notification-panel-footer { flex-wrap:wrap; gap:8px; } .alt-notification-item { margin:4px 8px!important; padding:10px!important; } .alt-notification-item-row { gap:9px!important; } }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}