import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adaptDestination,
  adaptDestinationList,
} from "../utils/destinationAdapter";

const API_BASE = import.meta.env.VITE_API_URL || "http://https://backend-1-ghrv.onrender.com//api";

const toQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
};

const normalizePayload = (payload) => payload?.data ?? payload ?? [];

export function useDestinations(params = {}) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchDestinations = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/destinations${toQueryString(params)}`,
          { signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setDestinations(adaptDestinationList(normalizePayload(json)));
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load destinations");
          setDestinations([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [paramsKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDestinations(controller.signal);
    return () => controller.abort();
  }, [fetchDestinations]);

  return { destinations, loading, error, refetch: fetchDestinations };
}

export function useDestination(idOrSlug) {
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/destinations/${idOrSlug}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setDestination(adaptDestination(normalizePayload(json)));
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load destination");
          setDestination(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [idOrSlug]);

  return { destination, loading, error };
}

export function useCountryDestinations(countryId) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCountryDestinations = useCallback(
    async (signal) => {
      if (!countryId) {
        setDestinations([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/countries/${countryId}/destinations`, {
          signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setDestinations(adaptDestinationList(normalizePayload(json)));
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load country destinations");
          setDestinations([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [countryId]
  );

  useEffect(() => {
    if (!countryId) return;
    const controller = new AbortController();
    fetchCountryDestinations(controller.signal);
    return () => controller.abort();
  }, [fetchCountryDestinations, countryId]);

  return { destinations, loading, error, refetch: fetchCountryDestinations };
}

