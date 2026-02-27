import { useState, useEffect, useRef, useCallback } from "react";
import countryInsightService from "../services/countryInsightService";

const useCountryInsights = (country) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const fetchInsights = useCallback(async (countryData, options = {}) => {
    if (!countryData?.id) {
      setInsights(null);
      setError(null);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await countryInsightService.getInsights(countryData, options);
      if (requestId !== requestIdRef.current) return;
      setInsights(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setInsights(null);
      setError(err?.message || "Failed to fetch AI country insights.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchInsights(country);
    return () => {
      requestIdRef.current += 1;
    };
  }, [country?.id, fetchInsights]);

  const retry = useCallback(() => {
    fetchInsights(country, { forceRefresh: true });
  }, [country, fetchInsights]);

  return { insights, loading, error, retry };
};

export default useCountryInsights;
