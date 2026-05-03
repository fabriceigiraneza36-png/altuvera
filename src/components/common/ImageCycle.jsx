// ImageCycle.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
} from "react-icons/fi";

// ═══════════════════════════════════════════════════════════════════
// SLIDESHOW CARDS — Clean, Responsive, Automated
// ═══════════════════════════════════════════════════════════════════

const EASE = {
  smooth: [0.22, 1, 0.36, 1],
  spring: [0.25, 0.46, 0.45, 0.94],
  expo: [0.16, 1, 0.3, 1],
};

// ─── Slide Transition Variants ──────────────────────────────────
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4, ease: EASE.smooth },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
    },
  }),
};

const fadeVariants = {
  enter: { opacity: 0, scale: 1.03 },
  center: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.4, ease: EASE.smooth },
  },
};

// ─── Progress Bar ───────────────────────────────────────────────
const ProgressBar = memo(({ current, total, interval, isPlaying }) => {
  if (total <= 1) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        display: "flex",
        gap: "3px",
        padding: "12px 16px 0",
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "3px",
            borderRadius: "100px",
            background: "rgba(255,255,255,0.2)",
            overflow: "hidden",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            style={{
              height: "100%",
              borderRadius: "100px",
              background: "rgba(255,255,255,0.9)",
              transformOrigin: "left",
            }}
            initial={{ scaleX: i < current ? 1 : 0 }}
            animate={{
              scaleX: i < current ? 1 : i === current && isPlaying ? 1 : i === current ? 0 : 0,
            }}
            transition={
              i === current && isPlaying
                ? { duration: interval / 1000, ease: "linear" }
                : { duration: 0.3, ease: EASE.smooth }
            }
            key={`${i}-${current}-${isPlaying}`}
          />
        </div>
      ))}
    </div>
  );
});
ProgressBar.displayName = "ProgressBar";

// ─── Navigation Button ──────────────────────────────────────────
const NavButton = memo(({ direction, onClick, visible }) => {
  const isLeft = direction === "left";

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={isLeft ? "Previous slide" : "Next slide"}
      style={{
        position: "absolute",
        top: "50%",
        [isLeft ? "left" : "right"]: "12px",
        transform: "translateY(-50%)",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.15)",
        outline: "none",
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 30,
        pointerEvents: visible ? "auto" : "none",
        transition: "background 0.2s, border-color 0.2s, transform 0.15s",
      }}
      whileHover={{
        background: "rgba(255,255,255,0.15)",
        borderColor: "rgba(255,255,255,0.3)",
        scale: 1.08,
      }}
      whileTap={{ scale: 0.92 }}
    >
      {isLeft ? (
        <FiChevronLeft size={20} strokeWidth={2} />
      ) : (
        <FiChevronRight size={20} strokeWidth={2} />
      )}
    </motion.button>
  );
});
NavButton.displayName = "NavButton";

// ─── Dot Indicators ─────────────────────────────────────────────
const DotIndicators = memo(({ total, current, onSelect, visible }) => {
  if (total <= 1) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0.4, y: visible ? 0 : 4 }}
      transition={{ duration: 0.4, ease: EASE.expo }}
      aria-label="Slide navigation"
      style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "100px",
        zIndex: 30,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        return (
          <motion.button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(i);
            }}
            animate={{
              width: active ? 24 : 8,
              opacity: active ? 1 : 0.4,
              background: active
                ? "#ffffff"
                : "rgba(255,255,255,0.5)",
            }}
            whileHover={{ opacity: 0.8, scale: 1.2 }}
            transition={{ duration: 0.35, ease: EASE.expo }}
            style={{
              height: "8px",
              borderRadius: "100px",
              border: "none",
              outline: "none",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active ? "true" : undefined}
          />
        );
      })}
    </motion.nav>
  );
});
DotIndicators.displayName = "DotIndicators";

// ─── Play/Pause Toggle ──────────────────────────────────────────
const PlayPauseToggle = memo(({ isPlaying, onToggle, visible }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
    transition={{ duration: 0.3, ease: EASE.expo }}
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
    style={{
      position: "absolute",
      top: "16px",
      right: "16px",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.12)",
      outline: "none",
      background: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      zIndex: 30,
      pointerEvents: visible ? "auto" : "none",
      transition: "background 0.2s",
    }}
    whileHover={{ background: "rgba(255,255,255,0.12)" }}
    whileTap={{ scale: 0.9 }}
  >
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={isPlaying ? "pause" : "play"}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} style={{ marginLeft: 2 }} />}
      </motion.div>
    </AnimatePresence>
  </motion.button>
));
PlayPauseToggle.displayName = "PlayPauseToggle";

// ─── Slide Counter Badge ────────────────────────────────────────
const CounterBadge = memo(({ current, total, visible }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: visible ? 0.85 : 0.3 }}
    transition={{ duration: 0.35 }}
    style={{
      position: "absolute",
      top: "16px",
      left: "16px",
      padding: "4px 10px",
      background: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: "100px",
      color: "#fff",
      fontSize: "12px",
      fontWeight: 600,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      letterSpacing: "0.02em",
      zIndex: 30,
      userSelect: "none",
    }}
    aria-live="polite"
  >
    {current + 1}
    <span style={{ opacity: 0.4, margin: "0 3px" }}>/</span>
    {total}
  </motion.div>
));
CounterBadge.displayName = "CounterBadge";

