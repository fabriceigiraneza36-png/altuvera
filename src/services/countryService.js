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
      const signal =
        options.signal ?? (abortKey ? this._abort(abortKey) : undefined);

      // multiBackendFetch returns raw JSON directly (not axios { data } wrapper)
      const response = await enhancedApiClient.request(`${BASE_PATH}${path}`, {
        ...options,
        signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        cacheTime: 15 * 60 * 1000,
        cacheBust: false,
      });

      console.log(`[countryService] Response for ${BASE_PATH}${path}:`, response);

      // ✅ response IS the payload directly — multiBackendFetch is not axios
      const payload = response;

      // Handle { success, data, pagination } envelope
      if (
        payload &&
        typeof payload === "object" &&
        "success" in payload
      ) {
        if (!payload.success) {
          throw new Error(payload.error || "Request failed");
        }
        return payload; // caller gets { success, data, pagination }
      }

      // Raw array or plain object
      return payload;
    } catch (err) {
      throw err;
    }
  }

  _qs(params = {}) {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    return filtered.length
      ? "?" + new URLSearchParams(filtered).toString()
      : "";
  }

  async getAll(params = {}, signal = null) {
    const { signal: _s, ...cleanParams } = params;
    const options = signal ? { signal } : {};

    const body = await this._fetch(
      `${this._qs(cleanParams)}`,
      options,
      signal ? null : "getAll"
    );

    console.log("[countryService.getAll] body:", body);

    // Handle all possible response shapes
    let data = [];
    if (Array.isArray(body)) {
      data = body;
    } else if (Array.isArray(body?.data)) {
      data = body.data;
    } else if (Array.isArray(body?.countries)) {
      data = body.countries;
    } else if (Array.isArray(body?.results)) {
      data = body.results;
    } else {
      console.warn("[countryService.getAll] Unrecognised shape:", body);
    }

    return {
      data,
      pagination: body?.pagination ?? body?.meta ?? null,
    };
  }

  async getFeatured(limit = 6) {
    const body = await this._fetch(
      `/featured?limit=${limit}`,
      {},
      "getFeatured"
    );
    console.log("[countryService.getFeatured] body:", body);
    return {
      data: Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : [],
    };
  }

  async search(q, limit = 15) {
    if (!q || String(q).trim().length < 2) return { data: [] };
    const body = await this._fetch(
      `/search${this._qs({ q, limit })}`,
      {},
      "search"
    );
    return {
      data: Array.isArray(body) ? body : body?.data ?? [],
    };
  }

  async getStats() {
    const body = await this._fetch("/stats", {}, "getStats");
    return {
      data: body?.data ?? body ?? null,
    };
  }

  async getContinents() {
    const body = await this._fetch("/continents", {}, "getContinents");
    return {
      data: Array.isArray(body) ? body : body?.data ?? [],
    };
  }

  async getByContinent(continent, params = {}) {
    const body = await this._fetch(
      `/continent/${encodeURIComponent(continent)}${this._qs(params)}`,
      {},
      `byContinent-${continent}`
    );
    return {
      data: Array.isArray(body) ? body : body?.data ?? [],
      pagination: body?.pagination ?? null,
    };
  }

  async getOne(idOrSlug, includeRelated = true) {
    const body = await this._fetch(
      `/${encodeURIComponent(idOrSlug)}${this._qs({ includeRelated })}`,
      {},
      `getOne-${idOrSlug}`
    );
    return body?.data ?? body ?? null;
  }

  async getDestinations(idOrSlug, params = {}) {
    const body = await this._fetch(
      `/${encodeURIComponent(idOrSlug)}/destinations${this._qs(params)}`,
      {},
      `destinations-${idOrSlug}`
    );
    return {
      data: Array.isArray(body) ? body : body?.data ?? [],
      pagination: body?.pagination ?? null,
      country: body?.country ?? null,
    };
  }

  async create(payload) {
    const body = await this._fetch("", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async update(id, payload) {
    const body = await this._fetch(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async remove(id) {
    const body = await this._fetch(`/${id}`, { method: "DELETE" });
    return body ?? null;
  }

  async addAirport(countryId, payload) {
    const body = await this._fetch(`/${countryId}/airports`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeAirport(countryId, airportId) {
    const body = await this._fetch(
      `/${countryId}/airports/${airportId}`,
      { method: "DELETE" }
    );
    return body ?? null;
  }

  async addFestival(countryId, payload) {
    const body = await this._fetch(`/${countryId}/festivals`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeFestival(countryId, festivalId) {
    const body = await this._fetch(
      `/${countryId}/festivals/${festivalId}`,
      { method: "DELETE" }
    );
    return body ?? null;
  }

  async addUnescoSite(countryId, payload) {
    const body = await this._fetch(`/${countryId}/unesco-sites`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeUnescoSite(countryId, siteId) {
    const body = await this._fetch(
      `/${countryId}/unesco-sites/${siteId}`,
      { method: "DELETE" }
    );
    return body ?? null;
  }

  async addHistoricalEvent(countryId, payload) {
    const body = await this._fetch(`/${countryId}/historical-events`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeHistoricalEvent(countryId, eventId) {
    const body = await this._fetch(
      `/${countryId}/historical-events/${eventId}`,
      { method: "DELETE" }
    );
    return body ?? null;
  }

  cancelKey(key) {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key).abort();
      this.abortControllers.delete(key);
    }
  }
}

const countryService = new CountryService();
export default countryService;