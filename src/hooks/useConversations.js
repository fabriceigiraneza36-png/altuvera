// src/hooks/useConversations.js
import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://backend-jd8f.onrender.com/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE.replace(/\/api\/?$/, "");

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
  const [sending,            setSaving]             = useState(false);
  const [error,              setError]              = useState("");

  const pollRef = useRef(null);
  const socketRef = useRef(null);
  const activeIdRef = useRef(null);
  const typingTimerCache = useRef({});
  const [adminTyping, setAdminTyping] = useState(null);
  const [typingConvs, setTypingConvs] = useState(new Set());
  const [connected, setConnected] = useState(false);

  useEffect(() => { activeIdRef.current = activeId }, [activeId]);

  /* ── Socket connection ── */
  useEffect(() => {
    const token = getToken();
    const s = io(SOCKET_URL, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 6,
      reconnectionDelay: 1_000,
    });
    socketRef.current = s;

    s.on("connect", () => {
      setConnected(true);
      if (import.meta.env.DEV) console.info("[Socket] Connected:", s.id);
    });

    s.on("disconnect", () => setConnected(false));

    s.on("msg:message", (msg) => {
      if (!msg) return;
      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
        const cid = String(msg.conversationId);
        if (cid !== String(activeIdRef.current)) return prev;
        const optimisticIndex = prev.findIndex(
          (m) => String(m.id).startsWith("tmp-") && m.senderType === msg.senderType && m.body === msg.body,
        );
        if (optimisticIndex >= 0) {
          const next = [...prev];
          next[optimisticIndex] = msg;
          return next;
        }
        return [...prev, msg];
      });
      setConversations((prev) =>
        prev.map((c) =>
          String(c.id) === String(msg.conversationId)
            ? {
                ...c,
                lastMessage: msg.body?.slice(0, 120) || c.lastMessage,
                lastMessageAt: msg.createdAt || c.lastMessageAt,
                unreadAdmin:
                  String(msg.conversationId) !== String(activeIdRef.current)
                    ? (c.unreadAdmin || 0) + 1
                    : c.unreadAdmin,
              }
            : c
        )
      );
    });

    s.on("msg:typing", (payload) => {
      if (!payload) return;
      const cid = String(payload.conversationId);
      if (payload.isTyping) {
        setTypingConvs((prev) => { const s = new Set(prev); s.add(cid); return s; });
        if (cid === String(activeIdRef.current))
          setAdminTyping({ name: payload.senderName || "Altuvera" });
        clearTimeout(typingTimerCache.current[cid]);
        typingTimerCache.current[cid] = setTimeout(() => {
          setTypingConvs((prev) => { const s = new Set(prev); s.delete(cid); return s; });
          setAdminTyping((p) => (p && cid === String(activeIdRef.current) ? null : p));
        }, 4000);
      } else {
        clearTimeout(typingTimerCache.current[cid]);
        setTypingConvs((prev) => { const s = new Set(prev); s.delete(cid); return s; });
        if (cid === String(activeIdRef.current)) setAdminTyping(null);
      }
    });

    s.on("msg:conversation-updated", (conv) => {
      if (!conv) return;
      setConversations((prev) =>
        prev.map((c) => (String(c.id) === String(conv.id) ? { ...c, ...conv } : c))
      );
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const emitTyping = useCallback(
    (conversationId, isTyping) => {
      const s = socketRef.current;
      if (!s || !s.connected) return;
      s.emit("msg:typing", {
        conversationId,
        isTyping,
        senderName: "You",
      });
    },
    []
  );

  /* ── Derived: total unread for user ───────────────────────────── */
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

  /* Polling: refresh every 15 s when tab is visible  */
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

  /* ── Open a conversation ─────────────────────────────────── */
  const openConversation = useCallback(async (id) => {
    if (id === null) {
      setActiveId(null);
      setActiveConversation(null);
      setMessages([]);
      setAdminTyping(null);
      setTypingConvs(new Set());
      return;
    }

    setActiveId(id);
    setLoadingMsgs(true);
    setError("");
    setAdminTyping(null);
    setTypingConvs(new Set());

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

  useEffect(() => {
    const s = socketRef.current;
    if (s?.connected && activeId) {
      s.emit("msg:client-join", { conversationId: activeId });
    }
  }, [activeId, connected]);

  /* ── Send message ────────────────────────────────────────── */
  const sendMessage = useCallback(
    async (conversationId, body, replyToId = null) => {
      if (!body?.trim() || !conversationId) return;

      setSaving(true);

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
        const s = socketRef.current;
        let saved;
        if (s?.connected) {
          const ack = await new Promise((resolve) => {
            s.emit("msg:send", {
              conversationId,
              body: body.trim(),
              ...(replyToId ? { replyToId } : {}),
            }, resolve);
          });
          if (!ack?.success || !ack.message) throw new Error(ack?.error || "Failed to send message.");
          saved = normMsg(ack.message);
        } else {
          const res = await authFetch(
            `${API_BASE}/messages/conversations/${conversationId}/messages`,
            {
              method: "POST",
              body: JSON.stringify({ body: body.trim(), ...(replyToId ? { replyToId } : {}) }),
            },
          );
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Failed to send message.");
          }
          const data = await res.json();
          saved = normMsg(data.data);
        }

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
        setSaving(false);
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
    adminTyping,
    typingConvs,
    emitTyping,
    socketRef,
    connected,
  };
}
