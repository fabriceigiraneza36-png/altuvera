import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import { toGoogleMapEmbedUrl, toGoogleMapOpenUrl } from "../../utils/mediaEmbed";

const FLOAT_MARGIN = 12;

const controlButtonStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(15,23,42,0.55)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const getPanelSize = (isExpanded) => {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const width = isExpanded
    ? Math.min(500, Math.max(320, viewportWidth - FLOAT_MARGIN * 2))
    : Math.min(340, Math.max(260, viewportWidth - FLOAT_MARGIN * 2));
  const mediaHeight = isExpanded ? Math.round((width * 9) / 16) : 0;
  return { width, height: 58 + mediaHeight };
};

const clampPosition = (position, isExpanded) => {
  if (typeof window === "undefined") return position;
  const { width, height } = getPanelSize(isExpanded);
  return {
    x: Math.min(
      Math.max(FLOAT_MARGIN, position.x),
      Math.max(FLOAT_MARGIN, window.innerWidth - width - FLOAT_MARGIN),
    ),
    y: Math.min(
      Math.max(FLOAT_MARGIN, position.y),
      Math.max(FLOAT_MARGIN, window.innerHeight - height - FLOAT_MARGIN),
    ),
  };
};

const getDefaultPosition = (isExpanded) => {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  const { width, height } = getPanelSize(isExpanded);
  return {
    x: Math.max(FLOAT_MARGIN, window.innerWidth - width - 24),
    y: Math.max(FLOAT_MARGIN, window.innerHeight - height - 24),
  };
};

const PersistentMapViewer = () => {
  const { isMapViewerOpen, activeMap, closeMap } = useApp();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [position, setPosition] = useState(() => getDefaultPosition(true));
  const [isDragging, setIsDragging] = useState(false);

  const frameRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const embedUrl = useMemo(() => {
    if (!activeMap) return "";
    return toGoogleMapEmbedUrl(activeMap);
  }, [activeMap]);

  const openUrl = useMemo(() => {
    if (!activeMap) return "";
    return toGoogleMapOpenUrl(activeMap);
  }, [activeMap]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);
      setIsBrowserFullscreen(isFullscreen);
      if (!isFullscreen) setControlsVisible(true);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => clampPosition(prev, isExpanded));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isExpanded]);

  useEffect(() => {
    setPosition((prev) => clampPosition(prev, isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    if (!isDragging) return undefined;

    const onMove = (event) => {
      const point = "touches" in event ? event.touches[0] : event;
      if (!point) return;
      setPosition(
        clampPosition(
          {
            x: dragRef.current.originX + point.clientX - dragRef.current.startX,
            y: dragRef.current.originY + point.clientY - dragRef.current.startY,
          },
          isExpanded,
        ),
      );
    };

    const onEnd = () => {
      setIsDragging(false);
    };

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
  }, [isDragging, isExpanded]);

  const keepControlsVisible = () => {
    if (!isTheaterMode && !isBrowserFullscreen) return;
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 1700);
  };

  const startDrag = (event) => {
    if (isTheaterMode || isBrowserFullscreen) return;
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
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && frameRef.current) {
        await frameRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Browser may block fullscreen without a trusted gesture.
    }
  };

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsDragging(false);
    setIsTheaterMode(false);
    closeMap();
  };

  if (!isMapViewerOpen || !activeMap || !embedUrl) return null;

  const showOverlayControls = controlsVisible || (!isTheaterMode && !isBrowserFullscreen);
  const compactWidth = getPanelSize(isExpanded).width;

  return (
    <AnimatePresence>
      {(isTheaterMode || isBrowserFullscreen) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isBrowserFullscreen) setIsTheaterMode(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(15,23,42,0.84) 0%, rgba(2,6,23,0.97) 100%)",
            backdropFilter: "blur(12px)",
            zIndex: 9998,
          }}
        />
      )}

      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: 1,
          scale: 1,
          width: isTheaterMode || isBrowserFullscreen ? "min(1460px, 96vw)" : `${compactWidth}px`,
          left: isTheaterMode || isBrowserFullscreen ? "50%" : `${position.x}px`,
          top: isTheaterMode || isBrowserFullscreen ? "50%" : `${position.y}px`,
          transform: isTheaterMode || isBrowserFullscreen ? "translate(-50%, -50%)" : "translate(0%, 0%)",
        }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onMouseMove={keepControlsVisible}
        onMouseEnter={keepControlsVisible}
        style={{
          position: "fixed",
          zIndex: 9999,
          overflow: "hidden",
          borderRadius: isTheaterMode || isBrowserFullscreen ? "20px" : "24px",
          background: "rgba(15,23,42,0.82)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 26px 60px rgba(0,0,0,0.55)",
          backdropFilter: "blur(20px)",
        }}
      >
        {!isTheaterMode && !isBrowserFullscreen && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              style={{
                ...controlButtonStyle,
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
              title="Drag mini view"
            >
              <FiMove size={14} />
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: 0,
                flex: 1,
              }}
            >
              <FiMapPin size={14} color="#34D399" />
              <span
                style={{
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.9px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeMap.title || "Live Map"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsExpanded((value) => !value)}
                style={controlButtonStyle}
                title={isExpanded ? "Mini view" : "Expand"}
              >
                {isExpanded ? <FiMinus size={16} /> : <FiMaximize2 size={16} />}
              </button>
              {isExpanded && (
                <button
                  onClick={() => setIsTheaterMode(true)}
                  style={controlButtonStyle}
                  title="Theater mode"
                >
                  <FiMaximize size={16} />
                </button>
              )}
              <button
                onClick={handleClose}
                style={{ ...controlButtonStyle, color: "#FCA5A5" }}
                title="Close"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            position: "relative",
            display: isExpanded || isTheaterMode || isBrowserFullscreen ? "block" : "none",
          }}
        >
          <div style={{ width: "100%", aspectRatio: "16 / 9", background: "#020617" }}>
            <iframe
              title={activeMap.title || "Map"}
              src={embedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>

          {showOverlayControls && (
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                display: "flex",
                gap: "8px",
              }}
            >
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...controlButtonStyle,
                  textDecoration: "none",
                }}
                title="Open in Google Maps"
              >
                <FiExternalLink size={15} />
              </a>
              <button
                onClick={handleToggleFullscreen}
                style={controlButtonStyle}
                title={isBrowserFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isBrowserFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize size={16} />}
              </button>
              {(isTheaterMode || isBrowserFullscreen) && (
                <button
                  onClick={() => {
                    if (isBrowserFullscreen && document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                    setIsTheaterMode(false);
                  }}
                  style={controlButtonStyle}
                  title="Exit theater mode"
                >
                  <FiMinimize2 size={16} />
                </button>
              )}
              <button
                onClick={handleClose}
                style={{ ...controlButtonStyle, color: "#FCA5A5" }}
                title="Close"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {showOverlayControls && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "12px 14px",
                background:
                  "linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.82) 50%, rgba(2,6,23,0.96) 100%)",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {activeMap.title || "Live Map"} - drag handle to move - mini view and fullscreen available.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersistentMapViewer;
