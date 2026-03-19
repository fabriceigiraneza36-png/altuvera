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

const STORAGE_KEY = "altuvera_wishlist_ids";

const WishlistContext = createContext(null);

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
};

const saveToStorage = (set) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

export function WishlistProvider({ children }) {
  const { isAuthenticated, openModal } = useUserAuth();
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setWishlistIds(new Set());
    setLoaded(false);
    setLoading(false);
  }, []);

  const loadedRef = useRef(loaded);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const loadWishlist = useCallback(async () => {
    if (loadedRef.current || loadingRef.current) return;

    setLoading(true);
    try {
      const set = loadFromStorage();
      setWishlistIds(set);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      reset();
      return;
    }

    loadWishlist();
  }, [isAuthenticated, loadWishlist, reset]);

  const toggleWishlist = useCallback(
    (destinationId) => {
      if (!destinationId) return;
      if (!isAuthenticated) {
        openModal("login");
        return;
      }

      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(destinationId)) {
          next.delete(destinationId);
        } else {
          next.add(destinationId);
        }
        saveToStorage(next);
        return next;
      });
    },
    [isAuthenticated, openModal],
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
