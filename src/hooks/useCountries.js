// src/hooks/useCountries.js

import { useState, useEffect, useCallback, useRef } from "react";
import countryService from "../services/countryService";

export function useCountries(params = {}) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);
  const paramsKey = JSON.stringify(params);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await countryService.getAll(paramsRef.current);
      if (result) {
        setCountries(result.data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load countries");
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    paramsRef.current = params;
    fetchCountries();
    return () => countryService.cancelAll();
  }, [fetchCountries]);

  return { countries, loading, error, refetch: fetchCountries };
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