/**
 * MessagingContext.jsx
 *
 * SINGLE SOCKET — connects on app mount, stays alive for entire session.
 * Features: reply, forward, edit, delete, pin, reactions, read receipts,
 * typing indicators, background themes, and more.
 */

import React, {
  createContext, useContext, useEffect, useRef,
  useState, useCallback, useMemo,
} from 'react'
import { io } from 'socket.io-client'
import { useUserAuth } from './UserAuthContext'

const MessagingContext = createContext(null)

const SOCKET_URL  = import.meta.env.VITE_SOCKET_URL || 'https://backend-jd8f.onrender.com'
const SESSION_KEY = 'altuvera_msg_session'
const BG_KEY      = 'altuvera_chat_bg'
const PINS_KEY    = 'altuvera_chat_pins'

/* ── Session helpers ────────────────────────────────────────────────────── */
const genSessionId  = () => `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const getStoredSession = () => { try { return localStorage.getItem(SESSION_KEY) || null } catch { return null } }
const saveSession   = (sid) => { try { localStorage.setItem(SESSION_KEY, sid) } catch {} }
const getStoredBg   = () => { try { return JSON.parse(localStorage.getItem(BG_KEY) || 'null') } catch { return null } }
const saveBg        = (bg) => { try { localStorage.setItem(BG_KEY, JSON.stringify(bg)) } catch {} }
const getStoredPins = () => { try { return JSON.parse(localStorage.getItem(PINS_KEY) || '[]') } catch { return [] } }
const savePins      = (pins) => { try { localStorage.setItem(PINS_KEY, JSON.stringify(pins)) } catch {} }

/* ── Normalize message ──────────────────────────────────────────────────── */
const normalizeMsg = (msg) => ({
  ...msg,
  id:             msg.id,
  body:           msg.body,
  createdAt:      msg.createdAt    || msg.created_at    || new Date().toISOString(),
  updatedAt:      msg.updatedAt    || msg.updated_at    || null,
  senderType:     msg.senderType   || msg.sender_type   || 'user',
  senderName:     msg.senderName   || msg.sender_name   || null,
  senderEmail:    msg.senderEmail  || msg.sender_email  || null,
  senderAvatar:   msg.senderAvatar || msg.sender_avatar || null,
  isRead:         msg.isRead !== undefined ? msg.isRead : (msg.is_read || false),
  isEdited:       msg.isEdited     || msg.is_edited     || false,
  isDeleted:      msg.isDeleted    || msg.is_deleted    || false,
  isPinned:       msg.isPinned     || msg.is_pinned     || false,
  replyTo:        msg.replyTo      || msg.reply_to      || null,
  reactions:      msg.reactions    || {},
  forwardedFrom:  msg.forwardedFrom || msg.forwarded_from || null,
  metadata:       msg.metadata     || {},
})

/* ── Chat background presets ────────────────────────────────────────────── */
export const CHAT_BACKGROUNDS = [
  { id: 'default',    label: 'Default',       type: 'solid',    value: '#f0fdf4' },
  { id: 'white',      label: 'Clean White',   type: 'solid',    value: '#ffffff' },
  { id: 'dark',       label: 'Dark Forest',   type: 'solid',    value: '#052e16' },
  { id: 'gradient1',  label: 'Emerald Mist',  type: 'gradient', value: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)' },
  { id: 'gradient2',  label: 'Deep Ocean',    type: 'gradient', value: 'linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)' },
  { id: 'gradient3',  label: 'Sunrise',       type: 'gradient', value: 'linear-gradient(135deg,#fefce8 0%,#fef9c3 50%,#fef08a 100%)' },
  { id: 'pattern1',   label: 'Leaf Pattern',  type: 'pattern',  value: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2316a34a\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M20 20c0-11 9-20 20-20v20H20z\'/%3E%3C/g%3E%3C/svg%3E"),linear-gradient(135deg,#f0fdf4,#ecfdf5)' },
  { id: 'pattern2',   label: 'Dots',          type: 'pattern',  value: 'radial-gradient(circle,#16a34a 1px,transparent 1px),#f0fdf4', size: '20px 20px' },
  { id: 'pattern3',   label: 'Waves',         type: 'pattern',  value: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'20\'%3E%3Cpath d=\'M0 10c25-20 75 20 100 0\' stroke=\'%2316a34a\' stroke-opacity=\'0.1\' fill=\'none\' stroke-width=\'2\'/%3E%3C/svg%3E"),#ffffff' },
  { id: 'nature1',    label: 'Safari Tan',    type: 'solid',    value: '#fef3c7' },
  { id: 'nature2',    label: 'Twilight',      type: 'gradient', value: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1d4ed8 100%)' },
]

/* ══════════════════════════════════════════════════════════════════════════
   PROVIDER
   ══════════════════════════════════════════════════════════════════════════ */
export function MessagingProvider({ children }) {
  const { user, isAuthenticated } = useUserAuth()

  /* ── Refs ─────────────────────────────────────────────────────────────── */
  const socketRef          = useRef(null)
  const typingTimerRef     = useRef(null)
  const typingEmitRef      = useRef(false)
  const typingEmitTimer    = useRef(null)
  const disconnectDebounce = useRef(null)
  const mountedRef         = useRef(true)
  const userRef            = useRef(user)
  const hasConnectedRef    = useRef(false)
  const hasRegisteredRef   = useRef(false)

  /* ── State ────────────────────────────────────────────────────────────── */
  const [connected,       setConnected]       = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [isOpen,          setIsOpen]          = useState(false)
  const [messages,        setMessages]        = useState([])
  const [conversationId,  setConversationId]  = useState(null)
  const [sessionId,       setSessionId]       = useState(() => getStoredSession())
  const [isTyping,        setIsTyping]        = useState(false)
  const [adminOnline,     setAdminOnline]     = useState(false)
  const [unreadCount,     setUnreadCount]     = useState(0)
  const [sendingMsg,      setSendingMsg]      = useState(false)
  const [registered,      setRegistered]      = useState(false)
  const [notification,    setNotification]    = useState(null)
  const [packageContext,  setPackageContext]  = useState(null)

  /* ── New feature state ────────────────────────────────────────────────── */
  const [replyingTo,      setReplyingTo]      = useState(null)   // { id, body, senderName }
  const [editingMsg,      setEditingMsg]      = useState(null)   // { id, body }
  const [forwardingMsg,   setForwardingMsg]   = useState(null)   // message object
  const [pinnedMessages,  setPinnedMessages]  = useState(() => getStoredPins())
  const [chatBackground,  setChatBackground]  = useState(() => getStoredBg() || CHAT_BACKGROUNDS[0])
  const [showPinned,      setShowPinned]      = useState(false)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [highlightedMsg,  setHighlightedMsg]  = useState(null)

  /* Keep userRef synced */
  useEffect(() => { userRef.current = user }, [user])

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const addMessage = useCallback((msg) => {
    if (!mountedRef.current) return
    const n = normalizeMsg(msg)
    setMessages((prev) => {
      if (prev.some((m) => m.id === n.id)) return prev
      return [...prev, n]
    })
  }, [])

  const updateMessage = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    )
  }, [])

  const registerSession = useCallback((socket) => {
    if (!socket?.connected) return
    hasRegisteredRef.current = true
    const sid = getStoredSession() || genSessionId()
    saveSession(sid)
    setSessionId(sid)
    const u = userRef.current
    socket.emit('msg:register', {
      sessionId:  sid,
      userId:     u?.id       || null,
      name:       u?.fullName || u?.name || null,
      email:      u?.email    || null,
      guestName:  u?.fullName || u?.name || null,
      guestEmail: u?.email    || null,
    }, (res) => {
      if (!res?.success || !mountedRef.current) return
      if (res.conversationId) setConversationId(res.conversationId)
      if (res.sessionId) { setSessionId(res.sessionId); saveSession(res.sessionId) }
      if (Array.isArray(res.messages) && res.messages.length > 0)
        setMessages(res.messages.map(normalizeMsg))
      if (typeof res.adminOnline === 'boolean') setAdminOnline(res.adminOnline)
      setRegistered(true)
    })
  }, [])

  /* ══════════════════════════════════════════════════════════════════════
     SOCKET — created ONCE
     ══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    mountedRef.current = true
    if (hasConnectedRef.current && socketRef.current) return
    hasConnectedRef.current = true

    const token =
      localStorage.getItem('altuvera_auth_token') ||
      sessionStorage.getItem('altuvera_auth_token') ||
      localStorage.getItem('token') || null

    const u = userRef.current
    setConnectionState('connecting')

    const socket = io(SOCKET_URL, {
      auth:                 { token },
      transports:           ['polling', 'websocket'],
      reconnection:         true,
      reconnectionDelay:    1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout:              20000,
      withCredentials:      true,
      query:                u?.id ? { userId: u.id } : {},
    })

    socketRef.current = socket

    socket.on('connect', () => {
      if (!mountedRef.current) return
      setConnected(true)
      setConnectionState('connected')
      clearTimeout(disconnectDebounce.current)
      registerSession(socket)
    })

    socket.on('disconnect', (reason) => {
      if (!mountedRef.current) return
      setConnected(false)
      hasRegisteredRef.current = false
      setConnectionState(reason === 'io server disconnect' ? 'disconnected' : 'reconnecting')
      clearTimeout(disconnectDebounce.current)
      disconnectDebounce.current = setTimeout(() => {
        if (mountedRef.current) setAdminOnline(false)
      }, 5000)
    })

    socket.on('connect_error', () => {
      if (!mountedRef.current) return
      setConnectionState('reconnecting')
    })

    socket.on('msg:session', (data) => {
      if (!mountedRef.current) return
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.sessionId) { setSessionId(data.sessionId); saveSession(data.sessionId) }
      if (Array.isArray(data.messages) && data.messages.length > 0)
        setMessages(data.messages.map(normalizeMsg))
      if (typeof data.adminOnline === 'boolean') setAdminOnline(data.adminOnline)
      setRegistered(true)
    })

    socket.on('msg:message', (msg) => {
      if (!mountedRef.current) return
      addMessage(msg)
      if ((msg.senderType || msg.sender_type) === 'admin') {
        setIsTyping(false)
        clearTimeout(typingTimerRef.current)
        setIsOpen((open) => {
          if (!open) setUnreadCount((c) => c + 1)
          return open
        })
      }
    })

    /* ── Edit ─────────────────────────────────────────────────────────── */
    socket.on('msg:edited', (data) => {
      if (!mountedRef.current) return
      updateMessage(data.id, {
        body:      data.body,
        isEdited:  true,
        updatedAt: data.updatedAt || new Date().toISOString(),
      })
    })

    /* ── Delete ───────────────────────────────────────────────────────── */
    socket.on('msg:deleted', (data) => {
      if (!mountedRef.current) return
      updateMessage(data.id, { isDeleted: true, body: 'This message was deleted.' })
    })

    /* ── Reaction ─────────────────────────────────────────────────────── */
    socket.on('msg:reaction', (data) => {
      if (!mountedRef.current) return
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, reactions: data.reactions || {} }
            : m
        )
      )
    })

    /* ── Pin ──────────────────────────────────────────────────────────── */
    socket.on('msg:pinned', (data) => {
      if (!mountedRef.current) return
      updateMessage(data.id, { isPinned: data.isPinned })
      if (data.isPinned) {
        setPinnedMessages((prev) => {
          const n = [...prev.filter((m) => m.id !== data.id), normalizeMsg(data.message || { id: data.id, ...data })]
          savePins(n)
          return n
        })
      } else {
        setPinnedMessages((prev) => {
          const n = prev.filter((m) => m.id !== data.id)
          savePins(n)
          return n
        })
      }
    })

    /* ── Typing ───────────────────────────────────────────────────────── */
    socket.on('msg:typing', (data) => {
      if (!mountedRef.current) return
      if ((data.senderType || data.sender_type) !== 'admin') return
      setIsTyping(data.isTyping)
      if (data.isTyping) {
        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => {
          if (mountedRef.current) setIsTyping(false)
        }, 6000)
      }
    })

    socket.on('msg:read', (data) => {
      if (!mountedRef.current) return
      if ((data.readBy || data.read_by) !== 'admin') return
      setMessages((prev) =>
        prev.map((m) =>
          m.senderType === 'user' && !m.isRead ? { ...m, isRead: true } : m
        )
      )
    })

    socket.on('msg:admin-online', (data) => {
      if (!mountedRef.current) return
      setAdminOnline(typeof data === 'object' ? data.online : Boolean(data))
    })
    socket.on('admin:online',  () => mountedRef.current && setAdminOnline(true))
    socket.on('admin:offline', () => mountedRef.current && setAdminOnline(false))

    socket.on('msg:new-conversation', (data) => {
      if (!mountedRef.current) return
      setNotification(data)
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.sessionId) { setSessionId(data.sessionId); saveSession(data.sessionId) }
      setRegistered(true)
      setTimeout(() => { if (mountedRef.current) setNotification(null) }, 5000)
    })

    return () => {
      mountedRef.current = false
      clearTimeout(typingTimerRef.current)
      clearTimeout(typingEmitTimer.current)
      clearTimeout(disconnectDebounce.current)
      typingEmitRef.current = false
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      hasConnectedRef.current = false
    }
  }, []) // eslint-disable-line

  /* Re-register on auth change */
  useEffect(() => {
    const socket = socketRef.current
    if (!socket?.connected) return
    registerSession(socket)
  }, [isAuthenticated, user?.id, registerSession])

  /* ══════════════════════════════════════════════════════════════════════
     PUBLIC API
     ══════════════════════════════════════════════════════════════════════ */

  const openPortal = useCallback((pkgCtx = null) => {
    if (pkgCtx) setPackageContext(pkgCtx)
    setIsOpen(true)
    setUnreadCount(0)
    setNotification(null)
  }, [])

  const closePortal = useCallback(() => {
    setIsOpen(false)
    setReplyingTo(null)
    setEditingMsg(null)
    setForwardingMsg(null)
  }, [])

  const clearPackageContext = useCallback(() => setPackageContext(null), [])

  /* ── Send (supports reply, forward, edit) ───────────────────────────── */
  const sendMessage = useCallback((body, metadata = {}) => {
    const socket = socketRef.current
    if (!body?.trim() || !socket?.connected) return false

    setSendingMsg(true)
    const sid = getStoredSession() || genSessionId()
    const u   = userRef.current
    const pkg = packageContext
    const rep = replyingTo
    const fwd = forwardingMsg

    const optId      = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const senderName = u?.fullName || u?.name || metadata.guestName || 'You'

    const optMsg = normalizeMsg({
      id:            optId,
      body:          body.trim(),
      senderType:    'user',
      senderName,
      senderEmail:   u?.email || metadata.guestEmail || null,
      createdAt:     new Date().toISOString(),
      isRead:        false,
      isOptimistic:  true,
      replyTo:       rep || null,
      forwardedFrom: fwd ? { id: fwd.id, body: fwd.body, senderName: fwd.senderName } : null,
      ...(pkg ? { packageContext: { id: pkg.id, title: pkg.title, slug: pkg.slug, price: pkg.price, image: pkg.image } } : {}),
    })

    setMessages((prev) => [...prev, optMsg])
    setReplyingTo(null)
    setForwardingMsg(null)

    socket.emit('msg:send', {
      body:           body.trim(),
      sessionId:      sid,
      conversationId: conversationId || undefined,
      name:           u?.fullName || u?.name || metadata.guestName || null,
      email:          u?.email    || metadata.guestEmail || null,
      userId:         u?.id       || null,
      replyToId:      rep?.id     || null,
      forwardedFromId: fwd?.id   || null,
      metadata: {
        ...metadata,
        ...(pkg ? { packageContext: { id: pkg.id, title: pkg.title, slug: pkg.slug, price: pkg.price, image: pkg.image } } : {}),
        ...(rep ? { replyTo: { id: rep.id, body: rep.body, senderName: rep.senderName } } : {}),
        ...(fwd ? { forwardedFrom: { id: fwd.id, body: fwd.body, senderName: fwd.senderName } } : {}),
      },
    }, (res) => {
      if (!mountedRef.current) return
      setSendingMsg(false)
      if (res?.success && res.message) {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== optId)
            .concat(prev.some((m) => m.id === res.message.id) ? [] : [normalizeMsg(res.message)])
        )
        if (res.conversationId && !conversationId)
          setConversationId(res.conversationId)
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optId))
      }
    })

    return true
  }, [conversationId, packageContext, replyingTo, forwardingMsg])

  /* ── Edit message ───────────────────────────────────────────────────── */
  const editMessage = useCallback((id, newBody) => {
    const socket = socketRef.current
    if (!id || !newBody?.trim() || !socket?.connected) return
    const sid = getStoredSession()
    socket.emit('msg:edit', {
      messageId: id,
      body:      newBody.trim(),
      sessionId: sid,
      conversationId: conversationId || undefined,
    }, (res) => {
      if (!mountedRef.current) return
      if (res?.success) {
        updateMessage(id, { body: newBody.trim(), isEdited: true, updatedAt: new Date().toISOString() })
      }
    })
    setEditingMsg(null)
  }, [conversationId, updateMessage])

  /* ── Delete message ─────────────────────────────────────────────────── */
  const deleteMessage = useCallback((id) => {
    const socket = socketRef.current
    if (!id || !socket?.connected) return
    const sid = getStoredSession()
    socket.emit('msg:delete', {
      messageId:      id,
      sessionId:      sid,
      conversationId: conversationId || undefined,
    }, (res) => {
      if (!mountedRef.current) return
      if (res?.success) {
        updateMessage(id, { isDeleted: true, body: 'This message was deleted.' })
      }
    })
  }, [conversationId, updateMessage])

  /* ── React to message ───────────────────────────────────────────────── */
  const reactToMessage = useCallback((messageId, emoji) => {
    const socket = socketRef.current
    if (!messageId || !emoji || !socket?.connected) return
    const sid = getStoredSession()
    const u   = userRef.current
    const reactorId = u?.id || sid

    // Optimistic
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        const reactions = { ...(m.reactions || {}) }
        const existing  = reactions[emoji] || { count: 0, users: [] }
        const hasReacted = existing.users.includes(reactorId)
        reactions[emoji] = hasReacted
          ? { count: Math.max(0, existing.count - 1), users: existing.users.filter((u) => u !== reactorId) }
          : { count: existing.count + 1, users: [...existing.users, reactorId] }
        if (reactions[emoji].count === 0) delete reactions[emoji]
        return { ...m, reactions }
      })
    )

    socket.emit('msg:react', {
      messageId,
      emoji,
      sessionId:      sid,
      conversationId: conversationId || undefined,
      userId:         u?.id || null,
    })
  }, [conversationId])

  /* ── Pin / unpin ────────────────────────────────────────────────────── */
  const togglePin = useCallback((msg) => {
    const socket = socketRef.current
    const isPinned = !msg.isPinned

    // Optimistic
    updateMessage(msg.id, { isPinned })
    if (isPinned) {
      setPinnedMessages((prev) => {
        const n = [...prev.filter((m) => m.id !== msg.id), { ...msg, isPinned: true }]
        savePins(n)
        return n
      })
    } else {
      setPinnedMessages((prev) => {
        const n = prev.filter((m) => m.id !== msg.id)
        savePins(n)
        return n
      })
    }

    if (socket?.connected) {
      socket.emit('msg:pin', {
        messageId:      msg.id,
        isPinned,
        sessionId:      getStoredSession(),
        conversationId: conversationId || undefined,
      })
    }
  }, [conversationId, updateMessage])

  /* ── Forward ────────────────────────────────────────────────────────── */
  const forwardMessage = useCallback((msg) => {
    setForwardingMsg(msg)
    setReplyingTo(null)
  }, [])

  /* ── Reply ──────────────────────────────────────────────────────────── */
  const startReply = useCallback((msg) => {
    setReplyingTo({ id: msg.id, body: msg.body, senderName: msg.senderName || 'Support' })
    setForwardingMsg(null)
    setEditingMsg(null)
  }, [])

  /* ── Background ─────────────────────────────────────────────────────── */
  const changeChatBackground = useCallback((bg) => {
    setChatBackground(bg)
    saveBg(bg)
  }, [])

  /* ── Search / highlight ─────────────────────────────────────────────── */
  const searchMessages = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  const scrollToMessage = useCallback((id) => {
    setHighlightedMsg(id)
    setTimeout(() => {
      if (mountedRef.current) setHighlightedMsg(null)
    }, 2000)
  }, [])

  /* ── Typing ─────────────────────────────────────────────────────────── */
  const emitTyping = useCallback((isTypingNow) => {
    const socket = socketRef.current
    if (!socket?.connected || !conversationId) return
    const u = userRef.current

    if (isTypingNow) {
      if (typingEmitRef.current) return
      typingEmitRef.current = true
      socket.emit('msg:typing', {
        conversationId,
        isTyping:   true,
        senderName: u?.fullName || u?.name || 'Guest',
        senderType: 'user',
      })
      clearTimeout(typingEmitTimer.current)
      typingEmitTimer.current = setTimeout(() => {
        typingEmitRef.current = false
      }, 2500)
    } else {
      typingEmitRef.current = false
      clearTimeout(typingEmitTimer.current)
      socket.emit('msg:typing', {
        conversationId,
        isTyping:   false,
        senderName: u?.fullName || u?.name || 'Guest',
        senderType: 'user',
      })
    }
  }, [conversationId])

  /* ── Filtered messages for search ───────────────────────────────────── */
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter((m) =>
      (m.body || '').toLowerCase().includes(q) ||
      (m.senderName || '').toLowerCase().includes(q)
    )
  }, [messages, searchQuery])

  /* ── Context value ────────────────────────────────────────────────────── */
  const value = useMemo(() => ({
    // Connection
    connected, connectionState,
    // Portal
    isOpen, openPortal, closePortal,
    // Messages
    messages, filteredMessages, sendMessage, editMessage, deleteMessage,
    reactToMessage, forwardMessage, forwardingMsg,
    // Conversation
    conversationId, sessionId,
    // Typing
    isTyping, emitTyping,
    // Status
    adminOnline, unreadCount, sendingMsg, registered,
    newConversationNotification: notification,
    // Package
    packageContext, clearPackageContext,
    // Reply
    replyingTo, startReply, cancelReply: () => setReplyingTo(null),
    // Edit
    editingMsg, setEditingMsg, editMessage, cancelEdit: () => setEditingMsg(null),
    // Pin
    pinnedMessages, togglePin, showPinned, setShowPinned,
    // Background
    chatBackground, changeChatBackground,
    // Search
    searchQuery, searchMessages,
    highlightedMsg, scrollToMessage,
    // Misc
    clearUnread: () => setUnreadCount(0),
  }), [
    connected, connectionState,
    isOpen, openPortal, closePortal,
    messages, filteredMessages, sendMessage, editMessage, deleteMessage,
    reactToMessage, forwardMessage, forwardingMsg,
    conversationId, sessionId,
    isTyping, emitTyping,
    adminOnline, unreadCount, sendingMsg, registered, notification,
    packageContext, clearPackageContext,
    replyingTo, startReply,
    editingMsg, setEditingMsg,
    pinnedMessages, togglePin, showPinned, setShowPinned,
    chatBackground, changeChatBackground,
    searchQuery, searchMessages,
    highlightedMsg, scrollToMessage,
  ])

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  )
}

export const useMessaging = () => {
  const ctx = useContext(MessagingContext)
  if (!ctx) throw new Error('useMessaging must be inside MessagingProvider')
  return ctx
}