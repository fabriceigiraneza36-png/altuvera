/**
 * MessagingContext.jsx
 * Single persistent socket — connects once, stays alive across portal open/close
 * Reconnects automatically on disconnect, never creates duplicate sockets
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
  try { return localStorage.getItem(SESSION_KEY) || null }
  catch { return null }
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

  /* ── Refs — persist across renders without causing re-mount ── */
  const socketRef            = useRef(null)   // THE single socket
  const socketIdRef          = useRef(null)   // track socket.id for logging
  const typingTimerRef       = useRef(null)
  const disconnectDebounce   = useRef(null)
  const hasRegisteredRef     = useRef(false)
  const isConnectingRef      = useRef(false)
  const mountedRef           = useRef(true)
  const userRef              = useRef(user)   // track latest user without re-connecting

  /* ── State ── */
  const [connected,                   setConnected]                   = useState(false)
  const [connectionState,             setConnectionState]             = useState('disconnected')
  const [isOpen,                      setIsOpen]                      = useState(false)
  const [messages,                    setMessages]                    = useState([])
  const [conversationId,              setConversationId]              = useState(null)
  const [sessionId,                   setSessionId]                   = useState(() => getStoredSession())
  const [isTyping,                    setIsTyping]                    = useState(false)
  const [adminOnline,                 setAdminOnline]                 = useState(false)
  const [unreadCount,                 setUnreadCount]                 = useState(0)
  const [sendingMsg,                  setSendingMsg]                  = useState(false)
  const [registered,                  setRegistered]                  = useState(false)
  const [newConversationNotification, setNewConversationNotification] = useState(null)
  const [packageContext,              setPackageContext]              = useState(null)

  /* Keep userRef in sync */
  useEffect(() => { userRef.current = user }, [user])

  /* ── Deduplicated message add ── */
  const addMessage = useCallback((msg) => {
    if (!mountedRef.current) return
    const n = normalizeMsg(msg)
    setMessages((prev) => {
      if (prev.some((m) => m.id === n.id)) return prev
      return [...prev, n]
    })
  }, [])

  /* ── Register session (idempotent — safe to call on reconnect) ── */
  const registerSession = useCallback((socket, sid) => {
    if (!socket?.connected) return
    hasRegisteredRef.current = true

    const resolvedSid = sid || sessionId || genSessionId()
    saveSession(resolvedSid)
    setSessionId(resolvedSid)

    const u = userRef.current

    socket.emit('msg:register', {
      sessionId:  resolvedSid,
      userId:     u?.id         || null,
      name:       u?.fullName   || u?.name  || null,
      email:      u?.email      || null,
      guestName:  u?.fullName   || u?.name  || null,
      guestEmail: u?.email      || null,
    }, (res) => {
      if (!res?.success || !mountedRef.current) return
      if (res.conversationId)  setConversationId(res.conversationId)
      if (res.sessionId) {
        setSessionId(res.sessionId)
        saveSession(res.sessionId)
      }
      if (Array.isArray(res.messages) && res.messages.length > 0)
        setMessages(res.messages.map(normalizeMsg))
      if (typeof res.adminOnline === 'boolean') setAdminOnline(res.adminOnline)
      setRegistered(true)
    })
  }, [sessionId])

  /* ══════════════════════════════════════════════════════════════════════
     CONNECT — called ONCE, socket persists for entire app lifetime
     ══════════════════════════════════════════════════════════════════════ */
  const ensureSocket = useCallback(() => {
    // Already connected or connecting — skip
    if (socketRef.current?.connected) return socketRef.current
    if (isConnectingRef.current) return socketRef.current

    // Socket exists but disconnected — reconnect
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect()
      return socketRef.current
    }

    // No socket yet — create ONE
    isConnectingRef.current = true
    setConnectionState('connecting')

    const token =
      localStorage.getItem('altuvera_auth_token') ||
      sessionStorage.getItem('altuvera_auth_token') ||
      localStorage.getItem('token') || null

    const u = userRef.current

    const socket = io(SOCKET_URL, {
      auth:                 { token },
      transports:           ['polling', 'websocket'],
      reconnection:         true,
      reconnectionDelay:    1000,
      reconnectionDelayMax: 8000,
      reconnectionAttempts: Infinity,  // never give up
      timeout:              15000,
      withCredentials:      true,
      query:                u?.id ? { userId: u.id } : {},
    })

    /* ── Socket events — attached ONCE ── */

    socket.on('connect', () => {
      if (!mountedRef.current) return
      isConnectingRef.current = false
      socketIdRef.current = socket.id
      setConnected(true)
      setConnectionState('connected')
      clearTimeout(disconnectDebounce.current)

      // Always re-register on connect/reconnect (idempotent)
      const sid = getStoredSession() || genSessionId()
      registerSession(socket, sid)
    })

    socket.on('disconnect', (reason) => {
      if (!mountedRef.current) return
      isConnectingRef.current = false
      setConnected(false)
      hasRegisteredRef.current = false
      setConnectionState(
        reason === 'io server disconnect' ? 'disconnected' : 'reconnecting',
      )
      clearTimeout(disconnectDebounce.current)
      disconnectDebounce.current = setTimeout(() => {
        if (mountedRef.current) setAdminOnline(false)
      }, 4000)
    })

    socket.on('connect_error', () => {
      if (!mountedRef.current) return
      isConnectingRef.current = false
      setConnectionState('reconnecting')
    })

    /* Session data (from server on register) */
    socket.on('msg:session', (data) => {
      if (!mountedRef.current) return
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.sessionId) { setSessionId(data.sessionId); saveSession(data.sessionId) }
      if (Array.isArray(data.messages) && data.messages.length > 0)
        setMessages(data.messages.map(normalizeMsg))
      if (typeof data.adminOnline === 'boolean') setAdminOnline(data.adminOnline)
      setRegistered(true)
    })

    /* Incoming message */
    socket.on('msg:message', (msg) => {
      if (!mountedRef.current) return
      addMessage(msg)
      const type = msg.senderType || msg.sender_type
      if (type === 'admin') {
        setIsTyping(false)
        clearTimeout(typingTimerRef.current)
        // Increment unread only if portal is closed
        setIsOpen((open) => {
          if (!open) setUnreadCount((c) => c + 1)
          return open
        })
      }
    })

    /* Typing */
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

    /* Read receipts */
    socket.on('msg:read', (data) => {
      if (!mountedRef.current) return
      if ((data.readBy || data.read_by) !== 'admin') return
      setMessages((prev) =>
        prev.map((m) =>
          m.senderType === 'user' && !m.isRead
            ? { ...m, isRead: true }
            : m,
        ),
      )
    })

    /* Admin online/offline */
    socket.on('msg:admin-online', (data) => {
      if (!mountedRef.current) return
      setAdminOnline(typeof data === 'object' ? data.online : Boolean(data))
    })
    socket.on('admin:online',  () => mountedRef.current && setAdminOnline(true))
    socket.on('admin:offline', () => mountedRef.current && setAdminOnline(false))

    /* New conversation notification */
    socket.on('msg:new-conversation', (data) => {
      if (!mountedRef.current) return
      setNewConversationNotification(data)
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.sessionId) { setSessionId(data.sessionId); saveSession(data.sessionId) }
      setRegistered(true)
      setTimeout(() => {
        if (mountedRef.current) setNewConversationNotification(null)
      }, 5000)
    })

    /* Conversation status changes */
    socket.on('msg:conversation-updated', () => { /* handle if needed */ })

    socketRef.current = socket
    return socket
  }, [addMessage, registerSession])

  /* ── Connect on mount — ONCE ── */
  useEffect(() => {
    mountedRef.current = true
    ensureSocket()

    return () => {
      mountedRef.current = false
      clearTimeout(typingTimerRef.current)
      clearTimeout(disconnectDebounce.current)
      // Don't disconnect on unmount — let socket persist
      // It will auto-disconnect when tab closes
    }
  }, []) // eslint-disable-line — intentionally empty deps

  /* ── Re-register when user logs in/out (without reconnecting socket) ── */
  useEffect(() => {
    if (!isAuthenticated) return
    const socket = socketRef.current
    if (socket?.connected && !hasRegisteredRef.current) {
      const sid = getStoredSession() || genSessionId()
      registerSession(socket, sid)
    } else if (socket?.connected) {
      // User changed (e.g. logged in) — re-register with new user info
      const sid = getStoredSession() || genSessionId()
      registerSession(socket, sid)
    }
  }, [isAuthenticated, registerSession])

  /* ── Open portal — reuses existing socket, never creates new one ── */
  const openPortal = useCallback((pkgCtx = null) => {
    if (pkgCtx) setPackageContext(pkgCtx)
    setIsOpen(true)
    setUnreadCount(0)
    setNewConversationNotification(null)

    // Ensure socket is connected (reconnect if needed, but never duplicate)
    const socket = socketRef.current
    if (socket && !socket.connected) {
      socket.connect()
    } else if (!socket) {
      ensureSocket()
    }
  }, [ensureSocket])

  const closePortal = useCallback(() => {
    setIsOpen(false)
    // Socket stays alive — no disconnect on close
  }, [])

  const clearPackageContext = useCallback(() => setPackageContext(null), [])

  /* ── Send message ── */
  const sendMessage = useCallback((body, metadata = {}) => {
    const socket = socketRef.current
    if (!body?.trim() || !socket?.connected) return false

    setSendingMsg(true)
    const sid = getStoredSession() || genSessionId()
    const u   = userRef.current

    // Optimistic message
    const optimisticId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const senderName   = u?.fullName || u?.name || metadata.guestName || 'You'
    const optimisticMsg = normalizeMsg({
      id:           optimisticId,
      body:         body.trim(),
      senderType:   'user',
      senderName,
      senderEmail:  u?.email || metadata.guestEmail || null,
      createdAt:    new Date().toISOString(),
      isRead:       false,
      isOptimistic: true,
      packageContext: packageContext || undefined,
    })
    setMessages((prev) => [...prev, optimisticMsg])

    socket.emit('msg:send', {
      body:           body.trim(),
      sessionId:      sid,
      conversationId: conversationId || undefined,
      name:           u?.fullName || u?.name || metadata.guestName || null,
      email:          u?.email    || metadata.guestEmail || null,
      userId:         u?.id       || null,
      metadata: {
        ...metadata,
        packageContext: packageContext
          ? {
              id:    packageContext.id,
              title: packageContext.title,
              slug:  packageContext.slug,
              price: packageContext.price,
              image: packageContext.image,
            }
          : undefined,
      },
    }, (res) => {
      if (!mountedRef.current) return
      setSendingMsg(false)
      if (res?.success && res.message) {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== optimisticId)
            .concat(
              prev.some((m) => m.id === res.message.id)
                ? []
                : [normalizeMsg(res.message)],
            ),
        )
        if (res.conversationId && !conversationId)
          setConversationId(res.conversationId)
      } else {
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      }
    })

    return true
  }, [conversationId, packageContext])

  /* ── Typing emitter ── */
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

  /* ── Context value ── */
  const value = useMemo(() => ({
    connected, connectionState, isOpen, messages,
    conversationId, sessionId, isTyping, adminOnline,
    unreadCount, sendingMsg, registered,
    newConversationNotification, packageContext,
    openPortal, closePortal, sendMessage, emitTyping,
    clearPackageContext,
    clearUnread: () => setUnreadCount(0),
  }), [
    connected, connectionState, isOpen, messages,
    conversationId, sessionId, isTyping, adminOnline,
    unreadCount, sendingMsg, registered,
    newConversationNotification, packageContext,
    openPortal, closePortal, sendMessage, emitTyping,
    clearPackageContext,
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