/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useSubmitTestimonial v2.1
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Fix: error state is ALWAYS a string | null — never an Error object.
 *      Previously setError(err) was called with an Error instance, which
 *      React renders as "[object Object]".
 *
 * Other fixes:
 *  - extractErrorMessage() normalises any thrown value to a string
 *  - Timeout uses AbortController (not setTimeout-only)
 *  - 401 detected before generic error path
 *  - reset() also aborts any in-flight request
 *  - DEV logging so you can see exactly what the server returned
 */

import { useState, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''
const IS_DEV   = import.meta.env.DEV

// ── Always returns a plain string, never an object ───────────────────────────
const extractErrorMessage = (err) => {
  if (!err) return 'An unexpected error occurred.'

  // Plain string
  if (typeof err === 'string') return err

  // AbortError (timeout)
  if (err.name === 'AbortError') return 'Request timed out. Please check your connection and try again.'

  // Error object
  if (err instanceof Error) return err.message || 'An unexpected error occurred.'

  // Anything else — coerce safely
  try { return String(err) } catch { return 'An unexpected error occurred.' }
}

// ── Parse the server JSON body into a user-facing string ─────────────────────
const parseServerError = (body, status) => {
  if (!body || typeof body !== 'object') {
    return `Server error (${status}). Please try again.`
  }

  // Most common server shapes:
  //   { error: "string" }
  //   { message: "string" }
  //   { errors: [{msg:"..."}, ...] }
  //   { details: [{message:"..."}, ...] }

  if (typeof body.error === 'string'   && body.error)   return body.error
  if (typeof body.message === 'string' && body.message) return body.message

  if (Array.isArray(body.errors) && body.errors.length) {
    return body.errors.map(e => e.msg || e.message || String(e)).filter(Boolean).join('. ')
  }

  if (Array.isArray(body.details) && body.details.length) {
    return body.details.map(d => d.message || d.msg || String(d)).filter(Boolean).join('. ')
  }

  return `Request failed (${status}). Please try again.`
}

export const useSubmitTestimonial = () => {
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState(null)   // ALWAYS string | null

  const abortRef = useRef(null)

  // ── reset — clears all state ───────────────────────────────────────────────
  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setSubmitting(false)
    setSubmitted(false)
    setError(null)
  }, [])

  // ── submit ─────────────────────────────────────────────────────────────────
  const submit = useCallback(async (formData = {}) => {
    // Cancel any previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    setSubmitting(true)
    setError(null)

    // ── Auth token ───────────────────────────────────────────────────────────
    const token =
      localStorage.getItem('token')     ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token')   ||
      null

    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // ── Payload — always plain strings/numbers, never undefined ─────────────
    const payload = {
      testimonial_text: String(formData.testimonial_text || formData.review || '').trim(),
      rating:           Math.min(5, Math.max(1, parseInt(formData.rating, 10) || 5)),
    }

    const trip     = String(formData.trip     || '').trim()
    const location = String(formData.location || '').trim()
    if (trip)     payload.trip     = trip
    if (location) payload.location = location

    if (IS_DEV) {
      console.group('[useSubmitTestimonial] submit()')
      console.log('endpoint:', `${API_BASE}/api/testimonials/submit`)
      console.log('payload:', payload)
      console.log('token present:', !!token)
    }

    // ── Timeout: 20 seconds ──────────────────────────────────────────────────
    const timeoutId = setTimeout(() => controller.abort(), 20_000)

    try {
      const response = await fetch(`${API_BASE}/api/testimonials/submit`, {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      })

      clearTimeout(timeoutId)

      // ── Parse body safely ────────────────────────────────────────────────
      let body = null
      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        try { body = await response.json() }
        catch { body = null }
      } else {
        try { body = { message: await response.text() } }
        catch { body = null }
      }

      if (IS_DEV) {
        console.log('response status:', response.status)
        console.log('response body:', body)
        console.groupEnd()
      }

      // ── Handle non-OK responses ──────────────────────────────────────────
      if (!response.ok) {
        let msg

        switch (response.status) {
          case 401:
            msg = 'Please log in to submit a review.'
            break
          case 403:
            msg = 'You do not have permission to submit reviews.'
            break
          case 429: {
            // Prefer server message for rate-limit (it's descriptive)
            const base = body?.error || body?.message || 'You have already submitted a review recently.'
            const wait = body?.retryAfter
            msg = wait
              ? `${base} Please try again in ${Math.ceil(wait / 3600)} hour(s).`
              : base
            break
          }
          case 400:
            msg = parseServerError(body, response.status)
            break
          default:
            msg = parseServerError(body, response.status)
        }

        // Guarantee msg is a plain string
        setError(typeof msg === 'string' ? msg : 'Submission failed. Please try again.')
        setSubmitting(false)
        return
      }

      // ── Success ──────────────────────────────────────────────────────────
      setSubmitted(true)
      setError(null)

    } catch (err) {
      clearTimeout(timeoutId)

      if (IS_DEV) {
        console.error('[useSubmitTestimonial] caught error:', err)
        console.groupEnd()
      }

      // extractErrorMessage ALWAYS returns a string — never an object
      const msg = extractErrorMessage(err)
      setError(msg)

    } finally {
      setSubmitting(false)
      abortRef.current = null
    }
  }, [])

  return {
    submit,
    submitting,
    submitted,
    error,   // guaranteed: string | null
    reset,
  }
}