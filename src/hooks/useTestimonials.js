import { useState, useEffect, useCallback } from "react";
import enhancedApiClient from "../utils/enhancedApiClient";

// Testimonials are CMS-owned content. Public pages must display the live API
// data and must never invent or substitute customer stories.

const extractList = (result) => {
  const data = result && typeof result === "object" && "success" in result
    ? (result.success ? result.data : null)
    : result;
  const list = data?.data || data?.testimonials || data || [];
  return Array.isArray(list) ? list : [];
};

export function useTestimonials(query = "") {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `/testimonials?limit=200${query ? `&${query}` : ""}`;
      const result = await enhancedApiClient.request(url, {
        method: "GET",
        cache: false, // Testimonials are CMS content; always prefer the live backend.
      });

      const list = extractList(result);
      setTestimonials(list);
      if (!list.length) {
        setError("No approved testimonials are currently available");
      }
    } catch (err) {
      // Never replace live CMS content with fabricated testimonials.
      setTestimonials([]);
      setError(err?.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [query]);

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
        cache: false, // Featured testimonials are live CMS content.
      });

      const list = extractList(result);
      setTestimonials(list);
      if (!list.length) {
        setError("No approved featured testimonials are currently available");
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
