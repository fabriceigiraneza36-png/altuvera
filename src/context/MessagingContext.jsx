/**
 * MessagingContext.jsx v5.0
 *
 * Key fixes vs v4:
 *   ✅ Uses conversationId (not sessionId) for msg:send — matches server
 *   ✅ Stores conversationId from msg:register ack / msg:session event
 *   ✅ msg:typing uses conversationId — matches server handler
 *   ✅ msg:mark-read uses conversationId — matches server handler
 *   ✅ Registration guard: won't sendMessage until conversationId exists
 *   ✅ All socket event names match server exactly
 */

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, useMemo,
} from 'react'
import { connectSocket, getSocket, updateSocketAuth } from '../utils/socket'
import { useUserAuth } from './UserAuthContext'

/* ══════════════════════════════════════════════════════════════════
   CHAT BACKGROUNDS
══════════════════════════════════════════════════════════════════ */
export const CHAT_BACKGROUNDS = [
  { id: 'white',     label: 'Clean White',     type: 'solid',    value: '#ffffff' },
  { id: 'soft',      label: 'Soft Green',      type: 'solid',    value: '#f0fdf4' },
  { id: 'mint',      label: 'Mint',            type: 'solid',    value: '#ecfdf5' },
  { id: 'dark',      label: 'Dark Forest',     type: 'solid',    value: '#0a1f14' },
  {
    id: 'gradient1', label: 'Forest Gradient', type: 'gradient',
    value: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
  },
  {
    id: 'gradient2', label: 'Deep Green',      type: 'gradient',
    value: 'linear-gradient(135deg,#052e16 0%,#14532d 100%)',
  },
  {
    id: 'gradient3', label: 'Dawn',            type: 'gradient',
    value: 'linear-gradient(135deg,#fef9c3 0%,#f0fdf4 100%)',
  },
  {
    id: 'pattern1',  label: 'Dots',            type: 'pattern',
    value: 'radial-gradient(#16a34a22 1px,transparent 1px)',
    size: '20px 20px',
  },
  {
    id: 'pattern2',  label: 'Grid',            type: 'pattern',
    value: [
      'linear-gradient(#16a34a11 1px,transparent 1px)',
      'linear-gradient(90deg,#16a34a11 1px,transparent 1px)',
    ].join(','),
    size: '24px 24px',
  },
  { id: 'nature1',   label: 'Safari Sand',     type: 'solid',    value: '#fef3c7' },
  {
    id: 'nature2',   label: 'Night Safari',    type: 'gradient',
    value: 'linear-gradient(160deg,#0a1628 0%,#0d2a1c 100%)',
  },
  {
    id: 'blue',      label: 'Ocean',           type: 'gradient',
    value: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
  },
]

/* ══════════════════════════════════════════════════════════════════
   LOCAL STORAGE
══════════════════════════════════════════════════════════════════ */
const LS = {
  SESSION: 'atv_session_id',    // persists across page loads
  BG:      'atv_chat_bg',
  PINNED:  'atv_chat_pinned',
}

const ls = {
  get:     (k)    => { try { return localStorage.getItem(k) || '' }               catch { return '' } },
  set:     (k, v) => { try { localStorage.setItem(k, String(v)) }                 catch {} },
  getJSON: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d }    catch { return d } },
  setJSON: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) }         catch {} },
}

