// src/pages/auth/Messages.jsx
import EmojiPickerNative from "emoji-picker-react";
import React, {
  useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import {
  MessageSquare, UsersRound, Send, Smile, X, CornerUpLeft,
  Check, CheckCheck, RefreshCw, ArrowLeft, Plus, PanelLeftClose, PanelLeftOpen, Copy,
  ChevronDown, Circle, MoreHorizontal, Edit3, Pin, Highlighter, Undo2, Search, MapPin, FileText,
} from "lucide-react";
import ChatPreferencesPanel from "../../components/auth/ChatPreferencesPanel";
import ItineraryDownloadButton from "../../components/auth/ItineraryDownloadButton";
import DashboardLayout      from "../../components/auth/DashboardLayout";
import { useConversations } from "../../hooks/useConversations";
import "../../messaging-phase2.css";

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
══════════════════════════════════════════════════════════════════════════ */

const QUICK_EMOJIS        = ["👍","❤️","😂","🎉","👏","😮","🙏","🔥"];

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://backend-jd8f.onrender.com/api";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://backend-jd8f.onrender.com";

const getToken = () => {
  try {
    return (
      localStorage.getItem("altuvera_auth_token") ||
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      ""
    );
  } catch { return ""; }
};

const getAccountChatKey = () => {
  try {
    const payload = getToken().split(".")[1];
    if (!payload) return "account";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    return String(decoded.id ?? decoded.userId ?? decoded.sub ?? decoded.email ?? "account");
  } catch { return "account"; }
};

const authFetch = (url, opts = {}) =>
  fetch(url, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${getToken()}`,
      ...opts.headers,
    },
  });

const fmtShort = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

const fmtElapsed = (d, now = Date.now()) => {
  if (!d) return "";
  const mins = Math.max(0, Math.floor((now - new Date(d).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h " + (mins % 60) + "m ago";
  return Math.floor(hrs / 24) + "d ago";
};

const fmtRelative = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60_000)    return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getPreviewCurrentUserId = () => {
  try {
    const token = getToken();
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    return decoded.id ?? decoded.userId ?? decoded.user_id ?? decoded.sub ?? null;
  } catch {
    return null;
  }
};

const GENERIC_PREVIEW_NAMES = new Set([
  "admin", "administrator", "super admin", "altuvera support",
  "user", "end user", "guest", "guest user", "traveler", "traveller",
  "visitor", "unknown member", "deleted user",
]);
const getRealPreviewName = (...values) => {
  for (const value of values) {
    const name = String(value ?? "").trim();
    if (name && !GENERIC_PREVIEW_NAMES.has(name.toLowerCase().replace(/\s+/g, " "))) return name;
  }
  return "";
};
const ADMIN_PREVIEW_TYPES = new Set(["admin", "super_admin", "superadmin", "administrator", "moderator", "editor", "support", "staff", "agent"]);

const getConversationLastMessagePreview = (conv, currentUserId) => {
  const body = String(conv.lastMessage || "").trim();
  if (!body) return "No messages yet";

  const senderType = String(conv.lastMessageSenderType || conv.last_message_sender_type || "")
    .trim().toLowerCase().replace(/[\s-]+/g, "_");
  const senderId = conv.lastMessageSenderId ?? conv.last_message_sender_id;
  const isGroup = conv.conversationType === "group" || Boolean(conv.groupId ?? conv.group_id);
  const senderName = getRealPreviewName(
    conv.lastMessageSenderName, conv.last_message_sender_name,
    conv.lastMessageSenderUsername, conv.last_message_sender_username,
  );
  const senderUsername = getRealPreviewName(
    conv.lastMessageSenderUsername, conv.last_message_sender_username,
  );

  if (ADMIN_PREVIEW_TYPES.has(senderType)) {
    return (senderName || "Altuvera") + ": " + body;
  }

  if (["user", "traveler"].includes(senderType)) {
    const isCurrentUser = currentUserId != null && senderId != null
      ? String(currentUserId) === String(senderId)
      : !isGroup;
    if (isCurrentUser) return "You: " + body;
    return (senderName || senderUsername || "Member") + ": " + body;
  }

  return (senderName || senderUsername || "Altuvera") + ": " + body;
};

const isToday = (d) => {
  const n = new Date();
  return d.getDate()===n.getDate() && d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
};
const isYesterday = (d) => {
  const y = new Date(); y.setDate(y.getDate()-1);
  return d.getDate()===y.getDate() && d.getMonth()===y.getMonth() && d.getFullYear()===y.getFullYear();
};

const groupMessages = (messages) => {
  const out = []; let last = null;
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const label = isToday(d) ? "Today"
      : isYesterday(d) ? "Yesterday"
      : d.toLocaleDateString("en-US", { weekday:"long", month:"short", day:"numeric" });
    if (label !== last) { out.push({ type:"sep", label, key:`sep-${label}` }); last = label; }
    out.push({ type:"msg", data:m, key:m.id });
  }
  return out;
};

/* ══════════════════════════════════════════════════════════════════════════
   SOCKET HOOK
══════════════════════════════════════════════════════════════════════════ */

function useUserSocket(userId, activeConvId, handlers) {
  const socketRef  = useRef(null);
  const handlersRef = useRef(handlers);
  const [connected, setConnected] = useState(false);

  // Keep handlers fresh without re-running the effect
  useEffect(() => { handlersRef.current = handlers; });

  useEffect(() => {
    if (!userId) return;
    let socket;
    const connect = async () => {
      try {
        const { io } = await import("socket.io-client");
        socket = io(WS_URL, {
          auth:              { token: getToken() },
          transports:        ["websocket","polling"],
          reconnection:      true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1500,
          reconnectionDelayMax: 30_000,
          timeout:           10_000,
        });
        socketRef.current = socket;
        socket.on("connect",    () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.emit("join:user", { userId });

        socket.on("msg:message",              (p) => handlersRef.current.onMessage?.(p));
        socket.on("msg:new-from-admin",       (p) => handlersRef.current.onMessage?.(p.message || p));
        socket.on("msg:conversation-updated", (p) => handlersRef.current.onConvUpdated?.(p));
        socket.on("msg:reaction",             (p) => handlersRef.current.onReaction?.(p));
        socket.on("msg:typing",               (p) => handlersRef.current.onTyping?.(p));
      } catch (e) { console.warn("[Socket]", e.message); }
    };
    connect();
    return () => { socket?.disconnect(); };
  }, [userId]);

  // Join / leave conversation room
  useEffect(() => {
    const s = socketRef.current;
    if (!s?.connected || !activeConvId) return;
    s.emit("join:conversation", { conversationId: activeConvId });
    return () => {
      if (s?.connected) s.emit("leave:conversation", { conversationId: activeConvId });
    };
  }, [activeConvId]);

  const emitTyping = useCallback((convId, isTyping) => {
    socketRef.current?.emit("msg:typing", { conversationId: convId, isTyping, senderType: "user" });
  }, []);

  return { connected, emitTyping, socket: socketRef };
}

/* ══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES  (injected once)
══════════════════════════════════════════════════════════════════════════ */

const MSG_STYLES = `
.msg-layout {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
/* SIDEBAR */
.msg-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-right: 1px solid #e2e8f0;
  background: #ffffff;
}
.msg-sidebar-head {
  flex-shrink: 0;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  z-index: 2;
}
.msg-sidebar-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: clip;
  overscroll-behavior: contain;
}
.msg-sidebar-list::-webkit-scrollbar { width: 4px; }
.msg-sidebar-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
.msg-sidebar-list:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }

