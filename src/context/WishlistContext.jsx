import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUserAuth } from "./UserAuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const WishlistContext = createContext(null);

const getId = (item) =>
  item?._id || item?.id || item?.destinationId || item?.slug;

export function WishlistProvider({ children }) {
  const { authFetch, isAuthenticated, openModal } = useUserAuth();
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const inflightRef = useRef(null);

  const reset = useCallback(() => {
    setWishlistIds(new Set());
    setLoaded(false);
    setLoading(false);
    inflightRef.current = null;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) reset();
  }, [isAuthenticated, reset]);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || loaded || loading) return;
    if (inflightRef.current) return inflightRef.current;

    const run = (async () => {
      setLoading(true);
      try {
        const data = await authFetch(`${API_URL}/users/wishlist`);
        const items = data?.data || data || [];
        setWishlistIds(new Set(items.map(getId).filter(Boolean)));
        setLoaded(true);
      } catch {
        // Endpoint may not exist yet, or user has no wishlist
        setWishlistIds(new Set());
        setLoaded(true);
      } finally {
        setLoading(false);
        inflightRef.current = null;
      }
    })();

    inflightRef.current = run;
    return run;
  }, [authFetch, isAuthenticated, loaded, loading]);

  const ensureLoaded = useCallback(async () => {
    if (!isAuthenticated) return;
    if (loaded) return;
    await loadWishlist();
  }, [isAuthenticated, loaded, loadWishlist]);

  const toggleWishlist = useCallback(
    async (destinationId) => {
      if (!destinationId) return;
      if (!isAuthenticated) {
        openModal("login");
        return;
      }

      await ensureLoaded();

      const isWished = wishlistIds.has(destinationId);
      try {
        if (isWished) {
          await authFetch(`${API_URL}/users/wishlist/${destinationId}`, {
            method: "DELETE",
          });
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(destinationId);
            return next;
          });
        } else {
          await authFetch(`${API_URL}/users/wishlist`, {
            method: "POST",
            body: JSON.stringify({ destinationId }),
          });
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.add(destinationId);
            return next;
          });
        }
      } catch {
        // Ignore: network/backend might be unavailable
      }
    },
    [authFetch, ensureLoaded, isAuthenticated, openModal, wishlistIds],
  );

  const isWishlisted = useCallback(
    (id) => Boolean(id) && wishlistIds.has(id),
    [wishlistIds],
  );

  const value = useMemo(
    () => ({
      loaded,
      loading,
      wishlistIds,
      loadWishlist,
      toggleWishlist,
      isWishlisted,
    }),
    [isWishlisted, loadWishlist, loaded, loading, toggleWishlist, wishlistIds],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export default WishlistContext;
