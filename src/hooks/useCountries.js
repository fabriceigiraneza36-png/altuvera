// src/hooks/useCountries.js

import { useState, useEffect, useCallback, useRef } from "react";
import countryService from "../services/countryService";

export function useCountries(params = {}) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);
  const paramsKeyRef = useRef(JSON.stringify(params));

  const fetchCountries = useCallback(() => {
    setLoading(true);
    setError(null);
    countryService
      .getAll(paramsRef.current)
      .then((result) => {
        if (result) {
          setCountries(result.data || []);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load countries");
          setCountries([]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const newParamsKey = JSON.stringify(params);
    if (newParamsKey !== paramsKeyRef.current) {
      paramsKeyRef.current = newParamsKey;
      paramsRef.current = params;
      fetchCountries();
    }

    return () => countryService.cancelAll();
  }, [params, fetchCountries]);

  // Real-time sync: refetch every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCountries();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchCountries]);

  const refetch = useCallback(() => {
    fetchCountries();
  }, [fetchCountries]);

  return { countries, loading, error, refetch };
}

export function useCountry(idOrSlug) {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idOrSlug) return;
    let cancelled = false;
    setLoading(true);

    countryService
      .getOne(idOrSlug)
      .then((result) => {
        if (!cancelled && result) setCountry(result.data);
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

  return { country, loading, error };
}
