// src/hooks/useVirtualTours.js

import { useState, useEffect, useCallback, useRef } from "react";
import virtualTourService from "../services/virtualTourService";

export function useVirtualTours(params = {}) {
  const [tours, setTours]             = useState([]);
  const [pagination, setPagination]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const paramsRef                     = useRef(params);

  // Stringify params so useEffect can compare them
  const paramsKey = JSON.stringify(params);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await virtualTourService.getAll(paramsRef.current);
      if (result) {
        setTours(result.data || []);
        setPagination(result.pagination || null);
      }
    } catch (err) {
      setError(err.message || "Failed to load virtual tours");
      console.error("[useVirtualTours] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    paramsRef.current = params;
    fetchTours();
    return () => virtualTourService.cancelAll();
  }, [fetchTours]);

  return { tours, pagination, loading, error, refetch: fetchTours };
}

export function useFeaturedTours(limit = 6) {
  const [tours, setTours]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    virtualTourService
      .getFeatured(limit)
      .then((result) => {
        if (!cancelled && result) {
          setTours(result.data || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      virtualTourService.cancelAll();
    };
  }, [limit]);

  return { tours, loading, error };
}

export function useVirtualTour(idOrSlug) {
  const [tour, setTour]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!idOrSlug) return;
    let cancelled = false;
    setLoading(true);

    virtualTourService
      .getOne(idOrSlug)
      .then((result) => {
        if (!cancelled && result) {
          setTour(result.data);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  return { tour, loading, error };
}