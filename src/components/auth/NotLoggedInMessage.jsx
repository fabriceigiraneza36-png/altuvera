// components/auth/NotLoggedInMessage.jsx
import React, { useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { FiUserX } from "react-icons/fi";

const SnowBubble = ({ delay, left, size }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 240, opacity: [0, 1, 0.3, 0] }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
      style={{
        position: "absolute",
        left,
        top: "-20px",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(34,197,94,0.22)",
        boxShadow: "0 0 10px rgba(34,197,94,0.3)",
        filter: "blur(0.3px)",
      }}
    />
  );
};

const NotLoggedInMessage = ({ isVisible, onClose }) => {
  const dragControls = useDragControls();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          drag={isMobile ? "y" : false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 80 }}
          dragElastic={0.25}
          onDragEnd={(e, info) => {
            if (info.offset.y > 80) {
              onClose?.();
            }
          }}
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            zIndex: 9999,
            width: "clamp(240px, 85vw, 340px)",
          }}
        >
          {/* Snow bubbles background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              borderRadius: "16px",
              pointerEvents: "none",
            }}
          >
            {[...Array(12)].map((_, i) => (
              <SnowBubble
                key={i}
                delay={i * 0.35}
                left={`${Math.random() * 100}%`}
                size={`${5 + Math.random() * 6}px`}
              />
            ))}
          </div>

          {/* Toast */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #ffffff 0%, #eafff1 60%, #dcfce7 100%)",
              border: "1px solid rgba(34,197,94,0.25)",
              boxShadow:
                "0 12px 28px rgba(0,0,0,0.12), 0 0 0 1px rgba(34,197,94,0.08)",
              backdropFilter: "blur(14px)",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #22c55e20, #16a34a20)",
                border: "1px solid rgba(34,197,94,0.3)",
                flexShrink: 0,
              }}
            >
              <FiUserX size={18} color="#16a34a" />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 700,
                  color: "#14532d",
                  lineHeight: "1.2",
                }}
              >
                Sign in required
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#166534",
                  opacity: 0.9,
                  marginTop: "2px",
                }}
              >
                You need to log in to continue.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotLoggedInMessage;