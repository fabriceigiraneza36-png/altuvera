// utils/verifyEmail.js
// Provides a small wrapper around the /api/verify-email server endpoint.

const API_URL = import.meta.env.VITE_API_URL || "https://backend-1-ghrv.onrender.com/api";

const callApi = async (payload) => {
  const response = await fetch(`${API_URL}/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || result.message || "Verification request failed");
  }

  return result;
};

export const sendVerificationCode = async ({ email, purpose = "verification" }) => {
  return callApi({ action: "send", email, purpose });
};

export const verifyCode = async ({ email, verificationId, code }) => {
  return callApi({ action: "verify", email, verificationId, code });
};
