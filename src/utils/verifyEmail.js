// utils/verifyEmail.js
import { toAbsoluteApiUrl } from "./apiBase";

// ── Core fetch wrapper ────────────────────────────────────────
const callApi = async (endpoint, payload) => {
  const url = toAbsoluteApiUrl(endpoint);

  // ✅ Debug: log exactly what we're sending
  if (import.meta.env.DEV) {
    console.log(`[verifyEmail] POST ${url}`, payload);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept:         "application/json",
    },
    body: JSON.stringify(payload),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("Server returned invalid JSON");
  }

  if (!response.ok) {
    const err = new Error(
      result?.message || result?.error || `Request failed (${response.status})`
    );
    err.status = response.status;
    err.data   = result;
    throw err;
  }

  return result;
};

// ── Send OTP ──────────────────────────────────────────────────
export const sendVerificationCode = async ({ email, purpose = "verification" }) => {
  if (!email?.trim()) throw new Error("Email is required");

  // Maps to POST /api/users/login or /api/users/register
  // depending on your flow — adjust endpoint as needed
  return callApi("/users/login", {
    email: email.trim().toLowerCase(),
    purpose,
  });
};

// ── Verify OTP ────────────────────────────────────────────────
export const verifyCode = async ({ email, code }) => {
  // ✅ Validate BEFORE sending
  if (!email?.trim()) throw new Error("Email is required");
  if (!code?.trim())  throw new Error("Verification code is required");

  const sanitizedCode = String(code).replace(/\D/g, "").slice(0, 6);
  if (sanitizedCode.length !== 6) throw new Error("Enter a valid 6-digit code");

  return callApi("/users/verify-code", {
    email: email.trim().toLowerCase(),
    code:  sanitizedCode,
  });
};

// ── Resend OTP ────────────────────────────────────────────────
export const resendVerificationCode = async ({ email }) => {
  if (!email?.trim()) throw new Error("Email is required");

  return callApi("/users/resend-code", {
    email: email.trim().toLowerCase(),
  });
};