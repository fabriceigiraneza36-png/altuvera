/**
 * MessagingContext.jsx v2.0
 *
 * Fixes vs v1:
 * - unreadCount exposed (Navbar uses it)
 * - Single socket.on/off per event (no duplicate listeners)
 * - Registration guarded with ref (no re-register storms)
 * - Socket connects ONLY when portal opens (lazy)
 * - All Navbar-consumed fields present and stable
 */

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef, useMemo,
} from 'react'
import {
  getSocket, connectSocket, disconnectSocket, updateSocketAuth,
} from '../utils/socket'
import { useUserAuth } from './UserAuthContext'

/* ═══════════════════════════════════════════════════════════════
   CHAT BACKGROUNDS
═══════════════════════════════════════════════════════════════ */
export const CHAT_BACKGROUNDS = [
  { id: 'white',     label: 'Clean White',    type: 'solid',    value: '#ffffff' },
  { id: 'soft',      label: 'Soft Green',     type: 'solid',    value: '#f0fdf4' },
  { id: 'mint',      label: 'Mint',           type: 'solid',    value: '#ecfdf5' },
  { id: 'dark',      label: 'Dark Forest',    type: 'solid',    value: '#0a1f14' },
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
    size:  '20px 20px',
  },
  {
    id: 'pattern2',  label: 'Grid',            type: 'pattern',
    value: 'linear-gradient(#16a34a11 1px,transparent 1px),linear-gradient(90deg,#16a34a11 1px,transparent 1px)',
    size:  '24px 24px',
  },
  { id: 'nature1',   label: 'Safari Sand',    type: 'solid',    value: '#fef3c7' },
  {
    id: 'nature2',   label: 'Night Safari',   type: 'gradient',
    value: 'linear-gradient(160deg,#0a1628 0%,#0d2a1c 100%)',
  },
  {
    id: 'blue',      label: 'Ocean',           type: 'gradient',
    value: 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
  },
]

/* ═══════════════════════════════════════════════════════════════
   STORAGE HELPERS
═══════════════════════════════════════════════════════════════ */
const SESSION_KEY = 'altuvera_chat_session_id'
const BG_KEY      = 'altuvera_chat_bg'
const PINNED_KEY  = 'altuvera_chat_pinned'

