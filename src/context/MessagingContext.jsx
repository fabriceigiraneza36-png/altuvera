/**
 * MessagingContext.jsx v3.0
 *
 * Fixes vs v2.x:
 *   ✓ Handles all backend event names: msg:message, message, chat:message
 *   ✓ HTTP fallback via sendChatMessage when socket offline
 *   ✓ Session + conversationId persisted across reconnects
 *   ✓ Registration debounced with ref guard (no storms)
 *   ✓ unreadCount + newConversationNotification for Navbar
 *   ✓ getDestinationName() for BookingContact step
 *   ✓ All listeners cleaned up on unmount
 *   ✓ Zero duplicate socket instances
 */

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef, useMemo,
} from 'react'
import {
  getSocket, connectSocket, updateSocketAuth,
} from '../utils/socket'
import { sendChatMessage } from '../utils/sendMessage'
import { useUserAuth } from './UserAuthContext'

/* ═══════════════════════════════════════════════════════════════
   CHAT BACKGROUNDS
═══════════════════════════════════════════════════════════════ */
export const CHAT_BACKGROUNDS = [
  {
    id: 'white', label: 'Clean White',
    type: 'solid', value: '#ffffff',
  },
  {
    id: 'soft', label: 'Soft Green',
    type: 'solid', value: '#f0fdf4',
  },
  {
    id: 'mint', label: 'Mint',
    type: 'solid', value: '#ecfdf5',
  },
  {
    id: 'dark', label: 'Dark Forest',
    type: 'solid', value: '#0a1f14',
  },
  {
    id: 'gradient1', label: 'Forest Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
  },
  {
    id: 'gradient2', label: 'Deep Green',
    type: 'gradient',
    value: 'linear-gradient(135deg,#052e16 0%,#14532d 100%)',
  },
  {
    id: 'gradient3', label: 'Dawn',
    type: 'gradient',
    value: 'linear-gradient(135deg,#fef9c3 0%,#f0fdf4 100%)',
  },
  {
    id: 'pattern1', label: 'Dots',
    type: 'pattern',
    value: 'radial-gradient(#16a34a22 1px,transparent 1px)',
    size: '20px 20px',
  },
  {
    id: 'pattern2', label: 'Grid',
    type: 'pattern',
    value: [
      'linear-gradient(#16a34a11 1px,transparent 1px)',
      'linear-gradient(90deg,#16a34a11 1px,transparent 1px)',
    ].join(','),
    size: '24px 24px',
  },
  {
    id: 'nature1', label: 'Safari Sand',
    type: 'solid', value: '#fef3c7',
  },
  {
    id: 'nature2', label: 'Night Safari',
    type: 'gradient',
    value: 'linear-gradient(160deg,#0a1628 0%,#0d2a1c 100%)',
  },
  {
    id: 'blue', label: 'Ocean',
    type: 'gradient',
    value: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
  },
]

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
═══════════════════════════════════════════════════════════════ */
const KEYS = {
  SESSION:  'altuvera_chat_session_id',
  CONV_ID:  'altuvera_chat_conv_id',
  BG:       'altuvera_chat_bg',
  PINNED:   'altuvera_chat_pinned',
}

const ls = {
  get:     (k)    => { try { return localStorage.getItem(k) || '' }           catch { return '' } },
  set:     (k, v) => { try { localStorage.setItem(k, v) }                     catch { /* quota */ } },
  getInt:  (k)    => { try { const n = parseInt(localStorage.getItem(k), 10); return isNaN(n) ? null : n } catch { return null } },
  setInt:  (k, v) => { try { localStorage.setItem(k, String(v)) }             catch { /* quota */ } },
  getJSON: (k)    => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } },
  setJSON: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) }     catch { /* quota */ } },
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE NORMALIZER
   Handles all field naming variants from backend
