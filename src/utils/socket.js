/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SOCKET CLIENT v2.2
 * "True Adventures In High Places & Deep Culture"
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Fixes from v2.0 / v2.1:
 *   - API_BASE double-prefix fix: strips trailing /api from VITE_API_URL
 *     so the socket connects to the root (not /api/socket.io)
 *   - reconnectionAttempts: 5 + reconnectionDelayMax: 60s (covers Render sleep)
 *   - timeout: 25s (Render cold start can take 20-30s)
 *   - autoConnect: false — no orphan connections on non-realtime pages
 *   - reconnect_failed dispatches window event for UI offline indicators
 *   - disconnect resets _connectRequested so next connectSocket() works
 *   - disconnectSocket() removes listeners BEFORE disconnect (prevents leaks)
 *   - isSocketConnected() helper exported
 *   - Full JSDoc on every export
 *
 * Root cause of 400 polling loop (unchanged explanation):
 *   Socket.io client reconnects indefinitely with no backoff cap.
 *   Each reconnect creates a new session (new sid) but the old polling
 *   request for the PREVIOUS sid returns 400 — "session not found".
 *   The client interprets that 400 as a transport error and reconnects
 *   again → infinite loop.
 *
 * All fixes applied:
 *   1.  Strip trailing /api from VITE_API_URL — prevents /api/socket.io 404
 *   2.  reconnectionAttempts: 5           — hard stop after 5 failures
 *   3.  reconnectionDelay: 3000           — start with 3s (not 1s)
 *   4.  reconnectionDelayMax: 60000       — cap at 60s (Render sleeps ~30-50s)
 *   5.  randomizationFactor: 0.5          — ±50% jitter
 *   6.  timeout: 25000                    — 25s connection timeout
 *   7.  transports: ['polling','websocket']— polling FIRST (handshake requires it)
 *   8.  forceNew: false                   — reuse socket, don't create orphans
 *   9.  autoConnect: false                — explicit connect() only when needed
 *   10. Singleton — one socket per app lifetime
 *   11. reconnect_failed → window event  — UI can show "offline" banner
 *   12. disconnect → reset _connectRequested so reconnect works
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { io } from 'socket.io-client'

// ── Normalise backend URL ─────────────────────────────────────────────────────
// Strip trailing slash and any trailing /api suffix.
// Socket.io must connect to the server ROOT, not /api.
// Example:
//   VITE_API_URL = "https://backend.onrender.com"      → OK as-is
//   VITE_API_URL = "https://backend.onrender.com/api"  → strip to root
//   VITE_API_URL = "https://backend.onrender.com/"     → strip slash
const _rawUrl = (
  import.meta.env.VITE_API_URL     ||
  import.meta.env.VITE_BACKEND_URL ||
  ''
).replace(/\/$/, '')                      // strip trailing slash

const SOCKET_URL = _rawUrl.endsWith('/api')
  ? _rawUrl.slice(0, -4)                  // "https://backend.onrender.com"
  : _rawUrl

const IS_DEV = import.meta.env.DEV

// ── Singleton state ───────────────────────────────────────────────────────────
let _socket           = null
let _connectRequested = false

