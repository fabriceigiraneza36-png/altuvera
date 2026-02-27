import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAirplay,
  FiMaximize,
  FiMaximize2,
  FiMinimize2,
  FiMinus,
  FiMove,
  FiRefreshCw,
  FiX,
  FiZap,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../context/AppContext";
import { toYouTubeEmbedUrl } from "../../utils/mediaEmbed";

const FLOAT_MARGIN = 12;

const btnStyle = {
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  color: "white",
  cursor: "pointer",
  width: "34px",
  height: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  transition: "all 0.2s ease",
};

const getPanelSize = (isExpanded) => {
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
  const width = isExpanded
    ? Math.min(500, Math.max(320, viewportWidth - FLOAT_MARGIN * 2))
    : Math.min(330, Math.max(260, viewportWidth - FLOAT_MARGIN * 2));
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

const PersistentVideoPlayer = () => {
  const { isPlayerOpen, activeVideoId, playerTitle, closePlayer, isMaster, playVideo } = useApp();

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
    if (!activeVideoId) return "";
    return toYouTubeEmbedUrl(activeVideoId, {
      autoplay: 1,
      mute: 0,
      rel: 0,
      modestbranding: 1,
      controls: 1,
      fs: 1,
      ivLoadPolicy: 3,
      ccLoadPolicy: 0,
      disablekb: 0,
    });
  }, [activeVideoId]);

  useEffect(() => {
    const onFullScreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsBrowserFullscreen(isFs);
      if (!isFs) setControlsVisible(true);
    };
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullScreenChange);
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

  if (!isPlayerOpen || !activeVideoId) return null;

  const handleTakeOver = () => {
    playVideo(activeVideoId, playerTitle);
  };

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
      // Browser can block fullscreen if not triggered by direct user action.
    }
  };

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsDragging(false);
    setIsTheaterMode(false);
    closePlayer();
  };

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
              "radial-gradient(circle at center, rgba(30, 41, 59, 0.85) 0%, rgba(2, 6, 23, 0.98) 100%)",
            backdropFilter: "blur(14px)",
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
        transition={{ type: "spring", stiffness: 290, damping: 30 }}
        onMouseMove={keepControlsVisible}
        onMouseEnter={keepControlsVisible}
        style={{
          position: "fixed",
          zIndex: 9999,
          background: "rgba(15, 23, 42, 0.76)",
          backdropFilter: "blur(24px)",
          borderRadius: isTheaterMode || isBrowserFullscreen ? "20px" : "24px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {!isTheaterMode && !isBrowserFullscreen && (
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <button
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              style={{
                ...btnStyle,
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
                gap: "10px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <FiZap size={14} style={{ color: isMaster ? "#10B981" : "#9ca3af" }} />
              <span
                style={{
                  fontSize: "12px",
                  color: "white",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                  letterSpacing: "0.9px",
                }}
              >
                {isMaster ? playerTitle || "Altuvera Story" : "Synced Playback"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                style={btnStyle}
                title={isExpanded ? "Mini view" : "Expand"}
              >
                {isExpanded ? <FiMinus size={15} /> : <FiMaximize2 size={15} />}
              </button>
              {isExpanded && (
                <button
                  onClick={() => setIsTheaterMode(true)}
                  style={btnStyle}
                  title="Theater mode"
                >
                  <FiMaximize size={15} />
                </button>
              )}
              <button onClick={handleClose} style={{ ...btnStyle, color: "#FCA5A5" }} title="Close">
                <FiX size={15} />
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
          {isMaster ? (
            <div style={{ width: "100%", aspectRatio: "16/9", background: "black" }}>
              <iframe
                src={embedUrl}
                title="Altuvera Story Player"
                style={{ width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.6)",
                gap: "20px",
                padding: "30px",
                textAlign: "center",
              }}
            >
              <FiAirplay size={48} style={{ color: "#10B981", opacity: 0.8 }} />
              <div>
                <div
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "16px",
                    marginBottom: "5px",
                  }}
                >
                  Synchronized Experience
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                  Playing in another open tab.
                </div>
              </div>
              <button
                onClick={handleTakeOver}
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "50px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 10px 20px rgba(5, 150, 105, 0.3)",
                }}
              >
                <FiRefreshCw size={14} /> Pull playback to this tab.
              </button>
            </div>
          )}

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
              <button
                onClick={handleToggleFullscreen}
                style={btnStyle}
                title={isBrowserFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isBrowserFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize size={16} />}
              </button>
              {(isTheaterMode || isBrowserFullscreen) && (
                <button
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                    setIsTheaterMode(false);
                  }}
                  style={btnStyle}
                  title="Exit theater mode"
                >
                  <FiMinimize2 size={16} />
                </button>
              )}
              <button onClick={handleClose} style={{ ...btnStyle, color: "#FCA5A5" }} title="Close">
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
                  "linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.84) 55%, rgba(2,6,23,0.96) 100%)",
                color: "rgba(255,255,255,0.92)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Hover to reveal controls - drag handle to move - mini view and fullscreen available.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PersistentVideoPlayer;
