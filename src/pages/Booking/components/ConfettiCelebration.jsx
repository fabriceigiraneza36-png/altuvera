// src/pages/Booking/components/ConfettiCelebration.jsx
import React, { useEffect, useRef } from "react";

const COLORS = [
  "#10b981", "#059669", "#34d399", "#6ee7b7",
  "#fbbf24", "#f59e0b", "#60a5fa", "#a78bfa",
];

const ConfettiCelebration = ({ active = false, duration = 5000 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const pieces = [];

    const spawn = () => {
      const el = document.createElement("div");
      const size = 6 + Math.random() * 10;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isRect = Math.random() > 0.5;
      el.style.cssText = `
        position:fixed;
        top:-20px;
        left:${Math.random() * 100}vw;
        width:${size}px;
        height:${isRect ? size * 2 : size}px;
        background:${color};
        border-radius:${isRect ? "2px" : "50%"};
        pointer-events:none;
        z-index:9999;
        animation:bk-confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 0.5}s forwards;
        opacity:1;
      `;
      container.appendChild(el);
      pieces.push(el);
      setTimeout(() => el.remove(), 6000);
    };

    let count = 0;
    const maxPieces = 140;
    const iv = setInterval(() => {
      if (count >= maxPieces) { clearInterval(iv); return; }
      spawn();
      count++;
    }, duration / maxPieces);

    return () => {
      clearInterval(iv);
      pieces.forEach((p) => p.remove());
    };
  }, [active, duration]);

  return <div ref={containerRef} aria-hidden="true" />;
};

export default ConfettiCelebration;