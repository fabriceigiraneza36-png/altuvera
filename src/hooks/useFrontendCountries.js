import { useState, useEffect } from 'react';
import countryService from '../services/countryService';

export const useFrontendCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await countryService.getFrontendCountries();
        // result may be array or { data: array, ... }
        const countriesArray = Array.isArray(result) ? result : result?.data ?? [];
        setCountries(countriesArray);
      } catch (err) {
        console.error('Countries fetch error:', err);
        setError(err.message || 'Failed to load countries');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    return () => countryService.cancelKey('frontendCountries');
  }, []);

  return { countries, loading, error, refetch: fetchData };
};