// src/pages/Booking/components/ResumeBanner.jsx
import React from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, ArrowRight } from "lucide-react";

const ResumeBanner = ({
  savedAt, step, stepLabel, onResume, onStartFresh, isMobile,
}) => {
  const timeAgo = savedAt ? (() => {
    const diff = Date.now() - savedAt;
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (days  > 0) return `${days} day${days  > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (mins  > 0) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    return "just now";
  })() : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",
        gap: 14,
        padding: "16px 22px",
        background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
        border: "1.5px solid #fcd34d",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(245,158,11,.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(245,158,11,.3)",
        }}>
          <Clock size={19} color="#fff" />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: "#92400e" }}>
            You have an unfinished booking
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#b45309" }}>
            {stepLabel && `Last on: ${stepLabel}`}
            {timeAgo && ` · Saved ${timeAgo}`}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onStartFresh}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px",
            background: "#fff", color: "#92400e",
            border: "1.5px solid #fcd34d",
            borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <RefreshCw size={14} />
          Start Fresh
        </button>
        <button
          type="button"
          onClick={onResume}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px",
            background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
            color: "#fff", border: "none",
            borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 3px 10px rgba(245,158,11,.3)",
          }}
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default ResumeBanner;