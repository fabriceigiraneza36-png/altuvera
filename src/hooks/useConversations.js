// src/hooks/useConversations.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useUserAuth } from "../context/UserAuthContext";

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────*/
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const TOKEN_KEY = "altuvera_auth_token";
const MAX_FAILS = 3;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────*/
const getToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
};

const authFetch = (url, opts = {}) => {
  const token = getToken();
  return fetch(url, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
};

/**
 * Lightweight messaging hook for the user dashboard.
 * Lists the current user's conversations, lets them open one and
 * send messages, and keeps it live via Socket.io (`msg:message`,
 * `msg:new-from-user`, `msg:conversation-updated`, `msg:read`).
 */
export function useConversations() {
  const { user, isAuthenticated } = useUserAuth();

  const [conversations, setConversations] = useState([]);
  const [activeId,      setActiveId]      = useState(null);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [error,         setError]         = useState(null);

  const failsRef   = useRef(0);
  const mountedRef = useRef(true);
  const socketRef = useRef(null);

  /* ── List conversations ── */
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || failsRef.current >= MAX_FAILS) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/messages/conversations`);
      if (res.status === 401 || res.status === 403) {
        failsRef.current = MAX_FAILS;
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!mountedRef.current) return;
      failsRef.current = 0;
      setConversations(data.data || []);
      setUnreadCount(
        (data.data || []).reduce((s, c) => s + (c.unreadUser || 0), 0),
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        failsRef.current += 1;
        if (mountedRef.current) setError(err.message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated]);

  /* ── Open a conversation + load its messages ── */
  const openConversation = useCallback(async (id) => {
    if (!id) return;
    setActiveId(id);
    setLoadingMsgs(true);
    try {
      const res = await authFetch(`${API_BASE}/messages/conversations/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) {
        setActiveConv(data.data);
        setMessages(data.data.messages || []);
      }
      markRead(id).catch(() => {});
    } catch (err) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setLoadingMsgs(false);
    }
  }, []);

  /* ── Send a message ── */
  const sendMessage = useCallback(async (id, body, replyToId = null) => {
    const text = (body || "").trim();
    if (!id || !text) return;
    setSending(true);
    const optimistic = {
      id: `tmp-${Date.now()}`, conversationId: id, senderType: "user",
      body: text, isRead: false, reactions: {}, replyToId, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await authFetch(
        `${API_BASE}/messages/conversations/${id}/messages`,
        { method: "POST", body: JSON.stringify({ body: text, ...(replyToId ? { replyToId } : {}) }) },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? data.data : m)),
        );
      }
      fetchConversations().catch(() => {});
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
    } finally {
      if (mountedRef.current) setSending(false);
    }
  }, [fetchConversations]);

  /* ── Mark read ── */
  const markRead = useCallback(async (id) => {
    try {
      await authFetch(`${API_BASE}/messages/conversations/${id}/read`, {
        method: "PATCH",
      });
    } catch { /* silent */ }
  }, []);

  /* ── Fetch a conversation linked to a booking number ── */
  const findBookingConversation = useCallback(async (bookingNumber) => {
    if (!bookingNumber) return null;
    try {
      const res = await authFetch(
        `${API_BASE}/messages/conversations/by-booking/${encodeURIComponent(bookingNumber)}`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  }, []);

  /* ── Socket wiring ── */
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    import("../utils/socket")
      .then(({ connectSocket }) => {
        if (cancelled) return;
        const socket = connectSocket();
        socketRef.current = socket;

        const onMessage = (msg) => {
          if (!mountedRef.current) return;
          if (msg.conversationId === activeId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          } else {
            // Refresh conversations list so unread badge updates
            fetchConversations().catch(() => {});
          }
        };
        const onUpdated = (conv) => {
          if (!mountedRef.current) return;
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, ...conv } : c)),
          );
          if (conv.id === activeId) setActiveConv((p) => (p ? { ...p, ...conv } : p));
        };
        const onRead = ({ conversationId }) => {
          if (!mountedRef.current) return;
          const isActive = conversationId === activeId;
          if (isActive) {
            setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
          }
        };
        const onReaction = ({ messageId, reactions }) => {
          if (!mountedRef.current) return;
          setMessages((prev) =>
            prev.map((m) => (String(m.id) === String(messageId) ? { ...m, reactions: reactions || {} } : m)),
          );
        };

        socket.on("msg:message", onMessage);
        socket.on("msg:conversation-updated", onUpdated);
        socket.on("msg:read", onRead);
        socket.on("msg:reaction", onReaction);

        return () => {
          socket.off("msg:message", onMessage);
          socket.off("msg:conversation-updated", onUpdated);
          socket.off("msg:read", onRead);
          socket.off("msg:reaction", onReaction);
        };
      })
      .catch(() => { /* socket unavailable — polling covers it */ });

    return () => { cancelled = true; };
  }, [isAuthenticated, activeId, fetchConversations]);

  /* ── Lifecycle ── */
  useEffect(() => {
    mountedRef.current = true;
    failsRef.current = 0;
    if (isAuthenticated) fetchConversations();
    return () => {
      mountedRef.current = false;
    };
  }, [isAuthenticated, fetchConversations]);

  const activeConversation = useMemo(
    () => activeConv || conversations.find((c) => c.id === activeId) || null,
    [activeConv, conversations, activeId],
  );

  return {
    conversations,
    activeId,
    activeConversation,
    messages,
    unreadCount,
    loading,
    loadingMsgs,
    sending,        error,
    fetchConversations,
    openConversation,
    sendMessage,
    markRead,
    findBookingConversation,
    setActiveId,
  };
}

export default useConversations;