// ─── Loading Skeleton ───────────────────────────────────────────
const LoadingSkeleton = memo(() => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.08)",
        borderTopColor: "rgba(255,255,255,0.4)",
        animation: "spin 1s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const ImageCycle = ({
  images = [],
  interval = 5000,
  style = {},
  className = "",
  showControls = true,
  showDots = true,
  showPlayPause = true,
  showCounter = true,
  showProgress = true,
  pauseOnHover = true,
  autoPlay = true,
  transitionMode = "slide", // "slide" | "fade"
  overlay = true,
  overlayGradient = "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.35) 100%)",
  aspectRatio = "16/9",
  borderRadius = "16px",
  onSlideChange,
}) => {
  // ── State ──
  const [idx, setIdx] = useState(0);
  const [[direction, slideKey], setSlide] = useState([0, 0]);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(new Set());
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  // ── Responsive Detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Preload Images ──
  useEffect(() => {
    if (!safeImages.length) return;
    let alive = true;
    safeImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      const done = () => {
        if (!alive) return;
        setLoaded((prev) => {
          if (prev.has(src)) return prev;
          const next = new Set(prev);
          next.add(src);
          return next;
        });
      };
      img.onload = done;
      img.onerror = done;
      if (img.complete) done();
    });
    return () => { alive = false; };
  }, [safeImages]);

  // ── Navigation ──
  const goTo = useCallback(
    (newIdx, dir = 1) => {
      if (safeImages.length <= 1) return;
      const normalized =
        ((newIdx % safeImages.length) + safeImages.length) % safeImages.length;
      setIdx(normalized);
      setSlide([dir, Date.now()]);
      onSlideChange?.(normalized);
    },
    [safeImages.length, onSlideChange]
  );

  const next = useCallback(() => goTo(idx + 1, 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1, -1), [goTo, idx]);

  // ── Autoplay ──
  const shouldAutoplay =
    isPlaying &&
    safeImages.length > 1 &&
    interval > 0 &&
    (!pauseOnHover || !hovered);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (shouldAutoplay) {
      timerRef.current = setInterval(next, interval);
    }
    return () => clearInterval(timerRef.current);
  }, [shouldAutoplay, interval, next]);

  // ── Touch Handlers ──
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e) => {
    const dx = touchStart.x - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStart.y - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 50 && Math.abs(dx) > dy * 1.5) {
      dx > 0 ? next() : prev();
    }
  };

  // ── Keyboard Navigation ──
  useEffect(() => {
    const handler = (e) => {
      if (!hovered) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === " ") { e.preventDefault(); setIsPlaying((p) => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hovered, next, prev]);

  // ── Derived ──
  const currentSrc = safeImages[idx];
  const isLoaded = loaded.has(currentSrc);
  const showUI = hovered || isMobile;
  const variants = reducedMotion
    ? fadeVariants
    : transitionMode === "fade"
    ? fadeVariants
    : slideVariants;

  // ─── Empty State ──────────────────────────────────────────────
  if (!safeImages.length) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#111827",
          borderRadius,
          aspectRatio,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            No images available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Slideshow: Image ${idx + 1} of ${safeImages.length}`}
      tabIndex={0}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#111827",
        borderRadius,
        aspectRatio,
        isolation: "isolate",
        cursor: safeImages.length > 1 ? "grab" : "default",
        WebkitTapHighlightColor: "transparent",
        outline: "none",
        ...style,
      }}
    >
      {/* ═══ Slide Layer ═══ */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={`slide-${idx}-${slideKey}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            willChange: "transform, opacity",
          }}
        >
          {!isLoaded && (
            <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
              <LoadingSkeleton />
            </div>
          )}
          <img
            src={currentSrc}
            alt={`Slide ${idx + 1} of ${safeImages.length}`}
            onLoad={() =>
              setLoaded((prev) => {
                if (prev.has(currentSrc)) return prev;
                const n = new Set(prev);
                n.add(currentSrc);
                return n;
              })
            }
            loading="eager"
            decoding="async"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ═══ Overlay ═══ */}
      {overlay && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: overlayGradient,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* ═══ Progress Bars ═══ */}
      {showProgress && safeImages.length > 1 && safeImages.length <= 10 && (
        <ProgressBar
          current={idx}
          total={safeImages.length}
          interval={interval}
          isPlaying={shouldAutoplay}
        />
      )}

      {/* ═══ Counter Badge ═══ */}
      {showControls && showCounter && safeImages.length > 1 && !showProgress && (
        <CounterBadge
          current={idx}
          total={safeImages.length}
          visible={showUI}
        />
      )}

      {/* ═══ Nav Arrows ═══ */}
      {showControls && safeImages.length > 1 && !isMobile && (
        <>
          <NavButton direction="left" onClick={prev} visible={hovered} />
          <NavButton direction="right" onClick={next} visible={hovered} />
        </>
      )}

      {/* ═══ Play/Pause ═══ */}
      {showControls && showPlayPause && safeImages.length > 1 && (
        <PlayPauseToggle
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying((p) => !p)}
          visible={showUI}
        />
      )}

      {/* ═══ Dot Indicators ═══ */}
      {showControls && showDots && safeImages.length > 1 && safeImages.length <= 12 && (
        <DotIndicators
          total={safeImages.length}
          current={idx}
          onSelect={(i) => goTo(i, i > idx ? 1 : -1)}
          visible={showUI}
        />
      )}

      {/* ═══ Mobile Swipe Hint ═══ */}
      {isMobile && safeImages.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2, duration: 0.8 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            bottom: "52px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          <motion.div
            animate={{ x: [-12, 12, -12] }}
            transition={{ duration: 2, repeat: 2, ease: "easeInOut" }}
            onAnimationComplete={(def) => {}}
            style={{
              width: "32px",
              height: "3px",
              borderRadius: "100px",
              background: "rgba(255,255,255,0.25)",
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default memo(ImageCycle);