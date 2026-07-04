// src/hooks/useCountries.js
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import countryService from "../services/countryService";
import countryInsightService from "../services/countryInsightService";

/* ─────────────────────────────────────────────────────────
   useCountries — paginated/filtered list of countries
   ───────────────────────────────────────────────────────── */
let STATIC_CACHE = null;

export function useCountries(params = {}) {
  const [countries, setCountries]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Cache static data
  const loadStatic = useCallback(async () => {
    if (STATIC_CACHE) return STATIC_CACHE;
    try {
      const { countries: staticCountries } = await import('../services/staticCountries.js');
      STATIC_CACHE = staticCountries;
      return staticCountries;
    } catch {
      return [];
    }
  }, []);

  // ✅ FIX: Serialize params to a stable string for comparison.
  // This MUST be the dependency, not the params object itself,
  // because object identity changes on every render if caller
  // passes an inline literal like useCountries({ limit: 12 }).
  const paramsKey = useMemo(
    () => JSON.stringify(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)] // ← intentional: compare by value not reference
  );

  // Keep a ref so fetchCountries closure always has the latest params
  // without needing to be recreated
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }); // no deps — runs every render but is just a ref update

  // ✅ FIX: fetchCountries is stable — it only uses the ref, not params directly
  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

  const result = await countryService.getAll(paramsRef.current);
  setCountries(result.data       ?? []);
  setPagination(result.pagination ?? null);

    } catch (err) {
      if (err?.name !== "AbortError" && err?.message !== "canceled") {
        console.error("[useCountries] fetch error:", err?.message);
        setError(err?.message || "Failed to load countries");
        setCountries([]);
      }
    } finally {
      setLoading(false);
    }
  }, []); // ← intentionally empty: uses ref, never stale

  // ✅ FIX: Only re-fetch when the serialized params string actually changes
  useEffect(() => {
    fetchCountries();
    return () => {
      // Cancel any in-flight request when params change or component unmounts
      try { countryService.cancelKey?.("getAll"); } catch { /* no-op */ }
    };
  }, [paramsKey, fetchCountries]);
  // Note: fetchCountries is stable (empty deps), so this effect only
  // re-runs when paramsKey changes — which only happens when params
  // VALUES change, not just references.

  // Real-time sync every 60s (only when tab is visible)
  useEffect(() => {
    const id = setInterval(() => {
      // Don't refetch if tab is hidden — saves bandwidth
      if (document.visibilityState === "visible") {
        fetchCountries();
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [fetchCountries]);

  const refetch = useCallback(() => fetchCountries(), [fetchCountries]);

  return { countries, pagination, loading, error, refetch };
}

/* ─────────────────────────────────────────────────────────
   useFeaturedCountries
   ───────────────────────────────────────────────────────── */
export function useFeaturedCountries(limit = 12) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await countryService.getFeatured(limit);
      setCountries(result.data ?? []);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError(err?.message || "Failed to load featured countries");
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeatured();
    return () => { try { countryService.cancelKey?.("getFeatured"); } catch { /* no-op */ } };
  }, [fetchFeatured]);

  return { countries, loading, error, refetch: fetchFeatured };
}

/* ─────────────────────────────────────────────────────────
   useCountrySearch
   ───────────────────────────────────────────────────────── */
export function useCountrySearch(query, limit = 15) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

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
      .then((res)  => { if (!cancelled) setResults(res.data ?? []); })
      .catch((err) => {
        if (!cancelled && err?.name !== "AbortError") {
          setError(err?.message || "Search failed");
        }
      })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      try { countryService.cancelKey?.("search"); } catch { /* no-op */ }
    };
  }, [query, limit]);

  return { results, loading, error };
}

/* ─────────────────────────────────────────────────────────
   useCountryStats
   ───────────────────────────────────────────────────────── */
export function useCountryStats() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    countryService
      .getStats()
      .then((res)  => { if (!cancelled) setStats(res.data ?? null); })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load stats"); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
}

/* ─────────────────────────────────────────────────────────
   useContinents
   ───────────────────────────────────────────────────────── */
