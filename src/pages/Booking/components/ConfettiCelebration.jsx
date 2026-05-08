import React, { memo, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { THEME } from "../BookingShared";

const ConfettiCelebration = memo(({ active, duration = 5000 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const colors = [
      THEME.primary,
      THEME.primaryLight,
      THEME.primaryLighter,
      THEME.success,
      THEME.white,
      "#A7F3D0",
      "#6EE7B7",
      "#D1FAE5",
    ];

    const particles = [];
    const startTime = performance.now();

    for (let burst = 0; burst < 10; burst++) {
      const burstDelay = burst * 180;
      const burstX = (0.15 + Math.random() * 0.7) * window.innerWidth;
      const burstY = Math.random() * window.innerHeight * 0.4;

      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 10 + Math.random() * 18;
        particles.push({
          x: burstX + (Math.random() - 0.5) * 80,
          y: burstY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 6,
          size: 4 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.25 + Math.random() * 0.35,
          friction: 0.985,
          opacity: 1,
          delay: burstDelay,
          shape: Math.random() > 0.5 ? "rect" : "circle",
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.04 + Math.random() * 0.08,
        });
      }
    }

    let rafId;
    const animate = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const elapsed = now - startTime;

      particles.forEach((p) => {
        if (elapsed < p.delay) return;

        const t = elapsed - p.delay;

        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx + Math.sin(p.wobble + t * p.wobbleSpeed) * 1.5;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (elapsed > duration * 0.65) {
          p.opacity -= 0.018;
        }

        if (p.opacity > 0 && p.y < window.innerHeight + 100) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
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
        }
      });

      if (elapsed < duration + 2000) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10000,
      }}
    />
  );
});

export default ConfettiCelebration;
