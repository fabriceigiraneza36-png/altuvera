// src/hooks/useConversations.js
import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import userDataCache from "../utils/userDataCache";

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

const authFetch = (url, opts = {}) => {
  if (String(opts.method || "GET").toUpperCase() !== "GET") userDataCache.clear();
  return fetch(url, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...opts.headers,
    },
  });
};

/* ─── Serialise snake_case → camelCase ──────────────────────────────── */
const notifyMessage = (title, body, tag, actionUrl = null) => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const show = () => {
      const notification = new Notification(title, {
        body,
        tag,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
      notification.onclick = () => {
        window.focus();
        if (actionUrl) window.location.assign(actionUrl);
        notification.close();
      };
    };
    if (Notification.permission === "granted") {
      show();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") show();
      }).catch(() => {});
    }
  } catch { /* browser notifications are optional; inbox remains the source of truth */ }
};

const getCurrentUserId = () => {
  try {
    const token = getToken();
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).id || null;
  } catch { return null; }
};

const normConv = (c) => ({
  id:             c.id,
  sessionId:      c.session_id      || c.sessionId,
  userId:         c.user_id         || c.userId,
  guestName:      c.guest_name      || c.guestName,
  guestEmail:     c.guest_email     || c.guestEmail,
  userFullName:   c.user_full_name  || c.userFullName,
  subject:        c.subject,
  groupId:        c.group_id ?? c.groupId ?? null,
  groupName:      c.group_name || c.groupName || null,
  createdByAdminId: c.created_by_admin_id ?? c.createdByAdminId ?? null,
  groupCreatedBy: c.group_created_by ?? c.groupCreatedBy ?? null,
  recycleDeadline: c.recycle_deadline ?? c.recycleDeadline ?? null,
  channel:         c.channel || null,
  metadata:        c.metadata || {},
  conversationType: c.conversation_type || c.conversationType || (c.group_id ? "group" : "direct"),
  status:         c.status          || "open",
  priority:       c.priority        || "normal",
  bookingNumber:  c.booking_number  || c.bookingNumber,
  lastMessage:    c.last_message    || c.lastMessage,
  lastMessageAt:  c.last_message_at || c.lastMessageAt,
  lastMessageSenderType: c.last_message_sender_type || c.lastMessageSenderType || null,
  lastMessageSenderId: c.last_message_sender_id ?? c.lastMessageSenderId ?? null,
  lastMessageSenderName: c.last_message_sender_name || c.lastMessageSenderName || null,
  lastMessageSenderUsername: c.last_message_sender_username || c.lastMessageSenderUsername || null,
  lastMessageSenderAvatar: c.last_message_sender_avatar || c.lastMessageSenderAvatar || null,
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
  senderUsername: m.sender_username || m.senderUsername || m.username || null,
  senderEmail:    m.sender_email    || m.senderEmail,
  senderAvatar:   m.sender_avatar || m.senderAvatar || m.sender_avatar_url || m.senderAvatarUrl || m.avatar_url || m.avatarUrl || m.profile_picture_url || m.profilePictureUrl || m.profile_picture || m.profilePicture || m.user_avatar || m.userAvatar || m.avatar || null,
  body:           m.body,
  msgType:        m.msg_type        || m.msgType || "text",
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
  const [loading,            setLoading]            = useState(true);
  const [loadingMsgs,        setLoadingMsgs]        = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const loadingOlderRef = useRef(false);
  const [sending,            setSaving]             = useState(false);
  const [error,              setError]              = useState("");

  const pollRef = useRef(null);
  const socketRef = useRef(null);
  const activeIdRef = useRef(null);
  const openRequestRef = useRef(0);
  const typingTimerCache = useRef({});
  const [adminTyping, setAdminTyping] = useState(null);
  const [typingConvs, setTypingConvs] = useState(new Set());
  const [connected, setConnected] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminPresence, setAdminPresence] = useState({ active: false, activeSince: null, lastSeenAt: null });
  const [recycleWarning, setRecycleWarning] = useState(null);
  const [recycleClock, setRecycleClock] = useState(() => Date.now());

  useEffect(() => { activeIdRef.current = activeId }, [activeId]);

  const recycleWarningSeconds = recycleWarning?.deadlineAt
    ? Math.max(0, Math.ceil((new Date(recycleWarning.deadlineAt).getTime() - recycleClock) / 1000))
    : 0;
  useEffect(() => {
    if (!recycleWarning) return undefined;
    const timer = window.setInterval(() => setRecycleClock(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [recycleWarning]);

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
  const cachedJsonGet = async (url, options = {}) => {
    const cached = userDataCache.get(url);
    if (cached && !options.forceRefresh) {
      void cachedJsonGet(url, { forceRefresh: true }).catch(() => {});
      return cached;
    }
    const pending = userDataCache.getPending(url);
    if (pending) return pending;
    const request = authFetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      userDataCache.set(url, data, 30 * 1000);
      return data;
    }).finally(() => userDataCache.clearPending(url));
    userDataCache.setPending(url, request);
    return request;
  };

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cachedJsonGet(`${API_BASE}/messages/conversations?limit=100&status=all`, { forceRefresh: true });
      if (data?.success === false) throw new Error(data.message || "The server could not load your conversations.");
      const rows = Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.data?.conversations) ? data.data.conversations
        : Array.isArray(data?.data?.rows) ? data.data.rows
        : Array.isArray(data?.data?.items) ? data.data.items
        : Array.isArray(data?.conversations) ? data.conversations
        : Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.results) ? data.results
        : null;
      if (!rows) throw new Error("The inbox response was unexpected. Please refresh to try again.");
      setConversations(rows.map(normConv));
    } catch (err) {
      setError(err.message || "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Socket connection ── */
  useEffect(() => {
    const token = getToken();
    const s = io(SOCKET_URL, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 30_000,
      reconnectionDelay: 1_000,
    });
    socketRef.current = s;

    s.on("connect", () => {
      setConnected(true);
      const currentUserId = getCurrentUserId();
      if (currentUserId) s.emit("join:user", { userId: currentUserId });
      s.emit("msg:inbox-open", { open: true });
      if (import.meta.env.DEV) console.info("[Socket] Connected:", s.id);
    });

    s.on("disconnect", () => {
      setConnected(false);
      setAdminOnline(false);
      setAdminPresence({ active: false, activeSince: null, lastSeenAt: new Date().toISOString() });
    });
    s.on("msg:admin-online", (payload) => setAdminOnline(Boolean(payload?.online)));
    s.on("msg:presence", (payload) => {
      if (String(payload?.conversationId) !== String(activeIdRef.current)) return;
      if (payload.senderType !== "admin") return;
      setAdminPresence({
        active: Boolean(payload.active),
        activeSince: payload.activeSince || null,
        lastSeenAt: payload.lastSeenAt || null,
      });
    });
    s.on("msg:read", (payload) => {
      if (String(payload?.conversationId) !== String(activeIdRef.current)) return;
      if (payload.readBy !== "admin") return;
      const ids = new Set((payload.messageIds || []).map(String));
      setMessages(prev => prev.map(m =>
        ids.has(String(m.id)) || m.senderType === "user"
          ? { ...m, isRead: true, readAt: m.readAt || payload.readAt || new Date().toISOString() }
          : m
      ));
    });

    s.on("msg:message", (msg) => {
      if (!msg) return;
      // An admin may create the user's first conversation while this portal is
      // already open. Refresh immediately so the default-selection effect can
      // open that conversation without waiting for the 15-second poll.
      if (msg.senderType === "admin" && String(msg.conversationId) !== String(activeIdRef.current)) {
        fetchConversations();
        notifyMessage(
          "New message from Altuvera",
          msg.body?.slice(0, 160) || "You received a new message.",
          `altuvera-conversation-${msg.conversationId}`,
          `/messages?conversationId=${encodeURIComponent(msg.conversationId)}`,
        );
      }
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
                lastMessageSenderType: msg.senderType || c.lastMessageSenderType,
                lastMessageSenderId: msg.senderId ?? c.lastMessageSenderId,
                lastMessageSenderName: msg.senderName || c.lastMessageSenderName,
                lastMessageSenderUsername: msg.senderUsername || c.lastMessageSenderUsername,
                lastMessageSenderAvatar: msg.senderAvatar || c.lastMessageSenderAvatar,
                unreadUser:
                  msg.senderType === "admin" && String(msg.conversationId) !== String(activeIdRef.current)
                    ? (c.unreadUser || 0) + 1
                    : c.unreadUser,
                unreadAdmin:
                  msg.senderType !== "admin" && String(msg.conversationId) !== String(activeIdRef.current)
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
        prev.map((c) => (String(c.id) === String(conv.id) ? { ...c, ...normConv(conv) } : c))
      );
      if (String(conv.id) === String(activeIdRef.current)) {
        setActiveConversation((prev) => prev ? { ...prev, ...normConv(conv) } : prev);
      }
    });

    s.on("msg:reaction", ({ messageId, reactions }) => {
      if (!messageId) return;
      setMessages((prev) => prev.map((m) =>
        String(m.id) === String(messageId) ? { ...m, reactions: reactions || {} } : m
      ));
    });

    const applyMessageMutation = (raw) => {
      const msg = normMsg(raw);
      if (!msg?.id) return;
      setMessages((prev) => prev.map((m) => String(m.id) === String(msg.id) ? { ...m, ...msg } : m));
    };
    s.on("msg:message-edited", applyMessageMutation);
    s.on("msg:message-deleted", applyMessageMutation);
    s.on("msg:message-pinned", applyMessageMutation);
    s.on("msg:message-highlighted", applyMessageMutation);

    const onGroupMessage = (payload) => {
      const msg = normMsg(payload?.message || payload);
      const cid = String(payload?.conversationId || msg?.conversationId || "");
      if (!msg?.id || !cid) return;

      if (msg.senderType === "admin" && cid !== String(activeIdRef.current)) {
        notifyMessage(
          payload?.groupName || "Altuvera group message",
          msg.body?.slice(0, 160) || "You received a new group message.",
          `altuvera-conversation-${cid}`,
          `/messages?conversationId=${encodeURIComponent(cid)}`,
        );
      }

      setConversations((prev) => {
        const idx = prev.findIndex((c) => String(c.id) === cid);
        if (idx < 0) {
          fetchConversations();
          return prev;
        }
        const next = prev.map((c) => String(c.id) === cid
          ? {
              ...c,
              lastMessage: msg.body?.slice(0, 120) || c.lastMessage,
              lastMessageAt: msg.createdAt || c.lastMessageAt,
              lastMessageSenderType: msg.senderType || c.lastMessageSenderType,
              lastMessageSenderId: msg.senderId ?? c.lastMessageSenderId,
              lastMessageSenderName: msg.senderName || c.lastMessageSenderName,
              lastMessageSenderUsername: msg.senderUsername || c.lastMessageSenderUsername,
              lastMessageSenderAvatar: msg.senderAvatar || c.lastMessageSenderAvatar,
              unreadUser: cid === String(activeIdRef.current) ? 0 : (c.unreadUser || 0) + (msg.senderType === "admin" ? 1 : 0),
            }
          : c
        );
        const i = next.findIndex((c) => String(c.id) === cid);
        if (i > 0) {
          const [item] = next.splice(i, 1);
          next.unshift(item);
        }
        return next;
      });

      if (cid === String(activeIdRef.current)) {
        setMessages((prev) => prev.some((m) => String(m.id) === String(msg.id)) ? prev : [...prev, msg]);
      }
    };
    s.on("msg:group-message", onGroupMessage);

    const onRecycleWarning = (payload = {}) => {
      if (payload.conversationId == null) return;
      setRecycleClock(Date.now());
      setRecycleWarning({ ...payload, conversationId: String(payload.conversationId) });
    };
    const onRecycleCancelled = (payload = {}) => {
      setRecycleWarning((prev) => prev && String(prev.conversationId) === String(payload.conversationId) ? null : prev);
    };
    const onConversationRecycled = ({ conversationId } = {}) => {
      if (conversationId == null) return;
      const recycledId = String(conversationId);
      setConversations((prev) => prev.filter((conversation) => String(conversation.id) !== recycledId));
      setRecycleWarning((prev) => prev && String(prev.conversationId) === recycledId ? null : prev);
      if (recycledId === String(activeIdRef.current)) {
        activeIdRef.current = null;
        setActiveId(null);
        setActiveConversation(null);
        setMessages([]);
      }
      // Transient system event: update the inbox without creating a notification record.
      fetchConversations();
    };
    s.on("msg:conversation-recycle-warning", onRecycleWarning);
    s.on("msg:recycle-cancelled", onRecycleCancelled);
    s.on("msg:conversation-recycled", onConversationRecycled);
    s.on("msg:conversation-deleted", onConversationRecycled);

    s.on("msg:groups-updated", ({ groupId } = {}) => {
      if (groupId) s.emit("msg:join-group", { groupId });
      fetchConversations();
    });

    return () => {
      s.emit("msg:inbox-open", { open: false });
      s.off("msg:reaction");
      s.off("msg:message-edited", applyMessageMutation);
      s.off("msg:message-deleted", applyMessageMutation);
      s.off("msg:message-pinned", applyMessageMutation);
      s.off("msg:message-highlighted", applyMessageMutation);
      s.off("msg:group-message", onGroupMessage);
      s.off("msg:groups-updated");
      s.off("msg:conversation-deleted", onConversationRecycled);
      s.off("msg:conversation-recycle-warning", onRecycleWarning);
      s.off("msg:recycle-cancelled", onRecycleCancelled);
      s.off("msg:conversation-recycled", onConversationRecycled);
      s.disconnect();
    };
  }, [fetchConversations]);


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
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        start();
        fetchConversations();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchConversations]);

  /* ── Open a conversation ─────────────────────────────────── */
  const openConversation = useCallback(async (id) => {
    const requestId = ++openRequestRef.current;
    if (id === null || id === undefined || id === "") {
      activeIdRef.current = null;
      setAdminPresence({ active: false, activeSince: null, lastSeenAt: null });
      setActiveId(null);
      setActiveConversation(null);
      setMessages([]);
      setHasMoreMessages(false);
      setLoadingOlderMessages(false);
      loadingOlderRef.current = false;
      setAdminTyping(null);
      setTypingConvs(new Set());
      setLoadingMsgs(false);
      return;
    }

    // Update the ref synchronously so incoming socket events and fast
    // conversation switches never target the previously opened thread.
    activeIdRef.current = String(id);
    setActiveId(id);
    setMessages([]);
    setLoadingMsgs(true);
    setLoadingOlderMessages(false);
    loadingOlderRef.current = false;
    setHasMoreMessages(false);
    setError("");
    setAdminTyping(null);
    setTypingConvs(new Set());
    setAdminPresence({ active: false, activeSince: null, lastSeenAt: null });

    try {
      const res = await authFetch(
        `${API_BASE}/messages/conversations/${encodeURIComponent(id)}?limit=10`,
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || `Server error ${res.status}`);
      }
      // Ignore an older request if the user has already opened another chat.
      if (requestId !== openRequestRef.current || String(activeIdRef.current) !== String(id)) return;
      // Accept both API envelope shapes used by older and newer backend builds.
      // Some responses wrap the thread under data.conversation and return messages
      // alongside it; others return the conversation (including messages) directly.
      const thread = payload.data?.conversation || payload.data;
      if (!thread || typeof thread !== "object") {
        throw new Error("This conversation is no longer available. Refresh your inbox and try again.");
      }
      const threadMessages = Array.isArray(payload.data?.messages)
        ? payload.data.messages
        : Array.isArray(thread.messages)
          ? thread.messages
          : Array.isArray(payload.messages)
            ? payload.messages
            : [];
      const conv = normConv(thread);
      setActiveConversation(conv);
      setMessages(threadMessages.map(normMsg));
      setHasMoreMessages(Boolean(payload.data?.hasMoreMessages ?? thread.hasMoreMessages ?? payload.hasMoreMessages));

      authFetch(`${API_BASE}/messages/conversations/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
      }).catch(() => {});

      setConversations((prev) =>
        prev.map((c) => String(c.id) === String(id) ? { ...c, unreadUser: 0 } : c),
      );
    } catch (err) {
      if (requestId === openRequestRef.current) {
        setActiveConversation(null);
        setMessages([]);
        setError(err.message || "Failed to open conversation.");
      }
    } finally {
      if (requestId === openRequestRef.current) setLoadingMsgs(false);
    }
  }, []);

  /* Load older messages on demand, preserving a small initial payload. */
  const loadOlderMessages = useCallback(async () => {
    if (!activeId || !hasMoreMessages || loadingOlderRef.current || !messages.length) return;
    const conversationId = activeId;
    const oldest = messages[0];
    if (!oldest?.createdAt || oldest.id == null) return;

    loadingOlderRef.current = true;
    setLoadingOlderMessages(true);
    try {
      const params = new URLSearchParams({
        limit: "10",
        beforeCreatedAt: oldest.createdAt,
        beforeId: String(oldest.id),
      });
      const res = await authFetch(
        `${API_BASE}/messages/conversations/${conversationId}?${params.toString()}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Could not load older messages.");
      }
      const payload = await res.json();
      if (String(activeIdRef.current) !== String(conversationId)) return;
      const older = (payload.data?.messages || []).map(normMsg);
      setMessages((current) => {
        const known = new Set(current.map((message) => String(message.id)));
        const uniqueOlder = older.filter((message) => !known.has(String(message.id)));
        return [...uniqueOlder, ...current];
      });
      setHasMoreMessages(Boolean(payload.data?.hasMoreMessages));
    } catch (err) {
      setError(err.message || "Could not load older messages.");
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlderMessages(false);
    }
  }, [activeId, hasMoreMessages, messages]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s?.connected || !activeId) return;
    s.emit("msg:client-join", { conversationId: activeId }, (ack) => {
      if (!ack?.success) console.warn("[Messages] conversation join failed:", ack?.error);
    });
    s.emit("msg:mark-read", { conversationId: activeId });
    return () => {
      s.emit("msg:leave-conversation", { conversationId: activeId });
    };
  }, [activeId, connected]);

  /* ── Send message ────────────────────────────────────────── */
  const sendMessage = useCallback(
    async (conversationId, body, replyToId = null, metadata = null) => {
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
        metadata:       metadata || {},
        msgType:        metadata?.kind === "itinerary" ? "itinerary" : "text",
        createdAt:      new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const s = socketRef.current;
        let saved;
        // Context-bearing booking/resource messages must pass through REST so
        // the backend can verify booking ownership and normalize metadata.
        if (metadata) {
          const res = await authFetch(
            `${API_BASE}/messages/conversations/${conversationId}/messages`,
            {
              method: "POST",
              body: JSON.stringify({ body: body.trim(), ...(replyToId ? { replyToId } : {}), metadata }),
            },
          );
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(payload.message || "Failed to send contextual message.");
          saved = normMsg(payload.data);
        } else if (s?.connected) {
          const ack = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("The server did not confirm delivery. Check your connection and try again."));
            }, 12_000);
            s.emit("msg:send", {
              conversationId,
              body: body.trim(),
              ...(replyToId ? { replyToId } : {}),
            }, (response) => {
              clearTimeout(timeout);
              resolve(response);
            });
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
              ? {
                  ...c,
                  lastMessage: body.slice(0, 120),
                  lastMessageAt: saved.createdAt || new Date().toISOString(),
                  lastMessageSenderType: saved.senderType || "user",
                  lastMessageSenderId: saved.senderId ?? getCurrentUserId(),
                  lastMessageSenderName: saved.senderName || c.lastMessageSenderName,
                  lastMessageSenderUsername: saved.senderUsername || c.lastMessageSenderUsername,
                  lastMessageSenderAvatar: saved.senderAvatar || c.lastMessageSenderAvatar,
                }
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

  const dismissRecycleWarning = useCallback(() => setRecycleWarning(null), []);

  const requestKeepConversation = useCallback(async (conversationId) => {
    if (!conversationId) throw new Error("Conversation details are missing. Please refresh and try again.");
    const res = await authFetch(`${API_BASE}/messages/conversations/${encodeURIComponent(conversationId)}/recycle-cancel`, {
      method: "POST", body: JSON.stringify({}),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.success) throw new Error(payload.message || "Your request could not be sent.");
    setRecycleWarning((prev) => prev && String(prev.conversationId) === String(conversationId) ? null : prev);
    await fetchConversations();
    return payload;
  }, [fetchConversations]);

  const mutateMessage = useCallback(async (conversationId, messageId, url, options = {}) => {
    const res = await authFetch(
      API_BASE + "/messages/conversations/" + conversationId + "/messages/" + messageId + (url || ""),
      options,
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Message operation failed");
    const next = normMsg(data.data);
    setMessages((prev) => prev.map((m) => String(m.id) === String(messageId) ? { ...m, ...next } : m));
    return next;
  }, []);

  const editMessage = useCallback((conversationId, messageId, body) =>
    mutateMessage(conversationId, messageId, "", {
      method: "PATCH", body: JSON.stringify({ body }),
    }), [mutateMessage]);

  const unsendMessage = useCallback((conversationId, messageId) =>
    mutateMessage(conversationId, messageId, "", { method: "DELETE" }), [mutateMessage]);

  const toggleMessageFlag = useCallback((conversationId, messageId, flag, value) =>
    mutateMessage(conversationId, messageId, "/" + flag, {
      method: "PATCH", body: JSON.stringify({ value }),
    }), [mutateMessage]);

  const reactToMessage = useCallback(async (conversationId, messageId, emoji) => {
    const currentUserId = getCurrentUserId();
    const current = messages.find((m) => String(m.id) === String(messageId));
    const ids = current?.reactions?.[emoji] || [];
    const add = currentUserId == null ? true : !ids.map(String).includes(String(currentUserId));
    const res = await authFetch(
      API_BASE + "/messages/conversations/" + conversationId + "/messages/" + messageId + "/react",
      { method: "PATCH", body: JSON.stringify({ emoji, add }) },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Failed to react");
    setMessages((prev) => prev.map((m) => String(m.id) === String(messageId)
      ? { ...m, reactions: data.data?.reactions || {} } : m));
    return data.data?.reactions || {};
  }, [messages]);

  return {
    conversations,
    messages,
    activeId,
    activeConversation,
    unreadCount,
    loading,
    loadingMsgs,
    loadingOlderMessages,
    hasMoreMessages,
    loadOlderMessages,
    sending,
    error,
    openConversation,
    sendMessage,
    fetchConversations,
    editMessage,
    unsendMessage,
    toggleMessageFlag,
    reactToMessage,
    adminTyping,
    typingConvs,
    emitTyping,
    socketRef,
    connected,
    adminOnline,
    adminPresence,
    recycleWarning,
    recycleWarningSeconds,
    dismissRecycleWarning,
    requestKeepConversation,
  };
}
