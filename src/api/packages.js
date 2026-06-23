// src/api/packages.js
// ─────────────────────────────────────────────────────────────────────────────
// Standalone fetch-based API client — no external dependencies
// Matches your project's existing pattern (sendMessage.js, services/api.js)
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'

const getToken = () =>
  localStorage.getItem('altuvera_token') ||
  localStorage.getItem('token') ||
  null

// ── Core request ──────────────────────────────────────────────────────────────

const request = async (method, path, body = null, params = null) => {
  let url = `${API_BASE}${path}`

  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    if (qs) url += `?${qs}`
  }

  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const err = Object.assign(
      new Error(
        data?.error || data?.message ||
        data?.errors?.[0] || `Request failed (${res.status})`
      ),
      { status: res.status, data }
    )
    throw err
  }

  return res.json().catch(() => ({}))
}

const get  = (path, params) => request('GET',    path, null, params)
const post = (path, body)   => request('POST',   path, body)
const put  = (path, body)   => request('PUT',    path, body)
const patch= (path, body)   => request('PATCH',  path, body)
const del  = (path)         => request('DELETE', path)

// ─────────────────────────────────────────────────────────────────────────────
// API METHODS
// ─────────────────────────────────────────────────────────────────────────────

export const packagesAPI = {
  // ── Public ─────────────────────────────────────────────────────────────────
  getAll:         (params)      => get('/packages', params),
  getById:        (id)          => get(`/packages/${id}`),
  getBySlug:      (slug)        => get(`/packages/slug/${slug}`),
  getFeatured:    (params)      => get('/packages/featured', params),
  getCategories:  ()            => get('/packages/categories'),
  incrementView:  (id)          => post(`/packages/${id}/view`),

  // ── Admin CRUD ──────────────────────────────────────────────────────────────
  create:         (data)        => post('/packages', data),
  update:         (id, data)    => patch(`/packages/${id}`, data),
  remove:         (id)          => del(`/packages/${id}`),

  // ── Publish ─────────────────────────────────────────────────────────────────
  publish:        (id)          => post(`/packages/${id}/publish`),
  unpublish:      (id)          => post(`/packages/${id}/unpublish`),

  // ── Messages ─────────────────────────────────────────────────────────────────
  getMessages:    (id, params)  => get(`/packages/${id}/messages`, params),
  sendMessage:    (id, data)    => post(`/packages/${id}/messages`, data),
  adminReply:     (id, data)    => post(`/packages/${id}/messages/admin-reply`, data),
  deleteMessage:  (id, msgId)   => del(`/packages/${id}/messages/${msgId}`),
  markRead:       (id)          => post(`/packages/${id}/messages/mark-read`),

  // ── Bookings ─────────────────────────────────────────────────────────────────
  getBookings:    (id, params)       => get(`/packages/${id}/bookings`, params),
  getAllBookings:  (params)           => get('/packages/bookings/all', params),
  createBooking:  (id, data)         => post(`/packages/${id}/book`, data),
  updateBooking:  (id, bId, data)    => patch(`/packages/${id}/bookings/${bId}`, data),
  confirmBooking: (id, bId)          => post(`/packages/${id}/bookings/${bId}/confirm`),
  cancelBooking:  (id, bId, data)    => post(`/packages/${id}/bookings/${bId}/cancel`, data),

  // ── Info Requests ─────────────────────────────────────────────────────────────
  getInfoRequests:    (id)           => get(`/packages/${id}/info-requests`),
  createInfoRequest:  (id, data)     => post(`/packages/${id}/info-requests`, data),
  updateInfoRequest:  (id, rId, d)   => patch(`/packages/${id}/info-requests/${rId}`, d),
  deleteInfoRequest:  (id, rId)      => del(`/packages/${id}/info-requests/${rId}`),
  submitInfoResponse: (id, rId, d)   => post(`/packages/${id}/info-requests/${rId}/respond`, d),

  // ── Chat Preferences ──────────────────────────────────────────────────────────
  getChatPreferences:  ()     => get('/packages/preferences/chat'),
  saveChatPreferences: (data) => put('/packages/preferences/chat', data),

  // ── User's own data ───────────────────────────────────────────────────────────
  getMyMessages:  (params) => get('/packages/my/messages', params),
  getMyBookings:  (params) => get('/packages/my/bookings', params),
  getMyInfoReqs:  (params) => get('/packages/my/info-requests', params),

  // ── Stats ─────────────────────────────────────────────────────────────────────
  getStats:        () => get('/packages/stats'),
  getBookingStats: () => get('/packages/bookings/stats'),
}

export default packagesAPI