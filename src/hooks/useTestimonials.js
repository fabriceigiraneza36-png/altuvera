import { useState, useEffect, useCallback } from "react";
import enhancedApiClient from "../utils/enhancedApiClient";

export function useTestimonials(params = {}) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await enhancedApiClient.request("/testimonials", {
        method: "GET",
        cacheTime: 10 * 60 * 1000, // 10 minutes cache
      });

      const data = result && typeof result === "object" && "success" in result
        ? (result.success ? result.data : null)
        : result;
      const list = data?.data || data?.testimonials || data || [];

      if (list) {
        setTestimonials(Array.isArray(list) ? list : []);
      } else {
        setTestimonials([]);
        setError(result?.error || "Failed to load testimonials");
      }
    } catch (err) {
      setTestimonials([]);
      setError(err?.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const refetch = useCallback(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return { testimonials, loading, error, refetch };
}

export function useFeaturedTestimonials(limit = 12) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await enhancedApiClient.request("/testimonials/featured", {
        method: "GET",
        cacheTime: 10 * 60 * 1000, // 10 minutes cache
      });

      const data = result && typeof result === "object" && "success" in result
        ? (result.success ? result.data : null)
        : result;
      const list = data?.data || data?.testimonials || data || [];

      if (list) {
        setTestimonials(Array.isArray(list) ? list : []);
      } else {
        setTestimonials([]);
        setError(result?.error || "Failed to load featured testimonials");
      }
    } catch (err) {
      setTestimonials([]);
      setError(err?.message || "Failed to load featured testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const refetch = useCallback(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return { testimonials, loading, error, refetch };
}

export function useTestimonial(idOrSlug) {
  const [testimonial, setTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchTestimonial = async () => {
      try {
        const result = await enhancedApiClient.request(`/testimonials/${idOrSlug}`, {
          method: "GET",
          cacheTime: 15 * 60 * 1000, // 15 minutes cache
        });

        const data = result && typeof result === "object" && "success" in result
          ? (result.success ? result.data : null)
          : result;

        if (data) {
          setTestimonial(data?.data || data);
        } else {
          setError(result?.error || "Failed to load testimonial");
          setTestimonial(null);
        }
      } catch (err) {
        setError(err?.message || "Failed to load testimonial");
        setTestimonial(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonial();
  }, [idOrSlug]);

  return { testimonial, loading, error };
}
