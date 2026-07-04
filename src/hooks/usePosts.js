// src/hooks/usePosts.js
import { useState, useEffect, useCallback } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

export const usePosts = ({ limit = 6, featured = false, sort = "created" } = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        sort,
        ...(featured ? { featured: "true" } : {}),
      });

      const url = `${API_BASE}/posts?${params.toString()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to load posts (${res.status})`);
      }

      const data = await res.json();
      // Backend returns { status: 'success', data: [...] }
      const list = data?.data || data?.posts || (Array.isArray(data) ? data : []);
      setPosts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("[usePosts] Failed to fetch posts:", err.message);
      setError(err.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [limit, featured, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};

export default usePosts;