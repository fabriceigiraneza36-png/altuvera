// ImageCycle.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollTriggeredSlide } from "../../hooks/useScrollTriggeredSlide";
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";

// ═══════════════════════════════════════════════════════════════
// ULTRA IMAGE CYCLE — Premium Image Carousel
// Responsive, Accessible, Performance-Optimized
// ═══════════════════════════════════════════════════════════════

// Inject keyframes once
const injectKeyframes = () => {
  if (document.getElementById("image-cycle-keyframes")) return;
  const style = document.createElement("style");
  style.id = "image-cycle-keyframes";
  style.textContent = `
    @keyframes imageCycleShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes imageCycleKenBurns {
      0% { transform: scale(1) translate(0, 0); }
      50% { transform: scale(1.08) translate(-1%, -1%); }
      100% { transform: scale(1) translate(0, 0); }
    }
    @keyframes imageCyclePulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    @keyframes imageCycleProgress {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
  `;
  document.head.appendChild(style);
};

// Loading Skeleton Component
const ImageSkeleton = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(135deg, #1F2937 0%, #111827 50%, #1F2937 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "imageCycleShimmer 2s infinite linear",
      }}
    />
    <div
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "rgba(16, 185, 129, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "3px solid rgba(16, 185, 129, 0.2)",
          borderTopColor: "#10B981",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

// Navigation Button Component
const NavButton = ({ direction, onClick, visible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLeft = direction === "left";

  return (
    <motion.button
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : isLeft ? -20 : 20,
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        top: "50%",
        [isLeft ? "left" : "right"]: "16px",
        transform: "translateY(-50%)",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: isHovered
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: isHovered ? "#065F46" : "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 20,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: isHovered
          ? "0 8px 24px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.15)",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-label={isLeft ? "Previous image" : "Next image"}
    >
      {isLeft ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
    </motion.button>
  );
};

// Dot Indicator Component
const DotIndicator = ({ total, current, onSelect, visible }) => {
  if (total <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: visible ? 1 : 0.6, y: 0 }}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "8px",
        padding: "8px 14px",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "100px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 20,
      }}
    >
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          style={{
            width: idx === current ? "24px" : "8px",
            height: "8px",
            borderRadius: "100px",
            border: "none",
            background:
              idx === current
                ? "linear-gradient(135deg, #34D399 0%, #10B981 100%)"
                : "rgba(255, 255, 255, 0.4)",
            cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            padding: 0,
          }}
          aria-label={`Go to image ${idx + 1}`}
          aria-current={idx === current ? "true" : "false"}
        />
      ))}
    </motion.div>
  );
};

