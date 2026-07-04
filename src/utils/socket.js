/**
 * socket.js — Singleton Socket.io client v3.1
 * Frontend (user-facing) only.
 * Admin panel uses its own SocketContext.
 */

import { io } from 'socket.io-client'

/* ═══════════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════════ */
const getSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const api = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'
  return api.replace(/\/api\/?$/, '')
}

const SOCKET_URL = getSocketUrl()
const TOKEN_KEYS = [
  'altuvera_auth_token',
  'altuvera_refresh_token',
]

/* ═══════════════════════════════════════════════════════════════
   SINGLETON STATE
═══════════════════════════════════════════════════════════════ */
let _socket           = null
let _manualDisconnect = false
let _authUpdateTimer  = null

/* ═══════════════════════════════════════════════════════════════
   TOKEN HELPERS
═══════════════════════════════════════════════════════════════ */
const readToken = () => {
  try {
    for (const key of TOKEN_KEYS) {
      const t = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (t) return t
    }
    return undefined
  } catch { return undefined }
}

const writeToken = (token) => {
  if (!token) return
  try { localStorage.setItem('altuvera_auth_token', token) } catch {}
}

/* ═══════════════════════════════════════════════════════════════
   SOCKET CREATION
═══════════════════════════════════════════════════════════════ */
const createSocket = () => {
  if (_socket) return _socket

  _socket = io(SOCKET_URL, {
    transports:            ['websocket', 'polling'],
    autoConnect:           false,
    reconnection:          true,
    reconnectionAttempts:  Infinity,
    reconnectionDelay:     1_000,
    reconnectionDelayMax:  30_000,
    randomizationFactor:   0.5,
    timeout:               20_000,
    auth:                  { token: readToken() },
    path:                  '/socket.io',
    forceNew:              false,
    rememberUpgrade:       true,
    closeOnBeforeunload:   true,
  })

  _attachDevListeners(_socket)
  return _socket
}

const _attachDevListeners = (socket) => {
  if (!import.meta.env.DEV) return

  socket.onAny((event, ...args) => {
    console.debug(
      `%c[socket ←] ${event}`,
      'color:#16a34a;font-weight:600',
      args.length === 1 ? args[0] : args,
    )
  })

  const _origEmit = socket.emit.bind(socket)
  socket.emit = (event, ...args) => {
    // Don't log the debug override itself
    if (event !== '_debug') {
      console.debug(
        `%c[socket →] ${event}`,
        'color:#2563eb;font-weight:600',
        args.filter(a => typeof a !== 'function'),
      )
    }
    return _origEmit(event, ...args)
  }

  socket.on('connect', () =>
    console.info(
      `%c[Socket] ✓ Connected  id=${socket.id}  transport=${socket.io.engine?.transport?.name}`,
      'color:#16a34a;font-weight:700',
    ),
  )
  socket.on('disconnect', (reason) =>
    console.info(`%c[Socket] Disconnected: ${reason}`, 'color:#f59e0b;font-weight:600'),
  )
  socket.on('connect_error', (err) =>
    console.warn(`[Socket] connect_error: ${err.message}`),
  )
  socket.io.on('reconnect_attempt', (n) =>
    console.info(`[Socket] Reconnect attempt #${n}`),
  )
  socket.io.on('reconnect', () =>
    console.info('%c[Socket] ✓ Reconnected', 'color:#16a34a;font-weight:700'),
  )
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════════ */
export const getSocket = () => createSocket()

export const connectSocket = (token) => {
  const socket = createSocket()
  _manualDisconnect = false

  const t = token || readToken()
  if (t) {
    socket.auth = { token: t }
    writeToken(t)
  }

  if (!socket.connected) socket.connect()
  return socket
}

export const disconnectSocket = () => {
  _manualDisconnect = true
  clearTimeout(_authUpdateTimer)
  if (_socket?.connected) _socket.disconnect()
}

export const updateSocketAuth = (token) => {
  if (!token) return
  writeToken(token)
  if (!_socket) return
  _socket.auth = { token }

  clearTimeout(_authUpdateTimer)
  _authUpdateTimer = setTimeout(() => {
    if (_socket && _socket.connected && !_manualDisconnect) {
      _socket.disconnect()
      setTimeout(() => {
        if (_socket && !_manualDisconnect) _socket.connect()
      }, 300)
    }
  }, 100)
}

/* ═══════════════════════════════════════════════════════════════
   PASSIVE RECONNECT TRIGGERS
═══════════════════════════════════════════════════════════════ */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (
      document.visibilityState === 'visible' &&
      !_manualDisconnect &&
      _socket &&
      !_socket.connected
    ) {
      _socket.connect()
    }
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (!_manualDisconnect && _socket && !_socket.connected) {
      _socket.connect()
    }
  })
}

export default getSocket