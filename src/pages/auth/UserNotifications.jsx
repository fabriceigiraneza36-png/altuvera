import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, CalendarDays, Check, CheckCheck, ChevronDown, ExternalLink,
  Filter, Inbox, MessageCircle, MoreHorizontal, RefreshCw, Search, Trash2, X,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { getNotificationActionUrl, getNotificationPresentation } from "../../utils/notificationPresentation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { useNotifications } from "../../hooks/useNotifications";
import { useBrowserPush } from "../../hooks/useBrowserPush";

const notificationDate = (notification) => {
  const value = notification?.created_at || notification?.createdAt;
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

const dateGroupLabel = (date, now = new Date()) => {
  if (!date) return "Earlier";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((today.getTime() - day.getTime()) / 86400000);
  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return "This week";
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return "This month";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const formatNotificationTime = (date) => {
  if (!date) return "Recently";
  const sameDay = date.toDateString() === new Date().toDateString();
  return date.toLocaleString("en-US", sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const actionButtonStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
  minHeight: 38, padding: "9px 12px", border: "1px solid #dce8e1", borderRadius: 11,
  background: "#fff", color: "#456155", fontSize: 12, fontWeight: 700, cursor: "pointer",
};

export default function UserNotifications() {
  const {
    notifications = [], groupedNotifications, unreadCount = 0, loading = false,
    hasMore, total = 0, tripAlerts = [], dismissTripAlert, dismissAllTripAlerts,
    markRead, markAllRead, deleteOne, clearAll, loadMore, refresh, reply,
  } = useNotifications();
  const browserPush = useBrowserPush();
  const grouped = useMemo(() => groupedNotifications || { all: [], booking: [], system: [] }, [groupedNotifications]);

  const [tab, setTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [replyingId, setReplyingId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [sending, setSending] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    if (!openMenuId) return undefined;
    const closeOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpenMenuId(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openMenuId]);

  const displayed = useMemo(() => {
    const source = tab === "bookings" ? grouped.booking : tab === "updates" ? grouped.system : grouped.all;
    const query = searchText.trim().toLowerCase();
    return [...source]
      .filter((item) => !unreadOnly || !item.is_read)
      .filter((item) => !query || [item.title, item.message, item.type].some((value) => String(value || "").toLowerCase().includes(query)))
      .sort((a, b) => (notificationDate(b)?.getTime() || 0) - (notificationDate(a)?.getTime() || 0));
  }, [tab, grouped, searchText, unreadOnly]);

  const dateGroups = useMemo(() => {
    const groups = [];
    const indexByLabel = new Map();
    displayed.forEach((item) => {
      const label = dateGroupLabel(notificationDate(item));
      let index = indexByLabel.get(label);
      if (index === undefined) {
        index = groups.length;
        indexByLabel.set(label, index);
        groups.push({ label, items: [] });
      }
      groups[index].items.push(item);
    });
    return groups;
  }, [displayed]);

  const tabs = useMemo(() => [
    { key: "all", label: "All", count: grouped.all.length, icon: Inbox },
    { key: "bookings", label: "Bookings", count: grouped.booking.length, icon: CalendarDays },
    { key: "updates", label: "Updates", count: grouped.system.length, icon: Bell },
  ], [grouped]);

  const handleReply = async (id) => {
    const message = replyTexts[id]?.trim();
    if (!message || !reply) return;
    setSending((previous) => ({ ...previous, [id]: true }));
    try {
      await reply(id, message);
      setReplyingId(null);
      setReplyTexts((previous) => ({ ...previous, [id]: "" }));
    } catch {
      // The notification hook exposes and logs its request failure.
    } finally {
      setSending((previous) => ({ ...previous, [id]: false }));
    }
  };

  const handleOpenNotification = (item) => {
    if (!item.is_read) markRead(item.id);
  };

  const openRelatedItem = (item) => {
    if (!item.is_read) markRead(item.id);
    setOpenMenuId(null);
  };

  return (
    <>
      <Helmet>
        <title>Notifications | Altuvera Safaris</title>
        <meta name="description" content="View your Altuvera booking, travel and account notifications." />
      </Helmet>

      <DashboardLayout>
        <div className="notifications-page">
          <header className="notifications-page-header">
            <div className="notifications-page-heading">
              <span className="notifications-eyebrow">ACCOUNT ACTIVITY</span>
              <h1>Notifications</h1>
              <p>Important updates, arranged by the time they arrived.</p>
            </div>
            <div className="notifications-stats" aria-label="Notification totals">
              <div className="notifications-stat">
                <strong>{total || notifications.length}</strong>
                <span>Total</span>
              </div>
              <div className="notifications-stat notifications-stat-unread">
                <strong>{unreadCount}</strong>
                <span>Unread</span>
              </div>
            </div>
          </header>

          {browserPush.showReminder && (
            <motion.section
              className="notifications-push-reminder"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              aria-live="polite"
            >
              <span className="notifications-push-icon"><Bell size={18} /></span>
              <div className="notifications-push-copy">
                <strong>Receive important updates</strong>
                <p>
                  Enable browser notifications for booking, message and account alerts.
                  {browserPush.permission === "denied" ? " Allow notifications in your browser settings, then check again." : ""}
                </p>
                {browserPush.error && <small role="alert">{browserPush.error}</small>}
              </div>
              <button
                type="button"
                onClick={browserPush.permission === "denied" ? browserPush.refresh : browserPush.enablePush}
                disabled={browserPush.loading}
              >
                {browserPush.loading ? "Enabling…" : browserPush.permission === "denied" ? "Check again" : "Enable"}
              </button>
            </motion.section>
          )}

          {tripAlerts.length > 0 && (
            <section className="notifications-trip-alerts" aria-label="Upcoming trip reminders">
              <div className="notifications-trip-heading">
                <div>
                  <strong>Upcoming trip reminders</strong>
                  <span>{tripAlerts.length} active</span>
                </div>
                <button type="button" onClick={dismissAllTripAlerts}>Dismiss all</button>
              </div>
              {tripAlerts.map((alert) => (
                <div className={"notifications-trip-row notifications-trip-" + (alert.type || "info")} key={alert.id}>
                  <div>
                    <p>{alert.message}</p>
                    {alert.travelDate && <time>{new Date(alert.travelDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</time>}
                  </div>
                  <button type="button" onClick={() => dismissTripAlert(alert.id)} aria-label="Dismiss trip reminder"><X size={16} /></button>
                </div>
              ))}
            </section>
          )}

          <section className="notifications-tools" aria-label="Notification filters and actions">
            <div className="notifications-search-row">
              <label className="notifications-search">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search notifications"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search notifications"
                />
                {searchText && (
                  <button type="button" onClick={() => setSearchText("")} aria-label="Clear search"><X size={15} /></button>
                )}
              </label>
              <button
                type="button"
                className="notifications-filter-toggle"
                onClick={() => setFiltersExpanded((value) => !value)}
                aria-expanded={filtersExpanded}
              >
                <Filter size={16} />
                Filters and actions
                <ChevronDown size={15} className={filtersExpanded ? "is-expanded" : ""} />
              </button>
            </div>

            <div className="notifications-filter-controls" data-open={filtersExpanded}>
              <div className="notifications-action-row">
                <button
                  type="button"
                  style={{
                    ...actionButtonStyle,
                    background: unreadOnly ? "#eaf7f0" : "#fff",
                    borderColor: unreadOnly ? "#b6dfc9" : "#dce8e1",
                    color: unreadOnly ? "#087b54" : "#456155",
                  }}
                  onClick={() => setUnreadOnly((value) => !value)}
                  aria-pressed={unreadOnly}
                >
                  <Filter size={15} /> {unreadOnly ? "Unread only: On" : "Unread only"}
                </button>
                {unreadCount > 0 && (
                  <button type="button" style={{ ...actionButtonStyle, color: "#087b54", background: "#eff9f3", borderColor: "#c5e8d4" }} onClick={markAllRead}>
                    <CheckCheck size={15} /> Mark all read
                  </button>
                )}
                <button type="button" style={actionButtonStyle} onClick={refresh} disabled={loading}>
                  <RefreshCw size={15} className={loading ? "notifications-spin" : ""} /> {loading ? "Refreshing…" : "Refresh"}
                </button>
                {notifications.length > 0 && (
                  <button type="button" className="notifications-clear-button" onClick={clearAll}>
                    <Trash2 size={15} /> Clear all
                  </button>
                )}
              </div>

              <div className="notifications-tabs" role="tablist" aria-label="Notification categories">
                {tabs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.key}
                      role="tab"
                      aria-selected={tab === item.key}
                      onClick={() => setTab(item.key)}
                      className={tab === item.key ? "active" : ""}
                    >
                      <Icon size={16} />
                      {item.label}
                      <span>{item.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {loading && displayed.length === 0 ? (
            <div className="notifications-empty">
              <span className="notifications-loader" />
              <p>Loading notifications…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="notifications-empty">
              <span className="notifications-empty-icon"><Inbox size={26} /></span>
              <strong>{searchText || unreadOnly ? "No matching notifications" : "You’re all caught up"}</strong>
              <p>{searchText ? "Try a different search phrase." : unreadOnly ? "There are no unread notifications right now." : "New booking, travel and account updates will appear here."}</p>
            </div>
          ) : (
            <div className="notifications-list">
              <AnimatePresence initial={false}>
                {dateGroups.map((group) => (
                  <section className="notifications-date-group" key={group.label}>
                    <div className="notifications-date-heading">
                      <span>{group.label}</span>
                      <span>{group.items.length}</span>
                    </div>
                    {group.items.map((item) => {
                      const meta = getNotificationPresentation(item);
                      const Icon = meta.icon;
                      const actionUrl = getNotificationActionUrl(item);
                      const hasAction = Boolean(item.action_url || item.actionUrl || meta.isMessage);
                      const isMenuOpen = openMenuId === item.id;
                      const canReply = String(item.type || "").toLowerCase() === "contact_message" && !(item.reply_text || item.replyText);

                      return (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className={"notification-entry" + (!item.is_read ? " is-unread" : "")}
                          onClick={() => handleOpenNotification(item)}
                        >
                          <span className="notification-entry-icon" style={{ color: meta.color, background: meta.color + "12" }}>
                            <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
                          </span>

                          <div className="notification-entry-content">
                            <div className="notification-entry-heading">
                              <div className="notification-entry-title-wrap">
                                <h3>{item.title || meta.label}</h3>
                                {!item.is_read && <span className="notification-unread-label">New</span>}
                              </div>
                              <time dateTime={notificationDate(item)?.toISOString() || undefined}>
                                {formatNotificationTime(notificationDate(item))}
                              </time>
                            </div>
                            <p className="notification-entry-message">{item.message || item.body || "You have a new update from Altuvera."}</p>
                            <span className="notification-entry-category">{meta.label}</span>

                            {replyingId === item.id && canReply && (
                              <div className="notification-reply" onClick={(event) => event.stopPropagation()}>
                                <textarea
                                  rows={3}
                                  value={replyTexts[item.id] || ""}
                                  onChange={(event) => setReplyTexts((previous) => ({ ...previous, [item.id]: event.target.value }))}
                                  placeholder="Write a reply to the Altuvera team…"
                                  aria-label="Reply to notification"
                                />
                                <div>
                                  <button type="button" onClick={() => handleReply(item.id)} disabled={!replyTexts[item.id]?.trim() || sending[item.id]}>
                                    {sending[item.id] ? "Sending…" : "Send reply"}
                                  </button>
                                  <button type="button" className="secondary" onClick={() => setReplyingId(null)}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div
                            className="notification-entry-actions"
                            ref={isMenuOpen ? menuRef : null}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="notification-more-button"
                              aria-label={"Actions for " + (item.title || "notification")}
                              aria-haspopup="menu"
                              aria-expanded={isMenuOpen}
                              onClick={() => setOpenMenuId((current) => current === item.id ? null : item.id)}
                            >
                              <MoreHorizontal size={19} />
                            </button>
                            {isMenuOpen && (
                              <div className="notification-action-menu" role="menu">
                                {hasAction && (
                                  <a role="menuitem" href={actionUrl} onClick={() => openRelatedItem(item)}>
                                    <ExternalLink size={15} /> Open related item
                                  </a>
                                )}
                                {canReply && (
                                  <button type="button" role="menuitem" onClick={() => { setReplyingId(item.id); setOpenMenuId(null); }}>
                                    <MessageCircle size={15} /> Reply to Altuvera
                                  </button>
                                )}
                                {!item.is_read && (
                                  <button type="button" role="menuitem" onClick={() => { markRead(item.id); setOpenMenuId(null); }}>
                                    <Check size={15} /> Mark as read
                                  </button>
                                )}
                                <button type="button" role="menuitem" className="notification-action-danger" onClick={() => { deleteOne(item.id); setOpenMenuId(null); }}>
                                  <Trash2 size={15} /> Dismiss notification
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.article>
                      );
                    })}
                  </section>
                ))}
              </AnimatePresence>

              {hasMore && (
                <div className="notifications-load-more">
                  <button type="button" onClick={loadMore} disabled={loading}>
                    {loading ? "Loading…" : "Load older notifications"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
          .notifications-page{width:100%;max-width:1120px;margin:0 auto;color:#142a20}
          .notifications-page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin:0 0 15px;padding:2px}
          .notifications-page-heading{min-width:0}
          .notifications-eyebrow{display:block;margin-bottom:7px;color:#16845d;font-size:10px;font-weight:800;letter-spacing:.15em}
          .notifications-page-heading h1{margin:0;color:#152b21;font-size:clamp(25px,3.2vw,34px);line-height:1.15;letter-spacing:-.04em;font-weight:800}
          .notifications-page-heading p{margin:5px 0 0;color:#718178;font-size:12px;line-height:1.45}
          .notifications-stats{display:flex;gap:8px;flex:0 0 auto}
          .notifications-stat{min-width:68px;padding:8px 10px;border:1px solid #e5eee8;border-radius:11px;background:#fff}
          .notifications-stat strong{display:block;color:#183d2d;font-size:18px;line-height:1.1;font-weight:800;font-variant-numeric:tabular-nums}
          .notifications-stat span{display:block;margin-top:4px;color:#84938b;font-size:10px;font-weight:650}
          .notifications-stat-unread strong{color:#078456}
          .notifications-push-reminder{display:flex;align-items:center;gap:12px;margin:0 0 16px;padding:13px 15px;border:1px solid #d9ece1;border-radius:14px;background:#f8fcf9}
          .notifications-push-icon{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:11px;background:#e6f5ec;color:#087b54}
          .notifications-push-copy{min-width:0;flex:1}
          .notifications-push-copy strong{display:block;color:#204233;font-size:12px;font-weight:800}
          .notifications-push-copy p{margin:3px 0 0;color:#718178;font-size:11px;line-height:1.5}
          .notifications-push-copy small{display:block;margin-top:4px;color:#b42332;font-size:11px}
          .notifications-push-reminder>button{flex:0 0 auto;min-height:34px;padding:8px 13px;border:0;border-radius:10px;background:#087b54;color:#fff;font-size:11px;font-weight:800;cursor:pointer}
          .notifications-push-reminder>button:disabled{opacity:.6;cursor:wait}
          .notifications-trip-alerts{margin:0 0 16px;border:1px solid #e7eee8;border-radius:14px;background:#fff;overflow:hidden}
          .notifications-trip-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 14px;background:#fbfdfb}
          .notifications-trip-heading>div{display:flex;align-items:center;gap:9px;min-width:0}
          .notifications-trip-heading strong{color:#29483a;font-size:12px;font-weight:800}
          .notifications-trip-heading span{color:#8b9a92;font-size:10px}
          .notifications-trip-heading button{border:0;background:transparent;color:#8a9890;font-size:11px;font-weight:700;cursor:pointer}
          .notifications-trip-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid #eef3ef}
          .notifications-trip-row p{margin:0;color:#455a4e;font-size:12px;line-height:1.5}
          .notifications-trip-row time{display:block;margin-top:3px;color:#8c9a92;font-size:10px}
          .notifications-trip-row>button{display:grid;place-items:center;width:30px;height:30px;flex:0 0 30px;border:0;border-radius:9px;background:transparent;color:#87958d;cursor:pointer}
          .notifications-trip-urgent p{color:#9f2f36}
          .notifications-trip-warning p{color:#936b20}
          .notifications-tools{margin:0 0 12px;padding:10px;border:1px solid #e5eee8;border-radius:13px;background:#fff;box-shadow:0 2px 9px rgba(17,54,36,.02)}
          .notifications-search-row{display:flex;align-items:center;gap:9px}
          .notifications-search{display:flex;align-items:center;gap:9px;flex:1;min-width:0;padding:0 12px;border:1px solid #e2ebe5;border-radius:11px;background:#fafcfb;color:#819189}
          .notifications-search input{width:100%;min-width:0;padding:9px 0;border:0;outline:0;background:transparent;color:#18382a;font:inherit;font-size:12px}
          .notifications-search input::placeholder{color:#9aa79f}
          .notifications-search>button{display:grid;place-items:center;width:26px;height:26px;border:0;border-radius:8px;background:transparent;color:#819189;cursor:pointer}
          .notifications-filter-toggle{display:none;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:8px 11px;border:1px solid #dfeae3;border-radius:11px;background:#fff;color:#426052;font-size:11px;font-weight:750;white-space:nowrap;cursor:pointer}
          .notifications-filter-toggle .is-expanded{transform:rotate(180deg)}
          .notifications-filter-controls{display:flex;flex-direction:column;gap:8px;margin-top:8px}
          .notifications-action-row{display:flex;align-items:center;flex-wrap:wrap;gap:7px}
          .notifications-clear-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:8px 12px;border:1px solid #f0dede;border-radius:11px;background:#fffafa;color:#ac4d52;font-size:12px;font-weight:700;cursor:pointer}
          .notifications-tabs{display:flex;gap:6px;overflow-x:auto;padding:1px 0 2px;scrollbar-width:none}
          .notifications-tabs::-webkit-scrollbar{display:none}
          .notifications-tabs button{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;min-height:36px;padding:8px 12px;border:1px solid transparent;border-radius:10px;background:#f7faf8;color:#67796f;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer}
          .notifications-tabs button.active{border-color:#c7e6d3;background:#edf8f1;color:#087b54}
          .notifications-tabs button span{min-width:19px;padding:2px 5px;border-radius:99px;background:#e8efea;color:#718078;text-align:center;font-size:10px}
          .notifications-tabs button.active span{background:#d4efdf;color:#087b54}
          .notifications-list{display:flex;flex-direction:column;gap:11px}
          .notifications-date-group{min-width:0}
          .notifications-date-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 3px 5px;color:#87968e;font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
          .notifications-date-heading span:last-child{font-weight:650;letter-spacing:0}
          .notification-entry{position:relative;display:flex;align-items:flex-start;gap:9px;min-width:0;margin:0;padding:10px 11px;border:1px solid #e8eee9;border-radius:12px;background:#fff;transition:border-color .16s ease,background .16s ease,box-shadow .16s ease;cursor:pointer}
          .notification-entry+.notification-entry{margin-top:6px}
          .notification-entry:hover{border-color:#d3e7da;box-shadow:0 4px 16px rgba(20,70,45,.035)}
          .notification-entry.is-unread{border-color:#d6eadc;background:#fbfefc}
          .notification-entry-icon{display:grid;place-items:center;width:33px;height:33px;flex:0 0 33px;border-radius:10px}
          .notification-entry-content{flex:1;min-width:0;padding-right:2px}
          .notification-entry-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0}
          .notification-entry-title-wrap{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
          .notification-entry-title-wrap h3{margin:0;color:#1c3528;font-size:12px;line-height:1.35;font-weight:750;overflow-wrap:anywhere}
          .notification-unread-label{padding:3px 6px;border-radius:99px;background:#e5f5eb;color:#087b54;font-size:9px;font-weight:850;letter-spacing:.03em;text-transform:uppercase}
          .notification-entry-heading time{flex:0 0 auto;padding-top:2px;color:#8c9a92;font-size:10px;white-space:nowrap}
          .notification-entry-message{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;margin:4px 0 0;color:#586b61;font-size:11px;line-height:1.45;white-space:normal;overflow-wrap:anywhere;word-break:break-word}
          .notification-entry-category{display:none}
          .notification-entry-actions{position:relative;flex:0 0 32px}
          .notification-more-button{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:9px;background:transparent;color:#718178;cursor:pointer}
          .notification-more-button:hover,.notification-more-button[aria-expanded="true"]{background:#edf6f0;color:#087b54}
          .notification-entry:has(.notification-action-menu){z-index:1000;isolation:isolate}
          .notification-action-menu{position:absolute;z-index:1001;top:37px;right:0;width:min(228px,calc(100vw - 54px));padding:5px;border:1px solid #e2ebe5;border-radius:12px;background:#fff;box-shadow:0 14px 38px rgba(13,43,28,.15)}
          .notifications-date-group:last-child .notification-entry:last-child .notification-action-menu{top:auto;bottom:34px;transform-origin:bottom right}
          .notification-action-menu button,.notification-action-menu a{display:flex;align-items:center;gap:10px;width:100%;min-height:38px;padding:8px 10px;border:0;border-radius:8px;background:transparent;color:#344e40;text-align:left;text-decoration:none;font:inherit;font-size:11px;font-weight:700;cursor:pointer}
          .notification-action-menu button:hover,.notification-action-menu a:hover{background:#f4f8f5}
          .notification-action-menu .notification-action-danger{color:#b34e55}
          .notification-action-menu .notification-action-danger:hover{background:#fff5f5}
          .notification-reply{margin-top:8px}
          .notification-reply textarea{width:100%;box-sizing:border-box;padding:8px 9px;border:1px solid #dce8e0;border-radius:9px;outline:none;color:#21392c;font:inherit;font-size:11px;resize:vertical}
          .notification-reply>div{display:flex;gap:6px;margin-top:6px}
          .notification-reply button{min-height:32px;padding:7px 11px;border:0;border-radius:9px;background:#087b54;color:#fff;font-size:11px;font-weight:750;cursor:pointer}
          .notification-reply button:disabled{opacity:.5;cursor:not-allowed}
          .notification-reply button.secondary{background:#f1f5f2;color:#64756b}
          .notifications-load-more{display:flex;justify-content:center;padding:12px 0 3px}
          .notifications-load-more button{min-height:38px;padding:9px 16px;border:1px solid #cfe6d7;border-radius:10px;background:#fff;color:#087b54;font-size:11px;font-weight:750;cursor:pointer}
          .notifications-load-more button:disabled{opacity:.5;cursor:wait}
          .notifications-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:170px;padding:22px 16px;border:1px dashed #dce7e0;border-radius:14px;background:#fff;text-align:center}
          .notifications-empty-icon{display:grid;place-items:center;width:54px;height:54px;margin-bottom:12px;border-radius:16px;background:#eff8f2;color:#087b54}
          .notifications-empty strong{color:#294638;font-size:14px;font-weight:800}
          .notifications-empty p{max-width:360px;margin:6px 0 0;color:#85938b;font-size:12px;line-height:1.6}
          .notifications-loader{width:28px;height:28px;margin:0 auto 10px;border:3px solid #e5eee8;border-top-color:#07855a;border-radius:50%;animation:notifications-spin 1s linear infinite}
          .notifications-spin{animation:notifications-spin 1s linear infinite}
          @keyframes notifications-spin{to{transform:rotate(360deg)}}
          @media(max-width:700px){
            .notifications-date-group:last-child .notification-entry:last-child .notification-action-menu{top:auto;bottom:34px;}
            .notifications-page-header{align-items:flex-start;gap:12px;margin-bottom:16px}
            .notifications-stats{gap:6px}
            .notifications-stat{min-width:59px;padding:8px 9px}
            .notifications-stat strong{font-size:17px}
            .notifications-stat span{font-size:9px}
            .notifications-page-heading p{font-size:12px}
            .notifications-filter-toggle{display:inline-flex}
            .notifications-filter-controls{display:none}
            .notifications-filter-controls[data-open="true"]{display:flex}
            .notifications-filter-controls[data-open="true"] .notifications-action-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
            .notifications-action-row button{min-width:0;width:100%;justify-content:center;font-size:10px!important}
            .notifications-clear-button{grid-column:span 2}
            .notifications-tabs{width:100%}
            .notifications-tabs button{flex:1 0 auto;justify-content:center}
            .notifications-push-reminder{align-items:flex-start;gap:9px;padding:11px}
            .notifications-push-copy p{font-size:10px}
            .notifications-push-reminder>button{padding:8px 10px;font-size:10px}
            .notification-entry{gap:8px;padding:9px 9px}
            .notification-entry-icon{width:31px;height:31px;flex-basis:31px;border-radius:9px}
            .notification-entry-title-wrap h3{font-size:11px}
            .notification-entry-message{font-size:10.5px;line-height:1.45}
            .notification-entry-heading{gap:6px}
            .notification-entry-heading time{font-size:9px}
            .notification-entry-actions{flex-basis:30px}
            .notification-more-button{width:30px;height:30px}
            .notification-action-menu{right:0;top:34px}
          }
          @media(max-width:420px){
            .notifications-page-header{flex-wrap:wrap}
            .notifications-stats{margin-left:auto}
            .notifications-search-row{align-items:stretch}
            .notifications-filter-toggle{font-size:0;gap:5px;padding:8px 10px}
            .notifications-filter-toggle svg{flex:0 0 auto}
            .notification-entry{padding:9px 8px}
            .notification-entry-heading{flex-direction:column;gap:2px}
            .notification-entry-heading time{order:2;padding-top:0}
          }
          @media(prefers-reduced-motion:reduce){
            .notifications-page *, .notifications-page *::before, .notifications-page *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
          }
        `}</style>
      </DashboardLayout>
    </>
  );
}
