// Shared authenticated GET cache for the Altuvera SPA.
// Memory-only: it survives route changes but never persists private dashboard
// data to localStorage/sessionStorage.
const cache = new Map();
const pending = new Map();

export const userDataCache = {
  get(key) {
    const item = cache.get(key);
    if (!item) return null;
    if (item.expiresAt <= Date.now()) { cache.delete(key); return null; }
    return item.data;
  },
  set(key, data, ttl = 30_000) {
    cache.set(key, { data, expiresAt: Date.now() + ttl });
  },
  getPending(key) { return pending.get(key) || null; },
  setPending(key, promise) { pending.set(key, promise); return promise; },
  clearPending(key) { pending.delete(key); },
  clear() { cache.clear(); pending.clear(); },
};

export default userDataCache;
