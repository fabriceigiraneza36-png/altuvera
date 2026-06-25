/**
 * MessagingContext.jsx
 * 
 * SINGLE SOCKET — connects on app mount, stays alive for entire session.
 * Portal open/close is purely visual — no reconnection ever.
 * Supports both plain messages and package-context messages.
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

const genSessionId = () =>
  `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getStoredSession = () => {
  try { return localStorage.getItem(SESSION_KEY) || null } catch { return null }
}
const saveSession = (sid) => {
  try { localStorage.setItem(SESSION_KEY, sid) } catch {}
}

const normalizeMsg = (msg) => ({
  ...msg,
  id:           msg.id,
  body:         msg.body,
  createdAt:    msg.createdAt    || msg.created_at    || new Date().toISOString(),
  senderType:   msg.senderType   || msg.sender_type   || 'user',
  senderName:   msg.senderName   || msg.sender_name   || null,
  senderEmail:  msg.senderEmail  || msg.sender_email  || null,
  senderAvatar: msg.senderAvatar || msg.sender_avatar || null,
  isRead:       msg.isRead !== undefined ? msg.isRead : (msg.is_read || false),
})

export function MessagingProvider({ children }) {
  const { user, isAuthenticated } = useUserAuth()

  // ── Refs that persist across renders ────────────────────────────────
  const socketRef          = useRef(null)
  const typingTimerRef     = useRef(null)
  const disconnectDebounce = useRef(null)
  const mountedRef         = useRef(true)
  const userRef            = useRef(user)
  const hasConnectedRef    = useRef(false)  // true after first connect
  const hasRegisteredRef   = useRef(false)

  // ── State ───────────────────────────────────────────────────────────
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

  // Keep userRef synced
  useEffect(() => { userRef.current = user }, [user])

  // ── Helpers ─────────────────────────────────────────────────────────
  const addMessage = useCallback((msg) => {
    if (!mountedRef.current) return
    const n = normalizeMsg(msg)
    setMessages((prev) => {
      if (prev.some((m) => m.id === n.id)) return prev
      return [...prev, n]
    })
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

  // ══════════════════════════════════════════════════════════════════════
  // CREATE SOCKET — runs ONCE on provider mount, never again
  // ══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    mountedRef.current = true

    // Guard: only create one socket ever
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

    // ── connect ────────────────────────────────────────────────────
    socket.on('connect', () => {
      if (!mountedRef.current) return
      setConnected(true)
      setConnectionState('connected')
      clearTimeout(disconnectDebounce.current)
      registerSession(socket)
    })

    // ── disconnect ─────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      if (!mountedRef.current) return
      setConnected(false)
      hasRegisteredRef.current = false
      setConnectionState(
        reason === 'io server disconnect' ? 'disconnected' : 'reconnecting',
      )
      clearTimeout(disconnectDebounce.current)
      disconnectDebounce.current = setTimeout(() => {
        if (mountedRef.current) setAdminOnline(false)
      }, 5000)
    })

    socket.on('connect_error', () => {
      if (!mountedRef.current) return
      setConnectionState('reconnecting')
    })

    // ── session data ───────────────────────────────────────────────
    socket.on('msg:session', (data) => {
      if (!mountedRef.current) return
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.sessionId) { setSessionId(data.sessionId); saveSession(data.sessionId) }
      if (Array.isArray(data.messages) && data.messages.length > 0)
        setMessages(data.messages.map(normalizeMsg))
      if (typeof data.adminOnline === 'boolean') setAdminOnline(data.adminOnline)
      setRegistered(true)
    })

    // ── incoming message ───────────────────────────────────────────
    socket.on('msg:message', (msg) => {
      if (!mountedRef.current) return
      addMessage(msg)
      if ((msg.senderType || msg.sender_type) === 'admin') {
        setIsTyping(false)
        clearTimeout(typingTimerRef.current)
        // Only count unread when portal is closed
        setIsOpen((open) => {
          if (!open) setUnreadCount((c) => c + 1)
          return open
        })
      }
    })

    // ── typing ─────────────────────────────────────────────────────
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

    // ── read receipts ──────────────────────────────────────────────
    socket.on('msg:read', (data) => {
      if (!mountedRef.current) return
      if ((data.readBy || data.read_by) !== 'admin') return
      setMessages((prev) =>
        prev.map((m) =>
          m.senderType === 'user' && !m.isRead ? { ...m, isRead: true } : m,
        ),
      )
    })

    // ── admin online ───────────────────────────────────────────────
    socket.on('msg:admin-online', (data) => {
      if (!mountedRef.current) return
      setAdminOnline(typeof data === 'object' ? data.online : Boolean(data))
    })
    socket.on('admin:online',  () => mountedRef.current && setAdminOnline(true))
    socket.on('admin:offline', () => mountedRef.current && setAdminOnline(false))

    // ── new conversation ───────────────────────────────────────────
    socket.on('msg:new-conversation', (data) => {
      if (!mountedRef.current) return
      setNotification(data)
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.sessionId) { setSessionId(data.sessionId); saveSession(data.sessionId) }
      setRegistered(true)
      setTimeout(() => { if (mountedRef.current) setNotification(null) }, 5000)
    })

    // ── cleanup: only on full app unmount ──────────────────────────
    return () => {
      mountedRef.current = false
      clearTimeout(typingTimerRef.current)
      clearTimeout(disconnectDebounce.current)
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      hasConnectedRef.current = false
    }
  }, []) // eslint-disable-line — MUST be empty, runs once

  // ── Re-register when user auth changes (no new socket) ─────────
  useEffect(() => {
    const socket = socketRef.current
    if (!socket?.connected) return
    // Re-register with updated user info
    registerSession(socket)
  }, [isAuthenticated, user?.id, registerSession])

  // ══════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════

  /** Open chat portal — optionally with package context */
  const openPortal = useCallback((pkgCtx = null) => {
    if (pkgCtx) setPackageContext(pkgCtx)
    setIsOpen(true)
    setUnreadCount(0)
    setNotification(null)
    // No socket work — it's already connected
  }, [])

  /** Close chat portal — socket stays alive */
  const closePortal = useCallback(() => {
    setIsOpen(false)
    // Socket stays connected, messages persist
  }, [])

  /** Clear package context (go back to plain chat) */
  const clearPackageContext = useCallback(() => {
    setPackageContext(null)
  }, [])

  /** Send a message — works with or without package context */
  const sendMessage = useCallback((body, metadata = {}) => {
    const socket = socketRef.current
    if (!body?.trim() || !socket?.connected) return false

    setSendingMsg(true)
    const sid = getStoredSession() || genSessionId()
    const u   = userRef.current
    const pkg = packageContext

    // Optimistic
    const optId      = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const senderName = u?.fullName || u?.name || metadata.guestName || 'You'

    const optMsg = normalizeMsg({
      id:             optId,
      body:           body.trim(),
      senderType:     'user',
      senderName,
      senderEmail:    u?.email || metadata.guestEmail || null,
      createdAt:      new Date().toISOString(),
      isRead:         false,
      isOptimistic:   true,
      // Only attach package context if it exists
      ...(pkg ? { packageContext: {
        id: pkg.id, title: pkg.title, slug: pkg.slug,
        price: pkg.price, image: pkg.image,
      }} : {}),
    })

    setMessages((prev) => [...prev, optMsg])

    socket.emit('msg:send', {
      body:           body.trim(),
      sessionId:      sid,
      conversationId: conversationId || undefined,
      name:           u?.fullName || u?.name || metadata.guestName || null,
      email:          u?.email    || metadata.guestEmail || null,
      userId:         u?.id       || null,
      metadata: {
        ...metadata,
        // Only include package context if it exists — plain messages have none
        ...(pkg ? {
          packageContext: {
            id: pkg.id, title: pkg.title, slug: pkg.slug,
            price: pkg.price, image: pkg.image,
          },
        } : {}),
      },
    }, (res) => {
      if (!mountedRef.current) return
      setSendingMsg(false)
      if (res?.success && res.message) {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== optId)
            .concat(prev.some((m) => m.id === res.message.id)
              ? [] : [normalizeMsg(res.message)])
        )
        if (res.conversationId && !conversationId)
          setConversationId(res.conversationId)
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optId))
      }
    })

    return true
  }, [conversationId, packageContext])

  /** Emit typing indicator */
  const emitTyping = useCallback((isTypingNow) => {
    const socket = socketRef.current
    if (!socket?.connected || !conversationId) return
    const u = userRef.current
    socket.emit('msg:typing', {
      conversationId,
      isTyping:   isTypingNow,
      senderName: u?.fullName || u?.name || 'Guest',
      senderType: 'user',
    })
  }, [conversationId])

  // ── Context value ──────────────────────────────────────────────────
  const value = useMemo(() => ({
    // State
    connected, connectionState, isOpen, messages,
    conversationId, sessionId, isTyping, adminOnline,
    unreadCount, sendingMsg, registered,
    newConversationNotification: notification,
    packageContext,
    // Actions
    openPortal, closePortal, sendMessage, emitTyping,
    clearPackageContext,
    clearUnread: () => setUnreadCount(0),
  }), [
    connected, connectionState, isOpen, messages,
    conversationId, sessionId, isTyping, adminOnline,
    unreadCount, sendingMsg, registered, notification,
    packageContext, openPortal, closePortal, sendMessage,
    emitTyping, clearPackageContext,
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