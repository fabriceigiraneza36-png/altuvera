import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BellRing, MessageCircle, Send, X, CalendarDays, Pencil, CheckCircle2, ClipboardList, AlertTriangle, Siren, Settings, ChevronDown, ChevronUp, UsersRound, Sparkles } from "lucide-react";
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
  const { notifications, unreadCount, markRead } = useNotifications();
  const [visible, setVisible] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyExpanded, setReplyExpanded] = useState(false);
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState("");
  const swipeStartX = useRef(null);
  const swipeDeltaX = useRef(0);
  const [dragX, setDragX] = useState(0);
  const openHandlerRef = useRef(null);
  const dismissHandlerRef = useRef(null);
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
    setExpanded(false);
    setReplyText("");
    setReplyExpanded(false);
    setReplyError("");
    setHovered(false);
    setKeyboardFocused(false);
    setDragX(0);
    const next = new Set(seen);
    next.add(String(fresh.id));
    setSeen(next);
    try {
      sessionStorage.setItem("altuvera:global-notifications", JSON.stringify([...next].slice(-100)));
    } catch {}
  }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps

  const meta = useMemo(
    () => TYPE_META[visible && visible.type] || TYPE_META.general,
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
  const isFocused = hovered || keyboardFocused;

  const metadata = useMemo(() => {
    let raw = visible?.metadata || visible?.metadata_json || {};
    if (typeof raw === "string") {
      try { raw = JSON.parse(raw); } catch { raw = {}; }
    }
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }, [visible]);

  const timeLabel = useMemo(() => {
    const raw = visible?.created_at || visible?.createdAt || visible?.created_at_utc;
    if (!raw) return "Just now";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "Just now";
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, [visible]);

  const title = visible?.title || (visible?.sender_name ? "Message from " + visible.sender_name : "New notification");
  const body = visible?.message || visible?.body || "You have a new update from Altuvera.";
  const actionLabel = conversationId ? "View message" : (visible?.action_label || visible?.actionLabel || "View details");
  const kindLabel = isGroupChatNotification ? "Group message" : isChatNotification ? "New message" : "New activity";
  const detailRows = [
    ["From", visible?.sender_name || visible?.senderName || metadata?.senderName || metadata?.sender_name],
    ["Destination", metadata?.destinationName || metadata?.destination_name || metadata?.destination],
    ["Reference", metadata?.bookingNumber || metadata?.booking_number || visible?.booking_number],
  ].filter((row) => row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== "");

  const markAsSeen = (item) => {
    if (item?.id && !item.is_read) markRead(item.id);
  };

  const openNotification = () => {
    if (!visible) return;
    const item = visible;
    markAsSeen(item);
    setVisible(null);
    setExpanded(false);
    setReplyExpanded(false);
    setDragX(0);

    const targetConversationId = conversationIdOf(item);
    if (targetConversationId) {
      navigate("/messages?conversationId=" + encodeURIComponent(targetConversationId));
      return;
    }
    const actionUrl = item.action_url || item.actionUrl;
    if (typeof actionUrl === "string" && actionUrl.startsWith("/")) {
      navigate(actionUrl);
      return;
    }
    if (typeof actionUrl === "string" && /^https?:\/\//i.test(actionUrl)) {
      window.location.href = actionUrl;
      return;
    }
    navigate("/notifications");
  };

  const viewInbox = () => {
    if (visible) markAsSeen(visible);
    setVisible(null);
    setExpanded(false);
    setDragX(0);
    navigate("/notifications");
  };

  const dismissNotification = () => {
    if (!visible) return;
    markAsSeen(visible);
    setVisible(null);
    setExpanded(false);
    setReplyExpanded(false);
    setDragX(0);
  };

  openHandlerRef.current = openNotification;
  dismissHandlerRef.current = dismissNotification;

  useEffect(() => {
    if (!visible) return undefined;
    // Unfocused alerts tuck away after 10 seconds. When hovered or focused,
    // give the traveller 30 seconds to read; sustained focus opens the target.
    const timer = window.setTimeout(() => {
      if (isFocused) openHandlerRef.current?.();
      else dismissHandlerRef.current?.();
    }, isFocused ? 30000 : 10000);
    return () => window.clearTimeout(timer);
  }, [visible?.id, isFocused]);

  const sendReply = async (event) => {
    event.preventDefault();
    if (!conversationId || !replyText.trim() || replyBusy) return;
    setReplyBusy(true);
    setReplyError("");
    try {
      const token = (() => {
        try {
          return localStorage.getItem("altuvera_auth_token") ||
            sessionStorage.getItem("altuvera_auth_token") ||
            localStorage.getItem("auth_token") || "";
        } catch { return ""; }
      })();
      const apiBase = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
      const res = await fetch(apiBase + "/messages/conversations/" + encodeURIComponent(conversationId) + "/messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: JSON.stringify({ body: replyText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Your reply could not be sent.");
      const item = visible;
      setVisible(null);
      setReplyText("");
      markAsSeen(item);
      navigate("/messages?conversationId=" + encodeURIComponent(conversationId));
    } catch (error) {
      setReplyError(error.message || "Could not send your reply. Please open the conversation.");
    } finally {
      setReplyBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes altuvera-toast-enter {
          from { opacity: 0; transform: translate3d(0, 18px, 0) scale(.975); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes altuvera-toast-gentle-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          35% { transform: translateY(-7px) scale(1.006); }
          66% { transform: translateY(0) scale(1); }
          82% { transform: translateY(-2px) scale(1.002); }
        }
        .altuvera-user-toast { animation: altuvera-toast-enter 280ms cubic-bezier(.2,.8,.2,1) both; }
        .altuvera-toast-card { animation: altuvera-toast-gentle-bounce 1s cubic-bezier(.34,1.3,.64,1) 280ms 3; }
        .altuvera-toast-card, .altuvera-toast-card * { box-sizing: border-box; }
        .altuvera-toast-card {
          display:flex; flex-direction:column; width:100%; max-height:min(72vh, 610px);
          color:#15291f; background:rgba(255,255,255,.97);
          border:1px solid rgba(206,226,214,.95); border-radius:22px;
          box-shadow:0 24px 70px rgba(7,40,25,.22), 0 4px 14px rgba(7,40,25,.08);
          overflow:hidden; backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
        }
        .altuvera-toast-topline { height:3px; flex-shrink:0; background:linear-gradient(90deg,#075b40,#0ba477 60%,#9be8bd); }
        .altuvera-toast-main { padding:15px 15px 12px; min-height:0; overflow-y:auto; overscroll-behavior:contain; }
        .altuvera-toast-header { display:flex; align-items:flex-start; gap:11px; }
        .altuvera-toast-icon { position:relative; display:grid; place-items:center; width:44px; height:44px; flex:0 0 44px; border-radius:15px; background:linear-gradient(145deg,#e8f9ef,#d5f3e2); color:#087c53; box-shadow:inset 0 0 0 1px rgba(8,124,83,.08); }
        .altuvera-toast-icon::after { content:""; position:absolute; width:8px; height:8px; right:1px; top:1px; border:2px solid white; border-radius:50%; background:#0ba477; }
        .altuvera-toast-headcopy { flex:1; min-width:0; }
        .altuvera-toast-eyebrow { display:flex; align-items:center; gap:5px; flex-wrap:wrap; margin:1px 0 4px; color:#078257; font-size:9px; font-weight:850; letter-spacing:.105em; text-transform:uppercase; }
        .altuvera-toast-time { color:#94a79b; font-size:10px; font-weight:650; letter-spacing:0; text-transform:none; }
        .altuvera-toast-title { margin:0; color:#142a20; font-size:15px; font-weight:850; line-height:1.34; letter-spacing:-.025em; overflow-wrap:anywhere; }
        .altuvera-toast-close { display:grid; place-items:center; flex:0 0 33px; width:33px; height:33px; margin:-3px -3px 0 0; border:1px solid #e8f0eb; border-radius:12px; background:#f7faf8; color:#65776c; cursor:pointer; transition:background .18s, transform .18s, color .18s; }
        .altuvera-toast-close:hover { background:#e8f7ee; color:#075b40; transform:rotate(4deg); }
        .altuvera-toast-body { margin:11px 0 0; color:#53645a; font-size:13px; line-height:1.65; overflow-wrap:anywhere; white-space:pre-wrap; }
        .altuvera-toast-body--collapsed { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; }
        .altuvera-toast-tools { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-top:10px; }
        .altuvera-toast-detail-toggle { display:inline-flex; align-items:center; gap:5px; padding:5px 0; border:0; background:transparent; color:#087c53; font-size:11px; font-weight:800; cursor:pointer; }
        .altuvera-toast-detail-toggle:hover { color:#035d3d; }
        .altuvera-toast-inbox-count { display:inline-flex; align-items:center; gap:5px; color:#8a9a90; font-size:10px; font-weight:650; }
        .altuvera-toast-details { margin-top:13px; padding:12px; border:1px solid #e6f0e9; border-radius:15px; background:linear-gradient(145deg,#fbfefc,#f4faf6); }
        .altuvera-toast-details-label { display:flex; align-items:center; gap:6px; margin:0 0 9px; color:#577064; font-size:9px; font-weight:850; letter-spacing:.12em; text-transform:uppercase; }
        .altuvera-toast-detail-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:7px 0; border-bottom:1px solid #e9f1ec; font-size:11px; line-height:1.5; }
        .altuvera-toast-detail-row:last-child { border-bottom:0; padding-bottom:0; }
        .altuvera-toast-detail-row span { color:#8a9b90; flex:0 0 auto; }
        .altuvera-toast-detail-row strong { color:#344c3d; font-weight:750; text-align:right; overflow-wrap:anywhere; }
        .altuvera-toast-saved-note { display:flex; align-items:center; gap:6px; margin-top:10px; color:#74897b; font-size:10px; line-height:1.45; }
        .altuvera-toast-footer { display:flex; align-items:center; gap:9px; padding:11px 13px 13px; border-top:1px solid #edf3ef; background:rgba(249,252,250,.96); flex-shrink:0; }
        .altuvera-toast-primary { display:inline-flex; align-items:center; justify-content:center; gap:8px; flex:1; min-width:0; min-height:43px; padding:10px 13px; border:1px solid #07845b; border-radius:13px; background:linear-gradient(135deg,#09976b,#087452); color:white; font-size:12px; font-weight:850; line-height:1.25; box-shadow:0 7px 17px rgba(7,132,91,.2); cursor:pointer; transition:transform .18s,box-shadow .18s,filter .18s; }
        .altuvera-toast-primary:hover { transform:translateY(-1px); box-shadow:0 10px 22px rgba(7,132,91,.26); filter:saturate(1.06); }
        .altuvera-toast-secondary { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:41px; padding:9px 11px; border:1px solid #dce9e1; border-radius:12px; background:white; color:#426052; font-size:11px; font-weight:800; white-space:nowrap; cursor:pointer; transition:background .18s,border-color .18s; }
        .altuvera-toast-secondary:hover { background:#f0faf4; border-color:#bfdfca; }
        .altuvera-toast-quick-reply { display:inline-flex; align-items:center; gap:6px; margin-top:10px; padding:7px 10px; border:1px solid #d3e8db; border-radius:10px; background:#f7fcf9; color:#087c53; font-size:11px; font-weight:800; cursor:pointer; }
        .altuvera-toast-reply-form { display:flex; gap:7px; margin-top:8px; }
        .altuvera-toast-reply-form input { flex:1; min-width:0; border:1px solid #dbe7df; border-radius:11px; padding:10px 11px; color:#15291f; background:white; font-size:13px; outline:none; }
        .altuvera-toast-reply-form input:focus { border-color:#10a875; box-shadow:0 0 0 3px rgba(16,168,117,.10); }
        .altuvera-toast-reply-send { display:grid; place-items:center; width:39px; flex:0 0 39px; border:0; border-radius:11px; color:#fff; background:#07845b; cursor:pointer; }
        .altuvera-toast-reply-send:disabled { cursor:not-allowed; opacity:.45; }
        .altuvera-toast-error { margin:7px 0 0; color:#b91c1c; font-size:11px; line-height:1.4; }
        .altuvera-toast-card button:focus-visible { outline:3px solid rgba(16,168,117,.35); outline-offset:2px; }
        @media (max-width:560px) {
          .altuvera-user-toast { left:10px !important; right:10px !important; bottom:calc(env(safe-area-inset-bottom, 0px) + 88px) !important; width:auto !important; }
          .altuvera-toast-card { max-height:min(70svh, 590px); border-radius:20px; }
          .altuvera-toast-main { padding:13px 13px 10px; }
          .altuvera-toast-icon { width:41px; height:41px; flex-basis:41px; border-radius:14px; }
          .altuvera-toast-title { font-size:14px; }
          .altuvera-toast-body { font-size:12px; line-height:1.6; }
          .altuvera-toast-footer { padding:10px 11px 11px; gap:7px; }
          .altuvera-toast-primary { min-height:42px; padding:9px 10px; font-size:11px; }
          .altuvera-toast-secondary { min-height:42px; padding:8px 9px; font-size:10px; }
          .altuvera-toast-details { padding:10px; }
        }
        @media (max-width:360px) {
          .altuvera-toast-inbox-count { display:none; }
          .altuvera-toast-footer { align-items:stretch; }
          .altuvera-toast-secondary { padding-inline:8px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .altuvera-user-toast, .altuvera-toast-card { animation:none !important; }
          .altuvera-toast-close, .altuvera-toast-primary, .altuvera-toast-secondary { transition:none !important; }
        }
      `}</style>
      <section
        aria-label="New notification"
        aria-live="polite"
        className="altuvera-user-toast"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setKeyboardFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          swipeStartX.current = event.clientX;
          swipeDeltaX.current = 0;
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (swipeStartX.current === null) return;
          swipeDeltaX.current = event.clientX - swipeStartX.current;
          setDragX(swipeDeltaX.current);
        }}
        onPointerUp={() => {
          const delta = swipeDeltaX.current;
          swipeStartX.current = null;
          swipeDeltaX.current = 0;
          if (Math.abs(delta) > 90) dismissNotification();
          else setDragX(0);
        }}
        onPointerCancel={() => {
          swipeStartX.current = null;
          swipeDeltaX.current = 0;
          setDragX(0);
        }}
        style={{
          position: "fixed", right: 20, bottom: "max(20px, env(safe-area-inset-bottom))",
          zIndex: 9999, width: "min(400px, calc(100vw - 24px))",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          className="altuvera-toast-drag"
          style={{
            transform: "translate3d(" + dragX + "px,0,0)",
            opacity: Math.max(.35, 1 - Math.abs(dragX) / 290),
            transition: swipeStartX.current === null ? "transform 180ms ease-out, opacity 180ms ease-out" : "none",
            touchAction: "pan-y",
          }}
        >
          <div className="altuvera-toast-card">
            <div className="altuvera-toast-topline" />
            <div className="altuvera-toast-main">
              <div className="altuvera-toast-header">
                <div className="altuvera-toast-icon" aria-hidden="true">
                  <MetaIcon size={20} strokeWidth={2.15} />
                </div>
                <div className="altuvera-toast-headcopy">
                  <p className="altuvera-toast-eyebrow">
                    <Sparkles size={11} strokeWidth={2.4} />
                    ALTUVERA <span aria-hidden="true">·</span> {kindLabel}
                    <span className="altuvera-toast-time">· {timeLabel}</span>
                  </p>
                  <h2 className="altuvera-toast-title">{title}</h2>
                </div>
                <button type="button" onClick={dismissNotification} aria-label="Dismiss notification" className="altuvera-toast-close">
                  <X size={17} />
                </button>
              </div>

              <p className={"altuvera-toast-body" + (expanded ? "" : " altuvera-toast-body--collapsed")}>{body}</p>

              <div className="altuvera-toast-tools">
                <button
                  type="button"
                  className="altuvera-toast-detail-toggle"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? "Hide full details" : "Read full details"}
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {unreadCount > 0 && (
                  <span className="altuvera-toast-inbox-count"><BellRing size={12} /> {unreadCount} unread</span>
                )}
              </div>

              {expanded && (
                <div className="altuvera-toast-details">
                  <p className="altuvera-toast-details-label"><ClipboardList size={12} /> Notification details</p>
                  {detailRows.length > 0 ? detailRows.map((row) => (
                    <div className="altuvera-toast-detail-row" key={row[0]}>
                      <span>{row[0]}</span><strong>{String(row[1])}</strong>
                    </div>
                  )) : (
                    <div className="altuvera-toast-detail-row">
                      <span>Type</span><strong>{kindLabel}</strong>
                    </div>
                  )}
                  <div className="altuvera-toast-saved-note">
                    <CheckCircle2 size={14} />
                    Saved in your notification inbox. Dismissing this preview will not delete it.
                  </div>
                  {isChatNotification && (
                    <>
                      <button
                        type="button"
                        className="altuvera-toast-quick-reply"
                        onClick={() => setReplyExpanded((value) => !value)}
                        aria-expanded={replyExpanded}
                      >
                        <MessageCircle size={13} /> {replyExpanded ? "Hide quick reply" : "Reply here"}
                        {replyExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      {replyExpanded && (
                        <form onSubmit={sendReply} className="altuvera-toast-reply-form">
                          <input
                            id="altuvera-notification-reply"
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            placeholder="Write a reply…"
                            maxLength={5000}
                            aria-label="Write a quick reply"
                          />
                          <button type="submit" className="altuvera-toast-reply-send" disabled={!replyText.trim() || replyBusy} aria-label="Send quick reply">
                            {replyBusy ? <span aria-hidden="true">…</span> : <Send size={15} />}
                          </button>
                        </form>
                      )}
                      {replyError && <p role="alert" className="altuvera-toast-error">{replyError}</p>}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="altuvera-toast-footer">
              <button type="button" onClick={openNotification} className="altuvera-toast-primary">
                {isChatNotification ? <MessageCircle size={16} /> : <BellRing size={16} />}
                <span>{actionLabel}</span>
                <ArrowUpRight size={15} />
              </button>
              <button type="button" onClick={viewInbox} className="altuvera-toast-secondary">
                <UsersRound size={15} /> Inbox
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
