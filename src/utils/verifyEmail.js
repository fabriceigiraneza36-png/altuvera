// src/utils/verifyEmail.js
// ═══════════════════════════════════════════════════════════════════════════
// OTP verification utilities — auth flows ONLY, never contact forms.
//
// Confirmed backend endpoints (routes/users.js):
//   POST /api/users/login        → sends OTP (authLimiter)
//   POST /api/users/verify-code  → verifies OTP (verifyLimiter)
//   POST /api/users/resend-code  → resends OTP (authLimiter)
// ═══════════════════════════════════════════════════════════════════════════

import { toAbsoluteApiUrl } from "./apiBase";

// ─── Confirmed OTP endpoints ─────────────────────────────────────────────
// These match routes/users.js exactly.
const OTP_ENDPOINTS = {
  send:   "/users/login",        // POST — triggers OTP send
  verify: "/users/verify-code",  // POST — submits the 6-digit code
  resend: "/users/resend-code",  // POST — resends with fresh code
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────
/**
 * POST to an OTP endpoint.
 * Throws a clean, user-friendly Error on every failure.
 *
 * @param {string} endpoint  - key of OTP_ENDPOINTS
 * @param {object} payload   - JSON body
 * @returns {Promise<object>}
 */
const callOtpApi = async (endpoint, payload) => {
  const url = toAbsoluteApiUrl(endpoint);

  if (import.meta.env.DEV) {
    console.log(`[verifyEmail] POST ${url}`, {
      ...payload,
      // Partially mask OTP codes in dev logs
      code: payload.code
        ? `${String(payload.code).slice(0, 2)}****`
        : undefined,
    });
  }

  // ── Network request ───────────────────────────────────────────────────
  let response;
  try {
    response = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Accept:         "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Network error — please check your connection and try again."
    );
  }

  // ── Parse response ────────────────────────────────────────────────────
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Server returned an unexpected response (${response.status}). ` +
      "Please try again."
    );
  }

  // ── Handle errors by status code ──────────────────────────────────────
  if (!response.ok) {
    const serverMsg =
      result?.message     ||
      result?.error       ||
      result?.errors?.[0] ||
      "";

    switch (response.status) {
      case 400:
        throw Object.assign(
          new Error(serverMsg || "Invalid request. Please check your details."),
          { status: 400, data: result }
        );

      case 401:
      case 403:
        throw Object.assign(
          new Error(
            serverMsg ||
            "Verification failed. The code may be incorrect or expired."
          ),
          { status: response.status, data: result }
        );

      case 404:
        // Should never happen if OTP_ENDPOINTS are correct
        console.error(
          `[verifyEmail] 404 at ${url}\n` +
          "OTP_ENDPOINTS in verifyEmail.js may not match backend routes.\n" +
          "Expected: POST /api/users/login, /api/users/verify-code, /api/users/resend-code"
        );
        throw new Error(
          "Verification service unavailable. Please try again or contact support."
        );

      case 429: {
        // Rate limit — extract wait time from response if available
        const retryAfter =
          result?.retryAfter  ||
          result?.retry_after ||
          result?.waitSeconds ||
          result?.wait        ||
          40;
        const err       = new Error(
          `Please wait ${retryAfter} seconds before requesting a new code.`
        );
        err.status      = 429;
        err.retryAfter  = retryAfter;
        err.data        = result;
        throw err;
      }

      default:
        if (response.status >= 500) {
          throw Object.assign(
            new Error(
              serverMsg ||
              "Our servers are having trouble. Please try again in a moment."
            ),
            { status: response.status, data: result }
          );
        }
        throw Object.assign(
          new Error(serverMsg || `Request failed (${response.status})`),
          { status: response.status, data: result }
        );
    }
  }

  return result;
};

// ─── Send OTP ─────────────────────────────────────────────────────────────
/**
 * Request an OTP be sent to the given email.
 * Maps to: POST /api/users/login
 *
 * Used for: account registration, login, security checks.
 * NOT for contact forms.
 *
 * @param {{ email: string, purpose?: string }} opts
 */
export const sendVerificationCode = async ({
  email,
  purpose = "verify",
}) => {
  if (!email?.trim()) {
    throw new Error("Email address is required.");
  }

  return callOtpApi(OTP_ENDPOINTS.send, {
    email:   email.trim().toLowerCase(),
    purpose, // backend may or may not use this — harmless if ignored
  });
};

// ─── Verify OTP ───────────────────────────────────────────────────────────
/**
 * Submit a 6-digit OTP code.
 * Maps to: POST /api/users/verify-code
 *
 * @param {{ email: string, code: string | number }} opts
 */
export const verifyCode = async ({ email, code }) => {
  if (!email?.trim()) throw new Error("Email address is required.");
  if (!code)          throw new Error("Verification code is required.");

  // Digits only, exactly 6 characters
  const sanitized = String(code).replace(/\D/g, "").slice(0, 6);
  if (sanitized.length !== 6) {
    throw new Error("Please enter a valid 6-digit code.");
  }

  return callOtpApi(OTP_ENDPOINTS.verify, {
    email: email.trim().toLowerCase(),
    code:  sanitized,
  });
};

// ─── Resend OTP ───────────────────────────────────────────────────────────
/**
 * Request a fresh OTP (invalidates previous code, resets rate-limit timer).
 * Maps to: POST /api/users/resend-code
 *
 * @param {{ email: string }} opts
 */
export const resendVerificationCode = async ({ email }) => {
  if (!email?.trim()) {
    throw new Error("Email address is required.");
  }

  return callOtpApi(OTP_ENDPOINTS.resend, {
    email: email.trim().toLowerCase(),
  });
};