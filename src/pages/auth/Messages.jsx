// src/pages/auth/Messages.jsx
import React, {
  useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect,
} from "react";
import { Helmet } from "react-helmet-async";
import {
  MessageSquare, Send, Smile, X, CornerUpLeft,
  Check, CheckCheck, RefreshCw, ArrowLeft, Plus,
  ChevronDown, Circle,
} from "lucide-react";
import DashboardLayout      from "../../components/auth/DashboardLayout";
import { useConversations } from "../../hooks/useConversations";

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
══════════════════════════════════════════════════════════════════════════ */

const QUICK_EMOJIS        = ["👍","❤️","😂","🎉","👏","😮","🙏","🔥"];
const INLINE_REACT_EMOJIS = ["👍","❤️","😂","🎉"];

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
          reconnectionDelay: 1500,
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
  height: 100%;
  min-height: 0;
  overflow: hidden;
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
  overflow-x: hidden;
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
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 16px;
}
.msg-chat-body::-webkit-scrollbar { width: 4px; }
.msg-chat-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
.msg-chat-body:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
.msg-chat-foot {
  flex-shrink: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  z-index: 2;
}

/* MOBILE: full panel swap */
@media (max-width: 767px) {
  .msg-sidebar { width: 100%; border-right: none; }
  .msg-chat    { position: absolute; inset: 0; z-index: 10; }
  .msg-layout  { position: relative; }
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
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div ref={ref}
      className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-slate-200
                 rounded-2xl shadow-2xl p-2.5 grid grid-cols-4 gap-1 w-44">
      {QUICK_EMOJIS.map(e=>(
        <button key={e} onClick={()=>onPick(e)}
          className="text-xl p-1.5 rounded-xl hover:bg-slate-100 transition leading-none">
          {e}
        </button>
      ))}
    </div>
  );
}