// Progress Bar Component
const ProgressBar = ({ duration, isPlaying, onComplete }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      setKey((prev) => prev + 1);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [key, duration, isPlaying, onComplete]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "rgba(255, 255, 255, 0.1)",
        zIndex: 25,
        overflow: "hidden",
      }}
    >
      {isPlaying && (
        <div
          key={key}
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, #10B981, #34D399)",
            transformOrigin: "left",
            animation: `imageCycleProgress ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};

// Play/Pause Button
const PlayPauseButton = ({ isPlaying, onToggle, visible }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.8,
      }}
      transition={{ duration: 0.3 }}
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: isHovered
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 20,
        transition: "all 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
    >
      {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
    </motion.button>
  );
};

// Main Component
const ImageCycle = ({
  images = [],
  interval = 6000,
  style = {},
  className = "",
  showControls = true,
  showDots = true,
  showProgress = true,
  showPlayPause = false,
  kenBurns = false,
  pauseOnHover = true,
  autoPlay = true,
  overlay = true,
  overlayGradient = "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)",
  onSlideChange,
  aspectRatio,
}) => {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef(null);

  // Inject keyframes
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Navigation functions
  const goToSlide = useCallback(
    (newIndex) => {
      if (safeImages.length <= 1) return;
      const normalized = ((newIndex % safeImages.length) + safeImages.length) % safeImages.length;
      setIndex(normalized);
      onSlideChange?.(normalized);
    },
    [safeImages.length, onSlideChange]
  );

  const nextSlide = useCallback(() => {
    goToSlide(index + 1);
  }, [goToSlide, index]);

  const prevSlide = useCallback(() => {
    goToSlide(index - 1);
  }, [goToSlide, index]);

  // Scroll-triggered slide
  const scrollRef = useScrollTriggeredSlide(nextSlide, 250);

  // Combine refs
  useEffect(() => {
    if (scrollRef.current && containerRef.current) {
      scrollRef.current = containerRef.current;
    }
  }, [scrollRef]);

  // Auto-play logic
  const shouldPlay = isPlaying && safeImages.length > 1 && (!pauseOnHover || !isHovered);

  // Preload next image
  useEffect(() => {
    if (safeImages.length <= 1) return;
    const nextIndex = (index + 1) % safeImages.length;
    const img = new Image();
    img.src = safeImages[nextIndex];
    img.onload = () => {
      setLoadedImages((prev) => new Set(prev).add(safeImages[nextIndex]));
    };
  }, [index, safeImages]);

  // Handle image load
  const handleImageLoad = useCallback((src) => {
    setLoadedImages((prev) => new Set(prev).add(src));
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const threshold = 50;

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isHovered) return;
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHovered, nextSlide, prevSlide]);

  // Styles
  const styles = {
    container: {
      position: "relative",
      overflow: "hidden",
      transform: "translateZ(0)",
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
      borderRadius: "inherit",
      ...(aspectRatio && { aspectRatio }),
      ...style,
    },
    image: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      willChange: "opacity, transform",
      ...(kenBurns &&
        !prefersReducedMotion && {
          animation: `imageCycleKenBurns ${interval * 1.5}ms ease-in-out infinite`,
        }),
    },
    overlay: {
      position: "absolute",
      inset: 0,
      background: overlayGradient,
      pointerEvents: "none",
      zIndex: 5,
    },
    ambientGlow: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 3,
    },
    emptyState: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)",
    },
    emptyIcon: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: "rgba(16, 185, 129, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: "rgba(255, 255, 255, 0.5)",
      fontSize: "14px",
      fontWeight: 500,
    },
    counter: {
      position: "absolute",
      top: "16px",
      left: "16px",
      padding: "6px 12px",
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(8px)",
      borderRadius: "8px",
      color: "white",
      fontSize: "12px",
      fontWeight: 600,
      zIndex: 20,
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
  };

  // Empty state
  if (safeImages.length === 0) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={styles.container}
        role="img"
        aria-label="No images available"
      >
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <span style={styles.emptyText}>No images available</span>
        </div>
      </div>
    );
  }

  const currentImage = safeImages[index];
  const isCurrentLoaded = loadedImages.has(currentImage);
  const showNavigation = showControls && safeImages.length > 1;

  return (
    <div
      ref={containerRef}
      className={className}
      style={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Image carousel, showing image ${index + 1} of ${safeImages.length}`}
      tabIndex={0}
    >
      {/* Loading Skeleton */}
      {!isCurrentLoaded && <ImageSkeleton />}

      {/* Images */}
      <AnimatePresence mode="wait">
        <motion.img
          key={`${currentImage}-${index}`}
          src={currentImage}
          alt={`Slide ${index + 1} of ${safeImages.length}`}
          initial={{
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 1.05,
          }}
          animate={{
            opacity: isCurrentLoaded ? 1 : 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 0.98,
          }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          onLoad={() => handleImageLoad(currentImage)}
          loading="lazy"
          decoding="async"
          style={styles.image}
        />
      </AnimatePresence>

      {/* Overlay */}
      {overlay && <div style={styles.overlay} />}

      {/* Ambient Glow Animation */}
      {!prefersReducedMotion && (
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)",
              "radial-gradient(ellipse at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={styles.ambientGlow}
        />
      )}

      {/* Counter Badge */}
      {safeImages.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isHovered || isMobile ? 1 : 0.7, y: 0 }}
          style={styles.counter}
        >
          {index + 1} / {safeImages.length}
        </motion.div>
      )}

      {/* Navigation Arrows */}
      {showNavigation && !isMobile && (
        <>
          <NavButton
            direction="left"
            onClick={prevSlide}
            visible={isHovered}
          />
          <NavButton
            direction="right"
            onClick={nextSlide}
            visible={isHovered}
          />
        </>
      )}

      {/* Play/Pause Button */}
      {showPlayPause && safeImages.length > 1 && (
        <PlayPauseButton
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying((p) => !p)}
          visible={isHovered || isMobile}
        />
      )}

      {/* Dot Indicators */}
      {showDots && safeImages.length > 1 && safeImages.length <= 10 && (
        <DotIndicator
          total={safeImages.length}
          current={index}
          onSelect={goToSlide}
          visible={isHovered || isMobile}
        />
      )}

      {/* Progress Bar */}
      {showProgress && safeImages.length > 1 && (
        <ProgressBar
          duration={interval}
          isPlaying={shouldPlay}
          onComplete={nextSlide}
        />
      )}
    </div>
  );
};

export default ImageCycle;