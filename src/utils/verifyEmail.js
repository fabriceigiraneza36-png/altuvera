// utils/verifyEmail.js
// ═══════════════════════════════════════════════════════════════════════════
// Email verification utilities — OTP send / verify / resend
// ONLY used for auth flows (register, login, account security).
// NEVER used for contact forms — those go directly via sendContactForm().
// ═══════════════════════════════════════════════════════════════════════════

import { toAbsoluteApiUrl } from "./apiBase";

// ─── Constants ────────────────────────────────────────────────────────────
const OTP_ENDPOINTS = {
  send:   "/users/send-otp",     // POST — sends a fresh OTP
  verify: "/users/verify-otp",   // POST — verifies submitted code
  resend: "/users/resend-otp",   // POST — resends with new code + resets timer
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────
/**
 * POST to an OTP endpoint.
 * Always throws a clean Error on failure so callers can catch & display.
 *
 * @param {string} endpoint  - relative API path (from OTP_ENDPOINTS)
 * @param {object} payload   - JSON body
 * @returns {Promise<object>} parsed JSON response
 */
const callOtpApi = async (endpoint, payload) => {
  const url = toAbsoluteApiUrl(endpoint);

  if (import.meta.env.DEV) {
    console.log(`[verifyEmail] POST ${url}`, {
      ...payload,
      // Never log actual OTP codes in full
      code: payload.code ? `${String(payload.code).slice(0, 2)}****` : undefined,
    });
  }

  let response;
  try {
    response = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Accept:         "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    // Fetch itself failed (offline, DNS, CORS, etc.)
    throw new Error(
      "Network error — please check your connection and try again."
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Server returned an unexpected response (${response.status}). ` +
      "Please try again."
    );
  }

  if (!response.ok) {
    // Map common HTTP status codes to user-friendly messages
    const serverMsg =
      result?.message ||
      result?.error   ||
      result?.errors?.[0] ||
      "";

    if (response.status === 429) {
      // Rate limit — extract wait time if provided
      const retryAfter =
        result?.retryAfter ||
        result?.retry_after ||
        result?.waitSeconds ||
        40;
      const err = new Error(
        `Please wait ${retryAfter} seconds before requesting a new code.`
      );
      err.status      = 429;
      err.retryAfter  = retryAfter;
      err.data        = result;
      throw err;
    }

    if (response.status === 400) {
      throw Object.assign(
        new Error(serverMsg || "Invalid request. Please check your details."),
        { status: 400, data: result }
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw Object.assign(
        new Error(serverMsg || "Verification failed. The code may have expired."),
        { status: response.status, data: result }
      );
    }

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

  return result;
};

// ─── Send OTP ─────────────────────────────────────────────────────────────
/**
 * Request a new OTP code be sent to the given email.
 * Used for: account registration, login verification, security checks.
 * NOT for contact forms.
 *
 * @param {{ email: string, purpose?: string }} opts
 *   purpose: "verify" | "login" | "resend" | "reverification"
 */
export const sendVerificationCode = async ({
  email,
  purpose = "verify",
}) => {
  if (!email?.trim()) {
    throw new Error("Email address is required.");
  }

  const validPurposes = ["verify", "login", "resend", "reverification"];
  const resolvedPurpose = validPurposes.includes(purpose) ? purpose : "verify";

  return callOtpApi(OTP_ENDPOINTS.send, {
    email:   email.trim().toLowerCase(),
    purpose: resolvedPurpose,
  });
};

// ─── Verify OTP ───────────────────────────────────────────────────────────
/**
 * Submit a 6-digit OTP code for verification.
 *
 * @param {{ email: string, code: string | number }} opts
 */
export const verifyCode = async ({ email, code }) => {
  if (!email?.trim()) throw new Error("Email address is required.");
  if (!code)          throw new Error("Verification code is required.");

  // Sanitise: digits only, exactly 6
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
 * Request a fresh OTP (invalidates previous code, resets the rate-limit timer).
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