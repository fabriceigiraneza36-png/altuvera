// src/pages/Booking/components/ConfettiCelebration.jsx
import React, { useEffect, useRef } from "react";

const COLORS = ["#059669", "#10B981", "#34D399", "#6EE7B7", "#FCD34D", "#F59E0B", "#FFFFFF"];

const rand = (min, max) => Math.random() * (max - min) + min;

const ConfettiCelebration = ({ active = false, duration = 5000 }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles
    particlesRef.current = Array.from({ length: 140 }, () => ({
      x: rand(0, canvas.width),
      y: rand(-canvas.height * 0.3, -10),
      size: rand(6, 14),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speedX: rand(-2, 2),
      speedY: rand(2.5, 6),
      rotation: rand(0, 360),
      rotationSpeed: rand(-4, 4),
      opacity: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    startRef.current = null;

    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.speedX += rand(-0.05, 0.05);
        p.opacity = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Reset particles that fall off screen
        if (p.y > canvas.height + 20) {
          p.y = rand(-50, -10);
          p.x = rand(0, canvas.width);
        }
      });

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default ConfettiCelebration;