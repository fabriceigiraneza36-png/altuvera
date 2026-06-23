// src/api/packages.js
import apiClient, { createEndpoint } from './client'

const BASE = '/packages'
const base = createEndpoint(BASE)

export const packagesAPI = {
  // ── Spread base CRUD (getAll, getById, create, update, remove) ────────────
  ...base,

  // ── Override getAll to support admin flag ─────────────────────────────────
  getAll:  (params) => apiClient.get(BASE, { params }),
  getById: (id)     => apiClient.get(`${BASE}/${id}`),

  // ── Public ────────────────────────────────────────────────────────────────
  getBySlug:      (slug)   => apiClient.get(`${BASE}/slug/${slug}`),
  getFeatured:    (params) => apiClient.get(`${BASE}/featured`, { params }),
  getCategories:  ()       => apiClient.get(`${BASE}/categories`),
  incrementView:  (id)     => apiClient.post(`${BASE}/${id}/view`),

  // ── Publish ───────────────────────────────────────────────────────────────
  publish:   (id) => apiClient.post(`${BASE}/${id}/publish`),
  unpublish: (id) => apiClient.post(`${BASE}/${id}/unpublish`),

  // ── Package Messages ──────────────────────────────────────────────────────
  getMessages:   (id, params) => apiClient.get(`${BASE}/${id}/messages`, { params }),
  sendMessage:   (id, data)   => apiClient.post(`${BASE}/${id}/messages`, data),
  adminReply:    (id, data)   => apiClient.post(`${BASE}/${id}/messages/admin-reply`, data),
  deleteMessage: (id, msgId)  => apiClient.delete(`${BASE}/${id}/messages/${msgId}`),
  markRead:      (id)         => apiClient.post(`${BASE}/${id}/messages/mark-read`),

  // ── Bookings ──────────────────────────────────────────────────────────────
  getBookings:    (id, params)    => apiClient.get(`${BASE}/${id}/bookings`, { params }),
  getAllBookings:  (params)        => apiClient.get(`${BASE}/bookings/all`, { params }),
  createBooking:  (id, data)      => apiClient.post(`${BASE}/${id}/book`, data),
  updateBooking:  (id, bId, data) => apiClient.patch(`${BASE}/${id}/bookings/${bId}`, data),
  confirmBooking: (id, bId)       => apiClient.post(`${BASE}/${id}/bookings/${bId}/confirm`),
  cancelBooking:  (id, bId, data) => apiClient.post(`${BASE}/${id}/bookings/${bId}/cancel`, data),

  // ── Admin Info Requests ───────────────────────────────────────────────────
  getInfoRequests:    (id)          => apiClient.get(`${BASE}/${id}/info-requests`),
  createInfoRequest:  (id, data)    => apiClient.post(`${BASE}/${id}/info-requests`, data),
  updateInfoRequest:  (id, rId, d)  => apiClient.patch(`${BASE}/${id}/info-requests/${rId}`, d),
  deleteInfoRequest:  (id, rId)     => apiClient.delete(`${BASE}/${id}/info-requests/${rId}`),
  submitInfoResponse: (id, rId, d)  => apiClient.post(`${BASE}/${id}/info-requests/${rId}/respond`, d),

  // ── Chat preferences (logged-in users only) ───────────────────────────────
  getChatPreferences:  ()     => apiClient.get(`${BASE}/preferences/chat`),
  saveChatPreferences: (data) => apiClient.put(`${BASE}/preferences/chat`, data),

  // ── User's own data ───────────────────────────────────────────────────────
  getMyMessages: (params) => apiClient.get(`${BASE}/my/messages`, { params }),
  getMyBookings: (params) => apiClient.get(`${BASE}/my/bookings`, { params }),
  getMyInfoReqs: (params) => apiClient.get(`${BASE}/my/info-requests`, { params }),

  // ── Stats (admin) ─────────────────────────────────────────────────────────
  getStats:        () => apiClient.get(`${BASE}/stats`),
  getBookingStats: () => apiClient.get(`${BASE}/bookings/stats`),
}

export default packagesAPI