const ss = {
  get: (k)      => { try { return localStorage.getItem(k) || '' }          catch { return '' } },
  set: (k, v)   => { try { localStorage.setItem(k, v) }                    catch { /* ignore */ } },
  getJSON: (k)  => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } },
  setJSON: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) }  catch { /* ignore */ } },
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE NORMALIZER
═══════════════════════════════════════════════════════════════ */
const normalizeMsg = (raw) => {
  if (!raw) return null
  return {
    id:             raw.id,
    body:           raw.body            || '',
    senderType:     raw.senderType      || raw.sender_type      || 'user',
    senderName:     raw.senderName      || raw.sender_name      || '',
    senderEmail:    raw.senderEmail     || raw.sender_email     || null,
    senderAvatar:   raw.senderAvatar    || raw.sender_avatar    || null,
    isRead:         raw.isRead          ?? raw.is_read          ?? false,
    isEdited:       raw.isEdited        ?? raw.edited           ?? false,
    isDeleted:      raw.isDeleted       ?? raw.deleted          ?? false,
    isPinned:       raw.isPinned        ?? false,
    isOptimistic:   raw.isOptimistic    ?? false,
    reactions:      raw.reactions       || {},
    metadata:       raw.metadata        || {},
    replyTo:        raw.replyTo         || raw.reply_to         || raw.metadata?.replyTo       || null,
    forwardedFrom:  raw.forwardedFrom   || raw.forwarded_from   || raw.metadata?.forwardedFrom || null,
    packageContext: raw.packageContext  || raw.package_context  || raw.metadata?.packageContext || null,
    createdAt:      raw.createdAt       || raw.created_at       || new Date().toISOString(),
  }
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT
═══════════════════════════════════════════════════════════════ */
const MessagingContext = createContext(null)

export const useMessaging = () => {
  const ctx = useContext(MessagingContext)
  if (!ctx) throw new Error('useMessaging must be inside MessagingProvider')
  return ctx
}

/* ═══════════════════════════════════════════════════════════════
   PROVIDER
═══════════════════════════════════════════════════════════════ */
export function MessagingProvider({ children }) {
  const { user, token } = useUserAuth()

  /* ── Portal ─────────────────────────────────────────────── */
  const [isOpen,   setIsOpen]   = useState(false)

  /* ── Connection ─────────────────────────────────────────── */
  const [connected,       setConnected]       = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [adminOnline,     setAdminOnline]     = useState(false)
  const [registered,      setRegistered]      = useState(false)
  const [sendingMsg,      setSendingMsg]      = useState(false)

  /* ── Messages ───────────────────────────────────────────── */
  const [messages,          setMessages]          = useState([])
  const [filteredMessages,  setFilteredMessages]  = useState([])
  const [isTyping,          setIsTyping]          = useState(false)
  const [unreadCount,       setUnreadCount]       = useState(0)

  /* ── Notification badge (for Navbar) ────────────────────── */
  const [newConversationNotification, setNewConversationNotification] = useState(false)

  /* ── Search ─────────────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState('')

  /* ── Interaction state ──────────────────────────────────── */
  const [replyingTo,    setReplyingTo]    = useState(null)
  const [editingMsg,    setEditingMsg]    = useState(null)
  const [forwardingMsg, setForwardingMsg] = useState(null)
  const [highlightedMsg,setHighlightedMsg]= useState(null)
  const [submitError,   setSubmitError]   = useState(null)
  const submitRetryCount = useRef(0)

  /* ── Pinned ─────────────────────────────────────────────── */
  const [pinnedMessages, setPinnedMessages] = useState(() => ss.getJSON(PINNED_KEY))
  const [showPinned,     setShowPinned]     = useState(false)

  /* ── Background ─────────────────────────────────────────── */
  const [chatBackground, setChatBackground] = useState(() => {
    const saved = ss.get(BG_KEY)
    return CHAT_BACKGROUNDS.find(b => b.id === saved) || CHAT_BACKGROUNDS[0]
  })

  /* ── Package context ────────────────────────────────────── */
  const [packageContext, setPackageContext] = useState(null)

  /* ── Stable refs ────────────────────────────────────────── */
  const sessionIdRef    = useRef(ss.get(SESSION_KEY))
  const convIdRef       = useRef(null)
  const registeredRef   = useRef(false)
  const isOpenRef       = useRef(false)
  const mountedRef      = useRef(true)
  const typingTimerRef  = useRef(null)
  const registerTimerRef= useRef(null)
  const userRef         = useRef(user)

  /* Keep userRef current */
  useEffect(() => { userRef.current = user }, [user])

  /* Keep isOpenRef current */
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])

  /* Cleanup on unmount */
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearTimeout(typingTimerRef.current)
      clearTimeout(registerTimerRef.current)
    }
  }, [])

  /* ── Update unreadCount from messages ────────────────────── */
  useEffect(() => {
    const count = messages.filter(
      m => m.senderType !== 'user' && !m.isRead && !m.isDeleted
    ).length
    setUnreadCount(count)

    /* Badge for Navbar */
    if (count > 0 && !isOpenRef.current) {
      setNewConversationNotification(true)
    }
  }, [messages])

  /* ═══════════════════════════════════════════════════════════
     SOCKET SETUP — single effect, single socket
  ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const socket = getSocket()

    /* ── Helpers ── */
    const safe = (fn) => (...args) => {
      if (mountedRef.current) fn(...args)
    }

    /* ── Handlers ── */
    const onConnect = safe(() => {
      setConnected(true)
      setConnectionState('connected')
    })

    const onDisconnect = safe((reason) => {
      setConnected(false)
      setConnectionState(
        reason === 'io server disconnect' ? 'disconnected' : 'reconnecting'
      )
      setAdminOnline(false)
      /*
       * Don't reset registeredRef here — we'll check on reconnect
       * so that we don't spam register calls.
       */
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
       * Server may have dropped the session — re-register
       * only if the portal is open.
       */
      registeredRef.current = false
      if (isOpenRef.current) scheduleRegister(600)
    })

    const onAdminOnline = safe((data) => {
      setAdminOnline(Boolean(data?.online ?? data?.isOnline))
    })

    const onSession = safe((data) => {
      if (!data) return
      if (data.sessionId) {
        sessionIdRef.current = data.sessionId
        ss.set(SESSION_KEY, data.sessionId)
      }
      if (data.conversationId) convIdRef.current = data.conversationId
      if (Array.isArray(data.messages)) {
        setMessages(data.messages.map(normalizeMsg).filter(Boolean))
      }
      setAdminOnline(Boolean(data.adminOnline))
      setRegistered(true)
      registeredRef.current = true
    })

    const onMessage = safe((raw) => {
      if (!raw) return
      const msg = normalizeMsg(raw)
      if (!msg) return

      setMessages(prev => {
        /* Replace matching optimistic message */
        const optIdx = prev.findIndex(
          m => m.isOptimistic &&
               m.body === msg.body &&
               m.senderType === msg.senderType
        )
        if (optIdx !== -1) {
          const next = [...prev]
          next[optIdx] = msg
          return next
        }
        /* Deduplicate by id */
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })

      /* Unread bump for non-user messages when portal closed */
      if (msg.senderType !== 'user' && !isOpenRef.current) {
        setNewConversationNotification(true)
      }
    })

    const onTyping = safe((data) => {
      if (data?.senderType !== 'user') {
        /* Admin is typing — show indicator */
        setIsTyping(Boolean(data?.isTyping))
        clearTimeout(typingTimerRef.current)
        if (data?.isTyping) {
          typingTimerRef.current = setTimeout(() => {
            if (mountedRef.current) setIsTyping(false)
          }, 5_000)
        }
      }
    })

    const onRead = safe((data) => {
      if (!data?.conversationId) return
      setMessages(prev =>
        prev.map(m => ({
          ...m,
          isRead: data.readBy === 'admin' && m.senderType === 'user'
            ? true
            : m.isRead,
        }))
      )
    })

    /* ── Attach listeners ── */
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

    /* Legacy chat protocol fallback */
    socket.on('chat:session',         onSession)
    socket.on('chat:message',         onMessage)
    socket.on('chat:typing',          onTyping)

    /* ── Connect only if open OR already connected ── */
    if (socket.connected) {
      setConnected(true)
      setConnectionState('connected')
    }
    /* Socket connects lazily when portal opens (see openPortal) */

    /* ── Cleanup — remove only OUR listeners ── */
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

      socket.off('chat:session',         onSession)
      socket.off('chat:message',         onMessage)
      socket.off('chat:typing',          onTyping)
    }
  }, []) // ← EMPTY DEPS — runs once, singleton socket

  /* ── Update socket auth when token changes ─────────────── */
  useEffect(() => {
    if (token) updateSocketAuth(token)
  }, [token])

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

      const u    = userRef.current
      const sid  = sessionIdRef.current || undefined
      const name = u?.fullName || u?.name || ''
      const email= u?.email    || ''

      socket.emit(
        'msg:register',
        { sessionId: sid, name, email },
        (res) => {
          if (!mountedRef.current) return
          if (!res?.success) return

          if (res.sessionId) {
            sessionIdRef.current = res.sessionId
            ss.set(SESSION_KEY, res.sessionId)
          }
          if (res.conversationId) convIdRef.current = res.conversationId
          if (Array.isArray(res.messages)) {
            setMessages(res.messages.map(normalizeMsg).filter(Boolean))
          }
          setAdminOnline(Boolean(res.adminOnline))
          setRegistered(true)
          registeredRef.current = true
        }
      )
    }, delayMs)
  }, [])

  /* ── Register when portal opens + socket connected ─────── */
  useEffect(() => {
    if (!isOpen)   return
    if (!connected) return
    if (registeredRef.current) return
    scheduleRegister(200)
  }, [isOpen, connected, scheduleRegister])

  /* ── Reset registration when user changes ───────────────── */
  useEffect(() => {
    registeredRef.current = false
    setRegistered(false)
    if (isOpen && connected) scheduleRegister(400)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ═══════════════════════════════════════════════════════════
     PORTAL CONTROLS
  ═══════════════════════════════════════════════════════════ */
  const openPortal = useCallback((pkgCtx = null) => {
    if (pkgCtx) setPackageContext(pkgCtx)
    setIsOpen(true)
    setNewConversationNotification(false)

    /* Connect socket lazily on first open */
    connectSocket(token || undefined)
  }, [token])

  const closePortal = useCallback(() => {
    setIsOpen(false)
  }, [])

  /* ═══════════════════════════════════════════════════════════
     SEND MESSAGE
  ═══════════════════════════════════════════════════════════ */
  const sendMessage = useCallback((body, options = {}) => {
    const text = String(body || '').trim()
    if (!text) return

    const socket = getSocket()
    if (!socket.connected) {
      console.warn('[Messaging] Cannot send — socket not connected')
      return
    }

    /* Optimistic */
    const optId    = `opt-${Date.now()}`
    const u        = userRef.current
    const optimistic = normalizeMsg({
      id:            optId,
      body:          text,
      senderType:    'user',
      senderName:    options.guestName  || u?.fullName || u?.name || 'Guest',
      senderEmail:   options.guestEmail || u?.email    || null,
      isOptimistic:  true,
      isRead:        false,
      createdAt:     new Date().toISOString(),
      metadata: {
        replyTo:        replyingTo    || undefined,
        forwardedFrom:  forwardingMsg || undefined,
        packageContext: packageContext || undefined,
      },
    })

    setMessages(prev => [...prev, optimistic])
    setSendingMsg(true)
    setReplyingTo(null)
    setForwardingMsg(null)

    socket.emit(
      'msg:send',
      {
        body:      text,
        sessionId: sessionIdRef.current || undefined,
        name:      options.guestName  || u?.fullName || u?.name || 'Guest',
        email:     options.guestEmail || u?.email    || null,
        metadata:  optimistic.metadata,
      },
      (res) => {
        setSendingMsg(false)
        if (!mountedRef.current) return
        if (!res?.success) {
          /* Remove failed optimistic */
          setMessages(prev => prev.filter(m => m.id !== optId))
          setSubmitError(res?.error || 'Failed to send message. Please try again.')
        }
      }
    )
  }, [replyingTo, forwardingMsg, packageContext])

  /* ═══════════════════════════════════════════════════════════
     TYPING EMIT
  ═══════════════════════════════════════════════════════════ */
  const emitTyping = useCallback((isTypingNow) => {
    const socket = getSocket()
    if (!socket.connected) return
    socket.emit('msg:typing', {
      conversationId: convIdRef.current   || undefined,
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
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, body: body.trim(), isEdited: true } : m)
    )
    setEditingMsg(null)
  }, [])

  const deleteMessage = useCallback((id) => {
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, isDeleted: true, body: '' } : m)
    )
  }, [])

  const reactToMessage = useCallback((msgId, emoji) => {
    const uid = userRef.current?.id || 'guest'
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== msgId) return m
        const reactions   = { ...(m.reactions || {}) }
        const cur         = reactions[emoji] || { count: 0, users: [] }
        const hasReacted  = cur.users?.includes(uid)
        reactions[emoji]  = {
          count: hasReacted ? Math.max(0, cur.count - 1) : cur.count + 1,
          users: hasReacted
            ? cur.users.filter(u => u !== uid)
            : [...(cur.users || []), uid],
        }
        return { ...m, reactions }
      })
    )
  }, [])

  /* ═══════════════════════════════════════════════════════════
     REPLY / FORWARD / EDIT CONTROLS
  ═══════════════════════════════════════════════════════════ */
  const startReply     = useCallback((msg) => { setReplyingTo(msg); setForwardingMsg(null); setEditingMsg(null) }, [])
  const cancelReply    = useCallback(() => setReplyingTo(null), [])
  const cancelEdit     = useCallback(() => setEditingMsg(null), [])

  const forwardMessage = useCallback((msg) => {
    if (!msg) { setForwardingMsg(null); return }
    setForwardingMsg(msg)
    setReplyingTo(null)
  }, [])

  /* ═══════════════════════════════════════════════════════════
     PIN
  ═══════════════════════════════════════════════════════════ */
  const togglePin = useCallback((msg) => {
    setPinnedMessages(prev => {
      const exists = prev.some(p => p.id === msg.id)
      const next   = exists ? prev.filter(p => p.id !== msg.id) : [...prev, msg]
      ss.setJSON(PINNED_KEY, next)
      return next
    })
    setMessages(prev =>
      prev.map(m => m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m)
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
      messages.filter(m =>
        m.body?.toLowerCase().includes(lower) ||
        m.senderName?.toLowerCase().includes(lower)
      )
    )
  }, [messages])

  /* ═══════════════════════════════════════════════════════════
     SCROLL TO
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
    ss.set(BG_KEY, bg.id)
  }, [])

  /* ═══════════════════════════════════════════════════════════
     PACKAGE CONTEXT
  ═══════════════════════════════════════════════════════════ */
  const clearPackageContext = useCallback(() => setPackageContext(null), [])

  /* ═══════════════════════════════════════════════════════════
     CONTEXT VALUE
  ═══════════════════════════════════════════════════════════ */
  const value = useMemo(() => ({
    /* ── Portal ── */
    isOpen, openPortal, closePortal,

    /* ── Connection ── */
    connected, connectionState, adminOnline, registered, sendingMsg,

    /* ── Messages ── */
    messages, filteredMessages,
    sendMessage, editMessage, deleteMessage, reactToMessage,

    /* ── Typing ── */
    isTyping, emitTyping,

    /* ── Reply / Edit / Forward ── */
    replyingTo, startReply, cancelReply,
    editingMsg, setEditingMsg, cancelEdit,
    forwardingMsg, forwardMessage,

    /* ── Pin ── */
    pinnedMessages, togglePin, showPinned, setShowPinned,

    /* ── Scroll/highlight ── */
    highlightedMsg, scrollToMessage,

    /* ── Search ── */
    searchQuery, searchMessages, filteredMessages,

    /* ── Background ── */
    chatBackground, changeChatBackground,

    /* ── Package ── */
    packageContext, setPackageContext, clearPackageContext,

    /* ── Unread / notifications (Navbar uses these) ── */
    unreadCount,
    newConversationNotification,

    /* ── Error ── */
    submitError, setSubmitError,
    submitRetryCount: submitRetryCount.current,

    /* ── Compat stubs ── */
    loadingData:  false,
    isSubmitted:  false,
    isAnimating:  false,
    displayName:  user?.fullName || user?.name || '',

    /* ── CHAT_BACKGROUNDS for picker ── */
    CHAT_BACKGROUNDS,
  }), [
    isOpen, openPortal, closePortal,
    connected, connectionState, adminOnline, registered, sendingMsg,
    messages, filteredMessages, sendMessage, editMessage, deleteMessage, reactToMessage,
    isTyping, emitTyping,
    replyingTo, startReply, cancelReply,
    editingMsg, cancelEdit,
    forwardingMsg, forwardMessage,
    pinnedMessages, togglePin, showPinned,
    highlightedMsg, scrollToMessage,
    searchQuery, searchMessages,
    chatBackground, changeChatBackground,
    packageContext, clearPackageContext,
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