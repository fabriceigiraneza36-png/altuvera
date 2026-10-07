import { useEffect, useState } from "react";
import { multiBackendFetch } from "../utils/multiBackendFetch";
import { adaptDestinationList } from "../utils/destinationAdapter";

// Service layer for country data
const countryService = {
  async search(query, limit = 15) {
    const url = `/countries/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    return multiBackendFetch(url);
  },

  async getStats() {
    return multiBackendFetch("/countries/stats");
  },

  async getContinents() {
    return multiBackendFetch("/countries/continents");
  },

  async getCountry(idOrSlug) {
    return multiBackendFetch(`/countries/${encodeURIComponent(idOrSlug)}`);
  },

  async listCountries(params = {}) {
    const qs = Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const url = `/countries${qs ? `?${qs}` : ""}`;
    return multiBackendFetch(url);
  },

  cancelKey: null,
};

export function useCountries(params = {}) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    countryService
      .listCountries(params)
      .then((res) => {
        if (!cancelled) {
          const data = Array.isArray(res) ? res : res?.data || [];
          setCountries(data);
        }
      })
      .catch((err) => {
        if (!cancelled && err?.name !== "AbortError") {
          setError(err?.message || "Failed to load countries");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(params)]);

  return { countries, loading, error };
}

export function useCountry(idOrSlug) {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(!!idOrSlug);
  const [error, setError] = useState(null);

  const loadCountry = useCallback(async (identifier, signal) => {
    if (!identifier) return null;

    // Primary path: canonical country endpoint.
    try {
      const res = await countryService.getCountry(identifier);
      return res?.data || res || null;
    } catch (primaryError) {
      if (primaryError?.name === "AbortError") throw primaryError;

      // Recovery path: resolve the country from the public country index.
      // This protects country pages when an older DB record has a mismatched
      // slug/casing while keeping the live backend as the source of truth.
      const indexed = await countryService.listCountries({
        search: String(identifier).trim(),
        limit: 50,
      });

      const rows = Array.isArray(indexed) ? indexed : indexed?.data || [];
      const wanted = String(identifier).trim().toLowerCase();
      const match = rows.find((item) => {
        const slug = String(item?.slug || "").trim().toLowerCase();
        const name = String(item?.name || "").trim().toLowerCase();
        return slug === wanted || name === wanted;
      });

      if (!match) throw primaryError;

      // Re-read the canonical record using the resolved DB slug/id so the
      // page still receives destinations, similar countries and services.
      const resolved = await countryService.getCountry(match.slug || match.id);
      return resolved?.data || resolved || match;
    }
  }, []);

  const refetch = useCallback(() => {
    if (!idOrSlug) return Promise.resolve(null);

    setLoading(true);
    setError(null);

    return loadCountry(idOrSlug)
      .then((data) => {
        setCountry(data);
        return data;
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load country");
        }
        return null;
      })
      .finally(() => setLoading(false));
  }, [idOrSlug, loadCountry]);

  useEffect(() => {
    let cancelled = false;
    if (!idOrSlug) {
      setCountry(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    loadCountry(idOrSlug)
      .then((data) => {
        if (!cancelled) setCountry(data);
      })
      .catch((err) => {
        if (!cancelled && err?.name !== "AbortError") {
          setError(err?.message || "Failed to load country");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idOrSlug, loadCountry]);

  return { country, loading, error, refetch };
}

export function useCountryDestinations(countryIdOrSlug, limit = 12) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(!!countryIdOrSlug);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!countryIdOrSlug) {
      setDestinations([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    // The backend exposes destinations on GET /countries/:slug,
    // embedded in data.destinations. There is no
    // /countries/:slug/destinations route.
    const url = `/countries/${encodeURIComponent(countryIdOrSlug)}`;

    multiBackendFetch(url)
      .then((res) => {
        if (!cancelled) {
          const payload = res?.data ?? res ?? {};
          const data = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.destinations)
              ? payload.destinations
              : [];
          // Normalize backend snake_case fields to the shape consumed by
          // DestinationCard (images, heroImage, countryName, etc.).
          setDestinations(adaptDestinationList(data));
        }
      })
      .catch((err) => {
        if (!cancelled && err?.name !== "AbortError") {
          setError(err?.message || "Failed to load destinations");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryIdOrSlug, limit]);

  return { destinations, loading, error };
}

export function useCountrySearch(query, limit = 15) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = String(query || "").trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    countryService
      .search(q, limit)
      .then((res) => {
        if (!cancelled) setResults(Array.isArray(res) ? res : res?.data ?? []);
      })
      .catch((err) => {
        if (!cancelled && err?.name !== "AbortError") {
          setError(err?.message || "Search failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      try {
        countryService.cancelKey?.("search");
      } catch {
        // no-op
      }
    };
  }, [query, limit]);

  return { results, loading, error };
}

export function useCountryStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    countryService
      .getStats()
      .then((res) => {
        if (!cancelled) setStats(res?.data ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load stats");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}

export function useContinents() {
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    countryService
      .getContinents()
      .then((res) => {
        if (!cancelled) setContinents(Array.isArray(res) ? res : res?.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load continents");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { continents, loading, error };
}
