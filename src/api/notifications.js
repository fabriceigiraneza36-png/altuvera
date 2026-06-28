/**
 * User-facing notifications API client
 * Base URL comes from UserAuthContext's authFetch (same API_BASE)
 */

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'

const TOKEN_KEY = 'altuvera_auth_token'

const getToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY)  ||
      sessionStorage.getItem(TOKEN_KEY) ||
      null
    )
  } catch { return null }
}

const apiFetch = async (endpoint, options = {}) => {
  const token = getToken()
  const url   = `${API_BASE}${endpoint}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 204) return {}
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err     = new Error(data?.message || data?.error || `Error ${res.status}`)
    err.status    = res.status
    err.data      = data
    throw err
  }
  return data
}

export const notificationsUserAPI = {
  // ── Fetch ──────────────────────────────────────────────────────────────────
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== ''),
    ).toString()
    return apiFetch(`/notifications/my${qs ? `?${qs}` : ''}`)
  },

  getUnreadCount: () =>
    apiFetch('/notifications/my/unread-count'),

  // ── Read state ─────────────────────────────────────────────────────────────
  markRead:    (id)  => apiFetch(`/notifications/${id}/read`,      { method: 'PATCH' }),
  markAllRead: ()    => apiFetch('/notifications/mark-all-read',   { method: 'PATCH' }),

  // ── Reactions ──────────────────────────────────────────────────────────────
  react: (id, reaction) =>
    apiFetch(`/notifications/${id}/react`, {
      method: 'PATCH',
      body:   JSON.stringify({ reaction }),
    }),

  // ── Replies ────────────────────────────────────────────────────────────────
  reply: (id, reply) =>
    apiFetch(`/notifications/${id}/reply`, {
      method: 'POST',
      body:   JSON.stringify({ reply }),
    }),

  // ── Delete / clear ─────────────────────────────────────────────────────────
  deleteOne: (id) => apiFetch(`/notifications/${id}`,  { method: 'DELETE' }),
  clearAll:  ()   => apiFetch('/notifications/clear-all', { method: 'DELETE' }),
}

export default notificationsUserAPI