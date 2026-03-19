import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adaptDestination,
  adaptDestinationList,
} from "../utils/destinationAdapter";
import { multiBackendFetch, getBackendInfo } from "../utils/multiBackendFetch";

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
  const [activeBackend, setActiveBackend] = useState(null);
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchDestinations = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await multiBackendFetch(`/destinations${toQueryString(params)}`);
        
        if (result.success) {
          setDestinations(adaptDestinationList(normalizePayload(result.data)));
          setActiveBackend(result.backend);
        } else {
          setError(result.error || "Failed to load destinations");
          setDestinations([]);
        }
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
    
    // Store active backend info
    const info = getBackendInfo();
    setActiveBackend(info.active);
    
    return () => controller.abort();
  }, [fetchDestinations]);

  return { destinations, loading, error, refetch: fetchDestinations, activeBackend };
}

export function useDestination(idOrSlug) {
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBackend, setActiveBackend] = useState(null);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }
    
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchDestination = async () => {
      try {
        const result = await multiBackendFetch(`/destinations/${idOrSlug}`);
        
        if (result.success) {
          setDestination(adaptDestination(normalizePayload(result.data)));
          setActiveBackend(result.backend);
        } else {
          setError(result.error || "Failed to load destination");
          setDestination(null);
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to load destination");
          setDestination(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();

    return () => controller.abort();
  }, [idOrSlug]);

  return { destination, loading, error, activeBackend };
}

export function useCountryDestinations(countryId) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeBackend, setActiveBackend] = useState(null);

  const fetchCountryDestinations = useCallback(
    async (signal) => {
      if (!countryId) {
        setDestinations([]);
        return;
      }
      setLoading(true);
      setError(null);
      
      try {
        const result = await multiBackendFetch(`/countries/${countryId}/destinations`);
        
        if (result.success) {
          setDestinations(adaptDestinationList(normalizePayload(result.data)));
          setActiveBackend(result.backend);
        } else {
          setError(result.error || "Failed to load country destinations");
          setDestinations([]);
        }
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

  return { destinations, loading, error, refetch: fetchCountryDestinations, activeBackend };
}
