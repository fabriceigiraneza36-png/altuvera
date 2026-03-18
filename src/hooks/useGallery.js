import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../utils/apiBase";

export function useGallery() {
  const [fetchedImages, setFetchedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGallery = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/gallery", { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Assume data.data is the array of images
      setFetchedImages(data.data || data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Failed to fetch gallery images");
        console.error("Gallery fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchGallery(controller.signal);
    return () => controller.abort();
  }, [fetchGallery]);

  return { fetchedImages, loading, error, refetch: fetchGallery };
}
