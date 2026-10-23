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
import { useToast } from "./ToastContext";

const STORAGE_KEY = "altuvera_wishlist_ids";

const WishlistContext = createContext(null);

const loadFromStorage = (storageKey = STORAGE_KEY) => {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
};

const saveToStorage = (set, storageKey = STORAGE_KEY) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

export function WishlistProvider({ children }) {
  const { isAuthenticated, openModal, user } = useUserAuth();
  const accountKey = user?.id || user?._id || user?.userId || user?.email || "account";
  const storageKey = `${STORAGE_KEY}:${String(accountKey).toLowerCase()}`;
  const toast = useToast();
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);


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
      const set = loadFromStorage(storageKey);
      setWishlistIds(set);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    loadedRef.current = false;
    loadingRef.current = false;
    setWishlistIds(new Set());
    setLoaded(false);
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadWishlist();
  }, [isAuthenticated, loadWishlist, storageKey]);

  const toggleWishlist = useCallback(
    (destinationId) => {
      if (!destinationId) return;
      if (!isAuthenticated) {
        toast.info(
          "Sign in to save this destination to your wishlist.",
          { title: "Login required" },
        );
        openModal("login", { skipNotLoggedInMessage: true });
        return;
      }

      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (next.has(destinationId)) {
          next.delete(destinationId);
          toast.success("Destination removed from your wishlist.");
        } else {
          next.add(destinationId);
          toast.success("Destination added to your wishlist.");
        }
        saveToStorage(next, storageKey);
        return next;
      });
    },
    [isAuthenticated, openModal, toast, storageKey],
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
