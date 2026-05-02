// src/hooks/useDestinations.js
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { adaptDestination, adaptDestinationList } from "../utils/destinationAdapter";
import { multiBackendFetch } from "../utils/multiBackendFetch";

// Shared reducer for all destination fetches
const reducer = (state, action) => {
  switch (action.type) {
    case "LOADING": return { ...state, loading: true, error: null };
    case "SUCCESS": return { loading: false, error: null, data: action.data };
    case "ERROR":   return { loading: false, error: action.error, data: state.data };
    default:        return state;
  }
};

const extract = (payload) => payload?.data ?? payload ?? [];

const qs = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== "")
  );
  return Object.keys(clean).length ? `?${new URLSearchParams(clean)}` : "";
};

// Generic fetch hook
const useFetch = (endpoint, enabled = true) => {
  const [state, dispatch] = useReducer(reducer, {
    data: null, loading: !!enabled, error: null,
  });

  const fetch = useCallback(async () => {
    if (!enabled || !endpoint) return;
    dispatch({ type: "LOADING" });
    try {
      const result = await multiBackendFetch(endpoint);
      if (result && typeof result === "object" && "success" in result) {
        if (result.success) {
          dispatch({ type: "SUCCESS", data: extract(result.data) });
        } else {
          dispatch({ type: "ERROR", error: result.error || "Failed to load" });
        }
      } else {
        dispatch({ type: "SUCCESS", data: extract(result) });
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        dispatch({ type: "ERROR", error: err?.message || "Failed to load" });
      }
    }
  }, [endpoint, enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
};

export function useDestinations(params = {}) {
  const key      = useMemo(() => qs(params), [JSON.stringify(params)]);
  const result   = useFetch(`/destinations${key}`);
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return { destinations, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function useDestination(idOrSlug) {
  const result      = useFetch(`/destinations/${idOrSlug}`, !!idOrSlug);
  const destination = useMemo(
    () => result.data ? adaptDestination(result.data) : null,
    [result.data]
  );
  return { destination, loading: result.loading, error: result.error };
}

export function useCountryDestinations(countryId) {
  const result       = useFetch(`/countries/${countryId}/destinations`, !!countryId);
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return { destinations, loading: result.loading, error: result.error, refetch: result.refetch };
}

export function useFeaturedDestinations(limit = 8) {
  const result       = useFetch(`/destinations/featured?limit=${limit}`);
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return { destinations, loading: result.loading, error: result.error };
}

export function usePopularDestinations(limit = 8) {
  const result       = useFetch(`/destinations/popular?limit=${limit}`);
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return { destinations, loading: result.loading, error: result.error };
}