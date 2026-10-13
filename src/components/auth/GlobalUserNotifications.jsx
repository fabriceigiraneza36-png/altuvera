import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BellRing, Check, MessageCircle, Send, X } from "lucide-react";
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
  booking_created: ["📅", "#059669"],
  booking_updated: ["✏️", "#0ea5e9"],
  booking_confirmed: ["✅", "#16a34a"],
  checklist_request: ["📋", "#059669"],
  checklist_ready: ["✅", "#16a34a"],
  warning: ["⚠️", "#d97706"],
  alert: ["🚨", "#dc2626"],
  system: ["⚙️", "#64748b"],
  message_received: ["💬", "#059669"],
  general: ["💬", "#059669"],
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
  const [replyText, setReplyText] = useState("");
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
      setVisible((current) => current?.id === visible.id ? null : current);
    }, 18000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  const meta = useMemo(
    () => TYPE_META[visible?.type] || TYPE_META.general,
    [visible],
  );
  const conversationId = conversationIdOf(visible);
  const isChatNotification = Boolean(conversationId) &&
    (visible?.category === "message" || visible?.type === "message_received" || Boolean(visible?.metadata?.messageId));

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
    if (item.action_url) {
      if (item.action_url.startsWith("/")) navigate(item.action_url);
      else window.location.href = item.action_url;
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
        style={{
          position: "fixed", right: 16, bottom: "max(16px, env(safe-area-inset-bottom))",
          zIndex: 9999, width: "min(410px, calc(100vw - 24px))",
          animation: "altuvera-user-toast-in 240ms cubic-bezier(.2,.8,.2,1)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
        <div style={{
          background: "#fff", border: "1px solid #dbe7e0", borderLeft: `4px solid ${meta[1]}`,
          borderRadius: 19, boxShadow: "0 22px 65px rgba(15,23,42,.2)", overflow: "hidden",
        }}>
          <div style={{ padding: "15px 16px 12px", display: "flex", alignItems: "flex-start", gap: 11 }}>
            <div aria-hidden="true" style={{
              width: 42, height: 42, borderRadius: 14, background: `${meta[1]}15`,
              display: "grid", placeItems: "center", flexShrink: 0, position: "relative",
            }}>
              <span style={{ fontSize: 20 }}>{meta[0]}</span>
              <span style={{ position: "absolute", right: -2, top: -2, width: 9, height: 9, borderRadius: 99, background: "#10b981", border: "2px solid white" }}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, color: "#0f172a", fontSize: 13, fontWeight: 800, lineHeight: 1.35 }}>{title}</p>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Altuvera · New activity</p>
                </div>
                <button type="button" onClick={dismissNotification} aria-label="Dismiss and clear notification"
                  style={{ width: 28, height: 28, border: 0, borderRadius: 9, display: "grid", placeItems: "center", background: "#f8fafc", color: "#64748b", cursor: "pointer", flexShrink: 0 }}>
                  <X size={15}/>
                </button>
              </div>
              <p style={{ margin: "9px 0 0", color: "#475569", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{body}</p>
            </div>
          </div>

          {isChatNotification && (
            <form onSubmit={sendReply} style={{ padding: "0 16px 12px 69px" }}>
              <label htmlFor="altuvera-notification-reply" style={{ display: "block", marginBottom: 5, color: "#64748b", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Quick reply</label>
              <div style={{ display: "flex", gap: 7 }}>
                <input id="altuvera-notification-reply" value={replyText} onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Write a quick reply…" maxLength={5000}
                  style={{ flex: 1, minWidth: 0, border: "1px solid #dbe4df", borderRadius: 11, padding: "10px 11px", outline: "none", fontSize: 12, color: "#0f172a", background: "#fbfdfc" }}/>
                <button type="submit" disabled={!replyText.trim() || replyBusy}
                  aria-label="Send quick reply"
                  style={{ border: 0, borderRadius: 11, width: 40, flexShrink: 0, display: "grid", placeItems: "center", background: "#059669", color: "#fff", cursor: replyText.trim() ? "pointer" : "not-allowed", opacity: !replyText.trim() || replyBusy ? .5 : 1 }}>
                  {replyBusy ? <span style={{ fontSize: 11 }}>…</span> : <Send size={15}/>}
                </button>
              </div>
              {replyError && <p role="alert" style={{ margin: "6px 0 0", color: "#dc2626", fontSize: 11, lineHeight: 1.4 }}>{replyError}</p>}
            </form>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px 13px", borderTop: "1px solid #f1f5f9", background: "#fbfdfc" }}>
            <button type="button" onClick={openNotification}
              style={{ flex: 1, minHeight: 37, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 7, padding: "9px 12px", border: 0, borderRadius: 11, background: "#059669", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(5,150,105,.16)" }}>
              {conversationId ? <MessageCircle size={15}/> : <BellRing size={15}/>}
              {actionLabel} <ArrowUpRight size={14}/>
            </button>
            <span style={{ color: "#94a3b8", fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Check size={12}/> Clears when opened</span>
          </div>
          {unreadCount > 1 && <div style={{ padding: "0 16px 10px", color: "#94a3b8", fontSize: 10 }}>{unreadCount} unread notifications in your inbox</div>}
        </div>
      </section>
    </>
  );
}
