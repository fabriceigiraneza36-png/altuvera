// src/hooks/useDestinations.js
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  adaptDestination,
  adaptDestinationList,
} from "../utils/destinationAdapter";
import { multiBackendFetch } from "../utils/multiBackendFetch";

// ── Shared reducer ────────────────────────────────────────────
const reducer = (state, action) => {
  switch (action.type) {
    case "LOADING": return { ...state, loading: true,  error: null };
    case "SUCCESS": return { loading: false, error: null,         data: action.data, meta: action.meta || null };
    case "ERROR":   return { loading: false, error: action.error, data: state.data,  meta: state.meta  || null };
    default:        return state;
  }
};

const extract = (payload) => payload?.data ?? payload ?? [];

const qs = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== "")
  );
  return Object.keys(clean).length
    ? `?${new URLSearchParams(clean)}`
    : "";
};

// ── Generic fetch hook ────────────────────────────────────────
const useFetch = (endpoint, enabled = true) => {
  const [state, dispatch] = useReducer(reducer, {
    data: null, loading: !!enabled, error: null, meta: null,
  });

  const fetch = useCallback(async () => {
    if (!enabled || !endpoint) return;
    dispatch({ type: "LOADING" });
    try {
      const result = await multiBackendFetch(endpoint);

      if (result && typeof result === "object" && "success" in result) {
        if (result.success) {
          dispatch({
            type: "SUCCESS",
            data: extract(result),
            meta: result.meta ?? result.aggregate ?? result.pagination ?? null,
          });
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

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
};

// ── List hooks ────────────────────────────────────────────────
export function useDestinations(params = {}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const key      = useMemo(() => qs(params), [JSON.stringify(params)]);
  const result   = useFetch(`/destinations${key}`);
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return {
    destinations,
    loading:  result.loading,
    error:    result.error,
    refetch:  result.refetch,
    pagination: result.meta,
  };
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

export function useNewDestinations(limit = 8) {
  const result       = useFetch(`/destinations/new?limit=${limit}`);
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return { destinations, loading: result.loading, error: result.error };
}

export function useCountryDestinations(countryId) {
  const result       = useFetch(`/destinations?country_id=${countryId}&include=gallery`, !!countryId);
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return {
    destinations,
    loading: result.loading,
    error:   result.error,
    refetch: result.refetch,
  };
}

export function useDestinationSuggestions(query, limit = 10) {
  const enabled  = Boolean(query && query.length >= 2);
  const endpoint = enabled
    ? `/destinations/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`
    : null;
  const result = useFetch(endpoint, enabled);
  const suggestions = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return { suggestions, loading: result.loading, error: result.error };
}

// ── Single destination — FULL DETAIL with all includes ────────
export function useDestination(idOrSlug) {
  // Request ALL related sections in one call
  const endpoint = idOrSlug
    ? `/destinations/${encodeURIComponent(idOrSlug)}?include=all`
    : null;

  const result = useFetch(endpoint, !!idOrSlug);

  // Destination detail payloads can omit the separately stored destination_images
  // records. Fetch that collection explicitly, then merge before adapting.
  const destinationId = result.data && typeof result.data === "object"
    ? (result.data.id ?? result.data.destinationId ?? result.data.destination_id ?? null)
    : null;
  const imageEndpoint = destinationId != null
    ? `/destinations/${encodeURIComponent(destinationId)}/images`
    : null;
  const imageResult = useFetch(imageEndpoint, destinationId != null);

  const destination = useMemo(() => {
    if (!result.data || typeof result.data !== "object") return null;
    const raw = result.data;
    const stored = Array.isArray(imageResult.data) ? imageResult.data : [];
    const normalized = stored.map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return null;
      const url = item.imageUrl || item.image_url || item.url || item.image || item.src;
      return url ? { ...item, imageUrl: url, image_url: url } : null;
    }).filter(Boolean);
    return adaptDestination({
      ...raw,
      images: [...(Array.isArray(raw.images) ? raw.images : []), ...normalized],
      imageUrls: [...(Array.isArray(raw.imageUrls) ? raw.imageUrls : []), ...normalized],
      image_urls: [...(Array.isArray(raw.image_urls) ? raw.image_urls : []), ...normalized],
      gallery: [...(Array.isArray(raw.gallery) ? raw.gallery : []), ...normalized],
      galleryImages: [...(Array.isArray(raw.galleryImages) ? raw.galleryImages : []), ...normalized],
    });
  }, [result.data, imageResult.data]);

  return {
    destination,
    loading: result.loading,
    error:   result.error,
    refetch: result.refetch,
  };
}

// ── Map data ──────────────────────────────────────────────────
export function useDestinationMapData(params = {}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const key    = useMemo(() => qs(params), [JSON.stringify(params)]);
  const result = useFetch(`/destinations/map${key}`);
  const pins   = useMemo(
    () => Array.isArray(result.data) ? result.data : [],
    [result.data]
  );
  return { pins, loading: result.loading, error: result.error };
}

// ── Related destinations ──────────────────────────────────────
export function useRelatedDestinations(idOrSlug, limit = 6) {
  const result = useFetch(
    idOrSlug ? `/destinations/${idOrSlug}/related?limit=${limit}` : null,
    !!idOrSlug
  );
  const destinations = useMemo(
    () => adaptDestinationList(Array.isArray(result.data) ? result.data : []),
    [result.data]
  );
  return { destinations, loading: result.loading, error: result.error };
}