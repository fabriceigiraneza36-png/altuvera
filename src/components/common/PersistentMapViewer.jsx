// PersistentMapViewer.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiExternalLink,
  FiMapPin,
  FiMaximize,
  FiMaximize2,
  FiMinimize2,
  FiMinus,
  FiMove,
  FiX,
  FiMap,
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import {
  toGoogleMapEmbedUrl,
  toGoogleMapOpenUrl,
} from "../../utils/mediaEmbed";

// ═══════════════════════════════════════════════════════════════
// PERSISTENT MAP VIEWER — Modern Floating Panel
// Professional, Responsive, Draggable
// ═══════════════════════════════════════════════════════════════

const FLOAT_MARGIN = 16;
const MOBILE_BREAKPOINT = 640;

// Inject keyframes once
const injectKeyframes = () => {
  if (document.getElementById("map-viewer-keyframes")) return;
  const style = document.createElement("style");
  style.id = "map-viewer-keyframes";
  style.textContent = `
    @keyframes mapPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    @keyframes mapShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
};

// Calculate panel dimensions based on state
const getPanelSize = (isExpanded, isMobile) => {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  if (isMobile) {
    const width = viewportWidth - FLOAT_MARGIN * 2;
    const mediaHeight = isExpanded ? Math.min(280, viewportHeight * 0.35) : 0;
    return { width, height: 64 + mediaHeight };
  }

  const width = isExpanded
    ? Math.min(480, Math.max(360, viewportWidth * 0.35))
    : Math.min(320, Math.max(280, viewportWidth * 0.25));
  const mediaHeight = isExpanded ? Math.round((width * 9) / 16) : 0;
  return { width, height: 64 + mediaHeight };
};

// Clamp position within viewport bounds
const clampPosition = (position, isExpanded, isMobile) => {
  if (typeof window === "undefined") return position;
  const { width, height } = getPanelSize(isExpanded, isMobile);
  return {
    x: Math.min(
      Math.max(FLOAT_MARGIN, position.x),
      Math.max(FLOAT_MARGIN, window.innerWidth - width - FLOAT_MARGIN)
    ),
    y: Math.min(
      Math.max(FLOAT_MARGIN, position.y),
      Math.max(FLOAT_MARGIN, window.innerHeight - height - FLOAT_MARGIN)
    ),
  };
};

// Default position (bottom-right corner)
const getDefaultPosition = (isExpanded, isMobile) => {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  const { width, height } = getPanelSize(isExpanded, isMobile);
  
  if (isMobile) {
    return {
      x: FLOAT_MARGIN,
      y: window.innerHeight - height - FLOAT_MARGIN - 60, // Account for mobile nav
    };
  }
  
  return {
    x: window.innerWidth - width - 24,
    y: window.innerHeight - height - 24,
  };
};

// Control Button Component
const ControlButton = ({
  onClick,
  onMouseDown,
  onTouchStart,
  title,
  children,
  variant = "default",
  isDragging = false,
  href,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: isHovered
      ? "rgba(255, 255, 255, 0.15)"
      : "rgba(15, 23, 42, 0.6)",
    color: variant === "danger" ? "#FCA5A5" : variant === "accent" ? "#34D399" : "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: isDragging ? "grabbing" : disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    transform: isHovered && !isDragging ? "scale(1.05)" : "scale(1)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    textDecoration: "none",
    touchAction: "none",
    opacity: disabled ? 0.5 : 1,
  };

  const commonProps = {
    style: baseStyle,
    title,
    onMouseEnter: () => !disabled && setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      disabled={disabled}
      {...commonProps}
    >
      {children}
    </button>
  );
};

// Loading Skeleton
const MapSkeleton = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: "#0F172A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "rgba(52, 211, 153, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FiMap size={24} style={{ color: "#34D399", animation: "mapPulse 1.5s infinite" }} />
    </div>
    <div
      style={{
        width: "120px",
        height: "8px",
        borderRadius: "4px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)",
        backgroundSize: "200% 100%",
        animation: "mapShimmer 1.5s infinite linear",
      }}
    />
  </div>
);

// Main Component
const PersistentMapViewer = () => {
  const { isMapViewerOpen, activeMap, closeMap } = useApp();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(() => getDefaultPosition(true, false));
  const [isDragging, setIsDragging] = useState(false);

  const frameRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });

  // Inject keyframes
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setPosition((prev) => clampPosition(prev, isExpanded, mobile));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isExpanded]);

  // Generate URLs
  const embedUrl = useMemo(() => {
    if (!activeMap) return "";
    return toGoogleMapEmbedUrl(activeMap);
  }, [activeMap]);

  const openUrl = useMemo(() => {
    if (!activeMap) return "";
    return toGoogleMapOpenUrl(activeMap);
  }, [activeMap]);

  // Reset loading state when map changes
  useEffect(() => {
    if (activeMap) {
      setIsLoading(true);
    }
  }, [activeMap]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      setIsBrowserFullscreen(isFullscreen);
      if (!isFullscreen) setControlsVisible(true);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  // Resize handler
  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => clampPosition(prev, isExpanded, isMobile));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isExpanded, isMobile]);

  // Position update when expanded state changes
  useEffect(() => {
    setPosition((prev) => clampPosition(prev, isExpanded, isMobile));
  }, [isExpanded, isMobile]);

  // Drag handlers
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (event) => {
      const point = "touches" in event ? event.touches[0] : event;
      if (!point) return;
      event.preventDefault();
      setPosition(
        clampPosition(
          {
            x: dragRef.current.originX + point.clientX - dragRef.current.startX,
            y: dragRef.current.originY + point.clientY - dragRef.current.startY,
          },
          isExpanded,
          isMobile
        )
      );
    };

    const onEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, isExpanded, isMobile]);

  // Keyboard handler
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        if (isBrowserFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (isTheaterMode) {
          setIsTheaterMode(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isBrowserFullscreen, isTheaterMode]);

  const keepControlsVisible = useCallback(() => {
    if (!isTheaterMode && !isBrowserFullscreen) return;
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 2500);
  }, [isTheaterMode, isBrowserFullscreen]);

  const startDrag = useCallback(
    (event) => {
      if (isTheaterMode || isBrowserFullscreen || isMobile) return;
      if ("button" in event && event.button !== 0) return;
      const point = "touches" in event ? event.touches[0] : event;
      if (!point) return;
      dragRef.current = {
        startX: point.clientX,
        startY: point.clientY,
        originX: position.x,
        originY: position.y,
      };
      setIsDragging(true);
    },
    [isTheaterMode, isBrowserFullscreen, isMobile, position]
  );

  const handleToggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && frameRef.current) {
        await frameRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be blocked
    }
  }, []);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsDragging(false);
    setIsTheaterMode(false);
    closeMap();
  }, [closeMap]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (!isMapViewerOpen || !activeMap || !embedUrl) return null;

  const showOverlayControls = controlsVisible || (!isTheaterMode && !isBrowserFullscreen);
  const { width: compactWidth } = getPanelSize(isExpanded, isMobile);
  const isActuallyExpanded = isExpanded || isTheaterMode || isBrowserFullscreen;
  const isFullView = isTheaterMode || isBrowserFullscreen;

  // Styles
  const styles = {
    backdrop: {
      position: "fixed",
      inset: 0,
      background: "radial-gradient(circle at center, rgba(15, 23, 42, 0.85) 0%, rgba(2, 6, 23, 0.97) 100%)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      zIndex: 9998,
    },
    panel: {
      position: "fixed",
      zIndex: 9999,
      overflow: "hidden",
      borderRadius: isFullView ? "20px" : "18px",
      background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: `
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `,
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: isMobile ? "12px 14px" : "14px 16px",
      borderBottom: isActuallyExpanded ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
      background: "rgba(0, 0, 0, 0.2)",
    },
    titleContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flex: 1,
      minWidth: 0,
    },
    mapIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: "1px solid rgba(52, 211, 153, 0.2)",
    },
    titleText: {
      color: "#FFFFFF",
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "0.3px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    controls: {
      display: "flex",
      gap: "8px",
      flexShrink: 0,
    },
    mapContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: "16 / 9",
      background: "#0F172A",
      overflow: "hidden",
    },
    iframe: {
      width: "100%",
      height: "100%",
      border: "none",
      display: isLoading ? "none" : "block",
    },
    overlayControls: {
      position: "absolute",
      top: "12px",
      right: "12px",
      display: "flex",
      gap: "8px",
      opacity: showOverlayControls ? 1 : 0,
      transform: showOverlayControls ? "translateY(0)" : "translateY(-10px)",
      transition: "all 0.3s ease",
      pointerEvents: showOverlayControls ? "auto" : "none",
    },
    statusBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: "16px",
      background: "linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
    },
    statusText: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "12px",
      fontWeight: 500,
    },
    liveBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      background: "rgba(52, 211, 153, 0.15)",
      borderRadius: "100px",
      border: "1px solid rgba(52, 211, 153, 0.25)",
    },
    liveDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#34D399",
      animation: "mapPulse 1.5s infinite",
    },
    liveText: {
      color: "#34D399",
      fontSize: "11px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
  };

  return (
    <AnimatePresence>
      {/* Backdrop for theater/fullscreen mode */}
      {isFullView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            if (!isBrowserFullscreen) setIsTheaterMode(false);
          }}
          style={styles.backdrop}
        />
      )}

      {/* Main Panel */}
      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          width: isFullView ? "min(1000px, 90vw)" : `${compactWidth}px`,
          left: isFullView ? "50%" : `${position.x}px`,
          top: isFullView ? "50%" : `${position.y}px`,
          x: isFullView ? "-50%" : 0,
          y: isFullView ? "-50%" : 0,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        onMouseMove={keepControlsVisible}
        onMouseEnter={keepControlsVisible}
        style={styles.panel}
        role="dialog"
        aria-label={`Map viewer: ${activeMap.title || "Location"}`}
      >
        {/* Header */}
        <div style={styles.header}>
          {/* Drag Handle (desktop only) */}
          {!isMobile && !isFullView && (
            <ControlButton
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              title="Drag to move"
              isDragging={isDragging}
            >
              <FiMove size={15} />
            </ControlButton>
          )}

          {/* Title */}
          <div style={styles.titleContainer}>
            <div style={styles.mapIcon}>
              <FiMapPin size={16} color="#34D399" />
            </div>
            <span style={styles.titleText}>
              {activeMap.title || "Live Map"}
            </span>
          </div>

          {/* Header Controls */}
          <div style={styles.controls}>
            {!isFullView && (
              <ControlButton
                onClick={() => setIsExpanded((v) => !v)}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <FiMinus size={16} /> : <FiMaximize2 size={16} />}
              </ControlButton>
            )}
            {isExpanded && !isFullView && (
              <ControlButton
                onClick={() => setIsTheaterMode(true)}
                title="Theater mode"
                variant="accent"
              >
                <FiMaximize size={16} />
              </ControlButton>
            )}
            <ControlButton
              onClick={handleClose}
              title="Close"
              variant="danger"
            >
              <FiX size={16} />
            </ControlButton>
          </div>
        </div>

        {/* Map Content */}
        {isActuallyExpanded && (
          <div style={styles.mapContainer}>
            {/* Loading State */}
            {isLoading && <MapSkeleton />}

            {/* Iframe */}
            <iframe
              title={activeMap.title || "Map"}
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              style={styles.iframe}
              onLoad={handleIframeLoad}
            />

            {/* Overlay Controls */}
            <div style={styles.overlayControls}>
              <ControlButton
                href={openUrl}
                title="Open in Google Maps"
              >
                <FiExternalLink size={15} />
              </ControlButton>
              <ControlButton
                onClick={handleToggleFullscreen}
                title={isBrowserFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isBrowserFullscreen ? (
                  <FiMinimize2 size={16} />
                ) : (
                  <FiMaximize size={16} />
                )}
              </ControlButton>
              {isFullView && (
                <ControlButton
                  onClick={() => {
                    if (isBrowserFullscreen && document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                    setIsTheaterMode(false);
                  }}
                  title="Exit theater mode"
                >
                  <FiMinimize2 size={16} />
                </ControlButton>
              )}
              <ControlButton
                onClick={handleClose}
                title="Close"
                variant="danger"
              >
                <FiX size={16} />
              </ControlButton>
            </div>

            {/* Status Bar (compact mode only) */}
            {!isFullView && (
              <div style={styles.statusBar}>
                <div style={styles.liveBadge}>
                  <span style={styles.liveDot} />
                  <span style={styles.liveText}>Live</span>
                </div>
                <span style={styles.statusText}>
                  {isMobile ? "Tap to interact" : "Drag header to reposition"}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PersistentMapViewer;