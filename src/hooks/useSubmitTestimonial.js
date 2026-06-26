/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useSubmitTestimonial v2.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Fixes:
 *  - Uses correct endpoint POST /api/testimonials/submit (not /testimonials)
 *  - Attaches Authorization header from localStorage/sessionStorage
 *  - Structured error parsing — surfaces server validation messages
 *  - Timeout + AbortController so slow Render cold-starts don't hang forever
 *  - Exported reset() clears all state for "write another" flow
 */

import { useState, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export const useSubmitTestimonial = () => {
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState(null)

  const abortRef = useRef(null)

  const reset = useCallback(() => {
    setSubmitting(false)
    setSubmitted(false)
    setError(null)
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const submit = useCallback(async (formData = {}) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller  = new AbortController()
    abortRef.current  = controller

    setSubmitting(true)
    setError(null)

    // ── Build auth header ───────────────────────────────────────────────────
    const token =
      localStorage.getItem('token')  ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token') ||
      null

    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // ── Build payload ───────────────────────────────────────────────────────
    const payload = {
      testimonial_text: String(formData.testimonial_text || formData.review || '').trim(),
      rating:           parseInt(formData.rating, 10) || 5,
      trip:             String(formData.trip     || '').trim() || undefined,
      location:         String(formData.location || '').trim() || undefined,
    }

    // Remove undefined keys
    for (const k of Object.keys(payload)) {
      if (payload[k] === undefined) delete payload[k]
    }

    // ── Fetch with 20s timeout ──────────────────────────────────────────────
    const timeoutId = setTimeout(() => controller.abort(), 20_000)

    try {
      const response = await fetch(
        `${API_BASE}/api/testimonials/submit`,
        {
          method:  'POST',
          headers,
          body:    JSON.stringify(payload),
          signal:  controller.signal,
        },
      )

      clearTimeout(timeoutId)

      // Parse body regardless of status
      let body = null
      try { body = await response.json() } catch { body = {} }

      if (!response.ok) {
        // Surface the server's error message if available
        const msg =
          body?.error   ||
          body?.message ||
          `Submission failed (HTTP ${response.status}). Please try again.`

        // 401 → redirect to login
        if (response.status === 401) {
          setError('Please log in to submit a review.')
          setSubmitting(false)
          return
        }

        // 429 → rate limited
        if (response.status === 429) {
          setError(body?.error || 'You have already submitted a review recently. Please try again later.')
          setSubmitting(false)
          return
        }

        throw new Error(msg)
      }

      setSubmitted(true)
    } catch (err) {
      clearTimeout(timeoutId)

      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.')
      } else {
        setError(err.message || 'Failed to submit your review. Please try again.')
      }
    } finally {
      setSubmitting(false)
      abortRef.current = null
    }
  }, [])

  return { submit, submitting, submitted, error, reset }
}