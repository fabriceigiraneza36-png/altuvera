// src/hooks/useCountries.js

import { useState, useEffect, useCallback, useRef } from "react";
import countryService from "../services/countryService";

export function useCountries(params = {}) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);
  const paramsKeyRef = useRef(JSON.stringify(params));

  useEffect(() => {
    const newParamsKey = JSON.stringify(params);
    
    // Only fetch if params actually changed
    if (newParamsKey !== paramsKeyRef.current) {
      paramsKeyRef.current = newParamsKey;
      paramsRef.current = params;
      
      setLoading(true);
      setError(null);
      
      countryService
        .getAll(params)
        .then((result) => {
          if (result) {
            setCountries(result.data || []);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setError(err.message || "Failed to load countries");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
    
    return () => countryService.cancelAll();
  }, [params]);

  const refetch = useCallback(() => {
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
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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