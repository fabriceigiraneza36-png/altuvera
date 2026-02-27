// src/services/virtualTourService.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class VirtualTourService {
  constructor() {
    this.base = `${API_BASE}/virtual-tours`;
    this.abortControllers = new Map();
  }

  // ── Cancel any in-flight request for a given key ──
  _abort(key) {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key).abort();
    }
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller.signal;
  }

  // ── Generic fetch wrapper ─────────────────────────
  async _fetch(url, options = {}, abortKey = null) {
    const signal = abortKey ? this._abort(abortKey) : undefined;

    const config = {
      ...options,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // Attach auth token when available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error     = new Error(errorBody.error || `HTTP ${response.status}`);
        error.status    = response.status;
        error.code      = errorBody.code || "UNKNOWN";
        error.details   = errorBody.details || [];
        throw error;
      }

      return await response.json();
    } catch (err) {
      if (err.name === "AbortError") {
        return null; // silently swallow cancelled requests
      }
      throw err;
    }
  }

  // ─── Build query string from object ───────────────
  _qs(params) {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    return filtered.length
      ? "?" + new URLSearchParams(filtered).toString()
      : "";
  }

  // ═══════════════════════════════════════════════════
  // PUBLIC METHODS
  // ═══════════════════════════════════════════════════

  getAll(params = {}) {
    const qs = this._qs(params);
    return this._fetch(`${this.base}${qs}`, {}, "getAll");
  }

  getFeatured(limit = 6) {
    return this._fetch(`${this.base}/featured?limit=${limit}`, {}, "featured");
  }

  getOne(idOrSlug) {
    return this._fetch(`${this.base}/${idOrSlug}`, {}, `getOne-${idOrSlug}`);
  }

  getStats() {
    return this._fetch(`${this.base}/stats`);
  }

  create(data) {
    return this._fetch(this.base, {
      method: "POST",
      body:   JSON.stringify(data),
    });
  }

  update(id, data) {
    return this._fetch(`${this.base}/${id}`, {
      method: "PUT",
      body:   JSON.stringify(data),
    });
  }

  toggleStatus(id, field) {
    return this._fetch(`${this.base}/${id}/toggle`, {
      method: "PATCH",
      body:   JSON.stringify({ field }),
    });
  }

  reorder(orders) {
    return this._fetch(`${this.base}/reorder`, {
      method: "PUT",
      body:   JSON.stringify({ orders }),
    });
  }

  remove(id) {
    return this._fetch(`${this.base}/${id}`, { method: "DELETE" });
  }

  // ── Utility: extract YouTube embed URL ────────────
  static getEmbedUrl(videoUrl) {
    if (!videoUrl) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(regex);
    return match
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
      : videoUrl;
  }

  static getVideoId(videoUrl) {
    if (!videoUrl) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(regex);
    return match ? match[1] : null;
  }

  // Cancel all pending requests (call on unmount)
  cancelAll() {
    this.abortControllers.forEach((ctrl) => ctrl.abort());
    this.abortControllers.clear();
  }
}

// Export singleton
const virtualTourService = new VirtualTourService();
export default virtualTourService;