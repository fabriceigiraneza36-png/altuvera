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
        if (!cancelled) setContinents(res.data ?? []);
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
