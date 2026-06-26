/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useSubmitTestimonial v2.2
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Fixes:
 *  - error state is ALWAYS string | null  (never Error object → no [object Object])
 *  - Full debug logging so you can see exact URL, status, body in DevTools
 *  - 404 surfaces as "Route not found" + debug info in development
 *  - Token lookup covers all common storage key names
 *  - AbortController + 20s timeout
 *  - parseServerError() walks every known server error shape
 */

import { useState, useCallback, useRef } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const IS_DEV   = import.meta.env.DEV

/* ─── Always returns a plain string ─────────────────────────────────────── */
const toStr = (val) => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (val instanceof Error)   return val.message || 'An error occurred.'
  if (typeof val === 'object') {
    // Common server shapes
    if (typeof val.error   === 'string' && val.error)   return val.error
    if (typeof val.message === 'string' && val.message) return val.message
    // Validation arrays
    if (Array.isArray(val.errors))  return val.errors.map(e => e.msg || e.message || String(e)).filter(Boolean).join('. ')
    if (Array.isArray(val.details)) return val.details.map(d => d.message || d.msg || String(d)).filter(Boolean).join('. ')
    try { return JSON.stringify(val) } catch { return 'An error occurred.' }
  }
  return String(val)
}

/* ─── Parse server response body into user-facing string ─────────────────── */
const parseServerError = (body, status) => {
  if (!body) return `Request failed (${status}). Please try again.`
  const msg = toStr(body)
  // If toStr returned the raw JSON (object coercion), make it friendlier
  if (msg.startsWith('{')) return `Server error (${status}). Please try again.`
  return msg || `Request failed (${status}). Please try again.`
}

/* ─── Find auth token from any common storage location ───────────────────── */
const getAuthToken = () => {
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

/* ═══════════════════════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════════════════════ */

export const useSubmitTestimonial = () => {
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState(null)   // ALWAYS string | null

  const abortRef = useRef(null)

  /* ── reset ──────────────────────────────────────────────────────────────── */
  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setSubmitting(false)
    setSubmitted(false)
    setError(null)
  }, [])

  /* ── setErrorSafe — guarantees string ────────────────────────────────────── */
  const setErrorSafe = useCallback((val) => {
    const msg = toStr(val)
    setError(msg || 'An unexpected error occurred. Please try again.')
  }, [])

  /* ── submit ─────────────────────────────────────────────────────────────── */
  const submit = useCallback(async (formData = {}) => {
    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setSubmitting(true)
    setError(null)

    // ── Build payload ──────────────────────────────────────────────────────
    const text     = String(formData.testimonial_text || formData.review || '').trim()
    const rating   = Math.min(5, Math.max(1, parseInt(formData.rating, 10) || 5))
    const trip     = String(formData.trip     || '').trim()
    const location = String(formData.location || '').trim()

    const payload = { testimonial_text: text, rating }
    if (trip)     payload.trip     = trip
    if (location) payload.location = location

    // ── Build headers ──────────────────────────────────────────────────────
    const token   = getAuthToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const endpoint = `${API_BASE}/api/testimonials/submit`

    // ── DevTools logging ───────────────────────────────────────────────────
    if (IS_DEV) {
      console.group(`%c[useSubmitTestimonial] POST ${endpoint}`, 'color:#16a34a;font-weight:bold')
      console.log('payload  :', payload)
      console.log('token    :', token ? `${token.slice(0, 20)}…` : 'NONE ⚠️')
      console.log('headers  :', headers)
    }

    // ── 20-second timeout ──────────────────────────────────────────────────
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 20_000)

    try {
      const response = await fetch(endpoint, {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      })

      clearTimeout(timeoutId)

      // ── Parse body ────────────────────────────────────────────────────────
      const contentType = response.headers.get('content-type') || ''
      let body = null

      if (contentType.includes('application/json')) {
        try   { body = await response.json() }
        catch { body = null }
      } else {
        try   { body = { message: await response.text() } }
        catch { body = null }
      }

      if (IS_DEV) {
        console.log('status   :', response.status, response.statusText)
        console.log('body     :', body)
        console.groupEnd()
      }

      // ── Handle errors by status ──────────────────────────────────────────
      if (!response.ok) {
        let msg

        if (response.status === 404) {
          // 404 almost always means route not found — give actionable message
          msg = IS_DEV
            ? `404: Route not found. Check that POST ${endpoint} is registered in your router BEFORE any /:id wildcard.`
            : 'The review service is temporarily unavailable. Please try again or contact us via WhatsApp.'
        } else if (response.status === 401) {
          msg = 'Please log in to submit a review.'
        } else if (response.status === 403) {
          msg = 'You do not have permission to submit reviews.'
        } else if (response.status === 429) {
          const base = toStr(body) || 'You have already submitted a review recently.'
          const wait = body?.retryAfter
          msg = wait
            ? `${base} Please try again in ${Math.ceil(Number(wait) / 3600)} hour(s).`
            : base
        } else {
          msg = parseServerError(body, response.status)
        }

        setErrorSafe(msg)
        setSubmitting(false)
        return
      }

      // ── Success ───────────────────────────────────────────────────────────
      setSubmitted(true)
      setError(null)

    } catch (err) {
      clearTimeout(timeoutId)

      if (IS_DEV) {
        console.error('[useSubmitTestimonial] caught:', err)
        console.groupEnd()
      }

      if (err.name === 'AbortError') {
        setErrorSafe('Request timed out. Please check your connection and try again.')
      } else {
        setErrorSafe(err.message || 'Failed to submit. Please try again.')
      }
    } finally {
      setSubmitting(false)
      abortRef.current = null
    }
  }, [setErrorSafe])

  return {
    submit,
    submitting,
    submitted,
    error,    // guaranteed: string | null
    reset,
  }
}