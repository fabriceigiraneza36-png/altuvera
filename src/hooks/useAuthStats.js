import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook to fetch platform statistics for the auth modal
 * Fetches: countries count, destinations count, travelers count, rating
 */
export const useAuthStats = () => {
  const [stats, setStats] = useState({
    countries: '4',
    destinations: '7+',
    travelers: '1K+',
    rating: '4.9★',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch countries count
        const countriesRes = await api.get('/countries', {
          params: { limit: 1 },
        });
        const countriesCount = countriesRes.data?.pagination?.total || 
                              countriesRes.data?.data?.length || 
                              4;

        // Fetch destinations count
        const destinationsRes = await api.get('/destinations', {
          params: { limit: 1 },
        });
        const destinationsCount = destinationsRes.data?.pagination?.total ||
                                 destinationsRes.data?.data?.length ||
                                 7;

        // Fetch users/travelers count
        let travelersCount = 1000;
        try {
          const usersRes = await api.get('/users/stats');
          travelersCount = usersRes.data?.data?.totalUsers || 1000;
        } catch {
          // Fallback to hardcoded if endpoint doesn't exist
          travelersCount = 1000;
        }

        // Fetch platform rating
        // Backend may be temporarily down; keep defaults without polluting error state.
        let rating = 4.9;
        try {
          const ratingRes = await api.get('/reviews/stats');
          rating = ratingRes.data?.data?.averageRating ?? rating;
        } catch (ratingErr) {
          // Silence failures; hook will still resolve with defaults.
          if (ratingErr?.name !== 'AbortError') {
            console.warn(
              '[useAuthStats] /reviews/stats failed, using default rating:',
              ratingErr?.message || ratingErr
            );
          }
          rating = 4.9;
        }




        // Format the stats for display

        const formatCount = (num) => {
          if (num >= 1000) {
            return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
          }
          return `${num}+`;
        };


        setStats({
          countries: countriesCount.toString(),
          destinations: formatCount(destinationsCount),
          travelers: formatCount(travelersCount),
          rating: `${rating.toFixed(1)}★`,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching auth stats:', err);
        // Keep defaults on error
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};
