import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../utils/apiBase";

export function useDestinationLikes(destinationId) {
  const [likes, setLikes] = useState({ total: 0, isLiked: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLikes = useCallback(async (id) => {
    const destId = id || destinationId;
    if (!destId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/destination-likes/${encodeURIComponent(destId)}/likes`, { method: "GET" });
      const data = await res.json();
      if (data.status === "success") {
        setLikes({ total: data.data?.totalLikes ?? 0, isLiked: false });
      } else {
        setError(data.message || "Failed to load likes");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [destinationId]);

  const checkUserLike = useCallback(async (id) => {
    const destId = id || destinationId;
    if (!destId) return;
    try {
      const res = await apiFetch(`/destination-likes/${encodeURIComponent(destId)}/likes/check`, { method: "GET" });
      const data = await res.json();
      if (data.status === "success") {
        setLikes((prev) => ({ ...prev, isLiked: data.data?.isLiked ?? false }));
      }
    } catch { /* ignore */ }
  }, [destinationId]);

  useEffect(() => { fetchLikes(); checkUserLike(); }, [fetchLikes, checkUserLike]);

  const toggleLike = useCallback(async (destId) => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(`/destination-likes/${encodeURIComponent(destId)}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.status === "success") {
        setLikes((prev) => ({
          total: data.data?.totalLikes ?? prev.total,
          isLiked: data.data?.isLiked ?? !prev.isLiked,
        }));
        return data.data;
      }
      throw new Error(data.message || "Failed to update like");
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { likes, loading, error, refetch: fetchLikes, toggleLike };
}
