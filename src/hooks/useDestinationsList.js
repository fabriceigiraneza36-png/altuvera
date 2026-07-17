// src/hooks/useDestinationsList.js
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

export function useDestinationsList({ countrySlug, countryId, limit = 200 } = {}) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Build query params
    const params = new URLSearchParams({ limit: String(limit) });

    // If we have a countrySlug, use the dedicated by-country endpoint
    // which applies its own is_active + status=published filters
    const url = countrySlug
      ? `${API}/destinations/country/${countrySlug}?${params}`
      : countryId
        ? `${API}/destinations?${params}&country_id=${countryId}`
        : `${API}/destinations?${params}`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        // Handle all response shapes:
        // { success, data: [...], pagination }  ← standard list
        // { success, data: [...], country }     ← by-country
        // { success, data: { packages, total }} ← some endpoints
        // plain array fallback
        let rows = [];
        if (Array.isArray(json)) {
          rows = json;
        } else if (Array.isArray(json.data)) {
          rows = json.data;
        } else if (json.data && Array.isArray(json.data.destinations)) {
          rows = json.data.destinations;
        } else {
          rows = [];
        }
        setData(rows);
      })
      .catch(err => {
        if (!cancelled) {
          console.error("[useDestinationsList]", err);
          setError(err);
          setData([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [countrySlug, countryId, limit]);

  return { data, loading, error };
}