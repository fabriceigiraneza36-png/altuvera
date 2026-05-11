import React, {
  createContext, useContext, useEffect, useRef,
  useState, useCallback, useMemo,
} from 'react'
import { io } from 'socket.io-client'
import { useUserAuth } from './UserAuthContext'

const MessagingContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://backend-jd8f.onrender.com'
const SESSION_KEY = 'altuvera_msg_session'

/* ── helpers ─────────────────────────────────────────────────────────────── */
const genSessionId = () =>
  `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getStoredSession = () => localStorage.getItem(SESSION_KEY) || null
const saveSession = (sid) => localStorage.setItem(SESSION_KEY, sid)

export function MessagingProvider({ children }) {
  const { user, isAuthenticated } = useUserAuth()

  const socketRef     = useRef(null)
  const typingTimer   = useRef(null)
  const reconnectRef  = useRef(null)

  const [connected,        setConnected]        = useState(false)
  const [isOpen,           setIsOpen]           = useState(false)
  const [messages,         setMessages]         = useState([])
  const [conversationId,   setConversationId]   = useState(null)
  const [sessionId,        setSessionId]        = useState(getStoredSession)
  const [isTyping,         setIsTyping]         = useState(false)   // admin typing
  const [adminOnline,      setAdminOnline]      = useState(false)
  const [onlineUsers,      setOnlineUsers]      = useState(new Set())
  const [unreadCount,      setUnreadCount]      = useState(0)
  const [sendingMsg,       setSendingMsg]       = useState(false)
  const [registered,       setRegistered]       = useState(false)
  const [connectionState,  setConnectionState]  = useState('disconnected')
  // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

  /* ── connect socket ──────────────────────────────────────────────────── */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    setConnectionState('connecting')
    const token = localStorage.getItem('altuvera_token') ||
                  localStorage.getItem('token') || null

    const socket = io(SOCKET_URL, {
      auth:         { token },
      transports:   ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 15,
      timeout: 10000,
    })

    socket.on('connect', () => {
      setConnected(true)
      setConnectionState('connected')
      clearTimeout(reconnectRef.current)

      // Re-register session after reconnect
      const sid = sessionId || getStoredSession() || genSessionId()
      registerSession(socket, sid)
    })

    socket.on('disconnect', (reason) => {
      setConnected(false)
      setAdminOnline(false)
      setConnectionState(
        reason === 'io server disconnect' ? 'disconnected' : 'reconnecting'
      )
    })

    socket.on('connect_error', () => {
      setConnectionState('reconnecting')
    })

    /* ── incoming message ── */
    socket.on('msg:message', (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id)
        if (exists) return prev
        return [...prev, msg]
      })
      if (msg.senderType === 'admin') {
        setIsTyping(false)
        if (!isOpen) {
          setUnreadCount((c) => c + 1)
        }
      }
    })

    /* ── session data ── */
    socket.on('msg:session', (data) => {
      if (data.conversationId) setConversationId(data.conversationId)
      if (data.sessionId)      {
        setSessionId(data.sessionId)
        saveSession(data.sessionId)
      }
      if (data.messages?.length) setMessages(data.messages)
      setRegistered(true)
    })

    /* ── typing indicator ── */
    socket.on('msg:typing', (data) => {
      if (data.senderType === 'admin') {
        setIsTyping(data.isTyping)
        if (data.isTyping) {
          clearTimeout(typingTimer.current)
          typingTimer.current = setTimeout(() => setIsTyping(false), 5000)
        }
      }
    })

    /* ── read receipts ── */
    socket.on('msg:read', (data) => {
      if (data.readBy === 'admin') {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderType === 'user' && !m.isRead
              ? { ...m, isRead: true }
              : m
          )
        )
      }
    })

    /* ── online/offline ── */
    socket.on('admin:online', () => setAdminOnline(true))
    socket.on('admin:offline', () => setAdminOnline(false))

    /* ── conversation updated ── */
    socket.on('msg:conversation-updated', (data) => {
      if (data.status === 'closed') {
        // Admin closed the conversation
      }
    })

    socketRef.current = socket
  }, []) // eslint-disable-line

  /* ── register session ─────────────────────────────────────────────────── */
  const registerSession = useCallback((socket, sid) => {
    const resolvedSid = sid || sessionId || genSessionId()
    saveSession(resolvedSid)
    setSessionId(resolvedSid)

    socket.emit('msg:register', {
      sessionId:  resolvedSid,
      name:       user?.fullName || user?.name || null,
      email:      user?.email    || null,
      guestName:  user?.fullName || user?.name || null,
      guestEmail: user?.email    || null,
    }, (res) => {
      if (res?.success) {
        if (res.conversationId) setConversationId(res.conversationId)
        if (res.messages?.length) setMessages(res.messages)
        setRegistered(true)
      }
    })
  }, [sessionId, user])

  /* ── disconnect ─────────────────────────────────────────────────────── */
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
    setConnected(false)
    setRegistered(false)
    setConnectionState('disconnected')
  }, [])

  /* ── open portal ─────────────────────────────────────────────────────── */
  const openPortal = useCallback(() => {
    setIsOpen(true)
    setUnreadCount(0)
    if (!socketRef.current?.connected) connect()
  }, [connect])

  const closePortal = useCallback(() => setIsOpen(false), [])

  /* ── send message ────────────────────────────────────────────────────── */
  const sendMessage = useCallback((body, metadata = {}) => {
    if (!body?.trim() || !socketRef.current?.connected) return false

    setSendingMsg(true)
    const sid = sessionId || getStoredSession() || genSessionId()

    socketRef.current.emit('msg:send', {
      body:       body.trim(),
      sessionId:  sid,
      name:       user?.fullName || user?.name  || null,
      email:      user?.email    || null,
      metadata,
    }, (res) => {
      setSendingMsg(false)
      if (res?.success && res.message) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === res.message.id)
          return exists ? prev : [...prev, res.message]
        })
      }
    })
    return true
  }, [sessionId, user])

  /* ── typing emitter ─────────────────────────────────────────────────── */
  const emitTyping = useCallback((isTypingNow) => {
    if (!socketRef.current?.connected || !conversationId) return
    socketRef.current.emit('msg:typing', {
      conversationId,
      isTyping: isTypingNow,
      senderName: user?.fullName || user?.name || 'Guest',
    })
  }, [conversationId, user])

  /* ── auto-connect when open ─────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen && !socketRef.current?.connected) {
      connect()
    }
  }, [isOpen, connect])

  /* ── reconnect on auth change ─────────────────────────────────────────  */
  useEffect(() => {
    if (isAuthenticated && socketRef.current?.connected) {
      const sid = sessionId || genSessionId()
      registerSession(socketRef.current, sid)
    }
  }, [isAuthenticated]) // eslint-disable-line

  /* ── cleanup ────────────────────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      disconnect()
      clearTimeout(typingTimer.current)
    }
  }, [disconnect])

  const value = useMemo(() => ({
    connected,
    connectionState,
    isOpen,
    messages,
    conversationId,
    sessionId,
    isTyping,          // admin is typing
    adminOnline,
    unreadCount,
    sendingMsg,
    registered,
    openPortal,
    closePortal,
    sendMessage,
    emitTyping,
    clearUnread: () => setUnreadCount(0),
  }), [
    connected, connectionState, isOpen, messages, conversationId,
    sessionId, isTyping, adminOnline, unreadCount, sendingMsg,
    registered, openPortal, closePortal, sendMessage, emitTyping,
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