═══════════════════════════════════════════════════════════════ */
const normalizeMsg = (raw) => {
  if (!raw || typeof raw !== 'object') return null

  return {
    id:             raw.id,
    body:           raw.body            || '',
    senderType:     raw.senderType      || raw.sender_type      || 'user',
    senderName:     raw.senderName      || raw.sender_name      || '',
    senderEmail:    raw.senderEmail     || raw.sender_email     || null,
    senderAvatar:   raw.senderAvatar    || raw.sender_avatar    || null,
    isRead:         Boolean(raw.isRead  ?? raw.is_read          ?? false),
    isEdited:       Boolean(raw.isEdited ?? raw.edited          ?? false),
    isDeleted:      Boolean(raw.isDeleted ?? raw.deleted        ?? false),
    isPinned:       Boolean(raw.isPinned  ?? false),
    isOptimistic:   Boolean(raw.isOptimistic ?? false),
    reactions:      raw.reactions       || {},
    metadata:       raw.metadata        || {},
    /* Nested context fields */
    replyTo:
      raw.replyTo         ||
      raw.reply_to        ||
      raw.metadata?.replyTo       ||
      null,
    forwardedFrom:
      raw.forwardedFrom   ||
      raw.forwarded_from  ||
      raw.metadata?.forwardedFrom ||
      null,
    packageContext:
      raw.packageContext  ||
      raw.package_context ||
      raw.metadata?.packageContext ||
      null,
    createdAt:
      raw.createdAt  ||
      raw.created_at ||
      new Date().toISOString(),
  }
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════════════════════════ */
const MessagingContext = createContext(null)

export const useMessaging = () => {
  const ctx = useContext(MessagingContext)
  if (!ctx) {
    throw new Error(
      'useMessaging must be used inside <MessagingProvider>.\n' +
      'Ensure MessagingProvider wraps your App or Router.'
    )
  }
  return ctx
}

/* ═══════════════════════════════════════════════════════════════
   PROVIDER
═══════════════════════════════════════════════════════════════ */
export function MessagingProvider({ children }) {
  const { user, token } = useUserAuth()

  /* ── Portal open state ── */
  const [isOpen, setIsOpen] = useState(false)

  /* ── Connection state ── */
  const [connected,       setConnected]       = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [adminOnline,     setAdminOnline]     = useState(false)
  const [registered,      setRegistered]      = useState(false)
  const [sendingMsg,      setSendingMsg]      = useState(false)

  /* ── Messages ── */
  const [messages,         setMessages]         = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [isTyping,         setIsTyping]         = useState(false)
  const [unreadCount,      setUnreadCount]      = useState(0)
  const [newConversationNotification, setNewConversationNotification] =
    useState(false)

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState('')

  /* ── Interaction ── */
  const [replyingTo,     setReplyingTo]     = useState(null)
  const [editingMsg,     setEditingMsg]     = useState(null)
  const [forwardingMsg,  setForwardingMsg]  = useState(null)
  const [highlightedMsg, setHighlightedMsg] = useState(null)
  const [submitError,    setSubmitError]    = useState(null)

  /* ── Pinned ── */
  const [pinnedMessages, setPinnedMessages] =
    useState(() => ls.getJSON(KEYS.PINNED))
  const [showPinned, setShowPinned] = useState(false)

  /* ── Background ── */
  const [chatBackground, setChatBackground] = useState(() => {
    const savedId = ls.get(KEYS.BG)
    return CHAT_BACKGROUNDS.find(b => b.id === savedId) || CHAT_BACKGROUNDS[0]
  })

  /* ── Package context ── */
  const [packageContext, setPackageContextState] = useState(null)

  /* ═══════════════════════════════════════════════════════════
     STABLE REFS
     (survive re-renders, no stale closures in callbacks)
  ═══════════════════════════════════════════════════════════ */
  const sessionIdRef     = useRef(ls.get(KEYS.SESSION))
  const convIdRef        = useRef(ls.getInt(KEYS.CONV_ID))
  const registeredRef    = useRef(false)
  const isOpenRef        = useRef(false)
  const mountedRef       = useRef(true)
  const typingTimerRef   = useRef(null)
  const registerTimerRef = useRef(null)
  const userRef          = useRef(user)
  const tokenRef         = useRef(token)
  const submitRetryRef   = useRef(0)

  /* Keep refs current without causing re-renders */
  useEffect(() => { userRef.current  = user  }, [user])
  useEffect(() => { tokenRef.current = token }, [token])
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])

  /* Global mounted guard */
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimeout(typingTimerRef.current)
      clearTimeout(registerTimerRef.current)
    }
  }, [])

  /* ── Unread count derived from messages ── */
  useEffect(() => {
    const count = messages.filter(
      (m) => m.senderType !== 'user' && !m.isRead && !m.isDeleted
    ).length

    setUnreadCount(count)

    if (count > 0 && !isOpenRef.current) {
      setNewConversationNotification(true)
    }
  }, [messages])

  /* ── Sync auth token → socket ── */
  useEffect(() => {
    if (token) updateSocketAuth(token)
  }, [token])

  /* ═══════════════════════════════════════════════════════════
     SOCKET EVENT HANDLERS
  ═══════════════════════════════════════════════════════════ */

  /**
   * Wrap handler so it only runs if component is still mounted.
   * Prevents setState on unmounted component.
   */
  const safe = useCallback(
    (fn) => (...args) => {
      if (mountedRef.current) fn(...args)
    },
    []
  )

  /* ── SOCKET SETUP — runs once, clean singleton ── */
  useEffect(() => {
    const socket = getSocket()

    /* ── Connection handlers ── */
    const onConnect = safe(() => {
      setConnected(true)
      setConnectionState('connected')
    })

    const onDisconnect = safe((reason) => {
      setConnected(false)
      setAdminOnline(false)
      /*
       * 'io server disconnect' = server kicked us intentionally
       * (e.g. auth failure). Don't show 'reconnecting' — show 'disconnected'.
       * All other reasons are transient — show 'reconnecting'.
       */
      setConnectionState(
        reason === 'io server disconnect' ? 'disconnected' : 'reconnecting'
      )
    })

    const onConnectError = safe(() => {
      setConnected(false)
      setConnectionState('reconnecting')
    })

    const onReconnecting = safe(() => {
      setConnectionState('reconnecting')
    })

    const onReconnect = safe(() => {
      setConnected(true)
      setConnectionState('connected')
      /*
       * Server may have dropped the session during downtime.
       * Re-register only if portal is open.
       */
      registeredRef.current = false
      if (isOpenRef.current) {
        scheduleRegister(800)
      }
    })

    /* ── Chat: admin online status ── */
    const onAdminOnline = safe((data) => {
      setAdminOnline(
        Boolean(data?.online ?? data?.isOnline ?? false)
      )
    })

    /* ── Chat: session established ── */
    const onSession = safe((data) => {
      if (!data) return

      if (data.sessionId) {
        sessionIdRef.current = data.sessionId
        ls.set(KEYS.SESSION, data.sessionId)
      }
      if (data.conversationId) {
        convIdRef.current = data.conversationId
        ls.setInt(KEYS.CONV_ID, data.conversationId)
      }
      if (Array.isArray(data.messages)) {
        setMessages(data.messages.map(normalizeMsg).filter(Boolean))
      }

      setAdminOnline(Boolean(data.adminOnline))
      setRegistered(true)
      registeredRef.current = true
    })

    /**
     * ── Chat: new message ──
     *
     * Handles ALL event names the backend may emit:
     *   'msg:message'  — new messaging protocol (server.js)
     *   'message'      — controller broadcasts (adminReply)
     *   'chat:message' — legacy chat protocol
     */
    const onMessage = safe((raw) => {
      if (!raw) return
      const msg = normalizeMsg(raw)
      if (!msg) return

      setMessages((prev) => {
        /*
         * Replace optimistic placeholder with real server message.
         * Match on body + senderType since we don't have the real id yet.
         */
        const optIdx = prev.findIndex(
          (m) =>
            m.isOptimistic &&
            m.body         === msg.body &&
            m.senderType   === msg.senderType
        )
        if (optIdx !== -1) {
          const next = [...prev]
          next[optIdx] = msg
          return next
        }

        /* Deduplicate by id */
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev

        return [...prev, msg]
      })

      /* Notification badge when portal is closed */
      if (msg.senderType !== 'user' && !isOpenRef.current) {
        setNewConversationNotification(true)
      }
    })

    /* ── Chat: typing indicator ── */
    const onTyping = safe((data) => {
      /*
       * Only show typing when ADMIN is typing.
       * Filter out our own typing events reflected back.
       */
      if (!data) return
      const isAdminTyping =
        data.senderType === 'admin' ||
        (data.senderType !== 'user' && data.senderType !== undefined)

      if (!isAdminTyping) return

      setIsTyping(Boolean(data.isTyping))
      clearTimeout(typingTimerRef.current)

      if (data.isTyping) {
        /* Auto-clear after 5s in case 'stop' event is missed */
        typingTimerRef.current = setTimeout(() => {
          if (mountedRef.current) setIsTyping(false)
        }, 5_000)
      }
    })

    /* ── Chat: messages read ── */
    const onRead = safe((data) => {
      if (!data) return
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          isRead:
            data.readBy === 'admin' && m.senderType === 'user'
              ? true
              : m.isRead,
        }))
      )
    })

    /* ─────────────────────────────────────────────────────────
       ATTACH ALL LISTENERS
       One place, easy to audit.
    ───────────────────────────────────────────────────────── */
    socket.on('connect',              onConnect)
    socket.on('disconnect',           onDisconnect)
    socket.on('connect_error',        onConnectError)
    socket.io.on('reconnect_attempt', onReconnecting)
    socket.io.on('reconnect',         onReconnect)

    /* New messaging protocol */
    socket.on('msg:admin-online',     onAdminOnline)
    socket.on('msg:session',          onSession)
    socket.on('msg:message',          onMessage)
    socket.on('msg:typing',           onTyping)
    socket.on('msg:read',             onRead)

    /* Controller direct broadcasts (messageController.js adminReply) */
    socket.on('message',              onMessage)
    socket.on('messages-read',        onRead)

    /* Legacy chat protocol (chat:* events from server.js) */
    socket.on('chat:session',         onSession)
    socket.on('chat:message',         onMessage)
    socket.on('chat:typing',          onTyping)

    /* Sync initial state if already connected (e.g. HMR) */
    if (socket.connected) {
      setConnected(true)
      setConnectionState('connected')
    }

    /* ── CLEANUP — remove only our listeners ── */
    return () => {
      socket.off('connect',              onConnect)
      socket.off('disconnect',           onDisconnect)
      socket.off('connect_error',        onConnectError)
      socket.io.off('reconnect_attempt', onReconnecting)
      socket.io.off('reconnect',         onReconnect)

      socket.off('msg:admin-online',     onAdminOnline)
      socket.off('msg:session',          onSession)
      socket.off('msg:message',          onMessage)
      socket.off('msg:typing',           onTyping)
      socket.off('msg:read',             onRead)

      socket.off('message',              onMessage)
      socket.off('messages-read',        onRead)

      socket.off('chat:session',         onSession)
      socket.off('chat:message',         onMessage)
      socket.off('chat:typing',          onTyping)
    }
  }, [safe]) // safe is stable (useCallback with empty deps)

  /* ═══════════════════════════════════════════════════════════
     REGISTRATION
  ═══════════════════════════════════════════════════════════ */
  const scheduleRegister = useCallback((delayMs = 200) => {
    clearTimeout(registerTimerRef.current)
    registerTimerRef.current = setTimeout(() => {
      if (!mountedRef.current)   return
      if (registeredRef.current) return

      const socket = getSocket()
      if (!socket.connected)     return

      const u     = userRef.current
      const sid   = sessionIdRef.current || undefined
      const name  = u?.fullName || u?.name  || ''
      const email = u?.email    || ''

      if (import.meta.env.DEV) {
        console.info('[Messaging] Registering…', { sid, name, email })
      }

      socket.emit(
        'msg:register',
        { sessionId: sid, name, email },
        (res) => {
          if (!mountedRef.current) return

          if (!res?.success) {
            if (import.meta.env.DEV) {
              console.warn('[Messaging] Register failed:', res?.error)
            }
            return
          }

          if (res.sessionId) {
            sessionIdRef.current = res.sessionId
            ls.set(KEYS.SESSION, res.sessionId)
          }
          if (res.conversationId) {
            convIdRef.current = res.conversationId
            ls.setInt(KEYS.CONV_ID, res.conversationId)
          }
          if (Array.isArray(res.messages)) {
            setMessages(res.messages.map(normalizeMsg).filter(Boolean))
          }

          setAdminOnline(Boolean(res.adminOnline))
          setRegistered(true)
          registeredRef.current = true

          if (import.meta.env.DEV) {
            console.info(
              '[Messaging] ✓ Registered  conv=', res.conversationId,
              ' session=', res.sessionId
            )
          }
        }
      )
    }, delayMs)
  }, [])

  /* Register when portal opens AND socket is connected */
  useEffect(() => {
    if (!isOpen || !connected || registeredRef.current) return
    scheduleRegister(200)
  }, [isOpen, connected, scheduleRegister])

  /* Reset registration when authenticated user changes */
  useEffect(() => {
    registeredRef.current = false
    setRegistered(false)
    if (isOpen && connected) scheduleRegister(400)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ═══════════════════════════════════════════════════════════
     PORTAL CONTROLS
  ═══════════════════════════════════════════════════════════ */
  const openPortal = useCallback((pkgCtx = null) => {
    if (pkgCtx) setPackageContextState(pkgCtx)
    setIsOpen(true)
    setNewConversationNotification(false)

    /* Lazy connect — first time portal opens */
    connectSocket(tokenRef.current || undefined)
  }, [])

  const closePortal = useCallback(() => {
    setIsOpen(false)
  }, [])

  /* ═══════════════════════════════════════════════════════════
     SEND MESSAGE
     Primary:  socket.emit('msg:send')
     Fallback: POST /api/messages/send
  ═══════════════════════════════════════════════════════════ */
  const sendMessage = useCallback((body, options = {}) => {
    const text = String(body || '').trim()
    if (!text) return

    const u      = userRef.current
    const socket = getSocket()

    /* ── Build optimistic message ── */
    const optId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const optimistic = normalizeMsg({
      id:           optId,
      body:         text,
      senderType:   'user',
      senderName:   options.guestName  || u?.fullName || u?.name || 'Guest',
      senderEmail:  options.guestEmail || u?.email    || null,
      isOptimistic: true,
      isRead:       false,
      createdAt:    new Date().toISOString(),
      metadata: {
        replyTo:        replyingTo    || undefined,
        forwardedFrom:  forwardingMsg || undefined,
        packageContext: packageContext || undefined,
      },
    })

    /* Append optimistic immediately for instant UI */
    setMessages((prev) => [...prev, optimistic])
    setSendingMsg(true)
    setSubmitError(null)

    /* Clear context bars */
    setReplyingTo(null)
    setForwardingMsg(null)

    const payload = {
      body:      text,
      sessionId: sessionIdRef.current || undefined,
      name:      options.guestName  || u?.fullName || u?.name || 'Guest',
      email:     options.guestEmail || u?.email    || null,
      metadata:  optimistic.metadata,
    }

    const removeOptimistic = () => {
      setMessages((prev) => prev.filter((m) => m.id !== optId))
    }

    /* ── Path A: Socket (preferred) ── */
    if (socket.connected) {
      socket.emit('msg:send', payload, (res) => {
        if (!mountedRef.current) return
        setSendingMsg(false)

        if (!res?.success) {
          removeOptimistic()
          setSubmitError(res?.error || 'Message failed to send. Please try again.')
          submitRetryRef.current++
          if (import.meta.env.DEV) {
            console.warn('[Messaging] msg:send failed:', res?.error)
          }
        }
        /*
         * On success: server emits 'msg:message' to the room,
         * which replaces the optimistic via onMessage handler.
         */
      })
      return
    }

    /* ── Path B: HTTP fallback ── */
    const convId = convIdRef.current
    if (!convId) {
      removeOptimistic()
      setSendingMsg(false)
      setSubmitError(
        'Chat is not connected. Please wait a moment and try again.'
      )
      return
    }

    sendChatMessage({
      conversationId: convId,
      body:           text,
      sessionId:      sessionIdRef.current || undefined,
      token:          tokenRef.current     || undefined,
      metadata:       optimistic.metadata,
    })
      .then((data) => {
        if (!mountedRef.current) return
        setSendingMsg(false)
        /* Replace optimistic with confirmed message */
        if (data?.data) {
          const confirmed = normalizeMsg(data.data)
          if (confirmed) {
            setMessages((prev) =>
              prev.map((m) => (m.id === optId ? confirmed : m))
            )
          }
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return
        setSendingMsg(false)
        removeOptimistic()
        setSubmitError(err.message || 'Failed to send message. Please try again.')
        submitRetryRef.current++
      })
  }, [replyingTo, forwardingMsg, packageContext])

  /* ═══════════════════════════════════════════════════════════
     TYPING EMIT
  ═══════════════════════════════════════════════════════════ */
  const emitTyping = useCallback((isTypingNow) => {
    const socket = getSocket()
    if (!socket.connected) return

    socket.emit('msg:typing', {
      conversationId: convIdRef.current    || undefined,
      sessionId:      sessionIdRef.current || undefined,
      isTyping:       isTypingNow,
      senderType:     'user',
    })
  }, [])

  /* ═══════════════════════════════════════════════════════════
     MESSAGE ACTIONS
  ═══════════════════════════════════════════════════════════ */
  const editMessage = useCallback((id, body) => {
    if (!body?.trim()) return
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, body: body.trim(), isEdited: true } : m
      )
    )
    setEditingMsg(null)
    /* TODO: socket.emit('msg:edit', { id, body }) when backend supports */
  }, [])

  const deleteMessage = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isDeleted: true, body: '' } : m
      )
    )
    /* TODO: socket.emit('msg:delete', { id }) when backend supports */
  }, [])

  const reactToMessage = useCallback((msgId, emoji) => {
    const uid = userRef.current?.id || 'guest'
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m
        const reactions   = { ...(m.reactions || {}) }
        const cur         = reactions[emoji]  || { count: 0, users: [] }
        const hasReacted  = cur.users?.includes(uid)
        reactions[emoji]  = {
          count: hasReacted
            ? Math.max(0, cur.count - 1)
            : cur.count + 1,
          users: hasReacted
            ? cur.users.filter((u) => u !== uid)
            : [...(cur.users || []), uid],
        }
        return { ...m, reactions }
      })
    )
  }, [])

  /* ── Reply ── */
  const startReply = useCallback((msg) => {
    setReplyingTo(msg)
    setForwardingMsg(null)
    setEditingMsg(null)
  }, [])

  const cancelReply = useCallback(() => setReplyingTo(null), [])

  /* ── Forward ── */
  const forwardMessage = useCallback((msg) => {
    if (!msg) { setForwardingMsg(null); return }
    setForwardingMsg(msg)
    setReplyingTo(null)
  }, [])

  /* ── Edit ── */
  const cancelEdit = useCallback(() => setEditingMsg(null), [])

  /* ═══════════════════════════════════════════════════════════
     PIN
  ═══════════════════════════════════════════════════════════ */
  const togglePin = useCallback((msg) => {
    setPinnedMessages((prev) => {
      const exists = prev.some((p) => p.id === msg.id)
      const next   = exists
        ? prev.filter((p) => p.id !== msg.id)
        : [...prev, msg]
      ls.setJSON(KEYS.PINNED, next)
      return next
    })
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m
      )
    )
  }, [])

  /* ═══════════════════════════════════════════════════════════
     SEARCH
  ═══════════════════════════════════════════════════════════ */
  const searchMessages = useCallback((q) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setFilteredMessages([])
      return
    }
    const lower = q.toLowerCase()
    setFilteredMessages(
      messages.filter(
        (m) =>
          m.body?.toLowerCase().includes(lower) ||
          m.senderName?.toLowerCase().includes(lower)
      )
    )
  }, [messages])

  /* ═══════════════════════════════════════════════════════════
     SCROLL TO MESSAGE
  ═══════════════════════════════════════════════════════════ */
  const scrollToMessage = useCallback((id) => {
    setHighlightedMsg(id)
    setTimeout(() => {
      if (mountedRef.current) setHighlightedMsg(null)
    }, 2_500)
  }, [])

  /* ═══════════════════════════════════════════════════════════
     BACKGROUND
  ═══════════════════════════════════════════════════════════ */
  const changeChatBackground = useCallback((bg) => {
    setChatBackground(bg)
    ls.set(KEYS.BG, bg.id)
  }, [])

  /* ═══════════════════════════════════════════════════════════
     PACKAGE CONTEXT
  ═══════════════════════════════════════════════════════════ */
  const setPackageContext  = useCallback((pkg) => setPackageContextState(pkg), [])
  const clearPackageContext = useCallback(() => setPackageContextState(null), [])

  /** Returns destination name for BookingContact display */
  const getDestinationName = useCallback(() => {
    return packageContext?.title || packageContext?.name || ''
  }, [packageContext])

  /* ═══════════════════════════════════════════════════════════
     CONTEXT VALUE
     Memoized — only re-computes when a dependency changes.
  ═══════════════════════════════════════════════════════════ */
  const value = useMemo(() => ({
    /* ── Portal ── */
    isOpen,
    openPortal,
    closePortal,

    /* ── Connection (all fields Navbar.jsx needs) ── */
    connected,
    connectionState,
    adminOnline,
    registered,
    sendingMsg,

    /* ── Messages ── */
    messages,
    filteredMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,

    /* ── Typing ── */
    isTyping,
    emitTyping,

    /* ── Reply / Edit / Forward ── */
    replyingTo,
    startReply,
    cancelReply,
    editingMsg,
    setEditingMsg,
    cancelEdit,
    forwardingMsg,
    forwardMessage,

    /* ── Pin ── */
    pinnedMessages,
    togglePin,
    showPinned,
    setShowPinned,

    /* ── Highlight / Scroll ── */
    highlightedMsg,
    scrollToMessage,

    /* ── Search ── */
    searchQuery,
    searchMessages,

    /* ── Background ── */
    chatBackground,
    changeChatBackground,

    /* ── Package ── */
    packageContext,
    setPackageContext,
    clearPackageContext,
    getDestinationName,

    /* ── Unread / notifications (Navbar uses both) ── */
    unreadCount,
    newConversationNotification,

    /* ── Error handling ── */
    submitError,
    setSubmitError,
    submitRetryCount: submitRetryRef.current,

    /* ── Compat stubs (BookingContact / BookingSteps) ── */
    loadingData:  false,
    isSubmitted:  false,
    isAnimating:  false,
    displayName:  user?.fullName || user?.name || '',

    /* ── Exported constant (for BackgroundPicker) ── */
    CHAT_BACKGROUNDS,
  }), [
    isOpen, openPortal, closePortal,
    connected, connectionState, adminOnline, registered, sendingMsg,
    messages, filteredMessages,
    sendMessage, editMessage, deleteMessage, reactToMessage,
    isTyping, emitTyping,
    replyingTo, startReply, cancelReply,
    editingMsg, cancelEdit,
    forwardingMsg, forwardMessage,
    pinnedMessages, togglePin, showPinned,
    highlightedMsg, scrollToMessage,
    searchQuery, searchMessages,
    chatBackground, changeChatBackground,
    packageContext, setPackageContext, clearPackageContext, getDestinationName,
    unreadCount, newConversationNotification,
    submitError,
    user,
  ])

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  )
}

export default MessagingContext