// src/utils/apiBase.js
// ═══════════════════════════════════════════════════════════════════════════
// Single source of truth for all API URL construction.
// API_URL already ends with /api — never append /api to paths.
// ═══════════════════════════════════════════════════════════════════════════

// ── Base URL ──────────────────────────────────────────────────────────────
// Always ends with /api, never has a trailing slash.
// Example: "https://backend-jd8f.onrender.com/api"

const RAW_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-jd8f.onrender.com/api";

/**
 * Strip trailing slashes from any string.
 */
const stripTrailing = (s = "") => s.replace(/\/+$/, "");

/**
 * Ensure a path segment starts with exactly one slash.
 */
const leadingSlash = (s = "") =>
  s ? (s.startsWith("/") ? s : `/${s}`) : "/";

/**
 * The resolved API base URL.
 * Always ends WITHOUT a trailing slash.
 * Always ends WITH /api.
 *
 * Examples:
 *   VITE_API_URL = "https://backend-jd8f.onrender.com"
 *     → "https://backend-jd8f.onrender.com/api"
 *
 *   VITE_API_URL = "https://backend-jd8f.onrender.com/api"
 *     → "https://backend-jd8f.onrender.com/api"
 *
 *   VITE_API_URL = "https://backend-jd8f.onrender.com/api/"
 *     → "https://backend-jd8f.onrender.com/api"
 */
const buildBase = () => {
  const base = stripTrailing(RAW_URL.trim());
  // If it already ends with /api, use as-is
  if (base.endsWith("/api")) return base;
  // Otherwise append /api
  return `${base}/api`;
};

export const API_URL = buildBase();

// Legacy aliases used by other files
export const API_URLS    = [API_URL];
export const API_BASE    = API_URL;

// ── URL builder ───────────────────────────────────────────────────────────

/**
 * Convert a relative path to a full API URL.
 *
 * IMPORTANT: paths must NOT include /api — it is already in API_URL.
 *
 * ✅ toAbsoluteApiUrl("/users/login")
 *      → "https://backend-jd8f.onrender.com/api/users/login"
 *
 * ✅ toAbsoluteApiUrl("/destinations?is_active=true")
 *      → "https://backend-jd8f.onrender.com/api/destinations?is_active=true"
 *
 * ❌ toAbsoluteApiUrl("/api/destinations")   ← DON'T do this
 *      → "https://backend-jd8f.onrender.com/api/destinations"
 *      (it auto-strips the /api prefix, so it still works)
 *
 * @param {string} path   - relative path, with or without leading slash
 * @param {string} [base] - override base URL (defaults to API_URL)
 * @returns {string}      - absolute URL
 */
export const toAbsoluteApiUrl = (path = "", base = API_URL) => {
  // Already absolute
  if (/^https?:\/\//i.test(path)) return path;

  // Strip any accidental /api prefix from the path
  // because API_URL already contains /api
  let clean = path.trim();
  if (clean.startsWith("/api/")) clean = clean.slice(4);   // "/api/foo" → "/foo"
  else if (clean === "/api")     clean = "/";               // "/api"    → "/"

  return `${stripTrailing(base)}${leadingSlash(clean)}`;
};

/**
 * Extract just the path portion from a full URL.
 * Strips /api prefix if present.
 */
export const toApiPath = (url = "") => {
  if (!url || typeof url !== "string") return "";

  let path = url;
  if (!/^\//.test(url)) {
    try {
      const parsed = new URL(url);
      path = parsed.pathname + parsed.search + parsed.hash;
    } catch {
      path = leadingSlash(url);
    }
  }

  if (path.startsWith("/api/")) return path.slice(4);
  if (path === "/api")          return "/";
  return path;
};

// ── Authenticated fetch ───────────────────────────────────────────────────

/**
 * Fetch wrapper that:
 *  - Resolves relative paths against API_URL
 *  - Attaches Bearer token if available
 *  - Sets Content-Type and Accept headers
 *
 * @param {string}       path     - relative path (no /api prefix)
 * @param {RequestInit}  options  - standard fetch options
 * @returns {Promise<Response>}
 */
export const apiFetch = (path, options = {}) => {
  const url = /^https?:\/\//i.test(path || "")
    ? path
    : toAbsoluteApiUrl(path);

  const token =
    (() => {
      try {
        return (
          localStorage.getItem("altuvera_auth_token")   ||
          sessionStorage.getItem("altuvera_auth_token") ||
          null
        );
      } catch {
        return null;
      }
    })();

  return fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept:         "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

export default API_URL;