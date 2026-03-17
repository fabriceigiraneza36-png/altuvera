// utils/fetchCache.js
// Lightweight in-memory fetch cache to reduce redundant network requests.

const CACHE = new Map();

export const fetchWithCache = async (url, options = {}, ttlMs = 30_000) => {
  const key = `${url}|${JSON.stringify(options)}`;
  const now = Date.now();

  const cached = CACHE.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.response.clone();
  }

  const response = await fetch(url, options);
  // Only cache successful GET responses
  if (response.ok && (!options.method || options.method.toUpperCase() === "GET")) {
    const clone = response.clone();
    CACHE.set(key, {
      response: clone,
      expiresAt: now + ttlMs,
    });
  }

  return response;
};

export const clearFetchCache = () => {
  CACHE.clear();
};
