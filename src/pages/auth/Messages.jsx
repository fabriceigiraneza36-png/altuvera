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

const QUICK_EMOJIS        = ["👍", "❤️", "😂", "🎉", "👏", "😮", "🙏", "🔥"];
const INLINE_REACT_EMOJIS = ["👍", "❤️", "😂", "🎉"];

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

const fmtTimeShort = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

const fmtTimeRelative = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000)    return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const isToday = (d) => {
  const n = new Date();
  return (
    d.getDate()     === n.getDate()     &&
    d.getMonth()    === n.getMonth()    &&
    d.getFullYear() === n.getFullYear()
  );
};
const isYesterday = (d) => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getDate()     === y.getDate()     &&
    d.getMonth()    === y.getMonth()    &&
    d.getFullYear() === y.getFullYear()
  );
};

const groupMessages = (messages) => {
  const groups = [];
  let lastLabel = null;
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const label = isToday(d)
      ? "Today"
      : isYesterday(d)
      ? "Yesterday"
      : d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (label !== lastLabel) {
      groups.push({ type: "sep", label, key: `sep-${label}` });
      lastLabel = label;
    }
    groups.push({ type: "msg", data: m, key: m.id });
  }
  return groups;
};

/* ══════════════════════════════════════════════════════════════════════════
   SOCKET HOOK  (lazy-loads socket.io-client)
══════════════════════════════════════════════════════════════════════════ */

