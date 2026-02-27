import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Map Viewer State
  const [isMapViewerOpen, setIsMapViewerOpen] = useState(
    () => sessionStorage.getItem("altuvera_map_isOpen") === "true"
  );
  const [activeMap, setActiveMap] = useState(() => {
    try {
      const raw = sessionStorage.getItem("altuvera_map_payload");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Video Player State
  const [activeVideoId, setActiveVideoId] = useState(() =>
    sessionStorage.getItem("altuvera_videoId"),
  );
  const [isPlayerOpen, setIsPlayerOpen] = useState(
    () => sessionStorage.getItem("altuvera_isOpen") === "true",
  );
  const [playerTitle, setPlayerTitle] = useState(
    () => sessionStorage.getItem("altuvera_title") || "",
  );
  const [masterTabId, setMasterTabId] = useState(() =>
    sessionStorage.getItem("altuvera_masterId"),
  );
  const [myTabId] = useState(() => Math.random().toString(36).substr(2, 9));

  // Sync state across tabs using BroadcastChannel
  const syncChannel = useRef(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    syncChannel.current = new BroadcastChannel("altuvera_video_sync");

    const handleMessage = (event) => {
      const { type, videoId, title, isOpen, masterId } = event.data;

      // 1. If another tab asks for state, and I have one (especially if I'm master), broadcast it
      if (type === "REQUEST_SYNC") {
        if (isPlayerOpen && activeVideoId) {
          syncChannel.current.postMessage({
            type: "SYNC_VIDEO",
            videoId: activeVideoId,
            title: playerTitle,
            isOpen: isPlayerOpen,
            masterId: masterTabId,
          });
        }
        return;
      }

      // 2. If receiving a sync message, update local state
      if (type === "SYNC_VIDEO") {
        isSyncingRef.current = true;
        setActiveVideoId(videoId);
        setPlayerTitle(title);
        setIsPlayerOpen(isOpen);
        setMasterTabId(masterId);
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      }
    };

    syncChannel.current.onmessage = handleMessage;

    // On initial mount, ask other tabs if something is playing
    syncChannel.current.postMessage({ type: "REQUEST_SYNC" });

    return () => {
      if (syncChannel.current) syncChannel.current.close();
    };
  }, [isPlayerOpen, activeVideoId, playerTitle, masterTabId]);
  // Dependency added so REQUEST_SYNC response has latest values in closure

  // Broadcast state changes and save to session
  useEffect(() => {
    sessionStorage.setItem("altuvera_videoId", activeVideoId || "");
    sessionStorage.setItem("altuvera_isOpen", isPlayerOpen);
    sessionStorage.setItem("altuvera_title", playerTitle);
    sessionStorage.setItem("altuvera_masterId", masterTabId || "");

    if (isSyncingRef.current || !syncChannel.current) return;

    syncChannel.current.postMessage({
      type: "SYNC_VIDEO",
      videoId: activeVideoId,
      title: playerTitle,
      isOpen: isPlayerOpen,
      masterId: masterTabId,
    });
  }, [activeVideoId, isPlayerOpen, playerTitle, masterTabId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const addToFavorites = (item) => {
    setFavorites((prev) => [...prev, item]);
  };

  const removeFromFavorites = (itemId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== itemId));
  };

  const playVideo = (videoId, title = "") => {
    setActiveVideoId(videoId);
    setIsPlayerOpen(true);
    setPlayerTitle(title);
    setMasterTabId(myTabId);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setActiveVideoId(null);
    setMasterTabId(null);
    if (syncChannel.current) {
      syncChannel.current.postMessage({
        type: "SYNC_VIDEO",
        videoId: null,
        title: "",
        isOpen: false,
        masterId: null,
      });
    }
  };

  const openMap = (mapInput = {}) => {
    const normalized = {
      title: mapInput.title || "Live Map",
      query: mapInput.query || "",
      lat: Number.isFinite(mapInput.lat) ? mapInput.lat : null,
      lng: Number.isFinite(mapInput.lng) ? mapInput.lng : null,
      zoom: Number.isFinite(mapInput.zoom) ? mapInput.zoom : 7,
    };
    setActiveMap(normalized);
    setIsMapViewerOpen(true);
  };

  const closeMap = () => {
    setIsMapViewerOpen(false);
    setActiveMap(null);
  };

  useEffect(() => {
    sessionStorage.setItem("altuvera_map_isOpen", String(isMapViewerOpen));
    if (activeMap) {
      sessionStorage.setItem("altuvera_map_payload", JSON.stringify(activeMap));
    } else {
      sessionStorage.removeItem("altuvera_map_payload");
    }
  }, [isMapViewerOpen, activeMap]);

  const value = {
    isLoading,
    setIsLoading,
    selectedCountry,
    setSelectedCountry,
    favorites,
    addToFavorites,
    removeFromFavorites,
    searchQuery,
    setSearchQuery,
    isMenuOpen,
    setIsMenuOpen,
    activeVideoId,
    isPlayerOpen,
    playerTitle,
    playVideo,
    closePlayer,
    isMapViewerOpen,
    activeMap,
    openMap,
    closeMap,
    myTabId,
    masterTabId,
    isMaster: myTabId === masterTabId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
