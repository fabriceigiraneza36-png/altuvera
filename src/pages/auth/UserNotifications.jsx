  // src/pages/Notifications.jsx
  import React, { useState, useMemo, useRef, useEffect } from 'react';
  import {
    Bell, CalendarDays, Pencil, CheckCircle2, XCircle, Trash2,
    CreditCard, Wallet, Map, Globe2, FileText, Package, ClipboardList,
    PartyPopper, Newspaper, AlertTriangle, Siren, Settings, MessageCircle,
    ShieldCheck, CheckCheck,
  } from 'lucide-react';
  import { Helmet }     from 'react-helmet-async';
  import { motion, AnimatePresence } from 'framer-motion';
  import DashboardLayout from '../../components/auth/DashboardLayout';
  import { useNotifications } from '../../hooks/useNotifications';

  const TYPE_META = {
    booking_created: { icon: CalendarDays, color: '#059669' },
    booking_updated: { icon: Pencil, color: '#0ea5e9' },
    booking_confirmed: { icon: CheckCircle2, color: '#16a34a' },
    booking_cancelled: { icon: XCircle, color: '#dc2626' },
    booking_deleted: { icon: Trash2, color: '#7c3aed' },
    payment_confirmed: { icon: CreditCard, color: '#059669' },
    payment_request: { icon: Wallet, color: '#d97706' },
    new_destination: { icon: Map, color: '#0891b2' },
    new_country: { icon: Globe2, color: '#0891b2' },
    new_post: { icon: FileText, color: '#7c3aed' },
    new_package: { icon: Package, color: '#d97706' },
    checklist_request: { icon: ClipboardList, color: '#059669' },
    checklist_ready: { icon: CheckCheck, color: '#16a34a' },
    promotion: { icon: PartyPopper, color: '#db2777' },
    newsletter: { icon: Newspaper, color: '#059669' },
    warning: { icon: AlertTriangle, color: '#f59e0b' },
    alert: { icon: Siren, color: '#dc2626' },
    login_success: { icon: ShieldCheck, color: '#059669' },
    user_login_success: { icon: ShieldCheck, color: '#059669' },
    system: { icon: Settings, color: '#64748b' },
    general: { icon: MessageCircle, color: '#059669' },
  };

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
      markRead, markAllRead, deleteOne, clearAll, loadMore, refresh,
    } = useNotifications();

    const grouped = useMemo(() => groupedNotifications || { all: [], booking: [], system: [] }, [groupedNotifications]);

    const [tab,        setTab]        = useState('all');
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
      if (tab === 'bookings') return grouped.booking;
      if (tab === 'updates')  return grouped.system;
      return grouped.all;
    }, [tab, grouped]);

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

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={22} color="#059669" aria-hidden="true" />
              <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                {total} notification{total !== 1 ? 's' : ''}
                {unreadCount > 0 && (
                  <span style={{ marginLeft: 8, background: '#059669', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 8px' }}>
                    {unreadCount} new
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #059669', background: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  ✓ Mark all read
                </button>
              )}
              <button onClick={refresh} disabled={loading} style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
              {notifications.length > 0 && (
                <button onClick={clearAll} style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 13, cursor: 'pointer' }}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: tab === t.key ? '#fff' : 'transparent',
                color: tab === t.key ? '#059669' : '#64748b',
                fontWeight: tab === t.key ? 700 : 500, fontSize: 13, cursor: 'pointer',
                boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 10, background: tab === t.key ? '#ecfdf5' : '#e2e8f0', color: tab === t.key ? '#059669' : '#64748b', borderRadius: 999, padding: '1px 5px', fontWeight: 700 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

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
              <p style={{ color: '#64748b', margin: 0 }}>No {tab === 'all' ? '' : tab} notifications yet.</p>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <AnimatePresence initial={false}>
                {displayed.map((n, idx) => {
                  const meta = TYPE_META[n.type] || TYPE_META.general;
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
                        padding: '18px 24px',
                        borderBottom: idx < displayed.length - 1 ? '1px solid #f1f5f9' : 'none',
                        background: n.is_read ? '#fff' : '#f0fdf4',
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
                        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <meta.icon size={20} color={meta.color} strokeWidth={2} aria-hidden="true" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Title + time */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: n.is_read ? 600 : 800, color: '#0f172a' }}>
                              {n.title}
                            </p>
                            <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                              {formatDate(n.created_at)}
                            </span>
                          </div>

                          {/* Message */}
                          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                            {n.message}
                          </p>

                          {readSessionExpiry(n) && (
                            <div role="status" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 10, padding: "7px 10px", borderRadius: 9, background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 700 }}>
                              <ShieldCheck size={14} />
                              {formatRemaining(readSessionExpiry(n), clockNow)}
                            </div>
                          )}

                          {/* Action link */}
                          {n.action_url && (
                            <a href={n.action_url} style={{ display: 'inline-block', marginTop: 10, padding: '6px 14px', borderRadius: 8, background: `${meta.color}12`, color: meta.color, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                              onClick={() => !n.is_read && markRead(n.id)}>
                              {n.action_label || 'View Details'} →
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
                              🗑️ Dismiss
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