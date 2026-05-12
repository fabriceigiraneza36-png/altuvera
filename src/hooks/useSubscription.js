/**
 * useSubscription.js
 * Connects SubscriptionForm to the live backend API
 */

import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com';

// ── Safely extract a string message from any error shape ──────────────────────
const extractErrorMessage = (data, fallback = 'Subscription failed. Please try again.') => {
  if (!data) return fallback;

  // data.error is a string
  if (typeof data.error === 'string') return data.error;

  // data.error is an object { code, message } or { message }
  if (typeof data.error === 'object' && data.error !== null) {
    if (typeof data.error.message === 'string') return data.error.message;
    if (typeof data.error.code    === 'string') return data.error.code;
    return fallback;
  }

  // data.message is a string
  if (typeof data.message === 'string') return data.message;

  // data.message is an object
  if (typeof data.message === 'object' && data.message !== null) {
    if (typeof data.message.message === 'string') return data.message.message;
    return fallback;
  }

  return fallback;
};

export const useSubscription = () => {
  const [state, setState] = useState({
    loading:           false,
    success:           false,
    error:             null,   // always null | string — never an object
    alreadySubscribed: false,
    subscriber:        null,
  });

  const reset = useCallback(() => {
    setState({
      loading:           false,
      success:           false,
      error:             null,
      alreadySubscribed: false,
      subscriber:        null,
    });
  }, []);

  const subscribe = useCallback(async ({ email, name = '', source = 'website' }) => {

    // ── Client-side validation ──────────────────────────────────────────────
    if (!email?.trim()) {
      setState((s) => ({ ...s, error: 'Email is required.' }));
      return { success: false, error: 'Email is required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setState((s) => ({ ...s, error: 'Please enter a valid email address.' }));
      return { success: false, error: 'Please enter a valid email address.' };
    }

    setState({
      loading:           true,
      success:           false,
      error:             null,
      alreadySubscribed: false,
      subscriber:        null,
    });

    try {
      const res = await fetch(`${API_BASE}/api/subscribers`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:  email.trim().toLowerCase(),
          name:   name.trim()  || undefined,
          source: source       || 'website',
        }),
      });

      // ── Safely parse JSON (backend might return non-JSON on 5xx) ───────────
      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      }

      // ── Already subscribed (200 + alreadySubscribed flag) ─────────────────
      if (res.status === 200 && data.alreadySubscribed) {
        setState({
          loading:           false,
          success:           true,
          error:             null,
          alreadySubscribed: true,
          subscriber:        null,
        });
        return { success: true, alreadySubscribed: true };
      }

      // ── New subscription (201 or 200 + data.success) ───────────────────────
      if (res.ok && data.success) {
        setState({
          loading:           false,
          success:           true,
          error:             null,
          alreadySubscribed: false,
          subscriber:        data.subscriber ?? null,
        });
        return { success: true, subscriber: data.subscriber ?? null };
      }

      // ── Server-side error — always extract a plain string ──────────────────
      const errorMsg = extractErrorMessage(
        data,
        res.status === 429
          ? 'Too many attempts. Please wait a moment and try again.'
          : res.status >= 500
            ? 'Server error. Please try again shortly.'
            : 'Subscription failed. Please try again.',
      );

      setState({
        loading:           false,
        success:           false,
        error:             errorMsg,          // ← guaranteed string
        alreadySubscribed: false,
        subscriber:        null,
      });
      return { success: false, error: errorMsg };

    } catch (err) {
      // ── Network / fetch error ──────────────────────────────────────────────
      const errorMsg =
        typeof err?.message === 'string' && err.message.toLowerCase().includes('fetch')
          ? 'Connection failed. Please check your internet and try again.'
          : 'Something went wrong. Please try again.';

      setState({
        loading:           false,
        success:           false,
        error:             errorMsg,          // ← guaranteed string
        alreadySubscribed: false,
        subscriber:        null,
      });
      return { success: false, error: errorMsg };
    }
  }, []);

  // ── Unsubscribe ─────────────────────────────────────────────────────────────
  const unsubscribe = useCallback(async (email) => {
    if (!email?.trim()) return { success: false, error: 'Email required.' };

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch(
        `${API_BASE}/api/subscribers/unsubscribe/${encodeURIComponent(email.trim())}`,
        { method: 'DELETE' },
      );

      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try { data = await res.json(); } catch { data = {}; }
      }

      const errorMsg = res.ok
        ? null
        : extractErrorMessage(data, 'Unsubscribe failed. Please try again.');

      setState((s) => ({
        ...s,
        loading: false,
        success: res.ok && !!data.success,
        error:   errorMsg,                   // ← guaranteed string | null
      }));

      return { success: res.ok && !!data.success };

    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error:   'Connection failed. Please try again.',
      }));
      return { success: false, error: 'Connection failed. Please try again.' };
    }
  }, []);

  return { ...state, subscribe, unsubscribe, reset };
};