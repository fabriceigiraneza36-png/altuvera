import { useEffect, useState } from "react";
import { multiBackendFetch } from "../utils/multiBackendFetch";

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

  useEffect(() => {
    if (!idOrSlug) {
      setCountry(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    countryService
      .getCountry(idOrSlug)
      .then((res) => {
        if (!cancelled) {
          setCountry(res?.data || res || null);
        }
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
  }, [idOrSlug]);

  return { country, loading, error };
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

    const url = `/countries/${encodeURIComponent(countryIdOrSlug)}/destinations?limit=${limit}`;

    multiBackendFetch(url)
      .then((res) => {
        if (!cancelled) {
          const data = Array.isArray(res) ? res : res?.data || [];
          setDestinations(data);
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
