/**
 * useSubscription.js
 * Connects SubscriptionForm to the live backend API
 */

import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com';

export const useSubscription = () => {
  const [state, setState] = useState({
    loading:           false,
    success:           false,
    error:             null,
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
      setState((s) => ({ ...s, error: 'Email is required' }));
      return { success: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setState((s) => ({ ...s, error: 'Please enter a valid email address' }));
      return { success: false, error: 'Invalid email' };
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

      const data = await res.json();

      // ── Already subscribed (200) ──────────────────────────────────────────
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

      // ── New subscription (201) ────────────────────────────────────────────
      if (res.ok && data.success) {
        setState({
          loading:           false,
          success:           true,
          error:             null,
          alreadySubscribed: false,
          subscriber:        data.subscriber,
        });
        return { success: true, subscriber: data.subscriber };
      }

      // ── Server error ──────────────────────────────────────────────────────
      const errorMsg =
        data.error || data.message || 'Subscription failed. Please try again.';
      setState({
        loading:           false,
        success:           false,
        error:             errorMsg,
        alreadySubscribed: false,
        subscriber:        null,
      });
      return { success: false, error: errorMsg };

    } catch (err) {
      const errorMsg = err.message?.includes('fetch')
        ? 'Connection failed. Please check your internet.'
        : 'Something went wrong. Please try again.';

      setState({
        loading:           false,
        success:           false,
        error:             errorMsg,
        alreadySubscribed: false,
        subscriber:        null,
      });
      return { success: false, error: errorMsg };
    }
  }, []);

  const unsubscribe = useCallback(async (email) => {
    if (!email?.trim()) return { success: false, error: 'Email required' };

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch(
        `${API_BASE}/api/subscribers/unsubscribe/${encodeURIComponent(email.trim())}`,
        { method: 'DELETE' },
      );
      const data = await res.json();

      setState((s) => ({
        ...s,
        loading: false,
        success: res.ok && data.success,
        error:   res.ok ? null : (data.error || 'Unsubscribe failed'),
      }));

      return { success: res.ok && data.success };
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Connection failed' }));
      return { success: false, error: 'Connection failed' };
    }
  }, []);

  return { ...state, subscribe, unsubscribe, reset };
};