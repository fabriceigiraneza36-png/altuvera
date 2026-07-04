// src/services/countryService.js
import enhancedApiClient from "../utils/enhancedApiClient";

const BASE_PATH = "/countries";

class CountryService {
  constructor() {
    this.abortControllers = new Map();
  }

  /* ─── Abort helpers ──────────────────────────────────────────────────── */

  _abort(key) {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key).abort();
    }
    const controller = new AbortController();
    this.abortControllers.set(key, controller);
    return controller.signal;
  }

  cancelKey(key) {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key).abort();
      this.abortControllers.delete(key);
    }
  }

  /* ─── Core fetch wrapper ─────────────────────────────────────────────── */

  async _fetch(path, options = {}, abortKey = null) {
    try {
      const signal =
        options.signal ?? (abortKey ? this._abort(abortKey) : undefined);

      const response = await enhancedApiClient.request(`${BASE_PATH}${path}`, {
        ...options,
        signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        cacheTime:  15 * 60 * 1000,
        cacheBust:  false,
      });

      const payload = response;

      // Handle { success, data, pagination } envelope
      if (payload && typeof payload === "object" && "success" in payload) {
        if (!payload.success) {
          throw new Error(payload.error || "Request failed");
        }
        return payload; // caller gets full envelope
      }

      // Raw array / plain object
      return payload;
    } catch (err) {
      throw err;
    }
  }

  /* ─── Query-string builder ───────────────────────────────────────────── */

  _qs(params = {}) {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    return filtered.length
      ? "?" + new URLSearchParams(filtered).toString()
      : "";
  }

  /* ─── Normalise array from various response shapes ───────────────────── */

  _toArray(body) {
    if (Array.isArray(body))            return body;
    if (Array.isArray(body?.data))      return body.data;
    if (Array.isArray(body?.countries)) return body.countries;
    if (Array.isArray(body?.results))   return body.results;
    return [];
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PUBLIC API
  ═══════════════════════════════════════════════════════════════════════ */

  /* ── GET /countries ─────────────────────────────────────────────────── */

  async getAll(params = {}) {
    const { signal: _s, ...cleanParams } = params;
    const body = await this._fetch(this._qs(cleanParams), {}, "getAll");
    return {
      data:       this._toArray(body),
      pagination: body?.pagination ?? body?.meta ?? null,
    };
  }

  /* ── GET /countries/featured ────────────────────────────────────────── */

  async getFeatured(limit = 6) {
    const body = await this._fetch(`/featured?limit=${limit}`, {}, "getFeatured");
    return {
      data: this._toArray(body),
    };
  }

  /* ── GET /countries?search=q ────────────────────────────────────────── */

  async search(q, limit = 15) {
    if (!q || String(q).trim().length < 2) return { data: [] };
    const body = await this._fetch(this._qs({ search: q, limit }), {}, "search");
    return {
      data: this._toArray(body),
    };
  }

  /* ── GET /countries/stats ───────────────────────────────────────────── */

  async getStats() {
    const body = await this._fetch("/stats", {}, "getStats");
    return {
      data: body?.data ?? body ?? null,
    };
  }

  /* ── GET /countries/continent/:continent ────────────────────────────── */

  async getContinents() {
    // Derive from stats — no separate /continents endpoint exists
    try {
      const { data } = await this.getStats();
      const byCont = data?.by_continent ?? [];
      return {
        data: byCont
          .map((c) => c.continent)
          .filter(Boolean),
      };
    } catch {
      return { data: [] };
    }
  }

  async getByContinent(continent, params = {}) {
    const body = await this._fetch(
      `/continent/${encodeURIComponent(continent)}${this._qs(params)}`,
      {},
      `byContinent-${continent}`,
    );
    return {
      data:       this._toArray(body),
      pagination: body?.pagination ?? null,
    };
  }

  /* ── GET /countries/:slug ───────────────────────────────────────────── */

  /**
   * Fetch one country.
   * includeRelated = true  → backend also returns services, booking_stats,
   *                          similar_countries (destinations always included).
   */
  async getOne(idOrSlug, includeRelated = true) {
    try {
      const body = await this._fetch(
        `/${encodeURIComponent(idOrSlug)}${this._qs({ includeRelated })}`,
        {},
        `getOne-${idOrSlug}`,
      );

      // Unwrap envelope
      const country = body?.data ?? body ?? null;
      return country;
    } catch (err) {
      if (err.name === "AbortError") throw err;

      // Static fallback
      console.warn(
        `[countryService] API failed for "${idOrSlug}", trying static fallback:`,
        err.message,
      );
      try {
        const { getFallbackCountry } = await import("./staticCountries.js");
        return await getFallbackCountry(idOrSlug);
      } catch (fallbackErr) {
        console.error("[countryService] Static fallback also failed:", fallbackErr);
        throw new Error(
          `Country not found: ${idOrSlug} (API & static fallback both failed)`,
        );
      }
    }
  }

  /* ── GET destinations for a country ────────────────────────────────────
   *
   * The backend embeds destinations[] inside the getOne response, so we
   * reuse that instead of making a separate HTTP call.
   * A separate /countries/:id/destinations route does NOT exist in your
   * routes file, so we must use the embedded data.
   *
   * Falls back to the dedicated destinations endpoint if the embedded
   * array is absent (e.g. older API version).
   * ─────────────────────────────────────────────────────────────────── */

  async getDestinations(idOrSlug, params = {}) {
    // Primary: use the data already embedded in getOne
    try {
      const country = await this.getOne(idOrSlug, true);

      if (country && Array.isArray(country.destinations)) {
        return {
          data:       country.destinations,
          pagination: null,
          country,
        };
      }
    } catch (err) {
      if (err.name === "AbortError") throw err;
      // Fall through to dedicated endpoint attempt
      console.warn(
        "[countryService.getDestinations] getOne failed, trying dedicated endpoint:",
        err.message,
      );
    }

    // Fallback: dedicated endpoint (future-proofing)
    try {
      const body = await this._fetch(
        `/${encodeURIComponent(idOrSlug)}/destinations${this._qs(params)}`,
        {},
        `destinations-${idOrSlug}`,
      );
      return {
        data:       this._toArray(body),
        pagination: body?.pagination ?? null,
        country:    body?.country    ?? null,
      };
    } catch (err) {
      if (err.name === "AbortError") throw err;
      console.error("[countryService.getDestinations] Both strategies failed:", err.message);
      return { data: [], pagination: null, country: null };
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     ADMIN — CRUD
  ═══════════════════════════════════════════════════════════════════════ */

  async create(payload) {
    const body = await this._fetch("", {
      method: "POST",
      body:   JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async update(id, payload) {
    const body = await this._fetch(`/${id}`, {
      method: "PUT",
      body:   JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async remove(id) {
    const body = await this._fetch(`/${id}`, { method: "DELETE" });
    return body ?? null;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     ADMIN — SUB-RESOURCES
     (airports, festivals, UNESCO sites, historical events)
     These endpoints are preserved for admin panel usage even though the
     CountryPage no longer displays them directly.
  ═══════════════════════════════════════════════════════════════════════ */

  /* ── Airports ───────────────────────────────────────────────────────── */

  async addAirport(countryId, payload) {
    const body = await this._fetch(`/${countryId}/airports`, {
      method: "POST",
      body:   JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeAirport(countryId, airportId) {
    const body = await this._fetch(
      `/${countryId}/airports/${airportId}`,
      { method: "DELETE" },
    );
    return body ?? null;
  }

  /* ── Festivals ──────────────────────────────────────────────────────── */

  async addFestival(countryId, payload) {
    const body = await this._fetch(`/${countryId}/festivals`, {
      method: "POST",
      body:   JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeFestival(countryId, festivalId) {
    const body = await this._fetch(
      `/${countryId}/festivals/${festivalId}`,
      { method: "DELETE" },
    );
    return body ?? null;
  }

  /* ── UNESCO Sites ───────────────────────────────────────────────────── */

  async addUnescoSite(countryId, payload) {
    const body = await this._fetch(`/${countryId}/unesco-sites`, {
      method: "POST",
      body:   JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeUnescoSite(countryId, siteId) {
    const body = await this._fetch(
      `/${countryId}/unesco-sites/${siteId}`,
      { method: "DELETE" },
    );
    return body ?? null;
  }

  /* ── Historical Events ──────────────────────────────────────────────── */

  async addHistoricalEvent(countryId, payload) {
    const body = await this._fetch(`/${countryId}/historical-events`, {
      method: "POST",
      body:   JSON.stringify(payload),
    });
    return body?.data ?? null;
  }

  async removeHistoricalEvent(countryId, eventId) {
    const body = await this._fetch(
      `/${countryId}/historical-events/${eventId}`,
      { method: "DELETE" },
    );
    return body ?? null;
  }
}

/* ─── Singleton export ───────────────────────────────────────────────────── */

const countryService = new CountryService();
export default countryService;