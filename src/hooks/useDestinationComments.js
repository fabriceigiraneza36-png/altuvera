import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../utils/apiBase";

export function useDestinationComments(destinationId, resource = "destination") {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async (id) => {
    const destId = id || destinationId;
    if (!destId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/${resource}-comments/${encodeURIComponent(destId)}/comments?limit=50`, { method: "GET" });
      const data = await res.json();
      if (data.status === "success") {
        const list = Array.isArray(data.data?.comments) ? data.data.comments : [];
        setComments(list.map((comment) => ({
          ...comment,
          user: comment.user || (comment.userId ? {
            name: comment.fullName || comment.authorName || "Anonymous",
            avatar: comment.avatarUrl || null,
          } : null),
        })));
      } else {
        setError(data.message || "Failed to load comments");
        setComments([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [destinationId, resource]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const createComment = useCallback(async (destId, content) => {
    setError(null);
    try {
      const res = await apiFetch(`/${resource}-comments/${encodeURIComponent(destId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const comment = data.data;
        const normalized = {
          ...comment,
          user: comment?.user || (comment?.userId ? {
            name: comment.fullName || comment.authorName || "Anonymous",
            avatar: comment.avatarUrl || null,
          } : null),
        };
        setComments((prev) => [normalized, ...prev]);
        return normalized;
      }
      throw new Error(data.message || "Failed to post comment");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [resource]);

  const removeComment = useCallback(async (destId, commentId) => {
    setError(null);
    try {
      const res = await apiFetch(`/destination-comments/${encodeURIComponent(destId)}/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        return true;
      }
      throw new Error(data.message || "Failed to delete comment");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { comments, loading, error, refetch: fetchComments, createComment, removeComment };
}