export function useContinents() {
  const [continents, setContinents] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    let cancelled = false;
    countryService
      .getContinents()
      .then((res)  => { if (!cancelled) setContinents(res.data ?? []); })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load continents"); })
      .finally(()  => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { continents, loading, error };
}

/* ─────────────────────────────────────────────────────────
   useCountriesByContinent
   ───────────────────────────────────────────────────────── */
export function useCountriesByContinent(continent, params = {}) {
  const [countries, setCountries]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ✅ Same fix: serialize to string for stable comparison
  const paramsKey = useMemo(
    () => JSON.stringify({ continent, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [continent, JSON.stringify(params)]
  );

  const paramsRef = useRef({ continent, ...params });
  useEffect(() => {
    paramsRef.current = { continent, ...params };
  });

  useEffect(() => {
    if (!continent) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const { continent: c, ...rest } = paramsRef.current;
    countryService
      .getByContinent(c, rest)
      .then((res) => {
        if (!cancelled) {
          setCountries(res.data       ?? []);
          setPagination(res.pagination ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load countries by continent");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [paramsKey]);

  return { countries, pagination, loading, error };
}

/* ─────────────────────────────────────────────────────────
   useCountryDestinations
   ───────────────────────────────────────────────────────── */
export function useCountryDestinations(idOrSlug, params = {}) {
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [countryMeta, setCountryMeta]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const paramsKey = useMemo(
    () => JSON.stringify({ idOrSlug, ...params }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idOrSlug, JSON.stringify(params)]
  );

  const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; });

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    countryService
      .getDestinations(idOrSlug, paramsRef.current)
      .then((res) => {
        if (!cancelled) {
          setDestinations(res.data       ?? []);
          setPagination(res.pagination   ?? null);
          setCountryMeta(res.country     ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled && err?.name !== "AbortError") {
          setError(err?.message || "Failed to load destinations");
          setDestinations([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      try { countryService.cancelKey?.(`destinations-${idOrSlug}`); } catch { /* no-op */ }
    };
  }, [paramsKey]);

  return { destinations, pagination, countryMeta, loading, error };
}

/* ─────────────────────────────────────────────────────────
   useCountry — single country + optional AI insights
   ───────────────────────────────────────────────────────── */
export function useCountry(idOrSlug, { withInsights = false } = {}) {
  const [country, setCountry]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [insights, setInsights]               = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError]     = useState(null);
  const insightsRequestId = useRef(0);

  // Fetch country
  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setInsights(null);

    countryService
      .getOne(idOrSlug, true)
      .then((data) => { if (!cancelled) setCountry(data); })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Country not found");
          setCountry(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      try { countryService.cancelKey?.(`getOne-${idOrSlug}`); } catch { /* no-op */ }
    };
  }, [idOrSlug]);

  // Fetch AI insights
  const fetchInsights = useCallback(
    async (countryData, options = {}) => {
      if (!countryData?.id || !withInsights) return;

      const reqId = ++insightsRequestId.current;
      setInsightsLoading(true);
      setInsightsError(null);

      try {
        const result = await countryInsightService.getInsights(countryData, options);
        if (reqId !== insightsRequestId.current) return;
        setInsights(result);
      } catch (err) {
        if (reqId !== insightsRequestId.current) return;
        setInsights(null);
        setInsightsError(err?.message || "Failed to fetch AI insights");
      } finally {
        if (reqId === insightsRequestId.current) setInsightsLoading(false);
      }
    },
    [withInsights]
  );

  // ✅ FIX: Use country?.id (primitive) as dependency, not country (object)
  useEffect(() => {
    if (country?.id && withInsights) {
      fetchInsights(country);
    }
  }, [country?.id, withInsights, fetchInsights]);

  const retryInsights = useCallback(() => {
    if (country) fetchInsights(country, { forceRefresh: true });
  }, [country, fetchInsights]);

  const refetch = useCallback(() => {
    if (!idOrSlug) return;
    setLoading(true);
    setError(null);
    countryService
      .getOne(idOrSlug, true)
      .then((data) => {
        setCountry(data);
        if (withInsights && data) fetchInsights(data, { forceRefresh: true });
      })
      .catch((err) => setError(err?.message || "Country not found"))
      .finally(() => setLoading(false));
  }, [idOrSlug, withInsights, fetchInsights]);

  return {
    country,
    loading,
    error,
    refetch,
    insights,
    insightsLoading,
    insightsError,
    retryInsights,
  };
}

/* ─────────────────────────────────────────────────────────
   Default export for legacy compat
   ───────────────────────────────────────────────────────── */

export default {
  useCountries,
  useFeaturedCountries,
  useCountrySearch,
  useCountryStats,
  useContinents,
  useCountriesByContinent,
  useCountryDestinations,
  useCountry,
};

