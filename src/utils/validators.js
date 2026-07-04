// utils/validators.js
"use strict";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validate email format.
 * Returns true if valid.
 */
const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_RE.test(email.trim().toLowerCase());
};

/**
 * Validate full name — 2 to 100 characters, no pure digits.
 * Returns true if valid.
 */
const validateName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100 && /[a-zA-Z]/.test(trimmed);
};

module.exports = { validateEmail, validateName };