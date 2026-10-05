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
        if (!cancelled) setResults(res.data ?? []);
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
        if (!cancelled) setStats(res.data ?? null);
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
} => { cancelled = true; };
  }, []);

  return { continents, loading, error };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useCountriesByContinent
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function useCountriesByContinent(continent, params = {}) {
  const [countries, setCountries]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // âœ… Same fix: serialize to string for stable comparison
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useCountryDestinations
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function useCountryDestinations(idOrSlug, params = {}) {
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [countryMeta, setCountryMeta]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [source, setSource]             = useState("primary");

  // Enhance params to always include gallery data
  const includes = new Set((params.include || '').split(",").map(s => s.trim()).filter(Boolean));
  includes.add('gallery');
  const enhancedParams = { ...params, include: Array.from(includes).join(",") };

  const paramsKey = useMemo(
    () => JSON.stringify({ idOrSlug, ...enhancedParams }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idOrSlug, JSON.stringify(enhancedParams)]
  );

  const paramsRef = useRef(enhancedParams);
  useEffect(() => { paramsRef.current = enhancedParams; });

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSource("primary");

    const load = async () => {
      // Primary: destinations embedded in /countries/:slug response
      const res = await countryService.getDestinations(idOrSlug, paramsRef.current);
      if (cancelled) return;

      const primary = res.data ?? [];
      const country = res.country ?? null;
      setCountryMeta(country);

      if (primary.length > 0) {
        setDestinations(adaptDestinationList(primary));
        setPagination(res.pagination ?? null);
        setSource("primary");
        return;
      }

      // Fallback: fetch the global destinations catalogue and
      // keep only those belonging to this country.
      try {
        // Build query string from enhancedParams
        const queryString = new URLSearchParams(enhancedParams).toString();
        const url = queryString ? `/destinations?${queryString}` : "/destinations";
        const body = await multiBackendFetch(url);
        const rawList = Array.isArray(body) ? body : (body?.data ?? []);
        const all = adaptDestinationList(rawList);
        const matched = all.filter((d) =>
          destinationMatchesCountry(d, country, idOrSlug)
        );
        setDestinations(matched);
        setPagination(null);
        setSource("fallback");
      } catch {
        if (!cancelled) setDestinations([]);
      }
    };

    load()
      .catch((err) => {
        if (cancelled) return;
        if (err?.name !== "AbortError") {
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

  return { destinations, pagination, countryMeta, loading, error, source };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useCountry â€” single country + optional AI insights
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      .then((data) => { if (!cancelled) setCountry(withCountryMediaFallback(data)); })
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

  // âœ… FIX: Use country?.id (primitive) as dependency, not country (object)
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Default export for legacy compat
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

