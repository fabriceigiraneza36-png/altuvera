import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BellRing, MessageCircle, Send, Sparkles, UsersRound, X } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { getNotificationPresentation } from "../../utils/notificationPresentation";

const API_BASE = (import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api").replace(/\/$/, "");
const getToken = () => {
  try {
    return localStorage.getItem("altuvera_auth_token") ||
      sessionStorage.getItem("altuvera_auth_token") ||
      localStorage.getItem("auth_token") || "";
  } catch { return ""; }
};

const conversationIdOf = (notification) =>
  notification?.conversation_id ||
  notification?.conversationId ||
  notification?.metadata?.conversationId ||
  notification?.metadata?.conversation_id ||
  null;

const TOAST_STYLES = [
  ".altuvera-user-toast,.altuvera-user-toast *{box-sizing:border-box}",
  ".altuvera-user-toast{touch-action:pan-y;user-select:none;-webkit-user-select:none;will-change:transform}",
  ".altuvera-toast-card{display:flex;flex-direction:column;width:100%;color:#15291f;background:rgba(255,255,255,.985);border:1px solid #e5ece7;border-radius:19px;box-shadow:0 18px 54px rgba(7,40,25,.19),0 4px 13px rgba(7,40,25,.07);overflow:hidden;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}",
  ".altuvera-toast-main{padding:12px 13px 10px;min-width:0}",
  ".altuvera-toast-header{display:flex;align-items:flex-start;gap:9px}",
  ".altuvera-toast-icon{position:relative;display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;border-radius:12px;background:linear-gradient(145deg,#e8f9ef,#d5f3e2);color:var(--toast-accent,#087c53)}",
  ".altuvera-toast-icon:after{content:'';position:absolute;width:7px;height:7px;right:0;top:0;border:2px solid white;border-radius:50%;background:var(--toast-accent,#0ba477)}",
  ".altuvera-toast-headcopy{flex:1;min-width:0}",
  ".altuvera-toast-eyebrow{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin:0 0 3px;color:#078257;font-size:8px;font-weight:850;letter-spacing:.09em;text-transform:uppercase}",
  ".altuvera-toast-time{color:#94a79b;font-size:9px;font-weight:650;letter-spacing:0;text-transform:none}",
  ".altuvera-toast-title{margin:0;color:#142a20;font-size:13px;font-weight:850;line-height:1.3;letter-spacing:-.02em;overflow-wrap:anywhere}",
  ".altuvera-toast-close{display:grid;place-items:center;flex:0 0 29px;width:29px;height:29px;margin:-2px -2px 0 0;border:0;border-radius:10px;background:#f3f7f4;color:#65776c;cursor:pointer;transition:background .16s,transform .16s}",
  ".altuvera-toast-close:hover{background:#e8f7ee;color:#075b40;transform:rotate(4deg)}",
  ".altuvera-toast-body{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;margin:8px 0 0;color:#53645a;font-size:11px;line-height:1.45;overflow-wrap:anywhere;white-space:pre-wrap}",
  ".altuvera-toast-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;color:#91a097;font-size:9px;font-weight:650}",
  ".altuvera-toast-inbox-count{display:inline-flex;align-items:center;gap:4px;color:#82958a;font-size:9px;font-weight:700}",
  ".altuvera-toast-quick-reply{display:inline-flex;align-items:center;gap:5px;margin-top:7px;padding:5px 8px;border:1px solid #dcebe1;border-radius:9px;background:#f8fcf9;color:#087c53;font-size:10px;font-weight:800;cursor:pointer}",
  ".altuvera-toast-reply-form{display:flex;gap:6px;margin-top:7px}",
  ".altuvera-toast-reply-form input{flex:1;min-width:0;border:1px solid #dbe7df;border-radius:9px;padding:8px 9px;color:#15291f;background:white;font-size:12px;outline:none;user-select:text;-webkit-user-select:text}",
  ".altuvera-toast-reply-form input:focus{border-color:#10a875;box-shadow:0 0 0 3px rgba(16,168,117,.1)}",
  ".altuvera-toast-reply-send{display:grid;place-items:center;width:35px;flex:0 0 35px;border:0;border-radius:9px;color:#fff;background:#07845b;cursor:pointer}",
  ".altuvera-toast-reply-send:disabled{cursor:not-allowed;opacity:.45}",
  ".altuvera-toast-error{margin:6px 0 0;color:#b91c1c;font-size:10px;line-height:1.4}",
  ".altuvera-toast-footer{display:flex;align-items:center;gap:7px;padding:0 11px 11px;flex-shrink:0}",
  ".altuvera-toast-primary{display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:1;min-width:0;min-height:36px;padding:8px 10px;border:0;border-radius:10px;background:linear-gradient(135deg,#09976b,#087452);color:white;font-size:10px;font-weight:850;line-height:1.2;box-shadow:0 5px 13px rgba(7,132,91,.17);cursor:pointer;transition:transform .16s,box-shadow .16s}",
  ".altuvera-toast-primary:hover{transform:translateY(-1px);box-shadow:0 8px 17px rgba(7,132,91,.23)}",
  ".altuvera-toast-secondary{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:36px;padding:7px 9px;border:1px solid #e2ebe5;border-radius:10px;background:white;color:#526b5c;font-size:10px;font-weight:800;white-space:nowrap;cursor:pointer}",
  ".altuvera-toast-secondary:hover{background:#f5faf6}",
  ".altuvera-toast-card button:focus-visible{outline:3px solid rgba(16,168,117,.35);outline-offset:2px}",
  "@media(max-width:560px){.altuvera-user-toast{left:10px!important;right:10px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 88px)!important;width:auto!important}.altuvera-toast-card{border-radius:17px}.altuvera-toast-main{padding:11px 11px 9px}.altuvera-toast-icon{width:36px;height:36px;flex-basis:36px;border-radius:11px}.altuvera-toast-title{font-size:12px}.altuvera-toast-body{font-size:10px;line-height:1.45}.altuvera-toast-footer{padding:0 10px 10px}.altuvera-toast-primary,.altuvera-toast-secondary{min-height:35px;font-size:10px}}",
  "@media(prefers-reduced-motion:reduce){.altuvera-toast-card button{transition:none!important}}"
].join("\n");

export default function GlobalUserNotifications() {
  const navigate = useNavigate();
  const { notifications = [], unreadCount = 0, markRead } = useNotifications();
  const [visible, setVisible] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyExpanded, setReplyExpanded] = useState(false);
  const [replyBusy, setReplyBusy] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [dismissDirection, setDismissDirection] = useState(1);
  const openHandlerRef = useRef(null);
  const dismissHandlerRef = useRef(null);
  const [seen, setSeen] = useState(() => {
    try {
      return new Set(JSON.parse(sessionStorage.getItem("altuvera:global-notifications") || "[]"));
    } catch { return new Set(); }
  });

  useEffect(() => {
    const fresh = notifications.find((item) => !item.is_read && !seen.has(String(item.id)));
    if (!fresh) return;
    setVisible(fresh);
    setReplyText("");
    setReplyExpanded(false);
    setReplyError("");
    setHovered(false);
    setKeyboardFocused(false);
    setDismissDirection(1);
    const next = new Set(seen);
    next.add(String(fresh.id));
    setSeen(next);
    try {
      sessionStorage.setItem("altuvera:global-notifications", JSON.stringify([...next].slice(-100)));
    } catch {}
  }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps

  const meta = useMemo(() => getNotificationPresentation(visible || {}), [visible]);
  const MetaIcon = meta.icon;
  const conversationId = conversationIdOf(visible);
  const isChatNotification = meta.isMessage || Boolean(conversationId);
  const isGroupChatNotification = meta.isGroup;
  const isFocused = hovered || keyboardFocused;

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

  const title = visible?.title || (visible?.sender_name ? "Message from " + visible.sender_name : meta.label);
  const body = visible?.message || visible?.body || "You have a new update from Altuvera.";
  const actionLabel = conversationId ? "View message" : (visible?.action_label || visible?.actionLabel || "View update");
  const kindLabel = isGroupChatNotification ? "Group message" : isChatNotification ? "Direct message" : meta.label;

  const markAsSeen = (item) => {
    if (item?.id && !item.is_read) markRead(item.id);
  };

  const openNotification = () => {
    if (!visible) return;
    const item = visible;
    markAsSeen(item);
    setVisible(null);
    setReplyExpanded(false);
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
    setReplyExpanded(false);
    navigate("/notifications");
  };

  const dismissNotification = (direction = 1) => {
    if (!visible) return;
    // A swipe only dismisses the preview; the saved inbox item remains unread.
    setDismissDirection(direction < 0 ? -1 : 1);
    setReplyExpanded(false);
    setVisible(null);
  };

  openHandlerRef.current = openNotification;
  dismissHandlerRef.current = dismissNotification;

  useEffect(() => {
    if (!visible || isFocused) return undefined;
    const timer = window.setTimeout(() => dismissHandlerRef.current?.(1), 14000);
    return () => window.clearTimeout(timer);
  }, [visible?.id, isFocused]);

  const sendReply = async (event) => {
    event.preventDefault();
    if (!conversationId || !replyText.trim() || replyBusy) return;
    setReplyBusy(true);
    setReplyError("");
    try {
      const res = await fetch(API_BASE + "/messages/conversations/" + encodeURIComponent(conversationId) + "/messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(getToken() ? { Authorization: "Bearer " + getToken() } : {}),
        },
        body: JSON.stringify({ body: replyText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Your reply could not be sent.");
      const item = visible;
      setVisible(null);
      setReplyText("");
      setReplyExpanded(false);
      markAsSeen(item);
      navigate("/messages?conversationId=" + encodeURIComponent(conversationId));
    } catch (error) {
      setReplyError(error.message || "Could not send your reply. Please open the conversation.");
    } finally {
      setReplyBusy(false);
    }
  };

  return (
    <>
      <style>{TOAST_STYLES}</style>
      <AnimatePresence initial={false}>
        {visible && (
          <motion.section
            key={String(visible.id)}
            aria-label="New notification"
            aria-live="polite"
            className="altuvera-user-toast"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: dismissDirection * 420, scale: 0.96, transition: { duration: 0.2, ease: "easeOut" } }}
            transition={{ type: "spring", stiffness: 390, damping: 30 }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: -1000, right: 1000 }}
            dragElastic={0.12}
            dragMomentum={false}
            whileDrag={{ scale: 0.985, boxShadow: "0 22px 64px rgba(7,40,25,.25)" }}
            onDragEnd={(_, info) => {
              const distance = info.offset.x;
              const velocity = info.velocity.x;
              if (Math.abs(distance) > 82 || Math.abs(velocity) > 680) {
                dismissNotification((distance || velocity) < 0 ? -1 : 1);
              }
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setKeyboardFocused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false);
            }}
            style={{
              position: "fixed",
              right: 20,
              bottom: "max(20px, env(safe-area-inset-bottom))",
              zIndex: 9999,
              width: "min(360px, calc(100vw - 24px))",
              fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
              touchAction: "pan-y",
            }}
          >
            <div className="altuvera-toast-card">
              <div className="altuvera-toast-main">
                <div className="altuvera-toast-header">
                  <div className="altuvera-toast-icon" aria-hidden="true" style={{ color: meta.color, background: "linear-gradient(145deg," + meta.color + "1c," + meta.color + "0c)" }}>
                    <MetaIcon size={18} strokeWidth={2.15} />
                  </div>
                  <div className="altuvera-toast-headcopy">
                    <p className="altuvera-toast-eyebrow">
                      <Sparkles size={10} strokeWidth={2.4} />
                      ALTUVERA <span aria-hidden="true">·</span> {kindLabel}
                      <span className="altuvera-toast-time">· {timeLabel}</span>
                    </p>
                    <h2 className="altuvera-toast-title">{title}</h2>
                  </div>
                  <button type="button" onClick={() => dismissNotification(1)} aria-label="Dismiss notification" className="altuvera-toast-close">
                    <X size={16} />
                  </button>
                </div>

                <p className="altuvera-toast-body">{body}</p>

                <div className="altuvera-toast-meta">
                  <span>Swipe to dismiss</span>
                  {unreadCount > 0 && (
                    <span className="altuvera-toast-inbox-count"><BellRing size={11} /> {unreadCount} unread</span>
                  )}
                </div>

                {isChatNotification && (
                  <>
                    <button
                      type="button"
                      className="altuvera-toast-quick-reply"
                      onClick={() => setReplyExpanded((value) => !value)}
                      aria-expanded={replyExpanded}
                    >
                      <MessageCircle size={12} /> {replyExpanded ? "Close reply" : "Reply"}
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
                          {replyBusy ? <span aria-hidden="true">…</span> : <Send size={14} />}
                        </button>
                      </form>
                    )}
                    {replyError && <p role="alert" className="altuvera-toast-error">{replyError}</p>}
                  </>
                )}
              </div>

              <div className="altuvera-toast-footer">
                <button type="button" onClick={openNotification} className="altuvera-toast-primary">
                  {isChatNotification ? <MessageCircle size={14} /> : <BellRing size={14} />}
                  <span>{actionLabel}</span>
                  <ArrowUpRight size={14} />
                </button>
                <button type="button" onClick={viewInbox} className="altuvera-toast-secondary">
                  <UsersRound size={14} /> Inbox
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
