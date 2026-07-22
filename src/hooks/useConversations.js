// src/hooks/useConversations.js
import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://backend-jd8f.onrender.com/api";

const TOKEN_KEYS = [
  "altuvera_auth_token",
  "auth_token",
  "token",
];

const getToken = () => {
  try {
    for (const k of TOKEN_KEYS) {
      const v =
        localStorage.getItem(k) || sessionStorage.getItem(k);
      if (v) return v;
    }
  } catch { /* ignore */ }
  return "";
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

/* ─── Serialise snake_case → camelCase ──────────────────────────────── */
const normConv = (c) => ({
  id:             c.id,
  sessionId:      c.session_id      || c.sessionId,
  userId:         c.user_id         || c.userId,
  guestName:      c.guest_name      || c.guestName,
  guestEmail:     c.guest_email     || c.guestEmail,
  userFullName:   c.user_full_name  || c.userFullName,
  subject:        c.subject,
  status:         c.status          || "open",
  priority:       c.priority        || "normal",
  bookingNumber:  c.booking_number  || c.bookingNumber,
  lastMessage:    c.last_message    || c.lastMessage,
  lastMessageAt:  c.last_message_at || c.lastMessageAt,
  unreadUser:     parseInt(c.unread_user || c.unreadUser || 0, 10),
  unreadAdmin:    parseInt(c.unread_admin || c.unreadAdmin || 0, 10),
  createdAt:      c.created_at      || c.createdAt,
  updatedAt:      c.updated_at      || c.updatedAt,
});

const normMsg = (m) => ({
  id:             m.id,
  conversationId: m.conversation_id || m.conversationId,
  senderType:     m.sender_type     || m.senderType,
  senderId:       m.sender_id       || m.senderId,
  senderName:     m.sender_name     || m.senderName,
  senderEmail:    m.sender_email    || m.senderEmail,
  senderAvatar:   m.sender_avatar   || m.senderAvatar,
  body:           m.body,
  isRead:         m.is_read         ?? m.isRead ?? false,
  readAt:         m.read_at         || m.readAt,
  replyToId:      m.reply_to_id     || m.replyToId,
  reactions:      typeof m.reactions === "string"
                    ? (() => { try { return JSON.parse(m.reactions); } catch { return {}; } })()
                    : (m.reactions || {}),
  metadata:       m.metadata || {},
  createdAt:      m.created_at || m.createdAt,
  updatedAt:      m.updated_at || m.updatedAt,
});

/* ═══════════════════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════════════════ */
export function useConversations() {
  const [conversations,      setConversations]      = useState([]);
  const [messages,           setMessages]           = useState([]);
  const [activeId,           setActiveId]           = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading,            setLoading]            = useState(false);
  const [loadingMsgs,        setLoadingMsgs]        = useState(false);
  const [sending,            setSending]            = useState(false);
  const [error,              setError]              = useState("");

  const pollRef = useRef(null);

  /* ── Derived: total unread for user ──────────────────────────────── */
  const unreadCount = conversations.reduce(
    (sum, c) => sum + (c.unreadUser || 0),
    0,
  );

  /* ── Fetch conversation list ─────────────────────────────────────── */
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(
        `${API_BASE}/messages/conversations?limit=100`,
      );
      if (res.status === 401) {
        setError("Please log in to view messages.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }
      const data = await res.json();
      setConversations((data.data || []).map(normConv));
    } catch (err) {
      setError(err.message || "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial load */
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* Polling: refresh every 15 s when tab is visible */
  useEffect(() => {
    const start = () => {
      pollRef.current = setInterval(() => {
        if (!document.hidden) fetchConversations();
      }, 15_000);
    };
    const stop = () => clearInterval(pollRef.current);

    start();
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stop() : start();
    });
    return () => {
      stop();
      document.removeEventListener("visibilitychange", () => {});
    };
  }, [fetchConversations]);

  /* ── Open a conversation ─────────────────────────────────────────── */
  const openConversation = useCallback(async (id) => {
    if (id === null) {
      setActiveId(null);
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    setActiveId(id);
    setLoadingMsgs(true);
    setError("");

    try {
      const res = await authFetch(
        `${API_BASE}/messages/conversations/${id}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }
      const data = await res.json();
      const conv = normConv(data.data);
      setActiveConversation(conv);
      setMessages((data.data?.messages || []).map(normMsg));

      // Mark as read
      authFetch(`${API_BASE}/messages/conversations/${id}/read`, {
        method: "PATCH",
      }).catch(() => {});

      // Reset unread in local list
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadUser: 0 } : c)),
      );
    } catch (err) {
      setError(err.message || "Failed to open conversation.");
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  /* ── Send message ────────────────────────────────────────────────── */
  const sendMessage = useCallback(
    async (conversationId, body, replyToId = null) => {
      if (!body?.trim() || !conversationId) return;

      setSending(true);

      /* Optimistic insert */
      const optimistic = {
        id:             `tmp-${Date.now()}`,
        conversationId,
        senderType:     "user",
        senderName:     "You",
        body:           body.trim(),
        isRead:         false,
        reactions:      {},
        replyToId:      replyToId || null,
        createdAt:      new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const res = await authFetch(
          `${API_BASE}/messages/conversations/${conversationId}/messages`,
          {
            method: "POST",
            body: JSON.stringify({
              body: body.trim(),
              ...(replyToId ? { replyToId } : {}),
            }),
          },
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to send message.");
        }

        const data = await res.json();
        const saved = normMsg(data.data);

        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? saved : m)),
        );

        /* Refresh conversation list to update last_message */
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: body.slice(0, 120), lastMessageAt: new Date().toISOString() }
              : c,
          ),
        );
      } catch (err) {
        /* Rollback */
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setError(err.message || "Failed to send message.");
      } finally {
        setSending(false);
      }
    },
    [],
  );

  return {
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
  };
}