function useSocket(userId, activeConvId, {
  onMessage,
  onTyping,
  onConvUpdated,
  onReaction,
}) {
  const socketRef    = useRef(null);
  const [connected,  setConnected]  = useState(false);

  useEffect(() => {
    if (!userId) return;

    let socket;

    const connect = async () => {
      try {
        // Dynamic import so bundle stays lean if io not installed
        const { io } = await import("socket.io-client");

        socket = io(WS_URL, {
          auth:              { token: getToken() },
          transports:        ["websocket", "polling"],
          reconnection:      true,
          reconnectionDelay: 1500,
          timeout:           10_000,
        });

        socketRef.current = socket;

        socket.on("connect",    () => { setConnected(true);  });
        socket.on("disconnect", () => { setConnected(false); });

        // Join own user room so admin messages reach us
        socket.emit("join:user", { userId });

        socket.on("msg:message",              onMessage);
        socket.on("msg:new-from-admin",       (p) => onMessage(p.message || p));
        socket.on("msg:conversation-updated", onConvUpdated);
        socket.on("msg:reaction",             onReaction);
        socket.on("msg:typing",               onTyping);
      } catch (err) {
        console.warn("[Socket] Could not connect:", err.message);
      }
    };

    connect();

    return () => {
      if (socket) {
        socket.off("msg:message");
        socket.off("msg:new-from-admin");
        socket.off("msg:conversation-updated");
        socket.off("msg:reaction");
        socket.off("msg:typing");
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Join / leave conversation room when active conversation changes
  useEffect(() => {
    const s = socketRef.current;
    if (!s?.connected) return;
    if (activeConvId) {
      s.emit("join:conversation", { conversationId: activeConvId });
    }
    return () => {
      if (activeConvId && s?.connected) {
        s.emit("leave:conversation", { conversationId: activeConvId });
      }
    };
  }, [activeConvId]);

  const emitTyping = useCallback((convId, isTyping) => {
    const s = socketRef.current;
    if (!s?.connected || !convId) return;
    s.emit("msg:typing", {
      conversationId: convId,
      isTyping,
      senderType:     "user",
    });
  }, []);

  return { connected, emitTyping };
}

/* ══════════════════════════════════════════════════════════════════════════
   TYPING INDICATOR
══════════════════════════════════════════════════════════════════════════ */

function TypingIndicator({ name = "Altuvera" }) {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800
                      text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        A
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm
                      px-4 py-3 shadow-sm flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 mr-1">{name} is typing</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
            style={{
              animation:      "tm-bounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes tm-bounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-5px)}
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════════════════════ */

function Avatar({ name = "", src, size = "w-9 h-9", textSize = "text-sm" }) {
  const initials =
    name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  if (src) {
    return (
      <img
        src={src} alt={name}
        onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
        className={`${size} rounded-full object-cover border border-slate-200 flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
                    text-white font-bold ${textSize} flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STATUS PILL
══════════════════════════════════════════════════════════════════════════ */

function StatusPill({ status }) {
  const map = {
    open:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed:  "bg-slate-100  text-slate-500   border-slate-200",
    pending: "bg-amber-50   text-amber-700   border-amber-200",
  };
  const dots = {
    open:    "bg-emerald-500",
    closed:  "bg-slate-400",
    pending: "bg-amber-500",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5
                      rounded-full border capitalize ${map[status] || map.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.pending}`} />
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DATE SEPARATOR
══════════════════════════════════════════════════════════════════════════ */

function DateSep({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest
                       bg-white px-2 py-0.5 rounded-full border border-slate-200 select-none">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   EMOJI PICKER
══════════════════════════════════════════════════════════════════════════ */

function EmojiPicker({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-slate-200
                 rounded-2xl shadow-2xl p-2.5 grid grid-cols-4 gap-1 w-44"
    >
      {QUICK_EMOJIS.map((emoji) => (
        <button key={emoji} onClick={() => onPick(emoji)}
          className="text-xl p-1.5 rounded-xl hover:bg-slate-100 transition leading-none
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          {emoji}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CONVERSATION ROW
══════════════════════════════════════════════════════════════════════════ */

const ConversationRow = React.memo(function ConversationRow({ conv, active, onSelect }) {
  const title    = conv.subject ||
    (conv.bookingNumber ? `Booking ${conv.bookingNumber}` : conv.guestName || "Conversation");
  const subtitle = conv.lastMessage || "No messages yet";
  const hasUnread = (conv.unreadUser || 0) > 0;

  return (
    <button
      onClick={() => onSelect(conv.id)}
      aria-pressed={active}
      className={`
        w-full text-left px-4 py-3.5 border-b border-slate-100 transition-all
        hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-inset focus-visible:ring-emerald-500
        ${active
          ? "bg-emerald-50/80 border-l-[3px] border-l-emerald-600"
          : "border-l-[3px] border-l-transparent"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200
                        flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare size={16} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm truncate flex-1
                              ${hasUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
              {title}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {hasUnread && (
                <span className="bg-emerald-600 text-white rounded-full text-[10px] font-bold
                                 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
                  {conv.unreadUser > 9 ? "9+" : conv.unreadUser}
                </span>
              )}
              <span className={`text-[10px] whitespace-nowrap hidden sm:block
                                ${hasUnread ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                {fmtTimeRelative(conv.lastMessageAt)}
              </span>
            </div>
          </div>
          <p className={`text-xs truncate mt-0.5
                         ${hasUnread ? "text-slate-600 font-medium" : "text-slate-400"}`}>
            {subtitle}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <StatusPill status={conv.status || "open"} />
            {conv.bookingNumber && (
              <span className="text-[10px] text-slate-400 font-mono">#{conv.bookingNumber}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

/* ══════════════════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════════════════════ */

const MessageBubble = React.memo(function MessageBubble({
  message, mine, replyTo, onReact, onReply,
}) {
  const reactions = useMemo(() => {
    const r = message.reactions || {};
    const e = Object.entries(r).filter(([, ids]) => ids?.length > 0);
    return e.length ? e : null;
  }, [message.reactions]);

  const isPending = String(message.id).startsWith("tmp-");

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-1 group`}>
      {/* Admin avatar */}
      {!mine && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800
                        text-white text-[10px] font-bold flex items-center justify-center
                        flex-shrink-0 mr-2 self-end mb-1">
          A
        </div>
      )}

      <div className={`max-w-[80%] sm:max-w-[68%] flex flex-col ${mine ? "items-end" : "items-start"}`}>

        {/* Sender label */}
        {!mine && (
          <span className="text-[10px] font-bold text-emerald-700 mb-1 ml-1 uppercase tracking-wider">
            Altuvera Team
          </span>
        )}

        {/* Reply reference */}
        {replyTo && (
          <div className={`flex items-start gap-1.5 text-[11px] mb-1 max-w-full
                           ${mine ? "flex-row-reverse" : ""}`}>
            <div className={`border-l-2 pl-2 py-0.5 pr-3 rounded-lg max-w-[90%] truncate
                             ${mine
                               ? "border-emerald-300 bg-emerald-700/20 text-emerald-100"
                               : "border-slate-300 bg-slate-100 text-slate-500"
                             }`}>
              <span className="font-semibold block text-[10px] mb-0.5">
                {replyTo.senderType === "admin" ? "Altuvera" : (replyTo.senderName || "You")}
              </span>
              <span className="truncate block">{(replyTo.body || "").slice(0, 60)}</span>
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className={`
          relative px-4 py-2.5 text-sm leading-relaxed
          whitespace-pre-wrap break-words rounded-2xl shadow-sm
          transition-opacity duration-300
          ${mine
            ? "bg-emerald-600 text-white rounded-br-sm"
            : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
          }
          ${isPending ? "opacity-60" : "opacity-100"}
        `}
          style={{ wordBreak: "break-word" }}
        >
          {message.body}
        </div>

        {/* Reactions */}
        {reactions && (
          <div className={`flex flex-wrap gap-1 mt-1 ${mine ? "justify-end" : ""}`}>
            {reactions.map(([emoji, ids]) => (
              <button key={emoji} onClick={() => onReact(message.id, emoji)}
                className="bg-white border border-slate-200 rounded-full px-2 py-0.5
                           text-xs hover:bg-slate-50 transition shadow-sm">
                {emoji} <span className="text-slate-500 font-medium">{ids.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400
                         transition-opacity duration-200 opacity-0 group-hover:opacity-100
                         ${mine ? "justify-end" : ""}`}>
          <span>{fmtTimeShort(message.createdAt)}</span>
          {mine && (
            isPending
              ? <Circle size={9} className="text-slate-300 animate-pulse" />
              : message.isRead
                ? <CheckCheck size={11} className="text-emerald-500" />
                : <Check size={11} />
          )}
        </div>

        {/* Inline hover actions */}
        <div className={`flex items-center gap-0.5 mt-1
                         opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                         transition-all duration-200
                         ${mine ? "flex-row-reverse" : ""}`}>
          {INLINE_REACT_EMOJIS.map((emoji) => (
            <button key={emoji}
              onMouseDown={(e) => { e.preventDefault(); onReact(message.id, emoji); }}
              className="text-base p-1 rounded-lg hover:bg-white hover:shadow-sm transition-all">
              {emoji}
            </button>
          ))}
          <button
            onMouseDown={(e) => { e.preventDefault(); onReply(message.id); }}
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
   SCROLL-TO-BOTTOM BUTTON
══════════════════════════════════════════════════════════════════════════ */

function ScrollBtn({ visible, onClick }) {
  return (
    <button onClick={onClick} aria-label="Scroll to latest"
      className={`
        absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full
        bg-emerald-600 text-white shadow-lg flex items-center justify-center
        hover:bg-emerald-700 transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        ${visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
        }
      `}
    >
      <ChevronDown size={18} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   NEW CONVERSATION MODAL
══════════════════════════════════════════════════════════════════════════ */

function NewConversationModal({ onClose, onCreated }) {
  const [subject,  setSubject]  = useState("");
  const [body,     setBody]     = useState("");
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleCreate = async () => {
    if (!body.trim()) { setError("Please enter a message."); return; }
    setError(""); setCreating(true);
    try {
      const res = await authFetch(`${API_BASE}/messages/conversations`, {
        method: "POST",
        body:   JSON.stringify({
          subject: subject.trim() || "General Enquiry",
          body:    body.trim(),
          kind:    "general",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create conversation");
      onCreated(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         role="dialog" aria-modal="true" aria-label="New message">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl
                      shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Plus size={16} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">New Message</h3>
              <p className="text-[10px] text-slate-400">Write to the Altuvera support team</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-xl flex items-center justify-center
                       hover:bg-slate-100 text-slate-500 transition">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <MessageSquare size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-700 leading-relaxed">
              Send a message to the <strong>Altuvera support team</strong>.
              We typically reply within a few hours.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Subject <span className="text-slate-300 normal-case font-normal">(optional)</span>
            </label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Question about my safari booking"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                         outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              rows={5} placeholder="Hi! I'd like to ask about…"
              autoFocus
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                         outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
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
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200
                       rounded-xl hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={creating || !body.trim()}
            className="px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl
                       hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed
                       transition flex items-center gap-2">
            {creating
              ? <><RefreshCw size={14} className="animate-spin" /> Sending…</>
              : <><Send size={14} /> Send Message</>
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
    conversations,
    messages,
    activeId,
    activeConversation,
    unreadCount,
    loading,
    loadingMsgs,
    sending,
    error,
    openConversation,
    sendMessage,
    fetchConversations,
    user,
  } = useConversations();

  const [draft,         setDraft]         = useState("");
  const [replyToId,     setReplyToId]     = useState(null);
  const [showEmoji,     setShowEmoji]     = useState(false);
  const [showNewChat,   setShowNewChat]   = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isAtBottom,    setIsAtBottom]    = useState(true);
  const [composerH,     setComposerH]     = useState(0);

  // adminTyping: { convId, name, expiresAt }
  const [adminTyping,   setAdminTyping]   = useState(null);

  const scrollRef   = useRef(null);
  const textareaRef = useRef(null);
  const composerRef = useRef(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  /* ── Socket ── */
  const handleSocketMessage = useCallback((msg) => {
    // Only handle admin messages (user messages come from sendMessage())
    if (!msg || msg.senderType !== "admin") return;

    // Deduplicate
    fetchConversations(); // refresh list unread counts

    // If this is for the active conversation, the hook should handle it
    // via the reload mechanism, but we also push it locally for instant display
    if (String(msg.conversationId) === String(activeId)) {
      // Signal the hook to append — hook exposes addMessage if available
      window.__altuvera_onSocketMsg?.(msg);
    }
  }, [activeId, fetchConversations]);

  const handleAdminTyping = useCallback((payload) => {
    if (
      payload.senderType !== "admin" ||
      String(payload.conversationId) !== String(activeId)
    ) return;

    if (payload.isTyping) {
      setAdminTyping({ convId: payload.conversationId, name: payload.senderName || "Altuvera" });
      // Auto-clear after 4 s if no further events
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setAdminTyping(null), 4000);
    } else {
      clearTimeout(typingTimer.current);
      setAdminTyping(null);
    }
  }, [activeId]);

  const handleConvUpdated = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleReaction = useCallback((payload) => {
    window.__altuvera_onReaction?.(payload);
  }, []);

  const { connected, emitTyping } = useSocket(
    user?.id,
    activeId,
    {
      onMessage:     handleSocketMessage,
      onTyping:      handleAdminTyping,
      onConvUpdated: handleConvUpdated,
      onReaction:    handleReaction,
    },
  );

  /* ── Composer resize observer ── */
  useLayoutEffect(() => {
    if (!composerRef.current) return;
    const obs = new ResizeObserver(([e]) => setComposerH(e.contentRect.height + 1));
    obs.observe(composerRef.current);
    return () => obs.disconnect();
  }, [activeConversation]);

  /* ── Scroll tracking ── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    setShowScrollBtn(!atBottom);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
  }, []);

  /* ── Auto-scroll on new messages ── */
  useEffect(() => {
    if (!loadingMsgs && messages.length > 0) {
      requestAnimationFrame(() => scrollToBottom(false));
    }
  }, [loadingMsgs, scrollToBottom]);

  useEffect(() => {
    if (isAtBottom) requestAnimationFrame(() => scrollToBottom(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  /* ── Clear admin typing when conversation changes ── */
  useEffect(() => {
    setAdminTyping(null);
    clearTimeout(typingTimer.current);
    setReplyToId(null);
    setDraft("");
    setShowEmoji(false);
  }, [activeId]);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    el.style.overflowY = el.scrollHeight > 140 ? "auto" : "hidden";
  }, [draft]);

  /* ── Emit typing to admin ── */
  const emitUserTyping = useCallback((val) => {
    if (!activeId) return;
    const typing = val.length > 0;
    if (typing !== isTypingRef.current) {
      isTypingRef.current = typing;
      emitTyping(activeId, typing);
    }
  }, [activeId, emitTyping]);

  /* ── Send ── */
  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    const replyTo = replyToId;
    setDraft("");
    setReplyToId(null);
    setIsAtBottom(true);
    isTypingRef.current = false;
    emitTyping(activeId, false);
    await sendMessage(activeId, text, replyTo);
  }, [draft, activeId, sending, replyToId, sendMessage, emitTyping]);

  /* ── Reactions ── */
  const toggleReaction = useCallback(async (messageId, emoji) => {
    if (!activeId) return;
    try {
      await authFetch(
        `${API_BASE}/messages/conversations/${activeId}/messages/${messageId}/react`,
        { method: "PATCH", body: JSON.stringify({ emoji }) },
      );
      fetchConversations();
    } catch { /* non-fatal */ }
  }, [activeId, fetchConversations]);

  /* ── New conversation ── */
  const handleNewConvCreated = useCallback((conv) => {
    setShowNewChat(false);
    fetchConversations();
    if (conv?.id) openConversation(conv.id);
  }, [fetchConversations, openConversation]);

  /* ── Keyboard ── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        if (showEmoji) { setShowEmoji(false); return; }
        if (replyToId) { setReplyToId(null); return; }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showEmoji, replyToId]);

  /* ── Derived ── */
  const replyMap     = useMemo(() => new Map(messages.map((m) => [String(m.id), m])), [messages]);
  const msgGroups    = useMemo(() => groupMessages(messages), [messages]);
  const replyMsg     = replyToId ? replyMap.get(String(replyToId)) : null;

  const convTitle = useCallback((c) =>
    c?.subject ||
    (c?.bookingNumber ? `Booking ${c.bookingNumber}` : null) ||
    c?.guestName || c?.userFullName || "Conversation",
  []);

  const showMobileChat = !!activeId;

  /* ── Render ── */
  return (
    <>
      <Helmet>
        <title>Messages | Altuvera</title>
      </Helmet>

      {showNewChat && (
        <NewConversationModal
          onClose={() => setShowNewChat(false)}
          onCreated={handleNewConvCreated}
        />
      )}

      <DashboardLayout
        title="Messages"
        subtitle="Chat directly with the Altuvera team about your bookings."
      >
        {error && (
          <div className="mb-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200
                          rounded-xl text-sm text-red-700" role="alert">
            <X size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Two-panel layout */}
        <div
          className="flex flex-col md:grid md:grid-cols-[minmax(260px,300px)_1fr]
                     gap-3 sm:gap-4 overflow-hidden"
          style={{ height: "calc(100dvh - 220px)", minHeight: 500 }}
        >

          {/* ══ SIDEBAR ══ */}
          <aside className={`
            bg-white border border-slate-200 rounded-2xl shadow-sm
            flex flex-col overflow-hidden
            ${showMobileChat ? "hidden md:flex" : "flex"}
          `}>
            {/* Sidebar header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center
                            justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Conversations</h3>
                {unreadCount > 0 && (
                  <span className="bg-emerald-600 text-white rounded-full text-[10px] font-bold
                                   min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                {/* Live indicator */}
                {connected && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={fetchConversations} disabled={loading}
                  aria-label="Refresh"
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                             hover:bg-slate-100 text-slate-400 transition disabled:opacity-40">
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
                <button onClick={() => setShowNewChat(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5
                             bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <Plus size={12} /> New
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto overscroll-contain" role="list">
              {loading && conversations.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b
                                          border-slate-100 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-2.5 w-2/3 bg-slate-200 rounded" />
                        <div className="h-2 w-1/5 bg-slate-200 rounded" />
                      </div>
                      <div className="h-2 w-4/5 bg-slate-200 rounded" />
                      <div className="h-2 w-1/3 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="py-14 text-center text-slate-400 px-6 space-y-3">
                  <MessageSquare size={36} className="mx-auto opacity-20" />
                  <p className="text-sm font-semibold text-slate-500">No conversations yet</p>
                  <p className="text-xs text-slate-400">
                    Book a safari and we'll start a conversation, or reach out to us directly.
                  </p>
                  <button onClick={() => setShowNewChat(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2
                               bg-emerald-50 text-emerald-700 border border-emerald-200
                               rounded-xl hover:bg-emerald-100 transition">
                    <Plus size={13} /> Message us
                  </button>
                </div>
              ) : (
                conversations.map((c) => (
                  <div role="listitem" key={c.id}>
                    <ConversationRow
                      conv={c}
                      active={c.id === activeId}
                      onSelect={openConversation}
                    />
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* ══ CHAT PANEL ══ */}
          <main className={`
            bg-white border border-slate-200 rounded-2xl shadow-sm
            flex flex-col overflow-hidden relative
            ${showMobileChat ? "flex" : "hidden md:flex"}
          `}>

            {!activeConversation ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-emerald-300" />
                </div>
                <p className="font-semibold text-slate-500 text-sm">No conversation selected</p>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  Pick one from the list, or start a new one.
                </p>
                <button onClick={() => setShowNewChat(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white
                             text-sm font-bold rounded-xl hover:bg-emerald-700 transition">
                  <Plus size={15} /> New Conversation
                </button>
              </div>
            ) : (
              <>
                {/* ── Chat Header (fixed) ── */}
                <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3
                                border-b border-slate-100 bg-white z-10 shadow-sm">
                  <button onClick={() => openConversation(null)}
                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition"
                    aria-label="Back to conversations">
                    <ArrowLeft size={18} className="text-slate-600" />
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700
                                  flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate leading-tight">
                      {convTitle(activeConversation)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[11px] text-slate-400 truncate">
                        Altuvera Support Team
                        {activeConversation.bookingNumber &&
                          ` · Booking ${activeConversation.bookingNumber}`}
                      </p>
                      {adminTyping && (
                        <span className="text-[10px] text-emerald-600 font-semibold animate-pulse flex-shrink-0">
                          typing…
                        </span>
                      )}
                    </div>
                  </div>

                  <StatusPill status={activeConversation.status || "open"} />
                </div>

                {/* ── Messages (scrollable) ── */}
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
                  style={{ paddingBottom: `${composerH + 8}px` }}
                  role="log"
                  aria-live="polite"
                  aria-label="Messages"
                >
                  {loadingMsgs && messages.length === 0 ? (
                    <div className="flex flex-col gap-3 pt-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}
                             className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} animate-pulse`}>
                          <div className={`rounded-2xl px-4 py-3 ${i % 2 === 0
                            ? "bg-slate-200 w-48 sm:w-64"
                            : "bg-emerald-200/60 w-36 sm:w-52"}`}
                            style={{ height: 38 + (i * 6) }} />
                        </div>
                      ))}
                    </div>
                  ) : msgGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                      <MessageSquare size={32} className="text-slate-200 mb-3" />
                      <p className="text-sm text-slate-400">No messages yet — say hello! 👋</p>
                    </div>
                  ) : (
                    <>
                      {msgGroups.map((item) =>
                        item.type === "sep" ? (
                          <DateSep key={item.key} label={item.label} />
                        ) : (
                          <MessageBubble
                            key={item.key}
                            message={item.data}
                            mine={item.data.senderType !== "admin"}
                            replyTo={item.data.replyToId ? replyMap.get(String(item.data.replyToId)) : null}
                            onReact={toggleReaction}
                            onReply={setReplyToId}
                          />
                        )
                      )}

                      {/* Admin typing indicator */}
                      {adminTyping && String(adminTyping.convId) === String(activeId) && (
                        <TypingIndicator name={adminTyping.name} />
                      )}
                    </>
                  )}
                </div>

                {/* Scroll-to-bottom */}
                <ScrollBtn visible={showScrollBtn} onClick={() => scrollToBottom(true)} />

                {/* ── Composer (absolute, fixed at bottom) ── */}
                <div
                  ref={composerRef}
                  className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100
                             z-10 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.06)]"
                >
                  {/* Closed banner */}
                  {activeConversation.status === "closed" && (
                    <div className="mx-3 mt-2.5 px-3 py-2 bg-slate-50 border border-slate-200
                                    rounded-xl text-xs text-slate-500 text-center">
                      This conversation is closed. Sending a message will reopen it.
                    </div>
                  )}

                  {/* Reply preview */}
                  {replyMsg && (
                    <div className="flex items-center gap-2 mx-3 mt-2.5 px-3 py-2
                                    bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CornerUpLeft size={13} className="text-emerald-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          {replyMsg.senderType === "admin" ? "Altuvera" : (replyMsg.senderName || "You")}
                        </span>
                        <span className="text-xs text-emerald-600 truncate block">
                          {(replyMsg.body || "").slice(0, 80)}
                        </span>
                      </div>
                      <button onClick={() => setReplyToId(null)} aria-label="Cancel reply"
                        className="text-emerald-400 hover:text-emerald-600 p-0.5 rounded transition">
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Input row */}
                  <div className="flex items-end gap-2 px-3 py-3">
                    {/* Emoji */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowEmoji((p) => !p)}
                        aria-label="Open emoji picker"
                        aria-expanded={showEmoji}
                        className={`
                          w-9 h-9 rounded-xl border transition flex items-center justify-center
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                          ${showEmoji
                            ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                          }
                        `}
                      >
                        <Smile size={18} />
                      </button>
                      {showEmoji && (
                        <EmojiPicker
                          onPick={(emoji) => {
                            setDraft((p) => p + emoji);
                            setShowEmoji(false);
                            textareaRef.current?.focus();
                          }}
                          onClose={() => setShowEmoji(false)}
                        />
                      )}
                    </div>

                    {/* Textarea */}
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={(e) => {
                        setDraft(e.target.value);
                        emitUserTyping(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submit();
                        }
                      }}
                      onBlur={() => {
                        isTypingRef.current = false;
                        emitTyping(activeId, false);
                      }}
                      rows={1}
                      placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
                      aria-label="Message input"
                      className="flex-1 resize-none text-sm px-3.5 py-2.5 rounded-xl border
                                 border-slate-200 bg-slate-50 outline-none leading-relaxed
                                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                                 focus:bg-white transition placeholder:text-slate-400"
                      style={{ minHeight: 40, maxHeight: 140 }}
                    />

                    {/* Send */}
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
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {sending
                        ? <RefreshCw size={15} className="animate-spin" />
                        : <Send size={15} />
                      }
                      <span className="hidden sm:inline">{sending ? "Sending" : "Send"}</span>
                    </button>
                  </div>

                  {/* Hint */}
                  <p className="text-center text-[10px] text-slate-300 pb-2 -mt-1 select-none">
                    Enter ↵ send · Shift+Enter newline · Esc cancel reply
                  </p>
                </div>
              </>
            )}
          </main>
        </div>
      </DashboardLayout>
    </>
  );
}