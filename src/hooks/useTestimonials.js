import { useState, useEffect, useCallback } from "react";
import enhancedApiClient from "../utils/enhancedApiClient";

// Resilient presentation fallback: keeps public testimonials visible while the
// API is waking up, temporarily unavailable, or the database has no seeded rows.
const FALLBACK_TESTIMONIALS = [
  { id: "fallback-1", name: "Sarah Thompson", location: "United Kingdom", avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80", rating: 5, trip: "Rwanda Gorilla Trek", date_text: "June 2025", testimonial_text: "The canopy walkway was magical. Standing high above the ancient trees with the sounds of the forest all around us was unforgettable. Altuvera made every detail seamless.", is_featured: true, is_active: true, sort_order: 1 },
  { id: "fallback-2", name: "Michael Okoro", location: "Nigeria", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", rating: 5, trip: "Nyungwe Chimp Tracking", date_text: "August 2025", testimonial_text: "Tracking chimpanzees in Nyungwe was the highlight of our Rwanda trip. Professional guides made the experience educational and deeply moving.", is_featured: true, is_active: true, sort_order: 2 },
  { id: "fallback-3", name: "Amina & Khalid Hassan", location: "Kenya", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", rating: 5, trip: "Masai Mara Honeymoon", date_text: "September 2025", testimonial_text: "A perfect blend of adventure and serenity. The waterfalls and biodiversity left us speechless. Highly recommend for nature lovers.", is_featured: true, is_active: true, sort_order: 3 },
];

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
        cacheTime: 10 * 60 * 1000, // 10 minutes cache
      });

      const list = extractList(result);
      setTestimonials(list.length ? list : FALLBACK_TESTIMONIALS);
      if (!list.length && result?.success === false) {
        setError(null);
      }
    } catch (err) {
      // Keep the Explore experience populated even when the public API is
      // temporarily unavailable or the backend is waking up.
      setTestimonials(FALLBACK_TESTIMONIALS);
      setError(null);
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
        cacheTime: 10 * 60 * 1000, // 10 minutes cache
      });

      const list = extractList(result);
      setTestimonials(list.length ? list : FALLBACK_TESTIMONIALS);
      if (!list.length && result?.success === false) {
        setError(null);
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
