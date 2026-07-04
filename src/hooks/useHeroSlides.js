// src/hooks/useHeroSlides.js
import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '/api';

export function useHeroSlides() {
  const [slides, setSlides]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`${API}/hero-slides`)
      .then(r => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (!cancelled) setSlides(json.data || []);
      })
      .catch(e => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { slides, loading, error };
}