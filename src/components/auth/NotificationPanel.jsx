import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BellRing, RefreshCw, Trash2, X, MoreHorizontal, Check, ExternalLink } from 'lucide-react'
import { getNotificationActionUrl, getNotificationPresentation } from '../../utils/notificationPresentation'

const formatAgo = (value) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + "d ago";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Compact item: the content opens the notifications centre; secondary actions
// are kept behind the three-dot menu so the preview remains calm and readable.
const NotifItem = ({ notif, onMarkRead, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const actionsRef = useRef(null);
  const swipeStartX = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOutside = (event) => {
      if (!actionsRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);
  const swipeDeltaX = useRef(0);
  const meta = getNotificationPresentation(notif);
  const Icon = meta.icon;
  const actionUrl = getNotificationActionUrl(notif);
  const hasAction = Boolean(notif.action_url || notif.actionUrl || meta.isMessage);
  const title = notif.title || meta.label;
  const body = notif.message || notif.body || "You have a new update from Altuvera.";
  const createdAt = notif.created_at || notif.createdAt;

  const openNotifications = () => {
    if (!notif.is_read) onMarkRead(notif.id);
    if (window.location.pathname !== "/notifications") {
      window.location.assign("/notifications");
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 22, scale: 0.985 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="alt-notification-item"
      role="link"
      tabIndex={0}
      aria-label={title + ". Open notifications"}
      style={{
        margin: "5px 12px",
        padding: "11px 12px",
        borderRadius: 13,
        border: "1px solid " + (notif.is_read ? "#edf1ee" : "#d9eee2"),
        boxShadow: "0 2px 8px rgba(15,75,51,.035)",
        background: notif.is_read ? "#fff" : "#f8fcf9",
        position: "relative",
        zIndex: menuOpen ? 12 : 1,
        minWidth: 0,
        cursor: "pointer",
        touchAction: "pan-y",
        overflow: "visible",
      }}
      onClick={openNotifications}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openNotifications();
        }
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
        if (Math.abs(delta) > 95) onDelete(notif.id);
        else {
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
    >
      <div className="alt-notification-item-row" style={{ display: "flex", gap: 10, alignItems: "flex-start", minWidth: 0 }}>
        <span style={{
          width: 36, height: 36, flex: "0 0 36px", borderRadius: 11,
          display: "grid", placeItems: "center", color: meta.color,
          background: meta.color + "12",
        }}>
          <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
            <p style={{ margin: 0, minWidth: 0, fontSize: 12, fontWeight: notif.is_read ? 650 : 800, color: "#19372a", lineHeight: 1.45, overflowWrap: "anywhere" }}>
              {title}
              {!notif.is_read && <span style={{ display: "inline-block", marginLeft: 7, verticalAlign: "middle", width: 6, height: 6, borderRadius: "50%", background: "#078456" }} />}
            </p>
            <time style={{ fontSize: 10, color: "#8a9991", flex: "0 0 auto", whiteSpace: "nowrap", paddingTop: 2 }}>
              {formatAgo(createdAt)}
            </time>
          </div>
          <p style={{ margin: "5px 0 0", fontSize: 11, color: "#5d7066", lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word" }}>
            {body}
          </p>
          <span style={{ display: "block", marginTop: 6, color: meta.color, fontSize: 9, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>
            {meta.label}
          </span>
        </div>

        <div
          ref={actionsRef}
          className="alt-notification-actions"
          style={{ position: "relative", flex: "0 0 28px" }}
          onClick={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={"Actions for " + title}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            style={{ display: "grid", placeItems: "center", width: 28, height: 28, border: 0, borderRadius: 8, background: menuOpen ? "#edf7f1" : "transparent", color: "#718178", cursor: "pointer" }}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div role="menu" className="alt-notification-action-menu" style={{ position: "absolute", zIndex: 60, top: 32, right: 0, width: "min(218px, calc(100vw - 64px))", padding: 5, border: "1px solid #e3ebe5", borderRadius: 11, background: "#fff", boxShadow: "0 12px 30px rgba(13,43,28,.16)" }}>
              {hasAction && (
                <a
                  role="menuitem"
                  href={actionUrl}
                  onClick={(event) => { event.stopPropagation(); if (!notif.is_read) onMarkRead(notif.id); setMenuOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", minHeight: 36, padding: "8px 9px", borderRadius: 8, color: "#344e40", textDecoration: "none", fontSize: 11, fontWeight: 700, boxSizing: "border-box" }}
                >
                  <ExternalLink size={14} /> Open related item
                </a>
              )}
              {!notif.is_read && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onMarkRead(notif.id); setMenuOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", minHeight: 36, padding: "8px 9px", border: 0, borderRadius: 8, background: "transparent", color: "#087b54", textAlign: "left", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  <Check size={14} /> Mark as read
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => { onDelete(notif.id); setMenuOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", minHeight: 36, padding: "8px 9px", border: 0, borderRadius: 8, background: "transparent", color: "#ad555a", textAlign: "left", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                <Trash2 size={14} /> Dismiss notification
              </button>
            </div>
          )}
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