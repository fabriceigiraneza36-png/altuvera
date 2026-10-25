import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BellRing, Check, MessageCircle, Send, X, CalendarDays, Pencil, CheckCircle2, ClipboardList, AlertTriangle, Siren, Settings, ChevronDown, ChevronUp, UsersRound } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

const API_BASE = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const getToken = () => {
  try {
    return localStorage.getItem("altuvera_auth_token") ||
      sessionStorage.getItem("altuvera_auth_token") ||
      localStorage.getItem("auth_token") || "";
  } catch { return ""; }
};

const TYPE_META = {
  booking_created: [CalendarDays, "#059669"],
  booking_updated: [Pencil, "#0ea5e9"],
  booking_confirmed: [CheckCircle2, "#16a34a"],
  checklist_request: [ClipboardList, "#059669"],
  checklist_ready: [CheckCircle2, "#16a34a"],
  warning: [AlertTriangle, "#d97706"],
  alert: [Siren, "#dc2626"],
  system: [Settings, "#64748b"],
  message_received: [MessageCircle, "#059669"],
  general: [MessageCircle, "#059669"],
};

const conversationIdOf = (notification) =>
  notification?.conversation_id ||
  notification?.conversationId ||
  notification?.metadata?.conversationId ||
  notification?.metadata?.conversation_id ||
  null;