function ScrollToBottomBtn({ visible, onClick }) {
  return (
    <button onClick={onClick} aria-label="Scroll to bottom"
      style={{
        position:"absolute", bottom:16, right:16, zIndex:10,
        transition:"opacity .25s, transform .25s",
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
  const title    = conv.subject ||
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
          <MessageSquare size={15} className={active ? "text-white" : "text-emerald-600"} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <span className={`text-sm leading-tight truncate flex-1
                              ${hasUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
              {title}
            </span>
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

const MsgBubble = React.memo(function MsgBubble({ message, mine, replyTo, onReact, onReply }) {
  const reactions = useMemo(() => {
    const r = message.reactions || {};
    return Object.entries(r).filter(([,ids]) => ids?.length > 0);
  }, [message.reactions]);
  const isPending = String(message.id).startsWith("tmp-");

  return (
    <div className={`msg-bubble-wrap flex ${mine ? "justify-end" : "justify-start"} mb-1`}>
      {/* Avatar for other side */}
      {!mine && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800
                        text-white text-[10px] font-bold flex items-center justify-center
                        flex-shrink-0 mr-2 self-end mb-6">
          A
        </div>
      )}

      <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-[78%] sm:max-w-[65%]`}>
        {/* Sender label */}
        {!mine && (
          <span className="text-[10px] font-bold text-emerald-700 mb-1 ml-1 uppercase tracking-wider">
            Altuvera Team
          </span>
        )}

        {/* Reply reference */}
        {replyTo && (
          <div className={`text-[11px] mb-1.5 max-w-full ${mine ? "self-end" : "self-start"}`}>
            <div className={`border-l-2 pl-2 py-0.5 pr-3 rounded-lg truncate max-w-[280px]
                             ${mine
                               ? "border-emerald-300 bg-emerald-700/15 text-emerald-100"
                               : "border-slate-300 bg-slate-100/80 text-slate-500"
                             }`}>
              <span className="font-semibold block text-[10px] mb-0.5 opacity-70">
                ↩ {replyTo.senderType==="admin" ? "Altuvera" : (replyTo.senderName||"You")}
              </span>
              <span className="block truncate">{(replyTo.body||"").slice(0,60)}</span>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className={`
          px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap
          rounded-2xl shadow-sm select-text
          ${mine
            ? "bg-emerald-600 text-white rounded-br-sm"
            : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"
          }
          ${isPending ? "opacity-60" : ""}
        `} style={{ wordBreak:"break-word", maxWidth:"100%" }}>
          {message.body}
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1.5 ${mine ? "justify-end" : ""}`}>
            {reactions.map(([emoji,ids])=>(
              <button key={emoji} onClick={()=>onReact(message.id,emoji)}
                className="bg-white border border-slate-200 rounded-full px-2 py-0.5 text-xs
                           hover:bg-slate-50 transition shadow-sm">
                {emoji} <span className="text-slate-500 font-medium">{ids.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Meta (time + read) — visible on hover via CSS */}
        <div className={`msg-meta flex items-center gap-1 mt-1 text-[10px] text-slate-400
                         ${mine ? "justify-end" : ""}`}>
          <span>{mine ? "You · " : ""}{fmtShort(message.createdAt)}</span>
          {mine && (
            isPending
              ? <Circle size={9} className="text-slate-300 animate-pulse" />
              : message.isRead
                ? <CheckCheck size={11} className="text-emerald-500" />
                : <Check size={11} />
          )}
        </div>

        {/* Hover quick actions — visible on hover via CSS */}
        <div className={`bubble-actions flex items-center gap-0.5 mt-0.5
                         ${mine ? "flex-row-reverse self-end" : "self-start"}`}>
          {INLINE_REACT_EMOJIS.map(e=>(
            <button key={e}
              onMouseDown={ev=>{ev.preventDefault();onReact(message.id,e)}}
              className="text-base p-1 rounded-lg hover:bg-white hover:shadow-sm transition-all">
              {e}
            </button>
          ))}
          <button
            onMouseDown={ev=>{ev.preventDefault();onReply(message.id)}}
            className="inline-flex items-center gap-1 text-[10px] text-slate-500
                       hover:text-emerald-700 px-1.5 py-1 rounded-lg
                       hover:bg-white hover:shadow-sm transition-all">
            <CornerUpLeft size={11} /> Reply
          </button>
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
  const [body,     setBody]     = useState("");
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState("");
  const taRef = useRef(null);

  useEffect(() => { taRef.current?.focus(); }, []);
  useEffect(() => {
    const h = e => { if (e.key==="Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handle = async () => {
    if (!body.trim()) { setError("Please enter a message."); return; }
    setError(""); setCreating(true);
    try {
      const res  = await authFetch(`${API_BASE}/messages/conversations`, {
        method:"POST",
        body: JSON.stringify({
          subject: subject.trim() || "General Enquiry",
          body:    body.trim(),
          kind:    "general",
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
  const {
    conversations, messages, activeId, activeConversation,
    unreadCount, loading, loadingMsgs, sending, error,
    openConversation, sendMessage, fetchConversations, user,
  } = useConversations();

  useEffect(() => { injectMsgStyles(); }, []);

  const [draft,        setDraft]        = useState("");
  const [replyToId,    setReplyToId]    = useState(null);
  const [showEmoji,    setShowEmoji]    = useState(false);
  const [showNewChat,  setShowNewChat]  = useState(false);
  const [atBottom,     setAtBottom]     = useState(true);
  const [showScrollBtn,setShowScrollBtn]= useState(false);
  const [adminTyping,  setAdminTyping]  = useState(null);
  const [typingConvs,  setTypingConvs]  = useState(new Set());

  const scrollRef      = useRef(null);
  const textareaRef    = useRef(null);
  const isTypingRef    = useRef(false);
  const typingTimerRef = useRef(null);
  const typingTimers   = useRef({});

  /* ── Socket handlers ── */
  const handleSocketMsg = useCallback((msg) => {
    if (!msg) return;
    // Clear typing for that sender
    const cid = String(msg.conversationId);
    if (msg.senderType === "admin") {
      clearTimeout(typingTimers.current[cid]);
      delete typingTimers.current[cid];
      setTypingConvs(prev => { const s = new Set(prev); s.delete(cid); return s; });
      if (String(activeId) === cid) setAdminTyping(null);
    }
    fetchConversations();
    // Hook's own state handles message append via reload
    // but we also call openConversation to refresh if active
  }, [activeId, fetchConversations]);

  const handleAdminTyping = useCallback((payload) => {
    if (payload.senderType !== "admin") return;
    const cid = String(payload.conversationId);
    if (payload.isTyping) {
      setTypingConvs(prev => { const s = new Set(prev); s.add(cid); return s; });
      if (cid === String(activeId)) setAdminTyping({ name: payload.senderName || "Altuvera" });
      clearTimeout(typingTimers.current[cid]);
      typingTimers.current[cid] = setTimeout(() => {
        setTypingConvs(prev => { const s = new Set(prev); s.delete(cid); return s; });
        setAdminTyping(prev => (prev && cid === String(activeId) ? null : prev));
      }, 4000);
    } else {
      clearTimeout(typingTimers.current[cid]);
      setTypingConvs(prev => { const s = new Set(prev); s.delete(cid); return s; });
      if (cid === String(activeId)) setAdminTyping(null);
    }
  }, [activeId]);

  const { connected, emitTyping } = useUserSocket(user?.id, activeId, {
    onMessage:     handleSocketMsg,
    onTyping:      handleAdminTyping,
    onConvUpdated: fetchConversations,
    onReaction:    fetchConversations,
  });

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
    setAtBottom(bottom);
    setShowScrollBtn(!bottom);
  }, []);

  /* ── Auto-scroll on new messages ── */
  useEffect(() => {
    if (!loadingMsgs && messages.length > 0)
      requestAnimationFrame(() => scrollToBottom(false));
  }, [loadingMsgs, scrollToBottom]);

  useEffect(() => {
    if (atBottom) requestAnimationFrame(() => scrollToBottom(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  /* ── Reset on conversation change ── */
  useEffect(() => {
    setDraft(""); setReplyToId(null); setShowEmoji(false);
    setAdminTyping(null); setAtBottom(true); setShowScrollBtn(false);
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
    try {
      await authFetch(
        `${API_BASE}/messages/conversations/${activeId}/messages/${messageId}/react`,
        { method:"PATCH", body:JSON.stringify({ emoji }) },
      );
      fetchConversations();
    } catch { /* non-fatal */ }
  }, [activeId, fetchConversations]);

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

      {showNewChat && (
        <NewConvModal onClose={()=>setShowNewChat(false)} onCreated={handleNewConvCreated} />
      )}

      <DashboardLayout
        title="Messages"
        subtitle="Chat directly with the Altuvera team about your bookings."
        /* Tell the layout NOT to add its own padding/overflow so we control it */
        noPadding
      >
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
        <div className="msg-layout w-full h-full">

          {/* ═══════════════ SIDEBAR ═══════════════ */}
          <div className={`msg-sidebar ${showMobile ? "hidden md:flex" : "flex"} flex-col`}>

            {/* Sidebar fixed header */}
            <div className="msg-sidebar-head px-3 pt-3 pb-2 space-y-2">
              {/* Title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-800 text-sm">Conversations</h3>
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
                  <button onClick={fetchConversations} disabled={loading}
                    aria-label="Refresh" title="Refresh"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               hover:bg-slate-100 text-slate-400 transition disabled:opacity-40">
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  </button>
                  <button onClick={()=>setShowNewChat(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5
                               bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                    <Plus size={11}/> New
                  </button>
                </div>
              </div>
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
                  <button onClick={()=>setShowNewChat(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2
                               bg-emerald-50 text-emerald-700 border border-emerald-200
                               rounded-xl hover:bg-emerald-100 transition">
                    <Plus size={12}/> Message us
                  </button>
                </div>
              ) : (
                conversations.map(c=>(
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
          <div className={`msg-chat ${showMobile ? "flex" : "hidden md:flex"} flex-col`}>

            {!activeConversation ? (
              /* ── Empty State ── */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100
                                flex items-center justify-center mb-5 shadow-inner">
                  <MessageSquare size={34} className="text-emerald-300"/>
                </div>
                <h3 className="text-base font-bold text-slate-600 mb-1.5">
                  No conversation open
                </h3>
                <p className="text-sm text-slate-400 mb-6 max-w-[200px] leading-relaxed">
                  Select one from the list or start a new conversation.
                </p>
                <button onClick={()=>setShowNewChat(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white
                             text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm">
                  <Plus size={15}/> New Conversation
                </button>
              </div>
            ) : (
              <>
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400 truncate">
                        Altuvera Support
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

                {/* Scroll-to-bottom button (absolute within msg-chat) */}
                <div style={{ position:"relative", height:0, overflow:"visible" }}>
                  <ScrollToBottomBtn
                    visible={showScrollBtn}
                    onClick={()=>scrollToBottom(true)}
                  />
                </div>

                {/* ── FIXED COMPOSER ── */}
                <div className="msg-chat-foot px-3 pt-2.5 pb-3">

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
                  <div className="flex items-end gap-2">
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
                            setShowEmoji(false);
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
                      placeholder="Type your message… (Enter to send)"
                      aria-label="Message input"
                      className="flex-1 resize-none text-sm px-3.5 py-2.5 rounded-xl border
                                 border-slate-200 bg-slate-50 outline-none leading-relaxed
                                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                                 focus:bg-white transition placeholder:text-slate-400"
                      style={{ minHeight:40, maxHeight:128 }}
                    />

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
                    Enter ↵ to send · Shift+Enter for new line · Esc to cancel reply
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}