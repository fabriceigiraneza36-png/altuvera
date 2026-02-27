import { useState, useCallback } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function useWishlist() {
  const { authFetch, isAuthenticated, openModal } = useUserAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || loaded) return;
    try {
      const data = await authFetch(`${API_URL}/auth/wishlist`);
      const items = data.data || data || [];
      setWishlistIds(new Set(items.map((i) => i._id || i.id)));
      setLoaded(true);
    } catch {
      /* endpoint may not exist */
    }
  }, [isAuthenticated, loaded, authFetch]);

  const toggleWishlist = useCallback(
    async (destinationId) => {
      if (!isAuthenticated) {
        openModal("login");
        return;
      }

      const isWished = wishlistIds.has(destinationId);

      try {
        if (isWished) {
          await authFetch(`${API_URL}/auth/wishlist/${destinationId}`, {
            method: "DELETE",
          });
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(destinationId);
            return next;
          });
        } else {
          await authFetch(`${API_URL}/auth/wishlist`, {
            method: "POST",
            body: JSON.stringify({ destinationId }),
          });
          setWishlistIds((prev) => new Set(prev).add(destinationId));
        }
      } catch {
        /* handle error */
      }
    },
    [isAuthenticated, wishlistIds, authFetch, openModal]
  );

  const isWishlisted = useCallback(
    (id) => wishlistIds.has(id),
    [wishlistIds]
  );

  return { loadWishlist, toggleWishlist, isWishlisted, wishlistIds };
}