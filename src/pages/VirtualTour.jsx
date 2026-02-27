// src/pages/VirtualTour.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  FiPlay,
  FiPause,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiClock,
  FiMapPin,
  FiMaximize2,
  FiRefreshCw,
  FiAlertCircle,
  FiVolume2,
  FiCompass,
  FiCamera,
  FiHeadphones,
  FiMonitor,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import { useApp } from "../context/AppContext";
import { useVirtualTours } from "../hooks/useVirtualTours";
import virtualTourService from "../services/virtualTourService";

/* ═══════════════════════════════════════════════════════
   SHIMMER KEYFRAMES — injected once
   ═══════════════════════════════════════════════════════ */
const globalStyles = `
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.08); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes progressBar {
    from { width: 0%; }
    to   { width: 100%; }
  }
  .vt-thumb-track::-webkit-scrollbar {
    height: 6px;
  }
  .vt-thumb-track::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.05);
    border-radius: 3px;
  }
  .vt-thumb-track::-webkit-scrollbar-thumb {
    background: #059669;
    border-radius: 3px;
  }
`;

/* ═══════════════════════════════════════════════════════
   SKELETON COMPONENTS
   ═══════════════════════════════════════════════════════ */
const shimmerBg = {
  background:
    "linear-gradient(110deg, #e2e8f0 8%, #f1f5f9 18%, #e2e8f0 33%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease infinite",
};

const SkeletonHero = () => (
  <div
    style={{
      borderRadius: "28px",
      height: "65vh",
      minHeight: "500px",
      ...shimmerBg,
    }}
  />
);

const SkeletonSlide = () => (
  <div
    style={{
      flex: "0 0 280px",
      height: "170px",
      borderRadius: "16px",
      ...shimmerBg,
    }}
  />
);

/* ═══════════════════════════════════════════════════════
   ERROR DISPLAY
   ═══════════════════════════════════════════════════════ */
