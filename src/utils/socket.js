/**
 * socket.js — Bulletproof singleton Socket.io client
 * Never creates duplicate connections.
 * Exponential backoff prevents 400 flood.
 */
import { io } from 'socket.io-client'

/* ── Config ─────────────────────────────────────────────────── */
const getSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL
  if (explicit) return explicit.replace(/\/?$/, '')
  const api = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'
  return api.replace(/\/api\/?$/, '')
}

const SOCKET_URL  = getSocketUrl()
const TOKEN_KEY   = 'altuvera_auth_token'

/* ── Singleton ──────────────────────────────────────────────── */
let _socket          = null
let _manualDisconnect = false
let _connectCalled    = false

/* ── Token helper ───────────────────────────────────────────── */
const readToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      undefined
    )
  } catch { return undefined }
}

/* ── Create socket ONCE ─────────────────────────────────────── */
const createSocket = () => {
  if (_socket) return _socket

  _socket = io(SOCKET_URL, {
    /*
     * WebSocket FIRST — avoids the polling 400 errors entirely.
     * polling is kept as fallback only.
     */
    transports: ['websocket', 'polling'],

    /*
     * Do NOT auto-connect — we control the lifecycle.
     * This prevents connections from firing before the user
     * opens the chat portal.
     */
    autoConnect: false,

    /*
     * Exponential backoff: 1s → 2s → 4s … capped at 30s ±50% jitter
     * This is what stops the 400 flood.
     */
    reconnection:            true,
    reconnectionAttempts:    Infinity,
    reconnectionDelay:       1_000,
    reconnectionDelayMax:    30_000,
    randomizationFactor:     0.5,

    /* Timeouts */
    timeout:      20_000,

    /* Auth token */
    auth: { token: readToken() },

    /* Socket.io path */
    path: '/socket.io',

    /* Never force a new connection */
    forceNew: false,

    /* Remember WebSocket upgrade across reconnects */
    rememberUpgrade: true,

    /* Close on page unload */
    closeOnBeforeunload: true,
  })

  /* ── Internal diagnostics (dev only) ─────────────────────── */
  if (import.meta.env.DEV) {
    _socket.on('connect', () => {
      console.info(
        `%c[Socket] ✓ Connected  id=${_socket.id}  transport=${_socket.io.engine?.transport?.name}`,
        'color:#16a34a;font-weight:600'
      )
    })
    _socket.on('disconnect', (reason) => {
      console.info(`%c[Socket] Disconnected: ${reason}`, 'color:#f59e0b')
    })
    _socket.on('connect_error', (err) => {
      console.warn(`[Socket] connect_error: ${err.message}`)
    })
    _socket.io.on('reconnect_attempt', (n) => {
      console.info(`[Socket] Reconnect attempt #${n}`)
    })
    _socket.io.on('reconnect', () => {
      console.info('%c[Socket] ✓ Reconnected', 'color:#16a34a;font-weight:600')
    })
  }

  return _socket
}

/* ── Public API ─────────────────────────────────────────────── */

/** Get (or lazily create) the singleton. Never connects on its own. */
export const getSocket = () => createSocket()

/**
 * Connect the socket.
 * Safe to call multiple times — connects only once.
 * @param {string} [token] - optional JWT to attach
 */
export const connectSocket = (token) => {
  const socket = createSocket()
  _manualDisconnect = false

  if (token) {
    socket.auth = { token }
  } else {
    const t = readToken()
    if (t) socket.auth = { token: t }
  }

  if (!socket.connected && !_connectCalled) {
    _connectCalled = true
    socket.connect()
  } else if (!socket.connected) {
    socket.connect()
  }

  return socket
}

/**
 * Gracefully disconnect (logout / component unmount).
 * Prevents auto-reconnect.
 */
export const disconnectSocket = () => {
  _manualDisconnect = true
  _connectCalled    = false
  if (_socket?.connected) {
    _socket.disconnect()
  }
}

/**
 * Update auth token after login.
 * Reconnects with new token if already connected.
 */
export const updateSocketAuth = (token) => {
  if (!token) return
  if (_socket) {
    _socket.auth = { token }
    /*
     * Only reconnect if already connected — avoids triggering
     * a fresh connection when not needed.
     */
    if (_socket.connected) {
      _socket.disconnect()
      setTimeout(() => {
        if (!_manualDisconnect) _socket?.connect()
      }, 500)
    }
  }
}

/* ── Tab visibility / online events ─────────────────────────── */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !_manualDisconnect) {
      const s = getSocket()
      if (!s.connected) s.connect()
    }
  })
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (!_manualDisconnect) {
      const s = getSocket()
      if (!s.connected) s.connect()
    }
  })
}

export default getSocket