// ── Auth token resolver ───────────────────────────────────────────────────────
// Tries every common storage key used across different auth implementations.
const resolveToken = () => {
  const keys = [
    'token', 'authToken', 'auth_token',
    'accessToken', 'access_token',
    'userToken', 'user_token',
    'jwt', 'JWT',
  ]
  for (const key of keys) {
    const val = localStorage.getItem(key) || sessionStorage.getItem(key)
    if (val && val !== 'null' && val !== 'undefined') return val
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get (or lazily create) the singleton socket instance.
 *
 * Does NOT connect automatically — call connectSocket() when you actually
 * need real-time. This prevents orphan connections on pages that don't
 * use live features.
 *
 * @returns {import('socket.io-client').Socket}
 */
export const getSocket = () => {
  if (_socket) return _socket

  if (IS_DEV) {
    console.log(
      `%c[Socket] Creating singleton | URL: ${SOCKET_URL}`,
      'color:#16a34a;font-weight:bold',
    )
  }

  _socket = io(SOCKET_URL, {
    // ── Transport ─────────────────────────────────────────────────────────────
    // polling MUST be first — Socket.io v4 always handshakes via HTTP polling,
    // then upgrades to WebSocket. Without polling first, the handshake returns
    // 400 "Bad Request".
    transports: ['polling', 'websocket'],

    // ── Reconnection — exponential back-off with hard cap ─────────────────────
    // Without reconnectionAttempts, the client loops forever:
    //   connect → 400 (stale sid) → reconnect → new sid → server restarts → 400 …
    reconnection:          true,
    reconnectionAttempts:  5,          // stop after 5 total failures
    reconnectionDelay:     3_000,      // first retry: 3 s
    reconnectionDelayMax:  60_000,     // max wait: 60 s (covers Render 30-50s sleep)
    randomizationFactor:   0.5,        // ±50% jitter — avoids thundering herd

    // ── Connection timeout ─────────────────────────────────────────────────────
    // Render free-tier cold starts take 20-30 s.
    timeout: 25_000,

    // ── Auth ───────────────────────────────────────────────────────────────────
    // Dynamic callback — picks up the token that exists at connect time.
    auth: (cb) => cb({ token: resolveToken() }),

    // ── Connection control ─────────────────────────────────────────────────────
    autoConnect: false,   // we call socket.connect() explicitly
    forceNew:    false,   // reuse socket instance — no orphan connections

    // ── Path — must match server config ───────────────────────────────────────
    path: '/socket.io',
  })

  // ── Development event logging ─────────────────────────────────────────────
  if (IS_DEV) {
    _socket.on('connect',            ()    => console.log(`[Socket] ✅ Connected: ${_socket.id}`))
    _socket.on('disconnect',         (r)   => console.log(`[Socket] ❌ Disconnected: ${r}`))
    _socket.on('connect_error',      (err) => console.warn(`[Socket] ⚠️ Connect error: ${err.message}`))
    _socket.on('reconnect_attempt',  (n)   => console.log(`[Socket] 🔄 Reconnect attempt ${n} / 5`))
    _socket.on('reconnect',          (n)   => console.log(`[Socket] ✅ Reconnected after ${n} attempt(s)`))
    _socket.on('reconnect_failed',   ()    => console.error('[Socket] ❌ Max reconnect attempts — stopped'))
  }

  // ── Reset _connectRequested on disconnect ──────────────────────────────────
  // Without this, calling connectSocket() after a disconnect does nothing
  // because _connectRequested is still true.
  _socket.on('disconnect', () => {
    _connectRequested = false
  })

  // ── On max failures: notify UI ─────────────────────────────────────────────
  // Dispatch a CustomEvent so any component can react (e.g. show offline banner).
  _socket.on('reconnect_failed', () => {
    if (!IS_DEV) {
      console.warn('[Socket] Connection failed after max retries. Real-time features unavailable.')
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('socket:offline', {
        detail: { url: SOCKET_URL },
      }))
    }
  })

  return _socket
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Connect the socket.
 *
 * Safe to call multiple times — only actually connects once per session.
 * If the socket has disconnected, calling this again will reconnect.
 *
 * @returns {import('socket.io-client').Socket}
 */
export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected && !_connectRequested) {
    _connectRequested = true
    s.connect()
  }
  return s
}

/**
 * Disconnect and fully destroy the singleton.
 *
 * Call on logout or when navigating away from pages that use real-time.
 * The next call to getSocket() / connectSocket() will create a fresh instance.
 */
export const disconnectSocket = () => {
  if (!_socket) return

  // Remove all listeners BEFORE disconnecting to prevent any callbacks
  // firing after we've nulled the reference.
  _socket.removeAllListeners()
  _socket.disconnect()

  _socket           = null
  _connectRequested = false

  if (IS_DEV) {
    console.log('[Socket] Singleton destroyed')
  }
}

/**
 * Update the auth token on an existing socket connection.
 *
 * Call after the user logs in or out without wanting a full page reload.
 * If the socket is currently connected, it will briefly disconnect and
 * reconnect to pick up the new token.
 *
 * @param {string|null} token  New JWT, or null to clear
 */
export const updateSocketAuth = (token) => {
  if (!_socket) return

  _socket.auth = { token: token || null }

  if (_socket.connected) {
    // Brief reconnect to re-authenticate with the server
    _socket.disconnect().connect()
  }
}

/**
 * Returns true if the socket currently has an active connection.
 *
 * @returns {boolean}
 */
export const isSocketConnected = () => Boolean(_socket?.connected)

/**
 * Returns the current socket ID, or null if not connected.
 *
 * @returns {string|null}
 */
export const getSocketId = () => _socket?.id || null

// ── Default export: getter (does not auto-connect) ────────────────────────────
export default getSocket