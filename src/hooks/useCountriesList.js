// src/hooks/useCountriesList.js
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

export function useCountriesList({ limit = 100 } = {}) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`${API}/countries?limit=${limit}&is_active=true`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        let rows = [];
        if (Array.isArray(json))            rows = json;
        else if (Array.isArray(json.data))  rows = json.data;
        else                                rows = [];
        setData(rows);
      })
      .catch(err => {
        if (!cancelled) { setError(err); setData([]); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [limit]);

  return { data, loading, error };
}