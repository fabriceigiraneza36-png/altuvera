import React from "react";
import { motion } from "framer-motion";

export default function StairBackground({ totalSteps, currentStep }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true">

      {/* SVG stair steps */}
      <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice"
        className="absolute bottom-0 left-0 w-full h-full opacity-[0.04]">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepW  = 600 / totalSteps;
          const stepH  = 400 / totalSteps;
          const x      = i * stepW;
          const y      = 400 - (i + 1) * stepH;
          const filled = i <= currentStep;
          return (
            <rect key={i}
              x={x} y={y}
              width={stepW} height={(i + 1) * stepH}
              fill={filled ? "#059669" : "#d1fae5"}
              rx="4"
            />
          );
        })}
      </svg>

      {/* Animated blobs */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], x: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-48 -right-48 w-[520px] h-[520px]
                   rounded-full bg-emerald-200/20 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], x: [0, -15, 0] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute -bottom-40 -left-40 w-[420px] h-[420px]
                   rounded-full bg-green-200/15 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2
                   w-[300px] h-[300px] rounded-full
                   bg-emerald-100/30 blur-2xl"
      />

      {/* Dot grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.04,
      }} />
    </div>
  );
}