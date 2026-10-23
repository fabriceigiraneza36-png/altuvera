import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BellRing, Check, MessageCircle, Send, X, CalendarCheck, CreditCard, MapPin, ShieldCheck, UserRound, Info, MessageSquareReply, ChevronRight } from "lucide-react";
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
  booking_created: { Icon: CalendarCheck, color: "#065f46" },
  booking_updated: { Icon: CalendarCheck, color: "#065f46" },
  booking_confirmed: { Icon: CalendarCheck, color: "#065f46" },
  checklist_request: { Icon: MapPin, color: "#065f46" },
  checklist_ready: { Icon: Check, color: "#065f46" },
  payment: { Icon: CreditCard, color: "#065f46" },
  login: { Icon: ShieldCheck, color: "#111827" },
  account_activity: { Icon: UserRound, color: "#111827" },
  warning: { Icon: Info, color: "#92400e" },
  alert: { Icon: Info, color: "#991b1b" },
  system: { Icon: BellRing, color: "#111827" },
  message_received: { Icon: MessageCircle, color: "#065f46" },
  general: { Icon: BellRing, color: "#065f46" },
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
  const [replyOpen, setReplyOpen] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const longPressTimer = useRef(null);
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
    setReplyOpen(false);
    setShowFullDetails(false);
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

  const meta = useMemo(() => {
    const type = String(visible?.type || visible?.category || "general").toLowerCase();
    if (TYPE_META[type]) return TYPE_META[type];
    if (type.includes("booking")) return TYPE_META.booking_created;
    if (type.includes("message") || type.includes("chat")) return TYPE_META.message_received;
    if (type.includes("login") || type.includes("security") || type.includes("account")) return TYPE_META.account_activity;
    if (type.includes("payment")) return TYPE_META.payment;
    return TYPE_META.general;
  }, [visible]);
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
    const type = String(item.type || item.category || "").toLowerCase();
    if ((type.includes("booking") || /booking/i.test(item.title || "")) && (type.includes("confirm") || /confirm/i.test(item.title || ""))) {
      navigate("/my-bookings");
      return;
    }
    if (type.includes("login") || /signed in|logged in|login activity/i.test(item.title || "")) {
      navigate("/account/activity");
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
      setReplyOpen(false);
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
  const fullBody = visible.message || visible.body || "You have a new update from Altuvera.";
  const isMessageType = Boolean(conversationId) || visible?.type === "message_received" || visible?.category === "message";
  const bodyFirstLine = isMessageType ? String(fullBody).split(/\r?\n/)[0] : String(fullBody);
  const body = bodyFirstLine.length > 116 ? bodyFirstLine.slice(0, 113).trimEnd() + "…" : bodyFirstLine;
  const typeText = String(visible.type || visible.category || "").toLowerCase();
  const isBookingConfirmed = (typeText.includes("booking") || /booking/i.test(title)) && (typeText.includes("confirm") || /confirm/i.test(title));
  const destinationImage = visible.destination_image || visible.destinationImage || visible.image_url || visible.imageUrl || visible.metadata?.destinationImage || visible.metadata?.destination_image || visible.metadata?.imageUrl || visible.metadata?.image_url || visible.metadata?.destination?.image || "";
  const actionLabel = conversationId ? "Open conversation" : isBookingConfirmed ? "View my bookings" : (typeText.includes("login") || /signed in|logged in|login activity/i.test(title)) ? "View account activity" : visible.action_label || "View details";
  const holdStart = () => {
    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => setShowFullDetails(true), 520);
  };
  const holdEnd = () => window.clearTimeout(longPressTimer.current);
  const Icon = meta.Icon;

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
          position: "fixed", right: "max(12px, env(safe-area-inset-right))", top: "max(12px, env(safe-area-inset-top))",
          zIndex: 9999, width: "min(370px, calc(100vw - 24px))",
          animation: "altuvera-user-toast-in 240ms cubic-bezier(.2,.8,.2,1)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
        <div style={{
          background: "#fff", border: "1px solid #dbe7e0", borderLeft: `4px solid ${meta.color}`,
          borderRadius: 19, boxShadow: "0 22px 65px rgba(15,23,42,.2)", overflow: "hidden",
        }}>
          <div style={{ padding: "15px 16px 12px", display: "flex", alignItems: "flex-start", gap: 11 }}>
            <div aria-hidden="true" style={{
              width: 42, height: 42, borderRadius: 14, background: `${meta.color}12`,
              display: "grid", placeItems: "center", flexShrink: 0, position: "relative",
            }}>
              <Icon size={19} color={meta.color} strokeWidth={2.3} />
              <span style={{ position: "absolute", right: -2, top: -2, width: 9, height: 9, borderRadius: 99, background: "#10b981", border: "2px solid white" }}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, color: "#0f172a", fontSize: 13, fontWeight: 800, lineHeight: 1.35 }}>{title}</p>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Altuvera · {isMessageType ? "Message" : "Activity"}</p>
                </div>
                <button type="button" onClick={dismissNotification} aria-label="Dismiss and clear notification"
                  style={{ width: 28, height: 28, border: 0, borderRadius: 9, display: "grid", placeItems: "center", background: "#f8fafc", color: "#64748b", cursor: "pointer", flexShrink: 0 }}>
                  <X size={15}/>
                </button>
              </div>
              {isBookingConfirmed && destinationImage && <img src={destinationImage} alt={visible.destination_name || visible.destinationName || "Booked destination"} loading="lazy" style={{ width: "100%", height: 92, objectFit: "cover", borderRadius: 10, marginTop: 9 }} onError={(event) => { event.currentTarget.style.display = "none"; }} />}
              <button type="button" onClick={openNotification} style={{ display: "block", width: "100%", textAlign: "left", border: 0, background: "transparent", padding: 0, margin: "7px 0 0", color: "#374151", fontSize: 12, lineHeight: 1.45, overflowWrap: "anywhere", cursor: "pointer" }}>{body} <span style={{ color: "#065f46", fontWeight: 700 }}>Read details <ChevronRight size={12} style={{ display: "inline", verticalAlign: "middle" }}/></span></button>
              {isMessageType && <button type="button" onClick={() => setReplyOpen((value) => !value)} style={{ border: 0, background: "transparent", color: "#065f46", fontWeight: 800, fontSize: 12, padding: "7px 0 0", display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" }}><MessageSquareReply size={13}/> {replyOpen ? "Close reply" : "Reply"}</button>}
            </div>
          </div>

          {isChatNotification && replyOpen && (
            <div role="dialog" aria-modal="true" aria-label="Quick reply" onClick={() => setReplyOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100001, background: "rgba(15,23,42,.38)", display: "grid", placeItems: "center", padding: 16 }}>
            <form onSubmit={sendReply} onClick={(event) => event.stopPropagation()} style={{ width: "min(420px, 100%)", padding: 17, background: "#fff", borderRadius: 17, border: "1px solid #dbe7e0", boxShadow: "0 24px 70px rgba(15,23,42,.22)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <strong style={{ fontSize: 15, color: "#111827" }}>Reply to message</strong>
                <button type="button" onClick={() => setReplyOpen(false)} aria-label="Close reply box" style={{ border: 0, borderRadius: 8, background: "#f3f4f6", padding: 6, cursor: "pointer" }}><X size={15}/></button>
              </div>
              <label htmlFor="altuvera-notification-reply" style={{ display: "block", marginBottom: 5, color: "#64748b", fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Quick reply</label>
              <div style={{ display: "flex", gap: 7 }}>
                <input id="altuvera-notification-reply" value={replyText} onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Write a quick reply…" maxLength={5000}
                  style={{ flex: 1, minWidth: 0, border: "1px solid #dbe4df", borderRadius: 11, padding: "10px 11px", outline: "none", fontSize: 12, color: "#0f172a", background: "#fbfdfc" }}/>
                <button type="submit" disabled={!replyText.trim() || replyBusy}
                  aria-label="Send quick reply"
                  style={{ border: 0, borderRadius: 11, width: 40, flexShrink: 0, display: "grid", placeItems: "center", background: "#065f46", color: "#fff", cursor: replyText.trim() ? "pointer" : "not-allowed", opacity: !replyText.trim() || replyBusy ? .5 : 1 }}>
                  {replyBusy ? <span style={{ fontSize: 11 }}>…</span> : <Send size={15}/>}
                </button>
              </div>
              {replyError && <p role="alert" style={{ margin: "6px 0 0", color: "#dc2626", fontSize: 11, lineHeight: 1.4 }}>{replyError}</p>}
            </form>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px 11px", borderTop: "1px solid #f1f5f9", background: "#fbfdfc" }}>
            <button type="button" onClick={openNotification}
              style={{ flex: 1, minHeight: 37, display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 7, padding: "9px 12px", border: 0, borderRadius: 11, background: "#065f46", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(5,150,105,.16)" }}>
              {conversationId ? <MessageCircle size={15}/> : <BellRing size={15}/>}
              {actionLabel} <ArrowUpRight size={14}/>
            </button>
            <span style={{ color: "#94a3b8", fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Check size={12}/> Clears when opened</span>
          </div>
          {unreadCount > 1 && <div style={{ padding: "0 13px 9px", color: "#6b7280", fontSize: 10 }}>{unreadCount} unread notifications</div>}
        </div>
      </section>
      {showFullDetails && <div role="dialog" aria-modal="true" aria-label="Full notification details" onClick={() => setShowFullDetails(false)} style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(15,23,42,.35)", display: "grid", placeItems: "center", padding: 16 }}>
        <div onClick={(event) => event.stopPropagation()} style={{ width: "min(440px, 100%)", maxHeight: "min(70vh, 560px)", overflow: "auto", background: "#fff", borderRadius: 18, padding: 18, boxShadow: "0 24px 70px rgba(15,23,42,.22)", color: "#111827" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Icon size={20} color={meta.color}/><h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h2></div>
            <button type="button" onClick={() => setShowFullDetails(false)} aria-label="Close full notification" style={{ border: 0, background: "#f3f4f6", borderRadius: 9, padding: 6, cursor: "pointer" }}><X size={16}/></button>
          </div>
          {isBookingConfirmed && destinationImage && <img src={destinationImage} alt={visible.destination_name || visible.destinationName || "Booked destination"} style={{ width: "100%", maxHeight: 190, objectFit: "cover", borderRadius: 12, marginTop: 14 }} />}
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 14, lineHeight: 1.65, color: "#374151" }}>{fullBody}</p>
          <button type="button" onClick={() => { setShowFullDetails(false); openNotification(); }} style={{ width: "100%", padding: "11px 14px", border: 0, borderRadius: 11, background: "#065f46", color: "#fff", fontWeight: 800, cursor: "pointer" }}>{actionLabel}</button>
        </div>
      </div>}
    </>
  );
}
