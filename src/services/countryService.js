// src/services/countryService.js

import enhancedApiClient from "../utils/enhancedApiClient";

const BASE_PATH = "/countries";

class CountryService {
  constructor() {
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

  async _fetch(path, options = {}, abortKey = null) {
    try {
      const result = await enhancedApiClient.request(`${BASE_PATH}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        // Cache country data for 15 minutes (900000 ms) and disable cache-busting timestamp
        cacheTime: 15 * 60 * 1000,
        cacheBust: false,
      });

      if (!result.success) {
        throw new Error(result.error || "Request failed");
      }

      return result.data;
    } catch (err) {
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

  async getAll(params = {}) {
    const result = await this._fetch(`${this._qs(params)}`, {}, "getAll");
    return result;
  }

  async getFeatured(limit = 6) {
    const result = await this._fetch(`/featured?limit=${limit}`, {}, "featured");
    return result;
  }

  async getOne(idOrSlug) {
    const result = await this._fetch(`/${idOrSlug}`, {}, `getOne-${idOrSlug}`);
    return result;
  }

  async getDestinations(countryId) {
    const result = await this._fetch(
      `/${countryId}/destinations`,
      {},
      `destinations-${countryId}`
    );
    return result;
  }

  cancelAll() {
    this.abortControllers.forEach((c) => c.abort());
    this.abortControllers.clear();
  }

  // Get current backend info
  getBackendInfo() {
    return enhancedApiClient.healthCheck();
  }
}

// Store a single shared instance across HMR reloads to avoid "Identifier 'countryService' has already been declared" errors
// (some HMR runtimes may re-execute modules without fully clearing the module scope).
var countryService = globalThis.__altuvera_countryService;
if (!countryService) {
  countryService = new CountryService();
  globalThis.__altuvera_countryService = countryService;
}

export default countryService;
