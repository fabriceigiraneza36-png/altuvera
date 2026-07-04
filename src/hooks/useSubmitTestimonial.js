/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useSubmitTestimonial v3.0
 * ═══════════════════════════════════════════════════════════════════════════
 * - Reads auth token using the EXACT same keys as UserAuthContext (KEYS.TOKEN)
 * - Guaranteed string | null error state — never [object Object]
 * - Correct API_BASE normalisation (no double /api prefix)
 * - 20s timeout with AbortController
 * - Full dev logging
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from "react";

// ── Mirror the exact storage keys used by UserAuthContext ─────────────────
// UserAuthContext uses: localStorage.setItem("altuvera_auth_token", tok)
const TOKEN_KEYS = [
  "altuvera_auth_token",   // primary — matches UserAuthContext KEYS.TOKEN
  "altuvera_refresh_token",// skip — but keep list for fallback
  "token",
  "authToken",
  "auth_token",
  "accessToken",
  "access_token",
  "jwt",
];

// ── Normalise base URL — strip trailing slash AND trailing /api ───────────
const rawBase = (
  import.meta.env.VITE_API_URL  ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://backend-jd8f.onrender.com"
).replace(/\/+$/, "");

// If someone set VITE_API_URL="https://…/api" strip the /api suffix
// so we always construct paths ourselves
const API_BASE = rawBase.endsWith("/api")
  ? rawBase.slice(0, -4)
  : rawBase;

// Full endpoint — always /api/testimonials/submit
const SUBMIT_ENDPOINT = `${API_BASE}/api/testimonials/submit`;

const IS_DEV = import.meta.env.DEV;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/** Always returns a plain string — never throws, never returns an object */
const toStr = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string")           return val;
  if (val instanceof Error)              return val.message || "An error occurred.";
  if (typeof val === "object") {
    if (typeof val.error   === "string" && val.error)   return val.error;
    if (typeof val.message === "string" && val.message) return val.message;
    if (Array.isArray(val.errors))
      return val.errors
        .map((e) => e.msg || e.message || String(e))
        .filter(Boolean)
        .join(". ");
    if (Array.isArray(val.details))
      return val.details
        .map((d) => d.message || d.msg || String(d))
        .filter(Boolean)
        .join(". ");
    try { return JSON.stringify(val); } catch { return "An error occurred."; }
  }
  return String(val);
};

/** Read token — checks localStorage then sessionStorage for each key */
const getAuthToken = () => {
  for (const key of TOKEN_KEYS) {
    // Skip non-token keys
    if (key === "altuvera_refresh_token") continue;
    try {
      const ls = localStorage.getItem(key);
      if (ls && ls !== "null" && ls !== "undefined") return ls;
      const ss = sessionStorage.getItem(key);
      if (ss && ss !== "null" && ss !== "undefined") return ss;
    } catch { /* storage unavailable */ }
  }
  return null;
};

