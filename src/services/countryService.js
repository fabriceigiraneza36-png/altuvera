// src/services/countryService.js

import { API_URL } from "../utils/apiBase";

// Use proxy in dev (/api), full URL in production
const API_BASE = import.meta.env.VITE_API_URL || "/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_URL;

// Determine the correct base URL based on environment
const getBaseUrl = () => {
  // In development, use the proxy (/api -> https://backend-1-ghrv.onrender.com//api)
  // In production, use the full URL
  if (import.meta.env.DEV) {
    return API_BASE;
  }
  return API_BASE_URL;
};

class CountryService {
  constructor() {
    this.base = `${getBaseUrl()}/countries`;
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
