// admin/src/api/packages.js
// ─────────────────────────────────────────────────────────────────────────────
// Packages API — self-contained, no cross-module re-export
// Uses the same apiClient instance as all other admin API files
// ─────────────────────────────────────────────────────────────────────────────

import apiClient from './client'

const BASE = '/packages'

// ══════════════════════════════════════════════════════════════════════════════
// ERROR MESSAGE EXTRACTOR
// Defined here directly — avoids rolldown re-export resolution failures.
// Mirrors the implementation in client.js exactly.
// ══════════════════════════════════════════════════════════════════════════════

export const getErrorMessage = (error) => {
  if (!error) return 'An error occurred'

  // ── Axios response error ──────────────────────────────────────────────────
  if (error.response?.data) {
    const d = error.response.data
    if (typeof d.error   === 'string') return d.error
    if (typeof d.message === 'string') return d.message
    if (typeof d.msg     === 'string') return d.msg
    if (Array.isArray(d.errors) && typeof d.errors[0] === 'string') return d.errors[0]
    if (typeof d         === 'string') return d
  }

  // ── HTTP status code fallbacks ────────────────────────────────────────────
  const status = error.response?.status
  if (status === 400) return 'Bad request — check your input'
  if (status === 401) return 'Unauthorized — please log in again'
  if (status === 403) return 'Access denied'
  if (status === 404) return 'Resource not found'
  if (status === 409) return 'Conflict — this record already exists'
  if (status === 422) return 'Validation error — check your input'
  if (status === 429) return 'Too many requests — please wait a moment'
  if (status >= 500)  return 'Server error — please try again later'

  // ── Network / timeout ─────────────────────────────────────────────────────
  if (error.code === 'ECONNABORTED')  return 'Request timed out — please try again'
  if (error.message === 'Network Error') return 'Network error — check your connection'

  // ── Generic ───────────────────────────────────────────────────────────────
  if (typeof error.message === 'string') return error.message
  if (typeof error         === 'string') return error

  return 'An unexpected error occurred'
}

// ══════════════════════════════════════════════════════════════════════════════
// PACKAGES API
// ══════════════════════════════════════════════════════════════════════════════

export const packagesAPI = {

  // ── Admin listing ─────────────────────────────────────────────────────────
  // Admin endpoint returns ALL packages including unpublished drafts
  getAll: (params) =>
    apiClient.get(`${BASE}/admin/all`, { params }),

  getById: (id) =>
    apiClient.get(`${BASE}/${id}`),

  getStats: () =>
    apiClient.get(`${BASE}/stats`),

  getBookingStats: () =>
    apiClient.get(`${BASE}/bookings/stats`),

  // ── CRUD ──────────────────────────────────────────────────────────────────
  create: (data) =>
    apiClient.post(BASE, data),

  update: (id, data) =>
    apiClient.patch(`${BASE}/${id}`, data),

  remove: (id) =>
    apiClient.delete(`${BASE}/${id}`),

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  publish: (id) =>
    apiClient.post(`${BASE}/${id}/publish`),

  unpublish: (id) =>
    apiClient.post(`${BASE}/${id}/unpublish`),

  // ── Package Messages ──────────────────────────────────────────────────────
  getMessages: (id, params) =>
    apiClient.get(`${BASE}/${id}/messages`, { params }),

  adminReply: (id, data) =>
    apiClient.post(`${BASE}/${id}/messages/admin-reply`, data),

  deleteMessage: (id, msgId) =>
    apiClient.delete(`${BASE}/${id}/messages/${msgId}`),

  markRead: (id) =>
    apiClient.post(`${BASE}/${id}/messages/mark-read`),

  // ── Bookings ──────────────────────────────────────────────────────────────
  getBookings: (id, params) =>
    apiClient.get(`${BASE}/${id}/bookings`, { params }),

  getAllBookings: (params) =>
    apiClient.get(`${BASE}/bookings/all`, { params }),

  updateBooking: (id, bId, data) =>
    apiClient.patch(`${BASE}/${id}/bookings/${bId}`, data),

  confirmBooking: (id, bId) =>
    apiClient.post(`${BASE}/${id}/bookings/${bId}/confirm`),

  cancelBooking: (id, bId, data) =>
    apiClient.post(`${BASE}/${id}/bookings/${bId}/cancel`, data),

  // ── Info Requests ──────────────────────────────────────────────────────────
  getInfoRequests: (id) =>
    apiClient.get(`${BASE}/${id}/info-requests`),

  createInfoRequest: (id, data) =>
    apiClient.post(`${BASE}/${id}/info-requests`, data),

  updateInfoRequest: (id, rId, data) =>
    apiClient.patch(`${BASE}/${id}/info-requests/${rId}`, data),

  deleteInfoRequest: (id, rId) =>
    apiClient.delete(`${BASE}/${id}/info-requests/${rId}`),
}

export default packagesAPI