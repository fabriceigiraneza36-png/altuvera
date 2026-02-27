import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollTriggeredSlide } from "../../hooks/useScrollTriggeredSlide";

const ImageCycle = ({ images = [], interval = 5000, style = {}, className = "" }) => {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [index, setIndex] = useState(0);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const nextSlide = useCallback(() => {
    if (safeImages.length <= 1) return;
    setIndex((prev) => (prev + 1) % safeImages.length);
  }, [safeImages.length]);

  const containerRef = useScrollTriggeredSlide(nextSlide, 220);

  useEffect(() => {
    if (safeImages.length <= 1) return undefined;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [safeImages.length, interval, nextSlide]);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const nextIndex = (index + 1) % safeImages.length;
    const img = new Image();
    img.src = safeImages[nextIndex];
  }, [index, safeImages]);

  if (safeImages.length === 0) {
    return (
      <div
        className={className}
        ref={containerRef}
        style={{
          ...style,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(16,185,129,0.05) 100%)",
        }}
      />
    );
  }

  const currentImage = safeImages[index];

  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
        transform: "translateZ(0)",
      }}
      ref={containerRef}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImage}
          src={currentImage}
          alt="Travel inspiration"
          initial={{
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 1.06,
          }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 0.98,
          }}
          transition={{
            duration: prefersReducedMotion ? 0.3 : 1.1,
            ease: prefersReducedMotion ? "linear" : [0.22, 1, 0.36, 1],
          }}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            willChange: "opacity, transform",
            transform: "translateZ(0)",
          }}
        />
      </AnimatePresence>
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(5, 150, 105, 0.08) 0%, transparent 56%)",
            "radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.08) 0%, transparent 56%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          willChange: "background",
        }}
      />
    </div>
  );
};

export default ImageCycle;
