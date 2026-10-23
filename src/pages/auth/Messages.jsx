// src/pages/auth/Messages.jsx
import EmojiPickerNative from "emoji-picker-react";
import React, {
  useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect,
} from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import {
  MessageSquare, UsersRound, Send, Smile, X, CornerUpLeft,
  Check, CheckCheck, RefreshCw, ArrowLeft, Plus, PanelLeftClose, PanelLeftOpen,
  ChevronDown, Circle, MoreHorizontal, Edit3, Pin, Highlighter, Undo2, Search, MapPin,
} from "lucide-react";
import ChatPreferencesPanel from "../../components/auth/ChatPreferencesPanel";
import DashboardLayout      from "../../components/auth/DashboardLayout";
import { useConversations } from "../../hooks/useConversations";

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
`;

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

const ConvRow = React.memo(function ConvRow({ conv, active, onSelect, isTyping }) {
  const isGroup = conv.conversationType === "group" || Boolean(conv.groupId);
  const title    = conv.groupName || conv.subject ||
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
              {conv.lastMessage || "No messages yet"}
            </p>
          )}

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

  return (
    <div
      className={`msg-bubble-wrap flex ${mine ? "justify-end" : "justify-start"} mb-1`}
      style={{ transform: `translateX(${swipeOffset}px)`, transition: touchStartX.current == null ? "transform 180ms cubic-bezier(.2,.8,.2,1)" : "none" }}
      onTouchStart={event => { touchStartX.current = event.touches?.[0]?.clientX ?? null; swipeOffsetX.current = 0; swipeTriggered.current = false; }}
      onTouchMove={event => {
        if (touchStartX.current == null) return;
        const currentX = event.touches?.[0]?.clientX;
        if (currentX == null) return;
        const delta = currentX - touchStartX.current;
        if (Math.abs(delta) > 8) { swipeOffsetX.current = Math.max(-12, Math.min(76, delta)); setSwipeOffset(swipeOffsetX.current); }
      }}
      onTouchEnd={() => {
        if (Math.abs(swipeOffsetX.current) > 48 && !swipeTriggered.current) { swipeTriggered.current = true; onReply(message.id); }
        touchStartX.current = null; swipeOffsetX.current = 0; setSwipeOffset(0);
      }}
      title="Swipe horizontally to reply on touch screens">
      {!mine && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mr-2 self-end mb-6">A</div>}

      <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[90%] sm:max-w-[72%]`}>
        {!mine && <span className="text-[10px] font-bold text-emerald-700 mb-1 ml-1 uppercase tracking-wider">Altuvera Team</span>}

        {replyTo && (
          <div className={`text-[11px] mb-1.5 max-w-full ${mine ? "self-end" : "self-start"}`}>
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
            <div className={`px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap rounded-2xl shadow-sm select-text ${mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"} ${isPending ? "opacity-60" : ""} ${isDeleted ? "italic opacity-60" : ""}`}
              style={{ wordBreak:"break-word", maxWidth:"100%" }}>
              {!isDeleted && destinationName && (
                <span className={`mb-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${mine ? "bg-white/15 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                  <MapPin size={12}/> Destination · {destinationName}
                </span>
              )}
              <span>{isDeleted ? "This message was unsent" : message.body}</span>
              {message.edited && !isDeleted && <span className={`ml-2 text-[9px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>edited</span>}
            </div>
          )}

          {!isPending && !isDeleted && !isEditing && (
            <div className="relative flex-shrink-0">
              <button onClick={()=>setMenuOpen(v=>!v)} aria-label="Message actions" className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 flex items-center justify-center sm:opacity-0 sm:group-hover/bubble:opacity-100 transition">
                <MoreHorizontal size={15}/>
              </button>
              {menuOpen && (
                <div className={`absolute top-full mt-1 z-40 w-40 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl p-1 ${mine ? "right-0" : "left-0"}`}>
                  <button type="button" onClick={()=>{setMenuOpen(false);setReactionPickerOpen(true)}} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold hover:bg-emerald-50"><Smile size={15}/> React</button>
                  <button type="button" onClick={()=>{onReply(message.id);setMenuOpen(false)}} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold hover:bg-emerald-50"><CornerUpLeft size={15}/> Reply</button>
                  {mine && <>
                    <button type="button" onClick={()=>{onStartEdit(message);setMenuOpen(false)}} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold hover:bg-slate-50"><Edit3 size={15}/> Edit</button>
                    <button type="button" onClick={()=>{onUnsend(message.id);setMenuOpen(false)}} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"><Undo2 size={15}/> Unsend</button>
                  </>}
                  <button type="button" onClick={()=>{onPin(message.id,!message.isPinned);setMenuOpen(false)}} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold hover:bg-slate-50"><Pin size={15}/> {message.isPinned ? "Unpin" : "Pin"}</button>
                  <button type="button" onClick={()=>{onHighlight(message.id,!message.isHighlighted);setMenuOpen(false)}} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold hover:bg-amber-50"><Highlighter size={15}/> {message.isHighlighted ? "Remove highlight" : "Highlight"}</button>
                </div>
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

function NewConvModal({ onClose, onCreated }) {
  const [subject,  setSubject]  = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
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
    if (typedDestination && !matchedDestination) {
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
          subject: subject.trim() || (validDestination ? `Question about ${validDestination.name}` : "General Enquiry"),
          body: body.trim(),
          firstMessage: body.trim(),
          destinationName: validDestination?.name || null,
          destinationId: validDestination?.id || null,
          metadata: validDestination ? { destinationName: validDestination.name, destinationId: validDestination.id } : {},
          kind: "general",
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
              <p className="text-[10px] text-slate-400">Write to Altuvera support</p>
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Subject <span className="text-slate-300 normal-case font-normal">(optional)</span>
            </label>
            <input value={subject} onChange={e=>setSubject(e.target.value)}
              placeholder="e.g. Question about my safari booking"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none
                         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition placeholder:text-slate-400" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Destination <span className="text-slate-300 normal-case font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
              <input value={destinationName}
                onFocus={() => setDestinationPickerOpen(true)}
                onChange={e => { setDestinationName(e.target.value); setSelectedDestination(null); setDestinationPickerOpen(true); }}
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
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">Searches destinations currently available in Altuvera. Choose a suggestion to attach it to your message.</p>
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
              rows={5} placeholder="Hi! I'd like to ask about…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none
                         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition resize-none placeholder:text-slate-400" />
          </div>

          {error && (
            <p role="alert"
               className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
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
  const [searchParams] = useSearchParams();
  const requestedConversationId = searchParams.get("conversationId");
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
  const {
    conversations, messages, activeId, activeConversation,
    unreadCount, loading, loadingMsgs, loadingOlderMessages, hasMoreMessages,
    loadOlderMessages, sending, error,
    openConversation, sendMessage, fetchConversations,
    editMessage, unsendMessage, toggleMessageFlag, reactToMessage,
    adminTyping, typingConvs, emitTyping, socketRef, connected, adminOnline,
    adminPresence,
  } = useConversations();

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

  const visibleConversations = useMemo(() => {
    const query = conversationSearch.trim().toLocaleLowerCase();
    if (!query) return conversations;
    return conversations.filter(c => [
      c.subject, c.groupName, c.guestName, c.guestEmail, c.lastMessage, c.bookingNumber,
    ].some(value => String(value || "").toLocaleLowerCase().includes(query)));
  }, [conversations, conversationSearch]);

  useEffect(() => {
    if (!conversations.length) return;

    // Notification links intentionally open the exact thread, including a
    // group thread. This takes precedence over the normal inbox entry rules.
    if (requestedConversationId) {
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
    const shouldChooseConversation = hasGroupConversation || conversations.length > 1;

    if (shouldChooseConversation) {
      // Do not silently select a group or replace a thread the user has chosen.
      return;
    }

    if (!activeId && conversations.length === 1) {
      const onlyConversation = conversations[0];
      if (onlyConversation.conversationType !== "group" && !onlyConversation.groupId) {
        openConversation(onlyConversation.id);
      }
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
    const previousTop = lastScrollTopRef.current;
    if (bottom || el.scrollTop < previousTop - 2) setComposerVisible(true);
    else if (el.scrollTop > previousTop + 2) setComposerVisible(false);
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
    await sendMessage(activeId, text, replyToId);
  }, [draft, activeId, sending, replyToId, sendMessage, emitTyping]);

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
        setShowNewChat(true);
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
        <nav aria-label="Message page navigation" className="flex min-h-[44px] flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
            <MessageSquare size={15} className="shrink-0 text-emerald-600" />
            <span className="truncate">Your conversations</span>
            {connected && <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>Live</span>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
                          px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700
                          shadow-lg whitespace-nowrap">
            <X size={14}/> {error}
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
          <div className={`msg-sidebar ${showMobile ? "hidden md:flex" : "flex"} flex-col transition-all duration-200 ${sidebarOpen ? "" : "md:hidden"}`}>

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
                  <button onClick={() => setShowNewChat(true)} aria-label="New conversation" title="New conversation (Ctrl/⌘+N)"
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
                  <button onClick={() => setShowNewChat(true)}
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
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ═══════════════ CHAT PANEL ═══════════════ */}
          <div className={`msg-chat ${showMobile ? "flex" : "hidden md:flex"} flex-col min-h-0 min-w-0`}
            data-theme={chatPrefs.theme}>

            {loadingMsgs && activeId ? (
              /* ── Conversation Loading State ── */
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
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
                <div className="msg-chat-foot px-3 pt-2.5 pb-3 bg-white" style={{ transform: composerVisible ? "translateY(0)" : "translateY(110%)", opacity: composerVisible ? 1 : 0, pointerEvents: composerVisible ? "auto" : "none", transition: "transform 180ms ease, opacity 180ms ease" }}>
                  <div className="h-11 w-full rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              </div>
            ) : loading && conversations.length === 0 ? (
              /* ── Inbox Loading State ── */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <div className="w-20 h-20 rounded-3xl bg-white border border-emerald-100 shadow-sm
                                flex items-center justify-center mb-5 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700
                                  flex items-center justify-center shadow-md">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                  <RefreshCw size={15} className="animate-spin" />
                  Loading your conversations…
                </div>
                <div className="mt-5 w-48 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-1/2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
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
                <button onClick={()=>setShowNewChat(true)}
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
                  <button onClick={()=>openConversation(null)} aria-label="Back"
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
                <div className="msg-chat-foot px-3 pt-2.5 pb-3" style={{ transform: composerVisible ? "translateY(0)" : "translateY(110%)", opacity: composerVisible ? 1 : 0, pointerEvents: composerVisible ? "auto" : "none", transition: "transform 180ms ease, opacity 180ms ease" }}>

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
                    Enter ↵ to send · Shift+Enter for new line · Esc to cancel reply · Ctrl/⌘+K search · Ctrl/⌘+N new chat
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {showNewChat && (
          <NewConvModal
            onClose={() => setShowNewChat(false)}
            onCreated={handleNewConvCreated}
          />
        )}
      </DashboardLayout>
    </>
  );
}