/**
 * socket.js — Singleton Socket.io client v3.0
 *
 * Guarantees:
 *   - One socket instance for the entire app lifetime
 *   - WebSocket-first (no polling 400 floods)
 *   - Exponential backoff with jitter
 *   - Lazy connect (only when portal opens)
 *   - Token refresh without reconnect storms
 *   - Tab visibility + network online awareness
 *   - Zero memory leaks
 */

import { io } from 'socket.io-client'

/* ═══════════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════════ */
const getSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const api = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'
  // Strip /api suffix to get base URL
  return api.replace(/\/api\/?$/, '')
}

const SOCKET_URL = getSocketUrl()
const TOKEN_KEYS = [
  'altuvera_auth_token',
  'altuvera_refresh_token',
]

/* ═══════════════════════════════════════════════════════════════
   SINGLETON STATE (module-level — survives re-renders)
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
  try { localStorage.setItem('altuvera_auth_token', token) } catch { /* ignore */ }
}

/* ═══════════════════════════════════════════════════════════════
   SOCKET CREATION — called at most once
═══════════════════════════════════════════════════════════════ */
const createSocket = () => {
  if (_socket) return _socket

  _socket = io(SOCKET_URL, {
    /*
     * WebSocket FIRST.
     * This single change eliminates the polling 400 flood.
     * Socket.io falls back to polling only if WebSocket fails.
     */
    transports: ['websocket', 'polling'],

    /*
     * NEVER auto-connect.
     * We connect only when the portal opens (openPortal()).
     * This prevents background connections on every page load.
     */
    autoConnect: false,

    /*
     * Exponential backoff:
     * 1s → 2s → 4s → 8s … capped at 30s, ±50% jitter.
     * Prevents the reconnect storm that caused the 400 flood.
     */
    reconnection:          true,
    reconnectionAttempts:  Infinity,
    reconnectionDelay:     1_000,
    reconnectionDelayMax:  30_000,
    randomizationFactor:   0.5,

    /* Connection timeouts */
    timeout:             20_000,

    /* Auth token sent on every handshake */
    auth: { token: readToken() },

    /* Standard Socket.io path */
    path: '/socket.io',

    /*
     * forceNew: false — CRITICAL.
     * Prevents creating a new socket on every React re-render.
     */
    forceNew: false,

    /* Remember WS upgrade so reconnects skip polling phase */
    rememberUpgrade: true,

    /* Clean disconnect on browser unload */
    closeOnBeforeunload: true,
  })

  _attachDevListeners(_socket)
  return _socket
}

/* ── Dev-only diagnostics ───────────────────────────────────── */
const _attachDevListeners = (socket) => {
  if (!import.meta.env.DEV) return

  socket.on('connect', () =>
    console.info(
      `%c[Socket] ✓ Connected` +
      `  id=${socket.id}` +
      `  transport=${socket.io.engine?.transport?.name}`,
      'color:#16a34a;font-weight:700'
    )
  )
  socket.on('disconnect', (reason) =>
    console.info(`%c[Socket] Disconnected: ${reason}`, 'color:#f59e0b;font-weight:600')
  )
  socket.on('connect_error', (err) =>
    console.warn(`[Socket] connect_error: ${err.message}`)
  )
  socket.io.on('reconnect_attempt', (n) =>
    console.info(`[Socket] Reconnect attempt #${n}`)
  )
  socket.io.on('reconnect', () =>
    console.info('%c[Socket] ✓ Reconnected', 'color:#16a34a;font-weight:700')
  )
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════════ */

/**
 * getSocket()
 * Returns the singleton socket instance.
 * Creates it on first call. Never auto-connects.
 */
export const getSocket = () => createSocket()

/**
 * connectSocket(token?)
 * Connects the socket. Safe to call multiple times —
 * socket.io is idempotent when already connected.
 */
export const connectSocket = (token) => {
  const socket = createSocket()
  _manualDisconnect = false

  // Attach freshest token before connecting
  const t = token || readToken()
  if (t) {
    socket.auth = { token: t }
    writeToken(t)
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

/**
 * disconnectSocket()
 * Permanently disconnects. Stops all reconnect attempts.
 * Call on logout.
 */
export const disconnectSocket = () => {
  _manualDisconnect = true
  clearTimeout(_authUpdateTimer)
  if (_socket?.connected) _socket.disconnect()
}

/**
 * updateSocketAuth(token)
 * Updates auth token after login or token refresh.
 * Reconnects only if already connected, with a short delay
 * to avoid triggering multiple reconnects.
 */
export const updateSocketAuth = (token) => {
  if (!token) return
  writeToken(token)

  if (!_socket) return
  _socket.auth = { token }

  // Debounce: if called rapidly, only reconnect once
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
   (only when socket already exists and was not manually stopped)
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