export default function GlobalUserNotifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, deleteOne } = useNotifications();
  const [visible, setVisible] = useState(null);
  const swipeStartX = useRef(null);
  const swipeDeltaX = useRef(0);
  const [replyText, setReplyText] = useState("");
  const [replyExpanded, setReplyExpanded] = useState(false);
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [seen, setSeen] = useState(() => {
    try {
      return new Set(JSON.parse(sessionStorage.getItem("altuvera:global-notifications") || "[]"));
    } catch { return new Set(); }
  });

  useEffect(() => {
    const fresh = notifications.find((item) =>
      !item.is_read && !seen.has(String(item.id))
    );
    if (!fresh) return;
    setVisible(fresh);
    setReplyText("");
    setReplyExpanded(false);
    setReplyError("");
    const next = new Set(seen);
    next.add(String(fresh.id));
    setSeen(next);
    try {
      sessionStorage.setItem("altuvera:global-notifications", JSON.stringify([...next].slice(-100)));
    } catch {}
  }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visible) return undefined;
    const timer = window.setTimeout(() => {
      // A toast is considered seen after it has remained visible. Clear the
      // persisted alert as well as dismissing the visual toast.
      markRead(visible.id);
      deleteOne(visible.id);
      setVisible((current) => current?.id === visible.id ? null : current);
    }, 18000);
    return () => window.clearTimeout(timer);
  }, [visible, markRead, deleteOne]);

  const meta = useMemo(
    () => TYPE_META[visible?.type] || TYPE_META.general,
    [visible],
  );
  const MetaIcon = meta[0];
  const conversationId = conversationIdOf(visible);
  const isChatNotification = Boolean(conversationId) && (
    visible?.category === "message" ||
    String(visible?.type || "").toLowerCase().includes("message") ||
    Boolean(visible?.metadata?.messageId) ||
    Boolean(visible?.metadata?.groupId) ||
    Boolean(visible?.group_id) ||
    Boolean(visible?.groupId)
  );
  const isGroupChatNotification = Boolean(
    visible?.group_id || visible?.groupId ||
    visible?.metadata?.groupId || visible?.metadata?.group_id ||
    visible?.conversation_type === "group" || visible?.conversationType === "group"
  );

  const consumeNotification = (item) => {
    if (!item?.id) return;
    markRead(item.id);
    // Once the traveller opens/acts on the notification, remove it from their inbox.
    deleteOne(item.id);
  };

  const openNotification = () => {
    if (!visible) return;
    const item = visible;
    consumeNotification(item);
    setVisible(null);
    if (conversationIdOf(item)) {
      navigate(`/messages?conversationId=${encodeURIComponent(conversationIdOf(item))}`);
      return;
    }
    const actionUrl = item.action_url || item.actionUrl;
    if (actionUrl) {
      if (actionUrl.startsWith("/")) navigate(actionUrl);
      else window.location.href = actionUrl;
      return;
    }
    navigate("/notifications");
  };

  const dismissNotification = () => {
    if (!visible) return;
    consumeNotification(visible);
    setVisible(null);
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!conversationId || !replyText.trim() || replyBusy) return;
    setReplyBusy(true);
    setReplyError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/messages/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ body: replyText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Your reply could not be sent.");
      const item = visible;
      setVisible(null);
      setReplyText("");
      consumeNotification(item);
      navigate(`/messages?conversationId=${encodeURIComponent(conversationId)}`);
    } catch (error) {
      setReplyError(error.message || "Could not send your reply. Please open the conversation.");
    } finally {
      setReplyBusy(false);
    }
  };

  if (!visible) return null;

  const title = visible.title || (visible.sender_name ? `Message from ${visible.sender_name}` : "New notification");
  const body = visible.message || "You have a new update from Altuvera.";
  const actionLabel = conversationId ? "Open conversation" : visible.action_label || "View details";

  return (
    <>
      <style>{`
        @keyframes altuvera-user-toast-in {
          from { opacity: 0; transform: translate3d(0, 16px, 0) scale(.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .altuvera-user-toast { animation: none !important; transition: none !important; }
        }
      `}</style>
      <section aria-label="New notification" aria-live="polite"
        className="altuvera-user-toast"
        onPointerDown={(event) => { swipeStartX.current = event.clientX; swipeDeltaX.current = 0; event.currentTarget.setPointerCapture?.(event.pointerId); }}
        onPointerMove={(event) => { if (swipeStartX.current === null) return; swipeDeltaX.current = event.clientX - swipeStartX.current; event.currentTarget.style.transform = "translate3d(" + swipeDeltaX.current + "px,0,0)"; event.currentTarget.style.opacity = String(Math.max(.25, 1 - Math.abs(swipeDeltaX.current) / 260)); }}
        onPointerUp={() => { const delta = swipeDeltaX.current; swipeStartX.current = null; swipeDeltaX.current = 0; if (Math.abs(delta) > 100) dismissNotification(); else { const el = document.querySelector(".altuvera-user-toast"); if (el) { el.style.transform = ""; el.style.opacity = ""; } } }}
        onPointerCancel={() => { swipeStartX.current = null; swipeDeltaX.current = 0; }}
        style={{
          touchAction: "pan-y", transition: "transform 120ms ease-out, opacity 120ms ease-out",
          position: "fixed", right: 16, bottom: "max(16px, env(safe-area-inset-bottom))",
          zIndex: 9999, width: "min(350px, calc(100vw - 20px))",
          animation: "altuvera-user-toast-in 240ms cubic-bezier(.2,.8,.2,1)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
        <div style={{
          background: "#fff", border: "1px solid #dbe7e0", borderLeft: `3px solid ${meta[1]}`,
          borderRadius: 15, boxShadow: "0 12px 34px rgba(15,23,42,.16)", overflow: "hidden",
        }}>
          <div style={{ padding: "10px 11px 9px", display: "flex", alignItems: "flex-start", gap: 9 }}>
            <div aria-hidden="true" style={{
              width: 34, height: 34, borderRadius: 11, background: `${meta[1]}15`,
              display: "grid", placeItems: "center", flexShrink: 0, position: "relative",
            }}>
              <MetaIcon size={17} aria-hidden="true" strokeWidth={2.2} />
              <span style={{ position: "absolute", right: -2, top: -2, width: 9, height: 9, borderRadius: 99, background: "#10b981", border: "2px solid white" }}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, color: "#0f172a", fontSize: 13, fontWeight: 800, lineHeight: 1.35 }}>{title}</p>
                  <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: 9, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>Altuvera · {isGroupChatNotification ? "Group message" : isChatNotification ? "New message" : "New activity"}</p>
                </div>
                <button type="button" onClick={dismissNotification} aria-label="Dismiss and clear notification"
                  style={{ width: 28, height: 28, border: 0, borderRadius: 9, display: "grid", placeItems: "center", background: "#f8fafc", color: "#64748b", cursor: "pointer", flexShrink: 0 }}>
                  <X size={15}/>
                </button>
              </div>
              <p style={{ margin: "6px 0 0", color: "#475569", fontSize: 12, lineHeight: 1.45, whiteSpace: "pre-wrap", overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{body}</p>
            </div>
          </div>

          {isChatNotification && (
            <div style={{ padding: "0 11px 8px 54px" }}>
              <button type="button" onClick={() => setReplyExpanded(value => !value)}
                aria-expanded={replyExpanded}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid #dce9e2", borderRadius: 8, background: "#f8fcf9", color: "#047857", padding: "5px 8px", fontSize: 10, fontWeight: 750, cursor: "pointer" }}>
                <MessageCircle size={12}/>{replyExpanded ? "Hide reply" : "Quick reply"}
                {replyExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
              </button>
              {replyExpanded && (
                <form onSubmit={sendReply} style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
                  <input id="altuvera-notification-reply" value={replyText} onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Write a reply…" maxLength={5000}
                    style={{ flex: "1 1 150px", minWidth: 0, border: "1px solid #dbe4df", borderRadius: 9, padding: "8px 9px", outline: "none", fontSize: 12, color: "#0f172a", background: "#fbfdfc" }}/>
                  <button type="submit" disabled={!replyText.trim() || replyBusy}
                    aria-label="Send quick reply"
                    style={{ border: 0, borderRadius: 9, width: 34, height: 34, flexShrink: 0, display: "grid", placeItems: "center", background: "#059669", color: "#fff", cursor: replyText.trim() ? "pointer" : "not-allowed", opacity: !replyText.trim() || replyBusy ? .5 : 1 }}>
                    {replyBusy ? <span style={{ fontSize: 11 }}>…</span> : <Send size={14}/>}
                  </button>
                  {replyError && <p role="alert" style={{ flexBasis: "100%", margin: "2px 0 0", color: "#dc2626", fontSize: 10, lineHeight: 1.4 }}>{replyError}</p>}
                </form>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 11px 9px", borderTop: "1px solid #f1f5f9", background: "#fbfdfc" }}>
            <button type="button" onClick={openNotification}
              style={{ flex: 1, minHeight: 32, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 7, padding: "9px 12px", border: 0, borderRadius: 11, background: "#059669", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(5,150,105,.16)" }}>
              {conversationId ? <MessageCircle size={15}/> : <BellRing size={15}/>}
              {actionLabel} <ArrowUpRight size={14}/>
            </button>
            <span style={{ color: "#94a3b8", fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Check size={12}/> Clears when opened</span>
          </div>
          {unreadCount > 1 && <div style={{ padding: "0 11px 8px", color: "#94a3b8", fontSize: 9 }}>{unreadCount} unread notifications in your inbox</div>}
        </div>
      </section>
    </>
  );
}