/* CHAT PANEL */
.msg-chat {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: #f8fafc;
}
.msg-chat-head {
  flex-shrink: 0;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  z-index: 2;
}
.msg-chat-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  padding: 16px;
}
.msg-load-older { display:flex; justify-content:center; padding:4px 0 14px; }
.msg-load-older button {
  border:1px solid #d1fae5; border-radius:999px; background:rgba(255,255,255,.92);
  color:#047857; font-size:11px; font-weight:700; padding:7px 12px;
  box-shadow:0 2px 8px rgba(15,23,42,.04);
}
.msg-load-older button:disabled { opacity:.65; }
.msg-chat-body::-webkit-scrollbar { width: 4px; }
.msg-chat-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
.msg-chat-body:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
.msg-chat-foot {
  flex-shrink: 0; width:100%; background:rgba(255,255,255,.97);
  border-top:1px solid #e2e8f0; z-index:2; box-sizing:border-box;
  padding-bottom:max(10px, env(safe-area-inset-bottom));
}
.msg-composer-row {
  position:relative; isolation:isolate; min-width:0; border:1px solid transparent; border-radius:22px;
  background:linear-gradient(#fff,#fff) padding-box, linear-gradient(110deg,#059669,#6ee7b7,#38bdf8,#059669) border-box;
  background-size:100% 100%, 260% 100%; animation:msgBorderFlow 6s linear infinite;
  box-shadow:0 8px 26px rgba(15,23,42,.08),0 2px 7px rgba(5,150,105,.06);
  transition:box-shadow .22s, transform .22s;
}
.msg-composer-row:focus-within {
  animation-duration:2.4s; transform:translateY(-1px);
  box-shadow:0 0 0 3px rgba(16,185,129,.11),0 12px 32px rgba(5,150,105,.13);
}
@keyframes msgBorderFlow { to { background-position:0 0,260% 0; } }
.msg-composer-row textarea { line-height:1.45; padding-top:12px; padding-bottom:12px; }
.msg-composer-row button { transition:transform .18s, background .18s, box-shadow .18s; }
.msg-composer-row button:active { transform:scale(.94); }
.msg-composer-row:focus-within textarea::placeholder { color:#94a3b8; }
@media (prefers-reduced-motion:reduce) { .msg-composer-row { animation:none; transition:none; } }
.msg-composer-row textarea {
  min-width:0; border:0 !important; outline:none !important;
  box-shadow:none !important; background:transparent !important;
}
.msg-chat-head > * { min-width:0; }
.msg-chat { position:relative; }
.msg-chat .msg-scroll-layer { display:none !important; }
.msg-bubble-wrap { touch-action:pan-y; will-change:transform; }
/* Keep the conversation directly beneath the site navbar; no duplicated 80px spacer. */
.dashboard-layout:has(.msg-layout) { padding-top:0 !important; min-height:0; }
.dashboard-layout:has(.msg-layout) .dashboard-content { padding:0 !important; height:calc(100dvh - var(--site-nav-height, 80px)); }
.dashboard-layout:has(.msg-layout) .dashboard-header { display:none; }
.msg-chat-foot { background:rgba(255,255,255,.96); backdrop-filter:blur(16px); }
.msg-send-button { background:linear-gradient(135deg,#059669,#10b981); box-shadow:0 5px 14px rgba(5,150,105,.22); }
.msg-send-button:hover { box-shadow:0 8px 20px rgba(5,150,105,.3); transform:translateY(-1px); }
@media (max-width:767px) {
  .msg-chat-head { gap:8px; padding-top:10px; padding-bottom:10px; }
  .msg-chat-body { padding:10px 9px; }
  .msg-chat-foot { padding:8px 9px max(10px, env(safe-area-inset-bottom)); }
  .msg-composer-row { gap:5px; padding:5px; border-radius:18px; }
  .msg-composer-row textarea { padding:8px 7px; font-size:16px; max-width:100%; }
  .msg-composer-row button { flex-shrink:0; }
  .msg-meta { opacity:1; }
}
@media (min-width:768px) {
  .msg-chat-body { padding:clamp(14px, 2vw, 24px); }
}

/* MOBILE: full panel swap */
@media (max-width: 767px) {
  .msg-layout { width: 100%; height: 100%; min-height: 0; }
  .msg-sidebar { width: 100%; min-width: 0; border-right: none; }
  .msg-chat { position: absolute; inset: 0; z-index: 10; width: 100%; min-width: 0; }
  .msg-chat-head { min-height: 64px; padding-left: 12px; padding-right: 12px; }
  .msg-chat-body { padding: 12px; }
  .msg-chat-foot { padding: 8px 10px max(10px, env(safe-area-inset-bottom)); }
  .msg-chat-foot textarea { min-width: 0; width: 100%; }
}

/* Typing dots */
@keyframes tdot {
  0%,80%,100% { transform: translateY(0); opacity: .4; }
  40%         { transform: translateY(-4px); opacity: 1; }
}
.tdot { animation: tdot 1.2s ease-in-out infinite; }

/* Bubble hover actions */
.bubble-actions {
  opacity: 0;
  transform: translateY(4px);
  transition: opacity .18s, transform .18s;
  pointer-events: none;
}
.msg-bubble-wrap:hover .bubble-actions {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.msg-meta {
  opacity: 0;
  transition: opacity .18s;
}
.msg-bubble-wrap:hover .msg-meta { opacity: 1; }

/* Account-level chat personalization: theme colors intentionally override
   utility classes so each selection changes the visible chat, not just the label. */
.msg-chat[data-theme="emerald"] { --chat-accent:#059669; --chat-surface:#f8fafc; --chat-border:#a7f3d0; background:#f8fafc !important; color:#0f172a; }
.msg-chat[data-theme="emerald"] .msg-chat-head,
.msg-chat[data-theme="emerald"] .msg-chat-foot { background:#fff !important; border-color:#a7f3d0 !important; }
.msg-chat[data-theme="emerald"] .msg-chat-body { background:#f8fafc !important; }
.msg-chat[data-theme="emerald"] .msg-bubble-wrap .bg-emerald-600 { background-color:#059669 !important; background-image:none !important; }
.msg-chat[data-theme="emerald"] .msg-bubble-wrap .text-emerald-600 { color:#059669 !important; }

.msg-chat[data-theme="ocean"] { --chat-accent:#0284c7; --chat-surface:#eff8ff; --chat-border:#bae6fd; background:#eff8ff !important; color:#0c4a6e; }
.msg-chat[data-theme="ocean"] .msg-chat-head,
.msg-chat[data-theme="ocean"] .msg-chat-foot { background:#fff !important; border-color:#bae6fd !important; }
.msg-chat[data-theme="ocean"] .msg-chat-body { background:#eff8ff !important; }
.msg-chat[data-theme="ocean"] .msg-bubble-wrap .bg-emerald-600 { background-color:#0284c7 !important; background-image:none !important; }
.msg-chat[data-theme="ocean"] .msg-bubble-wrap .text-emerald-600 { color:#0284c7 !important; }
.msg-chat[data-theme="ocean"] .msg-bubble-wrap .bg-emerald-50 { background:#e0f2fe !important; color:#075985 !important; }
.msg-chat[data-theme="ocean"] .msg-chat-foot textarea { caret-color:#0284c7; }

.msg-chat[data-theme="rose"] { --chat-accent:#e11d48; --chat-surface:#fff1f2; --chat-border:#fecdd3; background:#fff1f2 !important; color:#881337; }
.msg-chat[data-theme="rose"] .msg-chat-head,
.msg-chat[data-theme="rose"] .msg-chat-foot { background:#fff !important; border-color:#fecdd3 !important; }
.msg-chat[data-theme="rose"] .msg-chat-body { background:#fff1f2 !important; }
.msg-chat[data-theme="rose"] .msg-bubble-wrap .bg-emerald-600 { background-color:#e11d48 !important; background-image:none !important; }
.msg-chat[data-theme="rose"] .msg-bubble-wrap .text-emerald-600 { color:#e11d48 !important; }
.msg-chat[data-theme="rose"] .msg-bubble-wrap .bg-emerald-50 { background:#ffe4e6 !important; color:#9f1239 !important; }
.msg-chat[data-theme="rose"] .msg-chat-foot textarea { caret-color:#e11d48; }

.msg-chat[data-theme="midnight"] { --chat-accent:#6478ee; --chat-surface:#0d1729; --chat-border:#263750; background:#0d1729 !important; color:#e2e8f0; }
.msg-chat[data-theme="midnight"] .msg-chat-head,
.msg-chat[data-theme="midnight"] .msg-chat-foot { background:#101d32 !important; border-color:#263750 !important; }
.msg-chat[data-theme="midnight"] .msg-chat-body { background:#0d1729 !important; }
.msg-chat[data-theme="midnight"] .msg-chat-head p { color:#e2e8f0 !important; }
.msg-chat[data-theme="midnight"] .msg-chat-head button { background:#17263d; border-color:#30435d; color:#e2e8f0; }
.msg-chat[data-theme="midnight"] .msg-bubble-wrap .bg-white { background:#17263d !important; color:#e3edf9 !important; border-color:#30435d !important; }
.msg-chat[data-theme="midnight"] .msg-bubble-wrap .text-slate-400,
.msg-chat[data-theme="midnight"] .msg-bubble-wrap .text-slate-500 { color:#9fb1ca !important; }
.msg-chat[data-theme="midnight"] .msg-bubble-wrap .bg-emerald-600 { background:#596be8 !important; background-image:none !important; color:#fff !important; }
.msg-chat[data-theme="midnight"] .msg-bubble-wrap .bg-emerald-50 { background:#17263d !important; color:#c7d2fe !important; }
.msg-chat[data-theme="midnight"] .msg-chat-foot textarea { background:#17263d !important; border-color:#30435d !important; color:#e2e8f0 !important; caret-color:#a5b4fc; }
.msg-chat[data-theme="midnight"] .msg-chat-foot textarea::placeholder { color:#9fb1ca !important; }
.msg-chat[data-theme="midnight"] .msg-chat-head span,
.msg-chat[data-theme="midnight"] .msg-chat-head div { color:#e2e8f0; }

@media (prefers-reduced-motion: reduce) {
  .bubble-actions, .msg-meta { transition:none !important; }
}

/* On phones, the initial view is the conversation list. Only show chat after a conversation is selected. */
@media (max-width: 767px) {
  .msg-sidebar.mobile-inbox-visible { display: flex !important; }
  .msg-chat.mobile-inbox-hidden { display: none !important; }
}

/* Traveller messaging portal: keep essential controls inside the mobile viewport. */
@media (max-width: 767px) {
  .dashboard-layout:has(.msg-layout) {
    height: calc(100dvh - var(--site-nav-height, 80px)) !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }
  .dashboard-layout:has(.msg-layout) .dashboard-content {
    height: calc(100dvh - var(--site-nav-height, 80px)) !important;
    max-height: calc(100dvh - var(--site-nav-height, 80px)) !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }
  .dashboard-layout:has(.msg-layout) .dashboard-content .dashboard-inner-content {
    display: flex !important;
    flex: 1 1 auto !important;
    flex-direction: column !important;
    min-height: 0 !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }
  .msg-page-nav { gap: 6px !important; min-width: 0; }
  .msg-page-nav > div:first-child { min-width: 0; }
  .msg-page-nav-actions { gap: 5px !important; }
  .msg-layout {
    flex: 1 1 auto !important;
    height: auto !important;
    min-height: 0 !important;
    min-width: 0 !important;
    width: 100% !important;
    overflow: hidden !important;
  }
  .msg-sidebar {
    flex: 1 1 auto;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }
  .msg-chat {
    inset: 0;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
  }
  .msg-chat-head {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    overflow: visible;
  }
  .msg-chat-head > button { flex-shrink: 0; }
  .msg-chat-head > div:nth-child(2) {
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
  }
  .msg-chat-head > div:nth-child(3) {
    flex: 1 1 auto;
    width: 0;
    min-width: 0 !important;
  }
  .msg-chat-head > div:nth-child(3) p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .msg-chat-head > span:last-child {
    flex: 0 0 auto;
    max-width: 60px;
    padding: 2px 5px;
    gap: 3px;
    font-size: 9px;
  }
  .msg-chat-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    padding: 10px 9px !important;
    overflow-y: auto !important;
    overscroll-behavior: contain;
  }
  .msg-chat-foot {
    position: relative;
    flex: 0 0 auto !important;
    min-width: 0;
    padding: 8px 7px max(10px, env(safe-area-inset-bottom)) !important;
    transform: none !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }
  .msg-composer-row {
    display: flex;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    gap: 4px !important;
    padding: 4px !important;
    border-radius: 16px !important;
  }
  .msg-composer-row textarea {
    flex: 1 1 auto;
    width: 0 !important;
    min-width: 0 !important;
    max-width: none !important;
    font-size: 16px !important;
    max-height: 104px !important;
  }
  .msg-composer-row > div,
  .msg-composer-row > button { flex-shrink: 0 !important; }
  .msg-composer-row button { min-width: 36px; }
  .msg-chat > section {
    flex: 0 1 auto !important;
    max-height: 32dvh;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  .msg-bubble-wrap { max-width: 100%; }
  .msg-bubble-wrap > div { min-width: 0; max-width: calc(100% - 32px); }
  .msg-bubble-wrap [class~="min-w-[220px]"] {
    min-width: 0 !important;
    max-width: 100% !important;
    width: 100%;
  }
  .msg-bubble-wrap button[aria-label="Message actions"] {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }
  .msg-message-actions-button { display: none !important; }
  .msg-bubble-wrap { -webkit-touch-callout: none; }
  .msg-chat .msg-scroll-layer {
    display: block !important;
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
  }
  .msg-scroll-layer > button { pointer-events: auto; }
  .msg-scroll-layer > button {
    bottom: calc(env(safe-area-inset-bottom) + 100px) !important;
    right: 12px !important;
  }
  .msg-bubble-wrap .absolute.top-full {
    position: fixed !important;
    top: auto !important;
    bottom: calc(env(safe-area-inset-bottom) + 90px) !important;
    right: 12px !important;
    left: auto !important;
    width: min(10rem, calc(100vw - 24px)) !important;
    margin-top: 0 !important;
    z-index: 100 !important;
  }
  .msg-chat .msg-meta { opacity: 1 !important; }
}
@media (max-width: 380px) {
  .msg-page-nav { gap: 4px !important; padding-left: 8px !important; padding-right: 8px !important; }
  .msg-page-nav-actions { gap: 4px !important; }
  .msg-page-nav-actions a { padding: 7px !important; }
  .msg-page-nav-actions a span { display: none; }
  .msg-chat-head { gap: 4px !important; padding-left: 6px !important; padding-right: 6px !important; }
  .msg-chat-head > div:nth-child(2) { flex-basis: 30px; width: 30px; height: 30px; }
  .msg-chat-head > span:last-child { max-width: 50px; padding: 2px 4px; font-size: 8px; }
  .msg-chat-head > button { padding: 5px !important; }
  .msg-chat-foot { padding-left: 6px !important; padding-right: 6px !important; }
  .msg-composer-row button { min-width: 34px; width: 34px; }
}`;

let stylesInjected = false;
function injectMsgStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  if (document.getElementById("msg-styles")) { stylesInjected = true; return; }
  const el = document.createElement("style");
  el.id = "msg-styles";
  el.textContent = MSG_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

/* ══════════════════════════════════════════════════════════════════════════
   SMALL COMPONENTS
══════════════════════════════════════════════════════════════════════════ */

function Avatar({ name = "", src, size = "md" }) {
  const sz = { xs:"w-6 h-6 text-[9px]", sm:"w-7 h-7 text-[10px]", md:"w-9 h-9 text-xs", lg:"w-11 h-11 text-sm" };
  const cls = sz[size] || sz.md;
  const ini = name.trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  if (src) return (
    <img src={src} alt={name}
      onError={e=>{e.target.onerror=null;e.target.style.display="none"}}
      className={`${cls} rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0`} />
  );
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
                    text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm`}>
      {ini}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    open:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-100 text-slate-500 border-slate-200",
    pending:"bg-amber-50 text-amber-700 border-amber-200",
  };
  const dot = { open:"bg-emerald-500", closed:"bg-slate-400", pending:"bg-amber-500" };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5
                      rounded-full border capitalize flex-shrink-0 ${map[status]||map.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]||dot.pending}`} />
      {status||"open"}
    </span>
  );
}

function DateSep({ label }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-slate-200/70" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest
                       bg-slate-50 px-3 py-1 rounded-full border border-slate-200 select-none whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200/70" />
    </div>
  );
}

function TypingDots({ name = "Altuvera" }) {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800
                      text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
        A
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm
                      px-4 py-2.5 shadow-sm flex items-center gap-2 max-w-fit">
        <span className="text-[11px] text-slate-400">{name} is typing</span>
        <span className="flex items-center gap-0.5 ml-1">
          {[0,1,2].map(i=>(
            <span key={i} className="tdot w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
              style={{ animationDelay:`${i*.2}s` }} />
          ))}
        </span>
      </div>
    </div>
  );
}

function EmojiPicker({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = e => {
      const root = ref.current;
      if (!root) return;
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      if (path.includes(root) || root.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", h, true);
    return () => document.removeEventListener("pointerdown", h, true);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      aria-label="Searchable emoji picker"
      className="absolute bottom-full left-0 mb-2 z-[70] max-w-[calc(100vw-24px)]"
    >
      <EmojiPickerNative
        onEmojiClick={(emojiData) => onPick(emojiData.emoji)}
        emojiStyle="native"
        theme="light"
        width={340}
        height={420}
        lazyLoadEmojis
        autoFocusSearch
        searchPlaceHolder="Search emojis..."
        previewConfig={{ showPreview: false }}
        skinTonesDisabled={false}
      />
    </div>
  );
}
function ScrollToBottomBtn({ visible, onClick, composerVisible = true }) {
  return (
    <button onClick={onClick} aria-label="Scroll to bottom"
      style={{
        position:"absolute", bottom: composerVisible ? 184 : 18, right:16, zIndex:10,
        transition:"opacity .25s, transform .25s",
        maxWidth:"calc(100% - 32px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
      className="w-9 h-9 rounded-full bg-emerald-600 text-white shadow-lg
                 flex items-center justify-center hover:bg-emerald-700">
      <ChevronDown size={18} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CONVERSATION ROW
══════════════════════════════════════════════════════════════════════════ */

const ConvRow = React.memo(function ConvRow({ conv, active, onSelect, isTyping, currentUserId }) {
  const isGroup = conv.conversationType === "group" || Boolean(conv.groupId);
  const latestMessagePreview = getConversationLastMessagePreview(conv, currentUserId);
  const relatedResource = conv.metadata?.relatedResource || conv.metadata?.related_resource || null;
  const title    = isGroup ? (conv.groupName || conv.subject || "Group conversation")
    : conv.conversationType === "personal" ? "Personal chat with Altuvera"
    : conv.conversationType === "resource_support" ? "Bookings & travel help" : conv.subject ||
    (conv.bookingNumber ? `Booking #${conv.bookingNumber}` : conv.guestName || "Conversation");
  const hasUnread = (conv.unreadUser || 0) > 0;

  return (
    <button onClick={()=>onSelect(conv.id)} aria-pressed={active}
      className={`
        w-full text-left px-3 py-3 transition-all duration-150 border-b border-slate-100/60
        hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-inset focus-visible:ring-emerald-500
        ${active
          ? "bg-emerald-50 border-l-[3px] !border-l-emerald-600 border-b-emerald-100"
          : "border-l-[3px] border-l-transparent"
        }
      `}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                        transition-colors ${active
                          ? "bg-emerald-600"
                          : "bg-gradient-to-br from-emerald-100 to-emerald-200"
                        }`}>
          {isGroup ? <UsersRound size={15} className={active ? "text-white" : "text-emerald-600"} /> : <MessageSquare size={15} className={active ? "text-white" : "text-emerald-600"} />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <span className={`text-sm leading-tight truncate flex-1
                              ${hasUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
              {title}
            </span>
            {isGroup && <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-violet-700 border border-violet-100">GROUP</span>}
            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
              {hasUnread && (
                <span className="bg-emerald-600 text-white rounded-full text-[10px] font-bold
                                 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
                  {conv.unreadUser > 9 ? "9+" : conv.unreadUser}
                </span>
              )}
              <span className={`text-[10px] whitespace-nowrap
                                ${hasUnread ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {fmtRelative(conv.lastMessageAt)}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          {isTyping ? (
            <div className="flex items-center gap-1 mb-1">
              <span className="flex gap-0.5 items-center">
                {[0,1,2].map(i=>(
                  <span key={i} className="tdot w-1 h-1 rounded-full bg-emerald-500 inline-block"
                    style={{ animationDelay:`${i*.15}s` }} />
                ))}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">typing…</span>
            </div>
          ) : (
            <p className={`text-[11px] truncate mb-1 leading-snug
                           ${hasUnread ? "text-slate-600 font-medium" : "text-slate-400"}`}>
              {latestMessagePreview}
            </p>
          )}

          {relatedResource?.title && <p className="mb-1 flex items-center gap-1 truncate text-[10px] font-semibold text-emerald-700"><FileText size={10} className="shrink-0"/><span className="truncate">{relatedResource.type || "Related item"}: {relatedResource.title}</span></p>}
          {/* Status */}
          <StatusPill status={conv.status || "open"} />
        </div>
      </div>
    </button>
  );
});

/* ══════════════════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════════════════════ */

const MsgBubble = React.memo(function MsgBubble({
  message, mine, replyTo, onReact, onReply, now,
  editingId, editText, setEditText, onStartEdit, onSaveEdit, onCancelEdit,
  onUnsend, onPin, onHighlight,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const actionButtonRef = useRef(null);
  const bubbleRef = useRef(null);
  const actionMenuRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const touchStartX = useRef(null);
  const swipeOffsetX = useRef(0);
  const swipeTriggered = useRef(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const reactions = useMemo(() => {
    const r = message.reactions || {};
    return Object.entries(r).filter(([,ids]) => ids?.length > 0);
  }, [message.reactions]);
  const isPending = String(message.id).startsWith("tmp-");
  const isDeleted = Boolean(message.deleted);
  const isEditing = String(editingId) === String(message.id);
  const destinationName = message.metadata?.destinationName || message.metadata?.destination_name || null;
  const relatedResource = message.metadata?.relatedResource || message.metadata?.related_resource || message.metadata?.resource || null;
  const relatedResourceTitle = relatedResource?.title || relatedResource?.name || null;
  const relatedResourceImage = relatedResource?.image || relatedResource?.imageUrl || relatedResource?.image_url || null;
  const relatedResourcePath = relatedResource?.type === "package" && (relatedResource.slug || relatedResource.id) ? `/packages/${relatedResource.slug || relatedResource.id}`
    : relatedResource?.type === "destination" && (relatedResource.slug || relatedResource.id) ? `/destinations/${relatedResource.slug || relatedResource.id}`
    : relatedResource?.type === "country" && (relatedResource.slug || relatedResource.title) ? `/country/${relatedResource.slug || encodeURIComponent(relatedResource.title)}`
    : (relatedResource?.type === "post" || relatedResource?.type === "story") && (relatedResource.slug || relatedResource.id) ? `/post/${relatedResource.slug || relatedResource.id}` : null;

  useLayoutEffect(() => {
    if (!menuOpen) return undefined;
    const positionMenu = () => {
      const anchor = window.matchMedia("(max-width: 767px)").matches ? bubbleRef.current : actionButtonRef.current;
      const menu = actionMenuRef.current;
      if (!anchor || !menu) return;
      const margin = 10;
      const gap = 6;
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(menu.offsetWidth || 208, window.innerWidth - margin * 2);
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const visualHeight = window.visualViewport?.height || window.innerHeight;
      const composer = isMobile ? document.querySelector(".msg-chat-foot") : null;
      const composerTop = composer ? composer.getBoundingClientRect().top : visualHeight;
      const safeBottom = Math.max(margin + 60, Math.min(visualHeight - margin, composerTop - margin));
      const roomBelow = Math.max(0, safeBottom - rect.bottom - 8);
      const roomAbove = Math.max(0, rect.top - margin - 8);
      const availableHeight = Math.max(80, visualHeight - margin * 2);
      // Measure natural menu height, then use the side with more room if neither side fits.
      const naturalHeight = menu.scrollHeight || menu.offsetHeight || 240;
      const preferAbove = roomBelow < Math.min(naturalHeight, 220) && roomAbove > roomBelow;
      const placeAbove = isMobile ? false
        : (window.innerHeight - rect.bottom < Math.min(naturalHeight, 260) + gap && roomAbove > window.innerHeight - rect.bottom);
      // On mobile the action sheet must always float immediately BELOW its own bubble.
      // Portal rendering removes ancestor stacking/overflow contexts; the menu itself
      // scrolls when the composer or viewport limits the available room.
      const top = isMobile
        ? Math.max(margin, rect.bottom + 8)
        : placeAbove
          ? Math.max(margin, rect.top - naturalHeight - gap)
          : Math.min(window.innerHeight - naturalHeight - margin, rect.bottom + gap);
      const sideSpace = isMobile ? Math.max(64, visualHeight - margin - top) : availableHeight;
      const maxHeight = isMobile
        ? Math.max(64, Math.min(availableHeight, sideSpace, Math.max(64, safeBottom - top)))
        : availableHeight;
      const preferredLeft = mine ? rect.right - width : rect.left;
      const left = Math.max(margin, Math.min(window.innerWidth - width - margin, preferredLeft));
      setMenuPosition({ top, left, width, maxHeight });
    };
    positionMenu();
    const frame = window.requestAnimationFrame(positionMenu);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [menuOpen, mine]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnOutside = (event) => {
      if (actionMenuRef.current?.contains(event.target) || actionButtonRef.current?.contains(event.target)) return;
      setMenuOpen(false);
    };
    const closeOnEscape = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("pointerdown", closeOnOutside, true);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside, true);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const copyMessage = async () => {
    const text = String(message.body || "");
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement("textarea");
        field.value = text;
        field.style.position = "fixed"; field.style.opacity = "0";
        document.body.appendChild(field); field.select();
        document.execCommand("copy"); field.remove();
      }
    } catch (error) { console.warn("Could not copy message", error); }
    setMenuOpen(false);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  return (
    <div
      ref={bubbleRef}
      className={`msg-bubble-wrap flex ${mine ? "justify-end" : "justify-start"} mb-1`}
      style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined, transition: touchStartX.current == null ? "transform 180ms cubic-bezier(.2,.8,.2,1)" : "none" }}
      onTouchStart={event => {
        touchStartX.current = event.touches?.[0]?.clientX ?? null;
        swipeOffsetX.current = 0;
        swipeTriggered.current = false;
        longPressTriggeredRef.current = false;
        clearLongPress();
        longPressTimerRef.current = window.setTimeout(() => {
          longPressTriggeredRef.current = true;
          setMenuOpen(true);
          if (navigator.vibrate) navigator.vibrate(12);
        }, 520);
      }}
      onTouchMove={event => {
        if (touchStartX.current == null) return;
        const currentX = event.touches?.[0]?.clientX;
        if (currentX == null) return;
        const delta = currentX - touchStartX.current;
        if (Math.abs(delta) > 8) { clearLongPress(); swipeOffsetX.current = Math.max(-12, Math.min(76, delta)); setSwipeOffset(swipeOffsetX.current); }
      }}
      onTouchEnd={() => {
        clearLongPress();
        if (Math.abs(swipeOffsetX.current) > 48 && !swipeTriggered.current) { swipeTriggered.current = true; onReply(message.id); }
        touchStartX.current = null; swipeOffsetX.current = 0; setSwipeOffset(0);
      }}
      onTouchCancel={() => { clearLongPress(); touchStartX.current = null; swipeOffsetX.current = 0; setSwipeOffset(0); }}
      onDoubleClick={() => { if (!isDeleted && !isPending) onReact(message.id, "❤️"); }}
      title="Swipe horizontally to reply on touch screens">
      {!mine && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mr-2 self-end mb-6">A</div>}

      <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[90%] sm:max-w-[72%]`}>
        {!mine && <span className="text-[10px] font-bold text-emerald-700 mb-1 ml-1 uppercase tracking-wider">Altuvera Team</span>}

        {replyTo && (
          <div className={`text-[11px] mb-1.5 max-w-full ${mine ? "self-end" : "self-start"}`}>
            {message.senderType === "admin" && replyTo.senderType === "admin" && (
              <span className="mb-1 block text-[10px] font-semibold text-emerald-700">
                Admin replied to himself
              </span>
            )}
            <div className={`border-l-2 pl-2 py-0.5 pr-3 rounded-lg truncate max-w-[280px] ${mine ? "border-emerald-300 bg-emerald-700/15 text-emerald-100" : "border-slate-300 bg-slate-100/80 text-slate-500"}`}>
              <span className="font-semibold block text-[10px] mb-0.5 opacity-70">↩ {replyTo.senderType==="admin" ? "Altuvera" : (replyTo.senderName||"You")}</span>
              <span className="block truncate">{(replyTo.body||"").slice(0,60)}</span>
            </div>
          </div>
        )}

        <div className={`relative flex items-center gap-1.5 ${message.isHighlighted ? "ring-2 ring-amber-300 ring-offset-2 rounded-2xl" : ""}`}>
          {isEditing ? (
            <div className="w-full min-w-[220px] bg-white border border-emerald-300 rounded-2xl p-2 shadow-md">
              <textarea autoFocus value={editText} onChange={e=>setEditText(e.target.value)} className="w-full min-h-[74px] resize-none outline-none text-sm text-slate-800 bg-slate-50 rounded-xl p-2.5"/>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={onCancelEdit} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200">Cancel</button>
                <button onClick={()=>onSaveEdit(message.id)} disabled={!editText.trim()} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white disabled:opacity-40">Save</button>
              </div>
            </div>
          ) : (
            <div className={`msg-message-text px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap rounded-2xl shadow-sm select-none ${mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"} ${isPending ? "opacity-60" : ""} ${isDeleted ? "italic opacity-60" : ""}`}
              style={{ wordBreak:"break-word", maxWidth:"100%", WebkitUserSelect:"none", userSelect:"none", WebkitTouchCallout:"none" }}>
              {!isDeleted && destinationName && (
                <span className={`mb-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${mine ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                  <MapPin size={12}/> Destination · {destinationName}
                </span>
              )}
              {!isDeleted && relatedResourceTitle && (
                <div className={"mb-2 flex items-center gap-2 rounded-xl border px-2.5 py-2 " + (mine ? "border-white/20 bg-white/10" : "border-emerald-100 bg-emerald-50")}>
                  {relatedResourceImage && <img src={relatedResourceImage} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />}
                  <div className="min-w-0 flex-1">
                    <span className={"block text-[9px] font-extrabold uppercase tracking-wider " + (mine ? "text-emerald-50" : "text-emerald-700")}>Imported {relatedResource.type || "item"}</span>
                    {relatedResourcePath ? <Link to={relatedResourcePath} className={"block truncate text-[11px] font-bold underline underline-offset-2 " + (mine ? "text-white" : "text-slate-800")}>{relatedResourceTitle}</Link>
                      : <span className={"block truncate text-[11px] font-bold " + (mine ? "text-white" : "text-slate-800")}>{relatedResourceTitle}</span>}
                  </div>
                </div>
              )}
              {!isDeleted && message.metadata?.bookingNumber && (
                <span className={`mb-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${mine ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-800"}`}>
                  <MessageSquare size={12}/> Booking #{message.metadata.bookingNumber}{message.metadata.booking?.status ? ` · ${message.metadata.booking.status}` : ""}
                </span>
              )}
              {!isDeleted && (message.msgType === "itinerary" || message.metadata?.kind === "itinerary") ? (
                <div className="mt-1 min-w-[220px] max-w-[360px] rounded-xl border border-emerald-200 bg-white p-3 text-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><FileText size={16} className="text-emerald-700"/></div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900">Your safari itinerary</p>
                      <p className="text-[10px] text-slate-500 truncate">{message.metadata?.booking?.destination_name || "Personalized travel plan"}{message.metadata?.bookingNumber ? ` · #${message.metadata.bookingNumber}` : ""}</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 mb-3">{message.metadata?.itinerary?.introduction || message.body}</p>
                  <p className="mb-2 text-[10px] text-slate-500">Email status: <span className={message.metadata?.emailStatus === "sent" ? "font-bold text-emerald-700" : "font-bold text-rose-600"}>{message.metadata?.emailStatus === "sent" ? "sent to email provider" : "not confirmed sent"}</span></p>
                  {message.metadata?.itinerary && message.metadata?.booking && <ItineraryDownloadButton booking={message.metadata.booking} itinerary={message.metadata.itinerary}/>}
                </div>
              ) : <span>{isDeleted ? "This message was unsent" : message.body}</span>}
              {message.edited && !isDeleted && <span className={`ml-2 text-[9px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>edited</span>}
            </div>
          )}

          {!isPending && !isDeleted && !isEditing && (
            <div className="relative flex-shrink-0">
              <button ref={actionButtonRef} onClick={()=>{setMenuPosition(null);setMenuOpen(v=>!v)}} aria-label="Message actions" aria-expanded={menuOpen} className="msg-message-actions-button w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center opacity-100 touch-manipulation transition">
                <MoreHorizontal size={15}/>
              </button>
              {menuOpen && createPortal(
                <div ref={actionMenuRef} style={{ position: "fixed", top: menuPosition?.top ?? 0, left: menuPosition?.left ?? 10, width: menuPosition?.width ?? "min(13rem, calc(100vw - 20px))", maxHeight: menuPosition?.maxHeight ?? "calc(100dvh - 20px)", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", visibility: menuPosition ? "visible" : "hidden", zIndex: 2147483000, isolation: "isolate", touchAction: "pan-y" }} className="rounded-2xl border border-slate-200 bg-white shadow-2xl p-1.5">
                  <button type="button" onClick={copyMessage} className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold hover:bg-emerald-50 active:bg-emerald-100"><Copy size={17}/> Copy message</button>
                  <button type="button" onClick={()=>{setMenuOpen(false);setReactionPickerOpen(true)}} className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold hover:bg-emerald-50 active:bg-emerald-100"><Smile size={17}/> React</button>
                  <button type="button" onClick={()=>{onReply(message.id);setMenuOpen(false)}} className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold hover:bg-emerald-50 active:bg-emerald-100"><CornerUpLeft size={17}/> Reply</button>
                  {mine && <>
                    <button type="button" onClick={()=>{onStartEdit(message);setMenuOpen(false)}} className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold hover:bg-slate-50 active:bg-slate-100"><Edit3 size={17}/> Edit</button>
                    <button type="button" onClick={()=>{onUnsend(message.id);setMenuOpen(false)}} className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 active:bg-rose-100"><Undo2 size={17}/> Unsend</button>
                  </>}
                  <button type="button" onClick={()=>{onPin(message.id,!message.isPinned);setMenuOpen(false)}} className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold hover:bg-slate-50 active:bg-slate-100"><Pin size={17}/> {message.isPinned ? "Unpin" : "Pin"}</button>
                  <button type="button" onClick={()=>{onHighlight(message.id,!message.isHighlighted);setMenuOpen(false)}} className="w-full min-h-11 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold hover:bg-amber-50 active:bg-amber-100"><Highlighter size={17}/> {message.isHighlighted ? "Remove highlight" : "Highlight"}</button>
                </div>,
                document.body
              )}
              {reactionPickerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 p-4" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setReactionPickerOpen(false)}}>
                  <section role="dialog" aria-modal="true" aria-label="Choose a reaction" className="w-full max-w-[260px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                    <div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-slate-800">React to message</span><button type="button" aria-label="Close reactions" onClick={()=>setReactionPickerOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={15}/></button></div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {QUICK_EMOJIS.map(emoji=><button type="button" key={emoji} aria-label={`React with ${emoji}`} onClick={()=>{onReact(message.id,emoji);setReactionPickerOpen(false)}} className="flex h-10 items-center justify-center rounded-xl border border-slate-100 text-xl transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-95">{emoji}</button>)}
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>

        {reactions.length > 0 && <div className={`flex flex-wrap gap-1 mt-1.5 ${mine ? "justify-end" : ""}`}>
          {reactions.map(([emoji,ids])=><button key={emoji} onClick={()=>onReact(message.id,emoji)} className="bg-white border border-slate-200 rounded-full px-2 py-0.5 text-xs hover:bg-slate-50 transition shadow-sm">{emoji} <span className="text-slate-500 font-medium">{ids.length}</span></button>)}
        </div>}

        {(message.isPinned || message.isHighlighted) && !isDeleted && <div className="flex items-center gap-2 mt-1">
          {message.isPinned && <span className="text-[9px] font-bold text-slate-500 inline-flex items-center gap-1"><Pin size={10}/> Pinned</span>}
          {message.isHighlighted && <span className="text-[9px] font-bold text-amber-600 inline-flex items-center gap-1"><Highlighter size={10}/> Highlighted</span>}
        </div>}

        <div className={`msg-meta flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${mine ? "justify-end" : ""}`}>
          <span>{mine ? "You · " : ""}{fmtShort(message.createdAt)}</span>
          {mine && !isPending && (message.isRead ? <><CheckCheck size={11} className="text-emerald-500"/><span className="text-emerald-600">Seen {fmtElapsed(message.readAt, now)}</span></> : <Check size={11} className="text-slate-400"/>)}
          {isPending && <Circle size={9} className="text-slate-300 animate-pulse"/>}
        </div>
      </div>
    </div>
  );
});

/* ══════════════════════════════════════════════════════════════════════════
   NEW CONVERSATION MODAL
══════════════════════════════════════════════════════════════════════════ */

function NewConvModal({ onClose, onCreated, groupConversations = [], onOpenConversation = () => {}, initialContext = null }) {
  const [subject, setSubject] = useState(initialContext?.title ? `Question about ${initialContext.title}` : "");
  const [inquiryType, setInquiryType] = useState(initialContext?.type || "general");
  const [relatedReference, setRelatedReference] = useState(initialContext?.title || "");
  const [importedContext, setImportedContext] = useState(initialContext);
  const inquiryConfig = {
    general: { label: "General question", subject: "General enquiry", referenceLabel: "Related details", referenceHint: "Optional details", placeholder: "Tell us how we can help…" },
    booking: { label: "Booking", subject: "Booking enquiry", referenceLabel: "Booking reference", referenceHint: "Booking number or reference", placeholder: "Ask about your booking, dates, status, guests, or changes…" },
    destination: { label: "Destination", subject: "Destination enquiry", referenceLabel: "Destination", referenceHint: "Destination name", placeholder: "Ask about activities, seasons, permits, or destination details…" },
    package: { label: "Safari package", subject: "Safari package enquiry", referenceLabel: "Package name or reference", referenceHint: "Package name or reference", placeholder: "Ask about itinerary, price, availability, or inclusions…" },
    country: { label: "Country", subject: "Country travel enquiry", referenceLabel: "Country", referenceHint: "Country name", placeholder: "Ask about entry requirements, travel logistics, or local experiences…" },
    post: { label: "Post or article", subject: "Post enquiry", referenceLabel: "Post title or link", referenceHint: "Post title or URL", placeholder: "Ask about a post, its recommendations, or a place mentioned…" },
  };
  const activeInquiry = inquiryConfig[inquiryType] || inquiryConfig.general;
  const [destinationName, setDestinationName] = useState(initialContext?.type === "destination" ? (initialContext.title || "") : "");
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(initialContext?.type === "destination" && initialContext.id ? { id: initialContext.id, name: initialContext.title, country: initialContext.country || "" } : null);
  const [destinationPickerOpen, setDestinationPickerOpen] = useState(false);
  const [body,     setBody]     = useState("");
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState("");
  const taRef = useRef(null);

  useEffect(() => { taRef.current?.focus(); }, []);
  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/destinations?is_active=true&limit=200`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    }).then(res => res.ok ? res.json() : Promise.reject(new Error("Destination list unavailable")))
      .then(payload => {
        const rows = Array.isArray(payload) ? payload
          : Array.isArray(payload?.data) ? payload.data
          : Array.isArray(payload?.rows) ? payload.rows
          : Array.isArray(payload?.data?.rows) ? payload.data.rows : [];
        if (alive) setDestinationOptions(rows.map(d => ({
          id: d.id ?? d.value ?? d.slug,
          name: String(d.name ?? d.title ?? d.label ?? "").trim(),
          country: String(d.country?.name ?? d.country_name ?? d.countryName ?? (typeof d.country === "string" ? d.country : "")).trim(),
          slug: d.slug || null,
          image: d.image_url || d.imageUrl || d.cover_image_url || null,
        })).filter(d => d.name));
      }).catch(() => { if (alive) setDestinationOptions([]); });
    return () => { alive = false; };
  }, []);
  const destinationMatches = useMemo(() => {
    const q = destinationName.trim().toLowerCase();
    if (!q) return destinationOptions.slice(0, 8);
    return destinationOptions.filter(d =>
      d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [destinationName, destinationOptions]);
  useEffect(() => {
    const h = e => { if (e.key==="Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handle = async () => {
    if (!body.trim()) { setError("Please enter a message."); return; }
    const typedDestination = destinationName.trim();
    const matchedDestination = typedDestination
      ? destinationOptions.find(d => d.name.toLowerCase() === typedDestination.toLowerCase())
      : null;
    if (typedDestination && !matchedDestination && !selectedDestination) {
      setError("Please choose a destination from the live suggestions, or clear the destination field.");
      setDestinationPickerOpen(true);
      return;
    }
    const validDestination = matchedDestination || selectedDestination;
    setError(""); setCreating(true);
    try {
      const res  = await authFetch(`${API_BASE}/messages/conversations`, {
        method:"POST",
        body: JSON.stringify({
          subject: subject.trim() || (validDestination ? `Destination enquiry: ${validDestination.name}` : (relatedReference.trim() ? `${activeInquiry.subject}: ${relatedReference.trim()}` : activeInquiry.subject)),
          body: body.trim(),
          firstMessage: body.trim(),
          destinationName: (inquiryType === "destination" ? (validDestination?.name || relatedReference.trim()) : validDestination?.name) || null,
          destinationId: validDestination?.id || null,
          metadata: { inquiryType, inquiryLabel: activeInquiry.label, relatedReference: relatedReference.trim() || null, ...(validDestination ? { destinationName: validDestination.name, destinationId: validDestination.id } : {}), ...(importedContext ? { relatedResource: importedContext } : {}) },
          kind: inquiryType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      onCreated(data.data);
    } catch (e) { setError(e.message); }
    finally      { setCreating(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl
                      shadow-2xl flex flex-col overflow-hidden"
           style={{ maxHeight:"90dvh" }}>

        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Plus size={16} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">New Message</h3>
              <p className="text-[10px] text-slate-400">Choose what your message is about</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-xl flex items-center justify-center
                       hover:bg-slate-100 text-slate-500 transition">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <MessageSquare size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-700 leading-relaxed">
              Send a message to the <strong>Altuvera support team</strong>.
              We typically reply within a few hours.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Inquiry type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(inquiryConfig).map(([value, config]) => (
                <button key={value} type="button" onClick={() => { setInquiryType(value); setImportedContext(current => current?.type === value ? current : null); setSubject(current => !current || Object.values(inquiryConfig).some(item => item.subject === current) ? config.subject : current); setRelatedReference(""); if (value !== "destination") { setDestinationName(""); setSelectedDestination(null); } }} aria-pressed={inquiryType === value}
                  className={"rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition " + (inquiryType === value ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300")}>
                  {config.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Choose a category so the support team can handle your inquiry in the right context.</p>
          </div>

          {importedContext && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              {importedContext.image && <img src={importedContext.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Imported into this conversation</p>
                <p className="mt-1 truncate text-sm font-extrabold text-slate-800">{importedContext.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{importedContext.type === "package" ? "Package enquiry" : importedContext.type === "country" ? "Country travel enquiry" : importedContext.type === "post" ? "Story discussion" : "Destination enquiry"} · The team will see this item as context.</p>
                <button type="button" onClick={() => { setImportedContext(null); setRelatedReference(""); if (inquiryType === "destination") { setDestinationName(""); setSelectedDestination(null); } }} className="mt-2 text-[11px] font-bold text-emerald-800 underline">Remove item</button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Subject <span className="text-slate-300 normal-case font-normal">(optional)</span>
            </label>
            <input value={subject} onChange={e=>setSubject(e.target.value)}
              placeholder={activeInquiry.subject}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none
                         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition placeholder:text-slate-400" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {inquiryType === "destination" ? "Destination" : activeInquiry.referenceLabel} <span className="text-slate-300 normal-case font-normal">(optional)</span>
            </label>
            {inquiryType === "destination" ? <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
              <input value={destinationName}
                onFocus={() => setDestinationPickerOpen(true)}
                onChange={e => { setDestinationName(e.target.value); setSelectedDestination(null); setImportedContext(null); setDestinationPickerOpen(true); }}
                onKeyDown={e => { if (e.key === "Escape") setDestinationPickerOpen(false); }}
                autoComplete="off"
                placeholder="Search live destinations…"
                aria-label="Search destinations in Altuvera"
                aria-expanded={destinationPickerOpen && destinationMatches.length > 0}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              {destinationPickerOpen && destinationMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {destinationMatches.map((destination, index) => (
                    <button key={String(destination.id ?? destination.name) + index} type="button"
                      onClick={() => {
                        setDestinationName(destination.name);
                        setSelectedDestination(destination);
                        setImportedContext({ type: "destination", id: destination.id, title: destination.name, slug: destination.slug || null, image: destination.image || destination.imageUrl || null, country: destination.country || null });
                        setDestinationPickerOpen(false);
                        if (!subject.trim()) setSubject(`Question about ${destination.name}`);
                      }}
                      className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-emerald-50 border-b border-slate-100 last:border-0">
                      <MapPin size={14} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-slate-800">{destination.name}</span>
                        {destination.country && <span className="block truncate text-[10px] text-slate-400">{destination.country}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
  
            </div> : <div>
              <input value={relatedReference} onChange={e => setRelatedReference(e.target.value)} placeholder={activeInquiry.referenceHint} aria-label={activeInquiry.referenceLabel}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              {inquiryType === "booking" && <p className="mt-1.5 text-[11px] text-slate-400">Include your booking reference when available. Never include passwords or payment card details.</p>}
            </div>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Quick start
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "I'd like help planning my safari.",
                "Can you help me with my booking?",
                "I'd like to ask about availability.",
                "Can you recommend a destination?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setBody(suggestion)}
                  className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea ref={taRef} value={body} onChange={e=>setBody(e.target.value)}
              rows={5} placeholder={activeInquiry.placeholder}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none
                         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition resize-none placeholder:text-slate-400" />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {groupConversations.length > 0 && (
            <section className="border-t border-slate-100 pt-4" aria-label="Your group conversations">
              <h4 className="mb-2 text-xs font-extrabold text-slate-800">Your group conversations</h4>
              <p className="mb-2 text-[11px] text-slate-500">You can continue in a group while setting up your private Altuvera support conversation.</p>
              <div className="space-y-2">
                {groupConversations.map(group => <button key={String(group.id)} type="button" onClick={() => onOpenConversation(group.id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><UsersRound size={16}/></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-800">{group.groupName || group.subject || "Group conversation"}</span><span className="block truncate text-[10px] text-slate-500">{group.lastMessage ? getConversationLastMessagePreview(group, getPreviewCurrentUserId()) : "Open group conversation"}</span></span>
                  {(group.unreadUser || 0) > 0 && <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white">{group.unreadUser > 99 ? "99+" : group.unreadUser}</span>}
                </button>)}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200
                       rounded-xl hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handle} disabled={creating || !body.trim()}
            className="px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl
                       hover:bg-emerald-700 disabled:opacity-40 transition flex items-center gap-2">
            {creating
              ? <><RefreshCw size={14} className="animate-spin"/> Sending…</>
              : <><Send size={14}/> Send Message</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */

export default function Messages() {
  // Stable clock value used by message receipts and presence labels.
  // Avoids a runtime ReferenceError during message-list rendering.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConversationId = searchParams.get("conversationId");
  const requestedNewConversation = searchParams.get("newConversation") === "1";
  const initialContext = useMemo(() => {
    if (!requestedNewConversation) return null;
    const type = searchParams.get("inquiryType") || "general";
    const title = searchParams.get("resourceTitle") || searchParams.get("destinationName") || "";
    if (!title) return null;
    return { type, id: searchParams.get("resourceId") || null, title, slug: searchParams.get("resourceSlug") || null, image: searchParams.get("resourceImage") || null, country: searchParams.get("country") || null, url: searchParams.get("resourceUrl") || null };
  }, [requestedNewConversation, searchParams]);
  const chatPreferencesKey = `altuvera:chat-preferences:${getAccountChatKey()}`;
  const [chatPrefs, setChatPrefs] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(chatPreferencesKey) || "{}");
      return { theme: stored.theme || "emerald" };
    } catch { return { theme: "emerald" }; }
  });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [conversationSearch, setConversationSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const previousHasPrivateConversationRef = useRef(null);
  // Prevent a manual return to the inbox from being overridden by auto-open rules.
  const returnedToInboxRef = useRef(false);
  const {
    conversations, messages, activeId, activeConversation,
    unreadCount, loading, loadingMsgs, loadingOlderMessages, hasMoreMessages,
    loadOlderMessages, sending, error,
    openConversation, sendMessage, fetchConversations,
    editMessage, unsendMessage, toggleMessageFlag, reactToMessage,
    adminTyping, typingConvs, emitTyping, socketRef, connected, adminOnline,
    adminPresence,
    recycleWarning,
    recycleWarningSeconds,
    dismissRecycleWarning,
    requestKeepConversation,
    restoreChoice,
    resolveRestoreChoice,
  } = useConversations();

  const [recycleRequestBusy, setRecycleRequestBusy] = useState(false);
  const [restoreChoiceBusy, setRestoreChoiceBusy] = useState(false);
  const [restoreChoiceError, setRestoreChoiceError] = useState("");
  const [recycleRequestError, setRecycleRequestError] = useState("");
  const [recycleRequestFeedback, setRecycleRequestFeedback] = useState("");
  useEffect(() => {
    if (!recycleRequestFeedback) return undefined;
    const timer = window.setTimeout(() => setRecycleRequestFeedback(""), 4500);
    return () => window.clearTimeout(timer);
  }, [recycleRequestFeedback]);
  const handleKeepPersonalConversation = async () => {
    if (!recycleWarning?.conversationId || recycleRequestBusy) return;
    setRecycleRequestBusy(true);
    setRecycleRequestError("");
    try {
      const result = await requestKeepConversation(recycleWarning.conversationId);
      setRecycleRequestFeedback(result.message || "Your request was sent to the Altuvera admin.");
    } catch (error) {
      setRecycleRequestError(error.message || "Your request could not be sent. Try again before the timer ends.");
    } finally {
      setRecycleRequestBusy(false);
    }
  };

  const handleRestoreChoice = async (choice) => {
    if (!restoreChoice?.conversationId || restoreChoiceBusy) return;
    setRestoreChoiceBusy(true);
    setRestoreChoiceError("");
    try {
      const result = await resolveRestoreChoice(choice);
      setRecycleRequestFeedback(result.message || "Your choice has been saved.");
    } catch (error) {
      setRestoreChoiceError(error.message || "Your choice could not be saved. Please try again.");
    } finally {
      setRestoreChoiceBusy(false);
    }
  };

  const [bookingReference, setBookingReference] = useState("");
  const [bookingContext, setBookingContext] = useState(null);
  const [bookingLookupBusy, setBookingLookupBusy] = useState(false);
  const [bookingLookupError, setBookingLookupError] = useState("");
  const [resourceType, setResourceType] = useState("destination");
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceResults, setResourceResults] = useState([]);
  const [resourceSearchBusy, setResourceSearchBusy] = useState(false);
  const [resourceSearchError, setResourceSearchError] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);

  const isResourceSupport = activeConversation?.conversationType === "resource_support" || activeConversation?.channel === "booking_support";

  const verifyBooking = useCallback(async () => {
    const reference = bookingReference.trim();
    if (!reference) { setBookingLookupError("Enter your booking ID or booking reference."); return; }
    setBookingLookupBusy(true);
    setBookingLookupError("");
    try {
      const response = await authFetch(`${API_BASE}/messages/booking-context/${encodeURIComponent(reference)}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) throw new Error(payload.message || "We couldn't verify this booking.");
      setBookingContext(payload.data);
      setBookingReference(payload.data.bookingNumber || String(payload.data.id));
    } catch (err) {
      setBookingContext(null);
      setBookingLookupError(err.message || "Could not verify this booking. Try again.");
    } finally { setBookingLookupBusy(false); }
  }, [bookingReference]);

  useEffect(() => {
    if (!isResourceSupport || resourceQuery.trim().length < 2) {
      setResourceResults([]);
      setResourceSearchBusy(false);
      setResourceSearchError("");
      return;
    }
    const controller = new AbortController();
    setResourceSearchBusy(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await authFetch(`${API_BASE}/messages/resources/search?type=${encodeURIComponent(resourceType)}&q=${encodeURIComponent(resourceQuery.trim())}`, { signal: controller.signal });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Search failed.");
        setResourceResults(Array.isArray(payload.data) ? payload.data : []);
        setResourceSearchError("");
      } catch (err) {
        if (err.name !== "AbortError") setResourceSearchError(err.message || "Search is unavailable.");
      } finally {
        if (!controller.signal.aborted) setResourceSearchBusy(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isResourceSupport, resourceQuery, resourceType]);

  useEffect(() => {
    if (!isResourceSupport) {
      setBookingReference("");
      setBookingContext(null);
      setBookingLookupError("");
      setResourceType("destination");
      setResourceQuery("");
      setResourceResults([]);
      setSelectedResource(null);
    }
  }, [isResourceSupport]);

  useEffect(() => { injectMsgStyles(); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/messages/preferences`);
        if (!res.ok) return;
        const payload = await res.json();
        const remote = payload?.data && typeof payload.data === "object" ? payload.data : {};
        if (!cancelled) setChatPrefs(current => ({ theme: remote.theme || current.theme }));
      } catch (err) {
        console.warn("[Messages] Could not load account chat preferences:", err.message);
      } finally {
        if (!cancelled) setPreferencesLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try { localStorage.setItem(chatPreferencesKey, JSON.stringify(chatPrefs)); } catch {}
    authFetch(`${API_BASE}/messages/preferences`, {
      method: "PATCH",
      body: JSON.stringify({ settings: chatPrefs }),
    }).catch(err => console.warn("[Messages] Could not sync chat preferences:", err.message));
  }, [chatPrefs, chatPreferencesKey, preferencesLoaded]);

  const saveChatPrefs = useCallback(async (next) => {
    const themeOnly = { theme: next.theme || "emerald" };
    setChatPrefs(themeOnly);
    try { localStorage.setItem(chatPreferencesKey, JSON.stringify(themeOnly)); } catch {}
    const res = await authFetch(`${API_BASE}/messages/preferences`, {
      method: "PATCH",
      body: JSON.stringify({ settings: themeOnly }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Preferences could not be synced. Your choices are saved on this device.");
    }
  }, [chatPreferencesKey]);

  const isGroupConversation = useCallback(c => c?.conversationType === "group" || Boolean(c?.groupId), []);
  const privateConversations = useMemo(() => conversations.filter(c => !isGroupConversation(c)), [conversations, isGroupConversation]);
  const groupConversations = useMemo(() => conversations.filter(isGroupConversation), [conversations, isGroupConversation]);

  useEffect(() => {
    if (requestedNewConversation) { setShowNewChat(true); return; }
    if (loading || error) return;
    const hasPrivate = privateConversations.length > 0;
    const previous = previousHasPrivateConversationRef.current;
    previousHasPrivateConversationRef.current = hasPrivate;
    if (!hasPrivate && previous !== false) setShowNewChat(true);
    if (hasPrivate) setShowNewChat(false);
  }, [loading, error, privateConversations, requestedNewConversation]);

  const visibleConversations = useMemo(() => {
    const query = conversationSearch.trim().toLocaleLowerCase();
    const ordered = [...conversations].sort((a, b) => {
      const ag = isGroupConversation(a), bg = isGroupConversation(b);
      if (ag !== bg) return ag ? 1 : -1;
      const ap = a.conversationType === "personal" || a.channel === "personal_support";
      const bp = b.conversationType === "personal" || b.channel === "personal_support";
      if (!ag && !bg && ap !== bp) return ap ? -1 : 1;
      return new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime() - new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
    });
    if (!query) return ordered;
    return ordered.filter(c => [c.subject, c.groupName, c.guestName, c.guestEmail, c.lastMessage, c.bookingNumber]
      .some(value => String(value || "").toLocaleLowerCase().includes(query)));
  }, [conversations, conversationSearch, isGroupConversation]);

  const openResourceSupport = useCallback(() => {
    const support = conversations.find(item => item.conversationType === "resource_support" || item.channel === "booking_support");
    if (support?.id) openConversation(support.id);
    else fetchConversations();
  }, [conversations, openConversation, fetchConversations]);

  useEffect(() => {
    if (!conversations.length) return;

    // Notification links intentionally open the exact thread, including a
    // group thread. This takes precedence over the normal inbox entry rules.
    if (requestedConversationId && !returnedToInboxRef.current) {
      const target = conversations.find(c => String(c.id) === String(requestedConversationId));
      if (target) {
        if (String(activeId) !== String(target.id)) openConversation(target.id);
        return;
      }
      // Wait for the initial list request before handling stale notification URLs.
      if (loading) return;
    }

    // A chooser is required whenever the user belongs to any group, or has
    // more than one conversation. Only a single private conversation should
    // open automatically on portal entry.
    const hasGroupConversation = conversations.some(c =>
      c.conversationType === "group" || Boolean(c.groupId)
    );
    // Travelers without groups go straight into their personal admin chat.
    // Users with groups see the chooser so they can pick either private channel
    // or any group they are actually a member of.
    if (hasGroupConversation || conversations.length > 1) {
      // Do not clear an active conversation here: this effect also runs after
      // every click. With groups present, the inbox chooser is the initial view;
      // once a thread is selected, keep it open.
      return;
    }
    if (!activeId && !returnedToInboxRef.current) {
      // Prefer the dedicated personal channel, then booking support, but never
      // leave a traveller staring at an empty chat pane just because an older
      // conversation has the legacy "direct" type or no channel metadata.
      const preferred = conversations.find(item =>
        item.conversationType === "personal" || item.channel === "personal_support"
      ) || conversations.find(item =>
        item.conversationType === "resource_support" || item.channel === "booking_support"
      );
      const fallback = conversations.find(item =>
        item.conversationType !== "group" && !item.groupId
      );
      const firstPrivate = preferred || fallback;
      if (firstPrivate?.id != null) openConversation(firstPrivate.id);
    }
  }, [requestedConversationId, conversations, activeId, openConversation, loading]);



  const [draft,        setDraft]        = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSuggestionLanguage, setAiSuggestionLanguage] = useState("");
  const aiSuggestionRequestRef = useRef(0);
  useEffect(() => {
    const value = draft.trim();
    if (value.length < 12 || value.length > 700) { setAiSuggestions([]); return; }
    const requestId = ++aiSuggestionRequestRef.current;
    const timer = setTimeout(async () => {
      try {
        const token = getToken();
        const response = await fetch(API_BASE + "/ai/message-suggestions", {
          method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
          body: JSON.stringify({ text: value }), signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) return;
        const result = await response.json();
        if (requestId === aiSuggestionRequestRef.current) {
          setAiSuggestions(Array.isArray(result.suggestions) ? result.suggestions.slice(0, 2) : []);
          setAiSuggestionLanguage(result.language || "");
        }
      } catch (_) { /* Suggestions are best-effort; never interrupt chat. */ }
    }, 650);
    return () => clearTimeout(timer);
  }, [draft]);
  const [replyToId,    setReplyToId]    = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEmoji,    setShowEmoji]    = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [atBottom,     setAtBottom]     = useState(true);
  const [showScrollBtn,setShowScrollBtn]= useState(false);
  const [composerVisible, setComposerVisible] = useState(true);
  const lastScrollTopRef = useRef(0);

  const scrollRef      = useRef(null);
  const conversationSearchRef = useRef(null);
  const draftStorageKey = activeId ? `altuvera:user-chat-draft:${activeId}` : null;
   const textareaRef    = useRef(null);
   const isTypingRef    = useRef(false);
   const typingTimerRef = useRef(null);

   /* ── Scroll helpers ── */
  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    // Keep the composer reachable at all times; only the message history scrolls.
    setComposerVisible(true);
    lastScrollTopRef.current = el.scrollTop;
    setAtBottom(bottom);
    setShowScrollBtn(!bottom);

    if (el.scrollTop <= 48 && hasMoreMessages && !loadingOlderMessages) {
      const previousHeight = el.scrollHeight;
      const previousOffset = el.scrollTop;
      setAtBottom(false);
      loadOlderMessages().then(() => {
        requestAnimationFrame(() => {
          const current = scrollRef.current;
          if (current) current.scrollTop = previousOffset + current.scrollHeight - previousHeight;
        });
      });
    }
  }, [hasMoreMessages, loadingOlderMessages, loadOlderMessages]);

  /* ── Auto-scroll on new messages ── */
  useEffect(() => {
    if (!loadingMsgs && messages.length > 0)
      requestAnimationFrame(() => scrollToBottom(false));
  }, [loadingMsgs, scrollToBottom]);

  useEffect(() => {
    if (atBottom) requestAnimationFrame(() => scrollToBottom(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  /* ── Persist draft per conversation ── */
  useEffect(() => {
    if (!draftStorageKey) return;
    try { setDraft(localStorage.getItem(draftStorageKey) || ""); } catch {}
  }, [draftStorageKey]);
  useEffect(() => {
    if (!draftStorageKey) return;
    try { if (draft) localStorage.setItem(draftStorageKey, draft); else localStorage.removeItem(draftStorageKey); } catch {}
  }, [draft, draftStorageKey]);

  /* ── Reset on conversation change ── */
  useEffect(() => {
    setReplyToId(null); setShowEmoji(false);
    setAtBottom(true); setShowScrollBtn(false); setComposerVisible(true);
    lastScrollTopRef.current = 0;
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
  }, [activeId]);

  /* ── Textarea auto-resize ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    el.style.overflowY = el.scrollHeight > 128 ? "auto" : "hidden";
  }, [draft]);

  /* ── Emit typing ── */
  const emitUserTyping = useCallback((val) => {
    if (!activeId) return;
    const typing = val.length > 0;
    if (typing !== isTypingRef.current) {
      isTypingRef.current = typing;
      emitTyping(activeId, typing);
    }
    clearTimeout(typingTimerRef.current);
    if (typing) {
      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        emitTyping(activeId, false);
      }, 3000);
    }
  }, [activeId, emitTyping]);

  /* ── Send ── */
  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    emitTyping(activeId, false);
    setDraft(""); setReplyToId(null); setAtBottom(true);
    const contextMetadata = isResourceSupport && (bookingContext || selectedResource) ? {
      ...(bookingContext ? { bookingId: bookingContext.id } : selectedResource?.type === "itinerary" && selectedResource?.bookingId ? { bookingId: selectedResource.bookingId } : {}),
      ...(selectedResource ? { resource: { type: selectedResource.type, id: selectedResource.id, name: selectedResource.name, slug: selectedResource.slug || null, imageUrl: selectedResource.imageUrl || null, country: selectedResource.country || null } } : {}),
    } : null;
    await sendMessage(activeId, text, replyToId, contextMetadata);
    if (contextMetadata) setSelectedResource(null);
  }, [draft, activeId, sending, replyToId, sendMessage, emitTyping, isResourceSupport, bookingContext, selectedResource]);

  /* ── Reactions ── */
  const toggleReaction = useCallback(async (messageId, emoji) => {
    if (!activeId) return;
    try { await reactToMessage(activeId, messageId, emoji); }
    catch (e) { console.warn("[Messages] reaction failed:", e.message); }
  }, [activeId, reactToMessage]);

  const startEditMessage = useCallback((message) => {
    setEditingMessageId(message?.id || null);
    setEditText(message?.body || "");
  }, []);

  const saveEditMessage = useCallback(async (messageId) => {
    const body = editText.trim();
    if (!activeId || !body) return;
    try {
      await editMessage(activeId, messageId, body);
      setEditingMessageId(null); setEditText("");
    } catch (e) { console.warn("[Messages] edit failed:", e.message); }
  }, [activeId, editText, editMessage]);

  const handleUnsend = useCallback(async (messageId) => {
    if (!activeId || !window.confirm("Unsend this message?")) return;
    try { await unsendMessage(activeId, messageId); }
    catch (e) { console.warn("[Messages] unsend failed:", e.message); }
  }, [activeId, unsendMessage]);

  const handleMessageFlag = useCallback(async (messageId, flag, value) => {
    if (!activeId) return;
    try { await toggleMessageFlag(activeId, messageId, flag, value); }
    catch (e) { console.warn("[Messages] message flag failed:", e.message); }
  }, [activeId, toggleMessageFlag]);

  /* ── New conv ── */
  const handleNewConvCreated = useCallback((conv) => {
    setShowNewChat(false);
    fetchConversations();
    if (conv?.id) openConversation(conv.id);
  }, [fetchConversations, openConversation]);

  /* ── Keyboard ── */
  useEffect(() => {
    const h = e => {
      if (e.key==="Escape") {
        if (showEmoji)  { setShowEmoji(false); return; }
        if (replyToId)  { setReplyToId(null); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showEmoji, replyToId]);

  useEffect(() => {
    const onShortcut = event => {
      const target = event.target;
      const typingTarget = target && (
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" ||
        target.isContentEditable
      );
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        conversationSearchRef.current?.focus();
        conversationSearchRef.current?.select();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n" && !typingTarget) {
        event.preventDefault();
        openResourceSupport();
        return;
      }
      if (event.key === "/" && !typingTarget && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        conversationSearchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  /* ── Derived ── */
  const replyMap   = useMemo(() => new Map(messages.map(m=>[String(m.id),m])), [messages]);
  const msgGroups  = useMemo(() => groupMessages(messages), [messages]);
  const replyMsg   = replyToId ? replyMap.get(String(replyToId)) : null;
  const convTitle  = activeConversation?.subject
    || (activeConversation?.bookingNumber ? `Booking #${activeConversation.bookingNumber}` : null)
    || activeConversation?.guestName || "Conversation";

  const showMobile = !!activeId;

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <Helmet><title>Messages | Altuvera</title></Helmet>

      <DashboardLayout
        /* Keep the chat viewport-sized and retain the mobile toggle for dashboard sidebar navigation. */
        noPadding
      >
        <nav aria-label="Message page navigation" className="msg-page-nav flex min-h-[44px] flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
            <MessageSquare size={15} className="shrink-0 text-emerald-600" />
            <span className="truncate">Your conversations</span>
            {connected && <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>Live</span>}
          </div>
          <div className="msg-page-nav-actions flex shrink-0 items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
              <ArrowLeft size={14}/> <span>Homepage</span>
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700">
              <PanelLeftOpen size={14}/> <span>Dashboard</span>
            </Link>
          </div>
        </nav>
        {/* Error */}
        {error && (
          <div role="alert" className="relative z-40 mx-3 mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800 shadow-sm sm:mx-5 sm:text-sm">
            <X size={14} className="shrink-0"/><span className="min-w-0 flex-1">{error} Your messages have not been deleted.</span>
            <button type="button" onClick={fetchConversations} disabled={loading} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 font-bold text-rose-700 disabled:opacity-50"><RefreshCw size={12} className={loading ? "animate-spin" : ""}/> Retry</button>
          </div>
        )}

        {/*
          ┌─────────────────────────────────────────────────────────────┐
          │  FIXED HEIGHT CONTAINER — fills the space DashboardLayout   │
          │  gives us. Everything inside is flex and never overflows.   │
          └─────────────────────────────────────────────────────────────┘
        */}
        <div className="msg-layout w-full flex-1 min-h-0" style={{ height: "auto" }}>

          {/* ═══════════════ SIDEBAR ═══════════════ */}
          <div className={`msg-sidebar ${showMobile ? "hidden md:flex" : "flex"} ${!showMobile ? "mobile-inbox-visible" : ""} flex-col transition-all duration-200 ${sidebarOpen ? "" : "md:hidden"}`}>

            {/* Sidebar fixed header */}
            <div className="msg-sidebar-head px-3 pt-3 pb-2 space-y-2">
              {/* Title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setSidebarOpen(v => !v)} className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center" aria-label="Toggle conversations" title="Toggle conversations">{sidebarOpen ? <PanelLeftClose size={14}/> : <PanelLeftOpen size={14}/>}</button><h3 className="font-bold text-slate-800 text-sm">Conversations</h3>
                  {unreadCount > 0 && (
                    <span className="bg-emerald-600 text-white rounded-full text-[10px] font-bold
                                     min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {connected && (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openResourceSupport()} aria-label="Open booking support" title="Open bookings & travel help (Ctrl/⌘+N)"
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    <Plus size={15} />
                  </button>
                  <button onClick={fetchConversations} disabled={loading}
                    aria-label="Refresh" title="Refresh"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               hover:bg-slate-100 text-slate-400 transition disabled:opacity-40">
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-3 pb-2">
              <label className="relative block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input ref={conversationSearchRef} value={conversationSearch} onChange={e => setConversationSearch(e.target.value)}
                  type="search" aria-label="Search conversations" placeholder="Search people, destinations, latest message…"
                  title="Shortcut: Ctrl/⌘+K"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/10" />
              </label>
            </div>

            {/* Scrollable conversation list */}
            <div className="msg-sidebar-list" role="list">
              {loading && conversations.length === 0 ? (
                /* Skeleton */
                Array.from({length:6}).map((_,i)=>(
                  <div key={i}
                    className="flex items-start gap-2.5 px-3 py-3 border-b border-slate-100 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0"/>
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="flex justify-between gap-2">
                        <div className="h-2.5 flex-1 bg-slate-200 rounded"/>
                        <div className="h-2 w-10 bg-slate-200 rounded"/>
                      </div>
                      <div className="h-2 w-4/5 bg-slate-200 rounded"/>
                      <div className="h-2 w-1/3 bg-slate-200 rounded"/>
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 && error ? (
                <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                  <RefreshCw size={22} className="mb-3 text-rose-500"/>
                  <p className="mb-1 text-sm font-bold text-slate-700">Inbox couldn't load</p>
                  <p className="mb-4 text-xs leading-relaxed text-slate-500">We couldn't confirm whether your conversations are available.</p>
                  <button type="button" onClick={fetchConversations} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Retry loading</button>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center
                                  justify-center mb-3">
                    <MessageSquare size={22} className="text-slate-300"/>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">No conversations yet</p>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Book a safari or reach out to us directly.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Start a private conversation with the Altuvera team, right here.
                  </p>
                  <button onClick={() => openResourceSupport()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700">
                    <Plus size={14}/> Start a conversation
                  </button>
                </div>
              ) : visibleConversations.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Search size={20} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">No matching conversations</p>
                  <p className="mt-1 text-xs text-slate-400">Try another name, destination, or phrase.</p>
                </div>
              ) : (
                visibleConversations.map(c=>(
                  <div role="listitem" key={c.id}>
                    <ConvRow
                      conv={c}
                      active={c.id === activeId}
                      onSelect={openConversation}
                      isTyping={typingConvs.has(String(c.id))}
                      currentUserId={getPreviewCurrentUserId()}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ═══════════════ CHAT PANEL ═══════════════ */}
          <div className={`msg-chat ${showMobile ? "flex" : "hidden md:flex"} ${!showMobile ? "mobile-inbox-hidden" : ""} flex-col min-h-0 min-w-0`}
            data-theme={chatPrefs.theme}>

            {loadingMsgs && activeId ? (
              /* ── Conversation Loading State ── */
              <div className="relative flex-1 flex flex-col min-h-0 bg-slate-50">
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 px-5 text-center backdrop-blur-sm" role="status" aria-live="polite">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-[0_16px_45px_rgba(5,150,105,0.14)] sm:h-28 sm:w-28">
                    <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="h-14 w-14 animate-bounce object-contain sm:h-16 sm:w-16" onError={event => { event.currentTarget.style.display = "none"; }}/>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-800"><RefreshCw size={15} className="animate-spin"/>Opening conversation…</div>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">Loading your messages securely. Please keep this page open.</p>
                  <div className="mt-4 h-1.5 w-44 overflow-hidden rounded-full bg-emerald-50"><div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"/></div>
                </div>
                <div className="msg-chat-head px-4 py-3 flex items-center gap-3 shadow-sm bg-white">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 max-w-[65%] rounded bg-slate-200 animate-pulse" />
                    <div className="h-2.5 w-24 rounded bg-slate-100 animate-pulse" />
                  </div>
                  <div className="w-14 h-5 rounded-full bg-slate-100 animate-pulse" />
                </div>
                <div className="flex-1 overflow-hidden px-4 py-5 space-y-4">
                  {[0,1,2,3,4,5].map((i) => (
                    <div key={i}
                      className={`flex ${i % 2 ? "justify-end" : "justify-start"} animate-pulse`}>
                      <div
                        className={`rounded-2xl bg-slate-200 ${i % 2 ? "" : "ml-9"}`}
                        style={{ width: `${150 + (i % 3) * 45}px`, height: `${38 + (i % 2) * 12}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="msg-chat-foot px-3 pt-2.5 pb-3 bg-white" style={{ transform: "none", opacity: 1, pointerEvents: "auto" }}>
                  <div className="h-11 w-full rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              </div>
            ) : loading && conversations.length === 0 ? (
              /* ── Inbox Loading State ── */
              <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 text-center sm:p-8">
                <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-[0_16px_45px_rgba(5,150,105,0.12)]">
                  <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="h-16 w-16 animate-bounce object-contain" onError={event => { event.currentTarget.style.display = "none"; }}/>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><RefreshCw size={15} className="animate-spin"/>Loading your conversations…</div>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">Securely connecting to your Altuvera inbox.</p>
                <div className="mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-emerald-50"><div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"/></div>
              </div>
            ) : !activeConversation ? (
              /* ── Genuine Empty State ── */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100
                                flex items-center justify-center mb-5 shadow-inner">
                  <MessageSquare size={34} className="text-emerald-300"/>
                </div>
                <h3 className="text-base font-bold text-slate-600 mb-1.5">
                  {conversations.length ? "Choose a conversation" : "No conversation open"}
                </h3>
                <p className="text-sm text-slate-400 mb-6 max-w-[240px] leading-relaxed">
                  {conversations.length
                    ? "Choose your private chat with Altuvera Admin or open a group conversation from your list."
                    : "Your conversations with the Altuvera team will appear here. You can also start a new conversation."}
                </p>
                <button onClick={()=>openResourceSupport()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white
                             text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm">
                  <Plus size={15}/> New Conversation
                </button>
              </div>
            ) : (
              <>
                {!sidebarOpen && !showMobile && <button onClick={() => setSidebarOpen(true)} className="absolute left-3 top-3 z-30 w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 flex items-center justify-center hover:text-emerald-600" aria-label="Show conversations" title="Show conversations"><PanelLeftOpen size={17}/></button>}

                {/* ── FIXED CHAT HEADER ── */}
                <div className="msg-chat-head px-4 py-3 flex items-center gap-3 shadow-sm">
                  {/* Back button — mobile */}
                  <button onClick={() => { returnedToInboxRef.current = true; setSearchParams({}, { replace: true }); openConversation(null); }} aria-label="Back"
                    className="md:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100 transition
                               text-slate-600 flex-shrink-0">
                    <ArrowLeft size={18}/>
                  </button>

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700
                                  flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MessageSquare size={16} className="text-white"/>
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate leading-tight">
                      {convTitle}
                    </p>
                    {activeConversation?.groupId && <span className="mt-1 inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-violet-700 border border-violet-100">SHARED GROUP CONVERSATION</span>}
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400 truncate">
                        <span className={adminPresence.active ? "text-emerald-600 font-semibold" : ""}>
                          {adminPresence.active ? "Active " + fmtElapsed(adminPresence.activeSince, now) : "Altuvera Support"}
                        </span>
                        {activeConversation.bookingNumber &&
                          <span className="font-mono ml-1">
                            · #{activeConversation.bookingNumber}
                          </span>
                        }
                      </p>
                      {adminTyping && (
                        <span className="text-[10px] text-emerald-600 font-semibold
                                         animate-pulse flex-shrink-0">
                          typing…
                        </span>
                      )}
                    </div>
                  </div>

                  <ChatPreferencesPanel value={chatPrefs} onSave={saveChatPrefs} />

                  {/* Status pill */}
                  <StatusPill status={activeConversation.status || "open"} />
                </div>

                {isResourceSupport && (
                  <section className="shrink-0 border-b border-emerald-100 bg-emerald-50/70 px-3 py-3 sm:px-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-emerald-100 flex items-center justify-center shrink-0"><FileText size={15} className="text-emerald-700"/></div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900">Booking & travel workspace</p>
                        <p className="text-[10px] leading-relaxed text-slate-600">Verify your booking to share its live status with the coordinator. Search destinations, packages, and itineraries to ask specific questions.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input value={bookingReference} onChange={e=>{setBookingReference(e.target.value);setBookingLookupError("");}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();verifyBooking();}}} placeholder="Booking ID or reference" aria-label="Booking ID or reference" className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"/>
                      <button type="button" onClick={verifyBooking} disabled={bookingLookupBusy} className="shrink-0 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{bookingLookupBusy ? "Checking…" : "Verify"}</button>
                    </div>
                    {bookingLookupError && <p role="alert" className="text-[11px] text-rose-700">{bookingLookupError}</p>}
                    {bookingContext && (
                      <div className="rounded-xl border border-emerald-200 bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-extrabold text-slate-900">Booking #{bookingContext.bookingNumber || bookingContext.id}</p>
                            <p className="mt-0.5 text-xs font-bold text-emerald-800">{bookingContext.destinationName || "Safari booking"}{bookingContext.countryName ? ` · ${bookingContext.countryName}` : ""}</p>
                            <p className="mt-1 text-[10px] text-slate-500">{bookingContext.travelDate || "Flexible dates"}{bookingContext.returnDate ? ` → ${bookingContext.returnDate}` : ""} · {bookingContext.travelers || "—"} traveler(s)</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold uppercase text-emerald-800">{bookingContext.status || "verified"}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span>Itinerary: {String(bookingContext.itineraryStatus || "not_started").replaceAll("_"," ")}</span>
                          <span>· Email: {bookingContext.itineraryEmailStatus || "not_sent"}</span>
                        </div>
                        {bookingContext.itineraryEmailStatus === "failed" && bookingContext.itineraryEmailError && <p className="mt-1 text-[10px] text-rose-700">{bookingContext.itineraryEmailError}</p>}
                      </div>
                    )}
                    <div className="grid grid-cols-[minmax(0,110px)_1fr] gap-2">
                      <select value={resourceType} onChange={e=>{setResourceType(e.target.value);setSelectedResource(null);setResourceQuery("");}} aria-label="Resource type" className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">
                        <option value="destination">Destinations</option>
                        <option value="country">Countries</option>
                        <option value="package">Packages</option>
                        <option value="story">Stories</option>
                        <option value="itinerary">My itineraries</option>
                      </select>
                      <input value={resourceQuery} onChange={e=>setResourceQuery(e.target.value)} placeholder="Search live records…" aria-label="Search live destinations, countries, packages, stories, and itineraries" className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-400"/>
                    </div>
                    {(resourceSearchBusy || resourceSearchError || resourceResults.length > 0) && (
                      <div className="max-h-32 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                        {resourceSearchBusy && <p className="px-3 py-2 text-[10px] text-slate-500">Searching live records…</p>}
                        {resourceSearchError && <p className="px-3 py-2 text-[10px] text-rose-600">{resourceSearchError}</p>}
                        {resourceResults.map(item=><button type="button" key={`${item.type}:${item.id}`} onClick={()=>{setSelectedResource(item);setResourceQuery(item.name);setResourceResults([]);}} className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-emerald-50">
                          <span className="block truncate text-[11px] font-bold text-slate-800">{item.name}</span>
                          <span className="block truncate text-[10px] text-slate-500">{item.country || item.destination || item.bookingNumber || item.description || item.status || item.type}</span>
                        </button>)}
                      </div>
                    )}
                    {selectedResource && <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-emerald-200 px-3 py-2 text-[10px]">
                      <span className="min-w-0 truncate text-emerald-800"><b>Attached:</b> {selectedResource.type} · {selectedResource.name}</span>
                      <button type="button" onClick={()=>setSelectedResource(null)} aria-label="Remove selected resource" className="shrink-0 text-slate-500 hover:text-rose-600"><X size={13}/></button>
                    </div>}
                  </section>
                )}

                {/* ── SCROLLABLE MESSAGE BODY ── */}
                {/*
                  This div gets flex:1 + min-height:0 from .msg-chat-body
                  It NEVER grows beyond its container — it scrolls internally.
                */}
                <div
                  ref={scrollRef}
                  onScroll={onScroll}
                  className="msg-chat-body"
                  role="log"
                  aria-live="polite"
                  aria-label="Messages"
                >
                  {loadingOlderMessages && (
                    <div className="msg-load-older" aria-live="polite">
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                        <RefreshCw size={13} className="animate-spin" /> Loading earlier messages…
                      </span>
                    </div>
                  )}
                  {loadingMsgs && messages.length === 0 ? (
                    /* Message skeletons */
                    <div className="space-y-3 pt-2">
                      {Array.from({length:5}).map((_,i)=>(
                        <div key={i}
                          className={`flex ${i%2===0?"justify-start":"justify-end"} animate-pulse`}>
                          <div className={`rounded-2xl px-4 py-3 ${
                            i%2===0
                              ? "bg-slate-200 ml-9"
                              : "bg-emerald-200/50"
                          }`}
                            style={{ width:`${140+i*30}px`, height:36+i*8 }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : msgGroups.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200
                                      flex items-center justify-center mb-3 shadow-sm">
                        <Send size={20} className="text-slate-300"/>
                      </div>
                      <p className="text-sm text-slate-400">No messages yet</p>
                      <p className="text-xs text-slate-300 mt-1">Say hello! 👋</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {hasMoreMessages && !loadingOlderMessages && (
                        <div className="msg-load-older">
                          <button type="button" onClick={loadOlderMessages}>Load earlier messages</button>
                        </div>
                      )}
                      {msgGroups.map(item=>
                        item.type==="sep" ? (
                          <DateSep key={item.key} label={item.label}/>
                        ) : (
                          <MsgBubble
                            key={item.key}
                            message={item.data}
                            mine={item.data.senderType !== "admin"}
                            replyTo={item.data.replyToId
                              ? replyMap.get(String(item.data.replyToId))
                              : null
                            }
                            onReact={toggleReaction}
                            onReply={setReplyToId}
                            now={now}
                            editingId={editingMessageId}
                            editText={editText}
                            setEditText={setEditText}
                            onStartEdit={startEditMessage}
                            onSaveEdit={saveEditMessage}
                            onCancelEdit={() => { setEditingMessageId(null); setEditText(""); }}
                            onUnsend={handleUnsend}
                            onPin={(id, value) => handleMessageFlag(id, "pin", value)}
                            onHighlight={(id, value) => handleMessageFlag(id, "highlight", value)}
                          />
                        )
                      )}

                      {/* Admin typing indicator */}
                      {adminTyping && (
                        <div className="mt-2">
                          <TypingDots name={adminTyping.name} />
                        </div>
                      )}

                      {/* Bottom anchor for scroll */}
                      <div className="h-1" />
                    </div>
                  )}
                </div>

                <div className="msg-scroll-layer" aria-hidden="true">
                  <ScrollToBottomBtn
                    visible={showScrollBtn}
                    composerVisible={composerVisible}
                    onClick={()=>scrollToBottom(true)}
                  />
                </div>

                {/* ── FIXED COMPOSER ── */}
                <div className="msg-chat-foot px-3 pt-2.5 pb-3" style={{ transform: "none", opacity: 1, pointerEvents: "auto" }}>

                  {/* Closed conversation notice */}
                  {activeConversation.status === "closed" && (
                    <div className="mb-2 px-3 py-2 bg-slate-50 border border-slate-200
                                    rounded-xl text-xs text-slate-500 text-center">
                      This conversation is closed. Sending a message will reopen it.
                    </div>
                  )}

                  {/* Reply preview */}
                  {replyMsg && (
                    <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-emerald-50
                                    border border-emerald-200 rounded-xl">
                      <CornerUpLeft size={12} className="text-emerald-500 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          {replyMsg.senderType==="admin"
                            ? "Altuvera" : (replyMsg.senderName || "You")}
                        </span>
                        <span className="text-xs text-emerald-600 truncate block">
                          {(replyMsg.body||"").slice(0,80)}
                        </span>
                      </div>
                      <button onClick={()=>setReplyToId(null)} aria-label="Cancel reply"
                        className="text-emerald-400 hover:text-emerald-600 transition flex-shrink-0">
                        <X size={13}/>
                      </button>
                    </div>
                  )}

                  {/* Input row */}
                  <div className="msg-composer-row relative flex items-end gap-2 rounded-2xl p-1.5">
                    {/* Emoji toggle */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={()=>setShowEmoji(p=>!p)}
                        aria-label="Emoji picker"
                        aria-expanded={showEmoji}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center
                                    transition focus-visible:outline-none focus-visible:ring-2
                                    focus-visible:ring-emerald-500
                                    ${showEmoji
                                      ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                                    }`}>
                        <Smile size={17}/>
                      </button>
                      {showEmoji && (
                        <EmojiPicker
                          onPick={emoji=>{
                            const val = draft + emoji;
                            setDraft(val);
                            emitUserTyping(val);
                            textareaRef.current?.focus();
                          }}
                          onClose={()=>setShowEmoji(false)}
                        />
                      )}
                    </div>

                    {/* Textarea */}
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={e=>{ setDraft(e.target.value); emitUserTyping(e.target.value); }}
                      onKeyDown={e=>{
                        if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                      }}
                      onBlur={()=>{
                        clearTimeout(typingTimerRef.current);
                        if (isTypingRef.current) {
                          isTypingRef.current = false;
                          emitTyping(activeId, false);
                        }
                      }}
                      rows={1}
                      placeholder="Message Altuvera…"
                      aria-label="Message input"
                      className="flex-1 min-w-0 w-full resize-none text-[14px] px-2.5 py-2.5 rounded-xl border-0 bg-transparent outline-none leading-relaxed placeholder:text-slate-400"
                      style={{ minHeight:40, maxHeight:128 }}
                    />
                    {aiSuggestions.length > 0 && (
                      <div className="absolute bottom-[calc(100%+8px)] left-2 right-2 z-30 rounded-xl border border-emerald-100 bg-white p-2 shadow-xl shadow-slate-900/10 sm:left-12" role="group" aria-label="Optional writing suggestions">
                        <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{aiSuggestionLanguage ? "Suggestion · " + aiSuggestionLanguage : "Writing suggestion"}</div>
                        {aiSuggestions.map((suggestion, index) => <button key={index} type="button" onClick={() => { setDraft(suggestion); setAiSuggestions([]); textareaRef.current?.focus(); }} className="block w-full rounded-lg px-2 py-2 text-left text-xs leading-relaxed text-slate-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{suggestion}</button>)}
                        <button type="button" onClick={() => setAiSuggestions([])} className="mt-1 px-2 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700">Dismiss</button>
                      </div>
                    )}

                    {/* Send button */}
                    <button
                      onClick={submit}
                      disabled={!draft.trim() || sending}
                      aria-label="Send message"
                      className="h-9 w-9 sm:w-auto sm:px-4 rounded-xl flex-shrink-0
                                 flex items-center justify-center sm:gap-1.5
                                 bg-emerald-600 text-white font-bold text-sm
                                 hover:bg-emerald-700 active:bg-emerald-800
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition shadow-sm shadow-emerald-200/60
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                      {sending
                        ? <RefreshCw size={15} className="animate-spin"/>
                        : <Send size={15}/>
                      }
                      <span className="hidden sm:inline text-sm">
                        {sending ? "Sending" : "Send"}
                      </span>
                    </button>
                  </div>

                  {/* Keyboard hint */}
                  <p className="text-center text-[10px] text-slate-300 mt-1.5 select-none">
                    Enter ↵ to send · Shift+Enter for new line · Esc to cancel reply · Ctrl/⌘+K search · Ctrl/⌘+N booking help
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {showNewChat && !loading && !error && (
          <NewConvModal
            groupConversations={groupConversations}
            onOpenConversation={id => { setShowNewChat(false); openConversation(id); }}
            onClose={() => setShowNewChat(false)}
            onCreated={(conversation) => { setShowNewChat(false); setSearchParams({}, { replace: true }); handleNewConvCreated(conversation); }}
            initialContext={initialContext}
          />
        )}
      </DashboardLayout>
      {recycleWarning && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
             role="presentation"
             onMouseDown={(event) => { if (event.target === event.currentTarget) dismissRecycleWarning(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="conversation-recycle-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/30">
            <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-5 py-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <MessageSquare size={21}/>
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="conversation-recycle-title" className="text-base font-extrabold text-slate-900">
                  Conversation scheduled for removal
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Altuvera admin {recycleWarning.requestedByName ? `(${recycleWarning.requestedByName}) ` : ""}has requested to move this conversation to the Recycle Bin.
                </p>
              </div>
              <button type="button" onClick={dismissRecycleWarning} aria-label="Dismiss reminder"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700">
                <X size={17}/>
              </button>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm font-bold text-slate-800">{recycleWarning.title || (recycleWarning.groupId ? "Group conversation" : "Personal chat with Altuvera")}</p>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Time remaining</p>
                  <p className="mt-0.5 text-xs text-slate-500">This reminder closes automatically.</p>
                </div>
                <span aria-live="polite" className={`min-w-[72px] rounded-xl px-3 py-2 text-center text-lg font-black tabular-nums ${recycleWarningSeconds <= 5 ? "bg-rose-100 text-rose-700" : "bg-white text-slate-900 border border-slate-200"}`}>
                  {recycleWarningSeconds}s
                </span>
              </div>
              {recycleWarning.canRequestKeep ? (
                <>
                  <p className="mt-4 text-xs leading-relaxed text-slate-600">
                    For this personal conversation, you can ask the admin to keep it. If you submit the request before the countdown ends, the system will cancel the recycle action. This is a live-only request and is not saved in notification history.
                  </p>
                  {recycleRequestError && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{recycleRequestError}</p>}
                  <button type="button" onClick={handleKeepPersonalConversation}
                    disabled={recycleRequestBusy || recycleWarningSeconds <= 0}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                    {recycleRequestBusy ? <RefreshCw size={16} className="animate-spin"/> : <MessageSquare size={16}/>}
                    {recycleRequestBusy ? "Sending request…" : "Ask admin to keep this conversation"}
                  </button>
                </>
              ) : (
                <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-600">
                  This is a group conversation. It will be removed from every member’s conversation list when the timer ends. You may dismiss this reminder; the countdown will continue.
                </p>
              )}
              <button type="button" onClick={dismissRecycleWarning}
                className="mt-3 w-full rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                Dismiss reminder
              </button>
            </div>
          </section>
        </div>,
        document.body
      )}
      {restoreChoice && createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
             role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="restore-choice-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/30">
            <div className="flex items-start gap-3 border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><MessageSquare size={20}/></div>
              <div className="min-w-0 flex-1">
                <h2 id="restore-choice-title" className="text-base font-extrabold text-slate-900">Choose which personal conversation to keep</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">An admin approved sending a restored conversation to you, but you already have another personal chat.</p>
              </div>
            </div>
            <div className="px-5 py-5">
              <p className="text-sm font-bold text-slate-800">{restoreChoice.title || "Restored personal conversation"}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">Choose one option. Keeping the restored conversation moves your current personal chat into the admin Recycle Bin at your request. Rejecting it returns only the restored conversation to the Recycle Bin and keeps your current chat unchanged.</p>
              {restoreChoiceError && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{restoreChoiceError}</p>}
              <button type="button" disabled={restoreChoiceBusy} onClick={() => handleRestoreChoice("keep_restored")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                {restoreChoiceBusy ? <RefreshCw size={16} className="animate-spin"/> : <MessageSquare size={16}/>}
                Keep restored conversation
              </button>
              <button type="button" disabled={restoreChoiceBusy} onClick={() => handleRestoreChoice("reject_restored")}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Reject restored conversation
              </button>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-slate-400">This choice is applied immediately and is not posted as a notification-history item.</p>
            </div>
          </section>
        </div>,
        document.body
      )}
      {recycleRequestFeedback && createPortal(
        <div role="status" className="fixed bottom-5 left-1/2 z-[10001] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xl">
          {recycleRequestFeedback}
        </div>,
        document.body
      )}
    </>
  );
}