/** Parse error from a failed response body */
const parseServerError = (body, status) => {
  if (!body) return `Request failed (${status}). Please try again.`;
  const msg = toStr(body);
  // Avoid surfacing raw JSON strings to users
  if (msg.startsWith("{") || msg.startsWith("["))
    return `Server error (${status}). Please try again.`;
  return msg || `Request failed (${status}). Please try again.`;
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export const useSubmitTestimonial = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState(null); // string | null ONLY

  const abortRef = useRef(null);

  // ── setErrorSafe — guarantees string ─────────────────────────────────────
  const setErrorSafe = useCallback((val) => {
    const msg = toStr(val);
    setError(msg || "An unexpected error occurred. Please try again.");
  }, []);

  // ── reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    try {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    } catch { /* ignore */ }
    setSubmitting(false);
    setSubmitted(false);
    setError(null);
  }, []);

  // ── submit ────────────────────────────────────────────────────────────────
  const submit = useCallback(async (formData = {}) => {
    // Cancel any in-flight request
    try {
      if (abortRef.current) abortRef.current.abort();
    } catch { /* ignore */ }

    const controller  = new AbortController();
    abortRef.current  = controller;

    setSubmitting(true);
    setSubmitted(false);
    setError(null);

    // ── Build payload ───────────────────────────────────────────────────────
    const text     = String(formData.testimonial_text || formData.review || "").trim();
    const rating   = Math.min(5, Math.max(1, parseInt(String(formData.rating || "5"), 10) || 5));
    const trip     = String(formData.trip     || "").trim();
    const location = String(formData.location || "").trim();

    if (!text) {
      setErrorSafe("Review text is required.");
      setSubmitting(false);
      return;
    }

    const payload = { testimonial_text: text, rating };
    if (trip)     payload.trip     = trip;
    if (location) payload.location = location;

    // ── Auth header ─────────────────────────────────────────────────────────
    const token   = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // ── Dev logging ─────────────────────────────────────────────────────────
    if (IS_DEV) {
      console.group(
        "%c[useSubmitTestimonial] POST " + SUBMIT_ENDPOINT,
        "color:#16a34a;font-weight:bold",
      );
      console.log("API_BASE :", API_BASE);
      console.log("endpoint :", SUBMIT_ENDPOINT);
      console.log("payload  :", payload);
      console.log(
        "token    :",
        token ? `${token.slice(0, 25)}…` : "NONE ⚠️  (user may not be logged in)",
      );
      console.groupEnd();
    }

    // ── 20-second timeout ───────────────────────────────────────────────────
    const timeoutId = setTimeout(() => {
      try { controller.abort(); } catch { /* ignore */ }
    }, 20_000);

    try {
      const response = await fetch(SUBMIT_ENDPOINT, {
        method:  "POST",
        headers,
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      });

      clearTimeout(timeoutId);

      // ── Parse response body ───────────────────────────────────────────────
      const contentType = response.headers.get("content-type") || "";
      let body = null;

      try {
        if (contentType.includes("application/json")) {
          body = await response.json();
        } else {
          const raw = await response.text();
          body = raw ? { message: raw } : null;
        }
      } catch { body = null; }

      if (IS_DEV) {
        console.log(
          "[useSubmitTestimonial] status:", response.status,
          "| body:", body,
        );
      }

      // ── Error responses ───────────────────────────────────────────────────
      if (!response.ok) {
        let msg;

        switch (response.status) {
          case 400:
            msg = toStr(body) || "Invalid submission. Please check your input.";
            break;

          case 401:
            msg = "Please log in to submit a review.";
            break;

          case 403:
            msg = "You do not have permission to submit reviews.";
            break;

          case 404:
            msg = IS_DEV
              ? `404 — Route not found.\n` +
                `Endpoint: ${SUBMIT_ENDPOINT}\n` +
                `Check VITE_API_URL="${rawBase}" is correct and the ` +
                `/api/testimonials/submit route is registered in your Express app.`
              : "The review service is temporarily unavailable. Please try again later.";
            break;

          case 429: {
            const base    = toStr(body) || "You have already submitted a review recently.";
            const waitSec = body?.retryAfter ? Number(body.retryAfter) : null;
            msg = waitSec
              ? `${base} Please try again in ${Math.ceil(waitSec / 3600)} hour(s).`
              : base;
            break;
          }

          case 500:
          case 502:
          case 503:
            msg = "The server encountered an error. Please try again in a moment.";
            break;

          default:
            msg = parseServerError(body, response.status);
        }

        setErrorSafe(msg);
        setSubmitting(false);
        return;
      }

      // ── Success ───────────────────────────────────────────────────────────
      if (IS_DEV) {
        console.log("[useSubmitTestimonial] ✅ Submitted successfully:", body);
      }
      setSubmitted(true);
      setError(null);

    } catch (err) {
      clearTimeout(timeoutId);

      if (IS_DEV) console.error("[useSubmitTestimonial] caught:", err);

      if (err.name === "AbortError") {
        setErrorSafe(
          "Request timed out. Please check your connection and try again.",
        );
      } else if (err.message?.toLowerCase().includes("failed to fetch")) {
        setErrorSafe(
          "Unable to reach the server. Please check your internet connection.",
        );
      } else {
        setErrorSafe(err.message || "Failed to submit. Please try again.");
      }
    } finally {
      setSubmitting(false);
      abortRef.current = null;
    }
  }, [setErrorSafe]);

  return {
    submit,
    submitting,
    submitted,
    error,  // guaranteed: string | null — safe to render directly in JSX
    reset,
  };
};