  // src/pages/Notifications.jsx
  import React, { useState, useMemo, useRef, useEffect } from 'react';
  import {
    Bell, CalendarDays, Pencil, CheckCircle2, XCircle, Trash2,
    CreditCard, Wallet, Map as MapIcon, Globe2, FileText, Package, ClipboardList,
    PartyPopper, Newspaper, AlertTriangle, Siren, Settings, MessageCircle,
    ShieldCheck, CheckCheck, Search, Filter, Clock3, Check, BellOff, Inbox, ArrowUpRight,
  } from 'lucide-react';
  import { Helmet }     from 'react-helmet-async';
  import { getNotificationContextRows, getNotificationActionUrl, getNotificationPresentation } from '../../utils/notificationPresentation';
  import { motion, AnimatePresence } from 'framer-motion';
  import DashboardLayout from '../../components/auth/DashboardLayout';
  import UserPushReminder from '../../components/auth/UserPushReminder';
  import { useNotifications } from '../../hooks/useNotifications';
  import { useBrowserPush } from '../../hooks/useBrowserPush';

  const readSessionExpiry = (notification) => {
    const metadata = notification?.metadata || notification?.metadata_json || {};
    const value = metadata?.sessionExpiresAt || metadata?.session_expires_at;
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const formatRemaining = (expiry, now) => {
    if (!expiry) return '';
    const seconds = Math.max(0, Math.floor((expiry - now) / 1000));
    if (!seconds) return 'Session expired';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return 'Session expires in ' + (days ? days + 'd ' : '') + hours + 'h ' + minutes + 'm';
  };

  const formatDate = (d) => {
    if (!d) return '';
    const dt   = new Date(d);
    if (Number.isNaN(dt.getTime())) return "Recently";
    const diff = Date.now() - dt.getTime();
    const m    = Math.floor(diff / 60_000);
    if (m < 1)   return 'Just now';
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const btnStyle = (color) => ({
    padding:    '5px 12px', borderRadius: 7,
    border:     `1.5px solid ${color}30`,
    background: `${color}0a`, color, fontSize: 12,
    fontWeight: 600, cursor: 'pointer',
  });

  export default function UserNotifications() {
    const {
      notifications, groupedNotifications, unreadCount,
      loading, hasMore, total, tripAlerts,
      dismissTripAlert, dismissAllTripAlerts,
      markRead, markAllRead, deleteOne, clearAll, loadMore, refresh, reply,
    } = useNotifications();

    const grouped = useMemo(() => groupedNotifications || { all: [], booking: [], system: [] }, [groupedNotifications]);
    const browserPush = useBrowserPush();

    const [tab,        setTab]        = useState('all');
    const [searchText, setSearchText] = useState('');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [replyingId, setReplyingId] = useState(null);
    const [replyTexts, setReplyTexts] = useState({});
    const [sending,    setSending]    = useState({});
    const swipeStarts = useRef(new Map());
    const [swipeOffsets, setSwipeOffsets] = useState({});
    const [clockNow, setClockNow] = useState(Date.now());
    useEffect(() => {
      const timer = window.setInterval(() => setClockNow(Date.now()), 30_000);
      return () => window.clearInterval(timer);
    }, []);

    const displayed = useMemo(() => {
      const source = tab === 'bookings' ? grouped.booking : tab === 'updates' ? grouped.system : grouped.all;
      // Booking updates are time-sensitive customer actions: pin them first,
      // with unread booking messages ahead of older/read notifications.
      const query = searchText.trim().toLowerCase();
      return [...source]
        .filter((n) => !unreadOnly || !n.is_read)
        .filter((n) => !query || [n.title, n.message, n.type, n.admin_reply].some((value) => String(value || '').toLowerCase().includes(query)))
        .sort((a, b) => {
          if (Boolean(a.is_read) !== Boolean(b.is_read)) return Number(Boolean(a.is_read)) - Number(Boolean(b.is_read));
          const aBooking = String(a.type || '').startsWith('booking_') ? 1 : 0;
          const bBooking = String(b.type || '').startsWith('booking_') ? 1 : 0;
          if (aBooking !== bBooking) return bBooking - aBooking;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    }, [tab, grouped, searchText, unreadOnly]);

    const tabs = useMemo(() => [
      { key: 'all',      label: 'All',         count: grouped.all.length     },
      { key: 'bookings', label: 'Bookings', count: grouped.booking.length },
      { key: 'updates', label: 'Updates', count: grouped.system.length },
    ], [grouped]);

    const handleReply = async (id) => {
      const text = replyTexts[id]?.trim();
      if (!text) return;
      setSending(p => ({ ...p, [id]: true }));
      try {
        await reply(id, text);
        setReplyingId(null);
        setReplyTexts(p => ({ ...p, [id]: '' }));
      } catch { /* shown by hook */ }
      finally { setSending(p => ({ ...p, [id]: false })); }
    };

    return (
      <>
        <Helmet><title>Notifications | Altuvera</title></Helmet>

        <DashboardLayout
          title="Notifications"
          subtitle="Stay up to date with your bookings, trips, and updates."
        >
          <UserPushReminder />
          {/* ── Trip Alerts ── */}
          <AnimatePresence>
            {tripAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ marginBottom: 24, borderRadius: 16, overflow: 'hidden', border: '1.5px solid #fde68a' }}
              >
                <div style={{ padding: '12px 18px', background: '#fffbeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#92400e' }}>
                    Upcoming Trip Reminders ({tripAlerts.length})
                  </h4>
                  <button onClick={dismissAllTripAlerts} style={btnStyle('#92400e')}>Dismiss all</button>
                </div>
                {tripAlerts.map(alert => (
                  <div key={alert.id} style={{
                    padding: '14px 18px', borderTop: '1px solid #fde68a',
                    background: alert.type === 'urgent' ? '#fef2f2' : alert.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14,
                        color: alert.type === 'urgent' ? '#991b1b' : alert.type === 'warning' ? '#92400e' : '#166534' }}>
                        {alert.message}
                      </p>
                      {alert.travelDate && (
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                          Departure: {new Date(alert.travelDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <button onClick={() => dismissTripAlert(alert.id)}
                      style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>
                      ×
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {browserPush.showReminder && (
            <motion.section
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              role="status"
              aria-live="polite"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '17px 18px', marginBottom: 18, borderRadius: 18,
                border: '1px solid #bde5cf',
                background: 'linear-gradient(120deg,#f0fbf5 0%,#ffffff 100%)',
                boxShadow: '0 8px 24px rgba(4,120,87,.07)',
              }}
            >
              <span style={{
                display: 'grid', placeItems: 'center', width: 42, height: 42,
                flex: '0 0 42px', borderRadius: 14, color: '#047857',
                background: '#dcfce7', border: '1px solid #bbf7d0',
              }}>
                <Bell size={20} />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ margin: 0, color: '#123b2c', fontSize: 14, fontWeight: 800 }}>
                  Stay updated with browser notifications
                </h3>
                <p style={{ margin: '5px 0 0', color: '#52685d', fontSize: 12, lineHeight: 1.65 }}>
                  Enable notifications to receive important booking, message, and account updates even when Altuvera is not open.
                </p>
                {browserPush.permission === 'denied' && (
                  <p style={{ margin: '8px 0 0', color: '#92400e', fontSize: 12, lineHeight: 1.6 }}>
                    Notifications are blocked by your browser. Open this site’s settings from your browser address bar or site permissions, change Notifications to Allow, then come back and check again.
                  </p>
                )}
                {browserPush.error && (
                  <p role="alert" style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: 12, lineHeight: 1.6 }}>
                    {browserPush.error}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={browserPush.permission === 'denied' ? browserPush.refresh : browserPush.enablePush}
                disabled={browserPush.loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  gap: 7, flex: '0 0 auto', alignSelf: 'center',
                  padding: '10px 14px', border: 0, borderRadius: 11,
                  background: '#047857', color: '#fff', fontSize: 12,
                  fontWeight: 800, cursor: browserPush.loading ? 'wait' : 'pointer',
                  opacity: browserPush.loading ? .65 : 1, whiteSpace: 'nowrap',
                }}
              >
                {browserPush.loading ? 'Enabling…' : browserPush.permission === 'denied' ? 'Check again' : browserPush.browserSubscribed ? 'Finish setup' : 'Enable'}
                <ArrowUpRight size={14} />
              </button>
            </motion.section>
          )}

          {/* ── Notification centre header ── */}
          <section style={{ marginBottom: 22, padding: 'clamp(20px, 4vw, 30px)', borderRadius: 24, color: '#fff', background: 'linear-gradient(125deg,#064e3b 0%,#047857 55%,#10a37f 100%)', boxShadow: '0 16px 40px rgba(4,120,87,.18)', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', width: 230, height: 230, borderRadius: '50%', border: '1px solid rgba(255,255,255,.13)', right: -65, top: -115, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
              <div style={{ minWidth: 0, flex: '1 1 230px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 15, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.18)' }}><Bell size={23} /></span>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#a7f3d0' }}>Your activity</span>
                </div>
                <h2 style={{ margin: '0 0 7px', fontSize: 'clamp(24px,4vw,32px)', lineHeight: 1.15, letterSpacing: '-.035em', fontWeight: 850 }}>Notification centre</h2>
                <p style={{ margin: 0, maxWidth: 520, fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,.8)' }}>Booking updates, trip reminders, and important news from Altuvera—all in one place.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 92, padding: '12px 15px', borderRadius: 15, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.14)' }}>
                  <div style={{ fontSize: 25, fontWeight: 850, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{total}</div><div style={{ marginTop: 5, fontSize: 11, color: 'rgba(255,255,255,.78)' }}>Total</div>
                </div>
                <div style={{ minWidth: 92, padding: '12px 15px', borderRadius: 15, background: unreadCount ? 'rgba(167,243,208,.17)' : 'rgba(255,255,255,.12)', border: '1px solid rgba(167,243,208,.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 25, fontWeight: 850, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{unreadCount}{unreadCount > 0 && <span style={{ width: 7, height: 7, borderRadius: 99, background: '#a7f3d0' }} />}</div><div style={{ marginTop: 5, fontSize: 11, color: '#d1fae5' }}>Unread</div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ background: '#fff', border: '1px solid #e5eee9', borderRadius: 20, padding: 'clamp(12px, 3vw, 18px)', marginBottom: 18, boxShadow: '0 5px 20px rgba(15,23,42,.035)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', border: '1px solid #dce8e1', borderRadius: 12, background: '#f9fcfa' }}>
                <Search size={18} color="#6b8277" />
                <input aria-label="Search notifications" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search notifications…" style={{ width: '100%', minWidth: 0, padding: '12px 0', border: 0, outline: 0, background: 'transparent', color: '#10231d', fontSize: 14 }} />
                {searchText && <button aria-label="Clear search" onClick={() => setSearchText('')} style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>×</button>}
              </div>
              <button onClick={() => setUnreadOnly(v => !v)} aria-pressed={unreadOnly} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, border: '1px solid ' + (unreadOnly ? '#047857' : '#dce8e1'), background: unreadOnly ? '#e8f7ef' : '#fff', color: unreadOnly ? '#047857' : '#52645b', fontWeight: 750, fontSize: 13, cursor: 'pointer' }}><Filter size={16} /> Unread only</button>
              {unreadCount > 0 && <button onClick={markAllRead} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 14px', borderRadius: 12, border: '1px solid #b8e6d0', background: '#effaf4', color: '#047857', fontWeight: 750, fontSize: 13, cursor: 'pointer' }}><CheckCheck size={16} /> Mark all read</button>}
              <button onClick={refresh} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 14px', borderRadius: 12, border: '1px solid #dce8e1', background: '#fff', color: '#52645b', fontWeight: 700, fontSize: 13, cursor: loading ? 'wait' : 'pointer', opacity: loading ? .6 : 1 }}><Clock3 size={16} /> {loading ? 'Refreshing…' : 'Refresh'}</button>
              {notifications.length > 0 && <button onClick={clearAll} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 14px', borderRadius: 12, border: '1px solid #fecaca', background: '#fff7f7', color: '#b91c1c', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Trash2 size={15} /> Clear all</button>}
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} aria-pressed={tab === t.key} style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 15px', borderRadius: 11, border: '1px solid ' + (tab === t.key ? '#b8e6d0' : 'transparent'), background: tab === t.key ? '#eaf8f0' : '#f7faf8', color: tab === t.key ? '#047857' : '#64756d', fontWeight: tab === t.key ? 800 : 650, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t.key === 'all' ? <Inbox size={16} /> : t.key === 'bookings' ? <CalendarDays size={16} /> : <Bell size={16} />}
                  {t.label}<span style={{ minWidth: 21, padding: '2px 6px', textAlign: 'center', borderRadius: 999, background: tab === t.key ? '#c9f0dc' : '#e8efeb', color: tab === t.key ? '#065f46' : '#607168', fontSize: 11, fontWeight: 850 }}>{t.count}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── List ── */}
          {loading && displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #e5e7eb', borderTopColor: '#059669', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#6b7280' }}>Loading notifications…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 20, border: '1px dashed #e2e8f0' }}>
              <Bell size={44} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>All caught up!</h3>
              <p style={{ color: '#64748b', margin: 0 }}>{searchText ? 'No notifications match your search.' : unreadOnly ? 'You have no unread notifications.' : `No ${tab === 'all' ? '' : tab + ' '}notifications yet.`}</p>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <AnimatePresence initial={false}>
                {displayed.map((n, idx) => {
                  const meta = getNotificationPresentation(n);
                  const contextRows = getNotificationContextRows(n);
                  // Only critical booking notifications receive the urgent booking treatment.
                  const isUrgentBooking = Boolean(meta.isUrgent && (meta.category === 'booking' || String(meta.type || '').startsWith('booking')));
                  const hasAction = Boolean(n.action_url || n.actionUrl || meta.isMessage);
                  return (
                    <motion.div
                      key={n.id} layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 80, scale: 0.98 }}
                      onPointerDown={(event) => { swipeStarts.current.set(n.id, { x: event.clientX, y: event.clientY, dx: 0 }); event.currentTarget.setPointerCapture?.(event.pointerId); }}
                      onPointerMove={(event) => { const start = swipeStarts.current.get(n.id); if (!start) return; const dx = event.clientX - start.x; const dy = event.clientY - start.y; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) { start.dx = dx; setSwipeOffsets(p => ({ ...p, [n.id]: { x: dx, opacity: Math.max(.18, 1 - Math.abs(dx) / 260) } })); } }}
                      onPointerUp={() => { const start = swipeStarts.current.get(n.id); swipeStarts.current.delete(n.id); if (!start) return; if (Math.abs(start.dx) > 95) { setSwipeOffsets(p => ({ ...p, [n.id]: { x: start.dx < 0 ? -window.innerWidth : window.innerWidth, opacity: 0 } })); window.setTimeout(() => deleteOne(n.id), 180); } else setSwipeOffsets(p => ({ ...p, [n.id]: { x: 0, opacity: 1 } })); }}
                      onPointerCancel={() => { swipeStarts.current.delete(n.id); setSwipeOffsets(p => ({ ...p, [n.id]: { x: 0, opacity: 1 } })); }}
                      className="notification-card"
                      style={{
                        padding: 'clamp(15px, 3vw, 22px) clamp(14px, 3vw, 24px)',
                        borderBottom: idx < displayed.length - 1 ? '1px solid #f1f5f9' : 'none',
                        background: !n.is_read ? (isUrgentBooking ? '#fff7f6' : '#f0fbf5') : '#fff',
                        boxShadow: !n.is_read ? (isUrgentBooking ? 'inset 4px 0 0 #e11d48' : 'inset 4px 0 0 #059669') : 'none',
                        borderBottom: idx < displayed.length - 1 ? '1px solid #edf2ef' : 'none',
                        position: 'relative', touchAction: 'pan-y', willChange: 'transform, opacity',
                        transform: 'translate3d(' + (swipeOffsets[n.id]?.x || 0) + 'px,0,0)', opacity: swipeOffsets[n.id]?.opacity ?? 1,
                        transition: swipeStarts.current.has(n.id) ? 'none' : 'transform 220ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease',
                      }}
                    >
                      {!n.is_read && (
                        <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: '50%', background: '#059669' }} />
                      )}

                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        {/* Icon */}
                        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${meta.color}14`, border: `1px solid ${meta.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <meta.icon size={20} color={meta.color} strokeWidth={2} aria-hidden="true" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Title + time */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                              <p style={{ margin: 0, fontSize: 15, fontWeight: n.is_read ? 600 : 800, color: '#10231d', letterSpacing: n.is_read ? 0 : '-.01em', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                {n.title}
                              </p>
                              {!n.is_read && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 999, background: '#d1fae5', color: '#047857', fontSize: 10, fontWeight: 900, letterSpacing: '.04em', textTransform: 'uppercase' }}><span style={{ width: 5, height: 5, borderRadius: 99, background: '#059669' }} />New</span>}
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 999, background: `${meta.color}12`, color: meta.color, fontSize: 9, fontWeight: 850, textTransform: 'uppercase', letterSpacing: '.045em' }}>{meta.label}</span>
                              {meta.isUrgent && <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 7px',borderRadius:999,background:'#fff0ef',color:'#b42332',fontSize:9,fontWeight:900,textTransform:'uppercase',letterSpacing:'.04em'}}><Siren size={11}/> Important</span>}
                            </div>
                            <span style={{ fontSize: 12, color: '#819188', flexShrink: 0, fontSize: 11 }}>
                              {formatDate(n.created_at)}
                            </span>
                          </div>

                          {/* Message */}
                          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                            {n.message || n.body || 'You have a new update from Altuvera.'}
                          </p>

                          {contextRows.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                              {contextRows.map(([label, value]) => (
                                <span key={label} style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 4, maxWidth: '100%', padding: '6px 8px', borderRadius: 9, background: '#f5faf7', border: '1px solid #e4f0e8', color: '#52675c', fontSize: 10, lineHeight: 1.4 }}>
                                  <strong style={{ color: '#82948a', fontWeight: 750 }}>{label}</strong>
                                  <span style={{ fontWeight: 750, overflowWrap: 'anywhere' }}>{String(value)}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {readSessionExpiry(n) && (
                            <div role="status" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 10, padding: "7px 10px", borderRadius: 9, background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 700 }}>
                              <ShieldCheck size={14} />
                              {formatRemaining(readSessionExpiry(n), clockNow)}
                            </div>
                          )}

                          {/* Action link */}
                          {hasAction && (
                            <a href={getNotificationActionUrl(n)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 11, padding: '9px 12px', borderRadius: 11, background: meta.color, color: '#fff', boxShadow: `0 4px 12px ${meta.color}22`, fontSize: 11, fontWeight: 850, textDecoration: 'none', maxWidth: '100%' }}
                              onClick={() => !n.is_read && markRead(n.id)}>
                              {n.action_label || n.actionLabel || (meta.isMessage ? 'Open conversation' : 'View details')} <ArrowUpRight size={14}/>
                            </a>
                          )}

                          {/* Admin reply */}
                          {n.admin_reply && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}
                            >
                              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                                Reply from Altuvera Team
                              </p>
                              <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.6 }}>
                                {n.admin_reply}
                              </p>
                            </motion.div>
                          )}

                          {/* User's reply */}
                          {(n.reply_text || n.replyText) && (
                            <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                                Your reply: {n.reply_text || n.replyText}
                                {!n.admin_reply && (
                                  <span style={{ marginLeft: 8, color: '#94a3b8', fontStyle: 'italic' }}>(awaiting response)</span>
                                )}
                              </p>
                            </div>
                          )}

                          {/* Reply form */}
                          <AnimatePresence>
                            {replyingId === n.id && !(n.reply_text || n.replyText) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ marginTop: 12, overflow: 'hidden' }}
                              >
                                <textarea
                                  value={replyTexts[n.id] || ''}
                                  onChange={e => setReplyTexts(p => ({ ...p, [n.id]: e.target.value }))}
                                  placeholder="Write your reply to the team…"
                                  rows={3}
                                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                                  autoFocus
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(n.id);
                                    if (e.key === 'Escape') setReplyingId(null);
                                  }}
                                />
                                <p style={{ margin: '4px 0 8px', fontSize: 11, color: '#94a3b8' }}>
                                  Press Ctrl+Enter to send
                                </p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    onClick={() => handleReply(n.id)}
                                    disabled={!replyTexts[n.id]?.trim() || sending[n.id]}
                                    style={{ padding: '8px 18px', borderRadius: 8, background: '#059669', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: replyTexts[n.id]?.trim() ? 'pointer' : 'not-allowed', opacity: replyTexts[n.id]?.trim() ? 1 : 0.5 }}
                                  >
                                    {sending[n.id] ? 'Sending…' : 'Send Reply'}
                                  </button>
                                  <button
                                    onClick={() => setReplyingId(null)}
                                    style={{ padding: '8px 14px', borderRadius: 8, background: '#f1f5f9', color: '#64748b', border: 'none', fontSize: 13, cursor: 'pointer' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {!n.is_read && (
                              <button onClick={() => markRead(n.id)} style={btnStyle('#059669')}>
                                ✓ Mark read
                              </button>
                            )}
                            <button onClick={() => deleteOne(n.id)} style={btnStyle('#ef4444')}>
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {hasMore && (
                <div style={{ textAlign: 'center', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                  <button onClick={loadMore} disabled={loading} style={{ padding: '10px 28px', borderRadius: 10, border: '1.5px solid #059669', background: '#fff', color: '#059669', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    {loading ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}

          <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
        </DashboardLayout>
      </>
    );
  }