const ErrorDisplay = ({ message, onRetry }) => (
  <div
    style={{
      textAlign: "center",
      padding: "80px 24px",
      background: "linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)",
      borderRadius: "28px",
      margin: "0 auto",
      maxWidth: "560px",
    }}
  >
    <div
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        backgroundColor: "#FEE2E2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
      }}
    >
      <FiAlertCircle size={36} color="#DC2626" />
    </div>
    <h3
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "26px",
        color: "#991B1B",
        marginBottom: "12px",
      }}
    >
      Unable to Load Tours
    </h3>
    <p style={{ color: "#B91C1C", marginBottom: "32px", lineHeight: 1.6 }}>
      {message}
    </p>
    <button
      onClick={onRetry}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 36px",
        background: "linear-gradient(135deg, #059669, #047857)",
        color: "#fff",
        border: "none",
        borderRadius: "50px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "600",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 4px 20px rgba(5,150,105,0.3)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(5,150,105,0.4)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(5,150,105,0.3)";
      }}
    >
      <FiRefreshCw size={18} />
      Retry
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════ */
const EmptyState = () => (
  <div style={{ textAlign: "center", padding: "100px 24px" }}>
    <div
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 28px",
        fontSize: "56px",
      }}
    >
      🎬
    </div>
    <h3
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "32px",
        color: "#1a1a1a",
        marginBottom: "12px",
      }}
    >
      No Virtual Tours Yet
    </h3>
    <p
      style={{
        color: "#6B7280",
        fontSize: "18px",
        maxWidth: "400px",
        margin: "0 auto",
        lineHeight: 1.6,
      }}
    >
      Immersive safari experiences are coming soon. Check back later!
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const VirtualTour = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef(null);
  const autoPlayRef = useRef(null);
  const progressRef = useRef(null);

  const { playVideo, activeVideoId, isPlayerOpen } = useApp();

  const { tours, loading, error, refetch } = useVirtualTours({
    sort: "sort_order",
    order: "asc",
    limit: 20,
  });

  const currentTour = useMemo(
    () => tours[currentIndex] || null,
    [tours, currentIndex]
  );

  const currentVideoId = useMemo(() => {
    if (!currentTour) return null;
    return (
      currentTour.video_id ||
      virtualTourService.constructor.getVideoId(currentTour.video_url)
    );
  }, [currentTour]);

  const getLocation = useCallback((tour) => {
    if (!tour) return "";
    if (tour.meta?.location) return tour.meta.location;
    if (tour.destination_name) return tour.destination_name;
    return "East Africa";
  }, []);

  /* ── Navigation ── */
  const goTo = useCallback(
    (index) => {
      if (isTransitioning || tours.length === 0) return;
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, tours.length]
  );

  const next = useCallback(() => {
    goTo((currentIndex + 1) % tours.length);
  }, [currentIndex, tours.length, goTo]);

  const prev = useCallback(() => {
    goTo((currentIndex - 1 + tours.length) % tours.length);
  }, [currentIndex, tours.length, goTo]);

  /* ── Auto-play ── */
  useEffect(() => {
    if (!autoPlay || tours.length <= 1 || isPlayerOpen) return;

    const DURATION = 8000;
    const TICK = 50;
    let elapsed = 0;

    progressRef.current = setInterval(() => {
      elapsed += TICK;
      setProgress((elapsed / DURATION) * 100);
    }, TICK);

    autoPlayRef.current = setTimeout(() => {
      next();
    }, DURATION);

    return () => {
      clearTimeout(autoPlayRef.current);
      clearInterval(progressRef.current);
    };
  }, [autoPlay, currentIndex, tours.length, next, isPlayerOpen]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") {
        setAutoPlay(false);
        next();
      }
      if (e.key === "ArrowLeft") {
        setAutoPlay(false);
        prev();
      }
      if (e.key === " ") {
        e.preventDefault();
        setAutoPlay((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  /* ── Scroll active thumbnail into view ── */
  useEffect(() => {
    if (!trackRef.current) return;
    const active = trackRef.current.children[currentIndex];
    if (active) {
      active.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  /* ── Features data ── */
  const features = [
    {
      icon: <FiCamera size={28} />,
      title: "360° Panorama",
      desc: "Full immersive panoramic views of every destination",
      color: "#059669",
    },
    {
      icon: <FiHeadphones size={28} />,
      title: "Audio Narration",
      desc: "Professional guides tell each destination's story",
      color: "#0891B2",
    },
    {
      icon: <FiCompass size={28} />,
      title: "Interactive Map",
      desc: "Navigate and explore locations in real-time",
      color: "#7C3AED",
    },
    {
      icon: <FiMonitor size={28} />,
      title: "4K Ultra HD",
      desc: "Crystal clear quality on any screen size",
      color: "#DB2777",
    },
  ];

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div style={{ backgroundColor: "#FAFDF7" }}>
      <style>{globalStyles}</style>

      <PageHeader
        title="Virtual Tours"
        subtitle="Explore East Africa's most breathtaking destinations from anywhere in the world"
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
        breadcrumbs={[{ label: "Virtual Tours" }]}
      />

      <section
        style={{
          padding: "60px 24px 100px",
          maxWidth: "1480px",
          margin: "0 auto",
        }}
      >
        {/* ── ERROR ── */}
        {error && <ErrorDisplay message={error} onRetry={refetch} />}

        {/* ── LOADING ── */}
        {loading && !error && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <SkeletonHero />
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "32px",
                overflowX: "hidden",
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonSlide key={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── EMPTY ── */}
        {!loading && !error && tours.length === 0 && <EmptyState />}

        {/* ── MAIN CONTENT ── */}
        {!loading && !error && currentTour && (
          <>
            {/* ══════════ HERO VIEWER ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div
                style={{
                  position: "relative",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.18)",
                  height: "65vh",
                  minHeight: "500px",
                  maxHeight: "750px",
                }}
              >
                {/* Background image with transition */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${currentTour.panorama_url || currentTour.thumbnail_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "opacity 0.6s ease",
                    opacity: isTransitioning ? 0.4 : 1,
                    transform: isTransitioning ? "scale(1.05)" : "scale(1)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: "0.6s",
                  }}
                />

                {/* Gradient overlays */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `
                      linear-gradient(180deg,
                        rgba(0,0,0,0.25) 0%,
                        transparent 35%,
                        transparent 55%,
                        rgba(0,0,0,0.75) 100%
                      )`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 50%)",
                  }}
                />

                {/* Top bar — counter + autoplay */}
                <div
                  style={{
                    position: "absolute",
                    top: "24px",
                    left: "28px",
                    right: "28px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 3,
                  }}
                >
                  <span
                    style={{
                      padding: "8px 18px",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "30px",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {currentIndex + 1} / {tours.length}
                  </span>

                  <button
                    onClick={() => setAutoPlay((p) => !p)}
                    style={{
                      padding: "8px 18px",
                      backgroundColor: autoPlay
                        ? "rgba(5,150,105,0.8)"
                        : "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "30px",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.3s",
                    }}
                  >
                    {autoPlay ? <FiPause size={14} /> : <FiPlay size={14} />}
                    {autoPlay ? "Auto" : "Paused"}
                  </button>
                </div>

                {/* Navigation arrows */}
                {tours.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setAutoPlay(false);
                        prev();
                      }}
                      aria-label="Previous tour"
                      style={{
                        position: "absolute",
                        left: "24px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        transition: "all 0.3s",
                        zIndex: 3,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(5,150,105,0.9)";
                        e.currentTarget.style.border =
                          "1px solid rgba(5,150,105,0.9)";
                        e.currentTarget.style.transform =
                          "translateY(-50%) scale(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.15)";
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.25)";
                        e.currentTarget.style.transform =
                          "translateY(-50%) scale(1)";
                      }}
                    >
                      <FiChevronLeft size={22} />
                    </button>
                    <button
                      onClick={() => {
                        setAutoPlay(false);
                        next();
                      }}
                      aria-label="Next tour"
                      style={{
                        position: "absolute",
                        right: "24px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        transition: "all 0.3s",
                        zIndex: 3,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(5,150,105,0.9)";
                        e.currentTarget.style.border =
                          "1px solid rgba(5,150,105,0.9)";
                        e.currentTarget.style.transform =
                          "translateY(-50%) scale(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.15)";
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.25)";
                        e.currentTarget.style.transform =
                          "translateY(-50%) scale(1)";
                      }}
                    >
                      <FiChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Bottom content */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "0 40px 40px",
                    zIndex: 2,
                    animation: isTransitioning ? "none" : "fadeUp 0.5s ease",
                  }}
                >
                  {/* Location badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 16px",
                        background:
                          "linear-gradient(135deg, #059669, #047857)",
                        borderRadius: "30px",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "white",
                        letterSpacing: "0.3px",
                        textTransform: "uppercase",
                      }}
                    >
                      <FiMapPin size={13} />
                      {getLocation(currentTour)}
                    </span>

                    {currentTour.media_type && (
                      <span
                        style={{
                          padding: "7px 14px",
                          backgroundColor: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "30px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "white",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {currentTour.media_type === "panorama"
                          ? "360°"
                          : currentTour.media_type === "mixed"
                            ? "Mixed Media"
                            : "Video"}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(28px, 4vw, 48px)",
                      fontWeight: "700",
                      color: "white",
                      marginBottom: "12px",
                      lineHeight: 1.15,
                      maxWidth: "700px",
                      textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {currentTour.title}
                  </h2>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "clamp(15px, 1.5vw, 18px)",
                      color: "rgba(255,255,255,0.85)",
                      maxWidth: "580px",
                      marginBottom: "20px",
                      lineHeight: 1.6,
                    }}
                  >
                    {currentTour.description}
                  </p>

                  {/* Tags */}
                  {currentTour.tags?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      {currentTour.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: "5px 14px",
                            backgroundColor: "rgba(255,255,255,0.12)",
                            borderRadius: "20px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.8)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Controls row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Play button */}
                    <button
                      onClick={() => {
                        if (currentVideoId) {
                          setAutoPlay(false);
                          playVideo(currentVideoId, currentTour.title);
                        }
                      }}
                      aria-label="Play tour video"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 32px",
                        background:
                          "linear-gradient(135deg, #059669, #047857)",
                        border: "none",
                        borderRadius: "50px",
                        cursor: "pointer",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "700",
                        transition: "all 0.3s",
                        boxShadow: "0 8px 30px rgba(5,150,105,0.4)",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-2px) scale(1.03)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 40px rgba(5,150,105,0.5)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(5,150,105,0.4)";
                      }}
                    >
                      {isPlayerOpen && activeVideoId === currentVideoId ? (
                        <FiPause size={20} />
                      ) : (
                        <FiPlay size={20} />
                      )}
                      {isPlayerOpen && activeVideoId === currentVideoId
                        ? "Now Playing"
                        : "Watch Tour"}
                    </button>

                    {/* Meta info pills */}
                    {currentTour.duration && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 18px",
                          backgroundColor: "rgba(255,255,255,0.12)",
                          backdropFilter: "blur(12px)",
                          borderRadius: "30px",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        <FiClock size={15} />
                        {currentTour.duration}
                      </span>
                    )}

                    {currentTour.view_count > 0 && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 18px",
                          backgroundColor: "rgba(255,255,255,0.12)",
                          backdropFilter: "blur(12px)",
                          borderRadius: "30px",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        <FiEye size={15} />
                        {currentTour.view_count.toLocaleString()}
                      </span>
                    )}

                    <button
                      aria-label="Volume"
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(12px)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        transition: "background-color 0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.25)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.12)")
                      }
                    >
                      <FiVolume2 size={18} />
                    </button>

                    <button
                      aria-label="Fullscreen"
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(12px)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        transition: "background-color 0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.25)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.12)")
                      }
                    >
                      <FiMaximize2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Auto-play progress bar */}
                {autoPlay && tours.length > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      zIndex: 4,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background:
                          "linear-gradient(90deg, #059669, #34D399)",
                        transition: "width 0.05s linear",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* ══════════ DOT INDICATORS ══════════ */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                padding: "24px 0 8px",
              }}
            >
              {tours.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAutoPlay(false);
                    goTo(i);
                  }}
                  aria-label={`Go to tour ${i + 1}`}
                  style={{
                    width: currentIndex === i ? "28px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    backgroundColor:
                      currentIndex === i ? "#059669" : "#D1D5DB",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* ══════════ BOTTOM SLIDESHOW ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div style={{ marginTop: "16px" }}>
                {/* Section header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "26px",
                        fontWeight: "700",
                        color: "#111827",
                        marginBottom: "4px",
                      }}
                    >
                      Explore All Tours
                    </h3>
                    <p
                      style={{
                        fontSize: "15px",
                        color: "#6B7280",
                      }}
                    >
                      {tours.length} immersive experiences available
                    </p>
                  </div>

                  {/* Scroll controls */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        if (trackRef.current) {
                          trackRef.current.scrollBy({
                            left: -320,
                            behavior: "smooth",
                          });
                        }
                      }}
                      aria-label="Scroll left"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#374151",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#059669";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#059669";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.color = "#374151";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (trackRef.current) {
                          trackRef.current.scrollBy({
                            left: 320,
                            behavior: "smooth",
                          });
                        }
                      }}
                      aria-label="Scroll right"
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#374151",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#059669";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#059669";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.color = "#374151";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Horizontal scroll track */}
                <div
                  ref={trackRef}
                  className="vt-thumb-track"
                  style={{
                    display: "flex",
                    gap: "20px",
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    paddingBottom: "12px",
                    scrollBehavior: "smooth",
                  }}
                >
                  {tours.map((tour, index) => {
                    const isActive = currentIndex === index;
                    return (
                      <div
                        key={tour.id}
                        onClick={() => {
                          setAutoPlay(false);
                          goTo(index);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${tour.title}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setAutoPlay(false);
                            goTo(index);
                          }
                        }}
                        style={{
                          flex: "0 0 280px",
                          scrollSnapAlign: "start",
                          position: "relative",
                          borderRadius: "18px",
                          overflow: "hidden",
                          cursor: "pointer",
                          height: "180px",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          border: isActive
                            ? "3px solid #059669"
                            : "3px solid transparent",
                          boxShadow: isActive
                            ? "0 8px 30px rgba(5,150,105,0.25)"
                            : "0 4px 16px rgba(0,0,0,0.08)",
                          transform: isActive
                            ? "translateY(-4px)"
                            : "translateY(0)",
                          opacity: isActive ? 1 : 0.85,
                        }}
                        onMouseOver={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.boxShadow =
                              "0 8px 25px rgba(0,0,0,0.12)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.transform =
                              "translateY(0)";
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.boxShadow =
                              "0 4px 16px rgba(0,0,0,0.08)";
                          }
                        }}
                      >
                        <img
                          src={tour.thumbnail_url}
                          alt={tour.title}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.6s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.08)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />

                        {/* Overlay gradient */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: `
                              linear-gradient(180deg,
                                transparent 30%,
                                rgba(0,0,0,0.8) 100%
                              )`,
                          }}
                        />

                        {/* Active indicator bar */}
                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "3px",
                              background:
                                "linear-gradient(90deg, #059669, #34D399)",
                            }}
                          />
                        )}

                        {/* Play icon */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: isActive
                              ? "rgba(5,150,105,0.9)"
                              : "rgba(255,255,255,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s",
                            opacity: isActive ? 1 : 0,
                          }}
                        >
                          <FiPlay size={16} color="white" />
                        </div>

                        {/* Bottom content */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "14px 16px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "white",
                              marginBottom: "6px",
                              lineHeight: 1.3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tour.title}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                color: "#34D399",
                                fontWeight: "600",
                              }}
                            >
                              <FiMapPin size={11} />
                              {tour.meta?.location ||
                                tour.destination_name ||
                                ""}
                            </span>
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                color: "rgba(255,255,255,0.7)",
                              }}
                            >
                              <FiClock size={11} />
                              {tour.duration || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>

            {/* ══════════ FEATURES SECTION ══════════ */}
            <AnimatedSection animation="fadeInUp">
              <div style={{ marginTop: "80px" }}>
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 20px",
                      backgroundColor: "#ECFDF5",
                      borderRadius: "30px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#059669",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "16px",
                    }}
                  >
                    Why Virtual Tours
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(28px, 3vw, 38px)",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "12px",
                    }}
                  >
                    Immersive Experience Features
                  </h3>
                  <p
                    style={{
                      fontSize: "17px",
                      color: "#6B7280",
                      maxWidth: "540px",
                      margin: "0 auto",
                      lineHeight: 1.6,
                    }}
                  >
                    Every virtual tour is crafted with cutting-edge technology
                    for the most realistic safari experience
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "22px",
                        padding: "36px 28px",
                        textAlign: "center",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                        border: "1px solid #F3F4F6",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "default",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = `0 20px 50px ${feature.color}18`;
                        e.currentTarget.style.borderColor = `${feature.color}30`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 16px rgba(0,0,0,0.04)";
                        e.currentTarget.style.borderColor = "#F3F4F6";
                      }}
                    >
                      <div
                        style={{
                          width: "68px",
                          height: "68px",
                          borderRadius: "20px",
                          background: `${feature.color}12`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          color: feature.color,
                          transition: "transform 0.3s",
                        }}
                      >
                        {feature.icon}
                      </div>
                      <h4
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#111827",
                          marginBottom: "10px",
                        }}
                      >
                        {feature.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          lineHeight: 1.7,
                        }}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </>
        )}
      </section>
    </div>
  );
};

export default VirtualTour;