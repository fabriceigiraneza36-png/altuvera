/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SOCKET CLIENT v2.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Root cause of the infinite 400 loop:
 *   Socket.io client reconnects indefinitely with no backoff cap.
 *   Each reconnect creates a new session (new sid) but the old polling
 *   request for the PREVIOUS sid returns 400 — "session not found".
 *   The client interprets that 400 as a transport error and reconnects
 *   again → infinite loop.
 *
 * Fixes applied:
 *   1. reconnectionAttempts: 5   — stop after 5 failures (not ∞)
 *   2. reconnectionDelay: 2000   — start with 2s (not 1s)
 *   3. reconnectionDelayMax: 30000 — cap at 30s
 *   4. randomizationFactor: 0.5  — add jitter
 *   5. timeout: 20000            — connection timeout 20s (Render cold start)
 *   6. transports: ['polling','websocket'] — polling FIRST always
 *   7. forceNew: false           — reuse socket on reconnect, not new instance
 *   8. autoConnect: false        — connect only when needed (prevents orphan sockets)
 *   9. Socket exported as singleton — prevents multiple instances
 *  10. No socket created on pages that don't need real-time features
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || ''
const IS_DEV      = import.meta.env.DEV

// ── Singleton pattern — one socket per app instance ───────────────────────────
let _socket = null
let _connectRequested = false

/**
 * Get (or lazily create) the singleton socket.
 * Call connect() separately when you actually need real-time.
 */
export const getSocket = () => {
  if (_socket) return _socket

  _socket = io(BACKEND_URL, {
    // ── Transport — polling MUST be first ────────────────────────────────────
    // Socket.io always starts with HTTP polling, then upgrades to WebSocket.
    // If WebSocket fails (Render free tier, some proxies), it stays on polling.
    transports: ['polling', 'websocket'],

    // ── Reconnection — capped with backoff ───────────────────────────────────
    // Without a cap, the client loops forever creating new sids.
    reconnection:           true,
    reconnectionAttempts:   5,        // stop after 5 total failures
    reconnectionDelay:      2_000,    // first retry: 2s
    reconnectionDelayMax:   30_000,   // max wait between retries: 30s
    randomizationFactor:    0.5,      // jitter ±50% to avoid thundering herd

    // ── Connection timeout ───────────────────────────────────────────────────
    // Render cold starts can take 20–30 s. Standard 20s timeout.
    timeout: 20_000,

    // ── Auth ─────────────────────────────────────────────────────────────────
    auth: (cb) => {
      const token =
        localStorage.getItem('token')     ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('token')   ||
        null
      cb({ token })
    },

    // ── Session ──────────────────────────────────────────────────────────────
    // autoConnect:false means we call socket.connect() deliberately.
    // This prevents sockets opening on pages that don't need them.
    autoConnect: false,

    // ── Prevent duplicate connections ─────────────────────────────────────────
    forceNew: false,

    // ── Path (must match server) ─────────────────────────────────────────────
    path: '/socket.io',
  })

  // ── Development logging ─────────────────────────────────────────────────────
  if (IS_DEV) {
    _socket.on('connect',            ()    => console.log('[Socket] Connected:', _socket.id))
    _socket.on('disconnect',         (r)   => console.log('[Socket] Disconnected:', r))
    _socket.on('connect_error',      (err) => console.warn('[Socket] Connect error:', err.message))
    _socket.on('reconnect_attempt',  (n)   => console.log(`[Socket] Reconnect attempt ${n}`))
    _socket.on('reconnect_failed',   ()    => console.error('[Socket] Max reconnect attempts reached — stopped'))
    _socket.on('reconnect',          (n)   => console.log(`[Socket] Reconnected after ${n} attempt(s)`))
  }

  // ── Production: silent on max failure ───────────────────────────────────────
  _socket.on('reconnect_failed', () => {
    if (IS_DEV) return
    // Optionally notify user here, e.g. show a "Live chat unavailable" banner
    console.warn('[Socket] Connection failed after max retries. Real-time features unavailable.')
  })

  return _socket
}

/**
 * Connect the socket (creates it if needed).
 * Safe to call multiple times — only connects once.
 */
export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected && !_connectRequested) {
    _connectRequested = true
    s.connect()
    // Reset flag on disconnect so future connect() calls work
    s.once('disconnect', () => { _connectRequested = false })
  }
  return s
}

/**
 * Disconnect and destroy the singleton.
 * Call this on logout or when leaving pages that use real-time.
 */
export const disconnectSocket = () => {
  if (_socket) {
    _socket.disconnect()
    _socket.removeAllListeners()
    _socket           = null
    _connectRequested = false
  }
}

/**
 * Update the auth token on the existing socket.
 * Call after login/logout without reconnecting.
 */
export const updateSocketAuth = (token) => {
  if (!_socket) return
  _socket.auth = { token: token || null }
  // If already connected, reconnect to pick up new token
  if (_socket.connected) {
    _socket.disconnect().connect()
  }
}

// Default export: the getter (doesn't auto-connect)
export default getSocket