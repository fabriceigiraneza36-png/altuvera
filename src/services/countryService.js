// src/services/countryService.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class CountryService {
  constructor() {
    this.base = `${API_BASE}/countries`;
    this.abortControllers = new Map();
  }

  _abort(key) {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key).abort();
    }
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller.signal;
  }

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

    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const error = new Error(body.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.code = body.code || "UNKNOWN";
        throw error;
      }
      return await response.json();
    } catch (err) {
      if (err.name === "AbortError") return null;
      throw err;
    }
  }

  _qs(params) {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    return filtered.length
      ? "?" + new URLSearchParams(filtered).toString()
      : "";
  }

  getAll(params = {}) {
    return this._fetch(`${this.base}${this._qs(params)}`, {}, "getAll");
  }

  getFeatured(limit = 6) {
    return this._fetch(
      `${this.base}/featured?limit=${limit}`,
      {},
      "featured"
    );
  }

  getOne(idOrSlug) {
    return this._fetch(`${this.base}/${idOrSlug}`, {}, `getOne-${idOrSlug}`);
  }

  getDestinations(countryId) {
    return this._fetch(
      `${this.base}/${countryId}/destinations`,
      {},
      `destinations-${countryId}`
    );
  }

  cancelAll() {
    this.abortControllers.forEach((c) => c.abort());
    this.abortControllers.clear();
  }
}

const countryService = new CountryService();
export default countryService;