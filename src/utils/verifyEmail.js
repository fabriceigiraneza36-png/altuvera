// utils/verifyEmail.js
// Provides a small wrapper around the backend auth verification routes.

import { toAbsoluteApiUrl } from "./apiBase";

const callVerifyEndpoint = async (payload) => {
  const response = await fetch(toAbsoluteApiUrl("/users/verify-code"), {
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
  return callVerifyEndpoint({ action: "send", email, purpose });
};

export const verifyCode = async ({ email, verificationId, code }) => {
  return callVerifyEndpoint({ action: "verify", email, verificationId, code });
};