/* ══════════════════════════════════════════════════════════════════
   MESSAGE NORMALIZER — matches server's serializeConvMessage()
══════════════════════════════════════════════════════════════════ */
export const normalizeMsg = (raw) => {
  if (!raw || typeof raw !== 'object') return null
  return {
    // Server sends: id, conversationId, senderType, senderId, senderName,
    //               senderEmail, senderAvatar, body, msgType, isRead,
    //               replyToId, metadata, createdAt
    id:             raw.id                                                        ?? null,
    conversationId: raw.conversationId ?? raw.conversation_id                     ?? null,
    sessionId:      raw.sessionId      ?? raw.session_id                          ?? null,
    body:           raw.body           ?? raw.content ?? raw.message              ?? '',
    senderType:     raw.senderType     ?? raw.sender_type                         ?? 'user',
    senderName:     raw.senderName     ?? raw.sender_name                         ?? '',
    senderEmail:    raw.senderEmail    ?? raw.sender_email                        ?? null,
    senderAvatar:   raw.senderAvatar   ?? raw.sender_avatar                       ?? null,
    isRead:         Boolean(raw.isRead    ?? raw.is_read   ?? false),
    isEdited:       Boolean(raw.isEdited  ?? raw.edited    ?? false),
    isDeleted:      Boolean(raw.isDeleted ?? raw.deleted   ?? false),
    isPinned:       Boolean(raw.isPinned  ?? false),
    isOptimistic:   Boolean(raw.isOptimistic ?? false),
    reactions:      raw.reactions      ?? {},
    metadata:       raw.metadata       ?? {},
    replyTo:        raw.replyTo        ?? raw.reply_to    ?? raw.metadata?.replyTo    ?? null,
    forwardedFrom:  raw.forwardedFrom  ?? raw.metadata?.forwardedFrom                ?? null,
    packageContext: raw.packageContext ?? raw.metadata?.packageContext                ?? null,
    createdAt:      raw.createdAt      ?? raw.created_at  ?? new Date().toISOString(),
  }
}

/* ══════════════════════════════════════════════════════════════════
   CONTEXT
══════════════════════════════════════════════════════════════════ */
const MessagingContext = createContext(null)

export const useMessaging = () => {
  const ctx = useContext(MessagingContext)
  if (!ctx) throw new Error('useMessaging must be inside <MessagingProvider>')
  return ctx
}

