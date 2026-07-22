// src/pages/auth/Messages.jsx
import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import { Helmet } from "react-helmet-async";
import {
  MessageSquare, Send, Smile, X, CornerUpLeft,
  Check, CheckCheck, RefreshCw, ArrowLeft, Plus,
  ChevronRight,
} from "lucide-react";
import DashboardLayout   from "../../components/auth/DashboardLayout";
import { useConversations } from "../../hooks/useConversations";

/* ─── Formatting ────────────────────────────────────────────────────────────── */

const fmtTimeShort = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

const fmtTimeRelative = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const now  = new Date();
  const diff = now - date;
  if (diff < 60_000)    return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const QUICK_EMOJIS         = ["👍", "❤️", "😂", "🎉", "👏", "😮", "🙏", "🔥"];
const INLINE_REACT_EMOJIS  = ["👍", "❤️", "😂", "🎉"];

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://backend-jd8f.onrender.com/api";

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
      Authorization: `Bearer ${getToken()}`,
      ...opts.headers,
    },
  });

/* ─── Avatar initials ─────────────────────────────────────────────────────── */

function Avatar({ name = "", src, size = "w-9 h-9", textSize = "text-sm" }) {
  const initials = name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  if (src) {
    return (
      <img
        src={src}
        alt={name}
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

/* ─── Status pill ────────────────────────────────────────────────────────────── */

function StatusPill({ status }) {
  const styles = {
    open:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed:  "bg-slate-100 text-slate-500 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const dots = {
    open:    "bg-emerald-500",
    closed:  "bg-slate-400",
    pending: "bg-amber-500",
  };
  const cls   = styles[status] || styles.pending;
  const dotCl = dots[status]   || dots.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5
                      rounded-full border capitalize ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotCl}`} />
      {status}
    </span>
  );
}

/* ─── Emoji Picker ───────────────────────────────────────────────────────────── */

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
                 rounded-2xl shadow-xl p-2 grid grid-cols-4 gap-1 w-40"
    >
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onPick(emoji)}
          className="text-xl p-1.5 rounded-lg hover:bg-slate-100 transition leading-none"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

/* ─── Conversation Row ───────────────────────────────────────────────────────── */

const ConversationRow = React.memo(function ConversationRow({ conv, active, onSelect }) {
  const title    = conv.subject ||
    (conv.bookingNumber ? `Booking ${conv.bookingNumber}` : conv.guestName || "Conversation");
  const subtitle = conv.lastMessage || "No messages yet";

  return (
    <button
      onClick={() => onSelect(conv.id)}
      className={`
        w-full text-left px-4 py-3.5 border-b border-slate-100 transition-all
        hover:bg-slate-50 group
        ${active
          ? "bg-emerald-50/80 border-l-[3px] border-l-emerald-600"
          : "border-l-[3px] border-l-transparent"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200
                        flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare size={16} className="text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-slate-800 truncate flex-1">
              {title}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {conv.unreadUser > 0 && (
                <span className="bg-red-500 text-white rounded-full text-[10px] font-bold
                                 min-w-[18px] h-[18px] px-1 grid place-items-center">
                  {conv.unreadUser > 9 ? "9+" : conv.unreadUser}
                </span>
              )}
              <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:block">
                {fmtTimeRelative(conv.lastMessageAt)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>

          <div className="flex items-center gap-1.5 mt-1">
            <StatusPill status={conv.status || "open"} />
            {conv.bookingNumber && (
              <span className="text-[10px] text-slate-400">· {conv.bookingNumber}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
});

/* ─── Message Bubble ─────────────────────────────────────────────────────────── */

const MessageBubble = React.memo(function MessageBubble({
  message, mine, replyTo, onReact, onReply,
}) {
  const reactions = useMemo(() => {
    const r       = message.reactions || {};
    const entries = Object.entries(r).filter(([, ids]) => ids?.length > 0);
    return entries.length ? entries : null;
  }, [message.reactions]);

  const isOptimistic = String(message.id).startsWith("tmp-");

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-2`}>
      {/* Admin avatar */}
      {!mine && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800
                        text-white text-xs font-bold flex items-center justify-center
                        flex-shrink-0 mr-2 mt-1">
          A
        </div>
      )}

      <div className="max-w-[80%] sm:max-w-[68%] group">
        {/* Reply reference */}
        {replyTo && (
          <div className={`text-[11px] mb-1 px-2 border-l-2 italic truncate text-slate-400 border-slate-300
                          ${mine ? "text-right border-l-0 border-r-2 pr-2 pl-0" : ""}`}>
            ↩ {replyTo.senderName || (replyTo.senderType === "admin" ? "Altuvera" : "You")}:{" "}
            {(replyTo.body || "").slice(0, 55)}{(replyTo.body || "").length > 55 ? "…" : ""}
          </div>
        )}

        {/* Bubble */}
        <div className={`
          inline-block px-4 py-2.5 text-sm leading-relaxed
          whitespace-pre-wrap break-words rounded-2xl max-w-full
          ${mine
            ? "bg-emerald-600 text-white rounded-br-md shadow-sm shadow-emerald-200"
            : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-md"
          }
          ${isOptimistic ? "opacity-70" : ""}
        `}>
          {!mine && (
            <p className="text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">
              Altuvera Team
            </p>
          )}
          {message.body}
        </div>

        {/* Meta */}
        <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400
                        ${mine ? "justify-end" : "justify-start"}`}>
          <span>{mine ? "You" : (message.senderName || "Altuvera")}</span>
          <span>·</span>
          <span>{fmtTimeShort(message.createdAt)}</span>
          {mine && (
            isOptimistic
              ? <span className="text-slate-300">Sending…</span>
              : message.isRead
                ? <CheckCheck size={12} className="text-emerald-500" />
                : <Check size={12} />
          )}
        </div>

        {/* Reactions */}
        {reactions && (
          <div className={`flex flex-wrap gap-1 mt-1 ${mine ? "justify-end" : ""}`}>
            {reactions.map(([emoji, ids]) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className="bg-white border border-slate-200 rounded-full px-2 py-0.5
                           text-xs hover:bg-slate-50 transition shadow-sm"
              >
                {emoji} {ids.length}
              </button>
            ))}
          </div>
        )}

        {/* Inline actions — visible on hover */}
        <div className={`flex items-center gap-0.5 mt-1
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        ${mine ? "justify-end" : ""}`}>
          {INLINE_REACT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onMouseDown={(e) => { e.preventDefault(); onReact(message.id, emoji); }}
              className="text-sm p-1 rounded-lg hover:bg-slate-100 transition"
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            onMouseDown={(e) => { e.preventDefault(); onReply(message.id); }}
            className="text-[11px] text-slate-400 hover:text-slate-700 px-1.5 py-1
                       rounded-lg hover:bg-slate-100 transition inline-flex items-center gap-0.5"
          >
            <CornerUpLeft size={11} /> Reply
          </button>
        </div>
      </div>
    </div>
  );
});

/* ─── New Conversation Modal ─────────────────────────────────────────────────── */

function NewConversationModal({ onClose, onCreated }) {
  const [subject,  setSubject]  = useState("");
  const [body,     setBody]     = useState("");
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState("");

  const handleCreate = async () => {
    if (!body.trim()) { setError("Please enter a message."); return; }
    setError(""); setCreating(true);
    try {
      const res = await authFetch(`${API_BASE}/messages/conversations`, {
        method: "POST",
        body: JSON.stringify({
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl
                      shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-emerald-600" />
            <h3 className="font-bold text-slate-800">New Message</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       hover:bg-slate-100 text-slate-500 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <MessageSquare size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-700 leading-relaxed">
              Send a message to the <strong>Altuvera support team</strong>.
              We typically reply within a few hours.
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Question about my safari booking"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                         outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition placeholder:text-slate-400"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Hi! I'd like to ask about…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                         outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                         transition resize-none placeholder:text-slate-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600
                       border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !body.trim()}
            className="px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl
                       hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed
                       transition flex items-center gap-2"
          >
            {creating ? (
              <><RefreshCw size={14} className="animate-spin" /> Sending…</>
            ) : (
              <><Send size={14} /> Send Message</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */

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
  } = useConversations();

  const [draft,        setDraft]        = useState("");
  const [replyToId,    setReplyToId]    = useState(null);
  const [showEmoji,    setShowEmoji]    = useState(false);
  const [showNewChat,  setShowNewChat]  = useState(false);

  const scrollRef   = useRef(null);
  const textareaRef = useRef(null);

  /* ── Auto-scroll ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ── Reset reply on conversation change ──────────────────────────────── */
  useEffect(() => {
    setReplyToId(null);
    setDraft("");
    setShowEmoji(false);
  }, [activeId]);

  /* ── Send ────────────────────────────────────────────────────────────── */
  const submit = useCallback(async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    const replyTo = replyToId;
    setDraft("");
    setReplyToId(null);
    await sendMessage(activeId, text, replyTo);
  }, [draft, activeId, sending, replyToId, sendMessage]);

  /* ── Reactions ───────────────────────────────────────────────────────── */
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

  /* ── New conversation created ─────────────────────────────────────────── */
  const handleNewConvCreated = useCallback((conv) => {
    setShowNewChat(false);
    fetchConversations();
    if (conv?.id) openConversation(conv.id);
  }, [fetchConversations, openConversation]);

  /* ── Derived ─────────────────────────────────────────────────────────── */
  const replyMap = useMemo(
    () => new Map(messages.map((m) => [String(m.id), m])),
    [messages],
  );

  const convTitle = useCallback((c) =>
    c?.subject ||
    (c?.bookingNumber ? `Booking ${c.bookingNumber}` : c?.guestName || c?.userFullName) ||
    "Conversation",
  []);

  const showMobileChat = !!activeId;

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Messages | Altuvera</title>
      </Helmet>

      {/* New conversation modal */}
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
        {/* Error banner */}
        {error && (
          <div className="mb-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200
                          rounded-xl text-sm text-red-700">
            <X size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Two-panel layout */}
        <div className="grid md:grid-cols-[minmax(260px,320px)_1fr] gap-3 sm:gap-4"
             style={{ height: "calc(100vh - 280px)", minHeight: 480 }}>

          {/* ══ CONVERSATION LIST ══ */}
          <div className={`
            bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden
            ${showMobileChat ? "hidden md:flex" : "flex"}
          `}>
            {/* List header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center
                            justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Conversations</h3>
                {unreadCount > 0 && (
                  <span className="bg-emerald-600 text-white rounded-full text-[10px] font-bold
                                   min-w-[20px] h-5 px-1.5 grid place-items-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={fetchConversations}
                  disabled={loading}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                             hover:bg-slate-100 text-slate-400 transition"
                  title="Refresh"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5
                             bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  <Plus size={12} /> New
                </button>
              </div>
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <RefreshCw size={24} className="mx-auto mb-2 animate-spin opacity-40" />
                  Loading…
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 px-4 space-y-3">
                  <MessageSquare size={36} className="mx-auto opacity-20" />
                  <p className="text-sm font-medium text-slate-500">No conversations yet</p>
                  <p className="text-xs text-slate-400">
                    Book a safari and we'll start a conversation, or reach out to us directly.
                  </p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2
                               bg-emerald-50 text-emerald-700 border border-emerald-200
                               rounded-xl hover:bg-emerald-100 transition"
                  >
                    <Plus size={13} /> Message us
                  </button>
                </div>
              ) : (
                conversations.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conv={c}
                    active={c.id === activeId}
                    onSelect={openConversation}
                  />
                ))
              )}
            </div>
          </div>

          {/* ══ CHAT PANEL ══ */}
          <div className={`
            bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden
            ${showMobileChat ? "flex" : "hidden md:flex"}
          `}>
            {!activeConversation ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center
                              p-8 text-slate-400 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <MessageSquare size={32} className="text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-slate-500 text-sm">No conversation selected</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Pick one from the list, or start a new one.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white
                             text-sm font-bold rounded-xl hover:bg-emerald-700 transition"
                >
                  <Plus size={15} /> New Conversation
                </button>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3
                                flex-shrink-0 bg-white">
                  {/* Back — mobile */}
                  <button
                    onClick={() => openConversation(null)}
                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={18} className="text-slate-600" />
                  </button>

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700
                                  flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">
                      {convTitle(activeConversation)}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Altuvera Support Team
                      {activeConversation.bookingNumber &&
                        ` · Booking ${activeConversation.bookingNumber}`}
                    </p>
                  </div>

                  <StatusPill status={activeConversation.status || "open"} />
                </div>

                {/* Messages area */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/50 space-y-1
                             scrollbar-thin scrollbar-thumb-slate-200"
                >
                  {loadingMsgs && messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-12">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin opacity-40" />
                      Loading messages…
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-12 space-y-2">
                      <MessageSquare size={32} className="mx-auto opacity-20" />
                      <p className="text-sm">No messages yet — say hello! 👋</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        message={m}
                        mine={m.senderType !== "admin"}
                        replyTo={m.replyToId ? replyMap.get(String(m.replyToId)) : null}
                        onReact={toggleReaction}
                        onReply={setReplyToId}
                      />
                    ))
                  )}
                </div>

                {/* Composer */}
                <div className="border-t border-slate-100 px-3 py-3 flex-shrink-0 bg-white">
                  {/* Reply preview */}
                  {replyToId && (() => {
                    const r = replyMap.get(String(replyToId));
                    return (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200
                                      rounded-xl px-3 py-2 mb-2">
                        <CornerUpLeft size={13} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-emerald-700 flex-1 truncate">
                          {r?.senderType === "admin" ? "Altuvera" : (r?.senderName || "You")}
                          {": "}
                          {(r?.body || "").slice(0, 60)}
                        </span>
                        <button
                          onClick={() => setReplyToId(null)}
                          className="text-emerald-400 hover:text-emerald-600"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })()}

                  {/* Closed banner */}
                  {activeConversation.status === "closed" && (
                    <div className="mb-2 px-3 py-2 bg-slate-50 border border-slate-200
                                    rounded-xl text-xs text-slate-500 text-center">
                      This conversation is closed. Sending a message will reopen it.
                    </div>
                  )}

                  <div className="flex items-end gap-2 relative">
                    {/* Emoji */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setShowEmoji((p) => !p)}
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-white
                                   hover:bg-slate-50 text-slate-500 transition
                                   flex items-center justify-center text-lg"
                        aria-label="Emoji"
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
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submit();
                        }
                      }}
                      rows={1}
                      placeholder="Type your message… (Enter to send)"
                      className="flex-1 resize-none text-sm px-3.5 py-2.5 rounded-xl border
                                 border-slate-200 bg-slate-50 outline-none max-h-32
                                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                                 focus:bg-white transition placeholder:text-slate-400"
                    />

                    {/* Send button */}
                    <button
                      onClick={submit}
                      disabled={!draft.trim() || sending}
                      className="h-10 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm
                                 flex items-center gap-1.5 flex-shrink-0
                                 hover:bg-emerald-700 transition shadow-sm shadow-emerald-200
                                 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      <Send size={15} />
                      <span className="hidden sm:inline">
                        {sending ? "Sending…" : "Send"}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}