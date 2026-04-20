const DEFAULT_REMOTE_API_URL = "https://backend-jd8f.onrender.com/api";
const DEFAULT_LOCAL_API_URL = "http://localhost:3000/api";

const safeTrim = (value) => (typeof value === "string" ? value.trim() : "");

const stripTrailingSlashes = (value = "") => value.replace(/\/+$/, "");
const ensureLeadingSlash = (value = "") =>
  value ? (value.startsWith("/") ? value : `/${value}`) : "/";

const envApiUrl = safeTrim(import.meta.env.VITE_API_URL || "");
const envApiBaseUrl = safeTrim(import.meta.env.VITE_API_BASE_URL || "");

const configuredBaseUrls = [
  envApiUrl,
  envApiBaseUrl,
  import.meta.env.DEV ? "/api" : "",
  DEFAULT_REMOTE_API_URL,
  DEFAULT_LOCAL_API_URL,
]
  .map(stripTrailingSlashes)
  .filter(Boolean);

export const API_URLS = [...new Set(configuredBaseUrls)];
export const API_URL = API_URLS[0] || DEFAULT_REMOTE_API_URL;

export const toAbsoluteApiUrl = (path = "", base = API_URL) => {
  if (!path) return stripTrailingSlashes(base);
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) {
    return `${stripTrailingSlashes(base)}${path}`;
  }
  return `${stripTrailingSlashes(base)}${ensureLeadingSlash(path)}`;
};

export const toApiPath = (url = "") => {
  if (!url || typeof url !== "string") return "";

  let path = url;

  if (!url.startsWith("/")) {
    try {
      const parsed = new URL(url);
      path = parsed.pathname + parsed.search + parsed.hash;
    } catch {
      path = ensureLeadingSlash(url);
    }
  }

  // Strip leading '/api' if present to avoid duplication when appending to base URLs
  if (path.startsWith("/api/")) {
    return path.substring(4);
  } else if (path === "/api") {
    return "/";
  }

  return path;
};

export const apiFetch = (path, options = {}) => {
  const target = /^https?:\/\//i.test(path || "")
    ? path
    : toAbsoluteApiUrl(path, API_URL);

  return fetch(target, {
    credentials: "include",
    ...options,
  });
};

export default API_URL;