/* ══════════════════════════════════════════════════════════════════
   PROVIDER
══════════════════════════════════════════════════════════════════ */
export function MessagingProvider({ children }) {
  const { user, token } = useUserAuth()

  /* ── Portal ── */
  const [isOpen, setIsOpen] = useState(false)

  /* ── Connection ── */
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
  const [notification,     setNotification]     = useState(false)

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
    useState(() => ls.getJSON(LS.PINNED, []))
  const [showPinned, setShowPinned] = useState(false)

  /* ── Background ── */
  const [chatBackground, setChatBackground] = useState(() => {
    const id = ls.get(LS.BG)
    return CHAT_BACKGROUNDS.find((b) => b.id === id) || CHAT_BACKGROUNDS[0]
  })

  /* ── Package context ── */
  const [packageContext, setPackageContextState] = useState(null)

  /* ══════════════════════════════════════════════════════════════
     REFS — THE KEY IDENTIFIERS
     Server uses conversationId for the new messaging system.
     sessionId is the human-readable key used at registration.
  ══════════════════════════════════════════════════════════════ */
  const sessionIdRef      = useRef(ls.get(LS.SESSION) || null)
  const conversationIdRef = useRef(null)   // ← set after msg:register ack
  const registeredRef     = useRef(false)
  const registerTimerRef  = useRef(null)
  const typingTimerRef    = useRef(null)
  const mountedRef        = useRef(true)
  const isOpenRef         = useRef(false)
  const userRef           = useRef(user)
  const tokenRef          = useRef(token)
  const messagesRef       = useRef([])
  const replyingToRef     = useRef(null)
  const forwardingMsgRef  = useRef(null)
  const packageContextRef = useRef(null)

  /* Sync refs */
  useEffect(() => { userRef.current           = user          }, [user])
  useEffect(() => { tokenRef.current          = token         }, [token])
  useEffect(() => { isOpenRef.current         = isOpen        }, [isOpen])
  useEffect(() => { messagesRef.current       = messages      }, [messages])
  useEffect(() => { replyingToRef.current     = replyingTo    }, [replyingTo])
  useEffect(() => { forwardingMsgRef.current  = forwardingMsg }, [forwardingMsg])
  useEffect(() => { packageContextRef.current = packageContext }, [packageContext])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimeout(typingTimerRef.current)
      clearTimeout(registerTimerRef.current)
    }
  }, [])

  /* ── Sync token → socket ── */
  useEffect(() => {
    if (token) updateSocketAuth(token)
  }, [token])

  /* ── Unread badge ── */
  useEffect(() => {
    const count = messages.filter(
      (m) => m.senderType !== 'user' && !m.isRead && !m.isDeleted,
    ).length
    setUnreadCount(count)
    if (count > 0 && !isOpenRef.current) setNotification(true)
  }, [messages])

  /* ══════════════════════════════════════════════════════════════
     UPSERT — replace optimistic or dedupe by id
  ══════════════════════════════════════════════════════════════ */
  const upsertMessage = useCallback((msg) => {
    if (!msg) return
    setMessages((prev) => {
      // Replace matching optimistic (same body + senderType)
      const optIdx = prev.findIndex(
        (m) =>
          m.isOptimistic &&
          m.body       === msg.body &&
          m.senderType === msg.senderType,
      )
      if (optIdx !== -1) {
        const next = [...prev]
        next[optIdx] = { ...msg, isOptimistic: false }
        return next
      }
      // Dedupe by real id
      if (msg.id && prev.some((m) => m.id === msg.id)) {
        // Update existing (e.g. read status changed)
        return prev.map((m) => m.id === msg.id ? { ...m, ...msg } : m)
      }
      return [...prev, msg]
    })
  }, [])

  /* ══════════════════════════════════════════════════════════════
     SOCKET SETUP — single effect, stable
  ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const socket = getSocket()

    /* ── Connection ── */
    const onConnect = () => {
      if (!mountedRef.current) return
      setConnected(true)
      setConnectionState('connected')
      // Re-register if portal is open and we lost registration
      if (isOpenRef.current && !registeredRef.current) {
        scheduleRegister(400)
      }
    }

    const onDisconnect = (reason) => {
      if (!mountedRef.current) return
      setConnected(false)
      setAdminOnline(false)
      // Don't clear conversationId — server will restore session on reconnect
      registeredRef.current = false
      setRegistered(false)
      setConnectionState(
        reason === 'io server disconnect' ? 'disconnected' : 'reconnecting',
      )
    }

    const onConnectError = () => {
      if (!mountedRef.current) return
      setConnected(false)
      setConnectionState('reconnecting')
    }

    const onReconnect = () => {
      if (!mountedRef.current) return
      setConnected(true)
      setConnectionState('connected')
      // Will re-register via onConnect handler above
    }

    /* ── Admin presence ── */
    const onAdminOnline = (data) => {
      if (!mountedRef.current) return
      setAdminOnline(Boolean(data?.online ?? data?.isOnline ?? true))
    }

    /**
     * msg:session — server sends this after registration
     * Payload: { conversationId, sessionId, messages[], adminOnline, ... }
     */
    const onSession = (data) => {
      if (!mountedRef.current || !data) return

      // Store BOTH identifiers
      if (data.sessionId) {
        sessionIdRef.current = data.sessionId
        ls.set(LS.SESSION, data.sessionId)
      }
      if (data.conversationId) {
        conversationIdRef.current = data.conversationId
      }

      if (Array.isArray(data.messages)) {
        const normalized = data.messages.map(normalizeMsg).filter(Boolean)
        setMessages(normalized)
      }

      setAdminOnline(Boolean(data.adminOnline ?? data.admin_online ?? false))
      setRegistered(true)
      registeredRef.current = true

      console.debug(
        '[messaging] session established',
        { sessionId: sessionIdRef.current, conversationId: conversationIdRef.current },
      )
    }

    /**
     * msg:message — new message from server
     * Server broadcasts to conv:${convId} AND session:${sessionId}
     */
    const onMessage = (raw) => {
      if (!mountedRef.current || !raw) return
      const msg = normalizeMsg(raw)
      if (!msg) return

      upsertMessage(msg)

      if (msg.senderType !== 'user' && !isOpenRef.current) {
        setNotification(true)
      }
    }

    /**
     * msg:typing — admin typing indicator
     * Server sends: { conversationId, senderType, senderName, isTyping }
     */
    const onTyping = (data) => {
      if (!mountedRef.current || !data) return
      // Only show typing from admin side
      if (data.senderType === 'user') return

      const isNow = Boolean(data.isTyping)
      setIsTyping(isNow)
      clearTimeout(typingTimerRef.current)
      if (isNow) {
        typingTimerRef.current = setTimeout(() => {
          if (mountedRef.current) setIsTyping(false)
        }, 5000)
      }
    }

    /**
     * msg:read — admin read our messages
     * Server sends: { conversationId, readBy }
     */
    const onRead = (data) => {
      if (!mountedRef.current || !data) return
      if (data.readBy === 'admin') {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderType === 'user' ? { ...m, isRead: true } : m,
          ),
        )
      }
    }

    /* ── Attach ── */
    socket.on('connect',          onConnect)
    socket.on('disconnect',       onDisconnect)
    socket.on('connect_error',    onConnectError)
    socket.io.on('reconnect',     onReconnect)

    // New messaging system (primary)
    socket.on('msg:session',      onSession)
    socket.on('msg:message',      onMessage)
    socket.on('msg:typing',       onTyping)
    socket.on('msg:read',         onRead)
    socket.on('msg:admin-online', onAdminOnline)

    // Legacy compatibility
    socket.on('chat:session',     onSession)
    socket.on('chat:message',     onMessage)
    socket.on('chat:typing',      onTyping)

    if (socket.connected) {
      setConnected(true)
      setConnectionState('connected')
    }

    return () => {
      socket.off('connect',          onConnect)
      socket.off('disconnect',       onDisconnect)
      socket.off('connect_error',    onConnectError)
      socket.io.off('reconnect',     onReconnect)

      socket.off('msg:session',      onSession)
      socket.off('msg:message',      onMessage)
      socket.off('msg:typing',       onTyping)
      socket.off('msg:read',         onRead)
      socket.off('msg:admin-online', onAdminOnline)

      socket.off('chat:session',     onSession)
      socket.off('chat:message',     onMessage)
      socket.off('chat:typing',      onTyping)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upsertMessage])

  /* ══════════════════════════════════════════════════════════════
     REGISTRATION
     Emits msg:register → server creates/finds conversation →
     ack contains { success, conversationId, sessionId, messages[], adminOnline }
     Server ALSO emits msg:session — handled by onSession above
  ══════════════════════════════════════════════════════════════ */
  const scheduleRegister = useCallback((delay = 200) => {
    clearTimeout(registerTimerRef.current)
    registerTimerRef.current = setTimeout(() => {
      if (!mountedRef.current)   return
      if (registeredRef.current) return

      const socket = getSocket()
      if (!socket.connected)     return

      const u     = userRef.current
      const sid   = sessionIdRef.current || `guest-${Date.now()}`
      const name  = u?.fullName || u?.name  || ''
      const email = u?.email    || ''

      console.debug('[messaging] emitting msg:register', { sessionId: sid, name, email })

      socket.emit('msg:register', { sessionId: sid, name, email }, (ack) => {
        if (!mountedRef.current) return

        console.debug('[messaging] msg:register ack:', ack)

        if (!ack?.success) {
          console.warn('[messaging] registration failed:', ack?.error)
          // Retry after 2s
          setTimeout(() => {
            if (mountedRef.current && !registeredRef.current) {
              registeredRef.current = false
              scheduleRegister(2000)
            }
          }, 0)
          return
        }

        // Store both IDs from ack
        if (ack.sessionId) {
          sessionIdRef.current = ack.sessionId
          ls.set(LS.SESSION, ack.sessionId)
        }
        if (ack.conversationId) {
          conversationIdRef.current = ack.conversationId
        }

        if (Array.isArray(ack.messages)) {
          const normalized = ack.messages.map(normalizeMsg).filter(Boolean)
          setMessages(normalized)
        }

        setAdminOnline(Boolean(ack.adminOnline ?? false))
        setRegistered(true)
        registeredRef.current = true

        console.debug(
          '[messaging] registered ✓',
          { sessionId: sessionIdRef.current, conversationId: conversationIdRef.current },
        )
      })
    }, delay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Register when portal opens + connected */
  useEffect(() => {
    if (!isOpen) return
    connectSocket(tokenRef.current || undefined)
    if (connected && !registeredRef.current) scheduleRegister(200)
  }, [isOpen, connected, scheduleRegister])

  /* Re-register when user changes */
  useEffect(() => {
    registeredRef.current = false
    conversationIdRef.current = null
    setRegistered(false)
    if (isOpen && connected) scheduleRegister(400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  /* ══════════════════════════════════════════════════════════════
     PORTAL CONTROLS
  ══════════════════════════════════════════════════════════════ */
  const openPortal = useCallback((pkgCtx = null) => {
    if (pkgCtx) setPackageContextState(pkgCtx)
    setIsOpen(true)
    setNotification(false)
    connectSocket(tokenRef.current || undefined)
  }, [])

  const closePortal = useCallback(() => setIsOpen(false), [])

  /* ══════════════════════════════════════════════════════════════
     MARK READ — when portal opens, tell server we read messages
     Server event: msg:mark-read  payload: { conversationId }
  ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isOpen || !conversationIdRef.current) return
    const socket = getSocket()
    if (!socket.connected) return

    socket.emit('msg:mark-read', {
      conversationId: conversationIdRef.current,
    })

    // Locally mark admin messages as read
    setMessages((prev) =>
      prev.map((m) =>
        m.senderType !== 'user' ? { ...m, isRead: true } : m,
      ),
    )
    setUnreadCount(0)
    setNotification(false)
  }, [isOpen])

  /* ══════════════════════════════════════════════════════════════
     SEND MESSAGE
     Server event: msg:send
     Payload: { sessionId, body, name, email, metadata }
     Server requires conversationId OR creates one from sessionId
  ══════════════════════════════════════════════════════════════ */
  const sendMessage = useCallback((body, options = {}) => {
    const text = String(body || '').trim()
    if (!text) return

    const u      = userRef.current
    const socket = getSocket()

    // Need at least a sessionId to send
    const sid    = sessionIdRef.current
    const convId = conversationIdRef.current

    if (!sid) {
      setSubmitError('Chat not ready — please wait a moment.')
      console.warn('[messaging] sendMessage: no sessionId yet')
      return
    }

    const optId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const optimistic = normalizeMsg({
      id:             optId,
      conversationId: convId,
      sessionId:      sid,
      body:           text,
      senderType:     'user',
      senderName:     options.guestName  || u?.fullName || u?.name || 'Guest',
      senderEmail:    options.guestEmail || u?.email    || null,
      isOptimistic:   true,
      isRead:         false,
      createdAt:      new Date().toISOString(),
      metadata: {
        replyTo:        replyingToRef.current    || undefined,
        forwardedFrom:  forwardingMsgRef.current || undefined,
        packageContext: packageContextRef.current || undefined,
      },
    })

    setMessages((prev) => [...prev, optimistic])
    setSendingMsg(true)
    setSubmitError(null)
    setReplyingTo(null)
    setForwardingMsg(null)

    const removeOptimistic = () =>
      setMessages((prev) => prev.filter((m) => m.id !== optId))

    /* ── Socket path — preferred ── */
    if (socket.connected) {
      // Server's msg:send handler expects: sessionId, body, name, email, metadata
      // It will look up the conversation from sessionId
      socket.emit('msg:send', {
        sessionId:  sid,
        body:       text,
        name:       options.guestName  || u?.fullName || u?.name || 'Guest',
        email:      options.guestEmail || u?.email    || null,
        metadata:   optimistic.metadata,
      }, (ack) => {
        if (!mountedRef.current) return
        setSendingMsg(false)

        console.debug('[messaging] msg:send ack:', ack)

        if (ack?.success === false) {
          removeOptimistic()
          setSubmitError(ack.error || 'Message failed. Please try again.')
          return
        }

        // Replace optimistic with confirmed message from server
        if (ack?.message) {
          const confirmed = normalizeMsg(ack.message)
          if (confirmed?.id) {
            setMessages((prev) =>
              prev.map((m) => m.id === optId ? confirmed : m),
            )
            // Store conversationId if we didn't have it
            if (confirmed.conversationId && !conversationIdRef.current) {
              conversationIdRef.current = confirmed.conversationId
            }
          }
        }
      })
      return
    }

    /* ── HTTP fallback ── */
    setSendingMsg(false)
    removeOptimistic()
    setSubmitError('Not connected. Please wait for reconnection.')
  }, []) // all via refs — no deps needed

  /* ══════════════════════════════════════════════════════════════
     TYPING
     Server event: msg:typing  payload: { conversationId, isTyping, senderType }
  ══════════════════════════════════════════════════════════════ */
  const emitTyping = useCallback((isTypingNow) => {
    const socket = getSocket()
    const convId = conversationIdRef.current
    if (!socket.connected || !convId) return

    socket.emit('msg:typing', {
      conversationId: convId,
      isTyping:       isTypingNow,
      senderType:     'user',
    })
  }, [])

  /* ══════════════════════════════════════════════════════════════
     MESSAGE ACTIONS
  ══════════════════════════════════════════════════════════════ */
  const editMessage = useCallback((id, body) => {
    if (!body?.trim()) return
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, body: body.trim(), isEdited: true } : m,
      ),
    )
    setEditingMsg(null)
  }, [])

  const deleteMessage = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isDeleted: true, body: '' } : m,
      ),
    )
  }, [])

  const reactToMessage = useCallback((msgId, emoji) => {
    const uid = userRef.current?.id || 'guest'
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m
        const reactions  = { ...(m.reactions || {}) }
        const cur        = reactions[emoji] || { count: 0, users: [] }
        const reacted    = cur.users?.includes(uid)
        reactions[emoji] = {
          count: reacted ? Math.max(0, cur.count - 1) : cur.count + 1,
          users: reacted
            ? cur.users.filter((u) => u !== uid)
            : [...(cur.users || []), uid],
        }
        return { ...m, reactions }
      }),
    )
  }, [])

  const startReply     = useCallback((msg) => {
    setReplyingTo(msg)
    setForwardingMsg(null)
    setEditingMsg(null)
  }, [])
  const cancelReply    = useCallback(() => setReplyingTo(null), [])
  const forwardMessage = useCallback((msg) => {
    setForwardingMsg(msg || null)
    if (msg) setReplyingTo(null)
  }, [])
  const cancelEdit     = useCallback(() => setEditingMsg(null), [])

  /* ══════════════════════════════════════════════════════════════
     PIN
  ══════════════════════════════════════════════════════════════ */
  const togglePin = useCallback((msg) => {
    setPinnedMessages((prev) => {
      const exists = prev.some((p) => p.id === msg.id)
      const next   = exists ? prev.filter((p) => p.id !== msg.id) : [...prev, msg]
      ls.setJSON(LS.PINNED, next)
      return next
    })
    setMessages((prev) =>
      prev.map((m) => m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m),
    )
  }, [])

  /* ══════════════════════════════════════════════════════════════
     SEARCH
  ══════════════════════════════════════════════════════════════ */
  const searchMessages = useCallback((q) => {
    setSearchQuery(q)
    if (!q?.trim()) { setFilteredMessages([]); return }
    const lower = q.toLowerCase()
    setFilteredMessages(
      messagesRef.current.filter(
        (m) =>
          m.body?.toLowerCase().includes(lower) ||
          m.senderName?.toLowerCase().includes(lower),
      ),
    )
  }, [])

  /* ══════════════════════════════════════════════════════════════
     SCROLL / HIGHLIGHT
  ══════════════════════════════════════════════════════════════ */
  const scrollToMessage = useCallback((id) => {
    setHighlightedMsg(id)
    setTimeout(() => {
      if (mountedRef.current) setHighlightedMsg(null)
    }, 2500)
  }, [])

  /* ══════════════════════════════════════════════════════════════
     BACKGROUND
  ══════════════════════════════════════════════════════════════ */
  const changeChatBackground = useCallback((bg) => {
    setChatBackground(bg)
    ls.set(LS.BG, bg.id)
  }, [])

  /* ══════════════════════════════════════════════════════════════
     PACKAGE CONTEXT
  ══════════════════════════════════════════════════════════════ */
  const setPackageContext   = useCallback((pkg) => setPackageContextState(pkg), [])
  const clearPackageContext = useCallback(() => setPackageContextState(null), [])
  const getDestinationName  = useCallback(
    () => packageContext?.title || packageContext?.name || '',
    [packageContext],
  )

  /* ══════════════════════════════════════════════════════════════
     CONTEXT VALUE
  ══════════════════════════════════════════════════════════════ */
  const value = useMemo(() => ({
    isOpen, openPortal, closePortal,
    connected, connectionState, adminOnline, registered, sendingMsg,
    messages, filteredMessages,
    sendMessage, editMessage, deleteMessage, reactToMessage,
    isTyping, emitTyping,
    replyingTo, startReply, cancelReply,
    editingMsg, setEditingMsg, cancelEdit,
    forwardingMsg, forwardMessage,
    pinnedMessages, togglePin, showPinned, setShowPinned,
    highlightedMsg, scrollToMessage,
    searchQuery, searchMessages,
    chatBackground, changeChatBackground,
    packageContext, setPackageContext, clearPackageContext, getDestinationName,
    unreadCount,
    newConversationNotification: notification,
    submitError, setSubmitError,
    // Compat stubs
    loadingData:  false,
    isSubmitted:  false,
    isAnimating:  false,
    displayName:  user?.fullName || user?.name || '',
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
    unreadCount, notification,
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